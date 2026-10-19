'use strict';
// ---------- save data and the hub screens (story map, squad, prep room, supply, missions, result) ----------
let SAVE = null;
const CRATE_T = [30, 60, 120];
const BAGMAX = 24;
function dayKey() { const d = new Date(); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
function initHunter(id) { SAVE.h[id] = newHunterState(); }
function defaultSave() {
  const s = { gold: 300, onyx: 10, owned: START_HUNTERS.slice(), squad: START_HUNTERS.slice(), h: {}, bag: [], stages: {},
    crates: [{ s: 0, t: 0 }, { s: 0, t: 0 }, { s: 0, t: 0 }], bonus: {}, missions: {}, day: dayKey(), stat: { kills: 0, wins: 0, combos: 0, ults: 0 }, seen: {},
    hero: Object.assign({}, HERO_DEFAULT), heroDone: false, ending: null, cxSeen: 0, found: {}, disc: {}, tut: {}, tipsOff: false, fl: {} };
  crateChoice = null; SAVE = s; START_HUNTERS.forEach(initHunter); MISSIONS.forEach(m => s.missions[m.id] = { p: 0, c: false }); return s;
}
let saveWarned = false;
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }
  catch (e) { if (!saveWarned) { saveWarned = true; toastMsg('Progress could not be stored: the browser blocks or has no room for saves.'); } }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function loadGame() {
  const raw = storedRaw(); if (!raw) return false;
  try { adoptSave(finishSave(cleanSave(JSON.parse(raw), false))); return true; }
  catch (e) {   // damaged or foreign data: keep a copy of it, never overwrite it silently
    try { localStorage.setItem(BROKEN_KEY, raw); } catch (e2) {}
    toastMsg('Your save could not be read. A copy was kept in this browser.'); return false;
  }
}
function newGame() { backupOf(storedRaw()); defaultSave(); saveGame(); heroTyping = false; scene = 'hero'; }
function confirmHero() {
  SAVE.heroDone = true; heroTyping = false; saveGame(); Snd.play('level');
  const go = () => { if (needsPrologue()) startPrologue(); else scene = 'hub'; };
  if (!SAVE.seen.intro && progressIdx() === 0) playScene('intro', go); else go();
}
function chooseEnding(id) { SAVE.ending = id; SAVE.seen['end'] = 1; saveGame(); Snd.play('win'); playScenes(['end_' + id, 'epilogue'], () => { scene = 'hub'; }); }
function addGear(g) { if (SAVE.bag.length < BAGMAX) SAVE.bag.push(g); else SAVE.gold += gearValue(g); }
function stageUnlocked(i) { return i === 0 || SAVE.stages[STAGES[i - 1].id] > 0; }
function progressIdx() { let n = 0; STAGES.forEach(s => { if (SAVE.stages[s.id]) n++; }); return n; }
function crateState(c) { if (c.s === 1 && Date.now() >= c.t) c.s = 2; return c.s; }
function claimable() { return MISSIONS.filter(m => SAVE.missions[m.id].p >= m.goal && !SAVE.missions[m.id].c).length; }
function hasPerk(id) { return !!(SAVE && SAVE.stages[PERKS[id].at] > 0); }
function skillCap() { return hasPerk('link') ? 8 : 6; }
function perkLocked(id) { const st = STAGES.find(q => q.id === PERKS[id].at); return 'LOCKED: clear ' + (st ? st.name : PERKS[id].at); }
function cratesReady() { return SAVE.crates.filter(c => crateState(c) === 2).length; }

