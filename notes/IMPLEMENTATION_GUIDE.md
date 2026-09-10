# Volvo Dashboard — Implementation Guide

## Mockup Reference Files

| File | Contents |
|---|---|
| `mockups/DASHBOARD_WIREFRAME.svg` | Full desktop layout — sidebar, interactive car SVG, gauge panel |
| `mockups/MOBILE_DASHBOARD_WIREFRAME.svg` | Mobile layout — VIN chip, category row, gauges, odometer |
| `mockups/PANEL_WIREFRAMES.svg` | Detail panels for all 4 categories (Drive, Security, Safety, Service) |
| `mockups/UI_MOCKUP_DEPRECATED.md` | Superseded ASCII wireframes for the old tab-based design. Retained only as the best per-panel field list; the layout it describes is replaced by Nordic Horizon. |

---

## High-Level Design Vision: "Nordic Horizon"

The goal is a **glanceable cockpit** — not a data table. Four design pillars:

1. **Light & Airy (Nordic Light theme)** — `crystalWhite` / `sandDune` backgrounds, `onyxBlack` text.
2. **Glassmorphism surfaces** — semi-transparent panels with `backdrop-filter: blur(...)`.
3. **Interactive SVG car** — inline top-down car outline; React changes individual `<path>` fills based on API state (green = secure, red = warning).
4. **Micro-interactions** — `transition: fill 0.3s ease-in-out` on SVG path fills; SVG arc gauges for fuel and battery via `stroke-dasharray` / `stroke-dashoffset`.

---

## Decisions of Record

### Styling: Tailwind v4 + shadcn/ui (replacing MUI)
The project migrates off MUI before further feature work. Rationale: Tailwind + shadcn is the dominant
current pattern and has higher market relevance; utility classes teach CSS fundamentals (flex, grid,
spacing scales) that `sx` abstracts away; and the Nordic Horizon redesign discards most existing
styling regardless, so the migration rides along with a rewrite that was happening anyway.

