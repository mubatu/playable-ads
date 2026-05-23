import * as THREE from 'three';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { createPlayerHole } from './Hole.js';

export function createGameState(config) {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    var camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );
    camera.position.set(0, config.camera.baseHeight, config.camera.baseOffset);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
    }

    var sceneManager = new SceneManager(scene, renderer);

    // Lighting
    var hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(10, 20, 10);
    scene.add(sun);

    // World groups
    var world = new THREE.Group();
    var groundLayer = new THREE.Group();
    var objectsLayer = new THREE.Group();
    var particlesLayer = new THREE.Group();
    world.add(groundLayer);
    world.add(objectsLayer);
    world.add(particlesLayer);
    scene.add(world);

    // Ground plane
    var worldSize = config.game.worldSize;
    var groundGeo = new THREE.PlaneGeometry(worldSize * 3, worldSize * 3, 1, 1);
    var groundMat = new THREE.MeshLambertMaterial({ color: 0x5d9e3c });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    groundLayer.add(ground);

    // Road grid lines
    addRoads(groundLayer, worldSize);

    // Player hole
    var playerHole = createPlayerHole(config);
    objectsLayer.add(playerHole);

    return {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        world: world,
        groundLayer: groundLayer,
        objectsLayer: objectsLayer,
        particlesLayer: particlesLayer,
        playerHole: playerHole,

        score: 0,
        gameOver: false,
        gameTime: 0,
        tutorialActive: true,
        hasUserInteracted: false,

        moveCommand: { x: 0, y: 0 },
        joystick: null,

        spawnedObjects: [],
        activeParticles: new Set(),

        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,

        clock: new THREE.Clock(),
        animationFrameId: null,
        onReset: null,

        cameraTargetX: 0,
        cameraTargetY: config.camera.baseHeight,
        cameraTargetZ: config.camera.baseOffset
    };
}

function addRoads(groundLayer, worldSize) {
    var roadMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    var roadWidth = 2;
    var roadLength = worldSize * 3;

    // Horizontal roads
    [-worldSize * 0.5, 0, worldSize * 0.5].forEach(function (z) {
        var geo = new THREE.PlaneGeometry(roadLength, roadWidth);
        var mesh = new THREE.Mesh(geo, roadMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0.01, z);
        groundLayer.add(mesh);
    });

    // Vertical roads
    [-worldSize * 0.5, 0, worldSize * 0.5].forEach(function (x) {
        var geo = new THREE.PlaneGeometry(roadWidth, roadLength);
        var mesh = new THREE.Mesh(geo, roadMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.01, 0);
        groundLayer.add(mesh);
    });
}

export function resetGame(state) {
    state.gameOver = false;
    state.score = 0;
    state.gameTime = 0;
    state.tutorialActive = true;
    state.hasUserInteracted = false;
    state.moveCommand.x = 0;
    state.moveCommand.y = 0;

    if (state.playerHole) {
        state.playerHole.position.set(0, 0, 0);
        setHoleDiameter(state.playerHole, state.config.player.initialDiameter);
    }

    state.activeParticles.forEach(function (p) {
        p.visible = false;
        state.particlesLayer.remove(p);
    });
    state.activeParticles.clear();

    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(0);
    }
    if (state.ui.gameOverOverlay) {
        state.ui.gameOverOverlay.hide();
    }
    if (state.ui.timerEl) {
        state.ui.timerEl.textContent = formatTime(state.config.game.duration);
    }

    state.cameraTargetX = 0;
    state.cameraTargetY = state.config.camera.baseHeight;
    state.cameraTargetZ = state.config.camera.baseOffset;
    state.camera.position.set(0, state.config.camera.baseHeight, state.config.camera.baseOffset);
    state.camera.lookAt(0, 0, 0);
}

function setHoleDiameter(holeGroup, diameter) {
    var ud = holeGroup.userData;
    ud.diameter = diameter;
    var radius = diameter / 2;
    var holeMesh = ud.holeMesh;
    holeMesh.geometry.dispose();
    holeMesh.geometry = new THREE.CircleGeometry(radius, 48);
}

export function formatTime(seconds) {
    var s = Math.ceil(seconds);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}
