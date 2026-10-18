'use strict';
// ---------- extra lore that is tied to play: optional finds, enemy field notes, codex links, hub chatter ----------
// Loaded after story.js. Everything here only adds to the existing story; nothing is needed to follow it.

// ---------- optional finds (one glinting object per regular stage; a robot has to walk onto it) ----------
// x, y are arena coordinates (the 320x180 pixel layer).
const FINDS = {
  s1: { x: 70, y: 140, title: 'OIL RECEIPT', t: `A charred receipt for forty barrels of lamp oil, charged to Syndicate account V-17. Delivered to Willow Fork on the morning it burned.`, see: ['VANCE SYNDICATE', 'WILLOW FORK TAG'] },
  s2: { x: 150, y: 66, title: 'TOLL LEDGER', t: `A toll ledger nailed to the overpass rail. Every wagon of the last twelve years is listed. Nobody ever paid in anything but water.`, see: ['THE DEAD RAIL', 'BLUE COAT'] },
  s3: { x: 96, y: 140, title: 'SEED TAG', t: `A frost-bitten tag from a seed tray: "MAIZE, CALLOWAY STRAIN, SAFE FOR FORTY YEARS." Someone added in pencil: "Come back for us."`, see: ['FROST', 'ARK HALCYON'] },
  s4: { x: 190, y: 140, title: 'GRID LOG', t: `Dynamo log from the night of the Breach: "LOAD AT 300% FROM 01:50. VALVE ENGINES DRAWING EVERYTHING. TOLD NOT TO ASK WHY."`, see: ['ARC', 'THE BREACH'] },
  s5: { x: 120, y: 70, title: "BROKER'S TAB", t: `A tab slipped under a stall: one thimble of water, three gold. One Keyholder's name, forty gold. One Keyholder alive: "Priced by the Banker himself."`, see: ['SABLE CROWS', 'THE SEAL'] },
  s6: { x: 210, y: 70, title: 'RAIN MAKER SKETCH', t: `Blueprints scratched into a container wall: a funnel, a pump and a sky full of pipes. Under it, in careful capitals: "NEEDS ONE CLOUD."`, see: ['SCRAPPER', 'DALTON COMBINE'] },
  s8: { x: 150, y: 138, title: 'FARM MARKER', t: `A fence post sticking out of the dune, branded "ROW 14, FIRST HARVEST". The field it once marked is a mile of sand now.`, see: ['THE DUST', 'DUST WORMS'] },
  s9: { x: 230, y: 140, title: 'CARAVAN MANIFEST', t: `A wagon manifest in Vance's own hand: "Halcyon console parts, three slots. Two keys on file. One outstanding."`, see: ['THE RETURN CONSOLE', 'VANCE SYNDICATE'] },
  s10: { x: 100, y: 64, title: 'COPPER FLOWER', t: `A flower made of copper wire, tied to a wrecked shuttle. The tag reads: "For seat 114."`, see: ['SHUTTLE 14', 'MENDER'] },
  s11: { x: 200, y: 72, title: 'UPLINK NOTE', t: `A technician's note taped to the uplink: "BEACON RESTARTED TWELVE YEARS AFTER LAUNCH. NOBODY ORDERED IT. IT ASKS FOR A KEYHOLDER."`, see: ['THE BEACON', 'ARK HALCYON'] },
  s13: { x: 140, y: 140, title: 'GATEPOST TALLY', t: `Tally marks scratched into the inside of the gatepost, in neat rows of five. Someone counted all the way to 311.`, see: ['BULWARK', 'HOUSE CALLOWAY'] },
  s14: { x: 240, y: 64, title: 'VALVE CREW TAG', t: `A valve crew tag in the pipes: "DO NOT LEAVE POST BEFORE 02:30." The name below it has been scratched out.`, see: ['DAM RECORD', 'THE SEAL'] }
};
function stageById(id) { return STAGES.find(s => s.id === id); }
function firstStageWith(type) { return STAGES.find(s => s.waves.some(w => w.some(e => e[0] === type))); }
Object.keys(FINDS).forEach(id => {
  const f = FINDS[id];
  CODEX.push({ cat: 'FINDS', title: f.title, at: 'find:' + id, src: 'FOUND AT: ' + stageById(id).name.toUpperCase(), see: f.see, parts: [{ at: null, t: f.t }] });
});

