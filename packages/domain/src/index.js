export const storageConfig = {
  bucket: "FlashAVTLStorage",
  prefixes: [
    "vehicle-documents",
    "damage-media",
    "identity-evidence",
    "inspection-media",
    "firmware-artifacts"
  ],
  objectExamples: [
    "vehicle-documents/7f8a-bp-org/mh01bp4472/insurance-2026.pdf",
    "identity-evidence/7f8a-bp-org/usr-nisha-rao/liveness-session-4421.jpg",
    "inspection-media/7f8a-bp-org/booking-demo-001/pre-trip/video.mp4",
    "damage-media/7f8a-bp-org/veh-mh01bp4472/damage-demo-041/front-left.jpg"
  ]
};

export const organization = {
  id: "7f8a-bp-org",
  name: "BP Petroleum Logistics",
  legalName: "BP Petroleum Logistics Private Limited",
  tenantCode: "BP-MUMBAI-FLEET",
  status: "active",
  timezone: "Asia/Kolkata",
  plan: "Enterprise pilot",
  primaryBranch: {
    id: "branch-mumbai-terminal",
    name: "Mumbai Fuel Terminal",
    address: "Nhava Sheva Fuel Terminal, Mumbai, Maharashtra",
    coordinates: {
      latitude: 19.0760,
      longitude: 72.8777
    }
  }
};

export const moduleStatuses = [
  {
    id: "foundation",
    label: "Platform Foundation",
    status: "ready",
    progress: 86,
    description: "Tenant, RBAC, storage, audit, branch and environment controls are prepared for the BP Petroleum pilot."
  },
  {
    id: "identity",
    label: "Authentication and Identity",
    status: "ready",
    progress: 78,
    description: "Role-aware login, MFA readiness, driver verification and identity evidence paths are modeled."
  },
  {
    id: "digital-twin",
    label: "Vehicle Digital Twin",
    status: "ready",
    progress: 82,
    description: "The BP Petroleum truck lifecycle, device, documents, telemetry and lock history are available."
  },
  {
    id: "command-center",
    label: "Fleet Command Center",
    status: "ready",
    progress: 74,
    description: "Map, fleet status, alerts, command queue and telemetry feeds are modeled for dispatch."
  },
  {
    id: "smart-access",
    label: "Smart Access and Locking",
    status: "ready",
    progress: 72,
    description: "App, BLE, optical, QR, NFC and offline access flows are connected to BP Petroleum role policies."
  },
  {
    id: "booking",
    label: "Rental Booking Platform",
    status: "ready",
    progress: 68,
    description: "Booking, pricing, vehicle assignment, handoff and customer/driver checklists are modeled."
  },
  {
    id: "trip-tracking",
    label: "Trip Tracking",
    status: "ready",
    progress: 70,
    description: "Active trip route, driver events, geofence policy, timeline and trip KPIs are available."
  },
  {
    id: "inspection-damage",
    label: "Inspection and Damage Intelligence",
    status: "ready",
    progress: 66,
    description: "Pre-trip and post-trip inspection media, AI findings, review queue and dispute workflow are modeled."
  }
];

export const foundationChecks = [
  {
    label: "Tenant isolation",
    status: "Secure",
    detail: "Organization-scoped records use RLS-compatible organization IDs."
  },
  {
    label: "Storage bucket",
    status: "Ready",
    detail: "Private FlashAVTLStorage bucket uses controlled folder prefixes."
  },
  {
    label: "Audit trail",
    status: "Ready",
    detail: "Command, identity, access and document events map to append-only logs."
  },
  {
    label: "RBAC baseline",
    status: "Ready",
    detail: "Owner, manager, staff, driver, customer and maintenance roles are modeled."
  }
];

export const demoUsers = [
  {
    id: "usr-nisha-rao",
    name: "Nisha Rao",
    role: "Manager",
    email: "nisha.rao@bp.example",
    phone: "+91 98765 44021",
    branch: "Mumbai Fuel Terminal",
    identityStatus: "Verified",
    mfa: true,
    lastSeen: "Today, 09:18",
    access: ["fleet_read", "fleet_command", "identity_review", "vehicle_documents"]
  },
  {
    id: "usr-ramesh-hegde",
    name: "Ramesh Hegde",
    role: "Driver",
    email: "ramesh.hegde@bp.example",
    phone: "+91 98801 77442",
    branch: "Mumbai Fuel Terminal",
    identityStatus: "Verified",
    mfa: false,
    lastSeen: "Today, 08:42",
    access: ["assigned_vehicle", "trip_start", "offline_unlock"]
  },
  {
    id: "usr-fatima-sheikh",
    name: "Fatima Sheikh",
    role: "Maintenance",
    email: "fatima.sheikh@bp.example",
    phone: "+91 90084 11890",
    branch: "Mumbai Service Bay",
    identityStatus: "Verified",
    mfa: true,
    lastSeen: "Yesterday, 17:52",
    access: ["vehicle_health", "work_orders", "service_documents"]
  }
];

