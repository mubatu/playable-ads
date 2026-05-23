export function scheduleTutorial(state) {
    var tutCfg = state.config.tutorial;

    if (!tutCfg.enabled || state.hasUserInteracted) return;

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;

        if (state.hasUserInteracted || !window.HandTutorial) return;

        var joystickEl = document.getElementById('movement-joystick');
        if (!joystickEl) return;

        var rect = joystickEl.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var r = state.config.joystick.maxRadius;

        state.tutorial = new window.HandTutorial({
            container: document.body,
            assetUrl: tutCfg.assetUrl,
            gesture: tutCfg.gesture || 'drag',
            from: { space: 'pixels', x: cx, y: cy },
            to:   { space: 'pixels', x: cx + r * 0.6, y: cy - r * 0.6 },
            duration: tutCfg.duration || 1.5,
            loop: true,
            loopDelay: tutCfg.loopDelay || 0.5,
            size: 72,
            opacity: 0.95,
            showTrail: true
        }).play();
    }, tutCfg.startDelayMs || 500);
}

export function destroyTutorial(state) {
    if (state.tutorialDelayId) {
        window.clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }
}
