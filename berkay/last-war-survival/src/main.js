import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Ground } from "./ground";
import { HumanFactory } from "./humanFactory";
import { Player } from "./player";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

new Ground(scene, 0, -1, -1, 10, 100);

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(10, 10, 10);
scene.add(light);

const player = new Player(scene);
const humanFactory = new HumanFactory(scene, player);

const clock = new THREE.Clock();
let spawnTimer = 0;
const spawnInterval = 0.2;

window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") player.moveLeft();
    if (e.code === "ArrowRight") player.moveRight();
});

function animate() {
    const delta = clock.getDelta();

    spawnTimer += delta;
    if (spawnTimer >= spawnInterval) {
        humanFactory.produce(3);
        spawnTimer = 0;
    }

    humanFactory.update(delta);
    player.update(delta);

    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);