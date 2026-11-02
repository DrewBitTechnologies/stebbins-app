# Roadmap: Toward a Multitenant Platform

This app is currently a single-tenant pilot for the Stebbins Cold Canyon Reserve, but it is the testbed for a future **multitenant platform serving multiple UC Davis Natural Reserves**. Over the coming months the codebase will be refactored with that direction in mind, alongside general maintainability, UX, and UI improvements. This doc tracks the considerations and direction for that work — see the main [README](README.md) for current architecture and setup.

## Decoupling from the API
- The backend is currently a single Directus instance with one collection per taxon/screen (`wildflower`, `bird`, `mammal`, etc. — see `contexts/api.config.ts`). As the multitenant architecture takes shape, **the API will change significantly**, likely moving toward a reserve-scoped, schema-driven backend rather than one hardcoded collection per taxon.
- New client code should avoid depending directly on Directus-shaped responses or endpoint paths wherever practical. Prefer funneling data access through the existing `contexts/api.tsx` / `api.service.ts` layer (or its eventual replacement) so the UI depends on an internal data contract rather than the backend's current shape.
- Expect the current `SCREEN_CONFIGS` registry (a static map of one entry per screen/endpoint) to eventually be replaced by something reserve- and schema-aware rather than a fixed table.

## Dynamic, taxonomy-driven filtering
- Guide filtering (color, season) is currently hardcoded: fixed fields on `GuideDataItem`, a fixed `monthMap`, and parsing logic duplicated across `guide-list-screen.tsx` and `guide-card.tsx`.
- The planned filtering upgrade replaces this with **filters defined on the backend and assigned per guide/reserve** — arbitrary taxonomic keys rather than a fixed `color`/`season` shape. The client will need a generic filter-rendering model: fetch the available filter definitions and values for a guide, render chips/sections dynamically, and evaluate filter logic generically instead of switching on known field names.
- This is expected to be a much bigger change on the server side than the client side — the client mainly needs to stop assuming a fixed filter schema and instead render whatever filter set the API describes for a given reserve/guide.

## General maintainability goals
- Favor smaller, composable components over large monolithic ones (e.g. `guide-list-screen.tsx` currently mixes data fetching, filtering, gesture-driven UI, and rendering in one ~1,000-line file).
- Keep reserve-specific assumptions (Stebbins branding, the fixed taxon list under `app/guides/`, hardcoded color/season enums) easy to find and isolate, so they can be swapped for reserve-configured equivalents later rather than hunted down file-by-file.

## Visual design refresh
- The UI should be revisited to feel more current while staying true to an outdoors/field-guide app — think legible typography, generous whitespace, photography-forward cards, and subtle motion, rather than the current dense, form-heavy layouts.
- Styling today is ad hoc: colors come from a single hardcoded UC Davis institutional palette (`assets/dev/color_palette.ts`), there's no shared typography/spacing scale, no dark mode or system-theme support, and each component defines its own `StyleSheet.create` independently (27+ separate style blocks).
- This cleanup should happen in tandem with the multitenant work rather than as a separate pass: a shared design-token/theming layer (colors, type scale, spacing) benefits both goals at once, since different reserves will likely want their own branding down the line, not just a visual refresh of Stebbins'.

## Caching & onboarding clarity
- Real user problem: people download the app and land on empty guides/map with no explanation, because `splash.tsx` blocks app entry until every entry in `SCREEN_CONFIGS` has synced, with no messaging about what's happening or why a first launch takes a moment.
- Short-term fix: clearer App Store / Play Store copy setting expectations that first launch downloads reserve content for offline use, plus a splash screen that actually communicates what's being cached instead of a generic loading animation.
- Longer-term direction: move away from a blocking splash screen entirely — let users into the app immediately on an empty/stale cache, sync in the background, and surface progress/completion via toasts (there's already a `useToast`/`Toast` pattern in `utility/toast-notifications.ts` / `components/toast.tsx` that fits this well) rather than one upfront all-or-nothing gate.
- Also worth exploring: fine-grained cache preferences — download everything by default, but let users free up space by un-caching/deleting individual guides they don't need rather than all-or-nothing. This also dovetails with the multitenant direction, since a user may eventually have more than one reserve's content cached at once and want control over what stays on-device.
- The offline map pack has the same problem in a different form: `app/(tabs)/map.tsx` only kicks off `checkMapForUpdate` (the Mapbox tile pack download) from its own mount effect, so it doesn't download until the user actually navigates to the map tab. It should be treated like any other cached resource — proactively downloaded as part of the same background sync as guide/screen data, not gated behind a screen visit.

## Map provider flexibility
- There's a longer-term interest in moving off Mapbox toward an open-source alternative (e.g. MapLibre), so new map-related work should be written with that eventual swap in mind.
- Mapbox usage is currently fairly contained (`app/(tabs)/map.tsx`, `utility/mapbox-utils.ts`, `app.config.ts`) rather than scattered throughout the app — worth preserving that boundary, and worth considering a thin map-provider abstraction before adding more Mapbox-specific logic, so a future swap doesn't require rewriting the whole map tab.

## Testing & CI/CD
- The suite is currently broken, not just stale: running `npm test` in `testing/` fails 13 of its 14 suites. Two concrete root causes account for most of it:
  - `testing/` is its own isolated npm workspace with its own `node_modules`, and it resolves a different React copy (`19.0.0`) than the root app (`19.2.3`). Tests that render app hooks/components end up mixing two React instances in one test, which is why things like `unit/report-draft.test.ts` fail with `Cannot read properties of null (reading 'useState')`.
  - `contexts/api.config.ts` imports from `expo-file-system/legacy`, but every Jest config (`jest.api.config.js`, `jest.fast.config.js`, `jest.ui.config.js`) only mocks the bare `expo-file-system` specifier, not the `/legacy` subpath — so the real `expo-modules-core` loads under jsdom and crashes on `EventEmitter`, taking down nearly every suite that transitively imports the API context.
- Getting the suite itself green again is the prerequisite for everything else here — there's no point building CI around tests that don't pass locally.
- `testing/TESTING_STRATEGY.md` and `testing/todo.md` already describe a thorough target structure and a large backlog of coverage gaps (UI/component tests, real-API staging tests, E2E are mostly unchecked) — once the suite runs cleanly, that backlog is the natural next step rather than something to re-plan from scratch.
- Longer term: wire a CI/CD pipeline (e.g. GitHub Actions) to run tests automatically on push/PR. The existing split scripts (`test:api`, `test:ui`, `test:build`, `test:fast`) map naturally onto separate CI jobs/stages rather than one monolithic run.
