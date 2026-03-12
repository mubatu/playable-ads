(function (window) {
    'use strict';

    var config = window.GameConfig;

    var tileGroup = new THREE.Group();
    var cells = [];   // 2D array: cells[row][col] = { row, col, color, mesh }
    var allMeshes = [];

    function removeWhiteBackground(image) {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var px = data.data;
        var threshold = 240;
        for (var i = 0; i < px.length; i += 4) {
            if (px[i] > threshold && px[i + 1] > threshold && px[i + 2] > threshold) {
                px[i + 3] = 0;
            }
        }
        ctx.putImageData(data, 0, 0);
        return canvas;
    }

    var _rows = 0;
    var _cols = 0;
    var _step = 0;
    var _startX = 0;
    var _startY = 0;

    function worldPos(row, col) {
        return {
            x: _startX + col * _step,
            y: _startY - row * _step
        };
    }

    function init(scene, onReady) {
        var grid = config.GRID_DATA;
        _rows = grid.length;
        _cols = grid[0].length;

        var tileSize = config.GRID_TILE_SIZE;
        var gap = config.GRID_GAP;
        _step = tileSize + gap;

        var gridWidth = _cols * tileSize + (_cols - 1) * gap;
        var gridHeight = _rows * tileSize + (_rows - 1) * gap;

        _startX = -gridWidth * 0.5 + tileSize * 0.5 + config.GRID_OFFSET_X;
        _startY = gridHeight * 0.5 - tileSize * 0.5 + config.GRID_OFFSET_Y;

        var textureCache = {};
        var pending = 0;

        var uniqueLetters = {};
        for (var r = 0; r < _rows; r++) {
            for (var c = 0; c < _cols; c++) {
                uniqueLetters[grid[r][c]] = true;
            }
        }

        var letters = Object.keys(uniqueLetters);
        pending = letters.length;

        letters.forEach(function (letter) {
            var path = config.COLOR_MAP[letter];
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                var canvas = removeWhiteBackground(img);
                var texture = new THREE.CanvasTexture(canvas);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                textureCache[letter] = texture;

                pending--;
                if (pending === 0) {
                    buildGrid(grid, textureCache);
                    scene.add(tileGroup);
                    if (onReady) onReady();
                }
            };
            img.src = path;
        });
    }

    function buildGrid(grid, textureCache) {
        var tileSize = config.GRID_TILE_SIZE;
        var geo = new THREE.PlaneGeometry(tileSize, tileSize);

        for (var r = 0; r < _rows; r++) {
            cells[r] = [];
            for (var c = 0; c < _cols; c++) {
                var letter = grid[r][c];
                var texture = textureCache[letter];
                var mat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    alphaTest: 0.5
                });

                var mesh = new THREE.Mesh(geo, mat);
                var pos = worldPos(r, c);
                mesh.position.set(pos.x, pos.y, config.GRID_Z);

                tileGroup.add(mesh);
                allMeshes.push(mesh);

                cells[r][c] = {
                    row: r,
                    col: c,
                    color: letter,
                    mesh: mesh,
                    texture: texture
                };
            }
        }
    }

    function getCell(row, col) {
        if (row < 0 || row >= _rows || col < 0 || col >= _cols) return null;
        return cells[row][col];
    }

    function getCellFromMesh(mesh) {
        for (var r = 0; r < _rows; r++) {
            for (var c = 0; c < _cols; c++) {
                if (cells[r][c] && cells[r][c].mesh === mesh) {
                    return cells[r][c];
                }
            }
        }
        return null;
    }

    function swapCells(a, b) {
        var tempColor = a.color;
        var tempTex = a.texture;

        a.color = b.color;
        a.texture = b.texture;
        a.mesh.material.map = b.texture;
        a.mesh.material.needsUpdate = true;

        b.color = tempColor;
        b.texture = tempTex;
        b.mesh.material.map = tempTex;
        b.mesh.material.needsUpdate = true;
    }

    function findMatches() {
        var matched = [];

        // Check rows for BLAST_MATCH_COUNT consecutive same color
        for (var r = 0; r < _rows; r++) {
            var run = 1;
            for (var c = 1; c < _cols; c++) {
                if (cells[r][c].color && cells[r][c].color === cells[r][c - 1].color) {
                    run++;
                } else {
                    if (run >= config.BLAST_MATCH_COUNT) {
                        for (var k = c - run; k < c; k++) {
                            matched.push(cells[r][k]);
                        }
                    }
                    run = 1;
                }
            }
            if (run >= config.BLAST_MATCH_COUNT) {
                for (var k2 = _cols - run; k2 < _cols; k2++) {
                    matched.push(cells[r][k2]);
                }
            }
        }

        // Check columns for BLAST_MATCH_COUNT consecutive same color
        for (var c2 = 0; c2 < _cols; c2++) {
            var runV = 1;
            for (var r2 = 1; r2 < _rows; r2++) {
                if (cells[r2][c2].color && cells[r2][c2].color === cells[r2 - 1][c2].color) {
                    runV++;
                } else {
                    if (runV >= config.BLAST_MATCH_COUNT) {
                        for (var k3 = r2 - runV; k3 < r2; k3++) {
                            matched.push(cells[k3][c2]);
                        }
                    }
                    runV = 1;
                }
            }
            if (runV >= config.BLAST_MATCH_COUNT) {
                for (var k4 = _rows - runV; k4 < _rows; k4++) {
                    matched.push(cells[k4][c2]);
                }
            }
        }

        // Deduplicate
        var unique = [];
        var seen = {};
        for (var i = 0; i < matched.length; i++) {
            var key = matched[i].row + ',' + matched[i].col;
            if (!seen[key]) {
                seen[key] = true;
                unique.push(matched[i]);
            }
        }

        return unique;
    }

    function removeCells(cellList) {
        for (var i = 0; i < cellList.length; i++) {
            var cell = cellList[i];
            cell.color = null;
            cell.texture = null;
            cell.mesh.visible = false;
        }
    }

    function getRows() { return _rows; }
    function getCols() { return _cols; }

    function isAllCleared() {
        for (var r = 0; r < _rows; r++) {
            for (var c = 0; c < _cols; c++) {
                if (cells[r][c] && cells[r][c].color !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    // Find the Y position of the lowest visible row in the grid
    function getLowerBound() {
        var lowestRow = -1;
        for (var r = _rows - 1; r >= 0; r--) {
            for (var c = 0; c < _cols; c++) {
                if (cells[r][c] && cells[r][c].color !== null) {
                    lowestRow = r;
                    break;
                }
            }
            if (lowestRow >= 0) break;
        }
        if (lowestRow < 0) {
            // All cells removed — return top of grid area
            return _startY + config.GRID_TILE_SIZE * 0.5;
        }
        var pos = worldPos(lowestRow, 0);
        return pos.y - config.GRID_TILE_SIZE * 0.5;
    }

    window.GameGrid = {
        init: init,
        group: tileGroup,
        meshes: allMeshes,
        getCell: getCell,
        getCellFromMesh: getCellFromMesh,
        swapCells: swapCells,
        findMatches: findMatches,
        removeCells: removeCells,
        worldPos: worldPos,
        getRows: getRows,
        getCols: getCols,
        getLowerBound: getLowerBound,
        isAllCleared: isAllCleared
    };
})(window);
