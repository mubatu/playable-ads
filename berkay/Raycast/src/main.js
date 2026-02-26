import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box } from "./box.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 0, 7);

const controls = new OrbitControls(camera, renderer.domElement);

// Light (needed because we use MeshStandardMaterial)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Create 3 boxes
const boxes = [
  new Box({
    scene,
    position: new THREE.Vector3(-2, 0, 0),
    color: 0xff0000,
    name: "Box1"
  }),
  new Box({
    scene,
    position: new THREE.Vector3(0, 0, 0),
    color: 0x00ff00,
    name: "Box2"
  }),
  new Box({
    scene,
    position: new THREE.Vector3(2, 0, 0),
    color: 0x0000ff,
    name: "Box3"
  })
];

// Raycaster for clicking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    boxes.map((b) => b.mesh)
  );

  if (intersects.length > 0) {
    const box = intersects[0].object.userData.box;
    box.toggleAnimation();
  }
});

// Animation loop
function animate() {
  boxes.forEach((box) => box.update());
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);