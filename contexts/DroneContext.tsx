import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from "react";

export type DroneStatus = "disconnected" | "connecting" | "connected" | "flying" | "returning" | "landing";
export type FlightMode = "GPS" | "ATTI" | "SPORT" | "CINEMATIC";
export type CameraMode = "photo" | "video";

export interface TelemetryData {
  altitude: number;
  speed: number;
  distance: number;
  battery: number;
  batteryVoltage: number;
  gpsSignal: number;
  gpsSatellites: number;
  windSpeed: number;
  latitude: number;
  longitude: number;
  heading: number;
  pitch: number;
  roll: number;
  yaw: number;
  vspeed: number;
  hspeed: number;
  flightTime: number;
  homeDistance: number;
  signalStrength: number;
  temperature: number;
  motorStatus: [boolean, boolean, boolean, boolean];
}

export interface CameraSettings {
  ev: number;
  iso: number;
  shutterSpeed: string;
  whiteBalance: string;
  colorProfile: string;
  zoom: number;
  resolution: string;
  fps: number;
  showBellyCamera: boolean;
}

export interface FlightPath {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: number;
}

interface DroneContextValue {
  status: DroneStatus;
  flightMode: FlightMode;
  telemetry: TelemetryData;
  cameraSettings: CameraSettings;
  cameraMode: CameraMode;
  isRecording: boolean;
  isArmed: boolean;
  flightPath: FlightPath[];
  mediaCount: { photos: number; videos: number };
  connect: () => void;
  disconnect: () => void;
  arm: () => void;
  disarm: () => void;
  takeOff: () => void;
  land: () => void;
  returnHome: () => void;
  setFlightMode: (mode: FlightMode) => void;
  setCameraMode: (mode: CameraMode) => void;
  capturePhoto: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  updateCameraSettings: (settings: Partial<CameraSettings>) => void;
}

const DroneContext = createContext<DroneContextValue | null>(null);

const BASE_LAT = 21.0285;
const BASE_LON = 105.8542;

function generateInitialTelemetry(): TelemetryData {
  return {
    altitude: 0,
    speed: 0,
    distance: 0,
    battery: 87,
    batteryVoltage: 15.4,
    gpsSignal: 5,
    gpsSatellites: 14,
    windSpeed: 2.3,
    latitude: BASE_LAT,
    longitude: BASE_LON,
    heading: 45,
    pitch: 0,
    roll: 0,
    yaw: 0,
    vspeed: 0,
    hspeed: 0,
    flightTime: 0,
    homeDistance: 0,
    signalStrength: 98,
    temperature: 38,
    motorStatus: [true, true, true, true],
  };
}

