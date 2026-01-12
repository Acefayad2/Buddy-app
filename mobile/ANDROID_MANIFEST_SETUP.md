# Android Manifest Setup Instructions

After running `npx expo prebuild`, you need to manually add the following to:

**File:** `android/app/src/main/AndroidManifest.xml`

## Add Bluetooth LE Hardware Feature

Add this inside the `<manifest>` tag (usually near the top, before `<application>`):

```xml
<uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />
```

## Add maxSdkVersion to Bluetooth Permissions

Update the Bluetooth permissions to include `maxSdkVersion` for pre-Android 12:

```xml
<!-- Pre-Android 12 -->
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
```

## Complete AndroidManifest.xml Example

Your AndroidManifest.xml should include:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Bluetooth LE Hardware Feature -->
    <uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />
    
    <!-- Android 12+ -->
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    
    <!-- Pre-Android 12 -->
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    
    <!-- Location (needed for BLE scanning on older Android; also used on disconnect logging) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Other permissions -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
    
    <application>
        <!-- Your app configuration -->
    </application>
</manifest>
```

## Steps

1. Run `npx expo prebuild` to generate native directories
2. Edit `android/app/src/main/AndroidManifest.xml`
3. Add the `<uses-feature>` tag and update Bluetooth permissions with `maxSdkVersion`
4. Build and run: `npx expo run:android`
