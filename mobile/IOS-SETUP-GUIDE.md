# iOS Build & Setup Guide — Smart Mechanic Finder

## Prerequisites (macOS only)
- macOS 12 Monterey or later
- Xcode 15+ (from Mac App Store)
- CocoaPods: `sudo gem install cocoapods`
- Node 18+, npm 9+
- Ruby 3.0+ (use rbenv if needed)

---

## Step 1 — Install JS dependencies (if not done)
```bash
cd mobile
npm install
```

---

## Step 2 — Install CocoaPods dependencies
```bash
cd mobile/ios
pod install
```
This generates `SmartMechanicFinder.xcworkspace`. Always open the **workspace**, not the `.xcodeproj`.

---

## Step 3 — Open in Xcode
```bash
open ios/SmartMechanicFinder.xcworkspace
```

---

## Step 4 — Configure signing
1. In Xcode, select the **SmartMechanicFinder** target
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (Apple Developer account)
4. The Bundle ID is `com.smartmechanicfinder` — change if needed

---

## Step 5 — Add Google Maps API Key
Edit `ios/SmartMechanicFinder/Info.plist` and replace:
```xml
<string>YOUR_API_KEY_HERE</string>
```
with your real key from [Google Cloud Console](https://console.cloud.google.com/).

Enable these APIs:
- Maps SDK for iOS
- Maps SDK for Android  
- Geocoding API

---

## Step 6 — Run on simulator
```bash
cd mobile
npx react-native run-ios
```
Or in Xcode, press `⌘R` with a simulator selected.

---

## Step 7 — Run on physical iPhone
1. Connect iPhone via USB
2. Trust the computer on the iPhone
3. Select your iPhone in Xcode's device list
4. Press `⌘R` to build and install

---

## iOS Permissions Configured
All permissions are set in `ios/SmartMechanicFinder/Info.plist`:

| Permission | Key | Purpose |
|---|---|---|
| Location (in use) | `NSLocationWhenInUseUsageDescription` | Find nearby mechanics |
| Location (always) | `NSLocationAlwaysAndWhenInUseUsageDescription` | SOS background |
| Camera | `NSCameraUsageDescription` | Upload vehicle photos |
| Photo Library | `NSPhotoLibraryUsageDescription` | Browse photos |
| Photo Library Add | `NSPhotoLibraryAddUsageDescription` | Save photos |

---

## iOS-Specific Code Fixes Applied
1. **Maps**: Removed `PROVIDER_GOOGLE` from `MechanicSearchScreen` — iOS uses Apple Maps by default (no API key needed for basic maps)
2. **HTTP traffic**: `NSAllowsArbitraryLoads = true` in Info.plist for local backend
3. **KeyboardAvoidingView**: All forms use `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`
4. **SafeAreaView**: Navigation headers handle safe areas automatically via React Navigation
5. **NetInfo**: `@react-native-community/netinfo` included in Podfile

---

## Common Issues

### Pod install fails with "No such module"
```bash
cd ios && pod deintegrate && pod install
```

### Build fails with signing error
- Xcode → Preferences → Accounts → Add Apple ID
- Set team in Signing & Capabilities

### App crashes on launch
- Check Metro bundler is running: `npx react-native start`
- Check backend IP in `src/components/services/api.js` → `PHYSICAL_DEVICE_HOST`

### Maps not showing
- Add real Google Maps API key to Info.plist
- On iOS, maps will show Apple Maps tiles without a key (default behavior)

### Location permission denied
- Go to iPhone Settings → Privacy → Location Services → SmartMechanicFinder → Allow While Using App

---

## Backend Connection from iPhone
Edit `mobile/src/components/services/api.js`:
```javascript
const PHYSICAL_DEVICE_HOST = '192.168.x.x'; // Your Mac's WiFi IP
const USE_PHYSICAL_DEVICE_IP = true;
```
iPhone and Mac must be on the **same WiFi network**.

Find your Mac's IP: System Settings → Wi-Fi → Details → IP Address

---

## Test Credentials
```
User:     user@example.com / password123
Mechanic: mechanic@example.com / password123
Admin:    admin@example.com / password123
```
