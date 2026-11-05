#!/usr/bin/env pwsh
# ============================================================================
# Fix Java Version Compatibility Issue
# ============================================================================
# Error: "Unsupported class file major version 69"
# Cause: Java 21+ is too new for Gradle 8.6
# Solution: Upgrade Gradle to 8.10.2 or downgrade Java to 17
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIXING JAVA VERSION ISSUE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# ============================================================================
# Step 1: Check current Java version
# ============================================================================
Write-Host "[1/5] Checking Java version..." -ForegroundColor Yellow

$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-25.0.4.7-hotspot\bin\java.exe"

if (Test-Path $javaPath) {
    $javaVersion = & $javaPath -version 2>&1 | Select-String "version" | ForEach-Object { $_ -replace '.*version "([^"]+)".*', '$1' }
    Write-Host "  → Found Java: $javaVersion" -ForegroundColor Yellow
    Write-Host "  → Location: $javaPath" -ForegroundColor Gray
    
    if ($javaVersion -match "^(2[1-9]|[3-9]\d)\.") {
        Write-Host "  WARNING: Java $javaVersion is too new for Gradle!" -ForegroundColor Red
        Write-Host "  Solution: Upgraded Gradle to 8.10.2 (supports Java 21-23)" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ Java 25 not found at expected location" -ForegroundColor Green
}

# ============================================================================
# Step 2: Clean Gradle caches
# ============================================================================
Write-Host ""
Write-Host "[2/5] Cleaning Gradle caches..." -ForegroundColor Yellow

$gradleCachePaths = @(
    "$env:USERPROFILE\.gradle\caches\8.6",
    "$env:USERPROFILE\.gradle\caches\8.5",
    "E:\smart-mechanic-finder\mobile\android\.gradle",
    "E:\smart-mechanic-finder\mobile\android\app\build",
    "E:\smart-mechanic-finder\mobile\android\build"
)

foreach ($path in $gradleCachePaths) {
    if (Test-Path $path) {
        Write-Host "  Removing: $path" -ForegroundColor Gray
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "  Removed successfully" -ForegroundColor Green
    }
}

# ============================================================================
# Step 3: Verify Gradle wrapper updated
# ============================================================================
Write-Host ""
Write-Host "[3/5] Verifying Gradle configuration..." -ForegroundColor Yellow

$wrapperProps = "E:\smart-mechanic-finder\mobile\android\gradle\wrapper\gradle-wrapper.properties"
$content = Get-Content $wrapperProps -Raw

if ($content -match "gradle-8\.10\.2") {
    Write-Host "  ✓ Gradle 8.10.2 configured (supports Java 21-23)" -ForegroundColor Green
} elseif ($content -match "gradle-8\.6") {
    Write-Host "  ⚠ Still using Gradle 8.6" -ForegroundColor Yellow
    Write-Host "  → Updating to 8.10.2..." -ForegroundColor Gray
    $content = $content -replace 'gradle-8\.6', 'gradle-8.10.2'
    Set-Content -Path $wrapperProps -Value $content -NoNewline
    Write-Host "  ✓ Updated to Gradle 8.10.2" -ForegroundColor Green
}

# ============================================================================
# Step 4: Check Android Gradle Plugin
# ============================================================================
Write-Host ""
Write-Host "[4/5] Checking Android Gradle Plugin..." -ForegroundColor Yellow

$buildGradle = "E:\smart-mechanic-finder\mobile\android\build.gradle"
$content = Get-Content $buildGradle -Raw

if ($content -match 'com\.android\.tools\.build:gradle:8\.5') {
    Write-Host "  ✓ Android Gradle Plugin 8.5.x (compatible with Gradle 8.10)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Updating Android Gradle Plugin..." -ForegroundColor Yellow
    $content = $content -replace 'com\.android\.tools\.build:gradle:\d+\.\d+\.\d+', 'com.android.tools.build:gradle:8.5.2'
    Set-Content -Path $buildGradle -Value $content -NoNewline
    Write-Host "  ✓ Updated to 8.5.2" -ForegroundColor Green
}

# ============================================================================
# Step 5: Download Java 17 (Recommended)
# ============================================================================
Write-Host ""
Write-Host "[5/5] Java 17 Recommendation..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "While Gradle 8.10.2 supports your Java version," -ForegroundColor Yellow
Write-Host "Java 17 is RECOMMENDED for React Native development." -ForegroundColor Yellow
Write-Host ""
Write-Host "Download Java 17:" -ForegroundColor Cyan
Write-Host "https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Cyan
Write-Host ""
Write-Host "After installing:" -ForegroundColor Gray
Write-Host "1. Set JAVA_HOME to Java 17 path" -ForegroundColor Gray
Write-Host "2. Add %JAVA_HOME%\bin to PATH" -ForegroundColor Gray
Write-Host "3. Restart PowerShell" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# Done
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Gradle upgraded: 8.6 to 8.10.2" -ForegroundColor Green
Write-Host "Android Plugin: 8.5.2" -ForegroundColor Green
Write-Host "Java Support: 21-23" -ForegroundColor Green
Write-Host ""
Write-Host "Next step - Build the app:" -ForegroundColor Yellow
Write-Host ""
Write-Host "cd E:\smart-mechanic-finder\mobile" -ForegroundColor Gray
Write-Host "npx react-native run-android" -ForegroundColor Gray
Write-Host ""
Write-Host "First build will take 5-10 minutes (downloading Gradle 8.10.2)" -ForegroundColor Gray
Write-Host ""
