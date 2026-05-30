# Hole.io Playable Ad

Three.js mobile playable ad based on `GDD.md`.

## Run locally

Serve this folder over HTTP (required for config JSON and ES modules):

```bash
npm start
```

Then open the served URL (e.g. `http://localhost:3000`).

## Structure

Follows `games/block-blast/` layout:

- `index.html` — entry, loads reusables vendor scripts + module bootstrap
- `src/config/game-config.json` — tunable gameplay/UI values
- `src/css/style.css` — HUD/timer/tutorial styles
- `src/js/` — game modules (`main.js`, `Gameplay.js`, `Hud.js`, etc.)
- `src/assets/` — local assets (hand tutorial image)

Reusable modules are imported from `../../reusables/` (UIScene, HandTutorial, SceneSetup, ConfigLoader, SceneManager).

## Features

- Virtual joystick movement (bottom-left)
- Size-based object consumption with hole growth
- 30-second countdown timer
- Hand tutorial (0–3s) with "Move to eat objects"
- End screen with Play Again + Download Now (both redirect to google.com per GDD)
