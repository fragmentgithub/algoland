"use strict";
/* ============================================================
   speech — pick a real Japanese voice for natural intonation.
   Android Chrome needs several workarounds (do NOT simplify):
   - an utterance queued in the same task as cancel() is silently
     dropped → defer speak() by ~80ms
   - voices load late (getVoices() empty at startup) → re-pick lazily
   - the engine gets stuck "paused" after backgrounding → resume()
     before every speak and on visibilitychange
   - utterances can be GC'd mid-speech → keep a live reference
============================================================ */
let jaVoice = null;
let currentUtterance = null; // GC guard — Android stops speaking if the utterance is collected
let speakTimer = null;

function pickJaVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices().filter(v => (v.lang || '').toLowerCase().startsWith('ja'));
  jaVoice =
    vs.find(v => /Nanami/i.test(v.name)) ||           // Edge natural voice
    vs.find(v => /natural/i.test(v.name)) ||
    vs.find(v => /Google/i.test(v.name)) ||           // Chrome/Android Google 日本語
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
    const synth = speechSynthesis;
    synth.cancel();
    if (speakTimer) clearTimeout(speakTimer);
    const e = epoch; // don't speak for a screen the child already left
    speakTimer = setTimeout(() => {
      try {
        if (muted || e !== epoch) return;
        if (!jaVoice) pickJaVoice(); // Android: voices often arrive after startup
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        if (jaVoice) u.voice = jaVoice;
        u.rate = rateOpt === 'slow' ? 0.78 : 0.95;
        u.pitch = 1.1;
        currentUtterance = u;
        u.onend = u.onerror = () => { if (currentUtterance === u) currentUtterance = null; };
        synth.resume(); // unstick a paused engine (Android after backgrounding)
        synth.speak(u);
      } catch (err) { /* no voice available */ }
    }, 80);
  } catch (err) { /* no voice available */ }
}

/* backgrounding: stop cleanly; foregrounding: unstick the paused engine */
document.addEventListener('visibilitychange', () => {
  if (!('speechSynthesis' in window)) return;
  if (document.hidden) speechSynthesis.cancel();
  else speechSynthesis.resume();
});

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
