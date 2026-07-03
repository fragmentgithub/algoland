"use strict";
/* ============================================================
   GAME 3 — つぎはなあに? (patterns per difficulty)
============================================================ */
games.g3 = (() => {
  const SETS = [
    [ // easy: AB only
      { unit: ['🍎', '🍌'], extra: '🍇' },
      { unit: ['🐶', '🐱'], extra: '🐰' },
      { unit: ['🔴', '🔵'], extra: '🟡' },
      { unit: ['⚽', '🏀'], extra: '🎾' },
      { unit: ['🚗', '🚌'], extra: '🚓' },
    ],
    [ // normal: AB, ABC, AAB
      { unit: ['🍎', '🍌'], extra: '🍇' },
      { unit: ['🐶', '🐱'], extra: '🐰' },
      { unit: ['🔴', '🟡', '🔵'], extra: '🟢' },
      { unit: ['🍓', '🍓', '🍈'], extra: '🍊' },
      { unit: ['🚗', '🚌', '🚓'], extra: '🚒' },
    ],
    [ // hard: AAB, ABC, AABB, ABB, ABCD
      { unit: ['🍓', '🍓', '🍈'], extra: '🍊' },
      { unit: ['🔴', '🟡', '🔵'], extra: '🟢' },
      { unit: ['🍎', '🍎', '🍌', '🍌'], extra: '🍇' },
      { unit: ['🐶', '🐱', '🐱'], extra: '🐰' },
      { unit: ['🚗', '🚌', '🚓', '🚒'], extra: '🚲' },
    ],
  ];
  let rounds = [], round = 0;

  function start() { rounds = SETS[diff]; round = 0; startRound(); }

  function startRound() {
    renderPips($('#g3pips'), rounds.length, round);
    $('#g3txt').textContent = 'つぎに くるのは なあに?';
    speak('ならびかたを よくみてね。つぎに くるのは なあに?');
    const { unit, extra } = rounds[round];
    const shownLen = unit.length * 2 + 1;
    const seq = [];
    for (let i = 0; i < shownLen; i++) seq.push(unit[i % unit.length]);
    const answer = unit[shownLen % unit.length];

    const row = $('#g3seq'); row.innerHTML = '';
    seq.forEach(e => {
      const c = document.createElement('div');
      c.className = 'seqcell'; c.textContent = e;
      row.appendChild(c);
    });
    const q = document.createElement('div');
    q.className = 'seqcell q'; q.textContent = '?';
    row.appendChild(q);

    const family = [...new Set([...unit, extra])];
    const opts = shuffle([answer, ...shuffle(family.filter(x => x !== answer)).slice(0, 2)]);
    const ch = $('#g3choices'); ch.innerHTML = '';
    opts.forEach(e => {
      const b = document.createElement('button');
      b.className = 'choice'; b.textContent = e;
      b.addEventListener('click', () => onPick(b, e, answer, q));
      ch.appendChild(b);
    });
  }

  function onPick(btn, e, answer, qcell) {
    if (e !== answer) {
      sfx.bad();
      wobble(btn);
      return;
    }
    sfx.good();
    qcell.classList.remove('q');
    qcell.textContent = answer;
    qcell.classList.add('arrive');
    $$('#g3choices .choice').forEach(b => b.disabled = true);
    later(700, () => finishRound(round === rounds.length - 1, () => { round++; startRound(); }));
  }
  return { start };
})();
