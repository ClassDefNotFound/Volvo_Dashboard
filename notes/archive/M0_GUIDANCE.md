# M0 — Hygiene & Tracking: Guidance Notes

> **ARCHIVED — M0 closed 2026-09-29.** Kept as the record of how the milestone was reasoned
> about, not as live guidance. It describes a moment, not the system, so read it as history:
> anything here about the current state of the repo is true of M0's tree, not of `main`.
> `IMPLEMENTATION_GUIDE.md` remains the design doc of record.
>
> Two things in here outlived the milestone and are worth lifting into the guide if they are
> ever needed again: the **four-pass method for finding dead code** (each pass catches a class
> the previous one structurally cannot), and the rule that **anything you want to happen
> alongside a watcher needs a `pre` hook or `concurrently`, never `&&`** — which recurs the
> moment Vitest's watch mode lands in #8.
>
> Original companion note: the working notes for M0 — what the milestone is actually for, the
> judgment calls inside it, and the method for the one ticket that is a hunt rather than a fix.

---

## What M0 is for

M0 is the milestone that makes the later milestones trustworthy. Nothing in it is user-visible,
and that is the point: every ticket here either **closes a hole in the feedback loop** (so a
later mistake gets caught) or **removes something that will otherwise be maintained by
accident** (dead code gets read, gets updated, gets ported — it costs attention long after it
stops doing anything).

The test for whether something belongs in M0: *does leaving it undone make a later milestone
quietly harder or riskier?* Cosmetic tidying that fails that test belongs nowhere.

### Already done, before the milestone was cut

- `npm run build` and `npm run lint` are both green on `phase-0-hygiene`.
- The production build works. This only became a trustworthy gate once the
  `src="/src/assets/volvo_logo.svg"` string was replaced with a real import (commit `5599356`) —
  that path worked in dev and broke the production build, because Vite only serves `/src/*` from
  the dev server. Worth remembering as a *class* of bug, not a one-off: see "Pass 3" below.

---

## The two holes in the feedback loop

Both were found by inspection, not by anything failing. That is characteristic — a gap in a
gate never announces itself, because the whole symptom is the absence of a complaint.

### The server is not type-checked by anything

`npm run build` is `tsc -b`, and root `tsconfig.json` references only `tsconfig.app.json` and
`tsconfig.node.json`. `server/tsconfig.json` is never invoked by any npm script.
`npm run dev:server` is `tsx watch`, and **tsx strips types without checking them** — that is
the whole reason it is fast, and the reason it was chosen for Node v24 ESM compatibility.

So the server has had the *appearance* of type safety (strict mode, a tsconfig, typed route
handlers) with none of the enforcement. Every server change to date shipped unverified.

The fix has two shapes and they are worth weighing rather than defaulting:

| Approach | For | Against |
|---|---|---|
| Add `server` to root project references | One command checks everything; `tsc -b` handles ordering and caching | Composite references across differing module resolution is the fiddly case — see below |
| Separate `typecheck:server` script, both run by the gate | Keeps the two build units genuinely independent; simpler to reason about | Two commands to remember; CI must run both, and forgetting one recreates this bug |

The complication in the first column is real and is *why* these are separate build units: the
server is `module: nodenext` and the frontend is `moduleResolution: bundler`. Those are
different enough that they were split deliberately, not by accident.

**Whichever you pick, verify it by breaking it.** Add a deliberate type error to
`server/routes/api.ts`, confirm the gate command fails, revert. A gate you have not watched
fail is a gate you are assuming, and this entire section exists because of an assumed gate.

### ESLint lints the server as browser code

`eslint.config.js` has a single block matching `**/*.{ts,tsx}` with `globals.browser` and the
React Hooks / React Refresh plugins. Confirmed with `npx eslint . --format json`: all five
`server/*.ts` files and both `shared/types/*.ts` files are in the run, under those settings.

Two consequences, in opposite directions:

- **False negatives** — `document`, `window`, `localStorage` are legal globals inside Express
  route handlers. The linter will not flag code that cannot possibly run.
- **False positives waiting to happen** — `process` and `Buffer` are *not* in `globals.browser`.
  Server code has not tripped this yet, but the rule that would catch it is effectively armed
  against the wrong environment.

Plus React Hooks and React Refresh rules applied to files with no React in them — currently
silent, and silent for no better reason than that nothing in `server/` happens to look like a
component.

`shared/**` is the interesting third case and deserves a decision rather than a default: it is
consumed by both sides, so arguably it should get *neither* environment's globals. Type-only
files need no runtime globals at all, and that is the strictest correct answer.

While in there: `ecmaVersion: 2020` is stale relative to both the Node version and the browser
targets.

---

## Wiring a check into npm scripts

Having a `typecheck:server` script is not the same as having a gate. Where it is wired decides
what it actually catches, and two of the three wirings tried during M0 were silently inert.

### `&&` after a long-running process is always dead code

```json
"dev:server": "npm run --prefix server start && npm run typecheck:server"
```

