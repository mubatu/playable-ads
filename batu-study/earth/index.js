import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

// Scene setup
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer( {antialias: true} );
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * (Math.PI / 180); // Match earth's actual axial tilt
scene.add(earthGroup);

// Earth
const loader = new THREE.TextureLoader();
const detail = 12;
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshStandardMaterial({
    map: loader.load("../earth/assets/earthmap.jpg"),
    // color: 0xffff00, // yellow
    // flatShading: true,
});
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

// const lightsMat = new THREE.MeshBasicMaterial({
//     map: loader.load("../earth/assets/earthlights.jpg"),
//     blending: THREE.AdditiveBlending,
// });
// const lightsMesh = new THREE.Mesh(geometry, lightsMat);
// earthGroup.add(lightsMesh);

// Hemisphere Light
// const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcccccc);
// scene.add(hemiLight);

// Sun Light
const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-2, -0.5, 1.5);
scene.add(sunLight);

// Animate loop
function animate() {
    requestAnimationFrame(animate);

    earthMesh.rotation.y += 0.002;
    // lightsMesh.rotation.y += 0.002;

    // RENDER
    renderer.render(scene, camera);
}
animate();

// Texture switcher
document.getElementById("earth-btn").addEventListener("click", () => {
    material.map = loader.load("../earth/assets/earthmap.jpg");
    material.needsUpdate = true;
});
document.getElementById("moon-btn").addEventListener("click", () => {
    material.map = loader.load("../earth/assets/moonmap.jpg");
    material.needsUpdate = true;
});
document.getElementById("mars-btn").addEventListener("click", () => {
    material.map = loader.load("../earth/assets/marsmap.jpg");
    material.needsUpdate = true;
});
document.getElementById("jupiter-btn").addEventListener("click", () => {
    material.map = loader.load("../earth/assets/jupitermap.jpg");
    material.needsUpdate = true;
});