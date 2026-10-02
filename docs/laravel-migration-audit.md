# Karting App — Laravel Migration Audit

**Audit date:** 2026-09-18
**Audit scope:** Full repository inspection of `karting-app` (Next.js + Supabase)
**Target:** Laravel + Livewire + Tailwind CSS (separate `karting-laravel` project)

---

## 1. Existing Application Architecture

### Stack
- **Framework:** Next.js 16.3.5 (App Router)
- **React:** 19.2.8
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + CSS custom properties (design tokens)
- **UI Library:** Custom components (shadcn/ui-inspired primitives: `Button`, `Card`, `Badge`)
- **Icons:** lucide-react 1.46
- **Backend/DB:** Supabase (PostgreSQL) — optional, mock data when unconfigured
- **Auth:** Supabase Auth (browser client + server client + middleware proxy)
- **Utilities:** class-variance-authority, clsx, tailwind-merge

### Architecture Pattern
- **Mock-first dual-path architecture:** Every data-fetching module has a sync mock helper in `src/lib/mock-data.ts` and an async Supabase repository in `src/lib/repositories/`. When Supabase env vars are missing, the mock path is used.
- **Client-side race state machine:** `RaceProvider` (React Context + useReducer) holds full race state and drives qualifying/grid/race/results workflow entirely in-browser. State is ephemeral — resets on page reload.
- **Server-side Supabase queries:** Repository layer uses `createServerSupabaseClient()` with RLS; falls back to mock when Supabase env vars are absent.
- **No API routes / Server Actions:** No `src/app/api/` or `src/app/actions/` exist. All data access is via direct import of repo/mock functions.
- **Middleware proxy:** `src/proxy.ts` refreshes Supabase sessions via cookie-based middleware (exported as Next.js middleware matcher).

### Key Directories
```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Entry redirect → /dashboard
│   ├── globals.css             # Design tokens + base styles
│   └── (app)/
│       ├── layout.tsx          # AppShell wrapper
│       ├── dashboard/page.tsx
│       ├── groups/             # CRUD + members + tabs
│       ├── drivers/[driverId]/ # Driver profile
│       ├── championship/       # Season standings hub
│       ├── seasons/            # New + season detail
│       ├── races/              # List + new + race sub-routes
│       │   └── [raceId]/
│       │       ├── layout.tsx  # RaceProvider + RaceHeader + RaceTabs
│       │       ├── page.tsx    # Overview (client)
│       │       ├── setup/      # Race configuration (client)
│       │       ├── lobby/      # Pre-race check-in (client)
│       │       ├── qualifying/ # Manual timing (client)
│       │       ├── grid/       # Starting grid (client)
│       │       ├── control/    # Live race control (client)
│       │       └── results/    # Post-race (client)
│       ├── chat/               # Placeholder
│       ├── notifications/      # Placeholder
│       ├── profile/            # Redirect to /drivers/{id}
│       ├── settings/           # Placeholder
│       └── race-setup/         # Placeholder
├── components/
│   ├── app-shell.tsx           # Navigation shell
│   ├── brand.tsx               # Logo
│   ├── ui/                     # Badge, Button, Card primitives
│   ├── championship/           # 14 championship components
│   ├── races/                  # 18 race components (incl. race-provider.tsx)
│   ├── share/                  # 4 sharing components
│   └── [root]                  # 14 general components
├── lib/
│   ├── mock-data.ts            # Full mock dataset (508 lines)
│   ├── championship-data.ts    # Mock championship data layer
│   ├── championship-utils.ts   # Scoring/standings computation engine
│   ├── race-utils.ts           # Grid/results/qualifying utilities
│   ├── csv.ts                  # CSV generation
│   ├── utils.ts                # cn() helper
│   ├── repositories/           # Supabase repo layer (7 files)
│   └── supabase/               # Supabase client setup (6 files)
└── types/
    ├── index.ts                # Domain type re-exports
    ├── database.ts             # Full Supabase schema types
    ├── driver.ts               # Driver, DriverStats, DriverAvailability
    ├── group.ts                # Group, GroupMember, GroupRole
    ├── race.ts                 # Race, RaceDriver, RacePenalty, RaceEvent
    ├── championship.ts         # Season, ChampionshipStanding, Award, etc.
    └── team.ts                 # Team
```

