import { isArrowClickable } from './Board.js';
import { startArrowExit } from './ArrowExit.js';
import { dismissTutorial } from './Tutorial.js';

function collectArrowMeshes(state) {
    var meshes = [];
    state.arrowGroup.traverse(function (child) {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    return meshes;
}

function findArrowFromObject(state, object) {
    var current = object;
    var id;
    var i;

    while (current) {
        if (current.userData && current.userData.arrowId) {
            id = current.userData.arrowId;
            break;
        }
        current = current.parent;
    }

    if (!id) {
        return null;
    }

    for (i = 0; i < state.arrows.length; i += 1) {
        if (state.arrows[i].id === id) {
            return state.arrows[i];
        }
    }

    return null;
}

function getPointer(event, state) {
    var rect = state.renderer.domElement.getBoundingClientRect();
    return new window.THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
}

function findHitArrow(event, state) {
    var pointer = getPointer(event, state);
    var meshes = collectArrowMeshes(state);
    var intersections;

    state.raycaster.setFromCamera(pointer, state.camera);
    intersections = state.raycaster.intersectObjects(meshes, false);

    if (!intersections.length) {
        return null;
    }

    return findArrowFromObject(state, intersections[0].object);
}

function onPointerDown(event, state) {
    var arrow;

    if (state.status !== 'playing') {
        return;
    }

    dismissTutorial(state);
    state.idleSeconds = 0;
    arrow = findHitArrow(event, state);

    if (!arrow) {
        return;
    }

    if (!isArrowClickable(arrow, state)) {
        arrow.invalidFeedback = state.config.arrow.invalidTapFeedbackSeconds;
        return;
    }

    startArrowExit(state, arrow);
}

export function bindInteractions(state) {
    var canvas = state.renderer.domElement;

    canvas.addEventListener('pointerdown', function (event) {
        onPointerDown(event, state);
    });
}
