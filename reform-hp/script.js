/* =============================================================================
   さくら工務店 — 骨子用スクリプト

   1. スマホ幅のナビ開閉
   2. 施工事例の絞り込み（works.html）

   絞り込みの設計方針：
   - HTMLは最初から全件を書き出しておく。JSが動かない環境でも全部読める
   - 状態は aria-pressed に持たせる。見た目と支援技術で食い違わせない
   - 件数は aria-live="polite" で読み上げる。画面を見ていない人にも結果が伝わる
   - URLのクエリに状態を残すので、絞り込んだ一覧をそのまま人に送れる
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. ナビ開閉 ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('globalnav');

  if (toggle && nav) {
    var mq = window.matchMedia('(max-width: 767px)');

    var applyNav = function (isMobile) {
      nav.hidden = isMobile;
      toggle.setAttribute('aria-expanded', 'false');
    };

    applyNav(mq.matches);
    mq.addEventListener('change', function (e) { applyNav(e.matches); });

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.hidden = open;
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !mq.matches) return;
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      toggle.setAttribute('aria-expanded', 'false');
      nav.hidden = true;
      toggle.focus();
    });
  }

  /* ---------- 2. 施工事例の絞り込み ---------- */
  var filterBox = document.querySelector('[data-filters]');
  var list = document.querySelector('[data-works]');
  if (!filterBox || !list) return;

  var cards = Array.prototype.slice.call(list.querySelectorAll('.work-card'));
  var countEl = filterBox.querySelector('[data-count]');
  var emptyEl = document.querySelector('[data-empty]');
  var state = { cat: 'all', budget: 'all' };

  function render() {
    var shown = 0;

    cards.forEach(function (card) {
      var okCat = state.cat === 'all' || card.dataset.cat === state.cat;
      var okBudget = state.budget === 'all' || card.dataset.budget === state.budget;
      var visible = okCat && okBudget;
      card.hidden = !visible;
      if (visible) shown++;
    });

    filterBox.querySelectorAll('.chip').forEach(function (chip) {
      var on = state[chip.dataset.filter] === chip.dataset.value;
      chip.setAttribute('aria-pressed', String(on));
    });

    if (countEl) countEl.textContent = shown + '件を表示しています';
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  function syncUrl() {
    var params = new URLSearchParams();
    if (state.cat !== 'all') params.set('cat', state.cat);
    if (state.budget !== 'all') params.set('budget', state.budget);
    var q = params.toString();
    // 履歴を増やさず、URLだけ差し替える（戻るボタンを汚さない）
    history.replaceState(null, '', q ? '?' + q : location.pathname);
  }

  filterBox.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    state[chip.dataset.filter] = chip.dataset.value;
    render();
    syncUrl();
  });

  // URLに条件が付いていれば、それを初期状態にする
  var initial = new URLSearchParams(location.search);
  ['cat', 'budget'].forEach(function (key) {
    var v = initial.get(key);
    if (v && filterBox.querySelector('[data-filter="' + key + '"][data-value="' + v + '"]')) {
      state[key] = v;
    }
  });

  render();
})();