**Migration safety property:** Tailwind v4 emits utilities inside `@layer utilities`, while Emotion
(MUI's engine) injects **unlayered** runtime `<style>` tags. In the cascade, any unlayered rule beats
any layered rule regardless of specificity or source order. Therefore:

> **MUI always wins over Tailwind on the same element. Never mix `sx` and `className` on one element —
> convert a component wholesale or leave it alone.**

This makes the two coexist safely: Tailwind can be installed on day one without visually disturbing the
MUI app, so the migration proceeds one component per commit with a green build throughout, rather than
as a big-bang rewrite.

**Build tooling caveat:** this project runs `vite: npm:rolldown-vite@7.2.5` via npm `overrides`.
`@tailwindcss/vite` uses `createResolver`, which rolldown does not support (the same issue currently
affects Astro 6). **Default to `@tailwindcss/postcss` + `postcss.config.mjs`** — rolldown-vite retains
Vite's PostCSS pipeline, so that path is safe. At this project's size the performance delta is
unmeasurable. *(Spike outcome to be recorded here.)*

### Theme: light and dark, Nordic Light as default
The mockups specify Nordic Light; the original `volvo_theme.ts` implemented `mode: "dark"`. Both are
supported, light is the default, and the switch is built as a **three-layer design token system**:

1. **Primitives** — raw hex named after the paint (`--volvo-sand-dune`, `--volvo-onyx-black`, …),
   mode-agnostic. Source of truth is the `volvoColors` object from the retired `volvo_theme.ts`.
2. **Semantic aliases** — `--color-background`, `--color-text`, `--color-accent`, `--color-surface-glass`,
   `--color-status-{ok,warn,critical}`. Redefined under `.dark`. **Components reference only this layer.**
3. **Tailwind exposure** — via `@theme inline`.

Two Tailwind v4 gotchas worth recording:
- `@custom-variant dark (&:where(.dark, .dark *));` — v4 has no `darkMode: 'class'` config option.
- **`@theme inline` — the `inline` keyword is mandatory.** Plain `@theme` resolves the `var()` at build
  time, so `.dark` overrides would silently never apply. This is the most common v4 token mistake.
- There is no `tailwind.config.js` in v4. Configuration lives in CSS.

Status colors do **not** flip with mode. Components must never hardcode hex — reading
`--color-status-*` means dark mode comes free.

### Panels: config-driven registry
Ten of the eleven panels differ only by `tableName` and `fetchFn`, so they collapse into a registry.
Each `fetchFn` returns a different type, so the generic is discharged inside a factory
(`defineTablePanel<T>(...)`) that returns a uniform `PanelDef`; the array stays homogeneous and no `any`
is needed. Bespoke panels (fuel gauges, interactive car) opt out by supplying `Component` directly —
both paths produce a `PanelDef`, so consumers never branch. Use `satisfies` rather than a type
annotation so literal key types survive.

---

### Data Hierarchy (11 raw API tabs → 4 categories)

| Category | API Sources |
|---|---|
| **Drive** | Fuel, Odometer, Stats, Engine Status |
| **Security** | Doors, Windows, Central Lock |
| **Safety** | Tyres, Brakes, Light Warnings |
| **Service** | Engine Diag, Vehicle Diag |

---

## Testing Strategy

No test framework existed before this point. Tests are introduced **per-milestone, alongside the change
they cover** — not as a separate phase — so each tool arrives when there is a real reason to reach for it.

### The stack

| Layer | Tool | Why |
|---|---|---|
| Runner (front + back) | **Vitest** | Built on Vite; reuses this project's config and path aliases, transforms with esbuild. One runner and one assertion API across the whole stack. |
| Component | **React Testing Library** + `jsdom` | Framework-agnostic, unchanged from Jest. `jsdom` is the default; Vitest browser mode is stable but slower and only earns its cost for real browser behaviour (computed styles, `IntersectionObserver`, focus traps, drag-and-drop). |
| API mocking | **MSW** | Intercepts at the network layer instead of stubbing axios, so handlers survive a change of HTTP client. Makes 500s, slow responses and network errors first-class test inputs. |
| Backend routes | **Supertest** | Wraps the Express app without binding a real port. |
| E2E | **Playwright** | Free parallelism in CI, cross-browser, and the stronger ecosystem bet. Reserved for a handful of critical flows — E2E is the slowest, most brittle layer, so it stays thin. |

**Toolchain note:** Vitest has supported rolldown-vite since **v3.2.2**, and overriding `vite` in
`package.json` is the documented way to use it — so unlike `@tailwindcss/vite`, this is expected to work
out of the box. Verify it early anyway; the failure mode would be the same class of resolver problem.

### The validation loop

The point of testing here is not coverage — it is a **fast, trustworthy signal that a refactor changed
nothing it shouldn't have.** The loop for every change:

```
run the suite (green)  ->  make one change  ->  run the suite  ->  still green?  ->  commit
```

**This matters most during M2 (MUI removal), which rewrites ~17 files.** Well-written RTL tests query by
**accessible role and text — never by class, `data-testid`, or component internals** — so
`getByRole('button', { name: /logout/i })` matches an MUI `<Button>` and a Tailwind `<button>` equally.
That is what makes them a genuine migration safety net rather than churn:

> **Write the characterization test against the MUI component, migrate the component, and the test must
> pass untouched. If a test needs editing to survive the migration, that is a signal it was asserting on
> implementation rather than behaviour.**

That property is also the single best argument for RTL's query priority (`getByRole` > `getByLabelText`
> `getByText` > `getByTestId`), which otherwise reads as arbitrary style advice.

### Rules
- **Green suite is required to merge.** No coverage threshold — on a solo project a percentage target
  mostly produces tests written to satisfy the number rather than to catch bugs. Coverage may be
  *reported* to find gaps; it is not a gate.
- **Test behaviour, not implementation.** No assertions on class names, DOM structure, or internal state.
- **`getByTestId` is a last resort**, and needs a comment explaining why the accessible query failed.
- **A bug fix starts with a failing test** that reproduces it — the `useVehicleData` race and the
  never-clearing error in M3 are the ideal first examples.
- **Keep E2E thin.** Auth gate, VIN selection, one command round-trip. Everything else belongs lower down.

