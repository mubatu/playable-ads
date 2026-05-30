export function scheduleTutorial(state) {
    if (!state.config.tutorial.enabled) {
        return;
    }

    if (state.tutorialDelayId) {
        clearTimeout(state.tutorialDelayId);
    }

    state.tutorialDelayId = setTimeout(function() {
        showTutorial(state);
    }, state.config.tutorial.startDelayMs);
}

export function showTutorial(state) {
    if (state.hasUserInteracted || state.tutorial) {
        return;
    }

    var config = state.config.tutorial;

    if (typeof window.HandTutorial === 'undefined') {
        return;
    }

    state.tutorial = new window.HandTutorial({
        container: document.body,
        renderer: state.renderer,
        camera: state.camera,
        assetUrl: config.assetUrl,
        gesture: 'drag',
        from: { space: 'screen', x: 0.25, y: 0.7 },
        to: { space: 'screen', x: 0.75, y: 0.7 },
        size: config.size,
        duration: config.duration,
        loop: true,
        loopDelay: config.loopDelay
    }).play();
}

export function dismissTutorial(state) {
    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }
    if (state.tutorialDelayId) {
        clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
}

export function updateTutorial(state, now) {
    if (state.tutorial) {
        state.tutorial.update(now);
    }
}
