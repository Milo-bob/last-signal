'use strict';
// ---------- cutscene scripts, part 1: the waking, chapter 1 (THE DEAD RAIL) and chapter 2 (THE SABLE MARKET) ----------
// Format: see scenes.js. A stage has two scenes: 'pre_<id>' before the first fight and 'post_<id>' after the first win. All text is English.
(function () {
  const { say, nar, sys, wait, fade, bg, tint, cam, camAsync, frame, act, go, goA, face, emo, hide, prop, shake, flash, sfx, cap, title, fx, set, give, choice, menu, crew, crewMove } = Sx;
  const H = '@hero';

  // ---------- intro and prologue ----------
  SCENES.intro = () => [
    bg('reservoir'), cam(70, 96, 1.8, 0), wait(0.6), fx('stars'),
    title('LAST SIGNAL', 'TWELVE YEARS AFTER THE BREACH', 4.4),
    camAsync(250, 44, 1.8, 0.28), cap('THE CALLOWAY RESERVOIR', 4),
    nar('The Calloway Reservoir is a crater of cracked mud. The rain never came back, and in the Dust, whoever holds the water holds the law.'),
    nar('High above it, a ship that left on the night the water did still hangs in orbit. It has never stopped listening.'),
    cam(160, 90, 1, 1), bg('ash', 1.6), tint('255,190,150', 0.12), wait(1.2),
    act('hero', 'hero', 150, 126), emo('hero', 'zzz', 2.2), wait(2.2), emo('hero', '!', 1), wait(0.6),
    nar('{HERO} wakes in the ashes of Willow Fork. The camp they built from nothing is gone. The Vance Syndicate burned it, looking for something {HERO} carries under their skin.'),
    { k: 'say', who: '', text: ['Before the Breach, {HERO} stood watch on the Calloway dam. Nobody ever asked the guards what they saw.'], o: 'guard' },
    { k: 'say', who: '', text: ['Before the Breach, {HERO} kept the dam\'s valve engines running. Machines never lied. The people giving the orders did.'], o: 'tech' },
    { k: 'say', who: '', text: ['Before the Breach, {HERO} ran contraband past the Calloway gates. Everybody has a price, and {HERO} learned theirs the hard way.'], o: 'smuggler' },
    { k: 'say', who: '', text: ['Before the Breach, {HERO} carried sealed messages for House Calloway. {HERO} still wonders what was in the last one.'], o: 'courier' },
    nar('The Seal under {HERO}\'s skin is warm. It has not been warm in years.'),
    nar('Hollow Creek lies a day\'s walk north, along the old road. If anyone got out of the fire, they went there.'),
    go('hero', 340, 126, 3.4)
  ];
  SCENES.prologue_end = () => [
    bg('hub'), tint('255,150,60', 0.08), prop('fire', 'fire', 150, 128),
    act('hero', 'hero', 130, 130, 1), act('bulwark', 'bulwark', 112, 130), act('sight', 'sight', 92, 126), act('mender', 'mender', 170, 128, -1),
    wait(0.8), cap('HOLLOW CREEK. NIGHT.', 3),
    say('SIGHT', 'Quiet again. I count three of us who can still fight.'),
    say('MENDER', 'Your Seal is glowing, {HERO}. It woke us when the signal came back. We should talk about that.'),
    say('BULWARK', 'Three is all the line can hold. If more of us wake up, you will have to choose who walks with you.'),
    emo('hero', '!', 1.2), shake(3), sfx('bell'),
    sys('[ SIGNAL DETECTED: ARK HALCYON, ORBIT. RETURN PROTOCOL REQUESTED. ]'),
    say('SIGHT', 'Then it is not only the blue coats who have noticed you.')
  ];

  // ---------- chapter 1: THE DEAD RAIL ----------
  SCENES.pre_s1 = () => [
    bg('ash'), tint('255,190,150', 0.08), cap('WILLOW FORK. THE MORNING AFTER.', 3.4),
    act('r1', 'raider', 250, 122, -1), act('r2', 'raider', 276, 130, -1), act('r3', 'raider', 232, 134, -1), ...crew('s1', 'pre', 96, 126),
    frame(null, 0), wait(0.8),
    nar('The Rust Riders are looting what is left of Willow Fork. They are not here for the Seal. They only want scrap, but they are in the way.'),
    say(H, 'Six years of work. Gone in one night.'),
    say('MENDER', 'We can mourn it later. Right now it is standing in front of what is left.'),
    emo('r1', '!', 1), shake(2),
    say('SIGHT', 'Aim low. Everything in this town is already half dead.')
  ];
  SCENES.post_s1 = () => [
    bg('ash'), tint('255,190,150', 0.08), ...crew('s1', 'post', 110, 126), prop('tag', 'glint', 214, 130), frame(null, 0), wait(0.6),
    go('hero', 200, 128, 1.6), wait(0.3), sfx('pickup'), hide('tag'),
    nar('Between the ashes lies a melted brass tag, stamped with a gold V.'),
    say('BULWARK', 'Ezra Vance. The Banker. He signs every fire he starts.'),
    say('SIGHT', 'The Vance Syndicate. Fuel, rail, and a hundred blue coats on the payroll. He wanted something from you, and he is not done looking.'),
    say(H, 'Then we follow the rail. Every Vance depot sits on the Dead Rail.')
  ];

  SCENES.pre_s2 = () => [
    title('CHAPTER 1', 'THE DEAD RAIL', 3.6),
    bg('rail'), cap('THE DEAD RAIL. A TOLL CROSSING.', 3.6),
    act('v1', 'villager', 126, 124, 1), act('v2', 'villager', 142, 128, 1), act('kid', 'kid', 134, 126, 1), act('c1', 'gunner', 176, 122, -1), act('c2', 'gunner', 192, 126, -1),
    ...crew('s2', 'pre', 70, 126), frame(null, 0), wait(0.8),
    nar('The Dead Rail was the old oil line. Now it is Vance\'s road: a hundred miles of track, a toll at every crossing, a blue coat on every bridge.'),
    say('BLUE COAT', 'Two thimbles a head. Three for the little one. Vance\'s road, Vance\'s rules.'),
    say('FATHER', 'That is all the water we have left. She is eight. Let her through.'),
    say('BLUE COAT', 'Then leave the cart behind. The cart is also water, if you boil it down.'),
    say('SIGHT', 'Whoever owns the fuel owns the road. Whoever owns the road sells the water back to you by the swallow.'),
    cam(240, 92, 1.7, 1), sfx('hit'), wait(0.4), sfx('hit'),
    say('MENDER', 'Do you hear that? Something is knocking inside that engine.'),
    cam(120, 100, 1.4, 0.8), emo('c1', '!', 1),
    say('BLUE COAT', 'Armed party. The toll for weapons is ten thimbles each. Or you can leave them here, with the cart.')
  ];
  SCENES.post_s2 = () => [
    bg('rail'), ...crew('s2', 'post', 110, 126), act('ember', 'ember', 232, 126, -1), prop('fire', 'fire', 246, 128),
    frame(null, 0), wait(0.6),
    nar('Inside the firebox: a stoker bot, chained to the boiler, still shovelling coal that is not there.'),
    go('hero', 214, 128, 1.8), sfx('hit'), shake(3), flash(), hide('fire'),
    say('EMBER', 'Twelve years I fed that train. It never moved an inch. Unchain me and I will feed the blue coats to the fire instead.'),
    say('BULWARK', 'A stoker for a train that never runs. I know what that is.'),
    go('ember', 190, 128, 1.2), emo('ember', '!', 1),
    sys('[ EMBER HAS JOINED THE SQUAD ]')
  ];

  SCENES.pre_s16 = () => [
    bg('bridge'), cap('A TRIBUNAL TOLL BRIDGE', 3.4),
    act('judge', 'judge', 214, 118, -1), act('c1', 'gunner', 186, 122, -1), act('c2', 'gunner', 190, 130, -1),
    act('mother', 'villager', 124, 124, 1), act('father', 'villager', 108, 128, 1), act('kid', 'kid', 116, 126, 1), ...crew('s16', 'pre', 60, 126),
    frame(null, 0), wait(0.8),
    say('JUDGE VERITY', 'Case two thousand two hundred and ten. The defendants stand accused of crossing without toll.'),
    say('JUDGE VERITY', 'Verdict: guilty. Sentence: confiscation of one wagon and its contents. The court thanks you for your patience.'),
    say('MOTHER', 'That wagon is everything we own. We are going to the Ice House, there is work there, there are seeds!'),
    say('JUDGE VERITY', 'The law does not ask what a wagon is for. It asks whether the toll was paid.'),
    go('hero', 112, 128, 1.2), cam(130, 102, 1.6, 0.6),
    say(H, 'The law was bought, Judge. Everyone on this bridge knows who by.'),
    say('JUDGE VERITY', 'The law was written by those who could afford the pen. That does not make it less law.'),
    { k: 'say', who: '@hero', text: ['I have crossed a hundred toll bridges without paying. This one has more guns than most.'], o: 'smuggler' },
    { k: 'say', who: '@hero', text: ['Mail used to cross these bridges free. Somebody changed the law and forgot to tell the mail.'], o: 'courier' },
    emo('judge', '!', 1), shake(3),
    say('JUDGE VERITY', 'Unlicensed armed party, obstructing a verdict. Blue coats: clear the bridge.')
  ];
  SCENES.post_s16 = () => [
    bg('bridge'), ...crew('s16', 'post', 90, 126), act('mother', 'villager', 130, 124, -1), act('father', 'villager', 146, 128, -1), act('kid', 'kid', 138, 126, -1), act('judge', 'judge', 214, 118, -1),
    frame(null, 0), wait(0.6),
    say('JUDGE VERITY', 'The court is adjourned. It will follow you.'), go('judge', 340, 118, 2.4),
    say('MOTHER', 'Thank you. Do you know how it works out here? Calloway sells the water. Vance carries it. The Crows trade it. The Daltons build the barrels.'),
    say('FATHER', 'Four Families, one thirst. And every one of them takes a cut before it reaches our mouths.'),
    go('kid', 112, 128, 1.2), wait(0.4), sfx('pickup'),
    say('CHILD', 'You can have my thimble. Mama says it is the smallest coin there is.'),
    say('MENDER', 'Keep it, {HERO}. It is the smallest coin in the Dust, and the biggest gift anyone will give you this year.'),
    say('SIGHT', 'I once enforced verdicts like hers, in Calloway\'s name. It was easier when I did not ask who paid for them.')
  ];

  SCENES.pre_s3 = () => [
    bg('icehouse'), fx('snow'), cap('THE CALLOWAY ICE HOUSE', 3.4),
    act('d1', 'drone', 200, 108, -1), act('d2', 'drone', 250, 100, -1), ...crew('s3', 'pre', 80, 126), frame(null, 0), wait(0.8),
    nar('The Calloway Ice House stored seeds, medicine and blood for the whole valley. It is the last cold place in the Dust.'),
    go('d1', 160, 108, 2), emo('d1', '?', 1.2),
    sys('[ WATCH DRONE: SCANNING FACE. NO MATCH. ]'), go('d2', 130, 104, 2.4),
    say('MENDER', 'Those drones are not Vance\'s. They scan every face that passes. They are looking for something under the skin.'),
    say('EMBER', 'It is freezing in here, and the machines are watching me. I like neither.'),
    emo('d2', '!', 1), shake(2)
  ];
  SCENES.post_s3 = () => [
    bg('icehouse'), fx('snow'), ...crew('s3', 'post', 100, 126), act('frost', 'frost', 186, 122, -1), frame(null, 0), wait(0.8),
    nar('A cryo unit hums awake. A keeper bot steps out, carrying a tray of frozen seeds.'),
    go('frost', 168, 126, 1.4),
    say('FROST', 'Six thousand varieties, kept cold for twelve years. I was promised that somebody would come back for them.'),
    say('SIGHT', 'Wait. I remember a dais. Three people in a row, each with a hand on a valve wheel. I cannot see their faces.'),
    emo('hero', '...', 1.6), sys('[ FROST HAS JOINED THE SQUAD ]')
  ];

  SCENES.pre_s4 = () => [
    bg('dynamo'), fx('sparks'), cap('THE DEAD DYNAMO', 3.4), ...crew('s4', 'pre', 90, 126), frame(null, 0), wait(0.8),
    nar('The Dead Dynamo powered the whole valley until the Breach. Vance drains it every night to run his walkers.'),
    say('EMBER', 'Walkers. I have heard that word. I want one for a stove.'),
    say('FROST', 'Be careful. Cold metal near a live grid is not a friendship. It is an accident.')
  ];
  SCENES.post_s4 = () => [
    bg('dynamo'), fx('sparks'), ...crew('s4', 'post', 110, 126), act('arc', 'arc', 180, 126, -1), frame(null, 0), wait(0.8),
    say('ARC', 'The grid recognises you. Strange. It only ever answered to the dam keys.'),
    say('MENDER', 'The dam keys? {HERO}... look at your hand.'),
    tint('64,240,224', 0.22), sfx('zap'), emo('hero', '!', 1.4),
    nar('The Seal under {HERO}\'s skin is glowing in time with the grid.'),
    wait(1), tint(null), sfx('bell'),
    nar('Somewhere beyond the walls, a bell tolls. Then another. A column of blue coats is marching on the Dynamo gate.'),
    sys('[ ARC HAS JOINED THE SQUAD ]')
  ];

  SCENES.pre_s17 = () => [
    bg('dynamo'), fx('sparks'), cap('THE DYNAMO GATE', 3), ...crew('s17', 'pre', 80, 126),
    act('judge', 'judge', 262, 118, -1), act('c1', 'gunner', 290, 124, -1), act('c2', 'gunner', 282, 132, -1), act('c3', 'gunner', 246, 130, -1), frame(null, 0), wait(0.8),
    sfx('bell'),
    say('JUDGE VERITY', 'Court is in session. Case zero zero zero one: the Breach.'),
    say('JUDGE VERITY', 'Defendant: the bearer of the Calloway Seal. It resonates in this room. I can hear it from the gate.'),
    say('SIGHT', 'Judge. You know the Breach was no accident. You stamped the report yourself.'),
    say('JUDGE VERITY', 'I stamped what I was given. A stamp is not a belief.'),
    say(H, 'I do not know what I did.'),
    say('JUDGE VERITY', 'Then the court will find out. Every Keyholder is guilty by statute until proven otherwise.'),
    say('EMBER', 'A court with no defence. I know a better argument.'),
    emo('judge', '!', 1), shake(4)
  ];
  SCENES.post_s17 = () => [
    bg('dynamo'), fx('sparks'), ...crew('s17', 'post', 100, 126), act('judge', 'judge', 230, 124, -1), frame(null, 0), wait(0.8),
    say('JUDGE VERITY', 'Verdict... suspended. Appeal... pending.'),
    say('JUDGE VERITY', 'The warrant was signed by the Banker. The date is wrong. It was issued before the crime.'),
    say('MENDER', 'Before the Breach?'),
    say('JUDGE VERITY', 'Before the first arrest. He signs every warrant first. It saves time.'),
    say('SIGHT', 'He signs every fire he starts.'),
    say('JUDGE VERITY', 'I am a machine of law. I did not know I was being rented. That is not a sentence I know how to read.'),
    { k: 'alpha', id: 'judge', to: 0.35, t: 2 }, wait(0.4),
    say('MENDER', 'She is not broken. She is thinking. Let her.'),
    say('ARC', 'The grid says the Tribunal has gone quiet from here to the Rail. Somebody is going to notice.')
  ];

  // ---------- chapter 2: THE SABLE MARKET ----------
  SCENES.pre_s5 = () => [
    title('CHAPTER 2', 'THE SABLE MARKET', 3.6),
    bg('market'), fx('stars'), cap('SABLE MARKET. NEUTRAL GROUND.', 3.6),
    act('broker', 'broker', 214, 124, -1), act('b1', 'brute', 60, 118, 1), act('v1', 'villager', 150, 126, 1), act('corva', 'corva', 290, 84, -1), ...crew('s5', 'pre', 96, 128),
    frame(null, 0), wait(0.8),
    nar('Sable Market is neutral ground, until someone pays more. The Crows sell water by the thimble and secrets by the pound.'),
    say('BROKER', 'Welcome, strangers. Water, a thimble a swallow. Secrets, a pound apiece. Today only: one rumour, free.'),
    say(H, 'Why free?'),
    say('BROKER', 'Because it is about you. Ezra Vance holds two Seals already. He needs a third. Word is, it is walking toward him right now.'),
    emo('hero', '!', 1.3), tint('64,240,224', 0.16), wait(0.8), tint(null),
    say('MENDER', 'Your Seal. It just lit up.'),
    cam(270, 90, 1.7, 1.1),
    nar('On the balcony above the stalls, a woman in a feathered hat raises a glass. Then she turns away, and the lanterns close around her.'),
    cam(150, 100, 1.4, 0.8),
    say('BROKER', 'Corva Sable sees everything that walks through her market. She does not take sides. She takes a percentage.')
  ];
  SCENES.post_s5 = () => [
    bg('market'), ...crew('s5', 'post', 110, 128), prop('cage', 'cage', 222, 128), act('blade', 'blade', 222, 124, -1), act('corva', 'corva', 290, 84, -1), frame(null, 0), wait(0.8),
    nar('A cage door falls. A purple blur steps out, holding two blades.'),
    go('blade', 196, 126, 1.2), sfx('hit'), hide('cage'),
    say('BLADE', 'The Tribunal sent me to cut down a crowd of thirsty settlers. I refused. Judge Verity sentenced me to rust in a Sable cage.'),
    say('BLADE', 'Point me at someone who deserves it.'),
    say('SIGHT', 'Judge Verity is offline, for now. She was reading a warrant that had been signed before the crime.'),
    say('BLADE', 'Then she has finally been sentenced to something. I will think about whether that is justice.'),
    cam(270, 90, 1.7, 0.9), emo('corva', '!', 1), cam(150, 100, 1.4, 0.8),
    sys('[ BLADE HAS JOINED THE SQUAD ]')
  ];

  SCENES.pre_s18 = () => [
    bg('road'), fx('dust'), cap('THE COURIER ROAD', 3.2), prop('wagon', 'wagon', 250, 126), act('corva', 'corva', 210, 124, -1), ...crew('s18', 'pre', 90, 126), frame(null, 0), wait(0.8),
    say('CORVA', 'Keyholder. You walk in the open like someone who has never been hunted. How charming.'),
    say(H, 'You know what I am.'),
    say('CORVA', 'I hear everything. It is the whole business. I also hear that you need to cross Dalton country, and that the Daltons are neutral, which means they charge everyone.'),
    say('CORVA', 'I have a wagon of mail bound for the Wreck Yard. Rust Riders want it. The Daltons deny hiring them, which is how I know they did.'),
    say(H, 'What do you get out of it?'),
    say('CORVA', 'A reputation for delivering. It is the only thing I own that cannot be stolen.'),
    say('SIGHT', 'Every road in the Dust runs through somebody\'s toll. Hers runs on trust. That is rarer, and more expensive.'),
    emo('corva', 'note', 1.4)
  ];
  SCENES.post_s18 = () => [
    bg('road'), ...crew('s18', 'post', 110, 126), prop('wagon', 'wagon', 250, 126), prop('mail', 'bundle', 224, 130), act('corva', 'corva', 200, 124, -1), frame(null, 0), wait(0.6),
    say('MENDER', 'Letters. Hundreds of them. "Dear Mama." "Dear Tomas." "If you are reading this, the water is better where I am."'),
    say('CORVA', 'Mail is the only thing that still crosses every Family\'s line. Nobody dares touch a Crow wagon. Nobody but a fool, or a Dalton.'),
    { k: 'say', who: '', text: ['{HERO} knows the weight of undelivered mail. The last letter {HERO} carried for House Calloway never arrived, either.'], o: 'courier' },
    say('CORVA', 'Take the north fork. Ask for Ma Dalton and say that Corva says the account is settled. She will laugh. Let her.'),
    say('CORVA', 'And do come to the auction tomorrow night. I have a lot you may want to see.')
  ];

  SCENES.pre_s19 = () => [
    bg('auction'), cap('SABLE MARKET. THE NIGHT AUCTION.', 3.4), act('corva', 'corva', 160, 112, 1), act('bailiff', 'gunner', 262, 126, -1), act('h1', 'hound', 286, 130, -1), act('h2', 'hound', 296, 124, -1),
    ...crew('s19', 'pre', 70, 128), frame(null, 0), wait(0.8),
    say('CORVA', 'Lot nine. The whereabouts of one Calloway Keyholder, and nothing more. Opening bid: ten barrels.'),
    say('BAILIFF', 'Twenty.'), say('CORVA', 'Twenty from the gentleman in blue. Do I hear... fifty? Fifty. Sold.'),
    say('CORVA', 'The Keyholder was last seen at the old well in Hollow Creek. Thank you all. Please tip the staff.'),
    emo('corva', '!', 1), say('SIGHT', 'She sold a place you are not.'),
    say('MENDER', 'She sold you, {HERO}, and then she sold the buyer a wrong turn. In the same breath.'),
    emo('h1', '!', 1), emo('h2', '!', 1), shake(3),
    say('BAILIFF', 'My hounds say the Keyholder is not at the well. They say the Keyholder is in this room.'),
    say('CORVA', 'My hall is neutral.'),
    say('BAILIFF', 'Your hall is mine for the next five minutes.')
  ];
  SCENES.post_s19 = () => [
    bg('auction'), ...crew('s19', 'post', 110, 128), act('corva', 'corva', 190, 124, -1), frame(null, 0), wait(0.8),
    say('CORVA', 'Hounds in my hall. Blue coats bleeding on my carpet. That is a considerable fine, Keyholder.'),
    say('CORVA', 'But I am a reasonable woman. I forgive the fine, I tell you where Ezra keeps his ledgers, and in return you owe me one favour. Unnamed. Redeemable once.'),
    choice('CORVA SABLE OFFERS A BARGAIN', [
      { t: '"Done. One favour."', fl: { crow: 'debt' }, steps: [say('CORVA', 'Delightful. A first instalment, so that you know I pay my debts too.'), give(0, 5, '+5 ONYX: Corva pays her first instalment')] },
      { t: '"I pay my own way. Send me the bill."', fl: { crow: 'free' }, steps: [say('CORVA', 'Proud. How rare, and how expensive. Be careful: free people are harder to protect.')] }
    ]),
    { k: 'say', who: 'BLADE', text: ['Never owe a Crow. They collect in ways that are not on the invoice.'], fl: 'crow=debt' },
    say('CORVA', 'Ezra keeps the Seals in his depots east of the Dust Caravan. The ledger will tell you the rest. Mind the hounds; they are very good at their job.')
  ];
})();
