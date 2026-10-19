'use strict';
// ---------- canvas, ui helpers, battle HUD, input, main loop ----------
const W = 1280, H = 720;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const lo = document.createElement('canvas'); lo.width = VW * 2; lo.height = VH * 2;   // 2x pixel layer (logical coords stay 320x180; sprites are drawn at double detail)
const lx = lo.getContext('2d'); lx.scale(2, 2); lx.imageSmoothingEnabled = false;
const FONT = '"Pixelify Sans", "Courier New", monospace';
try { document.fonts.load('24px "Pixelify Sans"').then(() => wrapCache.clear()); } catch (e) {}   // line breaks measured with the fallback font are stale
let scene = 'title', prevScene = null, time = 0, mxF = 640, myF = 360, uiB = [], confirmBox = null, rotateOff = false;
let cardLines = null, cardNext = null, cardT = 0;
function post(o) { try { window.parent.postMessage(o, '*'); } catch (e) {} }

function resize() {
  const dpr = window.devicePixelRatio || 1, ww = window.innerWidth, wh = window.innerHeight;
  const rot = document.getElementById('rotate');   // narrow portrait screens: the 16:9 game would be tiny, ask to rotate (and pause a running fight)
  const portrait = !rotateOff && ww < 760 && wh > ww * 1.15;
  if (rot) rot.style.display = portrait ? 'flex' : 'none';
  if (portrait && scene === 'battle' && B) B.paused = true;
  const s = Math.min(ww / W, wh / H), cw = Math.floor(W * s), ch = Math.floor(H * s);
  cv.style.left = (ww - cw) / 2 + 'px'; cv.style.top = (wh - ch) / 2 + 'px';
  cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  cv.width = Math.floor(cw * dpr); cv.height = Math.floor(ch * dpr);
}
window.addEventListener('resize', resize); window.addEventListener('orientationchange', resize);
try { window.visualViewport.addEventListener('resize', resize); } catch (e) {}
resize();
function dismissRotate() { rotateOff = true; resize(); }

function text(s, x, y, size, color, align, shadow) {
  ctx.font = size + 'px ' + FONT; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  const o = Math.min(5, Math.max(2, Math.round(size / 10)));
  ctx.fillStyle = shadow || 'rgba(0,0,0,0.8)'; ctx.fillText(s, x + o, y + o);
  ctx.fillStyle = color || '#fff'; ctx.fillText(s, x, y);
}
const wrapCache = new Map();   // screens re-wrap the same texts every frame; measuring text is the expensive part
function wrap(s, maxW, size) {
  const key = size + '|' + maxW + '|' + s, hit = wrapCache.get(key); if (hit) return hit;
  ctx.font = size + 'px ' + FONT; const words = s.split(' '), lines = []; let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur);
  if (wrapCache.size > 800) wrapCache.clear();
  wrapCache.set(key, lines); return lines;
}
function panel(x, y, w, h, edge) {
  ctx.fillStyle = edge || '#80f0ff'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#0c0e1c'; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y, w, 4);
}
function button(x, y, w, h, label, fn, off, size, col, colHot) {
  const hot = !off && mxF >= x && mxF <= x + w && myF >= y && myF <= y + h;
  ctx.fillStyle = off ? '#14141c' : '#000'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = off ? '#2a2c3a' : hot ? colHot || '#a0f8ff' : col || '#40c8e0'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = off ? '#555a6a' : '#06101a';
  ctx.font = (size || 28) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + w / 2, y + h / 2 + 2);
  if (!off) uiB.push({ x, y, w, h, fn });
}
// Scrollable region for lists and texts that are taller than the screen. drawFn draws in content coordinates (as if nothing scrolled);
// buttons it registers move and clip with it. Wheel over the area or drag the bar (sx) to scroll.
const scrollOff = {}; let scrollAreas = {}, scrollDrag = null;
function scrollArea(key, x, y, w, h, contentH, sx, drawFn) {
  const max = Math.max(0, Math.round(contentH - h)), off = scrollOff[key] = Math.max(0, Math.min(max, scrollOff[key] || 0)), n0 = uiB.length, my = myF;
  scrollAreas[key] = { x, y, w, h, max, sx };
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(0, -off); myF = my + off;
  drawFn();
  myF = my; ctx.restore();
  for (let i = n0; i < uiB.length; i++) { const b = uiB[i]; b.y -= off; b.cy0 = y; b.cy1 = y + h; }
  if (max > 0) {
    const th = Math.max(36, h * h / contentH), ty = y + (h - th) * off / max;
    ctx.fillStyle = '#1a1c28'; ctx.fillRect(sx, y, 12, h); ctx.fillStyle = scrollDrag && scrollDrag.key === key ? '#ffd040' : '#80f0ff'; ctx.fillRect(sx + 1, ty, 10, th);
  }
}
function scrollBy(key, d) { const a = scrollAreas[key]; if (a) scrollOff[key] = Math.max(0, Math.min(a.max, (scrollOff[key] || 0) + d)); }
function scrollAt(px, py, bar) {
  for (const k in scrollAreas) {
    const a = scrollAreas[k]; if (a.max <= 0) continue;
    if (bar ? (px >= a.sx - 8 && px <= a.sx + 20 && py >= a.y && py <= a.y + a.h) : (px >= a.x && px <= a.x + a.w + 24 && py >= a.y && py <= a.y + a.h)) return k;
  }
  return null;
}
function scrollDragTo(py) {
  const a = scrollAreas[scrollDrag.key]; if (!a) return;
  const th = Math.max(36, a.h * a.h / (a.h + a.max)), span = a.h - th;
  scrollOff[scrollDrag.key] = Math.max(0, Math.min(a.max, Math.round((py - a.y - scrollDrag.grab) / span * a.max)));
}
// modal question; while it is open only its two buttons react
function askConfirm(title, lines, yes, fn, danger) { confirmBox = { title, lines, yes, fn, danger: !!danger }; }
function drawConfirm() {
  const c = confirmBox; uiB.length = 0;
  ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, W, H);
  panel(290, 170, 700, 380, c.danger ? '#e04040' : '#80f0ff');
  text(c.title, 640, 240, 38, '#fff', 'center');
  let y = 292; c.lines.forEach(l => wrap(l, 620, 21).forEach(t => { text(t, 640, y, 21, '#d8e4ff', 'center'); y += 29; }));
  button(330, 450, 290, 60, 'CANCEL', () => { confirmBox = null; Snd.play('ui'); }, false, 26);
  button(660, 450, 290, 60, c.yes, () => { const f = c.fn; confirmBox = null; f(); }, false, 24, c.danger ? '#e06060' : null, c.danger ? '#ffa0a0' : null);
}
function blit() { ctx.imageSmoothingEnabled = false; ctx.drawImage(lo, 0, 0, W, H); }

