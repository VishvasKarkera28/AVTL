# API Services

Target stack: Node.js or TypeScript services with Supabase.

Current implementation: Node.js, Express, application-owned JWT authentication, Supabase service-role data access, admin user creation, CRUD routes, and signed upload URL creation.

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
- `POST /api/auth/login` - verifies an app user password and returns a FlashAVTL JWT.
- `POST /api/auth/register` - creates a customer app user and returns a FlashAVTL JWT.
- `GET /api/me` and `GET /api/auth/me` - verify Bearer JWT and return app user roles.
- `GET /api/asset-types` and `GET /api/fleet-assets` - read live Supabase data through API authorization.
- `POST /api/admin/users` - creates app users, roles, invitation records, and audit logs.
- `POST /api/fleet-assets`, `/api/bookings`, `/api/trips`, `/api/access-grants`, `/api/damage-reports` - write production module data.
- `POST /api/storage/signed-upload` - validates role and storage section before creating a signed upload URL.

## Run

```bash
npm run dev:api
```

Required environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`
- `WEB_APP_URL`
- `CORS_ORIGINS`

Security note: never expose `SUPABASE_SERVICE_ROLE_KEY` to web or mobile apps. It belongs only in this API service or Supabase Edge Functions.
