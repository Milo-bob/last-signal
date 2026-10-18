'use strict';
// ---------- real-time squad battle (3 robots, auto combat, drag to dodge, ultimates, element combos) ----------
let B = null;
const AX0 = 12, AX1 = 308, AY0 = 54, AY1 = 166;

function hunterStats(id) {
  const def = HUNTER_BY[id], st = SAVE.h[id], m = 1 + 0.14 * (st.lvl - 1);
  let atk = def.atk * m, hp = def.hp * m, spd = def.spd, crit = 0.06, ultGain = 1;
  const sets = {}, gfx = {};
  ['weapon', 'armor', 'core'].forEach(s => {
    const g = st.gear[s]; if (!g) return; sets[g.set] = (sets[g.set] || 0) + 1; if (g.fx) gfx[g.fx] = (gfx[g.fx] || 0) + 1;
    const q = g.mods;
    if (q.atk) atk *= 1 + q.atk / 100; if (q.hp) hp *= 1 + q.hp / 100; if (q.spd) spd *= 1 + q.spd / 100; if (q.crit) crit += q.crit / 100;
  });
  if (sets.scrap >= 2) atk *= 1.12;
  if (sets.rail >= 2) spd *= 1.1;
  if (sets.ring >= 2) ultGain *= 1.25;
  if (gfx.surge) ultGain *= 1 + 0.3 * gfx.surge;
  const hb = heroBonus(); hp *= hb.hp; spd *= hb.spd; ultGain *= hb.ult;
  return { atk, hp, spd, crit, ultGain, ultMul: 1 + 0.12 * (st.skill - 1) + 0.2 * (gfx.overcharge || 0), gfx,
    aegis: Math.pow(0.88, gfx.aegis || 0), siphon: 0.03 * (gfx.siphon || 0), amp: 1 + 0.5 * (gfx.amp || 0), fin: 0.4 * (gfx.finisher || 0), prime: 35 * (gfx.primed || 0), lastStand: sets.scrap >= 3, scav: sets.rail >= 3, comboCore: sets.ring >= 3 };
}
function startBattle(stageIdx) {
  const stage = STAGES[stageIdx], fx = stageFx(stage);
  const hs = SAVE.squad.map((id, i) => {
    const def = HUNTER_BY[id], s = hunterStats(id);
    return { id, def, x: 40 + (i % 2) * 14, y: 70 + i * 34, hp: s.hp, maxhp: s.hp, atk: s.atk, spd: s.spd, crit: s.crit, ultGain: s.ultGain, ultMul: s.ultMul, aegis: s.aegis, siphon: s.siphon, amp: s.amp, fin: s.fin,
      lastStand: s.lastStand, scav: s.scav, comboCore: s.comboCore, range: def.range, rate: def.rate, cd: rnd(0, 0.5), charge: Math.max(startCharge(fx, id), s.prime), alive: true, order: null, focus: null, flash: 0, shield: 0, taunt: 0, face: 1, anim: rnd(0, 3), turretCd: 6, moving: false };
  });
  B = { stage, idx: stageIdx, goal: fx.goal, echo: fx.echo, bonus: stage.bonus || null, pt: 0, waveClock: 0, failWhy: null,
    prop: fx.goal.t === 'guard' ? { isProp: true, x: 22, y: 110, hp: fx.goal.hp, maxhp: fx.goal.hp, name: fx.goal.name, flash: 0 } : null,
    hunters: hs, enemies: [], proj: [], fx: [], ft: [], allies: [], tele: [], later: [], t: 0, wave: -1, spawnQ: [], waveDelay: 1, state: 'intro',
    introT: 2.2, speed: 1, paused: false, sel: 0, drag: false, kills: 0, deaths: 0, combos: 0, ults: 0, shake: 0, banner: { s: '', t: 0 },
    taken: { zone: 0, melee: 0, ranged: 0 }, firstDown: null, readyT: 0, focusUsed: false, moveUsed: false, resT: 0,
    find: FINDS[stage.id] && !SAVE.found[stage.id] ? { id: stage.id, x: FINDS[stage.id].x, y: FINDS[stage.id].y, taken: false } : null, foundId: null, tip: null, tipSeen: {}, pend: {} };
  scene = 'battle';
}
function startCharge(fx, id) { const e = fx.echo; return e ? Math.max(e.charge || 0, e.chargeOf && e.chargeOf[id] || 0) : 0; }
function lat(d, fn) { B.later.push({ t: d, fn }); }
function bfx(type, x, y, o) { B.fx.push(Object.assign({ type, x, y, t: 0, life: 0.4 }, o || {})); }
function bft(x, y, s, c, big) { B.ft.push({ x, y, s: String(s), c: c || '#fff', t: 0, big }); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function foesAlive() { return B.enemies.filter(e => e.hp > 0); }
function targetable(e) { return e.hp > 0 && e.state !== 'dig'; }

function spawnEnemy(type, x, y, trait, mark) {
  const def = FOES[type], i = B.stage.idx != null ? B.stage.idx : B.idx;
  const hpm = 1 + 0.28 * i, atm = 1 + 0.12 * i;
  const e = { type, def, x, y, hp: def.hp * hpm, maxhp: def.hp * hpm, atk: def.atk * atm, spd: def.spd, cd: rnd(0.4, 1.2), st: { burn: 0, chill: 0, wet: 0, stun: 0 }, burnDmg: 0, flash: 0,
    state: 'go', t: 0, tgt: null, anim: rnd(0, 3), phase: 0, pat: 3 };
  if (trait) { e.trait = trait; if (trait === 'shield') e.sh = e.shMax = e.maxhp * 0.6; }
  if (mark && B.goal.t === 'mark') { e.mark = true; e.hp = e.maxhp *= 1.6; }
  if (B.prop && !def.boss && type !== 'worm' && Math.random() < 0.3) e.pref = true;   // goes for the guarded object instead of the robots
  if (type === 'worm') { e.state = 'dig'; e.t = 2 + Math.random() * 2; }
  if (def.boss) { e.x = 252; e.y = 104; e.state = 'idle'; e.pat = 2.5; }
  B.enemies.push(e); return e;
}
function startWave() {
  B.wave++;
  const len = B.stage.waves.length, list = B.stage.waves[B.wave % len]; let d = 0;   // a hold stage repeats its waves until the time is up
  list.forEach(w => { for (let i = 0; i < w[1]; i++) { const t = w[0], dd = d; B.spawnQ.push({ t: dd, type: t, trait: w[2] === 'mark' ? null : w[2], mark: w[2] === 'mark' && i === 0 }); d += 0.35; } });
  B.waveClock = B.wave + 1 >= len ? 9 : 16;
  B.banner = { s: B.stage.boss && B.wave === len - 1 ? 'WARNING!' : B.goal.t === 'hold' ? 'WAVE ' + (B.wave + 1) : 'WAVE ' + (B.wave + 1) + ' / ' + len, t: 1.6 };
}

// ---------- damage and elements ----------
function addCharge(h, v) { if (h && h.alive) h.charge = Math.min(100, h.charge + v * h.ultGain); }
// a shield soaks damage first; shock breaks it 2.5x faster
function shieldAbsorb(e, dmg, el) {
  if (!(e.sh > 0)) return dmg;
  e.sh -= dmg * (el === 'shock' ? 2.5 : 1);
  if (e.sh <= 0) { e.sh = 0; bft(e.x, e.y - e.def.r - 16, 'SHIELD DOWN', '#80c8ff', true); Snd.play('freeze'); }
  return 0;
}
function dmgEnemy(e, dmg, src, el) {
  if (e.hp <= 0) return;
  if (src && src.fin && e.hp < e.maxhp * 0.3) dmg *= 1 + src.fin;
  if (src && Math.random() < src.crit) { dmg *= 1.8; bft(e.x, e.y - e.def.r - 6, Math.round(dmg) + '!', '#ffd040', true); Snd.play('crit'); }
  else bft(e.x, e.y - e.def.r - 6, Math.round(dmg), '#fff');
  e.hp -= shieldAbsorb(e, dmg, el); e.flash = 0.1; if (src) addCharge(src, dmg * 0.35);
  if (el && e.hp > 0) applyEl(e, el, src);
  if (e.hp <= 0) killEnemy(e);
}
function rawDmg(e, dmg, src, col) { if (e.hp <= 0) return; e.hp -= shieldAbsorb(e, dmg, null); e.flash = 0.1; bft(e.x, e.y - e.def.r - 6, Math.round(dmg), col || '#aaf'); if (src) addCharge(src, dmg * 0.25); if (e.hp <= 0) killEnemy(e); }
function killEnemy(e) {
  B.kills++; SAVE.stat.kills++; bumpMission('kill', 1); Snd.play('zdie');
  if (!foeSeen(e.type)) { SAVE.disc[e.type] = 1; saveGame(); toastMsg('CODEX: field note on ' + FOE_NOTES[e.type].title + ' added'); } bfx('ring', e.x, e.y, { col: '#ffffff', r: 12, life: 0.3 });
  for (let i = 0; i < 6; i++) bfx('spark', e.x, e.y, { vx: rnd(-50, 50), vy: rnd(-50, 50), col: '#ffb060', life: 0.5 });
  B.shake = Math.max(B.shake, e.def.boss ? 8 : 1.5);
  B.hunters.forEach(h => { if (h.alive && h.scav) h.hp = Math.min(h.maxhp, h.hp + h.maxhp * 0.04); if (h.alive && h.siphon) h.hp = Math.min(h.maxhp, h.hp + h.maxhp * h.siphon); });
  if (e.trait === 'volatile') {
    bfx('ring', e.x, e.y, { col: '#ff8a20', r: 30, life: 0.4 }); bft(e.x, e.y - 22, 'BOOM!', '#ff8a20', true); Snd.play('boom'); B.shake = Math.max(B.shake, 4);
    B.hunters.forEach(h => { if (h.alive && Math.hypot(h.x - e.x, h.y - e.y) < 28) hurtHunter(h, e.atk * 1.2, 'zone'); });
    B.enemies.forEach(o => { if (o !== e && o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < 28) rawDmg(o, o.maxhp * 0.25, null, '#ff9a50'); });
  }
  if (e.mark && B.state === 'play') { bft(e.x, e.y - 22, 'TARGET DOWN!', '#ffd040', true); endBattle(true); }
}
function applyEl(e, el, src) {
  if (el === 'fire') { if (e.st.chill > 0) return drench(e, src); if (e.st.burn <= 0) { bft(e.x, e.y - e.def.r - 16, 'BURN', '#ff8a20'); tutEvent('status'); } e.st.burn = 3; e.burnDmg = (src ? src.atk : 10) * 0.35; }
  else if (el === 'ice') { if (e.st.burn > 0) return drench(e, src); if (e.st.chill <= 0) { bft(e.x, e.y - e.def.r - 16, 'CHILL', '#80f0ff'); tutEvent('status'); } e.st.chill = 3; }
  else if (el === 'shock') { if (e.st.wet > 0) return overload(e, src); bfx('spark', e.x, e.y, { vx: 0, vy: -20, col: '#80f0ff', life: 0.3 }); }
}
function comboDone() { B.hunters.forEach(h => { if (h.alive && h.comboCore) { h.charge = Math.min(100, h.charge + 20); bft(h.x, h.y - 28, 'CORE +20%', '#c070ff'); } }); B.combos++; SAVE.stat.combos++; bumpMission('combo', 1); }
function drench(e, src) {
  const amp = src && src.amp || 1;
  e.st.burn = 0; e.st.chill = 0; comboDone(); Snd.play('freeze'); tutEvent('steam');
  bfx('ring', e.x, e.y, { col: '#80c8ff', r: 34, life: 0.45 }); bft(e.x, e.y - 24, 'STEAM!', '#80c8ff', true);
  B.enemies.forEach(o => { if (o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < 34) { o.st.wet = 4; if (o !== e) rawDmg(o, (src ? src.atk : 10) * 1.2 * amp, src); } });
  e.st.wet = 4; rawDmg(e, (src ? src.atk : 10) * 1.5 * amp, src);
}
function overload(e, src) {
  const amp = src && src.amp || 1;
  e.st.wet = 0; comboDone(); Snd.play('zap'); e.st.stun = 1.3; tutEvent('overload'); bft(e.x, e.y - 24, 'OVERLOAD!', '#80f0ff', true);
  const atk = (src ? src.atk : 10) * amp; rawDmg(e, atk * 2.6, src);
  const near = B.enemies.filter(o => o !== e && o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < 50).slice(0, 3);
  near.forEach(o => { bfx('beam', e.x, e.y, { x2: o.x, y2: o.y, col: '#80f0ff', life: 0.25 }); o.st.stun = 1; rawDmg(o, atk * 1.8, src); });
}
function hurtHunter(h, dmg, kind) {   // kind: 'zone' (red warning areas), 'melee' or 'ranged'; only used for the defeat report
  if (!h.alive) return;
  if (h.shield > 0) dmg *= 0.2; if (h.id === 'bulwark') dmg *= 0.8; if (h.aegis) dmg *= h.aegis; if (h.lastStand && h.hp / h.maxhp < 0.35) dmg *= 0.7;
  B.taken[kind] += Math.min(dmg, h.hp);
  h.hp -= dmg; h.flash = 0.12; bft(h.x, h.y - 16, Math.round(dmg), '#ff6060'); addCharge(h, dmg * 0.6);
  if (h.hp <= 0) { h.hp = 0; h.alive = false; B.deaths++; if (!B.firstDown) B.firstDown = { name: h.def.name, wave: Math.max(1, B.wave + 1), kind }; Snd.play('hurt'); bfx('ring', h.x, h.y, { col: '#ff6060', r: 18, life: 0.4 }); bft(h.x, h.y - 20, 'OFFLINE', '#ff6060', true); }
}

function hurtProp(p, dmg) {
  if (p.hp <= 0 || B.state !== 'play') return;
  p.hp -= dmg; p.flash = 0.12; bft(p.x, p.y - 16, Math.round(dmg), '#ff6060'); Snd.play('hurt');
  if (p.hp <= 0) { p.hp = 0; bfx('ring', p.x, p.y, { col: '#ff6060', r: 20, life: 0.4 }); B.failWhy = 'The ' + p.name + ' was destroyed.'; endBattle(false); }
}
function hurtAny(t, dmg, kind) { if (t.isProp) hurtProp(t, dmg); else hurtHunter(t, dmg, kind); }

// ---------- hunter attacks ----------
function nearestEnemy(from, only) {
  let best = null, bd = 1e9;
  B.enemies.forEach(e => { if (!targetable(e)) return; const d = dist(from, e); if (d < bd) { bd = d; best = e; } });
  return best;
}
function bolt(h, e, o) {
  const a = Math.atan2(e.y - h.y, e.x - h.x);
  B.proj.push(Object.assign({ x: h.x, y: h.y - 4, vx: Math.cos(a) * (o.speed || 200), vy: Math.sin(a) * (o.speed || 200), own: 'h', src: h, dmg: h.atk, life: 1.5, r: 3, col: '#fff2a0' }, o));
}
function attack(h, e) {
  h.cd = h.rate; h.face = e.x >= h.x ? 1 : -1;
  const id = h.id;
  if (id === 'bulwark' || id === 'blade') { dmgEnemy(e, h.atk, h); bfx('slash', e.x, e.y, { dir: h.face, col: id === 'blade' ? '#e0b0ff' : '#c0d8f8', life: 0.18 }); Snd.play('hit'); }
  else if (id === 'sight') { bolt(h, e, { speed: 320, col: '#80fff0', dmg: h.atk, pierce: 0, big: true }); Snd.play('rifle'); bfx('flash', h.x + h.face * 10, h.y - 4, { life: 0.06 }); }
  else if (id === 'ember') {
    const a = Math.atan2(e.y - h.y, e.x - h.x);
    B.enemies.forEach(o => { if (!targetable(o)) return; const d = dist(h, o); if (d <= h.range + o.def.r && Math.abs(angDiff(Math.atan2(o.y - h.y, o.x - h.x), a)) < 0.55) dmgEnemy(o, h.atk, h, 'fire'); });
    for (let i = 0; i < 5; i++) bfx('flame', h.x + Math.cos(a) * 8, h.y - 4 + Math.sin(a) * 8, { vx: Math.cos(a + rnd(-0.3, 0.3)) * rnd(70, 110), vy: Math.sin(a + rnd(-0.3, 0.3)) * rnd(70, 110), life: 0.3 });
    Snd.play('flame');
  } else if (id === 'frost') { bolt(h, e, { speed: 190, col: '#a0f0ff', el: 'ice' }); Snd.play('laser'); }
  else if (id === 'arc') {
    dmgEnemy(e, h.atk, h, 'shock'); bfx('beam', h.x, h.y - 4, { x2: e.x, y2: e.y, col: '#fff070', life: 0.2 });
    const near = B.enemies.filter(o => o !== e && targetable(o) && Math.hypot(o.x - e.x, o.y - e.y) < 46).slice(0, 2);
    near.forEach(o => { bfx('beam', e.x, e.y, { x2: o.x, y2: o.y, col: '#fff070', life: 0.2 }); dmgEnemy(o, h.atk * 0.6, h, 'shock'); });
    Snd.play('zap');
  } else if (id === 'scrap') { bolt(h, e, { speed: 210, col: '#ffb040' }); Snd.play('laser'); }
  else if (id === 'mender') { dmgEnemy(e, h.atk * 0.8, h); bfx('beam', h.x, h.y - 4, { x2: e.x, y2: e.y, col: '#80ff90', life: 0.15 }); }
}
function healAlly(h, a) {
  h.cd = h.rate; const amt = h.atk * 2.2; a.hp = Math.min(a.maxhp, a.hp + amt);
  bft(a.x, a.y - 16, '+' + Math.round(amt), '#6aff8a'); bfx('beam', h.x, h.y - 4, { x2: a.x, y2: a.y - 4, col: '#80ff90', life: 0.2 }); bfx('ring', a.x, a.y, { col: '#80ff90', r: 10, life: 0.3 });
  addCharge(h, 6); Snd.play('heal');
}

function updHunter(h, dt) {
  if (!h.alive) return;
  h.cd -= dt; h.flash -= dt; h.shield -= dt; h.taunt -= dt; h.anim += dt * 6; h.moving = false;
  let tgt = h.focus && targetable(h.focus) ? h.focus : null;
  let healT = null;
  if (h.def.heal) { let lo = 0.96; B.hunters.forEach(a => { if (a.alive && a.hp / a.maxhp < lo && dist(h, a) < h.range * 1.4) { lo = a.hp / a.maxhp; healT = a; } }); }
  if (!tgt) tgt = nearestEnemy(h);
  const goTo = (tx, ty, sp) => { const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy); if (d > 1.5) { const st = Math.min(d, sp * dt); h.x += dx / d * st; h.y += dy / d * st; h.moving = true; if (Math.abs(dx) > 1) h.face = dx > 0 ? 1 : -1; } return d; };
  if (h.order) goTo(h.order.x, h.order.y, h.spd);
  else if (healT) { const d = dist(h, healT); if (d > h.range * 0.8) goTo(healT.x, healT.y, h.spd); }
  else if (tgt) {
    const d = dist(h, tgt);
    if (h.def.melee) { if (d > h.range + tgt.def.r - 2) goTo(tgt.x, tgt.y, h.spd); }
    else if (d > h.range * 0.92) goTo(tgt.x, tgt.y, h.spd);
    else if (d < h.range * 0.3 && h.id !== 'ember') goTo(h.x - (tgt.x - h.x), h.y - (tgt.y - h.y), h.spd * 0.8);
  } else if (h.def.heal) { const t = B.hunters[0]; if (t.alive && dist(h, t) > 34) goTo(t.x - 20, t.y, h.spd); }
  h.x = clamp(h.x, AX0, AX1); h.y = clamp(h.y, AY0, AY1);
  if (h.cd <= 0) {
    if (healT && dist(h, healT) <= h.range + 4) healAlly(h, healT);
    else if (tgt && dist(h, tgt) <= h.range + tgt.def.r) attack(h, tgt);
  }
  if (h.id === 'scrap') { h.turretCd -= dt; if (h.turretCd <= 0 && tgt) { h.turretCd = 12; B.allies.push({ kind: 'turret', x: h.x + 10, y: h.y, t: 10, cd: 0, atk: h.atk * 0.7, src: h }); bfx('ring', h.x + 10, h.y, { col: '#ffb040', r: 12, life: 0.3 }); } }
}

