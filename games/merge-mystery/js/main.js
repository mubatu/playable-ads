import * as THREE from 'three';
import { ConfigLoader } from '../../../reusables/components/ConfigLoader.js';
import { TextureUtils } from '../../../reusables/components/TextureUtils.js';
import { SceneSetup } from '../../../reusables/components/SceneSetup.js';
import { Background } from '../../../reusables/components/Background.js';
import { SceneManager } from './SceneManager.js';
import { buildBoard, createGrid } from './Board.js';
import { createPieceMaterials, populateInitialPieces, clearBoardPieces } from './Pieces.js';
import { createParticlePool, clearParticles } from './ParticleFX.js';
import { scheduleTutorial, destroyTutorial } from './Tutorial.js';
import { buildHud, refreshHud } from './Hud.js';
import { bindInteractions } from './Interaction.js';

var CONFIG_PATH = 'config/game-config.json';
var appRoot = document.getElementById('app') || document.body;
var errorBanner = document.getElementById('error-banner');

function showError(message) {
    if (!errorBanner) {
        return;
    }

    errorBanner.textContent = message;
    errorBanner.hidden = false;
}

function resetBoard(state) {
    state.drag = null;
    state.hasUserInteracted = false;
    state.renderer.domElement.style.cursor = 'grab';
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
    var background = new Background(config.background, assets.backgroundTexture);
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
    buildHud(state, function () {
        resetBoard(state);
    });
    refreshHud(state);
    bindInteractions(state);
    scheduleTutorial(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, background.size);
    });

    window.MergeMystery = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        board: board,
        background: background.mesh,
        grid: state.grid,
        sceneManager: sceneManager,
        uiScene: state.uiScene,
        particlePool: state.particlePool,
        tutorial: state.tutorial,
        state: state
    };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    var backgroundPath = config.background && config.background.texturePath
        ? config.background.texturePath
        : 'assets/background.png';
    var piecePaths = config.pieces && config.pieces.texturePaths
        ? config.pieces.texturePaths
        : [];

    return Promise.all([
        TextureUtils.load(backgroundPath),
        TextureUtils.loadAll(piecePaths)
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
