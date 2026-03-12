(function (window) {
    'use strict';

    window.GameConfig = {
        // Background image dimensions
        BG_WIDTH: 1080,
        BG_HEIGHT: 3840,
        BG_TEXTURE: 'assets/background.png',

        // Camera scroll settings
        SCROLL_SPEED: 0.1,           // World units per second
        SCROLL_DELAY: 1,           // Seconds to wait before scrolling starts
        SCROLL_EASE: 0.02,           // Smoothing factor (0-1, lower = smoother)

        // Renderer
        MAX_PIXEL_RATIO: 2,

        // Grid layout (parsed from grid.txt)
        GRID_DATA: [
            'BBRBB',
            'RRBRR',
            'GGBGG',
            'BBGBB',
            'RRGRR',
            'GGRGG',
            'BBRBB',
            'RRBRR',
            'GGBGG',
            'BBGBB'
        ],

        // Grid positioning & sizing
        GRID_TILE_SIZE: 0.25,         // World units per tile side
        GRID_GAP: 0.05,             // Space between tiles in world units
        GRID_OFFSET_X: 0,           // Horizontal offset from center
        GRID_OFFSET_Y: 0,           // Vertical offset from center (0 = middle of background)
        GRID_Z: 0.01,               // Z depth (in front of background)

        // Color tile textures (mapped to letters in GRID_DATA)
        COLOR_MAP: {
            'R': 'assets/red.png',
            'G': 'assets/green.png',
            'B': 'assets/blue.png',
            'Y': 'assets/yellow.png'
        },

        // Swap & match settings
        SWIPE_THRESHOLD_PX: 20,      // Min drag distance in pixels to trigger swap
        SWAP_DURATION_MS: 180,       // Swap animation duration in milliseconds
        BLAST_MATCH_COUNT: 5,        // Consecutive same-color tiles needed to blast
        BLAST_SCALE_DURATION_MS: 200,// Scale-up animation before removal
        BLAST_SCALE: 1.3,            // Max scale during blast animation
        FALL_DURATION_MS: 250,       // Duration for tiles falling after blast

        // Character settings
        CHARACTER_TEXTURE: 'assets/character.png',
        CHARACTER_WIDTH: 0.40,       // Character width in world units
        CHARACTER_HEIGHT: 0.55,      // Character height in world units
        CHARACTER_OFFSET_Y: -0.05,   // Gap between grid bottom and character top
        CHARACTER_MOVE_DURATION_MS: 300, // Duration of character move animation
        CHARACTER_Z: 0.02,            // Z depth (in front of grid)

        // Win screen settings
        WIN_DELAY_MS: 600,            // Delay after last blast before showing win screen
        WIN_TITLE: 'You Win!',
        WIN_SUBTITLE: 'All tiles cleared!',
        WIN_CTA_TEXT: 'Play Now',
        WIN_CTA_URL: '#',
        WIN_FADE_DURATION_MS: 500,    // Overlay fade-in duration
        WIN_CONFETTI_COUNT: 80,       // Number of confetti pieces

        // Fail screen settings
        FAIL_TITLE: 'Game Over',
        FAIL_SUBTITLE: 'The character fell off!',
        FAIL_CTA_TEXT: 'Try Again',
        FAIL_CTA_URL: '#',
        FAIL_FADE_DURATION_MS: 500
    };
})(window);
