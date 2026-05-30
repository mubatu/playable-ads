export function addGoldRushProgress(state, amount) {
    if (state.isGoldRush) return;
    state.goldRushMeter += amount;
    if (state.goldRushMeter >= state.config.goldRush.threshold) {
        state.isGoldRush = true;
        state.goldRushTimer = state.config.goldRush.duration;
        state.goldRushMeter = state.config.goldRush.threshold;
        state.shakeTime = state.config.camera.shakeDuration;
    }
}

export function updateGoldRush(state, delta) {
    if (state.isGoldRush) {
        state.goldRushTimer -= delta;
        if (state.goldRushTimer <= 0) {
            state.isGoldRush = false;
            state.goldRushTimer = 0;
            state.goldRushMeter = 0;
        }
    } else if (state.goldRushMeter > 0) {
        state.goldRushMeter -= state.config.goldRush.decayRate * delta;
        if (state.goldRushMeter < 0) state.goldRushMeter = 0;
    }
}