// ---------- generic header ----------
let hubLine = null;
let selStage = 0, selCh = 1, selHunter = 0, selBagI = -1, selSlot = 2, detailH = 'bulwark';
const HUB_GROUPS = [   // the hub shows four doors; inside, tabs switch between the parts of a door
  [['SQUAD', 'squad'], ['PREP ROOM', 'prep'], ['HERO', 'hero']],
  [['SUPPLY', 'supply'], ['MISSIONS', 'missions']],
  [['CODEX', 'codex'], ['THE DUST', 'world'], ['MEMORIES', 'memories']]
];
function goScene(id) { scene = id; Snd.play('ui'); if (id === 'prep') selBagI = -1; if (id === 'codex') { SAVE.cxSeen = codexCount(); saveGame(); } if (id === 'hero') heroTyping = false; }
function hubTabs(cur) {
  const g = HUB_GROUPS.find(q => q.some(t => t[1] === cur)); if (!g) return;
  g.forEach((t, i) => { const on = t[1] === cur; button(290 + i * 150, 14, 140, 44, t[0], on ? () => {} : () => goScene(t[1]), false, 18, on ? '#ffd040' : null, on ? '#ffd040' : null); });
}
function hubBg() { lx.drawImage(Art.hub(), 0, 0); }
function topBar(title, backFn) {   // backFn: show BACK (calls it) instead of HOME
  ctx.fillStyle = 'rgba(8,10,24,0.85)'; ctx.fillRect(0, 0, W, 70);
  text(title, 30, 48, 36, '#fff');
  if (SAVE) {   // no save yet when SAVE DATA is opened from the title screen
    ctx.drawImage(Art.sprite('gear_core', 0), 760, 18, 36, 36); text(String(SAVE.onyx), 806, 48, 28, '#80f0ff');
    disc(ctx, 940, 36, 12, '#ffd040'); ctx.fillStyle = '#ffd040'; text(String(SAVE.gold), 966, 48, 28, '#ffd040');
  }
  if (backFn) button(1130, 12, 120, 46, 'BACK', backFn, false, 22);
  else button(1130, 12, 120, 46, 'HOME', () => { scene = 'hub'; Snd.play('ui'); }, scene === 'hub', 22);
}
function smallSprite(name, x, y, sc, f) { const s = Art.sprite(name, f || 0), m = s.px ? sc + 1 : sc, w = s.width * m / (s.px ? 1 : s.width / s.lw), h = s.height * m / (s.px ? 1 : s.width / s.lw); ctx.imageSmoothingEnabled = false; ctx.drawImage(s, Math.round(x - w / 2), Math.round(y - h + (s.px ? 2 * m : 6 * sc)), w, h); }
function faceSprite(name, cx, top, sc, f) { const s = Art.icon(name, f || 0); ctx.imageSmoothingEnabled = false; if (s.px) { ctx.drawImage(s, 0, 1, 24, 16, Math.round(cx - 33), top + 4, 66, 44); return; } const k = s.width / s.lw; ctx.drawImage(s, 0, 0, s.width, 30 * k, Math.round(cx - s.lw * sc / 2), top, s.lw * sc, 30 * sc); }
function stars(x, y, n, sz) { for (let i = 0; i < 3; i++) { ctx.fillStyle = i < n ? '#ffd040' : '#3a3a4a'; ctx.fillRect(x + i * (sz + 4), y, sz, sz); } }
function bar(x, y, w, h, k, col, back) { ctx.fillStyle = '#000'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6); ctx.fillStyle = back || '#2a2a3a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = col; ctx.fillRect(x, y, Math.round(w * clamp(k, 0, 1)), h); }
function gearLine(g) { return Object.keys(g.mods).map(k => '+' + g.mods[k] + '% ' + MOD_N[k]).join('   '); }
function fxLine(g) { return g.fx ? GEAR_FX[g.fx].name + ': ' + GEAR_FX[g.fx].desc : ''; }
function drawGearIcon(g, x, y, sz) {
  ctx.fillStyle = RAR[g.rar].c; ctx.fillRect(x - 3, y - 3, sz + 6, sz + 6); ctx.fillStyle = '#12141f'; ctx.fillRect(x, y, sz, sz);
  const s = Art.sprite('gear_' + g.slot, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(s, x + sz * 0.1, y + sz * 0.1, sz * 0.8, sz * 0.8);
  const si = SETS.findIndex(q => q.id === g.set); ctx.fillStyle = ['#ffb040', '#80c8ff', '#c070ff'][si]; ctx.fillRect(x + sz - 12, y + 4, 8, 8);
  if (g.fx) { const f = GEAR_FX[g.fx]; ctx.fillStyle = f.col; ctx.fillRect(x, y + sz - Math.max(14, sz * 0.2), sz, Math.max(14, sz * 0.2)); text(f.name.slice(0, 4), x + sz / 2, y + sz - 3, Math.max(11, Math.round(sz * 0.16)), '#10121c', 'center'); }
}

// ---------- title ----------
function drawTitle() {
  lx.drawImage(Art.hub(), 0, 0); blit();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
  text('LAST SIGNAL', W / 2, 190, 110, '#e8f4ff', 'center', '#1a4a8a');
  text('A WILD WEST ROBOT APOCALYPSE', W / 2, 238, 28, '#80f0ff', 'center');
  button(W / 2 - 170, 330, 340, 68, 'NEW GAME', () => {
    Snd.init(); Snd.play('ui');
    if (hasSave()) askConfirm('START A NEW GAME?', ['This replaces the save on this device.', 'Your old save is kept as a backup (SAVE DATA > RESTORE BACKUP).'], 'NEW GAME', () => { SAVE = null; newGame(); });
    else newGame();
  }, false, 34);
  if (hasSave()) button(W / 2 - 170, 424, 340, 68, 'CONTINUE', () => { Snd.init(); if (loadGame()) { if (!SAVE.heroDone) scene = 'hero'; else if (needsPrologue()) startPrologue(); else scene = 'hub'; Snd.play('ui'); } }, false, 34);
  button(W / 2 - 170, 512, 340, 50, 'SAVE DATA', () => { Snd.init(); openData(); }, false, 24);
  const names = HUNTERS.map(h => h.spr);
  const sp = Math.min(140, 1180 / names.length);
  names.forEach((n, i) => smallSprite(n, W / 2 - (names.length - 1) * sp / 2 + i * sp, 705, 3, Math.floor(time * 2 + i) % 2));
  text('Tap robots to move them, tap enemies to focus, tap ULT when full', W / 2, 604, 20, '#c8d8f8', 'center');
}

// ---------- hub ----------
function drawHub() {
  hubBg();
  // squad display on the floor
  const hs = Art.hero(SAVE.hero, Math.floor(time * 1.5) % 2); lx.imageSmoothingEnabled = false; lx.drawImage(hs, 150 - (hs.lw >> 1), 136 - hs.lh + 6, hs.lw, hs.lh);
  SAVE.squad.forEach((id, i) => { const h = HUNTER_BY[id]; const s = Art.sprite(h.spr, Math.floor(time * 1.5 + i) % 2); lx.drawImage(s, 190 + i * 40 - (s.lw >> 1), 136 - s.lh + 6, s.lw, s.lh); }); lx.imageSmoothingEnabled = false;
  blit(); topBar('HOLLOW CREEK');
  // four doors instead of a wall of buttons: the story, then the robots, supplies and archive once the first fight is won (each opens a screen with tabs for its parts)
  const won = progressIdx() >= 1, nxt = STAGES.find(s => !SAVE.stages[s.id]);
  const doors = [['STORY', 'story', 0, nxt ? 'NEXT: ' + nxt.name : 'ALL STAGES CLEARED', 104, true], ['ROBOTS', 'squad', 0, 'SQUAD  /  PREP ROOM  /  HERO', 224, false]];
  if (won) doors.push(['SUPPLY', 'supply', cratesReady() + claimable(), 'CRATES  /  MISSIONS', 308, false], ['ARCHIVE', 'codex', Math.max(0, codexCount() - (SAVE.cxSeen || 0)), 'CODEX  /  THE DUST  /  MEMORIES', 392, false]);
  if (SAVE.stages[FINAL_STAGE] && !SAVE.ending) doors.push(['RETURN CONSOLE', 'choice', 0, 'THE LAST CHOICE', 476, false]);
  doors.forEach(d => {
    const big = d[5], h = big ? 104 : 68;
    button(50, d[4], 420, h, d[0], () => { goScene(d[1]); if (d[1] === 'story') { const n = STAGES.findIndex(s => !SAVE.stages[s.id]); if (!SAVE.seen.prologue && n === 0) { selStage = -1; selCh = 1; return; } selStage = n < 0 ? STAGES.length - 1 : n; selCh = STAGES[selStage].ch; } }, false, big ? 44 : 30, big ? '#ffd040' : null, big ? '#fff0a0' : null);
    ctx.font = (big ? 18 : 14) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#10243a'; ctx.fillText(d[3], 260, d[4] + h - (big ? 20 : 14));
    if (d[2]) { disc(ctx, 470, d[4] + 4, 16, '#e03030'); text(String(d[2]), 470, d[4] + 12, 22, '#fff', 'center', 'rgba(0,0,0,0)'); }
  });
  button(1050, 100, 190, 52, 'HOW TO PLAY', () => openHelp(), false, 20);
  button(1050, 168, 190, 52, 'SAVE DATA', () => openData(), false, 22);
  if (hubLine === null) hubLine = pickHubLine();
  if (hubLine) {   // the squad comments on what has happened so far
    const m = /^([A-Z][A-Z0-9\- ]*[A-Z0-9]):/.exec(hubLine), ls = wrap(hubLine, 560, 20).slice(0, 2);
    panel(440, 580, 600, 72, '#80f0ff'); ls.forEach((l, i) => text(l, 462, (ls.length > 1 ? 606 : 622) + i * 26, 20, m ? SPEAK[m[1]] || '#ffd040' : '#d8e8ff'));
  }
  text(SAVE.hero.name.toUpperCase() + '  +  ' + SAVE.squad.map(id => HUNTER_BY[id].name).join('  /  '), 640, 686, 22, '#fff', 'center');
  if (SAVE.ending) text('ENDING: ' + (SAVE.ending === 'rain' ? 'THE RAIN' : 'THE DEPARTURE'), 640, 712, 16, '#ffd040', 'center');
  button(W - 200, H - 70, 150, 46, 'TITLE', () => { saveGame(); scene = 'title'; }, false, 22);
}

// ---------- story map ----------
function drawStory() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.55)'; ctx.fillRect(0, 70, W, H - 70); topBar('STORY');
  text('CHAPTER ' + selCh + ': ' + CHAPTERS[selCh], 40, 112, 28, '#80f0ff');
  text(CHAPTER_INFO[selCh].fam + ': ' + CHAPTER_INFO[selCh].t, 40, 138, 15, CHAPTER_INFO[selCh].col);
  const chFirst = c => STAGES.findIndex(s => s.ch === c), chMax = Math.max.apply(null, STAGES.map(s => s.ch));
  button(760, 84, 54, 40, '<', () => { selCh--; selStage = selCh === 1 ? -1 : chFirst(selCh); Snd.play('ui'); }, selCh <= 1, 26);
  button(826, 84, 54, 40, '>', () => { selCh++; selStage = chFirst(selCh); Snd.play('ui'); }, selCh >= chMax || !stageUnlocked(chFirst(selCh + 1)), 26);
  const list = STAGES.map((s, i) => [s, i]).filter(p => p[0].ch === selCh);
  if (selCh === 1) list.unshift([PRO_ENTRY, -1]);   // level 0: the prologue, the first node of chapter 1
  list.forEach((p, k) => {
    const s = p[0], i = p[1], x = 90 + k * 118, y = 150 + (k % 2) * 100, ok = i < 0 || stageUnlocked(i), st = i < 0 ? 0 : SAVE.stages[s.id] || 0;
    if (k < list.length - 1) { ctx.fillStyle = '#3a4060'; ctx.fillRect(x + 28, y + 24 + (k % 2 ? -1 : 0), 90, 4); }
    ctx.fillStyle = i === selStage ? '#ffd040' : ok ? '#80f0ff' : '#3a3a4a'; ctx.fillRect(x - 4, y - 4, 64, 64);
    ctx.fillStyle = s.boss ? '#5a1a1a' : '#12141f'; ctx.fillRect(x, y, 56, 56);
    text(i < 0 ? '0' : s.boss ? '!' : String(i + 1 - chFirst(selCh)), x + 28, y + 40, 32, ok ? '#fff' : '#555', 'center');
    if (i < 0) { if (SAVE.seen.prologue) text('DONE', x + 28, y + 76, 16, '#8aff9a', 'center'); } else if (ok) stars(x + 2, y + 62, st, 16);
    if (ok) uiB.push({ x, y, w: 56, h: 56, fn: () => { selStage = i; Snd.play('ui'); } });
  });
  if (selStage < 0) {   // level 0
    panel(40, 330, 760, 380, '#80f0ff');
    text(PRO_ENTRY.name.toUpperCase(), 66, 374, 34, '#ffd040');
    wrap(PRO_ENTRY.brief, 700, 20).forEach((l, i) => text(l, 66, 410 + i * 26, 20, '#d8e4ff'));
    text('LEVEL 0  -  THE FIRST STEPS. NO REWARD, NOBODY CAN FALL.', 66, 500, 18, '#ffb060');
    text(SAVE.seen.prologue ? 'Played. You can walk it again any time.' : 'Start here if you have not played before.', 66, 528, 17, '#c8d8f8');
    text('ENEMIES', 66, 614, 16, '#80f0ff');
    ['raider', 'gunner', 'brute', 'worm'].forEach((t, i) => { const sp = Art.sprite(FOES[t].spr, 0), sc = sp.px ? 2 : 2; ctx.imageSmoothingEnabled = false; ctx.drawImage(sp, 70 + i * 96, 700 - sp.lh * sc, sp.lw * sc, sp.lh * sc); });
    button(540, 650, 240, 50, SAVE.seen.prologue ? 'REPLAY' : 'START', () => { Snd.play('ui'); startPrologue(!!SAVE.seen.prologue); }, false, 28);
    panel(830, 330, 410, 380, '#80f0ff'); text('YOUR SQUAD', 856, 366, 22, '#80f0ff');
    text('You find your robots on the way.', 1035, 480, 18, '#c8d8f8', 'center');
    return;
  }
  const s = STAGES[selStage];
  const fx = stageFx(s), trs = stageTraits(s);
  panel(40, 330, 760, 380, '#80f0ff');
  text(s.name.toUpperCase(), 66, 374, 34, '#ffd040');
  wrap(s.brief, 700, 20).forEach((l, i) => text(l, 66, 410 + i * 26, 20, '#d8e4ff'));
  text('GOAL: ' + goalText(fx.goal), 66, 474, 19, '#ffb060');
  if (s.bonus) { const got = SAVE.bonus && SAVE.bonus[s.id]; text('BONUS: ' + bonusText(s.bonus) + (got ? '  (done)' : '  (+' + bonusOnyx(s) + ' ONYX, once)'), 66, 498, 17, got ? '#8aff9a' : '#c8d8f8'); }
  if (trs.length) text('TRAITS: ' + trs.map(k => TRAITS[k].name).join(', ') + '  (see HOW TO PLAY)', 66, 520, 16, '#80c8ff');
  if (fx.echo) wrap(heroText(fx.echo.line), 700, 16).forEach((l, i) => text(l, 66, 544 + i * 20, 16, '#ffd040'));
  const fd = FINDS[s.id];
  if (fd) { const got = SAVE.found && SAVE.found[s.id]; text(got ? 'OPTIONAL FIND: ' + fd.title + ' (see CODEX > FINDS)' : 'OPTIONAL FIND: not found yet. Walk a robot onto the glint in battle.', 66, 588, 16, got ? '#8aff9a' : '#ffd040'); }
  text('ENEMIES', 66, 614, 16, '#80f0ff');
  const seen = {}; s.waves.forEach(w => w.forEach(e => seen[e[0]] = 1));
  Object.keys(seen).forEach((t, i) => { const sp = Art.sprite(FOES[t].spr, 0), sc = sp.px ? 2 : (FOES[t].boss ? 1 : 2); ctx.imageSmoothingEnabled = false; ctx.drawImage(sp, 70 + i * 96, 700 - sp.lh * sc, sp.lw * sc, sp.lh * sc); });
  text('REWARD  $' + s.gold + '   ONYX ' + s.onyx + (s.unlock ? (HUNTER_BY[s.unlock].human ? '   + NEW ALLY' : '   + NEW ROBOT') : '') + (perkAt(s.id) ? '   + NEW: ' + PERKS[perkAt(s.id)].name : ''), 420, 614, 18, '#ffd040');
  text('WAVES: ' + s.waves.length, 420, 640, 18, '#c8d8f8');
  button(540, 650, 240, 50, 'START', () => {
    if (SAVE.squad.length !== 3) return; Snd.play('ui'); const st = STAGES[selStage], idx = selStage;
    if ((hasStageScene('pre', st) || st.pre) && !SAVE.seen['pre' + st.id]) playStageScene('pre', st, () => startBattle(idx)); else startBattle(idx);
  }, !stageUnlocked(selStage) || SAVE.squad.length !== 3, 28);
  // squad strip
  panel(830, 330, 410, 380, '#80f0ff'); text('YOUR SQUAD', 856, 366, 22, '#80f0ff');
  SAVE.squad.forEach((id, i) => { smallSprite(HUNTER_BY[id].spr, 900 + i * 125, 540, 3, Math.floor(time * 1.5 + i) % 2); text(HUNTER_BY[id].name, 900 + i * 125, 590, 15, '#fff', 'center'); text('LV ' + SAVE.h[id].lvl, 900 + i * 125, 614, 14, '#ffd040', 'center'); });
  button(1050, 340, 170, 36, 'CHANGE SQUAD', () => { scene = 'squad'; }, false, 16);
}

