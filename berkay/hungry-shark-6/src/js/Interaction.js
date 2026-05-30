export function bindInteractions(state) {
    buildJoystick(state);
    buildBoostButton(state);
}

function buildJoystick(state) {
    var size = Math.min(window.innerWidth, window.innerHeight) * 0.22;
    var margin = 16;

    var base = document.createElement('div');
    Object.assign(base.style, {
        position: 'fixed',
        bottom: margin + 'px',
        left: margin + 'px',
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        border: '2px solid rgba(255,255,255,0.3)',
        touchAction: 'none',
        zIndex: '10',
        pointerEvents: 'auto'
    });

    var thumb = document.createElement('div');
    var thumbSize = size * 0.42;
    Object.assign(thumb.style, {
        position: 'absolute',
        width: thumbSize + 'px',
        height: thumbSize + 'px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.7)',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none'
    });

    base.appendChild(thumb);
    document.body.appendChild(base);

    var active = false;
    var maxRadius = size * 0.5;

    function onDown(e) {
        e.preventDefault();
        active = true;
        if (!state.gameStarted) {
            state.gameStarted = true;
        }
        dismissTutorial(state);
        move(e.clientX, e.clientY);
    }

    function onMove(e) {
        if (!active) return;
        e.preventDefault();
        move(e.clientX, e.clientY);
    }

    function onUp() {
        active = false;
        state.moveCommand.x = 0;
        state.moveCommand.y = 0;
        thumb.style.transform = 'translate(-50%,-50%)';
    }

    function move(cx, cy) {
        var rect = base.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var dx = cx - centerX;
        var dy = cy - centerY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxRadius) {
            var ratio = maxRadius / dist;
            dx *= ratio;
            dy *= ratio;
        }

        thumb.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
        state.moveCommand.x = dx / maxRadius;
        state.moveCommand.y = dy / maxRadius;
    }

    base.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
}

function buildBoostButton(state) {
    var btn = document.createElement('button');
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.4)',
        background: 'linear-gradient(135deg,#3498db,#2980b9)',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '800',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        touchAction: 'none',
        pointerEvents: 'auto',
        zIndex: '10',
        boxShadow: '0 4px 16px rgba(52,152,219,0.45)'
    });
    btn.textContent = 'BOOST';

    btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        if (state.boostEnergy > 10) {
            state.isBoosting = true;
        }
        if (!state.gameStarted) {
            state.gameStarted = true;
        }
        dismissTutorial(state);
    });
    btn.addEventListener('pointerup', function () { state.isBoosting = false; });
    btn.addEventListener('pointercancel', function () { state.isBoosting = false; });

    document.body.appendChild(btn);
}

function dismissTutorial(state) {
    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }
    if (state.tutorialDelayId) {
        clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
}
