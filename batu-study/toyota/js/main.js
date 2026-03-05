/**
 * main.js — Game loop and resize wiring
 */

(function () {
    'use strict';

    var clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        var delta = Math.min(clock.getDelta(), 0.05);   // cap spikes

        Car.update(delta);

        GameCamera.update(
            Car.group.position,
            Car.group.rotation.y,
            delta
        );

        // Keep sun shadow centred on the car
        GameScene.sun.position.set(
            Car.group.position.x + 30,
            40,
            Car.group.position.z + 20
        );
        GameScene.sun.target.position.copy(Car.group.position);
        GameScene.sun.target.updateMatrixWorld();

        GameScene.renderer.render(GameScene.scene, GameCamera.camera);
    }

    // ── Resize ────────────────────────────────────────
    window.addEventListener('resize', function () {
        GameScene.handleResize();
        GameCamera.handleResize();
    });

    // ── Start after model loads ───────────────────────
    Car.ready.then(function () {
        // Fade out controls hint after 4 seconds
        var hint = document.getElementById('controls-hint');
        if (hint) {
            setTimeout(function () {
                hint.classList.add('fade-out');
            }, 4000);
        }

        animate();
    });
})();
