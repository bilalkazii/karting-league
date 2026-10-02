-- ===========================================================================
-- Karting — Phase 5 Step 5: Seed championship content
-- ---------------------------------------------------------------------------
-- Seeds race / season content for the demo groups so the live championship
-- pages render real standings from DB rows (no mock fallback involved when
-- Supabase is configured). Builds strictly on the identity skeleton from
-- migration 202609160003_seed_demo_data.sql and mirrors the mock world in
-- src/lib/mock-data.ts (races rc_8/rc_9/rc_10, the active 2026 season).
--
-- Deterministic mock-id -> uuid mapping
--   Migration 003 established the scheme
--     uuid = md5('karting-v1:' || kind || ':' || mock_id)::uuid
--   for kinds 'user', 'driver', 'group', 'team'. This migration re-derives the
--   same helper locally (it was dropped at the end of 003) and extends the
--   namespace with content kinds:
--     'season' -> public.seasons.id
--     'race'   -> public.races.id
--     'penalty'-> public.race_penalties.id
--     'award'  -> public.awards.id
--     'record' -> public.season_records.id
--
--   Content ids used below (precomputed with the scheme above):
--     season:season_2026 -> e8b349a3-ab18-79f6-a760-48abf37fabc0
--     race:rc_8   -> 40b40e0f-9c4a-37ba-d38c-9c258133081e  (Opening Sprint)
--     race:rc_9   -> 96b33377-a99d-b390-7275-1538970ee062  (Grand Prix Sprint)
--     race:rc_10  -> 2c882971-7d36-cfdf-0599-62912307cf55  (Monsoon Special)
--     race:rc_11  -> a1a7d5a5-4c81-4fb0-8d02-c37d943fa631  (Autumn Sprint)
--     race:rc_12  -> 21ff8b11-ed48-dfd0-b6e0-3797bfefedc4  (Champions Finale)
--     penalty:pn_3  -> 9bd8eea4-b3f9-8b27-efdd-28d524a74bfe
--     penalty:pn_2w -> a0091915-7821-0888-4c9a-3ff14bb8e0e5
--     award:aw_7 -> faa62e3e-e2d4-19f1-a268-e8ac4fd63637
--     award:aw_8 -> 639f218e-81dd-bad4-5041-5bf99aec7655
--     award:aw_9 -> e2891003-19d1-f0a3-468a-38a98025601b
--     award:aw_10 -> 9d9fa7d4-0c04-91ed-0ff0-e91589ad4e40
--     award:aw_11 -> ca4ce4b3-80c4-5dc8-41ef-ac45d2148bea
--     record:rec_4 -> 3cea238d-00c7-cdbc-2361-dae66ed2c2bc
--     record:rec_5 -> 13cf5bd0-08cd-fc66-6621-36d67abe6b43
--     record:rec_6 -> a750cbe6-bd4f-9e25-7bee-ad416c34d144
--
--   (grp_1 "Karting Crew" only)
--     season:season_2026 -> Crew Championship 2026 (active)
--     race:rc_8  -> Opening Sprint   2026-03-14 (completed, 8 entries)
--     race:rc_9  -> Grand Prix Sprint 2026-05-09 (completed, 8 entries)
--     race:rc_10 -> Monsoon Special  2026-07-18 (completed, 7 entries)
--     scoring: automatic; 25/18/15/12/10/8/6/4 by position + 1 pole point
--     teams/groups/drivers already seeded by migration 003.
--
--   Result the app computes from these rows (sum of the three completed
--   races, identical to the mock season_2026 decisions):
--     Driver standings (round 3):
--       P1 Bilal Darji (BD)  70 pts (2 wins, pole)   P5 Omar Tanveer (OT) 30 pts
--       P2 Zain Farooqi (ZF) 62 pts (1 win, pole)    P6 Umar Khan (UK)    26 pts
--       P3 Ahmad Rehman (AR) 42 pts                  P7 Arjun Mehta (AJ)   6 pts
--       P4 Daniyal Shah (DS) 37 pts                  P8 Haider Ali (HA)    4 pts
--       (Blanking runs earn dnf/dns/retired points = 0; penalties do not
--        reorder finishes in V1 — they are aggregate-only.)
--     Team standings (round 3):
--       P1 Apex Racing 118 pts   P2 Velocity Squad 99 pts   P3 Redline Karting 30 pts
--     Pole positions: Bilal rc_8, Zain rc_9, Bilal rc_10
--     winners:         Bilal rc_8, Zain rc_9, Bilal rc_10
--
-- RLS note: this runs as the migration role (table owner), which bypasses
-- RLS. Every row references existing drivers/groups/teams from migration 003,
-- so the Step 2 group-membership policies serve these rows correctly to
-- authenticated members of grp_1 and continue to deny everyone else.
--
-- Audited limitation: race_events is intentionally NOT seeded. It is the
-- V1 future session/audit log (still unused by app logic — the schema comment
-- says so) and no page or repository reads it today. Race_awards, penalties,
-- and the rest are all seeded so the season page renders everything.
--
-- Idempotency: every insert uses `on conflict ... do nothing` and the helper
-- function is local to this transaction, so the migration can be re-run.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- Deterministic id helper (re-derives migration 003's scheme; dropped at the
-- end of this migration)
-- ---------------------------------------------------------------------------
create or replace function public.karting_seed_uuid(p_kind text, p_mock_id text)
returns uuid
language sql
immutable
as $$
  select md5('karting-v1:' || p_kind || ':' || p_mock_id)::uuid
