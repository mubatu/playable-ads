(function (window) {
    'use strict';

    var config = window.GameConfig;
    var gameScene = window.GameScene;
    var gameGrid = window.GameGrid;

    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();

    var startTime = 0;
    var scrolling = false;
    var currentY = 0;
    var targetY = 0;
    var isResolving = false;

    // Character
    var characterMesh = null;
    var charTargetY = 0;
    var charCurrentY = 0;
    var charAnimating = false;
    var charAnimStart = 0;
    var charAnimFrom = 0;
    var gameWon = false;
    var gameFailed = false;

    var swipe = {
        active: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        originCell: null,
        triggered: false
    };

    // ---- Camera scroll ----

    function startScroll() {
        var scrollRange = gameScene.getScrollRange();
        currentY = -(scrollRange * 0.5);
        targetY = scrollRange * 0.5;
        gameScene.setCameraY(currentY);
        startTime = performance.now();
        scrolling = true;
    }

    // ---- Raycasting helpers ----

    function pickCell(clientX, clientY) {
        var rect = gameScene.renderer.domElement.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, gameScene.camera);
        var hits = raycaster.intersectObjects(gameGrid.meshes, false);
        if (hits.length === 0) return null;
        return gameGrid.getCellFromMesh(hits[0].object);
    }

    // ---- Swap animation ----

    function animateSwap(cellA, cellB, onDone) {
        var meshA = cellA.mesh;
        var meshB = cellB.mesh;
        var ax = meshA.position.x, ay = meshA.position.y;
        var bx = meshB.position.x, by = meshB.position.y;
        var duration = config.SWAP_DURATION_MS;
        var t0 = performance.now();

        function ease(t) { return t * t * (3 - 2 * t); }

        function step(now) {
            var p = Math.min((now - t0) / duration, 1);
            var e = ease(p);
            meshA.position.x = ax + (bx - ax) * e;
            meshA.position.y = ay + (by - ay) * e;
            meshB.position.x = bx + (ax - bx) * e;
            meshB.position.y = by + (ay - by) * e;
            if (p < 1) { requestAnimationFrame(step); return; }
            // Reset positions back and swap data instead
            meshA.position.x = ax; meshA.position.y = ay;
            meshB.position.x = bx; meshB.position.y = by;
            onDone();
        }
        requestAnimationFrame(step);
    }

    // ---- Blast animation ----

    function animateBlast(cellList, onDone) {
        var duration = config.BLAST_SCALE_DURATION_MS;
        var maxScale = config.BLAST_SCALE;
        var t0 = performance.now();

        function step(now) {
            var p = Math.min((now - t0) / duration, 1);
            var s = 1 + (maxScale - 1) * Math.sin(p * Math.PI);
            for (var i = 0; i < cellList.length; i++) {
                cellList[i].mesh.scale.set(s, s, 1);
            }
            if (p < 1) { requestAnimationFrame(step); return; }
            for (var j = 0; j < cellList.length; j++) {
                cellList[j].mesh.scale.set(1, 1, 1);
            }
            onDone();
        }
        requestAnimationFrame(step);
    }

    // ---- Character helpers ----

    function getCharacterY() {
        var bound = gameGrid.getLowerBound();
        return bound + config.CHARACTER_OFFSET_Y - config.CHARACTER_HEIGHT * 0.5;
    }

    function moveCharacterToBound() {
        var newY = getCharacterY();
        if (Math.abs(newY - charCurrentY) < 0.001) return;
        charAnimFrom = charCurrentY;
        charTargetY = newY;
        charAnimStart = performance.now();
        charAnimating = true;
    }

    function updateCharacter(now) {
        if (!charAnimating || !characterMesh) return;
        var p = Math.min((now - charAnimStart) / config.CHARACTER_MOVE_DURATION_MS, 1);
        var e = p * p * (3 - 2 * p);
        charCurrentY = charAnimFrom + (charTargetY - charAnimFrom) * e;
        characterMesh.position.y = charCurrentY;
        if (p >= 1) charAnimating = false;
    }

    // ---- Win screen ----

    function showWinScreen() {
        gameWon = true;

        // Build overlay DOM
        var overlay = document.createElement('div');
        overlay.id = 'win-overlay';

        var backdrop = document.createElement('div');
        backdrop.className = 'backdrop';
        overlay.appendChild(backdrop);

        var content = document.createElement('div');
        content.className = 'content';

        var title = document.createElement('div');
        title.className = 'title';
        title.textContent = config.WIN_TITLE;
        content.appendChild(title);

        var subtitle = document.createElement('div');
        subtitle.className = 'subtitle';
        subtitle.textContent = config.WIN_SUBTITLE;
        content.appendChild(subtitle);

        var cta = document.createElement('a');
        cta.className = 'cta-btn';
        cta.textContent = config.WIN_CTA_TEXT;
        cta.href = config.WIN_CTA_URL;
        cta.setAttribute('target', '_blank');
        cta.setAttribute('rel', 'noopener');
        content.appendChild(cta);

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Spawn confetti
        spawnConfetti();

        // Fade in
        requestAnimationFrame(function () {
            overlay.classList.add('visible');
            requestAnimationFrame(function () {
                overlay.classList.add('fade-in');
            });
        });
    }

    function spawnConfetti() {
        var colors = ['#FFD700', '#FF6B35', '#FF3D00', '#00E676', '#2979FF', '#E040FB', '#FF1744'];
        var count = config.WIN_CONFETTI_COUNT;

        for (var i = 0; i < count; i++) {
            var piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.left = (Math.random() * 100) + '%';
            piece.style.top = '-20px';
            piece.style.width = (6 + Math.random() * 8) + 'px';
            piece.style.height = (6 + Math.random() * 8) + 'px';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.opacity = (0.7 + Math.random() * 0.3).toString();
            document.body.appendChild(piece);
            animateConfetti(piece);
        }
    }

    function animateConfetti(el) {
        var x = parseFloat(el.style.left);
        var y = -20;
        var vy = 150 + Math.random() * 250;
        var vx = (Math.random() - 0.5) * 120;
        var rot = 0;
        var rotSpeed = (Math.random() - 0.5) * 720;
        var lastT = performance.now();
        var screenH = window.innerHeight;

        function step(now) {
            var dt = (now - lastT) / 1000;
            lastT = now;
            if (dt > 0.1) dt = 0.1;

            y += vy * dt;
            x += vx * dt / window.innerWidth * 100;
            rot += rotSpeed * dt;

            el.style.top = y + 'px';
            el.style.left = x + '%';
            el.style.transform = 'rotate(' + rot + 'deg)';

            if (y < screenH + 40) {
                requestAnimationFrame(step);
            } else {
                el.parentNode.removeChild(el);
            }
        }

        // Stagger start
        setTimeout(function () {
            requestAnimationFrame(step);
        }, Math.random() * 1500);
    }

    // ---- Fail screen ----

    function checkFail() {
        if (gameWon || gameFailed || !characterMesh) return;
        var camBottom = gameScene.camera.position.y + gameScene.camera.bottom;
        var charBottom = charCurrentY - config.CHARACTER_HEIGHT * 0.5;
        if (charBottom < camBottom) {
            showFailScreen();
        }
    }

    function showFailScreen() {
        gameFailed = true;

        var overlay = document.createElement('div');
        overlay.id = 'fail-overlay';

        var backdrop = document.createElement('div');
        backdrop.className = 'backdrop';
        overlay.appendChild(backdrop);

        var content = document.createElement('div');
        content.className = 'content';

        var title = document.createElement('div');
        title.className = 'title';
        title.textContent = config.FAIL_TITLE;
        content.appendChild(title);

        var subtitle = document.createElement('div');
        subtitle.className = 'subtitle';
        subtitle.textContent = config.FAIL_SUBTITLE;
        content.appendChild(subtitle);

        var cta = document.createElement('a');
        cta.className = 'cta-btn';
        cta.textContent = config.FAIL_CTA_TEXT;
        cta.href = config.FAIL_CTA_URL;
        cta.setAttribute('target', '_blank');
        cta.setAttribute('rel', 'noopener');
        content.appendChild(cta);

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        requestAnimationFrame(function () {
            overlay.classList.add('visible');
            requestAnimationFrame(function () {
                overlay.classList.add('fade-in');
            });
        });
    }

    // ---- Resolve swap ----

    function resolveSwap(cellA, cellB) {
        isResolving = true;

        animateSwap(cellA, cellB, function () {
            gameGrid.swapCells(cellA, cellB);

            var matched = gameGrid.findMatches();
            if (matched.length > 0) {
                animateBlast(matched, function () {
                    gameGrid.removeCells(matched);
                    moveCharacterToBound();
                    isResolving = false;

                    // Check win condition
                    if (gameGrid.isAllCleared()) {
                        setTimeout(function () {
                            showWinScreen();
                        }, config.WIN_DELAY_MS);
                    }
                });
            } else {
                // No match — swap back
                animateSwap(cellA, cellB, function () {
                    gameGrid.swapCells(cellA, cellB);
                    isResolving = false;
                });
            }
        });
    }

    // ---- Swipe direction ----

    function swipeDirection(dx, dy) {
        if (Math.abs(dx) >= Math.abs(dy)) {
            return { dr: 0, dc: dx > 0 ? 1 : -1 };
        }
        return { dr: dy > 0 ? -1 : 1, dc: 0 };
    }

    // ---- Pointer events ----

    function onPointerDown(e) {
        e.preventDefault();
        if (gameWon || gameFailed || isResolving || swipe.active) return;

        var cell = pickCell(e.clientX, e.clientY);
        if (!cell || !cell.color) return;

        swipe.active = true;
        swipe.pointerId = e.pointerId;
        swipe.startX = e.clientX;
        swipe.startY = e.clientY;
        swipe.originCell = cell;
        swipe.triggered = false;

        if (e.target && e.target.setPointerCapture) {
            e.target.setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e) {
        if (!swipe.active || swipe.pointerId !== e.pointerId) return;
        if (isResolving || swipe.triggered) return;

        var dx = e.clientX - swipe.startX;
        var dy = e.clientY - swipe.startY;

        if (Math.abs(dx) < config.SWIPE_THRESHOLD_PX &&
            Math.abs(dy) < config.SWIPE_THRESHOLD_PX) return;

        var dir = swipeDirection(dx, dy);
        var target = gameGrid.getCell(
            swipe.originCell.row + dir.dr,
            swipe.originCell.col + dir.dc
        );

        if (!target || !target.color) return;

        swipe.triggered = true;
        resolveSwap(swipe.originCell, target);
    }

    function onPointerEnd(e) {
        if (!swipe.active || swipe.pointerId !== e.pointerId) return;
        if (e.target && e.target.releasePointerCapture) {
            e.target.releasePointerCapture(e.pointerId);
        }
        swipe.active = false;
    }

    // ---- Resize ----

    function onResize() {
        gameScene.renderer.setSize(window.innerWidth, window.innerHeight);
        gameScene.updateCamera();
    }

    // ---- Animation loop ----

    var lastTime = performance.now();

    function animate() {
        requestAnimationFrame(animate);

        var now = performance.now();
        var delta = (now - lastTime) / 1000;
        lastTime = now;
        if (delta > 0.1) delta = 0.1;

        if (scrolling) {
            var elapsed = (now - startTime) / 1000;

            if (elapsed > config.SCROLL_DELAY) {
                currentY += config.SCROLL_SPEED * delta;

                if (currentY >= targetY) {
                    currentY = targetY;
                    scrolling = false;
                }

                gameScene.setCameraY(currentY);
            }
        }

        updateCharacter(now);
        checkFail();

        gameScene.renderer.render(gameScene.scene, gameScene.camera);
    }

    // ---- Init ----

    var canvas = gameScene.renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown, false);
    canvas.addEventListener('pointermove', onPointerMove, false);
    canvas.addEventListener('pointerup', onPointerEnd, false);
    canvas.addEventListener('pointercancel', onPointerEnd, false);
    window.addEventListener('resize', onResize);

    gameScene.initBackground(function () {
        gameGrid.init(gameScene.scene, function () {
            // Create character below the grid
            var charImg = new Image();
            charImg.crossOrigin = 'anonymous';
            charImg.onload = function () {
                var tex = new THREE.CanvasTexture(
                    (function (img) {
                        var cv = document.createElement('canvas');
                        cv.width = img.width; cv.height = img.height;
                        var cx = cv.getContext('2d');
                        cx.drawImage(img, 0, 0);
                        var d = cx.getImageData(0, 0, cv.width, cv.height);
                        var px = d.data;
                        for (var i = 0; i < px.length; i += 4) {
                            if (px[i] > 240 && px[i+1] > 240 && px[i+2] > 240) px[i+3] = 0;
                        }
                        cx.putImageData(d, 0, 0);
                        return cv;
                    })(charImg)
                );
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;

                var geo = new THREE.PlaneGeometry(config.CHARACTER_WIDTH, config.CHARACTER_HEIGHT);
                var mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5 });
                characterMesh = new THREE.Mesh(geo, mat);

                charCurrentY = getCharacterY();
                charTargetY = charCurrentY;
                characterMesh.position.set(0, charCurrentY, config.CHARACTER_Z);
                gameScene.scene.add(characterMesh);

                startScroll();
                animate();
            };
            charImg.src = config.CHARACTER_TEXTURE;
        });
    });
})(window);
