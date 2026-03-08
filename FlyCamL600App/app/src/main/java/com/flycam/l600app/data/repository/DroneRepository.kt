package com.flycam.l600app.data.repository

import androidx.lifecycle.MutableLiveData
import com.flycam.l600app.data.api.DroneAPI
import com.flycam.l600app.data.model.DroneStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class DroneRepository {
    private val droneAPI: DroneAPI

    private val _droneStatus = MutableStateFlow<DroneStatus>(
        DroneStatus(0, 0f, 0f, 0, 0, 0, 25, false, 0.0, 0.0)
    )
    val droneStatus: StateFlow<DroneStatus> = _droneStatus

    init {
        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl("http://192.168.1.100:8000/")
            .addConverterFactory(GsonConverterFactory.create())
            .client(okHttpClient)
            .build()

        droneAPI = retrofit.create(DroneAPI::class.java)
    }

    suspend fun sendCommand(command: String) {
        try {
            droneAPI.sendCommand(mapOf("command" to command))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun sendThrottleCommand(value: Float) {
        try {
            droneAPI.setThrottle(mapOf("throttle" to value))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun sendRotationCommand(angle: Float) {
        try {
            droneAPI.setRotation(mapOf("rotation" to angle))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun sendGimbalCommand(tilt: Float, pan: Float) {
        try {
            droneAPI.setGimbal(mapOf("tilt" to tilt, "pan" to pan))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun getStatus() {
        try {
            val status = droneAPI.getStatus()
            _droneStatus.emit(status)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
