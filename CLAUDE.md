# leo-web

> Thin index — a *map, not the territory*. Point to the deeper docs; agents reach in as needed. Keep under ~500 lines. Never put the task list, secrets, account names, or env-var *values* here.

## Stack

- **Language:** TypeScript 5
- **Framework:** Next.js 16 (App Router) / React 19
- **Styling:** Tailwind CSS 4 + design tokens (`components/design-system/`)
- **Package manager:** npm
- **Backend:** `leo-api` on `:3000` (proxied `/api/v1/*`); optional `API_URL` in `.env.local`
- **Dev port:** `:8080`

## Where things live

- **Docs index** — `docs/README.md`
- **Architecture (canonical)** — `docs/ARCHITECTURE.md` (scope, routes, feature domains, phase checklist)
- **Platform product spec** — `../leo-api/docs/product-spec.md` (business rules — read-only)
- **Platform invariants** — `../leo-api/.pineapple/invariants.md` (`INV-*` — read-only)
- **Client invariants** — `.pineapple/invariants.md` (`INV-WEB-*` — local only)
- **Code map** — `.pineapple/code-map.md`
- **Phases** — `.pineapple/phases/INDEX.md` (workflow); roadmap in `docs/ARCHITECTURE.md` §16–17
- **Feature specs** — `.pineapple/features/INDEX.md` (to fill); domains in `docs/ARCHITECTURE.md` §8
- **Release alignment** — `../leo-api/docs/release-plan.md`
- **Design tokens** — `components/design-system/README.md`
- **Pineapple config** — `.pineapple/config.yml` (artifact map for adoption)
- **As-built state** — `.pineapple/state.md` (floor snapshot; target remains `docs/ARCHITECTURE.md`)
- **As-built arch** — `.pineapple/architecture-overview.md`
- **As-built product** — `.pineapple/product-spec.md`

## Conventions

- **Source layout:** `app/` (App Router), `components/`, `lib/`
- **API client:** `lib/api.ts` — snake_case JSON; Bearer access token
- **Lint:** `npm run lint`
- **Dev:** `npm run dev` (port 8080)
- **Build:** `npm run build`

## Pineapple

Artifact locations are mapped in `.pineapple/config.yml` (map-in-place adoption). Planning cycle:

`/pineapple:spec` → `/pineapple:phase-carve` → `/pineapple:feature-spec` (loop) → `/pineapple:cross-spec-audit` → `/pineapple:taskgraph` → (approve) → `/pineapple:orchestrate`. Close every session with `/pineapple:context-update`.

Ongoing adoption gaps: `/pineapple:ongoing` → gate with `/pineapple:prd-readiness`.

## Autonomy

- **Proceed without asking:** read/explore code, run lint/build, scaffold per Pineapple phase commands, fix obvious lint/type errors in files being edited.
- **Check in first:** product decisions, invariant changes, API contract changes, dependency additions, push/merge to remote, anything touching secrets or deploy config.
