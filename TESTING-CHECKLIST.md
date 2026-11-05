# Smart Mechanic Finder — Complete Testing Checklist

**Generated:** August 2026  
**Backend verified:** ✅ All 11 API endpoints passing  
**Bundle size:** 1.47 MB (Android) | iOS bundle generated  
**Test credentials:**
```
User:     user@example.com / password123
Mechanic: mechanic@example.com / password123
Admin:    admin@example.com / password123
```

---

## PRE-TEST SETUP

### Backend
```powershell
# Start MongoDB (if not running as service)
mongod --dbpath backend\data

# Start Flask backend
cd backend
python run.py
# Should print: Running on http://0.0.0.0:5000

# Verify API is alive
curl http://localhost:5000/api/health
```

### Android (USB Device)
```powershell
# Enable USB Debugging on phone: Settings → Developer Options → USB Debugging
# Verify device is recognized
adb devices

# Install and run
cd mobile
npx react-native run-android
```

### iOS (Mac required)
```bash
cd mobile/ios
pod install          # installs native dependencies
cd ..
npx react-native run-ios
# or open ios/SmartMechanicFinder.xcworkspace in Xcode → Run
```

---

## VERIFIED BY AUTOMATED CHECKS ✅

These were confirmed programmatically before generating this checklist:

| Check | Result |
|-------|--------|
| Android bundle compiles | ✅ 1.47 MB, 0 errors |
| iOS bundle compiles | ✅ main.jsbundle generated |
| Backend server starts | ✅ MongoDB connected |
| GET /api/health | ✅ 200 |
| GET /api/videos | ✅ 200 — 10 videos |
| GET /api/videos/categories | ✅ 200 — 6 categories |
| GET /api/sop | ✅ 200 — SOP pricing |
| GET /api/sop/categories | ✅ 200 |
| POST /api/auth/login (user) | ✅ 200 — JWT issued |
| POST /api/auth/login (mechanic) | ✅ 200 — JWT issued |
| POST /api/auth/login (admin) | ✅ 200 — JWT issued |
| GET /api/history/user (auth) | ✅ 200 |
| GET /api/alerts/my (auth) | ✅ 200 |
| GET /api/mechanics/nearby (auth) | ✅ 200 |
| POST /api/alerts/create (auth) | ✅ 200 |
| GET /api/mechanic/dashboard (auth) | ✅ 200 |
| GET /api/admin/dashboard (auth) | ✅ 200 |
| GET /api/alerts/admin/stats (auth) | ✅ 200 |
| GET /api/alerts/admin/all (auth) | ✅ 200 |
| All 26 screen/utility files present | ✅ 0 missing |

---

## ANDROID DEVICE TESTING

### 1. App Install & Launch
- [ ] App installs without errors
- [ ] Splash screen appears (blue background, "Smart Mechanic Finder")
- [ ] Login screen loads
- [ ] No crash on launch

### 2. Registration
- [ ] Registration screen opens from Login
- [ ] Step 1 (basic info) validates: name, email, password, confirm password, phone
- [ ] Password mismatch shows error
- [ ] Role selector (User / Mechanic) works
- [ ] **User registration**: submits and shows "Registration Successful"
- [ ] **Mechanic registration** (Step 2 shown):
  - [ ] Shop Name field works
  - [ ] Address field works
  - [ ] Latitude/Longitude fields trigger reverse geocoding
  - [ ] "Detect Location" button fills lat/lng and shows area name
  - [ ] Location name auto-populates (e.g. "Skardu, Gilgit-Baltistan")
  - [ ] Services (comma-separated) field works
  - [ ] Register button submits successfully

### 3. Login
- [ ] Login with `user@example.com / password123` → HomeScreen
- [ ] Login with `mechanic@example.com / password123` → MechanicDashboard
- [ ] Login with `admin@example.com / password123` → AdminDashboard
- [ ] Wrong password shows error message
- [ ] Show/hide password toggle works

### 4. User Flow — Home Screen
- [ ] Welcome message shows user name
- [ ] Location coordinates displayed (or GPS permission requested)
- [ ] "Find Mechanics Near You" card navigates to search
- [ ] "SOS Emergency" card navigates to SOS (red card)
- [ ] "My History" card navigates to history
- [ ] "Video Library" card navigates to videos
- [ ] "View Standard Pricing (SOP)" banner navigates to SOP
- [ ] "Emergency Service Alert" red banner navigates to alert screen
- [ ] Logout button (top right) shows confirmation dialog
- [ ] Pull-to-refresh works

### 5. Location Permission
- [ ] On first "Find Mechanics" or "SOS" tap, permission dialog appears
- [ ] Allowing permission shows location coordinates on home screen
- [ ] Denying permission shows graceful error (not a crash)

### 6. Find Mechanics (MechanicSearchScreen)
- [ ] Screen shows "Getting your location…" if GPS not ready
- [ ] Mechanic list loads with nearby mechanics
- [ ] Search bar filters mechanics by name/service
- [ ] List/Map view toggle works
- [ ] Map view shows markers for mechanics
- [ ] Filter modal opens (filter button top right):
  - [ ] Max Distance slider adjusts
  - [ ] Rating filter buttons work
  - [ ] Status filter (All/Open/Closed/Busy) works
  - [ ] Service type text input works
  - [ ] Reset button clears filters
  - [ ] Apply button applies filters