`start` is `tsx watch server.ts`. A watch process does not exit, so the right-hand side never
runs — and on `Ctrl-C` the left side exits non-zero, so `&&` still will not run it. Verified by
booting with a deliberate type error present: the server came up clean and the check never fired.

**The rule:** anything you want to happen alongside a server or watcher needs

| Want | Mechanism |
|---|---|
| before it starts | a `pre<script>` lifecycle hook |
| at the same time | `concurrently` |
| after it exits | `&&` — which for a watch process means *never* |

This recurs the moment Vitest's watch mode lands in #8. Same shape, same trap.

### A dev-time check and a merge gate are different moments

They are not alternatives, and choosing one over the other loses coverage:

- **`predev:server`** catches breakage at the start of a session. Runs once, at startup — it says
  "types were clean when I booted," not "types are clean now," because `tsx watch` restarts on
  file change without re-running the check. It also blocks startup on a type error, which is a
  real trade-off when you want to run the server mid-refactor.
- **`build`** catches breakage before merge. This is the one CI runs, and therefore the only one
  that is a gate.

Keep both. Or, if gating startup is the part that grates, add the check as a third `concurrently`
pane in `dev:all` so it reports without blocking.

### Prefer `&&` over `concurrently` for the gate itself

`concurrently` does propagate failure — its default is `--success all` — so a parallel build gate
is not broken. It is still the worse choice:

- **Interleaved output is worst exactly when the build fails**, which is the only time anyone
  reads it.
- **`--names` maps positionally**, so it is easy to label the panes backwards and spend a minute
  reading the server's error as the client's.
- **Without `--kill-others-on-fail`, `vite build` still writes `dist/`** while the typecheck
  fails, so a red build leaves artifacts behind.

Sequential `tsc -b && vite build && npm run typecheck:server` is deterministic and legible, and
the parallelism was worth about a second. `concurrently` earns its place in `dev:all`, where both
processes genuinely must run at once. A gate is not that situation.

### Test the gate by breaking it, and check the exit code

A gate nobody has watched fail is a gate being assumed — which is the whole reason this section
exists. The cheapest probe is a throwaway file, which needs no edit to real code and cannot be
forgotten in a diff:

```sh
echo 'export const broken: string = 42;' > server/__probe.ts
npm run build; echo "exit=$?"   # expect a non-zero exit
rm server/__probe.ts
```

Two traps in the verification itself:

- **Check the exit code, not the output.** CI reads the status, not the text.
- **`cmd | head` reports `head`'s exit code, not `cmd`'s.** A piped tsc run will happily print
  errors and report success. Use `${PIPESTATUS[0]}`, or do not pipe.

---

## Finding dead code and unused assets

Four passes, cheapest first. Each catches a class the previous one structurally cannot — that
is why it is four passes and not one tool.

**Pass 1 — within-file, let the compiler do it.**
Check whether `noUnusedLocals` / `noUnusedParameters` are set in `tsconfig.app.json`. If they
are off, turn them on and see what falls out. These see inside a file only. They will never find
an unused *file*, because from the compiler's point of view an unreferenced module that still
type-checks is simply a module.

**Pass 2 — cross-file unused exports and files.**
`npx knip` — no install needed to try it. It walks the import graph from the entry points
(`index.html` → `main.tsx`, plus `server.ts`) and reports unreachable files, exports nothing
imports, and unused dependencies. This is the only pass that can find a whole orphaned module,
and the only one that resolves the transitive case — a file imported solely by another dead file.

Budget time for configuring it. Its first run on a project it does not yet understand is noisy,
and the noise is almost always entry points it could not infer. Noise is not a reason to abandon
the pass; it is the tuning step.

**Pass 3 — assets, by filename rather than by import.**
This is exactly the class the `volvo_logo.svg` bug belonged to: a string reference that no
import graph can see. So search for the *filename*, not for an `import` statement:

```sh
git grep -n "react.svg" -- src index.html public
```

Anything in `public/` is invisible to Pass 2 by design — Vite copies it verbatim without
parsing it — so `public/` gets checked by hand or not at all.

**Pass 4 — reachability by hand, for the survivors.**
For each remaining candidate, `git grep -n "<Identifier>"` and *read* the hits rather than
counting them. A definition site and a re-export both match the grep and neither is a use.

**What none of the four can see:** dynamic references — a path assembled at runtime, a component
looked up by key in an object. This codebase has no dynamic imports today, so the risk is low,
but it is the reason "the tool says it is unused" is evidence rather than proof.

### The judgment call that matters more than the tooling

**Dead means zero current references — not "will become dead."**

`StatusTable`, `TabPanelWrapper`, and the ten adapter panels are all slated for deletion. They
are also live right now. The build-order rationale in the implementation guide is explicit that
they get deleted by the component that replaces them, **in that component's own commit** — the
strangler pattern. Deleting them in M0 breaks a working app to pre-pay for work already
scheduled to happen a different way, and it forfeits the property that the app runs at every
step, which is the main thing the strangler pattern buys.

Same reasoning applies to the formatters inside `StatusTable` that the guide has already
marked dead (`formatCamelCaseText`, `formatTimestamp`). They are dead *in the target design*.
They are called today.

