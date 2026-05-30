export function scheduleTutorial(state) {
    var cfg = state.config.tutorial;
    if (!cfg.enabled || !window.HandTutorial) return;
    setTimeout(function () {
        if (state.gameOver) return;
        var tut = new window.HandTutorial({
            container: document.body,
            renderer: state.renderer,
            camera: state.camera,
            gesture: cfg.gesture,
            from: { space: 'screen', x: 0.18, y: 0.78 },
            to: { space: 'screen', x: 0.42, y: 0.55 },
            size: cfg.size,
            duration: cfg.duration,
            loop: true,
            loopDelay: cfg.loopDelay,
            showTrail: true,
            trailColor: '#ffffff'
        });
        tut.play();
        state.tutorial = tut;

        // dismiss when player actually moves
        var interval = setInterval(function () {
            if (state.gameStarted && (Math.abs(state.moveCommand.x) > 0.2 || Math.abs(state.moveCommand.y) > 0.2)) {
                tut.stop();
                tut.destroy();
                state.tutorial = null;
                clearInterval(interval);
            }
        }, 200);
    }, cfg.startDelayMs);
}
