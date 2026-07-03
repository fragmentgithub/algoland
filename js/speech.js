"use strict";
/* ============================================================
   speech — pick a real Japanese voice for natural intonation
============================================================ */
let jaVoice = null;
function pickJaVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices().filter(v => (v.lang || '').toLowerCase().startsWith('ja'));
  jaVoice =
    vs.find(v => /Nanami/i.test(v.name)) ||           // Edge natural voice
    vs.find(v => /natural/i.test(v.name)) ||
    vs.find(v => /Google/i.test(v.name)) ||           // Chrome Google 日本語
    vs.find(v => /O-?ren|Kyoko|Otoya/i.test(v.name))||// Safari
    vs[0] || null;
}
if ('speechSynthesis' in window) {
  pickJaVoice();
  speechSynthesis.onvoiceschanged = pickJaVoice;
}
function speak(text) {
  if (muted || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    if (jaVoice) u.voice = jaVoice;
    u.rate = rateOpt === 'slow' ? 0.78 : 0.95;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
  } catch (e) { /* no voice available */ }
}
$$('.speakbtn').forEach(b => b.addEventListener('click', () => {
  sfx.tap();
  speak($('#' + b.dataset.say).textContent);
}));

const muteBtn = $('#mutebtn');
function renderMute() { muteBtn.textContent = muted ? '🔇' : '🔊'; }
muteBtn.addEventListener('click', () => {
  muted = !muted;
  store.set('muted', muted ? '1' : '0');
  if (muted && 'speechSynthesis' in window) speechSynthesis.cancel();
  renderMute(); if (!muted) sfx.good();
});
renderMute();
