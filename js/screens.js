'use strict';
// ---------- hero creator, codex and the final choice ----------
let heroTyping = false, cxCat = 0, cxSel = 0;

function opt(x, y, w, h, label, sel, fn, off, size, sub) {   // sub = small second line, e.g. the gameplay effect
  const hot = !off && mxF >= x && mxF <= x + w && myF >= y && myF <= y + h;
  ctx.fillStyle = sel ? '#ffd040' : '#000'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = sel ? '#40c8e0' : off ? '#1a1c28' : hot ? '#3a4a6a' : '#242a40'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = sel ? '#06101a' : off ? '#555a6a' : '#d8e8ff'; ctx.font = (size || 20) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (sub) { ctx.fillText(label, x + w / 2, y + h * 0.36); ctx.font = '12px ' + FONT; ctx.fillStyle = sel ? '#06303a' : off ? '#555a6a' : '#ffd040'; ctx.fillText(sub, x + w / 2, y + h * 0.76); }
  else ctx.fillText(label, x + w / 2, y + h / 2 + 2);
  if (!off) uiB.push({ x, y, w, h, fn });
}
function swatch(x, y, w, h, col, sel, fn, off) {
  ctx.fillStyle = sel ? '#ffd040' : '#000'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
  if (off && !sel) { ctx.fillStyle = 'rgba(8,10,24,0.65)'; ctx.fillRect(x, y, w, h); }
  if (!off) uiB.push({ x, y, w, h, fn });
}

// ---------- hero creator ----------
function drawHero() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.86)'; ctx.fillRect(0, 0, W, H);
  const hs = SAVE.hero, done = SAVE.heroDone;
  text(done ? 'YOUR HERO' : 'CREATE YOUR HERO', 40, 60, 40, '#fff');
  if (done) button(1130, 12, 120, 46, 'HOME', () => { saveGame(); scene = 'hub'; Snd.play('ui'); }, false, 22);
  panel(40, 90, 440, 590, '#80f0ff');
  const s = Art.hero(hs, Math.floor(time * 1.5) % 2); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(s, 104, 150, 312, 312);
  const nm = hs.name + (heroTyping && Math.floor(time * 3) % 2 ? '_' : '');
  text(nm.toUpperCase(), 260, 536, 40, '#fff', 'center');
  const org = ORIGINS.find(o => o.id === hs.origin);
  text(org.name, 260, 570, 22, '#ffd040', 'center');
  const edit = () => { Snd.play('ui'); if (SAVE.heroDone) saveGame(); };   // after the story began every change is stored at once
  button(70, 596, 190, 50, heroTyping ? 'TYPING...' : 'NAME', () => {
    let v = null; try { v = window.prompt('Name your hero (12 letters max):', hs.name); } catch (e) {}
    if (v === null || v === undefined) { heroTyping = true; return; }
    const n = v.replace(/[^A-Za-z0-9 \-]/g, '').trim().slice(0, 12); if (n) { hs.name = n; edit(); }
  }, false, 24);
  button(280, 596, 170, 50, 'RANDOM', () => { hs.name = pick(HERO_NAMES.filter(n => n !== hs.name)); edit(); }, false, 22);
  if (heroTyping) text('Type on your keyboard. ENTER when done.', 260, 668, 14, '#ffd040', 'center');

  panel(520, 90, 720, 590, '#80f0ff');
  const lab = (t, y) => text(t, 550, y + 32, 20, '#80f0ff');
  const set = (k, i) => () => { hs[k] = i; edit(); };
  lab('STYLE', 114); HERO_STYLES.forEach((n, i) => opt(700 + i * 124, 114, 118, 44, n, (hs.style | 0) === i, set('style', i), !heroOptionOpen('style', i), 18));
  lab('CLOTHES', 174); HERO_OUTFITS.forEach((n, i) => opt(700 + i * 124, 174, 118, 44, n, (hs.outfit | 0) === i, set('outfit', i), !heroOptionOpen('outfit', i), 18));
  lab('COLOR', 234); HERO_COATS.forEach((c, i) => swatch(700 + i * 72, 234, 64, 44, c, hs.coat === i, set('coat', i), !heroOptionOpen('coat', i)));
  lab('SKIN', 294); HERO_SKINS.forEach((c, i) => swatch(700 + i * 72, 294, 64, 44, c, hs.skin === i, set('skin', i), !heroOptionOpen('skin', i)));
  lab('HAIR', 354); HERO_HAIRS.forEach((c, i) => swatch(700 + i * 72, 354, 64, 44, c, hs.hair === i, set('hair', i), !heroOptionOpen('hair', i)));
  lab('SEAL', 414); HERO_MARKS.forEach((c, i) => swatch(700 + i * 72, 414, 64, 44, c, hs.mark === i, set('mark', i), done || !heroOptionOpen('mark', i)));
  text('PAST', 550, 470 + 36, 20, '#ffd040'); ORIGINS.forEach((o, i) => opt(700 + i * 124, 470, 118, 52, o.name, hs.origin === o.id, set('origin', o.id), done, 17, o.short));
  text('Looks only: Style, Clothes, Color, Skin, Hair, Seal.  Gameplay bonus: Past.', 550, 544, 14, '#8890b0');
  wrap(org.desc, 650, 19).forEach((l, i) => text(l, 550, 574 + i * 25, 19, '#d8e4ff'));
  if (done) text('Past and Seal are fixed after the story begins.', 550, 646, 15, '#8890b0');
  button(900, 612, 300, 54, done ? 'SAVE' : 'BEGIN', () => { if (done) { saveGame(); scene = 'hub'; Snd.play('ui'); } else confirmHero(); }, false, 28);
}

