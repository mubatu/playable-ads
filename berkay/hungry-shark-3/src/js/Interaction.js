import { stopTutorial } from './Tutorial.js';

export function bindInteractions(state) {
    var canvas = state.renderer.domElement;

    canvas.addEventListener('pointerdown', function () {
        startGame(state);
    });

    if (state.ui.joystick && state.ui.joystick.element) {
        state.ui.joystick.element.addEventListener('pointerdown', function () {
            startGame(state);
        });
    }

    bindBoostButton(state);
}

function bindBoostButton(state) {
    if (!state.ui.boostButton || !state.ui.boostButton.element) {
        return;
    }

    var button = state.ui.boostButton.element;

    button.addEventListener('pointerdown', function (event) {
        event.stopPropagation();
        startGame(state);
        if (state.boostEnergy > 4) {
            state.isBoosting = true;
        }
    });

    window.addEventListener('pointerup', function () {
        state.isBoosting = false;
    });
    window.addEventListener('pointercancel', function () {
        state.isBoosting = false;
    });
}

function startGame(state) {
    if (!state.gameStarted) {
        state.gameStarted = true;
        stopTutorial(state);
    }
}
