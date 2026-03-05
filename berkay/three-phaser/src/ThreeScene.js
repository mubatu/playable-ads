import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Import the dynamically generated compressed model
import myModelUrl from './assets/model_draco.glb?url';

export function initThreeJS() {
    const canvas = document.querySelector('#three-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    let loadedModel;

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(myModelUrl, (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.position.y = -1;
        scene.add(loadedModel);
    });

    function animate() {
        requestAnimationFrame(animate);
        if (loadedModel) loadedModel.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Event Bridge: Receive swipe data from Phaser
    window.addEventListener('rotate3DModel', (event) => {
        if (loadedModel) {
            loadedModel.rotation.y += event.detail.x * 0.01;
            loadedModel.rotation.x += event.detail.y * 0.01;
        }
    });
}