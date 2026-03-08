import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrone } from "@/contexts/DroneContext";
import C from "@/constants/colors";

const { width: SCREEN_W } = Dimensions.get("window");
const MAP_H = 340;

const BASE_LAT = 21.0285;
const BASE_LON = 105.8542;

function latToPixel(lat: number, centerLat: number, scale: number, h: number) {
  return h / 2 - (lat - centerLat) * scale;
}
function lonToPixel(lon: number, centerLon: number, scale: number, w: number) {
  return w / 2 + (lon - centerLon) * scale;
}

export default function MapScreen() {
  const { telemetry, status, flightPath } = useDrone();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [mapType, setMapType] = useState<"satellite" | "terrain" | "street">("satellite");
  const scale = 600000;

  const isConnected = status !== "disconnected";

  const droneX = lonToPixel(telemetry.longitude, BASE_LON, scale, SCREEN_W);
  const droneY = latToPixel(telemetry.latitude, BASE_LAT, scale, MAP_H);
  const homeX = SCREEN_W / 2;
  const homeY = MAP_H / 2;

  const mapColors: Record<string, [string, string]> = {
    satellite: ["#0A1A0F", "#0F2015"],
    terrain: ["#1A1E0F", "#152012"],
    street: ["#0F1020", "#141525"],
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FLIGHT MAP</Text>
        <View style={styles.headerRight}>
          {["satellite", "terrain", "street"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.mapTypeBtn, mapType === t && styles.mapTypeBtnActive]}
              onPress={() => setMapType(t as any)}
            >
              <Text style={[styles.mapTypeTxt, mapType === t && { color: C.accent }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <LinearGradient colors={mapColors[mapType]} style={StyleSheet.absoluteFill} />

        {/* Grid overlay */}
        <View style={styles.mapGrid}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLine, styles.gridLineH, { top: `${i * 10}%` }]} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLine, styles.gridLineV, { left: `${i * 10}%` }]} />
          ))}
        </View>

        {/* Map features */}
        {mapType === "satellite" && (
          <>
            {[
              { x: 80, y: 120, w: 60, h: 40, c: "rgba(20,50,20,0.8)" },
              { x: 200, y: 80, w: 100, h: 60, c: "rgba(30,70,30,0.7)" },
              { x: 280, y: 200, w: 80, h: 50, c: "rgba(40,80,40,0.6)" },
              { x: 120, y: 220, w: 120, h: 30, c: "rgba(15,35,80,0.7)" },
              { x: 60, y: 260, w: 55, h: 55, c: "rgba(25,60,25,0.8)" },
            ].map((r, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: r.x,
                  top: r.y,
                  width: r.w,
                  height: r.h,
                  backgroundColor: r.c,
                  borderRadius: 4,
                }}
              />
            ))}
            <View style={[styles.road, { left: 0, right: 0, top: "55%", height: 3 }]} />
            <View style={[styles.road, { top: 0, bottom: 0, left: "40%", width: 2 }]} />
          </>
        )}

        {/* Scale */}
        <View style={styles.scaleBar}>
          <View style={styles.scaleLine} />
          <Text style={styles.scaleText}>100m</Text>
        </View>

        {/* Compass */}
        <View style={styles.compass}>
          <MaterialCommunityIcons name="compass-rose" size={36} color="rgba(0,212,255,0.5)" />
        </View>

        {/* Flight path */}
        {flightPath.length > 1 && flightPath.map((pt, i) => {
          if (i === 0) return null;
          const x = lonToPixel(pt.longitude, BASE_LON, scale, SCREEN_W);
          const y = latToPixel(pt.latitude, BASE_LAT, scale, MAP_H);
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: x - 2,
                top: y - 2,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(0,212,255,0.6)",
              }}
            />
          );
        })}

        {/* Safe return radius */}
        {isConnected && (
          <View
            style={[
              styles.safeRadius,
              {
                left: homeX - 50,
                top: homeY - 50,
                width: 100,
                height: 100,
                borderRadius: 50,
              },
            ]}
          />
        )}

        {/* Home point */}
        <View style={[styles.homeMarker, { left: homeX - 12, top: homeY - 12 }]}>
          <MaterialCommunityIcons name="home" size={20} color={C.success} />
        </View>

        {/* Drone marker */}
        {isConnected && (
          <Animated.View
            entering={FadeIn}
            style={[
              styles.droneMarker,
              {
                left: droneX - 16,
                top: Math.max(10, Math.min(MAP_H - 32, droneY - 16)),
                transform: [{ rotate: `${telemetry.heading}deg` }],
              },
            ]}
          >
            <MaterialCommunityIcons name="drone" size={28} color={C.accent} />
          </Animated.View>
        )}

        {/* Distance line */}
        {isConnected && (
          <View
            style={[
              styles.distanceLine,
              {
                left: Math.min(homeX, droneX),
                top: Math.min(homeY, droneY),
                width: Math.abs(droneX - homeX),
                height: Math.abs(droneY - homeY),
              },
            ]}
          />
        )}

        {/* No signal */}
        {!isConnected && (
          <View style={styles.noSignalOverlay}>
            <MaterialCommunityIcons name="signal-off" size={32} color={C.textSecondary} />
            <Text style={styles.noSignalText}>DRONE NOT CONNECTED</Text>
          </View>
        )}
      </View>

      {/* Telemetry cards */}
      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.infoRow}>
          <InfoCard
            icon="map-marker"
            label="LATITUDE"
            value={isConnected ? telemetry.latitude.toFixed(6) : "--"}
            unit=""
          />
          <InfoCard
            icon="map-marker-outline"
            label="LONGITUDE"
            value={isConnected ? telemetry.longitude.toFixed(6) : "--"}
            unit=""
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150)} style={styles.infoRow}>
          <InfoCard
            icon="arrow-up-bold"
            label="ALTITUDE"
            value={isConnected ? telemetry.altitude.toFixed(1) : "0"}
            unit="m"
          />
          <InfoCard
            icon="map-marker-distance"
            label="HOME DIST"
            value={isConnected ? Math.round(telemetry.homeDistance).toString() : "0"}
            unit="m"
          />
          <InfoCard
            icon="compass-outline"
            label="HEADING"
            value={isConnected ? `${Math.round(telemetry.heading)}` : "0"}
            unit="°"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.infoRow}>
          <InfoCard
            icon="satellite-uplink"
            label="SATELLITES"
            value={isConnected ? telemetry.gpsSatellites.toString() : "0"}
            unit=""
            accent={isConnected && telemetry.gpsSatellites > 12}
          />
          <InfoCard
            icon="speedometer"
            label="SPEED"
            value={isConnected ? telemetry.hspeed.toFixed(1) : "0.0"}
            unit="m/s"
          />
          <InfoCard
            icon="clock-outline"
            label="FLIGHT TIME"
            value={isConnected ? `${Math.floor(telemetry.flightTime / 60)}:${String(telemetry.flightTime % 60).padStart(2, "0")}` : "0:00"}
            unit=""
          />
        </Animated.View>

        {/* Flight path stats */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.pathStatsCard}>
          <View style={styles.pathStatsHeader}>
            <MaterialCommunityIcons name="routes" size={16} color={C.accent} />
            <Text style={styles.pathStatsTitle}>FLIGHT PATH</Text>
            <Text style={styles.pathStatsCount}>{flightPath.length} points</Text>
          </View>
          <View style={styles.pathStatsMini}>
            {["Max Alt", "Max Speed", "Track Length"].map((label, i) => {
              const vals = [
                flightPath.length > 0 ? `${Math.max(...flightPath.map((p) => p.altitude)).toFixed(1)}m` : "0m",
                isConnected ? `${telemetry.hspeed.toFixed(1)}m/s` : "0m/s",
                `${flightPath.length * 3}m`,
              ];
              return (
                <View key={label} style={styles.pathStatItem}>
                  <Text style={styles.pathStatLabel}>{label}</Text>
                  <Text style={styles.pathStatValue}>{vals[i]}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function InfoCard({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.infoCard, accent && styles.infoCardAccent]}>
      <MaterialCommunityIcons name={icon as any} size={14} color={accent ? C.accent : C.textSecondary} />
      <Text style={styles.infoCardLabel}>{label}</Text>
      <Text style={[styles.infoCardValue, accent && { color: C.accent }]}>
        {value}<Text style={styles.infoCardUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: C.text,
    letterSpacing: 2,
  },
  headerRight: { flexDirection: "row", gap: 4 },
  mapTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  mapTypeBtnActive: {
    borderColor: "rgba(0,212,255,0.3)",
    backgroundColor: "rgba(0,212,255,0.1)",
  },
  mapTypeTxt: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.textSecondary },
  mapContainer: {
    height: MAP_H,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  gridLine: { position: "absolute", backgroundColor: "rgba(0,212,255,0.04)" },
  gridLineH: { left: 0, right: 0, height: 0.5 },
  gridLineV: { top: 0, bottom: 0, width: 0.5 },
  road: { position: "absolute", backgroundColor: "rgba(60,60,80,0.6)" },
  scaleBar: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scaleLine: {
    width: 50,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  scaleText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" },
  compass: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  safeRadius: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(52,199,89,0.2)",
    backgroundColor: "rgba(52,199,89,0.05)",
  },
  homeMarker: { position: "absolute" },
  droneMarker: { position: "absolute" },
  distanceLine: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.3)",
    borderStyle: "dashed",
  },
  noSignalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,15,0.6)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noSignalText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    letterSpacing: 1.5,
  },
  cardsContainer: { padding: 12, gap: 10 },
  infoRow: { flexDirection: "row", gap: 10 },
  infoCard: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "flex-start",
  },
  infoCardAccent: {
    borderColor: "rgba(0,212,255,0.3)",
    backgroundColor: "rgba(0,212,255,0.08)",
  },
  infoCardLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
    letterSpacing: 1,
  },
  infoCardValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  infoCardUnit: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  pathStatsCard: {
    backgroundColor: C.surface2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  pathStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pathStatsTitle: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: C.text,
    letterSpacing: 1,
    flex: 1,
  },
  pathStatsCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  pathStatsMini: { flexDirection: "row", justifyContent: "space-between" },
  pathStatItem: { alignItems: "center", gap: 4 },
  pathStatLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  pathStatValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
});
