import { createSmallFish, createMediumFish, createCoin, createMine, createJellyfish, createBubble } from './EntityFactory.js';

export function spawnInitialEntities(state) {
    var config = state.config;
    var world = config.world;
    var halfW = world.width * 0.45;

    for (var i = 0; i < config.spawn.smallFishCount; i++) {
        spawnSmallFish(state, randomX(halfW), randomY(world));
    }

    for (var i = 0; i < config.spawn.mediumFishCount; i++) {
        spawnMediumFish(state, randomX(halfW), randomY(world));
    }

    for (var i = 0; i < config.spawn.coinCount; i++) {
        spawnCoin(state, randomX(halfW), randomY(world));
    }

    for (var i = 0; i < config.spawn.mineCount; i++) {
        spawnMine(state, randomX(halfW), randomY(world));
    }

    for (var i = 0; i < config.spawn.jellyfishCount; i++) {
        spawnJellyfish(state, randomX(halfW), randomY(world));
    }

    for (var i = 0; i < 20; i++) {
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
    var fish = createSmallFish();
    fish.position.set(x, y, 0.1);
    fish.userData.baseY = y;
    state.worldGroup.add(fish);
    state.smallFish.push(fish);
}

function spawnMediumFish(state, x, y) {
    var fish = createMediumFish();
    fish.position.set(x, y, 0.1);
    fish.userData.baseY = y;
    state.worldGroup.add(fish);
    state.mediumFish.push(fish);
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
    var jelly = createJellyfish();
    jelly.position.set(x, y, 0.1);
    jelly.userData.baseY = y;
    state.worldGroup.add(jelly);
    state.jellyfish.push(jelly);
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

export function respawnEntities(state) {
    var config = state.config;
    var world = config.world;
    var halfW = world.width * 0.45;

    while (state.smallFish.length < config.spawn.smallFishCount) {
        var fx = spawnAwayFromShark(state, halfW);
        spawnSmallFish(state, fx, randomY(world));
    }

    while (state.mediumFish.length < config.spawn.mediumFishCount) {
        var mx = spawnAwayFromShark(state, halfW);
        spawnMediumFish(state, mx, randomY(world));
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

    while (state.bubbles.length < 20) {
        spawnBubble(state);
    }
}

function spawnAwayFromShark(state, halfW) {
    var x;
    for (var attempts = 0; attempts < 10; attempts++) {
        x = (Math.random() - 0.5) * halfW * 2;
        var dx = x - state.sharkX;
        if (Math.abs(dx) > 8) {
            return x;
        }
    }
    return x;
}
