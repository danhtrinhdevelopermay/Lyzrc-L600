package com.flycam.l600app.ui

import android.location.Location
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.flycam.l600app.R
import com.flycam.l600app.databinding.ActivityMapBinding
import com.flycam.l600app.data.repository.LocationRepository
import kotlinx.coroutines.launch

class MapActivity : AppCompatActivity(), OnMapReadyCallback {
    private lateinit var binding: ActivityMapBinding
    private lateinit var map: GoogleMap
    private val locationRepository = LocationRepository()
    private var droneLocation: LatLng? = null
    private var homeLocation: LatLng? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMapBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val mapFragment = supportFragmentManager.findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        setupUIListeners()
        observeLocation()
    }

    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap
        map.uiSettings.isZoomControlsEnabled = true
        map.uiSettings.isCompassEnabled = true

        lifecycleScope.launch {
            locationRepository.getCurrentLocation().let { location ->
                if (location != null) {
                    val latLng = LatLng(location.latitude, location.longitude)
                    homeLocation = latLng
                    map.addMarker(MarkerOptions().position(latLng).title("Home"))
                    map.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15f))
                }
            }
        }
    }

    private fun setupUIListeners() {
        binding.btnSetHome.setOnClickListener {
            lifecycleScope.launch {
                locationRepository.setHomeLocation()
            }
        }

        binding.btnGoHome.setOnClickListener {
            lifecycleScope.launch {
                locationRepository.returnToHome()
            }
        }

        binding.btnAddWaypoint.setOnClickListener {
            if (droneLocation != null) {
                map.addMarker(
                    MarkerOptions()
                        .position(droneLocation!!)
                        .title("Waypoint ${System.currentTimeMillis()}")
                )
                binding.tvStatus.text = "Waypoint added"
            }
        }

        binding.btnClearWaypoints.setOnClickListener {
            map.clear()
            if (homeLocation != null) {
                map.addMarker(MarkerOptions().position(homeLocation!!).title("Home"))
            }
            binding.tvStatus.text = "Waypoints cleared"
        }

        binding.btnStartMission.setOnClickListener {
            lifecycleScope.launch {
                locationRepository.startMission()
                binding.tvStatus.text = "Mission started"
            }
        }

        binding.btnAltitudeControl.setOnClickListener {
            // Show altitude control dialog
            binding.tvStatus.text = "Altitude control active"
        }
    }

    private fun observeLocation() {
        lifecycleScope.launch {
            locationRepository.droneLocation.collect { location ->
                droneLocation = location
                if (::map.isInitialized) {
                    map.addMarker(
                        MarkerOptions()
                            .position(location)
                            .title("Drone")
                    )
                }
                binding.tvDroneCoords.text = "Drone: ${location.latitude}, ${location.longitude}"
            }
        }
    }
}
