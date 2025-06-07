<<<<<<< HEAD
Elden Ring SeamlessCoop (NightReign) Environment Switcher
=========================================================

A simple Windows desktop app for toggling between **Live** (vanilla) and **Modded** (SeamlessCoop) environments in Elden Ring NightReign.  
No more manual file juggling—just click a button.

![App Screenshot](assets/NightShift_FMHM4hDwgf.png)  

Features
--------

- **Live** mode  
  - Disables the `dinput8.dll` mod loader  
  - Restores the most recent `.co2 → .sl2` save  
  - Launches Elden Ring via your Steam URL  

- **Modded** mode  
  - Enables the `dinput8.dll` mod loader  
  - Restores the most recent `.sl2 → .co2` save  
  - Updates `player_count` (2 or 3) in `SeamlessCoop\nrsc_settings.ini`  
  - Launches the bundled `nrsc_launcher.exe`  

- **User‐friendly settings**  
  - Enter your SteamID  
  - Choose player count (2 or 3)  
  - All settings are saved automatically  

Requirements

------------
- Elden Ring NightReign installed via Steam  
- SeamlessCoop mod files present in `…\Game\SeamlessCoop\`  

Installation
------------

1. **Download** the latest portable build (`NightShift-portable.exe` or zipped bundle) from our release page.  
2. **Extract** (if needed) and place the `NightShift` folder anywhere you like—no installer required.

Configuration
-------------

1. **Launch** `NightShift-portable.exe`.  
2. Click **Settings** (⚙️ icon) in the top-right corner.  
3. Fill in **SteamID** (your folder under `%APPDATA%\NightReign\`).  
4. Select **Player Count** (2 or 3) for the Modded environment.  
5. Click **Save**—your values are stored in your user directory automatically.

Using the App
-------------

1. **Open** `NightShift-portable.exe`.  
2. In the main window, click:  
   - **Launch Live** to switch to vanilla mode  
   - **Launch Modded** to switch to SeamlessCoop mode  
3. The app will swap saves, toggle the DLL, update settings, and then start the game.

Packaging & Code Signing
------------------------

- Built with [electron-builder] producing a **standalone portable EXE** (and optional ZIP).  
- Config files and PS scripts are extracted to a writable user folder under `%APPDATA%`.  
- Code-signed for Windows SmartScreen (no warnings).

Troubleshooting
---------------

- If nothing happens, open Developer Tools (View → Toggle Developer Tools) and check the console for errors.  
- Verify your **GameDir** and **SteamID** in Settings if saves don’t swap correctly.  
- Save files live in `%APPDATA%\NightReign\<SteamID>\`; make sure they’re valid `.sl2` or `.co2` files.
