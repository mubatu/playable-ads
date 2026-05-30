import * as THREE from 'three';

var OBJECT_DEFS = {
    cone:      { size: 0.35, height: 0.7,  color: 0xff3333, score: 10,  category: 'small'  },
    bench:     { size: 0.5,  height: 0.5,  color: 0x8b6914, score: 10,  category: 'small'  },
    mailbox:   { size: 0.4,  height: 0.6,  color: 0xff0000, score: 10,  category: 'small'  },
    tree:      { size: 0.5,  height: 1.2,  color: 0x228b22, score: 10,  category: 'small'  },
    lamp:      { size: 0.3,  height: 1.0,  color: 0xffdd44, score: 10,  category: 'small'  },
    car:       { size: 1.0,  height: 0.7,  color: 0xff6600, score: 50,  category: 'medium' },
    stall:     { size: 1.1,  height: 1.0,  color: 0xffcc00, score: 50,  category: 'medium' },
    house:     { size: 1.3,  height: 1.5,  color: 0xcc7744, score: 50,  category: 'medium' },
    truck:     { size: 1.2,  height: 0.9,  color: 0xcc5500, score: 50,  category: 'medium' },
    building:  { size: 2.0,  height: 3.5,  color: 0x4488ff, score: 200, category: 'large'  },
    tower:     { size: 1.8,  height: 5.0,  color: 0x5599ff, score: 200, category: 'large'  },
    apartment: { size: 2.2,  height: 4.0,  color: 0x6677ee, score: 200, category: 'large'  }
};

var SMALL_TYPES  = ['cone', 'bench', 'mailbox', 'tree', 'lamp'];
var MEDIUM_TYPES = ['car', 'stall', 'house', 'truck'];
var LARGE_TYPES  = ['building', 'tower', 'apartment'];

export function spawnEnvironment(state) {
    var ws = state.config.game.worldSize;
    var sc = state.config.environment.smallCount;
    var mc = state.config.environment.mediumCount;
    var lc = state.config.environment.largeCount;

    // Small near center (radius 3..10)
    spawnRing(state, SMALL_TYPES, sc, 3, 10);

    // Medium mid-zone (radius 10..17)
    spawnRing(state, MEDIUM_TYPES, mc, 10, 17);

    // Large at edges (radius 17..ws)
    spawnRing(state, LARGE_TYPES, lc, 17, ws);
}

function spawnRing(state, types, count, rMin, rMax) {
    for (var i = 0; i < count; i++) {
        var type = types[Math.floor(Math.random() * types.length)];
        var angle = Math.random() * Math.PI * 2;
        var r = rMin + Math.random() * (rMax - rMin);
        var x = Math.cos(angle) * r;
        var z = Math.sin(angle) * r;
        createCityObject(state, type, x, z);
    }
}

function createCityObject(state, type, x, z) {
    var def = OBJECT_DEFS[type];
    if (!def) return null;

    var group = new THREE.Group();
    group.position.set(x, 0, z);

    var bodyMesh = buildBodyMesh(type, def);
    group.add(bodyMesh);

    // Optional roof/detail
    var detail = buildDetailMesh(type, def);
    if (detail) group.add(detail);

    group.userData = {
        type: type,
        size: def.size,
        height: def.height,
        score: def.score,
        category: def.category,
        consumed: false,
        animating: false,
        consumeTime: 0,
        consumeDuration: 0,
        startPos: new THREE.Vector3(),
        startScale: new THREE.Vector3(1, 1, 1)
    };

    // Randomize rotation for variety
    group.rotation.y = Math.random() * Math.PI * 2;

    state.objectsLayer.add(group);
    state.spawnedObjects.push(group);

    return group;
}

function buildBodyMesh(type, def) {
    var mat = new THREE.MeshLambertMaterial({ color: def.color });
    var geo;

    switch (type) {
        case 'cone':
            geo = new THREE.ConeGeometry(def.size / 2, def.height, 8);
            break;
        case 'tree':
            geo = new THREE.ConeGeometry(def.size / 2, def.height, 7);
            break;
        case 'lamp':
            geo = new THREE.CylinderGeometry(0.05, 0.08, def.height, 6);
            break;
        default:
            geo = new THREE.BoxGeometry(def.size, def.height, def.size);
    }

    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = def.height / 2;
    return mesh;
}

