import * as THREE from 'three';

var SHAPE_DEFS = [
    // 1x1 point
    [[1]],
    // 2x2 square
    [[1, 1],
     [1, 1]],
    // 3x3 L
    [[1, 0, 0],
     [1, 0, 0],
     [1, 1, 1]],
    // 3x3 L flipped
    [[0, 0, 1],
     [0, 0, 1],
     [1, 1, 1]],
    // 3x1 line horizontal
    [[1, 1, 1]],
    // 1x3 line vertical
    [[1],
     [1],
     [1]],
    // 4x1 line horizontal
    [[1, 1, 1, 1]],
    // 1x4 line vertical
    [[1],
     [1],
     [1],
     [1]],
    // 3x3 cross
    [[0, 1, 0],
     [1, 1, 1],
     [0, 1, 0]]
];

export function createShapeMaterials(colors) {
    var materials = [];
    
    for (var i = 0; i < colors.length; i++) {
        materials.push(new THREE.MeshBasicMaterial({
            color: new THREE.Color(colors[i])
        }));
    }
    
    return materials;
}

export function createShapeGroup(state, defIndex) {
    var def = SHAPE_DEFS[defIndex];
    var group = new THREE.Group();
    var colorIndex = Math.floor(Math.random() * state.shapeMaterials.length);
    var material = state.shapeMaterials[colorIndex];
    var cellSize = state.boardMetrics.cellSize;
    var gap = state.config.board.gap;
    var geometry = new THREE.PlaneGeometry(cellSize * state.config.shapes.scale, cellSize * state.config.shapes.scale);
    
    group.userData = {
        isShape: true,
        def: def,
        colorIndex: colorIndex,
        blocks: []
    };

    var rows = def.length;
    var cols = def[0].length;
    var width = cols * cellSize + (cols - 1) * gap;
    var height = rows * cellSize + (rows - 1) * gap;
    var offsetX = -width / 2 + cellSize / 2;
    var offsetY = height / 2 - cellSize / 2;

    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            if (def[r][c] === 1) {
                var block = new THREE.Mesh(geometry, material);
                block.position.x = offsetX + c * (cellSize + gap);
                block.position.y = offsetY - r * (cellSize + gap);
                group.add(block);
                group.userData.blocks.push({
                    r: r,
                    c: c,
                    mesh: block
                });
            }
        }
    }

    return group;
}

export function populateShapes(state) {
    var count = 3;
    var spacing = state.config.shapes.dockSpacing;
    var startX = -((count - 1) * spacing) / 2;

    for (var i = 0; i < count; i++) {
        var defIndex = Math.floor(Math.random() * SHAPE_DEFS.length);
        var shapeGroup = createShapeGroup(state, defIndex);
        
        shapeGroup.position.set(startX + i * spacing, state.config.shapes.dockY, state.config.shapes.baseZ);
        shapeGroup.scale.setScalar(state.config.shapes.dockScale);
        
        shapeGroup.userData.dockPosition = shapeGroup.position.clone();
        shapeGroup.userData.dockScale = state.config.shapes.dockScale;
        shapeGroup.userData.isDocked = true;
        
        state.dockedShapes.push(shapeGroup);
        state.shapesGroup.add(shapeGroup);
    }
}
