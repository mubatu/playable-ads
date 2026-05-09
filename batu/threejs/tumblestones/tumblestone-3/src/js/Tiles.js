import * as THREE from 'three';
import { TextureUtils } from '../../../../reusables/components/TextureUtils.js';
import { createOutlineMesh } from './Board.js';

export function loadTileTextures(tileConfig) {
    var textureMap = {};
    var paths = tileConfig.colors.map(function (entry) {
        return entry.texture;
    });

    return TextureUtils.loadAll(paths).then(function (textures) {
        var i;

        for (i = 0; i < tileConfig.colors.length; i += 1) {
            textureMap[tileConfig.colors[i].id] = textures[i];
        }

        return textureMap;
    });
}

export function createTileMesh(colorId, texture, size, z) {
    var mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        })
    );

    mesh.position.z = z;
    mesh.renderOrder = 2;
    mesh.userData.colorId = colorId;
    mesh.userData.isTile = true;
    return mesh;
}

function getBandColorId(state, row) {
    var tileConfig = state.config.tiles;
    var bandSize = tileConfig.bandSize || 3;
    var bandOrder = tileConfig.bandOrder || tileConfig.colors.map(function (entry) {
        return entry.id;
    });
    var bandIndex = Math.floor((state.config.board.rows - 1 - row) / bandSize);

    return bandOrder[bandIndex % bandOrder.length];
}

export function populateTiles(state) {
    var rows = state.config.board.rows;
    var columns = state.config.board.columns;
    var tileSize = state.boardMetrics.cellSize * 0.88;
    var row;
    var column;

    for (row = 0; row < rows; row += 1) {
        for (column = 0; column < columns; column += 1) {
            var colorId = getBandColorId(state, row);
            var texture = state.tileTextures[colorId];
            var tile = {
                row: row,
                column: column,
                colorId: colorId,
                mesh: null,
                outline: null
            };
            var mesh = createTileMesh(colorId, texture, tileSize, state.config.tiles.baseZ);
            var center = state.boardMetrics.cellCenters[row][column];
            var outline = createOutlineMesh(tileSize, state.config.tiles.outlineZ);

            mesh.position.set(center.x, center.y, state.config.tiles.baseZ);
            mesh.userData.tile = tile;
            mesh.add(outline);

            tile.mesh = mesh;
            tile.outline = outline;
            state.grid[row][column] = tile;
            state.tilesGroup.add(mesh);
        }
    }
}

