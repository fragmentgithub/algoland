"use strict";
/* ============================================================
   GAME 4 — ロボットのおつかい (hard mode adds rocks)
============================================================ */
games.g4 = (() => {
  const COLS = 5, ROWS = 3;
  const LV = [
    [ { g: [1, 0] }, { g: [2, 0] }, { g: [0, 1] }, { g: [2, 1] } ],
    [ { g: [2, 0] }, { g: [1, 1] }, { g: [3, 1] }, { g: [2, 2] }, { g: [4, 2] } ],
    [
      { g: [2, 1], rocks: [[1, 0]] },
      { g: [3, 1], rocks: [[0, 1], [2, 0]] },
      { g: [2, 2], rocks: [[1, 1]] },
      { g: [4, 2], rocks: [[2, 2], [3, 1]] },
      { g: [4, 1], rocks: [[1, 1], [3, 0]] },
    ],
  ];
  const DECO = ['🌸', '🌼', '🍄', '🌷'];
  let levels = [], level = 0, queue = [];
  // a run is bound to the epoch it started in: any screen change / lock (epoch++)
  // both aborts the loop AND re-enables the buttons — no stuck "running" flag
  let runEpoch = -1;
  const running = () => runEpoch === epoch;
  let rc = 0, rr = 0; // robot logical position

  function start() { levels = LV[diff]; level = 0; buildLevel(); }

  function cellPx() {
    const cell = $('#g4grid .rcell');
    return cell ? cell.getBoundingClientRect().width : 60;
  }
  function placeRobot(c, r, instant) {
    rc = c; rr = r;
    const rb = $('#robot');
    if (instant) rb.style.transition = 'none';
    rb.style.left = (c * cellPx()) + 'px';
    rb.style.top = ((ROWS - 1 - r) * cellPx()) + 'px';
    if (instant) { void rb.offsetWidth; rb.style.transition = ''; }
  }
  const isRock = (lv, c, r) => (lv.rocks || []).some(([rc2, rr2]) => rc2 === c && rr2 === r);

  function buildLevel() {
    queue = []; runEpoch = -1;
    renderPips($('#g4pips'), levels.length, level);
    speak('やじるしを ならべて、ロボットを ほしまで つれていってね');
    const lv = levels[level];
    const grid = $('#g4grid');
    grid.style.gridTemplateColumns = `repeat(${COLS}, var(--cell))`;
    grid.innerHTML = '';
    for (let r = ROWS - 1; r >= 0; r--) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'rcell' + ((c + r) % 2 ? ' alt' : '');
        if (c === lv.g[0] && r === lv.g[1]) cell.textContent = '⭐';
        else if (isRock(lv, c, r)) cell.textContent = '🪨';
        else if (!(c === 0 && r === 0) && Math.random() < 0.1) cell.textContent = pick(DECO);
        grid.appendChild(cell);
      }
    }
    placeRobot(0, 0, true);
    renderQueue();
  }

  function renderQueue() {
    const q = $('#g4queue'); q.innerHTML = '';
    if (queue.length === 0) {
      const hint = document.createElement('span');
      hint.style.opacity = '.45'; hint.style.fontSize = '15px';
      hint.textContent = 'ここに めいれいが ならぶよ';
      q.appendChild(hint);
      return;
    }
    queue.forEach((d, i) => {
      const chip = document.createElement('button');
      chip.className = 'cmdchip arrive';
      chip.textContent = d === 'up' ? '⬆️' : '➡️';
      chip.addEventListener('click', () => {
        if (running()) return;
        sfx.tap(); queue.splice(i, 1); renderQueue();
      });
      q.appendChild(chip);
    });
  }

  $$('#g4 .arrowbtn').forEach(b => b.addEventListener('click', () => {
    if (running() || queue.length >= 9) return;
    sfx.tap();
    queue.push(b.dataset.dir);
    renderQueue();
  }));

  $('#g4go').addEventListener('click', async () => {
    if (running()) return;
    if (queue.length === 0) {
      sfx.bad();
      wobble($('#g4queue'));
      speak('やじるしを おしてから、ゴーだよ');
      return;
    }
    sfx.tap();
    const e = epoch; // abort silently if the child leaves this screen mid-run
    runEpoch = e;
    const lv = levels[level];
    let c = 0, r = 0, failed = false;
    placeRobot(0, 0, true);
    await delay(150);
    if (e !== epoch) return;
    for (let i = 0; i < queue.length; i++) {
      const d = queue[i];
      const nc = c + (d === 'right' ? 1 : 0);
      const nr = r + (d === 'up' ? 1 : 0);
      if (nc >= COLS || nr >= ROWS || isRock(lv, nc, nr)) { failed = true; break; }
      c = nc; r = nr;
      sfx.step(i + 1);
      placeRobot(c, r);
      await delay(440);
      if (e !== epoch) return;
      if (c === lv.g[0] && r === lv.g[1]) break;
    }
    if (!failed && c === lv.g[0] && r === lv.g[1]) {
      await delay(250);
      if (e !== epoch) return;
      runEpoch = -1;
      finishRound(level === levels.length - 1, () => { level++; buildLevel(); });
      return;
    }
    sfx.bad();
    const rb = $('#robot');
    wobble(rb);
    speak('あれれ?もういちど かんがえてみよう');
    await delay(800);
    if (e !== epoch) return;
    rb.classList.remove('wobble');
    placeRobot(0, 0);
    await delay(450);
    if (e !== epoch) return;
    runEpoch = -1;
  });

  window.addEventListener('resize', () => {
    if (!$('#g4').classList.contains('active')) return;
    placeRobot(rc, rr, true);
  });

  return { start };
})();
