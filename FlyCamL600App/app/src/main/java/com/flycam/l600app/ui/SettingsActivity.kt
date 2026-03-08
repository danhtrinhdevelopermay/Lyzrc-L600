package com.flycam.l600app.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.flycam.l600app.databinding.ActivitySettingsBinding
import com.flycam.l600app.data.repository.SettingsRepository
import kotlinx.coroutines.launch

class SettingsActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySettingsBinding
    private val settingsRepository = SettingsRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        loadSettings()
        setupListeners()
    }

    private fun loadSettings() {
        lifecycleScope.launch {
            settingsRepository.loadSettings().let { settings ->
                binding.swConnectionMode.isChecked = settings.wifiMode
                binding.etDroneIP.setText(settings.droneIP)
                binding.etPort.setText(settings.port.toString())
                binding.swStabilization.isChecked = settings.stabilizationEnabled
                binding.swAdvancedMode.isChecked = settings.advancedMode
                binding.etMaxSpeed.setText(settings.maxSpeed.toString())
                binding.etMaxAltitude.setText(settings.maxAltitude.toString())
                binding.swGPS.isChecked = settings.gpsEnabled
                binding.swMotionTracking.isChecked = settings.motionTrackingEnabled
                binding.etFirmwareVersion.setText(settings.firmwareVersion)
            }
        }
    }

    private fun setupListeners() {
        binding.btnConnect.setOnClickListener {
            lifecycleScope.launch {
                val ip = binding.etDroneIP.text.toString()
                val port = binding.etPort.text.toString().toIntOrNull() ?: 8000
                settingsRepository.connectToDrone(ip, port)
                binding.tvStatus.text = "Connecting to $ip:$port"
            }
        }

        binding.btnCalibrate.setOnClickListener {
            lifecycleScope.launch {
                settingsRepository.calibrateIMU()
                binding.tvStatus.text = "IMU Calibration started"
            }
        }

        binding.btnCalibrateCompass.setOnClickListener {
            lifecycleScope.launch {
                settingsRepository.calibrateCompass()
                binding.tvStatus.text = "Compass Calibration started"
            }
        }

        binding.btnFactoryReset.setOnClickListener {
            lifecycleScope.launch {
                settingsRepository.factoryReset()
                binding.tvStatus.text = "Factory reset completed"
            }
        }

        binding.swConnectionMode.setOnCheckedChangeListener { _, isChecked ->
            lifecycleScope.launch {
                settingsRepository.setConnectionMode(if (isChecked) "WiFi" else "USB")
            }
        }

        binding.swStabilization.setOnCheckedChangeListener { _, isChecked ->
            lifecycleScope.launch {
                settingsRepository.setStabilization(isChecked)
            }
        }

        binding.swAdvancedMode.setOnCheckedChangeListener { _, isChecked ->
            lifecycleScope.launch {
                settingsRepository.setAdvancedMode(isChecked)
            }
        }

        binding.swGPS.setOnCheckedChangeListener { _, isChecked ->
            lifecycleScope.launch {
                settingsRepository.setGPS(isChecked)
            }
        }

        binding.swMotionTracking.setOnCheckedChangeListener { _, isChecked ->
            lifecycleScope.launch {
                settingsRepository.setMotionTracking(isChecked)
            }
        }

        binding.btnUpdateFirmware.setOnClickListener {
            lifecycleScope.launch {
                settingsRepository.checkFirmwareUpdate()
                binding.tvStatus.text = "Checking for firmware updates..."
            }
        }

        binding.btnAbout.setOnClickListener {
            binding.tvStatus.text = "FlyCam L600 Pro Max Controller v1.0.0"
        }
    }
}
