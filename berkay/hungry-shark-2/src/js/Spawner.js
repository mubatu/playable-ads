import { createSmallFish, createMediumFish, createCoin, createMine, createJellyfish } from './EntityFactory.js';

function randomPos(state, awayFromShark) {
    var w = state.config.world;
    var margin = w.spawnMargin;
    var x, y, tries = 0;
    do {
        x = (Math.random() - 0.5) * (w.width - margin * 2);
        y = w.seabedY + margin + Math.random() * (w.surfaceY - w.seabedY - margin * 2);
        tries++;
    } while (awayFromShark && Math.hypot(x - state.sharkX, y - state.sharkY) < 3 && tries < 8);
    return { x: x, y: y };
}

function makeEntity(state, type) {
    var entity;
    if (type === 'smallFish') entity = createSmallFish();
    else if (type === 'mediumFish') entity = createMediumFish();
    else if (type === 'coin') entity = createCoin();
    else if (type === 'mine') entity = createMine();
    else if (type === 'jellyfish') entity = createJellyfish();

    var pos = randomPos(state, true);
    entity.position.set(pos.x, pos.y, 0);

    var ang = Math.random() * Math.PI * 2;
    var speed = type === 'smallFish' ? 0.8 + Math.random() * 0.6
              : type === 'mediumFish' ? 0.5 + Math.random() * 0.4
              : type === 'jellyfish' ? 0.15
              : 0;
    entity.userData.velX = Math.cos(ang) * speed;
    entity.userData.velY = (type === 'jellyfish' ? 0.25 : Math.sin(ang) * speed * 0.4);
    entity.userData.swimPhase = Math.random() * Math.PI * 2;

    state.worldGroup.add(entity);
    state.entities.push(entity);
    return entity;
}

export function spawnInitialEntities(state) {
    var sp = state.config.spawn;
    var i;
    for (i = 0; i < sp.smallFishCount; i++) makeEntity(state, 'smallFish');
    for (i = 0; i < sp.mediumFishCount; i++) makeEntity(state, 'mediumFish');
    for (i = 0; i < sp.coinCount; i++) makeEntity(state, 'coin');
    for (i = 0; i < sp.mineCount; i++) makeEntity(state, 'mine');
    for (i = 0; i < sp.jellyfishCount; i++) makeEntity(state, 'jellyfish');
}

export function respawnEntities(state) {
    var sp = state.config.spawn;
    var counts = { smallFish: 0, mediumFish: 0, coin: 0, mine: 0, jellyfish: 0 };
    for (var i = 0; i < state.entities.length; i++) {
        counts[state.entities[i].userData.type]++;
    }
    if (counts.smallFish < sp.smallFishCount) makeEntity(state, 'smallFish');
    if (counts.mediumFish < sp.mediumFishCount) makeEntity(state, 'mediumFish');
    if (counts.coin < sp.coinCount) makeEntity(state, 'coin');
    if (counts.mine < sp.mineCount && Math.random() < 0.5) makeEntity(state, 'mine');
    if (counts.jellyfish < sp.jellyfishCount && Math.random() < 0.5) makeEntity(state, 'jellyfish');
}

export function updateEntities(state, delta) {
    var w = state.config.world;
    var halfW = w.width / 2;
    for (var i = 0; i < state.entities.length; i++) {
        var e = state.entities[i];
        var u = e.userData;
        if (u.type === 'coin' || u.type === 'mine') {
            // bob slightly
            e.position.y += Math.sin(state.elapsedTime * 2 + i) * delta * 0.15;
            if (u.type === 'coin') e.rotation.z += delta * 2;
            continue;
        }
        u.swimPhase += delta * 4;
        e.position.x += u.velX * delta;
        e.position.y += u.velY * delta + Math.sin(u.swimPhase) * 0.005;

        if (u.type === 'jellyfish') {
            // gentle drift, pulse opacity
            if (e.position.y > w.surfaceY - 0.3) u.velY = -Math.abs(u.velY);
            if (e.position.y < w.seabedY + 0.5) u.velY = Math.abs(u.velY);
        } else {
            // fish: wrap & flip
            if (e.position.x > halfW + 1) { e.position.x = -halfW - 1; }
            if (e.position.x < -halfW - 1) { e.position.x = halfW + 1; }
            if (e.position.y > w.surfaceY - 0.2) u.velY = -Math.abs(u.velY);
            if (e.position.y < w.seabedY + 0.5) u.velY = Math.abs(u.velY);
            e.scale.x = u.velX < 0 ? -1 : 1;
        }
    }
}
