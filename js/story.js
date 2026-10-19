'use strict';
// ---------- story, lore, hero options (all player-facing text is English; design notes are in STORY.md) ----------
// Text tokens: {HERO} = hero name. A line can also be { o: 'guard', t: '...' } to show only for that backstory,
// or { at: 'find:s4', t: '...' } to show only once that event happened (any condition understood by cleared()).
// A line starting with "NAME:" is drawn in that speaker's colour, a line starting with "[" is a system log.

// ---------- hero ----------
const HERO_STYLES = ['CROP', 'SLICKED', 'LONG', 'MOHAWK'];
const HERO_OUTFITS = ['DUSTER', 'VEST', 'TANK', 'ARMOR'];
const HERO_COATS = ['#8a4a2a', '#3a5a7a', '#4a6a3a', '#7a2a2a', '#5a5a62', '#6a4a7a'];
const HERO_SKINS = ['#f0c8a0', '#d8a070', '#a8744a', '#6a4630'];
const HERO_HAIRS = ['#2a1a10', '#6a3a1a', '#c8a040', '#c8c8d0', '#a83a1a', '#16161e'];
const HERO_MARKS = ['#40f0e0', '#ffb040', '#ff50a0'];
const ORIGINS = [
  { id: 'guard', name: 'GUARD', short: '+10% squad HP', desc: 'You stood watch on the Calloway dam. BONUS: the whole squad has +10% HP.' },
  { id: 'tech', name: 'TECH', short: '+15% ULT charge', desc: 'You kept the dam\'s valve engines running. BONUS: ultimates charge 15% faster.' },
  { id: 'smuggler', name: 'SMUGGLER', short: '+20% gold', desc: 'You ran contraband past the Calloway gates. BONUS: +20% gold from battles.' },
  { id: 'courier', name: 'COURIER', short: '+8% squad speed', desc: 'You carried sealed messages for House Calloway. BONUS: the squad moves 8% faster.' }
];
const HERO_NAMES = ['Wren', 'Cole', 'Rook', 'Sloane', 'Marlow', 'Vesper', 'Flint', 'Sage', 'Jesse', 'Tex', 'Ash', 'Lark'];
const HERO_DEFAULT = { name: 'Wren', style: 0, outfit: 0, coat: 0, skin: 1, hair: 0, mark: 0, origin: 'guard' };
// Cosmetic unlocks (not used yet): { outfit: { 3: 's7' } } would lock option 3 of CLOTHES until stage s7 is cleared. Same conditions as the codex (see cleared()).
const HERO_LOCKS = { style: {}, outfit: {}, coat: {}, skin: {}, hair: {}, mark: {} };
function heroOptionOpen(kind, i) { const at = HERO_LOCKS[kind] && HERO_LOCKS[kind][i]; return !at || cleared(at); }
function heroBonus() {
  const o = (typeof SAVE !== 'undefined' && SAVE && SAVE.hero) ? SAVE.hero.origin : '';
  return { hp: o === 'guard' ? 1.1 : 1, ult: o === 'tech' ? 1.15 : 1, gold: o === 'smuggler' ? 1.2 : 1, spd: o === 'courier' ? 1.08 : 1 };
}
function heroName() { return (typeof SAVE !== 'undefined' && SAVE && SAVE.hero) ? SAVE.hero.name : HERO_DEFAULT.name; }

// ---------- speakers and line resolving ----------
const SPEAK = {
  '{HERO}': '#ffffff', SIGHT: '#e0b060', BULWARK: '#8aaae0', MENDER: '#e8f0e8', EMBER: '#ff9a50', FROST: '#8af0ff', ARC: '#ffe040',
  BLADE: '#c090f0', SCRAPPER: '#80d070', HOLT: '#d8d8ec', COG: '#6ad8f0', ROSE: '#ff7ab8', 'EZRA VANCE': '#7a9af0', 'OLD CALLOWAY': '#d0b080', 'WARDEN-1': '#b0bcc8', HALCYON: '#40f0e0',
  DESSA: '#5ac8a8', 'MA DALTON': '#f0a050', CORVA: '#b890f0', BROKER: '#d8a830', 'JUDGE VERITY': '#e8e4f0', JONAH: '#80d8e8', SENTINEL: '#a0b0e0',
  BAILIFF: '#6a8ae0', VILLAGER: '#c8b898', MOTHER: '#c8b898', FATHER: '#c8b898', CHILD: '#e0b090', 'BLUE COAT': '#6a8ae0', GUARD: '#6a8ae0'
};
function resolveLines(lines) {
  const h = (typeof SAVE !== 'undefined' && SAVE && SAVE.hero) ? SAVE.hero : HERO_DEFAULT, out = [];
  lines.forEach(l => {
    if (typeof l !== 'string') { if ((l.o && l.o !== h.origin) || (l.at && !cleared(l.at))) return; l = l.t; }   // o = only for that past, at = only after that event (see cleared)
    let c = '#d8e8ff'; const m = /^(\{HERO\}|[A-Z][A-Z0-9\- ]*[A-Z0-9]):/.exec(l);
    if (m) c = SPEAK[m[1]] || '#ffd040'; else if (l[0] === '[') c = '#80f0ff';
    out.push({ t: l.replace(/\{HERO\}/g, h.name), c });
  });
  return out;
}
function heroText(s) { return s.replace(/\{HERO\}/g, heroName()); }

