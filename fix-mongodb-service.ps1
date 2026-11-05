# Permanently fix MongoDB Windows Service configuration and set to auto-start
$cfgPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg"
if (Test-Path $cfgPath) {
    Write-Host "Reading $cfgPath..."
    $lines = Get-Content $cfgPath
    $cleanLines = $lines | Where-Object { $_ -notmatch 'journal:' -and $_ -notmatch 'enabled: true' }
    Set-Content -Path $cfgPath -Value $cleanLines -Force
    Write-Host "Updated mongod.cfg successfully (removed unsupported journal setting)."
}

Write-Host "Setting MongoDB service startup type to Automatic..."
Set-Service -Name MongoDB -StartupType Automatic
Write-Host "Starting MongoDB service..."
Start-Service -Name MongoDB
Write-Host "MongoDB service status:"
Get-Service -Name MongoDB
