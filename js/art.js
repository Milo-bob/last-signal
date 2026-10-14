'use strict';
// ---------- all art is generated in code (rect pixel art), no image files ----------
const Art = (function () {
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tint(c, col) {
    const f = mk(c.width, c.height), g = f.getContext('2d');
    g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = col; g.fillRect(0, 0, f.width, f.height); return f;
  }
  function outline(c, col) {
    const o = mk(c.width + 2, c.height + 2), g = o.getContext('2d'), d = tint(c, col || '#0a0610');
    [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(p => g.drawImage(d, p[0], p[1]));
    g.drawImage(c, 1, 1); return o;
  }
  const S = {};
  function build(name, w, h, fn, frames) {
    const list = [];
    for (let f = 0; f < (frames || 1); f++) {
      const c = mk(w, h), g = c.getContext('2d');
      const R = (col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
      fn(R, f, g); list.push(outline(c));
    }
    S[name] = list;
  }

  // ===== STEAMBOT FAMILY (SteamWorld Heist look): round heads with lens eyes, riveted plates, gauges, pipes =====
  function bot(R0, f, o) {
    const Y = 8, b = f ? 1 : 0;
    const R = (c, x, y, w, h) => R0(c, x, y + Y, w, h);
    const c = o.body, t = o.trim, d = o.dark, hd = o.head || c, L = o.light || '#ffffff55', e = o.eye;
    R(d, 8, 22, 3, 5 - b); R(d, 13, 22, 3, 4 + b);              // legs (pipes)
    R(t, 7, 26 - b, 5, 2); R(t, 12, 25 + b, 5, 2);               // boots
    R(c, 6, 12 + b, 12, 10); R(L, 6, 12 + b, 12, 2); R(d, 6, 20 + b, 12, 2); R(t, 6, 17 + b, 12, 1);   // torso
    [[7, 14], [16, 14], [7, 19], [16, 19]].forEach(p => R('#fff8d0', p[0], p[1] + b, 1, 1));            // rivets
    if (!o.nogauge) { R(d, 10, 14 + b, 4, 3); R(o.gauge || '#ffe090', 11, 15 + b, 2, 1); }
    const sw = o.wide ? 2 : 0;
    R(t, 3 - sw, 11 + b, 4 + sw, 4); R(t, 17, 11 + b, 4 + sw, 4);                                       // shoulder pads
    R(d, 3, 15 + b, 3, 6); R(d, 18, 15 + b, 3, 6); R(t, 3, 20 + b, 3, 2); R(t, 18, 20 + b, 3, 2);        // arms + hands
    R(d, 10, 10 + b, 4, 2);                                                                               // neck
    R(hd, 7, 1 + b, 10, 1); R(hd, 6, 2 + b, 12, 8); R(hd, 7, 10 + b, 10, 1); R(L, 7, 2 + b, 10, 1); R(d, 6, 9 + b, 12, 1); // head
    R(t, 5, 5 + b, 1, 3); R(t, 18, 5 + b, 1, 3);                                                          // ear bolts
    if (o.cyclops) { R('#0a0a12', 8, 4 + b, 8, 5); R(e, 9, 5 + b, 6, 3); R('#ffffff', 9, 5 + b, 2, 1); }
    else if (o.slit) { R('#0a0a12', 7, 5 + b, 10, 3); R(e, 8, 6 + b, 8, 1); }
    else { R('#0a0a12', 7, 4 + b, 4, 5); R('#0a0a12', 13, 4 + b, 4, 5); R(e, 8, 5 + b, 2, 3); R(e, 14, 5 + b, 2, 3); R('#ffffff', 8, 5 + b, 1, 1); R('#ffffff', 14, 5 + b, 1, 1); }
    const hc = o.hatc || t, hb = o.hatb || '#e0a030';
    if (o.hat === 'floppy') { R(hc, 2, 2 + b, 20, 2); R(hc, 6, -3 + b, 12, 6); R(hb, 6, 0 + b, 12, 1); }
    else if (o.hat === 'tophat') { R(hc, 5, 1 + b, 14, 1); R(hc, 7, -5 + b, 10, 6); R(hb, 7, -1 + b, 10, 1); }
    else if (o.hat === 'coil') { R(hc, 5, 1 + b, 14, 1); R(hc, 7, -4 + b, 10, 5); R(hb, 7, -1 + b, 10, 1); R('#9a9aa4', 11, -7 + b, 2, 3); R(f ? '#80f0ff' : '#ffffff', 10, -8 + b, 4, 1); }
    else if (o.hat === 'medic') { R('#ffffff', 6, -1 + b, 12, 3); R('#e04040', 11, -1 + b, 2, 3); R('#e04040', 10, 0 + b, 4, 1); }
    else if (o.hat === 'mask') { R('#444450', 6, -2 + b, 12, 5); R('#ffa030', 7, 0 + b, 10, 1); }
    else if (o.hat === 'goggles') { R('#305070', 6, 1 + b, 12, 2); R('#80e0ff', 7, 0 + b, 4, 3); R('#80e0ff', 13, 0 + b, 4, 3); }
    else if (o.hat === 'helm') { R(hc, 6, -2 + b, 12, 5); R(hc, 7, -3 + b, 10, 1); R(hb, 11, -3 + b, 2, 6); }
    else if (o.hat === 'cap') { R(hc, 6, -1 + b, 12, 3); R(d, 5, 2 + b, 14, 1); R('#ffd040', 11, 0 + b, 2, 2); }
    else if (o.hat === 'mohawk') { R('#d03030', 10, -3 + b, 4, 5); R('#a02020', 11, -5 + b, 2, 2); }
    if (o.extra) o.extra(R, f, b);
  }
  const BH = 36;
  build('bulwark', 24, BH, (R, f, g) => bot(R, f, { body: '#5a6e8a', trim: '#3a4a68', dark: '#2a3248', light: '#ffffff44', eye: '#ffd040', hat: 'helm', hatc: '#3a4a68', hatb: '#ffd040', wide: true,
    extra: (R, f, b) => { R('#4a6a9a', 0, 10 + b, 6, 18); R('#a8c8f0', 1, 11 + b, 4, 16); R('#e8f4ff', 1, 11 + b, 4, 2); R('#2a3248', 2, 17 + b, 2, 4); R('#fff8d0', 1, 24 + b, 1, 1); } }), 2);
  build('sight', 24, BH, (R, f, g) => bot(R, f, { body: '#8a5a3a', trim: '#d8a040', dark: '#4a2e1a', head: '#8e98ac', eye: '#40f0e0', cyclops: true, hat: 'floppy', hatc: '#7a4a2a', hatb: '#e0a030', gauge: '#40f0e0',
    extra: (R, f, b) => { R('#2a2a38', 13, 17 + b, 11, 2); R('#6a6a78', 20, 16 + b, 4, 1); R('#40f0e0', 16, 15 + b, 4, 2); R('#4a2e1a', 12, 18 + b, 3, 3); } }), 2);
  build('mender', 24, BH, (R, f, g) => bot(R, f, { body: '#e8f0e8', trim: '#40c070', dark: '#8aa898', eye: '#40ff90', hat: 'medic', nogauge: true,
    extra: (R, f, b) => { R('#e04040', 11, 13 + b, 2, 6); R('#e04040', 9, 15 + b, 6, 2); R('#40c070', 18, 19 + b, 6, 5); R('#ffffff', 20, 20 + b, 2, 3); R('#e04040', 20, 21 + b, 2, 1); } }), 2);
  build('ember', 24, BH, (R, f, g) => bot(R, f, { body: '#c85a28', trim: '#e8a040', dark: '#5a2a1a', head: '#d8662c', eye: '#ffd040', hat: 'helm', hatc: '#8a3a1a', hatb: '#e8a040', gauge: '#ff4020',
    extra: (R, f, b) => { R('#8a3a1a', 0, 12 + b, 5, 10); R('#5a5a64', 1, 5 + b, 2, 8); R(f ? '#d8d8e0' : '#a8a8b4', 0, 2 + b + f, 4, 3); R('#444450', 19, 17 + b, 5, 3); R(f ? '#ffd040' : '#ff8a20', 23, 17 + b, 1, 3); } }), 2);
  build('frost', 24, BH, (R, f, g) => bot(R, f, { body: '#7ac0d8', trim: '#e8fcff', dark: '#3a6a88', head: '#a0e0f0', eye: '#3a9ae8', hat: 'goggles', light: '#ffffff88', gauge: '#80e8ff',
    extra: (R, f, b) => { R('#e8fcff', 2, 6 + b, 2, 6); R('#a0e8f8', 20, 5 + b, 2, 7); R('#5a3a2a', 21, 8 + b, 1, 18); R('#8af0ff', 20, 4 + b, 3, 4); R('#ffffff', 21, 5 + b, 1, 2); } }), 2);
  build('arc', 24, BH, (R, f, g) => bot(R, f, { body: '#d8b020', trim: '#8a6a10', dark: '#5a4408', head: '#e8c82a', eye: '#80f0ff', hat: 'coil', hatc: '#3a3a40', hatb: '#e8c82a', nogauge: true,
    extra: (R, f, b) => { R('#3a3a40', 11, 13 + b, 3, 2); R('#3a3a40', 10, 15 + b, 3, 2); R('#3a3a40', 11, 17 + b, 2, 2); R(f ? '#80f0ff' : '#ffffff', 0, 14 + b, 2, 2); R(f ? '#ffffff' : '#80f0ff', 22, 16 + b, 2, 2); } }), 2);
  build('blade', 24, BH, (R, f, g) => bot(R, f, { body: '#5a3a78', trim: '#8a5ab0', dark: '#2a1a3a', head: '#3a2a50', eye: '#ff3030', slit: true, hat: 'mohawk', gauge: '#ff3030',
    extra: (R, f, b) => { R('#d03030', 5, 10 + b, 14, 2); R('#d03030', 17 + f, 12 + b, 5, 2); R('#d0d8e8', 0, 6 + b, 2, 16); R('#ffffff', 0, 6 + b, 1, 8); R('#d0d8e8', 22, 6 + b, 2, 16); R('#ffffff', 23, 6 + b, 1, 8); } }), 2);
  build('scrap', 24, BH, (R, f, g) => bot(R, f, { body: '#5a9a4a', trim: '#e8a030', dark: '#2a4a24', head: '#7a8a60', eye: '#ffa030', hat: 'mask', gauge: '#ffa030',
    extra: (R, f, b) => { R('#6a6a78', 0, 12 + b, 5, 10); R('#3a3a40', 1, 10 + b, 3, 2); R(f ? '#e8f0f8' : '#c8d8e8', 0, 6 + b - f, 3, 3); R('#ffd040', 19, 18 + b, 5, 1); R('#9a9aa4', 21, 16 + b, 2, 5); R('#c0c0c8', 18, 0 + b, 5, 3); R('#ff4040', 20, 1 + b, 1, 1); } }), 2);

  // ===== ENEMIES: rusty scrag bots and royal guard bots =====
  build('raider', 24, BH, (R, f, g) => bot(R, f, { body: '#7a4a2a', trim: '#4a2a1a', dark: '#2a1a10', head: '#8a5a3a', eye: '#ff4040', light: '#ffffff22', hat: 'cap', hatc: '#a02a2a',
    extra: (R, f, b) => { R('#a02a2a', 6, 11 + b, 12, 2); R('#8a8a94', 20, 9 + b, 2, 12); R('#c8c8d0', 20, 9 + b, 2, 2); } }), 2);
  build('gunner', 24, BH, (R, f, g) => bot(R, f, { body: '#2a4a8a', trim: '#e8e8f0', dark: '#1a2a50', head: '#3a5aa0', eye: '#ff4040', hat: 'helm', hatc: '#e8e8f0', hatb: '#e04040',
    extra: (R, f, b) => { R('#2a2a38', 15, 17 + b, 9, 2); R('#6a6a78', 21, 16 + b, 3, 1); R('#ffd040', 7, 14 + b, 2, 1); } }), 2);

  build('drone', 20, 16, (R, f) => {
    R('#7a3a98', 4, 1, 12, 8); R('#a060c8', 4, 1, 12, 2); R('#ff40a0', 7, 4, 2, 2); R('#ff40a0', 11, 4, 2, 2);
    for (let i = 0; i < 4; i++) { R('#5a2a78', 4 + i * 4, 9, 2, 5 + ((i + f) % 2)); R('#5a2a78', 5 + i * 4, 13 + ((i + f) % 2), 1, 2); }
  }, 2);
  build('worm', 24, 24, (R, f) => {
    R('#6a4a2a', 4, 14, 16, 10); R('#8a6a3a', 6, 8, 12, 14); R('#b08850', 7, 4, 10, 12); R('#c8a060', 8, 1, 8, 6);
    R('#2a0a10', 8, 6, 8, 8); R('#d8d0c0', 9, 6, 1, 3); R('#d8d0c0', 12, 6, 1, 3); R('#d8d0c0', 14, 6, 1, 3); R('#ff3030', 10, 9 + f, 4, 3);
    R('#8a6a3a', 5, 16, 3, 3); R('#8a6a3a', 16, 17, 3, 3);
  }, 2);
  build('wormdig', 20, 10, (R, f) => {
    R('#8a6a3a', 2, 5, 16, 5); R('#a88850', 4, 3, 12, 4); R('#c8a870', 7, 1 + f, 6, 3); R('#6a4a2a', 1, 8, 18, 2);
  }, 2);
  build('brute', 30, 34, (R, f) => { const b = f ? 1 : 0;
    R('#2a2a30', 6, 28, 6, 6); R('#2a2a30', 18, 28 - b, 6, 6 + b);
    R('#6a4a3a', 4, 12 + b, 22, 16); R('#3a2418', 4, 23 + b, 22, 5); R('#8a6a50', 4, 12 + b, 22, 3);
    R('#d8d8d8', 2, 10 + b, 4, 4); R('#d8d8d8', 24, 10 + b, 4, 4);
    R('#8a8a98', 9, 2 + b, 12, 11); R('#3a3a40', 9, 6 + b, 12, 4); R('#ff4040', 11, 7 + b, 3, 2); R('#ff4040', 16, 7 + b, 3, 2);
    R('#8a8a98', 0, 14 + b, 4, 8); R('#8a8a98', 26, 14 + b, 4, 8); R('#c8c8d0', 27, 8 + b, 3, 14);
  }, 2);
  build('boss', 56, 60, (R, f) => {       // the Giant Hand: a rogue crane claw
    R('#3a3a44', 20, 40, 16, 20); R('#5a5a68', 22, 40, 12, 20); R('#ff3030', 24, 44 + f, 8, 3);
    R('#6a6a78', 8, 20, 40, 24); R('#8a8a98', 8, 20, 40, 4); R('#4a4a58', 8, 38, 40, 6);
    R('#ff3030', 24, 28, 8, 8); R('#ffd0d0', 26, 30, 4, 4);
    [[8, 2 + f], [18, 0], [28, 0], [38, 2 + f]].forEach(p => { R('#6a6a78', p[0], p[1], 9, 20); R('#8a8a98', p[0], p[1], 9, 3); R('#3a3a44', p[0] + 3, p[1] + 14, 3, 6); });
    R('#6a6a78', 0, 26, 9, 8); R('#6a6a78', 46, 30, 9, 8); R('#ff3030', 10, 32, 3, 3); R('#ff3030', 43, 32, 3, 3);
  }, 2);
  build('walker', 56, 60, (R, f) => {      // Ezra Vance's war-walker: blue steel, gold V, top hat
    R('#1a2238', 10, 56 - f, 14, 4 + f); R('#1a2238', 32, 55 + f, 14, 5 - f);
    R('#2a3560', 14, 44, 8, 13 - f); R('#2a3560', 34, 44, 8, 12 + f);
    R('#3a4a78', 12, 38, 32, 8);
    R('#4a5a90', 8, 16, 40, 24); R('#6a7ab0', 8, 16, 40, 3); R('#2a3560', 8, 36, 40, 4);
    [[10, 20], [44, 20], [10, 34], [44, 34]].forEach(p => R('#fff8d0', p[0], p[1], 2, 2));
    R('#e8c040', 21, 21, 4, 9); R('#e8c040', 31, 21, 4, 9); R('#e8c040', 23, 30, 4, 2); R('#e8c040', 29, 30, 4, 2); R('#e8c040', 25, 32, 6, 3);
    R('#3a4a78', 0, 18, 8, 16); R('#1a1a28', 1, 32, 6, 8); R('#ff8a20', 2, 40 + f, 4, 2);
    R('#3a4a78', 48, 18, 8, 16); R('#8a8a98', 49, 32, 6, 10); R('#ffd040', 51, 42 + f, 2, 2);
    R('#3a4a78', 17, 7, 22, 11); R('#0a0a12', 19, 9, 18, 6); R('#ff3030', 21, 10, 5, 3); R('#ff3030', 30, 10, 5, 3); R('#ffd0d0', 22, 10, 1, 1); R('#ffd0d0', 31, 10, 1, 1);
    R('#1a1a28', 21, 1, 14, 7); R('#e8c040', 21, 5, 14, 1); R('#1a1a28', 17, 7, 22, 1);
  }, 2);
  build('warden', 56, 60, (R, f) => {      // WARDEN-1: Calloway's oversized sheriff-bot
    R('#2a3440', 14, 56, 12, 4); R('#2a3440', 30, 56, 12, 4);
    R('#3a4a58', 16, 42, 10, 15); R('#3a4a58', 30, 42, 10, 15);
    R('#4a5a6a', 14, 36, 28, 8);
    R('#5a6a7a', 10, 19, 36, 20); R('#7a8a9a', 10, 19, 36, 3); R('#3a4a58', 10, 35, 36, 4);
    R('#4a5a6a', 1, 19, 10, 10); R('#4a5a6a', 45, 19, 10, 10); R('#7a8a9a', 1, 19, 10, 2); R('#7a8a9a', 45, 19, 10, 2);
    R('#3a4a58', 2, 29, 8, 14); R('#3a4a58', 46, 29, 8, 14);
    R('#2a2a34', 0, 42, 10, 5); R('#8a8a98', 0, 44, 3, 8); R('#2a2a34', 46, 42, 10, 5); R('#8a8a98', 53, 44, 3, 8);
    R('#e8d080', 26, 22, 4, 12); R('#e8d080', 22, 26, 12, 4); R('#e8d080', 24, 24, 8, 8); R(f ? '#40f0e0' : '#208a80', 27, 27, 2, 2);
    R('#7a8a9a', 20, 8, 16, 12); R('#3a4a58', 20, 17, 16, 3); R('#0a0a12', 22, 11, 12, 4); R('#40f0e0', 24, 12, 8, 2);
    R('#5a4a38', 7, 5, 42, 3); R('#8a7a5a', 7, 5, 42, 1); R('#6a5a44', 18, 0, 20, 7); R('#2a1a10', 18, 4, 20, 1);
  }, 2);
  build('crate', 18, 16, R => { R('#4a6a8a', 1, 2, 16, 13); R('#6a8aaa', 1, 2, 16, 3); R('#2a3a5a', 1, 12, 16, 3); R('#ffd040', 7, 6, 4, 4); R('#2a3a5a', 8, 7, 2, 2); });
  build('gear_weapon', 14, 14, R => { R('#c0c0c8', 1, 5, 10, 4); R('#6a6a78', 1, 5, 10, 1); R('#3a3a40', 9, 9, 4, 4); R('#ffd040', 11, 4, 2, 2); });
  build('gear_armor', 14, 14, R => { R('#c0c0c8', 2, 2, 10, 11); R('#6a6a78', 2, 9, 10, 4); R('#e8e8f0', 2, 2, 10, 2); R('#3a3a40', 6, 4, 2, 5); });
  build('gear_core', 14, 14, R => { R('#c0c0c8', 4, 1, 6, 12); R('#c0c0c8', 1, 4, 12, 6); R('#40f0e0', 5, 5, 4, 4); R('#e8fcff', 6, 6, 2, 2); });

  // ===== BACKGROUNDS (baked once) =====
  function bakeArena(ch) {
    const c = mk(320, 180), g = c.getContext('2d'), r = mulberry(ch * 31 + 5);
    const R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    if (ch === 1) {
      R('#3a3a44', 0, 0, 320, 180);
      for (let i = 0; i < 700; i++) R(r() > 0.5 ? '#44444e' : '#30303a', r() * 320 | 0, r() * 180 | 0, 2, 1);
      R('#2e2e38', 0, 70, 320, 70);
      for (let x = 0; x < 320; x += 24) R('#d8b840', x, 104, 12, 2);
      for (let i = 0; i < 6; i++) { let x = r() * 320, y = r() * 180; for (let k = 0; k < 8; k++) { R('#22222a', x | 0, y | 0, 2, 1); x += r() * 6 - 3; y += r() * 4 - 2; } }
      for (let i = 0; i < 9; i++) { const x = r() * 300 | 0, y = (r() * 150 | 0) + 20; R('#5a5a66', x, y, 12, 6); R('#6a6a78', x + 1, y, 10, 2); R('#2a2a32', x, y + 5, 12, 2); }
      [[22, 18], [250, 22], [150, 150], [290, 150]].forEach(p => { R('#4a3a30', p[0], p[1], 22, 12); R('#6a5a4a', p[0] + 2, p[1] - 2, 10, 6); R('#2a2a30', p[0] + 1, p[1] + 10, 5, 3); R('#2a2a30', p[0] + 15, p[1] + 10, 5, 3); });
    } else if (ch === 3) {        // the dry reservoir bed: cracked mud, concrete slabs, drain grates, old pipes
      R('#3a3a3c', 0, 0, 320, 180);
      for (let i = 0; i < 800; i++) R(r() > 0.5 ? '#46464a' : '#2e2e32', r() * 320 | 0, r() * 180 | 0, 2, 1);
      for (let i = 0; i < 14; i++) { let x = r() * 320, y = r() * 180; for (let k = 0; k < 10; k++) { R('#1a1a1e', x | 0, y | 0, 2, 1); x += r() * 8 - 4; y += r() * 6 - 3; } }
      [[26, 44, 64, 34], [208, 104, 70, 38], [120, 130, 48, 26]].forEach(p => { R('#56585e', p[0], p[1], p[2], p[3]); R('#6a6c74', p[0], p[1], p[2], 2); R('#2a2a30', p[0], p[1] + p[3] - 3, p[2], 3); R('#3a3c42', p[0] + (p[2] >> 1), p[1], 1, p[3]); });
      [[150, 62], [60, 120], [270, 70], [240, 150]].forEach(p => { R('#14141a', p[0], p[1], 16, 9); for (let k = 0; k < 4; k++) R('#2a2a32', p[0] + 2 + k * 4, p[1], 1, 9); });
      R('#4a4c54', 0, 10, 320, 6); R('#6a6c76', 0, 10, 320, 1); R('#2a2a30', 0, 15, 320, 1);
      for (let x = 20; x < 320; x += 48) { R('#5a5c66', x, 8, 4, 10); R('#7a7c88', x, 8, 4, 1); }
      for (let i = 0; i < 6; i++) { const x = r() * 300 | 0; R('#2a3a46', x, 17, 2, 4 + (r() * 12 | 0)); }
    } else {
      R('#c8a468', 0, 0, 320, 180);
      for (let i = 0; i < 900; i++) R(r() > 0.5 ? '#d4b074' : '#b89258', r() * 320 | 0, r() * 180 | 0, 2, 1);
      for (let y = 0; y < 180; y += 30) { for (let x = 0; x < 320; x += 2) { const yy = y + Math.sin(x * 0.04 + y) * 4 | 0; R('#b08a50', x, yy, 2, 1); R('#d8b878', x, yy + 1, 2, 1); } }
      for (let i = 0; i < 8; i++) { const x = r() * 300 | 0, y = (r() * 150 | 0) + 20; R('#7a6a5a', x, y, 5, 5); R('#9a8a7a', x, y, 5, 2); }
      for (let i = 0; i < 4; i++) { const x = r() * 300 | 0, y = (r() * 150 | 0) + 20; R('#e8e0c8', x, y, 8, 1); R('#e8e0c8', x + 2, y - 2, 1, 5); }
      [[40, 30], [260, 140]].forEach(p => { R('#6a4a3a', p[0], p[1], 3, 16); R('#6a4a3a', p[0] - 5, p[1] + 4, 13, 2); R('#8a6a50', p[0], p[1], 1, 16); });
    }
    return c;
  }
  const bgCache = {};
  function arena(ch) { return bgCache[ch] || (bgCache[ch] = bakeArena(ch)); }
  function drawEarth(g, cx, cy, r) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r) continue;
      const n = hash2(Math.floor((x + 99) / 4), Math.floor((y + 99) / 3), 9), cl = hash2(Math.floor((x + 99) / 3), Math.floor((y + 99) / 2), 4);
      let col = n > 0.55 ? '#4a7a3a' : n > 0.48 ? '#8a7a4a' : '#2a5a9a';
      if (cl > 0.78) col = '#d8e8f0';
      if (x + y * 0.3 > r * 0.45) col = col === '#d8e8f0' ? '#8a98a8' : '#101a30';
      g.fillStyle = col; g.fillRect(cx + x, cy + y, 1, 1);
    }
    g.fillStyle = 'rgba(120,180,255,0.35)';
    for (let a = 0; a < 6.28; a += 0.05) g.fillRect(cx + Math.round(Math.cos(a) * (r + 1)), cy + Math.round(Math.sin(a) * (r + 1)), 1, 1);
  }
  // Hollow Creek: a dusk-red desert outpost under the Ark Halcyon, with a saloon, a dry water tower and a boardwalk
  function bakeHub() {
    const c = mk(320, 180), g = c.getContext('2d'), r = mulberry(8);
    const R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    ['#0a0818', '#120c24', '#1c1030', '#2a1638', '#3a1c40', '#52264a', '#6e3050'].forEach((col, i) => R(col, 0, i * 16, 320, 17));
    for (let i = 0; i < 90; i++) R(r() > 0.8 ? '#ffffff' : '#9a8ab8', r() * 320 | 0, r() * 70 | 0, 1, 1);
    // Ark Halcyon in orbit
    R('rgba(120,200,255,0.10)', 196, 14, 84, 36); R('rgba(120,200,255,0.12)', 206, 20, 64, 24);
    R('#8a90b8', 214, 28, 52, 7); R('#c0c8e8', 214, 28, 52, 2); R('#4a5078', 214, 33, 52, 2);
    R('#6a7098', 206, 29, 8, 5); R('#40f0e0', 202, 30, 4, 2); R('#6a7098', 232, 22, 4, 6); R('#6a7098', 232, 35, 4, 6);
    for (let x = 218; x < 264; x += 6) R('#ffe090', x, 31, 2, 1);
    // mesas and horizon
    R('#2a1430', 0, 98, 320, 16);
    [[8, 82, 52, 17], [140, 90, 62, 9], [262, 78, 50, 21]].forEach(p => { R('#2e1632', p[0], p[1], p[2], p[3]); R('#3e1c3e', p[0], p[1], p[2], 2); });
    R('#3a2230', 0, 106, 320, 28);
    // saloon with false front
    R('#160c16', 150, 92, 46, 40); R('#160c16', 146, 84, 54, 11); R('#c8903a', 156, 87, 34, 4); R('#e8b858', 156, 87, 34, 1);
    R('#ffcc60', 156, 102, 6, 9); R('#ffcc60', 170, 102, 6, 9); R('#ffcc60', 184, 102, 6, 9); R('#c88a30', 168, 118, 10, 14); R('#160c16', 172, 118, 2, 14);
    // shack and dry water tower
    R('#160c16', 108, 104, 32, 28); R('#160c16', 104, 100, 40, 6); R('#ffcc60', 114, 110, 6, 7);
    R('#160c16', 250, 94, 2, 38); R('#160c16', 266, 94, 2, 38); R('#241420', 245, 76, 28, 16); R('#241420', 249, 70, 20, 7); R('#3a2230', 245, 76, 28, 1);
    R('#160c16', 232, 108, 2, 24); R('#160c16', 228, 112, 10, 1);
    // cactus
    R('#1a2a1e', 76, 112, 3, 20); R('#1a2a1e', 72, 118, 3, 2); R('#1a2a1e', 72, 112, 2, 8); R('#1a2a1e', 79, 120, 5, 2); R('#1a2a1e', 82, 114, 2, 8);
    // boardwalk
    R('#3a2a22', 0, 130, 320, 50); R('#5a4034', 0, 130, 320, 2); R('#2a1c18', 0, 132, 320, 1);
    for (let y = 138; y < 180; y += 8) { R('#2a1c18', 0, y, 320, 1); for (let x = ((y >> 3) % 2) * 20; x < 320; x += 40) R('#2a1c18', x, y - 7, 1, 7); }
    for (let i = 0; i < 70; i++) R(r() > 0.5 ? '#46342a' : '#32241c', r() * 320 | 0, 133 + (r() * 46 | 0), 3, 1);
    return c;
  }
  // ===== the customizable hero: a human in a long coat (24x36, same layout as the robots) =====
  function shade(hex, d) { const n = parseInt(hex.slice(1), 16); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, v + d)).toString(16).padStart(2, '0')).join(''); }
  const heroCache = {};
  function hero(o, f) {
    f = f || 0; const key = [o.hat, o.coat, o.skin, o.hair, o.mark, o.origin, f].join('|');
    if (heroCache[key]) return heroCache[key];
    const c = mk(24, 36), g = c.getContext('2d'), b = f ? 1 : 0;
    const R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y + 8, w, h); };
    const co = HERO_COATS[o.coat], sk = HERO_SKINS[o.skin], hr = HERO_HAIRS[o.hair], mk2 = HERO_MARKS[o.mark];
    const dk = shade(co, -45), lt = shade(co, 35), sd = shade(sk, -45);
    R('#33405e', 8, 22, 3, 5 - b); R('#33405e', 13, 22, 3, 4 + b);                       // legs
    R('#2a1a10', 7, 26 - b, 5, 2); R('#2a1a10', 12, 25 + b, 5, 2);                         // boots
    R(co, 7, 12 + b, 10, 11); R(lt, 7, 12 + b, 10, 1); R(dk, 7, 22 + b, 10, 1); R(dk, 12, 13 + b, 1, 9);   // coat
    R('#2a1a10', 7, 17 + b, 10, 2); R('#e0c050', 11, 17 + b, 2, 2);                        // belt
    R(co, 4, 12 + b, 3, 8); R(co, 17, 12 + b, 3, 8); R(dk, 4, 19 + b, 3, 1); R(dk, 17, 19 + b, 3, 1);       // arms
    R(sk, 4, 20 + b, 3, 2); R(sk, 17, 20 + b, 3, 2); R(mk2, 18, 21 + b, 1, 1);             // hands, Seal on the right
    if (o.origin === 'guard') { R('#ffd040', 14, 14 + b, 2, 2); R('#fff0a0', 14, 14 + b, 1, 1); }
    if (o.origin === 'smuggler') { R('#b02a2a', 8, 10 + b, 8, 2); R('#b02a2a', 15, 11 + b, 2, 3); }
    if (o.origin === 'courier') { R('#6a4a2a', 8, 12 + b, 2, 1); R('#6a4a2a', 9, 13 + b, 2, 1); R('#6a4a2a', 10, 14 + b, 2, 1); R('#6a4a2a', 11, 15 + b, 2, 1); R('#8a6a3a', 15, 19 + b, 5, 5); R('#6a4a2a', 15, 19 + b, 5, 1); }
    R(sd, 11, 10 + b, 2, 2);                                                                // neck
    R(sk, 8, 2 + b, 8, 8); R(sk, 7, 4 + b, 1, 3); R(sk, 16, 4 + b, 1, 3);                  // head and ears
    R(hr, 8, 2 + b, 8, 2); R(hr, 7, 3 + b, 1, 2); R(hr, 16, 3 + b, 1, 2);                  // hair
    R('#1a1a22', 10, 6 + b, 1, 2); R('#1a1a22', 13, 6 + b, 1, 2); R(sd, 11, 9 + b, 2, 1);  // eyes, mouth
    if (o.origin === 'tech') { R('#305070', 8, 5 + b, 8, 3); R('#80e0ff', 9, 5 + b, 2, 2); R('#80e0ff', 13, 5 + b, 2, 2); }
    if (o.hat === 0) { R('#6a4a2a', 4, 2 + b, 16, 2); R('#7a5a38', 7, -3 + b, 10, 6); R('#2a1a10', 7, 0 + b, 10, 1); }
    else if (o.hat === 1) { R('#4a4a52', 7, -1 + b, 10, 4); R('#3a3a42', 6, 2 + b, 14, 1); R('#5a5a64', 7, -1 + b, 10, 1); }
    else if (o.hat === 2) { R(co, 6, -1 + b, 12, 4); R(dk, 6, 3 + b, 2, 6); R(dk, 16, 3 + b, 2, 6); R(lt, 6, -1 + b, 12, 1); }
    else { R('#b02a2a', 8, 2 + b, 8, 2); R('#8a1a1a', 8, 3 + b, 8, 1); R('#b02a2a', 16, 3 + b, 3, 2); }
    R(mk2, 8, 5 + b, 1, 3); if (f) R('#ffffff', 8, 5 + b, 1, 1);                           // Seal glow at the temple
    return (heroCache[key] = outline(c));
  }
  let hubBg = null;
  function hub() { return hubBg || (hubBg = bakeHub()); }
  const icoCache = {};
  function sprite(name, f) { const l = S[name]; return l[(f || 0) % l.length]; }
  return { mk, tint, outline, sprite, arena, hub, drawEarth, hero, S };
})();
