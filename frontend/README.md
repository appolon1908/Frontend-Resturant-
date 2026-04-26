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

## Codex prompt ID naming

When referencing prompt IDs in Codex, use `jlwm115` and `jlwm116` (not `ժմ115` / `ժմ116`) to avoid character-confusion issues.
