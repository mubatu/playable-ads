import { UIScene } from '../../../../../../reusables/UIScene/UIScene.js';

function getUiElement(uiScene, id) {
    return uiScene.uiElements.find(function (element) {
        return element.config.id === id;
    }) || null;
}

export function refreshHud(state) {
    if (state.ui.scoreText) {
        state.ui.scoreText.innerHTML = 'Score: ' + state.score;
    }
}

export function buildHud(state, onResetBoard) {
    var uiScene = new UIScene({
        buttons: [
            {
                id: 'restart-button',
                text: 'Restart',
                styles: {
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    padding: '11px 18px',
                    border: 'none',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #ffe18f 0%, #ffad6d 100%)',
                    color: '#163647',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 10px 18px rgba(22, 54, 71, 0.18)'
                },
                onClick: function () {
                    var errorBanner = document.getElementById('error-banner');
                    if (errorBanner) errorBanner.hidden = true;
                    onResetBoard();
                }
            }
        ]
    });
    
    // Create a simple score text
    var scoreText = document.createElement('div');
    scoreText.style.position = 'absolute';
    scoreText.style.top = '24px';
    scoreText.style.left = '24px';
    scoreText.style.color = '#ffffff';
    scoreText.style.fontSize = '24px';
    scoreText.style.fontWeight = 'bold';
    scoreText.style.fontFamily = 'sans-serif';
    scoreText.innerHTML = 'Score: 0';
    uiScene.container.appendChild(scoreText);

    state.uiScene = uiScene;
    state.ui = {
        restartButton: getUiElement(uiScene, 'restart-button'),
        scoreText: scoreText
    };
}
