import { syncEntityMesh } from './EntityFactory.js';

export function updateEntities(state, delta) {
    var world = state.config.world;
    var halfW = world.width * 0.5;
    var halfH = world.height * 0.5;
    var i;

    for (i = 0; i < state.entities.length; i += 1) {
        var e = state.entities[i];
        if (!e.alive) { continue; }

        if (e.swimmer) {
            e.x += e.vx * delta;
            // gentle vertical bob
            e.y += Math.sin(state.elapsedTime * 1.5 + e.phase) * 0.4 * delta;

            if (e.x > halfW - 0.5) {
                e.facing = -1;
                e.vx = -Math.abs(e.speed);
            } else if (e.x < -halfW + 0.5) {
                e.facing = 1;
                e.vx = Math.abs(e.speed);
            }
        } else if (e.type === 'jellyfish') {
            e.y += e.vy * delta;
            e.x += Math.sin(state.elapsedTime + e.phase) * 0.6 * delta;
            if (e.y > halfH - 0.5) { e.vy = -Math.abs(e.speed); }
            if (e.y < -halfH + 0.5) { e.vy = Math.abs(e.speed); }
        } else if (e.type === 'coin') {
            e.mesh.rotation.z += delta * 1.5;
        } else if (e.type === 'mine') {
            e.y += Math.sin(state.elapsedTime * 0.8 + e.phase) * 0.15 * delta;
        }

        syncEntityMesh(e);

        // gold rush tint
        if (state.goldRushActive && e.edible) {
            e.material.color.set(state.config.goldRush.tint);
        } else {
            e.material.color.set('#ffffff');
        }
    }
}
