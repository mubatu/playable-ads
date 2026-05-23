import * as THREE from 'three';
import { createHole } from './Hole.js';
import { createEnvironment } from './Environment.js';
import { createParticlePool } from './ParticleFX.js';

export function createGameState(config) {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    var camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;

    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 15, 8);
    scene.add(dirLight);

    var hole = createHole(config.hole);
    scene.add(hole.group);

    var environment = createEnvironment(config.map);
    scene.add(environment.group);

    var particlePool = createParticlePool(scene);

    var angleRad = (config.camera.angle * Math.PI) / 180;
    var dist = config.camera.baseDistance;
    camera.position.set(0, Math.sin(angleRad) * dist, Math.cos(angleRad) * dist);
    camera.lookAt(0, 0, 0);

    return {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        hole: hole,
        environment: environment,
        particlePool: particlePool,
        cameraLookTarget: new THREE.Vector3(0, 0, 0),
        joystickCommand: null,
        score: 0,
        consumedCount: 0,
        gameOver: false,
        timer: null,
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        tutorialAutoHideId: null,
        tutorialText: null,
        hasUserInteracted: false,
        clock: new THREE.Clock(),
        animationFrameId: null,
        onReset: null
    };
}
