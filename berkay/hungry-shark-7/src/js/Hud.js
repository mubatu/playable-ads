import { UIScene } from '../../../../reusables/UIScene/UIScene.js';
import { getGoldRushDisplay } from './GoldRush.js';

function barStyles(top) {
    return {
        top: top,
        left: '16px',
        width: '170px',
        height: '16px'
    };
}

export function buildHud(state, callbacks) {
    var uiScene = new UIScene({
        scoreDisplays: [
            {
                id: 'score-display',
                label: 'Score',
                initialValue: 0,
                styles: {
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '800',
                    textAlign: 'center',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    zIndex: '6'
                },
                labelStyles: {
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    opacity: '0.75'
                }
            }
        ],
        progressBars: [
            { id: 'health-bar', initialValue: 100, max: 100, showText: false, styles: barStyles('16px') },
            { id: 'hunger-bar', initialValue: 70, max: 100, showText: false, styles: barStyles('40px') },
            { id: 'boost-bar', initialValue: 100, max: 100, showText: false, styles: barStyles('64px') },
            { id: 'goldrush-bar', initialValue: 0, max: 12, showText: false, styles: barStyles('88px') }
        ],
        buttons: [
            {
                id: 'boost-button',
                text: 'BOOST',
                styles: {
                    position: 'absolute',
                    bottom: '48px',
                    right: '36px',
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'radial-gradient(circle at 35% 30%, #ffd86b, #ff8a1e)',
                    color: '#5a2a00',
                    fontSize: '15px',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    boxShadow: '0 6px 18px rgba(255,138,30,0.45)',
                    cursor: 'pointer',
                    touchAction: 'none'
                }
            }
        ],
        joysticks: [
            {
                id: 'move-joystick',
                maxRadius: 60,
                styles: {
                    bottom: '40px',
                    left: '36px'
                },
                onInit: function (command) {
                    state.joystickCommand = command;
                    if (callbacks.onJoystickInit) {
                        callbacks.onJoystickInit(command);
                    }
                }
            }
        ],
        introOverlays: [
            {
                id: 'intro-overlay',
                visible: true,
                title: 'HUNGRY SHARK',
                subtitle: 'Eat everything. Avoid the mines. Survive!',
                buttonText: 'PLAY',
                styles: {
                    overlay: { background: 'rgba(4, 34, 63, 0.92)' },
                    title: {
                        fontSize: '38px',
                        fontWeight: '900',
                        margin: '0 0 10px 0',
                        color: '#ffd24a',
                        textShadow: '0 3px 14px rgba(0,0,0,0.5)'
                    },
                    subtitle: { fontSize: '15px', opacity: '0.85', maxWidth: '300px' },
                    button: {
                        marginTop: '26px',
                        padding: '16px 52px',
                        background: 'linear-gradient(135deg, #2bd4ff, #1e8bff)',
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: '800',
                        borderRadius: '999px'
                    }
                },
                onPrimaryClick: function () {
                    if (state.ui.introOverlay) { state.ui.introOverlay.hide(); }
                    if (callbacks.onPlay) { callbacks.onPlay(); }
                }
            },
            {
                id: 'gameover-overlay',
                visible: false,
                title: 'GAME OVER',
                subtitle: 'Final Score 0',
                buttonText: 'PLAY AGAIN',
                styles: {
                    overlay: { background: 'rgba(4, 34, 63, 0.92)', animation: 'fadeIn 0.4s ease-out' },
                    title: {
                        fontSize: '36px',
                        fontWeight: '900',
                        margin: '0 0 8px 0',
                        color: '#ff6b5a'
                    },
                    subtitle: { fontSize: '26px', fontWeight: '800', margin: '14px 0' },
                    button: {
                        marginTop: '24px',
                        padding: '14px 44px',
                        background: 'linear-gradient(135deg, #ffd24a, #ff9f1e)',
                        color: '#5a2a00',
                        fontSize: '16px',
                        fontWeight: '800',
                        borderRadius: '999px'
                    }
                },
                onPrimaryClick: function () {
                    if (callbacks.onRestart) { callbacks.onRestart(); }
                }
            },
            {
                id: 'cta-overlay',
                visible: false,
                title: 'LOVING THE HUNT?',
                subtitle: 'Install now and rule the ocean!',
                buttonText: 'DOWNLOAD',
                styles: {
                    overlay: { background: 'rgba(4, 34, 63, 0.88)', animation: 'fadeIn 0.4s ease-out' },
                    title: { fontSize: '32px', fontWeight: '900', color: '#ffd24a', margin: '0 0 10px 0' },
                    subtitle: { fontSize: '16px', opacity: '0.9' },
                    button: {
                        marginTop: '24px',
                        padding: '16px 54px',
                        background: 'linear-gradient(135deg, #36e07a, #18b85a)',
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: '800',
                        borderRadius: '999px',
                        animation: 'ctaPulse 1.2s ease-in-out infinite'
                    }
                },
                onPrimaryClick: function () {
                    if (callbacks.onCta) { callbacks.onCta(); }
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.ui = {
        scoreDisplay: uiScene.getByConfigId('score-display'),
        healthBar: uiScene.getByConfigId('health-bar'),
        hungerBar: uiScene.getByConfigId('hunger-bar'),
        boostBar: uiScene.getByConfigId('boost-bar'),
        goldRushBar: uiScene.getByConfigId('goldrush-bar'),
        boostButton: uiScene.getByConfigId('boost-button'),
        joystick: uiScene.getByConfigId('move-joystick'),
        introOverlay: uiScene.getByConfigId('intro-overlay'),
        gameOverOverlay: uiScene.getByConfigId('gameover-overlay'),
        ctaOverlay: uiScene.getByConfigId('cta-overlay')
    };

    // recolor bar fills
    setFillColor(state.ui.healthBar, '#ff4d4d');
    setFillColor(state.ui.hungerBar, '#ffb031');
    setFillColor(state.ui.boostBar, '#33d6ff');
    setFillColor(state.ui.goldRushBar, '#ffd24a');
}

function setFillColor(bar, color) {
    if (bar && bar.fill) {
        bar.fill.style.backgroundColor = color;
    }
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

export function updateHud(state) {
    if (state.ui.healthBar) { state.ui.healthBar.setValue(state.health); }
    if (state.ui.hungerBar) { state.ui.hungerBar.setValue(state.hunger); }
    if (state.ui.boostBar) { state.ui.boostBar.setValue(state.boost); }

    if (state.ui.goldRushBar) {
        var gr = getGoldRushDisplay(state);
        state.ui.goldRushBar.setMax(gr.max);
        state.ui.goldRushBar.setValue(gr.value);
        setFillColor(state.ui.goldRushBar, gr.active ? '#fff27a' : '#ffd24a');
    }
}

export function showGameOver(state) {
    if (state.ui.gameOverOverlay) {
        state.ui.gameOverOverlay.setSubtitle('Final Score ' + state.score);
        state.ui.gameOverOverlay.show();
    }
}

export function showCta(state) {
    if (state.ui.ctaOverlay) {
        state.ui.ctaOverlay.show();
    }
}
