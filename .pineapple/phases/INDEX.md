# Phases — Index

> **Overall roadmap:** `docs/ARCHITECTURE.md` §16 + platform `../leo-api/docs/release-plan.md`. This file tracks the **current working slice** for leo-web.

## Current phase

| Field | Value |
| ----- | ----- |
| **Phase** | **P1 spine closed** (P1-1 + P1-2 shipped) |
| **Umbrella doc** | `.pineapple/phases/P1.md` |
| **Active epic** | — (admin epics P1-3–P1-5 deferred to next phase) |
| **Product spec** | `.pineapple/product-spec.md` (2026-07-07) |
| **Tracker** | [github.com/saambaby/leo-web](https://github.com/saambaby/leo-web) issues |
| **Web status** | P1 spine **shipped** |

## P1 epic table

| Epic | Purpose | Status | Doc |
| ---- | ------- | ------ | --- |
| Floor | Public auth funnel + sessionStorage spike | **shipped** | `P1.md` |
| **P1-1** | Session hardening, auth UI, routing | **shipped** | `P1-1.md` |
| **P1-2** | Protected shell, switch-tenant | **shipped** | `P1-2.md` |
| P1-3 | LSP admin | **deferred** | `P1-3.md` |
| P1-4 | Customer portal org | **deferred** | `P1-4.md` |
| P1-5 | Platform admin + infra | **deferred** | `P1-5.md` |

**P1 spine closed.** Next phase: P1-3–P1-5 when leo-api ships consent/users/tenants/audit endpoints.

## Next

1. Manual E2E sign-off on P1 spine (optional)
2. `/pineapple:taskgraph` for **P1-3** when API deps land (or batch next-phase epics)
