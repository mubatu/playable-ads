export function updateHunger(state, delta) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    var config = state.config;
    var rate = state.isGoldRush ? config.hunger.drainRate * 0.5 : config.hunger.drainRate;
    state.hunger = Math.max(0, state.hunger - rate * delta);

    if (state.hunger <= 0) {
        state.health = Math.max(0, state.health - config.hunger.healthDrainRate * delta);
    }

    if (state.health <= 0) {
        state.gameOver = true;
    }
}
