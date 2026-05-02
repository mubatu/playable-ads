import * as THREE from 'three';
import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { TextureUtils } from '../../../../reusables/components/TextureUtils.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { Background } from '../../../../reusables/components/Background.js';
import { SceneManager } from './SceneManager.js';
import { buildBoard, createGrid } from './Board.js';
import { populateShapes, createShapeMaterials } from './Shapes.js';
import { createParticlePool, clearParticles } from './ParticleFX.js';
import { buildHud, refreshHud } from './Hud.js';
import { bindInteractions } from './Interaction.js';

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

function resetGame(state) {
    state.drag = null;
    state.hasUserInteracted = false;
    state.renderer.domElement.style.cursor = 'grab';
    state.score = 0;
    state.isGameOver = false;
    
    // clear grid
    for (var row = 0; row < state.config.board.rows; row++) {
        for (var col = 0; col < state.config.board.columns; col++) {
            if (state.grid[row][col]) {
                state.board.remove(state.grid[row][col]);
                state.grid[row][col] = null;
            }
        }
    }
    
    // clear shapes
    while (state.shapesGroup.children.length) {
        state.shapesGroup.remove(state.shapesGroup.children[0]);
    }
    
    state.dockedShapes = [];

    populateShapes(state);
    refreshHud(state);
}

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        state.sceneManager.update(delta);

        if (state.tutorial) {
            state.tutorial.update(now);
        }

        if (state.activeParticles) {
            Array.from(state.activeParticles).forEach(function (particle) {
                if (particle.update) {
                    particle.update(delta);
                }
            });
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
    var background = new Background(config.background, null);
    var board = buildBoard(config.board);
    var boardMetrics = board.userData.boardMetrics;
    var sceneManager = new SceneManager(scene, renderer);
    var shapesGroup = new THREE.Group();
    var state;

    board.add(shapesGroup);

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
        shapesGroup: shapesGroup,
        shapeMaterials: createShapeMaterials(config.shapes.colors),
        grid: createGrid(config.board.rows, config.board.columns),
        raycaster: new THREE.Raycaster(),
        drag: null,
        dockedShapes: [],
        score: 0,
        isGameOver: false,
        fxEnabled: true,
        particlePool: createParticlePool(),
        activeParticles: new Set(),
        uiScene: null,
        ui: {},
        tutorial: null,
        hasUserInteracted: false,
        clock: new THREE.Clock(),
        animationFrameId: null
    };

    populateShapes(state);
    buildHud(state, function () {
        resetGame(state);
    });
    refreshHud(state);
    bindInteractions(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, background.size);
    });

    window.BlockBlast = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        board: board,
        background: background.mesh,
        grid: state.grid,
        sceneManager: sceneManager,
        uiScene: state.uiScene,
        tutorial: state.tutorial,
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
