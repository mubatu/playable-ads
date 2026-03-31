import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraController, LightManager, SceneManager, InputManager, OperationField, PoolFactory } from './index.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = '0';

const controls = new OrbitControls(camera, renderer.domElement);

const lightManager = new LightManager(scene);
lightManager.addAmbientLight(0xffffff, 0.6);
lightManager.addDirectionalLight(0xffffff, 0.8, new THREE.Vector3(10, 20, 10));

const sceneManager = new SceneManager(scene, renderer);
const inputManager = new InputManager();

const cameraController = new CameraController(camera);

// Create ground
const ground = sceneManager.addObject(new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x4a7c59 })
));
ground.rotation.x = -Math.PI / 2;

// Create player
const player = sceneManager.addObject(new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
));
player.position.set(0, 1, 0);
player.boundingBox = new THREE.Box3().setFromObject(player);

// Create operation field
const operationField = new OperationField(scene, new THREE.Vector3(0, 0, -10), 20, 20);
let fieldEntryCount = 0;
operationField.enableDetections(player, (obj, delta) => {
    fieldEntryCount++;
    console.log(`Player entered operation field! (${fieldEntryCount} times)`);
    // Example: toggle player color
    obj.material.color.setHex(obj.material.color.getHex() === 0xff0000 ? 0x00ff00 : 0xff0000);
});

// Make field visible
operationField.mesh.material.color.setHex(0x888888);

// Create obstacle pool
const obstaclePool = PoolFactory.createThreeObjectPool(
    () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const cube = new THREE.Mesh(geometry, material);
        cube.boundingBox = new THREE.Box3().setFromObject(cube);
        return cube;
    },
    (obj) => {
        obj.position.set(0, -10, 0);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(1, 1, 1);
        obj.visible = false;
    },
    10
);

const activeObstacles = [];

// Spawn some obstacles
for (let i = 0; i < 5; i++) {
    const obstacle = obstaclePool.get();
    obstacle.position.set((Math.random() - 0.5) * 20, 0.5, (Math.random() - 0.5) * 20);
    obstacle.visible = true;
    sceneManager.addObject(obstacle);
    activeObstacles.push(obstacle);
}

let score = 0;
const scoreDisplay = document.createElement('div');
Object.assign(scoreDisplay.style, {
    position: 'absolute', top: '10px', left: '10px',
    color: '#fff', fontFamily: 'Arial', fontSize: '20px', zIndex: '10'
});
scoreDisplay.textContent = 'Score: 0';
document.body.appendChild(scoreDisplay);

const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();

    // Update managers
    sceneManager.update(delta);
    operationField.update(delta);

    // Handle input
    if (inputManager.isKeyPressed('KeyW')) {
        player.position.z -= 5 * delta;
    }
    if (inputManager.isKeyPressed('KeyS')) {
        player.position.z += 5 * delta;
    }
    if (inputManager.isKeyPressed('KeyA')) {
        player.position.x -= 5 * delta;
    }
    if (inputManager.isKeyPressed('KeyD')) {
        player.position.x += 5 * delta;
    }

    // Update bounding box
    player.boundingBox.setFromObject(player);

    // Check collisions with obstacles
    for (let i = activeObstacles.length - 1; i >= 0; i--) {
        const obstacle = activeObstacles[i];
        if (obstacle.visible && player.boundingBox.intersectsBox(obstacle.boundingBox)) {
            score++;
            scoreDisplay.textContent = 'Score: ' + score;
            obstacle.visible = false;
            obstaclePool.release(obstacle);
            sceneManager.removeObject(obstacle);
            activeObstacles.splice(i, 1);
        }
    }

    // Update camera
    cameraController.target.copy(player.position);
    cameraController.update(delta);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

console.log('Universal Modules Demo: Use WASD to move, collect blue cubes for score!');
