# Phase 4 Step 4 — Route Wiring and Data Integration

## Files Inspected
- `src/app/(app)/layout.tsx` — AppShell wrapper
- `src/app/(app)/championship/page.tsx` — placeholder
- `src/app/(app)/races/[raceId]/layout.tsx` — RaceProvider wrapper
- `src/app/(app)/races/[raceId]/results/page.tsx` — old inline Phase 3 UI
- `src/app/(app)/races/page.tsx` — race list with RaceCard
- `src/app/(app)/dashboard/page.tsx` — dashboard
- `src/components/app-shell.tsx` — sidebar nav (Championship link exists)
- `src/components/championship/*` — 14 completed components
- `src/components/races/*` — 7 results components
- `src/components/share/*` — 4 share components
- `src/lib/championship-data.ts` — data helpers
- `src/lib/championship-utils.ts` — pure computation
- `src/lib/mock-data.ts` — mock data + lookup helpers
- `src/lib/race-utils.ts` — race formatting utilities
- `src/types/championship.ts` — championship domain types
- `src/types/race.ts` — race domain types

## Existing Route Structure
```
src/app/(app)/
  layout.tsx          (AppShell)
  dashboard/page.tsx
  championship/page.tsx  ← PLACEHOLDER
  races/
    page.tsx
    new/page.tsx
    [raceId]/
      layout.tsx      (RaceProvider + RaceHeader + RaceTabs)
      page.tsx        (overview)
      setup/page.tsx
      lobby/page.tsx
      qualifying/page.tsx
      grid/page.tsx
      control/page.tsx
      results/page.tsx  ← OLD INLINE UI (to rebuild)
  groups/
  drivers/
  ...
```

## Planned Routes
1. `/races/[raceId]/results` — REBUILD with Phase 4 components (Checkpoint A)
2. `/championship` — REPLACE placeholder (Checkpoint B)
3. `/seasons/[seasonId]` — NEW server page (Checkpoint B)
4. `/seasons/new` — NEW client form page (Checkpoint C)

## Data Flow
- `/races/[raceId]/results`: Uses RaceProvider (client) → maps state to Phase 4 component props
- `/championship`: Server component → `getActiveSeason("grp_1")` → `getSeasonStandings()` → renders components
- `/seasons/[seasonId]`: Server component → `getSeasonById()` + standings/awards/records → renders components
- `/seasons/new`: Client component with controlled form → local confirmation only

## Key Design Decisions
- Results page stays `"use client"` because it's inside RaceProvider layout
- Championship and seasons pages are server components using championship-data helpers
- Seasons directory is NEW (does not currently exist under `(app)`)
- No navigation sidebar changes needed — Championship link already exists
- RaceCard links already point to `/races/${race.id}` which shows overview; results are at `/races/${race.id}/results`

## Limitations
- Visual smoke testing not available in this session
- Mock data resets on reload
- No persistence for new season form
