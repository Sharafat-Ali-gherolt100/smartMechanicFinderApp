# Smart Mechanic Finder — Android USB Deployment Guide
## Complete Step-by-Step Instructions for Windows

---

## ✅ Prerequisites (Install Once)

| Tool | Required Version | Download Link |
|------|------------------|---------------|
| **Java JDK** | **17** (MUST be 17) | https://adoptium.net/temurin/releases/?version=17 |
| **Node.js** | 18 LTS or 20 LTS | https://nodejs.org |
| **Python** | 3.10 - 3.12 | https://python.org/downloads |
| **MongoDB** | 7.x | https://www.mongodb.com/try/download/community |
| **Android Studio** | Latest | https://developer.android.com/studio |

### Android Studio Setup

After installing Android Studio:

1. **Open Android Studio** → Click "More Actions" → **SDK Manager**

2. **Install these SDK components:**
   - ✅ Android SDK Platform 34
   - ✅ Android SDK Build-Tools 34.0.0
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ NDK (Side by side) version **26.1.10909125**

3. **Set Environment Variables** (Windows System):
   ```
   ANDROID_HOME = C:\Users\<YOUR_USERNAME>\AppData\Local\Android\Sdk
   
   JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x
   
   Path additions:
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\tools
     %JAVA_HOME%\bin
   ```

4. **Verify installation:**
   ```powershell
   java -version
   # Should show: openjdk version "17.x.x"
   
   adb version
   # Should show: Android Debug Bridge version
   ```

---

## 🚀 ONE-CLICK FIX (Run This First!)

This script fixes ALL Android/Gradle issues automatically:

```powershell
cd E:\smart-mechanic-finder
powershell -ExecutionPolicy Bypass -File ANDROID-FIX-COMPLETE.ps1
```

**What it does:**
- ✅ Verifies Java 17 is installed
- ✅ Checks Android SDK configuration
- ✅ Cleans old build artifacts
- ✅ Installs all Node dependencies
- ✅ Generates debug keystore
- ✅ Detects connected Android devices
- ✅ Shows your PC's IP address for API configuration

---

## 📱 Connect Your Android Phone via USB

### Step 1: Enable Developer Mode on Phone

1. Open **Settings** on your Android phone
2. Go to **About Phone** (or **About Device**)
3. Find **Build Number**
4. **Tap "Build Number" 7 times** rapidly
5. You'll see: "You are now a developer!"

### Step 2: Enable USB Debugging

1. Go back to **Settings**
2. Find **Developer Options** (usually under System)
3. Enable **USB Debugging**
4. (Optional) Enable **Install via USB** for easier deployment

### Step 3: Connect Phone to PC

1. **Connect phone to PC using USB cable**
2. On phone, you'll see a prompt: **"Allow USB debugging?"**
3. Check **"Always allow from this computer"**
4. Tap **"Allow"**

### Step 4: Verify Connection

```powershell
adb devices
```

**Expected output:**
```
List of devices attached
XXXXXXXX        device
```

If you see:
- `unauthorized` → Disconnect cable, reconnect, accept prompt on phone again
- No devices → Check USB cable, try different USB port, reinstall phone driver

---

## 🌐 Configure Backend IP Address

Your phone needs to know your PC's IP address to connect to the backend.

### Find Your PC's IP Address

```powershell
ipconfig
```

Look for **IPv4 Address** under your **Wi-Fi adapter**.

Example: `192.168.1.105`

### Update Mobile App Configuration

Open: `E:\smart-mechanic-finder\mobile\src\components\services\api.js`

**Find these lines** (around line 18-20):

```javascript
const PHYSICAL_DEVICE_HOST = '192.168.100.101';  // ← CHANGE THIS!
const USE_PHYSICAL_DEVICE_IP = true;             // ← Set to true
```

**Replace with YOUR PC's IP:**

```javascript
const PHYSICAL_DEVICE_HOST = '192.168.1.105';    // ← Your actual IP
const USE_PHYSICAL_DEVICE_IP = true;             // ← Keep as true
```

**Important:**
- Your **phone and PC must be on the same Wi-Fi network**
- If using **Android Emulator**, set `USE_PHYSICAL_DEVICE_IP = false`

---

## 🎯 Build and Run (3 Terminals)

### Terminal 1 — Start Backend Server

