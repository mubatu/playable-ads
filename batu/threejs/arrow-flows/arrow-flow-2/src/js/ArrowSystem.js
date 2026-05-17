import { cellKey, DIRECTIONS, isInsideGrid } from './Board.js';
import { buildExitWaypoints, removeCellFromGrid } from './FramePath.js';
import { resolveAllShots } from './ShooterSystem.js';

function coordMatches(a, b) {
    return a.row === b.row && a.col === b.col;
}

export function isArrowClickable(state, arrow) {
    var dir = DIRECTIONS[arrow.direction];
    var current = {
        row: arrow.head.row + dir.row,
        col: arrow.head.col + dir.col
    };
    var occupant;

    while (isInsideGrid(state.boardMetrics, current)) {
        occupant = state.grid.get(cellKey(current.row, current.col));
        if (occupant) {
            return false;
        }
        current = {
            row: current.row + dir.row,
            col: current.col + dir.col
        };
    }

    return true;
}

export function normalizeArrowCells(arrow) {
    var dir = DIRECTIONS[arrow.direction];
    var cells = arrow.cells.slice();

    cells.sort(function (a, b) {
        var da = (arrow.head.row - a.row) * dir.row + (arrow.head.col - a.col) * dir.col;
        var db = (arrow.head.row - b.row) * dir.row + (arrow.head.col - b.col) * dir.col;
        return da - db;
    });

    return cells;
}

export function startArrowExit(state, arrow) {
    if (!arrow || arrow.isExiting || arrow.isFullyExited) {
        return false;
    }

    if (!isArrowClickable(state, arrow)) {
        arrow.invalidFeedbackTime = state.config.arrow.invalidTapFeedbackSeconds;
        return false;
    }

    arrow.isExiting = true;
    arrow.releaseTimer = state.config.arrow.exitIntervalSeconds;
    arrow.exitQueue = arrow.orderedCells.slice();
    state.inactivitySeconds = 0;
    return true;
}

function releaseNextCell(state, arrow) {
    var coord = arrow.exitQueue.shift();
    var cell = state.grid.get(cellKey(coord.row, coord.col));
    var targetSlotIndex;
    var waypoints;
    var movingCell;

    if (!cell) {
        return;
    }

    targetSlotIndex = state.framePath.getAlignedEntrySlot(coord, arrow.direction);
    waypoints = buildExitWaypoints(state, coord, arrow.direction, targetSlotIndex);
    removeCellFromGrid(state, cell);
    cell.group.userData.arrowId = null;
    cell.box.userData.arrowId = null;

    movingCell = {
        cell: cell,
        waypoints: waypoints,
        targetSlotIndex: targetSlotIndex,
        segmentStart: cell.group.position.clone(),
        segmentIndex: 0,
        segmentTime: 0,
        waiting: false
    };
    state.movingCells.push(movingCell);
}

function tryInsertMovingCell(state, movingCell) {
    if (state.framePath.insertCellAtSlot(movingCell.cell, movingCell.targetSlotIndex)) {
        movingCell.cell.group.position.copy(state.framePath.getSlotPosition(movingCell.targetSlotIndex));
        resolveAllShots(state);
        return true;
    }

    movingCell.cell.status = 'waiting';
    movingCell.waiting = true;
    movingCell.cell.group.position.copy(state.framePath.getSlotPosition(movingCell.targetSlotIndex));
    return false;
}

function updateMovingCell(state, movingCell, dt) {
    var duration = state.config.arrow.exitAnimationSeconds;
    var target;
    var alpha;

    if (movingCell.waiting) {
        return tryInsertMovingCell(state, movingCell);
    }

    if (movingCell.segmentIndex >= movingCell.waypoints.length) {
        return tryInsertMovingCell(state, movingCell);
    }

    movingCell.segmentTime += dt;
    target = movingCell.waypoints[movingCell.segmentIndex];
    alpha = Math.min(1, movingCell.segmentTime / duration);
    movingCell.cell.group.position.lerpVectors(movingCell.segmentStart, target, alpha);

    if (alpha >= 1) {
        movingCell.segmentIndex += 1;
        movingCell.segmentStart = target.clone();
        movingCell.segmentTime = 0;

        if (movingCell.segmentIndex >= movingCell.waypoints.length) {
            return tryInsertMovingCell(state, movingCell);
        }
    }

    return false;
}

export function tryInsertWaitingCells(state) {
    var remaining = [];
    var i;
    var movingCell;

    for (i = 0; i < state.movingCells.length; i += 1) {
        movingCell = state.movingCells[i];
        if (movingCell.waiting && tryInsertMovingCell(state, movingCell)) {
            continue;
        }
        remaining.push(movingCell);
    }

    state.movingCells = remaining;
}

export function updateArrowSystem(state, dt) {
    var i;
    var arrow;
    var remainingMoving = [];
    var movingCell;

    for (i = 0; i < state.arrows.length; i += 1) {
        arrow = state.arrows[i];
        if (arrow.invalidFeedbackTime > 0) {
            arrow.invalidFeedbackTime -= dt;
        }

        if (!arrow.isExiting || arrow.isFullyExited) {
            continue;
        }

        arrow.releaseTimer += dt;
        while (arrow.releaseTimer >= state.config.arrow.exitIntervalSeconds && arrow.exitQueue.length > 0) {
            arrow.releaseTimer -= state.config.arrow.exitIntervalSeconds;
            releaseNextCell(state, arrow);
        }

        if (arrow.exitQueue.length === 0) {
            arrow.isFullyExited = true;
        }
    }

    for (i = 0; i < state.movingCells.length; i += 1) {
        movingCell = state.movingCells[i];
        if (!updateMovingCell(state, movingCell, dt)) {
            remainingMoving.push(movingCell);
        }
    }
    state.movingCells = remainingMoving;
}

export function updateArrowVisuals(state, nowSeconds) {
    var i;
    var j;
    var arrow;
    var cell;
    var clickable;
    var pulse;
    var shouldHint;

    for (i = 0; i < state.arrows.length; i += 1) {
        arrow = state.arrows[i];
        clickable = !arrow.isExiting && !arrow.isFullyExited && isArrowClickable(state, arrow);
        shouldHint = clickable && state.inactivitySeconds >= state.config.arrow.clickablePulseDelaySeconds;
        pulse = shouldHint ? 1 + Math.sin(nowSeconds * 7) * 0.06 : 1;

        if (arrow.invalidFeedbackTime > 0) {
            pulse = 1 + Math.sin(nowSeconds * 34) * 0.08;
        }

        for (j = 0; j < arrow.cells.length; j += 1) {
            cell = arrow.cells[j].cellRef;
            if (cell && cell.status === 'grid') {
                cell.group.scale.setScalar(pulse);
            }
        }
    }
}

export function findFirstClickableArrow(state) {
    var i;

    for (i = 0; i < state.arrows.length; i += 1) {
        if (!state.arrows[i].isExiting && !state.arrows[i].isFullyExited && isArrowClickable(state, state.arrows[i])) {
            return state.arrows[i];
        }
    }

    return null;
}

export function getArrowHeadCell(arrow) {
    var i;

    for (i = 0; i < arrow.cells.length; i += 1) {
        if (coordMatches(arrow.cells[i], arrow.head)) {
            return arrow.cells[i].cellRef;
        }
    }

    return arrow.cells[0] && arrow.cells[0].cellRef;
}
