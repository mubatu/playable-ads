import * as THREE from 'three';
import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { Background } from '../../../../reusables/components/Background.js';
import { SceneManager } from './SceneManager.js';
import { buildBoard, createGrid } from './Board.js';
import { createGhostGroup } from './Shapes.js';
import { createParticlePool, clearParticles } from './ParticleFX.js';
import { initSpawnSlots, bindInteractions } from './Interaction.js';
import { buildHud, refreshScoreDisplay } from './Hud.js';
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

function createGradientTexture(topColor, bottomColor, width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width || 4;
    canvas.height = height || 8;
    var ctx = canvas.getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

function resetGame(state) {
    var i;
    var row;
    var col;
    var mesh;
    var overlay = document.getElementById('game-over-overlay');

    if (overlay) {
        overlay.remove();
    }

    state.gameOver = false;
    state.score = 0;
    state.drag = null;
    state.hasUserInteracted = false;
    state.shakeTime = 0;
    state.board.position.x = 0;
    state.board.position.y = state.config.board.offsetY;
    state.renderer.domElement.style.cursor = 'grab';

    clearParticles(state);
    destroyTutorial(state);

    for (row = 0; row < state.grid.length; row += 1) {
        for (col = 0; col < state.grid[row].length; col += 1) {
            mesh = state.grid[row][col];
            if (mesh) {
                state.piecesGroup.remove(mesh);
                state.grid[row][col] = null;
            }
        }
    }

    for (i = 0; i < state.spawnSlots.length; i += 1) {
        if (state.spawnSlots[i].group) {
            state.sceneManager.removeObject(state.spawnSlots[i].group);
        }
    }
    state.spawnSlots = [];

    refreshScoreDisplay(state);
    initSpawnSlots(state);
    scheduleTutorial(state);
}

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        state.sceneManager.update(delta);

        if (state.tutorial) {
            state.tutorial.update(now);
        }

        if (state.shakeTime > 0) {
            state.shakeTime -= delta;
            var shakeIntensity = Math.max(state.shakeTime, 0) * 8;
            state.board.position.x = (Math.random() - 0.5) * shakeIntensity * 0.08;
            state.board.position.y = state.config.board.offsetY + (Math.random() - 0.5) * shakeIntensity * 0.08;
        } else {
            state.board.position.x = 0;
            state.board.position.y = state.config.board.offsetY;
        }

        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame(config) {
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    var bgTexture = createGradientTexture(
        config.background.gradientTop || '#1a0533',
        config.background.gradientBottom || '#0d1b2a',
        4,
        8
    );
    var background = new Background(config.background, bgTexture);
    var board = buildBoard(config.board);
    var boardMetrics = board.userData.boardMetrics;
    var sceneManager = new SceneManager(scene, renderer);
    var piecesGroup = new THREE.Group();
    var ghostGroup = createGhostGroup(boardMetrics);
    var state;

    board.add(piecesGroup);
    board.add(ghostGroup);

    SceneSetup.configureRenderer(renderer);
    SceneSetup.fitOrthographicCamera(camera, background.size);

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';

    sceneManager.addObject(background.mesh);
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
        ghostGroup: ghostGroup,
        grid: createGrid(config.board.rows, config.board.columns),
        spawnSlots: [],
        raycaster: new THREE.Raycaster(),
        drag: null,
        score: 0,
        gameOver: false,
        fxEnabled: true,
        particlePool: createParticlePool(),
        activeParticles: new Set(),
        shakeTime: 0,
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        hasUserInteracted: false,
        clock: new THREE.Clock(),
        animationFrameId: null,
        onReset: null
    };

    initSpawnSlots(state);
    buildHud(state, function () {
        resetGame(state);
    });
    refreshScoreDisplay(state);
    bindInteractions(state);
    scheduleTutorial(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, background.size);
    });

    window.BlockBlast = {
        state: state,
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        board: board,
        grid: state.grid,
        sceneManager: sceneManager
    };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});
