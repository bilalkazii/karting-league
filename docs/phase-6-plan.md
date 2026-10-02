# Phase 6 — Production Hardening and Integration (Plan)

Status: **PLAN** (Step 1 implementation + verification follow in `phase-6-step-1.md`)

Constraints honoured from the phase brief: no rewriting of working features, no
migration/RLS changes without explicit approval, no secret exposure, mock
fallback preserved, and each step is small, isolated, and verified with
`npm run lint` + `npx tsc --noEmit` + `npm run build` before the next starts.

## Current architecture (as-built, verified 2026-09-17)

- **Stack**: Next.js 16.3.5 App Router (Turbopack), React 19, Tailwind 4, strict
  TypeScript, `@supabase/ssr` + `@supabase/supabase-js`. No API routes, no
  server actions, no schema-validation library, no test runner (all confirmed by
  grep).
- **Auth**: `src/proxy.ts` middleware runs `createServerClient` + `auth.getUser()`
  on every request; no `cookieOptions` are pinned (library defaults apply). All
  `(app)` routes are **ungated**: with no session they degrade gracefully —
  mock fallback (no env) or RLS deny-by-default (env set, no session) → empty
  states / `notFound()` 404s, never a crash. `src/lib/supabase/session.ts` and
  `profile.ts` are the only server-side session readers; `auth.ts` provides
  client-side sign helpers that nothing currently calls (no sign-in UI exists).
- **Server/client boundary**: pages are async server components reading cookies
  (`server.ts`); `(app)` shell + all form/control widgets are `"use client"`;
  `admin.ts` (service role) is server-only and not imported by any client
  component.
- **Error & loading**: **none exist** — no `error.tsx`, `global-error.tsx`,
  `not-found.tsx`, or `loading.tsx`. Repositories systematically swallow
  Supabase errors (`|| []`, `?? null`); `profile.ts` even falls back to mock
  data on error.
- **Validation**: input surfaces are demo/local (invite panel is static mock,
  forms store client state). The one real numeric input guard in a live path is
  `race-provider.tsx` (manual times + penalties), and `set_grid_position` is
  intentionally unclamped.
- **Env/mock split**: `hasSupabaseEnv()` = URL + anon key both non-empty;
  `createServerSupabaseClient()` returns `null` → repositories delegate to
  `mock-data` helpers. This dual-path is the core preserved behaviour.

## Step roadmap (each independently verifiable; ordered smallest-safe → larger)

| # | Step | Why now | Risk |
|---|------|---------|------|
| 1 | **CSV formula-injection hardening** — extract `csvCell`/`buildCsv` into `src/lib/csv.ts` and prefix OWASP-dangerous leading chars (`= + - @` TAB CR) with `'` | Exported race sheets are opened in Excel/Sheets; a cell beginning with `=` executes a formula. Deterministic, single-file, testable. | Very low |
| 2 | Fix unhandled clipboard rejections in `invite-panel.tsx` (`.then()` with no `.catch()`) | Latent unhandled-promise-rejection when clipboard fails | Very low |
| 3 | Add `global-error.tsx` + `(app)/error.tsx` + shared error UI + a `loading.tsx` for the heaviest dynamic routes | Currently no graceful failure surface exists in production | Low |
| 4 | Repository observability — log swallowed Supabase errors (`console.error` with code+resource, no payload/token/PII) | Production diagnostics without changing UI behaviour | Low |
| 5 | Clamp `set_grid_position` (and assert range in `race-provider.tsx`) | Guard the operator-facing manual grid editor | Low |
| 6 | Type-safety pass — remove `!` assertions + `finishPosition as 1\|2\|3` casts in `results/page.tsx` via narrowing helpers | Remove soundness holes before further integration | Low |
| 7 | Production cookie options — pin `cookieOptions` (`sameSite: "lax"`, `secure` in prod, explicit `path`) in `proxy.ts` + server/client clients | Explicit auth cookie contract for deployment | Medium (`secure` on localhost needs care) |
| 8 | Dashboard identity — drive greeting/date from the real profile (live or mock) instead of hardcoded "Tuesday, 09 September 2025" | Visible correctness bug in live mode | Medium (visual change) |
| 9 | Optional `not-found.tsx`/`loading.tsx` polish + sign-in decision record | Closes out hardening; document whether real route gating awaits an auth feature phase | Low/decision |

Explicitly out of scope for this phase: hardware/RFID/AI/commentary features
(V1 scope), migration and RLS changes, and any rewrite of working race-control
behaviour.

## Step 1 specification (this iteration)

- **Files changed**: `src/lib/csv.ts` (new, pure, erasable TS) +
  `src/components/share/export-csv-button.tsx` (consume lib helpers, re-export
  `CsvColumn` so `results/page.tsx` is untouched).
- **Behaviour change**: cells whose text starts with `=`, `+`, `-`, `@`, TAB or
  CR are prefixed with a single `'` in the exported CSV (OWASP/CWE-1236
  mitigation). Normal cells — including driver names, times, headers, and empty
  values — render identically to before. Quoting rules unchanged.
- **Verification**: deterministic smoke assertions against the real module
  (Node 24 native TS), then `npm run lint`, `npx tsc --noEmit`,
  `npm run build`, and a dev-server render check of the race results export
  button.