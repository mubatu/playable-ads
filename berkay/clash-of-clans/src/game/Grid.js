import * as THREE from 'three';

/**
 * 2D grid on the XZ plane; tile (c, r) occupies world center
 *   ((c - (cols-1)/2) * tileSize, y, (r - (rows-1)/2) * tileSize)
 *
 * Each cell holds an entity reference (or null) and a walkable flag.
 */
export class Grid {
    constructor({ cols, rows, tileSize = 1 }) {
        this.cols = cols;
        this.rows = rows;
        this.tileSize = tileSize;
        this.cells = new Array(cols * rows);
        for (let i = 0; i < this.cells.length; i += 1) {
            this.cells[i] = { entity: null, walkable: true };
        }
    }

    inBounds(c, r) {
        return c >= 0 && r >= 0 && c < this.cols && r < this.rows;
    }

    cell(c, r) {
        if (!this.inBounds(c, r)) {
            return null;
        }
        return this.cells[r * this.cols + c];
    }

    isWalkable(c, r) {
        const cell = this.cell(c, r);
        return !!cell && cell.walkable;
    }

    /**
     * Mark a w x h block as occupied by an entity.
     * @returns true if all tiles were free and the placement was committed.
     */
    placeFootprint(c0, r0, w, h, entity) {
        for (let r = r0; r < r0 + h; r += 1) {
            for (let c = c0; c < c0 + w; c += 1) {
                const cell = this.cell(c, r);
                if (!cell || cell.entity) {
                    return false;
                }
            }
        }
        for (let r = r0; r < r0 + h; r += 1) {
            for (let c = c0; c < c0 + w; c += 1) {
                const cell = this.cell(c, r);
                cell.entity = entity;
                cell.walkable = false;
            }
        }
        return true;
    }

    clearFootprint(c0, r0, w, h) {
        for (let r = r0; r < r0 + h; r += 1) {
            for (let c = c0; c < c0 + w; c += 1) {
                const cell = this.cell(c, r);
                if (!cell) {
                    continue;
                }
                cell.entity = null;
                cell.walkable = true;
            }
        }
    }

    /** World center of a 1x1 tile. */
    gridToWorld(c, r) {
        return new THREE.Vector3(
            (c - (this.cols - 1) * 0.5) * this.tileSize,
            0,
            (r - (this.rows - 1) * 0.5) * this.tileSize
        );
    }

    /** World center of a w x h footprint anchored at (c0, r0). */
    footprintCenter(c0, r0, w, h) {
        return new THREE.Vector3(
            ((c0 + (w - 1) * 0.5) - (this.cols - 1) * 0.5) * this.tileSize,
            0,
            ((r0 + (h - 1) * 0.5) - (this.rows - 1) * 0.5) * this.tileSize
        );
    }

    worldToGrid(x, z) {
        const c = Math.round(x / this.tileSize + (this.cols - 1) * 0.5);
        const r = Math.round(z / this.tileSize + (this.rows - 1) * 0.5);
        return { c, r };
    }

    /**
     * Like worldToGrid but clamps to the map so edge ray hits still map to border tiles
     * (avoids silent deploy failures when the click projects slightly past the grid).
     */
    worldToGridClamped(x, z) {
        let c = Math.round(x / this.tileSize + (this.cols - 1) * 0.5);
        let r = Math.round(z / this.tileSize + (this.rows - 1) * 0.5);
        c = Math.max(0, Math.min(this.cols - 1, c));
        r = Math.max(0, Math.min(this.rows - 1, r));
        return { c, r };
    }

    /** Shortest distance in the XZ plane from a world point to the footprint AABB (tile solids). */
    distanceXZToFootprintAabb(x, z, c0, r0, w, h) {
        const minX = (c0 - (this.cols - 1) * 0.5 - 0.5) * this.tileSize;
        const maxX = (c0 + w - 1 - (this.cols - 1) * 0.5 + 0.5) * this.tileSize;
        const minZ = (r0 - (this.rows - 1) * 0.5 - 0.5) * this.tileSize;
        const maxZ = (r0 + h - 1 - (this.rows - 1) * 0.5 + 0.5) * this.tileSize;
        const cx = Math.max(minX, Math.min(maxX, x));
        const cz = Math.max(minZ, Math.min(maxZ, z));
        const dx = x - cx;
        const dz = z - cz;
        return Math.sqrt(dx * dx + dz * dz);
    }

    /** All in-bounds, currently walkable tiles directly adjacent to a footprint. */
    tilesAdjacentToFootprint(c0, r0, w, h) {
        const out = [];
        for (let c = c0 - 1; c <= c0 + w; c += 1) {
            const top = { c, r: r0 - 1 };
            if (this.inBounds(top.c, top.r) && this.isWalkable(top.c, top.r)) {
                out.push(top);
            }
            const bot = { c, r: r0 + h };
            if (this.inBounds(bot.c, bot.r) && this.isWalkable(bot.c, bot.r)) {
                out.push(bot);
            }
        }
        for (let r = r0; r < r0 + h; r += 1) {
            const left = { c: c0 - 1, r };
            if (this.inBounds(left.c, left.r) && this.isWalkable(left.c, left.r)) {
                out.push(left);
            }
            const right = { c: c0 + w, r };
            if (this.inBounds(right.c, right.r) && this.isWalkable(right.c, right.r)) {
                out.push(right);
            }
        }
        return out;
    }

    /** All perimeter cells (used as spawn area). */
    perimeterCells() {
        const out = [];
        for (let c = 0; c < this.cols; c += 1) {
            out.push({ c, r: 0 });
            out.push({ c, r: this.rows - 1 });
        }
        for (let r = 1; r < this.rows - 1; r += 1) {
            out.push({ c: 0, r });
            out.push({ c: this.cols - 1, r });
        }
        return out;
    }
}
