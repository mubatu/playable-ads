import * as THREE from 'three';

var PARTICLE_COLORS = [0xffdd44, 0xff8800, 0xff4444, 0x44ffaa, 0x88ccff];

function createParticle() {
    var geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    var mat = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    mesh.userData = {
        life: 0,
        maxLife: 0.6,
        velocity: new THREE.Vector3()
    };
    return mesh;
}

var particlePool = [];
var POOL_SIZE = 80;

for (var pi = 0; pi < POOL_SIZE; pi++) {
    particlePool.push(createParticle());
}

function getParticle() {
    for (var i = 0; i < particlePool.length; i++) {
        if (!particlePool[i].visible) return particlePool[i];
    }
    return null;
}

export function spawnConsumptionParticles(state, position, count) {
    count = count || 8;
    for (var i = 0; i < count; i++) {
        var p = getParticle();
        if (!p) continue;

        p.visible = true;
        p.position.set(position.x, 0.5, position.z);
        var color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        p.material.color.setHex(color);
        p.material.opacity = 1;

        var angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        var speed = 2 + Math.random() * 3;
        p.userData.velocity.set(
            Math.cos(angle) * speed,
            1.5 + Math.random() * 2,
            Math.sin(angle) * speed
        );
        p.userData.life = 0;
        p.userData.maxLife = 0.4 + Math.random() * 0.3;
        p.scale.set(1, 1, 1);

        state.particlesLayer.add(p);
        state.activeParticles.add(p);
    }
}

export function updateParticles(state, delta) {
    state.activeParticles.forEach(function (p) {
        p.userData.life += delta;
        var progress = p.userData.life / p.userData.maxLife;

        if (progress >= 1) {
            p.visible = false;
            state.particlesLayer.remove(p);
            state.activeParticles.delete(p);
            return;
        }

        p.position.addScaledVector(p.userData.velocity, delta);
        p.userData.velocity.y -= 8 * delta; // gravity
        p.userData.velocity.multiplyScalar(0.97);

        var s = 1 - progress * 0.8;
        p.scale.set(s, s, s);
        p.material.opacity = 1 - progress;
    });
}
