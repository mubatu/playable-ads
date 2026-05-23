export function createSfx(volume) {
  let ctx = null;
  let unlocked = false;
  const master = volume || 0.35;

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function tone(freq, duration, type, gain) {
    if (!unlocked) {
      return;
    }
    const audio = ensureContext();
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    amp.gain.value = 0.0001;
    osc.connect(amp);
    amp.connect(audio.destination);
    const now = audio.currentTime;
    amp.gain.exponentialRampToValueAtTime(gain * master, now + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  return {
    unlock: function () {
      unlocked = true;
      const audio = ensureContext();
      if (audio.state === 'suspended') {
        audio.resume();
      }
    },
    tap: function () {
      tone(520, 0.08, 'triangle', 0.12);
    },
    shoot: function () {
      tone(880, 0.07, 'square', 0.1);
    },
    hit: function () {
      tone(360, 0.1, 'sawtooth', 0.14);
    },
    win: function () {
      tone(660, 0.12, 'sine', 0.12);
      window.setTimeout(function () {
        tone(880, 0.16, 'sine', 0.12);
      }, 90);
    },
    lose: function () {
      tone(220, 0.2, 'triangle', 0.14);
    }
  };
}
