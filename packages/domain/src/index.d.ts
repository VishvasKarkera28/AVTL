export interface StorageConfig {
  bucket: string;
  prefixes: string[];
  objectExamples: string[];
}

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  tenantCode: string;
  status: string;
  timezone: string;
  plan: string;
  primaryBranch: {
    id: string;
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface ModuleStatus {
  id: string;
  label: string;
  status: string;
  progress: number;
  description: string;
}

export interface FoundationCheck {
  label: string;
  status: string;
  detail: string;
}

export interface DemoUser {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  branch: string;
  identityStatus: string;
  mfa: boolean;
  lastSeen: string;
  access: string[];
}

export interface IdentityCheck {
  id: string;
  userId: string;
  label: string;
  status: string;
  confidence: number;
  evidencePath: string;
}

export interface VehicleDocument {
  type: string;
  number: string;
  status: string;
  expires: string;
  storagePath: string;
}

export interface TimelineItem {
  date?: string;
  time?: string;
  title?: string;
  actor?: string;
  method?: string;
  result?: string;
  notes?: string;
}

export interface VehicleTwin {
  id: string;
  registrationNumber: string;
  vin: string;
  displayName: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  capacity: string;
  productCarried: string;
  status: string;
  lockState: string;
  depot: string;
  route: string;
  driver: string;
  healthScore: number;
  riskScore: number;
  odometerKm: number;
  utilization: number;
  currentState: Record<string, string | number>;
  device: Record<string, string>;
  documents: VehicleDocument[];
  serviceHistory: TimelineItem[];
  accessHistory: TimelineItem[];
  lifecycle: Array<{ label: string; value: string }>;
}

export interface AuditEvent {
  time: string;
  actor: string;
  action: string;
  scope: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface OperationalMetric extends DashboardMetric {
  tone?: string;
}

export interface FleetVehicle {
  id: string;
  registrationNumber: string;
  name: string;
  status: string;
  statusColor: string;
  driver: string;
  route: string;
  speedKph: string | number;
  lockState: string;
  fuelPercent: string | number;
  healthScore: number;
  riskScore: number;
  network: string | number;
  lastSeen: string | number;
  coordinates: {
    latitude: string | number;
    longitude: string | number;
  };
}

export interface OperationalAlert {
  id: string;
  severity: string;
  title: string;
  detail: string;
  time: string;
}

export interface CommandQueueItem {
  id: string;
  command: string;
  requestedBy: string;
  status: string;
  safety: string;
  time: string;
}

export interface GeofencePolicy {
  id: string;
  name: string;
  type: string;
  action: string;
  status: string;
}

export interface SmartAccessMethod {
  id: string;
  name: string;
  availability: string;
  status: string;
  latency: string;
  security: string;
}

export interface AccessGrant {
  id: string;
  vehicleId: string;
  userId: string;
  userName: string;
  validFrom: string;
  validUntil: string;
  allowedMethods: string[];
  maxOfflineUses: number;
  offlineUsesRemaining: number;
  status: string;
  tokenPath: string;
}

export interface AccessSafetyCheck {
  label: string;
  status: string;
  detail: string;
}

export interface Booking {
  id: string;
  type: string;
  customer: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  staffOwner: string;
  startsAt: string;
  endsAt: string;
  status: string;
  pickup: string;
  dropoff: string;
  distanceKm: number;
  cargo: string;
  quantity: string;
  priceSummary: Record<string, string>;
}

export interface ChecklistItem {
  label: string;
  owner?: string;
  status: string;
  path?: string;
}

export interface CalendarItem {
  time: string;
  title: string;
  status: string;
}

export interface ActiveTrip {
  id: string;
  bookingId: string;
  status: string;
  route: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  distanceKm: number;
  completedKm: number;
  eta: string;
  averageSpeedKph: number;
  idleMinutes: number;
  riskScore: number;
  geofence: string;
}

export interface TripTimelineItem {
  time: string;
  title: string;
  detail: string;
}

export interface TripEvent {
  id: string;
  type: string;
  status: string;
  label: string;
  count: number;
}

export interface InspectionSession {
  id: string;
  vehicleId: string;
  bookingId: string;
  status: string;
  requiredViews: number;
  completedViews: number;
  storageBasePath: string;
  reviewer: string;
}

export interface DamageFinding {
  id: string;
  severity: string;
  panel: string;
  type: string;
  confidence: number;
  status: string;
  beforePath: string;
  afterPath: string;
}

export const storageConfig: StorageConfig;
export const organization: Organization;
export const moduleStatuses: ModuleStatus[];
export const foundationChecks: FoundationCheck[];
export const demoUsers: DemoUser[];
export const identityChecks: IdentityCheck[];
export const vehicleTwin: VehicleTwin;
export const auditEvents: AuditEvent[];
export const dashboardMetrics: DashboardMetric[];
export const fleetCommandMetrics: OperationalMetric[];
export const fleetVehicles: FleetVehicle[];
export const commandCenterAlerts: OperationalAlert[];
export const commandQueue: CommandQueueItem[];
export const geofencePolicies: GeofencePolicy[];
export const smartAccessMethods: SmartAccessMethod[];
export const accessGrant: AccessGrant;
export const accessSafetyChecks: AccessSafetyCheck[];
export const booking: Booking;
export const bookingChecklist: ChecklistItem[];
export const bookingCalendar: CalendarItem[];
export const activeTrip: ActiveTrip;
export const tripTimeline: TripTimelineItem[];
export const tripEvents: TripEvent[];
export const inspectionSession: InspectionSession;
export const inspectionChecklist: ChecklistItem[];
export const damageFindings: DamageFinding[];
export const damageReviewQueue: TripTimelineItem[];
export function getActiveDriver(): DemoUser | undefined;

export function hasSupabaseConfig(config: { url?: string; anonKey?: string } | null | undefined): boolean;
export function createFlashAvtlClient(config: {
  url?: string;
  anonKey?: string;
  detectSessionInUrl?: boolean;
}): any;
export function toAppError(error: unknown): any;

export function hasApiConfig(config: { baseUrl?: string } | null | undefined): boolean;
export function createFlashAvtlApiClient(config: { baseUrl?: string; storageKey?: string }): any;

export function getAuthSession(client: any): Promise<any>;
export function signInWithPassword(client: any, params: { email: string; password: string }): Promise<any>;
export function signUpUser(
  client: any,
  params: { email: string; password: string; fullName: string; phone?: string; organizationId?: string; branchId?: string }
): Promise<any>;
export function signOut(client: any): Promise<any>;
export function onAuthStateChange(client: any, callback: (event: string, session: any) => void): () => void;
export function getCurrentUserContext(client: any): Promise<any>;
export function listOrganizations(client: any): Promise<any>;
export function listAssetTypes(client: any): Promise<any>;
export function createUserInvitation(client: any, invitation: Record<string, unknown>): Promise<any>;
export function createFleetAsset(client: any, asset: Record<string, unknown>): Promise<any>;
export function listFleetAssets(client: any): Promise<any>;
export function createBooking(client: any, booking: Record<string, unknown>): Promise<any>;
export function createTrip(client: any, trip: Record<string, unknown>): Promise<any>;
export function createAccessGrant(client: any, grant: Record<string, unknown>): Promise<any>;
export function createDamageReport(client: any, report: Record<string, unknown>): Promise<any>;
export function uploadFlashAvtlFile(client: any, file: File | Blob, options: Record<string, unknown>): Promise<any>;
