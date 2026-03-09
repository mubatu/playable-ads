/**
 * Blast-style particle system for PixiJS.
 * Spawns small colored particles that burst outward with gravity,
 * spin, fade out, and shrink — just like a match-3 / blast game.
 */

// Color tints applied to a white circle texture
const COLOR_TINTS = {
    red:    [0xff4444, 0xff6666, 0xcc2222, 0xffaa44],
    blue:   [0x4488ff, 0x66aaff, 0x2266cc, 0x44ccff],
    green:  [0x44cc44, 0x66ee66, 0x22aa22, 0xaaff44],
    yellow: [0xffcc00, 0xffee44, 0xeeaa00, 0xffff88],
};

/**
 * Generate a small white circle texture (used once, shared by all particles).
 */
function createParticleTexture(app) {
    const g = new PIXI.Graphics();
    // Draw a crisp white circle
    g.circle(0, 0, 10);
    g.fill({ color: 0xffffff });
    return app.renderer.generateTexture(g);
}

/**
 * A single particle with physics properties.
 */
class Particle {
    constructor(sprite) {
        this.sprite = sprite;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0;
        this.life = 1;       // 1 → 0
        this.decay = 0;      // per frame
        this.rotationSpeed = 0;
        this.scaleStart = 1;
    }
}

export class ParticleSystem {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.particles = [];
        this.texture = null;

        // Render particles above everything
        this.app.stage.addChild(this.container);

        // Single ticker callback for all particles
        this.app.ticker.add(this.update, this);
    }

    /** Lazy-init the shared texture */
    ensureTexture() {
        if (!this.texture) {
            this.texture = createParticleTexture(this.app);
        }
    }

    /**
     * Emit a burst of particles at a world position.
     * @param {number} worldX  – x in the stage coordinate space
     * @param {number} worldY  – y in the stage coordinate space
     * @param {string} color   – one of red / blue / green / yellow
     * @param {number} tileSize – used to scale particles relative to tile
     */
    emit(worldX, worldY, color, tileSize) {
        this.ensureTexture();

        const tints = COLOR_TINTS[color] || COLOR_TINTS.red;
        const count = 8 + Math.floor(Math.random() * 5); // 8-12 particles

        for (let i = 0; i < count; i++) {
            const sprite = new PIXI.Sprite(this.texture);
            sprite.anchor.set(0.5);
            sprite.x = worldX;
            sprite.y = worldY;

            // Random tint from the color palette
            sprite.tint = tints[Math.floor(Math.random() * tints.length)];

            // Size: small relative to tile
            const baseScale = (tileSize / 10) * (0.2 + Math.random() * 0.35);
            sprite.scale.set(baseScale);

            const p = new Particle(sprite);

            // Burst velocity — radial with some randomness
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed - 2; // slight upward bias
            p.gravity = 0.15 + Math.random() * 0.1;
            p.decay = 0.02 + Math.random() * 0.015;
            p.rotationSpeed = (Math.random() - 0.5) * 0.3;
            p.scaleStart = baseScale;

            this.container.addChild(sprite);
            this.particles.push(p);
        }
    }

    /**
     * Emit particles for a whole group of blasted tiles.
     * Converts grid-local positions to stage-world positions.
     * @param {Array} tiles       – [{row, col, tile}]
     * @param {PIXI.Container} gridContainer – the grid container (for offset)
     * @param {number} tileSize
     * @param {number} padding
     */
    emitGroup(tiles, gridContainer, tileSize, padding) {
        for (const { row, col, tile } of tiles) {
            // Center of the tile in world coords
            const localX = col * (tileSize + padding) + tileSize / 2;
            const localY = row * (tileSize + padding) + tileSize / 2;
            const worldPos = gridContainer.toGlobal({ x: localX, y: localY });
            this.emit(worldPos.x, worldPos.y, tile.colorType, tileSize);
        }
    }

    /**
     * Per-frame update — move, fade, shrink, remove dead particles.
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Physics
            p.vy += p.gravity;
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            p.sprite.rotation += p.rotationSpeed;

            // Fade & shrink
            p.life -= p.decay;
            p.sprite.alpha = Math.max(0, p.life);
            p.sprite.scale.set(p.scaleStart * Math.max(0, p.life));

            // Remove dead
            if (p.life <= 0) {
                this.container.removeChild(p.sprite);
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
}
