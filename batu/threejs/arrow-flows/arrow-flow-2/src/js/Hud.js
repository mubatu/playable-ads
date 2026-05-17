import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

function getUiElement(uiScene, id) {
    return uiScene.getByConfigId(id);
}

export function buildHud(state, onResetGame) {
    var uiScene = new UIScene({
        scoreDisplays: [
            {
                id: 'cells-display',
                label: 'Cells',
                initialValue: state.cellsRemaining,
                styles: {
                    top: '18px',
                    left: '22px',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: '800',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.38)',
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
                initialValue: 0,
                max: state.config.playableAd.maxSessionSeconds,
                showText: false,
                styles: {
                    position: 'absolute',
                    left: '22px',
                    right: '22px',
                    top: '76px',
                    height: '8px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.18)',
                    overflow: 'hidden',
                    zIndex: '5'
                }
            }
        ],
        buttons: [
            {
                id: 'restart-button',
                text: 'Restart',
                styles: {
                    position: 'absolute',
                    top: '18px',
                    right: '22px',
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#29314f',
                    fontSize: '13px',
                    fontWeight: '800',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                    cursor: 'pointer'
                },
                onClick: function () {
                    onResetGame();
                }
            }
        ],
        introOverlays: [
            {
                id: 'end-overlay',
                visible: false,
                title: 'Puzzle Clear',
                subtitle: 'Every arrow cell was destroyed.',
                buttonText: 'Play Now',
                styles: {
                    overlay: {
                        background: 'rgba(22, 28, 46, 0.9)',
                        animation: 'fadeIn 0.24s ease-out'
                    },
                    title: {
                        fontSize: '34px',
                        fontWeight: '900',
                        margin: '0 0 10px 0',
                        color: '#ffffff',
                        textShadow: '0 3px 12px rgba(0,0,0,0.28)'
                    },
                    subtitle: {
                        fontSize: '19px',
                        fontWeight: '700',
                        opacity: '0.9',
                        margin: '8px 0'
                    },
                    button: {
                        marginTop: '24px',
                        padding: '14px 34px',
                        borderRadius: '8px',
                        background: '#ffdf34',
                        color: '#232946',
                        fontSize: '16px',
                        fontWeight: '900',
                        boxShadow: '0 8px 22px rgba(255, 223, 52, 0.28)'
                    }
                },
                onPrimaryClick: function () {
                    if (state.ui.endOverlay) {
                        state.ui.endOverlay.hide();
                    }
                    onResetGame();
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.ui = {
        cellsDisplay: getUiElement(uiScene, 'cells-display'),
        sessionProgress: getUiElement(uiScene, 'session-progress'),
        restartButton: getUiElement(uiScene, 'restart-button'),
        endOverlay: getUiElement(uiScene, 'end-overlay')
    };
}

export function refreshHud(state) {
    if (state.ui.cellsDisplay) {
        state.ui.cellsDisplay.setValue(Math.max(0, state.cellsRemaining));
    }
    if (state.ui.sessionProgress) {
        state.ui.sessionProgress.setValue(Math.min(state.elapsedSeconds, state.config.playableAd.maxSessionSeconds));
    }
}

export function showEndOverlay(state, type) {
    var title = 'Puzzle Clear';
    var subtitle = 'Every arrow cell was destroyed.';

    if (type === 'lose') {
        title = 'Frame Jammed';
        subtitle = 'The frame filled with no matching shot available.';
    } else if (type === 'timeout') {
        title = 'Almost There';
        subtitle = 'Keep the arrows flowing before the frame fills.';
    }

    if (state.ui.endOverlay) {
        state.ui.endOverlay.setTitle(title);
        state.ui.endOverlay.setSubtitle(subtitle);
        state.ui.endOverlay.setButtonText(type === 'win' ? 'Play Now' : 'Try Again');
        state.ui.endOverlay.show();
    }
}
