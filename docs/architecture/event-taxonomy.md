# Event Taxonomy

## Event Naming

Use dot-separated event names:

`domain.entity.action.version`

Examples:

- `vehicle.telemetry.received.v1`
- `vehicle.command.requested.v1`
- `vehicle.command.completed.v1`
- `access.token.issued.v1`
- `access.unlock.accepted.v1`
- `trip.started.v1`
- `trip.ended.v1`
- `ai.risk_score.updated.v1`
- `maintenance.prediction.created.v1`
- `security.tamper.detected.v1`

## Required Event Envelope

```json
{
  "event_id": "uuid",
  "event_type": "vehicle.telemetry.received.v1",
  "occurred_at": "2026-05-20T00:00:00Z",
  "organization_id": "uuid",
  "vehicle_id": "uuid",
  "device_id": "uuid",
  "actor_id": "uuid-or-null",
  "correlation_id": "uuid",
  "source": "vehicle_box",
  "payload": {}
}
```

## Telemetry Event Payload

```json
{
  "latitude": 12.9141,
  "longitude": 74.856,
  "speed_kph": 42.5,
  "heading_deg": 185,
  "fuel_percent": 63,
  "battery_percent": null,
  "odometer_km": 18234.2,
  "lock_state": "locked",
  "ignition_state": "off",
  "network_state": "lte",
  "sensor_flags": ["tamper_clear", "backup_battery_ok"]
}
```

## Command Event Payload

```json
{
  "command_type": "unlock",
  "requested_by": "uuid",
  "expires_at": "2026-05-20T00:05:00Z",
  "safety_state": {
    "vehicle_stationary": true,
    "ignition_off": true
  },
  "device_ack": {
    "status": "accepted",
    "latency_ms": 420
  }
}
```

## Retention Policy

| Event Type | Hot Storage | Cold Storage |
| --- | --- | --- |
| Latest vehicle state | Current only | Not required |
| Raw telemetry | 30-90 days | 3-7 years based on contract |
| Commands and access logs | 1 year | 7 years |
| Identity events | Contract-specific | Regulatory policy |
| AI predictions | 1 year | Model audit archive |
| Damage media metadata | Active rental period plus dispute window | 3-7 years |
