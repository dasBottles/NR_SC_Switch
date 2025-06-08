param(
  [Parameter(Mandatory=$true)]
  [ValidateSet("live","modded")]
  [string]$Environment,

  [Parameter(Mandatory=$true)]
  [string]$SteamID,

  [Parameter(Mandatory=$true)]
  [string]$GameDir
)

# Paths
$SaveDir       = Join-Path $env:APPDATA "NightReign\$SteamID"
$DllPath       = Join-Path $GameDir "dinput8.dll"
$DllDisabled   = Join-Path $GameDir "dinput8.disabled"
$LiveLauncher  = "steam://rungameid/2622380"
$ModLauncher   = Join-Path $GameDir "nrsc_launcher.exe"

# Determine current environment
if (Test-Path $DllDisabled) {
    $CurrentEnv = "live"
}
elseif (Test-Path $DllPath) {
    $CurrentEnv = "modded"
}
else {
    Write-Warning "Could not detect current env (no dinput8.dll or dinput8.disabled). Assuming 'live'."
    $CurrentEnv = "live"
}

Write-Host "[DEBUG] CurrentEnv = $CurrentEnv ; RequestedEnv = $Environment`n"

# Only swap saves & DLL if we’re changing environments
if ($CurrentEnv -ne $Environment) {

    Write-Host "=== Switching to $($Environment.ToUpper()) environment ==="

    switch ($Environment) {

      "live" {
        # Modded→Live: .co2 → .sl2, disable DLL
        if (Test-Path "$SaveDir\NR0000.co2") {
          Copy-Item "$SaveDir\NR0000.co2" "$SaveDir\NR0000.sl2" -Force
          Write-Host "  Backed up and converted .co2 → .sl2"
        }
        if (Test-Path $DllPath) {
          Rename-Item $DllPath "dinput8.disabled" -Force
          Write-Host "  Renamed dinput8.dll → dinput8.disabled"
        }
      }

      "modded" {
        # Live→Modded: .sl2 → .co2, enable DLL
        if (Test-Path "$SaveDir\NR0000.sl2") {
          Copy-Item "$SaveDir\NR0000.sl2" "$SaveDir\NR0000.co2" -Force
          Write-Host "  Backed up and converted .sl2 → .co2"
        }
        if (Test-Path $DllDisabled) {
          Rename-Item $DllDisabled "dinput8.dll" -Force
          Write-Host "  Renamed dinput8.disabled → dinput8.dll"
        }
      }

    }

} else {
    Write-Host "=== Already in $($Environment.ToUpper()) environment; skipping conversion ==="
}

# Finally, launch
Write-Host "`n=== Launching $($Environment.ToUpper()) ==="
if ($Environment -eq "live") {
    Start-Process $LiveLauncher
} else {
    Start-Process -FilePath $ModLauncher -WorkingDirectory $GameDir
}
