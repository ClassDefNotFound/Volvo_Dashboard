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
The mockups specify Nordic Light; `src/themes/volvo_theme.ts` currently implements `mode: "dark"` and is
still live — `App.tsx` imports it and passes it to `ThemeProvider`. It is retired *by* M1, as part of
building the token system below, not before. Both modes are supported in the target, light is the
default, and the switch is built as a **three-layer design token system**:

1. **Primitives** — raw hex named after the paint (`--volvo-sand-dune`, `--volvo-onyx-black`, …),
   mode-agnostic. Source of truth is the `volvoColors` object exported from `volvo_theme.ts`, which is
   why that file outlives the MUI theme it also defines.
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

### Mockup reconciliation (swept 2026-09-16)

A line-by-line comparison of `src/` against the three wireframes. Recorded because these gaps are
invisible until you try to build the screen, and because the resolutions are decisions, not facts.

**Confirmed: there is no generic table anywhere in the new design.** All four category panels are
bespoke — radial gauges and stat cards (Drive), a mini car blueprint plus a 3-row summary (Security),
tyre cards and a 23-light indicator grid (Safety), vertical bar gauges and a service timeline (Service).
`StatusTable` has no successor, which is the strongest single confirmation that the UI is being replaced
rather than restyled.

Consequences for the formatters currently inside `StatusTable`:
- `formatCamelCaseText` — **dead.** Every label in the mockups is hand-written ("Central Lock",
  "Tyre Pressure", "ENGINE OIL"). Nothing renders auto-formatted API keys.
- `formatTimestamp` — **dead.** No timestamp appears in any wireframe.
- `formatValueWithUnit` — survives in spirit, but the mockups show `12,450 km` with a thousands
  separator, which the current code does not do. That is new locale-formatting work, not a hoist.

**What survives:** `App.tsx` auth gate, `LoginPage` (absent from the mockups, so unchanged),
`volvo_api.ts`, `useVehicleData`, `useVin` / `VinContext`, and the mobile command bar's structure
(the mockup shows 5 icons to the current 6).

#### Resolved design gaps

| Gap | Resolution |
|---|---|
| **Desktop wireframe shows no command controls at all**, yet `CommandPanel` lives in the drawer being deleted | Commands become an **icon bar in the main viewport header**, beside Logout. Always visible, reuses the mobile bar's icon vocabulary, and does not compete with the sidebar's category nav. |
| **Desktop wireframe shows no VIN selector** (mobile has a `VIN: YV1..▾` pill) | The VIN selector joins the same main header, next to the command icons. Treated as a mockup omission rather than a removal — multi-vehicle accounts still need it. |
| **Mockups show "72% Fuel", but `FuelStatus.fuelAmount` is litres with no capacity field** | Render a **percentage only when a tank capacity is known** for the model, otherwise fall back to showing litres. Never invent a capacity — this is the wall the old prototype hit with its hardcoded `/60`. `batteryChargeLevel` is unaffected; it is already a percentage. |

#### Correction to an earlier draft of this guide
The mobile layout was described as having a "bottom category nav". It does not:
`MOBILE_DASHBOARD_WIREFRAME.svg` puts the four categories in a **horizontal pill row** beneath the hero
car, and reserves the **sticky bottom bar for commands**. Two different components.

---

### The derivation layer

**The new design is summary-first, and the current codebase has no derivation logic at all** — it renders
raw API fields into tables. The mockups display values that are not API fields:

| Displayed | Derived from |
|---|---|
| "Windows: **1 AJAR**" | a count across the 5 `WindowStatus` fields |
| "**+ 17 more OK**" | an aggregate across the 23 `Warnings` lights |
| "● **All Systems Secure**" / "**SECURE**" | a roll-up across doors, windows, central lock and tyres |
| "RANGE (TOTAL) **420 km**" | `distanceToEmptyTank` **+** `distanceToEmptyBattery` — the API exposes these separately, never as a total |
| "Next service in 4,550 km" | `distanceToServiceKm` — available directly, no derivation needed |

These live in **`src/lib/derive/`** as pure functions over the shared API types, landing alongside the
panel registry — before the UI needs them, so components stay presentational.

