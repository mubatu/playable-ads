/**
 * scene.js — Scene setup: renderer, scene, lighting
 * No sky — background is a muted neutral color.
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
    // Muted warm grey — acts as "no sky", just empty space above the ground
    scene.background = new THREE.Color(0xc8b99a);
    // Fog that blends terrain edges into the background
    scene.fog = new THREE.Fog(0xc8b99a, 40, 80);

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
