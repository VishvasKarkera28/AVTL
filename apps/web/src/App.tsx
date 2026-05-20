import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  Activity,
  Bell,
  Bluetooth,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Database,
  Download,
  FileCheck2,
  FileVideo,
  Fingerprint,
  Fuel,
  Gauge,
  HardDrive,
  IdCard,
  KeyRound,
  LogIn,
  LogOut,
  LockKeyhole,
  Map,
  MapPinned,
  MapPin,
  Navigation,
  RadioTower,
  QrCode,
  Route,
  Search,
  Save,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Truck,
  UnlockKeyhole,
  UploadCloud,
  UserCheck,
  UserPlus
} from "lucide-react";
import {
  accessGrant,
  accessSafetyChecks,
  activeTrip,
  auditEvents,
  booking,
  bookingCalendar,
  bookingChecklist,
  commandCenterAlerts,
  commandQueue,
  damageFindings,
  damageReviewQueue,
  dashboardMetrics,
  demoUsers,
  fleetCommandMetrics,
  fleetVehicles,
  foundationChecks,
  geofencePolicies,
  identityChecks,
  inspectionChecklist,
  inspectionSession,
  moduleStatuses,
  organization,
  smartAccessMethods,
  storageConfig,
  tripEvents,
  tripTimeline,
  vehicleTwin
} from "@avtl/domain";
import type { DemoUser } from "@avtl/domain";
import {
  createFlashAvtlApiClient,
  getAuthSession,
  hasApiConfig,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  signUpUser,
  createAccessGrant,
  createBooking,
  createDamageReport,
  createFleetAsset,
  createTrip,
  createUserInvitation,
  getCurrentUserContext,
  listAssetTypes,
  listFleetAssets,
  uploadFlashAvtlFile
} from "@avtl/domain/api";

type Section =
  | "foundation"
  | "identity"
  | "digital-twin"
  | "command-center"
  | "smart-access"
  | "booking"
  | "trip-tracking"
  | "inspection-damage";

const navigation: Array<{
  id: Section;
  label: string;
  icon: typeof Building2;
}> = [
  { id: "foundation", label: "Foundation", icon: Building2 },
  { id: "identity", label: "Identity", icon: ShieldCheck },
  { id: "digital-twin", label: "Vehicle Twin", icon: Truck },
  { id: "command-center", label: "Command Center", icon: MapPinned },
  { id: "smart-access", label: "Smart Access", icon: UnlockKeyhole },
  { id: "booking", label: "Booking", icon: CalendarDays },
  { id: "trip-tracking", label: "Trip Tracking", icon: Route },
  { id: "inspection-damage", label: "Inspection", icon: Camera }
];

const permissionRows = [
  ["Owner", "Tenant settings", "Billing", "All vehicles", "Audit"],
  ["Manager", "Command center", "Identity review", "Documents", "Reports"],
  ["Driver", "Assigned vehicle", "Trip start", "Offline unlock", "Inspections"],
  ["Maintenance", "Vehicle health", "Work orders", "Service files", "Diagnostics"]
];

const sectionIds: Section[] = [
  "foundation",
  "identity",
  "digital-twin",
  "command-center",
  "smart-access",
  "booking",
  "trip-tracking",
  "inspection-damage"
];

function getInitialSection(): Section {
  if (typeof window === "undefined") {
    return "foundation";
  }

  const hash = window.location.hash.replace("#", "");
  return sectionIds.includes(hash as Section) ? (hash as Section) : "foundation";
}

type AppMessage = {
  tone: "success" | "error" | "info";
  text: string;
};

const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8787"
};

