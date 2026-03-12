(function (window) {
    'use strict';

    var config = window.GameConfig;
    var gameScene = window.GameScene;
    var gameBoard = window.GameBoard;
    var gameMatch = window.GameMatch;
    var gameWater = window.GameWater;

    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();

    var selectedCell = null;
    var isResolvingMove = false;

    var swipeState = {
        isActive: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        originCell: null,
        didTriggerSwap: false
    };

    function setSelectedCell(nextCell) {
        if (selectedCell) {
            gameBoard.setSelected(selectedCell, false);
        }

        selectedCell = nextCell;

        if (selectedCell) {
            gameBoard.setSelected(selectedCell, true);
        }
    }

    function getClientPoint(event) {
        return {
            x: event.clientX,
            y: event.clientY
        };
    }

    function setPointerFromClient(clientX, clientY) {
        pointer.x = (clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    }

    function pickCellAtClient(clientX, clientY) {
        setPointerFromClient(clientX, clientY);

        raycaster.setFromCamera(pointer, gameScene.camera);
        var intersects = raycaster.intersectObjects(gameBoard.getColorMeshes(), false);

        if (intersects.length === 0) {
            return null;
        }

        return gameBoard.getCellFromMesh(intersects[0].object);
    }

    function animateVisualSwap(cellA, cellB, onComplete) {
        var meshA = cellA.colorMesh;
        var meshB = cellB.colorMesh;

        if (!meshA.visible || !meshB.visible) {
            onComplete();
            return;
        }

        var ghostA = new THREE.Mesh(meshA.geometry, meshA.material);
        var ghostB = new THREE.Mesh(meshB.geometry, meshB.material);

        ghostA.position.copy(meshA.position);
        ghostB.position.copy(meshB.position);
        ghostA.scale.copy(meshA.scale);
        ghostB.scale.copy(meshB.scale);
        ghostA.position.z = 0.03;
        ghostB.position.z = 0.03;

        var startAX = ghostA.position.x;
        var startAY = ghostA.position.y;
        var startBX = ghostB.position.x;
        var startBY = ghostB.position.y;

        var endAX = startBX;
        var endAY = startBY;
        var endBX = startAX;
        var endBY = startAY;

        gameScene.scene.add(ghostA);
        gameScene.scene.add(ghostB);

        meshA.visible = false;
        meshB.visible = false;

        var duration = config.SWAP_ANIMATION_MS;
        var startTime = performance.now();

        function easeInOut(t) {
            return t * t * (3 - 2 * t);
        }

        function step(now) {
            var progress = Math.min((now - startTime) / duration, 1);
            var eased = easeInOut(progress);

            ghostA.position.x = startAX + (endAX - startAX) * eased;
            ghostA.position.y = startAY + (endAY - startAY) * eased;
            ghostB.position.x = startBX + (endBX - startBX) * eased;
            ghostB.position.y = startBY + (endBY - startBY) * eased;

            if (progress < 1) {
                requestAnimationFrame(step);
                return;
            }

            gameScene.scene.remove(ghostA);
            gameScene.scene.remove(ghostB);

            meshA.visible = true;
            meshB.visible = true;

            onComplete();
        }

        requestAnimationFrame(step);
    }

    function resolveSwap(cellA, cellB) {
        isResolvingMove = true;

        animateVisualSwap(cellA, cellB, function () {
            gameBoard.swapCells(cellA, cellB);

            var matchedCells = gameMatch.findMatches(gameBoard);
            if (matchedCells.length > 0) {
                gameBoard.removeCells(matchedCells);
                isResolvingMove = false;
                return;
            }

            animateVisualSwap(cellA, cellB, function () {
                gameBoard.swapCells(cellA, cellB);
                isResolvingMove = false;
            });
        });
    }

    function resetSwipeState() {
        swipeState.isActive = false;
        swipeState.pointerId = null;
        swipeState.startX = 0;
        swipeState.startY = 0;
        swipeState.originCell = null;
        swipeState.didTriggerSwap = false;
    }

    function directionFromDelta(deltaX, deltaY) {
        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
            return {
                rowOffset: 0,
                colOffset: deltaX > 0 ? 1 : -1
            };
        }

        return {
            rowOffset: deltaY > 0 ? 1 : -1,
            colOffset: 0
        };
    }

    function onPointerDown(event) {
        event.preventDefault();

        if (isResolvingMove || swipeState.isActive) {
            return;
        }

        var point = getClientPoint(event);
        var originCell = pickCellAtClient(point.x, point.y);

        if (!originCell || originCell.colorIndex < 0) {
            setSelectedCell(null);
            return;
        }

        swipeState.isActive = true;
        swipeState.pointerId = event.pointerId;
        swipeState.startX = point.x;
        swipeState.startY = point.y;
        swipeState.originCell = originCell;
        swipeState.didTriggerSwap = false;

        setSelectedCell(originCell);

        if (event.target && event.target.setPointerCapture) {
            event.target.setPointerCapture(event.pointerId);
        }
    }

    function onPointerMove(event) {
        if (!swipeState.isActive || swipeState.pointerId !== event.pointerId) {
            return;
        }

        if (isResolvingMove || swipeState.didTriggerSwap) {
            return;
        }

        var point = getClientPoint(event);
        var deltaX = point.x - swipeState.startX;
        var deltaY = point.y - swipeState.startY;

        if (
            Math.abs(deltaX) < config.SWIPE_TRIGGER_PX &&
            Math.abs(deltaY) < config.SWIPE_TRIGGER_PX
        ) {
            return;
        }

        var direction = directionFromDelta(deltaX, deltaY);
        var targetCell = gameBoard.getCell(
            swipeState.originCell.row + direction.rowOffset,
            swipeState.originCell.col + direction.colOffset
        );

        if (!targetCell || targetCell.colorIndex < 0) {
            return;
        }

        swipeState.didTriggerSwap = true;

        var sourceCell = swipeState.originCell;
        setSelectedCell(null);
        resolveSwap(sourceCell, targetCell);
    }

    function endPointer(event) {
        if (!swipeState.isActive || swipeState.pointerId !== event.pointerId) {
            return;
        }

        if (!swipeState.didTriggerSwap) {
            setSelectedCell(null);
        }

        if (event.target && event.target.releasePointerCapture) {
            event.target.releasePointerCapture(event.pointerId);
        }

        resetSwipeState();
    }

    function onResize() {
        gameScene.renderer.setSize(window.innerWidth, window.innerHeight);
        var boardSize = gameBoard.getBoardSize();
        gameScene.updateCamera(boardSize.width, boardSize.height);
    }

    var lastTime = performance.now();

    function animate() {
        requestAnimationFrame(animate);
        var now = performance.now();
        var delta = (now - lastTime) / 1000;
        lastTime = now;
        if (delta > 0.1) delta = 0.1;

        gameWater.update(delta);
        gameScene.renderer.render(gameScene.scene, gameScene.camera);
    }

    gameScene.renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
    gameScene.renderer.domElement.addEventListener('pointermove', onPointerMove, false);
    gameScene.renderer.domElement.addEventListener('pointerup', endPointer, false);
    gameScene.renderer.domElement.addEventListener('pointercancel', endPointer, false);
    window.addEventListener('resize', onResize);

    gameBoard.init(gameScene.scene, function () {
        var boardSize = gameBoard.getBoardSize();
        gameScene.updateCamera(boardSize.width, boardSize.height);
        gameWater.init(gameScene.scene);
        animate();
    });
})(window);