```powershell
# Navigate to backend
cd E:\smart-mechanic-finder\backend

# Activate virtual environment
..\.venv\Scripts\Activate.ps1

# If venv doesn't exist, create it first:
# python -m venv ..\.venv
# ..\.venv\Scripts\Activate.ps1
# pip install -r requirements.txt
# python seed.py

# Start Flask server
python run.py
```

**Expected output:**
```
MongoDB connected → database: "mechanic_finder_db"
 * Running on http://192.168.1.105:5000
```

**Keep this terminal running!**

---

### Terminal 2 — Start Metro Bundler

```powershell
# Navigate to mobile
cd E:\smart-mechanic-finder\mobile

# Start Metro bundler
npm start
```

**Expected output:**
```
                                 ######                ######
               #####################                        ################
...
Metro waiting on exp://...
```

**Keep this terminal running!**

---

### Terminal 3 — Build and Install on Phone

```powershell
# Navigate to mobile
cd E:\smart-mechanic-finder\mobile

# Build and deploy to connected Android device
npx react-native run-android
```

**This will:**
1. Build the Android app (takes 3-10 minutes first time)
2. Automatically install APK on your connected phone
3. Launch the app on your phone

**Expected output (end):**
```
BUILD SUCCESSFUL in 5m 23s
...
Installing APK...
Launching app...
```

**The app will automatically open on your phone!**

---

## 🧪 Test the App

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **User** | user@example.com | password123 |
| **Mechanic** | mechanic@example.com | password123 |
| **Admin** | admin@example.com | password123 |

### Features to Test

1. **Login Screen**
   - Try login with user credentials
   - Should redirect to Home screen with tabs

2. **Find Mechanics**
   - Tap "Find Mechanics" button
   - Allow location permission when prompted
   - See list of 5 mechanics in Skardu area
   - Toggle between List and Map view

3. **Mechanic Details**
   - Tap any mechanic card
   - View details, map, services
   - Test "Call Mechanic" button

4. **SOS Emergency**
   - Tap "SOS Emergency" button on Home
   - Confirm alert
   - SOS sent to nearby mechanics

5. **Video Library**
   - Browse repair tutorial videos
   - Filter by category
   - Videos open in YouTube

6. **Rate a Mechanic**
   - Go to History tab
   - Tap "Rate Now" on completed service
   - Submit 5-star rating

---

## 🛠️ Troubleshooting

### ❌ Error: "Could not find gradle-wrapper.properties"

**Fixed by the ONE-CLICK script!**

If still happening:
```powershell
cd E:\smart-mechanic-finder\mobile\android
.\gradlew clean
cd ..
npx react-native run-android
```

---

### ❌ Error: "SDK location not found"

Create `android/local.properties`:

```powershell
cd E:\smart-mechanic-finder\mobile\android
echo sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk > local.properties
```

Replace `YOUR_USERNAME` with your actual Windows username.

---

### ❌ Error: "Installed Build Tools revision 34.0.0 is corrupted"

**Solution:**

1. Open **Android Studio** → **SDK Manager**
2. **Uncheck** "Android SDK Build-Tools 34"
3. Click **Apply** to uninstall
4. **Check** "Android SDK Build-Tools 34" again
5. Click **Apply** to reinstall
6. Try building again

---

### ❌ Error: "Unable to load script. Make sure you're running Metro"

**Solution:**

1. Stop everything (Ctrl+C in all terminals)
2. Clear Metro cache:
   ```powershell
   cd E:\smart-mechanic-finder\mobile
   npx react-native start --reset-cache
   ```
3. In a new terminal, run:
   ```powershell
   npx react-native run-android
   ```

---

### ❌ Error: "Network request failed" in app

**Cause:** Phone can't reach backend on PC.

**Solutions:**

1. **Check backend is running:**
   - Backend terminal should show: `Running on http://192.168.x.x:5000`

2. **Test backend from phone browser:**
   - Open Chrome on your phone
   - Visit: `http://YOUR_PC_IP:5000/api/health`
   - Should show: `{"status": "healthy", ...}`

3. **Check Windows Firewall:**
   ```powershell
   netsh advfirewall firewall add rule name="Flask API" dir=in action=allow protocol=TCP localport=5000
   ```

4. **Verify IP in api.js matches your PC's actual IP**

5. **Ensure phone and PC are on SAME Wi-Fi network**

---

### ❌ Error: "Execution failed for task ':app:installDebug'"

**Solution:**

```powershell
# Uninstall old version from phone
adb uninstall com.smartmechanicfinder

# Try installing again
cd E:\smart-mechanic-finder\mobile
npx react-native run-android
```

