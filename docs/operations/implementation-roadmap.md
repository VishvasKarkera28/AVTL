# Implementation Roadmap

## Phase 1 - MVP Foundation

- Supabase auth, organizations, roles, vehicles, bookings.
- Customer app basic booking and online unlock request.
- Manager web command center with map and vehicle state.
- Vehicle box prototype with GPS, LTE, BLE, relay output.
- Basic telemetry ingestion and latest state table.
- Audit logs for commands and access events.

## Phase 2 - Secure Offline Access

- Access grants and offline token service.
- BLE challenge-response unlock.
- Optical unlock receiver prototype.
- Secure element provisioning.
- Device replay cache.
- Offline event sync.

## Phase 3 - Rental Operations

- Payments integration.
- Pre-trip and post-trip inspection.
- Damage report workflow.
- Staff handoff app.
- Dynamic access sharing.
- Branch-level operations.

## Phase 4 - AI Intelligence

- Driver risk score model.
- Predictive maintenance model.
- Theft anomaly detection.
- Damage detection AI.
- Executive analytics dashboard.

## Phase 5 - Production Hardware

- Custom PCB.
- Automotive power protection.
- Enclosure and harness.
- EMC and thermal validation.
- Factory provisioning line.
- OTA release pipeline.

## Phase 6 - Enterprise Scale

- Multi-region deployment.
- Kafka analytics lake.
- Insurance reporting.
- EV optimization.
- Corporate fleet policies.
- API marketplace integrations.

## Suggested First Build Stack

| Area | Choice |
| --- | --- |
| Mobile | React Native with Expo |
| Web | React or Next.js |
| Backend | Supabase plus Node/TypeScript services |
| Streaming | Kafka or Azure Event Hubs |
| Maps | Mapbox |
| AI | Python services with TensorFlow/PyTorch |
| Hardware Firmware | ESP-IDF for ESP32-S3 |
| Cloud | Microsoft Azure |
