import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrone } from "@/contexts/DroneContext";
import C from "@/constants/colors";

const { width: SCREEN_W } = Dimensions.get("window");
const THUMB_SIZE = (SCREEN_W - 4) / 3;

const PHOTO_COLORS: [string, string][] = [
  ["#0F2A20", "#1A4535"],
  ["#151A30", "#1E2545"],
  ["#2A1A10", "#402815"],
  ["#1A1520", "#2A2030"],
  ["#0F2515", "#1A3A22"],
  ["#201520", "#302030"],
  ["#1A2030", "#253040"],
  ["#152020", "#203030"],
  ["#201A10", "#302515"],
  ["#151A25", "#1E2535"],
  ["#1A2515", "#253520"],
  ["#201520", "#302030"],
];

interface MediaItem {
  id: string;
  type: "photo" | "video";
  timestamp: number;
  duration?: number;
  resolution: string;
  colorIdx: number;
}

const INITIAL_MEDIA: MediaItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `m${i}`,
  type: i % 4 === 3 ? "video" : "photo",
  timestamp: Date.now() - (i * 3600000),
  duration: i % 4 === 3 ? 15 + i * 3 : undefined,
  resolution: i % 4 === 3 ? "4K 30fps" : "48MP",
  colorIdx: i % PHOTO_COLORS.length,
}));

