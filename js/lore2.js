'use strict';
// ---------- the Families and the people of the story: codex entries that go with the cutscene chapters ----------
// Loaded after lore.js. New entries are appended; existing family entries get extra parts. Conditions: see cleared() in story.js.

function codexAdd(e) { CODEX.push(e); return e; }
function codexMore(title, parts, see) { const e = codexFind(title); parts.forEach(p => e.parts.push(p)); (see || []).forEach(t => { e.see = e.see || []; if (e.see.indexOf(t) < 0) e.see.push(t); }); }

// ----- WORLD -----
codexAdd({ cat: 'WORLD', title: 'THE THIMBLE', at: 's5', parts: [
  { at: null, t: `A thimble of water is the Dust's smallest coin, about one swallow. Prices are chalked on every wall: a thimble for a toll, a barrel for a bribe, a river for a life.` },
  { at: 's26', t: `At the Calloway water line a thimble is the daily ration: one for each adult, two for each child. The ration has been cut three times since the Breach.` }], see: ['SABLE CROWS', 'HOUSE CALLOWAY'] });
codexAdd({ cat: 'WORLD', title: 'THE KEYHOLDERS', at: 's20', parts: [
  { at: null, t: `The dam's valves needed three keys turned in the right order, so House Calloway grew three Seals into three young apprentices. Jonah Dalton, an apprentice of the valve crew, was one.` },
  { at: 's23', t: `Ansel Calloway, the old man's own grandson, was another. Both were hunted down by Vance's hounds over the last three years. Ezra Vance took their Seals from the bodies.` },
  { at: 's12', t: `The third Keyholder was a seventeen-year-old ward of the house. They were told it was a flood release.` }], see: ['THE SEAL', 'MA DALTON', 'DAM RECORD'] });
codexAdd({ cat: 'WORLD', title: 'THE EXODUS PACT', at: 's21', parts: [
  { at: null, t: `Seven years before the Breach the four Families signed a secret pact with the Halcyon Authority. Calloway gave the water, Vance the rail, Dalton the steel and the Crows the silence. Each was promised seats on the Ark for its heirs.` },
  { at: 's24', t: `The Crows also sold seats to the valley: a ticket for a barrel of water. They knew the doors would close at T minus 40, and sold the last tickets anyway.` },
  { at: 's14', t: `Halcyon never meant to keep the Families' seats. Once the tanks were full, it left without them.` }], see: ['ARK HALCYON', 'THE KEYHOLDERS', 'DALTON COMBINE'] });
codexAdd({ cat: 'WORLD', title: 'LOWER FORK', at: 's25', parts: [
  { at: null, t: `Nine towns lay in the Lower Fork valley. The flood reached the rooftops in eleven minutes. The waterline is still painted on every wall, higher than a grown man's reach.` },
  { at: 's26', t: `People walk in from the Dust to sit in the rooms and listen. Nobody has ever moved a stone.` }], see: ['THE BREACH', 'EZRA VANCE'] });
codexAdd({ cat: 'WORLD', title: 'THE UPLINK', at: 's28', parts: [
  { at: null, t: `The dam crest carries the only working link to the Ark. Whoever stands at it speaks for the whole planet to the sleepers above, and to the machine that watches them.` }], see: ['ARK HALCYON', 'THE RETURN CONSOLE'] });
codexMore('THE DEAD RAIL', [{ at: 's16', t: `The Tribunal runs the toll bridges. A toll is a tax, a fine and a verdict in one sentence.` }], ['THE TRIBUNAL', 'JUDGE VERITY']);

// ----- FAMILIES -----
codexMore('HOUSE CALLOWAY', [
  { at: 's26', t: `Dessa Calloway, the old man's granddaughter, runs the public water line below the gate. She keeps the ledger by hand, so nobody can say a thimble went missing.` },
  { at: 's27', t: `The household guard and the pump crews are loyal to the old man, not to the house. Dessa has no say over them.` }], ['DESSA CALLOWAY', 'OLD CALLOWAY', 'THE THIMBLE']);
