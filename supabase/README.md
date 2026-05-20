# Supabase

Use the baseline schema from:

- `docs/backend/database-schema.sql`

Supabase migration files:

- `migrations/202605200001_initial_schema.sql`
- `migrations/202605200002_flashavtl_storage.sql`
- `migrations/202605200003_auth_crud_and_entities.sql`

## Production Setup

1. Create Supabase project.
2. Enable MFA policies for admin roles.
3. Run the baseline schema.
4. Review RLS policies with test users for every role.
5. Run the storage migration to create the private `FlashAVTLStorage` bucket and folder-prefix policies.
6. Run the auth, CRUD, asset type, invitation, and storage metadata migration.
7. Configure database backups and point-in-time recovery.
8. Keep service-role keys only in backend services, never in mobile or web apps.

## Storage Design

Main private bucket:

- `FlashAVTLStorage`

Folder prefixes inside the bucket:

- `vehicle-documents`
- `damage-media`
- `identity-evidence`
- `inspection-media`
- `firmware-artifacts`

## Application Integration

Client applications use:

- `VITE_API_URL` for the web console.
- `EXPO_PUBLIC_API_URL` for the mobile app.

The backend API uses:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`

The service-role key is required for API-managed user creation, RBAC writes, and signed upload URL workflows.

## First Admin Bootstrap

After the migrations are applied, create the first platform admin and the BP demo truck with:

```bash
npm run bootstrap:admin
```

Set `FLASHAVTL_BOOTSTRAP_EMAIL` and `FLASHAVTL_BOOTSTRAP_PASSWORD` before running it. The script uses the service-role key, so run it only from a trusted local or deployment environment.