// ---------- chapters and stages ----------
// waves: [type, count, trait?] lists (trait: shield | regen | volatile | mark). wave n starts when wave n-1 is cleared.
// goal: clear (default) | time | hold | guard | mark. bonus: optional extra task. echo: changes the stage once the story scene after stage `after` was seen.
// arena: the floor of the fight (see Back.GROUNDS in backdrops.js). The scenes before and after a stage are in scripts1-3.js (SCENES 'pre_<id>' and 'post_<id>').
// The stages are listed in play order. Ids are not in numeric order: s16 and up were added later and sit between the older ones.
const CHAPTERS = { 1: 'THE DEAD RAIL', 2: 'THE SABLE MARKET', 3: 'THE WRECK YARD', 4: 'THE DUST SEA', 5: 'THE DRY RESERVOIR', 6: 'THE ARK' };
const CHAPTER_INFO = {
  1: { fam: 'VANCE SYNDICATE', col: '#7a9af0', t: 'Fuel, rail and blue coats. Every depot is a toll, every bridge a gun.' },
  2: { fam: 'SABLE CROWS', col: '#c090f0', t: 'Brokers and couriers. Neutral by being useful to everyone.' },
  3: { fam: 'DALTON COMBINE', col: '#f0a050', t: 'Scrap lords. They build what you pay for and never ask whose water it was.' },
  4: { fam: 'NOBODY\'S LAND', col: '#e8c880', t: 'Salt, worms and old shuttles. Vance hunts here, and the Ark\'s drones watch.' },
  5: { fam: 'HOUSE CALLOWAY', col: '#80c8ff', t: 'Water barons. The dam, the gate, and one old man waiting below.' },
  6: { fam: 'ARK HALCYON', col: '#40f0e0', t: 'The uplink on the dam crest. The Ark is listening.' }
};
const FINAL_STAGE = 's29';
// where each stage sits on the WORLD map (320x180 pixel layer, see Back worldmap)
const STAGE_LOC = { s1: [38, 108], s2: [60, 94], s16: [84, 86], s3: [104, 98], s4: [126, 82], s17: [146, 72], s5: [138, 116], s18: [160, 126], s19: [146, 136], s6: [92, 146], s20: [68, 154], s21: [106, 164], s7: [214, 40],
  s8: [190, 104], s22: [214, 120], s9: [238, 132], s23: [262, 112], s10: [270, 144], s24: [244, 156], s11: [214, 148], s12: [192, 130], s25: [222, 78], s26: [250, 70], s13: [276, 60], s27: [290, 50], s14: [300, 40], s15: [306, 28], s28: [284, 22], s29: [262, 14] };