$$;

-- ---------------------------------------------------------------------------
-- 1) seasons (1 active season for grp_1)
-- ---------------------------------------------------------------------------
insert into public.seasons (id, group_id, name, status, start_date, end_date, created_at)
values
  (public.karting_seed_uuid('season', 'season_2026'), public.karting_seed_uuid('group', 'grp_1'), 'Crew Championship 2026', 'active', '2026-01-01', '2026-12-31', '2025-12-01T09:00:00Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2) season_scoring (1:1 config; automatic 25/18/15/12/10/8/6/4 + 1 pole)
-- ---------------------------------------------------------------------------
insert into public.season_scoring (season_id, mode, pole_position_points, fastest_lap_points, participation_points, dnf_points, dns_points, penalty_adjustment_enabled, created_at)
values
  (public.karting_seed_uuid('season', 'season_2026'), 'automatic', 1, 0, 0, 0, 0, false, '2025-12-01T09:00:00Z'::timestamptz)
on conflict (season_id) do nothing;

-- ---------------------------------------------------------------------------
-- 3) scoring_points (positions 1-8)
-- ---------------------------------------------------------------------------
insert into public.scoring_points (season_id, position, points)
values
  (public.karting_seed_uuid('season', 'season_2026'), 1, 25),
  (public.karting_seed_uuid('season', 'season_2026'), 2, 18),
  (public.karting_seed_uuid('season', 'season_2026'), 3, 15),
  (public.karting_seed_uuid('season', 'season_2026'), 4, 12),
  (public.karting_seed_uuid('season', 'season_2026'), 5, 10),
  (public.karting_seed_uuid('season', 'season_2026'), 6, 8),
  (public.karting_seed_uuid('season', 'season_2026'), 7, 6),
  (public.karting_seed_uuid('season', 'season_2026'), 8, 4)
on conflict (season_id, position) do nothing;

