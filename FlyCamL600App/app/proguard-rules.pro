# Retrofit
-keep class com.flycam.l600app.data.api.** { *; }
-keep class com.flycam.l600app.data.model.** { *; }

# OkHttp
-keepattributes Signature
-keepattributes *Annotation*

# Gson
-keepattributes EnclosingMethod
-keepattributes InnerClasses
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.stream.** { *; }

# Google Maps
-keep class com.google.android.gms.maps.** { *; }
-keep class com.google.android.gms.location.** { *; }

# Kotlin
-keepclassmembers class kotlin.Metadata {
    *** METHOD_MAPPING_MARKER_IMPL(...);
}

# AndroidX
-keep class androidx.** { *; }
-keepattributes *Annotation*
