import { Scene, OrthographicCamera, WebGLRenderer, Clock, Group } from 'three';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';

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

    var bgTexture = createGradientTexture(
        config.background.gradientTop,
        config.background.gradientBottom,
        4, 256
    );

    var worldGroup = new Group();
    worldGroup.name = 'world';

    return {
        config: config,
        scene: scene,
        renderer: renderer,
        camera: camera,
        clock: new Clock(),
        bgSize: bgSize,
        bgTexture: bgTexture,
        worldGroup: worldGroup,

        sharkGroup: null,
        sharkAngle: 0,
        sharkX: 0,
        sharkY: 0,
        sharkVelX: 0,
        sharkVelY: 0,
        isBoosting: false,

        hunger: config.hunger.initial,
        health: config.health.initial,
        score: 0,
        coins: 0,
        eatenCount: 0,
        goldRushMeter: 0,
        isGoldRush: false,
        goldRushTimer: 0,

        entities: [],
        particles: [],
        bubbles: [],

        shakeTime: 0,
        cameraX: 0,
        cameraY: 0,

        gameStarted: false,
        gameOver: false,
        ctaShown: false,
        elapsedTime: 0,

        tutorial: null,
        hud: null,
        animationFrameId: null,
        moveCommand: { x: 0, y: 0 }
    };
}
