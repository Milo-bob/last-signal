'use strict';
// ---------- game data: robots, enemies, gear, missions (story lives in story.js) ----------
const HUNTERS = [
  { id: 'bulwark', name: 'BULWARK', role: 'DEFENDER', el: null, hp: 260, atk: 14, rate: 1.1, range: 16, spd: 28, melee: true, spr: 'bulwark',
    desc: 'Heavy tank. Draws enemy attention with its shield.', ult: 'FORTRESS', ultDesc: 'Taunts all enemies and blocks 80% damage for 5s.', col: '#6a8ac0' },
  { id: 'sight', name: 'SIGHT', role: 'MARKSMAN', el: null, hp: 110, atk: 48, rate: 1.9, range: 135, spd: 26, spr: 'sight',
    desc: 'Long-range sniper in a rusty hat. Slow, brutal shots.', ult: 'HEADSHOT', ultDesc: 'One huge shot at the toughest enemy.', col: '#a8703e' },
  { id: 'mender', name: 'MENDER', role: 'HEALER', el: null, hp: 140, atk: 12, rate: 1.4, range: 95, spd: 26, heal: true, spr: 'mender',
    desc: 'Hovering repair bot. Patches up the weakest friend.', ult: 'OVERHAUL', ultDesc: 'Repairs the whole squad for 45% health.', col: '#e8f0e8' },
  { id: 'ember', name: 'EMBER', role: 'FIRE', el: 'fire', hp: 150, atk: 11, rate: 0.45, range: 54, spd: 28, spr: 'ember',
    desc: 'Flamethrower bot. Sets enemies on fire.', ult: 'INFERNO', ultDesc: 'Fire storm burns the biggest crowd.', col: '#d8602a' },
  { id: 'frost', name: 'FROST', role: 'ICE', el: 'ice', hp: 130, atk: 15, rate: 1.0, range: 92, spd: 26, spr: 'frost',
    desc: 'Cryo caster. Chills and slows enemies.', ult: 'BLIZZARD', ultDesc: 'Chills and damages every enemy.', col: '#8af0ff' },
  { id: 'arc', name: 'ARC', role: 'SHOCK', el: 'shock', hp: 135, atk: 14, rate: 1.2, range: 82, spd: 28, spr: 'arc',
    desc: 'Tesla bot. Chain lightning, deadly on wet targets.', ult: 'STORM', ultDesc: 'Six lightning strikes on random enemies.', col: '#e8c82a' },
  { id: 'blade', name: 'BLADE', role: 'ASSASSIN', el: null, hp: 170, atk: 17, rate: 0.55, range: 15, spd: 44, melee: true, spr: 'blade',
    desc: 'Fast melee ninja. Cuts through the backline.', ult: 'BLADE DANCE', ultDesc: 'Dashes through five enemies in a flurry.', col: '#a070d8' },
  { id: 'scrap', name: 'SCRAPPER', role: 'ENGINEER', el: null, hp: 150, atk: 9, rate: 0.8, range: 72, spd: 28, spr: 'scrap',
    desc: 'Builds auto-turrets from scrap every few seconds.', ult: 'DRONE SWARM', ultDesc: 'Four combat drones attack for 6s.', col: '#5a9a4a' }
];
const HUNTER_BY = {}; HUNTERS.forEach(h => HUNTER_BY[h.id] = h);
// the player's hero fights next to the squad (stats come from the squad level, see heroUnit in battle.js)
const HERO_DEF = { id: 'hero', name: 'HERO', role: 'HERO', melee: true, col: '#ffffff', ult: 'SLAM', spr: null };
const START_HUNTERS = ['bulwark', 'sight', 'mender'];

