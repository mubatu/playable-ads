import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

function formatTime(seconds) {
    var s = Math.max(0, Math.ceil(seconds));
    var mm = Math.floor(s / 60);
    var ss = s % 60;
    return (mm < 10 ? '0' + mm : mm) + ':' + (ss < 10 ? '0' + ss : ss);
}

export function addScore(state, points) {
    state.score += points;
    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(state.score);
        if (points > 0) {
            state.ui.scoreDisplay.showPopup('+' + points);
        }
    }
}

export function updateTimerUI(state) {
    if (state.ui.timerDisplay) {
        state.ui.timerDisplay.setValue(formatTime(state.timeLeft));
    }
}

export function showEndScreen(state) {
    if (state.ui.endOverlay) {
        state.ui.endOverlay.setSubtitle('SCORE ' + state.score);
        state.ui.endOverlay.show();
    }
}

export function buildHud(state, onPlayAgain, onDownload) {
    var uiScene = new UIScene({
        scoreDisplays: [
            {
                id: 'score-display',
                label: 'SCORE',
                initialValue: 0,
                styles: {
                    top: '18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ffffff',
                    fontSize: '26px',
                    fontWeight: '800',
                    letterSpacing: '0.04em',
                    textShadow: '0 2px 8px rgba(0,0,0,0.45)',
                    zIndex: '6'
                },
                labelStyles: {
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    opacity: '0.75',
                    marginBottom: '2px'
                }
            },
            {
                id: 'timer-display',
                label: 'TIME',
                initialValue: '00:30',
                styles: {
                    top: '18px',
                    right: '18px',
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '800',
                    textShadow: '0 2px 8px rgba(0,0,0,0.45)',
                    zIndex: '6'
                },
                labelStyles: {
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    opacity: '0.75',
                    marginBottom: '2px',
                    textAlign: 'right'
                },
                valueStyles: {
                    display: 'block',
                    textAlign: 'right'
                }
            }
        ],
        joysticks: [
            {
                id: 'move-joystick',
                maxRadius: 55,
                styles: {
                    left: '26px',
                    bottom: '34px',
                    zIndex: '7'
                },
                onInit: function (command) {
                    state.move = command;
                }
            }
        ],
        introOverlays: [
            {
                id: 'end-overlay',
                visible: false,
                title: "Time's Up!",
                subtitle: 'SCORE 0',
                buttonText: 'Download Now',
                styles: {
                    overlay: {
                        background: 'rgba(8, 20, 36, 0.85)',
                        animation: 'fadeIn 0.35s ease-out'
                    },
                    title: {
                        fontSize: '40px',
                        fontWeight: '900',
                        margin: '0 0 4px 0'
                    },
                    subtitle: {
                        fontSize: '26px',
                        fontWeight: '800',
                        margin: '6px 0 4px 0'
                    },
                    button: {
                        marginTop: '18px',
                        padding: '15px 44px',
                        fontSize: '18px',
                        background: 'linear-gradient(180deg, #ffd23f 0%, #ff9f1c 100%)',
                        color: '#1a1207',
                        boxShadow: '0 8px 22px rgba(255, 159, 28, 0.45)'
                    }
                },
                onPrimaryClick: function () {
                    onDownload();
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.ui = {
        scoreDisplay: uiScene.getByConfigId('score-display'),
        timerDisplay: uiScene.getByConfigId('timer-display'),
        joystick: uiScene.getByConfigId('move-joystick'),
        endOverlay: uiScene.getByConfigId('end-overlay')
    };
    state.ui.timerDisplay.setValue(formatTime(state.timeLeft));

    addPlayAgainButton(state, onPlayAgain);
}

// The reusable intro overlay only renders one CTA, so append a second
// "Play Again" button into the same overlay element.
function addPlayAgainButton(state, onPlayAgain) {
    var overlay = state.ui.endOverlay;
    if (!overlay || !overlay.element) {
        return;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Play Again';
    Object.assign(btn.style, {
        marginTop: '12px',
        border: 'none',
        borderRadius: '999px',
        padding: '13px 40px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        color: '#ffffff',
        background: 'rgba(255,255,255,0.16)',
        border: '2px solid rgba(255,255,255,0.5)'
    });
    btn.addEventListener('click', function () {
        onPlayAgain();
    });
    overlay.element.appendChild(btn);
}
