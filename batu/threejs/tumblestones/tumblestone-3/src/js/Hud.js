import { UIScene } from '../../../../../../reusables/UIScene/UIScene.js';

function getUiElement(uiScene, id) {
    return uiScene.getByConfigId(id);
}

function polishProgressBar(progressBar) {
    if (!progressBar) {
        return;
    }

    Object.assign(progressBar.containerDiv.style, {
        height: '24px',
        border: '2px solid rgba(255, 255, 255, 0.62)',
        boxShadow: '0 8px 22px rgba(26, 8, 51, 0.32)'
    });

    Object.assign(progressBar.fill.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        background: 'linear-gradient(90deg, #8b5cf6 0%, #ff5f7e 56%, #ffd66b 100%)',
        boxShadow: '0 0 18px rgba(255, 210, 90, 0.42)'
    });

    if (progressBar.text) {
        Object.assign(progressBar.text.style, {
            zIndex: '2',
            fontSize: '13px',
            letterSpacing: '0',
            minWidth: '54px'
        });
    }
}

export function buildHud(state, onStartGame, onRestartGame) {
    var maxMatches = state.config.progression.requiredMatches;
    var uiScene = new UIScene({
        progressBars: [
            {
                id: 'match-progress',
                initialValue: 0,
                max: maxMatches,
                textFormat: function (value, max) {
                    return Math.round(value) + '/' + max;
                },
                styles: {
                    top: '20px',
                    left: '50%',
                    width: 'min(62vw, 360px)',
                    transform: 'translateX(-50%)',
                    zIndex: '6',
                    padding: '0 6px'
                }
            }
        ],
        buttons: [
            {
                id: 'restart-button',
                text: 'Restart',
                styles: {
                    position: 'absolute',
                    top: '20px',
                    right: '16px',
                    padding: '10px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.14)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    letterSpacing: '0',
                    boxShadow: '0 4px 14px rgba(22, 7, 44, 0.28)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)'
                },
                onClick: function () {
                    if (typeof onRestartGame === 'function') {
                        onRestartGame();
                    }
                }
            }
        ],
        introOverlays: [
            {
                id: 'start-overlay',
                visible: true,
                title: 'Tumblestone Lite',
                subtitle: 'Tap the glowing bottom tile in any column. Fill 3 slots with the same color to clear a set.',
                buttonText: 'PLAY',
                styles: {
                    overlay: {
                        background: 'rgba(20, 9, 38, 0.86)',
                        backdropFilter: 'blur(7px)'
                    },
                    title: {
                        fontSize: '38px',
                        fontWeight: '900',
                        lineHeight: '1.05',
                        margin: '0 0 8px 0',
                        color: '#ffffff',
                        textShadow: '0 4px 18px rgba(0, 0, 0, 0.34)'
                    },
                    subtitle: {
                        fontSize: '18px',
                        fontWeight: '650',
                        opacity: '0.96',
                        margin: '0',
                        maxWidth: '320px'
                    },
                    button: {
                        marginTop: '24px',
                        padding: '14px 38px',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ff5f7e 100%)',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.34)'
                    }
                },
                onPrimaryClick: function () {
                    if (state.ui.startOverlay) {
                        state.ui.startOverlay.hide();
                    }

                    if (typeof onStartGame === 'function') {
                        onStartGame();
                    }
                }
            },
            {
                id: 'result-overlay',
                visible: false,
                title: 'Great Job!',
                subtitle: '5/5 sets cleared',
                buttonText: 'PLAY AGAIN',
                styles: {
                    overlay: {
                        background: 'rgba(20, 9, 38, 0.9)',
                        backdropFilter: 'blur(7px)'
                    },
                    title: {
                        fontSize: '40px',
                        fontWeight: '900',
                        lineHeight: '1.05',
                        margin: '0 0 10px 0',
                        color: '#ffffff',
                        textShadow: '0 4px 18px rgba(0, 0, 0, 0.34)'
                    },
                    subtitle: {
                        fontSize: '20px',
                        fontWeight: '750',
                        opacity: '0.96',
                        margin: '0',
                        maxWidth: '300px'
                    },
                    button: {
                        marginTop: '24px',
                        padding: '14px 38px',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, #ffd66b 0%, #ff5f7e 100%)',
                        color: '#2a1148',
                        fontSize: '16px',
                        boxShadow: '0 8px 24px rgba(255, 95, 126, 0.34)'
                    }
                },
                onPrimaryClick: function () {
                    if (typeof onRestartGame === 'function') {
                        onRestartGame();
                    }
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.ui = {
        progressBar: getUiElement(uiScene, 'match-progress'),
        restartButton: getUiElement(uiScene, 'restart-button'),
        startOverlay: getUiElement(uiScene, 'start-overlay'),
        resultOverlay: getUiElement(uiScene, 'result-overlay')
    };

    polishProgressBar(state.ui.progressBar);
    refreshProgressDisplay(state);
}

export function refreshProgressDisplay(state) {
    if (state.ui.progressBar) {
        state.ui.progressBar.setMax(state.config.progression.requiredMatches);
        state.ui.progressBar.setValue(state.matchesCleared);
    }
}

export function showEndState(state, didWin) {
    state.gameOver = true;
    state.locked = true;
    state.isPlaying = false;

    if (!state.ui.resultOverlay) {
        return;
    }

    if (didWin) {
        state.ui.resultOverlay.setTitle('You Win!');
        state.ui.resultOverlay.setSubtitle(state.matchesCleared + '/' + state.config.progression.requiredMatches + ' sets cleared');
        state.ui.resultOverlay.setButtonText('PLAY AGAIN');
    } else {
        state.ui.resultOverlay.setTitle('Mismatch!');
        state.ui.resultOverlay.setSubtitle('Keep all 3 tiles the same color.');
        state.ui.resultOverlay.setButtonText('TRY AGAIN');
    }

    state.ui.resultOverlay.show();
}
