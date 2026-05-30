import { dismissTutorial } from './Tutorial.js';

export function bindInteractions(state) {
    var boostButton = state.ui.boostButton;
    var joystick = state.ui.joystick;

    function startBoost(event) {
        if (event) { event.preventDefault(); }
        if (!state.gameStarted || state.gameOver) { return; }
        state.boosting = true;
        markInteracted(state);
    }

    function endBoost() {
        state.boosting = false;
    }

    if (boostButton && boostButton.element) {
        boostButton.element.addEventListener('pointerdown', startBoost);
        boostButton.element.addEventListener('pointerup', endBoost);
        boostButton.element.addEventListener('pointerleave', endBoost);
        boostButton.element.addEventListener('pointercancel', endBoost);
    }

    if (joystick && joystick.element) {
        joystick.element.addEventListener('pointerdown', function () {
            markInteracted(state);
        });
    }
}

function markInteracted(state) {
    if (!state.hasUserInteracted) {
        state.hasUserInteracted = true;
        dismissTutorial(state);
    }
}

export function readInput(state) {
    if (state.joystickCommand) {
        state.move.x = state.joystickCommand.x;
        state.move.y = state.joystickCommand.y;
    }
}
