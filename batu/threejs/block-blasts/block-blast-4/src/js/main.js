import * as THREE from 'three';
import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { SceneManager } from './SceneManager.js';
import { buildBoard, createGrid } from './Board.js';
import { buildTray } from './ShapeTray.js';
import { bindInteractions } from './Interaction.js';
import { buildHud, refreshScore, hideGameOver } from './Hud.js';
import { createParticlePool, clearParticles } from './LineClear.js';
import { scheduleTutorial, destroyTutorial } from './Tutorial.js';

var CONFIG_PATH = 'src/config/game-config.json';
var appRoot = document.getElementById('app') || document.body;
var errorBanner = document.getElementById('error-banner');

function showError(message) {
    if (!errorBanner) {
        return;
    }

    errorBanner.textContent = message;
    errorBanner.hidden = false;
}

function clearBoard(state) {
    var r;
    var c;

    while (state.boardCells.children.length) {
        state.boardCells.remove(state.boardCells.children[0]);
    }

    for (r = 0; r < state.grid.length; r += 1) {
        for (c = 0; c < state.grid[r].length; c += 1) {
            state.grid[r][c] = null;
        }
    }
}

function clearTrayGroups(state) {
    var i;
    var slot;

    for (i = 0; i < state.traySlots.length; i += 1) {
        slot = state.traySlots[i];

        if (slot.group) {
            state.scene.remove(slot.group);
            slot.group = null;
        }

        if (slot.bgMesh) {
            state.scene.remove(slot.bgMesh);
            slot.bgMesh = null;
        }
    }

    state.traySlots = [];
}

function clearGhostMeshes(state) {
    var i;

    if (!state.ghostMeshes) {
        return;
    }

    for (i = 0; i < state.ghostMeshes.length; i += 1) {
        state.scene.remove(state.ghostMeshes[i]);
    }

    state.ghostMeshes = [];
}

function resetGame(state) {
    state.drag = null;
    state.score = 0;
    state.gameOver = false;
    state.hasUserInteracted = false;

    clearParticles(state);
    destroyTutorial(state);
    clearBoard(state);
    clearTrayGroups(state);
    clearGhostMeshes(state);

    buildTray(state);
    refreshScore(state);
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

function createBackgroundMesh(config) {
    var worldHeight = config.world.height;
    var aspect = config.world.sourceWidth / config.world.sourceHeight;
    var worldWidth = worldHeight * aspect;
    var geo = new THREE.PlaneGeometry(worldWidth, worldHeight);
    var mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#0f0f1e') });
    var mesh = new THREE.Mesh(geo, mat);

    mesh.position.z = -5;
    return mesh;
}

function createGame(config) {
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    var sceneManager = new SceneManager(scene, renderer);
    var board = buildBoard(config.board);
    var boardMetrics = board.userData.boardMetrics;
    var boardCells = new THREE.Group();
    var bgMesh = createBackgroundMesh(config);
    var bgSize = {
        width: config.world.height * (config.world.sourceWidth / config.world.sourceHeight),
        height: config.world.height
    };
    var state;

    board.add(boardCells);
    sceneManager.addObject(bgMesh);
    sceneManager.addObject(board);

    SceneSetup.configureRenderer(renderer);
    SceneSetup.fitOrthographicCamera(camera, bgSize);

    renderer.setClearColor(new THREE.Color('#0f0f1e'));
    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    state = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        board: board,
        boardMetrics: boardMetrics,
        boardCells: boardCells,
        grid: createGrid(config.board.rows, config.board.columns),
        traySlots: [],
        ghostMeshes: [],
        raycaster: new THREE.Raycaster(),
        drag: null,
        score: 0,
        gameOver: false,
        hasUserInteracted: false,
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        particlePool: createParticlePool(),
        activeParticles: new Set(),
        clock: new THREE.Clock(),
        animationFrameId: null,
        onRestart: null
    };

    state.onRestart = function () {
        hideGameOver();
        resetGame(state);
    };

    buildTray(state);
    buildHud(state, state.onRestart);
    refreshScore(state);
    bindInteractions(state);
    scheduleTutorial(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, bgSize);
    });

    window.BlockBlast = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        board: board,
        sceneManager: sceneManager,
        state: state
    };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});
