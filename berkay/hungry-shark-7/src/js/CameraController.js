export function updateCamera(state, delta) {
    var camera = state.camera;
    var world = state.config.world;

    var viewHalfW = (camera.right - camera.left) * 0.5;
    var viewHalfH = (camera.top - camera.bottom) * 0.5;
    state.viewHalfW = viewHalfW;
    state.viewHalfH = viewHalfH;

    var targetX = state.shark.x;
    var targetY = state.shark.y;

    // clamp so the camera never reveals outside the world plane
    var maxX = Math.max(0, world.width * 0.5 - viewHalfW);
    var maxY = Math.max(0, world.height * 0.5 - viewHalfH);
    targetX = Math.max(-maxX, Math.min(maxX, targetX));
    targetY = Math.max(-maxY, Math.min(maxY, targetY));

    var smooth = 1 - Math.pow(0.001, delta);
    state.camTargetX = state.camTargetX === undefined ? targetX : state.camTargetX + (targetX - state.camTargetX) * smooth;
    state.camTargetY = state.camTargetY === undefined ? targetY : state.camTargetY + (targetY - state.camTargetY) * smooth;

    var shakeX = 0;
    var shakeY = 0;
    if (state.shakeTime > 0) {
        state.shakeTime -= delta;
        var mag = Math.max(0, state.shakeTime) * state.shakeIntensity * 12;
        shakeX = (Math.random() - 0.5) * mag * 0.1;
        shakeY = (Math.random() - 0.5) * mag * 0.1;
    }

    camera.position.x = state.camTargetX + shakeX;
    camera.position.y = state.camTargetY + shakeY;
    camera.position.z = 10;
    camera.updateProjectionMatrix();
}
