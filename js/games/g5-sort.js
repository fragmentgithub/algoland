"use strict";
/* ============================================================
   GAME 5 — なかまわけ (classification into baskets)
============================================================ */
games.g5 = (() => {
  const CATS = {
    food:    { icon: '🍽️', label: 'たべもの', c: '#FF9F45', items: ['🍎', '🍌', '🍞', '🍙', '🍰', '🍜', '🍓', '🥕', '🍕', '🍩'] },
    vehicle: { icon: '🚉', label: 'のりもの', c: '#37B5C9', items: ['🚗', '🚌', '🚒', '🚑', '🚲', '🚁', '🚂', '🚀', '⛵', '🛴'] },
    animal:  { icon: '🌳', label: 'いきもの', c: '#5FCB71', items: ['🐶', '🐱', '🐰', '🐼', '🐸', '🐘', '🦒', '🐢', '🐞', '🦉'] },
  };
  function roundsFor() {
    const pairs = [['food', 'vehicle'], ['animal', 'food'], ['vehicle', 'animal']];
    if (diff === 0) return pairs.map(p => ({ cats: p, count: 4 }));
    if (diff === 1) return pairs.map(p => ({ cats: p, count: 6 }));
    return [
      { cats: ['food', 'vehicle'], count: 6 },
      { cats: ['animal', 'food'], count: 6 },
      { cats: ['food', 'vehicle', 'animal'], count: 9 },
    ];
  }
  let rounds = [], round = 0, queue = [], current = null, wrongCount = 0;

  function start() { rounds = roundsFor(); round = 0; startRound(); }

  function startRound() {
    renderPips($('#g5pips'), rounds.length, round);
    const { cats, count } = rounds[round];
    $('#g5txt').textContent = cats.length > 2 ? 'これは どこの なかま かな?' : 'これは どっちの なかま かな?';
    speak('なかまの おうちに いれてあげてね');

    const per = Math.ceil(count / cats.length);
    let items = [];
    cats.forEach(cat => {
      shuffle(CATS[cat].items).slice(0, per).forEach(e => items.push({ e, cat }));
    });
    queue = shuffle(items).slice(0, count);

    const bx = $('#g5baskets'); bx.innerHTML = '';
    cats.forEach(cat => {
      const b = document.createElement('button');
      b.className = 'basket';
      b.dataset.cat = cat;
      b.style.setProperty('--bk-c', CATS[cat].c);
      b.innerHTML = `<span class="bicon">${CATS[cat].icon}</span><span class="blabel">${CATS[cat].label}</span>`;
      b.addEventListener('click', () => onDrop(cat, b));
      bx.appendChild(b);
    });
    next();
  }

  function next() {
    wrongCount = 0;
    $$('#g5baskets .hintpulse').forEach(e => e.classList.remove('hintpulse'));
    current = queue.shift() || null;
    $('#g5left').textContent = current ? '●'.repeat(queue.length + 1) : '';
    const el = $('#g5item');
    if (!current) {
      el.textContent = '';
      later(300, () => finishRound(round === rounds.length - 1, () => { round++; startRound(); }));
      return;
    }
    el.textContent = current.e;
    replayAnim(el, 'arrive');
  }

  function onDrop(cat, basketEl) {
    if (!current) return;
    if (cat !== current.cat) {
      wrongCount++;
      sfx.bad();
      wobble($('#g5item'));
      if (wrongCount >= 2) {
        const hint = $(`#g5baskets .basket[data-cat="${current.cat}"]`);
        if (hint) hint.classList.add('hintpulse');
      }
      return;
    }
    wrongCount = 0;
    $$('#g5baskets .hintpulse').forEach(e => e.classList.remove('hintpulse'));
    current = null; // consume now — double-taps during the pop animation do nothing
    sfx.good();
    replayAnim(basketEl, 'arrive');
    const el = $('#g5item');
    el.classList.remove('wobble');
    el.classList.add('popaway');
    later(350, () => { el.classList.remove('popaway'); next(); });
  }
  return { start };
})();
