import * as THREE from 'three';
import {
    getShapeBounds,
    canPlaceShape,
    placeShapeOnGrid,
    checkAndClearLines,
    canAnySlotFit,
    createShapeGroup,
    generateShapeSet,
    updateGhostPreview,
    hideGhosts
} from './Shapes.js';
import { emitClearParticles, emitPlaceTap, startScreenShake } from './ParticleFX.js';
import { addScore, showGameOver } from './Hud.js';
import { dismissTutorial } from './Tutorial.js';

var dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

function getWorldPoint(event, state) {
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

function worldToBoardLocal(worldPoint, state) {
    if (!worldPoint) {
        return null;
    }

    state.board.updateMatrixWorld(true);
    return state.board.worldToLocal(worldPoint.clone());
}

function findAnchorCell(state, localX, localY, cells) {
    var bounds = getShapeBounds(cells);
    var step = state.boardMetrics.cellSize + state.boardMetrics.gap;
    var startX = state.boardMetrics.startX;
    var startY = state.boardMetrics.startY;
    var centerRowOffset = (bounds.rows - 1) / 2;
    var centerColOffset = (bounds.cols - 1) / 2;
    var continuousCol = (localX - startX) / step;
    var continuousRow = (startY - localY) / step;
    var anchorRow = Math.round(continuousRow - centerRowOffset);
    var anchorCol = Math.round(continuousCol - centerColOffset);

    return { row: anchorRow, col: anchorCol };
}

function findHitSpawnSlot(event, state) {
    var rect = state.renderer.domElement.getBoundingClientRect();
    var pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
    var meshes = [];
    var i;
    var slot;

    state.raycaster.setFromCamera(pointer, state.camera);

    for (i = 0; i < state.spawnSlots.length; i += 1) {
        slot = state.spawnSlots[i];
        if (!slot.placed && slot.group) {
            meshes = meshes.concat(slot.group.children.filter(function (child) {
                return child.isMesh;
            }));
        }
    }

    if (meshes.length === 0) {
        return -1;
    }

    var intersections = state.raycaster.intersectObjects(meshes, false);

    if (intersections.length === 0) {
        return -1;
    }

    var parent = intersections[0].object.parent;

    for (i = 0; i < state.spawnSlots.length; i += 1) {
        if (state.spawnSlots[i].group === parent) {
            return i;
        }
    }

    return -1;
}

function createDragGroup(state, slotIndex) {
    var slot = state.spawnSlots[slotIndex];
    var group = createShapeGroup(slot.shape, state.boardMetrics.cellSize, state.boardMetrics.gap, 1);

    group.position.z = state.config.shapes.dragZ;
    state.sceneManager.addObject(group);
    return group;
}

function onPointerDown(event, state) {
    if (state.drag || state.gameOver) {
        return;
    }

    var slotIndex = findHitSpawnSlot(event, state);

    if (slotIndex < 0) {
        return;
    }

    var slot = state.spawnSlots[slotIndex];
    var worldPoint = getWorldPoint(event, state);

    if (!worldPoint) {
        return;
    }

    dismissTutorial(state);

    var dragGroup = createDragGroup(state, slotIndex);
    dragGroup.position.set(
        worldPoint.x,
        worldPoint.y + state.config.shapes.dragOffsetY,
        state.config.shapes.dragZ
    );

    slot.group.visible = false;

    state.drag = {
        slotIndex: slotIndex,
        shape: slot.shape,
        group: dragGroup,
        currentAnchor: null,
        pointerId: event.pointerId
    };

    if (state.renderer.domElement.setPointerCapture) {
        state.renderer.domElement.setPointerCapture(event.pointerId);
    }

    state.renderer.domElement.style.cursor = 'grabbing';
}

function onPointerMove(event, state) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) {
        return;
    }

    var worldPoint = getWorldPoint(event, state);

    if (!worldPoint) {
        return;
    }

    state.drag.group.position.set(
        worldPoint.x,
        worldPoint.y + state.config.shapes.dragOffsetY,
        state.config.shapes.dragZ
    );

    var localPoint = worldToBoardLocal(
        new THREE.Vector3(worldPoint.x, worldPoint.y + state.config.shapes.dragOffsetY, 0),
        state
    );

    if (!localPoint) {
        hideGhosts(state);
        state.drag.currentAnchor = null;
        return;
    }

    var anchor = findAnchorCell(state, localPoint.x, localPoint.y, state.drag.shape.cells);

    if (canPlaceShape(state.grid, state.drag.shape.cells, anchor.row, anchor.col)) {
        updateGhostPreview(state, anchor.row, anchor.col, state.drag.shape.cells, state.drag.shape.color);
        state.drag.currentAnchor = anchor;
    } else {
        hideGhosts(state);
        state.drag.currentAnchor = null;
    }
}

