# NightShift.ps1

# ────────────────────────────────────────────────────────────────────────────────
# At top: ensure PowerShell writes UTF-8, so console output remains clean:
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
# ────────────────────────────────────────────────────────────────────────────────

param(
  [Parameter(Mandatory=$true)][string]$Environment,
  [Parameter(Mandatory=$true)][string]$SteamID,
  [Parameter(Mandatory=$true)][string]$GameDir
)


# ────────────────────────────────────────────────────────────────────────────────
# Helper: Read any INI file into a nested hashtable:
# ────────────────────────────────────────────────────────────────────────────────
function Read-IniFile {
    param ([string]$path)

    $ini     = @{}
    $section = ""

    foreach ($line in Get-Content $path) {
        $raw = $line.Trim()
        if ($raw -match '^\[.*\]$') {
            $section       = $raw.TrimStart('[').TrimEnd(']')
            $ini[$section] = @{}
        }
        elseif ($raw -match '^\s*[^;].*=') {
            $parts = $raw -split '=', 2
            $k     = $parts[0].Trim()
            $v     = $parts[1].Trim()
            $ini[$section][$k] = $v
        }
    }
    return $ini
}

# ────────────────────────────────────────────────────────────────────────────────
# Locate and parse config.ini under \assets (one level above this script)
# ────────────────────────────────────────────────────────────────────────────────
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$configPath = Join-Path $scriptDir '..\assets\config.ini'

if (Test-Path $configPath) {
    $config = Read-IniFile -path $configPath
} else {
    Write-Host "[WARN] config.ini not found at $configPath"
    $config = @{}
}

# ────────────────────────────────────────────────────────────────────────────────
# Extract launcher values from [Launchers] section
# ────────────────────────────────────────────────────────────────────────────────
$liveLauncherVal   = $config.Launchers.LiveLauncher   -as [string]
$moddedLauncherVal = $config.Launchers.ModdedLauncher -as [string]

# ────────────────────────────────────────────────────────────────────────────────
# Build paths for save root and DInput8 DLL toggle
# ────────────────────────────────────────────────────────────────────────────────
$AppDataDir      = [Environment]::GetFolderPath("ApplicationData")
$SaveRoot        = Join-Path $AppDataDir "NightReign\$SteamID"
$BackupsFolder   = Join-Path $SaveRoot "Backups"

$DInputPath      = Join-Path $GameDir "dinput8.dll"
$DInputDisabled  = Join-Path $GameDir "dinput8.disabled"

# Extensions for Live (SL2) and Modded (CO2)
$LiveExt         = ".sl2"
$ModdExt         = ".co2"

# ────────────────────────────────────────────────────────────────────────────────
# Ensure the Backups folder exists
# ────────────────────────────────────────────────────────────────────────────────
if (-not (Test-Path $BackupsFolder)) {
    New-Item -ItemType Directory -Path $BackupsFolder | Out-Null
    Write-Host "[INFO] Created backups folder: $BackupsFolder"
}

# ────────────────────────────────────────────────────────────────────────────────
# 1) Backup all current saves of a given extension into Backups\
# ────────────────────────────────────────────────────────────────────────────────
function Backup-AllCurrentSaves {
    param ( [string]$CurrentExt )  # e.g. ".sl2" or ".co2"

    $files = Get-ChildItem -Path $SaveRoot -Filter "*$CurrentExt" -File -ErrorAction SilentlyContinue
    if ($files.Count -eq 0) {
        Write-Host "  [INFO] No files with extension $CurrentExt in $SaveRoot"
        return
    }

    foreach ($f in $files) {
        $timestamp = (Get-Date $f.LastWriteTime).ToString("yyyyMMdd-HHmmss")
        $base      = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
        $destName  = "{0}-{1}{2}" -f $base, $timestamp, $CurrentExt
        $destPath  = Join-Path $BackupsFolder $destName

        Copy-Item -Path $f.FullName -Destination $destPath -Force
        Write-Host "  [Backup] Copied $($f.Name) -> $destName"
    }
}

