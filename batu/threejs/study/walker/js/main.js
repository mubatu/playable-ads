import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// ── Scene ──────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue
scene.fog = new THREE.Fog(0x87ceeb, 200, 600);

// ── Camera ─────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// Camera offset relative to character (will be updated in the loop)
const cameraOffset = new THREE.Vector3(0, 3, 6);

// ── Renderer ───────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("container3D").appendChild(renderer.domElement);

// ── Lighting ───────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x556b2f, 0.4);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(50, 80, 40);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -60;
dirLight.shadow.camera.right = 60;
dirLight.shadow.camera.top = 60;
dirLight.shadow.camera.bottom = -60;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 200;
scene.add(dirLight);

// ── Ground platform ───────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(400, 400, 40, 40);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x4a8c3f,
  roughness: 0.9,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper for spatial reference
const grid = new THREE.GridHelper(400, 80, 0x3a7c2f, 0x3a7c2f);
grid.position.y = 0.01;
grid.material.opacity = 0.15;
grid.material.transparent = true;
scene.add(grid);

// ── Character state ────────────────────────────────────
let mixer = null;
let walkAction = null;
let model = null;
let moveSpeed = 1; // will be auto-calibrated from root motion
const modelScale = 0.01; // cm → m
const rotSpeed = Math.PI * 2; // radians per second (for smooth turning)

// ── Input ──────────────────────────────────────────────
const keys = { w: false, a: false, s: false, d: false };

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = true;
});
window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = false;
});

// ── Load character ─────────────────────────────────────
const loader = new GLTFLoader();
loader.load(
  "models/Walking.gltf",
  (gltf) => {
    model = gltf.scene;

    // The Mixamo model is in centimetres; scale down so 1 unit ≈ 1 m
    model.scale.setScalar(modelScale);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(model);

    // Set up animation mixer
    mixer = new THREE.AnimationMixer(model);

    if (gltf.animations.length > 0) {
      const clip = gltf.animations[0];

      // ── Compute walk speed from root motion, then strip it ──
      // Mixamo bakes XZ translation into the Hips track.
      // We measure the total XZ displacement over the clip duration
      // to derive the correct movement speed, then lock XZ so only
      // the vertical (Y) bob remains — no more foot sliding.
      const hipsPosTrack = clip.tracks.find(
        (t) => t.name.includes("Hips") && t.name.endsWith(".position")
      );
      if (hipsPosTrack) {
        const v = hipsPosTrack.values;
        const stride = 3; // vec3

        // Accumulate total XZ distance across all keyframes
        let totalDist = 0;
        for (let i = stride; i < v.length; i += stride) {
          const dx = v[i]     - v[i - stride];
          const dz = v[i + 2] - v[i + 2 - stride];
          totalDist += Math.sqrt(dx * dx + dz * dz);
        }

        // Convert to world-space and derive velocity
        const worldDist = totalDist * modelScale;
        const clipDuration = clip.duration; // seconds
        moveSpeed = worldDist / clipDuration;
        console.log(
          `Root-motion calibration: ${totalDist.toFixed(1)} cm over ` +
          `${clipDuration.toFixed(2)}s → moveSpeed = ${moveSpeed.toFixed(3)} u/s`
        );

        // Lock Hips XZ to first-frame values (keep Y bob)
        const baseX = v[0];
        const baseZ = v[2];
        for (let i = 0; i < v.length; i += stride) {
          v[i]     = baseX;
          v[i + 2] = baseZ;
        }
      }

      walkAction = mixer.clipAction(clip);
      walkAction.play();
      walkAction.paused = true; // start paused; will play when moving
    }

    console.log("Character loaded ✓");
  },
  (p) => console.log(`Loading… ${((p.loaded / p.total) * 100).toFixed(0)}%`),
  (err) => console.error("Error loading model:", err)
);

// ── Helpers ────────────────────────────────────────────
const clock = new THREE.Clock();
const direction = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();

function isMoving() {
  return keys.w || keys.a || keys.s || keys.d;
}

// ── Animation loop ─────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (model) {
    // Build movement direction from pressed keys
    direction.set(0, 0, 0);
    if (keys.w) direction.z -= 1;
    if (keys.s) direction.z += 1;
    if (keys.a) direction.x -= 1;
    if (keys.d) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();

      // Move character
      model.position.x += direction.x * moveSpeed * dt;
      model.position.z += direction.z * moveSpeed * dt;

      // Rotate character to face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      model.quaternion.rotateTowards(targetQuaternion, rotSpeed * dt);
    }

    // Walk animation control
    if (walkAction) {
      if (isMoving()) {
        walkAction.paused = false;
        walkAction.setEffectiveWeight(1);
      } else {
        walkAction.paused = true;
      }
    }

    // Update mixer
    if (mixer) mixer.update(dt);

    // Camera follow (smooth)
    const idealPos = model.position.clone().add(cameraOffset);
    camera.position.lerp(idealPos, 1 - Math.exp(-5 * dt));
    camera.lookAt(
      model.position.x,
      model.position.y + 1.5,
      model.position.z
    );

    // Keep directional light centered on character
    dirLight.position.set(
      model.position.x + 50,
      80,
      model.position.z + 40
    );
    dirLight.target.position.copy(model.position);
    dirLight.target.updateMatrixWorld();
  }

  renderer.render(scene, camera);
}

animate();

// ── Resize ─────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
