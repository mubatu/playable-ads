export function updateEntities(state, delta, elapsed) {
    var world = state.config.world;
    var halfW = world.width * 0.5;

    updateFishList(state.smallFish, delta, elapsed, halfW);
    updateFishList(state.mediumFish, delta, elapsed, halfW);
    updateJellyfishList(state.jellyfish, delta, elapsed, halfW);
    updateCoins(state.coinItems, elapsed);
    updateMines(state.mines, elapsed);
    updateBubbles(state, delta, elapsed);
}

function updateFishList(list, delta, elapsed, halfW) {
    for (var i = 0; i < list.length; i++) {
        var fish = list[i];
        var d = fish.userData;
        fish.position.x += d.speed * d.dir * delta;
        fish.position.y = d.baseY + Math.sin(elapsed * 1.5 + d.bobPhase) * 0.3;

        if (fish.position.x > halfW + 2) {
            d.dir = -1;
        } else if (fish.position.x < -halfW - 2) {
            d.dir = 1;
        }

        fish.scale.x = d.dir > 0 ? 1 : -1;
    }
}

function updateJellyfishList(list, delta, elapsed, halfW) {
    for (var i = 0; i < list.length; i++) {
        var jelly = list[i];
        var d = jelly.userData;
        jelly.position.x += d.speed * d.dir * delta * 0.5;
        jelly.position.y = d.baseY + Math.sin(elapsed * 0.8 + d.bobPhase) * 0.6;

        if (jelly.position.x > halfW + 2) { d.dir = -1; }
        if (jelly.position.x < -halfW - 2) { d.dir = 1; }
    }
}

function updateCoins(list, elapsed) {
    for (var i = 0; i < list.length; i++) {
        var coin = list[i];
        coin.position.y = coin.userData.baseY + Math.sin(elapsed * 2 + coin.userData.bobPhase) * 0.2;
        coin.rotation.z = elapsed * 1.5;
    }
}

function updateMines(list, elapsed) {
    for (var i = 0; i < list.length; i++) {
        var mine = list[i];
        mine.position.y = mine.userData.baseY + Math.sin(elapsed * 0.5 + mine.userData.bobPhase) * 0.15;
    }
}

function updateBubbles(state, delta, elapsed) {
    var world = state.config.world;
    for (var i = 0; i < state.bubbles.length; i++) {
        var bubble = state.bubbles[i];
        bubble.position.y += bubble.userData.speed * delta;
        bubble.position.x += Math.sin(elapsed * 2 + bubble.userData.wobblePhase) * 0.003;

        if (bubble.position.y > world.surfaceY + 1) {
            bubble.position.y = world.seabedY;
            bubble.position.x = (Math.random() - 0.5) * world.width * 0.9;
        }
    }
}
