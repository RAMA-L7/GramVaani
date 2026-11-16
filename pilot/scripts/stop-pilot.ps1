<#
.SYNOPSIS
  Best-effort stop for GramVaani pilot dev servers on ports 8010/3010.
.DESCRIPTION
  Finds listening processes on the given ports and stops them. Use when start-pilot
  windows were closed without terminating servers, or for cleanup.
#>
[CmdletBinding()]
param(
  [int[]]$Ports = @(8010, 3010)
)

$ErrorActionPreference = 'Continue'
$stopped = @()
foreach ($port in $Ports) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      $procId = $c.OwningProcess
      if ($procId -and ($stopped -notcontains $procId)) {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        $name = if ($proc) { $proc.ProcessName } else { "pid $procId" }
        Write-Host "Stopping $name (PID $procId) on port $port"
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        $stopped += $procId
      }
    }
  } catch {
    Write-Warning ("Could not inspect port {0}: {1}" -f $port, $_.Exception.Message)
  }
}
if ($stopped.Count -eq 0) {
  Write-Host "No listening pilot processes found on ports: $($Ports -join ', ')"
} else {
  Write-Host "Stopped PID(s): $($stopped -join ', ')"
}