They are also the **most testable code in the project**: pure input → output, no DOM, no mocking, no
async. Table-driven tests over a handful of fixtures cover the interesting cases (all-secure, one ajar,
several ajar, missing data). Worth writing test-first — the contract is fully knowable in advance.

Design note: every roll-up needs an explicit **unknown** state. A vehicle that failed to report door
status is not "secure", and defaulting a missing value to OK is how a dashboard tells a comfortable lie.

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

The point of testing here is not coverage — it is a **fast, trustworthy signal**. The loop for every change:

```
run the suite (green)  ->  make one change  ->  run the suite  ->  still green?  ->  commit
```

To be enforced by CI on every PR — see the CI section below for what exists today.

### What to test early, and what to wait on

**The UI is being scrapped, not ported.** The current dashboard (11 tabs, drawer, tables) is replaced by
the Nordic Horizon design, so tests asserting on current UI behaviour — tab switching, drawer state,
current table structure — would describe behaviour that is deliberately being deleted. Writing them
would be churn, and worse, it teaches distrust of the suite.

So testing follows what **survives a UI rebuild**:

| Test early — presentation-agnostic | Wait for the new UI |
|---|---|
| The whole backend (`server/routes/api.ts`) | Component structure and layout |
| `useVehicleData`, `volvo_api.ts`, hooks | Tab / drawer / navigation behaviour |
| Pure logic: formatters, gauge math | Anything asserting on current screens |
| The registry contract — all 11 endpoints reachable | |

**Test-first where the contract is knowable in advance:**
- **Bug fixes — always.** The `useVehicleData` race and sticky error are the ideal examples: you know
  exactly what correct looks like, so the test comes first and must fail against current `main`.
- **Pure logic** — formatters, gauge math, registry wiring.
- **Backend routes** — the API shape is already fixed.

**Test-after, but in the same PR,** for UI components — their behaviour is decided while building
(what happens when a command fails mid-flight, when a VIN has no data, when one endpoint 500s), and
those decisions cannot be meaningfully asserted before they exist.

### Query discipline

`getByRole` > `getByLabelText` > `getByText` > `getByTestId`. Never assert on class names, DOM
structure, or internal state. This still matters even though there is no port to survive: role-based
queries are what let a component be restyled or restructured without rewriting its test, and they
double as an accessibility check — if you cannot query it by role, a screen reader cannot find it either.

### Rules
- **Green suite is required to merge.** No coverage threshold — on a solo project a percentage target
  mostly produces tests written to satisfy the number rather than to catch bugs. Coverage may be
  *reported* to find gaps; it is not a gate.
- **Test behaviour, not implementation.** No assertions on class names, DOM structure, or internal state.
- **`getByTestId` is a last resort**, and needs a comment explaining why the accessible query failed.
- **A bug fix starts with a failing test** that reproduces it.
- **Never write a test for a component slated for deletion.**
- **Do not test what the compiler already proves.** The registry's type-level guarantees (the generic
  discharged inside the factory, `satisfies` preserving literal keys) are enforced by `tsc`; runtime
  tests for them are noise.
- **Do not hit the real Volvo API from tests.** The developer-portal token expires every 15 minutes,
  so a suite touching it fails for reasons unrelated to your code. Stub at the network boundary.
- **Keep E2E thin.** Auth gate, VIN selection, one command round-trip. Everything else belongs lower down.

### CI

**There is no `.github/workflows/` directory yet.** Nothing is enforced automatically today; the gates
below are run by hand. Recording this plainly because "enforced by CI" was previously written here as
fact, and a gate that is assumed rather than observed is exactly the failure mode M0 existed to close.

The target: GitHub Actions runs `build`, `lint`, and `test` on every PR, making the loop enforced rather
than remembered. E2E runs there too, but as a separate job so a slow browser run never blocks fast
feedback. This lands with the test harness in M1 — `test` has to exist before a workflow can run it.

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
  no `onClick` handlers in `CommandPanel`, `MobileCommandBar`, or the Logout button. *(M5)*
