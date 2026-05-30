import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

function getUiElement(uiScene, id) {
    return uiScene.getByConfigId(id);
}

export function addScore(state, points) {
    state.score += points;
    refreshScoreDisplay(state);
}

export function refreshScoreDisplay(state) {
    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(state.score);
    }
}

export function showEndScreen(state) {
    if (state.ui.endOverlay) {
        state.ui.endOverlay.setSubtitle('Final Score: ' + state.score);
        state.ui.endOverlay.show();
    }
}

export function hideEndScreen(state) {
    if (state.ui.endOverlay) {
        state.ui.endOverlay.hide();
    }
}

export function buildHud(state, onReplay) {
    var downloadUrl = state.config.download.url || 'https://google.com';
    var uiScene = new UIScene({
        scoreDisplays: [
            {
                id: 'score-display',
                label: 'SCORE',
                initialValue: 0,
                styles: {
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '900',
                    letterSpacing: '0.06em',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.55)',
                    zIndex: '6'
                },
                labelStyles: {
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    opacity: '0.8',
                    marginBottom: '2px'
                }
            }
        ],
        joysticks: [
            {
                id: 'move-joystick',
                maxRadius: 52,
                styles: {
                    left: '24px',
                    bottom: '24px',
                    backgroundColor: 'rgba(80, 80, 80, 0.35)',
                    border: '2px solid rgba(255, 255, 255, 0.45)',
                    pointerEvents: 'auto',
                    zIndex: '8'
                },
                onInit: function (command) {
                    state.moveCommand = command;
                }
            }
        ],
        buttons: [
            {
                id: 'download-button',
                text: 'Download Now',
                styles: {
                    position: 'absolute',
                    bottom: '28%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '14px 36px',
                    border: 'none',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                    color: '#2d3436',
                    fontSize: '16px',
                    fontWeight: '900',
                    letterSpacing: '0.06em',
                    boxShadow: '0 8px 24px rgba(253, 203, 110, 0.45)',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    display: 'none',
                    zIndex: '110'
                },
                onClick: function () {
                    state.audio.playClick();
                    window.location.href = downloadUrl;
                }
            },
            {
                id: 'replay-button',
                text: 'Play Again',
                styles: {
                    position: 'absolute',
                    bottom: '18%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px 34px',
                    border: '2px solid rgba(255, 255, 255, 0.75)',
                    borderRadius: '999px',
                    background: 'rgba(45, 52, 54, 0.88)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    display: 'none',
                    zIndex: '110'
                },
                onClick: function () {
                    state.audio.playClick();
                    onReplay();
                    window.location.href = downloadUrl;
                }
            }
        ],
        introOverlays: [
            {
                id: 'end-overlay',
                visible: false,
                title: "Time's Up!",
                subtitle: 'Final Score: 0',
                buttonText: '',
                styles: {
                    overlay: {
                        background: 'rgba(0, 0, 0, 0.72)',
                        animation: 'fadeIn 0.4s ease-out'
                    },
                    title: {
                        fontSize: '38px',
                        fontWeight: '900',
                        margin: '0 0 8px 0',
                        background: 'linear-gradient(135deg, #ffeaa7, #e17055)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    },
                    subtitle: {
                        fontSize: '28px',
                        fontWeight: '800',
                        opacity: '1',
                        margin: '12px 0 80px 0'
                    },
                    button: {
                        display: 'none'
                    }
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.ui = {
        scoreDisplay: getUiElement(uiScene, 'score-display'),
        endOverlay: getUiElement(uiScene, 'end-overlay'),
        downloadButton: getUiElement(uiScene, 'download-button'),
        replayButton: getUiElement(uiScene, 'replay-button'),
        joystick: getUiElement(uiScene, 'move-joystick')
    };
}

export function showEndButtons(state) {
    if (state.ui.joystick) {
        state.ui.joystick.deactivate();
    }
    if (state.ui.downloadButton && state.ui.downloadButton.element) {
        state.ui.downloadButton.element.style.display = 'block';
    }
    if (state.ui.replayButton && state.ui.replayButton.element) {
        state.ui.replayButton.element.style.display = 'block';
    }
}

export function hideEndButtons(state) {
    if (state.ui.joystick) {
        state.ui.joystick.activate();
    }
    if (state.ui.downloadButton && state.ui.downloadButton.element) {
        state.ui.downloadButton.element.style.display = 'none';
    }
    if (state.ui.replayButton && state.ui.replayButton.element) {
        state.ui.replayButton.element.style.display = 'none';
    }
}
