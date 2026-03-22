(function (window) {
    'use strict';

    function isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }

    function clamp(value, min, max) {
        if (value < min) { return min; }
        if (value > max) { return max; }
        return value;
    }

    function mergeObjects(base, overrides) {
        var out = {};
        var key;

        for (key in base) {
            if (Object.prototype.hasOwnProperty.call(base, key)) {
                if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
                    out[key] = mergeObjects(base[key], {});
                } else {
                    out[key] = base[key];
                }
            }
        }

        if (!overrides) {
            return out;
        }

        for (key in overrides) {
            if (!Object.prototype.hasOwnProperty.call(overrides, key)) {
                continue;
            }

            if (typeof overrides[key] === 'object' && overrides[key] !== null && !Array.isArray(overrides[key])) {
                if (typeof out[key] === 'object' && out[key] !== null && !Array.isArray(out[key])) {
                    out[key] = mergeObjects(out[key], overrides[key]);
                } else {
                    out[key] = mergeObjects({}, overrides[key]);
                }
            } else {
                out[key] = overrides[key];
            }
        }

        return out;
    }

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function createDefaultOptions() {
        return {
            layout: {
                cols: 10,
                rows: 7,
                tileSize: 1,
                tileGap: 0.04,
                bottomOffset: 3.1,
                boardWidth: null,
                boardHeight: null,
                boardTopY: null,
                poolWidthPadding: 0.1
            },
            drops: {
                count: 100,
                radiusMin: 0.25,
                radiusMax: 0.25,
                volume: 0.002,
                opacity: 0.5,
                color: 0x4274e1,
                geometrySegments: 16,
                initialPreSimMaxSeconds: 1.2,
                z: 0.06
            },
            valve: {
                offsetX: 0,
                offsetY: 7.5,
                spread: 0,
                vxMin: 3.5,
                vxMax: 3.5,
                vyMin: 1.0,
                vyMax: 3.5
            },
            physics: {
                gravity: 12,
                maxLevelRatio: 0.75
            },
            waves: {
                segmentCount: 40,
                amp1: 0.04,
                freq1: 3.0,
                speed1: 2.5,
                amp2: 0.025,
                freq2: 5.0,
                speed2: 1.8
            },
            surface: {
                color: 0x4274e1,
                opacity: 0.7,
                z: 0.05,
                side: 'double'
            }
        };
    }

    function computeLayout(options) {
        var layout = options.layout;

        var boardWidth = isNumber(layout.boardWidth)
            ? layout.boardWidth
            : layout.cols * (layout.tileSize + layout.tileGap) - layout.tileGap;

        var boardHeight = isNumber(layout.boardHeight)
            ? layout.boardHeight
            : layout.rows * (layout.tileSize + layout.tileGap) - layout.tileGap;

        var boardTopY = isNumber(layout.boardTopY)
            ? layout.boardTopY
            : boardHeight * 0.5 - layout.bottomOffset;

        return {
            boardWidth: boardWidth,
            boardHeight: boardHeight,
            boardTopY: boardTopY,
            poolWidth: boardWidth + layout.poolWidthPadding,
            maxWaterLevel: boardHeight * options.physics.maxLevelRatio,
            valveX: -boardWidth * 0.5 + options.valve.offsetX,
            valveY: boardTopY + options.valve.offsetY
        };
    }

    function createSurfaceMaterialOptions(surfaceConfig) {
        var side = THREE.DoubleSide;
        if (surfaceConfig.side === 'front') {
            side = THREE.FrontSide;
        } else if (surfaceConfig.side === 'back') {
            side = THREE.BackSide;
        }

        return {
            color: surfaceConfig.color,
            transparent: true,
            opacity: surfaceConfig.opacity,
            side: side
        };
    }

    function create(options) {
        var resolved = mergeObjects(createDefaultOptions(), options || {});
        var computed = computeLayout(resolved);

        var scene = null;
        var drops = [];
        var waterSurface = null;
        var waterLevel = 0;
        var startTime = 0;
        var initialized = false;

        var dropGeometry = new THREE.CircleGeometry(0.5, resolved.drops.geometrySegments);
        var dropMaterial = new THREE.MeshBasicMaterial({
            color: resolved.drops.color,
            transparent: false,
            opacity: resolved.drops.opacity
        });

        function emitDrop(drop) {
            drop.mesh.position.x = computed.valveX + randomRange(-resolved.valve.spread, resolved.valve.spread);
            drop.mesh.position.y = computed.valveY + randomRange(-resolved.valve.spread, resolved.valve.spread);
            drop.vx = randomRange(resolved.valve.vxMin, resolved.valve.vxMax);
            drop.vy = randomRange(resolved.valve.vyMin, resolved.valve.vyMax);

            var radius = randomRange(resolved.drops.radiusMin, resolved.drops.radiusMax);
            drop.mesh.scale.set(radius * 2, radius * 2, 1);
        }

        function createDrop() {
            var mesh = new THREE.Mesh(dropGeometry, dropMaterial);
            mesh.position.z = resolved.drops.z;
            var drop = { mesh: mesh, vx: 0, vy: 0 };
            emitDrop(drop);
            return drop;
        }

        function buildWaterSurface() {
            var geometry = new THREE.PlaneGeometry(
                computed.poolWidth,
                1,
                resolved.waves.segmentCount,
                1
            );

            var material = new THREE.MeshBasicMaterial(createSurfaceMaterialOptions(resolved.surface));

            waterSurface = new THREE.Mesh(geometry, material);
            waterSurface.position.z = resolved.surface.z;
            waterSurface.position.y = computed.boardTopY;

            scene.add(waterSurface);
        }

        function init(targetScene) {
            if (!targetScene) {
                return;
            }

            if (initialized) {
                dispose();
            }

            scene = targetScene;
            waterLevel = 0;
            startTime = performance.now();
            drops = [];

            for (var i = 0; i < resolved.drops.count; i += 1) {
                var drop = createDrop();
                var preSimTime = randomRange(0, resolved.drops.initialPreSimMaxSeconds);
                drop.mesh.position.x += drop.vx * preSimTime;
                drop.mesh.position.y += drop.vy * preSimTime - 0.5 * resolved.physics.gravity * preSimTime * preSimTime;
                drop.vy -= resolved.physics.gravity * preSimTime;
                drops.push(drop);
                scene.add(drop.mesh);
            }

            buildWaterSurface();
            initialized = true;
        }

        function update(deltaSeconds) {
            if (!initialized || !waterSurface) {
                return;
            }

            var now = performance.now();
            var elapsed = (now - startTime) / 1000;
            var waterTopY = computed.boardTopY + waterLevel;

            for (var i = 0; i < drops.length; i += 1) {
                var drop = drops[i];
                drop.vy -= resolved.physics.gravity * deltaSeconds;
                drop.mesh.position.x += drop.vx * deltaSeconds;
                drop.mesh.position.y += drop.vy * deltaSeconds;

                var hitPool = drop.mesh.position.y < waterTopY &&
                    drop.mesh.position.x >= -computed.boardWidth * 0.5 &&
                    drop.mesh.position.x <= computed.boardWidth * 0.5;

                var offScreen = drop.mesh.position.y < waterTopY - 2 ||
                    drop.mesh.position.x > computed.boardWidth * 0.5 + 2;

                if (hitPool) {
                    addVolume(resolved.drops.volume);
                    emitDrop(drop);
                } else if (offScreen) {
                    emitDrop(drop);
                }
            }

            var positions = waterSurface.geometry.attributes.position;
            var cols = resolved.waves.segmentCount + 1;

            for (var col = 0; col < cols; col += 1) {
                var baseX = (col / resolved.waves.segmentCount - 0.5) * computed.poolWidth;
                var waveOffset = Math.sin(baseX * resolved.waves.freq1 + elapsed * resolved.waves.speed1) * resolved.waves.amp1 +
                    Math.sin(baseX * resolved.waves.freq2 - elapsed * resolved.waves.speed2) * resolved.waves.amp2;

                var bottomIdx = col;
                positions.setX(bottomIdx, baseX);
                positions.setY(bottomIdx, computed.boardTopY);

                var topIdx = cols + col;
                positions.setX(topIdx, baseX);
                positions.setY(topIdx, waterTopY + waveOffset);
            }

            positions.needsUpdate = true;
            waterSurface.geometry.computeBoundingSphere();
            waterSurface.position.set(0, 0, resolved.surface.z);
            waterSurface.scale.set(1, 1, 1);
            waterSurface.material.opacity = resolved.surface.opacity;
        }

        function addVolume(amount) {
            if (!isNumber(amount) || amount <= 0) {
                return waterLevel;
            }
            waterLevel = clamp(waterLevel + amount, 0, computed.maxWaterLevel);
            return waterLevel;
        }

        function drainVolume(amount) {
            if (!isNumber(amount) || amount <= 0) {
                return waterLevel;
            }
            waterLevel = clamp(waterLevel - amount, 0, computed.maxWaterLevel);
            return waterLevel;
        }

        function getLevel() {
            return waterLevel;
        }

        function reset() {
            waterLevel = 0;
            startTime = performance.now();
            for (var i = 0; i < drops.length; i += 1) {
                emitDrop(drops[i]);
            }
        }

        function dispose() {
            var i;

            if (scene) {
                for (i = 0; i < drops.length; i += 1) {
                    scene.remove(drops[i].mesh);
                }
                if (waterSurface) {
                    scene.remove(waterSurface);
                }
            }

            if (waterSurface) {
                if (waterSurface.geometry) {
                    waterSurface.geometry.dispose();
                }
                if (waterSurface.material) {
                    waterSurface.material.dispose();
                }
            }

            drops = [];
            waterSurface = null;
            waterLevel = 0;
            initialized = false;
            scene = null;
        }

        return {
            init: init,
            update: update,
            addVolume: addVolume,
            drainVolume: drainVolume,
            getLevel: getLevel,
            reset: reset,
            dispose: dispose,
            getOptions: function () { return mergeObjects({}, resolved); }
        };
    }

    window.GameWaterCore = {
        create: create,
        defaults: createDefaultOptions
    };
})(window);
