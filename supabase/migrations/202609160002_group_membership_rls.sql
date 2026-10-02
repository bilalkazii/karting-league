-- ===========================================================================
-- Karting — Phase 5 Step 2: Group-membership RLS
-- ---------------------------------------------------------------------------
-- Reviewed access model (applies on top of migration 202609160001, which
-- enabled RLS with zero policies => deny-by-default until this runs).
--
-- Ownership model
--   * auth.users -> profiles (1:1) -> drivers (1:1). Human identity flows
--     from the Supabase JWT; every permission root is auth.uid().
--   * group_members links a driver to a group with role
--     admin | organizer | member. Group is the security boundary.
--   * Reads: users may read a resource only if they are a member of the
--     owning group (deny-by-default otherwise).
--   * Writes: admin OR organizer manages the owning group's resources.
--     Members may only write their own rows (group_members.availability,
--     race_entries self sign-up/ready/notes, own driver/profile).
--   * Self-join to a group is allowed via group_members insert when
--     driver_id = current_driver_id(); group creation is open to any
--     authenticated user (they become created_by).
--   * race_events is an audit log: select + insert by managers, no
--     update/delete policies.
--
-- Recursion note: group-scope checks run inside SECURITY DEFINER functions
-- (owner = migration runner), which bypass RLS, so policies on group_members
-- never recurse. search_path is pinned to public to prevent hijacking.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- Driver id for the caller (via profiles -> drivers). Null when no profile
-- or no driver row yet.
create or replace function public.current_driver_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select d.id
  from public.drivers d
  join public.profiles p on p.id = d.profile_id
  where p.id = auth.uid()
$$;

