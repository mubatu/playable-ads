import * as THREE from 'three';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';

export function createGameState(config) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.world.skyColor);

    const camera = new THREE.PerspectiveCamera(
        config.camera.fov,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowShadowMap;

    const sceneManager = new SceneManager(scene, renderer);
    const clock = new THREE.Clock();

    // Setup lighting
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x8899aa, config.world.ambientLightIntensity);
    const directionalLight = new THREE.DirectionalLight(0xffffff, config.world.directionalLightIntensity);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;

    scene.add(ambientLight);
    scene.add(directionalLight);

    // Setup camera with fixed rotation (60 degrees down)
    const rotX = THREE.MathUtils.degToRad(config.camera.rotationX);
    camera.position.set(0, 15, 8);
    camera.lookAt(0, 2, 0);

    const state = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        clock: clock,

        // Game state
        score: 0,
        gameTime: 0,
        gameDuration: config.gameplay.gameDuration,
        gameOver: false,
        gameStarted: false,
        tutorialActive: false,

        // Player and world
        player: null,
        environmentObjects: [],
        consumedCount: 0,

        // UI references
        ui: {},
        tutorial: null,

        // Input
        joystickCommand: { x: 0, y: 0 },

        // Animation frame
        animationFrameId: null
    };

    return state;
}

export function resetGame(state) {
    state.score = 0;
    state.gameTime = 0;
    state.gameOver = false;
    state.gameStarted = false;
    state.tutorialActive = false;
    state.consumedCount = 0;
    state.joystickCommand.x = 0;
    state.joystickCommand.y = 0;

    if (state.player) {
        state.player.reset();
    }

    // Reset all environment objects
    state.environmentObjects.forEach(obj => {
        if (obj.mesh && obj.mesh.parent) {
            obj.mesh.parent.remove(obj.mesh);
        }
    });
    state.environmentObjects = [];

    // Reset UI
    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(0);
    }
    if (state.ui.timerDisplay) {
        state.ui.timerDisplay.setValue(state.gameDuration);
    }
    if (state.ui.endOverlay) {
        state.ui.endOverlay.hide();
    }
}
