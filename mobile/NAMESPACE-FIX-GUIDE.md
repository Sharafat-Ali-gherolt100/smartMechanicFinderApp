# React Native Namespace Fix Guide
## Fix "Namespace not specified" Android Build Error

---

## 🚨 The Problem

React Native 0.73+ and Android Gradle Plugin 8.x require all libraries to specify a `namespace` in their `build.gradle` files. Many older React Native libraries don't have this, causing build failures.

**Error message:**
```
Namespace not specified. Specify a namespace in the module's build.gradle file
```

---

## ✅ ONE-CLICK FIX

Run this script to fix all namespace issues automatically:

```powershell
cd E:\smart-mechanic-finder\mobile
powershell -ExecutionPolicy Bypass -File FIX-NAMESPACE-ANDROID.ps1
```

**What it fixes:**
- ✅ @react-native-community/netinfo
- ✅ react-native-geolocation-service
- ✅ react-native-vector-icons (if needed)
- ✅ Verifies react-native-maps
- ✅ Cleans build cache
- ✅ Verifies Java version

---

## 🛠️ Manual Fix (If Script Doesn't Work)

### Fix 1: @react-native-community/netinfo

**File:** `node_modules/@react-native-community/netinfo/android/build.gradle`

**Find this:**
```gradle
apply plugin: 'com.android.library'

android {
  compileSdkVersion getExtOrIntegerDefault('compileSdkVersion')
```

**Replace with:**
```gradle
apply plugin: 'com.android.library'

android {
  namespace "com.reactnativecommunity.netinfo"
  compileSdkVersion getExtOrIntegerDefault('compileSdkVersion')
```

---

### Fix 2: react-native-geolocation-service

**File:** `node_modules/react-native-geolocation-service/android/build.gradle`

**Find this:**
```gradle
android {
  compileSdkVersion safeExtGet('compileSdkVersion', DEFAULT_COMPILE_SDK_VERSION)
```

**Replace with:**
```gradle
android {
  namespace "com.agontuk.RNFusedLocation"
  compileSdkVersion safeExtGet('compileSdkVersion', DEFAULT_COMPILE_SDK_VERSION)
```

---

### Fix 3: react-native-vector-icons (Usually Already Fixed)

**File:** `node_modules/react-native-vector-icons/android/build.gradle`

**Should already have:**
```gradle
android {
    namespace = "com.oblador.vectoricons"
    compileSdkVersion safeExtGet('compileSdkVersion', 31)
```

If missing, add the namespace line.

---

### Fix 4: react-native-maps (Usually Already Fixed)

**File:** `node_modules/react-native-maps/android/build.gradle`

**Should already have:**
```gradle
android {
  def agpVersion = com.android.Version.ANDROID_GRADLE_PLUGIN_VERSION
  if (agpVersion.tokenize('.')[0].toInteger() >= 7) {
    namespace "com.rnmaps.maps"
  }
```

This is conditional and should work automatically.

---

## 🔄 After Fixing Namespaces

### Clean Build

```powershell
cd E:\smart-mechanic-finder\mobile

# Clean Gradle cache
Remove-Item -Recurse -Force android\.gradle
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force android\build

# Clean Metro cache
npx react-native start --reset-cache
```

### Build and Run

```powershell
# In Terminal 1 (Metro)
cd E:\smart-mechanic-finder\mobile
npm start

# In Terminal 2 (Build)
cd E:\smart-mechanic-finder\mobile
npx react-native run-android
```

---

## 🎯 Complete Build Commands

### Option 1: Quick Build (After Fix)

```powershell
cd E:\smart-mechanic-finder\mobile
npx react-native run-android
```

### Option 2: Clean Build (If Issues Persist)

```powershell
cd E:\smart-mechanic-finder\mobile

# Clean everything
cd android
.\gradlew clean
cd ..

# Clear Metro cache
npx react-native start --reset-cache

# In new terminal:
npx react-native run-android
```

### Option 3: Nuclear Option (Full Clean)

```powershell
cd E:\smart-mechanic-finder\mobile

# Delete build artifacts
Remove-Item -Recurse -Force android\.gradle
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force android\build

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Run fix script again
powershell -ExecutionPolicy Bypass -File FIX-NAMESPACE-ANDROID.ps1

# Build
npm start --reset-cache
# In new terminal:
npx react-native run-android
```

---

## ⚠️ Important Notes

### 1. Fixing node_modules

**Problem:** Changes to `node_modules` are lost when you run `npm install`.

**Solutions:**

**A. Use patch-package (Recommended):**
```powershell
npm install --save-dev patch-package

# After fixing files in node_modules:
npx patch-package @react-native-community/netinfo
npx patch-package react-native-geolocation-service
```

Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