// ---------- codex ----------
function drawCodex() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.82)'; ctx.fillRect(0, 70, W, H - 70); topBar('CODEX');
  CODEX_CATS.forEach((c, i) => opt(40 + i * 172, 84, 164, 44, c, cxCat === i, () => { cxCat = i; cxSel = 0; Snd.play('ui'); }, false, 19));
  const list = CODEX.filter(e => e.cat === CODEX_CATS[cxCat]);
  panel(40, 150, 360, 530, '#80f0ff');
  list.forEach((e, i) => {
    const y = 164 + i * 38, vis = codexVisible(e);
    ctx.fillStyle = i === cxSel ? '#ffd040' : '#000'; ctx.fillRect(48, y - 2, 344, 34);
    ctx.fillStyle = vis ? (i === cxSel ? '#40c8e0' : '#242a40') : '#14161f'; ctx.fillRect(50, y, 340, 30);
    ctx.font = '18px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = i === cxSel ? '#06101a' : vis ? '#d8e8ff' : '#444a5a';
    ctx.fillText(vis ? e.title : '???', 62, y + 17);
    if (vis) uiB.push({ x: 50, y, w: 340, h: 30, fn: () => { cxSel = i; Snd.play('ui'); } });
  });
  panel(430, 150, 810, 530, '#80f0ff');
  const e = list[cxSel];
  if (!e || !codexVisible(e)) { text('Not discovered yet. Keep going.', 460, 220, 22, '#667'); return; }
  text(e.title, 460, 200, 32, '#ffd040');
  if (e.src) text(e.src, 460, 226, 15, '#80f0ff');
  if (e.spr) smallSprite(e.spr, 1170, 330, 3, Math.floor(time * 2) % 2);
  let y = e.src ? 262 : 244; const mw = e.spr ? 640 : 740;
  codexParts(e).forEach(p => {
    const ok = cleared(p.at), lines = wrap(ok ? heroText(p.t) : '[ DATA CORRUPTED. PROGRESS THROUGH THE STORY TO RESTORE IT. ]', mw, 19);
    lines.forEach(l => { text(l, 460, y, 19, ok ? '#d8e4ff' : '#4a5068'); y += 25; }); y += 12;
  });
  // links to related entries the player has already unlocked
  const links = (e.see || []).map(codexFind).filter(t => t && codexVisible(t));
  if (links.length) {
    text('SEE ALSO', 460, 622, 14, '#80f0ff');
    links.slice(0, 3).forEach((t, k) => opt(460 + k * 250, 632, 240, 36, t.title, false, () => {
      cxCat = CODEX_CATS.indexOf(t.cat); cxSel = CODEX.filter(q => q.cat === t.cat).indexOf(t); Snd.play('ui');
    }, false, 15));
  }
}

