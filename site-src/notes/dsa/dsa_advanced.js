// notes/dsa/dsa_advanced.js — Advanced Data Structures
Object.assign(TOPIC_CONTENT, {
  "dsa_advanced": `<main>
<h1>Advanced Data Structures</h1>
  <p class="lead">Lists, dicts and heaps cover most problems. This note is for the rest: "sum of a range while values keep changing", "minimum of any range, instantly", "a cache that throws out the least recently used item". Segment trees, Fenwick trees, sparse tables, LRU/LFU caches, sorted containers, skip lists and Bloom filters. Builds on arrays, prefix sums, trees, binary search and the bit tricks note.</p>

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
      <div class="rm-item rm-done" data-target="dsa-ad-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When Basics Are Not Enough</span><span class="rm-sub">Range queries with updates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-seg"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Segment Tree</span><span class="rm-sub">Build, query, update</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-lazy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Lazy Propagation</span><span class="rm-sub">Range updates with IOUs</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-bit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Fenwick Tree (BIT)</span><span class="rm-sub">Prefix sums in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-sparse"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Sparse Table</span><span class="rm-sub">O(1) range minimum</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-cache"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">LRU &amp; LFU Caches</span><span class="rm-sub">OrderedDict and buckets</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-sorted"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sorted Containers &amp; Deque</span><span class="rm-sub">bisect, SortedList, monotonic deque</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-prob"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Skip Lists &amp; Bloom Filters</span><span class="rm-sub">Randomness and "maybe"</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Choosing the Structure</span><span class="rm-sub">Signal words and a decision table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-problems"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">5 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Indexing, stale state, wrong tool</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ad-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ad-need"><span class="num">01</span>When Basics Are Not Enough</h2>
  <p>A kirana shop keeps a ledger of daily sales. The owner keeps asking "total sales from day 10 to day 40?" And the accountant keeps correcting old days: "day 17 was actually ₹5,200". Two operations, both frequent: <strong>range query</strong> and <strong>point update</strong>.</p>
  <table class="tbl">
    <tr><th>Approach</th><th>Update one day</th><th>Sum of a range</th><th>Problem</th></tr>
    <tr><td>Plain list</td><td>O(1)</td><td>O(n) add up the range</td><td>Every question scans</td></tr>
    <tr><td>Prefix sums</td><td>O(n) fix every later prefix</td><td>O(1)</td><td>Every correction rewrites</td></tr>
    <tr><td><strong>Segment tree / Fenwick tree</strong></td><td><strong>O(log n)</strong></td><td><strong>O(log n)</strong></td><td>Both fast</td></tr>
  </table>
  <p>With 10⁵ days and 10⁵ mixed operations, the first two rows are about 10¹⁰ steps. The tree rows are about 3.4 million. That gap is why these structures exist.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Both trees store <strong>pre-added blocks</strong>. A query glues together a few blocks (log n of them). An update fixes only the blocks that contain the changed day (also log n). Prefix sums are the extreme where every block starts at day 0, so one change touches everything.</p>
  </div>
  <p>Where you meet it: leaderboards and rank queries, time-series dashboards ("revenue between two dates" with late corrections), computational geometry, competitive programming, and interview follow-ups like "now the array can change".</p>

  <h2 id="dsa-ad-seg"><span class="num">02</span>Segment Tree</h2>
  <p>Picture a school's marks register. The principal wants totals for any range of roll numbers. Each class teacher keeps her section's total, each house captain keeps the total of two sections, and the principal keeps the school total. Ask for "roll 1 to 3" and you add up a few totals that exactly cover that range.</p>
  <p>A <strong>segment tree</strong> is that hierarchy. The root covers the whole array. Every node splits its range in half for its two children. Leaves are single elements. Each node stores the answer (sum, min, max …) for its range.</p>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600"><line x1="75" y1="178" x2="38" y2="206" stroke="currentColor"/><line x1="75" y1="178" x2="112" y2="206" stroke="currentColor"/><line x1="150" y1="116" x2="75" y2="144" stroke="currentColor"/><line x1="150" y1="116" x2="225" y2="144" stroke="currentColor"/><line x1="375" y1="178" x2="338" y2="206" stroke="currentColor"/><line x1="375" y1="178" x2="412" y2="206" stroke="currentColor"/><line x1="450" y1="116" x2="375" y2="144" stroke="currentColor"/><line x1="450" y1="116" x2="525" y2="144" stroke="currentColor"/><line x1="300" y1="54" x2="150" y2="82" stroke="currentColor"/><line x1="300" y1="54" x2="450" y2="82" stroke="currentColor"/><rect x="266" y="20" width="68" height="34" rx="6" class="fb sb"/><text x="300" y="35" text-anchor="middle" class="tm" font-size="10">[0..5]</text><text x="300" y="49" text-anchor="middle">27</text><rect x="116" y="82" width="68" height="34" rx="6" class="fb sb"/><text x="150" y="97" text-anchor="middle" class="tm" font-size="10">[0..2]</text><text x="150" y="111" text-anchor="middle">15</text><rect x="41" y="144" width="68" height="34" rx="6" class="fb sb"/><text x="75" y="159" text-anchor="middle" class="tm" font-size="10">[0..1]</text><text x="75" y="173" text-anchor="middle">7</text><rect x="4" y="206" width="68" height="34" rx="6" class="fs"/><text x="38" y="221" text-anchor="middle" class="tm" font-size="10">[0]</text><text x="38" y="235" text-anchor="middle">5</text><rect x="78" y="206" width="68" height="34" rx="6" class="fg sg"/><text x="112" y="221" text-anchor="middle" class="tm" font-size="10">[1]</text><text x="112" y="235" text-anchor="middle">2</text><rect x="191" y="144" width="68" height="34" rx="6" class="fg sg"/><text x="225" y="159" text-anchor="middle" class="tm" font-size="10">[2]</text><text x="225" y="173" text-anchor="middle">8</text><rect x="416" y="82" width="68" height="34" rx="6" class="fb sb"/><text x="450" y="97" text-anchor="middle" class="tm" font-size="10">[3..5]</text><text x="450" y="111" text-anchor="middle">12</text><rect x="341" y="144" width="68" height="34" rx="6" class="fb sb"/><text x="375" y="159" text-anchor="middle" class="tm" font-size="10">[3..4]</text><text x="375" y="173" text-anchor="middle">5</text><rect x="304" y="206" width="68" height="34" rx="6" class="fg sg"/><text x="338" y="221" text-anchor="middle" class="tm" font-size="10">[3]</text><text x="338" y="235" text-anchor="middle">1</text><rect x="378" y="206" width="68" height="34" rx="6" class="fs"/><text x="412" y="221" text-anchor="middle" class="tm" font-size="10">[4]</text><text x="412" y="235" text-anchor="middle">4</text><rect x="491" y="144" width="68" height="34" rx="6" class="fs"/><text x="525" y="159" text-anchor="middle" class="tm" font-size="10">[5]</text><text x="525" y="173" text-anchor="middle">7</text><text x="10" y="266" class="tg">green = fully inside [1..3], answer = 2 + 8 + 1 = 11</text><text x="590" y="266" text-anchor="end" class="tb">blue = partly inside, split</text></svg><figcaption>Segment tree for [5, 2, 8, 1, 4, 7]. Each box shows its range and its sum. query(1, 3) visits the blue nodes and adds the green ones: 2 + 8 + 1 = 11.</figcaption></figure>
  <p>A query compares each node's range with the asked range [l, r]. Three cases:</p>
  <ul>
    <li><strong>No overlap</strong>: return 0 (the "nothing" value for sums).</li>
    <li><strong>Fully inside</strong>: return the stored value; do not go deeper.</li>
    <li><strong>Partial</strong>: ask both children and combine.</li>
  </ul>
  <p>At each level at most two nodes are partial, so a query touches O(log n) nodes. An update walks from the root down to one leaf and fixes every sum on the way back up: also O(log n).</p>
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

    def query(self, l, r, v=1, lo=0, hi=None):
        """Sum of nums[l..r], both inclusive."""
        if hi is None:
            hi = self.n - 1
        if r &lt; lo or hi &lt; l:                    # no overlap
            return 0
        if l &lt;= lo and hi &lt;= r:                 # node fully inside [l, r]
            return self.tree[v]
        mid = (lo + hi) // 2                    # partial overlap: ask both children
        return (self.query(l, r, 2 * v, lo, mid) +
                self.query(l, r, 2 * v + 1, mid + 1, hi))

st = SegmentTree([5, 2, 8, 1, 4, 7])
print(st.query(0, 5), st.query(1, 3), st.query(4, 4))
st.update(2, 3)                                 # 8 -&gt; 3
print(st.query(0, 5), st.query(1, 3))</div>
  <div class="fx" data-lang="text">27 11 4
22 6</div>
  <p>The same layout trick as heaps: node v has children 2v and 2v+1 (root at index 1 here). Why 4n slots? The tree is not always perfectly full; 4n is a safe upper bound. Swap <code>+</code> for <code>min</code> and 0 for <code>float("inf")</code> to get a range-minimum tree.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>Reason</th></tr>
    <tr><td>build</td><td>O(n)</td><td>About 2n nodes, each computed once</td></tr>
    <tr><td>query(l, r)</td><td>O(log n)</td><td>At most ~4 nodes per level, log n levels</td></tr>
    <tr><td>point update</td><td>O(log n)</td><td>One root-to-leaf path</td></tr>
    <tr><td>range update (lazy)</td><td>O(log n)</td><td>See next section</td></tr>
    <tr><td>space</td><td>O(n)</td><td>4n list</td></tr>
  </table>

  <h2 id="dsa-ad-lazy"><span class="num">03</span>Lazy Propagation</h2>
  <p>New request: "add ₹100 to every day from 10 to 40". Updating 31 leaves one by one is O(n log n). Lazy propagation makes it O(log n).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school announces "+5 grace marks for everyone in sections A to D". The principal does not visit every student. She updates the section totals and leaves a note with each section teacher: "you owe each student +5". The teacher passes the note down only when someone actually asks about a single student. That note is the <strong>lazy tag</strong>.</p>
  </div>
  <p>Rules: when an update fully covers a node, fix its sum (add x × length) and record <code>lazy[v] += x</code>; stop there. Before going into a node's children for any later query or update, <strong>push</strong> the pending tag down to both children and clear it.</p>
  <p>Tiny example on 8 cells: "add 10 to cells 0..7" touches only the root: its sum grows by 80 and it gets <code>lazy = 10</code>. Nothing below changes yet. Later, "sum of cells 2..3" has to go below the root, so the root first hands +10 to both children (each sum grows by 40, each gets the tag) and clears its own tag. Only the nodes on the paths you actually walk ever receive the IOU. You rarely write this in an interview, but you should be able to explain it in two sentences: "cover, tag, stop" and "push before you go down".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to push before recursing. Then a child's sum is out of date, and the parent recomputed from children (<code>sum[v] = left + right</code>) silently loses the pending add.</p>
  </div>

  <h2 id="dsa-ad-bit"><span class="num">04</span>Fenwick Tree (BIT)</h2>
  <p>A <strong>Fenwick tree</strong> (also called a <strong>Binary Indexed Tree</strong>, BIT) does prefix sums with updates in O(log n), like a segment tree, but in about 10 lines and n + 1 slots. The trick is how blocks are chosen: box i stores the sum of the last <code>i &amp; -i</code> elements ending at i (1-indexed). <code>i &amp; -i</code> is the lowest set bit of i, from the Bit Manipulation note.</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600"><text x="91" y="18" text-anchor="middle" class="tm">i=1</text><rect x="62" y="26" width="58" height="28" class="fs"/><text x="91" y="45" text-anchor="middle">5</text><text x="153" y="18" text-anchor="middle" class="tm">i=2</text><rect x="124" y="26" width="58" height="28" class="fs"/><text x="153" y="45" text-anchor="middle">2</text><text x="215" y="18" text-anchor="middle" class="tm">i=3</text><rect x="186" y="26" width="58" height="28" class="fs"/><text x="215" y="45" text-anchor="middle">8</text><text x="277" y="18" text-anchor="middle" class="tm">i=4</text><rect x="248" y="26" width="58" height="28" class="fs"/><text x="277" y="45" text-anchor="middle">1</text><text x="339" y="18" text-anchor="middle" class="tm">i=5</text><rect x="310" y="26" width="58" height="28" class="fs"/><text x="339" y="45" text-anchor="middle">4</text><text x="401" y="18" text-anchor="middle" class="tm">i=6</text><rect x="372" y="26" width="58" height="28" class="fs"/><text x="401" y="45" text-anchor="middle">7</text><text x="463" y="18" text-anchor="middle" class="tm">i=7</text><rect x="434" y="26" width="58" height="28" class="fs"/><text x="463" y="45" text-anchor="middle">3</text><text x="525" y="18" text-anchor="middle" class="tm">i=8</text><rect x="496" y="26" width="58" height="28" class="fs"/><text x="525" y="45" text-anchor="middle">6</text><text x="8" y="45" class="tm">nums</text><rect x="62" y="70" width="58" height="26" rx="5" class="ft st"/><text x="91" y="87" text-anchor="middle" font-size="10">t[1] = 5</text><rect x="62" y="104" width="120" height="26" rx="5" class="fb sb"/><text x="122" y="121" text-anchor="middle" font-size="10">t[2] = 7</text><rect x="186" y="70" width="58" height="26" rx="5" class="ft st"/><text x="215" y="87" text-anchor="middle" font-size="10">t[3] = 8</text><rect x="62" y="138" width="244" height="26" rx="5" class="fv sb"/><text x="184" y="155" text-anchor="middle" font-size="10">t[4] = 16</text><rect x="310" y="70" width="58" height="26" rx="5" class="ft st"/><text x="339" y="87" text-anchor="middle" font-size="10">t[5] = 4</text><rect x="310" y="104" width="120" height="26" rx="5" class="fb sb"/><text x="370" y="121" text-anchor="middle" font-size="10">t[6] = 11</text><rect x="434" y="70" width="58" height="26" rx="5" class="ft st"/><text x="463" y="87" text-anchor="middle" font-size="10">t[7] = 3</text><rect x="62" y="172" width="492" height="26" rx="5" class="fg sg"/><text x="308" y="189" text-anchor="middle" font-size="10">t[8] = 36</text><text x="8" y="87" class="tm">len 1</text><text x="8" y="121" class="tm">len 2</text><text x="8" y="155" class="tm">len 4</text><text x="8" y="189" class="tm">len 8</text><text x="300" y="222" text-anchor="middle">prefix(7) = t[7] + t[6] + t[4]   (7 → 6 → 4 → 0 by i -= i &amp; -i)</text></svg><figcaption>Box i covers a block of length (i &amp; −i) ending at i. Odd i covers 1 item, 2 and 6 cover 2, 4 covers 4, 8 covers 8. A prefix sum hops left by dropping the lowest bit each time.</figcaption></figure>
  <ul>
    <li><strong>prefix(i)</strong>: add box i, then jump to <code>i - (i &amp; -i)</code>, the box just left of this block. Stop at 0. 7 → 6 → 4 → 0: three boxes.</li>
    <li><strong>add(i, delta)</strong>: add to box i, then jump to <code>i + (i &amp; -i)</code>, the next bigger box that also covers i. 3 → 4 → 8.</li>
  </ul>
  <p>Each jump changes one bit, so there are at most log₂ n jumps.</p>
  <div class="fx" data-lang="py">class Fenwick:
    """1-indexed inside. add(i, delta) and prefix(i) = sum of nums[0..i-1]."""

    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, delta):            # i is 0-based for the caller
        i += 1
        while i &lt;= self.n:
            self.t[i] += delta
            i += i &amp; -i                 # jump to the next box that covers i

    def prefix(self, i):                # sum of the first i elements
        s = 0
        while i &gt; 0:
            s += self.t[i]
            i -= i &amp; -i                 # drop the lowest 1 bit: next box to the left
        return s

    def range_sum(self, l, r):          # inclusive, 0-based
        return self.prefix(r + 1) - self.prefix(l)

nums = [5, 2, 8, 1, 4, 7]
fw = Fenwick(len(nums))
for i, x in enumerate(nums):
    fw.add(i, x)
print(fw.t[1:])                         # each box holds a block ending at its index
print(fw.prefix(6), fw.range_sum(1, 3))
fw.add(2, 3 - 8)                        # set nums[2] = 3: add the difference
print(fw.prefix(6), fw.range_sum(1, 3))</div>
  <div class="fx" data-lang="text">[5, 7, 8, 16, 4, 11]
27 11
22 6</div>
  <p>Box 4 holds 5 + 2 + 8 + 1 = 16, box 6 holds 4 + 7 = 11. To <em>set</em> a value, add the difference (new − old). Same answers as the segment tree above.</p>
  <div class="cards">
    <div><b>Segment tree</b><p>Any associative merge (sum, min, max, gcd), range updates with lazy tags, can search inside the tree.</p><small>~40 lines, 4n space</small></div>
    <div><b>Fenwick tree</b><p>Sums, counts, XOR: things you can "subtract" to get a range. Tiny and fast.</p><small>~10 lines, n + 1 space</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Off-by-one: the tree is 1-indexed because index 0 has no lowest bit (<code>0 &amp; -0 = 0</code>, an infinite loop). Convert with <code>i += 1</code> in exactly one place, as in <code>add</code> above.</p>
  </div>

  <h2 id="dsa-ad-sparse"><span class="num">05</span>Sparse Table</h2>
  <p>If the array <strong>never changes</strong> and you need range minimum (or maximum, or gcd) many times, you can answer in O(1). Precompute the min of every window whose length is a power of two: <code>table[k][i]</code> = min of 2ᵏ items starting at i. Each level is built from the one below: two halves of length 2ᵏ⁻¹.</p>
  <p>Query [l, r]: let k be the largest power with 2ᵏ ≤ length. Two windows of length 2ᵏ, one starting at l and one ending at r, cover the range. They may overlap, but for min that does not matter (min(a, a) = a).</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600"><rect x="60" y="14" width="56" height="32" class="fs"/><text x="88" y="35" text-anchor="middle">4</text><text x="88" y="60" text-anchor="middle" class="tm">0</text><rect x="120" y="14" width="56" height="32" class="fb sb"/><text x="148" y="35" text-anchor="middle">6</text><text x="148" y="60" text-anchor="middle" class="tm">1</text><rect x="180" y="14" width="56" height="32" class="fb sb"/><text x="208" y="35" text-anchor="middle">1</text><text x="208" y="60" text-anchor="middle" class="tm">2</text><rect x="240" y="14" width="56" height="32" class="fb sb"/><text x="268" y="35" text-anchor="middle">5</text><text x="268" y="60" text-anchor="middle" class="tm">3</text><rect x="300" y="14" width="56" height="32" class="fb sb"/><text x="328" y="35" text-anchor="middle">7</text><text x="328" y="60" text-anchor="middle" class="tm">4</text><rect x="360" y="14" width="56" height="32" class="fb sb"/><text x="388" y="35" text-anchor="middle">3</text><text x="388" y="60" text-anchor="middle" class="tm">5</text><rect x="420" y="14" width="56" height="32" class="fb sb"/><text x="448" y="35" text-anchor="middle">8</text><text x="448" y="60" text-anchor="middle" class="tm">6</text><rect x="480" y="14" width="56" height="32" class="fs"/><text x="508" y="35" text-anchor="middle">2</text><text x="508" y="60" text-anchor="middle" class="tm">7</text><rect x="120" y="72" width="236" height="22" rx="5" class="fg sg"/><text x="238" y="88" text-anchor="middle">min[1..4] = 1</text><rect x="240" y="100" width="236" height="22" rx="5" class="ft st"/><text x="358" y="116" text-anchor="middle">min[3..6] = 3</text><text x="300" y="144" text-anchor="middle">query(1, 6): length 6, k = 2 → two windows of 4 overlap → min(1, 3) = 1</text></svg><figcaption>Range [1..6] has length 6. Two windows of length 4 overlap in the middle and together cover it exactly. Works for min, max, gcd; not for sum (the overlap would be counted twice).</figcaption></figure>
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

sp = SparseTable([4, 6, 1, 5, 7, 3, 8, 2])
for row in sp.table:
    print(row)
print(sp.query(0, 7), sp.query(3, 6), sp.query(4, 4), sp.query(0, 1))</div>
  <div class="fx" data-lang="text">[4, 6, 1, 5, 7, 3, 8, 2]
[4, 1, 1, 5, 3, 3, 2]
[1, 1, 1, 3, 2]
[1]
1 3 7 4</div>
  <p>Build O(n log n) time and space, query O(1). Any update means rebuilding, so this is only for static data. Used for LCA (lowest common ancestor) in trees and in suffix-array algorithms.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RMQ</strong> (Range Minimum Query): given l, r, return the smallest value in that range. An operation is <strong>idempotent</strong> if applying it twice to the same item changes nothing (min, max, gcd, AND, OR). Sparse tables need idempotent operations.</p>
  </div>

  <h2 id="dsa-ad-cache"><span class="num">06</span>LRU &amp; LFU Caches</h2>
  <p>Your phone's "recent apps" list keeps the apps you used most recently. When memory runs out, the app you have not touched for the longest time is closed. That is <strong>LRU</strong>: Least Recently Used eviction. Browsers, databases, CDNs and Python's <code>functools.lru_cache</code> all use it.</p>
  <p>We need three things in O(1): look up a key, mark it as "just used", and find the oldest. A dict gives lookup. A <strong>doubly linked list</strong> ordered by recency gives "move to the newest end" and "remove the oldest" in O(1), as long as the dict points straight at the list node.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="ad-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><rect x="20" y="20" width="130" height="150" rx="8" class="fv sb"/><text x="85" y="40" text-anchor="middle" class="tb">dict</text><text x="85" y="75" text-anchor="middle">k=2 → node</text><text x="85" y="111" text-anchor="middle">k=7 → node</text><text x="85" y="147" text-anchor="middle">k=4 → node</text><rect x="175" y="95" width="80" height="36" rx="6" class="fs"/><text x="215" y="118" text-anchor="middle">head</text><line x1="257" y1="107" x2="273" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="273" y1="120" x2="257" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="275" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="315" y="118" text-anchor="middle">2:B</text><line x1="357" y1="107" x2="373" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="373" y1="120" x2="357" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="375" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="415" y="118" text-anchor="middle">7:Q</text><line x1="457" y1="107" x2="473" y2="107" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><line x1="473" y1="120" x2="457" y2="120" class="sb" stroke-width="1.5" marker-end="url(#ad-a1)"/><rect x="475" y="95" width="80" height="36" rx="6" class="fb sb"/><text x="515" y="118" text-anchor="middle">4:Z</text><text x="315" y="85" text-anchor="middle" class="tr">oldest: evict here</text><text x="515" y="85" text-anchor="middle" class="tg">newest</text><text x="380" y="160" text-anchor="middle" class="tm">get/put: unlink node, re-attach at newest end: O(1)</text><text x="380" y="185" text-anchor="middle" class="tm">OrderedDict = this dict + linked list, built in</text></svg><figcaption>LRU = a dict for finding nodes plus a doubly linked list for order. Python's OrderedDict is this combination, already built.</figcaption></figure>
  <div class="fx" data-lang="py">from collections import OrderedDict

od = OrderedDict()
for k in "abc":
    od[k] = k.upper()
od.move_to_end("a")                    # a was used: make it the newest
print(list(od))
print(od.popitem(last=False))          # remove the oldest
print(list(od))</div>
  <div class="fx" data-lang="text">['b', 'c', 'a']
('b', 'B')
['c', 'a']</div>
  <p><code>move_to_end(key)</code> marks a key as newest, <code>popitem(last=False)</code> removes the oldest. Both O(1). Full LRU solutions are in problem 3.</p>
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

  <h2 id="dsa-ad-sorted"><span class="num">07</span>Sorted Containers &amp; Deque</h2>
  <h3>bisect on a sorted list</h3>
  <p>Python has no built-in balanced tree (no TreeMap like Java). The usual stand-in is a plain sorted list with <code>bisect</code> (see the Binary Search note): finding is O(log n), inserting shifts items so it is O(n). For n up to ~10⁵ with mostly reads, this is fast enough because the shift is a fast C memmove.</p>
  <div class="fx" data-lang="py">import bisect

scores = []
for s in [50, 20, 80, 20, 65]:
    bisect.insort(scores, s)           # O(log n) to find, O(n) to shift
print(scores)
print(bisect.bisect_left(scores, 20), bisect.bisect_right(scores, 20))   # count of 20s = 3 - 1
print(scores[bisect.bisect_left(scores, 60)])                           # smallest score &gt;= 60
i = bisect.bisect_right(scores, 60) - 1
print(scores[i])                                                        # largest score &lt;= 60</div>
  <div class="fx" data-lang="text">[20, 20, 50, 65, 80]
0 2
65
50</div>
  <h3>sortedcontainers.SortedList</h3>
  <p>The third-party <code>sortedcontainers</code> package (available on LeetCode, not in the standard library) gives <code>SortedList</code>, <code>SortedDict</code> and <code>SortedSet</code> with about O(log n) add/remove and index access. It is a list of small sorted lists, not a tree, and it is the Python answer to TreeMap. Typical calls: <code>sl.add(x)</code>, <code>sl.remove(x)</code>, <code>sl.bisect_left(x)</code>, <code>sl[0]</code>, <code>sl[-1]</code>. In an interview, say you would use it, and fall back to bisect or a heap if it is not allowed.</p>
  <h3>Monotonic deque recap</h3>
  <p>For "maximum of every window of size k", keep a deque of indexes whose values are decreasing. A new value removes every smaller value from the back (they can never be a window's max again, because the new one is bigger and stays longer). The front is the current max; drop it when it slides out. Each index is pushed and popped once, so O(n) total. Full code in problem 4; the Stacks &amp; Queues note covers monotonic stacks.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A queue for the tallest-person photo. When a taller person joins at the back, everyone shorter in front of them leaves: they will never be the tallest while this person is in the queue. The front is always the tallest in the window.</p>
  </div>

  <h2 id="dsa-ad-prob"><span class="num">08</span>Skip Lists &amp; Bloom Filters</h2>
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

  <h2 id="dsa-ad-patterns"><span class="num">09</span>Choosing the Structure</h2>
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

  <h2 id="dsa-ad-problems"><span class="num">10</span>Classic Problems</h2>
  <h3>1. Range Sum Query – Mutable</h3>
  <p>Support <code>update(i, val)</code> and <code>sumRange(l, r)</code>, up to 3·10⁴ calls each. Plain list or prefix sums give O(n) on one side and time out. Both trees give O(log n) for both. Here are both, as thin wrappers over the classes from sections 02 and 04.</p>
  <div class="fx" data-lang="py">class NumArraySeg:
    def __init__(self, nums):
        self.st = SegmentTree(nums)            # the class from section 02

    def update(self, index, val):
        self.st.update(index, val)

    def sumRange(self, left, right):
        return self.st.query(left, right)

class NumArrayBIT:
    def __init__(self, nums):
        self.nums = nums[:]
        self.fw = Fenwick(len(nums))           # the class from section 04
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

for nums, k in [([1, 3, -1, -3, 5, 3, 6, 7], 3), ([1], 1), ([9, 8, 7, 6], 2), ([1, 2, 3, 4], 4)]:
    print(nums, k, "-&gt;", max_sliding_window(nums, k))</div>
  <div class="fx" data-lang="text">[1, 3, -1, -3, 5, 3, 6, 7] 3 -&gt; [3, 3, 5, 5, 6, 7]
[1] 1 -&gt; [1]
[9, 8, 7, 6] 2 -&gt; [9, 8, 7]
[1, 2, 3, 4] 4 -&gt; [4]</div>
  <p>Store indexes, not values, so you can tell when the front has left the window. O(n) time, O(k) space.</p>

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

  <h2 id="dsa-ad-traps"><span class="num">11</span>Common Mistakes</h2>
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

  <h2 id="dsa-ad-qa"><span class="num">12</span>Questions &amp; Answers</h2>
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
</main>
`
});
