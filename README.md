# AVTL

FlashFleet AI - Advanced Vehicle Fleet Intelligence and Secure Access Platform.

This workspace contains the production blueprint for a fleet platform that combines rental operations, live vehicle tracking, smart locking, offline optical/mobile access, AI risk scoring, predictive maintenance, digital vehicle twins, and secure command-center workflows.

## Project Structure

- `src/` - application source code
- `apps/mobile/` - React Native and Expo mobile app workspace
- `apps/web/` - manager, owner, and platform admin web console
- `services/api/` - backend API and command services
- `services/ai/` - AI inference and model services
- `firmware/vehicle-box/` - ESP32-S3-class vehicle box firmware workspace
- `supabase/` - Supabase setup notes and migrations
- `hardware/` - future PCB, enclosure, harness, and hardware test artifacts
- `public/` - static assets
- `docs/` - product, architecture, backend, mobile, AI, security, operations, and hardware documents
- `tests/` - test files

## Core Documents

- [Product Vision](docs/product/vision.md)
- [Core Modules](docs/product/core-modules.md)
- [Roles and RBAC](docs/product/roles-and-rbac.md)
- [System Architecture](docs/architecture/system-architecture.md)
- [Event Taxonomy](docs/architecture/event-taxonomy.md)
- [Screen Architecture](docs/mobile/screen-architecture.md)
- [Database Schema SQL](docs/backend/database-schema.sql)
- [Database ERD](docs/backend/database-erd.md)
- [RBAC and Data Model](docs/backend/rbac-and-data-model.md)
- [Storage Architecture](docs/backend/storage-architecture.md)
- [Secure Access Workflow](docs/security/secure-access-workflow.md)
- [JWT Auth and Authorization Workflow](docs/security/auth-authorization-workflow.md)
- [Vehicle Box Hardware Spec](docs/hardware/vehicle-box-spec.md)
- [Circuit Diagram](docs/hardware/circuit-diagram.md)
- [Hardware BOM](docs/hardware/bom.md)
- [Component Selection Notes](docs/hardware/component-selection-notes.md)
- [Firmware Workflow](docs/hardware/firmware-workflow.md)
- [AI Modules](docs/ai/ai-modules.md)
- [API Contracts](docs/api/api-contracts.md)
- [Application Development Modules](docs/product/development-modules.md)
- [Production Workflow](docs/operations/production-workflow.md)
- [Implementation Roadmap](docs/operations/implementation-roadmap.md)

## Suggested Build Stack

- Mobile: React Native with Expo
- Web: React or Next.js
- Backend: Supabase plus Node/TypeScript services
- Streaming: Kafka or Azure Event Hubs
- Maps: Mapbox
- AI: Python with TensorFlow or PyTorch
- Firmware: ESP-IDF
- Cloud: Microsoft Azure

## Environment

Start from [.env.example](.env.example) and fill in Supabase, Mapbox, messaging, AI service, and device signing values for local development.

## Run The Apps

Install dependencies:

```bash
npm install
```

Start the web console:

```bash
npm run dev:web
```

Start the secure backend API for admin user creation and signed upload URLs:

```bash
npm run dev:api
```

Start the mobile app in Expo:

```bash
npm run dev:mobile
```

Current runnable demo modules:

- Platform Foundation
- Authentication and Identity
- Vehicle Digital Twin
- Fleet Command Center
- Smart Access and Locking
- Rental Booking Platform
- Trip Tracking
- Inspection and Damage Intelligence

Validate the workspace:

```bash
npm run typecheck
npm run build:web
cd apps/mobile && npx expo export --platform android --output-dir dist-android
```

## Supabase Live Mode

Run the Supabase migrations in order against the `FlashAVTL` database:

```text
supabase/migrations/202605200001_initial_schema.sql
supabase/migrations/202605200002_flashavtl_storage.sql
supabase/migrations/202605200003_auth_crud_and_entities.sql
```

Supabase Storage uses one private bucket named `FlashAVTLStorage`. The five required storage areas are folder prefixes inside that bucket: `vehicle-documents`, `damage-media`, `identity-evidence`, `inspection-media`, and `firmware-artifacts`.

Create the first platform admin and HPCL demo truck with the service-role bootstrap script:

```bash
npm run bootstrap:admin
```

## Safety Note

Vehicle lock, immobilizer, horn, lights, and speed-policy integrations must be designed with certified automotive engineers and installers. Production immobilization must only occur under safe vehicle states and legal operating conditions.
