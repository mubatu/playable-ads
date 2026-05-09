import * as THREE from 'three';
import { collectTile } from './Gameplay.js';
import { dismissTutorial } from './Tutorial.js';

function getPointer(event, state) {
    var rect = state.renderer.domElement.getBoundingClientRect();

    return new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
}

function getCanvasPoint(event, state) {
    var rect = state.renderer.domElement.getBoundingClientRect();

    return new THREE.Vector2(
        event.clientX - rect.left,
        event.clientY - rect.top
    );
}

function resolveTileFromObject(object) {
    var current = object;

    while (current) {
        if (current.userData && current.userData.tile) {
            return current.userData.tile;
        }

        current = current.parent || null;
    }

    return null;
}

function findHitTile(event, state) {
    var pointer = getPointer(event, state);
    var canvasPoint = getCanvasPoint(event, state);
    var raycaster = state.raycaster || (state.raycaster = new THREE.Raycaster());
    var intersections;
    var i;
    var tile;
    var rect = state.renderer.domElement.getBoundingClientRect();
    var bestTile = null;
    var bestDistance = Infinity;
    var worldPosition;
    var screenPosition;
    var screenEdge;
    var radiusPx;

    if (!state.tilesGroup || !state.tilesGroup.children || state.tilesGroup.children.length === 0) {
        return null;
    }

    raycaster.setFromCamera(pointer, state.camera);
    intersections = raycaster.intersectObjects(state.tilesGroup.children, true);

    for (i = 0; i < intersections.length; i += 1) {
        tile = resolveTileFromObject(intersections[i].object);

        if (tile && tile.mesh && tile.mesh.userData.interactable) {
            return tile;
        }
    }

    for (i = 0; i < state.interactableTiles.length; i += 1) {
        tile = state.interactableTiles[i];

        if (!tile || !tile.mesh) {
            continue;
        }

        worldPosition = tile.mesh.getWorldPosition(new THREE.Vector3());
        screenPosition = worldPosition.clone().project(state.camera);
        screenEdge = worldPosition.clone().add(new THREE.Vector3(state.boardMetrics.cellSize * 0.5, 0, 0)).project(state.camera);

        var screenX = (screenPosition.x * 0.5 + 0.5) * rect.width;
        var screenY = (-screenPosition.y * 0.5 + 0.5) * rect.height;
        var edgeX = (screenEdge.x * 0.5 + 0.5) * rect.width;

        radiusPx = Math.max(Math.abs(edgeX - screenX) * 1.15, 18);

        if (
            canvasPoint.x >= screenX - radiusPx &&
            canvasPoint.x <= screenX + radiusPx &&
            canvasPoint.y >= screenY - radiusPx &&
            canvasPoint.y <= screenY + radiusPx
        ) {
            var distance = Math.hypot(canvasPoint.x - screenX, canvasPoint.y - screenY);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestTile = tile;
            }
        }
    }

    if (bestTile) {
        return bestTile;
    }

    return null;
}

export function bindInteractions(state) {
    var canvas = state.renderer.domElement;
    var handleTap = function (event) {
        var tile;

        if (!state.isPlaying || state.gameOver || state.locked) {
            return;
        }

        tile = findHitTile(event, state);

        if (tile) {
            event.preventDefault();
            dismissTutorial(state);
            collectTile(state, tile);
        }
    };

    canvas.addEventListener('pointerdown', handleTap);
    canvas.addEventListener('click', handleTap);
}
