/**
 * camera.js — Third-person camera that follows behind the car
 */

const GameCamera = (function () {
    'use strict';

    // Camera offset relative to car (applied in car's local space)
    const OFFSET_BEHIND = 12;     // distance behind
    const OFFSET_UP     = 5;      // height above car
    const LOOK_OFFSET_Y = 1.5;    // look slightly above car center
    const LERP_SPEED    = 4.0;    // how quickly camera catches up

    const camera = new THREE.PerspectiveCamera(
        55,                                      // FOV
        window.innerWidth / window.innerHeight,  // aspect
        0.1,                                     // near
        500                                      // far
    );

    camera.position.set(0, OFFSET_UP, OFFSET_BEHIND);
    camera.lookAt(0, 0, 0);

    // Reusable vectors (no allocations per frame)
    const desiredPos = new THREE.Vector3();
    const offsetVec  = new THREE.Vector3();

    /**
     * Update camera to follow behind the car.
     * @param {THREE.Vector3} carPos      — car world position
     * @param {number}        carRotY     — car rotation.y (radians)
     * @param {number}        delta       — frame delta (seconds)
     */
    function update(carPos, carRotY, delta) {
        // Compute offset rotated by car's Y rotation
        // "Behind the car" = positive Z in car's local space
        offsetVec.set(
            -Math.sin(carRotY) * OFFSET_BEHIND,
            OFFSET_UP,
             Math.cos(carRotY) * OFFSET_BEHIND
        );

        desiredPos.copy(carPos).add(offsetVec);

        // Smooth follow via exponential lerp
        const t = 1 - Math.exp(-LERP_SPEED * delta);
        camera.position.lerp(desiredPos, t);

        // Always look at a point slightly above the car
        camera.lookAt(
            carPos.x,
            carPos.y + LOOK_OFFSET_Y,
            carPos.z
        );
    }

    // ── Resize ────────────────────────────────────────
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    return { camera: camera, update: update, handleResize: handleResize };
})();
