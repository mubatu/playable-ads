export function createHud() {
  const root = document.getElementById('hud');
  if (!root) {
    return null;
  }

  root.innerHTML = '';

  const scorePill = makePill('Score', '0');
  const arrowsPill = makePill('Arrows', '0');
  const conveyorPill = makePill('Conveyor', '0/5');

  root.appendChild(scorePill);
  root.appendChild(arrowsPill);
  root.appendChild(conveyorPill);

  return {
    setScore: function (value) {
      scorePill.querySelector('strong').textContent = String(value);
    },
    setArrowsLeft: function (value) {
      arrowsPill.querySelector('strong').textContent = String(value);
    },
    setConveyor: function (current, max) {
      conveyorPill.querySelector('strong').textContent = current + '/' + max;
    },
    showScorePopup: function (points) {
      const popup = document.createElement('div');
      popup.className = 'score-popup';
      popup.textContent = '+' + points;
      popup.style.left = '50%';
      popup.style.top = '18%';
      document.body.appendChild(popup);
      window.setTimeout(function () {
        popup.remove();
      }, 900);
    }
  };
}

function makePill(label, value) {
  const el = document.createElement('div');
  el.className = 'hud-pill';
  el.innerHTML = '<span>' + label + '</span><strong>' + value + '</strong>';
  return el;
}

export function showEndOverlay(config, won, onRetry) {
  let overlay = document.getElementById('end-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'end-overlay';
    document.body.appendChild(overlay);
  }

  overlay.className = 'visible';
  overlay.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'end-card';
  const title = document.createElement('h1');
  title.textContent = won ? config.copy.winTitle : config.copy.loseTitle;
  card.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'end-actions';

  const cta = document.createElement('button');
  cta.className = 'btn-cta';
  cta.textContent = config.cta.label;
  cta.addEventListener('click', function () {
    if (config.cta.url) {
      window.open(config.cta.url, '_blank');
    }
  });
  actions.appendChild(cta);

  if (!won) {
    const retry = document.createElement('button');
    retry.className = 'btn-retry';
    retry.textContent = config.copy.retryLabel;
    retry.addEventListener('click', function () {
      overlay.classList.remove('visible');
      if (onRetry) {
        onRetry();
      }
    });
    actions.appendChild(retry);
  }

  card.appendChild(actions);
  overlay.appendChild(card);
}

export function hideEndOverlay() {
  const overlay = document.getElementById('end-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
  }
}
