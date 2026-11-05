#!/usr/bin/env pwsh
# ============================================================================
# Smart Mechanic Finder - COMPLETE ANDROID FIX SCRIPT
# ============================================================================
# This script fixes ALL Android/Gradle issues and prepares the app for USB deployment
# Run this ONCE before building the app
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SMART MECHANIC FINDER - ANDROID FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# ============================================================================
# STEP 1: Verify Java 17
# ============================================================================
Write-Host "[1/7] Checking Java version..." -ForegroundColor Yellow

try {
    $javaVersion = java -version 2>&1 | Select-String "version" | ForEach-Object { $_ -replace '.*version "([^"]+)".*', '$1' }
    Write-Host "✓ Java version: $javaVersion" -ForegroundColor Green
    
    if ($javaVersion -notmatch "^17\.") {
        Write-Host "" -ForegroundColor Red
        Write-Host "WARNING: Java 17 is required!" -ForegroundColor Red
        Write-Host "Current version: $javaVersion" -ForegroundColor Red
        Write-Host "" -ForegroundColor Yellow
        Write-Host "Download Java 17 from: https://adoptium.net" -ForegroundColor Yellow
        Write-Host "Then set JAVA_HOME environment variable to Java 17 path" -ForegroundColor Yellow
        Write-Host "" -ForegroundColor Yellow
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y") {
            exit 1
        }
    }
} catch {
    Write-Host "✗ Java not found!" -ForegroundColor Red
    Write-Host "Install Java 17 from: https://adoptium.net" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# STEP 2: Verify Android SDK
# ============================================================================
Write-Host "[2/7] Checking Android SDK..." -ForegroundColor Yellow

if (-not $env:ANDROID_HOME) {
    Write-Host "✗ ANDROID_HOME not set!" -ForegroundColor Red
    Write-Host "Please set ANDROID_HOME environment variable to your Android SDK path" -ForegroundColor Yellow
    Write-Host "Example: C:\Users\YourName\AppData\Local\Android\Sdk" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe")) {
    Write-Host "✗ Android SDK not found at: $env:ANDROID_HOME" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Android SDK found: $env:ANDROID_HOME" -ForegroundColor Green

# ============================================================================
# STEP 3: Clean old build artifacts
# ============================================================================
Write-Host "[3/7] Cleaning old build artifacts..." -ForegroundColor Yellow

$projectRoot = "E:\smart-mechanic-finder\mobile"
cd $projectRoot

# Clean Android build
if (Test-Path "android\.gradle") {
    Remove-Item -Recurse -Force "android\.gradle" -ErrorAction SilentlyContinue
    Write-Host "✓ Removed .gradle cache" -ForegroundColor Green
}

if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue
    Write-Host "✓ Removed app/build" -ForegroundColor Green
}

if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build" -ErrorAction SilentlyContinue
    Write-Host "✓ Removed build directory" -ForegroundColor Green
}

# Clean React Native cache
if (Test-Path "node_modules") {
    Write-Host "→ node_modules exists (keeping)" -ForegroundColor Gray
}

Write-Host "✓ Clean complete" -ForegroundColor Green

# ============================================================================
# STEP 4: Install Node dependencies
# ============================================================================
Write-Host "[4/7] Installing Node dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ npm install failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# ============================================================================
# STEP 5: Generate debug keystore
# ============================================================================
Write-Host "[5/7] Checking debug keystore..." -ForegroundColor Yellow

$keystorePath = "android\app\debug.keystore"
if (-not (Test-Path $keystorePath)) {
    Write-Host "→ Generating debug keystore..." -ForegroundColor Gray
    
    keytool -genkey -v -keystore $keystorePath `
        -storepass android `
        -alias androiddebugkey `
        -keypass android `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -dname "CN=Android Debug,O=Android,C=US"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Keystore generation failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Debug keystore created" -ForegroundColor Green
} else {
    Write-Host "✓ Debug keystore exists" -ForegroundColor Green
}

