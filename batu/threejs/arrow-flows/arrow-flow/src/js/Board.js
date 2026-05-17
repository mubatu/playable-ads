import * as THREE from 'three';
import { DIRECTIONS, cellKey, createTextPlane, getColor, makeMaterial } from './Utils.js';

function getArrowOrder(arrow) {
    var direction = DIRECTIONS[arrow.direction];
    return arrow.cells.slice().sort(function (a, b) {
        var aScore = a.row * direction.row + a.col * direction.col;
        var bScore = b.row * direction.row + b.col * direction.col;
        return bScore - aScore;
    });
}

export function createBoardMetrics(config, level) {
    var gridConfig = config.grid;
    var rows = level.grid.rows || gridConfig.rows;
    var cols = level.grid.cols || gridConfig.cols;
    var step = gridConfig.cellSize + gridConfig.cellGap;
    var width = cols * gridConfig.cellSize + (cols - 1) * gridConfig.cellGap;
    var height = rows * gridConfig.cellSize + (rows - 1) * gridConfig.cellGap;

    return {
        rows: rows,
        cols: cols,
        cellSize: gridConfig.cellSize,
        gap: gridConfig.cellGap,
        step: step,
        width: width,
        height: height,
        startX: -width * 0.5 + gridConfig.cellSize * 0.5,
        startY: height * 0.5 - gridConfig.cellSize * 0.5
    };
}

export function gridToLocal(metrics, cell) {
    return {
        x: metrics.startX + cell.col * metrics.step,
        y: metrics.startY - cell.row * metrics.step
    };
}

export function isInsideGrid(metrics, cell) {
    return cell.row >= 0 && cell.row < metrics.rows && cell.col >= 0 && cell.col < metrics.cols;
}

export function buildGridBase(state) {
    var metrics = state.boardMetrics;
    var config = state.config;
    var padding = config.grid.basePadding;
    var base = new THREE.Mesh(
        new THREE.BoxGeometry(metrics.width + padding * 2, metrics.height + padding * 2, 0.12),
        makeMaterial(config.colors.gridBase)
    );
    var row;
    var col;
    var slot;
    var position;

    base.position.z = -0.08;
    state.board.add(base);

    for (row = 0; row < metrics.rows; row += 1) {
        for (col = 0; col < metrics.cols; col += 1) {
            position = gridToLocal(metrics, { row: row, col: col });
            slot = new THREE.Mesh(
                new THREE.BoxGeometry(metrics.cellSize * 0.86, metrics.cellSize * 0.86, 0.04),
                makeMaterial(config.colors.gridCell, 0.42)
            );
            slot.position.set(position.x, position.y, 0);
            state.board.add(slot);
        }
    }
}

function createArrowCellMesh(state, arrow, cell, isHead) {
    var metrics = state.boardMetrics;
    var color = getColor(state.config, arrow.color);
    var position = gridToLocal(metrics, cell);
    var group = new THREE.Group();
    var cube = new THREE.Mesh(
        new THREE.BoxGeometry(metrics.cellSize * 0.9, metrics.cellSize * 0.9, state.config.grid.cellHeight),
        makeMaterial(color)
    );

    cube.position.z = 0.16;
    group.add(cube);

    if (isHead) {
        var marker = createTextPlane(DIRECTIONS[arrow.direction].symbol, metrics.cellSize * 0.54, metrics.cellSize * 0.54, {
            color: '#ffffff',
            fontSize: 70,
            strokeWidth: 6,
            offsetY: -2
        });
        marker.position.z = 0.28;
        group.add(marker);
    }

    group.position.set(position.x, position.y, 0);
    group.userData.arrowId = arrow.id;
    group.userData.cell = { row: cell.row, col: cell.col };
    group.userData.baseScale = 1;

    return group;
}

export function loadArrows(state) {
    var occupancy = {};
    var arrows = [];

    state.level.arrows.forEach(function (sourceArrow) {
        var arrow = {
            id: sourceArrow.id,
            color: sourceArrow.color,
            direction: sourceArrow.direction,
            head: { row: sourceArrow.head.row, col: sourceArrow.head.col },
            cells: sourceArrow.cells.map(function (cell) {
                return { row: cell.row, col: cell.col };
            }),
            exitQueue: [],
            meshesByCell: {},
            isExiting: false,
            isFullyExited: false,
            invalidFeedback: 0,
            pulseTime: 0
        };

        arrow.exitOrder = getArrowOrder(arrow);
        arrows.push(arrow);

        arrow.cells.forEach(function (cell) {
            var key = cellKey(cell);
            var isHead = key === cellKey(arrow.head);
            var mesh = createArrowCellMesh(state, arrow, cell, isHead);

            occupancy[key] = {
                arrow: arrow,
                cell: cell,
                mesh: mesh
            };
            arrow.meshesByCell[key] = mesh;
            state.arrowGroup.add(mesh);
        });
    });

    state.arrows = arrows;
    state.gridOccupancy = occupancy;
}

export function isArrowClickable(arrow, state) {
    var direction = DIRECTIONS[arrow.direction];
    var current = {
        row: arrow.head.row + direction.row,
        col: arrow.head.col + direction.col
    };

    if (arrow.isExiting || arrow.isFullyExited) {
        return false;
    }

    while (isInsideGrid(state.boardMetrics, current)) {
        if (state.gridOccupancy[cellKey(current)]) {
            return false;
        }
        current = {
            row: current.row + direction.row,
            col: current.col + direction.col
        };
    }

    return true;
}

export function getRemainingGridCellCount(state) {
    return Object.keys(state.gridOccupancy).length;
}

export function getFirstClickableArrow(state) {
    var i;
    for (i = 0; i < state.arrows.length; i += 1) {
        if (isArrowClickable(state.arrows[i], state)) {
            return state.arrows[i];
        }
    }
    return null;
}

export function removeGridCell(state, arrow, cell) {
    var key = cellKey(cell);
    var entry = state.gridOccupancy[key];
    var mesh = arrow.meshesByCell[key];

    delete state.gridOccupancy[key];
    delete arrow.meshesByCell[key];

    if (entry && entry.mesh && entry.mesh.parent) {
        entry.mesh.parent.remove(entry.mesh);
    } else if (mesh && mesh.parent) {
        mesh.parent.remove(mesh);
    }

    return mesh;
}

export function updateArrowVisuals(state, delta) {
    var hintArrow = getFirstClickableArrow(state);

    state.arrows.forEach(function (arrow) {
        var clickable = arrow === hintArrow || isArrowClickable(arrow, state);
        var scale = 1;

        arrow.pulseTime += delta;
        if (clickable && !state.hasUserInteracted && state.idleSeconds >= state.config.playableAd.autoHintAfterSeconds) {
            scale = 1 + Math.sin(arrow.pulseTime * 8) * 0.045;
        }

        if (arrow.invalidFeedback > 0) {
            arrow.invalidFeedback = Math.max(arrow.invalidFeedback - delta, 0);
            scale = 0.92 + Math.sin(arrow.invalidFeedback * 70) * 0.035;
        }

        Object.keys(arrow.meshesByCell).forEach(function (key) {
            var mesh = arrow.meshesByCell[key];
            mesh.scale.set(scale, scale, 1);
            mesh.children.forEach(function (child) {
                if (child.material) {
                    child.material.opacity = clickable ? 1 : 0.7;
                    child.material.transparent = true;
                }
            });
        });
    });
}