---

## 2. Complete Feature Inventory

### Implemented Features
| Feature | Status | Notes |
|---------|--------|-------|
| App shell + navigation | ✅ | Sidebar (desktop) + bottom nav (mobile) + sticky header |
| Authentication UI | ⚠️ | Supabase client wrappers exist; NO login/register pages exist |
| Dashboard | ✅ | Personal stats, championship snapshot, upcoming race, availability selector |
| User profile (driver) | ✅ | Stats, race history, rating, badges |
| Groups | ✅ | Create, list, overview, members, tabs |
| Group members | ✅ | Roles (admin/organizer/member), availability, ratings |
| Invite system | 🔧 | UI mock only — clipboard copy of hardcoded link/code |
| Teams | ✅ | Within-group teams, member assignment |
| Drivers | ✅ | Driver cards, profile page, avatars, stats |
| Championships | ✅ | Season overview, driver/team standings, awards, records |
| Seasons | ✅ | Create, season detail, race schedule, progress |
| Races | ✅ | Create, list (upcoming/completed), per-race sub-pages |
| Race setup | ✅ | Format, qualifying laps, rules |
| Race lobby | ✅ | Driver check-in, ready state, invite panel |
| Qualifying | ✅ | Manual stopwatch, manual time entry, grid table |
| Grid | ✅ | Grid from qualifying, grid penalties, lock grid |
| Race control | ✅ | Live status per driver, finish/DNF/DNS/retire/withdraw, penalties |
| Results | ✅ | Winner card, podium, full classification, CSV export, share card |
| Standings | ✅ | Driver standings, team standings, points breakdown |
| Penalties | ✅ | Issue, cancel — informational only (never reorder finishes) |
| Awards | ✅ | Season awards, race awards (driver of race, cleanest, etc.) |
| Records | ✅ | Season records (best qualifying, most starts, most wins) |
| Share/export | ✅ | Copy summary text, export CSV, share card preview |
| Race events | ✅ | Audit timeline per race session |
| Demo notice | ✅ | Disclaimers about browser-local state |

### Placeholder/Future Features (SectionPlaceholder only)
| Feature | Route | Current Copy |
|---------|-------|-------------|
| Chat | /chat | "Race control radio" — Group chat, race chat, announcements |
| Notifications | /notifications | "Stay in the loop" — Reminders, personal bests, results |
| Settings | /settings | "Account" — Profile, privacy, notifications, preferences |
| Race setup tool | /race-setup | "Organizer tools" — Race weekend builder |

### Features Explicitly Out of Scope (AGENTS.md)
- Hardware timing, automatic lap counting, RFID, camera timing
- Radio communication, AI commentary, safety-car systems

---

## 3. Route/Page Inventory

| # | Route | Layout | Type | Purpose |
|---|-------|--------|------|---------|
| 1 | `/` | Root | Server | Redirect → `/dashboard` |
| 2 | `/dashboard` | AppShell | Server + client island | Home screen with stats, championship, upcoming race, availability |
| 3 | `/groups` | AppShell | Server | List user's groups, "New group" entry |
| 4 | `/groups/new` | AppShell | Server → client form | Create group (simulated) |
| 5 | `/groups/[groupId]` | AppShell + GroupLayout | Server | Group overview with tabs |
| 6 | `/groups/[groupId]/members` | AppShell + GroupLayout | Server | Full member roster |
| 7 | `/drivers/[driverId]` | AppShell | Server | Driver profile with stats/history |
| 8 | `/championship` | AppShell | Server + client tabs | Championship hub: standings, awards, seasons |
| 9 | `/seasons/new` | AppShell | Server → client form | Create season (simulated) |
| 10 | `/seasons/[seasonId]` | AppShell | Server + client tabs | Season detail, schedule, standings, awards |
| 11 | `/races` | AppShell | Server | Race index: upcoming + completed |
| 12 | `/races/new` | AppShell | Server → client form | Create race (simulated) |
| 13 | `/races/[raceId]` | AppShell + RaceLayout | Client | Race overview (field summary, actions, events) |
| 14 | `/races/[raceId]/setup` | AppShell + RaceLayout | Client | Race configuration |
| 15 | `/races/[raceId]/lobby` | AppShell + RaceLayout | Client | Pre-race roster check-in |
| 16 | `/races/[raceId]/qualifying` | AppShell + RaceLayout | Client | Manual qualifying timing |
| 17 | `/races/[raceId]/grid` | AppShell + RaceLayout | Client | Starting grid |
| 18 | `/races/[raceId]/control` | AppShell + RaceLayout | Client | Live race control |
| 19 | `/races/[raceId]/results` | AppShell + RaceLayout | Client | Post-race results |
| 20 | `/chat` | AppShell | Server | Placeholder |
| 21 | `/notifications` | AppShell | Server | Placeholder |
| 22 | `/profile` | AppShell | Server | Redirect → `/drivers/{id}` |
| 23 | `/settings` | AppShell | Server | Placeholder |
| 24 | `/race-setup` | AppShell | Server | Placeholder |

