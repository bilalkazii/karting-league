# Phase 5 Step 3 — Seed Data + Full Read-Path Repository Layer

## Scope

Seed the organization skeleton with deterministic mock-ID → UUID mapping, expand
the repository layer to cover every read surface (members, teams, drivers, races,
championship), wire DB-first reads into all server-component routes, and deliver
a copy-paste RLS verification procedure. The mock system, 25 routes, and
deterministic computation layer are untouched.

## Checkpoint A — Deterministic mock-ID → UUID mapping

Scheme (stable, name-based, reproducible by any future content seed):

    uuid = md5('karting-v1:' || kind || ':' || mock_id)::uuid

| kind   | namespace              | example mock_id | example uuid                            |
|--------|------------------------|-----------------|-----------------------------------------|
| `user` | `auth.users.id`        | `drv_1`         | `d2fe5fba-0512-ef33-2b95-ae8f0261ae76` |
| `driver` | `public.drivers.id`  | `drv_1`         | `14ffa0d1-10b1-a576-2c37-22fde97c433c` |
| `group` | `public.groups.id`   | `grp_1`         | `f2797ede-2cc5-c877-25ac-fb46510e3cf0` |
| `team`  | `public.teams.id`    | `tm_1`          | `dd6dacfc-af18-d6cd-bc6a-7c45e1f36758` |

Full id table is embedded in the seed migration header comment (line 24-34).

## Checkpoint B — Seed migration

File: `supabase/migrations/202609160003_seed_demo_data.sql`

Seeds the identity + organization skeleton only (no race/season content):

| table          | rows | notes                                                     |
|----------------|------|-----------------------------------------------------------|
| `auth.users`   | 8    | Only `drv_1` has a real password (`demo@karting.app` / `karting-demo-2026`) |
| `profiles`     | 8    | `full_name` = mock driver name                            |
| `drivers`      | 8    | nickname, racing_number, avatar colors, rating from mock  |
| `groups`       | 2    | `grp_1` (created by drv_1), `grp_2` (created by drv_5)   |
| `group_members`| 14   | All roles + availability from mock, `joined_at` preserved |
| `teams`        | 3    | All in `grp_1`                                            |
| `team_members` | 7    | Exact mirror of mock `Teams[].memberIds`                  |

Races, seasons, awards, records, events are intentionally NOT seeded — left for
a later content-seed migration so the write path / app flow is exercised first.

Helper function `public.karting_seed_uuid(text, text)` is created and dropped
within the migration (not part of the schema).

## Checkpoint C — Repository layer (members, teams, drivers, races)

New/modified files:

- `src/lib/repositories/mappers.ts` — shared row→domain mappers:
  `mapGroupsRow`, `mapGroupMemberRow`, `mapDriverRow`, `mapTeamRow`,
  `mapRaceRow`, `mapRaceDriverRow`, `mapRacePenaltyRow`, `mapRaceEventRow`,
  `mapSeasonRow`, `mapAwardRow`, `mapSeasonRecordRow`. Also exports
  `EMPTY_DRIVER_STATS` neutral defaults.

- `src/lib/repositories/data.ts` — `fetchDriversByIds(client, ids)` bulk
  resolution (drivers + profiles join, ordered by caller ids).

- `src/lib/repositories/drivers.ts` — `getDriverById`, `getDriversByIds`
  (preserves caller order). Mock fallback via `getMockDriverById`.

- `src/lib/repositories/members.ts` — `getGroupMembers(groupId)` (resolves
  `teamId` via teams + team_members scoped to the group), `getDriverGroups(driverId)`
  (returns Group with neutral previews). Mock fallback via `getMockGroupMembers`,
  `getMockDriverGroups`.

- `src/lib/repositories/teams.ts` — `getTeamsByGroup`, `getTeamById`,
  `getTeamMembers`, `teamByDriver`. Mock fallback via `getMockTeamsByGroup`,
  `getMockTeamById`, `getMockTeamMembers`, `getMockTeams`.

- `src/lib/repositories/races.ts` — `getRaceById`, `getRacesByGroupId`,
  `getRacesForUser`, `getRaceDrivers`, `getRacePenalties`, `getRaceEvents`.
  Helpers: `sortRaceRows` (date+startTime desc), `fetchEntriesByRace(client, raceIds)`.
  Mock fallback via `getMockRaceById` etc.

