/**
 * trees.js — Procedural low-poly pine trees scattered on the terrain
 * Each tree can be cut, leaving only a stump.
 */

const Trees = (function () {
    'use strict';

    // ============================================================
    //  CONFIGURATION — change this number to set how many trees
    // ============================================================
    const TREE_COUNT = 200;
    // ============================================================

    const TRUNK_RADIUS = 0.25;
    const TRUNK_HEIGHT = 2.0;
    const STUMP_HEIGHT = 0.4;       // visible stump after cutting
    const CANOPY_LAYERS = 3;        // stacked cones
    const CANOPY_BASE_RADIUS = 2.0;
    const CANOPY_LAYER_HEIGHT = 2.0;
    const CANOPY_OVERLAP = 0.8;     // how much each cone overlaps the one below
    const CUT_RANGE = 1.5;          // how close the character must be to cut

    const TRUNK_COLOR = 0x5C3A1E;
    const CANOPY_COLOR = 0x2D5A27;
    const STUMP_TOP_COLOR = 0xC4A36E; // lighter wood for the cut surface

    // Shared geometries & materials
    const trunkGeo = new THREE.CylinderGeometry(
        TRUNK_RADIUS * 0.6, TRUNK_RADIUS, TRUNK_HEIGHT, 6
    );
    const trunkMat = new THREE.MeshLambertMaterial({ color: TRUNK_COLOR });

    const stumpGeo = new THREE.CylinderGeometry(
        TRUNK_RADIUS, TRUNK_RADIUS * 1.1, STUMP_HEIGHT, 6
    );
    const stumpMat = new THREE.MeshLambertMaterial({ color: TRUNK_COLOR });

    // Small disc on top of stump to show cut wood
    const stumpTopGeo = new THREE.CircleGeometry(TRUNK_RADIUS, 6);
    stumpTopGeo.rotateX(-Math.PI / 2);
    const stumpTopMat = new THREE.MeshLambertMaterial({ color: STUMP_TOP_COLOR });

    const canopyGeos = [];
    for (let i = 0; i < CANOPY_LAYERS; i++) {
        const scale = 1 - i * 0.25;
        const r = CANOPY_BASE_RADIUS * scale;
        const h = CANOPY_LAYER_HEIGHT;
        canopyGeos.push(new THREE.ConeGeometry(r, h, 7));
    }
    const canopyMat = new THREE.MeshLambertMaterial({ color: CANOPY_COLOR });

    // ---- Tree data array (for cut detection) ----
    const trees = [];  // { group, upper, stump, cut, fallVel, fallAngle }

    /**
     * Build one pine tree Group at origin.
     * Returns { group, upper, stump }
     */
    function createPineTree() {
        const group = new THREE.Group();

        // --- Stump (always visible) ---
        const stump = new THREE.Mesh(stumpGeo, stumpMat);
        stump.position.y = STUMP_HEIGHT / 2;
        stump.castShadow = true;
        stump.receiveShadow = true;
        group.add(stump);

        // Cut-surface disc (hidden until cut)
        const stumpTop = new THREE.Mesh(stumpTopGeo, stumpTopMat);
        stumpTop.position.y = STUMP_HEIGHT + 0.01;
        stumpTop.visible = false;
        group.add(stumpTop);

        // --- Upper part (trunk above stump + canopy) — removed on cut ---
        const upper = new THREE.Group();

        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = STUMP_HEIGHT + TRUNK_HEIGHT / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        upper.add(trunk);

        for (let i = 0; i < CANOPY_LAYERS; i++) {
            const cone = new THREE.Mesh(canopyGeos[i], canopyMat);
            const y = STUMP_HEIGHT + TRUNK_HEIGHT
                      + i * (CANOPY_LAYER_HEIGHT - CANOPY_OVERLAP)
                      + CANOPY_LAYER_HEIGHT / 2;
            cone.position.y = y;
            cone.castShadow = true;
            cone.receiveShadow = true;
            upper.add(cone);
        }

        group.add(upper);

        return { group, upper, stumpTop };
    }

    // ---- Scatter trees randomly on terrain ----
    const SPREAD = Terrain.SIZE * 0.45;
    const MIN_DIST_FROM_CENTER = 4;
    const treeGroup = new THREE.Group();

    for (let i = 0; i < TREE_COUNT; i++) {
        const treeData = createPineTree();

        let x, z;
        do {
            x = (Math.random() - 0.5) * 2 * SPREAD;
            z = (Math.random() - 0.5) * 2 * SPREAD;
        } while (Math.sqrt(x * x + z * z) < MIN_DIST_FROM_CENTER);

        treeData.group.position.set(x, 0, z);
        treeData.group.rotation.y = Math.random() * Math.PI * 2;

        treeGroup.add(treeData.group);

        trees.push({
            group: treeData.group,
            upper: treeData.upper,
            stumpTop: treeData.stumpTop,
            cut: false,
            // Fall animation state
            falling: false,
            fallAngle: 0,
            fallDir: 0,       // Y rotation for fall direction
        });
    }

    GameScene.scene.add(treeGroup);

    // ---- Public API ----

    /**
     * Check if character is near any uncut tree & trigger cut.
     * Called each frame from game loop.
     * @param {THREE.Vector3} charPos  — character world position
     * @returns {object|null} tree data if a cut was just triggered
     */
    function checkCut(charPos) {
        for (let i = 0; i < trees.length; i++) {
            const t = trees[i];
            if (t.cut) continue;

            const dx = charPos.x - t.group.position.x;
            const dz = charPos.z - t.group.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < CUT_RANGE) {
                t.cut = true;
                t.falling = true;
                // Fall away from the character
                t.fallDir = Math.atan2(dx, dz);
                t.stumpTop.visible = true;
                // Set pivot for falling at the stump top
                t.upper.position.y = STUMP_HEIGHT;
                t.upper.children.forEach(c => { c.position.y -= STUMP_HEIGHT; });
                return t;
            }
        }
        return null;
    }

    /**
     * Animate falling trees. Called each frame.
     * @param {number} delta
     */
    function update(delta) {
        const FALL_SPEED = 3.0; // radians per second
        for (let i = 0; i < trees.length; i++) {
            const t = trees[i];
            if (!t.falling) continue;

            t.fallAngle += FALL_SPEED * delta;

            // Rotate upper part around the stump base
            // We rotate around X axis in the tree's local space
            // but orient the fall direction via a wrapper rotation
            const upperParent = t.upper;
            upperParent.rotation.set(0, 0, 0);
            // Apply fall direction then tilt
            upperParent.rotation.y = t.fallDir;
            upperParent.rotation.x = -t.fallAngle;

            if (t.fallAngle >= Math.PI / 2) {
                // Done falling — freeze it
                t.falling = false;
                t.fallAngle = Math.PI / 2;
                upperParent.rotation.x = -Math.PI / 2;

                // Fade out the fallen part after a short moment
                setTimeout(() => {
                    upperParent.visible = false;
                }, 600);
            }
        }
    }

    return { treeGroup, trees, TREE_COUNT, checkCut, update };
})();
