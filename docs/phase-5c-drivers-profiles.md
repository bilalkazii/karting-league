# Phase 5c — Drivers & Profiles

Status: **Complete** · 2026-09-18

Ports the driver-facing parts of the source app (`src/app/(app)/drivers/[driverId]/page.tsx`, driver card/stat UI, member-card drivers) into the Laravel app, adds a global driver listing, and adds authenticated self-service profile editing.

## Features implemented

1. **Driver listing** — `GET /drivers`
   - Lists all drivers ordered by rating (desc), paginated (12/page).
   - Shows avatar (initials), full name, nickname, kart number, rating badge.
   - Group/team chips are **only shown when the viewer shares that group** (privacy rule).
   - Server-side search on full name or nickname via `?q=`.
   - Custom dark-themed pagination control; empty state for no results.

2. **Driver profile** — `GET /drivers/{driver}`
   - Header: avatar, full name, `#kart`, nickname, rating badge; "Edit profile" action for the owner.
   - Stats computed only from existing persisted data (no invented figures):
     - Starts (entries with a finish position), Wins, Podiums, Poles, DNFs.
     - Clean races (finishes with zero entry penalty seconds).
     - Best qualifying lap (min `qualifying_time_ms`) and average qualifying lap.
     - Penalty calls and total penalty seconds from issued `race_penalties`.
   - Recent form strip derived from the last 6 entries.
   - Recent results table (race, venue, date, grid, finish, entry penalty).
   - **Groups & teams visible only when shared with the viewer** (all shown to the owner); driver's per-group availability shown via pivot.
   - Championship participation: distinct seasons the driver has entered, with rounds entered (computed from real `season_races` links).

3. **Profile editing** — `GET/PATCH /drivers/{driver}/edit`
   - Only the owning user can edit (route + controller + FormRequest authorization).
   - Editable fields (all existing columns — no migration needed): `profiles.full_name`, `drivers.nickname`, `drivers.racing_number`, `drivers.avatar_color`, `drivers.avatar_text_color`.
   - Nickname stored uppercased; blank optional fields are cleared to `null`.
   - Success flash + field-level validation messages.

## Routes added

| Method | URI | Name | Controller |
| --- | --- | --- | --- |
| GET | `/drivers` | `drivers` | `DriverController@index` |
| GET | `/drivers/{driver}` | `drivers.show` | `DriverController@show` |
| GET | `/drivers/{driver}/edit` | `drivers.edit` | `DriverController@edit` |
| PATCH | `/drivers/{driver}` | `drivers.update` | `DriverController@update` |

All are inside the existing `Route::middleware('auth')` group. `GET /profile` (name `profile`) still redirects to the signed-in user's own `drivers.show`.

> **Route rename:** the previous route name `profile.show` for `GET /drivers/{driver}` became `drivers.show` to avoid a naming collision with Breeze's `profile.edit`/`profile.update` (used by `/account`). References in `routes/web.php`, `components/sidebar.blade.php`, and `components/member-card.blade.php` were updated.

## Authorization rules

- `DriverPolicy` (registered in `AuthServiceProvider`):
  - `viewAny` — user has a driver identity.
  - `view` — authenticated user has a driver identity (pages are auth-gated by middleware).
  - `update` — `user.driver.id === driver.id`.
- Guests are redirected to login by the auth middleware for all four routes.
- Group-private info (groups/teams/availability/role) is only rendered when the viewer is a member of the same group; a non-member viewing a driver profile or listing never sees that driver's foreign group membership.

## Database assumptions

- No new migration. Uses existing `profiles`, `drivers`, `groups`, `group_members`, `teams`, `team_members`, `race_entries`, `race_penalties`, `races`, `seasons`, `season_races`.
- "Championship participation" is derived: driver has ≥1 entry in a race linked to a season through `season_races`.
- DNFs counted from `race_entries.status = 'dnf'`; penalties counted from `race_penalties.status != 'cancelled'`.
- Availability shown is the driver's own `group_members.availability` pivot for shared groups.

## Files created

- `app/Http/Requests/UpdateDriverProfileRequest.php`
- `app/Policies/DriverPolicy.php`
- `resources/views/drivers/index.blade.php`
- `resources/views/drivers/edit.blade.php`
- `resources/views/components/driver-card.blade.php`
- `resources/views/components/driver-stat-card.blade.php`
- `resources/views/components/availability-badge.blade.php`
- `tests/Feature/DriversTest.php`

## Files modified

- `app/Http/Controllers/DriverController.php` — added `index`, `edit`, `update`; rewrote `show` with computed stats, shared-group visibility, form, championships.
- `app/Providers/AuthServiceProvider.php` — registered `DriverPolicy`.
- `routes/web.php` — added driver routes; renamed `profile.show` → `drivers.show`.
- `resources/views/drivers/profile.blade.php` — enhanced stat grid, form strip, groups/teams, championships, edit action.
- `resources/views/components/sidebar.blade.php` — `route('drivers.show', $driver)`.
- `resources/views/components/member-card.blade.php` — `route('drivers.show', $member)`.

## Tests executed — exact results

- `php artisan test --filter=DriversTest` → **18 passed, 51 assertions** (rates, listing access, guest redirects, search filter, foreign-group privacy on index + profile, shared-group visibility, owner edit with uppercase nickname, blank-field preserve, 403 non-owner edit/update, validation failures for full_name / racing_number / avatar_color, relationship-loaded data rendered).
- `php artisan test` (full suite) → **58 passed, 163 assertions**.
- `php vendor/bin/pint --test` (this phase's files) → passed.
- `php artisan view:cache` → all Blade templates compile.
- `npm run build` → OK (no asset changes this phase).

## Pint note

`php vendor/bin/pint --test` across the whole repo still reports pre-existing style fixes in files written before this phase (migrations, seeders, factories, enums, earlier controllers). Pint was applied only to files created/modified in Phase 5c; a repo-wide `pint` run is a separate cleanup task, not included here to avoid an unrelated diff.

## Known limitations

- Driver index lists every driver in the app (they opted in by having a driver identity); group affiliations are the only obscured data. A stricter "direct connections only" model is possible later.
- Fastest-lap, badge, streaks, and compare/share features from the source app are **not** implemented because the current schema has no `fastest_lap`/`badges` data and those stats would be invented.
- Driver profile "Edit profile" button only appears on the owner's own profile.
- Avatar color text input is mirrored (read-only) next to the native color picker for hex clarity.
- Search uses simple `LIKE`; no pagination-sidebar/page-number jump control (prev/next + count only).