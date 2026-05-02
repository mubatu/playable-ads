import * as THREE from 'three';

/**
 * Axis-aligned square loop around a grid (grid lies on XZ plane, Y up).
 * t in [0,1) moves CCW: south (low Z) west→east, east edge north, north east→west, west south.
 */
export class SquarePath {
    constructor(gridBounds, padding) {
        const { xMin, xMax, zMin, zMax } = gridBounds;
        this.xMin = xMin - padding;
        this.xMax = xMax + padding;
        this.zMin = zMin - padding;
        this.zMax = zMax + padding;

        const w = this.xMax - this.xMin;
        const h = this.zMax - this.zMin;
        this.seg0 = w;
        this.seg1 = h;
        this.seg2 = w;
        this.seg3 = h;
        this.perimeter = w + h + w + h;
    }

    sample(t) {
        let u = t % 1;
        if (u < 0) {
            u += 1;
        }
        let d = u * this.perimeter;

        const { xMin, xMax, zMin, zMax } = this;

        if (d < this.seg0) {
            const k = d / this.seg0;
            const x = xMin + k * (xMax - xMin);
            const z = zMin;
            return { x, y: 0, z, side: 'south', u: k };
        }
        d -= this.seg0;
        if (d < this.seg1) {
            const k = d / this.seg1;
            const x = xMax;
            const z = zMin + k * (zMax - zMin);
            return { x, y: 0, z, side: 'east', u: k };
        }
        d -= this.seg1;
        if (d < this.seg2) {
            const k = d / this.seg2;
            const x = xMax - k * (xMax - xMin);
            const z = zMax;
            return { x, y: 0, z, side: 'north', u: k };
        }
        d -= this.seg2;
        const k = d / this.seg3;
        const x = xMin;
        const z = zMax - k * (zMax - zMin);
        return { x, y: 0, z, side: 'west', u: k };
    }

    tangentAt(t) {
        const eps = 0.0005;
        const a = this.sample(t);
        const b = this.sample(t + eps);
        return new THREE.Vector3(b.x - a.x, 0, b.z - a.z).normalize();
    }
}
