// ═══════════════════════════════════════════════════════════════════════════
// BUILD ROADMAP ON HOME PAGE
// ═══════════════════════════════════════════════════════════════════════════

// ── State ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'dsml_notes_v3';
let appState = { visited: {}, catOpen: {}, theme: 'light' };
try { appState = { ...appState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch(e) {}

let activeTopic = null;
let searchIndex = [];

// ── Theme ────────────────────────────────────────────────────────────────────
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const icon  = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon)  icon.textContent  = t === 'dark' ? '🌙' : '☀️';
  if (label) label.textContent = t === 'dark' ? 'Dark' : 'Light';
  appState.theme = t;
  saveState();
}
function toggleTheme() {
  applyTheme(appState.theme === 'dark' ? 'light' : 'dark');
}
applyTheme(appState.theme || 'dark');

// ── Persist ──────────────────────────────────────────────────────────────────
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); } catch(e) {}
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
let sbOpen = window.innerWidth > 800;

function buildSidebar() {
  const nav = document.getElementById('sbNav');
  nav.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const hasTopics = cat.topics && cat.topics.filter(t => !t.divider).length > 0;
    if (!hasTopics) {
      // No topics — just a label
      const btn = document.createElement('button');
      btn.className = 'sb-cat';
      btn.innerHTML =
        '<div class="sb-cat-icon">' + cat.emoji + '</div>' +
        '<span class="sb-cat-label">' + cat.label + '</span>';
      btn.onclick = () => {};
      nav.appendChild(btn);
      return;
    }

    const isOpen = appState.catOpen[cat.key] !== false;

    const btn = document.createElement('button');
    btn.className = 'sb-cat' + (isOpen ? ' open' : '');
    btn.dataset.catKey = cat.key;

    // Count available topics
    const availCount = cat.topics.filter(t => !t.divider && TOPIC_CONTENT[t.key]).length;
    const totalCount = cat.topics.filter(t => !t.divider).length;

    btn.innerHTML =
      '<div class="sb-cat-icon">' + cat.emoji + '</div>' +
      '<span class="sb-cat-label">' + cat.label + '</span>' +
      (availCount > 0 ? '<span class="sb-cat-count">' + availCount + '</span>' : '') +
      '<span class="sb-cat-arrow">▶</span>';

    // Topic list
    const topicsDiv = document.createElement('div');
    topicsDiv.className = 'sb-topics' + (isOpen ? ' open' : '');

    cat.topics.forEach(t => {
      if (t.divider) {
        const d = document.createElement('div');
        d.className = 'sb-divider-label';
        d.textContent = t.label;
        topicsDiv.appendChild(d);
        return;
      }
      const tb = document.createElement('button');
      tb.className = 'sb-topic' +
        (activeTopic === t.key ? ' active' : '') +
        (appState.visited[t.key] ? ' read' : '');
      tb.dataset.key = t.key;

      const badge = t.badge
        ? '<span style="margin-left:6px;background:var(--green-dim);color:var(--green);font-size:9px;font-weight:700;border-radius:10px;padding:1px 5px">' + t.badge + '</span>'
        : '';

      if (TOPIC_CONTENT[t.key]) {
        tb.innerHTML = t.label + badge;
        tb.onclick = () => loadTopic(t.key, cat);
      } else {
        tb.innerHTML = t.label + '<span style="margin-left:6px;font-size:9px;color:var(--ink3);background:var(--s2);border-radius:10px;padding:1px 5px">Soon</span>';
        tb.style.opacity = '.5';
        tb.style.cursor = 'default';
      }
      topicsDiv.appendChild(tb);
    });

    btn.onclick = () => {
      const o = topicsDiv.classList.toggle('open');
      btn.classList.toggle('open', o);
      appState.catOpen[cat.key] = o;
      saveState();
    };

    nav.appendChild(btn);
    nav.appendChild(topicsDiv);
  });

  updateProgress();
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sbOverlay');
  sbOpen = !sbOpen;
  if (window.innerWidth <= 800) {
    sb.classList.toggle('show', sbOpen);
    ov.classList.toggle('show', sbOpen);
  } else {
    sb.classList.toggle('hidden', !sbOpen);
  }
}

// ── Navigation ───────────────────────────────────────────────────────────────




