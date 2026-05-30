import * as THREE from 'three';

var SMALL_COLORS = [0xFF6347, 0xFFD700, 0x32CD32, 0x4169E1, 0xFF69B4];
var MEDIUM_COLORS = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6];
var LARGE_COLORS = [0x95A5A6, 0xBDC3C7, 0x7F8C8D, 0xD5D8DC, 0xAAB7B8];

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function createGround(config) {
    var size = config.size;
    var groundGeo = new THREE.PlaneGeometry(size, size);
    var groundMat = new THREE.MeshLambertMaterial({ color: config.groundColor });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    return ground;
}

function createRoads(config) {
    var group = new THREE.Group();
    var size = config.size;
    var roadWidth = 1.2;
    var roadMat = new THREE.MeshLambertMaterial({ color: config.roadColor });

    var roadH = new THREE.Mesh(new THREE.PlaneGeometry(size, roadWidth), roadMat);
    roadH.rotation.x = -Math.PI / 2;
    roadH.position.y = 0.005;
    group.add(roadH);

    var roadV = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, size), roadMat);
    roadV.rotation.x = -Math.PI / 2;
    roadV.position.y = 0.005;
    group.add(roadV);

    var roadH2 = new THREE.Mesh(new THREE.PlaneGeometry(size, roadWidth), roadMat);
    roadH2.rotation.x = -Math.PI / 2;
    roadH2.position.set(0, 0.005, size * 0.25);
    group.add(roadH2);

    var roadH3 = new THREE.Mesh(new THREE.PlaneGeometry(size, roadWidth), roadMat);
    roadH3.rotation.x = -Math.PI / 2;
    roadH3.position.set(0, 0.005, -size * 0.25);
    group.add(roadH3);

    var roadV2 = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, size), roadMat);
    roadV2.rotation.x = -Math.PI / 2;
    roadV2.position.set(size * 0.25, 0.005, 0);
    group.add(roadV2);

    var roadV3 = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, size), roadMat);
    roadV3.rotation.x = -Math.PI / 2;
    roadV3.position.set(-size * 0.25, 0.005, 0);
    group.add(roadV3);

    return group;
}

function createTrafficCone(x, z) {
    var group = new THREE.Group();
    var cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.4, 8),
        new THREE.MeshLambertMaterial({ color: 0xFF6600 })
    );
    cone.position.y = 0.2;
    group.add(cone);
    group.position.set(x, 0, z);
    group.userData = { objectSize: 0.3, category: 'small', points: 10 };
    return group;
}

function createBench(x, z) {
    var group = new THREE.Group();
    var seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.08, 0.3),
        new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    );
    seat.position.y = 0.3;
    group.add(seat);

    var leg1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.3, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    leg1.position.set(-0.3, 0.15, 0);
    group.add(leg1);

    var leg2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.3, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    leg2.position.set(0.3, 0.15, 0);
    group.add(leg2);

    group.position.set(x, 0, z);
    group.userData = { objectSize: 0.8, category: 'small', points: 10 };
    return group;
}

function createTree(x, z) {
    var group = new THREE.Group();
    var trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.6, 8),
        new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    );
    trunk.position.y = 0.3;
    group.add(trunk);

    var foliage = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 0.8, 8),
        new THREE.MeshLambertMaterial({ color: randomFromArray([0x228B22, 0x2E8B57, 0x32CD32]) })
    );
    foliage.position.y = 0.9;
    group.add(foliage);

    group.position.set(x, 0, z);
    group.userData = { objectSize: 0.8, category: 'small', points: 10 };
    return group;
}

function createStreetLamp(x, z) {
    var group = new THREE.Group();
    var pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    pole.position.y = 0.6;
    group.add(pole);

    var light = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0xFFFF99, emissive: 0xFFFF44 })
    );
    light.position.y = 1.25;
    group.add(light);

    group.position.set(x, 0, z);
    group.userData = { objectSize: 0.5, category: 'small', points: 10 };
    return group;
}

function createMailbox(x, z) {
    var group = new THREE.Group();
    var box = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.5, 0.25),
        new THREE.MeshLambertMaterial({ color: 0x2196F3 })
    );
    box.position.y = 0.45;
    group.add(box);

    var post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
        new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    post.position.y = 0.2;
    group.add(post);

    group.position.set(x, 0, z);
    group.userData = { objectSize: 0.4, category: 'small', points: 10 };
    return group;
}

function createCar(x, z, rotation) {
    var group = new THREE.Group();
    var body = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.5, 0.9),
        new THREE.MeshLambertMaterial({ color: randomFromArray(MEDIUM_COLORS) })
    );
    body.position.y = 0.35;
    group.add(body);

    var cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.35, 0.8),
        new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 })
    );
    cabin.position.set(-0.1, 0.7, 0);
    group.add(cabin);

    var wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
    var wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    var positions = [[-0.55, 0.15, 0.45], [0.55, 0.15, 0.45], [-0.55, 0.15, -0.45], [0.55, 0.15, -0.45]];
    var i, wheel;
    for (i = 0; i < positions.length; i += 1) {
        wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(positions[i][0], positions[i][1], positions[i][2]);
        wheel.rotation.x = Math.PI / 2;
        group.add(wheel);
    }

    group.position.set(x, 0, z);
    group.rotation.y = rotation || 0;
    group.userData = { objectSize: 1.8, category: 'medium', points: 50 };
    return group;
}

