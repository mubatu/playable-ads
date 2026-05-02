import * as THREE from 'three';
import { ObjectPool } from '../../../../reusables/components/ObjectPool.js';
import { getCellWorldPosition } from './Board.js';
import { refreshScore } from './Hud.js';

var PARTICLE_COLORS = [
    '#ffffff', '#ffe18f', '#ffad6d', '#ff8f6a',
    '#a0f0ff', '#aaffcc', '#ffccff'
];

export function createParticlePool() {
    var geo = new THREE.PlaneGeometry(0.18, 0.18);

    return new ObjectPool(
        function () {
            var p = new THREE.Mesh(
                geo,
                new THREE.MeshBasicMaterial({
                    color: '#ffffff',
                    transparent: true,
                    opacity: 0,
                    depthWrite: false
                })
            );

            p.visible = false;
            p.userData.velocity = new THREE.Vector3();
            p.userData.life = 0;
            p.userData.maxLife = 0;
            p.update = null;
            return p;
        },
        function (p) {
            p.visible = false;
            p.material.opacity = 0;
            p.userData.velocity.set(0, 0, 0);
            p.userData.life = 0;
            p.userData.maxLife = 0;
            p.update = null;
        },
        32
    );
}

function releaseParticle(state, particle) {
    if (state.activeParticles.has(particle)) {
        state.activeParticles.delete(particle);
    }

    state.sceneManager.removeObject(particle);
    state.particlePool.release(particle);
}

export function clearParticles(state) {
    Array.from(state.activeParticles).forEach(function (p) {
        releaseParticle(state, p);
    });
}

function emitBurstAt(state, worldPos, count) {
    var i;
    var p;
    var angle;
    var speed;
    var maxLife;
    var colorHex;

    for (i = 0; i < count; i += 1) {
        p = state.particlePool.get();
        angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6);
        speed = 1.2 + (Math.random() * 1.4);
        maxLife = 0.22 + (Math.random() * 0.18);
        colorHex = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

        p.position.set(
            worldPos.x + (Math.random() - 0.5) * 0.1,
            worldPos.y + (Math.random() - 0.5) * 0.1,
            worldPos.z + 0.2
        );
        p.visible = true;
        p.material.color.set(colorHex);
        p.material.opacity = 0.9;
        p.userData.velocity.set(Math.cos(angle) * speed, Math.sin(angle) * speed, 0);
        p.userData.life = maxLife;
        p.userData.maxLife = maxLife;
        p.scale.setScalar(0.8 + Math.random() * 0.5);

        (function (particle) {
            particle.update = function (delta) {
                var progress;

                particle.userData.life -= delta;

                if (particle.userData.life <= 0) {
                    releaseParticle(state, particle);
                    return;
                }

                progress = 1 - (particle.userData.life / particle.userData.maxLife);
                particle.position.addScaledVector(particle.userData.velocity, delta);
                particle.material.opacity = (1 - progress) * 0.9;
                particle.scale.setScalar((0.8 + Math.random() * 0.5) * (1 + progress * 0.6));
            };
        })(p);

        state.activeParticles.add(p);
        state.sceneManager.addObject(p);
    }
}

function emitLineClearParticles(state, clearedRows, clearedCols) {
    var r;
    var c;
    var worldPos;

    clearedRows.forEach(function (row) {
        for (c = 0; c < state.boardMetrics.columns; c += 1) {
            worldPos = getCellWorldPosition(state.board, state.boardMetrics, row, c, 0.6);
            emitBurstAt(state, worldPos, 3);
        }
    });

    clearedCols.forEach(function (col) {
        for (r = 0; r < state.boardMetrics.rows; r += 1) {
            worldPos = getCellWorldPosition(state.board, state.boardMetrics, r, col, 0.6);
            emitBurstAt(state, worldPos, 2);
        }
    });
}

export function checkAndClearLines(state) {
    var rows = state.boardMetrics.rows;
    var cols = state.boardMetrics.columns;
    var clearedRows = [];
    var clearedCols = [];
    var clearedCells;
    var r;
    var c;
    var full;
    var linesCleared;
    var multiplier;

    for (r = 0; r < rows; r += 1) {
        full = true;

        for (c = 0; c < cols; c += 1) {
            if (!state.grid[r][c]) {
                full = false;
                break;
            }
        }

        if (full) {
            clearedRows.push(r);
        }
    }

    for (c = 0; c < cols; c += 1) {
        full = true;

        for (r = 0; r < rows; r += 1) {
            if (!state.grid[r][c]) {
                full = false;
                break;
            }
        }

        if (full) {
            clearedCols.push(c);
        }
    }

    if (clearedRows.length === 0 && clearedCols.length === 0) {
        return 0;
    }

    clearedCells = new Set();

    clearedRows.forEach(function (row) {
        for (c = 0; c < cols; c += 1) {
            if (state.grid[row][c]) {
                clearedCells.add(state.grid[row][c]);
                state.grid[row][c] = null;
            }
        }
    });

    clearedCols.forEach(function (col) {
        for (r = 0; r < rows; r += 1) {
            if (state.grid[r][col]) {
                clearedCells.add(state.grid[r][col]);
                state.grid[r][col] = null;
            }
        }
    });

    clearedCells.forEach(function (mesh) {
        state.boardCells.remove(mesh);
    });

    linesCleared = clearedRows.length + clearedCols.length;
    multiplier = linesCleared >= 3 ? 2.0 : (linesCleared >= 2 ? 1.5 : 1.0);
    state.score += Math.round(linesCleared * 100 * multiplier);
    refreshScore(state);

    emitLineClearParticles(state, clearedRows, clearedCols);

    return linesCleared;
}