function tryUlt(h) {   // button / key press: cast it, or say how far the charge is
  if (!B || B.state !== 'play' || B.paused) return;
  if (!h.alive) bft(h.x, h.y - 20, 'OFFLINE', '#ff6060');
  else if (h.charge < 100) bft(h.x, h.y - 28, 'ULT ' + Math.floor(h.charge) + '%', '#c070ff');
  else castUlt(h);
}
function castUlt(h) {
  if (!h.alive || h.charge < 100 || B.state !== 'play') return;
  h.charge = 0; B.ults++; SAVE.stat.ults++; bumpMission('ult', 1); Snd.play('ult'); B.shake = 4; tutEvent('ult');
  bft(h.x, h.y - 28, h.def.ult + '!', h.def.col, true);
  const M = h.ultMul, foes = foesAlive().filter(targetable);
  if (h.id === 'bulwark') { h.shield = 5; h.taunt = 5; bfx('dome', h.x, h.y, { life: 5, r: 24, col: '#8ab0e0', follow: h }); }
  else if (h.id === 'sight') {
    const t = foes.sort((a, b) => b.hp - a.hp)[0]; if (t) { bfx('beam', h.x, h.y - 4, { x2: t.x, y2: t.y, col: '#80fff0', life: 0.4, wide: true }); dmgEnemy(t, h.atk * 7 * M, h); B.shake = 7; }
  } else if (h.id === 'mender') { B.hunters.forEach(a => { if (a.alive) { a.hp = Math.min(a.maxhp, a.hp + a.maxhp * 0.45 * M); bfx('ring', a.x, a.y, { col: '#80ff90', r: 20, life: 0.5 }); bft(a.x, a.y - 16, '+REPAIR', '#6aff8a'); } }); Snd.play('heal'); }
  else if (h.id === 'ember') {
    let c = null, bn = -1; foes.forEach(e => { const n = foes.filter(o => Math.hypot(o.x - e.x, o.y - e.y) < 40).length; if (n > bn) { bn = n; c = e; } });
    if (c) { bfx('ring', c.x, c.y, { col: '#ff8a20', r: 42, life: 0.6 }); bfx('ring', c.x, c.y, { col: '#ffd040', r: 26, life: 0.5 }); foes.forEach(e => { if (Math.hypot(e.x - c.x, e.y - c.y) < 42) { dmgEnemy(e, h.atk * 4 * M, h, 'fire'); } }); Snd.play('boom'); }
  } else if (h.id === 'frost') { bfx('ring', h.x, h.y, { col: '#a0f0ff', r: 150, life: 0.7 }); foes.forEach(e => dmgEnemy(e, h.atk * 2.5 * M, h, 'ice')); Snd.play('freeze'); }
  else if (h.id === 'arc') { for (let i = 0; i < 6; i++) lat(i * 0.16, () => { const t = foesAlive().filter(targetable); if (!t.length) return; const e = pick(t); bfx('beam', e.x, e.y - 60, { x2: e.x, y2: e.y, col: '#fff070', life: 0.25, wide: true }); dmgEnemy(e, h.atk * 2 * M, h, 'shock'); Snd.play('zap'); }); }
  else if (h.id === 'blade') {
    const list = foes.sort((a, b) => dist(h, a) - dist(h, b)).slice(0, 5); h.shield = 0.18 * list.length + 0.5;
    list.forEach((e, i) => lat(i * 0.18, () => { if (!h.alive || e.hp <= 0) return; bfx('beam', h.x, h.y, { x2: e.x, y2: e.y, col: '#e0b0ff', life: 0.2, wide: true }); h.x = clamp(e.x - 8, AX0, AX1); h.y = e.y; dmgEnemy(e, h.atk * 3 * M, h); bfx('slash', e.x, e.y, { dir: 1, col: '#ffffff', life: 0.18 }); Snd.play('hit'); }));
  } else if (h.id === 'scrap') { for (let i = 0; i < 4; i++) B.allies.push({ kind: 'drone', x: h.x, y: h.y, t: 6, cd: i * 0.1, a: i * 1.57, atk: h.atk * 0.9, src: h }); }
}

