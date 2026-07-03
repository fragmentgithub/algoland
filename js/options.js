"use strict";
/* ============================================================
   options (PIN-gated)
============================================================ */
$('#gearbtn').addEventListener('click', () => {
  sfx.tap();
  askPin(() => { renderOptions(); $('#options').classList.add('active'); });
});
$('#optclose').addEventListener('click', () => { sfx.tap(); $('#options').classList.remove('active'); });
function renderOptions() {
  $$('#optdiff button').forEach(b => b.classList.toggle('on', +b.dataset.v === diff));
  $$('#optlimit button').forEach(b => b.classList.toggle('on', +b.dataset.v === limitMin));
  $$('#optrate button').forEach(b => b.classList.toggle('on', b.dataset.v === rateOpt));
  $('#optname').value = kidName;
}
$('#optname').addEventListener('change', () => {
  kidName = $('#optname').value.trim().slice(0, 8);
  store.set('kidName', kidName);
  renderKidName();
  if (kidName) speak(kidName + '、こんにちは!');
});
$$('#optdiff button').forEach(b => b.addEventListener('click', () => {
  sfx.tap(); diff = +b.dataset.v; store.set('diff', diff); renderOptions();
}));
$$('#optlimit button').forEach(b => b.addEventListener('click', () => {
  sfx.tap(); limitMin = +b.dataset.v; store.set('limit', limitMin); renderOptions(); renderTimer();
}));
$$('#optrate button').forEach(b => b.addEventListener('click', () => {
  sfx.tap(); rateOpt = b.dataset.v; store.set('rate', rateOpt); renderOptions();
  speak('こんにちは!アルゴランドへ ようこそ!');
}));
$('#pinchange').addEventListener('click', () => {
  sfx.tap();
  openPad('あたらしい 4けたの ばんごう', v1 => {
    openPad('かくにん:もういちど おなじ ばんごう', v2 => {
      if (v1 === v2) {
        pin = v1; store.set('pin', v1);
        sfx.good(); speak('あんしょうばんごうを かえたよ');
      } else {
        sfx.bad(); speak('そろわなかったよ。もういちど やってね');
      }
    });
  });
});
