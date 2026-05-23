export function loadHandTutorialScript() {
  return new Promise(function (resolve, reject) {
    if (window.HandTutorial) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = '/reusables/components/HandTutorial.js';
    script.onload = function () {
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function scheduleTutorial(state) {
  const cfg = state.config.tutorial;
  if (!cfg || !cfg.enabled || state.hasUserInteracted || !window.HandTutorial) {
    return;
  }

  if (state.tutorialDelayId) {
    window.clearTimeout(state.tutorialDelayId);
  }

  state.tutorialDelayId = window.setTimeout(function () {
    state.tutorialDelayId = null;
    const arrow = state.arrows.find(function (a) {
      return a.id === cfg.targetArrowId && a.state === 'board';
    });
    if (!arrow || !arrow.group) {
      return;
    }

    const head = arrow.cells[arrow.cells.length - 1];
    const world = state.cellToWorld(head[0], head[1]);
    const target = {
      space: 'world',
      x: world.x,
      y: world.y + 0.35,
      z: world.z
    };

    if (!state.tutorial) {
      state.tutorial = new window.HandTutorial({
        container: state.renderer.domElement.parentElement,
        renderer: state.renderer,
        camera: state.camera,
        assetUrl: cfg.assetUrl,
        gesture: cfg.gesture || 'tap',
        duration: cfg.duration || 1.1,
        loop: true,
        loopDelay: cfg.loopDelay || 0.45,
        size: cfg.size || 118,
        anchor: { x: 0.22, y: 0.08 },
        from: target,
        to: target
      });
    } else {
      state.tutorial.setPoints(target, target);
    }

    state.tutorial.play();
  }, cfg.startDelayMs || 900);
}

export function dismissTutorial(state) {
  state.hasUserInteracted = true;
  if (state.tutorialDelayId) {
    window.clearTimeout(state.tutorialDelayId);
    state.tutorialDelayId = null;
  }
  if (state.tutorial) {
    state.tutorial.destroy();
    state.tutorial = null;
  }
}