// ---------- squad ----------
let coachStep = 0;   // first visit after the prologue: 1 = take a robot out, 2 = put it back
function drawSquad() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.7)'; ctx.fillRect(0, 70, W, H - 70); topBar('SQUAD'); hubTabs('squad');
  if (coachStep === 1 && SAVE.squad.length < 3) coachStep = 2;
  if (coachStep === 2 && SAVE.squad.length === 3) { coachStep = 0; SAVE.seen.coach = 1; saveGame(); toastMsg('Three slots. More robots wake up as you clear stages.'); }
  text(coachStep === 1 ? 'THIS IS YOUR SQUAD: THREE SLOTS. TAP A ROBOT IN A GOLD FRAME TO TAKE IT OUT.' : coachStep === 2 ? 'NOW TAP IT AGAIN TO PUT IT BACK. A SQUAD NEEDS THREE.' : 'TAP A MEMBER TO ADD OR REMOVE IT. YOU NEED 3.', 40, 112, 22, coachStep ? '#ffd040' : '#80f0ff');
  scrollArea('squad', 30, 122, 764, 546, 8 + Math.ceil(HUNTERS.length / 4) * 172, 800, () => HUNTERS.forEach((h, i) => {
    const x = 40 + (i % 4) * 190, y = 130 + Math.floor(i / 4) * 172, own = SAVE.owned.indexOf(h.id) >= 0, inSq = SAVE.squad.indexOf(h.id) >= 0;
    const pul = coachStep && own && (coachStep === 1 ? inSq : !inSq) && Math.floor(time * 3) % 2;
    ctx.fillStyle = pul ? '#ffffff' : inSq ? '#ffd040' : own ? h.col : '#333'; ctx.fillRect(x - 4, y - 4, 178, 168);
    ctx.fillStyle = '#12141f'; ctx.fillRect(x, y, 170, 160);
    if (own) {
      smallSprite(h.spr, x + 85, y + 98, 2, Math.floor(time * 1.5 + i) % 2); text(h.name, x + 85, y + 122, 20, '#fff', 'center'); text(h.role + '  LV ' + SAVE.h[h.id].lvl, x + 85, y + 146, 14, h.col, 'center');
      if (inSq) text('IN SQUAD', x + 85, y + 16, 13, '#ffd040', 'center');
      uiB.push({ x, y, w: 170, h: 160, fn: () => { detailH = h.id; Snd.play('ui'); const k = SAVE.squad.indexOf(h.id); if (k >= 0) { if (SAVE.squad.length > 1) SAVE.squad.splice(k, 1); } else if (SAVE.squad.length < 3) SAVE.squad.push(h.id); else { SAVE.squad[selSlot] = h.id; selSlot = (selSlot + 1) % 3; } saveGame(); } });
    } else { text('LOCKED', x + 85, y + 80, 24, '#666', 'center'); text(STAGES.find(s => s.unlock === h.id) ? 'Clear ' + STAGES.find(s => s.unlock === h.id).name : '', x + 85, y + 110, 13, '#666', 'center'); }
  }));
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
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.78)'; ctx.fillRect(0, 70, W, H - 70); topBar('PREP ROOM'); hubTabs('prep');
  const two = SAVE.owned.length > 8;
  SAVE.owned.forEach((id, i) => {
    const x = two ? 8 + (i % 2) * 56 : 20, y = 84 + (two ? Math.floor(i / 2) : i) * 76, w = two ? 48 : 70, h = HUNTER_BY[id];
    ctx.fillStyle = detailH === id ? '#ffd040' : h.col; ctx.fillRect(x - 3, y - 3, w + 6, 70); ctx.fillStyle = '#12141f'; ctx.fillRect(x, y, w, 64);
    if (two) { ctx.imageSmoothingEnabled = false; ctx.drawImage(Art.icon(h.spr, 0), 0, 1, 24, 16, x + 1, y + 12, 46, 31); } else faceSprite(h.spr, x + 35, y + 6, 2, 0);
    uiB.push({ x, y, w, h: 64, fn: () => { detailH = id; Snd.play('ui'); } });
  });
  const id = detailH, h = HUNTER_BY[id], sv = SAVE.h[id], st = hunterStats(id);
  panel(120, 84, 400, 600, h.col);
  smallSprite(h.spr, 320, 240, 4, Math.floor(time * 2) % 2);
  text(h.name, 320, 262, 30, '#fff', 'center'); text(h.role + '   LV ' + sv.lvl, 320, 290, 20, h.col, 'center');
  text('HP ' + Math.round(st.hp) + '   ATK ' + Math.round(st.atk), 140, 330, 20, '#fff');
  text('SPEED ' + Math.round(st.spd) + '   CRIT ' + Math.round(st.crit * 100) + '%', 140, 358, 18, '#c8d8f8');
  const lc = levelCost(sv.lvl), sc = 4 * sv.skill + 2, cap = skillCap();
  button(140, 380, 360, 50, 'LEVEL UP  $' + lc, () => { if (SAVE.gold >= lc && sv.lvl < 30) { SAVE.gold -= lc; sv.lvl++; Snd.play('level'); saveGame(); } }, SAVE.gold < lc || sv.lvl >= 30, 22);
  button(140, 440, 360, 50, 'ULT LV ' + sv.skill + ' > ' + (sv.skill + 1) + '   ' + sc + ' ONYX', () => { if (SAVE.onyx >= sc && sv.skill < cap) { SAVE.onyx -= sc; sv.skill++; Snd.play('level'); saveGame(); } }, SAVE.onyx < sc || sv.skill >= cap, 18);
  text('ULT: ' + h.ult + '  x' + st.ultMul.toFixed(2) + (sv.skill >= cap ? (cap < 8 ? '  (MAX, more after ULT LINK)' : '  (MAX)') : ''), 140, 520, 16, '#ffd040');
  const fxs = Object.keys(st.gfx); text(fxs.length ? 'TRAITS: ' + fxs.map(k => GEAR_FX[k].name + (st.gfx[k] > 1 ? ' x' + st.gfx[k] : '')).join(', ') : 'TRAITS: none (FINE gear and better carry one)', 140, 536, 13, '#80f0ff');
  // equipped gear
  text('GEAR', 140, 556, 18, '#80f0ff');
  ['weapon', 'armor', 'core'].forEach((sl, i) => {
    const x = 140 + i * 124, y = 570, g = sv.gear[sl];
    if (g) { drawGearIcon(g, x, y, 76); uiB.push({ x, y, w: 76, h: 76, fn: () => { if (SAVE.bag.length < BAGMAX) { SAVE.bag.push(g); sv.gear[sl] = null; Snd.play('ui'); saveGame(); } } }); }
    else { ctx.fillStyle = '#3a3a4a'; ctx.fillRect(x - 3, y - 3, 82, 82); ctx.fillStyle = '#12141f'; ctx.fillRect(x, y, 76, 76); text(sl.toUpperCase(), x + 38, y + 44, 13, '#555', 'center'); }
  });
  const cnt = {}; ['weapon', 'armor', 'core'].forEach(sl => { const g = sv.gear[sl]; if (g) cnt[g.set] = (cnt[g.set] || 0) + 1; });
  SETS.forEach((s, i) => { const n = cnt[s.id] || 0; if (n >= 2) { text(s.name + ' ' + n + 'pc: ' + s.b2, 140, 662, 13, '#ffd040'); if (n >= 3) wrap(s.b3, 360, 12).forEach((l, k) => text(l, 140, 678 + k * 14, 12, '#ffd040')); } });
  if (!SETS.some(s => (cnt[s.id] || 0) >= 2)) text('2 or 3 pieces of one set (same corner color) give a bonus.', 140, 662, 13, '#8890b0');
  // bag
  text('BAG ' + SAVE.bag.length + '/' + BAGMAX, 560, 108, 22, '#80f0ff');
  for (let i = 0; i < BAGMAX; i++) {
    const x = 560 + (i % 6) * 96, y = 124 + Math.floor(i / 6) * 96, g = SAVE.bag[i];
    if (g) { drawGearIcon(g, x, y, 78); if (i === selBagI) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x - 5, y - 5, 88, 88); } uiB.push({ x, y, w: 78, h: 78, fn: () => { selBagI = i; Snd.play('ui'); } }); }
    else { ctx.fillStyle = '#242636'; ctx.fillRect(x, y, 78, 78); }
  }
  const g = SAVE.bag[selBagI];
  if (g) {
    text(g.name.toUpperCase(), 560, 520, 24, RAR[g.rar].c); text(RAR[g.rar].n + ' ' + g.slot.toUpperCase() + '  -  ' + SETS.find(s => s.id === g.set).name, 560, 544, 16, '#c8d8f8');
    text(gearLine(g), 560, 568, 18, '#8aff9a');
    if (g.fx) wrap(fxLine(g), 640, 15).forEach((l, k) => text(l, 560, 590 + k * 16, 15, GEAR_FX[g.fx].col));
    else text('No trait. FINE gear and better have one.', 560, 590, 15, '#667');
    button(560, 616, 200, 44, 'EQUIP', () => { const old = sv.gear[g.slot]; sv.gear[g.slot] = g; SAVE.bag.splice(selBagI, 1); if (old) SAVE.bag.push(old); selBagI = -1; Snd.play('pickup'); saveGame(); }, false, 22);
    button(780, 616, 220, 44, 'SELL $' + gearValue(g), () => { SAVE.gold += gearValue(g); SAVE.bag.splice(selBagI, 1); selBagI = -1; Snd.play('pickup'); saveGame(); }, false, 20);
    const nextSet = SETS[(SETS.findIndex(q => q.id === g.set) + 1) % SETS.length], tc = 3, rc = 60 + g.rar * 40;
    button(560, 668, 270, 40, hasPerk('tune') ? 'SET > ' + nextSet.name + '  ' + tc + ' ONYX' : perkLocked('tune'), () => { if (SAVE.onyx >= tc) { SAVE.onyx -= tc; g.set = nextSet.id; Snd.play('level'); saveGame(); } }, !hasPerk('tune') || SAVE.onyx < tc, 14);
    button(850, 668, 270, 40, !g.fx ? 'REFORGE: needs a trait' : hasPerk('reforge') ? 'REFORGE TRAIT  $' + rc : perkLocked('reforge'), () => {
      if (SAVE.gold < rc || !g.fx) return; SAVE.gold -= rc; const old = g.fx; g.fx = pick(FX_IDS.filter(k => k !== old)); Snd.play('level'); toastMsg('New trait: ' + GEAR_FX[g.fx].name); saveGame(); }, !g.fx || !hasPerk('reforge') || SAVE.gold < rc, 14);
  } else text('Select an item', 560, 560, 18, '#667');
}