- `src/lib/repositories/groups.ts` — refactored to import `mapGroupsRow` from
  mappers (behavior unchanged, 24 lines).

Every repository function is gated: `const client = await createServerSupabaseClient(); if (!client) return mockFallback(...);` — identical mock behavior when Supabase is not configured.

## Checkpoint D — Championship repository

File: `src/lib/repositories/championship.ts`

Exports: `getSeasonById`, `getActiveSeason`, `getActiveSeasonForDriver`,
`getSeasonRaces`, `getSeasonRaceResults`, `getSeasonStandings`,
`getSeasonTeamStats`, `getSeasonAwards`, `getSeasonRecords`.

All derived data (race results, standings, team stats, awards, records) is
recomputed from normalized rows (season_races, race_entries, race_penalties,
season_scoring, scoring_points, teams, team_members). Mock fallback via
championship-data helpers (`getMockSeasonById` etc.).

## Checkpoint E — Route wiring (server components)

Wired to repositories:

| route                                         | reads wired                                        |
|-----------------------------------------------|-----------------------------------------------------|
| `dashboard/page.tsx`                          | `getDriverGroups`, `getGroupMembers` (counts)       |
| `groups/[groupId]/layout.tsx`                 | `getGroupMembers`                                   |
| `groups/[groupId]/page.tsx`                   | `getGroupMembers`, `getTeamsByGroup`, `getDriversByIds` |
| `drivers/[driverId]/page.tsx`                 | `getDriverById` (repo)                              |
| `races/page.tsx`                              | `getRacesForUser`, `getRaceDrivers` (counts)        |
| `races/[raceId]/layout.tsx`                   | `getRaceById`, `getRaceDrivers`, `getRacePenalties`, `getRaceEvents` |
| `championship/page.tsx`                       | `getActiveSeasonForDriver`, `getSeasonStandings`, `getSeasonTeamStats`, `getSeasonAwards`, `getSeasonRaces`, `getSeasonRecords` |
| `seasons/[seasonId]/page.tsx`                 | `getSeasonById`, `getSeasonStandings`, `getSeasonTeamStats`, `getSeasonAwards`, `getSeasonRecords`, `getSeasonRaces`, `getSeasonRaceResults` |
| `profile/page.tsx`                            | `getCurrentDriverProfile` (was `CURRENT_USER_ID`)   |

Remaining mock-data imports are **client components** (`'use client'`) which
cannot use server-side repositories, or **presentation utilities** (getFormIcon,
getAvailabilityLabel, etc.) that are DB-agnostic.

### Identity resolution gap (documented)

`driverStandingRowData` / `teamStandingRowData` (in `championship-data.ts`) and
`TeamCard` / `MemberCard` resolve driver/team names from mock helpers. In DB mode
with uuid-based ids, these resolve as "Unknown". This is accepted: identity
resolution for championship standings requires refactoring those shared helpers to
accept an async resolver, which is deferred to Phase 5 Step 4.

## Checkpoint F — RLS verification procedure

File: `docs/phase-5-step-3-rls-verification.sql`

Copy-paste SQL that exercises the access matrix against the seeded data:

| impersonates         | groups visible | group_members visible | self-update | admin-manage | self-join | attacker denied |
|----------------------|----------------|-----------------------|-------------|--------------|-----------|-----------------|
| `anon` (no session)  | 0              | —                     | —           | —            | —         | all tables      |
| drv_1 (admin grp_1, member grp_2) | 2 | 14                    | ✓           | ✓            | —         | —               |
| drv_4 (member grp_1 only) | 1      | grp_1: 8, grp_2: 0   | own ✓       | ✗ (member)   | ✓ self-join grp_2 | manage grp_1 ✗, update others ✗ |

## Validation

- `npm run lint` ✅
- `npx tsc --noEmit` ✅
- `npm run build` — pending (run at final step sign-off)

## Limitations

- No live Supabase project in this repository — migrations 2-3 are reviewed
  only; RLS verification is a documented procedure, not executed here.
- All race/season content is seeded by a future migration; repositories that
  touch races/seasons fall back to mock data in the current deployable state.
- Client components (`'use client'`) remain on mock-data imports for identity
  resolution — they cannot call server-side repositories.
- `driverStandingRowData` / `teamStandingRowData` return "Unknown" names in DB
  mode; deferred to Step 4 (async identity resolver).
- `src/types/database.ts` remains hand-maintained (can be replaced with
  `supabase gen types` output later).
