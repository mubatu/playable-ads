import { createEntity, placeEntityRandom } from './EntityFactory.js';

var TYPES = ['smallFish', 'mediumFish', 'bigFish', 'coin', 'mine', 'jellyfish'];

export function spawnInitialEntities(state) {
    var i;
    for (var t = 0; t < TYPES.length; t += 1) {
        var type = TYPES[t];
        var count = state.config.entities[type].count;
        for (i = 0; i < count; i += 1) {
            var entity = createEntity(state, type);
            placeEntityRandom(state, entity, false);
            state.entities.push(entity);
        }
    }
}

// Re-place an eaten/dead entity at the edge so the ocean stays populated.
export function recycleEntity(state, entity) {
    placeEntityRandom(state, entity, true);
}
