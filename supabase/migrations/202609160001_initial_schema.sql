-- ===========================================================================
-- Karting — Phase 5 Step 1: Initial schema
-- ---------------------------------------------------------------------------
-- Scope: normalized persistence for the current product model. No RLS
-- policies in this migration; every table is created with row level
-- security ENABLED and zero policies, i.e. default-deny for non-owners.
-- The group-membership based policy set is introduced in a separate,
-- reviewed migration (see docs/phase-5-step-1.md "Future RLS model").
--
-- Conventions:
--   * columns are snake_case; domain (camelCase) types are documented in
--     src/types/database.ts and docs/phase-5-step-1.md
--   * primary keys are `uuid` (app mock ids like `drv_1` are mock-only)
--   * derived/view data (stats, badges, previews, results, standings,
--     team.memberIds, race.participatingDriverIds, season.raceIds) is NOT
--     stored; it is computed in the application layer.
--   * V1 timing is manual. Qualifying effective time lives on race_entries;
--     qualifying_attempts is the future session log and is not read by app
--     logic yet.
--   * Penalties are informational in V1 and never alter finishing order.
--     The purpose column on race_penalties reflects that.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User identity, 1:1 with auth.users. Maps to Driver.name in mock domain types.';

-- ---------------------------------------------------------------------------
-- Drivers (racing identity, 1:1 with profiles)
-- ---------------------------------------------------------------------------
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  nickname text,
  racing_number integer,
  avatar_color text not null default '#27272a',
  avatar_text_color text not null default '#ffffff',
  rating integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drivers_racing_number_range check (racing_number is null or racing_number between 1 and 999)
);

comment on table public.drivers is 'Racing identity. stats/badges/recentForm are derived and not stored.';

-- ---------------------------------------------------------------------------
-- Groups
-- ---------------------------------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  logo_initials text not null default '',
  logo_color text not null default '#e11d48',
  logo_text_color text not null default '#ffffff',
  cover_color text not null default '#27272a',
  privacy text not null default 'private' check (privacy in ('private')),
  created_by uuid references public.drivers (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.groups is 'Karting group. upcomingRace/recentResults/currentChampionship are derived and not stored.';

-- ---------------------------------------------------------------------------
-- Group members (canonical membership + role; drives future RLS)
-- ---------------------------------------------------------------------------
create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  driver_id uuid not null references public.drivers (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'organizer', 'member')),
  availability text not null default 'available' check (availability in ('available', 'maybe', 'not-available')),
  joined_at timestamptz not null default now(),
  primary key (group_id, driver_id)
);

comment on table public.group_members is 'Group membership. teamId from the domain GroupMember type is intentionally omitted: team membership is canonical in team_members only.';

-- ---------------------------------------------------------------------------
-- Teams + team membership
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  name text not null,
  logo_initials text not null default '',
  logo_color text not null default '#e11d48',
  logo_text_color text not null default '#ffffff',
  created_at timestamptz not null default now()
);

comment on table public.teams is 'Team. memberIds from the domain Team type is derived from team_members.';

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  driver_id uuid not null references public.drivers (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, driver_id)
);

-- ---------------------------------------------------------------------------
-- Races
-- ---------------------------------------------------------------------------
create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  name text not null,
  venue_name text not null,
  date date not null,
  start_time time not null,
  format text not null default 'sprint' check (format in ('sprint', 'feature', 'custom')),
  status text not null default 'draft' check (status in ('draft', 'lobby', 'qualifying', 'grid', 'racing', 'completed', 'cancelled')),
  organizer_id uuid not null references public.drivers (id),
  qualifying_lap_count integer not null default 1 check (qualifying_lap_count >= 1),
  rules text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.races is 'Race. participatingDriverIds is derived from race_entries.';

