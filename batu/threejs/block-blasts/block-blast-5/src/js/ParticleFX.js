import * as THREE from 'three';
import { ObjectPool } from '../../../../reusables/components/ObjectPool.js';
import { getCellWorldPosition } from './Board.js';

var BLAST_PARTICLE_COLORS = ['#ffffff', '#ffed4a', '#ff9f43', '#ee5253'];

export function createParticlePool() {
    var particleGeometry = new THREE.PlaneGeometry(0.3, 0.3);

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
        50
    );
}

export function releaseParticle(state, particle) {
    if (state.activeParticles && state.activeParticles.has(particle)) {
        state.activeParticles.delete(particle);
    }

    if (state.sceneManager) {
        state.sceneManager.removeObject(particle);
    }
    
    if (state.particlePool) {
        state.particlePool.release(particle);
    }
}

export function clearParticles(state) {
    if (!state.activeParticles) return;
    Array.from(state.activeParticles).forEach(function (particle) {
        releaseParticle(state, particle);
    });
}

export function emitLineClearParticles(state, rows, columns) {
    var particleCount = 5;

    if (!state.fxEnabled || !state.particlePool) {
        return;
    }
    
    if (!state.activeParticles) {
        state.activeParticles = new Set();
    }

    function spawnAt(r, c) {
        var centerWorld = getCellWorldPosition(state.board, state.boardMetrics, r, c, 0.6);
        
        for (var index = 0; index < particleCount; index += 1) {
            var activeParticle = state.particlePool.get();
            var angle = (Math.PI * 2 * index) / particleCount + (Math.random() * 0.35);
            var speed = 2.0 + (Math.random() * 1.5); // Faster speed for blast
            var maxLife = 0.3 + (Math.random() * 0.2);
            var baseScale = 0.5 + (Math.random() * 0.5);
            var colorIndex = Math.floor(Math.random() * BLAST_PARTICLE_COLORS.length);

            activeParticle.position.copy(centerWorld);
            activeParticle.position.x += (Math.random() - 0.5) * 0.2;
            activeParticle.position.y += (Math.random() - 0.5) * 0.2;
            activeParticle.position.z = 0.6;
            activeParticle.visible = true;
            activeParticle.material.color.set(BLAST_PARTICLE_COLORS[colorIndex]);
            activeParticle.material.opacity = 0.88;
            activeParticle.userData.velocity.set(Math.cos(angle) * speed, Math.sin(angle) * speed, 0);
            activeParticle.userData.life = maxLife;
            activeParticle.userData.maxLife = maxLife;
            activeParticle.userData.baseScale = baseScale;
            activeParticle.scale.setScalar(baseScale);

            (function (p) {
                p.update = function (delta) {
                    var progress;

                    p.userData.life -= delta;

                    if (p.userData.life <= 0) {
                        releaseParticle(state, p);
                        return;
                    }

                    progress = 1 - (p.userData.life / p.userData.maxLife);
                    p.position.addScaledVector(p.userData.velocity, delta);
                    p.material.opacity = (1 - progress) * 0.88;
                    p.scale.setScalar(p.userData.baseScale * (1 + (progress * 0.9)));
                };
            })(activeParticle);

            state.activeParticles.add(activeParticle);
            state.sceneManager.addObject(activeParticle);
        }
    }
    
    if (rows) {
        for (var i = 0; i < rows.length; i++) {
            for (var c = 0; c < state.config.board.columns; c++) {
                spawnAt(rows[i], c);
            }
        }
    }
    
    if (columns) {
        for (var j = 0; j < columns.length; j++) {
            for (var r = 0; r < state.config.board.rows; r++) {
                // Avoid double spawning if cell is in both cleared row and column
                if (!rows || rows.indexOf(r) === -1) {
                    spawnAt(r, columns[j]);
                }
            }
        }
    }
}
