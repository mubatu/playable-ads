import * as THREE from 'three';
import { createRoundedRectTexture, getCellCenter } from './Board.js';

var SHAPE_TEMPLATES = [
    [[0, 0]],

    [[0, 0], [0, 1]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],

    [[0, 0], [1, 0]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],

    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],

    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 0], [1, 1], [1, 2]],

    [[0, 1], [1, 1], [2, 0], [2, 1]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],

    [[0, 0], [0, 1], [0, 2], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 0]],
    [[0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 0], [1, 1], [2, 1]],

    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],

    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 1], [1, 0], [1, 1], [2, 0]]
];

var sharedBlockTexture = null;

function getBlockTexture() {
    if (!sharedBlockTexture) {
        sharedBlockTexture = createRoundedRectTexture(64, 10);
    }
    return sharedBlockTexture;
}

export function getShapeBounds(cells) {
    var minRow = Infinity;
    var maxRow = -Infinity;
    var minCol = Infinity;
    var maxCol = -Infinity;
    var i;

    for (i = 0; i < cells.length; i += 1) {
        if (cells[i][0] < minRow) { minRow = cells[i][0]; }
        if (cells[i][0] > maxRow) { maxRow = cells[i][0]; }
        if (cells[i][1] < minCol) { minCol = cells[i][1]; }
        if (cells[i][1] > maxCol) { maxCol = cells[i][1]; }
    }

    return {
        minRow: minRow,
        maxRow: maxRow,
        minCol: minCol,
        maxCol: maxCol,
        rows: maxRow - minRow + 1,
        cols: maxCol - minCol + 1
    };
}

export function getRandomShape(colors) {
    var templateIndex = Math.floor(Math.random() * SHAPE_TEMPLATES.length);
    var colorIndex = Math.floor(Math.random() * colors.length);

    return {
        cells: SHAPE_TEMPLATES[templateIndex].map(function (cell) {
            return [cell[0], cell[1]];
        }),
        color: colors[colorIndex]
    };
}

export function generateShapeSet(count, colors) {
    var shapes = [];
    var i;

    for (i = 0; i < count; i += 1) {
        shapes.push(getRandomShape(colors));
    }

    return shapes;
}

export function createShapeGroup(shape, cellSize, gap, scale) {
    var group = new THREE.Group();
    var bounds = getShapeBounds(shape.cells);
    var step = cellSize + gap;
    var visualSize = cellSize * 0.92;
    var geometry = new THREE.PlaneGeometry(visualSize, visualSize);
    var material = new THREE.MeshBasicMaterial({
        map: getBlockTexture(),
        color: new THREE.Color(shape.color),
        transparent: true
    });
    var centerX = (bounds.cols - 1) * step * 0.5;
    var centerY = (bounds.rows - 1) * step * 0.5;
    var i;
    var row;
    var col;

    for (i = 0; i < shape.cells.length; i += 1) {
        row = shape.cells[i][0];
        col = shape.cells[i][1];
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            col * step - centerX,
            -(row * step - centerY),
            0.1
        );
        mesh.userData.shapeCell = true;
        group.add(mesh);
    }

    group.userData.shape = shape;
    group.userData.bounds = bounds;

    if (typeof scale === 'number') {
        group.scale.setScalar(scale);
    }

    return group;
}

export function canPlaceShape(grid, cells, anchorRow, anchorCol) {
    var rows = grid.length;
    var cols = grid[0].length;
    var i;
    var cellRow;
    var cellCol;

    for (i = 0; i < cells.length; i += 1) {
        cellRow = anchorRow + cells[i][0];
        cellCol = anchorCol + cells[i][1];

        if (cellRow < 0 || cellRow >= rows || cellCol < 0 || cellCol >= cols) {
            return false;
        }

        if (grid[cellRow][cellCol] !== null) {
            return false;
        }
    }

    return true;
}

export function placeShapeOnGrid(state, shape, anchorRow, anchorCol) {
    var cellSize = state.boardMetrics.cellSize;
    var visualSize = cellSize * 0.92;
    var placedMeshes = [];
    var i;
    var cellRow;
    var cellCol;
    var center;
    var mesh;

    for (i = 0; i < shape.cells.length; i += 1) {
        cellRow = anchorRow + shape.cells[i][0];
        cellCol = anchorCol + shape.cells[i][1];
        center = getCellCenter(state.boardMetrics, cellRow, cellCol);

        mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(visualSize, visualSize),
            new THREE.MeshBasicMaterial({
                map: getBlockTexture(),
                color: new THREE.Color(shape.color),
                transparent: true
            })
        );
        mesh.position.set(center.x, center.y, state.config.shapes.baseZ);
        mesh.userData.gridRow = cellRow;
        mesh.userData.gridCol = cellCol;
        mesh.userData.isBlock = true;

        state.piecesGroup.add(mesh);
        state.grid[cellRow][cellCol] = mesh;
        placedMeshes.push(mesh);
    }

    return placedMeshes;
}

