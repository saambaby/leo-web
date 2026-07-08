# Leo Web Design System

Canonical design tokens for **leo-web**, aligned with the Leo workstation visual identity.

**Design source of truth:** [`leo-workstation/.pineapple/design/leo-workstation.html`](../../leo-workstation/.pineapple/design/leo-workstation.html)

**Architecture reference:** [`docs/ARCHITECTURE.md` §12](../../docs/ARCHITECTURE.md)

---

## Token layers

| Prefix | Purpose | Example |
|---|---|---|
| `black-*` | Dark auth / workstation surfaces | `bg-black-900`, `text-black-200` |
| `web-*` / semantic | Light admin surfaces | `bg-canvas`, `bg-surface`, `border-border` |
| `signal-*` | Status colors (shared) | `text-signal-live`, `text-signal-error` |
| `r-*` / `rounded-*` | Border radius | `rounded-md` (8px), `rounded-xl` (16px) |

Leo Web defaults to the **light admin** aesthetic (`web-canvas` background, `web-text` foreground). Auth routes will use the `.theme-auth` scope class in a follow-up migration.

---

## Typography

| Role | Font | Tailwind | Use for |
|---|---|---|---|
| Display | Syne | `font-display` | Headings, buttons, logo |
| Body | DM Sans | `font-sans` | Body copy, inputs, paragraphs |
| Mono | DM Mono | `font-mono` | Section labels, badges, metadata, routes |

Base body size is **13px** (workstation default).

### Examples

```html
<h1 class="font-display text-lg font-semibold">Organization settings</h1>
<p class="font-sans text-sm text-secondary">Manage members and billing.</p>
<span class="font-mono text-[10px] uppercase tracking-widest text-muted">Members</span>
```

---

## Surfaces

### Light admin (default)

```html
<main class="min-h-full bg-canvas text-foreground">
  <div class="rounded-xl border border-border bg-surface p-6">…</div>
</main>
```

| Token | Utility | Value |
|---|---|---|
| `--web-canvas` | `bg-canvas` | `#F4F5F7` |
| `--web-surface` | `bg-surface` | `#FFFFFF` |
| `--web-border` | `border-border` | `#E4E6EB` |
| `--web-text` | `text-foreground` | `#14161A` |
| `--web-text-2` | `text-secondary` | `#454C5C` |
| `--web-muted` | `text-muted` | `#7C8494` |

### Dark auth (future)

Wrap auth routes in `.theme-auth` to switch semantic background/foreground to the black scale:

```html
<main class="theme-auth min-h-full bg-background text-foreground">…</main>
```

Auth-specific colors use the `black-*` scale directly until components are migrated:

```html
<div class="rounded-xl border border-black-600 bg-black-800">…</div>
```

---

## Signal colors

Shared with the workstation — use for status chips, alerts, and live indicators.

| Token | Utility | Value |
|---|---|---|
| `--signal-live` | `text-signal-live` | `#22C55E` |
| `--signal-warn` | `text-signal-warn` | `#F59E0B` |
| `--signal-error` | `text-signal-error` | `#EF4444` |
| `--signal-info` | `text-signal-info` | `#94A3B8` |

Opacity modifiers work: `bg-signal-live/10`, `border-signal-error/30`.

---

## Files

| File | Role |
|---|---|
| `tokens.css` | CSS custom properties (`:root` + `.theme-auth`) |
| `tokens.ts` | Typed mirror for charts, exports, inline styles |
| `app/globals.css` | Tailwind v4 `@theme inline` bridge |

---

## Programmatic access

```ts
import { leoColors, leoRadii, leoFonts } from "@/components/design-system/tokens";

const chartColor = leoColors.signalLive;
const cardRadius = leoRadii.lg;
```

---

## Out of scope (this foundation)

- Auth component migration (`auth-shell.tsx`, `form-field.tsx`) — follow-up PR
- React primitives (`Button`, `Input`, `Chip`, etc.)
- Light admin `AppShell` layout
- Theme toggle / night mode
