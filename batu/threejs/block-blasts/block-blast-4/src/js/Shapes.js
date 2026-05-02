var SHAPE_DEFINITIONS = [
    // 1-cell
    { cells: [[0, 0]] },

    // 2-cell horizontal
    { cells: [[0, 0], [0, 1]] },

    // 2-cell vertical
    { cells: [[0, 0], [1, 0]] },

    // 3-cell horizontal
    { cells: [[0, 0], [0, 1], [0, 2]] },

    // 3-cell vertical
    { cells: [[0, 0], [1, 0], [2, 0]] },

    // L-corner (bottom-right)
    { cells: [[0, 0], [1, 0], [1, 1]] },

    // L-corner (bottom-left)
    { cells: [[0, 1], [1, 0], [1, 1]] },

    // L-corner (top-right)
    { cells: [[0, 0], [0, 1], [1, 0]] },

    // L-corner (top-left)
    { cells: [[0, 0], [0, 1], [1, 1]] },

    // 2x2 square
    { cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },

    // I-tetromino horizontal
    { cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },

    // I-tetromino vertical
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },

    // L-tetromino
    { cells: [[0, 0], [1, 0], [2, 0], [2, 1]] },

    // J-tetromino
    { cells: [[0, 1], [1, 1], [2, 0], [2, 1]] },

    // T-tetromino
    { cells: [[0, 0], [0, 1], [0, 2], [1, 1]] },

    // S-tetromino
    { cells: [[0, 1], [0, 2], [1, 0], [1, 1]] },

    // Z-tetromino
    { cells: [[0, 0], [0, 1], [1, 1], [1, 2]] },

    // 5-cell horizontal
    { cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },

    // 5-cell vertical
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },

    // Big L (5 cells)
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]] },

    // Big reverse-L (5 cells)
    { cells: [[0, 1], [1, 1], [2, 1], [3, 0], [3, 1]] },

    // 2x3 rectangle
    { cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]] },

    // 3x2 rectangle
    { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]] },

    // Plus / cross
    { cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]] },

    // 3x3 square
    { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]] }
];

var BLOCK_COLORS = [
    0xFF6B6B,
    0xFFE66D,
    0x4ECDC4,
    0xF38181,
    0xAA96DA,
    0xFCBAD3,
    0xA8E6CF,
    0x74B9FF,
    0xFFD3B6,
    0x95E1D3
];

export function getShapeSize(shapeDef) {
    var maxRow = 0;
    var maxCol = 0;
    var i;

    for (i = 0; i < shapeDef.cells.length; i += 1) {
        if (shapeDef.cells[i][0] > maxRow) {
            maxRow = shapeDef.cells[i][0];
        }

        if (shapeDef.cells[i][1] > maxCol) {
            maxCol = shapeDef.cells[i][1];
        }
    }

    return { rows: maxRow + 1, cols: maxCol + 1 };
}

export function getShapeCentroid(shapeDef) {
    var rowSum = 0;
    var colSum = 0;
    var n = shapeDef.cells.length;
    var i;

    for (i = 0; i < shapeDef.cells.length; i += 1) {
        rowSum += shapeDef.cells[i][0];
        colSum += shapeDef.cells[i][1];
    }

    return { row: rowSum / n, col: colSum / n };
}

export function getRandomShape() {
    var defIndex = Math.floor(Math.random() * SHAPE_DEFINITIONS.length);
    var colorIndex = Math.floor(Math.random() * BLOCK_COLORS.length);

    return {
        def: SHAPE_DEFINITIONS[defIndex],
        color: BLOCK_COLORS[colorIndex],
        colorIndex: colorIndex
    };
}

export function getRandomShapes(count) {
    var shapes = [];
    var i;

    for (i = 0; i < count; i += 1) {
        shapes.push(getRandomShape());
    }

    return shapes;
}
