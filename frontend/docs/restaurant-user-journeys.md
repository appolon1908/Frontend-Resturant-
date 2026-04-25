# Restaurant App User Journeys

## Goal

Define short, production-ready onboarding and login journeys for the restaurant platform.

Core user groups:

- Customer
- Restaurant Owner / Admin
- Manager
- Host
- Server / Waiter
- Kitchen
- Cashier

Rules:

- Keep the journey short.
- Every question must have a reason.
- Use backend states and role-aware access.
- Keep restaurant operations central.
- Do not include frontend-only logic.

---

## 1) Customer Journey

### Entry

Use when someone wants to:

- discover a restaurant
- reserve a table
- join a waitlist
- place an order
- pay
- receive updates

### Create account (ask only)

1. First name — identity and reservation display
2. Last name — support and reservation records
3. Email — login, receipts, confirmations
4. Password — account security
5. Country — timezone and communication defaults
6. Country calling code — phone normalization
7. Phone number — booking confirmations and alerts

### Verify email

1. 6-digit email code — proves account ownership

### Dining setup (ask only)

1. Preferred city / area — restaurant discovery
2. Dining preference (`dine-in`, `takeout`, `delivery`) — routes to the right flow
3. Preferred cuisine types — better recommendations
4. Party size preference — reservation defaults
5. Dietary notes / allergies — service safety
6. Notification preference (`email`, `SMS`, `both`) — confirmations and live updates

### First action

System should allow:

- browse restaurants
- reserve a table
- join waitlist
- start order

### Backend state flow

- `verifying`
- `active`
- `restricted`
- `blocked`
- `closed`

---

## 2) Restaurant Owner / Admin Journey

### Entry

Use for the business owner or main admin.

### Create business account (ask only)

1. First name — account identity
2. Last name — account identity
3. Email — login and operations communication
4. Password — account security
5. Country — compliance and business defaults
6. Country calling code — phone normalization
7. Phone number — business contact

### Verify email

1. 6-digit email code — proves account ownership

### Restaurant setup (ask only)

1. Restaurant name — public identity
2. Restaurant brand/logo — public listing
3. Business phone — customer contact
4. Business email — ops and receipts
5. Address / location — discovery and map routing
6. Timezone — reservations, shifts, reports
7. Currency — pricing and payments
8. Cuisine type(s) — discovery and filtering
9. Service type (`dine-in`, `takeout`, `delivery`, `mixed`) — enables modules
10. Opening hours — booking and ordering rules
11. Seating capacity — reservation/floor baseline

### Operations setup (ask only)

1. Table/floor setup — reservation + seating logic
2. Menu upload / create menu — ordering logic
3. Staff invite — operational access
4. Payment provider setup — checkout and settlements
5. Reservation policy (`deposits`, `hold_times`, `cancellation/no_show`) — booking enforcement
6. Tax/service fee settings — check/payment calculations

### Backend state flow

- `verifying`
- `onboarding`
- `payment_setup_pending`
- `active`
- `suspended`
- `closed`

### First action

System should allow:

- open dashboard
- configure floor
- configure menu
- invite staff
- accept reservations/orders

---

## 3) Manager Journey

### Account creation

Created by owner/admin.

### Required fields

1. First name — identity
2. Last name — identity
3. Email — login and alerts
4. Password — security
5. Country — timezone defaults
6. Phone number — recovery/notifications

### Login

- admin login
- admin OTP verification

### First-run setup (ask only)

1. Timezone — shift and alert timing
2. Notification preference (`email only`, `inbox only`, `both`) — ops alerts and approvals

### Operational view

- operations dashboard
- reservations
- floor status
- order flow
- staff activity
- reports summary
- approval inbox (if allowed)

---

## 4) Host Journey

### Account creation

Created by owner/admin.

### Required fields

1. First name
2. Last name
3. Email
4. Password
5. Country
6. Phone number

### Login

- admin login
- admin OTP verification

### First-run setup (ask only)

1. Shift/location assignment — seat/queue routing
2. Notification preference — guest/queue alerts

### Operational view

- reservations list
- waitlist
- live floor/table status
- check-in / seat controls

---

## 5) Server / Waiter Journey

### Account creation

Created by owner/admin.

### Required fields

1. First name
2. Last name
3. Email
4. Password
5. Country
6. Phone number

### Login

- admin login
- admin OTP verification

### First-run setup (ask only)

1. Section/station assignment — order scope
2. Notification preference — ticket/payment alerts

### Operational view

- assigned tables
- active orders
- check status
- payment status
- guest notes (if allowed)

---

## 6) Kitchen Journey

### Account creation

Created by owner/admin.

### Required fields

1. First name
2. Last name
3. Email
4. Password
5. Country
6. Phone number

### Login

- admin login
- admin OTP verification

### First-run setup (ask only)

1. Station assignment — queue routing
2. Notification preference — ticket alerts

### Operational view

- kitchen ticket queue
- prep status
- ready-to-serve queue
- delay alerts

---

## 7) Cashier Journey

### Account creation

Created by owner/admin.

### Required fields

1. First name
2. Last name
3. Email
4. Password
5. Country
6. Phone number

### Login

- admin login
- admin OTP verification

### First-run setup (ask only)

1. Register/terminal assignment — payment routing
2. Notification preference — payment/refund alerts

### Operational view

- open checks
- split bills
- payment attempts
- refund/void actions (if allowed)
- end-of-day summary

---

## 8) Common Login Rules

### Customer

- customer login
- no OTP by default (policy can change later)
- must verify email first

### Restaurant owner / admin

- admin login
- admin OTP required

### Manager / Host / Server / Kitchen / Cashier

- admin login
- admin OTP required
- authority comes from permissions, not portal entry alone

---

## 9) Minimal Endpoint Map

### Customer

- `POST /api/auth/register/customer/`
- `POST /api/auth/email/verify/request/`
- `POST /api/auth/email/verify/confirm/`
- `POST /api/auth/login/customer/`
- `POST /api/auth/logout/`
- `GET /api/customer/restaurants/`
- `POST /api/customer/reservations/`
- `POST /api/customer/waitlist/`
- `POST /api/customer/orders/`
- `POST /api/customer/payments/intent/`

### Restaurant owner / admin

- `POST /api/auth/register/restaurant-owner/`
- `POST /api/auth/email/verify/request/`
- `POST /api/auth/email/verify/confirm/`
- `POST /api/auth/login/admin/`
- `POST /api/auth/otp/verify/admin/`
- `POST /api/auth/logout/`
- `PATCH /api/onboarding/restaurant/`
- `PATCH /api/onboarding/floor/`
- `PATCH /api/onboarding/menu/`
- `PATCH /api/onboarding/staff/`
- `PATCH /api/onboarding/payments/`

### Internal restaurant staff

- `POST /api/auth/login/admin/`
- `POST /api/auth/otp/verify/admin/`
- `POST /api/auth/logout/`
- `GET /api/restaurant/dashboard/`
- role-specific operations under reservations, floor, orders, kitchen, checks, and payments

---

## 10) Recommended Build Order

1. Customer registration + email verification
2. Customer restaurant browse + reservation/waitlist
3. Customer order + checkout flow
4. Restaurant owner onboarding
5. Floor/table setup
6. Menu setup
7. Staff invite + admin portal OTP login
8. Reservations + waitlist dashboard
9. Orders + kitchen queue
10. Checks + payments + reports

This sequence keeps restaurant operations central and ensures every question asked has a backend/business reason.
