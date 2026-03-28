const GameScene = (function () {
    'use strict';

    const container = document.getElementById('app');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0b0f14);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 6.4, 7.2);
    camera.lookAt(0, 0.64, 0);

    function handleResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', handleResize);

    return {
        container: container,
        renderer: renderer,
        scene: scene,
        camera: camera,
        handleResize: handleResize
    };
})();
