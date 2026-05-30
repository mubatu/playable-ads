import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

function percent(value, max) {
    return Math.round((value / max) * 100) + '%';
}

function getUiElement(uiScene, id) {
    return uiScene.getByConfigId(id);
}

export function buildHud(state, onResetGame) {
    var config = state.config;
    var uiScene = new UIScene({
        progressBars: [
            createBarConfig('health-bar', 14, 'HP', config.health.max, state.health, '#e74c3c'),
            createBarConfig('hunger-bar', 44, 'HUNGER', config.hunger.max, state.hunger, '#f39c12'),
            createBarConfig('boost-bar', 74, 'BOOST', 100, state.boostEnergy, '#3498db'),
            createBarConfig('gold-bar', 104, 'GOLD', config.goldRush.threshold, state.goldRushMeter, '#f1c40f')
        ],
        scoreDisplays: [
            {
                id: 'score-display',
                label: 'Score',
                initialValue: 0,
                styles: {
                    top: '18px',
                    right: '18px',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: '900',
                    textShadow: '0 2px 8px rgba(0,0,0,0.55)',
                    zIndex: '8'
                },
                labelStyles: {
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    opacity: '0.8'
                }
            },
            {
                id: 'coin-display',
                label: 'Coins',
                initialValue: 0,
                styles: {
                    top: '76px',
                    right: '18px',
                    color: '#ffd700',
                    fontSize: '18px',
                    fontWeight: '900',
                    textShadow: '0 2px 8px rgba(0,0,0,0.55)',
                    zIndex: '8'
                },
                labelStyles: {
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    opacity: '0.8'
                }
            }
        ],
        joysticks: [
            {
                id: 'movement-joystick',
                maxRadius: 58,
                styles: {
                    left: '24px',
                    bottom: '34px',
                    background: 'rgba(255,255,255,0.14)',
                    border: '2px solid rgba(255,255,255,0.35)',
                    zIndex: '20'
                },
                onInit: function (command) {
                    state.moveCommand = command;
                }
            }
        ],
        buttons: [
            {
                id: 'boost-button',
                text: 'BOOST',
                styles: {
                    position: 'absolute',
                    right: '22px',
                    bottom: '42px',
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    border: '3px solid rgba(52,152,219,0.75)',
                    background: 'rgba(52,152,219,0.32)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    zIndex: '20',
                    touchAction: 'none'
                }
            },
            {
                id: 'restart-button',
                text: 'Restart',
                styles: {
                    position: 'absolute',
                    top: '136px',
                    right: '18px',
                    padding: '9px 15px',
                    border: 'none',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.18)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    zIndex: '8'
                },
                onClick: function () {
                    onResetGame();
                }
            }
        ],
        introOverlays: [
            createOverlayConfig('game-over-overlay', false, 'You Went Hungry', 'Final Score 0', 'Play Again', function () {
                onResetGame();
            }),
            createOverlayConfig('cta-overlay', false, 'Hungry For More?', 'Download the full shark feeding frenzy.', 'DOWNLOAD NOW', function () {
                window.open('https://play.google.com/store', '_blank');
            })
        ]
    });

    state.uiScene = uiScene;
    state.ui = {
        healthBar: getUiElement(uiScene, 'health-bar'),
        hungerBar: getUiElement(uiScene, 'hunger-bar'),
        boostBar: getUiElement(uiScene, 'boost-bar'),
        goldBar: getUiElement(uiScene, 'gold-bar'),
        scoreDisplay: getUiElement(uiScene, 'score-display'),
        coinDisplay: getUiElement(uiScene, 'coin-display'),
        boostButton: getUiElement(uiScene, 'boost-button'),
        joystick: getUiElement(uiScene, 'movement-joystick'),
        gameOverOverlay: getUiElement(uiScene, 'game-over-overlay'),
        ctaOverlay: getUiElement(uiScene, 'cta-overlay')
    };
}

export function updateHud(state) {
    var ui = state.ui;
    var config = state.config;

    setBar(ui.healthBar, state.health, '#e74c3c');
    setBar(ui.hungerBar, state.hunger, state.hunger < 22 ? '#e74c3c' : '#f39c12');
    setBar(ui.boostBar, state.boostEnergy, '#3498db');

    if (ui.goldBar) {
        ui.goldBar.setMax(state.isGoldRush ? config.goldRush.duration : config.goldRush.threshold);
        ui.goldBar.setValue(state.isGoldRush ? state.goldRushTimer : state.goldRushMeter);
        ui.goldBar.fill.style.background = state.isGoldRush
            ? 'linear-gradient(90deg, #fff3a3, #ff8f00)'
            : '#f1c40f';
    }
    if (ui.scoreDisplay) {
        ui.scoreDisplay.setValue(state.score);
    }
    if (ui.coinDisplay) {
        ui.coinDisplay.setValue(state.coins);
    }
}

export function showGameOver(state) {
    if (state.ui.gameOverOverlay) {
        state.ui.gameOverOverlay.setSubtitle('Final Score ' + state.score + ' | Coins ' + state.coins);
        state.ui.gameOverOverlay.show();
    }
}

export function showCta(state) {
    if (state.ui.ctaOverlay) {
        state.ui.ctaOverlay.show();
    }
}

export function hideOverlays(state) {
    if (state.ui.gameOverOverlay) {
        state.ui.gameOverOverlay.hide();
    }
    if (state.ui.ctaOverlay) {
        state.ui.ctaOverlay.hide();
    }
}

function setBar(bar, value, color) {
    if (bar) {
        bar.setValue(value);
        if (bar.fill && color) {
            bar.fill.style.background = color;
        }
    }
}

function createBarConfig(id, top, label, max, initialValue) {
    return {
        id: id,
        initialValue: initialValue,
        max: max,
        textFormat: function (value, barMax) {
            return label + ' ' + percent(value, barMax);
        },
        styles: {
            top: top + 'px',
            left: '14px',
            width: '52%',
            height: '18px',
            zIndex: '8'
        },
        showText: true
    };
}

function createOverlayConfig(id, visible, title, subtitle, buttonText, onPrimaryClick) {
    return {
        id: id,
        visible: visible,
        title: title,
        subtitle: subtitle,
        buttonText: buttonText,
        styles: {
            overlay: {
                background: 'rgba(4, 12, 26, 0.84)'
            },
            title: {
                margin: '0',
                fontSize: '38px',
                fontWeight: '900',
                color: '#ffffff',
                textShadow: '0 0 22px rgba(77,184,204,0.8)'
            },
            subtitle: {
                fontSize: '17px',
                maxWidth: '300px'
            },
            button: {
                background: 'linear-gradient(180deg, #ff9a2f 0%, #ff4d2e 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 22px rgba(255,90,30,0.45)'
            }
        },
        onPrimaryClick: onPrimaryClick
    };
}
