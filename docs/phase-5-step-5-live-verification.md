# Phase 5 Step 5 — Live Supabase Verification

Status: **PASSED (migration/RLS/standings) — with honest limits**

Real execution against project `psqhquqvjjsylxyjbrhi`
(`https://psqhquqvjjsylxyjbrhi.supabase.co`, region ap-northeast-2) on 2026-09-17.
No results fabricated; where verification is not possible today it is explicitly
listed under **Skipped** with the exact reason.

## Completed checks (real, executed)

| # | Check | Result (evidence) |
|---|-------|-------------------|
| 1 | Migration reviewed | `supabase/migrations/202609170004_seed_championship_content.sql` read in full before apply; header documents scheme, seed counts, expected standings, and the `race_events` non-seeding note. |
| 2 | Migration applied | `npx supabase db push` → applied `202609170004_seed_championship_content.sql`. `migration list`: 001 ✅ 002 ✅ 003 ✅ 004 ✅ (local == remote). |
| 3 | Active season exists | `seasons` → 1 row: **Crew Championship 2026**, id `e8b349a3-ab18-79f6-a760-48abf37fabc0`, `active`, 2026-01-01…2026-12-31; `season_races` = 5 rounds; group resolves to Karting Crew. |
| 4 | Live row counts | seasons 1 · season_races 5 · races 5 · race_entries 23 · race_penalties 2 · race_awards 3 · awards 5 · season_records 3 · scoring_points 8. |
| 5 | Race structure | Round 1 Opening Sprint (completed, 8 entries, 8 classified) · Round 2 Grand Prix Sprint (completed, 8 entries, 6 classified) · Round 3 Monsoon Special (completed, 7 entries, 6 classified) · Round 4 Autumn Sprint (draft, 0) · Round 5 Champions Finale (draft, 0). |
| 6 | RLS — deny-by-default (anon) | `set role anon` → 0 visible rows on seasons/races/race_entries/teams/awards. Policy set untouched; seed introduces no grants. |
| 7 | RLS — grp_1 member | `set role authenticated; set request.jwt.claims = '{"sub":"d2fe5fba-0512-ef33-2b95-ae8f0261ae76"}'` (drv_1) → `group_role`=admin, seasons 1, races 5, entries 23, teams 3, team_members 7, awards 5, records 3, penalties 2. |
| 8 | Seed idempotency | Re-ran migration 004 verbatim via the linked query runner → no error; all counts identical post-apply (1/5/5/23/2/3/5/3/8). |
| 9 | Standings via real engine on live rows | Fetched the live row set as JSON (`db query --output-format json`), compiled `src/lib/championship-utils.ts` in memory (type-only imports → zero runtime deps) and ran `computeStandings` + `computeTeamSeasonStats` on it. Output below. |
| 10 | Snapshots match intent | After Opening Sprint leader Bilal 26; after Grand Prix Sprint leader Zain 44; after Monsoon Special leader Bilal 70 (poles rc_8 Bilal, rc_9 Zain, rc_10 Bilal). |
| 11 | App with env configured | `npm run dev` (log: `Environments: .env.local`). `/championship` → 200 "No active season" empty state; `/seasons/e8b349a3-…` → 404; `/seasons/season_2026` → 404; `/dashboard` → 200; `/groups` → 200; `/` → 307. No crash. (Unauthenticated + CLI-routed reads only; see Skipped #3 for the resolver limitation.) |
| 12 | Mock fallback (Supabase unconfigured) | `.env.local` moved aside, dev restarted (no `Environments:` line). `/championship` → 200 renders mock active season ("Crew Championship 2026", "Bilal Darji"); `/seasons/season_2026` → 200 containing "Crew Championship 2026", "Bilal Darji", "Apex Racing", "Velocity Squad", "Redline Karting", "70". `.env.local` restored afterwards. |
| 13 | Static validation | `npm run lint` ✅ · `npx tsc --noEmit` ✅ · `npm run build` ✅ (16/16 routes). |

## Standings produced by the real engine on live DB rows (Check 9)

Driver standings (`computeStandings`):

```
# | name          | pts | wins | podiums | poles | entered | completed | dnf | gap
1 | Bilal Darji   |  70 |    2 |     3   |   2   |    3    |     3     |  0  | 0
2 | Zain Farooqi  |  62 |    1 |     3   |   1   |    3    |     3     |  0  | 8
3 | Ahmad Rehman  |  42 |    0 |     2   |   0   |    3    |     3     |  0  | 28
4 | Daniyal Shah  |  37 |    0 |     1   |   0   |    3    |     3     |  0  | 33
5 | Omar Tanveer  |  30 |    0 |     0   |   0   |    3    |     3     |  0  | 40
6 | Umar Khan     |  26 |    0 |     0   |   0   |    3    |     3     |  0  | 44
7 | Arjun Mehta   |   6 |    0 |     0   |   0   |    2    |     1     |  1  | 64
8 | Haider Ali    |   4 |    0 |     0   |   0   |    3    |     1     |  0  | 66
```

Team standings (`computeTeamSeasonStats`):

```
# | team           | pts | wins | podiums | drivers
1 | Apex Racing    | 118 |   2  |    5    | Bilal Darji, Ahmad Rehman, Arjun Mehta
2 | Velocity Squad |  99 |   1  |    4    | Zain Farooqi, Daniyal Shah
3 | Redline Karting|  30 |   0  |    0    | Umar Khan, Haider Ali
```

These match the documented expected standings in the migration header exactly.

## Skipped / not-possible-in-this-phase (with exact reason)

| Check | Reason |
|-------|--------|
| 1 | On-the-wire authenticated PostgREST read with a real user session | GoTrue password grant for the seeded `demo@karting.app` returns `500 Database error querying schema` — a **pre-existing** auth-instance/schema mismatch on this project (the same caveat migration 003's header warns about for pre-2023 GoTrue instances). Not introduced by migration 004; fixing it is out of scope for this content-seed step. The member-side RLS proof is therefore the DB-level matrix (Check 7), which is the identical policy path PostgREST enforces. |
| 2 | In-app live-DB rendering of `/championship` standings and `/seasons/[seasonId]` with real names | The app's server-side fetch (Node) uses the OS resolver, which does **not** resolve `psqhquqvjjsylxyjbrhi.supabase.co` here (`nslookup` → NXDOMAIN; public resolvers 8.8.8.8 / 1.1.1.1 resolve it fine to 172.64.149.246 / 104.18.38.10). So the in-app DB reads fall to the no-data branch (same empty-state/404 behaviour as Check 11). All DB-level evidence was produced through the CLI (`supabase db push`/`db query`), which routes via `api.supabase.com` and is unaffected. An OS hosts entry would be required to exercise the in-app path on this machine. |
| 3 | `supabase db lint` (local SQL lint) | Docker daemon not running (`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`); no local Supabase instance to lint against. Static lint/tsc/build + live apply/re-apply and row assertions used instead. |

## Exact blockers encountered

- Local OS DNS cannot resolve `*.supabase.co` (project host) — app-level live
  rendering blocked on this machine; public resolvers resolve it, so this is a
  local-resolver issue, not a project issue.
- GoTrue token endpoint returns a schema 500 for the seeded demo account —
  pre-existing auth-instance issue, outside this step's scope.
- `supabase db lint` requires a running Docker daemon; not available here.

## Commands actually executed

`npx supabase db push` ·
`npx supabase migration list` ·
`npx supabase db query --linked` (active season, counts, race structure,
RLS anon/drv_1 matrices, full-dataset JSON dump) ·
`npx supabase db query --linked --file 202609170004_seed_championship_content.sql`
(idempotency re-run) ·
`npx supabase db query --linked --output-format json --file v005-full-data.sql`
(real row dump) ·
`node` on a temp script that loads the dump and runs the project's
`championship-utils` engine (standings below) ·
`npm run dev` (env-on and env-off) + `Invoke-WebRequest` route checks ·
`npm run lint` · `npx tsc --noEmit` · `npm run build`

## Secret handling

- `SUPABASE_SERVICE_ROLE_KEY` remains in `.env.local` (gitignored), referenced
  only server-side, never printed or committed.
- The anon key was used transiently in the CLI's linked-query sessions and a
  failed GoTrue sign-in attempt; no token or key value was written to docs, logs,
  or the repo.
- `.env.local` was temporarily moved aside for the mock-fallback check and
  restored immediately afterwards (verified present after each run).