-- ---------------------------------------------------------------------------
-- 4) races (three completed rounds + two draft rounds of the 2026 season)
-- ---------------------------------------------------------------------------
insert into public.races (id, group_id, name, venue_name, date, start_time, format, status, organizer_id, qualifying_lap_count, rules, created_at, updated_at)
values
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('group', 'grp_1'), 'Opening Sprint', 'Nashik Karting Arena', '2026-03-14', '16:00', 'sprint', 'completed', public.karting_seed_uuid('driver', 'drv_1'), 1, 'Season opener. Rolling start after one formation lap.', '2026-02-25T09:00:00Z'::timestamptz, '2026-03-14T17:30:00Z'::timestamptz),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('group', 'grp_1'), 'Grand Prix Sprint', 'Pune Race Zone', '2026-05-09', '15:30', 'feature', 'completed', public.karting_seed_uuid('driver', 'drv_5'), 1, 'Feature-length run. One score-counting lap for the grid.', '2026-04-20T09:00:00Z'::timestamptz, '2026-05-09T17:00:00Z'::timestamptz),
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('group', 'grp_1'), 'Monsoon Special', 'Nashik Karting Arena', '2026-07-18', '16:30', 'sprint', 'completed', public.karting_seed_uuid('driver', 'drv_1'), 1, 'Run under full wet conditions if rain holds. No red-flag restarts for drizzle.', '2026-07-01T09:00:00Z'::timestamptz, '2026-07-18T17:45:00Z'::timestamptz),
  ('a1a7d5a5-4c81-4fb0-8d02-c37d943fa631', public.karting_seed_uuid('group', 'grp_1'), 'Autumn Sprint', 'Pune Race Zone', '2026-10-03', '15:00', 'sprint', 'draft', public.karting_seed_uuid('driver', 'drv_1'), 1, '', '2026-09-10T09:00:00Z'::timestamptz, '2026-09-10T09:00:00Z'::timestamptz),
  ('21ff8b11-ed48-dfd0-b6e0-3797bfefedc4', public.karting_seed_uuid('group', 'grp_1'), 'Champions Finale', 'Nashik Karting Arena', '2026-11-21', '16:00', 'feature', 'draft', public.karting_seed_uuid('driver', 'drv_5'), 1, '', '2026-09-10T09:00:00Z'::timestamptz, '2026-09-10T09:00:00Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 5) season_races (round order 1..5)
-- ---------------------------------------------------------------------------
insert into public.season_races (season_id, race_id, round_number)
values
  (public.karting_seed_uuid('season', 'season_2026'), '40b40e0f-9c4a-37ba-d38c-9c258133081e', 1),
  (public.karting_seed_uuid('season', 'season_2026'), '96b33377-a99d-b390-7275-1538970ee062', 2),
  (public.karting_seed_uuid('season', 'season_2026'), '2c882971-7d36-cfdf-0599-62912307cf55', 3),
  (public.karting_seed_uuid('season', 'season_2026'), 'a1a7d5a5-4c81-4fb0-8d02-c37d943fa631', 4),
  (public.karting_seed_uuid('season', 'season_2026'), '21ff8b11-ed48-dfd0-b6e0-3797bfefedc4', 5)
on conflict (season_id, race_id) do nothing;

-- ---------------------------------------------------------------------------
-- 6) race_entries (participation + qualifying + classified results)
--    One row per (race, driver). Mirrors mockRaceDrivers for rc_8/9/10.
--    Qualifying laps: 1. Single fastest lap is authoritative.
-- ---------------------------------------------------------------------------
insert into public.race_entries (race_id, driver_id, kart_number, status, confirmed, ready, grid_position, grid_penalty_seconds, qualifying_time_ms, qualifying_status, finish_position, penalty_total_seconds, notes)
values
  -- Opening Sprint (rc_8) — 2026-03-14
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_1'), 7,  'finished', true, true, 1, 0, 41750, 'completed', 1, 0, ''),
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_5'), 9,  'finished', true, true, 2, 0, 41800, 'completed', 2, 0, ''),
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_2'), 14, 'finished', true, true, 3, 0, 41960, 'completed', 3, 0, ''),
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_8'), 19, 'finished', true, true, 4, 0, 42290, 'completed', 4, 0, ''),
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_7'), 5,  'finished', true, true, 5, 0, 42030, 'completed', 5, 0, ''),
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_3'), 3,  'finished', true, true, 6, 0, 42410, 'completed', 6, 0, ''),
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_4'), 22, 'finished', true, true, 7, 0, 42680, 'completed', 7, 0, ''),
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_6'), 11, 'finished', true, true, 8, 0, 42910, 'completed', 8, 0, ''),

  -- Grand Prix Sprint (rc_9) — 2026-05-09
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_5'), 9,  'finished', true, true, 1, 0, 41720, 'completed', 1, 0, ''),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_1'), 7,  'finished', true, true, 2, 0, 41790, 'completed', 2, 0, ''),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_7'), 5,  'finished', true, true, 3, 0, 42060, 'completed', 3, 0, ''),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_2'), 14, 'finished', true, true, 4, 0, 41940, 'completed', 4, 0, ''),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_3'), 3,  'finished', true, true, 5, 0, 42380, 'completed', 5, 0, ''),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_8'), 19, 'finished', true, true, 6, 0, 42450, 'completed', 6, 0, ''),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_4'), 22, 'dnf',     true, true, 7, 0, 42650, 'completed', null, 0, 'Spin at turn 1'),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_6'), 11, 'dns',     true, false, 8, 0, 42880, 'completed', null, 0, 'Starter motor failure'),

  -- Monsoon Special (rc_10) — 2026-07-18
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_1'), 7,  'finished', true, true, 1, 0, 41770, 'completed', 1, 0, ''),
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_5'), 9,  'finished', true, true, 2, 0, 41820, 'completed', 2, 0, ''),
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_2'), 14, 'finished', true, true, 3, 0, 42040, 'completed', 3, 0, ''),
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_7'), 5,  'finished', true, true, 4, 0, 41990, 'completed', 4, 0, ''),
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_8'), 19, 'finished', true, true, 5, 0, 42330, 'completed', 5, 0, ''),
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_3'), 3,  'finished', true, true, 6, 0, 42480, 'completed', 6, 0, ''),
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_6'), 11, 'retired',  true, true, 7, 0, 42850, 'completed', null, 0, 'Radiator stone strike')
on conflict (race_id, driver_id) do nothing;

