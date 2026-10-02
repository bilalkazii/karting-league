# Phase 5e — Races Pipeline: Audit (Phase 1)

Status: **Audit complete** · 2026-09-18

This document audits the source app's race feature so the Laravel port (Phase 5e) can mirror the behavior faithfully. It records the source data model, state machine, business rules, and the exact mapping to the existing Laravel schema (Phase 2 migrations). No DB changes are expected unless a genuine gap is found.

## 1. Source feature map

Source routes (Next.js):

| Route | Purpose |
| --- | --- |
| `/races` | Race index for the signed-in driver (races across their groups) |
| `/races/new` | Race creation form (name, venue, date, time, format, group) |
| `/races/[raceId]` | Race detail "overview" (facts, field summary, session log, next action) |
| `/races/[raceId]/setup` | Choose the field (group members) + assign kart numbers |
| `/races/[raceId]/lobby` | Confirm / decline / ready toggle per driver + session log |
| `/races/[raceId]/qualifying` | Manual stopwatch, lap entry, invalidate/restore/clear, manual time editor |
| `/races/[raceId]/grid` | Grid table (auto-sort by quali + penalties, manual overrides), lock grid |
| `/races/[raceId]/control` | Live race control (finish/DNF/DNS/retired/withdrawn), penalty manager |
| `/races/[raceId]/results` | Winner card, podium, official results table, CSV/share (read-only) |

Source files read this phase (all under `src/`):
- `app/(app)/races/page.tsx`, `app/(app)/races/new/page.tsx`
- `app/(app)/races/[raceId]/page.tsx` + `{setup,lobby,qualifying,grid,control,results}/page.tsx`
- `components/races/*` (20 files) — race-provider (state machine), race-tabs, race-actions, race-status-badge, race-card, race-header, race-event-list, race-control-driver-row, grid-table, results-table, result-row, result-status-badge, results-header, winner-card, podium-card, race-summary-card, manual-time-editor, demo-notice (and qualifying-timer / pending-op-dialog noted, stopwatch UI)
- `lib/race-utils.ts`, `lib/championship-utils.ts`, `lib/championship-data.ts` (deterministic logic to port)
- `lib/repositories/races.ts`, `lib/mock-data.ts` (getRacesForUser, getRaceDrivers, getGroupMembers)
- `types/race.ts`, `types/championship.ts`

## 2. Source entity model (matches Laravel schema already)

| Source type | Fields | Laravel mapping |
| --- | --- | --- |
| `Race` | id, groupId, name, venueName, date, startTime, format, status, organizerId, qualifyingLapCount, rules, participatingDriverIds (derived), createdAt, updatedAt | `races` table — all present |
| `RaceDriver` (= entry) | raceId, driverId, kartNumber, status, confirmed, ready, gridPosition, gridPenaltySeconds, qualifyingTimeMs, qualifyingStatus, finishPosition, penaltyTotalSeconds, notes | `race_entries` table — all present, COMPOSITE PK (race_id, driver_id) |
| `RacePenalty` | id, raceId, driverId, seconds, reason, issuedBy, status, createdAt | `race_penalties` table |
| `RaceEvent` | id, raceId, driverId (nullable), type, timestamp, metadata | `race_events` table (payload json) |
| `QualifyingAttempt` | driverId, officialTimeMs, status, kartNumber, gridPosition | `qualifying_attempts` table exists, unused in source UI v1 |
| (season link) | — | `season_races` (season_id, race_id, round_number) |
| (scoring) | season.scoring | `season_scoring` + `scoring_points` |

**Conclusion: no schema gap.** The Phase-2 migrations cover races, race_entries, qualifying_attempts, race_penalties, race_events, six race-related tables, all enums, and the season pivot. `participatingDriverIds` is derived from `race_entries` rows, not stored.

## 3. Enums (already in `app/Enums/`)

- `RaceStatus`: draft, lobby, qualifying, grid, racing, completed, cancelled
- `RaceFormat`: sprint, feature, custom
- `RaceDriverStatus`: invited, confirmed, declined, ready, racing, finished, dnf, dns, retired, withdrawn
- `QualifyingStatus`: not_started, running, completed, invalid, manually_corrected
- `RacePenaltyStatus`: issued, under_review, cancelled
- `RaceEventType`: 23 cases (qualifying_start/stop/invalid/restore/reset/corrected/replace/promoted, ready, not_ready, race_start, race_finish, dnf, dns, retired, withdrawn, penalty, penalty_cancelled, grid_change, grid_penalty, complete, note, status_change)

