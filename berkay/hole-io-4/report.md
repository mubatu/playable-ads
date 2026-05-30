# Hole.io Playable Ad — Implementation Report

## Task
Implement the Hole.io playable ad described in `GDD.md`, following the folder
structure of `games/block-blast` and reusing modules from `reusables/`.

## AI Model
- **Model:** Claude Opus 4.7 (`claude-opus-4-7`)
- **Agent:** Claude Code

## Time & Token Usage
> These are approximate figures for this implementation session.

- **Wall-clock time:** ~25 minutes
- **Approximate tokens:** ~115,000 tokens (input + output combined)

The bulk of the time/tokens went to reading the GDD, the `reusables`
documentation, and the `block-blast` reference implementation to match
conventions, then writing and browser-verifying the game modules.

## What Was Built
A Three.js playable ad following the `block-blast` structure:

```
berkay/hole-io-4/
├── index.html              # vendored THREE + HandTutorial + importmap
├── src/
│   ├── config/game-config.json
│   ├── css/style.css
│   ├── assets/hand-2.png
│   └── js/
│       ├── lib/three-global-module.js   # re-exports window.THREE as "three"
│       ├── main.js          # config load, animation loop, wiring
│       ├── GameState.js      # scene/camera/renderer/lights, reset
│       ├── Environment.js    # ground, roads, sized city consumables
│       ├── Hole.js           # player hole disc + growth/pulse
│       ├── Gameplay.js       # movement, camera follow, eat logic, timer
│       ├── Hud.js            # score, timer, joystick, end screen (UIScene)
│       ├── ParticleFX.js     # debris burst (reusable ObjectPool)
│       └── Tutorial.js       # hand-drag tutorial over joystick
```

### Reused modules
- `reusables/components/ConfigLoader.js` — JSON config loading
- `reusables/components/SceneManager.js` — scene object/render coordination
- `reusables/components/ObjectPool.js` — particle pooling
- `reusables/UIScene/UIScene.js` — score display, timer display, virtual
  joystick, and the end-screen intro overlay
- `reusables/components/HandTutorial.js` — drag-gesture tutorial

### GDD features implemented
Virtual joystick movement, moving black hole, size-based consumption, hole
growth with pulse, camera follow with size-based zoom and lag, score (10/50/200
by size), 30-second `MM:SS` timer, hand tutorial, end screen with "Time's Up!",
final score, **Download Now** (→ https://google.com) and **Play Again**
(restarts the session), and responsive resize handling.

## Verification
Verified in the browser preview by driving the simulation directly
(the preview tab was backgrounded, which throttles `requestAnimationFrame`):
- Game initializes: canvas, HUD layer, 148 consumables, camera follow active.
- Consuming small objects increments score (+10 each) and grows the hole.
- Timer counts down and triggers the end overlay at zero.
- End overlay shows correct title, final score, and both CTA buttons.
- **Play Again** fully resets state (timer, score, hole size, objects, tutorial).
- `renderer.render()` completes in ~14 ms (46 draw calls) — rendering is healthy.

A pixel screenshot could not be captured because the preview tab was hidden
(`document.hidden === true`), which is an environment/focus limitation rather
than a code issue.

## How to Run
Serve the repository root over HTTP and open with a trailing slash:

```
http://localhost:<port>/berkay/hole-io-4/
```

The trailing slash matters: without it the import map's relative `./src/...`
base resolves one directory too high.
