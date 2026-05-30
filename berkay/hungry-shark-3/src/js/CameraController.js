export function updateCamera(state, delta) {
    if (!state.gameStarted) {
        state.camera.position.x = 0;
        state.camera.position.y = 0;
        return;
    }

    var config = state.config.camera;
    var camX;
    var camY;

    state.cameraX += (state.sharkX - state.cameraX) * config.followSmoothing;
    state.cameraY += (state.sharkY - state.cameraY) * config.followSmoothing;

    camX = state.cameraX;
    camY = state.cameraY;

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
