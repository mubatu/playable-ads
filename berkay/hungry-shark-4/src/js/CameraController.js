export function updateCamera(state, delta) {
    var camera = state.camera;
    var shark = state.shark;

    var targetX = shark.position.x;
    var targetY = shark.position.y;

    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;

    var baseZoom = 1;
    var speed = Math.sqrt(shark.velocity.x * shark.velocity.x + shark.velocity.y * shark.velocity.y);
    var zoomOut = 1 + speed * 0.05;

    camera.zoom += (zoomOut - camera.zoom) * 0.05;
    camera.updateProjectionMatrix();
}
