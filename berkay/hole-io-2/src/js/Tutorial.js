export function scheduleTutorial(state) {
  setTimeout(() => {
    if (!state.tutorialActive || state.hasUserInteracted) return;

    const joystickBtn = document.querySelector('[id="movement-joystick"]');
    if (!joystickBtn) return;

    const rect = joystickBtn.getBoundingClientRect();
    const baseX = rect.left + rect.width / 2;
    const baseY = rect.top + rect.height / 2;

    // Create tutorial if HandTutorial is available
    if (typeof window.HandTutorial !== 'undefined') {
      state.tutorial = new window.HandTutorial({
        container: document.body,
        assetUrl: 'src/assets/hand.png',
        gesture: 'drag',
        from: { space: 'pixels', x: baseX - 20, y: baseY },
        to: { space: 'pixels', x: baseX + 40, y: baseY - 40 },
        duration: 1.5,
        loop: true,
        loopDelay: 0.5,
        size: 40,
        opacity: 0.9
      }).play();
    }
  }, 500);
}

export function destroyTutorial(state) {
  if (state.tutorial) {
    state.tutorial.destroy();
    state.tutorial = null;
  }
}