// ---------- story cards ----------
const CARD_CPS = 60;
let cardWrap = [];
function showCard(lines, next) {
  cardLines = resolveLines(lines); cardWrap = cardLines.map(l => wrap(l.t, 1000, 30)); cardNext = next; cardT = 0; scene = 'card';
}
function showCards(list, next) { if (!list.length) { if (next) next(); return; } showCard(list[0], () => showCards(list.slice(1), next)); }
function cardTotal() { return cardWrap.reduce((a, w) => a + w.reduce((b, s) => b + s.length + 1, 0) + 5, 0); }
function drawCard() {
  ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, W, H);
  const total = cardWrap.reduce((a, w) => a + w.length * 38 + 16, 0);
  let chars = Math.floor(cardT * CARD_CPS), y = Math.max(80, Math.round((H - 90 - total) / 2) + 38);
  cardLines.forEach((l, i) => {
    cardWrap[i].forEach(s => {
      ctx.font = '30px ' + FONT; const fw = ctx.measureText(s).width;
      text(s.slice(0, Math.max(0, chars)), W / 2 - fw / 2, y, 30, l.c, 'left'); chars -= s.length + 1; y += 38;
    });
    chars -= 5; y += 16;
  });
  if (cardT * CARD_CPS > cardTotal() && Math.floor(time * 3) % 2) text('TAP TO CONTINUE', W / 2, H - 60, 22, '#80f0ff', 'center');
}
function advanceCard() { if (cardT * CARD_CPS < cardTotal()) { cardT = 1e4; return; } const n = cardNext; cardLines = null; if (n) n(); }

