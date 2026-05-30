import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

export function buildHud(state, onReset) {
    const uiScene = new UIScene({
        scoreDisplays: [
            {
                id: 'score-display',
                label: 'Score',
                initialValue: 0,
                styles: {
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ffffff',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                    zIndex: '10'
                }
            },
            {
                id: 'timer-display',
                label: 'Time',
                initialValue: state.gameDuration,
                styles: {
                    top: '20px',
                    right: '20px',
                    color: '#ffffff',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                    zIndex: '10'
                }
            }
        ],
        joysticks: [
            {
                id: 'movement-joystick',
                maxRadius: state.config.joystick.maxRadius,
                styles: {
                    position: 'fixed',
                    bottom: state.config.joystick.position.bottom,
                    left: state.config.joystick.position.left,
                    zIndex: '5'
                },
                onInit(command) {
                    state.joystickCommand = command;
                }
            }
        ],
        introOverlays: [
            {
                id: 'end-overlay',
                visible: false,
                title: "Time's Up!",
                subtitle: 'Final Score: 0',
                buttonText: 'Play Again',
                onPrimaryClick: onReset,
                styles: {
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        zIndex: '20'
                    },
                    title: {
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#ffffff'
                    },
                    subtitle: {
                        fontSize: '36px',
                        color: '#FFD700'
                    }
                }
            }
        ]
    });

    state.ui.scoreDisplay = uiScene.getByConfigId('score-display');
    state.ui.timerDisplay = uiScene.getByConfigId('timer-display');
    state.ui.joystick = uiScene.getByConfigId('movement-joystick');
    state.ui.endOverlay = uiScene.getByConfigId('end-overlay');
    state.uiScene = uiScene;

    return uiScene;
}

export function updateTimer(state, delta) {
    state.gameTime += delta;

    if (state.ui.timerDisplay) {
        const remainingTime = Math.max(0, state.gameDuration - state.gameTime);
        state.ui.timerDisplay.setValue(Math.ceil(remainingTime));
    }
}

export function updateScore(state, points) {
    state.score += points;
    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(state.score);
        if (points > 0) {
            state.ui.scoreDisplay.showPopup('+' + points);
        }
    }
}

export function showEndScreen(state) {
    if (state.ui.endOverlay) {
        state.ui.endOverlay.setSubtitle('Final Score: ' + state.score);
        state.ui.endOverlay.show();
    }
}

export function resetHud(state) {
    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(0);
    }
    if (state.ui.timerDisplay) {
        state.ui.timerDisplay.setValue(state.gameDuration);
    }
    if (state.ui.endOverlay) {
        state.ui.endOverlay.hide();
    }
}
