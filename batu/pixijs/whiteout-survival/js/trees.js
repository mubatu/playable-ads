/**
 * Trees - Draws procedural pine/snow trees on the terrain
 * Fixed number (TREE_COUNT), random but deterministic positions via seeded RNG
 */
export class Trees {
    static TREE_COUNT = 50;

    constructor(app, terrain) {
        this.app = app;
        this.terrain = terrain;
        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
        this.app.stage.addChild(this.container);
    }

    draw() {
        this.container.removeChildren();

        const bounds = this.terrain.bounds;
        if (!bounds) return;

        const rng = this._seededRandom(123);
        const trees = [];

        // Generate tree positions (avoid overlapping by spacing check)
        for (let i = 0; i < Trees.TREE_COUNT; i++) {
            let x, y, valid;
            let attempts = 0;
            do {
                const angle = rng() * Math.PI * 2;
                const dist = 0.25 + rng() * 0.7; // keep away from exact center
                x = bounds.cx + Math.cos(angle) * bounds.radiusX * dist;
                y = bounds.cy + Math.sin(angle) * bounds.radiusY * dist;
                valid = trees.every(t => Math.hypot(t.x - x, t.y - y) > 50);
                attempts++;
            } while (!valid && attempts < 50);

            const scale = 0.6 + rng() * 0.5;
            trees.push({ x, y, scale });
        }

        // Sort by y so trees further back render behind trees in front
        trees.sort((a, b) => a.y - b.y);

        trees.forEach((t, i) => {
            const tree = this._createTree(t.x, t.y, t.scale, rng);
            tree.zIndex = Math.floor(t.y);
            this.container.addChild(tree);
        });
    }

    /**
     * Draw a single pine tree procedurally
     */
    _createTree(x, y, scale, rng) {
        const group = new PIXI.Container();
        group.x = x;
        group.y = y;
        group.scale.set(scale);

        // Shadow
        const shadow = new PIXI.Graphics();
        shadow.ellipse(0, 8, 18, 7);
        shadow.fill({ color: 0x000000, alpha: 0.18 });
        group.addChild(shadow);

        // Trunk
        const trunk = new PIXI.Graphics();
        trunk.rect(-4, -20, 8, 24);
        trunk.fill(0x5c3a1e);
        group.addChild(trunk);

        // Snow-covered pine layers (3 triangle tiers)
        const tiers = 3;
        const baseWidth = 38;
        const tierHeight = 22;

        for (let t = 0; t < tiers; t++) {
            const w = baseWidth - t * 8;
            const yOff = -20 - t * (tierHeight - 6);

            // Dark green body
            const foliage = new PIXI.Graphics();
            foliage.moveTo(0, yOff - tierHeight);
            foliage.lineTo(-w / 2, yOff);
            foliage.lineTo(w / 2, yOff);
            foliage.closePath();
            const green = [0x2d5a27, 0x1e4620, 0x3b6e35][t % 3];
            foliage.fill(green);
            group.addChild(foliage);

            // Snow cap on top portion of each tier
            const snow = new PIXI.Graphics();
            const snowH = tierHeight * 0.4;
            const snowW = w * 0.55;
            snow.moveTo(0, yOff - tierHeight);
            snow.lineTo(-snowW / 2, yOff - tierHeight + snowH);
            snow.lineTo(snowW / 2, yOff - tierHeight + snowH);
            snow.closePath();
            snow.fill({ color: 0xffffff, alpha: 0.85 });
            group.addChild(snow);
        }

        return group;
    }

    /** Seeded PRNG matching terrain's approach */
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
