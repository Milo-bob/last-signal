'use strict';
// ---------- story cast: the people who talk in cutscenes (16x16 grids, drawn like the robots: 3/4 view facing right, rendered by Pix) ----------
// Same format as robots.js: a palette (letter -> colour), 16 rows of 16 chars, `split` = first row that stays planted in the idle bob.
// Robots and the hero are not here (robots.js / hero.js). The Judge and the other robot bosses live in robots.js because they are also enemies.
const Cast = (function () {
  const DEFS = {
    ezra: { split: 12,   // Ezra Vance, the Banker: black hat, spectacles, long blue coat trimmed in gold, a cane
      pal: { h: '#16161e', H: '#34344a', t: '#e8c040', T: '#fff0a0', s: '#e6c4a4', S: '#f6dcc0', d: '#a8826a', g: '#9ad0f0', e: '#f4f0ea', y: '#20202c', m: '#4a3a2c', c: '#2c4ca0', C: '#5070d0', k: '#161e44', w: '#ece8f0', p: '#1e1e2a', P: '#34344a', b: '#2a1a12', n: '#a07830', N: '#fff0a0', z: '#0e1430' },
      rows: [
        '................',
        '.....zhhhhz.....',
        '.....zhttHz.....',
        '...zhhhhhhhhz...',
        '.....zsSSSsz....',
        '.....zgeysSs....',
        '.....zSsmmSs....',
        '......zsdds.....',
        '...zcCwwwwCcz...',
        '..zcCcwTTwcCczN.',
        '..zcCccTcccCzsn.',
        '..zkccctcccckzn.',
        '...zkcctcccz.zn.',
        '....zcc..ccz.n..',
        '....zpP..pPz.n..',
        '....bbb..bbb.n..']
    },
    calloway: { split: 12,   // Old Calloway: white hair and beard, black coat with a gold chain, leaning on a cane, grey with twelve years of waiting
      pal: { w: '#e4e4ee', W: '#ffffff', x: '#a4a4bc', s: '#d4bca4', S: '#ead6c2', d: '#9a8068', e: '#1c141c', c: '#2a2a34', C: '#48485c', k: '#14141c', t: '#d8b040', n: '#8a6a3a', N: '#e8c860', p: '#3a3a46', b: '#1a1210', z: '#0c0c14' },
      rows: [
        '................',
        '.....zwWWwz.....',
        '....zwWwwwWz....',
        '....zwwsSSsz....',
        '....zwsedeSs....',
        '....zxwSdSwWz...',
        '.....zwWWWWwz...',
        '....zxwWWWWwz...',
        '...zcCzwWWwCcz..',
        '...zcCcctccczN..',
        '..zkcccctccczn..',
        '..zkcccctcsczn..',
        '...zkcc..ccsz.n.',
        '....zpp..ppz..n.',
        '....bbb..bbb.nn.',
        '................']
    },
    dessa: { split: 11,   // Dessa Calloway: dark braid, teal duster, a bandolier of brass water tokens, a canteen on the hip
      pal: { h: '#2a1a14', H: '#5a3a2a', s: '#c89870', S: '#e0b48a', d: '#8a6040', e: '#f0ece4', y: '#201810', c: '#3a7a6a', C: '#5aa08a', k: '#1e4a40', t: '#d8b040', T: '#fff0a0', p: '#4a3a2a', P: '#6a5a40', b: '#3a2418', B: '#5a3a24', r: '#c84a3a', w: '#e0d8c4', u: '#8a9aa8', z: '#10241e' },
      rows: [
        '................',
        '.....zhhhhz.....',
        '....zhHHHhhz....',
        '....zhhsSSsz....',
        '...zhhhseysS....',
        '...zhhhsSssd....',
        '...zhhrrrsd.....',
        '...zcCrrrrCcz...',
        '..zcCcwwtwcCcz..',
        '..zcCctTtcccCz..',
        '..zcCcctcccsCz..',
        '..zkcccctccukz..',
        '...zkcc..cckz...',
        '....zpp..ppz....',
        '....zpP..pPz....',
        '....bbb..bbbB...']
    },
    ma: { split: 11,   // Ma Dalton: stout scrap queen, welding goggles on a red bandana, orange overalls, a wrench
      pal: { r: '#c03a2a', R: '#e86050', s: '#c88c64', S: '#e4a880', d: '#8a5a3a', g: '#505860', G: '#80e8d0', e: '#f0ece4', y: '#201810', o: '#d87a30', O: '#f0a050', k: '#7a3e14', a: '#6a5a4a', A: '#8a7a64', w: '#d8d0c0', m: '#9aa0aa', M: '#e0e4ec', b: '#2a1a10', t: '#4a3220', z: '#2e1608' },
      rows: [
        '................',
        '....zrrRRrz.....',
        '....zrgGGgz.....',
        '....zrsSSsdz....',
        '....zssesysz....',
        '....zsSSssSz....',
        '.....zsddsz.....',
        '..zzoOOwwOOozz.M',
        '.zooOooaaooOozmM',
        '.zsoooaAAaooszmm',
        '.zsoooaaaaooszm.',
        '..zzookttkoozz..',
        '...zooo..ooooz..',
        '....zoo..ooz....',
        '....zkk..kkz....',
        '...bbbb..bbbb...']
    },
    corva: { split: 12,   // Corva Sable, Queen of Crows: wide black hat with a feather, feathered shoulders, violet scarf, gold rings
      pal: { h: '#18141e', H: '#3a3048', f: '#6a5a8a', F: '#b0a0e0', s: '#d8b090', S: '#ecc8a8', d: '#9a6a50', e: '#f0ece4', y: '#201020', l: '#a0304a', c: '#241c30', C: '#463a5c', k: '#100c18', v: '#8a4ac8', V: '#c090f0', t: '#e8c040', b: '#1a1018', n: '#8a8aa0', z: '#08060c' },
      rows: [
        '.....fF.........',
        '....zhhhfF......',
        '..zhhhhHHhhhz...',
        '.....zsSSsz.....',
        '.....zseysS.....',
        '.....zSsllS.....',
        '.....zvVvvd.....',
        '...zfFcvVcFfz...',
        '..zfFcCcVcCcFz..',
        '..zcCccctcccCz.n',
        '..zcCcctcccccsn.',
        '..zkcccctcccckn.',
        '..zkcccccccccz..',
        '..zkcccctcccz...',
        '...zkcccccccz...',
        '....bbb..bbb....']
    },
    broker: { split: 12,   // a Crow broker: hooded black cloak, a gold beak mask, a purse of secrets
      pal: { h: '#1a1622', H: '#3a3050', e: '#f0ece4', y: '#201020', n: '#d8a830', N: '#fff0a0', t: '#e8c040', k: '#0e0a14', b: '#1a1018', z: '#08060c', v: '#8a4ac8' },
      rows: [
        '................',
        '................',
        '................',
        '.....zhhhhz.....',
        '....zhHHHhhz....',
        '....zhheeyyznN..',
        '....zhhhhhhznN..',
        '...zhHhhhhhhz...',
        '..zhHhhvvvhhhz..',
        '..zhhhhvthhhhz..',
        '..zhhhhhhhhhhz..',
        '..zkhhhhhhhhkz..',
        '...zkhhhhhhkz...',
        '....zhh..hhz....',
        '....bbb..bbb....',
        '................']
    },
    villager: { split: 12,   // a Dust villager: patched coat, bare hands, tired
      pal: { h: '#3a2a20', H: '#6a4a38', s: '#c89870', S: '#e0b48a', d: '#8a6040', e: '#f0ece4', y: '#201810', c: '#7a6a58', C: '#a09078', k: '#4a3e32', p: '#4a4038', b: '#2a1e16', z: '#241a12' },
      rows: [
        '................',
        '.....zhhhhz.....',
        '....zhHhhhz.....',
        '....zhsSSsz.....',
        '....zhseysS.....',
        '.....zSssSs.....',
        '......zsds......',
        '...zcCcccCcz....',
        '..zcCcccccCcz...',
        '..zscccccccsz...',
        '..zscccccccsz...',
        '...zkcccccckz...',
        '...zkcc..cckz...',
        '....zpp..ppz....',
        '....zpp..ppz....',
        '....bbb..bbb....']
    },
    kid: { split: 13,   // a child from the water line
      pal: { h: '#5a3a28', H: '#8a5a3a', s: '#d8a880', S: '#ecc4a0', e: '#f0ece4', y: '#201810', c: '#a85a4a', C: '#d08a70', k: '#6a3a30', p: '#4a4038', b: '#2a1e16', z: '#2a1a14' },
      rows: [
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '.....zhhhz......',
        '....zhHhhz......',
        '....zhseysS.....',
        '.....zSssS......',
        '...zcCcccCz.....',
        '...zscccccsz....',
        '....zcccccz.....',
        '....zpp.ppz.....',
        '....bbb.bbb.....',
        '................']
    },
    jonah: { split: 12,   // Jonah Dalton as a recording: a young man in a valve-crew vest (drawn in pale cyan at runtime)
      pal: { h: '#406070', H: '#80c0d0', s: '#70b0c0', S: '#b0e8f0', d: '#4a8090', e: '#e8ffff', y: '#204050', c: '#4a90a8', C: '#90d8e8', k: '#2a5a70', p: '#3a7088', b: '#2a5060', z: '#10303c' },
      rows: [
        '................',
        '.....zhhhhz.....',
        '....zhHhhhz.....',
        '....zhsSSsz.....',
        '....zhseysS.....',
        '.....zSssSs.....',
        '......zsds......',
        '...zcCcccCcz....',
        '..zcCcccccCcz...',
        '..zscccccccsz...',
        '..zscccccccsz...',
        '...zkcccccckz...',
        '...zkcc..cckz...',
        '....zpp..ppz....',
        '....zpp..ppz....',
        '....bbb..bbb....']
    }
  };
  function build(def, f) {
    let G = def.rows.map(r => r.padEnd(16, '.').slice(0, 16).split(''));
    if (f) {   // idle breathing: the upper body sinks one pixel, the legs stay planted
      const H = G.map(r => r.slice());
      for (let y = 1; y < def.split; y++) H[y] = G[y - 1].slice();
      H[0] = '.'.repeat(16).split(''); G = H;
    }
    return Pix.render(G, def.pal);
  }
  const cache = {};
  function get(name, f) { f = f ? 1 : 0; const k = name + f; return cache[k] || (cache[k] = build(DEFS[name], f)); }
  return { get, names: Object.keys(DEFS), DEFS };
})();
