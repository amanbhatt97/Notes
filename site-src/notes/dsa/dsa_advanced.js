// notes/dsa/dsa_advanced.js — Advanced Data Structures
Object.assign(TOPIC_CONTENT, {
  "dsa_advanced": `<main>
<h1>Advanced Data Structures</h1>
  <div class="where"><span>DSA</span><span>Advanced Data Structures</span></div>
  <p class="lead">Some interview questions need a structure that answers questions about a <em>range</em> of an array while the array keeps changing. This note follows one Biteful dashboard: <strong>8 days of revenue</strong> (₹ thousand per day: [5, 2, 8, 1, 4, 7, 3, 6]). Finance asks "total for days 1 to 3?" again and again, while the accountant keeps correcting old days. A plain list makes each question O(n); prefix sums make each correction O(n). The <strong>Fenwick tree</strong> and the <strong>segment tree</strong> make both O(log n); lazy propagation extends that to "add ₹2k to days 4 to 7"; a <strong>sparse table</strong> answers "worst day in a range" in O(1) when the data is frozen; the monotonic deque handles "best day in every 3-day window" in O(n). The note closes with the other structures interviews like to name (sorted lists with bisect, LRU/LFU caches, skip lists, Bloom filters) and a table of when each is worth it. Every pattern has trigger words, a template, a traced table, tested code, its cost and practice problems from the tracker. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-ad-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-ad-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Arrays (prefix sums) · Heaps (layout) · Bits (i &amp; -i) · Stacks (deque)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-ad-ga)"/>
<rect x="170" y="62" width="300" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Advanced Data Structures</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · 8 days of revenue</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ad-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Problem Tracker</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">the full ladder, easy → hard</text>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ad-ga)"/>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Graphs</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">sparse table → LCA</text>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ad-ga)"/>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">System design</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">LRU caches, Bloom filters</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ad-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Advanced: ~30 problems, Range Sum Query → Rectangle Area II</text>
</svg><figcaption>The last note of the DSA track. It reuses prefix sums (Arrays), the array layout of a tree (Trees, Heaps), <code>i &amp; −i</code> (Bits), the monotonic deque (Stacks &amp; Queues) and bisect (Binary Search).</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_arrays">Arrays</a>, <a class="xref" data-note="dsa_trees">Trees</a>, <a class="xref" data-note="dsa_heaps">Heaps</a>, <a class="xref" data-note="dsa_bits">Bits</a> and <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a></b><span>Arrays gave prefix sums: any range total in O(1), as long as nothing changes. Heaps stored a tree in a list (children of v at 2v and 2v+1); the segment tree does the same. Bits gave <code>x &amp; −x</code>, the step of the Fenwick tree. Stacks &amp; Queues built the monotonic deque. <a class="xref" data-note="dsa_binsearch">Binary Search</a> gave <code>bisect</code>, and <a class="xref" data-note="dsa_linkedlist">Linked Lists</a> the doubly linked list inside an LRU cache.</span></li>
    <li><b>This note adds: structures that keep pre-added blocks</b><span>Fenwick tree, segment tree, lazy propagation, sparse table, plus a recap of the deque and sorted lists, LRU/LFU caches, skip lists and Bloom filters, and a decision table.</span></li>
    <li><b>Leads to: the <a class="xref" data-note="dsa_problems">Problem Tracker</a></b><span>This is the end of the DSA notes. The tracker's Advanced ladder (Range Sum Query – Mutable, Count of Smaller Numbers After Self, LRU Cache, My Calendar) uses every section. Sparse tables reappear as "binary lifting" for tree ancestors in <a class="xref" data-note="dsa_graphs">Graphs</a>-style problems.</span></li>
  </ol>

  <h2 id="dsa-ad-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Running example: daily revenue <b>rev = [5, 2, 8, 1, 4, 7, 3, 6]</b> (₹ thousand, days 0–7); the correction "day 2 was 3, not 8".</p>
  <ol class="story">
    <li><b>Range sums with updates</b><span>Q: total for days 1..3, many times, while old days get corrected? → A plain list re-adds the range (O(n) per query); prefix sums P = [0, 5, 7, 15, 16, 20, 27, 30, 36] answer in O(1) but the day-2 fix rewrites 6 entries (O(n) per update). Can we pay O(log n) for both?</span></li>
    <li><b>Fenwick tree</b><span>Q: store blocks so a query reads few and an update fixes few? → Box i holds the last <code>i &amp; −i</code> days ending at day i: t = [5, 7, 8, 16, 4, 11, 3, 36]. prefix(7) reads boxes 7 → 6 → 4; the fix touches boxes 3 → 4 → 8. O(log n) each. But it only does sums (things you can subtract). What about min or max?</span></li>
    <li><b>Segment tree</b><span>Q: any range operation (sum, min, max) with updates? → A tree of halves: root [0..7] = 36; query(1, 3) uses nodes [1..1] = 2 and [2..3] = 9. Update fixes one root-to-leaf path. But "add ₹2k to every day from 4 to 7" is still one update per day…</span></li>
    <li><b>Lazy propagation</b><span>Q: update a whole range in O(log n)? → Cover the node [4..7], add 2 × 4 to its sum, leave an IOU (lazy = 2), push it down only when someone looks inside. And if the data never changes at all?</span></li>
    <li><b>Sparse table</b><span>Q: worst day in any range of last month's (frozen) revenue, in O(1)? → Precompute minima of windows of length 1, 2, 4, 8; answer with two overlapping windows: min(2..7) = 1. Only for static data and overlap-safe operations. What if the ranges are all windows of the same size, sliding?</span></li>
    <li><b>Monotonic deque (recap)</b><span>Q: best day in every 3-day window? → Keep a deque of decreasing values: [8, 8, 8, 7, 7, 7] in O(n). Beyond ranges, interviews also ask for ordered lookups, caches and membership tests…</span></li>
    <li><b>Sorted lists, caches, skip lists, Bloom filters</b><span>Q: floor/ceiling lookups, re-used reports, "seen before?" on huge data? → bisect / SortedList; LRU = dict + doubly linked list (OrderedDict); LFU = frequency buckets; skip list = express lanes; Bloom filter = "definitely not" or "maybe". So which one do we pick?</span></li>
    <li><b>When each is worth it</b><span>Q: how to choose from the constraints? → No updates → prefix sums / sparse table; point updates → Fenwick (sums) or segment tree (anything); range updates → lazy; fixed-size windows → deque; n ≤ 10³ → brute force.</span></li>
  </ol>

<h2 id="dsa-ad-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Advanced Data Structures</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The need</div>
        <ul>
          <li><b>Range query + updates</b> — plain list: update O(1), sum O(n)</li>
          <li><b>Prefix sums</b> — sum O(1), but update O(n)</li>
          <li><b>Goal</b> — both in O(log n)</li>
          <li>💡 A shop's daily sales ledger where old entries get corrected</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Segment tree</div>
        <ul>
          <li><b>Node</b> = answer for a range; children split it in half</li>
          <li><b>Build</b> O(n) · <b>query</b> O(log n) · <b>update</b> O(log n)</li>
          <li>Any merge: sum, min, max, gcd, count</li>
          <li><b>Lazy propagation</b> — range updates in O(log n) by leaving IOUs</li>
          <li>Array size 4n, root at 1, children 2v and 2v+1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fenwick tree (BIT)</div>
        <ul>
          <li><b>Prefix sums</b> with updates, O(log n) each</li>
          <li><code>i += i &amp; -i</code> to update · <code>i -= i &amp; -i</code> to query</li>
          <li>1-indexed, n + 1 slots, ~10 lines</li>
          <li><b>Range sum</b> = prefix(r+1) − prefix(l)</li>
          <li>⚠ Needs an inverse (sums yes, min/max no)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sparse table</div>
        <ul>
          <li><b>Static</b> array, range min/max</li>
          <li>Build O(n log n), query <b>O(1)</b></li>
          <li>table[k][i] = min of 2ᵏ items from i</li>
          <li>Two overlapping windows cover any range</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Caches &amp; sorted</div>
        <ul>
          <li><b>LRU</b> — dict + doubly linked list = <code>OrderedDict</code></li>
          <li><b>LFU</b> — freq → OrderedDict buckets + min_freq</li>
          <li><b>Monotonic deque</b> — window max in O(n)</li>
          <li><b>bisect / insort</b> — O(log n) find, O(n) insert</li>
          <li><b>sortedcontainers.SortedList</b> — ~O(log n) add/remove; third-party, available on LeetCode</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Probabilistic</div>
        <ul>
          <li><b>Skip list</b> — sorted linked list with express lanes; O(log n) expected (Redis)</li>
          <li><b>Bloom filter</b> — bit array + k hashes; "definitely not" or "maybe"</li>
          <li>No false negatives, some false positives</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Range Sum Query Mutable</b> — segment tree or BIT</li>
          <li><b>Count of Smaller After Self</b> — BIT over ranks, right to left</li>
          <li><b>LRU Cache</b> — OrderedDict / dict + DLL</li>
          <li><b>Sliding Window Maximum</b> — monotonic deque</li>
          <li><b>My Calendar I</b> — bisect on sorted starts</li>
        </ul>
      </div>
    </div>
  </div>

    <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-ad-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When Basics Are Not Enough</span><span class="rm-sub">Prefix sums break on updates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-bit"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Fenwick Tree (BIT)</span><span class="rm-sub">lowbit traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-seg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Segment Tree</span><span class="rm-sub">Build, query, update traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-lazy"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Lazy Propagation</span><span class="rm-sub">Range updates in O(log n)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-sparse"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Sparse Table</span><span class="rm-sub">Static range minimum in O(1)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-sorted"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Monotonic Deque &amp; Sorted Lists</span><span class="rm-sub">Window max, bisect, SortedList</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-cache"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">LRU &amp; LFU Caches</span><span class="rm-sub">dict + linked list</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-prob"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Skip Lists &amp; Bloom Filters</span><span class="rm-sub">Express lanes, "maybe"</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">When Each Is Worth It</span><span class="rm-sub">Signal words → structure</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-problems"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">5 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Index 0, set vs add, 4n</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ad-need"><span class="num">01</span>When Basics Are Not Enough</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Arrays note answered "total for days i..j" in O(1) with prefix sums. That assumed the numbers never change. Biteful's finance team keeps correcting past days (refunds, late payments) <em>and</em> keeps asking range totals. What happens to our two basic tools when both operations are frequent?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"sum of range" <b>and</b> "update", "<b>mutable</b>", "queries interleaved with changes", "10⁵ queries and 10⁵ updates", "now the array can change" (as an interview follow-up).</p>
  </div>
  <h3>The running example</h3>
  <table class="tbl"><caption>rev: Biteful's revenue per day (₹ thousand)</caption>
    <tr><th>day</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
    <tr><th>₹k</th><td>5</td><td>2</td><td>8</td><td>1</td><td>4</td><td>7</td><td>3</td><td>6</td></tr>
  </table>
  <p>A kirana shop keeps a ledger of daily sales. The owner keeps asking "total sales from day 10 to day 40?" And the accountant keeps correcting old days: "day 17 was actually ₹5,200". Two operations, both frequent: <strong>range query</strong> and <strong>point update</strong>. On our dashboard: "days 1..3?" and "day 2 was ₹3k, not ₹8k".</p>
<div class="fx" data-lang="py">rev = [5, 2, 8, 1, 4, 7, 3, 6]          # Biteful's revenue (₹ thousand), days 0..7

# 1. plain list: update is O(1), every query re-adds the range
print("days 1..3:", sum(rev[1:4]), " (3 additions; days 0..7 would need 8)")

# 2. prefix sums: query is O(1), but an update rewrites every later prefix
P = [0]
for x in rev:
    P.append(P[-1] + x)
print("P =", P, " days 1..3 =", P[4] - P[1])

old, new = rev[2], 3                    # finance corrects day 2: 8 -&gt; 3
rev[2] = new
touched = 0
for i in range(3, len(P)):              # P[3..8] all contain day 2
    P[i] += new - old
    touched += 1
print("after fixing day 2: P =", P, " entries rewritten:", touched)
print("days 1..3 now:", P[4] - P[1])</div>
  <div class="fx" data-lang="text">days 1..3: 11  (3 additions; days 0..7 would need 8)
P = [0, 5, 7, 15, 16, 20, 27, 30, 36]  days 1..3 = 11
after fixing day 2: P = [0, 5, 7, 10, 11, 15, 22, 25, 31]  entries rewritten: 6
days 1..3 now: 6</div>
  <p>The plain list answers 2 + 8 + 1 = 11 by adding 3 numbers (and a full-range query adds all n). Prefix sums answer P[4] − P[1] = 16 − 5 = 11 at once, but the day-2 correction changed P[3] to P[8]: 6 of the 9 entries, because every prefix that includes day 2 is now wrong.</p>
  <table class="tbl">
    <tr><th>Approach</th><th>Update one day</th><th>Sum of a range</th><th>Problem</th></tr>
    <tr><td>Plain list</td><td>O(1)</td><td>O(n) add up the range</td><td>Every question scans</td></tr>
    <tr><td>Prefix sums</td><td>O(n) fix every later prefix</td><td>O(1)</td><td>Every correction rewrites</td></tr>
    <tr><td><strong>Fenwick tree / segment tree</strong></td><td><strong>O(log n)</strong></td><td><strong>O(log n)</strong></td><td>Both fast</td></tr>
  </table>
  <p>With 10⁵ days and 10⁵ mixed operations, the first two rows are about 10¹⁰ steps. The tree rows are about 3.4 million. That gap is why these structures exist.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop that writes only daily totals has to add up a month by hand for every question (plain list). A shop that writes only running totals since opening day must rewrite every later page after one correction (prefix sums). A shop that keeps weekly and monthly subtotals adds a few subtotals per question and fixes a few per correction (the trees).</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Both trees store <strong>pre-added blocks</strong>. A query glues together a few blocks (log n of them). An update fixes only the blocks that contain the changed day (also log n). Prefix sums are the extreme where every block starts at day 0, so one change touches everything.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for a tree when there are no updates. If the data is fixed, prefix sums (O(1) per query) beat any tree, and with n ≤ 10³ even the plain list is fine. Say the simple solution first, then upgrade when the constraints demand it.</p>
  </div>
  <p>Where you meet it: leaderboards and rank queries, time-series dashboards ("revenue between two dates" with late corrections), computational geometry, competitive programming, and interview follow-ups like "now the array can change".</p>
  <div class="bridge"><b>What this still can't tell us → next: Fenwick Tree.</b> We know what we want: blocks bigger than one day but not all starting at day 0, so that both a query and an update touch only about log n of them. How should the blocks be chosen?</div>

  <h2 id="dsa-ad-bit"><span class="num">02</span>Fenwick Tree (BIT)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Prefix sums store one block per day, always starting at day 0. Which blocks should we store instead, so that any prefix is a sum of about log n blocks and any day belongs to about log n blocks?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"range <b>sum</b> with updates", "<b>count smaller</b> / greater before / after", "number of inversions", "rank of x among seen values", "frequency of values ≤ x".</p>
  </div>
  <p>A <strong>Fenwick tree</strong> (also called a <strong>Binary Indexed Tree</strong>, BIT) does prefix sums with updates in O(log n), in about 10 lines and n + 1 slots. The trick is how blocks are chosen: box i stores the sum of the last <code>i &amp; -i</code> elements ending at i (1-indexed). <code>i &amp; -i</code> is the lowest set bit of i, from the <a class="xref" data-note="dsa_bits">Bit Manipulation</a> note.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A ledger where some pages carry a subtotal: odd pages hold one day, page 2 holds days 1–2, page 4 holds days 1–4, page 8 holds days 1–8. To total days 1–7, read page 7, then page 6 (days 5–6), then page 4 (days 1–4). Three pages instead of seven.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600"><text x="91" y="18" text-anchor="middle" class="tm">i=1</text><rect x="62" y="26" width="58" height="28" class="fs"/><text x="91" y="45" text-anchor="middle">5</text><text x="153" y="18" text-anchor="middle" class="tm">i=2</text><rect x="124" y="26" width="58" height="28" class="fs"/><text x="153" y="45" text-anchor="middle">2</text><text x="215" y="18" text-anchor="middle" class="tm">i=3</text><rect x="186" y="26" width="58" height="28" class="fs"/><text x="215" y="45" text-anchor="middle">8</text><text x="277" y="18" text-anchor="middle" class="tm">i=4</text><rect x="248" y="26" width="58" height="28" class="fs"/><text x="277" y="45" text-anchor="middle">1</text><text x="339" y="18" text-anchor="middle" class="tm">i=5</text><rect x="310" y="26" width="58" height="28" class="fs"/><text x="339" y="45" text-anchor="middle">4</text><text x="401" y="18" text-anchor="middle" class="tm">i=6</text><rect x="372" y="26" width="58" height="28" class="fs"/><text x="401" y="45" text-anchor="middle">7</text><text x="463" y="18" text-anchor="middle" class="tm">i=7</text><rect x="434" y="26" width="58" height="28" class="fs"/><text x="463" y="45" text-anchor="middle">3</text><text x="525" y="18" text-anchor="middle" class="tm">i=8</text><rect x="496" y="26" width="58" height="28" class="fs"/><text x="525" y="45" text-anchor="middle">6</text><text x="8" y="45" class="tm">nums</text><rect x="62" y="70" width="58" height="26" rx="5" class="ft st"/><text x="91" y="87" text-anchor="middle" font-size="10">t[1] = 5</text><rect x="62" y="104" width="120" height="26" rx="5" class="fb sb"/><text x="122" y="121" text-anchor="middle" font-size="10">t[2] = 7</text><rect x="186" y="70" width="58" height="26" rx="5" class="ft st"/><text x="215" y="87" text-anchor="middle" font-size="10">t[3] = 8</text><rect x="62" y="138" width="244" height="26" rx="5" class="fv sb"/><text x="184" y="155" text-anchor="middle" font-size="10">t[4] = 16</text><rect x="310" y="70" width="58" height="26" rx="5" class="ft st"/><text x="339" y="87" text-anchor="middle" font-size="10">t[5] = 4</text><rect x="310" y="104" width="120" height="26" rx="5" class="fb sb"/><text x="370" y="121" text-anchor="middle" font-size="10">t[6] = 11</text><rect x="434" y="70" width="58" height="26" rx="5" class="ft st"/><text x="463" y="87" text-anchor="middle" font-size="10">t[7] = 3</text><rect x="62" y="172" width="492" height="26" rx="5" class="fg sg"/><text x="308" y="189" text-anchor="middle" font-size="10">t[8] = 36</text><text x="8" y="87" class="tm">len 1</text><text x="8" y="121" class="tm">len 2</text><text x="8" y="155" class="tm">len 4</text><text x="8" y="189" class="tm">len 8</text><text x="300" y="222" text-anchor="middle">prefix(7) = t[7] + t[6] + t[4]   (7 → 6 → 4 → 0 by i -= i &amp; -i)</text></svg><figcaption>Box i covers a block of length (i &amp; −i) ending at i. Odd i covers 1 item, 2 and 6 cover 2, 4 covers 4, 8 covers 8. A prefix sum hops left by dropping the lowest bit each time.</figcaption></figure>
  <ul>
    <li><strong>prefix(i)</strong>: add box i, then jump to <code>i - (i &amp; -i)</code>, the box just left of this block. Stop at 0. 7 → 6 → 4 → 0: three boxes.</li>
    <li><strong>add(i, delta)</strong>: add to box i, then jump to <code>i + (i &amp; -i)</code>, the next bigger box that also covers i. 3 → 4 → 8.</li>
  </ul>
<div class="fx" data-lang="py">class Fenwick:
    """1-indexed inside. add(i, delta) and prefix(i) = sum of nums[0..i-1]."""

    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, delta, trace=False):   # i is 0-based for the caller
        i += 1
        path = []
        while i &lt;= self.n:
            self.t[i] += delta
            path.append(i)
            i += i &amp; -i                 # jump to the next box that covers i
        if trace: print("  add touched boxes", path)

    def prefix(self, i, trace=False):   # sum of the first i elements
        s, path = 0, []
        while i &gt; 0:
            s += self.t[i]
            path.append(f"t[{i}]={self.t[i]}")
            i -= i &amp; -i                 # drop the lowest 1 bit: next box to the left
        if trace: print("  prefix read", " + ".join(path) or "nothing", "=", s)
        return s

    def range_sum(self, l, r):          # inclusive, 0-based
        return self.prefix(r + 1) - self.prefix(l)

rev = [5, 2, 8, 1, 4, 7, 3, 6]
fw = Fenwick(len(rev))
for i, x in enumerate(rev):
    fw.add(i, x)
print("boxes t[1..8]:", fw.t[1:])
for i in range(1, 9):
    print(f"  box {i} = {i:04b}: lowbit {i &amp; -i}, covers days {i - (i &amp; -i)}..{i - 1}")
print("prefix(7):"); fw.prefix(7, trace=True)
print("days 1..3 =", fw.range_sum(1, 3))
print("day 2: 8 -&gt; 3, add -5:"); fw.add(2, 3 - 8, trace=True)
print("boxes t[1..8]:", fw.t[1:], " days 1..3 =", fw.range_sum(1, 3), " all =", fw.prefix(8))</div>
  <div class="fx" data-lang="text">boxes t[1..8]: [5, 7, 8, 16, 4, 11, 3, 36]
  box 1 = 0001: lowbit 1, covers days 0..0
  box 2 = 0010: lowbit 2, covers days 0..1
  box 3 = 0011: lowbit 1, covers days 2..2
  box 4 = 0100: lowbit 4, covers days 0..3
  box 5 = 0101: lowbit 1, covers days 4..4
  box 6 = 0110: lowbit 2, covers days 4..5
  box 7 = 0111: lowbit 1, covers days 6..6
  box 8 = 1000: lowbit 8, covers days 0..7
prefix(7):
  prefix read t[7]=3 + t[6]=11 + t[4]=16 = 30
days 1..3 = 11
day 2: 8 -&gt; 3, add -5:
  add touched boxes [3, 4, 8]
boxes t[1..8]: [5, 7, 3, 11, 4, 11, 3, 31]  days 1..3 = 6  all = 31</div>
  <table class="tbl out"><caption>Trace: the boxes for rev = [5, 2, 8, 1, 4, 7, 3, 6] (box i = 1-indexed, day = i − 1)</caption>
    <tr><th>box i</th><th>binary</th><th>lowbit i &amp; −i</th><th>covers days</th><th>t[i]</th></tr>
    <tr><td>1</td><td>0001</td><td>1</td><td>0</td><td>5</td></tr>
    <tr><td>2</td><td>0010</td><td>2</td><td>0..1</td><td>5 + 2 = 7</td></tr>
    <tr><td>3</td><td>0011</td><td>1</td><td>2</td><td>8</td></tr>
    <tr><td>4</td><td>0100</td><td>4</td><td>0..3</td><td>5 + 2 + 8 + 1 = 16</td></tr>
    <tr><td>5</td><td>0101</td><td>1</td><td>4</td><td>4</td></tr>
    <tr><td>6</td><td>0110</td><td>2</td><td>4..5</td><td>4 + 7 = 11</td></tr>
    <tr><td>7</td><td>0111</td><td>1</td><td>6</td><td>3</td></tr>
    <tr><td>8</td><td>1000</td><td>8</td><td>0..7</td><td>36</td></tr>
  </table>
  <table class="tbl out"><caption>Trace: prefix(7) and the day-2 correction (8 → 3, add −5)</caption>
    <tr><th>operation</th><th>i sequence</th><th>rule</th><th>result</th></tr>
    <tr><td>prefix(7) = days 0..6</td><td>7 (0111) → 6 (0110) → 4 (0100) → 0</td><td>i −= i &amp; −i (drop the lowest 1)</td><td>3 + 11 + 16 = 30</td></tr>
    <tr><td>add(day 2, −5)</td><td>3 (0011) → 4 (0100) → 8 (1000) → 16 stop</td><td>i += i &amp; −i</td><td>t[3] 8→3, t[4] 16→11, t[8] 36→31</td></tr>
    <tr><td>days 1..3 = prefix(4) − prefix(1)</td><td>4 → 0; 1 → 0</td><td>two prefixes</td><td>11 − 5 = 6</td></tr>
  </table>
  <p>Each jump changes one bit, so there are at most log₂ n jumps: 3 for 8 days, 17 for 10⁵. To <em>set</em> a value, add the difference (new − old), which is why the correction added −5.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">def add(i, d):            # i is 1-based
    while i &lt;= n: t[i] += d; i += i &amp; -i
def prefix(i):            # sum of the first i items
    s = 0
    while i &gt; 0: s += t[i]; i -= i &amp; -i
    return s</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Fenwick tree / BIT</strong>: an array t[1..n] where t[i] = sum of the (i &amp; −i) elements ending at position i. prefix and add are O(log n); build by n adds is O(n log n). Works for any operation with an inverse (sum, count, XOR), because a range is prefix(r) − prefix(l).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Off-by-one: the tree is 1-indexed because index 0 has no lowest bit (<code>0 &amp; -0 = 0</code>, an infinite loop). Convert with <code>i += 1</code> in exactly one place, as in <code>add</code> above. And a BIT cannot do range <em>min</em>: min has no "subtract".</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Advanced: <b>307 Range Sum Query – Mutable</b> (section 10), <b>1395 Count Number of Teams</b>, <b>1409 Queries on a Permutation With Key</b>, then <b>315 Count of Smaller Numbers After Self</b> (in the Sorting ladder; Fenwick version in section 10).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Segment Tree.</b> The Fenwick tree answers ranges as prefix(r) − prefix(l), which needs subtraction. Finance also wants "the worst day between day 1 and day 3" with corrections, and min cannot be subtracted. We need blocks that can be combined directly for any range.</div>

  <h2 id="dsa-ad-seg"><span class="num">03</span>Segment Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want range sum, range min or range max with point updates, all in O(log n). Instead of prefix blocks, can we store a block for every "half of a half" of the array, and build any range from a few of them?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"range <b>min / max / gcd</b> with updates", "range sum with updates", "<b>add to a range</b>" (next section), "first index with value ≥ x in a range", "booking / seats in groups".</p>
  </div>
  <p>Picture a school's marks register. The principal wants totals for any range of roll numbers. Each class teacher keeps her section's total, each house captain keeps the total of two sections, and the principal keeps the school total. Ask for "roll 1 to 3" and you add up a few totals that exactly cover that range.</p>
  <p>A <strong>segment tree</strong> is that hierarchy. The root covers the whole array. Every node splits its range in half for its two children. Leaves are single elements. Each node stores the answer (sum, min, max …) for its range.</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
<line x1="300" y1="54" x2="160" y2="78" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="300" y1="54" x2="440" y2="78" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="160" y1="112" x2="90" y2="136" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="160" y1="112" x2="230" y2="136" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="90" y1="170" x2="55" y2="194" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="90" y1="170" x2="125" y2="194" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="230" y1="170" x2="195" y2="194" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="230" y1="170" x2="265" y2="194" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="440" y1="112" x2="370" y2="136" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="440" y1="112" x2="510" y2="136" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="370" y1="170" x2="335" y2="194" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="370" y1="170" x2="405" y2="194" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="510" y1="170" x2="475" y2="194" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="510" y1="170" x2="545" y2="194" stroke="currentColor" stroke-opacity="0.4"/>
<rect x="245" y="20" width="110" height="34" rx="5" class="fb sb"/>
<text x="300" y="34" text-anchor="middle" class="tm" font-size="10">[0..7]</text><text x="300" y="48" text-anchor="middle" font-size="12" font-weight="700">36</text>
<rect x="110" y="78" width="100" height="34" rx="5" class="fb sb"/>
<text x="160" y="92" text-anchor="middle" class="tm" font-size="10">[0..3]</text><text x="160" y="106" text-anchor="middle" font-size="12" font-weight="700">16</text>
<rect x="58" y="136" width="64" height="34" rx="5" class="fb sb"/>
<text x="90" y="150" text-anchor="middle" class="tm" font-size="10">[0..1]</text><text x="90" y="164" text-anchor="middle" font-size="12" font-weight="700">7</text>
<rect x="27" y="194" width="56" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="55" y="208" text-anchor="middle" class="tm" font-size="10">day 0</text><text x="55" y="222" text-anchor="middle" font-size="12" font-weight="700">5</text>
<rect x="97" y="194" width="56" height="34" rx="5" class="fg sg"/>
<text x="125" y="208" text-anchor="middle" class="tm" font-size="10">day 1</text><text x="125" y="222" text-anchor="middle" font-size="12" font-weight="700">2</text>
<rect x="198" y="136" width="64" height="34" rx="5" class="fg sg"/>
<text x="230" y="150" text-anchor="middle" class="tm" font-size="10">[2..3]</text><text x="230" y="164" text-anchor="middle" font-size="12" font-weight="700">9</text>
<rect x="167" y="194" width="56" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="195" y="208" text-anchor="middle" class="tm" font-size="10">day 2</text><text x="195" y="222" text-anchor="middle" font-size="12" font-weight="700">8</text>
<rect x="237" y="194" width="56" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="265" y="208" text-anchor="middle" class="tm" font-size="10">day 3</text><text x="265" y="222" text-anchor="middle" font-size="12" font-weight="700">1</text>
<rect x="390" y="78" width="100" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="440" y="92" text-anchor="middle" class="tm" font-size="10">[4..7]</text><text x="440" y="106" text-anchor="middle" font-size="12" font-weight="700">20</text>
<rect x="338" y="136" width="64" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="370" y="150" text-anchor="middle" class="tm" font-size="10">[4..5]</text><text x="370" y="164" text-anchor="middle" font-size="12" font-weight="700">11</text>
<rect x="307" y="194" width="56" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="335" y="208" text-anchor="middle" class="tm" font-size="10">day 4</text><text x="335" y="222" text-anchor="middle" font-size="12" font-weight="700">4</text>
<rect x="377" y="194" width="56" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="405" y="208" text-anchor="middle" class="tm" font-size="10">day 5</text><text x="405" y="222" text-anchor="middle" font-size="12" font-weight="700">7</text>
<rect x="478" y="136" width="64" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="510" y="150" text-anchor="middle" class="tm" font-size="10">[6..7]</text><text x="510" y="164" text-anchor="middle" font-size="12" font-weight="700">9</text>
<rect x="447" y="194" width="56" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="475" y="208" text-anchor="middle" class="tm" font-size="10">day 6</text><text x="475" y="222" text-anchor="middle" font-size="12" font-weight="700">3</text>
<rect x="517" y="194" width="56" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="545" y="208" text-anchor="middle" class="tm" font-size="10">day 7</text><text x="545" y="222" text-anchor="middle" font-size="12" font-weight="700">6</text>
<text x="300" y="244" text-anchor="middle" class="tm" font-size="11">query(1, 3): blue = partial, green = fully inside (used), grey = outside / not visited → 2 + 9 = 11</text>
</svg><figcaption>Segment tree for the 8 days of revenue. Each box shows its range and its sum. query(1, 3) visits the blue nodes and adds the green ones: 2 + 9 = 11.</figcaption></figure>
  <p>A query compares each node's range with the asked range [l, r]. Three cases:</p>
  <ul>
    <li><strong>No overlap</strong>: return 0 (the "nothing" value for sums).</li>
    <li><strong>Fully inside</strong>: return the stored value; do not go deeper.</li>
    <li><strong>Partial</strong>: ask both children and combine.</li>
  </ul>
<div class="fx" data-lang="py">class SegmentTree:
    """Range sum + point update. tree[1] is the root; children of v are 2v and 2v+1."""

    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)          # 4n is always enough room
        if self.n:
            self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, v, lo, hi):
        if lo == hi:                            # leaf: one array cell
            self.tree[v] = nums[lo]
            return
        mid = (lo + hi) // 2
        self._build(nums, 2 * v, lo, mid)
        self._build(nums, 2 * v + 1, mid + 1, hi)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]

    def update(self, i, val, v=1, lo=0, hi=None):
        if hi is None:
            hi = self.n - 1
        if lo == hi:
            self.tree[v] = val
            return
        mid = (lo + hi) // 2
        if i &lt;= mid:
            self.update(i, val, 2 * v, lo, mid)
        else:
            self.update(i, val, 2 * v + 1, mid + 1, hi)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]   # fix the path back up

    def query(self, l, r, v=1, lo=0, hi=None, log=None):
        """Sum of nums[l..r], both inclusive."""
        if hi is None:
            hi = self.n - 1
        if r &lt; lo or hi &lt; l:                    # no overlap
            if log is not None: log.append(f"[{lo}..{hi}] outside -&gt; 0")
            return 0
        if l &lt;= lo and hi &lt;= r:                 # node fully inside [l, r]
            if log is not None: log.append(f"[{lo}..{hi}] inside  -&gt; {self.tree[v]}")
            return self.tree[v]
        if log is not None: log.append(f"[{lo}..{hi}] partial -&gt; ask both children")
        mid = (lo + hi) // 2                    # partial overlap: ask both children
        return (self.query(l, r, 2 * v, lo, mid, log) +
                self.query(l, r, 2 * v + 1, mid + 1, hi, log))

rev = [5, 2, 8, 1, 4, 7, 3, 6]
st = SegmentTree(rev)
print("root:", st.tree[1], " level 1:", st.tree[2:4], " level 2:", st.tree[4:8], " leaves:", st.tree[8:16])
log = []
print("days 1..3 =", st.query(1, 3, log=log))
for line in log:
    print("  ", line)
st.update(2, 3)                                 # day 2: 8 -&gt; 3
print("after update: root", st.tree[1], " level 1:", st.tree[2:4], " level 2:", st.tree[4:8], " days 1..3 =", st.query(1, 3))</div>
  <div class="fx" data-lang="text">root: 36  level 1: [16, 20]  level 2: [7, 9, 11, 9]  leaves: [5, 2, 8, 1, 4, 7, 3, 6]
days 1..3 = 11
   [0..7] partial -&gt; ask both children
   [0..3] partial -&gt; ask both children
   [0..1] partial -&gt; ask both children
   [0..0] outside -&gt; 0
   [1..1] inside  -&gt; 2
   [2..3] inside  -&gt; 9
   [4..7] outside -&gt; 0
after update: root 31  level 1: [11, 20]  level 2: [7, 4, 11, 9]  days 1..3 = 6</div>
  <table class="tbl out"><caption>Trace: build, query(1, 3), then update day 2 → 3</caption>
    <tr><th>step</th><th>nodes involved</th><th>values</th></tr>
    <tr><td>build (bottom up)</td><td>leaves → pairs → halves → root</td><td>[5,2,8,1,4,7,3,6] → [7, 9, 11, 9] → [16, 20] → 36</td></tr>
    <tr><td>query(1, 3)</td><td>[0..7] partial, [0..3] partial, [0..1] partial, [0..0] outside, [1..1] inside, [2..3] inside, [4..7] outside</td><td>0 + 2 + 9 + 0 = 11</td></tr>
    <tr><td>update(2, 3)</td><td>leaf day 2, then [2..3], [0..3], [0..7] recomputed on the way up</td><td>8 → 3; 9 → 4; 16 → 11; 36 → 31</td></tr>
    <tr><td>query(1, 3) again</td><td>same nodes</td><td>2 + 4 = 6</td></tr>
  </table>
  <p>At each level at most two nodes are partial, so a query touches O(log n) nodes. An update walks from the root down to one leaf and fixes every sum on the way back up: also O(log n). The same layout trick as heaps: node v has children 2v and 2v+1 (root at index 1 here). Why 4n slots? The tree is not always perfectly full; 4n is a safe upper bound. Swap <code>+</code> for <code>min</code> and 0 for <code>float("inf")</code> to get a range-minimum tree.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>Reason</th></tr>
    <tr><td>build</td><td>O(n)</td><td>About 2n nodes, each computed once</td></tr>
    <tr><td>query(l, r)</td><td>O(log n)</td><td>At most ~4 nodes per level, log n levels</td></tr>
    <tr><td>point update</td><td>O(log n)</td><td>One root-to-leaf path</td></tr>
    <tr><td>range update (lazy)</td><td>O(log n)</td><td>See next section</td></tr>
    <tr><td>space</td><td>O(n)</td><td>4n list</td></tr>
  </table>
  <div class="cards">
    <div><b>Segment tree</b><p>Any associative merge (sum, min, max, gcd), range updates with lazy tags, can search inside the tree.</p><small>~40 lines, 4n space</small></div>
    <div><b>Fenwick tree</b><p>Sums, counts, XOR: things you can "subtract" to get a range. Tiny and fast.</p><small>~10 lines, n + 1 space</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Segment tree</strong>: a binary tree over index ranges; each node stores f(range) for an associative f (sum, min, max, gcd) and equals f(left child, right child). Query and point update O(log n), build O(n), space O(n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to recompute the parent after an update (<code>tree[v] = tree[2v] + tree[2v+1]</code> on the way back up), or returning the wrong "nothing" value for no overlap (0 for sum, +∞ for min, −∞ for max).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>307 Range Sum Query – Mutable</b>, <b>3479 Fruits Into Baskets III</b> (search for the first big-enough value), <b>2286 Booking Concert Tickets in Groups</b>, <b>2407 Longest Increasing Subsequence II</b> (range max over values).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Lazy Propagation.</b> One day at a time is fine. During a festival, finance books a ₹2k bonus on <em>every</em> day from 4 to 7. As 4 point updates that is 4 × log n; on 10⁵ days it is 10⁵ × log n. Can a range update cost O(log n) too?</div>

  <h2 id="dsa-ad-lazy"><span class="num">04</span>Lazy Propagation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Add 2 to every day from 4 to 7" touches many leaves. The node [4..7] already covers exactly that range. Can we update just that node and postpone telling its children until someone actually asks about them?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>add x to all elements in [l, r]</b>", "set a range to a value", "range update and range query", "count booked slots", "falling squares".</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school announces "+5 grace marks for everyone in sections A to D". The principal does not visit every student. She updates the section totals and leaves a note with each section teacher: "you owe each student +5". The teacher passes the note down only when someone actually asks about a single student. That note is the <strong>lazy tag</strong>.</p>
  </div>
  <p>Rules: when an update fully covers a node, fix its sum (add x × length) and record <code>lazy[v] += x</code>; stop there. Before going into a node's children for any later query or update, <strong>push</strong> the pending tag down to both children and clear it.</p>
<div class="fx" data-lang="py">class LazySegTree:
    """Range add + range sum. lazy[v] = amount still owed to every cell below v."""

    def __init__(self, nums):
        self.n = len(nums)
        self.sum = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, v, lo, hi):
        if lo == hi:
            self.sum[v] = nums[lo]; return
        mid = (lo + hi) // 2
        self._build(nums, 2 * v, lo, mid); self._build(nums, 2 * v + 1, mid + 1, hi)
        self.sum[v] = self.sum[2 * v] + self.sum[2 * v + 1]

    def _apply(self, v, lo, hi, x):          # node fully covered: fix its sum, leave an IOU
        self.sum[v] += x * (hi - lo + 1)
        self.lazy[v] += x

    def _push(self, v, lo, hi):              # hand the IOU to both children before going down
        if self.lazy[v]:
            mid = (lo + hi) // 2
            self._apply(2 * v, lo, mid, self.lazy[v])
            self._apply(2 * v + 1, mid + 1, hi, self.lazy[v])
            self.lazy[v] = 0

    def add(self, l, r, x, v=1, lo=0, hi=None):
        hi = self.n - 1 if hi is None else hi
        if r &lt; lo or hi &lt; l: return
        if l &lt;= lo and hi &lt;= r:              # cover, tag, stop
            self._apply(v, lo, hi, x); return
        self._push(v, lo, hi)
        mid = (lo + hi) // 2
        self.add(l, r, x, 2 * v, lo, mid); self.add(l, r, x, 2 * v + 1, mid + 1, hi)
        self.sum[v] = self.sum[2 * v] + self.sum[2 * v + 1]

    def query(self, l, r, v=1, lo=0, hi=None):
        hi = self.n - 1 if hi is None else hi
        if r &lt; lo or hi &lt; l: return 0
        if l &lt;= lo and hi &lt;= r: return self.sum[v]
        self._push(v, lo, hi)                # push before you go down
        mid = (lo + hi) // 2
        return self.query(l, r, 2 * v, lo, mid) + self.query(l, r, 2 * v + 1, mid + 1, hi)

rev = [5, 2, 8, 1, 4, 7, 3, 6]
lt = LazySegTree(rev)
lt.add(4, 7, 2)                              # festival bonus: +2 on days 4..7
print("root", lt.sum[1], " node [4..7] sum", lt.sum[3], "lazy", lt.lazy[3], " children still", lt.sum[6:8])
print("days 5..6 =", lt.query(5, 6), " (7+2 + 3+2)")
print("after the query, node [4..7] lazy", lt.lazy[3], " children", lt.sum[6:8], "lazy", lt.lazy[6:8])
print("all days =", lt.query(0, 7))</div>
  <div class="fx" data-lang="text">root 44  node [4..7] sum 28 lazy 2  children still [11, 9]
days 5..6 = 14  (7+2 + 3+2)
after the query, node [4..7] lazy 0  children [15, 13] lazy [0, 0]
all days = 44</div>
  <table class="tbl out"><caption>Trace: add 2 to days 4..7, then query days 5..6</caption>
    <tr><th>step</th><th>node [4..7]</th><th>children [4..5], [6..7]</th><th>root</th></tr>
    <tr><td>before</td><td>sum 20, lazy 0</td><td>11, 9</td><td>36</td></tr>
    <tr><td>add(4, 7, 2): fully covered → cover, tag, stop</td><td>sum 20 + 2·4 = 28, lazy 2</td><td>still 11, 9 (not told yet)</td><td>16 + 28 = 44</td></tr>
    <tr><td>query(5, 6): partial at [4..7] → push first</td><td>lazy → 0</td><td>11 + 2·2 = 15, 9 + 2·2 = 13 (each tagged 2, then pushed again below)</td><td>44</td></tr>
    <tr><td>answer</td><td colspan="3">day 5 = 7 + 2 = 9, day 6 = 3 + 2 = 5 → 14</td></tr>
  </table>
  <p>Only the nodes on the paths you actually walk ever receive the IOU. You rarely write this in an interview, but you should be able to explain it in two sentences: "cover, tag, stop" and "push before you go down".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lazy propagation</strong>: store a pending update (lazy tag) at the highest nodes fully covered by a range update; apply it to a node's children only when an operation needs to go below that node. Range update and range query both O(log n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to push before recursing. Then a child's sum is out of date, and the parent recomputed from children (<code>sum[v] = left + right</code>) silently loses the pending add. Also: the tag for "add x" changes the sum by x × (length of the node), not by x.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>732 My Calendar III</b> (range add, global max), <b>699 Falling Squares</b>, <b>715 Range Module</b>, then <b>2569 Handling Sum Queries After Update</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Sparse Table.</b> Trees pay O(log n) per query because the data may change. Last month's revenue is closed: it will never change. For "worst day between any two days" on frozen data, can we precompute enough to answer in O(1)?</div>

  <h2 id="dsa-ad-sparse"><span class="num">05</span>Sparse Table</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Prefix sums give O(1) range <em>sums</em> on static data, but min cannot be subtracted, so "prefix minima" don't answer an arbitrary range. Is there an O(1) answer for range minimum when nothing changes?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"range <b>minimum / maximum</b> query", "array <b>never changes</b>", "many queries (10⁵–10⁶)", "kth ancestor", "lowest common ancestor", "binary lifting".</p>
  </div>
  <p>If the array <strong>never changes</strong> and you need range minimum (or maximum, or gcd) many times, you can answer in O(1). Precompute the min of every window whose length is a power of two: <code>table[k][i]</code> = min of 2ᵏ items starting at i. Each level is built from the one below: two halves of length 2ᵏ⁻¹.</p>
  <p>Query [l, r]: let k be the largest power with 2ᵏ ≤ length. Two windows of length 2ᵏ, one starting at l and one ending at r, cover the range. They may overlap, but for min that does not matter (min(a, a) = a).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two overlapping photos of a crowd. To find the shortest person in the crowd, it doesn't matter that some people appear in both photos: the shortest is still the shortest. (To <em>count</em> people, the overlap would be counted twice.)</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600"><rect x="60" y="14" width="56" height="32" class="fs"/><text x="88" y="35" text-anchor="middle">5</text><text x="88" y="60" text-anchor="middle" class="tm">0</text><rect x="120" y="14" width="56" height="32" class="fb sb"/><text x="148" y="35" text-anchor="middle">2</text><text x="148" y="60" text-anchor="middle" class="tm">1</text><rect x="180" y="14" width="56" height="32" class="fb sb"/><text x="208" y="35" text-anchor="middle">8</text><text x="208" y="60" text-anchor="middle" class="tm">2</text><rect x="240" y="14" width="56" height="32" class="fb sb"/><text x="268" y="35" text-anchor="middle">1</text><text x="268" y="60" text-anchor="middle" class="tm">3</text><rect x="300" y="14" width="56" height="32" class="fb sb"/><text x="328" y="35" text-anchor="middle">4</text><text x="328" y="60" text-anchor="middle" class="tm">4</text><rect x="360" y="14" width="56" height="32" class="fb sb"/><text x="388" y="35" text-anchor="middle">7</text><text x="388" y="60" text-anchor="middle" class="tm">5</text><rect x="420" y="14" width="56" height="32" class="fb sb"/><text x="448" y="35" text-anchor="middle">3</text><text x="448" y="60" text-anchor="middle" class="tm">6</text><rect x="480" y="14" width="56" height="32" class="fs"/><text x="508" y="35" text-anchor="middle">6</text><text x="508" y="60" text-anchor="middle" class="tm">7</text><rect x="120" y="72" width="236" height="22" rx="5" class="fg sg"/><text x="238" y="88" text-anchor="middle">min[1..4] = 1</text><rect x="240" y="100" width="236" height="22" rx="5" class="ft st"/><text x="358" y="116" text-anchor="middle">min[3..6] = 1</text><text x="300" y="144" text-anchor="middle">query(1, 6): length 6, k = 2 → two windows of 4 overlap → min(1, 1) = 1</text></svg><figcaption>On the revenue, range [1..6] has length 6. Two windows of length 4 overlap in the middle and together cover it exactly. Works for min, max, gcd; not for sum (the overlap would be counted twice).</figcaption></figure>
<div class="fx" data-lang="py">class SparseTable:
    """Static array, range minimum in O(1) after O(n log n) build."""

    def __init__(self, nums):
        n = len(nums)
        self.log = [0] * (n + 1)
        for i in range(2, n + 1):
            self.log[i] = self.log[i // 2] + 1
        self.table = [nums[:]]                     # level 0: windows of length 1
        j = 1
        while (1 &lt;&lt; j) &lt;= n:
            prev, half = self.table[-1], 1 &lt;&lt; (j - 1)
            self.table.append([min(prev[i], prev[i + half])
                               for i in range(n - (1 &lt;&lt; j) + 1)])
            j += 1

    def query(self, l, r):                         # min of nums[l..r]
        k = self.log[r - l + 1]                    # biggest power of 2 that fits
        return min(self.table[k][l], self.table[k][r - (1 &lt;&lt; k) + 1])  # two overlapping windows

rev = [5, 2, 8, 1, 4, 7, 3, 6]                     # last month's revenue: never changes now
sp = SparseTable(rev)
for k, row in enumerate(sp.table):
    print(f"windows of {1 &lt;&lt; k}: {row}")
print("worst day in 2..7:", sp.query(2, 7), " in 4..6:", sp.query(4, 6), " in 0..1:", sp.query(0, 1))</div>
  <div class="fx" data-lang="text">windows of 1: [5, 2, 8, 1, 4, 7, 3, 6]
windows of 2: [2, 2, 1, 1, 4, 3, 3]
windows of 4: [1, 1, 1, 1, 3]
windows of 8: [1]
worst day in 2..7: 1  in 4..6: 3  in 0..1: 2</div>
  <table class="tbl out"><caption>Trace: worst day in days 2..7</caption>
    <tr><th>step</th><th>value</th></tr>
    <tr><td>length</td><td>7 − 2 + 1 = 6 → k = 2 (window of 4)</td></tr>
    <tr><td>window starting at l = 2</td><td>table[2][2] = min(8, 1, 4, 7) = 1</td></tr>
    <tr><td>window ending at r = 7 (starts at 4)</td><td>table[2][4] = min(4, 7, 3, 6) = 3</td></tr>
    <tr><td>answer</td><td>min(1, 3) = 1 (day 3)</td></tr>
  </table>
  <p>Build O(n log n) time and space, query O(1). Any update means rebuilding, so this is only for static data. Used for LCA (lowest common ancestor) in trees and in suffix-array algorithms.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">table[0] = a
table[k][i] = min(table[k-1][i], table[k-1][i + 2^(k-1)])
query(l, r): k = log2(r - l + 1); return min(table[k][l], table[k][r - 2^k + 1])</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RMQ</strong> (Range Minimum Query): given l, r, return the smallest value in that range. An operation is <strong>idempotent</strong> if applying it twice to the same item changes nothing (min, max, gcd, AND, OR). Sparse tables need idempotent operations.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using the overlapping-windows trick for sums double counts the overlap. For static sums use prefix sums; sparse tables are for min, max, gcd.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>1483 Kth Ancestor of a Tree Node</b> (the same doubling table, called binary lifting), <b>2836 Maximize Value of Function in a Ball Passing Game</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Monotonic Deque &amp; Sorted Lists.</b> The dashboard's most common chart is "best day in each 3-day window", sliding along. That is many range-max queries of the same width, one step apart. Do we need any table at all for that?</div>

  <h2 id="dsa-ad-sorted"><span class="num">06</span>Monotonic Deque &amp; Sorted Lists</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Windows of a fixed width that slide one step at a time overlap almost entirely. A segment tree would answer each in O(log n), a sparse table in O(1) after an O(n log n) build. Can we reuse the previous window's work and do the whole chart in O(n)? And for questions like "smallest revenue ≥ ₹6k", what does Python offer instead of a balanced tree?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>maximum of every window</b> of size k", "sliding window min/max"; and for sorted structures: "<b>floor / ceiling</b>", "next bigger key", "book intervals", "TreeMap", "kth smallest so far".</p>
  </div>
  <h3>Monotonic deque recap</h3>
  <p>For "maximum of every window of size k", keep a deque of indexes whose values are decreasing. A new value removes every smaller value from the back (they can never be a window's max again, because the new one is bigger and stays longer). The front is the current max; drop it when it slides out. Each index is pushed and popped once, so O(n) total. The <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a> note covers monotonic stacks and deques in depth.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A queue for the tallest-person photo. When a taller person joins at the back, everyone shorter in front of them leaves: they will never be the tallest while this person is in the queue. The front is always the tallest in the window.</p>
  </div>
<div class="fx" data-lang="py">from collections import deque

def window_max(nums, k):
    dq, out = deque(), []                # indexes; their values strictly decreasing
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] &lt;= x:
            dq.pop()                     # smaller and older: never a max again
        dq.append(i)
        if dq[0] &lt;= i - k:
            dq.popleft()                 # front slid out of the window
        if i &gt;= k - 1:
            out.append(nums[dq[0]])
        print(f"day {i} (₹{x}k): deque values {[nums[j] for j in dq]}" + (f" -&gt; max {out[-1]}" if i &gt;= k - 1 else ""))
    return out

rev = [5, 2, 8, 1, 4, 7, 3, 6]
print("best day in every 3-day window:", window_max(rev, 3))</div>
  <div class="fx" data-lang="text">day 0 (₹5k): deque values [5]
day 1 (₹2k): deque values [5, 2]
day 2 (₹8k): deque values [8] -&gt; max 8
day 3 (₹1k): deque values [8, 1] -&gt; max 8
day 4 (₹4k): deque values [8, 4] -&gt; max 8
day 5 (₹7k): deque values [7] -&gt; max 7
day 6 (₹3k): deque values [7, 3] -&gt; max 7
day 7 (₹6k): deque values [7, 6] -&gt; max 7
best day in every 3-day window: [8, 8, 8, 7, 7, 7]</div>
  <p>When ₹8k (day 2) arrives it clears 5 and 2 from the back; it is the front for windows 0–2, 1–3 and 2–4. On day 4, ₹4k clears 1. On day 5, ₹7k clears 4 from the back, and 8 (day 2) leaves from the front because the window is now days 3–5. The chart is [8, 8, 8, 7, 7, 7].</p>
  <h3>bisect on a sorted list</h3>
  <p>Python has no built-in balanced tree (no TreeMap like Java). The usual stand-in is a plain sorted list with <code>bisect</code> (see the <a class="xref" data-note="dsa_binsearch">Binary Search</a> note): finding is O(log n), inserting shifts items so it is O(n). For n up to ~10⁵ with mostly reads, this is fast enough because the shift is a fast C memmove.</p>
<div class="fx" data-lang="py">import bisect

days = []
for r in [5, 2, 8, 1, 4, 7, 3, 6]:     # revenues arrive one day at a time
    bisect.insort(days, r)              # O(log n) to find, O(n) to shift
print(days)
print("days below 4:", bisect.bisect_left(days, 4))
print("smallest revenue &gt;= 6:", days[bisect.bisect_left(days, 6)])
print("largest revenue &lt;= 6:", days[bisect.bisect_right(days, 6) - 1])</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5, 6, 7, 8]
days below 4: 3
smallest revenue &gt;= 6: 6
largest revenue &lt;= 6: 6</div>
  <h3>sortedcontainers.SortedList</h3>
  <p>The third-party <code>sortedcontainers</code> package (available on LeetCode, not in the standard library) gives <code>SortedList</code>, <code>SortedDict</code> and <code>SortedSet</code> with about O(log n) add/remove and index access. It is a list of small sorted lists, not a tree, and it is the Python answer to TreeMap. Typical calls: <code>sl.add(x)</code>, <code>sl.remove(x)</code>, <code>sl.bisect_left(x)</code>, <code>sl[0]</code>, <code>sl[-1]</code>. In an interview, say you would use it, and fall back to bisect or a heap if it is not allowed.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Monotonic deque</strong>: a deque kept in decreasing (or increasing) order by popping from the back before each push; gives every sliding-window max (min) in O(n). <strong>Sorted list + bisect</strong>: O(log n) search, O(n) insert; SortedList: about O(log n) both.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Storing values instead of indexes in the deque: you then cannot tell when the front has left the window. And <code>bisect.insort</code> is O(n) per insert, so 10⁶ inserts into a growing list can be too slow.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>239 Sliding Window Maximum</b> (in the Stacks ladder), <b>731 My Calendar II</b>, <b>2349 Design a Number Container System</b>, <b>352 Data Stream as Disjoint Intervals</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: LRU &amp; LFU Caches.</b> The dashboard asks the same few range reports again and again. Recomputing is wasteful, but memory is limited. Which reports should we keep, and how do we find and refresh them in O(1)?</div>

<h2 id="dsa-ad-cache"><span class="num">07</span>LRU &amp; LFU Caches</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The dashboard keeps re-opening a few reports ("days 0–3", "days 1–3", "days 4–7"). We can store only a few. Which one should we throw away when the cache is full, and how do we find, refresh and evict entries in O(1)?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"design a <b>cache</b>", "<b>capacity</b>", "evict the <b>least recently</b> / least frequently used", "get and put in O(1)", "time-to-live tokens".</p>
  </div>
  <p>Your phone's "recent apps" list keeps the apps you used most recently. When memory runs out, the app you have not touched for the longest time is closed. That is <strong>LRU</strong>: Least Recently Used eviction. Browsers, databases, CDNs and Python's <code>functools.lru_cache</code> all use it.</p>
  <p>We need three things in O(1): look up a key, mark it as "just used", and find the oldest. A dict gives lookup. A <strong>doubly linked list</strong> ordered by recency gives "move to the newest end" and "remove the oldest" in O(1), as long as the dict points straight at the list node.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="ad-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><rect x="20" y="20" width="130" height="150" rx="8" class="fv sb"/><text x="85" y="40" text-anchor="middle" class="tb">dict</text><text x="85" y="75" text-anchor="middle">k=2 → node</text><text x="85" y="111" text-anchor="middle">k=7 → node</text><text x="85" y="147" text-anchor="middle">k=4 → node</text><rect x="175" y="95" width="80" height="36" rx="6" class="fs"/><text x="215" y="118" text-anchor="middle">head</text><line x1="257" y1="107" x2="273" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="273" y1="120" x2="257" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="275" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="315" y="118" text-anchor="middle">2:B</text><line x1="357" y1="107" x2="373" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="373" y1="120" x2="357" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="375" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="415" y="118" text-anchor="middle">7:Q</text><line x1="457" y1="107" x2="473" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="473" y1="120" x2="457" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="475" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="515" y="118" text-anchor="middle">4:Z</text><text x="315" y="85" text-anchor="middle" class="tr">oldest: evict here</text><text x="515" y="85" text-anchor="middle" class="tg">newest</text><text x="380" y="160" text-anchor="middle" class="tm">get/put: unlink node, re-attach at newest end: O(1)</text><text x="380" y="185" text-anchor="middle" class="tm">OrderedDict = this dict + linked list, built in</text></svg><figcaption>LRU = a dict for finding nodes plus a doubly linked list for order. Python's OrderedDict is this combination, already built.</figcaption></figure>
  <div class="fx" data-lang="py">from collections import OrderedDict

od = OrderedDict()                     # cached dashboard reports, oldest first
for key in ["days 0-3", "days 1-3", "days 4-7"]:
    od[key] = "report"
od.move_to_end("days 0-3")             # finance opened it again: make it the newest
print(list(od))
print(od.popitem(last=False))          # cache full: drop the least recently used
print(list(od))</div>
  <div class="fx" data-lang="text">['days 1-3', 'days 4-7', 'days 0-3']
('days 1-3', 'report')
['days 4-7', 'days 0-3']</div>
  <p>Finance re-opened "days 0-3", so it moved to the newest end; when space ran out, "days 1-3" (untouched for the longest time) was evicted. <code>move_to_end(key)</code> marks a key as newest, <code>popitem(last=False)</code> removes the oldest. Both O(1). Full LRU solutions (with and without OrderedDict) are in problem 3.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A small desk with room for three files. Every file you use goes on top of the pile; when a fourth arrives, the file at the bottom (untouched longest) goes back to the cupboard.</p>
  </div>
  <h3>LFU: least frequently used</h3>
  <p>LFU evicts the key used the <em>fewest</em> times; among ties, the least recent. Keep a bucket per frequency (frequency → OrderedDict of keys, oldest first) and a <code>min_freq</code>. On every use, move the key from bucket f to bucket f+1. A new key always starts at frequency 1, so <code>min_freq</code> resets to 1 on insert.</p>
  <div class="fx" data-lang="py">from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.key_freq = {}                          # key -&gt; how many times used
        self.buckets = defaultdict(OrderedDict)     # freq -&gt; keys (oldest first) -&gt; value
        self.min_freq = 0

    def _touch(self, key):
        f = self.key_freq[key]
        val = self.buckets[f].pop(key)
        if not self.buckets[f]:
            del self.buckets[f]
            if self.min_freq == f:
                self.min_freq = f + 1
        self.key_freq[key] = f + 1
        self.buckets[f + 1][key] = val
        return val

    def get(self, key):
        if key not in self.key_freq:
            return -1
        return self._touch(key)

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.key_freq:
            self._touch(key)
            self.buckets[self.key_freq[key]][key] = value
            return
        if len(self.key_freq) == self.cap:          # evict: least frequent, then oldest
            old, _ = self.buckets[self.min_freq].popitem(last=False)
            if not self.buckets[self.min_freq]:
                del self.buckets[self.min_freq]
            del self.key_freq[old]
        self.key_freq[key] = 1
        self.buckets[1][key] = value
        self.min_freq = 1

c = LFUCache(2)
c.put(1, 1); c.put(2, 2)
print(c.get(1))        # 1 used twice now
c.put(3, 3)            # evicts 2 (used once)
print(c.get(2), c.get(3))
c.put(4, 4)            # 1 and 3 both used twice; 1 is older -&gt; evict 1
print(c.get(1), c.get(3), c.get(4))</div>
  <div class="fx" data-lang="text">1
-1 3
-1 3 4</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In LFU, when you empty the bucket at <code>min_freq</code> by touching a key, <code>min_freq</code> becomes f + 1 (the key just moved there). You never need to search for the new minimum. Forgetting this update is the most common LFU bug.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LRU cache</strong>: evicts the entry unused for the longest time; dict (key → node) + doubly linked list (recency order), O(1) get/put. <strong>LFU cache</strong>: evicts the least frequently used entry (ties: least recent); frequency buckets + <code>min_freq</code>, O(1) get/put.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>146 LRU Cache</b>, <b>460 LFU Cache</b>, <b>1797 Design Authentication Manager</b>, <b>1396 Design Underground System</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Skip Lists &amp; Bloom Filters.</b> Caches make repeated lookups cheap. Two more questions come up in design rounds: how could a linked list be searched in O(log n), and how do we answer "have we seen this coupon code?" over billions of codes with very little memory?</div>

  <h2 id="dsa-ad-prob"><span class="num">08</span>Skip Lists &amp; Bloom Filters</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A sorted linked list is easy to insert into but slow to search (O(n)). And a set of billions of used coupon codes does not fit in memory. Can we trade a little randomness or a little error for speed and space?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"design a <b>skiplist</b>", "ordered set without a balanced tree", "<b>have we seen this</b> before" on huge data, "false positives are OK", "memory is tight".</p>
  </div>
  <h3>Skip list: express lanes on a linked list</h3>
  <p>A sorted linked list needs O(n) to find an item, because you must walk node by node. A <strong>skip list</strong> adds "express lanes": every node is on level 0, about half are also on level 1, a quarter on level 2, and so on (decided by coin flips). To search, ride the highest lane until the next stop would overshoot, drop down a lane, repeat. Like the Mumbai local: take the fast train to the nearest big station, then the slow train for the last few stops.</p>
  <p>Search, insert and delete are O(log n) on average, space O(n). No rotations like balanced BSTs, and easy to make concurrent. Redis sorted sets (<code>ZADD</code>, leaderboards) use skip lists. LeetCode 1206 asks you to design one; in most interviews the intuition is enough.</p>
  <h3>Bloom filter: "definitely not" or "maybe"</h3>
  <p>A website wants to check "is this username taken?" for a billion names without hitting the database each time. A <strong>Bloom filter</strong> is a bit array of m bits plus k hash functions. To add an item, set the k bits its hashes point to. To check, look at those k bits: if any is 0, the item was <strong>definitely never added</strong>. If all are 1, it was <strong>probably</strong> added (other items may have set those bits).</p>
  <div class="fx" data-lang="py">import hashlib

class BloomFilter:
    def __init__(self, m_bits, k_hashes):
        self.m, self.k = m_bits, k_hashes
        self.bits = 0                              # one big int used as a bit array

    def _positions(self, item):
        for seed in range(self.k):
            h = hashlib.sha256(f"{seed}:{item}".encode()).digest()
            yield int.from_bytes(h[:8], "big") % self.m

    def add(self, item):
        for p in self._positions(item):
            self.bits |= 1 &lt;&lt; p

    def might_contain(self, item):
        return all(self.bits &gt;&gt; p &amp; 1 for p in self._positions(item))

bf = BloomFilter(m_bits=1000, k_hashes=3)
for i in range(100):
    bf.add(f"user{i}")                         # 100 real users
print(bf.might_contain("user7"), bf.might_contain("zoya"))
print(all(bf.might_contain(f"user{i}") for i in range(100)))   # never a false "no"
fp = sum(bf.might_contain(f"guest{i}") for i in range(10_000))
print("false 'maybe' for 10000 strangers:", fp)</div>
  <div class="fx" data-lang="text">True False
True
false 'maybe' for 10000 strangers: 185</div>
  <p>With 100 items in 1000 bits and 3 hashes, about 2% of strangers get a false "maybe", matching the formula (1 − e^(−kn/m))ᵏ ≈ 1.7%. Every real user is always found: <strong>no false negatives</strong>. You cannot delete (clearing a bit could erase other items); a counting Bloom filter fixes that. Used in Chrome's old malicious-URL check, Cassandra/HBase/RocksDB to skip disk reads, and CDNs.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing up the error direction. Bloom filters can say "maybe yes" wrongly, never "no" wrongly. So they are a fast pre-check before the real lookup, not a replacement for it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Skip list</strong>: a sorted linked list with random "express" levels; O(log n) expected search/insert/delete. <strong>Bloom filter</strong>: m bits + k hash functions; "no" is always right, "yes" may be a false positive with probability about (1 − e^(−kn/m))ᵏ; no deletions.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: When Each Is Worth It.</b> We now own a toolbox of eight structures. The last skill is choosing: from the constraints (updates or not, which operation, how big), which one does the problem want?</div>

  <h2 id="dsa-ad-patterns"><span class="num">09</span>When Each Is Worth It</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every structure in this note is heavier than a plain list or prefix sums. When does the extra code pay off, and when is the simple tool the right answer?</p>
  </div>
  <table class="tbl">
    <tr><th>Signal words</th><th>Reach for</th><th>Cost</th></tr>
    <tr><td>"sum of range" + "update", "mutable"</td><td>Fenwick tree (or segment tree)</td><td>O(log n) each</td></tr>
    <tr><td>"min / max of range" + updates</td><td>Segment tree</td><td>O(log n) each</td></tr>
    <tr><td>"add x to all in [l, r]" + range queries</td><td>Segment tree with lazy tags</td><td>O(log n) each</td></tr>
    <tr><td>"min / max of range", array never changes</td><td>Sparse table</td><td>O(1) query</td></tr>
    <tr><td>"sum of range", array never changes</td><td>Prefix sums</td><td>O(1) query</td></tr>
    <tr><td>"how many smaller / greater before / after"</td><td>Fenwick over ranks (or merge sort)</td><td>O(n log n)</td></tr>
    <tr><td>"max of every window of size k"</td><td>Monotonic deque</td><td>O(n)</td></tr>
    <tr><td>"cache", "evict least recently used"</td><td>OrderedDict / dict + DLL</td><td>O(1)</td></tr>
    <tr><td>"book intervals", "next bigger key", "floor / ceiling"</td><td>bisect on a sorted list, SortedList</td><td>O(log n) find</td></tr>
    <tr><td>"have we seen this, huge data, some error OK"</td><td>Bloom filter</td><td>O(k), tiny memory</td></tr>
  </table>
  <div class="flow"><span>Does the data change?</span><span>No → prefix sums / sparse table</span><span>Point updates → Fenwick / segment tree</span><span>Range updates → lazy segment tree</span></div>
  <table class="tbl"><caption>The revenue dashboard: which tool for which request</caption>
    <tr><th>Request on rev = [5, 2, 8, 1, 4, 7, 3, 6]</th><th>Changes?</th><th>Tool</th><th>Answer</th></tr>
    <tr><td>Total of days 1..3, once</td><td>no</td><td>plain sum</td><td>11</td></tr>
    <tr><td>Totals of many ranges, month closed</td><td>no</td><td>prefix sums</td><td>P[4] − P[1] = 11</td></tr>
    <tr><td>Totals while days get corrected</td><td>point updates</td><td>Fenwick tree</td><td>11, then 6 after day 2 → 3</td></tr>
    <tr><td>Worst day in a range while days get corrected</td><td>point updates</td><td>segment tree (min)</td><td>min(1..3) = 1</td></tr>
    <tr><td>Festival bonus on days 4..7, then totals</td><td>range updates</td><td>lazy segment tree</td><td>days 5..6 = 14</td></tr>
    <tr><td>Worst day in any range, month closed</td><td>no</td><td>sparse table</td><td>min(2..7) = 1</td></tr>
    <tr><td>Best day in every 3-day window</td><td>no (stream)</td><td>monotonic deque</td><td>[8, 8, 8, 7, 7, 7]</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using a heavy tool when the constraints don't need it. n ≤ 10³ or no updates → simple wins, and an interviewer will ask why you wrote 40 lines.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> The decision table needs practice on real interview questions where the structure is hidden.</div>

  <h2 id="dsa-ad-problems"><span class="num">10</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can we use the structures on the questions interviewers actually ask, including the ones (count smaller after self, calendars) where the range structure is not obvious?</p>
  </div>
  <h3>1. Range Sum Query – Mutable</h3>
  <p>Support <code>update(i, val)</code> and <code>sumRange(l, r)</code>, up to 3·10⁴ calls each. Plain list or prefix sums give O(n) on one side and time out. Both trees give O(log n) for both. Here are both, as thin wrappers over the Fenwick class (section 02) and the SegmentTree class (section 03).</p>
  <div class="fx" data-lang="py">class NumArraySeg:
    def __init__(self, nums):
        self.st = SegmentTree(nums)            # the class from section 03

    def update(self, index, val):
        self.st.update(index, val)

    def sumRange(self, left, right):
        return self.st.query(left, right)

class NumArrayBIT:
    def __init__(self, nums):
        self.nums = nums[:]
        self.fw = Fenwick(len(nums))           # the class from section 02
        for i, x in enumerate(nums):
            self.fw.add(i, x)

    def update(self, index, val):
        self.fw.add(index, val - self.nums[index])   # BIT stores sums: add the change
        self.nums[index] = val

    def sumRange(self, left, right):
        return self.fw.range_sum(left, right)

for cls in (NumArraySeg, NumArrayBIT):
    na = cls([1, 3, 5])
    out = [na.sumRange(0, 2)]
    na.update(1, 2)
    out.append(na.sumRange(0, 2))
    na.update(0, -4)
    out += [na.sumRange(0, 0), na.sumRange(0, 1), na.sumRange(1, 2)]
    print(cls.__name__, out)</div>
  <div class="fx" data-lang="text">NumArraySeg [9, 8, -4, -2, 7]
NumArrayBIT [9, 8, -4, -2, 7]</div>
  <p>Note the BIT version keeps a copy of <code>nums</code>: an update must add the <em>change</em>, so it needs the old value. Build cost here is O(n log n) for the BIT (n adds); an O(n) build exists but is rarely asked.</p>

  <h3>2. Count of Smaller Numbers After Self</h3>
  <p>For each element, count how many elements to its right are smaller. <code>[5, 2, 6, 1]</code> → <code>[2, 1, 1, 0]</code>. Brute force: O(n²). Idea: walk from the right, and keep a Fenwick tree of "values seen so far" indexed by value. For x, the answer is "how many seen values are less than x" = a prefix sum. Values can be negative or huge, so first map them to ranks 0..m−1 (<strong>coordinate compression</strong>).</p>
  <table class="tbl out"><caption>Dry run on [5, 2, 6, 1] (ranks: 1→0, 2→1, 5→2, 6→3)</caption>
    <tr><th>x (from right)</th><th>rank</th><th>seen ranks</th><th>prefix(rank) = smaller seen</th></tr>
    <tr><td>1</td><td>0</td><td>{}</td><td>0</td></tr>
    <tr><td>6</td><td>3</td><td>{0}</td><td>1</td></tr>
    <tr><td>2</td><td>1</td><td>{0, 3}</td><td>1</td></tr>
    <tr><td>5</td><td>2</td><td>{0, 1, 3}</td><td>2</td></tr>
  </table>
  <div class="fx" data-lang="py">def count_smaller(nums):
    ranks = {v: i for i, v in enumerate(sorted(set(nums)))}   # value -&gt; 0..m-1
    fw = Fenwick(len(ranks))
    out = []
    for x in reversed(nums):                  # walk right to left
        r = ranks[x]
        out.append(fw.prefix(r))              # how many seen values have rank &lt; r
        fw.add(r, 1)                          # now x is "seen"
    return out[::-1]

for nums in [[5, 2, 6, 1], [-1], [-1, -1], [3, 2, 2, 6, 1], []]:
    print(nums, "-&gt;", count_smaller(nums))</div>
  <div class="fx" data-lang="text">[5, 2, 6, 1] -&gt; [2, 1, 1, 0]
[-1] -&gt; [0]
[-1, -1] -&gt; [0, 0]
[3, 2, 2, 6, 1] -&gt; [3, 1, 1, 1, 0]
[] -&gt; []</div>
  <p>O(n log n) time, O(n) space. <code>prefix(r)</code> counts ranks 0..r−1, which is exactly "strictly smaller", so equal values are not counted. The other classic solution is merge sort counting (like counting inversions).</p>

  <h3>3. LRU Cache</h3>
  <p>Design <code>get</code> and <code>put</code> in O(1) with a fixed capacity. With OrderedDict it is short. Interviewers often then say "without OrderedDict", so know the dict + doubly linked list version too.</p>
  <div class="fx" data-lang="py">from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = OrderedDict()             # oldest first, newest last

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)            # just used: newest
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) &gt; self.cap:
            self.data.popitem(last=False)     # evict the least recently used

c = LRUCache(2)
c.put(1, 1); c.put(2, 2)
print(c.get(1))           # 1 is now newest
c.put(3, 3)               # evicts 2
print(c.get(2))
c.put(4, 4)               # evicts 1
print(c.get(1), c.get(3), c.get(4))</div>
  <div class="fx" data-lang="text">1
-1
-1 3 4</div>
  <div class="fx" data-lang="py">class Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=0, val=0):
        self.key, self.val, self.prev, self.next = key, val, None, None

class LRUCacheManual:
    """dict for O(1) lookup + doubly linked list for O(1) reorder."""

    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = Node(), Node()     # sentinels: head.next = oldest
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _append(self, node):                      # insert just before tail = newest
        node.prev, node.next = self.tail.prev, self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node); self._append(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._append(node)
        if len(self.map) &gt; self.cap:
            oldest = self.head.next
            self._remove(oldest)
            del self.map[oldest.key]

c = LRUCacheManual(2)
c.put(1, 1); c.put(2, 2); r = [c.get(1)]
c.put(3, 3); r.append(c.get(2))
c.put(4, 4); r += [c.get(1), c.get(3), c.get(4)]
print(r)</div>
  <div class="fx" data-lang="text">[1, -1, -1, 3, 4]</div>
  <p>The two <strong>sentinel</strong> nodes (head and tail) mean no "is the list empty?" checks anywhere. Each node stores its key so eviction can delete it from the dict. Both versions: O(1) per call, O(capacity) space.</p>

  <h3>4. Sliding Window Maximum</h3>
  <p>Return the max of every window of size k. Brute force O(n·k). A heap with lazy deletion gives O(n log n). The monotonic deque gives O(n).</p>
  <table class="tbl out"><caption>Dry run [1, 3, -1, -3, 5, 3, 6, 7], k = 3 (deque shown as values)</caption>
    <tr><th>i</th><th>x</th><th>deque after</th><th>output</th></tr>
    <tr><td>0</td><td>1</td><td>[1]</td><td>–</td></tr>
    <tr><td>1</td><td>3</td><td>[3] (1 popped)</td><td>–</td></tr>
    <tr><td>2</td><td>−1</td><td>[3, −1]</td><td>3</td></tr>
    <tr><td>3</td><td>−3</td><td>[3, −1, −3]</td><td>3</td></tr>
    <tr><td>4</td><td>5</td><td>[5] (all popped)</td><td>5</td></tr>
    <tr><td>5</td><td>3</td><td>[5, 3]</td><td>5</td></tr>
    <tr><td>6</td><td>6</td><td>[6]</td><td>6</td></tr>
    <tr><td>7</td><td>7</td><td>[7]</td><td>7</td></tr>
  </table>
  <div class="fx" data-lang="py">from collections import deque

def max_sliding_window(nums, k):
    dq = deque()                       # indexes; their values strictly decreasing
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] &lt;= x:
            dq.pop()                   # smaller and older: can never be a max again
        dq.append(i)
        if dq[0] &lt;= i - k:
            dq.popleft()               # front slid out of the window
        if i &gt;= k - 1:
            out.append(nums[dq[0]])    # front is the max of the window
    return out

for nums, k in [([5, 2, 8, 1, 4, 7, 3, 6], 3), ([1, 3, -1, -3, 5, 3, 6, 7], 3), ([1], 1), ([9, 8, 7, 6], 2), ([1, 2, 3, 4], 4)]:
    print(nums, k, "-&gt;", max_sliding_window(nums, k))</div>
  <div class="fx" data-lang="text">[5, 2, 8, 1, 4, 7, 3, 6] 3 -&gt; [8, 8, 8, 7, 7, 7]
[1, 3, -1, -3, 5, 3, 6, 7] 3 -&gt; [3, 3, 5, 5, 6, 7]
[1] 1 -&gt; [1]
[9, 8, 7, 6] 2 -&gt; [9, 8, 7]
[1, 2, 3, 4] 4 -&gt; [4]</div>
  <p>Store indexes, not values, so you can tell when the front has left the window. O(n) time, O(k) space. On the revenue it reproduces the chart from section 06: [8, 8, 8, 7, 7, 7].</p>

  <h3>5. My Calendar I</h3>
  <p>Book half-open intervals [start, end); refuse a booking that overlaps an existing one. Keep bookings sorted by start. A new booking only needs to be checked against its two neighbours: the one just before (does it end after we start?) and the one just after (does it start before we end?). Find the spot with <code>bisect</code>.</p>
  <div class="fx" data-lang="py">import bisect

class MyCalendar:
    def __init__(self):
        self.starts, self.ends = [], []       # bookings sorted by start

    def book(self, start, end):              # half-open [start, end)
        i = bisect.bisect_right(self.starts, start)
        if i &gt; 0 and self.ends[i - 1] &gt; start:            # previous booking runs into us
            return False
        if i &lt; len(self.starts) and self.starts[i] &lt; end:  # next booking starts before we end
            return False
        self.starts.insert(i, start)
        self.ends.insert(i, end)
        return True

cal = MyCalendar()
print([cal.book(s, e) for s, e in [(10, 20), (15, 25), (20, 30), (5, 10), (5, 11), (30, 31)]])</div>
  <div class="fx" data-lang="text">[True, False, True, True, False, True]</div>
  <p>(10, 20) ok; (15, 25) overlaps; (20, 30) touches at 20, which is fine for half-open intervals; (5, 10) ok; (5, 11) overlaps (10, 20); (30, 31) ok. Search O(log n), insert O(n) because of list shifting. With <code>SortedList</code> or a balanced BST it would be O(log n). The brute-force check against every booking is O(n) per call and also passes on LeetCode.</p>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> These structures are long, and their bugs are off-by-ones: index 0, set vs add, a tree that is too small.</div>

  <h2 id="dsa-ad-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which slips break these structures most often, and how do you avoid them?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Fenwick index 0</span>
    <p><code>i &amp; -i</code> is 0 when i = 0, so the update loop never moves. Shift to 1-based inside the class and nowhere else.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "set" vs "add" in a BIT</span>
    <p>A BIT only knows how to add. To set <code>nums[i] = val</code>, add <code>val - old</code> and remember the new value.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: segment tree too small</span>
    <p>Sizing the list as 2n works only for the iterative bottom-up version. The recursive version with root at 1 needs up to 4n.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sparse table for sums</span>
    <p>The overlapping-windows trick double counts for sums. Use prefix sums for static sums; sparse tables are for min, max, gcd.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: LRU put on an existing key</span>
    <p>Updating an existing key must also make it newest, and must not count as a new entry for eviction. In the manual version, remove the old node before appending the new one.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: picking a heavy tool</span>
    <p>If there are no updates, prefix sums beat any tree. If n ≤ 10³, brute force is fine. Say the simple solution first, then upgrade when the constraints demand it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting to push lazy tags</span>
    <p>Any operation that goes below a node with a pending tag must push it first, or the children (and the parent recomputed from them) lose the update.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> How does each structure grow out of the one before, and what does each give on the 8 days of revenue?</div>

  <h2 id="dsa-ad-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Prefix sums, Fenwick tree, segment tree, lazy tags, sparse table, deque, sorted lists, caches, skip lists and Bloom filters: how is each built from the ones before, and what does each give on the 8 days of revenue?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-ad-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="210" y1="32" x2="230" y2="32" stroke="currentColor" marker-end="url(#dsa-ad-a9)"/>
<line x1="430" y1="32" x2="450" y2="32" stroke="currentColor" marker-end="url(#dsa-ad-a9)"/>
<line x1="550" y1="54" x2="550" y2="88" stroke="currentColor" marker-end="url(#dsa-ad-a9)"/>
<line x1="500" y1="54" x2="380" y2="88" stroke="currentColor" marker-end="url(#dsa-ad-a9)"/>
<line x1="230" y1="110" x2="210" y2="110" stroke="currentColor" marker-end="url(#dsa-ad-a9)"/>
<line x1="110" y1="132" x2="110" y2="166" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-ad-a9)"/>
<line x1="210" y1="188" x2="230" y2="188" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-ad-a9)"/>
<line x1="430" y1="188" x2="450" y2="188" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-ad-a9)"/>
<line x1="330" y1="210" x2="330" y2="244" stroke="currentColor" marker-end="url(#dsa-ad-a9)"/>
<rect x="10" y="10" width="200" height="44" rx="7" class="fr sr"/>
<text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">range sums + updates</text>
<text x="110" y="45" text-anchor="middle" class="tm" font-size="10">list O(n) query; prefix O(n) update</text>
<rect x="230" y="10" width="200" height="44" rx="7" class="fg sg"/>
<text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Fenwick tree</text>
<text x="330" y="45" text-anchor="middle" class="tm" font-size="10">boxes by lowbit: 7→6→4</text>
<rect x="450" y="10" width="200" height="44" rx="7" class="fg sg"/>
<text x="550" y="29" text-anchor="middle" font-size="11.5" font-weight="700">segment tree</text>
<text x="550" y="45" text-anchor="middle" class="tm" font-size="10">query(1,3) = 2 + 9</text>
<rect x="450" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="550" y="107" text-anchor="middle" font-size="11.5" font-weight="700">lazy propagation</text>
<text x="550" y="123" text-anchor="middle" class="tm" font-size="10">+2 on days 4..7: one tag</text>
<rect x="230" y="88" width="200" height="44" rx="7" class="fb sb"/>
<text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">sparse table (static)</text>
<text x="330" y="123" text-anchor="middle" class="tm" font-size="10">min of 2..7 = 1 in O(1)</text>
<rect x="10" y="88" width="200" height="44" rx="7" class="fb sb"/>
<text x="110" y="107" text-anchor="middle" font-size="11.5" font-weight="700">monotonic deque</text>
<text x="110" y="123" text-anchor="middle" class="tm" font-size="10">3-day max: 8, 8, 8, 7, 7, 7</text>
<rect x="10" y="166" width="200" height="44" rx="7" class="ft st"/>
<text x="110" y="185" text-anchor="middle" font-size="11.5" font-weight="700">sorted list + bisect</text>
<text x="110" y="201" text-anchor="middle" class="tm" font-size="10">days below ₹4k: 3</text>
<rect x="230" y="166" width="200" height="44" rx="7" class="ft st"/>
<text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">LRU / LFU caches</text>
<text x="330" y="201" text-anchor="middle" class="tm" font-size="10">re-used reports, O(1)</text>
<rect x="450" y="166" width="200" height="44" rx="7" class="ft st"/>
<text x="550" y="185" text-anchor="middle" font-size="11.5" font-weight="700">skip list / Bloom</text>
<text x="550" y="201" text-anchor="middle" class="tm" font-size="10">"maybe" vs "definitely not"</text>
<rect x="230" y="244" width="200" height="44" rx="7" class="fv"/>
<text x="330" y="263" text-anchor="middle" font-size="11.5" font-weight="700">when each is worth it</text>
<text x="330" y="279" text-anchor="middle" class="tm" font-size="10">updates? op? static?</text>
</svg><figcaption>Top row: the need, then the two O(log n) answers for ranges with updates (Fenwick: prefix blocks by lowbit; segment tree: halves). Lazy tags extend the segment tree to range updates. Sparse table and deque drop the updates to get O(1) / O(n). Gold: the other structures interviews ask about. Purple: choosing by constraints.</figcaption></figure>
  <table class="tbl"><caption>Every concept on rev = [5, 2, 8, 1, 4, 7, 3, 6] (₹ thousand, days 0–7)</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Plain list / prefix sums</td><td>Arrays note</td><td>range total?</td><td>11 by 3 adds; P[4] − P[1] = 11; fix rewrites 6 entries</td><td>no updates (prefix) or tiny n</td></tr>
    <tr><td>Fenwick tree</td><td>prefix sums + lowbit blocks</td><td>range sum with updates?</td><td>t = [5, 7, 8, 16, 4, 11, 3, 36]; prefix(7) = 3 + 11 + 16 = 30</td><td>sums / counts / XOR with point updates</td></tr>
    <tr><td>Segment tree</td><td>tree of halves (heap layout)</td><td>any associative range op with updates?</td><td>query(1, 3) = 2 + 9 = 11; after fix 6</td><td>min / max / gcd / sum, searching inside</td></tr>
    <tr><td>Lazy propagation</td><td>segment tree + IOU tags</td><td>range update in O(log n)?</td><td>+2 on [4..7]: node sum 28, lazy 2; days 5..6 = 14</td><td>range add / assign + range query</td></tr>
    <tr><td>Sparse table</td><td>doubling windows, idempotent op</td><td>static range min in O(1)?</td><td>min(2..7) = min(1, 3) = 1</td><td>frozen data, many RMQs, binary lifting</td></tr>
    <tr><td>Monotonic deque</td><td>stack/queue + "dominated items leave"</td><td>max of every k-window?</td><td>[8, 8, 8, 7, 7, 7]</td><td>sliding window min/max</td></tr>
    <tr><td>Sorted list / SortedList</td><td>binary search</td><td>floor / ceiling / rank?</td><td>3 days below ₹4k; smallest ≥ 6 is 6</td><td>ordered lookups, calendars</td></tr>
    <tr><td>LRU / LFU cache</td><td>dict + doubly linked list / buckets</td><td>what to keep with limited room?</td><td>evict "days 1-3"</td><td>caches, O(1) get/put</td></tr>
    <tr><td>Skip list / Bloom filter</td><td>randomness / hashing into bits</td><td>fast ordered list? cheap membership?</td><td>Bloom: 185 false "maybe" in 10,000, no false "no"</td><td>Redis-style sets; pre-checks before disk</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>store pre-combined blocks so a question reads only a few blocks and a change fixes only a few; how you choose the blocks (prefix by lowbit, halves, powers of two, a sliding deque) decides which operations and updates you can support.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then the <a class="xref" data-note="dsa_problems">Problem Tracker</a>'s Advanced ladder: Range Sum Query – Mutable, Count of Smaller Numbers After Self, LRU Cache, My Calendar, solved without the notes open.</div>

  <h2 id="dsa-ad-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <b>rev = [5, 2, 8, 1, 4, 7, 3, 6]</b> (₹ thousand, days 0–7); prefix P = [0, 5, 7, 15, 16, 20, 27, 30, 36]; correction day 2: 8 → 3; festival +2 on days 4..7.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>List / prefix sums</td><td>range total with corrections?</td><td>11; fix rewrites P[3..8]</td><td>O(n) on one side</td></tr>
    <tr><td>Fenwick</td><td>both in O(log n)?</td><td>7 → 6 → 4; fix 3 → 4 → 8</td><td>sums only (needs subtraction)</td></tr>
    <tr><td>Segment tree</td><td>any op with updates?</td><td>query(1, 3) = 2 + 9</td><td>range updates are slow</td></tr>
    <tr><td>Lazy</td><td>range update O(log n)?</td><td>[4..7] sum 28, lazy 2</td><td>static data deserves better</td></tr>
    <tr><td>Sparse table</td><td>static RMQ in O(1)?</td><td>min(2..7) = 1</td><td>sliding windows</td></tr>
    <tr><td>Deque</td><td>every k-window max?</td><td>[8, 8, 8, 7, 7, 7]</td><td>other design needs</td></tr>
    <tr><td>Sorted / caches / Bloom</td><td>floor-ceiling, eviction, membership?</td><td>3 days &lt; ₹4k; evict "days 1-3"</td><td>which to choose?</td></tr>
    <tr><td>Choosing</td><td>which tool for the constraints?</td><td>see the decision table</td><td>→ tracker</td></tr>
  </table>
  <h3>Formulas and templates</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Prefix sums</td><td>sum(l..r) = P[r+1] − P[l]</td><td>update costs O(n)</td></tr>
    <tr><td>lowbit</td><td>i &amp; −i</td><td>box i covers (i − lowbit, i], 1-indexed</td></tr>
    <tr><td>Fenwick query</td><td>while i &gt; 0: s += t[i]; i −= i &amp; −i</td><td>prefix of the first i items</td></tr>
    <tr><td>Fenwick update</td><td>while i ≤ n: t[i] += d; i += i &amp; −i</td><td>set = add (new − old)</td></tr>
    <tr><td>Segment tree</td><td>tree[v] = tree[2v] ⊕ tree[2v+1]; children of v: 2v, 2v+1</td><td>⊕ = +, min, max, gcd; size 4n; identity 0 / ±∞</td></tr>
    <tr><td>Query cases</td><td>outside → identity; inside → tree[v]; partial → both children</td><td>O(log n)</td></tr>
    <tr><td>Lazy</td><td>cover: sum += x·len, lazy += x, stop; push before going down</td><td>len = hi − lo + 1</td></tr>
    <tr><td>Sparse table</td><td>T[k][i] = min(T[k−1][i], T[k−1][i + 2^(k−1)]); query min(T[k][l], T[k][r − 2^k + 1])</td><td>k = ⌊log₂(r − l + 1)⌋; idempotent ops only</td></tr>
    <tr><td>Deque</td><td>pop back while ≤ x; push i; pop front if ≤ i − k</td><td>front = window max</td></tr>
    <tr><td>Bloom false positive</td><td>≈ (1 − e^(−kn/m))ᵏ</td><td>m bits, k hashes, n items</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Fenwick</b><p>Range sums / counts with point updates; count smaller after self.</p><small>Not for min/max</small></div>
    <div><b>Segment tree</b><p>Any associative op with updates; lazy for range updates.</p><small>Not when there are no updates (prefix / sparse)</small></div>
    <div><b>Sparse table</b><p>Static RMQ, many queries, binary lifting.</p><small>Not for sums; not with updates</small></div>
    <div><b>Deque</b><p>Fixed-width sliding windows, O(n).</p><small>Not for arbitrary ranges</small></div>
    <div><b>LRU / LFU</b><p>Bounded caches with O(1) get/put.</p><small>Not when every item must be kept</small></div>
    <div><b>Bloom filter</b><p>Cheap "definitely not" pre-checks on huge sets.</p><small>Not when a false "yes" is unacceptable</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Fenwick index 0 (1-index inside); set vs add in a BIT; segment tree sized 2n instead of 4n; wrong identity for no-overlap; not recomputing parents; forgetting to push lazy tags; sparse tables for sums; deque storing values not indexes; LRU put on an existing key; LFU min_freq; using a tree when prefix sums or brute force suffice.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Which Fenwick boxes does prefix(7) read, and which does an update at day 2 touch?</td><td>7, 6, 4; boxes 3, 4, 8</td></tr>
    <tr><td>Which segment-tree nodes give days 1..3?</td><td>[1..1] = 2 and [2..3] = 9</td></tr>
    <tr><td>Why can't a Fenwick tree answer range min?</td><td>A range is prefix(r) − prefix(l); min has no subtraction</td></tr>
    <tr><td>Sparse table query for days 2..7?</td><td>k = 2: min(T[2][2], T[2][4]) = min(1, 3) = 1</td></tr>
    <tr><td>No updates, 10⁵ range-sum queries: which structure?</td><td>Prefix sums: O(n) build, O(1) per query</td></tr>
  </table>

  
<h2 id="dsa-ad-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why not prefix sums for Range Sum Query Mutable?</summary><div class="qa-body">A point update changes every prefix after it: O(n) per update. With many updates that is O(n·q). Segment or Fenwick trees make both operations O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe a segment tree query's three cases.</summary><div class="qa-body">No overlap with [l, r] → return the identity (0 for sum, +inf for min). Node range fully inside → return the stored value. Partial overlap → recurse into both children and combine. O(log n) nodes are visited.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is lazy propagation in one sentence?</summary><div class="qa-body">For a range update, stop at nodes fully covered by the range, update their value and leave a pending tag, and push that tag to the children only when a later operation needs to go below that node; this keeps range updates O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does box i of a Fenwick tree store, and how do update and query move?</summary><div class="qa-body">The sum of the <code>i &amp; -i</code> elements ending at i (1-indexed). Query: <code>i -= i &amp; -i</code> until 0. Update: <code>i += i &amp; -i</code> until past n. Both O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Segment tree vs Fenwick tree: when do you need the segment tree?</summary><div class="qa-body">When the operation has no inverse (range min/max), when you need range updates with range queries, or when you need to walk the tree (e.g. find the first index where the prefix exceeds x, though BIT can do that one too). For plain sums and counts, Fenwick is shorter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a sparse table answer in O(1), and why only for min-like operations?</summary><div class="qa-body">Any range of length L is covered by two precomputed windows of length 2ᵏ (k = floor(log₂ L)) starting at l and ending at r. They may overlap, which is harmless for idempotent operations like min, max and gcd, but would double count for sums.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design an LRU cache with O(1) get and put.</summary><div class="qa-body">A hash map from key to node, and a doubly linked list ordered by recency with sentinel head and tail. get: find node, unlink, append at newest end. put: update or create node, append at newest end; if over capacity, remove the node after head and delete its key from the map. In Python, OrderedDict with <code>move_to_end</code> and <code>popitem(last=False)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does LFU keep O(1) eviction?</summary><div class="qa-body">Map key → frequency, and frequency → OrderedDict of keys (oldest first), plus <code>min_freq</code>. Evict with <code>buckets[min_freq].popitem(last=False)</code>. On a touch, move the key to bucket f+1 and bump <code>min_freq</code> if bucket f became empty and was the minimum. New keys set <code>min_freq = 1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Count of Smaller Numbers After Self: why coordinate compression?</summary><div class="qa-body">A Fenwick tree is indexed by value. Values can be negative or up to 10⁹, so map each distinct value to its rank 0..m−1. The tree then needs only m slots, and order (which is all we compare) is kept.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the monotonic deque O(n) even with a while loop inside?</summary><div class="qa-body">Each index is appended once and popped at most once (from the back or the front). Total pops ≤ n, so all the inner loops together are O(n). This is amortised analysis.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A Bloom filter says "maybe present". What do you do? What if it says "not present"?</summary><div class="qa-body">"Maybe": check the real store, because it could be a false positive. "Not present": trust it, Bloom filters have no false negatives. False positive rate is about (1 − e^(−kn/m))ᵏ; more bits per item lowers it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Python has no TreeMap. What do you use for "floor / ceiling key with inserts"?</summary><div class="qa-body">A sorted list with <code>bisect</code> (O(log n) search, O(n) insert, fine up to ~10⁵), <code>sortedcontainers.SortedList</code> (≈O(log n) everything, available on LeetCode), or a heap if you only need the min/max.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the Fenwick tree need the Bit Manipulation note's x &amp; −x?</summary><div class="qa-body">Box i covers the last lowbit(i) items. Moving left for a query (i −= i &amp; −i) drops the lowest 1 bit, and moving up for an update (i += i &amp; −i) carries into the next box that also covers i. Each step changes one bit, so there are at most log₂ n steps: 7 → 6 → 4 → 0 on our 8 days.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the segment tree and use prefix sums with corrections?</summary><div class="qa-body">Every correction rewrites every later prefix: the day-2 fix changed 6 of 9 entries; with 10⁵ days and 10⁵ corrections that is about 10¹⁰ steps. The segment tree fixes only one root-to-leaf path (log n nodes) and still answers queries in O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: the sparse table and the segment tree both answer range min. Why keep both?</summary><div class="qa-body">The sparse table is O(1) per query but O(n log n) to build and must be rebuilt after any change. The segment tree is O(log n) per query but handles updates in O(log n). Frozen data with many queries → sparse table; changing data → segment tree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is the monotonic deque related to the range structures?</summary><div class="qa-body">It answers a special case of range max: windows of one fixed width that slide by one. Because consecutive windows overlap, it reuses the previous window's work (dominated values never come back), giving O(n) total instead of O(n log n) with a segment tree.</div></details>
</main>
`
});
