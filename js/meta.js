'use strict';
// ---------- save data and the hub screens (story map, squad, prep room, supply, missions, result) ----------
let SAVE = null;
const CRATE_T = [30, 60, 120];
const BAGMAX = 24;
function dayKey() { const d = new Date(); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
function initHunter(id) { SAVE.h[id] = { lvl: 1, skill: 1, gear: { weapon: null, armor: null, core: null } }; }
function defaultSave() {
  const s = { gold: 300, onyx: 10, owned: START_HUNTERS.slice(), squad: START_HUNTERS.slice(), h: {}, bag: [], stages: {},
    crates: [{ s: 0, t: 0 }, { s: 0, t: 0 }, { s: 0, t: 0 }], missions: {}, day: dayKey(), stat: { kills: 0, wins: 0, combos: 0, ults: 0 }, seen: {},
    hero: Object.assign({}, HERO_DEFAULT), heroDone: false, ending: null, cxSeen: 0 };
  SAVE = s; START_HUNTERS.forEach(initHunter); MISSIONS.forEach(m => s.missions[m.id] = { p: 0, c: false }); return s;
}
function saveGame() { try { localStorage.setItem('lastsignal_save', JSON.stringify(SAVE)); } catch (e) {} }
function hasSave() { try { return !!localStorage.getItem('lastsignal_save'); } catch (e) { return false; } }
function loadGame() {
  try {
    const d = JSON.parse(localStorage.getItem('lastsignal_save')); if (!d) return false; SAVE = d;
    MISSIONS.forEach(m => { if (!SAVE.missions[m.id]) SAVE.missions[m.id] = { p: 0, c: false }; });
    SAVE.owned.forEach(id => { if (!SAVE.h[id]) initHunter(id); });
    if (!SAVE.hero) { SAVE.hero = Object.assign({}, HERO_DEFAULT); SAVE.heroDone = false; }   // saves from before the hero update
    if (SAVE.ending === undefined) SAVE.ending = null;
    if (SAVE.cxSeen === undefined) SAVE.cxSeen = codexCount();
    if (SAVE.day !== dayKey()) { SAVE.day = dayKey(); MISSIONS.forEach(m => SAVE.missions[m.id] = { p: 0, c: false }); }
    return true;
  } catch (e) { return false; }
}
function newGame() { defaultSave(); saveGame(); heroTyping = false; scene = 'hero'; }
function confirmHero() {
  SAVE.heroDone = true; heroTyping = false; saveGame(); Snd.play('level');
  if (!SAVE.seen.intro && progressIdx() === 0) { SAVE.seen.intro = 1; saveGame(); showCards(INTRO_CARDS, () => { scene = 'hub'; }); } else scene = 'hub';
}
function chooseEnding(id) { SAVE.ending = id; SAVE.seen['end'] = 1; saveGame(); Snd.play('win'); showCards(ENDINGS[id], () => { scene = 'hub'; }); }
function addGear(g) { if (SAVE.bag.length < BAGMAX) SAVE.bag.push(g); else SAVE.gold += gearValue(g); }
function stageUnlocked(i) { return i === 0 || SAVE.stages[STAGES[i - 1].id] > 0; }
function progressIdx() { let n = 0; STAGES.forEach(s => { if (SAVE.stages[s.id]) n++; }); return n; }
function crateState(c) { if (c.s === 1 && Date.now() >= c.t) c.s = 2; return c.s; }
function claimable() { return MISSIONS.filter(m => SAVE.missions[m.id].p >= m.goal && !SAVE.missions[m.id].c).length; }
function cratesReady() { return SAVE.crates.filter(c => crateState(c) === 2).length; }

// ---------- generic header ----------
let selStage = 0, selCh = 1, selHunter = 0, selBagI = -1, selSlot = 2, detailH = 'bulwark';
function hubBg() { lx.drawImage(Art.hub(), 0, 0); }
function topBar(title) {
  ctx.fillStyle = 'rgba(8,10,24,0.85)'; ctx.fillRect(0, 0, W, 70);
  text(title, 30, 48, 36, '#fff');
  ctx.drawImage(Art.sprite('gear_core', 0), 760, 18, 36, 36); text(String(SAVE.onyx), 806, 48, 28, '#80f0ff');
  disc(ctx, 940, 36, 12, '#ffd040'); ctx.fillStyle = '#ffd040'; text(String(SAVE.gold), 966, 48, 28, '#ffd040');
  button(1130, 12, 120, 46, 'HOME', () => { scene = 'hub'; Snd.play('ui'); }, scene === 'hub', 22);
}
function smallSprite(name, x, y, sc, f) { const s = Art.sprite(name, f || 0), m = s.px ? Math.max(1, Math.round(sc * 0.67)) : sc, w = s.width * m / (s.px ? 1 : s.width / s.lw), h = s.height * m / (s.px ? 1 : s.width / s.lw); ctx.imageSmoothingEnabled = false; ctx.drawImage(s, Math.round(x - w / 2), Math.round(y - h + (s.px ? 3 * m : 6 * sc)), w, h); }
function faceSprite(name, cx, top, sc, f) { const s = Art.icon(name, f || 0); ctx.imageSmoothingEnabled = false; const k = s.width / s.lw; ctx.drawImage(s, 0, 0, s.width, 30 * k, Math.round(cx - s.lw * sc / 2), top, s.lw * sc, 30 * sc); }
function stars(x, y, n, sz) { for (let i = 0; i < 3; i++) { ctx.fillStyle = i < n ? '#ffd040' : '#3a3a4a'; ctx.fillRect(x + i * (sz + 4), y, sz, sz); } }
function bar(x, y, w, h, k, col, back) { ctx.fillStyle = '#000'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6); ctx.fillStyle = back || '#2a2a3a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = col; ctx.fillRect(x, y, Math.round(w * clamp(k, 0, 1)), h); }
function gearLine(g) { return Object.keys(g.mods).map(k => '+' + g.mods[k] + '% ' + MOD_N[k]).join('   '); }
function drawGearIcon(g, x, y, sz) {
  ctx.fillStyle = RAR[g.rar].c; ctx.fillRect(x - 3, y - 3, sz + 6, sz + 6); ctx.fillStyle = '#12141f'; ctx.fillRect(x, y, sz, sz);
  const s = Art.sprite('gear_' + g.slot, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(s, x + sz * 0.1, y + sz * 0.1, sz * 0.8, sz * 0.8);
  const si = SETS.findIndex(q => q.id === g.set); ctx.fillStyle = ['#ffb040', '#80c8ff', '#c070ff'][si]; ctx.fillRect(x + sz - 12, y + 4, 8, 8);
}

// ---------- title ----------
function drawTitle() {
  lx.drawImage(Art.hub(), 0, 0); blit();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
  text('LAST SIGNAL', W / 2, 190, 110, '#e8f4ff', 'center', '#1a4a8a');
  text('A WILD WEST ROBOT APOCALYPSE', W / 2, 238, 28, '#80f0ff', 'center');
  button(W / 2 - 170, 330, 340, 68, 'NEW GAME', () => { Snd.init(); Snd.play('ui'); if (hasSave()) { SAVE = null; } newGame(); }, false, 34);
  if (hasSave()) button(W / 2 - 170, 424, 340, 68, 'CONTINUE', () => { Snd.init(); if (loadGame()) { scene = SAVE.heroDone ? 'hub' : 'hero'; Snd.play('ui'); } }, false, 34);
  const names = HUNTERS.map(h => h.spr);
  names.forEach((n, i) => smallSprite(n, 150 + i * 140, 705, 3, Math.floor(time * 2 + i) % 2));
  text('Tap robots to move them, tap enemies to focus, tap ULT when full', W / 2, 540, 20, '#c8d8f8', 'center');
}

// ---------- hub ----------
function drawHub() {
  hubBg();
  // squad display on the floor
  const hs = Art.hero(SAVE.hero, Math.floor(time * 1.5) % 2); lx.imageSmoothingEnabled = false; lx.drawImage(hs, 150 - (hs.lw >> 1), 136 - hs.lh + 6, hs.lw, hs.lh);
  SAVE.squad.forEach((id, i) => { const h = HUNTER_BY[id]; const s = Art.sprite(h.spr, Math.floor(time * 1.5 + i) % 2); lx.drawImage(s, 190 + i * 40 - (s.lw >> 1), 136 - s.lh + 6, s.lw, s.lh); }); lx.imageSmoothingEnabled = false;
  blit(); topBar('HOLLOW CREEK');
  const items = [['STORY', 'story', 0], ['HERO', 'hero', 0], ['SQUAD', 'squad', 0], ['PREP ROOM', 'prep', 0], ['SUPPLY', 'supply', cratesReady()], ['MISSIONS', 'missions', claimable()], ['CODEX', 'codex', Math.max(0, codexCount() - (SAVE.cxSeen || 0))]];
  if (SAVE.stages.s15 && !SAVE.ending) items.push(['RETURN CONSOLE', 'choice', 0]);
  items.forEach((it, i) => {
    button(50, 100 + i * 72, 360, 60, it[0], () => { scene = it[1]; Snd.play('ui'); if (it[1] === 'prep') { selBagI = -1; } if (it[1] === 'codex') { SAVE.cxSeen = codexCount(); saveGame(); }
      if (it[1] === 'story') { const n = STAGES.findIndex(s => !SAVE.stages[s.id]); selStage = n < 0 ? STAGES.length - 1 : n; selCh = STAGES[selStage].ch; } }, false, 30);
    if (it[2]) { disc(ctx, 410, 104 + i * 72, 16, '#e03030'); text(String(it[2]), 410, 112 + i * 72, 22, '#fff', 'center', 'rgba(0,0,0,0)'); }
  });
  text(SAVE.hero.name.toUpperCase() + '  +  ' + SAVE.squad.map(id => HUNTER_BY[id].name).join('  /  '), 640, 686, 22, '#fff', 'center');
  if (SAVE.ending) text('ENDING: ' + (SAVE.ending === 'rain' ? 'THE RAIN' : 'THE DEPARTURE'), 640, 712, 16, '#ffd040', 'center');
  button(W - 200, H - 70, 150, 46, 'TITLE', () => { saveGame(); scene = 'title'; }, false, 22);
}

// ---------- story map ----------
function drawStory() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.55)'; ctx.fillRect(0, 70, W, H - 70); topBar('STORY');
  text('CHAPTER ' + selCh + ': ' + CHAPTERS[selCh], 40, 112, 28, '#80f0ff');
  const chFirst = c => STAGES.findIndex(s => s.ch === c), chMax = Math.max.apply(null, STAGES.map(s => s.ch));
  button(760, 84, 54, 40, '<', () => { selCh--; selStage = chFirst(selCh); Snd.play('ui'); }, selCh <= 1, 26);
  button(826, 84, 54, 40, '>', () => { selCh++; selStage = chFirst(selCh); Snd.play('ui'); }, selCh >= chMax || !stageUnlocked(chFirst(selCh + 1)), 26);
  const list = STAGES.map((s, i) => [s, i]).filter(p => p[0].ch === selCh);
  list.forEach((p, k) => {
    const s = p[0], i = p[1], x = 90 + k * 118, y = 150 + (k % 2) * 100, ok = stageUnlocked(i), st = SAVE.stages[s.id] || 0;
    if (k < list.length - 1) { ctx.fillStyle = '#3a4060'; ctx.fillRect(x + 28, y + 24 + (k % 2 ? -1 : 0), 90, 4); }
    ctx.fillStyle = i === selStage ? '#ffd040' : ok ? '#80f0ff' : '#3a3a4a'; ctx.fillRect(x - 4, y - 4, 64, 64);
    ctx.fillStyle = s.boss ? '#5a1a1a' : '#12141f'; ctx.fillRect(x, y, 56, 56);
    text(s.boss ? '!' : String(i + 1 - chFirst(selCh)), x + 28, y + 40, 32, ok ? '#fff' : '#555', 'center');
    if (ok) stars(x + 2, y + 62, st, 16);
    if (ok) uiB.push({ x, y, w: 56, h: 56, fn: () => { selStage = i; Snd.play('ui'); } });
  });
  const s = STAGES[selStage];
  panel(40, 400, 760, 270, '#80f0ff');
  text(s.name.toUpperCase(), 66, 444, 34, '#ffd040');
  wrap(s.brief, 700, 20).forEach((l, i) => text(l, 66, 480 + i * 26, 20, '#d8e4ff'));
  text('ENEMIES', 66, 560, 16, '#80f0ff');
  const seen = {}; s.waves.forEach(w => w.forEach(e => seen[e[0]] = 1));
  Object.keys(seen).forEach((t, i) => { const sp = Art.sprite(FOES[t].spr, 0), sc = sp.px ? 2 : (FOES[t].boss ? 1 : 2); ctx.imageSmoothingEnabled = false; ctx.drawImage(sp, 70 + i * 96, 664 - sp.lh * sc, sp.lw * sc, sp.lh * sc); });
  text('REWARD  $' + s.gold + '   ONYX ' + s.onyx + (s.unlock ? '   + NEW ROBOT' : ''), 420, 562, 18, '#ffd040');
  text('WAVES: ' + s.waves.length, 420, 590, 18, '#c8d8f8');
  button(540, 600, 240, 56, 'START', () => {
    if (SAVE.squad.length !== 3) return; Snd.play('ui'); const st = STAGES[selStage], idx = selStage;
    if (st.pre && !SAVE.seen['pre' + st.id]) { SAVE.seen['pre' + st.id] = 1; saveGame(); showCard(st.pre, () => startBattle(idx)); } else startBattle(idx);
  }, !stageUnlocked(selStage) || SAVE.squad.length !== 3, 30);
  // squad strip
  panel(830, 400, 410, 270, '#80f0ff'); text('YOUR SQUAD', 856, 436, 22, '#80f0ff');
  SAVE.squad.forEach((id, i) => { smallSprite(HUNTER_BY[id].spr, 900 + i * 125, 570, 3, Math.floor(time * 1.5 + i) % 2); text(HUNTER_BY[id].name, 900 + i * 125, 610, 15, '#fff', 'center'); text('LV ' + SAVE.h[id].lvl, 900 + i * 125, 634, 14, '#ffd040', 'center'); });
  button(1050, 410, 170, 36, 'CHANGE SQUAD', () => { scene = 'squad'; }, false, 16);
}

