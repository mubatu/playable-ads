(function (window) {
    'use strict';

    var gameScene = window.GameScene;
    var gameBoard = window.GameBoard;
    var gameMatch = window.GameMatch;

    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();

    var selectedCell = null;
    var isResolvingMove = false;

    function setSelectedCell(nextCell) {
        if (selectedCell) {
            gameBoard.setSelected(selectedCell, false);
        }

        selectedCell = nextCell;

        if (selectedCell) {
            gameBoard.setSelected(selectedCell, true);
        }
    }

    function normalizePointer(event) {
        var x;
        var y;

        if (event.changedTouches && event.changedTouches.length > 0) {
            x = event.changedTouches[0].clientX;
            y = event.changedTouches[0].clientY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }

        pointer.x = (x / window.innerWidth) * 2 - 1;
        pointer.y = -(y / window.innerHeight) * 2 + 1;
    }

    function pickCellFromEvent(event) {
        normalizePointer(event);

        raycaster.setFromCamera(pointer, gameScene.camera);
        var intersects = raycaster.intersectObjects(gameBoard.getColorMeshes(), false);

        if (intersects.length === 0) {
            return null;
        }

        return gameBoard.getCellFromMesh(intersects[0].object);
    }

    function resolveSwap(cellA, cellB) {
        isResolvingMove = true;

        gameBoard.swapCells(cellA, cellB);

        var matchedCells = gameMatch.findMatches(gameBoard);
        if (matchedCells.length > 0) {
            gameBoard.removeCells(matchedCells);
        } else {
            gameBoard.swapCells(cellA, cellB);
        }

        isResolvingMove = false;
    }

    function onPointerDown(event) {
        event.preventDefault();

        if (isResolvingMove) {
            return;
        }

        var tappedCell = pickCellFromEvent(event);

        if (!tappedCell || tappedCell.colorIndex < 0) {
            setSelectedCell(null);
            return;
        }

        if (!selectedCell) {
            setSelectedCell(tappedCell);
            return;
        }

        if (selectedCell.row === tappedCell.row && selectedCell.col === tappedCell.col) {
            setSelectedCell(null);
            return;
        }

        if (!gameBoard.areAdjacent(selectedCell, tappedCell)) {
            setSelectedCell(tappedCell);
            return;
        }

        var firstCell = selectedCell;
        setSelectedCell(null);
        resolveSwap(firstCell, tappedCell);
    }

    function onResize() {
        gameScene.renderer.setSize(window.innerWidth, window.innerHeight);
        var boardSize = gameBoard.getBoardSize();
        gameScene.updateCamera(boardSize.width, boardSize.height);
    }

    function animate() {
        requestAnimationFrame(animate);
        gameScene.renderer.render(gameScene.scene, gameScene.camera);
    }

    gameScene.renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
    window.addEventListener('resize', onResize);

    gameBoard.init(gameScene.scene, function () {
        var boardSize = gameBoard.getBoardSize();
        gameScene.updateCamera(boardSize.width, boardSize.height);
        animate();
    });
})(window);
