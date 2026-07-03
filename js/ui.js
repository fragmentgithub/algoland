"use strict";
/* ============================================================
   router / round pips / celebration / friend-unlock chain
============================================================ */
function show(id) {
  epoch++; // invalidate pending timeouts / async loops of the screen we leave
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
$$('.backbtn').forEach(b => b.addEventListener('click', () => { sfx.tap(); show('home'); }));
$$('.card').forEach(c => c.addEventListener('click', () => {
  sfx.tap();
  const g = c.dataset.game;
  show(g);
  games[g].start();
}));
$('#parentbtn').addEventListener('click', () => $('#parent').classList.add('active'));
$('#parentclose').addEventListener('click', () => $('#parent').classList.remove('active'));

function renderPips(el, total, done) {
  el.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const p = document.createElement('i');
    if (i < done) p.classList.add('done');
    el.appendChild(p);
  }
}

const PRAISES = ['すごい!', 'やったね!', 'てんさい!', 'かんぺき!', 'さすが!', 'よくできました!'];
function confettiBurst() {
  const em = ['🎉', '⭐', '✨', '🎈', '💛', '💙'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = pick(em);
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = (1.4 + Math.random() * 1.4) + 's';
    s.style.animationDelay = (Math.random() * .4) + 's';
    s.style.fontSize = (18 + Math.random() * 22) + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3400);
  }
}
let onNextCb = null;
function celebrate(big, onNext) {
  addStar();
  const praise = pick(PRAISES);
  $('#praisetxt').textContent = praise;
  $('#winstars').textContent = big ? '⭐⭐⭐' : '⭐';
  $('#nextbtn').textContent = big ? 'おしまい 🏠' : 'つぎへ ▶';
  onNextCb = onNext;
  $('#overlay').classList.add('active');
  sfx.win(); confettiBurst();
  speak(kidName ? kidName + '、' + praise : praise);
}
function runNext() {
  if (onNextCb) { const cb = onNextCb; onNextCb = null; cb(); }
}
$('#nextbtn').addEventListener('click', () => {
  sfx.tap();
  $('#overlay').classList.remove('active');
  if (pendingFriend) {
    const f = pendingFriend; pendingFriend = null;
    $('#friendemoji').textContent = f.e;
    $('#friendname').textContent = f.n;
    $('#friendol').classList.add('active');
    sfx.win(); confettiBurst();
    speak((kidName ? kidName + 'に ' : '') + 'あたらしい おともだち、' + f.n + 'が きたよ!');
  } else {
    runNext();
  }
});
$('#friendok').addEventListener('click', () => {
  sfx.tap();
  $('#friendol').classList.remove('active');
  runNext();
});

/* game registry — each js/games/*.js adds itself here */
const games = {};

/* helper: end-of-round flow shared by all games */
function finishRound(isLastRound, advance) {
  celebrate(isLastRound, () => {
    if (isLastRound) show('home'); else advance();
  });
}
