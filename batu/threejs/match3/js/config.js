(function (window) {
    'use strict';

    window.GameConfig = {
        ROWS: 6,
        COLS: 10,
        TILE_SIZE: 1,
        TILE_GAP: 0.04,
        BOARD_PADDING: 0.2,
        BOTTOM_OFFSET: 2.8,
        COLOR_TILE_SCALE: 0.9,
        SELECT_SCALE: 1.08,
        WHITE_THRESHOLD: 245,
        BACKGROUND_TEXTURE: 'assets/background.png',
        FIXED_TILE_TEXTURE: 'assets/fixed-tile.png',
        COLOR_TEXTURE_PATHS: [
            'assets/blue.png',
            'assets/green.png',
            'assets/red.png',
            'assets/yellow.png'
        ],
    };
})(window);
