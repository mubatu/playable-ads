export function scheduleTutorial(state) {
    if (!state.config.tutorial.enabled) {
        state.tutorialActive = false;
        return;
    }

    setTimeout(() => {
        if (state.gameStarted || state.gameOver) return;

        state.tutorialActive = true;
        const joystick = state.ui.joystick;

        if (!joystick || !joystick.containerDiv) {
            return;
        }

        const joystickRect = joystick.containerDiv.getBoundingClientRect();
        const joystickX = joystickRect.left + joystickRect.width / 2;
        const joystickY = joystickRect.top + joystickRect.height / 2;

        state.tutorial = new window.HandTutorial({
            container: document.body,
            renderer: state.renderer,
            camera: state.camera,
            assetUrl: state.config.tutorial.assetUrl,
            gesture: 'drag',
            from: { space: 'pixels', x: joystickX - 50, y: joystickY - 50 },
            to: { space: 'pixels', x: joystickX + 50, y: joystickY + 50 },
            size: state.config.tutorial.size,
            duration: state.config.tutorial.duration,
            loopDelay: state.config.tutorial.loopDelay,
            loop: true
        }).play();
    }, state.config.tutorial.startDelayMs);
}

export function destroyTutorial(state) {
    if (state.tutorial) {
        state.tutorial.stop();
        state.tutorial.destroy();
        state.tutorial = null;
    }
    state.tutorialActive = false;
}

export function updateTutorial(state, now) {
    if (state.tutorial && state.tutorialActive) {
        state.tutorial.update(now);
    }

    // Stop tutorial after 3 seconds or on joystick movement
    if (state.tutorialActive && (state.gameTime > 3 ||
        Math.abs(state.joystickCommand.x) > 0.1 ||
        Math.abs(state.joystickCommand.y) > 0.1)) {
        destroyTutorial(state);
    }
}
