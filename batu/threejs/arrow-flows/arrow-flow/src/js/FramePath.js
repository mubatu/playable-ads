import * as THREE from 'three';
import { createTextPlane, disposeObject, getColor, makeMaterial } from './Utils.js';

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function createRectFrameLayout(metrics, slotCount) {
    var margin = metrics.cellSize * 0.92;
    var left = -metrics.width * 0.5 - margin;
    var right = metrics.width * 0.5 + margin;
    var top = metrics.height * 0.5 + margin;
    var bottom = -metrics.height * 0.5 - margin;
    var topCount = slotCount === 36 ? 10 : Math.max(4, Math.round(slotCount * 0.28));
    var rightCount = slotCount === 36 ? 8 : Math.max(4, Math.round(slotCount * 0.22));
    var bottomCount = topCount;
    var leftCount = slotCount - topCount - rightCount - bottomCount;
    var positions = [];
    var sideSlotIndices = {
        top: [],
        right: [],
        bottom: [],
        left: []
    };
    var i;
    var t;

    for (i = 0; i < topCount; i += 1) {
        t = topCount === 1 ? 0 : i / (topCount - 1);
        sideSlotIndices.top.push(positions.length);
        positions.push({ x: lerp(left, right, t), y: top });
    }
    for (i = 0; i < rightCount; i += 1) {
        t = rightCount === 1 ? 0 : i / (rightCount - 1);
        sideSlotIndices.right.push(positions.length);
        positions.push({ x: right, y: lerp(top - metrics.cellSize * 0.65, bottom + metrics.cellSize * 0.65, t) });
    }
    for (i = 0; i < bottomCount; i += 1) {
        t = bottomCount === 1 ? 0 : i / (bottomCount - 1);
        sideSlotIndices.bottom.push(positions.length);
        positions.push({ x: lerp(right, left, t), y: bottom });
    }
    for (i = 0; i < leftCount; i += 1) {
        t = leftCount === 1 ? 0 : i / (leftCount - 1);
        sideSlotIndices.left.push(positions.length);
        positions.push({ x: left, y: lerp(bottom + metrics.cellSize * 0.65, top - metrics.cellSize * 0.65, t) });
    }

    return {
        positions: positions.slice(0, slotCount),
        sideSlotIndices: sideSlotIndices
    };
}

function createFrameCellMesh(state, colorKey) {
    var color = getColor(state.config, colorKey);
    var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(state.boardMetrics.cellSize * 0.9, state.boardMetrics.cellSize * 0.9, state.config.grid.cellHeight),
        makeMaterial(color)
    );
    mesh.position.z = 0.42;
    mesh.userData.colorKey = colorKey;
    return mesh;
}

export function createFramePath(state) {
    var levelFrame = state.level.frame || {};
    var slotCount = levelFrame.slotCount || state.config.frame.slotCount;
    var entryIndex = typeof levelFrame.entrySlotIndex === 'number' ? levelFrame.entrySlotIndex : state.config.frame.entrySlotIndex;
    var layout = createRectFrameLayout(state.boardMetrics, slotCount);
    var positions = layout.positions;
    var group = new THREE.Group();
    var slotMeshes = [];
    var slots = new Array(slotCount).fill(null);
    var i;
    var slotMesh;

    for (i = 0; i < positions.length; i += 1) {
        slotMesh = new THREE.Mesh(
            new THREE.BoxGeometry(state.boardMetrics.cellSize * 0.38, state.boardMetrics.cellSize * 0.38, 0.06),
            makeMaterial(state.config.colors.frame, 0.38)
        );
        slotMesh.position.set(positions[i].x, positions[i].y, 0.1);
        group.add(slotMesh);
        slotMeshes.push(slotMesh);

        if (state.config.debug.showFrameSlotIndices) {
            var label = createTextPlane(i, 0.32, 0.32, {
                color: '#ffffff',
                fontSize: 52,
                strokeWidth: 4
            });
            label.position.set(positions[i].x, positions[i].y, 0.24);
            group.add(label);
        }
    }

    return {
        group: group,
        slots: slots,
        positions: positions,
        sideSlotIndices: layout.sideSlotIndices,
        slotMeshes: slotMeshes,
        entryIndex: entryIndex,
        moveTickSeconds: levelFrame.moveTickSeconds || state.config.frame.moveTickSeconds
    };
}

export function canInsertAtEntry(framePath) {
    return !framePath.slots[framePath.entryIndex];
}

export function canInsertAtSlot(framePath, slotIndex) {
    return slotIndex >= 0 && slotIndex < framePath.slots.length && !framePath.slots[slotIndex];
}

export function insertFrameCellAtSlot(state, colorKey, slotIndex, existingMesh) {
    var framePath = state.framePath;
    var mesh;

    if (!canInsertAtSlot(framePath, slotIndex)) {
        return false;
    }

    mesh = existingMesh || createFrameCellMesh(state, colorKey);
    if (mesh.parent) {
        mesh.parent.remove(mesh);
    }
    mesh.position.x = framePath.positions[slotIndex].x;
    mesh.position.y = framePath.positions[slotIndex].y;
    mesh.position.z = 0.42;
    mesh.scale.set(1, 1, 1);
    framePath.group.add(mesh);
    framePath.slots[slotIndex] = {
        color: colorKey,
        mesh: mesh,
        slotIndex: slotIndex
    };
    return true;
}

export function insertFrameCell(state, colorKey) {
    return insertFrameCellAtSlot(state, colorKey, state.framePath.entryIndex);
}

export function stepFramePath(state) {
    var framePath = state.framePath;
    var nextSlots = new Array(framePath.slots.length).fill(null);
    var i;
    var destination;
    var cell;

    for (i = 0; i < framePath.slots.length; i += 1) {
        cell = framePath.slots[i];
        if (!cell) {
            continue;
        }

        destination = (i + 1) % framePath.slots.length;
        nextSlots[destination] = cell;
        cell.slotIndex = destination;
    }

    framePath.slots = nextSlots;
    updateFrameCellVisuals(state, 1);
}

export function destroyFrameCell(state, slotIndex) {
    var framePath = state.framePath;
    var cell = framePath.slots[slotIndex];

    if (!cell) {
        return;
    }

    if (cell.mesh && cell.mesh.parent) {
        cell.mesh.parent.remove(cell.mesh);
    }
    disposeObject(cell.mesh);

    framePath.slots[slotIndex] = null;
}

export function updateFrameCellVisuals(state, alpha) {
    var framePath = state.framePath;
    var i;
    var cell;
    var target;

    for (i = 0; i < framePath.slots.length; i += 1) {
        cell = framePath.slots[i];
        if (!cell || !cell.mesh) {
            continue;
        }
        target = framePath.positions[i];
        cell.mesh.position.x += (target.x - cell.mesh.position.x) * alpha;
        cell.mesh.position.y += (target.y - cell.mesh.position.y) * alpha;
        cell.mesh.rotation.z += 0.04;
    }
}

export function getRemainingFrameCellCount(state) {
    return state.framePath.slots.filter(Boolean).length;
}

export function isFrameFull(state) {
    return state.framePath.slots.every(Boolean);
}
