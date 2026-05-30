function clearTutorialDelay(state) {
    if (state.tutorialDelayId) {
        window.clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
}

export function scheduleTutorial(state) {
    var config = state.config.tutorial || {};

    clearTutorialDelay(state);

    if (!config.enabled || typeof window.HandTutorial === 'undefined') {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;

        if (state.gameStarted) {
            return;
        }

        state.tutorial = new window.HandTutorial({
            container: document.body,
            renderer: state.renderer,
            camera: state.camera,
            gesture: config.gesture,
            size: config.size,
            duration: config.duration,
            loop: true,
            loopDelay: config.loopDelay,
            showTrail: true,
            from: { space: 'screen', x: 0.26, y: 0.72 },
            to: { space: 'screen', x: 0.62, y: 0.48 }
        });

        state.tutorial.play();
    }, config.startDelayMs || 800);
}

export function stopTutorial(state) {
    clearTutorialDelay(state);

    if (state.tutorial) {
        state.tutorial.stop();
        state.tutorial.destroy();
        state.tutorial = null;
    }
}
