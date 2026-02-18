/**
 * terrain.js — Flat dirt ground plane with subtle vertex-color variation
 */

const Terrain = (function () {
    'use strict';

    const SIZE = 100;          // world units
    const SEGMENTS = 40;       // subdivisions for vertex color variety

    const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    geometry.rotateX(-Math.PI / 2); // lay flat on XZ plane

    // ---- Vertex color variation for natural dirt look ----
    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);

    // Base dirt palette (RGB 0-1)
    const base = new THREE.Color(0x8B7355); // warm brown dirt

    for (let i = 0; i < count; i++) {
        // Random tint per vertex for a patchy, organic ground
        const variation = 0.85 + Math.random() * 0.3; // 0.85 – 1.15
        colors[i * 3]     = base.r * variation;
        colors[i * 3 + 1] = base.g * variation;
        colors[i * 3 + 2] = base.b * variation;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // ---- Material ----
    const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
    });

    // ---- Mesh ----
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    GameScene.scene.add(mesh);

    return { mesh, SIZE };
})();
