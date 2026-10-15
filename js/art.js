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
  // ---- double-resolution sprites (k = 2): 48x72 px for a 24x36 logical cell; .lw/.lh hold the logical size ----
  function detail(c) {      // rim light on top/left edges and shade on bottom/right edges of the silhouette
    const g = c.getContext('2d'), w = c.width, h = c.height, id = g.getImageData(0, 0, w, h), d = id.data, o = new Uint8ClampedArray(d);
    const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : o[(y * w + x) * 4 + 3];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (o[i + 3] < 128) continue;
      let dl = 0; if (!A(x, y - 1)) dl += 34; if (!A(x - 1, y)) dl += 16; if (!A(x, y + 1)) dl -= 40; if (!A(x + 1, y)) dl -= 20;
      if (dl) { d[i] += dl; d[i + 1] += dl; d[i + 2] += dl; }
    }
    g.putImageData(id, 0, 0); return c;
  }
  function finish(c) {
    detail(c);
    const o = mk(c.width + 4, c.height + 4), g = o.getContext('2d'), d = tint(c, '#0a0610');
    [[1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [1, 3], [2, 3], [3, 3]].forEach(p => g.drawImage(d, p[0], p[1]));
    g.drawImage(c, 2, 2); o.lw = o.width / 2; o.lh = o.height / 2; return o;
  }
  function build2(name, fn, frames) {
    const list = [];
    for (let f = 0; f < (frames || 1); f++) {
      const c = mk(48, 72), g = c.getContext('2d');
      const R = (col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
      fn(R, f); list.push(finish(c));
    }
    S[name] = list;
  }
  function build(name, w, h, fn, frames) {
    const list = [];
    for (let f = 0; f < (frames || 1); f++) {
      const c = mk(w, h), g = c.getContext('2d');
      const R = (col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
      fn(R, f, g); const oc = outline(c); oc.lw = oc.width; oc.lh = oc.height; list.push(oc);
    }
    S[name] = list;
  }

  // ===== STEAMBOT FAMILY (SteamWorld Heist look), drawn at DOUBLE resolution (48x72 px per 24x36 logical cell) =====
  function bot(R0, f, o) {
    const Y = 16, b = f ? 2 : 0;
    const R = (c, x, y, w, h) => R0(c, x, y + Y, w, h);
    const S2 = (c, x, y, w, h) => R(c, x * 2, y * 2, w * 2, h * 2);    // old 24x36 coordinates (used by the per-bot extras)
    const c = o.body, t = o.trim, d = o.dark, hd = o.head || c, L = o.light || '#ffffff55', e = o.eye;
    const cl = shade(c, 38), cd = shade(c, -30), tl = shade(t, 40), td = shade(t, -35), dd = shade(d, -25), hl = shade(hd, 40), hk = shade(hd, -35);
    const gc = o.gauge || '#ffe090';
    // legs (pipes with knee rings) and boots
    R(d, 16, 44, 6, 10 - b); R(dd, 20, 44, 2, 10 - b); R(t, 15, 47, 8, 2); R(tl, 15, 47, 8, 1);
    R(d, 26, 44, 6, 8 + b); R(dd, 30, 44, 2, 8 + b); R(t, 25, 47, 8, 2); R(tl, 25, 47, 8, 1);
    R(t, 14, 52 - b, 10, 4); R(tl, 14, 52 - b, 10, 1); R(td, 14, 55 - b, 10, 1); R(td, 14, 54 - b, 2, 1);
    R(t, 24, 50 + b, 10, 4); R(tl, 24, 50 + b, 10, 1); R(td, 24, 53 + b, 10, 1); R(td, 24, 52 + b, 2, 1);
    // torso: plated body, inset chest panel, trim band, vents, rivets
    R(c, 12, 24 + b, 24, 20); R(L, 12, 24 + b, 24, 2); R(cl, 12, 26 + b, 2, 14); R(cd, 34, 26 + b, 2, 14);
    R(d, 12, 40 + b, 24, 4); R(dd, 12, 43 + b, 24, 1);
    R(cd, 14, 26 + b, 20, 8); R(c, 15, 27 + b, 18, 6); R(cl, 15, 27 + b, 18, 1); R(cd, 15, 32 + b, 18, 1);
    R(t, 12, 34 + b, 24, 2); R(tl, 12, 34 + b, 24, 1); R(td, 12, 35 + b, 24, 1);
    R(cd, 23, 36 + b, 2, 4); R(dd, 15, 37 + b, 5, 1); R(dd, 15, 39 + b, 5, 1); R(dd, 28, 37 + b, 5, 1); R(dd, 28, 39 + b, 5, 1);
    [[13, 25], [33, 25], [13, 41], [33, 41]].forEach(p => { R('#fff8d0', p[0], p[1] + b, 2, 2); R('#ffffff', p[0], p[1] + b, 1, 1); R('#8a7a50', p[0] + 1, p[1] + 1 + b, 1, 1); });
    if (!o.nogauge) { R(d, 19, 28 + b, 10, 5); R('#0a0a12', 20, 29 + b, 8, 3); R(shade(gc, -70), 21, 30 + b, 6, 1); R(gc, 21, 30 + b, 4, 1); R('#ffffff', 24, 29 + b, 1, 3); R(gc, 20, 29 + b, 1, 1); }
    // shoulder pads, arms, hands
    const sw = o.wide ? 4 : 0;
    R(t, 6 - sw, 22 + b, 8 + sw, 8); R(tl, 6 - sw, 22 + b, 8 + sw, 2); R(td, 6 - sw, 29 + b, 8 + sw, 1); R(tl, 8 - sw, 25 + b, 2, 2);
    R(t, 34, 22 + b, 8 + sw, 8); R(tl, 34, 22 + b, 8 + sw, 2); R(td, 34, 29 + b, 8 + sw, 1); R(tl, 36, 25 + b, 2, 2);
    R(d, 6, 30 + b, 6, 12); R(dd, 10, 30 + b, 2, 12); R(t, 6, 35 + b, 6, 2); R(tl, 6, 35 + b, 6, 1); R(t, 6, 40 + b, 6, 4); R(tl, 6, 40 + b, 6, 1); R(td, 8, 43 + b, 1, 1); R(td, 10, 43 + b, 1, 1);
    R(d, 36, 30 + b, 6, 12); R(dd, 40, 30 + b, 2, 12); R(t, 36, 35 + b, 6, 2); R(tl, 36, 35 + b, 6, 1); R(t, 36, 40 + b, 6, 4); R(tl, 36, 40 + b, 6, 1); R(td, 38, 43 + b, 1, 1); R(td, 40, 43 + b, 1, 1);
    // neck and head
    R(d, 20, 20 + b, 8, 4); R(t, 20, 21 + b, 8, 1); R(dd, 20, 23 + b, 8, 1);
    R(hd, 14, 2 + b, 20, 2); R(hd, 12, 4 + b, 24, 16); R(hd, 14, 20 + b, 20, 2);
    R(hl, 14, 2 + b, 20, 1); R(L, 14, 4 + b, 20, 2); R(hl, 12, 6 + b, 2, 10); R(hk, 34, 6 + b, 2, 10); R(hk, 12, 18 + b, 24, 2); R(hk, 14, 20 + b, 20, 2); R(d, 14, 21 + b, 20, 1);
    R(t, 9, 10 + b, 3, 6); R(tl, 9, 10 + b, 3, 1); R(td, 9, 15 + b, 3, 1); R(d, 10, 12 + b, 1, 2);
    R(t, 36, 10 + b, 3, 6); R(tl, 36, 10 + b, 3, 1); R(td, 36, 15 + b, 3, 1); R(d, 37, 12 + b, 1, 2);
    if (o.cyclops) {
      R('#0a0a12', 16, 8 + b, 16, 10); R(shade(e, -80), 17, 9 + b, 14, 8); R(e, 18, 10 + b, 12, 6); R(shade(e, 70), 18, 10 + b, 12, 2);
      R('#ffffff', 19, 10 + b, 4, 2); R('#0a0a12', 23, 12 + b, 3, 3); R(shade(e, -55), 18, 15 + b, 12, 1);
    } else if (o.slit) {
      R('#0a0a12', 14, 10 + b, 20, 6); R(shade(e, -60), 15, 11 + b, 18, 4); R(e, 16, 12 + b, 16, 2); R(shade(e, 80), 16, 12 + b, 16, 1); R('#ffffff', 16, 12 + b, 3, 1);
    } else {
      [14, 26].forEach(x => { R('#0a0a12', x, 8 + b, 8, 10); R(shade(e, -80), x + 1, 9 + b, 6, 8); R(e, x + 2, 10 + b, 4, 6); R(shade(e, 70), x + 2, 10 + b, 4, 2); R('#ffffff', x + 2, 10 + b, 2, 2); R(shade(e, -55), x + 2, 15 + b, 4, 1); });
    }
    R(dd, 21, 19 + b, 6, 1); R(hl, 22, 19 + b, 1, 1); R(hl, 24, 19 + b, 1, 1);
    // hats
    const hc = o.hatc || t, hb = o.hatb || '#e0a030', hcl = shade(hc, 35), hcd = shade(hc, -35);
    if (o.hat === 'floppy') { R(hc, 4, 4 + b, 40, 4); R(hcl, 4, 4 + b, 40, 1); R(hcd, 4, 7 + b, 40, 1); R(hc, 12, -6 + b, 24, 12); R(hcl, 12, -6 + b, 24, 2); R(hcd, 32, -4 + b, 4, 10); R(hb, 12, 0 + b, 24, 2); R(shade(hb, 40), 12, 0 + b, 24, 1); R(hcd, 22, -6 + b, 4, 3); }
    else if (o.hat === 'tophat') { R(hc, 10, 2 + b, 28, 2); R(hc, 14, -10 + b, 20, 12); R(hcl, 14, -10 + b, 20, 2); R(hcd, 30, -8 + b, 4, 10); R(hb, 14, -2 + b, 20, 2); }
    else if (o.hat === 'coil') { R(hc, 10, 2 + b, 28, 2); R(hcl, 10, 2 + b, 28, 1); R(hc, 14, -8 + b, 20, 10); R(hcl, 14, -8 + b, 20, 2); R(hcd, 30, -6 + b, 4, 8); R(hb, 14, -2 + b, 20, 2); R('#9a9aa4', 22, -14 + b, 4, 6); R('#c8c8d0', 22, -14 + b, 1, 6); R(f ? '#80f0ff' : '#ffffff', 20, -16 + b, 8, 2); }
    else if (o.hat === 'medic') { R('#ffffff', 12, -2 + b, 24, 6); R('#c8d8d0', 12, 3 + b, 24, 1); R('#e04040', 22, -2 + b, 4, 6); R('#e04040', 20, 0 + b, 8, 2); R('#ff8080', 22, -2 + b, 1, 2); }
    else if (o.hat === 'mask') { R('#444450', 12, -4 + b, 24, 10); R('#5a5a68', 12, -4 + b, 24, 2); R('#2a2a34', 12, 4 + b, 24, 2); R('#ffa030', 14, 0 + b, 20, 2); R('#ffd080', 14, 0 + b, 20, 1); R('#2a2a34', 20, 3 + b, 1, 2); R('#2a2a34', 24, 3 + b, 1, 2); R('#2a2a34', 28, 3 + b, 1, 2); }
    else if (o.hat === 'goggles') { R('#305070', 12, 2 + b, 24, 4); R('#4a7090', 12, 2 + b, 24, 1); [13, 25].forEach(x => { R('#1a2a3a', x, -1 + b, 10, 8); R('#80e0ff', x + 1, 0 + b, 8, 6); R('#c8f4ff', x + 1, 0 + b, 8, 2); R('#ffffff', x + 1, 0 + b, 2, 2); }); }
    else if (o.hat === 'helm') { R(hc, 12, -4 + b, 24, 10); R(hc, 14, -6 + b, 20, 2); R(hcl, 14, -6 + b, 20, 1); R(hcl, 12, -4 + b, 2, 10); R(hcd, 34, -4 + b, 2, 10); R(hcd, 12, 5 + b, 24, 1); R(hb, 22, -6 + b, 4, 12); R(shade(hb, 45), 22, -6 + b, 1, 12); }
    else if (o.hat === 'cap') { R(hc, 12, -2 + b, 24, 6); R(hcl, 12, -2 + b, 24, 2); R(d, 10, 4 + b, 28, 2); R(hcd, 12, 3 + b, 24, 1); R('#ffd040', 22, 0 + b, 4, 4); R('#fff0a0', 22, 0 + b, 2, 2); }
    else if (o.hat === 'mohawk') { R('#d03030', 20, -6 + b, 8, 10); R('#a02020', 22, -10 + b, 4, 4); R('#ff6060', 20, -6 + b, 2, 8); R('#d03030', 18, -2 + b, 2, 4); R('#d03030', 28, -2 + b, 2, 4); }
    if (o.extra) o.extra(S2, f, f ? 1 : 0);
  }
  build2('bulwark', (R, f) => bot(R, f, { body: '#5a6e8a', trim: '#3a4a68', dark: '#2a3248', light: '#ffffff44', eye: '#ffd040', hat: 'helm', hatc: '#3a4a68', hatb: '#ffd040', wide: true,
    extra: (R, f, b) => { R('#4a6a9a', 0, 10 + b, 6, 18); R('#a8c8f0', 1, 11 + b, 4, 16); R('#e8f4ff', 1, 11 + b, 4, 2); R('#2a3248', 2, 17 + b, 2, 4); R('#fff8d0', 1, 24 + b, 1, 1); } }), 2);
  build2('sight', (R, f) => bot(R, f, { body: '#8a5a3a', trim: '#d8a040', dark: '#4a2e1a', head: '#8e98ac', eye: '#40f0e0', cyclops: true, hat: 'floppy', hatc: '#7a4a2a', hatb: '#e0a030', gauge: '#40f0e0',
    extra: (R, f, b) => { R('#2a2a38', 13, 17 + b, 11, 2); R('#6a6a78', 20, 16 + b, 4, 1); R('#40f0e0', 16, 15 + b, 4, 2); R('#4a2e1a', 12, 18 + b, 3, 3); } }), 2);
  build2('mender', (R, f) => bot(R, f, { body: '#e8f0e8', trim: '#40c070', dark: '#8aa898', eye: '#40ff90', hat: 'medic', nogauge: true,
    extra: (R, f, b) => { R('#e04040', 11, 13 + b, 2, 6); R('#e04040', 9, 15 + b, 6, 2); R('#40c070', 18, 19 + b, 6, 5); R('#ffffff', 20, 20 + b, 2, 3); R('#e04040', 20, 21 + b, 2, 1); } }), 2);
  build2('ember', (R, f) => bot(R, f, { body: '#c85a28', trim: '#e8a040', dark: '#5a2a1a', head: '#d8662c', eye: '#ffd040', hat: 'helm', hatc: '#8a3a1a', hatb: '#e8a040', gauge: '#ff4020',
    extra: (R, f, b) => { R('#8a3a1a', 0, 12 + b, 5, 10); R('#5a5a64', 1, 5 + b, 2, 8); R(f ? '#d8d8e0' : '#a8a8b4', 0, 2 + b + f, 4, 3); R('#444450', 19, 17 + b, 5, 3); R(f ? '#ffd040' : '#ff8a20', 23, 17 + b, 1, 3); } }), 2);
  build2('frost', (R, f) => bot(R, f, { body: '#7ac0d8', trim: '#e8fcff', dark: '#3a6a88', head: '#a0e0f0', eye: '#3a9ae8', hat: 'goggles', light: '#ffffff88', gauge: '#80e8ff',
    extra: (R, f, b) => { R('#e8fcff', 2, 6 + b, 2, 6); R('#a0e8f8', 20, 5 + b, 2, 7); R('#5a3a2a', 21, 8 + b, 1, 18); R('#8af0ff', 20, 4 + b, 3, 4); R('#ffffff', 21, 5 + b, 1, 2); } }), 2);
  build2('arc', (R, f) => bot(R, f, { body: '#d8b020', trim: '#8a6a10', dark: '#5a4408', head: '#e8c82a', eye: '#80f0ff', hat: 'coil', hatc: '#3a3a40', hatb: '#e8c82a', nogauge: true,
    extra: (R, f, b) => { R('#3a3a40', 11, 13 + b, 3, 2); R('#3a3a40', 10, 15 + b, 3, 2); R('#3a3a40', 11, 17 + b, 2, 2); R(f ? '#80f0ff' : '#ffffff', 0, 14 + b, 2, 2); R(f ? '#ffffff' : '#80f0ff', 22, 16 + b, 2, 2); } }), 2);
  build2('blade', (R, f) => bot(R, f, { body: '#5a3a78', trim: '#8a5ab0', dark: '#2a1a3a', head: '#3a2a50', eye: '#ff3030', slit: true, hat: 'mohawk', gauge: '#ff3030',
    extra: (R, f, b) => { R('#d03030', 5, 10 + b, 14, 2); R('#d03030', 17 + f, 12 + b, 5, 2); R('#d0d8e8', 0, 6 + b, 2, 16); R('#ffffff', 0, 6 + b, 1, 8); R('#d0d8e8', 22, 6 + b, 2, 16); R('#ffffff', 23, 6 + b, 1, 8); } }), 2);
  build2('scrap', (R, f) => bot(R, f, { body: '#5a9a4a', trim: '#e8a030', dark: '#2a4a24', head: '#7a8a60', eye: '#ffa030', hat: 'mask', gauge: '#ffa030',
    extra: (R, f, b) => { R('#6a6a78', 0, 12 + b, 5, 10); R('#3a3a40', 1, 10 + b, 3, 2); R(f ? '#e8f0f8' : '#c8d8e8', 0, 6 + b - f, 3, 3); R('#ffd040', 19, 18 + b, 5, 1); R('#9a9aa4', 21, 16 + b, 2, 5); R('#c0c0c8', 18, 0 + b, 5, 3); R('#ff4040', 20, 1 + b, 1, 1); } }), 2);

  // ===== ENEMIES: rusty scrag bots and royal guard bots =====
  build2('raider', (R, f) => bot(R, f, { body: '#7a4a2a', trim: '#4a2a1a', dark: '#2a1a10', head: '#8a5a3a', eye: '#ff4040', light: '#ffffff22', hat: 'cap', hatc: '#a02a2a',
    extra: (R, f, b) => { R('#a02a2a', 6, 11 + b, 12, 2); R('#8a8a94', 20, 9 + b, 2, 12); R('#c8c8d0', 20, 9 + b, 2, 2); } }), 2);
  build2('gunner', (R, f) => bot(R, f, { body: '#2a4a8a', trim: '#e8e8f0', dark: '#1a2a50', head: '#3a5aa0', eye: '#ff4040', hat: 'helm', hatc: '#e8e8f0', hatb: '#e04040',
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
  // ===== the customizable hero: a HALF-CYBORG in a long coat (48x72 px, drawn at double resolution like the robots) =====
  function shade(hex, d) { const n = parseInt(hex.slice(1), 16); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, v + d)).toString(16).padStart(2, '0')).join(''); }
  const heroCache = {};
  function hero(o, f) {
    f = f || 0; const key = [o.hat, o.coat, o.skin, o.hair, o.mark, o.origin, f].join('|');
    if (heroCache[key]) return heroCache[key];
    const c = mk(48, 72), g = c.getContext('2d'), b = f ? 2 : 0;
    const R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y + 16, w, h); };
    const S2 = (col, x, y, w, h) => R(col, x * 2, y * 2, w * 2, h * 2);     // old 24x36 coordinates for hats and origin props
    const co = HERO_COATS[o.coat], sk = HERO_SKINS[o.skin], hr = HERO_HAIRS[o.hair], mk2 = HERO_MARKS[o.mark];
    const dk = shade(co, -45), lt = shade(co, 35), sd = shade(sk, -45), sl = shade(sk, 22);
    const M = '#8a94a2', Ml = '#c8d0dc', Md = '#4a525e', Mdd = '#2a3038', GL = '#40f0e0';
    // legs: human left, mechanical right
    R('#33405e', 16, 44, 6, 10 - b); R('#4a5a80', 16, 44, 1, 10 - b); R('#242e48', 21, 44, 1, 10 - b); R('#242e48', 16, 49, 6, 1);
    R(Md, 26, 44, 6, 8 + b); R(M, 26, 44, 2, 8 + b); R(Mdd, 31, 44, 1, 8 + b); R(Mdd, 25, 47, 8, 2); R(Ml, 27, 46, 4, 1); R(GL, 29, 49, 1, 2);
    R('#2a1a10', 14, 52 - b, 10, 4); R('#4a3020', 14, 52 - b, 10, 1); R('#120a06', 14, 55 - b, 10, 1);
    R(Mdd, 24, 50 + b, 10, 4); R(Md, 24, 50 + b, 10, 1); R(GL, 31, 52 + b, 2, 1); R('#120a10', 24, 53 + b, 10, 1);
    // long coat
    R(co, 14, 24 + b, 20, 22); R(lt, 14, 24 + b, 20, 2); R(lt, 14, 26 + b, 2, 18); R(dk, 32, 26 + b, 2, 18); R(dk, 14, 44 + b, 20, 2); R(dk, 24, 26 + b, 1, 18); R(dk, 23, 40 + b, 2, 6);
    R(dk, 16, 38 + b, 5, 1); R(lt, 16, 37 + b, 5, 1); R(dk, 28, 38 + b, 4, 1);
    R(dk, 16, 22 + b, 5, 3); R(lt, 16, 22 + b, 5, 1); R(dk, 27, 22 + b, 5, 3); R(lt, 27, 22 + b, 5, 1);
    // cybernetic chest plate with a glowing core (the coat hangs open on the right)
    R(Mdd, 25, 26 + b, 8, 8); R(Md, 26, 27 + b, 6, 6); R(M, 26, 27 + b, 6, 1); R('#0a1a22', 27, 29 + b, 4, 3); R(GL, 28, 30 + b, 2, 2); R('#e8fcff', 28, 30 + b, 1, 1); R(Ml, 26, 32 + b, 1, 1);
    // belt
    R('#2a1a10', 14, 34 + b, 20, 4); R('#4a3020', 14, 34 + b, 20, 1); R('#e0c050', 22, 34 + b, 4, 4); R('#fff0a0', 22, 34 + b, 2, 1); R('#8a6a20', 22, 37 + b, 4, 1);
    // left arm: coat sleeve and a human hand
    R(co, 8, 24 + b, 6, 14); R(lt, 8, 24 + b, 2, 14); R(dk, 12, 24 + b, 2, 14); R(dk, 8, 36 + b, 6, 2); R(lt, 8, 24 + b, 6, 1);
    R(sk, 8, 38 + b, 6, 4); R(sl, 8, 38 + b, 6, 1); R(sd, 8, 41 + b, 6, 1); R(sd, 10, 41 + b, 1, 1); R(sd, 12, 41 + b, 1, 1);
    // right arm: chrome prosthetic with joints
    R(Md, 33, 24 + b, 8, 6); R(M, 33, 24 + b, 8, 2); R(Mdd, 33, 29 + b, 8, 1); R(GL, 36, 26 + b, 2, 2);
    R(Md, 34, 30 + b, 6, 6); R(M, 34, 30 + b, 2, 6); R(Mdd, 34, 33 + b, 6, 1);
    R(Mdd, 33, 35 + b, 8, 3); R(Ml, 34, 35 + b, 6, 1);
    R(M, 34, 38 + b, 6, 4); R(Ml, 34, 38 + b, 2, 4); R(Mdd, 39, 38 + b, 1, 4);
    R(Md, 34, 41 + b, 6, 4); R(Mdd, 36, 44 + b, 1, 1); R(Mdd, 38, 44 + b, 1, 1); R(mk2, 36, 42 + b, 2, 2); R('#ffffff', 36, 42 + b, 1, 1);
    if (o.origin === 'guard') { R('#ffd040', 18, 28 + b, 4, 4); R('#fff0a0', 18, 28 + b, 2, 2); R('#8a6a10', 18, 31 + b, 4, 1); }
    if (o.origin === 'smuggler') { S2('#b02a2a', 8, 10 + b / 2, 8, 2); S2('#b02a2a', 15, 11 + b / 2, 2, 3); R('#d85050', 16, 20 + b, 16, 1); }
    if (o.origin === 'courier') { for (let i = 0; i < 4; i++) S2('#6a4a2a', 8 + i, 12 + i + b / 2, 2, 1); R('#6a4a2a', 20, 28 + b, 2, 2); R('#6a4a2a', 22, 30 + b, 2, 2); R('#6a4a2a', 24, 32 + b, 2, 2); S2('#8a6a3a', 15, 19 + b / 2, 5, 5); S2('#6a4a2a', 15, 19 + b / 2, 5, 1); R('#c8a050', 32, 40 + b, 2, 2); }
    // neck, head: human on the left, machine on the right
    R(sd, 22, 20 + b, 2, 4); R(Md, 24, 20 + b, 2, 4); R(Mdd, 22, 22 + b, 4, 1);
    R(sk, 16, 4 + b, 8, 16); R(sl, 16, 4 + b, 2, 10); R(sd, 16, 18 + b, 8, 2); R(sd, 22, 12 + b, 2, 2);
    R(M, 24, 4 + b, 8, 16); R(Ml, 24, 4 + b, 8, 1); R(Mdd, 24, 4 + b, 1, 16); R(Md, 24, 16 + b, 8, 4); R(Md, 25, 14 + b, 6, 1); R(Ml, 30, 6 + b, 1, 1); R(Ml, 30, 12 + b, 1, 1); R(Mdd, 31, 4 + b, 1, 16);
    R(sk, 14, 8 + b, 2, 6); R(sd, 14, 12 + b, 2, 2);
    R(Md, 32, 8 + b, 2, 6); R(Ml, 32, 8 + b, 2, 1); R(Mdd, 33, 4 + b, 1, 4); R('#ff4040', 33, 3 + b, 1, 1);
    R(hr, 16, 4 + b, 16, 4); R(shade(hr, 30), 18, 4 + b, 6, 1); R(hr, 14, 6 + b, 2, 4); R(hr, 16, 8 + b, 2, 2);
    R('#e8e0d8', 19, 12 + b, 3, 3); R('#1a1a22', 20, 12 + b, 2, 3); R('#ffffff', 19, 12 + b, 1, 1); R(sd, 19, 17 + b, 4, 1);
    R('#0a0a12', 26, 11 + b, 5, 5); R('#ff3040', 27, 12 + b, 3, 3); R('#ffc0c0', 27, 12 + b, 1, 1); R('#ff3040', 24, 13 + b, 1, 1);
    if (o.origin === 'tech') { S2('#305070', 8, 5 + b / 2, 8, 3); S2('#80e0ff', 9, 5 + b / 2, 2, 2); S2('#80e0ff', 13, 5 + b / 2, 2, 2); R('#ffffff', 18, 10 + b, 2, 2); }
    // hats (old coordinates, doubled)
    const bb = b / 2;
    if (o.hat === 0) { S2('#6a4a2a', 4, 2 + bb, 16, 2); S2('#7a5a38', 7, -3 + bb, 10, 6); S2('#2a1a10', 7, 0 + bb, 10, 1); R('#8a6a44', 14, -6 + b, 20, 2); R('#4a3018', 8, 4 + b, 32, 1); }
    else if (o.hat === 1) { S2('#4a4a52', 7, -1 + bb, 10, 4); S2('#3a3a42', 6, 2 + bb, 14, 1); S2('#5a5a64', 7, -1 + bb, 10, 1); R('#6a6a74', 16, -2 + b, 16, 1); }
    else if (o.hat === 2) { S2(co, 6, -1 + bb, 12, 4); S2(dk, 6, 3 + bb, 2, 6); S2(dk, 16, 3 + bb, 2, 6); S2(lt, 6, -1 + bb, 12, 1); R(lt, 12, 0 + b, 2, 8); }
    else { S2('#b02a2a', 8, 2 + bb, 8, 2); S2('#8a1a1a', 8, 3 + bb, 8, 1); S2('#b02a2a', 16, 3 + bb, 3, 2); R('#d85050', 16, 4 + b, 12, 1); }
    // the Seal glows at the temple
    R(mk2, 16, 10 + b, 2, 6); if (f) R('#ffffff', 16, 10 + b, 2, 2);
    return (heroCache[key] = finish(c));
  }
  let hubBg = null;
  function hub() { return hubBg || (hubBg = bakeHub()); }
  const icoCache = {};
  function sprite(name, f) { const l = S[name]; return l[(f || 0) % l.length]; }
  return { mk, tint, outline, sprite, arena, hub, drawEarth, hero, S };
})();
