'use strict';
// ---------- canvas, ui helpers, battle HUD, input, main loop ----------
const W = 1280, H = 720;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const lo = document.createElement('canvas'); lo.width = VW * 2; lo.height = VH * 2;   // 2x pixel layer (logical coords stay 320x180; sprites are drawn at double detail)
const lx = lo.getContext('2d'); lx.scale(2, 2); lx.imageSmoothingEnabled = false;
const FONT = '"Pixelify Sans", "Courier New", monospace';
try { document.fonts.load('24px "Pixelify Sans"'); } catch (e) {}
let scene = 'title', time = 0, mxF = 640, myF = 360, uiB = [];
let cardLines = null, cardNext = null, cardT = 0;
function post(o) { try { window.parent.postMessage(o, '*'); } catch (e) {} }

function resize() {
  const dpr = window.devicePixelRatio || 1, ww = window.innerWidth, wh = window.innerHeight;
  const s = Math.min(ww / W, wh / H), cw = Math.floor(W * s), ch = Math.floor(H * s);
  cv.style.left = (ww - cw) / 2 + 'px'; cv.style.top = (wh - ch) / 2 + 'px';
  cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  cv.width = Math.floor(cw * dpr); cv.height = Math.floor(ch * dpr);
}
window.addEventListener('resize', resize); resize();

function text(s, x, y, size, color, align, shadow) {
  ctx.font = size + 'px ' + FONT; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  const o = Math.min(5, Math.max(2, Math.round(size / 10)));
  ctx.fillStyle = shadow || 'rgba(0,0,0,0.8)'; ctx.fillText(s, x + o, y + o);
  ctx.fillStyle = color || '#fff'; ctx.fillText(s, x, y);
}
function wrap(s, maxW, size) {
  ctx.font = size + 'px ' + FONT; const words = s.split(' '), lines = []; let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur); return lines;
}
function panel(x, y, w, h, edge) {
  ctx.fillStyle = edge || '#80f0ff'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#0c0e1c'; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y, w, 4);
}
function button(x, y, w, h, label, fn, off, size) {
  const hot = !off && mxF >= x && mxF <= x + w && myF >= y && myF <= y + h;
  ctx.fillStyle = off ? '#14141c' : '#000'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = off ? '#2a2c3a' : hot ? '#a0f8ff' : '#40c8e0'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = off ? '#555a6a' : '#06101a';
  ctx.font = (size || 28) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + w / 2, y + h / 2 + 2);
  if (!off) uiB.push({ x, y, w, h, fn });
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
function drawBattleHud() {
  ctx.fillStyle = 'rgba(8,10,24,0.8)'; ctx.fillRect(0, 0, W, 60);
  text(B.stage.name.toUpperCase(), 24, 40, 28, '#fff');
  text('WAVE ' + Math.max(1, B.wave + 1) + '/' + B.stage.waves.length + '    ENEMIES ' + (B.enemies.length + B.spawnQ.length), 520, 40, 22, '#80f0ff');
  button(1070, 8, 70, 44, 'x' + B.speed, () => { B.speed = B.speed === 1 ? 2 : 1; Snd.play('ui'); }, false, 24);
  button(1160, 8, 70, 44, 'II', () => { B.paused = true; }, false, 24);
  const boss = B.enemies.find(e => e.def.boss);
  if (boss) { bar(380, 76, 520, 18, boss.hp / boss.maxhp, '#c030c0', '#2a1a2a'); text(boss.def.name, 640, 72, 18, '#fff', 'center'); }
  B.hunters.forEach((h, i) => {
    const x = 30 + i * 410, y = H - 108, w = 390, ready = h.charge >= 100 && h.alive;
    ctx.fillStyle = i === B.sel ? '#ffd040' : h.alive ? h.def.col : '#444'; ctx.fillRect(x - 4, y - 4, w + 8, 100);
    ctx.fillStyle = '#0c0e1c'; ctx.fillRect(x, y, w, 92);
    faceSprite(h.def.spr, x + 46, y + 8, 2, h.alive ? Math.floor(time * 2) % 2 : 0);
    text(h.def.name, x + 92, y + 28, 20, h.alive ? '#fff' : '#777');
    bar(x + 92, y + 40, 170, 12, h.hp / h.maxhp, h.hp / h.maxhp < 0.3 ? '#e04040' : '#40d060', '#2a1a1a');
    bar(x + 92, y + 66, 170, 8, h.charge / 100, ready ? '#ffd040' : '#c070ff', '#2a2a3a');
    ctx.fillStyle = ready ? (Math.floor(time * 6) % 2 ? '#ffd040' : '#fff') : '#2a2c3a'; ctx.fillRect(x + 280, y + 12, 96, 68);
    ctx.fillStyle = ready ? '#1a1000' : '#555a6a'; ctx.font = '22px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ULT', x + 328, y + 36);
    ctx.font = '12px ' + FONT; ctx.fillText(h.def.ult, x + 328, y + 62);
    uiB.push({ x: x + 280, y: y + 12, w: 96, h: 68, fn: () => { if (ready) castUlt(h); } });
    uiB.push({ x, y, w: 270, h: 92, fn: () => { if (h.alive) { B.sel = i; Snd.play('ui'); } } });
  });
  B.ft.forEach(f => text(f.s, f.x * 4, f.y * 4, f.big ? 28 : 20, f.c, 'center'));
  if (B.banner.t > 0) text(B.banner.s, W / 2, 200, 56, '#ffd040', 'center', '#7a2a00');
  if (B.state === 'intro') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 230, W, 200);
    text(B.stage.name.toUpperCase(), W / 2, 310, 60, '#fff', 'center'); text('CHAPTER ' + B.stage.ch + '  -  ' + CHAPTERS[B.stage.ch], W / 2, 350, 24, '#80f0ff', 'center');
    if (B.idx === 0) { text('TAP A ROBOT, THEN TAP THE GROUND TO MOVE IT. TAP AN ENEMY TO FOCUS IT.', W / 2, 394, 18, '#ffd040', 'center'); }
  }
  if (B.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H); text('PAUSED', W / 2, 260, 80, '#ffd040', 'center');
    button(W / 2 - 170, 320, 340, 66, 'RESUME', () => { B.paused = false; }, false, 32);
    button(W / 2 - 170, 410, 340, 66, 'QUIT STAGE', () => { B = null; scene = 'hub'; }, false, 30);
  }
}

