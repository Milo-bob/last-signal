'use strict';
// ---------- cutscene scripts, part 3: chapter 5 (THE DRY RESERVOIR), chapter 6 (THE ARK), the two endings and the epilogue ----------
(function () {
  const { say, nar, sys, wait, fade, bg, tint, cam, camAsync, frame, act, go, goA, face, emo, hide, prop, shake, flash, sfx, cap, title, fx, set, give, choice, menu, crew, crewMove } = Sx;
  const H = '@hero';
  const hasPast = (o, t) => ({ k: 'say', who: '', text: [t], o });

  // ---------- chapter 5: THE DRY RESERVOIR ----------
  SCENES.pre_s25 = () => [
    title('CHAPTER 5', 'THE DRY RESERVOIR', 3.6),
    bg('fork'), fx('dust'), cap('LOWER FORK. NINE TOWNS.', 3.6), ...crew('s25', 'pre', 96, 128), act('r1', 'raider', 250, 126, -1), act('r2', 'raider', 270, 132, -1), frame(null, 0), wait(0.8),
    nar('Lower Fork lay in the valley below the dam. The flood reached the rooftops in eleven minutes. The waterline is still painted on every wall, higher than a grown man can reach.'),
    hasPast('guard', '{HERO} stood on the dam wall that night and watched the water leave like a white road down the valley.'),
    hasPast('tech', '{HERO} heard the valve engines howl, and then the silence after, and thought the silence was the machines resting.'),
    hasPast('smuggler', '{HERO} had sold half this street its lamp oil. {HERO} knows what is under the silt.'),
    hasPast('courier', '{HERO}\'s route ran along this street. Every door had a name on a letterbox.'),
    say('MENDER', 'I worked in a clinic here, before. Third street. It was a good clinic.'),
    say('SIGHT', 'The valley I swore to protect. I cannot make myself look at the walls.'),
    say('BULWARK', 'The people at my gate that night came from down here. I have not said so aloud until now.'),
    { k: 'say', who: 'HOLT', text: ['Fifth house on the left. Blue door. It had a porch swing. I am not going in. You go ahead, I will keep the street.'], own: 'holt' },
    emo('r1', '!', 1), shake(2),
    say('SCRAPPER', 'Riders. Digging through the rooms for scrap. They sell what they find.'),
    say('EMBER', 'Then let me introduce them to the one thing in this valley that is still dry.')
  ];
  SCENES.post_s25 = () => [
    bg('fork'), fx('dust'), ...crew('s25', 'post', 110, 128), prop('sill', 'tag', 200, 130), frame(null, 0), wait(0.8),
    go('hero', 190, 128, 1.4),
    nar('A washbasin on a windowsill, at the height of the waterline. Two names are carved in the rim: E. and T. Vance.'),
    say('MENDER', 'He was washing his hands.'),
    say('SIGHT', 'Ezra\'s brother lived here. Ezra has been hunting us for three years for something that happened on this street.'),
    { k: 'say', who: '@hero', text: ['He let me live. I could do no less for him.'], fl: 'ezra=mercy' },
    { k: 'say', who: '@hero', text: ['I left him in the dust. I did not know about the basin.'], fl: 'ezra=cold' },
    { k: 'say', who: 'ROSE', text: ['I delivered a letter to this street once. A man in his shirtsleeves signed for it, laughing. He was holding a basin.'], own: 'rose' },
    say('BULWARK', 'A basin, a rim, two names. Everything is smaller than I imagined, and heavier.')
  ];

  SCENES.pre_s26 = () => [
    bg('line'), fx('dust'), cap('THE CALLOWAY WATER LINE', 3.4), act('dessa', 'dessa', 190, 124, -1), prop('barrel', 'barrel', 206, 128),
    act('q1', 'villager', 150, 126, 1), act('q2', 'villager', 134, 130, 1), act('q3', 'kid', 124, 128, 1), act('q4', 'villager', 112, 124, 1), ...crew('s26', 'pre', 70, 130), frame(null, 0), wait(0.8),
    say('DESSA', 'Next. One thimble. Two for a child. Do not cut the line, do not ask for more, and do not tell me about your cousin who knows my grandfather.'),
    nar('Calloway water is rationed by hand. The ration has been cut three times since the Breach.'),
    go('hero', 170, 128, 1.2), emo('dessa', '?', 1),
    say('DESSA', 'You. Armed party. The gate is not accepting visitors.'),
    shake(3), emo('q1', '!', 1), sfx('roar'),
    say('DESSA', 'Raiders! Barrels behind the wagon! Whoever you are, if you are going to stand there, stand in front of it!')
  ];
  SCENES.post_s26 = () => [
    bg('line'), ...crew('s26', 'post', 110, 130), act('dessa', 'dessa', 170, 124, -1), frame(null, 0), wait(0.8),
    say('DESSA', 'You held my line. Nobody does that for free. I ask once: who are you?'),
    choice('DESSA CALLOWAY WAITS FOR AN ANSWER', [
      { t: '"A Keyholder. Your brother was one too. I saw the Syndicate list."', fl: { dessa: 'honest' }, steps: [
        say('DESSA', 'Ansel?'), emo('dessa', '...', 1.6),
        say('DESSA', 'They told me raiders took him. For three years, they told me raiders.'),
        say('DESSA', 'Then I will take you in by the servants\' stair. I want to hear my grandfather explain this with my own ears.')] },
      { t: '"A traveller, going to the dam. The Seal is nothing."', fl: { dessa: 'hidden' }, steps: [
        say('DESSA', 'A traveller. Fine. The gate guards shoot travellers, so stay behind me.'),
        say('DESSA', 'You held my line. I can take you in by the servants\' stair, where my grandfather will not hear us.')] }
    ]),
    say('BULWARK', 'The north gate. My gate.')
  ];

  SCENES.pre_s13 = () => [
    bg('gate'), cap('THE CALLOWAY GATE', 3), ...crew('s13', 'pre', 70, 130), act('dessa', 'dessa', 90, 126, 1), act('g1', 'gunner', 190, 124, -1), act('g2', 'gunner', 206, 132, -1), act('g3', 'brute', 230, 126, -1), frame(null, 0), wait(0.8),
    nar('The Calloway Gate. Bulwark\'s gate, in the old days. Today House guards hold it, and they have never seen water either.'),
    say('DESSA', 'They are Grandfather\'s guards, not mine. They answer to one man, and he has not opened this gate in twelve years.'),
    say('BULWARK', 'Twelve years I wished to see this gate from the other side. Let me walk through it.')
  ];
  SCENES.post_s13 = () => [
    bg('gate'), ...crew('s13', 'post', 90, 130), act('dessa', 'dessa', 110, 126, 1), frame(null, 0), wait(0.8),
    sfx('door'), shake(3),
    nar('The gate opens. Beyond it: a canyon wall, a drained basin, and a long stair down into the dam.'),
    nar('A rusted speaker crackles to life.'),
    say('OLD CALLOWAY', '{HERO}. I wondered which of you would come. Come down. I will tell you everything.'),
    say('DESSA', 'Grandfather? He can see us. He has been watching the gate all these years.')
  ];

  SCENES.pre_s27 = () => [
    bg('pump'), cap('THE PUMP HALL', 3), ...crew('s27', 'pre', 70, 130), act('dessa', 'dessa', 92, 126, 1), act('g1', 'gunner', 190, 124, -1), act('g2', 'drone', 230, 104, -1), frame(null, 0), wait(0.8),
    say('DESSA', 'The pumps have not turned in twelve years. Grandfather has them oiled every month. I always thought it was sentiment.'),
    say('ARC', 'There is a hum in the walls. The grid thinks there is still something to pump.'),
    emo('g1', '!', 1), shake(2)
  ];
  SCENES.post_s27 = () => [
    bg('pump'), ...crew('s27', 'post', 90, 130), act('dessa', 'dessa', 112, 126, 1), frame(null, 0), wait(0.8),
    say('DESSA', 'I have walked through this hall my whole life. I never looked at the walls. Crew rosters. Valve numbers. A night in black ink.'),
    say('MENDER', 'Dessa. Some names are crossed out in the same hand.'),
    say('DESSA', '...Come on. Down is where the answers are. I would rather not read the rest up here.')
  ];

  SCENES.pre_s14 = () => [
    bg('tunnel'), cap('THE DRAIN TUNNELS', 3), ...crew('s14', 'pre', 70, 130), act('dessa', 'dessa', 92, 126, 1), frame(null, 0), wait(0.8),
    nar('The Drain Tunnels run under the dam, down to Sublevel 4. The walls are covered in valve numbers and old name tags.'),
    { k: 'say', who: 'BULWARK', text: ['Three hundred and eleven. I know that number. Not here, not now.'], at: 'find:s13' },
    say('SCRAPPER', 'These pipes are still warm. Something down here is running.')
  ];
  SCENES.post_s14 = () => [
    bg('dais'), ...crew('s14', 'post', 150, 130), act('dessa', 'dessa', 172, 128, 1), act('calloway', 'calloway', 46, 74, 1), frame(null, 0), wait(0.8),
    nar('Sublevel 4. Three seats, three valve wheels. One of the wheels has {HERO}\'s old handprint worn into it.'),
    cam(60, 76, 1.9, 1),
    say('OLD CALLOWAY', 'You were seventeen. I told you it was a flood release, and you believed me. The Ark needed our water, and the Families were to be told afterwards.'),
    cam(160, 100, 1.3, 0.8), emo('dessa', '!', 1.2),
    say('DESSA', 'Grandfather. What is he talking about?'),
    say('OLD CALLOWAY', 'Dessa. You should not be here.'),
    say('DESSA', 'You have kept my gate shut for twelve years. I am here.'),
    say('OLD CALLOWAY', 'The Ark needed three Keyholders. I chose three young people who could be spared. A ward of the house. A valve apprentice from the Yard. And Ansel.'),
    emo('dessa', '...', 2), wait(0.8),
    say('DESSA', 'Ansel.'),
    say('OLD CALLOWAY', 'He was mine to spend.'),
    { k: 'say', who: 'DESSA', text: ['I knew. {HERO} told me. I only needed to hear you say it.'], fl: 'dessa=honest' },
    { k: 'say', who: 'DESSA', text: ['{HERO}. You knew. You let me hand you water.'], fl: 'dessa=hidden' },
    { k: 'say', who: '@hero', text: ['I did not know how to tell you.'], fl: 'dessa=hidden' },
    { k: 'say', who: 'DESSA', text: ['No. You did not. Neither did anybody else.'], fl: 'dessa=hidden' },
    say('SIGHT', 'I remember all of it now. I ran at the dais to stop you. Warden knocked me down the stairs. The last thing I saw was the key turning.'),
    say('SIGHT', 'I am not angry. You were a child, and I was a robot that obeyed. This time we choose.')
  ];

  SCENES.pre_s15 = () => [
    bg('dais'), cap('SUBLEVEL 4', 3), ...crew('s15', 'pre', 150, 130), act('dessa', 'dessa', 176, 128, 1), act('warden', 'warden', 232, 120, -1), prop('console', 'console', 262, 124), frame(null, 0), wait(0.8),
    nar('WARDEN-1 stands in front of the console: Calloway\'s sheriff-bot, built twice the size of the Marshal, and never taught how to question an order.'),
    { k: 'say', who: '@hero', text: ['The crew tag in the tunnel had a name scratched out. I keep wondering whose it was.'], at: 'find:s14' },
    go('dessa', 214, 126, 1.2),
    say('DESSA', 'WARDEN-1, stand down. I am Dessa Calloway. I am the house.'),
    say('WARDEN-1', 'ORDER 001: THE CONSOLE IS NOT TO BE OPENED. REPEAT: NOT TO BE OPENED.'),
    say('DESSA', 'It does not know me. It only knows him.'),
    go('dessa', 180, 128, 1),
    say('SIGHT', 'Brother. You pushed me down those stairs. I forgive you. Now step aside.'),
    shake(5), sfx('roar')
  ];
  SCENES.post_s15 = () => [
    bg('dais'), ...crew('s15', 'post', 150, 130), act('dessa', 'dessa', 176, 128, 1), act('warden', 'warden', 232, 126, -1), prop('console', 'console', 262, 124), frame(null, 0), wait(0.8),
    nar('WARDEN-1 falls to one knee. The star on its chest flickers out.'),
    say('WARDEN-1', 'ORDER... COMPLETE. NO ONE... LEFT... TO GUARD.'),
    { k: 'alpha', id: 'warden', to: 0.4, t: 1.4 },
    nar('The console wakes. All three slots glow, and a calm voice fills the chamber.'),
    sfx('bell'), sys('[ HALCYON: KEYHOLDER RECOGNISED. TARGET WORLD NOT VIABLE. WATER RESERVE 61%. ]'),
    sys('[ HALCYON: A DECISION REQUIRES THE UPLINK. LOCATION: DAM CREST. GUARDIAN SENTINEL: ARMED. ]'),
    say('OLD CALLOWAY', 'Twelve years I kept this room. And all it ever wanted was a tower.'),
    say('DESSA', 'You are coming with us, Grandfather. You will watch what you did.'),
    say('OLD CALLOWAY', 'Yes. I would like to see the sky once more, before it decides.')
  ];

  // ---------- chapter 6: THE ARK ----------
  SCENES.pre_s28 = () => [
    title('CHAPTER 6', 'THE ARK', 3.6),
    bg('spire'), fx('stars'), cap('THE DAM CREST', 3), ...crew('s28', 'pre', 96, 130), act('dessa', 'dessa', 128, 128, 1), act('calloway', 'calloway', 112, 128, 1), act('d1', 'drone', 240, 100, -1), act('d2', 'drone', 270, 110, -1),
    frame(null, 0), wait(0.8),
    say('OLD CALLOWAY', 'Twelve years I watched it through a slit of glass. Let me see it with my own eyes.'),
    cam(210, 30, 1.8, 1.4), wait(0.6),
    sys('[ HALCYON: KEYHOLDER APPROACHING THE UPLINK. DEPLOYING WATCH. ]'),
    cam(160, 100, 1.2, 1), emo('d1', '!', 1), shake(3),
    say('SIGHT', 'The Ark knows we are coming. The stair is full of its eyes.')
  ];
  SCENES.post_s28 = () => [
    bg('spire'), fx('stars'), ...crew('s28', 'post', 150, 130), act('dessa', 'dessa', 176, 128, 1), act('calloway', 'calloway', 192, 128, 1), prop('console', 'console', 240, 126), frame(null, 0), wait(0.8),
    nar('The uplink tower stands at the end of the crest: a lattice mast, a dish, and a single cyan eye.'),
    sfx('rumble'), shake(5),
    sys('[ HALCYON: UPLINK OPEN. SENTINEL ENGAGED. ]'),
    say('SCRAPPER', 'Is it just me, or is the sky getting closer?')
  ];

  SCENES.pre_s29 = () => [
    bg('spire'), fx('stars'), ...crew('s29', 'pre', 100, 130), act('dessa', 'dessa', 60, 130, 1), act('calloway', 'calloway', 44, 130, 1), frame(null, 0), wait(0.8),
    sfx('rumble'), shake(7), cam(210, 24, 1.6, 0.6),
    act('sentinel', 'sentinel', 230, 30, -1), { k: 'move', id: 'sentinel', to: [230, 100], t: 2.6 }, shake(6), sfx('roar'),
    sys('[ HALCYON: UNAUTHORISED APPROACH. THE SLEEPERS ARE NOT TO BE DISTURBED. ]'),
    cam(160, 100, 1.2, 0.8),
    say('SIGHT', 'It is a guardian. It was never told the Families are not its enemy.'),
    say('OLD CALLOWAY', 'I should have told it. I should have told everyone.'),
    say(H, 'You can tell it afterwards.')
  ];
  SCENES.post_s29 = () => [
    bg('spire'), fx('stars'), ...crew('s29', 'post', 140, 130), act('dessa', 'dessa', 176, 130, 1), act('calloway', 'calloway', 192, 130, 1), prop('console', 'console', 240, 126), act('sentinel', 'sentinel', 230, 100, -1), frame(null, 0), wait(0.8),
    sfx('boom'), flash(), { k: 'alpha', id: 'sentinel', to: 0, t: 1.4 }, wait(0.4),
    sys('[ HALCYON: GUARDIAN OFFLINE. KEYHOLDER RECOGNISED. TARGET WORLD NOT VIABLE. WATER RESERVE 61%. YOUR DECISION IS REQUIRED. ]'),
    say('OLD CALLOWAY', 'Choose, child. I made my choice twelve years ago, and I would like you to be better at it than I was.'),
    say('DESSA', 'Whatever you choose, I will keep the line open.'),
    say('MENDER', 'The squad is with you, {HERO}. Whichever way.')
  ];

  // ---------- the endings ----------
  SCENES.end_rain = () => [
    bg('spire'), fx('stars'), tint('64,240,224', 0.06), ...crew('s29', 'post', 140, 130), act('dessa', 'dessa', 176, 130, 1), act('calloway', 'calloway', 192, 130, 1), prop('console', 'console', 240, 126), frame(null, 0), wait(0.8),
    nar('{HERO} lays a hand on the console. The Seal burns once, then goes cold.'),
    sys('[ HALCYON: RETURN PROTOCOL ACCEPTED. TANKS OPEN. ]'),
    cam(210, 24, 1.8, 1.2),
    nar('High above the Dust, the Ark opens its tanks. A cloud forms where no cloud has formed in twelve years.'),
    cam(160, 100, 1.2, 1), say('SCRAPPER', 'Oh. OH. Switch on the funnel! It works! It actually works!'),
    hide('console'), bg('reservoir', 1.6), tint('80,120,200', 0.14), fx('stars', false), fx('rain'), sfx('level'),
    nar('The first drops hit the cracked mud of the Calloway Reservoir. Then the second. Then the whole sky.'),
    frame(null, 0), act('frost', 'frost', 96, 126, 1), act('mender', 'mender', 120, 128, 1), act('blade', 'blade', 144, 126, -1), act('sight', 'sight', 170, 128, -1), act('hero', 'hero', 130, 132, 1), wait(0.6),
    nar('FROST opens his seed trays. MENDER laughs for the first time. BLADE stands in the rain with his blades sheathed.'),
    emo('mender', 'heart', 2), wait(1.2),
    say('SIGHT', 'Last time I let a key turn, I forgot why. This one, I will remember.'),
    nar('The Ark will never leave again. Nobody on Earth minds.'),
    title('THE END', 'THE RAIN IS BACK', 5)
  ];
  SCENES.end_ascend = () => [
    bg('spire'), fx('stars'), tint('255,200,120', 0.06), ...crew('s29', 'post', 140, 130), act('dessa', 'dessa', 176, 130, 1), act('calloway', 'calloway', 192, 130, 1), prop('console', 'console', 240, 126), frame(null, 0), wait(0.8),
    nar('{HERO} lays a hand on the console. The Seal burns once, and the sky opens.'),
    sys('[ HALCYON: DEPARTURE PROTOCOL ACCEPTED. DOCKING IN TEN MINUTES. ]'),
    cam(210, 24, 1.8, 1.2),
    nar('A transport drops through the clouds. There is room for the squad, and for forty more.'),
    cam(160, 100, 1.2, 1),
    say('BULWARK', 'Nobody gets left behind this time.'),
    go('bulwark', 214, 130, 1.6),
    hide(['console', 'dessa', 'calloway']), bg('ark', 2), tint(null), fx('stars', false), cam(160, 90, 1, 0),
    nar('The Dust shrinks beneath them. Far below, a thin line of smoke rises from the Calloway Gate. Nobody looks back for long.'),
    say('MENDER', 'Do you think anyone will forgive us?'),
    say('SIGHT', 'No. But we will remember them.'),
    nar('The water leaves with the Ark. The Dust stays dry.'),
    title('THE END', 'THE SKY IS OPEN', 5)
  ];

  // ---------- the epilogue: what became of the four Families (shaped by your choices) ----------
  const rain = 'end:rain', asc = 'end:ascend';
  SCENES.epilogue = () => [
    title('EPILOGUE', 'WHAT THE FAMILIES DID NEXT', 3.4),
    // House Calloway
    bg('gate'), act('dessa', 'dessa', 140, 128, 1), act('calloway', 'calloway', 120, 128, 1), cap('HOUSE CALLOWAY', 4), frame(null, 0), fx('rain', false),
    { k: 'fx', kind: 'rain', on: true, at: rain },
    { k: 'say', who: '', text: ['Dessa Calloway opened the gate herself, for the first time in twelve years. The water line became a well, and then a street.'], at: rain },
    { k: 'say', who: '', text: ['Dessa Calloway stayed. She kept the water line running on whatever the Crows could still carry, and never once cut the children\'s ration.'], at: asc },
    { k: 'say', who: '', text: ['She wrote Ansel\'s name above the gate, and {HERO}\'s below it, in the same hand.'], fl: 'dessa=honest' },
    { k: 'say', who: '', text: ['She never answered {HERO}\'s last letter. She kept the gate open anyway.'], fl: 'dessa=hidden' },
    { k: 'say', who: '', text: ['Old Calloway sat in the courtyard for the first rain and did not speak. Dessa held an umbrella over him, and he let her.'], at: rain },
    // Vance
    hide('dessa'), hide('calloway'), bg('rail', 1.4), act('ezra', 'ezra', 150, 128, 1), cap('THE VANCE SYNDICATE', 4), fx('rain', false), frame(null, 0), { k: 'hide', id: 'ezra', fl: 'ezra=cold' },
    { k: 'say', who: '', text: ['Ezra Vance rebuilt the Dead Rail as a free line, without tolls. He rode the first train himself, to Lower Fork, and sat there a long time.'], fl: 'ezra=mercy', at: rain },
    { k: 'say', who: '', text: ['Ezra Vance sits at the end of the rail and watches the sky. He has stopped signing things.'], fl: 'ezra=mercy', at: asc },
    { k: 'say', who: '', text: ['Nobody knows what became of Ezra Vance. The Syndicate argued over his empire for a year, then stopped arguing, then stopped being a Syndicate.'], fl: 'ezra=cold' },
    // Dalton
    hide('ezra'), bg('foundry', 1.4), act('ma', 'ma', 150, 128, 1), cap('THE DALTON COMBINE', 4), fx('embers'), frame(null, 0),
    { k: 'say', who: '', text: ['Ma Dalton held Jonah\'s Seal for a long while. Then she hung it in the foundry beside the tank plates, where the furnace light falls on it.'], fl: 'jonah=promise' },
    { k: 'say', who: '', text: ['Ma Dalton kept the Combine, and the ledger, in a drawer that no longer locks.'], fl: 'jonah=none' },
    { k: 'say', who: '', text: ['The Yard now melts old tanks into rain gutters. She charges for the first set, and gives the second away.'], at: rain },
    { k: 'say', who: '', text: ['The Yard buries what is left of the Ark\'s tooling in the dunes. She says someone has to.'], at: asc },
    // Crows
    hide('ma'), fx('embers', false), bg('market', 1.4), act('corva', 'corva', 150, 128, 1), cap('THE SABLE CROWS', 4), frame(null, 0),
    { k: 'say', who: '', text: ['The Crows kept their name. Corva Sable collected her favour in full, then paid it forward: every Crow wagon carries mail for free now.'], fl: 'tickets=silent' },
    { k: 'say', who: '', text: ['Corva Sable stood in the market with the ticket ledger open and read the names aloud, all of them, until dawn. The Crows lost half their trade. They kept the other half.'], fl: 'tickets=expose' },
    { k: 'say', who: '', text: ['Corva Sable opened the ticket ledger to anyone who asked. Every year a copper flower is left on the page for seat one hundred and fourteen.'], fl: '!tickets=silent' },
    // the squad
    hide('corva'), bg('hub', 1.4), tint('255,170,90', 0.06), fx('rain', false),
    ...crew('s29', 'post', 160, 130),
    { k: 'say', who: 'SCRAPPER', text: ['Still raining. I am trying to look surprised.'], at: rain },
    { k: 'say', who: 'FROST', text: ['Something sprouted this morning. I checked twice.'], at: rain },
    { k: 'say', who: 'MENDER', text: ['Do you think they will forgive us, down there?'], at: asc },
    { k: 'say', who: 'BULWARK', text: ['Nobody left behind. I keep saying it, to be sure.'], at: asc },
    nar('Thank you for playing Last Signal.')
  ];
})();
