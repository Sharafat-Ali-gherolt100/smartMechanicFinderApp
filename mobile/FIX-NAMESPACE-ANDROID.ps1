#!/usr/bin/env pwsh
# ============================================================================
# Fix Namespace Issues for React Native Android Build
# ============================================================================
# This script fixes the "Namespace not specified" error for all libraries
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIXING NAMESPACE ISSUES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$projectRoot = "E:\smart-mechanic-finder\mobile"

# ============================================================================
# Fix @react-native-community/netinfo
# ============================================================================
Write-Host "[1/5] Fixing @react-native-community/netinfo..." -ForegroundColor Yellow

$netinfoGradle = "$projectRoot\node_modules\@react-native-community\netinfo\android\build.gradle"

if (Test-Path $netinfoGradle) {
    $content = Get-Content $netinfoGradle -Raw
    
    if ($content -notmatch 'namespace\s+"com\.reactnativecommunity\.netinfo"') {
        Write-Host "  → Adding namespace to netinfo..." -ForegroundColor Gray
        
        $content = $content -replace 'apply plugin: ''com\.android\.library''\s+android\s+\{', @'
apply plugin: 'com.android.library'

android {
  namespace "com.reactnativecommunity.netinfo"
'@
        
        Set-Content -Path $netinfoGradle -Value $content -NoNewline
        Write-Host "  ✓ Fixed netinfo namespace" -ForegroundColor Green
    } else {
        Write-Host "  ✓ netinfo namespace already present" -ForegroundColor Green
    }
} else {
    Write-Host "  ✗ netinfo build.gradle not found" -ForegroundColor Red
}

# ============================================================================
# Fix react-native-geolocation-service
# ============================================================================
Write-Host "[2/5] Fixing react-native-geolocation-service..." -ForegroundColor Yellow

$geoGradle = "$projectRoot\node_modules\react-native-geolocation-service\android\build.gradle"

if (Test-Path $geoGradle) {
    $content = Get-Content $geoGradle -Raw
    
    if ($content -notmatch 'namespace\s+"com\.agontuk\.RNFusedLocation"') {
        Write-Host "  → Adding namespace to geolocation-service..." -ForegroundColor Gray
        
        $content = $content -replace 'android\s+\{\s+compileSdkVersion', @'
android {
  namespace "com.agontuk.RNFusedLocation"
  compileSdkVersion
'@
        
        Set-Content -Path $geoGradle -Value $content -NoNewline
        Write-Host "  ✓ Fixed geolocation-service namespace" -ForegroundColor Green
    } else {
        Write-Host "  ✓ geolocation-service namespace already present" -ForegroundColor Green
    }
} else {
    Write-Host "  ✗ geolocation-service build.gradle not found" -ForegroundColor Red
}

# ============================================================================
# Verify other libraries have namespace
# ============================================================================
Write-Host "[3/5] Verifying other libraries..." -ForegroundColor Yellow

# Check vector-icons
$vectorIconsGradle = "$projectRoot\node_modules\react-native-vector-icons\android\build.gradle"
if (Test-Path $vectorIconsGradle) {
    $content = Get-Content $vectorIconsGradle -Raw
    if ($content -match 'namespace') {
        Write-Host "  ✓ react-native-vector-icons has namespace" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ react-native-vector-icons missing namespace (adding...)" -ForegroundColor Yellow
        $content = $content -replace 'android\s+\{\s+compileSdkVersion', @'
android {
    namespace = "com.oblador.vectoricons"
    compileSdkVersion
'@
        Set-Content -Path $vectorIconsGradle -Value $content -NoNewline
        Write-Host "  ✓ Fixed vector-icons namespace" -ForegroundColor Green
    }
}

# Check maps
$mapsGradle = "$projectRoot\node_modules\react-native-maps\android\build.gradle"
if (Test-Path $mapsGradle) {
    $content = Get-Content $mapsGradle -Raw
    if ($content -match 'namespace') {
        Write-Host "  ✓ react-native-maps has namespace" -ForegroundColor Green
    }
}

# ============================================================================
# Clean build artifacts
# ============================================================================
Write-Host "[4/5] Cleaning build artifacts..." -ForegroundColor Yellow

cd $projectRoot

if (Test-Path "android\.gradle") {
    Remove-Item -Recurse -Force "android\.gradle" -ErrorAction SilentlyContinue
}

if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue
}

if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build" -ErrorAction SilentlyContinue
}

Write-Host "  ✓ Build cache cleaned" -ForegroundColor Green

# ============================================================================
# Verify Java version
# ============================================================================
Write-Host "[5/5] Verifying Java version..." -ForegroundColor Yellow

try {
    $javaVersion = java -version 2>&1 | Select-String "version" | ForEach-Object { $_ -replace '.*version "([^"]+)".*', '$1' }
    
    if ($javaVersion -match "^17\.") {
        Write-Host "  ✓ Java 17 detected: $javaVersion" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Java version: $javaVersion" -ForegroundColor Yellow
        Write-Host "  → Recommended: Java 17" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ✗ Java not found in PATH" -ForegroundColor Red
}

# ============================================================================
# Done
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ NAMESPACE FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Build the app:" -ForegroundColor White
Write-Host "   cd E:\smart-mechanic-finder\mobile" -ForegroundColor Gray
Write-Host "   npx react-native run-android" -ForegroundColor Gray
Write-Host ""
Write-Host "Or clean build:" -ForegroundColor White
Write-Host "   cd android" -ForegroundColor Gray
Write-Host "   .\gradlew clean" -ForegroundColor Gray
Write-Host "   cd .." -ForegroundColor Gray
Write-Host "   npx react-native run-android" -ForegroundColor Gray
Write-Host ""
