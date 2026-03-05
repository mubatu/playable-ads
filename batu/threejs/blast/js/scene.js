const GameScene = (function () {
    'use strict';

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x1a1a2e);
    document.body.appendChild(renderer.domElement);

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa9a7d9);

    // --- Grid constants for camera sizing ---
    const GRID_COLS = 8;
    const GRID_ROWS = 8;
    const CELL_SIZE = 1.0;
    const PADDING = 1.5;

    // Total world-space extents of the grid
    const gridWidth  = GRID_COLS * CELL_SIZE;
    const gridHeight = GRID_ROWS * CELL_SIZE;

    // --- Orthographic camera ---
    function makeFrustum() {
        const aspect = window.innerWidth / window.innerHeight;

        // We want the grid (+ padding) to always fit
        let viewWidth  = gridWidth  + PADDING * 2;
        let viewHeight = gridHeight + PADDING * 2;

        // Adjust to maintain aspect ratio
        const gridAspect = viewWidth / viewHeight;
        if (aspect > gridAspect) {
            // Window is wider — expand horizontal view
            viewWidth = viewHeight * aspect;
        } else {
            // Window is taller — expand vertical view
            viewHeight = viewWidth / aspect;
        }

        return {
            left:   -viewWidth  / 2,
            right:   viewWidth  / 2,
            top:     viewHeight / 2,
            bottom: -viewHeight / 2
        };
    }

    const f = makeFrustum();
    const camera = new THREE.OrthographicCamera(f.left, f.right, f.top, f.bottom, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // --- Light ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // --- Resize handler ---
    function handleResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        const fr = makeFrustum();
        camera.left   = fr.left;
        camera.right  = fr.right;
        camera.top    = fr.top;
        camera.bottom = fr.bottom;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', handleResize);

    return {
        renderer: renderer,
        scene: scene,
        camera: camera,
        handleResize: handleResize
    };
})();
