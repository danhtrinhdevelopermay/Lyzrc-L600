import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import C from "@/constants/colors";
import { useDrone } from "@/contexts/DroneContext";

function BatteryIcon({ level }: { level: number }) {
  const color = level > 30 ? C.success : level > 15 ? C.warning : C.danger;
  return (
    <View style={styles.batteryRow}>
      <MaterialCommunityIcons
        name={level > 75 ? "battery" : level > 50 ? "battery-70" : level > 25 ? "battery-40" : "battery-10"}
        size={16}
        color={color}
      />
      <Text style={[styles.hudValue, { color }]}>{Math.round(level)}%</Text>
    </View>
  );
}

function SignalBars({ strength }: { strength: number }) {
  const bars = [1, 2, 3, 4, 5];
  const filled = Math.round((strength / 100) * 5);
  return (
    <View style={styles.signalRow}>
      {bars.map((b) => (
        <View
          key={b}
          style={[
            styles.signalBar,
            { height: 4 + b * 2, backgroundColor: b <= filled ? C.accent : C.textDim },
          ]}
        />
      ))}
    </View>
  );
}

function GPSIcon({ satellites }: { satellites: number }) {
  const color = satellites > 12 ? C.success : satellites > 8 ? C.warning : C.danger;
  return (
    <View style={styles.gpsRow}>
      <MaterialIcons name="gps-fixed" size={14} color={color} />
      <Text style={[styles.hudValueSm, { color }]}>{satellites}</Text>
    </View>
  );
}

export default function HUDOverlay() {
  const { telemetry, status, flightMode, isRecording } = useDrone();
  const insets = useSafeAreaInsets();
  const recOpacity = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      recOpacity.value = withRepeat(
        withSequence(withTiming(0.2, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1
      );
    } else {
      recOpacity.value = 1;
    }
  }, [isRecording]);

  const recStyle = useAnimatedStyle(() => ({ opacity: recOpacity.value }));

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const isConnected = status !== "disconnected";

  return (
    <View style={[styles.container, { paddingTop: topPad + 8 }]} pointerEvents="none">
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.hudChip}>
            <MaterialCommunityIcons name="wifi" size={12} color={C.accent} />
            <SignalBars strength={isConnected ? telemetry.signalStrength : 0} />
          </View>
          <View style={styles.hudChip}>
            <GPSIcon satellites={isConnected ? telemetry.gpsSatellites : 0} />
          </View>
          <View style={styles.hudChip}>
            <MaterialCommunityIcons name="thermometer" size={12} color={C.textSecondary} />
            <Text style={styles.hudValueSm}>{isConnected ? Math.round(telemetry.temperature) : "--"}°C</Text>
          </View>
        </View>

        <View style={styles.topCenter}>
          <View style={[styles.modeBadge, { borderColor: C.accentGlow }]}>
            <Text style={styles.modeText}>{flightMode}</Text>
          </View>
          {isRecording && (
            <Animated.View style={[styles.recBadge, recStyle]}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>REC {formatTime(Math.floor(telemetry.flightTime))}</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.topRight}>
          <BatteryIcon level={isConnected ? telemetry.battery : 0} />
          <Text style={styles.voltText}>{isConnected ? telemetry.batteryVoltage.toFixed(1) : "--"}V</Text>
        </View>
      </View>

      {/* Left telemetry panel */}
      <View style={styles.leftPanel}>
        <TelemetryItem icon="arrow-up-bold" label="ALT" value={isConnected ? `${telemetry.altitude.toFixed(1)}m` : "--"} />
        <TelemetryItem icon="speedometer" label="H.SPD" value={isConnected ? `${telemetry.hspeed.toFixed(1)}m/s` : "--"} />
        <TelemetryItem
          icon="arrow-up-down"
          label="V.SPD"
          value={isConnected ? `${telemetry.vspeed > 0 ? "+" : ""}${telemetry.vspeed.toFixed(1)}m/s` : "--"}
          color={telemetry.vspeed > 2 ? C.warning : telemetry.vspeed < -2 ? C.danger : C.text}
        />
        <TelemetryItem icon="map-marker-distance" label="DIST" value={isConnected ? `${Math.round(telemetry.distance)}m` : "--"} />
      </View>

      {/* Right telemetry panel */}
      <View style={styles.rightPanel}>
        <TelemetryItem icon="clock-outline" label="TIME" value={isConnected ? formatTime(Math.floor(telemetry.flightTime)) : "--"} />
        <TelemetryItem
          icon="weather-windy"
          label="WIND"
          value={isConnected ? `${telemetry.windSpeed.toFixed(1)}m/s` : "--"}
          color={telemetry.windSpeed > 8 ? C.danger : telemetry.windSpeed > 5 ? C.warning : C.text}
        />
        <TelemetryItem
          icon="home-map-marker"
          label="HOME"
          value={isConnected ? `${Math.round(telemetry.homeDistance)}m` : "--"}
        />
        <TelemetryItem icon="compass-outline" label="HDG" value={isConnected ? `${Math.round(telemetry.heading)}°` : "--"} />
      </View>

      {/* Bottom attitude indicator */}
      {isConnected && (
        <Animated.View entering={FadeIn} style={styles.bottomRow}>
          <View style={styles.attitudeChip}>
            <Text style={styles.attLabel}>P</Text>
            <Text style={[styles.attValue, { color: Math.abs(telemetry.pitch) > 15 ? C.warning : C.text }]}>
              {telemetry.pitch > 0 ? "+" : ""}{telemetry.pitch.toFixed(1)}°
            </Text>
          </View>
          <View style={styles.attitudeChip}>
            <Text style={styles.attLabel}>R</Text>
            <Text style={[styles.attValue, { color: Math.abs(telemetry.roll) > 10 ? C.warning : C.text }]}>
              {telemetry.roll > 0 ? "+" : ""}{telemetry.roll.toFixed(1)}°
            </Text>
          </View>
          <View style={styles.attitudeChip}>
            <Text style={styles.attLabel}>Y</Text>
            <Text style={styles.attValue}>{Math.round(telemetry.yaw)}°</Text>
          </View>
        </Animated.View>
      )}

      {/* Horizon crosshair */}
      {isConnected && (
        <View style={styles.crosshairContainer} pointerEvents="none">
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
          <View style={styles.crosshairCircle} />
        </View>
      )}
    </View>
  );
}

