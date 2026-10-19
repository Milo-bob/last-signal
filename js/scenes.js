'use strict';
// ---------- cutscene engine ----------
// A scene is a function that returns a list of steps, in the style of the Spicewood cutscenes: letterbox bars, a camera that pans and zooms, actors who walk
// and react, dialogue boxes with portraits, a few choices. The scripts themselves are in scripts1.js, scripts2.js and scripts3.js.
//
//   steps ({k: ...}):  bg id t | fade to t | bars on | tint c a | cam at:[x,y] z t | actor id who at face | move id to t | face id dir | emote id e t | hide id | show id | alpha id to t |
//                      prop id kind at | say who text[] | choice q opts:[{t, fl, steps}] | menu q opts exit | wait t | shake n | flash | sfx n | cap text t | title text sub t |
//                      fx kind on | set {flag: value} | give gold onyx | toast s | run fn | end
//   Any step (and any choice option) can carry a condition: o:'guard' (hero past), own:'rose' (that squad member has joined), at:'s7' (see cleared() in story.js), fl:'ezra=mercy' or fl:'!ezra=mercy'.
//   (A choice option's own `fl` is an object, the flags it sets: { ezra: 'mercy' }.)
//   The scene space is the 320x180 pixel layer; characters stand on y 105..132 (the dialogue box covers the bottom of the picture).
//
// Choices are stored as flags in SAVE.fl (see FLAG_DEFS) and only change small lines later on and the epilogue. Replaying a scene from MEMORIES never changes the save.
const SCENES = {};
const FLAG_DEFS = { ezra: ['mercy', 'cold'], crow: ['debt', 'free'], tickets: ['silent', 'expose'], jonah: ['promise', 'none'], dessa: ['honest', 'hidden'] };
const CUT_CPS = 58, BAR_H = 44;
let SC = null;

// who speaks -> which actor/sprite shows as the portrait (and moves its mouth if it stands in the scene)
const VOICE = {
  SIGHT: 'sight', BULWARK: 'bulwark', MENDER: 'mender', EMBER: 'ember', FROST: 'frost', ARC: 'arc', BLADE: 'blade', SCRAPPER: 'scrap', HOLT: 'holt', COG: 'cog', ROSE: 'rose',
  'EZRA VANCE': 'ezra', 'OLD CALLOWAY': 'calloway', DESSA: 'dessa', 'MA DALTON': 'ma', CORVA: 'corva', BROKER: 'broker', 'JUDGE VERITY': 'judge',
  'WARDEN-1': 'warden', SENTINEL: 'sentinel', JONAH: 'jonah', VILLAGER: 'villager', MOTHER: 'villager', FATHER: 'villager', CHILD: 'kid', 'BLUE COAT': 'gunner', GUARD: 'gunner', BAILIFF: 'gunner', HALCYON: 'halcyon'
};
const RECRUIT_ORDER = ['ember', 'frost', 'arc', 'blade', 'scrap', 'rose', 'cog', 'holt'];

function sceneKey(id) { const m = /^(pre|post)_(s\d+)$/.exec(id); return m ? m[1] + m[2] : id; }   // the save keeps these keys since the story cards: 'pres1', 'posts7'
function stageSceneId(kind, st) { return kind + '_' + st.id; }
function hasStageScene(kind, st) { return !!SCENES[stageSceneId(kind, st)]; }
function flagIs(k, v) {
  if (SC && SC.flo && k in SC.flo) return SC.flo[k] === v;
  return !!(typeof SAVE !== 'undefined' && SAVE && SAVE.fl && SAVE.fl[k] === v);
}
function setFlag(k, v) {
  if (!FLAG_DEFS[k] || FLAG_DEFS[k].indexOf(v) < 0) return;
  if (SC) SC.flo[k] = v;
  if (SC && SC.replay) return;
  if (typeof SAVE !== 'undefined' && SAVE) { SAVE.fl = SAVE.fl || {}; SAVE.fl[k] = v; saveGame(); }
}
function condOk(st) {
  if (st.o && !(typeof SAVE !== 'undefined' && SAVE && SAVE.hero && SAVE.hero.origin === st.o)) return false;
  if (st.own && !(typeof SAVE !== 'undefined' && SAVE && SAVE.owned && SAVE.owned.indexOf(st.own) >= 0)) return false;   // own: only if that squad member has joined
  if (typeof st.at === 'string' && !cleared(st.at)) return false;   // on actor, prop and cam steps `at` is a position (an array), not a condition
  if (typeof st.fl === 'string' || Array.isArray(st.fl)) { const list = [].concat(st.fl); for (const c of list) { const neg = c[0] === '!', p = (neg ? c.slice(1) : c).split('='); if (flagIs(p[0], p[1]) === neg) return false; } }
  return true;
}
function voiceId(who) { return who === '@hero' ? 'hero' : (who && VOICE[who]) || null; }
function spriteOf(id) { return id === 'hero' ? null : (HUNTER_BY[id] ? HUNTER_BY[id].spr : id); }