// ---------- battle HUD ----------
function pauseBattle(on) { if (B.state === 'win' || B.state === 'lose') return; B.paused = on; }   // the result screen has its own buttons
function drawBattleHud() {
  ctx.fillStyle = 'rgba(8,10,24,0.8)'; ctx.fillRect(0, 0, W, 60);
  text(B.stage.name.toUpperCase(), 24, 40, 28, '#fff');
  if (!B.prol) text('WAVE ' + Math.max(1, B.wave + 1) + (B.goal.t === 'hold' ? '' : '/' + B.stage.waves.length) + '    ENEMIES ' + (B.enemies.length + B.spawnQ.length), 520, 40, 22, '#80f0ff');
  const gl = B.goal;
  if (gl.t === 'time' || gl.t === 'hold') { const left = Math.max(0, Math.ceil(gl.sec - B.pt)); text((gl.t === 'time' ? 'TIME ' : 'HOLD ') + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2), 820, 40, 26, gl.t === 'time' && left <= 15 ? '#ff6060' : '#ffd040'); }
  if (!B.prol) text('GOAL: ' + goalShort(gl), 24, 88, 18, '#ffb060');
  if (B.bonus) { const bf = bonusFailed(B.bonus), bm = bonusMet(B.bonus); text('BONUS: ' + bonusText(B.bonus) + (bf ? '  (failed)' : bm && B.bonus.t !== 'nodown' && B.bonus.t !== 'noult' ? '  (done)' : ''), 24, 112, 15, bf ? '#e06060' : bm && B.bonus.t !== 'nodown' && B.bonus.t !== 'noult' ? '#8aff9a' : '#c8d8f8'); }
  if (B.prop) { text(B.prop.name, 24, 140, 15, '#40d0ff'); bar(24, 148, 200, 10, B.prop.hp / B.prop.maxhp, '#40d0ff', '#1a2a3a'); }
  if (!B.prol) button(1070, 8, 70, 44, 'x' + B.speed, () => { B.speed = B.speed === 1 ? 2 : 1; Snd.play('ui'); }, false, 24);
  button(1160, 8, 70, 44, 'II', () => pauseBattle(true), false, 24);
  const boss = B.enemies.find(e => e.def.boss);
  if (boss) { bar(380, 76, 520, 18, boss.hp / boss.maxhp, '#c030c0', '#2a1a2a'); text(boss.def.name, 640, 72, 18, '#fff', 'center'); }
  const mk = B.enemies.find(e => e.mark);
  if (mk) { bar(380, 76, 520, 14, mk.hp / mk.maxhp, '#e03030', '#2a1a1a'); text('TARGET: ' + B.goal.name, 640, 72, 18, '#fff', 'center'); }
  if (B.chain >= 3) text('CHAIN x' + B.chain, 640, 130, 30, '#ffd040', 'center', '#7a2a00');
  const pro = B.prol, robots = B.hunters.filter(q => !q.isHero);
  B.hunters.forEach((h, i) => {   // four cards: three robots (ULT) and the hero (SLAM). In the prologue they appear as the robots join
    const hero = !!h.isHero, x = 16 + (hero ? 3 : robots.indexOf(h)) * 312, y = H - 108, w = 300, alive = h.alive;
    const k = hero ? 1 - h.slamCd / h.slamMax : h.charge / 100, ready = alive && (hero ? h.slamCd <= 0 : h.charge >= 100), ab = !pro || (hero ? pro.u.slam : pro.u.ult);
    const pulse = pro && pro.pulseCard === h && !B.selUsed && Math.floor(time * 3) % 2;
    ctx.fillStyle = pulse ? '#ffffff' : i === B.sel ? '#ffd040' : alive ? h.def.col : '#444'; ctx.fillRect(x - 4, y - 4, w + 8, 100);
    ctx.fillStyle = '#0c0e1c'; ctx.fillRect(x, y, w, 92);
    if (hero) { const hs = Art.hero(SAVE.hero, alive ? Math.floor(time * 2) % 2 : 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(hs, 0, 1, 24, 16, x + 7, y + 12, 66, 44); }
    else faceSprite(h.def.spr, x + 40, y + 8, 2, alive ? Math.floor(time * 2) % 2 : 0);
    text(hero ? heroName().toUpperCase() : h.def.name, x + 78, y + 28, 17, alive ? '#fff' : '#777');
    text(h.def.role, x + 208, y + 28, 11, alive ? h.def.col : '#555', 'right');
    bar(x + 78, y + 40, 130, 12, h.hp / h.maxhp, h.hp / h.maxhp < 0.3 ? '#e04040' : '#40d060', '#2a1a1a');
    if (ab) bar(x + 78, y + 66, 130, 8, k, ready ? '#ffd040' : '#c070ff', '#2a2a3a');
    // one status line: why the robot is out, what protects it, or how far its ultimate is
    const nm = hero ? 'SLAM' : 'ULT';
    const stTxt = !alive ? (hero ? 'DOWN ' + Math.ceil(h.down) + 's' : 'OFFLINE') : h.shield > 0 ? 'SHIELD ' + Math.ceil(h.shield) + 's' : ready ? nm + ' READY' : hero ? 'SLAM ' + Math.ceil(h.slamCd) + 's' : 'ULT ' + Math.floor(h.charge) + '%';
    if (ab) text(stTxt, x + 78, y + 88, 12, !alive ? '#e04040' : h.shield > 0 ? '#8ab0e0' : ready ? '#ffd040' : '#9a8ab8');
    if (alive) text(Math.ceil(h.hp) + '/' + Math.round(h.maxhp), x + 208, y + 88, 12, '#c8d8f8', 'right');
    if (!ab) { uiB.push({ x, y, w: 216, h: 92, fn: () => { if (h.alive) { B.sel = i; B.selUsed = true; Snd.play('ui'); tutEvent('sel'); } } }); return; }
    ctx.fillStyle = ready ? (Math.floor(time * 6) % 2 ? '#ffd040' : '#fff') : '#2a2c3a'; ctx.fillRect(x + 220, y + 12, 70, 68);
    if (!ready && alive) { const kk = clamp(k, 0, 1); ctx.fillStyle = 'rgba(192,112,255,0.45)'; ctx.fillRect(x + 220, y + 12 + Math.round(68 * (1 - kk)), 70, Math.round(68 * kk)); }   // fills up like a tank
    ctx.fillStyle = ready ? '#1a1000' : '#8a90a8'; ctx.font = (hero ? 18 : 22) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nm, x + 255, y + 40);
    ctx.font = '11px ' + FONT; ctx.fillText(hero ? 'SHOCKWAVE' : h.def.ult, x + 255, y + 64); ctx.fillText('[' + (i + 1) + ']', x + 255, y + 21);
    uiB.push({ x: x + 220, y: y + 12, w: 70, h: 68, fn: () => hero ? heroSlam() : tryUlt(h) });
    uiB.push({ x, y, w: 216, h: 92, fn: () => { if (h.alive) { B.sel = i; B.selUsed = true; Snd.play('ui'); tutEvent('sel'); } } });
  });
  if (pro) proHud();
  drawTip();   // under the floating combat texts, so results stay readable
  B.ft.forEach(f => text(f.s, f.x * 4, f.y * 4, f.big ? 28 : 20, f.c, 'center'));
  if (B.banner.t > 0) text(B.banner.s, W / 2, 200, 56, '#ffd040', 'center', '#7a2a00');
  if (B.state === 'intro') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 230, W, 270);
    text(B.stage.name.toUpperCase(), W / 2, 290, 60, '#fff', 'center'); text('CHAPTER ' + B.stage.ch + '  -  ' + CHAPTERS[B.stage.ch], W / 2, 326, 24, '#80f0ff', 'center');
    let iy = 362; text('GOAL: ' + goalText(B.goal), W / 2, iy, 24, '#ffb060', 'center'); iy += 28;
    if (B.bonus) { text('BONUS: ' + bonusText(B.bonus) + ' (+' + bonusOnyx(B.stage) + ' ONYX' + (SAVE.bonus && SAVE.bonus[B.stage.id] ? ', already earned' : '') + ')', W / 2, iy, 18, '#c8d8f8', 'center'); iy += 24; }
    stageTraits(B.stage).forEach(k => { text(TRAITS[k].name + ': ' + TRAITS[k].desc, W / 2, iy, 16, '#80c8ff', 'center'); iy += 20; });
    if (B.echo) wrap(heroText(B.echo.line), 1000, 16).forEach(l => { text(l, W / 2, iy, 16, '#ffd040', 'center'); iy += 20; });
  }
  if (B.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H); text('PAUSED', W / 2, 260, 80, '#ffd040', 'center');
    button(W / 2 - 170, 320, 340, 66, 'RESUME', () => { B.paused = false; }, false, 32);
    button(W / 2 - 170, 404, 340, 66, 'HOW TO PLAY', () => openHelp(), false, 28);
    if (B.prol) button(W / 2 - 170, 488, 340, 66, 'SKIP PROLOGUE', () => askConfirm('SKIP THE PROLOGUE?', ['You will miss how the robots join you.', 'You can play it again from the hub (PROLOGUE).'], 'SKIP', skipPrologue), false, 26);
    else button(W / 2 - 170, 488, 340, 66, 'QUIT STAGE', () => { B = null; scene = 'hub'; }, false, 30);
  }
}

