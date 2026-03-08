# FlyCam L600 Pro Max Controller

Ứng dụng Android để điều khiển drone FlyCam L600 Pro Max tương tự DJI Fly.

## Tính Năng

- **Điều Khiển Drone**: Takeoff, landing, rotation, throttle control
- **Camera**: Chụp ảnh, quay video, điều chỉnh gimbal, zoom
- **GPS & Bản Đồ**: Theo dõi vị trí drone, điều chỉnh waypoints, mission planning
- **Telemetry**: Theo dõi pin, độ cao, tốc độ, GPS, tín hiệu
- **Cài Đặt**: Kết nối WiFi/USB, calibration, cập nhật firmware
- **Chế Độ Bay**: GPS Mode, Optical Flow Mode
- **Return Home**: Tự động quay về nhà

## Requirements

- Android 5.0+ (API 21)
- Android Studio
- Gradle 8.0+
- Kotlin 1.9.0+

## Build

```bash
./gradlew assembleDebug      # Build debug APK
./gradlew assembleRelease    # Build release APK
```

## GitHub Actions CI/CD

Ứng dụng có thể tự động build APK trên GitHub Actions.

### Setup:

1. Fork repository
2. Thêm secrets vào GitHub:
   - `SIGNING_KEY`: Base64 encoded keystore
   - `ALIAS`: Alias key trong keystore
   - `KEY_STORE_PASSWORD`: Keystore password
   - `KEY_PASSWORD`: Key password
3. Push code hoặc tạo tag để trigger build

## API Configuration

Mặc định kết nối tới `192.168.1.100:8000`. Thay đổi trong SettingsActivity hoặc DroneAPI.

## Project Structure

```
FlyCamL600App/
├── app/
│   ├── src/main/
│   │   ├── java/com/flycam/l600app/
│   │   │   ├── ui/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── DroneControlActivity.kt
│   │   │   │   ├── CameraActivity.kt
│   │   │   │   ├── MapActivity.kt
│   │   │   │   └── SettingsActivity.kt
│   │   │   ├── service/
│   │   │   │   ├── DroneConnectionService.kt
│   │   │   │   └── TelemetryService.kt
│   │   │   └── data/
│   │   │       ├── api/
│   │   │       │   └── DroneAPI.kt
│   │   │       ├── model/
│   │   │       │   └── DroneModels.kt
│   │   │       └── repository/
│   │   │           ├── DroneRepository.kt
│   │   │           ├── CameraRepository.kt
│   │   │           ├── LocationRepository.kt
│   │   │           └── SettingsRepository.kt
│   │   └── res/
│   │       ├── layout/
│   │       ├── values/
│   │       └── ...
│   └── build.gradle
├── build.gradle
├── settings.gradle
├── gradle.properties
└── .github/workflows/build.yml
```

## Dependencies

- AndroidX (Core, AppCompat, ConstraintLayout)
- Lifecycle (Runtime, ViewModel)
- Navigation (Fragment, UI)
- Google Maps & Location Services
- Retrofit 2 & OkHttp 3
- Gson
- Kotlin Coroutines
- AndroidX Camera

## License

MIT License
