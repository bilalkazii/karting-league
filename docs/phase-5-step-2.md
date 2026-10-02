# Phase 5 Step 2 — Authentication, Profiles and Group-Membership RLS

## Scope
Auth + profile foundation and group-membership RLS, with a thin repository
layer demonstrating the mock → Supabase swap for ONE resource. The mock
system, all 25 routes, and the deterministic data layer are untouched.

## Checkpoint A — Supabase client setup and environment handling

New dependencies (the first Supabase packages in this project):
- `@supabase/ssr` (^0.12.7) — session cookies, `createServerClient`/`createBrowserClient`
- `@supabase/supabase-js` (^2.116.0) — service-role admin client

New files:
- `src/lib/supabase/env.ts` — reads env vars once, `hasSupabaseEnv()` / `hasSupabaseServiceRoleEnv()` guards. Never exports real key values.
- `src/lib/supabase/client.ts` — browser client (singleton), used by client components.
- `src/lib/supabase/server.ts` — server client built per request (Next 16 async `cookies()`), returns `null` when env is missing so no page depends on a live project.
- `src/lib/supabase/admin.ts` — service-role client (server-only; `persistSession: false`). Null when the service-role key is absent.

Env vars (documented in `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only).

## Checkpoint B — Authentication/profile foundation

- `src/proxy.ts` — Next.js 16 file-convention: `middleware` was RENAMED to
  `proxy` (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
  It refreshes the Supabase session at the request edge (cookie `getAll`/`setAll`
  re-applied to request + response), and is a pure pass-through when Supabase is
  not configured. Matcher excludes static assets.
- `src/lib/supabase/auth.ts` — browser auth actions: `signInWithPassword`,
  `signUpWithEmail`, `signOut`. (No auth UI yet — infrastructure only.)
- `src/lib/supabase/session.ts` — server-side `getCurrentUser()` (uid + email).
- `src/lib/supabase/profile.ts` — `getCurrentDriverProfile()` resolves
  `auth.users → profiles → drivers` and maps to the domain `Driver`. Falls back
  to the mock current driver (`CURRENT_USER_ID`) when env is missing, the session
  has no user, or the user has no drivers row. Derived aggregates (stats, badges,
  recentForm) return neutral defaults — they are computed, not stored.

Typing fix: the Supabase typed `select()` parser requires a `Relationships`
array per table (newer codegen shape). Added `Relationships: []` to all 18
tables in `src/types/database.ts` so row inference resolves instead of `never`.

## Checkpoint C — Group-membership RLS (reviewed migration)

File: `supabase/migrations/202609160002_group_membership_rls.sql`

Ownership model:
- `auth.uid()` → `profiles` → `drivers` → `group_members`. Group is the security boundary.
- Reads = member of the owning group (except `profiles`/`drivers`: own row, or
  any authenticated user may view driver identities).
- Writes = `admin` OR `organizer` manages group resources; members may only
  write their own rows (availability, self sign-up/ready/notes, own profile).
- Group creation open to any authenticated user (they become `created_by`); a
  driver may self-join a group.
- `race_events` is an audit log: select + manager insert, no update/delete.

Implementation notes:
- 9 `SECURITY DEFINER` helper functions (`current_driver_id`, `group_role`,
  `can_manage_group`, and `race|season|team_group_{member,manage}` scope
  helpers) resolve membership without RLS recursion; `search_path` pinned to
  `public`.
- Execute privileges revoked from `public`, granted to `authenticated`.
- Migration is additive; Step 1's zero-policy defaults become member-scoped.

## Checkpoint D — Thin repository layer (one resource, mock fallback)

File: `src/lib/repositories/groups.ts`
- `getGroupById(id)` — queries Supabase via the server client when configured;
  falls back to `getGroupById` from `src/lib/mock-data` when env is missing.
  When Supabase IS configured, the DB result is authoritative (a denied/missing
  row returns `null` → `notFound()`; mock never masks real DB/RLS state).
- Mapped to the domain `Group`. Derived previews (`upcomingRace`,
  `recentResults`, `currentChampionship`) are not persisted (Step 1 decision),
  so the DB path returns neutral defaults; `GroupHeader` only uses persisted
  fields, so it is unaffected.

Wired into the group detail pages (server components):
- `src/app/(app)/groups/[groupId]/layout.tsx` — uses the repository
- `src/app/(app)/groups/[groupId]/page.tsx` — uses the repository

All other lookups (members, teams, drivers, championship) remain on mock in
this step. Same behavior as before while env is unset.

## Validation
- `npm run lint` ✅
- `npx tsc --noEmit` ✅
- `npm run build` ✅ (25 routes preserved; `ƒ Proxy (Middleware)` registered)

## Limitations
- No live Supabase project in this repository — migration not executed here;
  RLS is verified by review only.
- No auth UI yet; sign-in/up/out are callable helpers with no page.
- Only `groups` goes through the repository; everything else still reads mock
  data. Mixed-source rendering would appear if env were set before the other
  resources are migrated (all resources must be swapped together).
- `src/types/database.ts` remains hand-maintained (can be replaced with
  `supabase gen types` output later; now with `Relationships` arrays).

## Recommended Phase 5 Step 3
- Seed the DB: stable mock-id ↔ uuid mapping, profiles/drivers/group_members
  rows for the demo user (`drv_1`), then migrate the remaining read paths
  (members, teams, drivers, races, championship) through repositories with the
  same fallback pattern — finishing one resource per checkpoint.
- After seeding, execute migrations on a real Supabase project and verify RLS
  with `authenticated`/`anon` roles in the SQL Editor.