# AI Modules

## AI Service Boundaries

AI services should produce explainable recommendations and risk scores. The system should store model version, input summary, output, and reason factors for every prediction that can affect a customer, driver, vehicle access, maintenance cost, or insurance report.

## Driver Risk Score

Inputs:

- Speed relative to road limit.
- Harsh braking.
- Sudden acceleration.
- Cornering force.
- Night driving.
- Route deviation.
- Phone distraction signals where consented and legal.
- Previous trip history.

Output:

```json
{
  "score": 78,
  "risk_band": "medium",
  "factors": [
    {"name": "speeding", "impact": 12},
    {"name": "harsh_braking", "impact": 7}
  ],
  "model_version": "risk-v1.0"
}
```

## Predictive Vehicle Health

Inputs:

- OBD diagnostic trouble codes.
- Battery voltage patterns.
- Engine temperature.
- Fuel efficiency trend.
- Vibration signature.
- Brake event frequency.
- Tire pressure, if available.
- Maintenance history.

Predictions:

- Brake replacement due.
- Battery failure probability.
- Tire service requirement.
- Fuel injector issue.
- Engine abnormality.
- EV battery degradation.

## Theft and Anomaly Detection

Inputs:

- Time of use.
- Location.
- Driver identity.
- Route pattern.
- Device tamper state.
- Lock state.
- Ignition state.
- Offline duration.

Responses:

- Alert manager.
- Increase tracking frequency.
- Require identity re-verification.
- Prepare silent lock for safe stop.
- Trigger camera where installed and legally permitted.

## Damage Detection

Workflow:

1. Customer captures 360 degree video before trip.
2. App uploads frames to storage.
3. AI compares current frames with previous baseline.
4. AI marks scratch, dent, glass, light, and panel damage candidates.
5. Staff reviews findings before dispute or charge.

Required outputs:

- Damage type.
- Confidence.
- Vehicle side or panel.
- Before/after media links.
- Human review status.

## EV Energy Optimization

Inputs:

- Battery state of charge.
- Battery health.
- Route.
- Elevation.
- Traffic.
- Driver behavior.
- Charging station availability.
- Depot charging capacity.

Outputs:

- Charge before dispatch.
- Suggested charging station.
- Expected arrival battery.
- Depot charging schedule.
- Vehicle assignment recommendation.
