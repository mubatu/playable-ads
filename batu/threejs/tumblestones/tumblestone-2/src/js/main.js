import * as THREE from 'three';
import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { createGameState, resetGame, GAME_STATUS } from './GameState.js';
import { createBoard } from './Board.js';
import { createSlots } from './Slots.js';
import { bindInteractions } from './Interaction.js';
import { buildHud, updateHud } from './Hud.js';

var CONFIG_PATH = 'src/config/game-config.json';
var appRoot = document.getElementById('app') || document.body;
var errorBanner = document.getElementById('error-banner');

function showError(message) {
    if (!errorBanner) return;
    errorBanner.textContent = message;
    errorBanner.hidden = false;
}

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        state.sceneManager.update(delta);
        
        // Handle animations
        for (var i = state.animations.length - 1; i >= 0; i--) {
            var anim = state.animations[i];
            anim.progress += delta / anim.duration;
            if (anim.progress >= 1.0) {
                anim.progress = 1.0;
                anim.mesh.position.lerpVectors(anim.startPos, anim.targetPos, anim.progress);
                if (anim.onComplete) anim.onComplete();
                state.animations.splice(i, 1);
            } else {
                anim.mesh.position.lerpVectors(anim.startPos, anim.targetPos, anim.progress);
            }
        }
        
        if (state.tutorial) {
            state.tutorial.update(now);
        }

        updateHud(state);

        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame(config) {
    var state = createGameState(config);
    var renderer = state.renderer;
    var camera = state.camera;

    SceneSetup.configureRenderer(renderer);
    SceneSetup.fitOrthographicCamera(camera, { width: 10.8, height: 19.2 });

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'pointer';

    // Add background
    var textureLoader = new THREE.TextureLoader();
    var bgTexture = textureLoader.load(config.background.textureUrl);
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    var aspect = config.background.sourceWidth / config.background.sourceHeight;
    var bgGeom = new THREE.PlaneGeometry(config.background.worldHeight * aspect, config.background.worldHeight);
    var bgMesh = new THREE.Mesh(bgGeom, new THREE.MeshBasicMaterial({ map: bgTexture }));
    bgMesh.position.z = -5; // far behind
    state.sceneManager.addObject(bgMesh);

    resetGame(state);
    
    var boardGroup = createBoard(state);
    state.sceneManager.addObject(boardGroup);
    
    var slotsGroup = createSlots(state);
    state.sceneManager.addObject(slotsGroup);

    buildHud(state, function () {
        // Restart callback
        state.sceneManager.removeObject(state.boardGroup);
        state.sceneManager.removeObject(state.slotsGroup);
        // Clear animated slot meshes
        for (var i = state.sceneManager.objects.length - 1; i >= 0; i--) {
            var obj = state.sceneManager.objects[i];
            if (obj.geometry && obj.geometry.parameters.width === state.config.slots.size) {
                if (obj.position.y === state.config.slots.offsetY) {
                    state.sceneManager.removeObject(obj);
                }
            }
        }
        
        resetGame(state);
        boardGroup = createBoard(state);
        state.sceneManager.addObject(boardGroup);
        slotsGroup = createSlots(state);
        state.sceneManager.addObject(slotsGroup);
        updateHud(state);
    });

    bindInteractions(state);

    if (config.tutorial && config.tutorial.enabled && window.HandTutorial) {
        // Find bottom-most tile for first column
        var c = 0;
        var r = 0;
        while (r < state.grid[c].length && !state.grid[c][r].mesh) r++;
        if (r < state.grid[c].length) {
            var firstTileMesh = state.grid[c][r].mesh;
            var targetPos = firstTileMesh.getWorldPosition(new THREE.Vector3());
            var fromPoint = { space: 'world', x: targetPos.x, y: targetPos.y, z: targetPos.z };
            
            state.tutorial = new window.HandTutorial({
                container: appRoot,
                renderer: renderer,
                camera: camera,
                assetUrl: '../block-blast/src/assets/hand-2.png',
                gesture: config.tutorial.gesture || 'tap',
                duration: config.tutorial.duration || 1.0,
                loop: true,
                loopDelay: config.tutorial.loopDelay || 0.5,
                size: config.tutorial.size || 120,
                from: fromPoint
            });
            
            setTimeout(function() {
                if (state.tutorial) state.tutorial.play();
            }, config.tutorial.startDelayMs || 1000);
        }
    }

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, { width: 10.8, height: 19.2 });
    });

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});