# ============================================================================
# STEP 6: Check USB device connection
# ============================================================================
Write-Host "[6/7] Checking connected Android devices..." -ForegroundColor Yellow

$devices = & "$env:ANDROID_HOME\platform-tools\adb.exe" devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }

if ($devices.Count -eq 0) {
    Write-Host "" -ForegroundColor Yellow
    Write-Host "⚠ No Android devices connected!" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Gray
    Write-Host "To connect your Android phone via USB:" -ForegroundColor Gray
    Write-Host "  1. Enable Developer Options (Settings → About → tap Build Number 7 times)" -ForegroundColor Gray
    Write-Host "  2. Enable USB Debugging (Settings → Developer Options)" -ForegroundColor Gray
    Write-Host "  3. Connect phone via USB cable" -ForegroundColor Gray
    Write-Host "  4. Accept 'Allow USB Debugging' prompt on phone" -ForegroundColor Gray
    Write-Host "" -ForegroundColor Gray
    Write-Host "Or start an Android Emulator from Android Studio" -ForegroundColor Gray
    Write-Host "" -ForegroundColor Yellow
} else {
    Write-Host "✓ Connected devices:" -ForegroundColor Green
    & "$env:ANDROID_HOME\platform-tools\adb.exe" devices | Select-Object -Skip 1 | ForEach-Object {
        if ($_ -match "device$") {
            Write-Host "  → $_" -ForegroundColor Green
        }
    }
}

# ============================================================================
# STEP 7: Configure backend IP address
# ============================================================================
Write-Host "[7/7] Checking API configuration..." -ForegroundColor Yellow

$apiConfigPath = "src\components\services\api.js"
if (Test-Path $apiConfigPath) {
    $apiConfig = Get-Content $apiConfigPath -Raw
    
    if ($apiConfig -match "PHYSICAL_DEVICE_HOST = '([^']+)'") {
        $currentIP = $matches[1]
        Write-Host "✓ Current backend IP: $currentIP" -ForegroundColor Green
    }
    
    if ($apiConfig -match "USE_PHYSICAL_DEVICE_IP = (true|false)") {
        $usePhysical = $matches[1]
        Write-Host "✓ Using physical device IP: $usePhysical" -ForegroundColor Green
    }
    
    Write-Host "" -ForegroundColor Yellow
    Write-Host "IMPORTANT: Configure your PC's IP address!" -ForegroundColor Yellow
    Write-Host "→ Edit: mobile\src\components\services\api.js" -ForegroundColor Gray
    Write-Host "→ Set PHYSICAL_DEVICE_HOST to your PC's Wi-Fi IP" -ForegroundColor Gray
    Write-Host "" -ForegroundColor Gray
    Write-Host "Your current PC IP addresses:" -ForegroundColor Gray
    ipconfig | Select-String "IPv4" | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Cyan
    }
    Write-Host ""
}

# ============================================================================
# DONE
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ ANDROID FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Update backend IP in api.js (if using physical device)" -ForegroundColor White
Write-Host "   → Edit: mobile\src\components\services\api.js" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start backend server (Terminal 1):" -ForegroundColor White
Write-Host "   cd E:\smart-mechanic-finder\backend" -ForegroundColor Gray
Write-Host "   ..\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   python run.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start Metro bundler (Terminal 2):" -ForegroundColor White
Write-Host "   cd E:\smart-mechanic-finder\mobile" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Build and install app (Terminal 3):" -ForegroundColor White
Write-Host "   cd E:\smart-mechanic-finder\mobile" -ForegroundColor Gray
Write-Host "   npx react-native run-android" -ForegroundColor Gray
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Cyan
Write-Host "  User: user@example.com / password123" -ForegroundColor Gray
Write-Host "  Mechanic: mechanic@example.com / password123" -ForegroundColor Gray
Write-Host "  Admin: admin@example.com / password123" -ForegroundColor Gray
Write-Host ""
