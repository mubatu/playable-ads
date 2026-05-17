import THREE from 'three';
import { Background } from '../../../../reusables/components/Background.js';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';
import { cellKey, createCellVisual, createGridBase, buildBoardMetrics, DIRECTIONS } from './Board.js';
import { FramePath } from './FramePath.js';
import { normalizeArrowCells } from './ArrowSystem.js';
import { createShooters } from './ShooterSystem.js';
import { buildHud, refreshHud } from './Hud.js';
import { destroyTutorial, scheduleTutorial } from './Tutorial.js';

export var GameStatus = {
    PLAYING: 'playing',
    WIN: 'win',
    LOSE: 'lose',
    TIMEOUT: 'timeout'
};

function copyCoord(coord) {
    return { row: coord.row, col: coord.col };
}

function clearBoard(state) {
    if (state.boardGroup) {
        state.sceneManager.removeObject(state.boardGroup);
    }
    state.boardGroup = null;
    state.arrows = [];
    state.grid = new Map();
    state.arrowHitMeshes = [];
    state.movingCells = [];
    state.shooters = [];
    state.activeBeams = [];
}

function validateLevel(state, level) {
    var occupied = {};
    var arrowIds = {};
    var shooterIds = {};
    var i;
    var j;
    var arrow;
    var coord;
    var key;
    var shooter;

    for (i = 0; i < level.arrows.length; i += 1) {
        arrow = level.arrows[i];
        if (arrowIds[arrow.id]) {
            throw new Error('Duplicate arrow id: ' + arrow.id);
        }
        arrowIds[arrow.id] = true;
        if (!DIRECTIONS[arrow.direction]) {
            throw new Error('Invalid arrow direction: ' + arrow.direction);
        }
        for (j = 0; j < arrow.cells.length; j += 1) {
            coord = arrow.cells[j];
            if (coord.row < 0 || coord.row >= state.boardMetrics.rows || coord.col < 0 || coord.col >= state.boardMetrics.cols) {
                throw new Error('Arrow cell outside grid: ' + arrow.id);
            }
            key = cellKey(coord.row, coord.col);
            if (occupied[key]) {
                throw new Error('Overlapping arrow cell at ' + key);
            }
            occupied[key] = true;
        }
    }

    for (i = 0; i < level.shooters.length; i += 1) {
        shooter = level.shooters[i];
        if (shooterIds[shooter.id]) {
            throw new Error('Duplicate shooter id: ' + shooter.id);
        }
        shooterIds[shooter.id] = true;
        if (!state.config.colors[shooter.color]) {
            throw new Error('Unknown shooter color: ' + shooter.color);
        }
        if (shooter.directSlotIndex < 0 || shooter.directSlotIndex >= ((level.frame && level.frame.slotCount) || state.config.frame.slotCount)) {
            throw new Error('Shooter direct slot out of range: ' + shooter.id);
        }
        if (shooter.visibleSlots && (shooter.visibleSlots.length !== 1 || shooter.visibleSlots[0] !== shooter.directSlotIndex)) {
            throw new Error('Shooter visibleSlots must contain only directSlotIndex: ' + shooter.id);
        }
    }
}

function buildArrows(state, level) {
    var arrows = [];
    var i;
    var j;
    var source;
    var arrow;
    var coord;
    var isHead;
    var cell;

    for (i = 0; i < level.arrows.length; i += 1) {
        source = level.arrows[i];
        arrow = {
            id: source.id,
            color: source.color,
            direction: source.direction,
            head: copyCoord(source.head),
            cells: source.cells.map(copyCoord),
            orderedCells: [],
            exitQueue: [],
            isExiting: false,
            isFullyExited: false,
            invalidFeedbackTime: 0,
            releaseTimer: 0
        };

        for (j = 0; j < arrow.cells.length; j += 1) {
            coord = arrow.cells[j];
            isHead = coord.row === arrow.head.row && coord.col === arrow.head.col;
            cell = createCellVisual(state, arrow, coord, isHead);
            coord.cellRef = cell;
            state.grid.set(cellKey(coord.row, coord.col), cell);
            state.arrowHitMeshes.push(cell.box);
            state.boardGroup.add(cell.group);
        }

        arrow.orderedCells = normalizeArrowCells(arrow);
        arrows.push(arrow);
    }

    state.arrows = arrows;
}

export function createGameState(config, levels) {
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    var backgroundTexture = createGradientTexture(
        config.background.gradientTop,
        config.background.gradientBottom,
        4,
        8
    );
    var background = new Background(config.background, backgroundTexture);
    var sceneManager = new SceneManager(scene, renderer);

    return {
        config: config,
        levels: levels,
        levelIndex: 0,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        background: background,
        boardGroup: null,
        boardMetrics: null,
        framePath: null,
        grid: new Map(),
        arrows: [],
        movingCells: [],
        shooters: [],
        activeBeams: [],
        arrowHitMeshes: [],
        raycaster: new THREE.Raycaster(),
        pointer: new THREE.Vector2(),
        directions: DIRECTIONS,
        status: GameStatus.PLAYING,
        elapsedSeconds: 0,
        inactivitySeconds: 0,
        frameTickAccumulator: 0,
        cellsRemaining: 0,
        totalCells: 0,
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        hasUserInteracted: false,
        clock: new THREE.Clock(),
        animationFrameId: null
    };
}

export function startLevel(state, levelIndex) {
    var level = state.levels[levelIndex || 0];
    var totalCells = 0;
    var i;

    destroyTutorial(state);
    clearBoard(state);
    state.levelIndex = levelIndex || 0;
    state.status = GameStatus.PLAYING;
    state.elapsedSeconds = 0;
    state.inactivitySeconds = 0;
    state.frameTickAccumulator = 0;
    state.hasUserInteracted = false;
    state.boardMetrics = buildBoardMetrics(state.config, level);
    state.boardGroup = new THREE.Group();
    state.boardGroup.add(createGridBase(state));
    state.framePath = new FramePath(state, level);
    state.boardGroup.add(state.framePath.slotGroup);

    validateLevel(state, level);
    buildArrows(state, level);
    state.boardGroup.add(createShooters(state, level));

    for (i = 0; i < level.arrows.length; i += 1) {
        totalCells += level.arrows[i].cells.length;
    }
    state.totalCells = totalCells;
    state.cellsRemaining = totalCells;

    state.sceneManager.addObject(state.boardGroup);
    refreshHud(state);
    scheduleTutorial(state);
}

export function resetGame(state) {
    if (state.ui.endOverlay) {
        state.ui.endOverlay.hide();
    }
    startLevel(state, state.levelIndex);
}

export function initHud(state) {
    buildHud(state, function () {
        resetGame(state);
    });
}
