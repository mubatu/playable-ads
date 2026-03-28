(function () {
    'use strict';

    const renderer = GameScene.renderer;
    const scene = GameScene.scene;
    const camera = GameScene.camera;

    // 1. Create the tutorial after your renderer and camera exist.
    const tutorial = new HandTutorial({
        container: renderer.domElement.parentElement,
        renderer: renderer,
        camera: camera,
        assetUrl: './assets/hand-2.png',
        gesture: 'swap',
        duration: 1.20,
        loopDelay: 0.35,
        size: 144,
        rotation: 0,
        followDirection: false,
        flipX: false,
        showTrail: true,
        anchor: { x: 0.22, y: 0.08 },
        from: { space: 'world', x: -0.83, y: 0.64, z: 2.09 },
        to: { space: 'world', x: 1.45, y: 0.64, z: -6.51 }
    });
    tutorial.play();

    function animate(now) {
        requestAnimationFrame(animate);
        // 2. Update the tutorial every frame before or after your game render.
        tutorial.update(now);
        renderer.render(scene, camera);
    }

    animate(performance.now());
})();
