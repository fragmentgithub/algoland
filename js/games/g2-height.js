"use strict";
/* ============================================================
   GAME 2 — せいくらべ (selection sort; hard mode adds 大きい順)
============================================================ */
games.g2 = (() => {
  const CFG = [
    [{ n: 3 }, { n: 3 }, { n: 4 }],
    [{ n: 3 }, { n: 4 }, { n: 5 }],
    [{ n: 4 }, { n: 5, rev: true }, { n: 6 }, { n: 6, rev: true }],
  ];
  const THEMES = ['🦒', '🌲', '🚀', '🐧', '🏰', '🌻'];
  let rounds = [], round = 0, nextI = 0, wrongCount = 0, rev = false, count = 0;

  const fontFor = (rank, n) => Math.round(32 + rank * (60 / Math.max(n - 1, 1)));
  const targetRank = i => rev ? count - 1 - i : i;

  function start() { rounds = CFG[diff]; round = 0; startRound(); }

  function startRound() {
    const cfg = rounds[round];
    count = cfg.n; rev = !!cfg.rev;
    nextI = 0; wrongCount = 0;
    renderPips($('#g2pips'), rounds.length, round);
    const emoji = pick(THEMES);
    $('#g2txt').textContent = rev ? 'いちばん おおきいのを タッチ!' : 'いちばん ちいさいのを タッチ!';
    speak(rev
      ? 'こんどは おおきい じゅんばん!いちばん おおきいのを タッチしてね'
      : 'ちいさい じゅんばんに ならべよう。いちばん ちいさいのを タッチしてね');

    const lineup = $('#g2lineup'); lineup.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'slot';
      const sz = fontFor(targetRank(i), count);
      s.style.height = (sz + 26) + 'px';
      s.style.minWidth = (sz + 26) + 'px';
      lineup.appendChild(s);
    }
    const pool = $('#g2pool'); pool.innerHTML = '';
    shuffle([...Array(count)].map((_, i) => i)).forEach(rank => {
      const it = document.createElement('button');
      it.className = 'hitem';
      it.textContent = emoji;
      it.dataset.rank = rank;
      it.style.fontSize = fontFor(rank, count) + 'px';
      it.addEventListener('click', () => onTap(it));
      pool.appendChild(it);
    });
  }

  function onTap(it) {
    const rank = +it.dataset.rank;
    if (rank !== targetRank(nextI)) {
      wrongCount++;
      sfx.bad();
      wobble(it);
      if (wrongCount >= 2) {
        const hint = $(`#g2pool .hitem[data-rank="${targetRank(nextI)}"]`);
        if (hint) hint.classList.add('hintpulse');
      }
      return;
    }
    wrongCount = 0;
    $$('#g2pool .hintpulse').forEach(e => e.classList.remove('hintpulse'));
    sfx.step(nextI + 1);
    const slot = $$('#g2lineup .slot')[nextI];
    it.disabled = true;
    it.classList.remove('wobble');
    it.classList.add('arrive');
    slot.appendChild(it);
    slot.classList.add('filled');
    nextI++;
    if (nextI < count) {
      $('#g2txt').textContent = rev ? 'つぎに おおきいのは どれかな?' : 'つぎに ちいさいのは どれかな?';
    } else {
      later(600, () => finishRound(round === rounds.length - 1, () => { round++; startRound(); }));
    }
  }
  return { start };
})();
