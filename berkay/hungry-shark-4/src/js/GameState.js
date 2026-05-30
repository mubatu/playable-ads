import * as THREE from 'three';
import { Background } from '../../../../reusables/components/Background.js';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';

export function createGameState(config) {
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    var bgTexture = createGradientTexture(
        config.background.gradientTop || '#1a3a52',
        config.background.gradientBottom || '#0a0e27',
        4,
        8
    );
    var background = new Background(config.background, bgTexture);
    var sceneManager = new SceneManager(scene, renderer);

    var sharkGroup = new THREE.Group();
    var entitiesGroup = new THREE.Group();
    var coinsGroup = new THREE.Group();
    var particlesGroup = new THREE.Group();

    scene.add(entitiesGroup);
    scene.add(coinsGroup);
    scene.add(sharkGroup);
    scene.add(particlesGroup);

    return {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        background: background,
        sharkGroup: sharkGroup,
        entitiesGroup: entitiesGroup,
        coinsGroup: coinsGroup,
        particlesGroup: particlesGroup,
        shark: {
            mesh: null,
            position: new THREE.Vector3(config.shark.startX, config.shark.startY, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            targetVelocity: new THREE.Vector3(0, 0, 0),
            health: config.shark.startHealth,
            hunger: config.shark.startHunger,
            size: config.shark.startSize,
            tier: 1,
            maxHealth: config.shark.maxHealth,
            maxHunger: config.shark.maxHunger,
            boostActive: false,
            boostTime: 0,
            boostCooldownTime: 0,
            rotation: 0
        },
        entities: [],
        coins: [],
        score: 0,
        gameOver: false,
        goldRushActive: false,
        goldRushTime: 0,
        goldRushMeter: 0,
        goldRushPrey: [],
        fxEnabled: true,
        particlePool: [],
        activeParticles: [],
        shakeTime: 0,
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        hasUserInteracted: false,
        clock: new THREE.Clock(),
        animationFrameId: null,
        moveCommand: null,
        raycaster: new THREE.Raycaster()
    };
}

export function resetGame(state) {
    state.gameOver = false;
    state.score = 0;
    state.goldRushActive = false;
    state.goldRushTime = 0;
    state.goldRushMeter = 0;
    state.goldRushPrey = [];
    state.hasUserInteracted = false;
    state.shakeTime = 0;

    state.shark.health = state.shark.maxHealth;
    state.shark.hunger = state.shark.maxHunger;
    state.shark.size = state.config.shark.startSize;
    state.shark.tier = 1;
    state.shark.position.set(state.config.shark.startX, state.config.shark.startY, 0);
    state.shark.velocity.set(0, 0, 0);
    state.shark.targetVelocity.set(0, 0, 0);
    state.shark.boostActive = false;
    state.shark.boostTime = 0;
    state.shark.boostCooldownTime = 0;

    state.entities.forEach(function(entity) {
        if (entity.mesh && entity.mesh.parent) {
            entity.mesh.parent.remove(entity.mesh);
        }
        if (entity.mesh && entity.mesh.geometry) {
            entity.mesh.geometry.dispose();
        }
        if (entity.mesh && entity.mesh.material) {
            entity.mesh.material.dispose();
        }
    });
    state.entities = [];

    state.coins.forEach(function(coin) {
        if (coin.mesh && coin.mesh.parent) {
            coin.mesh.parent.remove(coin.mesh);
        }
        if (coin.mesh && coin.mesh.geometry) {
            coin.mesh.geometry.dispose();
        }
        if (coin.mesh && coin.mesh.material) {
            coin.mesh.material.dispose();
        }
    });
    state.coins = [];

    state.activeParticles.forEach(function(p) {
        if (p.mesh && p.mesh.parent) {
            p.mesh.parent.remove(p.mesh);
        }
    });
    state.activeParticles = [];

    if (state.ui.gameOverOverlay) {
        state.ui.gameOverOverlay.hide();
    }

    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(0);
    }

    if (state.ui.healthBar) {
        state.ui.healthBar.setValue(state.shark.health);
    }

    if (state.ui.hungerBar) {
        state.ui.hungerBar.setValue(state.shark.hunger);
    }

    if (state.ui.goldRushBar) {
        state.ui.goldRushBar.setValue(0);
    }
}
