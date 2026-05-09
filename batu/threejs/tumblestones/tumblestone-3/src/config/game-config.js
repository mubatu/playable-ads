export const GAME_CONFIG = {
    background: {
        sourceWidth: 1080,
        sourceHeight: 1920,
        worldHeight: 19.2,
        imageUrl: 'src/assets/background.png',
        z: -5
    },
    board: {
        columns: 5,
        rows: 12,
        gap: 0.08,
        padding: 0.22,
        maxWidth: 6.9,
        maxHeight: 12.6,
        offsetY: -1.35,
        backgroundColor: '#25103f',
        cellColor: '#3a205e'
    },
    slots: {
        count: 3,
        offsetY: 5.85,
        spacing: 1.42,
        sizeScale: 1.05,
        emptyColor: '#1b0b2f',
        activeColor: '#4d2c78'
    },
    tiles: {
        baseZ: 0.24,
        collectedZ: 0.64,
        outlineZ: 0.3,
        bandSize: 3,
        bandOrder: ['red', 'green', 'yellow', 'purple'],
        colors: [
            { id: 'red', texture: 'src/assets/red.png', accent: '#ff6b6b' },
            { id: 'green', texture: 'src/assets/green.png', accent: '#45d483' },
            { id: 'yellow', texture: 'src/assets/yellow.png', accent: '#ffd66b' },
            { id: 'purple', texture: 'src/assets/purple.png', accent: '#b98cff' }
        ]
    },
    progression: {
        requiredMatches: 5,
        matchSize: 3
    },
    animation: {
        collectDuration: 0.22,
        clearDuration: 0.24,
        failShakeSeconds: 0.3
    },
    tutorial: {
        enabled: true,
        assetUrl: 'src/assets/hand-2.png',
        gesture: 'tap',
        size: 122,
        duration: 1.0,
        loopDelay: 0.45,
        startDelayMs: 900
    }
};
