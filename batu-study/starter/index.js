console.log("Batuhan was here.");

import * as THREE from "three";

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

// Add a simple icosahedron to the scene
const geo = new THREE.IcosahedronGeometry(1.0, 2);
const mat = new THREE.MeshBasicMaterial({
    color: 0xccff, // light blue
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

function animate(t = 0) {
    // This request provide us a time difference between each frame,
    // so we can use it for animations
    requestAnimationFrame(animate);

    mesh.scale.setScalar(Math.cos(t * 0.001 + 1.0));

    // RENDER
    renderer.render(scene, camera);
}
animate();