codexMore('VANCE SYNDICATE', [
  { at: 's16', t: `Vance pays the Tribunal. Judges are cheap to rent and expensive to bury.` },
  { at: 's23', t: `The Syndicate sells fuel for water. A litre of fuel costs a litre of water, and a litre more for the road.` }], ['EZRA VANCE', 'JUDGE VERITY']);
codexMore('DALTON COMBINE', [
  { at: 's20', t: `Ma Dalton rules from the Scrap Court. Her law is simple: pay the toll or win the bout, and nothing in the Yard is ever wasted.` },
  { at: 's21', t: `The Combine built the Ark's tanks and the launch rail's cranes. It was paid in water rights that Halcyon never honoured.` }], ['MA DALTON', 'THE EXODUS PACT']);
codexMore('SABLE CROWS', [
  { at: 's18', t: `Corva Sable holds the courier roads. A Crow wagon is the only thing that crosses every Family's line, and nobody dares touch it.` },
  { at: 's19', t: `The Crows auction information in the open. Everything sold is true. What stays hidden is who bought it.` },
  { at: 's24', t: `The Crows sold the Exodus seats. They have never apologised, which is cheaper than being forgiven.` }], ['CORVA SABLE', 'THE EXODUS PACT']);

// ----- PEOPLE -----
codexAdd({ cat: 'PEOPLE', title: 'EZRA VANCE', spr: 'ezra', at: 's11', parts: [
  { at: null, t: `The Banker. Head of the Vance Syndicate since his father's death. Polite, patient and never heard to raise his voice.` },
  { at: 's12', t: `His younger brother drowned in Lower Fork on the night of the Breach. Ezra spent three years collecting the Keyholders who turned the keys.` },
  { at: 'flag:ezra=mercy', t: `He walked out of the Dust Sea alone, with his coat and nothing else. He has not been seen at a depot since.` },
  { at: 'flag:ezra=cold', t: `He was left with his dead Walker and no water. The Syndicate is still arguing over whether he is alive.` }], see: ['VANCE SYNDICATE', 'LOWER FORK', 'THE KEYHOLDERS'] });
codexAdd({ cat: 'PEOPLE', title: 'OLD CALLOWAY', spr: 'calloway', at: 's13', parts: [
  { at: null, t: `Hiram Calloway, patriarch of House Calloway. Four generations of water, and twelve years in a room under the dam, waiting for a ship that left without him.` },
  { at: 's14', t: `He chose his Keyholders the way he chose tools: for being replaceable. One of them was his own grandson.` }], see: ['HOUSE CALLOWAY', 'THE KEYHOLDERS', 'DAM RECORD'] });
codexAdd({ cat: 'PEOPLE', title: 'DESSA CALLOWAY', spr: 'dessa', at: 's26', parts: [
  { at: null, t: `Twenty-six, brisk, and tired. She runs the water line and keeps its ledger by hand. She has never liked the gate her grandfather keeps shut.` },
  { at: 's14', t: `Her brother Ansel was a Keyholder. She was told raiders took him.` }], see: ['HOUSE CALLOWAY', 'THE THIMBLE', 'OLD CALLOWAY'] });
codexAdd({ cat: 'PEOPLE', title: 'MA DALTON', spr: 'ma', at: 's6', parts: [
  { at: null, t: `Hesper Dalton, widowed queen of the Wreck Yard. She says she has never thrown anything away, and the Yard agrees.` },
  { at: 's21', t: `Her son Jonah was a Keyholder. Vance's hounds killed him three years ago. She never sold the Combine to Vance, though he offered twice.` }], see: ['DALTON COMBINE', 'THE KEYHOLDERS', 'JONAH DALTON'] });
codexAdd({ cat: 'PEOPLE', title: 'CORVA SABLE', spr: 'corva', at: 's18', parts: [
  { at: null, t: `Queen of the Crows. Silk voice, black feathers, a gold ring for every deal she has closed. She has never been seen to bargain in anger.` },
  { at: 's24', t: `She sold Exodus seats she knew would not fly. She keeps the ledger of every one of them, and reads it at night.` }], see: ['SABLE CROWS', 'THE EXODUS PACT'] });