- **`useVehicleData` correctness** — no abort/cleanup on VIN change (stale response can win a race);
  `error` never clears on a successful refetch; `fetchFn` sits in the dep array. *(M2)*
- **No derivation layer.** The new design is summary-first, but the codebase only renders raw API
  fields. Aggregates like "1 AJAR", "+17 more OK" and total range have to be built. *(M3)*
- **Panel duplication** — 10 of the 11 panels are identical 20-line adapters differing only by
  `tableName` and `fetchFn`. Being replaced by a config-driven registry. *(M3)*
- **`useBreakpoint.isMobile`** uses `down("sm")` (600px) but this guide specifies `md` (900px).
  A carry-over fix; can land any time after M1, needed before the responsive work in *(M4)*.
- **`LoginPage` passes a `MouseEvent` into `login()`**, and **`Dashboard.getVehicles()`** has no
  `try/catch` and indexes `data[0]` unguarded. Both survive into the new shell. *(carry-over)*
- **Theme direction** — the shipped theme was dark; the mockups specify Nordic Light.
  Resolved under "Decisions of Record" above: both, light as default. *(M1)*

---

## Build Order & Sequencing Rationale

Task-level detail lives in GitHub issues. What follows is the **ordering logic** — why the work happens
in this sequence, which is the part that isn't obvious from an issue list.

**Build forward, do not port.** The current UI is being scrapped, so there is no separate "migrate MUI to
Tailwind" step. Porting `StatusTable`, `VehicleDataPanel`, `TabPanelWrapper` and the drawer to Tailwind
while preserving their behaviour, only for the redesign to delete or reshape them, would mean building
the same screens twice.

Instead, **new Tailwind components are written directly in the target design, and old components are
deleted as each is replaced** — a strangler pattern on the UI. MUI leaves when its last consumer does,
rather than as a milestone of its own. The app stays working at every step, and nothing is built twice.

The ordering that follows from this:

**M1 (Tailwind + tokens + test foundation) first.** Tokens must exist before any new component is written,
or every component gets built twice — once with ad-hoc colours and once with tokens. The test foundation
lands here too, aimed at what survives a UI rebuild: the backend and pure logic.

**M2 (data-layer correctness) before M3 (registry).** Fix `useVehicleData` while there are 11 call sites,
not after a registry multiplies its usage and bakes in its current semantics. This work is entirely
presentation-agnostic, so it is unaffected by the UI rebuild.

**M3 (registry + derivations) before M4 (UI).** The 4-category registry *is* the new information
architecture — the sidebar and the registry are the same idea expressed twice. Establishing it first
means the UI build consumes a declarative structure instead of doing another round of file shuffling.
The derivation layer lands here too: the new design is summary-first, and building those pure functions
before the components that display them keeps the components presentational. Both are pure and
fully testable ahead of any UI existing.

**Within M4 — build in this order to avoid rework:**

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

**M5 (commands) after the UI** because it's independent of the redesign and benefits from the
toast/dialog primitives that land with shadcn. **M6** closes out with polish and a thin E2E suite,
written once the UI has stopped moving.

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
| `< md` (< 900px) | mobile | Hero car, horizontal category **pill row**, content card, sticky bottom **command** bar + bottom `Sheet` for overflow commands |
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
divided by a hardcoded `60`.

**Resolution:** render a percentage **only when a capacity is known** for the model, otherwise fall back
to showing litres (`43 L`). `ArcGauge` should therefore accept an optional `max` and have a defined
behaviour when it is absent — a bare value readout rather than an arc. Never invent a capacity to make
the gauge look complete.

### Status Color Conventions
- `LOCKED` / `NO_WARNING` / `NORMAL` → `--color-status-ok` (`#6B8F71`)
- `AJAR` / `LOW_PRESSURE` / `FAILURE` / `WARNING` → `--color-status-critical` (`#CF6679`)
- Reference the **token**, not the hex. Status colors do not flip between light and dark.
- Apply as a badge on table views, as SVG path fill on the interactive car.
- Color must never be the only signal — pair it with text or an icon for accessibility.

---

## Verification Checklist

### Per-commit gates

Run by hand for now — there is no CI workflow yet (see the CI section above).