// ---------- enemies ----------
function pickTarget(e) {
  if (e.pref && B.prop && B.prop.hp > 0) return B.prop;
  const al = B.hunters.filter(h => h.alive); if (!al.length) return null;
  const tk = al.find(h => h.taunt > 0); if (tk) return tk;
  return al.sort((a, b) => dist(e, a) - dist(e, b))[0];
}
function eBolt(e, t, sp, col) {
  const a = Math.atan2(t.y - e.y, t.x - e.x);
  B.proj.push({ x: e.x, y: e.y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, own: 'e', dmg: e.atk, life: 2.5, r: 3, col: col || '#ff5a5a' });
}
function telegraph(x, y, r, dur, dmg, shape, w) { B.tele.push({ x, y, r, t: 0, dur, dmg, shape: shape || 'circle', w: w || 0 }); }
function updEnemy(e, dt) {
  e.t += dt; e.cd -= dt; e.flash -= dt; e.anim += dt * 6;
  ['burn', 'chill', 'wet', 'stun'].forEach(k => { if (e.st[k] > 0) e.st[k] -= dt; });
  if (e.st.burn > 0) { e.burnTick = (e.burnTick || 0) + dt; if (e.burnTick >= 0.5) { e.burnTick = 0; rawDmg(e, e.burnDmg * 0.5, null, '#ff9a50'); } }
  if (e.hp <= 0) return;
  if (e.trait === 'regen' && e.st.burn <= 0 && e.st.chill <= 0 && e.state !== 'dig') e.hp = Math.min(e.maxhp, e.hp + e.maxhp * 0.04 * dt);
  if (e.st.stun > 0) return;
  const sp = e.spd * (e.st.chill > 0 ? 0.55 : 1) * (e.state === 'dig' ? 1.4 : 1);
  const tg = pickTarget(e); if (!tg) return;
  const d = dist(e, tg), mv = (tx, ty, s) => { const dx = tx - e.x, dy = ty - e.y, dd = Math.hypot(dx, dy) || 1; e.x += dx / dd * s * dt; e.y += dy / dd * s * dt; e.face = dx > 0 ? 1 : -1; };
  const def = e.def;
  if (def.boss) { bossAI(e, dt); return; }
  if (e.type === 'worm') {
    if (e.state === 'dig') { mv(tg.x, tg.y, sp); e.t -= 0; if (e.t <= 0 || d < 14) { e.state = 'warn'; e.t = 1; e.wx = e.x; e.wy = e.y; telegraph(e.x, e.y, 22, 1, e.atk, 'circle'); } }
    else if (e.state === 'warn') { if (e.t <= 0) { e.state = 'up'; e.t = 5; bfx('ring', e.x, e.y, { col: '#c8a060', r: 22, life: 0.3 }); Snd.play('slam'); B.shake = 4; } }
    else if (e.state === 'up') { if (e.t <= 0) { e.state = 'dig'; e.t = 2.5; } else if (d < 16 && e.cd <= 0) { e.cd = 1.2; hurtHunter(tg, e.atk * 0.5, 'melee'); bfx('slash', tg.x, tg.y, { dir: 1, col: '#ff6060', life: 0.15 }); } else if (d >= 16) mv(tg.x, tg.y, sp * 0.4); }
    return;
  }
  if (def.melee) {
    if (d > def.r + 8) mv(tg.x, tg.y, sp);
    else if (e.cd <= 0) { e.cd = e.type === 'brute' ? 1.5 : 1.0; hurtAny(tg, e.atk, 'melee'); bfx('slash', tg.x, tg.y, { dir: e.face || 1, col: '#ff6060', life: 0.15 }); Snd.play('hit'); }
  } else {
    const want = def.range * 0.8;
    if (d > def.range) mv(tg.x, tg.y, sp); else if (d < want * 0.5) mv(e.x - (tg.x - e.x), e.y - (tg.y - e.y), sp * 0.7);
    if (d <= def.range + 6 && e.cd <= 0) { e.cd = def.rate; eBolt(e, tg, 125, e.type === 'drone' ? '#ff40a0' : '#ffb040'); Snd.play('derringer'); }
  }
  e.x = clamp(e.x, AX0 - 20, AX1 + 30); e.y = clamp(e.y, AY0, AY1);
}
function bossAI(e, dt) {
  e.pat -= dt;
  if (e.st.chill > 0) e.pat -= dt * 0;
  if (e.phase === 0 && e.hp < e.maxhp * 0.55) { e.phase = 1; B.banner = { s: e.def.call || 'REINFORCEMENTS', t: 2 }; [0, 1, 2].forEach(i => lat(i * 0.4, () => spawnEnemy(e.def.add || 'raider', 330, rnd(60, 150)))); Snd.play('roar'); }
  if (e.pat <= 0) {
    const al = B.hunters.filter(h => h.alive); if (!al.length) return;
    const r = Math.random(), t = pick(al);
    if (r < 0.5) { e.pat = 3.2; telegraph(t.x, t.y, 30, 1.3, e.atk * 1.4, 'circle'); if (e.phase) lat(0.5, () => { const t2 = pick(B.hunters.filter(h => h.alive)); if (t2) telegraph(t2.x, t2.y, 30, 1.2, e.atk * 1.4, 'circle'); }); }
    else { e.pat = 3.6; telegraph(160, t.y, 0, 1.5, e.atk, 'band', 15); }
    Snd.play('roar');
  }
}
function updTele(dt) {
  B.tele = B.tele.filter(t => {
    t.t += dt; if (t.t < t.dur) return true;
    Snd.play('slam'); B.shake = Math.max(B.shake, 5); tutEvent('zoneDone');
    if (t.shape === 'circle') { bfx('ring', t.x, t.y, { col: '#ffb060', r: t.r, life: 0.35 }); B.hunters.forEach(h => { if (h.alive && Math.hypot(h.x - t.x, h.y - t.y) < t.r + 4) hurtHunter(h, t.dmg, 'zone'); }); }
    else { bfx('band', t.x, t.y, { w: t.w, life: 0.3 }); B.hunters.forEach(h => { if (h.alive && Math.abs(h.y - t.y) < t.w + 4) hurtHunter(h, t.dmg, 'zone'); }); }
    return false;
  });
}
function updAllies(dt) {
  B.allies = B.allies.filter(a => {
    a.t -= dt; a.cd -= dt; if (a.t <= 0) return false;
    if (a.kind === 'drone') { a.a += dt * 3; const s = a.src; a.x = s.x + Math.cos(a.a) * 16; a.y = s.y - 10 + Math.sin(a.a) * 10; }
    const e = nearestEnemy(a); if (e && a.cd <= 0 && dist(a, e) < (a.kind === 'turret' ? 90 : 120)) {
      a.cd = a.kind === 'turret' ? 0.5 : 0.4; const ang = Math.atan2(e.y - a.y, e.x - a.x);
      B.proj.push({ x: a.x, y: a.y - 4, vx: Math.cos(ang) * 230, vy: Math.sin(ang) * 230, own: 'h', src: a.src, dmg: a.atk, life: 1, r: 2, col: '#ffd040' }); Snd.play('derringer');
    }
    return true;
  });
}
function updProj(dt) {
  B.proj = B.proj.filter(p => {
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0 || p.x < 0 || p.x > 330 || p.y < 20 || p.y > 180) return false;
    if (p.own === 'h') {
      for (const e of B.enemies) { if (!targetable(e) || (p.hit && p.hit.indexOf(e) >= 0)) continue; if (Math.hypot(e.x - p.x, e.y - p.y) < e.def.r + p.r) { dmgEnemy(e, p.dmg, p.src, p.el); bfx('spark', p.x, p.y, { vx: rnd(-40, 40), vy: rnd(-40, 40), col: p.col, life: 0.25 }); if (p.pierce) { (p.hit = p.hit || []).push(e); p.pierce--; return true; } return false; } }
    } else {
      for (const h of B.hunters) if (h.alive && Math.hypot(h.x - p.x, h.y - p.y) < 6 + p.r) { hurtHunter(h, p.dmg, 'ranged'); return false; }
      if (B.prop && B.prop.hp > 0 && Math.hypot(B.prop.x - p.x, B.prop.y - 3 - p.y) < 8 + p.r) { hurtProp(B.prop, p.dmg); return false; }
    }
    return true;
  });
}
function bumpMission(id, n) { if (typeof SAVE === 'undefined' || !SAVE.missions[id]) return; SAVE.missions[id].p = Math.min(MISSIONS.find(m => m.id === id).goal, SAVE.missions[id].p + n); }

