import React, { useRef, useCallback } from "react";
import { View, StyleSheet, PanResponder, Text } from "react-native";
import * as Haptics from "expo-haptics";
import C from "@/constants/colors";

interface JoystickProps {
  label: string;
  onMove?: (x: number, y: number) => void;
  size?: number;
}

const JOYSTICK_RADIUS = 52;
const THUMB_RADIUS = 22;

export default function VirtualJoystick({ label, onMove, size = JOYSTICK_RADIUS * 2 }: JoystickProps) {
  const thumbPos = useRef({ x: 0, y: 0 });
  const [thumbXY, setThumbXY] = React.useState({ x: 0, y: 0 });
  const hasVibrated = useRef(false);
  const centerX = size / 2;
  const centerY = size / 2;
  const maxOffset = size / 2 - THUMB_RADIUS - 4;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (!hasVibrated.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          hasVibrated.current = true;
        }
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx;
        const dy = gestureState.dy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let nx = dx;
        let ny = dy;
        if (dist > maxOffset) {
          nx = (dx / dist) * maxOffset;
          ny = (dy / dist) * maxOffset;
        }
        thumbPos.current = { x: nx, y: ny };
        setThumbXY({ x: nx, y: ny });
        if (onMove) onMove(nx / maxOffset, ny / maxOffset);
      },
      onPanResponderRelease: () => {
        thumbPos.current = { x: 0, y: 0 };
        setThumbXY({ x: 0, y: 0 });
        hasVibrated.current = false;
        if (onMove) onMove(0, 0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderTerminate: () => {
        thumbPos.current = { x: 0, y: 0 };
        setThumbXY({ x: 0, y: 0 });
        hasVibrated.current = false;
        if (onMove) onMove(0, 0);
      },
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}
        {...panResponder.panHandlers}
      >
        {/* Crosshair lines */}
        <View style={styles.hLine} />
        <View style={styles.vLine} />
        {/* Rings */}
        <View style={[styles.ring, { width: size * 0.55, height: size * 0.55, borderRadius: size * 0.55 / 2 }]} />

        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: centerX - THUMB_RADIUS + thumbXY.x,
              top: centerY - THUMB_RADIUS + thumbXY.y,
            },
          ]}
        >
          <View style={styles.thumbInner} />
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: 4 },
  base: {
    backgroundColor: "rgba(0,212,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(0,212,255,0.25)",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  hLine: {
    position: "absolute",
    width: "75%",
    height: 1,
    backgroundColor: "rgba(0,212,255,0.12)",
  },
  vLine: {
    position: "absolute",
    height: "75%",
    width: 1,
    backgroundColor: "rgba(0,212,255,0.12)",
  },
  ring: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.1)",
    backgroundColor: "transparent",
  },
  thumb: {
    position: "absolute",
    width: THUMB_RADIUS * 2,
    height: THUMB_RADIUS * 2,
    borderRadius: THUMB_RADIUS,
    backgroundColor: "rgba(0,212,255,0.22)",
    borderWidth: 2,
    borderColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
