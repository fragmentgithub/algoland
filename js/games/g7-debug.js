"use strict";
/* ============================================================
   GAME 7 — まちがいさがし (spot the bug: compare with the model
   row and fix the one wrong cell — a first taste of debugging)
============================================================ */
games.g7 = (() => {
  const SETS = [
    [ // easy: AB units, 4 cells
      { unit: ['🍎', '🍌'], len: 4 },
      { unit: ['🐶', '🐱'], len: 4 },
      { unit: ['🔴', '🔵'], len: 4 },
      { unit: ['⚽', '🏀'], len: 4 },
      { unit: ['🚗', '🚌'], len: 4 },
    ],
    [ // normal: AB / ABC / AAB, 6 cells
      { unit: ['🍎', '🍌'], len: 6 },
      { unit: ['🐶', '🐱'], len: 6 },
      { unit: ['🔴', '🟡', '🔵'], len: 6 },
      { unit: ['🍓', '🍓', '🍈'], len: 6 },
      { unit: ['🚗', '🚌', '🚓'], len: 6 },
    ],
    [ // hard: longer rows, AABB included
      { unit: ['🍓', '🍓', '🍈'], len: 8 },
      { unit: ['🔴', '🟡', '🔵'], len: 8 },
      { unit: ['🍎', '🍎', '🍌', '🍌'], len: 8 },
      { unit: ['🐶', '🐱', '🐱'], len: 8 },
      { unit: ['🚗', '🚌', '🚓', '🚒'], len: 8 },
    ],
  ];
  let rounds = [], round = 0, wrongIdx = 0, correctEmoji = '', wrongCount = 0;

  function start() { rounds = SETS[diff]; round = 0; startRound(); }

  function startRound() {
    wrongCount = 0;
    renderPips($('#g7pips'), rounds.length, round);
    $('#g7txt').textContent = 'うえの おてほんと ちがう ところを タッチ!';
    speak('うえの おてほんと くらべてみて。まちがってる ところを タッチしてね');

    const { unit, len } = rounds[round];
    const seq = [];
    for (let i = 0; i < len; i++) seq.push(unit[i % unit.length]);

    // swap one cell for a DIFFERENT member of the same unit
    wrongIdx = Math.floor(Math.random() * len);
    correctEmoji = seq[wrongIdx];
    const others = [...new Set(unit)].filter(x => x !== correctEmoji);
    const wrongEmoji = pick(others);

    const model = $('#g7model'); model.innerHTML = '';
    seq.forEach(e => {
      const c = document.createElement('div');
      c.className = 'seqcell'; c.textContent = e;
      model.appendChild(c);
    });

    const row = $('#g7seq'); row.innerHTML = '';
    seq.forEach((e, i) => {
      const b = document.createElement('button');
      b.className = 'seqcell';
      b.textContent = i === wrongIdx ? wrongEmoji : e;
      b.dataset.bug = i === wrongIdx ? '1' : '0';
      b.addEventListener('click', () => onTap(b, i));
      row.appendChild(b);
    });
  }

  function onTap(btn, i) {
    if (i !== wrongIdx) {
      wrongCount++;
      sfx.bad();
      wobble(btn);
      if (wrongCount >= 2) {
        const hint = $('#g7seq .seqcell[data-bug="1"]');
        if (hint) hint.classList.add('hintpulse');
      }
      return;
    }
    wrongCount = 0;
    sfx.good();
    btn.classList.remove('hintpulse');
    btn.textContent = correctEmoji; // the bug gets fixed!
    replayAnim(btn, 'arrive');
    $$('#g7seq .seqcell').forEach(b => b.disabled = true);
    speak('なおったね!');
    later(700, () => finishRound(round === rounds.length - 1, () => { round++; startRound(); }));
  }
  return { start };
})();
