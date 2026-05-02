import * as THREE from 'three';

/**
 * Stylized box-based building meshes for grid-based RTS games.
 * Each `create(type, tileSize)` returns a Group with a 1-unit baseline
 * and footprint that fits within `BUILDING_SPECS[type].size` tiles.
 */
export const BUILDING_SPECS = {
    townhall:       { size: 3, hp: 420, hpBarY: 2.05, fillColor: 0x6c4a2c, accent: 0xb98855, isAttackable: true,  isWall: false, isCore: true  },
    cannon:         { size: 2, hp: 200, hpBarY: 1.18, fillColor: 0x6f6f6f, accent: 0x2c2c2c, isAttackable: true,  isWall: false, isCore: false },
    mortar:         { size: 2, hp: 180, hpBarY: 1.28, fillColor: 0x4a4a3a, accent: 0x6b5a3a, isAttackable: true,  isWall: false, isCore: false },
    goldStorage:    { size: 2, hp: 160, hpBarY: 1.38, fillColor: 0xc9a338, accent: 0xfff0a3, isAttackable: true,  isWall: false, isCore: false },
    elixirStorage:  { size: 2, hp: 160, hpBarY: 1.38, fillColor: 0x9d54c1, accent: 0xe2b8ff, isAttackable: true,  isWall: false, isCore: false },
    wall:           { size: 1, hp: 90,  hpBarY: 0.92, fillColor: 0xa9a294, accent: 0x6e6757, isAttackable: true,  isWall: true,  isCore: false }
};

function buildTownHall(tileSize) {
    const group = new THREE.Group();
    const baseSize = 3 * tileSize * 0.92;
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(baseSize, 0.55, baseSize),
        new THREE.MeshStandardMaterial({ color: 0x6c4a2c, roughness: 0.78 })
    );
    base.position.y = 0.275;
    group.add(base);

    const mid = new THREE.Mesh(
        new THREE.BoxGeometry(baseSize * 0.7, 0.6, baseSize * 0.7),
        new THREE.MeshStandardMaterial({ color: 0xb98855, roughness: 0.7 })
    );
    mid.position.y = 0.55 + 0.3;
    group.add(mid);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(baseSize * 0.45, 0.7, 6),
        new THREE.MeshStandardMaterial({ color: 0x9c2222, roughness: 0.6 })
    );
    roof.position.y = 0.55 + 0.6 + 0.35;
    roof.rotation.y = Math.PI / 6;
    group.add(roof);
    return group;
}

function buildCannon(tileSize) {
    const group = new THREE.Group();
    const baseSize = 2 * tileSize * 0.86;
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(baseSize, 0.36, baseSize),
        new THREE.MeshStandardMaterial({ color: 0x4d3a26, roughness: 0.85 })
    );
    base.position.y = 0.18;
    group.add(base);

    const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(baseSize * 0.42, baseSize * 0.42, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0x5b5b5b, roughness: 0.6 })
    );
    ring.position.y = 0.42;
    group.add(ring);

    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, baseSize * 0.85, 12),
        new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.55, metalness: 0.4 })
    );
    barrel.rotation.z = Math.PI * 0.5;
    barrel.position.y = 0.6;
    group.add(barrel);
    group.userData.barrel = barrel;
    return group;
}

function buildMortar(tileSize) {
    const group = new THREE.Group();
    const baseSize = 2 * tileSize * 0.86;
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(baseSize, 0.4, baseSize),
        new THREE.MeshStandardMaterial({ color: 0x3d3d32, roughness: 0.88 })
    );
    base.position.y = 0.2;
    group.add(base);

    const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(baseSize * 0.38, baseSize * 0.42, 0.14, 14),
        new THREE.MeshStandardMaterial({ color: 0x5c5040, roughness: 0.75 })
    );
    pad.position.y = 0.47;
    group.add(pad);

    const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.22, baseSize * 0.55, 10),
        new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.65, metalness: 0.35 })
    );
    tube.rotation.z = Math.PI * 0.5;
    tube.rotation.y = Math.PI * 0.08;
    tube.position.set(0, 0.72, 0);
    group.add(tube);
    group.userData.barrel = tube;

    return group;
}

function buildStorage(tileSize, fill, accent) {
    const group = new THREE.Group();
    const baseSize = 2 * tileSize * 0.84;
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(baseSize, 0.4, baseSize),
        new THREE.MeshStandardMaterial({ color: 0x4a3a26, roughness: 0.85 })
    );
    base.position.y = 0.2;
    group.add(base);

    const top = new THREE.Mesh(
        new THREE.BoxGeometry(baseSize * 0.85, 0.55, baseSize * 0.85),
        new THREE.MeshStandardMaterial({ color: fill, roughness: 0.6 })
    );
    top.position.y = 0.4 + 0.275;
    group.add(top);

    const cap = new THREE.Mesh(
        new THREE.BoxGeometry(baseSize * 0.4, 0.18, baseSize * 0.4),
        new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4, metalness: 0.5 })
    );
    cap.position.y = 0.4 + 0.55 + 0.09;
    group.add(cap);
    return group;
}

function buildWall(tileSize) {
    const group = new THREE.Group();
    const block = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize * 0.92, 0.7, tileSize * 0.92),
        new THREE.MeshStandardMaterial({ color: 0xa9a294, roughness: 0.85 })
    );
    block.position.y = 0.35;
    group.add(block);

    const cap = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize * 0.96, 0.12, tileSize * 0.96),
        new THREE.MeshStandardMaterial({ color: 0x6e6757, roughness: 0.85 })
    );
    cap.position.y = 0.76;
    group.add(cap);
    return group;
}

export class BuildingFactory {
    static spec(type) {
        return BUILDING_SPECS[type];
    }

    static create(type, tileSize = 1) {
        switch (type) {
            case 'townhall':       return buildTownHall(tileSize);
            case 'cannon':         return buildCannon(tileSize);
            case 'mortar':         return buildMortar(tileSize);
            case 'goldStorage':    return buildStorage(tileSize, 0xc9a338, 0xfff0a3);
            case 'elixirStorage':  return buildStorage(tileSize, 0x9d54c1, 0xe2b8ff);
            case 'wall':           return buildWall(tileSize);
            default:               throw new Error(`Unknown building type: ${type}`);
        }
    }
}
