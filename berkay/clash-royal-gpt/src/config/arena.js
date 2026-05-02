/**
 * GDD-aligned arena: width 10 (X), depth 20 (Z). River Z ∈ [9,11], bridges at X ≈ 3 and 7.
 * Player deploys on Z ∈ [0, 9]; enemy AI deploys on Z ∈ [12, 20).
 */
export const MATCH = {
    durationSeconds: 180,
    elixirMax: 10,
    elixirInitial: 5,
    elixirPerSecond: 1,
    doubleElixirLastSeconds: 60,
    doubleElixirMultiplier: 2
};

export const ARENA = {
    sizeX: 10,
    sizeZ: 20,
    riverZMin: 9,
    riverZMax: 11,
    bridgeXs: [3, 7],
    bridgeHalfWidth: 0.75,
    bridgeDepth: 2.4,
    /** Player troop deploy band (GDD player side 0–9). */
    deployZMin: 0.35,
    deployZMax: 8.85,
    deployAbsXMin: 0.35,
    deployAbsXMax: 9.65,
    /** Spell can clip slightly outside troop deploy for splash plays. */
    spellAbsXMax: 9.85,
    spellZMin: 0.2,
    spellZMax: 19.8,
    groundColor: 0x57b85c,
    riverColor: 0x3589c9,
    bridgeColor: 0xd9c49a
};

/** King / princess at GDD (x, y) mapped to world (x, z). */
export const TOWER_LAYOUT = [
    { id: 'ek', team: 'enemy', kind: 'king', x: 5, z: 19, hp: 2400, radius: 0.55, height: 1.35, color: 0x5c6bc0 },
    { id: 'epL', team: 'enemy', kind: 'princess', x: 2, z: 17, hp: 1400, radius: 0.42, height: 1.05, color: 0x7e57c2 },
    { id: 'epR', team: 'enemy', kind: 'princess', x: 8, z: 17, hp: 1400, radius: 0.42, height: 1.05, color: 0x7e57c2 },
    { id: 'pk', team: 'player', kind: 'king', x: 5, z: 1, hp: 2400, radius: 0.55, height: 1.35, color: 0xc62828 },
    { id: 'ppL', team: 'player', kind: 'princess', x: 2, z: 3, hp: 1400, radius: 0.42, height: 1.05, color: 0xe53935 },
    { id: 'ppR', team: 'player', kind: 'princess', x: 8, z: 3, hp: 1400, radius: 0.42, height: 1.05, color: 0xe53935 }
];

export const HAND_CARDS = [
    {
        id: 'knight',
        type: 'troop',
        title: 'Knight',
        cost: 3,
        accentColor: 'rgba(121, 96, 80, 0.55)',
        speed: 2.6,
        hp: 520,
        dps: 72,
        range: 0.35,
        meshColor: 0x8d6e63,
        meshScale: 0.22
    },
    {
        id: 'archers',
        type: 'troop',
        title: 'Archers',
        cost: 3,
        accentColor: 'rgba(160, 120, 190, 0.5)',
        speed: 2.1,
        hp: 200,
        dps: 52,
        range: 3.2,
        meshColor: 0xab47bc,
        meshScale: 0.19,
        spawnCount: 2,
        spawnSpread: 0.28
    },
    {
        id: 'giant',
        type: 'troop',
        title: 'Giant',
        cost: 5,
        accentColor: 'rgba(100, 130, 190, 0.5)',
        speed: 1.7,
        hp: 2200,
        dps: 95,
        range: 0.35,
        meshColor: 0x5c6bc0,
        meshScale: 0.3
    },
    {
        id: 'fireball',
        type: 'spell',
        title: 'Fireball',
        cost: 4,
        accentColor: 'rgba(230, 90, 50, 0.55)',
        spellRadius: 1.35,
        spellDamage: 420,
        spellEnemyOnly: true
    }
];

/**
 * Camera on the player side (low Z) looking up the arena. Pulled back along -Z and lifted
 * slightly so both rows of towers (player ~z 1–3, enemy ~z 17–19) stay in frame.
 */
export const CAMERA = {
    fov: 42,
    position: [5, 17.8, -6.2],
    lookAt: [5, 0, 10]
};

/** Extra reach beyond `range` so melee can connect (half-width of boxy units ~). */
export const UNIT_VS_UNIT_REACH = 0.24;

export const PROJECTILE = {
    speed: 14,
    archerArc: 0.45,
    meleeArc: 0.1,
    kingBoltArc: 0.65,
    towerArc: 0.38
};

export const ENEMY_TOWER_COMBAT = {
    king: { range: 4.2, dps: 92, fireInterval: 1.0 },
    princess: { range: 3.6, dps: 72, fireInterval: 1.05 }
};

export const PLAYER_TOWER_COMBAT = {
    king: { range: 4.2, dps: 92, fireInterval: 1.0 },
    princess: { range: 3.6, dps: 72, fireInterval: 1.05 }
};

export const TOWER_HP_BAR = {
    scaleX: 1.15,
    scaleY: 0.22
};

/**
 * Enemy deploy limits + pacing so the match stays winnable.
 * Tune `maxCardCost` / `maxConcurrentUnits` / `maxDeploysPerMatch` without touching Scene logic.
 */
export const ENEMY_AI = {
    minThinkSeconds: 2.4,
    maxThinkSeconds: 5.2,
    troopIds: ['knight', 'archers', 'giant'],
    /** Enemy half only; keep below princess line so drops aren’t on top of the king. */
    spawnZMin: 12.1,
    spawnZMax: 16.85,
    spawnXMin: 1.15,
    spawnXMax: 8.85,
    /** Do not spawn if this many enemy troops are already alive. */
    maxConcurrentUnits: 5,
    /** Total AI deploy actions per match (one card play = one, including 2x Archers). */
    maxDeploysPerMatch: 14,
    /** AI ignores cards above this cost (4 = Knight/Archers/Fireball troop-only pool uses 3–4; set 5 to allow Giant). */
    maxCardCost: 4,
    /** When `maxCardCost` allows Giant, at most this many Giant plays. */
    giantDeploysMax: 1
};
