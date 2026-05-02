import * as THREE from 'three';

export function buildBoard(boardConfig) {
    var group = new THREE.Group();
    var availableWidth = boardConfig.maxWidth - (boardConfig.padding * 2);
    var availableHeight = boardConfig.maxHeight - (boardConfig.padding * 2);
    var cellSizeFromWidth = (availableWidth - ((boardConfig.columns - 1) * boardConfig.gap)) / boardConfig.columns;
    var cellSizeFromHeight = (availableHeight - ((boardConfig.rows - 1) * boardConfig.gap)) / boardConfig.rows;
    var cellSize = Math.min(cellSizeFromWidth, cellSizeFromHeight);
    var boardWidth;
    var boardHeight;
    var boardMesh;
    var emptyGeometry;
    var emptyMaterial;
    var startX;
    var startY;
    var cellCenters;
    var row;
    var column;

    if (cellSize <= 0) {
        throw new Error('Board config leaves no room for cells. Adjust maxWidth/maxHeight, rows/columns, or gap.');
    }

    boardWidth = (boardConfig.columns * cellSize) + ((boardConfig.columns - 1) * boardConfig.gap) + (boardConfig.padding * 2);
    boardHeight = (boardConfig.rows * cellSize) + ((boardConfig.rows - 1) * boardConfig.gap) + (boardConfig.padding * 2);

    boardMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(boardWidth, boardHeight),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(boardConfig.backgroundColor) })
    );
    boardMesh.position.z = 0;
    group.add(boardMesh);

    emptyGeometry = new THREE.PlaneGeometry(cellSize * 0.94, cellSize * 0.94);
    emptyMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(boardConfig.cellColor) });

    startX = (-boardWidth * 0.5) + boardConfig.padding + (cellSize * 0.5);
    startY = (boardHeight * 0.5) - boardConfig.padding - (cellSize * 0.5);

    cellCenters = [];

    for (row = 0; row < boardConfig.rows; row += 1) {
        cellCenters[row] = [];

        for (column = 0; column < boardConfig.columns; column += 1) {
            var cellX = startX + (column * (cellSize + boardConfig.gap));
            var cellY = startY - (row * (cellSize + boardConfig.gap));
            var emptyCell = new THREE.Mesh(emptyGeometry, emptyMaterial);

            emptyCell.position.set(cellX, cellY, 0.01);
            group.add(emptyCell);
            cellCenters[row][column] = { x: cellX, y: cellY };
        }
    }

    group.position.set(0, boardConfig.offsetY, 0);

    group.userData.boardMetrics = {
        cellSize: cellSize,
        cellCenters: cellCenters,
        rows: boardConfig.rows,
        columns: boardConfig.columns,
        boardWidth: boardWidth,
        boardHeight: boardHeight
    };

    return group;
}

export function createGrid(rows, columns) {
    var grid = [];
    var row;
    var column;

    for (row = 0; row < rows; row += 1) {
        grid[row] = [];

        for (column = 0; column < columns; column += 1) {
            grid[row][column] = null;
        }
    }

    return grid;
}

export function getCellCenter(boardMetrics, row, column) {
    return boardMetrics.cellCenters[row][column];
}

export function getCellWorldPosition(board, boardMetrics, row, column, z) {
    var center = getCellCenter(boardMetrics, row, column);
    var localPoint = new THREE.Vector3(center.x, center.y, typeof z === 'number' ? z : 0);

    board.updateMatrixWorld(true);
    return board.localToWorld(localPoint);
}

export function canPlaceShape(grid, shapeDef, anchorRow, anchorCol) {
    var rows = grid.length;
    var cols = grid[0].length;
    var i;
    var r;
    var c;

    for (i = 0; i < shapeDef.cells.length; i += 1) {
        r = anchorRow + shapeDef.cells[i][0];
        c = anchorCol + shapeDef.cells[i][1];

        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== null) {
            return false;
        }
    }

    return true;
}

export function getFirstValidPlacement(grid, shapeDef) {
    var rows = grid.length;
    var cols = grid[0].length;
    var r;
    var c;

    for (r = 0; r < rows; r += 1) {
        for (c = 0; c < cols; c += 1) {
            if (canPlaceShape(grid, shapeDef, r, c)) {
                return { row: r, col: c };
            }
        }
    }

    return null;
}

export function hasAnyValidPlacement(grid, shapes) {
    var i;

    for (i = 0; i < shapes.length; i += 1) {
        if (!shapes[i]) {
            continue;
        }

        if (getFirstValidPlacement(grid, shapes[i].def) !== null) {
            return true;
        }
    }

    return false;
}
