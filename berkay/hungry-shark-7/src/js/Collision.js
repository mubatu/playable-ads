import { Mesh, PlaneGeometry, MeshBasicMaterial, AdditiveBlending } from 'three';
import { recycleEntity } from './Spawner.js';
import { addScore } from './Hud.js';
import { addGoldRushCharge } from './GoldRush.js';

function sharkEatTier(state) {
    var cfg = state.config.shark;
    var grown = state.shark.size - cfg.baseSize;
    return 2 + Math.floor(grown / 0.7);
}

function triggerShake(state, intensity, duration) {
    state.shakeIntensity = intensity;
    state.shakeTime = duration;
}

function spawnParticles(state, x, y, texture, count, color) {
    var i;
    for (i = 0; i < count; i += 1) {
        var p = acquireParticle(state, texture);
        p.material.color.set(color || '#ffffff');
        p.mesh.position.set(x, y, 2);
        var angle = Math.random() * Math.PI * 2;
        var speed = 1.5 + Math.random() * 3.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.life = 0;
        p.maxLife = 0.4 + Math.random() * 0.4;
        var s = 0.25 + Math.random() * 0.35;
        p.mesh.scale.set(s, s, 1);
        p.mesh.visible = true;
        p.active = true;
    }
}

function acquireParticle(state, texture) {
    var i;
    for (i = 0; i < state.particles.length; i += 1) {
        if (!state.particles[i].active) {
            state.particles[i].material.map = texture;
            state.particles[i].material.needsUpdate = true;
            return state.particles[i];
        }
    }
    var geo = new PlaneGeometry(1, 1);
    var mat = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, blending: AdditiveBlending });
    var mesh = new Mesh(geo, mat);
    mesh.visible = false;
    state.particleGroup.add(mesh);
    var particle = { mesh: mesh, material: mat, vx: 0, vy: 0, life: 0, maxLife: 1, active: false };
    state.particles.push(particle);
    return particle;
}

export function updateParticles(state, delta) {
    var i;
    for (i = 0; i < state.particles.length; i += 1) {
        var p = state.particles[i];
        if (!p.active) { continue; }
        p.life += delta;
        if (p.life >= p.maxLife) {
            p.active = false;
            p.mesh.visible = false;
            continue;
        }
        p.mesh.position.x += p.vx * delta;
        p.mesh.position.y += p.vy * delta;
        p.vy -= 2.5 * delta;
        p.material.opacity = 1 - (p.life / p.maxLife);
    }
}

export function checkCollisions(state) {
    if (!state.gameStarted || state.gameOver) { return; }

    var shark = state.shark;
    var eatRadius = shark.size * 0.46;
    var eatTier = sharkEatTier(state);
    var i;

    for (i = 0; i < state.entities.length; i += 1) {
        var e = state.entities[i];
        if (!e.alive) { continue; }

        var dx = e.x - shark.x;
        var dy = e.y - shark.y;
        var rr = eatRadius + e.radius;
        if (dx * dx + dy * dy > rr * rr) { continue; }

        if (e.hazard && !state.goldRushActive) {
            handleHazard(state, e);
        } else {
            handleEat(state, e, eatTier);
        }
    }
}

function handleEat(state, e, eatTier) {
    // big prey that the shark is not large enough for yet just bumps away
    if (e.edible && e.tier > eatTier) {
        return;
    }

    var mult = state.goldRushActive ? state.config.goldRush.scoreMultiplier : 1;
    var points = (e.score || 0) * mult;
    if (points > 0) {
        addScore(state, points);
    }

    if (e.type === 'coin') {
        spawnParticles(state, e.x, e.y, state.textures.goldParticle, 8, '#ffd24a');
    } else {
        state.hunger = Math.min(state.config.hunger.max, state.hunger + e.hunger);
        state.health = Math.min(state.config.health.max, state.health + state.config.health.regenPerBite);
        spawnParticles(state, e.x, e.y, state.textures.bloodParticle, 7, '#ff5a4a');
        state.eatenCount += 1;
        addGoldRushCharge(state, 1);
        triggerShake(state, 0.12, 0.12);
    }

    e.alive = false;
    e.mesh.visible = false;
    recycleEntity(state, e);
}

function handleHazard(state, e) {
    var dmg = e.type === 'mine'
        ? state.config.health.mineDamage
        : state.config.health.jellyfishDamage;

    state.health = Math.max(0, state.health - dmg);
    spawnParticles(state, e.x, e.y, state.textures.bloodParticle, 12, '#ff3a2a');
    triggerShake(state, e.type === 'mine' ? 0.5 : 0.25, 0.35);

    e.alive = false;
    e.mesh.visible = false;
    recycleEntity(state, e);

    if (state.health <= 0) {
        state.gameOver = true;
    }
}
