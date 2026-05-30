import { createSmallFish, createMediumFish, createHuman, createCoin, createMine, createJellyfish, createEnemyShark, createBubble } from './EntityFactory.js';

export function spawnInitialEntities(state) {
    var config = state.config;
    var world = config.world;
    var halfW = world.width * 0.45;
    var i;

    for (i = 0; i < config.spawn.smallFishCount; i += 1) {
        spawnSmallFish(state, randomX(halfW), randomY(world));
    }
    for (i = 0; i < config.spawn.mediumFishCount; i += 1) {
        spawnMediumFish(state, randomX(halfW), randomY(world));
    }
    for (i = 0; i < config.spawn.humanCount; i += 1) {
        spawnHuman(state, randomX(halfW), world.surfaceY - 0.65 - Math.random() * 0.8);
    }
    for (i = 0; i < config.spawn.coinCount; i += 1) {
        spawnCoin(state, randomX(halfW), randomY(world));
    }
    for (i = 0; i < config.spawn.mineCount; i += 1) {
        spawnMine(state, randomX(halfW), randomY(world));
    }
    for (i = 0; i < config.spawn.jellyfishCount; i += 1) {
        spawnJellyfish(state, randomX(halfW), randomY(world));
    }
    for (i = 0; i < config.spawn.enemySharkCount; i += 1) {
        spawnEnemyShark(state, randomX(halfW), randomY(world));
    }
    for (i = 0; i < 24; i += 1) {
        spawnBubble(state);
    }
}

export function respawnEntities(state) {
    var config = state.config;
    var world = config.world;
    var halfW = world.width * 0.45;

    while (state.smallFish.length < config.spawn.smallFishCount) {
        spawnSmallFish(state, spawnAwayFromShark(state, halfW), randomY(world));
    }
    while (state.mediumFish.length < config.spawn.mediumFishCount) {
        spawnMediumFish(state, spawnAwayFromShark(state, halfW), randomY(world));
    }
    while (state.humans.length < config.spawn.humanCount) {
        spawnHuman(state, spawnAwayFromShark(state, halfW), world.surfaceY - 0.65 - Math.random() * 0.8);
    }
    while (state.coinItems.length < config.spawn.coinCount) {
        spawnCoin(state, spawnAwayFromShark(state, halfW), randomY(world));
    }
    while (state.mines.length < config.spawn.mineCount) {
        spawnMine(state, spawnAwayFromShark(state, halfW), randomY(world));
    }
    while (state.jellyfish.length < config.spawn.jellyfishCount) {
        spawnJellyfish(state, spawnAwayFromShark(state, halfW), randomY(world));
    }
    while (state.enemySharks.length < config.spawn.enemySharkCount) {
        spawnEnemyShark(state, spawnAwayFromShark(state, halfW), randomY(world));
    }
    while (state.bubbles.length < 24) {
        spawnBubble(state);
    }
}

function randomX(halfW) {
    return (Math.random() - 0.5) * halfW * 2;
}

function randomY(world) {
    return world.seabedY + 1 + Math.random() * (world.surfaceY - world.seabedY - 2);
}

function spawnSmallFish(state, x, y) {
    addSwimmingEntity(state, state.smallFish, createSmallFish(), x, y, 0.1);
}

function spawnMediumFish(state, x, y) {
    addSwimmingEntity(state, state.mediumFish, createMediumFish(), x, y, 0.12);
}

function spawnHuman(state, x, y) {
    addSwimmingEntity(state, state.humans, createHuman(), x, y, 0.18);
}

function spawnEnemyShark(state, x, y) {
    addSwimmingEntity(state, state.enemySharks, createEnemyShark(), x, y, 0.1);
}

function addSwimmingEntity(state, list, entity, x, y, z) {
    entity.position.set(x, y, z);
    entity.userData.baseY = y;
    state.worldGroup.add(entity);
    list.push(entity);
}

function spawnCoin(state, x, y) {
    var coin = createCoin();
    coin.position.set(x, y, 0.2);
    coin.userData.baseY = y;
    state.worldGroup.add(coin);
    state.coinItems.push(coin);
}

function spawnMine(state, x, y) {
    var mine = createMine();
    mine.position.set(x, y, 0.1);
    mine.userData.baseY = y;
    state.worldGroup.add(mine);
    state.mines.push(mine);
}

function spawnJellyfish(state, x, y) {
    addSwimmingEntity(state, state.jellyfish, createJellyfish(), x, y, 0.1);
}

function spawnBubble(state) {
    var world = state.config.world;
    var bubble = createBubble();
    bubble.position.set(
        (Math.random() - 0.5) * world.width * 0.9,
        world.seabedY + Math.random() * (world.surfaceY - world.seabedY),
        -0.3
    );
    state.worldGroup.add(bubble);
    state.bubbles.push(bubble);
}

function spawnAwayFromShark(state, halfW) {
    var x = 0;
    var attempts;

    for (attempts = 0; attempts < 10; attempts += 1) {
        x = (Math.random() - 0.5) * halfW * 2;
        if (Math.abs(x - state.sharkX) > 8) {
            return x;
        }
    }

    return x;
}
