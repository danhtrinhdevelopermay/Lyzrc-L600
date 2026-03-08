package com.flycam.l600app.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.flycam.l600app.databinding.ActivityCameraBinding
import com.flycam.l600app.data.repository.CameraRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale

class CameraActivity : AppCompatActivity() {
    private lateinit var binding: ActivityCameraBinding
    private lateinit var imageCapture: ImageCapture
    private val cameraRepository = CameraRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCameraBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        }

        setupUIListeners()
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(binding.previewView.surfaceProvider)
            }

            imageCapture = ImageCapture.Builder()
                .setTargetRotation(windowManager.defaultDisplay.rotation)
                .build()

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture)
            } catch (exc: Exception) {
                exc.printStackTrace()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun setupUIListeners() {
        // Photo capture
        binding.btnCapturePhoto.setOnClickListener {
            capturePhoto()
        }

        // Start/Stop recording
        binding.btnRecord.setOnClickListener {
            startRecording()
        }

        // Gimbal controls
        binding.sbGimbalTilt.setOnSeekBarChangeListener(object : android.widget.SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: android.widget.SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    val tilt = (progress - 50) * 1.8f
                    lifecycleScope.launch {
                        cameraRepository.setGimbalTilt(tilt)
                    }
                }
            }

            override fun onStartTrackingTouch(seekBar: android.widget.SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: android.widget.SeekBar?) {}
        })

        // Zoom control
        binding.sbZoom.setOnSeekBarChangeListener(object : android.widget.SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: android.widget.SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    val zoomLevel = 1f + (progress / 10f)
                    binding.tvZoomLevel.text = "Zoom: ${String.format("%.1f", zoomLevel)}x"
                    lifecycleScope.launch {
                        cameraRepository.setZoom(zoomLevel)
                    }
                }
            }

            override fun onStartTrackingTouch(seekBar: android.widget.SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: android.widget.SeekBar?) {}
        })

        // Resolution selector
        binding.spinnerResolution.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                val resolutions = arrayOf("1080p", "2K", "4K", "8K")
                lifecycleScope.launch {
                    cameraRepository.setResolution(resolutions[position])
                }
            }

            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        }

        // FPS selector
        binding.spinnerFps.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                val fps = intArrayOf(24, 30, 48, 60)[position]
                lifecycleScope.launch {
                    cameraRepository.setFps(fps)
                }
            }

            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        }

        // Photo format
        binding.rgPhotoFormat.setOnCheckedChangeListener { _, checkedId ->
            val format = when (checkedId) {
                binding.rbJpeg.id -> "JPEG"
                binding.rbRaw.id -> "RAW"
                else -> "JPEG"
            }
            lifecycleScope.launch {
                cameraRepository.setPhotoFormat(format)
            }
        }
    }

    private fun capturePhoto() {
        val timestamp = SimpleDateFormat("yyyy-MM-dd-HH-mm-ss-SSS", Locale.US).format(System.currentTimeMillis())
        val photoFile = java.io.File(getExternalFilesDir(null), "IMG_$timestamp.jpg")

        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        imageCapture.takePicture(outputOptions, ContextCompat.getMainExecutor(this),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    binding.tvStatus.text = "Photo saved: ${photoFile.absolutePath}"
                    lifecycleScope.launch {
                        cameraRepository.uploadPhoto(photoFile)
                    }
                }

                override fun onError(exc: ImageCaptureException) {
                    binding.tvStatus.text = "Photo capture failed: ${exc.message}"
                }
            }
        )
    }

    private fun startRecording() {
        lifecycleScope.launch {
            val isRecording = cameraRepository.isRecording.value
            if (isRecording) {
                cameraRepository.stopRecording()
                binding.btnRecord.text = "Start Recording"
            } else {
                cameraRepository.startRecording()
                binding.btnRecord.text = "Stop Recording"
            }
        }
    }
}
