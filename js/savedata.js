'use strict';
// ---------- save data: validation, export / import, backup and reset ----------
// The save lives in localStorage under SAVE_KEY as JSON. Everything that comes from there or from an imported file is rebuilt field by field
// (cleanSave) instead of being trusted: unknown keys are dropped, types and ranges are checked, and no data is ever executed.
//   strict = true  (imports): anything wrong rejects the whole file with a readable reason.
//   strict = false (loading your own save): wrong or missing fields are repaired, so older saves keep working.
const SAVE_KEY = 'lastsignal_save', BACKUP_KEY = 'lastsignal_backup', BROKEN_KEY = 'lastsignal_save_broken';
const SAVE_FORMAT = 1, SAVE_MAX_BYTES = 512 * 1024, SAVE_MAXNUM = 1e9;
const GEAR_SLOTS = ['weapon', 'armor', 'core'];

class SaveError extends Error {}
function bad(msg) { throw new SaveError(msg); }
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function newHunterState() { return { lvl: 1, skill: 1, gear: { weapon: null, armor: null, core: null } }; }

function cleanSave(raw, strict) {
  if (!isObj(raw)) bad('The file does not contain a save.');
  // whole numbers only; required fields must exist in strict mode
  const int = (v, min, max, def, label, req) => {
    if (v === undefined || v === null) { if (strict && req) bad('"' + label + '" is missing.'); return def; }
    if (typeof v !== 'number' || !isFinite(v) || Math.floor(v) !== v) { if (strict) bad('"' + label + '" is not a whole number.'); return def; }
    if (v < min || v > max) { if (strict) bad('"' + label + '" is out of range.'); return Math.min(max, Math.max(min, v)); }
    return v;
  };
  const arr = (v, label, req) => {
    if (v === undefined || v === null) { if (strict && req) bad('"' + label + '" is missing.'); return null; }
    if (!Array.isArray(v)) { if (strict) bad('"' + label + '" has the wrong format.'); return null; }
    return v;
  };
  const obj = (v, label, req) => {
    if (v === undefined || v === null) { if (strict && req) bad('"' + label + '" is missing.'); return null; }
    if (!isObj(v)) { if (strict) bad('"' + label + '" has the wrong format.'); return null; }
    return v;
  };
  const flag = (v, label) => { if (v === undefined || v === null) return false; if (typeof v !== 'boolean' && v !== 0 && v !== 1) { if (strict) bad('"' + label + '" must be true or false.'); return !!v; } return !!v; };

  const out = {};
  out.gold = int(raw.gold, 0, SAVE_MAXNUM, 0, 'gold', true);
  out.onyx = int(raw.onyx, 0, SAVE_MAXNUM, 0, 'onyx', true);

  // robots
  const known = HUNTERS.map(h => h.id), uniq = (list, label) => {
    const res = [];
    list.forEach(id => {
      if (typeof id !== 'string' || known.indexOf(id) < 0) { if (strict) bad('"' + label + '" names an unknown robot.'); return; }
      if (res.indexOf(id) >= 0) { if (strict) bad('"' + label + '" lists a robot twice.'); return; }
      res.push(id);
    });
    return res;
  };
  out.owned = uniq(arr(raw.owned, 'owned', true) || [], 'owned');
  if (!out.owned.length) { if (strict) bad('The save owns no robots.'); out.owned = START_HUNTERS.slice(); }
  out.squad = uniq(arr(raw.squad, 'squad', true) || [], 'squad').filter(id => {
    if (out.owned.indexOf(id) < 0) { if (strict) bad('The squad uses a robot that is not owned.'); return false; } return true;
  });
  if (out.squad.length > 3) { if (strict) bad('The squad has more than 3 robots.'); out.squad.length = 3; }
  if (!out.squad.length) { if (strict) bad('The squad is empty.'); out.squad = out.owned.slice(0, 3); }

  // gear
  const gear = (g, label, slot) => {
    try {
      if (!isObj(g)) bad('"' + label + '" has the wrong format.');
      const set = typeof g.set === 'string' && SETS.some(s => s.id === g.set) ? g.set : bad('"' + label + '" has an unknown set.');
      const sl = GEAR_SLOTS.indexOf(g.slot) >= 0 && (!slot || g.slot === slot) ? g.slot : bad('"' + label + '" does not fit its slot.');
      const rar = int(g.rar, 0, RAR.length - 1, undefined, label + ' rarity', true);
      if (rar === undefined) bad('"' + label + '" has an invalid rarity.');
      const id = typeof g.id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(g.id) ? g.id : bad('"' + label + '" has an invalid id.');
      const name = typeof g.name === 'string' && /^[A-Za-z0-9 .'-]{1,32}$/.test(g.name) ? g.name : bad('"' + label + '" has an invalid name.');
      if (!isObj(g.mods)) bad('"' + label + '" has no stats.');
      const mods = {};
      Object.keys(MOD_N).forEach(k => { if (g.mods[k] !== undefined) { const v = int(g.mods[k], 0, 150, undefined, label + ' ' + k, true); if (v !== undefined) mods[k] = v; } });
      if (!Object.keys(mods).length) bad('"' + label + '" has no stats.');
      const out = { id, slot: sl, set, rar, mods, name };
      if (g.fx !== undefined && g.fx !== null) {   // traits came with the milestone update: older saves simply have none
        if (typeof g.fx === 'string' && GEAR_FX[g.fx] && rar >= 1) out.fx = g.fx; else if (strict) bad('"' + label + '" has an unknown trait.');
      }
      return out;
    } catch (e) { if (strict || !(e instanceof SaveError)) throw e; return null; }
  };
  const bagRaw = arr(raw.bag, 'bag', false) || [];
  if (bagRaw.length > BAGMAX) { if (strict) bad('The bag holds more than ' + BAGMAX + ' items.'); }
  out.bag = bagRaw.slice(0, BAGMAX).map((g, i) => gear(g, 'bag item ' + (i + 1))).filter(Boolean);

  const hRaw = obj(raw.h, 'h', true) || {};
  out.h = {};
  out.owned.forEach(id => {
    const r = hRaw[id];
    if (!isObj(r)) { if (strict) bad('Robot data for ' + id + ' is missing.'); out.h[id] = newHunterState(); return; }
    const st = newHunterState();
    st.lvl = int(r.lvl, 1, 30, 1, id + ' level', true); st.skill = int(r.skill, 1, 8, 1, id + ' ultimate level', true);
    const gr = obj(r.gear, id + ' gear', true) || {};
    GEAR_SLOTS.forEach(sl => { st.gear[sl] = gr[sl] ? gear(gr[sl], id + ' ' + sl, sl) : null; });
    out.h[id] = st;
  });

  // story progress
  out.stages = {};
  const sRaw = obj(raw.stages, 'stages', true) || {};
  STAGES.forEach((s, i) => {
    if (sRaw[s.id] === undefined) return;
    const v = int(sRaw[s.id], 0, 3, 0, 'stage ' + s.id, true);
    if (v > 0) {
      if (strict && i > 0 && !(out.stages[STAGES[i - 1].id] > 0)) bad('Stage ' + s.id + ' is cleared but the stage before it is not.');
      out.stages[s.id] = v;
    }
  });
  const bRaw = obj(raw.bonus, 'bonus', false) || {}; out.bonus = {}; STAGES.forEach(s => { if (s.bonus && bRaw[s.id]) out.bonus[s.id] = 1; });
  out.ending = raw.ending === undefined || raw.ending === null ? null : raw.ending;
  if (out.ending !== null && out.ending !== 'rain' && out.ending !== 'ascend') { if (strict) bad('"ending" is not a known ending.'); out.ending = null; }
  if (strict && out.ending && !out.stages.s15) bad('An ending is set but the last stage is not cleared.');

  // crates, missions, counters
  out.crates = [0, 1, 2].map(i => {
    const c = arr(raw.crates, 'crates', false), r = c && c[i];
    if (!isObj(r)) { if (strict && c) bad('Crate ' + (i + 1) + ' has the wrong format.'); return { s: 0, t: 0 }; }
    const s = int(r.s, 0, 2, 0, 'crate state', true), t = int(r.t, 0, 4e12, 0, 'crate time', true);
    return { s, t };
  });
  out.missions = {};
  const mRaw = obj(raw.missions, 'missions', false) || {};
  MISSIONS.forEach(m => {
    const r = mRaw[m.id];
    if (!isObj(r)) { out.missions[m.id] = { p: 0, c: false }; return; }
    out.missions[m.id] = { p: int(r.p, 0, m.goal, 0, 'mission ' + m.id, true), c: flag(r.c, 'mission ' + m.id) };
  });
  out.day = typeof raw.day === 'string' && /^\d{4}-\d{1,2}-\d{1,2}$/.test(raw.day) ? raw.day : (strict && raw.day !== undefined ? bad('"day" is not a date.') : dayKey());
  const stRaw = obj(raw.stat, 'stat', true) || {};
  out.stat = {}; ['kills', 'wins', 'combos', 'ults'].forEach(k => { out.stat[k] = int(stRaw[k], 0, SAVE_MAXNUM, 0, 'stat ' + k, true); });

  // flags the game keeps about what the player has seen or found
  const seenRaw = obj(raw.seen, 'seen', false) || {}, seenKeys = ['intro', 'end'];
  STAGES.forEach(s => { seenKeys.push('pre' + s.id, 'post' + s.id); });
  out.seen = {}; seenKeys.forEach(k => { if (seenRaw[k]) out.seen[k] = 1; });
  const fRaw = obj(raw.found, 'found', false) || {}; out.found = {}; Object.keys(FINDS).forEach(k => { if (fRaw[k]) out.found[k] = 1; });
  const dRaw = obj(raw.disc, 'disc', false) || {}; out.disc = {}; Object.keys(FOES).forEach(k => { if (dRaw[k]) out.disc[k] = 1; });
  const tRaw = obj(raw.tut, 'tut', false) || {}; out.tut = {}; Object.keys(TIPS).forEach(k => { if (tRaw[k] !== undefined) out.tut[k] = int(tRaw[k], 0, TIP_DONE, 0, 'tip ' + k, false); });
  out.tipsOff = flag(raw.tipsOff, 'tipsOff');
  out.cxSeen = int(raw.cxSeen, 0, 10000, -1, 'cxSeen', false);   // -1 = not known yet, filled in once the save is loaded

  // hero
  const hr = obj(raw.hero, 'hero', true), D = HERO_DEFAULT, hero = {};
  const hv = hr || {};
  const opt = (k, n) => {   // an appearance option: a valid index, or the default
    const v = hv[k]; if (v === undefined || v === null) return D[k];
    if (Number.isInteger(v) && v >= 0 && v < n) return v;
    if (strict) bad('The hero option "' + k + '" is not valid.'); return D[k];
  };
  let name = hv.name;
  if (typeof name === 'string' && /^[A-Za-z0-9 \-]{1,12}$/.test(name) && name.trim()) hero.name = name;
  else if (strict && name !== undefined) bad('The hero name is not valid (12 letters, numbers, spaces or dashes).');
  else hero.name = (typeof name === 'string' ? name.replace(/[^A-Za-z0-9 \-]/g, '').trim().slice(0, 12) : '') || D.name;
  if (hv.style === undefined && hv.hat !== undefined) hv.style = hv.hat;   // saves from before the style option was renamed
  hero.style = opt('style', HERO_STYLES.length); hero.outfit = opt('outfit', HERO_OUTFITS.length); hero.coat = opt('coat', HERO_COATS.length);
  hero.skin = opt('skin', HERO_SKINS.length); hero.hair = opt('hair', HERO_HAIRS.length); hero.mark = opt('mark', HERO_MARKS.length);
  hero.origin = ORIGINS.some(o => o.id === hv.origin) ? hv.origin : (strict && hv.origin !== undefined ? bad('The hero\'s past is not valid.') : D.origin);
  out.hero = hero;
  out.heroDone = raw.hero === undefined ? false : flag(raw.heroDone, 'heroDone');
  return out;
}

// repairs and daily reset that apply to every save that gets loaded, from storage or from a file
function finishSave(s) {
  STAGES.forEach(st => { if (st.unlock && s.stages[st.id] > 0 && s.owned.indexOf(st.unlock) < 0) s.owned.push(st.unlock); });   // a cleared stage always gives its robot
  s.owned.forEach(id => { if (!s.h[id]) s.h[id] = newHunterState(); });
  if (!(s.stages[PERKS.link.at] > 0)) s.owned.forEach(id => { s.h[id].skill = Math.min(s.h[id].skill, 6); });   // levels 7 and 8 belong to ULT LINK
  if (s.day !== dayKey()) { s.day = dayKey(); MISSIONS.forEach(m => { s.missions[m.id] = { p: 0, c: false }; }); }
  return s;
}
function adoptSave(s) {
  crateChoice = null; SAVE = s; if (SAVE.cxSeen < 0) SAVE.cxSeen = codexCount();
}
function saveSummary(s) {
  const n = Object.keys(s.stages).length;
  return s.hero.name.toUpperCase() + ', ' + n + ' of ' + STAGES.length + ' stages cleared, $' + s.gold + ', ' + s.owned.length + ' robots' + (s.ending ? ', ending reached' : '') + '.';
}

// ---------- reading and writing the browser storage ----------
function storedRaw() { try { return localStorage.getItem(SAVE_KEY); } catch (e) { return null; } }
function storedSave() {   // the save in storage, cleaned, or null
  const raw = storedRaw(); if (!raw) return null;
  try { return finishSave(cleanSave(JSON.parse(raw), false)); } catch (e) { return null; }
}
function backupOf(raw) { if (raw) { try { localStorage.setItem(BACKUP_KEY, JSON.stringify({ when: Date.now(), save: raw })); } catch (e) {} } }
function readBackup() {
  try { const b = JSON.parse(localStorage.getItem(BACKUP_KEY)); if (b && typeof b.save === 'string') return { when: +b.when || 0, s: finishSave(cleanSave(JSON.parse(b.save), false)), raw: b.save }; } catch (e) {}
  return null;
}
// the only place where an import replaces the save: storage first, memory only if that worked, the old save is kept as a backup
function replaceSave(clean, note) {
  const old = storedRaw();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(clean)); } catch (e) { dataMsg('Nothing changed: the browser would not store the save.', false); return false; }
  backupOf(old); adoptSave(clean); heroTyping = false; dataMsg(note, true); return true;
}

