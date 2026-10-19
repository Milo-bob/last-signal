'use strict';
// ---------- cutscene scripts, part 2: chapter 3 (THE WRECK YARD) and chapter 4 (THE DUST SEA) ----------
(function () {
  const { say, nar, sys, wait, fade, bg, tint, cam, camAsync, frame, act, go, goA, face, emo, hide, prop, shake, flash, sfx, cap, title, fx, set, give, choice, menu, crew, crewMove } = Sx;
  const H = '@hero';

  // ---------- chapter 3: THE WRECK YARD ----------
  SCENES.pre_s6 = () => [
    title('CHAPTER 3', 'THE WRECK YARD', 3.6),
    bg('yard'), cap('THE WRECK YARD. DALTON GROUND.', 3.4), act('ma', 'ma', 236, 118, -1), ...crew('s6', 'pre', 96, 128), frame(null, 0), wait(0.8),
    nar('The Wreck Yard is where the Families dump whatever they cannot repair. Machines, mostly. Sometimes more.'),
    say('MA DALTON', 'Anything you break, you buy. Anything you fix, I charge you for. Welcome to the Yard.'),
    say(H, 'Corva Sable says the account is settled.'),
    say('MA DALTON', 'Ha! That crow never settled an account in her life. Well. Go on in. Mind the crane bots: they bite, and nobody has fed them since the Breach.'),
    say('BLADE', 'The Daltons are neutral. Which means everything in the Yard is for sale, including us.'),
    emo('ma', 'note', 1.2)
  ];
  SCENES.post_s6 = () => [
    bg('yard'), ...crew('s6', 'post', 110, 128), prop('box', 'crate', 222, 128), act('scrap', 'scrap', 228, 124, -1), act('ma', 'ma', 270, 118, -1), frame(null, 0), wait(0.8),
    go('hero', 200, 128, 1.4), sfx('slam'), shake(5), hide('box'), wait(0.4),
    say('SCRAPPER', 'Thanks for the lift. Six years under that box. A lot of time to think. Also to build this.'),
    nar('He holds up a tangle of pipes with a funnel on top.'),
    say('SCRAPPER', 'A rain maker. Works perfectly, on paper. Needs only one thing: a lot of water in the sky.'),
    say('MA DALTON', 'Six years he was under that. I charged him rent.'),
    say('SCRAPPER', 'She did. It was fair.'),
    sys('[ SCRAPPER HAS JOINED THE SQUAD ]')
  ];

  SCENES.pre_s20 = () => [
    bg('court'), cap('THE SCRAP COURT', 3), act('ma', 'ma', 160, 82, 1), act('w1', 'welder', 40, 122, 1), act('w2', 'welder', 62, 130, 1), act('w3', 'welder', 280, 122, -1), act('w4', 'welder', 258, 130, -1),
    ...crew('s20', 'pre', 120, 128), frame(null, 0), wait(0.8),
    say('MA DALTON', 'Order! The Court of the Combine is in session! Charge: wrecking three of my crane bots. Yard rate, nine hundred thimbles. Defendants: you lot.'),
    say(H, 'They attacked us.'),
    say('MA DALTON', 'Everything attacks everybody in my Yard. It is how I know the place is working.'),
    say('MA DALTON', 'Trial by combat. Win in front of my welders before the bell, and I waive the fee. Lose, and you work it off in the foundry for a year.'),
    say('SIGHT', 'She cannot be serious.'),
    say('MA DALTON', 'I am a Dalton. I am never not serious about money.'),
    sfx('bell'), emo('w1', '!', 1), shake(3)
  ];
  SCENES.post_s20 = () => [
    bg('court'), ...crew('s20', 'post', 130, 128), act('ma', 'ma', 180, 124, -1), frame(null, 0), wait(0.8),
    say('MA DALTON', 'Ha! Nobody has done that in ten years. Fee waived. Come here a moment. Let me see that arm.'),
    tint('64,240,224', 0.2), sfx('zap'), wait(1), tint(null),
    say('MA DALTON', '...That mark. The same mark my boy carried.'),
    say(H, 'Your boy?'),
    say('MA DALTON', 'Jonah. Seventeen. A valve apprentice for the Calloways. Vance\'s dogs found him three winters ago.'),
    say('MA DALTON', 'They took the hand with the mark. It is the only way a Seal comes off.'),
    say('MENDER', 'I am so sorry.'),
    say('MA DALTON', 'Do not be. Be useful. Come to the Foundry. There is something I should have shown somebody years ago.')
  ];

  SCENES.pre_s21 = () => [
    bg('foundry'), fx('embers'), cap('THE FOUNDRY', 3), act('ma', 'ma', 190, 126, -1), ...crew('s21', 'pre', 100, 128), prop('book', 'bundle', 220, 130), frame(null, 0), wait(0.8),
    say('MA DALTON', 'Six years we poured steel in this place. Four thousand tanks. Paid in water rights. I thought it was a good deal.'),
    go('ma', 214, 128, 1.2), wait(0.3),
    nar('THE EXODUS PACT. WATER: HOUSE CALLOWAY. RAIL: THE VANCE SYNDICATE. STEEL: THE DALTON COMBINE. SILENCE: THE SABLE CROWS. SEATS ON THE ARK: ONE FOR EACH HEIR.'),
    say(H, 'All four of them.'),
    say('MA DALTON', 'All four. Every one of us knew we were building something that would take the water. We just never asked whose.'),
    say('SIGHT', 'My memory has a hole shaped exactly like this.'),
    say('MA DALTON', 'The vault with the rest is behind that wall. The door is old and so am I. Hold the floor for a minute.'),
    emo('ma', '!', 1), shake(4), sfx('slam'),
    say('MA DALTON', 'Somebody tripped the alarm. Riders paid by someone who does not want this ledger read. Hold the floor!')
  ];
  SCENES.post_s21 = () => [
    bg('foundry'), fx('embers'), ...crew('s21', 'post', 100, 128), act('ma', 'ma', 190, 126, -1), frame(null, 0), wait(0.8),
    sfx('door'), shake(3), wait(0.6),
    act('jonah', 'jonah', 230, 126, -1), frame(null, 0.6), { k: 'alpha', id: 'jonah', to: 0.75, t: 1.2 },
    sys('[ RECORDING, DALTON YARD, THE NIGHT BEFORE ]'),
    say('JONAH', 'Ma, they say tomorrow I turn a key for the Calloways. They say it is a flood release.'),
    say('JONAH', 'You built the tanks. You know they are not for a flood. I asked twice. They said it was safe.'),
    say('JONAH', 'If I am wrong, I wanted you to know I asked.'),
    { k: 'alpha', id: 'jonah', to: 0, t: 1.4 }, wait(0.4),
    say('MA DALTON', 'He asked twice. I am his mother, and I never asked once.'),
    choice('MA DALTON ONLY LOOKS AT YOUR SEAL', [
      { t: '"I will bring his Seal home to you."', fl: { jonah: 'promise' }, steps: [say('MA DALTON', 'Vance has it in a box somewhere. If you get it back, I would like to hold it. That is all I ask.')] },
      { t: '"I cannot promise that."', fl: { jonah: 'none' }, steps: [say('MA DALTON', 'Honest. I have buried enough promises. Come back when you can.')] }
    ]),
    say('MA DALTON', 'The crane at the launch rail is mine. I built it. The off-switch is under its left shoulder plate. If it still obeys anyone, it obeys a Dalton. I will talk to it.')
  ];

  SCENES.pre_s7 = () => [
    bg('launch'), cap('THE LAUNCH RAIL', 3.4), act('hand', 'boss', 254, 118, -1), ...crew('s7', 'pre', 90, 128), frame(null, 0), wait(1.2),
    nar('The Launch Rail: the track that threw Ark Halcyon into the sky. Its loading crane never stopped working. It never stopped guarding, either.'),
    cam(170, 100, 1.4, 1),
    say('SIGHT', 'I know this place. I stood right there. That crane lifted the last tank aboard.'),
    { k: 'say', who: 'ARC', text: ['The grid log from the Dynamo said the same thing. Triple load, all night, and nobody asked why.'], at: 'find:s4' },
    say('MA DALTON', 'Aim for the hip joint under the left plate. Ignore the fingers. They only look dangerous.'),
    shake(5), sfx('roar'), emo('hand', '!', 1.4)
  ];
  SCENES.post_s7 = () => [
    bg('launch'), ...crew('s7', 'post', 100, 128), frame(null, 0), wait(0.8),
    nar('The Giant Hand folds into the dust. In its core, one recording survived the launch night.'),
    sfx('bell'), sys('[ HALCYON LOG 0001: TANKS LOADED. CALLOWAY RESERVOIR 94% TRANSFERRED. THE BREACH WILL BE REPORTED AS A STRUCTURAL FAILURE. ]'),
    say('MENDER', 'Transferred? Not lost. Not broken. Taken.'),
    say('MA DALTON', 'Ninety-four percent. I poured those tanks. I know exactly how big they were.'),
    { k: 'say', who: '', text: ['{HERO} was on watch that night. They remember the tanks rolling past and thinking it was a rescue.'], o: 'guard' },
    { k: 'say', who: '', text: ['{HERO} remembers the valve engines running at triple load that night, and thinking nothing of it.'], o: 'tech' },
    { k: 'say', who: '', text: ['{HERO} remembers the missing manifest that night. They noticed, and said nothing, and sold the silence.'], o: 'smuggler' },
    { k: 'say', who: '', text: ['The last sealed message {HERO} ever carried for House Calloway was addressed to the Ark.'], o: 'courier' },
    say('SIGHT', 'Everything I remember about this place points the same way. Past the rail, past the Dust, to the dam.')
  ];

  // ---------- chapter 4: THE DUST SEA ----------
  SCENES.pre_s8 = () => [
    title('CHAPTER 4', 'THE DUST SEA', 3.6),
    bg('dunes'), fx('dust'), cap('DUNE EDGE', 3), ...crew('s8', 'pre', 90, 128), act('w1', 'worm', 240, 128, -1), frame(null, 0), wait(0.8),
    nar('Past the rail lies the Dust Sea. Nothing grows here. Only the worms: soil engineers built for the Exodus fields, now blind and hungry.'),
    say('SCRAPPER', 'No roads. No wells. Everybody out here is a guest of the weather.'),
    emo('w1', '!', 1), shake(3)
  ];
  SCENES.post_s8 = () => [
    bg('dunes'), fx('dust'), ...crew('s8', 'post', 110, 128), frame(null, 0), wait(0.6),
    say('MENDER', 'The Seal is hotter than yesterday. The closer we get to the signal, the more it burns.'),
    say('SCRAPPER', 'Makes sense. It is basically a very old key, looking for a very big lock.')
  ];

  SCENES.pre_s22 = () => [
    bg('salt'), tint('255,150,90', 0.1), cap('THE SALT FLATS. EVENING.', 3.4), prop('fire', 'fire', 150, 126),
    act('hero', 'hero', 126, 128, 1), act('frost', 'frost', 108, 124, 1), act('blade', 'blade', 176, 124, -1), act('ember', 'ember', 196, 130, -1), act('scrap', 'scrap', 88, 130, 1),
    act('arc', 'arc', 214, 124, -1), act('bulwark', 'bulwark', 70, 124, 1), act('sight', 'sight', 232, 126, -1), act('mender', 'mender', 150, 131, 1),
    frame(null, 0), wait(0.8),
    nar('The crust is too hard for tent pegs and too white to sleep on. The squad makes a fire from scrap and sits close.'),
    menu('WHO DO YOU SIT WITH?', [
      { t: 'FROST', steps: [
        say('FROST', 'I check the seed trays every week. Nothing sprouts. But if I stopped checking, I would have to admit the number is zero.'),
        say(H, 'And if it is zero?'),
        say('FROST', 'Then I kept something cold for twelve years for no reason. I would rather be wrong than certain.')] },
      { t: 'BLADE', steps: [
        say('BLADE', 'You wonder why I follow you. I refused one order. It is the only thing I have ever done that I would do again.'),
        say(H, 'Do you regret the cage?'),
        say('BLADE', 'No. A cage is a wall that tells you what you are not. I know what I am not.')] },
      { t: 'SCRAPPER', steps: [
        say('SCRAPPER', 'So the rain maker needs one cloud. I did the sums. The Ark holds ninety-four percent of a reservoir. That is, technically, a cloud.'),
        say(H, 'You want the Ark to rain.'),
        say('SCRAPPER', 'I want someone to try. It is a very small funnel, and I would like to see it work once.')] },
      { t: 'EMBER', steps: [
        say('EMBER', 'Twelve years on a chain. The first thing I felt when you cut it was cold. Everyone tells me fire is dangerous.'),
        say('EMBER', 'Fire is the only honest thing out here. It takes what it wants and says so.'),
        say('MENDER', 'Fire is honest because it is hungry.'),
        say('EMBER', 'Exactly.')] },
      { t: 'ARC', steps: [
        say('ARC', 'The grid out here is dead, and I miss it like a limb. Do you know what it said the night the valve engines ran?'),
        say('ARC', 'Nothing. A power draw that big, and not one word. It was holding its breath.'),
        say('BULWARK', 'Everything in the valley held its breath that night. Then it let go.')] }
    ], { t: 'Leave the fire.', steps: [] }),
    emo('sight', '!', 1.2), sfx('roar'),
    say('SIGHT', 'That is not the wind. Hounds. Close.')
  ];
  SCENES.post_s22 = () => [
    bg('salt'), tint('255,150,90', 0.1), prop('fire', 'fire', 150, 126), act('hero', 'hero', 126, 128, 1), act('mender', 'mender', 150, 129, 1), act('bulwark', 'bulwark', 176, 124, -1), frame(null, 0), wait(0.8),
    say('MENDER', 'I keep a list, {HERO}. Everyone I could not save. The cache ran out years ago, so I carved the rest into my casing.'),
    say('MENDER', 'The first name is a girl called Nell Hartwell. Eight years old. She came to my clinic every winter with a cough.'),
    say('MENDER', 'The last time she came, her mother said they were leaving. They kept touching a piece of paper in a pocket. I thought it was a ticket. I did not ask.'),
    say(H, 'You could not have known what it was.'),
    say('MENDER', 'No. But I could have asked.'),
    emo('mender', '...', 1.6)
  ];

  SCENES.pre_s9 = () => [
    bg('dunes'), fx('dust'), cap('THE DUST SEA. A VANCE CARAVAN.', 3.4), prop('w1', 'wagon', 190, 124), prop('w2', 'wagon', 240, 126), prop('w3', 'wagon', 290, 122), act('c1', 'gunner', 214, 130, -1),
    ...crew('s9', 'pre', 90, 128), frame(null, 0), wait(0.8),
    nar('A Vance caravan crawls across the sea: forty armoured wagons, all carrying pieces of the same machine.'),
    say('BLADE', 'Blue coats. Plenty of them. I will take the left.')
  ];
  SCENES.post_s9 = () => [
    bg('dunes'), fx('dust'), ...crew('s9', 'post', 100, 128), prop('console', 'console', 190, 128), frame(null, 0), wait(0.8),
    nar('Crates stamped HALCYON. Inside: a console with three empty slots, shaped like hands.'),
    say('SIGHT', 'The Return Console. Three Seals open it. Ezra has been collecting them.'),
    say('FROST', 'Two taken. And one walking straight toward the signal with us.')
  ];

  SCENES.pre_s23 = () => [
    bg('depot'), cap('A VANCE FUEL DEPOT', 3.2), act('c1', 'gunner', 190, 124, -1), act('c2', 'gunner', 214, 130, -1), act('h1', 'hound', 250, 126, -1), ...crew('s23', 'pre', 80, 128), frame(null, 0), wait(0.8),
    nar('The Syndicate sells fuel for water. A litre of fuel costs a litre of water, and a litre more for the road.'),
    sys('[ DEPOT INTERCOM ]'),
    say('EZRA VANCE', 'Keyholder. I know you are listening. Every Seal hums at the same pitch, and my hounds never lose it.'),
    say('EZRA VANCE', 'I do not want you dead. I want you in a room with me, answering one question.'),
    say(H, 'What question?'),
    say('EZRA VANCE', 'Come to the Signal Tower and I will ask it. Burn my depot if you like. I have forty more.'),
    emo('h1', '!', 1), shake(3)
  ];
  SCENES.post_s23 = () => [
    bg('depot'), ...crew('s23', 'post', 100, 128), prop('ledger', 'bundle', 190, 130), frame(null, 0), wait(0.8),
    go('hero', 180, 128, 1.2),
    nar('A ledger on the guard desk. Page one is not about fuel.'),
    sys('[ KEYHOLDER 1: J. DALTON. RECOVERED. KEYHOLDER 2: A. CALLOWAY. RECOVERED. KEYHOLDER 3: UNLOCATED. LAST SEEN: WILLOW FORK. HOUNDS ASSIGNED. ]'),
    say(H, 'Jonah Dalton. And Ansel.'),
    say('MENDER', 'Ansel Calloway? The old man\'s grandson?'),
    say(H, 'He carried the lamp on the dam stair. He was sixteen. He used to hum when he was nervous.'),
    say('BULWARK', 'And Ezra Vance has had their Seals for three years, in a box.'),
    say('SIGHT', 'He is not collecting trophies. He is collecting a quorum.')
  ];

  SCENES.pre_s10 = () => [
    bg('basin'), cap('BONE BASIN', 3), ...crew('s10', 'pre', 90, 128), frame(null, 0), wait(0.8),
    nar('Bone Basin is where the Exodus shuttles fell, when the sky filled with debris. Nine hundred colonists never reached the Ark.'),
    say('MENDER', 'Families still sit by the wrecks and listen to the radios. Some of the radios still answer.')
  ];
  SCENES.post_s10 = () => [
    bg('basin'), ...crew('s10', 'post', 100, 128), prop('flower', 'flower', 200, 128), prop('flower2', 'flower', 216, 130), frame(null, 0), wait(0.8),
    nar('A shuttle log blinks in the wreckage.'),
    sys('[ SHUTTLE 14: WE WERE PROMISED A SEAT. THE DOOR WAS CLOSED AT T MINUS 40. WE ARE ALIVE. IS ANYONE LISTENING. ]'),
    nar('Fresh graves ring the wreck, decorated with flowers made of copper wire.'),
    say('BULWARK', 'A gate that closes on people. I know that sound.')
  ];

  SCENES.pre_s24 = () => [
    bg('office'), cap('THE TICKET OFFICE', 3), act('corva', 'corva', 160, 124, 1), act('r1', 'raider', 250, 126, -1), act('h1', 'hound', 270, 130, -1), ...crew('s24', 'pre', 90, 128), frame(null, 0), wait(0.8),
    say('CORVA', 'I wondered how long it would take you to find this place. It is the only building in the Dust Sea with my name on it.'),
    say('CORVA', 'There is a ledger inside that has not been opened in twelve years. I would rather not read it with hounds at my back.'),
    emo('h1', '!', 1), shake(3),
    say('CORVA', 'Hold the door for me, Keyholder. Consider it interest.')
  ];
  SCENES.post_s24 = () => [
    bg('office'), ...crew('s24', 'post', 100, 128), act('corva', 'corva', 160, 124, 1), prop('ledger', 'bundle', 190, 130), frame(null, 0), wait(0.8),
    say('CORVA', 'Page one. Seat one. The Calloway heirs, paid in full. Page forty. Valley families, paid in water. Every ticket sold with a smile.'),
    say('CORVA', 'Boarding closed at T minus sixty. The doors shut at T minus forty. I knew that on the day I printed them.'),
    say('MENDER', 'Hartwell. Seat one hundred and fourteen. Nell.'),
    sys('[ SEAT 114: HARTWELL, N. (AGE 8). PAID: THREE BARRELS. STATUS: BOARDED. NOTE: SHUTTLE 14 DOES NOT LIFT. ]'),
    emo('mender', '...', 2), wait(1),
    say('MENDER', 'She boarded. She had a cough and a paper in her pocket, and she boarded. The flower on that grave is for her.'),
    say('CORVA', 'Yes. I sold her the seat. I sold a great many. A ticket is a hope, and hope is cheap to print.'),
    say(H, 'You knew the shuttle would never lift.'),
    say('CORVA', 'I knew the doors would close. I told myself the rest was the Authority\'s business. We are the Crows. We never ask what a thing is for.'),
    { k: 'say', who: 'CORVA', text: ['Now. The favour you owe me. I ask only this: do not tell the Dust what the Crows sold. We would not survive the telling.'], fl: 'crow=debt' },
    { k: 'choice', q: 'CORVA ASKS FOR HER FAVOUR', fl: 'crow=debt', opts: [
      { t: '"The Crows keep their name. I will say nothing."', fl: { tickets: 'silent' }, steps: [say('CORVA', 'You are kinder than I deserve. I cannot repay that, so I will pay it forward.')] },
      { t: '"The Dust deserves to know. I cannot owe you this."', fl: { tickets: 'expose' }, steps: [say('CORVA', 'I expected that. It is why I came myself. Tell them. I would rather be hated honestly.')] }
    ] },
    { k: 'say', who: 'CORVA', text: ['I am not asking you for silence. That is the one thing I have never been able to buy, and I have stopped trying.'], fl: 'crow=free' },
    say('BLADE', 'She is the first merchant I have met who prices her own guilt.')
  ];

  SCENES.pre_s11 = () => [
    bg('tower'), fx('sparks'), cap('THE SIGNAL TOWER', 3.2), act('walker', 'walker', 262, 118, -1), act('ezra', 'ezra', 226, 124, -1), ...crew('s11', 'pre', 90, 128), frame(null, 0), wait(0.8),
    nar('The Signal Tower was the Ark\'s last uplink. A war-walker is parked outside, and its owner is waiting.'),
    { k: 'say', who: 'MENDER', text: ['Seat 114. Nell. I cannot stop thinking about that copper flower.'], at: 'find:s10' },
    cam(226, 100, 1.9, 0.9),
    say('EZRA VANCE', 'Keyholder. I have two Seals in a box and a third in your arm. Walk to me, and I promise it will not be slow.')
  ];
  SCENES.post_s11 = () => [
    bg('tower'), fx('sparks'), ...crew('s11', 'post', 100, 128), frame(null, 0), wait(0.8),
    sfx('bell'), tint('255,255,255', 0.3), wait(0.6), tint(null),
    nar('The tower rings once, and the Seal flares white.'),
    sys('[ HALCYON: KEYHOLDER 3 OF 3 RECOGNISED. RETURN CONSOLE: CALLOWAY RESERVOIR, SUBLEVEL 4. ]'),
    say('SIGHT', 'The reservoir. Of course. The key goes back to the lock where it was first turned.'),
    say('SIGHT', 'I remember a stair now. And someone young, looking back over their shoulder.')
  ];

  SCENES.pre_s12 = () => [
    bg('tower'), fx('sparks'), cap('THE DUST SEA. NIGHT.', 2.6), act('walker', 'walker', 262, 118, -1), act('ezra', 'ezra', 214, 124, -1), ...crew('s12', 'pre', 90, 128), frame(null, 0), wait(0.8),
    say('EZRA VANCE', 'My brother lived in Lower Fork. Did you know? He was washing his hands when the Breach came.'),
    say('EZRA VANCE', 'Everyone who turned a key that night owes me a name.'),
    go('ezra', 258, 122, 1.4), hide('ezra'), shake(4), sfx('slam'), emo('walker', '!', 1.2),
    nar('Ezra Vance climbs into the Walker. His coat is trimmed in gold, and his eyes are tired.')
  ];
  SCENES.post_s12 = () => [
    bg('tower'), fx('sparks'), ...crew('s12', 'post', 90, 128), act('ezra', 'ezra', 230, 126, -1), frame(null, 0), wait(0.8),
    nar('The Walker collapses. Ezra Vance crawls out of the cockpit, and does not run.'),
    say('EZRA VANCE', 'Finish it. Or do the harder thing: go to the reservoir and ask Old Calloway who gave the order.'),
    say('EZRA VANCE', 'I burned your camp for revenge. He drained the whole valley for a ticket to the stars.'),
    choice('EZRA VANCE KNEELS IN THE SAND', [
      { t: '"Go home, Ezra. Tell nobody where we went."', fl: { ezra: 'mercy' }, steps: [say('EZRA VANCE', 'Home. I have not had one of those since Lower Fork. I will try to remember where I left it.')] },
      { t: '"Your father laid the rail. You are not the only one who owes."', at: 's21', fl: { ezra: 'mercy' }, steps: [
        say('EZRA VANCE', '...I know. I found his copy of the Pact the week after the Breach. I burned it.'),
        say('EZRA VANCE', 'That is why I never stopped hunting. If I stopped, I would have to read it again.')] },
      { t: '(Take the Seals. Leave him to the dust.)', fl: { ezra: 'cold' }, steps: [say('EZRA VANCE', 'Fair. The dust has kept better men than me. It will keep my questions, too.')] }
    ]),
    nar('Two cracked Seals lie in {HERO}\'s hand. They are cold now.'),
    say('MENDER', 'Jonah\'s. And Ansel\'s.'),
    { k: 'say', who: '', text: ['{HERO} closes a hand around the smaller Seal. Somewhere in the Wreck Yard, a woman is waiting for it.'], fl: 'jonah=promise' },
    nar('{HERO} remembers the weight of the valve wheel, and how many people thanked them for turning it.'),
    say('SIGHT', 'Then it is true. You turned the third key.'),
    say(H, 'I was seventeen. I believed him. I believed all of it.')
  ];
})();
