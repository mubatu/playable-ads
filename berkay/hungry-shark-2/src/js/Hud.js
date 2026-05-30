import { UIScene } from '../../../../reusables/UIScene/UIScene.js';

var BAR_STYLE_BASE = {
    position: 'absolute',
    left: '16px',
    width: '40%',
    maxWidth: '200px',
    height: '16px',
    borderRadius: '10px',
    background: 'rgba(0,0,0,0.45)',
    border: '2px solid rgba(255,255,255,0.25)'
};

export function buildHud(state) {
    var uiScene = new UIScene({
        progressBars: [
            {
                id: 'health-bar',
                initialValue: state.health,
                max: state.config.health.max,
                showText: false,
                styles: Object.assign({}, BAR_STYLE_BASE, { top: '20px' })
            },
            {
                id: 'hunger-bar',
                initialValue: state.hunger,
                max: state.config.hunger.max,
                showText: false,
                styles: Object.assign({}, BAR_STYLE_BASE, { top: '44px' })
            },
            {
                id: 'goldrush-bar',
                initialValue: 0,
                max: state.config.goldRush.threshold,
                showText: false,
                styles: Object.assign({}, BAR_STYLE_BASE, { top: '68px' })
            }
        ],
        scoreDisplays: [
            {
                id: 'score',
                label: 'SCORE',
                initialValue: 0,
                styles: { position: 'absolute', top: '18px', right: '16px', textAlign: 'right', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' },
                labelStyles: { fontSize: '11px', letterSpacing: '2px', opacity: '0.8' },
                valueStyles: { fontSize: '26px', fontWeight: 'bold' }
            },
            {
                id: 'coins',
                label: 'COINS',
                initialValue: 0,
                styles: { position: 'absolute', top: '68px', right: '16px', textAlign: 'right', color: '#ffd24a', textShadow: '0 2px 4px rgba(0,0,0,0.6)' },
                labelStyles: { fontSize: '10px', letterSpacing: '2px', opacity: '0.9' },
                valueStyles: { fontSize: '20px', fontWeight: 'bold' }
            }
        ],
        joysticks: [
            {
                id: 'move-joy',
                maxRadius: 60,
                styles: {
                    position: 'absolute',
                    left: '24px',
                    bottom: '70px',
                    width: '120px',
                    height: '120px',
                    background: 'rgba(255,255,255,0.18)',
                    border: '3px solid rgba(255,255,255,0.4)',
                    borderRadius: '50%',
                    zIndex: '5'
                },
                onInit: function (cmd) { state.moveCommand = cmd; }
            }
        ],
        buttons: [
            {
                id: 'boost-btn',
                text: 'BOOST',
                styles: {
                    position: 'absolute',
                    right: '32px',
                    bottom: '80px',
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    background: 'linear-gradient(180deg,#ffce47,#ff8c1a)',
                    color: '#3a1f00',
                    border: '3px solid #fff',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                }
            }
        ],
        introOverlays: [
            {
                id: 'intro',
                visible: true,
                title: 'HUNGRY SHARK',
                subtitle: 'Eat, grow, survive!',
                buttonText: 'PLAY',
                onPrimaryClick: function () {
                    state.gameStarted = true;
                    var ov = uiScene.getByConfigId('intro');
                    if (ov) ov.hide();
                }
            },
            {
                id: 'gameover',
                visible: false,
                title: 'GAME OVER',
                subtitle: '',
                buttonText: 'DOWNLOAD',
                onPrimaryClick: function () {
                    window.open('https://apps.apple.com/', '_blank');
                }
            },
            {
                id: 'cta',
                visible: false,
                title: 'KEEP HUNTING!',
                subtitle: 'Get the full game now',
                buttonText: 'DOWNLOAD',
                styles: {
                    overlay: { background: 'rgba(0,20,40,0.55)' }
                },
                onPrimaryClick: function () {
                    window.open('https://apps.apple.com/', '_blank');
                }
            }
        ]
    });

    // tint bars
    var hb = uiScene.getByConfigId('health-bar');
    if (hb && hb.fill) { hb.fill.style.background = 'linear-gradient(90deg,#ff5252,#ff9d6e)'; hb.fill.style.borderRadius = '8px'; }
    var ub = uiScene.getByConfigId('hunger-bar');
    if (ub && ub.fill) { ub.fill.style.background = 'linear-gradient(90deg,#4cc9f0,#90e0ef)'; ub.fill.style.borderRadius = '8px'; }
    var gb = uiScene.getByConfigId('goldrush-bar');
    if (gb && gb.fill) { gb.fill.style.background = 'linear-gradient(90deg,#ffd700,#ff8c00)'; gb.fill.style.borderRadius = '8px'; }

    var boost = uiScene.getByConfigId('boost-btn');
    if (boost && boost.element) {
        var btn = boost.element;
        var press = function (e) { e.preventDefault(); state.isBoosting = true; btn.style.transform = 'scale(0.92)'; };
        var release = function (e) { e.preventDefault(); state.isBoosting = false; btn.style.transform = ''; };
        btn.addEventListener('pointerdown', press);
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointercancel', release);
        btn.addEventListener('pointerleave', release);
    }

    state.hud = uiScene;
}

export function updateHud(state) {
    if (!state.hud) return;
    state.hud.getByConfigId('health-bar').setValue(state.health);
    state.hud.getByConfigId('hunger-bar').setValue(state.hunger);
    state.hud.getByConfigId('goldrush-bar').setValue(state.goldRushMeter);
    state.hud.getByConfigId('score').setValue(state.score);
    state.hud.getByConfigId('coins').setValue(state.coins);
}

export function showGameOver(state) {
    if (!state.hud) return;
    var ov = state.hud.getByConfigId('gameover');
    if (ov) {
        ov.setSubtitle('Score: ' + state.score + '  •  Coins: ' + state.coins);
        ov.show();
    }
}

export function showCta(state) {
    if (!state.hud) return;
    var ov = state.hud.getByConfigId('cta');
    if (ov) ov.show();
}
