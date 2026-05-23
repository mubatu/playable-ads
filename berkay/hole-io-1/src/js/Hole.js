import * as THREE from 'three';

var HOLE_SEGMENTS = 48;
var EDGE_RING_INNER_RATIO = 0.82;

export function createHole(config) {
    var group = new THREE.Group();
    var diameter = config.initialDiameter;
    var radius = diameter / 2;

    var coreGeo = new THREE.CircleGeometry(radius, HOLE_SEGMENTS);
    var coreMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    var coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.x = -Math.PI / 2;
    coreMesh.position.y = 0.02;

    var edgeGeo = new THREE.RingGeometry(radius * EDGE_RING_INNER_RATIO, radius * 1.15, HOLE_SEGMENTS);
    var edgeMat = new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    var edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.rotation.x = -Math.PI / 2;
    edgeMesh.position.y = 0.01;

    group.add(coreMesh);
    group.add(edgeMesh);

    return {
        group: group,
        coreMesh: coreMesh,
        edgeMesh: edgeMesh,
        diameter: diameter,
        radius: radius,
        pulseTime: 0
    };
}

export function growHole(hole, amount, maxDiameter) {
    hole.diameter = Math.min(hole.diameter + amount, maxDiameter);
    hole.radius = hole.diameter / 2;
    hole.pulseTime = 0.25;
    rebuildHoleMeshes(hole);
}

function rebuildHoleMeshes(hole) {
    var radius = hole.radius;

    hole.coreMesh.geometry.dispose();
    hole.coreMesh.geometry = new THREE.CircleGeometry(radius, HOLE_SEGMENTS);

    hole.edgeMesh.geometry.dispose();
    hole.edgeMesh.geometry = new THREE.RingGeometry(
        radius * EDGE_RING_INNER_RATIO,
        radius * 1.15,
        HOLE_SEGMENTS
    );
}

export function updateHolePulse(hole, delta) {
    if (hole.pulseTime > 0) {
        hole.pulseTime -= delta;
        var pulse = 1 + Math.sin(hole.pulseTime * 20) * 0.04 * (hole.pulseTime / 0.25);
        hole.group.scale.set(pulse, 1, pulse);
    } else {
        hole.group.scale.set(1, 1, 1);
    }
}
