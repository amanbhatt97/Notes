// ═══════════════════════════════════════════════════════════════════════════
// BUILD ROADMAP ON HOME PAGE
// ═══════════════════════════════════════════════════════════════════════════

// ── State ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'dsml_notes_v3';
let appState = { visited: {}, catOpen: {}, theme: 'dark' };
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

// Topics can nest: an entry with `children` is a collapsible group (folder),
// any other non-divider entry is a leaf note. These helpers walk that tree.
function flatTopics(list) {
  var out = [];
  (list || []).forEach(function(t) {
    if (t.children) out = out.concat(flatTopics(t.children));
    else if (!t.divider) out.push(t);
  });
  return out;
}

// Returns the chain of group nodes leading to `key`, or null if not found.
function topicPath(list, key) {
  for (var i = 0; i < (list || []).length; i++) {
    var t = list[i];
    if (t.key === key && !t.children) return [];
    if (t.children) {
      var sub = topicPath(t.children, key);
      if (sub) return [t].concat(sub);
    }
  }
  return null;
}

function renderTopicList(list, container, cat, depth) {
  var pad = 42 + depth * 14;
  list.forEach(function(t) {
    if (t.divider) {
      var d = document.createElement('div');
      d.className = 'sb-divider-label';
      d.textContent = t.label;
      container.appendChild(d);
      return;
    }

    if (t.children) {
      var isOpen = appState.catOpen[t.key] === true;
      var g = document.createElement('button');
      g.className = 'sb-group' + (isOpen ? ' open' : '');
      g.dataset.groupKey = t.key;
      g.style.paddingLeft = (pad - 14) + 'px';
      var n = flatTopics(t.children).filter(function(x) { return TOPIC_CONTENT[x.key]; }).length;
      g.innerHTML = '<span class="sb-group-arrow">▶</span><span class="sb-group-label">' + t.label + '</span>' +
        (n ? '<span class="sb-group-count">' + n + '</span>' : '');
      var kids = document.createElement('div');
      kids.className = 'sb-topics sb-subtopics' + (isOpen ? ' open' : '');
      kids.dataset.groupKey = t.key;
      renderTopicList(t.children, kids, cat, depth + 1);
      g.onclick = function() {
        var o = kids.classList.toggle('open');
        g.classList.toggle('open', o);
        appState.catOpen[t.key] = o;
        saveState();
      };
      container.appendChild(g);
      container.appendChild(kids);
      return;
    }

    var tb = document.createElement('button');
    tb.className = 'sb-topic' +
      (activeTopic === t.key ? ' active' : '') +
      (appState.visited[t.key] ? ' read' : '');
    tb.dataset.key = t.key;
    tb.style.paddingLeft = pad + 'px';
    tb.style.setProperty('--dot-x', (pad - 14) + 'px');

    var badge = t.badge
      ? '<span style="margin-left:6px;background:var(--green-dim);color:var(--green);font-size:9px;font-weight:700;border-radius:10px;padding:1px 5px">' + t.badge + '</span>'
      : '';

    if (TOPIC_CONTENT[t.key]) {
      tb.innerHTML = t.label + badge;
      tb.onclick = function() { loadTopic(t.key, cat); };
    } else {
      tb.innerHTML = t.label + '<span style="margin-left:6px;font-size:9px;color:var(--ink3);background:var(--s2);border-radius:10px;padding:1px 5px">Soon</span>';
      tb.style.opacity = '.5';
      tb.style.cursor = 'default';
    }
    container.appendChild(tb);
  });
}

