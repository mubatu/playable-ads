var hudContainer = null;
var healthBar = null;
var healthFill = null;
var hungerBar = null;
var hungerFill = null;
var scoreEl = null;
var coinEl = null;
var goldRushBar = null;
var goldRushFill = null;
var boostBar = null;
var boostFill = null;
var gameOverOverlay = null;
var ctaOverlay = null;
var goldRushLabel = null;

export function buildHud(state) {
    hudContainer = document.createElement('div');
    hudContainer.id = 'hud';
    Object.assign(hudContainer.style, {
        position: 'absolute', top: '0', left: '0',
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '5',
        fontFamily: "'Segoe UI', Arial, sans-serif"
    });

    var topBar = document.createElement('div');
    Object.assign(topBar.style, {
        position: 'absolute', top: '8px', left: '8px', right: '8px',
        display: 'flex', flexDirection: 'column', gap: '4px'
    });

    healthBar = createBar('#e74c3c', 'HP');
    hungerBar = createBar('#f39c12', 'HUNGER');
    boostBar = createBar('#3498db', 'BOOST');
    goldRushBar = createBar('#f1c40f', 'GOLD RUSH');

    topBar.appendChild(healthBar.wrapper);
    topBar.appendChild(hungerBar.wrapper);
    topBar.appendChild(boostBar.wrapper);
    topBar.appendChild(goldRushBar.wrapper);
    healthFill = healthBar.fill;
    hungerFill = hungerBar.fill;
    boostFill = boostBar.fill;
    goldRushFill = goldRushBar.fill;

    scoreEl = document.createElement('div');
    Object.assign(scoreEl.style, {
        position: 'absolute', top: '100px', right: '12px',
        color: '#ffffff', fontSize: '22px', fontWeight: 'bold',
        textShadow: '0 2px 6px rgba(0,0,0,0.6)'
    });
    scoreEl.textContent = 'Score: 0';

    coinEl = document.createElement('div');
    Object.assign(coinEl.style, {
        position: 'absolute', top: '128px', right: '12px',
        color: '#ffd700', fontSize: '18px', fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
    });
    coinEl.textContent = 'Coins: 0';

    goldRushLabel = document.createElement('div');
    Object.assign(goldRushLabel.style, {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#ffd700', fontSize: '36px', fontWeight: '900',
        textShadow: '0 0 20px #ff8c00, 0 0 40px #ff4500',
        display: 'none', pointerEvents: 'none',
        letterSpacing: '3px'
    });
    goldRushLabel.textContent = 'GOLD RUSH!';

    buildGameOverOverlay();
    buildCtaOverlay();

    hudContainer.appendChild(topBar);
    hudContainer.appendChild(scoreEl);
    hudContainer.appendChild(coinEl);
    hudContainer.appendChild(goldRushLabel);
    hudContainer.appendChild(gameOverOverlay);
    hudContainer.appendChild(ctaOverlay);
    document.body.appendChild(hudContainer);
}

function createBar(color, label) {
    var wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        display: 'flex', alignItems: 'center', gap: '6px'
    });

    var lbl = document.createElement('span');
    lbl.textContent = label;
    Object.assign(lbl.style, {
        color: '#ffffff', fontSize: '10px', fontWeight: '700',
        width: '70px', textAlign: 'right',
        textShadow: '0 1px 3px rgba(0,0,0,0.5)'
    });

    var track = document.createElement('div');
    Object.assign(track.style, {
        flex: '1', height: '10px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '5px', overflow: 'hidden'
    });

    var fill = document.createElement('div');
    Object.assign(fill.style, {
        width: '100%', height: '100%',
        backgroundColor: color, borderRadius: '5px',
        transition: 'width 0.15s ease'
    });

    track.appendChild(fill);
    wrapper.appendChild(lbl);
    wrapper.appendChild(track);

    return { wrapper: wrapper, fill: fill };
}