function updateBattle(dt0) {
  if (!B || B.paused) return;
  const dt = dt0 * B.speed; B.t += dt;
  B.banner.t -= dt0; B.shake *= Math.pow(0.88, dt0 * 60);   // 0.88 per frame at 60 fps, the same decay at any frame rate
  if (B.state === 'intro') { B.introT -= dt0; if (B.introT <= 0) { B.state = 'play'; startWave(); } return; }
  if (B.state !== 'play') { B.resT += dt0; B.fx = B.fx.filter(f => (f.t += dt) < f.life); return; }
  B.later = B.later.filter(l => { l.t -= dt; if (l.t <= 0) { l.fn(); return false; } return true; });
  B.spawnQ = B.spawnQ.filter(s => { s.t -= dt; if (s.t <= 0) { const e = spawnEnemy(s.type, 328, rnd(AY0 + 6, AY1 - 6), s.trait, s.mark); if (s.type === 'worm') { e.x = rnd(160, 300); } return false; } return true; });
  B.pt += dt; if (B.prop) B.prop.flash -= dt;
  if (B.goal.t === 'time' && B.pt >= B.goal.sec) { B.failWhy = 'Time ran out.'; endBattle(false); return; }
  if (B.goal.t === 'hold' && B.pt >= B.goal.sec) { bft(160, 100, 'HELD!', '#ffd040', true); endBattle(true); return; }
  if (B.goal.t === 'hold') { B.waveClock -= dt; if (B.waveClock <= 0) startWave(); }   // the next wave arrives on a timer
  B.hunters.forEach(h => { updHunter(h, dt); if (h.alive && h.charge >= 100) B.readyT += dt; });
  if (B.find && !B.find.taken) B.hunters.forEach(h => { if (h.alive && !B.find.taken && dist(h, B.find) < 9) pickFind(h); });
  B.enemies.forEach(e => updEnemy(e, dt));
  B.enemies = B.enemies.filter(e => e.hp > 0);
  updTele(dt); updAllies(dt); updProj(dt);
  B.fx = B.fx.filter(f => { f.t += dt; if (f.vx) { f.x += f.vx * dt; f.y += f.vy * dt; } if (f.follow) { f.x = f.follow.x; f.y = f.follow.y; } return f.t < f.life; });
  B.ft = B.ft.filter(f => { f.t += dt0; f.y -= 14 * dt0; return f.t < 0.9; });
  tutUpdate(dt0);
  if (!B.enemies.length && !B.spawnQ.length && !B.later.length) {
    B.waveDelay -= dt; if (B.waveDelay <= 0) { B.waveDelay = 1.4; if (B.wave + 1 < B.stage.waves.length) startWave(); else if (B.goal.t !== 'hold') endBattle(true); }
  }
  if (B.hunters.every(h => !h.alive)) endBattle(false);
}
function pickFind(h) {
  const f = B.find, d = FINDS[f.id]; f.taken = true; B.foundId = f.id; SAVE.found[f.id] = 1; saveGame();
  Snd.play('pickup'); bfx('ring', f.x, f.y, { col: '#ffd040', r: 16, life: 0.4 }); bft(f.x, f.y - 14, 'FOUND: ' + d.title, '#ffd040', true);
  toastMsg('CODEX: ' + d.title + ' added to FINDS');
}
// Reasons for a defeat, taken only from what actually happened in this battle (damage sources, ultimates, first robot down, unused gear).
function analyzeDefeat() {
  const out = [], tk = B.taken, total = tk.zone + tk.melee + tk.ranged;
  if (B.firstDown) {
    const k = { zone: 'a red warning area', melee: 'melee hits', ranged: 'ranged shots' }[B.firstDown.kind];
    out.push(B.firstDown.name + ' went down first, in wave ' + B.firstDown.wave + ', from ' + k + '.');
  }
  if (total > 0) {
    const top = ['zone', 'melee', 'ranged'].sort((a, b) => tk[b] - tk[a])[0], pct = Math.round(tk[top] / total * 100);
    if (top === 'zone' && pct >= 30) out.push(pct + '% of the damage came from red warning areas. Move robots out before the ring closes.');
    else if (top === 'melee' && pct >= 50) out.push(pct + '% of the damage came from melee hits. Put a sturdy robot in front.');
    else if (top === 'ranged' && pct >= 50) out.push(pct + '% of the damage came from ranged shooters. Focus them with a tap.');
  }
  if (B.ults === 0) out.push('No ultimate was used this battle.');
  else if (B.readyT >= 6) out.push('Ultimates sat fully charged for ' + Math.round(B.readyT) + ' seconds in total.');
  if (SAVE.bag.length && SAVE.squad.some(id => ['weapon', 'armor', 'core'].some(sl => !SAVE.h[id].gear[sl] && SAVE.bag.some(g => g.slot === sl)))) out.push('Your bag holds gear that your robots are not wearing.');
  return out.slice(0, 4);
}
function bonusMet(b) { return b.t === 'nodown' ? B.deaths === 0 : b.t === 'noult' ? B.ults === 0 : b.t === 'ults' ? B.ults >= b.n : b.t === 'combos' ? B.combos >= b.n : b.t === 'fast' ? B.pt < b.sec : false; }
function bonusFailed(b) { return b.t === 'nodown' ? B.deaths > 0 : b.t === 'noult' ? B.ults > 0 : b.t === 'fast' ? B.pt >= b.sec : false; }
function endBattle(win) {
  if (B.state !== 'play') return;
  B.state = win ? 'win' : 'lose'; Snd.play(win ? 'win' : 'lose');
  const st = B.stage; let res = { win, stars: 0, gold: 0, onyx: 0, gear: null, unlock: null };
  if (win) {
    const stars = B.deaths === 0 ? 3 : B.deaths === 1 ? 2 : 1; res.stars = stars;
    const first = !SAVE.stages[st.id];
    res.gold = Math.round(st.gold * (0.9 + 0.1 * stars) * (first ? 1.5 : 1) * heroBonus().gold); res.onyx = st.onyx + (first ? 2 : 0);
    SAVE.gold += res.gold; SAVE.onyx += res.onyx;
    const bn = st.bonus; if (bn) {
      const met = bonusMet(bn); res.bonus = { text: bonusText(bn), met, onyx: 0 }; SAVE.bonus = SAVE.bonus || {};
      if (met && !SAVE.bonus[st.id]) { SAVE.bonus[st.id] = 1; res.bonus.onyx = bonusOnyx(st); SAVE.onyx += res.bonus.onyx; }
    }
    if (!SAVE.stages[st.id] || SAVE.stages[st.id] < stars) SAVE.stages[st.id] = stars;
    if (stars === 3) bumpMission('star', 1);
    if (Math.random() < (st.boss ? 1 : 0.4)) { res.gear = genGear(B.idx, st.boss ? 2 : 0); SAVE.bag.push(res.gear); }
    if (first && perkAt(st.id)) res.perk = perkAt(st.id);
    if (st.unlock && SAVE.owned.indexOf(st.unlock) < 0) { SAVE.owned.push(st.unlock); res.unlock = st.unlock; initHunter(st.unlock); }
    bumpMission('win', 1); SAVE.stat.wins++;
    if (st.post && !SAVE.seen['post' + st.id]) { SAVE.seen['post' + st.id] = 1; res.outro = st.post; }
    if (st.id === 's15' && !SAVE.ending) res.final = true;
    post({ type: 'score', value: SAVE.stat.kills }); if (st.id === 's15') post({ type: 'gameOver', score: SAVE.stat.kills });
  }
  if (!win) { res.why = analyzeDefeat(); if (B.failWhy) res.why.unshift(B.failWhy); }
  res.found = B.foundId;
  B.result = res; saveGame();
}

