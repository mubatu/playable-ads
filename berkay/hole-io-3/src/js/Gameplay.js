import { growHole } from './Hole.js';
import { checkCollisions } from './Environment.js';
import { spawnConsumptionParticles } from './ParticleFX.js';
import { formatTime } from './GameState.js';

var GROWTH_BY_CATEGORY = {
    small:  'growthSmall',
    medium: 'growthMedium',
    large:  'growthLarge'
};

export function updateGameTime(state, delta) {
    if (state.gameOver) return;

    state.gameTime += delta;

    var timeLeft = Math.max(0, state.config.game.duration - state.gameTime);

    if (state.ui.timerEl) {
        state.ui.timerEl.textContent = formatTime(timeLeft);
    }

    if (state.tutorialActive && state.gameTime >= state.config.game.tutorialDuration) {
        state.tutorialActive = false;
        if (state.tutorial) {
            state.tutorial.stop();
        }
    }

    if (state.gameTime >= state.config.game.duration && !state.gameOver) {
        endGame(state);
    }
}

export function endGame(state) {
    state.gameOver = true;

    if (state.ui.gameOverOverlay) {
        state.ui.gameOverOverlay.setSubtitle('Score: ' + state.score);
        state.ui.gameOverOverlay.show();
    }
}

export function addScore(state, points) {
    state.score += points;

    if (state.ui.scoreDisplay) {
        state.ui.scoreDisplay.setValue(state.score);
        if (points > 0) {
            state.ui.scoreDisplay.showPopup('+' + points);
        }
    }
}

export function updatePlayerMovement(state, delta) {
    if (!state.playerHole || state.gameOver) return;

    var cmd = state.moveCommand;
    var len = Math.sqrt(cmd.x * cmd.x + cmd.y * cmd.y);

    if (len < 0.05) return;

    // Dismiss tutorial on first move
    if (!state.hasUserInteracted && len > 0.1) {
        state.hasUserInteracted = true;
        if (state.tutorial) {
            state.tutorial.stop();
        }
    }

    var nx = cmd.x / len;
    var nz = cmd.y / len;
    var speed = state.config.player.moveSpeed;
    var ws = state.config.game.worldSize;

    state.playerHole.position.x += nx * speed * delta;
    state.playerHole.position.z += nz * speed * delta;

    // Clamp to world bounds
    state.playerHole.position.x = Math.max(-ws, Math.min(ws, state.playerHole.position.x));
    state.playerHole.position.z = Math.max(-ws, Math.min(ws, state.playerHole.position.z));
}

export function updateCamera(state, delta) {
    var camera = state.camera;
    var cfg = state.config.camera;
    var holeDiameter = state.playerHole.userData.diameter;

    var extraHeight = holeDiameter * cfg.zoomPerUnit;
    var tx = state.playerHole.position.x;
    var ty = cfg.baseHeight + extraHeight;
    var tz = state.playerHole.position.z + cfg.baseOffset + extraHeight * 0.5;

    var speed = cfg.followSpeed;
    camera.position.x += (tx - camera.position.x) * speed;
    camera.position.y += (ty - camera.position.y) * speed;
    camera.position.z += (tz - camera.position.z) * speed;

    camera.lookAt(state.playerHole.position.x, 0, state.playerHole.position.z);
}

export function processCollisions(state) {
    var consumed = checkCollisions(state);
    var playerCfg = state.config.player;

    consumed.forEach(function (item) {
        var growthKey = GROWTH_BY_CATEGORY[item.category] || 'growthSmall';
        var growthAmount = playerCfg[growthKey] || 0.15;
        growHole(state.playerHole, growthAmount);
        addScore(state, item.score);
        spawnConsumptionParticles(state, item.position, 10);
    });
}