// ---------- export ----------
function exportSave() {
  const s = SAVE ? finishSave(cleanSave(JSON.parse(JSON.stringify(SAVE)), false)) : storedSave();
  if (!s) return dataMsg('There is no save to export yet.', false);
  try {
    const d = new Date(), pad = n => String(n).padStart(2, '0'), name = 'last-signal-save-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + '.json';
    const json = JSON.stringify({ game: 'last-signal', format: SAVE_FORMAT, exported: d.toISOString(), save: s }, null, 1);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' })), a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    dataMsg('Save exported as ' + name + '. If no download appeared, your browser blocked it: open the game in its own tab and try again.', true);
  } catch (e) { dataMsg('Export failed: this browser could not create the file.', false); }
}

// ---------- import ----------
function importSave() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json'; inp.style.display = 'none';
  inp.addEventListener('change', () => {
    const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
    if (f.size > SAVE_MAX_BYTES) return dataMsg('Import rejected: that file is too large to be a Last Signal save.', false);
    const r = new FileReader();
    r.onerror = () => dataMsg('Import failed: the file could not be read.', false);
    r.onload = () => {
      let clean;
      try { clean = parseImport(String(r.result)); } catch (e) { return dataMsg(e instanceof SaveError ? 'Import rejected: ' + e.message : 'Import failed: the file could not be understood.', false); }
      askConfirm('IMPORT THIS SAVE?', ['File: ' + saveSummary(clean), SAVE || storedRaw() ? 'It replaces your current save. Your current save is kept as a backup.' : 'It becomes your save on this device.'], 'IMPORT',
        () => replaceSave(clean, 'Save imported: ' + saveSummary(clean)));
    };
    r.readAsText(f);
  });
  document.body.appendChild(inp); inp.click();
}
function parseImport(text) {
  let o; try { o = JSON.parse(text); } catch (e) { bad('The file is not valid JSON.'); }
  if (!isObj(o) || o.game !== 'last-signal') bad('This is not a Last Signal save file.');
  if (typeof o.format !== 'number' || o.format < 1 || o.format > SAVE_FORMAT) bad('This save comes from a different version of the game.');
  return finishSave(cleanSave(o.save, true));
}