### Race Status Tab Gating
| Tab | Enabled When Status Is |
|-----|----------------------|
| Overview | All |
| Setup | draft, lobby |
| Lobby | draft, lobby, qualifying |
| Qualifying | lobby, qualifying, grid, racing, completed |
| Grid | qualifying, grid, racing, completed |
| Control | grid, racing |
| Results | completed |

---

## 4. Database Table Inventory

### Tables (18 total)
| Table | Primary Key | Purpose |
|-------|-------------|---------|
| `profiles` | `uuid` (FK → auth.users) | User identity, 1:1 with auth.users |
| `drivers` | `uuid` | Racing identity, 1:1 with profiles |
| `groups` | `uuid` | Karting group |
| `group_members` | `(group_id, driver_id)` composite | Group membership with role |
| `teams` | `uuid` | Team within a group |
| `team_members` | `(team_id, driver_id)` composite | Team membership |
| `races` | `uuid` | Race event |
| `race_entries` | `(race_id, driver_id)` composite | Driver participation + timing + results |
| `qualifying_attempts` | `uuid` | Qualifying session log (V1 unused) |
| `race_penalties` | `uuid` | Informational penalty log |
| `race_events` | `uuid` | Race timeline/audit log |
| `seasons` | `uuid` | Championship season |
| `season_races` | `(season_id, race_id)` composite | Season→race membership with round number |
| `season_scoring` | `season_id` (1:1 with seasons) | Scoring configuration per season |
| `scoring_points` | `uuid` | Position→points mapping per season |
| `awards` | `uuid` | Season awards |
| `race_awards` | `race_id` (1:1 with races) | Per-race awards |
| `season_records` | `uuid` | Season records |

### Enum/Status Values
| Field | Allowed Values |
|-------|---------------|
| `groups.privacy` | `private` (only) |
| `group_members.role` | `admin`, `organizer`, `member` |
| `group_members.availability` | `available`, `maybe`, `not-available` |
| `races.format` | `sprint`, `feature`, `custom` |
| `races.status` | `draft`, `lobby`, `qualifying`, `grid`, `racing`, `completed`, `cancelled` |
| `race_entries.status` | `invited`, `confirmed`, `declined`, `ready`, `racing`, `finished`, `dnf`, `dns`, `retired`, `withdrawn` |
| `race_entries.qualifying_status` | `not_started`, `running`, `completed`, `invalid`, `manually_corrected` |
| `race_penalties.status` | `issued`, `under_review`, `cancelled` |
| `seasons.status` | `draft`, `active`, `completed`, `archived` |
| `season_scoring.mode` | `automatic`, `custom` |
| `awards.type` | `winner`, `podium`, `pole`, `driver_of_race`, `most_improved`, `cleanest_driver`, `championship_winner`, `team_champion`, `most_wins`, `most_poles`, `most_podiums`, `cleanest_season`, `participation` |
| `race_events.type` | 22 values (qualifying_*, ready/not_ready, race_*, penalty_*, grid_*, complete, note, status_change) |

