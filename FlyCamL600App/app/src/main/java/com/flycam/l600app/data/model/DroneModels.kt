package com.flycam.l600app.data.model

// Commands
object DroneCommand {
    const val TAKEOFF = "takeoff"
    const val LAND = "land"
    const val EMERGENCY_STOP = "emergency_stop"
    const val RETURN_HOME = "return_home"
    const val SET_GPS_MODE = "set_gps_mode"
    const val SET_OPTICAL_FLOW_MODE = "set_optical_flow_mode"
}

enum class ControlMode {
    GPS, OPTICAL_FLOW, MANUAL
}

data class DroneStatus(
    val batteryLevel: Int,
    val altitude: Float,
    val speed: Float,
    val signalStrength: Int,
    val flightTime: Int,
    val gpsSatellites: Int,
    val temperature: Int,
    val isFlying: Boolean,
    val latitude: Double,
    val longitude: Double
)

data class CameraSettings(
    val resolution: String,
    val fps: Int,
    val iso: Int,
    val exposure: Float,
    val whiteBalance: String,
    val zoom: Float,
    val gimbalTilt: Float,
    val gimbalPan: Float
)

data class Settings(
    val wifiMode: Boolean,
    val droneIP: String,
    val port: Int,
    val stabilizationEnabled: Boolean,
    val advancedMode: Boolean,
    val maxSpeed: Float,
    val maxAltitude: Float,
    val gpsEnabled: Boolean,
    val motionTrackingEnabled: Boolean,
    val firmwareVersion: String
)