-- Role of the caller inside a group, or null when not a member.
create or replace function public.group_role(p_group_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select gm.role
  from public.group_members gm
  where gm.group_id = p_group_id
    and gm.driver_id = public.current_driver_id()
$$;

-- True when the caller is an admin or organizer of the group.
create or replace function public.can_manage_group(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.group_role(p_group_id) in ('admin', 'organizer')
$$;

-- Cross-resource scope helpers: resolve the owning group of a subresource
-- and project is_group_member / can_manage_group onto it.
create or replace function public.race_group_member(p_race_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.group_role(r.group_id) is not null
  from public.races r
  where r.id = p_race_id
$$;

create or replace function public.race_group_manage(p_race_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.can_manage_group(r.group_id)
  from public.races r
  where r.id = p_race_id
$$;

create or replace function public.season_group_member(p_season_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.group_role(s.group_id) is not null
  from public.seasons s
  where s.id = p_season_id
$$;

create or replace function public.season_group_manage(p_season_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.can_manage_group(s.group_id)
  from public.seasons s
  where s.id = p_season_id
$$;

create or replace function public.team_group_member(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.group_role(t.group_id) is not null
  from public.teams t
  where t.id = p_team_id
$$;

create or replace function public.team_group_manage(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.can_manage_group(t.group_id)
  from public.teams t
  where t.id = p_team_id
$$;

-- Explode the default execute grant: helpers are only for authenticated users.
do $$
declare
  fn name;
begin
  foreach fn in array array[
    'public.current_driver_id()',
    'public.group_role(uuid)',
    'public.can_manage_group(uuid)',
    'public.race_group_member(uuid)',
    'public.race_group_manage(uuid)',
    'public.season_group_member(uuid)',
    'public.season_group_manage(uuid)',
    'public.team_group_member(uuid)',
    'public.team_group_manage(uuid)'
  ] loop
    execute format('revoke all on function %s from public', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- profiles (own only)
-- ---------------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- drivers (visible to any authenticated user; only self-writes)
-- ---------------------------------------------------------------------------
create policy "drivers_select_authenticated" on public.drivers
  for select using (auth.role() = 'authenticated');
create policy "drivers_insert_own" on public.drivers
  for insert with check (profile_id = auth.uid());
create policy "drivers_update_own" on public.drivers
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
create policy "groups_select_member" on public.groups
  for select using (public.group_role(id) is not null);
create policy "groups_insert_authenticated" on public.groups
  for insert with check (auth.role() = 'authenticated');
create policy "groups_update_manage" on public.groups
  for update using (public.can_manage_group(id)) with check (public.can_manage_group(id));
create policy "groups_delete_manage" on public.groups
  for delete using (public.can_manage_group(id));

-- ---------------------------------------------------------------------------
-- group_members
-- ---------------------------------------------------------------------------
create policy "group_members_select_member" on public.group_members
  for select using (public.group_role(group_id) is not null);
create policy "group_members_insert_manage_or_self" on public.group_members
  for insert with check (
    public.can_manage_group(group_id) or driver_id = public.current_driver_id()
  );
create policy "group_members_update_manage_or_self" on public.group_members
  for update using (
    public.can_manage_group(group_id) or driver_id = public.current_driver_id()
  ) with check (
    public.can_manage_group(group_id) or driver_id = public.current_driver_id()
  );
create policy "group_members_delete_manage" on public.group_members
  for delete using (public.can_manage_group(group_id));

-- ---------------------------------------------------------------------------
-- teams + team_members
-- ---------------------------------------------------------------------------
create policy "teams_select_member" on public.teams
  for select using (public.team_group_member(id));
create policy "teams_insert_manage" on public.teams
  for insert with check (public.team_group_manage(id));
create policy "teams_update_manage" on public.teams
  for update using (public.team_group_manage(id)) with check (public.team_group_manage(id));
create policy "teams_delete_manage" on public.teams
  for delete using (public.team_group_manage(id));

create policy "team_members_select_member" on public.team_members
  for select using (public.team_group_member(team_id));
create policy "team_members_insert_manage" on public.team_members
  for insert with check (public.team_group_manage(team_id));
create policy "team_members_update_manage" on public.team_members
  for update using (public.team_group_manage(team_id)) with check (public.team_group_manage(team_id));
create policy "team_members_delete_manage" on public.team_members
  for delete using (public.team_group_manage(team_id));

-- ---------------------------------------------------------------------------
-- races
-- ---------------------------------------------------------------------------
create policy "races_select_member" on public.races
  for select using (public.race_group_member(id));
create policy "races_insert_manage" on public.races
  for insert with check (public.race_group_manage(id));
create policy "races_update_manage" on public.races
  for update using (public.race_group_manage(id)) with check (public.race_group_manage(id));
create policy "races_delete_manage" on public.races
  for delete using (public.race_group_manage(id));

-- ---------------------------------------------------------------------------
-- race_entries (self sign-up/ready/notes for the driver)
-- ---------------------------------------------------------------------------
create policy "race_entries_select_member" on public.race_entries
  for select using (public.race_group_member(race_id));
create policy "race_entries_insert_manage_or_self" on public.race_entries
  for insert with check (
    public.race_group_manage(race_id) or driver_id = public.current_driver_id()
  );
create policy "race_entries_update_manage_or_self" on public.race_entries
  for update using (
    public.race_group_manage(race_id) or driver_id = public.current_driver_id()
  ) with check (
    public.race_group_manage(race_id) or driver_id = public.current_driver_id()
  );
create policy "race_entries_delete_manage" on public.race_entries
  for delete using (public.race_group_manage(race_id));

-- ---------------------------------------------------------------------------
-- qualifying_attempts (session log; manager-only writes)
-- ---------------------------------------------------------------------------
create policy "qualifying_attempts_select_member" on public.qualifying_attempts
  for select using (public.race_group_member(race_id));
create policy "qualifying_attempts_insert_manage" on public.qualifying_attempts
  for insert with check (public.race_group_manage(race_id));
create policy "qualifying_attempts_update_manage" on public.qualifying_attempts
  for update using (public.race_group_manage(race_id)) with check (public.race_group_manage(race_id));
create policy "qualifying_attempts_delete_manage" on public.qualifying_attempts
  for delete using (public.race_group_manage(race_id));

-- ---------------------------------------------------------------------------
-- race_penalties (manager writes; status changes allowed)
-- ---------------------------------------------------------------------------
create policy "race_penalties_select_member" on public.race_penalties
  for select using (public.race_group_member(race_id));
create policy "race_penalties_insert_manage" on public.race_penalties
  for insert with check (public.race_group_manage(race_id));
create policy "race_penalties_update_manage" on public.race_penalties
  for update using (public.race_group_manage(race_id)) with check (public.race_group_manage(race_id));
create policy "race_penalties_delete_manage" on public.race_penalties
  for delete using (public.race_group_manage(race_id));

-- ---------------------------------------------------------------------------
-- race_events (audit log: no update/delete)
-- ---------------------------------------------------------------------------
create policy "race_events_select_member" on public.race_events
  for select using (public.race_group_member(race_id));
create policy "race_events_insert_manage" on public.race_events
  for insert with check (public.race_group_manage(race_id));

-- ---------------------------------------------------------------------------
-- race_awards
-- ---------------------------------------------------------------------------
create policy "race_awards_select_member" on public.race_awards
  for select using (public.race_group_member(race_id));
create policy "race_awards_insert_manage" on public.race_awards
  for insert with check (public.race_group_manage(race_id));
create policy "race_awards_update_manage" on public.race_awards
  for update using (public.race_group_manage(race_id)) with check (public.race_group_manage(race_id));
create policy "race_awards_delete_manage" on public.race_awards
  for delete using (public.race_group_manage(race_id));

-- ---------------------------------------------------------------------------
-- seasons + season_races + scoring + awards + records
-- ---------------------------------------------------------------------------
create policy "seasons_select_member" on public.seasons
  for select using (public.season_group_member(id));
create policy "seasons_insert_manage" on public.seasons
  for insert with check (public.season_group_manage(id));
create policy "seasons_update_manage" on public.seasons
  for update using (public.season_group_manage(id)) with check (public.season_group_manage(id));
create policy "seasons_delete_manage" on public.seasons
  for delete using (public.season_group_manage(id));

create policy "season_races_select_member" on public.season_races
  for select using (public.season_group_member(season_id));
create policy "season_races_insert_manage" on public.season_races
  for insert with check (public.season_group_manage(season_id));
create policy "season_races_update_manage" on public.season_races
  for update using (public.season_group_manage(season_id)) with check (public.season_group_manage(season_id));
create policy "season_races_delete_manage" on public.season_races
  for delete using (public.season_group_manage(season_id));

create policy "season_scoring_select_member" on public.season_scoring
  for select using (public.season_group_member(season_id));
create policy "season_scoring_insert_manage" on public.season_scoring
  for insert with check (public.season_group_manage(season_id));
create policy "season_scoring_update_manage" on public.season_scoring
  for update using (public.season_group_manage(season_id)) with check (public.season_group_manage(season_id));
create policy "season_scoring_delete_manage" on public.season_scoring
  for delete using (public.season_group_manage(season_id));

create policy "scoring_points_select_member" on public.scoring_points
  for select using (public.season_group_member(season_id));
create policy "scoring_points_insert_manage" on public.scoring_points
  for insert with check (public.season_group_manage(season_id));
create policy "scoring_points_update_manage" on public.scoring_points
  for update using (public.season_group_manage(season_id)) with check (public.season_group_manage(season_id));
create policy "scoring_points_delete_manage" on public.scoring_points
  for delete using (public.season_group_manage(season_id));

create policy "awards_select_member" on public.awards
  for select using (public.season_group_member(season_id));
create policy "awards_insert_manage" on public.awards
  for insert with check (public.season_group_manage(season_id));
create policy "awards_update_manage" on public.awards
  for update using (public.season_group_manage(season_id)) with check (public.season_group_manage(season_id));
create policy "awards_delete_manage" on public.awards
  for delete using (public.season_group_manage(season_id));

create policy "season_records_select_member" on public.season_records
  for select using (public.season_group_member(season_id));
create policy "season_records_insert_manage" on public.season_records
  for insert with check (public.season_group_manage(season_id));
create policy "season_records_update_manage" on public.season_records
  for update using (public.season_group_manage(season_id)) with check (public.season_group_manage(season_id));
create policy "season_records_delete_manage" on public.season_records
  for delete using (public.season_group_manage(season_id));

commit;