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

# Read INI config
$Config = Read-IniFile ".\Nightshift\config.ini"
$GameDir = $Config["Paths"]["GameDir"]
$SteamID = $Config["Paths"]["SteamID"]
$SaveDir = Join-Path "$env:APPDATA\nightreign" $SteamID

$LiveLauncher = $Config["Launchers"]["LiveLauncher"]
$ModdedLauncher = Join-Path $GameDir $Config["Launchers"]["ModdedLauncher"]
$SettingsPath = Join-Path $GameDir "SeamlessCoop\nrsc_settings.ini"

$DllPath = Join-Path $GameDir "dinput8.dll"
$DllDisabledPath = Join-Path $GameDir "dinput8.disabled"
$SaveCo2 = Join-Path $SaveDir "NR0000.co2"
$SaveSl2 = Join-Path $SaveDir "NR0000.sl2"

$currentEnv = if (Test-Path $DllPath) { "MODDED" } elseif (Test-Path $DllDisabledPath) { "LIVE" } else { "UNKNOWN" }

Write-Host "`n=== Elden Ring Environment Selector ==="
Write-Host "Current Environment: $currentEnv`n"
Write-Host "[1] Start LIVE environment"
Write-Host "[2] Start MODDED environment"

$choice = Read-Host "Enter your choice [1-2]"

switch ($choice) {
    "1" {
        Write-Host "`n--- Switching to LIVE Environment ---"
        if (Test-Path $SaveCo2) {
            Copy-Item $SaveCo2 -Destination $SaveSl2 -Force
        }
        if (Test-Path $DllPath) {
            Rename-Item $DllPath -NewName "dinput8.disabled"
        }
        Start-Process $LiveLauncher
    }
    "2" {
        Write-Host "`n--- Switching to MODDED Environment ---"
        if (Test-Path $SaveSl2) {
            Copy-Item $SaveSl2 -Destination $SaveCo2 -Force
        }
        if (Test-Path $DllDisabledPath) {
            Rename-Item $DllDisabledPath -NewName "dinput8.dll"
        }
        $playerCount = Read-Host "Enter player count [2-3]"
        if ($playerCount -match '^[2-3]$') {
            (Get-Content $SettingsPath) -replace 'player_count\s*=.*', "player_count = $playerCount" |
                Set-Content $SettingsPath
        } else {
            Write-Host "Invalid input. Using default value: 2"
            (Get-Content $SettingsPath) -replace 'player_count\s*=.*', "player_count = 2" |
                Set-Content $SettingsPath
        }
        Push-Location $GameDir
        Start-Process ".\nrsc_launcher.exe"
        Pop-Location
    }
    Default {
        Write-Host "Invalid choice. Exiting..."
    }
}
