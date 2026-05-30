export function updateHunger(state, delta) {
    if (!state.gameStarted || state.gameOver) return;
    var h = state.config.hunger;
    state.hunger -= h.drainRate * delta;
    if (state.hunger < 0) {
        state.hunger = 0;
        state.health -= h.healthDrainRate * delta;
    }
    if (state.hunger > h.max) state.hunger = h.max;
    if (state.health <= 0) {
        state.health = 0;
        state.gameOver = true;
    }
}
