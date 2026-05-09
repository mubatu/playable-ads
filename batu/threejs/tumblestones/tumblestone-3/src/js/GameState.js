import * as THREE from 'three';
import { Background } from '../../../../reusables/components/Background.js';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { buildBoard, createGrid } from './Board.js';
import { populateTiles } from './Tiles.js';
import { buildSlots, refreshSlotState } from './Slots.js';
import { refreshProgressDisplay } from './Hud.js';
import { updateInteractables } from './Gameplay.js';
import { destroyTutorial } from './Tutorial.js';

function disposeObject3D(state, object) {
    if (!object) {
        return;
    }

    if (state && state.sceneManager) {
        state.sceneManager.removeObject(object);
    }

    if (object.parent) {
        object.parent.remove(object);
    }

    object.traverse(function (node) {
        if (node.geometry) {
            node.geometry.dispose();
        }

        if (node.material) {
            if (Array.isArray(node.material)) {
                node.material.forEach(function (material) {
                    material.dispose();
                });
            } else {
                node.material.dispose();
            }
        }
    });
}

function clearGridTiles(state) {
    var row;
    var column;
    var tile;

    for (row = 0; row < state.grid.length; row += 1) {
        for (column = 0; column < state.grid[row].length; column += 1) {
            tile = state.grid[row][column];

            if (tile && tile.mesh) {
                state.tilesGroup.remove(tile.mesh);
                disposeObject3D(state, tile.mesh);
                state.grid[row][column] = null;
            }
        }
    }
}

function clearCollectedTiles(state) {
    var i;

    for (i = 0; i < state.collectedTiles.length; i += 1) {
        if (state.collectedTiles[i] && state.collectedTiles[i].mesh) {
            disposeObject3D(state, state.collectedTiles[i].mesh);
        }
    }
}

export function createGameState(config, textures) {
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    var background = new Background(config.background, textures.background);
    var board = buildBoard(config.board);
    var sceneManager = new SceneManager(scene, renderer);
    var tilesGroup = new THREE.Group();
    var slotsGroup = new THREE.Group();
    var colorPalette = {};
    var i;

    for (i = 0; i < config.tiles.colors.length; i += 1) {
        colorPalette[config.tiles.colors[i].id] = config.tiles.colors[i];
    }

    board.add(tilesGroup);

    return {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        background: background,
        board: board,
        boardMetrics: board.userData.boardMetrics,
        tilesGroup: tilesGroup,
        slotsGroup: slotsGroup,
        colorPalette: colorPalette,
        tileTextures: textures.tiles,
        grid: createGrid(config.board.rows, config.board.columns),
        slotBackgrounds: [],
        slotTargets: [],
        collectedTiles: new Array(config.slots.count).fill(null),
        interactableTiles: [],
        raycaster: new THREE.Raycaster(),
        currentCollectionColor: null,
        matchesCleared: 0,
        locked: true,
        gameOver: false,
        isPlaying: false,
        shakeTime: 0,
        animations: [],
        tutorial: null,
        tutorialDelayId: null,
        hasUserInteracted: false,
        uiScene: null,
        ui: {},
        clock: new THREE.Clock(),
        animationFrameId: null
    };
}

export function resetGame(state, options) {
    var startPlaying = !options || options.startPlaying !== false;

    if (state.ui.resultOverlay) {
        state.ui.resultOverlay.hide();
    }

    clearGridTiles(state);
    clearCollectedTiles(state);
    destroyTutorial(state);

    state.matchesCleared = 0;
    state.currentCollectionColor = null;
    state.collectedTiles = new Array(state.config.slots.count).fill(null);
    state.interactableTiles = [];
    state.animations = [];
    state.gameOver = false;
    state.isPlaying = startPlaying;
    state.locked = !startPlaying;
    state.shakeTime = 0;
    state.hasUserInteracted = false;
    state.board.position.x = 0;
    state.board.position.y = state.config.board.offsetY;

    state.grid = createGrid(state.config.board.rows, state.config.board.columns);
    populateTiles(state);

    if (!state.slotBackgrounds.length) {
        buildSlots(state);
    }

    updateInteractables(state);
    refreshSlotState(state);
    refreshProgressDisplay(state);

    if (startPlaying) {
        state.locked = false;
    }
}
