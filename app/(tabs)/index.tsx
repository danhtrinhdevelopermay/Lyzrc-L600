import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrone } from "@/contexts/DroneContext";
import HUDOverlay from "@/components/drone/HUDOverlay";
import VirtualJoystick from "@/components/drone/VirtualJoystick";
import BellyCameraView from "@/components/drone/BellyCameraView";
import CameraControls from "@/components/drone/CameraControls";
import C from "@/constants/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const FLIGHT_MODES = ["GPS", "ATTI", "SPORT", "CINEMATIC"] as const;

export default function FlyScreen() {
  const { status, connect, disconnect, arm, disarm, isArmed, takeOff, land, returnHome, setFlightMode, flightMode, cameraSettings } = useDrone();
  const [showFlightMenu, setShowFlightMenu] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const isConnected = status !== "disconnected" && status !== "connecting";
  const isFlying = status === "flying";

  const connectScale = useSharedValue(1);
  const connectBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: connectScale.value }] }));

  const handleConnect = () => {
    connectScale.value = withSpring(0.93, {}, () => { connectScale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isConnected) disconnect();
    else connect();
  };

  const StatusDot = () => {
    const colors: Record<string, string> = {
      disconnected: C.textDim,
      connecting: C.warning,
      connected: C.success,
      flying: C.accent,
      returning: C.warning,
      landing: C.warning,
    };
    return (
      <View style={[styles.statusDot, { backgroundColor: colors[status] ?? C.textDim }]} />
    );
  };

  return (
    <View style={styles.container}>
      {/* Camera Feed Background */}
      <View style={StyleSheet.absoluteFill}>
        {isConnected ? (
          <View style={styles.cameraFeed}>
            {/* Simulated sky gradient */}
            <LinearGradient
              colors={["#0F1520", "#1A2535", "#243040"]}
              style={StyleSheet.absoluteFill}
            />
            {/* Horizon line */}
            <View style={styles.horizon} />
            {/* Ground */}
            <LinearGradient
              colors={["#1A2B15", "#0F1A0A"]}
              style={styles.ground}
            />
            {/* Scan effect */}
            <View style={styles.scanEffect} />
          </View>
        ) : (
          <View style={styles.offlineBg}>
            <LinearGradient
              colors={["#080810", "#0A0A14", "#0D0D1A"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.noSignalGrid}>
              {Array.from({ length: 120 }).map((_, i) => (
                <View key={i} style={styles.gridDot} />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* HUD Overlay (absolute positioned) */}
      <HUDOverlay />

      {/* Top-right controls */}
      <View style={[styles.topRightControls, { top: topPad + 48 }]}>
        {/* Flight mode selector */}
        <TouchableOpacity
          style={styles.topCtrlBtn}
          onPress={() => { setShowFlightMenu((v) => !v); Haptics.selectionAsync(); }}
        >
          <MaterialCommunityIcons name="cog-outline" size={18} color={C.accent} />
        </TouchableOpacity>

        {isConnected && (
          <TouchableOpacity
            style={styles.topCtrlBtn}
            onPress={() => { returnHome(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
          >
            <MaterialCommunityIcons name="home-import-outline" size={18} color={C.warning} />
          </TouchableOpacity>
        )}
      </View>

      {/* Flight mode panel */}
      {showFlightMenu && (
        <Animated.View entering={FadeInDown} style={[styles.flightModePanel, { top: topPad + 100 }]}>
          <Text style={styles.flightPanelTitle}>FLIGHT MODE</Text>
          {FLIGHT_MODES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.flightModeItem, flightMode === m && styles.flightModeItemActive]}
              onPress={() => {
                setFlightMode(m);
                setShowFlightMenu(false);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.flightModeText, flightMode === m && { color: C.accent }]}>{m}</Text>
              {flightMode === m && <MaterialCommunityIcons name="check" size={14} color={C.accent} />}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Belly camera PiP */}
      {cameraSettings.showBellyCamera && (
        <Animated.View entering={FadeIn} style={styles.bellyCamPip}>
          <BellyCameraView />
        </Animated.View>
      )}

      {/* Connection status bar */}
      <Animated.View entering={FadeInUp} style={[styles.statusBar, { top: topPad + 8 }]}>
        <View style={styles.statusLeft}>
          <StatusDot />
          <Text style={styles.statusText}>
            {status === "disconnected"
              ? "LYZRC L600 PRO MAX"
              : status === "connecting"
              ? "CONNECTING..."
              : status === "flying"
              ? "IN FLIGHT"
              : status === "returning"
              ? "RETURNING HOME"
              : status === "landing"
              ? "LANDING..."
              : "L600 PRO MAX"}
          </Text>
        </View>
      </Animated.View>

      {/* Not connected overlay */}
      {!isConnected && (
        <View style={styles.connectOverlay}>
          {/* Drone icon */}
          <Animated.View entering={FadeInUp.delay(200)}>
            <MaterialCommunityIcons name="drone" size={72} color={C.accent} style={{ opacity: 0.8 }} />
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(300)} style={styles.droneModelText}>
            LYZRC L600 PRO MAX
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(400)} style={styles.droneSubText}>
            {status === "connecting" ? "Searching for drone..." : "Ready to connect"}
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(500)} style={connectBtnStyle}>
            <TouchableOpacity
              style={[styles.connectBtn, status === "connecting" && styles.connectBtnActive]}
              onPress={handleConnect}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={status === "connecting" ? ["#FF6B00", "#FF9500"] : ["#00A8CC", "#00D4FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.connectBtnGrad}
              >
                <MaterialCommunityIcons
                  name={status === "connecting" ? "loading" : "wifi"}
                  size={20}
                  color="#000"
                />
                <Text style={styles.connectBtnText}>
                  {status === "connecting" ? "SEARCHING..." : "CONNECT DRONE"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Flight action buttons (when connected) */}
      {isConnected && !isFlying && (
        <Animated.View entering={SlideInUp} style={[styles.flightActionsBar, { bottom: 160 }]}>
          <TouchableOpacity
            style={[styles.actionBtn, isArmed ? styles.actionBtnDanger : styles.actionBtnSuccess]}
            onPress={() => {
              if (isArmed) disarm();
              else arm();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }}
          >
            <MaterialCommunityIcons
              name={isArmed ? "stop" : "engine-outline"}
              size={18}
              color={isArmed ? C.danger : C.success}
            />
            <Text style={[styles.actionBtnText, { color: isArmed ? C.danger : C.success }]}>
              {isArmed ? "DISARM" : "ARM"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnAccent, !isArmed && styles.actionBtnDisabled]}
            onPress={() => {
              if (!isArmed) return;
              takeOff();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
            disabled={!isArmed}
          >
            <MaterialCommunityIcons name="airplane-takeoff" size={18} color={isArmed ? C.accent : C.textDim} />
            <Text style={[styles.actionBtnText, { color: isArmed ? C.accent : C.textDim }]}>TAKE OFF</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {isFlying && (
        <Animated.View entering={SlideInUp} style={[styles.flightActionsBar, { bottom: 160 }]}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnWarning]}
            onPress={() => {
              land();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }}
          >
            <MaterialCommunityIcons name="airplane-landing" size={18} color={C.warning} />
            <Text style={[styles.actionBtnText, { color: C.warning }]}>LAND</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSuccess]}
            onPress={() => {
              returnHome();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
          >
            <MaterialCommunityIcons name="home-import-outline" size={18} color={C.success} />
            <Text style={[styles.actionBtnText, { color: C.success }]}>RETURN HOME</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Joysticks (when flying) */}
      {isFlying && (
        <Animated.View entering={FadeIn} style={styles.joystickContainer}>
          <VirtualJoystick label="THROTTLE / YAW" size={120} />
          <VirtualJoystick label="PITCH / ROLL" size={120} />
        </Animated.View>
      )}

      {/* Camera controls at bottom */}
      {isConnected && <CameraControls />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  cameraFeed: { flex: 1 },
  horizon: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0,212,255,0.15)",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  scanEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,212,255,0.02)",
  },
  offlineBg: { flex: 1 },
  noSignalGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gridDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(0,212,255,0.08)",
  },
  statusBar: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 11,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: C.textSecondary,
    letterSpacing: 1.5,
  },
  topRightControls: {
    position: "absolute",
    right: 16,
    flexDirection: "column",
    gap: 8,
    zIndex: 15,
  },
  topCtrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(10,10,15,0.7)",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  flightModePanel: {
    position: "absolute",
    right: 60,
    backgroundColor: "rgba(12,12,20,0.96)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
    minWidth: 160,
    zIndex: 20,
  },
  flightPanelTitle: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: C.accent,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  flightModeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  flightModeItemActive: { backgroundColor: "rgba(0,212,255,0.1)" },
  flightModeText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
  },
  bellyCamPip: {
    position: "absolute",
    bottom: 155,
    right: 16,
    zIndex: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  connectOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    zIndex: 5,
    backgroundColor: "rgba(8,8,16,0.75)",
  },
  droneModelText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: C.text,
    letterSpacing: 2,
  },
  droneSubText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  connectBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  connectBtnActive: {},
  connectBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  connectBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#000",
    letterSpacing: 1,
  },
  flightActionsBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
    zIndex: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(10,10,15,0.85)",
  },
  actionBtnSuccess: { borderColor: "rgba(52,199,89,0.4)" },
  actionBtnDanger: { borderColor: "rgba(255,59,48,0.4)" },
  actionBtnWarning: { borderColor: "rgba(255,149,0,0.4)" },
  actionBtnAccent: { borderColor: "rgba(0,212,255,0.4)" },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  joystickContainer: {
    position: "absolute",
    bottom: 155,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    zIndex: 12,
  },
});