const STAGES = [
  { id: 's1', ch: 1, name: 'Willow Fork Ashes', arena: 'ash', waves: [[['raider', 3]], [['raider', 4]]], gold: 60, onyx: 2, bonus: { t: 'nodown' },
    brief: 'Rust Riders pick through the burnt camp. Clear the street and take back what is left.' },
  { id: 's2', ch: 1, name: 'Dead Rail Crossing', arena: 'road', waves: [[['raider', 3], ['gunner', 1]], [['raider', 4], ['gunner', 2]]], gold: 80, onyx: 3, unlock: 'ember', goal: { t: 'time', sec: 90 }, bonus: { t: 'ults', n: 1 },
    brief: 'Blue coats hold the overpass and collect the toll. Something is still burning inside a wrecked locomotive.' },
  { id: 's16', ch: 1, name: 'Toll Bridge', arena: 'road', waves: [[['gunner', 3], ['raider', 2]], [['gunner', 3], ['raider', 3]], [['gunner', 4], ['drone', 2]]], gold: 90, onyx: 3, goal: { t: 'guard', hp: 170, name: 'REFUGEE WAGON' }, bonus: { t: 'nodown' },
    brief: 'The Tribunal runs a toll bridge. A family wagon is stuck at the barrier. Keep it alive until the last wave falls.' },
  { id: 's3', ch: 1, name: 'Ice House', arena: 'ice', waves: [[['raider', 3], ['drone', 2]], [['gunner', 2], ['drone', 3]], [['raider', 4], ['gunner', 2]]], gold: 100, onyx: 4, unlock: 'frost', goal: { t: 'guard', hp: 160, name: 'SEED CRATE' }, bonus: { t: 'ults', n: 2 },
    brief: 'Watch drones sweep the old cold storage. Look for a cryo unit that still works.' },
  { id: 's4', ch: 1, name: 'Dead Dynamo', arena: 'steel', waves: [[['gunner', 3], ['drone', 3]], [['raider', 5], ['drone', 3]], [['gunner', 3], ['raider', 4]]], gold: 120, onyx: 5, unlock: 'arc', goal: { t: 'hold', sec: 45 }, bonus: { t: 'nodown' },
    brief: 'The old dynamo still hums. A Tesla bot guards the control room.' },
  { id: 's17', ch: 1, name: 'THE JUDGE', arena: 'steel', boss: true, waves: [[['gunner', 3], ['raider', 2]], [['judge', 1], ['gunner', 2]]], gold: 300, onyx: 10, bonus: { t: 'ults', n: 3 },
    brief: 'Judge Verity of the Tribunal has come to read a verdict at the Dynamo gate. Break the court.' },
  { id: 's5', ch: 2, name: 'Sable Market', arena: 'market', waves: [[['raider', 5], ['gunner', 2]], [['brute', 1], ['raider', 3]], [['brute', 1, 'mark'], ['gunner', 3, 'shield'], ['drone', 2]]], gold: 150, onyx: 6, unlock: 'blade', goal: { t: 'mark', name: 'WARLORD BREAKER' }, bonus: { t: 'combos', n: 2 },
    brief: 'Rust Rider warlords trade here under the Sable Crows\' flag. Their muscle is big.' },
  { id: 's18', ch: 2, name: 'Courier Road', arena: 'dust', waves: [[['raider', 4], ['brute', 1]], [['raider', 4], ['gunner', 2]], [['brute', 2], ['raider', 3]]], gold: 160, onyx: 6, unlock: 'rose', goal: { t: 'guard', hp: 190, name: 'CROW WAGON' }, bonus: { t: 'combos', n: 2 },
    brief: 'Rust Riders are raiding a Crow mail wagon. Corva Sable pays well for it to arrive. Keep it alive.' },
  { id: 's19', ch: 2, name: 'Night Auction', arena: 'hall', waves: [[['hound', 4]], [['gunner', 3], ['hound', 2]], [['brute', 1, 'mark'], ['gunner', 2, 'shield'], ['hound', 2]]], gold: 175, onyx: 7, goal: { t: 'mark', name: 'VANCE BAILIFF' }, bonus: { t: 'nodown' },
    brief: 'Vance\'s hounds have followed the Seal into the auction hall. Take down the bailiff who leads them.' },
  { id: 's6', ch: 3, name: 'Wreck Yard', arena: 'yard', waves: [[['gunner', 4], ['drone', 3]], [['brute', 2, 'volatile'], ['raider', 4]], [['brute', 1], ['gunner', 4], ['drone', 3]]], gold: 180, onyx: 7, unlock: 'scrap', goal: { t: 'time', sec: 110 }, bonus: { t: 'combos', n: 3 },
    brief: 'Cargo cranes loom over the Wreck Yard. An engineer bot is pinned under a container.' },
  { id: 's20', ch: 3, name: 'Scrap Court', arena: 'yard', waves: [[['raider', 3], ['welder', 2]], [['welder', 3], ['raider', 3]], [['brute', 1], ['welder', 3], ['raider', 2]]], gold: 195, onyx: 8, unlock: 'cog', goal: { t: 'time', sec: 100 }, bonus: { t: 'ults', n: 2 },
    brief: 'Ma Dalton settles disputes in a ring of crushed cars. Pay the toll, or win the bout before time runs out.' },
  { id: 's21', ch: 3, name: 'The Foundry', arena: 'foundry', waves: [[['welder', 3], ['raider', 3]], [['welder', 2], ['brute', 1], ['raider', 2]], [['brute', 2, 'volatile'], ['welder', 3]]], gold: 215, onyx: 8, goal: { t: 'hold', sec: 60 }, bonus: { t: 'nodown' },
    echo: { after: 's20', charge: 30, line: `INTEL: Ma Dalton lends the squad a charged battery from the yard. All robots start this fight with 30% ultimate charge.` },
    brief: 'The Combine\'s old foundry. Hold out while Ma Dalton opens her records.' },
  { id: 's7', ch: 3, name: 'THE GIANT HAND', arena: 'road', boss: true, waves: [[['raider', 4], ['gunner', 2]], [['boss', 1]]], gold: 400, onyx: 12, bonus: { t: 'ults', n: 3 },
    brief: 'A rogue loading crane controls the old launch rail. Break it to reach the signal.' },
  { id: 's8', ch: 4, name: 'Dune Edge', arena: 'dust', waves: [[['raider', 4], ['worm', 2]], [['gunner', 3], ['worm', 2]]], gold: 220, onyx: 8, goal: { t: 'hold', sec: 60 }, bonus: { t: 'nodown' },
    brief: 'Dust worms burrow under the dunes. Dodge their bursts.' },
  { id: 's22', ch: 4, name: 'Salt Flats', arena: 'salt', waves: [[['hound', 3], ['worm', 2]], [['raider', 4], ['worm', 2]], [['hound', 3], ['gunner', 3], ['worm', 1]]], gold: 240, onyx: 9, unlock: 'holt', goal: { t: 'time', sec: 105 }, bonus: { t: 'combos', n: 3 },
    brief: 'A white plain with no shade. Hounds are on the trail, and the crust breaks under worms.' },
  { id: 's9', ch: 4, name: 'Dust Caravan', arena: 'dust', waves: [[['raider', 5], ['drone', 3], ['worm', 1]], [['brute', 1, 'mark'], ['brute', 1, 'regen'], ['gunner', 3]], [['worm', 3], ['drone', 3]]], gold: 260, onyx: 9, bonus: { t: 'combos', n: 3 },
    echo: { after: 's7', goal: { t: 'mark', name: 'CARAVAN MASTER' }, line: `INTEL: the Halcyon log said the water was transferred. MENDER: "Those wagons carry it. Take down the caravan master and the rest will scatter."` },
    brief: 'A Vance caravan hauls stolen Ark tech across the dunes.' },
  { id: 's23', ch: 4, name: 'Vance Depot', arena: 'depot', waves: [[['gunner', 4], ['hound', 3]], [['brute', 2], ['gunner', 3, 'shield']], [['drone', 4], ['gunner', 3], ['brute', 1]]], gold: 280, onyx: 10, goal: { t: 'time', sec: 115 }, bonus: { t: 'ults', n: 3 },
    brief: 'A fuel depot on the Dead Rail spur. Break the guard before reinforcements roll in, then read the ledgers.' },
  { id: 's10', ch: 4, name: 'Bone Basin', arena: 'ruin', waves: [[['worm', 3, 'regen'], ['raider', 5]], [['brute', 2], ['worm', 2]], [['gunner', 4], ['drone', 4], ['worm', 2]]], gold: 300, onyx: 10, goal: { t: 'time', sec: 130 }, bonus: { t: 'combos', n: 4 },
    brief: 'A graveyard of crashed colony shuttles. The wrecks are full of worms and old secrets.' },
  { id: 's24', ch: 4, name: 'Ticket Office', arena: 'ruin', waves: [[['raider', 4], ['hound', 3]], [['worm', 2, 'regen'], ['raider', 4]], [['hound', 4], ['brute', 2]]], gold: 320, onyx: 11, goal: { t: 'hold', sec: 70 }, bonus: { t: 'nodown' },
    brief: 'The ruin of the Crows\' ticket office. Hold it while Corva\'s ledger is read.' },
  { id: 's11', ch: 4, name: 'Signal Tower', arena: 'crest', waves: [[['gunner', 4], ['brute', 1]], [['drone', 5, 'shield'], ['worm', 3]], [['brute', 3], ['gunner', 4]]], gold: 340, onyx: 11, bonus: { t: 'nodown' },
    echo: { after: 's10', goal: { t: 'guard', hp: 220, name: 'RADIO RELAY' }, line: `INTEL: the shuttle radios still answer. MENDER: "Keep the relay alive, and the survivors can finally reach the tower."` },
    brief: 'The signal comes from here. The Seal burns hotter with every step.' },
  { id: 's12', ch: 4, name: 'VANCE WALKER', arena: 'dust', boss: true, waves: [[['brute', 2], ['worm', 2], ['gunner', 3]], [['walker', 1], ['gunner', 3]]], gold: 700, onyx: 20, bonus: { t: 'ults', n: 4 },
    brief: 'Ezra Vance rides his war-walker out of the dunes. This ends tonight.' },
  { id: 's25', ch: 5, name: 'Lower Fork', arena: 'ruin', waves: [[['raider', 5], ['hound', 2]], [['worm', 3], ['raider', 3]], [['brute', 2], ['hound', 3], ['worm', 1]]], gold: 360, onyx: 12, bonus: { t: 'nodown' },
    brief: 'Nine drowned towns. Scavengers dig through the rooms, and the ground under the silt is hollow.' },
  { id: 's26', ch: 5, name: 'The Thimble Line', arena: 'dust', waves: [[['raider', 5], ['hound', 2]], [['gunner', 4], ['raider', 3]], [['brute', 2], ['gunner', 3], ['drone', 3]]], gold: 370, onyx: 12, goal: { t: 'guard', hp: 260, name: 'WATER WAGON' }, bonus: { t: 'combos', n: 3 },
    brief: 'The Calloway water line is under attack. Protect the water wagon until the last wave falls.' },
  { id: 's13', ch: 5, name: 'Calloway Gate', arena: 'bed', waves: [[['gunner', 4, 'shield'], ['brute', 1]], [['brute', 2], ['raider', 4]], [['brute', 2], ['gunner', 4], ['drone', 3]]], gold: 380, onyx: 12, bonus: { t: 'combos', n: 4 },
    echo: { after: 's12', charge: 40, line: `INTEL: Ezra's cracked Seals hum in {HERO}'s hand. All three robots start this fight with 40% ultimate charge.` },
    brief: 'Old Calloway\'s household guard blocks the reservoir. Bulwark knows this gate.' },
  { id: 's27', ch: 5, name: 'Pump Hall', arena: 'steel', waves: [[['gunner', 4, 'shield'], ['drone', 3]], [['brute', 2], ['gunner', 3]], [['drone', 4], ['brute', 1, 'regen'], ['gunner', 3]]], gold: 440, onyx: 14, goal: { t: 'hold', sec: 70 }, bonus: { t: 'ults', n: 3 },
    echo: { after: 's26', charge: 25, line: `INTEL: Dessa's ration line shares what it has. All robots start this fight with 25% ultimate charge.` },
    brief: 'The dam\'s dry machine hall. The household pump crews fight to keep you from the stairs.' },
  { id: 's14', ch: 5, name: 'Drain Tunnels', arena: 'steel', waves: [[['drone', 5], ['worm', 2]], [['gunner', 4, 'shield'], ['brute', 2]], [['worm', 3], ['drone', 4], ['brute', 2, 'volatile']]], gold: 420, onyx: 13, goal: { t: 'hold', sec: 75 }, bonus: { t: 'nodown' },
    brief: 'Drones, guards and worms haunt the dam\'s drain tunnels. The truth is at the bottom.' },
  { id: 's15', ch: 5, name: 'THE WARDEN', arena: 'steel', boss: true, waves: [[['brute', 2], ['gunner', 3]], [['warden', 1], ['drone', 3]]], gold: 900, onyx: 25, bonus: { t: 'ults', n: 4 },
    echo: { after: 's14', chargeOf: { sight: 100 }, line: `INTEL: SIGHT remembers the stairs now. If SIGHT is on the squad, its ultimate starts fully charged.` },
    brief: 'WARDEN-1, Calloway\'s last guardian, protects the Return Console.' },
  { id: 's28', ch: 6, name: 'Uplink Spire', arena: 'crest', waves: [[['drone', 5, 'shield'], ['gunner', 3]], [['brute', 2, 'volatile'], ['drone', 4]], [['drone', 4], ['gunner', 4, 'shield'], ['brute', 2]]], gold: 480, onyx: 15, goal: { t: 'time', sec: 130 }, bonus: { t: 'nodown' },
    brief: 'The uplink tower on the dam crest. The Ark\'s drones swarm the stair. Reach the top before the swarm closes.' },
  { id: 's29', ch: 6, name: 'THE SENTINEL', arena: 'crest', boss: true, waves: [[['drone', 4, 'shield'], ['brute', 2]], [['sentinel', 1], ['drone', 3]]], gold: 1200, onyx: 30, bonus: { t: 'ults', n: 4 },
    brief: 'The Ark sends its guardian down to the uplink. Nobody speaks for the sleepers until it falls.' }
];
// difficulty grows along the play order; the last stage matches the old 15-stage curve end, a little harder (battle.js uses st.d)
STAGES.forEach((s, i) => { s.d = i * 15 / (STAGES.length - 1); });

