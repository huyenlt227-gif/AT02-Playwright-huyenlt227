/**
 * AutoPath AI Course — HTML Slide Deck runtime.
 * Keyboard / touch navigation, 16:9 scaling, progress, overview grid.
 */
(function () {
  'use strict';

  const slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  const total = slides.length;
  let cur = 0;

  const stage = document.getElementById('stage');
  const barFill = document.getElementById('bar-fill');
  const count = document.getElementById('count');
  const tcLabel = document.getElementById('tc-label');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const gridOverlay = document.getElementById('grid-overlay');

  function slideMeta(i) {
    const s = slides[i];
    const tc = s.getAttribute('data-tc');
    const title = s.getAttribute('data-title') || '';
    return { tc, title };
  }

  function go(i) {
    cur = Math.max(0, Math.min(total - 1, i));
    slides.forEach((s, idx) => s.classList.toggle('active', idx === cur));
    const meta = slideMeta(cur);
    tcLabel.textContent = meta.tc ? 'TC-' + meta.tc : (cur === 0 ? 'Cover' : '');
    count.textContent = (cur + 1) + ' / ' + total;
    barFill.style.width = ((cur + 1) / total) * 100 + '%';
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === total - 1;
    if (gridOverlay.classList.contains('show')) renderGrid();
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.min(w / 1280, h / 740);
    stage.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
  }

  function renderGrid() {
    const phases = {};
    slides.forEach((s, i) => {
      const ph = s.getAttribute('data-phase') || '0';
      (phases[ph] = phases[ph] || []).push(i);
    });
    const names = {
      0: 'Deck',
      1: 'Phase 1 · Foundation · Nền tảng',
      2: 'Phase 2 · Core Concepts · Khái niệm cốt lõi',
      3: 'Phase 3 · Running & Evidence · Chạy test & Bằng chứng',
      4: 'Phase 4 · Capstone · Bài tập tổng hợp',
    };
    let html = '<h2>Overview · Tổng quan (' + total + ' slides)</h2>';
    for (const ph of Object.keys(phases)) {
      html += '<div class="g-phase">' + (names[ph] || ph) + '</div><div class="g-grid">';
      for (const i of phases[ph]) {
        const m = slideMeta(i);
        const label = m.tc ? 'TC-' + m.tc + ' · ' + m.title : m.title;
        html += '<button class="g-item' + (i === cur ? ' cur' : '') + '" data-i="' + i + '">' +
          '<span class="gn">' + (i + 1) + '</span>' + label + '</button>';
      }
      html += '</div>';
    }
    gridOverlay.innerHTML = html + '<button class="g-close">Close ✕</button>';
    gridOverlay.querySelectorAll('.g-item').forEach((b) => {
      b.addEventListener('click', () => {
        go(parseInt(b.getAttribute('data-i'), 10));
        gridOverlay.classList.remove('show');
      });
    });
    gridOverlay.querySelector('.g-close').addEventListener('click', () => {
      gridOverlay.classList.remove('show');
    });
  }

  function toggleGrid() {
    if (gridOverlay.classList.contains('show')) {
      gridOverlay.classList.remove('show');
    } else {
      renderGrid();
      gridOverlay.classList.add('show');
    }
  }

  function next() { go(cur + 1); }
  function prev() { go(cur - 1); }

  document.addEventListener('keydown', (e) => {
    if (gridOverlay.classList.contains('show')) {
      if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') toggleGrid();
      return;
    }
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(total - 1); break;
      case 'g':
      case 'G':
        toggleGrid(); break;
    }
  });

  let touchX = 0;
  document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  window.addEventListener('resize', resize);

  go(0);
  resize();
})();