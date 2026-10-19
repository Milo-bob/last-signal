'use strict';
// ---------- prologue: the first level ----------
// The hero walks to the camp at Hollow Creek (three screens, one enemy each), finds the first robots there and defends the camp.
// Nothing is explained in a menu. Every mechanic is introduced by the situation: moving (a lit way and, after a while, footprints),
// auto-attack and the combo (the first fight), wind-ups (the Breaker), recruiting (dormant robots), selecting (a card that flashes once),
// red warning areas (the worm), focusing (a ring on a far enemy that nobody shoots), ultimates (the cores are charged) and SLAM
// (it appears when the hero is surrounded). The script lives here; the fighting is the normal battle engine (B, with B.prol set).

const PRO_STAGE = { id: 'prologue', ch: 1, idx: 0, name: 'The Road to Hollow Creek', waves: [], gold: 0, onyx: 0 };
const PRO_SIGNS = ['HOLLOW CREEK  3 MI', 'HOLLOW CREEK  2 MI', 'HOLLOW CREEK  1 MI'];
const PRO_CAMP = [   // dormant robots: where they stand and what they say when they wake up
  { id: 'bulwark', x: 236, y: 118, say: 'The north gate held for nine years. I can hold this ditch for one more night.' },
  { id: 'sight', x: 190, y: 72, say: 'Up. Slowly. The blue coats are not done.' },
  { id: 'mender', x: 138, y: 142, say: 'Fresh bolts, a clean signal. Hold still, I will see what is left of you.' }
];

const PRO_ENTRY = { name: 'The Road to Hollow Creek', ch: 1, brief: 'Walk to the old camp at Hollow Creek. Something is out on the road. At the camp, someone is still waiting.' };
function needsPrologue() { return !!SAVE && !SAVE.seen.prologue && progressIdx() === 0; }

function startPrologue(replay) {
  const hero = heroUnit(); hero.x = 24; hero.y = 112;
  makeBattle(PRO_STAGE, 0, { goal: { t: 'clear' }, echo: null }, [hero]);
  B.state = 'play'; B.introT = 0;
  B.prol = { seg: 0, phase: 'road', t: 0, u: { ult: false, slam: false }, spawned: {}, exitOpen: false, say: null, sayQ: [], fade: -1, swapped: false, idle: 0, foot: false, movedOnce: false,
    replay: !!replay, dorm: PRO_CAMP.map(d => ({ id: d.id, x: d.x, y: d.y, say: d.say, def: HUNTER_BY[d.id], woke: false })), n: 0, waves: 0, waveT: 0, waveAge: 0, endT: 0,
    pulseCard: null, obj: 'Get to the camp at Hollow Creek', shown: {}, surround: 0 };
  proSay(hero, null, 'Hollow Creek is a day north. If anyone got out of the fire, they went there.');
}
function proHero() { return B.hunters.find(h => h.isHero); }

// ---------- speech: short lines over the speaker, one at a time ----------
function proSay(u, name, text, col) {
  const P = B.prol; P.sayQ.push({ u, name: name || heroName(), text, col: col || '#ffffff', t: 0, dur: Math.max(2.8, text.length * 0.06) });
  if (P.sayQ.length > 4) P.sayQ.shift();
}
function proSayTick(dt0) {
  const P = B.prol;
  if (P.say) { P.say.t += dt0; if (P.say.t >= P.say.dur) P.say = null; }
  if (!P.say && P.sayQ.length) P.say = P.sayQ.shift();
}