### Key Constraints
- `drivers.racing_number`: CHECK (1–999) or NULL
- `race_entries.grid_penalty_seconds`: CHECK ≥ 0
- `race_entries.penalty_total_seconds`: CHECK ≥ 0
- `race_entries.finish_position`: CHECK ≥ 1 or NULL
- `seasons`: CHECK start_date ≤ end_date (when both present)
- `season_races`: UNIQUE (season_id, round_number)
- `scoring_points`: UNIQUE (season_id, position)

---

## 5. Relationship Map

```
auth.users ──1:1──▶ profiles ──1:1──▶ drivers
                                          │
                              ┌────────────┼────────────┐
                              ▼            ▼            ▼
                        group_members   team_members  race_entries
                              │            │            │
                              ▼            ▼            ▼
                           groups ◀── teams ◀── races ◀── race_penalties
                              │                          │
                              ▼                          ▼
                           seasons ◀── season_races   race_events
                              │                        race_awards
                   ┌──────────┼──────────┐
                   ▼          ▼          ▼
            season_scoring  awards   season_records
                   │
                   ▼
              scoring_points
```

**Derived data (NOT stored, computed in app layer):**
- Driver stats (wins, podiums, poles, etc.) — from race_entries + race_penalties
- Driver badges, recent form — from race history
- Group previews (upcomingRace, recentResults, currentChampionship)
- Team member IDs — from team_members
- Race participating driver IDs — from race_entries
- Season race IDs — from season_races
- Championship standings — from race_entries + scoring_points
- Team season stats — from driver standings + team_members
- Race result summaries — from race_entries + race_penalties

---

## 6. Authentication and Authorization Inventory

### Current Auth Flow
- **Provider:** Supabase Auth (GoTrue)
- **Methods:** Email/password only
- **Session management:** Cookie-based via `@supabase/ssr`
- **Middleware:** `src/proxy.ts` refreshes tokens on every request edge
- **Client auth helpers:** `src/lib/supabase/auth.ts` — `signInWithPassword`, `signUpWithEmail`, `signOut`
- **Server session:** `src/lib/supabase/session.ts` — `getCurrentUser()` returns `{id, email}`
- **Profile resolution:** `src/lib/supabase/profile.ts` — `getCurrentDriverProfile()` maps auth.users → profiles → drivers

### Current Authorization (RLS)
**Ownership chain:** auth.users → profiles (1:1) → drivers (1:1) → group_members → groups

| Resource | Read Policy | Write Policy |
|----------|-------------|--------------|
| profiles | Own only (id = auth.uid()) | Own only |
| drivers | Any authenticated user | Own only (profile_id = auth.uid()) |
| groups | Group member (group_role not null) | Admin/organizer only |
| group_members | Group member | Admin/organizer OR self (availability) |
| teams | Group member | Admin/organizer only |
| team_members | Group member | Admin/organizer only |
| races | Group member | Admin/organizer only |
| race_entries | Group member | Admin/organizer OR self (ready/notes) |
| qualifying_attempts | Group member | Admin/organizer only |
| race_penalties | Group member | Admin/organizer only |
| race_events | Group member | Admin/organizer (select + insert only; no update/delete) |
| seasons | Group member | Admin/organizer only |
| season_races | Group member | Admin/organizer only |
| season_scoring | Group member | Admin/organizer only |
| scoring_points | Group member | Admin/organizer only |
| awards | Group member | Admin/organizer only |
| race_awards | Group member | Admin/organizer only |
| season_records | Group member | Admin/organizer only |

**Helper functions (RLS bypass via SECURITY DEFINER):**
- `current_driver_id()` — resolves auth.uid() → drivers.id
- `group_role(p_group_id)` — role of caller in a group
- `can_manage_group(p_group_id)` — admin or organizer check
- `race_group_member/manage`, `season_group_member/manage`, `team_group_member/manage` — cross-resource scope helpers

### Roles (3 levels)
| Role | Capabilities |
|------|-------------|
| `admin` | Full group management, create/edit/delete resources, manage members |
| `organizer` | Create/edit races, seasons, scoring; manage entries and penalties |
| `member` | Self-service only (availability, ready state, own notes) |