// ---------- supply ----------
let crateChoice = null;   // pick-of-three offer: { opts: [gear, gear, gear] }
function openCrate(c, i) {
  const pi = progressIdx() * 14 / (STAGES.length - 1), gold = Math.round((80 + i * 60) * (1 + pi * 0.12)), on = 3 + i * 3;   // pi: progress on the old 15-stage scale
  SAVE.gold += gold; SAVE.onyx += on; let gt = '';
  const gearWon = Math.random() < 0.3 + 0.15 * i || (i === 2 && hasPerk('pick3'));
  if (gearWon && hasPerk('pick3')) { crateChoice = { opts: [genGear(pi, i), genGear(pi, i), genGear(pi, i)] }; gt = '  - choose 1 piece'; }
  else if (gearWon) { const g = genGear(pi, i); addGear(g); gt = '  + ' + g.name; }
  bumpMission('crate', 1); c.s = 0; Snd.play('pickup'); saveGame(); toastMsg('+$' + gold + '  +' + on + ' ONYX' + gt);
}
function drawCrateChoice() {
  text('CHOOSE ONE PIECE', 640, 120, 40, '#ffd040', 'center'); text('The other two are lost. Look at the trait and the set before you pick.', 640, 156, 19, '#c8d8f8', 'center');
  crateChoice.opts.forEach((g, i) => {
    const x = 60 + i * 400, y = 190;
    panel(x, y, 360, 420, RAR[g.rar].c); drawGearIcon(g, x + 140, y + 24, 80);
    text(g.name.toUpperCase(), x + 180, y + 138, 24, RAR[g.rar].c, 'center'); text(RAR[g.rar].n + ' ' + g.slot.toUpperCase(), x + 180, y + 162, 16, '#c8d8f8', 'center');
    const set = SETS.find(q => q.id === g.set); text(set.name, x + 180, y + 188, 18, ['#ffb040', '#80c8ff', '#c070ff'][SETS.indexOf(set)], 'center');
    text(set.b2, x + 180, y + 210, 14, '#9aa4c8', 'center');
    text(gearLine(g), x + 180, y + 240, 17, '#8aff9a', 'center');
    if (g.fx) { text(GEAR_FX[g.fx].name + '  (' + GEAR_FX[g.fx].role + ')', x + 180, y + 274, 20, GEAR_FX[g.fx].col, 'center'); wrap(GEAR_FX[g.fx].desc, 320, 15).forEach((l, k) => text(l, x + 180, y + 298 + k * 18, 15, '#d8e4ff', 'center')); }
    else text('No trait', x + 180, y + 280, 16, '#667', 'center');
    button(x + 60, y + 350, 240, 52, 'TAKE', () => { addGear(g); crateChoice = null; Snd.play('pickup'); saveGame(); toastMsg('+ ' + g.name); }, false, 26);
  });
}
function drawSupply() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.78)'; ctx.fillRect(0, 70, W, H - 70);
  if (crateChoice) { drawCrateChoice(); return; }
  topBar('SUPPLY'); hubTabs('supply');
  text('Call supply crates from the Sable Crows. Their caravans take time to arrive.', 40, 120, 22, '#80f0ff');
  SAVE.crates.forEach((c, i) => {
    const x = 60 + i * 400, y = 170, s = crateState(c), left = Math.max(0, Math.ceil((c.t - Date.now()) / 1000));
    panel(x, y, 360, 420, s === 2 ? '#ffd040' : '#80f0ff');
    const sp = Art.sprite('crate', 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(sp, x + 80, y + 40, sp.width * 11, sp.height * 11);
    text('CRATE ' + (i + 1), x + 180, y + 270, 28, '#fff', 'center'); text('TIER ' + (i + 1) + '  (' + CRATE_T[i] + 's)', x + 180, y + 298, 16, '#c8d8f8', 'center');
    if (s === 0) button(x + 60, y + 330, 240, 62, 'CALL', () => { c.s = 1; c.t = Date.now() + CRATE_T[i] * 1000; Snd.play('ui'); saveGame(); }, false, 28);
    else if (s === 1) {
      const rc = 3 + i * 2;
      button(x + 40, y + 312, 280, 40, hasPerk('rush') ? 'RUSH  ' + rc + ' ONYX' : perkLocked('rush'), () => { if (SAVE.onyx >= rc) { SAVE.onyx -= rc; c.t = 0; Snd.play('level'); saveGame(); } }, !hasPerk('rush') || SAVE.onyx < rc, 15);
      text('ARRIVES IN ' + left + 's', x + 180, y + 378, 24, '#ffd040', 'center'); bar(x + 40, y + 392, 280, 12, 1 - left / CRATE_T[i], '#80f0ff');
    }
    else button(x + 60, y + 330, 240, 62, 'OPEN', () => openCrate(c, i), false, 28);
  });
  if (hasPerk('pick3')) text('PICK OF THREE: gear from crates is a choice. Tier 3 always holds gear.', 40, 628, 17, '#ffd040');
}

