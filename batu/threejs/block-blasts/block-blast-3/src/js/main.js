import * as THREE from 'three';
import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { Background } from '../../../../reusables/components/Background.js';
import { SceneManager } from './SceneManager.js';
import { buildBoard, createGrid } from './Board.js';
import { createGhostGroup } from './Shapes.js';
import { createParticlePool, clearParticles } from './ParticleFX.js';
import { initSpawnSlots, bindInteractions } from './Interaction.js';
import { buildHud, refreshBoardMeter, refreshScoreDisplay } from './Hud.js';
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

function createBackgroundTexture(config, width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width || 512;
    canvas.height = height || 1024;
    var ctx = canvas.getContext('2d');

    var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, config.topColor || '#1d2731');
    gradient.addColorStop(0.58, config.baseColor || '#10131f');
    gradient.addColorStop(1, '#080a12');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = config.accentColor || '#1fc7b7';
    ctx.save();
    ctx.translate(canvas.width * 0.74, canvas.height * 0.08);
    ctx.rotate(-0.5);
    ctx.fillRect(-36, 0, 72, canvas.height * 0.7);
    ctx.restore();

    ctx.globalAlpha = 0.16;
    ctx.fillStyle = config.warmAccentColor || '#ffb84d';
    ctx.save();
    ctx.translate(canvas.width * 0.16, canvas.height * 0.72);
    ctx.rotate(0.58);
    ctx.fillRect(-28, 0, 56, canvas.height * 0.48);
    ctx.restore();

    ctx.globalAlpha = 0.11;
    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < 52; i += 1) {
        var size = 4 + Math.random() * 9;
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            size,
            size
        );
    }

    ctx.globalAlpha = 1;

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
    refreshBoardMeter(state);
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
    var bgTexture = createBackgroundTexture(config.background, 512, 1024);
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

    window.BlockBlast3 = {
        state: state,
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        board: board,
        grid: state.grid,
        sceneManager: sceneManager
    };
    window.BlockBlast = window.BlockBlast3;

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});