// ---------- backup, reset ----------
function restoreBackup() {
  const b = readBackup(); if (!b) return dataMsg('There is no backup.', false);
  askConfirm('RESTORE BACKUP?', ['Backup: ' + saveSummary(b.s), 'It replaces your current save. Your current save becomes the new backup.'], 'RESTORE',
    () => replaceSave(b.s, 'Backup restored: ' + saveSummary(b.s)));
}
function resetProgress() {
  askConfirm('RESET ALL PROGRESS?', ['This deletes your hero, robots, gear, story progress and codex on this device.', 'A backup of the current save is kept, so RESTORE BACKUP can undo it.'], 'YES, RESET',
    () => { backupOf(storedRaw()); try { localStorage.removeItem(SAVE_KEY); } catch (e) {} SAVE = null; dataStatus = null; scene = 'title'; toastMsg('Progress reset.'); }, true);
}

// ---------- the SAVE DATA screen ----------
let dataStatus = null, dataReturn = 'hub';
function dataMsg(s, ok) { dataStatus = { s, ok }; }
function openData() { dataReturn = scene; dataStatus = null; scene = 'data'; Snd.play('ui'); }
function drawData() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.86)'; ctx.fillRect(0, 0, W, H); topBar('SAVE DATA', () => { scene = dataReturn; Snd.play('ui'); });
  const have = !!(SAVE || storedRaw()), bk = readBackup();
  panel(40, 100, 1200, 130, '#80f0ff');
  ['Your progress is stored in this browser only. Clearing the browser data deletes it.',
    'EXPORT saves it as a file you can keep. IMPORT loads such a file after checking it. RESET starts over.'].forEach((l, i) => text(l, 70, 150 + i * 36, 22, '#d8e4ff'));
  button(40, 262, 360, 62, 'EXPORT SAVE', () => { Snd.play('ui'); exportSave(); }, !have, 28);
  button(40, 346, 360, 62, 'IMPORT SAVE', () => { Snd.play('ui'); importSave(); }, false, 28);
  button(40, 430, 360, 62, 'RESTORE BACKUP', () => { Snd.play('ui'); restoreBackup(); }, !bk, 26);
  button(40, 540, 360, 62, 'RESET PROGRESS', () => { Snd.play('ui'); resetProgress(); }, !have, 26, '#e06060', '#ffa0a0');
  const note = ['Saves a copy of your current progress as a .json file.', 'Replaces your save with a file made by EXPORT. Files that fail the check are rejected and change nothing.',
    bk ? 'Backup from ' + new Date(bk.when).toLocaleString() + ': ' + saveSummary(bk.s) : 'A backup is made automatically before an import, a restore, a reset or a new game.', 'Deletes your progress after you confirm.'];
  [262, 346, 430, 540].forEach((y, i) => wrap(note[i], 760, 17).forEach((l, k) => text(l, 440, y + 26 + k * 22, 17, '#9aa4c8')));
  if (dataStatus) { panel(40, 626, 1200, 70, dataStatus.ok ? '#6adf6a' : '#e04040'); wrap(dataStatus.s, 1150, 19).slice(0, 2).forEach((l, i) => text(l, 64, 656 + i * 26, 19, dataStatus.ok ? '#b8ffb8' : '#ffb0b0')); }
}
