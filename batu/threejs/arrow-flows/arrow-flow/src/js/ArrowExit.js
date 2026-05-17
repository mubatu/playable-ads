import { DIRECTIONS } from './Utils.js';
import { gridToLocal, isInsideGrid, removeGridCell } from './Board.js';
import { canInsertAtSlot, insertFrameCellAtSlot } from './FramePath.js';

function getExitSide(direction) {
    if (direction === 'up') {
        return 'top';
    }
    if (direction === 'right') {
        return 'right';
    }
    if (direction === 'down') {
        return 'bottom';
    }
    return 'left';
}

function findClosestSlotOnSide(state, side, cell) {
    var framePath = state.framePath;
    var sideSlots = framePath.sideSlotIndices[side] || [];
    var cellPosition = gridToLocal(state.boardMetrics, cell);
    var bestSlot = sideSlots[0] || framePath.entryIndex;
    var bestDistance = Infinity;
    var i;
    var slotIndex;
    var position;
    var distance;

    for (i = 0; i < sideSlots.length; i += 1) {
        slotIndex = sideSlots[i];
        position = framePath.positions[slotIndex];
        distance = side === 'top' || side === 'bottom'
            ? Math.abs(position.x - cellPosition.x)
            : Math.abs(position.y - cellPosition.y);

        if (distance < bestDistance) {
            bestDistance = distance;
            bestSlot = slotIndex;
        }
    }

    return bestSlot;
}

function createExitWaypoints(state, arrow, cell, targetSlotIndex) {
    var direction = DIRECTIONS[arrow.direction];
    var current = {
        row: cell.row + direction.row,
        col: cell.col + direction.col
    };
    var waypoints = [];
    var target = state.framePath.positions[targetSlotIndex];

    while (isInsideGrid(state.boardMetrics, current)) {
        waypoints.push(gridToLocal(state.boardMetrics, current));
        current = {
            row: current.row + direction.row,
            col: current.col + direction.col
        };
    }

    waypoints.push({ x: target.x, y: target.y });
    return waypoints;
}

function createMovingCell(state, arrow, cell) {
    var side = getExitSide(arrow.direction);
    var targetSlotIndex = findClosestSlotOnSide(state, side, cell);
    var mesh = removeGridCell(state, arrow, cell);
    var waypoints;

    if (!mesh) {
        return null;
    }

    mesh.scale.set(1, 1, 1);
    mesh.position.z = 0.34;
    state.fxGroup.add(mesh);
    waypoints = createExitWaypoints(state, arrow, cell, targetSlotIndex);

    return {
        color: arrow.color,
        mesh: mesh,
        targetSlotIndex: targetSlotIndex,
        waypoints: waypoints,
        waypointIndex: 0,
        progress: 0,
        duration: state.config.arrow.exitAnimationSeconds,
        hasReachedFrame: false
    };
}

function updateMovingCells(state, delta) {
    var i;
    var movingCell;
    var step;
    var target;

    for (i = state.movingCells.length - 1; i >= 0; i -= 1) {
        movingCell = state.movingCells[i];

        if (!movingCell.hasReachedFrame) {
            target = movingCell.waypoints[movingCell.waypointIndex];
            step = delta / Math.max(movingCell.duration, 0.01);
            movingCell.progress = Math.min(movingCell.progress + step, 1);
            movingCell.mesh.position.x += (target.x - movingCell.mesh.position.x) * step * 3.4;
            movingCell.mesh.position.y += (target.y - movingCell.mesh.position.y) * step * 3.4;

            if (movingCell.progress >= 1) {
                movingCell.mesh.position.x = target.x;
                movingCell.mesh.position.y = target.y;
                movingCell.waypointIndex += 1;
                movingCell.progress = 0;

                if (movingCell.waypointIndex >= movingCell.waypoints.length) {
                    movingCell.hasReachedFrame = true;
                }
            }
        }

        if (movingCell.hasReachedFrame && canInsertAtSlot(state.framePath, movingCell.targetSlotIndex)) {
            insertFrameCellAtSlot(state, movingCell.color, movingCell.targetSlotIndex, movingCell.mesh);
            state.movingCells.splice(i, 1);
        }
    }
}

export function startArrowExit(state, arrow) {
    if (arrow.isExiting || arrow.isFullyExited) {
        return;
    }

    arrow.isExiting = true;
    arrow.exitQueue = arrow.exitOrder.slice();
    state.exitingArrows.push(arrow);
}

export function updateArrowExit(state, delta) {
    var i;
    var arrow;
    var nextCell;
    var movingCell;

    updateMovingCells(state, delta);

    state.arrowExitAccumulator += delta;
    if (state.arrowExitAccumulator < state.config.arrow.exitIntervalSeconds) {
        return;
    }
    state.arrowExitAccumulator = 0;

    for (i = state.exitingArrows.length - 1; i >= 0; i -= 1) {
        arrow = state.exitingArrows[i];
        nextCell = arrow.exitQueue[0];

        if (!nextCell) {
            arrow.isExiting = false;
            arrow.isFullyExited = true;
            state.exitingArrows.splice(i, 1);
            continue;
        }

        movingCell = createMovingCell(state, arrow, nextCell);
        if (!movingCell) {
            continue;
        }
        state.movingCells.push(movingCell);
        arrow.exitQueue.shift();
    }
}