export default function GalleryScreen() {
  const { mediaCount } = useDrone();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const media = [
    ...INITIAL_MEDIA,
    ...Array.from({ length: mediaCount.photos - 12 + mediaCount.videos - 3 }, (_, i) => ({
      id: `new${i}`,
      type: (mediaCount.videos - 3 > i ? "video" : "photo") as "photo" | "video",
      timestamp: Date.now() - i * 60000,
      duration: undefined,
      resolution: "4K 30fps",
      colorIdx: i % PHOTO_COLORS.length,
    })),
  ].filter((m) => filter === "all" || m.type === filter);

  const formatTime = (ms: number) => {
    const d = new Date(ms);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const renderItem = ({ item, index }: { item: MediaItem; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 30)}>
      <TouchableOpacity
        onPress={() => { setSelectedItem(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        activeOpacity={0.85}
        style={styles.thumbWrapper}
      >
        <LinearGradient
          colors={PHOTO_COLORS[item.colorIdx]}
          style={[styles.thumb, { width: THUMB_SIZE - 2, height: THUMB_SIZE - 2 }]}
        >
          {/* Simulated landscape */}
          <View style={styles.thumbSky} />
          <View style={styles.thumbGround} />
          {/* Drone shadow */}
          <View style={styles.thumbDroneShadow} />
          {item.type === "video" && (
            <View style={styles.videoOverlay}>
              <View style={styles.playBadge}>
                <MaterialCommunityIcons name="play" size={10} color={C.white} />
              </View>
              {item.duration && (
                <Text style={styles.durationText}>{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, "0")}</Text>
              )}
            </View>
          )}
          {/* Resolution badge */}
          <View style={styles.resBadge}>
            <Text style={styles.resText}>{item.resolution}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MEDIA</Text>
          <Text style={styles.headerSub}>{mediaCount.photos} photos · {mediaCount.videos} videos</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <MaterialCommunityIcons name="sort-variant" size={20} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={20} color={C.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(["all", "photo", "video"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => { setFilter(f); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.filterText, filter === f && { color: C.accent }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats row */}
      <Animated.View entering={FadeInDown} style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="harddisk" size={14} color={C.accent} />
          <Text style={styles.statLabel}>STORAGE</Text>
          <Text style={styles.statValue}>12.4 GB</Text>
          <View style={styles.storageBar}>
            <View style={[styles.storageFill, { width: "48%" }]} />
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="micro-sd" size={14} color={C.accent} />
          <Text style={styles.statLabel}>SD CARD</Text>
          <Text style={styles.statValue}>64 GB</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="download-outline" size={14} color={C.accent} />
          <Text style={styles.statLabel}>TRANSFER</Text>
          <Text style={styles.statValue}>USB-C</Text>
        </View>
      </Animated.View>

      {/* Grid */}
      {media.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="image-off-outline" size={48} color={C.textDim} />
          <Text style={styles.emptyText}>No media captured yet</Text>
          <Text style={styles.emptySubText}>Start flying and capture photos or videos</Text>
        </View>
      ) : (
        <FlatList
          data={media}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        />
      )}

      {/* Media viewer modal */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={PHOTO_COLORS[selectedItem.colorIdx]}
              style={styles.modalMedia}
            >
              <View style={styles.modalSky} />
              <View style={styles.modalGround} />
              <View style={styles.modalDroneShadow} />
              {selectedItem.type === "video" && (
                <View style={styles.modalPlayBtn}>
                  <MaterialCommunityIcons name="play-circle" size={64} color="rgba(255,255,255,0.8)" />
                </View>
              )}
              {/* Overlay HUD simulation */}
              <View style={styles.modalHUD}>
                <View style={styles.hudTopBar}>
                  <Text style={styles.hudTopText}>L600 PRO MAX · {selectedItem.resolution}</Text>
                  <Text style={styles.hudTopText}>{formatTime(selectedItem.timestamp)}</Text>
                </View>
                <View style={styles.hudCornerTL} />
                <View style={styles.hudCornerTR} />
                <View style={styles.hudCornerBL} />
                <View style={styles.hudCornerBR} />
                <View style={styles.hudCenter}>
                  <View style={styles.hudCenterDot} />
                </View>
              </View>
            </LinearGradient>

            {/* Controls */}
            <View style={styles.modalControls}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setSelectedItem(null)}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
              <View style={styles.modalInfo}>
                <Text style={styles.modalType}>{selectedItem.type.toUpperCase()} · {selectedItem.resolution}</Text>
                <Text style={styles.modalTime}>{formatTime(selectedItem.timestamp)}</Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionBtn}>
                  <MaterialCommunityIcons name="share-variant" size={20} color={C.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalActionBtn}>
                  <MaterialCommunityIcons name="download" size={20} color={C.accent} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
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
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.text, letterSpacing: 2 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: { padding: 6 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterBtnActive: {
    borderColor: "rgba(0,212,255,0.35)",
    backgroundColor: "rgba(0,212,255,0.1)",
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, height: 36, backgroundColor: C.border },
  statLabel: { fontSize: 9, fontFamily: "Inter_500Medium", color: C.textSecondary, letterSpacing: 1 },
  statValue: { fontSize: 13, fontFamily: "Inter_700Bold", color: C.text },
  storageBar: {
    width: 60,
    height: 3,
    backgroundColor: C.surface3,
    borderRadius: 2,
    overflow: "hidden",
  },
  storageFill: { height: "100%", backgroundColor: C.accent, borderRadius: 2 },
  grid: { padding: 2, gap: 2 },
  thumbWrapper: { margin: 1 },
  thumb: {
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbSky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  thumbGround: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  thumbDroneShadow: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  videoOverlay: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  playBadge: {
    backgroundColor: "rgba(255,59,48,0.8)",
    borderRadius: 3,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  durationText: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: C.white },
  resBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  resText: { fontSize: 8, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  emptySubText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textDim, textAlign: "center" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  modalMedia: {
    flex: 1,
    margin: 0,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  modalGround: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalDroneShadow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  modalPlayBtn: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  modalHUD: { ...StyleSheet.absoluteFillObject },
  hudTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  hudTopText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  hudCornerTL: { position: "absolute", top: 55, left: 20, width: 20, height: 20, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: "rgba(0,212,255,0.6)" },
  hudCornerTR: { position: "absolute", top: 55, right: 20, width: 20, height: 20, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: "rgba(0,212,255,0.6)" },
  hudCornerBL: { position: "absolute", bottom: 80, left: 20, width: 20, height: 20, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: "rgba(0,212,255,0.6)" },
  hudCornerBR: { position: "absolute", bottom: 80, right: 20, width: 20, height: 20, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: "rgba(0,212,255,0.6)" },
  hudCenter: {
    position: "absolute",
    top: "45%",
    left: "50%",
    marginLeft: -10,
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  hudCenterDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "rgba(255,255,255,0.5)" },
  modalControls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  modalBtn: { padding: 8 },
  modalInfo: { flex: 1, paddingHorizontal: 12 },
  modalType: { fontSize: 13, fontFamily: "Inter_700Bold", color: C.text },
  modalTime: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  modalActions: { flexDirection: "row", gap: 8 },
  modalActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
});