const FOES = {
  raider: { name: 'Rust Rider', hp: 60, atk: 9, spd: 26, r: 6, melee: true, spr: 'raider', xp: 1 },
  gunner: { name: 'Blue Coat', hp: 46, atk: 8, spd: 20, r: 6, range: 100, rate: 1.9, spr: 'gunner', xp: 1 },
  drone: { name: 'Watch Drone', hp: 32, atk: 6, spd: 40, r: 6, range: 72, rate: 1.5, fly: true, spr: 'drone', xp: 1 },
  worm: { name: 'Dust Worm', hp: 130, atk: 20, spd: 30, r: 9, spr: 'worm', xp: 2 },
  brute: { name: 'Breaker', hp: 380, atk: 26, spd: 16, r: 11, melee: true, spr: 'brute', xp: 3 },
  boss: { name: 'GIANT HAND', hp: 2400, atk: 30, spd: 0, r: 22, boss: true, spr: 'boss', xp: 10, call: 'THE HAND CALLS THE RIDERS', add: 'raider' },
  walker: { name: 'VANCE WALKER', hp: 2800, atk: 32, spd: 0, r: 22, boss: true, spr: 'walker', xp: 10, call: 'THE BLUE COATS CHARGE', add: 'gunner' },
  warden: { name: 'WARDEN-1', hp: 3000, atk: 34, spd: 0, r: 22, boss: true, spr: 'warden', xp: 10, call: 'WARDEN-1 CALLS THE DRONES', add: 'drone' },
  hound: { name: 'Seal Hound', hp: 40, atk: 8, spd: 56, r: 6, melee: true, spr: 'hound', xp: 1 },
  welder: { name: 'Dalton Welder', hp: 100, atk: 13, spd: 22, r: 7, range: 46, rate: 1.0, spr: 'welder', xp: 2 },
  judge: { name: 'THE JUDGE', hp: 2200, atk: 28, spd: 0, r: 22, boss: true, spr: 'judge', xp: 10, call: 'THE COURT IS IN SESSION', add: 'gunner' },
  sentinel: { name: 'HALCYON SENTINEL', hp: 3600, atk: 36, spd: 0, r: 22, boss: true, spr: 'sentinel', xp: 10, call: 'THE SENTINEL LAUNCHES ITS DRONES', add: 'drone', multi: 3 }
};

