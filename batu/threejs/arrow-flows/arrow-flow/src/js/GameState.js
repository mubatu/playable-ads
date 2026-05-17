import * as THREE from 'three';
import { Background } from '../../../../reusables/components/Background.js';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';
import { createBoardMetrics, buildGridBase, loadArrows, getRemainingGridCellCount, updateArrowVisuals } from './Board.js';
import { createFramePath, getRemainingFrameCellCount, isFrameFull, stepFramePath, updateFrameCellVisuals } from './FramePath.js';
import { buildShooters, hasAnyValidShot, resolveShooterShots, updateShooterVisuals } from './Shooters.js';
import { updateArrowExit } from './ArrowExit.js';
import { refreshHud, hideResult, showResult } from './Hud.js';
import { destroyTutorial, scheduleTutorial, updateTutorialTarget } from './Tutorial.js';
import { disposeObject } from './Utils.js';

export var GameStatus = {
    READY: 'ready',
    PLAYING: 'playing',
    WIN: 'win',
    LOSE: 'lose'
};

function clearBoard(state) {
    var child;

    while (state.board.children.length > 0) {
        child = state.board.children[0];
        state.board.remove(child);
        disposeObject(child);
    }
}

function getTotalCells(level) {
    return level.arrows.reduce(function (sum, arrow) {
        return sum + arrow.cells.length;
    }, 0);
}

export function createGameState(config, level) {
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    var bgTexture = createGradientTexture(
        config.background.gradientTop,
        config.background.gradientBottom,
        4,
        8
    );
    var background = new Background(config.background, bgTexture);
    var sceneManager = new SceneManager(scene, renderer);
    var board = new THREE.Group();

    board.position.y = config.camera.boardYOffset || 0;

    return {
        config: config,
        level: level,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        background: background,
        board: board,
        boardMetrics: null,
        arrowGroup: null,
        framePath: null,
        shooterGroup: null,
        fxGroup: null,
        arrows: [],
        exitingArrows: [],
        movingCells: [],
        gridOccupancy: {},
        shooters: [],
        activeBeams: [],
        raycaster: new THREE.Raycaster(),
        status: GameStatus.READY,
        totalCells: getTotalCells(level),
        destroyedCells: 0,
        elapsedSeconds: 0,
        idleSeconds: 0,
        arrowExitAccumulator: 0,
        frameAccumulator: 0,
        hasUserInteracted: false,
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        clock: new THREE.Clock(),
        animationFrameId: null
    };
}

export function initializeLevel(state) {
    clearBoard(state);
    destroyTutorial(state);

    state.boardMetrics = createBoardMetrics(state.config, state.level);
    state.arrowGroup = new THREE.Group();
    state.fxGroup = new THREE.Group();
    state.framePath = createFramePath(state);
    state.arrows = [];
    state.exitingArrows = [];
    state.movingCells = [];
    state.gridOccupancy = {};
    state.shooters = [];
    state.activeBeams = [];
    state.destroyedCells = 0;
    state.elapsedSeconds = 0;
    state.idleSeconds = 0;
    state.arrowExitAccumulator = 0;
    state.frameAccumulator = 0;
    state.hasUserInteracted = false;
    state.status = GameStatus.PLAYING;
    state.totalCells = getTotalCells(state.level);

    buildGridBase(state);
    state.board.add(state.framePath.group);
    state.board.add(state.arrowGroup);
    state.board.add(state.fxGroup);
    loadArrows(state);
    buildShooters(state);

    hideResult(state);
    refreshHud(state);
    scheduleTutorial(state);
}

function setResult(state, status, title, subtitle) {
    if (state.status !== GameStatus.PLAYING) {
        return;
    }

    state.status = status;
    destroyTutorial(state);
    showResult(state, title, subtitle);
}

function evaluateWinLose(state) {
    if (state.status !== GameStatus.PLAYING) {
        return;
    }

    if (getRemainingGridCellCount(state) === 0 && getRemainingFrameCellCount(state) === 0 && state.exitingArrows.length === 0 && state.movingCells.length === 0) {
        setResult(state, GameStatus.WIN, 'Puzzle Clear', 'All arrows were released and destroyed.');
        return;
    }

    if (isFrameFull(state) && !hasAnyValidShot(state)) {
        setResult(state, GameStatus.LOSE, 'Frame Jammed', 'No shooter can clear the next cell.');
        return;
    }

    if (state.elapsedSeconds >= state.config.playableAd.maxSessionSeconds) {
        setResult(state, GameStatus.LOSE, 'Try The Full Game', 'You kept the flow moving.');
    }
}

export function updateGame(state, delta, now) {
    if (state.status === GameStatus.PLAYING) {
        state.elapsedSeconds += delta;
        state.idleSeconds += delta;

        updateArrowExit(state, delta);
        resolveShooterShots(state);

        state.frameAccumulator += delta;
        while (state.frameAccumulator >= state.framePath.moveTickSeconds) {
            state.frameAccumulator -= state.framePath.moveTickSeconds;
            stepFramePath(state);
            resolveShooterShots(state);
        }

        updateArrowVisuals(state, delta);
        updateFrameCellVisuals(state, 0.28);
        updateShooterVisuals(state, delta);
        updateTutorialTarget(state);
        evaluateWinLose(state);
        refreshHud(state);
    } else {
        updateShooterVisuals(state, delta);
    }

    if (state.tutorial) {
        state.tutorial.update(now);
    }
}

export function resetGame(state) {
    initializeLevel(state);
}
