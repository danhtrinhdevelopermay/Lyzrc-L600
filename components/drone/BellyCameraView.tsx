import React, { useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import C from "@/constants/colors";
import { useDrone } from "@/contexts/DroneContext";

export default function BellyCameraView() {
  const { telemetry, status } = useDrone();
  const scanLine = useSharedValue(0);
  const isActive = status === "flying" || status === "connected";

  useEffect(() => {
    if (isActive) {
      scanLine.value = withRepeat(
        withTiming(1, { duration: 2200 }),
        -1,
        false
      );
    }
  }, [isActive]);

  const scanStyle = useAnimatedStyle(() => ({
    top: `${scanLine.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Simulated belly cam feed */}
      <View style={styles.feed}>
        {/* Ground texture simulation */}
        <View style={styles.groundPattern}>
          {Array.from({ length: 6 }).map((_, i) =>
            Array.from({ length: 6 }).map((_, j) => (
              <View
                key={`${i}-${j}`}
                style={[
                  styles.groundCell,
                  {
                    backgroundColor: (i + j) % 2 === 0
                      ? "rgba(30,60,20,0.8)"
                      : "rgba(20,45,15,0.8)",
                  },
                ]}
              />
            ))
          )}
        </View>

        {/* Scan line */}
        {isActive && (
          <Animated.View style={[styles.scanLine, scanStyle]} />
        )}

        {/* Overlay grid */}
        <View style={styles.grid}>
          <View style={styles.gridH} />
          <View style={styles.gridV} />
        </View>

        {/* Center target */}
        <View style={styles.targetOuter}>
          <View style={styles.targetInner} />
        </View>

        {/* Corner marks */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Alt readout */}
        <View style={styles.altReadout}>
          <Text style={styles.altText}>{isActive ? telemetry.altitude.toFixed(1) : "0.0"}m</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="camera-iris" size={10} color={C.accent} />
        <Text style={styles.headerText}>BELLY CAM</Text>
      </View>

      {/* Inactive overlay */}
      {!isActive && (
        <View style={styles.inactiveOverlay}>
          <MaterialCommunityIcons name="video-off-outline" size={18} color={C.textSecondary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.35)",
    backgroundColor: "#0A1208",
    position: "relative",
  },
  feed: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  groundPattern: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  groundCell: {
    width: "16.66%",
    height: "16.66%",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(0,212,255,0.5)",
    zIndex: 2,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  gridH: {
    position: "absolute",
    width: "100%",
    height: 0.5,
    backgroundColor: "rgba(0,212,255,0.2)",
  },
  gridV: {
    position: "absolute",
    height: "100%",
    width: 0.5,
    backgroundColor: "rgba(0,212,255,0.2)",
  },
  targetOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  targetInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.accent,
    opacity: 0.8,
  },
  corner: {
    position: "absolute",
    width: 10,
    height: 10,
    borderColor: "rgba(0,212,255,0.7)",
  },
  cornerTL: { top: 8, left: 8, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
  altReadout: {
    position: "absolute",
    bottom: 4,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  altText: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: C.accent },
  header: {
    position: "absolute",
    top: 4,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    zIndex: 5,
  },
  headerText: { fontSize: 8, fontFamily: "Inter_700Bold", color: C.accent, letterSpacing: 0.5 },
  inactiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