// ---------- field notes on enemies (unlocked by destroying that enemy; the tips describe how the enemy really behaves in battle) ----------
const FOE_NOTES = {
  raider: { title: 'RUST RIDER', see: ['RUST RIDERS'], parts: [`FIELD NOTE: Rust Riders charge the nearest robot and fight in melee, always in packs. A sturdy robot in front takes the first hits while the others do the shooting.`] },
  gunner: { title: 'BLUE COAT', see: ['THE TRIBUNAL'], parts: [`FIELD NOTE: Blue Coats shoot from a distance and back away when a robot gets close. They are fragile, so focus them down before the shots add up.`] },
  drone: { title: 'WATCH DRONE', see: ['WATCH DRONES'], parts: [`FIELD NOTE: Watch Drones fly fast and shoot from medium range. They have little health, so area attacks clear a swarm quickly.`] },
  worm: { title: 'DUST WORM', see: ['DUST WORMS'], parts: [`FIELD NOTE: A Dust Worm cannot be targeted while it is underground. It surfaces after a short warning: when a red circle appears, move your robots out of it before the ring closes.`] },
  brute: { title: 'BREAKER', see: ['RUST RIDERS', 'DALTON COMBINE'], parts: [`FIELD NOTE: Breakers are heavy frames the Rust Rider warlords use as muscle. They are slow and have a lot of health, but they only strike once every second and a half. Keep the ranged robots behind the tank.`] },
  boss: { title: 'GIANT HAND', see: ['HALCYON LOG 0001', 'ARK HALCYON'], parts: [`FIELD NOTE: The Giant Hand marks a robot or a whole row with a red warning before it strikes. At about half health it calls in Rust Riders, so keep an ultimate ready for that moment.`, `The crane never stopped loading and never stopped guarding. The log in its core is the first proof that the Breach was a launch.`] },
  walker: { title: 'VANCE WALKER', see: ['VANCE SYNDICATE', 'THE DEAD RAIL'], parts: [`FIELD NOTE: Vance's war-walker uses the same red warnings as the Giant Hand. At about half health the Blue Coats charge in to help.`, `The Walker runs on the Dead Dynamo's power, drained every night. Ezra Vance climbed into it himself.`] },
  warden: { title: 'WARDEN-1', see: ['HOUSE CALLOWAY', 'SIGHT  (MARSHAL-7)'], parts: [`FIELD NOTE: WARDEN-1 uses red warnings on single robots and whole rows. At about half health it calls in Watch Drones.`, `Calloway's sheriff-bot, built twice the size of the Marshal and never taught to question an order.`] }
};
Object.keys(FOE_NOTES).forEach(type => {
  const n = FOE_NOTES[type], s = firstStageWith(type);
  CODEX.push({ cat: 'FOES', title: n.title, spr: FOES[type].spr, at: 'foe:' + type, src: 'FIRST SEEN: ' + s.name.toUpperCase(), see: n.see, parts: n.parts.map(t => ({ at: null, t })) });
});

