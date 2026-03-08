# GitHub Actions - Build APK Configuration

Hướng dẫn cấu hình GitHub Actions để tự động build APK cho ứng dụng FlyCam L600.

## Quick Start

### 0. Setup Gradle Wrapper (Nếu chưa có gradlew)

Nếu `gradlew` chưa tồn tại, tạo nó bằng lệnh:

```bash
gradle wrapper --gradle-version 8.1.0
```

Sau đó commit files:
```bash
git add gradle/wrapper/ gradlew gradlew.bat
git commit -m "Add gradle wrapper"
git push origin main
```

### 1. Tạo Keystore (Lần Đầu)

Trên máy local, chạy lệnh sau để tạo keystore:

```bash
keytool -genkey -v -keystore flycam.keystore -keyalg RSA -keysize 2048 -validity 10000 \
  -alias flycam_key \
  -storepass your_keystore_password \
  -keypass your_key_password \
  -dname "CN=FlyCam,O=FlyCam,C=VN"
```

Thay thế các giá trị:
- `your_keystore_password` - Mật khẩu keystore
- `your_key_password` - Mật khẩu key
- `flycam_key` - Tên alias key

### 2. Encode Keystore thành Base64

```bash
base64 -i flycam.keystore
```

Copy toàn bộ output (chuỗi base64 dài)

### 3. Thêm GitHub Secrets

Trên GitHub, vào:
**Settings → Secrets and variables → Actions → New repository secret**

Thêm 4 secrets sau:

| Secret Name | Value |
|---|---|
| `SIGNING_KEY` | Base64 string từ bước 2 |
| `ALIAS` | `flycam_key` (hoặc tên alias bạn đặt) |
| `KEY_STORE_PASSWORD` | Mật khẩu keystore từ bước 1 |
| `KEY_PASSWORD` | Mật khẩu key từ bước 1 |

### 4. Push Code

```bash
git add .
git commit -m "Configure GitHub Actions for APK build"
git push origin main
```

Workflow sẽ tự động chạy. Xem status tại **Actions tab** trên GitHub.

## Workflow Behavior

### Build Triggers

Workflow tự động chạy khi:

- **Push** vào branches: `main`, `develop`
- **Pull Request** tới branches: `main`, `develop`
- **Tag** được tạo: `v*` (ví dụ: `v1.0.0`)

### Build Types

**Nếu không có Secrets:**
- Build Debug APK
- Upload dưới dạng artifact

**Nếu có Secrets:**
- Build Release APK (signed)
- Upload artifact
- Khi có tag: tự động tạo GitHub Release

## Tạo Release

### Tạo Tag và Push

```bash
git tag v1.0.0
git push origin v1.0.0
```

Workflow sẽ:
1. Build Release APK (signed)
2. Tạo GitHub Release
3. Upload APK tới Release

### Các loại Prerelease

Prerelease được tạo tự động nếu tag chứa:
- `alpha` (ví dụ: `v1.0.0-alpha`)
- `beta` (ví dụ: `v1.0.0-beta`)
- `rc` (ví dụ: `v1.0.0-rc`)

## Build Locally

### Build Debug APK

```bash
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Build Release APK (Unsigned)

```bash
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

### Build Release APK (Signed)

```bash
./gradlew assembleRelease \
  -PSIGNING_KEY_PATH=./flycam.keystore \
  -PKEY_STORE_PASSWORD=your_keystore_password \
  -PALIAS=flycam_key \
  -PKEY_PASSWORD=your_key_password
```

## Troubleshooting

### Build Failed: "Keystore not found"

**Nguyên nhân:** Secrets chưa được cấu hình hoặc thiếu

**Giải pháp:**
1. Kiểm tra tất cả 4 secrets đã được thêm
2. Đảm bảo Base64 string đầy đủ (không bị cắt)
3. Xóa workflows cũ và push lại

### Build Failed: "Invalid keystore format"

**Nguyên nhân:** Keystore Base64 bị hỏng

**Giải pháp:**
1. Tạo lại keystore trên local
2. Re-encode Base64
3. Update secret trong GitHub

### APK too large

**Giải pháp:** Minify và shrink resources đã được bật:
```gradle
minifyEnabled true
shrinkResources true
```

## Files Modified

- `.github/workflows/build.yml` - GitHub Actions workflow
- `app/build.gradle` - Signing config cho release APK
- `gradle.properties` - Gradle properties (có thể thêm proguard config)

## Điều Kiện Tiên Quyết

- Android SDK 34+
- Kotlin 1.9.0+
- Gradle 8.0+
- JDK 17+

## Bổ Sung

Để tạo release APK tốt:

1. **Cập nhật version**:
   - `versionCode` - Tăng mỗi lần release
   - `versionName` - Semantic versioning (ví dụ: `1.0.0`)

2. **Tạo CHANGELOG**:
   - Liệt kê các tính năng, bug fixes
   - Thêm vào GitHub Release description

3. **Testing**:
   - Test debug APK trước khi tạo release
   - Kiểm tra tất cả tính năng chính

## Liên Hệ

Nếu gặp vấn đề, kiểm tra:
- GitHub Actions logs: **Actions → Build APK → Latest run**
- Gradle output từ local build
- Android Studio logcat