// ---------- frame ----------
function frame() {
  ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.imageSmoothingEnabled = false; uiB = []; scrollAreas = {};
  if (scene !== prevScene) { if (scene === 'hub') hubLine = null; prevScene = scene; }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (scene === 'title') drawTitle();
  else if (scene === 'card') drawCard();
  else if (scene === 'cut') drawCut();
  else if (scene === 'world') drawWorld();
  else if (scene === 'memories') drawMemories();
  else if (scene === 'hub') drawHub();
  else if (scene === 'story') drawStory();
  else if (scene === 'squad') drawSquad();
  else if (scene === 'prep') drawPrep();
  else if (scene === 'supply') drawSupply();
  else if (scene === 'missions') drawMissions();
  else if (scene === 'hero') drawHero();
  else if (scene === 'codex') drawCodex();
  else if (scene === 'choice') drawChoice();
  else if (scene === 'help') drawHelp();
  else if (scene === 'data') drawData();
  else if (scene === 'battle' && B) {
    lx.save(); if (B.shake > 0.5 && !B.paused) lx.translate(Math.round(rnd(-B.shake, B.shake) / 2), Math.round(rnd(-B.shake, B.shake) / 2));
    drawBattleWorld(lx); lx.restore(); blit();
    drawBattleHud();
    if ((B.state === 'win' || B.state === 'lose') && B.result) { if (B.resT > 1.4) drawResult(); else text(B.state === 'win' ? 'CLEAR!' : 'DEFEAT', W / 2, 300, 90, B.state === 'win' ? '#ffd040' : '#ff5050', 'center'); }
  }
  if (confirmBox) drawConfirm();
  if (toast.t > 0) { panel(W / 2 - 295, 90, 590, 50, '#ffd040'); let tz = 20; ctx.font = tz + 'px ' + FONT; while (tz > 12 && ctx.measureText(toast.s).width > 560) ctx.font = (--tz) + 'px ' + FONT; text(toast.s, W / 2, 124, tz, '#fff', 'center'); }
}

