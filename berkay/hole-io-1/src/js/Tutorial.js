function clearTutorialDelay(state) {
    if (state.tutorialDelayId) {
        window.clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
    if (state.tutorialAutoHideId) {
        window.clearTimeout(state.tutorialAutoHideId);
        state.tutorialAutoHideId = null;
    }
}

export function destroyTutorial(state) {
    clearTutorialDelay(state);

    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }

    if (state.tutorialText && state.tutorialText.parentNode) {
        state.tutorialText.parentNode.removeChild(state.tutorialText);
        state.tutorialText = null;
    }
}

function getJoystickScreenPoint(state) {
    var joystickEl = state.ui.joystick && state.ui.joystick.element;
    if (!joystickEl) {
        return null;
    }
    var rect = joystickEl.getBoundingClientRect();
    return {
        space: 'pixels',
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function getJoystickDragTarget(state) {
    var joystickEl = state.ui.joystick && state.ui.joystick.element;
    if (!joystickEl) {
        return null;
    }
    var rect = joystickEl.getBoundingClientRect();
    return {
        space: 'pixels',
        x: rect.left + rect.width / 2 + 40,
        y: rect.top + rect.height / 2 - 30
    };
}

function showTutorialText(state) {
    if (state.tutorialText) {
        return;
    }
    var el = document.createElement('div');
    Object.assign(el.style, {
        position: 'fixed',
        bottom: '200px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '700',
        textShadow: '0 2px 8px rgba(0,0,0,0.6)',
        zIndex: '15',
        pointerEvents: 'none',
        textAlign: 'center',
        animation: 'fadeIn 0.4s ease-out'
    });
    el.textContent = 'Move to eat objects';
    document.body.appendChild(el);
    state.tutorialText = el;
}

function ensureTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};
    var fromPoint, toPoint;

    if (!tutorialConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        destroyTutorial(state);
        return;
    }

    fromPoint = getJoystickScreenPoint(state);
    toPoint = getJoystickDragTarget(state);

    if (!fromPoint || !toPoint) {
        destroyTutorial(state);
        return;
    }

    if (!state.tutorial) {
        state.tutorial = new window.HandTutorial({
            container: document.body,
            renderer: state.renderer,
            camera: state.camera,
            assetUrl: tutorialConfig.assetUrl,
            gesture: tutorialConfig.gesture || 'drag',
            duration: tutorialConfig.duration || 1.2,
            loop: true,
            loopDelay: tutorialConfig.loopDelay || 0.5,
            size: tutorialConfig.size || 120,
            rotation: 0,
            followDirection: false,
            flipX: false,
            showTrail: true,
            anchor: { x: 0.22, y: 0.08 },
            from: fromPoint,
            to: toPoint
        });
    } else {
        state.tutorial.setPoints(fromPoint, toPoint);
    }

    showTutorialText(state);
}

export function scheduleTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};

    clearTutorialDelay(state);

    if (!tutorialConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        ensureTutorial(state);

        if (state.tutorial) {
            state.tutorial.play();
        }

        state.tutorialAutoHideId = window.setTimeout(function () {
            state.tutorialAutoHideId = null;
            destroyTutorial(state);
        }, tutorialConfig.autoHideMs || 3000);
    }, tutorialConfig.startDelayMs || 500);
}

export function dismissTutorial(state) {
    state.hasUserInteracted = true;
    destroyTutorial(state);
}
