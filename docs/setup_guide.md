# Smart Mechanic Finder — Complete Setup Guide
## Windows 10/11 → Android (Physical Device or Emulator)

---

## 1. Prerequisites

Install these once. Skip anything already installed.

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10 – 3.12 | https://python.org/downloads |
| MongoDB Community | 7.x | https://www.mongodb.com/try/download/community |
| Node.js | 18 LTS or 20 LTS | https://nodejs.org |
| JDK | 17 (Temurin recommended) | https://adoptium.net |
| Android Studio | Hedgehog or newer | https://developer.android.com/studio |
| Git | any | https://git-scm.com |

After installing Android Studio, open **SDK Manager** and install:
- Android SDK Platform 34
- Android SDK Build-Tools 34.0.0
- Android Emulator
- Android SDK Platform-Tools (`adb`)
- NDK (Side by side) **26.1.10909125**

Add these to your Windows **System Environment Variables**:
```
ANDROID_HOME = C:\Users\<YOU>\AppData\Local\Android\Sdk
Path additions:
  %ANDROID_HOME%\platform-tools
  %ANDROID_HOME%\tools
  %JAVA_HOME%\bin        (e.g. C:\Program Files\Eclipse Adoptium\jdk-17...\bin)
```

---

## 2. Find Your PC's Local IP Address

You need this so your physical Android device can reach the Flask backend.

```powershell
ipconfig
# Look for: IPv4 Address under your Wi-Fi adapter
# Example: 192.168.100.101
```

Keep this IP — you will use it in step 6.

---

## 3. MongoDB Setup

### Option A — Local MongoDB (recommended for development)

1. Install MongoDB Community (installer from link above, choose "Complete")
2. Start the service — it should auto-start on Windows. Verify:
```powershell
net start MongoDB
# OR if you installed as a service:
# Open Services → MongoDB → Start
```
3. Confirm it's running:
```powershell
mongosh --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }
```

### Option B — MongoDB Atlas (cloud, no local install)

1. Create free cluster at https://cloud.mongodb.com
2. Add your IP to the Network Access whitelist (or use `0.0.0.0/0` for dev)
3. Create database user, copy the connection string
4. Replace `MONGODB_URI` in `backend/.env`:
```
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/mechanic_finder_db
```

---

## 4. Backend Setup

Open a PowerShell terminal in `e:\smart-mechanic-finder\backend`.

```powershell
# 4.1 — Create and activate virtual environment
cd e:\smart-mechanic-finder\backend
python -m venv ..\venv
..\venv\Scripts\Activate.ps1

# If you get "execution policy" error, run once:
# Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# 4.2 — Install Python dependencies
pip install -r requirements.txt

# 4.3 — Verify .env (already configured, just confirm)
# File: e:\smart-mechanic-finder\backend\.env
# MONGODB_URI=mongodb://localhost:27017/mechanic_finder_db

# 4.4 — Seed the database with test data
python seed.py
```

Expected seed output:
```
Connecting to mongodb://localhost:27017/mechanic_finder_db ...
Indexes ensured.
Seeded 5 videos.
Seeded 10 SOP pricing entries.
Sample history/rating seeded.

Seed complete. Test credentials:
  User:     user@example.com / password123
  Mechanic: mechanic@example.com / password123
  Admin:    admin@example.com / password123
```

### 4.5 — Start the backend server

```powershell
# Still in backend\ with venv active:
python run.py
```

Expected output:
```
MongoDB connected → database: "mechanic_finder_db". Indexes ensured.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.100.101:5000
```

### 4.6 — Verify the API is working

Open a browser or Postman:
```
http://localhost:5000/api/health
```
Expected response:
```json
{"status": "healthy", "database": "connected", ...}
```

**Leave this terminal running** — the backend must stay open while testing the app.

---

## 5. Mobile App Setup

Open a **new** PowerShell terminal in `e:\smart-mechanic-finder\mobile`.

```powershell
cd e:\smart-mechanic-finder\mobile

# 5.1 — Install Node dependencies
npm install

# 5.2 — (Android only) Generate debug keystore if missing
cd android\app
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -dname "CN=Android Debug,O=Android,C=US"
cd ..\..
```

---

## 6. Configure Your IP Address

Open `e:\smart-mechanic-finder\mobile\src\components\services\api.js`

Find these two lines near the top and update:

```javascript
// For PHYSICAL DEVICE (USB or same Wi-Fi):
const PHYSICAL_DEVICE_HOST = '192.168.100.101';  // ← replace with YOUR PC IP
const USE_PHYSICAL_DEVICE_IP = true;             // ← true = physical device

// For EMULATOR ONLY (no changes needed):
const USE_PHYSICAL_DEVICE_IP = false;            // ← set to false for emulator
```

| Scenario | Setting |
|----------|---------|
| Android Emulator only | `USE_PHYSICAL_DEVICE_IP = false` (uses `10.0.2.2` automatically) |
| Physical device (USB/Wi-Fi) | `USE_PHYSICAL_DEVICE_IP = true` and set your PC's Wi-Fi IP |

---

## 7. Run on Android Emulator

```powershell
# 7.1 — Create AVD in Android Studio:
# Tools → Device Manager → Create Device
# Phone: Pixel 6  →  System Image: API 34 (Android 14)  →  Finish

# 7.2 — Start the emulator from Android Studio or:
# %ANDROID_HOME%\emulator\emulator -avd Pixel_6_API_34

# 7.3 — Confirm emulator is detected
adb devices
# Should show: emulator-5554  device

# 7.4 — Start Metro bundler (keep this terminal open)
cd e:\smart-mechanic-finder\mobile
npm start

# 7.5 — In a NEW terminal, build and launch the app
cd e:\smart-mechanic-finder\mobile
npx react-native run-android
```

Wait 2-5 minutes for the first Gradle build. Subsequent builds are faster.

---

## 8. Run on Physical Android Device (USB)

```powershell
# 8.1 — Enable Developer Options on your phone:
# Settings → About Phone → tap "Build Number" 7 times
# Settings → Developer Options → enable "USB Debugging"

# 8.2 — Connect phone via USB cable

# 8.3 — Allow USB debugging prompt on phone (tap "Allow")

# 8.4 — Verify phone is detected
adb devices
# Should show: XXXXXXXX  device  (your phone's serial)

# If "unauthorized": unplug, re-plug, accept the prompt on phone again

# 8.5 — Make sure phone and PC are on the SAME Wi-Fi network
# (backend runs on PC, phone accesses it over local network)

# 8.6 — Start Metro bundler
cd e:\smart-mechanic-finder\mobile
npm start

# 8.7 — In a NEW terminal, build and install
cd e:\smart-mechanic-finder\mobile
npx react-native run-android
```

The app will install and launch automatically on your device.

---

## 9. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| User | user@example.com | password123 |
| Mechanic | mechanic@example.com | password123 |
| Admin | admin@example.com | password123 |

---

## 10. Feature Testing Guide

### Login
1. Open app → Login screen appears
2. Tap a test credential hint or type manually
3. Login with `user@example.com` / `password123`
4. Redirects to Home screen with bottom tabs

### Find Nearby Mechanics (User)
1. Login as User
2. Home → tap "Find Mechanics" OR tap Search tab
3. Allow location permission when prompted
4. List of mechanics in Skardu area appears
5. Toggle List/Map view with icons in top-right
6. Tap a mechanic card → Detail screen with map, services, call button

### Mechanic Dashboard
1. Logout → login as `mechanic@example.com`
2. Dashboard tab shows stats (services, rating, earnings)
3. Tap Open/Busy/Closed buttons to change shop status
4. Services tab → add/remove services
5. Profile tab → edit shop name, address, hours

### SOS Emergency
1. Login as User
2. Home → "SOS Emergency" OR SOS tab
3. Tap the red "EMERGENCY SOS" button
4. Confirm alert → SOS sent, nearby mechanics notified in-app

### Video Library
1. Login as User
2. Home → "Video Library"
3. Browse by category (Battery, Oil Change, Tires, etc.)
4. Tap a video → opens YouTube in browser

### Standard Pricing (SOP)
1. Home → "View Standard Pricing"
2. Lists 10 services with price ranges in PKR
3. Filter by category, search by name

### Service History
1. Login as User → History tab
2. Shows all past service requests and status
3. Completed services show "Rate Now" button

### Rating System
1. History tab → tap "Rate Now" on a completed service
2. Rate 1-5 stars overall + per-category
3. Add optional review text → Submit

### Admin Dashboard
1. Login as `admin@example.com`
2. Dashboard shows total users, mechanics, reports, revenue
3. Users tab → view all users, toggle active/inactive
4. Mechanics tab → verify, ban/unban mechanics
5. Reports tab → review and resolve mechanic reports
6. Analytics tab → charts for registrations, services, SOS