// ---------- input ----------
function toXY(e) { const r = cv.getBoundingClientRect(); mxF = (e.clientX - r.left) / r.width * W; myF = (e.clientY - r.top) / r.height * H; }
// Mouse: the button under the pointer. Touch: fingers are imprecise, so on small screens a tap near a small button still counts
// (each button is treated as at least 44 CSS pixels wide and high); the closest one wins.
function hitButton(touch) {
  const vis = b => b.cy0 === undefined || (myF >= b.cy0 && myF <= b.cy1);   // buttons inside a scroll area only react where they are visible
  for (let i = uiB.length - 1; i >= 0; i--) { const b = uiB[i]; if (vis(b) && mxF >= b.x && mxF <= b.x + b.w && myF >= b.y && myF <= b.y + b.h) return b; }
  if (!touch) return null;
  const minSz = 44 * W / cv.clientWidth; let best = null, bd = 1e9;
  uiB.forEach(b => {
    if (!vis(b)) return;
    const px = Math.max(0, (minSz - b.w) / 2), py = Math.max(0, (minSz - b.h) / 2);
    if (mxF >= b.x - px && mxF <= b.x + b.w + px && myF >= b.y - py && myF <= b.y + b.h + py) { const d = Math.hypot(mxF - b.x - b.w / 2, myF - b.y - b.h / 2); if (d < bd) { bd = d; best = b; } }
  });
  return best;
}
cv.addEventListener('pointerdown', e => {
  toXY(e); Snd.init(); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
  if (scene === 'card' && !confirmBox) { advanceCard(); return; }
  if (scene === 'cut' && !confirmBox) { const cb = hitButton(e.pointerType !== 'mouse'); if (cb) cb.fn(); else cutAdvance(); return; }
  if (!confirmBox) { const sk = scrollAt(mxF, myF, true); if (sk) { const a = scrollAreas[sk], th = Math.max(36, a.h * a.h / (a.h + a.max)), ty = a.y + (a.h - th) * (scrollOff[sk] || 0) / a.max; scrollDrag = { key: sk, grab: myF >= ty && myF <= ty + th ? myF - ty : th / 2 }; scrollDragTo(myF); return; } }
  const b = hitButton(e.pointerType !== 'mouse');
  if (b) { b.fn(); return; }
  if (confirmBox) return;
  if (scene === 'battle' && B && myF > 60 && myF < H - 112) battlePointer('down', mxF / 4, myF / 4);
});
cv.addEventListener('wheel', e => { toXY(e); const k = scrollAt(mxF, myF, false); if (k && !confirmBox) { e.preventDefault(); scrollBy(k, Math.sign(e.deltaY) * 60); } }, { passive: false });
cv.addEventListener('pointermove', e => { toXY(e); if (scrollDrag) { scrollDragTo(myF); return; } if (scene === 'battle' && B && !confirmBox) battlePointer('move', mxF / 4, myF / 4); });
function pointerEnd(e) {
  if (scrollDrag) { scrollDrag = null; return; }
  if (scene === 'battle' && B) battlePointer('up');
  if (e && e.pointerType !== 'mouse') { mxF = -100; myF = -100; }   // no finger on screen, so nothing stays highlighted
}
window.addEventListener('pointerup', pointerEnd);
window.addEventListener('pointercancel', pointerEnd);
cv.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('visibilitychange', () => { last = performance.now(); if (document.hidden && scene === 'battle' && B && B.state === 'play') B.paused = true; });
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); Snd.init();
  if (scene === 'hero' && heroTyping && !confirmBox) {
    e.preventDefault();
    if (k === 'enter' || k === 'escape') { heroTyping = false; if (SAVE.heroDone) saveGame(); }
    else if (k === 'backspace') SAVE.hero.name = SAVE.hero.name.slice(0, -1);
    else if (e.key.length === 1 && /[A-Za-z0-9 \-]/.test(e.key) && SAVE.hero.name.length < 12) SAVE.hero.name += e.key;
    return;
  }
  if (k === 'backspace') {
    e.preventDefault(); if (confirmBox) { confirmBox = null; return; }
    if (scene === 'cut') { if (SC && !SC.ending) askConfirm('SKIP THIS SCENE?', ['The story goes on. Choices take their first option.', 'You can watch it again later under MEMORIES.'], 'SKIP', skipScene); return; }
    if (scene === 'battle' && B) { pauseBattle(true); return; }
    if (scene === 'help') { scene = helpReturn; return; }
    if (scene === 'data') { scene = dataReturn; return; }
    if (scene === 'hub') { saveGame(); scene = 'title'; }
    else if (scene === 'hero') { if (SAVE.heroDone) { saveGame(); scene = 'hub'; } }
    else if (scene !== 'title' && scene !== 'card' && scene !== 'choice') scene = 'hub';
    return;
  }
  if (k === 'm') { Snd.toggle(); toastMsg(Snd.muted ? 'Sound off' : 'Sound on'); return; }
  if (confirmBox) return;
  if (scene === 'card' && (k === 'enter' || k === ' ')) { e.preventDefault(); advanceCard(); return; }
  if (scene === 'cut') { if (k === 'enter' || k === ' ') { e.preventDefault(); if (!(SC && SC.choice)) cutAdvance(); } else cutKey(k); return; }
  if (scene === 'battle' && B) {
    if (k === 'p') { pauseBattle(!B.paused); return; }
    if (k === 'f') { B.speed = B.speed === 1 ? 2 : 1; return; }
    if (k >= '1' && k <= '3') { const h = B.hunters.filter(q => !q.isHero)[k - 1]; if (h) tryUlt(h); }
    if (k === '4') heroSlam();
  }
});

// ---------- main loop ----------
// Time is measured in seconds. A frame is capped at 0.1 s (after a tab switch or a long stall the game just continues), and a frame
// longer than 1/30 s is simulated in equal steps of at most 1/30 s, so a slow frame rate does not change how fights play out.
let last = performance.now();
const STEP = 1 / 30, MAX_FRAME = 0.1;
function loop(t) {
  const raw = clamp((t - last) / 1000, 0, MAX_FRAME); last = t;
  time += raw; toast.t -= raw; if (scene === 'card') cardT += raw;
  if (scene === 'cut') { try { updateCut(raw); } catch (err) { console.error(err); } }
  try {
    if (scene === 'battle') { const n = Math.max(1, Math.ceil(raw / STEP - 0.05)); for (let i = 0; i < n; i++) updateBattle(raw / n); }
    frame();
  } catch (err) { console.error(err); }
  requestAnimationFrame(loop);
}
post({ type: 'ready' });
requestAnimationFrame(loop);