## 4. State machine (source `race-provider.ts` reducer)

Transitions with guards (`setStatus` has no guard but each action checks the current status):

| From | Action | To | Guard / notes |
| --- | --- | --- | --- |
| draft | `setStatus lobby` (Open lobby) | lobby | — |
| lobby | `start_qualifying` | qualifying | race.status === 'lobby'; emits `qualifying_start` |
| — | `toggle_confirmed` | — | confirmed ⇄ (ready=false, status=invited) when unconfirming; emitting confirmed→status confirmed |
| — | `toggle_ready` | — | only if confirmed; ready ⇄ status ready/confirmed, emits ready/not_ready |
| qualifying | `lock_grid` | grid | stores auto gridPosition from computeGridRows; emits status_change |
| grid | `start_race` | racing | sets racers (confirmed && ready) to status racing; emits race_start |
| racing | `finish_driver` / `set_driver_status` | finished/DNF/DNS/retired/withdrawn | assigning finishPosition via a running finish counter; emits matching event |
| racing | `complete_race` | completed | also allowed from grid; preserves DNF/DNS/retired/withdrawn; emits `complete` |
| completed | `setStatus` | cancelled (source UI has a cancel affordance) | — |

Additional allowed `setStatus` usage in source: draft→lobby→qualifying normally flows through the dedicated actions, but the reducer exposes a generic `setStatus` used for "cancel race" (completed→cancelled) in the UI footer. The Laravel port should encode: `draft→lobby`, `lobby→qualifying`, `qualifying→grid`, `grid→racing`, `racing/grid→completed`, `completed→cancelled` (cancel), plus generic guardless status change recorded as `status_change` event.

**Grid computation (computeGridRows)**: base order = qualifyingRows (valid-time drivers sorted asc, then invalid-time sorted asc, then no-time with confirmed first). Adjusted = same list sorted by (validTime + gridPenaltySeconds*1000, Infinity last). Display position = manual `gridPosition` if set, else adjusted index+1. Original position = base index+1.

**buildFinalResults** (results/standings ordering): rank = finished 0, dnf 1, retired 2, withdrawn 3, dns 4, racing/ready/confirmed/invited/declined 5+. Sort by rank, then finishPosition ?? 999, then gridPosition ?? 999. Finished drivers without a position get sequential positions from a counter.

## 5. Deterministic logic to port into Laravel services/utils

### 5.1 Race-time utils (from `race-utils.ts`)
- `formatLapTime(ms)` → `M:SS.mmm` (minutes omitted if 0), `—` for null/negative.
- `formatStopwatchMs(ms)` → `SS.mmm` / `M:SS.mmm`.
- `formatPenaltySeconds(s)` → `+Ns`.
- `parseLapTime(input)` → ms or null (accepts `SS.xxx` or `M:SS.xxx`, rejects invalid/<=0).
- `isValidQualifyingTime(d)` → time!==null && status in {completed, manually_corrected}.
- `qualifyingRows(drivers)`, `poleTime`, `poleDiffMs`, `computeGridRows` (above), `buildFinalResults` (above), `raceDriverLabel(status)`.

### 5.2 Standings / points (from `championship-utils.ts`)
- `DEFAULT_CHAMPIONSHIP_SCORING` = mode automatic, positions 1–8 → 25/18/15/12/10/8/6/4, pole +1, others 0, penalty adjustment disabled.
- classificationRank: finished 0, dnf 1, retired 2, withdrawn 3, dns 4, others 9. Classified ⇐ 4.
- `racePoleDriverId(drivers)`: min valid qualifying time driver (null if none).
- `computeRacePoints`: only classified drivers; base = finished→pointsByPosition[position] ?? 0; dns→dnsPoints; others→dnfPoints. points = base + polePoints + participationPoints. `clean` = finished result.
- **Standings accumulation per driver** (`standings` rows): racesEntered, racesCompleted, wins, podiums, poles, dnfs, dns, retirements, withdrawals, penalties (count of races with active penalties), penaltySeconds, points, cleanRaces, bestQuali.
- **Sorting/tie-break**: points desc → wins desc → podiums desc → poles desc → qualifying best asc (nulls last) → driverId asc. Position 1-based; pointsGap = leader.points − points; previousPosition/trend up/down/same across snapshots.
- Stanings computed **from completed races only**, in date order (date then startTime); snapshots after each completed race (used for "round X" standings and trend).
- `computeTeamSeasonStats`: group standings by team (drivers), sum points/wins/podiums/poles/racesEntered, sort by same tie-break, team position 1-based, driver sub-lists sorted desc by points.
- `buildDriverSeasonStats` / `buildDriverCareerHistory`: per-driver season and career summaries (races, wins, podiums, poles, best/who quali, dnfs, dns, retirements, withdrawals, penalties, clean races, points, position, previousPosition).
- `computeRaceResultSummary`: driversEntered (classified), finishers, dnfs, dns, retirements, withdrawn, penaltiesIssued (active), totalPenaltySeconds, completed.
- `standingsCsv`: header Position,Name,Team,Points,Wins,Podiums,Poles,Penalties.