### Report a Mechanic
1. Login as User
2. Find a mechanic → View Details
3. Scroll down → tap "Report Issue"
4. Confirm → report submitted to admin

---

## 11. Common Issues & Solutions

### "Network request failed" / Cannot reach backend

1. Confirm backend is running: open `http://YOUR_IP:5000/api/health` in phone browser
2. Check Windows Firewall — allow port 5000:
   ```powershell
   netsh advfirewall firewall add rule name="Flask API" dir=in action=allow protocol=TCP localport=5000
   ```
3. Confirm `PHYSICAL_DEVICE_HOST` in `api.js` matches your PC's IP exactly
4. Phone and PC must be on the same Wi-Fi network
5. For emulator: set `USE_PHYSICAL_DEVICE_IP = false` (uses `10.0.2.2`)

### "MongoDB not reachable" on backend start

```powershell
# Check if MongoDB service is running
net start MongoDB
# OR
Get-Service MongoDB
# Start manually if stopped:
net start MongoDB
```

### Metro bundler error "Unable to resolve module"

```powershell
cd e:\smart-mechanic-finder\mobile
# Clear cache completely
npx react-native start --reset-cache
# In a new terminal:
npx react-native run-android
```

### Gradle build failure "SDK location not found"

```powershell
# Create local.properties in android folder
cd e:\smart-mechanic-finder\mobile\android
# Create the file with your SDK path:
echo sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk > local.properties
```

### App installed but shows blank white screen

1. Check Metro bundler is running (`npm start`)
2. Shake device → tap "Reload" in debug menu
3. Check Metro terminal for red error messages

### "adb: command not found"

Add `%ANDROID_HOME%\platform-tools` to your system PATH and restart PowerShell.

### "Execution of gradlew failed" on Windows

```powershell
# Download gradle wrapper jar manually
cd e:\smart-mechanic-finder\mobile\android\gradle\wrapper
# Download from: https://services.gradle.org/distributions/gradle-8.3-all.zip
# Place gradle-wrapper.jar in this folder
```

### Location shows "Using default location (Skardu)"

This is expected when GPS is off or permission denied. The app falls back to Skardu city center (35.2973, 75.6333) so nearby mechanics still load. Enable GPS on device for real location.

### App crashes immediately on launch

Run `adb logcat` to see the crash reason:
```powershell
adb logcat *:E | Select-String "SmartMechanic|ReactNative|AndroidRuntime"
```

---

## 12. Development Workflow (Day-to-Day)

Every time you work on the project:

**Terminal 1 — Backend:**
```powershell
cd e:\smart-mechanic-finder\backend
..\venv\Scripts\Activate.ps1
python run.py
```

**Terminal 2 — Metro Bundler:**
```powershell
cd e:\smart-mechanic-finder\mobile
npm start
```

**Terminal 3 — Deploy to device (first time or after native changes):**
```powershell
cd e:\smart-mechanic-finder\mobile
npx react-native run-android
```

After the first install, JS changes hot-reload automatically — no rebuild needed.

---

## 13. Project Structure Summary

