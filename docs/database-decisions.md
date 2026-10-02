# Karting Laravel — Phase 3: Database Design

**Phase:** 3 of 12
**Status:** Complete
**Date:** 2026-09-18

---

## 1. Overview

The Supabase/PostgreSQL schema (`supabase/migrations/202609160001_initial_schema.sql` + 002/003/004) was translated to Laravel migrations. All 18 domain tables map 1:1 with the source, preserving column names (snake_case), default values, nullability, foreign-key cascades, composite primary keys and index coverage.

Source of truth for column semantics: `src/types/database.ts` and the initial-schema migration. Documented deviations are listed in §6.

## 2. Table Inventory (18 domain tables + 3 Laravel defaults)

| # | Laravel migration | Table | Source matches |
|---|---|---|---|
| 1 | `..._000000_create_users_table` | `users` | ← Laravel default (replaces `auth.users`) |
| 2 | `..._000001_create_profiles_table` | `profiles` | ✅ 1:1 with users |
| 3 | `..._000002_create_drivers_table` | `drivers` | ✅ 1:1 with profiles |
| 4 | `..._000003_create_groups_table` | `groups` | ✅ |
| 5 | `..._000004_create_group_members_table` | `group_members` | ✅ composite PK `(group_id, driver_id)` |
| 6 | `..._000005_create_teams_table` | `teams` | ✅ |
| 7 | `..._000006_create_team_members_table` | `team_members` | ✅ composite PK `(team_id, driver_id)` |
| 8 | `..._000007_create_races_table` | `races` | ✅ |
| 9 | `..._000008_create_race_entries_table` | `race_entries` | ✅ composite PK `(race_id, driver_id)` |
| 10 | `..._000009_create_qualifying_attempts_table` | `qualifying_attempts` | ✅ (V1 unused, mirrors source) |
| 11 | `..._000010_create_race_penalties_table` | `race_penalties` | ✅ |
| 12 | `..._000011_create_race_events_table` | `race_events` | ✅ + JSON payload |
| 13 | `..._000012_create_seasons_table` | `seasons` | ✅ |
| 14 | `..._000013_create_season_races_table` | `season_races` | ✅ composite PK + unique round |
| 15 | `..._000014_create_season_scoring_table` | `season_scoring` | ✅ 1:1 with seasons |
| 16 | `..._000015_create_scoring_points_table` | `scoring_points` | ✅ unique `(season_id, position)` |
| 17 | `..._000016_create_awards_table` | `awards` | ✅ |
| 18 | `..._000017_create_race_awards_table` | `race_awards` | ✅ 1:1 with races |
| 19 | `..._000018_create_season_records_table` | `season_records` | ✅ |

Plus Laravel-default `password_reset_tokens`, `sessions`, `cache`, `jobs`.

## 3. Key Design Decisions

### 3.1 Auto-increment BIGINT PKs (not UUIDs)
The source uses UUID PKs generated client-side (`gen_random_uuid()`), with `profiles.id = auth.users.id`. Laravel replaces that with:

| Source | Laravel |
|--------|---------|
| `auth.users.id` (uuid) | `users.id` (bigint auto) — Laravel default |
| `profiles.id` (uuid, = user id) | `profiles.id` (bigint auto) + `user_id` unique FK |
| `drivers.profile_id` (uuid) | `drivers.profile_id` bigint FK, unique |

**Rationale:** Keeps Laravel auth/Breeze untouched (its `foreignId`/`session.user_id` expects `users.id` bigint), is MySQL-optimal, and avoids hand-rolling UUID generation. The 1:1 chains `users → profiles → drivers` are preserved by unique foreign keys. Mock ids (`drv_1`, `rc_8`, …) are **not stored** — they're documentation-only; Laravel references resolved via nickname/name lookups in seeders.