- [ ] Tapping a mechanic card navigates to MechanicDetail
- [ ] Pull-to-refresh reloads mechanic list

### 7. Mechanic Detail Screen
- [ ] Shop name, address, status display
- [ ] Map shows mechanic location (or graceful fallback without API key)
- [ ] Call button works (opens dialer)
- [ ] Rate button navigates to rating screen
- [ ] Services listed correctly
- [ ] Opening hours displayed
- [ ] Report button works

### 8. SOS Emergency
- [ ] SOS screen loads
- [ ] Red "EMERGENCY SOS" button is prominent
- [ ] Tapping shows confirmation dialog
- [ ] Without location permission, shows error message
- [ ] With location permission, sends SOS and shows "SOS Sent!"
- [ ] Active SOS requests appear in list
- [ ] Cancel request button works
- [ ] Emergency tips section shows (Police: 15, Rescue: 1122)
- [ ] **Offline**: shows alert "SOS requires internet connection"

### 9. Video Library
- [ ] Video list loads (should show 10 videos)
- [ ] Category tabs appear: All, Battery, Brakes, Cooling, Diagnostics, Maintenance, Oil Change, Tires
- [ ] Category filter changes displayed videos
- [ ] Search bar filters by title/description
- [ ] Tapping a video opens YouTube in browser
- [ ] Pull-to-refresh works
- [ ] **Offline**: shows cached videos with "Showing cached videos" notice

### 10. SOP Pricing
- [ ] SOP pricing list loads
- [ ] Category chips filter services
- [ ] Search bar filters by service name
- [ ] Each card shows: service name, price range (PKR), estimated time
- [ ] Pull-to-refresh works
- [ ] **Offline**: shows cached SOP with offline banner

### 11. Service History
- [ ] History list loads (test data from seed)
- [ ] Horizontal filter tabs scroll without overflow: All / Requested / In Progress / Completed / Cancelled
- [ ] Each filter shows correct subset
- [ ] History cards show: service type, status badge, mechanic name, cost
- [ ] "Rate Now" button navigates to rating screen
- [ ] Pull-to-refresh works
- [ ] **Offline**: shows cached history with offline banner

### 12. Rating System
- [ ] Rating screen loads with mechanic name
- [ ] Star rating selector works (1-5 stars)
- [ ] Sub-ratings work (punctuality, quality, communication)
- [ ] Review text input accepts text
- [ ] Submit button sends rating
- [ ] Already-rated mechanics show "Rated" badge

### 13. Emergency Alert (User)
- [ ] Screen opens with two tabs: Submit / My Alerts
- [ ] Alert type dropdown (Breakdown, Accident, Flat Tire, Battery Dead, Towing, Other)
- [ ] Description text area accepts input (min 10 chars enforced)
- [ ] Location text input works
- [ ] Submit button sends alert
- [ ] Success message shows
- [ ] "My Alerts" tab shows history with status badges
- [ ] Status colors correct: pending=orange, acknowledged=blue, resolved=green

### 14. Offline Mode
- [ ] Disconnect internet (airplane mode)
- [ ] Orange "You are offline" banner appears at top of screens
- [ ] Home screen still shows user name (cached)
- [ ] Mechanic list shows cached data with "Offline — cached data" indicator
- [ ] Video library shows cached videos
- [ ] SOP shows cached pricing
- [ ] History shows cached records
- [ ] SOS tap shows "SOS requires internet connection" alert (does not crash)
- [ ] Re-connect internet: banner disappears, data refreshes

### 15. Mechanic Dashboard
- [ ] Login as mechanic (`mechanic@example.com`)
- [ ] Dashboard shows shop name, verification status
- [ ] Status buttons (Open/Busy/Closed) update shop status
- [ ] Statistics cards show: Total Services, Average Rating, Pending Requests
- [ ] Quick actions: Services, History, Reviews, SOS
- [ ] Recent services list shows
- [ ] Pull-to-refresh works
- [ ] **No earning/payment data visible anywhere** ✅

### 16. Mechanic Ratings Screen
- [ ] Navigates from Dashboard → Reviews
- [ ] Overall average rating displayed
- [ ] Star distribution chart shows
- [ ] Individual review cards show
- [ ] No crash on load