codexAdd({ cat: 'PEOPLE', title: 'JUDGE VERITY', spr: 'judge', at: 's16', parts: [
  { at: null, t: `The Tribunal's circuit judge. She believes in the law the way a machine believes in its program: completely, and without asking who wrote it.` },
  { at: 's17', t: `She was built to be incorruptible. She never noticed that being rented is the same thing.` }], see: ['THE TRIBUNAL', 'WARRANT 0001'] });
codexAdd({ cat: 'PEOPLE', title: 'JONAH DALTON', spr: 'jonah', at: 's21', parts: [
  { at: null, t: `Valve crew apprentice, seventeen. He left a message for his mother the night before: "They say it is a flood release. I asked twice."` }], see: ['MA DALTON', 'THE KEYHOLDERS', 'JONAH\'S RECORDING'] });
codexAdd({ cat: 'PEOPLE', title: 'ANSEL CALLOWAY', at: 's23', parts: [
  { at: null, t: `Dessa's younger brother. Sixteen when the Breach came, a Keyholder, and the second name crossed off on Vance's hunt list.` },
  { at: 's14', t: `Old Calloway chose him because he was his to spend.` }], see: ['DESSA CALLOWAY', 'THE KEYHOLDERS'] });
codexAdd({ cat: 'PEOPLE', title: 'ROSE', spr: 'rose', at: 's18', parts: [
  { at: null, t: `Sable Crow outrider. Nine years of riding shotgun on Corva's mail wagons, with two revolvers and one rule: the mail gets through, and nobody reads it.` },
  { at: 's18', t: `Corva says she lent Rose out. Rose says she quit. Both are true, which is how the Crows prefer their contracts. She still carries a bag of letters that never found a door.` },
  { at: 's24', t: `She delivered the Exodus ticket for seat 114, the paper Nell Hartwell kept in her pocket. She never opened the envelope. She has not stopped thinking about it since.` },
  { at: 's25', t: `She once delivered a letter on a Lower Fork street. A man in his shirtsleeves signed for it, laughing, with a washbasin in his hands.` }], see: ['SABLE CROWS', 'CORVA SABLE', 'UNDELIVERED LETTER', 'SEAT LEDGER', 'MENDER'] });
codexAdd({ cat: 'PEOPLE', title: 'COG', spr: 'cog', at: 's20', parts: [
  { at: null, t: `Twenty-three, lanky, and the youngest engineer the Dalton Combine ever put on its books. He calls himself an inventor. Ma Dalton calls him the rivet that never stops talking.` },
  { at: 's20', t: `He built the crane bots of the Scrap Court to last an hour against a Rust Rider warlord. The squad wrecked three in four minutes. He considers it the best news of his year.` },
  { at: 's7', t: `He wrote the load limits of the Launch Rail crane on a napkin and bolted its hip plate on himself. It was made to lift tanks. Nobody told him what for.` },
  { at: 's21', t: `Tank 3217: he drew its baffle plates. Every one of the four thousand drawings carries his initials in the corner. He is re-reading them, one at a time.` }], see: ['DALTON COMBINE', 'MA DALTON', 'THE EXODUS PACT', 'TANK MOLD PLATE', 'GIANT HAND'] });
codexAdd({ cat: 'PEOPLE', title: 'HOLT', spr: 'holt', at: 's22', parts: [
  { at: null, t: `Amos Holt, retired sergeant of the Calloway Gate Guard. White hair, white beard, and the hand-cranked gatling gun the guard put in a shed when the dam went automatic.` },
  { at: 's22', t: `He lived in Lower Fork. On the night of the Breach he dragged the old gun to the north gate and put forty rounds into GATE-3's shield, trying to shoot the lock chain off. The gate held. He has forgiven neither the gate nor himself.` },
  { at: 's23', t: `Three winters ago he gave a boy called Ans a bed on his porch for a week. Vance's hounds found the porch a few days after the boy left. Ans was Ansel Calloway, Keyholder 2.` },
  { at: 's25', t: `He will not walk into Lower Fork. He keeps the street instead, and tells nobody which door was his.` }], see: ['BULWARK', 'ANSEL CALLOWAY', 'LOWER FORK', 'SEAL HOUND', 'GATEPOST TALLY'] });

