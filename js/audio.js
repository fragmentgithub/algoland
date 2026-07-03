"use strict";
/* ============================================================
   sound (Web Audio, no assets)
============================================================ */
let ac = null;
function ensureAC() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!ac) ac = new AC();
  if (ac.state === 'suspended') ac.resume();
}
function tone(freq, at, dur, type = 'sine', vol = 0.18) {
  if (muted || !ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ac.currentTime + at);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + at + dur);
  o.connect(g).connect(ac.destination);
  o.start(ac.currentTime + at); o.stop(ac.currentTime + at + dur + 0.05);
}
const sfx = {
  tap()  { tone(620, 0, .07, 'triangle', .12); },
  step(n){ tone(420 + n * 55, 0, .16, 'triangle', .18); },
  good() { tone(523, 0, .12, 'triangle'); tone(659, .09, .12, 'triangle'); tone(784, .18, .2, 'triangle'); },
  bad()  { tone(200, 0, .2, 'sawtooth', .08); tone(160, .12, .25, 'sawtooth', .08); },
  win()  { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * .11, .22, 'triangle', .2)); },
  sleep(){ [660, 520, 392].forEach((f, i) => tone(f, i * .3, .4, 'sine', .15)); }
};
document.addEventListener('pointerdown', ensureAC, { capture: true });
