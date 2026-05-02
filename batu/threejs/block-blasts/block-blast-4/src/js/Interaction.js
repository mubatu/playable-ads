import * as THREE from 'three';
import { canPlaceShape, hasAnyValidPlacement } from './Board.js';
import { getShapeCentroid } from './Shapes.js';
import { clearGhost, updateGhost, clearTraySlot, refillAllSlots, returnSlotToTray, getTrayShapeMeshes } from './ShapeTray.js';
import { checkAndClearLines } from './LineClear.js';
import { showGameOver } from './Hud.js';
import { dismissTutorial } from './Tutorial.js';

var dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

function getPointerWorldPos(event, state) {
    var rect = state.renderer.domElement.getBoundingClientRect();
    var pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
    var worldPoint = new THREE.Vector3();

    state.raycaster.setFromCamera(pointer, state.camera);

    if (!state.raycaster.ray.intersectPlane(dragPlane, worldPoint)) {
        return null;
    }

    return worldPoint;
}

function worldToBoardLocal(state, worldX, worldY) {
    state.board.updateMatrixWorld(true);
    return state.board.worldToLocal(new THREE.Vector3(worldX, worldY, 0));
}

function findNearestGridCell(state, localX, localY) {
    var metrics = state.boardMetrics;
    var bestRow = 0;
    var bestCol = 0;
    var bestDist = Infinity;
    var r;
    var c;
    var center;
    var dx;
    var dy;
    var dist;

    for (r = 0; r < metrics.rows; r += 1) {
        for (c = 0; c < metrics.columns; c += 1) {
            center = metrics.cellCenters[r][c];
            dx = localX - center.x;
            dy = localY - center.y;
            dist = (dx * dx) + (dy * dy);

            if (dist < bestDist) {
                bestDist = dist;
                bestRow = r;
                bestCol = c;
            }
        }
    }

    return { row: bestRow, col: bestCol };
}

function getSnapAnchor(state, group, shapeDef) {
    var centroid = getShapeCentroid(shapeDef);
    // group.position is already the visual centroid of the shape
    var boardLocal = worldToBoardLocal(state, group.position.x, group.position.y);
    var nearest = findNearestGridCell(state, boardLocal.x, boardLocal.y);

    return {
        row: Math.round(nearest.row - centroid.row),
        col: Math.round(nearest.col - centroid.col)
    };
}


function placeShapeOnBoard(state, shapeDef, anchorRow, anchorCol, color) {
    var cellSize = state.boardMetrics.cellSize;
    var geo = new THREE.PlaneGeometry(cellSize * 0.90, cellSize * 0.90);
    var i;
    var cell;
    var r;
    var c;
    var center;
    var mesh;

    for (i = 0; i < shapeDef.cells.length; i += 1) {
        cell = shapeDef.cells[i];
        r = anchorRow + cell[0];
        c = anchorCol + cell[1];
        center = state.boardMetrics.cellCenters[r][c];

        mesh = new THREE.Mesh(
            geo,
            new THREE.MeshBasicMaterial({ color: color })
        );
        mesh.position.set(center.x, center.y, state.config.blocks.baseZ);
        state.boardCells.add(mesh);
        state.grid[r][c] = mesh;
    }
}

function afterPlacement(state, slotIndex) {
    var trayShapes;
    var allEmpty;

    clearTraySlot(state, slotIndex);
    checkAndClearLines(state);

    trayShapes = state.traySlots.map(function (s) { return s.shape; });
    allEmpty = trayShapes.every(function (s) { return s === null; });

    if (allEmpty) {
        refillAllSlots(state);
    }

    if (!hasAnyValidPlacement(state.grid, state.traySlots.map(function (s) { return s.shape; }))) {
        state.gameOver = true;
        showGameOver(state);
    }
}

function onPointerDown(event, state) {
    var worldPos;
    var pointer;
    var rect;
    var intersections;
    var hit;
    var slotIndex;
    var slot;
    var shapeMeshes;

    if (state.drag || state.gameOver) {
        return;
    }

    dismissTutorial(state);

    worldPos = getPointerWorldPos(event, state);

    if (!worldPos) {
        return;
    }

    rect = state.renderer.domElement.getBoundingClientRect();
    pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );

    state.raycaster.setFromCamera(pointer, state.camera);

    shapeMeshes = getTrayShapeMeshes(state);
    intersections = state.raycaster.intersectObjects(shapeMeshes, false);

    if (!intersections.length) {
        return;
    }

    hit = intersections[0].object;
    slotIndex = hit.userData.slotIndex;
    slot = state.traySlots[slotIndex];

    if (!slot || !slot.shape) {
        return;
    }

    state.drag = {
        slotIndex: slotIndex,
        shape: slot.shape,
        offsetX: worldPos.x - slot.group.position.x,
        offsetY: worldPos.y - slot.group.position.y,
        pointerId: event.pointerId,
        lastAnchor: null,
        lastValid: false
    };

    slot.group.position.z = state.config.blocks.dragZ;

    if (state.renderer.domElement.setPointerCapture) {
        state.renderer.domElement.setPointerCapture(event.pointerId);
    }
}

function onPointerMove(event, state) {
    var worldPos;
    var slot;
    var anchor;
    var valid;

    if (!state.drag || event.pointerId !== state.drag.pointerId) {
        return;
    }

    worldPos = getPointerWorldPos(event, state);

    if (!worldPos) {
        return;
    }

    slot = state.traySlots[state.drag.slotIndex];
    slot.group.position.x = worldPos.x - state.drag.offsetX;
    slot.group.position.y = worldPos.y - state.drag.offsetY + state.config.blocks.dragOffsetY;
    slot.group.position.z = state.config.blocks.dragZ;

    anchor = getSnapAnchor(state, slot.group, state.drag.shape.def);
    valid = canPlaceShape(state.grid, state.drag.shape.def, anchor.row, anchor.col);

    state.drag.lastAnchor = anchor;
    state.drag.lastValid = valid;

    updateGhost(state, state.drag.shape.def, anchor.row, anchor.col, state.drag.shape.color, valid);
}

function onPointerUp(event, state) {
    var slot;
    var anchor;

    if (!state.drag || event.pointerId !== state.drag.pointerId) {
        return;
    }

    clearGhost(state);

    slot = state.traySlots[state.drag.slotIndex];
    anchor = state.drag.lastAnchor;

    if (anchor && state.drag.lastValid) {
        placeShapeOnBoard(state, state.drag.shape.def, anchor.row, anchor.col, state.drag.shape.color);
        afterPlacement(state, state.drag.slotIndex);
    } else {
        returnSlotToTray(state, state.drag.slotIndex);
    }

    if (slot && slot.group) {
        slot.group.position.z = state.config.blocks.baseZ;
    }

    if (state.renderer.domElement.releasePointerCapture) {
        try {
            state.renderer.domElement.releasePointerCapture(event.pointerId);
        } catch (e) { /* ignore */ }
    }

    state.drag = null;
}

export function bindInteractions(state) {
    var canvas = state.renderer.domElement;

    canvas.addEventListener('pointerdown', function (event) {
        onPointerDown(event, state);
    });

    canvas.addEventListener('pointermove', function (event) {
        onPointerMove(event, state);
    });

    canvas.addEventListener('pointerup', function (event) {
        onPointerUp(event, state);
    });

    canvas.addEventListener('pointercancel', function (event) {
        onPointerUp(event, state);
    });

    window.addEventListener('pointerup', function (event) {
        onPointerUp(event, state);
    });

    window.addEventListener('pointercancel', function (event) {
        onPointerUp(event, state);
    });
}