// ---------- input ----------
function battlePointer(kind, x, y) {   // x,y in arena (low-res) coordinates
  if (!B || B.state !== 'play' || B.paused) return;
  if (kind === 'down') {
    let hit = -1; B.hunters.forEach((h, i) => { if (h.alive && Math.hypot(h.x - x, h.y - 12 - y) < 15) hit = i; });
    if (hit >= 0) { if (B.sel === hit && B.hunters[hit].order) { B.hunters[hit].order = null; } B.sel = hit; B.drag = true; tutEvent('sel'); return; }
    const e = B.enemies.find(o => targetable(o) && Math.hypot(o.x - x, o.y - 10 - y) < o.def.r + 9);
    const h = B.hunters[B.sel];
    if (e && h && h.alive) { h.focus = e; B.focusUsed = true; Snd.play('ui'); tutEvent('focus'); return; }
    if (h && h.alive) { h.order = { x: clamp(x, AX0, AX1), y: clamp(y, AY0, AY1) }; h.focus = null; B.moveUsed = true; Snd.play('ui'); tutEvent('move'); }
  } else if (kind === 'move' && B.drag) {
    const h = B.hunters[B.sel]; if (h && h.alive) h.order = { x: clamp(x, AX0, AX1), y: clamp(y, AY0, AY1) };
  } else if (kind === 'up') B.drag = false;
}

