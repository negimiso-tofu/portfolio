/* =============================================================================
   あおば税理士事務所 — 骨子用スクリプト

   今のところ役割は1つだけ：スマホ幅のナビ開閉。
   aria-expanded と hidden を対で切り替えることで、
   見た目・スクリーンリーダー・キーボード操作が食い違わないようにしています。
   Codexへ：演出を足す場合も、この対応関係は崩さないでください。
   ========================================================================== */
(function () {
  'use strict';

  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('globalnav');
  if (!toggle || !nav) return;

  var mq = window.matchMedia('(max-width: 767px)');

  function apply(isMobile) {
    if (isMobile) {
      // スマホ：初期状態は閉じる
      nav.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      // PC：常に表示。hidden を必ず外す
      nav.hidden = false;
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  apply(mq.matches);
  mq.addEventListener('change', function (e) { apply(e.matches); });

  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.hidden = open;
  });

  // Escキーで閉じる
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!mq.matches) return;
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    toggle.setAttribute('aria-expanded', 'false');
    nav.hidden = true;
    toggle.focus();
  });
})();
