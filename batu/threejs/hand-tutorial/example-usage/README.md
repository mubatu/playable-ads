# Usage Example

This folder is the smallest possible "new game" setup for the hand tutorial.

## What is inside

- `index.html`: loads Three.js, `HandTutorial.js`, and the example scripts
- `js/scene.js`: creates an empty renderer, scene, and camera
- `js/main.js`: uses your hand tutorial config directly
- `assets/hand.png`: local hand image used by `assetUrl: './assets/hand.png'`

## How to use it in another game

1. Create your own Three.js `renderer` and `camera`.
2. Create `new HandTutorial({...})` after those exist.
3. Pass a container that sits above your canvas:

```js
container: renderer.domElement.parentElement
```

4. Call `tutorial.play()`.
5. Inside your game loop, call:

```js
tutorial.update(now);
```

That is the only per-frame hook the tutorial needs.
