# Repository Profile — `Frontend-Resturant-`

## Identity

- **Repository:** `appolon1908-hue/Frontend-Resturant-`
- **Category:** Product application — restaurant frontend
- **Visibility:** `public`
- **Default branch:** `main`
- **Authority:** Primary frontend authority for the restaurant application
- **Status:** Nuxt/TypeScript application under `frontend/` with repository-level README, CI and prepared repository-rename guidance.

## Purpose

Nuxt-based restaurant customer and operations frontend with reservations, orders, kitchen, tables, payments, waitlist, staff alerts, and optional tenant-scoped realtime updates.

## Owns

- Restaurant-facing web UI and frontend state
- Customer, staff, kitchen, order, reservation, and table experiences
- Typed browser API integration and resilient realtime presentation

## Does not own

- Authoritative restaurant business rules or persistence
- Payment-provider secrets or raw payment payloads
- Cross-restaurant authorization decisions

## Key integrations

- Restaurant backend API
- Authenticated tenant-scoped WebSocket channels
- Identity and payment status exposed through backend contracts

## Current priorities

1. Maintain the repository README and architecture map
2. Document the authoritative backend repository and API contract
3. Maintain typecheck, lint, build and dependency checks; complete integration and accessibility validation
4. Define deployment, rollback, and production evidence

## Governance and safety

- Target promotion model: `feature/docs/fix/security/upgrade -> development -> test -> staging -> production -> main`.
- Use pull requests and exact-head/merge-result validation; merging source never authorizes deployment.
- Never commit secrets, credentials, private keys, customer data, database dumps, or secret-bearing evidence.
- Production images and releases must be immutable; mutable `latest` tags are not release authority.
- This document does not deploy software, enable live effects, apply identity state, alter DNS/firewalls, reload Caddy, expose native ports, initialize OpenBao, or activate production.

## Account-wide catalog

See `appolon1908-hue/documentaions/REPOSITORY_CATALOG.md`.