// ---------- script ----------
function proEnterSeg(n) {
  const P = B.prol, hero = proHero();
  P.seg = n; hero.x = AX0 + 4; hero.order = null; hero.focus = null; hero.moving = false; P.idle = 0;
  B.enemies = []; B.proj = []; B.tele = []; B.fx = []; B.later = [];
  if (n === 1) lat(1, () => { spawnEnemy('gunner', 262, 104); P.spawned[1] = 1; proSay(hero, null, 'A blue coat. He shoots from a distance.'); });
  if (n === 2) lat(1, () => { const e = spawnEnemy('brute', 250, 112); e.hp = e.maxhp = 170; e.atk = 13; P.spawned[2] = 1; proSay(hero, null, 'A Breaker. Big and slow.'); });
  if (n === 3) { P.phase = 'camp'; P.obj = 'Look around the camp'; proSay(hero, null, 'Hollow Creek. Someone kept the fire going.'); }
}
function proRecruit(d) {
  const P = B.prol, u = makeUnit(d.id, 0, { echo: null }), cur = B.hunters[B.sel];
  d.woke = true; u.x = d.x; u.y = d.y; u.cd = 1; u.charge = 0;
  B.hunters.splice(B.hunters.length - 1, 0, u); B.sel = B.hunters.indexOf(cur);   // the hero stays last, so the cards keep their places
  P.n++; if (P.n === 1) P.pulseCard = u;
  bfx('ring', d.x, d.y, { col: '#80f0ff', r: 24, life: 0.5 }); bfx('ring', d.x, d.y, { col: '#ffffff', r: 12, life: 0.35 }); Snd.play('level'); B.shake = Math.max(B.shake, 3);
  proSay(u, d.def.name, d.say, d.def.col);
  P.obj = P.n < 3 ? 'Find the others' : 'Hold the camp';
}
function proSpawn(type, n, gap, y0) { for (let i = 0; i < n; i++) lat(i * gap, () => spawnEnemy(type, 328, y0 != null ? y0 : rnd(AY0 + 10, AY1 - 10))); }
function proWave(k) {   // an ambush after each robot that joins
  const P = B.prol; P.waveAge = 0; P.obj = 'Defend the camp';
  B.banner = { s: 'AMBUSH!', t: 1.4 }; Snd.play('roar');
  if (k === 0) proSpawn('raider', 2, 0.9);
  else if (k === 1) { lat(0.2, () => { const w = spawnEnemy('worm', rnd(150, 230), 110); }); proSpawn('gunner', 1, 0, 100); }
  else {
    P.u.ult = true; B.hunters.forEach(h => { if (!h.isHero) { h.charge = 100; } });
    proSpawn('raider', 3, 0.8); lat(1.4, () => spawnEnemy('gunner', 328, 90));
  }
}
function proFinish() {
  const P = B.prol; if (P.ended) return; P.ended = true;
  playScene('prologue_end', finishPrologue);   // the cutscene engine (scenes.js); the old cards are PROLOGUE_END in story.js
}
function finishPrologue() {
  const rp = B && B.prol && B.prol.replay; B = null;
  if (rp) { selStage = -1; selCh = 1; scene = 'story'; return; }
  SAVE.seen.prologue = 1; saveGame();
  coachStep = SAVE.seen.coach ? 0 : 1; scene = coachStep ? 'squad' : 'hub';
}
function skipPrologue() { const rp = B && B.prol && B.prol.replay; B = null; if (!rp) { SAVE.seen.prologue = 1; saveGame(); } if (rp) { selStage = -1; selCh = 1; scene = 'story'; } else scene = 'hub'; }

function prologueUpdate(dt, dt0) {
  const P = B.prol, hero = proHero(), en = B.enemies;
  P.t += dt0; proSayTick(dt0);
  if (P.fade >= 0) {   // black between two road screens
    P.fade += dt0 * 1.8;
    if (P.fade >= 1 && !P.swapped) { P.swapped = true; proEnterSeg(P.seg + 1); }
    if (P.fade >= 2) { P.fade = -1; P.swapped = false; }
    return;
  }
  if (P.phase === 'road') {
    const i = P.seg, canGo = i === 0 && !P.spawned[0] ? true : P.exitOpen;
    if (hero.moving) { P.movedOnce = true; P.idle = 0; } else if (!en.length) P.idle += dt0;
    P.foot = canGo && P.idle > 5;   // standing around: footprints show the way
    if (i === 0 && !P.spawned[0] && hero.x > 120) { P.spawned[0] = 1; spawnEnemy('raider', 322, hero.y); proSay(hero, null, 'Rust Riders. Scavengers.'); }
    P.exitOpen = !!P.spawned[i] && !en.length && !B.later.length;
    if (i === 2 && !P.shown.wind && B.taken.melee > 0) { P.shown.wind = 1; proSay(hero, null, 'He winds up before every swing. Step out of it.'); }
    if (P.exitOpen && hero.x >= AX1 - 8) { P.fade = 0; P.obj = i === 2 ? 'Look around the camp' : P.obj; }
    return;
  }
  // camp
  P.dorm.forEach(d => { if (!d.woke && Math.hypot(hero.x - d.x, hero.y - d.y) < 16) proRecruit(d); });
  if (B.selUsed) P.pulseCard = null;
  const busy = en.length || B.later.length;
  if (busy) P.waveAge += dt0;
  if (!busy && P.waves < P.n) { P.waveT += dt0; if (P.waveT > 2) { P.waveT = 0; proWave(P.waves++); } }
  if (P.waves === 3) {   // the last fight: SLAM shows up once the hero is surrounded or hurt
    const near = en.filter(e => Math.hypot(e.x - hero.x, e.y - hero.y) < 26).length;
    P.surround = near >= 2 ? P.surround + dt0 : 0;
    if (!P.u.slam && busy && (P.surround > 1 || hero.hp < hero.maxhp * 0.6 || P.waveAge > 6)) {
      P.u.slam = true; hero.slamCd = 0; bft(hero.x, hero.y - 30, 'SLAM READY', '#ffd040', true); Snd.play('ult');
    }
  }
  if (P.waves === 3 && !busy) { P.endT += dt0; if (P.endT > 1.6) proFinish(); }
  if (!busy && P.waves === P.n && P.n < 3 && P.n > 0) P.obj = 'Find the others';
}

