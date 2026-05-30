export function updateGoldRush(state, delta) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    var config = state.config.goldRush;

    if (state.isGoldRush) {
        state.goldRushTimer -= delta;
        if (state.goldRushTimer <= 0) {
            state.isGoldRush = false;
            state.goldRushTimer = 0;
            state.goldRushMeter = 0;
            restoreOriginalColors(state);
        }
        return;
    }

    state.goldRushMeter = Math.max(0, state.goldRushMeter - config.decayRate * delta);
    if (state.goldRushMeter >= config.threshold) {
        state.isGoldRush = true;
        state.goldRushTimer = config.duration;
        tintWorldGold(state);
    }
}

function tintWorldGold(state) {
    state.worldGroup.traverse(function (child) {
        if (child.material && child.material.color) {
            if (child.userData.originalColor === undefined) {
                child.userData.originalColor = child.material.color.getHex();
            }
            child.material.color.setHex(0xffd45a);
        }
    });
}

function restoreOriginalColors(state) {
    state.worldGroup.traverse(function (child) {
        if (child.material && child.userData.originalColor !== undefined) {
            child.material.color.setHex(child.userData.originalColor);
            delete child.userData.originalColor;
        }
    });
}