export const identityChecks = [
  {
    id: "idv-4421",
    userId: "usr-ramesh-hegde",
    label: "Driver face match",
    status: "Passed",
    confidence: 98.4,
    evidencePath: "identity-evidence/7f8a-bp-org/usr-ramesh-hegde/idv-4421/selfie.jpg"
  },
  {
    id: "idv-4422",
    userId: "usr-ramesh-hegde",
    label: "Liveness challenge",
    status: "Passed",
    confidence: 96.9,
    evidencePath: "identity-evidence/7f8a-bp-org/usr-ramesh-hegde/idv-4422/liveness.jpg"
  },
  {
    id: "idv-4423",
    userId: "usr-nisha-rao",
    label: "Manager MFA policy",
    status: "Enabled",
    confidence: 100,
    evidencePath: "identity-evidence/7f8a-bp-org/usr-nisha-rao/mfa-policy.json"
  }
];

export const vehicleTwin = {
  id: "veh-mh01bp4472",
  registrationNumber: "MH-01-BP-4472",
  vin: "BPAVTLTANK4472",
  displayName: "BP Petroleum Tanker 4472",
  vehicleType: "Petroleum tanker truck",
  make: "Tata Motors",
  model: "LPT 3118 Tanker",
  year: 2023,
  fuelType: "Diesel",
  capacity: "12 KL",
  productCarried: "High-speed diesel",
  status: "available",
  lockState: "locked",
  depot: "Mumbai Fuel Terminal",
  route: "Mumbai Fuel Terminal to Pune Depot",
  driver: "Ramesh Hegde",
  healthScore: 92,
  riskScore: 18,
  odometerKm: 48216,
  utilization: 71,
  currentState: {
    latitude: 19.0760,
    longitude: 72.8777,
    speedKph: 0,
    ignition: "off",
    network: "LTE",
    batteryBackup: "91%",
    fuelPercent: 68,
    lastSeen: "2026-05-20 09:22 IST"
  },
  device: {
    serial: "FFAI-BOX-BP-0004472",
    firmware: "vehicle-box-0.9.4",
    hardware: "rev-pilot-b",
    secureElement: "TA101 class secure element",
    gnss: "3D fix",
    cellular: "LTE Cat M1",
    opticalReceiver: "Calibrated",
    ble: "Advertising",
    tamper: "Clear"
  },
  documents: [
    {
      type: "Registration Certificate",
      number: "MH01BP4472",
      status: "Valid",
      expires: "2038-04-12",
      storagePath: "vehicle-documents/7f8a-bp-org/veh-mh01bp4472/registration.pdf"
    },
    {
      type: "Hazmat Permit",
      number: "HZM-KA-2026-117",
      status: "Valid",
      expires: "2027-01-31",
      storagePath: "vehicle-documents/7f8a-bp-org/veh-mh01bp4472/hazmat-permit.pdf"
    },
    {
      type: "Insurance",
      number: "POL-BP-4472-26",
      status: "Valid",
      expires: "2027-03-18",
      storagePath: "vehicle-documents/7f8a-bp-org/veh-mh01bp4472/insurance.pdf"
    },
    {
      type: "Pollution Certificate",
      number: "PUC-4472-0526",
      status: "Review soon",
      expires: "2026-06-18",
      storagePath: "vehicle-documents/7f8a-bp-org/veh-mh01bp4472/puc.pdf"
    }
  ],
  serviceHistory: [
    {
      date: "2026-05-12",
      title: "Brake inspection",
      result: "Passed",
      notes: "Front pads at 64%, rear pads at 58%."
    },
    {
      date: "2026-04-27",
      title: "Tank valve seal check",
      result: "Passed",
      notes: "No leakage detected during pressure hold."
    },
    {
      date: "2026-04-04",
      title: "Telematics calibration",
      result: "Completed",
      notes: "Optical unlock receiver and GNSS antenna calibrated."
    }
  ],
  accessHistory: [
    {
      time: "Today, 08:04",
      actor: "Ramesh Hegde",
      method: "Face verified app unlock",
      result: "Accepted"
    },
    {
      time: "Today, 07:58",
      actor: "Nisha Rao",
      method: "Remote lock status check",
      result: "Accepted"
    },
    {
      time: "Yesterday, 21:11",
      actor: "Vehicle box",
      method: "Auto lock after idle timeout",
      result: "Completed"
    }
  ],
  lifecycle: [
    {
      label: "Onboarded",
      value: "2026-04-01"
    },
    {
      label: "Last inspection",
      value: "2026-05-19"
    },
    {
      label: "Next service",
      value: "2026-06-08"
    },
    {
      label: "Insurance expiry",
      value: "2027-03-18"
    }
  ]
};

