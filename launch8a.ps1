$ErrorActionPreference = 'SilentlyContinue'
$base = 'C:\JUAN_JOSE_MENDOZA_CONDORI\BomberoWeb\bomberos_gral'
$be = Join-Path $base 'backend'
$fe = Join-Path $base 'bomberos-frontend'
$lg = Join-Path $env:TEMP 'opencode'
New-Item -ItemType Directory -Force -Path $lg | Out-Null

# 1. Matar puertos 3000 y 5173
Get-NetTCPConnection -LocalPort 3000,5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 1000

$bO = Join-Path $lg 'b8a_out.log'
$bE = Join-Path $lg 'b8a_err.log'
$fO = Join-Path $lg 'f8a_out.log'
$fE = Join-Path $lg 'f8a_err.log'

# 2. Backend
$bp = Start-Process -FilePath 'node.exe' -ArgumentList 'dist/main.js' -WorkingDirectory $be -RedirectStandardOutput $bO -RedirectStandardError $bE -PassThru -WindowStyle Hidden
Write-Output "BACKEND_PID=$($bp.Id)"

$ready = $false
for ($i = 0; $i -lt 45; $i++) {
  Start-Sleep -Milliseconds 1000
  try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/mapa/solicitudes' -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -ge 400) { $ready = $true; break }
  } catch {
    if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -ge 400) { $ready = $true; break }
  }
}
Write-Output "BACKEND_READY=$ready"
if (-not $ready) {
  Write-Output '--- b8a_err.log ---'
  Get-Content $bE -Tail 40 -ErrorAction SilentlyContinue
  exit 1
}

# 3. Frontend
$fp = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory $fe -RedirectStandardOutput $fO -RedirectStandardError $fE -PassThru -WindowStyle Hidden
Write-Output "FRONTEND_PID=$($fp.Id)"
Start-Sleep -Seconds 10

$fok = $false
try {
  $fr = Invoke-WebRequest -Uri 'http://localhost:5173/admin/mapa' -UseBasicParsing -TimeoutSec 4
  if ($fr.StatusCode -ge 200) { $fok = $true }
} catch {
  if ($_.Exception.Response) { $fok = $true }
}
Write-Output "FRONTEND_MAPA_READY=$fok"
Write-Output "ALL_SET=$($ready -and $fok)"