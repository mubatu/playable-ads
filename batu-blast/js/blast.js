const Blast = (function () {
    'use strict';

    // 4-way cardinal directions: up, down, left, right
    const DIRS = [
        { dr: -1, dc:  0 },  // down  (row-1)
        { dr:  1, dc:  0 },  // up    (row+1)
        { dr:  0, dc: -1 },  // left
        { dr:  0, dc:  1 }   // right
    ];

    const POP_DURATION = 0.22;
    const PARTICLE_DURATION = 0.30;
    const PARTICLES_PER_CELL = 8;

    const activeBlasts = [];
    const activeParticles = [];

    function clamp01(v) {
        return Math.max(0, Math.min(1, v));
    }

    function createParticlesAt(position) {
        for (let i = 0; i < PARTICLES_PER_CELL; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.8 + Math.random() * 1.8;
            const size = 0.08 + Math.random() * 0.06;

            const geometry = new THREE.PlaneGeometry(size, size);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                depthWrite: false
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(position.x, position.y, 0.05);
            GameScene.scene.add(mesh);

            activeParticles.push({
                mesh: mesh,
                age: 0,
                lifetime: PARTICLE_DURATION,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed
            });
        }
    }

    function startBlast(group) {
        const meshes = [];

        for (let i = 0; i < group.length; i++) {
            const row = group[i].row;
            const col = group[i].col;
            const cell = Grid.getCell(row, col);
            if (cell) {
                meshes.push(cell.mesh);
                createParticlesAt(cell.mesh.position);
            }
        }

        if (meshes.length > 0) {
            activeBlasts.push({
                group: group,
                meshes: meshes,
                age: 0,
                duration: POP_DURATION
            });
        }
    }

    /**
     * BFS flood-fill from (startRow, startCol).
     * Returns an array of { row, col } for all connected same-color cells.
     */
    function findGroup(startRow, startCol) {
        const startCell = Grid.getCell(startRow, startCol);
        if (!startCell) return [];

        const targetType = startCell.type;
        const visited = {};
        const group = [];
        const queue = [{ row: startRow, col: startCol }];

        function key(r, c) { return r + ',' + c; }
        visited[key(startRow, startCol)] = true;

        while (queue.length > 0) {
            const current = queue.shift();
            group.push(current);

            for (let d = 0; d < DIRS.length; d++) {
                const nr = current.row + DIRS[d].dr;
                const nc = current.col + DIRS[d].dc;
                const k = key(nr, nc);

                if (visited[k]) continue;

                const neighbor = Grid.getCell(nr, nc);
                if (neighbor && neighbor.type === targetType) {
                    visited[k] = true;
                    queue.push({ row: nr, col: nc });
                }
            }
        }

        return group;
    }

    /**
     * Attempt to blast at (row, col).
     * If the connected group has >= 2 cubes, remove them all.
     * Returns the removed group (or empty array if no blast).
     */
    function tryBlast(row, col) {
        const group = findGroup(row, col);
        if (group.length >= 2) {
            startBlast(group);
            return group;
        }
        return [];
    }

    function update(delta) {
        for (let i = activeBlasts.length - 1; i >= 0; i--) {
            const blast = activeBlasts[i];
            blast.age += delta;

            const t = clamp01(blast.age / blast.duration);
            const scale = 1.0 + 0.35 * Math.sin(t * Math.PI);
            const opacity = 1.0 - t;

            for (let m = 0; m < blast.meshes.length; m++) {
                const mesh = blast.meshes[m];
                mesh.scale.set(scale, scale, 1);
                if (mesh.material && mesh.material.opacity !== undefined) {
                    mesh.material.opacity = opacity;
                }
            }

            if (blast.age >= blast.duration) {
                Grid.removeCells(blast.group);
                Grid.applyGravity();
                activeBlasts.splice(i, 1);
            }
        }

        for (let i = activeParticles.length - 1; i >= 0; i--) {
            const p = activeParticles[i];
            p.age += delta;
            const t = clamp01(p.age / p.lifetime);

            p.mesh.position.x += p.vx * delta;
            p.mesh.position.y += p.vy * delta;
            p.mesh.scale.set(1.0 - 0.35 * t, 1.0 - 0.35 * t, 1);
            p.mesh.material.opacity = 0.9 * (1 - t);

            if (p.age >= p.lifetime) {
                GameScene.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                activeParticles.splice(i, 1);
            }
        }
    }

    function isBusy() {
        return activeBlasts.length > 0;
    }

    return {
        findGroup: findGroup,
        tryBlast: tryBlast,
        update: update,
        isBusy: isBusy
    };
})();
