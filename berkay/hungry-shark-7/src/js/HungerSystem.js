export function updateHunger(state, delta) {
    if (!state.gameStarted || state.gameOver) { return; }

    var cfg = state.config.hunger;
    state.hunger = Math.max(0, state.hunger - cfg.drainRate * delta);

    if (state.hunger <= 0) {
        state.health = Math.max(0, state.health - cfg.healthDrainRate * delta);
        if (state.health <= 0) {
            state.gameOver = true;
        }
    }
}
