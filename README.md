Elden Ring SeamlessCoop (Nightreign) Environment Switcher

🔧 What This Tool Does
This tool simplifies switching between:
- Live (vanilla) mode for online play via Steam
- Modded (SeamlessCoop) mode for multiplayer with friends

It automatically:
- Swaps save files to match the active environment
- Enables/disables the dinput8.dll mod loader
- Updates SeamlessCoop settings (player count)
- Launches the game with the correct executable or Steam URI

📦 What’s Included
ENV_SWITCH.exe
ENV_SWITCH.ini

🖥 Requirements
- SeamlessCoop installed in the Elden Ring Nightreign folder
- Save files located in %APPDATA%\nightreign\[SteamID]

⚙️ Setup Instructions
1. Extract all files into any folder (e.g., Desktop\ERNR_SWITCHER)
2. Open ENV_SWITCH.ini and update the following:
   [Paths]
   GameDir=FULL_PATH_TO_YOUR_ELDEN_RING_NIGHTREIGN\Game
   SteamID=YOUR_STEAM_ID

   [Launchers]
   LiveLauncher=steam://rungameid/2622380
   ModdedLauncher=nrsc_launcher.exe

   Example:
   GameDir=C:\Program Files (x86)\Steam\steamapps\common\ELDEN RING NIGHTREIGN\Game
   SteamID=76561198142145846

🚀 How to Use It
1. Run ENV_SWITCH.exe
2. Choose:
   [1] Start LIVE environment
   [2] Start MODDED environment
3. If you choose MODDED:
   Enter player count [2-3]:

🧼 How It Works (Under the Hood)
- LIVE:
  - Copies .co2 save → .sl2
  - Renames dinput8.dll → dinput8.disabled
  - Launches via Steam

- MODDED:
  - Copies .sl2 save → .co2
  - Renames dinput8.disabled → dinput8.dll
  - Updates player count in SeamlessCoop\nrsc_settings.ini
  - Launches nrsc_launcher.exe

🛠️ Troubleshooting
- No console appears? Run the .ps1 file manually if needed.
- Game won’t launch? Verify the path to nrsc_launcher.exe in ENV_SWITCH.ini
- Save not loading? Ensure .co2/.sl2 are valid and not corrupted.
