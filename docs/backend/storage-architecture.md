# FlashAVTL Storage Architecture

## Supabase Bucket

Main bucket:

- `FlashAVTLStorage`

Supabase Storage does not use true nested buckets. The production design uses one private bucket with controlled top-level folder prefixes.

## Folder Prefixes

| Prefix | Purpose | Example Path |
| --- | --- | --- |
| `vehicle-documents` | RC, insurance, permit, pollution certificate, service PDFs. | `vehicle-documents/{organization_id}/{vehicle_id}/{document_id}/insurance.pdf` |
| `damage-media` | Damage photos, videos, AI comparison frames. | `damage-media/{organization_id}/{vehicle_id}/{damage_report_id}/front-left.jpg` |
| `identity-evidence` | KYC, selfie, liveness, face-match evidence. | `identity-evidence/{organization_id}/{user_id}/{verification_id}/selfie.jpg` |
| `inspection-media` | Pre-trip and post-trip inspection media. | `inspection-media/{organization_id}/{booking_id}/pre-trip/video.mp4` |
| `firmware-artifacts` | Signed firmware, OTA manifests, release notes. | `firmware-artifacts/global/{firmware_version}/vehicle-box.bin` |

## Migration

The storage setup lives in:

- `supabase/migrations/202605200002_flashavtl_storage.sql`
- `supabase/migrations/202605200003_auth_crud_and_entities.sql`

Run it after:

- `supabase/migrations/202605200001_initial_schema.sql`

Migration `202605200003_auth_crud_and_entities.sql` adds the `storage_files` metadata table used by the web and mobile apps to connect uploaded objects to organizations, vehicles, bookings, users, reports, and firmware releases.

## Access Rules

- The bucket is private.
- Authenticated users can only see files allowed by RLS policies.
- Vehicle documents are restricted to platform, owner, manager, staff, and maintenance roles.
- Damage and inspection media can be uploaded by operational users, drivers, and customers in their organization.
- Identity evidence can be uploaded by the verified user or trusted operations roles.
- Firmware artifacts can only be uploaded or modified by platform admins.
- Service-role backend APIs can still bypass RLS for controlled server-side workflows.

## Upload Contract

Application code must always upload files using these prefixes exactly. Do not put files directly at bucket root.

Allowed first folder names:

- `vehicle-documents`
- `damage-media`
- `identity-evidence`
- `inspection-media`
- `firmware-artifacts`

## Production Notes

- Prefer signed upload URLs from the backend for sensitive workflows.
- Keep firmware artifacts signed and immutable after release.
- Store file metadata in application tables, not only in Storage object metadata.
- Audit the related business action when a file is uploaded, updated, or deleted.
