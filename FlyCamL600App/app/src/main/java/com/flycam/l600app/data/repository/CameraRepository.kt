package com.flycam.l600app.data.repository

import androidx.lifecycle.MutableLiveData
import com.flycam.l600app.data.api.DroneAPI
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.util.concurrent.TimeUnit

class CameraRepository {
    private val droneAPI: DroneAPI

    private val _isRecording = MutableStateFlow(false)
    val isRecording: StateFlow<Boolean> = _isRecording

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

    suspend fun setGimbalTilt(tilt: Float) {
        try {
            droneAPI.setGimbal(mapOf("tilt" to tilt, "pan" to 0f))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun setZoom(zoomLevel: Float) {
        // Implement camera zoom via API
    }

    suspend fun setResolution(resolution: String) {
        // Implement resolution setting via API
    }

    suspend fun setFps(fps: Int) {
        // Implement FPS setting via API
    }

    suspend fun setPhotoFormat(format: String) {
        // Implement photo format setting via API
    }

    suspend fun uploadPhoto(file: File) {
        // Implement photo upload via API
    }

    suspend fun startRecording() {
        try {
            droneAPI.startRecording()
            _isRecording.emit(true)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun stopRecording() {
        try {
            droneAPI.stopRecording()
            _isRecording.emit(false)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
