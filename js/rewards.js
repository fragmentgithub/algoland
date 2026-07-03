"use strict";
/* ============================================================
   stars & friends (collection rewards)
============================================================ */
let stars = parseInt(store.get('stars', '0'), 10) || 0;
const FRIENDS = [
  { at: 3,  e: '🐤', n: 'ひよこの ピヨ' },
  { at: 6,  e: '🐰', n: 'うさぎの ミミ' },
  { at: 10, e: '🐼', n: 'パンダの タンタン' },
  { at: 15, e: '🦊', n: 'きつねの コンタ' },
  { at: 20, e: '🐸', n: 'かえるの ケロッピ' },
  { at: 26, e: '🦁', n: 'らいおんの ガオくん' },
  { at: 33, e: '🐘', n: 'ぞうの パオちゃん' },
  { at: 40, e: '🦄', n: 'ユニコーンの キララ' },
  { at: 50, e: '🐲', n: 'ドラゴンの リュウ' },
];
let pendingFriend = null;

function renderStars() {
  $('#starcount').textContent = stars;
  $$('.starcount2').forEach(e => e.textContent = stars);
  renderFriends();
}
function addStar() {
  stars++;
  store.set('stars', stars);
  const justUnlocked = FRIENDS.find(f => f.at === stars);
  if (justUnlocked) pendingFriend = justUnlocked;
  renderStars();
}
function renderFriends() {
  const row = $('#friendrow');
  row.innerHTML = '<span class="rowlabel">おともだち</span>';
  let nextLocked = null;
  FRIENDS.forEach(f => {
    if (stars >= f.at) {
      const b = document.createElement('button');
      b.className = 'friend';
      b.textContent = f.e;
      b.addEventListener('click', () => { sfx.good(); speak(f.n + 'だよ!'); replayAnim(b, 'arrive'); });
      row.appendChild(b);
    } else if (!nextLocked) {
      nextLocked = f;
      const s = document.createElement('span');
      s.className = 'friend locked';
      s.innerHTML = '❓<small>あと⭐' + (f.at - stars) + '</small>';
      row.appendChild(s);
    }
  });
  // milestone decorations next to the title
  $('#decor').textContent = stars >= 50 ? '🌈🏰' : stars >= 25 ? '🌈' : '';
}
renderStars();
