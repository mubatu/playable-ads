(function () {
    'use strict';

    var renderer = GameScene.renderer;
    var scene    = GameScene.scene;
    var camera   = GameScene.camera;

    // --- Initialize the grid ---
    Grid.init();

    // --- Raycaster for click/tap detection ---
    var raycaster = new THREE.Raycaster();
    var pointer   = new THREE.Vector2();
    var clock     = new THREE.Clock();

    function onPointerDown(event) {
        // Prevent double-firing on touch devices
        event.preventDefault();

        // Normalize pointer coordinates to [-1, +1]
        var x, y;
        if (event.changedTouches && event.changedTouches.length > 0) {
            x = event.changedTouches[0].clientX;
            y = event.changedTouches[0].clientY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }

        pointer.x =  (x / window.innerWidth)  * 2 - 1;
        pointer.y = -(y / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        var meshes = Grid.getAllMeshes();
        var intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            if (Blast.isBusy()) return;
            var hit = intersects[0].object;
            var row = hit.userData.row;
            var col = hit.userData.col;
            Blast.tryBlast(row, col);
        }
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown, false);

    // --- Render loop ---
    function animate() {
        requestAnimationFrame(animate);
        var delta = Math.min(clock.getDelta(), 0.05);
        Blast.update(delta);
        renderer.render(scene, camera);
    }

    animate();
})();