// ---------- script helpers (used by the scripts files) ----------
const Sx = {
  say: (who, ...text) => ({ k: 'say', who, text }),
  nar: (...text) => ({ k: 'say', who: '', text }),
  sys: text => ({ k: 'say', who: '', text: [text], log: true }),
  wait: t => ({ k: 'wait', t }),
  fade: (to, t) => ({ k: 'fade', to, t: t === undefined ? 1 : t }),
  bg: (id, t) => ({ k: 'bg', id, t: t || 0 }),
  tint: (c, a) => ({ k: 'tint', c, a }),
  cam: (x, y, z, t) => ({ k: 'cam', at: [x, y], z: z || 1, t: t === undefined ? 0.8 : t }),
  frame: (ids, t) => ({ k: 'cam', frame: ids || 'all', t: t === undefined ? 0.8 : t }),
  frameA: (ids, spd) => ({ k: 'cam', frame: ids || 'all', async: true, spd: spd || 3 }),
  camAsync: (x, y, z, spd) => ({ k: 'cam', at: [x, y], z: z || 1, async: true, spd: spd || 3 }),
  act: (id, who, x, y, face) => ({ k: 'actor', id, who: who || id, at: [x, y], face: face || 1 }),
  go: (id, x, y, t) => ({ k: 'move', id, to: [x, y], t }),
  goA: (id, x, y, t) => ({ k: 'move', id, to: [x, y], t, async: true }),
  face: (id, dir) => ({ k: 'face', id, dir }),
  emo: (id, e, t) => ({ k: 'emote', id, e, t: t || 1.3 }),
  hide: id => ({ k: 'hide', id }),
  prop: (id, kind, x, y) => ({ k: 'prop', id, kind, at: [x, y] }),
  shake: n => ({ k: 'shake', n: n || 5 }),
  flash: () => ({ k: 'flash' }),
  sfx: n => ({ k: 'sfx', n }),
  cap: (text, t) => ({ k: 'cap', text, t: t || 3 }),
  title: (text, sub, t) => ({ k: 'title', text, sub, t: t || 3.4 }),
  fx: (kind, on) => ({ k: 'fx', kind, on: on !== false }),
  set: o => ({ k: 'set', set: o }),
  give: (gold, onyx, toast) => ({ k: 'give', gold: gold || 0, onyx: onyx || 0, toast }),
  choice: (q, opts) => ({ k: 'choice', q, opts }),
  menu: (q, opts, exit) => ({ k: 'menu', q, opts, exit }),
  // hero and the robots that have joined by this point of the story, in a loose row (front = right). `only` keeps just those ids.
  crew(stageId, when, x, y, face, only) {
    const idx = STAGES.findIndex(s => s.id === stageId), ids = ['hero', 'bulwark', 'sight', 'mender'];
    RECRUIT_ORDER.forEach(id => { const ri = STAGES.findIndex(s => s.unlock === id); if (ri >= 0 && (ri < idx || (ri === idx && when === 'post'))) ids.push(id); });
    const list = only ? ids.filter(id => only.indexOf(id) >= 0) : ids, f = face || 1, n = list.length, two = n > 5, cols = two ? Math.ceil(n / 2) : n;
    const room = f > 0 ? x - 16 : 304 - x, sp = Math.min(17, Math.max(10, room / Math.max(1, cols - 1 + (two ? 0.5 : 0))));   // a big squad stands in two rows
    return list.map((id, k) => {
      const col = two ? Math.floor(k / 2) : k, row = two ? k % 2 : 0;
      return { k: 'actor', id, who: id, at: [Math.round(x - f * (col * sp + (row ? sp / 2 : 0))), y - 3 + (two ? (row ? -7 : 0) : (k % 2 ? -4 : 0) + (k % 3 === 2 ? 3 : 0))], face: f };
    });
  },
  // the same row as a move: everyone walks `dx` to the side
  crewMove(stageId, when, dx, y, t, only) { return Sx.crew(stageId, when, 0, y, 1, only).map(a => ({ k: 'move', id: a.id, to: [a.at[0] + dx, a.at[1]], t, async: true })); }
};

// ---------- running a scene ----------
function playScene(id, done, opts) {
  const def = SCENES[id];
  if (!def) { if (done) done(); else scene = 'hub'; return; }
  const replay = !!(opts && opts.replay), key = sceneKey(id), hasSave = typeof SAVE !== 'undefined' && !!SAVE;
  const first = !replay && hasSave && !(SAVE.seen && SAVE.seen[key]);
  if (!replay && hasSave) { SAVE.seen = SAVE.seen || {}; SAVE.seen[key] = 1; saveGame(); }
  SC = { id, steps: def(), i: 0, cur: null, actors: {}, t: 0, replay, first, done, bg: 'black', bgFrom: null, bgMix: 1, bgDur: 1,
    cam: { x: 160, y: 90, z: 1 }, camT: { x: 160, y: 90, z: 1, spd: 3 }, shakeT: 0, shakeN: 0, tint: null, fx: {}, fadeA: 1, fadeTo: 0, fadeDur: 0.7, flashA: 0,
    bars: 0, barsTo: 1, cap: null, say: null, choice: null, ff: false, ending: false, flo: {}, emotes: [], title: null, mv: [] };
  if (typeof scene !== 'undefined') scene = 'cut';
}
function playScenes(ids, done, opts) { if (!ids.length) { if (done) done(); return; } playScene(ids[0], () => playScenes(ids.slice(1), done, opts), opts); }
// the first card of a stage: kind = 'pre' | 'post'. Falls back to the old story cards if a stage has no scene.
function playStageScene(kind, st, next, opts) {
  if (hasStageScene(kind, st)) { playScene(stageSceneId(kind, st), next, opts); return; }
  const lines = st[kind];
  if (lines && lines.length) { if (!(opts && opts.replay) && SAVE) { SAVE.seen[kind + st.id] = 1; saveGame(); } showCard(lines, next); return; }
  if (next) next();
}
function endScene(s) {
  if (SC !== s) return;
  SC = null; const d = s.done;
  if (d) d(); else if (typeof scene !== 'undefined') scene = 'hub';
}
function skipScene() { if (SC) { SC.ff = true; Snd.play('ui'); } }

