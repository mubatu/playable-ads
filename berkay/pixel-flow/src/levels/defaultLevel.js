/**
 * Deterministic level: gridColorIndices[row][col] = palette index.
 * Initial queues are built at runtime from the grid so total ammo per color
 * equals the number of pixels of that color, with shooters shuffled across lanes.
 */
export const DEFAULT_LEVEL = {
    cellSize: 0.34,
    pathPadding: 0.48,
    pathSpeed: 2.15,
    pathY: 0.36,
    bucketCapacity: 5,
    /** Max pigs on the square path at once */
    maxPathShooters: 5,
    maxLaneDepth: 4,
    laneCount: 4,
    /** Upper bound per shooter ammo when splitting; may grow automatically if queues are too small. */
    queueMaxChunk: 6,
    colors: [0xff5e7d, 0x58a7ff, 0xffcf4d, 0x60d394],
    rows: 6,
    cols: 6,
    gridColorIndices: [
        [0, 1, 2, 3, 0, 1],
        [1, 2, 3, 0, 1, 2],
        [2, 3, 0, 1, 2, 3],
        [3, 0, 1, 2, 3, 0],
        [0, 1, 2, 3, 0, 1],
        [1, 2, 3, 0, 1, 2]
    ]
};
