# Web Console

Target stack: React or Next.js.

Current implementation: Vite, React, TypeScript, and shared `@avtl/domain` demo data.

When `VITE_API_URL` is configured, the console signs in through the FlashAVTL API with an application JWT. Supabase is used behind the API for tables and storage only.

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

## Live API Forms

- Sign in and sign up using FlashAVTL application JWT authentication.
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
VITE_API_URL=http://localhost:8787
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
