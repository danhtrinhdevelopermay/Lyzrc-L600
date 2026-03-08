package com.flycam.l600app.ui

import android.os.Bundle
import android.widget.SeekBar
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.flycam.l600app.databinding.ActivityDroneControlBinding
import com.flycam.l600app.data.model.DroneCommand
import com.flycam.l600app.data.model.ControlMode
import com.flycam.l600app.data.repository.DroneRepository
import kotlinx.coroutines.launch

class DroneControlActivity : AppCompatActivity() {
    private lateinit var binding: ActivityDroneControlBinding
    private val droneRepository = DroneRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDroneControlBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        observeStatus()
    }

    private fun setupUI() {
        // Takeoff/Landing buttons
        binding.btnTakeoff.setOnClickListener {
            sendCommand(DroneCommand.TAKEOFF)
        }

        binding.btnLand.setOnClickListener {
            sendCommand(DroneCommand.LAND)
        }

        binding.btnEmergencyStop.setOnClickListener {
            sendCommand(DroneCommand.EMERGENCY_STOP)
        }

        // Throttle control
        binding.sbThrottle.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    val throttleValue = (progress / 100f) * 100
                    binding.tvThrottleValue.text = "Throttle: ${String.format("%.1f", throttleValue)}%"
                    sendThrottleCommand(throttleValue)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        // Rotation control
        binding.sbRotation.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    val rotation = (progress - 50) * 3.6f // -180 to 180 degrees
                    binding.tvRotationValue.text = "Rotation: ${String.format("%.1f", rotation)}°"
                    sendRotationCommand(rotation)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        // Flight mode switches
        binding.rbGps.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                sendCommand(DroneCommand.SET_GPS_MODE)
            }
        }

        binding.rbOpticalFlow.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                sendCommand(DroneCommand.SET_OPTICAL_FLOW_MODE)
            }
        }

        // Return to home
        binding.btnReturnHome.setOnClickListener {
            sendCommand(DroneCommand.RETURN_HOME)
        }

        // Gimbal control
        binding.sbGimbalTilt.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    val tilt = (progress - 50) * 1.8f // -90 to 90 degrees
                    sendGimbalCommand(tilt, 0f)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
    }

    private fun sendCommand(command: String) {
        lifecycleScope.launch {
            droneRepository.sendCommand(command)
        }
    }

    private fun sendThrottleCommand(value: Float) {
        lifecycleScope.launch {
            droneRepository.sendThrottleCommand(value)
        }
    }

    private fun sendRotationCommand(angle: Float) {
        lifecycleScope.launch {
            droneRepository.sendRotationCommand(angle)
        }
    }

    private fun sendGimbalCommand(tilt: Float, pan: Float) {
        lifecycleScope.launch {
            droneRepository.sendGimbalCommand(tilt, pan)
        }
    }

    private fun observeStatus() {
        lifecycleScope.launch {
            droneRepository.droneStatus.collect { status ->
                binding.apply {
                    tvBatteryLevel.text = "Battery: ${status.batteryLevel}%"
                    tvAltitude.text = "Altitude: ${String.format("%.1f", status.altitude)}m"
                    tvSpeed.text = "Speed: ${String.format("%.1f", status.speed)}m/s"
                    tvSignalStrength.text = "Signal: ${status.signalStrength}%"
                    tvFlightTime.text = "Flight Time: ${status.flightTime}s"
                    tvGpsStatus.text = "GPS: ${status.gpsSatellites} satellites"
                }
            }
        }
    }
}
