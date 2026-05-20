# Backend RBAC and Data Model

## Data Ownership

Every operational record belongs to one organization unless it is a platform-level configuration record. The FlashAVTL API enforces tenant and role checks before using Supabase as the data store.

## Main Entities

| Entity | Description |
| --- | --- |
| Organization | Tenant company using the platform. |
| Branch | Physical branch, depot, or city operation. |
| App User | Application login user with a password hash and JWT identity. |
| App User Role | Role assignment within organization and optional branch. |
| Profile | Optional legacy profile link for existing profile-based records. |
| Vehicle | Fleet asset. |
| Vehicle Device | Installed FlashFleet hardware box. |
| Vehicle Latest State | Fast lookup state for command center. |
| Telemetry Event | Raw or normalized vehicle telemetry. |
| Booking | Rental or assignment window. |
| Trip | Actual usage session. |
| Access Grant | Permission to access a vehicle. |
| Offline Unlock Token | Hashed, expiring, limited-use offline access token. |
| Vehicle Command | Remote command request and result. |
| Geofence | Zone geometry and policy. |
| Maintenance Prediction | AI prediction for service planning. |
| Damage Report | Human and AI damage evidence. |
| Audit Log | Append-only security and compliance record. |

## Authorization Strategy

- Operators can read records inside their organization through API-scoped queries.
- Customers can only read or create their own bookings and currently assigned vehicles.
- Drivers can only read or create assigned trips and vehicle access windows.
- Maintenance users can read assigned vehicles and maintenance data.
- Platform admins can read across organizations through service-side admin APIs.

## Backend Services

| Service | Responsibility |
| --- | --- |
| Fleet API | Main REST/GraphQL API, RBAC, validation, command orchestration. |
| Access Token Service | Creates signed online and offline unlock tokens. |
| Command Service | Sends commands to device and tracks acknowledgement. |
| Telemetry Ingest | Accepts device telemetry, validates signatures, writes latest state and events. |
| Booking Service | Pricing, reservation, active trip lifecycle, payments integration. |
| Identity Service | Liveness, face match, KYC workflow, identity risk. |
| AI Inference Service | Risk, health, damage, theft, and energy predictions. |
| OTA Service | Firmware release management and rollout control. |

## API Authentication

- Mobile and web apps use FlashAVTL application JWTs issued by `services/api`.
- Vehicle boxes use mutual TLS or signed device JWTs.
- Backend services use private service credentials and network restrictions.
- Sensitive commands require signed command payloads, not only HTTPS transport.
