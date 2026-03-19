import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// --- 1. CONFIGURATION & GLOBALS ---
const GRID_SIZE = 8;
const textureLoader = new THREE.TextureLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let projectRoot = null;
let currentSelectedTexture = null;
const uploadedTextures = []; // { url, name }
const itemMeshes = [];
let levelData = { background: null, items: [] };

// --- 2. SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(GRID_SIZE / 2, GRID_SIZE / 2, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(GRID_SIZE / 2 - 0.5, GRID_SIZE / 2 - 0.5, 0);

// --- 3. GRID HELPER ---
const gridPlaneGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
const gridPlaneMat = new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: true, transparent: true, opacity: 0.5 });
const gridPlane = new THREE.Mesh(gridPlaneGeo, gridPlaneMat);
gridPlane.position.set(GRID_SIZE / 2 - 0.5, GRID_SIZE / 2 - 0.5, 0);
scene.add(gridPlane);

// --- 4. FILE SYSTEM & PERSISTENCE ---

window.setProjectRoot = async () => {
    try {
        projectRoot = await window.showDirectoryPicker();
        document.getElementById('folder-status').innerText = "✅ Connected: " + projectRoot.name;
        document.getElementById('btn-project').style.background = "#4CAF50";

        // Clear UI and internal tracking before scanning
        document.getElementById('asset-list').innerHTML = '';
        uploadedTextures.length = 0;

        // Auto-scan for 'photos' subfolder
        await loadExistingAssets();
    } catch (err) {
        console.error("Folder selection cancelled or failed:", err);
    }
};

// Scans for a folder named 'photos' and populates the library
async function loadExistingAssets() {
    try {
        // Attempt to get the folder. {create: true} ensures it exists for the user.
        const photosDir = await projectRoot.getDirectoryHandle('photos', { create: true });

        // Loop through all files in the /photos directory
        for await (const entry of photosDir.values()) {
            if (entry.kind === 'file' && /\.(jpe?g|jfif|png|webp|gif|svg)$/i.test(entry.name)) {
                const file = await entry.getFile();
                const url = URL.createObjectURL(file);
                addAssetToUI(url, entry.name);
            }
        }

        if (uploadedTextures.length === 0) {
            console.log("Photos folder found but it's empty.");
        }
    } catch (err) {
        console.error("Error accessing the photos folder:", err);
    }
}

function addAssetToUI(url, fileName) {
    uploadedTextures.push({ url, name: fileName });

    const img = document.createElement('img');
    img.src = url;
    img.className = "asset-thumb";
    img.title = fileName; // Show filename on hover
    img.style = "width:45px; height:45px; border:2px solid transparent; cursor:pointer; object-fit:cover; background:#333; border-radius:4px;";

    img.onclick = () => {
        document.querySelectorAll('.asset-thumb').forEach(t => t.style.borderColor = 'transparent');
        img.style.borderColor = '#2196F3';
        currentSelectedTexture = { url, name: fileName };
    };

    document.getElementById('asset-list').appendChild(img);
}

async function saveFileToFolder(subfolder, fileName, blob) {
    if (!projectRoot) return alert("Connect your Project Folder first!");
    const dirHandle = await projectRoot.getDirectoryHandle(subfolder, { create: true });
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
}

// --- 5. EDITOR CORE FUNCTIONS ---

window.clearLevel = () => {
    itemMeshes.forEach(mesh => scene.remove(mesh));
    itemMeshes.length = 0;
    levelData.items = [];
};

function addItem(x, y, imageUrl, fileName) {
    // Check if a mesh already exists at this coordinate to prevent stacking
    const exists = levelData.items.find(i => i.x === x && i.y === y);
    if (exists) return;

    const tex = textureLoader.load(imageUrl);
    const geometry = new THREE.PlaneGeometry(0.8, 0.8);
    const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, 0.1);
    scene.add(mesh);
    itemMeshes.push(mesh);
    levelData.items.push({ x, y, type: `photos/${fileName}` });
}

document.getElementById('file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !projectRoot) return alert("Select project folder first!");

    // Save actual file to /photos folder on disk
    await saveFileToFolder('photos', file.name, file);

    // Create preview
    const url = URL.createObjectURL(file);
    addAssetToUI(url, file.name);
});

window.generateRandomLevel = () => {
    if (uploadedTextures.length === 0) return alert("Add or load photos first!");
    window.clearLevel();
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            const rand = uploadedTextures[Math.floor(Math.random() * uploadedTextures.length)];
            addItem(x, y, rand.url, rand.name);
        }
    }
};

window.saveLevel = async () => {
    if (levelData.items.length === 0) return alert("Level is empty!");
    const name = prompt("Level Name:", "level_1.json") || "level.json";
    const blob = new Blob([JSON.stringify(levelData, null, 2)], { type: 'application/json' });

    await saveFileToFolder('levels', name.endsWith('.json') ? name : name + '.json', blob);
    alert(`Success! Saved to levels/${name}`);
};

// --- 6. INTERACTION & RENDER ---

window.addEventListener('mousedown', (event) => {
    // Stop placement if clicking UI buttons
    if (event.target.closest('#ui-container')) return;
    if (!currentSelectedTexture) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(gridPlane);

    if (intersects.length > 0) {
        const pt = intersects[0].point;
        addItem(Math.round(pt.x), Math.round(pt.y), currentSelectedTexture.url, currentSelectedTexture.name);
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();