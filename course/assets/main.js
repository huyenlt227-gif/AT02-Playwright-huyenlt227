/**
 * AutoPath AI Course — shared runtime.
 * Renders the sidebar, pager, progress tracking, code highlighting and the
 * mobile drawer from the LESSONS metadata in nav.js.
 */
(function () {
  'use strict';

  const PROGRESS_KEY = 'autopath-course-progress';

  const currentFile = (window.location.pathname.split('/').pop() || 'index.html');

  function currentIndex() {
    return LESSONS.findIndex((l) => l.file === currentFile);
  }

  function getProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function setProgress(list) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
    } catch (_) {
      /* private mode */
    }
  }

  /* ---------- Sidebar ---------- */

  function renderSidebar() {
    const aside = document.getElementById('sidebar');
    if (!aside) return;

    const done = getProgress();
    const idx = currentIndex();
    const currentId = idx >= 0 ? LESSONS[idx].id : null;
    const passedCount = LESSONS.filter((l) => done.includes(l.id)).length;

    let html = `
      <div class="sidebar-brand">
        <div class="logo">AP</div>
        <div>
          <div class="brand-name">${COURSE.title}</div>
          <div class="brand-sub">${COURSE.subtitle}</div>
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>Tests passed</span><span>${passedCount}/${LESSONS.length}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round((passedCount / LESSONS.length) * 100)}%"></div></div>
      </div>`;

    for (const phase of PHASES) {
      const items = LESSONS.filter((l) => l.phase === phase.id);
      html += `<div class="nav-group">
        <div class="nav-phase">${phase.en} <span style="text-transform:none;letter-spacing:0;color:#5d8293">· ${phase.vi}</span></div>`;
      for (const l of items) {
        const isActive = l.id === currentId;
        const state = done.includes(l.id)
          ? '<span class="state pass"></span>'
          : isActive
            ? '<span class="state current"></span>'
            : '<span class="state"></span>';
        html += `<a class="nav-item${isActive ? ' active' : ''}" href="${l.file}">
          <span class="tc">TC-${l.num}</span>
          <span>${l.en}<br><span style="color:#7ea3b4;font-size:12.5px">${l.vi}</span></span>
          ${state}
        </a>`;
      }
      html += '</div>';
    }

    html += `<div class="sidebar-foot">${COURSE.version} · Playwright + TypeScript</div>`;
    aside.innerHTML = html;
  }

  /* ---------- Topbar crumb ---------- */

  function renderCrumb() {
    const crumb = document.getElementById('crumb');
    if (!crumb) return;
    const idx = currentIndex();
    if (idx < 0) {
      crumb.innerHTML = '<b>Syllabus</b>';
      return;
    }
    const l = LESSONS[idx];
    crumb.innerHTML = `TC-${l.num} &nbsp;/&nbsp; <b>${l.en}</b>`;
  }

  /* ---------- Pager ---------- */

  function renderPager() {
    const pager = document.getElementById('pager');
    if (!pager) return;
    const idx = currentIndex();
    if (idx < 0) return;

    const prev = idx > 0 ? LESSONS[idx - 1] : null;
    const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;

    pager.innerHTML = `
      ${prev
        ? `<a class="prev" href="${prev.file}">
             <div class="dir">← Previous · TC-${prev.num}</div>
             <div class="ttl">${prev.en}</div>
           </a>`
        : '<a class="disabled prev"><div class="dir">Start of the suite</div></a>'}
      ${next
        ? `<a class="next" href="${next.file}">
             <div class="dir">Next · TC-${next.num} →</div>
             <div class="ttl">${next.en}</div>
           </a>`
        : '<a class="disabled next"><div class="dir">Suite complete</div></a>'}`;
  }

  /* ---------- Status chips + mark-as-passed ---------- */

  function togglePassed() {
    const idx = currentIndex();
    if (idx < 0) return;
    const l = LESSONS[idx];
    const list = getProgress();
    const at = list.indexOf(l.id);
    if (at >= 0) list.splice(at, 1);
    else list.push(l.id);
    setProgress(list);
    renderStatus();
    renderSidebar();
    renderBoardStates();
  }

  function renderStatus() {
    const idx = currentIndex();
    if (idx < 0) return;
    const l = LESSONS[idx];
    const passed = getProgress().includes(l.id);

    const statusEl = document.getElementById('tc-status');
    if (statusEl) {
      statusEl.className = 'tc-status ' + (passed ? 'pass' : 'todo');
      statusEl.textContent = passed ? 'PASS' : 'TODO';
    }

    const btn = document.getElementById('btn-pass');
    if (btn) {
      btn.classList.toggle('passed', passed);
      const tick = btn.querySelector('.tick');
      const label = btn.querySelector('.btn-label');
      if (tick) tick.textContent = passed ? '✓' : '+';
      if (label) label.textContent = passed ? 'Passed — click to reopen' : 'Mark lesson as passed';
      if (!btn.dataset.bound) {
        btn.dataset.bound = '1';
        btn.addEventListener('click', togglePassed);
      }
    }
  }

  /* ---------- Syllabus board states (index page) ---------- */

  function renderBoardStates() {
    const done = getProgress();
    document.querySelectorAll('[data-lesson-id]').forEach((row) => {
      const id = row.getAttribute('data-lesson-id');
      const dot = row.querySelector('.lr-state');
      if (dot) dot.className = 'lr-state' + (done.includes(id) ? ' pass' : '');
    });
    const counter = document.getElementById('suite-count');
    if (counter) {
      counter.textContent = `${done.length}/${LESSONS.length} passed`;
    }
  }

  /* ---------- Code highlighting ---------- */

  const TOKEN_RE =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(['"`])(?:\\.|(?!\2)[^\\])*\2|\b(import|from|export|class|extends|implements|abstract|readonly|static|async|await|const|let|var|function|return|new|typeof|instanceof|if|else|for|while|switch|case|break|continue|throw|try|catch|finally|public|private|protected|interface|type|enum|default|void|null|undefined|true|false|this|super|of|in|as|satisfies)\b|\b\d+(?:\.\d+)?\b|\b[A-Z]\w*\b/g;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightBlock(pre) {
    const code = pre.querySelector('code');
    if (!code || code.dataset.highlighted) return;
    code.dataset.highlighted = '1';

    const text = code.textContent;
    let out = '';
    let last = 0;
    TOKEN_RE.lastIndex = 0;

    let m;
    while ((m = TOKEN_RE.exec(text)) !== null) {
      if (m.index > last) out += esc(text.slice(last, m.index));
      const token = m[0];
      let cls = 'tok-t';
      if (m[1]) cls = 'tok-c';
      else if (m[2]) cls = 'tok-s';
      else if (m[3]) cls = 'tok-k';
      else if (/^\d/.test(token)) cls = 'tok-n';
      out += `<span class="${cls}">${esc(token)}</span>`;
      last = m.index + token.length;
    }
    if (last < text.length) out += esc(text.slice(last));
    code.innerHTML = out;
  }

  function initHighlight() {
    document.querySelectorAll('.code code').forEach((el) => {
      highlightBlock(el.closest('pre'));
    });
  }

  /* ---------- Mobile drawer ---------- */

  function initDrawer() {
    const btn = document.getElementById('menu-btn');
    const aside = document.getElementById('sidebar');
    if (!btn || !aside) return;
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    document.body.appendChild(scrim);

    const close = () => {
      aside.classList.remove('open');
      scrim.classList.remove('show');
    };
    btn.addEventListener('click', () => {
      aside.classList.toggle('open');
      scrim.classList.toggle('show');
    });
    scrim.addEventListener('click', close);
    aside.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  /* ---------- Boot ---------- */

  document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    renderCrumb();
    renderPager();
    renderStatus();
    renderBoardStates();
    initHighlight();
    initDrawer();
  });
})();