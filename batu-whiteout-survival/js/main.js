/**
 * main.js — Game loop with joystick-driven movement
 */

(function () {
    'use strict';

    const { renderer, scene } = GameScene;
    const { camera } = GameCamera;
    const charGroup = Character.group;

    const MOVE_SPEED = 8;           // world units per second
    const ROTATION_SPEED = 10;      // lerp speed for turning

    // Walk animation
    const SWING_SPEED = 10;         // limb oscillation speed
    const SWING_ANGLE = 0.6;        // max limb swing in radians
    let walkTime = 0;

    // Chop animation state
    let chopping = false;
    let chopTimer = 0;
    const CHOP_DURATION = 0.35;     // seconds for one chop swing
    const CHOP_ANGLE = 1.4;         // radians — arm swing for chop

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.05); // cap big spikes

        const dir = Joystick.direction;
        const moving = Joystick.isActive() && (Math.abs(dir.x) > 0.05 || Math.abs(dir.y) > 0.05);

        if (moving) {
            // Joystick Y (screen down) → world +Z, Joystick X → world +X
            const moveX = dir.x * MOVE_SPEED * delta;
            const moveZ = dir.y * MOVE_SPEED * delta;

            charGroup.position.x += moveX;
            charGroup.position.z += moveZ;

            // Rotate character to face movement direction
            const targetAngle = Math.atan2(-dir.x, -dir.y);
            // Smooth rotation via lerp on the angle
            let currentAngle = charGroup.rotation.y;
            let diff = targetAngle - currentAngle;
            // Normalize angle diff to -PI..PI
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            charGroup.rotation.y += diff * Math.min(1, ROTATION_SPEED * delta);

            // Walk animation — swing arms & legs
            walkTime += delta * SWING_SPEED;
            const swing = Math.sin(walkTime) * SWING_ANGLE;
            Character.leftArm.rotation.x  =  swing;
            Character.rightArm.rotation.x = -swing;
            Character.leftLeg.rotation.x  = -swing;
            Character.rightLeg.rotation.x =  swing;
        } else {
            // Idle — ease limbs back to rest
            walkTime = 0;
            Character.leftArm.rotation.x  *= 0.85;
            Character.rightArm.rotation.x *= 0.85;
            Character.leftLeg.rotation.x  *= 0.85;
            Character.rightLeg.rotation.x *= 0.85;
        }

        // ---- Tree cutting ----
        // Check proximity to uncut trees
        if (!chopping) {
            const cutResult = Trees.checkCut(charGroup.position);
            if (cutResult) {
                chopping = true;
                chopTimer = 0;
            }
        }

        // Chop animation (right arm swings axe)
        if (chopping) {
            chopTimer += delta;
            const t = chopTimer / CHOP_DURATION;
            if (t < 1) {
                // Quick swing: arm goes up then down
                const swing = Math.sin(t * Math.PI) * CHOP_ANGLE;
                Character.rightArm.rotation.x = -swing;
            } else {
                chopping = false;
                Character.rightArm.rotation.x = 0;
            }
        }

        // Update falling trees
        Trees.update(delta);

        // Camera follows character
        GameCamera.update(charGroup.position, delta);

        renderer.render(scene, camera);
    }

    animate();
})();