// ---------- drawing: the pixel layer ----------
const _proTint = new Map();
function proDim(s) { let t = _proTint.get(s); if (!t) { t = Art.tint(s, 'rgba(8,10,36,0.55)'); _proTint.set(s, t); } return t; }
function proBackdrop(g) {
  const P = B.prol, R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  if (P.seg < 3) {   // road sign that counts down the miles, a broken fence
    R('#2a2018', 266, 60, 3, 22); R('#6a5236', 252, 56, 32, 10); R('#8a6a46', 252, 56, 32, 2); R('#3a2a1c', 252, 64, 32, 2);
    for (let x = 40; x < 130; x += 22) { R('#4a3a2a', x, 40, 2, 12); R('#6a5a44', x, 40, 2, 1); if (x % 44 === 0) R('#4a3a2a', x - 4, 44, 12, 2); }
    return;
  }
  // camp: tents, crates, a fire
  [[30, 96, 22], [74, 70, 16]].forEach(t => { for (let r = 0; r < t[2]; r++) { const w = Math.round(r * 1.6) + 2; R(r < 3 ? '#8a7a5e' : '#6a5a46', t[0] - (w >> 1), t[1] - t[2] + r, w, 1); R('#4a3a2a', t[0] - (w >> 1), t[1] - t[2] + r, 1, 1); } R('#1a1410', t[0] - 3, t[1] - 8, 6, 8); });
  R('#5a4630', 178, 76, 24, 6); R('#7a6444', 178, 76, 24, 2); R('#2a2016', 180, 82, 4, 4); R('#2a2016', 196, 82, 4, 4);   // the crate Sight sits on
  R('#4a3a2a', 252, 150, 14, 10); R('#6a5a44', 252, 150, 14, 2); R('#4a3a2a', 270, 146, 12, 14); R('#6a5a44', 270, 146, 12, 2);
  const fx = 152, fy = 112; disc(g, fx, fy, 22, 'rgba(255,150,50,' + (0.10 + 0.03 * Math.sin(P.t * 9)) + ')');
  R('#2a1c12', fx - 8, fy + 2, 16, 3); R('#3a2a1c', fx - 6, fy, 12, 2);
  const f = Math.floor(P.t * 8) % 3; R('#ff7a18', fx - 3, fy - 4 - f, 6, 4 + f); R('#ffc040', fx - 2, fy - 4 - f, 4, 3); R('#fff0a0', fx - 1, fy - 2, 2, 2);
}
function proLayers(g, L) {
  const P = B.prol;
  if (P.phase !== 'camp') return;
  P.dorm.forEach(d => { if (d.woke) return; L.push({ y: d.y, f: () => {
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(Math.round(d.x) - 7, Math.round(d.y) + 5, 14, 3);
    const r = sprAt(g, d.def.spr, 0, d.x, d.y, 0.75, 0), s = Art.sprite(d.def.spr, 0);
    g.drawImage(proDim(s), r.px, r.py, r.w, r.h);   // switched off: a dark cast over the sprite
    if (Math.floor(P.t * 2) % 2) { g.fillStyle = '#40f0e0'; g.fillRect(Math.round(d.x) - 1, Math.round(d.y) - 28, 3, 3); }   // a faint standby light
  } }); });
}
function proOver(g) {
  const P = B.prol, hero = proHero();
  if (P.phase === 'road' && P.foot) {   // footprints that lead to the way out
    const x0 = Math.round(hero.x) + 14, x1 = AX1 - 6, y = Math.round(hero.y) + 5, ph = Math.floor(P.t * 5);
    for (let x = x0, k = 0; x < x1; x += 14, k++) { if ((k + ph) % 4 === 0) continue; g.fillStyle = 'rgba(255,230,160,0.55)'; g.fillRect(x, y + (k % 2) * 3, 4, 2); }
  }
  if (P.phase === 'road' && (P.exitOpen || (P.seg === 0 && !P.spawned[0]))) {   // the way on: chevrons at the right edge
    const a = 0.35 + 0.35 * Math.sin(P.t * 5);
    for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(255,224,120,' + (a * (0.5 + k * 0.25)) + ')'; const x = 292 + k * 5; g.fillRect(x, 104, 1, 1); g.fillRect(x + 1, 105, 1, 1); g.fillRect(x + 2, 106, 1, 1); g.fillRect(x + 1, 107, 1, 1); g.fillRect(x, 108, 1, 1); }
  }
  if (P.phase === 'camp') {
    const sel = B.hunters[B.sel];
    if (P.pulseCard && !B.selUsed && P.pulseCard.alive && Math.floor(P.t * 3) % 2) { g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.strokeRect(Math.round(P.pulseCard.x) - 9 + 0.5, Math.round(P.pulseCard.y) + 3 + 0.5, 18, 6); }
    if (P.waves >= 2 && P.waveAge > 6 && !B.focusUsed) {   // a ring on the far enemy that nobody is shooting
      const t = B.enemies.filter(e => e.def.range).sort((a, b) => b.x - a.x)[0];
      if (t) { const r = t.def.r + 4 + Math.sin(P.t * 6) * 1.5; g.strokeStyle = '#ffd040'; g.lineWidth = 1; g.beginPath(); g.arc(t.x, t.y - 4, r, 0, 6.28); g.stroke(); }
    }
  }
}

