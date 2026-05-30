export function addGoldRushCharge(state, amount) {
    if (state.goldRushActive) { return; }

    state.goldRushCharge += amount;
    if (state.goldRushCharge >= state.config.goldRush.threshold) {
        activateGoldRush(state);
    }
}

function activateGoldRush(state) {
    state.goldRushActive = true;
    state.goldRushTimer = state.config.goldRush.duration;
    state.goldRushCharge = 0;

    if (state.sharkGroup) {
        var mat = state.sharkGroup.userData.material;
        mat.color.set('#ffffff');
        mat.map = state.textures.sharkGold;
        mat.needsUpdate = true;
    }
}

export function updateGoldRush(state, delta) {
    if (!state.goldRushActive) { return; }

    state.goldRushTimer -= delta;
    if (state.goldRushTimer <= 0) {
        state.goldRushActive = false;
        state.goldRushTimer = 0;
        if (state.sharkGroup) {
            var mat = state.sharkGroup.userData.material;
            mat.color.set('#ffffff');
            mat.map = state.textures.shark;
            mat.needsUpdate = true;
        }
    }
}

export function getGoldRushDisplay(state) {
    if (state.goldRushActive) {
        return {
            active: true,
            value: state.goldRushTimer,
            max: state.config.goldRush.duration
        };
    }
    return {
        active: false,
        value: state.goldRushCharge,
        max: state.config.goldRush.threshold
    };
}
