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

        WATER_DROP_COUNT: 100,
        WATER_DROP_RADIUS_MIN: 0.25,
        WATER_DROP_RADIUS_MAX: 0.25,
        WATER_DROP_COLOR: 0x4274e1,
        WATER_DROP_OPACITY: 0.5,

        WATER_VALVE_OFFSET_X: 0,
        WATER_VALVE_OFFSET_Y: 7.5,
        WATER_VALVE_SPREAD: 0,
        WATER_VALVE_VX_MIN: 3.5,
        WATER_VALVE_VX_MAX: 3.5,
        WATER_VALVE_VY_MIN: 1.0,
        WATER_VALVE_VY_MAX: 3.5,
        WATER_GRAVITY: 12,
        WATER_DROP_VOLUME: 0.002,
        WATER_CELL_VOLUME: 0.15,
        WATER_MAX_LEVEL_RATIO: 0.75,
        WATER_COLOR: 0x4274e1,
        WATER_OPACITY: 0.7,

        // Wave parameters: amplitude, frequency, speed
        WATER_WAVE_AMP_1: 0.04,
        WATER_WAVE_FREQ_1: 3.0,
        WATER_WAVE_SPEED_1: 2.5,
        WATER_WAVE_AMP_2: 0.025,
        WATER_WAVE_FREQ_2: 5.0,
        WATER_WAVE_SPEED_2: 1.8,

        WATER_ENTRY_COLS: [4, 5],
        WATER_CELL_COLOR: 0x4274e1,
        WATER_CELL_OPACITY: 0.7,
        WATER_FILL_DELAY_MS: 80,
    };
})(window);
