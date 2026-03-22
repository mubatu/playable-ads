(function (window) {
    'use strict';

    window.GameConfig = {
        ROWS: 7,
        COLS: 10,
        TILE_SIZE: 1,
        TILE_GAP: 0.04,
        BOARD_PADDING: 0.2,
        BOTTOM_OFFSET: 3.1,
        COLOR_TILE_SCALE: 0.9,
        SELECT_SCALE: 1.08,
        SWIPE_TRIGGER_PX: 18,
        SWAP_ANIMATION_MS: 180,
        WHITE_THRESHOLD: 245,
        BACKGROUND_TEXTURE: 'assets/background.png',
        FIXED_TILE_TEXTURE: 'assets/fixed-tile.png',
        COLOR_TEXTURE_PATHS: [
            'assets/blue.png',
            'assets/green.png',
            'assets/red.png',
            'assets/yellow.png'
        ],

        // Board-side water settings used directly by GameBoard.
        WATER_CELL_VOLUME: 0.15,
        WATER_COLOR: 0x4274e1,
        WATER_CELL_OPACITY: 0.7,

        WATER_ENTRY_COLS: [4, 5],
        WATER_FILL_DELAY_MS: 80,

        // Reusable visual-water module settings.
        WATER_MODULE: {
            dropCount: 110,
            dropRadiusMin: 0.25,
            dropRadiusMax: 0.25,
            dropColor: 0x4274e1,
            dropOpacity: 0.5,
            dropVolume: 0.002,
            valveOffsetX: 0,
            valveOffsetY: 7.2,
            valveSpread: 0,
            valveVxMin: 3.5,
            valveVxMax: 3.5,
            valveVyMin: 1.0,
            valveVyMax: 3.5,
            gravity: 12,
            maxLevelRatio: 0.75,
            waveSegmentCount: 40,
            waveAmp1: 0.05,
            waveFreq1: 3.0,
            waveSpeed1: 2.7,
            waveAmp2: 0.025,
            waveFreq2: 5.0,
            waveSpeed2: 1.8,
            surfaceColor: 0x4274e1,
            surfaceOpacity: 0.72
        },
    };
})(window);
