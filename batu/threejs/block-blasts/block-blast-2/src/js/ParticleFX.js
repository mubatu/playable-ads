import * as THREE from 'three';
import { ObjectPool } from '../../../../../../reusables/components/ObjectPool.js';
import { getCellWorldPosition } from './Board.js';

var BURST_COLORS = ['#ffffff', '#ffe18f', '#ff7e8b', '#6affb6', '#7c6cff', '#3ec3ff'];

export function createParticlePool() {
    var particleGeometry = new THREE.PlaneGeometry(0.2, 0.2);

    return new ObjectPool(
        function () {
            var particle = new THREE.Mesh(
                particleGeometry,
                new THREE.MeshBasicMaterial({
                    color: '#ffffff',
                    transparent: true,
                    opacity: 0,
                    depthWrite: false
                })
            );

            particle.visible = false;
            particle.userData.velocity = new THREE.Vector3();
            particle.userData.life = 0;
            particle.userData.maxLife = 0;
            particle.userData.baseScale = 1;
            particle.update = null;
            return particle;
        },
        function (particle) {
            particle.visible = false;
            particle.material.opacity = 0;
            particle.userData.velocity.set(0, 0, 0);
            particle.userData.life = 0;
            particle.userData.maxLife = 0;
            particle.userData.baseScale = 1;
            particle.update = null;
        },
        48
    );
}

export function releaseParticle(state, particle) {
    if (state.activeParticles.has(particle)) {
        state.activeParticles.delete(particle);
    }

    state.sceneManager.removeObject(particle);
    state.particlePool.release(particle);
}

export function clearParticles(state) {
    Array.from(state.activeParticles).forEach(function (particle) {
        releaseParticle(state, particle);
    });
}

function spawnBurst(state, worldPos, particleCount, baseColor) {
    var pi;

    for (pi = 0; pi < particleCount; pi += 1) {
        var particle = state.particlePool.get();
        var angle = Math.random() * Math.PI * 2;
        var speed = 1.4 + (Math.random() * 2.0);
        var maxLife = 0.25 + (Math.random() * 0.3);
        var baseScale = 0.45 + (Math.random() * 0.55);
        var color = baseColor && Math.random() < 0.55
            ? baseColor
            : BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];

        particle.position.copy(worldPos);
        particle.position.x += (Math.random() - 0.5) * 0.18;
        particle.position.y += (Math.random() - 0.5) * 0.18;
        particle.position.z = 0.6;
        particle.visible = true;
        particle.material.color.set(color);
        particle.material.opacity = 0.95;
        particle.userData.velocity.set(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed + 0.5,
            0
        );
        particle.userData.life = maxLife;
        particle.userData.maxLife = maxLife;
        particle.userData.baseScale = baseScale;
        particle.scale.setScalar(baseScale);

        (function (p) {
            p.update = function (delta) {
                p.userData.life -= delta;

                if (p.userData.life <= 0) {
                    releaseParticle(state, p);
                    return;
                }

                var progress = 1 - (p.userData.life / p.userData.maxLife);

                p.userData.velocity.y -= 4.5 * delta;
                p.position.addScaledVector(p.userData.velocity, delta);
                p.material.opacity = (1 - progress) * 0.95;
                p.scale.setScalar(p.userData.baseScale * (1 + (progress * 1.1)));
            };
        })(particle);

        state.activeParticles.add(particle);
        state.sceneManager.addObject(particle);
    }
}

export function emitClearParticles(state, clearedPositions, baseColor) {
    var index;
    var pos;
    var centerWorld;

    if (!state.fxEnabled) {
        return;
    }

    for (index = 0; index < clearedPositions.length; index += 1) {
        pos = clearedPositions[index];
        centerWorld = getCellWorldPosition(state.board, state.boardMetrics, pos.row, pos.col, 0.6);
        spawnBurst(state, centerWorld, 4, baseColor);
    }
}

export function emitPlaceTap(state, row, col, color) {
    var centerWorld;

    if (!state.fxEnabled) {
        return;
    }

    centerWorld = getCellWorldPosition(state.board, state.boardMetrics, row, col, 0.6);
    spawnBurst(state, centerWorld, 3, color);
}

export function startScreenShake(state, intensity, duration) {
    state.shake.time = duration || 0.3;
    state.shake.intensity = intensity || 0.18;
}
