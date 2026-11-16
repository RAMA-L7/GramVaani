<# 
.SYNOPSIS
  Start GramVaani pilot backend and frontend in separate processes/windows.
.DESCRIPTION
  Pilot ports (avoid sandbox 8000/3000):
    Backend  (FastAPI/uvicorn): http://localhost:8010
    Frontend (Next.js dev):     http://localhost:3010

  Requires: Python + uv (backend), Node.js + pnpm (frontend), and populated .env as needed.
  This script is Windows-friendly and does not modify sandbox or config/report-fields.json.
#>
[CmdletBinding()]
param(
  [int]$BackendPort = 8010,
  [int]$FrontendPort = 3010,
  [switch]$NoWindow
)

$ErrorActionPreference = 'Stop'
$PilotRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $PilotRoot 'backend'
$FrontendDir = Join-Path $PilotRoot 'frontend'
$EnvExample = Join-Path $PilotRoot '.env.example'
$EnvFile = Join-Path $PilotRoot '.env'

Write-Host "GramVaani pilot startup" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:$BackendPort"
Write-Host "  Frontend: http://localhost:$FrontendPort"
Write-Host "  (Sandbox uses 8000/3000; pilot uses separate ports)"

if (-not (Test-Path $EnvFile) -and (Test-Path $EnvExample)) {
  Write-Warning "No pilot/.env found. Copy .env.example to .env and adjust as needed: Copy-Item `"$EnvExample`" `"$EnvFile`""
}

function Start-InWindow([string]$Title, [string]$WorkDir, [string]$Command) {
  if ($NoWindow) {
    Write-Host "[$Title] $Command" -ForegroundColor DarkGray
    Start-Process -FilePath "powershell.exe" -ArgumentList @('-NoProfile','-Command', "Set-Location `"$WorkDir`"; $Command") -NoNewWindow
  } else {
    Start-Process -FilePath "powershell.exe" -ArgumentList @('-NoExit','-NoProfile','-Command', "`$host.UI.RawUI.WindowTitle='$Title'; Set-Location `"$WorkDir`"; $Command")
  }
}

# --- Backend ---
if (Test-Path $BackendDir) {
  $hasPyProject = Test-Path (Join-Path $BackendDir 'pyproject.toml')
  $hasApp = (Test-Path (Join-Path $BackendDir 'app\main.py')) -or (Test-Path (Join-Path $BackendDir 'main.py'))
  if ($hasPyProject -or $hasApp) {
    $backendCmd = "uv run uvicorn app.main:app --host 127.0.0.1 --port $BackendPort --reload"
    if (-not (Test-Path (Join-Path $BackendDir 'app\main.py')) -and (Test-Path (Join-Path $BackendDir 'main.py'))) {
      $backendCmd = "uv run uvicorn main:app --host 127.0.0.1 --port $BackendPort --reload"
    }
    Write-Host "Starting backend..." -ForegroundColor Green
    Start-InWindow -Title "GramVaani Pilot Backend ($BackendPort)" -WorkDir $BackendDir -Command $backendCmd
  } else {
    Write-Warning "Backend directory exists but no runnable entrypoint detected (expected pyproject.toml and app/main.py or main.py). Skipping backend start. Run 'uv sync' after backend is scaffolded."
  }
} else {
  Write-Warning "Missing $BackendDir. Create backend scaffold, then run: cd pilot\backend; uv sync; uv run uvicorn app.main:app --host 127.0.0.1 --port $BackendPort --reload"
}

# --- Frontend ---
if (Test-Path $FrontendDir) {
  $hasPkg = Test-Path (Join-Path $FrontendDir 'package.json')
  if ($hasPkg) {
    $nodeExe = "C:\Program Files\nodejs\node.exe"
    $nextBin = Join-Path $FrontendDir 'node_modules\next\dist\bin\next'
    if ((Test-Path $nodeExe) -and (Test-Path $nextBin)) {
      $frontendCmd = "& '$nodeExe' '$nextBin' dev --port $FrontendPort"
    } else {
      $frontendCmd = "`$env:PORT='$FrontendPort'; pnpm dev --port $FrontendPort"
    }
    Write-Host "Starting frontend..." -ForegroundColor Green
    Start-InWindow -Title "GramVaani Pilot Frontend ($FrontendPort)" -WorkDir $FrontendDir -Command $frontendCmd
  } else {
    Write-Warning "Frontend directory exists but package.json not found. Skipping frontend start. Run: cd pilot\frontend; pnpm install; pnpm dev --port $FrontendPort"
  }
} else {
  Write-Warning "Missing $FrontendDir. Create frontend scaffold, then run: cd pilot\frontend; pnpm install; pnpm dev --port $FrontendPort"
}

Write-Host "Done. If windows opened, check them for logs/errors." -ForegroundColor Cyan
Write-Host "Local URL (when frontend running): http://localhost:$FrontendPort"
