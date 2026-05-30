import { createCoin } from './EntityFactory.js';

var eatCooldown = 0;

export function updateCollisions(state, delta) {
    eatCooldown = Math.max(0, eatCooldown - delta);

    var config = state.config;
    var shark = state.shark;
    var sharkRadius = shark.size * 0.4;

    for (var i = state.entities.length - 1; i >= 0; i--) {
        var entity = state.entities[i];
        var dist = Math.hypot(entity.x - shark.position.x, entity.y - shark.position.y);

        if (dist < sharkRadius + entity.size * 0.3) {
            if (entity.type === 'small_fish' || entity.type === 'medium_fish' || entity.type === 'human') {
                if (eatCooldown <= 0) {
                    eatEntity(state, i, config);
                    eatCooldown = config.collisions.eatCooldown;
                }
            } else if (entity.type === 'jellyfish') {
                shark.health -= config.collisions.jellyDamage * delta;
                if (shark.health <= 0) {
                    shark.health = 0;
                }
            } else if (entity.type === 'mine') {
                var dmg = config.collisions.mineDamage;
                shark.health -= dmg;
                state.shakeTime = 0.2;
                removeEntity(state, i);
                continue;
            }
        }
    }

    for (var i = state.coins.length - 1; i >= 0; i--) {
        var coin = state.coins[i];
        var dist = Math.hypot(coin.x - shark.position.x, coin.y - shark.position.y);
        if (dist < sharkRadius + 0.15) {
            state.score += 1;
            if (state.ui.scoreDisplay) {
                state.ui.scoreDisplay.showPopup('+1');
            }
            removeCoin(state, i);
        }
    }
}

function eatEntity(state, index, config) {
    var entity = state.entities[index];
    var points = 0;
    var hungerRestore = 0;

    if (entity.type === 'small_fish') {
        points = config.scoring.smallFish;
        hungerRestore = config.hunger.smallFishRestore;
    } else if (entity.type === 'medium_fish') {
        points = config.scoring.mediumFish;
        hungerRestore = config.hunger.mediumFishRestore;
    } else if (entity.type === 'human') {
        points = config.scoring.human;
        hungerRestore = config.hunger.humanRestore;
    }

    var mult = state.goldRushActive ? config.scoring.goldRushMultiplier : 1;
    state.score += Math.floor(points * mult);

    state.shark.hunger = Math.min(state.shark.maxHunger, state.shark.hunger + hungerRestore);

    state.goldRushPrey.push({ time: state.clock.getElapsedTime() });
    state.goldRushPrey = state.goldRushPrey.filter(function(p) {
        return state.clock.getElapsedTime() - p.time < config.goldRush.timeWindow;
    });

    if (state.goldRushPrey.length >= config.goldRush.preyThreshold && !state.goldRushActive) {
        state.goldRushActive = true;
        state.goldRushTime = config.goldRush.duration;
    }

    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.showPopup('+' + Math.floor(points * mult));
    }

    for (var i = 0; i < 3; i++) {
        createCoin(state, entity.x + (Math.random() - 0.5) * 0.5, entity.y + (Math.random() - 0.5) * 0.5);
    }

    removeEntity(state, index);
}

export function removeEntity(state, index) {
    var entity = state.entities[index];
    if (entity.mesh && entity.mesh.parent) {
        entity.mesh.parent.remove(entity.mesh);
    }
    if (entity.mesh && entity.mesh.geometry) {
        entity.mesh.geometry.dispose();
    }
    if (entity.mesh && entity.mesh.material) {
        entity.mesh.material.dispose();
    }
    state.entities.splice(index, 1);
}

export function removeCoin(state, index) {
    var coin = state.coins[index];
    if (coin.mesh && coin.mesh.parent) {
        coin.mesh.parent.remove(coin.mesh);
    }
    if (coin.mesh && coin.mesh.geometry) {
        coin.mesh.geometry.dispose();
    }
    if (coin.mesh && coin.mesh.material) {
        coin.mesh.material.dispose();
    }
    state.coins.splice(index, 1);
}
