/**
 * Terrain - Draws the dirt platform
 * A large elliptical ground plane with dirt texture/coloring
 */
export class Terrain {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
    }

    draw() {
        this.container.removeChildren();

        const w = this.app.screen.width;
        const h = this.app.screen.height;
        const cx = w / 2;
        const cy = h / 2 + h * 0.1;

        // --- Main dirt ellipse ---
        const groundRadiusX = w * 0.55;
        const groundRadiusY = h * 0.32;

        // Shadow beneath the platform
        const shadow = new PIXI.Graphics();
        shadow.ellipse(cx, cy + 18, groundRadiusX + 6, groundRadiusY + 6);
        shadow.fill({ color: 0x2a1a0a, alpha: 0.25 });
        this.container.addChild(shadow);

        // Side/depth of the platform (3D look)
        const depth = 36;
        const side = new PIXI.Graphics();
        side.ellipse(cx, cy + depth, groundRadiusX, groundRadiusY);
        side.fill(0x3d2b1f);
        this.container.addChild(side);

        // Fill the gap between top and side ellipse
        const bridge = new PIXI.Graphics();
        bridge.rect(cx - groundRadiusX, cy, groundRadiusX * 2, depth);
        bridge.fill(0x3d2b1f);
        this.container.addChild(bridge);

        // Top dirt surface
        const top = new PIXI.Graphics();
        top.ellipse(cx, cy, groundRadiusX, groundRadiusY);
        top.fill(0x6B4226);
        this.container.addChild(top);

        // Lighter inner area for depth feel
        const inner = new PIXI.Graphics();
        inner.ellipse(cx, cy - 4, groundRadiusX * 0.85, groundRadiusY * 0.8);
        inner.fill({ color: 0x8B5E3C, alpha: 0.6 });
        this.container.addChild(inner);

        // Scattered dirt patches for texture
        const rng = this._seededRandom(42);
        for (let i = 0; i < 30; i++) {
            const angle = rng() * Math.PI * 2;
            const dist = rng() * 0.75;
            const px = cx + Math.cos(angle) * groundRadiusX * dist;
            const py = cy + Math.sin(angle) * groundRadiusY * dist;
            const radius = 4 + rng() * 14;

            const patch = new PIXI.Graphics();
            patch.circle(px, py, radius);
            const shade = rng() > 0.5 ? 0x7a4f2b : 0x5c3a1e;
            patch.fill({ color: shade, alpha: 0.25 + rng() * 0.2 });
            this.container.addChild(patch);
        }

        // Store bounds for tree placement
        this.bounds = { cx, cy, radiusX: groundRadiusX * 0.82, radiusY: groundRadiusY * 0.78 };
    }

    /** Simple seeded PRNG so positions stay fixed across reloads */
    _seededRandom(seed) {
        let s = seed;
        return () => {
            s = (s * 16807 + 0) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    resize() {
        this.draw();
    }
}
