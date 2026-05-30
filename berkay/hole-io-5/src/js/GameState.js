import * as THREE from 'three';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { createAudioManager } from './Audio.js';
import { destroyTutorial, scheduleTutorial } from './Tutorial.js';
import { refreshScoreDisplay, hideEndScreen, hideEndButtons } from './Hud.js';

export function createGameState(config) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    var sceneManager = new SceneManager(scene, renderer);
    var hemi = new THREE.HemisphereLight('#dff9fb', '#636e72', 0.85);
    var dir = new THREE.DirectionalLight('#ffffff', 0.75);
    var cityContainer = new THREE.Group();
    var holeContainer = new THREE.Group();
    var particleContainer = new THREE.Group();
    var state;

    dir.position.set(8, 16, 6);

    scene.background = new THREE.Color('#87ceeb');
    scene.add(hemi);
    scene.add(dir);
    scene.add(cityContainer);
    scene.add(holeContainer);
    scene.add(particleContainer);

    state = {
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer,
        sceneManager: sceneManager,
        cityContainer: cityContainer,
        holeContainer: holeContainer,
        particleContainer: particleContainer,
        city: null,
        hole: null,
        cameraCtrl: null,
        particles: null,
        audio: createAudioManager(),
        moveCommand: null,
        score: 0,
        timeRemaining: config.session.durationSeconds,
        sessionStarted: false,
        gameEnded: false,
        tutorialActive: true,
        tutorialTimer: 0,
        uiScene: null,
        ui: {},
        tutorial: null,
        tutorialDelayId: null,
        tutorialTextEl: document.getElementById('tutorial-text'),
        timerEl: document.getElementById('timer-display'),
        clock: new THREE.Clock(),
        animationFrameId: null,
        onReset: null
    };

    return state;
}

export function resetGame(state) {
    destroyTutorial(state);
    hideEndScreen(state);
    hideEndButtons(state);

    state.score = 0;
    state.timeRemaining = state.config.session.durationSeconds;
    state.sessionStarted = false;
    state.gameEnded = false;
    state.tutorialActive = true;
    state.tutorialTimer = 0;

    if (state.hole) {
        state.hole.reset();
    }
    if (state.city) {
        state.city.reset();
    }
    if (state.particles) {
        state.particles.clear();
    }
    if (state.cameraCtrl) {
        state.cameraCtrl.reset();
    }
    if (state.moveCommand) {
        state.moveCommand.x = 0;
        state.moveCommand.y = 0;
    }

    syncTimerDisplay(state);

    if (state.tutorialTextEl) {
        state.tutorialTextEl.hidden = false;
    }

    if (state.ui.endOverlay) {
        state.ui.endOverlay.setTitle("Time's Up!");
    }

    refreshScoreDisplay(state);
    scheduleTutorial(state);
}

function syncTimerDisplay(state) {
    if (!state.timerEl) {
        return;
    }
    var seconds = Math.max(0, Math.ceil(state.timeRemaining));
    var mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    var ss = String(seconds % 60).padStart(2, '0');
    state.timerEl.textContent = mm + ':' + ss;
}

export function updateTimerDisplay(state) {
    syncTimerDisplay(state);
}
