import * as THREE from 'three';
import { SceneManager } from '../../universal-modules/src/UniversalClasses.js';
import { PoolFactory } from '../../universal-modules/src/ObjectPool.js';
import { UIScene } from '../../universal-modules/src/UIScene/UIScene.js';

const CONFIG_PATH = 'config/game-config.json';
const appRoot = document.getElementById('app') || document.body;
const errorBanner = document.getElementById('error-banner');
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const MERGE_PARTICLE_COLORS = ['#fff5d6', '#ffd88a', '#ffba73', '#ff8f6a'];

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

function getCellWorldPosition(state, row, column, z) {
    var center = getCellCenter(state.boardMetrics, row, column);
    var localPoint = new THREE.Vector3(center.x, center.y, z);

    state.board.updateMatrixWorld(true);
    return state.board.localToWorld(localPoint);
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

function clearBoardPieces(state) {
    var row;
    var column;

    while (state.piecesGroup.children.length) {
        state.piecesGroup.remove(state.piecesGroup.children[0]);
    }

    for (row = 0; row < state.grid.length; row += 1) {
        for (column = 0; column < state.grid[row].length; column += 1) {
            state.grid[row][column] = null;
        }
    }
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

function findHighestTier(state) {
    var highestTier = 1;
    var row;
    var column;

    for (row = 0; row < state.grid.length; row += 1) {
        for (column = 0; column < state.grid[row].length; column += 1) {
            if (state.grid[row][column]) {
                highestTier = Math.max(highestTier, state.grid[row][column].userData.tier);
            }
        }
    }

    return highestTier;
}

function getUiElement(uiScene, id) {
    return uiScene.uiElements.find(function (element) {
        return element.config.id === id;
    }) || null;
}

function refreshHud(state) {
    state.highestTier = findHighestTier(state);

    if (state.ui.progressBar) {
        state.ui.progressBar.setValue(state.highestTier);
    }
}

function createParticlePool() {
    var particleGeometry = new THREE.PlaneGeometry(0.22, 0.22);

    return PoolFactory.createThreeObjectPool(
        function () {
            var particle = new THREE.Mesh(
                particleGeometry,
                new THREE.MeshBasicMaterial({
                    color: '#ffffff',
                    transparent: true,
                    opacity: 0,
                    depthWrite: false
                })
            );

            particle.visible = false;
            particle.userData.velocity = new THREE.Vector3();
            particle.userData.life = 0;
            particle.userData.maxLife = 0;
            particle.userData.baseScale = 1;
            particle.update = null;
            return particle;
        },
        function (particle) {
            particle.visible = false;
            particle.material.opacity = 0;
            particle.userData.velocity.set(0, 0, 0);
            particle.userData.life = 0;
            particle.userData.maxLife = 0;
            particle.userData.baseScale = 1;
            particle.update = null;
        },
        20
    );
}

function releaseParticle(state, particle) {
    if (state.activeParticles.has(particle)) {
        state.activeParticles.delete(particle);
    }

    state.sceneManager.removeObject(particle);
    state.particlePool.release(particle);
}

function clearParticles(state) {
    Array.from(state.activeParticles).forEach(function (particle) {
        releaseParticle(state, particle);
    });
}

function emitMergeParticles(state, row, column, tier) {
    var centerWorld;
    var particleCount;
    var index;

    if (!state.fxEnabled) {
        return;
    }

    centerWorld = getCellWorldPosition(state, row, column, 0.6);
    particleCount = 8;

    for (index = 0; index < particleCount; index += 1) {
        var particle = state.particlePool.get();
        var angle = (Math.PI * 2 * index) / particleCount + (Math.random() * 0.35);
        var speed = 1.5 + (Math.random() * 1.2);
        var maxLife = 0.24 + (Math.random() * 0.2);
        var baseScale = 0.5 + (Math.random() * 0.4);

        particle.position.copy(centerWorld);
        particle.position.x += (Math.random() - 0.5) * 0.08;
        particle.position.y += (Math.random() - 0.5) * 0.08;
        particle.position.z = 0.6;
        particle.visible = true;
        particle.material.color.set(MERGE_PARTICLE_COLORS[Math.min(tier - 1, MERGE_PARTICLE_COLORS.length - 1)]);
        particle.material.opacity = 0.88;
        particle.userData.velocity.set(Math.cos(angle) * speed, Math.sin(angle) * speed, 0);
        particle.userData.life = maxLife;
        particle.userData.maxLife = maxLife;
        particle.userData.baseScale = baseScale;
        particle.scale.setScalar(baseScale);
        particle.update = function (delta) {
            var progress;

            particle.userData.life -= delta;

            if (particle.userData.life <= 0) {
                releaseParticle(state, particle);
                return;
            }

            progress = 1 - (particle.userData.life / particle.userData.maxLife);
            particle.position.addScaledVector(particle.userData.velocity, delta);
            particle.material.opacity = (1 - progress) * 0.88;
            particle.scale.setScalar(particle.userData.baseScale * (1 + (progress * 0.9)));
        };

        state.activeParticles.add(particle);
        state.sceneManager.addObject(particle);
    }
}

function clearTutorialDelay(state) {
    if (state.tutorialDelayId) {
        window.clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
}

function destroyTutorial(state) {
    clearTutorialDelay(state);

    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }

    if (window.MergeMystery) {
        window.MergeMystery.tutorial = null;
    }
}

function getCellWorldPointConfig(state, row, column, z) {
    var worldPosition;

    if (
        typeof row !== 'number' ||
        typeof column !== 'number' ||
        row < 0 ||
        column < 0 ||
        row >= state.grid.length ||
        column >= state.grid[0].length
    ) {
        return null;
    }

    worldPosition = getCellWorldPosition(
        state,
        row,
        column,
        typeof z === 'number' ? z : state.config.pieces.baseZ
    );

    return {
        space: 'world',
        x: worldPosition.x,
        y: worldPosition.y,
        z: worldPosition.z
    };
}

function resolveTutorialPoint(state, pointConfig) {
    if (!pointConfig) {
        return null;
    }

    if (pointConfig.space === 'grid') {
        return getCellWorldPointConfig(state, pointConfig.row, pointConfig.column, pointConfig.z);
    }

    if (pointConfig.space === 'world') {
        return {
            space: 'world',
            x: typeof pointConfig.x === 'number' ? pointConfig.x : 0,
            y: typeof pointConfig.y === 'number' ? pointConfig.y : 0,
            z: typeof pointConfig.z === 'number' ? pointConfig.z : state.config.pieces.baseZ
        };
    }

    if (pointConfig.space === 'pixels') {
        return {
            space: 'pixels',
            x: typeof pointConfig.x === 'number' ? pointConfig.x : 0,
            y: typeof pointConfig.y === 'number' ? pointConfig.y : 0
        };
    }

    if (pointConfig.space === 'screen') {
        return {
            space: 'screen',
            x: typeof pointConfig.x === 'number' ? pointConfig.x : 0.5,
            y: typeof pointConfig.y === 'number' ? pointConfig.y : 0.5
        };
    }

    if (typeof pointConfig.row === 'number' && typeof pointConfig.column === 'number') {
        return getCellWorldPointConfig(state, pointConfig.row, pointConfig.column, pointConfig.z);
    }

    if (typeof pointConfig.x !== 'number' || typeof pointConfig.y !== 'number') {
        return null;
    }

    return {
        space: 'screen',
        x: pointConfig.x,
        y: pointConfig.y
    };
}

function getPieceTutorialPoint(piece) {
    var worldPosition = new THREE.Vector3();

    piece.getWorldPosition(worldPosition);

    return {
        space: 'world',
        x: worldPosition.x,
        y: worldPosition.y,
        z: worldPosition.z
    };
}

function getAutoTutorialPair(state) {
    var row;
    var column;
    var piece;
    var rightPiece;
    var downPiece;

    for (row = 0; row < state.grid.length; row += 1) {
        for (column = 0; column < state.grid[row].length; column += 1) {
            piece = state.grid[row][column];

            if (!piece) {
                continue;
            }

            rightPiece = column + 1 < state.grid[row].length
                ? state.grid[row][column + 1]
                : null;

            if (rightPiece && rightPiece.userData.tier === piece.userData.tier) {
                return {
                    from: piece,
                    to: rightPiece
                };
            }

            downPiece = row + 1 < state.grid.length
                ? state.grid[row + 1][column]
                : null;

            if (downPiece && downPiece.userData.tier === piece.userData.tier) {
                return {
                    from: piece,
                    to: downPiece
                };
            }
        }
    }

    return null;
}

function getTutorialPair(state) {
    var tutorialConfig = state.config.tutorial || {};
    var configuredFromPoint = resolveTutorialPoint(state, tutorialConfig.from);
    var configuredToPoint = resolveTutorialPoint(state, tutorialConfig.to);
    var autoPair;

    if (configuredFromPoint && configuredToPoint) {
        return {
            from: configuredFromPoint,
            to: configuredToPoint
        };
    }

    autoPair = getAutoTutorialPair(state);

    if (!autoPair) {
        return null;
    }

    return {
        from: getPieceTutorialPoint(autoPair.from),
        to: getPieceTutorialPoint(autoPair.to)
    };
}

function ensureTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};
    var pair;

    if (!tutorialConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        destroyTutorial(state);
        return;
    }

    pair = getTutorialPair(state);

    if (!pair) {
        destroyTutorial(state);
        return;
    }

    if (!state.tutorial) {
        state.tutorial = new window.HandTutorial({
            container: state.renderer.domElement.parentElement,
            renderer: state.renderer,
            camera: state.camera,
            assetUrl: tutorialConfig.assetUrl,
            gesture: tutorialConfig.gesture || 'drag',
            duration: tutorialConfig.duration || 1.1,
            loop: true,
            loopDelay: tutorialConfig.loopDelay || 0.4,
            size: tutorialConfig.size || 132,
            rotation: 0,
            followDirection: false,
            flipX: false,
            showTrail: true,
            anchor: { x: 0.22, y: 0.08 },
            from: pair.from,
            to: pair.to
        });
    } else {
        state.tutorial.setConfig({
            assetUrl: tutorialConfig.assetUrl,
            gesture: tutorialConfig.gesture || 'drag',
            duration: tutorialConfig.duration || 1.1,
            loop: true,
            loopDelay: tutorialConfig.loopDelay || 0.4,
            size: tutorialConfig.size || 132
        });
        state.tutorial.setPoints(pair.from, pair.to);
    }

    if (window.MergeMystery) {
        window.MergeMystery.tutorial = state.tutorial;
    }
}

function scheduleTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};

    clearTutorialDelay(state);

    if (!tutorialConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        ensureTutorial(state);

        if (state.tutorial) {
            state.tutorial.play();
        }
    }, tutorialConfig.startDelayMs || 450);
}

function dismissTutorial(state) {
    state.hasUserInteracted = true;
    destroyTutorial(state);
}

function buildHud(state) {
    var uiScene = new UIScene({
        progressBars: [
            {
                id: 'best-cake-progress',
                initialValue: state.config.pieces.initialTier || 1,
                max: state.maxTier,
                textFormat: function (value, max) {
                    return 'Best Cake ' + value + '/' + max;
                },
                styles: {
                    top: '24px',
                    left: '24px',
                    right: '160px'
                }
            }
        ],
        buttons: [
            {
                id: 'restart-button',
                text: 'Restart',
                styles: {
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    padding: '11px 18px',
                    border: 'none',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #ffe18f 0%, #ffad6d 100%)',
                    color: '#163647',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 10px 18px rgba(22, 54, 71, 0.18)'
                },
                onClick: function () {
                    resetBoard(state);
                }
            }
        ],
        toggles: [
            {
                id: 'fx-toggle',
                initialState: true,
                labels: {
                    on: 'FX On',
                    off: 'FX Off'
                },
                styles: {
                    top: '78px',
                    right: '24px'
                },
                onToggle: function (isOn) {
                    state.fxEnabled = isOn;

                    if (!isOn) {
                        clearParticles(state);
                    }
                }
            }
        ]
    });
    var progressBar = getUiElement(uiScene, 'best-cake-progress');
    var toggle = getUiElement(uiScene, 'fx-toggle');

    if (progressBar) {
        progressBar.containerDiv.style.height = '18px';
        progressBar.containerDiv.style.borderRadius = '999px';
        progressBar.containerDiv.style.backgroundColor = 'rgba(22, 54, 71, 0.22)';
        progressBar.fill.style.background = 'linear-gradient(90deg, #ffe18f 0%, #ff9f67 100%)';
        progressBar.text.style.fontSize = '13px';
        progressBar.text.style.fontWeight = '700';
        progressBar.text.style.letterSpacing = '0.02em';
    }

    if (toggle) {
        toggle.label.style.fontWeight = '700';
        toggle.label.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.24)';
        toggle.track.style.boxShadow = '0 8px 16px rgba(22, 54, 71, 0.14)';
    }

    state.uiScene = uiScene;
    state.ui = {
        progressBar: progressBar,
        restartButton: getUiElement(uiScene, 'restart-button'),
        fxToggle: toggle
    };
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
    var targetRow = targetPiece.userData.row;
    var targetColumn = targetPiece.userData.column;
    var nextTier = targetPiece.userData.tier + 1;

    state.grid[sourceRow][sourceColumn] = null;
    state.piecesGroup.remove(sourcePiece);
    setPieceTier(state, targetPiece, nextTier);
    snapPieceToCell(state, targetPiece, targetRow, targetColumn);
    emitMergeParticles(state, targetRow, targetColumn, nextTier);
    refreshHud(state);
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

    dismissTutorial(state);

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

