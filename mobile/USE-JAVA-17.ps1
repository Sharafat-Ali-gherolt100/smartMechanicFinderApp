Write-Host ""
Write-Host "========================================"
Write-Host "  SWITCHING TO JAVA 17"
Write-Host "========================================"
Write-Host ""

# Set Java 17 path
$java17Path = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"

if (Test-Path "$java17Path\bin\java.exe") {
    Write-Host "[1/4] Found Java 17 at:" -ForegroundColor Green
    Write-Host "  $java17Path" -ForegroundColor Gray
    Write-Host ""
    
    # Set for this session
    Write-Host "[2/4] Setting JAVA_HOME for this session..." -ForegroundColor Yellow
    $env:JAVA_HOME = $java17Path
    $env:PATH = "$java17Path\bin;$env:PATH"
    
    Write-Host "  JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green
    Write-Host ""
    
    # Verify
    Write-Host "[3/4] Verifying Java version..." -ForegroundColor Yellow
    & "$java17Path\bin\java.exe" -version
    Write-Host ""
    
    # Clean Gradle cache
    Write-Host "[4/4] Cleaning Gradle cache..." -ForegroundColor Yellow
    $gradleCache = "$env:USERPROFILE\.gradle"
    if (Test-Path $gradleCache) {
        Remove-Item -Recurse -Force "$gradleCache\caches" -ErrorAction SilentlyContinue
        Write-Host "  Gradle cache cleaned" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  READY TO BUILD!"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Java 17 is now active for this PowerShell session." -ForegroundColor Green
    Write-Host ""
    Write-Host "Build your app:" -ForegroundColor Cyan
    Write-Host "  npx react-native run-android" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANT: Keep using THIS PowerShell window!" -ForegroundColor Yellow
    Write-Host ""
    
} else {
    Write-Host "ERROR: Java 17 not found at expected location!" -ForegroundColor Red
    Write-Host "Expected: $java17Path" -ForegroundColor Gray
}