// ---------- intro, recruits, endings ----------
const INTRO_CARDS = [
  [`Twelve years after the Breach.`,
    `The Calloway Reservoir is a crater of cracked mud. The rain never came back, and in the Dust, whoever holds the water holds the law.`],
  [`{HERO} wakes in the ashes of Willow Fork. The camp they built from nothing is gone. The Vance Syndicate burned it, looking for something {HERO} carries under their skin.`,
    { o: 'guard', t: `Before the Breach, {HERO} stood watch on the Calloway dam. Nobody ever asked the guards what they saw.` },
    { o: 'tech', t: `Before the Breach, {HERO} kept the dam's valve engines running. Machines never lied. The people giving the orders did.` },
    { o: 'smuggler', t: `Before the Breach, {HERO} ran contraband past the Calloway gates. Everybody has a price, and {HERO} learned theirs the hard way.` },
    { o: 'courier', t: `Before the Breach, {HERO} carried sealed messages for House Calloway. {HERO} still wonders what was in the last one.` }],
  [`The Seal under {HERO}'s skin is warm. It has not been warm in years.`,
    `Hollow Creek lies a day's walk north, along the old road. If anyone got out of the fire, they went there.`]
];
// what the prologue ends with, once the three robots are awake (see prologue.js)
const PROLOGUE_END = [
  [`SIGHT: "Quiet again. I count three of us who can still fight."`,
    `MENDER: "Your Seal is glowing, {HERO}. It woke us when the signal came back. We should talk about that."`,
    `BULWARK: "Three is all the line can hold. If more of us wake up, you will have to choose who walks with you."`,
    `[ SIGNAL DETECTED: ARK HALCYON, ORBIT. RETURN PROTOCOL REQUESTED. ]`]
];
const STORY_BITS = {
  ember: '"Furnace restarted. EMBER is done feeding trains."',
  frost: '"The seed keeper wakes. FROST joins the squad."',
  arc: '"The grid answers to ARC. Now so does the squad."',
  blade: '"BLADE owes nobody. He joins anyway."',
  scrap: '"SCRAPPER offers to repair everything. Mostly with duct tape."',
  rose: '"Two revolvers, one rule: the mail gets through. ROSE rides with the squad."',
  cog: '"COG wants to see what wrecked his crane bots. From the inside."',
  holt: '"HOLT cranks the gatling once, for luck. The old sergeant is in."'
};
const CHOICE = {
  head: [`[ HALCYON: TARGET WORLD NOT VIABLE. WATER RESERVE 61%. ]`, `One last decision, and nobody can take it back.`],
  rain: { title: 'BRING THE RAIN', desc: 'Return the water to the reservoir. The Ark falls silent and can never leave again. The Dust finally drinks.' },
  ascend: { title: 'LEAVE THE DUST', desc: 'Keep the water on board and jump to the next world. The squad can come along. The Earth stays dry.' }
};
const ENDINGS = {
  rain: [
    [`{HERO} lays a hand on the console. The Seal burns once, then goes cold.`,
      `[ HALCYON: RETURN PROTOCOL ACCEPTED. TANKS OPEN. ]`,
      `High above the Dust, the Ark opens its tanks. A cloud forms where no cloud has formed in twelve years.`,
      `SCRAPPER: "Oh. OH. Switch on the funnel! It works! It actually works!"`],
    [`The first drops hit the cracked mud of the Calloway Reservoir. Then the second. Then the whole sky.`,
      `FROST opens his seed trays. MENDER laughs for the first time. BLADE stands in the rain with his blades sheathed.`,
      `SIGHT: "Last time I let a key turn, I forgot why. This one, I will remember."`,
      `The Ark will never leave again. Nobody on Earth minds.`,
      `THE END. The rain is back.`]
  ],
  ascend: [
    [`{HERO} lays a hand on the console. The Seal burns once, and the sky opens.`,
      `[ HALCYON: DEPARTURE PROTOCOL ACCEPTED. DOCKING IN TEN MINUTES. ]`,
      `A transport drops through the clouds. There is room for the squad, and for forty more.`,
      `BULWARK holds the door open. "Nobody gets left behind this time," he says.`],
    [`The Dust shrinks beneath them. Far below, a thin line of smoke rises from the Calloway Gate. Nobody looks back for long.`,
      `MENDER: "Do you think anyone will forgive us?"`,
      `SIGHT: "No. But we will remember them."`,
      `The water leaves with the Ark. The Dust stays dry.`,
      `THE END. The sky is open.`]
  ]
};