All of these are deterministic; they become `race-utils` helpers plus a `StandingsService.php` (and small helpers in the standings controller/service) with unit tests. **Standings must always be computed from persisted data on demand — never stored** (matches source, matches 5d no-fake-data rule).

## 6. UI to port (Blade components, following existing dark motorsport style)

| Source component | Port to |
| --- | --- |
| races/page.tsx | `views/races/index.blade.php` (grid of RaceCard, empty state, Create race button) |
| new/page.tsx | `views/races/create.blade.php` + StoreRaceRequest (basics + format select + group select limited to admin groups) |
| [raceId]/page.tsx | `views/races/show.blade.php` (overview: facts grid, field summary, rule box, session log) |
| setup/page.tsx | `views/races/partials/setup.blade.php` or `setup.blade.php` (member checklist + kart inputs) |
| lobby/page.tsx | `views/races/partials/lobby.blade.php` (confirm/ready toggles) |
| qualifying/page.tsx | `views/races/partials/qualifying.blade.php` (times list + manual entry; stopwatch is client JS) |
| grid/page.tsx | `views/races/partials/grid.blade.php` (GridTable + lock button) |
| control/page.tsx | `views/races/partials/control.blade.php` (live control rows, penalty manager) |
| results/page.tsx | `views/races/partials/results.blade.php` (results-header, winner-card, podium, results-table, summary; read-only) |
| race-provider reducer | `app/Services/RaceLifecycleService.php` (or `RaceService`) — all state-transition actions as controller/service methods |
| race-status-badge / race-header / race-tabs | `components/race-status-badge.blade.php`, `race-header.blade.php`, `race-tabs.blade.php` |
| race-event-list | `components/race-event-list.blade.php` (render from race_events, newest first) |
| race-card / empty-state | reuse existing `components/empty-state.blade.php` + new `race-card.blade.php` |
| results-table / result-row / status badges | `components/race-results-table.blade.php` + partials, `result-status-badge.blade.php` |
| CSV / share | export CSV action (server-side from results), share text is out of scope unless simple |

Source CSS classes use CSS variables (`--red`, `--red-bright`, `--amber`, `--green`, `--line`, `--muted`, `--panel`). The existing Laravel Tailwind v4 setup already uses a similar palette (see `app.css` / phase 5a); map: `--red-bright`≈red-600-ish accent used for actions, `--green`≈emerald, `--amber`≈amber, panels near-black `[#0b1013]/[#11171b]`.

## 7. Authorization model

Mirror SeasonPolicy/GroupPolicy pattern:

- **index/show (view)**: any group member of the race's group → `RacePolicy@view`.
- **create/store**: must be admin/organizer of the target group (else 403) → `RacePolicy@create` (delegates to `GroupPolicy@update`).
- **update / manage (setup/lobby/qualifying/grid/control/penalties/results-write)**: admin/organizer of the group → `RacePolicy@manage` (covers all mutating flows so the authority model matches the source, where only organizers run the session).
- **delete/cancel**: admin/organizer.
- Registration in `AuthServiceProvider` like SeasonPolicy.

Routes replace the `Route::view('/races', 'feature-placeholder')->name('races')` placeholder and the `races.new`/`races.show` abort(501) stubs. Unlike 5d, races are **not** aliased to a second name — `races` group routes stay under `/races`.

## 8. Planned routes (for implementation phase)