// ---------- drawing: the screen layer (speech, name plates, objective, fade) ----------
function proHud() {
  const P = B.prol, hero = proHero();
  text(P.obj, 24, 88, 20, '#ffd9a0');
  if (P.seg < 3 && P.phase === 'road') text(PRO_SIGNS[P.seg], 268 * 4, 55 * 4, 16, '#e8d8b0', 'center');   // printed on the road sign
  if (P.phase === 'camp') P.dorm.forEach(d => {   // a plate shows what a sleeping robot is good for once the hero comes close
    if (d.woke || Math.hypot(hero.x - d.x, hero.y - d.y) > 52) return;
    const w = 330, x = clamp(d.x * 4 - w / 2, 20, W - w - 20), y = Math.max(76, (d.y - 52) * 4 - 70), ds = wrap(d.def.desc, w - 28, 16);
    ctx.fillStyle = d.def.col; ctx.fillRect(x - 3, y - 3, w + 6, 40 + ds.length * 20 + 6); ctx.fillStyle = '#0c0e1c'; ctx.fillRect(x, y, w, 40 + ds.length * 20);
    text(d.def.name, x + 14, y + 28, 22, '#fff'); text(d.def.role, x + w - 14, y + 28, 14, d.def.col, 'right');
    ds.forEach((l, k) => text(l, x + 14, y + 54 + k * 20, 16, '#c8d8f8'));
  });
  const s = P.say;
  if (s) {   // speech bubble above the speaker
    const w = 400, ls = wrap(s.text, w - 28, 18), h = 34 + ls.length * 22;
    const x = clamp(s.u.x * 4 - w / 2, 16, W - w - 16), y = clamp((s.u.y - 44) * 4 - h, 70, H - 240);
    const a = Math.min(1, s.t * 6, (s.dur - s.t) * 4); ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = s.col; ctx.fillRect(x - 3, y - 3, w + 6, h + 6); ctx.fillStyle = '#0c0e1c'; ctx.fillRect(x, y, w, h);
    text(s.name.toUpperCase(), x + 14, y + 24, 14, s.col); ls.forEach((l, k) => text(l, x + 14, y + 48 + k * 22, 18, '#fff'));
    ctx.globalAlpha = 1;
  }
  if (P.fade >= 0) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - Math.abs(P.fade - 1)) + ')'; ctx.fillRect(0, 0, W, H); }
}
