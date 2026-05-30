export function updateCamera(state, delta) {
    var cfg = state.config.camera;
    var targetX = state.sharkX * 0.35;
    var targetY = state.sharkY * 0.35;

    state.cameraX += (targetX - state.cameraX) * cfg.followSmoothing;
    state.cameraY += (targetY - state.cameraY) * cfg.followSmoothing;

    var shakeX = 0, shakeY = 0;
    if (state.shakeTime > 0) {
        state.shakeTime -= delta;
        var intensity = Math.max(state.shakeTime, 0) * cfg.shakeIntensity * 10;
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
    }
    state.worldGroup.position.x = -state.cameraX + shakeX;
    state.worldGroup.position.y = -state.cameraY + shakeY;
}
