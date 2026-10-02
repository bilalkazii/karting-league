# Karting Laravel — Phase 2: Project Setup

**Phase:** 2 of 12
**Status:** Complete
**Date:** 2026-09-18

---

## 1. Local Tooling (installed)

Host machine had no PHP; PHP and Composer were installed as a portable user-scoped toolchain (no admin rights needed).

| Tool | Version | Location |
|------|---------|----------|
| PHP (NTS, VS16) | 8.3.33 | `C:\Users\USER\AppData\Local\karting-tools\php` |
| Composer | 2.10.3 | `C:\Users\USER\AppData\Local\karting-tools\composer` |
| Node.js / npm | 24.18.1 / 11.16.0 | system |

### Setup steps taken
1. Downloaded `php-8.3.33-nts-Win32-vs16-x64.zip` from `https://windows.php.net/downloads/releases/`
2. Extracted to `karting-tools\php`, copied `php.ini-development` → `php.ini`
3. Enabled extensions: `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_sqlite`, `sodium`, `zip`, `bz2`
4. Set `extension_dir = "C:\Users\USER\AppData\Local\karting-tools\php\ext"` in `php.ini`
5. Installed Composer via `getcomposer.org/installer` into `karting-tools\composer`
6. Added `C:\Users\USER\AppData\Local\karting-tools\php` to the **User** PATH and added a `composer.bat` wrapper in the same dir

> **Note:** PATH updates only apply to newly opened shells. Commands below use the full PHP path if run from a shell that predates the install.

## 2. Project Creation

```bat
set PHP=C:\Users\USER\AppData\Local\karting-tools\php\php.exe
cd C:\Users\USER\Documents
%PHP% C:\Users\USER\AppData\Local\karting-tools\composer create-project laravel/laravel karting-laravel
cd karting-laravel
```

Result: **Laravel Framework 13.32.0** (PHP 8.3.33). `composer create-project` ran initial migrations against a fresh `database/database.sqlite`.

## 3. Packages Installed

| Package | Version | Purpose |
|---------|---------|---------|
| `laravel/breeze` (dev) | ^2.4 | Auth scaffolding (Blade stack, dark mode) |
| `livewire/livewire` | ^4.4 | Reactive PHP components for race tools |
| `tailwindcss` | ^4 | CSS-first utility framework (matches source app) |
| `@tailwindcss/vite` | ^4 | Tailwind Vite plugin |

Breeze's default scaffolding was applied with `php artisan breeze:install blade --dark`.

## 4. Tailwind v4 Standardization

Breeze shipped a hybrid Tailwind v3/v4 config. Normalized to a clean **Tailwind v4** CSS-first setup:

- `vite.config.js` → added `@tailwindcss/vite` plugin
- `resources/css/app.css` → `@import "tailwindcss"` + `@theme` design tokens + `@custom-variant dark (&:where(.dark, .dark *))` for class-based dark mode
- Deleted `tailwind.config.js` and `postcss.config.js` (no longer needed)
- Removed `tailwindcss@3`, `autoprefixer`, `@tailwindcss/forms` from devDependencies

### Design tokens (ported from source app `globals.css`)
```css
@theme {
    --color-background: #07090b;
    --color-foreground: #f5f7f8;
    --color-muted: #8d969d;
    --color-panel: #101519;
    --color-panel-raised: #151c21;
    --color-line: #253038;
    --color-red: #ef3340;
    --color-red-bright: #ff4b55;
    --color-green: #7de2ad;
    --color-amber: #f2c45c;
    --font-sans: "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
    --font-mono: "Geist Mono", ui-monospace, "Cascadia Code", monospace;
}
```
These are exposed as Tailwind utilities (`bg-background`, `text-muted`, `border-line`, `bg-red`, `text-green`, etc.) and as CSS variables (`var(--color-red)`).

## 5. Environment Configuration

`config/database.php` default connection is `sqlite` (set in `.env`):
```
DB_CONNECTION=sqlite
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
BROADCAST_CONNECTION=log
```
All drivers use the database — no Redis/Gearman/etc., which keeps the app compatible with **Hostinger shared hosting**.

Production/MySQL values (documented, never committed):
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=<hostinger db>
DB_USERNAME=<hostinger user>
DB_PASSWORD=<hostinger password>
```

`.env` and `.env.example` updated: `APP_NAME=Karting`, `MAIL_FROM_ADDRESS="karting@example.com"`.

`.gitignore` ignores `.env`; the file `database/database.sqlite` should be kept out of git (create it during setup).

## 6. Verification Performed

| Check | Command | Result |
|-------|---------|--------|
| PHP version | `php -v` | PHP 8.3.33 |
| Composer version | `composer --version` | 2.10.3 |
| Laravel version | `php artisan --version` | Laravel Framework 13.32.0 |
| Frontend build | `npm run build` | ✓ built (Tailwind v4, 4 modules) |
| Test suite | `php artisan test` | 25 passed |
| HTTP smoke test | `php artisan serve` + HTTP GET | `/` 200, `/login` 200, `/register` 200 |

## 7. Repository State

`karting-laravel` is its own git repository:
```
chore: scaffold Laravel 13 project with Breeze auth, Livewire, Tailwind v4
```
Project root: `C:\Users\USER\Documents\karting-laravel` (sibling of the Next.js source `karting-app`).

## 8. Commands for Day-to-Day Dev

```bat
cd C:\Users\USER\Documents\karting-laravel
set PATH=%PATH%;C:\Users\USER\AppData\Local\karting-tools\php
php artisan serve          # dev web server (http://127.0.0.1:8000)
npm run dev                # Vite dev server (HMR)
npx php artisan test       # run test suite
```

## 9. Decisions Recorded

| Decision | Choice | Rationale |
|----------|--------|-----------|
| PHP version | 8.3 | Well-supported LTS, Laravel 13 compatible, safest for Hostinger |
| Local database | SQLite | Zero-config dev/testing; MySQL-compatible migrations run unchanged on Hostinger |
| Tailwind major | v4 | Matches source app's `@import "tailwindcss"` syntax; CSS-first tokens |
| Dark-theme support | Class-based `.dark` | Keeps Breeze toggle working; app itself is dark-only |
| Session/cache/queue | Database | Hostinger-safe (no Redis) |
| Auth scaffold | Breeze Blade + dark | Fastest path to production-grade auth; replaced later with app-specific pages |