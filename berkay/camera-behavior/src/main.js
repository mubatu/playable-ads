import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Ground } from "./Ground";
import { UISettings } from "./UIScene/UISceneSettings";
import { UIScene } from "./UIScene/UIScene";
import { Player } from "./Player";
import {ObstacleFactory} from "./Factory/ObstacleFactory";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
// Pull the camera back and up a bit more to see the incoming boxes
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// We'll keep the test cube just for fun, moved out of the way
const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial());
cube.position.set(5, 1, 0);
scene.add(cube);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

new Ground(scene, 0, 0, 0, 200, 200, 0x4a7c59);
new UIScene(UISettings);

const player = new Player(scene, new THREE.Vector3(0, 1, 0));
player.attachCamera(camera);


// --- 2. POOL SETUP ---
const obstaclePool = ObstacleFactory.createPool(15);
const activeObstacles = [];

let spawnTimer = 0;
const spawnInterval = 0.8; // Spawn a new box every 0.8 seconds
const obstacleSpeed = 25;  // How fast they move towards the player

const clock = new THREE.Clock();

// --- 3. THE ONE TRUE ANIMATION LOOP ---
function animate() {
  const delta = clock.getDelta();

  // Spin test cube
  cube.rotation.x += 1 * delta;
  cube.rotation.y += 1 * delta;

  // Update Player
  player.update(delta);

  // --- 4. SPAWNING LOGIC ---
  spawnTimer += delta;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;

    const box = obstaclePool.get();

    // Randomize X position between -10 and 10
    const randomX = 0;

    // Put it far away (Z: -60) and resting on the floor (Y: 1.25)
    box.position.set(randomX, 1.25, -60);
    box.visible = true;

    // Only add to scene if it's brand new
    if (!box.parent) {
      scene.add(box);
    }

    activeObstacles.push(box);
  }

  // --- 5. MOVEMENT & RECYCLING LOGIC ---
  // Loop backwards so array index doesn't shift when we splice!
  for (let i = activeObstacles.length - 1; i >= 0; i--) {
    const box = activeObstacles[i];

    // Move towards the camera
    box.position.z += obstacleSpeed * delta;

    // Force a matrix update to ensure the hitbox perfectly matches the visual mesh
    box.updateMatrixWorld(true);

    // Update its hitbox
    if(box.boundingBox) {
      box.boundingBox.setFromObject(box);
    }

    // --- THE COLLISION CHECK ---
    if (box.boundingBox && player.boundingBox.intersectsBox(box.boundingBox)) {
      console.log("CRASH! Player hit an obstacle!");

      // Recycle the box so it doesn't trigger collisions 60 times a second while passing through the player
      obstaclePool.release(box);
      activeObstacles.splice(i, 1);

      // We skip the rest of the loop for this specific box since it's "dead"
      continue;
    }

    // If it passes behind the camera, throw it back in the pool
    if (box.position.z > camera.position.z + 10) {
      obstaclePool.release(box);
      activeObstacles.splice(i, 1);
    }
  }

  controls.target.copy(player.mesh.position);
  controls.update();
  renderer.render(scene, camera);
}

// Start the loop!
renderer.setAnimationLoop(animate);