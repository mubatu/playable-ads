import * as THREE from 'three';

function createGroundTexture(size) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var tile = 64;
    var i;
    var j;

    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#6ec06e';
    ctx.fillRect(0, 0, size, size);

    for (i = 0; i < size; i += tile) {
        for (j = 0; j < size; j += tile) {
            if (((i / tile) + (j / tile)) % 2 === 0) {
                ctx.fillStyle = '#65b565';
            } else {
                ctx.fillStyle = '#78c878';
            }
            ctx.fillRect(i, j, tile, tile);
        }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 3;
    for (i = tile; i < size; i += tile * 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
    }
    for (j = tile; j < size; j += tile * 2) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(size, j);
        ctx.stroke();
    }

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

function createRoadTexture() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(64, 128);
    ctx.stroke();
    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

function addBox(group, w, h, d, color, x, y, z) {
    var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: color, flatShading: true })
    );
    mesh.position.set(x, y + h * 0.5, z);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    return mesh;
}

function addCone(group, radius, height, color, x, z) {
    var mesh = new THREE.Mesh(
        new THREE.ConeGeometry(radius, height, 6),
        new THREE.MeshStandardMaterial({ color: color, flatShading: true })
    );
    mesh.position.set(x, height * 0.5, z);
    group.add(mesh);
    return mesh;
}

function addCylinder(group, radiusTop, radiusBottom, height, color, x, z) {
    var mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8),
        new THREE.MeshStandardMaterial({ color: color, flatShading: true })
    );
    mesh.position.set(x, height * 0.5, z);
    group.add(mesh);
    return mesh;
}

function createProp(type, x, z) {
    var group = new THREE.Group();
    group.position.set(x, 0, z);
    var size;
    var category;
    var score;
    var growth;
    var meshParts = [];

    if (type === 'cone') {
        meshParts.push(addCone(group, 0.15, 0.5, '#ff6b35', 0, 0));
        size = 0.35;
        category = 'small';
    } else if (type === 'bench') {
        meshParts.push(addBox(group, 0.8, 0.25, 0.35, '#8B4513', 0, 0, 0));
        meshParts.push(addBox(group, 0.08, 0.2, 0.08, '#654321', -0.3, -0.02, -0.1));
        meshParts.push(addBox(group, 0.08, 0.2, 0.08, '#654321', 0.3, -0.02, -0.1));
        size = 0.85;
        category = 'small';
    } else if (type === 'mailbox') {
        meshParts.push(addBox(group, 0.25, 0.6, 0.25, '#3498db', 0, 0, 0));
        meshParts.push(addBox(group, 0.08, 0.5, 0.08, '#555555', 0, 0, 0.18));
        size = 0.65;
        category = 'small';
    } else if (type === 'tree') {
        meshParts.push(addCylinder(group, 0.12, 0.15, 0.5, '#8B4513', 0, 0));
        meshParts.push(addCone(group, 0.45, 0.9, '#27ae60', 0, 0));
        meshParts[meshParts.length - 1].position.y = 0.85;
        size = 0.9;
        category = 'small';
    } else if (type === 'lamp') {
        meshParts.push(addCylinder(group, 0.06, 0.08, 1.4, '#555555', 0, 0));
        meshParts.push(addBox(group, 0.25, 0.08, 0.25, '#f1c40f', 0, 1.35, 0));
        size = 0.5;
        category = 'small';
    } else if (type === 'car') {
        meshParts.push(addBox(group, 0.9, 0.35, 1.6, '#e74c3c', 0, 0, 0));
        meshParts.push(addCylinder(group, 0.18, 0.18, 0.1, '#222222', -0.35, 0.55));
        meshParts.push(addCylinder(group, 0.18, 0.18, 0.1, '#222222', 0.35, 0.55));
        meshParts.push(addCylinder(group, 0.18, 0.18, 0.1, '#222222', -0.35, -0.55));
        meshParts.push(addCylinder(group, 0.18, 0.18, 0.1, '#222222', 0.35, -0.55));
        size = 1.7;
        category = 'medium';
    } else if (type === 'stall') {
        meshParts.push(addBox(group, 1.2, 0.8, 1.0, '#f39c12', 0, 0, 0));
        meshParts.push(addBox(group, 1.4, 0.08, 1.2, '#e67e22', 0, 0.85, 0));
        size = 1.5;
        category = 'medium';
    } else if (type === 'house') {
        meshParts.push(addBox(group, 1.6, 1.2, 1.4, '#ecf0f1', 0, 0, 0));
        meshParts.push(addBox(group, 1.8, 0.8, 1.6, '#c0392b', 0, 1.2, 0));
        size = 2.0;
        category = 'medium';
    } else if (type === 'truck') {
        meshParts.push(addBox(group, 1.0, 0.7, 1.2, '#3498db', -0.3, 0, 0));
        meshParts.push(addBox(group, 1.4, 1.0, 2.0, '#2980b9', 0.6, 0.05, 0));
        size = 2.4;
        category = 'medium';
    } else if (type === 'office') {
        meshParts.push(addBox(group, 2.5, 3.5, 2.5, '#bdc3c7', 0, 0, 0));
        meshParts.push(addBox(group, 2.6, 0.15, 2.6, '#95a5a6', 0, 3.6, 0));
        size = 3.5;
        category = 'large';
    } else if (type === 'tower') {
        meshParts.push(addBox(group, 1.8, 5.5, 1.8, '#7f8c8d', 0, 0, 0));
        meshParts.push(addBox(group, 2.0, 0.2, 2.0, '#636e72', 0, 5.6, 0));
        size = 5.5;
        category = 'large';
    } else if (type === 'apartment') {
        meshParts.push(addBox(group, 3.0, 4.0, 2.8, '#dfe6e9', 0, 0, 0));
        for (var row = 0; row < 4; row += 1) {
            for (var col = 0; col < 3; col += 1) {
                addBox(group, 0.35, 0.4, 0.05, '#74b9ff', -0.9 + col * 0.9, 0.6 + row * 0.9, 1.42);
            }
        }
        size = 4.0;
        category = 'large';
    }

    score = category === 'small' ? 10 : category === 'medium' ? 50 : 200;
    growth = category === 'small' ? 0.05 : category === 'medium' ? 0.1 : 0.2;

    return {
        group: group,
        size: size,
        category: category,
        score: score,
        growth: growth,
        meshParts: meshParts,
        consumed: false,
        consumeTime: 0,
        consumeDuration: 0.3,
        x: x,
        z: z
    };
}

