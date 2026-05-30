import { Mesh, SphereGeometry, MeshBasicMaterial } from 'three';

export function checkCollisions(state) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    var sx = state.sharkX;
    var sy = state.sharkY;
    var sharkRadius = state.config.shark.size * 0.6;
    var multiplier = state.isGoldRush ? state.config.scoring.goldRushMultiplier : 1;

    eatList(state, state.smallFish, sx, sy, sharkRadius, multiplier);
    eatList(state, state.mediumFish, sx, sy, sharkRadius, multiplier);
    eatList(state, state.humans, sx, sy, sharkRadius, multiplier);
    eatList(state, state.creatures, sx, sy, sharkRadius, multiplier);
    collectCoins(state, sx, sy, sharkRadius, multiplier);

    if (!state.isGoldRush) {
        checkHazards(state, sx, sy, sharkRadius);
    }
}

function eatList(state, list, sx, sy, sharkRadius, multiplier) {
    for (var i = list.length - 1; i >= 0; i--) {
        var entity = list[i];
        var dx = entity.position.x - sx;
        var dy = entity.position.y - sy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var combined = sharkRadius + entity.userData.radius * 0.65;

        if (dist < combined) {
            state.score += entity.userData.scoreValue * multiplier;
            state.hunger = Math.min(state.config.hunger.max, state.hunger + entity.userData.hungerValue);
            state.health = Math.min(state.config.health.max, state.health + entity.userData.healValue);
            state.goldRushMeter += entity.userData.scoreValue;

            burstParticles(state, entity.position.x, entity.position.y, '#ffffff', 6, 0.07);
            if (entity.userData.type === 'human') {
                burstParticles(state, entity.position.x, entity.position.y, '#e74c3c', 4, 0.05);
            }

            state.worldGroup.remove(entity);
            list.splice(i, 1);
        }
    }
}

function collectCoins(state, sx, sy, sharkRadius, multiplier) {
    for (var i = state.coinItems.length - 1; i >= 0; i--) {
        var coin = state.coinItems[i];
        var dx = coin.position.x - sx;
        var dy = coin.position.y - sy;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < sharkRadius + coin.userData.radius) {
            state.coins += 1;
            state.score += state.config.scoring.coin * multiplier;
            burstParticles(state, coin.position.x, coin.position.y, '#ffd700', 5, 0.055);
            state.worldGroup.remove(coin);
            state.coinItems.splice(i, 1);
        }
    }
}

function checkHazards(state, sx, sy, sharkRadius) {
    for (var i = state.mines.length - 1; i >= 0; i--) {
        var mine = state.mines[i];
        var dx = mine.position.x - sx;
        var dy = mine.position.y - sy;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < sharkRadius + mine.userData.radius * 0.65) {
            state.health = Math.max(0, state.health - state.config.health.mineDamage);
            state.shakeTime = state.config.camera.shakeDuration;
            burstParticles(state, mine.position.x, mine.position.y, '#ff4400', 10, 0.11);
            burstParticles(state, mine.position.x, mine.position.y, '#ffaa00', 6, 0.07);
            state.worldGroup.remove(mine);
            state.mines.splice(i, 1);
        }
    }

    for (var j = state.jellyfish.length - 1; j >= 0; j--) {
        var jelly = state.jellyfish[j];
        var jdx = jelly.position.x - sx;
        var jdy = jelly.position.y - sy;
        var jdist = Math.sqrt(jdx * jdx + jdy * jdy);

        if (jdist < sharkRadius + jelly.userData.radius * 0.7) {
            state.health = Math.max(0, state.health - state.config.health.jellyfishDamage);
            state.shakeTime = state.config.camera.shakeDuration * 0.5;
            burstParticles(state, jelly.position.x, jelly.position.y, '#9b59b6', 5, 0.06);
            state.worldGroup.remove(jelly);
            state.jellyfish.splice(j, 1);
        }
    }
}

function burstParticles(state, x, y, color, count, size) {
    for (var i = 0; i < count; i++) {
        var p = new Mesh(
            new SphereGeometry(size, 4, 3),
            new MeshBasicMaterial({ color: color, transparent: true, opacity: 1.0 })
        );
        p.position.set(x, y, 0.8);
        var angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        var speed = 2.5 + Math.random() * 3.5;
        p.userData.vx = Math.cos(angle) * speed;
        p.userData.vy = Math.sin(angle) * speed;
        p.userData.life = 0.35 + Math.random() * 0.3;
        state.worldGroup.add(p);
        state._particles.push(p);
    }
}

export function updateParticles(state, delta) {
    for (var i = state._particles.length - 1; i >= 0; i--) {
        var p = state._particles[i];
        p.userData.life -= delta;
        if (p.userData.life <= 0) {
            state.worldGroup.remove(p);
            p.geometry.dispose();
            p.material.dispose();
            state._particles.splice(i, 1);
            continue;
        }
        p.position.x += p.userData.vx * delta;
        p.position.y += p.userData.vy * delta;
        p.userData.vx *= 0.92;
        p.userData.vy *= 0.92;
        var lifeRatio = p.userData.life / 0.65;
        p.material.opacity = Math.max(0, lifeRatio);
        p.scale.setScalar(Math.max(0.01, lifeRatio));
    }
}
