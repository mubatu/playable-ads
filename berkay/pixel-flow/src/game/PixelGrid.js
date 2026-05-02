import * as THREE from 'three';

/**
 * Pixel board on XZ plane. row 0 = south (min Z), col 0 = west (min X).
 * Edge rule: only the first *alive* cell along the ray from shooter into the board can be hit;
 * it must match shooter color to be destroyed.
 */
export class PixelGrid {
    constructor(scene, config) {
        this.scene = scene;
        this.rows = config.rows;
        this.cols = config.cols;
        this.cellSize = config.cellSize;
        this.colors = config.colors;
        this.gridColorIndices = config.gridColorIndices;

        this.cells = [];
        this.remaining = 0;
        this.total = 0;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.halfW = ((this.cols - 1) * this.cellSize) * 0.5;
        this.halfD = ((this.rows - 1) * this.cellSize) * 0.5;
    }

    cellCenter(col, row) {
        const x = col * this.cellSize - this.halfW;
        const z = row * this.cellSize - this.halfD;
        return new THREE.Vector3(x, 0, z);
    }

    getBounds() {
        const pad = this.cellSize * 0.5;
        return {
            xMin: -this.halfW - pad,
            xMax: this.halfW + pad,
            zMin: -this.halfD - pad,
            zMax: this.halfD + pad
        };
    }

    build() {
        const h = this.cellSize * 0.72;
        const geo = new THREE.BoxGeometry(this.cellSize * 0.92, h, this.cellSize * 0.92);

        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                const idx = this.gridColorIndices[row][col];
                const color = this.colors[idx % this.colors.length];
                const mesh = new THREE.Mesh(
                    geo,
                    new THREE.MeshStandardMaterial({
                        color,
                        roughness: 0.68,
                        metalness: 0.08
                    })
                );
                const c = this.cellCenter(col, row);
                mesh.position.set(c.x, h * 0.5, c.z);
                this.group.add(mesh);
                this.cells.push({ row, col, color, mesh, alive: true });
            }
        }

        this.total = this.cells.length;
        this.remaining = this.total;
    }

    getCell(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.cells[row * this.cols + col];
    }

    nearestColFromWorldX(x) {
        const col = Math.round((x + this.halfW) / this.cellSize);
        return Math.max(0, Math.min(this.cols - 1, col));
    }

    nearestRowFromWorldZ(z) {
        const row = Math.round((z + this.halfD) / this.cellSize);
        return Math.max(0, Math.min(this.rows - 1, row));
    }

    alignedToCol(x, col) {
        const cx = col * this.cellSize - this.halfW;
        return Math.abs(x - cx) < this.cellSize * 0.22;
    }

    alignedToRow(z, row) {
        const cz = row * this.cellSize - this.halfD;
        return Math.abs(z - cz) < this.cellSize * 0.22;
    }

    /**
     * @returns {{ cell, worldHit } | null} if a matching edge pixel was destroyed
     */
    tryShootFromSide(side, worldX, worldZ, colorHex) {
        if (side === 'south') {
            const col = this.nearestColFromWorldX(worldX);
            if (!this.alignedToCol(worldX, col)) {
                return null;
            }
            for (let r = 0; r < this.rows; r += 1) {
                const hit = this._rayCell(r, col, colorHex);
                if (hit === undefined) {
                    return null;
                }
                if (hit) {
                    return hit;
                }
            }
        } else if (side === 'north') {
            const col = this.nearestColFromWorldX(worldX);
            if (!this.alignedToCol(worldX, col)) {
                return null;
            }
            for (let r = this.rows - 1; r >= 0; r -= 1) {
                const hit = this._rayCell(r, col, colorHex);
                if (hit === undefined) {
                    return null;
                }
                if (hit) {
                    return hit;
                }
            }
        } else if (side === 'west') {
            const row = this.nearestRowFromWorldZ(worldZ);
            if (!this.alignedToRow(worldZ, row)) {
                return null;
            }
            for (let c = 0; c < this.cols; c += 1) {
                const hit = this._rayCell(row, c, colorHex);
                if (hit === undefined) {
                    return null;
                }
                if (hit) {
                    return hit;
                }
            }
        } else if (side === 'east') {
            const row = this.nearestRowFromWorldZ(worldZ);
            if (!this.alignedToRow(worldZ, row)) {
                return null;
            }
            for (let c = this.cols - 1; c >= 0; c -= 1) {
                const hit = this._rayCell(row, c, colorHex);
                if (hit === undefined) {
                    return null;
                }
                if (hit) {
                    return hit;
                }
            }
        }

        return null;
    }

    /**
     * @returns {object|null|undefined} null = keep scanning (dead cell), undefined = blocked wrong color, object = destroyed
     */
    _rayCell(row, col, colorHex) {
        const cell = this.getCell(row, col);
        if (!cell || !cell.alive) {
            return null;
        }
        if (cell.color !== colorHex) {
            return undefined;
        }
        cell.alive = false;
        this.remaining -= 1;
        cell.mesh.visible = false;
        const c = this.cellCenter(col, row);
        const h = this.cellSize * 0.72;
        return { cell, worldHit: new THREE.Vector3(c.x, h * 0.5, c.z) };
    }
}
