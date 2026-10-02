-- ===========================================================================
-- Phase 5 Step 3 — RLS verification SQL
-- ---------------------------------------------------------------------------
-- Run in the Supabase SQL Editor after migrations 1-3 have been applied.
-- Each block impersonates a specific user via request.jwt.claims and
-- verifies that RLS allows or denies as expected. All results are shown
-- inline as comments (expected value after each query).
--
-- Seeded identity (demo login):
--   email: demo@karting.app / karting-demo-2026
--   user:drv_1  (d2fe5fba-0512-ef33-2b95-ae8f0261ae76)
--   driver:drv_1 (14ffa0d1-10b1-a576-2c37-22fde97c433c)
--   admin of grp_1, member of grp_2
--
-- Attacker: drv_4 (Arjun, not a member of grp_2)
--   user:drv_4  (23d43b64-a911-32de-2610-1d7352450cbb)
--   driver:drv_4 (efb2567b-b4ad-dc03-6733-15f5fa6f013c)
--   member of grp_1 only
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Anon role (no session)
-- ---------------------------------------------------------------------------
set role to 'anon';

-- drivers: anon cannot read (RLS requires authenticated for drivers table)
select count(*) from public.drivers;
-- expected: 0 (RLS denies anon; table is auth-only)

-- profiles: anon cannot read (own-row policy; no auth.uid())
select count(*) from public.profiles;
-- expected: 0

-- groups: anon cannot read (group_role requires authenticated session)
select count(*) from public.groups;
-- expected: 0

reset role;

-- ---------------------------------------------------------------------------
-- Demo user (drv_1 — admin of grp_1, member of grp_2)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"d2fe5fba-0512-ef33-2b95-ae8f0261ae76","role":"authenticated"}',
  true);
set role to 'authenticated';

-- profiles: own row only
select count(*) from public.profiles;
-- expected: 1

select id, full_name from public.profiles where id = 'd2fe5fba-0512-ef33-2b95-ae8f0261ae76';
-- expected: 1 row (Bilal Darji)

-- drivers: all authenticated users visible
select count(*) from public.drivers;
-- expected: 8

-- groups: demo user is admin of grp_1 and member of grp_2
select count(*) from public.groups;
-- expected: 2

select id, name from public.groups order by name;
-- expected: Karting Crew (grp_1), Weekend Racers (grp_2)

-- group_members: visible for groups where user is a member
-- grp_1 has 8 members, grp_2 has 6 members → 14 total visible
select count(*) from public.group_members;
-- expected: 14

-- teams: visible when owning group is a membership
select count(*) from public.teams;
-- expected: 3 (tm_1, tm_2, tm_3 all in grp_1; user is admin of grp_1)

select id, name from public.teams order by name;
-- expected: Apex Racing, Redline Karting, Velocity Squad

-- team_members: visible for teams whose group is accessible
select count(*) from public.team_members;
-- expected: 7 (all three teams' members)

-- Self-update: demo user may update their own group_members availability
update public.group_members
set availability = 'available'
where group_id = 'f2797ede-2cc5-c877-25ac-fb46510e3cf0'   -- grp_1
  and driver_id  = '14ffa0d1-10b1-a576-2c37-22fde97c433c'; -- drv_1
-- expected: UPDATE 1 (allowed — self-update on own row)

-- Admin manage: demo user can update grp_1 (they are admin)
update public.groups
set description = description || ''
where id = 'f2797ede-2cc5-c877-25ac-fb46510e3cf0';
-- expected: UPDATE 1 (allowed — can_manage_group returns true for admin)

reset role;

-- ---------------------------------------------------------------------------
-- Attacker test (drv_4 — member of grp_1 only, NOT grp_2)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"23d43b64-a911-32de-2610-1d7352450cbb","role":"authenticated"}',
  true);
set role to 'authenticated';

-- grp_2 groups: drv_4 is not a member → should not appear
select count(*) from public.groups;
-- expected: 1 (grp_1 only)

select id, name from public.groups;
-- expected: 1 row — Karting Crew (grp_1)

-- grp_2 group_members: denied (not a member of grp_2)
select count(*) from public.group_members
where group_id = '3499b71c-ad42-6c34-4962-0e36ed90ab54'; -- grp_2
-- expected: 0

-- teams in grp_2: drv_4 is not a member of grp_2 → no teams visible
select count(*) from public.teams;
-- expected: 3 (tm_1..tm_3 all belong to grp_1; drv_4 IS a member of grp_1)
-- NOTE: if grp_2 had teams, the count would still be 3 (only grp_1 teams)

-- Self-join: drv_4 may insert themselves into grp_2 (self-join policy)
insert into public.group_members (group_id, driver_id, role, availability, joined_at)
values (
  '3499b71c-ad42-6c34-4962-0e36ed90ab54',  -- grp_2
  'efb2567b-b4ad-dc03-6733-15f5fa6f013c',  -- drv_4
  'member',
  'available',
  now()
);
-- expected: INSERT 1 (allowed — driver_id = current_driver_id())

-- Verify: drv_4 can now see grp_2 members
select count(*) from public.group_members
where group_id = '3499b71c-ad42-6c34-4962-0e36ed90ab54'; -- grp_2
-- expected: 7 (6 original + drv_4's self-join)

-- Cleanup: remove the self-joined test row
delete from public.group_members
where group_id = '3499b71c-ad42-6c34-4962-0e36ed90ab54'
  and driver_id = 'efb2567b-b4ad-dc03-6733-15f5fa6f013c';
-- expected: DELETE 1

-- drv_4 cannot manage grp_1 resources (role is member, not admin/organizer)
-- Create team in grp_1 should fail
insert into public.teams (id, group_id, name, logo_initials, logo_color, logo_text_color, created_at)
values (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'f2797ede-2cc5-c877-25ac-fb46510e3cf0', -- grp_1
  'Hacker Team',
  'HT',
  '#ff0000',
  '#ffffff',
  now()
);
-- expected: ERROR (new row violates row-level security policy "teams_insert_manage")
-- drv_4 is a member (not admin/organizer) of grp_1, so cannot create teams

-- drv_4 cannot update another member's availability in grp_1
update public.group_members
set availability = 'not-available'
where group_id = 'f2797ede-2cc5-c877-25ac-fb46510e3cf0'   -- grp_1
  and driver_id  = '14ffa0d1-10b1-a576-2c37-22fde97c433c'; -- drv_1 (Bilal)
-- expected: UPDATE 0 (denied — not admin/organizer, and driver_id != current_driver_id)

reset role;