**B. Run fix script after every `npm install`:**
```powershell
npm install
powershell -ExecutionPolicy Bypass -File FIX-NAMESPACE-ANDROID.ps1
```

---

### 2. Java Version

Android Gradle Plugin 8.x requires **Java 17**.

**Check version:**
```powershell
java -version
```

**Should show:**
```
openjdk version "17.x.x"
```

**If wrong version:**
1. Download Java 17: https://adoptium.net/temurin/releases/?version=17
2. Install
3. Set `JAVA_HOME` environment variable
4. Restart PowerShell

---

### 3. Gradle Files Are Correct

Your main project Gradle files are already correctly configured:

✅ `android/settings.gradle` — Includes native modules  
✅ `android/build.gradle` — Gradle 8.1.1  
✅ `android/app/build.gradle` — Java 17, SDK 34  
✅ `android/gradle.properties` — Hermes, AndroidX  
✅ `android/gradle/wrapper/gradle-wrapper.properties` — Gradle 8.3  

**You only need to fix the library namespaces in node_modules.**

---

## 🧪 Verify Fix Worked

After running the fix script and building:

**1. Check build output:**
```
BUILD SUCCESSFUL in 3m 45s
```

**2. App installs on device:**
```
Installing APK 'app-debug.apk'...
Installed on 1 device.
```

**3. No namespace errors in build log**

---

## 🐛 Troubleshooting

### Error: "Could not resolve all files for configuration"

**Solution:**
```powershell
cd E:\smart-mechanic-finder\mobile\android
.\gradlew clean --refresh-dependencies
cd ..
npx react-native run-android
```

---

### Error: "Installed Build Tools revision X is corrupted"

**Solution:**
1. Open Android Studio → SDK Manager
2. Uninstall Android SDK Build-Tools 34
3. Reinstall Android SDK Build-Tools 34
4. Rebuild

---

### Error: "Unable to load script"

**Solution:**
```powershell
# Stop Metro (Ctrl+C)
npx react-native start --reset-cache

# In new terminal:
npx react-native run-android
```

---

### Error persists after fix

**Try:**
1. Run fix script again
2. Delete `android/.gradle` folder
3. Run `.\gradlew clean` in android folder
4. Rebuild

---

## 📋 Quick Reference

### Files Fixed by Script

```
node_modules/@react-native-community/netinfo/android/build.gradle
node_modules/react-native-geolocation-service/android/build.gradle
```

### Namespaces Added

| Library | Namespace |
|---------|-----------|
| netinfo | `com.reactnativecommunity.netinfo` |
| geolocation-service | `com.agontuk.RNFusedLocation` |
| vector-icons | `com.oblador.vectoricons` |
| maps | `com.rnmaps.maps` |

---

## ✅ Success Checklist

Before declaring victory:

- [ ] Fix script ran without errors
- [ ] `npx react-native run-android` completes successfully
- [ ] App installs on Android device
- [ ] App launches and shows login screen
- [ ] No red error screens in app
- [ ] Can login with test credentials

---

## 🚀 Full Build Process

**Complete fresh build from scratch:**

```powershell
# 1. Fix namespaces
cd E:\smart-mechanic-finder\mobile
powershell -ExecutionPolicy Bypass -File FIX-NAMESPACE-ANDROID.ps1

# 2. Clean everything
Remove-Item -Recurse -Force android\.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\build -ErrorAction SilentlyContinue

# 3. Start Metro (Terminal 1)
npm start --reset-cache

# 4. Build and install (Terminal 2)
npx react-native run-android
```

**Expected build time:**
- First build: 3-8 minutes
- Subsequent builds: 30-90 seconds

---

## 💡 Why This Happens

**Background:**
- Android Gradle Plugin 8.0+ enforces namespace requirement
- React Native 0.73+ uses AGP 8.x
- Older RN libraries (pre-2023) don't have namespaces
- Must be added manually to `node_modules`

**Long-term solution:**
- Use `patch-package` to preserve fixes
- Wait for library maintainers to update
- Use newer alternatives if available

---

## 📞 Still Having Issues?

If namespace fix doesn't solve your build problem:

1. **Check Java version** — Must be 17
2. **Check Android SDK** — Platform 34 installed
3. **Check ANDROID_HOME** — Environment variable set
4. **Run complete fix script** — `ANDROID-FIX-COMPLETE.ps1` in project root
5. **Check main project files** — See `ANDROID-SETUP-INSTRUCTIONS.md`

---

**Your namespace issues are now fixed!** 🎉

Run `npx react-native run-android` and your app should build successfully.