### CI
GitHub Actions runs `build`, `lint`, and `test` on every PR, making the loop enforced rather than
remembered. E2E runs there too, but should be a separate job so a slow browser run never blocks fast feedback.

---

## Current Status

> Task tracking has moved to **GitHub issues** (`ClassDefNotFound/Volvo_Dashboard`), organised by milestone M0–M7.
> This document is now the **design doc of record** — the "why", the visual spec, and the technical conventions.
> It is not a checklist. See the issue milestones for what's next.

### ✅ Complete
- **Phase 0** — Bug fix: `WindowStatusResponse` → `WindowStatus` import, `/windows` endpoint
- **Phase 1** — Backend: all 11 GET status routes + 9 POST command routes in `server/routes/api.ts`
- **Phase 2** — Frontend API layer: 11 status functions + 9 command functions in `src/api/volvo_api.ts`, fully typed
- **Phase 3** — Layout skeleton:
  - `Dashboard.tsx` — AppBar + `VinSelector` + `WebDash`/`MobileDash` breakpoint switch
  - `WebDash.tsx` — collapsible persistent Drawer + main content
  - `MobileDash.tsx` — stacked layout
  - `VehicleDataPanel.tsx` — MUI scrollable Tabs + panel rendering
  - `VinContext.tsx` / `VinProvider.tsx` / `useVin.ts` / `useBreakpoint.ts`
  - `CommandPanel` / `CommandButtonGroups` / `MobileCommandBar` render grouped buttons
  - `TabPanelWrapper` `50dvh` removed; debug borders removed
- **Phase 4** — Panels wired with real data: `useVehicleData` hook + reusable `VehicleDataTable` / `StatusTable`
  (sticky-header table on desktop, card list on mobile). All 11 datasets render.

### 🔲 Known Gaps (tracked as issues)
- **Commands are not wired.** All 9 POST functions exist in `volvo_api.ts`; none are called from any component —
  no `onClick` handlers in `CommandPanel`, `MobileCommandBar`, or the Logout button. *(M6)*
- **`useVehicleData` correctness** — no abort/cleanup on VIN change (stale response can win a race);
  `error` never clears on a successful refetch; `fetchFn` sits in the dep array. *(M3)*
- **`useBreakpoint.isMobile`** uses `down("sm")` (600px) but this guide specifies `md` (900px). *(M2)*
- **Panel duplication** — 10 of the 11 panels are identical 20-line adapters differing only by
  `tableName` and `fetchFn`. Being replaced by a config-driven registry. *(M4)*
- **Theme direction** — the shipped theme was dark; the mockups specify Nordic Light.
  Resolved under "Decisions of Record" above: both, light as default. *(M1)*

---

## Build Order & Sequencing Rationale

Task-level detail lives in GitHub issues. What follows is the **ordering logic** — why the work happens
in this sequence, which is the part that isn't obvious from an issue list.

**M0 Hygiene → M1 Tailwind → M2 MUI removal** before any feature work. A styling migration touching ~17
files is far cheaper on a codebase that isn't simultaneously growing. Doing the Nordic Horizon redesign
on MUI and *then* migrating would mean building the same screens twice.

**M3 (data-layer correctness) before M4 (registry).** Fix `useVehicleData` while there are 11 call sites,
not after a registry multiplies its usage and bakes in its current semantics.

**M4 (registry) before M5 (redesign).** The redesign needs panels grouped by the 4 categories; the
registry is what makes that grouping declarative instead of another round of file shuffling.

**Within M5 — build in this order to avoid rework:**

1. **`useVehicleSummary(vin)`** — replaces 11 individual tab fetches with one parallel `Promise.allSettled`,
   eliminating pop-in. Must return **per-slice** results, not one global error: a single 500 from
   `/warnings` must not blank the whole dashboard. That's the reason for `allSettled` over `all`.
   Everything downstream (car fills, sidebar badges, gauges) reads from this one fetch.
2. **`WebDash.tsx` layout** — tab-based → permanent sidebar (4 category links with icons) + main viewport.
   `selectedCategory` (`'drive' | 'security' | 'safety' | 'service'`) lives here; only lift it to context
   once `InteractiveCar` needs to set it, and even then one level of prop-drilling is fine.
   Use `<nav>` + `<ul>` + `aria-current="page"` — a tabs primitive is the wrong semantics for persistent nav.