1. **`npm run build`** — currently `tsc -b && npm run typecheck:server && vite build`. Sequential, not
   parallel, so a failure is legible and a red build leaves no `dist/` behind. Since M0 this covers
   `server/` too: `tsx watch` strips types without checking them, so before #19 every server change
   shipped unverified. Verified by introducing a deliberate server type error and watching the command
   exit non-zero.

   (It only became a trustworthy gate at all once the `src="/src/assets/volvo_logo.svg"` string was
   replaced with a real import — that path worked in dev but broke the production build, because Vite
   only serves `/src/*` from the dev server. A string reference is invisible to the import graph, which
   is why assets get checked by filename rather than by `import`.)
2. **`npm run lint`** — `eslint .`, split by environment since #20: `globals.browser` plus the React
   plugins for `src/**`, `globals.node` for `server/**` and `vite.config.ts`, and no runtime globals for
   the type-only files in `shared/**`. Note that browser globals in server code surface as a **`tsc`**
   error (TS2584), not a lint error — `typescript-eslint` disables `no-undef` because TypeScript does
   that job better.
3. **`npm run test`** — does not exist yet; arrives with the Vitest harness in M1.
4. **`npm run dev:all`** — Redis (via `predev:all`), backend, and frontend start cleanly.
   `predev:server` runs the server typecheck once at startup; note that this says "types were clean when
   I booted", not "types are clean now", because `tsx watch` restarts on change without re-running it.
   The Volvo developer-portal test token expires every 15 minutes, so a 401 here is the token, not a
   regression.

### Milestone gates
5. **End of M3:** the 11 adapter panels are gone. Check with
   ```sh
   ls src/components/dashboard/panels/*Panel.tsx | wc -l   # 13 now -> 2 after M3
   ```
   The two survivors are `VehicleDataPanel.tsx` and `VehicleInfoPanel.tsx`
   (`commands/CommandPanel.tsx` sits in a subdirectory and is unaffected).
6. **Throughout M4:** each new component lands with its own tests in the same PR, and deletes the old
   component it replaces in the same commit. Two implementations of the same screen should never
   coexist past a single PR.
7. **End of M4:** `grep -rn "@mui\|@emotion\|sx=" src/` returns nothing — MUI leaves as a consequence of
   the last consumer being replaced, not as a milestone of its own. Then record the bundle-size delta;
   the baseline is **492.85 kB raw / 155.45 kB gzipped** (measured 2026-09-09 at commit `5599356`, and
   unchanged as of the end of M0 — nothing removed in M0 was reachable from the bundle).
   Also confirm `package.json` no longer lists `@mui/*` or `@emotion/*`. (`the-new-css-reset` was already
   removed in #21 — its import was dropped in favour of MUI's `CssBaseline` back in `f8725bd`, leaving
   the package behind as a dead dependency.)

### Functional
8. Desktop: permanent sidebar with 4 categories, interactive car in main viewport, gauge row at bottom
9. Mobile: hero car, horizontal category pill row, content card, sticky bottom **command** bar,
   slide-up sheet for overflow commands. (Categories are pills, not a bottom nav — the bottom bar is commands.)
10. Tablet: collapsed sidebar, toggle opens overlay
11. Changing VIN — all data re-fetches. **Throttle to Slow 3G and switch VIN rapidly**: the final render
    must match the final selection (this is the stale-response race).
12. Force a 500 — the error surfaces, and a subsequent successful refetch **clears** it.
13. Kill one status endpoint — the rest of the dashboard still renders (partial-failure handling).
14. Clicking a car part (door/tyre) — sidebar switches to that category
15. SVG fills transition smoothly on state change
16. Command button → per-button loading state → toast feedback. Two commands in flight show two
    independent spinners, not one global one.

### Cross-cutting — check at every UI milestone
17. **Both themes.** Toggle `.dark` on `<html>` and re-check; no hardcoded hex should survive.
18. **All three breakpoints** — <900 / 900–1200 / >1200.
19. **Keyboard only** — sidebar nav, tabs, VIN select, command buttons, and every interactive car part
    reachable and operable; visible focus rings throughout.
