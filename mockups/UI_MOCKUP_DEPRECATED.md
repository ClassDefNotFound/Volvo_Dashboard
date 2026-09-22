# Volvo Dashboard UI Mockups

## Login Screen

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│              ┌───────────────────────────┐                  │
│              │                           │                  │
│              │      VOLVO DASHBOARD      │                  │
│              │                           │                  │
│              │  ┌───────────────────┐    │                  │
│              │  │ Email             │    │                  │
│              │  └───────────────────┘    │                  │
│              │                           │                  │
│              │  ┌───────────────────┐    │                  │
│              │  │ Password          │    │                  │
│              │  └───────────────────┘    │                  │
│              │                           │                  │
│              │  ┌───────────────────┐    │                  │
│              │  │    SIGN IN        │    │                  │
│              │  └───────────────────┘    │                  │
│              │                           │                  │
│              └───────────────────────────┘                  │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VOLVO DASHBOARD          [VIN: YV1XZ12▾]                        [Logout]  │
├────────────────────┬────────────────────────────────────────────────────────┤
│                    │                                                        │
│  VEHICLE INFO      │  ┌──────┬────────┬───────┬───────┬────────┬─────────┐ │
│  ─────────────     │  │ Fuel │Windows │ Doors │Engine │ Diag.  │ More ▸  │ │
│  XC60 Recharge     │  └──────┴────────┴───────┴───────┴────────┴─────────┘ │
│  2023 · Automatic  │                                                        │
│  Petrol/Electric   │  FUEL & BATTERY STATUS                                │
│  Crystal White     │  ──────────────────────────────────────               │
│                    │                                                        │
│  QUICK COMMANDS    │  ┌──────────────────┬───────────┬──────────┐          │
│  ──────────────    │  │ Metric           │ Value     │ Unit     │          │
│                    │  ├──────────────────┼───────────┼──────────┤          │
│  ┌──────┬───────┐  │  │ Fuel Amount      │ ████░ 42  │ litres   │          │
│  │ Lock │Unlock │  │  │ Battery Charge   │ ██████░78 │ %        │          │
│  └──────┴───────┘  │  └──────────────────┴───────────┴──────────┘          │
│                    │                                                        │
│  ┌──────┬───────┐  │                                                        │
│  │Start │ Stop  │  │                                                        │
│  └──────┴───────┘  │                                                        │
│  Engine             │                                                        │
│                    │                                                        │
│  ┌──────┬───────┐  │                                                        │
│  │Start │ Stop  │  │                                                        │
│  └──────┴───────┘  │                                                        │
│  Climate            │                                                        │
│                    │                                                        │
│  ┌───────────────┐ │                                                        │
│  │  Flash Lights  │ │                                                        │
│  └───────────────┘ │                                                        │
│  ┌───────────────┐ │                                                        │
│  │     Honk      │ │                                                        │
│  └───────────────┘ │                                                        │
│  ┌───────────────┐ │                                                        │
│  │  Honk + Flash │ │                                                        │
│  └───────────────┘ │                                                        │
│                    │                                                        │
└────────────────────┴────────────────────────────────────────────────────────┘
```

---

## Dashboard — Tab Examples

### Windows Tab

```
  WINDOW STATUS
  ─────────────────────────────────────────
  ┌──────────────────┬───────────┬────────────────────┐
  │ Window           │ Status    │ Timestamp           │
  ├──────────────────┼───────────┼────────────────────┤
  │ Front Left       │ ● LOCKED  │ 2026-03-20 10:00   │
  │ Front Right      │ ● LOCKED  │ 2026-03-20 10:00   │
  │ Rear Left        │ ● LOCKED  │ 2026-03-20 10:00   │
  │ Rear Right       │ ○ AJAR   │ 2026-03-20 09:45   │
  │ Sunroof          │ ● LOCKED  │ 2026-03-20 10:00   │
  └──────────────────┴───────────┴────────────────────┘
