# Phase 5 Step 5 — Championship Content Seed Migration

## Scope

Create a content-seed migration that gives the linked Supabase project a realistic
championship dataset so the DB-mode `/championship` and `/seasons/[seasonId]`
pages have real rows to render (active season, races, entries, qualifying,
results, penalties, awards, records). Deterministic ids, idempotent, RLS-correct,
applied to the live project, verified, and documented only with actually executed
results.

## Checkpoint A — Requirements

- Do **not** modify migrations 001/002/003.
- New migration: `supabase/migrations/202609170004_seed_championship_content.sql`.
- Idempotent: every insert uses the documented deterministic uuid scheme
  `md5('karting-v1:' || kind || ':' || mock_id)::uuid` and `on conflict ... do nothing`.
- Do **not** weaken or bypass any RLS policy; access stays deny-by-default for
  anonymous users and group-scoped for members.
- Do not expose secrets.
- Apply to the linked project (`psqhquqvjjsylxyjbrhi`) only after reviewing the SQL.
- Verify pages render; document real executed results.

## Checkpoint B — Migration

`202609170004_seed_championship_content.sql` inserts, in FK order:

`seasons` (1) → `season_scoring` (1) + `scoring_points` (8) →
`races` (5) → `season_races` (5) → `race_entries` (23) → `race_penalties` (2) →
`race_awards` (3) + `awards` (5) → `season_records` (3).

- Season: `season_2026` → "Crew Championship 2026", group `grp_1` (Karting Crew),
  `active`, dates 2026-01-01 … 2026-12-31. Id
  `e8b349a3-ab18-79f6-a760-48abf37fabc0`.
- Scoring: automatic, 25/18/15/12/10/8/6/4 by position 1-8, 1 pole point.
- Races mirror `src/lib/mock-data.ts`: Opening Sprint (rc_8, round 1,
  completed) → Grand Prix Sprint (rc_9, round 2, completed) → Monsoon Special
  (rc_10, round 3, completed) → Autumn Sprint (rc_11, round 4, draft) →
  Champions Finale (rc_12, round 5, draft).
- Race definitions (lap counts, venue, date, start_time, organizer, rules) match
  the mock `Races` the pages already render in mock mode, so the DB-mode and
  mock-mode championship looks the same.
- Entries / qualifying / results / penalties for rounds 1-3 (23 entries, 2
  penalties, 3 completed races with 8/8/7 entrants and 8/6/6 classified
  finishers); rounds 4-5 keep the 5-entry invitation grid with no results
  (draft state).
- Awards: 5 (`aw_7` team champion "Crew Championship 2026", `aw_8` driver
  70 pts, `aw_9` most improved, `aw_10` cleanest, `aw_11` driver award) and 3
  `race_awards` (round winners). Records: 3 (`rec_4` fastest race lap,
  `rec_5` fastest qualifying, `rec_6` longest winning streak).

### Expected standings (documented in the migration header)

Drivers: Bilal 70, Zain 62, Ahmad 42, Daniyal 37, Omar 30, Umar 26, Arjun 6,
Haider 4. Poles: rc_8 Bilal, rc_9 Zain, rc_10 Bilal. Winners: rc_8 Bilal,
rc_9 Zain, rc_10 Bilal. Teams: Apex Racing 118, Velocity Squad 99,
Redline Karting 30. These are the values the deterministic computation produces
from the seeded rows (application of the engine is verified on the live rows in
`docs/phase-5-step-5-live-verification.md`).

### Review notes (no RLS weakening)

- Utility helper `karting_seed_uuid(text, text)` is declared inside
  `begin/commit`, dropped at the end of the same transaction (its own helper
  only, same pattern as 003).
- All inserts are plain `insert` + `on conflict do nothing`; no `set role`, no
  `security definer`, no policy grants, no direct `grant`.
- `race_events` is intentionally **not** seeded: it is the V1 future audit log,
  no repository or page reads it (cross-checked), and migration 001 constraints
  its shape. Seeding fake audit events would add zero render value.
- FK order and column names derive from migration 001; the uuid scheme and id
  mapping (rc_8 … rc_12, season_2026, aw_7 … aw_11, rec_4 … rec_6) derive from
  migration 003's documented scheme.

## Checkpoint C — Static validation

- `npm run lint` ✅
- `npx tsc --noEmit` ✅
- `npm run build` ✅ (16/16 routes generated)
- `npx supabase db lint` **not possible**: the local Docker daemon is not
  running (`failed to connect to the docker API at
  npipe:////./pipe/dockerDesktopLinuxEngine`), so local SQL linting of the
  migration via a local Supabase instance is unavailable — same situation as
  step 4. The migration was instead validated by the executable checks in
  Checkpoint D (live `db push`, live re-apply, live row-level assertions).

## Checkpoint D — Live Supabase execution (PASSED)

Executed against project `psqhquqvjjsylxyjbrhi` on 2026-09-17; full results in
`docs/phase-5-step-5-live-verification.md`. Summary: migration applied cleanly
(`npx supabase db push`), re-ran verbatim for idempotency, live counts and
race/entry structure asserted, RLS matrix re-verified (anon deny-by-default
preserved; grp_1 member sees all seeded rows), and the real standings engine
(`src/lib/championship-utils.ts`) ran against the live DB rows producing exactly
the documented standings above.

## Checkpoint E — Conclusions

- The migration is safe, idempotent, deterministic, and RLS-compliant; it is
  applied to the linked project and `migration list` reports 001-004 applied.
- Live DB now contains a real active season and all content the championship
  read path needs; member-scoped RLS serves it; anon still sees nothing.
- In-app live rendering from DB rows could not be exercised from this machine
  because the local OS resolver does not resolve `*.supabase.co` (details and
  the exact evidence in the live-verification doc, "Skipped" section).

## Limitations

- `race_events` (audit log) intentionally unseeded; no V1 consumer exists.
- Standings are a deterministic function of seed data; any future edits to
  entries/results must be re-verified against the app engine.
- In-app authenticated rendering of the DB data awaits both a working auth flow
  and a resolver for `*.supabase.co` from the app host (see live-verification doc).