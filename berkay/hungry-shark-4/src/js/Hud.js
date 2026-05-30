import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

export function buildHud(state, onResetGame) {
    var gameOverClickHandler = function() {
        onResetGame();
    };

    var uiScene = new UIScene({
        progressBars: [
            {
                id: 'health-bar',
                initialValue: state.shark.maxHealth,
                max: state.shark.maxHealth,
                showText: false,
                styles: {
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    width: '140px',
                    height: '20px',
                    zIndex: '5'
                }
            },
            {
                id: 'hunger-bar',
                initialValue: state.shark.maxHunger,
                max: state.shark.maxHunger,
                showText: false,
                styles: {
                    position: 'absolute',
                    top: '44px',
                    left: '16px',
                    width: '140px',
                    height: '20px',
                    zIndex: '5'
                }
            },
            {
                id: 'goldRush-bar',
                initialValue: 0,
                max: 100,
                showText: false,
                styles: {
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '200px',
                    height: '16px',
                    zIndex: '5'
                }
            }
        ],
        scoreDisplays: [
            {
                id: 'score-display',
                label: 'Score',
                initialValue: 0,
                styles: {
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ffffff',
                    fontSize: '28px',
                    fontWeight: '800',
                    letterSpacing: '0.04em',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    zIndex: '6'
                }
            }
        ],
        introOverlays: [
            {
                id: 'intro-overlay',
                visible: true,
                title: 'Hungry Shark',
                subtitle: 'Eat to survive!',
                buttonText: 'Play',
                onPrimaryClick: function() {
                    uiScene.getByConfigId('intro-overlay').hide();
                    state.hasUserInteracted = true;
                },
                styles: {
                    overlay: {
                        background: 'rgba(10, 14, 39, 0.9)'
                    },
                    title: {
                        fontSize: '48px',
                        color: '#4ecdc4'
                    },
                    subtitle: {
                        fontSize: '20px',
                        color: '#aaaaaa'
                    },
                    button: {
                        background: 'linear-gradient(135deg, #4ecdc4, #44af89)',
                        color: '#ffffff',
                        fontSize: '20px',
                        padding: '12px 32px'
                    }
                }
            },
            {
                id: 'game-over-overlay',
                visible: false,
                title: 'Game Over',
                subtitle: 'Final Score: 0',
                buttonText: 'Restart',
                onPrimaryClick: gameOverClickHandler,
                styles: {
                    overlay: {
                        background: 'rgba(10, 14, 39, 0.95)'
                    },
                    title: {
                        fontSize: '48px',
                        color: '#ff6b6b'
                    },
                    subtitle: {
                        fontSize: '24px',
                        color: '#ffffff'
                    },
                    button: {
                        background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
                        color: '#ffffff',
                        fontSize: '20px',
                        padding: '12px 32px'
                    }
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.ui.healthBar = uiScene.getByConfigId('health-bar');
    state.ui.hungerBar = uiScene.getByConfigId('hunger-bar');
    state.ui.goldRushBar = uiScene.getByConfigId('goldRush-bar');
    state.ui.scoreDisplay = uiScene.getByConfigId('score-display');
    state.ui.introOverlay = uiScene.getByConfigId('intro-overlay');
    state.ui.gameOverOverlay = uiScene.getByConfigId('game-over-overlay');
}

export function updateHealthDisplay(state) {
    if (state.ui.healthBar) {
        state.ui.healthBar.setValue(state.shark.health);
    }
}

export function showGameOver(state) {
    state.gameOver = true;
    if (state.ui.gameOverOverlay) {
        state.ui.gameOverOverlay.setSubtitle('Final Score: ' + state.score);
        state.ui.gameOverOverlay.show();
    }
}