function App() {
  const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
  const [selectedUserId, setSelectedUserId] = useState(demoUsers[0].id);
  const [session, setSession] = useState<any>(null);
  const [userContext, setUserContext] = useState<any>(null);
  const [liveAssets, setLiveAssets] = useState<any[]>([]);
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [appMessage, setAppMessage] = useState<AppMessage>({
    tone: "info",
    text: hasApiConfig(apiConfig)
      ? "Welcome back. Sign in to open your secure fleet workspace."
      : "Welcome to FlashAVTL. Connect the API to unlock live fleet operations."
  });

  const apiClient = useMemo(() => createFlashAvtlApiClient(apiConfig), []);
  const isApiReady = Boolean(apiClient);

  const selectedUser = useMemo<DemoUser>(
    () => demoUsers.find((user) => user.id === selectedUserId) ?? demoUsers[0],
    [selectedUserId]
  );

  const selectedIdentityChecks = identityChecks.filter(
    (check) => check.userId === selectedUser.id
  );

  useEffect(() => {
    const handleHashChange = () => setActiveSection(getInitialSection());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!apiClient) {
      return undefined;
    }

    let isMounted = true;

    async function loadAuthState() {
      const { data } = await getAuthSession(apiClient);
      if (!isMounted) {
        return;
      }
      setSession(data);
      if (data) {
        await loadLiveContext();
      }
    }

    async function loadLiveContext() {
      const [contextResult, assetTypesResult, fleetAssetsResult] = await Promise.all([
        getCurrentUserContext(apiClient),
        listAssetTypes(apiClient),
        listFleetAssets(apiClient)
      ]);
      if (!isMounted) {
        return;
      }
      if ((contextResult as any).data) {
        setUserContext((contextResult as any).data);
      }
      if ((assetTypesResult as any).data?.length) {
        setAssetTypes((assetTypesResult as any).data);
      }
      if ((fleetAssetsResult as any).data?.length) {
        setLiveAssets((fleetAssetsResult as any).data);
      }
    }

    loadAuthState();
    const unsubscribe = onAuthStateChange(apiClient, async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        await loadLiveContext();
      } else {
        setUserContext(null);
        setLiveAssets([]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [apiClient]);

  useEffect(() => {
    if (!apiClient || !session) {
      return undefined;
    }

    const refreshLiveAssets = async () => {
      const result = await listFleetAssets(apiClient);
      if ((result as any).data) {
        setLiveAssets((result as any).data);
      }
    };

    const interval = window.setInterval(refreshLiveAssets, 5000);
    return () => window.clearInterval(interval);
  }, [apiClient, session]);

  const navigateToSection = (section: Section) => {
    setActiveSection(section);
    window.history.replaceState(null, "", `#${section}`);
  };

  const reloadLiveData = async () => {
    if (!apiClient) {
      return;
    }
    const [contextResult, assetTypesResult, fleetAssetsResult] = await Promise.all([
      getCurrentUserContext(apiClient),
      listAssetTypes(apiClient),
      listFleetAssets(apiClient)
    ]);
    setUserContext((contextResult as any).data ?? null);
    setAssetTypes((assetTypesResult as any).data ?? []);
    setLiveAssets((fleetAssetsResult as any).data ?? []);
  };

  if (isApiReady && !session) {
    return (
      <AuthScreen
        apiClient={apiClient}
        appMessage={appMessage}
        setAppMessage={setAppMessage}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-block">
          <BrandLockup />
        </div>

        <nav className="nav-stack">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-button ${activeSection === item.id ? "active" : ""}`}
                onClick={() => navigateToSection(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="tenant-summary">
          <Building2 size={18} aria-hidden="true" />
          <div>
            <strong>{organization.name}</strong>
            <span>{organization.primaryBranch.name}</span>
          </div>
        </div>

        <div className="storage-summary">
          <Database size={18} aria-hidden="true" />
          <div>
            <span>Private bucket</span>
            <strong>{storageConfig.bucket}</strong>
          </div>
        </div>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div className="topbar-title">
            <BrandMark />
            <div>
              <p className="eyebrow">Customer workspace: BP</p>
              <h2>{navigation.find((item) => item.id === activeSection)?.label}</h2>
            </div>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} aria-hidden="true" />
              <input value="MH-01-BP-4472" readOnly aria-label="Search" />
            </label>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} aria-hidden="true" />
            </button>
            <button className="icon-button" aria-label="Settings">
              <Settings size={19} aria-hidden="true" />
            </button>
          </div>
        </header>

        <LiveSecurityBar
          isApiReady={isApiReady}
          session={session}
          userContext={userContext}
          liveAssets={liveAssets}
          appMessage={appMessage}
          onSignOut={async () => {
            if (apiClient) {
              await signOut(apiClient);
              setSession(null);
              setUserContext(null);
            }
          }}
        />

        <div className="mobile-tabs" aria-label="Module switcher">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeSection === item.id ? "active" : ""}
                onClick={() => navigateToSection(item.id)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {activeSection === "foundation" && (
          <FoundationView
            apiClient={apiClient}
            isApiReady={isApiReady}
            userContext={userContext}
            assetTypes={assetTypes}
            setAppMessage={setAppMessage}
            reloadLiveData={reloadLiveData}
          />
        )}
        {activeSection === "identity" && (
          <IdentityView
            selectedUser={selectedUser}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
            selectedIdentityChecks={selectedIdentityChecks}
          />
        )}
        {activeSection === "digital-twin" && <VehicleTwinView />}
        {activeSection === "command-center" && (
          <FleetCommandCenterView
            isApiReady={isApiReady}
            liveAssets={liveAssets}
          />
        )}
        {activeSection === "smart-access" && (
          <SmartAccessView
            apiClient={apiClient}
            isApiReady={isApiReady}
            setAppMessage={setAppMessage}
          />
        )}
        {activeSection === "booking" && (
          <BookingView
            apiClient={apiClient}
            isApiReady={isApiReady}
            setAppMessage={setAppMessage}
          />
        )}
        {activeSection === "trip-tracking" && (
          <TripTrackingView
            apiClient={apiClient}
            isApiReady={isApiReady}
            setAppMessage={setAppMessage}
          />
        )}
        {activeSection === "inspection-damage" && (
          <InspectionDamageView
            apiClient={apiClient}
            isApiReady={isApiReady}
            setAppMessage={setAppMessage}
          />
        )}
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <img
      className="brand-mark-image"
      src="/flashavtl-logo.png"
      alt=""
      aria-hidden="true"
    />
  );
}

function BrandLockup() {
  return (
    <div className="brand-lockup" aria-label="FlashAVTL">
      <img
        className="brand-logo-image"
        src="/flashavtl-logo.png"
        alt="FlashAVTL fleet security logo"
      />
      <div>
        <strong>FlashAVTL</strong>
        <span>Track. Lock. Protect.</span>
      </div>
    </div>
  );
}

function AuthScreen({
  apiClient,
  appMessage,
  setAppMessage
}: {
  apiClient: any;
  appMessage: AppMessage;
  setAppMessage: (message: AppMessage) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = mode === "signin"
      ? await signInWithPassword(apiClient, form)
      : await signUpUser(apiClient, form);
    setIsSubmitting(false);

    if ((result as any).error) {
      setAppMessage({ tone: "error", text: (result as any).error.message });
      return;
    }

    setAppMessage({
      tone: "success",
      text: mode === "signin" ? "Welcome back. Loading your fleet workspace." : "Account created. Your secure fleet workspace is ready."
    });
  };

  return (
    <main className="auth-screen">
      <section className="auth-layout">
        <div className="auth-intro">
          <BrandLockup />
          <div className="auth-copy">
            <p className="eyebrow">Secure fleet access</p>
            <h1>Welcome to FlashAVTL</h1>
            <p>Track, lock, and protect high-value fleet assets from one controlled operations workspace.</p>
          </div>
          <div className="workspace-chip">
            <span>Customer workspace</span>
            <strong>BP</strong>
          </div>
        </div>

        <section className="auth-panel" aria-label="Account access">
          <div className="auth-panel-heading">
            <p className="eyebrow">{mode === "signin" ? "Account access" : "Create user"}</p>
            <h2>{mode === "signin" ? "Sign in" : "Create account"}</h2>
          </div>
          <p className={`message ${appMessage.tone}`}>{appMessage.text}</p>
          <div className="segmented-control">
            <button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>
              <LogIn size={16} aria-hidden="true" />
              Sign in
            </button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
              <UserPlus size={16} aria-hidden="true" />
              Sign up
            </button>
          </div>
          <form className="form-grid auth-form" onSubmit={submitAuth}>
            {mode === "signup" && (
              <>
                <label>
                  Full name
                  <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
                </label>
                <label>
                  Phone
                  <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </label>
              </>
            )}
            <label>
              Email
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={12}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>
            <button className="submit-button" type="submit" disabled={isSubmitting}>
              <ShieldCheck size={17} aria-hidden="true" />
              {isSubmitting ? "Working..." : mode === "signin" ? "Sign in securely" : "Create account"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

function LiveSecurityBar({
  isApiReady,
  session,
  userContext,
  liveAssets,
  appMessage,
  onSignOut
}: {
  isApiReady: boolean;
  session: any;
  userContext: any;
  liveAssets: any[];
  appMessage: AppMessage;
  onSignOut: () => Promise<void>;
}) {
  return (
    <section className="live-security-bar">
      <div>
        <strong>{isApiReady ? "FlashAVTL API connected" : "Demo mode"}</strong>
        <span>{appMessage.text}</span>
      </div>
      <div className="security-kpis">
        <span>Session: {session ? "active" : "ready"}</span>
        <span>Roles: {userContext?.roles?.length ?? 0}</span>
        <span>Live assets: {liveAssets.length}</span>
        {session && (
          <button onClick={onSignOut}>
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        )}
      </div>
    </section>
  );
}

function FoundationView({
  apiClient,
  isApiReady,
  userContext,
  assetTypes,
  setAppMessage,
  reloadLiveData
}: {
  apiClient: any;
  isApiReady: boolean;
  userContext: any;
  assetTypes: any[];
  setAppMessage: (message: AppMessage) => void;
  reloadLiveData: () => Promise<void>;
}) {
  return (
    <section className="page-grid foundation-layout">
      <div className="metric-grid">
        {dashboardMetrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>

      <article className="panel tenant-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Tenant</p>
            <h3>{organization.legalName}</h3>
          </div>
          <span className="status-pill success">{organization.status}</span>
        </div>
        <div className="tenant-grid">
          <InfoItem icon={Building2} label="Tenant code" value={organization.tenantCode} />
          <InfoItem icon={MapPin} label="Branch" value={organization.primaryBranch.address} />
          <InfoItem icon={Database} label="Database" value="FlashAVTL" />
          <InfoItem icon={LockKeyhole} label="Storage" value={storageConfig.bucket} />
        </div>
      </article>

      <article className="panel readiness-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Modules</p>
            <h3>Production readiness</h3>
          </div>
          <CheckCircle2 size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="module-list">
          {moduleStatuses.map((module) => (
            <div className="module-row" key={module.id}>
              <div>
                <strong>{module.label}</strong>
                <p>{module.description}</p>
              </div>
              <div className="progress-wrap" aria-label={`${module.label} progress`}>
                <span>{module.progress}%</span>
                <div className="progress-track">
                  <div style={{ width: `${module.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel check-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Controls</p>
            <h3>Foundation checks</h3>
          </div>
          <ShieldCheck size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="check-list">
          {foundationChecks.map((check) => (
            <div className="check-row" key={check.label}>
              <span className="check-dot" />
              <div>
                <strong>{check.label}</strong>
                <p>{check.detail}</p>
              </div>
              <span className="status-pill">{check.status}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel storage-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Storage</p>
            <h3>Bucket prefixes</h3>
          </div>
          <UploadCloud size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="prefix-grid">
          {storageConfig.prefixes.map((prefix) => (
            <span key={prefix}>{prefix}</span>
          ))}
        </div>
        <div className="object-list">
          {storageConfig.objectExamples.map((objectPath) => (
            <code key={objectPath}>{objectPath}</code>
          ))}
        </div>
      </article>

      <article className="panel rbac-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">RBAC</p>
            <h3>Role access map</h3>
          </div>
          <KeyRound size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="role-table">
          {permissionRows.map((row) => (
            <div className="role-row" key={row[0]}>
              <strong>{row[0]}</strong>
              {row.slice(1).map((permission) => (
                <span key={permission}>{permission}</span>
              ))}
            </div>
          ))}
        </div>
      </article>

      <article className="panel audit-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Audit</p>
            <h3>Recent foundation events</h3>
          </div>
          <Activity size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <Timeline events={auditEvents.map((event) => ({
          key: `${event.time}-${event.action}`,
          time: event.time,
          title: event.action,
          detail: `${event.actor} - ${event.scope}`
        }))} />
      </article>

      <UserInvitationForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        userContext={userContext}
        setAppMessage={setAppMessage}
      />

      <FleetAssetForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        userContext={userContext}
        assetTypes={assetTypes}
        setAppMessage={setAppMessage}
        reloadLiveData={reloadLiveData}
      />
    </section>
  );
}

function UserInvitationForm({
  apiClient,
  isApiReady,
  userContext,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  userContext: any;
  setAppMessage: (message: AppMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: getDefaultOrganizationId(userContext),
    fullName: "",
    email: "",
    phone: "",
    role: "driver",
    branchId: "",
    password: ""
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      organizationId: current.organizationId || getDefaultOrganizationId(userContext)
    }));
  }, [userContext]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isApiReady || !apiClient) {
      setAppMessage({ tone: "info", text: "API unavailable: user invitation form is ready but cannot save yet." });
      return;
    }
    const result = await createUserInvitation(apiClient, form);
    if ((result as any).error) {
      setAppMessage({ tone: "error", text: (result as any).error.message });
      return;
    }
    setAppMessage({
      tone: "success",
      text: (result as any).data?.temporaryPassword
        ? `User created with application RBAC. Temporary password: ${(result as any).data.temporaryPassword}`
        : "User created with application RBAC."
    });
  };

  return (
    <article className="panel form-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Secure form</p>
          <h3>Create user invitation</h3>
        </div>
        <UserPlus size={22} className="neutral-icon" aria-hidden="true" />
      </div>
      <form className="form-grid" onSubmit={submit}>
        <label>
          Organization ID
          <input value={form.organizationId} onChange={(event) => setForm({ ...form, organizationId: event.target.value })} required />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="driver">Driver</option>
            <option value="customer">Customer</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </label>
        <label>
          Full name
          <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <label>
          Branch ID
          <input value={form.branchId} onChange={(event) => setForm({ ...form, branchId: event.target.value })} />
        </label>
        <label>
          Temporary password
          <input
            type="password"
            minLength={12}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Leave empty to generate"
          />
        </label>
        <button className="submit-button" type="submit">
          <Save size={17} aria-hidden="true" />
          Save invitation
        </button>
      </form>
    </article>
  );
}

function FleetAssetForm({
  apiClient,
  isApiReady,
  userContext,
  assetTypes,
  setAppMessage,
  reloadLiveData
}: {
  apiClient: any;
  isApiReady: boolean;
  userContext: any;
  assetTypes: any[];
  setAppMessage: (message: AppMessage) => void;
  reloadLiveData: () => Promise<void>;
}) {
  const defaultTypes = [
    { id: "truck", label: "Truck" },
    { id: "bus", label: "Bus" },
    { id: "ship", label: "Ship" },
    { id: "car", label: "Car" },
    { id: "bike", label: "Bike" },
    { id: "equipment", label: "Equipment" }
  ];
  const types = assetTypes.length ? assetTypes : defaultTypes;
  const [form, setForm] = useState({
    organizationId: getDefaultOrganizationId(userContext),
    branchId: "",
    assetType: "truck",
    registrationNumber: "",
    vin: "",
    make: "",
    model: "",
    year: "2026",
    status: "available",
    odometerKm: "0",
    fuelPercent: "",
    batteryPercent: ""
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      organizationId: current.organizationId || getDefaultOrganizationId(userContext)
    }));
  }, [userContext]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isApiReady || !apiClient) {
      setAppMessage({ tone: "info", text: "API unavailable: fleet asset form is ready but cannot save yet." });
      return;
    }
    const result = await createFleetAsset(apiClient, form);
    if ((result as any).error) {
      setAppMessage({ tone: "error", text: (result as any).error.message });
      return;
    }
    setAppMessage({ tone: "success", text: "Fleet asset created through the FlashAVTL API." });
    await reloadLiveData();
  };

  return (
    <article className="panel form-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Secure form</p>
          <h3>Create fleet asset</h3>
        </div>
        <Ship size={22} className="neutral-icon" aria-hidden="true" />
      </div>
      <form className="form-grid" onSubmit={submit}>
        <label>
          Organization ID
          <input value={form.organizationId} onChange={(event) => setForm({ ...form, organizationId: event.target.value })} required />
        </label>
        <label>
          Asset type
          <select value={form.assetType} onChange={(event) => setForm({ ...form, assetType: event.target.value })}>
            {types.map((type) => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </label>
        <label>
          Registration / asset number
          <input value={form.registrationNumber} onChange={(event) => setForm({ ...form, registrationNumber: event.target.value })} required />
        </label>
        <label>
          VIN / hull / serial
          <input value={form.vin} onChange={(event) => setForm({ ...form, vin: event.target.value })} />
        </label>
        <label>
          Make
          <input value={form.make} onChange={(event) => setForm({ ...form, make: event.target.value })} />
        </label>
        <label>
          Model
          <input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} />
        </label>
        <label>
          Year
          <input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
        </label>
        <label>
          Status
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="in_use">In use</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </label>
        <button className="submit-button" type="submit">
          <Save size={17} aria-hidden="true" />
          Create asset
        </button>
      </form>
    </article>
  );
}