The acceptance criterion follows from this directly: **the app builds, lints, and runs
identically before and after.** If behaviour changed, something that was reachable was removed,
and the ticket overstepped.

---

## Documentation reconciliation

`IMPLEMENTATION_GUIDE.md` is the design doc of record, which makes a stale claim in it worse
than no claim — it gets trusted and then propagated.

At least one is already stale: the guide refers to "the retired `volvo_theme.ts`" while that
file is still tracked and still linted. Where there is one, assume there are others; the guide
has been edited across several commits while the tree moved underneath it.

**Scope boundary.** Claims about the *current state of the repo* are in scope for verification.
Claims about *intent* — the Nordic Horizon spec, the decisions of record, the build-order
rationale, the testing strategy — are not. Those describe the target, and the target being
unbuilt is not an error in the document.

**Sequence it last.** Reconcile after the dead-code ticket lands, so the guide ends up
describing the tree that comes out of M0 rather than the one that went in. Doing it first means
doing it twice.

---

## A sequencing decision worth recording

Two carry-over bugs — `LoginPage` passing a `MouseEvent` into `login()`, and
`Dashboard.getVehicles()` with no `try/catch` and an unguarded `data[0]` — were considered for
M0 and **deliberately filed on M1 instead**, blocked by the Vitest setup issue.

The reason: the testing strategy states that a bug fix starts with a failing test that
reproduces it, and the test harness does not exist until M1. Fixing these in M0 would mean
suspending that rule on the first bug after writing it down. A rule broken the first time it is
inconvenient is not a rule, and both bugs have already survived several commits — waiting one
milestone is not the risk.

This is the same reasoning that already parks the `useBreakpoint.isMobile` `sm` → `md` fix at
"any time after M1" in the implementation guide. Worth noting the pattern: **M0 fixes the
gates; it does not fix behaviour.** Behaviour changes wait for the harness that can prove them.

### The same rule, applied a second time: strictness flags

Aligning the two tsconfigs turned on `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`
for the frontend, which took `npm run build` from green to 13 errors. They split cleanly along the
same line:

- **11× TS2375** from `exactOptionalPropertyTypes` — every panel passing `error={error}`
  (`string | undefined`) into a prop declared `error?: string`. Under that flag, "key absent" and
  "key present holding `undefined`" stop being the same thing. Fixed by one line in
  `VehicleDataTableProps`: `error?: string | undefined`. No behaviour change, so it stayed on.
- **2× TS2532** from `noUncheckedIndexedAccess` — `Object is possibly 'undefined'`, one of which
  is `vehicles.data.data[0].vin` in `Dashboard.tsx`. That is **the exact bug already filed as
  #24.** The flag turned a runtime bug into a compile error, which is the best thing a flag can do.

So the flag forces #24's fix — and #24 is deliberately parked behind the test harness. Enabling it
in M0 would drag the fix forward without its test, by way of a compiler error rather than a
decision.

**Resolution: `noUncheckedIndexedAccess` is commented out in `tsconfig.app.json` and turned on
inside #24's PR**, alongside the fix and its failing test. Coupling them means the compiler is
what confirms the work is complete, rather than someone remembering to flip a flag later.

The generalisation: **a strictness flag that surfaces known bugs belongs in the PR that fixes
them, not in the hygiene milestone.** Turning it on early converts a tracked, test-first fix into
an untracked, build-breaking one. The same question will come back for
`noPropertyAccessFromIndexSignature` and the `noImplicit*` family, still commented out in
`server/tsconfig.json`.

A corollary learned the hard way here: with the flag off, nothing forced the `data[0]` guard, and
it got written anyway — as a bare `throw` inside an async `useEffect` with no `.catch()`, which
React cannot surface, so it rendered nothing and logged an unhandled rejection. Half a bug fix
without its test is worse than none: it looks handled and is not.


---

## Exit gate for M0

1. `npm run build` and `npm run lint` green — and the build gate now covers `server/`,
   demonstrated by watching a deliberate server type error fail it.
2. `process.env` in a server file is clean, and `document` in a server file fails the build —
   as a **`tsc`** error (TS2584), not a lint error. The original wording expected ESLint to
   catch it; it does not, because `typescript-eslint` sets `no-undef` to `0` on the grounds
   that TypeScript does the job better. The server tsconfig pairs `lib: ["esnext"]` with
   `types: ["node"]`, so there is no DOM lib and the reference cannot resolve. ESLint's half
   is still real and still worth checking — `globals.node` is what keeps `process` from being
   flagged — it is simply not the half that catches browser globals.
3. `npm run dev:all` starts Redis, backend, and frontend cleanly, and the app behaves exactly as
   it did before M0. (The dev-portal test token expires every 15 minutes — a 401 here is the
   token, not the milestone.)
4. Nothing removed in M0 changed what the app does.
5. Every claim in `IMPLEMENTATION_GUIDE.md` about current files, scripts, or behaviour is true
   of `main`.
6. No open issue is missing a milestone, a `type:`, or a `size:`.
