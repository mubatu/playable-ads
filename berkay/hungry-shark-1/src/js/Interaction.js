import { stopTutorial } from './Tutorial.js';

var joystickActive = false;
var joystickCenterX = 0;
var joystickCenterY = 0;
var joystickMaxRadius = 60;
var joystickEl = null;
var thumbEl = null;
var boostBtnEl = null;

export function bindInteractions(state) {
    buildJoystickUI(state);
    buildBoostButton(state);

    window.addEventListener('pointerdown', function (e) {
        if (e.target === boostBtnEl) {
            return;
        }

        var isLeftSide = e.clientX < window.innerWidth * 0.6;
        if (!isLeftSide) {
            return;
        }

        if (!state.gameStarted) {
            state.gameStarted = true;
            stopTutorial(state);
        }

        joystickActive = true;
        joystickCenterX = e.clientX;
        joystickCenterY = e.clientY;

        joystickEl.style.display = 'block';
        joystickEl.style.left = (joystickCenterX - joystickMaxRadius) + 'px';
        joystickEl.style.top = (joystickCenterY - joystickMaxRadius) + 'px';
        thumbEl.style.transform = 'translate(-50%, -50%)';
    });

    window.addEventListener('pointermove', function (e) {
        if (!joystickActive) {
            return;
        }

        var dx = e.clientX - joystickCenterX;
        var dy = e.clientY - joystickCenterY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > joystickMaxRadius) {
            var ratio = joystickMaxRadius / dist;
            dx *= ratio;
            dy *= ratio;
        }

        thumbEl.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';

        state.moveCommand.x = dx / joystickMaxRadius;
        state.moveCommand.y = dy / joystickMaxRadius;
    });

    window.addEventListener('pointerup', function () {
        joystickActive = false;
        joystickEl.style.display = 'none';
        state.moveCommand.x = 0;
        state.moveCommand.y = 0;
    });

    window.addEventListener('pointercancel', function () {
        joystickActive = false;
        joystickEl.style.display = 'none';
        state.moveCommand.x = 0;
        state.moveCommand.y = 0;
    });
}

function buildJoystickUI(state) {
    joystickEl = document.createElement('div');
    Object.assign(joystickEl.style, {
        position: 'fixed',
        width: (joystickMaxRadius * 2) + 'px',
        height: (joystickMaxRadius * 2) + 'px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: '2px solid rgba(255, 255, 255, 0.35)',
        display: 'none',
        zIndex: '20',
        pointerEvents: 'none',
        touchAction: 'none'
    });

    thumbEl = document.createElement('div');
    Object.assign(thumbEl.style, {
        position: 'absolute',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
    });

    joystickEl.appendChild(thumbEl);
    document.body.appendChild(joystickEl);
}

function buildBoostButton(state) {
    boostBtnEl = document.createElement('button');
    boostBtnEl.textContent = 'BOOST';
    Object.assign(boostBtnEl.style, {
        position: 'fixed',
        bottom: '40px',
        right: '20px',
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        border: '3px solid rgba(52,152,219,0.7)',
        backgroundColor: 'rgba(52,152,219,0.3)',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        zIndex: '20',
        touchAction: 'none'
    });

    boostBtnEl.addEventListener('pointerdown', function (e) {
        e.stopPropagation();
        if (!state.gameStarted) {
            state.gameStarted = true;
            stopTutorial(state);
        }
        if (state.boostEnergy > 0) {
            state.isBoosting = true;
        }
    });

    boostBtnEl.addEventListener('pointerup', function () {
        state.isBoosting = false;
    });

    boostBtnEl.addEventListener('pointercancel', function () {
        state.isBoosting = false;
    });

    document.body.appendChild(boostBtnEl);
}
