import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UIScene } from './UIScene/UIScene.js';
import { UISettings } from './UIScene/UISceneSettings.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x90c3d4);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 12, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

document.body.style.margin = '0';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 15;
controls.maxDistance = 60;
controls.target.set(0, 7, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const planeGeometry = new THREE.BoxGeometry(2.5, 0.8, 4);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0, 10, 0);
scene.add(plane);

const wing = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x223344 }));
plane.add(wing);

const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 6), new THREE.MeshStandardMaterial({ color: 0xaa0000 }));
nose.rotation.x = Math.PI / 2;
nose.position.set(0, 0, -2.5);
plane.add(nose);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x3a763d }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

const uiScene = new UIScene(UISettings);
window.gameControls = { flight: 0.5 };

let velocity = 0;
const gravity = -8;               // gentler gravity
const power = 28;                // less aggressive driver thrust
let score = 0;
let bestScore = 0;
let spawnTimer = 0;
const spawnInterval = 1.2;
const obstacleSpeed = 14;
const obstacles = [];
let gameOver = false;

const info = document.createElement('div');
Object.assign(info.style, {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 18px',
    backgroundColor: 'rgba(0,0,0,0.45)',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    borderRadius: '8px',
    zIndex: '20'
});
info.innerHTML = 'Score: 0 | Best: 0 | Use slider to fly. Press R to restart.';
document.body.appendChild(info);

function createObstacle() {
    const gapHeight = THREE.MathUtils.randFloat(6.5, 9);
    const midY = THREE.MathUtils.randFloat(8, 16);
    const x = 60;

    const upperHeight = 20 - midY + gapHeight / 2;
    const lowerHeight = midY + gapHeight / 2;

    const material = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const upper = new THREE.Mesh(new THREE.BoxGeometry(4, upperHeight, 5), material);
    upper.position.set(x, 20 - upperHeight / 2, 0);

    const lower = new THREE.Mesh(new THREE.BoxGeometry(4, lowerHeight, 5), material);
    lower.position.set(x, lowerHeight / 2, 0);

    scene.add(upper, lower);
    obstacles.push({ upper, lower, passed: false });
}

function resetGame() {
    velocity = 0;
    score = 0;
    spawnTimer = 0;
    gameOver = false;
    plane.position.set(0, 10, 0);
    plane.rotation.z = 0;
    obstacles.forEach(obj => { scene.remove(obj.upper); scene.remove(obj.lower); });
    obstacles.length = 0;
    info.innerHTML = `Score: 0 | Best: ${bestScore} | Use slider to fly. Press R to restart.`;
}

function updateGame(dt) {
    if (gameOver) return;

    const flightInput = window.gameControls?.flight ?? 0.5;
    const normalized = (flightInput - 0.5) * 2; // [-1..1]
    const flightForce = normalized * power;

    velocity += (gravity + flightForce) * dt;
    velocity *= 0.98; // weak air friction, keep stable
    plane.position.y += velocity * dt;
    plane.position.y = Math.max(2.3, Math.min(28, plane.position.y));

    if (plane.position.y <= 2.4 || plane.position.y >= 28) {
        gameOver = true;
    }

    const targetTilt = -THREE.MathUtils.clamp((flightInput - 0.5) * 1.5, -0.7, 0.7);
    plane.rotation.z += (targetTilt - plane.rotation.z) * 5 * dt;

    if (plane.position.y <= 2.4 || plane.position.y >= 28) gameOver = true;

    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) { spawnTimer = 0; createObstacle(); }

    const planeBox = new THREE.Box3().setFromObject(plane);
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.upper.position.x -= obstacleSpeed * dt;
        obs.lower.position.x -= obstacleSpeed * dt;

        if (!obs.passed && obs.upper.position.x < plane.position.x) {
            obs.passed = true;
            score += 1;
            bestScore = Math.max(bestScore, score);
        }

        if (obs.upper.position.x < -60) {
            scene.remove(obs.upper);
            scene.remove(obs.lower);
            obstacles.splice(i, 1);
            continue;
        }

        const upperBox = new THREE.Box3().setFromObject(obs.upper);
        const lowerBox = new THREE.Box3().setFromObject(obs.lower);

        if (planeBox.intersectsBox(upperBox) || planeBox.intersectsBox(lowerBox)) {
            gameOver = true;
        }
    }

    info.innerHTML = `Score: ${score} | Best: ${bestScore} ${gameOver ? '| GAME OVER (R to restart)' : ''}`;
}

const clock = new THREE.Clock();
function animate() { const dt = Math.min(0.033, clock.getDelta()); updateGame(dt); controls.update(); renderer.render(scene,camera); requestAnimationFrame(animate); }

window.addEventListener('keydown', (event) => { if (event.key === 'r' || event.key === 'R') resetGame(); });

resetGame();
animate();

console.log('Flappy-Plane game running. Use flight slider and press R to restart.');
