import * as THREE from 'three';

// Object categories. width = approximate footprint used for size-based eating.
var SMALL = 'small';
var MEDIUM = 'medium';
var LARGE = 'large';

function rand(min, max) {
    return min + Math.random() * (max - min);
}

function makeCone(color) {
    var group = new THREE.Group();
    var trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6),
        new THREE.MeshLambertMaterial({ color: '#8a5a2b' })
    );
    trunk.position.y = 0.2;
    var top = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.9, 7),
        new THREE.MeshLambertMaterial({ color: color || '#2e8b57' })
    );
    top.position.y = 0.85;
    group.add(trunk);
    group.add(top);
    return group;
}

function makeTrafficCone() {
    var group = new THREE.Group();
    var cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.55, 8),
        new THREE.MeshLambertMaterial({ color: '#ff7a1a' })
    );
    cone.position.y = 0.27;
    group.add(cone);
    return group;
}

function makeBox(w, h, d, color) {
    var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ color: color })
    );
    mesh.position.y = h / 2;
    return mesh;
}

function makeCar(color) {
    var group = new THREE.Group();
    var body = makeBox(1.1, 0.45, 0.6, color);
    body.position.y = 0.32;
    var cabin = makeBox(0.6, 0.35, 0.55, '#dfe9f5');
    cabin.position.set(-0.05, 0.7, 0);
    group.add(body);
    group.add(cabin);
    return group;
}

function makeBuilding(w, h, color) {
    var group = new THREE.Group();
    var body = makeBox(w, h, w, color);
    group.add(body);
    // simple roof cap
    var roof = makeBox(w * 0.7, 0.3, w * 0.7, '#445');
    roof.position.y = h + 0.15;
    group.add(roof);
    return group;
}

var PALETTE = {
    small: ['#ff6b6b', '#4ecdc4', '#ffd93d', '#a06cd5'],
    medium: ['#ff9f43', '#54a0ff', '#1dd1a1', '#ee5253'],
    large: ['#c8d6e5', '#8395a7', '#dfe4ea', '#a4b0be']
};

function spawnDefs() {
    // ring distance from center -> progression: small near, large far.
    return [
        { category: SMALL, width: 0.5, count: 40, ring: [3, 12], make: makeTrafficCone },
        { category: SMALL, width: 0.7, count: 36, ring: [3, 13], make: function () { return makeCone(PALETTE.small[Math.floor(Math.random() * 4)]); } },
        { category: SMALL, width: 0.6, count: 20, ring: [4, 13], make: function () { return makeBox(0.5, 0.5, 0.5, PALETTE.small[Math.floor(Math.random() * 4)]); } },
        { category: MEDIUM, width: 1.3, count: 22, ring: [9, 20], make: function () { return makeCar(PALETTE.medium[Math.floor(Math.random() * 4)]); } },
        { category: MEDIUM, width: 1.8, count: 14, ring: [11, 22], make: function () { return makeBuilding(1.6, 1.6, PALETTE.medium[Math.floor(Math.random() * 4)]); } },
        { category: LARGE, width: 3.2, count: 10, ring: [16, 27], make: function () { return makeBuilding(3.0, rand(3.5, 6), PALETTE.large[Math.floor(Math.random() * 4)]); } },
        { category: LARGE, width: 4.2, count: 6, ring: [19, 28], make: function () { return makeBuilding(4.0, rand(6, 9), PALETTE.large[Math.floor(Math.random() * 4)]); } }
    ];
}

export function buildGround(config) {
    var size = config.size;
    var group = new THREE.Group();

    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshLambertMaterial({ color: config.color })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    group.add(ground);

    // road cross for a city feel
    var roadMat = new THREE.MeshLambertMaterial({ color: config.roadColor });
    var roadW = 4;
    var roadH = new THREE.Mesh(new THREE.PlaneGeometry(size, roadW), roadMat);
    roadH.rotation.x = -Math.PI / 2;
    roadH.position.y = 0.01;
    group.add(roadH);
    var roadV = new THREE.Mesh(new THREE.PlaneGeometry(roadW, size), roadMat);
    roadV.rotation.x = -Math.PI / 2;
    roadV.position.y = 0.01;
    group.add(roadV);

    return group;
}

// Returns an array of consumable descriptors: { group, category, width, baseY }
export function buildConsumables(groundConfig) {
    var defs = spawnDefs();
    var half = groundConfig.size / 2 - 2;
    var items = [];
    var i;
    var d;
    var n;

    for (d = 0; d < defs.length; d += 1) {
        var def = defs[d];
        for (n = 0; n < def.count; n += 1) {
            var angle = Math.random() * Math.PI * 2;
            var radius = rand(def.ring[0], Math.min(def.ring[1], half));
            var x = Math.cos(angle) * radius;
            var z = Math.sin(angle) * radius;
            var obj = def.make();
            obj.position.set(x, 0, z);
            obj.rotation.y = Math.random() * Math.PI * 2;
            obj.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            items.push({
                group: obj,
                category: def.category,
                width: def.width,
                baseY: obj.position.y,
                consumed: false
            });
        }
    }

    return items;
}

export { SMALL, MEDIUM, LARGE };
