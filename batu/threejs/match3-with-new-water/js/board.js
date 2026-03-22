(function (window) {
    'use strict';

    var config = window.GameConfig;

    var boardWidth = config.COLS * (config.TILE_SIZE + config.TILE_GAP) - config.TILE_GAP;
    var boardHeight = config.ROWS * (config.TILE_SIZE + config.TILE_GAP) - config.TILE_GAP;

    var scene = null;
    var textureLoader = new THREE.TextureLoader();

    var fixedTileGeometry = new THREE.PlaneGeometry(config.TILE_SIZE, config.TILE_SIZE);
    var colorTileGeometry = new THREE.PlaneGeometry(
        config.TILE_SIZE * config.COLOR_TILE_SCALE,
        config.TILE_SIZE * config.COLOR_TILE_SCALE
    );

    var fixedTileMaterial = null;
    var colorTileMaterials = [];
    var grid = [];
    var colorMeshes = [];
    var waterGrid = [];
    var waterBodyMesh = null;
    var boardTopY = boardHeight * 0.5 - config.BOTTOM_OFFSET;
    var waterBodyMaterial = new THREE.MeshBasicMaterial({
        color: config.WATER_COLOR,
        transparent: true,
        opacity: config.WATER_CELL_OPACITY,
        depthWrite: false
    });

    function createTextureWithTransparentWhite(image, threshold) {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        for (var i = 0; i < data.length; i += 4) {
            var red = data[i];
            var green = data[i + 1];
            var blue = data[i + 2];

            if (red >= threshold && green >= threshold && blue >= threshold) {
                data[i + 3] = 0;
            }
        }

        context.putImageData(imageData, 0, 0);

        var texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }

    function loadTexture(path, onLoad) {
        textureLoader.load(path, function (texture) {
            onLoad(texture);
        });
    }

    function loadColorMaterials(onLoad) {
        var loadedCount = 0;
        var materials = new Array(config.COLOR_TEXTURE_PATHS.length);

        for (var i = 0; i < config.COLOR_TEXTURE_PATHS.length; i += 1) {
            (function (index) {
                loadTexture(config.COLOR_TEXTURE_PATHS[index], function (texture) {
                    var cleanTexture = createTextureWithTransparentWhite(texture.image, config.WHITE_THRESHOLD);
                    materials[index] = new THREE.MeshBasicMaterial({
                        map: cleanTexture,
                        transparent: true,
                        alphaTest: 0.02
                    });

                    loadedCount += 1;
                    if (loadedCount === config.COLOR_TEXTURE_PATHS.length) {
                        onLoad(materials);
                    }
                });
            })(i);
        }
    }

    function getGridColor(colorGrid, row, col) {
        if (row < 0 || row >= config.ROWS || col < 0 || col >= config.COLS) {
            return -1;
        }

        if (!colorGrid[row]) {
            return -1;
        }

        if (typeof colorGrid[row][col] !== 'number') {
            return -1;
        }

        return colorGrid[row][col];
    }

    function createsMatchSeed(colorGrid, row, col, colorIndex) {
        var left1 = getGridColor(colorGrid, row, col - 1);
        var left2 = getGridColor(colorGrid, row, col - 2);
        if (left1 === colorIndex && left2 === colorIndex) {
            return true;
        }

        var up1 = getGridColor(colorGrid, row - 1, col);
        var up2 = getGridColor(colorGrid, row - 2, col);
        if (up1 === colorIndex && up2 === colorIndex) {
            return true;
        }

        var upLeft = getGridColor(colorGrid, row - 1, col - 1);
        if (left1 === colorIndex && up1 === colorIndex && upLeft === colorIndex) {
            return true;
        }

        return false;
    }

    function hasAnySeedMatch(colorGrid) {
        var row;
        var col;

        for (row = 0; row < config.ROWS; row += 1) {
            var runLength = 1;

            for (col = 1; col < config.COLS; col += 1) {
                if (
                    getGridColor(colorGrid, row, col) >= 0 &&
                    getGridColor(colorGrid, row, col) === getGridColor(colorGrid, row, col - 1)
                ) {
                    runLength += 1;
                } else {
                    runLength = 1;
                }

                if (runLength >= 3) {
                    return true;
                }
            }
        }

        for (col = 0; col < config.COLS; col += 1) {
            var verticalRunLength = 1;

            for (row = 1; row < config.ROWS; row += 1) {
                if (
                    getGridColor(colorGrid, row, col) >= 0 &&
                    getGridColor(colorGrid, row, col) === getGridColor(colorGrid, row - 1, col)
                ) {
                    verticalRunLength += 1;
                } else {
                    verticalRunLength = 1;
                }

                if (verticalRunLength >= 3) {
                    return true;
                }
            }
        }

        for (row = 0; row < config.ROWS - 1; row += 1) {
            for (col = 0; col < config.COLS - 1; col += 1) {
                var color = getGridColor(colorGrid, row, col);
                if (
                    color >= 0 &&
                    getGridColor(colorGrid, row, col + 1) === color &&
                    getGridColor(colorGrid, row + 1, col) === color &&
                    getGridColor(colorGrid, row + 1, col + 1) === color
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    function generateSafeInitialColors() {
        var attempt = 0;

        while (true) {
            attempt += 1;
            var colorGrid = [];
            var failed = false;

            for (var row = 0; row < config.ROWS; row += 1) {
                colorGrid[row] = [];

                for (var col = 0; col < config.COLS; col += 1) {
                    var availableColors = [];

                    for (var colorIndex = 0; colorIndex < colorTileMaterials.length; colorIndex += 1) {
                        if (!createsMatchSeed(colorGrid, row, col, colorIndex)) {
                            availableColors.push(colorIndex);
                        }
                    }

                    if (availableColors.length === 0) {
                        failed = true;
                        break;
                    }

                    var randomIndex = Math.floor(Math.random() * availableColors.length);
                    colorGrid[row][col] = availableColors[randomIndex];
                }

                if (failed) {
                    break;
                }
            }

            if (!failed && !hasAnySeedMatch(colorGrid)) {
                return colorGrid;
            }

            if (attempt % 200 === 0) {
                console.warn('Match3 board: still searching for a safe initial layout, attempts:', attempt);
            }
        }
    }

    function getTilePosition(row, col) {
        return {
            x: col * (config.TILE_SIZE + config.TILE_GAP) - boardWidth * 0.5 + config.TILE_SIZE * 0.5,
            y: boardHeight * 0.5 - row * (config.TILE_SIZE + config.TILE_GAP) - config.TILE_SIZE * 0.5 - config.BOTTOM_OFFSET
        };
    }

    function setCellColor(row, col, colorIndex) {
        var cell = grid[row][col];
        cell.colorIndex = colorIndex;

        if (colorIndex < 0) {
            cell.colorMesh.visible = false;
            return;
        }

        cell.colorMesh.material = colorTileMaterials[colorIndex];
        cell.colorMesh.visible = true;
    }

    function buildBoard() {
        grid = [];
        colorMeshes = [];
        waterGrid = [];
        var initialColors = generateSafeInitialColors();

        for (var row = 0; row < config.ROWS; row += 1) {
            grid[row] = [];
            waterGrid[row] = [];

            for (var col = 0; col < config.COLS; col += 1) {
                var position = getTilePosition(row, col);
                var colorIndex = initialColors[row][col];

                var fixedTile = new THREE.Mesh(fixedTileGeometry, fixedTileMaterial);
                fixedTile.position.set(position.x, position.y, 0);
                scene.add(fixedTile);

                var colorTile = new THREE.Mesh(colorTileGeometry, colorTileMaterials[colorIndex]);
                colorTile.position.set(position.x, position.y, 0.01);
                colorTile.userData.row = row;
                colorTile.userData.col = col;
                colorTile.userData.kind = 'color';
                scene.add(colorTile);

                grid[row][col] = {
                    row: row,
                    col: col,
                    colorIndex: colorIndex,
                    fixedMesh: fixedTile,
                    colorMesh: colorTile
                };

                waterGrid[row][col] = false;
                colorMeshes.push(colorTile);
            }
        }
    }

    function init(targetScene, onReady) {
        scene = targetScene;

        loadTexture(config.BACKGROUND_TEXTURE, function (backgroundTexture) {
            backgroundTexture.colorSpace = THREE.SRGBColorSpace;
            scene.background = backgroundTexture;

            loadTexture(config.FIXED_TILE_TEXTURE, function (fixedTextureRaw) {
                var fixedTexture = createTextureWithTransparentWhite(
                    fixedTextureRaw.image,
                    config.WHITE_THRESHOLD
                );

                fixedTileMaterial = new THREE.MeshBasicMaterial({
                    map: fixedTexture,
                    transparent: true,
                    alphaTest: 0.02
                });

                loadColorMaterials(function (materials) {
                    colorTileMaterials = materials;
                    buildBoard();
                    onReady();
                });
            });
        });
    }

    function getBoardSize() {
        return {
            width: boardWidth,
            height: boardHeight
        };
    }

    function getRows() {
        return config.ROWS;
    }

    function getCols() {
        return config.COLS;
    }

    function getColor(row, col) {
        if (row < 0 || row >= config.ROWS || col < 0 || col >= config.COLS) {
            return -1;
        }
        return grid[row][col].colorIndex;
    }

    function getCell(row, col) {
        if (row < 0 || row >= config.ROWS || col < 0 || col >= config.COLS) {
            return null;
        }
        return grid[row][col];
    }

    function getCellFromMesh(mesh) {
        if (!mesh || !mesh.userData) {
            return null;
        }
        return getCell(mesh.userData.row, mesh.userData.col);
    }

    function getColorMeshes() {
        var meshes = [];
        for (var i = 0; i < colorMeshes.length; i += 1) {
            if (colorMeshes[i].visible) {
                meshes.push(colorMeshes[i]);
            }
        }
        return meshes;
    }

    function areAdjacent(cellA, cellB) {
        if (!cellA || !cellB) {
            return false;
        }

        var rowDistance = Math.abs(cellA.row - cellB.row);
        var colDistance = Math.abs(cellA.col - cellB.col);
        return rowDistance + colDistance === 1;
    }

    function setSelected(cell, isSelected) {
        if (!cell || cell.colorIndex < 0 || !cell.colorMesh.visible) {
            return;
        }

        var scale = isSelected ? config.SELECT_SCALE : 1;
        cell.colorMesh.scale.set(scale, scale, 1);
    }

    function swapCells(cellA, cellB) {
        if (!cellA || !cellB) {
            return;
        }

        var firstColor = cellA.colorIndex;
        var secondColor = cellB.colorIndex;
        setCellColor(cellA.row, cellA.col, secondColor);
        setCellColor(cellB.row, cellB.col, firstColor);
    }

    function propagateWater() {
        var pq = [];
        var dist = [];
        var r, c;

        for (r = 0; r < config.ROWS; r += 1) {
            dist[r] = [];
            for (c = 0; c < config.COLS; c += 1) {
                dist[r][c] = Infinity;
            }
        }

        var fillOrder = [];
        var entryCols = config.WATER_ENTRY_COLS;

        for (var e = 0; e < entryCols.length; e += 1) {
            var ec = entryCols[e];
            if (ec >= 0 && ec < config.COLS && grid[0][ec].colorIndex < 0) {
                dist[0][ec] = 0;
                pq.push({ row: 0, col: ec, d: 0 });
            }
        }

        while (pq.length > 0) {
            var minIdx = 0;
            for (var i = 1; i < pq.length; i += 1) {
                if (pq[i].d < pq[minIdx].d) { minIdx = i; }
            }
            var cur = pq.splice(minIdx, 1)[0];

            if (cur.d > dist[cur.row][cur.col]) { continue; }

            if (!waterGrid[cur.row][cur.col]) {
                fillOrder.push(cur);
            }

            var neighbors = [
                { row: cur.row + 1, col: cur.col, cost: 1 },
                { row: cur.row, col: cur.col - 1, cost: 2 },
                { row: cur.row, col: cur.col + 1, cost: 2 },
                { row: cur.row - 1, col: cur.col, cost: 3 }
            ];

            for (var n = 0; n < neighbors.length; n += 1) {
                var nr = neighbors[n].row;
                var nc = neighbors[n].col;
                var nd = cur.d + neighbors[n].cost;

                if (nr < 0 || nr >= config.ROWS || nc < 0 || nc >= config.COLS) { continue; }
                if (grid[nr][nc].colorIndex >= 0) { continue; }
                if (nd >= dist[nr][nc]) { continue; }

                dist[nr][nc] = nd;
                pq.push({ row: nr, col: nc, d: nd });
            }
        }

        var delayMs = config.WATER_FILL_DELAY_MS;
        for (var f = 0; f < fillOrder.length; f += 1) {
            (function (item) {
                setTimeout(function () {
                    waterGrid[item.row][item.col] = true;
                    rebuildWaterBody();
                    window.GameWater.drainVolume(config.WATER_CELL_VOLUME);
                }, item.d * delayMs);
            })(fillOrder[f]);
        }
    }

    function rebuildWaterBody() {
        if (waterBodyMesh) {
            scene.remove(waterBodyMesh);
            waterBodyMesh.geometry.dispose();
            waterBodyMesh = null;
        }

        var step = config.TILE_SIZE + config.TILE_GAP;
        var quads = [];

        for (var col = 0; col < config.COLS; col += 1) {
            var runStart = -1;

            for (var row = 0; row <= config.ROWS; row += 1) {
                var isWater = row < config.ROWS && waterGrid[row] && waterGrid[row][col];

                if (isWater && runStart < 0) {
                    runStart = row;
                }

                if (!isWater && runStart >= 0) {
                    var topPos = getTilePosition(runStart, col);
                    var botPos = getTilePosition(row - 1, col);

                    var top = topPos.y + config.TILE_SIZE * 0.5;
                    var bottom = botPos.y - config.TILE_SIZE * 0.5;

                    if (runStart === 0) {
                        top = boardTopY;
                    }

                    var cx = topPos.x;
                    var left = cx - step * 0.5;
                    var right = cx + step * 0.5;

                    quads.push({ top: top, bottom: bottom, left: left, right: right });
                    runStart = -1;
                }
            }
        }

        if (quads.length === 0) {
            return;
        }

        var vertexCount = quads.length * 6;
        var positions = new Float32Array(vertexCount * 3);
        var idx = 0;

        for (var q = 0; q < quads.length; q += 1) {
            var quad = quads[q];
            positions[idx++] = quad.left;  positions[idx++] = quad.top;    positions[idx++] = 0;
            positions[idx++] = quad.left;  positions[idx++] = quad.bottom; positions[idx++] = 0;
            positions[idx++] = quad.right; positions[idx++] = quad.top;    positions[idx++] = 0;
            positions[idx++] = quad.right; positions[idx++] = quad.top;    positions[idx++] = 0;
            positions[idx++] = quad.left;  positions[idx++] = quad.bottom; positions[idx++] = 0;
            positions[idx++] = quad.right; positions[idx++] = quad.bottom; positions[idx++] = 0;
        }

        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        waterBodyMesh = new THREE.Mesh(geometry, waterBodyMaterial);
        waterBodyMesh.position.z = 0.04;
        scene.add(waterBodyMesh);
    }

    function removeCells(cells) {
        for (var i = 0; i < cells.length; i += 1) {
            var row = cells[i].row;
            var col = cells[i].col;
            var cell = getCell(row, col);

            if (cell && cell.colorIndex >= 0) {
                cell.colorMesh.scale.set(1, 1, 1);
                setCellColor(row, col, -1);
                cell.fixedMesh.visible = false;
            }
        }

        propagateWater();
    }

    window.GameBoard = {
        init: init,
        getBoardSize: getBoardSize,
        getRows: getRows,
        getCols: getCols,
        getColor: getColor,
        getCell: getCell,
        getCellFromMesh: getCellFromMesh,
        getColorMeshes: getColorMeshes,
        areAdjacent: areAdjacent,
        setSelected: setSelected,
        swapCells: swapCells,
        removeCells: removeCells
    };
})(window);
