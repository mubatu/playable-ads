import THREE from 'three';
import { cellKey, gridToWorld } from './Board.js';

function sideRange(sideIndex, slotsPerSide) {
    return {
        start: sideIndex * slotsPerSide,
        end: sideIndex * slotsPerSide + slotsPerSide - 1
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clonePosition(position) {
    return new THREE.Vector3(position.x, position.y, position.z);
}

export class FramePath {
    constructor(state, level) {
        this.state = state;
        this.config = state.config;
        this.metrics = state.boardMetrics;
        this.slotCount = (level.frame && level.frame.slotCount) || this.config.frame.slotCount;
        this.slotsPerSide = this.config.frame.slotsPerSide || Math.floor(this.slotCount / 4);
        this.slots = new Array(this.slotCount).fill(null);
        this.slotPositions = this.buildSlotPositions();
        this.slotGroup = this.createSlotVisuals();
    }

    buildSlotPositions() {
        var metrics = this.metrics;
        var margin = this.config.frame.margin;
        var left = -(metrics.width * 0.5) - margin;
        var right = (metrics.width * 0.5) + margin;
        var top = metrics.offsetY + (metrics.height * 0.5) + margin;
        var bottom = metrics.offsetY - (metrics.height * 0.5) - margin;
        var positions = [];
        var perSide = this.slotsPerSide;
        var i;
        var t;

        for (i = 0; i < perSide; i += 1) {
            t = perSide === 1 ? 0 : i / (perSide - 1);
            positions.push(new THREE.Vector3(lerp(left, right, t), top, 0.08));
        }
        for (i = 0; i < perSide; i += 1) {
            t = perSide === 1 ? 0 : i / (perSide - 1);
            positions.push(new THREE.Vector3(right, lerp(top, bottom, t), 0.08));
        }
        for (i = 0; i < perSide; i += 1) {
            t = perSide === 1 ? 0 : i / (perSide - 1);
            positions.push(new THREE.Vector3(lerp(right, left, t), bottom, 0.08));
        }
        for (i = 0; i < perSide; i += 1) {
            t = perSide === 1 ? 0 : i / (perSide - 1);
            positions.push(new THREE.Vector3(left, lerp(bottom, top, t), 0.08));
        }

        return positions.slice(0, this.slotCount);
    }

    createSlotVisuals() {
        var group = new THREE.Group();
        var geometry = new THREE.BoxGeometry(this.metrics.cellSize * 1.02, this.metrics.cellSize * 1.02, 0.08);
        var material = new THREE.MeshBasicMaterial({
            color: this.config.colors.frame,
            transparent: true,
            opacity: 0.5
        });
        var i;
        var slot;

        for (i = 0; i < this.slotPositions.length; i += 1) {
            slot = new THREE.Mesh(geometry, material);
            slot.position.copy(this.slotPositions[i]);
            slot.position.z = -0.05;
            group.add(slot);
        }

        return group;
    }

    getSlotPosition(index) {
        return clonePosition(this.slotPositions[index]);
    }

    getAlignedEntrySlot(coord, direction) {
        var sideSlots = this.slotsPerSide;
        var pad = 1;
        var lane;

        if (direction === 'up') {
            lane = pad + coord.col;
            return Math.min(sideRange(0, sideSlots).end, lane);
        }

        if (direction === 'right') {
            lane = pad + coord.row;
            return sideSlots + Math.min(sideSlots - 1, lane);
        }

        if (direction === 'down') {
            lane = pad + (this.metrics.cols - 1 - coord.col);
            return sideSlots * 2 + Math.min(sideSlots - 1, lane);
        }

        lane = pad + (this.metrics.rows - 1 - coord.row);
        return sideSlots * 3 + Math.min(sideSlots - 1, lane);
    }

    canInsertAtSlot(index) {
        return index >= 0 && index < this.slots.length && this.slots[index] === null;
    }

    insertCellAtSlot(cell, index) {
        if (!this.canInsertAtSlot(index)) {
            return false;
        }

        this.slots[index] = cell;
        cell.status = 'frame';
        cell.targetSlotIndex = index;
        cell.group.position.copy(this.getSlotPosition(index));
        return true;
    }

    step() {
        var next = new Array(this.slotCount).fill(null);
        var i;
        var target;
        var cell;

        for (i = 0; i < this.slots.length; i += 1) {
            cell = this.slots[i];
            if (!cell) {
                continue;
            }
            target = (i + 1) % this.slotCount;
            next[target] = cell;
            cell.targetSlotIndex = target;
        }

        this.slots = next;
        this.syncCellPositions();
    }

    syncCellPositions() {
        var i;
        var cell;

        for (i = 0; i < this.slots.length; i += 1) {
            cell = this.slots[i];
            if (cell) {
                cell.group.position.copy(this.getSlotPosition(i));
            }
        }
    }

    destroyCellAt(index) {
        var cell = this.slots[index];

        if (!cell) {
            return null;
        }

        this.slots[index] = null;
        cell.status = 'destroyed';
        this.state.cellsRemaining -= 1;
        if (cell.group.parent) {
            cell.group.parent.remove(cell.group);
        }
        return cell;
    }

    remainingCellCount() {
        var count = 0;
        var i;

        for (i = 0; i < this.slots.length; i += 1) {
            if (this.slots[i]) {
                count += 1;
            }
        }
        return count;
    }

    isFull() {
        var i;

        for (i = 0; i < this.slots.length; i += 1) {
            if (!this.slots[i]) {
                return false;
            }
        }
        return true;
    }
}

export function buildExitWaypoints(state, coord, direction, targetSlotIndex) {
    var dir = state.directions[direction];
    var metrics = state.boardMetrics;
    var waypoints = [];
    var current = { row: coord.row + dir.row, col: coord.col + dir.col };

    while (current.row >= 0 && current.row < metrics.rows && current.col >= 0 && current.col < metrics.cols) {
        waypoints.push(gridToWorld(metrics, current.row, current.col));
        current = { row: current.row + dir.row, col: current.col + dir.col };
    }

    waypoints.push(state.framePath.getSlotPosition(targetSlotIndex));
    return waypoints;
}

export function removeCellFromGrid(state, cell) {
    state.grid.delete(cellKey(cell.coord.row, cell.coord.col));
    cell.status = 'moving';
}