-- ---------------------------------------------------------------------------
-- Race entries (driver participation + live timing state + results)
-- ---------------------------------------------------------------------------
create table if not exists public.race_entries (
  race_id uuid not null references public.races (id) on delete cascade,
  driver_id uuid not null references public.drivers (id) on delete cascade,
  kart_number integer not null,
  status text not null default 'invited' check (status in ('invited', 'confirmed', 'declined', 'ready', 'racing', 'finished', 'dnf', 'dns', 'retired', 'withdrawn')),
  confirmed boolean not null default false,
  ready boolean not null default false,
  grid_position integer,
  grid_penalty_seconds integer not null default 0 check (grid_penalty_seconds >= 0),
  qualifying_time_ms integer,
  qualifying_status text not null default 'not_started' check (qualifying_status in ('not_started', 'running', 'completed', 'invalid', 'manually_corrected')),
  finish_position integer,
  penalty_total_seconds integer not null default 0 check (penalty_total_seconds >= 0),
  notes text not null default '',
  primary key (race_id, driver_id),
  constraint race_entries_finish_position_positive check (finish_position is null or finish_position >= 1),
  constraint race_entries_qualifying_time_non_negative check (qualifying_time_ms is null or qualifying_time_ms >= 0)
);

comment on table public.race_entries is 'Drivers per race. Carries both live timing state (grid, qualifying, ready) and final results (finish_position, status, notes). RaceResult has no separate table.';

-- ---------------------------------------------------------------------------
-- Qualifying attempts (future session log; NOT read by app logic in V1)
-- ---------------------------------------------------------------------------
create table if not exists public.qualifying_attempts (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references public.races (id) on delete cascade,
  driver_id uuid not null references public.drivers (id) on delete cascade,
  attempt_number integer not null default 1 check (attempt_number >= 1),
  time_ms integer,
  status text not null default 'not_started' check (status in ('not_started', 'running', 'completed', 'invalid', 'manually_corrected')),
  recorded_at timestamptz not null default now(),
  constraint qualifying_attempts_time_non_negative check (time_ms is null or time_ms >= 0)
);

comment on table public.qualifying_attempts is 'Recorded qualifying session attempts. In V1 the effective official time is race_entries.qualifying_time_ms; this table is empty/unused until multi-attempt qualifying arrives.';

-- ---------------------------------------------------------------------------
-- Race penalties (informational in V1; never alter finishing order)
-- ---------------------------------------------------------------------------
create table if not exists public.race_penalties (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references public.races (id) on delete cascade,
  driver_id uuid not null references public.drivers (id) on delete cascade,
  seconds integer not null default 0 check (seconds >= 0),
  reason text not null default '',
  issued_by uuid not null references public.drivers (id),
  status text not null default 'issued' check (status in ('issued', 'under_review', 'cancelled')),
  created_at timestamptz not null default now()
);

comment on table public.race_penalties is 'Penalty log. Informational only in V1; penaltyAdjustmentEnabled defaults to false and penalties never reorder finishes.';

-- ---------------------------------------------------------------------------
-- Race events (audit / timeline)
-- ---------------------------------------------------------------------------
create table if not exists public.race_events (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references public.races (id) on delete cascade,
  driver_id uuid references public.drivers (id) on delete set null,
  type text not null check (
    type in (
      'qualifying_start', 'qualifying_stop', 'qualifying_invalid',
      'qualifying_restore', 'qualifying_reset', 'qualifying_corrected',
      'qualifying_replace', 'qualifying_promoted', 'ready', 'not_ready',
      'race_start', 'race_finish', 'dnf', 'dns', 'retired', 'withdrawn',
      'penalty', 'penalty_cancelled', 'grid_change', 'grid_penalty',
      'complete', 'note', 'status_change'
    )
  ),
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

comment on table public.race_events is 'Race timeline. timestamp from the domain RaceEvent type is stored as occurred_at; metadata is stored as JSON payload.';

-- ---------------------------------------------------------------------------
-- Seasons
-- ---------------------------------------------------------------------------
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  constraint seasons_date_range check (start_date is null or end_date is null or start_date <= end_date)
);

comment on table public.seasons is 'Championship season. raceIds is derived from season_races.';

create table if not exists public.season_races (
  season_id uuid not null references public.seasons (id) on delete cascade,
  race_id uuid not null references public.races (id) on delete cascade,
  round_number integer not null check (round_number >= 1),
  primary key (season_id, race_id),
  unique (season_id, round_number)
);

comment on table public.season_races is 'Ordered race membership of a season; round_number preserves the raceIds array order.';