### Authentication Migration Notes
- **Demo account:** demo@karting.app / karting-demo-2026 (only drv_1 has a known password)
- **Other accounts:** passwords are seeded as `not-used` — unusable
- **Migration strategy:** Users must reset passwords after migration
- **Profile auto-creation:** Laravel registration should create user → profile → driver chain automatically

---

## 7. Supabase Feature Inventory

| Supabase Feature | Current Usage | Status |
|-----------------|--------------|--------|
| **PostgreSQL database** | Primary data store (18 tables) | ✅ Active |
| **Auth (GoTrue)** | Email/password authentication | ✅ Active (no UI pages yet) |
| **RLS (Row Level Security)** | 36 policies across 18 tables | ✅ Active |
| **PostgREST** | Implicit via Supabase JS client | ✅ Active |
| **Realtime** | NOT used | ❌ Absent |
| **Storage** | NOT used | ❌ Absent |
| **Edge Functions** | NOT used | ❌ Absent |
| **Service Role Client** | Defined but NOT imported in any component/page | ⚠️ Available, unused |
| **Database Functions** | SECURITY DEFINER helpers for RLS only | ✅ Active |
| **Extensions** | pgcrypto (for seed passwords) | ✅ Seed only |

---

## 8. Realtime Functionality Inventory

**Current state: NO realtime features are implemented.**

- No Supabase channel subscriptions found
- No WebSocket connections
- No polling mechanisms
- All race state is browser-local (`useReducer` in `RaceProvider`)
- Race state resets on page reload — explicitly documented in `DemoNotice`

**V1 race workflow is entirely manual:**
- Qualifying: manual stopwatch + manual time entry
- Grid: computed from qualifying times + manual adjustments
- Race: manual finish/DNF/DNS/retire/withdraw per driver
- Penalties: manually issued by organizer
- Results: auto-computed from race_entries status/positions

---

## 9. File/Storage Inventory

**Current state: NO file storage is used.**

- No Supabase Storage calls
- No file upload handling
- Group logo/cover, team logos, and driver avatars are all CSS-based (initials + background color)
- CSV export generates client-side blob downloads (no server storage)
- Share cards are DOM-based only (no image generation)

---

## 10. Migration Risks

### High Risk
1. **Race state machine porting:** `RaceProvider` is a 333-line reducer with 22 action types, computed grids, pending-op state machine, and stopwatch integration. This is the most complex piece of business logic and must map to Livewire state management carefully.
2. **Championship scoring engine:** `championship-utils.ts` (354 lines) implements standings accumulation, points computation, race result summary, team season stats, and career history. Must be ported to PHP with identical results.
3. **No login/register pages exist:** Auth helpers are built but no UI exists. The Laravel app must create auth pages from scratch.

### Medium Risk
4. **Mock-to-real data switchover:** Current app has dual mock/DB paths. Laravel uses a single database — no dual-path needed. All mock data becomes seeders.
5. **Client-side only race state:** Race workflow lives entirely in-browser. Laravel Livewire must hold this state server-side (via Eloquent or session/component state).
6. **CSS design token porting:** 10 CSS custom properties + `.carbon` texture + hardcoded hex colors must translate to Tailwind CSS config or CSS custom properties in the Blade layout.

### Low Risk
7. **Seed data UUIDs:** Current seed uses deterministic UUIDs (`md5('karting-v1:kind:mock_id')`). Laravel can use auto-incrementing IDs or keep UUIDs.
8. **Profile auto-creation:** Laravel auth registration must auto-create profile + driver records (matching the Supabase trigger pattern).

---

## 11. Recommended Laravel Architecture