// ---------- squad ----------
function drawSquad() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.7)'; ctx.fillRect(0, 70, W, H - 70); topBar('SQUAD');
  text('TAP A ROBOT TO ADD OR REMOVE IT. YOU NEED 3.', 40, 112, 22, '#80f0ff');
  HUNTERS.forEach((h, i) => {
    const x = 40 + (i % 4) * 190, y = 140 + Math.floor(i / 4) * 250, own = SAVE.owned.indexOf(h.id) >= 0, inSq = SAVE.squad.indexOf(h.id) >= 0;
    ctx.fillStyle = inSq ? '#ffd040' : own ? h.col : '#333'; ctx.fillRect(x - 4, y - 4, 178, 238);
    ctx.fillStyle = '#12141f'; ctx.fillRect(x, y, 170, 230);
    if (own) {
      smallSprite(h.spr, x + 85, y + 134, 3, Math.floor(time * 1.5 + i) % 2); text(h.name, x + 85, y + 150, 22, '#fff', 'center'); text(h.role, x + 85, y + 174, 16, h.col, 'center');
      text('LV ' + SAVE.h[h.id].lvl, x + 85, y + 200, 18, '#ffd040', 'center');
      if (inSq) text('IN SQUAD', x + 85, y + 16, 13, '#ffd040', 'center');
      uiB.push({ x, y, w: 170, h: 230, fn: () => { detailH = h.id; Snd.play('ui'); const k = SAVE.squad.indexOf(h.id); if (k >= 0) { if (SAVE.squad.length > 1) SAVE.squad.splice(k, 1); } else if (SAVE.squad.length < 3) SAVE.squad.push(h.id); else { SAVE.squad[selSlot] = h.id; selSlot = (selSlot + 1) % 3; } saveGame(); } });
    } else { text('LOCKED', x + 85, y + 120, 24, '#666', 'center'); text(STAGES.find(s => s.unlock === h.id) ? 'Clear ' + STAGES.find(s => s.unlock === h.id).name : '', x + 85, y + 150, 13, '#666', 'center'); }
  });
  const d = HUNTER_BY[detailH], st = hunterStats(detailH);
  panel(830, 140, 410, 488, d.col);
  smallSprite(d.spr, 1035, 298, 4, Math.floor(time * 2) % 2);
  text(d.name + '  -  ' + d.role, 1035, 306, 24, '#fff', 'center');
  wrap(d.desc, 360, 16).forEach((l, i) => text(l, 856, 340 + i * 20, 16, '#c8d8f8'));
  text('HP ' + Math.round(st.hp) + '   ATK ' + Math.round(st.atk), 856, 410, 20, '#fff');
  text('SPEED ' + Math.round(st.spd) + '   RANGE ' + d.range, 856, 438, 18, '#c8d8f8');
  text('ULTIMATE: ' + d.ult, 856, 480, 20, '#ffd040'); wrap(d.ultDesc, 360, 16).forEach((l, i) => text(l, 856, 506 + i * 20, 16, '#c8d8f8'));
  text(d.el ? 'ELEMENT: ' + d.el.toUpperCase() : 'ELEMENT: NONE', 856, 580, 18, d.el === 'fire' ? '#ff8a20' : d.el === 'ice' ? '#80f0ff' : d.el === 'shock' ? '#ffe040' : '#aaa');
  text('Fire + Ice = STEAM (wet).  Shock on wet = OVERLOAD.', 40, 690, 18, '#80f0ff');
}

