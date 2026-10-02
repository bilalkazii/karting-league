# Phase 5d — Championships & Seasons

Status: **Complete** · 2026-09-18

Ports the source app's championship area (`src/app/(app)/championship/page.tsx`, `/seasons/new`, championship header/status/scoring components) into the Laravel app, replacing the `/championship` placeholder route with a real season (championship) listing, detail page, and full season CRUD with group-based authorization.

## Entity mapping

In the source app **a "championship" is a Season** — the `championship` page renders the active season of the driver's group, and `seasons`/`season_scoring`/`scoring_points`/`season_races` are the only championship tables. There is **no separate `championships` table**, so the Laravel `seasons` table is the single championship entity. No schema additions were made; all features run on the existing Phase-2 tables.

## Features implemented

1. **Championship index** — `GET /championship`
   - Lists every season the signed-in user can see across the groups they belong to (group name, status badge, date range, race count).
   - Server-side search (`?q=`) on season name and status filter (`?status=`), matching the group index pattern.
   - Empty state prompts a new season; seasons the user administers show a "Manage season" affordance.
   - Replaces the `Route::view('/championship', 'feature-placeholder')` placeholder. `GET /seasons` (`seasons.index`) renders the same index.

2. **Season detail** — `GET /championship/{season}` (also `GET /seasons/{season}` as `seasons.show`)
   - Header card mirroring the source `ChampionshipHeader` (letter block, name, status badge, group, date range, "X of Y races run") but **no invented leader/points figures**.
   - Rounds list: round number, race name, date, venue, real status badge, winner (from `race_entries.finish_position = 1`), entry count.
   - Upcoming-race callout (first race with a pre-completed status dated today or later — same rule as `GroupController@show`).
   - Participating drivers (distinct drivers with entries across the season's races, computed from real `race_entries`).
   - Scoring rules card (mode, pole/fastest-lap/participation/DNF/DNS points, penalty toggle, points-per-position grid) — rendered only when `season_scoring` exists.
   - Season records and awards sections — rendered only when rows exist.
   - Explicitly does **not** display standings; standings are a Phase 5e/5f concern and any rendered table would be fake.

3. **Season creation** — `GET /seasons/new`, `POST /seasons`
   - Only groups the user administers (admin/organizer pivot role) are offered in the group selector; creating for a foreign group is rejected with 403 by `SeasonPolicy@create`.
   - New seasons get the standard automatic scoring config (pole +1, positions 1–8 → 25/18/15/12/10/8/6/4), matching the seeder's `DEFAULT_CHAMPIONSHIP_SCORING` values.

4. **Season editing** — `GET /seasons/{season}/edit`, `PATCH /seasons/{season}`
   - Name, status, start/end dates. **Group is fixed** — a season can never be moved to another group, preserving `season_races` integrity.
   - Status transitions are enforced at validation time:
     `draft → {active, completed}`, `active → {completed, archived}`, `completed → {archived}`, `archived → {}`.
   - Only one **active** season per group (`seasons`/`season_scoring` readers assume a single active season — matches the source `getActiveSeason` `maybeSingle`).

5. **Season deletion** — `DELETE /seasons/{season}`
   - Organizer-only; removes the season and its dependent rows (`season_scoring`, `scoring_points`, `season_races` links, `awards`, `records`) via FK cascades. The races themselves are **kept** (they belong to the group, not the season).

## Routes added

| Method | URI | Name | Controller |
| --- | --- | --- | --- |
| GET | `/championship` | `championship` | `SeasonController@index` |
| GET | `/championship/{season}` | `championship.show` | `SeasonController@show` |
| GET | `/seasons` | `seasons` | `SeasonController@index` |
| GET | `/seasons/new` | `seasons.new` | `SeasonController@create` |
| POST | `/seasons` | `seasons.store` | `SeasonController@store` |
| GET | `/seasons/{season}` | `seasons.show` | `SeasonController@show` |
| GET | `/seasons/{season}/edit` | `seasons.edit` | `SeasonController@edit` |
| PATCH | `/seasons/{season}` | `seasons.update` | `SeasonController@update` |
| DELETE | `/seasons/{season}` | `seasons.destroy` | `SeasonController@destroy` |

All inside the existing `Route::middleware('auth')` group. `championship.*` and `seasons.*` are aliases over the same controller/views because they model the same entity.

## Authorization rules

- `SeasonPolicy` (registered in `AuthServiceProvider`):
  - `view` — the user's driver is a member of the season's group.
  - `create` — the group's admin/organizer (delegates to `GroupPolicy@update`).
  - `update` / `delete` — admin/organizer of the season's group.
- Guests are redirected to login by auth middleware.

## Validations and business rules

- `StoreSeasonRequest`: `group_id` must exist; `name` required within the group (duplicate season names in the same group rejected); `status` in the enum; `end_date` must be on/after `start_date`; a group may not have two active seasons.
- `UpdateSeasonRequest`: same field rules with the group's name-uniqueness ignoring the season itself; status changes must follow the transition map; becoming active is rejected while another season in the group is active.
- Details check happens even when the payload is otherwise valid, so `SessionHasErrors` assertions are stable.

## Database assumptions

- No new migration — reuses `seasons`, `season_races`, `season_scoring`, `scoring_points`, `awards`, `race_awards`, `season_records`, `races`, `race_entries`, `groups`, `group_members`.
- Seeder remains idempotent; nothing in Phase 5d touches seed data.

## Files created

- `app/Http/Controllers/SeasonController.php`
- `app/Http/Requests/StoreSeasonRequest.php`
- `app/Http/Requests/UpdateSeasonRequest.php`
- `app/Policies/SeasonPolicy.php`
- `resources/views/championship/index.blade.php`
- `resources/views/championship/show.blade.php`
- `resources/views/seasons/create.blade.php`
- `resources/views/seasons/edit.blade.php`
- `resources/views/components/season-card.blade.php`
- `resources/views/components/season-status-badge.blade.php`
- `resources/views/components/scoring-rules-card.blade.php`
- `tests/Feature/SeasonsTest.php`

## Files modified

- `app/Providers/AuthServiceProvider.php` — registered `SeasonPolicy`.
- `routes/web.php` — replaced `/championship` placeholder; added season CRUD routes.

## Tests executed — exact results

- `php artisan test --filter=SeasonsTest` → **32 passed, 90 assertions** (guest redirects, member index/detail, foreign-group privacy, status + search filters, managed-group create form, store + default scoring, organizer/foreign-group 403s, validation failures for missing name / duplicate name / inverted dates / invalid status / second active season, edit 403 for non-organizer, rename + group-preserve updates, valid & invalid status transitions, one-active-season guard both directions, cascade delete keeping races, destroy 403).
- `php artisan test` (full suite) → **90 passed, 253 assertions**.
- `php -l` on all new PHP files → no syntax errors.
- `php vendor/bin/pint` on this phase's files → applied (unused imports, whitespace).
- `php artisan view:cache` → all Blade templates compile.
- No asset changes; `npm run build` not required this phase.

## Pint note

`php vendor/bin/pint --test` repo-wide still reports pre-existing style fixes in files written before Phase 5c; Pint was applied only to Phase 5d files. A whole-repo `pint` run remains a separate cleanup task.

## Known limitations

- Standings, team standings, season records editing, and award management are not part of this phase — the detail page only **reads** the persisted records/awards/scoring tables (and only renders those sections when data exists).
- Season editing cannot move a season between groups (preserves `season_races` integrity); creation targets the groups the organizer belongs to.
- `championship.show` and `seasons.show` are aliases of the same view; there is only one detail template.