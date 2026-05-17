import THREE from 'three';

export var DIRECTIONS = {
    up: { row: -1, col: 0, angle: 0 },
    right: { row: 0, col: 1, angle: -Math.PI * 0.5 },
    down: { row: 1, col: 0, angle: Math.PI },
    left: { row: 0, col: -1, angle: Math.PI * 0.5 }
};

export function cellKey(row, col) {
    return row + ':' + col;
}

export function isInsideGrid(metrics, coord) {
    return coord.row >= 0 && coord.row < metrics.rows && coord.col >= 0 && coord.col < metrics.cols;
}

export function buildBoardMetrics(config, level) {
    var rows = level.grid.rows || config.grid.rows;
    var cols = level.grid.cols || config.grid.cols;
    var spacing = config.grid.cellSize + config.grid.cellGap;
    var width = (cols - 1) * spacing + config.grid.cellSize;
    var height = (rows - 1) * spacing + config.grid.cellSize;

    return {
        rows: rows,
        cols: cols,
        cellSize: config.grid.cellSize,
        cellGap: config.grid.cellGap,
        cellHeight: config.grid.cellHeight,
        spacing: spacing,
        width: width,
        height: height,
        offsetY: config.camera.boardYOffset || 0
    };
}

export function gridToWorld(metrics, row, col) {
    return new THREE.Vector3(
        (col - (metrics.cols - 1) * 0.5) * metrics.spacing,
        ((metrics.rows - 1) * 0.5 - row) * metrics.spacing + metrics.offsetY,
        0.18
    );
}

export function getColorValue(config, colorKey) {
    return config.colors[colorKey] || 0xffffff;
}

function createTriangleMarker(size, angle) {
    var geometry = new THREE.BufferGeometry();
    var half = size * 0.42;
    var nose = size * 0.46;
    var tail = -size * 0.32;

    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
        0, nose, 0,
        -half, tail, 0,
        half, tail, 0
    ], 3));
    geometry.computeVertexNormals();

    var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    var marker = new THREE.Mesh(geometry, material);
    marker.rotation.z = angle;
    marker.position.z = 0.18;
    return marker;
}

export function createCellVisual(state, arrow, coord, isHead) {
    var config = state.config;
    var metrics = state.boardMetrics;
    var group = new THREE.Group();
    var color = getColorValue(config, arrow.color);
    var geometry = new THREE.BoxGeometry(metrics.cellSize, metrics.cellSize, metrics.cellHeight);
    var material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.48,
        metalness: 0.05
    });
    var box = new THREE.Mesh(geometry, material);
    var direction = DIRECTIONS[arrow.direction];

    box.position.z = 0;
    box.userData.arrowId = arrow.id;
    box.userData.cellKey = cellKey(coord.row, coord.col);
    group.add(box);

    if (isHead && direction) {
        group.add(createTriangleMarker(metrics.cellSize, direction.angle));
    }

    group.position.copy(gridToWorld(metrics, coord.row, coord.col));
    group.userData.arrowId = arrow.id;
    group.userData.color = arrow.color;

    return {
        id: arrow.id + '_' + coord.row + '_' + coord.col,
        arrowId: arrow.id,
        color: arrow.color,
        coord: { row: coord.row, col: coord.col },
        group: group,
        box: box,
        status: 'grid',
        targetSlotIndex: null
    };
}

export function createGridBase(state) {
    var config = state.config;
    var metrics = state.boardMetrics;
    var group = new THREE.Group();
    var baseMaterial = new THREE.MeshBasicMaterial({
        color: config.colors.gridBase,
        transparent: true,
        opacity: 0.38
    });
    var cellGeometry = new THREE.BoxGeometry(metrics.cellSize, metrics.cellSize, 0.08);
    var row;
    var col;
    var tile;

    for (row = 0; row < metrics.rows; row += 1) {
        for (col = 0; col < metrics.cols; col += 1) {
            tile = new THREE.Mesh(cellGeometry, baseMaterial);
            tile.position.copy(gridToWorld(metrics, row, col));
            tile.position.z = -0.08;
            group.add(tile);
        }
    }

    return group;
}

export function createTextPlane(text, options) {
    var canvas = document.createElement('canvas');
    var width = options.width || 256;
    var height = options.height || 128;
    var fontSize = options.fontSize || 72;
    var texture;
    var material;
    var mesh;
    var ctx;

    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = options.background || 'rgba(0,0,0,0)';
    if (options.background) {
        ctx.fillRect(0, 0, width, height);
    }
    ctx.font = '800 ' + fontSize + 'px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = options.color || '#ffffff';
    ctx.strokeStyle = options.stroke || 'rgba(0,0,0,0.32)';
    ctx.lineWidth = options.strokeWidth || 8;
    ctx.strokeText(String(text), width * 0.5, height * 0.52);
    ctx.fillText(String(text), width * 0.5, height * 0.52);

    texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(options.worldWidth || 0.8, options.worldHeight || 0.42), material);
    mesh.userData.texture = texture;
    return mesh;
}