// ---------- the final choice ----------
function drawChoice() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(4,6,16,0.9)'; ctx.fillRect(0, 0, W, H);
  text('THE RETURN CONSOLE', W / 2, 120, 60, '#80f0ff', 'center', '#1a4a8a');
  CHOICE.head.forEach((l, i) => text(l, W / 2, 190 + i * 36, 24, i ? '#d8e8ff' : '#40f0e0', 'center'));
  [['rain', 90], ['ascend', 660]].forEach(p => {
    const c = CHOICE[p[0]], x = p[1];
    panel(x, 290, 530, 330, p[0] === 'rain' ? '#6ac8ff' : '#ffd040');
    text(c.title, x + 265, 350, 38, '#fff', 'center');
    wrap(c.desc, 470, 22).forEach((l, i) => text(l, x + 265, 410 + i * 30, 22, '#d8e4ff', 'center'));
    button(x + 115, 540, 300, 58, 'CHOOSE', () => chooseEnding(p[0]), false, 28);
  });
  text('Your squad will remember either way.', W / 2, 670, 20, '#8890b0', 'center');
}

// ---------- world map: the Families, their ground, and what they think of you ----------
let worldSel = 0, worldFam = 0;
const FAMILIES = [
  { id: 'vance', name: 'VANCE SYNDICATE', col: '#7a9af0', who: 'ezra', at: 's1', ch: 1,
    holds: 'Fuel, the Dead Rail, the Tribunal\'s pay, a hundred blue coats.', wants: 'Every Seal, and a name for every drowned town.' },
  { id: 'crows', name: 'SABLE CROWS', col: '#c090f0', who: 'corva', at: 's5', ch: 2,
    holds: 'The couriers, the brokers and the market. Their wagons cross every line.', wants: 'To stay needed. Never to be asked what they sold.' },
  { id: 'dalton', name: 'DALTON COMBINE', col: '#f0a050', who: 'ma', at: 's6', ch: 3,
    holds: 'Scrap, steel and the Rust Riders. Everything the Ark was built from.', wants: 'To be left alone, and to have her son back.' },
  { id: 'calloway', name: 'HOUSE CALLOWAY', col: '#80c8ff', who: 'calloway', at: 's3', ch: 5,
    holds: 'The dam, the reservoir bed and the daily ration line.', wants: 'The old man: a ship that left. His granddaughter: the truth.' }
];
function famStanding(f) {
  const fl = k => (SAVE.fl && SAVE.fl[k]) || '';
  if (f.id === 'vance') return cleared('s12') ? (fl('ezra') === 'mercy' ? 'Spared. Ezra walked away.' : fl('ezra') === 'cold' ? 'Broken. Ezra was left in the dust.' : 'Beaten.') : cleared('s17') ? 'Hunting you. The Tribunal is broken.' : 'Hostile. They burned Willow Fork.';
  if (f.id === 'crows') return cleared('s19') ? (fl('crow') === 'debt' ? 'You owe Corva a favour, and she knows it.' : 'Square. You owe the Crows nothing.') : 'Neutral. Everything has a price.';
  if (f.id === 'dalton') return cleared('s21') ? (fl('jonah') === 'promise' ? 'Allies. You promised to bring Jonah\'s Seal home.' : 'Allies, for now.') : cleared('s20') ? 'Respect, the Yard kind.' : 'Neutral on principle.';
  return cleared('s14') ? 'Dessa knows what her house did.' : cleared('s26') ? (fl('dessa') === 'honest' ? 'Dessa trusts you with the truth.' : fl('dessa') === 'hidden' ? 'Dessa trusts you. She should not yet.' : 'Dessa watches the line.') : 'Unknown. Their gate is closed.';
}
function drawWorld() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.88)'; ctx.fillRect(0, 70, W, H - 70); topBar('THE DUST');
  const mx = 30, my = 92; ctx.imageSmoothingEnabled = false; ctx.drawImage(Back.scene('worldmap'), mx, my, 640, 360);
  ctx.strokeStyle = '#80f0ff'; ctx.lineWidth = 4; ctx.strokeRect(mx - 2, my - 2, 644, 364);
  const rg = (t, x, y, c) => text(t, mx + x * 2, my + y * 2, 14, c || '#c8d0e8', 'center');
  rg('HOLLOW CREEK', 27, 112); rg('DEAD RAIL', 96, 62, '#a8a8c0'); rg('SABLE MARKET', 147, 108, '#c090f0'); rg('WRECK YARD', 92, 140, '#f0a050'); rg('DUST SEA', 232, 168, '#e8c880'); rg('LOWER FORK', 222, 70, '#a09080'); rg('CALLOWAY DAM', 286, 74, '#80c8ff'); rg('LAUNCH RAIL', 214, 34, '#a8a8c0');
  const nextI = STAGES.findIndex(q => !SAVE.stages[q.id]);
  STAGES.forEach((st, i) => {
    const l = STAGE_LOC[st.id]; if (!l) return; const x = mx + l[0] * 2, y = my + l[1] * 2, done = SAVE.stages[st.id] > 0, ok = stageUnlocked(i), col = CHAPTER_INFO[st.ch].col, r = st.boss ? 9 : 6;
    ctx.fillStyle = '#000'; ctx.fillRect(x - r - 2, y - r - 2, r * 2 + 4, r * 2 + 4);
    ctx.fillStyle = i === worldSel ? '#ffd040' : done ? col : ok ? '#e8f0ff' : '#3a3a4a'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    if (!done) { ctx.fillStyle = ok ? '#0a0e1c' : '#1a1a24'; ctx.fillRect(x - r + 3, y - r + 3, r * 2 - 6, r * 2 - 6); }
    if (i === nextI && Math.floor(time * 3) % 2) { ctx.strokeStyle = '#ffd040'; ctx.lineWidth = 3; ctx.strokeRect(x - r - 5, y - r - 5, r * 2 + 10, r * 2 + 10); }
    uiB.push({ x: x - 10, y: y - 10, w: 20, h: 20, fn: () => { worldSel = i; Snd.play('ui'); } });
  });
  const st = STAGES[worldSel], ok = stageUnlocked(worldSel);
  panel(30, 470, 640, 220, CHAPTER_INFO[st.ch].col);
  text(st.name.toUpperCase(), 54, 512, 28, '#ffd040'); text('CH ' + st.ch + '  ' + CHAPTER_INFO[st.ch].fam, 646, 512, 15, CHAPTER_INFO[st.ch].col, 'right');
  wrap(ok ? st.brief : 'Not reachable yet. Finish the stage before it.', 590, 18).slice(0, 3).forEach((l, i) => text(l, 54, 548 + i * 24, 18, '#d8e4ff'));
  text(SAVE.stages[st.id] ? 'CLEARED' : ok ? 'OPEN' : 'LOCKED', 54, 640, 18, SAVE.stages[st.id] ? '#8aff9a' : ok ? '#ffd040' : '#667');
  button(430, 628, 220, 46, 'OPEN IN STORY', () => { selStage = worldSel; selCh = st.ch; scene = 'story'; Snd.play('ui'); }, !ok, 20);
  // families
  FAMILIES.forEach((f, i) => { const known = cleared(f.at); opt(700 + (i % 2) * 275, 92 + Math.floor(i / 2) * 56, 265, 48, known ? f.name : '???', worldFam === i, () => { worldFam = i; Snd.play('ui'); }, !known, 16); });
  const f = FAMILIES[worldFam];
  panel(700, 216, 540, 474, cleared(f.at) ? f.col : '#3a3a4a');
  if (!cleared(f.at)) { text('You have not met them yet.', 730, 270, 22, '#667'); return; }
  ctx.imageSmoothingEnabled = false; const sp = Art.sprite(f.who, Math.floor(time * 1.5) % 2); ctx.drawImage(sp, 1090, 236, 120, 120);
  text(f.name, 730, 262, 28, f.col);
  text('GROUND', 730, 308, 14, '#80f0ff'); wrap(CHAPTER_INFO[f.ch].t, 330, 17).forEach((l, i) => text(l, 730, 332 + i * 22, 17, '#d8e4ff'));
  text('HOLDS', 730, 410, 14, '#80f0ff'); wrap(f.holds, 480, 18).forEach((l, i) => text(l, 730, 434 + i * 24, 18, '#d8e4ff'));
  text('WANTS', 730, 500, 14, '#80f0ff'); wrap(f.wants, 480, 18).forEach((l, i) => text(l, 730, 524 + i * 24, 18, '#d8e4ff'));
  text('TOWARD YOU', 730, 590, 14, '#ffd040'); wrap(famStanding(f), 480, 20).forEach((l, i) => text(l, 730, 616 + i * 26, 20, '#fff'));
}

