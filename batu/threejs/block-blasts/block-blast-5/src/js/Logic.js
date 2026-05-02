import * as THREE from 'three';
import { getCellCenter } from './Board.js';
import { populateShapes } from './Shapes.js';
import { refreshHud } from './Hud.js';
import { emitLineClearParticles } from './ParticleFX.js';

function getBoardCellFromWorld(state, worldPoint) {
    var localPoint = state.board.worldToLocal(worldPoint.clone());
    var closestCell = null;
    var closestDistance = Infinity;

    for (var row = 0; row < state.boardMetrics.rows; row += 1) {
        for (var column = 0; column < state.boardMetrics.columns; column += 1) {
            var center = getCellCenter(state.boardMetrics, row, column);
            var deltaX = localPoint.x - center.x;
            var deltaY = localPoint.y - center.y;
            var distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

            if (distance < closestDistance) {
                closestDistance = distance;
                closestCell = {
                    row: row,
                    column: column
                };
            }
        }
    }

    if (closestDistance > state.boardMetrics.dropRadius) {
        return null;
    }

    return closestCell;
}

export function tryPlaceShape(state, shapeGroup) {
    var blocks = shapeGroup.userData.blocks;
    var validPlacements = [];

    // Find the cell for each block in the shape
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i].mesh;
        var worldPoint = new THREE.Vector3();
        block.getWorldPosition(worldPoint);
        
        var cell = getBoardCellFromWorld(state, worldPoint);
        
        if (!cell) {
            return false; // Out of bounds
        }
        
        if (state.grid[cell.row][cell.column]) {
            return false; // Cell already occupied
        }
        
        validPlacements.push({
            row: cell.row,
            column: cell.column,
            block: block
        });
    }

    // It's valid! Lock it in.
    placeShape(state, shapeGroup, validPlacements);
    return true;
}

function placeShape(state, shapeGroup, validPlacements) {
    var i;
    
    // update grid and parent blocks to board
    for (i = 0; i < validPlacements.length; i++) {
        var place = validPlacements[i];
        var block = place.block;
        var row = place.row;
        var col = place.column;
        
        var center = getCellCenter(state.boardMetrics, row, col);
        
        // Remove from shape group, add to board directly
        // Need to reset scale to 1 because shapeGroup might be scaled
        block.scale.setScalar(1);
        block.position.set(center.x, center.y, state.config.shapes.baseZ);
        state.board.add(block);
        
        state.grid[row][col] = block;
    }
    
    // Remove the shape group from docked shapes and scene
    state.shapesGroup.remove(shapeGroup);
    var dockIndex = state.dockedShapes.indexOf(shapeGroup);
    if (dockIndex > -1) {
        state.dockedShapes.splice(dockIndex, 1);
    }
    
    state.score += validPlacements.length * 10;
    
    checkLines(state);
    
    // Check if we need new shapes
    if (state.dockedShapes.length === 0) {
        populateShapes(state);
    }
    
    checkFailState(state);
    
    refreshHud(state);
}

function checkLines(state) {
    var rowsToClear = [];
    var colsToClear = [];
    var r, c;
    
    // Check rows
    for (r = 0; r < state.config.board.rows; r++) {
        var rowFull = true;
        for (c = 0; c < state.config.board.columns; c++) {
            if (!state.grid[r][c]) {
                rowFull = false;
                break;
            }
        }
        if (rowFull) rowsToClear.push(r);
    }
    
    // Check columns
    for (c = 0; c < state.config.board.columns; c++) {
        var colFull = true;
        for (r = 0; r < state.config.board.rows; r++) {
            if (!state.grid[r][c]) {
                colFull = false;
                break;
            }
        }
        if (colFull) colsToClear.push(c);
    }
    
    var blocksCleared = 0;
    
    // Clear rows
    for (var i = 0; i < rowsToClear.length; i++) {
        r = rowsToClear[i];
        for (c = 0; c < state.config.board.columns; c++) {
            if (state.grid[r][c]) {
                state.board.remove(state.grid[r][c]);
                state.grid[r][c] = null;
                blocksCleared++;
            }
        }
    }
    
    // Clear columns
    for (var j = 0; j < colsToClear.length; j++) {
        c = colsToClear[j];
        for (r = 0; r < state.config.board.rows; r++) {
            if (state.grid[r][c]) {
                state.board.remove(state.grid[r][c]);
                state.grid[r][c] = null;
                blocksCleared++;
            }
        }
    }
    
    if (rowsToClear.length > 0 || colsToClear.length > 0) {
        state.score += (rowsToClear.length + colsToClear.length) * 100;
        emitLineClearParticles(state, rowsToClear, colsToClear);
    }
}

function checkFailState(state) {
    // If we can place AT LEAST ONE shape from dockedShapes, we are not failing.
    var canPlaceAny = false;
    
    for (var s = 0; s < state.dockedShapes.length; s++) {
        var shapeDef = state.dockedShapes[s].userData.def;
        if (canPlaceDef(state, shapeDef)) {
            canPlaceAny = true;
            break;
        }
    }
    
    if (!canPlaceAny && state.dockedShapes.length > 0) {
        state.isGameOver = true;
        // Game Over! Show banner or something
        var errorBanner = document.getElementById('error-banner');
        if (errorBanner) {
            errorBanner.textContent = 'Game Over! No more moves.';
            errorBanner.hidden = false;
        }
    }
}

function canPlaceDef(state, def) {
    var rows = state.config.board.rows;
    var cols = state.config.board.columns;
    var defRows = def.length;
    var defCols = def[0].length;
    
    for (var r = 0; r <= rows - defRows; r++) {
        for (var c = 0; c <= cols - defCols; c++) {
            var canPlaceHere = true;
            for (var dr = 0; dr < defRows; dr++) {
                for (var dc = 0; dc < defCols; dc++) {
                    if (def[dr][dc] === 1) {
                        if (state.grid[r + dr][c + dc]) {
                            canPlaceHere = false;
                            break;
                        }
                    }
                }
                if (!canPlaceHere) break;
            }
            if (canPlaceHere) return true;
        }
    }
    return false;
}
