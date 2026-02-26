import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

await RAPIER.init();

const n = 10;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

const button = document.createElement("button");
button.innerText = "Restart";
button.style.position = "absolute";
button.style.top = "20px";
button.style.left = "20px";
button.style.padding = "10px 16px";
button.style.fontSize = "16px";
button.style.cursor = "pointer";
button.style.zIndex = "10";
document.body.appendChild(button);

const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

const floorBody = world.createRigidBody(
  RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0)
);

world.createCollider(
  RAPIER.ColliderDesc.cuboid(10, 1, 10),
  floorBody
);

const floorMesh = new THREE.Mesh(
  new THREE.BoxGeometry(20, 2, 20),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
floorMesh.position.set(0, -1, 0);
scene.add(floorMesh);

let boxes = [];
let meshes = [];

function createBoxes() {
  for (let i = 0; i < n; i++) {

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(
        Math.random() * 4 - 2,
        5 + i,
        Math.random() * 4 - 2
      );

    const body = world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc
      .cuboid(0.5, 0.5, 0.5)
      .setRestitution(1.0);

    world.createCollider(colliderDesc, body);

    body.setLinvel({
      x: Math.random() * 5 - 2.5,
      y: Math.random() * 5,
      z: Math.random() * 5 - 2.5
    }, true);

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5)
      })
    );

    scene.add(mesh);

    boxes.push(body);
    meshes.push(mesh);
  }
}

function resetScene() {

  boxes.forEach(body => {
    world.removeRigidBody(body);
  });

  meshes.forEach(mesh => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });

  boxes = [];
  meshes = [];

  createBoxes();
}

// Button click
button.addEventListener("click", resetScene);

// Initial spawn
createBoxes();

// ---------- ANIMATION LOOP ----------
function animate() {
  requestAnimationFrame(animate);

  world.step();

  for (let i = 0; i < boxes.length; i++) {
    const body = boxes[i];
    const mesh = meshes[i];

    const pos = body.translation();
    const rot = body.rotation();

    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  }

  renderer.render(scene, camera);
}

animate();

// ---------- RESPONSIVE ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});