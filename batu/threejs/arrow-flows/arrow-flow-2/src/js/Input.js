import { startArrowExit } from './ArrowSystem.js';
import { dismissTutorial } from './Tutorial.js';

function getPointer(event, renderer, camera, pointer) {
    var rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return pointer;
}

function getArrowById(state, arrowId) {
    var i;

    for (i = 0; i < state.arrows.length; i += 1) {
        if (state.arrows[i].id === arrowId) {
            return state.arrows[i];
        }
    }
    return null;
}

export function bindInteractions(state) {
    state.renderer.domElement.addEventListener('pointerdown', function (event) {
        var pointer = getPointer(event, state.renderer, state.camera, state.pointer);
        var intersections;
        var hit;
        var arrowId;
        var arrow;

        if (state.status !== 'playing') {
            return;
        }

        event.preventDefault();
        dismissTutorial(state);
        state.raycaster.setFromCamera(pointer, state.camera);
        intersections = state.raycaster.intersectObjects(state.arrowHitMeshes, false);
        if (intersections.length === 0) {
            return;
        }

        hit = intersections[0].object;
        arrowId = hit.userData.arrowId;
        arrow = getArrowById(state, arrowId);
        startArrowExit(state, arrow);
    }, { passive: false });
}
