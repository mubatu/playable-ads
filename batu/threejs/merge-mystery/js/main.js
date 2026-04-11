(function (window) {
    'use strict';

    var CONFIG_PATH = 'config/game-config.json';
    var appRoot = document.getElementById('app') || document.body;
    var errorBanner = document.getElementById('error-banner');
    var dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    function showError(message) {
        if (!errorBanner) {
            return;
        }

        errorBanner.textContent = message;
        errorBanner.hidden = false;
    }

    function setTextureColorSpace(texture) {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        if ('colorSpace' in texture && THREE.SRGBColorSpace) {
            texture.colorSpace = THREE.SRGBColorSpace;
        } else if ('encoding' in texture && THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }
    }

    function configureRenderer(renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }
    }

    function loadConfig() {
        return fetch(CONFIG_PATH).then(function (response) {
            if (!response.ok) {
                throw new Error('Could not load config/game-config.json');
            }

            return response.json();
        });
    }

    function loadTexture(path) {
        return new Promise(function (resolve, reject) {
            var loader = new THREE.TextureLoader();
            loader.load(
                path,
                function (texture) {
                    setTextureColorSpace(texture);
                    resolve(texture);
                },
                undefined,
                function () {
                    reject(new Error('Could not load texture: ' + path));
                }
            );
        });
    }

    function loadTextures(paths) {
        return Promise.all(paths.map(function (path) {
            return loadTexture(path);
        }));
    }

    function calculateBackgroundSize(backgroundConfig) {
        var aspectRatio = backgroundConfig.sourceWidth / backgroundConfig.sourceHeight;
        var worldHeight = backgroundConfig.worldHeight;

        return {
            width: worldHeight * aspectRatio,
            height: worldHeight
        };
    }

    function updateCamera(camera, backgroundSize) {
        var aspect = window.innerWidth / window.innerHeight;
        var targetAspect = backgroundSize.width / backgroundSize.height;

        if (aspect > targetAspect) {
            camera.top = backgroundSize.height * 0.5;
            camera.bottom = -backgroundSize.height * 0.5;
            camera.right = camera.top * aspect;
            camera.left = -camera.right;
        } else {
            camera.right = backgroundSize.width * 0.5;
            camera.left = -camera.right;
            camera.top = camera.right / aspect;
            camera.bottom = -camera.top;
        }

        camera.near = 0.1;
        camera.far = 20;
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }

    function buildBackground(texture, backgroundSize) {
        var geometry = new THREE.PlaneGeometry(backgroundSize.width, backgroundSize.height);
        var material = new THREE.MeshBasicMaterial({ map: texture });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = -5;
        return mesh;
    }

    function buildBoard(boardConfig) {
        var group = new THREE.Group();
        var availableWidth = boardConfig.maxWidth - (boardConfig.padding * 2);
        var availableHeight = boardConfig.maxHeight - (boardConfig.padding * 2);
        var cellSizeFromWidth = (availableWidth - ((boardConfig.columns - 1) * boardConfig.gap)) / boardConfig.columns;
        var cellSizeFromHeight = (availableHeight - ((boardConfig.rows - 1) * boardConfig.gap)) / boardConfig.rows;
        var cellSize = Math.min(cellSizeFromWidth, cellSizeFromHeight);
        var boardWidth;
        var boardHeight;
        var boardMesh;
        var cellGeometry;
        var cellMaterial;
        var startX;
        var startY;
        var cellCenters = [];
        var row;
        var column;

        if (cellSize <= 0) {
            throw new Error('Board config leaves no room for square cells. Adjust maxWidth/maxHeight, rows/columns, or gap.');
        }

        boardWidth = (boardConfig.columns * cellSize) + ((boardConfig.columns - 1) * boardConfig.gap) + (boardConfig.padding * 2);
        boardHeight = (boardConfig.rows * cellSize) + ((boardConfig.rows - 1) * boardConfig.gap) + (boardConfig.padding * 2);

        boardMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(boardWidth, boardHeight),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(boardConfig.backgroundColor)
            })
        );
        group.add(boardMesh);

        cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
        cellMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(boardConfig.cellColor)
        });
        startX = (-boardWidth * 0.5) + boardConfig.padding + (cellSize * 0.5);
        startY = (boardHeight * 0.5) - boardConfig.padding - (cellSize * 0.5);

        for (row = 0; row < boardConfig.rows; row += 1) {
            cellCenters[row] = [];

            for (column = 0; column < boardConfig.columns; column += 1) {
                var cellX = startX + (column * (cellSize + boardConfig.gap));
                var cellY = startY - (row * (cellSize + boardConfig.gap));
                var cell = new THREE.Mesh(cellGeometry, cellMaterial);
                cell.position.set(cellX, cellY, 0.01);
                group.add(cell);
                cellCenters[row][column] = {
                    x: cellX,
                    y: cellY
                };
            }
        }

        group.position.y = boardConfig.offsetY;
        group.userData.boardMetrics = {
            width: boardWidth,
            height: boardHeight,
            cellSize: cellSize,
            columns: boardConfig.columns,
            rows: boardConfig.rows,
            gap: boardConfig.gap,
            padding: boardConfig.padding,
            cellCenters: cellCenters,
            dropRadius: (cellSize + boardConfig.gap) * 0.65
        };

        return group;
    }

    function createPieceMaterials(textures) {
        return textures.map(function (texture) {
            return new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.05
            });
        });
    }

    function createGrid(rows, columns) {
        var grid = [];
        var row;
        var column;

        for (row = 0; row < rows; row += 1) {
            grid[row] = [];

            for (column = 0; column < columns; column += 1) {
                grid[row][column] = null;
            }
        }

        return grid;
    }

    function getCellCenter(boardMetrics, row, column) {
        return boardMetrics.cellCenters[row][column];
    }

    function setCanvasCursor(state, cursor) {
        if (state && state.renderer && state.renderer.domElement) {
            state.renderer.domElement.style.cursor = cursor;
        }
    }

    function setPieceTier(state, piece, tier) {
        piece.userData.tier = tier;
        piece.material = state.pieceMaterials[tier - 1];
    }

    function snapPieceToCell(state, piece, row, column) {
        var center = getCellCenter(state.boardMetrics, row, column);

        piece.position.set(center.x, center.y, state.config.pieces.baseZ);
        piece.scale.setScalar(1);
        piece.userData.row = row;
        piece.userData.column = column;
    }

    function createPiece(state, row, column, tier) {
        var piece = new THREE.Mesh(state.pieceGeometry, state.pieceMaterials[tier - 1]);
        piece.userData = {
            isPiece: true,
            tier: tier,
            row: row,
            column: column
        };

        snapPieceToCell(state, piece, row, column);
        state.grid[row][column] = piece;
        state.piecesGroup.add(piece);
        return piece;
    }

    function populateInitialPieces(state) {
        var initialTier = state.config.pieces.initialTier || 1;
        var row;
        var column;

        for (row = 0; row < state.config.board.rows; row += 1) {
            for (column = 0; column < state.config.board.columns; column += 1) {
                createPiece(state, row, column, initialTier);
            }
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

    function findClosestCell(state, localX, localY) {
        var closestCell = null;
        var closestDistance = Infinity;
        var row;
        var column;

        for (row = 0; row < state.boardMetrics.rows; row += 1) {
            for (column = 0; column < state.boardMetrics.columns; column += 1) {
                var center = getCellCenter(state.boardMetrics, row, column);
                var deltaX = localX - center.x;
                var deltaY = localY - center.y;
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

    function movePieceToCell(state, piece, targetRow, targetColumn) {
        var sourceRow = piece.userData.row;
        var sourceColumn = piece.userData.column;

        state.grid[sourceRow][sourceColumn] = null;
        state.grid[targetRow][targetColumn] = piece;
        snapPieceToCell(state, piece, targetRow, targetColumn);
    }

    function mergePieces(state, sourcePiece, targetPiece) {
        var sourceRow = sourcePiece.userData.row;
        var sourceColumn = sourcePiece.userData.column;
        var nextTier = targetPiece.userData.tier + 1;

        state.grid[sourceRow][sourceColumn] = null;
        state.piecesGroup.remove(sourcePiece);
        setPieceTier(state, targetPiece, nextTier);
        snapPieceToCell(state, targetPiece, targetPiece.userData.row, targetPiece.userData.column);
    }

    function resetDraggedPiece(state) {
        if (!state.drag) {
            return;
        }

        snapPieceToCell(state, state.drag.piece, state.drag.sourceRow, state.drag.sourceColumn);
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
        var piece;
        var localPoint;

        if (state.drag) {
            return;
        }

        rect = state.renderer.domElement.getBoundingClientRect();
        pointer = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -(((event.clientY - rect.top) / rect.height) * 2 - 1)
        );

        state.raycaster.setFromCamera(pointer, state.camera);
        intersections = state.raycaster.intersectObjects(state.piecesGroup.children, false);

        if (!intersections.length) {
            return;
        }

        piece = intersections[0].object;
        localPoint = getBoardLocalPoint(event, state);

        if (!piece.userData.isPiece || !localPoint) {
            return;
        }

        state.drag = {
            piece: piece,
            sourceRow: piece.userData.row,
            sourceColumn: piece.userData.column,
            offsetX: localPoint.x - piece.position.x,
            offsetY: localPoint.y - piece.position.y,
            pointerId: event.pointerId
        };

        piece.position.z = state.config.pieces.dragZ;
        piece.scale.setScalar(state.config.pieces.dragScale);
        setPointerCapture(state.renderer.domElement, event.pointerId);
        setCanvasCursor(state, 'grabbing');
        state.render();
    }

    function onPointerMove(event, state) {
        var localPoint;

        if (!state.drag || event.pointerId !== state.drag.pointerId) {
            return;
        }

        localPoint = getBoardLocalPoint(event, state);

        if (!localPoint) {
            return;
        }

        state.drag.piece.position.set(
            localPoint.x - state.drag.offsetX,
            localPoint.y - state.drag.offsetY,
            state.config.pieces.dragZ
        );
        state.render();
    }

    function finishDrag(event, state) {
        var draggedPiece;
        var closestCell;
        var targetPiece;
        var canMerge;

        if (!state.drag || event.pointerId !== state.drag.pointerId) {
            return;
        }

        draggedPiece = state.drag.piece;
        closestCell = findClosestCell(state, draggedPiece.position.x, draggedPiece.position.y);

        if (!closestCell) {
            resetDraggedPiece(state);
        } else if (
            closestCell.row === state.drag.sourceRow &&
            closestCell.column === state.drag.sourceColumn
        ) {
            resetDraggedPiece(state);
        } else {
            targetPiece = state.grid[closestCell.row][closestCell.column];

            if (!targetPiece) {
                movePieceToCell(state, draggedPiece, closestCell.row, closestCell.column);
            } else {
                canMerge = (
                    targetPiece !== draggedPiece &&
                    targetPiece.userData.tier === draggedPiece.userData.tier &&
                    draggedPiece.userData.tier < state.maxTier
                );

                if (canMerge) {
                    mergePieces(state, draggedPiece, targetPiece);
                } else {
                    resetDraggedPiece(state);
                }
            }
        }

        releasePointerCapture(state.renderer.domElement, event.pointerId);
        state.drag = null;
        setCanvasCursor(state, 'grab');
        state.render();
    }

    function bindInteractions(state) {
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

    function createGame(config, assets) {
        var scene = new THREE.Scene();
        var camera = new THREE.OrthographicCamera();
        var renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        var backgroundSize = calculateBackgroundSize(config.background);
        var background = buildBackground(assets.backgroundTexture, backgroundSize);
        var board = buildBoard(config.board);
        var boardMetrics = board.userData.boardMetrics;
        var piecesGroup = new THREE.Group();
        var pieceGeometry = new THREE.PlaneGeometry(
            boardMetrics.cellSize * config.pieces.scale,
            boardMetrics.cellSize * config.pieces.scale
        );
        var state;

        board.add(piecesGroup);

        configureRenderer(renderer);
        updateCamera(camera, backgroundSize);

        appRoot.appendChild(renderer.domElement);
        renderer.domElement.style.touchAction = 'none';
        scene.add(background);
        scene.add(board);

        function onResize() {
            configureRenderer(renderer);
            updateCamera(camera, backgroundSize);
            render();
        }

        function render() {
            renderer.render(scene, camera);
        }

        state = {
            config: config,
            scene: scene,
            camera: camera,
            renderer: renderer,
            board: board,
            boardMetrics: boardMetrics,
            background: background,
            piecesGroup: piecesGroup,
            pieceGeometry: pieceGeometry,
            pieceMaterials: createPieceMaterials(assets.pieceTextures),
            grid: createGrid(config.board.rows, config.board.columns),
            raycaster: new THREE.Raycaster(),
            drag: null,
            maxTier: config.pieces.texturePaths.length,
            render: render
        };

        populateInitialPieces(state);
        bindInteractions(state);
        window.addEventListener('resize', onResize);

        window.MergeMystery = {
            config: config,
            scene: scene,
            camera: camera,
            renderer: renderer,
            board: board,
            background: background,
            grid: state.grid,
            state: state,
            render: render
        };

        render();
    }

    loadConfig().then(function (config) {
        var backgroundPath = config.background && config.background.texturePath
            ? config.background.texturePath
            : 'assets/background.png';
        var piecePaths = config.pieces && config.pieces.texturePaths
            ? config.pieces.texturePaths
            : [];

        return Promise.all([
            loadTexture(backgroundPath),
            loadTextures(piecePaths)
        ]).then(function (results) {
            createGame(config, {
                backgroundTexture: results[0],
                pieceTextures: results[1]
            });
        });
    }).catch(function (error) {
        console.error(error);
        showError(error.message + ' Run this ad from a local server so the JSON config can load.');
    });
})(window);
