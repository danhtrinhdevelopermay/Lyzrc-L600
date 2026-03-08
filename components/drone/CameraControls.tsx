import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import C from "@/constants/colors";
import { useDrone } from "@/contexts/DroneContext";

export default function CameraControls() {
  const { cameraMode, setCameraMode, isRecording, capturePhoto, startRecording, stopRecording, cameraSettings, updateCameraSettings } = useDrone();
  const [showColorPanel, setShowColorPanel] = useState(false);
  const insets = useSafeAreaInsets();
  const shutterScale = useSharedValue(1);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  const onShutter = () => {
    shutterScale.value = withSequence(withTiming(0.85, { duration: 80 }), withSpring(1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (cameraMode === "photo") {
      capturePhoto();
    } else {
      if (isRecording) stopRecording();
      else startRecording();
    }
  };

  const EV_STEPS = [-3, -2, -1.7, -1.3, -1, -0.7, -0.3, 0, 0.3, 0.7, 1, 1.3, 1.7, 2, 3];
  const ISO_STEPS = [100, 200, 400, 800, 1600, 3200, 6400];
  const WB_STEPS = ["Auto", "Sunny", "Cloudy", "Shade", "Incandescent", "Fluorescent"];
  const PROFILE_STEPS = ["Normal", "D-Log M", "HLG", "Vivid", "Flat"];

  return (
    <>
      {/* Color panel */}
      {showColorPanel && (
        <View style={styles.colorPanel}>
          <Text style={styles.panelTitle}>CAMERA SETTINGS</Text>
          <View style={styles.settingsGrid}>
            <SettingRow
              label="EV"
              value={cameraSettings.ev === 0 ? "0" : cameraSettings.ev > 0 ? `+${cameraSettings.ev}` : `${cameraSettings.ev}`}
              onDec={() => {
                const i = EV_STEPS.indexOf(cameraSettings.ev);
                if (i > 0) updateCameraSettings({ ev: EV_STEPS[i - 1] });
              }}
              onInc={() => {
                const i = EV_STEPS.indexOf(cameraSettings.ev);
                if (i < EV_STEPS.length - 1) updateCameraSettings({ ev: EV_STEPS[i + 1] });
              }}
            />
            <SettingRow
              label="ISO"
              value={`${cameraSettings.iso}`}
              onDec={() => {
                const i = ISO_STEPS.indexOf(cameraSettings.iso);
                if (i > 0) updateCameraSettings({ iso: ISO_STEPS[i - 1] });
              }}
              onInc={() => {
                const i = ISO_STEPS.indexOf(cameraSettings.iso);
                if (i < ISO_STEPS.length - 1) updateCameraSettings({ iso: ISO_STEPS[i + 1] });
              }}
            />
            <SettingRow
              label="WB"
              value={cameraSettings.whiteBalance}
              onDec={() => {
                const i = WB_STEPS.indexOf(cameraSettings.whiteBalance);
                if (i > 0) updateCameraSettings({ whiteBalance: WB_STEPS[i - 1] });
              }}
              onInc={() => {
                const i = WB_STEPS.indexOf(cameraSettings.whiteBalance);
                if (i < WB_STEPS.length - 1) updateCameraSettings({ whiteBalance: WB_STEPS[i + 1] });
              }}
            />
            <SettingRow
              label="PROFILE"
              value={cameraSettings.colorProfile}
              onDec={() => {
                const i = PROFILE_STEPS.indexOf(cameraSettings.colorProfile);
                if (i > 0) updateCameraSettings({ colorProfile: PROFILE_STEPS[i - 1] });
              }}
              onInc={() => {
                const i = PROFILE_STEPS.indexOf(cameraSettings.colorProfile);
                if (i < PROFILE_STEPS.length - 1) updateCameraSettings({ colorProfile: PROFILE_STEPS[i + 1] });
              }}
            />
            <SettingRow
              label="SHUTTER"
              value={cameraSettings.shutterSpeed}
              onDec={() => {}}
              onInc={() => {}}
            />
          </View>
        </View>
      )}

      {/* Bottom controls bar */}
      <View style={[styles.controlsBar, { paddingBottom: bottomPad + 12 }]}>
        {/* Left controls */}
        <View style={styles.leftControls}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setShowColorPanel((v) => !v);
              Haptics.selectionAsync();
            }}
          >
            <MaterialCommunityIcons
              name="palette-outline"
              size={22}
              color={showColorPanel ? C.accent : C.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              const newZoom = cameraSettings.zoom < 4 ? cameraSettings.zoom + 0.5 : 1;
              updateCameraSettings({ zoom: newZoom });
              Haptics.selectionAsync();
            }}
          >
            <Text style={styles.zoomText}>{cameraSettings.zoom}x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              updateCameraSettings({ showBellyCamera: !cameraSettings.showBellyCamera });
              Haptics.selectionAsync();
            }}
          >
            <MaterialCommunityIcons
              name="camera-switch-outline"
              size={22}
              color={cameraSettings.showBellyCamera ? C.accent : C.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Center - shutter */}
        <Animated.View style={shutterStyle}>
          <TouchableOpacity onPress={onShutter} activeOpacity={0.85}>
            <View style={[styles.shutterOuter, isRecording && styles.shutterRecording]}>
              <View
                style={[
                  styles.shutterInner,
                  cameraMode === "video" && styles.shutterVideo,
                  isRecording && styles.shutterInnerRec,
                ]}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Right controls */}
        <View style={styles.rightControls}>
          <TouchableOpacity
            style={[styles.modeBtn, cameraMode === "photo" && styles.modeBtnActive]}
            onPress={() => {
              setCameraMode("photo");
              Haptics.selectionAsync();
            }}
          >
            <MaterialCommunityIcons
              name="camera-outline"
              size={20}
              color={cameraMode === "photo" ? C.accent : C.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, cameraMode === "video" && styles.modeBtnActive]}
            onPress={() => {
              setCameraMode("video");
              Haptics.selectionAsync();
            }}
          >
            <MaterialCommunityIcons
              name="video-outline"
              size={20}
              color={cameraMode === "video" ? C.danger : C.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="tune-variant" size={22} color={C.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function SettingRow({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingControl}>
        <TouchableOpacity onPress={onDec} style={styles.stepBtn}>
          <Ionicons name="chevron-back" size={14} color={C.accent} />
        </TouchableOpacity>
        <Text style={styles.settingValue}>{value}</Text>
        <TouchableOpacity onPress={onInc} style={styles.stepBtn}>
          <Ionicons name="chevron-forward" size={14} color={C.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  colorPanel: {
    position: "absolute",
    bottom: 140,
    left: 16,
    right: 16,
    backgroundColor: "rgba(12,12,20,0.94)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
    zIndex: 20,
  },
  panelTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: C.accent,
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: "center",
  },
  settingsGrid: { gap: 10 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    width: 70,
    letterSpacing: 0.5,
  },
  settingControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,212,255,0.08)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    flex: 1,
    justifyContent: "space-between",
  },
  stepBtn: { padding: 2 },
  settingValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
    flex: 1,
    textAlign: "center",
  },
  controlsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "rgba(10,10,15,0.8)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,212,255,0.1)",
  },
  leftControls: { flexDirection: "row", gap: 16, alignItems: "center", flex: 1 },
  rightControls: { flexDirection: "row", gap: 16, alignItems: "center", flex: 1, justifyContent: "flex-end" },
  iconBtn: { padding: 8 },
  zoomText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: C.text,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  shutterOuter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  shutterRecording: { borderColor: C.danger },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.white,
  },
  shutterVideo: { backgroundColor: C.danger },
  shutterInnerRec: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: C.danger,
  },
  modeBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modeBtnActive: {
    borderColor: "rgba(0,212,255,0.3)",
    backgroundColor: "rgba(0,212,255,0.08)",
  },
});
