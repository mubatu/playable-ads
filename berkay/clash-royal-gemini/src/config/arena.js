/**
 * Tunable parameters — adjust here to rebalance the playable without touching game logic.
 */
export const MATCH = {
    durationSeconds: 90,
    elixirMax: 10,
    elixirInitial: 5,
    /** Elixir per second at normal rate (GDD: ~1 per 2.8s). */
    elixirPerSecond: 1 / 2.8,
    doubleElixirLastSeconds: 60,
    doubleElixirMultiplier: 2
};

export const ARENA = {
    sizeX: 18,
    sizeZ: 30,
    riverHalfWidth: 1.15,
    bridgePositionsX: [-5, 5],
    bridgeHalfWidth: 1.35,
    /** Player deployable half-space (positive Z is player side per GDD). */
    deployZMin: 0.85,
    deployZMax: 14.5,
    deployAbsXMax: 8.2,
    groundColor: 0x4a8f4a,
    riverColor: 0x3a8ec8,
    bridgeColor: 0xc9b48a
};

/** King / princess placements from GDD (XZ plane, Y up). */
export const TOWER_LAYOUT = [
    { id: 'ek', team: 'enemy', kind: 'king', x: 0, z: -13, hp: 2400, radius: 1.15, height: 2.4, color: 0x5c6bc0 },
    { id: 'epL', team: 'enemy', kind: 'princess', x: -6, z: -9, hp: 1400, radius: 0.85, height: 1.7, color: 0x7e57c2 },
    { id: 'epR', team: 'enemy', kind: 'princess', x: 6, z: -9, hp: 1400, radius: 0.85, height: 1.7, color: 0x7e57c2 },
    { id: 'pk', team: 'player', kind: 'king', x: 0, z: 13, hp: 2400, radius: 1.15, height: 2.4, color: 0xc62828 },
    { id: 'ppL', team: 'player', kind: 'princess', x: -6, z: 9, hp: 1400, radius: 0.85, height: 1.7, color: 0xe53935 },
    { id: 'ppR', team: 'player', kind: 'princess', x: 6, z: 9, hp: 1400, radius: 0.85, height: 1.7, color: 0xe53935 }
];

/**
 * Four-card hand shown in UI. `type`: troop | spell
 */
export const HAND_CARDS = [
    {
        id: 'knight',
        type: 'troop',
        title: 'Knight',
        cost: 3,
        accentColor: 'rgba(121, 96, 80, 0.55)',
        speed: 5.2,
        hp: 520,
        dps: 72,
        range: 0.55,
        meshColor: 0x8d6e63,
        meshScale: 0.42
    },
    {
        id: 'archers',
        type: 'troop',
        title: 'Archers',
        cost: 3,
        accentColor: 'rgba(160, 120, 190, 0.5)',
        speed: 4.2,
        hp: 200,
        dps: 52,
        range: 5.2,
        meshColor: 0xab47bc,
        meshScale: 0.36,
        spawnCount: 2,
        spawnSpread: 0.42
    },
    {
        id: 'giant',
        type: 'troop',
        title: 'Giant',
        cost: 5,
        accentColor: 'rgba(100, 130, 190, 0.5)',
        speed: 3.4,
        hp: 2200,
        dps: 95,
        range: 0.55,
        meshColor: 0x5c6bc0,
        meshScale: 0.58
    },
    {
        id: 'fireball',
        type: 'spell',
        title: 'Fireball',
        cost: 4,
        accentColor: 'rgba(230, 90, 50, 0.55)',
        spellRadius: 2.3,
        spellDamage: 420,
        spellEnemyOnly: true
    }
];

export const CAMERA = {
    /** Wider FOV + higher eye so full arena (±15 Z, river, bridges) fits on typical viewports. */
    fov: 34,
    position: [0, 38, 30],
    lookAt: [0, 0, -0.5]
};

/** Direct / arcing shots (CoC-style: pool mesh + lerp + arc in scene). */
export const PROJECTILE = {
    speed: 22,
    archerArc: 0.55,
    meleeArc: 0.12,
    kingBoltArc: 0.85,
    towerArc: 0.5
};

/** Enemy king + princess towers shoot nearest player troop in range. */
export const ENEMY_TOWER_COMBAT = {
    king: { range: 8.5, dps: 98, fireInterval: 0.82 },
    princess: { range: 7.5, dps: 76, fireInterval: 0.88 }
};

/** World-space size for tower HP labels above cylinders. */
export const TOWER_HP_BAR = {
    scaleX: 2.35,
    scaleY: 0.42
};
