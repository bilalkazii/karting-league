-- ===========================================================================
-- Karting — Phase 5 Step 3: Seed demo data
-- ---------------------------------------------------------------------------
-- Seeds the identity + organization skeleton that mirrors the mock world in
-- src/lib/mock-data.ts (drivers, groups, memberships, teams). It does NOT
-- seed race / season content (rc_*, season_*, awards, records, events):
-- those are intentionally left for a later content-seed migration so the
-- write path / app flow can be exercised against a clean project first.
--
-- Deterministic mock-id -> uuid mapping
--   App mock ids (drv_1, grp_1, tm_1, ...) are mock-only. Persisted primary
--   keys are uuids derived from the mock id with a stable, name-based scheme
--   so any environment (and a future content seed) reproduces the same ids:
--
--     uuid = md5('karting-v1:' || kind || ':' || mock_id)::uuid
--
--   kinds (and the namespaces they address, see docs/phase-5-step-3.md):
--     'user'   -> auth.users.id            (also profiles.id, 1:1)
--     'driver' -> public.drivers.id
--     'group'  -> public.groups.id
--     'team'   -> public.teams.id
--
--   Id table (what your Supabase project will contain after this runs):
--     user:drv_2 -> 3afc2514-4246-0b07-1a12-259b088fd351  driver:drv_5 -> 72a88e50-a5b9-c30d-feac-1d0058a6b12e
--     user:drv_7 -> 529492ae-be4f-a0ff-1a0d-6782ab0b4e9b  driver:drv_4 -> efb2567b-b4ad-dc03-6733-15f5fa6f013c
--     user:drv_4 -> 23d43b64-a911-32de-2610-1d7352450cbb  driver:drv_8 -> 5d1ee05d-f1b5-82ae-e35c-1f29785aaa6d
--     user:drv_6 -> 71c937bd-d667-72d2-3de3-c8a11319fd1a  driver:drv_3 -> d00336dd-0455-09ba-4a3a-b40a33106091
--     user:drv_1 -> d2fe5fba-0512-ef33-2b95-ae8f0261ae76  driver:drv_1 -> 14ffa0d1-10b1-a576-2c37-22fde97c433c
--     user:drv_8 -> bb774484-2dd2-b1b2-9d71-2d541894854f  driver:drv_2 -> e6dac987-c394-27ff-eff9-ea39448cda00
--     user:drv_5 -> bf106f11-62a6-0d0a-348d-1dcd2521e943  driver:drv_7 -> 31b892ff-330a-bae7-4b13-45e42f74e1cc
--     user:drv_3 -> bc97d7a8-8838-d40f-df9b-cfe35cda3275  driver:drv_6 -> 402f6add-c808-ddcd-c986-34823a10bc2c
--     group:grp_1 -> f2797ede-2cc5-c877-25ac-fb46510e3cf0  team:tm_3 -> 7ebc78c9-9363-f6eb-8d61-79862aaeafd8
--     group:grp_2 -> 3499b71c-ad42-6c34-4962-0e36ed90ab54  team:tm_2 -> 2dda9741-8226-e51e-5e56-c9b3aa72fd83
--     team:tm_1 -> dd6dacfc-af18-d6cd-bc6a-7c45e1f36758
--
-- Demo account (created below)
--   email:     demo@karting.app
--   password:  karting-demo-2026   (demo only — change or disable for real use)
--   maps to mock driver drv_1 (Bilal Darji), admin of group grp_1.
--
-- Notes
--   * Runs as the migration role (table owner), which bypasses RLS, so the
--     membership/team data inserted here satisfies the Step 2 policies for
--     the group-membership reads used by the app.
--   * auth.users rows set email_confirmed_at so the GoTrue
--     on_auth_user_created trigger provisions auth.identities. On pre-2023
--     GoTrue instances the identity rows may need to be inserted manually.
-- ===========================================================================

begin;

-- pgcrypto is preinstalled on Supabase under the extensions schema. Calls are
-- schema-qualified (extensions.crypt / extensions.gen_salt) because the CLI
-- migration runner's search_path does not always include `extensions`.
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Deterministic id helper (dropped at the end of this migration)
-- ---------------------------------------------------------------------------
create or replace function public.karting_seed_uuid(p_kind text, p_mock_id text)
returns uuid
language sql
immutable
as $$
  select md5('karting-v1:' || p_kind || ':' || p_mock_id)::uuid
$$;

