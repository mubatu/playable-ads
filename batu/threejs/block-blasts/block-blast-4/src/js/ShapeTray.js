import * as THREE from 'three';
import { getRandomShapes, getShapeCentroid } from './Shapes.js';

var MAX_GHOST_CELLS = 9;

function buildCellGeometry(cellSize) {
    return new THREE.PlaneGeometry(cellSize * 0.90, cellSize * 0.90);
}

function createShapeGroup(shape, cellSize, gap) {
    var group = new THREE.Group();
    var geo = buildCellGeometry(cellSize);
    var centroid = getShapeCentroid(shape.def);
    var step = cellSize + gap;
    var i;
    var cell;
    var mesh;

    for (i = 0; i < shape.def.cells.length; i += 1) {
        cell = shape.def.cells[i];
        mesh = new THREE.Mesh(
            geo,
            new THREE.MeshBasicMaterial({ color: shape.color })
        );
        mesh.position.set(
            (cell[1] - centroid.col) * step,
            -(cell[0] - centroid.row) * step,
            0
        );
        mesh.userData.isShapeCell = true;
        group.add(mesh);
    }

    group.userData.shape = shape;
    group.userData.centroid = centroid;
    group.userData.step = step;
    group.userData.cellSize = cellSize;

    return group;
}

function createSlotBackground(state) {
    var trayConfig = state.config.tray;
    var cellSize = state.boardMetrics.cellSize * trayConfig.scale;
    var slotBgSize = cellSize * 5.5;
    var geo = new THREE.PlaneGeometry(slotBgSize, slotBgSize);
    var mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#232347'),
        transparent: true,
        opacity: 0.55
    });

    return new THREE.Mesh(geo, mat);
}

export function buildTray(state) {
    var trayConfig = state.config.tray;
    var blocksConfig = state.config.blocks;
    var cellSize = state.boardMetrics.cellSize * trayConfig.scale;
    var gap = cellSize * 0.10;
    var shapes = getRandomShapes(3);
    var i;
    var shape;
    var group;
    var slotX;
    var bgMesh;

    state.traySlots = [];
    state.trayCellSize = cellSize;
    state.trayGap = gap;

    for (i = 0; i < 3; i += 1) {
        slotX = (i - 1) * trayConfig.slotSpacing;
        shape = shapes[i];
        group = createShapeGroup(shape, cellSize, gap);
        group.position.set(slotX, trayConfig.offsetY, blocksConfig.baseZ);

        bgMesh = createSlotBackground(state);
        bgMesh.position.set(slotX, trayConfig.offsetY, blocksConfig.baseZ - 0.05);
        state.scene.add(bgMesh);

        state.scene.add(group);

        state.traySlots.push({
            group: group,
            shape: shape,
            bgMesh: bgMesh,
            originalX: slotX,
            originalY: trayConfig.offsetY,
            cellSize: cellSize,
            gap: gap
        });
    }

    buildGhostMeshes(state);
}

function buildGhostMeshes(state) {
    var boardMetrics = state.boardMetrics;
    var ghostGeo = new THREE.PlaneGeometry(boardMetrics.cellSize * 0.90, boardMetrics.cellSize * 0.90);
    var i;
    var mesh;

    state.ghostMeshes = [];

    for (i = 0; i < MAX_GHOST_CELLS; i += 1) {
        mesh = new THREE.Mesh(
            ghostGeo,
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: state.config.blocks.ghostOpacity,
                depthWrite: false
            })
        );
        mesh.visible = false;
        mesh.position.z = state.config.blocks.dragZ - 0.3;
        state.scene.add(mesh);
        state.ghostMeshes.push(mesh);
    }
}

export function clearGhost(state) {
    var i;

    for (i = 0; i < state.ghostMeshes.length; i += 1) {
        state.ghostMeshes[i].visible = false;
    }
}

export function updateGhost(state, shapeDef, anchorRow, anchorCol, color, valid) {
    var i;
    var cell;
    var r;
    var c;
    var worldPos;

    clearGhost(state);

    for (i = 0; i < shapeDef.cells.length; i += 1) {
        cell = shapeDef.cells[i];
        r = anchorRow + cell[0];
        c = anchorCol + cell[1];

        if (r < 0 || r >= state.boardMetrics.rows || c < 0 || c >= state.boardMetrics.columns) {
            continue;
        }

        if (i >= state.ghostMeshes.length) {
            break;
        }

        worldPos = getCellWorldPositionFromState(state, r, c);
        state.ghostMeshes[i].position.set(worldPos.x, worldPos.y, state.config.blocks.dragZ - 0.3);
        state.ghostMeshes[i].material.color.setHex(color);
        state.ghostMeshes[i].material.opacity = valid ? state.config.blocks.ghostOpacity : 0.20;
        state.ghostMeshes[i].visible = true;
    }
}

function getCellWorldPositionFromState(state, row, col) {
    var center = state.boardMetrics.cellCenters[row][col];
    var localPoint = new THREE.Vector3(center.x, center.y, 0);

    state.board.updateMatrixWorld(true);
    return state.board.localToWorld(localPoint);
}

export function clearTraySlot(state, slotIndex) {
    var slot = state.traySlots[slotIndex];

    if (slot.group) {
        state.scene.remove(slot.group);
        slot.group = null;
    }

    slot.shape = null;
}

export function refillAllSlots(state) {
    var shapes = getRandomShapes(3);
    var trayConfig = state.config.tray;
    var blocksConfig = state.config.blocks;
    var i;
    var slot;
    var group;

    for (i = 0; i < 3; i += 1) {
        slot = state.traySlots[i];

        if (slot.group) {
            state.scene.remove(slot.group);
        }

        slot.shape = shapes[i];
        group = createShapeGroup(shapes[i], slot.cellSize, slot.gap);
        group.position.set(slot.originalX, slot.originalY, blocksConfig.baseZ);
        state.scene.add(group);
        slot.group = group;
    }
}

export function getTrayShapeMeshes(state) {
    var meshes = [];
    var i;
    var slot;
    var j;
    var child;

    for (i = 0; i < state.traySlots.length; i += 1) {
        slot = state.traySlots[i];

        if (!slot.group || !slot.shape) {
            continue;
        }

        for (j = 0; j < slot.group.children.length; j += 1) {
            child = slot.group.children[j];

            if (child.userData.isShapeCell) {
                child.userData.slotIndex = i;
                meshes.push(child);
            }
        }
    }

    return meshes;
}

export function returnSlotToTray(state, slotIndex) {
    var slot = state.traySlots[slotIndex];

    if (slot.group) {
        slot.group.position.set(slot.originalX, slot.originalY, state.config.blocks.baseZ);
    }
}
