# Karting League

A private web app for running a karting group's racing league â€” groups, drivers,
teams, race sessions with manual qualifying, and a full championship with
configurable points scoring.

> **Status: prototype / predecessor.**
> This is the original Next.js implementation. It has been superseded by
> `karting-laravel` â€” a Laravel rewrite that adds team management, driver CSV
> import, real hashed-token invitations, chat, notifications, and a full test
> suite. `karting-app` is kept for reference and because it is the only place
> the Supabase schema and RLS policy design lives. See
> [docs/laravel-migration-audit.md](docs/laravel-migration-audit.md) for the
> feature-by-feature comparison.

V1 is deliberately **software-only**: qualifying and race timing are entered
**manually** by a human with a stopwatch. There is deliberately no hardware
timing, lap counting, RFID, camera timing, radio, AI commentary, or safety-car
system. See [AGENTS.md](AGENTS.md) for the full project rules.

---

## Features

**Groups & membership**
- Private karting groups with `admin` / `organizer` / `member` roles
- Shareable invite links, member role changes, per-driver availability
- Profile visibility preference (private / group / public)

**Drivers & teams**
- Racing identity with rating, badges and aggregate stats
- Teams with member rosters, shown on group and championship pages

**Race lifecycle** â€” a server-enforced state machine:

```
draft â†’ lobby â†’ qualifying â†’ grid â†’ racing â†’ completed
                                       â†˜ cancelled
```

- Lobby: check-in, ready toggles, invite panel
- Qualifying: manual stopwatch timer plus manual time entry, with
  invalid / restore / corrected / replace / promote
- Grid: computed from qualifying, with grid penalties and manual override
- Race control: finish, DNF, DNS, retire, withdraw, per-driver status
- Penalties: **informational only** â€” they are recorded and reported but never
  silently reorder a finish
- Results: classification, podium, share card, CSV export
- Audit timeline: every state change recorded as an immutable race event

**Championships**
- Seasons with a configurable points table
- Automatic or custom scoring: points by finishing position, pole points,
  fastest-lap points, participation / DNF / DNS points
- Penalty point adjustment, **off by default**
- Driver standings, team standings, position trend, 13 award types

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3.5 (App Router, Turbopack) |
| UI | React 19.2.8, TypeScript 5 (`strict: true`) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`), `lucide-react` icons |
| Backend | Supabase â€” PostgreSQL 17 + PostgREST + GoTrue auth |
| Auth | Supabase Auth (email/password), `@supabase/ssr` cookie sessions |
| Authorization | PostgreSQL Row Level Security (~55 policies) |
| Migrations | Supabase CLI, 4 SQL migrations in `supabase/migrations` |
| Lint | ESLint 9 flat config (`eslint-config-next`) |

There is **no test runner configured** in this project. The deterministic
calculation logic in `src/lib/race-utils.ts` and
`src/lib/championship-utils.ts` is covered by the equivalent tests in the
Laravel rewrite.

---

## Architecture

```
src/
  proxy.ts              request-edge session refresh (Next 16 replacement for middleware.ts)
  app/
    (app)/              authenticated route group, 24 screens
      dashboard/        season + group overview
      groups/           list, create, detail, members
      races/            list, create, and the session lifecycle:
                         setup â†’ lobby â†’ qualifying â†’ grid â†’ control â†’ results
      championship/     season standings hub
      seasons/          create, detail
      drivers/          driver profile
      chat/             placeholder
      notifications/    placeholder
      settings/         placeholder
  components/
    races/              race-provider.tsx is the client-side state machine
    championship/       standings tables, award grid, points breakdown
    share/              CSV + share card export
    ui/                 Button, Card, Badge (shadcn-style primitives)
  lib/
    race-utils.ts       lap time format/parse, grid rows, final classification
    championship-utils.ts  scoring engine, computeStandings
    csv.ts              CSV builder with formula-injection guard
    repositories/       dual-path data access: mock â‡„ Supabase
    supabase/           client, server, admin, session, env helpers
  types/                domain models + generated Database types
supabase/
  migrations/           001 schema Â· 002 RLS Â· 003 demo seed Â· 004 championship seed
docs/                   phase plans, audits, RLS verification SQL
```

### Data access

Every repository is **dual-path**: it reads from a local mock dataset when
Supabase is not configured, and from Supabase when it is. Pages never import the
raw mock arrays â€” they go through typed lookup helpers, so swapping the source
does not touch call sites.

### Authorization model

Authorization is enforced **twice**, deliberately:

1. **PostgreSQL RLS** is the real boundary. Migration 001 enables RLS on all 18
   tables with zero policies, which means default-deny. Migration 002 then adds
   ~55 policies built on `SECURITY DEFINER` helper functions
   (`current_driver_id()`, `group_role()`, `can_manage_group()`, â€¦) with
   `set search_path = public` to avoid recursion and search-path hijacking.
2. The **service-role key is server-only**. It is read from
   `SUPABASE_SERVICE_ROLE_KEY`, which has no `NEXT_PUBLIC_` prefix, so Next.js
   never inlines it into a client bundle. The only consumer is
   `src/lib/supabase/admin.ts`. All request-path repositories use the
   anon-key cookie-scoped client so RLS still applies.

Derived values are **not stored** â€” stats, badges, results, standings, team
member lists, and season race lists are all computed at read time.

---

## Installation

Requires **Node.js 20+**.

```bash
git clone https://github.com/bilalkazii/karting-league.git
cd karting-league
npm install
```

## Configuration

The app runs with **zero configuration** â€” every repository falls back to the
built-in mock dataset in `src/lib/mock-data.ts` when Supabase is not configured.

To connect a real Supabase project:

```bash
cp .env.example .env.local
```

Then fill in `.env.local` from Supabase **Project Settings â†’ API**:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for DB mode | PostgREST endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for DB mode | Public anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Server-only, bypasses RLS. Never prefix with `NEXT_PUBLIC_`. Never commit. |

Apply the schema:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## Running locally

```bash
npm run dev
```

Open <http://localhost:3000>. The root route redirects to `/dashboard`.

To point the app at a real backend from another device or host, export the two
`NEXT_PUBLIC_` variables before starting.

### Demo accounts

Migrations 003 and 004 seed a full championship dataset. The demo login is
`demo@karting.app` / `karting-demo-2026`. **These are local demo credentials
only â€” never reuse this password anywhere real, and never run the demo seed
against a production database.**

## Testing

```bash
npm run lint          # ESLint 9
npx tsc --noEmit      # typecheck
npm run build         # production build
```

There is no unit test runner in this project. The equivalent deterministic
logic (lap times, grid, classification, F1-style scoring, standings) is covered
by 31 PHPUnit files in the Laravel rewrite.

## Building for production

```bash
npm run build
npm run start
```

Deploys cleanly to Vercel with no configuration. Set the three environment
variables above in the Vercel project settings.

---

## Project structure

| Path | Contents |
| --- | --- |
| `src/app/(app)/` | All 24 application screens |
| `src/components/` | 55 components; `races/race-provider.tsx` holds the session state machine |
| `src/lib/` | Race + championship math, CSV, repositories, Supabase clients |
| `src/types/` | Domain models and generated `Database` types |
| `supabase/migrations/` | Schema, RLS policies, and deterministic demo seeds |
| `docs/` | Phase plans, audits, and RLS verification SQL |

---

## Screens

No screenshots are committed to this repository. The UI is a dark,
high-contrast motorsport theme: near-black surfaces, white type, racing red
accent, carbon fibre texture, restrained corner radii, responsive down to
mobile.

## License

MIT — see [LICENSE](LICENSE).

