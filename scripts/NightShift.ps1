param(
  [Parameter(Mandatory=$true)][ValidateSet("live","modded")]
  [string]$Environment,

  [Parameter(Mandatory=$true)]
  [string]$SteamID,

  [Parameter(Mandatory=$true)]
  [string]$GameDir
)

# build some paths once
$SaveDir        = Join-Path $env:APPDATA "NightReign\$SteamID"
$DllPath        = Join-Path $GameDir "dinput8.dll"
$DllDisabled    = Join-Path $GameDir "dinput8.disabled"
$LiveLauncher   = "steam://rungameid/2622380"    # or read from ini if you like
$ModLauncherExe = Join-Path $GameDir "nrsc_launcher.exe"

Write-Host "[PS DEBUG] env=$Environment, SteamID=$SteamID, GameDir=$GameDir"
Write-Host "`n=== Switching to $($Environment.ToUpper()) environment ===`n"

switch ($Environment.ToLower()) {

  "live" {
    # backup & convert .co2 -> .sl2
    if (Test-Path "$SaveDir\NR0000.co2") {
      Copy-Item "$SaveDir\NR0000.co2" "$SaveDir\NR0000.sl2" -Force
    }
    # ensure dll is disabled
    if (Test-Path $DllPath) {
      Rename-Item $DllPath "dinput8.disabled" -Force
    }
    Start-Process $LiveLauncher
  }

  "modded" {
    # backup & convert .sl2 -> .co2
    if (Test-Path "$SaveDir\NR0000.sl2") {
      Copy-Item "$SaveDir\NR0000.sl2" "$SaveDir\NR0000.co2" -Force
    }
    # swap dll back in
    if (Test-Path $DllDisabled) {
      Rename-Item $DllDisabled "dinput8.dll" -Force
    }
    Start-Process -FilePath $ModLauncherExe -WorkingDirectory $GameDir
  }

  default {
    Write-Error "Unknown environment '$Environment'. Use 'live' or 'modded'."
    exit 1
  }
}