function buildDetailMesh(type, def) {
    switch (type) {
        case 'tree': {
            var trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });
            var trunkGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.4, 6);
            var trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 0.2;
            return trunk;
        }
        case 'lamp': {
            var bulbMat = new THREE.MeshLambertMaterial({ color: 0xffffaa, emissive: 0x444400 });
            var bulbGeo = new THREE.SphereGeometry(0.12, 6, 6);
            var bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.y = def.height;
            return bulb;
        }
        case 'house':
        case 'stall': {
            var roofMat = new THREE.MeshLambertMaterial({ color: 0xcc3322 });
            var roofGeo = new THREE.ConeGeometry(def.size * 0.75, def.height * 0.5, 4);
            var roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.y = def.height + def.height * 0.25;
            roof.rotation.y = Math.PI / 4;
            return roof;
        }
        case 'building':
        case 'tower':
        case 'apartment': {
            var capMat = new THREE.MeshLambertMaterial({ color: brighten(def.color, 0.3) });
            var capGeo = new THREE.BoxGeometry(def.size * 0.6, def.height * 0.1, def.size * 0.6);
            var cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = def.height + def.height * 0.05;
            return cap;
        }
        default:
            return null;
    }
}

function brighten(hex, factor) {
    var r = ((hex >> 16) & 0xff);
    var g = ((hex >> 8)  & 0xff);
    var b = (hex & 0xff);
    return (
        (Math.min(255, Math.round(r + (255 - r) * factor)) << 16) |
        (Math.min(255, Math.round(g + (255 - g) * factor)) << 8)  |
        (Math.min(255, Math.round(b + (255 - b) * factor)))
    );
}

export function updateEnvironment(state, delta) {
    var holePos = state.playerHole.position;

    for (var i = state.spawnedObjects.length - 1; i >= 0; i--) {
        var obj = state.spawnedObjects[i];
        if (!obj.userData.animating) continue;

        obj.userData.consumeTime += delta;
        var progress = obj.userData.consumeTime / obj.userData.consumeDuration;

        if (progress >= 1) {
            obj.userData.animating = false;
            obj.visible = false;
            continue;
        }

        var eased = Math.pow(progress, 0.7);
        obj.position.lerpVectors(obj.userData.startPos, holePos, eased);
        obj.scale.lerpVectors(obj.userData.startScale, new THREE.Vector3(0.05, 0.05, 0.05), progress);
    }
}

export function checkCollisions(state) {
    var ud = state.playerHole.userData;
    var holeDiameter = ud.diameter;
    var holeRadius = holeDiameter / 2;
    var holePos = state.playerHole.position;
    var consumed = [];

    for (var i = 0; i < state.spawnedObjects.length; i++) {
        var obj = state.spawnedObjects[i];
        if (!obj.visible || obj.userData.consumed || obj.userData.animating) continue;

        var dx = holePos.x - obj.position.x;
        var dz = holePos.z - obj.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        var objRadius = obj.userData.size / 2;

        if (dist < holeRadius + objRadius * 0.5 && obj.userData.size <= holeDiameter * 0.95) {
            obj.userData.consumed = true;
            obj.userData.animating = true;
            obj.userData.consumeTime = 0;
            obj.userData.consumeDuration = state.config.player.consumptionAnimDuration;
            obj.userData.startPos.copy(obj.position);
            obj.userData.startScale.copy(obj.scale);

            consumed.push({
                score: obj.userData.score,
                category: obj.userData.category,
                position: obj.position.clone()
            });
        }
    }

    return consumed;
}

export function cleanupEnvironment(state) {
    state.spawnedObjects.forEach(function (obj) {
        state.objectsLayer.remove(obj);
        obj.traverse(function (child) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    });
    state.spawnedObjects = [];
}