function buildSidebar() {
  const nav = document.getElementById('sbNav');
  nav.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const leaves = flatTopics(cat.topics);
    if (leaves.length === 0) {
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

    const availCount = leaves.filter(t => TOPIC_CONTENT[t.key]).length;

    btn.innerHTML =
      '<div class="sb-cat-icon">' + cat.emoji + '</div>' +
      '<span class="sb-cat-label">' + cat.label + '</span>' +
      (availCount > 0 ? '<span class="sb-cat-count">' + availCount + '</span>' : '') +
      '<span class="sb-cat-arrow">▶</span>';

    const topicsDiv = document.createElement('div');
    topicsDiv.className = 'sb-topics' + (isOpen ? ' open' : '');
    renderTopicList(cat.topics, topicsDiv, cat, 0);

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

// Open every sidebar group on the way to `key` so the active note is visible.
function revealInSidebar(cat, key) {
  (topicPath(cat.topics, key) || []).forEach(function(g) {
    document.querySelectorAll('[data-group-key="' + g.key + '"]').forEach(function(el) {
      el.classList.add('open');
    });
    appState.catOpen[g.key] = true;
  });
  saveState();
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
      if (h2.classList.contains('open')) block.classList.remove('collapsed');
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
      // The mind map is the revision view: show it expanded on arrival
      if (body.querySelector('.mindmap')) block.classList.remove('collapsed');
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

  // Find category + group path for breadcrumb
  if (typeof cat === 'string') cat = CATEGORIES.find(c => c.key === cat);
  const foundCat = (cat && topicPath(cat.topics, key)) ? cat : CATEGORIES.find(c => topicPath(c.topics, key));
  const path = foundCat ? topicPath(foundCat.topics, key) : [];
  const leaf = foundCat ? flatTopics(foundCat.topics).find(t => t.key === key) : null;
  const topicLabel = leaf ? leaf.label : key;

  document.getElementById('homeEl').style.display = 'none';
  const tp = document.getElementById('topicPage');
  tp.className = 'topic-page visible';
  const _tc = document.getElementById('topicContent');
  _tc.innerHTML = html;
  highlightCode(_tc);
  makeCollapsible(_tc);
  try { hoistMindMap(_tc); addSectionTools(_tc); } catch (e) { console.error(e); }
  if (foundCat) appendPrevNext(_tc, foundCat, key);

  if (foundCat) {
    renderCrumbs(foundCat, path);
    revealInSidebar(foundCat, key);
  }
  document.getElementById('tbTools').style.display = '';
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

// Previous / next buttons follow the sidebar order within the category,
// so a learning path can be read start to finish.
function appendPrevNext(container, cat, key) {
  var list = flatTopics(cat.topics).filter(function(t) { return TOPIC_CONTENT[t.key]; });
  var i = list.findIndex(function(t) { return t.key === key; });
  if (i < 0) return;
  var nav = document.createElement('div');
  nav.className = 'note-nav';
  [[list[i - 1], 'prev', '← Previous'], [list[i + 1], 'next', 'Next →']].forEach(function(x) {
    var t = x[0];
    var b = document.createElement(t ? 'button' : 'span');
    b.className = 'note-nav-btn ' + x[1];
    if (t) {
      b.innerHTML = '<small>' + x[2] + '</small><span>' + t.label + '</span>';
      b.onclick = function() { loadTopic(t.key, cat); };
    }
    nav.appendChild(b);
  });
  container.appendChild(nav);
}


// ── Page tools: breadcrumbs, expand/collapse, mind map, overviews ───────────
// Breadcrumb levels are clickable: category and group open an overview page.
function renderCrumbs(cat, path) {
  var el = document.getElementById('tbCat');
  el.innerHTML = '';
  var levels = [{ label: cat.label, group: null }].concat(path.map(function(g) { return { label: g.label, group: g.key }; }));
  levels.forEach(function(l, i) {
    if (i) {
      var sep = document.createElement('span');
      sep.className = 'topic-bar-sep';
      sep.textContent = '/';
      el.appendChild(sep);
    }
    var b = document.createElement('button');
    b.className = 'crumb';
    b.textContent = l.label;
    b.onclick = function() { showOverview(cat.key, l.group); };
    el.appendChild(b);
  });
}

function setAllSections(open) {
  document.querySelectorAll('#topicContent .section-block, #topicContent .subsection-block').forEach(function(b) {
    b.classList.toggle('collapsed', !open);
  });
  document.querySelectorAll('#topicContent .sec-tool').forEach(function(t) {
    t.textContent = open ? 'Collapse parts' : 'Expand parts';
  });
}

// Sections with sub-parts get their own expand/collapse-parts control.
function addSectionTools(container) {
  container.querySelectorAll('.section-block').forEach(function(block) {
    var subs = block.querySelectorAll(':scope > .section-body > .subsection-block, :scope > .section-body .subsection-block');
    if (subs.length < 2) return;
    var t = document.createElement('span');
    t.className = 'sec-tool';
    t.textContent = 'Expand parts';
    t.onclick = function(e) {
      e.stopPropagation();
      var open = t.textContent === 'Expand parts';
      block.classList.remove('collapsed');
      subs.forEach(function(s) { s.classList.toggle('collapsed', !open); });
      t.textContent = open ? 'Collapse parts' : 'Expand parts';
    };
    block.querySelector('.section-toggle').appendChild(t);
  });
}

// Wherever a note puts its mind map, show it first (right after the lead).
function hoistMindMap(container) {
  var mm = container.querySelector('.mindmap');
  var block = mm && mm.closest('.section-block');
  if (!block) return;
  var rw = container.querySelector('.roadmap-wrap');
  if (rw && block.contains(rw)) {
    // Map placed before the roadmap: the section swallowed the roadmap, so lift it back out after the map
    block.parentNode.insertBefore(rw, block.nextSibling);
  } else {
    var anchor = rw || container.querySelector('.section-block');
    if (anchor && anchor !== block && !anchor.contains(block)) anchor.parentNode.insertBefore(block, anchor);
  }
}

// Chain of groups from the category root down to group `key`.
function groupPath(list, key) {
  for (var i = 0; i < (list || []).length; i++) {
    var t = list[i];
    if (!t.children) continue;
    if (t.key === key) return [t];
    var sub = groupPath(t.children, key);
    if (sub) return [t].concat(sub);
  }
  return null;
}

function noteLead(key) {
  var m = (TOPIC_CONTENT[key] || '').match(/<p class="lead">([\s\S]*?)<\/p>/);
  return m ? m[1].replace(/<[^>]+>/g, '') : '';
}

// Overview page for a category or a group: its notes and sub-groups as cards.
function showOverview(catKey, groupKey) {
  var cat = CATEGORIES.find(function(c) { return c.key === catKey; });
  if (!cat) return;
  var path = groupKey ? (groupPath(cat.topics, groupKey) || []) : [];
  var node = path.length ? path[path.length - 1] : { label: cat.label, children: cat.topics };
  if (groupKey && !path.length) return;
  activeTopic = null;
  document.getElementById('homeEl').style.display = 'none';
  var tp = document.getElementById('topicPage');
  tp.className = 'topic-page visible';
  var tc = document.getElementById('topicContent');
  var html = '<h1>' + (groupKey ? node.label : cat.emoji + ' ' + cat.label) + '</h1><div class="ov-list">';
  (node.children || []).forEach(function(t) {
    if (t.divider) return;
    if (t.children) {
      var kids = flatTopics(t.children);
      html += '<div class="ov-group"><button class="ov-group-title" data-group="' + t.key + '">' + t.label + ' <span>' + kids.length + ' notes →</span></button><div class="ov-cards">' +
        kids.map(function(k) { return ovCard(k); }).join('') + '</div></div>';
    } else {
      html += ovCard(t);
    }
  });
  tc.innerHTML = html + '</div>';
  tc.querySelectorAll('[data-open]').forEach(function(b) {
    b.onclick = function() { loadTopic(b.dataset.open, cat); };
  });
  tc.querySelectorAll('[data-group]').forEach(function(b) {
    b.onclick = function() { showOverview(cat.key, b.dataset.group); };
  });
  renderCrumbs(cat, path);
  document.getElementById('tbName').textContent = 'Overview';
  document.getElementById('tbTools').style.display = 'none';
  document.getElementById('sbHome').classList.remove('active');
  document.querySelectorAll('.sb-topic').forEach(function(b) { b.classList.remove('active'); });
  window.scrollTo(0, 0);
}

function ovCard(t) {
  var ok = !!TOPIC_CONTENT[t.key];
  return '<button class="ov-card' + (ok ? '' : ' soon') + '"' + (ok ? ' data-open="' + t.key + '"' : ' disabled') + '>' +
    '<b>' + t.label + (appState.visited[t.key] ? ' <i class="ov-read">✓ read</i>' : '') + '</b>' +
    '<span>' + (ok ? noteLead(t.key) : 'Coming soon') + '</span></button>';
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


// ── Code highlighting ────────────────────────────────────────────────────────
// Notes can write plain code as <div class="fx" data-lang="sql|js">…</div>
// (HTML-escaped, no spans) and it is coloured here at render time.
var HL_KEYWORDS = {
  sql: 'select from where and or not in is null as on join inner left right full outer cross natural using group by having order asc desc limit offset fetch first next rows only distinct all any some exists between like ilike case when then else end union intersect except insert into values update set delete returning create table view materialized index unique primary key foreign references constraint check default alter add drop column cascade restrict truncate begin commit rollback savepoint transaction isolation level read committed repeatable serializable with recursive over partition range unbounded preceding following current row filter lateral explain analyze grant revoke if replace temp temporary conflict do nothing true false int integer bigint smallint serial bigserial numeric decimal real float text varchar char boolean date time timestamp timestamptz interval jsonb json uuid lock for share nowait skip locked vacuum',
  js: 'const let var function return if else for of in new true false null undefined await async db',
  py: 'def class return if elif else for while in not and or is import from as with try except finally raise lambda None True False pass yield async await break continue global nonlocal assert del print self'
};
var HL_SETS = {};
Object.keys(HL_KEYWORDS).forEach(function(l) {
  HL_SETS[l] = {};
  HL_KEYWORDS[l].split(' ').forEach(function(w) { HL_SETS[l][w] = 1; });
});

function hlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightSource(src, lang) {
  var kw = HL_SETS[lang] || {};
  var comment = lang === 'sql' ? /^--[^\n]*/ : lang === 'py' ? /^#[^\n]*/ : /^\/\/[^\n]*/;
  var out = '', i = 0, m;
  while (i < src.length) {
    var rest = src.slice(i);
    if ((m = rest.match(comment)) || (lang !== 'py' && (m = rest.match(/^\/\*[\s\S]*?\*\//)))) {
      out += '<span class="c">' + hlEscape(m[0]) + '</span>';
    } else if (lang === 'py' && ((m = rest.match(/^[rfbu]?"""[\s\S]*?"""/i)) || (m = rest.match(/^[rfbu]?'''[\s\S]*?'''/i)))) {
      out += '<span class="g">' + hlEscape(m[0]) + '</span>';
    } else if (lang === 'py' && ((m = rest.match(/^[rfbu](?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/i)))) {
      out += '<span class="g">' + hlEscape(m[0]) + '</span>';
    } else if ((m = rest.match(/^'(?:[^'\\]|\\.|'')*'/)) || (m = rest.match(/^"(?:[^"\\]|\\.)*"/))) {
      // In SQL, double quotes are identifiers, not strings
      out += lang === 'sql' && m[0][0] === '"' ? hlEscape(m[0]) : '<span class="g">' + hlEscape(m[0]) + '</span>';
    } else if ((m = rest.match(/^\d+(?:\.\d+)?\b/))) {
      out += '<span class="y">' + m[0] + '</span>';
    } else if ((m = rest.match(/^\$?[A-Za-z_][A-Za-z0-9_]*/))) {
      var w = m[0];
      if (w[0] === '$') out += '<span class="o">' + w + '</span>';
      else if (kw[lang === 'sql' ? w.toLowerCase() : w]) out += '<span class="k">' + w + '</span>';
      else if (/^\s*\(/.test(src.slice(i + w.length))) out += '<span class="o">' + w + '</span>';
      else out += w;
    } else {
      m = [rest[0]];
      out += hlEscape(m[0]);
    }
    i += m[0].length;
  }
  return out;
}

function highlightCode(container) {
  container.querySelectorAll('.fx[data-lang]').forEach(function(el) {
    var lang = { python: 'py', javascript: 'js', mongo: 'js' }[el.dataset.lang] || el.dataset.lang;
    el.innerHTML = highlightSource(el.textContent, lang);
  });
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
    flatTopics(cat.topics).forEach(function(t) {
      if (TOPIC_CONTENT[t.key]) {
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
    flatTopics(cat.topics).forEach(function(t) {
      if (!TOPIC_CONTENT[t.key]) return;
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

