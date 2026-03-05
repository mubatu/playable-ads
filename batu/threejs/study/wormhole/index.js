import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import spline from "./spline.js";

// Scene setup
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.2); // Fog
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer( {antialias: true} );
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Create a line geometry from the spline points
// const points = spline.getPoints(100);
// const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
// const line = new THREE.Line(geometry, material);
// scene.add(line);

// Create a tube geometry from the spline points
const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
const tubeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    // side: THREE.DoubleSide,
    wireframe: true,
});
const tube = new THREE.Mesh(tubeGeo, tubeMat);
scene.add(tube);

// NOT: Basic -> her zaman gözüküyor, Standard -> ışıklandırmaya göre gözüküyor

// Hemisphere Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcccccc);
scene.add(hemiLight);

function updateCamera(t) {
    const time = t * 0.1;
    const looptime = 8 * 1000;
    const p = (time % looptime) / looptime; // p her zaman 0,1 arasında

    const pos = tubeGeo.parameters.path.getPointAt(p);
    camera.position.copy(pos);

    const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
    camera.lookAt(lookAt);
}

// Animate loop
function animate(t = 0) {
    requestAnimationFrame(animate);
    
    updateCamera(t);

    // RENDER
    renderer.render(scene, camera);
}
animate();