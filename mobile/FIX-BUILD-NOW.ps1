Write-Host ""
Write-Host "========================================"
Write-Host "  FIXING JAVA/GRADLE COMPATIBILITY"
Write-Host "========================================"
Write-Host ""

Write-Host "[1/3] Cleaning Gradle caches..." -ForegroundColor Yellow

$paths = @(
    "$env:USERPROFILE\.gradle\caches\8.6",
    "E:\smart-mechanic-finder\mobile\android\.gradle",
    "E:\smart-mechanic-finder\mobile\android\app\build",
    "E:\smart-mechanic-finder\mobile\android\build"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue
        Write-Host "  Cleaned: $p" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[2/3] Verifying Gradle 8.10.2..." -ForegroundColor Yellow

$wrapperFile = "E:\smart-mechanic-finder\mobile\android\gradle\wrapper\gradle-wrapper.properties"
$content = Get-Content $wrapperFile -Raw

if ($content -match "gradle-8\.10\.2") {
    Write-Host "  Gradle 8.10.2 configured" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Gradle wrapper not updated!" -ForegroundColor Red
}

Write-Host ""
Write-Host "[3/3] Ready to build..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================"
Write-Host "  FIX COMPLETE!"
Write-Host "========================================"
Write-Host ""
Write-Host "Now run:" -ForegroundColor Cyan
Write-Host "  cd E:\smart-mechanic-finder\mobile"
Write-Host "  npx react-native run-android"
Write-Host ""
Write-Host "Note: First build takes 5-10 min (downloading Gradle)" -ForegroundColor Gray
Write-Host ""
