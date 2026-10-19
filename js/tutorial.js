'use strict';
// ---------- combat tips (one short hint at a time, next to the action) and the HOW TO PLAY screen ----------
// Tips are driven by what the player does: basic ones (select, move, target) come first and finish as soon as the player does the thing.
// Advanced ones (red zones, elements) only appear after the basics were shown, and only when the situation really happens.
// SAVE.tut[id] = number of times a tip ran out unanswered, or TIP_DONE once the player did it, dismissed it or saw it through.

const TIP_DONE = 9, TIP_MAX_SHOWS = 2, TIP_SECS = 14;
const TIPS = {
  sel: { basic: true, text: 'Your robots fight on their own. Tap a robot or its card to select it (gold frame).' },
  move: { basic: true, text: 'Tap the ground to move the selected robot. Enemies hit the nearest robot, so keep a tank in front.' },
  focus: { basic: true, text: 'Tap an enemy to make the selected robot attack it. Otherwise robots pick the nearest enemy.' },
  ult: { event: true, text: 'ULT ready! Tap the glowing ULT button or press 1, 2, 3. It charges as robots deal and take damage.' },
  slam: { event: true, text: 'Your hero fights too! Tap the SLAM button on its card or press 4: a shockwave that hurts, knocks back, stuns and blocks enemy shots.' },
  zone: { event: true, once: true, adv: true, text: 'Red areas are incoming attacks. Move your robots out before the warning ends.' },
  status: { event: true, once: true, adv: true, text: 'Fire burns, Ice slows. Fire on a chilled enemy (or Ice on a burning one) makes STEAM.' },
  steam: { event: true, once: true, adv: true, text: 'Steam wets enemies for 4 s. A Shock hit on a wet enemy causes OVERLOAD: stun and chain damage.' }
};
const TIP_ORDER = ['zone', 'steam', 'status', 'ult', 'slam', 'sel', 'move', 'focus'];   // events first, then the basics in teaching order

function tipState() { if (!SAVE.tut) SAVE.tut = {}; return SAVE.tut; }
function tipFinished(id) { const n = tipState()[id] | 0; return n >= TIP_DONE || n >= TIP_MAX_SHOWS; }
function tipPassed(id) { return tipFinished(id) || !!B.tipSeen[id]; }   // done earlier, or already shown in this battle
function tipComplete(id) {
  if (tipState()[id] === TIP_DONE) return;
  tipState()[id] = TIP_DONE; B.tipSeen[id] = true; if (B.tip && B.tip.id === id) B.tip = null; saveGame();
}
function tipEligible(id) {
  if (SAVE.tipsOff || tipFinished(id) || (B.tipSeen[id] && !(B.tip && B.tip.id === id))) return false;
  const t = TIPS[id];
  if (id === 'zone') { if (!B.tele.length) return false; }
  else if (t.event && !B.pend[id]) return false;
  if (t.adv && !(tipPassed('sel') && tipPassed('move'))) return false;
  if (id === 'move') return tipPassed('sel');
  if (id === 'focus') return tipPassed('sel') && tipPassed('move');
  return true;
}
// called by the battle code when the player did something, or something happened that a tip is about
function tutEvent(n) {
  if (!B || !SAVE || !SAVE.tut) return;
  if (n === 'sel' || n === 'move' || n === 'focus' || n === 'ult' || n === 'slam') tipComplete(n);   // the player found it without the tip
  else if (n === 'zoneDone') { if (B.tip && B.tip.id === 'zone') tipComplete('zone'); }
  else if (n === 'status') B.pend.status = true;
  else if (n === 'steam') { B.pend.steam = true; B.pend.status = false; tipComplete('status'); }
  else if (n === 'overload') tipComplete('steam');
}
function tutUpdate(dt) {
  if (SAVE.tipsOff || B.state !== 'play' || B.prol) { B.tip = null; return; }
  if (B.t > 1) B.hunters.forEach(h => { if (h.alive && h.charge >= 100) B.pend.ult = true; if (h.isHero && h.alive && h.slamCd <= 0 && B.t > 4) B.pend.slam = true; });
  if (B.t < 1.5) return;
  if (B.tip) {
    B.tip.t += dt;
    if (B.tip.t >= TIP_SECS || (B.tip.id === 'zone' && !B.tele.length && B.tip.t > 3)) {   // ran out: basics and the ULT tip come back next battle, one-off hints are done
      const id = B.tip.id; B.tipSeen[id] = true; B.tip = null;
      tipState()[id] = TIPS[id].once ? TIP_DONE : Math.min(TIP_DONE - 1, (tipState()[id] | 0) + 1); saveGame();
    }
  }
  const next = TIP_ORDER.find(tipEligible);
  if (next && (!B.tip || (next !== B.tip.id && TIPS[next].event && !TIPS[B.tip.id].event))) B.tip = { id: next, t: 0 };
}
function drawTip() {
  if (!B.tip || B.paused || B.state !== 'play') return;
  const x = 916, y = 72, w = 340, lines = wrap(TIPS[B.tip.id].text, w - 28, 17), h = 20 + lines.length * 21 + 46;
  ctx.fillStyle = '#ffd040'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6); ctx.fillStyle = 'rgba(12,14,28,0.92)'; ctx.fillRect(x, y, w, h);
  text('TIP', x + 14, y + 22, 14, '#ffd040');
  lines.forEach((l, i) => text(l, x + 14, y + 44 + i * 21, 17, '#fff'));
  const by = y + h - 36;
  button(x + 14, by, 96, 28, 'GOT IT', () => { tipComplete(B.tip.id); }, false, 16);
  button(x + 126, by, 120, 28, 'HIDE TIPS', () => { SAVE.tipsOff = true; B.tip = null; saveGame(); toastMsg('Tips hidden. Switch them back on under HELP.'); }, false, 16);
}