```

### Tyres Tab

```
  TYRE STATUS
  ─────────────────────────────────────────
  ┌──────────────────┬────────────────┬────────────────────┐
  │ Tyre             │ Status         │ Timestamp           │
  ├──────────────────┼────────────────┼────────────────────┤
  │ Front Left       │ ● NO_WARNING   │ 2026-03-20 10:00   │
  │ Front Right      │ ● NO_WARNING   │ 2026-03-20 10:00   │
  │ Rear Left        │ ▲ LOW_PRESSURE │ 2026-03-20 09:30   │
  │ Rear Right       │ ● NO_WARNING   │ 2026-03-20 10:00   │
  └──────────────────┴────────────────┴────────────────────┘
```

---

## Tab Groups (scrollable tab bar)

| Tab | Data Source |
|---|---|
| **Fuel** | Fuel amount, battery charge (progress bars) |
| **Windows** | 5 windows — status table |
| **Doors** | 8 entries (doors, tailgate, hood, tank lid, central lock) |
| **Engine** | Coolant + oil level warnings |
| **Diagnostics** | Service warning, trigger, time/distance/hours to service |
| **Brakes** | Brake fluid level warning |
| **Eng. Status** | Running / Stopped indicator |
| **Odometer** | Large km reading display |
| **Statistics** | Fuel/energy consumption, speeds, trip meters |
| **Tyres** | 4 tyre pressure warnings |
| **Warnings** | 23 light warnings (color-coded chips) |

---

## Mobile Layout (< 768px)

On small screens the sidebar collapses and the layout becomes a single vertical stack. The command panel moves into a sticky bottom bar with the most critical actions, and full commands are accessible via a slide-up drawer.

### Mobile — Login

Login is already mobile-friendly (centered card). The card goes full-width with horizontal padding.

```
┌───────────────────────┐
│                       │
│   VOLVO DASHBOARD     │
│                       │
│  ┌─────────────────┐  │
│  │ Email           │  │
│  └─────────────────┘  │
│                       │
│  ┌─────────────────┐  │
│  │ Password        │  │
│  └─────────────────┘  │
│                       │
│  ┌─────────────────┐  │
│  │    SIGN IN      │  │
│  └─────────────────┘  │
│                       │
└───────────────────────┘
```

### Mobile — Dashboard (default view)

The sidebar is gone. Vehicle info becomes a compact header card. Tabs scroll horizontally below it. Content fills the remaining space. A sticky bottom bar holds quick command icons.

```
┌───────────────────────┐
│ VOLVO       [▾VIN] [⚙]│
├───────────────────────┤
│ XC60 Recharge · 2023  │
│ Petrol/Electric · Auto│
├───────────────────────┤
│ ◄ Fuel│Wins│Drs│Eng ► │  ← horizontally scrollable tabs
├───────────────────────┤
│                       │
│ FUEL & BATTERY STATUS │
│                       │
│ Fuel    ████░ 42 L    │
│ Battery ██████░ 78%   │
│                       │
│                       │
│                       │
│                       │
│                       │
├───────────────────────┤
│ 🔒  🔓  ⚡  ❄️  💡  📯 │  ← sticky bottom command bar
└───────────────────────┘
```

### Mobile — Bottom Command Bar Detail

The bottom bar uses icon buttons. Long-press or tap opens a tooltip/label. The icons map to:

```
┌──────────────────────────────────┐
│  🔒    🔓    ⚡    ❄️    💡    📯  │
│ Lock Unlock Eng. Clim. Flash Honk│
└──────────────────────────────────┘
```

Tapping "More" (⚙ in the header) opens a slide-up drawer with the full command panel:

```
┌───────────────────────┐
│  ━━━  (drag handle)   │
├───────────────────────┤
│                       │
│  VEHICLE INFO         │
│  XC60 Recharge        │
│  2023 · Crystal White │
│  18.8 kWh battery     │
│                       │
│  COMMANDS             │
│  ┌────────┬─────────┐ │
│  │  Lock  │ Unlock  │ │
│  └────────┴─────────┘ │
│  ┌────────┬─────────┐ │
│  │ Start  │  Stop   │ │
│  └────────┴─────────┘ │
│  Engine                │
│  ┌────────┬─────────┐ │
│  │ Start  │  Stop   │ │
│  └────────┴─────────┘ │
│  Climate               │
│  ┌───────────────────┐ │
│  │   Flash Lights    │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │      Honk         │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │   Honk + Flash    │ │
│  └───────────────────┘ │
│                       │
└───────────────────────┘
```

### Mobile — Table View (e.g., Windows tab)

Tables adapt to a card-based list on small screens since horizontal tables are hard to read on mobile. Each row becomes a stacked card:

```
┌───────────────────────┐
│ ◄ Fuel│Wins│Drs│Eng ► │
├───────────────────────┤
│                       │
│ WINDOW STATUS         │
│                       │
│ ┌───────────────────┐ │
│ │ Front Left        │ │
│ │ ● LOCKED          │ │
│ │ 2026-03-20 10:00  │ │
│ └───────────────────┘ │
│ ┌───────────────────┐ │
│ │ Front Right       │ │
│ │ ● LOCKED          │ │
│ │ 2026-03-20 10:00  │ │
│ └───────────────────┘ │
│ ┌───────────────────┐ │
│ │ Rear Right        │ │
│ │ ○ AJAR            │ │
│ │ 2026-03-20 09:45  │ │
│ └───────────────────┘ │
│         ...           │
│                       │
├───────────────────────┤
│ 🔒  🔓  ⚡  ❄️  💡  📯 │
└───────────────────────┘
```

---

## Responsive Breakpoints

| Breakpoint | Layout | Command Panel | Tables |
|---|---|---|---|
| **< 768px** (mobile) | Single column, stacked | Sticky bottom bar + slide-up drawer | Card-based list |
| **768–1024px** (tablet) | Single column, wider | Collapsible sidebar (hamburger toggle) | Standard tables |
| **> 1024px** (desktop) | Two-column (sidebar + main) | Always-visible left sidebar (260px) | Standard tables |

### Tablet (768–1024px)

Same as desktop but the sidebar starts collapsed. A hamburger icon in the AppBar toggles it as an overlay drawer.

```
┌───────────────────────────────────────┐
│ ☰ VOLVO DASHBOARD  [VIN▾]   [Logout] │
├───────────────────────────────────────┤
│                                       │
│ ┌──────┬────────┬───────┬──────┬────┐ │
│ │ Fuel │Windows │ Doors │ Eng. │ ▸  │ │
│ └──────┴────────┴───────┴──────┴────┘ │
│                                       │
│  FUEL & BATTERY STATUS                │
│  ┌────────────────┬────────┬───────┐  │
│  │ Metric         │ Value  │ Unit  │  │
│  ├────────────────┼────────┼───────┤  │
│  │ Fuel Amount    │ ███░42 │ L     │  │
│  │ Battery Charge │ ████78 │ %     │  │
│  └────────────────┴────────┴───────┘  │
│                                       │
└───────────────────────────────────────┘
```

---

## Implementation Notes

- **No router needed** — simple conditional rendering with a `selectedTab` state drives which table/panel renders in the main content area
- **Mobile-first approach** — build the mobile single-column layout first, then layer on sidebar/table views at wider breakpoints using MUI's `useMediaQuery` or the `sx` responsive prop (`{ xs: ..., md: ... }`)
- **MUI responsive helpers**:
  - `<Drawer>` with `variant="temporary"` on mobile, `variant="permanent"` on desktop for the command panel
  - `<BottomNavigation>` for the sticky mobile command bar
  - `<SwipeableDrawer>` for the slide-up full command drawer on mobile
  - `<Stack direction={{ xs: 'column', md: 'row' }}>` for the main layout switch
- **Command panel**: always-visible left sidebar on desktop (260px), sticky bottom icon bar + drawer on mobile
- **Tables → Cards on mobile**: use MUI `<Card>` list on small screens, `<Table>` on tablet/desktop. Toggle based on breakpoint.
- **Status chips** should be color-coded: `NO_WARNING`/`LOCKED` = green, `AJAR`/`LOW_PRESSURE`/`FAILURE` = red/warning
- **Fuel/Battery** use progress bars instead of plain text values
- **Odometer** uses a large display font for the km reading
- **Warnings tab** has 23 rows covering all vehicle lights — color-coded chips per status
- **Tabs** use `variant="scrollable"` with `scrollButtons="auto"` — works well on all screen sizes
- All data types are defined in `shared/types/api.ts`
