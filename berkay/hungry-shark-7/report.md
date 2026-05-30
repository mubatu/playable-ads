# Hungry Shark — Implementation Report

## Task

Implement the playable ad described in `GDD.md` inside `berkay/hungry-shark-7/`,
following the folder structure of `games/block-blast/` and reusing shared modules
from `reusables/`.

## AI Model

- **Model:** Claude Opus (`claude-opus-4-8`), via Claude Code.

## Time & Tokens

- **Wall-clock time:** ~12 minutes (start 11:33:37 → end 11:45:28, 2026-05-30).
- **Estimated tokens used:** ~150K total (input + output). This is an estimate;
  the bulk of input came from reading `reusables/documentation.md`, the GDD, and
  the `block-blast` / `hungry-shark-1` reference files. Output covered ~18 source
  files plus this report.

## What Was Built

A single-screen arcade survival playable that follows the GDD's core loop: swim,
eat, grow, avoid hazards, trigger Gold Rush, survive.

### Folder structure (mirrors `games/block-blast/`)

```
hungry-shark-7/
├── index.html                 # vendored THREE + importmap + HandTutorial
├── package.json
├── src/
│   ├── assets/hand-2.png      # tutorial hand (copied from block-blast)
│   ├── config/game-config.json
│   ├── css/style.css
│   └── js/
│       ├── lib/three-global-module.js
│       ├── main.js            # boot, game loop, start/reset
│       ├── GameState.js       # scene/camera/renderer + state + textures
│       ├── Textures.js        # procedural canvas sprites (shark, fish, coin, mine, jellyfish)
│       ├── WorldBuilder.js    # gradient background, seabed, ambient bubbles
│       ├── SharkBuilder.js    # shark mesh
│       ├── SharkController.js # joystick movement, rotation, growth, boost
│       ├── EntityFactory.js   # prey/coin/hazard meshes + placement
│       ├── Spawner.js         # initial population + recycling
│       ├── EntityUpdater.js   # per-frame entity motion + gold tint
│       ├── Collision.js       # eating, hazards, particle FX
│       ├── HungerSystem.js    # hunger drain → health drain → death
│       ├── GoldRush.js        # charge, activation, gold shark swap
│       ├── CameraController.js# smooth follow + world clamp + shake
│       ├── Hud.js             # UIScene HUD (score, 4 meters, boost, overlays)
│       ├── Interaction.js     # boost hold, tutorial dismissal, input read
│       └── Tutorial.js        # HandTutorial drag hint on the joystick
```

### Reusable modules used

- `components/ConfigLoader.js` — loads `game-config.json`.
- `components/SceneSetup.js` — renderer/color setup.
- `components/VisualUtils.js` patterns — canvas texture approach.
- `UIScene/UIScene.js` + elements — score display, progress bars, button,
  virtual joystick, and intro/game-over/CTA overlays.
- `components/HandTutorial.js` — drag tutorial hand pointing at the joystick.
- `Command/MoveCommand.js` (via joystick) — normalized movement vector.

### GDD mechanics implemented

| GDD section | Implementation |
| --- | --- |
| Shark movement (joystick, rotation, inertia, boost) | `SharkController.js`, `Interaction.js` |
| Hunger meter → health drain → death | `HungerSystem.js` |
| Eating system (small/medium/big fish, coins) | `Collision.js`, tiered by shark size |
| Shark growth | size scales with score, unlocks bigger prey |
| Gold Rush (gold tint, 3× score, golden shark) | `GoldRush.js` + texture swap |
| Health & damage (mines, jellyfish) | `Collision.js`, camera shake |
| Hazard/obstacle colliders | circular distance checks (not AABB) |
| Spawn system / recycling | `Spawner.js`, off-screen recycling |
| Camera (smooth follow, shake, clamp) | `CameraController.js` |
| HUD (health, hunger, boost, gold rush, score) | `Hud.js` via UIScene |
| Visual style (bright water, bubbles, light rays) | `WorldBuilder.js`, `Textures.js` |
| Monetization / CTA | intro + CTA download overlay |

### Design decisions

- **Single-screen contained arena with camera follow** instead of a fully open
  world. The shark swims in a 38×20 world; the camera follows and clamps to the
  world edges. This keeps a playable ad lightweight while preserving the
  follow-camera feel from the GDD.
- **Procedural canvas sprites** rather than external art, so the build has no
  binary asset dependencies (except the tutorial hand). 2D plane sprites under an
  orthographic camera match the side-view arcade look.
- **Circular colliders** for all hazards (mines, jellyfish) and prey — forgiving
  and shape-accurate, per the repo's collision guidance (no AABB on round shapes).
- **Gold Rush uses a texture swap** to a dedicated golden shark sprite, because a
  multiply-tint over the blue shark read as muddy green.

## Verification

Ran via the `hungry-shark-7` serve config (port 3007) and verified in-browser
with the preview tools:

- Intro overlay shows and PLAY starts the game.
- Shark swims under joystick input, rotates to face direction, flips upright.
- Eating fish raises score (with `+N` popups), refills hunger, spawns particles.
- All four HUD meters update; boost drains/regens.
- Gold Rush activates after enough eats — shark turns gold, 3× multiplier applies.
- Mines/jellyfish deal damage with camera shake.
- No console errors.

### Known limitations

- The animation loop is `requestAnimationFrame`-driven, so it throttles when the
  page is not painting (expected browser behavior; full speed on a real device).
- Game-over and CTA overlays are wired and reachable but were validated by code
  path / forced state rather than a full playthrough to death.