// ── Collapsible sections ─────────────────────────────────────────────────────
function makeCollapsible(container) {
  // Step A: wrap h3 sub-topics — collapsed by default
  Array.from(container.querySelectorAll('h3')).forEach(function(h3) {
    var block = document.createElement('div');
    block.className = 'subsection-block collapsed';
    var title = h3.textContent.trim();
    var btn = document.createElement('button');
    btn.className = 'subsection-toggle';
    btn.innerHTML = '<span class="ss-icon">▾</span><span>' + title + '</span>';
    btn.onclick = function() { block.classList.toggle('collapsed'); };
    var body = document.createElement('div');
    body.className = 'subsection-body';
    var sib = h3.nextSibling;
    while (sib && sib.nodeName !== 'H3' && sib.nodeName !== 'H2') {
      var next = sib.nextSibling;
      body.appendChild(sib);
      sib = next;
    }
    h3.parentNode.insertBefore(block, h3);
    block.appendChild(btn);
    block.appendChild(body);
    h3.remove();
  });

  // Step B: wrap h2 sections — collapsed by default
  Array.from(container.querySelectorAll('h2'))
    .filter(function(h) { return !h.classList.contains('roadmap-title'); })
    .forEach(function(h2) {
      var block = document.createElement('div');
      block.className = 'section-block collapsed';
      var numEl = h2.querySelector('.num');
      var numText = numEl ? numEl.textContent.trim() : '';
      if (numEl) numEl.remove();
      var sectionId = h2.id || '';
      var titleText = h2.textContent.trim();
      var btn = document.createElement('button');
      btn.className = 'section-toggle';
      btn.dataset.sectionId = sectionId;
      btn.innerHTML = '<span class="s-icon">▾</span>'
        + (numText ? '<span class="s-num">' + numText + '</span>' : '')
        + '<span class="s-title">' + titleText + '</span>';
      btn.onclick = function() { block.classList.toggle('collapsed'); };
      var body = document.createElement('div');
      body.className = 'section-body';
      body.id = sectionId;
      var sib = h2.nextSibling;
      while (sib) {
        if (sib.nodeName === 'H2' && !sib.classList.contains('roadmap-title')) break;
        var next = sib.nextSibling;
        body.appendChild(sib);
        sib = next;
      }
      h2.parentNode.insertBefore(block, h2);
      block.appendChild(btn);
      block.appendChild(body);
      h2.remove();
    });

  // Step C: wire roadmap item clicks — expand section + scroll
  container.querySelectorAll('.rm-item[data-target]').forEach(function(item) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
      var targetId = item.dataset.target;
      var body = container.querySelector('#' + targetId);
      if (!body) return;
      var block = body.closest('.section-block');
      if (block) block.classList.remove('collapsed');
      setTimeout(function() {
        body.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    });
  });
}


function showHome() {
  document.getElementById('homeEl').style.display = 'block';
  document.getElementById('topicPage').classList.remove('visible');
  activeTopic = null;
  document.getElementById('sbHome').classList.add('active');
  document.querySelectorAll('.sb-topic').forEach(b => b.classList.remove('active'));
  buildHomeGrid();
  buildRoadmapGrid();
  if (window.innerWidth <= 800 && sbOpen) toggleSidebar();
}

function loadTopic(key, cat) {
  const html = TOPIC_CONTENT[key];
  if (!html) return;

  activeTopic = key;
  appState.visited[key] = true;
  saveState();

  // Find category for breadcrumb
  const foundCat = cat || CATEGORIES.find(c =>
    c.topics && c.topics.some(t => t.key === key)
  );
  const topicLabel = foundCat && foundCat.topics
    ? (foundCat.topics.find(t => t.key === key) || {}).label || key
    : key;

  document.getElementById('homeEl').style.display = 'none';
  const tp = document.getElementById('topicPage');
  tp.className = 'topic-page visible';
  const _tc = document.getElementById('topicContent');
  _tc.innerHTML = html;
  makeCollapsible(_tc);

  if (foundCat) document.getElementById('tbCat').textContent = foundCat.label;
  document.getElementById('tbName').textContent = topicLabel;

  // Wire Q&A reveal buttons
  wireRevealAll();

  window.scrollTo(0,0);

  // Update sidebar
  document.getElementById('sbHome').classList.remove('active');
  document.querySelectorAll('.sb-topic').forEach(b => {
    b.classList.toggle('active', b.dataset.key === key);
    if (b.dataset.key === key) b.classList.add('read');
  });

  updateProgress();

  // Rebuild search on first load
  if (searchIndex.length === 0) rebuildSearchIndex();

  if (window.innerWidth <= 800 && sbOpen) toggleSidebar();
}

