import * as THREE from 'three';

function roundedRectPath(ctx, x, y, w, h, radius) {
    var r = Math.min(radius, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

var sharedRoundedTexture = null;
var sharedBlockTexture = null;

export function getRoundedRectTexture() {
    if (sharedRoundedTexture) {
        return sharedRoundedTexture;
    }

    var canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    var ctx = canvas.getContext('2d');

    roundedRectPath(ctx, 0, 0, 128, 128, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    sharedRoundedTexture = new THREE.CanvasTexture(canvas);
    sharedRoundedTexture.minFilter = THREE.LinearFilter;
    sharedRoundedTexture.magFilter = THREE.LinearFilter;
    return sharedRoundedTexture;
}

export function getBlockTexture() {
    if (sharedBlockTexture) {
        return sharedBlockTexture;
    }

    var canvas = document.createElement('canvas');
    var size = 128;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    roundedRectPath(ctx, 0, 0, size, size, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    var topGloss = ctx.createLinearGradient(0, 0, 0, size * 0.55);
    topGloss.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    topGloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = topGloss;
    roundedRectPath(ctx, 6, 6, size - 12, size * 0.5, 16);
    ctx.fill();

    var bottomShade = ctx.createLinearGradient(0, size * 0.45, 0, size);
    bottomShade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bottomShade.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = bottomShade;
    roundedRectPath(ctx, 0, 0, size, size, 22);
    ctx.fill();

    sharedBlockTexture = new THREE.CanvasTexture(canvas);
    sharedBlockTexture.minFilter = THREE.LinearFilter;
    sharedBlockTexture.magFilter = THREE.LinearFilter;
    return sharedBlockTexture;
}

export function buildBoard(boardConfig) {
    var group = new THREE.Group();
    var availableWidth = boardConfig.maxWidth - (boardConfig.padding * 2);
    var availableHeight = boardConfig.maxHeight - (boardConfig.padding * 2);
    var cellSizeFromWidth = (availableWidth - ((boardConfig.columns - 1) * boardConfig.gap)) / boardConfig.columns;
    var cellSizeFromHeight = (availableHeight - ((boardConfig.rows - 1) * boardConfig.gap)) / boardConfig.rows;
    var cellSize = Math.min(cellSizeFromWidth, cellSizeFromHeight);
    var cellCenters = [];
    var row;
    var column;

    if (cellSize <= 0) {
        throw new Error('Board config leaves no room for cells. Adjust maxWidth/maxHeight, rows/columns, or gap.');
    }

    var boardWidth = (boardConfig.columns * cellSize) + ((boardConfig.columns - 1) * boardConfig.gap) + (boardConfig.padding * 2);
    var boardHeight = (boardConfig.rows * cellSize) + ((boardConfig.rows - 1) * boardConfig.gap) + (boardConfig.padding * 2);
    var roundedTexture = getRoundedRectTexture();

    var boardMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(boardWidth, boardHeight),
        new THREE.MeshBasicMaterial({
            map: roundedTexture,
            color: new THREE.Color(boardConfig.backgroundColor),
            transparent: true
        })
    );
    boardMesh.position.z = -0.02;
    group.add(boardMesh);

    var cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
    var cellMaterial = new THREE.MeshBasicMaterial({
        map: roundedTexture,
        color: new THREE.Color(boardConfig.cellColor),
        transparent: true
    });
    var startX = (-boardWidth * 0.5) + boardConfig.padding + (cellSize * 0.5);
    var startY = (boardHeight * 0.5) - boardConfig.padding - (cellSize * 0.5);

    for (row = 0; row < boardConfig.rows; row += 1) {
        cellCenters[row] = [];

        for (column = 0; column < boardConfig.columns; column += 1) {
            var cellX = startX + (column * (cellSize + boardConfig.gap));
            var cellY = startY - (row * (cellSize + boardConfig.gap));
            var cell = new THREE.Mesh(cellGeometry, cellMaterial);
            cell.position.set(cellX, cellY, 0.0);
            group.add(cell);
            cellCenters[row][column] = { x: cellX, y: cellY };
        }
    }

    group.position.y = boardConfig.offsetY;
    group.userData.boardMetrics = {
        width: boardWidth,
        height: boardHeight,
        cellSize: cellSize,
        columns: boardConfig.columns,
        rows: boardConfig.rows,
        gap: boardConfig.gap,
        startX: startX,
        startY: startY,
        cellCenters: cellCenters
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
    var localPoint = new THREE.Vector3(center.x, center.y, z);

    board.updateMatrixWorld(true);
    return board.localToWorld(localPoint);
}
