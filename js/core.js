"use strict";
/* ============================================================
   core: DOM helpers / random / storage / settings / animation
   (classic scripts, loaded in order — see index.html)
============================================================ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const delay = ms => new Promise(r => setTimeout(r, ms));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];

const mem = {}; // fallback when localStorage is unavailable (private mode, some file:// setups)
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('algo4.' + k);
      return v === null ? (k in mem ? mem[k] : d) : v;
    } catch (e) { return k in mem ? mem[k] : d; }
  },
  set(k, v) {
    mem[k] = String(v);
    try { localStorage.setItem('algo4.' + k, String(v)); } catch (e) {}
  },
};

/* screen-change epoch: pending timeouts / async loops from a left screen must not fire */
let epoch = 0;
function later(ms, fn) {
  const e = epoch;
  setTimeout(() => { if (e === epoch) fn(); }, ms);
}

/* restart a CSS animation class from the top */
function replayAnim(el, cls) {
  el.classList.remove(cls); void el.offsetWidth;
  el.classList.add(cls);
}
const wobble = el => replayAnim(el, 'wobble');

/* settings (persisted) */
let diff = Math.min(2, Math.max(0, parseInt(store.get('diff', '1'), 10) || 0));
let limitMin = parseInt(store.get('limit', '15'), 10); if (isNaN(limitMin)) limitMin = 15;
let pin = store.get('pin', '1234');
let rateOpt = store.get('rate', 'normal');
let muted = store.get('muted', '0') === '1';