// ---------- memories: replay the scenes you have seen ----------
let memCh = 1;
function drawMemories() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.88)'; ctx.fillRect(0, 70, W, H - 70); topBar('MEMORIES');
  const tabs = Object.keys(CHAPTERS).map(Number).concat([0]);
  tabs.forEach((c, i) => opt(40 + i * 172, 84, 164, 40, c ? 'CH ' + c : 'OTHER', memCh === c, () => { memCh = c; Snd.play('ui'); }, false, 19));
  text('Scenes you have seen. Watching them again changes nothing in your save.', 40, 160, 18, '#8890b0');
  const back = () => { scene = 'memories'; };
  const row = (y, title, ok, fn) => {
    panel(40, y, 1200, 46, ok ? '#80f0ff' : '#2a2c3a'); text(ok ? title : '???', 64, y + 31, 22, ok ? '#fff' : '#4a4e60');
    button(1020, y + 6, 190, 34, 'WATCH', fn, !ok, 18);
  };
  if (memCh === 0) {
    [['The Waking', 'intro'], ['Hollow Creek', 'prologue_end'], ['The Rain', 'end_rain'], ['The Departure', 'end_ascend'], ['The Epilogue', 'epilogue']].forEach((p, i) =>
      row(190 + i * 62, p[0], !!SAVE.seen[sceneKey(p[1])] && !!SCENES[p[1]], () => playScene(p[1], back, { replay: true })));
    return;
  }
  STAGES.filter(q => q.ch === memCh).forEach((st, i) => {
    const y = 190 + i * 56, pre = hasStageScene('pre', st) && SAVE.seen['pre' + st.id], post = hasStageScene('post', st) && SAVE.seen['post' + st.id];
    panel(40, y, 1200, 46, pre || post ? '#80f0ff' : '#2a2c3a'); text(pre || post ? st.name.toUpperCase() : '???', 64, y + 31, 22, pre || post ? '#fff' : '#4a4e60');
    button(780, y + 6, 200, 34, 'BEFORE', () => playStageScene('pre', st, back, { replay: true }), !pre, 18);
    button(1000, y + 6, 200, 34, 'AFTER', () => playStageScene('post', st, back, { replay: true }), !post, 18);
  });
}
