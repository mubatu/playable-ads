export function updateGoldRush(state, delta) {
    if (state.goldRushActive) {
        state.goldRushTime -= delta;

        if (state.goldRushTime <= 0) {
            state.goldRushActive = false;
            state.goldRushTime = 0;
            state.goldRushMeter = 0;
            if (state.scene.background) {
                state.scene.background.copy(state.scene.background);
            }
        }
    }

    state.goldRushMeter = Math.min(1, state.goldRushPrey.length / state.config.goldRush.preyThreshold);

    if (state.ui.goldRushBar) {
        state.ui.goldRushBar.setValue(state.goldRushMeter * state.ui.goldRushBar.config.max);
    }

    if (state.goldRushActive && state.shark.mesh) {
        state.shark.mesh.material.color.setHex(0xffd700);
    } else if (state.shark.mesh) {
        state.shark.mesh.material.color.setHex(0x4a90e2);
    }
}
