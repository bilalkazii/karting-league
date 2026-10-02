# Karting Laravel — Phase 4: Authentication

**Phase:** 4 of 12
**Status:** Complete
**Date:** 2026-09-18

---

## 1. Overview

The Next.js app authenticates against Supabase Auth (email/password) with `supabase.auth.*` used inline in service/route code and `withAuth`/`authenticated` redirect helpers in app-shell and layout. The Laravel version replaces Supabase Auth with **Laravel's session-based Breeze authentication stack** (Blade + `--dark` preset).

No changes to the Next.js codebase were made; the audit (Phase 1) confirmed the source uses no OAuth providers, phone auth, magic links, or admin APIs — email/password only.

## 2. What Replaces What

| Supabase Auth concept | Laravel equivalent |
|---|---|
| `supabase.auth.signUp()` + `<SignUpForm/>` | `/register` (`RegisteredUserController` + `auth.register`) |
| `supabase.auth.signInWithPassword()` + `<SignInForm/>` | `/login` (`AuthenticatedSessionController` + `auth.login`) |
| `supabase.auth.resetPasswordForEmail()` | `/forgot-password` (`PasswordResetLinkController`) |
| `supabase.auth.updateUser({ password })` | `/forgot-password` reset link → `/reset-password` (`NewPasswordController`) |
| `supabase.auth.signOut()` + user menu | `/logout` (POST) + app-shell dropdown |
| `withAuth` / `authenticated()` redirects | `auth`, `guest` middleware groups (Breeze routes) + `verified` |
| `auth.users` + `on_auth_user_created` trigger → `profiles` | `users` + `Registered` event → `CreateDriverIdentity` listener → `profiles` + `drivers` |
| `getCurrentDriverProfile()` util | `Auth::user()->driver` (`hasOneThrough` accessor) |
| RLS `auth.uid()` checks | Laravel Policies (Phase 5) + `$user->driver` |
| JWT / `access_token` / refresh | Encrypted session cookies (`SESSION_DRIVER=database`) |
| `user.id` (uuid) | `users.id` (bigint), `profiles.user_id` unique FK |

## 3. User → Profile → Driver Provisioning

Supabase auto-created a `profiles` row via a database trigger on new auth users. The Laravel equivalent is an event listener:

- **`app/Listeners/CreateDriverIdentity.php`** listens on `Illuminate\Auth\Events\Registered`.
- Registers nothing new directly; it creates (idempotently, `firstOrCreate`):
  - `profiles` row: `user_id`, `full_name` from `users.name`
  - `drivers` row: `profile_id`, auto `nickname` = uppercase first 2 letters of the first name token (e.g. `Alex Turner` → `AL`), `rating` 1200 (source default-based starting form), default avatar colors.
- Wired in `AppServiceProvider::boot()` via `Event::listen(Registered::class, CreateDriverIdentity::class)`.

| Test | What it proves |
|---|---|
| `test_registration_provisions_profile_and_driver` | POST `/register` creates user + profile + driver, correct nickname/rating |
| `test_registration_is_idempotent_for_existing_identity` | re-firing `Registered` doesn't duplicate the chain |

## 4. The Demo Account

The seeded demo identity remains the single fully-provisioned account:

- **Login:** `demo@karting.app` / `karting-demo-2026`
- **Driver:** nickname `BD`, kart #7, rating 1842, **admin** of *Karting Crew*
- Full feature suite (groups, season, races, entries, penalties, awards, records) is seeded under this driver (Phase 3).

| Test | What it proves |
|---|---|
| `test_demo_account_can_log_in` | POST `/login` with demo credentials redirects to dashboard, `Authenticated` |
| `test_demo_account_has_full_identity_chain` | user → profile → driver → admin of Karting Crew |
| `test_guest_is_redirected_away_from_dashboard` | `/dashboard` requires auth |

The other 7 seeded accounts exist for data realism and use password `not-used` (logs are mail-only in local dev; they are never announced as working logins).

## 5. Identity Accessor

`User::driver()` is a `hasOneThrough` (users → profiles → drivers), so the entire codebase uses `auth()->user()->driver` instead of the source's `getCurrentDriverProfile()`. The chain handles null-safety via trust in the provisioning listener; any legacy test DB row lacking a driver is covered by the `RefreshDatabase` + `seed()` fixtures used throughout.

## 6. Authorization Model (RLS → Policies)

RLS is PostgreSQL-specific and does not exist in MySQL (Hostinger target). It is replaced by:

1. **Laravel session auth** — guard/middleware for "is signed in".
2. **Policies** (`app/Policies/*`) — per-model `viewAny/view/viewAnyForGroup/update/create` controlled by:
   - group membership + `GroupRole` (admin/member/organizer)
   - `GroupPrivacy` (public/private)
   - record ownership (`profiles.user_id`)
3. **Service-layer assertions** — used by Livewire actions (Form Requests in Phase 5/6).

Policy implementation ships with the features that consume it (Phase 5); the auth scaffolding and provisioning are complete here.

## 7. Routes (Breeze-provided)

| Route | Controller | Notes |
|---|---|---|
| `GET /` | `WelcomeController`-style view | redirects to `/dashboard` when authenticated |
| `GET|POST /register` | `RegisteredUserController` | + provisioning listener |
| `GET|POST /login` | `AuthenticatedSessionController` | rate-limited (throttle:6,1) |
| `POST /logout` | `AuthenticatedSessionController` | |
| `GET|POST /forgot-password` | `PasswordResetLinkController` | mail: `MAIL_MAILER=log` in dev |
| `GET|POST /reset-password` | `NewPasswordController` | |
| `GET /verify-email` + `POST /email/verification-notification` | `EmailVerification*` | on by default; can be loosened later |
| `GET|PATCH /profile` | `ProfileController` | Breeze default |
| `GET /dashboard` | `DashboardController` | protected; replaced in Phase 5 |

All auth views carry `dark:` Tailwind classes already (Breeze `--dark` preset); final visual polish of the auth pages happens in Phase 6 (they already inherit the `@theme` design tokens from `app.css`).

## 8. Verification

| Check | Result |
|---|---|
| `php artisan test` | 30 passed / 30 (was 25; +5 auth/provisioning) |
| Demo login via form POST | redirects to `/dashboard`, authenticated |
| Registration POST | provisions user → profile → driver, `TE`, rating 1200 |
| Guest hitting `/dashboard` | redirected to `/login` |
| Session persistence | `sessions` table driver (database), cookie-based |
| Hostinger safety | no env-sensitive defaults; mail via `MAIL_MAILER=log`, no SMTP creds committed |

## 9. Deprecation Notes for the Next.js Codebase

Nothing was removed from the source. When the Laravel port fully replaces it, the following become obsolete and can be deleted from `karting-app/`:

- `supabase.auth.*` calls across pages/components
- `<SignUpForm/>`, `<SignInForm/>`, `withAuth`/`authenticated` helpers
- `getCurrentDriverProfile()` and any `user.id`-string assumptions
- Supabase JWT decoding/refresh logic (none existed beyond the client SDK)