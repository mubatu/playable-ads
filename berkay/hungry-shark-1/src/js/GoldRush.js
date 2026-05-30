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
            removeGoldRushVisuals(state);
        }
    } else {
        state.goldRushMeter -= config.decayRate * delta;
        if (state.goldRushMeter < 0) {
            state.goldRushMeter = 0;
        }

        if (state.goldRushMeter >= config.threshold) {
            state.isGoldRush = true;
            state.goldRushTimer = config.duration;
            applyGoldRushVisuals(state);
        }
    }
}

function applyGoldRushVisuals(state) {
    if (state.sharkGroup) {
        state.sharkGroup.traverse(function (child) {
            if (child.material && child.material.color) {
                if (!child.userData._originalColor) {
                    child.userData._originalColor = child.material.color.getHex();
                }
                child.material.color.setHex(0xffd700);
            }
        });
    }
}

function removeGoldRushVisuals(state) {
    if (state.sharkGroup) {
        state.sharkGroup.traverse(function (child) {
            if (child.material && child.userData._originalColor !== undefined) {
                child.material.color.setHex(child.userData._originalColor);
                delete child.userData._originalColor;
            }
        });
    }
}
