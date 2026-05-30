import * as THREE from 'three';

var colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9F43', '#6C5CE7'];

export function createSmallFish(state, x, y) {
    var geometry = new THREE.ConeGeometry(0.15, 0.35, 6);
    var color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    var material = new THREE.MeshBasicMaterial({ color: color });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, 0);
    mesh.rotation.z = Math.random() * Math.PI * 2;
    state.entitiesGroup.add(mesh);

    var entity = {
        mesh: mesh,
        type: 'small_fish',
        x: x,
        y: y,
        size: 0.2,
        health: 1,
        maxHealth: 1,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0),
        ai: 'wander',
        wanderTime: 0,
        wanderDuration: 2 + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2
    };

    state.entities.push(entity);
    return entity;
}

export function createMediumFish(state, x, y) {
    var geometry = new THREE.ConeGeometry(0.25, 0.5, 8);
    var color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    var material = new THREE.MeshBasicMaterial({ color: color });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, 0);
    mesh.rotation.z = Math.random() * Math.PI * 2;
    state.entitiesGroup.add(mesh);

    var entity = {
        mesh: mesh,
        type: 'medium_fish',
        x: x,
        y: y,
        size: 0.35,
        health: 3,
        maxHealth: 3,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 0),
        ai: 'wander',
        wanderTime: 0,
        wanderDuration: 3 + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2
    };

    state.entities.push(entity);
    return entity;
}

export function createJellyfish(state, x, y) {
    var geometry = new THREE.SphereGeometry(0.2, 8, 8);
    var material = new THREE.MeshBasicMaterial({ color: 0xff6b9d });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, 0);
    state.entitiesGroup.add(mesh);

    var entity = {
        mesh: mesh,
        type: 'jellyfish',
        x: x,
        y: y,
        size: 0.25,
        health: 5,
        maxHealth: 5,
        velocity: new THREE.Vector3(0, -0.5, 0),
        ai: 'drift',
        driftTime: 0
    };

    state.entities.push(entity);
    return entity;
}

export function createMine(state, x, y) {
    var geometry = new THREE.OctahedronGeometry(0.15);
    var material = new THREE.MeshBasicMaterial({ color: 0x333333 });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, 0);
    state.entitiesGroup.add(mesh);

    var entity = {
        mesh: mesh,
        type: 'mine',
        x: x,
        y: y,
        size: 0.2,
        health: 1,
        maxHealth: 1,
        velocity: new THREE.Vector3(0, 0, 0),
        ai: 'static',
        rotation: 0
    };

    state.entities.push(entity);
    return entity;
}

export function createHuman(state, x, y) {
    var geometry = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8);
    var material = new THREE.MeshBasicMaterial({ color: 0xf5a962 });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, 0);
    state.entitiesGroup.add(mesh);

    var entity = {
        mesh: mesh,
        type: 'human',
        x: x,
        y: y,
        size: 0.3,
        health: 2,
        maxHealth: 2,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 1, 0, 0),
        ai: 'wander',
        wanderTime: 0,
        wanderDuration: 4 + Math.random() * 2
    };

    state.entities.push(entity);
    return entity;
}

export function createCoin(state, x, y) {
    var geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
    var material = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, 0);
    state.coinsGroup.add(mesh);

    var coin = {
        mesh: mesh,
        type: 'coin',
        x: x,
        y: y,
        size: 0.1,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2 + 0.5, 0),
        life: 10,
        maxLife: 10
    };

    state.coins.push(coin);
    return coin;
}

export function updateEntity(entity, delta, config) {
    if (entity.ai === 'wander') {
        entity.wanderTime += delta;
        if (entity.wanderTime >= entity.wanderDuration) {
            entity.wanderTime = 0;
            entity.wanderDuration = 2 + Math.random() * 3;
            entity.velocity.x = (Math.random() - 0.5) * 2;
            entity.velocity.y = (Math.random() - 0.5) * 2;
        }
    } else if (entity.ai === 'drift') {
        entity.driftTime += delta;
        entity.velocity.x = Math.sin(entity.driftTime * 0.5) * 0.3;
    } else if (entity.ai === 'static') {
        entity.rotation += delta * 3;
        if (entity.mesh) {
            entity.mesh.rotation.z = entity.rotation;
        }
    }

    entity.x += entity.velocity.x * delta;
    entity.y += entity.velocity.y * delta;

    if (entity.mesh) {
        entity.mesh.position.x = entity.x;
        entity.mesh.position.y = entity.y;

        if (entity.velocity.length() > 0.01 && entity.ai !== 'static') {
            entity.mesh.rotation.z = Math.atan2(entity.velocity.y, entity.velocity.x) + Math.PI / 2;
        }
    }

    var worldWidth = config.world.width;
    var worldHeight = config.world.height;
    if (entity.x < -worldWidth * 0.5 || entity.x > worldWidth * 0.5 ||
        entity.y < -worldHeight * 0.5 || entity.y > worldHeight * 0.5) {
        return false;
    }

    return true;
}

export function updateCoin(coin, delta) {
    coin.velocity.y -= 2 * delta;
    coin.velocity.multiplyScalar(0.95);

    coin.x += coin.velocity.x * delta;
    coin.y += coin.velocity.y * delta;
    coin.life -= delta;

    if (coin.mesh) {
        coin.mesh.position.x = coin.x;
        coin.mesh.position.y = coin.y;
        coin.mesh.rotation.z += delta * 5;
        coin.mesh.material.opacity = coin.life / coin.maxLife;
    }

    return coin.life > 0;
}
