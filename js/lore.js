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
  s16: { x: 120, y: 70, title: 'TOLL STAMP', t: `A Tribunal toll stamp, worn smooth. Every verdict at the bridge came out the same way: PAID, or SEIZED.`, see: ['THE TRIBUNAL', 'JUDGE VERITY'] },
  s18: { x: 230, y: 66, title: 'UNDELIVERED LETTER', t: `A letter marked RETURN TO SENDER: "Mama, the water here tastes of iron. I am keeping the cup you gave me." The sender's name has run in the rain.`, see: ['SABLE CROWS', 'CORVA SABLE'] },
  s19: { x: 180, y: 132, title: 'LOT 9 TAG', t: `An auction tag: LOT 9, ONE KEYHOLDER, LOCATION ONLY. Under it, in Corva's hand: "Sold twice. Both buyers satisfied."`, see: ['SABLE CROWS', 'CROW BULLETIN'] },
  s20: { x: 90, y: 128, title: 'COURT WRIT', t: `A writ chalked on a fender: "DALTON LAW: WHAT YOU BREAK, YOU BUY. WHAT YOU BUY, YOU CARRY." Nobody has ever been seen carrying a crane.`, see: ['DALTON COMBINE', 'MA DALTON'] },
  s21: { x: 240, y: 134, title: 'TANK MOLD PLATE', t: `A brass plate from a tank mold: UNIT 3217 OF 4000. CAPACITY: ONE RESERVOIR, DIVIDED. Scratched underneath: "We never asked divided from what."`, see: ['THE EXODUS PACT', 'DALTON COMBINE'] },
  s22: { x: 70, y: 134, title: 'KNOTTED BOOT', t: `A small boot with hound bites in the leather. The laces are knotted the way children tie them, twice, for luck.`, see: ['SEAL HOUND', 'THE DUST'] },
  s23: { x: 200, y: 70, title: 'FUEL RATION BOOK', t: `A Syndicate ration book: one litre of fuel for one litre of water, plus a litre for the road. The road has never been shorter than a litre.`, see: ['VANCE SYNDICATE', 'THE DEAD RAIL'] },
  s24: { x: 100, y: 92, title: 'TORN TICKET', t: `A torn Exodus ticket: seat 33, PAID IN FULL, three barrels. The stamp says BOARDING CLOSES T MINUS 60. It closed at T minus 40.`, see: ['THE EXODUS PACT', 'SHUTTLE 14'] },
  s25: { x: 160, y: 122, title: 'WATERLINE CHALK', t: `Chalk on a doorframe: a child's height marks, going up the wood. Above the last one, in a different hand, the waterline.`, see: ['LOWER FORK', 'THE BREACH'] },
  s26: { x: 130, y: 70, title: 'RATION TOKEN', t: `A brass ration token, one thimble. On the back: CALLOWAY WATER, FAIR MEASURE. The edge is worn from twelve years of thumbs.`, see: ['HOUSE CALLOWAY', 'THE THIMBLE'] },
  s27: { x: 60, y: 82, title: 'PUMP CREW ROSTER', t: `A night-shift roster pinned in the hall. Every name is crossed out in the same hand except three, circled twice.`, see: ['THE KEYHOLDERS', 'THE SEAL'] },
  s28: { x: 150, y: 132, title: 'TOY ROCKET', t: `A child's toy rocket, painted with the Ark's name and left at the foot of the spire like an offering.`, see: ['ARK HALCYON', 'THE UPLINK'] },
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
  warden: { title: 'WARDEN-1', see: ['HOUSE CALLOWAY', 'SIGHT  (MARSHAL-7)'], parts: [`FIELD NOTE: WARDEN-1 uses red warnings on single robots and whole rows. At about half health it calls in Watch Drones.`, `Calloway's sheriff-bot, built twice the size of the Marshal and never taught to question an order.`] },
  hound: { title: 'SEAL HOUND', see: ['VANCE SYNDICATE'], parts: [`FIELD NOTE: Seal Hounds are very fast and bite hard, but they have little health. They go for whoever is nearest, so a sturdy robot in front takes most of the bites. Area attacks clear a pack.`, `Vance's hunters. They were tuned to the Seal's signature three years ago, and have followed it ever since.`] },
  welder: { title: 'DALTON WELDER', see: ['DALTON COMBINE'], parts: [`FIELD NOTE: Welders fight at short range with a torch and keep their distance from melee robots. They are tougher than Blue Coats: focus them down, or let shock and ice slow them.`] },
  judge: { title: 'THE JUDGE', see: ['THE TRIBUNAL', 'JUDGE VERITY'], parts: [`FIELD NOTE: The Judge marks robots with red warnings, one circle at a time and long bars across a row. At about half health it calls Blue Coats into court, so keep an ultimate ready.`, `Built to be incorruptible. She never noticed that being rented is the same thing.`] },
  sentinel: { title: 'HALCYON SENTINEL', see: ['ARK HALCYON', 'THE UPLINK'], parts: [`FIELD NOTE: The Sentinel drops several red circles at once. At about half health it launches Watch Drones. Keep moving, and use shock on the shielded drones.`, `The Ark's guardian. Nobody ever told it the Families were not its enemies.`] }
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
  { at: 's16', t: `MENDER: "The little girl kept her father's hand the whole time. I keep thinking about that."` },
  { at: 's3', t: `FROST: "Six thousand seed varieties and not a single raindrop. The sums are not kind."` },
  { at: 's4', t: `ARC: "The grid hums when you walk past. I would not stand next to a metal fence."` },
  { at: 's17', t: `SIGHT: "The Judge said the warrant was signed before the crime. I believe her. That is the worst part."` },
  { at: 's5', t: `BLADE: "The Crows sell everything. I wonder what they charge for a clear conscience."` },
  { at: 's18', t: `BLADE: "Corva never raised her voice. People who never raise their voice frighten me more than the loud ones."` },
  { at: 's19', t: `BULWARK: "Sold twice and smiling. I would not turn my back on that woman, or on her prices."` },
  { at: 's6', t: `SCRAPPER: "Three more pipes and the rain maker is finished. Then we only need rain."` },
  { at: 's20', t: `EMBER: "Ma Dalton says fire is just a very fast argument. I think I love her."` },
  { at: 's21', t: `SCRAPPER: "Four thousand tanks. I helped sort the rivets for those, when I was a lot younger and a lot more stuck."` },
  { at: 's7', t: `MENDER: "Ninety-four percent. I keep doing the sums and they keep coming out the same."` },
  { at: 's22', t: `FROST: "Salt keeps things. Seeds, bodies, grudges. I am not sure which of those this plain is keeping."` },
  { at: 's9', t: `SIGHT: "Three hand-shaped slots. Ezra has two keys. We have the one he still needs."` },
  { at: 's23', t: `ARC: "I read the depot ledger. The numbers are so tidy that I wanted to short-circuit them."` },
  { at: 's10', t: `BULWARK: "Nine hundred people locked out. I know the sound a gate like that makes."` },
  { at: 's24', t: `MENDER: "Nell. Seat 114. I will carry that name next to the others."` },
  { at: 's12', t: `SIGHT: "Ezra Vance did not run. I did not expect that."` },
  { at: 's25', t: `BULWARK: "I counted the doorways in Lower Fork. I stopped at nine hundred. It is easier to count gates."` },
  { at: 's26', t: `FROST: "One thimble a day. They give half of it to the children and never say so."` },
  { at: 's14', not: 's15', t: `SIGHT: "I remember all of it now. Strange, to feel lighter for it."` },
  { at: 's15', not: 's29', t: `SCRAPPER: "The console wants a tower, apparently. I have always wanted to climb a tower."` },
  { at: 's29', not: 'end', t: `SCRAPPER: "The console is waiting. I will keep tinkering until you choose."` },
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
