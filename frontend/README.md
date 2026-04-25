# Frontend (Nuxt 3)

## Setup

```bash
npm install
```

## Environment

Copy and edit env values:

```bash
cp .env.example .env
```

Required:

- `NUXT_PUBLIC_API_BASE_URL` - backend API base URL (example: `https://your-api-domain.com/api/v1`)

## Run

```bash
npm run dev
```

## Typecheck

```bash
npm run typecheck
```

## Build

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Realtime integration contract

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
