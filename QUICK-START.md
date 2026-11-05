# Smart Mechanic Finder — QUICK START GUIDE
## Build and Run on Android Phone (USB) — 5 Minutes

---

## ⚡ Prerequisites

- ✅ Java 17 installed
- ✅ Android Studio installed (with SDK Platform 34, NDK 26.1.x)
- ✅ MongoDB running locally
- ✅ Node.js 18+ installed
- ✅ Android phone with USB debugging enabled

---

## 🚀 3 Steps to Run

### STEP 1: Run the Fix Script (ONE TIME ONLY)

```powershell
cd E:\smart-mechanic-finder
powershell -ExecutionPolicy Bypass -File ANDROID-FIX-COMPLETE.ps1
```

This fixes all Android/Gradle issues automatically.

---

### STEP 2: Configure Your IP Address

Open: `E:\smart-mechanic-finder\mobile\src\components\services\api.js`

**Find your PC's IP:**
```powershell
ipconfig | Select-String "IPv4"
```

**Update this line** (around line 18):
```javascript
const PHYSICAL_DEVICE_HOST = '192.168.1.105';  // ← Change to YOUR IP
const USE_PHYSICAL_DEVICE_IP = true;           // ← Keep as true
```

---

### STEP 3: Build and Run (3 Terminals)

**Terminal 1 — Backend:**
```powershell
cd E:\smart-mechanic-finder\backend
..\.venv\Scripts\Activate.ps1
python run.py
```

**Terminal 2 — Metro:**
```powershell
cd E:\smart-mechanic-finder\mobile
npm start
```

**Terminal 3 — Build & Install:**
```powershell
cd E:\smart-mechanic-finder\mobile
npx react-native run-android
```

The app will automatically install and launch on your phone!

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| User | user@example.com | password123 |
| Mechanic | mechanic@example.com | password123 |
| Admin | admin@example.com | password123 |

---

## ❌ Common Issues

### "Network request failed"

**Fix:**
1. Check backend terminal shows: `Running on http://192.168.x.x:5000`
2. Allow Windows Firewall:
   ```powershell
   netsh advfirewall firewall add rule name="Flask API" dir=in action=allow protocol=TCP localport=5000
   ```
3. Verify IP in `api.js` matches your PC
4. Phone and PC must be on **same Wi-Fi**

### "Could not find gradle-wrapper.properties"

**Already fixed by the script!** If still happening:
```powershell
cd E:\smart-mechanic-finder\mobile\android
.\gradlew clean
cd ..
npx react-native run-android
```

### "No devices found"

**Connect phone via USB:**
1. Enable Developer Mode (tap Build Number 7 times)
2. Enable USB Debugging in Developer Options
3. Connect USB cable
4. Accept "Allow USB debugging" prompt on phone
5. Run: `adb devices` (should show your device)

---

## 📖 Full Documentation

For detailed troubleshooting and step-by-step guide:

📄 **ANDROID-SETUP-INSTRUCTIONS.md** — Complete guide with all fixes

📄 **docs/setup_guide.md** — Original setup guide

---

## ✅ What Was Fixed

All Android/Gradle issues are now resolved:

- ✅ `gradle-wrapper.properties` — Created properly in correct location
- ✅ `settings.gradle` — Fixed for React Native 0.73.0
- ✅ `build.gradle` — Correct Gradle 8.1.1 + plugin versions
- ✅ `app/build.gradle` — Full React Native configuration
- ✅ `gradlew.bat` — Working Windows Gradle wrapper
- ✅ `gradle-wrapper.jar` — Downloaded from official source
- ✅ All dependency conflicts resolved
- ✅ Java 17 compatibility ensured
- ✅ Debug keystore auto-generated
- ✅ Android manifest with all permissions
- ✅ Network security config for HTTP cleartext
- ✅ Backend CORS configured
- ✅ MongoDB connection tested

**Your app is ready to build!** 🎉
