"use strict";
/* ============================================================
   PIN pad
============================================================ */
let padCb = null, padBuf = '', padLock = false, padTimer = null;
(function buildPad() {
  const grid = $('#padgrid');
  ['1','2','3','4','5','6','7','8','9','⌫','0','✕'].forEach(k => {
    const b = document.createElement('button');
    b.textContent = k;
    b.addEventListener('click', () => {
      sfx.tap();
      if (k === '✕') { closePad(); return; } // cancel always wins, even mid-confirm
      if (padLock) return; // 4 digits already entered — waiting for the confirm timeout
      if (k === '⌫') { padBuf = padBuf.slice(0, -1); renderPadDots(); return; }
      padBuf += k;
      renderPadDots();
      if (padBuf.length === 4) {
        padLock = true;
        const v = padBuf;
        padTimer = setTimeout(() => {
          const cb = padCb;
          closePad();
          if (cb) cb(v);
        }, 180);
      }
    });
    grid.appendChild(b);
  });
})();
function renderPadDots() {
  $('#paddots').textContent = '●'.repeat(padBuf.length) + '○'.repeat(4 - padBuf.length);
}
function openPad(title, cb) {
  padCb = cb; padBuf = ''; padLock = false;
  $('#padtitle').textContent = title;
  renderPadDots();
  $('#pad').classList.add('active');
}
function closePad() {
  if (padTimer) { clearTimeout(padTimer); padTimer = null; }
  padCb = null; padBuf = ''; padLock = false;
  $('#pad').classList.remove('active');
}
function askPin(onOk, title) {
  openPad(title || 'あんしょうばんごうを いれてね', v => {
    if (v === pin) { onOk(); }
    else { sfx.bad(); askPin(onOk, 'ちがうみたい。もういちど!'); }
  });
}
