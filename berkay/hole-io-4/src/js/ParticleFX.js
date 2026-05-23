import * as THREE from 'three';
import { ObjectPool } from '../../../../reusables/components/ObjectPool.js';

var sharedGeometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);

function createParticle() {
    var mesh = new THREE.Mesh(
        sharedGeometry,
        new THREE.MeshBasicMaterial({ color: '#ffffff' })
    );
    mesh.visible = false;
    mesh.userData = { velocity: new THREE.Vector3(), life: 0, maxLife: 0.5 };
    return mesh;
}

function resetParticle(mesh) {
    mesh.visible = false;
    mesh.position.set(0, -999, 0);
    mesh.userData.life = 0;
}

export function createParticleSystem(scene) {
    var pool = new ObjectPool(createParticle, resetParticle, 60);
    var active = new Set();

    return {
        pool: pool,
        active: active,
        scene: scene
    };
}

export function burst(system, position, color) {
    var i;
    var count = 8;
    for (i = 0; i < count; i += 1) {
        var p = system.pool.get();
        p.material.color.set(color || '#ffd27f');
        p.position.copy(position);
        p.position.y += 0.3;
        p.visible = true;
        p.userData.life = 0;
        p.userData.maxLife = 0.4 + Math.random() * 0.2;
        p.userData.velocity.set(
            (Math.random() - 0.5) * 3,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 3
        );
        if (!p.parent) {
            system.scene.add(p);
        }
        system.active.add(p);
    }
}

export function updateParticles(system, delta) {
    system.active.forEach(function (p) {
        var data = p.userData;
        data.life += delta;
        if (data.life >= data.maxLife) {
            system.pool.release(p);
            system.active.delete(p);
            return;
        }
        data.velocity.y -= 9 * delta;
        p.position.addScaledVector(data.velocity, delta);
        var t = 1 - data.life / data.maxLife;
        p.material.opacity = t;
        p.material.transparent = true;
        p.scale.setScalar(t);
    });
}

export function clearParticles(system) {
    system.active.forEach(function (p) {
        system.pool.release(p);
    });
    system.active.clear();
}
