(function (window) {
    'use strict';

    var ADAPTER_DEFAULTS = {
        poolWidthPadding: 0.1,
        dropCount: 100,
        dropRadiusMin: 0.25,
        dropRadiusMax: 0.25,
        dropVolume: 0.002,
        dropOpacity: 0.5,
        dropColor: 0x4274e1,
        initialPreSimMaxSeconds: 1.2,
        valveOffsetX: 0,
        valveOffsetY: 7.5,
        valveSpread: 0,
        valveVxMin: 3.5,
        valveVxMax: 3.5,
        valveVyMin: 1.0,
        valveVyMax: 3.5,
        gravity: 12,
        maxLevelRatio: 0.75,
        waveSegmentCount: 40,
        waveAmp1: 0.04,
        waveFreq1: 3.0,
        waveSpeed1: 2.5,
        waveAmp2: 0.025,
        waveFreq2: 5.0,
        waveSpeed2: 1.8,
        surfaceColor: 0x4274e1,
        surfaceOpacity: 0.7,
        surfaceZ: 0.05,
        surfaceSide: 'double'
    };

    function pick(value, fallback) {
        return typeof value === 'undefined' ? fallback : value;
    }

    function buildOptionsFromGameConfig(config) {
        var moduleOverrides = config.WATER_MODULE || {};

        return {
            layout: {
                cols: config.COLS,
                rows: config.ROWS,
                tileSize: config.TILE_SIZE,
                tileGap: config.TILE_GAP,
                bottomOffset: config.BOTTOM_OFFSET,
                poolWidthPadding: pick(moduleOverrides.poolWidthPadding, ADAPTER_DEFAULTS.poolWidthPadding)
            },
            drops: {
                count: pick(moduleOverrides.dropCount, pick(config.WATER_DROP_COUNT, ADAPTER_DEFAULTS.dropCount)),
                radiusMin: pick(moduleOverrides.dropRadiusMin, pick(config.WATER_DROP_RADIUS_MIN, ADAPTER_DEFAULTS.dropRadiusMin)),
                radiusMax: pick(moduleOverrides.dropRadiusMax, pick(config.WATER_DROP_RADIUS_MAX, ADAPTER_DEFAULTS.dropRadiusMax)),
                volume: pick(moduleOverrides.dropVolume, pick(config.WATER_DROP_VOLUME, ADAPTER_DEFAULTS.dropVolume)),
                opacity: pick(moduleOverrides.dropOpacity, pick(config.WATER_DROP_OPACITY, ADAPTER_DEFAULTS.dropOpacity)),
                color: pick(moduleOverrides.dropColor, pick(config.WATER_DROP_COLOR, ADAPTER_DEFAULTS.dropColor)),
                initialPreSimMaxSeconds: pick(moduleOverrides.initialPreSimMaxSeconds, ADAPTER_DEFAULTS.initialPreSimMaxSeconds)
            },
            valve: {
                offsetX: pick(moduleOverrides.valveOffsetX, pick(config.WATER_VALVE_OFFSET_X, ADAPTER_DEFAULTS.valveOffsetX)),
                offsetY: pick(moduleOverrides.valveOffsetY, pick(config.WATER_VALVE_OFFSET_Y, ADAPTER_DEFAULTS.valveOffsetY)),
                spread: pick(moduleOverrides.valveSpread, pick(config.WATER_VALVE_SPREAD, ADAPTER_DEFAULTS.valveSpread)),
                vxMin: pick(moduleOverrides.valveVxMin, pick(config.WATER_VALVE_VX_MIN, ADAPTER_DEFAULTS.valveVxMin)),
                vxMax: pick(moduleOverrides.valveVxMax, pick(config.WATER_VALVE_VX_MAX, ADAPTER_DEFAULTS.valveVxMax)),
                vyMin: pick(moduleOverrides.valveVyMin, pick(config.WATER_VALVE_VY_MIN, ADAPTER_DEFAULTS.valveVyMin)),
                vyMax: pick(moduleOverrides.valveVyMax, pick(config.WATER_VALVE_VY_MAX, ADAPTER_DEFAULTS.valveVyMax))
            },
            physics: {
                gravity: pick(moduleOverrides.gravity, pick(config.WATER_GRAVITY, ADAPTER_DEFAULTS.gravity)),
                maxLevelRatio: pick(moduleOverrides.maxLevelRatio, pick(config.WATER_MAX_LEVEL_RATIO, ADAPTER_DEFAULTS.maxLevelRatio))
            },
            waves: {
                segmentCount: pick(moduleOverrides.waveSegmentCount, ADAPTER_DEFAULTS.waveSegmentCount),
                amp1: pick(moduleOverrides.waveAmp1, pick(config.WATER_WAVE_AMP_1, ADAPTER_DEFAULTS.waveAmp1)),
                freq1: pick(moduleOverrides.waveFreq1, pick(config.WATER_WAVE_FREQ_1, ADAPTER_DEFAULTS.waveFreq1)),
                speed1: pick(moduleOverrides.waveSpeed1, pick(config.WATER_WAVE_SPEED_1, ADAPTER_DEFAULTS.waveSpeed1)),
                amp2: pick(moduleOverrides.waveAmp2, pick(config.WATER_WAVE_AMP_2, ADAPTER_DEFAULTS.waveAmp2)),
                freq2: pick(moduleOverrides.waveFreq2, pick(config.WATER_WAVE_FREQ_2, ADAPTER_DEFAULTS.waveFreq2)),
                speed2: pick(moduleOverrides.waveSpeed2, pick(config.WATER_WAVE_SPEED_2, ADAPTER_DEFAULTS.waveSpeed2))
            },
            surface: {
                color: pick(moduleOverrides.surfaceColor, pick(config.WATER_COLOR, ADAPTER_DEFAULTS.surfaceColor)),
                opacity: pick(moduleOverrides.surfaceOpacity, pick(config.WATER_OPACITY, ADAPTER_DEFAULTS.surfaceOpacity)),
                z: pick(moduleOverrides.surfaceZ, ADAPTER_DEFAULTS.surfaceZ),
                side: pick(moduleOverrides.surfaceSide, ADAPTER_DEFAULTS.surfaceSide)
            }
        };
    }

    function createController(config) {
        if (!window.GameWaterCore || typeof window.GameWaterCore.create !== 'function') {
            throw new Error('GameWaterCore is required before loading water-match3-adapter.js');
        }

        var options = buildOptionsFromGameConfig(config || {});
        return window.GameWaterCore.create(options);
    }

    var controller = createController(window.GameConfig || {});

    window.GameWater = {
        init: function (scene) { controller.init(scene); },
        update: function (deltaSeconds) { controller.update(deltaSeconds); },
        drainVolume: function (amount) { return controller.drainVolume(amount); },
        addVolume: function (amount) { return controller.addVolume(amount); },
        getLevel: function () { return controller.getLevel(); },
        reset: function () { controller.reset(); },
        dispose: function () { controller.dispose(); },
        getOptions: function () { return controller.getOptions(); }
    };

    window.GameWaterFactory = {
        createFromConfig: function (config) {
            return createController(config || window.GameConfig || {});
        }
    };
})(window);
