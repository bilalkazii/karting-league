# Phase 5 Step 6 — Live UI Verification

Status: **PASSED** (live rendering with a real member session) — with honest
notes on the two data fixes required to reach it.

Real execution against project `psqhquqvjjsylxyjbrhi`
(`https://psqhquqvjjsylxyjbrhi.supabase.co`, region ap-northeast-2) on 2026-09-17.
No results fabricated. Two pre-existing auth-instance issues had to be fixed
(data-only, user-approved) before a member session existed at all; they are
documented in full below.

## Prerequisites resolved first (user-approved, data-only)

### 1. Local OS DNS could not resolve `psqhquqvjjsylxyjbrhi.supabase.co`

- Local DNS servers (`192.168.0.1` Ethernet → **NXDOMAIN** for the project host,
  while `www.google.com` resolves; `172.20.10.1` WiFi hotspot → timeout). Public
  resolvers 8.8.8.8 / 1.1.1.1 resolve fine to Cloudflare `172.64.149.246` /
  `104.18.38.10` → local upstream filtering only.
- Fix (approved via the plan tool): hosts entry
  `104.18.38.10 psqhquqvjjsylxyjbrhi.supabase.co` appended to
  `C:\Windows\System32\drivers\etc\hosts` (backup kept at `hosts.karting-bak`),
  `ipconfig /flushdns` run.
- Verified: `Resolve-DnsName` → A `104.18.38.10`; Node fetch of the REST API
  with the anon key returns `200 []` (previously `ENOTFOUND`); PostgREST
  `curl --resolve` anon probe → `200 []` (RLS deny-by-default live on the wire).

### 2. GoTrue sign-in for the seeded users returned `500 Database error querying schema`

