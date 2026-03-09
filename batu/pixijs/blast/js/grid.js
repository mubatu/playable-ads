const GRID_ROWS = 8;
const GRID_COLS = 8;
const COLORS = ['red', 'blue', 'green', 'yellow'];

const TEXTURE_MAP = {
    red: 'assets/red_cube.png',
    blue: 'assets/blue_cube.png',
    green: 'assets/green_cube.png',
    yellow: 'assets/yellow_cube.png',
};

const FALL_SPEED = 0.18;   // lerp factor per frame (0-1, higher = faster)
const FALL_DELAY_PER_ROW = 3; // extra frames of delay per row distance

export class Grid {
    constructor(app, particleSystem) {
        this.app = app;
        this.particles = particleSystem;
        this.container = new PIXI.Container();
        this.cells = []; // 2D array [row][col]
        this.tileSize = 0;
        this.padding = 4;
        this.animating = false; // lock input while tiles settle

        this.app.stage.addChild(this.container);
    }

    async loadTextures() {
        this.textures = {};
        for (const color of COLORS) {
            this.textures[color] = await PIXI.Assets.load(TEXTURE_MAP[color]);
        }
    }

    /**
     * Calculate tile size and position grid centered on screen.
     */
    layout() {
        const maxWidth = this.app.screen.width * 0.9;
        const maxHeight = this.app.screen.height * 0.75;

        this.tileSize = Math.floor(
            Math.min(maxWidth / GRID_COLS, maxHeight / GRID_ROWS) - this.padding
        );

        const gridWidth = GRID_COLS * (this.tileSize + this.padding);
        const gridHeight = GRID_ROWS * (this.tileSize + this.padding);

        this.container.x = (this.app.screen.width - gridWidth) / 2;
        this.container.y = (this.app.screen.height - gridHeight) / 2 + this.app.screen.height * 0.05;
    }

    /**
     * Build the initial 8x8 grid with random colored cubes.
     */
    build() {
        this.layout();

        for (let row = 0; row < GRID_ROWS; row++) {
            this.cells[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                const tile = this.createTile(row, col, color);
                this.cells[row][col] = tile;
            }
        }
    }

    /**
     * Find all connected tiles of the same color using flood-fill (BFS).
     */
    getConnectedTiles(row, col) {
        const target = this.cells[row]?.[col];
        if (!target) return [];

        const color = target.colorType;
        const visited = new Set();
        const queue = [[row, col]];
        const result = [];

        while (queue.length > 0) {
            const [r, c] = queue.shift();
            const key = `${r},${c}`;

            if (visited.has(key)) continue;
            if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;

            const tile = this.cells[r]?.[c];
            if (!tile || tile.colorType !== color) continue;

            visited.add(key);
            result.push({ row: r, col: c, tile });

            queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
        }

        return result;
    }

    /**
     * Blast (remove) a group of connected tiles with particle effects,
     * then collapse columns and spawn new tiles.
     */
    blast(tiles) {
        if (tiles.length < 2) return; // need at least 2 to blast

        this.animating = true;

        // Emit particles for the whole group
        this.particles.emitGroup(tiles, this.container, this.tileSize, this.padding);

        // Remove tiles from grid data immediately
        for (const { row, col, tile } of tiles) {
            this.cells[row][col] = null;
            tile.eventMode = 'none';
            this.animateTileRemove(tile);
        }

        // After a short delay let tiles settle
        setTimeout(() => this.collapseAndRefill(), 150);
    }

    /**
     * Fast shrink + fade to remove the tile sprite (particles handle the visual punch).
     */
    animateTileRemove(sprite) {
        const duration = 8; // frames – fast removal
        let frame = 0;

        const cx = sprite.x + sprite.width / 2;
        const cy = sprite.y + sprite.height / 2;
        sprite.anchor.set(0.5);
        sprite.x = cx;
        sprite.y = cy;

        const tick = () => {
            frame++;
            const t = frame / duration;
            sprite.scale.set(1 - t);
            sprite.alpha = 1 - t;

            if (frame >= duration) {
                this.app.ticker.remove(tick);
                this.container.removeChild(sprite);
                sprite.destroy();
            }
        };

        this.app.ticker.add(tick);
    }

    // ─── Collapse & Refill ────────────────────────────────────────────