// ---------- missions ----------
function drawMissions() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.78)'; ctx.fillRect(0, 70, W, H - 70); topBar('MISSIONS'); hubTabs('missions');
  text('DAILY MISSIONS (reset each day)', 40, 120, 22, '#80f0ff');
  MISSIONS.forEach((m, i) => {
    const y = 150 + i * 100, p = SAVE.missions[m.id];
    panel(60, y, 1100, 80, p.c ? '#555' : p.p >= m.goal ? '#ffd040' : '#80f0ff');
    text(m.text, 90, y + 36, 26, '#fff'); bar(90, y + 52, 500, 12, p.p / m.goal, '#80f0ff'); text(p.p + '/' + m.goal, 610, y + 64, 18, '#c8d8f8');
    text('$' + m.gold + '  ' + m.onyx + ' ONYX', 760, y + 46, 22, '#ffd040');
    button(980, y + 14, 150, 52, p.c ? 'DONE' : 'CLAIM', () => { SAVE.gold += m.gold; SAVE.onyx += m.onyx; p.c = true; Snd.play('pickup'); saveGame(); }, p.c || p.p < m.goal, 24);
  });
}

// ---------- result: what the rewards can buy now ----------
function nextHints() {
  const out = [], sq = SAVE.squad.slice().sort((a, b) => SAVE.h[a].lvl - SAVE.h[b].lvl);
  const lv = sq.filter(id => SAVE.h[id].lvl < 30)[0];
  if (lv) { const c = levelCost(SAVE.h[lv].lvl), n = sq.filter(id => SAVE.h[id].lvl < 30 && SAVE.gold >= levelCost(SAVE.h[id].lvl)).length;
    out.push(n ? 'GOLD $' + SAVE.gold + ': ' + n + ' level-up' + (n > 1 ? 's' : '') + ' ready. Weakest is ' + HUNTER_BY[lv].name + ' ($' + c + ').' : 'GOLD $' + SAVE.gold + ': next level-up is ' + HUNTER_BY[lv].name + ' for $' + c + '.'); }
  const cap = skillCap(), up = sq.filter(id => SAVE.h[id].skill < cap).sort((a, b) => SAVE.h[a].skill - SAVE.h[b].skill)[0];
  const alt = ['tune', 'rush'].filter(hasPerk).map(k => PERKS[k].name);
  if (up) out.push('ONYX ' + SAVE.onyx + ': ' + HUNTER_BY[up].name + ' ULT costs ' + (4 * SAVE.h[up].skill + 2) + (alt.length ? '. Or spend it on ' + alt.join(' / ') + '.' : '.'));
  return out;
}

