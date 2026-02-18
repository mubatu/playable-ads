/**
 * main.js — Game loop
 */

(function () {
    'use strict';

    const { renderer, scene } = GameScene;
    const { camera } = GameCamera;

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // (future: update character, camera follow, etc.)

        renderer.render(scene, camera);
    }

    animate();
})();
