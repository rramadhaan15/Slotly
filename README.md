# Slotly web

See [project guide](../README.md) and [PRD](../PRD_Platform_Booking_Reservasi.md) in the parent workspace. This folder is the standalone deployed application.

Run `npm ci`, `npm run db:local`, and `npm run dev`. Production build: `npm run build`.

This is a private booking demo. Payments and venue listings are explicitly simulated. Configure `ADMIN_USER_IDS` with the authorized SIWC user IDs to enable administrative operations. Booking data is stored in D1; local mock users exist only in development.
