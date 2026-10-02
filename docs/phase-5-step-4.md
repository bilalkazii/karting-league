# Phase 5 Step 4 — DB-Mode Championship Identity Resolution

## Scope

Fix the DB-mode name-resolution gap in the championship read path (standings rows,
team cards, awards, records, leader, race-result winner/pole) so driver and team
names resolve from the persistence layer via a single view-builder instead of
sync mock helpers, then review migration readiness and prepare the live-Supabase
execution procedure. The mock system and the deterministic computation layer are
untouched; presentation components are not modified.

## Checkpoint A — Gap analysis

In DB mode (uuid-based ids), the championship + season pages rendered "Unknown"
for every name because identity lookups went through sync mock helpers:

| surface | pre-fix lookup | failure mode |
|---------|----------------|--------------|
| `driverStandingRowData` | `getDriverById` (mock) | uuid id → `undefined` → "Unknown" |
| `teamStandingRowData` | `getTeamById` (mock) | uuid id → `undefined` → "Unknown" |
| `seasons/[seasonId]` race results (winner/pole) | `getDriverById` (mock) | "Unknown" |
| `seasons/[seasonId]` records, awards | `getDriverById` / `getTeamById` (mock) | "Unknown" |
| `championship` records | `getDriverById` (mock) | "Unknown" |
| group name | `getGroupById` (mock) | "Unknown" |

Identity is stored as: driver names = `drivers.nickname` + `profiles.full_name`
(joined by `fetchDriversByIds`/`mapDriverRow`); team names = `teams` (`mapTeamRow`);
team member names = `team_members` + drivers. Existing repos (`getDriversByIds`,
`getTeamById`) were insufficient: there was no bulk team lookup and no single
entry point producing all identities a championship/season page needs.

Rule honoured throughout: **never mask a missing DB row with a mock name** —
missing rows resolve to the neutral "Unknown" label via `?? null` resolvers.

## Checkpoint B — Fix

New/modified files:

- `src/lib/repositories/teams.ts` — added `getTeamsByIds(ids: string[])`:
  bulk order-preserving team lookup; DB path resolves `memberIds` via
  `team_members` scoped to the team's group; mock fallback maps `getMockTeamById`.

- `src/lib/championship-data.ts` — `driverStandingRowData(standings, resolveDriver?)`
  and `teamStandingRowData(stats, resolveTeam?)` now accept an optional resolver
  closure. When omitted the sync mock helpers are used, so mock behavior is
  byte-identical to before.

- `src/lib/repositories/championship.ts` — new `SeasonIdentityBundle` interface and
  `resolveSeasonIdentities(season, driverIds, teamIds)` view-builder using
  `Promise.all([getGroupById, getDriversByIds, getTeamsByIds])` (deduped via
  `Set`); team member names resolved with a second deduped `getDriversByIds`
  call over `memberIds`. The bundle exposes:

  ```
  { group: Group | null; driverById: Map<string, Driver>; teamById: Map<string, Team>; teamMemberNamesById: Map<string, string[]> }
  ```

- `src/app/(app)/championship/page.tsx` — dropped mock imports; one call to
  `resolveSeasonIdentities` (driverIds from standings/awards/records, teamIds from
  teamStats/awards); `driverRows`, `leaderDriver`, `teamRows`, `awardItems`,
  records and team cards read from the bundle. Missing rows → the existing
  neutral UI labels.

- `src/app/(app)/seasons/[seasonId]/page.tsx` — same treatment: `resolveSeasonIdentities`
  also receives race-result winner/pole driver ids; group name, leader, driver/team
  standing rows, team member names, race results, records and awards all read from
  the bundle. Mock imports removed.

Mock-path parity is preserved end-to-end: when Supabase is unconfigured each
repository call falls back to mock data, so both pages render exactly as before.

## Checkpoint C — Migration readiness review

Reviewed in order, no changes required:

**`202609160001_initial_schema.sql`** — `begin/commit`, `create table if not exists`,
all RLS enabled with zero policies (deny-by-default). FKs reference `public`
tables and `auth.users` only. Indexes cover every non-PK/unique FK column. No
destructive statements.

**`202609160002_group_membership_rls.sql`** — `create or replace function` helpers
pinned to `set search_path = public`, `security definer` (owner = migration runner)
so no RLS recursion; `revoke` public execute + `grant` to `authenticated`;
`create policy` per table. Self-contained; depends only on 001 + `auth.uid()`.
Not idempotent for policy re-runs — expected (migrations run once, in order).

**`202609160003_seed_demo_data.sql`** — topological FK order: `auth.users` →
`profiles` → `drivers` → `groups` → `group_members` → `teams` → `team_members`.
Idempotent (`create extension if not exists`, `on conflict ... do nothing`,
`drop function if exists` for its own helper). `pgcrypto` resolves via the default
`public, extensions` search_path. Deterministic `md5('karting-v1:'||kind||':'||mock_id)::uuid`
ids documented in the header. Destructive statements: none; it drops only its own
helper function. Note: identity is seeded; race/season content intentionally stays
for a later content-seed migration.

Cross-check: 002's group-scope helpers (`group_role`/`can_manage_group`/`*_group_member`)
are exactly what `resolveSeasonIdentities` relies on via the repositories'
PostgREST queries (RLS filters rows to caller's groups).

## Checkpoint D — Live Supabase execution (PASSED with limits)

Executed against project `psqhquqvjjsylxyjbrhi` on 2026-09-16; full results in
`docs/phase-5-step-4-live-verification.md`. Migration 003 required one
execution-error fix (`extensions.crypt`/`extensions.gen_salt` schema-qualified
because pgcrypto lives in the `extensions` schema, which the migration runner's
search path omits). Schema, RLS, policies, helpers, anon deny-by-default, and
seed idempotency all verified live. Season/standings rendering from live DB rows
remains pending a content-seed migration.

The exact procedure followed (CLI install/link, `db push`, RLS access-matrix run,
seed idempotency, app route checks, static validation) is recorded in
`docs/phase-5-step-4-live-verification.md`.

## Checkpoint E — Validation

- `npm run lint` ✅
- `npx tsc --noEmit` ✅
- `npm run build` ✅ (16/16 routes generated)

Tests: this project has no test runner (no vitest/jest/playwright; `package.json`
scripts are dev/build/start/lint only) and no `src/**/*.{test,spec}` files, so no
unit tests are added in this step.

## Limitations

- Live Supabase verification: schema/RLS/seed executed and PASSED on
  `psqhquqvjjsylxyjbrhi` (see `docs/phase-5-step-4-live-verification.md`).
  Live season/standings rendering from DB rows still awaits a content-seed
  migration.
- Race/season content is not seeded yet, so the DB path cannot be exercised
  end-to-end in the deployed state; repository DB reads fall back to mock data
  while env vars are absent.
- Client components (`'use client'`) still import mock identity helpers — they
  cannot call server-side repositories; their presentation remains mock-backed.
- Missing DB rows resolve to neutral "Unknown" labels by design (never masked
  with mock names).