### 17. Mechanic Profile
- [ ] Profile screen loads with current data (not empty)
- [ ] Shop name, address, phone fields populated
- [ ] Opening hours fields work
- [ ] Services edit works
- [ ] Save button updates profile
- [ ] No stale closure bug (data doesn't revert)

### 18. Admin Dashboard
- [ ] Login as admin (`admin@example.com`)
- [ ] Dashboard shows: Total Users, Total Mechanics, Pending Reports, Total Services
- [ ] **No revenue/earnings data visible anywhere** ✅
- [ ] Quick Actions: Users, Mechanics, Reports, Analytics, Alerts
- [ ] Recent Reports section shows
- [ ] Recent Users section shows
- [ ] SOS Status section shows
- [ ] Emergency Alerts section shows with status counts
- [ ] Pull-to-refresh works

### 19. Admin — Manage Users
- [ ] User list loads with pagination
- [ ] Search by name/email works
- [ ] Active/Inactive toggle works
- [ ] Delete (deactivate) button works with confirmation
- [ ] Admin users show purple badge
- [ ] Mechanic users show green badge

### 20. Admin — Manage Mechanics
- [ ] Mechanic list loads
- [ ] Search works
- [ ] Status filter chips (All/Open/Closed/Busy) work
- [ ] Verify/Unverify button works
- [ ] Ban/Unban button shows confirmation
- [ ] Banned mechanics show red left border

### 21. Admin — Reports
- [ ] Reports list loads
- [ ] Filter chips (All/Pending/Resolved/Dismissed) work
- [ ] Report cards show: mechanic, reporter, reason, status
- [ ] Update status works
- [ ] Ban Mechanic from report works

### 22. Admin — Emergency Alerts
- [ ] All alerts list loads
- [ ] Filter by status works
- [ ] Alert cards expandable
- [ ] Update status with notes works
- [ ] Status changes reflect immediately

### 23. Admin — Analytics
- [ ] Analytics screen loads
- [ ] Charts render without crash

### 24. Logout
- [ ] Logout button shows confirmation dialog
- [ ] Confirming logout returns to Login screen
- [ ] Token cleared (re-opening app shows Login, not Home)

---

## iOS DEVICE TESTING

> **Prerequisite:** macOS with Xcode 15+, run `cd mobile/ios && pod install` first.  
> See `IOS-SETUP-GUIDE.md` for full setup instructions.

### iOS Build
- [ ] `pod install` completes without errors
- [ ] Project opens in Xcode via `SmartMechanicFinder.xcworkspace`
- [ ] Build target set to iPhone simulator or connected device
- [ ] Build succeeds (`⌘B` in Xcode)
- [ ] App installs on device/simulator

### iOS Permissions
- [ ] Location permission dialog appears on first mechanic search
- [ ] Camera permission requested when accessing photo features
- [ ] Notifications permission requested (if applicable)

### iOS-Specific UI
- [ ] Safe area insets work (content not hidden under notch/Dynamic Island)
- [ ] Keyboard avoidance works on all forms (content scrolls up)
- [ ] Maps show Apple Maps tiles (no PROVIDER_GOOGLE crash)
- [ ] All fonts render correctly
- [ ] Pull-to-refresh works on all scroll views

### iOS Feature Parity
- [ ] All 24 Android test items above pass on iOS
- [ ] No iOS-specific crashes
- [ ] Offline mode works on iOS
- [ ] Videos open in Safari/YouTube app

---

## BACKEND DATABASE VERIFICATION

Run these to confirm MongoDB data:

```bash
cd backend
python -c "
from app.utils.database import get_db
from app import create_app
app = create_app()
with app.app_context():
    db = get_db()
    print('Users:', db.users.count_documents({}))
    print('Mechanics:', db.mechanics.count_documents({}))
    print('Videos:', db.videos.count_documents({'is_active': True}))
    print('SOP entries:', db.sop.count_documents({}))
    print('Emergency alerts:', db.emergency_alerts.count_documents({}))
"
```

Expected output:
```
Users: 3+
Mechanics: 5+
Videos: 10
SOP entries: 10+
Emergency alerts: 1+ (from checklist test)
```

---

## KNOWN LIMITATIONS

| Item | Status | Notes |
|------|--------|-------|
| Google Maps API key | ⚠️ Placeholder | Replace `YOUR_API_KEY_HERE` in AndroidManifest.xml and ios/Info.plist for real map tiles. App works without it (Apple Maps on iOS, graceful fallback on Android) |
| Firebase push notifications | ⚠️ Disabled | Add `google-services.json` to android/app/ and configure `FIREBASE_SERVER_KEY` in backend/.env |
| iOS `pod install` | ⚠️ Requires macOS | Cannot run on Windows. Use macOS machine to build for iOS |
| Background location (SOS) | ⚠️ Foreground only | Uncomment `ACCESS_BACKGROUND_LOCATION` in AndroidManifest.xml if needed |
| Production WSGI server | ⚠️ Dev only | Use Gunicorn/uWSGI instead of `python run.py` for production |

---

## QUICK SMOKE TEST (5 minutes)

If short on time, run just these critical path tests:

1. **Login** → `user@example.com / password123` ✓
2. **Find Mechanics** → location permission → list loads ✓
3. **Video Library** → 10 videos show ✓
4. **SOP** → pricing list shows ✓
5. **History** → filter tabs scroll horizontally ✓
6. **SOS** → confirmation dialog shows, sends with location ✓
7. **Mechanic Login** → `mechanic@example.com` → dashboard (no earnings) ✓
8. **Admin Login** → `admin@example.com` → dashboard (no revenue) ✓
9. **Offline** → airplane mode → banner shows, cached data displays ✓
10. **Logout** → confirmation → back to Login ✓