### 3.2 String columns + PHP backed enums (not native enums)
All status/role/format fields are **string columns** (MySQL `VARCHAR`, matching the source's `text` + CHECK) surfaced through **PHP backed enums** in `app/Enums/`:

- `RaceStatus`, `RaceFormat`, `RaceDriverStatus`, `QualifyingStatus`
- `RacePenaltyStatus`, `RaceEventType` (23 cases), `SeasonStatus`, `ScoringMode`
- `AwardType`, `GroupRole`, `GroupPrivacy`, `DriverAvailability`

**Rationale:** MySQL `ENUM` is a known anti-pattern; PHP enums give type safety + strict validation without DB rebuilds. The DB stays SQLite (dev/test) and MySQL (prod) compatible with identical syntax.

### 3.3 Enum-backed model casts
Each model's `casts()` maps its enum-ish columns, e.g. `Race::status` → `RaceStatus::class`, `RaceEntry::qualifying_status` → `QualifyingStatus::class`. Values read back as enums; comparisons/`match()` in services use `->value` semantics transparently.

### 3.4 Composite PKs preserved
`group_members`, `team_members`, `race_entries`, `season_races` keep their composite primary keys exactly as the source defines. Eloquent models on top (`RaceEntry`) use `$timestamps = false` and are keyed via explicit `belongsTo`/`belongsToMany` — no route-model binding dependency on a surrogate key. Pivot-only tables use `belongsToMany(...)->withPivot(...)`.

### 3.5 Derived data stays computed (not stored)
Per the source schema comments, these remain **derived in the app layer** and are NOT columns:
- Driver stats / badges / recent form → computed from `race_entries` + `race_penalties`
- Group previews (upcoming race, recent results, current championship)
- `Race.participatingDriverIds`, `Season.raceIds`, `Team.memberIds`
- Championship standings & results → service layer (Phase 8)

### 3.6 Cascades & nullability (mirrors source)
| FK | Behavior |
|----|----------|
| `profiles.user_id` | cascade delete |
| `drivers.profile_id` | cascade delete |
| `group_members`, `team_members`, `race_entries`, `seasons.*`, `season_races`, `season_scoring`, `scoring_points`, `awards.season_id`, `race_awards.race_id`, `season_records.season_id` | cascade delete |
| `groups.created_by`, `awards.{driver_id,team_id,race_id}`, `race_events.driver_id` | null on delete |
| `races.organizer_id`, `race_penalties.issued_by` | restrict (no action) |

### 3.7 Check constraints omitted in favor of app validation
The source's CHECK constraints (e.g. `racing_number BETWEEN 1 AND 999`, `seconds >= 0`) are enforced by **Form Requests / service-layer validation** and unsigned column types. Keeps migration files portable across SQLite + MySQL Lua without raw statements. (Documented in §6.)

## 4. Relationship Map

```
users           1:1→ profiles           1:1→ drivers
                    │                        │
                    │              ┌─────────┼──────────┐
                    │        belongsToMany   │   belongsToMany
                    │         (group_members)│   (team_members)
                    │              ▼         ▼           ▼
                    │           groups    teams        races ── organizers
                    │              │         │            │
                    │              └──teams──┘            ├ entries (race_entries)
                    │              └──races──┐            ├ penalties, events, attempts
                    │              └──seasons─┼─ scoring ─┴ race_awards
                    │                          ├ awards ── team/driver/race
                    │                          └ records
```

Key Eloquent relations:
- `User::profile()`, `Profile::driver()`, `Driver::profile()`
- `Group::members()` (belongsToMany via `group_members`, pivot role/availability/joined_at)
- `Team::members()`, `Driver::teams()`
- `Race::drivers()` (belongsToMany via `race_entries` with full pivot), `Race::entries()`
- `Race::organizer()`, `Role::penalties()`, `Driver::penalties()`, `Driver::issuedPenalties()`
- `Season::races()` (belongsToMany via `season_races` with pivot round_number), `Season::scoring()`, `Season::scoringPoints()`, `Season::awards()`, `Season::records()`
- `RaceAward::driverOfRace()`, `RaceAward::mostImproved()`, `RaceAward::cleanestDriver()`

## 5. Models, Factories, Seeders

### Models (factory-enabled where meaningful)
`User` (Laravel), `Profile`, `Driver`, `Group`, `Team`, `Race`, `RaceEntry`, `QualifyingAttempt`, `RacePenalty`, `RaceEvent`, `Season`, `SeasonScoring`, `ScoringPoint`, `Award`, `RaceAward`, `SeasonRecord`.

### Factories
`UserFactory`, `ProfileFactory`, `DriverFactory`, `GroupFactory`, `TeamFactory`, `RaceFactory`, `SeasonFactory`, `RacePenaltyFactory`.

### Seeders (mirror Supabase 003 + 004 exactly)
`DemoDataSeeder` — 8 users (`demo@karting.app` / `karting-demo-2026` = Bilal Darji / BD / kart 7 / admin of Karting Crew; others `not-used`), 8 profiles/drivers, 2 groups, 14 memberships, 3 teams + 7 team members.

`ChampionshipContentSeeder` — Crew Championship 2026 (active, automatic scoring 25/18/15/12/10/8/6/4 + 1 pole), 5 races (rounds 1–3 completed with 8/8/7 entries, rounds 4–5 draft), 23 total entries, 2 penalties, 3 race awards, 5 season awards, 3 season records, 8 scoring points.

`DatabaseSeeder` calls both. All seeder inserts are idempotent (`firstOrCreate`), so `migrate:fresh --seed` and repeated `db:seed` are safe.

## 6. Documented Deviations from Source Schema

| # | Source | Laravel | Reason |
|---|--------|---------|--------|
| 1 | UUID PKs everywhere | BIGINT auto PKs | Laravel-native, MySQL-optimal, keeps Breeze auth untouched |
| 2 | `profiles.id = auth.users.id` | `profiles.id` + unique `user_id` FK | 1:1 semantics preserved without coupling PKs |
| 3 | Native PostgreSQL CHECKs | unsigned columns + app validation | DB-portable, validation lives in Form Requests/services |
| 4 | `timestamptz` (PG) | Laravel `timestamps()` | DateTime-converted by Eloquent casts |
| 5 | `race_events.payload jsonb` | JSON column | `'array'` cast on `RaceEvent::payload` |
| 6 | string `text` for enum-like fields + table CHECK | string columns + PHP enums | see §3.2 |
| 7 | `teams`, `seasons`, `awards`, `season_records`, `race_penalties`, `season_scoring` had only `created_at` (or `updated_at`) | added both timestamps | Eloquent convention; harmless, documented |
| 8 | `group_members.joined_at`, `race_entries` (no created flags), `scoring_points`, `qualifying_attempts.recorded_at`, `race_events.occurred_at`, `season_races` | kept as source (`$timestamps = false` on models) | fidelity to source semantics |
| 9 | RLS policies | Laravel Policies (Phase 4/5) | RLS is Postgres-only; policies/gates replace it |
| 10 | SECURITY DEFINER `group_role`/`can_manage_group` helpers | service methods + policies | N/A in MySQL |

## 7. Verification Performed

| Check | Command | Result |
|-------|---------|--------|
| Migrations (fresh) | `php artisan migrate:fresh` | 21/21 ✅ |
| Seeders | `php artisan db:seed` | ✅ idempotent (run twice) |
| Data counts | tinker script | 8/8/8 users/profiles/drivers, 2 groups, 14 memberships, 3 teams, 7 team members, 1 season, 5 races, 23 entries, 2 penalties, 3 race awards, 5 awards, 3 records, 8 scoring points |
| Domain mapping | tinker | demo@karting.app → BD, kart 7, rating 1842, admin of Karting Crew; Opening Sprint entry: pos 1, finished, 41750ms |
| Test suite | `php artisan test` | 25 passed |

## 8. Deprecation Notes for the Next.js Codebase

The source schema/mock system remains untouched; the Laravel DB is a new parallel world. No changes were made to `karting-app/`.