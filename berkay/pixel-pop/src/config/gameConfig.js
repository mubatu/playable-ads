/**
 * Pixel Pop — balance grid, queues, and colors from this file only.
 */
export const GAME_CONFIG = {
    pixelArtSize: 9,
    pixelPalette: [0x08111f, 0x1f3b73, 0x2f67c8, 0x54bdf7, 0xaef3ff],
    grid: {
        rows: 9,
        cols: 9,
        cellSize: 0.6,
        gap: 0.055,
        position: { x: 0, y: 1.85, z: 0 }
    },
    path: {
        boundsPadding: 2.8,
        railHeight: 0.26,
        railThickness: 0.18,
        pathCenter: { x: 0, y: 1.85, z: 0.8 }
    },
    pools: {
        shooters: 24,
        bullets: 80
    },
    queue: {
        queueCount: 4,
        bucketSize: 5,
        queueLength: 4,
        queueAnchorY: -5.95,
        bucketAnchorY: -6.3
    },
    queueColors: [0x1f3b73, 0x2f67c8, 0x54bdf7, 0xaef3ff],
    gameplay: {
        maxConcurrentShooters: 5,
        fireCooldown: 0.28
    },
    world: {
        starCount: 60,
        backdrop: { width: 44, height: 32, color: 0x07111e, opacity: 0.95, z: -8 }
    }
};