function TelemetryItem({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.telItem}>
      <MaterialCommunityIcons name={icon as any} size={11} color={C.textSecondary} />
      <Text style={styles.telLabel}>{label}</Text>
      <Text style={[styles.telValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(10,10,15,0.55)",
  },
  topLeft: { flexDirection: "row", gap: 8, alignItems: "center", flex: 1 },
  topCenter: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", flex: 1 },
  topRight: { flexDirection: "row", gap: 4, alignItems: "center", justifyContent: "flex-end", flex: 1 },
  hudChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  hudValue: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.text },
  hudValueSm: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.text },
  batteryRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  voltText: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textSecondary },
  signalRow: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  signalBar: { width: 3, borderRadius: 1 },
  gpsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  modeBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(0,212,255,0.12)",
  },
  modeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: C.accent, letterSpacing: 1 },
  recBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,59,48,0.2)",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.5)",
  },
  recDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.danger },
  recText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.danger },
  leftPanel: {
    position: "absolute",
    left: 8,
    top: "30%",
    gap: 6,
  },
  rightPanel: {
    position: "absolute",
    right: 8,
    top: "30%",
    gap: 6,
    alignItems: "flex-end",
  },
  telItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(10,10,15,0.6)",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.1)",
  },
  telLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: C.textSecondary, width: 32 },
  telValue: { fontSize: 12, fontFamily: "Inter_700Bold", color: C.text, minWidth: 52, textAlign: "right" },
  bottomRow: {
    position: "absolute",
    bottom: 200,
    alignSelf: "center",
    flexDirection: "row",
    gap: 10,
  },
  attitudeChip: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "rgba(10,10,15,0.65)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.1)",
    alignItems: "center",
  },
  attLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  attValue: { fontSize: 11, fontFamily: "Inter_700Bold", color: C.text },
  crosshairContainer: {
    position: "absolute",
    top: "45%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairH: {
    position: "absolute",
    width: 30,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  crosshairV: {
    position: "absolute",
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  crosshairCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "transparent",
  },
});
