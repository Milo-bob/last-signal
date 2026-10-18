'use strict';
// ---------- main character: 16x16 pixel sprite, side view turned slightly to the front (3/4), facing right ----------
// Muscular, broad-shouldered, middle-aged human with a mechanical right arm and a mechanical right eye (the side toward the viewer).
// Built from layers (body -> outfit -> hair -> backstory prop) written as 16-char rows; every letter is a palette key (see pal()).
const Hero16 = (function () {
  const BASE = [
    '................',
    '.....ssssss.....',   // 1 forehead (hair covers it)
    '.....nMssds.....',   // 2 brow, mechanical eye plate on the left, human brow on the right
    '.....MGseys.....',   // 3 eyes: glowing machine eye / human eye
    '.....nmssssS....',   // 4 cheek and nose
    '.....sddsds.....',   // 5 mouth and stubbled jaw
    '.....dsssd......',   // 6 thick neck
    '...nMMsssssSd...',   // 7 shoulders: pauldron-sized machine shoulder left, human shoulder right
    '..nMmssdsdsSd...',   // 8 chest, machine upper arm, human arm
    '..ngmssdsdssd...',   // 9 glowing machine forearm
    '..Mmnsdsdsdss...',   // 10 machine hand, abs
    '...nMtttTtt.....',   // 11 belt with buckle
    '.....Pppqpp.....',   // 12 legs
    '.....Pppqpp.....',   // 13
    '....bBbb.bbBb...',   // 14 boots, toes to the right
    '................'
  ];
  const OUTFITS = [
    [ // DUSTER: long open coat
      null, null, null, null, null, null,
      '.....C...c......',
      '.....C....Cck...',
      '.....cC...ccc...',
      '.....cC...cck...',
      '.....ckc.cc.....',
      '.....kc..ck.....',
      '.....cC..Cc.....',
      '.....kc..ck.....'],
    [ // VEST: open vest, bare arms
      null, null, null, null, null, null, null,
      '......cC.Cc.....',
      '......cc..cc....',
      '......ck..kc....',
      '......cc..cc....'],
    [ // TANK: sleeveless shirt
      null, null, null, null, null, null, null,
      '.....cC..Cc.....',
      '.....cCccck.....',
      '.....ccckcc.....',
      '.....kcccck.....'],
    [ // ARMOR: plated chest and pauldron
      null, null, null, null, null, null, null,
      '.....cCccCCcc...',
      '.....cccTccck...',
      '.....ccckccck...',
      '.....kcccck.....']
  ];
  const UNDER = [      // undershirt (worn under DUSTER, VEST and ARMOR): sleeveless, so no bare chest shows through open clothes
    null, null, null, null, null, null, null,
    '......vV.vv.....',
    '.....vVvvvw.....',
    '.....vvwvvw.....',
    '.....wvvvvw.....'];
  const HAIR = [
    [ // CROP
      null, '....jhHhhhhj....', '....j.....h.....', '....j...........'],
    [ // SLICKED BACK
      '.....jhHHh......', '....jhHHhHhh....', '....j.....h.....'],
    [ // LONG
      null, '....jhHhhhhj....', '...jh.....h.....', '...jh...........', '...jh...........', '...jj...........', '...hj...........'],
    [ // MOHAWK
      '......jHj.......', '.....jhHhjs.....']
  ];
  const ORIGIN_PX = {   // [x, y, key]
    guard: [[6, 8, 'T'], [6, 9, 'T']],
    smuggler: [[5, 6, 'r'], [6, 6, 'R'], [7, 6, 'r'], [8, 6, 'R'], [9, 6, 'r'], [8, 7, 'r'], [8, 8, 'r']],
    courier: [[6, 7, 'u'], [7, 8, 'u'], [8, 9, 'u'], [9, 10, 'u'], [11, 11, 'U'], [12, 11, 'u'], [11, 12, 'u'], [12, 12, 'u']],
    tech: [[5, 1, 'x'], [6, 1, 'z'], [7, 1, 'z'], [8, 1, 'x'], [9, 1, 'z'], [10, 1, 'z']]
  };

  function shade(hex, d) { const n = parseInt(hex.slice(1), 16); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, v + d)).toString(16).padStart(2, '0')).join(''); }
  function pal(o) {
    const sk = HERO_SKINS[o.skin | 0] || HERO_SKINS[0], hr = HERO_HAIRS[o.hair | 0] || HERO_HAIRS[0], co = HERO_COATS[o.coat | 0] || HERO_COATS[0], mk = HERO_MARKS[o.mark | 0] || HERO_MARKS[0];
    return {
      s: sk, S: shade(sk, 24), d: shade(sk, -44), h: hr, H: shade(hr, 38), j: shade(hr, -34), c: co, C: shade(co, 42), k: shade(co, -42),
      v: '#c9c3b2', V: '#e6e1d2', w: '#8f8a7c', m: '#8a94a2', M: '#d0d8e4', n: '#454d5a', g: mk, G: shade(mk, 90),
      p: '#3a4260', P: '#56628a', q: '#242a40', b: '#4a3020', B: '#7a5434', t: '#5a3a22', T: '#e0c050',
      e: '#f0ece4', y: '#1a1620', r: '#b02a2a', R: '#d85050', u: '#7a5a34', U: '#a47c48', z: '#80e0ff', x: '#2a3038'
    };
  }
  function layer(grid, rows) { rows.forEach((row, y) => { if (!row) return; for (let x = 0; x < 16 && x < row.length; x++) if (row[x] !== '.') grid[y][x] = row[x]; }); }
  function grid() { const g = BASE.map(r => r.split('')); return g; }

  const cache = {};
  function get(o, f) {
    f = f ? 1 : 0;
    const key = [o.style != null ? o.style : o.hat, o.outfit, o.hair, o.coat, o.skin, o.mark, o.origin, f].join('|');
    if (cache[key]) return cache[key];
    const P = pal(o), G = grid();
    if ((o.outfit | 0) % OUTFITS.length !== 2) layer(G, UNDER);
    layer(G, OUTFITS[(o.outfit | 0) % OUTFITS.length]);
    layer(G, HAIR[((o.style != null ? o.style : o.hat) | 0) % HAIR.length]);
    (ORIGIN_PX[o.origin] || []).forEach(p => { G[p[1]][p[0]] = p[2]; });
    // idle breathing: the head always sits in the lowered position and never moves; only the body sinks one pixel (frame 1), legs and boots stay planted
    const H = G.map(r => r.slice());
    if (f) for (let y = 8; y <= 12; y++) H[y] = G[y - 1].slice();
    for (let y = 1; y <= 6; y++) H[y] = G[y - 1].slice();
    H[0] = '.'.repeat(16).split('');
    H[7] = G[6].map((c, x) => c !== '.' ? c : (f ? '.' : G[7][x]));
    G.length = 0; H.forEach(r => G.push(r));
    const c = Pix.render(G, P);
    return (cache[key] = c);
  }
  return { get };
})();
