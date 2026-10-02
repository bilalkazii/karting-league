# Phase 5 Step 4 — Live Supabase Verification

Status: **PASSED (schema/RLS/seed) — with honest limits**

Real execution against project `psqhquqvjjsylxyjbrhi`
(`https://psqhquqvjjsylxyjbrhi.supabase.co`, region ap-northeast-2)
completed. No results fabricated; where verification is not possible today it is
explicitly listed under **Skipped** with the exact reason.

## Completed checks (real, executed)

| # | Check | Result (evidence) |
|---|-------|-------------------|
| 1 | CLI installed | `supabase` not global; local via `npx supabase --version` → **2.117.0** (npm devDependency). winget has no `Supabase.CLI` package, so installed per user's approval as `npm i -D supabase`. |
| 2 | Auth | `npx supabase login` → "You are now logged in." (token supplied by user) |
| 3 | Project link | `npx supabase link --project-ref psqhquqvjjsylxyjbrhi` → `{"project_ref":"psqhquqvjjsylxyjbrhi"}`; `supabase/.temp` created; `projects list` → `"linked":true`. |
| 4 | Migration list | Pre-push: 001/002/003 local-only (`remote:""`). |
| 5 | Migration apply | `npx supabase db push` — 001 + 002 applied; 003 failed once (see Failed #1), then after the documented fix 003 applied. Final `migration list`: 001 ✅ 002 ✅ 003 ✅ (local == remote). |
| 6 | Tables exist | 18/18 tables present (profiles, drivers, groups, group_members, teams, team_members, races, race_entries, qualifying_attempts, race_penalties, race_events, seasons, season_races, season_scoring, scoring_points, awards, race_awards, season_records). |
| 7 | RLS enabled | `relrowsecurity = true` on all 18 tables. |
| 8 | Deny-by-default (anon) | `set role anon` → counts 0 on drivers/profiles/groups/group_members/teams/races/seasons/scoring_points; `current_driver_id()` → null; `group_role(grp_1)` → null. |
| 9 | Group-membership policies | 72 RLS policies across 18 tables, SELECT/INSERT/UPDATE/DELETE shapes match migration 002 (manage vs member vs own). Behavioral matrices passed: drv_1 → profiles 1, drivers 8, groups 2, members 14, teams 3, team_members 7, `group_role`='admin', `can_manage_group`=true; drv_4 → groups 1, grp_2 members 0, `group_role`(grp_2)=null, `can_manage_group`(grp_1)=false, teams 3 visible, `team_group_member`(tm_1)=true. |
| 10 | Helper functions | All 9 (`current_driver_id`, `group_role`, `can_manage_group`, `race_group_member`, `race_group_manage`, `season_group_member`, `season_group_manage`, `team_group_member`, `team_group_manage`) are **SECURITY DEFINER** with pinned **`search_path=public`**. |
| 11 | Seed data | 8 profiles, 8 drivers, 2 groups, 14 group_members, 3 teams, 7 team_members, 8 `@karting.app` users. |
| 12 | Seed idempotency | Re-ran migration 003 verbatim → no error; counts identical after (8/8/2/14/3/7/8). |
| 13 | No unrelated data touched | races=0, seasons=0 (content intentionally not seeded); no destructive statements; migration 003 drops only its own `karting_seed_uuid` helper. |
| 14 | App with env configured | `npm run dev` started, log confirmed `Environments: .env.local`. `/championship` → 200 renders "No active season" empty state; `/seasons/<uuid>` → 404 (notFound, no such season); `/dashboard` → 200; `/groups` → 200; `/` → 307. Unauthenticated requests see RLS-deny-by-default reflected gracefully (no crash). |
| 15 | Mock fallback (Supabase unconfigured) | Moved `.env.local` aside, restarted dev (no `Environments:` line). `/championship` → 200 renders mock active season ("Bilal"/"Darji", Apex/Redline/Velocity, "Karting Crew"); `/seasons/season_2026` → 200 with "Crew Championship 2026", leader/standings. `.env.local` restored afterwards. |
| 16 | Static validation | `npm run lint` ✅ · `npx tsc --noEmit` ✅ · `npm run build` ✅ (16/16 routes, `.env.local` loaded). |

## Failed checks

| # | What | Error | Resolution |
|---|------|-------|-----------|
| 1 | Migration 003 (seed) first run | Real DB error: `ERROR: function gen_salt(unknown) does not exist (SQLSTATE 42883)` at the `insert into auth.users` statement. `pgcrypto` is installed in the `extensions` schema (verified), but the `db push` migration-runner search path does not include `extensions`, so unqualified `crypt()`/`gen_salt()` did not resolve. | Minimal, execution-error-driven fix to migration 003: qualified the 8 `crypt(...)`/`gen_salt(...)` calls as `extensions.crypt(...)` / `extensions.gen_salt(...)` and updated the stale header comment. No schema or logic change. Re-push succeeded. This is the only migration file modified, and only because a real execution error proved it necessary. |

## Skipped / not-possible-in-this-phase (with exact reason)

| Check | Reason |
|-------|--------|
| Live DB rendering of `/championship` standings + `/seasons/[seasonId]` with real driver/team/group names via `resolveSeasonIdentities` | Requires **race/season content**, which migration 003 intentionally does not seed (by design — a future content-seed migration per `docs/phase-5-step-4.md` Checkpoint D). DB currently has races=0, seasons=0, so there is no active season to render; the app correctly shows the empty state and 404 respectively. |
| Neutral "Unknown" labels for genuinely missing identities in live DB mode | Same dependency on content being seeded; the `?? null` resolver path is unit-level present and the mock path renders correct names (Check 15), but the DB branch cannot be exercised until a season exists. |
| Authenticated in-app session flow (sign-in → DB-backed pages) | Auth UI does not exist in this version; the only in-app proof of the DB read path is the unauthenticated anon path (deny-by-default) shown in Check 14. |

## Exact blockers encountered

- winget does not publish `Supabase.CLI` (search returned no match) → installed the CLI via npm instead, with user approval.
- Migration 003 initially failed with the pgcrypto search-path error (Failed #1); fixed minimally before re-push.
- No live DB content to exercise season rendering end-to-end (by design, not a defect).

## Commands actually executed

`winget --version` · `npm i -D supabase` · `npx supabase --version` ·
`npx supabase login --token <redacted>` · `npx supabase link --project-ref psqhquqvjjsylxyjbrhi` ·
`npx supabase projects list` · `npx supabase migration list` ·
`npx supabase db push` (twice: initial fail, post-fix success) ·
`npx supabase db query --linked` (schema/RLS/policy/helper/seed/anon/drv_1/drv_4 checks) ·
`npx supabase db query --linked --file 202609160003_seed_demo_data.sql` (idempotency re-run) ·
`npm run dev` (env-on and env-off modes) · `curl` route checks ·
`npm run lint` · `npx tsc --noEmit` · `npm run build`

## Secret handling

- `SUPABASE_SERVICE_ROLE_KEY` is stored in `.env.local` (gitignored via `.env*` /
  `!.env.example`), referenced only server-side by `src/lib/supabase/admin.ts`,
  never consumed via a `NEXT_PUBLIC_*` variable and never printed or committed.
- The CLI access token was passed only to `supabase login` (redacted above).
- The DATABASE password was not required by the CLI for link/push/query in this
  session; it was provided to the user's env setup and is not recorded here.