function allSlotsPlaced(state) {
    var i;

    for (i = 0; i < state.spawnSlots.length; i += 1) {
        if (!state.spawnSlots[i].placed) {
            return false;
        }
    }

    return true;
}

function finishDrag(event, state) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) {
        return;
    }

    hideGhosts(state);

    var slot = state.spawnSlots[state.drag.slotIndex];
    var anchor = state.drag.currentAnchor;
    var dragGroup = state.drag.group;
    var shape = state.drag.shape;

    state.sceneManager.removeObject(dragGroup);

    var placed = false;

    if (anchor && canPlaceShape(state.grid, shape.cells, anchor.row, anchor.col)) {
        placeShapeOnGrid(state, shape, anchor.row, anchor.col);
        slot.placed = true;
        placed = true;

        var basePoints = shape.cells.length * state.config.scoring.cellPoints;
        var clearResult = checkAndClearLines(state);
        var bonusPoints = 0;
        var lineCount = clearResult.linesCleared;

        if (lineCount > 0) {
            bonusPoints = lineCount * state.config.scoring.lineBonus * state.config.board.columns;

            if (lineCount > 1) {
                bonusPoints += (lineCount - 1) * state.config.scoring.comboBonus * state.config.board.columns;
            }

            emitClearParticles(state, clearResult.clearedPositions, shape.color);
            startScreenShake(state, 0.18 + lineCount * 0.06, 0.32 + lineCount * 0.05);
        } else {
            emitPlaceTap(state, anchor.row, anchor.col, shape.color);
        }

        addScore(state, basePoints + bonusPoints, lineCount);

        state.linesCleared += lineCount;

        if (allSlotsPlaced(state)) {
            refreshSpawnSlots(state);
        }

        if (!canAnySlotFit(state.grid, state.spawnSlots)) {
            showGameOver(state);
        }
    } else {
        slot.group.visible = true;
    }

    if (state.renderer.domElement.releasePointerCapture &&
        state.renderer.domElement.hasPointerCapture &&
        state.renderer.domElement.hasPointerCapture(event.pointerId)) {
        state.renderer.domElement.releasePointerCapture(event.pointerId);
    }

    state.drag = null;
    state.renderer.domElement.style.cursor = 'grab';

    if (placed && state.onShapePlaced) {
        state.onShapePlaced();
    }
}

export function refreshSpawnSlots(state) {
    var colors = state.config.shapes.colors;
    var count = state.config.shapes.spawnCount;
    var cellSize = state.boardMetrics.cellSize;
    var gap = state.boardMetrics.gap;
    var spacing = state.config.shapes.spawnSpacing;
    var scale = state.config.shapes.previewScale;
    var shapes = generateShapeSet(count, colors);
    var i;

    for (i = 0; i < state.spawnSlots.length; i += 1) {
        if (state.spawnSlots[i].group) {
            state.sceneManager.removeObject(state.spawnSlots[i].group);
        }
    }

    state.spawnSlots = [];

    for (i = 0; i < count; i += 1) {
        var xPos = (i - (count - 1) / 2) * spacing;
        var group = createShapeGroup(shapes[i], cellSize, gap, scale);

        group.position.set(xPos, state.config.shapes.spawnOffsetY, state.config.shapes.baseZ);
        state.sceneManager.addObject(group);

        state.spawnSlots.push({
            shape: shapes[i],
            group: group,
            placed: false
        });
    }

    if (state.onSpawnSlotsRefreshed) {
        state.onSpawnSlotsRefreshed();
    }
}

export function initSpawnSlots(state) {
    refreshSpawnSlots(state);
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
        finishDrag(event, state);
    });
    canvas.addEventListener('pointercancel', function (event) {
        finishDrag(event, state);
    });
    window.addEventListener('pointerup', function (event) {
        finishDrag(event, state);
    });
    window.addEventListener('pointercancel', function (event) {
        finishDrag(event, state);
    });
}
