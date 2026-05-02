import * as THREE from 'three';
import { canPlaceShape } from './Shapes.js';

function clearTutorialDelay(state) {
    if (state.tutorialDelayId) {
        window.clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
}

export function destroyTutorial(state) {
    clearTutorialDelay(state);

    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }

    if (window.BlockBlast2) {
        window.BlockBlast2.tutorial = null;
    }
}

function getSpawnSlotPoint(state, slotIndex) {
    var slot = state.spawnSlots[slotIndex];

    if (!slot || !slot.group) {
        return null;
    }

    var pos = slot.group.position;

    return {
        space: 'world',
        x: pos.x,
        y: pos.y,
        z: pos.z
    };
}

function getBoardCellWorldPoint(state, row, col) {
    var center = state.boardMetrics.cellCenters[row][col];
    var localPoint = new THREE.Vector3(center.x, center.y, state.config.shapes.baseZ);

    state.board.updateMatrixWorld(true);
    var worldPoint = state.board.localToWorld(localPoint);

    return {
        space: 'world',
        x: worldPoint.x,
        y: worldPoint.y,
        z: worldPoint.z
    };
}

function findFirstFitForShape(state, cells) {
    var rows = state.config.board.rows;
    var cols = state.config.board.columns;
    var row;
    var col;

    for (row = 0; row < rows; row += 1) {
        for (col = 0; col < cols; col += 1) {
            if (canPlaceShape(state.grid, cells, row, col)) {
                return { row: row, col: col };
            }
        }
    }

    return null;
}

function getTutorialPair(state) {
    var slotIndex = -1;
    var i;

    for (i = 0; i < state.spawnSlots.length; i += 1) {
        if (!state.spawnSlots[i].placed) {
            slotIndex = i;
            break;
        }
    }

    if (slotIndex < 0) {
        return null;
    }

    var fromPoint = getSpawnSlotPoint(state, slotIndex);

    if (!fromPoint) {
        return null;
    }

    var fit = findFirstFitForShape(state, state.spawnSlots[slotIndex].shape.cells);

    if (!fit) {
        return null;
    }

    var anchorWorld = getBoardCellWorldPoint(state, fit.row, fit.col);
    var toPoint = {
        space: 'world',
        x: anchorWorld.x,
        y: anchorWorld.y - state.config.shapes.dragOffsetY,
        z: anchorWorld.z
    };

    return { from: fromPoint, to: toPoint };
}

function ensureTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};

    if (!tutorialConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        destroyTutorial(state);
        return;
    }

    var pair = getTutorialPair(state);

    if (!pair) {
        destroyTutorial(state);
        return;
    }

    if (!state.tutorial) {
        state.tutorial = new window.HandTutorial({
            container: state.renderer.domElement.parentElement,
            renderer: state.renderer,
            camera: state.camera,
            assetUrl: tutorialConfig.assetUrl,
            gesture: tutorialConfig.gesture || 'drag',
            duration: tutorialConfig.duration || 1.15,
            loop: true,
            loopDelay: tutorialConfig.loopDelay || 0.45,
            size: tutorialConfig.size || 124,
            rotation: 0,
            followDirection: false,
            flipX: false,
            showTrail: true,
            anchor: { x: 0.22, y: 0.08 },
            from: pair.from,
            to: pair.to
        });
    } else {
        state.tutorial.setPoints(pair.from, pair.to);
    }

    if (window.BlockBlast2) {
        window.BlockBlast2.tutorial = state.tutorial;
    }
}

export function scheduleTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};

    clearTutorialDelay(state);

    if (!tutorialConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        ensureTutorial(state);

        if (state.tutorial) {
            state.tutorial.play();
        }
    }, tutorialConfig.startDelayMs || 700);
}

export function dismissTutorial(state) {
    state.hasUserInteracted = true;
    destroyTutorial(state);
}