// ---------- result ----------
function drawResult() {
  const r = B.result;
  ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, W, H);
  panel(300, 60, 680, 650, r.win ? '#ffd040' : '#e04040');
  text(r.win ? 'MISSION COMPLETE' : 'SQUAD DOWN', 640, 140, 54, r.win ? '#ffd040' : '#ff6060', 'center');
  text(B.stage.name.toUpperCase(), 640, 176, 22, '#c8d8f8', 'center');
  if (r.win) {
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i < r.stars ? '#ffd040' : '#3a3a4a'; ctx.fillRect(520 + i * 80, 200, 60, 60); }
    text('DESTROYED ' + B.kills + '   COMBOS ' + B.combos + '   ULTS ' + B.ults, 640, 296, 20, '#fff', 'center');
    text('$' + r.gold + '    ' + r.onyx + ' ONYX', 640, 344, 34, '#ffd040', 'center');
    if (r.gear) {
      drawGearIcon(r.gear, 450, 372, 80); text(r.gear.name.toUpperCase(), 550, 396, 24, RAR[r.gear.rar].c); text(gearLine(r.gear), 550, 420, 16, '#8aff9a');
      if (r.gear.fx) text(fxLine(r.gear), 550, 442, 14, GEAR_FX[r.gear.fx].col); else text('No trait. Sell it, or wear it for the set.', 550, 442, 14, '#8890b0');
    }
    if (r.bonus) text('BONUS: ' + r.bonus.text + (r.bonus.met ? (r.bonus.onyx ? '  DONE  +' + r.bonus.onyx + ' ONYX' : '  DONE') : '  MISSED'), 640, 482, 18, r.bonus.met ? '#8aff9a' : '#a0a8c0', 'center');
    if (r.found) text('FOUND: ' + FINDS[r.found].title + ' (added to the codex)', 640, 506, 18, '#ffd040', 'center');
    if (r.unlock) { const h = HUNTER_BY[r.unlock]; smallSprite(h.spr, 400, 600, 2, 0); text((h.human ? 'NEW ALLY: ' : 'NEW ROBOT: ') + h.name, 640, 536, 26, h.col, 'center'); wrap(STORY_BITS[r.unlock], 480, 16).forEach((l, i) => text(l, 640, 562 + i * 20, 16, '#c8d8f8', 'center')); }
    else if (r.perk) { const pk = PERKS[r.perk]; text('NEW: ' + pk.name, 640, 540, 28, '#ffd040', 'center'); wrap(pk.text, 560, 17).forEach((l, i) => text(l, 640, 568 + i * 22, 17, '#c8d8f8', 'center')); }
    nextHints().forEach((l, i) => text(l, 640, 616 + i * 20, 15, '#80f0ff', 'center'));
  } else {
    text('Your robots were destroyed.', 640, 270, 24, '#fff', 'center');
    let y = 322; (r.why || []).forEach(w => { wrap('- ' + w, 580, 19).forEach((l, k) => { text(l, k ? 366 : 346, y, 19, '#d8e4ff'); y += 25; }); y += 8; });
    if (r.found) text('FOUND: ' + FINDS[r.found].title + ' (added to the codex)', 640, 540, 18, '#ffd040', 'center');
    text('Level up in the Prep Room, or change the squad, and try again.', 640, 566, 17, '#8890b0', 'center');
    nextHints().forEach((l, i) => text(l, 640, 600 + i * 20, 15, '#80f0ff', 'center'));
  }
  // the story card for a first win plays when the player leaves the result screen; after the last fight the ending choice follows
  const leave = fn => { const o = r.outro, last = r.final; r.outro = null; r.final = false; const done = last ? () => { scene = 'choice'; } : fn; B = null; if (o) playStageScene('post', stageById(o), done); else done(); };
  button(330, 652, 190, 44, 'HOME', () => { leave(() => { scene = 'hub'; }); }, false, 22);
  button(540, 652, 190, 44, 'RETRY', () => { const i = B.idx; leave(() => startBattle(i)); }, false, 22);
  if (r.win && B.idx + 1 < STAGES.length) button(750, 652, 200, 44, 'NEXT', () => { const i = B.idx + 1; leave(() => { selStage = i; selCh = STAGES[i].ch; scene = 'story'; }); }, false, 22);
}
function toastMsg(s) { toast = { s, t: 3.5 }; }
let toast = { s: '', t: 0 };
