const Grid = (function () {
    'use strict';

    const COLS = 8;
    const ROWS = 8;
    const CELL_SIZE = 1.0;  // world-units per cell (slight gap between cubes)

    const CUBE_TYPES = ['red', 'blue', 'green', 'yellow'];
    const FRAME_PADDING = 0.15;
    const FRAME_THICKNESS = 0.01;

    // 2D array: cells[row][col] = { type: string, mesh: THREE.Mesh } | null
    let cells = [];
    let frameGroup = null;

    // Texture cache so we load each PNG only once
    const textureCache = {};
    const loader = new THREE.TextureLoader();

    function loadTexture(color) {
        if (!textureCache[color]) {
            const tex = loader.load('assets/' + color + '_cube.png');
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            if (THREE.SRGBColorSpace) {
                tex.colorSpace = THREE.SRGBColorSpace;
            }
            textureCache[color] = tex;
        }
        return textureCache[color];
    }

    // Convert grid indices to world position (grid centered at origin)
    function gridToWorld(row, col) {
        const offsetX = -(COLS - 1) * CELL_SIZE / 2;
        const offsetY = -(ROWS - 1) * CELL_SIZE / 2;
        return {
            x: col * CELL_SIZE + offsetX,
            y: row * CELL_SIZE + offsetY
        };
    }

    function buildFrameShape(outerW, outerH, innerW, innerH) {
        const shape = new THREE.Shape();
        const ox = outerW / 2;
        const oy = outerH / 2;
        const ix = innerW / 2;
        const iy = innerH / 2;

        shape.moveTo(-ox, -oy);
        shape.lineTo(ox, -oy);
        shape.lineTo(ox, oy);
        shape.lineTo(-ox, oy);
        shape.lineTo(-ox, -oy);

        const hole = new THREE.Path();
        hole.moveTo(-ix, -iy);
        hole.lineTo(-ix, iy);
        hole.lineTo(ix, iy);
        hole.lineTo(ix, -iy);
        hole.lineTo(-ix, -iy);
        shape.holes.push(hole);

        return shape;
    }

    function clearFrame() {
        if (!frameGroup) return;
        GameScene.scene.remove(frameGroup);
        frameGroup.traverse(function (obj) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        frameGroup = null;
    }

    function createFrame() {
        clearFrame();

        const gridWidth = COLS * CELL_SIZE;
        const gridHeight = ROWS * CELL_SIZE;

        const outerW = gridWidth + FRAME_PADDING * 2;
        const outerH = gridHeight + FRAME_PADDING * 2;
        const innerW = gridWidth + 0.03;
        const innerH = gridHeight + 0.03;

        frameGroup = new THREE.Group();

        const backplateGeo = new THREE.PlaneGeometry(outerW, outerH);
        const backplateMat = new THREE.MeshBasicMaterial({
            color: 0x6f66b6
        });
        const backplate = new THREE.Mesh(backplateGeo, backplateMat);
        backplate.position.z = -0.15;
        frameGroup.add(backplate);

        const borderShape = buildFrameShape(outerW, outerH, innerW, innerH);
        const borderGeo = new THREE.ShapeGeometry(borderShape);
        const borderMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.30,
            side: THREE.DoubleSide
        });
        const borderMesh = new THREE.Mesh(borderGeo, borderMat);
        borderMesh.position.z = -0.02;
        frameGroup.add(borderMesh);

        const innerLinePoints = [
            new THREE.Vector3(-innerW / 2, -innerH / 2, 0.04),
            new THREE.Vector3(innerW / 2, -innerH / 2, 0.04),
            new THREE.Vector3(innerW / 2, innerH / 2, 0.04),
            new THREE.Vector3(-innerW / 2, innerH / 2, 0.04)
        ];
        const innerLineGeo = new THREE.BufferGeometry().setFromPoints(innerLinePoints);
        const innerLineMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.45
        });
        const innerOutline = new THREE.LineLoop(innerLineGeo, innerLineMat);
        frameGroup.add(innerOutline);

        const outerLineW = outerW - FRAME_THICKNESS * 0.35;
        const outerLineH = outerH - FRAME_THICKNESS * 0.35;
        const outerLinePoints = [
            new THREE.Vector3(-outerLineW / 2, -outerLineH / 2, 0.03),
            new THREE.Vector3(outerLineW / 2, -outerLineH / 2, 0.03),
            new THREE.Vector3(outerLineW / 2, outerLineH / 2, 0.03),
            new THREE.Vector3(-outerLineW / 2, outerLineH / 2, 0.03)
        ];
        const outerLineGeo = new THREE.BufferGeometry().setFromPoints(outerLinePoints);
        const outerLineMat = new THREE.LineBasicMaterial({
            color: 0x504f6b,
            transparent: true,
            opacity: 0.95
        });
        const outerOutline = new THREE.LineLoop(outerLineGeo, outerLineMat);
        frameGroup.add(outerOutline);

        GameScene.scene.add(frameGroup);
    }

    // Convert world position to grid indices (returns null if outside grid)
    function worldToGrid(x, y) {
        const offsetX = -(COLS - 1) * CELL_SIZE / 2;
        const offsetY = -(ROWS - 1) * CELL_SIZE / 2;

        const col = Math.round((x - offsetX) / CELL_SIZE);
        const row = Math.round((y - offsetY) / CELL_SIZE);

        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
        return { row: row, col: col };
    }

    // Create a single cube mesh
    function createCubeMesh(type, row, col) {
        const tex = loadTexture(type);
        const geometry = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE); // Adjusted from CELL_SIZE * 0.9 to CELL_SIZE
        const material = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            alphaTest: 0.5,
            depthWrite: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        const pos = gridToWorld(row, col);
        mesh.position.set(pos.x, pos.y, 0);

        // Store grid coords on the mesh for easy lookup on raycast hit
        mesh.userData.row = row;
        mesh.userData.col = col;

        return mesh;
    }

    // Initialize the grid with random cubes
    function init() {
        createFrame();
        cells = [];
        for (let r = 0; r < ROWS; r++) {
            cells[r] = [];
            for (let c = 0; c < COLS; c++) {
                const type = CUBE_TYPES[Math.floor(Math.random() * CUBE_TYPES.length)];
                const mesh = createCubeMesh(type, r, c);
                GameScene.scene.add(mesh);
                cells[r][c] = { type: type, mesh: mesh };
            }
        }
    }

    function getCell(row, col) {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
        return cells[row][col];
    }

    // Remove a list of { row, col } entries from the grid
    function removeCells(cellList) {
        for (let i = 0; i < cellList.length; i++) {
            const r = cellList[i].row;
            const c = cellList[i].col;
            const cell = cells[r][c];
            if (cell) {
                GameScene.scene.remove(cell.mesh);
                cell.mesh.geometry.dispose();
                cell.mesh.material.dispose();
                cells[r][c] = null;
            }
        }
    }

    // Collect all meshes currently on the grid (for raycasting)
    function getAllMeshes() {
        const meshes = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (cells[r][c]) {
                    meshes.push(cells[r][c].mesh);
                }
            }
        }
        return meshes;
    }

    return {
        COLS: COLS,
        ROWS: ROWS,
        CELL_SIZE: CELL_SIZE,
        init: init,
        getCell: getCell,
        removeCells: removeCells,
        worldToGrid: worldToGrid,
        gridToWorld: gridToWorld,
        getAllMeshes: getAllMeshes
    };
})();
