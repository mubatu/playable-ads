import { UIScene } from '../../../../../../reusables/UIScene/UIScene.js';
import { clearParticles } from './ParticleFX.js';

var BEST_SCORE_KEY = 'block-blast-2.bestScore';
var LINES_PER_LEVEL = 10;

function readBestScore() {
    try {
        var raw = window.localStorage.getItem(BEST_SCORE_KEY);
        var parsed = raw ? parseInt(raw, 10) : 0;
        return isNaN(parsed) ? 0 : parsed;
    } catch (err) {
        return 0;
    }
}

function writeBestScore(value) {
    try {
        window.localStorage.setItem(BEST_SCORE_KEY, String(value));
    } catch (err) {
        /* ignore (private mode etc.) */
    }
}

function createScoreDom(state) {
    var wrapper = document.createElement('div');
    wrapper.id = 'bb2-score';

    var label = document.createElement('span');
    label.className = 'label';
    label.textContent = 'Score';

    var value = document.createElement('span');
    value.className = 'value';
    value.textContent = '0';

    wrapper.appendChild(label);
    wrapper.appendChild(value);
    document.body.appendChild(wrapper);

    var bestWrapper = document.createElement('div');
    bestWrapper.id = 'bb2-best';
    bestWrapper.textContent = 'Best';

    var bestValue = document.createElement('span');
    bestValue.textContent = String(state.bestScore);

    bestWrapper.appendChild(bestValue);
    document.body.appendChild(bestWrapper);

    return {
        wrapper: wrapper,
        valueEl: value,
        bestEl: bestValue
    };
}

function popScore(state, points, isCombo) {
    var anchor = state.ui.scoreEl ? state.ui.scoreEl.wrapper : null;
    var popup = document.createElement('div');

    popup.className = 'bb2-score-popup' + (isCombo ? ' combo' : '');
    popup.textContent = (isCombo ? 'COMBO! +' : '+') + points;

    if (anchor) {
        var rect = anchor.getBoundingClientRect();
        popup.style.left = (rect.left + rect.width / 2) + 'px';
        popup.style.top = (rect.bottom + 4) + 'px';
    } else {
        popup.style.left = '50%';
        popup.style.top = '70px';
    }

    document.body.appendChild(popup);

    window.setTimeout(function () {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 900);
}

export function addScore(state, points, linesCleared) {
    state.score += points;

    if (state.ui.scoreEl) {
        state.ui.scoreEl.valueEl.textContent = String(state.score);
    }

    if (state.score > state.bestScore) {
        state.bestScore = state.score;
        writeBestScore(state.bestScore);

        if (state.ui.scoreEl) {
            state.ui.scoreEl.bestEl.textContent = String(state.bestScore);
        }
    }

    if (state.ui.progressBar) {
        var levelLines = state.linesCleared % LINES_PER_LEVEL;
        state.ui.progressBar.setValue(levelLines);
    }

    if (points > 0) {
        popScore(state, points, linesCleared && linesCleared > 1);
    }
}

export function refreshScoreDisplay(state) {
    if (state.ui.scoreEl) {
        state.ui.scoreEl.valueEl.textContent = String(state.score);
        state.ui.scoreEl.bestEl.textContent = String(state.bestScore);
    }

    if (state.ui.progressBar) {
        state.ui.progressBar.setValue(state.linesCleared % LINES_PER_LEVEL);
    }
}

export function showGameOver(state) {
    if (state.gameOver) {
        return;
    }

    state.gameOver = true;

    var overlay = document.createElement('div');
    overlay.id = 'bb2-game-over';

    var title = document.createElement('h1');
    title.textContent = 'Game Over!';

    var stats = document.createElement('div');
    stats.className = 'stats';

    var scoreCell = document.createElement('div');
    var scoreLabel = document.createElement('span');
    scoreLabel.className = 'stat-label';
    scoreLabel.textContent = 'Score';
    var scoreValue = document.createElement('span');
    scoreValue.className = 'stat-value';
    scoreValue.textContent = String(state.score);
    scoreCell.appendChild(scoreLabel);
    scoreCell.appendChild(scoreValue);

    var bestCell = document.createElement('div');
    var bestLabel = document.createElement('span');
    bestLabel.className = 'stat-label';
    bestLabel.textContent = 'Best';
    var bestValue = document.createElement('span');
    bestValue.className = 'stat-value';
    bestValue.textContent = String(state.bestScore);
    bestCell.appendChild(bestLabel);
    bestCell.appendChild(bestValue);

    stats.appendChild(scoreCell);
    stats.appendChild(bestCell);

    var button = document.createElement('button');
    button.textContent = 'PLAY AGAIN';
    button.addEventListener('click', function () {
        overlay.remove();

        if (state.onReset) {
            state.onReset();
        }
    });

    overlay.appendChild(title);
    overlay.appendChild(stats);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
}

function getUiElement(uiScene, id) {
    return uiScene.getByConfigId ? uiScene.getByConfigId(id) : null;
}

export function buildHud(state, onResetGame) {
    state.bestScore = readBestScore();
    state.ui.scoreEl = createScoreDom(state);

    var uiScene = new UIScene({
        progressBars: [
            {
                id: 'bb2-line-progress',
                initialValue: 0,
                max: LINES_PER_LEVEL,
                textFormat: function (value, max) {
                    return value + ' / ' + max + ' lines';
                },
                styles: {
                    top: '74px',
                    left: '24px',
                    right: '24px'
                }
            }
        ],
        toggles: [
            {
                id: 'bb2-fx-toggle',
                initialState: true,
                labels: {
                    on: 'FX',
                    off: 'FX'
                },
                styles: {
                    top: '110px',
                    right: '20px'
                },
                onToggle: function (isOn) {
                    state.fxEnabled = isOn;

                    if (!isOn) {
                        clearParticles(state);
                    }
                }
            }
        ],
        buttons: [
            {
                id: 'bb2-restart-button',
                text: 'Restart',
                styles: {
                    position: 'absolute',
                    top: '110px',
                    left: '20px',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #ffe18f 0%, #ff7e8b 100%)',
                    color: '#21072c',
                    fontSize: '12px',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    boxShadow: '0 6px 14px rgba(255, 126, 139, 0.35)',
                    cursor: 'pointer'
                },
                onClick: function () {
                    onResetGame();
                }
            }
        ]
    });

    var progressBar = getUiElement(uiScene, 'bb2-line-progress');
    var fxToggle = getUiElement(uiScene, 'bb2-fx-toggle');

    if (progressBar) {
        progressBar.containerDiv.style.height = '10px';
        progressBar.containerDiv.style.borderRadius = '999px';
        progressBar.containerDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
        progressBar.fill.style.background = 'linear-gradient(90deg, #ffe18f 0%, #ff7e8b 100%)';
        progressBar.fill.style.borderRadius = '999px';
        progressBar.text.style.fontSize = '10px';
        progressBar.text.style.fontWeight = '700';
        progressBar.text.style.letterSpacing = '0.08em';
        progressBar.text.style.textTransform = 'uppercase';
    }

    if (fxToggle) {
        fxToggle.track.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        fxToggle.label.style.fontSize = '11px';
        fxToggle.label.style.fontWeight = '700';
        fxToggle.label.style.letterSpacing = '0.12em';
        fxToggle.label.style.textTransform = 'uppercase';
    }

    state.uiScene = uiScene;
    state.ui.progressBar = progressBar;
    state.ui.fxToggle = fxToggle;
    state.ui.restartButton = getUiElement(uiScene, 'bb2-restart-button');
    state.onReset = onResetGame;
}
