export function updateShark(state, delta) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    var config = state.config;
    var mx = state.moveCommand.x;
    var my = -state.moveCommand.y;
    var magnitude = Math.sqrt(mx * mx + my * my);

    if (magnitude > 0.15) {
        state.sharkTargetAngle = Math.atan2(my, mx);
    }

    var angleDiff = state.sharkTargetAngle - state.sharkAngle;
    while (angleDiff > Math.PI) { angleDiff -= Math.PI * 2; }
    while (angleDiff < -Math.PI) { angleDiff += Math.PI * 2; }
    state.sharkAngle += angleDiff * config.shark.turnSpeed * delta;

    var speed = state.isBoosting ? config.shark.boostSpeed : config.shark.speed;
    if (state.isGoldRush) {
        speed *= 1.3;
    }

    var moveScale = magnitude > 0.15 ? Math.min(magnitude, 1) : 0.32;
    state.sharkVelX = Math.cos(state.sharkAngle) * speed * moveScale;
    state.sharkVelY = Math.sin(state.sharkAngle) * speed * moveScale;
    state.sharkX += state.sharkVelX * delta;
    state.sharkY += state.sharkVelY * delta;

    clampSharkToWorld(state);
    updateBoost(state, delta);
    syncSharkMesh(state);
}

function clampSharkToWorld(state) {
    var world = state.config.world;
    var halfW = world.width * 0.5;

    state.sharkX = Math.max(-halfW, Math.min(halfW, state.sharkX));
    state.sharkY = Math.max(world.seabedY, Math.min(world.surfaceY, state.sharkY));
}

function updateBoost(state, delta) {
    if (state.isBoosting) {
        state.boostEnergy -= 30 * delta;
        if (state.boostEnergy <= 0) {
            state.boostEnergy = 0;
            state.isBoosting = false;
        }
        return;
    }

    state.boostEnergy = Math.min(100, state.boostEnergy + 12 * delta);
}

function syncSharkMesh(state) {
    if (!state.sharkGroup) {
        return;
    }

    var targetScale = 1 + (state.sharkTier - 1) * 0.12;
    var tailWag = Math.sin(state.elapsedTime * (state.isBoosting ? 18 : 10)) * 0.3;

    state.sharkGroup.position.set(state.sharkX, state.sharkY, 0.5);
    state.sharkGroup.rotation.z = state.sharkAngle;
    state.sharkGroup.scale.set(targetScale, targetScale, targetScale);

    if (state.sharkGroup.userData.tailFin) {
        state.sharkGroup.userData.tailFin.rotation.z = Math.PI / 2 + tailWag;
    }
    if (state.sharkGroup.userData.lowerTail) {
        state.sharkGroup.userData.lowerTail.rotation.z = Math.PI * 0.6 + tailWag * 0.6;
    }
}
