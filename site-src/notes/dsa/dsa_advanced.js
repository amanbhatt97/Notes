// notes/dsa/dsa_advanced.js — Advanced Data Structures
Object.assign(TOPIC_CONTENT, {
  "dsa_advanced": `<main>
<h1>Advanced Data Structures</h1>
  <div class="where"><span>DSA</span><span>Advanced Data Structures</span></div>
  <p class="lead">Some problems need a structure that answers questions about a <em>range</em> of an array, such as "total from day 10 to day 40" or "worst day this week", while the array keeps changing underneath. Plain lists and prefix sums each make one of those operations slow, and the structures on this page, the Fenwick tree, the segment tree and its lazy version, and the sparse table, make both fast by storing pre-added blocks. The page then covers the other "advanced" structures interviews like to ask about: the monotonic deque, sorted lists with <code>bisect</code>, LRU and LFU caches, skip lists and Bloom filters. The running example is one Biteful finance dashboard showing <strong>8 days of revenue</strong> in ₹ thousand, <code>rev = [5, 2, 8, 1, 4, 7, 3, 6]</code> for days 0 to 7. Finance keeps asking for range totals while the accountant keeps correcting old days, and every structure is tried on these eight numbers.</p>

  <h2 id="dsa-ad-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Advanced Data Structures</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Ranges with updates</div>
        <ul>
          <li>List: update O(1), range sum O(n); prefix sums: the reverse</li>
          <li>Fenwick: box i covers <code>i &amp; -i</code> items; sums only</li>
          <li>Segment tree: halves of halves; any associative op</li>
          <li>Lazy tags: range updates in O(log n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Static or sliding</div>
        <ul>
          <li>Sparse table: static min/max in O(1)</li>
          <li>Two overlapping power-of-two windows</li>
          <li>Monotonic deque: every window max in O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ordered and cached</div>
        <ul>
          <li><code>bisect</code>: O(log n) find, O(n) insert; SortedList</li>
          <li>LRU = dict + doubly linked list (OrderedDict)</li>
          <li>LFU = frequency buckets + <code>min_freq</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Probabilistic</div>
        <ul>
          <li>Skip list: express lanes, O(log n) expected</li>
          <li>Bloom filter: "definitely not" or "maybe"</li>
          <li>No false negatives, some false positives</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-ad-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When Basics Are Not Enough</span><span class="rm-sub">range totals while old days get corrected</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-bit"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Fenwick Tree (BIT)</span><span class="rm-sub">prefix sums with updates in O(log n)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-seg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Segment Tree</span><span class="rm-sub">any range operation with updates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-lazy"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Lazy Propagation</span><span class="rm-sub">updating a whole range at once</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-sparse"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Sparse Table</span><span class="rm-sub">O(1) range minimum on frozen data</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-sorted"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Monotonic Deque &amp; Sorted Lists</span><span class="rm-sub">sliding windows, bisect, SortedList</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-cache"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">LRU &amp; LFU Caches</span><span class="rm-sub">what to keep when room is limited</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-prob"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Skip Lists &amp; Bloom Filters</span><span class="rm-sub">trading randomness or error for speed and space</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">When Each Is Worth It</span><span class="rm-sub">choosing a structure from the constraints</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">index 0, set vs add, overlap</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">templates, costs, decision table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on these structures</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ad-need"><span class="num">01</span>When Basics Are Not Enough</h2>
  <p>Finance asks one kind of question over and over: "what was the total revenue from day i to day j?" Call that a <strong>range query</strong>. At the same time the accountant keeps correcting past days (a refund here, a late payment there): "day 2 was actually ₹3k, not ₹8k". Call that a <strong>point update</strong>. Both happen often and in any order. Let us see what the two tools we already know do with that mix.</p>
  <div class="fx" data-lang="py">rev = [5, 2, 8, 1, 4, 7, 3, 6]          # revenue (Rs thousand), days 0..7

print("days 1..3:", sum(rev[1:4]))      # plain list: re-add the range every time

P = [0]                                 # prefix sums: P[i] = total of days 0..i-1
for x in rev:
    P.append(P[-1] + x)
print("P =", P, " days 1..3 =", P[4] - P[1])

old, new = rev[2], 3                    # finance corrects day 2: 8 -&gt; 3
rev[2] = new
for i in range(3, len(P)):              # every prefix that includes day 2 is now wrong
    P[i] += new - old
print("P =", P, " entries rewritten:", len(P) - 3, " days 1..3 =", P[4] - P[1])</div>
  <div class="fx" data-lang="text">days 1..3: 11
P = [0, 5, 7, 15, 16, 20, 27, 30, 36]  days 1..3 = 11
P = [0, 5, 7, 10, 11, 15, 22, 25, 31]  entries rewritten: 6  days 1..3 = 6</div>
  <p>The plain list answers "days 1 to 3" by adding 2 + 8 + 1 = 11. That is fine for three days, but a range covering the whole history adds every number, so each query is O(n), while an update is just one assignment, O(1). <strong>Prefix sums</strong>, from the <a class="xref" data-note="dsa_arrays">Arrays</a> note, flip the trade-off: <code>P[i]</code> stores the total of days 0 to i − 1, so any range is one subtraction, P[4] − P[1] = 16 − 5 = 11, in O(1). But look at what the day-2 correction did. Every prefix that includes day 2, which is P[3] through P[8], became wrong and had to be rewritten: 6 of the 9 entries. In general an update is O(n).</p>
  <p>Each tool is fast at one operation and slow at the other. With 10⁵ days and 10⁵ mixed queries and updates, either one costs around 10¹⁰ steps, far too slow. What we want is something in between, where both operations cost O(log n), about 17 steps for 10⁵ days, which brings the total down to a few million.</p>
  <p>Think of how a shop could keep its ledger. A shop that writes only daily totals has to add up a whole month by hand whenever the owner asks (the plain list). A shop that writes only running totals since opening day answers instantly, but after one correction has to rewrite every later page (prefix sums). A sensible shop keeps daily totals plus a few subtotals for weeks and months: a question adds up a handful of subtotals, and a correction fixes only the few subtotals that contain the corrected day. That is the key insight behind every structure in the next three sections: store <strong>pre-added blocks</strong> of the array, chosen so that any range is made of only about log n blocks and any single day sits inside only about log n blocks. Prefix sums are the extreme case where every block starts at day 0, which is exactly why one change touches all of them. The two classic ways of choosing the blocks are the Fenwick tree and the segment tree.</p>
  <p>One warning before building anything: these structures only pay off when there are both queries and updates. If the data never changes, prefix sums are simpler and faster, and with n around 10³ even the plain list is fine. In an interview, say the simple solution first and upgrade when the constraints (or the follow-up "now the array can change") demand it.</p>

  <h2 id="dsa-ad-bit"><span class="num">02</span>Fenwick Tree (BIT)</h2>
  <p>A <strong>Fenwick tree</strong>, also called a <strong>Binary Indexed Tree</strong> or BIT, is a single list of "boxes" that supports two operations in O(log n): add a value to one position, and get the sum of the first i positions (a prefix sum). It is about ten lines of code. Its cleverness is entirely in how it chooses which block each box holds, and that choice comes from the <a class="xref" data-note="dsa_bits">Bit Manipulation</a> note's <code>x &amp; -x</code>, which isolates the lowest 1 bit of x.</p>
  <p>Number the boxes from 1 (the tree is 1-indexed internally). Box i holds the sum of the last <code>i &amp; -i</code> days ending at day i. For odd i the lowest bit is 1, so box i holds just one day. Box 2 (<code>10</code>) has lowbit 2, so it holds two days; box 4 (<code>100</code>) holds four days; box 6 (<code>110</code>) has lowbit 2, so two days; box 8 holds all eight. Think of a ledger where odd pages record one day, page 2 has a subtotal for days 1–2, page 4 for days 1–4, page 6 for days 5–6 and page 8 for days 1–8. The figure shows these blocks on our revenue.</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600"><text x="91" y="18" text-anchor="middle" class="tm">i=1</text><rect x="62" y="26" width="58" height="28" class="fs"/><text x="91" y="45" text-anchor="middle">5</text><text x="153" y="18" text-anchor="middle" class="tm">i=2</text><rect x="124" y="26" width="58" height="28" class="fs"/><text x="153" y="45" text-anchor="middle">2</text><text x="215" y="18" text-anchor="middle" class="tm">i=3</text><rect x="186" y="26" width="58" height="28" class="fs"/><text x="215" y="45" text-anchor="middle">8</text><text x="277" y="18" text-anchor="middle" class="tm">i=4</text><rect x="248" y="26" width="58" height="28" class="fs"/><text x="277" y="45" text-anchor="middle">1</text><text x="339" y="18" text-anchor="middle" class="tm">i=5</text><rect x="310" y="26" width="58" height="28" class="fs"/><text x="339" y="45" text-anchor="middle">4</text><text x="401" y="18" text-anchor="middle" class="tm">i=6</text><rect x="372" y="26" width="58" height="28" class="fs"/><text x="401" y="45" text-anchor="middle">7</text><text x="463" y="18" text-anchor="middle" class="tm">i=7</text><rect x="434" y="26" width="58" height="28" class="fs"/><text x="463" y="45" text-anchor="middle">3</text><text x="525" y="18" text-anchor="middle" class="tm">i=8</text><rect x="496" y="26" width="58" height="28" class="fs"/><text x="525" y="45" text-anchor="middle">6</text><text x="8" y="45" class="tm">rev</text><rect x="62" y="70" width="58" height="26" rx="5" class="ft st"/><text x="91" y="87" text-anchor="middle" font-size="10">t[1] = 5</text><rect x="62" y="104" width="120" height="26" rx="5" class="fb sb"/><text x="122" y="121" text-anchor="middle" font-size="10">t[2] = 7</text><rect x="186" y="70" width="58" height="26" rx="5" class="ft st"/><text x="215" y="87" text-anchor="middle" font-size="10">t[3] = 8</text><rect x="62" y="138" width="244" height="26" rx="5" class="fv sb"/><text x="184" y="155" text-anchor="middle" font-size="10">t[4] = 16</text><rect x="310" y="70" width="58" height="26" rx="5" class="ft st"/><text x="339" y="87" text-anchor="middle" font-size="10">t[5] = 4</text><rect x="310" y="104" width="120" height="26" rx="5" class="fb sb"/><text x="370" y="121" text-anchor="middle" font-size="10">t[6] = 11</text><rect x="434" y="70" width="58" height="26" rx="5" class="ft st"/><text x="463" y="87" text-anchor="middle" font-size="10">t[7] = 3</text><rect x="62" y="172" width="492" height="26" rx="5" class="fg sg"/><text x="308" y="189" text-anchor="middle" font-size="10">t[8] = 36</text><text x="8" y="87" class="tm">len 1</text><text x="8" y="121" class="tm">len 2</text><text x="8" y="155" class="tm">len 4</text><text x="8" y="189" class="tm">len 8</text><text x="300" y="222" text-anchor="middle">prefix(7) = t[7] + t[6] + t[4]   (7 → 6 → 4 → 0 by i -= i &amp; -i)</text></svg><figcaption>Box i covers a block of length i &amp; −i ending at position i (position i is day i − 1). A prefix sum hops left by dropping the lowest 1 bit each time.</figcaption></figure>
  <p>Read the figure row by row. The top row is the revenue itself, with positions 1 to 8. Below it, the bars show what each box covers: the one-day boxes t[1], t[3], t[5], t[7]; the two-day boxes t[2] = 5 + 2 = 7 and t[6] = 4 + 7 = 11; the four-day box t[4] = 16; and the eight-day box t[8] = 36. Now both operations become short walks. To get the sum of the first 7 positions, read box 7 (one day), then jump left past its block to box 6 (two days), then past that block to box 4 (four days), and stop at 0: 3 + 11 + 16 = 30. Each jump is <code>i -= i &amp; -i</code>, which removes the lowest 1 bit (7 = <code>111</code> → 6 = <code>110</code> → 4 = <code>100</code> → 0). To add to one day, you must fix every box whose block contains it, and those are found by going the other way, <code>i += i &amp; -i</code>: day 2 is position 3, and the boxes covering it are 3, then 4, then 8.</p>
  <div class="fx" data-lang="py">class Fenwick:
    """Boxes t[1..n]; box i holds the sum of the (i &amp; -i) items ending at item i."""

    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, delta):            # i is 0-based for the caller
        i += 1                          # the only place we switch to 1-based
        path = []
        while i &lt;= self.n:
            self.t[i] += delta
            path.append(i)
            i += i &amp; -i                 # next box that also covers this item
        return path

    def prefix(self, i):                # sum of the first i items
        s, path = 0, []
        while i &gt; 0:
            s += self.t[i]
            path.append(i)
            i -= i &amp; -i                 # drop the lowest 1 bit: next box to the left
        return s, path

    def range_sum(self, l, r):          # inclusive, 0-based
        return self.prefix(r + 1)[0] - self.prefix(l)[0]

rev = [5, 2, 8, 1, 4, 7, 3, 6]
fw = Fenwick(len(rev))
for i, x in enumerate(rev):
    fw.add(i, x)
print("boxes t[1..8]:", fw.t[1:])
print("prefix(7) =", fw.prefix(7))      # (sum, boxes read)
print("days 1..3 =", fw.range_sum(1, 3))
print("day 2: 8 -&gt; 3, add -5, boxes touched:", fw.add(2, 3 - 8))
print("boxes t[1..8]:", fw.t[1:], " days 1..3 =", fw.range_sum(1, 3))</div>
  <div class="fx" data-lang="text">boxes t[1..8]: [5, 7, 8, 16, 4, 11, 3, 36]
prefix(7) = (30, [7, 6, 4])
days 1..3 = 11
day 2: 8 -&gt; 3, add -5, boxes touched: [3, 4, 8]
boxes t[1..8]: [5, 7, 3, 11, 4, 11, 3, 31]  days 1..3 = 6</div>
  <p>The boxes come out as in the figure, <code>[5, 7, 8, 16, 4, 11, 3, 36]</code>. <code>prefix(7)</code> returns 30 and reports that it read boxes 7, 6 and 4. A range is the difference of two prefixes, so days 1 to 3 is prefix(4) − prefix(1) = 16 − 5 = 11. To correct day 2 from 8 to 3 we add the difference, −5, and the update touched only boxes 3, 4 and 8, which changed to 3, 11 and 31; after that, days 1 to 3 is 6. Because every jump changes one bit, each walk takes at most log₂ n steps: 3 for 8 days, 17 for 10⁵. Building by n adds costs O(n log n) (an O(n) build exists but is rarely asked), and the space is n + 1 slots. This class directly solves LeetCode's <strong>Range Sum Query – Mutable</strong>.</p>
  <p>Two details are worth saying out loud in an interview. First, the tree is 1-indexed because index 0 has no lowest bit (<code>0 &amp; -0</code> is 0), so a walk starting at 0 would never move; the class converts with <code>i += 1</code> in exactly one place. Second, a Fenwick tree only stores sums, so a range must be computed as prefix(r) − prefix(l), and that only works for operations that can be "undone" by subtraction: sums, counts and XOR, but not min or max.</p>
  <p>Fenwick trees also answer a family of counting questions that do not look like ranges at first. <strong>Count of Smaller Numbers After Self</strong> asks, for each element, how many elements to its right are smaller: <code>[5, 2, 6, 1]</code> gives <code>[2, 1, 1, 0]</code>. The brute force is O(n²). Instead, walk from the right and keep a Fenwick tree indexed by <em>value</em>, where position v counts how many times value v has been seen. For each element x, the answer is how many seen values are smaller than x, which is a prefix sum. Values may be negative or huge, so first replace each value with its rank among the distinct values, a step called <strong>coordinate compression</strong>.</p>
  <div class="fx" data-lang="py">def count_smaller(nums):
    ranks = {v: i for i, v in enumerate(sorted(set(nums)))}   # value -&gt; 0..m-1
    fw = Fenwick(len(ranks))
    out = []
    for x in reversed(nums):            # walk right to left
        r = ranks[x]
        out.append(fw.prefix(r))        # seen values with a smaller rank
        fw.add(r, 1)                    # now x has been seen
    return out[::-1]

print(count_smaller([5, 2, 6, 1]), count_smaller([3, 2, 2, 6, 1]))</div>
  <div class="fx" data-lang="text">[2, 1, 1, 0] [3, 1, 1, 1, 0]</div>
  <p>For <code>[5, 2, 6, 1]</code>, the ranks are 1→0, 2→1, 5→2, 6→3. Walking from the right: 1 sees nothing (0); 6 sees rank 0 below its rank 3 (1); 2 sees rank 0 below rank 1 (1); 5 sees ranks 0 and 1 below rank 2 (2). Because <code>prefix(r)</code> counts ranks strictly below r, equal values are not counted, which is why the two 2s in the second example each get 1. The cost is O(n log n). Recognise Fenwick problems from "range sum with updates", "count smaller / greater before or after", "number of inversions", or "rank of x among values seen so far".</p>

  <h2 id="dsa-ad-seg"><span class="num">03</span>Segment Tree</h2>
  <p>Finance now also wants "the worst day between day i and day j", with corrections still coming in. The Fenwick tree cannot help, because a range minimum cannot be obtained by subtracting two prefix minima. We need blocks that can be glued together directly for any range, without subtraction. A <strong>segment tree</strong> provides them: it is a binary tree in which the root covers the whole array, every node splits its range into two halves for its two children, and each leaf is a single day. Every node stores the answer for its range: the sum, or the minimum, or any other operation that can combine two halves.</p>
  <p>Think of a school's marks register. Each class teacher keeps the total for her section, each house captain keeps the total for two sections, and the principal keeps the school total. Asked for "roll numbers 1 to 3", you add up the few totals that exactly cover that range instead of visiting every student. The figure shows the segment tree of sums for our revenue.</p>
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
</svg><figcaption>Segment tree of sums over the 8 days. Each box shows its range and its total. The query for days 1..3 passes through the blue nodes and adds up the green ones: 2 + 9 = 11.</figcaption></figure>
  <p>The root [0..7] holds 36, the whole week. Its children hold the two halves, [0..3] = 16 and [4..7] = 20, and so on down to single days. To answer a query for [l, r], start at the root and compare each node's range with [l, r]. There are only three cases. If the node's range does not overlap [l, r] at all, it contributes nothing (0 for sums). If the node's range lies fully inside [l, r], its stored total is exactly what we need, so we use it and do not look below it. Otherwise the overlap is partial, and we ask both children and add their answers. For days 1 to 3 the walk goes: the root is partial; [0..3] is partial; [0..1] is partial, and its children are day 0 (outside, 0) and day 1 (inside, 2); [2..3] is fully inside (9); [4..7] is outside (0). The answer is 2 + 9 = 11, the green nodes.</p>
  <p>The tree is stored in a plain list with the same layout trick as a heap: the root is at index 1 and the children of node v are at 2v and 2v + 1, so no node objects or pointers are needed. A list of 4n slots is always large enough.</p>
  <div class="fx" data-lang="py">class SegmentTree:
    """Range sum + point update. tree[1] is the root; children of v are 2v and 2v+1."""

    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)          # 4n is always enough room
        self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, v, lo, hi):
        if lo == hi:                            # leaf: one day
            self.tree[v] = nums[lo]
            return
        mid = (lo + hi) // 2
        self._build(nums, 2 * v, lo, mid)
        self._build(nums, 2 * v + 1, mid + 1, hi)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]

    def update(self, i, val, v=1, lo=0, hi=None):
        hi = self.n - 1 if hi is None else hi
        if lo == hi:
            self.tree[v] = val
            return
        mid = (lo + hi) // 2
        if i &lt;= mid:
            self.update(i, val, 2 * v, lo, mid)
        else:
            self.update(i, val, 2 * v + 1, mid + 1, hi)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]   # fix the path on the way up

    def query(self, l, r, v=1, lo=0, hi=None, log=None):
        hi = self.n - 1 if hi is None else hi
        if r &lt; lo or hi &lt; l:                    # no overlap
            log.append(f"[{lo}..{hi}] outside -&gt; 0")
            return 0
        if l &lt;= lo and hi &lt;= r:                 # fully inside: use the stored total
            log.append(f"[{lo}..{hi}] inside  -&gt; {self.tree[v]}")
            return self.tree[v]
        log.append(f"[{lo}..{hi}] partial -&gt; ask both children")
        mid = (lo + hi) // 2
        return (self.query(l, r, 2 * v, lo, mid, log) +
                self.query(l, r, 2 * v + 1, mid + 1, hi, log))

rev = [5, 2, 8, 1, 4, 7, 3, 6]
st = SegmentTree(rev)
print("root:", st.tree[1], " halves:", st.tree[2:4], " quarters:", st.tree[4:8])
log = []
print("days 1..3 =", st.query(1, 3, log=log))
for line in log:
    print("  ", line)
st.update(2, 3)                                 # day 2: 8 -&gt; 3
print("after update: root", st.tree[1], " halves:", st.tree[2:4], " quarters:", st.tree[4:8])</div>
  <div class="fx" data-lang="text">root: 36  halves: [16, 20]  quarters: [7, 9, 11, 9]
days 1..3 = 11
   [0..7] partial -&gt; ask both children
   [0..3] partial -&gt; ask both children
   [0..1] partial -&gt; ask both children
   [0..0] outside -&gt; 0
   [1..1] inside  -&gt; 2
   [2..3] inside  -&gt; 9
   [4..7] outside -&gt; 0
after update: root 31  halves: [11, 20]  quarters: [7, 4, 11, 9]</div>
  <p>The first line shows the tree level by level, exactly as in the figure. The query log lists the seven nodes visited, in the order just described. An update walks from the root down to the one leaf it changes, then recomputes every total on the way back up: changing day 2 from 8 to 3 changed the leaf, then [2..3] from 9 to 4, [0..3] from 16 to 11 and the root from 36 to 31, and nothing else. At each level a query has at most two partial nodes, so it visits O(log n) nodes; an update touches one root-to-leaf path, also O(log n); building visits each of the roughly 2n nodes once, O(n); and the space is O(n).</p>
  <p>Turning this into the "worst day" tree that finance wanted takes two edits: combine children with <code>min</code> instead of <code>+</code>, and return +∞ instead of 0 for "no overlap" (the value that does not change the answer, called the <strong>identity</strong> of the operation). The same works for max (identity −∞), gcd (identity 0) or any <strong>associative</strong> operation, meaning one where combining (a, b) and then c gives the same result as a with (b, c). Compared with a Fenwick tree, a segment tree is longer (about 40 lines against 10) and uses 4n space, but it supports any associative operation, range updates (next section), and searching inside the tree, such as "first day whose revenue is at least x". Recognise it from "range min / max / gcd with updates", "range sum with updates", or "add x to a range" problems.</p>

  <h2 id="dsa-ad-lazy"><span class="num">04</span>Lazy Propagation</h2>
  <p>During a festival, finance books a ₹2k bonus on <em>every</em> day from 4 to 7. With the segment tree as it stands, that is four point updates, each O(log n). On 10⁵ days, a single "add x to days l to r" could be 10⁵ point updates, which is no better than the plain list. We need range updates to cost O(log n) too.</p>
  <p>Notice that the node [4..7] already covers exactly the range being updated. If we add 2 × 4 = 8 to its total, every query that uses that node as a whole will already see the right answer. The only problem is that its children and leaves still hold old values. The trick, called <strong>lazy propagation</strong>, is to not fix them yet: leave a note on the node saying "everything below me is owed +2", and pass that note down to the children only when some later operation actually needs to look inside. The note is called a <strong>lazy tag</strong>. Think of a school announcing "+5 grace marks for everyone in sections A to D": the principal updates the section totals and leaves a note with each section teacher, who adjusts individual students only when someone asks about one of them.</p>
  <p>The rules fit in two phrases. For an update: when a node is fully covered, fix its total (add x times its length), add x to its tag, and stop; this is "cover, tag, stop". For any operation that must go below a node: first hand the node's tag to both children and clear it; this is "push before you go down".</p>
  <div class="fx" data-lang="py">class LazySegTree:
    """Range add + range sum. lazy[v] = amount still owed to every day below v."""

    def __init__(self, nums):
        self.n = len(nums)
        self.sum = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, v, lo, hi):
        if lo == hi:
            self.sum[v] = nums[lo]
            return
        mid = (lo + hi) // 2
        self._build(nums, 2 * v, lo, mid)
        self._build(nums, 2 * v + 1, mid + 1, hi)
        self.sum[v] = self.sum[2 * v] + self.sum[2 * v + 1]

    def _apply(self, v, lo, hi, x):          # node fully covered: fix its sum, leave an IOU
        self.sum[v] += x * (hi - lo + 1)
        self.lazy[v] += x

    def _push(self, v, lo, hi):              # hand the IOU to both children
        if self.lazy[v]:
            mid = (lo + hi) // 2
            self._apply(2 * v, lo, mid, self.lazy[v])
            self._apply(2 * v + 1, mid + 1, hi, self.lazy[v])
            self.lazy[v] = 0

    def add(self, l, r, x, v=1, lo=0, hi=None):
        hi = self.n - 1 if hi is None else hi
        if r &lt; lo or hi &lt; l:
            return
        if l &lt;= lo and hi &lt;= r:              # cover, tag, stop
            self._apply(v, lo, hi, x)
            return
        self._push(v, lo, hi)                # push before going down
        mid = (lo + hi) // 2
        self.add(l, r, x, 2 * v, lo, mid)
        self.add(l, r, x, 2 * v + 1, mid + 1, hi)
        self.sum[v] = self.sum[2 * v] + self.sum[2 * v + 1]

    def query(self, l, r, v=1, lo=0, hi=None):
        hi = self.n - 1 if hi is None else hi
        if r &lt; lo or hi &lt; l:
            return 0
        if l &lt;= lo and hi &lt;= r:
            return self.sum[v]
        self._push(v, lo, hi)                # push before going down
        mid = (lo + hi) // 2
        return self.query(l, r, 2 * v, lo, mid) + self.query(l, r, 2 * v + 1, mid + 1, hi)

lt = LazySegTree([5, 2, 8, 1, 4, 7, 3, 6])
lt.add(4, 7, 2)                              # festival bonus: +2 on days 4..7
print("root", lt.sum[1], "| node [4..7] sum", lt.sum[3], "lazy", lt.lazy[3], "| its children", lt.sum[6:8])
print("days 5..6 =", lt.query(5, 6))
print("node [4..7] lazy", lt.lazy[3], "| its children", lt.sum[6:8], "lazy", lt.lazy[6:8])</div>
  <div class="fx" data-lang="text">root 44 | node [4..7] sum 28 lazy 2 | its children [11, 9]
days 5..6 = 14
node [4..7] lazy 0 | its children [15, 13] lazy [0, 0]</div>
  <p>After the bonus, the root total is 44 (36 + 8) and node [4..7] holds 28 with a lazy tag of 2, while its children still show their old totals 11 and 9; they have not been told. Then we ask for days 5 to 6. That range only partly covers [4..7], so the query must go inside, and it pushes the tag first: the children become 11 + 2 × 2 = 15 and 9 + 2 × 2 = 13 and the parent's tag is cleared (the push continues one level further on the way down to days 5 and 6). The answer is (7 + 2) + (3 + 2) = 14, as expected. Only nodes on the paths that are actually walked ever receive the tag, which is why both range updates and range queries stay O(log n).</p>
  <p>You rarely have to write this from scratch in an interview, but you should be able to explain it in those two phrases and know where it is needed: "add x to all elements in [l, r]" together with range queries, booking problems such as My Calendar III (count the maximum overlap), Falling Squares and Range Module. The two classic bugs are forgetting to push before recursing, so that a parent recomputed from its children silently loses the pending amount, and adding x instead of x times the node's length to a sum.</p>

  <h2 id="dsa-ad-sparse"><span class="num">05</span>Sparse Table</h2>
  <p>Last month's revenue is closed and will never change again, and analysts run hundreds of thousands of "worst day between day i and day j" queries over it. A segment tree would answer each in O(log n), paying for the ability to handle updates that will never come. Prefix sums give O(1) for static <em>sums</em>, but there is no "prefix minimum" trick for an arbitrary range, because minima cannot be subtracted. Can we answer static range minimum in O(1)?</p>
  <p>A <strong>sparse table</strong> does it by precomputing the minimum of every window whose length is a power of two: <code>table[k][i]</code> is the minimum of the 2ᵏ days starting at day i. Each level is built from the one below, because a window of length 2ᵏ is two windows of length 2ᵏ⁻¹ side by side. To answer a query for [l, r], let 2ᵏ be the largest power of two that fits in its length. One window of that length starting at l and another ending at r together cover the whole range. They usually overlap in the middle, but for a minimum that does not matter: a day counted twice cannot change which day is the smallest. Think of two overlapping photos of a crowd: to find the shortest person it does not matter that some people appear in both photos, though if you were counting people, the overlap would be counted twice.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600"><rect x="60" y="14" width="56" height="32" class="fs"/><text x="88" y="35" text-anchor="middle">5</text><text x="88" y="60" text-anchor="middle" class="tm">0</text><rect x="120" y="14" width="56" height="32" class="fb sb"/><text x="148" y="35" text-anchor="middle">2</text><text x="148" y="60" text-anchor="middle" class="tm">1</text><rect x="180" y="14" width="56" height="32" class="fb sb"/><text x="208" y="35" text-anchor="middle">8</text><text x="208" y="60" text-anchor="middle" class="tm">2</text><rect x="240" y="14" width="56" height="32" class="fb sb"/><text x="268" y="35" text-anchor="middle">1</text><text x="268" y="60" text-anchor="middle" class="tm">3</text><rect x="300" y="14" width="56" height="32" class="fb sb"/><text x="328" y="35" text-anchor="middle">4</text><text x="328" y="60" text-anchor="middle" class="tm">4</text><rect x="360" y="14" width="56" height="32" class="fb sb"/><text x="388" y="35" text-anchor="middle">7</text><text x="388" y="60" text-anchor="middle" class="tm">5</text><rect x="420" y="14" width="56" height="32" class="fb sb"/><text x="448" y="35" text-anchor="middle">3</text><text x="448" y="60" text-anchor="middle" class="tm">6</text><rect x="480" y="14" width="56" height="32" class="fs"/><text x="508" y="35" text-anchor="middle">6</text><text x="508" y="60" text-anchor="middle" class="tm">7</text><rect x="120" y="72" width="236" height="22" rx="5" class="fg sg"/><text x="238" y="88" text-anchor="middle">min[1..4] = 1</text><rect x="240" y="100" width="236" height="22" rx="5" class="ft st"/><text x="358" y="116" text-anchor="middle">min[3..6] = 1</text><text x="300" y="144" text-anchor="middle">query(1, 6): length 6, k = 2 → two windows of 4 overlap → min(1, 1) = 1</text></svg><figcaption>Days 1..6 have length 6. Two precomputed windows of length 4, one starting at day 1 and one ending at day 6, overlap on days 3..4 and together cover the range exactly.</figcaption></figure>
  <p>In the figure the query is days 1 to 6, length 6. The largest power of two that fits is 4, so we look up the window of 4 starting at day 1 (days 1–4, minimum 1) and the window of 4 ending at day 6 (days 3–6, minimum 1). Days 3 and 4 are in both windows, which is harmless, and the answer is min(1, 1) = 1. Two lookups and one comparison, whatever the length of the range.</p>
  <div class="fx" data-lang="py">class SparseTable:
    """Static array; range minimum in O(1) after an O(n log n) build."""

    def __init__(self, nums):
        n = len(nums)
        self.log = [0] * (n + 1)                   # log[x] = floor(log2 x)
        for i in range(2, n + 1):
            self.log[i] = self.log[i // 2] + 1
        self.table = [nums[:]]                     # level 0: windows of length 1
        k = 1
        while (1 &lt;&lt; k) &lt;= n:
            prev, half = self.table[-1], 1 &lt;&lt; (k - 1)
            self.table.append([min(prev[i], prev[i + half])      # two halves
                               for i in range(n - (1 &lt;&lt; k) + 1)])
            k += 1

    def query(self, l, r):                         # min of nums[l..r]
        k = self.log[r - l + 1]                    # biggest power of 2 that fits
        return min(self.table[k][l], self.table[k][r - (1 &lt;&lt; k) + 1])

sp = SparseTable([5, 2, 8, 1, 4, 7, 3, 6])
for k, row in enumerate(sp.table):
    print(f"windows of {1 &lt;&lt; k}: {row}")
print("worst day in 2..7:", sp.query(2, 7), "  in 4..6:", sp.query(4, 6))</div>
  <div class="fx" data-lang="text">windows of 1: [5, 2, 8, 1, 4, 7, 3, 6]
windows of 2: [2, 2, 1, 1, 4, 3, 3]
windows of 4: [1, 1, 1, 1, 3]
windows of 8: [1]
worst day in 2..7: 1   in 4..6: 3</div>
  <p>The table has one row per power of two. Row "windows of 2" is built from pairs of row 1, so its first entry is min(5, 2) = 2; row "windows of 4" is built from pairs of row 2, and so on. For days 2 to 7 (length 6, so k = 2) the query takes min(table[2][2], table[2][4]) = min(1, 3) = 1, the ₹1k on day 3; for days 4 to 6 (length 3, so k = 1) it takes min(4, 3) = 3. Building costs O(n log n) time and space; every query is O(1). The <code>log</code> list is precomputed so the query never calls a floating-point log.</p>
  <p>The overlap trick only works for operations where counting an item twice changes nothing, called <strong>idempotent</strong> operations: min, max, gcd, bitwise AND and OR. For static sums use prefix sums, and with any updates use a segment tree, because a sparse table would have to be rebuilt. The same "doubling table" idea reappears as <strong>binary lifting</strong>, which finds the kth ancestor or the lowest common ancestor of tree nodes in O(log n). Recognise sparse tables from "range minimum/maximum query" on an array that "never changes", with a very large number of queries.</p>

  <h2 id="dsa-ad-sorted"><span class="num">06</span>Monotonic Deque &amp; Sorted Lists</h2>
  <p>The dashboard's most-viewed chart is "best day in each 3-day window", sliding one day at a time. That is a range-maximum query for every window, but the windows all have the same width and each overlaps the previous one in all but one day. A segment tree would do each in O(log n) and a sparse table in O(1) after an O(n log n) build, but neither uses the overlap. The <strong>monotonic deque</strong>, covered in depth in the <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a> note, uses it to do the whole chart in O(n).</p>
  <p>The key insight is that some days can never be a window's maximum again. If a later day has more revenue than an earlier one, the earlier day is both smaller and will leave the window sooner, so it is useless from now on. So keep a deque (a double-ended queue) of day indexes whose revenues are in decreasing order: when a new day arrives, pop every smaller-or-equal day off the back, then push the new day. The front is then always the window's maximum, and it is popped from the front once it slides out of the window. Think of a queue for a "tallest person" photo: when a taller person joins at the back, everyone shorter in front of them leaves, because they can never be the tallest while this person is still in the queue.</p>
  <div class="fx" data-lang="py">from collections import deque

def window_max(nums, k):
    dq, out = deque(), []                # indexes; their values decreasing
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] &lt;= x:
            dq.pop()                     # smaller and older: never a max again
        dq.append(i)
        if dq[0] &lt;= i - k:
            dq.popleft()                 # front has slid out of the window
        if i &gt;= k - 1:
            out.append(nums[dq[0]])      # front is the window's max
        print(f"day {i} ({x}): deque values {[nums[j] for j in dq]}")
    return out

print("best day in every 3-day window:", window_max([5, 2, 8, 1, 4, 7, 3, 6], 3))</div>
  <div class="fx" data-lang="text">day 0 (5): deque values [5]
day 1 (2): deque values [5, 2]
day 2 (8): deque values [8]
day 3 (1): deque values [8, 1]
day 4 (4): deque values [8, 4]
day 5 (7): deque values [7]
day 6 (3): deque values [7, 3]
day 7 (6): deque values [7, 6]
best day in every 3-day window: [8, 8, 8, 7, 7, 7]</div>
  <p>Follow the deque in the output. Days 0 and 1 (5 and 2) are kept in decreasing order. Day 2's 8 is larger than both, so they are popped and the deque is just [8], the maximum of days 0–2. Day 3's 1 and day 4's 4 are smaller than 8, so they join the back (4 first pops 1, which is smaller). On day 5, 7 pops 4 from the back, and 8 leaves from the front because day 2 is no longer in the window of days 3–5. The chart is <code>[8, 8, 8, 7, 7, 7]</code>. There is a loop inside the loop, but each day is pushed once and popped at most once, so the total work is O(n), and the deque holds at most k items. The deque stores indexes rather than values, which is how it knows when the front has left the window. This is LeetCode's <strong>Sliding Window Maximum</strong>.</p>
  <p>A different family of questions needs values kept in sorted order while new ones arrive: "smallest revenue of at least ₹6k", "how many days were below ₹4k", "does this booking overlap an existing one". Java has a balanced tree for this (<code>TreeMap</code>); Python's standard library does not. The usual stand-in is a plain sorted list with the <code>bisect</code> module from the <a class="xref" data-note="dsa_binsearch">Binary Search</a> note: finding a position is a binary search, O(log n), and inserting shifts the later items, O(n). For n up to about 10⁵ with mostly lookups this is fast enough, because the shift is a single fast memory move in C.</p>
  <div class="fx" data-lang="py">import bisect

days = []
for r in [5, 2, 8, 1, 4, 7, 3, 6]:      # revenues arrive one day at a time
    bisect.insort(days, r)              # O(log n) to find the spot, O(n) to shift
print(days)
print("days below 4:", bisect.bisect_left(days, 4))
print("smallest revenue &gt;= 6:", days[bisect.bisect_left(days, 6)])
print("largest revenue &lt;= 5:", days[bisect.bisect_right(days, 5) - 1])</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5, 6, 7, 8]
days below 4: 3
smallest revenue &gt;= 6: 6
largest revenue &lt;= 5: 5</div>
  <p>After inserting the eight revenues one at a time the list is sorted. <code>bisect_left(days, 4)</code> is the position where 4 would go, which equals the number of values below 4: three days. <code>days[bisect_left(days, 6)]</code> is the smallest value of at least 6 (the <strong>ceiling</strong> of 6), and <code>days[bisect_right(days, 5) - 1]</code> the largest value of at most 5 (the <strong>floor</strong>). <strong>My Calendar I</strong> uses the same idea: keep bookings sorted by start, and a new half-open booking [start, end) only has to be checked against its two neighbours, the booking just before it (does it end after we start?) and the one just after (does it start before we end?):</p>
  <div class="fx" data-lang="py">import bisect

class MyCalendar:
    def __init__(self):
        self.starts, self.ends = [], []          # bookings sorted by start

    def book(self, start, end):                 # half-open [start, end)
        i = bisect.bisect_right(self.starts, start)
        if i &gt; 0 and self.ends[i - 1] &gt; start:   # previous booking runs into us
            return False
        if i &lt; len(self.starts) and self.starts[i] &lt; end:   # next one starts too soon
            return False
        self.starts.insert(i, start)
        self.ends.insert(i, end)
        return True

cal = MyCalendar()
print([cal.book(s, e) for s, e in [(10, 20), (15, 25), (20, 30), (5, 10), (5, 11)]])</div>
  <div class="fx" data-lang="text">[True, False, True, True, False]</div>
  <p>(10, 20) is accepted; (15, 25) overlaps it; (20, 30) only touches it at 20, which is allowed for half-open intervals; (5, 10) fits before it; (5, 11) overlaps (10, 20). Each booking is O(log n) to search plus O(n) to insert. When inserts are frequent, the third-party <code>sortedcontainers</code> package (available on LeetCode, not in the standard library) gives <code>SortedList</code>, with about O(log n) <code>add</code>, <code>remove</code> and <code>bisect_left</code>; it is the Python answer to TreeMap. In an interview, say you would use it, and fall back to <code>bisect</code> or a heap if it is not allowed.</p>

  <h2 id="dsa-ad-cache"><span class="num">07</span>LRU &amp; LFU Caches</h2>
  <p>The dashboard keeps re-opening the same few reports, "days 0–3", "days 1–3", "days 4–7", and recomputing them each time is wasteful. A <strong>cache</strong> stores recent answers so they can be returned instantly, but memory is limited, so when the cache is full one entry must be thrown out, or <strong>evicted</strong>. Which one, and how do we look up, refresh and evict in O(1)?</p>
  <p>The most common rule is <strong>LRU</strong>, least recently used: evict the entry that has gone unused for the longest time. Your phone's recent-apps list works like this: when memory runs out, the app you have not touched for longest is closed. Browsers, databases, CDNs and Python's <code>functools.lru_cache</code> all use it. An LRU cache needs three things in O(1): find a key, mark it as "just used", and find the oldest key. A dictionary gives the first. A <strong>doubly linked list</strong> ordered by recency gives the other two, because a node can be unlinked from the middle and re-attached at the newest end in O(1), as long as the dictionary points straight at the node.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="ad-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><rect x="20" y="20" width="130" height="150" rx="8" class="fv sb"/><text x="85" y="40" text-anchor="middle" class="tb">dict</text><text x="85" y="75" text-anchor="middle">k=2 → node</text><text x="85" y="111" text-anchor="middle">k=7 → node</text><text x="85" y="147" text-anchor="middle">k=4 → node</text><rect x="175" y="95" width="80" height="36" rx="6" class="fs"/><text x="215" y="118" text-anchor="middle">head</text><line x1="257" y1="107" x2="273" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="273" y1="120" x2="257" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="275" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="315" y="118" text-anchor="middle">2:B</text><line x1="357" y1="107" x2="373" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="373" y1="120" x2="357" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="375" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="415" y="118" text-anchor="middle">7:Q</text><line x1="457" y1="107" x2="473" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="473" y1="120" x2="457" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="475" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="515" y="118" text-anchor="middle">4:Z</text><text x="315" y="85" text-anchor="middle" class="tr">oldest: evict here</text><text x="515" y="85" text-anchor="middle" class="tg">newest</text><text x="380" y="160" text-anchor="middle" class="tm">get/put: unlink node, re-attach at newest end: O(1)</text><text x="380" y="185" text-anchor="middle" class="tm">OrderedDict = this dict + linked list, built in</text></svg><figcaption>An LRU cache is a dict for finding nodes plus a doubly linked list for recency order. Python's OrderedDict is this combination, already built.</figcaption></figure>
  <p>In the figure, the dictionary maps each key straight to its node, and the list runs from the oldest entry (just after the head) to the newest. A <code>get</code> finds the node through the dictionary, unlinks it and re-attaches it at the newest end; a <code>put</code> that overflows the capacity removes the node just after the head. Every step is a few pointer changes, O(1). Python's <code>OrderedDict</code> is exactly this combination, with <code>move_to_end(key)</code> to mark a key as newest and <code>popitem(last=False)</code> to remove the oldest:</p>
  <div class="fx" data-lang="py">from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = OrderedDict()             # oldest first, newest last

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)            # just used: make it newest
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) &gt; self.cap:
            self.data.popitem(last=False)     # evict the least recently used

c = LRUCache(2)
c.put("days 0-3", 16); c.put("days 1-3", 11)
print(c.get("days 0-3"))                      # finance opens it again
c.put("days 4-7", 20)                         # cache full: evicts "days 1-3"
print(list(c.data), c.get("days 1-3"))</div>
  <div class="fx" data-lang="text">16
['days 0-3', 'days 4-7'] -1</div>
  <p>The cache holds two reports. Finance re-opens "days 0-3", which moves it to the newest end. Adding "days 4-7" overflows the capacity, so the least recently used entry, "days 1-3", is evicted, and asking for it afterwards returns −1. Interviewers often follow up with "now do it without OrderedDict", so know the manual version too:</p>
  <div class="fx" data-lang="py">class Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=None, val=None):
        self.key, self.val, self.prev, self.next = key, val, None, None

class LRUCacheManual:
    """dict for O(1) lookup + doubly linked list for O(1) reordering."""

    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = Node(), Node()     # sentinels: head.next is the oldest
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _append(self, node):                      # just before tail = newest
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
            del self.map[oldest.key]              # the node stores its key for this

c = LRUCacheManual(2)
c.put(1, 1); c.put(2, 2); r = [c.get(1)]
c.put(3, 3); r.append(c.get(2))
c.put(4, 4); r += [c.get(1), c.get(3), c.get(4)]
print(r)</div>
  <div class="fx" data-lang="text">[1, -1, -1, 3, 4]</div>
  <p>This runs the standard LeetCode test and gives the expected <code>[1, -1, -1, 3, 4]</code>. Two details make it short and safe. The head and tail are <strong>sentinel</strong> nodes that hold no data, so there is never a special case for an empty list or for the first and last nodes. And each node stores its own key, so when the oldest node is evicted, the code can also delete its entry from the dictionary. Both versions are O(1) per call and O(capacity) space. A common bug is a <code>put</code> on an existing key that forgets to make it newest, or that counts it as a new entry for eviction.</p>
  <p><strong>LFU</strong>, least frequently used, evicts the key used the fewest times, and among ties the least recent. Keeping it O(1) needs a little more structure: a map from each key to its use count, a "bucket" for each count holding its keys in recency order (an <code>OrderedDict</code> per count), and a variable <code>min_freq</code> holding the smallest count currently present. Using a key moves it from bucket f to bucket f + 1; evicting takes the oldest key from the <code>min_freq</code> bucket.</p>
  <div class="fx" data-lang="py">from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.key_freq = {}                          # key -&gt; times used
        self.buckets = defaultdict(OrderedDict)     # freq -&gt; {key: value}, oldest first
        self.min_freq = 0

    def _touch(self, key):                          # move key from bucket f to f+1
        f = self.key_freq[key]
        val = self.buckets[f].pop(key)
        if not self.buckets[f]:
            del self.buckets[f]
            if self.min_freq == f:
                self.min_freq = f + 1               # the key we moved is now the minimum
        self.key_freq[key] = f + 1
        self.buckets[f + 1][key] = val
        return val

    def get(self, key):
        return self._touch(key) if key in self.key_freq else -1

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
        self.min_freq = 1                           # a new key is always the rarest

c = LFUCache(2)
c.put(1, 1); c.put(2, 2)
print(c.get(1))        # key 1 used twice now
c.put(3, 3)            # evicts 2 (used once)
print(c.get(2), c.get(3))
c.put(4, 4)            # 1 and 3 both used twice; 1 is older -&gt; evict 1
print(c.get(1), c.get(3), c.get(4))</div>
  <div class="fx" data-lang="text">1
-1 3
-1 3 4</div>
  <p>Keys 1 and 2 go in; <code>get(1)</code> raises key 1's count to 2. Inserting key 3 must evict, and key 2 has the lowest count, so it goes (<code>get(2)</code> is −1). Key 3 is then read, so 1 and 3 both have count 2; inserting key 4 evicts the older of them, key 1. The subtle part is <code>min_freq</code>. When a touch empties the bucket at <code>min_freq</code>, the new minimum must be f + 1, because the key just moved there, so there is never a need to search for it. And a brand-new key always has count 1, so <code>min_freq</code> resets to 1 on every insert. Forgetting one of those two updates is the classic LFU bug. Recognise cache problems from "design a cache", "capacity", "evict the least recently / frequently used" and "get and put in O(1)".</p>

  <h2 id="dsa-ad-prob"><span class="num">08</span>Skip Lists &amp; Bloom Filters</h2>
  <p>Two more structures come up in design interviews, and both trade a little randomness or a little error for big savings. The first problem: a sorted linked list is easy to insert into once you know where, but finding the place takes O(n), because you must walk node by node. A <strong>skip list</strong> fixes that by adding "express lanes". Every node is on the bottom level; about half the nodes, chosen by coin flips, also appear on level 1; about a quarter on level 2; and so on. To search, ride the highest lane until the next stop would overshoot the target, drop down one lane, and repeat. Think of Mumbai's local trains: take the fast train to the nearest big station, then the slow train for the last few stops. Search, insert and delete are O(log n) on average, with O(n) space. Unlike balanced binary search trees there are no rotations, which makes skip lists simpler to write and easier to make safe for many threads at once. Redis uses them for its sorted sets (leaderboards). LeetCode 1206 asks you to design one; in most interviews, explaining the express lanes is enough.</p>
  <p>The second problem: Biteful wants to check "has this coupon code already been used?" across billions of codes, without a database lookup for every check and without holding all codes in memory. A <strong>Bloom filter</strong> answers membership questions with a tiny amount of memory by allowing one kind of mistake. It is a row of m bits, all 0 at first, plus k different hash functions. To add an item, compute its k hashes and set those k bits to 1. To check an item, look at its k bits: if any of them is 0, the item was <strong>definitely never added</strong>; if all are 1, it was <strong>probably</strong> added, because other items might have set those same bits by coincidence.</p>
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
        return all((self.bits &gt;&gt; p) &amp; 1 for p in self._positions(item))

bf = BloomFilter(m_bits=1000, k_hashes=3)
for i in range(100):
    bf.add(f"COUPON{i}")                       # 100 coupon codes already used
print(bf.might_contain("COUPON7"), bf.might_contain("FREEDOSA"))
print(all(bf.might_contain(f"COUPON{i}") for i in range(100)))   # never a false "no"
print("false 'maybe' out of 10000 new codes:", sum(bf.might_contain(f"NEW{i}") for i in range(10_000)))</div>
  <div class="fx" data-lang="text">True False
True
false 'maybe' out of 10000 new codes: 208</div>
  <p>A used code is found, and an unused code gets "no". All 100 used codes are found, which is guaranteed: an added item's bits are always set, so there are <strong>no false negatives</strong>. Of 10,000 codes that were never added, 208 got a false "maybe", about 2%, close to the theoretical rate (1 − e^(−kn/m))ᵏ ≈ 1.7% for k = 3 hashes, n = 100 items and m = 1000 bits. More bits per item lowers the rate. So a Bloom filter is a fast pre-check before the real lookup, not a replacement for it: "no" lets you skip the database entirely, and "maybe" means you check the database. You cannot delete from a plain Bloom filter, because clearing a bit might erase other items; a counting Bloom filter, with small counters instead of bits, fixes that. Databases such as Cassandra and RocksDB use Bloom filters to avoid reading disk blocks that cannot contain a key.</p>

  <h2 id="dsa-ad-patterns"><span class="num">09</span>When Each Is Worth It</h2>
  <p>Every structure on this page is heavier than a plain list or prefix sums, so the real skill is choosing from the constraints, and the first question is always "does the data change?" If it never changes, use prefix sums for range sums and a sparse table for range min or max. If single positions change, use a Fenwick tree for sums and counts, and a segment tree for min, max or anything without subtraction. If whole ranges change, use a segment tree with lazy tags. If every query is a window of the same width sliding by one, a monotonic deque beats them all. Questions that need sorted order with inserts ("floor", "ceiling", "next booking") want <code>bisect</code> or <code>SortedList</code>; "cache with a capacity" wants LRU or LFU; and "have we seen this?" over huge data, where a rare false "yes" is acceptable, wants a Bloom filter. And if n is around 10³ or there are only a handful of queries, the plain list is the right answer; an interviewer will ask why you wrote 40 lines.</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Structure</th><th>Skeleton</th><th>Cost</th></tr>
    <tr><td>range sum, array never changes</td><td>prefix sums</td><td><code>P[r+1] - P[l]</code></td><td>O(1) query</td></tr>
    <tr><td>range sum + "update", "mutable"</td><td>Fenwick tree</td><td><code>i += i &amp; -i</code> / <code>i -= i &amp; -i</code></td><td>O(log n) each</td></tr>
    <tr><td>"count smaller / greater after", inversions</td><td>Fenwick over ranks</td><td>walk right to left, <code>prefix(rank)</code></td><td>O(n log n)</td></tr>
    <tr><td>range min / max + updates</td><td>segment tree</td><td>outside / inside / partial</td><td>O(log n) each</td></tr>
    <tr><td>"add x to all in [l, r]" + queries</td><td>lazy segment tree</td><td>cover, tag, stop; push before going down</td><td>O(log n) each</td></tr>
    <tr><td>range min / max, data frozen</td><td>sparse table</td><td>two overlapping 2ᵏ windows</td><td>O(1) query, O(n log n) build</td></tr>
    <tr><td>"max of every window of size k"</td><td>monotonic deque</td><td>pop back while smaller; pop front when out</td><td>O(n)</td></tr>
    <tr><td>"floor / ceiling", "book intervals"</td><td>bisect / SortedList</td><td><code>bisect_left</code>, <code>insort</code></td><td>O(log n) find</td></tr>
    <tr><td>"cache", "evict least recently used"</td><td>LRU (OrderedDict)</td><td><code>move_to_end</code>, <code>popitem(last=False)</code></td><td>O(1)</td></tr>
    <tr><td>"seen before?", huge data, false "yes" OK</td><td>Bloom filter</td><td>k hashes into m bits</td><td>O(k), tiny memory</td></tr>
  </table>
  <p>For practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, a good order is: Range Sum Query – Mutable (write it with both trees), Sliding Window Maximum, LRU Cache (both versions), My Calendar I, Count of Smaller Numbers After Self, then LFU Cache and My Calendar III for the harder variants.</p>

  <h2 id="dsa-ad-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>These structures are long, and their bugs are mostly off-by-ones. The first is using index 0 in a Fenwick tree. Because <code>0 &amp; -0</code> is 0, the update walk never moves:</p>
  <div class="fx" data-lang="py">t, i, steps = [0] * 9, 0, 0
while i &lt;= 8 and steps &lt; 5:            # index 0: i &amp; -i is 0, so i never moves
    t[i] += 1
    i += i &amp; -i
    steps += 1
print("i =", i, "after", steps, "steps; t[0] =", t[0])</div>
  <div class="fx" data-lang="text">i = 0 after 5 steps; t[0] = 5</div>
  <p>Five steps later, i is still 0 and box 0 has been incremented five times; without the step limit the loop would never end. Shift to 1-based inside the class, in exactly one place. The second is treating a Fenwick tree's <code>add</code> as "set":</p>
  <div class="fx" data-lang="py">fw = Fenwick(3)
for i, x in enumerate([1, 3, 5]):
    fw.add(i, x)
fw.add(1, 2)                           # meant "set day 1 to 2", but this adds 2
print(fw.range_sum(0, 2))              # 11, not the intended 8
fw.add(1, -2); fw.add(1, 2 - 3)        # undo, then add the difference new - old
print(fw.range_sum(0, 2))</div>
  <div class="fx" data-lang="text">11
8</div>
  <p>The intent was to change position 1 from 3 to 2, so the total should drop from 9 to 8; adding 2 made it 11. A Fenwick tree only knows how to add, so to set a value you add the difference (new − old), which means you must also keep a copy of the current values. The third is using the sparse table's overlapping windows for sums:</p>
  <div class="fx" data-lang="py">rev = [5, 2, 8, 1, 4, 7, 3, 6]
l, r = 1, 6                            # length 6: two windows of 4 overlap on days 3..4
print(sum(rev[1:5]) + sum(rev[3:7]), "vs true", sum(rev[1:7]))</div>
  <div class="fx" data-lang="text">30 vs true 25</div>
  <p>Two windows of four covering days 1 to 6 overlap on days 3 and 4, so their sums add to 30 instead of 25. The overlap trick is only for idempotent operations such as min, max and gcd; static sums belong to prefix sums. Beyond these: size a recursive segment tree at 4n, not 2n; return the right identity for "no overlap" (0 for sum, +∞ for min, −∞ for max); always recompute the parent after changing a child; push lazy tags before going below a node; store indexes, not values, in a sliding-window deque; and in LFU, update <code>min_freq</code> when you empty its bucket and reset it to 1 on every insert.</p>

  <h2 id="dsa-ad-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key ideas</h3>
  <ul>
    <li><b>Range query + point update</b>: list is O(n)/O(1), prefix sums O(1)/O(n); the trees make both O(log n) by storing pre-added blocks.</li>
    <li><b>Fenwick tree</b>: box i holds the last <code>i &amp; -i</code> items ending at i (1-indexed); sums, counts, XOR only.</li>
    <li><b>Segment tree</b>: node = answer for its range, children split it in half; any associative op; root at 1, children 2v, 2v+1, size 4n.</li>
    <li><b>Lazy propagation</b>: cover, tag, stop; push before going down.</li>
    <li><b>Sparse table</b>: <code>T[k][i]</code> = min of 2ᵏ items from i; query = two overlapping windows; idempotent ops, static data.</li>
    <li><b>Monotonic deque</b>: indexes with decreasing values; each pushed and popped once, O(n).</li>
    <li><b>LRU</b> = dict + doubly linked list; <b>LFU</b> = key→freq, freq→OrderedDict, <code>min_freq</code>.</li>
    <li><b>Bloom filter</b>: "no" is always right, "yes" may be wrong; false-positive rate ≈ (1 − e^(−kn/m))ᵏ.</li>
  </ul>
  <h3>On rev = [5, 2, 8, 1, 4, 7, 3, 6]</h3>
  <table class="tbl">
    <tr><th>Structure</th><th>Result</th></tr>
    <tr><td>Prefix sums</td><td>P = [0, 5, 7, 15, 16, 20, 27, 30, 36]; fixing day 2 rewrites 6 entries</td></tr>
    <tr><td>Fenwick</td><td>t = [5, 7, 8, 16, 4, 11, 3, 36]; prefix(7) reads 7 → 6 → 4; day-2 update touches 3 → 4 → 8</td></tr>
    <tr><td>Segment tree</td><td>days 1..3 = [1..1] + [2..3] = 2 + 9 = 11</td></tr>
    <tr><td>Lazy</td><td>+2 on days 4..7: node [4..7] = 28, tag 2; days 5..6 = 14</td></tr>
    <tr><td>Sparse table</td><td>min(2..7) = min(T[2][2], T[2][4]) = min(1, 3) = 1</td></tr>
    <tr><td>Deque, k = 3</td><td>[8, 8, 8, 7, 7, 7]</td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py">def add(i, d):                 # Fenwick, i 1-based
    while i &lt;= n: t[i] += d; i += i &amp; -i
def prefix(i):                 # sum of the first i items
    s = 0
    while i &gt; 0: s += t[i]; i -= i &amp; -i
    return s

def query(v, lo, hi, l, r):    # segment tree
    if r &lt; lo or hi &lt; l: return 0           # outside: identity
    if l &lt;= lo and hi &lt;= r: return tree[v]  # inside: stored value
    mid = (lo + hi) // 2                    # partial: both children
    return query(2*v, lo, mid, l, r) + query(2*v+1, mid+1, hi, l, r)

k = log[r - l + 1]             # sparse table
ans = min(T[k][l], T[k][r - (1 &lt;&lt; k) + 1])

while dq and a[dq[-1]] &lt;= x: dq.pop()     # monotonic deque
dq.append(i)
if dq[0] &lt;= i - k: dq.popleft()</div>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Structure</th><th>Build</th><th>Query</th><th>Update</th><th>Space</th></tr>
    <tr><td>Prefix sums</td><td>O(n)</td><td>O(1)</td><td>O(n)</td><td>O(n)</td></tr>
    <tr><td>Fenwick</td><td>O(n log n)</td><td>O(log n)</td><td>O(log n)</td><td>n + 1</td></tr>
    <tr><td>Segment tree (+lazy)</td><td>O(n)</td><td>O(log n)</td><td>O(log n), range too</td><td>4n</td></tr>
    <tr><td>Sparse table</td><td>O(n log n)</td><td>O(1)</td><td>rebuild</td><td>O(n log n)</td></tr>
    <tr><td>Monotonic deque</td><td>–</td><td>O(n) for all windows</td><td>–</td><td>O(k)</td></tr>
    <tr><td>Sorted list + bisect</td><td>–</td><td>O(log n)</td><td>O(n) insert</td><td>O(n)</td></tr>
    <tr><td>LRU / LFU</td><td>–</td><td>O(1)</td><td>O(1)</td><td>O(capacity)</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Fenwick is 1-indexed inside; index 0 loops forever.</li>
    <li>Fenwick "set" = add (new − old); keep the old values.</li>
    <li>Fenwick cannot do range min/max; use a segment tree.</li>
    <li>Segment tree: 4n space, correct identity, recompute parents, push lazy tags.</li>
    <li>Sparse table: idempotent ops only, no updates.</li>
    <li>Deque stores indexes, not values.</li>
    <li>LRU put on an existing key makes it newest; LFU <code>min_freq</code> updates.</li>
    <li>No updates or tiny n → prefix sums or brute force.</li>
  </ul>

  <h2 id="dsa-ad-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use prefix sums for Range Sum Query – Mutable?</summary><div class="qa-body">Prefix sums answer a range in O(1), but a point update changes every prefix after it, which is O(n). With q updates that is O(n · q). A Fenwick or segment tree makes both the query and the update O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does box i of a Fenwick tree store, and how do query and update move?</summary><div class="qa-body">Box i (1-indexed) stores the sum of the <code>i &amp; -i</code> items ending at position i. A prefix query adds box i and moves to <code>i - (i &amp; -i)</code> until 0; an update adds to box i and moves to <code>i + (i &amp; -i)</code> until past n. Each move changes one bit, so both are O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must a Fenwick tree be 1-indexed?</summary><div class="qa-body">The walks move by <code>i &amp; -i</code>, the lowest set bit of i. For i = 0 that is 0, so the index would never change and the loop would run forever. Implementations shift caller indexes by one inside the class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe the three cases in a segment tree query.</summary><div class="qa-body">If the node's range does not overlap the query, return the identity (0 for sum, +∞ for min). If it lies fully inside the query, return its stored value without going deeper. If it overlaps partially, query both children and combine. At most a few nodes per level are visited, so a query is O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Segment tree vs Fenwick tree: when do you need the segment tree?</summary><div class="qa-body">When the operation has no inverse, such as min, max or gcd, because a Fenwick tree computes ranges as prefix(r) − prefix(l). Also when you need range updates with range queries (lazy tags) or want to search inside the tree. For plain sums and counts, the Fenwick tree is shorter and uses less memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a recursive segment tree given 4n slots?</summary><div class="qa-body">With the root at index 1 and children at 2v and 2v + 1, a perfectly balanced tree needs fewer than 2n slots only when n is a power of two. For other n the deepest level is incomplete and indexes can reach almost 4n, so 4n is the safe bound. An iterative bottom-up segment tree needs only 2n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain lazy propagation.</summary><div class="qa-body">For a range update, stop at the highest nodes fully covered by the range, update their stored value (for a sum, add x times the node's length) and record a pending tag. Before any later operation goes below such a node, push its tag to both children and clear it. Only nodes on walked paths ever get updated, so range updates and range queries both stay O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a sparse table answer range minimum in O(1), and why can't it do sums?</summary><div class="qa-body">It precomputes the minimum of every power-of-two window. Any range [l, r] is covered by two such windows of length 2ᵏ, one starting at l and one ending at r, with k = ⌊log₂(r − l + 1)⌋. They may overlap, which is harmless for idempotent operations like min, max and gcd, but a sum would count the overlap twice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Static data, 10⁶ range-minimum queries: sparse table or segment tree?</summary><div class="qa-body">Sparse table: O(n log n) build and O(1) per query, versus O(log n) per query for a segment tree. The segment tree only wins when the data changes, because a sparse table would have to be rebuilt after every update.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the sliding-window-maximum deque O(n) despite the inner while loop?</summary><div class="qa-body">Each index is pushed once and popped at most once, from either the back or the front. So the total number of pops over the whole run is at most n, and all the inner loops together cost O(n). This kind of argument is called amortised analysis.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Count of Smaller Numbers After Self: how does a Fenwick tree solve it?</summary><div class="qa-body">Compress the values to ranks 0..m−1, then walk from right to left. For each element, the number of already-seen values with a smaller rank is <code>prefix(rank)</code>; then add 1 at its rank. That gives O(n log n) instead of O(n²). Merge sort with inversion counting is the other standard solution.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design an LRU cache with O(1) get and put.</summary><div class="qa-body">Use a hash map from key to node and a doubly linked list ordered by recency, with sentinel head and tail nodes. <code>get</code> finds the node, unlinks it and appends it at the newest end. <code>put</code> updates or creates a node at the newest end and, if over capacity, removes the node after the head and deletes its key from the map. In Python, <code>OrderedDict</code> with <code>move_to_end</code> and <code>popitem(last=False)</code> does the same.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does an LFU cache keep eviction O(1)?</summary><div class="qa-body">Keep key → frequency, frequency → OrderedDict of keys in recency order, and <code>min_freq</code>. Evict with <code>buckets[min_freq].popitem(last=False)</code>. When a use moves a key from bucket f to f + 1 and empties bucket f, and f was <code>min_freq</code>, set <code>min_freq = f + 1</code>; a new key always sets it to 1. No search for the minimum is ever needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Python has no TreeMap. What do you use for floor/ceiling lookups with inserts?</summary><div class="qa-body">A sorted list with <code>bisect</code>: O(log n) search and O(n) insert, which is fine up to about 10⁵ items. <code>sortedcontainers.SortedList</code> gives about O(log n) for everything and is available on LeetCode. If only the minimum or maximum is needed, a heap is enough.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a skip list achieve O(log n) search on a linked list?</summary><div class="qa-body">Each node is promoted to higher "express" levels by coin flips, so each level has about half the nodes of the one below. A search moves right on the highest level until the next node would overshoot, then drops a level, so it skips large stretches. The expected cost is O(log n) for search, insert and delete, without the rotations of balanced trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A Bloom filter says "maybe present". What do you do? What if it says "not present"?</summary><div class="qa-body">"Maybe" can be a false positive, so check the real store. "Not present" is always correct, because Bloom filters have no false negatives, so you can skip the expensive lookup. The false-positive rate is about (1 − e^(−kn/m))ᵏ and drops as you give it more bits per item.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose between these structures in an interview?</summary><div class="qa-body">Ask whether the data changes and which operation is needed. No changes: prefix sums for sums, a sparse table for min/max. Point updates: Fenwick for sums and counts, segment tree for anything else. Range updates: lazy segment tree. Fixed-width sliding windows: monotonic deque. Small n: brute force. Always state the simple solution first and upgrade only when the constraints require it.</div></details>
</main>
`
});