export const auditEvents = [
  {
    time: "09:22",
    actor: "Vehicle box",
    action: "Latest state synced",
    scope: "veh-mh01bp4472"
  },
  {
    time: "09:18",
    actor: "Nisha Rao",
    action: "Reviewed identity status",
    scope: "usr-ramesh-hegde"
  },
  {
    time: "08:04",
    actor: "Ramesh Hegde",
    action: "Unlocked assigned vehicle",
    scope: "veh-mh01bp4472"
  },
  {
    time: "07:40",
    actor: "System",
    action: "Storage policy check passed",
    scope: "FlashAVTLStorage"
  }
];

export const dashboardMetrics = [
  {
    label: "Active tenant",
    value: "1",
    detail: "BP Petroleum pilot company"
  },
  {
    label: "Verified users",
    value: "3",
    detail: "Manager, driver, maintenance"
  },
  {
    label: "Vehicle twins",
    value: "1",
    detail: "Petroleum tanker truck"
  },
  {
    label: "Storage paths",
    value: "5",
    detail: "Private bucket prefixes"
  }
];

export const fleetCommandMetrics = [
  {
    label: "Available",
    value: "1",
    detail: "BP tanker ready at terminal",
    tone: "green"
  },
  {
    label: "In use",
    value: "0",
    detail: "No active delivery run",
    tone: "blue"
  },
  {
    label: "Maintenance",
    value: "0",
    detail: "No open blocking work order",
    tone: "amber"
  },
  {
    label: "Offline",
    value: "0",
    detail: "Vehicle box online through LTE",
    tone: "dark"
  }
];

export const fleetVehicles = [
  {
    id: vehicleTwin.id,
    registrationNumber: vehicleTwin.registrationNumber,
    name: vehicleTwin.displayName,
    status: "available",
    statusColor: "green",
    driver: vehicleTwin.driver,
    route: vehicleTwin.route,
    speedKph: vehicleTwin.currentState.speedKph,
    lockState: vehicleTwin.lockState,
    fuelPercent: vehicleTwin.currentState.fuelPercent,
    healthScore: vehicleTwin.healthScore,
    riskScore: vehicleTwin.riskScore,
    network: vehicleTwin.currentState.network,
    lastSeen: vehicleTwin.currentState.lastSeen,
    coordinates: {
      latitude: vehicleTwin.currentState.latitude,
      longitude: vehicleTwin.currentState.longitude
    }
  }
];

export const commandCenterAlerts = [
  {
    id: "alert-puc-review",
    severity: "medium",
    title: "PUC review due soon",
    detail: "Pollution certificate expires on 2026-06-18.",
    time: "09:24"
  },
  {
    id: "alert-route-policy",
    severity: "low",
    title: "Route corridor loaded",
    detail: "Mumbai Fuel Terminal to Pune Depot geofence corridor is active.",
    time: "09:20"
  },
  {
    id: "alert-device-sync",
    severity: "low",
    title: "Vehicle box heartbeat",
    detail: "LTE heartbeat received with clear tamper state.",
    time: "09:22"
  }
];

export const commandQueue = [
  {
    id: "cmd-7742",
    command: "Lock status sync",
    requestedBy: "Nisha Rao",
    status: "completed",
    safety: "stationary verified",
    time: "09:22"
  },
  {
    id: "cmd-7743",
    command: "Diagnostics snapshot",
    requestedBy: "System",
    status: "queued",
    safety: "read-only command",
    time: "09:30"
  },
  {
    id: "cmd-7744",
    command: "Firmware policy check",
    requestedBy: "Platform",
    status: "scheduled",
    safety: "ignition off required",
    time: "22:00"
  }
];

