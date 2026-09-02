# Restaurant Frontend

Nuxt-based customer and restaurant-operations frontend for reservations, orders, kitchen workflows, tables, payments, waitlist, staff alerts, and tenant-scoped realtime presentation.

## Repository authority

```text
STABLE_GITHUB_REPOSITORY_ID=1221155447
CURRENT_OPERATIONAL_REPOSITORY=appolon1908-hue/Frontend-Resturant-
APPROVED_TARGET_AFTER_CONTROLLED_RENAME=appolon1908-hue/restaurant-frontend
RENAME_STATUS=PREPARED_NOT_RENAMED
```

The current GitHub slug remains the only operational clone, workflow, and deployment identity until the controlled rename is executed and read back. Do not change remotes, action references, image labels, or deployment manifests to the target name before cutover.

Application source is under [`frontend/`](frontend/). See [`frontend/README.md`](frontend/README.md) for development, validation, API, and realtime behavior.

The frontend is not the business authority. Authentication, tenant isolation, restaurant ownership, permissions, reservation/order/payment state, and every material mutation must be enforced by the approved backend. Realtime messages enhance the interface but do not replace authoritative API readback.

See [`REPOSITORY_NAME_MIGRATION.md`](REPOSITORY_NAME_MIGRATION.md) for the rename safety and rollback record.