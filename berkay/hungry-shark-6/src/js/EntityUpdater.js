export function updateEntities(state, delta) {
    var t = state.elapsedTime;
    var world = state.config.world;
    var halfW = world.width * 0.5;

    updateFishList(state.smallFish, delta, t, halfW, world, 0.8);
    updateFishList(state.mediumFish, delta, t, halfW, world, 0.5);
    updateHumans(state.humans, delta, t, halfW, world);
    updateCreatures(state.creatures, delta, t, halfW, world);
    updateCoins(state.coinItems, delta, t);
    updateJellyfish(state.jellyfish, delta, t, world);
    rotateMines(state.mines, delta);
}

function updateFishList(list, delta, t, halfW, world, wobbleScale) {
    for (var i = 0; i < list.length; i++) {
        var fish = list[i];
        var ud = fish.userData;

        ud.wobblePhase += delta * 3;
        var wobble = Math.sin(ud.wobblePhase) * wobbleScale;

        fish.position.x += ud.swimDir * ud.speed * delta;
        fish.position.y = ud.baseY + wobble * 0.4;

        if (fish.position.x > halfW - 1) {
            ud.swimDir = -1;
        } else if (fish.position.x < -halfW + 1) {
            ud.swimDir = 1;
        }

        fish.rotation.y = ud.swimDir > 0 ? 0 : Math.PI;
        fish.rotation.z = Math.sin(ud.wobblePhase * 0.5) * 0.12;
    }
}

function updateHumans(list, delta, t, halfW, world) {
    for (var i = 0; i < list.length; i++) {
        var human = list[i];
        var ud = human.userData;

        ud.swimPhase += delta * 2.5;

        human.position.x += ud.swimDir * ud.speed * delta;
        human.position.y = ud.baseY + Math.sin(ud.swimPhase) * 0.15;

        if (human.position.x > halfW - 0.5) {
            ud.swimDir = -1;
        } else if (human.position.x < -halfW + 0.5) {
            ud.swimDir = 1;
        }

        human.rotation.z = Math.sin(ud.swimPhase) * 0.15;
    }
}

function updateCreatures(list, delta, t, halfW, world) {
    for (var i = 0; i < list.length; i++) {
        var creature = list[i];
        var ud = creature.userData;

        ud.wobblePhase += delta * 1.8;
        creature.position.x += ud.swimDir * ud.speed * delta;
        creature.position.y = ud.baseY + Math.sin(ud.wobblePhase) * 0.3;

        if (creature.position.x > halfW - 1) {
            ud.swimDir = -1;
        } else if (creature.position.x < -halfW + 1) {
            ud.swimDir = 1;
        }

        creature.rotation.y = ud.swimDir > 0 ? 0 : Math.PI;
    }
}

function updateCoins(list, delta, t) {
    for (var i = 0; i < list.length; i++) {
        var coin = list[i];
        coin.userData.wobblePhase += delta * 2;
        coin.position.y = coin.userData.baseY + Math.sin(coin.userData.wobblePhase) * 0.12;
        coin.rotation.y += delta * 2.5;
    }
}

function updateJellyfish(list, delta, t, world) {
    for (var i = 0; i < list.length; i++) {
        var jelly = list[i];
        jelly.userData.wobblePhase += delta * 1.2;
        var bob = Math.sin(jelly.userData.wobblePhase) * 0.25;
        jelly.position.y = jelly.userData.baseY + bob;

        var surfaceLimit = world.surfaceY - 0.8;
        var seabedLimit = world.seabedY + 1.5;
        if (jelly.position.y > surfaceLimit) {
            jelly.userData.baseY = surfaceLimit - Math.abs(bob);
        }
        if (jelly.position.y < seabedLimit) {
            jelly.userData.baseY = seabedLimit + Math.abs(bob);
        }
    }
}

function rotateMines(list, delta) {
    for (var i = 0; i < list.length; i++) {
        list[i].rotation.z += delta * 0.4;
    }
}
