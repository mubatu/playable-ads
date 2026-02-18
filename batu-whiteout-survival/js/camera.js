/**
 * camera.js — Fixed third-person style camera looking at the world center
 */

const GameCamera = (function () {
    'use strict';

    const camera = new THREE.PerspectiveCamera(
        55,                                      // FOV
        window.innerWidth / window.innerHeight,  // aspect
        0.1,                                     // near
        200                                      // far
    );

    // Fixed position: behind and above origin, looking down at the ground
    camera.position.set(0, 12, 18);
    camera.lookAt(0, 0, 0);

    // ---- Resize ----
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    return { camera, handleResize };
})();
