package com.flycam.l600app.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.flycam.l600app.data.api.DroneAPI
import com.flycam.l600app.data.model.Settings
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class SettingsRepository(private val context: Context? = null) {
    private val droneAPI: DroneAPI
    private val prefs: SharedPreferences? = context?.getSharedPreferences("drone_settings", Context.MODE_PRIVATE)

    init {
        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl("http://192.168.1.100:8000/")
            .addConverterFactory(GsonConverterFactory.create())
            .client(okHttpClient)
            .build()

        droneAPI = retrofit.create(DroneAPI::class.java)
    }

    suspend fun loadSettings(): Settings {
        return Settings(
            wifiMode = prefs?.getBoolean("wifi_mode", true) ?: true,
            droneIP = prefs?.getString("drone_ip", "192.168.1.100") ?: "192.168.1.100",
            port = prefs?.getInt("port", 8000) ?: 8000,
            stabilizationEnabled = prefs?.getBoolean("stabilization", true) ?: true,
            advancedMode = prefs?.getBoolean("advanced_mode", false) ?: false,
            maxSpeed = prefs?.getFloat("max_speed", 20f) ?: 20f,
            maxAltitude = prefs?.getFloat("max_altitude", 500f) ?: 500f,
            gpsEnabled = prefs?.getBoolean("gps_enabled", true) ?: true,
            motionTrackingEnabled = prefs?.getBoolean("motion_tracking", false) ?: false,
            firmwareVersion = prefs?.getString("firmware_version", "v1.0.0") ?: "v1.0.0"
        )
    }

    suspend fun connectToDrone(ip: String, port: Int) {
        prefs?.edit()?.apply {
            putString("drone_ip", ip)
            putInt("port", port)
            apply()
        }
    }

    suspend fun calibrateIMU() {
        droneAPI.sendCommand(mapOf("command" to "calibrate_imu"))
    }

    suspend fun calibrateCompass() {
        droneAPI.sendCommand(mapOf("command" to "calibrate_compass"))
    }

    suspend fun factoryReset() {
        droneAPI.sendCommand(mapOf("command" to "factory_reset"))
    }

    suspend fun setConnectionMode(mode: String) {
        prefs?.edit()?.putString("connection_mode", mode)?.apply()
    }

    suspend fun setStabilization(enabled: Boolean) {
        prefs?.edit()?.putBoolean("stabilization", enabled)?.apply()
    }

    suspend fun setAdvancedMode(enabled: Boolean) {
        prefs?.edit()?.putBoolean("advanced_mode", enabled)?.apply()
    }

    suspend fun setGPS(enabled: Boolean) {
        prefs?.edit()?.putBoolean("gps_enabled", enabled)?.apply()
    }

    suspend fun setMotionTracking(enabled: Boolean) {
        prefs?.edit()?.putBoolean("motion_tracking", enabled)?.apply()
    }

    suspend fun checkFirmwareUpdate() {
        // Implement firmware update check
    }
}
