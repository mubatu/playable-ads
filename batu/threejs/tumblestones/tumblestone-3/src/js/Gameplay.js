import { findLowestTileInColumn } from './Board.js';
import { refreshSlotState } from './Slots.js';
import { refreshProgressDisplay, showEndState } from './Hud.js';

function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
}

function disposeObject3D(state, object) {
    if (!object) {
        return;
    }

    if (object.parent) {
        object.parent.remove(object);
    }

    if (state && state.sceneManager) {
        state.sceneManager.removeObject(object);
    }

    object.traverse(function (node) {
        if (node.geometry) {
            node.geometry.dispose();
        }

        if (node.material) {
            if (Array.isArray(node.material)) {
                node.material.forEach(function (material) {
                    material.dispose();
                });
            } else {
                node.material.dispose();
            }
        }
    });
}

function firstEmptySlotIndex(state) {
    var i;
    var slotCount = state.config.slots.count;

    for (i = 0; i < slotCount; i += 1) {
        if (!state.collectedTiles[i]) {
            return i;
        }
    }

    return -1;
}

function getCurrentSlotColor(state) {
    var i;

    for (i = 0; i < state.collectedTiles.length; i += 1) {
        if (state.collectedTiles[i]) {
            return state.collectedTiles[i].colorId;
        }
    }

    return null;
}

function animate(state, options) {
    state.animations.push({
        mesh: options.mesh,
        from: options.from.clone(),
        to: options.to.clone(),
        fromScale: typeof options.fromScale === 'number' ? options.fromScale : options.mesh.scale.x,
        toScale: typeof options.toScale === 'number' ? options.toScale : options.mesh.scale.x,
        fromOpacity: typeof options.fromOpacity === 'number' ? options.fromOpacity : 1,
        toOpacity: typeof options.toOpacity === 'number' ? options.toOpacity : 1,
        duration: Math.max(options.duration, 0.01),
        elapsed: 0,
        onComplete: options.onComplete || null,
        disposeOnComplete: Boolean(options.disposeOnComplete)
    });
}

function clearFilledSlots(state) {
    var remaining = state.collectedTiles.length;

    function finishOne(mesh) {
        disposeObject3D(state, mesh);
        remaining -= 1;

        if (remaining <= 0) {
            state.collectedTiles = new Array(state.config.slots.count).fill(null);
            state.currentCollectionColor = null;
            state.matchesCleared += 1;
            refreshSlotState(state);
            refreshProgressDisplay(state);

            if (state.matchesCleared >= state.config.progression.requiredMatches) {
                showEndState(state, true);
                return;
            }

            updateInteractables(state);
            state.locked = false;
        }
    }

    state.locked = true;

    state.collectedTiles.forEach(function (slotEntry) {
        animate(state, {
            mesh: slotEntry.mesh,
            from: slotEntry.mesh.position,
            to: slotEntry.mesh.position.clone(),
            fromScale: slotEntry.mesh.scale.x,
            toScale: 0.18,
            fromOpacity: 1,
            toOpacity: 0,
            duration: state.config.animation.clearDuration,
            onComplete: finishOne
        });
    });
}

export function updateInteractables(state) {
    var column;
    var row;
    var tile;

    state.interactableTiles = [];

    for (row = 0; row < state.grid.length; row += 1) {
        for (column = 0; column < state.grid[row].length; column += 1) {
            tile = state.grid[row][column];

            if (tile && tile.outline) {
                tile.outline.visible = false;
                tile.mesh.userData.interactable = false;
            }
        }
    }

    for (column = 0; column < state.config.board.columns; column += 1) {
        tile = findLowestTileInColumn(state.grid, column);

        if (tile && tile.outline) {
            tile.outline.visible = true;
            tile.mesh.userData.interactable = true;
            state.interactableTiles.push(tile);
        }
    }
}

export function collectTile(state, tile) {
    var currentColor;
    var slotIndex;
    var fromWorld;
    var toWorld;
    var collectedMesh;

    if (!state.isPlaying || state.locked || state.gameOver || !tile || !tile.mesh || !tile.mesh.userData.interactable) {
        return;
    }

    currentColor = getCurrentSlotColor(state);

    if (currentColor && currentColor !== tile.colorId) {
        state.shakeTime = state.config.animation.failShakeSeconds;
        showEndState(state, false);
        return;
    }

    slotIndex = firstEmptySlotIndex(state);

    if (slotIndex < 0) {
        return;
    }

    state.locked = true;
    if (!state.currentCollectionColor) {
        state.currentCollectionColor = tile.colorId;
    }
    state.grid[tile.row][tile.column] = null;
    tile.outline.visible = false;

    state.board.updateMatrixWorld(true);
    fromWorld = tile.mesh.getWorldPosition(new window.THREE.Vector3());
    toWorld = state.slotTargets[slotIndex].clone();

    collectedMesh = new window.THREE.Mesh(
        tile.mesh.geometry.clone(),
        tile.mesh.material.clone()
    );
    collectedMesh.position.copy(fromWorld);
    collectedMesh.position.z = state.config.tiles.collectedZ;
    collectedMesh.renderOrder = 3;
    collectedMesh.scale.setScalar(1);
    collectedMesh.userData.colorId = tile.colorId;
    collectedMesh.userData.isCollectedTile = true;
    state.sceneManager.addObject(collectedMesh);

    state.collectedTiles[slotIndex] = {
        colorId: tile.colorId,
        mesh: collectedMesh
    };

    state.tilesGroup.remove(tile.mesh);
    disposeObject3D(state, tile.mesh);
    refreshSlotState(state);
    updateInteractables(state);

    animate(state, {
        mesh: collectedMesh,
        from: fromWorld,
        to: toWorld,
        fromScale: 1,
        toScale: 1,
        fromOpacity: 1,
        toOpacity: 1,
        duration: state.config.animation.collectDuration,
        onComplete: function () {
            if (state.collectedTiles.length >= state.config.progression.matchSize && state.collectedTiles.every(Boolean)) {
                if (state.collectedTiles[0].colorId === state.collectedTiles[1].colorId && state.collectedTiles[1].colorId === state.collectedTiles[2].colorId) {
                    clearFilledSlots(state);
                    return;
                }

                state.shakeTime = state.config.animation.failShakeSeconds;
                showEndState(state, false);
                return;
            }

            state.locked = false;
        }
    });
}

export function updateAnimations(state, delta) {
    var i;

    for (i = state.animations.length - 1; i >= 0; i -= 1) {
        var animation = state.animations[i];
        var progress;
        var eased;
        var scale;
        var opacity;

        animation.elapsed += delta;
        progress = Math.min(animation.elapsed / animation.duration, 1);
        eased = easeOutCubic(progress);
        animation.mesh.position.lerpVectors(animation.from, animation.to, eased);
        scale = animation.fromScale + ((animation.toScale - animation.fromScale) * eased);
        opacity = animation.fromOpacity + ((animation.toOpacity - animation.fromOpacity) * eased);
        animation.mesh.scale.setScalar(scale);

        if (animation.mesh.material) {
            animation.mesh.material.transparent = true;
            animation.mesh.material.opacity = opacity;
        }

        if (progress >= 1) {
            state.animations.splice(i, 1);

            if (animation.onComplete) {
                animation.onComplete(animation.mesh);
            }

            if (animation.disposeOnComplete) {
                disposeObject3D(state, animation.mesh);
            }
        }
    }
}
