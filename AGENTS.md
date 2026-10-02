<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Karting Project Rules

## Scope

Karting is a private karting-group web application. V1 is software-only and uses manual qualifying and race timing. Do not implement hardware timing, automatic lap counting, RFID, camera timing, radio communication, AI commentary, or safety-car systems.

## Architecture

- Use Next.js App Router, React, strict TypeScript, Tailwind CSS, and shadcn/ui-compatible components.
- Keep UI components in `src/components`, shared utilities in `src/lib`, and route composition in `src/app`.
- Keep validation, deterministic race/championship calculations, and Supabase data access outside React components.
- Normalize persisted data and protect group-owned resources with server-side authorization and PostgreSQL RLS.
- Do not add Supabase schemas or business logic until the relevant feature phase is explicitly requested.
- Domain models live in `src/types` and are centralized in `src/types/index.ts`. Current data source is `src/lib/mock-data.ts`; keep all mock data objects there and expose typed lookup helpers (e.g. `getGroupById`, `getGroupMembers`) so pages never import the raw arrays. Swap these helpers for Supabase access later.

## Development

- Preserve the dark, high-contrast motorsport visual language: near-black surfaces, white type, racing red actions, restrained rounding, and responsive layouts.
- Prefer small reusable primitives over page-local duplicates. Use Lucide icons rather than drawing SVG icons by hand.
- Never hard-code secrets or API keys. Environment variables must be documented without committing values.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before completing a feature.
- Add tests for race calculations and other deterministic domain logic as those modules are introduced.
