export function scheduleTutorial(state) {
    var config = state.config.tutorial;
    if (!config || !config.enabled || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;

        if (state.gameStarted) {
            return;
        }

        var joystickBase = document.querySelector('[style*="border-radius: 50%"][style*="fixed"]');
        var fromPt = getJoystickPoint();
        var toPt = getCenterPoint(state);

        if (!fromPt || !toPt) {
            return;
        }

        state.tutorial = new window.HandTutorial({
            container: state.renderer.domElement.parentElement || document.body,
            renderer: state.renderer,
            camera: state.camera,
            gesture: 'drag',
            duration: 1.4,
            loop: true,
            loopDelay: 0.5,
            size: 100,
            rotation: 0,
            followDirection: false,
            flipX: false,
            showTrail: true,
            anchor: { x: 0.22, y: 0.08 },
            from: fromPt,
            to: toPt
        });

        state.tutorial.play();
    }, config.startDelayMs || 1200);
}

function getJoystickPoint() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var size = Math.min(w, h) * 0.22;
    var margin = 16;
    return {
        space: 'screen',
        x: margin + size * 0.5,
        y: h - margin - size * 0.5
    };
}

function getCenterPoint(state) {
    return {
        space: 'screen',
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.42
    };
}