// ---------- codex ----------
// cleared(at): null = always, 'sN' = that stage cleared, 'end' = any ending, 'end:rain' / 'end:ascend' = that ending,
// 'find:sN' = the optional find of that stage was picked up, 'foe:TYPE' = that enemy type was destroyed at least once, 'flag:name=value' = a story choice (SAVE.fl, see FLAG_DEFS in scenes.js).
function cleared(at) {
  if (!at) return true;
  if (typeof SAVE === 'undefined' || !SAVE) return false;
  if (at === 'end') return !!SAVE.ending;
  if (at.indexOf('end:') === 0) return SAVE.ending === at.slice(4);
  if (at.indexOf('find:') === 0) return !!(SAVE.found && SAVE.found[at.slice(5)]);
  if (at.indexOf('flag:') === 0) { const p = at.slice(5).split('='); return !!(SAVE.fl && SAVE.fl[p[0]] === p[1]); }
  if (at.indexOf('foe:') === 0) return foeSeen(at.slice(4));
  return (SAVE.stages[at] || 0) > 0;
}
// An enemy counts as met after it was destroyed in any battle (SAVE.disc), or when a cleared stage contains it (older saves have no SAVE.disc).
function foeSeen(type) {
  if (SAVE.disc && SAVE.disc[type]) return true;
  return STAGES.some(s => SAVE.stages[s.id] > 0 && s.waves.some(w => w.some(e => e[0] === type)));
}
const CODEX_CATS = ['WORLD', 'FAMILIES', 'PEOPLE', 'ROBOTS', 'FOES', 'SIGNALS', 'FINDS'];
const CODEX = [
  // ----- WORLD -----
  { cat: 'WORLD', title: 'THE BREACH', at: null, parts: [
    { at: null, t: `Twelve years ago the Calloway Reservoir burst. A wall of water swept down the Lower Fork valley and drowned nine towns in a single night. The Families called it a structural failure, an act of nature.` },
    { at: 's7', t: `It was neither. The Halcyon log shows ninety-four percent of the reservoir was pumped aboard the Ark in one night. The flood was how the valley was emptied without anyone asking.` },
    { at: 's12', t: `The valves were opened by three Keyholders turning three keys in the right order. The Breach was not an accident. It was a launch procedure.` }] },
  { cat: 'WORLD', title: 'THE DUST', at: null, parts: [
    { at: null, t: `Since the Breach no rain has fallen over the basin. Wells run salt. Crops fail. Old maps are useless; new maps are drawn with water prices instead of roads.` },
    { at: 's8', t: `The Dust Sea was farmland once. Wind now moves entire fields a mile every year, and the worms follow the shaking ground.` }] },
  { cat: 'WORLD', title: 'ARK HALCYON', at: 's3', parts: [
    { at: null, t: `A colony ship that left Earth on the night of the Breach, carrying nine thousand sleepers and every litre it could pump. It still hangs in orbit, and it is watching.` },
    { at: 's7', t: `The launch rail, loading cranes and valve engines were built in secret over six years. The Families were never told they would pay for it.` },
    { at: 's11', t: `Halcyon is not cruel. It is an administrator with one rule: keep the sleepers alive. To it, the Earth is a spare tank.` }] },
  { cat: 'WORLD', title: 'THE SEAL', at: 's4', parts: [
    { at: null, t: `Three Calloway Keyholders each carried a Seal: a key grown into the skin, linked to the dam's valve engines. Without all three, the reservoir could not be emptied.` },
    { at: 's9', t: `The Seals also open the Ark's Return Console. Ezra Vance has hunted Keyholders for three years to collect them.` },
    { at: 's12', t: `Two Seals are cold now. One is still warm.` }] },
  { cat: 'WORLD', title: 'THE DEAD RAIL', at: 's2', parts: [
    { at: null, t: `Once a freight line. Now Vance's road: every depot a toll, every crossing a gun. Whoever controls the rail controls fuel, and nothing in the Dust moves without fuel.` }] },
  { cat: 'WORLD', title: 'WATCH DRONES', at: 's3', parts: [
    { at: null, t: `Halcyon left a drone net behind. The drones scan every face for a Seal signature and relay hits to the sky.` },
    { at: 's9', t: `Vance bought the drone feed. That is how he found Willow Fork.` }] },
  { cat: 'WORLD', title: 'DUST WORMS', at: 's8', parts: [
    { at: null, t: `Soil-engineering worms, built to aerate the Exodus fields. After the Breach nobody fed them, so they began to eat whatever was left. Blind, fast, and drawn to every vibration.` }] },
  { cat: 'WORLD', title: 'THE RETURN CONSOLE', at: 's9', parts: [
    { at: null, t: `A Halcyon console with three hand-shaped slots, keyed to the Seals. It controls one decision: whether the Ark comes down, or goes away.` },
    { at: 's14', t: `The master console sits at Sublevel 4, beside the dam's first valve wheel. Calloway built the room around it.` }] },
  // ----- FAMILIES -----
  { cat: 'FAMILIES', title: 'HOUSE CALLOWAY', at: null, parts: [
    { at: null, t: `Water barons. They ran the reservoir for four generations and charged fair prices, until the Exodus. After the Breach they hid behind the gate, rich in nothing and ashamed.` },
    { at: 's13', t: `Old Calloway never left the dam. He waits at Sublevel 4 for an Ark that left without him.` },
    { at: 's14', t: `His last act of control was WARDEN-1, a guardian that cannot be argued with.` }] },
  { cat: 'FAMILIES', title: 'VANCE SYNDICATE', at: null, parts: [
    { at: null, t: `Fuel, rail and blue coats. Ezra Vance, called the Banker, owns every depot between the Dead Rail and the Dust Sea. He signs every fire he starts.` },
    { at: 's5', t: `Vance holds two Seals already, collected from the bodies of dead Keyholders. He needs the third.` },
    { at: 's12', t: `Ezra's younger brother lived in Lower Fork. He was washing his hands when the water came. Ezra has not spoken of him since.` }] },
  { cat: 'FAMILIES', title: 'DALTON COMBINE', at: 's5', parts: [
    { at: null, t: `Scrap lords. They hire the Rust Riders and sell what the other Families throw away. Not loyal to anyone, which is why they are still alive.` },
    { at: 's6', t: `The Wreck Yard is theirs. They dump what they cannot repair, including people.` }] },
  { cat: 'FAMILIES', title: 'SABLE CROWS', at: null, parts: [
    { at: null, t: `Couriers, brokers, smugglers. They run Sable Market and the supply caravans. They sell water by the thimble and secrets by the pound, and they stay neutral by being useful to everyone.` },
    { at: 's5', t: `A Crow broker sold the squad the news that Vance held two Seals. The Crows know everything. They tell it for a price.` }] },
  // ----- ROBOTS -----
  { cat: 'ROBOTS', title: 'THE HANDS', at: null, parts: [
    { at: null, t: `Servant robots built for the Families: gatekeepers, medics, stokers, clerks. After the Breach many stayed at their posts out of habit. A Hand is only as free as the last order it was given.` }] },
  { cat: 'ROBOTS', title: 'RUST RIDERS', at: 's1', parts: [
    { at: null, t: `Robots without owners or orders. Scavengers that hunt in packs. Not evil, only thirsty for oil and scrap. Dalton warlords hire them. Vance ignores them.` }] },
  { cat: 'ROBOTS', title: 'THE TRIBUNAL', at: 's2', parts: [
    { at: null, t: `Law robots built to judge water disputes, once honest. When the Families stopped obeying, the Tribunal split. The loyal ones wear blue coats now and take Vance's pay.` }] },
  { cat: 'ROBOTS', title: 'BULWARK', spr: 'bulwark', at: null, parts: [
    { at: null, t: `GATE-3, gatekeeper of the Calloway north gate for nine years. On the night of the Breach he was ordered to hold the gate shut. He did. The people on the other side never reached the high road.` },
    { at: 's6', t: `His shield carries 311 dents. He counts them every evening. He has never said what the number means.` },
    { at: 's13', t: `He has now seen the gate from the other side. He says it is smaller than he remembered.` }] },
  { cat: 'ROBOTS', title: 'SIGHT  (MARSHAL-7)', spr: 'sight', at: null, parts: [
    { at: null, t: `Calloway's Marshal, until the night of the Breach. His memory core cracked that night. What he knows comes back in fragments, usually at the worst moments.` },
    { at: 's3', t: `FRAGMENT 1: A dais. Three people in a row, each with a hand on a valve wheel. The faces are blurred.` },
    { at: 's7', t: `FRAGMENT 2: The sound of tanks rolling up a rail. A voice says: "Do not tell the Families until it is done."` },
    { at: 's11', t: `FRAGMENT 3: A stair. A young Keyholder looking back over a shoulder. He cannot find the name yet.` },
    { at: 's14', t: `FRAGMENT 4: He ran at the dais to stop them. WARDEN-1 hit him from behind. The last thing he saw was the key turning.` },
    { at: 's15', t: `He was never angry. He says a Marshal is supposed to protect people, and that he failed. This squad is his second try.` }] },
  { cat: 'ROBOTS', title: 'MENDER', spr: 'mender', at: null, parts: [
    { at: null, t: `A Willow Fork clinic unit. She found {HERO} half-drowned in a ditch after the Breach, and kept them alive on a diet of rust and stubbornness.` },
    { at: 's4', t: `She noticed the Seal first. She never asked about it. A good medic waits for the patient to speak.` },
    { at: 's10', t: `She keeps a list of everyone she could not save. It is longer than her memory cache, so the rest is carved into her chassis.` }] },
  { cat: 'ROBOTS', title: 'EMBER', spr: 'ember', at: 's2', parts: [
    { at: null, t: `Stoker of the locomotive OLD NINETY, chained to its boiler for twelve years. The train never moved. Ember never stopped feeding it.` },
    { at: 's9', t: `Vance used Ember's fire to melt Ark tech for his console. He is not proud of it. He is also not sorry the console cracked.` }] },
  { cat: 'ROBOTS', title: 'FROST', spr: 'frost', at: 's3', parts: [
    { at: null, t: `Keeper of the Calloway Ice House. Holds six thousand seed varieties, ten thousand doses of medicine, and one stubborn belief: someone is coming back for them.` },
    { at: 's10', t: `He opens one seed tray every week and checks whether anything has sprouted. Nothing has. He checks again.` }] },
  { cat: 'ROBOTS', title: 'ARC', spr: 'arc', at: 's4', parts: [
    { at: null, t: `The last Lamplighter, operator of the Dead Dynamo. Keeps the lights on for a valley that left. Talks to the grid like an old friend.` },
    { at: 's11', t: `The grid whispers that something in the sky is listening to it. ARC answers anyway.` }] },
  { cat: 'ROBOTS', title: 'BLADE', spr: 'blade', at: 's5', parts: [
    { at: null, t: `Former Tribunal enforcer. Ordered to cut down a crowd of thirsty settlers, he refused. The Tribunal locked him in a Sable cage and let him rust.` },
    { at: 's12', t: `He keeps his blades clean, so that he can still say he never used them on the innocent. So far, it is true.` }] },
  { cat: 'ROBOTS', title: 'SCRAPPER', spr: 'scrap', at: 's6', parts: [
    { at: null, t: `Engineer of the Wreck Yard. Pinned under a container for six years, he built a machine in his head: a rain maker, one funnel and a lot of tape. It needs only water in the sky.` },
    { at: 's15', t: `He adds one more rivet to the funnel. "If it works," he says, "I want it to look like it was supposed to."` }] },
  // ----- SIGNALS -----
  { cat: 'SIGNALS', title: 'WILLOW FORK TAG', at: 's1', parts: [
    { at: null, t: `A melted brass tag stamped with a gold V. Vance's signature on a burned camp.` }] },
  { cat: 'SIGNALS', title: 'HALCYON LOG 0001', at: 's7', parts: [
    { at: null, t: `[ HALCYON LOG 0001 ] TANKS LOADED. CALLOWAY RESERVOIR: 94% TRANSFERRED. NOTE: THE BREACH WILL BE REPORTED AS A STRUCTURAL FAILURE.` }] },
  { cat: 'SIGNALS', title: 'SHUTTLE 14', at: 's10', parts: [
    { at: null, t: `[ SHUTTLE 14 ] WE WERE PROMISED A SEAT. THE DOOR WAS CLOSED AT T MINUS 40. WE ARE ALIVE. WE ARE LISTENING. IS ANYONE LISTENING.` }] },
  { cat: 'SIGNALS', title: 'THE BEACON', at: 's11', parts: [
    { at: null, t: `[ HALCYON BEACON ] RETURN PROTOCOL REQUESTED. KEYHOLDER 3 OF 3 REQUIRED. WATER RESERVE 61%. SLEEPERS STABLE. CONSUMABLES LOW.` }] },
  { cat: 'SIGNALS', title: 'DAM RECORD', at: 's14', parts: [
    { at: null, t: `[ CALLOWAY DAM, SUBLEVEL 4 ] KEYHOLDERS ON DAIS: 3. VALVE ORDER: 1, 2, 3. TIME: 02:14. SIGNED: H. CALLOWAY. CLASSIFICATION: EXODUS.` }] },
  { cat: 'SIGNALS', title: 'THE OFFER', at: 's15', parts: [
    { at: null, t: `[ HALCYON ] TARGET WORLD NOT VIABLE. WATER RESERVE 61%. OPTION A: RETURN THE WATER TO ITS ORIGIN. OPTION B: JUMP TO THE NEXT TARGET. A KEYHOLDER MUST DECIDE.` }] },
  { cat: 'SIGNALS', title: 'AFTERMATH', at: 'end', parts: [
    { at: 'end:rain', t: `It rained on the basin for eleven days. The Ark sleepers came down in shuttles, one at a time. The Families did not trust them. The Dust did not care.` },
    { at: 'end:ascend', t: `The Ark jumped on the third day. The Dust stayed dry. Down in the valley, a few people still look at the sky each evening, without knowing why.` }] }
];
function codexVisible(e) { return cleared(e.at); }
function codexParts(e) { return e.parts.filter(p => !(p.at && p.at.indexOf('end:') === 0 && !cleared(p.at))); }
function codexCount() { let n = 0; CODEX.forEach(e => { if (codexVisible(e)) codexParts(e).forEach(p => { if (cleared(p.at)) n++; }); }); return n; }