// ---------- prep room (levels, skills, gear) ----------
function drawPrep() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.78)'; ctx.fillRect(0, 70, W, H - 70); topBar('PREP ROOM');
  SAVE.owned.forEach((id, i) => {
    const x = 20, y = 84 + i * 76, h = HUNTER_BY[id];
    ctx.fillStyle = detailH === id ? '#ffd040' : h.col; ctx.fillRect(x - 3, y - 3, 76, 70); ctx.fillStyle = '#12141f'; ctx.fillRect(x, y, 70, 64);
    faceSprite(h.spr, x + 35, y + 6, 2, 0); uiB.push({ x, y, w: 70, h: 64, fn: () => { detailH = id; Snd.play('ui'); } });
  });
  const id = detailH, h = HUNTER_BY[id], sv = SAVE.h[id], st = hunterStats(id);
  panel(120, 84, 400, 584, h.col);
  smallSprite(h.spr, 320, 240, 4, Math.floor(time * 2) % 2);
  text(h.name, 320, 262, 30, '#fff', 'center'); text(h.role + '   LV ' + sv.lvl, 320, 290, 20, h.col, 'center');
  text('HP ' + Math.round(st.hp) + '   ATK ' + Math.round(st.atk), 140, 330, 20, '#fff');
  text('SPEED ' + Math.round(st.spd) + '   CRIT ' + Math.round(st.crit * 100) + '%', 140, 358, 18, '#c8d8f8');
  const lc = Math.round(40 * Math.pow(sv.lvl, 1.35)), sc = 4 * sv.skill + 2;
  button(140, 380, 360, 50, 'LEVEL UP  $' + lc, () => { if (SAVE.gold >= lc && sv.lvl < 30) { SAVE.gold -= lc; sv.lvl++; Snd.play('level'); saveGame(); } }, SAVE.gold < lc || sv.lvl >= 30, 22);
  button(140, 440, 360, 50, 'ULT LV ' + sv.skill + ' > ' + (sv.skill + 1) + '   ' + sc + ' ONYX', () => { if (SAVE.onyx >= sc && sv.skill < 6) { SAVE.onyx -= sc; sv.skill++; Snd.play('level'); saveGame(); } }, SAVE.onyx < sc || sv.skill >= 6, 18);
  text('ULT: ' + h.ult + '  x' + st.ultMul.toFixed(2), 140, 520, 16, '#ffd040');
  // equipped gear
  text('GEAR', 140, 556, 18, '#80f0ff');
  ['weapon', 'armor', 'core'].forEach((sl, i) => {
    const x = 140 + i * 124, y = 570, g = sv.gear[sl];
    if (g) { drawGearIcon(g, x, y, 76); uiB.push({ x, y, w: 76, h: 76, fn: () => { if (SAVE.bag.length < BAGMAX) { SAVE.bag.push(g); sv.gear[sl] = null; Snd.play('ui'); saveGame(); } } }); }
    else { ctx.fillStyle = '#3a3a4a'; ctx.fillRect(x - 3, y - 3, 82, 82); ctx.fillStyle = '#12141f'; ctx.fillRect(x, y, 76, 76); text(sl.toUpperCase(), x + 38, y + 44, 13, '#555', 'center'); }
  });
  const cnt = {}; ['weapon', 'armor', 'core'].forEach(sl => { const g = sv.gear[sl]; if (g) cnt[g.set] = (cnt[g.set] || 0) + 1; });
  SETS.forEach((s, i) => { const n = cnt[s.id] || 0; if (n >= 2) text(s.name + ' ' + n + 'pc: ' + s.b2 + (n >= 3 ? '  ' + s.b3 : ''), 140, 664 - 0, 13, '#ffd040'); });
  // bag
  text('BAG ' + SAVE.bag.length + '/' + BAGMAX, 560, 108, 22, '#80f0ff');
  for (let i = 0; i < BAGMAX; i++) {
    const x = 560 + (i % 6) * 96, y = 124 + Math.floor(i / 6) * 96, g = SAVE.bag[i];
    if (g) { drawGearIcon(g, x, y, 78); if (i === selBagI) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x - 5, y - 5, 88, 88); } uiB.push({ x, y, w: 78, h: 78, fn: () => { selBagI = i; Snd.play('ui'); } }); }
    else { ctx.fillStyle = '#242636'; ctx.fillRect(x, y, 78, 78); }
  }
  const g = SAVE.bag[selBagI];
  if (g) {
    text(g.name.toUpperCase(), 560, 536, 24, RAR[g.rar].c); text(RAR[g.rar].n + ' ' + g.slot.toUpperCase() + '  -  ' + SETS.find(s => s.id === g.set).name, 560, 562, 16, '#c8d8f8');
    text(gearLine(g), 560, 590, 18, '#8aff9a');
    button(560, 608, 200, 50, 'EQUIP', () => { const old = sv.gear[g.slot]; sv.gear[g.slot] = g; SAVE.bag.splice(selBagI, 1); if (old) SAVE.bag.push(old); selBagI = -1; Snd.play('pickup'); saveGame(); }, false, 24);
    button(780, 608, 220, 50, 'SELL $' + gearValue(g), () => { SAVE.gold += gearValue(g); SAVE.bag.splice(selBagI, 1); selBagI = -1; Snd.play('pickup'); saveGame(); }, false, 22);
  } else text('Select an item', 560, 560, 18, '#667');
}

