import * as THREE from 'three';

export function createBoard(state) {
    var boardGroup = new THREE.Group();
    var cols = state.config.board.columns;
    var rows = state.config.board.rows;
    var tileSize = state.config.board.tileSize;
    var gap = state.config.board.gap;
    var offsetY = state.config.board.offsetY;

    var totalWidth = cols * tileSize + (cols - 1) * gap;
    var totalHeight = rows * tileSize + (rows - 1) * gap;
    var startX = -totalWidth / 2 + tileSize / 2;
    var startY = -totalHeight / 2 + tileSize / 2;

    boardGroup.position.y = offsetY;
    
    state.boardGroup = boardGroup;

    // Load textures
    var textureLoader = new THREE.TextureLoader();
    var materials = {};
    state.config.gameplay.tileColors.forEach(color => {
        var tex = textureLoader.load(`src/assets/${color}.png`);
        tex.colorSpace = THREE.SRGBColorSpace;
        materials[color] = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    });
    
    state.materials = materials;

    // Create outline material
    var outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
            var cell = state.grid[c][r];
            var mesh = new THREE.Mesh(new THREE.PlaneGeometry(tileSize, tileSize), materials[cell.color]);
            
            var posX = startX + c * (tileSize + gap);
            var posY = startY + r * (tileSize + gap);
            
            mesh.position.set(posX, posY, 0);
            mesh.userData = { col: c, row: r };
            boardGroup.add(mesh);
            cell.mesh = mesh;
            
            // Add outline mesh to each tile, but hidden
            var outlineSize = tileSize * 1.1; // 10% larger
            var outlineMesh = new THREE.Mesh(new THREE.PlaneGeometry(outlineSize, outlineSize), outlineMaterial);
            outlineMesh.position.z = -0.01; // Slightly behind
            outlineMesh.visible = false;
            mesh.add(outlineMesh);
            cell.outlineMesh = outlineMesh;
        }
    }

    updateOutlines(state);
    
    return boardGroup;
}

export function updateOutlines(state) {
    var cols = state.config.board.columns;
    var rows = state.config.board.rows;
    
    for (var c = 0; c < cols; c++) {
        var foundAvailable = false;
        for (var r = 0; r < rows; r++) {
            var cell = state.grid[c][r];
            if (cell && cell.mesh) {
                if (!foundAvailable) {
                    cell.outlineMesh.visible = true;
                    foundAvailable = true;
                } else {
                    cell.outlineMesh.visible = false;
                }
            }
        }
    }
}
