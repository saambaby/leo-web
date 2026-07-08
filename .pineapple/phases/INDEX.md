# Phases — Index

> **Overall roadmap:** `docs/ARCHITECTURE.md` §16 + platform `../leo-api/docs/release-plan.md`. This file tracks the **current working slice** for leo-web.

## Current phase

| Field | Value |
| ----- | ----- |
| **Phase** | **P1 spine** (P1-1 + P1-2) |
| **Umbrella doc** | `.pineapple/phases/P1.md` |
| **Active epic** | **P1-2 — Protected shell & switch-tenant** |
| **Product spec** | `.pineapple/product-spec.md` (2026-07-07) |
| **Tracker** | [github.com/saambaby/leo-web](https://github.com/saambaby/leo-web) issues |
| **Web status** | P1-1 **shipped** (PRs #6–#9); P1-2 **next** |

## P1 epic table

| Epic | Purpose | Status | Doc |
| ---- | ------- | ------ | --- |
| Floor | Public auth funnel + sessionStorage spike | **shipped** | `P1.md` |
| **P1-1** | Session hardening, auth UI, routing | **shipped** | `P1-1.md` |
| **P1-2** | Protected shell, switch-tenant (`GET /memberships` ✓) | **next** | `P1-2.md` |
| P1-3 | LSP admin | **deferred** | `P1-3.md` |
| P1-4 | Customer portal org | **deferred** | `P1-4.md` |
| P1-5 | Platform admin + infra | **deferred** | `P1-5.md` |

**P1 spine closes at P1-2.** P1-3–P1-5 + leo-api consent/users/tenants/audit → **next phase**.

## Next

1. `/pineapple:taskgraph` for **P1-2**
2. Manual E2E sign-off on P1-1 (optional before P1-2 dispatch)