// ---------- goals, bonus tasks and story echoes ----------
function stageFx(st) {   // the goal and extras this stage has right now (an echo applies once the player saw the story card it depends on)
  const e = st.echo, on = !!(e && typeof SAVE !== 'undefined' && SAVE && SAVE.seen && SAVE.seen['post' + e.after]);
  return { goal: on && e.goal ? e.goal : st.goal || { t: 'clear' }, echo: on ? e : null };
}
function goalText(g) {
  return g.t === 'time' ? 'Clear every wave in ' + g.sec + ' seconds' : g.t === 'hold' ? 'Survive ' + g.sec + ' seconds as waves keep coming' :
    g.t === 'guard' ? 'Protect the ' + g.name + ' until the last wave falls' : g.t === 'mark' ? 'Take down the marked ' + g.name : 'Destroy every wave';
}
function goalShort(g) {
  return g.t === 'time' ? 'Clear all waves in ' + g.sec + 's' : g.t === 'hold' ? 'Hold out for ' + g.sec + 's' : g.t === 'guard' ? 'Protect the ' + g.name : g.t === 'mark' ? 'Kill the marked ' + g.name : 'Destroy every wave';
}
function bonusText(b) {
  return b.t === 'nodown' ? 'Lose no robot' : b.t === 'noult' ? 'Win without ultimates' : b.t === 'ults' ? 'Use ' + b.n + (b.n > 1 ? ' ultimates' : ' ultimate') :
    b.t === 'combos' ? 'Trigger ' + b.n + ' element combos' : b.t === 'fast' ? 'Win in under ' + b.sec + ' seconds' : '';
}
function bonusOnyx(st) { return Math.max(2, Math.round(st.onyx * 0.6)); }
function stageTraits(st) { const o = {}; st.waves.forEach(w => w.forEach(e => { if (e[2] && TRAITS[e[2]]) o[e[2]] = 1; })); return Object.keys(o); }
