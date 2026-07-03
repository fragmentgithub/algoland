"use strict";
/* ============================================================
   play-time limit (per day) with parental PIN reset
============================================================ */
let locked = false;
let playSec = 0;
function localDay() { // local date, not UTC — the reset should happen at the child's midnight
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
let curDay = localDay();
(function initTimer() {
  if (store.get('playDate', '') !== curDay) {
    store.set('playDate', curDay);
    store.set('playSec', '0');
  }
  playSec = parseInt(store.get('playSec', '0'), 10) || 0;
})();
function renderTimer() {
  const el = $('#timerchip');
  if (!limitMin) { el.textContent = '⏱ ∞'; return; }
  const rem = Math.max(0, limitMin * 60 - playSec);
  el.textContent = '⏱ ' + Math.ceil(rem / 60) + 'ふん';
}
function lockApp() {
  if (locked) return;
  locked = true;
  epoch++; // kill pending round-finish timers and the robot run loop
  store.set('playSec', playSec);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  // nothing may stay interactive above or below the lock
  closePad();
  ['options', 'overlay', 'friendol', 'parent'].forEach(id => $('#' + id).classList.remove('active'));
  pendingFriend = null; onNextCb = null;
  $('#timeup').classList.add('active');
  sfx.sleep();
  speak('きょうは ここまで。また あとで あそぼうね');
}
function unlockApp() {
  playSec = 0;
  store.set('playSec', '0');
  locked = false;
  $('#timeup').classList.remove('active');
  renderTimer();
}
setInterval(() => {
  const day = localDay();
  if (day !== curDay) { // midnight passed while the page stayed open
    curDay = day;
    store.set('playDate', curDay);
    unlockApp();
    return;
  }
  if (document.hidden || locked) return;
  if (!limitMin) { renderTimer(); return; }
  playSec++;
  if (playSec % 10 === 0) store.set('playSec', playSec);
  renderTimer();
  if (playSec >= limitMin * 60) lockApp();
}, 1000);
renderTimer();
// deferred: lockApp touches state declared in scripts loaded after this one (ui.js)
setTimeout(() => { if (limitMin && playSec >= limitMin * 60) lockApp(); }, 0);

$('#timereset').addEventListener('click', () => {
  askPin(() => {
    unlockApp();
    sfx.win();
    speak('おかえり!また あそぼう!');
  });
});
