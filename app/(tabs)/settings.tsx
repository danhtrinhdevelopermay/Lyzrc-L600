import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrone } from "@/contexts/DroneContext";
import C from "@/constants/colors";

interface ToggleSetting {
  key: string;
  label: string;
  sub?: string;
  icon: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

interface ActionSetting {
  key: string;
  label: string;
  sub?: string;
  icon: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const { status, telemetry, disconnect, setFlightMode, flightMode } = useDrone();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const isConnected = status !== "disconnected";

  const [settings, setSettings] = useState({
    returnToHome: true,
    beginnerMode: false,
    visualObstacleAvoidance: true,
    lowBatteryWarning: true,
    signalLostAction: true,
    unitMetric: true,
    gridLines: true,
    overExposureWarning: true,
    videoCaption: false,
    geofenceEnabled: true,
    autoTakeoff: false,
    hapticFeedback: true,
    hdmi: false,
    geoAware: true,
  });

  const toggle = (k: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [k]: !prev[k] }));
    Haptics.selectionAsync();
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topPad }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
      </View>

      {/* Drone status card */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.droneCard}>
        <LinearGradient
          colors={isConnected ? ["#002A35", "#003040"] : ["#1A1A22", "#141420"]}
          style={styles.droneCardGrad}
        >
          <View style={styles.droneCardLeft}>
            <MaterialCommunityIcons
              name="drone"
              size={40}
              color={isConnected ? C.accent : C.textDim}
            />
          </View>
          <View style={styles.droneCardInfo}>
            <Text style={styles.droneModelName}>LYZRC L600 PRO MAX</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: isConnected ? C.success : C.textDim }]} />
              <Text style={[styles.statusText, { color: isConnected ? C.success : C.textSecondary }]}>
                {status === "disconnected" ? "Not Connected" :
                 status === "connecting" ? "Connecting..." :
                 status === "flying" ? "In Flight" :
                 status === "returning" ? "Returning Home" :
                 "Connected"}
              </Text>
            </View>
            {isConnected && (
              <View style={styles.droneStats}>
                <StatPill icon="battery-70" value={`${Math.round(telemetry.battery)}%`} color={telemetry.battery > 30 ? C.success : C.danger} />
                <StatPill icon="thermometer" value={`${Math.round(telemetry.temperature)}°C`} color={C.text} />
                <StatPill icon="satellite-uplink" value={`${telemetry.gpsSatellites} SAT`} color={C.text} />
              </View>
            )}
          </View>
          {isConnected && (
            <TouchableOpacity
              style={styles.disconnectBtn}
              onPress={() => { disconnect(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }}
            >
              <MaterialCommunityIcons name="wifi-off" size={16} color={C.warning} />
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Flight mode */}
      <Animated.View entering={FadeInDown.delay(100)}>
        <SectionTitle icon="airplane-settings" title="FLIGHT MODE" />
        <View style={styles.segmentControl}>
          {(["GPS", "ATTI", "SPORT", "CINEMATIC"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.segmentBtn, flightMode === m && styles.segmentBtnActive]}
              onPress={() => { setFlightMode(m); Haptics.selectionAsync(); }}
            >
              <Text style={[styles.segmentText, flightMode === m && { color: C.accent }]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Safety settings */}
      <Animated.View entering={FadeInDown.delay(150)}>
        <SectionTitle icon="shield-check-outline" title="SAFETY" />
        <View style={styles.settingsGroup}>
          <ToggleRow
            icon="home-import-outline"
            label="Return to Home"
            sub="Activate when signal lost"
            value={settings.returnToHome}
            onChange={() => toggle("returnToHome")}
          />
          <Divider />
          <ToggleRow
            icon="school-outline"
            label="Beginner Mode"
            sub="Limit altitude and speed"
            value={settings.beginnerMode}
            onChange={() => toggle("beginnerMode")}
          />
          <Divider />
          <ToggleRow
            icon="eye-outline"
            label="Obstacle Avoidance"
            sub="Downward visual sensors"
            value={settings.visualObstacleAvoidance}
            onChange={() => toggle("visualObstacleAvoidance")}
          />
          <Divider />
          <ToggleRow
            icon="battery-low"
            label="Low Battery Warning"
            sub="Alert at 20% and 10%"
            value={settings.lowBatteryWarning}
            onChange={() => toggle("lowBatteryWarning")}
          />
          <Divider />
          <ToggleRow
            icon="earth"
            label="Geo-Awareness"
            sub="Restrict restricted airspace"
            value={settings.geoAware}
            onChange={() => toggle("geoAware")}
          />
        </View>
      </Animated.View>

      {/* Camera settings */}
      <Animated.View entering={FadeInDown.delay(200)}>
        <SectionTitle icon="camera-outline" title="CAMERA" />
        <View style={styles.settingsGroup}>
          <ToggleRow
            icon="grid-large"
            label="Grid Lines"
            sub="Show in camera view"
            value={settings.gridLines}
            onChange={() => toggle("gridLines")}
          />
          <Divider />
          <ToggleRow
            icon="brightness-6"
            label="Over-Exposure Warning"
            sub="Zebra pattern on overexposed areas"
            value={settings.overExposureWarning}
            onChange={() => toggle("overExposureWarning")}
          />
          <Divider />
          <ActionRow
            icon="video-4k-box"
            label="Video Resolution"
            value="4K 30fps"
            onPress={() => Haptics.selectionAsync()}
          />
          <Divider />
          <ActionRow
            icon="image-size-select-actual"
            label="Photo Format"
            value="RAW + JPEG"
            onPress={() => Haptics.selectionAsync()}
          />
          <Divider />
          <ToggleRow
            icon="closed-caption-outline"
            label="Video Caption"
            sub="Embed telemetry data"
            value={settings.videoCaption}
            onChange={() => toggle("videoCaption")}
          />
        </View>
      </Animated.View>

      {/* Control settings */}
      <Animated.View entering={FadeInDown.delay(250)}>
        <SectionTitle icon="controller-classic-outline" title="CONTROLS" />
        <View style={styles.settingsGroup}>
          <ToggleRow
            icon="vibrate"
            label="Haptic Feedback"
            sub="Vibration on controls"
            value={settings.hapticFeedback}
            onChange={() => toggle("hapticFeedback")}
          />
          <Divider />
          <ActionRow
            icon="controller-classic-outline"
            label="Control Mode"
            value="Mode 2"
            onPress={() => Haptics.selectionAsync()}
          />
          <Divider />
          <ToggleRow
            icon="ruler"
            label="Metric Units"
            sub="m/s, meters, °C"
            value={settings.unitMetric}
            onChange={() => toggle("unitMetric")}
          />
        </View>
      </Animated.View>

      {/* Device info */}
      <Animated.View entering={FadeInDown.delay(300)}>
        <SectionTitle icon="information-outline" title="DEVICE INFO" />
        <View style={styles.settingsGroup}>
          {[
            ["Drone Model", "LYZRC L600 Pro Max"],
            ["Firmware", "v2.4.1.20"],
            ["App Version", "v1.0.0"],
            ["Max Altitude", "120m"],
            ["Max Range", "1000m"],
            ["Flight Time", "~28 min"],
            ["Camera", "4K 48MP EIS"],
            ["Stabilizer", "3-Axis Gimbal"],
          ].map(([label, value], i, arr) => (
            <React.Fragment key={label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
              {i < arr.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
      </Animated.View>

      {/* Danger zone */}
      <Animated.View entering={FadeInDown.delay(350)} style={styles.dangerZone}>
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }}
        >
          <MaterialCommunityIcons name="restart" size={18} color={C.danger} />
          <Text style={styles.dangerBtnText}>Factory Reset Drone</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dangerBtn, { borderColor: "rgba(255,149,0,0.3)" }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <MaterialCommunityIcons name="update" size={18} color={C.warning} />
          <Text style={[styles.dangerBtnText, { color: C.warning }]}>Check Firmware Update</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionTitle}>
      <MaterialCommunityIcons name={icon as any} size={14} color={C.accent} />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function ToggleRow({
  icon,
  label,
  sub,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  sub?: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIconWrap}>
        <MaterialCommunityIcons name={icon as any} size={18} color={C.textSecondary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sub && <Text style={styles.settingSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.surface3, true: "rgba(0,212,255,0.4)" }}
        thumbColor={value ? C.accent : C.textDim}
        ios_backgroundColor={C.surface3}
      />
    </View>
  );
}

function ActionRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingIconWrap}>
        <MaterialCommunityIcons name={icon as any} size={18} color={C.textSecondary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={16} color={C.textDim} />
    </TouchableOpacity>
  );
}

function StatPill({ icon, value, color }: { icon: string; value: string; color: string }) {
  return (
    <View style={styles.statPill}>
      <MaterialCommunityIcons name={icon as any} size={11} color={color} />
      <Text style={[styles.statPillText, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: C.text,
    letterSpacing: 2,
  },
  droneCard: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
  },
  droneCardGrad: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  droneCardLeft: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(0,212,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
  },
  droneCardInfo: { flex: 1, gap: 4 },
  droneModelName: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: C.text,
    letterSpacing: 0.5,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  droneStats: { flexDirection: "row", gap: 6, marginTop: 4 },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statPillText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  disconnectBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(255,149,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,149,0,0.3)",
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitleText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: C.accent,
    letterSpacing: 2,
  },
  segmentControl: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: C.surface2,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentBtnActive: { backgroundColor: "rgba(0,212,255,0.15)" },
  segmentText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  settingsGroup: {
    marginHorizontal: 16,
    backgroundColor: C.surface2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: { flex: 1, gap: 2 },
  settingLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.text },
  settingSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  settingValue: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary, marginRight: 4 },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 58 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },
  dangerZone: { margin: 16, gap: 10 },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.3)",
  },
  dangerBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.danger },
});
