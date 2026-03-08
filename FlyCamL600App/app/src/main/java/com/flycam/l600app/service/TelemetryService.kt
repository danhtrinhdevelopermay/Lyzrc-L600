package com.flycam.l600app.service

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class TelemetryService : Service() {
    private val binder = LocalBinder()
    private val serviceScope = CoroutineScope(Dispatchers.Main)

    val telemetryData = MutableLiveData<Map<String, Any>>()

    override fun onCreate() {
        super.onCreate()
        startTelemetryUpdates()
    }

    private fun startTelemetryUpdates() {
        serviceScope.launch {
            while (true) {
                val data = mapOf(
                    "timestamp" to System.currentTimeMillis(),
                    "batteryLevel" to (50..100).random(),
                    "altitude" to (0..100).random(),
                    "speed" to (0..20).random(),
                    "temperature" to (20..40).random(),
                    "gpsSatellites" to (4..20).random(),
                    "signalStrength" to (30..100).random()
                )
                telemetryData.postValue(data)
                delay(1000) // Update every second
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent): IBinder {
        return binder
    }

    inner class LocalBinder : Binder() {
        fun getService(): TelemetryService = this@TelemetryService
    }
}
