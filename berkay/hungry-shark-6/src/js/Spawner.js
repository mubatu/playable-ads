import {
    createSmallFish, createMediumFish, createHuman,
    createTurtle, createSeal, createCoin, createMine, createJellyfish
} from './EntityFactory.js';

function randomX(halfW) {
    return (Math.random() - 0.5) * halfW * 2;
}

function randomY(world, margin) {
    var m = margin || 1.0;
    return world.seabedY + m + Math.random() * (world.surfaceY - world.seabedY - m * 2);
}

function spawnAwayFromShark(state, halfW) {
    var x;
    for (var i = 0; i < 10; i++) {
        x = randomX(halfW);
        if (Math.abs(x - state.sharkX) > 7) {
            return x;
        }
    }
    return randomX(halfW);
}

export function spawnInitialEntities(state) {
    var config = state.config;
    var world = config.world;
    var spawn = config.spawn;
    var halfW = world.width * 0.45;

    for (var i = 0; i < spawn.smallFishCount; i++) {
        addSmallFish(state, randomX(halfW), randomY(world));
    }
    for (var j = 0; j < spawn.mediumFishCount; j++) {
        addMediumFish(state, randomX(halfW), randomY(world, 1.5));
    }
    for (var k = 0; k < spawn.humanCount; k++) {
        addHuman(state, randomX(halfW));
    }
    for (var l = 0; l < spawn.creatureCount; l++) {
        var creature = Math.random() > 0.5 ? 'turtle' : 'seal';
        if (creature === 'turtle') {
            addTurtle(state, randomX(halfW), randomY(world, 2));
        } else {
            addSeal(state, randomX(halfW), randomY(world, 1.5));
        }
    }
    for (var m = 0; m < spawn.coinCount; m++) {
        addCoin(state, randomX(halfW), randomY(world));
    }
    for (var n = 0; n < spawn.mineCount; n++) {
        addMine(state, randomX(halfW), randomY(world, 2));
    }
    for (var o = 0; o < spawn.jellyfishCount; o++) {
        addJellyfish(state, randomX(halfW), randomY(world, 1.5));
    }
}

export function respawnEntities(state) {
    var config = state.config;
    var world = config.world;
    var spawn = config.spawn;
    var halfW = world.width * 0.45;

    while (state.smallFish.length < spawn.smallFishCount) {
        addSmallFish(state, spawnAwayFromShark(state, halfW), randomY(world));
    }
    while (state.mediumFish.length < spawn.mediumFishCount) {
        addMediumFish(state, spawnAwayFromShark(state, halfW), randomY(world, 1.5));
    }
    while (state.humans.length < spawn.humanCount) {
        addHuman(state, spawnAwayFromShark(state, halfW));
    }
    while (state.creatures.length < spawn.creatureCount) {
        var t = Math.random() > 0.5 ? 'turtle' : 'seal';
        if (t === 'turtle') {
            addTurtle(state, spawnAwayFromShark(state, halfW), randomY(world, 2));
        } else {
            addSeal(state, spawnAwayFromShark(state, halfW), randomY(world, 1.5));
        }
    }
    while (state.coinItems.length < spawn.coinCount) {
        addCoin(state, spawnAwayFromShark(state, halfW), randomY(world));
    }
    while (state.mines.length < spawn.mineCount) {
        addMine(state, spawnAwayFromShark(state, halfW), randomY(world, 2));
    }
    while (state.jellyfish.length < spawn.jellyfishCount) {
        addJellyfish(state, spawnAwayFromShark(state, halfW), randomY(world, 1.5));
    }
}

function addSmallFish(state, x, y) {
    var fish = createSmallFish();
    fish.position.set(x, y, 0.1);
    fish.userData.baseY = y;
    state.worldGroup.add(fish);
    state.smallFish.push(fish);
}

function addMediumFish(state, x, y) {
    var fish = createMediumFish();
    fish.position.set(x, y, 0.1);
    fish.userData.baseY = y;
    state.worldGroup.add(fish);
    state.mediumFish.push(fish);
}

function addHuman(state, x) {
    var world = state.config.world;
    var y = world.surfaceY - 0.6 - Math.random() * 0.6;
    var human = createHuman();
    human.position.set(x, y, 0.15);
    human.userData.baseY = y;
    state.worldGroup.add(human);
    state.humans.push(human);
}

function addTurtle(state, x, y) {
    var turtle = createTurtle();
    turtle.position.set(x, y, 0.1);
    turtle.userData.baseY = y;
    state.worldGroup.add(turtle);
    state.creatures.push(turtle);
}

function addSeal(state, x, y) {
    var seal = createSeal();
    seal.position.set(x, y, 0.1);
    seal.userData.baseY = y;
    state.worldGroup.add(seal);
    state.creatures.push(seal);
}

function addCoin(state, x, y) {
    var coin = createCoin();
    coin.position.set(x, y, 0.25);
    coin.userData.baseY = y;
    state.worldGroup.add(coin);
    state.coinItems.push(coin);
}

function addMine(state, x, y) {
    var mine = createMine();
    mine.position.set(x, y, 0.1);
    state.worldGroup.add(mine);
    state.mines.push(mine);
}

function addJellyfish(state, x, y) {
    var jelly = createJellyfish();
    jelly.position.set(x, y, 0.1);
    jelly.userData.baseY = y;
    state.worldGroup.add(jelly);
    state.jellyfish.push(jelly);
}
