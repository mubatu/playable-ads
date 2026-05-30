export function scheduleTutorial(state) {
    var config = state.config.tutorial;
    if (!config.enabled || typeof window.HandTutorial === 'undefined') {
        return;
    }

    window.setTimeout(function () {
        if (state.gameStarted) {
            return;
        }

        var tutorial = new window.HandTutorial({
            container: document.body,
            renderer: state.renderer,
            camera: state.camera,
            gesture: config.gesture,
            size: config.size,
            duration: config.duration,
            loopDelay: config.loopDelay,
            from: { space: 'screen', x: 0.3, y: 0.6 },
            to: { space: 'screen', x: 0.7, y: 0.4 }
        });

        tutorial.play();
        state.tutorial = tutorial;
    }, config.startDelayMs);
}

export function stopTutorial(state) {
    if (state.tutorial) {
        state.tutorial.stop();
        state.tutorial.destroy();
        state.tutorial = null;
    }
}