### Project Structure
```
karting-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # Resource controllers
│   │   ├── Livewire/         # Livewire components per feature
│   │   ├── Requests/         # Form Request validation classes
│   │   └── Middleware/
│   ├── Models/               # Eloquent models (18 tables)
│   ├── Policies/             # Authorization policies (replaces RLS)
│   ├── Services/             # Business logic services
│   │   ├── ChampionshipService.php
│   │   ├── RaceService.php
│   │   ├── StandingsService.php
│   │   ├── QualifyingService.php
│   │   ├── GridService.php
│   │   ├── PenaltyService.php
│   │   └── TimingService.php
│   ├── Events/               # Domain events (optional)
│   └── View/                 # Blade components
├── database/
│   ├── migrations/           # 18+ migrations
│   ├── seeders/              # Demo data (mirrors current mock)
│   └── factories/            # Model factories for tests
├── resources/
│   ├── views/
│   │   ├── layouts/          # app.blade.php (dark theme shell)
│   │   ├── components/       # Reusable Blade components
│   │   └── livewire/         # Livewire partial views
│   └── css/
├── routes/
│   ├── web.php               # All web routes
│   └── (api.php if needed)
└── tests/
    ├── Feature/              # Feature tests
    └── Unit/                 # Unit tests (services, scoring)
```

### Livewire Component Mapping
| Page | Livewire Component | Notes |
|------|-------------------|-------|
| Dashboard | `Dashboard.php` | Server-side, reads from Eloquent |
| Groups list | `Group\GroupList.php` | |
| Group create | `Group\CreateGroup.php` | |
| Group overview | `Group\GroupShow.php` | Tabs: overview/members |
| Group members | `Group\GroupMembers.php` | |
| Driver profile | `Driver\DriverProfile.php` | |
| Championship | `Championship\ChampionshipIndex.php` | Tabs: driver/team standings |
| Season create | `Season\CreateSeason.php` | Scoring configurator |
| Season detail | `Season\SeasonShow.php` | Schedule + standings + awards |
| Races list | `Race\RaceList.php` | |
| Race create | `Race\CreateRace.php` | |
| Race overview | `Race\RaceOverview.php` | Inside RaceLayout |
| Race setup | `Race\RaceSetup.php` | Config form |
| Race lobby | `Race\RaceLobby.php` | Check-in + ready state |
| Qualifying | `Race\Qualifying.php` | Stopwatch + manual entry |
| Grid | `Race\Grid.php` | Grid table + lock |
| Race control | `Race\RaceControl.php` | Live control + penalties |
| Results | `Race\Results.php` | Classification + export |

### Service Layer Mapping
| Service | Responsibility | Ported From |
|---------|---------------|-------------|
| `ChampionshipService` | Season CRUD, award/record management | `championship-data.ts` |
| `RaceService` | Race CRUD, status transitions, entry management | `race-provider.tsx` reducer |
| `StandingsService` | Driver/team standings accumulation, points | `championship-utils.ts` |
| `QualifyingService` | Time recording, grid computation | `race-utils.ts` |
| `GridService` | Grid position calculation, penalty application | `race-utils.ts` computeGridRows |
| `PenaltyService` | Penalty CRUD (informational V1) | `race-provider.tsx` addPenalty |
| `DriverService` | Driver stats computation, career history | `championship-utils.ts` + `championship-data.ts` |
| `GroupService` | Group CRUD, membership management | repositories/groups.ts + members.ts |

---

## 12. Items Requiring Manual Confirmation

### Auth Migration
1. **Password reset process:** Existing Supabase users have unusable passwords (demo only). Confirm: (a) fresh registration only, or (b) create a password-reset flow for migrated users?
2. **Email verification:** Should Laravel enable email verification on registration? (Supabase currently auto-confirms in seed.)
3. **Demo account behavior:** Keep demo@karting.app as a seeded test account? What password?

### Feature Scope
4. **Chat/messaging:** Placeholder only today. Confirm: implement basic group chat in V1 Laravel, or keep as placeholder?
5. **Notifications:** Placeholder only. Confirm: implement in V1?
6. **Settings page:** Placeholder only. Confirm: implement in V1?
7. **Race-setup global tool:** Placeholder only. Confirm: skip in V1?

### Race Workflow
8. **Race state persistence:** Current race state is browser-local and resets on reload. In Laravel, should race state be persisted to DB immediately (every action writes to DB), or batch-saved at milestones?
9. **Formation lap:** Mentioned in task scope but not implemented in current app. Confirm: implement in V1?
10. **Live leaderboard polling:** No realtime in current app. Confirm: use Livewire polling for live race dashboard, or skip for V1?

