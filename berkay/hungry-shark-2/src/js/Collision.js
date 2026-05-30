import { Mesh, CircleGeometry, MeshBasicMaterial, Color } from 'three';
import { addGoldRushProgress } from './GoldRush.js';

function spawnBurst(state, x, y, color, count) {
    for (var i = 0; i < count; i++) {
        var p = new Mesh(
            new CircleGeometry(0.08 + Math.random() * 0.06, 8),
            new MeshBasicMaterial({ color: new Color(color), transparent: true, opacity: 1 })
        );
        p.position.set(x, y, 0.2);
        var ang = Math.random() * Math.PI * 2;
        var spd = 1.5 + Math.random() * 2.5;
        p.userData = {
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 0.6
        };
        state.worldGroup.add(p);
        state.particles.push(p);
    }
}

function removeEntity(state, entity, index) {
    state.worldGroup.remove(entity);
    state.entities.splice(index, 1);
}

export function updateParticles(state, delta) {
    for (var i = state.particles.length - 1; i >= 0; i--) {
        var p = state.particles[i];
        p.userData.life -= delta;
        if (p.userData.life <= 0) {
            state.worldGroup.remove(p);
            state.particles.splice(i, 1);
            continue;
        }
        p.position.x += p.userData.vx * delta;
        p.position.y += p.userData.vy * delta;
        p.userData.vy -= 2 * delta;
        p.material.opacity = Math.max(0, p.userData.life / 0.6);
    }
}

export function checkCollisions(state) {
    if (!state.sharkGroup || state.gameOver || !state.gameStarted) return;
    var sx = state.sharkX, sy = state.sharkY;
    var sharkR = state.config.shark.size * 0.9;
    var cfg = state.config;
    var mult = state.isGoldRush ? cfg.scoring.goldRushMultiplier : 1;

    for (var i = state.entities.length - 1; i >= 0; i--) {
        var e = state.entities[i];
        var u = e.userData;
        var dx = e.position.x - sx;
        var dy = e.position.y - sy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > sharkR + u.radius) continue;

        if (u.type === 'smallFish') {
            state.score += cfg.scoring.smallFish * mult;
            state.hunger = Math.min(cfg.hunger.max, state.hunger + cfg.hunger.eatGainSmall);
            state.health = Math.min(cfg.health.max, state.health + cfg.health.eatHealSmall);
            state.eatenCount++;
            addGoldRushProgress(state, 12);
            spawnBurst(state, e.position.x, e.position.y, u.baseColor || '#ffd24a', 6);
            removeEntity(state, e, i);
        } else if (u.type === 'mediumFish') {
            state.score += cfg.scoring.mediumFish * mult;
            state.hunger = Math.min(cfg.hunger.max, state.hunger + cfg.hunger.eatGainMedium);
            state.health = Math.min(cfg.health.max, state.health + cfg.health.eatHealMedium);
            state.eatenCount++;
            addGoldRushProgress(state, 25);
            spawnBurst(state, e.position.x, e.position.y, u.baseColor || '#5fb3d4', 10);
            state.shakeTime = cfg.camera.shakeDuration * 0.5;
            removeEntity(state, e, i);
        } else if (u.type === 'coin') {
            state.coins++;
            state.score += cfg.scoring.coin * mult;
            spawnBurst(state, e.position.x, e.position.y, '#ffd24a', 6);
            removeEntity(state, e, i);
        } else if (u.type === 'mine') {
            if (state.isGoldRush) {
                spawnBurst(state, e.position.x, e.position.y, '#ffae00', 14);
                state.shakeTime = cfg.camera.shakeDuration;
                removeEntity(state, e, i);
            } else {
                state.health -= cfg.health.mineDamage;
                state.shakeTime = cfg.camera.shakeDuration;
                spawnBurst(state, e.position.x, e.position.y, '#ff5544', 14);
                removeEntity(state, e, i);
                if (state.health <= 0) { state.health = 0; state.gameOver = true; }
            }
        } else if (u.type === 'jellyfish') {
            if (state.isGoldRush) {
                spawnBurst(state, e.position.x, e.position.y, '#e07ad6', 10);
                removeEntity(state, e, i);
            } else {
                state.health -= cfg.health.jellyfishDamage;
                state.shakeTime = cfg.camera.shakeDuration * 0.6;
                spawnBurst(state, e.position.x, e.position.y, '#e07ad6', 8);
                removeEntity(state, e, i);
                if (state.health <= 0) { state.health = 0; state.gameOver = true; }
            }
        }
    }
}
