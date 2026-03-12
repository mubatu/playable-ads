(function (window) {
    'use strict';

    var config = window.GameConfig;

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();

    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.MAX_PIXEL_RATIO));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var background = null;
    var bgWorldWidth = 1;
    var bgWorldHeight = 1;

    function initBackground(onReady) {
        var loader = new THREE.TextureLoader();
        loader.load(config.BG_TEXTURE, function (texture) {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;

            var aspect = config.BG_WIDTH / config.BG_HEIGHT;
            bgWorldHeight = 2 * (config.BG_HEIGHT / config.BG_WIDTH);
            bgWorldWidth = bgWorldHeight * aspect;

            var geo = new THREE.PlaneGeometry(bgWorldWidth, bgWorldHeight);
            var mat = new THREE.MeshBasicMaterial({ map: texture });
            background = new THREE.Mesh(geo, mat);
            background.position.set(0, 0, 0);
            scene.add(background);

            updateCamera();

            if (onReady) onReady();
        });
    }

    function getScrollRange() {
        var viewHeight = camera.top - camera.bottom;
        return bgWorldHeight - viewHeight;
    }

    function updateCamera() {
        var aspect = window.innerWidth / window.innerHeight;
        var halfW = bgWorldWidth * 0.5;
        var halfH = halfW / aspect;

        camera.left = -halfW;
        camera.right = halfW;
        camera.top = halfH;
        camera.bottom = -halfH;
        camera.near = 0.1;
        camera.far = 10;
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }

    function setCameraY(y) {
        camera.position.y = y;
    }

    window.GameScene = {
        scene: scene,
        camera: camera,
        renderer: renderer,
        background: background,
        bgWorldWidth: function () { return bgWorldWidth; },
        bgWorldHeight: function () { return bgWorldHeight; },
        initBackground: initBackground,
        updateCamera: updateCamera,
        setCameraY: setCameraY,
        getScrollRange: getScrollRange
    };
})(window);