### Database
11. **UUID vs auto-increment:** Current schema uses UUIDs. Confirm: use UUIDs (via `laravel/uuid` or `ramsey/uuid`) or switch to auto-incrementing BIGINT?
12. **Soft deletes:** Not used in current schema. Confirm: add to any tables?
13. **Chat/messages table:** Not in current schema. Will need a new migration if chat is implemented.

### Deployment
14. **Hostinger PHP version:** Verify Hostinger Business has PHP 8.2+ available
15. **Queue driver:** Confirm `database` queue (Hostinger-compatible) vs `sync` for V1
16. **Cache driver:** Confirm `file` or `database` (no Redis on Hostinger Business?)

### UI
17. **Font choice:** Current uses Geist Sans + Geist Mono (Next.js font optimization). Laravel: use Google Fonts CDN, local fonts, or fallback to system fonts?
18. **Dark theme only:** Current app is dark-only (no light mode toggle). Confirm: dark-only in Laravel?

---

## Appendix A: Environment Variable Names (NOT values)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public, client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public, client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

**Laravel replacement env vars (expected):**
| Variable | Purpose |
|----------|---------|
| `APP_URL` | Application URL |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (3306) |
| `DB_DATABASE` | MySQL database name |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `SESSION_DRIVER` | Session driver (file/database) |
| `CACHE_DRIVER` | Cache driver (file/database) |
| `MAIL_MAILER` | Mail driver |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USERNAME` | SMTP username |
| `MAIL_PASSWORD` | SMTP password |
| `MAIL_FROM_ADDRESS` | From address |
| `MAIL_FROM_NAME` | From name |

---

## Appendix B: Dependencies Summary

### Production Dependencies
| Package | Version | Laravel Equivalent |
|---------|---------|-------------------|
| next | 16.3.5 | Laravel framework |
| react / react-dom | 19.2.8 | Blade + Livewire |
| @supabase/ssr + @supabase/supabase-js | 0.12.7 / 2.116 | Eloquent ORM + MySQL |
| lucide-react | 1.46 | Lucide PHP / Blade icons |
| class-variance-authority | 0.7.1 | Blade component classes |
| clsx + tailwind-merge | 2.1.1 / 3.7.0 | Blade component classes |

### Dev Dependencies
| Package | Version | Laravel Equivalent |
|---------|---------|-------------------|
| tailwindcss | v4 | Tailwind CSS (Vite) |
| typescript | v5 | PHP 8.2 |
| eslint + eslint-config-next | v9 | Laravel Pint |
| supabase CLI | 2.117 | Not needed |

---

## Appendix C: Seed Data Summary

### Demo Data (Migration 003)
- **8 users** with auth accounts (demo@karting.app + 7 others)
- **8 profiles** (Bilal Darji, Ahmad Rehman, Umar Khan, Arjun Mehta, Zain Farooqi, Haider Ali, Daniyal Shah, Omar Tanveer)
- **8 drivers** with racing numbers, avatars, ratings (1312–1842)
- **2 groups** (Karting Crew grp_1, Weekend Racers grp_2)
- **14 group memberships** (roles: 3 admin, 2 organizer, 9 member)
- **3 teams** (Apex Racing, Redline Karting, Velocity Squad)
- **7 team memberships**

### Championship Content (Migration 004)
- **1 active season** (Crew Championship 2026)
- **5 races** (3 completed, 2 draft)
- **23 race entries** across 3 completed races (7–8 per race)
- **2 penalties** (informational, non-position-affecting)
- **3 race awards** (driver of race + cleanest driver per race)
- **5 season awards** (championship leader, team leader, most wins, most poles, cleanest)
- **3 season records** (best qualifying, most starts, most wins)
- **Scoring:** Automatic 25/18/15/12/10/8/6/4 + 1 pole point

### Mock-Only Data (not in DB)
- **12 races** total in mock (7 additional historical races rc_1..rc_7 not in DB seed)
- **3 seasons** in mock (2025 completed + 2026 active) — DB has only 2026
- **Full race entries** for all 12 mock races
- **Race events** timeline for completed mock races
- **Career stats** and driver badges computed from full mock history
