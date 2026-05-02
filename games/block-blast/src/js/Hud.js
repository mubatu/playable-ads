import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

var scoreEl = null;
var scoreValueEl = null;

function createScoreDisplay() {
    scoreEl = document.createElement('div');
    scoreEl.id = 'score-display';

    var label = document.createElement('span');
    label.className = 'label';
    label.textContent = 'Score';

    scoreValueEl = document.createElement('span');
    scoreValueEl.textContent = '0';

    scoreEl.appendChild(label);
    scoreEl.appendChild(scoreValueEl);
    document.body.appendChild(scoreEl);
}

function showScorePopup(points) {
    var popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + points;

    if (scoreEl) {
        var rect = scoreEl.getBoundingClientRect();
        popup.style.left = rect.left + rect.width / 2 + 'px';
        popup.style.top = rect.bottom + 'px';
        popup.style.transform = 'translateX(-50%)';
    } else {
        popup.style.left = '50%';
        popup.style.top = '60px';
        popup.style.transform = 'translateX(-50%)';
    }

    document.body.appendChild(popup);

    setTimeout(function () {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 900);
}

export function addScore(state, points) {
    state.score += points;

    if (scoreValueEl) {
        scoreValueEl.textContent = String(state.score);
    }

    if (points > 0) {
        showScorePopup(points);
    }
}

export function refreshScoreDisplay(state) {
    if (scoreValueEl) {
        scoreValueEl.textContent = String(state.score);
    }
}

export function showGameOver(state) {
    state.gameOver = true;

    var overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';

    var content = document.createElement('div');
    content.className = 'game-over-content';

    var title = document.createElement('h1');
    title.textContent = 'Game Over!';

    var scoreDiv = document.createElement('div');
    scoreDiv.className = 'final-score';

    var scoreLabel = document.createElement('span');
    scoreLabel.className = 'label';
    scoreLabel.textContent = 'Final Score';

    var scoreValue = document.createElement('span');
    scoreValue.textContent = String(state.score);

    scoreDiv.appendChild(scoreLabel);
    scoreDiv.appendChild(scoreValue);

    var button = document.createElement('button');
    button.textContent = 'Play Again';
    button.addEventListener('click', function () {
        overlay.remove();
        if (state.onReset) {
            state.onReset();
        }
    });

    content.appendChild(title);
    content.appendChild(scoreDiv);
    content.appendChild(button);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

export function buildHud(state, onResetGame) {
    createScoreDisplay();

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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
                    cursor: 'pointer'
                },
                onClick: function () {
                    onResetGame();
                }
            }
        ]
    });

    state.uiScene = uiScene;
    state.onReset = onResetGame;
}
