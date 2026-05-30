import { Scene, OrthographicCamera, WebGLRenderer, Clock, Group } from 'three';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';

export function createGameState(config) {
    var scene = new Scene();
    var renderer = new WebGLRenderer({ antialias: true, alpha: false });
    var bgSize = SceneSetup.calculateBackgroundSize(config.background);
    var camera = new OrthographicCamera(-bgSize.width / 2, bgSize.width / 2, bgSize.height / 2, -bgSize.height / 2, 0.1, 100);
    var sceneManager = new SceneManager(scene, renderer);
    var worldGroup = new Group();

    camera.position.z = 10;
    worldGroup.name = 'world';

    return {
        config: config,
        scene: scene,
        renderer: renderer,
        camera: camera,
        clock: new Clock(),
        sceneManager: sceneManager,
        bgSize: bgSize,
        bgTexture: createGradientTexture(config.background.gradientTop, config.background.gradientBottom, 4, 256),
        worldGroup: worldGroup,

        sharkGroup: null,
        sharkAngle: 0,
        sharkTargetAngle: 0,
        sharkX: 0,
        sharkY: 0,
        sharkVelX: 0,
        sharkVelY: 0,
        isBoosting: false,
        boostEnergy: 100,
        sharkTier: 1,

        hunger: config.hunger.initial,
        health: config.health.initial,
        score: 0,
        coins: 0,
        goldRushMeter: 0,
        isGoldRush: false,
        goldRushTimer: 0,

        smallFish: [],
        mediumFish: [],
        humans: [],
        coinItems: [],
        mines: [],
        jellyfish: [],
        enemySharks: [],
        bubbles: [],
        particles: [],

        shakeTime: 0,
        cameraX: 0,
        cameraY: 0,
        respawnTimer: 0,

        gameStarted: false,
        gameOver: false,
        gameOverShown: false,
        ctaShown: false,
        elapsedTime: 0,

        tutorial: null,
        tutorialDelayId: null,
        uiScene: null,
        ui: {},
        animationFrameId: null,

        moveCommand: { x: 0, y: 0 }
    };
}

export function resetGame(state) {
    state.hunger = state.config.hunger.initial;
    state.health = state.config.health.initial;
    state.score = 0;
    state.coins = 0;
    state.goldRushMeter = 0;
    state.isGoldRush = false;
    state.goldRushTimer = 0;
    state.sharkTier = 1;
    state.sharkX = 0;
    state.sharkY = 0;
    state.sharkAngle = 0;
    state.sharkTargetAngle = 0;
    state.isBoosting = false;
    state.boostEnergy = 100;
    state.gameStarted = false;
    state.gameOver = false;
    state.gameOverShown = false;
    state.ctaShown = false;
    state.elapsedTime = 0;
    state.respawnTimer = 0;
    state.shakeTime = 0;
    state.cameraX = 0;
    state.cameraY = 0;
    state.moveCommand.x = 0;
    state.moveCommand.y = 0;

    clearEntityList(state, state.smallFish);
    clearEntityList(state, state.mediumFish);
    clearEntityList(state, state.humans);
    clearEntityList(state, state.coinItems);
    clearEntityList(state, state.mines);
    clearEntityList(state, state.jellyfish);
    clearEntityList(state, state.enemySharks);
    clearEntityList(state, state.bubbles);
    clearEntityList(state, state.particles);
}

function clearEntityList(state, list) {
    while (list.length > 0) {
        state.worldGroup.remove(list.pop());
    }
}
