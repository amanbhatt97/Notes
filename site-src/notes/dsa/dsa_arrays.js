// notes/dsa/dsa_arrays.js — Arrays, Strings & Two Pointers
Object.assign(TOPIC_CONTENT, {
  "dsa_arrays": `<main>
<h1>Arrays, Strings &amp; Two Pointers</h1>
  <div class="where"><span>DSA</span><span>Linear structures</span><span>Arrays, Strings &amp; Two Pointers</span></div>
  <p class="lead">An array is a row of numbered boxes, and almost every interview starts with one. This note takes Biteful's 8 charges from the Complexity note and asks harder and harder questions about them: which two orders make a ₹280 combo, which 3 consecutive orders were busiest, what did orders 2 to 4 add up to, which stretch was most profitable. The first answer is always "check everything" (O(n²) or worse); each section then removes one kind of repeated work: <strong>two pointers</strong>, <strong>sliding window</strong>, <strong>prefix sums</strong> and <strong>Kadane</strong>. Then the same ideas on text (strings) and on grids (2-D matrices). Every pattern comes with the words that give it away in a problem statement, a template, a traced table on the charges, tested code, its cost, and practice problems from the tracker. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-ar-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-ar-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Complexity &amp; Python Internals · Python: Lists &amp; Tuples</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-ar-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Arrays, Strings &amp; Two Pointers</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · O(n²) pair loops → O(n)</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ar-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ar-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ar-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Hashing (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">unsorted pairs, negative sums</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Linked Lists</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">fast &amp; slow pointers on chains</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Binary Search · DP</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">sorted halves · Kadane grows up</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ar-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Arrays: about 110 problems, each tagged with the pattern of this note it uses</text>
</svg><figcaption>Reading order for the first DSA block: Complexity → <b>Arrays</b> → Hashing → Linked Lists. Arrays comes second because every later structure is compared with it.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_complexity">Complexity &amp; Python Internals</a></b><span>That note ended with a verdict and no cure: a pair search over the charges is O(n²), and a constraint like n ≤ 10⁵ forbids it. It also showed what a list is inside (one block of slots), which is why <code>a[i]</code> is instant. From <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> you know the Python syntax: indexing, slicing, <code>append</code>.</span></li>
    <li><b>This note adds: the four "don't redo work" techniques on arrays</b><span>Two pointers, sliding window, prefix sums and Kadane, each moving a problem from O(n²) (or O(n³)) to O(n). Then strings and 2-D grids, which are arrays in disguise.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_hashing">Hashing</a></b><span>Two pointers needs sorted data and loses the original positions; sliding window breaks on negative numbers. Hashing fixes both with "remember what you have seen", using the same 8 charges. Then <a class="xref" data-note="dsa_linkedlist">Linked Lists</a>, where the two-pointer idea returns as fast &amp; slow pointers. Practice everything in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-ar-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers are on Biteful's 8 charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b>.</p>
  <ol class="story">
    <li><b>The array</b><span>Q: how do we store the day's charges so we can reach any one quickly? → One block of equal slots: <code>charges[4]</code> = 310 in one jump, append at the end in O(1) amortised. But the questions finance asks are about <em>pairs</em> and <em>stretches</em> of orders…</span></li>
    <li><b>Brute force pair search</b><span>Q: which two orders make a ₹280 combo? → Try every pair: found (80, 200) after 13 of the 28 pairs. Always correct, but n(n−1)/2 pairs is O(n²): 4,000 charges already take half a second. Can one look rule out many pairs at once?</span></li>
    <li><b>Two pointers</b><span>Q: on sorted charges, can each step discard a whole group of pairs? → L at the cheapest, R at the dearest: too big → R moves left, too small → L moves right. Found 80 + 200 in 5 steps; O(n). But it handles pairs only; finance now asks about consecutive orders…</span></li>
    <li><b>Sliding window</b><span>Q: which 3 consecutive orders were busiest, and what is the shortest run worth ₹500? → Slide a window: add the order that joins, subtract the one that leaves. Busiest = 600 (250, 40, 310); shortest ≥ 500 = 3 orders. O(n). But each new question needs a new pass, and answering many range questions re-adds the same numbers…</span></li>
    <li><b>Prefix sums</b><span>Q: what did orders i..j add up to, for many different i, j? → Store running totals once: P = [0, 120, 200, 450, 490, 800, 880, 940, 1140]; orders 2..4 = P[5] − P[2] = 600 in O(1). But "the best stretch" with gains and losses (negative numbers) is still unsolved…</span></li>
    <li><b>Kadane</b><span>Q: after paying the rider ₹120 per order, which stretch was most profitable? → Profit = [0, −40, 130, −80, 190, −40, −60, 80]; keep the best run ending here, drop it when it goes negative: best = 240 (orders 2..4). O(n). All of this was on numbers; the charges actually arrive as text…</span></li>
    <li><b>Strings as arrays</b><span>Q: the gateway sends "120,80,250,…" as one string; does any of this work on text? → A string is an array of characters (indexing, slicing, two pointers, windows all work) but it is immutable: build with a list and <code>join</code>, never <code>+=</code> in a loop. And some data has two dimensions…</span></li>
    <li><b>2-D matrices</b><span>Q: lunch and dinner shifts as rows, order slots as columns: how do we walk a grid? → <code>grid[r][c]</code>; row totals [490, 650], column totals [430, 160, 310, 240], transpose, spiral, 4 neighbours, rotate. Then a signal-words table to pick the right technique, 8 classic problems, the traps, and on to Hashing.</span></li>
  </ol>

  <h2 id="dsa-ar-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Arrays, Strings &amp; Two Pointers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Array basics</div>
        <ul>
          <li><b>Array</b> — items side by side in one block of memory, same-size slots</li>
          <li><b>Index</b> — address = start + i × size → read/write <code>a[i]</code> in O(1)</li>
          <li><b>Dynamic array</b> (Python list) — full? allocate a bigger block, copy over</li>
          <li><b>append</b> O(1) amortised · <b>insert(0)</b>, <b>x in a</b> O(n)</li>
          <li>💡 Hostel lockers: walk straight to locker 37</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Brute force first</div>
        <ul>
          <li><b>All pairs</b> — two nested loops, n(n−1)/2 checks → O(n²)</li>
          <li><b>All subarrays</b> — every start × every end → O(n²), O(n³) if each is summed</li>
          <li>Always say it first, then ask "what am I recomputing?"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two pointers</div>
        <ul>
          <li><b>Opposite ends</b> — L at start, R at end, move toward each other (needs sorted / symmetric)</li>
          <li><b>Same direction</b> — slow writes, fast reads (in-place filter, dedupe)</li>
          <li><b>Why it works</b> — each step safely rules out a whole row of pairs</li>
          <li>Signal: "sorted", "pair / triplet sums to", "in place", "palindrome"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sliding window</div>
        <ul>
          <li><b>Fixed k</b> — add the new right item, subtract the item that fell off</li>
          <li><b>Variable</b> — grow right; while the window breaks the rule (or is valid, for "shortest"), shrink left</li>
          <li>Each index enters once, leaves once → O(n)</li>
          <li>Signal: "contiguous subarray / substring", "longest / shortest / at most k"</li>
          <li>⚠ Needs positives (a rule that only gets more broken as the window grows)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Prefix sums &amp; Kadane</div>
        <ul>
          <li><b>P[i]</b> = sum of first i items; <code>P[0] = 0</code></li>
          <li><b>Range sum</b> i..j = <code>P[j+1] − P[i]</code> in O(1)</li>
          <li><b>Kadane</b> — <code>cur = max(x, cur + x)</code>; best = max seen → max subarray O(n)</li>
          <li>⚠ All negative: start from <code>nums[0]</code>, not 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Strings</div>
        <ul>
          <li><b>Immutable</b> — <code>s[0] = "x"</code> is a TypeError; every change makes a new string</li>
          <li><b>Build with a list</b>, then <code>"".join(parts)</code> once → O(n)</li>
          <li><code>split</code>, <code>strip</code>, <code>[::-1]</code>, <code>ord</code> / <code>chr</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrix / 2D</div>
        <ul>
          <li><code>grid[r][c]</code>; rows = <code>len(grid)</code>, cols = <code>len(grid[0])</code></li>
          <li><b>4 neighbours</b> — <code>(1,0),(-1,0),(0,1),(0,-1)</code>, check bounds</li>
          <li><b>Spiral</b> — four walls, shrink after each side</li>
          <li><b>Rotate 90° clockwise</b> — transpose, then reverse each row</li>
          <li>⚠ <code>[[0]*m]*n</code> → n references to one row</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Two Sum II</b>, <b>Container With Most Water</b>, <b>3Sum</b> — two pointers</li>
          <li><b>Longest Substring w/o Repeat</b>, <b>Minimum Window</b> — variable window</li>
          <li><b>Maximum Subarray</b> — Kadane · <b>Product Except Self</b> — prefix × suffix</li>
          <li><b>Rotate Image</b>, <b>Spiral Matrix</b> — 2D index work</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-ar-dynamic"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Array &amp; Its Costs</span><span class="rm-sub">Lockers, dynamic array, one-pass scans</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-brute"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Brute Force: Every Pair</span><span class="rm-sub">The ₹280 combo, O(n²)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-twoptr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Two Pointers</span><span class="rm-sub">Opposite ends, reader/writer</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-window"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Sliding Window</span><span class="rm-sub">Fixed, then variable size</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-prefix"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Prefix Sums</span><span class="rm-sub">Any range sum in O(1)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-kadane"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Kadane's Algorithm</span><span class="rm-sub">Best stretch in one pass</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-strings"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Strings as Arrays</span><span class="rm-sub">Immutability, split, join</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-matrix"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">2-D Matrices</span><span class="rm-sub">Traversals, spiral, rotate</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Choosing the Technique</span><span class="rm-sub">Signal words → pattern</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-problems"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">8 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Shared rows, off-by-one, hidden O(n)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ar-dynamic"><span class="num">01</span>The Array &amp; Its Costs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Complexity note costed Biteful's charges as "a list". Before we can make any array question faster, we need a clear picture of what an array is good at (and bad at), because every technique in this note is a way of staying in the fast zone.</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful's 8 charges for one day, in rupees, in the order they happened (the same numbers as the Complexity, Hashing and Linked Lists notes):</p>
  <table class="tbl"><caption>charges</caption>
    <tr><th>index</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
    <tr><td>₹</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
  </table>
  <p>A college hostel has a corridor of lockers numbered 0, 1, 2, … and every locker is the same width. Someone says "get my bag from locker 4". You don't open lockers 0 to 3 first; you know where 4 is and walk straight there. That is an <strong>array</strong>: items side by side in one unbroken block of memory, every slot the same size, so the computer can work out where item <code>i</code> lives with one small sum.</p>
<figure class="viz"><svg viewBox="0 0 640 165" width="640">
<text x="320" y="16" text-anchor="middle" class="tb" font-size="12">one unbroken block of memory, every slot the same size</text>
<rect x="60" y="50" width="70" height="40" class="fb sb"/><text x="95" y="75" text-anchor="middle" font-size="12">120</text>
<text x="95" y="40" text-anchor="middle" class="tm" font-size="11">1000</text><text x="95" y="110" text-anchor="middle" class="tm" font-size="11">i=0</text>
<rect x="130" y="50" width="70" height="40" class="fb sb"/><text x="165" y="75" text-anchor="middle" font-size="12">80</text>
<text x="165" y="40" text-anchor="middle" class="tm" font-size="11">1008</text><text x="165" y="110" text-anchor="middle" class="tm" font-size="11">i=1</text>
<rect x="200" y="50" width="70" height="40" class="fb sb"/><text x="235" y="75" text-anchor="middle" font-size="12">250</text>
<text x="235" y="40" text-anchor="middle" class="tm" font-size="11">1016</text><text x="235" y="110" text-anchor="middle" class="tm" font-size="11">i=2</text>
<rect x="270" y="50" width="70" height="40" class="fb sb"/><text x="305" y="75" text-anchor="middle" font-size="12">40</text>
<text x="305" y="40" text-anchor="middle" class="tm" font-size="11">1024</text><text x="305" y="110" text-anchor="middle" class="tm" font-size="11">i=3</text>
<rect x="340" y="50" width="70" height="40" class="fg sg"/><text x="375" y="75" text-anchor="middle" font-size="12">310</text>
<text x="375" y="40" text-anchor="middle" class="tm" font-size="11">1032</text><text x="375" y="110" text-anchor="middle" class="tm" font-size="11">i=4</text>
<rect x="410" y="50" width="70" height="40" class="fb sb"/><text x="445" y="75" text-anchor="middle" font-size="12">80</text>
<text x="445" y="40" text-anchor="middle" class="tm" font-size="11">1040</text><text x="445" y="110" text-anchor="middle" class="tm" font-size="11">i=5</text>
<rect x="480" y="50" width="70" height="40" class="fb sb"/><text x="515" y="75" text-anchor="middle" font-size="12">60</text>
<text x="515" y="40" text-anchor="middle" class="tm" font-size="11">1048</text><text x="515" y="110" text-anchor="middle" class="tm" font-size="11">i=6</text>
<rect x="550" y="50" width="70" height="40" class="fb sb"/><text x="585" y="75" text-anchor="middle" font-size="12">200</text>
<text x="585" y="40" text-anchor="middle" class="tm" font-size="11">1056</text><text x="585" y="110" text-anchor="middle" class="tm" font-size="11">i=7</text>
<text x="30" y="40" text-anchor="middle" class="tm" font-size="11">addr</text><text x="30" y="75" text-anchor="middle" font-size="11">₹</text>
<text x="320" y="150" text-anchor="middle" class="tg" font-size="12">address of charges[4] = 1000 + 4 × 8 = 1032 → one multiply, one jump: O(1)</text>
</svg><figcaption>Biteful's 8 charges stored in one block. Each slot is 8 bytes wide, so slot i starts at 1000 + i × 8. No searching, just arithmetic.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Array</strong>: a contiguous block of same-size slots. <strong>Random access</strong>: reading or writing any index in O(1), because <code>address = start + index × slot_size</code>. This is the one thing arrays do better than anything else.</p>
  </div>
  <p>The price of "side by side" shows up when you change the middle. To insert a new charge at index 0, every item must shift one place right; to remove index 0, everyone shifts left. That is O(n). Adding or removing at the <em>end</em> moves nobody: O(1).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A row of people on a cinema bench with no gaps. Someone new wants the first seat: all of them must shuffle one seat right. Someone new sitting at the far end disturbs nobody.</p>
  </div>
  <h3>How a Python list grows</h3>
  <p>A raw array has a fixed size, yet a Python list grows when you <code>append</code>. It is a <strong>dynamic array</strong>: it reserves spare slots, and when they run out it grabs a bigger block, copies everything across and drops the old block. Here is a tiny version that doubles, fed with the day's charges plus one late ₹90 order, counting every copy:</p>
<div class="fx" data-lang="py">class DynamicArray:
    def __init__(self):
        self.cap = 1                     # room we have reserved
        self.n = 0                       # items actually stored
        self.slots = [None] * self.cap
        self.copies = 0                  # count work, to see the cost

    def append(self, x):
        if self.n == self.cap:           # full: get a block twice as big
            self._resize(2 * self.cap)
        self.slots[self.n] = x
        self.n += 1

    def _resize(self, new_cap):
        new = [None] * new_cap
        for i in range(self.n):          # copy every old item across
            new[i] = self.slots[i]
            self.copies += 1
        self.slots, self.cap = new, new_cap

    def __getitem__(self, i):            # O(1): jump straight to slot i
        if not 0 &lt;= i &lt; self.n:
            raise IndexError(i)
        return self.slots[i]

a = DynamicArray()
for charge in [120, 80, 250, 40, 310, 80, 60, 200, 90]:
    a.append(charge)
    print(f"append {charge:3}: n={a.n} cap={a.cap:2} copies so far={a.copies}")
print("a[4] =", a[4])</div>
  <div class="fx" data-lang="text">append 120: n=1 cap= 1 copies so far=0
append  80: n=2 cap= 2 copies so far=1
append 250: n=3 cap= 4 copies so far=3
append  40: n=4 cap= 4 copies so far=3
append 310: n=5 cap= 8 copies so far=7
append  80: n=6 cap= 8 copies so far=7
append  60: n=7 cap= 8 copies so far=7
append 200: n=8 cap= 8 copies so far=7
append  90: n=9 cap=16 copies so far=15
a[4] = 310</div>
  <p>9 appends caused 15 copies in total (1 + 2 + 4 + 8), always less than 2n. Spread across the appends that is under 2 copies each: <strong>O(1) amortised</strong> (the Complexity note traced the real CPython list with <code>sys.getsizeof</code>). Reading <code>a[4]</code> is still a single jump.</p>
  <h3>The cost table you should know by heart</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>Plain reason</th></tr>
    <tr><td><code>a[i]</code>, <code>a[i] = x</code>, <code>len(a)</code></td><td>O(1)</td><td>Address arithmetic; length is stored</td></tr>
    <tr><td><code>a.append(x)</code>, <code>a.pop()</code></td><td>O(1) amortised</td><td>Only the end changes</td></tr>
    <tr><td><code>a.insert(i, x)</code>, <code>a.pop(i)</code>, <code>del a[i]</code></td><td>O(n − i)</td><td>Everything after i shifts</td></tr>
    <tr><td><code>a.insert(0, x)</code>, <code>a.pop(0)</code></td><td>O(n)</td><td>Everyone shifts. Use <code>deque</code> for queues</td></tr>
    <tr><td><code>x in a</code>, <code>a.index(x)</code>, <code>a.remove(x)</code>, <code>a.count(x)</code></td><td>O(n)</td><td>Scan until found. Use a <code>set</code> for repeated lookups</td></tr>
    <tr><td><code>a[i:j]</code> slice</td><td>O(j − i)</td><td>Makes a new list (a copy)</td></tr>
    <tr><td><code>a + b</code>, <code>a.extend(b)</code></td><td>O(len a + len b) / O(len b)</td><td><code>+</code> builds a new list; extend appends in place</td></tr>
    <tr><td><code>min</code>, <code>max</code>, <code>sum</code>, <code>a.reverse()</code>, <code>a[::-1]</code></td><td>O(n)</td><td>Touch every item once</td></tr>
    <tr><td><code>a.sort()</code>, <code>sorted(a)</code></td><td>O(n log n)</td><td>Timsort; <code>sort</code> is in place, <code>sorted</code> returns a copy</td></tr>
  </table>
<div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
charges.append(90)          # O(1) amortised: a late order
charges.pop()               # O(1) from the end
charges.insert(0, 999)      # O(n): everything shifts right
first = charges.pop(0)      # O(n): everything shifts left
print(charges[4], len(charges), first, 310 in charges, charges[1:3], charges[::-1])</div>
  <div class="fx" data-lang="text">310 8 999 True [80, 250] [200, 60, 80, 310, 40, 250, 80, 120]</div>
  <h3>The basic pattern: one pass, scan &amp; build</h3>
  <p>Before any trick, most easy array problems are a single loop that keeps a few variables up to date and maybe builds an output list. One pass, O(n) time:</p>
<div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]

biggest = charges[0]
big_orders = []                      # build a new list in the same pass
for c in charges:                    # one pass: O(n) time
    if c &gt; biggest:
        biggest = c
    if c &gt;= 200:
        big_orders.append(c)
print("biggest:", biggest, "| orders of 200+:", big_orders, "| doubled for a report:", charges + charges)</div>
  <div class="fx" data-lang="text">biggest: 310 | orders of 200+: [250, 310, 200] | doubled for a report: [120, 80, 250, 40, 310, 80, 60, 200, 120, 80, 250, 40, 310, 80, 60, 200]</div>
  <div class="callout pred"><span class="label">Recognise it</span>
    <p>"Return a new array where…", "find the maximum / count of…", "concatenate", "shuffle", "running…". One loop, a variable or an output list. Practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>1929 Concatenation of Array</b>, <b>485 Max Consecutive Ones</b>, <b>1431 Kids With the Greatest Number of Candies</b>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A hidden O(n) inside a loop makes the whole thing O(n²): <code>if x in my_list</code>, <code>my_list.pop(0)</code>, <code>my_list.insert(0, x)</code>, or slicing <code>a[1:]</code> in recursion. Interviewers look for exactly these.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Arrays are fast at <strong>"go to position i"</strong> and at the <strong>end</strong>. They are slow at the <strong>front and middle</strong>, and slow at <strong>"is x in here?"</strong>. Most array tricks in this note are ways to stay in the fast zone: walk the array once, by index, never searching it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Brute Force.</b> We can reach any single charge instantly. But finance's questions are about pairs of charges ("which two make ₹280?"), and the only method we have for pairs is to try them all.</div>

  <h2 id="dsa-ar-brute"><span class="num">02</span>Brute Force: Check Every Pair</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful runs a combo coupon: two orders that together cost exactly ₹280 get a free dessert. Which two of the 8 charges qualify? Indexing gives us one charge at a time; we have no method for pairs yet except the obvious one.</p>
  </div>
  <p>The obvious method: take every order, pair it with every later order, and check the sum. It is always correct, so it is always the first thing to say in an interview. Then cost it.</p>
<div class="fx" data-lang="py">def pair_brute(charges, target):
    comparisons = 0
    n = len(charges)
    for i in range(n):                       # every first order ...
        for j in range(i + 1, n):            # ... with every later order
            comparisons += 1
            if charges[i] + charges[j] == target:
                return (i, j), comparisons
    return None, comparisons

charges = [120, 80, 250, 40, 310, 80, 60, 200]
print("combo 280:", pair_brute(charges, 280))
print("combo 999:", pair_brute(charges, 999), " &lt;- no answer: all 8*7/2 pairs checked")</div>
  <div class="fx" data-lang="text">combo 280: ((1, 7), 13)
combo 999: (None, 28)  &lt;- no answer: all 8*7/2 pairs checked</div>
  <table class="tbl out"><caption>The 13 checks before the combo was found (target 280)</caption>
    <tr><th>first order i</th><th>partners j tried</th><th>sums</th><th>checks</th></tr>
    <tr><td>0 (120)</td><td>1 … 7</td><td>200, 370, 160, 430, 200, 180, 320</td><td>7 (none)</td></tr>
    <tr><td>1 (80)</td><td>2 … 7</td><td>330, 120, 390, 160, 140, <b>280</b></td><td>6 → found (1, 7)</td></tr>
  </table>
  <p>Orders 1 (₹80) and 7 (₹200). When no pair works (target 999) all 8 × 7 / 2 = 28 pairs are checked: the worst case is <strong>n(n − 1)/2 → O(n²)</strong>. Watch what doubling n does on bigger days with no answer:</p>
<div class="fx" data-lang="py">import time, random
random.seed(5)
for n in [1_000, 2_000, 4_000]:
    data = [random.randrange(1, 10**6) * 2 for _ in range(n)]   # even numbers only ...
    t = time.perf_counter()
    found, comps = pair_brute(data, 1)                         # ... so no pair sums to 1: worst case
    print(f"n={n:&gt;5,}  comparisons={comps:&gt;10,}  time={time.perf_counter() - t:6.3f} s")</div>
  <div class="fx" data-lang="text">n=1,000  comparisons=   499,500  time= 0.034 s
n=2,000  comparisons= 1,999,000  time= 0.111 s
n=4,000  comparisons= 7,998,000  time= 0.478 s</div>
  <p>Double n, four times the checks, about four times the time. At n = 1 lakh that is 5 billion checks: minutes, not milliseconds. The constraint "n ≤ 10⁵" in a problem is the examiner saying "don't do this".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding two friends whose heights add up to exactly 3 metres by asking every possible pair to stand together and measuring. It works, but with a whole school you would still be measuring at night.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Brute force</strong> = try every candidate answer. For pairs that is two nested loops over i &lt; j, O(n²); for contiguous stretches (subarrays) it is every start × every end, O(n²), and O(n³) if each stretch is re-summed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Skipping the brute force in an interview. Saying it first (with its cost) proves you understand the problem, gives you a checker for your fast version, and shows the interviewer exactly what your optimisation removes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Two Pointers.</b> Each check here teaches us nothing about the other pairs. If the charges were sorted, could one check rule out a whole group of pairs at once?</div>

  <h2 id="dsa-ar-twoptr"><span class="num">03</span>Two Pointers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The brute force checks up to 28 pairs for 8 charges and 5 billion for 1 lakh, because every check is independent. We want each look to eliminate many pairs, so the search becomes one pass.</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>sorted</b> array", "pair / triplet that sums to", "closest sum", "<b>palindrome</b>", "reverse in place", "remove … <b>in place</b>", "without extra space", "merge two sorted arrays".</p>
  </div>
  <h3>Style 1: opposite ends</h3>
  <p>Sort the charges. Put <code>L</code> at the cheapest and <code>R</code> at the dearest. Look at their sum. If it is too big, the dearest one is useless (even with the cheapest partner it overshoots), so move R left. If it is too small, the cheapest one is useless (even with the dearest partner it falls short), so move L right. Stop when they meet.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You have exactly ₹280 and a menu sorted by price. Try cheapest + costliest: too much? Then the costliest item can never be part of your pair, because every other partner is even more expensive than the cheapest. Cross it off and try again. Every step crosses one item off forever.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 660 300" width="660">
<rect x="10" y="10" width="42" height="28" class="fb sb"/><text x="31" y="29" text-anchor="middle" font-size="12">40</text>
<rect x="54" y="10" width="42" height="28" class="fs" stroke="currentColor"/><text x="75" y="29" text-anchor="middle" font-size="12">60</text>
<rect x="98" y="10" width="42" height="28" class="fs" stroke="currentColor"/><text x="119" y="29" text-anchor="middle" font-size="12">80</text>
<rect x="142" y="10" width="42" height="28" class="fs" stroke="currentColor"/><text x="163" y="29" text-anchor="middle" font-size="12">80</text>
<rect x="186" y="10" width="42" height="28" class="fs" stroke="currentColor"/><text x="207" y="29" text-anchor="middle" font-size="12">120</text>
<rect x="230" y="10" width="42" height="28" class="fs" stroke="currentColor"/><text x="251" y="29" text-anchor="middle" font-size="12">200</text>
<rect x="274" y="10" width="42" height="28" class="fs" stroke="currentColor"/><text x="295" y="29" text-anchor="middle" font-size="12">250</text>
<rect x="318" y="10" width="42" height="28" class="fr sr"/><text x="339" y="29" text-anchor="middle" font-size="12">310</text>
<text x="31" y="54" text-anchor="middle" class="tb" font-size="11">L</text><text x="339" y="54" text-anchor="middle" class="tr" font-size="11">R</text>
<text x="370" y="29" font-size="12">step 1: 40 + 310 = 350 &gt; 280 → R moves left</text>
<rect x="10" y="68" width="42" height="28" class="fb sb"/><text x="31" y="87" text-anchor="middle" font-size="12">40</text>
<rect x="54" y="68" width="42" height="28" class="fs" stroke="currentColor"/><text x="75" y="87" text-anchor="middle" font-size="12">60</text>
<rect x="98" y="68" width="42" height="28" class="fs" stroke="currentColor"/><text x="119" y="87" text-anchor="middle" font-size="12">80</text>
<rect x="142" y="68" width="42" height="28" class="fs" stroke="currentColor"/><text x="163" y="87" text-anchor="middle" font-size="12">80</text>
<rect x="186" y="68" width="42" height="28" class="fs" stroke="currentColor"/><text x="207" y="87" text-anchor="middle" font-size="12">120</text>
<rect x="230" y="68" width="42" height="28" class="fs" stroke="currentColor"/><text x="251" y="87" text-anchor="middle" font-size="12">200</text>
<rect x="274" y="68" width="42" height="28" class="fr sr"/><text x="295" y="87" text-anchor="middle" font-size="12">250</text>
<rect x="318" y="68" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="339" y="87" text-anchor="middle" font-size="12">310</text>
<text x="31" y="112" text-anchor="middle" class="tb" font-size="11">L</text><text x="295" y="112" text-anchor="middle" class="tr" font-size="11">R</text>
<text x="370" y="87" font-size="12">step 2: 40 + 250 = 290 &gt; 280 → R moves left</text>
<rect x="10" y="126" width="42" height="28" class="fb sb"/><text x="31" y="145" text-anchor="middle" font-size="12">40</text>
<rect x="54" y="126" width="42" height="28" class="fs" stroke="currentColor"/><text x="75" y="145" text-anchor="middle" font-size="12">60</text>
<rect x="98" y="126" width="42" height="28" class="fs" stroke="currentColor"/><text x="119" y="145" text-anchor="middle" font-size="12">80</text>
<rect x="142" y="126" width="42" height="28" class="fs" stroke="currentColor"/><text x="163" y="145" text-anchor="middle" font-size="12">80</text>
<rect x="186" y="126" width="42" height="28" class="fs" stroke="currentColor"/><text x="207" y="145" text-anchor="middle" font-size="12">120</text>
<rect x="230" y="126" width="42" height="28" class="fr sr"/><text x="251" y="145" text-anchor="middle" font-size="12">200</text>
<rect x="274" y="126" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="295" y="145" text-anchor="middle" font-size="12">250</text>
<rect x="318" y="126" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="339" y="145" text-anchor="middle" font-size="12">310</text>
<text x="31" y="170" text-anchor="middle" class="tb" font-size="11">L</text><text x="251" y="170" text-anchor="middle" class="tr" font-size="11">R</text>
<text x="370" y="145" font-size="12">step 3: 40 + 200 = 240 &lt; 280 → L moves right</text>
<rect x="10" y="184" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="31" y="203" text-anchor="middle" font-size="12">40</text>
<rect x="54" y="184" width="42" height="28" class="fb sb"/><text x="75" y="203" text-anchor="middle" font-size="12">60</text>
<rect x="98" y="184" width="42" height="28" class="fs" stroke="currentColor"/><text x="119" y="203" text-anchor="middle" font-size="12">80</text>
<rect x="142" y="184" width="42" height="28" class="fs" stroke="currentColor"/><text x="163" y="203" text-anchor="middle" font-size="12">80</text>
<rect x="186" y="184" width="42" height="28" class="fs" stroke="currentColor"/><text x="207" y="203" text-anchor="middle" font-size="12">120</text>
<rect x="230" y="184" width="42" height="28" class="fr sr"/><text x="251" y="203" text-anchor="middle" font-size="12">200</text>
<rect x="274" y="184" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="295" y="203" text-anchor="middle" font-size="12">250</text>
<rect x="318" y="184" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="339" y="203" text-anchor="middle" font-size="12">310</text>
<text x="75" y="228" text-anchor="middle" class="tb" font-size="11">L</text><text x="251" y="228" text-anchor="middle" class="tr" font-size="11">R</text>
<text x="370" y="203" font-size="12">step 4: 60 + 200 = 260 &lt; 280 → L moves right</text>
<rect x="10" y="242" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="31" y="261" text-anchor="middle" font-size="12">40</text>
<rect x="54" y="242" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="75" y="261" text-anchor="middle" font-size="12">60</text>
<rect x="98" y="242" width="42" height="28" class="fg sg"/><text x="119" y="261" text-anchor="middle" font-size="12">80</text>
<rect x="142" y="242" width="42" height="28" class="fs" stroke="currentColor"/><text x="163" y="261" text-anchor="middle" font-size="12">80</text>
<rect x="186" y="242" width="42" height="28" class="fs" stroke="currentColor"/><text x="207" y="261" text-anchor="middle" font-size="12">120</text>
<rect x="230" y="242" width="42" height="28" class="fg sg"/><text x="251" y="261" text-anchor="middle" font-size="12">200</text>
<rect x="274" y="242" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="295" y="261" text-anchor="middle" font-size="12">250</text>
<rect x="318" y="242" width="42" height="28" class="fs" stroke-dasharray="3 3" stroke="currentColor" stroke-opacity="0.4"/><text x="339" y="261" text-anchor="middle" font-size="12">310</text>
<text x="119" y="286" text-anchor="middle" class="tb" font-size="11">L</text><text x="251" y="286" text-anchor="middle" class="tr" font-size="11">R</text>
<text x="370" y="261" font-size="12" class="tg">step 5: 80 + 200 = 280 → found</text>
</svg><figcaption>The sorted charges, combo target ₹280. Too big → R steps left (only a smaller partner can help). Too small → L steps right. Dashed boxes are ruled out for good. 5 steps instead of up to 28 pairs.</figcaption></figure>
<div class="fx" data-lang="py">def pair_two_pointers(a, target):            # a must be sorted
    l, r = 0, len(a) - 1
    step = 0
    while l &lt; r:
        step += 1
        s = a[l] + a[r]
        if s == target:
            print(f"step {step}: L={l} ({a[l]}) R={r} ({a[r]}) sum={s} -&gt; found")
            return l, r
        if s &lt; target:
            print(f"step {step}: L={l} ({a[l]}) R={r} ({a[r]}) sum={s} &lt; {target} -&gt; L moves right")
            l += 1                           # need bigger: the small end moves up
        else:
            print(f"step {step}: L={l} ({a[l]}) R={r} ({a[r]}) sum={s} &gt; {target} -&gt; R moves left")
            r -= 1                           # need smaller: the big end moves down
    return None

charges = [120, 80, 250, 40, 310, 80, 60, 200]
s = sorted(charges)
print("sorted:", s)
print(pair_two_pointers(s, 280))</div>
  <div class="fx" data-lang="text">sorted: [40, 60, 80, 80, 120, 200, 250, 310]
step 1: L=0 (40) R=7 (310) sum=350 &gt; 280 -&gt; R moves left
step 2: L=0 (40) R=6 (250) sum=290 &gt; 280 -&gt; R moves left
step 3: L=0 (40) R=5 (200) sum=240 &lt; 280 -&gt; L moves right
step 4: L=1 (60) R=5 (200) sum=260 &lt; 280 -&gt; L moves right
step 5: L=2 (80) R=5 (200) sum=280 -&gt; found
(2, 5)</div>
  <table class="tbl out"><caption>Trace: sorted charges [40, 60, 80, 80, 120, 200, 250, 310], target 280</caption>
    <tr><th>step</th><th>L (value)</th><th>R (value)</th><th>sum</th><th>decision</th><th>pairs ruled out</th></tr>
    <tr><td>1</td><td>0 (40)</td><td>7 (310)</td><td>350</td><td>too big → R − 1</td><td>310 with anyone</td></tr>
    <tr><td>2</td><td>0 (40)</td><td>6 (250)</td><td>290</td><td>too big → R − 1</td><td>250 with anyone left</td></tr>
    <tr><td>3</td><td>0 (40)</td><td>5 (200)</td><td>240</td><td>too small → L + 1</td><td>40 with anyone left</td></tr>
    <tr><td>4</td><td>1 (60)</td><td>5 (200)</td><td>260</td><td>too small → L + 1</td><td>60 with anyone left</td></tr>
    <tr><td>5</td><td>2 (80)</td><td>5 (200)</td><td>280</td><td>found</td><td>—</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Why is it safe to skip pairs? When <code>a[L] + a[R]</code> is too big, then <code>a[R]</code> plus <em>anything</em> between L and R is also too big (the list is sorted). So every pair with R is dead, and moving R discards them in one step. That "one step kills a whole row of pairs" argument is the proof you give in interviews.</p>
  </div>
  <p>How much does it save? A sorted day of 5,000 charges with no valid pair:</p>
<div class="fx" data-lang="py">import time, random
def pair_two_pointers(a, target):
    l, r = 0, len(a) - 1
    while l &lt; r:
        s = a[l] + a[r]
        if s == target: return l, r
        if s &lt; target: l += 1
        else: r -= 1
    return None

random.seed(5)
n = 5_000
data = sorted(random.randrange(1, 10**6) * 2 for _ in range(n))    # no pair sums to 1
t = time.perf_counter(); r1 = pair_brute(data, 1)[0]; t1 = time.perf_counter() - t
t = time.perf_counter(); r2 = pair_two_pointers(data, 1); t2 = time.perf_counter() - t
print(f"n={n:,}  brute force {t1:.3f} s   two pointers {t2*1000:.2f} ms   same answer: {r1 == r2}")</div>
  <div class="fx" data-lang="text">n=5,000  brute force 0.735 s   two pointers 0.45 ms   same answer: True</div>
  <p>Over a thousand times faster, and the gap grows with n because one is O(n²) and the other O(n). The same template with "move both inward and compare" checks a palindrome (Biteful's coupon codes):</p>
<div class="fx" data-lang="py">def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l &lt; r:
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    return True

for code in ["BITETIB", "ABBA", "BITE", "", "A"]:      # Biteful coupon codes
    print(repr(code), is_palindrome(code))</div>
  <div class="fx" data-lang="text">'BITETIB' True
'ABBA' True
'BITE' False
'' True
'A' True</div>
  <h3>Style 2: same direction (reader / writer)</h3>
  <p>Both pointers start at the left. <code>fast</code> reads every item. <code>slow</code> marks the next place to <em>write</em> a keeper. This filters or compacts a list <strong>in place</strong>, with O(1) extra space. Two uses on our data: list the distinct prices in the sorted charges, and push cancelled orders (stored as 0) to the end.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sorting mangoes into a crate. Your right hand (fast) picks up every mango. Your left hand (slow) points at the next empty spot in the crate. Good mango? Put it at the left hand's spot and move the left hand. Bad mango? Skip it.</p>
  </div>
<div class="fx" data-lang="py">def remove_duplicates(nums):           # nums is sorted
    if not nums:
        return 0
    slow = 1                           # next place to write a new value
    for fast in range(1, len(nums)):
        if nums[fast] != nums[fast - 1]:
            nums[slow] = nums[fast]
            slow += 1
    return slow                        # first slow items are the unique ones

def move_zeroes(nums):                 # 0 = a cancelled order
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    return nums

prices = [40, 60, 80, 80, 120, 200, 250, 310]       # the sorted charges
k = remove_duplicates(prices)
print(k, prices[:k])
print(move_zeroes([120, 0, 250, 40, 0, 80]))</div>
  <div class="fx" data-lang="text">7 [40, 60, 80, 120, 200, 250, 310]
[120, 250, 40, 80, 0, 0]</div>
  <p>The sorted charges have 7 distinct prices (the second 80 was skipped). The cancelled orders slid to the end while the others kept their order.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text"># opposite ends (input sorted)            # reader / writer (in place)
l, r = 0, len(a) - 1                      slow = 0
while l &lt; r:                              for fast in range(len(a)):
    s = a[l] + a[r]                           if keep(a[fast]):
    if s == target: return l, r                   a[slow] = a[fast]
    if s &lt; target: l += 1                         slow += 1
    else: r -= 1                          return slow        # a[:slow] are the keepers</div>
  <table class="tbl">
    <tr><th>Style</th><th>Start</th><th>Needs</th><th>Typical problems</th></tr>
    <tr><td>Opposite ends</td><td>L = 0, R = n − 1</td><td>Sorted input, or a symmetric check</td><td>Two Sum II, 3Sum, Container With Most Water, palindrome, reverse in place</td></tr>
    <tr><td>Same direction</td><td>slow = fast = 0 (or 1)</td><td>Nothing special</td><td>Remove duplicates, move zeroes, remove element</td></tr>
    <tr><td>Two sequences</td><td>i = 0 in a, j = 0 in b</td><td>Two arrays/strings walked together</td><td>Merge sorted arrays, is subsequence</td></tr>
    <tr><td>Fast &amp; slow by speed</td><td>both at head</td><td>Linked structure</td><td>Cycle detection, middle node (<a class="xref" data-note="dsa_linkedlist">Linked Lists</a>)</td></tr>
  </table>
  <div class="callout def"><span class="label">Complexity</span>
    <p>Each step moves at least one pointer and they never cross, so at most n steps: <strong>O(n) time, O(1) extra space</strong>. If you have to sort first, add O(n log n). Brute force was O(n²).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sorting destroys the original positions. On sorted data the combo was at sorted indexes (2, 5), not the original (1, 7). If the question wants original indexes (LeetCode 1 Two Sum), use the hash map version in <a class="xref" data-note="dsa_hashing">Hashing</a> instead.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Arrays: <b>167 Two Sum II</b> (exactly the trace above), <b>26 Remove Duplicates from Sorted Array</b> (reader/writer), <b>125 Valid Palindrome</b>. Then 283 Move Zeroes, 88 Merge Sorted Array, 11 Container With Most Water.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Sliding Window.</b> Two pointers finds pairs. Finance's next questions are about <em>runs of consecutive orders</em> ("the busiest 3 in a row", "the shortest run worth ₹500"), and the brute force for those re-adds the same orders again and again.</div>

  <h2 id="dsa-ar-window"><span class="num">04</span>Sliding Window</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A <strong>subarray</strong> is a contiguous piece of an array (no gaps). "Busiest 3 consecutive orders" means comparing the sums of every 3-long subarray. Re-adding each one from scratch repeats almost all the work, because neighbouring windows share all but one order. How do we reuse it?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>contiguous</b> subarray / substring", "<b>k consecutive</b>", "every window of size k", "<b>longest / shortest</b> … such that", "at most k distinct", "minimum length with sum ≥".</p>
  </div>
  <h3>Fixed size k</h3>
  <p>Window of k = 3 orders. Sum the first 3 once. Then slide one step at a time: add the order that joins on the right, subtract the order that leaves on the left. One addition and one subtraction per step, whatever k is.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper tracks sales over the last 3 days. Each new morning she doesn't re-add three days; she adds today's sales and subtracts the day that just dropped out of the 3-day range.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 660 262" width="660">
<rect x="10" y="8" width="44" height="28" class="fg"/><text x="32" y="27" text-anchor="middle" font-size="12">120</text>
<rect x="56" y="8" width="44" height="28" class="fg"/><text x="78" y="27" text-anchor="middle" font-size="12">80</text>
<rect x="102" y="8" width="44" height="28" class="fg"/><text x="124" y="27" text-anchor="middle" font-size="12">250</text>
<rect x="148" y="8" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="170" y="27" text-anchor="middle" font-size="12">40</text>
<rect x="194" y="8" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="216" y="27" text-anchor="middle" font-size="12">310</text>
<rect x="240" y="8" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="262" y="27" text-anchor="middle" font-size="12">80</text>
<rect x="286" y="8" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="308" y="27" text-anchor="middle" font-size="12">60</text>
<rect x="332" y="8" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="354" y="27" text-anchor="middle" font-size="12">200</text>
<rect x="10" y="8" width="136" height="28" class="sg" fill="none" stroke-width="2.5"/>
<text x="390" y="27" font-size="12">first window: 120 + 80 + 250 = 450</text>
<rect x="10" y="50" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="32" y="69" text-anchor="middle" font-size="12">120</text>
<rect x="56" y="50" width="44" height="28" class="fg"/><text x="78" y="69" text-anchor="middle" font-size="12">80</text>
<rect x="102" y="50" width="44" height="28" class="fg"/><text x="124" y="69" text-anchor="middle" font-size="12">250</text>
<rect x="148" y="50" width="44" height="28" class="fg"/><text x="170" y="69" text-anchor="middle" font-size="12">40</text>
<rect x="194" y="50" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="216" y="69" text-anchor="middle" font-size="12">310</text>
<rect x="240" y="50" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="262" y="69" text-anchor="middle" font-size="12">80</text>
<rect x="286" y="50" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="308" y="69" text-anchor="middle" font-size="12">60</text>
<rect x="332" y="50" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="354" y="69" text-anchor="middle" font-size="12">200</text>
<rect x="56" y="50" width="136" height="28" class="sg" fill="none" stroke-width="2.5"/>
<text x="390" y="69" font-size="12">450 − 120 + 40 = 370</text>
<rect x="10" y="92" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="32" y="111" text-anchor="middle" font-size="12">120</text>
<rect x="56" y="92" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="78" y="111" text-anchor="middle" font-size="12">80</text>
<rect x="102" y="92" width="44" height="28" class="fg"/><text x="124" y="111" text-anchor="middle" font-size="12">250</text>
<rect x="148" y="92" width="44" height="28" class="fg"/><text x="170" y="111" text-anchor="middle" font-size="12">40</text>
<rect x="194" y="92" width="44" height="28" class="fg"/><text x="216" y="111" text-anchor="middle" font-size="12">310</text>
<rect x="240" y="92" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="262" y="111" text-anchor="middle" font-size="12">80</text>
<rect x="286" y="92" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="308" y="111" text-anchor="middle" font-size="12">60</text>
<rect x="332" y="92" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="354" y="111" text-anchor="middle" font-size="12">200</text>
<rect x="102" y="92" width="136" height="28" class="sg" fill="none" stroke-width="2.5"/>
<text x="390" y="111" font-size="12" class="tg">370 − 80 + 310 = 600  ← busiest</text>
<rect x="10" y="134" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="32" y="153" text-anchor="middle" font-size="12">120</text>
<rect x="56" y="134" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="78" y="153" text-anchor="middle" font-size="12">80</text>
<rect x="102" y="134" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="124" y="153" text-anchor="middle" font-size="12">250</text>
<rect x="148" y="134" width="44" height="28" class="fg"/><text x="170" y="153" text-anchor="middle" font-size="12">40</text>
<rect x="194" y="134" width="44" height="28" class="fg"/><text x="216" y="153" text-anchor="middle" font-size="12">310</text>
<rect x="240" y="134" width="44" height="28" class="fg"/><text x="262" y="153" text-anchor="middle" font-size="12">80</text>
<rect x="286" y="134" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="308" y="153" text-anchor="middle" font-size="12">60</text>
<rect x="332" y="134" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="354" y="153" text-anchor="middle" font-size="12">200</text>
<rect x="148" y="134" width="136" height="28" class="sg" fill="none" stroke-width="2.5"/>
<text x="390" y="153" font-size="12">600 − 250 + 80 = 430</text>
<rect x="10" y="176" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="32" y="195" text-anchor="middle" font-size="12">120</text>
<rect x="56" y="176" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="78" y="195" text-anchor="middle" font-size="12">80</text>
<rect x="102" y="176" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="124" y="195" text-anchor="middle" font-size="12">250</text>
<rect x="148" y="176" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="170" y="195" text-anchor="middle" font-size="12">40</text>
<rect x="194" y="176" width="44" height="28" class="fg"/><text x="216" y="195" text-anchor="middle" font-size="12">310</text>
<rect x="240" y="176" width="44" height="28" class="fg"/><text x="262" y="195" text-anchor="middle" font-size="12">80</text>
<rect x="286" y="176" width="44" height="28" class="fg"/><text x="308" y="195" text-anchor="middle" font-size="12">60</text>
<rect x="332" y="176" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="354" y="195" text-anchor="middle" font-size="12">200</text>
<rect x="194" y="176" width="136" height="28" class="sg" fill="none" stroke-width="2.5"/>
<text x="390" y="195" font-size="12">430 − 40 + 60 = 450</text>
<rect x="10" y="218" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="32" y="237" text-anchor="middle" font-size="12">120</text>
<rect x="56" y="218" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="78" y="237" text-anchor="middle" font-size="12">80</text>
<rect x="102" y="218" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="124" y="237" text-anchor="middle" font-size="12">250</text>
<rect x="148" y="218" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="170" y="237" text-anchor="middle" font-size="12">40</text>
<rect x="194" y="218" width="44" height="28" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="216" y="237" text-anchor="middle" font-size="12">310</text>
<rect x="240" y="218" width="44" height="28" class="fg"/><text x="262" y="237" text-anchor="middle" font-size="12">80</text>
<rect x="286" y="218" width="44" height="28" class="fg"/><text x="308" y="237" text-anchor="middle" font-size="12">60</text>
<rect x="332" y="218" width="44" height="28" class="fg"/><text x="354" y="237" text-anchor="middle" font-size="12">200</text>
<rect x="240" y="218" width="136" height="28" class="sg" fill="none" stroke-width="2.5"/>
<text x="390" y="237" font-size="12">450 − 310 + 200 = 340</text>
</svg><figcaption>A window of 3 consecutive orders slides over the day. Each move is one subtraction (the order that leaves) and one addition (the order that joins), so the whole scan is O(n).</figcaption></figure>
<div class="fx" data-lang="py">def busiest_k(charges, k):
    window = sum(charges[:k])                       # first window, summed once
    best, best_start = window, 0
    print(f"window 0-{k-1}: {charges[:k]} sum={window}")
    for right in range(k, len(charges)):
        out = charges[right - k]
        window += charges[right] - out              # one in, one out
        print(f"window {right-k+1}-{right}: +{charges[right]} -{out} -&gt; sum={window}")
        if window &gt; best:
            best, best_start = window, right - k + 1
    return best, charges[best_start:best_start + k]

print(busiest_k([120, 80, 250, 40, 310, 80, 60, 200], 3))</div>
  <div class="fx" data-lang="text">window 0-2: [120, 80, 250] sum=450
window 1-3: +40 -120 -&gt; sum=370
window 2-4: +310 -80 -&gt; sum=600
window 3-5: +80 -250 -&gt; sum=430
window 4-6: +60 -40 -&gt; sum=450
window 5-7: +200 -310 -&gt; sum=340
(600, [250, 40, 310])</div>
  <table class="tbl out"><caption>Window table, k = 3</caption>
    <tr><th>window</th><th>orders</th><th>joins</th><th>leaves</th><th>sum</th><th>best so far</th></tr>
    <tr><td>0–2</td><td>120, 80, 250</td><td>—</td><td>—</td><td>450</td><td>450</td></tr>
    <tr><td>1–3</td><td>80, 250, 40</td><td>40</td><td>120</td><td>370</td><td>450</td></tr>
    <tr><td>2–4</td><td>250, 40, 310</td><td>310</td><td>80</td><td>600</td><td>600</td></tr>
    <tr><td>3–5</td><td>40, 310, 80</td><td>80</td><td>250</td><td>430</td><td>600</td></tr>
    <tr><td>4–6</td><td>310, 80, 60</td><td>60</td><td>40</td><td>450</td><td>600</td></tr>
    <tr><td>5–7</td><td>80, 60, 200</td><td>200</td><td>310</td><td>340</td><td>600</td></tr>
  </table>
  <p>Busiest stretch: orders 2–4 (250, 40, 310) = ₹600. Brute force would re-add 3 numbers per window; with k = 1,000 it would re-add 1,000. The window always does 2 operations per step.</p>
  <h3>Variable size: grow right, shrink left</h3>
  <p>Now the window size is the unknown. "What is the <em>shortest</em> run of consecutive orders worth at least ₹500?" Move <code>right</code> forward one order at a time to grow the window. Whenever the total is ≥ 500 the window is valid: record its length, then drop the leftmost order to see if a shorter one still works.</p>
  <div class="flow"><span>right += 1 (take one more)</span><span>update the total</span><span>while window valid: record, drop left</span><span>answer = best recorded</span></div>
<div class="fx" data-lang="py">def shortest_at_least(charges, target):            # all charges are positive
    left, total, best = 0, 0, float("inf")
    for right, x in enumerate(charges):
        total += x                                  # grow: take one more on the right
        print(f"R={right} add {x:3} -&gt; window {charges[left:right+1]} total={total}")
        while total &gt;= target:                      # valid: record, then try to shrink
            best = min(best, right - left + 1)
            print(f"      total {total} &gt;= {target}: length {right-left+1}, best={best}; drop {charges[left]}")
            total -= charges[left]
            left += 1
    return 0 if best == float("inf") else best

print("answer:", shortest_at_least([120, 80, 250, 40, 310, 80, 60, 200], 500))</div>
  <div class="fx" data-lang="text">R=0 add 120 -&gt; window [120] total=120
R=1 add  80 -&gt; window [120, 80] total=200
R=2 add 250 -&gt; window [120, 80, 250] total=450
R=3 add  40 -&gt; window [120, 80, 250, 40] total=490
R=4 add 310 -&gt; window [120, 80, 250, 40, 310] total=800
      total 800 &gt;= 500: length 5, best=5; drop 120
      total 680 &gt;= 500: length 4, best=4; drop 80
      total 600 &gt;= 500: length 3, best=3; drop 250
R=5 add  80 -&gt; window [40, 310, 80] total=430
R=6 add  60 -&gt; window [40, 310, 80, 60] total=490
R=7 add 200 -&gt; window [40, 310, 80, 60, 200] total=690
      total 690 &gt;= 500: length 5, best=3; drop 40
      total 650 &gt;= 500: length 4, best=3; drop 310
answer: 3</div>
  <table class="tbl out"><caption>Window table: shortest run with total ≥ 500</caption>
    <tr><th>R</th><th>joins</th><th>window after growing</th><th>total</th><th>shrinking (while ≥ 500)</th><th>best</th></tr>
    <tr><td>0</td><td>120</td><td>[120]</td><td>120</td><td>—</td><td>∞</td></tr>
    <tr><td>1</td><td>80</td><td>[120, 80]</td><td>200</td><td>—</td><td>∞</td></tr>
    <tr><td>2</td><td>250</td><td>[120, 80, 250]</td><td>450</td><td>—</td><td>∞</td></tr>
    <tr><td>3</td><td>40</td><td>[120, 80, 250, 40]</td><td>490</td><td>—</td><td>∞</td></tr>
    <tr><td>4</td><td>310</td><td>[120, 80, 250, 40, 310]</td><td>800</td><td>len 5 ✓ drop 120 → 680; len 4 ✓ drop 80 → 600; len 3 ✓ drop 250 → 350</td><td>3</td></tr>
    <tr><td>5</td><td>80</td><td>[40, 310, 80]</td><td>430</td><td>—</td><td>3</td></tr>
    <tr><td>6</td><td>60</td><td>[40, 310, 80, 60]</td><td>490</td><td>—</td><td>3</td></tr>
    <tr><td>7</td><td>200</td><td>[40, 310, 80, 60, 200]</td><td>690</td><td>len 5 drop 40 → 650; len 4 drop 310 → 340</td><td>3</td></tr>
  </table>
  <p>Answer 3 (orders 2–4 again). There is a <code>while</code> inside a <code>for</code>, yet this is O(n), not O(n²): <code>left</code> only moves forward and never passes <code>right</code>, so across the whole run it moves at most n times. Each order joins once and leaves once: about 2n steps.</p>
  <p>The mirror question, "the <em>longest</em> run worth at most ₹500", uses the other template: grow, shrink while the window is <em>broken</em> (over 500), then record.</p>
<div class="fx" data-lang="py">def longest_at_most(charges, limit):               # longest run of orders with total &lt;= limit
    left, total, best = 0, 0, 0
    for right, x in enumerate(charges):
        total += x                                  # grow
        while total &gt; limit:                        # broken: shrink until valid again
            total -= charges[left]
            left += 1
        best = max(best, right - left + 1)          # record AFTER fixing
    return best

print(longest_at_most([120, 80, 250, 40, 310, 80, 60, 200], 500))</div>
  <div class="fx" data-lang="text">4</div>
  <p>4 orders (120, 80, 250, 40 = 490, or 40, 310, 80, 60 = 490).</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">left = 0; state = empty                     # sum, Counter, set ... of the window
for right, x in enumerate(a):
    add x to state                          # grow
    while window is BROKEN:                 # LONGEST: shrink until valid, record after
        remove a[left] from state; left += 1
    best = max(best, right - left + 1)
#   SHORTEST: while window is VALID: best = min(best, right-left+1); remove a[left]; left += 1</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p>Fixed or variable, each index enters the window once and leaves once: <strong>O(n) time</strong>, O(1) space for a sum (O(k) for a Counter/set of window contents). Brute force over all subarrays was O(n²), or O(n³) re-summing each.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sliding window needs <strong>monotonic</strong> behaviour: growing the window must only make the total bigger (the rule more broken). Our charges are all positive, so it works. With negative numbers (the profit list in section 06), adding an order can lower the total and shrinking can throw away an answer. For "subarray sum equals k" with negatives, use prefix sum + hash map (<a class="xref" data-note="dsa_hashing">Hashing</a>).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Arrays: <b>643 Maximum Average Subarray I</b> (fixed k, this exact pass), <b>209 Minimum Size Subarray Sum</b> (the shortest-run trace above), <b>3 Longest Substring Without Repeating Characters</b> (longest template on a string, solved in section 10). Then 1004 Max Consecutive Ones III, 567 Permutation in String.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Prefix Sums.</b> A window answers one question per pass. Finance now fires many: "orders 2 to 4?", "orders 0 to 3?", "the whole day?" Each one would need a fresh loop that re-adds the same charges.</div>

  <h2 id="dsa-ar-prefix"><span class="num">05</span>Prefix Sums</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The window slides in one direction for one question. When questions about arbitrary ranges i..j arrive in any order (thousands of them), summing each range costs O(n) per question. Can we pay O(n) once and answer every range in O(1)?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>sum of range</b> i..j", "many queries", "running sum", "pivot / balance index" (left sum = right sum), "product of all except self" (the × version), "number of subarrays with sum k" (with a hash map).</p>
  </div>
  <p>Store running totals once: <code>P[i]</code> = total of the first <code>i</code> charges, with <code>P[0] = 0</code>. Then the total of charges i..j (both included) is "total up to j" minus "total before i": <strong>P[j + 1] − P[i]</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A car's odometer shows total km since the car was new. How far between Pune and Mumbai? Reading at Mumbai minus reading at Pune. You never re-add the trip kilometre by kilometre.</p>
  </div>
  <table class="tbl out"><caption>Building P by hand: each entry = previous entry + one charge</caption>
    <tr><th>i</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
    <tr><td>charges[i]</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td><td>–</td></tr>
    <tr><td>P[i]</td><td>0</td><td>120</td><td>200</td><td>450</td><td>490</td><td>800</td><td>880</td><td>940</td><td>1140</td></tr>
  </table>
  <p>Range sum by hand: orders 2..4 = P[5] − P[2] = 800 − 200 = <b>600</b> (the busiest window from section 04: 250 + 40 + 310). Orders 0..3 (lunch) = P[4] − P[0] = 490. Whole day = P[8] − P[0] = 1140.</p>
<div class="fx" data-lang="py">from itertools import accumulate
charges = [120, 80, 250, 40, 310, 80, 60, 200]
P = [0]
for x in charges:
    P.append(P[-1] + x)                 # P[i] = total of the first i charges
print("P =", P)

def range_sum(i, j):                    # charges i..j, both included
    return P[j + 1] - P[i]

print("orders 2..4:", range_sum(2, 4), "| orders 0..3:", range_sum(0, 3), "| whole day:", range_sum(0, 7))
print(list(accumulate(charges, initial=0)) == P)</div>
  <div class="fx" data-lang="text">P = [0, 120, 200, 450, 490, 800, 880, 940, 1140]
orders 2..4: 600 | orders 0..3: 490 | whole day: 1140
True</div>
  <p>Now the reason it exists: many queries. 1,000 random range questions on a day of 1 lakh charges:</p>
<div class="fx" data-lang="py">import time, random
random.seed(2)
n = 100_000
charges = [random.randrange(40, 400) for _ in range(n)]
queries = [sorted(random.sample(range(n), 2)) for _ in range(1_000)]

t = time.perf_counter()
naive = [sum(charges[i:j + 1]) for i, j in queries]       # re-add every range: O(n) each
t_naive = time.perf_counter() - t

t = time.perf_counter()
P = [0]
for x in charges:
    P.append(P[-1] + x)                                    # O(n) once
fast = [P[j + 1] - P[i] for i, j in queries]               # O(1) each
t_fast = time.perf_counter() - t
print(f"1,000 range sums on 1 lakh charges: re-adding {t_naive*1000:.0f} ms, prefix sums {t_fast*1000:.1f} ms, same: {naive == fast}")</div>
  <div class="fx" data-lang="text">1,000 range sums on 1 lakh charges: re-adding 828 ms, prefix sums 9.2 ms, same: True</div>
  <p>Same answers, roughly 90× faster, and the gap grows with the number of queries (re-adding is O(n) each, prefix lookup is O(1) each after one O(n) build).</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">P = [0]
for x in a: P.append(P[-1] + x)            # O(n) once;  or: list(accumulate(a, initial=0))
range_sum(i, j) = P[j + 1] - P[i]          # O(1) per query, i..j inclusive</div>
  <div class="cards">
    <div><b>Leading 0</b><p>Makes ranges that start at index 0 work without a special case.</p><small>P has n + 1 entries</small></div>
    <div><b>2-D version</b><p><code>P[r+1][c+1] = grid[r][c] + P[r][c+1] + P[r+1][c] − P[r][c]</code> gives any rectangle sum in O(1).</p><small>Inclusion–exclusion (LeetCode 304)</small></div>
    <div><b>Difference array</b><p>The reverse trick: to add v to a whole range, do <code>D[i] += v; D[j+1] −= v</code>, then one prefix pass.</p><small>LeetCode 1109, 1854</small></div>
    <div><b>+ hash map</b><p>"How many subarrays sum to k?" Count earlier prefix values equal to <code>P − k</code>. Works with negatives.</p><small><a class="xref" data-note="dsa_hashing">Hashing</a>, Subarray Sum Equals K</small></div>
  </div>
  <div class="callout def"><span class="label">Complexity</span>
    <p><strong>O(n) time and O(n) space to build, O(1) per range query.</strong> For q queries: O(n + q) instead of O(n·q).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Off-by-one. With the leading 0, the range i..j is <code>P[j+1] − P[i]</code>, not <code>P[j] − P[i]</code> (that would drop order j). Check on a 1-item range: orders 4..4 = P[5] − P[4] = 800 − 490 = 310 ✓.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Arrays: <b>1480 Running Sum of 1d Array</b> (build P), <b>303 Range Sum Query - Immutable</b> (exactly range_sum), <b>724 Find Pivot Index</b> (left total = right total). Then 238 Product of Array Except Self (section 10), 1109 Corporate Flight Bookings.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Kadane.</b> Prefix sums give the total of any range we name. But "which range is best?" with gains <em>and losses</em> would still mean trying all n²/2 ranges, and the window can't help because losses (negatives) break it.</div>

  <h2 id="dsa-ar-kadane"><span class="num">06</span>Kadane's Algorithm</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful pays the rider ₹120 per order, so the profit per order is charge − 120, which can be negative. Which stretch of consecutive orders made the most profit? Prefix sums can total any stretch, but there are 36 stretches for 8 orders and 5 billion for 1 lakh; the window can't help because negatives break it.</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>maximum (sum) subarray</b>", "largest sum of contiguous…", "best time to buy and sell" (max gain), "maximum circular subarray", values that can be <b>negative</b>.</p>
  </div>
  <p>Kadane's idea in plain words: walk left to right, keeping <code>cur</code>, the best total of a stretch that <strong>ends right here</strong>. At each new order x there are only two choices: join the stretch you already have (<code>cur + x</code>), or start fresh at x. If the old stretch is negative it only drags x down, so drop it. Remember the best <code>cur</code> ever seen.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket batting partnership tracked over by over. If the partnership has gone "negative" (it cost more than it scored), the captain would rather start counting fresh from the next over. The best partnership ever seen is remembered separately.</p>
  </div>
<div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
profit = [c - 120 for c in charges]          # Biteful pays the rider 120 per order
print("profit:", profit)

def best_run(nums):
    best = cur = nums[0]
    start = best_l = best_r = 0
    print(f"i=0 x={nums[0]:4}  cur={cur:4}  best={best:4}")
    for i in range(1, len(nums)):
        x = nums[i]
        if cur + x &lt; x:                      # the run so far only drags x down
            cur, start, why = x, i, "start fresh"
        else:
            cur, why = cur + x, "extend"
        if cur &gt; best:
            best, best_l, best_r = cur, start, i
        print(f"i={i} x={x:4}  cur={cur:4}  best={best:4}  ({why})")
    return best, (best_l, best_r)

print(best_run(profit))</div>
  <div class="fx" data-lang="text">profit: [0, -40, 130, -80, 190, -40, -60, 80]
i=0 x=   0  cur=   0  best=   0
i=1 x= -40  cur= -40  best=   0  (extend)
i=2 x= 130  cur= 130  best= 130  (start fresh)
i=3 x= -80  cur=  50  best= 130  (extend)
i=4 x= 190  cur= 240  best= 240  (extend)
i=5 x= -40  cur= 200  best= 240  (extend)
i=6 x= -60  cur= 140  best= 240  (extend)
i=7 x=  80  cur= 220  best= 240  (extend)
(240, (2, 4))</div>
  <table class="tbl out"><caption>Kadane trace on profit = charge − 120</caption>
    <tr><th>i</th><th>charge</th><th>profit x</th><th>cur + x</th><th>choice</th><th>cur</th><th>best</th></tr>
    <tr><td>0</td><td>120</td><td>0</td><td>—</td><td>start</td><td>0</td><td>0</td></tr>
    <tr><td>1</td><td>80</td><td>−40</td><td>−40</td><td>extend (tie)</td><td>−40</td><td>0</td></tr>
    <tr><td>2</td><td>250</td><td>130</td><td>90</td><td><b>start fresh</b> (130 &gt; 90)</td><td>130</td><td>130</td></tr>
    <tr><td>3</td><td>40</td><td>−80</td><td>50</td><td>extend</td><td>50</td><td>130</td></tr>
    <tr><td>4</td><td>310</td><td>190</td><td>240</td><td>extend</td><td>240</td><td><b>240</b></td></tr>
    <tr><td>5</td><td>80</td><td>−40</td><td>200</td><td>extend</td><td>200</td><td>240</td></tr>
    <tr><td>6</td><td>60</td><td>−60</td><td>140</td><td>extend</td><td>140</td><td>240</td></tr>
    <tr><td>7</td><td>200</td><td>80</td><td>220</td><td>extend</td><td>220</td><td>240</td></tr>
  </table>
  <p>The most profitable stretch is orders 2..4 (130 − 80 + 190 = ₹240). Two moments to notice: at i = 2 the old stretch was −40, so starting fresh won; at i = 3 the stretch dipped to 50 but stayed positive, so it was worth keeping, and the next order (+190) paid that off. A brute force over all 36 stretches confirms the answer:</p>
<div class="fx" data-lang="py">profit = [0, -40, 130, -80, 190, -40, -60, 80]
best = max(sum(profit[i:j + 1]) for i in range(len(profit)) for j in range(i, len(profit)))
print("brute force over all", len(profit) * (len(profit) + 1) // 2, "runs:", best)

def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)     # extend the old run, or start fresh at x
        best = max(best, cur)
    return best
print(max_subarray(profit), max_subarray([-3, -1, -2]), max_subarray([5]))</div>
  <div class="fx" data-lang="text">brute force over all 36 runs: 240
240 -1 5</div>
  <h3>Template</h3>
<div class="fx" data-lang="text">best = cur = a[0]
for x in a[1:]:
    cur = max(x, cur + x)       # best stretch ENDING here: extend, or start fresh
    best = max(best, cur)       # best stretch anywhere so far</div>
  <div class="callout def"><span class="label">Definition &amp; complexity</span>
    <p><strong>Kadane's algorithm</strong> is a tiny dynamic programme: <code>cur[i] = max(a[i], cur[i−1] + a[i])</code>, answer = max over all <code>cur[i]</code>. Only the previous value is needed, so it keeps one variable instead of a table: <strong>O(n) time, O(1) space</strong> (brute force O(n²) with running sums). The <a class="xref" data-note="dsa_dp">Dynamic Programming</a> note grows this idea into tables.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Starting with <code>best = cur = 0</code> breaks on all-negative input: <code>[-3, -1, -2]</code> would return 0 (the empty stretch) instead of −1. Start from <code>a[0]</code> unless the problem says an empty subarray is allowed.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Arrays: <b>53 Maximum Subarray</b> (this exact template), <b>121 Best Time to Buy and Sell Stock</b> (best gain = Kadane on day-to-day changes, or "min so far"), <b>918 Maximum Sum Circular Subarray</b>. Then 152 Maximum Product Subarray.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Strings as Arrays.</b> Every technique so far worked on a list of numbers. But the gateway does not send a list; it sends one line of text, "120,80,250,…". Do arrays tricks work on text, and what is different about it?</div>

  <h2 id="dsa-ar-strings"><span class="num">07</span>Strings as Arrays</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Real data often arrives as text: the charges as a comma-separated line, coupon codes, customer names. We know how to index, scan and slide over a list. What carries over to a string, and what breaks?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"string", "substring", "characters", "parse", "words", "reverse words", "common prefix", "palindrome", "anagram". Most string problems are an array technique (two pointers, window, counting) on characters.</p>
  </div>
  <p>A string is an array of characters, so <code>s[i]</code> and <code>len(s)</code> are O(1), slicing copies, and two pointers and windows work unchanged (the palindrome check in section 03 was on strings). One big difference: in Python a string is <strong>immutable</strong>. Once made, it never changes; every "change" builds a brand-new string.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A printed wedding card. To fix one spelling mistake you cannot erase a letter; you must print a whole new card. A Python list is a whiteboard: wipe one cell, write a new value.</p>
  </div>
<div class="fx" data-lang="py">line = "120,80,250,40,310,80,60,200"         # how the charges arrive from the gateway
charges = [int(part) for part in line.split(",")]
print(charges, len(line), line[0], line[-3:])

try:
    line[0] = "9"
except TypeError as e:
    print("TypeError:", e)

parts = []
for c in charges:
    parts.append(f"Rs{c}")                   # build pieces in a list ...
receipt = " + ".join(parts)                  # ... then join once
print(receipt, "=", sum(charges))

code = list("BITE")                          # a mutable copy of the characters
code[0] = "K"
print("".join(code), "biteful"[::-1], ord("A"), chr(66), "  late order  ".strip().split())</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200] 27 1 200
TypeError: 'str' object does not support item assignment
Rs120 + Rs80 + Rs250 + Rs40 + Rs310 + Rs80 + Rs60 + Rs200 = 1140
KITE lufetib 65 B ['late', 'order']</div>
  <p>Parsing turned the 27-character line back into our 8 numbers; assignment into a string fails; the receipt was built from pieces in a list and joined once; <code>list("BITE")</code> made an editable copy.</p>
  <h3>join vs +=</h3>
  <p>Building a long string with <code>+=</code> in a loop: each step may copy everything built so far. Lengths 1, 2, 3, … n add up to about n²/2 character copies: O(n²) in the worst case. Collecting pieces in a list and calling <code>"".join(parts)</code> once measures the total length, allocates once and copies each character once: O(n). (The Complexity note measured one extra reference making <code>+=</code> about 25× slower.)</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">parts = []
for piece in data:
    parts.append(transform(piece))      # build in a mutable list
result = sep.join(parts)                # one O(total length) copy
chars = list(s); chars[i] = "x"; s2 = "".join(chars)    # "edit" a string</div>
  <div class="callout def"><span class="label">Definition &amp; complexity</span>
    <p>A <strong>string</strong> is an immutable array of characters. Indexing O(1); slicing, <code>split</code>, <code>join</code>, <code>in</code> (substring search), <code>replace</code>, <code>[::-1]</code> are O(n). Any edit = a new string, O(n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"But my += loop runs fast." CPython sometimes grows the string in place when nobody else references it. It is an implementation detail, not a promise (PyPy and many real cases don't do it). In an interview always say: <strong>build a list, join once</strong>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Arrays: <b>58 Length of Last Word</b> (scan from the end), <b>14 Longest Common Prefix</b> (column-by-column scan), <b>151 Reverse Words in a String</b> (split, reverse, join). Then 1108 Defanging an IP Address, 557 Reverse Words III.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: 2-D Matrices.</b> Lists and strings are one row. Biteful's operations team lays the charges out as a table: one row per shift, one column per order slot. How do we walk data with two indexes?</div>

  <h2 id="dsa-ar-matrix"><span class="num">08</span>2-D Matrices</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>All our data so far had one index. A grid has two: row and column. Totals per row, per column, walking around the edge, rotating, finding neighbours: none of this follows from a single loop over one list.</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"matrix", "grid", "m × n", "rows and columns", "diagonal", "<b>spiral</b> order", "<b>rotate</b> the image", "transpose", "set matrix zeroes", "neighbours / adjacent cells".</p>
  </div>
  <p>A matrix in Python is a list of rows: <code>grid[r][c]</code> is row r, column c. Rows = <code>len(grid)</code>, columns = <code>len(grid[0])</code>. Think of a cinema seat chart: row letter, then seat number. The same 8 charges as 2 shifts × 4 order slots:</p>
  <table class="tbl out"><caption>grid (rows = shifts, columns = order slots)</caption>
    <tr><th></th><th>c = 0</th><th>c = 1</th><th>c = 2</th><th>c = 3</th><th>row total</th></tr>
    <tr><td>r = 0 lunch</td><td>120</td><td>80</td><td>250</td><td>40</td><td>490</td></tr>
    <tr><td>r = 1 dinner</td><td>310</td><td>80</td><td>60</td><td>200</td><td>650</td></tr>
    <tr><td>column total</td><td>430</td><td>160</td><td>310</td><td>240</td><td>1140</td></tr>
  </table>
<div class="fx" data-lang="py">grid = [[120, 80, 250, 40],      # lunch shift
        [310, 80, 60, 200]]      # dinner shift
R, C = len(grid), len(grid[0])
print("rows x cols:", R, "x", C, "| grid[1][2] =", grid[1][2])

row_totals = [sum(row) for row in grid]                            # row by row
col_totals = [sum(grid[r][c] for r in range(R)) for c in range(C)]  # column by column
print("row totals:", row_totals, "| column totals:", col_totals)

order = []
for r in range(R):               # row-major: left to right, top to bottom
    for c in range(C):
        order.append(grid[r][c])
print("row-major:", order)
print("column-major:", [grid[r][c] for c in range(C) for r in range(R)])
print("transpose:", [list(t) for t in zip(*grid)])

def neighbours(r, c):
    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        nr, nc = r + dr, c + dc
        if 0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C:          # stay inside the grid
            yield grid[nr][nc]
print("neighbours of grid[0][1]:", list(neighbours(0, 1)))</div>
  <div class="fx" data-lang="text">rows x cols: 2 x 4 | grid[1][2] = 60
row totals: [490, 650] | column totals: [430, 160, 310, 240]
row-major: [120, 80, 250, 40, 310, 80, 60, 200]
column-major: [120, 310, 80, 80, 250, 60, 40, 200]
transpose: [[120, 310], [80, 80], [250, 60], [40, 200]]
neighbours of grid[0][1]: [80, 250, 120]</div>
  <p>Row-major order (row by row) gives back the day in its original order; column-major interleaves the shifts; the transpose turns 2 × 4 into 4 × 2. Neighbours of <code>grid[0][1]</code> (the lunch ₹80): below 80, right 250, left 120; "up" is outside the grid and is skipped by the bounds check.</p>
  <div class="cards">
    <div><b>Neighbours</b><p>Loop over <code>(1,0), (-1,0), (0,1), (0,-1)</code> and check <code>0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C</code>.</p><small>Add 4 diagonals for 8-way; grids become graphs later</small></div>
    <div><b>Transpose</b><p><code>[list(r) for r in zip(*grid)]</code> swaps rows and columns.</p><small>Works for non-square too</small></div>
    <div><b>Diagonals</b><p>Same <code>r − c</code> → same ↘ diagonal. Same <code>r + c</code> → same ↙ diagonal.</p><small>N-Queens, diagonal traversal</small></div>
  </div>
  <h3>Spiral order</h3>
  <p>Read the grid like peeling an onion: across the top, down the right, back along the bottom, up the left, then the next ring inside. Keep four walls: <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>. After reading a side, move that wall inward. On our grid: top row 120, 80, 250, 40 → right column 200 → bottom row backwards 60, 80, 310 → nothing left.</p>
<div class="fx" data-lang="py">def spiral_order(matrix):
    res = []
    if not matrix:
        return res
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top &lt;= bottom and left &lt;= right:
        for j in range(left, right + 1):          # → along the top row
            res.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1):          # ↓ down the right column
            res.append(matrix[i][right])
        right -= 1
        if top &lt;= bottom:
            for j in range(right, left - 1, -1):  # ← along the bottom row
                res.append(matrix[bottom][j])
            bottom -= 1
        if left &lt;= right:
            for i in range(bottom, top - 1, -1):  # ↑ up the left column
                res.append(matrix[i][left])
            left += 1
    return res

grid = [[120, 80, 250, 40], [310, 80, 60, 200]]
print(grid, "-&gt;", spiral_order(grid))
for mat in [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1], [2], [3]], [[7]], []]:
    print(mat, "-&gt;", spiral_order(mat))</div>
  <div class="fx" data-lang="text">[[120, 80, 250, 40], [310, 80, 60, 200]] -&gt; [120, 80, 250, 40, 200, 60, 80, 310]
[[1, 2, 3], [4, 5, 6], [7, 8, 9]] -&gt; [1, 2, 3, 6, 9, 8, 7, 4, 5]
[[1], [2], [3]] -&gt; [1, 2, 3]
[[7]] -&gt; [7]
[] -&gt; []</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The two <code>if</code> checks before the bottom and left sides are not optional. For a single remaining row (or column), the top pass already read it; without the check, the bottom pass reads it again backwards and you get duplicates. Always test a 1×n and an n×1 grid.</p>
  </div>
  <h3>Rotate 90° clockwise, in place</h3>
  <p>Rotation needs a square grid, so here is the classic 3 × 3. The first row becomes the last column. Doing that directly needs careful 4-way swaps. A simpler route: two easy steps that are each just swaps. First <strong>transpose</strong> (flip across the main diagonal, <code>a[i][j] ↔ a[j][i]</code>), then <strong>reverse each row</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 600 185" width="600"><rect x="30" y="40" width="36" height="36" class="fv sb"/><text x="48" y="63" text-anchor="middle">1</text><rect x="66" y="40" width="36" height="36" class="fb sb"/><text x="84" y="63" text-anchor="middle">2</text><rect x="102" y="40" width="36" height="36" class="fb sb"/><text x="120" y="63" text-anchor="middle">3</text><rect x="30" y="76" width="36" height="36" class="fb sb"/><text x="48" y="99" text-anchor="middle">4</text><rect x="66" y="76" width="36" height="36" class="fv sb"/><text x="84" y="99" text-anchor="middle">5</text><rect x="102" y="76" width="36" height="36" class="fb sb"/><text x="120" y="99" text-anchor="middle">6</text><rect x="30" y="112" width="36" height="36" class="fb sb"/><text x="48" y="135" text-anchor="middle">7</text><rect x="66" y="112" width="36" height="36" class="fb sb"/><text x="84" y="135" text-anchor="middle">8</text><rect x="102" y="112" width="36" height="36" class="fv sb"/><text x="120" y="135" text-anchor="middle">9</text><rect x="245" y="40" width="36" height="36" class="fv sb"/><text x="263" y="63" text-anchor="middle">1</text><rect x="281" y="40" width="36" height="36" class="fb sb"/><text x="299" y="63" text-anchor="middle">4</text><rect x="317" y="40" width="36" height="36" class="fb sb"/><text x="335" y="63" text-anchor="middle">7</text><rect x="245" y="76" width="36" height="36" class="fb sb"/><text x="263" y="99" text-anchor="middle">2</text><rect x="281" y="76" width="36" height="36" class="fv sb"/><text x="299" y="99" text-anchor="middle">5</text><rect x="317" y="76" width="36" height="36" class="fb sb"/><text x="335" y="99" text-anchor="middle">8</text><rect x="245" y="112" width="36" height="36" class="fb sb"/><text x="263" y="135" text-anchor="middle">3</text><rect x="281" y="112" width="36" height="36" class="fb sb"/><text x="299" y="135" text-anchor="middle">6</text><rect x="317" y="112" width="36" height="36" class="fv sb"/><text x="335" y="135" text-anchor="middle">9</text><rect x="460" y="40" width="36" height="36" class="fg sg"/><text x="478" y="63" text-anchor="middle">7</text><rect x="496" y="40" width="36" height="36" class="fb sb"/><text x="514" y="63" text-anchor="middle">4</text><rect x="532" y="40" width="36" height="36" class="fb sb"/><text x="550" y="63" text-anchor="middle">1</text><rect x="460" y="76" width="36" height="36" class="fg sg"/><text x="478" y="99" text-anchor="middle">8</text><rect x="496" y="76" width="36" height="36" class="fb sb"/><text x="514" y="99" text-anchor="middle">5</text><rect x="532" y="76" width="36" height="36" class="fb sb"/><text x="550" y="99" text-anchor="middle">2</text><rect x="460" y="112" width="36" height="36" class="fg sg"/><text x="478" y="135" text-anchor="middle">9</text><rect x="496" y="112" width="36" height="36" class="fb sb"/><text x="514" y="135" text-anchor="middle">6</text><rect x="532" y="112" width="36" height="36" class="fb sb"/><text x="550" y="135" text-anchor="middle">3</text><text x="84" y="25" text-anchor="middle">original</text><text x="299" y="25" text-anchor="middle">1. transpose</text><text x="514" y="25" text-anchor="middle">2. reverse rows</text><text x="190" y="100" text-anchor="middle">→</text><text x="405" y="100" text-anchor="middle">→</text><text x="84" y="170" text-anchor="middle" class="tm">diagonal stays</text><text x="299" y="170" text-anchor="middle" class="tm">a[i][j] ↔ a[j][i]</text><text x="514" y="170" text-anchor="middle" class="tg">turned 90° clockwise</text></svg><figcaption>Rotate = transpose + reverse each row. The violet cells on the diagonal never move during the transpose. For anticlockwise, transpose, then reverse the order of the rows.</figcaption></figure>
<div class="fx" data-lang="py">grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print([list(r) for r in zip(*grid)], [list(r) for r in zip(*grid[::-1])])   # transpose, rotate clockwise</div>
  <div class="fx" data-lang="text">[[1, 4, 7], [2, 5, 8], [3, 6, 9]] [[7, 4, 1], [8, 5, 2], [9, 6, 3]]</div>
  <p>Those one-liners build new lists (O(n²) extra space); the in-place version is classic problem 8 in section 10.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">R, C = len(grid), len(grid[0])
for r in range(R):                         # row-major traversal, O(R*C)
    for c in range(C):
        for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):
            nr, nc = r + dr, c + dc
            if 0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C:
                ...                        # visit neighbour grid[nr][nc]</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p>Any full traversal touches each cell once: <strong>O(R·C) time</strong>, which is optimal. Transpose/rotate in place: O(1) extra space; building a new grid: O(R·C).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shared rows</span>
    <p><code>[[0] * 4] * 2</code> does not make two rows. It makes one row and a list holding two references to it. Change one, both change. Always build a grid with a comprehension.</p>
  </div>
<div class="fx" data-lang="py">grid_bad = [[0] * 4] * 2      # 2 references to the SAME row
grid_bad[0][0] = 120
grid_ok = [[0] * 4 for _ in range(2)]
grid_ok[0][0] = 120
print(grid_bad, grid_ok)</div>
  <div class="fx" data-lang="text">[[120, 0, 0, 0], [120, 0, 0, 0]] [[120, 0, 0, 0], [0, 0, 0, 0]]</div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Arrays: <b>867 Transpose Matrix</b>, <b>54 Spiral Matrix</b> (the four walls above), <b>48 Rotate Image</b> (section 10). Then 1572 Matrix Diagonal Sum, 73 Set Matrix Zeroes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing the Technique.</b> We now have six tools. Facing a new problem statement, which one applies? We need a way to go from the words in the question to the tool.</div>

  <h2 id="dsa-ar-patterns"><span class="num">09</span>Choosing the Technique</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section taught one technique on a question that was built for it. A real problem doesn't say "use a sliding window". How do we recognise which technique a new problem needs before writing code?</p>
  </div>
  <p>Before coding, match the wording of the question to a technique. These signal words cover most array and string questions. Read the constraints too (the Complexity note): n ≤ 10⁵ means the answer is one of the O(n) / O(n log n) rows.</p>
  <table class="tbl">
    <tr><th>Signal words</th><th>Technique</th><th>Cost</th><th>On Biteful's charges</th></tr>
    <tr><td>"sorted array", "pair / triplet that sums to", "closest sum"</td><td>Two pointers, opposite ends (sort first for 3Sum)</td><td>O(n) per pass; O(n²) for 3Sum</td><td>combo 280 → (80, 200) in 5 steps</td></tr>
    <tr><td>"in place", "remove", "move zeroes", "without extra space"</td><td>Two pointers, reader / writer</td><td>O(n), O(1) space</td><td>7 distinct prices; cancelled orders to the end</td></tr>
    <tr><td>"palindrome", "reverse"</td><td>Two pointers from both ends</td><td>O(n)</td><td>"BITETIB" ✓</td></tr>
    <tr><td>"k consecutive", "every window of size k"</td><td>Fixed sliding window</td><td>O(n)</td><td>busiest 3 = 600</td></tr>
    <tr><td>"longest / shortest substring / subarray such that…", "at most k distinct"</td><td>Variable sliding window (+ dict/Counter)</td><td>O(n)</td><td>shortest ≥ 500 = 3; longest ≤ 500 = 4</td></tr>
    <tr><td>"sum of range i..j" many times, "pivot index"</td><td>Prefix sums</td><td>O(n) setup, O(1) per query</td><td>orders 2..4 = 800 − 200 = 600</td></tr>
    <tr><td>"subarray sum equals k" (negatives allowed)</td><td>Prefix sums + hash map (<a class="xref" data-note="dsa_hashing">Hashing</a>)</td><td>O(n)</td><td>—</td></tr>
    <tr><td>"maximum (sum) subarray", "best time to buy and sell"</td><td>Kadane</td><td>O(n)</td><td>best profit stretch = 240</td></tr>
    <tr><td>"product of all others", "without division"</td><td>Prefix and suffix products</td><td>O(n)</td><td>—</td></tr>
    <tr><td>"rotate matrix", "spiral", "set matrix zeroes"</td><td>Index arithmetic, walls, transpose</td><td>O(R·C)</td><td>spiral 120, 80, 250, 40, 200, 60, 80, 310</td></tr>
    <tr><td>"have we seen x?", "count occurrences", "anagram", unsorted pair with original indexes</td><td>Hash map / set (<a class="xref" data-note="dsa_hashing">Hashing</a>)</td><td>O(n)</td><td>80 seen twice</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every technique here has the same goal: <strong>don't redo work</strong>. Two pointers rules out many pairs per step. A window reuses the previous window. A prefix sum reuses earlier totals. Kadane reuses the best stretch ending one step back. When you see an O(n²) loop, ask "what am I recomputing?"</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Matching on one word. "Subarray" alone does not mean sliding window: with negative numbers it means prefix sums + hash map or Kadane. Check the extra conditions (sorted? all positive? need original indexes?) before committing.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> Recognising the pattern is half the job. The other half is the details each famous problem adds: duplicates in 3Sum, the "abba" jump in a window, the shorter wall in Container With Most Water.</div>

  <h2 id="dsa-ar-problems"><span class="num">10</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have traced each technique on the charges. Interview problems combine a technique with one extra twist (skip duplicates, jump a pointer, keep a counter of needs). We haven't yet seen those twists or how to test for them.</p>
  </div>
  <p>Eight standard problems, each with its LeetCode example, the brute force, the better idea, tested code and its cost. All are in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</p>
  <h3>1. Two Sum II (input sorted)</h3>
  <p><code>numbers = [2, 7, 11, 15]</code>, target 9 → <code>[1, 2]</code> (1-based positions). Brute force: all pairs, O(n²). Sorted input is the signal for opposite-end pointers (section 03).</p>
<div class="fx" data-lang="py">def two_sum_sorted(numbers, target):
    l, r = 0, len(numbers) - 1
    while l &lt; r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]          # problem wants 1-based indices
        if s &lt; target:
            l += 1                         # need bigger: move the small end up
        else:
            r -= 1                         # need smaller: move the big end down
    return []

for nums, t in [([2, 7, 11, 15], 9), ([2, 3, 4], 6), ([-1, 0], -1), ([1, 2, 3], 10)]:
    print(nums, t, "-&gt;", two_sum_sorted(nums, t))</div>
  <div class="fx" data-lang="text">[2, 7, 11, 15] 9 -&gt; [1, 2]
[2, 3, 4] 6 -&gt; [1, 3]
[-1, 0] -1 -&gt; [1, 2]
[1, 2, 3] 10 -&gt; []</div>
  <p>Time O(n), space O(1). If the input is <em>not</em> sorted, use the hash map version (<a class="xref" data-note="dsa_hashing">Hashing</a>) for O(n); sorting first would lose the original indexes.</p>

  <h3>2. Container With Most Water</h3>
  <p>Walls of heights <code>[1, 8, 6, 2, 5, 4, 8, 3, 7]</code>. Pick two walls; water held = <code>min(height) × distance</code>. Find the max (49). Brute force: every pair, O(n²).</p>
  <p>Start with the widest pair (both ends). Which end to move? The water is limited by the <strong>shorter</strong> wall. Moving the taller wall inward can only shrink the width while the height stays capped by the same short wall, so it can never help. Moving the shorter one is the only move with a chance.</p>
<div class="fx" data-lang="py">def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l &lt; r:
        h = min(height[l], height[r])
        best = max(best, h * (r - l))
        if height[l] &lt; height[r]:
            l += 1                         # the shorter wall limits us: drop it
        else:
            r -= 1
    return best

for h in [[1, 8, 6, 2, 5, 4, 8, 3, 7], [1, 1], [4, 3, 2, 1, 4], [1, 2, 1]]:
    print(h, "-&gt;", max_area(h))</div>
  <div class="fx" data-lang="text">[1, 8, 6, 2, 5, 4, 8, 3, 7] -&gt; 49
[1, 1] -&gt; 1
[4, 3, 2, 1, 4] -&gt; 16
[1, 2, 1] -&gt; 2</div>
  <p>49 comes from walls 8 (index 1) and 7 (index 8): min 7 × width 7. Time O(n), space O(1). The input is not sorted here; the pointer rule comes from the "shorter wall limits" argument instead.</p>

  <h3>3. 3Sum</h3>
  <p>Find all unique triplets that sum to 0. <code>[-1, 0, 1, 2, -1, -4]</code> → <code>[[-1, -1, 2], [-1, 0, 1]]</code>. Brute force is O(n³) plus messy de-duplication.</p>
  <p>Sort first. Fix the first number <code>nums[i]</code>; now you need two numbers to the right that sum to <code>-nums[i]</code>. That is Two Sum II on a sorted piece. Skip equal neighbours to avoid repeated triplets.</p>
<div class="fx" data-lang="py">def three_sum(nums):
    nums.sort()
    res = []
    n = len(nums)
    for i in range(n - 2):
        if i &gt; 0 and nums[i] == nums[i - 1]:
            continue                       # same first number again: skip
        if nums[i] &gt; 0:
            break                          # smallest is positive: no zero sum left
        l, r = i + 1, n - 1
        while l &lt; r:
            s = nums[i] + nums[l] + nums[r]
            if s &lt; 0:
                l += 1
            elif s &gt; 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l &lt; r and nums[l] == nums[l - 1]:
                    l += 1                 # skip repeated second numbers
    return res

for nums in [[-1, 0, 1, 2, -1, -4], [0, 1, 1], [0, 0, 0, 0], [-2, 0, 0, 2, 2]]:
    print(nums, "-&gt;", three_sum(nums[:]))</div>
  <div class="fx" data-lang="text">[-1, 0, 1, 2, -1, -4] -&gt; [[-1, -1, 2], [-1, 0, 1]]
[0, 1, 1] -&gt; []
[0, 0, 0, 0] -&gt; [[0, 0, 0]]
[-2, 0, 0, 2, 2] -&gt; [[-2, 0, 2]]</div>
  <p>Time O(n²): n choices for i, each with an O(n) two-pointer scan. The sort is O(n log n), which is smaller. Space O(1) extra besides the output (the sort is in place). The <code>[0, 0, 0, 0]</code> case checks both skip rules.</p>

  <h3>4. Longest Substring Without Repeating Characters</h3>
  <p><code>"abcabcbb"</code> → 3 (<code>"abc"</code>). Variable window, "longest" template: grow right; if the new character is already inside the window, move left just past its earlier copy. A dict remembers the last index of each character, so left can jump in one step.</p>
  <table class="tbl out"><caption>Dry run on "abcabcbb"</caption>
    <tr><th>right</th><th>ch</th><th>seen inside window?</th><th>left</th><th>window</th><th>best</th></tr>
    <tr><td>0</td><td>a</td><td>no</td><td>0</td><td>a</td><td>1</td></tr>
    <tr><td>1</td><td>b</td><td>no</td><td>0</td><td>ab</td><td>2</td></tr>
    <tr><td>2</td><td>c</td><td>no</td><td>0</td><td>abc</td><td>3</td></tr>
    <tr><td>3</td><td>a</td><td>yes at 0</td><td>1</td><td>bca</td><td>3</td></tr>
    <tr><td>4</td><td>b</td><td>yes at 1</td><td>2</td><td>cab</td><td>3</td></tr>
    <tr><td>5</td><td>c</td><td>yes at 2</td><td>3</td><td>abc</td><td>3</td></tr>
    <tr><td>6</td><td>b</td><td>yes at 4</td><td>5</td><td>cb</td><td>3</td></tr>
    <tr><td>7</td><td>b</td><td>yes at 6</td><td>7</td><td>b</td><td>3</td></tr>
  </table>
<div class="fx" data-lang="py">def length_of_longest_substring(s):
    last = {}                              # char -&gt; last index seen
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] &gt;= left:
            left = last[ch] + 1            # jump past the earlier copy
        last[ch] = right
        best = max(best, right - left + 1)
    return best

for s in ["abcabcbb", "bbbbb", "pwwkew", "", "abba", " "]:
    print(repr(s), "-&gt;", length_of_longest_substring(s))</div>
  <div class="fx" data-lang="text">'abcabcbb' -&gt; 3
'bbbbb' -&gt; 1
'pwwkew' -&gt; 3
'' -&gt; 0
'abba' -&gt; 2
' ' -&gt; 1</div>
  <p>Time O(n), space O(k) for k distinct characters. The <code>last[ch] &gt;= left</code> check matters: in <code>"abba"</code>, when the final <code>a</code> arrives, its old copy at index 0 is already outside the window (left = 2). Without the check, left would jump <em>backwards</em> to 1 and the answer would be 3, which is wrong.</p>

  <h3>5. Minimum Window Substring</h3>
  <p>Smallest piece of <code>s = "ADOBECODEBANC"</code> that contains every character of <code>t = "ABC"</code> (with counts) → <code>"BANC"</code>. Variable window, "shortest" template: grow right until the window covers t, then shrink left while it still covers t.</p>
  <p>To check "covers t" in O(1), keep <code>need</code> (a Counter of what t still requires, which can go negative for extras) and <code>missing</code> (how many characters of t are still not in the window).</p>
<div class="fx" data-lang="py">from collections import Counter

def min_window(s, t):
    if not t or not s:
        return ""
    need = Counter(t)                      # what we still owe, per char
    missing = len(t)                       # total chars still owed
    left = 0
    best = (0, float("inf"))               # (start, end) of best window
    for right, ch in enumerate(s):
        if need[ch] &gt; 0:
            missing -= 1                   # this char paid off a debt
        need[ch] -= 1
        if missing == 0:                   # window covers t: shrink it
            while need[s[left]] &lt; 0:       # left char is extra: drop it
                need[s[left]] += 1
                left += 1
            if right - left &lt; best[1] - best[0]:
                best = (left, right)
            need[s[left]] += 1             # give up one needed char
            missing += 1
            left += 1
    start, end = best
    return "" if end == float("inf") else s[start:end + 1]

for s, t in [("ADOBECODEBANC", "ABC"), ("a", "a"), ("a", "aa"), ("aa", "aa"), ("ab", "b")]:
    print(repr(s), repr(t), "-&gt;", repr(min_window(s, t)))</div>
  <div class="fx" data-lang="text">'ADOBECODEBANC' 'ABC' -&gt; 'BANC'
'a' 'a' -&gt; 'a'
'a' 'aa' -&gt; ''
'aa' 'aa' -&gt; 'aa'
'ab' 'b' -&gt; 'b'</div>
  <p>After recording a window, the code deliberately gives up one needed character (moves left past it) so the search continues for a later, shorter window. Time O(|s| + |t|), space O(alphabet). This is the hardest standard window problem; if you can explain <code>need</code> and <code>missing</code>, you can do any of them.</p>

  <h3>6. Maximum Subarray (with the actual subarray)</h3>
  <p>Kadane from section 06, extended to remember <em>where</em> the best run starts and ends: a common follow-up question.</p>
<div class="fx" data-lang="py">def max_subarray_with_range(nums):
    best = cur = nums[0]
    start = best_l = best_r = 0
    for i in range(1, len(nums)):
        if cur + nums[i] &lt; nums[i]:        # old run hurts: restart here
            cur = nums[i]
            start = i
        else:
            cur += nums[i]
        if cur &gt; best:
            best, best_l, best_r = cur, start, i
    return best, nums[best_l:best_r + 1]

for nums in [[-2, 1, -3, 4, -1, 2, 1, -5, 4], [1], [5, 4, -1, 7, 8], [-3, -1, -2]]:
    print(nums, "-&gt;", max_subarray_with_range(nums))</div>
  <div class="fx" data-lang="text">[-2, 1, -3, 4, -1, 2, 1, -5, 4] -&gt; (6, [4, -1, 2, 1])
[1] -&gt; (1, [1])
[5, 4, -1, 7, 8] -&gt; (23, [5, 4, -1, 7, 8])
[-3, -1, -2] -&gt; (-1, [-1])</div>
  <p>O(n) time, O(1) extra space. Note <code>[5, 4, -1, 7, 8]</code>: the −1 does not cause a restart because 9 − 1 = 8 is still better than −1 alone. Kadane drops a run only when its total is negative.</p>

  <h3>7. Product of Array Except Self</h3>
  <p><code>[1, 2, 3, 4]</code> → <code>[24, 12, 8, 6]</code>: each slot gets the product of all the <em>other</em> numbers. No division allowed (and division breaks on zeros anyway). Brute force: for each i multiply the rest, O(n²).</p>
  <p>Product of everything except i = (product of everything left of i) × (product of everything right of i). Two passes: a left-to-right pass writes the left products, a right-to-left pass multiplies in the right products. Same idea as prefix sums (section 05), with × instead of +.</p>
  <table class="tbl out"><caption>nums = [1, 2, 3, 4]</caption>
    <tr><th>i</th><th>0</th><th>1</th><th>2</th><th>3</th></tr>
    <tr><td>left product</td><td>1</td><td>1</td><td>2</td><td>6</td></tr>
    <tr><td>right product</td><td>24</td><td>12</td><td>4</td><td>1</td></tr>
    <tr><td>answer = left × right</td><td>24</td><td>12</td><td>8</td><td>6</td></tr>
  </table>
<div class="fx" data-lang="py">def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):                     # out[i] = product of everything left of i
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):         # times product of everything right of i
        out[i] *= right
        right *= nums[i]
    return out

for nums in [[1, 2, 3, 4], [-1, 1, 0, -3, 3], [0, 0], [2, 3]]:
    print(nums, "-&gt;", product_except_self(nums))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4] -&gt; [24, 12, 8, 6]
[-1, 1, 0, -3, 3] -&gt; [0, 0, 9, 0, 0]
[0, 0] -&gt; [0, 0]
[2, 3] -&gt; [3, 2]</div>
  <p>Time O(n). Extra space O(1) besides the output, because the "left" array is written straight into <code>out</code> and the right side is a single running variable.</p>

  <h3>8. Rotate Image</h3>
  <p>Rotate an n×n matrix 90° clockwise <strong>in place</strong>. Building a new matrix with <code>zip(*m[::-1])</code> is easy but uses O(n²) extra space, which the problem forbids. Use transpose + reverse rows from section 08.</p>
<div class="fx" data-lang="py">def rotate(matrix):
    n = len(matrix)
    for i in range(n):                     # 1. transpose: swap across the diagonal
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:                     # 2. reverse every row
        row.reverse()

m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
rotate(m)
print(m)
m1 = [[1]]; rotate(m1); print(m1)</div>
  <div class="fx" data-lang="text">[[7, 4, 1], [8, 5, 2], [9, 6, 3]]
[[1]]</div>
  <p>Time O(n²) (every cell is touched a constant number of times, which is the best possible), extra space O(1). The inner loop starts at <code>j = i + 1</code>: starting at 0 would swap every pair twice and undo the transpose.</p>
  <p>All eight solutions were checked against brute-force versions on hundreds of random inputs, including empty, single-item, all-equal and all-negative cases.</p>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Correct ideas still fail on small slips: a shared row, an off-by-one in a window, a hidden O(n) call. Let us collect them in one place.</div>

  <h2 id="dsa-ar-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section mentioned one trap. Before an interview you want them all in one checklist, so you can scan your own code for them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shared rows</span>
    <p><code>[[0] * m] * n</code> creates n references to one row. Use <code>[[0] * m for _ in range(n)]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hidden O(n) operations</span>
    <p><code>x in list</code>, <code>list.pop(0)</code>, <code>list.insert(0, x)</code>, <code>list.remove(x)</code>, slicing and <code>+</code> on lists all cost O(n). Inside a loop they quietly make your solution O(n²). Use a set for membership and a <code>deque</code> for the front.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: building strings with +=</span>
    <p>O(n²) in the worst case. Append pieces to a list and <code>"".join</code> once.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: off-by-one in windows and ranges</span>
    <p>Window length is <code>right - left + 1</code>. Range sum i..j is <code>P[j+1] - P[i]</code>. <code>range(a, b)</code> excludes b. Test with arrays of size 0, 1 and 2 before saying "done".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sliding window with negatives</span>
    <p>The "shrink while too big" logic assumes adding items only increases the sum. With negative numbers that is false; use prefix sums + a hash map, or Kadane for "best".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: two pointers on unsorted data</span>
    <p>Opposite-end pointers rely on sorted order to rule out pairs. On unsorted charges they silently miss answers. Sort first (and lose the original indexes) or use a hash map.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Kadane starting at 0</span>
    <p><code>best = cur = 0</code> returns 0 for all-negative input. Start from <code>a[0]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: modifying a list while looping over it</span>
    <p><code>for x in nums: nums.remove(x)</code> skips items, because the indexes shift under the loop. Build a new list, use the reader/writer pointers, or loop backwards by index.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have the techniques, the problems and the traps. Last, one picture of how each technique was built from the weakness of the one before.</div>

  <h2 id="dsa-ar-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Array, brute force, two pointers, sliding window, prefix sums, Kadane, strings and matrices: how is each built from the one before, and which question does each answer on the same 8 charges?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-ar-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">array</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">a[i] in O(1), one pass O(n)</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-ar-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fr sr"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">brute force</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">all pairs/ranges: O(n²)</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-ar-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fg sg"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">two pointers</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">sorted: 1 step kills a row of pairs</text>
<line x1="330" y1="54" x2="330" y2="86" stroke="currentColor" marker-end="url(#dsa-ar-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="fg sg"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">sliding window</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">reuse the last window (positives)</text>
<line x1="420" y1="110" x2="458" y2="110" stroke="currentColor" marker-end="url(#dsa-ar-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="fg sg"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">prefix sums</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">reuse earlier totals: any range O(1)</text>
<line x1="555" y1="132" x2="555" y2="164" stroke="currentColor" marker-end="url(#dsa-ar-a9)"/>
<rect x="460" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="555" y="185" text-anchor="middle" font-size="11.5" font-weight="700">Kadane</text><text x="555" y="201" text-anchor="middle" class="tm" font-size="10">reuse best run ending here (negatives)</text>
<line x1="330" y1="132" x2="200" y2="164" stroke="currentColor" marker-end="url(#dsa-ar-a9)"/>
<rect x="10" y="166" width="190" height="44" rx="7" class="ft st"/><text x="105" y="185" text-anchor="middle" font-size="11.5" font-weight="700">strings</text><text x="105" y="201" text-anchor="middle" class="tm" font-size="10">same tricks on characters, immutable</text>
<line x1="105" y1="210" x2="105" y2="242" stroke="currentColor" marker-end="url(#dsa-ar-a9)"/>
<rect x="10" y="244" width="190" height="44" rx="7" class="ft st"/><text x="105" y="263" text-anchor="middle" font-size="11.5" font-weight="700">2-D matrices</text><text x="105" y="279" text-anchor="middle" class="tm" font-size="10">two indexes, O(R·C) walks</text>
<line x1="555" y1="210" x2="420" y2="250" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-ar-a9)"/>
<rect x="240" y="232" width="180" height="56" rx="7" class="fv"/><text x="330" y="252" text-anchor="middle" font-size="11.5" font-weight="700">→ Hashing</text><text x="330" y="268" text-anchor="middle" class="tm" font-size="10">unsorted pairs, sum = k with negatives</text><text x="330" y="282" text-anchor="middle" class="tm" font-size="10">prefix sums + hash map</text>
</svg><figcaption>The array gives O(1) access; the brute force shows what is too slow; each green box removes one kind of repeated work. Strings and grids reuse the same ideas on new shapes. The dashed arrow is the hand-off: prefix sums meet the hash map in the next note.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's charges [120, 80, 250, 40, 310, 80, 60, 200]</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Array</td><td>contiguous slots</td><td>reach any charge fast?</td><td>charges[4] = 310 at 1000 + 4×8</td><td>always the starting point</td></tr>
    <tr><td>Brute force</td><td>nested loops over the array</td><td>which pair makes 280?</td><td>(1, 7) after 13 of 28 checks</td><td>first answer, and as a checker</td></tr>
    <tr><td>Two pointers</td><td>sorted array + "too big / too small" rule</td><td>pair sum without all pairs?</td><td>80 + 200 in 5 steps</td><td>sorted pairs, palindromes, in-place filters</td></tr>
    <tr><td>Sliding window</td><td>two pointers on a contiguous range</td><td>best run of consecutive orders?</td><td>busiest 3 = 600; shortest ≥ 500 = 3</td><td>contiguous, positive values</td></tr>
    <tr><td>Prefix sums</td><td>running totals of the array</td><td>total of any range, many times?</td><td>P[5] − P[2] = 600</td><td>many range queries; with hash map: sum = k</td></tr>
    <tr><td>Kadane</td><td>running best stretch (tiny DP)</td><td>most profitable stretch with losses?</td><td>profit best = 240 (orders 2..4)</td><td>max subarray, negatives allowed</td></tr>
    <tr><td>Strings</td><td>array of characters, immutable</td><td>same tricks on text?</td><td>"120,80,…" → 8 ints; join the receipt</td><td>parsing, building, palindromes</td></tr>
    <tr><td>2-D matrix</td><td>list of row arrays</td><td>walk data with two indexes?</td><td>rows 490, 650; cols 430, 160, 310, 240</td><td>grids, images, tables</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>the brute force recomputes; every technique keeps one small piece of state (two indexes, a window total, a prefix array, a running best) so each charge is handled once.</strong> When the state you need is "which values have I seen?", an index is not enough, and that is the Hashing note.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_hashing">Hashing</a>: the ₹280 combo on <em>unsorted</em> charges with original positions, and "how many stretches of profit sum to exactly k" with negatives, both in one O(n) pass.</div>

  <h2 id="dsa-ar-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b>; sorted <b>[40, 60, 80, 80, 120, 200, 250, 310]</b>; profit (charge − 120) <b>[0, −40, 130, −80, 190, −40, −60, 80]</b>; grid lunch [120, 80, 250, 40] / dinner [310, 80, 60, 200].</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Array</td><td>reach any charge fast?</td><td>charges[4] = 310, O(1)</td><td>questions are about pairs/stretches</td></tr>
    <tr><td>Brute force</td><td>which two make 280?</td><td>(1, 7) = 80 + 200 after 13 checks; worst 28</td><td>O(n²)</td></tr>
    <tr><td>Two pointers</td><td>pairs without all pairs?</td><td>sorted: 5 steps → 80 + 200</td><td>pairs only; needs sorted</td></tr>
    <tr><td>Sliding window</td><td>best run of k / shortest run ≥ X?</td><td>600 (250, 40, 310); shortest ≥ 500 = 3</td><td>one question per pass; positives only</td></tr>
    <tr><td>Prefix sums</td><td>any range total, many times?</td><td>P = [0, 120, 200, 450, 490, 800, 880, 940, 1140]</td><td>can't pick the best range with losses</td></tr>
    <tr><td>Kadane</td><td>best stretch with negatives?</td><td>240 (orders 2..4)</td><td>data arrives as text</td></tr>
    <tr><td>Strings</td><td>same tricks on text?</td><td>parse "120,80,…"; join receipt</td><td>two-index data</td></tr>
    <tr><td>Matrices</td><td>walk a grid?</td><td>rows 490/650; spiral 120 80 250 40 200 60 80 310</td><td>→ Hashing for "seen?"</td></tr>
  </table>
  <h3>Templates and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Address</td><td>start + i × size</td><td>i = index, size = slot bytes (8)</td></tr>
    <tr><td>All pairs</td><td>n(n − 1)/2</td><td>8 → 28 checks</td></tr>
    <tr><td>Two pointers</td><td>sum &lt; T → L += 1; sum &gt; T → R −= 1</td><td>L, R = indexes into the <em>sorted</em> array; T = target</td></tr>
    <tr><td>Fixed window</td><td>W ← W + a[r] − a[r − k]</td><td>W = window total, k = width, r = new right end</td></tr>
    <tr><td>Variable window</td><td>grow r; while (valid / broken) shrink l</td><td>length = r − l + 1</td></tr>
    <tr><td>Prefix sum</td><td>P[0] = 0, P[i+1] = P[i] + a[i]; sum(i..j) = P[j+1] − P[i]</td><td>P has n + 1 entries</td></tr>
    <tr><td>Kadane</td><td>cur = max(x, cur + x); best = max(best, cur)</td><td>cur = best stretch ending here; start both at a[0]</td></tr>
    <tr><td>Grid</td><td>R = len(g), C = len(g[0]); in bounds: 0 ≤ r &lt; R, 0 ≤ c &lt; C</td><td>rotate clockwise = transpose + reverse rows</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Two pointers</b><p>Sorted data, pair/triplet sums, palindromes, in-place compaction.</p><small>Not on unsorted data when original indexes matter</small></div>
    <div><b>Sliding window</b><p>Contiguous runs with a rule that only gets more broken as the window grows.</p><small>Not with negative numbers in sums</small></div>
    <div><b>Prefix sums</b><p>Many range-total questions; pivot index; difference arrays.</p><small>Not for "best range" on its own (Kadane)</small></div>
    <div><b>Kadane</b><p>Maximum-sum contiguous stretch, negatives allowed.</p><small>Not for "exactly k" (prefix + hash map)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Hidden O(n) in loops (<code>in list</code>, <code>pop(0)</code>, slices); <code>+=</code> on strings; <code>[[0]*m]*n</code>; window length r − l + 1; <code>P[j+1] − P[i]</code>; windows with negatives; two pointers on unsorted data; Kadane starting at 0; spiral without the single-row/column checks; modifying a list while looping over it.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Sorted charges, target 280: first two moves?</td><td>40 + 310 = 350 too big → R left; 40 + 250 = 290 too big → R left</td></tr>
    <tr><td>Fixed window k = 3: from 450, slide one step (40 joins, 120 leaves)?</td><td>450 + 40 − 120 = 370</td></tr>
    <tr><td>Total of orders 1..3 from P?</td><td>P[4] − P[1] = 490 − 120 = 370</td></tr>
    <tr><td>Kadane on [−3, −1, −2]?</td><td>−1 (start from a[0], not 0)</td></tr>
    <tr><td>Why is the variable window O(n) with a while inside a for?</td><td>left only moves forward, at most n times in total: each index joins once and leaves once</td></tr>
  </table>

  <h2 id="dsa-ar-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is reading <code>a[i]</code> O(1) in an array?</summary><div class="qa-body">The items sit side by side in one block and every slot is the same size, so the address of item i is <code>start + i × slot_size</code>: one multiply and one add, whatever n is. (A Python list stores same-size pointers to the objects, so the rule still holds.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>append is sometimes O(n). Why do we still call it O(1)?</summary><div class="qa-body">It is O(1) <em>amortised</em>. A resize copies everything, but the capacity grows by a constant factor, so resizes happen rarely. In the trace, 9 appends caused 15 copies in total, under 2 per append on average.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>"".join(parts)</code> better than <code>+=</code> in a loop?</summary><div class="qa-body">Strings are immutable, so each <code>+=</code> may build a new string and copy everything so far: 1 + 2 + … + n ≈ n²/2 copies. <code>join</code> adds up the lengths, allocates once and copies each character once: O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Two Sum II, why is it safe to move R left when the sum is too big?</summary><div class="qa-body">The list is sorted, so every item between L and R is ≥ <code>a[L]</code>. If <code>a[L] + a[R]</code> is already too big, <code>a[R]</code> plus any of them is also too big. So <code>a[R]</code> cannot be in any answer, and dropping it loses nothing. On the charges: 40 + 310 = 350 &gt; 280, so 310 is out for good.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Container With Most Water, why move the shorter wall?</summary><div class="qa-body">Water = min(height) × width. Moving the taller wall makes the width smaller while the height is still capped by the same short wall, so the area can only shrink. Only moving the short wall can find a taller partner and possibly more water.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The variable window has a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body"><code>left</code> only ever moves forward and never passes <code>right</code>. So over the whole run the inner loop executes at most n times in total, not n times per outer step. Every index is added once and removed once: about 2n operations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does sliding window fail, and what do you use instead?</summary><div class="qa-body">When growing the window doesn't change the condition in one direction, e.g. sums with negative numbers ("subarray sum equals k" with negatives). Use prefix sums with a hash map counting earlier prefix values (Hashing note), or Kadane for "maximum sum".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give the prefix-sum formula for the sum of nums[i..j] and explain the leading 0.</summary><div class="qa-body"><code>P[j+1] - P[i]</code>, where <code>P[k]</code> = sum of the first k items. The leading <code>P[0] = 0</code> means a range starting at index 0 needs no special case. Orders 2..4: 800 − 200 = 600.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Kadane in one sentence, and the all-negative trap.</summary><div class="qa-body">At each item, the best subarray ending here is either the item alone or the item added to the best subarray ending one step back: <code>cur = max(x, cur + x)</code>; track the max of <code>cur</code>. Initialise with <code>nums[0]</code>, not 0, or an all-negative array returns 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you rotate an n×n matrix 90° clockwise in place? Anticlockwise?</summary><div class="qa-body">Clockwise: transpose (swap <code>a[i][j]</code> with <code>a[j][i]</code> for j &gt; i), then reverse every row. Anticlockwise: transpose, then reverse the order of the rows (or reverse each row first, then transpose). O(n²) time, O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Product of Array Except Self without division: idea and complexity?</summary><div class="qa-body">Answer at i = product of everything left of i × product of everything right of i. One forward pass stores left products in the output, one backward pass multiplies by a running right product. O(n) time, O(1) extra space besides the output, and zeros need no special handling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does two pointers need the brute force to come first?</summary><div class="qa-body">Two pointers is justified as "this step rules out a whole row of the brute force's pairs". Without the brute force's picture (all n(n−1)/2 pairs) there is nothing to rule out and no proof the shortcut is correct. It is also the checker you test the fast version against.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are sliding window and prefix sums related, and when do you pick which?</summary><div class="qa-body">Both give a range total without re-adding: the window keeps the total of the current range as it slides; prefix sums store totals of all prefixes so any range is a subtraction. Use a window for one left-to-right question about runs of positive values; use prefix sums for many arbitrary range queries, or (with a hash map) for "sum equals k" when values can be negative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you use the sliding window on the profit list instead of Kadane?</summary><div class="qa-body">The profit list has negatives, so adding an order can <em>lower</em> the total. The window's rule "shrink while too big / grow while too small" no longer moves toward the answer and can discard the best stretch. Kadane doesn't rely on that; it only asks "is the stretch ending here still positive?", which works with any signs (240 on our data).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the next note (Hashing) exist if two pointers already solves the ₹280 combo?</summary><div class="qa-body">Two pointers needs sorted data, and sorting costs O(n log n) and destroys the original positions (it reported (2, 5) instead of orders 1 and 7). A hash map of "values seen so far" finds the pair in one O(n) pass on the unsorted charges, with original indexes; it also rescues prefix sums for "sum equals k" with negatives.</div></details>
</main>
`
});
