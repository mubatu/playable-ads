export function createAudioManager() {
    var ctx = null;

    function ensureContext() {
        if (!ctx) {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) {
                return null;
            }
            ctx = new Ctx();
        }
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        return ctx;
    }

    function tone(freq, duration, type, gainValue) {
        var audio = ensureContext();
        var osc;
        var gain;
        var now;

        if (!audio) {
            return;
        }

        now = audio.currentTime;
        osc = audio.createOscillator();
        gain = audio.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(gainValue || 0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(now);
        osc.stop(now + duration);
    }

    return {
        unlock: function () {
            ensureContext();
        },
        playConsume: function () {
            tone(220, 0.08, 'sine', 0.035);
            tone(140, 0.12, 'triangle', 0.02);
        },
        playGrowth: function () {
            tone(80, 0.15, 'sine', 0.04);
        },
        playClick: function () {
            tone(640, 0.05, 'triangle', 0.03);
        }
    };
}