-- ---------------------------------------------------------------------------
-- 7) race_penalties (informational in V1; never reorder finishes)
-- ---------------------------------------------------------------------------
insert into public.race_penalties (id, race_id, driver_id, seconds, reason, issued_by, status, created_at)
values
  (public.karting_seed_uuid('penalty', 'pn_3'), '96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_3'), 5, 'Contact under braking', public.karting_seed_uuid('driver', 'drv_5'), 'issued', '2026-05-09T16:50:00Z'::timestamptz),
  (public.karting_seed_uuid('penalty', 'pn_2w'), '2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_3'), 5, 'Track limits at turn 9', public.karting_seed_uuid('driver', 'drv_1'), 'issued', '2026-07-18T17:15:00Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 8) race_awards (per completed race: driver of the race + cleanest driver)
--    most_improved is not awarded in this demo season.
-- ---------------------------------------------------------------------------
insert into public.race_awards (race_id, driver_of_race_id, most_improved_id, cleanest_driver_id, updated_at)
values
  ('40b40e0f-9c4a-37ba-d38c-9c258133081e', public.karting_seed_uuid('driver', 'drv_1'), null, public.karting_seed_uuid('driver', 'drv_8'), '2026-03-14T17:30:00Z'::timestamptz),
  ('96b33377-a99d-b390-7275-1538970ee062', public.karting_seed_uuid('driver', 'drv_5'), null, public.karting_seed_uuid('driver', 'drv_7'), '2026-05-09T17:00:00Z'::timestamptz),
  ('2c882971-7d36-cfdf-0599-62912307cf55', public.karting_seed_uuid('driver', 'drv_1'), null, public.karting_seed_uuid('driver', 'drv_3'), '2026-07-18T17:45:00Z'::timestamptz)
on conflict (race_id) do nothing;

-- ---------------------------------------------------------------------------
-- 9) awards (interim, since the season is active — no championship_winner)
-- ---------------------------------------------------------------------------
insert into public.awards (id, season_id, type, label, description, driver_id, team_id, race_id, value, created_at)
values
  (public.karting_seed_uuid('award', 'aw_7'),  public.karting_seed_uuid('season', 'season_2026'), 'team_champion',   'Team Leader',              'Leading team after round 3', null, public.karting_seed_uuid('team', 'tm_1'), null, '118 pts',  '2026-07-19T10:00:00Z'::timestamptz),
  (public.karting_seed_uuid('award', 'aw_8'),  public.karting_seed_uuid('season', 'season_2026'), 'championship_winner', 'Leader After Round 3', 'Current standings leader', public.karting_seed_uuid('driver', 'drv_1'), null, null, '70 pts',  '2026-07-19T10:00:00Z'::timestamptz),
  (public.karting_seed_uuid('award', 'aw_9'),  public.karting_seed_uuid('season', 'season_2026'), 'most_wins',         'Most Wins (3 rounds)',     'Most race wins so far', public.karting_seed_uuid('driver', 'drv_1'), null, null, '2 wins',  '2026-07-19T10:00:00Z'::timestamptz),
  (public.karting_seed_uuid('award', 'aw_10'), public.karting_seed_uuid('season', 'season_2026'), 'most_poles',        'Most Poles (3 rounds)',    'Most pole positions so far', public.karting_seed_uuid('driver', 'drv_1'), null, null, '2 poles', '2026-07-19T10:00:00Z'::timestamptz),
  (public.karting_seed_uuid('award', 'aw_11'), public.karting_seed_uuid('season', 'season_2026'), 'cleanest_season',   'Cleanest Season (3 rounds)','Most penalty-free races so far', public.karting_seed_uuid('driver', 'drv_1'), null, null, '3 races', '2026-07-19T10:00:00Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 10) season_records (fastest quali, most starts, most wins)
-- ---------------------------------------------------------------------------
insert into public.season_records (id, season_id, label, value, driver_id, created_at)
values
  (public.karting_seed_uuid('record', 'rec_4'), public.karting_seed_uuid('season', 'season_2026'), 'Best Qualifying', '41.720 s', public.karting_seed_uuid('driver', 'drv_5'), '2026-07-19T10:00:00Z'::timestamptz),
  (public.karting_seed_uuid('record', 'rec_5'), public.karting_seed_uuid('season', 'season_2026'), 'Most Starts',     '3 / 3',      public.karting_seed_uuid('driver', 'drv_1'), '2026-07-19T10:00:00Z'::timestamptz),
  (public.karting_seed_uuid('record', 'rec_6'), public.karting_seed_uuid('season', 'season_2026'), 'Most Wins',       '2',          public.karting_seed_uuid('driver', 'drv_1'), '2026-07-19T10:00:00Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 11) Cleanup: the id helper is seed infrastructure, not part of the schema.
-- ---------------------------------------------------------------------------
drop function if exists public.karting_seed_uuid(text, text);

commit;