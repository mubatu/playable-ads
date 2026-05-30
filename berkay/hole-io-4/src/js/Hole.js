import * as THREE from 'three';

// A flat black disc on the ground with a soft edge ring. Represents the hole.
export function createHole(config) {
    var group = new THREE.Group();
    var radius = config.initialDiameter / 2;

    var disc = new THREE.Mesh(
        new THREE.CircleGeometry(1, 48),
        new THREE.MeshBasicMaterial({ color: '#050505' })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.02;
    group.add(disc);

    // soft edge ring for the gradient look
    var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.92, 1.12, 48),
        new THREE.MeshBasicMaterial({ color: '#1a1a22', transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.015;
    group.add(ring);

    group.userData = {
        diameter: config.initialDiameter,
        maxDiameter: config.maxDiameter,
        baseScale: radius,
        pulse: 0
    };
    group.scale.setScalar(radius);

    return group;
}

export function getDiameter(hole) {
    return hole.userData.diameter;
}

export function grow(hole, amount) {
    var data = hole.userData;
    data.diameter = Math.min(data.diameter + amount, data.maxDiameter);
    data.baseScale = data.diameter / 2;
    data.pulse = 1; // trigger bounce
}

export function updateHole(hole, delta) {
    var data = hole.userData;
    if (data.pulse > 0) {
        data.pulse = Math.max(0, data.pulse - delta * 5);
    }
    var bounce = 1 + Math.sin(data.pulse * Math.PI) * 0.12;
    hole.scale.setScalar(data.baseScale * bounce);
}
