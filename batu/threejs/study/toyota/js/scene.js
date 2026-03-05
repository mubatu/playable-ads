/**
 * scene.js — Renderer, scene, lighting, and asphalt ground platform
 */

const GameScene = (function () {
    'use strict';

    // ── Renderer ──────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);         // sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 80, 200);         // subtle depth fog

    // ── Lighting ──────────────────────────────────────

    // Ambient fill
    const ambient = new THREE.HemisphereLight(0x8dc1f2, 0x6b5438, 0.6);
    scene.add(ambient);

    // Directional sun
    const sun = new THREE.DirectionalLight(0xfff4e6, 1.4);
    sun.position.set(30, 40, 20);
    sun.castShadow = true;

    // Shadow camera encompasses the platform
    sun.shadow.camera.left   = -60;
    sun.shadow.camera.right  =  60;
    sun.shadow.camera.top    =  60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.camera.near   =  0.5;
    sun.shadow.camera.far    = 120;
    sun.shadow.mapSize.width  = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.001;
    scene.add(sun);
    scene.add(sun.target);

    // ── Ground platform (asphalt) ─────────────────────
    const PLATFORM_SIZE = 200;
    const HALF = PLATFORM_SIZE / 2;

    const groundGeo = new THREE.PlaneGeometry(PLATFORM_SIZE, PLATFORM_SIZE);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.92,
        metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ── Boundary edge strips (white lane markers) ─────
    const stripMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.6,
    });

    function createStrip(width, depth, x, z) {
        const geo = new THREE.PlaneGeometry(width, depth);
        const mesh = new THREE.Mesh(geo, stripMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.01, z);     // tiny Y offset to avoid z-fight
        mesh.receiveShadow = true;
        scene.add(mesh);
    }

    const STRIP_W = 0.6;
    // North & south
    createStrip(PLATFORM_SIZE, STRIP_W, 0, -HALF + STRIP_W / 2);
    createStrip(PLATFORM_SIZE, STRIP_W, 0,  HALF - STRIP_W / 2);
    // East & west
    createStrip(STRIP_W, PLATFORM_SIZE, -HALF + STRIP_W / 2, 0);
    createStrip(STRIP_W, PLATFORM_SIZE,  HALF - STRIP_W / 2, 0);

    // ── Center line markings (dashed) ─────────────────
    const dashMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.5,
    });
    const dashLen = 3, dashGap = 3, dashW = 0.2;
    for (let z = -HALF + dashGap; z < HALF; z += dashLen + dashGap) {
        const geo = new THREE.PlaneGeometry(dashW, dashLen);
        const dash = new THREE.Mesh(geo, dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.01, z + dashLen / 2);
        dash.receiveShadow = true;
        scene.add(dash);
    }

    // ── Resize handler ────────────────────────────────
    function handleResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    return {
        renderer: renderer,
        scene: scene,
        sun: sun,
        PLATFORM_HALF: HALF,
        handleResize: handleResize,
    };
})();
