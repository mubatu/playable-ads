import * as THREE from 'three';

export function createShark(state) {
    var config = state.config.shark;
    var geometry = new THREE.ConeGeometry(config.startSize * 0.3, config.startSize, 8);
    var material = new THREE.MeshBasicMaterial({ color: 0x4a90e2 });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.copy(state.shark.position);
    mesh.rotation.z = Math.PI / 2;
    state.sharkGroup.add(mesh);

    state.shark.mesh = mesh;
    return mesh;
}

export function updateShark(state, delta) {
    var config = state.config.shark;
    var shark = state.shark;

    shark.boostCooldownTime = Math.max(0, shark.boostCooldownTime - delta);
    if (shark.boostActive) {
        shark.boostTime -= delta;
        if (shark.boostTime <= 0) {
            shark.boostActive = false;
        }
    }

    var moveCmd = state.moveCommand;
    var speedMult = shark.boostActive ? config.boostMultiplier : 1;
    var desiredSpeed = config.speed * speedMult;

    if (moveCmd && (Math.abs(moveCmd.x) > 0.01 || Math.abs(moveCmd.y) > 0.01)) {
        shark.targetVelocity.set(moveCmd.x, -moveCmd.y, 0);
        shark.targetVelocity.normalize().multiplyScalar(desiredSpeed);
    } else {
        shark.targetVelocity.set(0, 0, 0);
    }

    shark.velocity.x += (shark.targetVelocity.x - shark.velocity.x) * config.acceleration;
    shark.velocity.y += (shark.targetVelocity.y - shark.velocity.y) * config.acceleration;

    var currentSpeed = Math.sqrt(shark.velocity.x * shark.velocity.x + shark.velocity.y * shark.velocity.y);
    var maxSpd = config.maxSpeed * speedMult;
    if (currentSpeed > maxSpd && currentSpeed > 0) {
        shark.velocity.x = (shark.velocity.x / currentSpeed) * maxSpd;
        shark.velocity.y = (shark.velocity.y / currentSpeed) * maxSpd;
    }

    shark.position.x += shark.velocity.x * delta;
    shark.position.y += shark.velocity.y * delta;

    var worldConfig = state.config.world;
    shark.position.x = Math.max(-worldConfig.width * 0.5, Math.min(worldConfig.width * 0.5, shark.position.x));
    shark.position.y = Math.max(-worldConfig.height * 0.5, Math.min(worldConfig.height * 0.5, shark.position.y));

    if (shark.mesh) {
        shark.mesh.position.copy(shark.position);

        var velLength = Math.sqrt(shark.velocity.x * shark.velocity.x + shark.velocity.y * shark.velocity.y);
        if (velLength > 0.01) {
            var targetRotation = Math.atan2(shark.velocity.y, shark.velocity.x) + Math.PI / 2;
            var angleDiff = targetRotation - shark.mesh.rotation.z;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            shark.mesh.rotation.z += angleDiff * 0.15;
        }

        shark.mesh.scale.set(shark.size, shark.size, shark.size);
    }
}

export function activateBoost(state) {
    var config = state.config.shark;
    if (!state.shark.boostActive && state.shark.boostCooldownTime <= 0) {
        state.shark.boostActive = true;
        state.shark.boostTime = config.boostDuration;
        state.shark.boostCooldownTime = config.boostCooldown;
    }
}
