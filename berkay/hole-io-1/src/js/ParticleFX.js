import * as THREE from 'three';

var PARTICLE_COUNT = 30;
var PARTICLE_LIFETIME = 0.6;

function createParticle() {
    var geo = new THREE.SphereGeometry(0.06, 4, 4);
    var mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    mesh.userData.velocity = new THREE.Vector3();
    mesh.userData.life = 0;
    mesh.userData.maxLife = PARTICLE_LIFETIME;
    return mesh;
}

export function createParticlePool(scene) {
    var pool = [];
    var i, p;
    for (i = 0; i < PARTICLE_COUNT; i += 1) {
        p = createParticle();
        scene.add(p);
        pool.push(p);
    }
    return pool;
}

export function emitParticles(pool, position, color, count) {
    var spawned = 0;
    var i, p, angle, speed;
    for (i = 0; i < pool.length && spawned < (count || 6); i += 1) {
        p = pool[i];
        if (p.visible) {
            continue;
        }
        angle = Math.random() * Math.PI * 2;
        speed = 1.5 + Math.random() * 3;
        p.position.set(
            position.x + (Math.random() - 0.5) * 0.3,
            position.y + 0.2 + Math.random() * 0.3,
            position.z + (Math.random() - 0.5) * 0.3
        );
        p.userData.velocity.set(
            Math.cos(angle) * speed,
            2 + Math.random() * 3,
            Math.sin(angle) * speed
        );
        p.userData.life = 0;
        p.userData.maxLife = PARTICLE_LIFETIME + Math.random() * 0.3;
        p.material.color.set(color || 0xFFFFFF);
        p.material.opacity = 1;
        p.visible = true;
        p.scale.set(1, 1, 1);
        spawned += 1;
    }
}

export function updateParticles(pool, delta) {
    var i, p, t;
    for (i = 0; i < pool.length; i += 1) {
        p = pool[i];
        if (!p.visible) {
            continue;
        }
        p.userData.life += delta;
        t = p.userData.life / p.userData.maxLife;
        if (t >= 1) {
            p.visible = false;
            continue;
        }
        p.userData.velocity.y -= 9.8 * delta;
        p.position.x += p.userData.velocity.x * delta;
        p.position.y += p.userData.velocity.y * delta;
        p.position.z += p.userData.velocity.z * delta;
        if (p.position.y < 0) {
            p.position.y = 0;
            p.userData.velocity.y *= -0.3;
        }
        p.material.opacity = 1 - t;
        var s = 1 - t * 0.5;
        p.scale.set(s, s, s);
    }
}