-- ---------------------------------------------------------------------------
-- Championship scoring (1:1 config + position -> points child table)
-- ---------------------------------------------------------------------------
create table if not exists public.season_scoring (
  season_id uuid primary key references public.seasons (id) on delete cascade,
  mode text not null default 'automatic' check (mode in ('automatic', 'custom')),
  pole_position_points integer not null default 0,
  fastest_lap_points integer not null default 0,
  participation_points integer not null default 0,
  dnf_points integer not null default 0,
  dns_points integer not null default 0,
  penalty_adjustment_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.season_scoring is '1:1 config for a season. pointsByPosition from ChampionshipScoring lives in scoring_points.';

create table if not exists public.scoring_points (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  position integer not null check (position >= 1),
  points integer not null,
  unique (season_id, position)
);

comment on table public.scoring_points is 'Points awarded per finishing position (ChampionshipScoring.pointsByPosition / ChampionshipPointsRule).';

-- ---------------------------------------------------------------------------
-- Awards, race awards, season records
-- ---------------------------------------------------------------------------
create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  type text not null check (
    type in (
      'winner', 'podium', 'pole', 'driver_of_race', 'most_improved',
      'cleanest_driver', 'championship_winner', 'team_champion',
      'most_wins', 'most_poles', 'most_podiums', 'cleanest_season',
      'participation'
    )
  ),
  label text not null,
  description text not null default '',
  driver_id uuid references public.drivers (id) on delete set null,
  team_id uuid references public.teams (id) on delete set null,
  race_id uuid references public.races (id) on delete set null,
  value text,
  created_at timestamptz not null default now()
);

create table if not exists public.race_awards (
  race_id uuid primary key references public.races (id) on delete cascade,
  driver_of_race_id uuid references public.drivers (id) on delete set null,
  most_improved_id uuid references public.drivers (id) on delete set null,
  cleanest_driver_id uuid references public.drivers (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.season_records (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  label text not null,
  value text not null,
  driver_id uuid references public.drivers (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (FK columns not already covered by a primary/unique constraint)
-- ---------------------------------------------------------------------------
create index if not exists idx_drivers_profile_id on public.drivers (profile_id);
create index if not exists idx_groups_created_by on public.groups (created_by);
create index if not exists idx_group_members_driver_id on public.group_members (driver_id);
create index if not exists idx_teams_group_id on public.teams (group_id);
create index if not exists idx_team_members_driver_id on public.team_members (driver_id);
create index if not exists idx_races_group_id on public.races (group_id);
create index if not exists idx_races_organizer_id on public.races (organizer_id);
create index if not exists idx_race_entries_driver_id on public.race_entries (driver_id);
create index if not exists idx_qualifying_attempts_race_id on public.qualifying_attempts (race_id);
create index if not exists idx_qualifying_attempts_driver_id on public.qualifying_attempts (driver_id);
create index if not exists idx_race_penalties_race_id on public.race_penalties (race_id);
create index if not exists idx_race_penalties_driver_id on public.race_penalties (driver_id);
create index if not exists idx_race_events_race_id on public.race_events (race_id);
create index if not exists idx_race_events_driver_id on public.race_events (driver_id);
create index if not exists idx_seasons_group_id on public.seasons (group_id);
create index if not exists idx_season_races_race_id on public.season_races (race_id);
create index if not exists idx_awards_season_id on public.awards (season_id);
create index if not exists idx_awards_driver_id on public.awards (driver_id);
create index if not exists idx_awards_team_id on public.awards (team_id);
create index if not exists idx_awards_race_id on public.awards (race_id);
create index if not exists idx_season_records_season_id on public.season_records (season_id);
create index if not exists idx_season_records_driver_id on public.season_records (driver_id);

-- ---------------------------------------------------------------------------
-- Row level security: enabled everywhere, zero policies for now.
-- Deny-by-default until the group-membership policy model is reviewed and
-- applied (docs/phase-5-step-1.md "Future RLS model").
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.races enable row level security;
alter table public.race_entries enable row level security;
alter table public.qualifying_attempts enable row level security;
alter table public.race_penalties enable row level security;
alter table public.race_events enable row level security;
alter table public.seasons enable row level security;
alter table public.season_races enable row level security;
alter table public.season_scoring enable row level security;
alter table public.scoring_points enable row level security;
alter table public.awards enable row level security;
alter table public.race_awards enable row level security;
alter table public.season_records enable row level security;

commit;