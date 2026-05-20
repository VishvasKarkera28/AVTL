# API Contracts

## API Style

Use REST for operational commands and standard app workflows. Use realtime channels for live vehicle state. Use event streams for telemetry and AI pipelines.

## Core REST Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/vehicles` | List vehicles visible to current user. |
| GET | `/v1/vehicles/{id}` | Get vehicle digital twin. |
| GET | `/v1/vehicles/{id}/state` | Get latest vehicle state. |
| POST | `/v1/vehicles/{id}/commands` | Request command such as lock, unlock, horn, diagnostics. |
| GET | `/v1/bookings` | List bookings. |
| POST | `/v1/bookings` | Create booking. |
| POST | `/v1/bookings/{id}/start` | Start trip workflow. |
| POST | `/v1/bookings/{id}/end` | End trip workflow. |
| POST | `/v1/access-grants` | Create access grant. |
| POST | `/v1/access-grants/{id}/offline-token` | Issue offline token. |
| POST | `/v1/identity/verify` | Start identity verification. |
| POST | `/v1/damage-reports` | Create damage report. |
| GET | `/v1/analytics/executive` | Executive dashboard metrics. |

## Vehicle Command Request

```json
{
  "command_type": "unlock",
  "reason": "customer_booking",
  "booking_id": "uuid",
  "requested_safety_policy": {
    "require_stationary": true,
    "require_ignition_off": false
  }
}
```

## Vehicle Command Response

```json
{
  "command_id": "uuid",
  "status": "queued",
  "expires_at": "2026-05-20T10:05:00Z"
}
```

## Device Telemetry Ingest

`POST /v1/device/telemetry`

Headers:

- `X-Device-Serial`
- `X-Device-Signature`
- `X-Device-Timestamp`

Body:

```json
{
  "sequence": 18421,
  "recorded_at": "2026-05-20T10:00:00Z",
  "vehicle_id": "uuid",
  "location": {
    "latitude": 12.9141,
    "longitude": 74.856,
    "speed_kph": 42.5,
    "heading_deg": 185
  },
  "state": {
    "ignition_on": false,
    "lock_state": "locked",
    "fuel_percent": 63
  },
  "events": []
}
```

## Realtime Channels

| Channel | Payload |
| --- | --- |
| `org:{organization_id}:fleet-state` | Latest vehicle state changes. |
| `vehicle:{vehicle_id}:commands` | Command state updates. |
| `org:{organization_id}:alerts` | Theft, tamper, health, geofence alerts. |
| `booking:{booking_id}` | Booking and trip lifecycle updates. |
