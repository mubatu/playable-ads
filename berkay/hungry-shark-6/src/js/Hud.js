var hudEl = null;
var healthFill = null;
var hungerFill = null;
var boostFill = null;
var goldRushFill = null;
var goldRushTrack = null;
var scoreEl = null;
var coinEl = null;
var goldRushLabel = null;
var goldOverlay = null;
var gameOverOverlay = null;
var ctaOverlay = null;

export function buildHud(state) {
    hudEl = document.createElement('div');
    hudEl.id = 'hud';
    Object.assign(hudEl.style, {
        position: 'fixed', inset: '0',
        pointerEvents: 'none', zIndex: '5',
        fontFamily: "'Segoe UI', Arial, sans-serif"
    });

    buildBars(hudEl);
    buildScore(hudEl);
    buildGoldRushLabel(hudEl);
    buildGoldOverlay(hudEl);
    buildGameOverOverlay(hudEl, state);
    buildCtaOverlay(hudEl, state);

    document.body.appendChild(hudEl);
}

function buildBars(container) {
    var wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        position: 'absolute', top: '10px', left: '10px', right: '10px',
        display: 'flex', flexDirection: 'column', gap: '5px'
    });

    var hp = makeBar('#e74c3c', 'HP');
    var hunger = makeBar('#f39c12', 'HUNGER');
    var boost = makeBar('#3498db', 'BOOST');
    var gr = makeGoldRushBar();

    wrapper.appendChild(hp.wrapper);
    wrapper.appendChild(hunger.wrapper);
    wrapper.appendChild(boost.wrapper);
    wrapper.appendChild(gr.wrapper);

    healthFill = hp.fill;
    hungerFill = hunger.fill;
    boostFill = boost.fill;
    goldRushFill = gr.fill;
    goldRushTrack = gr.track;

    container.appendChild(wrapper);
}

function makeBar(color, label) {
    var wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        display: 'flex', alignItems: 'center', gap: '6px'
    });

    var lbl = document.createElement('span');
    lbl.textContent = label;
    Object.assign(lbl.style, {
        color: '#fff', fontSize: '10px', fontWeight: '700',
        width: '58px', textAlign: 'right',
        textShadow: '0 1px 4px rgba(0,0,0,0.7)', flexShrink: '0'
    });

    var track = document.createElement('div');
    Object.assign(track.style, {
        flex: '1', height: '9px',
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: '5px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.12)'
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

    return { wrapper: wrapper, fill: fill, track: track };
}

function makeGoldRushBar() {
    var wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        display: 'flex', alignItems: 'center', gap: '6px'
    });

    var lbl = document.createElement('span');
    lbl.textContent = 'GOLD';
    Object.assign(lbl.style, {
        color: '#ffd700', fontSize: '10px', fontWeight: '700',
        width: '58px', textAlign: 'right',
        textShadow: '0 1px 4px rgba(0,0,0,0.7)', flexShrink: '0'
    });

    var track = document.createElement('div');
    Object.assign(track.style, {
        flex: '1', height: '9px',
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: '5px', overflow: 'hidden',
        border: '1px solid rgba(255,215,0,0.25)'
    });

    var fill = document.createElement('div');
    Object.assign(fill.style, {
        width: '0%', height: '100%',
        backgroundColor: '#ffd700', borderRadius: '5px',
        transition: 'width 0.1s ease'
    });

    track.appendChild(fill);
    wrapper.appendChild(lbl);
    wrapper.appendChild(track);

    return { wrapper: wrapper, fill: fill, track: track };
}

function buildScore(container) {
    scoreEl = document.createElement('div');
    Object.assign(scoreEl.style, {
        position: 'absolute', top: '100px', right: '12px',
        color: '#fff', fontSize: '22px', fontWeight: '800',
        textShadow: '0 2px 8px rgba(0,0,0,0.7)',
        letterSpacing: '0.02em'
    });
    scoreEl.textContent = 'Score: 0';

    coinEl = document.createElement('div');
    Object.assign(coinEl.style, {
        position: 'absolute', top: '130px', right: '12px',
        color: '#ffd700', fontSize: '17px', fontWeight: '700',
        textShadow: '0 2px 6px rgba(0,0,0,0.6)'
    });
    coinEl.textContent = 'Coins: 0';

    container.appendChild(scoreEl);
    container.appendChild(coinEl);
}

function buildGoldRushLabel(container) {
    goldRushLabel = document.createElement('div');
    Object.assign(goldRushLabel.style, {
        position: 'absolute', top: '42%', left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#ffd700', fontSize: '40px', fontWeight: '900',
        letterSpacing: '4px', display: 'none',
        textShadow: '0 0 20px #ff8c00, 0 0 40px #ff4500',
        animation: 'goldPulse 0.8s ease-in-out infinite'
    });
    goldRushLabel.textContent = 'GOLD RUSH!';
    container.appendChild(goldRushLabel);
}

function buildGoldOverlay(container) {
    goldOverlay = document.createElement('div');
    Object.assign(goldOverlay.style, {
        position: 'absolute', inset: '0',
        background: 'rgba(255,215,0,0)',
        pointerEvents: 'none',
        transition: 'background 0.3s ease',
        zIndex: '1'
    });
    container.appendChild(goldOverlay);
}

