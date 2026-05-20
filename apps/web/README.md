# Web Console

Target stack: React or Next.js.

Current implementation: Vite, React, TypeScript, and shared `@avtl/domain` demo data.

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured, the console switches from demo mode to live Supabase mode and requires sign in.

## Console Areas

- Executive dashboard.
- Live fleet command center.
- Vehicle digital twins.
- Booking operations.
- Access grants and token review.
- AI risk center.
- Predictive maintenance.
- Damage dispute review.
- Geo-fence intelligence.
- Security incidents.
- Organization settings and RBAC.

## Production Requirements

- Map-first command center with live updates.
- Step-up authentication for risky commands.
- Command acknowledgement states.
- Full audit trail.
- Tenant-safe data access.
- Exportable reports for insurance, police, finance, and maintenance.

## Current Demo Modules

- Platform Foundation
- Authentication and Identity
- Vehicle Digital Twin
- Fleet Command Center
- Smart Access and Locking
- Rental Booking Platform
- Trip Tracking
- Inspection and Damage Intelligence

## Live Supabase Forms

- Sign in and sign up using Supabase Auth.
- Invite users into company roles.
- Create fleet assets such as truck, bus, car, bike, van, ship, and equipment.
- Create access grants with app, Bluetooth, optical, NFC, QR, and offline token methods.
- Create rental bookings and trips.
- Create inspection and damage reports.
- Upload files into the private `FlashAVTLStorage` bucket with metadata in `storage_files`.

## Run

```bash
npm run dev:web
```

Required live-mode variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Open:

- `http://localhost:3000/#foundation`
- `http://localhost:3000/#identity`
- `http://localhost:3000/#digital-twin`
- `http://localhost:3000/#command-center`
- `http://localhost:3000/#smart-access`
- `http://localhost:3000/#booking`
- `http://localhost:3000/#trip-tracking`
- `http://localhost:3000/#inspection-damage`
