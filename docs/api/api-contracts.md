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
| POST | `/api/telemetry-events` | Ingest authenticated tracking telemetry into `telemetry_events`, update `vehicle_latest_state`, and refresh the vehicle current location. |
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

`POST /api/telemetry-events` is available in the current application API for authenticated operators and drivers. Production vehicle boxes can use the same payload contract behind a device-signed gateway.

Headers:

- `X-Device-Serial`
- `X-Device-Signature`
- `X-Device-Timestamp`

Body:

```json
{
  "organizationId": "uuid",
  "vehicleId": "uuid",
  "deviceId": "uuid",
  "recordedAt": "2026-05-20T10:00:00Z",
  "latitude": 19.076,
  "longitude": 72.8777,
  "speedKph": 42.5,
  "headingDeg": 185,
  "lockState": "locked",
  "fuelPercent": 63,
  "batteryPercent": 91,
  "networkState": "LTE",
  "healthFlags": {
    "healthScore": 92,
    "riskScore": 18
  },
  "payload": {
    "sequence": 18421,
    "ignitionOn": false
  }
}
```

## Realtime Channels

| Channel | Payload |
| --- | --- |
| `org:{organization_id}:fleet-state` | Latest vehicle state changes. |
| `vehicle:{vehicle_id}:commands` | Command state updates. |
| `org:{organization_id}:alerts` | Theft, tamper, health, geofence alerts. |
| `booking:{booking_id}` | Booking and trip lifecycle updates. |