function actorOf(s, id) { return s.actors[id] || null; }
function spawnActor(s, st) {
  const who = st.who || st.id; let kind, spr = null;
  if (who === 'hero') kind = 'hero';
  else if (HUNTER_BY[who]) { kind = 'robot'; spr = HUNTER_BY[who].spr; }
  else { kind = 'npc'; spr = who; }
  s.actors[st.id] = { id: st.id, who, kind, spr, x: st.at[0], y: st.at[1], face: st.face || 1, anim: 0, ph: Math.random() * 3, hidden: false, alpha: st.alpha === undefined ? 1 : st.alpha, flash: 0, talk: false, hop: 0 };
}
function runStep(s, st) {   // true = finished at once, false = a blocking step that set s.cur
  switch (st.k) {
    case 'bg': if (st.t > 0) { s.bgFrom = s.bg; s.bgMix = 0; s.bgDur = st.t; } s.bg = st.id; return true;
    case 'fade': s.fadeTo = st.to; s.fadeDur = Math.max(0.01, st.t === undefined ? 1 : st.t); if (!st.t) s.fadeA = st.to; if (st.t > 0 && !st.async) { s.cur = { wait: st.t }; return false; } return true;
    case 'bars': s.barsTo = st.on === false ? 0 : 1; return true;
    case 'tint': s.tint = st.c ? { c: st.c, a: st.a } : null; return true;
    case 'cam':
      if (st.frame) {   // frame the listed actors (or everyone on stage) so that all of them are in the picture and above the dialogue box
        const l = Object.keys(s.actors).map(k => s.actors[k]).filter(q => !q.hidden && q.kind !== 'prop' && (st.frame === 'all' || [].concat(st.frame).indexOf(q.id) >= 0));
        if (l.length) { const xs = l.map(q => q.x), mn = Math.min.apply(null, xs) - 18, mx = Math.max.apply(null, xs) + 18, z = clamp(300 / Math.max(80, mx - mn), 1, 1.5); st = Object.assign({}, st, { at: [(mn + mx) / 2, clamp(124 - 44 / z, 90 / z, 180 - 90 / z)], z }); }
        else st = Object.assign({}, st, { at: [160, 90], z: 1 });
      }
      if (st.reset) s.camT = { x: 160, y: 90, z: 1, spd: 3 }; else s.camT = { x: st.at[0], y: st.at[1], z: st.z || 1, spd: st.spd || 3 };
      if (st.async || !(st.t > 0)) { if (!(st.t > 0)) { s.cam.x = s.camT.x; s.cam.y = s.camT.y; s.cam.z = s.camT.z; } return true; }
      s.cur = { wait: st.t }; return false;
    case 'actor': spawnActor(s, st); return true;
    case 'prop': { const a = { id: st.id, kind: 'prop', pk: st.kind, x: st.at[0], y: st.at[1], face: 1, anim: 0, ph: 0, hidden: false, alpha: 1, flash: 0 }; s.actors[st.id] = a; return true; }
    case 'hide': [].concat(st.id).forEach(id => { if (s.actors[id]) s.actors[id].hidden = true; }); return true;
    case 'show': [].concat(st.id).forEach(id => { if (s.actors[id]) s.actors[id].hidden = false; }); return true;
    case 'alpha': { const a = s.actors[st.id]; if (!a) return true; a.hidden = false; s.mv.push({ a, fade: true, from: a.alpha, to: st.to, t: 0, dur: st.t || 1 }); if (st.async) return true; s.cur = { wait: st.t || 1 }; return false; }
    case 'move': {
      const ids = [].concat(st.id), list = []; let dur = st.t || 0;
      ids.forEach((id, n) => {
        const a = s.actors[id], to = st.tos ? st.tos[n] : st.to; if (!a || !to) return;
        const d = Math.hypot(to[0] - a.x, to[1] - a.y); if (Math.abs(to[0] - a.x) > 0.5 && !st.keep) a.face = to[0] > a.x ? 1 : -1;
        list.push({ a, x0: a.x, y0: a.y, x1: to[0], y1: to[1], t: 0, dur: 0, d });
        if (!st.t) dur = Math.max(dur, Math.max(0.2, d / (st.run ? 70 : 36)));
      });
      if (!list.length) return true; list.forEach(m => { m.dur = dur; });
      s.mv.push(...list); if (st.async) return true;
      s.cur = { wait: dur }; return false;
    }
    case 'face': { const a = s.actors[st.id]; if (a) a.face = typeof st.dir === 'number' ? st.dir : (s.actors[st.dir] && s.actors[st.dir].x < a.x ? -1 : 1); return true; }
    case 'emote': s.emotes.push({ id: st.id, e: st.e, t: st.t || 1.3, t0: st.t || 1.3 }); return true;
    case 'say': {
      if (!st.text || !st.text.length) return true;
      s.say = { who: st.who || '', vid: voiceId(st.who || ''), pages: st.text.map(t => heroText(t)), pi: 0, chars: 0, log: !!st.log, blip: 0 };
      s.cur = { say: true }; return false;
    }
    case 'choice': case 'menu': return startChoice(s, st);
    case 'wait': s.cur = { wait: st.t }; return false;
    case 'shake': s.shakeT = 0.5; s.shakeN = st.n || 5; return true;
    case 'flash': s.flashA = 1; return true;
    case 'sfx': try { Snd.play(st.n); } catch (e) {} return true;
    case 'cap': s.cap = { text: st.text, t: 0, dur: st.t || 3 }; return true;
    case 'title': s.title = { text: st.text, sub: st.sub || '', t: 0, dur: st.t || 3.4 }; s.cur = { wait: st.t || 3.4 }; return false;
    case 'fx': if (st.on === false) delete s.fx[st.kind]; else s.fx[st.kind] = true; return true;
    case 'set': Object.keys(st.set).forEach(k => setFlag(k, st.set[k])); return true;
    case 'give':
      if (s.first && typeof SAVE !== 'undefined' && SAVE) { SAVE.gold += st.gold || 0; SAVE.onyx += st.onyx || 0; saveGame(); if (st.toast !== '') toastMsg(st.toast || ('+' + (st.gold ? '$' + st.gold + '  ' : '') + (st.onyx ? st.onyx + ' ONYX' : ''))); }
      return true;
    case 'toast': toastMsg(st.s); return true;
    case 'run': try { st.fn(s); } catch (e) { console.error(e); } return true;
    case 'end': s.i = s.steps.length; return true;
  }
  return true;
}
// choices and menus: the options become buttons; picking one splices its steps in after the current step
function startChoice(s, st) {
  const menu = st.k === 'menu';
  if (menu) st.used = st.used || {};
  const idx = st.opts.map((o, i) => i).filter(i => condOk(st.opts[i]) && !(menu && st.used[i]));
  if (!idx.length) return true;
  const next = steps => { s.choice = null; s.cur = null; s.say = null; s.steps.splice(s.i + 1, 0, ...steps); s.i++; };
  s.choice = { q: st.q || '', menu, opts: idx.map(i => ({
    t: st.opts[i].t, fn: () => {
      const o = st.opts[i]; if (o.fl) Object.keys(o.fl).forEach(k => setFlag(k, o.fl[k]));
      if (menu) { st.used[i] = true; next([].concat(o.steps || [], [st])); } else next(o.steps || []);
    } })),
    exit: menu && st.exit ? { t: st.exit.t, fn: () => next(st.exit.steps || []) } : null, def: 0 };
  s.cur = { choice: true }; return false;
}
function finishCur(s) {   // fast-forward: complete whatever blocks the scene
  const c = s.cur; if (!c) return;
  if (c.choice) { const ch = s.choice, o = ch.exit || ch.opts[ch.def] || ch.opts[0]; o.fn(); return; }
  s.mv.forEach(m => { if (m.fade) m.a.alpha = m.to; else { m.a.x = m.x1; m.a.y = m.y1; m.a.anim = 0; } }); s.mv = [];
  if (c.say) s.say = null;
  s.cur = null; s.i++;
}
function updateCut(dt) {
  const s = SC; if (!s) return;
  if (s.ff) {   // skip: run every step at once; choices take their first option (or leave a menu)
    for (let g = 0; g < 6000 && SC === s; g++) {
      if (s.cur) finishCur(s);
      else if (s.i < s.steps.length) { const st = s.steps[s.i]; if (!condOk(st) || runStep(s, st)) s.i++; }
      else { s.title = null; endScene(s); return; }
    }
    return;
  }
  s.t += dt;
  s.bars += (s.barsTo - s.bars) * Math.min(1, dt * 5);
  const df = dt / s.fadeDur; s.fadeA += clamp(s.fadeTo - s.fadeA, -df, df);
  s.flashA = Math.max(0, s.flashA - dt / 0.7); if (s.shakeT > 0) s.shakeT -= dt;
  s.emotes.forEach(e => { e.t -= dt; }); s.emotes = s.emotes.filter(e => e.t > 0);
  if (s.bgMix < 1) s.bgMix = Math.min(1, s.bgMix + dt / s.bgDur);
  const c = s.cam, T = s.camT, k = Math.min(1, dt * T.spd); c.x += (T.x - c.x) * k; c.y += (T.y - c.y) * k; c.z += (T.z - c.z) * k;
  if (s.cap) { s.cap.t += dt; if (s.cap.t > s.cap.dur) s.cap = null; }
  if (s.title) { s.title.t += dt; if (s.title.t > s.title.dur) s.title = null; }
  s.mv = s.mv.filter(m => {
    m.t += dt; const p = clamp(m.t / m.dur, 0, 1);
    if (m.fade) { m.a.alpha = m.from + (m.to - m.from) * p; if (p >= 1 && m.to <= 0) m.a.hidden = true; return p < 1; }
    m.a.x = m.x0 + (m.x1 - m.x0) * p; m.a.y = m.y0 + (m.y1 - m.y0) * p; m.a.anim += dt * 7; if (p >= 1) m.a.anim = 0; return p < 1;
  });
  Object.keys(s.actors).forEach(id => { const a = s.actors[id]; a.flash = Math.max(0, a.flash - dt); a.talk = false; });
  if (s.say) {
    const sy = s.say, page = sy.pages[sy.pi], before = Math.floor(sy.chars);
    if (sy.chars < page.length) { sy.chars += dt * CUT_CPS; if (Math.floor(sy.chars) - before > 0 && Math.floor(sy.chars) % 3 === 0 && sy.who) Snd.play('talk'); const a = sy.vid && s.actors[sy.vid]; if (a) a.talk = true; }
  }
  if (s.cur) {
    const c2 = s.cur;
    if (c2.wait !== undefined) { c2.wait -= dt; if (c2.wait <= 0) { s.cur = null; s.i++; } }
    return;
  }
  let guard = 0;
  while (!s.cur && s.i < s.steps.length && guard++ < 80) { const st = s.steps[s.i]; if (!condOk(st) || runStep(s, st)) s.i++; else break; }
  if (!s.cur && s.i >= s.steps.length) {   // done: bars away, fade to black, then hand over
    if (!s.ending) { s.ending = true; s.barsTo = 0; s.fadeTo = 1; s.fadeDur = 0.5; }
    if (s.fadeA >= 0.99) endScene(s);
  }
}
function cutAdvance() {
  const s = SC; if (!s || !s.say || confirmBox) return;
  const sy = s.say, page = sy.pages[sy.pi];
  if (sy.chars < page.length) { sy.chars = page.length; return; }
  if (sy.pi + 1 < sy.pages.length) { sy.pi++; sy.chars = 0; Snd.play('ui'); return; }
  s.say = null; s.cur = null; s.i++;
}
function cutKey(k) {   // number keys pick a choice
  const s = SC; if (!s || !s.choice) return false;
  const n = parseInt(k, 10); if (n >= 1 && n <= s.choice.opts.length) { Snd.play('ui'); s.choice.opts[n - 1].fn(); return true; }
  if (k === '0' && s.choice.exit) { s.choice.exit.fn(); return true; }
  return false;
}

