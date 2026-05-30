import * as THREE from 'three';
import { createSmallFish, createMediumFish, createJellyfish, createMine, createHuman } from './EntityFactory.js';

export function updateSpawner(state, delta) {
    var config = state.config;
    var spawner = config.spawner;
    var shark = state.shark;

    var types = [
        { create: createSmallFish, density: spawner.smallFishDensity, count: 0 },
        { create: createMediumFish, density: spawner.mediumFishDensity, count: 0 },
        { create: createHuman, density: spawner.humanDensity, count: 0 },
        { create: createJellyfish, density: spawner.jellyDensity, count: 0 },
        { create: createMine, density: spawner.mineDensity, count: 0 }
    ];

    state.entities.forEach(function(e) {
        for (var i = 0; i < types.length; i++) {
            if (types[i].create.name.toLowerCase().includes(e.type.split('_')[0])) {
                types[i].count++;
                break;
            }
        }
    });

    types.forEach(function(type) {
        var targetCount = Math.floor(spawner.maxEntitiesPerType * type.density);
        if (type.count < targetCount && Math.random() < 0.15 * delta) {
            var angle = Math.random() * Math.PI * 2;
            var radius = spawner.spawnRadius;
            var x = shark.position.x + Math.cos(angle) * radius;
            var y = shark.position.y + Math.sin(angle) * radius;

            var worldWidth = config.world.width;
            var worldHeight = config.world.height;
            x = Math.max(-worldWidth * 0.5, Math.min(worldWidth * 0.5, x));
            y = Math.max(-worldHeight * 0.5, Math.min(worldHeight * 0.5, y));

            type.create(state, x, y);
        }
    });
}
