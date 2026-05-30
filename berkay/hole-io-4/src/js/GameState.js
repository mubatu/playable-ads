import * as THREE from 'three';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { buildGround, buildConsumables } from './Environment.js';
import { createHole } from './Hole.js';
import { createParticleSystem, clearParticles } from './ParticleFX.js';

export function createGameState(config) {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('#aee3ff');
    scene.fog = new THREE.Fog('#aee3ff', 35, 60);

    var camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    var hemi = new THREE.HemisphereLight('#ffffff', '#6b8f4e', 1.0);
    scene.add(hemi);

    var sun = new THREE.DirectionalLight('#ffffff', 1.1);
    sun.position.set(12, 24, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.left = -35;
    sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35;
    sun.shadow.camera.bottom = -35;
    sun.shadow.camera.far = 80;
    scene.add(sun);

    var ground = buildGround(config.ground);
    var hole = createHole(config.hole);
    var consumablesGroup = new THREE.Group();

    var sceneManager = new SceneManager(scene, renderer);

    var state = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        ground: ground,
        hole: hole,
        consumablesGroup: consumablesGroup,
        consumables: [],
        particles: createParticleSystem(scene),
        move: { x: 0, y: 0 },
        score: 0,
        timeLeft: config.duration,
        running: false,
        ended: false,
        hasUserInteracted: false,
        cameraTarget: new THREE.Vector3(),
        clock: new THREE.Clock(),
        animationFrameId: null,
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null
    };

    return state;
}

export function populateWorld(state) {
    state.consumables = buildConsumables(state.config.ground);
    var i;
    for (i = 0; i < state.consumables.length; i += 1) {
        state.consumablesGroup.add(state.consumables[i].group);
    }
}

export function resetGame(state) {
    if (state.ui.endOverlay) {
        state.ui.endOverlay.hide();
    }

    // remove old consumables
    var i;
    for (i = 0; i < state.consumables.length; i += 1) {
        state.consumablesGroup.remove(state.consumables[i].group);
    }
    state.consumables = [];
    clearParticles(state.particles);

    // reset hole
    state.hole.userData.diameter = state.config.hole.initialDiameter;
    state.hole.userData.baseScale = state.config.hole.initialDiameter / 2;
    state.hole.userData.pulse = 0;
    state.hole.position.set(0, 0, 0);

    state.score = 0;
    state.timeLeft = state.config.duration;
    state.ended = false;
    state.running = true;
    state.move.x = 0;
    state.move.y = 0;

    populateWorld(state);

    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(0);
    }
    if (state.ui.timerBar) {
        state.ui.timerBar.setValue(state.timeLeft);
    }
}