function buildGameOverOverlay(container, state) {
    gameOverOverlay = document.createElement('div');
    Object.assign(gameOverOverlay.style, {
        position: 'fixed', inset: '0',
        display: 'none', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '14px',
        background: 'rgba(3,4,30,0.88)',
        zIndex: '100',
        color: '#fff', animation: 'fadeIn 0.4s ease-out'
    });

    var title = document.createElement('h2');
    title.textContent = 'Game Over!';
    Object.assign(title.style, {
        fontSize: '40px', margin: '0',
        background: 'linear-gradient(135deg,#ffd700,#ff8c00)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    });

    var scoreText = document.createElement('p');
    scoreText.id = 'go-score';
    Object.assign(scoreText.style, { fontSize: '20px', margin: '0', opacity: '0.9' });

    var btn = makeButton('DOWNLOAD NOW', 'linear-gradient(180deg,#ff9a2f 0%,#ff4d2e 100%)');
    btn.addEventListener('click', function () {
        window.open('https://play.google.com/store', '_blank');
    });

    gameOverOverlay.appendChild(title);
    gameOverOverlay.appendChild(scoreText);
    gameOverOverlay.appendChild(btn);
    container.appendChild(gameOverOverlay);
}

function buildCtaOverlay(container, state) {
    ctaOverlay = document.createElement('div');
    Object.assign(ctaOverlay.style, {
        position: 'fixed', inset: '0',
        display: 'none', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '14px',
        background: 'rgba(3,4,30,0.82)',
        zIndex: '100',
        color: '#fff', animation: 'fadeIn 0.4s ease-out'
    });

    var title = document.createElement('h2');
    title.textContent = 'Enjoying the Hunt?';
    Object.assign(title.style, { fontSize: '32px', margin: '0' });

    var sub = document.createElement('p');
    sub.textContent = 'Download Hungry Shark for the full experience!';
    Object.assign(sub.style, { fontSize: '15px', margin: '0', opacity: '0.88' });

    var btn = makeButton('DOWNLOAD NOW', 'linear-gradient(135deg,#4ecdc4 0%,#2ecc71 100%)');
    btn.addEventListener('click', function () {
        window.open('https://play.google.com/store', '_blank');
    });

    ctaOverlay.appendChild(title);
    ctaOverlay.appendChild(sub);
    ctaOverlay.appendChild(btn);
    container.appendChild(ctaOverlay);
}

function makeButton(text, bg) {
    var btn = document.createElement('button');
    btn.textContent = text;
    Object.assign(btn.style, {
        border: 'none', borderRadius: '999px',
        padding: '14px 36px', fontSize: '17px', fontWeight: '800',
        color: '#fff', cursor: 'pointer', pointerEvents: 'auto',
        background: bg, letterSpacing: '0.04em',
        boxShadow: '0 6px 22px rgba(0,0,0,0.4)',
        transform: 'scale(1)', transition: 'transform 0.12s ease'
    });
    btn.addEventListener('mouseover', function () { btn.style.transform = 'scale(1.06)'; });
    btn.addEventListener('mouseout', function () { btn.style.transform = 'scale(1)'; });
    return btn;
}

export function updateHud(state) {
    var config = state.config;

    if (healthFill) {
        var hpPct = (state.health / config.health.max * 100);
        healthFill.style.width = hpPct + '%';
        healthFill.style.backgroundColor = hpPct < 25 ? '#c0392b' : '#e74c3c';
    }

    if (hungerFill) {
        var hungerPct = (state.hunger / config.hunger.max * 100);
        hungerFill.style.width = hungerPct + '%';
        hungerFill.style.backgroundColor = hungerPct < 20 ? '#e74c3c' : '#f39c12';
    }

    if (boostFill) {
        boostFill.style.width = state.boostEnergy + '%';
    }

    if (goldRushFill) {
        if (state.isGoldRush) {
            var grTimer = (state.goldRushTimer / config.goldRush.duration * 100);
            goldRushFill.style.width = Math.max(0, grTimer) + '%';
            goldRushFill.style.backgroundColor = '#ff8c00';
        } else {
            var grPct = (state.goldRushMeter / config.goldRush.threshold * 100);
            goldRushFill.style.width = Math.min(100, grPct) + '%';
            goldRushFill.style.backgroundColor = '#ffd700';
        }
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

    if (goldOverlay) {
        if (state.isGoldRush) {
            var alpha = 0.06 + state.goldRushFlash * 0.08;
            goldOverlay.style.background = 'rgba(255,215,0,' + alpha + ')';
        } else {
            goldOverlay.style.background = 'rgba(255,215,0,0)';
        }
    }
}

export function showGameOver(state) {
    if (gameOverOverlay) {
        gameOverOverlay.style.display = 'flex';
        var scoreText = document.getElementById('go-score');
        if (scoreText) {
            scoreText.textContent = 'Score: ' + state.score + '  |  Coins: ' + state.coins;
        }
    }
}

export function showCta() {
    if (ctaOverlay) {
        ctaOverlay.style.display = 'flex';
    }
}
