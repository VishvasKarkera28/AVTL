import { StyleSheet } from "react-native";

export const colors = {
  ink: "#1F2A32",
  muted: "#637282",
  line: "#D9E3E8",
  surface: "#FFFFFF",
  page: "#EEF3F5",
  navy: "#17212B",
  green: "#0B7A5F",
  greenSoft: "#E3F4EF",
  red: "#D3212D",
  amber: "#F0A808",
  amberSoft: "#FFF4D8",
  blue: "#1E6B8F",
  blueSoft: "#E2F1F7"
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.page
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20
  },
  securityText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8
  },
  tabs: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  tabContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  tabButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  tabButtonActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  tabText: {
    color: colors.ink,
    fontWeight: "800",
    fontSize: 14
  },
  tabTextActive: {
    color: colors.surface
  },
  content: {
    padding: 14,
    gap: 14
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 4
  },
  pill: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blueSoft
  },
  pillText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  pillSuccess: {
    backgroundColor: colors.greenSoft
  },
  pillTextSuccess: {
    color: colors.green
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    width: "48%",
    minHeight: 108,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  metricValue: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 10
  },
  metricDetail: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6
  },
  infoGrid: {
    gap: 10
  },
  infoItem: {
    minHeight: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  infoText: {
    flex: 1
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12
  },
  infoValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
    lineHeight: 19
  },
  rowList: {
    gap: 10
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 10
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  rowDetail: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 5,
    lineHeight: 18
  },
  methodRow: {
    minHeight: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.blueSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E6EEF2",
    overflow: "hidden",
    marginTop: 10
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.green
  },
  prefixWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  prefix: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#EDF3F5",
    justifyContent: "center"
  },
  prefixText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  userButton: {
    minHeight: 68,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  userButtonActive: {
    borderColor: "#B5DED2",
    backgroundColor: colors.greenSoft
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.amber,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: colors.navy,
    fontWeight: "900"
  },
  userCopy: {
    flex: 1
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  chip: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#EDF3F5",
    justifyContent: "center"
  },
  chipText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 14
  },
  actionButton: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.navy,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  actionButtonGreen: {
    backgroundColor: colors.green
  },
  actionText: {
    color: colors.surface,
    fontWeight: "800"
  },
  submitButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12
  },
  mobileInputWrap: {
    gap: 6,
    marginTop: 12
  },
  mobileInput: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: 12
  },
  code: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#F4F7F8",
    color: "#40515F",
    fontSize: 11,
    lineHeight: 16
  },
  truckScene: {
    height: 170,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#F7FAFC",
    justifyContent: "flex-end",
    padding: 18,
    marginBottom: 14
  },
  truckBody: {
    height: 72,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: colors.navy,
    backgroundColor: colors.surface,
    justifyContent: "center",
    paddingLeft: 34
  },
  truckStripe: {
    position: "absolute",
    left: 34,
    right: 16,
    bottom: 18,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.amber
  },
  truckLabel: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: "900"
  },
  wheelRow: {
    position: "absolute",
    left: 54,
    right: 54,
    bottom: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  wheel: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: colors.navy,
    borderWidth: 10,
    borderColor: "#C8D5DD"
  },
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  telemetryTile: {
    width: "48%",
    minHeight: 82,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12
  },
  scoreRow: {
    flexDirection: "row",
    gap: 10
  },
  scoreBox: {
    flex: 1,
    minHeight: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center"
  },
  scoreValue: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900"
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  }
});