// ---------- frame ----------
function frame() {
  ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.imageSmoothingEnabled = false; uiB = [];
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (scene === 'title') drawTitle();
  else if (scene === 'card') drawCard();
  else if (scene === 'hub') drawHub();
  else if (scene === 'story') drawStory();
  else if (scene === 'squad') drawSquad();
  else if (scene === 'prep') drawPrep();
  else if (scene === 'supply') drawSupply();
  else if (scene === 'missions') drawMissions();
  else if (scene === 'hero') drawHero();
  else if (scene === 'codex') drawCodex();
  else if (scene === 'choice') drawChoice();
  else if (scene === 'battle' && B) {
    lx.save(); if (B.shake > 0.5) lx.translate(Math.round(rnd(-B.shake, B.shake) / 2), Math.round(rnd(-B.shake, B.shake) / 2));
    drawBattleWorld(lx); lx.restore(); blit();
    drawBattleHud();
    if ((B.state === 'win' || B.state === 'lose') && B.result) { B.resT = (B.resT || 0) + 0.016; if (B.resT > 1.4) drawResult(); else text(B.state === 'win' ? 'CLEAR!' : 'DEFEAT', W / 2, 300, 90, B.state === 'win' ? '#ffd040' : '#ff5050', 'center'); }
  }
  if (toast.t > 0) { panel(W / 2 - 340, 90, 680, 50, '#ffd040'); text(toast.s, W / 2, 124, 22, '#fff', 'center'); }
}

// ---------- input ----------
function toXY(e) { const r = cv.getBoundingClientRect(); mxF = (e.clientX - r.left) / r.width * W; myF = (e.clientY - r.top) / r.height * H; }
cv.addEventListener('pointerdown', e => {
  toXY(e); Snd.init(); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
  if (scene === 'card') { advanceCard(); return; }
  for (let i = uiB.length - 1; i >= 0; i--) { const b = uiB[i]; if (mxF >= b.x && mxF <= b.x + b.w && myF >= b.y && myF <= b.y + b.h) { b.fn(); return; } }
  if (scene === 'battle' && B && myF > 60 && myF < H - 112) battlePointer('down', mxF / 4, myF / 4);
});
cv.addEventListener('pointermove', e => { toXY(e); if (scene === 'battle' && B) battlePointer('move', mxF / 4, myF / 4); });
window.addEventListener('pointerup', () => { if (scene === 'battle' && B) battlePointer('up'); });
cv.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); Snd.init();
  if (scene === 'hero' && heroTyping) {
    e.preventDefault();
    if (k === 'enter' || k === 'escape') heroTyping = false;
    else if (k === 'backspace') SAVE.hero.name = SAVE.hero.name.slice(0, -1);
    else if (e.key.length === 1 && /[A-Za-z0-9 \-]/.test(e.key) && SAVE.hero.name.length < 12) SAVE.hero.name += e.key;
    return;
  }
  if (k === 'backspace') {
    e.preventDefault(); if (scene === 'battle' && B) { B.paused = true; return; }
    if (scene === 'hub') { saveGame(); scene = 'title'; }
    else if (scene === 'hero') { if (SAVE.heroDone) { saveGame(); scene = 'hub'; } }
    else if (scene !== 'title' && scene !== 'card' && scene !== 'choice') scene = 'hub';
    return;
  }
  if (k === 'm') { Snd.toggle(); toastMsg(Snd.muted ? 'Sound off' : 'Sound on'); return; }
  if (scene === 'card' && (k === 'enter' || k === ' ')) { e.preventDefault(); advanceCard(); return; }
  if (scene === 'battle' && B) {
    if (k === 'p') { B.paused = !B.paused; return; }
    if (k === 'f') { B.speed = B.speed === 1 ? 2 : 1; return; }
    if (k >= '1' && k <= '3') { const h = B.hunters[k - 1]; if (h) castUlt(h); }
  }
});
let last = performance.now();
function loop(t) {
  const dt = clamp((t - last) / 1000, 0, 0.033); last = t; time += dt; toast.t -= dt; if (scene === 'card') cardT += dt;
  try { if (scene === 'battle') updateBattle(dt); frame(); } catch (err) { console.error(err); }
  requestAnimationFrame(loop);
}
post({ type: 'ready' });
requestAnimationFrame(loop);