    /**
     * For each column, shift existing tiles down to fill gaps,
     * then spawn new random tiles above to fill the rest.
     */
    collapseAndRefill() {
        const animations = []; // collect all pending fall animations

        for (let col = 0; col < GRID_COLS; col++) {
            // Collect non-null tiles bottom-up
            const stack = [];
            for (let row = GRID_ROWS - 1; row >= 0; row--) {
                if (this.cells[row][col]) {
                    stack.push(this.cells[row][col]);
                }
            }

            // Number of empty slots that need new tiles
            const emptyCount = GRID_ROWS - stack.length;

            // Rebuild the column in cells array
            // stack[0] = bottom-most existing tile → goes to row GRID_ROWS-1
            for (let i = 0; i < stack.length; i++) {
                const newRow = GRID_ROWS - 1 - i;
                const tile = stack[i];
                this.cells[newRow][col] = tile;

                // Update sprite metadata
                tile.gridRow = newRow;
                tile.gridCol = col;
                // Re-bind tap to new row
                tile.removeAllListeners('pointertap');
                tile.on('pointertap', () => this.onTileTap(newRow, col));

                // Target y
                const targetY = newRow * (this.tileSize + this.padding);
                if (tile.y !== targetY) {
                    const distance = Math.abs(newRow - tile.gridRow);
                    animations.push({ tile, targetY, delay: 0 });
                }
            }

            // Spawn new tiles for the empty slots at the top
            for (let i = 0; i < emptyCount; i++) {
                const newRow = emptyCount - 1 - i;
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                const tile = this.createTile(newRow, col, color);

                // Start the tile above the grid so it falls in
                const spawnOffsetRows = emptyCount - i;
                tile.y = -(spawnOffsetRows) * (this.tileSize + this.padding);
                tile.alpha = 0.7;

                this.cells[newRow][col] = tile;

                const targetY = newRow * (this.tileSize + this.padding);
                animations.push({
                    tile,
                    targetY,
                    delay: i * FALL_DELAY_PER_ROW,
                    fadeIn: true,
                });
            }
        }

        // Run all fall animations
        if (animations.length > 0) {
            this.runFallAnimations(animations);
        } else {
            this.animating = false;
        }
    }

    /**
     * Smoothly animate tiles to their target Y positions using lerp.
     */
    runFallAnimations(animations) {
        let frame = 0;

        const tick = () => {
            frame++;
            let allDone = true;

            for (const anim of animations) {
                if (anim.done) continue;

                // Delay before this tile starts moving
                if (frame < anim.delay) {
                    allDone = false;
                    continue;
                }

                const tile = anim.tile;
                const dy = anim.targetY - tile.y;

                if (Math.abs(dy) < 0.5) {
                    // Snap to final position
                    tile.y = anim.targetY;
                    tile.alpha = 1;
                    anim.done = true;
                } else {
                    tile.y += dy * FALL_SPEED;
                    if (anim.fadeIn) {
                        tile.alpha = Math.min(1, tile.alpha + 0.08);
                    }
                    allDone = false;
                }
            }

            if (allDone) {
                this.app.ticker.remove(tick);
                this.animating = false;
            }
        };

        this.app.ticker.add(tick);
    }

    /**
     * Handle a tile tap/click — find connected group and blast it.
     */
    onTileTap(row, col) {
        if (this.animating) return; // ignore taps while tiles are settling
        const connected = this.getConnectedTiles(row, col);
        this.blast(connected);
    }

    /**
     * Create a single tile sprite at the given grid position.
     */
    createTile(row, col, color) {
        const sprite = new PIXI.Sprite(this.textures[color]);
        sprite.width = this.tileSize;
        sprite.height = this.tileSize;
        sprite.x = col * (this.tileSize + this.padding);
        sprite.y = row * (this.tileSize + this.padding);
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';

        // Store grid metadata on the sprite
        sprite.gridRow = row;
        sprite.gridCol = col;
        sprite.colorType = color;

        sprite.on('pointertap', () => this.onTileTap(row, col));

        this.container.addChild(sprite);
        return sprite;
    }

    /**
     * Rebuild on resize.
     */
    resize() {
        this.container.removeChildren();
        this.layout();

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const tile = this.cells[row][col];
                if (!tile) continue;

                tile.width = this.tileSize;
                tile.height = this.tileSize;
                tile.x = col * (this.tileSize + this.padding);
                tile.y = row * (this.tileSize + this.padding);
                this.container.addChild(tile);
            }
        }
    }
}
