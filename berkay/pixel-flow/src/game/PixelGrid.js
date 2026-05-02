import * as THREE from 'three';

const CELL_GEOMETRY = new THREE.BoxGeometry(0.56, 0.56, 0.24);

export class PixelGrid {
    constructor(scene, config) {
        this.scene = scene;
        this.rows = config.rows;
        this.cols = config.cols;
        this.palette = config.palette;
        this.cells = [];
        this.remaining = 0;
        this.total = 0;
        this.group = new THREE.Group();
        this.group.position.set(0, 1.9, 0);
        this.scene.add(this.group);
    }

    build() {
        let colorCursor = 0;
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                const color = this.palette[colorCursor % this.palette.length];
                colorCursor += 1;

                const mesh = new THREE.Mesh(
                    CELL_GEOMETRY,
                    new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.06 })
                );
                mesh.position.set(
                    (col - (this.cols - 1) * 0.5) * 0.64,
                    -(row - (this.rows - 1) * 0.5) * 0.64,
                    0
                );
                this.group.add(mesh);
                this.cells.push({ row, col, color, mesh, alive: true });
            }
        }

        this.total = this.cells.length;
        this.remaining = this.total;
    }

    consumeMatchingCell(colorHex) {
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                const cell = this.getCell(row, col);
                if (!cell || !cell.alive || cell.color !== colorHex) {
                    continue;
                }

                cell.alive = false;
                this.remaining -= 1;
                cell.mesh.visible = false;
                return cell;
            }
        }

        return null;
    }

    getCell(row, col) {
        const index = row * this.cols + col;
        return this.cells[index] || null;
    }
}
