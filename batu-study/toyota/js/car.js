/**
 * car.js — Load the AE86 glTF model, handle WASD / arrow key driving
 */

const Car = (function () {
    'use strict';

    // ── Driving tuning ────────────────────────────────
    const SPEED         = 18;     // units / second (forward)
    const REVERSE_SPEED = 9;      // units / second (backward)
    const TURN_SPEED    = 2.2;    // radians / second
    const BOUNDARY      = GameScene.PLATFORM_HALF - 2;  // stay inside edge strips

    // ── State ─────────────────────────────────────────
    const group = new THREE.Group();           // wrapper – position & yaw live here
    GameScene.scene.add(group);

    let modelReady = false;

    // Key tracking
    const keys = {
        forward:  false,
        backward: false,
        left:     false,
        right:    false,
    };

    // ── Keyboard input ────────────────────────────────
    function onKey(e, pressed) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp':    keys.forward  = pressed; break;
            case 'KeyS': case 'ArrowDown':  keys.backward = pressed; break;
            case 'KeyA': case 'ArrowLeft':  keys.left     = pressed; break;
            case 'KeyD': case 'ArrowRight': keys.right    = pressed; break;
        }
    }
    window.addEventListener('keydown', function (e) { onKey(e, true);  });
    window.addEventListener('keyup',   function (e) { onKey(e, false); });

    // ── Load the glTF model ───────────────────────────
    const loadPromise = new Promise(function (resolve, reject) {
        var loader = new THREE.GLTFLoader();

        loader.load(
            'models/1985_toyota/scene.gltf',
            function (gltf) {
                var model = gltf.scene;

                // Compute bounding box to normalise scale & position
                var box = new THREE.Box3().setFromObject(model);
                var size = new THREE.Vector3();
                box.getSize(size);
                var center = new THREE.Vector3();
                box.getCenter(center);

                // Scale so the car is roughly 4 units long
                var maxDim = Math.max(size.x, size.y, size.z);
                var desiredLength = 4;
                var scaleFactor = desiredLength / maxDim;
                model.scale.multiplyScalar(scaleFactor);

                // Re-center: place bottom of car on Y = 0
                box.setFromObject(model);
                box.getCenter(center);
                model.position.sub(center);
                box.setFromObject(model);
                model.position.y -= box.min.y;   // sit on ground

                // Enable shadows on all meshes
                model.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                group.add(model);
                modelReady = true;

                // Hide loading overlay
                var overlay = document.getElementById('loading');
                if (overlay) overlay.classList.add('hidden');

                resolve();
            },
            undefined, // progress
            function (err) {
                console.error('Failed to load car model:', err);
                reject(err);
            }
        );
    });

    // ── Per-frame update ──────────────────────────────
    function update(delta) {
        if (!modelReady) return;

        var moving = 0; // +1 forward, -1 reverse

        if (keys.forward)  moving =  1;
        if (keys.backward) moving = -1;

        // Turn only when the car is moving
        if (moving !== 0) {
            if (keys.left)  group.rotation.y += TURN_SPEED * delta;
            if (keys.right) group.rotation.y -= TURN_SPEED * delta;
        }

        // Move along the car's local forward (-Z after default Three.js convention)
        if (moving !== 0) {
            var speed = moving === 1 ? SPEED : REVERSE_SPEED;
            group.position.x -= Math.sin(group.rotation.y) * speed * moving * delta;
            group.position.z -= Math.cos(group.rotation.y) * speed * moving * delta;
        }

        // Clamp to platform boundaries
        group.position.x = Math.max(-BOUNDARY, Math.min(BOUNDARY, group.position.x));
        group.position.z = Math.max(-BOUNDARY, Math.min(BOUNDARY, group.position.z));
    }

    return {
        group: group,
        update: update,
        ready: loadPromise,
    };
})();
