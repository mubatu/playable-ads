import { Scene, OrthographicCamera, WebGLRenderer, Group, Clock, Raycaster, Vector2, Color } from 'three';
import {
    createSharkTexture,
    createFishTexture,
    createCoinTexture,
    createMineTexture,
    createJellyfishTexture,
    createBubbleTexture,
    createParticleTexture
} from './Textures.js';

export function createGameState(config) {
    var scene = new Scene();
    scene.background = new Color(config.world.gradientBottom || '#04223f');

    var camera = new OrthographicCamera();
    var renderer = new WebGLRenderer({ antialias: true, alpha: false });

    var worldGroup = new Group();
    var entityGroup = new Group();
    var particleGroup = new Group();
    worldGroup.add(entityGroup);
    worldGroup.add(particleGroup);

    var textures = {
        shark: createSharkTexture({ body: '#5078ad', belly: '#dcebf7', fin: '#36527c' }),
        sharkGold: createSharkTexture({ body: '#ffc233', belly: '#fff2c2', fin: '#e08a12' }),
        smallFish: createFishTexture('#ff9d3c', '#e06f15'),
        mediumFish: createFishTexture('#5ec2a8', '#2f8f78'),
        bigFish: createFishTexture('#b06ad0', '#7d3fa0'),
        coin: createCoinTexture(),
        mine: createMineTexture(),
        jellyfish: createJellyfishTexture(),
        bubble: createBubbleTexture(),
        goldParticle: createParticleTexture('rgba(255, 215, 80, 1)'),
        bloodParticle: createParticleTexture('rgba(255, 70, 60, 1)')
    };

    return {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        clock: new Clock(),
        raycaster: new Raycaster(),
        pointer: new Vector2(),
        textures: textures,

        worldGroup: worldGroup,
        entityGroup: entityGroup,
        particleGroup: particleGroup,
        bgSize: { width: config.world.width, height: config.world.height },

        sharkGroup: null,
        shark: {
            x: 0,
            y: 0,
            vx: 1,
            vy: 0,
            angle: 0,
            size: config.shark.baseSize
        },

        entities: [],
        particles: [],
        bubbles: [],

        move: { x: 0, y: 0 },
        boosting: false,

        // meters
        hunger: config.hunger.initial,
        health: config.health.initial,
        boost: config.boost.initial,
        goldRushCharge: 0,
        goldRushActive: false,
        goldRushTimer: 0,

        score: 0,
        elapsedTime: 0,
        eatenCount: 0,

        gameStarted: false,
        gameOver: false,
        ctaShown: false,
        _gameOverShown: false,

        shakeTime: 0,
        shakeIntensity: 0,

        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        hasUserInteracted: false,
        animationFrameId: null
    };
}
