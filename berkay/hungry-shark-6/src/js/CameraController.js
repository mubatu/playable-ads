export function updateCamera(state, delta) {
    var config = state.config.camera;
    var world = state.config.world;

    var targetX = state.sharkX + state.sharkVelX * config.lookAheadX * delta;
    var targetY = state.sharkY + state.sharkVelY * config.lookAheadY * delta;

    var halfViewW = state.bgSize.width * 0.5;
    var halfViewH = state.bgSize.height * 0.5;
    var halfW = world.width * 0.5;
    var halfH = world.height * 0.5;

    targetX = Math.max(-halfW + halfViewW, Math.min(halfW - halfViewW, targetX));
    targetY = Math.max(-halfH + halfViewH, Math.min(halfH - halfViewH, targetY));

    var lerpSpeed = config.lerpSpeed;
    state.cameraX += (targetX - state.cameraX) * lerpSpeed * delta;
    state.cameraY += (targetY - state.cameraY) * lerpSpeed * delta;

    var shakeX = 0;
    var shakeY = 0;
    if (state.shakeTime > 0) {
        state.shakeTime -= delta;
        var intensity = Math.max(state.shakeTime, 0) * 0.5;
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
    }

    state.worldGroup.position.set(
        -state.cameraX + shakeX,
        -state.cameraY + shakeY,
        0
    );
}
