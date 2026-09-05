(() => {
  'use strict';

  const chapters = [...document.querySelectorAll('.chapter')];
  const root = document.documentElement;
  const hud = document.querySelector('.hud');
  const zoneCode = document.querySelector('#zoneCode');
  const zoneName = document.querySelector('#zoneName');
  const statusText = document.querySelector('#statusText');
  const altitude = document.querySelector('#altitude');
  const warning = document.querySelector('#warning');
  const warningTitle = document.querySelector('#warningTitle');
  const warningText = document.querySelector('#warningText');
  const warningLevel = document.querySelector('#warningLevel');
  const motionToggle = document.querySelector('#motionToggle');
  const tickList = document.querySelector('#altimeterTicks');

  const ascentCopy = [
    null,
    ['胸騒ぎ', '風が翼の継ぎ目を探っている。'],
    ['翼端の軋み', '蜜蝋が熱を記憶し、羽根がわずかにずれる。'],
    ['方位喪失', '上と下が入れ替わる。父の声が二重に聞こえる。'],
    ['灼熱警告', '太陽の熱が接合部へ達した。これ以上は危険だ。'],
    ['翼面剝離', '揚力が失われた。空はあなたを下へ押し戻す。'],
    ['帰還不能', '翼は失われた。同じ航路を再び登ることはできない。']
  ];

  let positions = [];
  let lastY = window.scrollY;
  let currentLevel = 0;
  let upwardDistance = 0;
  let lastUpTime = 0;
  let activeUntil = 0;
  let cooldownUntil = 0;
  let safeScrollUntil = 0;
  let lockedFloor = 0;
  let frameRequested = false;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motionOff = localStorage.getItem('ikaros-motion') === 'off';

  function recalculate() {
    positions = chapters.map(section => ({
      top: section.offsetTop,
      bottom: section.offsetTop + section.offsetHeight,
      level: Number(section.dataset.level),
      code: section.dataset.code,
      name: section.dataset.name,
      altitude: Number(section.dataset.altitude)
    }));
    tickList.innerHTML = positions.map((item, index) => {
      const percent = positions.length === 1 ? 0 : index / (positions.length - 1) * 100;
      return `<li style="--tick:${percent}%" data-tick="${index}"></li>`;
    }).join('');
  }

  function getCurrent(y) {
    const probe = y + innerHeight * .44;
    return positions.findLast?.(item => probe >= item.top) || [...positions].reverse().find(item => probe >= item.top) || positions[0];
  }

  function updateHud(item) {
    if (!item || item.level === currentLevel && zoneName.textContent === item.name) return;
    currentLevel = item.level;
    zoneCode.textContent = item.code;
    zoneName.textContent = item.name;
    hud.classList.remove('glitch');
    void hud.offsetWidth;
    if (!reduced && !motionOff) hud.classList.add('glitch');
    document.querySelectorAll('#altimeterTicks li').forEach((tick, i) => tick.classList.toggle('active', i === item.level));
  }

  function triggerAscent(level, y, now) {
    if (now < cooldownUntil || level < 1) return;
    const effectiveLevel = Math.min(6, level);
    const copy = ascentCopy[effectiveLevel];
    activeUntil = now + 800 + effectiveLevel * 180;
    cooldownUntil = activeUntil + 650;
    root.dataset.ascentLevel = String(effectiveLevel);
    root.classList.add('ascent-active');
    warning.classList.add('show');
    warningTitle.textContent = copy[0];
    warningText.textContent = copy[1];
    warningLevel.textContent = ['0','I','II','III','IV','V','VI'][effectiveLevel];
    statusText.innerHTML = '<span aria-hidden="true">△</span> 上昇抵抗 / 警告';
    if (effectiveLevel >= 5) lockedFloor = Math.max(lockedFloor, y + Math.min(150, 55 + effectiveLevel * 12));
  }

  function releaseAscent(now) {
    if (!activeUntil || now < activeUntil) return;
    root.classList.remove('ascent-active');
    warning.classList.remove('show');
    statusText.innerHTML = '<span aria-hidden="true">◇</span> 航跡を追跡中';
    const oldLevel = Number(root.dataset.ascentLevel);
    setTimeout(() => { if (!root.classList.contains('ascent-active')) root.dataset.ascentLevel = '0'; }, 500 + oldLevel * 120);
    activeUntil = 0;
  }

  function render(now) {
    frameRequested = false;
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, y / max));
    const item = getCurrent(y);
    const delta = y - lastY;
    root.style.setProperty('--depth', progress.toFixed(4));
    altitude.textContent = String(Math.round(progress * 6000)).padStart(4, '0');
    updateHud(item);

    const validUp = now > safeScrollUntil && delta < -3 && Math.abs(delta) < innerHeight * .45;
    if (validUp) {
      if (now - lastUpTime > 240) upwardDistance = 0;
      upwardDistance += Math.abs(delta);
      lastUpTime = now;
      const threshold = innerWidth < 720 ? 115 : 90;
      if (upwardDistance >= threshold) {
        triggerAscent(item.level, y, now);
        upwardDistance = 0;
      }
    } else if (delta > 5 || now - lastUpTime > 260) {
      upwardDistance *= .35;
    }

    if (lockedFloor && y < lockedFloor && now < activeUntil && !reduced && !motionOff) {
      safeScrollUntil = now + 90;
      window.scrollTo(0, lockedFloor);
      lastY = lockedFloor;
    } else {
      lastY = y;
      if (now >= activeUntil) lockedFloor = 0;
    }

    chapters.forEach(section => {
      const rect = section.getBoundingClientRect();
      const visual = section.querySelector('.visual');
      if (visual && rect.bottom > 0 && rect.top < innerHeight) visual.style.setProperty('--parallax', ((rect.top / innerHeight) * 42).toFixed(1));
    });
    releaseAscent(now);
  }

  function requestRender() {
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(render);
    }
  }

  document.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', () => { recalculate(); requestRender(); }, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(recalculate, 250), { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    safeScrollUntil = performance.now() + 1400;
    upwardDistance = 0;
    target.scrollIntoView({ behavior: reduced || motionOff ? 'auto' : 'smooth', block: 'start' });
  }));

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: .16 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

  motionToggle.addEventListener('click', () => {
    motionOff = !motionOff;
    root.classList.toggle('motion-off', motionOff);
    motionToggle.setAttribute('aria-pressed', String(motionOff));
    motionToggle.textContent = motionOff ? '演出：OFF' : '演出：標準';
    localStorage.setItem('ikaros-motion', motionOff ? 'off' : 'on');
  });

  const media = matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener?.('change', event => { reduced = event.matches; });
  root.classList.toggle('motion-off', motionOff);
  motionToggle.setAttribute('aria-pressed', String(motionOff));
  motionToggle.textContent = motionOff ? '演出：OFF' : '演出：標準';
  recalculate();
  requestRender();
})();
