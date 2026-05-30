export function updateHunger(state, delta) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    state.hunger -= state.config.hunger.drainRate * delta;
    if (state.hunger < 0) {
        state.hunger = 0;
    }

    if (state.hunger <= 0) {
        state.health -= state.config.hunger.healthDrainRate * delta;
    }

    if (state.health <= 0) {
        state.health = 0;
        state.gameOver = true;
    }
}
