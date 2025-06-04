# Read INI config
function Read-IniFile {
    param ([string]$path)
    $ini = @{}
    $section = ""
    foreach ($line in Get-Content $path) {
        $line = $line.Trim()
        if ($line -match '^\[.*\]$') {
            $section = $line.Trim('[', ']')
            $ini[$section] = @{}
        } elseif ($line -match '^\s*[^;].*=') {
            $key, $value = $line -split '=', 2
            $ini[$section][$key.Trim()] = $value.Trim()
        }
    }
    return $ini
}

# Load configuration
$Config = Read-IniFile ".\Nightshift\config.ini"
$GameDir = $Config["Paths"]["GameDir"]
$SteamID = $Config["Paths"]["SteamID"]
$SaveDir = Join-Path "$env:APPDATA\nightreign" $SteamID

$LiveLauncher = $Config["Launchers"]["LiveLauncher"]
$ModdedLauncher = Join-Path $GameDir $Config["Launchers"]["ModdedLauncher"]
$SettingsPath = Join-Path $GameDir "SeamlessCoop\nrsc_settings.ini"

$DllPath = Join-Path $GameDir "dinput8.dll"
$DllDisabledPath = Join-Path $GameDir "dinput8.disabled"
$SaveCo2     = Join-Path $SaveDir "NR0000.co2"
$SaveCo2Bak  = Join-Path $SaveDir "NR0000.co2.bak"
$SaveSl2     = Join-Path $SaveDir "NR0000.sl2"
$SaveSl2Bak  = Join-Path $SaveDir "NR0000.sl2.bak"

$currentEnv = if (Test-Path $DllPath) { "MODDED" } elseif (Test-Path $DllDisabledPath) { "LIVE" } else { "UNKNOWN" }

Write-Host "`n=== Elden Ring Environment Selector ==="
Write-Host "Current Environment: $currentEnv`n"
Write-Host "[1] Start LIVE environment"
Write-Host "[2] Start MODDED environment"

$choice = Read-Host "Enter your choice [1-2]"

switch ($choice) {
    "1" {
        Write-Host "`n--- Switching to LIVE Environment ---"
        if ($currentEnv -ne "LIVE") {
            if (Test-Path $SaveCo2) { Copy-Item $SaveCo2 $SaveSl2 -Force }
            if (Test-Path $SaveCo2Bak) { Copy-Item $SaveCo2Bak $SaveSl2Bak -Force }
        }
        if (Test-Path $DllPath) { Rename-Item -Path $DllPath -NewName "dinput8.disabled" -Force }
        Start-Process $LiveLauncher
    }
    "2" {
        Write-Host "`n--- Switching to MODDED Environment ---"
        if ($currentEnv -ne "MODDED") {
            if (Test-Path $SaveSl2) { Copy-Item $SaveSl2 $SaveCo2 -Force }
            if (Test-Path $SaveSl2Bak) { Copy-Item $SaveSl2Bak $SaveCo2Bak -Force }
        }
        if (Test-Path $SettingsPath) {
            $playerCount = Read-Host "Enter player count [2-3]"
            (Get-Content $SettingsPath) |
                ForEach-Object {
                    if ($_ -match "^player_count\s*=.*") {
                        "player_count = $playerCount"
                    } else {
                        $_
                    }
                } | Set-Content $SettingsPath
        }
        if (Test-Path $DllDisabledPath) { Rename-Item -Path $DllDisabledPath -NewName "dinput8.dll" -Force }
        Start-Process -FilePath $ModdedLauncher -WorkingDirectory $GameDir
    }
    default {
        Write-Host "Invalid choice."
    }
}
