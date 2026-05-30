import * as THREE from 'three';

export function createEnvironment(config, scene) {
    const group = new THREE.Group();

    // Create ground with texture pattern
    const groundGeometry = new THREE.PlaneGeometry(config.world.mapSize, config.world.mapSize);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Draw checkered pattern for streets and sidewalks
    const tileSize = 32;
    const colors = ['#808080', '#A9A9A9', '#90EE90', '#9ACD32'];
    for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
            const idx = ((x / tileSize) + (y / tileSize)) % 4;
            ctx.fillStyle = colors[idx];
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const groundMaterial = new THREE.MeshLambertMaterial({ map: texture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    group.add(ground);

    // Create sky dome
    const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: config.world.skyColor,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    group.add(sky);

    return group;
}

export function createEnvironmentObjects(config, scene) {
    const objects = [];

    config.objects.categories.forEach(category => {
        for (let i = 0; i < category.count; i++) {
            const obj = createRandomObject(config, category);
            objects.push(obj);
            scene.add(obj.mesh);
        }
    });

    return objects;
}

function createRandomObject(config, category) {
    const size = category.size;
    const diameter = category.diameter;

    // Random position on map
    const mapSize = config.world.mapSize;
    const x = (Math.random() - 0.5) * mapSize * 0.8;
    const y = (Math.random() - 0.5) * mapSize * 0.8;
    const z = size / 2;

    // Create geometry based on object type
    const geometry = createObjectGeometry(size, category.name);
    const material = new THREE.MeshPhongMaterial({ color: category.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.material.transparent = true;

    const obj = {
        mesh: mesh,
        diameter: diameter,
        points: category.points,
        type: category.name,
        consumed: false,
        worldPosition: new THREE.Vector3(x, y, z)
    };

    return obj;
}

function createObjectGeometry(size, type) {
    switch (type) {
        case 'small':
            return new THREE.BoxGeometry(size, size, size);
        case 'medium':
            return new THREE.CylinderGeometry(size / 2, size / 2, size, 8);
        case 'large':
            return new THREE.BoxGeometry(size * 0.8, size * 1.2, size * 0.8);
        default:
            return new THREE.BoxGeometry(size, size, size);
    }
}

export function createBuildings(config, scene) {
    const buildings = [];
    const buildingPositions = [
        { x: -12, y: -12 },
        { x: 12, y: -12 },
        { x: -12, y: 12 },
        { x: 12, y: 12 },
        { x: 0, y: -15 },
        { x: 0, y: 15 },
        { x: -15, y: 0 },
        { x: 15, y: 0 }
    ];

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

    buildingPositions.forEach((pos, idx) => {
        const height = 3 + Math.random() * 6;
        const width = 1.5 + Math.random() * 1;
        const depth = 1.5 + Math.random() * 1;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({ color: colors[idx % colors.length] });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(pos.x, pos.y, height / 2);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);
        buildings.push(mesh);
    });

    return buildings;
}
