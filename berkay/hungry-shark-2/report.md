# Hungry Shark — Implementation Report

## AI Model
- **Model name:** Claude Opus 4.7 (`claude-opus-4-7`)
- **Harness:** Claude Code (Anthropic CLI)

## Time
- **Wall-clock time spent:** ~6 minutes 12 seconds (372 seconds end-to-end, from reading the GDD to verified playable build).

## Token Usage (approximate)
Exact totals are not exposed by the tool runtime; this is an order-of-magnitude estimate based on the files read and written.

| Bucket | Tokens (approx.) |
| --- | --- |
| Input (GDD, reusables docs, block-blast reference files, hungry-shark-1 reference, system prompts) | ~30,000 |
| Output (12 source files + config + HTML + CSS + this report) | ~9,000 |
| **Total (approx.)** | **~39,000** |

## What Was Built
A self-contained playable ad at `berkay/hungry-shark-2/`, mirroring the `games/block-blast` folder convention:

```
hungry-shark-2/
├── index.html               (vendor three.min.js + importmap, block-blast pattern)
├── src/
│   ├── config/game-config.json
│   ├── css/style.css
│   └── js/
│       ├── main.js          (loop + bootstrap)
│       ├── GameState.js
│       ├── World.js         (background, surface/seabed bands, ambient bubbles)
│       ├── Shark.js         (procedural shark mesh + movement + gold-rush tint)
│       ├── EntityFactory.js (small/medium fish, coins, mines, jellyfish)
│       ├── Spawner.js       (initial + interval respawn)
│       ├── HungerSystem.js
│       ├── GoldRush.js
│       ├── Collision.js     (eating, damage, particle bursts)
│       ├── CameraController.js (smooth follow + screen shake)
│       ├── Hud.js           (UIScene: bars, score, joystick, boost, intro/CTA/game-over)
│       ├── Interaction.js   (keyboard fallback)
│       ├── Tutorial.js      (HandTutorial overlay, auto-dismiss on first input)
│       └── lib/three-global-module.js
```

## GDD Coverage
| GDD pillar | Implemented |
| --- | --- |
| Shark movement (joystick, turning, boost) | ✅ |
| Hunger meter draining + health loss when empty | ✅ |
| Eating fish / coins (score, hunger, health gain) | ✅ |
| Mines + jellyfish damage + screen shake | ✅ |
| Gold Rush meter, activation, tint, score multiplier | ✅ |
| Spawn system with interval respawn | ✅ |
| HUD: health, hunger, gold-rush bars, score, coins | ✅ |
| Intro overlay → CTA / game-over overlays | ✅ |
| Camera smooth follow + shake | ✅ |
| Tutorial hand overlay | ✅ |
| Surface zone, seabed, ambient bubbles | ✅ |
| Multiple shark tiers, humans, boats, submarines, missions, cosmetics, IAP | ⛔ (out of scope for a single playable ad; GDD targets a full game) |

## Verification
- Local server (`npx serve` on port 3003) started via Claude Preview.
- Page loaded with zero console errors (only a deprecation warning from `three.min.js`, inherited from reusables/vendor).
- Verified in-browser: intro overlay → PLAY → shark moves on `moveCommand` input → eats fish/coins → score and coins update (final eval: `score=20, coins=2, hunger=75`).
- Screenshot confirms HUD layout, joystick, boost button, surface zone, and populated entities.

## Reuse from `reusables/`
- `UIScene` and elements (`UIProgressBar`, `UIScoreDisplay`, `UIVirtualJoystick`, `UIButton`, `UIIntroOverlay`)
- `components/ConfigLoader.js`, `components/SceneSetup.js`, `components/Background.js`, `components/VisualUtils.js`
- `components/HandTutorial.js` (global script)
- `vendor/three.min.js`