export const geofencePolicies = [
  {
    id: "geo-terminal",
    name: "Mumbai Fuel Terminal",
    type: "allowed",
    action: "Normal operations",
    status: "active"
  },
  {
    id: "geo-corridor",
    name: "Pune delivery corridor",
    type: "route corridor",
    action: "Alert if route deviation exceeds 1.5 km",
    status: "active"
  },
  {
    id: "geo-night",
    name: "Night movement policy",
    type: "time based",
    action: "Require manager approval after 21:00",
    status: "armed"
  }
];

export const smartAccessMethods = [
  {
    id: "app",
    name: "App unlock",
    availability: "Online",
    status: "Primary",
    latency: "420 ms",
    security: "RBAC plus signed command"
  },
  {
    id: "ble",
    name: "Bluetooth unlock",
    availability: "Offline nearby",
    status: "Ready",
    latency: "1.8 s",
    security: "Challenge-response grant"
  },
  {
    id: "optical",
    name: "Optical flashlight unlock",
    availability: "No internet",
    status: "Calibrated",
    latency: "3.2 s",
    security: "Encrypted pulse token"
  },
  {
    id: "qr",
    name: "QR emergency unlock",
    availability: "Support assisted",
    status: "Restricted",
    latency: "Manual approval",
    security: "One-time emergency grant"
  },
  {
    id: "nfc",
    name: "NFC card unlock",
    availability: "Staff and maintenance",
    status: "Pilot",
    latency: "800 ms",
    security: "Card plus device policy"
  }
];

export const accessGrant = {
  id: "grant-bp-4472-20260520",
  vehicleId: vehicleTwin.id,
  userId: "usr-ramesh-hegde",
  userName: "Ramesh Hegde",
  validFrom: "2026-05-20 08:00 IST",
  validUntil: "2026-05-20 18:00 IST",
  allowedMethods: ["app", "ble", "optical"],
  maxOfflineUses: 2,
  offlineUsesRemaining: 2,
  status: "active",
  tokenPath: "access-grants/7f8a-bp-org/veh-mh01bp4472/grant-bp-4472-20260520.json"
};

export const accessSafetyChecks = [
  {
    label: "Vehicle binding",
    status: "Passed",
    detail: "Grant is bound to MH-01-BP-4472."
  },
  {
    label: "User binding",
    status: "Passed",
    detail: "Grant is bound to verified driver Ramesh Hegde."
  },
  {
    label: "Time window",
    status: "Passed",
    detail: "Access expires automatically at 18:00 IST."
  },
  {
    label: "Replay cache",
    status: "Ready",
    detail: "Vehicle box will reject reused optical and BLE nonces."
  }
];

export const booking = {
  id: "booking-bp-20260520-001",
  type: "Petroleum delivery assignment",
  customer: "BP Pune Depot",
  vehicleId: vehicleTwin.id,
  vehicleName: vehicleTwin.displayName,
  driverId: "usr-ramesh-hegde",
  driverName: "Ramesh Hegde",
  staffOwner: "Nisha Rao",
  startsAt: "2026-05-20 10:00 IST",
  endsAt: "2026-05-20 16:30 IST",
  status: "ready for dispatch",
  pickup: "Mumbai Fuel Terminal",
  dropoff: "Pune Depot",
  distanceKm: 59.4,
  cargo: "High-speed diesel",
  quantity: "12 KL",
  priceSummary: {
    baseCharge: "INR 18,500",
    driverAllowance: "INR 1,200",
    securityHold: "INR 50,000",
    estimatedTotal: "INR 19,700"
  }
};

export const bookingChecklist = [
  {
    label: "Driver identity verified",
    owner: "System",
    status: "complete"
  },
  {
    label: "Vehicle documents valid",
    owner: "Nisha Rao",
    status: "complete"
  },
  {
    label: "Tank seal inspection",
    owner: "Ramesh Hegde",
    status: "pending at dispatch"
  },
  {
    label: "Offline access issued",
    owner: "System",
    status: "complete"
  },
  {
    label: "Pre-trip 360 inspection",
    owner: "Driver app",
    status: "pending at vehicle"
  }
];

export const bookingCalendar = [
  {
    time: "08:00",
    title: "Vehicle readiness check",
    status: "complete"
  },
  {
    time: "10:00",
    title: "Dispatch to Pune Depot",
    status: "scheduled"
  },
  {
    time: "13:15",
    title: "Expected depot arrival",
    status: "planned"
  },
  {
    time: "16:30",
    title: "Return and post-trip inspection",
    status: "planned"
  }
];

