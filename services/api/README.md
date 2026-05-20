# API Services

Target stack: Node.js or TypeScript services with Supabase.

Current implementation: Node.js, Express, Supabase service-role client, JWT verification, admin user creation, and signed upload URL creation.

## Services

- Fleet API.
- Booking service.
- Command service.
- Access token service.
- Telemetry ingest service.
- Identity verification service.
- OTA service.
- Notification service.

## Responsibilities

- RBAC and tenant validation.
- Vehicle command signing.
- Offline token issuance.
- Device telemetry validation.
- Event publishing to Kafka or Azure Event Hubs.
- Audit log writing.
- API contracts for mobile and web clients.

## First Implementation Order

1. Auth and organization setup.
2. Vehicles and latest state.
3. Bookings.
4. Access grants.
5. Vehicle commands.
6. Telemetry ingest.
7. Audit logs.

## Implemented Routes

- `GET /health` - service health check.
- `GET /api/me` - verifies Bearer JWT and returns user roles.
- `POST /api/admin/users` - creates or invites Supabase Auth users, then writes profile, role, invitation, and audit records.
- `POST /api/storage/signed-upload` - validates role and storage section before creating a signed upload URL.

## Run

```bash
npm run dev:api
```

Required environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WEB_APP_URL`
- `CORS_ORIGINS`
- `AUTH_REDIRECT_URL`

Security note: never expose `SUPABASE_SERVICE_ROLE_KEY` to web or mobile apps. It belongs only in this API service or Supabase Edge Functions.