// ---------- drawing ----------
function cutSprite(a, t) {
  const f = a.anim > 0 ? Math.floor(a.anim) % 2 : Math.floor(t * 1.5 + a.ph) % 2;
  return a.kind === 'hero' ? Art.hero(SAVE.hero, f) : Art.sprite(a.spr, f);
}
function drawCutProp(g, a, t) {
  const x = Math.round(a.x), y = Math.round(a.y), f = Math.floor(t * 6);
  switch (a.pk) {
    case 'fire': g.fillStyle = '#2a1a10'; g.fillRect(x - 6, y - 2, 12, 3); g.fillRect(x - 4, y - 4, 8, 2);
      g.fillStyle = f % 2 ? '#ff8a20' : '#ff6a10'; g.fillRect(x - 3, y - 9 - (f % 3), 6, 7); g.fillStyle = '#ffd040'; g.fillRect(x - 2, y - 7 - (f % 2), 4, 5); g.fillStyle = '#fff6c0'; g.fillRect(x - 1, y - 5, 2, 3);
      g.globalAlpha = 0.16; g.fillStyle = '#ff9040'; for (let r = 1; r <= 4; r++) { g.beginPath(); g.arc(x, y - 4, r * 11, 0, 6.28); g.fill(); } g.globalAlpha = 1; break;
    case 'glint': g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - 3, y, 7, 2); g.fillStyle = '#b8862a'; g.fillRect(x - 2, y - 3, 5, 3); g.fillStyle = '#fff6c0'; g.fillRect(x - 1, y - 3, 2, 1);
      if (f % 2) { g.fillStyle = '#ffd040'; g.fillRect(x, y - 8, 1, 3); g.fillRect(x - 5, y - 3, 3, 1); g.fillRect(x + 3, y - 3, 3, 1); } break;
    case 'crate': g.fillStyle = '#5a4030'; g.fillRect(x - 7, y - 12, 14, 12); g.fillStyle = '#7a5a40'; g.fillRect(x - 7, y - 12, 14, 2); g.fillStyle = '#2a1c14'; g.fillRect(x - 7, y - 1, 14, 1); g.fillRect(x - 6, y - 12, 1, 12); g.fillRect(x + 5, y - 12, 1, 12); break;
    case 'barrel': g.fillStyle = '#3a5a8a'; g.fillRect(x - 5, y - 12, 10, 12); g.fillStyle = '#6a8aba'; g.fillRect(x - 4, y - 12, 2, 12); g.fillStyle = '#1a2a40'; g.fillRect(x - 5, y - 9, 10, 1); g.fillRect(x - 5, y - 3, 10, 1); g.fillStyle = '#80c8ff'; g.fillRect(x - 1, y - 7, 3, 2); break;
    case 'console': g.fillStyle = '#1a1e2e'; g.fillRect(x - 14, y - 14, 28, 14); g.fillStyle = '#2a2e44'; g.fillRect(x - 14, y - 14, 28, 2); g.fillStyle = f % 4 < 2 ? '#40f0e0' : '#2ac8c0'; g.fillRect(x - 11, y - 11, 22, 6); g.fillStyle = '#e0ffff'; g.fillRect(x - 11, y - 11, 22, 1);
      g.globalAlpha = 0.14; g.fillStyle = '#40f0e0'; for (let r = 1; r <= 4; r++) { g.beginPath(); g.arc(x, y - 8, r * 12, 0, 6.28); g.fill(); } g.globalAlpha = 1; break;
    case 'flower': g.fillStyle = '#2a3a2a'; g.fillRect(x, y - 10, 1, 10); g.fillStyle = '#d8905a'; g.fillRect(x - 2, y - 13, 5, 4); g.fillStyle = '#f0b080'; g.fillRect(x - 1, y - 12, 3, 2); g.fillStyle = '#fff0c0'; g.fillRect(x, y - 12, 1, 1); break;
    case 'grave': g.fillStyle = '#5a5a66'; g.fillRect(x - 4, y - 9, 8, 9); g.fillStyle = '#7a7a88'; g.fillRect(x - 4, y - 9, 8, 2); g.fillStyle = '#d8905a'; g.fillRect(x - 1, y - 13, 3, 3); break;
    case 'chair': g.fillStyle = '#4a3a30'; g.fillRect(x - 7, y - 16, 3, 16); g.fillRect(x - 7, y - 8, 14, 3); g.fillRect(x + 4, y - 5, 3, 5); g.fillStyle = '#7a1a2a'; g.fillRect(x - 5, y - 14, 9, 7); break;
    case 'cage': g.fillStyle = '#1a1a22'; g.fillRect(x - 10, y - 24, 20, 2); g.fillRect(x - 10, y - 2, 20, 2); g.fillStyle = '#3a3a48'; for (let i = 0; i <= 20; i += 5) g.fillRect(x - 10 + i, y - 24, 1, 24); break;
    case 'bundle': g.fillStyle = '#d8c8a0'; g.fillRect(x - 5, y - 6, 10, 6); g.fillStyle = '#a02a2a'; g.fillRect(x - 5, y - 4, 10, 1); g.fillStyle = '#e8dcc0'; g.fillRect(x - 5, y - 6, 10, 1); break;
    case 'wagon': g.fillStyle = '#3a2a1e'; g.fillRect(x - 17, y - 14, 34, 9); g.fillStyle = '#5a4030'; g.fillRect(x - 17, y - 14, 34, 2); g.fillStyle = '#c8b890'; g.fillRect(x - 15, y - 26, 30, 12); g.fillStyle = '#e0d4b0'; g.fillRect(x - 15, y - 26, 30, 2); g.fillStyle = '#0a0810'; [x - 10, x + 10].forEach(wx => { g.fillRect(wx - 5, y - 9, 10, 9); }); g.fillStyle = '#3a2a1e'; [x - 10, x + 10].forEach(wx => { g.fillRect(wx - 4, y - 8, 8, 7); }); break;
    case 'tag': g.fillStyle = '#b8862a'; g.fillRect(x - 3, y - 2, 6, 3); g.fillStyle = '#ffd040'; g.fillRect(x - 1, y - 2, 2, 2); break;
  }
}
function drawCutActor(g, a, t) {
  if (a.hidden || a.alpha <= 0) return;
  if (a.kind === 'prop') { drawCutProp(g, a, t); return; }
  const s = cutSprite(a, t), x = Math.round(a.x), y = Math.round(a.y), hop = a.talk && Math.floor(t * 9) % 2 ? -1 : 0;
  g.globalAlpha = a.alpha * (a.who === 'jonah' ? 0.75 : 1); g.fillStyle = 'rgba(0,0,0,0.38)'; g.fillRect(x - 7, y - 1, 14, 3);
  const px = x - 12, py = y - 24 + 3 + hop;
  g.imageSmoothingEnabled = false;
  if (a.face < 0) { g.save(); g.translate(px + 24, py); g.scale(-1, 1); g.drawImage(s, 0, 0, 24, 24); if (a.flash > 0) g.drawImage(flashOf(s), 0, 0, 24, 24); g.restore(); }
  else { g.drawImage(s, px, py, 24, 24); if (a.flash > 0) g.drawImage(flashOf(s), px, py, 24, 24); }
  g.globalAlpha = 1;
}
function drawCutFx(g, s, t) {
  const fx = s.fx;
  if (fx.rain) { g.fillStyle = 'rgba(160,200,255,0.55)'; for (let i = 0; i < 70; i++) { const x = (i * 47 + t * 90) % 330 - 5, y = (i * 83 + t * 260) % 190 - 5; g.fillRect(Math.round(x), Math.round(y), 1, 4); } }
  if (fx.dust) { g.fillStyle = 'rgba(232,208,160,0.5)'; for (let i = 0; i < 46; i++) { const x = (i * 71 + t * 70) % 340 - 10, y = (i * 29) % 170 + Math.sin(t + i) * 2; g.fillRect(Math.round(x), Math.round(y), 5 + i % 4, 1); } }
  if (fx.embers) { for (let i = 0; i < 30; i++) { const x = (i * 53 + Math.sin(t * 0.8 + i) * 6) % 320, y = 180 - ((t * (12 + i % 7) + i * 41) % 190); g.fillStyle = i % 2 ? '#ff8a20' : '#ffd040'; g.fillRect(Math.round(x), Math.round(y), 1, 1); } }
  if (fx.snow) { g.fillStyle = 'rgba(232,255,255,0.8)'; for (let i = 0; i < 40; i++) { const x = (i * 59 + Math.sin(t * 0.7 + i) * 8) % 330, y = (t * (10 + i % 5) + i * 37) % 185; g.fillRect(Math.round(x), Math.round(y), 1, 1); } }
  if (fx.sparks) { for (let i = 0; i < 14; i++) { if (Math.floor(t * 8 + i) % 5) continue; const x = (i * 73) % 320, y = (i * 41) % 110 + 10; g.fillStyle = '#80f0ff'; g.fillRect(x, y, 1, 4 + i % 3); } }
  if (fx.stars) { for (let i = 0; i < 40; i++) { if (Math.floor(t * 2 + i * 3) % 7 === 0) continue; g.fillStyle = i % 3 ? '#9a8ab8' : '#fff'; g.fillRect((i * 37) % 320, (i * 23) % 80, 1, 1); } }
}
function drawCutEmote(g, s, e) {
  const a = s.actors[e.id]; if (!a || a.hidden) return;
  const x = Math.round(a.x), y = Math.round(a.y) - 30 + Math.round(Math.sin(SC.t * 6) * 1);
  g.fillStyle = '#fff'; g.fillRect(x - 5, y - 6, 11, 9); g.fillRect(x - 1, y + 3, 3, 2); g.fillStyle = '#1a110a'; g.fillRect(x - 4, y - 5, 9, 7); g.fillRect(x - 1, y + 2, 3, 2);
  g.fillStyle = e.e === '!' ? '#ffe040' : e.e === 'heart' ? '#ff5080' : e.e === 'skull' ? '#e0e0e0' : '#ffffff';
  if (e.e === '!') { g.fillRect(x, y - 4, 1, 4); g.fillRect(x, y + 1, 1, 1); }
  else if (e.e === '?') { g.fillRect(x - 1, y - 4, 3, 1); g.fillRect(x + 1, y - 3, 1, 2); g.fillRect(x, y - 1, 1, 1); g.fillRect(x, y + 1, 1, 1); }
  else if (e.e === '...') { g.fillRect(x - 3, y, 1, 1); g.fillRect(x, y, 1, 1); g.fillRect(x + 3, y, 1, 1); }
  else if (e.e === 'heart') { g.fillRect(x - 3, y - 4, 2, 2); g.fillRect(x + 1, y - 4, 2, 2); g.fillRect(x - 3, y - 2, 6, 2); g.fillRect(x - 2, y, 4, 1); g.fillRect(x - 1, y + 1, 2, 1); }
  else if (e.e === 'note') { g.fillRect(x, y - 4, 1, 5); g.fillRect(x - 2, y, 3, 2); g.fillRect(x + 1, y - 4, 2, 1); }
  else if (e.e === 'sweat') { g.fillStyle = '#80c8ff'; g.fillRect(x - 1, y - 4, 2, 2); g.fillRect(x - 2, y - 2, 4, 3); }
  else if (e.e === 'skull') { g.fillRect(x - 2, y - 4, 5, 4); g.fillRect(x - 1, y, 3, 1); g.fillStyle = '#1a110a'; g.fillRect(x - 1, y - 3, 1, 1); g.fillRect(x + 1, y - 3, 1, 1); }
  else if (e.e === 'zzz') { g.fillRect(x - 3, y - 4, 4, 1); g.fillRect(x - 1, y - 3, 1, 1); g.fillRect(x - 3, y - 2, 4, 1); }
}
function cutPortrait(vid, x, y, sz) {   // the speaker's picture in the dialogue box
  ctx.fillStyle = '#0a0c18'; ctx.fillRect(x, y, sz, sz); ctx.imageSmoothingEnabled = false;
  if (vid === 'halcyon') {
    ctx.strokeStyle = '#40f0e0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + sz / 2, y + sz / 2, sz * 0.32, 0, 6.28); ctx.stroke(); ctx.fillStyle = '#e0ffff'; ctx.fillRect(x + sz / 2 - 6, y + sz / 2 - 6, 12, 12);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + sz / 2, y + sz / 2, sz * 0.44, 0.4, 5.9); ctx.stroke(); return;
  }
  const f = Math.floor(time * 1.5) % 2, sp = vid === 'hero' ? Art.hero(SAVE.hero, f) : Art.sprite(spriteOf(vid), f);
  if (vid === 'jonah') ctx.globalAlpha = 0.8;
  ctx.drawImage(sp, 0, 1, 24, 18, x + 4, y + 4, sz - 8, Math.round((sz - 8) * 18 / 24)); ctx.globalAlpha = 1;
}
function drawCut() {
  const s = SC; if (!s) return;
  const t = s.t, g = lx;
  g.save(); g.fillStyle = '#000'; g.fillRect(0, 0, 320, 180);
  const c = s.cam; let cx = c.x, cy = c.y; const z = Math.max(1, c.z);
  cx = clamp(cx, 160 / z, 320 - 160 / z); cy = clamp(cy, 90 / z, 180 - 90 / z);
  let sx = 0, sy = 0; if (s.shakeT > 0) { sx = Math.round(rnd(-s.shakeN, s.shakeN) / 2); sy = Math.round(rnd(-s.shakeN, s.shakeN) / 3); }
  g.translate(160 + sx, 90 + sy); g.scale(z, z); g.translate(-Math.round(cx), -Math.round(cy));
  g.imageSmoothingEnabled = false;
  if (s.bg === 'hub') g.drawImage(Art.hub(), 0, 0); else g.drawImage(Back.scene(s.bg), 0, 0);
  if (s.bgMix < 1 && s.bgFrom) { g.globalAlpha = 1 - s.bgMix; if (s.bgFrom === 'hub') g.drawImage(Art.hub(), 0, 0); else g.drawImage(Back.scene(s.bgFrom), 0, 0); g.globalAlpha = 1; }
  const list = Object.keys(s.actors).map(id => s.actors[id]).sort((a, b) => a.y - b.y);
  list.forEach(a => drawCutActor(g, a, t));
  s.emotes.forEach(e => drawCutEmote(g, s, e));
  drawCutFx(g, s, t);
  g.restore();
  if (s.tint) { g.fillStyle = 'rgba(' + s.tint.c + ',' + s.tint.a + ')'; g.fillRect(0, 0, 320, 180); }
  blit();
  uiB.length = 0;
  // letterbox
  const bh = Math.round(BAR_H * s.bars * (H / 720));
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  if (s.cap) { const k = Math.min(1, s.cap.t / 0.5, (s.cap.dur - s.cap.t) / 0.5); ctx.globalAlpha = Math.max(0, k); text(s.cap.text, 70, 100, 26, '#ffe9a0', 'left'); ctx.globalAlpha = 1; }
  // dialogue box
  if (s.say) {
    const sy = s.say, page = sy.pages[sy.pi], col = sy.who ? (SPEAK[sy.who === '@hero' ? '{HERO}' : sy.who] || '#ffd040') : (sy.log ? '#80f0ff' : '#c8d8f0'), bx = 40, by = 536, bw = 1200, bh2 = 160;
    panel(bx, by, bw, bh2, sy.log ? '#40c8e0' : col === '#ffffff' ? '#8aa0c0' : col);
    const has = sy.vid, tx = has ? 210 : 84, mw = has ? 980 : 1100;
    if (has) cutPortrait(sy.vid, bx + 18, by + 18, 124);
    let ty = by + 50;
    if (sy.who) { text(sy.who === '@hero' ? heroName().toUpperCase() : sy.who, tx, ty, 28, col); ty += 40; } else ty += 8;
    const lines = wrap(page, mw, 26); let n = Math.floor(sy.chars);
    lines.forEach(l => { text(l.slice(0, Math.max(0, n)), tx, ty, 26, sy.who ? '#f0f4ff' : (sy.log ? '#80f0ff' : '#d8e4f4')); n -= l.length + 1; ty += 31; });
    if (sy.chars >= page.length && Math.floor(s.t * 3) % 2) { ctx.fillStyle = col; ctx.fillRect(bx + bw - 44, by + bh2 - 36, 20, 4); ctx.fillRect(bx + bw - 40, by + bh2 - 32, 12, 4); ctx.fillRect(bx + bw - 36, by + bh2 - 28, 4, 4); }
    if (sy.pages.length > 1) text((sy.pi + 1) + '/' + sy.pages.length, bx + bw - 30, by + 26, 14, '#6a728a', 'right');
  }
  // choices
  if (s.choice) {
    const ch = s.choice, n = ch.opts.length + (ch.exit ? 1 : 0), top = Math.max(120, 300 - n * 28);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    if (ch.q) text(ch.q, W / 2, top - 30, 30, '#ffd040', 'center');
    ch.opts.forEach((o, i) => { wrap(o.t, 900, 22); button(190, top + i * 76, 900, 60, (i + 1) + '.  ' + o.t, () => { Snd.play('ui'); o.fn(); }, false, 22); });
    if (ch.exit) button(190, top + ch.opts.length * 76, 900, 60, '0.  ' + ch.exit.t, () => { Snd.play('ui'); ch.exit.fn(); }, false, 22, '#8a90b0', '#c8d0f0');
  }
  if (s.title) {
    const k = Math.min(1, s.title.t / 0.8, (s.title.dur - s.title.t) / 0.8); ctx.fillStyle = 'rgba(0,0,0,' + Math.max(0, Math.min(1, k * 1.4)) + ')'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = Math.max(0, k); text(s.title.text, W / 2, 330, 72, '#e8f4ff', 'center', '#1a4a8a'); if (s.title.sub) text(s.title.sub, W / 2, 392, 30, '#80f0ff', 'center'); ctx.globalAlpha = 1;
  }
  if (s.fadeA > 0.001) { ctx.fillStyle = 'rgba(0,0,0,' + clamp(s.fadeA, 0, 1) + ')'; ctx.fillRect(0, 0, W, H); }
  if (s.flashA > 0) { ctx.fillStyle = 'rgba(255,250,235,' + Math.min(1, s.flashA * 1.2) + ')'; ctx.fillRect(0, 0, W, H); }
  if (!s.choice && !s.ending && s.bars > 0.6) button(1130, 6, 130, 34, 'SKIP >>', () => { askConfirm('SKIP THIS SCENE?', ['The story goes on. Choices take their first option.', 'You can watch it again later under MEMORIES.'], 'SKIP', skipScene); }, false, 18, '#40506a', '#6a80a0');
}
