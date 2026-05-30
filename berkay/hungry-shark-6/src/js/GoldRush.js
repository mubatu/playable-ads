export function updateGoldRush(state, delta) {
    var config = state.config.goldRush;

    if (state.isGoldRush) {
        state.goldRushTimer -= delta;
        state.goldRushFlash = Math.sin(state.elapsedTime * 12) * 0.5 + 0.5;

        if (state.goldRushTimer <= 0) {
            deactivateGoldRush(state);
        }
    } else {
        if (!state.gameOver) {
            state.goldRushMeter -= config.decayRate * delta;
            if (state.goldRushMeter < 0) {
                state.goldRushMeter = 0;
            }
        }

        if (state.goldRushMeter >= config.threshold) {
            activateGoldRush(state);
        }
    }
}

function activateGoldRush(state) {
    state.isGoldRush = true;
    state.goldRushTimer = state.config.goldRush.duration;
    state.goldRushMeter = 0;
    applyGoldRushVisuals(state, true);
}

function deactivateGoldRush(state) {
    state.isGoldRush = false;
    state.goldRushMeter = 0;
    state.goldRushFlash = 0;
    applyGoldRushVisuals(state, false);
}

function applyGoldRushVisuals(state, active) {
    if (!state.sharkGroup) {
        return;
    }
    state.sharkGroup.traverse(function (obj) {
        if (obj.isMesh && obj.material) {
            if (active) {
                obj.userData._origColor = obj.material.color.getHex();
                obj.material.color.setHex(0xffd700);
            } else if (obj.userData._origColor !== undefined) {
                obj.material.color.setHex(obj.userData._origColor);
            }
        }
    });
}