- Diagnostic path (real): `/auth/v1/settings` 200, `/auth/v1/user` 401 (guest),
  signup 200 (created+deleted a probe user to compare GoTrue-created rows).
  `auth.identities` was **0 rows** for the 8 migration-created users (the exact
  caveat migration 003's header documents), and password grant for
  `demo@karting.app` → 500.
- Fix A — `auth.identities` (user-approved, data-only, idempotent
  `on conflict (id) do nothing`): inserted 8 rows mapping each seeded user to
  `provider_id = user uuid`, `identity_data = {"sub": <uuid>,
  "email": <email>, "email_verified": true, ...}`. Note: `email` is a
  **generated** column on `auth.identities` (cannot be inserted) — the servers of
  this project are pre-2023-style GoTrue (verified from the 003 header text).
  After fix: `auth.identities` 0 → 8.
- Fix B — NULL token columns (user-approved, data-only): still
  `500 Database error querying schema`. Root cause per
  https://supabase.com/docs/guides/troubleshooting/auth-error-500-database-error-querying-schema-eb6b44 :
  manual `auth.users` inserts leave token columns NULL and GoTrue fails scanning
  NULL→string. Set to `''` (empty string) for the 8 seed users only:
  `confirmation_token`, `recovery_token`, `email_change`,
  `email_change_token_new`, `email_change_token_current`. (Phone columns were
  left untouched — the docs recommend keeping those NULL.)
- After Fix B: `POST /auth/v1/token?grant_type=password` for `demo@karting.app`
  → **200** `{access_token (766 chars), refresh_token, user
  d2fe5fba-0512-ef33-2b95-ae8f0261ae76}`; `GET /auth/v1/user` with that token →
  200. Probe user used for diagnosis was deleted via the admin API (200 `{}`).

## Completed checks (real, executed)

| # | Check | Result (evidence) |
|---|-------|-------------------|
| 1 | Member session obtainable | Password grant 200 for `demo@karting.app` after fixes A+B above; JWT validated against `/auth/v1/user` (200, user id `d2fe5fba-…`). |
| 2 | @supabase/ssr cookie format confirmed from source | `createServerClient` writes cookies as `base64-<base64url(jsonSession)>` (`cookies.js` `BASE64_PREFIX`); `decodeChunkedCookieValue` only decodes values carrying that prefix. A bare base64url cookie is treated as absent — this is why a first blind attempt (no prefix) produced "Auth session missing" in a standalone repro and guest rendering in the app. Fixed by using the exact ssr format. |
| 3 | Session path proven outside the app | Standalone `createServerClient` repro with the ssr-format cookie: `getUser()` → `demo@karting.app`, `from("seasons").select("id,name").eq("id","e8b349a3-…")` → `{"id":"e8b349a3-ab18-79f6-a760-48abf37fabc0","name":"Crew Championship 2026"}` (RLS member gate satisfied). |
| 4 | Guest path (env-on, no session) | `/championship` → 200 "No active season" empty state; `/seasons/e8b349a3-…` → 404; `/seasons/season_2026` → 404. |
| 5 | Live render — `/championship` (session cookie) | 200 and contains: "Crew Championship 2026", "Bilal Darji", "Driver standings", "Team standings", "Apex Racing", "Velocity Squad", "70" (leader pts) and "118" (team leader pts). |
| 6 | Live render — `/seasons/e8b349a3-…` (session cookie) | 200 and contains: "Crew Championship 2026", "Driver standings", "Team standings", "Season races", "Season awards", "Season records", "Season summary", "Opening Sprint", "Champions Finale", "Leader After Round 3", "Most Poles (3 rounds)", "Best Qualifying", "41.720 s", "Most Wins", "Most Starts". |
| 7 | Standings rows rendered match the engine | HTML row extraction: 1 BD 70 (Leader "Bilal Darji") · 2 ZF 62 · 3 AR 42 · 4 DS 37 · 5 OT 30 · 6 UK 26 (2 penalties) · 7 AJ 6 (2 races, 1 DNF) · 8 HA 4 — identical to `championship-utils` output on live rows (step-5 doc). Teams: AR Apex Racing 118 (3 drivers) · VS Velocity Squad 99 (2) · RK Redline Karting 30 (2). Season summary: "3 of 5 races completed", "20 total finishers across 3 races", "2 penalties issued", "10 total penalty seconds". |
| 8 | Race cards | "Opening Sprint" (Completed, Winner **Bilal Darji**, Pole **Bilal Darji**, Nashik Karting Arena, 2026-03-14 16:00) rendered; "Grand Prix Sprint" (Completed, Pune Race Zone, 2026-05-09 15:30) rendered. |
| 9 | Stale-404 caveat handled honestly | `/seasons/<uuid>` showed a cached compiled 404 on the nodes that had first rendered the guest empty state; restarting `next dev` and requesting the URL **with the session cookie first** yielded the full 200 render above (no cache keyed on the auth path). |
| 10 | Mock fallback (Supabase unconfigured) | `.env.local` moved aside, dev restarted (no `Environments:` line). `/championship` → 200 mock active season ("Crew Championship 2026", "Bilal Darji", "Apex Racing"); `/seasons/season_2026` → 200 (standings + races + records); `/seasons/e8b349a3-…` (real UUID) → 404 (correct: not in mock data). `.env.local` restored afterwards. |
| 11 | Static validation | `npm run lint` ✅ · `npx tsc --noEmit` ✅ · `npm run build` ✅ (16/16 routes; `/championship` and `/seasons/[seasonId]` correct as dynamic, `Proxy (Middleware)` present). |

## Honest notes / limits

- **No in-app sign-in UI exists in V1**, so the member path was exercised by
  feeding the app the **exact cookie @supabase/ssr writes**, built from a real
  GoTrue password-grant session (`sb-psqhquqvjjsylxyjbrhi-auth-token` =
  `base64-<base64url(jsonSession)>`). This still exercises the full real path:
  middleware `getUser()`, SSR session hydration, RLS member policies, and the
  actual render. Interactive browser sign-in was not part of this phase's scope.
- The hosts entry is **machine-local**; it fixes this dev machine only. On any
  properly resolving network the project works unchanged (public resolvers
  resolve the host; both fixes in "Prerequisites" are data/OS-local and do not
  touch migrations 001–004 or any RLS policy).
- `supabase db lint` remains blocked: Docker daemon not running
  (`npipe:////./pipe/dockerDesktopLinuxEngine`). Superseded by static checks +
  live apply/verify.

## Commands actually executed (representative)

`Resolve-DnsName psqhquqvjjsylxyjbrhi.supabase.co` ·
`ipconfig /flushdns` ·
hosts append (elevated) with `hosts.karting-bak` backup ·
`node` fetch of `/rest/v1/seasons` (env anon key) ·
`npx supabase db query --linked` (auth state, identities schema, row diffs) ·
`npx supabase db query --linked --file v006-fix-null-tokens.sql` (Fix B) ·
`curl` to `/auth/v1/token?grant_type=password`, `/auth/v1/user`,
`/auth/v1/admin/users/<probe-id>` DELETE ·
`node ssr-repro.cjs` (getUser + season query via @supabase/ssr) ·
`npm run dev` (env-on guest + session, env-off mock) +
`curl` marker assertions ·
`npm run lint` · `npx tsc --noEmit` · `npm run build`

## Secret handling

- `SUPABASE_SERVICE_ROLE_KEY` used transiently for the probe-user admin DELETE;
  never printed, never written to the repo (stays in gitignored `.env.local`).
- Anon key and the demo session JWT were used in-memory/temp files only; no key
  or token value is committed in docs, logs, or migrations.
- `.env.local` moved aside for the mock check and restored (re-verified
  `Environments: .env.local` on the final dev boot).