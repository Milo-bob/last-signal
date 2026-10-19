'use strict';
// ---------- the three human fighters of the squad: Holt, Cog and Rose (native 24x24 grids, 3/4 view facing right, rendered by Pix like the robots) ----------
// rows: the body as left-padded strings (P(x, s) = x dots + s); stamps: [y, x, s] pieces drawn on top (weapons and arms). `split` = first row that stays planted in the idle bob.
const Humans = (function () {
  const N = 24, P = (x, s) => '.'.repeat(x) + s;
  const DEFS = {
    holt: { split: 17,   // Old Holt: white hair and a full white beard, an olive coat with a brass bandolier, a hand-cranked gatling gun
      pal: { w: '#e8e8f2', W: '#ffffff', x: '#a4a4be', s: '#d6b08e', S: '#ecc8a6', d: '#9a7a62', e: '#f0ece4', y: '#1c141c', c: '#6e6040', C: '#8e7e56', k: '#3c3220', t: '#c09a3a', T: '#f0d070',
        p: '#3c4254', P: '#5a6482', b: '#2c1c12', B: '#5a3c24', z: '#14100c', m: '#3a3c48', M: '#c8ccd8', g: '#5c606e', G: '#9aa0b0', o: '#ff9a30' },
      rows: [
        '',
        P(10, 'wwWWww'),
        P(8, 'wwWWWWwww'),
        P(7, 'wwwwwwwwwwx'),
        P(7, 'wwxsWWWWsSw'),
        P(7, 'wwxseyseys'),
        P(7, 'wwxsssssSSs'),
        P(7, 'wwwwWWWWWWw'),
        P(6, 'wxwwwwwwWWwwx'),
        P(7, 'xwwwwwWWwwx'),
        P(8, 'xwwwwwwwx'),
        P(5, 'zkccCccwwwcCcz'),
        P(5, 'zkTccccwWwcccz'),
        P(5, 'zkcTccccwwcCkz'),
        P(5, 'zkccTcccccccCz'),
        P(5, 'zkcccTccccckz'),
        P(5, 'zttttTttttTtz'),
        P(6, 'zppPppppPppz'),
        P(6, 'zppPpz.zpPppz'),
        P(6, 'zppPpz.zpPppz'),
        P(6, 'zppPpz.zpPppz'),
        P(6, 'zbbBbz.zbbBbbz'),
        P(5, 'zbbbbbz.zbbbbbbz'),
        ''],
      stamps: [
        [11, 13, 'MMM'],
        [12, 12, 'MTTTM'],
        [13, 11, 'mMTtMg'],
        [14, 10, 'sSgGgGGGGGGMm'],
        [15, 10, 'sggmmmmmmmmMo'],
        [16, 11, 'mggGGGGGGGGMm'],
        [17, 11, 'mgggmmmmm'],
        [18, 15, 'sS'],
        [17, 16, 'sS']]
    },
    cog: { split: 16,   // Cog: the Dalton Combine's young, lanky inventor: an oversized white lab coat, big brass goggles, a pneumatic sledgehammer with a glowing strike face
      pal: { h: '#5a3a22', H: '#8a5a34', q: '#6a4a2a', s: '#e8c0a0', S: '#f8d8bc', d: '#b08462', g: '#34363f', L: '#e8ffff', l: '#6ad8f0', w: '#f0f0f8', W: '#ffffff', x: '#b4b8d0', X: '#8890b0',
        u: '#4a74a8', U: '#7aa0d0', t: '#8a6a3a', T: '#d8b050', p: '#4a4034', b: '#2a1a10', B: '#5a3c24', z: '#10101a', r: '#d04040', M: '#d4dae6', m: '#8a90a2', k: '#34363f', o: '#ff8a30', O: '#ffd070', n: '#8a6a3a', N: '#b8905a' },
      rows: [
        '',
        P(7, 'hH'),
        P(6, 'hhHHhhh'),
        P(5, 'hhHHHhhhh'),
        P(5, 'hhsggggggg'),
        P(5, 'hqsgLllgLlg'),
        P(5, 'hqsglllgllg'),
        P(5, 'hhsggggggg'),
        P(5, 'hhsssssssSS'),
        P(7, 'sssSdddss'),
        P(8, 'zsdsz'),
        P(4, 'zxwwwwwwxz'),
        P(4, 'zxwuuuwwxz'),
        P(4, 'zxwuUuwwxz'),
        P(4, 'zxwwuwwwxz'),
        P(4, 'zxwtTtwwxz'),
        P(4, 'zxwwwwwwXz'),
        P(4, 'zxwwwwwwXz'),
        P(5, 'zxwwwwwXz'),
        P(5, 'zppz.zppz'),
        P(5, 'zppz.zppz'),
        P(4, 'zbbbz.zbbbbz'),
        P(3, 'zbBbbz.zbBbbbz'),
        ''],
      stamps: [
        [13, 5, 'rb'],
        [12, 13, 'wx'], [13, 14, 'wx'], [14, 15, 'wwsS'],
        [4, 16, 'MMMMMMO'], [5, 16, 'MkOOkMO'], [6, 16, 'MkOOkMO'], [7, 16, 'MMMMMMO'], [8, 18, 'mmmm'],
        [9, 19, 'n'], [10, 19, 'N'], [11, 19, 'n'], [12, 19, 'N'], [13, 19, 'n'], [14, 19, 'N'], [15, 19, 'n'], [16, 19, 'N'], [17, 19, 'n'], [18, 19, 'N'], [19, 19, 'n'], [20, 19, 'b']]
    },
    rose: { split: 14,   // Rose: pink ponytail, a cream top with brown suspenders and leather bracers, brown trousers, a revolver in each hand
      pal: { h: '#e8609a', H: '#ff9acb', j: '#a02a68', s: '#e8bc9a', S: '#f6d6ba', d: '#b88460', e: '#f4f0ea', y: '#2a1620', r: '#c0384a', c: '#d8c4a0', C: '#eedcbe', k: '#a68c68', n: '#7a5232', N: '#a8774a',
        B: '#4a301c', t: '#c89a3a', T: '#f0d070', p: '#6a4a30', P: '#8a6642', b: '#3a2416', z: '#1a1018', g: '#4a4a58', G: '#b4b8c8', o: '#ff9a30' },
      rows: [
        '',
        P(7, 'hhHHhh'),
        P(6, 'hhHHHhhh'),
        P(5, 'hhHHHHhhhh'),
        P(5, 'hhhHhssssS'),
        P(5, 'hhhseyseys'),
        P(5, 'jhhsssssSs'),
        P(6, 'jhsssrrsd'),
        P(7, 'jhdsssd'),
        P(7, 'zcCsssCcz'),
        P(6, 'zcCnCCnCcz'),
        P(6, 'zcCnCCnCcz'),
        P(6, 'zkcnCCnckz'),
        P(6, 'zkcnCCnckz'),
        P(6, 'zkBttTttBkz'),
        P(6, 'zppPpppPpz'),
        P(7, 'zppz.zppz'),
        P(7, 'zppz.zppz'),
        P(7, 'zppz.zppz'),
        P(7, 'zppz.zppz'),
        P(6, 'zbbbz.zbbbbz'),
        P(5, 'zbBbbbz.zbBbbbbz'),
        '', ''],
      stamps: [
        [4, 5, 'hhh'], [5, 3, 'jhhh'], [6, 2, 'jhhH'], [7, 2, 'jhh'], [8, 3, 'jh'], [9, 4, 'j'],
        [10, 15, 'cC'], [11, 15, 'c'], [9, 16, 'ssns'], [10, 16, 'ss'], [8, 19, 'GGGG'], [9, 20, 'gGG'], [10, 19, 'nn'],
        [10, 4, 'cC'], [11, 4, 'cC'], [12, 4, 'c'], [13, 4, 'cC'], [13, 6, 'cCcsss'], [14, 5, 'cckcc'], [14, 10, 'sss'], [13, 8, 'ssns'], [14, 8, 'ss'], [12, 11, 'GGGG'], [13, 12, 'gGG'], [14, 11, 'nn']]
    }
  };
  function build(def, f) {
    const G = []; for (let y = 0; y < N; y++) G.push((def.rows[y] || '').padEnd(N, '.').slice(0, N).split(''));
    let H = G.map(r => r.slice());
    if (f) { for (let y = 1; y < def.split; y++) H[y] = G[y - 1].slice(); H[0] = '.'.repeat(N).split(''); }   // idle breathing: the upper body sinks one pixel, the legs stay planted
    def.stamps.forEach(s => { const yy = s[0] + (f ? 1 : 0); if (yy >= N) return; for (let i = 0; i < s[2].length; i++) if (s[2][i] !== '.' && s[1] + i < N) H[yy][s[1] + i] = s[2][i]; });
    return Pix.render(H, def.pal);
  }
  const cache = {};
  function get(name, f) { f = f ? 1 : 0; const k = name + f; return cache[k] || (cache[k] = build(DEFS[name], f)); }
  return { get, names: Object.keys(DEFS), DEFS };
})();