// ---------- "see also" links between codex entries (only entries the player has unlocked are offered) ----------
const SEE_ALSO = {
  'THE BREACH': ['ARK HALCYON', 'HOUSE CALLOWAY', 'HALCYON LOG 0001'], 'THE DUST': ['DUST WORMS', 'FARM MARKER', 'THE BREACH'],
  'ARK HALCYON': ['THE BREACH', 'THE BEACON', 'THE RETURN CONSOLE'], 'THE SEAL': ['THE RETURN CONSOLE', 'VANCE SYNDICATE', 'DAM RECORD'],
  'THE DEAD RAIL': ['VANCE SYNDICATE', 'TOLL LEDGER', 'BLUE COAT'], 'WATCH DRONES': ['WATCH DRONE', 'VANCE SYNDICATE', 'WILLOW FORK TAG'],
  'DUST WORMS': ['DUST WORM', 'THE DUST', 'FARM MARKER'], 'THE RETURN CONSOLE': ['THE SEAL', 'THE OFFER', 'CARAVAN MANIFEST'],
  'HOUSE CALLOWAY': ['THE BREACH', 'DAM RECORD', 'WARDEN-1'], 'VANCE SYNDICATE': ['THE TRIBUNAL', 'OIL RECEIPT', 'WILLOW FORK TAG'],
  'DALTON COMBINE': ['RUST RIDERS', 'SCRAPPER', 'BREAKER'], 'SABLE CROWS': ["BROKER'S TAB", 'BLADE', 'RUST RIDERS'],
  'RUST RIDERS': ['RUST RIDER', 'DALTON COMBINE'], 'THE TRIBUNAL': ['BLUE COAT', 'BLADE', 'VANCE SYNDICATE'],
  'BULWARK': ['HOUSE CALLOWAY', 'GATEPOST TALLY', 'SHUTTLE 14'], 'SIGHT  (MARSHAL-7)': ['DAM RECORD', 'HALCYON LOG 0001', 'WARDEN-1'],
  'MENDER': ['COPPER FLOWER', 'SHUTTLE 14'], 'EMBER': ['THE DEAD RAIL', 'TOLL LEDGER'], 'FROST': ['SEED TAG', 'ARK HALCYON'], 'ARC': ['GRID LOG', 'THE SEAL'],
  'BLADE': ['THE TRIBUNAL', "BROKER'S TAB"], 'SCRAPPER': ['RAIN MAKER SKETCH', 'DALTON COMBINE'],
  'WILLOW FORK TAG': ['VANCE SYNDICATE', 'OIL RECEIPT'], 'HALCYON LOG 0001': ['THE BREACH', 'ARK HALCYON'], 'SHUTTLE 14': ['COPPER FLOWER', 'ARK HALCYON'],
  'THE BEACON': ['ARK HALCYON', 'UPLINK NOTE'], 'DAM RECORD': ['THE SEAL', 'HOUSE CALLOWAY', 'VALVE CREW TAG'], 'THE OFFER': ['THE RETURN CONSOLE', 'AFTERMATH']
};
CODEX.forEach(e => { if (SEE_ALSO[e.title] && !e.see) e.see = SEE_ALSO[e.title]; });
function codexFind(title) { return CODEX.find(e => e.title === title); }

// ---------- what the squad says at the hub: one of the latest lines that fit the player's progress ----------
// at = event that must have happened (see cleared), not = event after which the line is dropped.
const HUB_LINES = [
  { at: null, t: `SIGHT: "Rest while you can. The blue coats never do."` },
  { at: null, t: `MENDER: "Your Seal is quiet tonight. That never lasts."` },
  { at: 's1', t: `BULWARK: "Ezra Vance signs every fire he starts. I would like to read that signature twice."` },
  { at: 's2', t: `EMBER: "Smell that? Real coal smoke. I could get used to it."` },
  { at: 's3', t: `FROST: "Six thousand seed varieties and not a single raindrop. The sums are not kind."` },
  { at: 's4', t: `ARC: "The grid hums when you walk past. I would not stand next to a metal fence."` },
  { at: 's5', t: `BLADE: "The Crows sell everything. I wonder what they charge for a clear conscience."` },
  { at: 's6', t: `SCRAPPER: "Three more pipes and the rain maker is finished. Then we only need rain."` },
  { at: 's7', t: `MENDER: "Ninety-four percent. I keep doing the sums and they keep coming out the same."` },
  { at: 's9', t: `SIGHT: "Three hand-shaped slots. Ezra has two keys. We have the one he still needs."` },
  { at: 's10', t: `BULWARK: "Nine hundred people locked out. I know the sound a gate like that makes."` },
  { at: 's12', t: `SIGHT: "Ezra Vance did not run. I did not expect that."` },
  { at: 's14', not: 's15', t: `SIGHT: "I remember all of it now. Strange, to feel lighter for it."` },
  { at: 's15', not: 'end', t: `SCRAPPER: "The console is waiting. I will keep tinkering until you choose."` },
  { at: 'end:rain', t: `SCRAPPER: "Still raining. I am trying to look surprised."` },
  { at: 'end:rain', t: `FROST: "Something sprouted this morning. I checked twice."` },
  { at: 'end:ascend', t: `MENDER: "Do you think they will forgive us, down there?"` },
  { at: 'end:ascend', t: `BULWARK: "Nobody left behind. I keep saying it, to be sure."` }
];
function pickHubLine() {
  let ok = HUB_LINES.filter(l => cleared(l.at) && !(l.not && cleared(l.not)));
  if (SAVE.ending) ok = ok.filter(l => l.at && l.at.indexOf('end:') === 0);   // after the finale the squad only talks about how it ended
  const recent = ok.slice(-3);
  return recent.length ? recent[Math.floor(Math.random() * recent.length)].t : '';
}
