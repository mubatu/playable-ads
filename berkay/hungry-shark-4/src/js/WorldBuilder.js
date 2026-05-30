import * as THREE from 'three';

export function buildWorld(state) {
    var config = state.config.world;

    var planeGeometry = new THREE.PlaneGeometry(config.width, config.height);
    var planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a3a52,
        transparent: true,
        opacity: 0.3
    });
    var waterPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    waterPlane.position.z = -0.1;

    state.scene.add(waterPlane);

    return {
        waterPlane: waterPlane
    };
}
