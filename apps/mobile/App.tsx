import { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
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
  Fingerprint,
  Fuel,
  Gauge,
  HardDrive,
  IdCard,
  KeyRound,
  LockKeyhole,
  Map,
  MapPinned,
  MapPin,
  Navigation,
  RadioTower,
  QrCode,
  Route,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UnlockKeyhole,
  UploadCloud,
  UserCheck,
  UserPlus
} from "lucide-react-native";
import {
  accessGrant,
  accessSafetyChecks,
  activeTrip,
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
  createAccessGrant,
  createBooking,
  createDamageReport,
  createFleetAsset,
  createTrip,
  createUserInvitation,
  getCurrentUserContext,
  listAssetTypes,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  signUpUser
} from "@avtl/domain/api";
import { colors, styles } from "./src/styles";

declare const require: (path: string) => number;

const flashAvtlLogo = require("./assets/flashavtl-logo.png");

type Section =
  | "foundation"
  | "identity"
  | "digital-twin"
  | "command-center"
  | "smart-access"
  | "booking"
  | "trip-tracking"
  | "inspection-damage";

const tabs = [
  { id: "foundation" as const, label: "Foundation", icon: Building2 },
  { id: "identity" as const, label: "Identity", icon: ShieldCheck },
  { id: "digital-twin" as const, label: "Vehicle Twin", icon: Truck },
  { id: "command-center" as const, label: "Command", icon: MapPinned },
  { id: "smart-access" as const, label: "Access", icon: UnlockKeyhole },
  { id: "booking" as const, label: "Booking", icon: CalendarDays },
  { id: "trip-tracking" as const, label: "Trip", icon: Route },
  { id: "inspection-damage" as const, label: "Inspection", icon: Camera }
];

type MobileMessage = {
  tone: "success" | "error" | "info";
  text: string;
};

const apiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8787"
};

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("foundation");
  const [selectedUserId, setSelectedUserId] = useState(demoUsers[0].id);
  const [session, setSession] = useState<any>(null);
  const [userContext, setUserContext] = useState<any>(null);
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [message, setMessage] = useState<MobileMessage>({
    tone: "info",
    text: hasApiConfig(apiConfig)
      ? "FlashAVTL JWT mode is enabled. Sign in to use live workflows through the API."
      : "Demo mode is active. Add EXPO_PUBLIC_API_URL to connect live data."
  });

  const apiClient = useMemo(() => createFlashAvtlApiClient(apiConfig), []);
  const isApiReady = Boolean(apiClient);

  const selectedUser = useMemo<DemoUser>(
    () => demoUsers.find((user) => user.id === selectedUserId) ?? demoUsers[0],
    [selectedUserId]
  );

  useEffect(() => {
    if (!apiClient) {
      return undefined;
    }

    async function loadContext() {
      const { data } = await getAuthSession(apiClient);
      setSession(data);
      if (data) {
        const [contextResult, assetTypesResult] = await Promise.all([
          getCurrentUserContext(apiClient),
          listAssetTypes(apiClient)
        ]);
        setUserContext(contextResult.data ?? null);
        setAssetTypes(assetTypesResult.data ?? []);
      }
    }

    loadContext();
    const unsubscribe = onAuthStateChange(apiClient, async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        const contextResult = await getCurrentUserContext(apiClient);
        setUserContext(contextResult.data ?? null);
      } else {
        setUserContext(null);
      }
    });
    return unsubscribe;
  }, [apiClient]);

  if (isApiReady && !session) {
    return (
      <MobileAuthScreen
        apiClient={apiClient}
        message={message}
        setMessage={setMessage}
      />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Image
          source={flashAvtlLogo}
          style={styles.headerLogo}
          resizeMode="contain"
          accessibilityLabel="FlashAVTL - Track. Lock. Protect. Everywhere."
        />
        <Text style={styles.eyebrow}>BP Petroleum pilot workspace</Text>
        <Text style={styles.subtitle}>
          {organization.name} - {vehicleTwin.registrationNumber}
        </Text>
        <Text style={styles.securityText}>
          {isApiReady ? `JWT ${session ? "active" : "pending"}` : "Demo mode"} - {message.text}
        </Text>
        {session && (
          <TouchableOpacity
            style={[styles.actionButton, { marginTop: 10, alignSelf: "flex-start" }]}
            onPress={async () => {
              if (apiClient) {
                await signOut(apiClient);
                setSession(null);
                setUserContext(null);
              }
            }}
          >
            <Text style={styles.actionText}>Sign out</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContent}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setActiveSection(tab.id)}
              >
                <Icon size={16} color={active ? colors.surface : colors.ink} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeSection === "foundation" && (
          <FoundationScreen
            apiClient={apiClient}
            isApiReady={isApiReady}
            userContext={userContext}
            assetTypes={assetTypes}
            setMessage={setMessage}
          />
        )}
        {activeSection === "identity" && (
          <IdentityScreen
            selectedUser={selectedUser}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
          />
        )}
        {activeSection === "digital-twin" && <VehicleTwinScreen />}
        {activeSection === "command-center" && <FleetCommandScreen />}
        {activeSection === "smart-access" && <SmartAccessScreen apiClient={apiClient} isApiReady={isApiReady} setMessage={setMessage} />}
        {activeSection === "booking" && <BookingScreen apiClient={apiClient} isApiReady={isApiReady} setMessage={setMessage} />}
        {activeSection === "trip-tracking" && <TripTrackingScreen apiClient={apiClient} isApiReady={isApiReady} setMessage={setMessage} />}
        {activeSection === "inspection-damage" && <InspectionDamageScreen apiClient={apiClient} isApiReady={isApiReady} setMessage={setMessage} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function MobileAuthScreen({
  apiClient,
  message,
  setMessage
}: {
  apiClient: any;
  message: MobileMessage;
  setMessage: (message: MobileMessage) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });

  const submit = async () => {
    const result = mode === "signin"
      ? await signInWithPassword(apiClient, form)
      : await signUpUser(apiClient, form);
    setMessage(result.error
      ? { tone: "error", text: result.error.message }
      : { tone: "success", text: mode === "signin" ? "Signed in with FlashAVTL application JWT." : "Account created." });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Panel eyebrow="FlashAVTL" title="Secure access" icon={ShieldCheck} status={mode}>
          <Image
            source={flashAvtlLogo}
            style={styles.authLogo}
            resizeMode="contain"
            accessibilityLabel="FlashAVTL - Track. Lock. Protect. Everywhere."
          />
          <Text style={styles.subtitle}>{message.text}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setMode("signin")}>
              <Text style={styles.actionText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonGreen]} onPress={() => setMode("signup")}>
              <Text style={styles.actionText}>Sign up</Text>
            </TouchableOpacity>
          </View>
          {mode === "signup" && (
            <>
              <MobileInput label="Full name" value={form.fullName} onChange={(value) => setForm({ ...form, fullName: value })} />
              <MobileInput label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            </>
          )}
          <MobileInput label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} keyboardType="email-address" />
          <MobileInput label="Password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} secure />
          <TouchableOpacity style={styles.submitButton} onPress={submit}>
            <Text style={styles.actionText}>{mode === "signin" ? "Sign in securely" : "Create account"}</Text>
          </TouchableOpacity>
        </Panel>
      </ScrollView>
    </SafeAreaView>
  );
}

