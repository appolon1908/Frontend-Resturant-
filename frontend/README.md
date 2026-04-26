# Frontend (Nuxt 3)

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
cd frontend
cp .env.example .env
npm install
```

If your environment has stale proxy settings:

```bash
npm config delete proxy
npm config delete https-proxy
```

## Environment

Required variable:

- `NUXT_PUBLIC_API_BASE_URL` (example: `https://your-api-domain.com/api/v1`)

## Run locally

```bash
npm run dev
```

## Validation

```bash
npm run typecheck
npm run build
npm run lint
```

## Troubleshooting: `nuxt: not found`

If `npm run typecheck` or `npm run build` fails with `nuxt: not found`, your install likely did not complete (for example, blocked npm registry access or stale proxy config).

Use a clean local reinstall:

```bash
cd frontend
rm -rf node_modules package-lock.json

npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/

npm install
npm run typecheck
npm run build
npm run dev
```

If `nuxt` is still unresolved after a successful install:

```bash
npm ls nuxt
cat package.json
```

`nuxt` should appear in dependencies/devDependencies, and `npm ls nuxt` should resolve it from your local install.

## Product Flows

* [Restaurant App User Journeys](./docs/restaurant-user-journeys.md)
* [Launch QA Test Sheet](./docs/launch-qa-test-sheet.md)

## Realtime behavior

Realtime is optional and resilient:

- app works without websocket backend availability
- websocket reconnect uses exponential backoff
- live events enhance dashboard/orders/kitchen if backend channels are available

Expected websocket routes from backend ASGI/Channels:

- `/ws/restaurant/{restaurant_id}/ops/`
- `/ws/customer/{customer_id}/updates/`

Expected realtime events:

- `reservation.created`
- `reservation.updated`
- `order.created`
- `order.status_changed`
- `kitchen.ticket_created`
- `kitchen.ticket_ready`
- `table.status_changed`
- `payment.succeeded`
- `waitlist.called`
- `staff.alert_created`

Security rules:

- tenant scoped
- authenticated only
- never broadcast cross-restaurant events
- never emit raw provider payment payloads