function createSmallHouse(x, z) {
    var group = new THREE.Group();
    var walls = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.2, 1.4),
        new THREE.MeshLambertMaterial({ color: randomFromArray([0xFFE4C4, 0xFFF8DC, 0xFAEBD7, 0xF5DEB3]) })
    );
    walls.position.y = 0.6;
    group.add(walls);

    var roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.3, 0.7, 4),
        new THREE.MeshLambertMaterial({ color: 0xCC4444 })
    );
    roof.position.y = 1.55;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    var door = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.5, 0.05),
        new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    );
    door.position.set(0, 0.3, 0.72);
    group.add(door);

    group.position.set(x, 0, z);
    group.userData = { objectSize: 1.6, category: 'medium', points: 50 };
    return group;
}

function createTruck(x, z, rotation) {
    var group = new THREE.Group();
    var cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.8, 1.0),
        new THREE.MeshLambertMaterial({ color: randomFromArray(MEDIUM_COLORS) })
    );
    cabin.position.set(0.9, 0.5, 0);
    group.add(cabin);

    var cargo = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.0, 1.1),
        new THREE.MeshLambertMaterial({ color: 0xDDDDDD })
    );
    cargo.position.set(-0.3, 0.55, 0);
    group.add(cargo);

    group.position.set(x, 0, z);
    group.rotation.y = rotation || 0;
    group.userData = { objectSize: 2.2, category: 'medium', points: 50 };
    return group;
}

function createBuilding(x, z, width, height, depth) {
    var group = new THREE.Group();
    var color = randomFromArray(LARGE_COLORS);
    var body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshLambertMaterial({ color: color })
    );
    body.position.y = height / 2;
    group.add(body);

    var windowColor = 0xADD8E6;
    var windowMat = new THREE.MeshLambertMaterial({ color: windowColor, emissive: 0x334455 });
    var row, col, winMesh;
    var winRows = Math.floor(height / 0.8);
    var winCols = Math.floor(width / 0.7);
    for (row = 0; row < winRows; row += 1) {
        for (col = 0; col < winCols; col += 1) {
            winMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(0.25, 0.3),
                windowMat
            );
            winMesh.position.set(
                -width / 2 + 0.4 + col * 0.65,
                0.5 + row * 0.8,
                depth / 2 + 0.01
            );
            group.add(winMesh);
        }
    }

    group.position.set(x, 0, z);
    group.userData = { objectSize: Math.max(width, depth), category: 'large', points: 200 };
    return group;
}

function createFoodStall(x, z) {
    var group = new THREE.Group();
    var base = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.8),
        new THREE.MeshLambertMaterial({ color: 0xDEB887 })
    );
    base.position.y = 0.4;
    group.add(base);

    var awning = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.05, 1.0),
        new THREE.MeshLambertMaterial({ color: randomFromArray([0xFF4444, 0x4444FF, 0x44BB44]) })
    );
    awning.position.y = 1.1;
    group.add(awning);

    group.position.set(x, 0, z);
    group.userData = { objectSize: 1.4, category: 'medium', points: 50 };
    return group;
}

export function createEnvironment(config) {
    var group = new THREE.Group();
    var objects = [];
    var mapSize = config.size;
    var halfSize = mapSize / 2;
    var i, obj;

    var ground = createGround(config);
    group.add(ground);

    var roads = createRoads(config);
    group.add(roads);

    var boundary = new THREE.Mesh(
        new THREE.PlaneGeometry(mapSize + 2, mapSize + 2),
        new THREE.MeshLambertMaterial({ color: 0x5B8C3E })
    );
    boundary.rotation.x = -Math.PI / 2;
    boundary.position.y = -0.01;
    group.add(boundary);

    var smallCreators = [createTrafficCone, createBench, createTree, createStreetLamp, createMailbox];
    for (i = 0; i < 25; i += 1) {
        var creator = randomFromArray(smallCreators);
        var sx = (Math.random() - 0.5) * mapSize * 0.5;
        var sz = (Math.random() - 0.5) * mapSize * 0.5;
        if (Math.abs(sx) < 1.5 && Math.abs(sz) < 1.5) {
            sx += 2.5;
        }
        obj = creator(sx, sz);
        group.add(obj);
        objects.push(obj);
    }

    var mediumCreators = [createCar, createSmallHouse, createTruck, createFoodStall];
    for (i = 0; i < 16; i += 1) {
        var mCreator = randomFromArray(mediumCreators);
        var mx = (Math.random() - 0.5) * mapSize * 0.7;
        var mz = (Math.random() - 0.5) * mapSize * 0.7;
        if (Math.abs(mx) < 3 && Math.abs(mz) < 3) {
            mx += mx >= 0 ? 4 : -4;
        }
        var rot = mCreator === createCar || mCreator === createTruck
            ? Math.random() * Math.PI * 2
            : 0;
        obj = mCreator(mx, mz, rot);
        group.add(obj);
        objects.push(obj);
    }

    var buildingConfigs = [
        { w: 2.5, h: 4.0, d: 2.5 },
        { w: 2.0, h: 5.0, d: 2.0 },
        { w: 3.0, h: 3.5, d: 2.5 },
        { w: 2.0, h: 6.0, d: 2.0 },
        { w: 3.5, h: 4.5, d: 3.0 },
        { w: 2.5, h: 5.5, d: 2.5 },
        { w: 2.0, h: 3.0, d: 2.0 },
        { w: 3.0, h: 7.0, d: 2.5 }
    ];
    for (i = 0; i < buildingConfigs.length; i += 1) {
        var bc = buildingConfigs[i];
        var angle = (i / buildingConfigs.length) * Math.PI * 2 + Math.random() * 0.3;
        var dist = halfSize * 0.55 + Math.random() * halfSize * 0.3;
        var bx = Math.cos(angle) * dist;
        var bz = Math.sin(angle) * dist;
        obj = createBuilding(bx, bz, bc.w, bc.h, bc.d);
        group.add(obj);
        objects.push(obj);
    }

    return {
        group: group,
        objects: objects,
        ground: ground,
        mapSize: mapSize
    };
}
