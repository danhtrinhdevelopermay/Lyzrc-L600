package com.flycam.l600app.data.api

import com.flycam.l600app.data.model.DroneStatus
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface DroneAPI {
    @GET("/api/status")
    suspend fun getStatus(): DroneStatus

    @POST("/api/command")
    suspend fun sendCommand(@Body command: Map<String, String>)

    @POST("/api/throttle")
    suspend fun setThrottle(@Body data: Map<String, Float>)

    @POST("/api/rotation")
    suspend fun setRotation(@Body data: Map<String, Float>)

    @POST("/api/gimbal")
    suspend fun setGimbal(@Body data: Map<String, Float>)

    @POST("/api/camera/capture")
    suspend fun capturePhoto()

    @POST("/api/camera/record")
    suspend fun startRecording()

    @POST("/api/camera/stop")
    suspend fun stopRecording()

    @GET("/api/location")
    suspend fun getLocation(): Map<String, Double>

    @POST("/api/mission/start")
    suspend fun startMission()

    @POST("/api/mission/stop")
    suspend fun stopMission()
}
