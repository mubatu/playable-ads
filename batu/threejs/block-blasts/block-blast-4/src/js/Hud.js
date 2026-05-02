import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

var gameOverOverlay = null;

export function buildHud(state, onRestart) {
    var uiScene = new UIScene({
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
                    background: 'linear-gradient(135deg, #ffe18f 0%, #ffad6d 100%)',
                    color: '#163647',
                    fontSize: '13px',
                    fontWeight: '700',
                    boxShadow: '0 8px 16px rgba(22, 54, 71, 0.22)',
                    cursor: 'pointer',
                    pointerEvents: 'all'
                },
                onClick: function () {
                    onRestart();
                }
            }
        ]
    });

    var scoreDiv = document.createElement('div');

    Object.assign(scoreDiv.style, {
        position: 'absolute',
        top: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#ffffff',
        fontSize: '32px',
        fontWeight: '900',
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'none',
        letterSpacing: '0.04em',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        minWidth: '80px'
    });

    scoreDiv.textContent = '0';
    uiScene.container.appendChild(scoreDiv);

    var labelDiv = document.createElement('div');

    Object.assign(labelDiv.style, {
        position: 'absolute',
        top: '56px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '11px',
        fontWeight: '600',
        pointerEvents: 'none',
        letterSpacing: '0.12em',
        fontFamily: 'Arial, sans-serif',
        textTransform: 'uppercase',
        textAlign: 'center'
    });

    labelDiv.textContent = 'SCORE';
    uiScene.container.appendChild(labelDiv);

    state.uiScene = uiScene;
    state.ui = {
        scoreDiv: scoreDiv,
        restartButton: uiScene.getByConfigId('restart-button')
    };
}

export function refreshScore(state) {
    if (state.ui && state.ui.scoreDiv) {
        state.ui.scoreDiv.textContent = String(state.score);
    }
}

export function showGameOver(state) {
    if (gameOverOverlay) {
        return;
    }

    gameOverOverlay = document.createElement('div');

    Object.assign(gameOverOverlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 10, 28, 0.82)',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        pointerEvents: 'all',
        zIndex: '20'
    });

    var title = document.createElement('div');

    Object.assign(title.style, {
        fontSize: '52px',
        fontWeight: '900',
        letterSpacing: '0.02em',
        marginBottom: '8px',
        textShadow: '0 4px 20px rgba(0,0,0,0.5)'
    });

    title.textContent = 'Game Over';

    var scoreLabel = document.createElement('div');

    Object.assign(scoreLabel.style, {
        fontSize: '22px',
        fontWeight: '700',
        color: '#ffe18f',
        marginBottom: '36px',
        letterSpacing: '0.04em'
    });

    scoreLabel.textContent = 'Score: ' + state.score;

    var playBtn = document.createElement('button');

    Object.assign(playBtn.style, {
        padding: '16px 40px',
        fontSize: '18px',
        fontWeight: '800',
        border: 'none',
        borderRadius: '999px',
        background: 'linear-gradient(135deg, #ffe18f 0%, #ffad6d 100%)',
        color: '#163647',
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(255, 150, 80, 0.45)',
        letterSpacing: '0.02em'
    });

    playBtn.textContent = 'Play Again';

    playBtn.addEventListener('click', function () {
        hideGameOver();

        if (state.onRestart) {
            state.onRestart();
        }
    });

    gameOverOverlay.appendChild(title);
    gameOverOverlay.appendChild(scoreLabel);
    gameOverOverlay.appendChild(playBtn);

    document.body.appendChild(gameOverOverlay);
}

export function hideGameOver() {
    if (gameOverOverlay) {
        gameOverOverlay.remove();
        gameOverOverlay = null;
    }
}
