'use strict';
// ---------- shared helpers: math, rng, audio ----------
const TS = 16, VW = 320, VH = 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hash2(x, y, s) {
  let n = (x * 374761393 + y * 668265263 + (s || 0) * 1274126177) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function angDiff(a, b) { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

// ---------- audio (all synthesized, no files) ----------
const Snd = (function () {
  let ac = null, master = null, muted = false;
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.45; master.connect(ac.destination);
    } catch (e) { ac = null; }
  }
  const noiseBufs = {};   // one fading noise buffer per duration instead of a new one for every shot
  function noise(dur, f0, f1, vol) {
    let b = noiseBufs[dur];
    if (!b) {
      const n = Math.floor(ac.sampleRate * dur); b = noiseBufs[dur] = ac.createBuffer(1, n, ac.sampleRate); const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    }
    const s = ac.createBufferSource(); s.buffer = b;
    const f = ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(f0, ac.currentTime); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), ac.currentTime + dur);
    const g = ac.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  function tone(f0, f1, dur, type, vol) {
    const o = ac.createOscillator(); o.type = type || 'square';
    o.frequency.setValueAtTime(f0, ac.currentTime); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), ac.currentTime + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.connect(g); g.connect(master); o.start(); o.stop(ac.currentTime + dur);
  }
  const S = {
    shot() { noise(0.14, 3200, 500, 0.5); tone(200, 50, 0.1, 'square', 0.18); },
    shotgun() { noise(0.3, 2200, 300, 0.8); tone(110, 35, 0.2, 'sawtooth', 0.3); },
    rifle() { noise(0.22, 4500, 400, 0.6); tone(260, 60, 0.16, 'square', 0.2); },
    derringer() { noise(0.08, 3800, 900, 0.35); tone(300, 90, 0.06, 'square', 0.12); },
    reload() { noise(0.04, 5000, 2000, 0.4); setTimeout(() => ac && noise(0.05, 4000, 1500, 0.4), 120); },
    hit() { tone(140, 60, 0.08, 'square', 0.18); },
    crit() { tone(420, 180, 0.1, 'square', 0.2); },
    hurt() { tone(220, 70, 0.22, 'sawtooth', 0.3); },
    zdie() { tone(110, 40, 0.35, 'sawtooth', 0.25); noise(0.2, 800, 200, 0.3); },
    groan() { tone(80, 55, 0.5, 'sawtooth', 0.1); },
    pickup() { tone(660, 880, 0.08, 'square', 0.15); setTimeout(() => ac && tone(880, 1100, 0.1, 'square', 0.15), 70); },
    level() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => ac && tone(f, f, 0.14, 'square', 0.2), i * 90)); },
    roll() { noise(0.12, 1500, 300, 0.3); },
    boom() { noise(0.9, 1200, 60, 1.0); tone(90, 25, 0.6, 'sawtooth', 0.5); },
    door() { noise(0.4, 600, 100, 0.6); tone(70, 40, 0.4, 'sawtooth', 0.2); },
    ui() { tone(520, 640, 0.05, 'square', 0.1); },
    skill() { tone(300, 900, 0.18, 'sawtooth', 0.15); },
    spit() { noise(0.15, 1800, 400, 0.3); tone(240, 120, 0.12, 'sine', 0.2); },
    laser() { tone(900, 300, 0.1, 'sawtooth', 0.12); },
    zap() { noise(0.12, 6000, 1500, 0.4); tone(1200, 200, 0.12, 'square', 0.12); },
    flame() { noise(0.18, 1500, 400, 0.3); },
    freeze() { tone(1500, 900, 0.18, 'sine', 0.15); noise(0.1, 7000, 3000, 0.2); },
    heal() { tone(500, 900, 0.14, 'sine', 0.15); setTimeout(() => ac && tone(700, 1100, 0.14, 'sine', 0.12), 80); },
    slam() { noise(0.35, 500, 60, 0.9); tone(70, 30, 0.3, 'sawtooth', 0.4); },
    ult() { tone(200, 1200, 0.3, 'sawtooth', 0.2); noise(0.3, 3000, 400, 0.3); },
    win() { [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => ac && tone(f, f, 0.16, 'square', 0.18), i * 110)); },
    lose() { [400, 330, 260, 190].forEach((f, i) => setTimeout(() => ac && tone(f, f * 0.8, 0.25, 'sawtooth', 0.2), i * 160)); },
    roar() { tone(90, 40, 0.8, 'sawtooth', 0.35); noise(0.7, 600, 100, 0.4); },
    talk() { tone(170 + Math.random() * 70, 110, 0.04, 'square', 0.035); },
    rumble() { noise(1.2, 400, 50, 0.7); tone(55, 30, 1.0, 'sawtooth', 0.3); },
    bell() { tone(880, 860, 0.5, 'sine', 0.18); tone(1320, 1300, 0.4, 'sine', 0.08); }
  };
  return {
    init,
    play(n) { if (!ac || muted) return; try { S[n] && S[n](); } catch (e) {} },
    toggle() { muted = !muted; return muted; },
    get muted() { return muted; }
  };
})();
