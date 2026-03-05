const GRID_ROWS = 8;
const GRID_COLS = 8;
const COLORS = ['red', 'blue', 'green', 'yellow'];

const TEXTURE_MAP = {
    red: 'assets/red_cube.png',
    blue: 'assets/blue_cube.png',
    green: 'assets/green_cube.png',
    yellow: 'assets/yellow_cube.png',
};

export class Grid {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.cells = []; // 2D array [row][col]
        this.tileSize = 0;
        this.padding = 4;

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
     * Blast (remove) a group of connected tiles with a scale-down animation.
     */
    blast(tiles) {
        if (tiles.length < 2) return; // need at least 2 to blast

        for (const { row, col, tile } of tiles) {
            this.cells[row][col] = null;

            // Animate: scale down + fade out
            tile.eventMode = 'none';
            const cx = tile.x + tile.width / 2;
            const cy = tile.y + tile.height / 2;
            tile.anchor.set(0.5);
            tile.x = cx;
            tile.y = cy;

            this.animateBlast(tile);
        }
    }

    /**
     * Simple blast animation using the app ticker.
     */
    animateBlast(sprite) {
        const duration = 15; // frames
        let frame = 0;

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

    /**
     * Handle a tile tap/click — find connected group and blast it.
     */
    onTileTap(row, col) {
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
