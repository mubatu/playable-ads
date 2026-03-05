/**
 * scene.js — Scene setup: renderer, scene, lighting, sky gradient
 */

const GameScene = (function () {
    'use strict';

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // ---- Scene ----
    const scene = new THREE.Scene();

    // Sky gradient (top-down: blue → pale horizon)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1;
    skyCanvas.height = 256;
    const ctx = skyCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#4A90D9');   // top — deeper blue
    grad.addColorStop(0.4, '#78c9e8');   // mid — sky blue
    grad.addColorStop(0.8, '#d4e7f5');   // low — pale blue
    grad.addColorStop(1.0, '#f0e8d8');   // horizon — warm haze
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1, 256);
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = skyTexture;

    // Fog that blends terrain edges into the horizon color
    scene.fog = new THREE.Fog(0xd4e7f5, 40, 80);

    // ---- Lighting ----
    // Hemisphere light: warm sky / cool ground
    const hemi = new THREE.HemisphereLight(0xffeeb1, 0x8d6e42, 0.6);
    scene.add(hemi);

    // Directional light (sun)
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.0);
    sun.position.set(15, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    scene.add(sun);

    // Soft ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    // ---- Resize handler ----
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Camera aspect update is handled in camera.js
        if (typeof GameCamera !== 'undefined') {
            GameCamera.handleResize();
        }
    });

    return { renderer, scene, sun };
})();