export const activeTrip = {
  id: "trip-bp-4472-demo",
  bookingId: booking.id,
  status: "scheduled",
  route: booking.dropoff,
  origin: booking.pickup,
  destination: booking.dropoff,
  driver: booking.driverName,
  vehicle: vehicleTwin.registrationNumber,
  distanceKm: booking.distanceKm,
  completedKm: 0,
  eta: "13:15 IST",
  averageSpeedKph: 0,
  idleMinutes: 0,
  riskScore: vehicleTwin.riskScore,
  geofence: "Pune delivery corridor active"
};

export const tripTimeline = [
  {
    time: "09:30",
    title: "Pre-dispatch checklist opens",
    detail: "Driver app receives inspection and access tasks."
  },
  {
    time: "10:00",
    title: "Trip start window",
    detail: "Unlock allowed after face verification and tank seal check."
  },
  {
    time: "10:12",
    title: "Terminal exit geofence",
    detail: "Command center begins route corridor monitoring."
  },
  {
    time: "13:15",
    title: "Expected Pune arrival",
    detail: "Depot handoff and post-delivery confirmation."
  }
];

export const tripEvents = [
  {
    id: "trip-event-1",
    type: "speed",
    status: "clear",
    label: "Speeding",
    count: 0
  },
  {
    id: "trip-event-2",
    type: "braking",
    status: "clear",
    label: "Harsh braking",
    count: 0
  },
  {
    id: "trip-event-3",
    type: "route",
    status: "armed",
    label: "Route deviation alerts",
    count: 0
  },
  {
    id: "trip-event-4",
    type: "identity",
    status: "required",
    label: "Face verification before start",
    count: 1
  }
];

export const inspectionSession = {
  id: "inspection-bp-4472-20260520",
  vehicleId: vehicleTwin.id,
  bookingId: booking.id,
  status: "pre-trip pending",
  requiredViews: 8,
  completedViews: 6,
  storageBasePath: "inspection-media/7f8a-bp-org/booking-bp-20260520-001/pre-trip/",
  reviewer: "Nisha Rao"
};

export const inspectionChecklist = [
  {
    label: "Front view",
    status: "captured",
    path: "inspection-media/7f8a-bp-org/booking-bp-20260520-001/pre-trip/front.jpg"
  },
  {
    label: "Left tank shell",
    status: "captured",
    path: "inspection-media/7f8a-bp-org/booking-bp-20260520-001/pre-trip/left-shell.jpg"
  },
  {
    label: "Rear valve area",
    status: "captured",
    path: "inspection-media/7f8a-bp-org/booking-bp-20260520-001/pre-trip/rear-valve.jpg"
  },
  {
    label: "Seal and hazmat placard",
    status: "pending",
    path: "inspection-media/7f8a-bp-org/booking-bp-20260520-001/pre-trip/seal-placard.jpg"
  }
];

export const damageFindings = [
  {
    id: "damage-demo-041",
    severity: "minor",
    panel: "Front-left bumper",
    type: "Surface scratch",
    confidence: 88.6,
    status: "needs staff review",
    beforePath: "damage-media/7f8a-bp-org/veh-mh01bp4472/baseline/front-left.jpg",
    afterPath: "damage-media/7f8a-bp-org/veh-mh01bp4472/damage-demo-041/front-left.jpg"
  },
  {
    id: "damage-demo-042",
    severity: "none",
    panel: "Tank shell",
    type: "No new damage",
    confidence: 96.1,
    status: "auto cleared",
    beforePath: "damage-media/7f8a-bp-org/veh-mh01bp4472/baseline/tank-shell.jpg",
    afterPath: "damage-media/7f8a-bp-org/veh-mh01bp4472/damage-demo-042/tank-shell.jpg"
  }
];

export const damageReviewQueue = [
  {
    time: "09:34",
    title: "AI finding created",
    detail: "Minor front-left bumper scratch requires staff review."
  },
  {
    time: "09:35",
    title: "Evidence stored",
    detail: "Before and after images saved under damage-media."
  },
  {
    time: "09:36",
    title: "Review assigned",
    detail: "Nisha Rao assigned as reviewer before dispatch clearance."
  }
];

export const getActiveDriver = () => demoUsers.find((user) => user.role === "Driver");
