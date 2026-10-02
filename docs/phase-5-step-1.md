# Phase 5 Step 1 — Supabase Schema and Environment Foundation

## Scope
This step adds the database foundation ONLY. No Supabase client code, no auth
UI, no RLS policies, and no changes to the mock data layer. The app continues
to run entirely off `src/lib/mock-data.ts` until a later step swaps the
lookup helpers for Supabase access.

Deliverables:
- `supabase/migrations/202609160001_initial_schema.sql` — initial schema
- `src/types/database.ts` — typed DB structure (mirrors the migration)
- `.env.example` — placeholder environment variables
- This document

No `supabase-js` (or any other) dependency was added. The build must pass
without a live Supabase project.

## 1. Schema overview (18 tables)

| Table | Purpose |
|---|---|
| `profiles` | User identity, 1:1 with `auth.users` |
| `drivers` | Racing identity (nickname, number, colors, rating) |
| `groups` | Karting group |
| `group_members` | Group membership + role (drives future RLS) |
| `teams` | Team |
| `team_members` | Canonical team membership |
| `races` | Race |
| `race_entries` | Driver participation, live timing state, results |
| `qualifying_attempts` | Future session log (unused by app logic in V1) |
| `race_penalties` | Penalty log (informational in V1) |
| `race_events` | Race timeline / audit |
| `seasons` | Championship season |
| `season_races` | Ordered race membership (round numbers) |
| `season_scoring` | 1:1 scoring config per season |
| `scoring_points` | Position → points rules |
| `awards` | Season awards |
| `race_awards` | Per-race awards |
| `season_records` | Season records |

## 2. Domain → database mapping

| Domain type | DB tables |
|---|---|
| `Driver` | `profiles` (full_name) + `drivers` (racing identity) |
| `Group` | `groups` |
| `GroupMember` | `group_members` (teamId intentionally omitted — see decisions) |
| `Team` | `teams` + `team_members` |
| `Race` | `races` |
| `RaceDriver` | `race_entries` |
| `RacePenalty` | `race_penalties` |
| `RaceEvent` | `race_events` (timestamp → `occurred_at`, metadata → `payload`) |
| `Season` | `seasons` + `season_races` |
| `ChampionshipScoring` | `season_scoring` + `scoring_points` |
| `ChampionshipPointsRule` | `scoring_points` |
| `Award` | `awards` |
| `RaceAward` | `race_awards` |
| `SeasonRecord` | `season_records` |

### Derived data — intentionally not stored
These fields are computed in the application layer and have no column:
- `Driver.stats`, `Driver.badges`, `Driver.recentForm`
- `Group.upcomingRace`, `Group.recentResults`, `Group.currentChampionship`
- `Team.memberIds` (from `team_members`)
- `Race.participatingDriverIds` (from `race_entries`)
- `Season.raceIds` (from `season_races`)
- `RaceResult` (view over `race_entries`: finish_position, status, notes)

## 3. Relationships
- `profiles` 1:1 `drivers` (`drivers.profile_id` UNIQUE, RESTRICT on delete)
- `groups` 1:N `group_members`, `teams`, `races`, `seasons` (CASCADE)
- `groups.created_by` → `drivers` (nullable, SET NULL) — group admin/founder
- `teams` 1:N `team_members` (driver CASCADE)
- `races` 1:N `race_entries`, `qualifying_attempts`, `race_penalties`, `race_events`, `race_awards` (CASCADE)
- `races.organizer_id` → `drivers` (RESTRICT)
- `seasons` 1:N `season_races`, `scoring_points`, `awards`, `season_records` (CASCADE)
- `seasons` 1:1 `season_scoring` (CASCADE)
- `awards.driver_id` / `team_id` / `race_id` nullable, SET NULL (award survives subject removal)

All cross-resource deletes are CASCADE except `drivers` referenced by
`organizer_id`/`issued_by` (RESTRICT) and read-only award/record refs (SET NULL).

## 4. Environment variables
`.env.example` documents (placeholders only — never real keys):
- `NEXT_PUBLIC_SUPABASE_URL` — PostgREST endpoint (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only (optional while on mocks)

`.gitignore` gains `!.env.example` so the safe example stays committable while
real `.env*` files remain ignored.

## 5. Applying the migration
Requires the Supabase CLI (`npx supabase@latest link` then `db push`), or paste
the file into the SQL Editor. This repo is not currently a git repository and
contains no live Supabase project, so the migration has not been executed here;
validity is verified by static review and lint/tsc/build.

## 6. Mock compatibility
The app keeps using `src/lib/mock-data.ts` and `src/types/index.ts` unchanged.
Database ids are `uuid` whereas mock ids are text (`drv_1`, `grp_1`…). A later
step must define a stable mock-id ↔ uuid mapping before seeding. `CURRENT_USER_ID`
(`drv_1`) maps to a `profiles` + `drivers` row.

## 7. Future RLS model (not applied yet)
RLS is ENABLED on all 18 tables with zero policies (deny-by-default). The
reviewed policy set will follow: users may read a resource if `group_members`
shows them a member of its group; write policies are role-gated
(`admin`/`organizer` create and update own-group resources; `member` manages
own participation). Applied in a separate migration during Phase 5 Step 2+.

## 8. Design decisions
1. UUID primary keys; mock text ids are mock-only.
2. Table named `race_entries` (requirement allowed `race_drivers`).
3. No separate `race_results` table — results live on `race_entries`.
4. `group_members.team_id` dropped; `team_members` is canonical.
5. `qualifying_attempts` reserved for future sessions; effective time remains
   `race_entries.qualifying_time_ms`.
6. snake_case columns; `occurred_at` in `race_events` (avoids the type name).
7. `seasons.created_at` exists; no `updated_at` (not in the domain model).

## 9. Limitations
- Visual smoke testing not available.
- Migration not executed against a live project in this session.
- `src/types/database.ts` is hand-maintained, not generated.
- Qualifying attempts table is empty until the app records sessions.

## 10. Recommended Phase 5 Step 2
Auth + profiles seeding (map `CURRENT_USER_ID` → `profiles`/`drivers`),
group-membership RLS policies migration, and swap the first read path
(e.g. `getGroupById`) from mock helpers to Supabase access behind a thin
repository layer — one resource at a time, keeping the mock fallback.