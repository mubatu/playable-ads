/**
 * camera.js — Third-person camera that follows the character
 */

const GameCamera = (function () {
    'use strict';

    // Camera offset relative to the character
    const OFFSET = new THREE.Vector3(0, 12, 18);
    const LOOK_OFFSET_Y = 1.5;   // look slightly above character feet
    const LERP_SPEED = 5.0;      // how quickly camera catches up

    const camera = new THREE.PerspectiveCamera(
        55,                                      // FOV
        window.innerWidth / window.innerHeight,  // aspect
        0.1,                                     // near
        200                                      // far
    );

    // Initial position (will be overridden on first update)
    camera.position.set(0, 12, 18);
    camera.lookAt(0, 0, 0);

    // Desired position target (smoothed each frame)
    const desiredPos = new THREE.Vector3();

    /**
     * Call each frame after character has moved.
     * @param {THREE.Vector3} targetPos — character world position
     * @param {number} delta — frame delta in seconds
     */
    function update(targetPos, delta) {
        desiredPos.copy(targetPos).add(OFFSET);

        // Smooth follow via lerp
        const t = 1 - Math.exp(-LERP_SPEED * delta);
        camera.position.lerp(desiredPos, t);

        camera.lookAt(
            targetPos.x,
            targetPos.y + LOOK_OFFSET_Y,
            targetPos.z
        );
    }

    // ---- Resize ----
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    return { camera, handleResize, update };
})();