-- ---------------------------------------------------------------------------
-- 1) auth.users (1 per driver; only drv_1 has a documented password)
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', public.karting_seed_uuid('user', 'drv_1'), 'authenticated', 'authenticated', 'demo@karting.app', extensions.crypt('karting-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', public.karting_seed_uuid('user', 'drv_2'), 'authenticated', 'authenticated', 'drv2@karting.app',       extensions.crypt('not-used', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', public.karting_seed_uuid('user', 'drv_3'), 'authenticated', 'authenticated', 'drv3@karting.app',       extensions.crypt('not-used', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', public.karting_seed_uuid('user', 'drv_4'), 'authenticated', 'authenticated', 'drv4@karting.app',       extensions.crypt('not-used', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', public.karting_seed_uuid('user', 'drv_5'), 'authenticated', 'authenticated', 'drv5@karting.app',       extensions.crypt('not-used', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', public.karting_seed_uuid('user', 'drv_6'), 'authenticated', 'authenticated', 'drv6@karting.app',       extensions.crypt('not-used', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', public.karting_seed_uuid('user', 'drv_7'), 'authenticated', 'authenticated', 'drv7@karting.app',       extensions.crypt('not-used', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', public.karting_seed_uuid('user', 'drv_8'), 'authenticated', 'authenticated', 'drv8@karting.app',       extensions.crypt('not-used', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2) profiles (1:1 with auth.users; profile.full_name maps to Driver.name)
-- ---------------------------------------------------------------------------
insert into public.profiles (id, full_name, created_at, updated_at)
values
  (public.karting_seed_uuid('user', 'drv_1'), 'Bilal Darji',   '2024-06-15'::timestamptz, '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('user', 'drv_2'), 'Ahmad Rehman',  '2024-06-15'::timestamptz, '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('user', 'drv_3'), 'Umar Khan',     '2024-07-01'::timestamptz, '2024-07-01'::timestamptz),
  (public.karting_seed_uuid('user', 'drv_4'), 'Arjun Mehta',   '2025-03-10'::timestamptz, '2025-03-10'::timestamptz),
  (public.karting_seed_uuid('user', 'drv_5'), 'Zain Farooqi',  '2024-06-15'::timestamptz, '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('user', 'drv_6'), 'Haider Ali',    '2024-09-20'::timestamptz, '2024-09-20'::timestamptz),
  (public.karting_seed_uuid('user', 'drv_7'), 'Daniyal Shah',  '2024-08-01'::timestamptz, '2024-08-01'::timestamptz),
  (public.karting_seed_uuid('user', 'drv_8'), 'Omar Tanveer',  '2025-02-14'::timestamptz, '2025-02-14'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3) drivers (racing identity; rating + avatar palette from mock helpers)
--    stats/badges/recentForm are derived and NOT stored (Step 1 decision).
-- ---------------------------------------------------------------------------
insert into public.drivers (id, profile_id, nickname, racing_number, avatar_color, avatar_text_color, rating, created_at, updated_at)
values
  (public.karting_seed_uuid('driver', 'drv_1'), public.karting_seed_uuid('user', 'drv_1'), 'BD', 7,  '#d5a182', '#29150c', 1842, '2024-06-15'::timestamptz, '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('driver', 'drv_2'), public.karting_seed_uuid('user', 'drv_2'), 'AR', 14, '#7994b3', '#1a2634', 1756, '2024-06-15'::timestamptz, '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('driver', 'drv_3'), public.karting_seed_uuid('user', 'drv_3'), 'UK', 3,  '#8c6a52', '#ffffff', 1634, '2024-07-01'::timestamptz, '2024-07-01'::timestamptz),
  (public.karting_seed_uuid('driver', 'drv_4'), public.karting_seed_uuid('user', 'drv_4'), 'AJ', 22, '#645c86', '#ffffff', 1498, '2025-03-10'::timestamptz, '2025-03-10'::timestamptz),
  (public.karting_seed_uuid('driver', 'drv_5'), public.karting_seed_uuid('user', 'drv_5'), 'ZF', 9,  '#5b8a72', '#ffffff', 1801, '2024-06-15'::timestamptz, '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('driver', 'drv_6'), public.karting_seed_uuid('user', 'drv_6'), 'HA', 11, '#b88a68', '#1a1006', 1312, '2024-09-20'::timestamptz, '2024-09-20'::timestamptz),
  (public.karting_seed_uuid('driver', 'drv_7'), public.karting_seed_uuid('user', 'drv_7'), 'DS', 5,  '#435e6e', '#ffffff', 1690, '2024-08-01'::timestamptz, '2024-08-01'::timestamptz),
  (public.karting_seed_uuid('driver', 'drv_8'), public.karting_seed_uuid('user', 'drv_8'), 'OT', 19, '#a67c52', '#1a1006', 1555, '2025-02-14'::timestamptz, '2025-02-14'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4) groups (privacy is 'private' only; grp_2 created by drv_5)
-- ---------------------------------------------------------------------------
insert into public.groups (id, name, description, logo_initials, logo_color, logo_text_color, cover_color, privacy, created_by, created_at, updated_at)
values
  (public.karting_seed_uuid('group', 'grp_1'), 'Karting Crew', 'The original weekend warriors. We race hard, laugh louder, and argue about penalties over chai.', 'KC', '#b3232d', '#ffffff', '#1a0a0c', 'private', public.karting_seed_uuid('driver', 'drv_1'), '2024-06-15'::timestamptz, '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_2'), 'Weekend Racers', 'Sunday morning karting for those who sleep through Saturday alarms.', 'WR', '#32556b', '#ffffff', '#0b161f', 'private', public.karting_seed_uuid('driver', 'drv_5'), '2025-01-10'::timestamptz, '2025-01-10'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 5) group_members (role/availability/joined_at mirrored from mock helpers)
--    teamId is intentionally NOT stored here — team membership is canonical
--    in team_members only (Step 1 decision).
-- ---------------------------------------------------------------------------
insert into public.group_members (group_id, driver_id, role, availability, joined_at)
values
  (public.karting_seed_uuid('group', 'grp_1'), public.karting_seed_uuid('driver', 'drv_1'), 'admin',         'available',     '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_1'), public.karting_seed_uuid('driver', 'drv_2'), 'organizer',     'available',     '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_1'), public.karting_seed_uuid('driver', 'drv_3'), 'member',        'maybe',         '2024-07-01'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_1'), public.karting_seed_uuid('driver', 'drv_4'), 'member',        'available',     '2025-03-10'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_1'), public.karting_seed_uuid('driver', 'drv_5'), 'admin',         'available',     '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_1'), public.karting_seed_uuid('driver', 'drv_6'), 'member',        'not-available', '2024-09-20'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_1'), public.karting_seed_uuid('driver', 'drv_7'), 'member',        'available',     '2024-08-01'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_1'), public.karting_seed_uuid('driver', 'drv_8'), 'member',        'maybe',         '2025-02-14'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_2'), public.karting_seed_uuid('driver', 'drv_5'), 'admin',         'available',     '2025-01-10'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_2'), public.karting_seed_uuid('driver', 'drv_7'), 'organizer',     'available',     '2025-01-12'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_2'), public.karting_seed_uuid('driver', 'drv_3'), 'member',        'available',     '2025-01-15'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_2'), public.karting_seed_uuid('driver', 'drv_6'), 'member',        'maybe',         '2025-02-01'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_2'), public.karting_seed_uuid('driver', 'drv_8'), 'member',        'available',     '2025-03-01'::timestamptz),
  (public.karting_seed_uuid('group', 'grp_2'), public.karting_seed_uuid('driver', 'drv_1'), 'member',        'not-available', '2025-04-20'::timestamptz)
