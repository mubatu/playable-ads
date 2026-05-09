import { UIScene } from '../../../../../../reusables/UIScene/UIScene.js';
import { GAME_STATUS } from './GameState.js';

export function buildHud(state, onRestart) {
    var uiSettings = {
        progressBars: [
            {
                id: 'progress',
                initialValue: 0,
                max: state.config.gameplay.winConditionClears,
                textFormat: (value, max) => value + ' / ' + max,
                styles: {
                    top: '10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%'
                }
            }
        ],
        introOverlays: [
            {
                id: 'win-overlay',
                title: 'YOU WIN!',
                buttonText: 'PLAY AGAIN',
                onPrimaryClick: onRestart,
                visible: false
            },
            {
                id: 'lose-overlay',
                title: 'GAME OVER',
                buttonText: 'TRY AGAIN',
                onPrimaryClick: onRestart,
                visible: false
            }
        ]
    };

    state.uiScene = new UIScene(uiSettings);

    // UIIntroOverlay handles button binding via onPrimaryClick
}

export function updateHud(state) {
    if (!state.uiScene) return;

    var progressBar = state.uiScene.getByConfigId('progress');
    if (progressBar) {
        progressBar.setValue(state.clears);
        progressBar.setMax(state.config.gameplay.winConditionClears);
    }

    var winOverlay = state.uiScene.getByConfigId('win-overlay');
    var loseOverlay = state.uiScene.getByConfigId('lose-overlay');

    if (state.status === GAME_STATUS.WIN) {
        if (winOverlay) winOverlay.show();
    } else if (state.status === GAME_STATUS.GAME_OVER) {
        if (loseOverlay) loseOverlay.show();
    } else {
        if (winOverlay) winOverlay.hide();
        if (loseOverlay) loseOverlay.hide();
    }
}