function resetBoard(state) {
    state.drag = null;
    state.hasUserInteracted = false;
    setCanvasCursor(state, 'grab');
    clearParticles(state);
    destroyTutorial(state);
    clearBoardPieces(state);
    populateInitialPieces(state);
    refreshHud(state);
    scheduleTutorial(state);
}

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        state.sceneManager.update(delta);
        if (state.tutorial) {
            state.tutorial.update(now);
        }
        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
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
    var sceneManager = new SceneManager(scene, renderer);
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
    renderer.domElement.style.cursor = 'grab';

    sceneManager.addObject(background);
    sceneManager.addObject(board);

    state = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
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
        highestTier: config.pieces.initialTier || 1,
        fxEnabled: true,
        particlePool: createParticlePool(),
        activeParticles: new Set(),
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        hasUserInteracted: false,
        clock: new THREE.Clock(),
        animationFrameId: null
    };

    populateInitialPieces(state);
    buildHud(state);
    refreshHud(state);
    bindInteractions(state);
    scheduleTutorial(state);

    window.addEventListener('resize', function () {
        configureRenderer(renderer);
        updateCamera(camera, backgroundSize);
    });

    window.MergeMystery = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        board: board,
        background: background,
        grid: state.grid,
        sceneManager: sceneManager,
        uiScene: state.uiScene,
        particlePool: state.particlePool,
        tutorial: state.tutorial,
        state: state
    };

    startLoop(state);
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
