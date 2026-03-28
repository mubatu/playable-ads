# Hand Tutorial Module

Reusable hand tutorial utility for Three.js playable ads. The module renders as a DOM overlay on top of your renderer, which makes it easy to reuse across orthographic, perspective, world-space, and UI-heavy ads.

## Files

- `js/HandTutorial.js`: reusable module exposed as `window.HandTutorial`
- `js/demo-scene.js`: lightweight Three.js showcase scene for testing placements
- `js/main.js`: interactive demo wiring
- `assets/hand-demo.svg`: default demo hand asset

## Why DOM Overlay

Hand tutorials are UI, not gameplay simulation. Keeping the hand in the DOM makes it:

- independent from your Three.js render graph
- easy to swap with any PNG, WEBP, JPG, or SVG hand image
- straightforward to position in screen space or by projecting world positions through a camera
- simpler to reuse across different playable ad camera setups

## Supported Gestures

- `tap` or `click`
- `swipe`
- `drag`
- `swap`

`swipe`, `drag`, and `swap` all use the same animated path logic, so you can pick whichever label reads best in your ad code.

## Basic Usage

Load Three first, then the hand tutorial script:

```html
<script src="js/lib/three.min.js"></script>
<script src="js/HandTutorial.js"></script>
```

Create the tutorial after your renderer and camera exist:

```js
const tutorial = new HandTutorial({
    container: renderer.domElement.parentElement,
    renderer: renderer,
    camera: camera,
    assetUrl: './assets/hand.png',
    gesture: 'swap',
    duration: 1.2,
    loopDelay: 0.35,
    size: 144,
    showTrail: true,
    from: { space: 'world', x: -1.8, y: 0.6, z: 0.6 },
    to: { space: 'world', x: -0.6, y: 0.6, z: -0.7 },
    anchor: { x: 0.22, y: 0.08 }
});

tutorial.play();

function animate(now) {
    requestAnimationFrame(animate);
    tutorial.update(now);
    renderer.render(scene, camera);
}

animate(performance.now());
```

## Screen-Space Example

```js
const tutorial = new HandTutorial({
    container: renderer.domElement.parentElement,
    gesture: 'tap',
    assetUrl: './assets/hand.png',
    from: { space: 'screen', x: 0.5, y: 0.72 },
    to: { space: 'screen', x: 0.5, y: 0.72 }
});
```

Screen-space coordinates use normalized values from `0` to `1` relative to the renderer bounds.

## Important Options

- `assetUrl`: path or blob URL for the hand image
- `gesture`: `tap`, `click`, `swipe`, `drag`, or `swap`
- `from`, `to`: gesture positions
- `points`: optional multi-point path array
- `duration`: active animation time in seconds
- `loopDelay`: pause between loops in seconds
- `size`: hand size in pixels
- `rotation`: extra rotation in degrees
- `followDirection`: rotate the hand to face the path direction
- `flipX`, `flipY`: mirror the hand asset
- `anchor`: normalized image point that should touch the target
- `offset`: final pixel offset after anchoring
- `showTrail`: show or hide the swipe path

## Point Formats

### Screen point

```js
{ space: 'screen', x: 0.4, y: 0.7 }
```

### Pixel point

```js
{ space: 'pixels', x: 220, y: 540 }
```

### World point

```js
{ space: 'world', x: 1.2, y: 0.8, z: -0.4 }
```

### Object3D point

```js
{
    object3D: someMesh,
    offset: { x: 0, y: 0.4, z: 0 }
}
```

That last format is handy when the tutorial should track a moving object.

## Demo

Open [`index.html`](/Users/batuh/Desktop/Lemur/Playable%20Ads/playable-ads/batu/threejs/hand-tutorial/index.html) in a browser. The demo lets you:

- upload a custom hand image
- switch between gesture types
- toggle world or screen placement
- click the scene to pick start and end points
- copy the generated config snippet

The demo loads the local Three.js build already present in `../blast/js/lib/three.min.js`, so it works without installing npm dependencies in this workspace.
