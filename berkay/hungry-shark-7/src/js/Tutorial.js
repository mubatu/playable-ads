function clearTutorialDelay(state) {
    if (state.tutorialDelayId) {
        window.clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
}

export function destroyTutorial(state) {
    clearTutorialDelay(state);
    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }
}

function joystickScreenPoint(state) {
    var joystick = state.ui.joystick;
    if (!joystick || !joystick.element) { return null; }
    var rect = joystick.element.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    return {
        x: cx / window.innerWidth,
        y: cy / window.innerHeight
    };
}

function ensureTutorial(state) {
    var cfg = state.config.tutorial || {};
    if (!cfg.enabled || state.hasUserInteracted || !window.HandTutorial) {
        destroyTutorial(state);
        return;
    }

    var center = joystickScreenPoint(state);
    if (!center) {
        destroyTutorial(state);
        return;
    }

    var from = { space: 'screen', x: center.x, y: center.y };
    var to = { space: 'screen', x: center.x + 0.12, y: center.y - 0.14 };

    if (!state.tutorial) {
        state.tutorial = new window.HandTutorial({
            container: state.renderer.domElement.parentElement || document.body,
            renderer: state.renderer,
            camera: state.camera,
            assetUrl: cfg.assetUrl,
            gesture: cfg.gesture || 'drag',
            duration: cfg.duration || 1.4,
            loop: true,
            loopDelay: cfg.loopDelay || 0.5,
            size: cfg.size || 120,
            followDirection: false,
            showTrail: true,
            anchor: { x: 0.3, y: 0.1 },
            from: from,
            to: to
        });
    } else {
        state.tutorial.setPoints(from, to);
    }
}

export function scheduleTutorial(state) {
    var cfg = state.config.tutorial || {};
    clearTutorialDelay(state);

    if (!cfg.enabled || state.hasUserInteracted || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        ensureTutorial(state);
        if (state.tutorial) {
            state.tutorial.play();
        }
    }, cfg.startDelayMs || 900);
}

export function dismissTutorial(state) {
    state.hasUserInteracted = true;
    destroyTutorial(state);
}