export function DroneProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<DroneStatus>("disconnected");
  const [flightMode, setFlightModeState] = useState<FlightMode>("GPS");
  const [telemetry, setTelemetry] = useState<TelemetryData>(generateInitialTelemetry());
  const [cameraMode, setCameraModeState] = useState<CameraMode>("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [flightPath, setFlightPath] = useState<FlightPath[]>([]);
  const [mediaCount, setMediaCount] = useState({ photos: 12, videos: 3 });
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    ev: 0,
    iso: 100,
    shutterSpeed: "1/500",
    whiteBalance: "Auto",
    colorProfile: "D-Log M",
    zoom: 1,
    resolution: "4K 30fps",
    fps: 30,
    showBellyCamera: true,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (status === "connected" || status === "flying") {
      intervalRef.current = setInterval(() => {
        timeRef.current += 1;
        setTelemetry((prev) => {
          const isFlying = status === "flying";
          const newAlt = isFlying ? Math.min(120, prev.altitude + (Math.random() - 0.45) * 0.8) : Math.max(0, prev.altitude - 0.3);
          const newBat = Math.max(5, prev.battery - 0.008);
          const dLat = isFlying ? (Math.random() - 0.5) * 0.00005 : 0;
          const dLon = isFlying ? (Math.random() - 0.5) * 0.00005 : 0;
          const newLat = prev.latitude + dLat;
          const newLon = prev.longitude + dLon;
          const dist = Math.sqrt(Math.pow((newLat - BASE_LAT) * 111000, 2) + Math.pow((newLon - BASE_LON) * 111000, 2));
          const newHeading = (prev.heading + (Math.random() - 0.5) * 2) % 360;
          const newSpeed = isFlying ? Math.max(0, Math.min(18, prev.speed + (Math.random() - 0.45) * 1.2)) : 0;
          const newVspeed = isFlying ? (Math.random() - 0.5) * 1.5 : 0;
          const newPitch = isFlying ? (Math.random() - 0.5) * 6 : 0;
          const newRoll = isFlying ? (Math.random() - 0.5) * 4 : 0;
          const newWind = Math.max(0, Math.min(12, prev.windSpeed + (Math.random() - 0.5) * 0.3));
          const newTemp = Math.max(35, Math.min(55, prev.temperature + (Math.random() - 0.48) * 0.2));
          const newSats = Math.max(10, Math.min(18, prev.gpsSatellites + (Math.random() > 0.95 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
          const newSignal = Math.max(70, Math.min(100, prev.signalStrength + (Math.random() - 0.5) * 2));

          if (isFlying && timeRef.current % 3 === 0) {
            setFlightPath((fp) => [
              ...fp.slice(-100),
              { latitude: newLat, longitude: newLon, altitude: newAlt, timestamp: Date.now() },
            ]);
          }

          return {
            ...prev,
            altitude: Math.max(0, newAlt),
            speed: Math.max(0, newSpeed),
            distance: dist,
            battery: newBat,
            batteryVoltage: Math.max(12, prev.batteryVoltage - 0.001),
            gpsSignal: newSats > 12 ? 5 : newSats > 8 ? 4 : 3,
            gpsSatellites: newSats,
            windSpeed: newWind,
            latitude: newLat,
            longitude: newLon,
            heading: (newHeading + 360) % 360,
            pitch: newPitch,
            roll: newRoll,
            yaw: (prev.yaw + (Math.random() - 0.5) * 1) % 360,
            vspeed: newVspeed,
            hspeed: newSpeed,
            flightTime: isFlying ? timeRef.current : prev.flightTime,
            homeDistance: dist,
            signalStrength: newSignal,
            temperature: newTemp,
            motorStatus: [true, true, true, true],
          };
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const connect = () => {
    setStatus("connecting");
    setTimeout(() => setStatus("connected"), 2000);
  };

  const disconnect = () => {
    setStatus("disconnected");
    setIsArmed(false);
    setFlightPath([]);
    timeRef.current = 0;
  };

  const arm = () => setIsArmed(true);
  const disarm = () => setIsArmed(false);

  const takeOff = () => {
    if (status === "connected" || status === "flying") {
      setStatus("flying");
    }
  };

  const land = () => {
    setStatus("landing");
    setTimeout(() => setStatus("connected"), 3000);
  };

  const returnHome = () => {
    setStatus("returning");
    setTimeout(() => setStatus("connected"), 5000);
  };

  const setFlightMode = (mode: FlightMode) => setFlightModeState(mode);
  const setCameraMode = (mode: CameraMode) => setCameraModeState(mode);

  const capturePhoto = () => {
    setMediaCount((prev) => ({ ...prev, photos: prev.photos + 1 }));
  };

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => {
    setIsRecording(false);
    setMediaCount((prev) => ({ ...prev, videos: prev.videos + 1 }));
  };

  const updateCameraSettings = (settings: Partial<CameraSettings>) => {
    setCameraSettings((prev) => ({ ...prev, ...settings }));
  };

  const value = useMemo(
    () => ({
      status,
      flightMode,
      telemetry,
      cameraSettings,
      cameraMode,
      isRecording,
      isArmed,
      flightPath,
      mediaCount,
      connect,
      disconnect,
      arm,
      disarm,
      takeOff,
      land,
      returnHome,
      setFlightMode,
      setCameraMode,
      capturePhoto,
      startRecording,
      stopRecording,
      updateCameraSettings,
    }),
    [status, flightMode, telemetry, cameraSettings, cameraMode, isRecording, isArmed, flightPath, mediaCount]
  );

  return <DroneContext.Provider value={value}>{children}</DroneContext.Provider>;
}

export function useDrone() {
  const ctx = useContext(DroneContext);
  if (!ctx) throw new Error("useDrone must be used within DroneProvider");
  return ctx;
}
