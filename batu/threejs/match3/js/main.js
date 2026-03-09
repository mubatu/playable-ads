(function () {
    'use strict';

    var ROWS = 6;
    var COLS = 10;
    var TILE_SIZE = 1;
    var TILE_GAP = 0.04;
    var BOARD_PADDING = 0.2;
    var BOTTOM_OFFSET = 2.8;
    var COLOR_TILE_SCALE = 0.9;
    var COLOR_TEXTURE_PATHS = [
        'assets/blue.png',
        'assets/green.png',
        'assets/red.png',
        'assets/yellow.png'
    ];

    var boardWidth = COLS * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    var boardHeight = ROWS * (TILE_SIZE + TILE_GAP) - TILE_GAP;

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera();

    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/background.png', function (texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });

    function createTextureWithTransparentWhite(image, threshold) {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        for (var i = 0; i < data.length; i += 4) {
            var red = data[i];
            var green = data[i + 1];
            var blue = data[i + 2];

            if (red >= threshold && green >= threshold && blue >= threshold) {
                data[i + 3] = 0;
            }
        }

        context.putImageData(imageData, 0, 0);

        var texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        return texture;
    }

    function loadColorMaterials(onComplete) {
        var colorMaterials = [];
        var loadedCount = 0;

        for (var i = 0; i < COLOR_TEXTURE_PATHS.length; i += 1) {
            (function (index) {
                textureLoader.load(COLOR_TEXTURE_PATHS[index], function (texture) {
                    var colorTexture = createTextureWithTransparentWhite(texture.image, 245);
                    colorMaterials[index] = new THREE.MeshBasicMaterial({
                        map: colorTexture,
                        transparent: true,
                        alphaTest: 0.02
                    });

                    loadedCount += 1;
                    if (loadedCount === COLOR_TEXTURE_PATHS.length) {
                        onComplete(colorMaterials);
                    }
                });
            })(i);
        }
    }

    textureLoader.load('assets/fixed-tile.png', function (texture) {
        var tileTexture = createTextureWithTransparentWhite(texture.image, 245);

        var tileMaterial = new THREE.MeshBasicMaterial({
            map: tileTexture,
            transparent: true,
            alphaTest: 0.02
        });
        var tileGeometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
        var colorTileGeometry = new THREE.PlaneGeometry(TILE_SIZE * COLOR_TILE_SCALE, TILE_SIZE * COLOR_TILE_SCALE);

        loadColorMaterials(function (colorMaterials) {
            for (var row = 0; row < ROWS; row += 1) {
                for (var col = 0; col < COLS; col += 1) {
                    var tileX = col * (TILE_SIZE + TILE_GAP) - boardWidth * 0.5 + TILE_SIZE * 0.5;
                    var tileY = boardHeight * 0.5 - row * (TILE_SIZE + TILE_GAP) - TILE_SIZE * 0.5 - BOTTOM_OFFSET;

                    var fixedTile = new THREE.Mesh(tileGeometry, tileMaterial);
                    fixedTile.position.set(tileX, tileY, 0);
                    scene.add(fixedTile);

                    var randomColorIndex = Math.floor(Math.random() * colorMaterials.length);
                    var colorTile = new THREE.Mesh(colorTileGeometry, colorMaterials[randomColorIndex]);
                    colorTile.position.set(tileX, tileY, 0.01);
                    scene.add(colorTile);
                }
            }

            animate();
        });
    });

    function updateCamera() {
        var aspect = window.innerWidth / window.innerHeight;
        var targetWidth = boardWidth + BOARD_PADDING;
        var targetHeight = boardHeight + BOARD_PADDING;
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

    function onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateCamera();
    }

    function animate() {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', onResize);
    updateCamera();
})();