---

### ❌ Error: "Could not resolve all files for configuration"

**Solution:**

```powershell
cd E:\smart-mechanic-finder\mobile

# Clear Gradle cache
Remove-Item -Recurse -Force android\.gradle
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force android\build

# Rebuild
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

---

### ❌ App installed but shows blank white screen

**Solutions:**

1. **Reload the app:**
   - Shake your phone to open React Native debug menu
   - Tap "Reload"

2. **Check Metro terminal for errors:**
   - Red errors in Metro terminal? Read and fix them

3. **Restart everything:**
   - Ctrl+C in Metro terminal
   - `npm start --reset-cache`
   - Rebuild app

---

### ❌ Java version issues

**Check current Java version:**
```powershell
java -version
```

**If not Java 17:**

1. Download Java 17 from: https://adoptium.net/temurin/releases/?version=17
2. Install it
3. Update `JAVA_HOME` environment variable:
   ```
   JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x
   ```
4. **Restart PowerShell** (or restart PC)
5. Verify:
   ```powershell
   java -version
   # Should now show: openjdk version "17.x.x"
   ```

---

## 📋 Quick Reference Commands

### Backend Commands
```powershell
cd E:\smart-mechanic-finder\backend
..\.venv\Scripts\Activate.ps1
python run.py                    # Start server
python seed.py                   # Re-seed database
```

### Mobile Commands
```powershell
cd E:\smart-mechanic-finder\mobile
npm start                        # Start Metro
npx react-native run-android     # Build & install
npm start -- --reset-cache       # Clear Metro cache
```

### Android/ADB Commands
```powershell
adb devices                      # List connected devices
adb logcat                       # View device logs
adb logcat *:E                   # View errors only
adb uninstall com.smartmechanicfinder  # Uninstall app
adb reverse tcp:5000 tcp:5000    # Port forward (for emulator)
```

### Gradle Commands
```powershell
cd E:\smart-mechanic-finder\mobile\android
.\gradlew clean                  # Clean build
.\gradlew assembleDebug          # Build APK only
.\gradlew installDebug           # Install on device
```

---

## 🎯 Complete Fresh Start (If Everything Fails)

```powershell
# 1. Clean everything
cd E:\smart-mechanic-finder\mobile
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android\.gradle
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force android\build

# 2. Reinstall dependencies
npm install

# 3. Run fix script
cd ..
powershell -ExecutionPolicy Bypass -File ANDROID-FIX-COMPLETE.ps1

# 4. Start fresh
cd mobile
npm start --reset-cache

# 5. In new terminal:
npx react-native run-android
```

---

## 📞 Backend API Test

To verify backend is reachable from your phone:

1. **Get your PC's IP address:**
   ```powershell
   ipconfig | Select-String "IPv4"
   ```

2. **Start backend:**
   ```powershell
   cd E:\smart-mechanic-finder\backend
   ..\.venv\Scripts\Activate.ps1
   python run.py
   ```

3. **On your phone's browser, visit:**
   ```
   http://YOUR_PC_IP:5000/api/health
   ```

4. **Expected response:**
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "db_name": "mechanic_finder_db"
   }
   ```

If this works, the app will work too!

---

## 🎉 Success Checklist

Before building the app, verify:

- ✅ Java 17 installed (`java -version`)
- ✅ Android SDK installed (`adb version`)
- ✅ Phone connected via USB (`adb devices` shows device)
- ✅ Backend running (`http://YOUR_IP:5000/api/health` works)
- ✅ IP configured in `api.js` (matches your PC)
- ✅ Phone and PC on same Wi-Fi network
- ✅ ONE-CLICK fix script completed successfully

Then run:
```powershell
# Terminal 1
cd E:\smart-mechanic-finder\backend
..\.venv\Scripts\Activate.ps1
python run.py

# Terminal 2
cd E:\smart-mechanic-finder\mobile
npm start

# Terminal 3
cd E:\smart-mechanic-finder\mobile
npx react-native run-android
```

**The app will open on your phone automatically!** 🚀

---

## 📚 Additional Resources

- **React Native Docs:** https://reactnative.dev/docs/environment-setup
- **Android Debug Bridge:** https://developer.android.com/tools/adb
- **Troubleshooting Guide:** `E:\smart-mechanic-finder\docs\setup_guide.md`

---

**Need help?** All configuration files have been fixed and tested. Follow the steps in order and you'll have the app running on your phone!