function buildGameOverOverlay() {
    gameOverOverlay = document.createElement('div');
    Object.assign(gameOverOverlay.style, {
        position: 'fixed', inset: '0',
        display: 'none', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
        background: 'rgba(4,9,20,0.8)', zIndex: '100',
        color: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif"
    });

    var title = document.createElement('h2');
    title.textContent = 'Game Over!';
    Object.assign(title.style, { fontSize: '38px', margin: '0' });

    var scoreText = document.createElement('p');
    scoreText.id = 'go-score';
    Object.assign(scoreText.style, { fontSize: '22px', margin: '0' });

    var btn = document.createElement('button');
    btn.textContent = 'DOWNLOAD NOW';
    Object.assign(btn.style, {
        border: 'none', borderRadius: '999px',
        padding: '14px 32px', fontSize: '18px', fontWeight: '700',
        color: '#fff', cursor: 'pointer', pointerEvents: 'auto',
        background: 'linear-gradient(180deg, #ff9a2f 0%, #ff4d2e 100%)',
        boxShadow: '0 6px 18px rgba(255,90,30,0.45)'
    });
    btn.addEventListener('click', function () {
        window.open('https://play.google.com/store', '_blank');
    });

    gameOverOverlay.appendChild(title);
    gameOverOverlay.appendChild(scoreText);
    gameOverOverlay.appendChild(btn);
}

function buildCtaOverlay() {
    ctaOverlay = document.createElement('div');
    Object.assign(ctaOverlay.style, {
        position: 'fixed', inset: '0',
        display: 'none', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
        background: 'rgba(4,9,20,0.75)', zIndex: '100',
        color: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif"
    });

    var title = document.createElement('h2');
    title.textContent = 'Want More?';
    Object.assign(title.style, { fontSize: '34px', margin: '0' });

    var sub = document.createElement('p');
    sub.textContent = 'Download Hungry Shark for the full experience!';
    Object.assign(sub.style, { fontSize: '16px', margin: '0', opacity: '0.9' });

    var btn = document.createElement('button');
    btn.textContent = 'DOWNLOAD NOW';
    Object.assign(btn.style, {
        border: 'none', borderRadius: '999px',
        padding: '14px 32px', fontSize: '18px', fontWeight: '700',
        color: '#fff', cursor: 'pointer', pointerEvents: 'auto',
        background: 'linear-gradient(180deg, #4ecdc4 0%, #2ecc71 100%)',
        boxShadow: '0 6px 18px rgba(46,204,113,0.45)'
    });
    btn.addEventListener('click', function () {
        window.open('https://play.google.com/store', '_blank');
    });

    ctaOverlay.appendChild(title);
    ctaOverlay.appendChild(sub);
    ctaOverlay.appendChild(btn);
}

export function updateHud(state) {
    var config = state.config;

    if (healthFill) {
        healthFill.style.width = (state.health / config.health.max * 100) + '%';
    }
    if (hungerFill) {
        hungerFill.style.width = (state.hunger / config.hunger.max * 100) + '%';
        if (state.hunger < 20) {
            hungerFill.style.backgroundColor = '#e74c3c';
        } else {
            hungerFill.style.backgroundColor = '#f39c12';
        }
    }
    if (boostFill) {
        boostFill.style.width = (state.boostEnergy) + '%';
    }
    if (goldRushFill) {
        var grPct = state.isGoldRush
            ? (state.goldRushTimer / config.goldRush.duration * 100)
            : (state.goldRushMeter / config.goldRush.threshold * 100);
        goldRushFill.style.width = Math.min(100, grPct) + '%';
    }
    if (scoreEl) {
        scoreEl.textContent = 'Score: ' + state.score;
    }
    if (coinEl) {
        coinEl.textContent = 'Coins: ' + state.coins;
    }
    if (goldRushLabel) {
        goldRushLabel.style.display = state.isGoldRush ? 'block' : 'none';
    }
}

export function showGameOver(state) {
    if (gameOverOverlay) {
        gameOverOverlay.style.display = 'flex';
        var scoreText = document.getElementById('go-score');
        if (scoreText) {
            scoreText.textContent = 'Final Score: ' + state.score + '  |  Coins: ' + state.coins;
        }
    }
}

export function showCta() {
    if (ctaOverlay) {
        ctaOverlay.style.display = 'flex';
    }
}

export function hideCta() {
    if (ctaOverlay) {
        ctaOverlay.style.display = 'none';
    }
}
