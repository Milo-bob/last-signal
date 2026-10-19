'use strict';
// ---------- backdrops: baked 320x180 pixel pictures for cutscenes, and the ground textures of the battle arenas ----------
// Back.scene(id) is a full picture (sky, far shapes, ground, props) that cutscenes stand actors in front of. Characters stand on y 105..135.
// Back.ground(kind) is the flat floor of a battle arena (the kind is set per stage in story.js, see ARENA_OF).
// Everything is drawn with filled rectangles, like the rest of the game; there are no image files.
const Back = (function () {
  const W = 320, H = 180, BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function mk() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  const mkR = g => (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  // vertical gradient from y0 to y1 through the colours, with an ordered dither between neighbours
  function sky(g, cols, y0, y1) {
    const n = cols.length;
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / (y1 - y0) * (n - 1), i = Math.min(n - 2, Math.floor(t)), f = t - i;
      g.fillStyle = cols[i]; g.fillRect(0, y, W, 1);
      if (f > 0.06) { g.fillStyle = cols[i + 1]; for (let x = 0; x < W; x++) if (f > BAYER[(y & 3) * 4 + (x & 3)] / 16) g.fillRect(x, y, 1, 1); }
    }
  }
  function blob(g, cx, cy, r, col, a) {   // a pixel disc
    g.globalAlpha = a === undefined ? 1 : a; g.fillStyle = col;
    for (let j = -r; j <= r; j++) { const w = Math.floor(Math.sqrt(Math.max(0, r * r - j * j))); g.fillRect(cx - w, cy + j, w * 2 + 1, 1); }
    g.globalAlpha = 1;
  }
  function glow(g, x, y, r, col, a) { for (let k = 5; k >= 1; k--) blob(g, x, y, Math.round(r * k / 5), col, (a || 0.18) * 0.34); }
  function stars(R, r, n, ymax, cols) { for (let i = 0; i < n; i++) R(r() > 0.85 ? (cols ? cols[1] : '#ffffff') : (cols ? cols[0] : '#9a8ab8'), r() * W, r() * ymax, 1, 1); }
  function speckle(R, r, n, y0, y1, a, b, w) { for (let i = 0; i < n; i++) R(r() > 0.5 ? a : b, r() * W, y0 + r() * (y1 - y0), w || 2, 1); }

  // ----- props: (R, x, y = base line, ...) -----
  function mesa(R, x, y, w, h, c, hi, sh) { R(c, x, y, w, h); R(hi, x, y, w, 2); R(sh, x + w - 4, y + 2, 4, h - 2); R(c, x - 3, y + 5, 3, h - 5); R(c, x + w, y + 7, 3, h - 7); }
  function post(R, x, y, h, c) { R(c || '#1a1210', x, y - h, 2, h); }
  function tent(R, x, y, w, c, burnt) { for (let i = 0; i < w / 2; i++) R(c, x + i, y - Math.round(i * 0.9) - 2, w - i * 2, 1); R(burnt ? '#0a0806' : '#1a1210', x + w / 2 - 1, y - w * 0.45, 2, 4); }
  function tracks(R, x0, x1, y, tie, rail) { for (let x = x0; x < x1; x += 7) R(tie, x, y + 2, 4, 3); R(rail, x0, y, x1 - x0, 1); R('#2a2a34', x0, y + 1, x1 - x0, 1); R(rail, x0, y + 3, x1 - x0, 1); }
  function wheel(R, x, y, r, c) { blob(R.g, x, y, r, '#0a0810'); blob(R.g, x, y, Math.max(1, r - 1), c); R('#0a0810', x - 1, y - 1, 2, 2); }
  function loco(R, x, y, fire) {   // a dead steam locomotive, nose to the right
    R('#1a1a24', x, y - 22, 56, 14); R('#2e2e3c', x, y - 22, 56, 2); R('#1a1a24', x + 4, y - 38, 10, 17); R('#2e2e3c', x + 2, y - 40, 14, 3);
    R('#2a2230', x + 52, y - 18, 8, 10); R('#14141c', x + 22, y - 34, 24, 12); R('#2e2e3c', x + 22, y - 34, 24, 2); R('#0a0a10', x + 26, y - 30, 7, 6);
    R('#3a3a48', x - 4, y - 8, 66, 3); R('#101018', x, y - 6, 58, 3);
    if (fire) { R('#ff8a20', x + 6, y - 18, 6, 5); R('#ffd040', x + 7, y - 17, 3, 3); }
    [8, 22, 36, 50].forEach(wx => wheel(R, x + wx, y - 4, 5, '#2a2a34')); R('#a02a2a', x + 30, y - 30, 6, 2);
  }
  function tank(R, x, y, w, h, c, hi) { R(c, x, y - h, w, h); R(hi, x + 2, y - h, 3, h); R('#0a0a12', x, y - h, w, 1); R('#0a0a12', x, y - 1, w, 1); for (let i = 1; i < 3; i++) R('#0a0a12', x, y - h + Math.round(h * i / 3), w, 1); R(hi, x + 2, y - h - 2, w - 4, 2); }
  function lantern(R, x, y, col) { R('#1a1210', x, y - 4, 1, 4); R(col || '#ffd070', x - 1, y, 3, 3); R('#fff2c0', x, y + 1, 1, 1); glow(R.g, x, y + 1, 12, col || '#ffb040', 0.2); }
  function stall(R, x, y, c1, c2) { R('#1a1210', x, y - 22, 2, 22); R('#1a1210', x + 26, y - 22, 2, 22); for (let i = 0; i < 7; i++) R(i % 2 ? c1 : c2, x - 2 + i * 4, y - 26, 4, 7); R('#0a0806', x - 2, y - 19, 32, 1); R('#3a2a1e', x + 2, y - 10, 24, 10); R('#5a4030', x + 2, y - 10, 24, 2); R('#8a6a40', x + 5, y - 13, 4, 3); R('#a04a3a', x + 12, y - 13, 5, 3); R('#6a7a8a', x + 20, y - 13, 4, 3); }
  function crate(R, x, y, s, c) { R(c || '#5a4030', x, y - s, s, s); R('#7a5a40', x, y - s, s, 2); R('#2a1c14', x, y - 1, s, 1); R('#2a1c14', x + 1, y - s, 1, s); R('#2a1c14', x + s - 2, y - s, 1, s); }
  function barrel(R, x, y, c) { R(c || '#4a5a6a', x, y - 11, 8, 11); R('#6a7a8a', x + 1, y - 11, 2, 11); R('#1a2028', x, y - 8, 8, 1); R('#1a2028', x, y - 3, 8, 1); R('#0a0e14', x, y - 11, 8, 1); }
  function wagon(R, x, y, cover) { R('#3a2a1e', x, y - 14, 34, 9); R('#5a4030', x, y - 14, 34, 2); if (cover) { R('#c8b890', x + 2, y - 26, 30, 12); R('#e0d4b0', x + 2, y - 26, 30, 2); R('#8a7a5a', x + 28, y - 26, 4, 12); } wheel(R, x + 7, y - 4, 6, '#3a2a1e'); wheel(R, x + 27, y - 4, 6, '#3a2a1e'); R('#1a1210', x + 34, y - 8, 10, 2); }
  function scrap(R, r, x, y, w, h, c1, c2) { for (let i = 0; i < w * h / 14; i++) { const px = x + r() * w, py = y - r() * h * (1 - Math.abs(px - x - w / 2) / (w / 2) * 0.85); R(r() > 0.5 ? c1 : c2, px, py, 3 + r() * 6, 2 + r() * 3); } R(c1, x + w * 0.15, y - 3, w * 0.7, 3); }
  function carWreck(R, x, y, c) { R(c, x, y - 7, 26, 6); R('#1a1a22', x + 6, y - 12, 12, 5); R('#3a3a48', x + 7, y - 11, 10, 3); wheel(R, x + 5, y - 1, 3, '#2a2a30'); wheel(R, x + 20, y - 1, 3, '#2a2a30'); R('#0a0a10', x, y - 7, 26, 1); }
  function crane(R, x, y, s, c, hi) {   // big loading crane: tower, arm, cable, hook
    R(c, x, y - 70 * s, 6 * s, 70 * s); R(hi, x, y - 70 * s, 2 * s, 70 * s); R(c, x - 40 * s, y - 74 * s, 74 * s, 5 * s); R(hi, x - 40 * s, y - 74 * s, 74 * s, 1);
    R('#0a0a10', x + 26 * s, y - 69 * s, 1, 34 * s); R(c, x + 23 * s, y - 36 * s, 7 * s, 4 * s);
    for (let i = 0; i < 6; i++) R('#0a0a10', x + 1, y - 66 * s + i * 11 * s, 4 * s, 1);
  }
  function shuttle(R, x, y, tilt) {   // a crashed colony shuttle, half buried
    for (let i = 0; i < 40; i++) { const k = i / 40; R(i % 7 === 0 ? '#9aa4b0' : '#7a8490', x + i, y - 16 + tilt * k * 10 - Math.sin(k * 3.1) * 10, 1, 14 + Math.sin(k * 3.1) * 6); }
    R('#4a5460', x + 4, y - 4 + tilt * 6, 34, 4); R('#10161c', x + 26, y - 12 + tilt * 6, 7, 4); R('#c0d0e0', x + 27, y - 11 + tilt * 6, 2, 1);
  }
  function tower(R, x, y, h) {   // signal tower: lattice mast with a dish
    for (let i = 0; i < h; i += 2) { const w = 3 + Math.round((h - i) * 0.12); R('#2a2e3a', x - w, y - i, 1, 2); R('#2a2e3a', x + w, y - i, 1, 2); if (i % 8 === 0) R('#2a2e3a', x - w, y - i, w * 2 + 1, 1); }
    R('#6a7088', x - 10, y - h - 2, 20, 3); R('#a0a8c8', x - 10, y - h - 2, 20, 1); R('#40f0e0', x - 1, y - h - 6, 3, 3); glow(R.g, x, y - h - 4, 10, '#40f0e0', 0.25);
  }
  function ruin(R, r, x, y, w, h, c, hi, line) {   // a broken house wall; `line` = height of the old water mark
    R(c, x, y - h, w, h); R(hi, x, y - h, w, 2);
    for (let i = 0; i < w; i += 3) if (r() > 0.5) R('#0a0810', x + i, y - h, 3, 1 + r() * 4);
    R('#0a0810', x + 3, y - h * 0.7, 5, 7); R('#0a0810', x + w - 9, y - h * 0.7, 5, 7);
    if (line) { R('#6a5a44', x, y - line, w, 2); R('#4a3e30', x, y - line + 2, w, line - 2); }
  }
  function ark(R, g, x, y, s) {   // Ark Halcyon in orbit
    glow(g, Math.round(x + 26 * s), Math.round(y + 3 * s), Math.round(48 * s), '#78c8ff', 0.08); R('#8a90b8', x, y, 52 * s, 7 * s); R('#c0c8e8', x, y, 52 * s, 2 * s); R('#4a5078', x, y + 5 * s, 52 * s, 2 * s);
    R('#6a7098', x - 8 * s, y + s, 8 * s, 5 * s); R('#40f0e0', x - 12 * s, y + 2 * s, 4 * s, 2 * s); R('#6a7098', x + 18 * s, y - 6 * s, 4 * s, 6 * s); R('#6a7098', x + 18 * s, y + 7 * s, 4 * s, 6 * s);
    for (let i = 4; i < 48; i += 6) R('#ffe090', x + i * s, y + 3 * s, 2, 1);
  }
  function coil(R, x, y, s) { R('#2a2a34', x - 7 * s, y - 4, 14 * s, 4); R('#5a5a68', x - 4 * s, y - 40 * s, 8 * s, 38 * s); R('#c0c0c8', x - 4 * s, y - 40 * s, 2 * s, 38 * s); for (let i = 0; i < 6; i++) R('#d8b020', x - 5 * s, y - (8 + i * 5.5) * s, 10 * s, 2 * s); blob(R.g, x, y - 42 * s, 5 * s, '#8a8a98'); blob(R.g, x, y - 42 * s, 3 * s, '#e0f8ff'); }
  function pipeH(R, x, y, w, h, c) { R(c || '#4a4a56', x, y, w, h); R('#7a7a88', x, y, w, 1); R('#1a1a22', x, y + h - 1, w, 1); for (let i = 6; i < w; i += 18) R('#2a2a34', x + i, y - 1, 3, h + 2); }
  function valveWheel(R, x, y, r, c) { blob(R.g, x, y, r, '#0a0a10'); blob(R.g, x, y, r - 1, c); blob(R.g, x, y, r - 3, '#0a0a10'); R(c, x - r + 1, y, r * 2 - 1, 1); R(c, x, y - r + 1, 1, r * 2 - 1); R('#e0c050', x - 1, y - 1, 3, 3); }
  function cage(R, x, y, w, h) { R('#1a1a22', x, y - h, w, 2); R('#1a1a22', x, y, w, 2); for (let i = 0; i <= w; i += 5) R('#3a3a48', x + i, y - h, 1, h); }
  function banner(R, x, y, w, h, c, mark, crow) {   // a hanging banner: a V (Syndicate) or a small crow (Crows)
    R('#1a1210', x, y - h - 3, w + 2, 2); R(c, x + 1, y - h, w, h); R(c, x + 1 + w / 2 - 1, y, 3, 3);
    const mx = x + 1 + Math.round(w / 2), my = y - h + 4;
    if (crow) { R(mark, mx - 2, my + 4, 5, 3); R(mark, mx + 2, my + 3, 2, 2); R(mark, mx - 6, my + 1, 4, 2); R(mark, mx + 3, my + 1, 4, 2); R(mark, mx + 4, my + 4, 3, 1); }
    else for (let k = 0; k < 7; k++) { R(mark, mx - 6 + k, my + k, 2, 1); R(mark, mx + 5 - k, my + k, 2, 1); }
  }
  function floodlight(R, x, y, h) { R('#1a1a22', x, y - h, 2, h); R('#2a2a34', x - 4, y - h - 3, 10, 4); R('#fff6d0', x - 3, y - h - 2, 8, 2); glow(R.g, x + 1, y - h, 18, '#fff0c0', 0.16); }
  function chandelier(R, x, y) { R('#2a2018', x, 0, 1, y); R('#d8b040', x - 14, y, 29, 2); for (let i = -12; i <= 12; i += 6) { R('#ffe090', x + i, y - 5, 2, 4); glow(R.g, x + i, y - 3, 7, '#ffb040', 0.2); } }

  // ----- sky helpers for the recurring times of day -----
  const DUSK = ['#0a0818', '#1c1030', '#3a1c40', '#6e3050', '#b0583a', '#e8a060'];
  const NIGHT = ['#04040c', '#080a1c', '#101430', '#1c2040'];
  const DAWN = ['#2a2a40', '#5a4a5a', '#a07a74', '#d8a888', '#f0d0a0'];
  const NOON = ['#6aa0c8', '#98c0d8', '#d0dcd0', '#ecdcb0'];
  const SMOKE = ['#1a1a22', '#2e2a30', '#4a4040', '#6a5448'];
  const IND = ['#0a0a12', '#141420', '#1c1c2c'];

  function floorTiles(R, r, y0, c1, c2, line) {   // interior floor in perspective-less tiles
    R(c1, 0, y0, W, H - y0);
    for (let y = y0; y < H; y += 10) { R(line, 0, y, W, 1); for (let x = ((y / 10) & 1) * 16; x < W; x += 32) R(line, x, y, 1, 10); }
    speckle(R, r, 140, y0, H, c1, c2, 3);
  }
  function wallPanels(R, r, y1, c, hi, line) {
    R(c, 0, 0, W, y1); for (let x = 0; x < W; x += 40) { R(line, x, 0, 1, y1); R(hi, x + 1, 0, 1, y1); } R(line, 0, y1 - 2, W, 2);
  }

  const makers = {
    reservoir(g, R, r) {
      sky(g, DUSK, 0, 100); stars(R, r, 90, 70); ark(R, g, 214, 24, 1.2);
      R('#2a1430', 0, 92, W, 12); mesa(R, 10, 80, 60, 20, '#2e1632', '#4a2448', '#1e0e22'); mesa(R, 250, 74, 66, 26, '#2e1632', '#4a2448', '#1e0e22');
      R('#3a2430', 0, 100, W, 80); speckle(R, r, 700, 100, 180, '#4a303a', '#2a1a24', 3);
      for (let i = 0; i < 22; i++) { let x = r() * W, y = 104 + r() * 76; for (let k = 0; k < 10; k++) { R('#1a0e16', x, y, 3, 1); x += r() * 9 - 4; y += r() * 3 - 1; } }   // cracked mud
      R('#4a3a44', 0, 92, 62, 20); R('#6a5a64', 0, 92, 62, 2); R('#241820', 0, 108, 62, 4); for (let x = 6; x < 60; x += 10) R('#ffcc60', x, 98, 2, 2);   // the dam far left
    },
    ash(g, R, r) {
      sky(g, DAWN, 0, 96); stars(R, r, 18, 40); ark(R, g, 220, 18, 0.7);
      for (let i = 0; i < 3; i++) { const x = 40 + i * 110; for (let k = 0; k < 40; k++) R(k % 3 ? '#3a3238' : '#4a4046', x + Math.sin(k * 0.4 + i) * (3 + k * 0.15) - 4, 96 - k * 2, 6 + k * 0.3, 2); }
      R('#3a3036', 0, 96, W, 84); R('#2a2228', 0, 96, W, 3); speckle(R, r, 800, 98, 180, '#4a4046', '#2a2228', 3);
      mesa(R, 0, 84, 70, 14, '#4a3a42', '#6a5a62', '#2a2028'); mesa(R, 230, 80, 90, 18, '#4a3a42', '#6a5a62', '#2a2028');
      [[34, 120], [76, 134], [190, 124], [250, 136]].forEach((p, i) => { tent(R, p[0], p[1], 34, '#1a1618', true); for (let k = 0; k < 3; k++) post(R, p[0] + 4 + k * 12, p[1] + 6, 8 + (k * 5) % 9, '#0a0808'); });
      for (let i = 0; i < 26; i++) R(r() > 0.6 ? '#ff7a30' : '#ffb060', r() * W, 120 + r() * 58, 1, 1);
      post(R, 148, 130, 26, '#0a0808'); R('#0a0808', 140, 112, 18, 2);
    },
    rail(g, R, r) {
      sky(g, DUSK, 0, 98); stars(R, r, 50, 60); ark(R, g, 232, 20, 0.9);
      mesa(R, 0, 82, 74, 18, '#2e1632', '#4a2448', '#1e0e22'); mesa(R, 120, 90, 80, 10, '#2e1632', '#4a2448', '#1e0e22');
      R('#3a2230', 0, 98, W, 82); speckle(R, r, 500, 100, 180, '#4a303a', '#2a1a24', 3);
      R('#241420', 0, 100, W, 3);
      // overpass with a Vance banner
      R('#1a1620', 0, 54, W, 8); R('#2e2838', 0, 54, W, 2); for (let x = 20; x < W; x += 80) R('#1a1620', x, 62, 8, 42); banner(R, 150, 82, 18, 20, '#2a4aa0', '#e8c040'); banner(R, 60, 82, 18, 20, '#2a4aa0', '#e8c040');
      tracks(R, 0, W, 124, '#2a1c18', '#7a7a88'); tracks(R, 0, W, 136, '#2a1c18', '#7a7a88');
      loco(R, 214, 120, true); R('#1a1210', 108, 136 - 18, 2, 18); R('#d8c8a0', 96, 104, 26, 10); R('#1a1210', 98, 107, 22, 1); R('#a02a2a', 100, 109, 18, 2);   // toll sign
    },
    bridge(g, R, r) {
      sky(g, ['#2a2e3a', '#4a4a56', '#8a7a78', '#c8a888'], 0, 100); ark(R, g, 20, 22, 0.8);
      R('#2e2630', 0, 100, W, 80); speckle(R, r, 600, 100, 180, '#463840', '#241c24', 3);
      R('#14101a', 0, 118, W, 62); for (let i = 0; i < 10; i++) R('#1c1620', i * 34, 122 + (i % 3) * 8, 28, 3); carWreck(R, 44, 168, '#4a3a3a'); carWreck(R, 200, 172, '#3a3a4a');   // dry gorge
      R('#4a4858', 0, 106, W, 8); R('#7a788a', 0, 106, W, 2); R('#1a1822', 0, 114, W, 2); for (let x = 6; x < W; x += 16) { R('#2a2832', x, 94, 2, 12); } R('#3a384a', 0, 94, W, 2);   // deck and rail
      R('#1a2a5a', 236, 62, 50, 44); R('#2a4aa0', 236, 62, 50, 3); R('#2a4aa0', 240, 74, 14, 12); R('#9ad0ff', 242, 76, 10, 8); R('#d8e8ff', 262, 70, 18, 3); glow(g, 247, 80, 18, '#60a0ff', 0.2);   // Tribunal booth
      R('#a02a2a', 190, 86, 4, 20); R('#d8d0c0', 190, 86, 4, 3); R('#d8d0c0', 190, 98, 4, 3); R('#a02a2a', 160, 98, 36, 2);   // toll barrier
      wagon(R, 90, 108, true); wagon(R, 20, 108, false);
    },
    icehouse(g, R, r) {
      wallPanels(R, r, 96, '#6a8ca4', '#9ac0d8', '#3a5468'); R('#14202c', 0, 0, W, 6);
      for (let x = 12; x < W; x += 54) { R('#2a3c4c', x, 12, 40, 70); R('#1a2a38', x + 2, 14, 36, 66); for (let k = 0; k < 4; k++) { R('#a8e8ff', x + 4, 20 + k * 16, 32, 9); R('#e8ffff', x + 4, 20 + k * 16, 32, 1); for (let m = 0; m < 4; m++) R(m % 2 ? '#5ac0a0' : '#c8e8a0', x + 6 + m * 8, 22 + k * 16, 5, 5); } }
      floorTiles(R, r, 96, '#aac4d4', '#8ca8bc', '#6a8ca0'); for (let i = 0; i < 36; i++) R('#e8ffff', r() * W, 98 + r() * 80, 2, 1);
      for (let i = 0; i < 16; i++) { const x = 6 + i * 20 + (r() * 8 | 0); R('#e0f8ff', x, 0, 2, 5 + r() * 12); R('#a8e0f0', x, 0, 1, 7 + r() * 12); }
      R('#20303c', 130, 70, 56, 30); R('#a8e8ff', 134, 74, 48, 20); glow(g, 158, 84, 40, '#80f0ff', 0.2); R('#e8ffff', 134, 74, 48, 2);   // the cryo unit
    },
    dynamo(g, R, r) {
      R('#12121c', 0, 0, W, 100); for (let x = 0; x < W; x += 32) { R('#1e1e2c', x, 0, 2, 100); } R('#2a2a38', 0, 94, W, 6);
      for (let i = 0; i < 6; i++) pipeH(R, 0, 10 + i * 7, W, 4, '#34343e');
      [40, 120, 200, 280].forEach((x, i) => { coil(R, x, 104, 1.5); for (let k = 0; k < 4; k++) R('#80f0ff', x + (r() * 8 - 4), 36 + r() * 30, 1, 5 + r() * 6); glow(g, x, 46, 30, '#80f0ff', 0.12); });
      floorTiles(R, r, 100, '#2a2a34', '#1e1e28', '#12121a'); for (let x = 0; x < W; x += 8) R('#3a3a46', x, 102, 4, 1);
      R('#e8c82a', 150, 108, 24, 3); R('#2a2a30', 150, 111, 24, 2);
      for (let i = 0; i < 18; i++) R('#ffe040', r() * W, 40 + r() * 60, 1, 1);
    },
    market(g, R, r) {
      sky(g, ['#04040c', '#0e0a20', '#1c1030', '#2a1638'], 0, 80); stars(R, r, 80, 60); ark(R, g, 22, 14, 0.8);
      R('#1a1018', 0, 84, W, 96); speckle(R, r, 500, 90, 180, '#2a1c26', '#14101a', 3);
      mesa(R, 240, 58, 80, 36, '#160e1a', '#2a1c34', '#0e0812');
      [[6, 112], [70, 112], [246, 112], [286, 118]].forEach((p, i) => stall(R, p[0], p[1], i % 2 ? '#8a3a5a' : '#3a5a8a', '#2a1a30'));
      R('#0a0610', 130, 80, 70, 30); banner(R, 142, 100, 20, 30, '#1a1420', '#c090f0', true); banner(R, 172, 100, 20, 30, '#1a1420', '#c090f0', true);   // Crow banners
      for (let x = 10; x < W; x += 36) R('#2a2030', x, 56, 28, 1); [20, 60, 108, 150, 190, 232, 276, 308].forEach((x, i) => lantern(R, x, 58 + (i % 2) * 6, i % 3 ? '#ffb040' : '#ff7050'));
      for (let y = 126; y < H; y += 8) for (let x = ((y >> 3) & 1) * 10; x < W; x += 20) R('#241a24', x, y, 18, 1);
      crate(R, 214, 134, 10, '#3a2a30'); barrel(R, 100, 134, '#3a3a50');
    },
    auction(g, R, r) {
      R('#2a1a18', 0, 0, W, 108); for (let x = 0; x < W; x += 20) { R('#3a2420', x, 0, 1, 108); } R('#1a100e', 0, 0, W, 8);
      R('#6a1a2a', 0, 8, 60, 90); R('#8a2a3a', 0, 8, 6, 90); R('#6a1a2a', 260, 8, 60, 90); R('#8a2a3a', 314, 8, 6, 90); for (let x = 10; x < 56; x += 8) R('#4a0e1a', x, 10, 2, 86); for (let x = 266; x < 312; x += 8) R('#4a0e1a', x, 10, 2, 86);
      R('#4a3226', 0, 108, W, 72); for (let y = 108; y < H; y += 9) R('#2a1c14', 0, y, W, 1); speckle(R, r, 160, 110, 180, '#5a4030', '#3a281c', 3);
      R('#3a2a1e', 120, 80, 80, 30); R('#5a4030', 120, 80, 80, 3); R('#d8b040', 150, 68, 20, 10); R('#fff0a0', 152, 70, 16, 2); R('#2a1a10', 158, 78, 4, 4);   // podium with a gong
      chandelier(R, 160, 30); chandelier(R, 70, 24); chandelier(R, 250, 24);
      for (let i = 0; i < 14; i++) { const x = 6 + i * 22 + (r() * 6 | 0); R('#0a0610', x, 128 + (i % 3) * 5, 10, 10); R('#0a0610', x + 2, 120 + (i % 3) * 5, 6, 8); }
      banner(R, 150, 60, 18, 24, '#1a1420', '#c090f0', true);
    },
    road(g, R, r) {
      sky(g, NOON, 0, 90); R('#f0e8c0', 250, 14, 24, 24); blob(g, 262, 26, 14, '#fff6d0', 0.35);
      mesa(R, 20, 78, 90, 14, '#a88a5a', '#c8a870', '#7a6040'); mesa(R, 180, 82, 100, 10, '#a88a5a', '#c8a870', '#7a6040');
      R('#c8a468', 0, 92, W, 88); speckle(R, r, 700, 94, 180, '#d4b074', '#b89258', 3);
      R('#a88a58', 0, 118, W, 26); for (let x = 0; x < W; x += 3) R('#8a6e44', x, 118 + Math.sin(x * 0.05) * 2, 3, 1);   // the road
      for (let i = 0; i < 5; i++) { const x = 20 + i * 70; R('#4a3424', x, 54, 2, 52); R('#4a3424', x - 7, 58, 16, 1); R('#6a4a34', x - 7, 56, 16, 1); }
      wagon(R, 196, 126, true); R('#5a4030', 232, 116, 12, 2);
    },
    yard(g, R, r) {
      sky(g, ['#2a1a1a', '#5a3028', '#a85a30', '#e8a050'], 0, 92); blob(g, 240, 70, 26, '#fff0b0', 0.3);
      R('#2a1c1c', 0, 92, W, 88); speckle(R, r, 600, 94, 180, '#3a2a28', '#1a1010', 3);
      scrap(R, r, -10, 112, 130, 52, '#4a4048', '#2e2630'); scrap(R, r, 190, 114, 140, 56, '#5a4a48', '#3a2e30');
      carWreck(R, 116, 118, '#6a3a30'); carWreck(R, 140, 126, '#3a4a5a'); carWreck(R, 170, 118, '#7a6030');
      crane(R, 270, 120, 1, '#3a3844', '#6a6878'); for (let i = 0; i < 4; i++) for (let k = 0; k < 20; k++) R(k % 3 ? '#3a3036' : '#5a4a48', 30 + i * 50 + Math.sin(k * 0.3 + i) * 3, 70 - k * 2, 5, 2);
      R('#2a1c1c', 0, 134, W, 46); speckle(R, r, 160, 136, 180, '#4a3430', '#1a1010', 3);
    },
    court(g, R, r) {
      sky(g, ['#1a1220', '#3a2030', '#7a4030', '#d08850'], 0, 80);
      for (let i = 0; i < 4; i++) { R('#2a2430', 0, 76 - i * 12, W, 12); for (let x = i * 10; x < W; x += 28) carWreck(R, x, 88 - i * 12, ['#6a3a30', '#3a4a5a', '#7a6030', '#4a4a5a'][(x / 28 + i | 0) % 4]); }
      R('#3a2a28', 0, 100, W, 80); speckle(R, r, 500, 102, 180, '#4a3430', '#241816', 3);
      blob(g, 160, 124, 100, '#4a3830', 0.4); for (let a = 0; a < 6.28; a += 0.08) R('#6a5448', 160 + Math.cos(a) * 96, 124 + Math.sin(a) * 40, 2, 1);
      R('#5a3a2a', 110, 78, 100, 8); R('#7a5a40', 110, 78, 100, 2); R('#2a1a10', 120, 70, 20, 8); R('#d87a30', 126, 56, 70, 20); R('#f0a050', 126, 56, 70, 3);   // the throne of car seats
      [40, 280].forEach(x => { post(R, x, 104, 40); lantern(R, x + 1, 62, '#ff9040'); }); for (let i = 0; i < 24; i++) R(r() > 0.5 ? '#ffd040' : '#ff8a20', r() * W, 100 + r() * 60, 1, 1);
    },
    foundry(g, R, r) {
      R('#14100e', 0, 0, W, 180); for (let x = 0; x < W; x += 40) R('#241a16', x, 0, 3, 100);
      for (let i = 0; i < 5; i++) { const x = 20 + i * 62; R('#3a2e2a', x, 40, 2, 58); R('#2a2018', x - 6, 98, 14, 6); }   // chains
      R('#2a2018', 0, 100, W, 80); speckle(R, r, 400, 102, 180, '#3a2c24', '#1a1210', 3);
      R('#ff6a10', 0, 118, W, 6); R('#ffb030', 0, 119, W, 2); R('#fff0a0', 0, 120, W, 1); glow(g, 160, 120, 150, '#ff7a20', 0.1);
      [[40, 100, 40, 54], [250, 100, 44, 62]].forEach(p => { tank(R, p[0], p[1] + 8, p[2], p[3], '#3a3a44', '#6a6a78'); R('#ff7a20', p[0] + 4, p[1] - 20, p[2] - 8, 3); });
      for (let i = 0; i < 40; i++) R(r() > 0.5 ? '#ffd040' : '#ff7a20', r() * W, 30 + r() * 100, 1, 1);
    },
    launch(g, R, r) {
      sky(g, DUSK, 0, 110); stars(R, r, 80, 70); ark(R, g, 110, 30, 2.2);
      R('#2a1430', 0, 100, W, 14); R('#3a2230', 0, 110, W, 70); speckle(R, r, 500, 112, 180, '#4a303a', '#2a1a24', 3);
      for (let i = 0; i < 160; i++) { const k = i / 160; R('#3a3a48', i * 2, 126 - k * 56, 2, 5); R('#6a6a7a', i * 2, 126 - k * 56, 2, 1); if (i % 8 === 0) R('#2a2a34', i * 2, 131 - k * 56, 2, 56 * k + 6); }   // the rail climbs
      crane(R, 250, 124, 1.15, '#3a3844', '#6a6878'); R('#a02a2a', 252, 56, 3, 2);
      tracks(R, 0, 150, 134, '#2a1c18', '#7a7a88');
    },
    dunes(g, R, r) {
      sky(g, ['#7a90b8', '#b0b4c8', '#e8c8a0', '#f4dca8'], 0, 90); ark(R, g, 222, 18, 0.7);
      for (let i = 0; i < 4; i++) { const y = 86 + i * 14, c = ['#c8a070', '#d4b078', '#dcba80', '#e4c488'][i], d = ['#a88050', '#b89060', '#c0a068', '#c8a870'][i]; for (let x = 0; x < W; x++) { const h = Math.sin(x * 0.02 + i * 2) * 9 + Math.sin(x * 0.05 + i) * 3; R(c, x, y + h, 1, H - y); R(d, x, y + h, 1, 2); } }
      speckle(R, r, 500, 130, 180, '#ecd090', '#c8a070', 3);
      for (let i = 0; i < 3; i++) { const x = 40 + i * 110; R('#a07a40', x, 118, 14, 9); R('#2a0a10', x + 10, 120, 4, 4); R('#e8e0c8', x + 11, 121, 2, 1); }
    },
    salt(g, R, r) {
      sky(g, ['#2a1a40', '#5a2a58', '#b04a5a', '#f09060', '#f8d090'], 0, 100); stars(R, r, 40, 40); ark(R, g, 30, 24, 0.9);
      R('#e0d8d0', 0, 100, W, 80); speckle(R, r, 800, 102, 180, '#f4eee8', '#c8c0b8', 3);
      for (let y = 106; y < H; y += 7) for (let x = 0; x < W; x += 2) if (r() > 0.55) R('#b8b0a8', x, y + (x % 6 === 0 ? 1 : 0), 2, 1);   // cracked crust
      R('#c8b0a0', 0, 100, W, 3); mesa(R, 270, 88, 50, 12, '#7a5a60', '#a07a80', '#4a3438');
      post(R, 60, 124, 30, '#2a1e1a'); R('#2a1e1a', 50, 100, 16, 2); R('#2a1e1a', 66, 104, 12, 2); R('#2a1e1a', 44, 108, 8, 2);   // a dead tree
    },
    depot(g, R, r) {
      sky(g, NIGHT, 0, 90); stars(R, r, 90, 70); ark(R, g, 232, 14, 0.8);
      R('#161620', 0, 90, W, 90); speckle(R, r, 400, 92, 180, '#242430', '#10101a', 3);
      [[20, 118, 46, 46], [90, 118, 46, 54], [180, 118, 46, 40]].forEach(p => tank(R, p[0], p[1], p[2], p[3], '#2a3a6a', '#5a70b0')); [[22, 8], [94, 8], [184, 8]].forEach(p => R('#e8c040', p[0], 104, 10, 3));
      pipeH(R, 0, 112, W, 5, '#3a3a50'); tracks(R, 0, W, 134, '#241a14', '#7a7a8a'); banner(R, 250, 120, 16, 24, '#2a4aa0', '#e8c040'); banner(R, 280, 120, 16, 24, '#2a4aa0', '#e8c040');
      floodlight(R, 140, 124, 50); floodlight(R, 240, 124, 50); floodlight(R, 60, 124, 40);
    },
    basin(g, R, r) {
      sky(g, ['#04040c', '#101834', '#2a3058', '#4a4a78'], 0, 100); stars(R, r, 100, 80); blob(g, 60, 30, 14, '#e8e8f8', 0.9); blob(g, 56, 28, 12, '#c8c8e0', 0.9);
      R('#2a2a38', 0, 100, W, 80); speckle(R, r, 600, 102, 180, '#3a3a4c', '#1a1a26', 3);
      shuttle(R, 30, 128, 0.8); shuttle(R, 150, 120, -0.6); shuttle(R, 240, 132, 0.5);
      for (let i = 0; i < 9; i++) { const x = 20 + i * 34 + (r() * 10 | 0), y = 138 + (i % 3) * 8; R('#14141c', x, y - 8, 6, 8); R('#2a2a38', x + 1, y - 8, 4, 2); R('#d8905a', x + 2, y - 11, 2, 2); R('#e8a870', x + 2, y - 12, 1, 1); }
    },
    office(g, R, r) {
      sky(g, DUSK, 0, 96); ark(R, g, 220, 18, 0.9); stars(R, r, 40, 50);
      R('#3a2a30', 0, 96, W, 84); speckle(R, r, 500, 98, 180, '#4a363c', '#241a20', 3);
      R('#2a1e22', 90, 52, 100, 56); R('#3a2a30', 90, 52, 100, 4); R('#14101a', 100, 66, 30, 22); R('#14101a', 150, 66, 30, 22); R('#0a0810', 100, 66, 30, 2);   // kiosk windows
      R('#d8c8a0', 112, 36, 56, 10); R('#2a1e22', 114, 38, 52, 6); R('#8a3a5a', 118, 39, 8, 4); R('#8a3a5a', 130, 39, 8, 4); R('#8a3a5a', 142, 39, 8, 4);   // sign: SEATS
      for (let i = 0; i < 8; i++) { R('#2a2a34', 10 + i * 40, 112, 2, 14); } R('#a02a2a', 10, 114, 280, 1);
      for (let i = 0; i < 40; i++) R('#e8e0c8', r() * W, 126 + r() * 52, 4, 2);
      R('#14101a', 90, 108, 100, 3);
    },
    tower(g, R, r) {
      sky(g, ['#10141e', '#1a2030', '#303a50', '#5a5a70'], 0, 100); for (let i = 0; i < 4; i++) for (let k = 0; k < 12; k++) R('#2a3040', i * 90 + k * 6 + 10, 30 + i * 8 + (k % 3), 16, 4);
      R('#2a2630', 0, 100, W, 80); speckle(R, r, 500, 102, 180, '#3a3440', '#1a1620', 3);
      tower(R, 160, 120, 96); R('#2a2e3a', 130, 108, 60, 16); R('#3a3e4c', 130, 108, 60, 2); R('#40f0e0', 140, 114, 6, 4);
      for (let i = 0; i < 20; i++) R('#80f0ff', 160 + r() * 80 - 40, 20 + r() * 40, 1, 3);
      R('#1a2040', 250, 100, 26, 24); R('#2a3a70', 250, 100, 26, 3);
    },
    fork(g, R, r) {
      sky(g, ['#1a1a2c', '#3a3048', '#7a5a60', '#c8906a'], 0, 92); stars(R, r, 24, 40);
      R('#4a4036', 0, 92, W, 88); speckle(R, r, 700, 94, 180, '#5a4e42', '#32291f', 3);
      for (let i = 0; i < 6; i++) { const x = 4 + i * 56 + (r() * 10 | 0); ruin(R, r, x, 118 + (i % 2) * 8, 34 + (r() * 14 | 0), 34 + (r() * 16 | 0), '#4a3e36', '#6a5a4a', 14); }
      R('#3a3228', 0, 128, W, 52); speckle(R, r, 300, 130, 180, '#4a4034', '#241e16', 3); for (let y = 134; y < H; y += 9) R('#2a2218', 0, y, W, 1);
      post(R, 100, 136, 20, '#1a1410'); R('#2a2018', 94, 118, 14, 2);
      for (let i = 0; i < 6; i++) R('#e8e0c8', 20 + r() * 280, 134 + r() * 40, 3, 2);
    },
    line(g, R, r) {
      sky(g, ['#6a7aa0', '#a8b0c0', '#e0c8a0', '#f0dca8'], 0, 94); R('#fff0c0', 40, 16, 22, 22);
      R('#b09068', 0, 94, W, 86); speckle(R, r, 500, 96, 180, '#c0a078', '#8a6e48', 3);
      R('#4a4a58', 220, 30, 100, 86); R('#6a6a7a', 220, 30, 100, 3); R('#1a1a24', 252, 60, 36, 56); R('#2a4a8a', 258, 40, 24, 16); R('#80c8ff', 266, 44, 8, 8);   // the gate and the blue drop
      for (let i = 0; i < 12; i++) { const x = 20 + i * 15, y = 120 + (i % 2) * 3; R('#1a1410', x, y - 14, 7, 14); R('#1a1410', x + 1, y - 20, 5, 6); }
      R('#8a7a5a', 20, 124, 190, 1); barrel(R, 200, 138, '#3a5a8a'); barrel(R, 210, 138, '#3a5a8a');
      wagon(R, 120, 150, true);
    },
    gate(g, R, r) {
      sky(g, ['#1a1830', '#3a2a48', '#8a5a5a', '#d8a070'], 0, 90); stars(R, r, 30, 40);
      R('#3a3c44', 0, 24, 230, 92); R('#5a5c66', 0, 24, 230, 3); for (let x = 0; x < 230; x += 24) R('#2a2c34', x, 27, 1, 89); for (let y = 36; y < 116; y += 20) R('#2a2c34', 0, y, 230, 1);
      R('#14161c', 84, 52, 58, 64); R('#2a2c34', 84, 52, 58, 3); for (let i = 0; i < 8; i++) R('#3a3c48', 88 + i * 7, 56, 3, 60); R('#8a7a40', 108, 84, 10, 6);
      [[20, 8], [180, 8]].forEach(p => { R('#2a2c34', p[0], 4, 24, 24); R('#ffcc60', p[0] + 8, 12, 8, 6); });
      R('#3a2a2c', 230, 80, 90, 100); speckle(R, r, 300, 100, 180, '#4a3638', '#241618', 3); R('#3a2a2c', 0, 116, W, 64); speckle(R, r, 400, 118, 180, '#4a3638', '#241618', 3);
      for (let y = 124; y < H; y += 8) for (let x = ((y >> 3) & 1) * 12; x < W; x += 24) R('#2a1c1e', x, y, 22, 1);
    },
    pump(g, R, r) {
      R('#10141c', 0, 0, W, 180); for (let x = 0; x < W; x += 48) { R('#1a202c', x, 0, 3, 100); }
      R('#2a3040', 0, 100, W, 80); speckle(R, r, 300, 102, 180, '#363c50', '#1a2030', 3);
      for (let i = 0; i < 3; i++) { const x = 20 + i * 100; tank(R, x, 112, 60, 74, '#2a3a50', '#4a6a8a'); R('#0a0e14', x + 24, 38, 12, 74); valveWheel(R, x + 30, 76, 8, '#5a8aaa'); }
      pipeH(R, 0, 40, W, 6, '#2a3a50'); pipeH(R, 0, 52, W, 4, '#2a3a50'); R('#2a3040', 0, 124, W, 4); for (let x = 0; x < W; x += 6) R('#14181e', x, 124, 2, 4);
      [30, 150, 270].forEach(x => { R('#0a0e14', x, 10, 14, 4); R('#4a8aff', x + 3, 11, 8, 2); glow(g, x + 7, 12, 16, '#4a8aff', 0.18); });
    },
    tunnel(g, R, r) {
      R('#0c0e14', 0, 0, W, 180); for (let i = 0; i < 9; i++) { const k = i / 9, x = 160 - (140 - i * 14), w = (140 - i * 14) * 2, y = 8 + i * 5, h = 130 - i * 10; R(['#2a2e3a', '#262a36', '#222632', '#1e222e', '#1a1e2a', '#161a24', '#12161e', '#0e1218', '#0a0e14'][i], x, y, w, h); R('#0a0c12', x, y, w, 2); }
      R('#2a2e3a', 0, 120, W, 60); for (let x = 0; x < W; x += 20) R('#1a1e28', x, 120, 1, 60); R('#3a4050', 0, 120, W, 2);
      pipeH(R, 0, 30, 90, 6, '#3a4054'); pipeH(R, 230, 24, 90, 6, '#3a4054'); pipeH(R, 0, 100, 60, 4, '#3a4054');
      for (let i = 0; i < 7; i++) { R('#c8c0a0', 20 + i * 44, 70 + (i % 2) * 6, 14, 6); R('#1a1210', 22 + i * 44, 72 + (i % 2) * 6, 10, 2); }
      [40, 160, 280].forEach(x => { R('#2a0a0a', x, 12, 8, 4); R('#ff4030', x + 2, 13, 4, 2); glow(g, x + 4, 14, 22, '#ff4030', 0.16); });
    },
    dais(g, R, r) {
      R('#0c0e18', 0, 0, W, 180); for (let a = 0; a < 7; a++) R('#161a2a', 0, a * 14, W, 1);
      R('#1a1e2e', 0, 96, W, 84); for (let y = 100; y < H; y += 10) R('#101420', 0, y, W, 1);
      R('#2a2e44', 70, 86, 180, 14); R('#4a5070', 70, 86, 180, 2); R('#2a2e44', 80, 74, 160, 14); R('#4a5070', 80, 74, 160, 2);   // stepped dais
      [110, 160, 210].forEach(x => valveWheel(R, x, 58, 11, '#8a7a50')); [110, 160, 210].forEach(x => { R('#2a2e44', x - 2, 69, 4, 6); });
      R('#10141e', 120, 8, 80, 40); R('#2a2e44', 120, 8, 80, 2); R('#40f0e0', 130, 20, 60, 14); glow(g, 160, 28, 70, '#40f0e0', 0.14); R('#e0ffff', 140, 24, 40, 1); R('#0a1018', 134, 32, 52, 3);   // the console wall
      R('#1a1a26', 18, 24, 56, 50); R('#2a2e44', 18, 24, 56, 2); R('#0a0e18', 22, 30, 48, 38); R('#22303c', 24, 32, 44, 34);   // glass booth
      [20, 60, 270, 300].forEach(x => { R('#2a2e44', x, 30, 6, 66); });
    },
    spire(g, R, r) {
      sky(g, ['#0a0818', '#1c1030', '#3a1c40', '#8a4a50', '#e8a060'], 0, 104); stars(R, r, 100, 70); ark(R, g, 200, 20, 1.6);
      R('#2a1430', 0, 98, W, 14); mesa(R, 10, 86, 70, 14, '#2e1632', '#4a2448', '#1e0e22');
      R('#3a2a30', 0, 112, W, 68); speckle(R, r, 300, 114, 180, '#4a363c', '#241a20', 3);
      R('#4a4c58', 0, 118, W, 62); R('#6a6c78', 0, 118, W, 3); for (let x = 0; x < W; x += 26) R('#2a2c36', x, 121, 1, 59);
      tower(R, 230, 118, 100); R('#2a2e3a', 160, 100, 100, 20); R('#3a3e4c', 160, 100, 100, 3);
      for (let i = 0; i < 7; i++) { R('#2a2c36', 10 + i * 18, 104, 2, 14); } R('#3a3c48', 8, 104, 120, 2);
    },
    ark(g, R, r) {
      R('#02020a', 0, 0, W, H); stars(R, r, 200, 180, ['#6a6a98', '#ffffff']);
      blob(g, 160, 400, 330, '#0a1a3a'); blob(g, 160, 400, 326, '#12306a'); blob(g, 160, 400, 320, '#1a4a8a'); for (let i = 0; i < 80; i++) R(r() > 0.5 ? '#4a7a3a' : '#c8a868', 40 + r() * 240, 95 + r() * 28, 6 + r() * 14, 2);
      for (let x = 20; x < 300; x += 2) { const y = 400 - Math.sqrt(Math.max(0, 332 * 332 - (x - 160) * (x - 160))); R('rgba(120,180,255,0.4)', x, y - 1, 2, 2); }
      ark(R, g, 88, 56, 2.6);
    },
    worldmap(g, R, r) {   // the map of the Dust (WORLD screen): west = Hollow Creek, north-east = the dam, south-east = the Dust Sea
      R('#161620', 0, 0, W, H); speckle(R, r, 700, 0, H, '#1c1c28', '#10101a', 3);
      R('#2a2418', 176, 92, 144, 88); speckle(R, r, 900, 92, H, '#3a3020', '#241e12', 3); R('#2a2418', 160, 100, 20, 60);   // the Dust Sea
      R('#8a8478', 200, 112, 30, 16); speckle(R, r, 120, 112, 128, '#a8a498', '#6a665c', 3);   // salt flats
      R('#2a2630', 258, 136, 24, 20); R('#4a4a58', 262, 140, 5, 3); R('#4a4a58', 272, 146, 5, 3);   // shuttle wrecks
      R('#2a2028', 252, 0, 68, 74); speckle(R, r, 220, 0, 74, '#3a2a30', '#1a1018', 3); R('#52545e', 286, 14, 4, 44); R('#6a6c78', 286, 14, 4, 1);   // the reservoir bed and the dam wall
      for (let i = 0; i < 6; i++) R('#1a1018', 256 + i * 9, 10 + (i * 11) % 50, 12, 1);
      R('#262230', 190, 62, 70, 30); for (let i = 0; i < 8; i++) R('#3a3440', 196 + i * 8, 70 + (i % 3) * 6, 5, 4);   // Lower Fork ruins
      R('#26262e', 54, 134, 76, 42); for (let i = 0; i < 14; i++) R(r() > 0.5 ? '#3a3a46' : '#4a4048', 58 + r() * 66, 138 + r() * 34, 6, 3);   // the Wreck Yard
      R('#2a2030', 124, 108, 46, 34); for (let i = 0; i < 9; i++) R(i % 2 ? '#ffb040' : '#ff7050', 128 + (i * 5) % 40, 112 + (i * 7) % 26, 2, 2);   // Sable Market
      R('#1e2a34', 92, 90, 26, 18); R('#a8e8ff', 98, 94, 6, 4);   // Ice House
      [[4, 70, 48, 14], [130, 40, 70, 12], [30, 20, 40, 10]].forEach(p => mesa(R, p[0], p[1], p[2], p[3], '#22182a', '#3a2a44', '#160e1c'));
      for (let x = 14; x < 220; x += 3) { const t = (x - 14) / 206, y = 112 - t * 58 - Math.sin(t * 5) * 7; R('#8a8a9a', x, y, 2, 1); if (x % 9 === 0) R('#4a4a5a', x, y + 1, 1, 2); }   // the Dead Rail
      R('#c8a468', 22, 118, 10, 7); R('#7a5a3a', 22, 118, 10, 2); R('#ffd070', 26, 121, 2, 2);   // Hollow Creek
      ark(R, g, 18, 6, 0.5);
    },
    black(g, R) { R('#000000', 0, 0, W, H); }
  };
  const cache = {};
  function scene(id) {
    if (cache[id]) return cache[id];
    const m = makers[id]; if (!m) return cache[id] = scene('black');
    const c = mk(), g = c.getContext('2d'), R = mkR(g); R.g = g; m(g, R, mulberry(id.length * 97 + id.charCodeAt(0)));
    return cache[id] = c;
  }

  // ----- battle arena floors -----
  const GROUNDS = {
    road: { base: '#3a3a44', a: '#44444e', b: '#30303a', n: 700 },
    ash: { base: '#3a3438', a: '#4a4246', b: '#2a2428', n: 800 },
    ice: { base: '#9ab8c8', a: '#b4d0de', b: '#7a9cb0', n: 700 },
    steel: { base: '#2e303c', a: '#3a3c4a', b: '#22242e', n: 600 },
    market: { base: '#3a2c34', a: '#46363e', b: '#2a1e26', n: 600 },
    hall: { base: '#4a3226', a: '#5a4030', b: '#3a281c', n: 400 },
    yard: { base: '#3a2e2c', a: '#4a3c38', b: '#2a201e', n: 800 },
    foundry: { base: '#2a2220', a: '#3a2e2a', b: '#1a1412', n: 600 },
    dust: { base: '#c8a468', a: '#d4b074', b: '#b89258', n: 900 },
    salt: { base: '#d8d0c8', a: '#ece6e0', b: '#b8b0a8', n: 800 },
    ruin: { base: '#4a4036', a: '#5a4e42', b: '#32291f', n: 800 },
    bed: { base: '#3a3a3c', a: '#46464a', b: '#2e2e32', n: 800 },
    crest: { base: '#4a4c58', a: '#5a5c68', b: '#3a3c46', n: 500 },
    depot: { base: '#2a2a36', a: '#363644', b: '#1e1e28', n: 600 }
  };
  const gcache = {};
  function ground(kind) {
    if (gcache[kind]) return gcache[kind];
    const d = GROUNDS[kind] || GROUNDS.road, c = mk(), g = c.getContext('2d'), R = mkR(g), r = mulberry(kind.length * 31 + kind.charCodeAt(0) * 7); R.g = g;
    R(d.base, 0, 0, W, H); for (let i = 0; i < d.n; i++) R(r() > 0.5 ? d.a : d.b, r() * W, r() * H, 2, 1);
    const f = {
      road() { R('#2e2e38', 0, 70, W, 70); for (let x = 0; x < W; x += 24) R('#d8b840', x, 104, 12, 2); for (let i = 0; i < 6; i++) { let x = r() * W, y = r() * H; for (let k = 0; k < 8; k++) { R('#22222a', x, y, 2, 1); x += r() * 6 - 3; y += r() * 4 - 2; } } },
      ash() { for (let i = 0; i < 14; i++) { R('#1a1416', r() * 300, 40 + r() * 130, 8 + r() * 14, 3); } for (let i = 0; i < 22; i++) R(r() > 0.5 ? '#ff7a30' : '#ffb060', r() * W, 50 + r() * 120, 1, 1); [[30, 30], [270, 36]].forEach(p => { R('#0a0808', p[0], p[1], 3, 22); R('#0a0808', p[0] - 7, p[1] + 4, 17, 2); }); },
      ice() { for (let i = 0; i < 12; i++) { R('#e8ffff', r() * 300, 50 + r() * 120, 10 + r() * 20, 1); } for (let y = 60; y < H; y += 24) R('#7a9cb0', 0, y, W, 1); for (let x = 0; x < W; x += 40) R('#7a9cb0', x, 54, 1, 126); [[24, 22], [262, 26]].forEach(p => { R('#6a8ca0', p[0], p[1], 22, 14); R('#e8ffff', p[0], p[1], 22, 2); }); },
      steel() { for (let x = 0; x < W; x += 12) R('#1a1c24', x, 54, 1, 126); for (let y = 54; y < H; y += 12) R('#1a1c24', 0, y, W, 1); R('#e8c82a', 0, 100, W, 2); R('#e8c82a', 0, 106, W, 2); for (let i = 0; i < 4; i++) R('#3a3c4a', 20 + i * 80, 30, 30, 12); },
      market() { for (let y = 60; y < H; y += 8) for (let x = ((y >> 3) & 1) * 10; x < W; x += 20) R('#2a1e26', x, y, 18, 1); [[30, 70, '#6a2a4a'], [240, 120, '#2a4a6a'], [140, 150, '#5a4a2a']].forEach(p => { R(p[2], p[0], p[1], 40, 16); R('#c8b890', p[0], p[1], 40, 1); }); },
      hall() { for (let y = 56; y < H; y += 9) R('#2a1c14', 0, y, W, 1); [[40, 80], [200, 120]].forEach(p => { R('#6a1a2a', p[0], p[1], 70, 22); R('#d8b040', p[0], p[1], 70, 2); R('#d8b040', p[0], p[1] + 20, 70, 2); }); },
      yard() { for (let i = 0; i < 10; i++) { const x = r() * 280, y = 56 + r() * 110; R('#5a5a66', x, y, 12, 6); R('#6a6a78', x + 1, y, 10, 2); R('#1a1214', x, y + 5, 12, 2); } for (let i = 0; i < 8; i++) R('#16100e', r() * 300, 56 + r() * 120, 14 + r() * 12, 4); },
      foundry() { R('#ff6a10', 0, 96, W, 5); R('#ffb030', 0, 97, W, 2); R('#fff0a0', 0, 98, W, 1); R('#ff6a10', 60, 56, 5, 124); R('#ffb030', 61, 56, 2, 124); R('#ff6a10', 250, 56, 5, 124); R('#ffb030', 251, 56, 2, 124); for (let i = 0; i < 30; i++) R(r() > 0.5 ? '#ffd040' : '#ff7a20', r() * W, 56 + r() * 120, 1, 1); },
      dust() { for (let y = 0; y < 180; y += 30) for (let x = 0; x < 320; x += 2) { const yy = y + Math.sin(x * 0.04 + y) * 4 | 0; R('#b08a50', x, yy, 2, 1); R('#d8b878', x, yy + 1, 2, 1); } for (let i = 0; i < 8; i++) { const x = r() * 300 | 0, y = (r() * 150 | 0) + 20; R('#7a6a5a', x, y, 5, 5); R('#9a8a7a', x, y, 5, 2); } for (let i = 0; i < 4; i++) { const x = r() * 300 | 0, y = (r() * 150 | 0) + 20; R('#e8e0c8', x, y, 8, 1); R('#e8e0c8', x + 2, y - 2, 1, 5); } },
      salt() { for (let y = 58; y < H; y += 7) for (let x = 0; x < W; x += 2) if (r() > 0.6) R('#b8b0a8', x, y + (x % 6 === 0 ? 1 : 0), 2, 1); for (let i = 0; i < 5; i++) { R('#c8b8b0', r() * 280, 60 + r() * 100, 24 + r() * 24, 2); } },
      ruin() { for (let i = 0; i < 7; i++) { const x = r() * 290, y = 56 + r() * 110; R('#6a5a4a', x, y, 8 + r() * 10, 3 + r() * 4); R('#2a2218', x, y + 4, 10, 1); } for (let y = 60; y < H; y += 14) R('#32291f', 0, y, W, 1); for (let i = 0; i < 8; i++) R('#e8e0c8', r() * W, 56 + r() * 120, 3, 2); },
      bed() { for (let i = 0; i < 14; i++) { let x = r() * W, y = r() * H; for (let k = 0; k < 10; k++) { R('#1a1a1e', x | 0, y | 0, 2, 1); x += r() * 8 - 4; y += r() * 6 - 3; } } [[26, 44, 64, 34], [208, 104, 70, 38], [120, 130, 48, 26]].forEach(p => { R('#56585e', p[0], p[1], p[2], p[3]); R('#6a6c74', p[0], p[1], p[2], 2); R('#2a2a30', p[0], p[1] + p[3] - 3, p[2], 3); R('#3a3c42', p[0] + (p[2] >> 1), p[1], 1, p[3]); }); [[150, 62], [60, 120], [270, 70], [240, 150]].forEach(p => { R('#14141a', p[0], p[1], 16, 9); for (let k = 0; k < 4; k++) R('#2a2a32', p[0] + 2 + k * 4, p[1], 1, 9); }); R('#4a4c54', 0, 10, W, 6); R('#6a6c76', 0, 10, W, 1); R('#2a2a30', 0, 15, W, 1); for (let x = 20; x < W; x += 48) { R('#5a5c66', x, 8, 4, 10); R('#7a7c88', x, 8, 4, 1); } for (let i = 0; i < 6; i++) { R('#2a3a46', r() * 300 | 0, 17, 2, 4 + (r() * 12 | 0)); } },
      crest() { for (let x = 0; x < W; x += 26) R('#2a2c36', x, 54, 1, 126); for (let y = 54; y < H; y += 26) R('#2a2c36', 0, y, W, 1); R('#e8c82a', 0, 96, W, 2); for (let i = 0; i < 5; i++) R('#6a6c78', 10 + i * 66, 52, 4, 8); [[40, 120], [240, 80]].forEach(p => { R('#14161e', p[0], p[1], 20, 12); R('#40f0e0', p[0] + 3, p[1] + 3, 14, 2); }); },
      depot() { R('#1a1a24', 0, 100, W, 3); for (let x = 0; x < W; x += 7) R('#241a14', x, 108, 4, 3); R('#7a7a8a', 0, 106, W, 1); R('#7a7a8a', 0, 112, W, 1); for (let i = 0; i < 6; i++) R('#e8c040', 20 + i * 52, 140, 8, 2); [[20, 30], [250, 30]].forEach(p => { R('#2a3a6a', p[0], p[1], 24, 14); R('#5a70b0', p[0], p[1], 24, 2); }); }
    };
    (f[kind] || f.road)(); gcache[kind] = c; return c;
  }
  return { scene, ground, GROUNDS, ids: Object.keys(makers) };
})();