// ---------- gear ----------
const SETS = [
  { id: 'scrap', name: 'SCRAP PLATE', b2: '+12% ATK', b3: 'LAST STAND: -30% damage taken below 35% HP' },
  { id: 'rail', name: 'RAIL GEAR', b2: '+10% SPEED', b3: 'SCAVENGER: every kill repairs 4% HP' },
  { id: 'ring', name: 'ARK TECH', b2: '+25% ULT CHARGE', b3: 'COMBO CORE: each element combo gives +20% ult charge' }
];
// enemy traits (a third entry in a wave list, see story.js)
const TRAITS = {
  shield: { name: 'SHIELDED', desc: 'Carries an energy shield. Shock breaks it fast.' },
  regen: { name: 'REGEN', desc: 'Repairs itself. Burn or chill stops it.' },
  volatile: { name: 'VOLATILE', desc: 'Explodes when destroyed and hurts everything close by.' }
};
const RAR = [{ n: 'COMMON', c: '#c8c8c8', m: 1 }, { n: 'FINE', c: '#6adf6a', m: 1.3 }, { n: 'RARE', c: '#5aa0ff', m: 1.7 }, { n: 'EPIC', c: '#c070ff', m: 2.2 }];
const SLOT_MAIN = { weapon: 'atk', armor: 'hp', core: 'spd' };
const MOD_N = { atk: 'ATK', hp: 'HP', spd: 'SPEED', crit: 'CRIT' };
// A trait (fx) turns a piece from a number into a role. FINE and better pieces carry one; the role colors the tag on the icon.
const GEAR_FX = {
  siphon: { name: 'SIPHON', role: 'SURVIVE', col: '#6adf6a', desc: 'Every kill repairs this robot for 3% HP.' },
  aegis: { name: 'AEGIS', role: 'SURVIVE', col: '#6adf6a', desc: 'This robot takes 12% less damage.' },
  surge: { name: 'SURGE', role: 'ENERGY', col: '#80f0ff', desc: 'Ultimate charges 30% faster.' },
  primed: { name: 'PRIMED', role: 'ENERGY', col: '#80f0ff', desc: 'Starts every battle with 35% ult charge.' },
  amp: { name: 'COMBO AMP', role: 'COMBO', col: '#ff9a50', desc: 'Steam and Overload started by this robot hit 50% harder.' },
  finisher: { name: 'FINISHER', role: 'DAMAGE', col: '#ff6060', desc: '+40% damage to enemies under 30% HP.' },
  overcharge: { name: 'OVERCHARGE', role: 'ULT', col: '#ffd040', desc: 'This robot\'s ultimate is 20% stronger.' }
};
const FX_IDS = Object.keys(GEAR_FX);
// Milestones: clearing the stage opens a new way to play (the story map and result screen announce them)
const PERKS = {
  rush: { at: 's8', name: 'CRATE RUSH', text: 'Supply: spend Onyx to skip the wait for a crate.' },
  tune: { at: 's9', name: 'SET TUNING', text: 'Prep Room: change the set of a gear piece for Onyx.' },
  reforge: { at: 's11', name: 'REFORGE', text: 'Prep Room: reroll the trait of a gear piece for Gold.' },
  link: { at: 's12', name: 'ULT LINK', text: 'Ultimates can be upgraded up to level 8.' },
  pick3: { at: 's13', name: 'PICK OF THREE', text: 'Supply crates offer three pieces to choose from, and the top crate always holds gear.' }
};
function perkAt(stageId) { return Object.keys(PERKS).find(k => PERKS[k].at === stageId) || null; }
function levelCost(lvl) { return Math.round(40 * Math.pow(lvl, 1.35)); }
function genGear(idx, minRar) {
  const r = Math.random();
  let rar = r < 0.5 ? 0 : r < 0.8 ? 1 : r < 0.95 ? 2 : 3; rar = Math.max(rar, minRar || 0);
  const slot = pick(['weapon', 'armor', 'core']), set = pick(SETS).id, sc = (1 + idx * 0.1) * RAR[rar].m, mods = {};
  // the slot only leans toward its stat: any piece can be the HP, ATK or SPEED piece
  const main = Math.random() < 0.55 ? SLOT_MAIN[slot] : pick(['atk', 'hp', 'spd'].filter(k => k !== SLOT_MAIN[slot]));
  mods[main] = Math.round(rnd(6, 11) * sc);
  if (rar >= 1) mods[pick(['atk', 'hp', 'crit', 'spd'].filter(k => !mods[k]))] = Math.round(rnd(3, 7) * sc);
  if (rar >= 3) mods[pick(['atk', 'hp', 'crit', 'spd'].filter(k => !mods[k]))] = Math.round(rnd(3, 7) * sc);
  const base = { weapon: ['Rail Rifle', 'Pulse Cannon', 'Arc Blaster'], armor: ['Plating', 'Bulk Shell', 'Mesh Armor'], core: ['Power Core', 'Cooling Core', 'Logic Core'] }[slot];
  const g = { id: Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36), slot, set, rar, mods, name: pick(base) };
  if (rar >= 1) g.fx = pick(FX_IDS);
  return g;
}
function gearValue(g) { return 12 + g.rar * 18 + (g.fx ? 10 : 0); }

// ---------- missions ----------
const MISSIONS = [
  { id: 'win', text: 'Win 3 battles', goal: 3, gold: 120, onyx: 3 },
  { id: 'kill', text: 'Destroy 40 enemies', goal: 40, gold: 100, onyx: 2 },
  { id: 'combo', text: 'Trigger 4 element combos', goal: 4, gold: 150, onyx: 4 },
  { id: 'ult', text: 'Use 6 ultimates', goal: 6, gold: 100, onyx: 3 },
  { id: 'crate', text: 'Open 2 supply crates', goal: 2, gold: 80, onyx: 2 }
];