function FoundationScreen({
  apiClient,
  isApiReady,
  userContext,
  assetTypes,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  userContext: any;
  assetTypes: any[];
  setMessage: (message: MobileMessage) => void;
}) {
  return (
    <>
      <View style={styles.metricGrid}>
        {dashboardMetrics.map((metric) => (
          <View style={styles.metricCard} key={metric.label}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricDetail}>{metric.detail}</Text>
          </View>
        ))}
      </View>

      <Panel eyebrow="Tenant" title={organization.legalName} icon={Building2} status="active">
        <View style={styles.infoGrid}>
          <InfoItem icon={Building2} label="Tenant code" value={organization.tenantCode} />
          <InfoItem icon={MapPin} label="Branch" value={organization.primaryBranch.address} />
          <InfoItem icon={Database} label="Database" value="FlashAVTL" />
          <InfoItem icon={LockKeyhole} label="Storage" value={storageConfig.bucket} />
        </View>
      </Panel>

      <Panel eyebrow="Modules" title="Production readiness" icon={CheckCircle2}>
        <View style={styles.rowList}>
          {moduleStatuses.map((module) => (
            <View style={styles.row} key={module.id}>
              <Text style={styles.rowTitle}>{module.label}</Text>
              <Text style={styles.rowDetail}>{module.description}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${module.progress}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Controls" title="Foundation checks" icon={ShieldCheck}>
        <View style={styles.rowList}>
          {foundationChecks.map((check) => (
            <View style={styles.row} key={check.label}>
              <Text style={styles.rowTitle}>{check.label}</Text>
              <Text style={styles.rowDetail}>{check.status} - {check.detail}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Storage" title="Bucket prefixes" icon={UploadCloud}>
        <View style={styles.prefixWrap}>
          {storageConfig.prefixes.map((prefix) => (
            <View style={styles.prefix} key={prefix}>
              <Text style={styles.prefixText}>{prefix}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <MobileUserInvitationForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        userContext={userContext}
        setMessage={setMessage}
      />

      <MobileFleetAssetForm
        apiClient={apiClient}
        isApiReady={isApiReady}
        userContext={userContext}
        assetTypes={assetTypes}
        setMessage={setMessage}
      />
    </>
  );
}

function MobileUserInvitationForm({
  apiClient,
  isApiReady,
  userContext,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  userContext: any;
  setMessage: (message: MobileMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: getDefaultOrganizationId(userContext),
    fullName: "",
    email: "",
    phone: "",
    role: "driver"
  });

  const submit = async () => {
    if (!isApiReady || !apiClient) {
      setMessage({ tone: "info", text: "API unavailable: user invitation cannot be saved yet." });
      return;
    }
    const result = await createUserInvitation(apiClient, form);
    setMessage(result.error
      ? { tone: "error", text: result.error.message }
      : {
          tone: "success",
          text: result.data?.temporaryPassword
            ? `User created. Temporary password: ${result.data.temporaryPassword}`
            : "User created."
        });
  };

  return (
    <Panel eyebrow="Secure form" title="Create user invitation" icon={UserPlus}>
      <MobileInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} />
      <MobileInput label="Full name" value={form.fullName} onChange={(value) => setForm({ ...form, fullName: value })} />
      <MobileInput label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} keyboardType="email-address" />
      <MobileInput label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
      <MobileInput label="Role" value={form.role} onChange={(value) => setForm({ ...form, role: value })} />
      <TouchableOpacity style={styles.submitButton} onPress={submit}>
        <Text style={styles.actionText}>Save invitation</Text>
      </TouchableOpacity>
    </Panel>
  );
}

function MobileFleetAssetForm({
  apiClient,
  isApiReady,
  userContext,
  assetTypes,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  userContext: any;
  assetTypes: any[];
  setMessage: (message: MobileMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: getDefaultOrganizationId(userContext),
    assetType: assetTypes[0]?.id ?? "truck",
    registrationNumber: "",
    vin: "",
    make: "",
    model: "",
    year: "2026",
    status: "available"
  });

  const submit = async () => {
    if (!isApiReady || !apiClient) {
      setMessage({ tone: "info", text: "API unavailable: fleet asset cannot be saved yet." });
      return;
    }
    const result = await createFleetAsset(apiClient, form);
    setMessage(result.error
      ? { tone: "error", text: result.error.message }
      : { tone: "success", text: "Fleet asset created." });
  };

  return (
    <Panel eyebrow="Secure form" title="Create fleet asset" icon={Truck}>
      <MobileInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} />
      <MobileInput label="Asset type" value={form.assetType} onChange={(value) => setForm({ ...form, assetType: value })} />
      <MobileInput label="Registration / serial" value={form.registrationNumber} onChange={(value) => setForm({ ...form, registrationNumber: value })} />
      <MobileInput label="VIN / hull" value={form.vin} onChange={(value) => setForm({ ...form, vin: value })} />
      <MobileInput label="Make" value={form.make} onChange={(value) => setForm({ ...form, make: value })} />
      <MobileInput label="Model" value={form.model} onChange={(value) => setForm({ ...form, model: value })} />
      <MobileInput label="Year" value={form.year} onChange={(value) => setForm({ ...form, year: value })} keyboardType="number-pad" />
      <TouchableOpacity style={styles.submitButton} onPress={submit}>
        <Text style={styles.actionText}>Create asset</Text>
      </TouchableOpacity>
    </Panel>
  );
}

function IdentityScreen({
  selectedUser,
  selectedUserId,
  onSelectUser
}: {
  selectedUser: DemoUser;
  selectedUserId: string;
  onSelectUser: (id: string) => void;
}) {
  const checks = identityChecks.filter((check) => check.userId === selectedUser.id);
  const visibleChecks = checks.length ? checks : identityChecks;

  return (
    <>
      <Panel eyebrow="Session" title="Authenticated user" icon={UserCheck} status="verified">
        <View style={styles.infoGrid}>
          <InfoItem icon={IdCard} label="Name" value={selectedUser.name} />
          <InfoItem icon={ShieldCheck} label="Role" value={selectedUser.role} />
          <InfoItem icon={MapPin} label="Branch" value={selectedUser.branch} />
          <InfoItem icon={Activity} label="Last seen" value={selectedUser.lastSeen} />
        </View>
        <View style={styles.actionRow}>
          <ActionButton icon={Fingerprint} label="Verify" />
          <ActionButton icon={Download} label="Evidence" green />
        </View>
      </Panel>

      <Panel eyebrow="Directory" title="BP Petroleum users" icon={UserCheck}>
        <View style={styles.rowList}>
          {demoUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.userButton,
                selectedUserId === user.id && styles.userButtonActive
              ]}
              onPress={() => onSelectUser(user.id)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(user.name)}</Text>
              </View>
              <View style={styles.userCopy}>
                <Text style={styles.rowTitle}>{user.name}</Text>
                <Text style={styles.rowDetail}>{user.role} - {user.identityStatus}</Text>
              </View>
              <ChevronRight size={16} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Access" title="Permissions" icon={KeyRound}>
        <View style={styles.chipRow}>
          {selectedUser.access.map((access) => (
            <View style={styles.chip} key={access}>
              <Text style={styles.chipText}>{access}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Evidence" title="Identity checks" icon={FileCheck2}>
        <View style={styles.rowList}>
          {visibleChecks.map((check) => (
            <View style={styles.row} key={check.id}>
              <Text style={styles.rowTitle}>{check.label}</Text>
              <Text style={styles.rowDetail}>
                {check.status} - {check.confidence}% confidence
              </Text>
              <Text style={styles.code}>{check.evidencePath}</Text>
            </View>
          ))}
        </View>
      </Panel>
    </>
  );
}

function VehicleTwinScreen() {
  return (
    <>
      <Panel eyebrow="Digital twin" title={vehicleTwin.displayName} icon={Truck} status={vehicleTwin.status}>
        <TruckVisual />
        <Text style={styles.subtitle}>
          {vehicleTwin.make} {vehicleTwin.model} - {vehicleTwin.capacity} {vehicleTwin.productCarried}
        </Text>
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{vehicleTwin.registrationNumber}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{vehicleTwin.lockState}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{vehicleTwin.depot}</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <ActionButton icon={LockKeyhole} label="Lock" />
          <ActionButton icon={RadioTower} label="Diagnose" green />
        </View>
      </Panel>

      <Panel eyebrow="Live state" title="Telemetry" icon={RadioTower}>
        <View style={styles.telemetryGrid}>
          <TelemetryTile icon={Gauge} label="Speed" value={`${vehicleTwin.currentState.speedKph} kph`} />
          <TelemetryTile icon={Fuel} label="Fuel" value={`${vehicleTwin.currentState.fuelPercent}%`} />
          <TelemetryTile icon={LockKeyhole} label="Ignition" value={String(vehicleTwin.currentState.ignition)} />
          <TelemetryTile icon={Activity} label="Network" value={String(vehicleTwin.currentState.network)} />
        </View>
      </Panel>

      <Panel eyebrow="Health" title="Lifecycle score" icon={ClipboardCheck}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{vehicleTwin.healthScore}</Text>
            <Text style={styles.scoreLabel}>Health</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{vehicleTwin.riskScore}</Text>
            <Text style={styles.scoreLabel}>Risk</Text>
          </View>
        </View>
      </Panel>

      <Panel eyebrow="Hardware" title="Vehicle box" icon={HardDrive}>
        <View style={styles.infoGrid}>
          {Object.entries(vehicleTwin.device).slice(0, 6).map(([label, value]) => (
            <InfoItem key={label} icon={HardDrive} label={label} value={value} />
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Documents" title="Vehicle records" icon={FileCheck2}>
        <View style={styles.rowList}>
          {vehicleTwin.documents.map((document) => (
            <View style={styles.row} key={document.type}>
              <Text style={styles.rowTitle}>{document.type}</Text>
              <Text style={styles.rowDetail}>
                {document.status} - expires {document.expires}
              </Text>
              <Text style={styles.code}>{document.storagePath}</Text>
            </View>
          ))}
        </View>
      </Panel>
    </>
  );
}

function FleetCommandScreen() {
  const vehicle = fleetVehicles[0];

  return (
    <>
      <View style={styles.metricGrid}>
        {fleetCommandMetrics.map((metric) => (
          <View style={styles.metricCard} key={metric.label}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricDetail}>{metric.detail}</Text>
          </View>
        ))}
      </View>

      <Panel eyebrow="Live vehicle" title={vehicle.name} icon={MapPinned} status={vehicle.status}>
        <View style={styles.infoGrid}>
          <InfoItem icon={Gauge} label="Speed" value={`${vehicle.speedKph} kph`} />
          <InfoItem icon={Fuel} label="Fuel" value={`${vehicle.fuelPercent}%`} />
          <InfoItem icon={LockKeyhole} label="Lock" value={vehicle.lockState} />
          <InfoItem icon={RadioTower} label="Network" value={String(vehicle.network)} />
          <InfoItem icon={ShieldAlert} label="Risk" value={`${vehicle.riskScore}/100`} />
          <InfoItem icon={ClipboardCheck} label="Health" value={`${vehicle.healthScore}/100`} />
        </View>
      </Panel>

      <Panel eyebrow="Alerts" title="Operations feed" icon={Activity}>
        <TimelineList events={commandCenterAlerts.map((alert) => ({
          time: alert.time,
          title: alert.title,
          detail: `${alert.severity} - ${alert.detail}`
        }))} />
      </Panel>

      <Panel eyebrow="Commands" title="Command queue" icon={RadioTower}>
        <View style={styles.rowList}>
          {commandQueue.map((command) => (
            <View style={styles.row} key={command.id}>
              <Text style={styles.rowTitle}>{command.command}</Text>
              <Text style={styles.rowDetail}>{command.status} - {command.safety}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Geofence" title="Active policies" icon={Map}>
        <View style={styles.rowList}>
          {geofencePolicies.map((policy) => (
            <View style={styles.row} key={policy.id}>
              <Text style={styles.rowTitle}>{policy.name}</Text>
              <Text style={styles.rowDetail}>{policy.status} - {policy.action}</Text>
            </View>
          ))}
        </View>
      </Panel>
    </>
  );
}

function SmartAccessScreen({
  apiClient,
  isApiReady,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setMessage: (message: MobileMessage) => void;
}) {
  return (
    <>
      <Panel eyebrow="Active grant" title={accessGrant.userName} icon={UnlockKeyhole} status={accessGrant.status}>
        <View style={styles.infoGrid}>
          <InfoItem icon={Truck} label="Vehicle" value={vehicleTwin.registrationNumber} />
          <InfoItem icon={Clock3} label="Valid from" value={accessGrant.validFrom} />
          <InfoItem icon={Clock3} label="Valid until" value={accessGrant.validUntil} />
          <InfoItem icon={UnlockKeyhole} label="Offline uses" value={`${accessGrant.offlineUsesRemaining}/${accessGrant.maxOfflineUses}`} />
        </View>
        <View style={styles.chipRow}>
          {accessGrant.allowedMethods.map((method) => (
            <View style={styles.chip} key={method}>
              <Text style={styles.chipText}>{method}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.code}>{accessGrant.tokenPath}</Text>
      </Panel>

      <Panel eyebrow="Unlock" title="Methods" icon={KeyRound}>
        <View style={styles.rowList}>
          {smartAccessMethods.map((method) => (
            <View style={styles.methodRow} key={method.id}>
              <View style={styles.methodIcon}>
                <MethodIcon methodId={method.id} />
              </View>
              <View style={styles.userCopy}>
                <Text style={styles.rowTitle}>{method.name}</Text>
                <Text style={styles.rowDetail}>{method.status} - {method.security}</Text>
              </View>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Safety" title="Policy checks" icon={ShieldCheck}>
        <View style={styles.rowList}>
          {accessSafetyChecks.map((check) => (
            <View style={styles.row} key={check.label}>
              <Text style={styles.rowTitle}>{check.label}</Text>
              <Text style={styles.rowDetail}>{check.status} - {check.detail}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <MobileAccessGrantForm apiClient={apiClient} isApiReady={isApiReady} setMessage={setMessage} />
    </>
  );
}

function BookingScreen({
  apiClient,
  isApiReady,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setMessage: (message: MobileMessage) => void;
}) {
  return (
    <>
      <Panel eyebrow="Booking" title={booking.type} icon={CalendarDays} status={booking.status}>
        <View style={styles.infoGrid}>
          <InfoItem icon={Navigation} label="Pickup" value={booking.pickup} />
          <InfoItem icon={MapPin} label="Dropoff" value={booking.dropoff} />
          <InfoItem icon={Truck} label="Vehicle" value={booking.vehicleName} />
          <InfoItem icon={UserCheck} label="Driver" value={booking.driverName} />
          <InfoItem icon={Fuel} label="Cargo" value={`${booking.quantity} ${booking.cargo}`} />
          <InfoItem icon={Route} label="Distance" value={`${booking.distanceKm} km`} />
        </View>
      </Panel>

      <Panel eyebrow="Pricing" title="Commercial summary" icon={CircleDollarSign}>
        <View style={styles.rowList}>
          {Object.entries(booking.priceSummary).map(([label, value]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.rowTitle}>{labelFromKey(label)}</Text>
              <Text style={styles.rowDetail}>{value}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Handoff" title="Dispatch checklist" icon={ClipboardList}>
        <View style={styles.rowList}>
          {bookingChecklist.map((item) => (
            <View style={styles.row} key={item.label}>
              <Text style={styles.rowTitle}>{item.label}</Text>
              <Text style={styles.rowDetail}>{item.status} - {item.owner}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Schedule" title="Booking timeline" icon={Clock3}>
        <TimelineList events={bookingCalendar.map((item) => ({
          time: item.time,
          title: item.title,
          detail: item.status
        }))} />
      </Panel>

      <MobileBookingForm apiClient={apiClient} isApiReady={isApiReady} setMessage={setMessage} />
    </>
  );
}

function TripTrackingScreen({
  apiClient,
  isApiReady,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setMessage: (message: MobileMessage) => void;
}) {
  return (
    <>
      <Panel eyebrow="Trip" title={`${activeTrip.origin} to ${activeTrip.destination}`} icon={Route} status={activeTrip.status}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{activeTrip.completedKm}</Text>
            <Text style={styles.scoreLabel}>Completed km</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{activeTrip.distanceKm}</Text>
            <Text style={styles.scoreLabel}>Planned km</Text>
          </View>
        </View>
        <View style={[styles.infoGrid, { marginTop: 12 }]}>
          <InfoItem icon={UserCheck} label="Driver" value={activeTrip.driver} />
          <InfoItem icon={Clock3} label="ETA" value={activeTrip.eta} />
          <InfoItem icon={ShieldAlert} label="Risk score" value={`${activeTrip.riskScore}/100`} />
          <InfoItem icon={Map} label="Geofence" value={activeTrip.geofence} />
        </View>
      </Panel>

      <Panel eyebrow="Events" title="Driver monitor" icon={ShieldAlert}>
        <View style={styles.telemetryGrid}>
          {tripEvents.map((event) => (
            <View style={styles.telemetryTile} key={event.id}>
              <Text style={styles.metricValue}>{event.count}</Text>
              <Text style={styles.infoLabel}>{event.label}</Text>
              <Text style={styles.infoValue}>{event.status}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Timeline" title="Trip milestones" icon={Clock3}>
        <TimelineList events={tripTimeline} />
      </Panel>

      <MobileTripForm apiClient={apiClient} isApiReady={isApiReady} setMessage={setMessage} />
    </>
  );
}

function InspectionDamageScreen({
  apiClient,
  isApiReady,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setMessage: (message: MobileMessage) => void;
}) {
  const completion = Math.round((inspectionSession.completedViews / inspectionSession.requiredViews) * 100);

  return (
    <>
      <Panel eyebrow="Inspection" title="Pre-trip media session" icon={Camera} status={inspectionSession.status}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{inspectionSession.completedViews}</Text>
            <Text style={styles.scoreLabel}>Captured</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{completion}%</Text>
            <Text style={styles.scoreLabel}>Complete</Text>
          </View>
        </View>
        <Text style={styles.code}>{inspectionSession.storageBasePath}</Text>
      </Panel>

      <Panel eyebrow="Media" title="Capture checklist" icon={Camera}>
        <View style={styles.rowList}>
          {inspectionChecklist.map((item) => (
            <View style={styles.row} key={item.label}>
              <Text style={styles.rowTitle}>{item.label}</Text>
              <Text style={styles.rowDetail}>{item.status}</Text>
              <Text style={styles.code}>{item.path}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="AI damage" title="Detected findings" icon={FileCheck2}>
        <View style={styles.rowList}>
          {damageFindings.map((finding) => (
            <View style={styles.row} key={finding.id}>
              <Text style={styles.rowTitle}>{finding.panel}</Text>
              <Text style={styles.rowDetail}>
                {finding.severity} - {finding.type} - {finding.confidence}% confidence
              </Text>
              <Text style={styles.code}>{finding.afterPath}</Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel eyebrow="Review" title="Damage workflow" icon={ClipboardCheck}>
        <TimelineList events={damageReviewQueue} />
      </Panel>

      <MobileDamageForm apiClient={apiClient} isApiReady={isApiReady} setMessage={setMessage} />
    </>
  );
}

function MobileAccessGrantForm({
  apiClient,
  isApiReady,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setMessage: (message: MobileMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    vehicleId: "",
    userId: "",
    validFrom: "",
    validUntil: "",
    allowedMethods: "app,ble,optical"
  });

  const submit = async () => {
    if (!isApiReady || !apiClient) {
      setMessage({ tone: "info", text: "API unavailable: access grant cannot be saved yet." });
      return;
    }
    const result = await createAccessGrant(apiClient, {
      ...form,
      allowedMethods: form.allowedMethods.split(",").map((method) => method.trim()).filter(Boolean)
    });
    setMessage(result.error ? { tone: "error", text: result.error.message } : { tone: "success", text: "Access grant created." });
  };

  return (
    <Panel eyebrow="Secure form" title="Create access grant" icon={UnlockKeyhole}>
      <MobileInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} />
      <MobileInput label="Vehicle ID" value={form.vehicleId} onChange={(value) => setForm({ ...form, vehicleId: value })} />
      <MobileInput label="User ID" value={form.userId} onChange={(value) => setForm({ ...form, userId: value })} />
      <MobileInput label="Valid from" value={form.validFrom} onChange={(value) => setForm({ ...form, validFrom: value })} />
      <MobileInput label="Valid until" value={form.validUntil} onChange={(value) => setForm({ ...form, validUntil: value })} />
      <MobileInput label="Methods" value={form.allowedMethods} onChange={(value) => setForm({ ...form, allowedMethods: value })} />
      <TouchableOpacity style={styles.submitButton} onPress={submit}>
        <Text style={styles.actionText}>Create grant</Text>
      </TouchableOpacity>
    </Panel>
  );
}

function MobileBookingForm({
  apiClient,
  isApiReady,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setMessage: (message: MobileMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    vehicleId: "",
    customerId: "",
    startsAt: "",
    endsAt: "",
    estimatedTotal: ""
  });

  const submit = async () => {
    if (!isApiReady || !apiClient) {
      setMessage({ tone: "info", text: "API unavailable: booking cannot be saved yet." });
      return;
    }
    const result = await createBooking(apiClient, {
      ...form,
      pricingSnapshot: { estimatedTotal: form.estimatedTotal }
    });
    setMessage(result.error ? { tone: "error", text: result.error.message } : { tone: "success", text: "Booking created." });
  };

  return (
    <Panel eyebrow="Secure form" title="Create booking" icon={CalendarDays}>
      <MobileInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} />
      <MobileInput label="Vehicle ID" value={form.vehicleId} onChange={(value) => setForm({ ...form, vehicleId: value })} />
      <MobileInput label="Customer/User ID" value={form.customerId} onChange={(value) => setForm({ ...form, customerId: value })} />
      <MobileInput label="Starts at" value={form.startsAt} onChange={(value) => setForm({ ...form, startsAt: value })} />
      <MobileInput label="Ends at" value={form.endsAt} onChange={(value) => setForm({ ...form, endsAt: value })} />
      <MobileInput label="Estimated total" value={form.estimatedTotal} onChange={(value) => setForm({ ...form, estimatedTotal: value })} />
      <TouchableOpacity style={styles.submitButton} onPress={submit}>
        <Text style={styles.actionText}>Create booking</Text>
      </TouchableOpacity>
    </Panel>
  );
}

function MobileTripForm({
  apiClient,
  isApiReady,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setMessage: (message: MobileMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    bookingId: "",
    vehicleId: "",
    driverId: "",
    routeName: ""
  });

  const submit = async () => {
    if (!isApiReady || !apiClient) {
      setMessage({ tone: "info", text: "API unavailable: trip cannot be saved yet." });
      return;
    }
    const result = await createTrip(apiClient, {
      ...form,
      summary: { routeName: form.routeName }
    });
    setMessage(result.error ? { tone: "error", text: result.error.message } : { tone: "success", text: "Trip created." });
  };

  return (
    <Panel eyebrow="Secure form" title="Create trip" icon={Route}>
      <MobileInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} />
      <MobileInput label="Booking ID" value={form.bookingId} onChange={(value) => setForm({ ...form, bookingId: value })} />
      <MobileInput label="Vehicle ID" value={form.vehicleId} onChange={(value) => setForm({ ...form, vehicleId: value })} />
      <MobileInput label="Driver ID" value={form.driverId} onChange={(value) => setForm({ ...form, driverId: value })} />
      <MobileInput label="Route name" value={form.routeName} onChange={(value) => setForm({ ...form, routeName: value })} />
      <TouchableOpacity style={styles.submitButton} onPress={submit}>
        <Text style={styles.actionText}>Create trip</Text>
      </TouchableOpacity>
    </Panel>
  );
}

function MobileDamageForm({
  apiClient,
  isApiReady,
  setMessage
}: {
  apiClient: any;
  isApiReady: boolean;
  setMessage: (message: MobileMessage) => void;
}) {
  const [form, setForm] = useState({
    organizationId: "",
    vehicleId: "",
    bookingId: "",
    reportStage: "pre-trip",
    finding: ""
  });

  const submit = async () => {
    if (!isApiReady || !apiClient) {
      setMessage({ tone: "info", text: "API unavailable: damage report cannot be saved yet." });
      return;
    }
    const result = await createDamageReport(apiClient, {
      ...form,
      aiFindings: { finding: form.finding }
    });
    setMessage(result.error ? { tone: "error", text: result.error.message } : { tone: "success", text: "Damage report created." });
  };

  return (
    <Panel eyebrow="Secure form" title="Create damage report" icon={Camera}>
      <MobileInput label="Organization ID" value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} />
      <MobileInput label="Vehicle ID" value={form.vehicleId} onChange={(value) => setForm({ ...form, vehicleId: value })} />
      <MobileInput label="Booking ID" value={form.bookingId} onChange={(value) => setForm({ ...form, bookingId: value })} />
      <MobileInput label="Report stage" value={form.reportStage} onChange={(value) => setForm({ ...form, reportStage: value })} />
      <MobileInput label="AI/manual finding" value={form.finding} onChange={(value) => setForm({ ...form, finding: value })} />
      <TouchableOpacity style={styles.submitButton} onPress={submit}>
        <Text style={styles.actionText}>Create report</Text>
      </TouchableOpacity>
    </Panel>
  );
}

function Panel({
  eyebrow,
  title,
  icon: Icon,
  status,
  children
}: {
  eyebrow: string;
  title: string;
  icon: typeof Building2;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.panelTitle}>{title}</Text>
        </View>
        {status ? (
          <View style={[styles.pill, styles.pillSuccess]}>
            <Text style={[styles.pillText, styles.pillTextSuccess]}>{status}</Text>
          </View>
        ) : (
          <Icon size={22} color={colors.green} />
        )}
      </View>
      {children}
    </View>
  );
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
    <View style={styles.infoItem}>
      <Icon size={18} color={colors.blue} />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function TelemetryTile({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.telemetryTile}>
      <Icon size={18} color={colors.blue} />
      <Text style={[styles.infoLabel, { marginTop: 8 }]}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  icon: Icon,
  label,
  green
}: {
  icon: typeof Building2;
  label: string;
  green?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.actionButton, green && styles.actionButtonGreen]}>
      <Icon size={17} color={colors.surface} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function MobileInput({
  label,
  value,
  onChange,
  secure,
  keyboardType = "default"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  secure?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad";
}) {
  return (
    <View style={styles.mobileInputWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <TextInput
        style={styles.mobileInput}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

function TruckVisual() {
  return (
    <View style={styles.truckScene}>
      <View style={styles.truckBody}>
        <Text style={styles.truckLabel}>BP</Text>
        <View style={styles.truckStripe} />
      </View>
      <View style={styles.wheelRow}>
        <View style={styles.wheel} />
        <View style={styles.wheel} />
      </View>
    </View>
  );
}

function TimelineList({
  events
}: {
  events: Array<{ time: string; title: string; detail: string }>;
}) {
  return (
    <View style={styles.rowList}>
      {events.map((event) => (
        <View style={styles.row} key={`${event.time}-${event.title}`}>
          <Text style={styles.rowTitle}>{event.time} - {event.title}</Text>
          <Text style={styles.rowDetail}>{event.detail}</Text>
        </View>
      ))}
    </View>
  );
}

function MethodIcon({ methodId }: { methodId: string }) {
  if (methodId === "ble") {
    return <Bluetooth size={18} color={colors.blue} />;
  }
  if (methodId === "qr") {
    return <QrCode size={18} color={colors.blue} />;
  }
  if (methodId === "nfc") {
    return <IdCard size={18} color={colors.blue} />;
  }
  if (methodId === "optical") {
    return <Fingerprint size={18} color={colors.blue} />;
  }
  return <UnlockKeyhole size={18} color={colors.blue} />;
}

function labelFromKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}

function getDefaultOrganizationId(userContext: any) {
  return userContext?.profile?.organization_id ?? userContext?.roles?.[0]?.organization_id ?? "";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}
