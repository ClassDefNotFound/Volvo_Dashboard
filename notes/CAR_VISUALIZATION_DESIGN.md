# Interactive Car Visualization — Photo Hero + SVG Diagnostic

> **Status:** approved design decision, 2026-09-23. **Revised 2026-09-24:** the hero ships as the
> **photographic `exteriorImageUrl` render**, not a traced SVG, and **door animation is dropped from
> the hero** — see *Hero: photo, not vector* below. **Revised 2026-09-30:** window state is
> **reported in a glass rail beside the car, never drawn on it**, and the top-down silhouette is
> reshaped to be directional — see *Windows: reported, not drawn* below.
> **Not yet implemented** — this is M4 work; M0 is closed and merged to `main`. Nothing here should
> be built until M1 lands the semantic token layer (#3), because the diagnostic view consumes
> `--color-status-*` including the **unknown** token that #3 now carries.
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
toggle between them. Doors, hood, tailgate and tank lid animate open from API state **in the
diagnostic view**; window state is reported in the glass rail rather than animated (see *Windows:
reported, not drawn*); the hero conveys state through badges. This absorbs into M4 without adding a
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

`mockups/CAR_HERO_WIREFRAME.svg` (auto-traced) was retained for a week as a rejected alternative and
has since been **deleted** — it was never a build target, and keeping a rejected artefact around
invites someone to build from it. The Figma file still holds the frame *Desktop — Hero, TRACED
VECTOR (rejected alternative)* if the reasoning ever needs re-reading.

Full 3D (React Three Fiber + glTF) was considered and declined for now: its blocker is asset
licensing, not code — it needs a rigged `.glb` with separately named door meshes, which no amount of
coding progress unblocks. It also costs ~150–200 kB gzipped against a 155 kB baseline, needs a
parallel hidden-DOM accessibility tree because `<canvas>` has no DOM, and contradicts three decisions
of record. If it's revisited, it belongs after M6 with the SVG car as the degradation target.

### Windows: reported, not drawn (decided 2026-09-30)

The top-down view could not distinguish a window from a door — both are the same flank strip. The
instinct was to go more 3D so the two could be told apart. The research says otherwise.

**No mainstream OEM app draws per-window state on the car graphic.** BMW consolidates everything
into a single "all doors and windows closed" statement in a DOORS & WINDOWS menu. Tesla's overhead
view shows doors, trunk and frunk; windows are a separate control and are never drawn open.
Rivian's top-down covers locks, trunk, frunk and lighting. Volvo's own app uses a doors view plus
exterior-status notifications that *name* what is open.

The reason is structural, and it is the rule to remember: **doors, hood, tailgate and tank lid
SWING** — rotation is legible on a plan view. **Windows SLIDE vertically** — that motion is
invisible from directly above. From above, a window is not a surface at all.

**Decision: the car owns parts that swing; a glass rail beside it owns the parts that slide.** All
five `WindowStatus` fields (four door windows plus sunroof) live in the rail. The sunroof *is*
visible from above, but it stays in the rail so all five window states are read in one place rather
than split across two mechanisms. The sunroof drawn on the plan is decorative.

This also makes the rail items ordinary DOM buttons with real labels and a clean tab order, which
is worth more than it sounds given that #15 makes car accessibility the highest-value test in M4.

Two alternatives were mocked and rejected (all three are in Figma, *Volvo Dashboard* page, below
*Nordic Horizon*):

- **Tilted isometric.** Gives each door a face with a glass band above it, genuinely unambiguous —
  for the near flank. No single projection shows all four sides, so two doors and two windows sit
  behind the roof and still need a list. You would build the isometric *and* ship the rail. This is
  the same "can't see all sides" reasoning that already rejected a three-quarter hero, reappearing
  in the view whose entire job is showing everything at once.
- **Plan with fold-out flanks.** Genuinely solves it — all four doors and all four windows,
  symmetric, nothing occluded. Rejected because it reads as an engineering diagram rather than a
  car, and the fold-out convention has to be learned. Expensive for a two-second glance. Worth
  revisiting if the rail turns out to be hard to map back to physical positions.

#### Two rules that came out of the mockups

**No decorative element may use a status-adjacent hue.** Volvo's vertical L tail lamps drawn in red
read as a *critical status on the rear corners*. Every colour in this component is reserved for
state. This is the same principle as the existing "colour is never the only signal" rule, pointed
the other way: not only must state carry more than colour, decoration must carry none.

**Orientation comes from silhouette, not detail.** The first reshape added Thor's-hammer headlights,
vertical tail lamps, roof rails and a grille; at dashboard size they collapsed into visual noise
that read as rendering artefacts. What actually works is a tapered rounded nose against a square
full-width tail, a bonnet about twice the length of the tailgate, a windscreen clearly larger than
the backlight, and mirrors in the front third.

#### Part list correction

Checking the shapes against `shared/types/api.ts` turned up parts the earlier draft missed.
`DoorAndLockStatus` carries **`tankLid`** (the fuel filler flap, right rear quarter on this model)
alongside `hood` and `tailGate`, and `centralLock`. So the diagnostic view's status-bearing parts
are these eleven — four doors, four tyres, `hood`, `tailgate`, `tank-lid` — and **not** the eleven
named in the earlier draft, which counted the sunroof and omitted the tank lid. `centralLock` is a
roll-up line, not a drawn part. The `PartId` union follows this list exactly; every other shape in
`mockups/CAR_TOPDOWN_WIREFRAME.svg` is decorative and carries no state.

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
| Animates | No | Doors, hood, tailgate and tank lid swing |
| Interactive parts | Badges only | Every part is a button |
| Parts visible | FL/FR doors, hood, FL/FR tyres, windscreen, front lights | 4 doors, 4 tyres, tailgate, hood, tank lid |
| Window state | Glass rail | Glass rail — never on the car |
| Default | ✅ on load | — |

**This is an amendment to pillar 3 of the guide.** "React changes individual `<path>` fills based on
API state (green = secure, red = warning)" holds for the diagnostic view only. Painting the hero's
doors green would look broken. Status colour is never the only signal in either view — the badge and
the roll-up line carry it too, consistent with the existing status-colour decision.

### Interactions, in priority order

1. **View toggle** — a segmented control (`role="radiogroup"`, two radios; *not* a tabs primitive —
   these aren't tab panels). Plain user state defaulting to `'hero'`.
2. **Part animation from state** — **diagnostic view only**: doors, hood, tailgate and tank lid
   swing on a CSS transform. Windows do not animate because they are not drawn — they are reported
   in the glass rail. The hero is a still image and does not animate.
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
| `CarTopDownView.tsx` | Top-down inline SVG, evolved from `mockups/CAR_TOPDOWN_WIREFRAME.svg`. |
| `GlassRail.tsx` | The five `WindowStatus` slots (4 door windows + sunroof) as DOM buttons beside the car. |
| `CarPart.tsx` | One interactive part: `<button>` wrapping the `<path>`, `aria-label`, status→visual mapping. |
| `useParallaxTilt.ts` | Pointer-tilt hook. Returns a ref. |

`carParts.ts` keeps the `Record<PartId, CategoryId>` exhaustiveness guarantee already specified —
adding a part without wiring its category stays a compile error. `VIEW_PARTS` extends the same idea
to view membership.

### Modified

- `notes/IMPLEMENTATION_GUIDE.md` — amend pillar 3 (fill convention is per-view); rewrite the
  "Interactive SVG Car" section for two views; amend M4 build-order step 3.
- `mockups/DASHBOARD_WIREFRAME.svg` — replace the dashed capsule with the diagnostic-view art.
- `mockups/CAR_HERO_WIREFRAME.svg` — **deleted** (2026-09-30). Auto-traced three-quarter vector,
  rejected and never a build target.
- GitHub #15 — extended to cover view switching, per-view part sets and the hidden-part roll-up.

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
4. **Swing-part animation** — diagnostic view only, CSS transforms, for doors, hood, tailgate and
   tank lid. No window animation: windows are not drawn. Commit with hardcoded states.
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
- **#28 — hero image loading** (`size:S`) — fraction-anchored badge overlay, `onError` fallback
  to the diagnostic view, and a decision on whether to proxy (see the `fetch`-vs-`axios` note).
  Filed 2026-09-30.
- **#29 — `useParallaxTilt`** (`learning:react`, `size:S`) — small, self-contained, and a good
  vehicle for the ref-plus-CSS-custom-property pattern. Filed 2026-09-30.
- **M1 changed after all.** The earlier draft said M1 was untouched and only asked to *confirm* #3
  carried an unknown-state token. It did not. #3 now carries `--volvo-slate` plus the **unknown**
  status token, and the three `--volvo-shell-*` vehicle-surface primitives the top-down car needs;
  #7 carries the matching `--status-unknown` and `--vehicle-*` names. Those surfaces are the one
  group that genuinely must flip with mode — the committed hex is Nordic Light, and a light-grey
  car body on a dark background reads as a bug. **M2 and M3 remain unchanged.**
- **M6** picks up the deferred category→view auto-switch and an optional crossfade.
- **`mockups/` and the guide** are updated as part of this work, not deferred to #22 — #22 reconciles
  the guide against `main` for M0 and closes before any of this starts.

**Not in scope:** any 3D or WebGL work; a licensed vehicle model; continuous drag-spin.

---

## Sources

- [We Reverse-Engineered 12 Product Configurators](https://dev.to/podifai/we-reverse-engineered-12-product-configurators-heres-whats-actually-under-the-hood-12ld) — pre-rendered vs. real-time, and the Porsche 46-photo example
- [Configure 3D models with react-three-fiber](https://blog.logrocket.com/configure-3d-models-react-three-fiber/) — what the 3D path would have involved
- [React Three Fiber — Loading Models](https://r3f.docs.pmnd.rs/tutorials/loading-models) — the per-mesh grouping requirement that makes a rigged model the blocker
