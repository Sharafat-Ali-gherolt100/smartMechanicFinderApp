Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  COMPLETE ANDROID BUILD SETUP" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# ============================================================================
# Step 1: Switch to Java 17
# ============================================================================
Write-Host "[1/5] Switching to Java 17..." -ForegroundColor Yellow

$java17Path = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"

if (Test-Path "$java17Path\bin\java.exe") {
    $env:JAVA_HOME = $java17Path
    $env:PATH = "$java17Path\bin;$env:PATH"
    
    $javaVersion = & "$java17Path\bin\java.exe" -version 2>&1 | Select-String "version"
    Write-Host "  Java 17 activated: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Java 17 not found!" -ForegroundColor Red
    Write-Host "  Install from: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================================================
# Step 2: Set up Android SDK paths
# ============================================================================
Write-Host "[2/5] Setting up Android SDK..." -ForegroundColor Yellow

$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    # Try common locations
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $androidHome = $path
            $env:ANDROID_HOME = $androidHome
            break
        }
    }
}

if ($androidHome -and (Test-Path $androidHome)) {
    Write-Host "  ANDROID_HOME: $androidHome" -ForegroundColor Green
    
    # Add to PATH
    $env:PATH = "$androidHome\platform-tools;$androidHome\tools;$env:PATH"
    
    # Verify adb
    if (Test-Path "$androidHome\platform-tools\adb.exe") {
        Write-Host "  adb found" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: adb.exe not found in platform-tools" -ForegroundColor Yellow
    }
} else {
    Write-Host "  WARNING: ANDROID_HOME not set!" -ForegroundColor Red
    Write-Host "  Please install Android SDK or set ANDROID_HOME" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 3: Check for connected devices
# ============================================================================
Write-Host "[3/5] Checking for Android devices..." -ForegroundColor Yellow

if ($androidHome -and (Test-Path "$androidHome\platform-tools\adb.exe")) {
    $devices = & "$androidHome\platform-tools\adb.exe" devices 2>&1 | Select-String "device$"
    
    if ($devices.Count -gt 0) {
        Write-Host "  Connected devices:" -ForegroundColor Green
        & "$androidHome\platform-tools\adb.exe" devices
    } else {
        Write-Host "  No devices connected" -ForegroundColor Yellow
        Write-Host "  Connect your phone via USB or start an emulator" -ForegroundColor Gray
    }
} else {
    Write-Host "  Skipping (adb not available)" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# Step 4: Clean Gradle cache
# ============================================================================
Write-Host "[4/5] Cleaning Gradle cache..." -ForegroundColor Yellow

$paths = @(
    "$env:USERPROFILE\.gradle\caches",
    "E:\smart-mechanic-finder\mobile\android\.gradle",
    "E:\smart-mechanic-finder\mobile\android\app\build",
    "E:\smart-mechanic-finder\mobile\android\build"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "  Cleaned: $(Split-Path $path -Leaf)" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================================================
# Step 5: Ready to build
# ============================================================================
Write-Host "[5/5] Environment ready!" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE - READY TO BUILD!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Current configuration:" -ForegroundColor Cyan
Write-Host "  Java: 17 (openjdk)" -ForegroundColor White
Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor White
if ($androidHome) {
    Write-Host "  ANDROID_HOME: $androidHome" -ForegroundColor White
}
Write-Host ""
Write-Host "Build your app now:" -ForegroundColor Cyan
Write-Host "  cd E:\smart-mechanic-finder\mobile" -ForegroundColor White
Write-Host "  npx react-native run-android" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "  Use THIS PowerShell window to build!" -ForegroundColor Yellow
Write-Host "  Java 17 is only active in this session." -ForegroundColor Yellow
Write-Host ""
Write-Host "First build: 3-5 minutes" -ForegroundColor Gray
Write-Host "Subsequent builds: 30-90 seconds" -ForegroundColor Gray
Write-Host ""
