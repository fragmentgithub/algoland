"use strict";
/* ============================================================
   GAME 6 — かたちさがし (find by color+shape condition)
============================================================ */
games.g6 = (() => {
  // [key, attributive (before noun), standalone, hex]
  const COLORS = [
    ['red', 'あかい', 'あかいの', '#FF6B6B'],
    ['blue', 'あおい', 'あおいの', '#4D96FF'],
    ['yellow', 'きいろい', 'きいろいの', '#FFD93D'],
    ['green', 'みどりの', 'みどりの', '#5FCB71'],
  ];
  const SHAPES = [['circle', 'まる'], ['square', 'しかく'], ['triangle', 'さんかく'], ['star', 'ほし']];
  const N_ROUNDS = 5;
  let round = 0, target = null;

  function start() { round = 0; startRound(); }

  function comboKey(c, s) { return c[0] + '/' + s[0]; }

  function startRound() {
    renderPips($('#g6pips'), N_ROUNDS, round);
    let combos = [];
    let question = '';
    if (diff === 0) {
      const shape = pick(SHAPES);
      const cols = shuffle(COLORS).slice(0, 4);
      combos = cols.map(c => ({ c, s: shape }));
      target = combos[0];
      question = `${target.c[2]}は どれ?`;
    } else {
      const count = diff === 1 ? 6 : 8;
      const all = [];
      COLORS.forEach(c => SHAPES.forEach(s => all.push({ c, s })));
      combos = shuffle(all).slice(0, count);
      target = pick(combos);
      if (diff === 2) {
        // guarantee near-miss distractors: same color/diff shape + same shape/diff color
        const used = new Set(combos.map(x => comboKey(x.c, x.s)));
        const nonTarget = combos.filter(x => x !== target);
        let ri = 0;
        if (!combos.some(x => x !== target && x.c[0] === target.c[0])) {
          const s2 = pick(SHAPES.filter(s => s[0] !== target.s[0] && !used.has(comboKey(target.c, s))));
          if (s2 && nonTarget[ri]) {
            used.delete(comboKey(nonTarget[ri].c, nonTarget[ri].s));
            nonTarget[ri].c = target.c; nonTarget[ri].s = s2;
            used.add(comboKey(target.c, s2)); ri++;
          }
        }
        if (!combos.some(x => x !== target && x.s[0] === target.s[0])) {
          const c2 = pick(COLORS.filter(c => c[0] !== target.c[0] && !used.has(comboKey(c, target.s))));
          if (c2 && nonTarget[ri]) {
            used.delete(comboKey(nonTarget[ri].c, nonTarget[ri].s));
            nonTarget[ri].c = c2; nonTarget[ri].s = target.s;
            used.add(comboKey(c2, target.s));
          }
        }
      }
      question = `${target.c[1]} ${target.s[1]}は どれ?`;
    }
    combos = shuffle(combos);
    $('#g6txt').textContent = question;
    speak(question);

    const grid = $('#g6grid'); grid.innerHTML = '';
    combos.forEach(({ c, s }) => {
      const b = document.createElement('button');
      b.className = 'shapebtn';
      const sh = document.createElement('div');
      sh.className = 'shape ' + s[0];
      sh.style.background = c[3];
      b.appendChild(sh);
      b.addEventListener('click', () => onPick(b, c, s));
      grid.appendChild(b);
    });
  }

  function onPick(btn, c, s) {
    if (c[0] !== target.c[0] || s[0] !== target.s[0]) {
      sfx.bad();
      wobble(btn);
      return;
    }
    sfx.good();
    btn.classList.add('hintpulse');
    $$('#g6grid .shapebtn').forEach(b => b.disabled = true);
    later(600, () => finishRound(round === N_ROUNDS - 1, () => { round++; startRound(); }));
  }
  return { start };
})();