// ---------- supply ----------
function drawSupply() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.78)'; ctx.fillRect(0, 70, W, H - 70); topBar('SUPPLY');
  text('Call supply crates from the Sable Crows. Their caravans take time to arrive.', 40, 120, 22, '#80f0ff');
  SAVE.crates.forEach((c, i) => {
    const x = 60 + i * 400, y = 170, s = crateState(c), left = Math.max(0, Math.ceil((c.t - Date.now()) / 1000));
    panel(x, y, 360, 420, s === 2 ? '#ffd040' : '#80f0ff');
    const sp = Art.sprite('crate', 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(sp, x + 80, y + 40, sp.width * 11, sp.height * 11);
    text('CRATE ' + (i + 1), x + 180, y + 270, 28, '#fff', 'center'); text('TIER ' + (i + 1) + '  (' + CRATE_T[i] + 's)', x + 180, y + 298, 16, '#c8d8f8', 'center');
    if (s === 0) button(x + 60, y + 330, 240, 62, 'CALL', () => { c.s = 1; c.t = Date.now() + CRATE_T[i] * 1000; Snd.play('ui'); saveGame(); }, false, 28);
    else if (s === 1) { text('ARRIVES IN ' + left + 's', x + 180, y + 360, 24, '#ffd040', 'center'); bar(x + 40, y + 380, 280, 12, 1 - left / CRATE_T[i], '#80f0ff'); }
    else button(x + 60, y + 330, 240, 62, 'OPEN', () => {
      const pi = progressIdx(), gold = Math.round((80 + i * 60) * (1 + pi * 0.12)), on = 3 + i * 3;
      SAVE.gold += gold; SAVE.onyx += on; let gt = ''; if (Math.random() < 0.3 + 0.15 * i) { const g = genGear(pi, i); addGear(g); gt = '  + ' + g.name; }
      bumpMission('crate', 1); c.s = 0; Snd.play('pickup'); saveGame(); toastMsg('+$' + gold + '  +' + on + ' ONYX' + gt);
    }, false, 28);
  });
}