// ----- SIGNALS -----
codexAdd({ cat: 'SIGNALS', title: 'WARRANT 0001', at: 's17', parts: [
  { at: null, t: `[ TRIBUNAL WARRANT 0001 ] CHARGE: THE BREACH. DEFENDANT: BEARER OF THE CALLOWAY SEAL. ISSUED BY: E. VANCE. ISSUED: BEFORE THE CRIME WAS COMMITTED.` }], see: ['JUDGE VERITY', 'VANCE SYNDICATE'] });
codexAdd({ cat: 'SIGNALS', title: 'CROW BULLETIN', at: 's19', parts: [
  { at: null, t: `[ SABLE MARKET, LOT 9 ] LOCATION OF ONE CALLOWAY KEYHOLDER. SOLD TO THE HIGHEST BIDDER. SOLD TWICE. NO REFUNDS.` }], see: ['SABLE CROWS', 'CORVA SABLE'] });
codexAdd({ cat: 'SIGNALS', title: 'JONAH\'S RECORDING', at: 's21', parts: [
  { at: null, t: `[ RECORDING, DALTON YARD, THE NIGHT BEFORE ] "Ma, they say tomorrow I turn a key for the Calloways. They say it is a flood release. I asked twice. If I am wrong, I wanted you to know I asked."` }], see: ['JONAH DALTON', 'MA DALTON'] });
codexAdd({ cat: 'SIGNALS', title: 'HUNT LIST', at: 's23', parts: [
  { at: null, t: `[ SYNDICATE LEDGER, PAGE 1 ] KEYHOLDER 1: J. DALTON. RECOVERED. KEYHOLDER 2: A. CALLOWAY. RECOVERED. KEYHOLDER 3: UNLOCATED. LAST SEEN: WILLOW FORK. HOUNDS ASSIGNED.` }], see: ['THE KEYHOLDERS', 'VANCE SYNDICATE'] });
codexAdd({ cat: 'SIGNALS', title: 'SEAT LEDGER', at: 's24', parts: [
  { at: null, t: `[ CROW TICKET OFFICE, LEDGER ] SEAT 114: HARTWELL, N. (AGE 8). PAID: THREE BARRELS. STATUS: BOARDED. NOTE: SHUTTLE 14 DOES NOT LIFT.` }], see: ['SHUTTLE 14', 'MENDER'] });

// ----- links between the older entries and the new ones -----
codexMore('ARK HALCYON', [], ['THE EXODUS PACT']);
codexMore('THE BREACH', [], ['LOWER FORK']);
codexMore('THE SEAL', [], ['THE KEYHOLDERS']);
codexMore('THE TRIBUNAL', [], ['JUDGE VERITY']);
codexMore('SHUTTLE 14', [], ['SEAT LEDGER']);
codexMore('MENDER', [], ['SEAT LEDGER']);
codexMore('SCRAPPER', [], ['MA DALTON']);

// ----- the squad's humans in the older entries -----
codexMore('BULWARK', [{ at: 's22', t: `Forty of his 311 dents were made by a retired sergeant who tried to shoot the chain off the gate that night. Bulwark knows exactly which ones.` }], ['HOLT']);
codexMore('SABLE CROWS', [{ at: 's18', t: `The Crows do not sell their riders. They lend them, which is the same thing with better manners.` }], ['ROSE']);
codexMore('DALTON COMBINE', [{ at: 's20', t: `The Combine's youngest engineer, Cog, drew the baffles for the Ark's tanks and the load limits for the launch rail's crane.` }], ['COG']);
codexMore('MENDER', [{ at: 's24', t: `The paper in Nell's pocket was delivered by a Crow outrider who is now in the squad. Mender asked her not to say sorry. She said it anyway.` }], ['ROSE']);
codexMore('ANSEL CALLOWAY', [{ at: 's22', t: `A sergeant named Holt put him up on a porch for a week, three winters ago. The boy hummed when he was scared.` }], ['HOLT']);
codexMore('LOWER FORK', [{ at: 's22', t: `Holt's house was on the fifth street, blue door, a swing on the porch. He keeps count of the doors his neighbours left open.` }], ['HOLT']);
codexMore('GIANT HAND', [], ['COG']);
