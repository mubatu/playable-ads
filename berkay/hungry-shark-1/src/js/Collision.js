import { Mesh, SphereGeometry, MeshBasicMaterial } from 'three';

export function checkCollisions(state) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    var sx = state.sharkX;
    var sy = state.sharkY;
    var sharkRadius = state.config.shark.size * 0.55;
    var config = state.config;
    var multiplier = state.isGoldRush ? config.scoring.goldRushMultiplier : 1;

    eatFromList(state, state.smallFish, sx, sy, sharkRadius, multiplier);
    eatFromList(state, state.mediumFish, sx, sy, sharkRadius, multiplier);
    collectCoins(state, sx, sy, sharkRadius, multiplier);

    if (!state.isGoldRush) {
        checkHazards(state, sx, sy, sharkRadius);
    }
}

function eatFromList(state, list, sx, sy, sharkRadius, multiplier) {
    for (var i = list.length - 1; i >= 0; i--) {
        var entity = list[i];
        var dx = entity.position.x - sx;
        var dy = entity.position.y - sy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var combinedRadius = sharkRadius + entity.userData.radius * 0.7;

        if (dist < combinedRadius) {
            state.score += entity.userData.scoreValue * multiplier;
            state.hunger = Math.min(state.config.hunger.max, state.hunger + entity.userData.hungerValue);
            state.health = Math.min(state.config.health.max, state.health + entity.userData.healValue);
            state.goldRushMeter += entity.userData.scoreValue;

            spawnEatParticles(state, entity.position.x, entity.position.y);

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

            spawnCoinParticles(state, coin.position.x, coin.position.y);

            state.worldGroup.remove(coin);
            state.coinItems.splice(i, 1);
        }
    }
}

function checkHazards(state, sx, sy, sharkRadius) {
    for (var i = 0; i < state.mines.length; i++) {
        var mine = state.mines[i];
        var dx = mine.position.x - sx;
        var dy = mine.position.y - sy;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < sharkRadius + mine.userData.radius * 0.65) {
            state.health -= state.config.health.mineDamage;
            state.shakeTime = state.config.camera.shakeDuration;

            spawnExplosionParticles(state, mine.position.x, mine.position.y);

            state.worldGroup.remove(mine);
            state.mines.splice(i, 1);
            i--;
        }
    }

    for (var j = 0; j < state.jellyfish.length; j++) {
        var jelly = state.jellyfish[j];
        var jdx = jelly.position.x - sx;
        var jdy = jelly.position.y - sy;
        var jdist = Math.sqrt(jdx * jdx + jdy * jdy);

        if (jdist < sharkRadius + jelly.userData.radius * 0.6) {
            state.health -= state.config.health.jellyfishDamage;
            state.shakeTime = state.config.camera.shakeDuration * 0.5;

            state.worldGroup.remove(jelly);
            state.jellyfish.splice(j, 1);
            j--;
        }
    }
}

function spawnEatParticles(state, x, y) {
    spawnParticleBurst(state, x, y, '#ffffff', 5, 0.08);
}

function spawnCoinParticles(state, x, y) {
    spawnParticleBurst(state, x, y, '#ffd700', 6, 0.06);
}

function spawnExplosionParticles(state, x, y) {
    spawnParticleBurst(state, x, y, '#ff4400', 10, 0.12);
    spawnParticleBurst(state, x, y, '#ffaa00', 6, 0.08);
}

function spawnParticleBurst(state, x, y, color, count, size) {
    for (var i = 0; i < count; i++) {
        var particle = new Mesh(
            new SphereGeometry(size, 5, 4),
            new MeshBasicMaterial({ color: color, transparent: true, opacity: 1 })
        );
        particle.position.set(x, y, 0.6);
        var angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        var speed = 2 + Math.random() * 3;
        particle.userData.vx = Math.cos(angle) * speed;
        particle.userData.vy = Math.sin(angle) * speed;
        particle.userData.life = 0.4 + Math.random() * 0.3;
        state.worldGroup.add(particle);

        if (!state._particles) {
            state._particles = [];
        }
        state._particles.push(particle);
    }
}

export function updateParticles(state, delta) {
    if (!state._particles) {
        return;
    }

    for (var i = state._particles.length - 1; i >= 0; i--) {
        var p = state._particles[i];
        p.userData.life -= delta;
        if (p.userData.life <= 0) {
            state.worldGroup.remove(p);
            state._particles.splice(i, 1);
            continue;
        }
        p.position.x += p.userData.vx * delta;
        p.position.y += p.userData.vy * delta;
        p.userData.vx *= 0.95;
        p.userData.vy *= 0.95;
        p.material.opacity = Math.max(0, p.userData.life / 0.7);
        p.scale.setScalar(p.userData.life / 0.7);
    }
}
