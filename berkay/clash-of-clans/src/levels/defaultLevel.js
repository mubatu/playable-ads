/**
 * 12x12 base layout. Buildings are anchored at top-left corner (c, r);
 * footprint = BUILDING_SPECS[type].size.
 *
 * Combat tunables are absolute values (no overrides per level needed for MVP).
 */
export const DEFAULT_LEVEL = {
    cols: 12,
    rows: 12,
    tileSize: 1,
    durationSeconds: 75,
    barbarianStock: 14,
    cannon: {
        range: 4.0,
        damage: 45,
        fireInterval: 0.85,
        projectileSpeed: 8.0
    },
    mortar: {
        range: 5.5,
        damage: 26,
        blastRadius: 1.45,
        fireInterval: 1.45,
        projectileSpeed: 5.0
    },
    buildings: [
        { type: 'cannon',        c: 1, r: 1 },
        { type: 'mortar',        c: 9, r: 1 },
        { type: 'mortar',        c: 5, r: 1 },
        { type: 'cannon',        c: 1, r: 9 },
        { type: 'cannon',        c: 9, r: 9 },
        { type: 'townhall',      c: 4, r: 4 },
        { type: 'goldStorage',   c: 7, r: 5 },
        { type: 'elixirStorage', c: 2, r: 7 }
    ],
    walls: [
        { c: 3, r: 3 }, { c: 4, r: 3 }, { c: 6, r: 3 }, { c: 7, r: 3 },
        { c: 3, r: 4 }, { c: 3, r: 5 },
        { c: 9, r: 4 }, { c: 9, r: 5 }, { c: 9, r: 6 },
        { c: 4, r: 7 }, { c: 5, r: 7 }, { c: 6, r: 7 }, { c: 7, r: 7 }
    ]
};
