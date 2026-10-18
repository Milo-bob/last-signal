'use strict';
// ---------- shared sprite renderer: 16x16 letter grid -> 24x24 canvas (finer pixels, rim light/shade, dark outline) ----------
const Pix = (function () {
  const N = 24;
  function shade(hex, d) { const n = parseInt(hex.slice(1), 16); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, v + d)).toString(16).padStart(2, '0')).join(''); }
  // G: 16 rows of 16 chars (arrays). pal: letter -> '#rrggbb'. Returns a 24x24 canvas with .lw/.lh = 24.
  function render(G, pal) {
    const U = [];
    if (G.length === N) G.forEach(r => U.push(r.slice()));      // native 24x24 grid: used as is
    else for (let y = 0; y < N; y++) { const row = []; for (let x = 0; x < N; x++) row.push(G[Math.floor(y * 2 / 3)][Math.floor(x * 2 / 3)]); U.push(row); }
    const A = (x, y) => x >= 0 && y >= 0 && x < N && y < N && U[y][x] !== '.';
    const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = U[y][x]; if (k === '.') continue;
      let col = pal[k] || '#f0f', d = 0;
      if (!A(x, y - 1)) d += 30; if (!A(x - 1, y)) d += 14; if (!A(x, y + 1)) d -= 34; if (!A(x + 1, y)) d -= 18;
      if (d) col = shade(col, d);
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
    g.fillStyle = '#120e1a';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!A(x, y) && (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1))) g.fillRect(x, y, 1, 1);
    c.lw = c.lh = N; c.px = true; return c;
  }
  return { render, shade, N };
})();
