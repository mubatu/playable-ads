import { UIScene } from '../../../../reusables/UIScene/UIScene.js';
import { Timer } from '../../../../reusables/components/Timer.js';

var CTA_URL = 'https://google.com';

function getUiElement(uiScene, id) {
    return uiScene.getByConfigId(id);
}

export function addScore(state, points) {
    state.score += points;

    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(state.score);
    }

    if (points > 0 && state.ui.scoreDisplay) {
        state.ui.scoreDisplay.showPopup('+' + points);
    }
}

export function refreshScoreDisplay(state) {
    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(state.score);
    }
}

export function showEndScreen(state) {
    state.gameOver = true;

    if (state.ui.endOverlay) {
        state.ui.endOverlay.setSubtitle('Score: ' + state.score);
        state.ui.endOverlay.show();
    }

    if (state.ui.downloadBtn) {
        state.ui.downloadBtn.style.display = 'block';
    }
}

export function buildHud(state, onResetGame) {
    var uiScene = new UIScene({
        scoreDisplays: [
            {
                id: 'score-display',
                label: 'SCORE',
                initialValue: 0,
                styles: {
                    top: '20px',
                    left: '20px',
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '800',
                    letterSpacing: '0.04em',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                    zIndex: '6'
                },
                labelStyles: {
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    opacity: '0.8',
                    marginBottom: '2px'
                }
            }
        ],
        joysticks: [
            {
                id: 'joystick',
                maxRadius: 50,
                styles: {
                    bottom: '40px',
                    left: '30px',
                    zIndex: '10'
                },
                onInit: function (command) {
                    state.joystickCommand = command;
                }
            }
        ],
        introOverlays: [
            {
                id: 'end-overlay',
                visible: false,
                title: "Time's Up!",
                subtitle: 'Score: 0',
                buttonText: 'Play Again',
                styles: {
                    overlay: {
                        background: 'rgba(0, 0, 0, 0.82)',
                        animation: 'fadeIn 0.4s ease-out'
                    },
                    title: {
                        fontSize: '40px',
                        fontWeight: '800',
                        margin: '0 0 8px 0',
                        background: 'linear-gradient(135deg, #FFEAA7, #FF9F43)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    },
                    subtitle: {
                        fontSize: '28px',
                        fontWeight: '800',
                        opacity: '1',
                        margin: '16px 0',
                        color: '#ffffff'
                    },
                    button: {
                        marginTop: '16px',
                        padding: '14px 40px',
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '700',
                        boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                        borderRadius: '999px'
                    }
                },
                onPrimaryClick: function () {
                    window.open(CTA_URL, '_blank');
                }
            }
        ]
    });

    var downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Now';
    downloadBtn.id = 'download-btn';
    Object.assign(downloadBtn.style, {
        position: 'fixed',
        bottom: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '14px 40px',
        border: 'none',
        borderRadius: '999px',
        background: 'linear-gradient(135deg, #FF9F43 0%, #FF6B6B 100%)',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '700',
        boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
        cursor: 'pointer',
        zIndex: '101',
        display: 'none'
    });
    downloadBtn.addEventListener('click', function () {
        window.open(CTA_URL, '_blank');
    });
    document.body.appendChild(downloadBtn);

    var timer = new Timer(state.config.timer.duration, 'circular', function () {
        showEndScreen(state);
    });
    timer.element.style.top = '15px';
    timer.element.style.left = '';
    timer.element.style.right = '20px';
    timer.element.style.transform = 'none';

    state.uiScene = uiScene;
    state.timer = timer;
    state.ui = {
        scoreDisplay: getUiElement(uiScene, 'score-display'),
        joystick: getUiElement(uiScene, 'joystick'),
        endOverlay: getUiElement(uiScene, 'end-overlay'),
        downloadBtn: downloadBtn
    };
    state.onReset = onResetGame;
}

export function destroyHud(state) {
    if (state.timer) {
        state.timer.destroy();
        state.timer = null;
    }
    if (state.uiScene) {
        state.uiScene.destroy();
        state.uiScene = null;
    }
    if (state.ui.downloadBtn && state.ui.downloadBtn.parentNode) {
        state.ui.downloadBtn.parentNode.removeChild(state.ui.downloadBtn);
    }
}