```
smart-mechanic-finder/
├── backend/
│   ├── .env                    ← environment variables (edit MONGODB_URI here)
│   ├── requirements.txt        ← Python dependencies
│   ├── run.py                  ← start with: python run.py
│   ├── seed.py                 ← seed DB with: python seed.py
│   └── app/
│       ├── __init__.py         ← Flask app factory + blueprint registration
│       ├── config.py           ← configuration classes
│       ├── models/             ← User, Mechanic, Video, SOP, Report models
│       ├── routes/             ← auth, api, mechanic, rating, history, sos, admin, video, sop
│       ├── services/           ← analytics, location, notification, rating services
│       ├── utils/              ← database.py, haversine.py, notifications.py
│       └── middleware/         ← auth_middleware.py (admin_required, mechanic_required)
│
└── mobile/
    ├── App.js                  ← root component (wraps all providers)
    ├── index.js                ← React Native entry point
    ├── app.json                ← app name registration
    ├── package.json            ← Node dependencies
    ├── android/                ← Android native project (Gradle)
    │   └── app/src/main/
    │       ├── AndroidManifest.xml   ← permissions, HTTP config
    │       └── java/com/smartmechanicfinder/
    │           ├── MainActivity.kt
    │           └── MainApplication.kt
    └── src/
        ├── components/
        │   ├── auth/           ← LoginForm, RegisterForm
        │   ├── context/        ← AuthContext, LocationContext, ThemeContext
        │   ├── mechanic/       ← MechanicCard, RatingStars
        │   ├── navigation/     ← AppNavigator, AuthNavigator, UserNavigator, MechanicNavigator, AdminNavigator
        │   └── services/       ← api.js (axios), auth.js, location.js, mechanicService.js
        ├── context/            ← barrel re-exports of context providers
        ├── navigation/         ← barrel re-exports of navigators
        ├── screens/
        │   ├── auth/           ← LoginScreen, RegisterScreen
        │   ├── user/           ← HomeScreen, MechanicSearchScreen, MechanicDetailScreen,
        │   │                      RatingScreen, HistoryScreen, VideoLibraryScreen, SOPScreen, SOSScreen
        │   ├── mechanic/       ← DashboardScreen, ProfileScreen, ServicesScreen
        │   └── admin/          ← AdminDashboardScreen, ManageUsersScreen, ManageMechanicsScreen,
        │                          ReportsScreen, AnalyticsScreen
        └── services/           ← barrel re-exports of component services
```

---

## 14. API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/register | No | Register user/mechanic |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/profile | JWT | Get current user profile |
| PUT | /api/auth/profile | JWT | Update profile/location |
| GET | /api/mechanics/nearby | JWT | Nearby mechanics by GPS |
| GET | /api/mechanics/`<id>` | No | Mechanic detail |
| PUT | /api/mechanics/status | JWT | Update shop status |
| GET | /api/mechanic/dashboard | JWT | Mechanic stats dashboard |
| PUT | /api/mechanic/profile | JWT | Update shop profile |
| GET | /api/mechanic/services | JWT | Get mechanic services |
| PUT | /api/mechanic/services | JWT | Update services list |
| GET | /api/videos | No | Video library (paginated) |
| GET | /api/videos/categories | No | Video categories |
| GET | /api/sop | No | Standard pricing guide |
| POST | /api/ratings/create | JWT | Submit mechanic rating |
| GET | /api/ratings/mechanic/`<id>` | No | Get mechanic ratings |
| GET | /api/history/user | JWT | User service history |
| POST | /api/history/create | JWT | Create service record |
| POST | /api/sos/create | JWT | Send SOS alert |
| GET | /api/sos/active | JWT | Get active SOS requests |
| PUT | /api/sos/`<id>`/cancel | JWT | Cancel SOS |
| POST | /api/report | JWT | Report a mechanic |
| GET | /api/admin/dashboard | Admin | Admin statistics |
| GET | /api/admin/users | Admin | List all users |
| PUT | /api/admin/users/`<id>` | Admin | Update user |
| GET | /api/admin/mechanics | Admin | List all mechanics |
| PUT | /api/admin/mechanics/`<id>`/verify | Admin | Verify mechanic |
| PUT | /api/admin/mechanics/`<id>`/ban | Admin | Ban mechanic |
| GET | /api/admin/reports | Admin | List all reports |
| PUT | /api/admin/reports/`<id>` | Admin | Update report status |
| GET | /api/admin/analytics | Admin | Analytics data |

---

## 15. Sample Data Summary (Skardu Area)

After running `python seed.py`, the database contains:

**Users:**
- user@example.com — regular user near Skardu center
- mechanic@example.com — mechanic (Ali Mechanic / Skardu Auto Repair)
- admin@example.com — admin user
- shop1–shop4@example.com — 4 additional mechanic shops

**Mechanics in Skardu area:**

| Shop | Location | Services |
|------|----------|----------|
| Skardu Auto Repair | Main Bazar | Engine, Oil Change, Tires, Battery |
| Hussain Motors | Airport Road | Brakes, Oil Change, Alignment |
| Baltistan Garage | Satpara Road | Engine, Radiator, AC |
| K2 Quick Fix | Yadgar Chowk | Tires, Battery, Diagnostic |
| Mountain Peak Autos | Gamba | Transmission, Engine, Oil Change |

**Videos:** 5 tutorial videos (Battery, Oil Change, Tires, Cooling, Brakes)

**SOP Pricing:** 10 service types with PKR price ranges

**Sample history + rating:** One completed Oil Change for the test user
