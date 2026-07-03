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
  renderVoiceStatus();
  disarmReset(); // opening the panel always starts from the safe state
}
function renderVoiceStatus() {
  const el = $('#voicestatus');
  if (!('speechSynthesis' in window)) { el.textContent = 'この端末は読み上げ非対応です'; return; }
  if (!jaVoice) pickJaVoice();
  el.textContent = jaVoice
    ? '日本語の音声: あり(' + jaVoice.name + ')'
    : '日本語の音声が見つかりません。端末の設定で「テキスト読み上げ」に日本語データを追加してください';
}
$('#voicetest').addEventListener('click', () => {
  sfx.good();
  renderVoiceStatus();
  speak('こんにちは!こえの テストです。きこえたら だいじょうぶ!');
});
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
/* progress reset — destructive, so it needs a second tap within 5s to confirm */
let resetArmed = false, resetTimer = null;
function disarmReset() {
  resetArmed = false;
  if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }
  $('#resetstars').textContent = '⭐と おともだちを リセット';
}
$('#resetstars').addEventListener('click', () => {
  sfx.tap();
  if (!resetArmed) {
    resetArmed = true;
    $('#resetstars').textContent = 'ほんとうに リセット? もういちど タッチ';
    speak('ほんとうに リセットしますか?');
    resetTimer = setTimeout(disarmReset, 5000);
    return;
  }
  stars = 0;
  store.set('stars', '0');
  pendingFriend = null;
  renderStars();
  disarmReset();
  sfx.good();
  speak('せいかを リセットしたよ。また いちから あつめよう!');
});

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
