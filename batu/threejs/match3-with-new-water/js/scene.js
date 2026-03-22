(function (window) {
    'use strict';

    var config = window.GameConfig;

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();

    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    function updateCamera(boardWidth, boardHeight) {
        var aspect = window.innerWidth / window.innerHeight;
        var targetWidth = boardWidth + config.BOARD_PADDING;
        var targetHeight = boardHeight + config.BOARD_PADDING;
        var boardAspect = targetWidth / targetHeight;

        if (aspect > boardAspect) {
            camera.top = targetHeight * 0.5;
            camera.bottom = -targetHeight * 0.5;
            camera.right = camera.top * aspect;
            camera.left = -camera.right;
        } else {
            camera.right = targetWidth * 0.5;
            camera.left = -targetWidth * 0.5;
            camera.top = camera.right / aspect;
            camera.bottom = -camera.top;
        }

        camera.near = 0.1;
        camera.far = 20;
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }

    window.GameScene = {
        scene: scene,
        camera: camera,
        renderer: renderer,
        updateCamera: updateCamera
    };
})(window);
