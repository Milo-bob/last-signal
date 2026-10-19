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
  function arena(k) { if (typeof k === 'string') return Back.ground(k); return bgCache[k] || (bgCache[k] = bakeArena(k)); }   // a number = the old per-chapter floor, a string = a floor kind from backdrops.js
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
  let hubBg = null;
  function hub() { return hubBg || (hubBg = bakeHub()); }
  const icoCache = {};
  function sprite(name, f) { const l = S[name]; return l[(f || 0) % l.length]; }
  Robots16.names.forEach(n => { S[n] = [0, 1].map(fr => Robots16.get(n, fr)); });
  Humans.names.forEach(n => { S[n] = [0, 1].map(fr => Humans.get(n, fr)); });   // the human squad members (Holt, Cog, Rose)
  Cast.names.forEach(n => { S[n] = [0, 1].map(fr => Cast.get(n, fr)); });   // the story cast (cutscene people) draw like the robots
  function icon(name, f) { const l = S[name]; return l[(f || 0) % l.length]; }
  return { mk, tint, outline, sprite, icon, arena, hub, drawEarth, hero: (o, f) => Hero16.get(o, f), sideView: true, S };
})();
