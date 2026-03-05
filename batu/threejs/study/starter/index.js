console.log("Batuhan was here.");

import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

// We need 3 objects generally:
// 1. Renderer, 2. Camera, 3. Scene

const w = window.innerWidth;
const h = window.innerHeight;

// Create renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );

// Set the size of the renderer so it can fill the whole screen
renderer.setSize(w, h);

// Add the renderer's canvas element to the DOM(HTML page)
document.body.appendChild(renderer.domElement);

const fov = 75; // Field of View
const aspect = w / h; // Aspect Ratio
const near = 0.1; // Near Clipping Plane
const far = 10; // Far Clipping Plane

// Create camera
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

// Adjust camera so that we can see the center of the scene
camera.position.z = 2;

// Create scene
const scene = new THREE.Scene();

// Create orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// Add a simple icosahedron to the scene
const geo = new THREE.IcosahedronGeometry(1.0, 2);
const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // white
    flatShading: true,
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// Add the same geometry with a different material
const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, // white
    wireframe: true, 
});
const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001);
mesh.add(wireMesh);

// Light
const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

function animate(t = 0) {
    // This request provide us a time difference between each frame,
    // so we can use it for animations
    requestAnimationFrame(animate);

    //mesh.scale.setScalar(Math.cos(t * 0.001 + 1.0));
    mesh.rotation.y = t * 0.0001;
    controls.update();

    // RENDER
    renderer.render(scene, camera);
}
animate();