export function updateShark(state, delta) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    var config = state.config;
    var shark = config.shark;
    var world = config.world;
    var mx = state.moveCommand.x;
    var my = -state.moveCommand.y;
    var magnitude = Math.sqrt(mx * mx + my * my);

    if (magnitude > 0.12) {
        state.sharkTargetAngle = Math.atan2(my, mx);
    }

    var angleDiff = state.sharkTargetAngle - state.sharkAngle;
    while (angleDiff > Math.PI) { angleDiff -= Math.PI * 2; }
    while (angleDiff < -Math.PI) { angleDiff += Math.PI * 2; }
    state.sharkAngle += angleDiff * shark.turnSpeed * delta;

    var speed = state.isBoosting ? shark.boostSpeed : shark.speed;
    if (state.isGoldRush) {
        speed *= 1.25;
    }

    var moveScale = magnitude > 0.12 ? Math.min(magnitude, 1) : 0.25;

    state.sharkVelX = Math.cos(state.sharkAngle) * speed * moveScale;
    state.sharkVelY = Math.sin(state.sharkAngle) * speed * moveScale;
    state.sharkX += state.sharkVelX * delta;
    state.sharkY += state.sharkVelY * delta;

    var halfW = world.width * 0.5;
    if (state.sharkX < -halfW) { state.sharkX = -halfW; }
    if (state.sharkX > halfW) { state.sharkX = halfW; }
    if (state.sharkY < world.seabedY + 0.4) { state.sharkY = world.seabedY + 0.4; }
    if (state.sharkY > world.surfaceY - 0.2) { state.sharkY = world.surfaceY - 0.2; }

    if (state.isBoosting) {
        state.boostEnergy -= 28 * delta;
        if (state.boostEnergy <= 0) {
            state.boostEnergy = 0;
            state.isBoosting = false;
        }
    } else {
        state.boostEnergy = Math.min(100, state.boostEnergy + 12 * delta);
    }

    if (state.sharkGroup) {
        state.sharkGroup.position.set(state.sharkX, state.sharkY, 0.5);
        state.sharkGroup.rotation.z = state.sharkAngle;

        var wagSpeed = state.isBoosting ? 20 : (state.isGoldRush ? 16 : 10);
        var wagAmt = state.isBoosting ? 0.4 : 0.28;
        var tailWag = Math.sin(state.elapsedTime * wagSpeed) * wagAmt;

        if (state.sharkGroup.userData.tailFin) {
            state.sharkGroup.userData.tailFin.rotation.z = Math.PI / 2 + tailWag;
        }
        if (state.sharkGroup.userData.tailFinLower) {
            state.sharkGroup.userData.tailFinLower.rotation.z = Math.PI * 0.6 + tailWag * 0.7;
        }

        var facingLeft = state.sharkAngle > Math.PI / 2 || state.sharkAngle < -Math.PI / 2;
        state.sharkGroup.scale.y = facingLeft ? -1 : 1;
    }
}