function IdentityView({
  selectedUser,
  selectedUserId,
  onSelectUser,
  selectedIdentityChecks
}: {
  selectedUser: DemoUser;
  selectedUserId: string;
  onSelectUser: (id: string) => void;
  selectedIdentityChecks: typeof identityChecks;
}) {
  return (
    <section className="page-grid identity-layout">
      <article className="panel session-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Session</p>
            <h3>Authenticated manager</h3>
          </div>
          <span className="status-pill success">active</span>
        </div>
        <div className="session-card">
          <div className="avatar">{selectedUser.name.split(" ").map((part) => part[0]).join("")}</div>
          <div>
            <strong>{selectedUser.name}</strong>
            <span>{selectedUser.role}</span>
            <p>{selectedUser.email}</p>
          </div>
        </div>
        <div className="action-row">
          <button>
            <Fingerprint size={17} aria-hidden="true" />
            Verify
          </button>
          <button>
            <Download size={17} aria-hidden="true" />
            Evidence
          </button>
        </div>
      </article>

      <article className="panel user-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Directory</p>
            <h3>BP users</h3>
          </div>
          <UserCheck size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="user-list">
          {demoUsers.map((user) => (
            <button
              className={`user-row ${selectedUserId === user.id ? "selected" : ""}`}
              key={user.id}
              onClick={() => onSelectUser(user.id)}
            >
              <span className="avatar small">{user.name.split(" ").map((part) => part[0]).join("")}</span>
              <span>
                <strong>{user.name}</strong>
                <small>{user.role} - {user.identityStatus}</small>
              </span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      </article>

      <article className="panel selected-user-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Identity</p>
            <h3>{selectedUser.name}</h3>
          </div>
          <span className="status-pill success">{selectedUser.identityStatus}</span>
        </div>
        <div className="identity-grid">
          <InfoItem icon={IdCard} label="Role" value={selectedUser.role} />
          <InfoItem icon={MapPin} label="Branch" value={selectedUser.branch} />
          <InfoItem icon={ShieldCheck} label="MFA" value={selectedUser.mfa ? "Enabled" : "Pending"} />
          <InfoItem icon={Activity} label="Last seen" value={selectedUser.lastSeen} />
        </div>
        <div className="access-chip-row">
          {selectedUser.access.map((access) => (
            <span key={access}>{access}</span>
          ))}
        </div>
      </article>

      <article className="panel evidence-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Evidence</p>
            <h3>Verification checks</h3>
          </div>
          <FileCheck2 size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="evidence-list">
          {(selectedIdentityChecks.length ? selectedIdentityChecks : identityChecks).map((check) => (
            <div className="evidence-row" key={check.id}>
              <div>
                <strong>{check.label}</strong>
                <code>{check.evidencePath}</code>
              </div>
              <span>{check.confidence}%</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel policy-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Policy</p>
            <h3>Authentication controls</h3>
          </div>
          <LockKeyhole size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="policy-grid">
          <InfoItem icon={ShieldCheck} label="Admin MFA" value="Required for command center" />
          <InfoItem icon={Fingerprint} label="Driver liveness" value="Required before trip unlock" />
          <InfoItem icon={KeyRound} label="Access tokens" value="User, vehicle and time bound" />
          <InfoItem icon={Database} label="Evidence storage" value="Private identity-evidence prefix" />
        </div>
      </article>
    </section>
  );
}

function VehicleTwinView() {
  return (
    <section className="page-grid twin-layout">
      <article className="panel vehicle-hero">
        <div className="vehicle-copy">
          <p className="eyebrow">Digital twin</p>
          <h3>{vehicleTwin.displayName}</h3>
          <p>{vehicleTwin.make} {vehicleTwin.model} - {vehicleTwin.capacity} {vehicleTwin.productCarried}</p>
          <div className="vehicle-badges">
            <span>{vehicleTwin.registrationNumber}</span>
            <span>{vehicleTwin.lockState}</span>
            <span>{vehicleTwin.status}</span>
          </div>
          <div className="action-row">
            <button>
              <LockKeyhole size={17} aria-hidden="true" />
              Lock
            </button>
            <button>
              <RadioTower size={17} aria-hidden="true" />
              Diagnose
            </button>
            <button>
              <FileCheck2 size={17} aria-hidden="true" />
              Docs
            </button>
          </div>
        </div>
        <img src="/bp-tanker.svg" alt="BP tanker truck" />
      </article>

      <article className="panel telemetry-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Live state</p>
            <h3>Telemetry</h3>
          </div>
          <RadioTower size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="telemetry-grid">
          <InfoItem icon={Gauge} label="Speed" value={`${vehicleTwin.currentState.speedKph} kph`} />
          <InfoItem icon={Fuel} label="Fuel" value={`${vehicleTwin.currentState.fuelPercent}%`} />
          <InfoItem icon={LockKeyhole} label="Ignition" value={String(vehicleTwin.currentState.ignition)} />
          <InfoItem icon={Activity} label="Last seen" value={String(vehicleTwin.currentState.lastSeen)} />
        </div>
      </article>

      <article className="panel map-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Route</p>
            <h3>{vehicleTwin.route}</h3>
          </div>
          <MapPin size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <img src="/bp-terminal-map.svg" alt="Mumbai fuel terminal to Pune depot route map" />
      </article>

      <article className="panel device-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Hardware</p>
            <h3>Vehicle box</h3>
          </div>
          <HardDrive size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="device-grid">
          {Object.entries(vehicleTwin.device).map(([key, value]) => (
            <div key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="panel health-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Health</p>
            <h3>Lifecycle score</h3>
          </div>
          <ClipboardCheck size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="score-layout">
          <div className="score-ring">
            <strong>{vehicleTwin.healthScore}</strong>
            <span>health</span>
          </div>
          <div className="score-ring risk">
            <strong>{vehicleTwin.riskScore}</strong>
            <span>risk</span>
          </div>
        </div>
        <div className="lifecycle-list">
          {vehicleTwin.lifecycle.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="panel documents-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Documents</p>
            <h3>Vehicle records</h3>
          </div>
          <FileCheck2 size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="document-table">
          {vehicleTwin.documents.map((document) => (
            <div className="document-row" key={document.type}>
              <strong>{document.type}</strong>
              <span>{document.number}</span>
              <span>{document.expires}</span>
              <span className={document.status === "Valid" ? "status-text success" : "status-text warn"}>
                {document.status}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel service-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Service</p>
            <h3>Maintenance history</h3>
          </div>
          <Activity size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <Timeline events={vehicleTwin.serviceHistory.map((event) => ({
          key: `${event.date}-${event.title}`,
          time: event.date ?? "",
          title: event.title ?? "",
          detail: `${event.result} - ${event.notes}`
        }))} />
      </article>

      <article className="panel access-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Access</p>
            <h3>Lock history</h3>
          </div>
          <LockKeyhole size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <Timeline events={vehicleTwin.accessHistory.map((event) => ({
          key: `${event.time}-${event.method}`,
          time: event.time ?? "",
          title: event.method ?? "",
          detail: `${event.actor} - ${event.result}`
        }))} />
      </article>
    </section>
  );
}

const routeMapBounds = {
  minLatitude: 18.45,
  maxLatitude: 19.35,
  minLongitude: 72.75,
  maxLongitude: 74.05
};

function getTrackedVehicles(liveAssets: any[]) {
  if (!liveAssets.length) {
    return fleetVehicles;
  }

  return liveAssets.map((asset, index) => normalizeTrackedVehicle(asset, index));
}

function buildLiveCommandMetrics(trackedVehicles: any[]) {
  const movingCount = trackedVehicles.filter((vehicle) => Number(vehicle.speedKph) > 0).length;
  const lockedCount = trackedVehicles.filter((vehicle) => String(vehicle.lockState).toLowerCase() === "locked").length;
  const offlineCount = trackedVehicles.filter((vehicle) => String(vehicle.network).toLowerCase().includes("offline")).length;

  return [
    {
      label: "Tracked assets",
      value: String(trackedVehicles.length),
      detail: "Loaded from Supabase through the FlashAVTL API.",
      tone: "green"
    },
    {
      label: "Moving now",
      value: String(movingCount),
      detail: "Vehicles with live speed above 0 kph.",
      tone: "blue"
    },
    {
      label: "Locked",
      value: String(lockedCount),
      detail: "Latest lock state reported by tracking devices.",
      tone: "amber"
    },
    {
      label: "Offline",
      value: String(offlineCount),
      detail: "Network state from vehicle_latest_state.",
      tone: "dark"
    }
  ];
}

function normalizeTrackedVehicle(asset: any, index: number) {
  const fallback = fleetVehicles[index % fleetVehicles.length];
  const latestState = Array.isArray(asset.vehicle_latest_state)
    ? asset.vehicle_latest_state[0]
    : asset.vehicle_latest_state;
  const healthFlags = latestState?.health_flags ?? {};
  const fallbackLatitude = toFiniteNumber(fallback.coordinates.latitude, 19.076);
  const fallbackLongitude = toFiniteNumber(fallback.coordinates.longitude, 72.8777);
  const latitude = toFiniteNumber(
    latestState?.latitude ?? asset.current_latitude,
    fallbackLatitude + index * 0.03
  );
  const longitude = toFiniteNumber(
    latestState?.longitude ?? asset.current_longitude,
    fallbackLongitude + index * 0.05
  );

  return {
    id: asset.id ?? fallback.id,
    registrationNumber: asset.registration_number ?? fallback.registrationNumber,
    name: [asset.make, asset.model].filter(Boolean).join(" ") || fallback.name,
    status: asset.status ?? fallback.status,
    driver: asset.driver_name ?? fallback.driver ?? "Unassigned",
    route: asset.route_name ?? fallback.route ?? "Active route",
    speedKph: Math.round(toFiniteNumber(latestState?.speed_kph, toFiniteNumber(fallback.speedKph, 0))),
    lockState: latestState?.lock_state ?? asset.lock_state ?? fallback.lockState,
    fuelPercent: Math.round(toFiniteNumber(latestState?.fuel_percent ?? asset.fuel_percent, toFiniteNumber(fallback.fuelPercent, 0))),
    healthScore: Math.round(toFiniteNumber(healthFlags.healthScore, fallback.healthScore)),
    riskScore: Math.round(toFiniteNumber(healthFlags.riskScore, fallback.riskScore)),
    network: latestState?.network_state ?? fallback.network,
    lastSeen: formatTrackingTime(latestState?.recorded_at ?? asset.last_seen_at ?? fallback.lastSeen),
    coordinates: { latitude, longitude }
  };
}

function projectVehicleToMap(vehicle: any, index: number) {
  const latitude = toFiniteNumber(vehicle.coordinates?.latitude, routeMapBounds.minLatitude);
  const longitude = toFiniteNumber(vehicle.coordinates?.longitude, routeMapBounds.minLongitude);
  const rawX = ((longitude - routeMapBounds.minLongitude) / (routeMapBounds.maxLongitude - routeMapBounds.minLongitude)) * 100;
  const rawY = ((routeMapBounds.maxLatitude - latitude) / (routeMapBounds.maxLatitude - routeMapBounds.minLatitude)) * 100;

  return {
    x: clamp(rawX + index * 1.5, 10, 88),
    y: clamp(rawY + index * 1.25, 14, 82)
  };
}

function toFiniteNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatTrackingTime(value: unknown) {
  if (!value || typeof value !== "string") {
    return "Waiting for telemetry";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function FleetCommandCenterView({
  isApiReady,
  liveAssets
}: {
  isApiReady: boolean;
  liveAssets: any[];
}) {
  const trackedVehicles = getTrackedVehicles(liveAssets);
  const primaryVehicle = trackedVehicles[0];
  const commandMetrics = liveAssets.length ? buildLiveCommandMetrics(trackedVehicles) : fleetCommandMetrics;
  const feedLabel = isApiReady && liveAssets.length
    ? "Live database tracking feed"
    : "Tracking feed waiting for device data";

  return (
    <section className="page-grid operations-layout">
      <div className="metric-grid">
        {commandMetrics.map((metric) => (
          <article className={`metric-card tone-${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>

      <article className="panel command-map-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Live map</p>
            <h3>Fleet command center</h3>
            <p className="panel-subtext">{feedLabel}</p>
          </div>
          <MapPinned size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="command-map">
          <img src="/bp-terminal-map.svg" alt="BP route command map" />
          <div className="map-route-runner" aria-hidden="true" />
          {trackedVehicles.map((vehicle, index) => {
            const position = projectVehicleToMap(vehicle, index);
            const markerStyle = {
              "--marker-x": `${position.x}%`,
              "--marker-y": `${position.y}%`,
              "--runner-delay": `${index * 0.8}s`,
              "--runner-range": `${Math.max(10, Math.min(28, Number(vehicle.speedKph) || 12))}px`
            } as CSSProperties;

            return (
              <div className="map-vehicle-marker" style={markerStyle} key={vehicle.id}>
                <Truck size={18} aria-hidden="true" />
                <strong>{vehicle.registrationNumber}</strong>
                <span>{vehicle.status} - {vehicle.speedKph} kph</span>
              </div>
            );
          })}
          <div className="map-data-badge">
            <span>{trackedVehicles.length} tracked</span>
            <strong>5s refresh</strong>
          </div>
        </div>
      </article>

      <article className="panel live-vehicle-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Vehicle</p>
            <h3>{primaryVehicle.name}</h3>
          </div>
          <span className="status-pill success">{primaryVehicle.status}</span>
        </div>
        <div className="telemetry-grid">
          <InfoItem icon={Gauge} label="Speed" value={`${primaryVehicle.speedKph} kph`} />
          <InfoItem icon={Fuel} label="Fuel" value={`${primaryVehicle.fuelPercent}%`} />
          <InfoItem icon={LockKeyhole} label="Lock" value={primaryVehicle.lockState} />
          <InfoItem icon={RadioTower} label="Network" value={String(primaryVehicle.network)} />
          <InfoItem icon={ShieldAlert} label="Risk" value={`${primaryVehicle.riskScore}/100`} />
          <InfoItem icon={ClipboardCheck} label="Health" value={`${primaryVehicle.healthScore}/100`} />
        </div>
        <div className="fleet-report-grid" aria-label="Tracked vehicles report">
          {trackedVehicles.map((vehicle) => (
            <div className="fleet-report-row" key={vehicle.id}>
              <div>
                <strong>{vehicle.registrationNumber}</strong>
                <span>{vehicle.name}</span>
              </div>
              <span>{vehicle.driver}</span>
              <span>{vehicle.route}</span>
              <span className="status-pill success">{vehicle.status}</span>
              <span>{vehicle.lastSeen}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel alerts-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Alerts</p>
            <h3>Operations feed</h3>
          </div>
          <Bell size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <Timeline events={commandCenterAlerts.map((alert) => ({
          key: alert.id,
          time: alert.time,
          title: alert.title,
          detail: `${alert.severity} - ${alert.detail}`
        }))} />
      </article>

      <article className="panel command-queue-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Commands</p>
            <h3>Command queue</h3>
          </div>
          <RadioTower size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="compact-table">
          {commandQueue.map((command) => (
            <div className="compact-row" key={command.id}>
              <strong>{command.command}</strong>
              <span>{command.requestedBy}</span>
              <span>{command.safety}</span>
              <span className="status-pill">{command.status}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel geofence-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Geo intelligence</p>
            <h3>Active geofence policies</h3>
          </div>
          <Map size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="policy-stack">
          {geofencePolicies.map((policy) => (
            <div className="policy-row" key={policy.id}>
              <div>
                <strong>{policy.name}</strong>
                <p>{policy.type} - {policy.action}</p>
              </div>
              <span className="status-pill">{policy.status}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function SmartAccessView({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  return (
    <section className="page-grid operations-layout">
      <article className="panel access-grant-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Active grant</p>
            <h3>{accessGrant.userName}</h3>
          </div>
          <span className="status-pill success">{accessGrant.status}</span>
        </div>
        <div className="tenant-grid">
          <InfoItem icon={Truck} label="Vehicle" value={vehicleTwin.registrationNumber} />
          <InfoItem icon={Clock3} label="Valid from" value={accessGrant.validFrom} />
          <InfoItem icon={Clock3} label="Valid until" value={accessGrant.validUntil} />
          <InfoItem icon={UnlockKeyhole} label="Offline uses" value={`${accessGrant.offlineUsesRemaining}/${accessGrant.maxOfflineUses}`} />
        </div>
        <div className="access-chip-row">
          {accessGrant.allowedMethods.map((method) => (
            <span key={method}>{method}</span>
          ))}
        </div>
        <code>{accessGrant.tokenPath}</code>
      </article>

      <article className="panel access-methods-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Unlock methods</p>
            <h3>Smart access matrix</h3>
          </div>
          <KeyRound size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="method-grid">
          {smartAccessMethods.map((method) => (
            <div className="method-tile" key={method.id}>
              <div className="method-icon">{methodIcon(method.id)}</div>
              <strong>{method.name}</strong>
              <span>{method.availability}</span>
              <p>{method.security}</p>
              <div>
                <span className="status-pill">{method.status}</span>
                <small>{method.latency}</small>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel access-safety-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Safety</p>
            <h3>Unlock policy checks</h3>
          </div>
          <ShieldCheck size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="check-list">
          {accessSafetyChecks.map((check) => (
            <div className="check-row" key={check.label}>
              <span className="check-dot" />
              <div>
                <strong>{check.label}</strong>
                <p>{check.detail}</p>
              </div>
              <span className="status-pill">{check.status}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel access-events-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Events</p>
            <h3>Recent access history</h3>
          </div>
          <Activity size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <Timeline events={vehicleTwin.accessHistory.map((event) => ({
          key: `${event.time}-${event.method}`,
          time: event.time ?? "",
          title: event.method ?? "",
          detail: `${event.actor} - ${event.result}`
        }))} />
      </article>

      <AccessGrantForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        setAppMessage={setAppMessage}
      />
    </section>
  );
}

function BookingView({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  return (
    <section className="page-grid operations-layout">
      <article className="panel booking-main-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Booking</p>
            <h3>{booking.type}</h3>
          </div>
          <span className="status-pill success">{booking.status}</span>
        </div>
        <div className="booking-route">
          <div>
            <span>Pickup</span>
            <strong>{booking.pickup}</strong>
          </div>
          <Navigation size={24} aria-hidden="true" />
          <div>
            <span>Dropoff</span>
            <strong>{booking.dropoff}</strong>
          </div>
        </div>
        <div className="tenant-grid">
          <InfoItem icon={Truck} label="Vehicle" value={booking.vehicleName} />
          <InfoItem icon={UserCheck} label="Driver" value={booking.driverName} />
          <InfoItem icon={Fuel} label="Cargo" value={`${booking.quantity} ${booking.cargo}`} />
          <InfoItem icon={Route} label="Distance" value={`${booking.distanceKm} km`} />
        </div>
      </article>

      <article className="panel pricing-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Pricing</p>
            <h3>Commercial summary</h3>
          </div>
          <CircleDollarSign size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="price-list">
          {Object.entries(booking.priceSummary).map(([key, value]) => (
            <div key={key}>
              <span>{labelFromKey(key)}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="panel checklist-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Handoff</p>
            <h3>Dispatch checklist</h3>
          </div>
          <ClipboardList size={22} className="good-icon" aria-hidden="true" />
        </div>
        <div className="check-list">
          {bookingChecklist.map((item) => (
            <div className="check-row" key={item.label}>
              <span className={item.status.includes("complete") ? "check-dot" : "check-dot warn"} />
              <div>
                <strong>{item.label}</strong>
                <p>{item.owner}</p>
              </div>
              <span className="status-pill">{item.status}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel calendar-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Schedule</p>
            <h3>Booking timeline</h3>
          </div>
          <CalendarDays size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <Timeline events={bookingCalendar.map((item) => ({
          key: `${item.time}-${item.title}`,
          time: item.time,
          title: item.title,
          detail: item.status
        }))} />
      </article>

      <BookingCreateForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        setAppMessage={setAppMessage}
      />
    </section>
  );
}

function TripTrackingView({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  return (
    <section className="page-grid operations-layout">
      <article className="panel trip-hero-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Trip</p>
            <h3>{activeTrip.origin} to {activeTrip.destination}</h3>
          </div>
          <span className="status-pill">{activeTrip.status}</span>
        </div>
        <div className="trip-progress">
          <div>
            <strong>{activeTrip.completedKm} km</strong>
            <span>completed</span>
          </div>
          <div className="progress-track">
            <div style={{ width: `${(activeTrip.completedKm / activeTrip.distanceKm) * 100}%` }} />
          </div>
          <div>
            <strong>{activeTrip.distanceKm} km</strong>
            <span>planned</span>
          </div>
        </div>
        <div className="tenant-grid">
          <InfoItem icon={UserCheck} label="Driver" value={activeTrip.driver} />
          <InfoItem icon={Truck} label="Vehicle" value={activeTrip.vehicle} />
          <InfoItem icon={Clock3} label="ETA" value={activeTrip.eta} />
          <InfoItem icon={Map} label="Geofence" value={activeTrip.geofence} />
        </div>
      </article>

      <article className="panel trip-events-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Risk</p>
            <h3>Driver event monitor</h3>
          </div>
          <ShieldAlert size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="event-grid">
          {tripEvents.map((event) => (
            <div className="event-tile" key={event.id}>
              <strong>{event.count}</strong>
              <span>{event.label}</span>
              <small>{event.status}</small>
            </div>
          ))}
        </div>
      </article>

      <article className="panel trip-route-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Route</p>
            <h3>Dispatch corridor</h3>
          </div>
          <Route size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <img src="/bp-terminal-map.svg" alt="Active trip corridor map" />
      </article>

      <article className="panel trip-timeline-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Timeline</p>
            <h3>Trip milestones</h3>
          </div>
          <Clock3 size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <Timeline events={tripTimeline.map((item) => ({
          key: `${item.time}-${item.title}`,
          time: item.time,
          title: item.title,
          detail: item.detail
        }))} />
      </article>

      <TripCreateForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        setAppMessage={setAppMessage}
      />
    </section>
  );
}

function InspectionDamageView({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  const completion = Math.round((inspectionSession.completedViews / inspectionSession.requiredViews) * 100);

  return (
    <section className="page-grid operations-layout">
      <article className="panel inspection-session-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inspection</p>
            <h3>Pre-trip media session</h3>
          </div>
          <span className="status-pill">{inspectionSession.status}</span>
        </div>
        <div className="trip-progress">
          <div>
            <strong>{inspectionSession.completedViews}</strong>
            <span>captured</span>
          </div>
          <div className="progress-track">
            <div style={{ width: `${completion}%` }} />
          </div>
          <div>
            <strong>{inspectionSession.requiredViews}</strong>
            <span>required</span>
          </div>
        </div>
        <code>{inspectionSession.storageBasePath}</code>
      </article>

      <article className="panel media-checklist-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Media</p>
            <h3>Capture checklist</h3>
          </div>
          <FileVideo size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="check-list">
          {inspectionChecklist.map((item) => (
            <div className="check-row" key={item.label}>
              <span className={item.status === "captured" ? "check-dot" : "check-dot warn"} />
              <div>
                <strong>{item.label}</strong>
                <code>{item.path}</code>
              </div>
              <span className="status-pill">{item.status}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel damage-findings-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">AI damage</p>
            <h3>Detected findings</h3>
          </div>
          <Camera size={22} className="neutral-icon" aria-hidden="true" />
        </div>
        <div className="damage-grid">
          {damageFindings.map((finding) => (
            <div className="damage-tile" key={finding.id}>
              <div>
                <strong>{finding.panel}</strong>
                <span>{finding.type}</span>
              </div>
              <span className={finding.severity === "none" ? "status-pill success" : "status-pill warn-pill"}>
                {finding.severity}
              </span>
              <p>{finding.confidence}% confidence - {finding.status}</p>
              <code>{finding.afterPath}</code>
            </div>
          ))}
        </div>
      </article>

      <article className="panel damage-review-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Review</p>
            <h3>Damage workflow</h3>
          </div>
          <ClipboardCheck size={22} className="good-icon" aria-hidden="true" />
        </div>
        <Timeline events={damageReviewQueue.map((item) => ({
          key: `${item.time}-${item.title}`,
          time: item.time,
          title: item.title,
          detail: item.detail
        }))} />
      </article>

      <DamageReportForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        setAppMessage={setAppMessage}
      />

      <StorageUploadForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        setAppMessage={setAppMessage}
      />
    </section>
  );
}

function AccessGrantForm({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    vehicleId: "",
    userId: "",
    bookingId: "",
    grantType: "booking",
    validFrom: "",
    validUntil: "",
    allowedMethods: "app,ble,optical"
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isApiReady || !apiClient) {
      setAppMessage({ tone: "info", text: "API unavailable: access grant form is ready but cannot save yet." });
      return;
    }
    const result = await createAccessGrant(apiClient, {
      ...form,
      allowedMethods: form.allowedMethods.split(",").map((method) => method.trim()).filter(Boolean)
    });
    setAppMessage(result.error
      ? { tone: "error", text: result.error.message }
      : { tone: "success", text: "Access grant created with RLS authorization." });
  };

  return (
    <article className="panel form-panel">
      <FormHeader title="Create access grant" icon={UnlockKeyhole} />
      <form className="form-grid" onSubmit={submit}>
        <TextInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} required />
        <TextInput label="Vehicle ID" value={form.vehicleId} onChange={(value) => setForm({ ...form, vehicleId: value })} required />
        <TextInput label="User ID" value={form.userId} onChange={(value) => setForm({ ...form, userId: value })} required />
        <TextInput label="Booking ID" value={form.bookingId} onChange={(value) => setForm({ ...form, bookingId: value })} />
        <TextInput label="Valid from" type="datetime-local" value={form.validFrom} onChange={(value) => setForm({ ...form, validFrom: value })} required />
        <TextInput label="Valid until" type="datetime-local" value={form.validUntil} onChange={(value) => setForm({ ...form, validUntil: value })} required />
        <TextInput label="Methods" value={form.allowedMethods} onChange={(value) => setForm({ ...form, allowedMethods: value })} required />
        <SubmitButton label="Create grant" />
      </form>
    </article>
  );
}

function BookingCreateForm({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    branchId: "",
    vehicleId: "",
    customerId: "",
    startsAt: "",
    endsAt: "",
    status: "reserved",
    estimatedTotal: ""
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isApiReady || !apiClient) {
      setAppMessage({ tone: "info", text: "API unavailable: booking form is ready but cannot save yet." });
      return;
    }
    const result = await createBooking(apiClient, {
      ...form,
      pricingSnapshot: { estimatedTotal: form.estimatedTotal }
    });
    setAppMessage(result.error
      ? { tone: "error", text: result.error.message }
      : { tone: "success", text: "Booking created through the FlashAVTL API." });
  };

  return (
    <article className="panel form-panel">
      <FormHeader title="Create booking" icon={CalendarDays} />
      <form className="form-grid" onSubmit={submit}>
        <TextInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} required />
        <TextInput label="Branch ID" value={form.branchId} onChange={(value) => setForm({ ...form, branchId: value })} />
        <TextInput label="Vehicle ID" value={form.vehicleId} onChange={(value) => setForm({ ...form, vehicleId: value })} required />
        <TextInput label="Customer/User ID" value={form.customerId} onChange={(value) => setForm({ ...form, customerId: value })} required />
        <TextInput label="Starts at" type="datetime-local" value={form.startsAt} onChange={(value) => setForm({ ...form, startsAt: value })} required />
        <TextInput label="Ends at" type="datetime-local" value={form.endsAt} onChange={(value) => setForm({ ...form, endsAt: value })} required />
        <TextInput label="Estimated total" value={form.estimatedTotal} onChange={(value) => setForm({ ...form, estimatedTotal: value })} />
        <SubmitButton label="Create booking" />
      </form>
    </article>
  );
}

function TripCreateForm({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    bookingId: "",
    vehicleId: "",
    driverId: "",
    startedAt: "",
    routeName: ""
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isApiReady || !apiClient) {
      setAppMessage({ tone: "info", text: "API unavailable: trip form is ready but cannot save yet." });
      return;
    }
    const result = await createTrip(apiClient, {
      ...form,
      summary: { routeName: form.routeName }
    });
    setAppMessage(result.error
      ? { tone: "error", text: result.error.message }
      : { tone: "success", text: "Trip created through the FlashAVTL API." });
  };

  return (
    <article className="panel form-panel">
      <FormHeader title="Start trip" icon={Route} />
      <form className="form-grid" onSubmit={submit}>
        <TextInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} required />
        <TextInput label="Booking ID" value={form.bookingId} onChange={(value) => setForm({ ...form, bookingId: value })} />
        <TextInput label="Vehicle ID" value={form.vehicleId} onChange={(value) => setForm({ ...form, vehicleId: value })} required />
        <TextInput label="Driver ID" value={form.driverId} onChange={(value) => setForm({ ...form, driverId: value })} />
        <TextInput label="Started at" type="datetime-local" value={form.startedAt} onChange={(value) => setForm({ ...form, startedAt: value })} />
        <TextInput label="Route name" value={form.routeName} onChange={(value) => setForm({ ...form, routeName: value })} />
        <SubmitButton label="Create trip" />
      </form>
    </article>
  );
}

function DamageReportForm({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    vehicleId: "",
    bookingId: "",
    reportStage: "pre-trip",
    finding: ""
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isApiReady || !apiClient) {
      setAppMessage({ tone: "info", text: "API unavailable: damage report form is ready but cannot save yet." });
      return;
    }
    const result = await createDamageReport(apiClient, {
      ...form,
      aiFindings: { finding: form.finding }
    });
    setAppMessage(result.error
      ? { tone: "error", text: result.error.message }
      : { tone: "success", text: "Damage report created through the FlashAVTL API." });
  };

  return (
    <article className="panel form-panel">
      <FormHeader title="Create damage report" icon={Camera} />
      <form className="form-grid" onSubmit={submit}>
        <TextInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} required />
        <TextInput label="Vehicle ID" value={form.vehicleId} onChange={(value) => setForm({ ...form, vehicleId: value })} required />
        <TextInput label="Booking ID" value={form.bookingId} onChange={(value) => setForm({ ...form, bookingId: value })} />
        <TextInput label="Report stage" value={form.reportStage} onChange={(value) => setForm({ ...form, reportStage: value })} required />
        <TextInput label="AI/manual finding" value={form.finding} onChange={(value) => setForm({ ...form, finding: value })} />
        <SubmitButton label="Create report" />
      </form>
    </article>
  );
}

function StorageUploadForm({
  apiClient,
  isApiReady,
  setAppMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setAppMessage: (message: AppMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    section: "inspection-media",
    entityType: "booking",
    entityId: "",
    objectPath: ""
  });
  const [file, setFile] = useState<File | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isApiReady || !apiClient || !file) {
      setAppMessage({ tone: "info", text: "API unavailable: choose a file and reconnect the API before uploading." });
      return;
    }
    const result = await uploadFlashAvtlFile(apiClient, file, {
      ...form,
      contentType: file.type || "application/octet-stream"
    });
    setAppMessage(result.error
      ? { tone: "error", text: result.error.message }
      : { tone: "success", text: "File uploaded to FlashAVTLStorage and metadata recorded." });
  };

  return (
    <article className="panel form-panel">
      <FormHeader title="Upload inspection/damage media" icon={UploadCloud} />
      <form className="form-grid" onSubmit={submit}>
        <TextInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} required />
        <label>
          Storage section
          <select value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })}>
            {storageConfig.prefixes.map((prefix) => (
              <option key={prefix} value={prefix}>{prefix}</option>
            ))}
          </select>
        </label>
        <TextInput label="Entity type" value={form.entityType} onChange={(value) => setForm({ ...form, entityType: value })} required />
        <TextInput label="Entity ID" value={form.entityId} onChange={(value) => setForm({ ...form, entityId: value })} />
        <TextInput label="Object path" value={form.objectPath} onChange={(value) => setForm({ ...form, objectPath: value })} required />
        <label>
          File
          <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
        <SubmitButton label="Upload file" />
      </form>
    </article>
  );
}

function FormHeader({ title, icon: Icon }: { title: string; icon: typeof Building2 }) {
  return (
    <div className="panel-header">
      <div>
        <p className="eyebrow">Secure form</p>
        <h3>{title}</h3>
      </div>
      <Icon size={22} className="neutral-icon" aria-hidden="true" />
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button className="submit-button" type="submit">
      <Save size={17} aria-hidden="true" />
      {label}
    </button>
  );
}

function methodIcon(methodId: string) {
  if (methodId === "ble") {
    return <Bluetooth size={20} aria-hidden="true" />;
  }
  if (methodId === "optical") {
    return <ScanFaceFallback />;
  }
  if (methodId === "qr") {
    return <QrCode size={20} aria-hidden="true" />;
  }
  if (methodId === "nfc") {
    return <IdCard size={20} aria-hidden="true" />;
  }
  return <UnlockKeyhole size={20} aria-hidden="true" />;
}

function ScanFaceFallback() {
  return <Fingerprint size={20} aria-hidden="true" />;
}

function labelFromKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}

function getDefaultOrganizationId(userContext: any) {
  return userContext?.profile?.organization_id ?? userContext?.roles?.[0]?.organization_id ?? "";
}

function InfoItem({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="info-item">
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Timeline({
  events
}: {
  events: Array<{ key: string; time: string; title: string; detail: string }>;
}) {
  return (
    <div className="timeline">
      {events.map((event) => (
        <div className="timeline-row" key={event.key}>
          <span>{event.time}</span>
          <div>
            <strong>{event.title}</strong>
            <p>{event.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
