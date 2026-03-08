package com.flycam.l600app.service

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import androidx.lifecycle.MutableLiveData
import com.flycam.l600app.data.api.DroneAPI
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class DroneConnectionService : Service() {
    private val binder = LocalBinder()
    private lateinit var retrofit: Retrofit
    private lateinit var droneAPI: DroneAPI
    private val serviceScope = CoroutineScope(Dispatchers.Main)

    val connectionStatus = MutableLiveData<Boolean>(false)
    val batteryLevel = MutableLiveData<Int>(0)
    val flightTime = MutableLiveData<Int>(0)

    override fun onCreate() {
        super.onCreate()
        initializeRetrofit()
        startConnectionListener()
    }

    private fun initializeRetrofit() {
        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .build()

        retrofit = Retrofit.Builder()
            .baseUrl("http://192.168.1.100:8000/")
            .addConverterFactory(GsonConverterFactory.create())
            .client(okHttpClient)
            .build()

        droneAPI = retrofit.create(DroneAPI::class.java)
    }

    private fun startConnectionListener() {
        serviceScope.launch {
            try {
                val response = droneAPI.getStatus()
                connectionStatus.postValue(true)
                batteryLevel.postValue(response.batteryLevel)
                flightTime.postValue(response.flightTime)
            } catch (e: Exception) {
                connectionStatus.postValue(false)
            }
        }
    }

    fun sendCommand(command: String) {
        serviceScope.launch {
            try {
                droneAPI.sendCommand(mapOf("command" to command))
            } catch (e: Exception) {
                e.printStackTrace()
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
        fun getService(): DroneConnectionService = this@DroneConnectionService
    }
}