// ---------- HOW TO PLAY ----------
let helpTopic = 0, helpReturn = 'hub';
function openHelp() { helpReturn = scene; helpTopic = 0; scene = 'help'; Snd.play('ui'); }
const HELP = [
  { title: 'SELECT', lines: ['Tap a robot, or its card at the bottom, to select it.', 'The selected robot has a gold frame on its card and a colored box under its feet.', 'Only the selected robot follows your move and target taps.'] },
  { title: 'MOVE', lines: ['Tap the ground to send the selected robot there. Drag from a robot to steer it. Tap the robot itself to cancel its order.',
    'Enemies attack the nearest robot. Keep sturdy robots like BULWARK in front and fragile ones like SIGHT or MENDER behind.', 'A robot without an order walks by itself to stay in range of its target.'] },
  { title: 'TARGET', lines: ['Tap an enemy to make the selected robot attack it. A small arrow in the robot\'s color marks the target.', 'Moving the robot clears its target.', 'Enemies underground (Dust Worms) cannot be targeted.'] },
  { title: 'AUTO ATTACK', lines: ['Every robot attacks the nearest enemy in range by itself. Melee robots walk up to it, ranged robots keep their distance.',
    'MENDER heals the most hurt friend instead of attacking.', 'Your HERO fights too, up close: two quick jabs, then a heavy third hit that knocks enemies back. Tap the hero to select and move it like a robot.', 'Gold numbers with a ! are critical hits and deal extra damage.'] },
  { title: 'ULTIMATES', lines: ['Each robot has one ultimate. Its bar fills as the robot deals and takes damage.', 'When the ULT button glows gold, tap it or press 1, 2 or 3 (left to right).',
    'Tapping it too early shows the charge. The SQUAD screen explains what each ultimate does.'] },
  { title: 'ELEMENTS', lines: ['FIRE sets an enemy on fire (damage over time). ICE chills it (it moves slower).', 'FIRE + ICE on the same enemy makes STEAM: it and nearby enemies get wet and take damage. Wet enemies have a blue line under their feet.',
    'SHOCK on a wet enemy causes OVERLOAD: heavy damage, a stun, and chain damage to enemies nearby.'] },
  { title: 'RED WARNINGS', lines: ['A red ! over a melee enemy means a hit is coming in a moment. Step away, stun it or knock it back to dodge. The hero SLAM (card button or key 4) also destroys enemy shots.','Red circles and red bars are warnings. The attack lands when the warning ends, and robots inside take damage.', 'Dust Worms and bosses use them. Move the robot away in time by tapping the ground elsewhere.'] },
  { title: 'GEAR AND SETS', lines: ['Win battles and open supply crates to get gear. Equip it in the PREP ROOM: 3 slots per robot.', 'The colored corner of a gear icon shows its set. Wear 2 or 3 pieces of one set for a bonus:']
    .concat(SETS.map(s => s.name + ': 2 pieces ' + s.b2 + ', 3 pieces ' + s.b3)) },
  { title: 'GEAR TRAITS', lines: ['Any gear slot can carry any stat. FINE gear and better also have a TRAIT, shown by the colored tag on the icon. Traits stack when a robot wears two of the same:']
    .concat(FX_IDS.map(k => GEAR_FX[k].name + ' (' + GEAR_FX[k].role + '): ' + GEAR_FX[k].desc)) },
  { title: 'MILESTONES', size: 16, lines: ['Some stages open a new way to play when you clear them for the first time. The story map names them in the REWARD line.']
    .concat(Object.keys(PERKS).map(k => PERKS[k].name + ' (after ' + (STAGES.find(q => q.id === PERKS[k].at) || { name: PERKS[k].at }).name + '): ' + PERKS[k].text))
    .concat(['Onyx pays for ultimate upgrades, set tuning and crate rushing, so each Onyx you spend is a choice. Gold pays for level-ups and reforging.']) },
  { title: 'GOALS', lines: ['Most stages have a GOAL shown at the top left. CLEAR means destroy every wave. Others: beat the clock, hold out for a time, protect an object, or take down the marked enemy.',
    'Every stage also has an optional BONUS. Complete it once for extra Onyx.',
    'Enemies can have traits. SHIELDED ones carry a shield that shock breaks fast. REGEN ones repair themselves until you burn or chill them. VOLATILE ones explode when destroyed.',
    'The story map lists the goal, bonus and traits before you start. Some stages change after you learn something in the story: look for INTEL.'] },
  { title: 'STARS', lines: ['3 stars: no robot went down. 2 stars: one went down. 1 star: two or more.', 'To leave a fight, pause with II or P and choose QUIT STAGE.'] },
  { title: 'CONTROLS', lines: ['Mouse or touch: everything above.', 'Keys: 1 2 3 ultimates, 4 hero SLAM, P pause, F speed x1 / x2, M sound, Backspace pause or go back.'] }
];
function drawHelp() {
  hubBg(); blit(); ctx.fillStyle = 'rgba(8,10,24,0.86)'; ctx.fillRect(0, 0, W, H); topBar('HOW TO PLAY', () => { scene = helpReturn; Snd.play('ui'); });
  HELP.forEach((t, i) => opt(40, 92 + i * 50, 250, 42, t.title, helpTopic === i, () => { helpTopic = i; Snd.play('ui'); }, false, 20));
  panel(330, 92, 910, 500, '#80f0ff');
  const t = HELP[helpTopic]; text(t.title, 360, 144, 36, '#ffd040');
  let y = 190; const fs = t.size || 21;
  t.lines.forEach(l => { wrap(l, 840, fs).forEach((s, k) => { text(s, k ? 384 : 360, y, fs, '#d8e4ff'); y += fs + 7; }); y += 10; });
  button(330, 616, 250, 52, 'REPLAY TIPS', () => { SAVE.tut = {}; SAVE.tipsOff = false; saveGame(); Snd.play('level'); toastMsg('Combat tips will show again in your next battle.'); }, false, 22);
  button(600, 616, 250, 52, 'TIPS: ' + (SAVE.tipsOff ? 'OFF' : 'ON'), () => { SAVE.tipsOff = !SAVE.tipsOff; saveGame(); Snd.play('ui'); }, false, 22);
  text('Combat tips show up once, next to the action, and never cover the controls.', 330, 696, 16, '#8890b0');
}
