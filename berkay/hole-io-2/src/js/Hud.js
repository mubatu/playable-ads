import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

export function buildHud(state, onResetGame) {
  const uiScene = new UIScene({
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
          fontSize: '24px',
          fontWeight: '800',
          letterSpacing: '0.04em',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          zIndex: '6'
        },
        labelStyles: {
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          opacity: '0.7',
          marginBottom: '2px'
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
          padding: '10px 18px',
          border: 'none',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: '700',
          boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
          cursor: 'pointer',
          zIndex: '6'
        },
        onClick: function () {
          onResetGame();
        }
      }
    ],
    progressBars: [
      {
        id: 'timer-display',
        initialValue: state.config.game.duration,
        max: state.config.game.duration,
        showText: true,
        textFormat: (value) => {
          const sec = Math.ceil(value);
          return sec + 's';
        },
        styles: {
          position: 'absolute',
          top: '20px',
          right: '110px',
          width: '70px',
          height: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          zIndex: '6'
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          },
          title: {
            fontSize: '36px',
            color: '#ffffff',
            marginBottom: '20px'
          },
          subtitle: {
            fontSize: '24px',
            color: '#ffff00',
            marginBottom: '30px'
          },
          button: {
            marginRight: '20px',
            marginBottom: '10px'
          }
        }
      }
    ]
  });

  state.uiScene = uiScene;
  state.ui.scoreDisplay = uiScene.getByConfigId('score-display');
  state.ui.timerDisplay = uiScene.getByConfigId('timer-display');
  state.ui.restartButton = uiScene.getByConfigId('restart-button');
  state.ui.joystick = uiScene.getByConfigId('movement-joystick');
  state.ui.gameOverOverlay = uiScene.getByConfigId('game-over');

  // Add download button to the overlay
  const overlay = state.ui.gameOverOverlay;
  if (overlay && overlay.element) {
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Now';
    downloadBtn.style.cssText = `
      padding: 12px 24px;
      border: none;
      borderRadius: 8px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e72 100%);
      color: white;
      fontSize: 16px;
      fontWeight: 700;
      cursor: pointer;
      marginLeft: 20px;
      boxShadow: 0 4px 14px rgba(255, 107, 107, 0.3);
    `;
    downloadBtn.addEventListener('click', () => {
      window.location.href = 'https://google.com';
    });

    // Find the button container and add the download button next to play again
    const buttonContainer = overlay.element.querySelector('[style*="display: flex"]') || overlay.element;
    if (buttonContainer && overlay.element.lastChild) {
      overlay.element.insertBefore(downloadBtn, overlay.element.lastChild);
    }
  }

  return uiScene;
}

export function refreshScoreDisplay(state) {
  if (state.ui.scoreDisplay) {
    state.ui.scoreDisplay.setValue(state.score);
  }
}

export function showGameOver(state) {
  state.gameOver = true;

  if (state.ui.gameOverOverlay) {
    state.ui.gameOverOverlay.setSubtitle('Score: ' + state.score);
    state.ui.gameOverOverlay.show();
  }
}