export function checkAndClearLines(state) {
    var rows = state.config.board.rows;
    var cols = state.config.board.columns;
    var fullRows = [];
    var fullCols = [];
    var cellsToClear = {};
    var row;
    var col;
    var isFull;
    var key;
    var mesh;
    var clearedCount = 0;

    for (row = 0; row < rows; row += 1) {
        isFull = true;
        for (col = 0; col < cols; col += 1) {
            if (state.grid[row][col] === null) {
                isFull = false;
                break;
            }
        }
        if (isFull) {
            fullRows.push(row);
        }
    }

    for (col = 0; col < cols; col += 1) {
        isFull = true;
        for (row = 0; row < rows; row += 1) {
            if (state.grid[row][col] === null) {
                isFull = false;
                break;
            }
        }
        if (isFull) {
            fullCols.push(col);
        }
    }

    for (var ri = 0; ri < fullRows.length; ri += 1) {
        row = fullRows[ri];
        for (col = 0; col < cols; col += 1) {
            cellsToClear[row + ',' + col] = { row: row, col: col };
        }
    }

    for (var ci = 0; ci < fullCols.length; ci += 1) {
        col = fullCols[ci];
        for (row = 0; row < rows; row += 1) {
            cellsToClear[row + ',' + col] = { row: row, col: col };
        }
    }

    var clearList = [];
    for (key in cellsToClear) {
        if (Object.prototype.hasOwnProperty.call(cellsToClear, key)) {
            clearList.push(cellsToClear[key]);
        }
    }

    for (var k = 0; k < clearList.length; k += 1) {
        row = clearList[k].row;
        col = clearList[k].col;
        mesh = state.grid[row][col];

        if (mesh) {
            state.piecesGroup.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            state.grid[row][col] = null;
            clearedCount += 1;
        }
    }

    var linesCleared = fullRows.length + fullCols.length;

    return {
        linesCleared: linesCleared,
        cellsCleared: clearedCount,
        clearedPositions: clearList
    };
}

export function canShapeFitAnywhere(grid, cells) {
    var rows = grid.length;
    var cols = grid[0].length;
    var row;
    var col;

    for (row = 0; row < rows; row += 1) {
        for (col = 0; col < cols; col += 1) {
            if (canPlaceShape(grid, cells, row, col)) {
                return true;
            }
        }
    }

    return false;
}

export function findFittingShape(grid, colors) {
    var candidates = [];
    var i;

    for (i = 0; i < SHAPE_TEMPLATES.length; i += 1) {
        if (canShapeFitAnywhere(grid, SHAPE_TEMPLATES[i])) {
            candidates.push(SHAPE_TEMPLATES[i]);
        }
    }

    if (candidates.length === 0) {
        return null;
    }

    var template = candidates[Math.floor(Math.random() * candidates.length)];

    return {
        cells: template.map(function (cell) {
            return [cell[0], cell[1]];
        }),
        color: colors[Math.floor(Math.random() * colors.length)]
    };
}

export function ensurePlayableShapeSet(grid, shapes, colors) {
    var hasFit = false;
    var i;
    var fittingShape;

    for (i = 0; i < shapes.length; i += 1) {
        if (canShapeFitAnywhere(grid, shapes[i].cells)) {
            hasFit = true;
            break;
        }
    }

    if (hasFit) {
        return shapes;
    }

    fittingShape = findFittingShape(grid, colors);

    if (fittingShape) {
        shapes[Math.floor(Math.random() * shapes.length)] = fittingShape;
    }

    return shapes;
}

export function canAnySlotFit(grid, spawnSlots) {
    var i;

    for (i = 0; i < spawnSlots.length; i += 1) {
        if (!spawnSlots[i].placed && canShapeFitAnywhere(grid, spawnSlots[i].shape.cells)) {
            return true;
        }
    }

    return false;
}

export function createGhostGroup(boardMetrics) {
    var group = new THREE.Group();
    var maxCells = 9;
    var cellSize = boardMetrics.cellSize;
    var visualSize = cellSize * 0.92;
    var geometry = new THREE.PlaneGeometry(visualSize, visualSize);
    var material = new THREE.MeshBasicMaterial({
        map: getBlockTexture(),
        color: 0xffffff,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
    });
    var i;

    group.userData.ghosts = [];

    for (i = 0; i < maxCells; i += 1) {
        var ghost = new THREE.Mesh(geometry, material);
        ghost.visible = false;
        ghost.position.z = 0.15;
        group.add(ghost);
        group.userData.ghosts.push(ghost);
    }

    return group;
}

export function updateGhostPreview(state, anchorRow, anchorCol, cells) {
    var ghosts = state.ghostGroup.userData.ghosts;
    var i;

    for (i = 0; i < ghosts.length; i += 1) {
        ghosts[i].visible = false;
    }

    if (anchorRow === null || anchorCol === null || !cells) {
        return;
    }

    if (!canPlaceShape(state.grid, cells, anchorRow, anchorCol)) {
        return;
    }

    for (i = 0; i < cells.length && i < ghosts.length; i += 1) {
        var cellRow = anchorRow + cells[i][0];
        var cellCol = anchorCol + cells[i][1];
        var center = getCellCenter(state.boardMetrics, cellRow, cellCol);

        ghosts[i].position.set(center.x, center.y, 0.15);
        ghosts[i].visible = true;
    }
}

export function hideGhosts(state) {
    var ghosts = state.ghostGroup.userData.ghosts;
    var i;

    for (i = 0; i < ghosts.length; i += 1) {
        ghosts[i].visible = false;
    }
}
