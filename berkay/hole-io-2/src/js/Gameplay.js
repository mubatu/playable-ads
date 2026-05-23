export function addScore(state, points) {
  state.score += points;

  if (state.ui.scoreDisplay) {
    state.ui.scoreDisplay.setValue(state.score);
    if (points > 0) {
      state.ui.scoreDisplay.showPopup('+' + points);
    }
  }
}

export function updateGameTime(state, delta) {
  if (state.gameOver) return;

  state.gameTime += delta;

  // Update timer display
  if (state.ui.timerDisplay) {
    const timeLeft = Math.max(0, state.config.game.duration - state.gameTime);
    state.ui.timerDisplay.setValue(Math.ceil(timeLeft));
  }

  // Check if tutorial should end
  if (state.tutorialActive && state.gameTime >= state.config.game.tutorialDuration) {
    state.tutorialActive = false;
    if (state.tutorial) {
      state.tutorial.stop();
    }
  }

  // Check if game should end
  if (state.gameTime >= state.config.game.duration) {
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

export function updatePlayerMovement(state, delta) {
  if (!state.playerHole || state.gameOver) return;

  const moveCommand = state.moveCommand;
  const moveSpeed = state.config.player.moveSpeed;

  // Move player hole
  const moveDir = Math.hypot(moveCommand.x, moveCommand.y);
  if (moveDir > 0) {
    const normalizedX = moveCommand.x / moveDir;
    const normalizedY = moveCommand.y / moveDir;

    state.playerHole.position.x += normalizedX * moveSpeed * delta;
    state.playerHole.position.z += normalizedY * moveSpeed * delta;

    // Clamp to world bounds
    const worldSize = state.config.game.worldSize;
    state.playerHole.position.x = Math.max(-worldSize, Math.min(worldSize, state.playerHole.position.x));
    state.playerHole.position.z = Math.max(-worldSize, Math.min(worldSize, state.playerHole.position.z));

    state.hasUserInteracted = true;
  }
}

export function updateCamera(state, delta) {
  if (!state.playerHole) return;

  const camera = state.camera;
  const hole = state.playerHole;

  // Camera follows hole with lag
  const targetX = hole.position.x;
  const targetZ = hole.position.z - 2;
  const targetY = 12 + (hole.userData.diameter * 0.5);

  camera.position.x += (targetX - camera.position.x) * state.cameraFollowLag;
  camera.position.z += (targetZ - camera.position.z) * state.cameraFollowLag;
  camera.position.y += (targetY - camera.position.y) * state.cameraFollowLag;
  camera.lookAt(hole.position.x, 0, hole.position.z);
}

export function updateParticles(state, delta) {
  const particles = Array.from(state.activeParticles);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.life += delta;

    if (p.userData.life >= p.userData.maxLife) {
      p.visible = false;
      state.particlesLayer.remove(p);
      state.activeParticles.delete(p);
      state.particlePool.release(p);
    } else {
      // Update physics
      p.position.addScaledVector(p.userData.velocity, delta);
      p.userData.velocity.multiplyScalar(0.98);

      // Fade out
      const fadeProgress = p.userData.life / p.userData.maxLife;
      p.material.opacity = 1 - fadeProgress;
    }
  }
}
