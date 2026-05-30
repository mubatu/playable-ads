export function updateEntities(state, delta, elapsed) {
    var world = state.config.world;
    var halfW = world.width * 0.5;

    updateSwimmingList(state.smallFish, delta, elapsed, halfW, 1.5, 0.3);
    updateSwimmingList(state.mediumFish, delta, elapsed, halfW, 1.3, 0.25);
    updateSwimmingList(state.humans, delta, elapsed, halfW, 2.2, 0.18);
    updateSwimmingList(state.enemySharks, delta, elapsed, halfW, 1.1, 0.22);
    updateJellyfishList(state.jellyfish, delta, elapsed, halfW);
    updateCoins(state.coinItems, elapsed);
    updateMines(state.mines, elapsed);
    updateBubbles(state, delta, elapsed);
}

function updateSwimmingList(list, delta, elapsed, halfW, bobRate, bobHeight) {
    var i;

    for (i = 0; i < list.length; i += 1) {
        var entity = list[i];
        var data = entity.userData;

        entity.position.x += data.speed * data.dir * delta;
        entity.position.y = data.baseY + Math.sin(elapsed * bobRate + data.bobPhase) * bobHeight;

        if (entity.position.x > halfW + 2) {
            data.dir = -1;
        } else if (entity.position.x < -halfW - 2) {
            data.dir = 1;
        }

        entity.scale.x = data.dir > 0 ? Math.abs(entity.scale.x) : -Math.abs(entity.scale.x);
    }
}

function updateJellyfishList(list, delta, elapsed, halfW) {
    var i;

    for (i = 0; i < list.length; i += 1) {
        var jelly = list[i];
        var data = jelly.userData;

        jelly.position.x += data.speed * data.dir * delta * 0.5;
        jelly.position.y = data.baseY + Math.sin(elapsed * 0.8 + data.bobPhase) * 0.6;

        if (jelly.position.x > halfW + 2) { data.dir = -1; }
        if (jelly.position.x < -halfW - 2) { data.dir = 1; }
    }
}

function updateCoins(list, elapsed) {
    var i;

    for (i = 0; i < list.length; i += 1) {
        var coin = list[i];
        coin.position.y = coin.userData.baseY + Math.sin(elapsed * 2 + coin.userData.bobPhase) * 0.2;
        coin.rotation.z = elapsed * 1.5;
    }
}

function updateMines(list, elapsed) {
    var i;

    for (i = 0; i < list.length; i += 1) {
        var mine = list[i];
        mine.position.y = mine.userData.baseY + Math.sin(elapsed * 0.5 + mine.userData.bobPhase) * 0.15;
    }
}

function updateBubbles(state, delta, elapsed) {
    var world = state.config.world;
    var i;

    for (i = 0; i < state.bubbles.length; i += 1) {
        var bubble = state.bubbles[i];
        bubble.position.y += bubble.userData.speed * delta;
        bubble.position.x += Math.sin(elapsed * 2 + bubble.userData.wobblePhase) * 0.003;

        if (bubble.position.y > world.surfaceY + 1) {
            bubble.position.y = world.seabedY;
            bubble.position.x = (Math.random() - 0.5) * world.width * 0.9;
        }
    }
}
