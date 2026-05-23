import { UIScene } from '../../../../reusables/UIScene/UIScene.js';
import { formatTime } from './GameState.js';

export function buildHud(state, onResetGame) {
    var gameDuration = state.config.game.duration;

    var uiScene = new UIScene({
        scoreDisplays: [
            {
                id: 'score-display',
                label: 'SCORE',
                initialValue: 0,
                styles: {
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ffffff',
                    fontSize: '26px',
                    fontWeight: '900',
                    letterSpacing: '0.04em',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
                    zIndex: '6',
                    textAlign: 'center'
                },
                labelStyles: {
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    opacity: '0.8',
                    marginBottom: '2px'
                }
            }
        ],
        joysticks: [
            {
                id: 'movement-joystick',
                maxRadius: state.config.joystick.maxRadius,
                styles: state.config.joystick.styles,
                onInit: function (command) {
                    state.moveCommand = command;
                }
            }
        ],
        introOverlays: [
            {
                id: 'game-over',
                visible: false,
                title: "Time's Up!",
                subtitle: 'Score: 0',
                buttonText: 'Play Again',
                buttonId: 'play-again-btn',
                onPrimaryClick: function () {
                    window.location.href = 'https://google.com';
                },
                styles: {
                    overlay: {
                        background: 'rgba(0, 0, 0, 0.85)',
                        animation: 'fadeIn 0.4s ease-out'
                    },
                    title: {
                        fontSize: '42px',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '8px'
                    },
                    subtitle: {
                        fontSize: '30px',
                        fontWeight: '800',
                        color: '#ffffff',
                        margin: '16px 0'
                    },
                    button: {
                        marginTop: '20px',
                        padding: '16px 44px',
                        background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                        color: '#1a0000',
                        fontSize: '18px',
                        fontWeight: '800',
                        boxShadow: '0 8px 24px rgba(255, 160, 0, 0.4)',
                        borderRadius: '999px',
                        animation: 'pulseCta 1.5s ease-in-out infinite'
                    }
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.ui.scoreDisplay = uiScene.getByConfigId('score-display');
    state.ui.joystick = uiScene.getByConfigId('movement-joystick');
    state.ui.gameOverOverlay = uiScene.getByConfigId('game-over');

    // Timer: custom DOM element (top right)
    var timerEl = document.createElement('div');
    timerEl.id = 'hole-timer';
    timerEl.textContent = formatTime(gameDuration);
    Object.assign(timerEl.style, {
        position: 'absolute',
        top: '20px',
        right: '20px',
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: '800',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        textShadow: '0 2px 8px rgba(0,0,0,0.6)',
        letterSpacing: '0.05em',
        zIndex: '6',
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.35)',
        padding: '6px 14px',
        borderRadius: '12px'
    });
    document.body.appendChild(timerEl);
    state.ui.timerEl = timerEl;

    // "Download Now" button added to the end-screen overlay
    var gameOverEl = state.ui.gameOverOverlay && state.ui.gameOverOverlay.element;
    if (gameOverEl) {
        var dlBtn = document.createElement('button');
        dlBtn.textContent = 'Download Now';
        Object.assign(dlBtn.style, {
            marginTop: '12px',
            padding: '14px 40px',
            background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
            color: '#ffffff',
            fontSize: '17px',
            fontWeight: '800',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 114, 255, 0.4)',
            display: 'block'
        });
        dlBtn.addEventListener('click', function () {
            window.location.href = 'https://google.com';
        });
        gameOverEl.appendChild(dlBtn);
    }

    return uiScene;
}

export function refreshScoreDisplay(state) {
    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(state.score);
    }
}
