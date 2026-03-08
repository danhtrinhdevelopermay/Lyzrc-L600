package com.flycam.l600app.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.flycam.l600app.R
import com.flycam.l600app.databinding.ActivityMainBinding
import com.flycam.l600app.service.DroneConnectionService

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val PERMISSION_REQUEST_CODE = 100

    private val requiredPermissions = arrayOf(
        Manifest.permission.CAMERA,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.INTERNET,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.BLUETOOTH
    ).apply {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            plus(Manifest.permission.BLUETOOTH_SCAN)
            plus(Manifest.permission.BLUETOOTH_CONNECT)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Check and request permissions
        if (!allPermissionsGranted()) {
            ActivityCompat.requestPermissions(this, requiredPermissions, PERMISSION_REQUEST_CODE)
        } else {
            initializeApp()
        }
    }

    private fun initializeApp() {
        // Start drone connection service
        val droneServiceIntent = Intent(this, DroneConnectionService::class.java)
        startService(droneServiceIntent)

        setupUIListeners()
    }

    private fun setupUIListeners() {
        binding.btnDroneControl.setOnClickListener {
            startActivity(Intent(this, DroneControlActivity::class.java))
        }

        binding.btnCamera.setOnClickListener {
            startActivity(Intent(this, CameraActivity::class.java))
        }

        binding.btnMap.setOnClickListener {
            startActivity(Intent(this, MapActivity::class.java))
        }

        binding.btnSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
    }

    private fun allPermissionsGranted(): Boolean {
        return requiredPermissions.all { permission ->
            ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (allPermissionsGranted()) {
                initializeApp()
            }
        }
    }
}
