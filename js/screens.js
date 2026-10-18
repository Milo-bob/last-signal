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
  CODEX_CATS.forEach((c, i) => opt(40 + i * 200, 84, 190, 44, c, cxCat === i, () => { cxCat = i; cxSel = 0; Snd.play('ui'); }, false, 20));
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
