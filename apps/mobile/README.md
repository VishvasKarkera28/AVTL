# Mobile App

Target stack: React Native with Expo.

Current implementation: Expo SDK 55, React Native, TypeScript, and shared `@avtl/domain` demo data.

When `EXPO_PUBLIC_API_URL` is configured, the app signs in through the FlashAVTL API with an application JWT. Supabase is used behind the API for tables and storage only.

## App Modules

- Customer booking and unlock.
- Driver assignment and trip workflow.
- Staff handoff and inspection.
- Maintenance work orders.
- Identity verification.
- Offline BLE and optical unlock.
- Damage capture.
- Find My Vehicle.
- Silent distress flow.

## Navigation Groups

- Auth
- Identity
- Customer Rental
- Driver Trip
- Staff Operations
- Maintenance
- Unlock Center
- Emergency
- Profile

## Production Requirements

- Secure storage for offline tokens.
- Device binding for high-risk unlock flows.
- Camera access for damage inspection and identity capture.
- Bluetooth permissions with clear fallback to optical unlock.
- Offline queue for inspection and access events.
- Audit-friendly event timestamps.

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

- Sign in and sign up with FlashAVTL application JWT authentication.
- Invite users into role-based workflows.
- Create trucks, buses, ships, cars, bikes, vans, and equipment records.
- Create smart access grants, rental bookings, active trips, and damage reports.

## Run

```bash
npm run dev:mobile
```

The app uses the Expo development server for iOS, Android, and local device testing.

Required live-mode variables:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8787
```
