import { UIScene } from '../../../../../../reusables/UIScene/UIScene.js';
import { clearParticles } from './ParticleFX.js';

var scoreEl = null;
var scoreValueEl = null;

function createScoreDisplay() {
    if (scoreEl && scoreEl.parentNode) {
        return;
    }

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

function countFilledCells(state) {
    var filled = 0;
    var row;
    var col;

    for (row = 0; row < state.grid.length; row += 1) {
        for (col = 0; col < state.grid[row].length; col += 1) {
            if (state.grid[row][col] !== null) {
                filled += 1;
            }
        }
    }

    return filled;
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

    refreshScoreDisplay(state);

    if (points > 0) {
        showScorePopup(points);
    }
}

export function refreshScoreDisplay(state) {
    if (scoreValueEl) {
        scoreValueEl.textContent = String(state.score);
    }
}

export function refreshBoardMeter(state) {
    var totalCells = state.config.board.rows * state.config.board.columns;

    if (state.ui && state.ui.boardMeter) {
        state.ui.boardMeter.setValue(countFilledCells(state));
        state.ui.boardMeter.setMax(totalCells);
    }
}

export function showGameOver(state) {
    var existingOverlay = document.getElementById('game-over-overlay');

    if (existingOverlay) {
        return;
    }

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
        progressBars: [
            {
                id: 'board-space-meter',
                initialValue: 0,
                max: state.config.board.rows * state.config.board.columns,
                textFormat: function (value, max) {
                    return 'Board ' + value + '/' + max;
                },
                styles: {
                    top: '72px',
                    left: '22px',
                    right: '22px'
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
                    background: 'linear-gradient(135deg, #ffd34d 0%, #ff8a3d 100%)',
                    color: '#171722',
                    fontSize: '13px',
                    fontWeight: '800',
                    boxShadow: '0 8px 18px rgba(255, 138, 61, 0.25)',
                    cursor: 'pointer'
                },
                onClick: function () {
                    onResetGame();
                }
            }
        ],
        toggles: [
            {
                id: 'fx-toggle',
                initialState: true,
                labels: {
                    on: 'FX',
                    off: 'FX'
                },
                styles: {
                    bottom: '22px',
                    right: '22px'
                },
                onToggle: function (isOn) {
                    state.fxEnabled = isOn;

                    if (!isOn) {
                        clearParticles(state);
                    }
                }
            }
        ]
    });
    var boardMeter = uiScene.getByConfigId('board-space-meter');
    var toggle = uiScene.getByConfigId('fx-toggle');

    if (boardMeter) {
        boardMeter.containerDiv.style.height = '16px';
        boardMeter.containerDiv.style.borderRadius = '8px';
        boardMeter.containerDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
        boardMeter.containerDiv.style.boxShadow = 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)';
        boardMeter.fill.style.borderRadius = '8px';
        boardMeter.fill.style.background = 'linear-gradient(90deg, #1fc7b7 0%, #ffd34d 100%)';

        if (boardMeter.text) {
            boardMeter.text.style.zIndex = '1';
            boardMeter.text.style.fontSize = '12px';
            boardMeter.text.style.letterSpacing = '0';
        }
    }

    if (toggle) {
        toggle.track.style.backgroundColor = '#1fc7b7';
        toggle.track.style.boxShadow = '0 8px 18px rgba(31, 199, 183, 0.22)';
        toggle.label.style.fontWeight = '800';
        toggle.label.style.letterSpacing = '0';
        toggle.label.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.4)';
    }

    state.uiScene = uiScene;
    state.ui = {
        boardMeter: boardMeter,
        restartButton: uiScene.getByConfigId('restart-button'),
        fxToggle: toggle
    };
    state.onReset = onResetGame;
    refreshBoardMeter(state);
}
