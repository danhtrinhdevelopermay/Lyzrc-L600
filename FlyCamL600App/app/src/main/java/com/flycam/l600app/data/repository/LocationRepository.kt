package com.flycam.l600app.data.repository

import android.location.Location
import com.google.android.gms.maps.model.LatLng
import com.flycam.l600app.data.api.DroneAPI
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class LocationRepository {
    private val droneAPI: DroneAPI

    private val _droneLocation = MutableStateFlow(LatLng(0.0, 0.0))
    val droneLocation: StateFlow<LatLng> = _droneLocation

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

    suspend fun getCurrentLocation(): Location? {
        return try {
            val data = droneAPI.getLocation()
            val location = Location("drone")
            location.latitude = data["latitude"] as? Double ?: 0.0
            location.longitude = data["longitude"] as? Double ?: 0.0
            _droneLocation.emit(LatLng(location.latitude, location.longitude))
            location
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun setHomeLocation() {
        // Send home location to drone via API
    }

    suspend fun returnToHome() {
        try {
            droneAPI.sendCommand(mapOf("command" to "return_home"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun startMission() {
        try {
            droneAPI.startMission()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun stopMission() {
        try {
            droneAPI.stopMission()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
