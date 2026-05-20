# Mobile and Web Screen Architecture

## Apps

- Customer mobile app
- Driver mobile app
- Staff mobile app
- Maintenance mobile app
- Owner and manager web console
- Platform admin web console

## Customer App Screens

```mermaid
flowchart TB
    Splash["Splash"]
    Login["Login / Signup"]
    KYC["Identity Verification"]
    Home["Available Vehicles"]
    VehicleDetails["Vehicle Details"]
    Booking["Booking and Payment"]
    Unlock["Unlock Center"]
    Trip["Active Trip"]
    FindVehicle["Find My Vehicle"]
    InspectionStart["Pre-Trip 360 Inspection"]
    InspectionEnd["Post-Trip Inspection"]
    Support["Support and Emergency"]
    Profile["Profile and Documents"]

    Splash --> Login
    Login --> KYC
    KYC --> Home
    Home --> VehicleDetails
    VehicleDetails --> Booking
    Booking --> Unlock
    Unlock --> InspectionStart
    InspectionStart --> Trip
    Trip --> FindVehicle
    Trip --> Support
    Trip --> InspectionEnd
    Home --> Profile
```

## Manager Web Console

```mermaid
flowchart TB
    Dashboard["Executive Dashboard"]
    Map["Live Command Center"]
    Vehicles["Vehicle Digital Twins"]
    Bookings["Bookings"]
    Drivers["Drivers and Customers"]
    Risk["AI Risk Center"]
    Maintenance["Predictive Maintenance"]
    Geo["Geo-Fence Intelligence"]
    Access["Access and Tokens"]
    Incidents["Security Incidents"]
    Analytics["Analytics"]
    Settings["Settings and RBAC"]

    Dashboard --> Map
    Dashboard --> Vehicles
    Dashboard --> Bookings
    Dashboard --> Risk
    Vehicles --> Maintenance
    Vehicles --> Access
    Map --> Geo
    Map --> Incidents
    Analytics --> Dashboard
    Settings --> Access
```

## Maintenance App Screens

- Assigned work orders
- Vehicle diagnostics
- Predictive health alerts
- Service checklist
- Parts used
- Service photos
- Test drive report
- Close work order

## Staff App Screens

- Today bookings
- Customer check-in
- Identity review
- Vehicle handoff
- Inspection capture
- Emergency unlock approval
- Return processing
- Payment issue handling

## Driver App Screens

- Assigned vehicle
- Shift start verification
- Unlock center
- Trip route
- Driver behavior feedback
- Incident reporting
- Shift end inspection

## Unlock Center

Unlock methods shown by availability:

- Internet app unlock
- Bluetooth unlock
- Optical flashlight unlock
- NFC unlock
- QR emergency unlock
- Offline token unlock

The app should always show the safest available method first. If internet is down, it should automatically offer Bluetooth or optical unlock without making the user understand the network failure.
