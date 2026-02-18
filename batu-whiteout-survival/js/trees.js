/**
 * trees.js — Procedural low-poly pine trees scattered on the terrain
 */

const Trees = (function () {
    'use strict';

    // ============================================================
    //  CONFIGURATION — change this number to set how many trees
    // ============================================================
    const TREE_COUNT = 100;
    // ============================================================

    const TRUNK_RADIUS = 0.25;
    const TRUNK_HEIGHT = 2.0;
    const CANOPY_LAYERS = 3;        // stacked cones
    const CANOPY_BASE_RADIUS = 2.0;
    const CANOPY_LAYER_HEIGHT = 2.0;
    const CANOPY_OVERLAP = 0.8;     // how much each cone overlaps the one below

    const TRUNK_COLOR = 0x5C3A1E;
    const CANOPY_COLOR = 0x2D5A27;

    // Shared geometries & materials (instanced by cloning mesh)
    const trunkGeo = new THREE.CylinderGeometry(
        TRUNK_RADIUS * 0.6, TRUNK_RADIUS, TRUNK_HEIGHT, 6
    );
    const trunkMat = new THREE.MeshLambertMaterial({ color: TRUNK_COLOR });

    const canopyGeos = [];
    for (let i = 0; i < CANOPY_LAYERS; i++) {
        const scale = 1 - i * 0.25;                    // each layer shrinks
        const r = CANOPY_BASE_RADIUS * scale;
        const h = CANOPY_LAYER_HEIGHT;
        canopyGeos.push(new THREE.ConeGeometry(r, h, 7));
    }
    const canopyMat = new THREE.MeshLambertMaterial({ color: CANOPY_COLOR });

    /**
     * Build one pine tree Group at origin
     */
    function createPineTree() {
        const group = new THREE.Group();

        // Trunk
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = TRUNK_HEIGHT / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);

        // Stacked canopy cones
        for (let i = 0; i < CANOPY_LAYERS; i++) {
            const cone = new THREE.Mesh(canopyGeos[i], canopyMat);
            const y = TRUNK_HEIGHT + i * (CANOPY_LAYER_HEIGHT - CANOPY_OVERLAP)
                      + CANOPY_LAYER_HEIGHT / 2;
            cone.position.y = y;
            cone.castShadow = true;
            cone.receiveShadow = true;
            group.add(cone);
        }

        return group;
    }

    // ---- Scatter trees randomly on terrain ----
    const SPREAD = Terrain.SIZE * 0.45;   // keep within ground bounds
    const MIN_DIST_FROM_CENTER = 4;       // keep the spawn area clear
    const treeGroup = new THREE.Group();

    for (let i = 0; i < TREE_COUNT; i++) {
        const tree = createPineTree();

        // Random position on XZ plane
        let x, z;
        do {
            x = (Math.random() - 0.5) * 2 * SPREAD;
            z = (Math.random() - 0.5) * 2 * SPREAD;
        } while (Math.sqrt(x * x + z * z) < MIN_DIST_FROM_CENTER);

        tree.position.set(x, 0, z);

        // Slight random Y rotation for variety
        tree.rotation.y = Math.random() * Math.PI * 2;

        treeGroup.add(tree);
    }

    GameScene.scene.add(treeGroup);

    return { treeGroup, TREE_COUNT };
})();
