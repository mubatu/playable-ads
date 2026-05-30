import { Mesh, SphereGeometry, MeshBasicMaterial } from 'three';

export function checkCollisions(state) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    var sharkRadius = state.config.shark.size * (0.55 + state.sharkTier * 0.04);
    var multiplier = state.isGoldRush ? state.config.scoring.goldRushMultiplier : 1;

    eatFromList(state, state.smallFish, sharkRadius, multiplier);
    eatFromList(state, state.mediumFish, sharkRadius, multiplier);
    eatFromList(state, state.humans, sharkRadius, multiplier);
    collectCoins(state, sharkRadius, multiplier);

    if (state.isGoldRush) {
        eatEnemySharks(state, sharkRadius, multiplier);
    } else {
        checkHazards(state, sharkRadius);
    }
}

export function updateParticles(state, delta) {
    var i;

    for (i = state.particles.length - 1; i >= 0; i -= 1) {
        var particle = state.particles[i];
        particle.userData.life -= delta;

        if (particle.userData.life <= 0) {
            state.worldGroup.remove(particle);
            state.particles.splice(i, 1);
            continue;
        }

        particle.position.x += particle.userData.vx * delta;
        particle.position.y += particle.userData.vy * delta;
        particle.userData.vx *= 0.95;
        particle.userData.vy *= 0.95;
        particle.material.opacity = Math.max(0, particle.userData.life / 0.7);
        particle.scale.setScalar(particle.userData.life / 0.7);
    }
}

function eatFromList(state, list, sharkRadius, multiplier) {
    var i;

    for (i = list.length - 1; i >= 0; i -= 1) {
        var entity = list[i];
        if (distanceToShark(state, entity) < sharkRadius + entity.userData.radius * 0.7) {
            state.score += entity.userData.scoreValue * multiplier;
            state.hunger = Math.min(state.config.hunger.max, state.hunger + entity.userData.hungerValue);
            state.health = Math.min(state.config.health.max, state.health + entity.userData.healValue);
            state.goldRushMeter += entity.userData.scoreValue;
            state.sharkTier = Math.min(6, 1 + Math.floor(state.score / 250));

            spawnParticleBurst(state, entity.position.x, entity.position.y, '#ffffff', 5, 0.08);
            removeEntity(state, list, i);
        }
    }
}

function collectCoins(state, sharkRadius, multiplier) {
    var i;

    for (i = state.coinItems.length - 1; i >= 0; i -= 1) {
        var coin = state.coinItems[i];
        if (distanceToShark(state, coin) < sharkRadius + coin.userData.radius) {
            state.coins += 1;
            state.score += state.config.scoring.coin * multiplier;
            spawnParticleBurst(state, coin.position.x, coin.position.y, '#ffd700', 6, 0.06);
            removeEntity(state, state.coinItems, i);
        }
    }
}

function eatEnemySharks(state, sharkRadius, multiplier) {
    var i;

    for (i = state.enemySharks.length - 1; i >= 0; i -= 1) {
        var enemy = state.enemySharks[i];
        if (distanceToShark(state, enemy) < sharkRadius + enemy.userData.radius) {
            state.score += 75 * multiplier;
            state.hunger = Math.min(state.config.hunger.max, state.hunger + 35);
            state.goldRushMeter += 50;
            spawnParticleBurst(state, enemy.position.x, enemy.position.y, '#ffd700', 10, 0.09);
            removeEntity(state, state.enemySharks, i);
        }
    }
}

function checkHazards(state, sharkRadius) {
    collideDamageList(state, state.mines, sharkRadius, state.config.health.mineDamage, '#ff4400', 10);
    collideDamageList(state, state.jellyfish, sharkRadius, state.config.health.jellyfishDamage, '#66d9e8', 6);
    collideDamageList(state, state.enemySharks, sharkRadius, state.config.health.enemySharkDamage, '#ff3355', 8);
}

function collideDamageList(state, list, sharkRadius, damage, color, particleCount) {
    var i;

    for (i = list.length - 1; i >= 0; i -= 1) {
        var entity = list[i];
        if (distanceToShark(state, entity) < sharkRadius + entity.userData.radius * 0.7) {
            state.health -= damage;
            state.shakeTime = state.config.camera.shakeDuration;
            spawnParticleBurst(state, entity.position.x, entity.position.y, color, particleCount, 0.1);
            removeEntity(state, list, i);
        }
    }
}

function removeEntity(state, list, index) {
    state.worldGroup.remove(list[index]);
    list.splice(index, 1);
}

function distanceToShark(state, entity) {
    var dx = entity.position.x - state.sharkX;
    var dy = entity.position.y - state.sharkY;
    return Math.sqrt(dx * dx + dy * dy);
}

function spawnParticleBurst(state, x, y, color, count, size) {
    var i;

    for (i = 0; i < count; i += 1) {
        var particle = new Mesh(
            new SphereGeometry(size, 5, 4),
            new MeshBasicMaterial({ color: color, transparent: true, opacity: 1 })
        );
        var angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        var speed = 2 + Math.random() * 3;

        particle.position.set(x, y, 0.6);
        particle.userData.vx = Math.cos(angle) * speed;
        particle.userData.vy = Math.sin(angle) * speed;
        particle.userData.life = 0.4 + Math.random() * 0.3;
        state.worldGroup.add(particle);
        state.particles.push(particle);
    }
}
