function clearDelay(state) {
    if (state.tutorialDelayId) {
        window.clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
}

export function destroyTutorial(state) {
    clearDelay(state);
    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }
}

// Drag gesture over the joystick: knob center -> up-right, looping.
function joystickCenter(state) {
    var el = state.ui.joystick && state.ui.joystick.element;
    if (!el) {
        return null;
    }
    var rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

export function startTutorial(state) {
    var conf = state.config.tutorial || {};
    if (!conf.enabled || !window.HandTutorial) {
        return;
    }

    var center = joystickCenter(state);
    if (!center) {
        return;
    }

    var from = { space: 'pixels', x: center.x, y: center.y };
    var to = { space: 'pixels', x: center.x + 60, y: center.y - 60 };

    state.tutorial = new window.HandTutorial({
        container: document.body,
        renderer: state.renderer,
        camera: state.camera,
        assetUrl: conf.assetUrl,
        gesture: 'drag',
        duration: 1.0,
        loop: true,
        loopDelay: 0.35,
        size: conf.size || 110,
        rotation: 0,
        followDirection: false,
        showTrail: true,
        anchor: { x: 0.22, y: 0.08 },
        from: from,
        to: to
    }).play();

    // Auto fade-out after the tutorial window.
    state.tutorialDelayId = window.setTimeout(function () {
        destroyTutorial(state);
    }, (conf.durationSec || 3) * 1000);
}

export function dismissTutorial(state) {
    if (state.tutorial) {
        destroyTutorial(state);
    }
}
