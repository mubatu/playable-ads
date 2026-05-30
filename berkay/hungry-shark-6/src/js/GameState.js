import { Scene, OrthographicCamera, WebGLRenderer, Clock, Group } from 'three';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';

export function createGameState(config) {
    var scene = new Scene();
    var renderer = new WebGLRenderer({ antialias: true, alpha: false });
    var bgSize = SceneSetup.calculateBackgroundSize(config.background);
    var camera = new OrthographicCamera(
        -bgSize.width / 2, bgSize.width / 2,
        bgSize.height / 2, -bgSize.height / 2,
        0.1, 100
    );
    camera.position.z = 10;

    var worldGroup = new Group();
    worldGroup.name = 'world';

    return {
        config: config,
        scene: scene,
        renderer: renderer,
        camera: camera,
        clock: new Clock(),
        bgSize: bgSize,
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

        hunger: config.hunger.initial,
        health: config.health.initial,
        score: 0,
        coins: 0,
        goldRushMeter: 0,
        isGoldRush: false,
        goldRushTimer: 0,
        goldRushFlash: 0,

        smallFish: [],
        mediumFish: [],
        humans: [],
        creatures: [],
        coinItems: [],
        mines: [],
        jellyfish: [],
        bubbles: [],
        _particles: [],

        cameraX: 0,
        cameraY: 0,
        shakeTime: 0,
        shakeX: 0,
        shakeY: 0,

        gameStarted: false,
        gameOver: false,
        ctaShown: false,
        elapsedTime: 0,
        _gameOverShown: false,

        moveCommand: { x: 0, y: 0 },
        tutorial: null,
        tutorialDelayId: null,
        animationFrameId: null
    };
}

export function resetGame(state) {
    var config = state.config;

    state.hunger = config.hunger.initial;
    state.health = config.health.initial;
    state.score = 0;
    state.coins = 0;
    state.goldRushMeter = 0;
    state.isGoldRush = false;
    state.goldRushTimer = 0;
    state.goldRushFlash = 0;
    state.sharkX = 0;
    state.sharkY = 0;
    state.sharkAngle = 0;
    state.sharkTargetAngle = 0;
    state.sharkVelX = 0;
    state.sharkVelY = 0;
    state.isBoosting = false;
    state.boostEnergy = 100;
    state.gameOver = false;
    state._gameOverShown = false;
    state.ctaShown = false;
    state.elapsedTime = 0;
    state.shakeTime = 0;
    state.cameraX = 0;
    state.cameraY = 0;
    state.moveCommand.x = 0;
    state.moveCommand.y = 0;
}
