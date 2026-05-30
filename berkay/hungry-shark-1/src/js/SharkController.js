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

    var moveScale = magnitude > 0.15 ? Math.min(magnitude, 1) : 0.3;

    state.sharkVelX = Math.cos(state.sharkAngle) * speed * moveScale;
    state.sharkVelY = Math.sin(state.sharkAngle) * speed * moveScale;
    state.sharkX += state.sharkVelX * delta;
    state.sharkY += state.sharkVelY * delta;

    var world = config.world;
    var halfW = world.width * 0.5;
    if (state.sharkX < -halfW) { state.sharkX = -halfW; }
    if (state.sharkX > halfW) { state.sharkX = halfW; }
    if (state.sharkY < world.seabedY) { state.sharkY = world.seabedY; }
    if (state.sharkY > world.surfaceY) { state.sharkY = world.surfaceY; }

    if (state.isBoosting) {
        state.boostEnergy -= 30 * delta;
        if (state.boostEnergy <= 0) {
            state.boostEnergy = 0;
            state.isBoosting = false;
        }
    } else {
        state.boostEnergy = Math.min(100, state.boostEnergy + 10 * delta);
    }

    if (state.sharkGroup) {
        state.sharkGroup.position.set(state.sharkX, state.sharkY, 0.5);
        state.sharkGroup.rotation.z = state.sharkAngle;

        var tailWag = Math.sin(state.elapsedTime * (state.isBoosting ? 18 : 10)) * 0.3;
        if (state.sharkGroup.userData.tailFin) {
            state.sharkGroup.userData.tailFin.rotation.z = Math.PI / 2 + tailWag;
        }
        if (state.sharkGroup.userData.tailFinLower) {
            state.sharkGroup.userData.tailFinLower.rotation.z = Math.PI * 0.6 + tailWag * 0.6;
        }

        var scaleX = state.sharkAngle > Math.PI / 2 || state.sharkAngle < -Math.PI / 2 ? -1 : 1;
        state.sharkGroup.scale.y = Math.abs(state.sharkGroup.scale.y) * (scaleX < 0 ? -1 : 1);
    }
}
