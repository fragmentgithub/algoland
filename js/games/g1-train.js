"use strict";
/* ============================================================
   GAME 1 — すうじのきしゃ (tap numbers in order)
============================================================ */
games.g1 = (() => {
  const CFG = [
    [3, 4, 5],
    [3, 5, 7, 10],
    [5, 8, 10, 12],
  ];
  const COLORS = ['#FF6B6B', '#37B5C9', '#5FCB71', '#9B5DE5', '#FF9F45', '#F45B9E'];
  let rounds = [], round = 0, expected = 1, wrongCount = 0;

  function start() { rounds = CFG[diff]; round = 0; startRound(); }

  function startRound() {
    expected = 1; wrongCount = 0;
    renderPips($('#g1pips'), rounds.length, round);
    const n = rounds[round];
    $('#g1').style.setProperty('--bsz', n > 10 ? 'clamp(52px,10vmin,84px)' : 'clamp(62px,13vmin,104px)');
    $('#g1txt').textContent = `すうじを 1から ${n}まで じゅんばんに タッチ!`;
    speak('すうじを いちから じゅんばんに タッチしてね');
    const area = $('#g1area');
    area.innerHTML = '';
    $('#g1train').innerHTML = '<span class="engine">🚂</span>';

    const rows = n > 10 ? 4 : 3, cols = 4;
    const cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r]);
    const spots = shuffle(cells).slice(0, n);
    const yStep = rows === 4 ? 23 : 30;
    shuffle([...Array(n)].map((_, i) => i + 1)).forEach((num, i) => {
      const [c, r] = spots[i];
      const b = document.createElement('button');
      b.className = 'balloon';
      b.textContent = num;
      b.dataset.num = num;
      b.style.background = COLORS[num % COLORS.length];
      b.style.left = `calc(${6 + c * 24}% + ${Math.random() * 4}%)`;
      b.style.top = `calc(${3 + r * yStep}% + ${Math.random() * 5}%)`;
      b.addEventListener('click', () => onTap(b));
      area.appendChild(b);
    });
  }

  function onTap(b) {
    const num = +b.dataset.num;
    if (num !== expected) {
      wrongCount++;
      sfx.bad();
      wobble(b);
      if (wrongCount >= 2) {
        const hint = $(`#g1area .balloon[data-num="${expected}"]`);
        if (hint) hint.classList.add('hintpulse');
        speak(`つぎは ${expected} だよ`);
      }
      return;
    }
    wrongCount = 0;
    sfx.step(num);
    b.classList.add('popaway');
    b.disabled = true;
    setTimeout(() => b.remove(), 350);
    const car = document.createElement('span');
    car.className = 'traincar arrive';
    car.style.setProperty('--car-c', COLORS[num % COLORS.length]);
    car.textContent = num;
    $('#g1train').appendChild(car);
    $('#g1train').scrollLeft = 99999;
    expected++;
    if (expected > rounds[round]) {
      later(600, () => finishRound(round === rounds.length - 1, () => { round++; startRound(); }));
    }
  }
  return { start };
})();