// ---------- missions ----------
function drawMissions() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.78)'; ctx.fillRect(0, 70, W, H - 70); topBar('MISSIONS');
  text('DAILY MISSIONS (reset each day)', 40, 120, 22, '#80f0ff');
  MISSIONS.forEach((m, i) => {
    const y = 150 + i * 100, p = SAVE.missions[m.id];
    panel(60, y, 1100, 80, p.c ? '#555' : p.p >= m.goal ? '#ffd040' : '#80f0ff');
    text(m.text, 90, y + 36, 26, '#fff'); bar(90, y + 52, 500, 12, p.p / m.goal, '#80f0ff'); text(p.p + '/' + m.goal, 610, y + 64, 18, '#c8d8f8');
    text('$' + m.gold + '  ' + m.onyx + ' ONYX', 760, y + 46, 22, '#ffd040');
    button(980, y + 14, 150, 52, p.c ? 'DONE' : 'CLAIM', () => { SAVE.gold += m.gold; SAVE.onyx += m.onyx; p.c = true; Snd.play('pickup'); saveGame(); }, p.c || p.p < m.goal, 24);
  });
}

// ---------- result ----------
function drawResult() {
  const r = B.result;
  ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, W, H);
  panel(300, 70, 680, 580, r.win ? '#ffd040' : '#e04040');
  text(r.win ? 'MISSION COMPLETE' : 'SQUAD DOWN', 640, 140, 54, r.win ? '#ffd040' : '#ff6060', 'center');
  text(B.stage.name.toUpperCase(), 640, 176, 22, '#c8d8f8', 'center');
  if (r.win) {
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i < r.stars ? '#ffd040' : '#3a3a4a'; ctx.fillRect(520 + i * 80, 200, 60, 60); }
    text('DESTROYED ' + B.kills + '   COMBOS ' + B.combos + '   ULTS ' + B.ults, 640, 296, 20, '#fff', 'center');
    text('$' + r.gold + '    ' + r.onyx + ' ONYX', 640, 344, 34, '#ffd040', 'center');
    if (r.gear) { drawGearIcon(r.gear, 480, 380, 80); text(r.gear.name.toUpperCase(), 590, 410, 24, RAR[r.gear.rar].c); text(gearLine(r.gear), 590, 440, 16, '#8aff9a'); }
    if (r.unlock) { const h = HUNTER_BY[r.unlock]; smallSprite(h.spr, 400, 610, 2, 0); text('NEW ROBOT: ' + h.name, 640, 520, 26, h.col, 'center'); wrap(STORY_BITS[r.unlock], 480, 16).forEach((l, i) => text(l, 640, 550 + i * 20, 16, '#c8d8f8', 'center')); }
  } else text('Your robots were destroyed. Level them up in the Prep Room and try again.', 640, 300, 20, '#fff', 'center');
  // the story card for a first win plays when the player leaves the result screen; after the last fight the ending choice follows
  const leave = fn => { const o = r.outro, last = r.final; r.outro = null; r.final = false; const done = last ? () => { scene = 'choice'; } : fn; B = null; if (o) showCard(o, done); else done(); };
  button(330, 590, 190, 48, 'HOME', () => { leave(() => { scene = 'hub'; }); }, false, 22);
  button(540, 590, 190, 48, 'RETRY', () => { const i = B.idx; leave(() => startBattle(i)); }, false, 22);
  if (r.win && B.idx + 1 < STAGES.length) button(750, 590, 200, 48, 'NEXT', () => { const i = B.idx + 1; leave(() => { selStage = i; selCh = STAGES[i].ch; scene = 'story'; }); }, false, 22);
}
function toastMsg(s) { toast = { s, t: 3.5 }; }
let toast = { s: '', t: 0 };
