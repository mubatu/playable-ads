import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PoolFactory } from './index.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86c3e8);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 8, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = '0';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;

const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(5, 20, 10);
scene.add(dirLight);

const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a8f4b });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 300), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.z = -100;
scene.add(ground);

const track = new THREE.Mesh(new THREE.PlaneGeometry(24, 300), new THREE.MeshStandardMaterial({ color: 0x4a4a4a }));
track.rotation.x = -Math.PI / 2;
track.position.z = -100;
scene.add(track);

const laneMarkers = new THREE.Group();
for (let i = -1; i <= 1; i++) {
  if (i === 0) continue;
  const marker = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 300), new THREE.MeshStandardMaterial({ color: 0xffffff, opacity: 0.45, transparent: true }));
  marker.position.set(i * 4, 0.01, -100);
  laneMarkers.add(marker);
}
scene.add(laneMarkers);

const player = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 3.2), new THREE.MeshStandardMaterial({ color: 0xffe16a }));
player.position.set(0, 1.2, -10);
scene.add(player);

const lanes = [-4, 0, 4];
let laneIndex = 1;
let targetX = lanes[laneIndex];
let laneChanging = false;

const obstaclePool = PoolFactory.createThreeObjectPool(
  () => {
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xff4d4d });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    return cube;
  },
  (obj) => {
    obj.position.set(0, -100, 0);
    obj.rotation.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
    obj.visible = false;
  },
  40
);

const activeObstacles = [];
let spawnTimer = 0;
let spawnSpeed = 0.9;
let speed = 22;
let gameTime = 0;
let score = 0;
let bestScore = 0;
let gameOver = false;

const status = document.createElement('div');
Object.assign(status.style, {
  position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)',
  color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.45)', padding: '10px 14px',
  fontFamily: 'Arial, sans-serif', fontSize: '16px', borderRadius: '8px', zIndex: '20'
});
status.textContent = 'Score: 0 | Best: 0 | Left/Right to move. R to restart.';
document.body.appendChild(status);

function spawnObstacle() {
  const obstacle = obstaclePool.get();
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  const zPos = -150;
  obstacle.position.set(lane, 1.25, zPos);
  obstacle.visible = true;
  scene.add(obstacle);
  activeObstacles.push(obstacle);
}

function resetGame() {
  gameTime = 0;
  score = 0;
  speed = 18;
  spawnSpeed = 0.9;
  gameOver = false;
  laneIndex = 1;
  targetX = lanes[laneIndex];
  player.position.set(targetX, 1.2, 10);
  player.rotation.z = 0;
  laneChanging = false;

  activeObstacles.slice().forEach((obs) => {
    scene.remove(obs);
    obstaclePool.release(obs);
  });
  activeObstacles.length = 0;

  status.textContent = 'Score: 0 | Best: ' + bestScore + ' | Left/Right to move. R to restart.';
}

function gameOverNow() {
  gameOver = true;
  bestScore = Math.max(bestScore, score);
  status.textContent = `GAME OVER! Score: ${score} | Best: ${bestScore} | Press R to restart.`;
}

function update(dt) {
  if (gameOver) return;

  gameTime += dt;
  score = Math.floor(gameTime * 4);

  if (score > 0 && score % 50 === 0) speed = 18 + score * 0.04;
  spawnTimer += dt;
  if (spawnTimer > spawnSpeed) {
    spawnTimer -= spawnSpeed;
    spawnObstacle();
    spawnSpeed = Math.max(0.45, spawnSpeed - 0.002);
  }

  const moveSpeed = 9;
  player.position.x += (targetX - player.position.x) * Math.min(1, moveSpeed * dt);

  if (Math.abs(player.position.x - targetX) < 0.03) {
    player.position.x = targetX;
    laneChanging = false;
  }

  camera.position.x += (player.position.x - camera.position.x) * 0.08;
  camera.position.z = 14;
  camera.lookAt(player.position.x, 1.2, player.position.z - 8);

  const playerBox = new THREE.Box3().setFromObject(player);

  for (let i = activeObstacles.length - 1; i >= 0; i--) {
    const obs = activeObstacles[i];
    obs.position.z += speed * dt;

    if (obs.position.z > 20) {
      scene.remove(obs);
      obstaclePool.release(obs);
      activeObstacles.splice(i, 1);
      continue;
    }

    const obsBox = new THREE.Box3().setFromObject(obs);
    if (obsBox.intersectsBox(playerBox)) {
      gameOverNow();
      break;
    }
  }

  status.textContent = `Score: ${score} | Best: ${bestScore} | Speed: ${speed.toFixed(1)} ${gameOver ? '| GAME OVER' : ''}`;
}

const clock = new THREE.Clock();
function animate() {
  const dt = Math.min(0.033, clock.getDelta());
  update(dt);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', (event) => {
  if (gameOver && (event.key === 'r' || event.key === 'R')) {
    resetGame();
    return;
  }

  if (event.key === 'ArrowLeft' || event.key === 'a') {
    if (laneIndex > 0 && !laneChanging) {
      laneIndex -= 1;
      targetX = lanes[laneIndex];
      laneChanging = true;
    }
  }

  if (event.key === 'ArrowRight' || event.key === 'd') {
    if (laneIndex < lanes.length - 1 && !laneChanging) {
      laneIndex += 1;
      targetX = lanes[laneIndex];
      laneChanging = true;
    }
  }

  if (event.key === 'r' || event.key === 'R') {
    resetGame();
  }
});

resetGame();
animate();

console.log('Subway-surfer demo running. Use Arrow keys / A-D to change lane. R to restart.');
