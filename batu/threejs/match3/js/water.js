(function (window) {
    'use strict';

    var config = window.GameConfig;

    var boardWidth = config.COLS * (config.TILE_SIZE + config.TILE_GAP) - config.TILE_GAP;
    var boardHeight = config.ROWS * (config.TILE_SIZE + config.TILE_GAP) - config.TILE_GAP;

    // Top edge of the board — strict boundary, water stays above this line
    var boardTopY = boardHeight * 0.5 - config.BOTTOM_OFFSET;

    var maxWaterLevel = boardHeight * config.WATER_MAX_LEVEL_RATIO;

    // Valve position: top-left of the scene
    var valveX = -boardWidth * 0.5 + config.WATER_VALVE_OFFSET_X;
    var valveY = boardTopY + config.WATER_VALVE_OFFSET_Y;

    var scene = null;
    var drops = [];
    var waterSurface = null;
    var waterLevel = 0;
    var startTime = 0;

    var dropGeometry = new THREE.CircleGeometry(0.5, 16);
    var dropMaterial = new THREE.MeshBasicMaterial({
        color: config.WATER_DROP_COLOR,
        transparent: false,
        opacity: config.WATER_DROP_OPACITY
    });

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function emitDrop(drop) {
        drop.mesh.position.x = valveX + randomRange(-config.WATER_VALVE_SPREAD, config.WATER_VALVE_SPREAD);
        drop.mesh.position.y = valveY + randomRange(-config.WATER_VALVE_SPREAD, config.WATER_VALVE_SPREAD);
        drop.vx = randomRange(config.WATER_VALVE_VX_MIN, config.WATER_VALVE_VX_MAX);
        drop.vy = randomRange(config.WATER_VALVE_VY_MIN, config.WATER_VALVE_VY_MAX);

        var r = randomRange(config.WATER_DROP_RADIUS_MIN, config.WATER_DROP_RADIUS_MAX);
        drop.mesh.scale.set(r * 2, r * 2, 1);
    }

    function createDrop() {
        var mesh = new THREE.Mesh(dropGeometry, dropMaterial);
        mesh.position.z = 0.06;
        var drop = { mesh: mesh, vx: 0, vy: 0 };
        emitDrop(drop);
        return drop;
    }

    var SEG_W = 40;

    function buildWaterSurface() {
        var geometry = new THREE.PlaneGeometry(boardWidth + 0.1, 1, SEG_W, 1);

        var material = new THREE.MeshBasicMaterial({
            color: config.WATER_COLOR,
            transparent: true,
            opacity: config.WATER_OPACITY,
            side: THREE.DoubleSide
        });

        waterSurface = new THREE.Mesh(geometry, material);
        waterSurface.position.z = 0.05;
        waterSurface.position.y = boardTopY;

        scene.add(waterSurface);
    }

    function init(targetScene) {
        scene = targetScene;
        startTime = performance.now();
        waterLevel = 0;

        for (var i = 0; i < config.WATER_DROP_COUNT; i++) {
            var drop = createDrop();
            // Stagger initial drops along their arc so they don't all start at the valve
            var preSimTime = randomRange(0, 1.2);
            drop.mesh.position.x += drop.vx * preSimTime;
            drop.mesh.position.y += drop.vy * preSimTime - 0.5 * config.WATER_GRAVITY * preSimTime * preSimTime;
            drop.vy -= config.WATER_GRAVITY * preSimTime;
            drops.push(drop);
            scene.add(drop.mesh);
        }

        buildWaterSurface();
    }

    function update(deltaSeconds) {
        var now = performance.now();
        var elapsed = (now - startTime) / 1000;

        var waterTopY = boardTopY + waterLevel;

        for (var i = 0; i < drops.length; i++) {
            var drop = drops[i];
            drop.vy -= config.WATER_GRAVITY * deltaSeconds;
            drop.mesh.position.x += drop.vx * deltaSeconds;
            drop.mesh.position.y += drop.vy * deltaSeconds;

            var hitPool = drop.mesh.position.y < waterTopY &&
                          drop.mesh.position.x >= -boardWidth * 0.5 &&
                          drop.mesh.position.x <= boardWidth * 0.5;
            var offScreen = drop.mesh.position.y < waterTopY - 2 ||
                            drop.mesh.position.x > boardWidth * 0.5 + 2;

            if (hitPool) {
                if (waterLevel < maxWaterLevel) {
                    waterLevel += config.WATER_DROP_VOLUME;
                    if (waterLevel > maxWaterLevel) {
                        waterLevel = maxWaterLevel;
                    }
                }
                emitDrop(drop);
            } else if (offScreen) {
                emitDrop(drop);
            }
        }

        // Position the water body so its bottom edge is exactly at boardTopY.
        // We directly write vertex positions: bottom row (row 0) sits at boardTopY,
        // top row (row 1) sits at boardTopY + waterLevel with wave ripple.
        var positions = waterSurface.geometry.attributes.position;
        var cols = SEG_W + 1;

        for (var col = 0; col < cols; col++) {
            var baseX = (col / SEG_W - 0.5) * (boardWidth + 0.1);
            var waveOffset = Math.sin(baseX * config.WATER_WAVE_FREQ_1 + elapsed * config.WATER_WAVE_SPEED_1) * config.WATER_WAVE_AMP_1
                          + Math.sin(baseX * config.WATER_WAVE_FREQ_2 - elapsed * config.WATER_WAVE_SPEED_2) * config.WATER_WAVE_AMP_2;

            // Bottom row (index col): fixed at boardTopY — no waves, no dipping
            var bottomIdx = col;
            positions.setX(bottomIdx, baseX);
            positions.setY(bottomIdx, boardTopY);

            // Top row (index cols + col): boardTopY + waterLevel + wave
            var topIdx = cols + col;
            positions.setX(topIdx, baseX);
            positions.setY(topIdx, waterTopY + waveOffset);
        }

        positions.needsUpdate = true;
        waterSurface.geometry.computeBoundingSphere();

        // Reset any mesh-level transform so vertices are used directly as world coords
        waterSurface.position.set(0, 0, 0.05);
        waterSurface.scale.set(1, 1, 1);

        waterSurface.material.opacity = config.WATER_OPACITY;
    }

    function drainVolume(amount) {
        waterLevel -= amount;
        if (waterLevel < 0) {
            waterLevel = 0;
        }
    }

    window.GameWater = {
        init: init,
        update: update,
        drainVolume: drainVolume
    };
})(window);
