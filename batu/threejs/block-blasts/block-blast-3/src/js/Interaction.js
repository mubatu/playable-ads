import * as THREE from 'three';
import { getShapeBounds, canPlaceShape, placeShapeOnGrid, checkAndClearLines, canAnySlotFit, createShapeGroup, generateShapeSet, ensurePlayableShapeSet, updateGhostPreview, hideGhosts } from './Shapes.js';
import { emitClearParticles, startScreenShake } from './ParticleFX.js';
import { addScore, refreshBoardMeter, showGameOver } from './Hud.js';
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

function getBoardLocalPoint(worldPoint, state) {
    if (!worldPoint) {
        return null;
    }

    state.board.updateMatrixWorld(true);
    return state.board.worldToLocal(worldPoint.clone());
}

function findAnchorCell(state, localX, localY, cells) {
    var bounds = getShapeBounds(cells);
    var cellSize = state.boardMetrics.cellSize;
    var gap = state.boardMetrics.gap;
    var step = cellSize + gap;
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
    var intersections;
    var hit;
    var parent;

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

    intersections = state.raycaster.intersectObjects(meshes, false);

    if (intersections.length === 0) {
        return -1;
    }

    hit = intersections[0].object;
    parent = hit.parent;

    for (i = 0; i < state.spawnSlots.length; i += 1) {
        if (state.spawnSlots[i].group === parent) {
            return i;
        }
    }

    return -1;
}

function createDragGroup(state, slotIndex) {
    var slot = state.spawnSlots[slotIndex];
    var shape = slot.shape;
    var cellSize = state.boardMetrics.cellSize;
    var gap = state.boardMetrics.gap;
    var group = createShapeGroup(shape, cellSize, gap, 1);

    group.position.z = state.config.shapes.dragZ;
    state.sceneManager.addObject(group);
    return group;
}

function onPointerDown(event, state) {
    var slotIndex;
    var slot;
    var worldPoint;

    if (state.drag || state.gameOver) {
        return;
    }

    event.preventDefault();
    dismissTutorial(state);

    slotIndex = findHitSpawnSlot(event, state);

    if (slotIndex < 0) {
        return;
    }

    slot = state.spawnSlots[slotIndex];
    worldPoint = getWorldPoint(event, state);

    if (!worldPoint) {
        return;
    }

    var dragGroup = createDragGroup(state, slotIndex);
    dragGroup.position.set(worldPoint.x, worldPoint.y + state.config.shapes.dragOffsetY, state.config.shapes.dragZ);

    slot.group.visible = false;

    state.drag = {
        slotIndex: slotIndex,
        shape: slot.shape,
        group: dragGroup,
        pointerId: event.pointerId
    };

    if (state.renderer.domElement.setPointerCapture) {
        state.renderer.domElement.setPointerCapture(event.pointerId);
    }

    state.renderer.domElement.style.cursor = 'grabbing';
}

function onPointerMove(event, state) {
    var worldPoint;
    var localPoint;
    var anchor;

    if (!state.drag || event.pointerId !== state.drag.pointerId) {
        return;
    }

    event.preventDefault();
    worldPoint = getWorldPoint(event, state);

    if (!worldPoint) {
        return;
    }

    state.drag.group.position.set(
        worldPoint.x,
        worldPoint.y + state.config.shapes.dragOffsetY,
        state.config.shapes.dragZ
    );

    localPoint = getBoardLocalPoint(
        new THREE.Vector3(worldPoint.x, worldPoint.y + state.config.shapes.dragOffsetY, 0),
        state
    );

    if (localPoint) {
        anchor = findAnchorCell(state, localPoint.x, localPoint.y, state.drag.shape.cells);

        if (canPlaceShape(state.grid, state.drag.shape.cells, anchor.row, anchor.col)) {
            updateGhostPreview(state, anchor.row, anchor.col, state.drag.shape.cells);
            state.drag.currentAnchor = anchor;
        } else {
            hideGhosts(state);
            state.drag.currentAnchor = null;
        }
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
    var anchor;
    var slot;
    var clearResult;
    var points;

    if (!state.drag || event.pointerId !== state.drag.pointerId) {
        return;
    }

    hideGhosts(state);
    anchor = state.drag.currentAnchor;
    slot = state.spawnSlots[state.drag.slotIndex];

    state.sceneManager.removeObject(state.drag.group);

    if (anchor && canPlaceShape(state.grid, state.drag.shape.cells, anchor.row, anchor.col)) {
        placeShapeOnGrid(state, state.drag.shape, anchor.row, anchor.col);
        slot.placed = true;

        points = state.drag.shape.cells.length * state.config.scoring.cellPoints;

        clearResult = checkAndClearLines(state);

        if (clearResult.linesCleared > 0) {
            points += clearResult.linesCleared * state.config.scoring.linePoints * state.config.board.columns;

            if (clearResult.linesCleared > 1) {
                points += (clearResult.linesCleared - 1) * state.config.scoring.bonusPerExtraLine * state.config.board.columns;
            }

            emitClearParticles(state, clearResult.clearedPositions);
            startScreenShake(state, 0.15 + clearResult.linesCleared * 0.05);
        }

        addScore(state, points);
        refreshBoardMeter(state);

        if (allSlotsPlaced(state)) {
            refreshSpawnSlots(state);
        }

        if (!canAnySlotFit(state.grid, state.spawnSlots)) {
            showGameOver(state);
        }
    } else {
        slot.group.visible = true;
    }

    if (state.renderer.domElement.releasePointerCapture && state.renderer.domElement.hasPointerCapture && state.renderer.domElement.hasPointerCapture(event.pointerId)) {
        state.renderer.domElement.releasePointerCapture(event.pointerId);
    }

    state.drag = null;
    state.renderer.domElement.style.cursor = 'grab';
}

function refreshSpawnSlots(state) {
    var colors = state.config.shapes.colors;
    var count = state.config.shapes.spawnCount;
    var cellSize = state.boardMetrics.cellSize;
    var gap = state.boardMetrics.gap;
    var spacing = state.config.shapes.spawnSpacing;
    var scale = state.config.shapes.previewScale;
    var shapes = ensurePlayableShapeSet(state.grid, generateShapeSet(count, colors), colors);
    var i;
    var group;
    var xPos;

    for (i = 0; i < state.spawnSlots.length; i += 1) {
        if (state.spawnSlots[i].group) {
            state.sceneManager.removeObject(state.spawnSlots[i].group);
        }
    }

    state.spawnSlots = [];

    for (i = 0; i < count; i += 1) {
        xPos = (i - (count - 1) / 2) * spacing;
        group = createShapeGroup(shapes[i], cellSize, gap, scale);
        group.position.set(xPos, state.config.shapes.spawnOffsetY, state.config.shapes.baseZ);

        state.sceneManager.addObject(group);

        state.spawnSlots.push({
            shape: shapes[i],
            group: group,
            placed: false
        });
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