on conflict (group_id, driver_id) do nothing;

-- ---------------------------------------------------------------------------
-- 6) teams + team_members (membership mirrors mock Teams.memberIds)
-- ---------------------------------------------------------------------------
insert into public.teams (id, group_id, name, logo_initials, logo_color, logo_text_color, created_at)
values
  (public.karting_seed_uuid('team', 'tm_1'), public.karting_seed_uuid('group', 'grp_1'), 'Apex Racing',     'AR', '#c43c2d', '#ffffff', '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('team', 'tm_2'), public.karting_seed_uuid('group', 'grp_1'), 'Redline Karting',  'RK', '#2d6bc4', '#ffffff', '2024-07-01'::timestamptz),
  (public.karting_seed_uuid('team', 'tm_3'), public.karting_seed_uuid('group', 'grp_1'), 'Velocity Squad',   'VS', '#2d9c6f', '#ffffff', '2024-08-01'::timestamptz)
on conflict (id) do nothing;

insert into public.team_members (team_id, driver_id, joined_at)
values
  (public.karting_seed_uuid('team', 'tm_1'), public.karting_seed_uuid('driver', 'drv_1'), '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('team', 'tm_1'), public.karting_seed_uuid('driver', 'drv_2'), '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('team', 'tm_1'), public.karting_seed_uuid('driver', 'drv_4'), '2025-03-10'::timestamptz),
  (public.karting_seed_uuid('team', 'tm_2'), public.karting_seed_uuid('driver', 'drv_3'), '2024-07-01'::timestamptz),
  (public.karting_seed_uuid('team', 'tm_2'), public.karting_seed_uuid('driver', 'drv_6'), '2024-09-20'::timestamptz),
  (public.karting_seed_uuid('team', 'tm_3'), public.karting_seed_uuid('driver', 'drv_5'), '2024-06-15'::timestamptz),
  (public.karting_seed_uuid('team', 'tm_3'), public.karting_seed_uuid('driver', 'drv_7'), '2024-08-01'::timestamptz)
on conflict (team_id, driver_id) do nothing;

-- ---------------------------------------------------------------------------
-- 7) Cleanup: the id helper is seed infrastructure, not part of the schema.
--    Future content seeds can re-derive the same ids by recomputing
--    md5('karting-v1:' || kind || ':' || mock_id)::uuid.
-- ---------------------------------------------------------------------------
drop function if exists public.karting_seed_uuid(text, text);

commit;