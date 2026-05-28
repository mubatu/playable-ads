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

function getJoystickScreenPoints() {
    return {
        from: { space: 'pixels', x: 76, y: window.innerHeight - 130 },
        to: { space: 'pixels', x: 130, y: window.innerHeight - 180 }
    };
}

export function scheduleTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};
    var points;

    clearTutorialDelay(state);

    if (!tutorialConfig.enabled || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        points = getJoystickScreenPoints();

        if (!state.tutorial) {
            state.tutorial = new window.HandTutorial({
                container: state.renderer.domElement.parentElement,
                renderer: state.renderer,
                camera: state.camera,
                assetUrl: tutorialConfig.assetUrl,
                gesture: tutorialConfig.gesture || 'drag',
                duration: tutorialConfig.duration || 1.1,
                loop: true,
                loopDelay: tutorialConfig.loopDelay || 0.3,
                size: tutorialConfig.size || 110,
                from: points.from,
                to: points.to,
                anchor: { x: 0.22, y: 0.08 },
                showTrail: true,
                zIndex: 13
            });
        } else {
            state.tutorial.setPoints(points.from, points.to);
        }

        if (state.tutorial) {
            state.tutorial.play();
        }
    }, tutorialConfig.startDelayMs || 200);
}

export function dismissTutorial(state) {
    state.tutorialActive = false;

    if (state.tutorialTextEl) {
        state.tutorialTextEl.hidden = true;
    }

    destroyTutorial(state);

    if (!state.sessionStarted) {
        state.sessionStarted = true;
    }
}

export function setupTutorial(state) {
    scheduleTutorial(state);
}