3. **`InteractiveCar.tsx`** — inline SVG (not `<img>`) with semantic path IDs (`door-fl`, `door-fr`,
   `door-rl`, `door-rr`, `tyre-fl`, `tyre-fr`, `tyre-rl`, `tyre-rr`). **Build with hardcoded states first
   and commit that**, then wire to `useVehicleSummary` — if the fills are wrong you want to know whether
   it's the SVG or the data. Clicking a part sets `selectedCategory`.
4. **Wire data** — connect `useVehicleSummary` output to `InteractiveCar` fill props and sidebar summaries.
5. **Gauges + polish** — SVG arc gauges for fuel/battery, CSS transitions on SVG fills.

**M6 (commands) last** because it's independent of the redesign and benefits from the toast/dialog
primitives that land with shadcn.

---

## Technical Guidance

### Responsive Layout Strategy
**Prefer CSS over JS.** A Tailwind variant costs nothing at runtime and can't desynchronise from the
stylesheet; a `matchMedia` hook re-renders React and duplicates the breakpoint value in a second place.
Reach for JS only when you genuinely swap components.

| Situation | Approach |
|---|---|
| Same component, different layout (row vs column) | Tailwind variants: `flex-col md:flex-row` |
| Same component, different variant (table vs cards) | Render both, `hidden md:block` / `md:hidden` |
| Genuinely different components (permanent sidebar vs overlay sheet) | `useBreakpoint()` + conditional rendering |

**Breakpoints** — define the px values as constants mirroring Tailwind's `md`/`lg` so the JS and CSS
breakpoints cannot drift:

| Breakpoint | Value | Layout |
|---|---|---|
| `< md` (< 900px) | mobile | Single column, sticky bottom command bar + bottom `Sheet` |
| `md–lg` (900–1200px) | tablet | Sidebar starts collapsed, toggle opens an overlay `Sheet` |
| `> lg` (> 1200px) | desktop | Permanent sidebar (280px) + main viewport |

> Note: `useBreakpoint().isMobile` currently uses `sm` (600px), contradicting this table. Fix to `md` (900px)
> and rewrite on `matchMedia` — `useSyncExternalStore` is the textbook fit (subscribe to an external store,
> return a snapshot).

**Component mapping (shadcn/ui):**
- Desktop sidebar is **not** a `Sheet` — it's a flex child with `w-[280px]` / `w-[50px]` and
  `transition-[width]`. `Sheet` (Radix Dialog) is only correct for the tablet/mobile overlay case.
- `Sheet` with `side="bottom"` for the mobile command panel
- `Tabs`, `Select`, `Table`, `Card`, `Alert`, `Dialog`, `Skeleton` from shadcn; `sonner` for toasts
- `Skeleton` over a spinner for tabular data — no layout shift
- `Box`/`Stack`/`Container`/`Paper` have **no replacement**: they were abstraction tax. Use `<div>` + utilities.
- Icons: `lucide-react`

**Table → Card pattern on mobile:** render both and toggle with `hidden md:block` / `md:hidden`, rather
than branching in JS.

### Interactive SVG Car
Use an **inline SVG** (not `<img>`) so React can reach individual paths. Fills come from **semantic
tokens, never literal hex** — get that right and dark mode costs nothing here:

```tsx
const statusFill = (status: string) =>
  OK_STATES.has(status) ? 'var(--color-status-ok)' : 'var(--color-status-critical)';

<svg viewBox="0 0 200 400" role="img" aria-labelledby="car-title">
  <title id="car-title">Vehicle status overview</title>
  <path
    id="door-fl"
    d="..."
    fill={statusFill(doors.frontLeft)}
    className="transition-[fill] duration-300"
  />
</svg>
```

**Accessibility is the trap here** — this is the dashboard's primary interaction surface, and a bare
`onClick` on a `<path>` is unreachable by keyboard and invisible to screen readers. Every clickable part
needs to be a real button (wrap in `<button>`, or `role="button"` + `tabIndex={0}` + an Enter/Space
`onKeyDown`) with a descriptive `aria-label` such as `"Front left door: ajar"`.