// ── Home grid ─────────────────────────────────────────────────────────────────
function buildHomeGrid() { buildPhaseTree(); }
function buildRoadmapGrid() {}

function buildPhaseTree() {
  var tree = document.getElementById('phaseTree');
  if (!tree || typeof SYLLABUS === 'undefined') return;
  tree.innerHTML = '';

  // Parse [must]/[pattern]/[hard] tags out of a sub-topic label
  function parseTags(label) {
    var tags = '';
    var clean = label;
    if (/\[must\]/.test(label))    { tags += '<i class="tg tg-must">must</i>'; clean = clean.replace(/\[must\]/g,''); }
    if (/\[pattern\]/.test(label)) { tags += '<i class="tg tg-pat">pattern</i>'; clean = clean.replace(/\[pattern\]/g,''); }
    if (/\[hard\]/.test(label))    { tags += '<i class="tg tg-hard">hard</i>'; clean = clean.replace(/\[hard\]/g,''); }
    return '<span>' + clean.trim() + '</span>' + tags;
  }

  SYLLABUS.forEach(function(phase) {
    var phaseEl = document.createElement('div');
    phaseEl.className = 'syl-phase';

    // Header
    var hdr = document.createElement('div');
    hdr.className = 'syl-phase-hdr';
    hdr.innerHTML =
      '<span class="syl-phase-num">' + phase.num + '</span>' +
      '<span class="syl-phase-ico">' + phase.icon + '</span>' +
      '<div class="syl-phase-meta">' +
        '<div class="syl-phase-name">' + phase.name +
          '<span class="syl-phase-tag">' + phase.tag + '</span>' +
        '</div>' +
        '<div class="syl-phase-desc">' + phase.desc + '</div>' +
      '</div>' +
      '<span class="syl-chev">▸</span>';
    hdr.addEventListener('click', function() { phaseEl.classList.toggle('open'); });

    // Body — topics
    var body = document.createElement('div');
    body.className = 'syl-phase-body';

    phase.topics.forEach(function(topic) {
      var hasNote = topic.note && TOPIC_CONTENT[topic.note];

      var topicRow = document.createElement('div');
      topicRow.className = 'syl-topic-row';

      var topicEl = document.createElement('div');
      topicEl.className = 'syl-topic' + (hasNote ? ' has-note' : '');

      var starTag = /★/.test(topic.name) ? '<span class="syl-star">★</span>' : '';
      var cleanName = topic.name.replace(/★/g,'').trim();

      topicEl.innerHTML =
        '<span class="syl-caret">▸</span>' +
        '<span class="syl-topic-name">' + cleanName + '</span>' +
        starTag +
        (hasNote ? '<span class="syl-open">read →</span>' : '');

      // Toggle subtopics on row click; open note on "read" click
      topicEl.addEventListener('click', function(e) {
        if (e.target.classList.contains('syl-open')) {
          e.stopPropagation();
          loadTopic(topic.note, null);
          return;
        }
        topicRow.classList.toggle('open');
      });

      topicRow.appendChild(topicEl);

      // Subtopics
      var subWrap = document.createElement('div');
      subWrap.className = 'syl-subs';
      (topic.sub || []).forEach(function(s) {
        var subEl = document.createElement('div');
        subEl.className = 'syl-sub';
        subEl.innerHTML = parseTags(s);
        subWrap.appendChild(subEl);
      });
      topicRow.appendChild(subWrap);

      body.appendChild(topicRow);
    });

    phaseEl.appendChild(hdr);
    phaseEl.appendChild(body);
    tree.appendChild(phaseEl);
  });

  // Wire expand-all
  var expandBtn = document.getElementById('expandAllBtn');
  if (expandBtn) {
    var allOpen = false;
    expandBtn.onclick = function() {
      allOpen = !allOpen;
      document.querySelectorAll('.syl-phase').forEach(function(p) {
        p.classList.toggle('open', allOpen);
      });
      expandBtn.textContent = allOpen ? 'Collapse all' : 'Expand all';
    };
  }
}