var SMALL_TYPES = ['cone', 'bench', 'mailbox', 'tree', 'lamp'];
var MEDIUM_TYPES = ['car', 'stall', 'house', 'truck'];
var LARGE_TYPES = ['office', 'tower', 'apartment'];

function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function randomInRing(minR, maxR) {
    var angle = Math.random() * Math.PI * 2;
    var radius = minR + Math.random() * (maxR - minR);
    return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius
    };
}

export function createCityEnvironment(config) {
    var mapCfg = config.map;
    var groundSize = mapCfg.groundSize || 42;
    var container = new THREE.Group();
    var groundTex = createGroundTexture(512);
    var roadTex = createRoadTexture();
    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(groundSize, groundSize),
        new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    container.add(ground);

    var roadNS = new THREE.Mesh(
        new THREE.PlaneGeometry(3, groundSize),
        new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.95 })
    );
    roadNS.rotation.x = -Math.PI / 2;
    roadNS.position.y = 0.01;
    container.add(roadNS);

    var roadEW = new THREE.Mesh(
        new THREE.PlaneGeometry(groundSize, 3),
        new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.95 })
    );
    roadEW.rotation.x = -Math.PI / 2;
    roadEW.position.y = 0.01;
    container.add(roadEW);

    var objects = [];
    var i;
    var pos;
    var prop;

    for (i = 0; i < 18; i += 1) {
        pos = randomInRing(1.5, mapCfg.spawnRadius || 6);
        prop = createProp(randomItem(SMALL_TYPES), pos.x, pos.z);
        container.add(prop.group);
        objects.push(prop);
    }

    for (i = 0; i < 14; i += 1) {
        pos = randomInRing(7, 14);
        prop = createProp(randomItem(MEDIUM_TYPES), pos.x, pos.z);
        container.add(prop.group);
        objects.push(prop);
    }

    for (i = 0; i < 10; i += 1) {
        pos = randomInRing(14, 19);
        prop = createProp(randomItem(LARGE_TYPES), pos.x, pos.z);
        container.add(prop.group);
        objects.push(prop);
    }

    return {
        container: container,
        objects: objects,
        groundSize: groundSize,
        reset: function () {
            var j;
            for (j = 0; j < objects.length; j += 1) {
                var obj = objects[j];
                obj.consumed = false;
                obj.consumeTime = 0;
                obj.group.visible = true;
                obj.group.scale.set(1, 1, 1);
                obj.group.position.y = 0;
            }
        }
    };
}
