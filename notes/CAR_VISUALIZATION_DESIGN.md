# Interactive Car Visualization — Photo Hero + SVG Diagnostic

> **Status:** approved design decision, 2026-09-23. **Revised 2026-09-24:** the hero ships as the
> **photographic `exteriorImageUrl` render**, not a traced SVG, and **door animation is dropped from
> the hero** — see *Hero: photo, not vector* below. **Not yet implemented** — this is M4 work and the
> repo is currently on M0 (`phase-0-hygiene`). Nothing here should be built until M1 lands the
> semantic token layer (#3), because the diagnostic view consumes `--color-status-*`.
>
> Supersedes pillar 3 of `notes/IMPLEMENTATION_GUIDE.md` ("inline top-down car outline"). Fold the
> decisions below into that file's *Decisions of Record* when this work starts.

## Context

The current car graphic in `mockups/DASHBOARD_WIREFRAME.svg` is a dashed top-down outline: a
generic capsule shape that reads as a wireframe placeholder rather than a vehicle. It communicates
state adequately (green door stubs, a red tyre rect) but it doesn't look like a car, and it isn't
interactive beyond clicking a part.

The desire was for something closer to a vehicle configurator — drag to see different sides, with
the model reflecting live state (a door shown swung open when `frontLeftDoor === "AJAR"`).

Research finding that shaped this plan: **continuous drag-spin and state-responsiveness are
mutually exclusive in the pre-rendered approach** that real configurators use. Porsche's spinner is
46 studio photographs; representing 8 openable parts across 36 angles is 9,216 assets. And no
Volvo endpoint serves a 360 sequence — `VehicleDetails.images.exteriorImageUrl` is one static render.

Separately, no shipping vehicle-status app (Tesla, Rivian, Polestar, Volvo's own) offers drag-spin
on its status screen. They all use a fixed three-quarter hero whose parts animate open. Drag-spin
lives in the configurator, where the job is "show me what I'm buying." A status dashboard's job is
"tell me what's wrong," and **top-down is the only angle where all four doors and all four tyres are
visible at once** — which is why every OEM uses top-down specifically for lock and tyre status.

**Intended outcome:** two purpose-built views instead of one compromised one. A three-quarter
**hero** that looks like the user's actual car, and the **top-down diagnostic** schematic, with a
toggle between them. Doors, windows, hood and tailgate animate open from API state **in the
diagnostic view**; the hero conveys state through badges. This absorbs into M4 without adding a
milestone, and preserves every accessibility, token and testability decision already recorded in
`notes/IMPLEMENTATION_GUIDE.md`.

### Hero: photo, not vector (decided 2026-09-24)

Both a traced vector hero and the raw render were prototyped in Figma. The render won, and the
reasoning matters because it inverts the original rationale for tracing:

- Tracing was justified by door animation. **It does not deliver that.** In a three-quarter view a
  door swings *toward the camera* — a perspective change, not a 2D rotation — so an in-plane rotation
  looks broken either way. Vector bought highlighting and theming, not motion.
- Door animation was explicitly accepted as nice-to-have, not a requirement.
- The photograph is the actual vehicle, costs no art budget, and never drifts from the real car.

Consequences to design around:

- **Badge anchoring is per-model and per-angle.** Overlay coordinates are tied to this specific
  render's framing (XC60, `angle=4`). A different model, trim or angle moves the doors under the
  badges. Anchor badges as fractions of the image box and treat them as approximate pointers, not
  precise hit targets — or hide hero badges entirely for vehicles whose framing is unverified.
- **The hero can fail to load.** It is a network image from a host that rejects some clients. The
  top-down SVG is the natural fallback: on image error, fall back to it rather than showing a gap.
- **Hero part clicks are gone.** Without vector parts there is nothing to click. Clicking a part to
  set `selectedCategory` now happens only in the diagnostic view; the hero's badges can carry that
  affordance instead, since they are ordinary DOM buttons positioned over the image.

`mockups/CAR_HERO_WIREFRAME.svg` (auto-traced) is retained as a **rejected alternative**, not a build
target. It is still the reference if the hero ever needs to be model-agnostic or themeable.

Full 3D (React Three Fiber + glTF) was considered and declined for now: its blocker is asset
licensing, not code — it needs a rigged `.glb` with separately named door meshes, which no amount of
coding progress unblocks. It also costs ~150–200 kB gzipped against a 155 kB baseline, needs a
parallel hidden-DOM accessibility tree because `<canvas>` has no DOM, and contradicts three decisions
of record. If it's revisited, it belongs after M6 with the SVG car as the degradation target.

> Per `CLAUDE.md` interaction mode, this is a build guide for the user to implement, with Claude
> reviewing. Steps are written as what to build and what to watch for, not as Claude's task list.

---

## The design

### Two views, two different jobs

| | **Hero** (front three-quarter) | **Diagnostic** (top-down) |
|---|---|---|
| Purpose | Identity — "this is *my* car" | Triage — "what's wrong, and where" |
| Medium | `<img>` of `images.exteriorImageUrl` | Inline SVG, semantic `PartId` paths |
| Status shown as | Badge pinned over the image | Flat fill, green/red |
| Animates | No | Doors/hood/tailgate swing, windows slide |
| Interactive parts | Badges only | Every part is a button |
| Parts visible | FL/FR doors, hood, FL/FR tyres, windscreen, front lights | All 4 doors, all 4 tyres, tailgate, hood, sunroof |
| Default | ✅ on load | — |

**This is an amendment to pillar 3 of the guide.** "React changes individual `<path>` fills based on
API state (green = secure, red = warning)" holds for the diagnostic view only. Painting the hero's
doors green would look broken. Status colour is never the only signal in either view — the badge and
the roll-up line carry it too, consistent with the existing status-colour decision.

### Interactions, in priority order

1. **View toggle** — a segmented control (`role="radiogroup"`, two radios; *not* a tabs primitive —
   these aren't tab panels). Plain user state defaulting to `'hero'`.
2. **Part animation from state** — **diagnostic view only**: doors/hood/tailgate swing on a CSS
   transform; windows slide. The hero is a still image and does not animate.
3. **Part click → category** — clicking a part sets `selectedCategory`. In the diagnostic view that
   is every part; in the hero it is the badges.
4. **Pointer-parallax tilt** — a few degrees of rotation following the pointer, so the hero feels
   alive without pretending to be a spinner.

Explicitly **not** doing: continuous drag-spin, auto-rotate idle animation.

### The correctness trap this introduces

**Parts hidden in the current view must still be reported.** The hero view can't show a rear-left
door ajar. If the roll-up line under the car only summarises visible parts, switching to hero
silently hides a real warning.

So: the roll-up beneath the car reads from the **full** summary regardless of active view, and a
warning on a part not visible in the current view gets an affordance pointing at the other view
(e.g. "1 issue not visible in this view — switch to top-down"). The derivation layer from #18
already computes full roll-ups; this consumes them rather than recomputing per-view.

Related, from the existing guide note: `UNSPECIFIED`/missing is an explicit **unknown** state, never
folded into OK. A part in unknown state renders with the unknown treatment in both views.

---

## Files

### New — `src/components/dashboard/car/`

| File | Contents |
|---|---|
| `carParts.ts` | `type PartId` union; `PART_CATEGORY: Record<PartId, CategoryId>`; `VIEW_PARTS: Record<CarView, readonly PartId[]>`; `PART_LABELS` for `aria-label` construction |
| `InteractiveCar.tsx` | Owns `view` state, renders the toggle, the active view, and the roll-up line. Maps summary → per-part status. |
| `CarHeroView.tsx` | `<img>` of `exteriorImageUrl` plus absolutely-positioned badge buttons. Takes the image URL + per-part status. Falls back to the diagnostic view on image error. |
| `CarTopDownView.tsx` | Top-down inline SVG, evolved from the existing wireframe path data. |
| `CarPart.tsx` | One interactive part: `<button>` wrapping the `<path>`, `aria-label`, status→visual mapping. |
| `useParallaxTilt.ts` | Pointer-tilt hook. Returns a ref. |

`carParts.ts` keeps the `Record<PartId, CategoryId>` exhaustiveness guarantee already specified —
adding a part without wiring its category stays a compile error. `VIEW_PARTS` extends the same idea
to view membership.

### Modified

- `notes/IMPLEMENTATION_GUIDE.md` — amend pillar 3 (fill convention is per-view); rewrite the
  "Interactive SVG Car" section for two views; amend M4 build-order step 3.
- `mockups/DASHBOARD_WIREFRAME.svg` — replace the dashed capsule with the diagnostic-view art.
- `mockups/CAR_HERO_WIREFRAME.svg` — auto-traced three-quarter vector. **Rejected alternative**, kept
  for the record; not a build target. Its builder lives only in the session scratchpad, so treat the
  committed SVG as the artefact.
- GitHub #15 — extend scope (see Milestone impact).

### Reused, not rebuilt

- `src/lib/derive/` roll-ups (#18) — the full-summary roll-up and the unknown-state handling.
- `useVehicleSummary(vin)` (M4 step 1) — the single data source; the car never fetches.
- Semantic tokens `--color-status-{ok,warn,critical}` and the unknown-state token from #3.
- Existing top-down path data in `mockups/DASHBOARD_WIREFRAME.svg` and the `AJAR` swung-door stub
  in `mockups/PANEL_WIREFRAMES.svg` — starting geometry, not a rewrite.
- `images.exteriorImageUrl` — already typed in `shared/types/api.ts`. It **is** the hero asset now,
  not a tracing reference. `externalColour` is no longer needed for the hero (the render already
  shows the real paint); it remains useful for the sidebar vehicle card.

---

## Build order

Slots into M4 step 3, after `useVehicleSummary` and the `WebDash` layout, before wiring data.
The guide's existing rule holds: **hardcoded states first, commit that, then wire.**

1. **`carParts.ts`** — the part taxonomy, category map and per-view membership. Pure, no rendering.
2. **Diagnostic view art** — evolve the existing top-down path into a recognisable silhouette with
   real door cut-lines. Named paths per `PartId`. Hardcoded states.
3. **`CarPart.tsx` + status visuals** — the button/label/keyboard contract in one place so both
   views inherit it. Verify with keyboard and a screen reader before there are two views to debug.
4. **Door/window animation** — diagnostic view only, CSS transforms. Commit with hardcoded states.
5. **Hero view** — `<img>` of `exteriorImageUrl` with fraction-anchored badge buttons over it, plus
   the fallback-to-diagnostic path on image error. No art task: the render *is* the asset.
6. **View toggle + roll-up** — including the hidden-part affordance.
7. **`useParallaxTilt`** — last; it's polish and must degrade cleanly.
8. **Wire to `useVehicleSummary`** — per the guide's existing step 4.

---

## Implementation notes

**Door hinge direction is per-side data, not a constant.** A left-side door hinged at its forward
edge swings outward under a *positive* (clockwise) SVG rotation; a right-side door needs the
negative. Getting this backwards swings the door through the cabin — it looks obviously broken, and
it was the first bug the Figma mockup surfaced. Store the sign alongside the hinge point in
`carParts.ts` rather than deriving it at render time.

**`--` is illegal inside an XML comment.** Writing `var(--color-status-ok)` in an SVG comment makes
the whole document fail to parse, and the asset silently renders as a broken image. Since this
component is all about CSS custom properties, spell token names without the leading dashes in
comments.

**No three-quarter view can animate doors — vector or photo.** A door swings *toward the camera*,
which is a perspective change, not a 2D rotation, so an in-plane rotation looks broken regardless of
medium. This is why tracing was abandoned (see *Hero: photo, not vector*): it could not deliver the
one thing it was justified by. Door motion is a top-down-only capability.

**Fetching `exteriorImageUrl` server-side: use `fetch`, not `axios`.** The CAS image host sits behind
Akamai and rejects default Node clients. Measured, three runs each:

| client | result |
|---|---|
| Node built-in `fetch` (undici) | **200** |
| `axios` with default headers | **403** |
| `axios` + browser `User-Agent` | **200** |

`server/routes/api.ts` uses `axios` with only `Accept: application/json`, so an image proxy copied
from those handlers would 403 in a way that looks like a credentials problem but isn't. A browser
`<img src={exteriorImageUrl}>` also works, so a proxy is only needed for caching or URL hiding.

**SVG transform origins.** `transform-origin` on an SVG element resolves against the viewport, not
the element, unless you set `transform-box: fill-box`. Without it, hinges will be wildly off. Set
both, and place the origin at the hinge edge:

```css
.car-door { transform-box: fill-box; transform-origin: <hinge edge>;
            transition: transform 300ms ease-in-out, fill 300ms ease-in-out; }
```

**Parallax without re-renders.** A `pointermove` handler that calls `setState` re-renders the tree on
every mouse event. Write to CSS custom properties through a ref instead, coalesced in
`requestAnimationFrame`, and let CSS consume them — React never re-renders. This is the general
pattern for high-frequency pointer input and worth internalising beyond this component.

Disable the tilt entirely under `prefers-reduced-motion: reduce` and `pointer: coarse` (no hover on
touch; the handler is pure overhead there).

**Reduced motion.** Under `reduce`, drop the swing and slide transitions — status still reads through
colour, badge and roll-up text. Do not merely shorten the durations. Same treatment for the arc
gauges, per the existing `ArcGauge` note.

**View switching and the tab order.** Unmount the inactive view rather than keeping both mounted at
`opacity: 0`. Two mounted views means duplicate part buttons in the tab order and duplicated
`aria-label`s. Animate the entering view in; skip the crossfade. If a true crossfade is wanted later,
the outgoing view needs `inert`, not just `aria-hidden`.

**Auto-switching view from category — deliberately deferred.** Selecting Security or Safety could
auto-switch to top-down, since that's where those parts live. But clicking a part also sets the
category, so the two form a feedback loop that's easy to get wrong and disorienting when it fires
against an explicit user choice. Ship manual switching; revisit in M6 with an explicit
user-override flag if it still seems worth it.

---

## Verification

**Static, before data.** With hardcoded states, walk every part in both views:
- Tab reaches every visible part in DOM order; Enter and Space both activate; focus ring visible.
- VoiceOver (⌘F5) announces each as a button with a state-bearing label — `"Front left door: ajar"`.
- `<title>` on each SVG is announced.

**State matrix** — drive `CarHeroView`/`CarTopDownView` directly with hardcoded props:
- all secure → no warning styling anywhere, roll-up says all-clear
- one visible part ajar → swung open, status treatment, roll-up names it
- **one part ajar that is not visible in the active view** → roll-up still names it and the
  switch-view affordance appears. This is the regression most likely to slip through.
- `UNSPECIFIED` on a part → unknown treatment, not green
- unknown `externalColour` → hero falls back to a neutral body fill rather than `undefined`

**Motion.** macOS System Settings → Accessibility → Display → Reduce Motion, then reload: no swing,
no tilt, status still legible. Confirm no re-render storm on pointer move (React DevTools profiler,
"Highlight updates" — the car subtree must not flash while moving the pointer).

**Automated**, extending #15 (`area:svg`, `area:a11y`) per the existing testing rules — behaviour not
implementation, `getByRole` first:
- `getAllByRole('button')` per view returns exactly `VIEW_PARTS[view]`
- toggling the view swaps the button set and leaves no stale buttons
- roll-up text covers parts absent from the active view
- `PART_CATEGORY` exhaustiveness is compiler-proven, so **don't** test it — the existing rule
  "do not test what the compiler already proves" applies

**Wired.** `npm run dev:all`, log in, confirm the car reflects the live vehicle and that a failing
`/doors` slice degrades that part to unknown without blanking the dashboard (the `allSettled`
per-slice guarantee from M4 step 1).

---

## Milestone impact

**Absorbed into M4. No new milestone.** `InteractiveCar.tsx` was already on M4's critical path; this
changes what it renders. The 2026-09-24 revision **removes work** rather than adding it.

- **#15** grows from "interactive car a11y" to cover view switching, per-view part sets, and the
  hidden-part roll-up. Still one issue, closer to the top of `size:L`. It no longer needs to cover
  hero part buttons — the hero has badges, not parts.
- **No hero-art issue.** An earlier draft proposed one at `size:L`; choosing the photographic hero
  deletes it outright. That was the largest single task in this plan and the likeliest to slip.
- **New issue: hero image loading** (`size:S`) — fraction-anchored badge overlay, `onError` fallback
  to the diagnostic view, and a decision on whether to proxy (see the `fetch`-vs-`axios` note).
- **New issue: `useParallaxTilt`** (`learning:react`, `size:S`) — small, self-contained, and a good
  vehicle for the ref-plus-CSS-custom-property pattern.
- **M1, M2, M3 unchanged.** Nothing here touches tokens, the data layer or the registry. The status
  tokens this needs are already in #3's scope; confirm #3 includes an **unknown**-state token
  alongside `ok`/`warn`/`critical`, and add it there if not.
- **M6** picks up the deferred category→view auto-switch and an optional crossfade.
- **`mockups/` and the guide** are updated as part of this work, not deferred to #22 — #22 reconciles
  the guide against `main` for M0 and closes before any of this starts.

**Not in scope:** any 3D or WebGL work; a licensed vehicle model; continuous drag-spin.

---

## Sources

- [We Reverse-Engineered 12 Product Configurators](https://dev.to/podifai/we-reverse-engineered-12-product-configurators-heres-whats-actually-under-the-hood-12ld) — pre-rendered vs. real-time, and the Porsche 46-photo example
- [Configure 3D models with react-three-fiber](https://blog.logrocket.com/configure-3d-models-react-three-fiber/) — what the 3D path would have involved
- [React Three Fiber — Loading Models](https://r3f.docs.pmnd.rs/tutorials/loading-models) — the per-mesh grouping requirement that makes a rigged model the blocker