// ── Q&A reveal buttons ───────────────────────────────────────────────────────
function wireRevealAll() {
  var btn = document.getElementById('revealAll');
  if (!btn) return;
  var expanded = false;
  btn.addEventListener('click', function() {
    expanded = !expanded;
    var container = btn.closest('.section-body') || document;
    document.querySelectorAll('details.qa').forEach(function(d) {
      d.open = expanded;
    });
    btn.textContent = expanded ? 'Hide all' : 'Reveal all';
  });
}

// ── Progress ─────────────────────────────────────────────────────────────────
function updateProgress() {
  var total = 0, done = 0;
  CATEGORIES.forEach(function(cat) {
    (cat.topics || []).forEach(function(t) {
      if (!t.divider && TOPIC_CONTENT[t.key]) {
        total++;
        if (appState.visited && appState.visited[t.key]) done++;
      }
    });
  });
  var el = document.getElementById('progressText');
  if (el) el.textContent = done + ' / ' + total + ' topics read';
  var bar = document.getElementById('progressFill');
  if (bar) bar.style.width = (total > 0 ? (done / total * 100) : 0) + '%';
}

// ── Search ───────────────────────────────────────────────────────────────────
function rebuildSearchIndex() {
  searchIndex = [];
  CATEGORIES.forEach(function(cat) {
    (cat.topics || []).forEach(function(t) {
      if (t.divider || !TOPIC_CONTENT[t.key]) return;
      var html = TOPIC_CONTENT[t.key];
      var text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      searchIndex.push({
        key: t.key,
        catKey: cat.key,
        label: t.label || t.key,
        catLabel: cat.label,
        emoji: cat.emoji,
        text: text.toLowerCase()
      });
    });
  });
}

function performSearch(query) {
  var res = document.getElementById('searchResults');
  if (!res) return;
  var q = query.toLowerCase();
  var matches = [];
  searchIndex.forEach(function(item) {
    var score = 0;
    if (item.label.toLowerCase().includes(q)) score += 100;
    if (item.catLabel.toLowerCase().includes(q)) score += 20;
    var idx = item.text.indexOf(q);
    if (idx >= 0) score += 10;
    if (score > 0) {
      var snippet = '';
      if (idx >= 0) {
        var start = Math.max(0, idx - 40);
        snippet = '…' + item.text.substring(start, idx + 60).trim() + '…';
      }
      matches.push({ item: item, score: score, snippet: snippet });
    }
  });
  matches.sort(function(a, b) { return b.score - a.score; });
  matches = matches.slice(0, 12);

  if (matches.length === 0) {
    res.innerHTML = '<div class="search-empty">No results for "' + query + '"</div>';
    return;
  }
  res.innerHTML = matches.map(function(m) {
    return '<div class="search-result" onclick="loadTopic(\'' + m.item.key + '\',\'' + m.item.catKey + '\');document.getElementById(\'searchResults\').innerHTML=\'\';document.getElementById(\'searchInput\').value=\'\';">' +
      '<div class="sr-top"><span class="sr-emoji">' + m.item.emoji + '</span>' +
      '<span class="sr-label">' + m.item.label + '</span>' +
      '<span class="sr-cat">' + m.item.catLabel + '</span></div>' +
      (m.snippet ? '<div class="sr-snippet">' + m.snippet + '</div>' : '') +
      '</div>';
  }).join('');
}

// ── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  buildSidebar();
  showHome();
  rebuildSearchIndex();

  // Search input
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var q = this.value.trim();
      if (q.length > 1) performSearch(q);
      else {
        var res = document.getElementById('searchResults');
        if (res) res.innerHTML = '';
      }
    });
  }

  // Sidebar overlay close on mobile
  var overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', function() {
      if (sbOpen) toggleSidebar();
    });
  }

  // Keyboard shortcut: / to focus search
  document.addEventListener('keydown', function(e) {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
    if (e.key === 'Escape') {
      if (searchInput) searchInput.blur();
      var res = document.getElementById('searchResults');
      if (res) res.innerHTML = '';
    }
  });
});