# ────────────────────────────────────────────────────────────────────────────────
# 2) Get the most recent backup file’s full path (by extension) in Backups\
# ────────────────────────────────────────────────────────────────────────────────
function Get-MostRecentBackup {
    param ( [string]$Ext )  # ".sl2" or ".co2"

    $all = Get-ChildItem -Path $BackupsFolder -Filter "*$Ext" -File -ErrorAction SilentlyContinue
    if ($all.Count -eq 0) { return $null }

    # Sort by LastWriteTime descending; pick first
    $latest = $all | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    return $latest.FullName
}

# ────────────────────────────────────────────────────────────────────────────────
# 3) Restore that most recent backup into SaveRoot with the new extension
# ────────────────────────────────────────────────────────────────────────────────
function Restore-MostRecentToNewEnv {
    param (
        [string]$OldExt,  # extension being replaced (e.g. ".co2" for Live)
        [string]$NewExt   # extension to create (e.g. ".sl2" for Live)
    )

    $recent = Get-MostRecentBackup -Ext $OldExt
    if (-not $recent) {
        Write-Host "  [WARN] No backups for $OldExt found → cannot restore."
        return
    }

    # Extract base name without the timestamp suffix
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($recent)
    # The name is like "NR0000-20230606-153200" → strip "-TIMESTAMP"
    $baseName = ($fileName -split '-\d{8}-\d{6}$')[0]
    $destName = $baseName + $NewExt
    $destFull = Join-Path $SaveRoot $destName

    Copy-Item -Path $recent -Destination $destFull -Force
    Write-Host "  [Restore] Copied $([System.IO.Path]::GetFileName($recent)) -> $destName"
}

# ────────────────────────────────────────────────────────────────────────────────
# Main “switch” for Live vs Modded
# ────────────────────────────────────────────────────────────────────────────────
Write-Host "[PS DEBUG] Environment = '$Environment'; SteamID = '$SteamID'; GameDir = '$GameDir'"

switch ($Environment) {

    "Live" {
        Write-Host "=== Switching to LIVE environment ==="

        # 1) Disable dinput8.dll so EAC is bypassed
        if (Test-Path $DInputPath) {
            Rename-Item -Path $DInputPath -NewName "dinput8.disabled" -Force
            Write-Host "  Disabled dinput8.dll"
        }

        # 2) Backup all current “.co2” (modded) saves
        Backup-AllCurrentSaves -CurrentExt $ModdExt

        # 3) Restore most recent “.co2” → “.sl2”
        Restore-MostRecentToNewEnv -OldExt $ModdExt -NewExt $LiveExt

        # 4) Launch via Steam URL or local exe:
        if ($liveLauncherVal -and $liveLauncherVal.StartsWith("steam://")) {
            Write-Host "  Launching via Steam URL: $liveLauncherVal"
            Start-Process -FilePath $liveLauncherVal
        }
        elseif ($liveLauncherVal) {
            $exeFull = Join-Path $GameDir $liveLauncherVal
            Write-Host "  Launching local Live EXE: $exeFull"
            Start-Process -FilePath $exeFull -WorkingDirectory $GameDir
        }
        else {
            Write-Host "  [ERROR] No LiveLauncher specified in config.ini under [Launchers]."
        }
        break
    }

    "Modded" {
        Write-Host "=== Switching to MODDED environment ==="

        # 1) Re-enable dinput8.dll (so EAC is back in place)
        if (Test-Path $DInputDisabled) {
            Rename-Item -Path $DInputDisabled -NewName "dinput8.dll" -Force
            Write-Host "  Re-enabled dinput8.dll"
        }

        # 2) Backup all current “.sl2” (live) saves
        Backup-AllCurrentSaves -CurrentExt $LiveExt

        # 3) Restore most recent “.sl2” → “.co2”
        Restore-MostRecentToNewEnv -OldExt $LiveExt -NewExt $ModdExt

        # 4) Launch via local modded launcher EXE:
        if ($moddedLauncherVal) {
            $modExe = Join-Path $GameDir $moddedLauncherVal
            Write-Host "  Launching Modded EXE: $modExe"
            Start-Process -FilePath $modExe -WorkingDirectory $GameDir
        }
        else {
            Write-Host "  [ERROR] No ModdedLauncher specified in config.ini under [Launchers]."
        }
        break
    }

    Default {
 Write-Host "Invalid environment: '$Environment'. Use 'Live' or 'Modded'."
    break    }
}
# ────────────────────────────────────────────────────────────────────────────────
# End of NightShift.ps1
# ────────────────────────────────────────────────────────────────────────────────
