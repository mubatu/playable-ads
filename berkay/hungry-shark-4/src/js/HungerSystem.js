export function updateHunger(state, delta) {
    var config = state.config.hunger;

    state.shark.hunger -= config.decayRate * delta;

    if (state.shark.hunger < 0) {
        state.shark.hunger = 0;
        state.shark.health -= config.damageWhenStarving * delta;
        if (state.shark.health < 0) {
            state.shark.health = 0;
        }
    }

    if (state.ui.hungerBar) {
        state.ui.hungerBar.setValue(state.shark.hunger);
    }
}