A `type PartId = 'door-fl' | 'door-fr' | …` union plus a `Record<PartId, CategoryId>` map gives
exhaustiveness checking on the part → category mapping, so adding a part without wiring it is a
compile error rather than a dead click.

### SVG Arc Gauges (Fuel / Battery)
Use `stroke-dasharray` / `stroke-dashoffset` on a semicircle path:
- Set `stroke-dasharray` = full arc circumference
- Set `stroke-dashoffset` = `circumference * (1 - percentage)`

Build one generic `ArcGauge({ value, max, label, unit })` — three uses (fuel, battery, service interval)
justify the abstraction. Respect `prefers-reduced-motion` on the fill animation.

**Watch the units.** `FuelStatus.batteryChargeLevel.value` is already a percentage, but
`fuelAmount.value` is **litres** and the API exposes no tank-capacity field. The earlier prototype
divided by a hardcoded `60`. Either derive capacity from `VehicleDetails` or make `max` an explicit prop
with a documented default and a `// TODO` — an honest hardcode beats a silent one.

### Status Color Conventions
- `LOCKED` / `NO_WARNING` / `NORMAL` → `--color-status-ok` (`#6B8F71`)
- `AJAR` / `LOW_PRESSURE` / `FAILURE` / `WARNING` → `--color-status-critical` (`#CF6679`)
- Reference the **token**, not the hex. Status colors do not flip between light and dark.
- Apply as a badge on table views, as SVG path fill on the interactive car.
- Color must never be the only signal — pair it with text or an icon for accessibility.

---

## Verification Checklist

### Per-commit gates
1. `npm run build && npm run lint && npm run test` clean — enforced by GitHub Actions on every PR.
   (`npm run build` only became a trustworthy gate once the `src="/src/assets/volvo_logo.svg"` string was
   replaced with a real import — that path worked in dev but broke the production build, because Vite
   only serves `/src/*` from the dev server.)
2. `npm run dev:all` — Redis (via `predev:all`), backend, and frontend start cleanly.
   Note the Volvo developer-portal test token expires every 15 minutes.

### Migration milestones
2b. **Throughout M2:** every component migration must leave the characterization tests **passing
   untouched**. Editing a test to make it pass after a styling change means the test was asserting on
   implementation — fix the test's queries, not the assertion.
3. **End of M2:** `grep -rn "@mui\|@emotion\|sx=" src/` returns nothing.
   Record the bundle-size delta — baseline before MUI removal was **492.85 kB raw / 155.45 kB gzipped**.
4. **End of M4:** the 11 adapter panels are gone. Check with
   ```sh
   ls src/components/dashboard/panels/*Panel.tsx | wc -l   # 13 now -> 2 after M4
   ```
   The two survivors are `VehicleDataPanel.tsx` and `VehicleInfoPanel.tsx`
   (`commands/CommandPanel.tsx` sits in a subdirectory and is unaffected).

### Functional
5. Desktop: permanent sidebar with 4 categories, interactive car in main viewport, gauge row at bottom
6. Mobile: single-column layout, sticky bottom command bar, slide-up sheet for full commands
7. Tablet: collapsed sidebar, toggle opens overlay
8. Changing VIN — all data re-fetches. **Throttle to Slow 3G and switch VIN rapidly**: the final render
   must match the final selection (this is the stale-response race).
9. Force a 500 — the error surfaces, and a subsequent successful refetch **clears** it.
10. Kill one status endpoint — the rest of the dashboard still renders (partial-failure handling).
11. Clicking a car part (door/tyre) — sidebar switches to that category
12. SVG fills transition smoothly on state change
13. Command button → per-button loading state → toast feedback. Two commands in flight show two
    independent spinners, not one global one.

### Cross-cutting — check at every UI milestone
14. **Both themes.** Toggle `.dark` on `<html>` and re-check; no hardcoded hex should survive.
15. **All three breakpoints** — <900 / 900–1200 / >1200.
16. **Keyboard only** — sidebar nav, tabs, VIN select, command buttons, and every interactive car part
    reachable and operable; visible focus rings throughout.
