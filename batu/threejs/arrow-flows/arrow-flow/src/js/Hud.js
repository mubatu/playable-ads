import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

function getUiElement(uiScene, id) {
    return uiScene.getByConfigId(id);
}

export function buildHud(state, onResetGame) {
    var uiScene = new UIScene({
        scoreDisplays: [
            {
                id: 'moves-display',
                label: 'Cells Left',
                initialValue: state.totalCells,
                styles: {
                    top: '20px',
                    left: '20px',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: '800',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                    zIndex: '6'
                },
                labelStyles: {
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    opacity: '0.72',
                    marginBottom: '2px'
                }
            }
        ],
        progressBars: [
            {
                id: 'session-progress',
                initialValue: state.config.playableAd.maxSessionSeconds,
                max: state.config.playableAd.maxSessionSeconds,
                showText: false,
                styles: {
                    position: 'absolute',
                    left: '20px',
                    right: '20px',
                    bottom: '20px',
                    height: '8px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.18)',
                    overflow: 'hidden',
                    zIndex: '6'
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
                    right: '20px',
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: '#172033',
                    fontSize: '13px',
                    fontWeight: '800',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                    cursor: 'pointer'
                },
                onClick: function () {
                    onResetGame();
                }
            }
        ],
        introOverlays: [
            {
                id: 'result-overlay',
                visible: false,
                title: 'Puzzle Clear',
                subtitle: 'All arrows destroyed',
                buttonText: 'Play Now',
                styles: {
                    overlay: {
                        background: 'rgba(16, 24, 39, 0.9)',
                        animation: 'fadeIn 0.32s ease-out'
                    },
                    title: {
                        fontSize: '36px',
                        fontWeight: '900',
                        margin: '0 0 10px 0',
                        color: '#ffffff'
                    },
                    subtitle: {
                        fontSize: '18px',
                        fontWeight: '700',
                        opacity: '0.86',
                        margin: '0'
                    },
                    button: {
                        marginTop: '28px',
                        padding: '14px 36px',
                        borderRadius: '8px',
                        background: '#ffdc3c',
                        color: '#172033',
                        fontSize: '16px',
                        fontWeight: '900',
                        boxShadow: '0 8px 26px rgba(255, 220, 60, 0.26)'
                    }
                },
                onPrimaryClick: function () {
                    onResetGame();
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.ui = {
        movesDisplay: getUiElement(uiScene, 'moves-display'),
        sessionProgress: getUiElement(uiScene, 'session-progress'),
        restartButton: getUiElement(uiScene, 'restart-button'),
        resultOverlay: getUiElement(uiScene, 'result-overlay')
    };
}

export function refreshHud(state) {
    var remaining = state.totalCells - state.destroyedCells;
    if (state.ui.movesDisplay) {
        state.ui.movesDisplay.setValue(Math.max(remaining, 0));
    }
    if (state.ui.sessionProgress) {
        state.ui.sessionProgress.setValue(Math.max(state.config.playableAd.maxSessionSeconds - state.elapsedSeconds, 0));
    }
}

export function showResult(state, title, subtitle) {
    if (!state.ui.resultOverlay) {
        return;
    }

    state.ui.resultOverlay.setTitle(title);
    state.ui.resultOverlay.setSubtitle(subtitle);
    state.ui.resultOverlay.setButtonText('Play Now');
    state.ui.resultOverlay.show();
}

export function hideResult(state) {
    if (state.ui.resultOverlay) {
        state.ui.resultOverlay.hide();
    }
}
