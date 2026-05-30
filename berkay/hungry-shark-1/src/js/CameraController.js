export function updateCamera(state, delta) {
    if (!state.gameStarted) {
        return;
    }

    var config = state.config.camera;
    var smoothing = config.followSmoothing;

    state.cameraX += (state.sharkX - state.cameraX) * smoothing;
    state.cameraY += (state.sharkY - state.cameraY) * smoothing;

    var camX = state.cameraX;
    var camY = state.cameraY;

    if (state.shakeTime > 0) {
        state.shakeTime -= delta;
        var intensity = config.shakeIntensity * (state.shakeTime / config.shakeDuration);
        camX += (Math.random() - 0.5) * intensity * 2;
        camY += (Math.random() - 0.5) * intensity * 2;
    }

    state.camera.position.x = camX;
    state.camera.position.y = camY;
    state.camera.updateProjectionMatrix();
}