| Method | URI | Name |
| --- | --- | --- |
| GET | `/races` | races |
| GET | `/races/new` | races.new |
| POST | `/races` | races.store |
| GET | `/races/{race}` | races.show |
| GET | `/races/{race}/edit` | races.edit (basics) |
| PATCH | `/races/{race}` | races.update |
| POST | `/races/{race}/cancel` | races.cancel |
| DELETE | `/races/{race}` | races.destroy (organizer, draft/lobby only? source has no delete; decide in impl) |
| POST | `/races/{race}/entries` | races.entries.set (replace field set `?set_participants`) |
| POST | `/races/{race}/entries/{driver}` | races.entries.update (kart/confirm/ready/status/grid) |
| POST | `/races/{race}/entry` | races.entry.store (add single driver) and DELETE to remove |
| POST | `/races/{race}/qualifying/{driver}` | races.qualifying.update (time/status) |
| POST | `/races/{race}/penalties` | races.penalties.store |
| POST | `/races/{race}/penalties/{penalty}` | races.penalties.update (cancel / under_review) |
| POST | `/races/{race}/status` | races.status (setStatus generic) |
| POST | `/races/{race}/lock-grid` | races.lockGrid |
| POST | `/races/{race}/start-race` | races.startRace |
| POST | `/races/{race}/complete` | races.complete |
| GET | `/races/{race}/results.csv` | races.results.csv |

Tabs (`/setup`, `/lobby`, `/qualifying`, `/grid`, `/control`, `/results`) are handled by the same `races.show` with a `?tab=` or a small set of sub-routes; enabled-status mapping from source `race-tabs.tsx`:
- overview: all statuses; setup: draft,lobby; lobby: draft,lobby,qualifying; qualifying: lobby,qualifying,grid,racing,completed; grid: qualifying,grid,racing,completed; control: grid,racing; results: completed.

## 9. Implementation plan (remaining 5e sub-phases)

1. ✓ Audit (this doc).
2. **List + detail** — `RaceController`, `RacePolicy`, `races.index` + `races.show` (overview), components (`race-status-badge`, `race-card`, `race-header`, `race-tabs`, `race-event-list`), replace `/races` placeholder, wire sidebar entry (already present). Empty states, no fake data.
3. **Create** — `StoreRaceRequest` (name/venue/date/time/format/group; organizer = current driver; defaults status=draft, lap count 1), `races.create` + `races.store`.
4. **Setup / entries** — `set_participants` (replace full entry set — source semantics), add/remove individual entries, kart numbers; "choose field" page restricted to group members.
5. **Race state machine** — `RaceService` with guarded transitions + events recording; `races.cancel`, `lock-grid`, `start-race`, `complete`; status-change validation map.
6. **Lobby** — confirm/decline/ready toggles (members of group only), current-user-scoped confirmation when the driver is the signed-in user, ready only when confirmed.
7. **Qualifying** — real-data recording: manual time entry (`parseLapTime`), set status completed/manually_corrected/invalid, clear/restore/replace semantics mirrored (source pending-op confirmation collapses to direct update in server flow), attempts logged in `race_events`; qualifying_attempts table optional (source does not use it — skip unless tests want a history).
8. **Grid** — compute + store grid positions on lock; grid table rendering; manual override + grid penalties (admin/organizer); ready toggles.
9. **Control / results** — finish/DNF/DNS/retired/withdrawn + finish counter logic; complete; results pages (winner/podium/table), CSV export.
10. **Standings/classification** — `StandingsService` (5.2) + `StandingsController` wiring for completed races; surfacing on season show (read-only real data) and race results; unit tests.
11. **Penalties** — issue (admin/organizer, seconds>0, reason required), cancel, under_review; accumulate `penalty_total_seconds` on entry; displayed separately, never auto-adjust finishing positions.
12. **Tests** — `RacesTest` (auth/privacy/CRUD/state machine/entries/qualifying/grid/control/results/cancel) + `StandingsServiceTest` (points/ties/trends) + `RaceEventTest` coverage inside RacesTest; format/parse lap time unit tests.
13. **Seeder safety** — verify `ChampionshipContentSeeder` still idempotent after new factories; run `db:seed` twice.
14. **Docs** — `docs/phase-5e-races-pipeline.md` at the end.

## 10. Risks / decisions for implementation

- **No schema changes planned.** If a genuine gap appears (e.g., persistent "current race" pointer, lap counts page), add a *safe* additive migration and document it here — never a destructive one.
- **Standings on demand, never stored** — avoids consistency drift and matches source `computeStandings`.
- **Finish positions**: source's finish counter auto-assigns consecutive positions; Laravel port will do the same server-side deterministically (store the assigned finish_position on the entry). Manual reordering handled via `set_driver_status` semantics only.
- **RaceEvents payload**: source metadata is a JSON object; our `payload` json column already exists. Map event types 1:1 (23 cases).
- **CSV export** — simple server-side `text/csv` response.
- **Skip hardware timing / RFID / camera / AI commentary** per project scope (V1 manual only).
- **Livewire not currently used** in this codebase's features (controllers + Blade forms). Keep the same pattern: plain controllers + Blade. No new front-end build step.