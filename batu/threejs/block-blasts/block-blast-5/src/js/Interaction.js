import * as THREE from 'three';
import { getCellCenter } from './Board.js';
import { tryPlaceShape } from './Logic.js';

var dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

function setCanvasCursor(state, cursor) {
    if (state && state.renderer && state.renderer.domElement) {
        state.renderer.domElement.style.cursor = cursor;
    }
}

function getWorldPointOnBoard(event, state) {
    var rect = state.renderer.domElement.getBoundingClientRect();
    var pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
    var worldPoint = new THREE.Vector3();

    state.raycaster.setFromCamera(pointer, state.camera);

    if (!state.raycaster.ray.intersectPlane(dragPlane, worldPoint)) {
        return null;
    }

    return worldPoint;
}

function getBoardLocalPoint(event, state) {
    var worldPoint = getWorldPointOnBoard(event, state);

    if (!worldPoint) {
        return null;
    }

    state.board.updateMatrixWorld(true);
    return state.board.worldToLocal(worldPoint.clone());
}

function resetDraggedShape(state) {
    if (!state.drag) {
        return;
    }

    var shape = state.drag.shape;
    shape.position.copy(shape.userData.dockPosition);
    shape.scale.setScalar(shape.userData.dockScale);
    shape.userData.isDocked = true;
}

function setPointerCapture(canvas, pointerId) {
    if (canvas.setPointerCapture) {
        canvas.setPointerCapture(pointerId);
    }
}

function releasePointerCapture(canvas, pointerId) {
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(pointerId) && canvas.releasePointerCapture) {
        canvas.releasePointerCapture(pointerId);
    }
}

function onPointerDown(event, state) {
    var rect;
    var pointer;
    var intersections;
    var child;
    var shapeGroup = null;
    var localPoint;

    if (state.drag || state.isGameOver) {
        return;
    }

    rect = state.renderer.domElement.getBoundingClientRect();
    pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );

    state.raycaster.setFromCamera(pointer, state.camera);
    intersections = state.raycaster.intersectObjects(state.shapesGroup.children, true);

    if (!intersections.length) {
        return;
    }

    // find the parent shape group
    child = intersections[0].object;
    while (child.parent && child.parent !== state.shapesGroup) {
        if (child.parent.userData.isShape) {
            shapeGroup = child.parent;
            break;
        }
        child = child.parent;
    }
    
    if (!shapeGroup && child.userData.isShape) {
        shapeGroup = child;
    }

    localPoint = getBoardLocalPoint(event, state);

    if (!shapeGroup || !localPoint) {
        return;
    }
    
    // Can only drag docked shapes
    if (!shapeGroup.userData.isDocked) {
        return;
    }

    state.drag = {
        shape: shapeGroup,
        offsetX: localPoint.x - shapeGroup.position.x,
        offsetY: localPoint.y - shapeGroup.position.y,
        pointerId: event.pointerId
    };

    shapeGroup.userData.isDocked = false;
    shapeGroup.position.z = state.config.shapes.dragZ;
    shapeGroup.scale.setScalar(state.config.shapes.dragScale);
    
    // adjust offset for finger offset so we can see the block
    var fingerOffsetY = 1.5;
    state.drag.offsetY -= fingerOffsetY;
    
    setPointerCapture(state.renderer.domElement, event.pointerId);
    setCanvasCursor(state, 'grabbing');
}

function onPointerMove(event, state) {
    var localPoint;

    if (!state.drag || event.pointerId !== state.drag.pointerId || state.isGameOver) {
        return;
    }

    localPoint = getBoardLocalPoint(event, state);

    if (!localPoint) {
        return;
    }

    state.drag.shape.position.set(
        localPoint.x - state.drag.offsetX,
        localPoint.y - state.drag.offsetY,
        state.config.shapes.dragZ
    );
}

function finishDrag(event, state) {
    var draggedShape;

    if (!state.drag || event.pointerId !== state.drag.pointerId) {
        return;
    }

    draggedShape = state.drag.shape;
    
    // attempt to place it on the board
    var success = tryPlaceShape(state, draggedShape);
    
    if (!success) {
        resetDraggedShape(state);
    }

    releasePointerCapture(state.renderer.domElement, event.pointerId);
    state.drag = null;
    setCanvasCursor(state, 'grab');
}

export function bindInteractions(state) {
    var canvas = state.renderer.domElement;

    canvas.addEventListener('pointerdown', function (event) {
        onPointerDown(event, state);
    });
    canvas.addEventListener('pointermove', function (event) {
        onPointerMove(event, state);
    });
    canvas.addEventListener('pointerup', function (event) {
        finishDrag(event, state);
    });
    canvas.addEventListener('pointercancel', function (event) {
        finishDrag(event, state);
    });
    window.addEventListener('pointerup', function (event) {
        finishDrag(event, state);
    });
    window.addEventListener('pointercancel', function (event) {
        finishDrag(event, state);
    });
}