// ---------- drawing (pixel layer) ----------
function sprAt(g, name, f, x, y, alpha, flash, flip) {
  const s = Art.sprite(name, f), px = Math.round(x - s.lw / 2), py = Math.round(y - s.lh + (s.px ? 3 : 6));
  if (alpha < 1) g.globalAlpha = alpha; const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = false;
  if (flip) { g.save(); g.translate(px + s.lw, py); g.scale(-1, 1); g.drawImage(s, 0, 0, s.lw, s.lh); if (flash > 0) g.drawImage(flashOf(s), 0, 0, s.lw, s.lh); g.restore(); }
  else { g.drawImage(s, px, py, s.lw, s.lh); if (flash > 0) g.drawImage(flashOf(s), px, py, s.lw, s.lh); }
  g.imageSmoothingEnabled = sm; g.globalAlpha = 1; return { px, py, w: s.lw, h: s.lh };
}
const _fc = new Map();
function flashOf(s) { let t = _fc.get(s); if (!t) { t = Art.tint(s, 'rgba(255,255,255,0.85)'); _fc.set(s, t); } return t; }
function drawBattleWorld(g) {
  g.drawImage(Art.arena(B.stage.ch), 0, 0);
  // telegraphs
  B.tele.forEach(t => {
    const k = t.t / t.dur, a = 0.25 + 0.3 * Math.sin(t.t * 20);
    g.fillStyle = 'rgba(255,60,40,' + a + ')';
    if (t.shape === 'circle') disc(g, Math.round(t.x), Math.round(t.y), Math.round(t.r), 'rgba(255,60,40,' + a + ')');
    else g.fillRect(12, Math.round(t.y - t.w), 296, t.w * 2);
    g.strokeStyle = 'rgba(255,200,120,0.9)'; g.lineWidth = 1;
    if (t.shape === 'circle') { g.beginPath(); g.arc(t.x, t.y, t.r * k, 0, 6.28); g.stroke(); }
  });
  if (B.find && !B.find.taken) {   // optional find: a glint on the ground, a robot has to walk onto it
    const f = B.find, x = Math.round(f.x), y = Math.round(f.y);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - 3, y + 2, 7, 2); g.fillStyle = '#b8862a'; g.fillRect(x - 2, y - 1, 5, 3); g.fillStyle = '#fff6c0'; g.fillRect(x - 1, y - 1, 2, 1);
    if (Math.floor(B.t * 3) % 2) { g.fillStyle = '#ffd040'; g.fillRect(x, y - 5, 1, 3); g.fillRect(x, y + 3, 1, 2); g.fillRect(x - 5, y, 3, 1); g.fillRect(x + 3, y, 3, 1); }
  }
  const L = [];
  if (B.prop && B.prop.hp > 0) L.push({ y: B.prop.y, f: () => {   // the object the player has to protect
    const p = B.prop, x = Math.round(p.x), y = Math.round(p.y);
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x - 8, y + 4, 16, 3);
    g.fillStyle = p.flash > 0 ? '#ffffff' : '#7a5a2a'; g.fillRect(x - 7, y - 6, 14, 10); g.fillStyle = p.flash > 0 ? '#ffffff' : '#a07a3a'; g.fillRect(x - 7, y - 6, 14, 2); g.fillStyle = '#3a3a44'; g.fillRect(x - 7, y - 2, 14, 1);
    if (/RELAY/.test(p.name)) { g.fillStyle = '#c0c0c8'; g.fillRect(x, y - 14, 1, 8); g.fillStyle = Math.floor(B.t * 3) % 2 ? '#ff4040' : '#802020'; g.fillRect(x - 1, y - 15, 3, 2); }
    g.fillStyle = '#000'; g.fillRect(x - 9, y - 21, 18, 4); g.fillStyle = '#40d0ff'; g.fillRect(x - 8, y - 20, Math.max(1, Math.round(16 * p.hp / p.maxhp)), 2);
  } });
  B.allies.forEach(a => L.push({ y: a.y, f: () => {
    if (a.kind === 'turret') { g.fillStyle = '#3a3a44'; g.fillRect(Math.round(a.x) - 4, Math.round(a.y) - 2, 8, 6); g.fillStyle = '#ffb040'; g.fillRect(Math.round(a.x) - 1, Math.round(a.y) - 5, 5, 2); g.fillStyle = '#ffd040'; g.fillRect(Math.round(a.x) - 1, Math.round(a.y) + 1, 2, 2); }
    else { g.fillStyle = '#c0c0c8'; g.fillRect(Math.round(a.x) - 3, Math.round(a.y) - 2, 6, 3); g.fillStyle = '#ff4040'; g.fillRect(Math.round(a.x), Math.round(a.y) - 1, 1, 1); }
  } }));
  B.enemies.forEach(e => L.push({ y: e.y, f: () => {
    const d = e.def;
    if (e.state === 'dig') { sprAt(g, 'wormdig', Math.floor(e.anim) % 2, e.x, e.y, 1, 0); return; }
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(Math.round(e.x - d.r), Math.round(e.y + 5), d.r * 2, 3);
    const off = d.fly ? -10 + Math.sin(e.anim * 0.7) * 2 : 0;
    sprAt(g, d.spr, e.state === 'up' || d.boss ? Math.floor(e.t * 3) : Math.floor(e.anim), e.x, e.y + off, 1, e.flash, e.face < 0 && Art.sideView);
    if (e.st.burn > 0) { g.fillStyle = Math.floor(e.anim) % 2 ? '#ff8a20' : '#ffd040'; g.fillRect(Math.round(e.x) - 2 + (Math.floor(e.anim) % 3), Math.round(e.y) - d.r - 8, 2, 3); }
    if (e.st.chill > 0) { g.fillStyle = 'rgba(140,230,255,0.45)'; g.fillRect(Math.round(e.x - d.r), Math.round(e.y - d.r - 2), d.r * 2, d.r * 2 + 6); }
    if (e.st.wet > 0) { g.fillStyle = '#80c8ff'; g.fillRect(Math.round(e.x) - 4, Math.round(e.y) - d.r - 4 + (Math.floor(e.anim * 2) % 3), 1, 2); g.fillRect(Math.round(e.x) + 3, Math.round(e.y) - d.r - 3, 1, 2); }
    if (e.st.stun > 0) { g.fillStyle = '#ffd040'; g.fillRect(Math.round(e.x) - 4 + Math.floor(e.anim) % 3 * 3, Math.round(e.y) - d.r - 10, 2, 2); }
    if (e.st.wet > 0) { g.fillStyle = 'rgba(128,200,255,0.85)'; g.fillRect(Math.round(e.x - d.r), Math.round(e.y) + 8, d.r * 2, 1); }   // wet: ready for a shock hit
    B.hunters.forEach((h, hi) => {   // focus marker in the colour of the robot that was told to attack this enemy
      if (!h.alive || h.focus !== e) return;
      const mx = Math.round(e.x) + (hi - 1) * 6, my = d.boss ? Math.round(e.y) - d.r - 14 : Math.round(e.y) - 45 + (d.fly ? -10 : 0);
      g.fillStyle = h.def.col; g.fillRect(mx - 2, my, 5, 1); g.fillRect(mx - 1, my + 1, 3, 1); g.fillRect(mx, my + 2, 1, 1);
    });
    if (!d.boss) { const w = Math.max(10, d.r * 2), by = Math.round(e.y) - 40 + (d.fly ? -10 : 0), bx = Math.round(e.x - w / 2);   // trait markers next to the health bar
      if (e.sh > 0) { g.fillStyle = '#000'; g.fillRect(bx - 1, by - 4, w + 2, 3); g.fillStyle = '#60c8ff'; g.fillRect(bx, by - 3, Math.max(1, Math.round(w * e.sh / e.shMax)), 1); }
      if (e.trait === 'regen') { g.fillStyle = '#6aff8a'; g.fillRect(bx + w + 3, by, 1, 3); g.fillRect(bx + w + 2, by + 1, 3, 1); }
      if (e.trait === 'volatile') { g.fillStyle = Math.floor(B.t * 5) % 2 ? '#ff8a20' : '#ffd040'; g.fillRect(bx + w + 2, by, 3, 3); }
      if (e.mark) { const ay = by - 8 + (Math.floor(B.t * 4) % 2), ax = Math.round(e.x); g.fillStyle = '#ff3030'; g.fillRect(ax - 3, ay, 7, 1); g.fillRect(ax - 2, ay + 1, 5, 1); g.fillRect(ax - 1, ay + 2, 3, 1); g.fillRect(ax, ay + 3, 1, 1); }
    }
    if (!d.boss) { const w = Math.max(10, d.r * 2); g.fillStyle = '#000'; g.fillRect(Math.round(e.x - w / 2) - 1, Math.round(e.y) - 40 + (d.fly ? -10 : 0), w + 2, 4); g.fillStyle = '#d03030'; g.fillRect(Math.round(e.x - w / 2), Math.round(e.y) - 39 + (d.fly ? -10 : 0), Math.max(1, Math.round(w * e.hp / e.maxhp)), 2); }
  } }));
  B.hunters.forEach((h, i) => L.push({ y: h.y, f: () => {
    if (!h.alive) { g.globalAlpha = 0.5; sprAt(g, h.def.spr, 0, h.x, h.y + 4, 0.35, 0); g.globalAlpha = 1; return; }
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(Math.round(h.x) - 7, Math.round(h.y) + 5, 14, 3);
    if (i === B.sel) { g.strokeStyle = h.def.col; g.lineWidth = 1; g.strokeRect(Math.round(h.x) - 9 + 0.5, Math.round(h.y) + 3 + 0.5, 18, 6); }
    sprAt(g, h.def.spr, h.moving ? Math.floor(h.anim) : Math.floor(h.anim / 3), h.x, h.y, 1, h.flash, h.face < 0 && (Art.sideView || h.def.melee));
    const w = 16; g.fillStyle = '#000'; g.fillRect(Math.round(h.x) - w / 2 - 1, Math.round(h.y) - 35, w + 2, 4); g.fillStyle = h.hp / h.maxhp < 0.3 ? '#e04040' : '#40d060'; g.fillRect(Math.round(h.x) - w / 2, Math.round(h.y) - 34, Math.max(1, Math.round(w * h.hp / h.maxhp)), 2);
    if (h.charge >= 100) { g.fillStyle = Math.floor(B.t * 6) % 2 ? '#ffd040' : '#ffffff'; g.fillRect(Math.round(h.x) - 1, Math.round(h.y) - 41, 3, 3); }
    if (h.order) { g.fillStyle = h.def.col; g.fillRect(Math.round(h.order.x) - 1, Math.round(h.order.y) - 1, 3, 3); }
    if (h.shield > 0) { g.strokeStyle = 'rgba(140,200,255,0.9)'; g.beginPath(); g.arc(h.x, h.y - 4, 13, 0, 6.28); g.stroke(); }
  } }));
  L.sort((a, b) => a.y - b.y).forEach(o => o.f());
  B.proj.forEach(p => { g.fillStyle = p.col; const s = p.big ? 3 : 2; g.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, s, s); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(Math.round(p.x - p.vx * 0.02), Math.round(p.y - p.vy * 0.02), 1, 1); });
  B.fx.forEach(f => {
    const k = f.t / f.life, x = Math.round(f.x), y = Math.round(f.y);
    if (f.type === 'ring') { g.strokeStyle = f.col; g.globalAlpha = 1 - k; g.beginPath(); g.arc(f.x, f.y, f.r * (0.3 + 0.7 * k), 0, 6.28); g.stroke(); g.globalAlpha = 1; }
    else if (f.type === 'beam') { pixLine(g, f.x, f.y, f.x2, f.y2, f.col); if (f.wide) pixLine(g, f.x, f.y + 1, f.x2, f.y2 + 1, f.col); }
    else if (f.type === 'spark') { g.fillStyle = f.col; g.fillRect(x, y, 1, 1); }
    else if (f.type === 'flame') { g.fillStyle = k < 0.5 ? '#ffd040' : '#ff6a10'; g.fillRect(x, y, 2, 2); }
    else if (f.type === 'slash') { g.fillStyle = f.col; g.fillRect(x - 4, y - 1, 8, 1); g.fillRect(x - 2, y - 3, 4, 1); g.fillRect(x - 2, y + 2, 4, 1); }
    else if (f.type === 'flash') { g.fillStyle = '#fff6c0'; g.fillRect(x - 2, y - 2, 4, 4); }
    else if (f.type === 'dome') { g.strokeStyle = 'rgba(140,200,255,' + (0.5 + 0.3 * Math.sin(B.t * 10)) + ')'; g.beginPath(); g.arc(f.x, f.y - 4, f.r, 0, 6.28); g.stroke(); }
    else if (f.type === 'band') { g.fillStyle = 'rgba(255,200,120,' + (1 - k) + ')'; g.fillRect(12, Math.round(f.y - f.w), 296, f.w * 2); }
  });
}
function pixLine(g, x0, y0, x1, y1, col) {
  const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy)) || 1; g.fillStyle = col;
  for (let i = 0; i <= n; i += 1) g.fillRect(Math.round(x0 + dx * i / n), Math.round(y0 + dy * i / n), 1, 1);
}
function disc(g, cx, cy, r, col) {
  g.fillStyle = col;
  for (let j = -r; j <= r; j++) { const w = Math.floor(Math.sqrt(Math.max(0, r * r - j * j))); g.fillRect(cx - w, cy + j, w * 2 + 1, 1); }
}
