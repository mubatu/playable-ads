import * as THREE from 'three';

export function createCameraController(camera, config) {
    var cfg = config.camera;
    var targetX = 0;
    var targetZ = 0;
    var tiltRad = (cfg.tiltDegrees || 60) * (Math.PI / 180);

    return {
        update: function (delta, holeX, holeZ, holeDiameter) {
            var alpha = 1 - Math.exp(-(cfg.followDamping || 4) * delta);
            var distance = (cfg.baseDistance || 14) + holeDiameter * (cfg.distancePerSize || 0.85);
            var height = Math.sin(tiltRad) * distance;
            var back = Math.cos(tiltRad) * distance;

            targetX += (holeX - targetX) * alpha;
            targetZ += (holeZ - targetZ) * alpha;

            camera.position.set(targetX, height, targetZ + back);
            camera.lookAt(targetX, cfg.lookHeight || 0, targetZ);
        },

        reset: function () {
            targetX = 0;
            targetZ = 0;
        }
    };
}

export function configurePerspectiveCamera(camera) {
    var aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.fov = 45;
    camera.near = 0.1;
    camera.far = 200;
    camera.updateProjectionMatrix();
}
