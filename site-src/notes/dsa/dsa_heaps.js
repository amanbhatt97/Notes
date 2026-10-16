// notes/dsa/dsa_heaps.js — Heaps & Priority Queue
Object.assign(TOPIC_CONTENT, {
  "dsa_heaps": `<main>
  <h1>Heaps &amp; Priority Queue</h1>
  <p class="lead">A heap is a list that always knows its smallest (or biggest) item, and keeps knowing it after every insert and remove. It powers Python's <code>heapq</code>, "top-k" questions, streaming medians and Dijkstra. Builds on lists and trees.</p>

  <h2 id="dsa-hp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Heaps &amp; Priority Queue</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Priority queue</b> — "give me the most urgent item next", not the oldest</li>
          <li><b>Heap</b> — the usual way to build one; a complete binary tree with parent ≤ children (min-heap)</li>
          <li><b>Only promise</b> — the root is the min; the rest is NOT sorted</li>
          <li>💡 Hospital emergency room: heart attack goes before a fever, whoever came first</li>
          <li><b>Why not a list?</b> sorted list insert O(n); unsorted list find-min O(n); heap does both O(log n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stored in a list</div>
        <ul>
          <li><b>Children of i</b> — <code>2i+1</code>, <code>2i+2</code> · <b>parent</b> — <code>(i-1)//2</code></li>
          <li><b>Complete tree</b> — every level full except the last, filled left to right → no gaps in the list</li>
          <li><b>push</b> — append at end, sift up (swap with parent while smaller)</li>
          <li><b>pop</b> — take root, move last to root, sift down (swap with smaller child)</li>
          <li><b>Height</b> — log₂ n, so each sift is O(log n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Big-O</div>
        <ul>
          <li><b>peek</b> <code>h[0]</code> — O(1)</li>
          <li><b>push / pop</b> — O(log n)</li>
          <li><b>heapify</b> — O(n), not O(n log n)</li>
          <li><b>search / delete arbitrary</b> — O(n); use lazy deletion instead</li>
          <li><b>k pops</b> — O(k log n); <b>nlargest(k)</b> — O(n log k)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">heapq (min-heap only)</div>
        <ul>
          <li><code>heappush(h, x)</code>, <code>heappop(h)</code>, <code>h[0]</code> peek</li>
          <li><code>heapify(lst)</code> in place · <code>nlargest / nsmallest(k, it, key=)</code></li>
          <li><code>heappushpop</code> (push then pop) · <code>heapreplace</code> (pop then push)</li>
          <li><b>Max-heap trick</b> — push <code>-x</code>, read <code>-h[0]</code></li>
          <li><b>Priorities</b> — push tuples <code>(priority, tiebreak, item)</code></li>
          <li>⚠ Tuples with equal priority compare the next field — dicts/objects crash; add a counter</li>
          <li>⚠ <code>h</code> is a plain list; never <code>h.append</code> or sort it between heap calls</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Top-k</b> — keep a heap of size k of the opposite kind (min-heap for k largest); O(n log k)</li>
          <li><b>Signal words</b> — "k largest / smallest / closest / most frequent", "stream", "running"</li>
          <li><b>Two heaps</b> — max-heap for lower half, min-heap for upper half → median in O(1)</li>
          <li><b>k-way merge</b> — heap of one head per list; pop min, push its successor</li>
          <li><b>Scheduling / greedy</b> — always take the current best (Dijkstra, task scheduler, meeting rooms)</li>
          <li>⚠ Sorting whole input is O(n log n); heap of size k wins when k ≪ n</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Kth Largest</b> — min-heap size k; answer <code>h[0]</code></li>
          <li><b>Top K Frequent</b> — Counter + <code>nlargest(k, key=count.get)</code>; bucket sort is O(n)</li>
          <li><b>Merge K Sorted Lists</b> — heap of (val, i, node); O(N log k)</li>
          <li><b>Median from Stream</b> — two heaps, rebalance so sizes differ by ≤ 1</li>
          <li><b>K Closest Points</b> — max-heap on distance², size k</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-hp-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Emergency Queue</span><span class="rm-sub">Most urgent first, not oldest first</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-tree"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">A Tree Inside a List</span><span class="rm-sub">Children at 2i+1 and 2i+2</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-ops"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Push &amp; Pop Step by Step</span><span class="rm-sub">Sift up, sift down</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-impl"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Build One From Scratch</span><span class="rm-sub">30 lines of Python + Big-O table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-heapq"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Python's heapq</span><span class="rm-sub">Min-heap, max-heap trick, heapify, nlargest</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-patterns"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Top-k, two heaps, k-way merge</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-problems"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">5 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Ties, plain-list edits, wrong heap kind</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-hp-need"><span class="num">01</span>The Emergency Queue</h2>
  <p>A government hospital emergency room. Patients keep arriving. A fever came at 9:00, a broken arm at 9:10, a heart attack at 9:20. The doctor must not take them in arrival order. She must always take the <strong>most serious</strong> one next.</p>
  <p>That is a <strong>priority queue</strong>: a bag of items where "next" means "the most urgent", not "the oldest". A normal queue (ration-shop line) gives the oldest. A priority queue gives the one with the best priority number.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The triage nurse gives every patient a card with a number: 1 = critical, 2 = serious, 3 = can wait. The doctor only ever asks one question: "who has the smallest number right now?" New patients can arrive any time. The nurse must answer that question fast, every time.</p>
  </div>
  <p>Why not just keep a Python list?</p>
  <table class="tbl">
    <tr><th>Store patients as</th><th>Add a patient</th><th>Find the most urgent</th><th>Problem</th></tr>
    <tr><td>Unsorted list</td><td>O(1) append</td><td>O(n) scan the whole list</td><td>Every "next patient" is a full scan</td></tr>
    <tr><td>Sorted list</td><td>O(n) shift items to insert</td><td>O(1) first item</td><td>Every arrival shifts the line</td></tr>
    <tr><td><strong>Heap</strong></td><td><strong>O(log n)</strong></td><td><strong>O(1) peek, O(log n) remove</strong></td><td>Both fast. That is the whole point.</td></tr>
  </table>
  <p>A <strong>heap</strong> is the usual way to build a priority queue. It keeps the items "half sorted": just enough order that the best one is always at the front, without paying for a full sort.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Min-heap</strong>: a tree where every parent is ≤ its children. So the root is the smallest item. <strong>Max-heap</strong>: every parent ≥ its children, root is the biggest. Nothing else is promised: brothers and cousins can be in any order.</p>
  </div>
  <p>Where you meet it: <code>heapq</code> in Python, the task scheduler in an OS, Dijkstra shortest path (Google Maps), "top 10 trending" on any feed, merging sorted files in a data pipeline, and a very common interview topic ("find the k largest").</p>

  <h2 id="dsa-hp-tree"><span class="num">02</span>A Tree Inside a List</h2>
  <p>A heap is a <strong>complete binary tree</strong>: every level is full except maybe the last, and the last is filled from the left. Because there are no gaps, the tree can be stored in a plain list, level by level. No node objects, no pointers.</p>
  <figure class="viz"><svg viewBox="0 0 600 262" width="600"><line x1="300" y1="30" x2="220" y2="92" stroke="currentColor" /><line x1="300" y1="30" x2="380" y2="92" stroke="currentColor" /><line x1="220" y1="92" x2="180" y2="154" stroke="currentColor" /><line x1="220" y1="92" x2="260" y2="154" stroke="currentColor" /><line x1="380" y1="92" x2="340" y2="154" stroke="currentColor" /><circle cx="300" cy="30" r="17" class="fb sb"/><text x="300" y="34" text-anchor="middle">1</text><text x="300" y="61" text-anchor="middle" class="tm">i=0</text><circle cx="220" cy="92" r="17" class="fb sb"/><text x="220" y="96" text-anchor="middle">3</text><text x="220" y="123" text-anchor="middle" class="tm">i=1</text><circle cx="380" cy="92" r="17" class="fb sb"/><text x="380" y="96" text-anchor="middle">2</text><text x="380" y="123" text-anchor="middle" class="tm">i=2</text><circle cx="180" cy="154" r="17" class="fb sb"/><text x="180" y="158" text-anchor="middle">5</text><text x="180" y="185" text-anchor="middle" class="tm">i=3</text><circle cx="260" cy="154" r="17" class="fb sb"/><text x="260" y="158" text-anchor="middle">9</text><text x="260" y="185" text-anchor="middle" class="tm">i=4</text><circle cx="340" cy="154" r="17" class="fb sb"/><text x="340" y="158" text-anchor="middle">8</text><text x="340" y="185" text-anchor="middle" class="tm">i=5</text><rect x="150" y="200" width="50" height="34" class="ft st"/><text x="175" y="222" text-anchor="middle">1</text><text x="175" y="252" class="tm" text-anchor="middle">0</text><rect x="200" y="200" width="50" height="34" class="ft st"/><text x="225" y="222" text-anchor="middle">3</text><text x="225" y="252" class="tm" text-anchor="middle">1</text><rect x="250" y="200" width="50" height="34" class="ft st"/><text x="275" y="222" text-anchor="middle">2</text><text x="275" y="252" class="tm" text-anchor="middle">2</text><rect x="300" y="200" width="50" height="34" class="ft st"/><text x="325" y="222" text-anchor="middle">5</text><text x="325" y="252" class="tm" text-anchor="middle">3</text><rect x="350" y="200" width="50" height="34" class="ft st"/><text x="375" y="222" text-anchor="middle">9</text><text x="375" y="252" class="tm" text-anchor="middle">4</text><rect x="400" y="200" width="50" height="34" class="ft st"/><text x="425" y="222" text-anchor="middle">8</text><text x="425" y="252" class="tm" text-anchor="middle">5</text><text x="10" y="30" class="tb">left child  = 2i + 1</text><text x="10" y="50" class="tb">right child = 2i + 2</text><text x="10" y="70" class="tr">parent = (i - 1) // 2</text><text x="90" y="222" text-anchor="middle">list:</text><text x="90" y="252" class="tm" text-anchor="middle">index:</text></svg><figcaption>The same heap two ways: as a tree (top) and as the Python list it is really stored in (bottom). Read the list level by level, left to right.</figcaption></figure>
  <p>Look at index 1 (value 3). Its children are at 2·1+1 = 3 (value 5) and 2·1+2 = 4 (value 9). Its parent is at (1−1)//2 = 0. These three formulas are all a heap needs to walk up and down the tree.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The list <code>[1, 3, 2, 5, 9, 8]</code> is not sorted. But every parent is smaller than its children, so <code>h[0]</code> is guaranteed to be the minimum. A heap gives you "the minimum is always at index 0", nothing more.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"A heap is sorted" is the most common wrong statement. Printing <code>h</code> gives <code>[1, 3, 2, 5, 9, 8]</code>. To get sorted output you must pop n times (that is heap sort, O(n log n)).</p>
  </div>

  <h2 id="dsa-hp-ops"><span class="num">03</span>Push &amp; Pop Step by Step</h2>
  <p>Both operations do the same trick: break the rule in one spot, then fix it by swapping along one path. The path is at most the height of the tree, log₂ n, so each operation is O(log n).</p>
  <h3>push(x): add at the end, sift up</h3>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="hp-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><line x1="95" y1="50" x2="48" y2="108" stroke="currentColor" /><line x1="95" y1="50" x2="142" y2="108" stroke="currentColor" /><line x1="48" y1="108" x2="24" y2="166" stroke="currentColor" /><line x1="48" y1="108" x2="71" y2="166" stroke="currentColor" /><line x1="142" y1="108" x2="119" y2="166" stroke="currentColor" /><circle cx="95" cy="50" r="17" class="fb sb"/><text x="95" y="54" text-anchor="middle">1</text><circle cx="48" cy="108" r="17" class="fb sb"/><text x="48" y="112" text-anchor="middle">3</text><circle cx="142" cy="108" r="17" class="fb sb"/><text x="142" y="112" text-anchor="middle">8</text><circle cx="24" cy="166" r="17" class="fb sb"/><text x="24" y="170" text-anchor="middle">5</text><circle cx="71" cy="166" r="17" class="fb sb"/><text x="71" y="170" text-anchor="middle">9</text><circle cx="119" cy="166" r="17" class="fr sr"/><text x="119" y="170" text-anchor="middle">2</text><text x="95" y="18" text-anchor="middle">1. append at the end</text><line x1="295" y1="50" x2="248" y2="108" stroke="currentColor" /><line x1="295" y1="50" x2="342" y2="108" stroke="currentColor" /><line x1="248" y1="108" x2="224" y2="166" stroke="currentColor" /><line x1="248" y1="108" x2="271" y2="166" stroke="currentColor" /><line x1="342" y1="108" x2="319" y2="166" stroke="currentColor" /><circle cx="295" cy="50" r="17" class="fb sb"/><text x="295" y="54" text-anchor="middle">1</text><circle cx="248" cy="108" r="17" class="fb sb"/><text x="248" y="112" text-anchor="middle">3</text><circle cx="342" cy="108" r="17" class="fr sr"/><text x="342" y="112" text-anchor="middle">8</text><circle cx="224" cy="166" r="17" class="fb sb"/><text x="224" y="170" text-anchor="middle">5</text><circle cx="271" cy="166" r="17" class="fb sb"/><text x="271" y="170" text-anchor="middle">9</text><circle cx="319" cy="166" r="17" class="fr sr"/><text x="319" y="170" text-anchor="middle">2</text><text x="295" y="18" text-anchor="middle">2. 2 &lt; parent 8 → swap</text><path d="M339,160 Q360,137 362,114" fill="none" class="sr" stroke-width="1.5" marker-end="url(#hp-a1)"/><line x1="495" y1="50" x2="448" y2="108" stroke="currentColor" /><line x1="495" y1="50" x2="542" y2="108" stroke="currentColor" /><line x1="448" y1="108" x2="424" y2="166" stroke="currentColor" /><line x1="448" y1="108" x2="471" y2="166" stroke="currentColor" /><line x1="542" y1="108" x2="519" y2="166" stroke="currentColor" /><circle cx="495" cy="50" r="17" class="fg sg"/><text x="495" y="54" text-anchor="middle">1</text><circle cx="448" cy="108" r="17" class="fb sb"/><text x="448" y="112" text-anchor="middle">3</text><circle cx="542" cy="108" r="17" class="fg sg"/><text x="542" y="112" text-anchor="middle">2</text><circle cx="424" cy="166" r="17" class="fb sb"/><text x="424" y="170" text-anchor="middle">5</text><circle cx="471" cy="166" r="17" class="fb sb"/><text x="471" y="170" text-anchor="middle">9</text><circle cx="519" cy="166" r="17" class="fb sb"/><text x="519" y="170" text-anchor="middle">8</text><text x="495" y="18" text-anchor="middle">3. 2 &gt; parent 1 → stop</text></svg><figcaption>push(2): the new value starts at the bottom and keeps swapping with its parent while it is smaller. It climbs at most one level per step.</figcaption></figure>
  <p>The new value 2 is appended as the last leaf (index 5). Its parent is 8, and 2 &lt; 8, so swap. Now its parent is 1, and 2 &gt; 1, so stop. Only one path from leaf to root is ever touched.</p>
  <h3>pop(): take the root, move the last to the top, sift down</h3>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><line x1="95" y1="50" x2="48" y2="108" stroke="currentColor" /><line x1="95" y1="50" x2="142" y2="108" stroke="currentColor" /><line x1="48" y1="108" x2="24" y2="166" stroke="currentColor" /><line x1="48" y1="108" x2="71" y2="166" stroke="currentColor" /><line x1="142" y1="108" x2="119" y2="166" stroke="currentColor" /><circle cx="95" cy="50" r="17" class="fr sr"/><text x="95" y="54" text-anchor="middle">1</text><circle cx="48" cy="108" r="17" class="fb sb"/><text x="48" y="112" text-anchor="middle">3</text><circle cx="142" cy="108" r="17" class="fb sb"/><text x="142" y="112" text-anchor="middle">2</text><circle cx="24" cy="166" r="17" class="fb sb"/><text x="24" y="170" text-anchor="middle">5</text><circle cx="71" cy="166" r="17" class="fb sb"/><text x="71" y="170" text-anchor="middle">9</text><circle cx="119" cy="166" r="17" class="fv sb"/><text x="119" y="170" text-anchor="middle">8</text><text x="95" y="18" text-anchor="middle">1. answer = root 1</text><line x1="295" y1="50" x2="248" y2="108" stroke="currentColor" /><line x1="295" y1="50" x2="342" y2="108" stroke="currentColor" /><line x1="248" y1="108" x2="224" y2="166" stroke="currentColor" /><line x1="248" y1="108" x2="271" y2="166" stroke="currentColor" /><circle cx="295" cy="50" r="17" class="fr sr"/><text x="295" y="54" text-anchor="middle">8</text><circle cx="248" cy="108" r="17" class="fb sb"/><text x="248" y="112" text-anchor="middle">3</text><circle cx="342" cy="108" r="17" class="fg sg"/><text x="342" y="112" text-anchor="middle">2</text><circle cx="224" cy="166" r="17" class="fb sb"/><text x="224" y="170" text-anchor="middle">5</text><circle cx="271" cy="166" r="17" class="fb sb"/><text x="271" y="170" text-anchor="middle">9</text><text x="295" y="18" text-anchor="middle">2. last (8) to the root</text><line x1="495" y1="50" x2="448" y2="108" stroke="currentColor" /><line x1="495" y1="50" x2="542" y2="108" stroke="currentColor" /><line x1="448" y1="108" x2="424" y2="166" stroke="currentColor" /><line x1="448" y1="108" x2="471" y2="166" stroke="currentColor" /><circle cx="495" cy="50" r="17" class="fg sg"/><text x="495" y="54" text-anchor="middle">2</text><circle cx="448" cy="108" r="17" class="fb sb"/><text x="448" y="112" text-anchor="middle">3</text><circle cx="542" cy="108" r="17" class="fr sr"/><text x="542" y="112" text-anchor="middle">8</text><circle cx="424" cy="166" r="17" class="fb sb"/><text x="424" y="170" text-anchor="middle">5</text><circle cx="471" cy="166" r="17" class="fb sb"/><text x="471" y="170" text-anchor="middle">9</text><text x="495" y="18" text-anchor="middle">3. swap with child 2</text></svg><figcaption>pop(): take the root, move the last value to the top, then push it down, always swapping with the smaller child, until both children are bigger.</figcaption></figure>
  <p>The answer is the root, 1. To fill the hole without leaving a gap, the <em>last</em> value (8) jumps to the root. Now 8 is bigger than its children 3 and 2. Swap it with the <strong>smaller</strong> child (2), so the new root is still the smallest. Repeat until both children are bigger or it reaches the bottom.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In sift down, always swap with the <em>smaller</em> child. If you swap with the bigger one, that bigger value becomes the parent of the smaller one and the rule breaks again.</p>
  </div>

  <h2 id="dsa-hp-impl"><span class="num">04</span>Build One From Scratch</h2>
  <p>You will use <code>heapq</code> in interviews, but being able to write this in 30 lines proves you understand it. The three index formulas and the two sift loops are the whole thing.</p>
  <div class="fx" data-lang="py">class MinHeap:
    def __init__(self):
        self.a = []                      # the tree, stored level by level

    def push(self, x):
        a = self.a
        a.append(x)                      # 1. put it at the next free spot
        i = len(a) - 1
        while i &gt; 0:                     # 2. sift up
            p = (i - 1) // 2             #    parent index
            if a[i] &lt; a[p]:
                a[i], a[p] = a[p], a[i]
                i = p
            else:
                break

    def pop(self):
        a = self.a
        top = a[0]
        last = a.pop()                   # 1. take the last element out
        if a:
            a[0] = last                  # 2. put it at the root
            i, n = 0, len(a)
            while True:                  # 3. sift down
                l, r = 2 * i + 1, 2 * i + 2
                small = i
                if l &lt; n and a[l] &lt; a[small]: small = l
                if r &lt; n and a[r] &lt; a[small]: small = r
                if small == i:
                    break
                a[i], a[small] = a[small], a[i]
                i = small
        return top

h = MinHeap()
for x in [5, 3, 8, 1, 9, 2]:
    h.push(x)
    print("push", x, "-&gt;", h.a)
print("pop", h.pop(), "-&gt;", h.a)
print("pop", h.pop(), "-&gt;", h.a)
print([h.pop() for _ in range(len(h.a))])</div>
  <div class="fx" data-lang="text">push 5 -&gt; [5]
push 3 -&gt; [3, 5]
push 8 -&gt; [3, 5, 8]
push 1 -&gt; [1, 3, 8, 5]
push 9 -&gt; [1, 3, 8, 5, 9]
push 2 -&gt; [1, 3, 2, 5, 9, 8]
pop 1 -&gt; [2, 3, 8, 5, 9]
pop 2 -&gt; [3, 5, 8, 9]
[3, 5, 8, 9]</div>
  <p>Watch <code>push 1</code>: it enters at index 3, swaps with 5, then with 3, and lands at the root. Popping everything out gives the numbers in sorted order, one O(log n) pop at a time.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>Plain reason</th></tr>
    <tr><td>peek min <code>h[0]</code></td><td>O(1)</td><td>It is always at index 0</td></tr>
    <tr><td>push</td><td>O(log n)</td><td>Sift up walks one path leaf → root; the tree has log₂ n levels</td></tr>
    <tr><td>pop</td><td>O(log n)</td><td>Sift down walks one path root → leaf</td></tr>
    <tr><td>heapify a list of n</td><td>O(n)</td><td>Sift down from the last parent backwards; most nodes are near the bottom and move only 1–2 steps</td></tr>
    <tr><td>search for a value</td><td>O(n)</td><td>No order among siblings, so you may scan everything</td></tr>
    <tr><td>delete an arbitrary value</td><td>O(n)</td><td>Find it first (O(n)); the fix is "lazy deletion", see Traps</td></tr>
    <tr><td>space</td><td>O(n)</td><td>One list, no pointers</td></tr>
  </table>

  <h2 id="dsa-hp-heapq"><span class="num">05</span>Python's heapq</h2>
  <p><code>heapq</code> is not a class. It is a set of functions that treat a normal Python list as a <strong>min-heap</strong>. You keep the list; the functions keep it in heap order.</p>
  <div class="fx" data-lang="py">import heapq

h = []
for x in [5, 3, 8, 1]:
    heapq.heappush(h, x)
print(h, "smallest:", h[0])
print(heapq.heappop(h), h)

nums = [7, 2, 9, 4, 1]
heapq.heapify(nums)                 # O(n), in place
print("heapify:", nums)

# max-heap trick: store negatives
mx = []
for x in [5, 3, 8, 1]:
    heapq.heappush(mx, -x)
print("max:", -mx[0], "pop:", -heapq.heappop(mx))

# priorities with tuples: (priority, name)
er = []
heapq.heappush(er, (3, "fever"))
heapq.heappush(er, (1, "heart attack"))
heapq.heappush(er, (2, "broken arm"))
while er:
    print(heapq.heappop(er))

marks = [67, 92, 45, 88, 99, 73]
print(heapq.nlargest(3, marks), heapq.nsmallest(2, marks))
students = [("Asha", 92), ("Ravi", 67), ("Neha", 99)]
print(heapq.nlargest(2, students, key=lambda s: s[1]))
print(heapq.heappushpop([1, 4, 6], 3), heapq.heapreplace([1, 4, 6], 3))</div>
  <div class="fx" data-lang="text">[1, 3, 8, 5] smallest: 1
1 [3, 5, 8]
heapify: [1, 2, 9, 4, 7]
max: 8 pop: 8
(1, 'heart attack')
(2, 'broken arm')
(3, 'fever')
[99, 92, 88] [45, 67]
[('Neha', 99), ('Asha', 92)]
1 1</div>
  <div class="cards">
    <div><b>Max-heap trick</b><p>Python has no max-heap. Push <code>-x</code>, and the smallest negative is the biggest original. Negate again when reading.</p><small>For tuples: <code>(-score, name)</code></small></div>
    <div><b>Tuples = priorities</b><p>Tuples compare field by field, so <code>(priority, item)</code> orders by priority first.</p><small>Equal priority → compares item next</small></div>
    <div><b>heapify</b><p>Turns an existing list into a heap in O(n). Faster than n pushes (O(n log n)).</p><small>Use when you already have all the data</small></div>
    <div><b>nlargest / nsmallest</b><p>"k biggest" in O(n log k) with a <code>key=</code>. For k = 1 just use <code>max()</code>; for k near n just <code>sorted()</code>.</p><small>Returns a sorted list</small></div>
  </div>
  <p>The last line shows the two combined calls. <code>heappushpop(h, x)</code> pushes x then pops the min, so the result is the smaller of x and the old min (here 1, because 1 &lt; 3). <code>heapreplace(h, x)</code> pops the min first and then pushes x, so it always returns the old min (1) even if x is smaller. Both are one sift instead of two.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Equal priorities. <code>(1, {"name": "Asha"})</code> vs <code>(1, {"name": "Ravi"})</code>: Python compares the dicts and crashes with <code>TypeError: '&lt;' not supported between instances of 'dict' and 'dict'</code>. Fix: push <code>(priority, counter, item)</code> with a running counter so the tie is settled before Python looks at the item.</p>
  </div>
  <div class="fx" data-lang="py">h = []
for i, p in enumerate([{"name": "Asha"}, {"name": "Ravi"}]):
    heapq.heappush(h, (1, i, p))     # i breaks ties
print(heapq.heappop(h))</div>
  <div class="fx" data-lang="text">(1, 0, {'name': 'Asha'})</div>

  <h2 id="dsa-hp-patterns"><span class="num">06</span>Patterns</h2>
  <h3>Pattern 1: Top-k with a heap of size k</h3>
  <p>Signal words: "k largest", "k smallest", "k closest", "k most frequent", "from a stream". The trick that confuses everyone: to find the k <strong>largest</strong>, keep a <strong>min</strong>-heap of size k.</p>
  <div class="flow"><span>Push each item</span><span>Heap grows past k?</span><span>Pop the min (the weakest of the top k)</span><span>At the end: heap = the k best, h[0] = kth best</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team selection with 11 seats. Every new player who tries out joins, then the <em>weakest</em> of the 12 is sent home. The weakest player still in the team is the cut-off, and he is at the top of the min-heap.</p>
  </div>
  <div class="fx" data-lang="py">def top_k(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) &gt; k:
            heapq.heappop(h)      # remove the smallest of the k+1
    return h                      # k largest; h[0] is the kth largest</div>
  <p>Cost: n pushes into a heap that never exceeds k items = O(n log k). Sorting would be O(n log n). For n = 10 million and k = 10, that is log 10 ≈ 3 versus log 10⁷ ≈ 23 per item. Memory is O(k), so it works on a stream you cannot hold.</p>
  <h3>Pattern 2: Two heaps (lower half / upper half)</h3>
  <p>Signal words: "running median", "balance two groups", "schedule with a sliding window". Keep a max-heap of the smaller numbers and a min-heap of the bigger numbers. The two tops are the middle of the data.</p>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600"><rect x="40" y="40" width="220" height="90" rx="10" class="fb sb"/><text x="150" y="30" class="tb" text-anchor="middle">lower half: MAX-heap</text><text x="150" y="80" text-anchor="middle">1   3   5</text><text x="150" y="110" class="tm" text-anchor="middle">top = 5 (biggest of small ones)</text><rect x="340" y="40" width="220" height="90" rx="10" class="fg sg"/><text x="450" y="30" class="tg" text-anchor="middle">upper half: MIN-heap</text><text x="450" y="80" text-anchor="middle">8   15</text><text x="450" y="110" class="tm" text-anchor="middle">top = 8 (smallest of big ones)</text><text x="300" y="90" text-anchor="middle">≤</text><text x="300" y="160" text-anchor="middle">odd count → median = top of lower = 5 ;  even count → average of both tops</text></svg><figcaption>Two heaps split the numbers into a smaller half and a bigger half. The median always sits at the two tops, so it is read in O(1).</figcaption></figure>
  <h3>Pattern 3: k-way merge</h3>
  <p>Signal words: "k sorted lists / files / streams", "merge". Put the first item of every list in a heap. Pop the smallest, push the next item from the <em>same</em> list. Each item is pushed once: O(N log k) for N total items.</p>
  <h3>Pattern 4: Greedy "take the best now"</h3>
  <p>Signal words: "minimum cost to…", "schedule", "shortest path with weights". Repeatedly pop the current best option, do something, push new options. Dijkstra, Huffman coding, meeting rooms, task scheduler all follow this loop.</p>

  <h2 id="dsa-hp-problems"><span class="num">07</span>Classic Problems</h2>
  <h3>1. Kth Largest Element in an Array</h3>
  <p>Given <code>[3, 2, 1, 5, 6, 4]</code> and k = 2, return the 2nd largest (5). Brute force: sort and take <code>[-k]</code>, O(n log n). Better: top-k pattern, O(n log k).</p>
  <table class="tbl out"><caption>Dry run, k = 2 (heap shown sorted)</caption>
    <tr><th>see</th><th>heap after push</th><th>pop if size &gt; 2</th><th>heap</th></tr>
    <tr><td>3</td><td>[3]</td><td>–</td><td>[3]</td></tr>
    <tr><td>2</td><td>[2, 3]</td><td>–</td><td>[2, 3]</td></tr>
    <tr><td>1</td><td>[1, 2, 3]</td><td>pop 1</td><td>[2, 3]</td></tr>
    <tr><td>5</td><td>[2, 3, 5]</td><td>pop 2</td><td>[3, 5]</td></tr>
    <tr><td>6</td><td>[3, 5, 6]</td><td>pop 3</td><td>[5, 6]</td></tr>
    <tr><td>4</td><td>[4, 5, 6]</td><td>pop 4</td><td>[5, 6] → answer h[0] = 5</td></tr>
  </table>
  <div class="fx" data-lang="py">def find_kth_largest(nums, k):
    h = []                               # min-heap of the k biggest seen so far
    for x in nums:
        heapq.heappush(h, x)
        if len(h) &gt; k:
            heapq.heappop(h)             # throw out the smallest
    return h[0]                          # smallest of the top k = kth largest

for nums, k in [([3, 2, 1, 5, 6, 4], 2), ([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), ([7], 1), ([-1, -1], 2)]:
    print(nums, k, "-&gt;", find_kth_largest(nums, k))</div>
  <div class="fx" data-lang="text">[3, 2, 1, 5, 6, 4] 2 -&gt; 5
[3, 2, 3, 1, 2, 4, 5, 5, 6] 4 -&gt; 4
[7] 1 -&gt; 7
[-1, -1] 2 -&gt; -1</div>
  <p>Time O(n log k), space O(k). Mention in the interview: Quickselect does it in O(n) average, and <code>heapq.nlargest(k, nums)[-1]</code> is the one-liner.</p>

  <h3>2. Top K Frequent Elements</h3>
  <p><code>[1, 1, 1, 2, 2, 3]</code>, k = 2 → <code>[1, 2]</code>. Count first with a <code>Counter</code> (a dict of value → how many times). Then it is top-k on the counts.</p>
  <div class="fx" data-lang="py">from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)                         # value -&gt; how many times
    return heapq.nlargest(k, count.keys(), key=count.get)

def top_k_frequent_bucket(nums, k):               # O(n): frequency can't exceed n
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]  # index = frequency
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(buckets) - 1, 0, -1):      # from highest frequency down
        for x in buckets[c]:
            out.append(x)
            if len(out) == k:
                return out
    return out

for nums, k in [([1, 1, 1, 2, 2, 3], 2), ([1], 1), ([4, 4, 5, 5, 5, 6, 6, 6, 6], 2)]:
    print(nums, k, "-&gt;", top_k_frequent(nums, k), top_k_frequent_bucket(nums, k))</div>
  <div class="fx" data-lang="text">[1, 1, 1, 2, 2, 3] 2 -&gt; [1, 2] [1, 2]
[1] 1 -&gt; [1] [1]
[4, 4, 5, 5, 5, 6, 6, 6, 6] 2 -&gt; [6, 5] [6, 5]</div>
  <p>Heap version: O(n log k). Bucket version: O(n), because a frequency is at most n, so an array indexed by frequency replaces sorting. Interviewers like hearing both.</p>

  <h3>3. Merge K Sorted Lists</h3>
  <p>k linked lists, each sorted. Produce one sorted list. Brute force: join everything and sort, O(N log N). Better: k-way merge, a heap holding only one node per list, O(N log k).</p>
  <table class="tbl out"><caption>Dry run on [1,4,5], [1,3,4], [2,6]</caption>
    <tr><th>heap (val, list)</th><th>pop</th><th>push next from that list</th><th>output</th></tr>
    <tr><td>(1,0) (1,1) (2,2)</td><td>(1,0)</td><td>(4,0)</td><td>1</td></tr>
    <tr><td>(1,1) (2,2) (4,0)</td><td>(1,1)</td><td>(3,1)</td><td>1 1</td></tr>
    <tr><td>(2,2) (3,1) (4,0)</td><td>(2,2)</td><td>(6,2)</td><td>1 1 2</td></tr>
    <tr><td>(3,1) (4,0) (6,2)</td><td>(3,1)</td><td>(4,1)</td><td>1 1 2 3</td></tr>
    <tr><td>…</td><td>…</td><td>…</td><td>1 1 2 3 4 4 5 6</td></tr>
  </table>
  <div class="fx" data-lang="py">class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def merge_k_lists(lists):
    h = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(h, (node.val, i, node))   # i breaks ties: nodes can't be compared
    dummy = tail = ListNode(0)
    while h:
        val, i, node = heapq.heappop(h)              # smallest head of all lists
        tail.next = node
        tail = node
        if node.next:
            heapq.heappush(h, (node.next.val, i, node.next))
    return dummy.next

for case in [[[1, 4, 5], [1, 3, 4], [2, 6]], [], [[]], [[2], [], [1, 1]]]:
    print(case, "-&gt;", to_list(merge_k_lists([build(c) for c in case])))</div>
  <div class="fx" data-lang="text">[[1, 4, 5], [1, 3, 4], [2, 6]] -&gt; [1, 1, 2, 3, 4, 4, 5, 6]
[] -&gt; []
[[]] -&gt; []
[[2], [], [1, 1]] -&gt; [1, 1, 2]</div>
  <p><code>build</code> and <code>to_list</code> are small helpers that turn a Python list into a linked list and back. The empty cases matter: the <code>if node:</code> skip keeps empty lists out of the heap. Time O(N log k), space O(k).</p>

  <h3>4. Find Median from Data Stream</h3>
  <p>Numbers arrive one by one. After each one, report the median (the middle value). Brute force: keep a sorted list, insert in O(n), read the middle. Better: the two-heaps pattern, O(log n) per insert and O(1) per median.</p>
  <div class="fx" data-lang="py">class MedianFinder:
    def __init__(self):
        self.small = []      # max-heap (negatives): lower half
        self.large = []      # min-heap: upper half

    def addNum(self, x):
        heapq.heappush(self.small, -x)
        # move the biggest of the lower half up, so every small &lt;= every large
        heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) &gt; len(self.small):        # keep small the same size or 1 bigger
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self):
        if len(self.small) &gt; len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2

m = MedianFinder()
for x in [5, 15, 1, 3, 8]:
    m.addNum(x)
    print(f"add {x:2}: lower={sorted(-v for v in m.small)} upper={sorted(m.large)} median={m.findMedian()}")
m2 = MedianFinder(); m2.addNum(-1); m2.addNum(-2); print(m2.findMedian())</div>
  <div class="fx" data-lang="text">add  5: lower=[5] upper=[] median=5
add 15: lower=[5] upper=[15] median=10.0
add  1: lower=[1, 5] upper=[15] median=5
add  3: lower=[1, 3] upper=[5, 15] median=4.0
add  8: lower=[1, 3, 5] upper=[8, 15] median=5
-1.5</div>
  <p>Every add does the same three moves: push into lower, move lower's max to upper (this guarantees lower ≤ upper), and if upper got bigger, move its min back. Sizes always differ by at most 1, so the median is at the tops.</p>

  <h3>5. K Closest Points to Origin</h3>
  <p>Points <code>[[3,3],[5,-1],[-2,4]]</code>, k = 2 → the two nearest to (0,0). Top-k pattern again, but now we want the k <strong>smallest</strong> distances, so the heap holds the opposite: a <strong>max</strong>-heap (negated distance) of size k.</p>
  <div class="fx" data-lang="py">def k_closest(points, k):
    h = []                                    # max-heap of size k on distance
    for x, y in points:
        d = x * x + y * y                     # no sqrt needed for comparing
        heapq.heappush(h, (-d, x, y))
        if len(h) &gt; k:
            heapq.heappop(h)                  # drop the farthest
    return [[x, y] for _, x, y in h]

for pts, k in [([[1, 3], [-2, 2]], 1), ([[3, 3], [5, -1], [-2, 4]], 2), ([[0, 1], [1, 0]], 2)]:
    print(pts, k, "-&gt;", sorted(k_closest(pts, k)), heapq.nsmallest(k, pts, key=lambda p: p[0]**2 + p[1]**2))</div>
  <div class="fx" data-lang="text">[[1, 3], [-2, 2]] 1 -&gt; [[-2, 2]] [[-2, 2]]
[[3, 3], [5, -1], [-2, 4]] 2 -&gt; [[-2, 4], [3, 3]] [[3, 3], [-2, 4]]
[[0, 1], [1, 0]] 2 -&gt; [[0, 1], [1, 0]] [[0, 1], [1, 0]]</div>
  <p>O(n log k) time, O(k) space. Skipping the square root is a small but liked detail: order does not change, and we avoid floats. The <code>nsmallest</code> one-liner is the same idea inside the library.</p>

  <h2 id="dsa-hp-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: editing the list directly</span>
    <p><code>h.append(x)</code>, <code>h[0] = 5</code>, <code>h.sort()</code>, <code>h.remove(x)</code> all break the heap order silently. Only touch the list through <code>heapq</code> functions (or call <code>heapify</code> again after a direct edit).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong heap kind for top-k</span>
    <p>k largest → min-heap (pop the small ones out). k smallest → max-heap (pop the big ones out). Say it out loud before coding: "the heap top is the one I am ready to throw away".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deleting or updating a value inside the heap</span>
    <p>There is no O(log n) "remove this value". The standard fix is <strong>lazy deletion</strong>: keep a set (or dict) of removed/outdated items, and when popping, skip anything that is in it. Dijkstra uses exactly this: push the new better distance, ignore the stale entry when it pops.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading h as sorted</span>
    <p><code>h[1]</code> is not the second smallest. Only <code>h[0]</code> means anything. For the k smallest in order, pop k times or use <code>nsmallest</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: heapify cost</span>
    <p>Building a heap by n pushes is O(n log n). <code>heapify</code> is O(n). If you already have the whole list, call <code>heapify</code>.</p>
  </div>

  <h2 id="dsa-hp-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a heap, and what does it promise?</summary><div class="qa-body">A complete binary tree stored in a list, where every parent is ≤ its children (min-heap). It promises only that the root <code>h[0]</code> is the minimum. The rest of the list is not sorted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where are the children and parent of index i?</summary><div class="qa-body">Children at <code>2i+1</code> and <code>2i+2</code>, parent at <code>(i-1)//2</code>. This works because a complete tree has no gaps, so levels pack into the list one after another.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Complexity of push, pop, peek, heapify, and search?</summary><div class="qa-body">push O(log n), pop O(log n), peek O(1), heapify O(n), search O(n). The log comes from the tree height; sift up/down touch one root-to-leaf path only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is heapify O(n) and not O(n log n)?</summary><div class="qa-body">It sifts down starting from the last parent. Half the nodes are leaves and do no work; a quarter move at most 1 step; an eighth at most 2 steps. The sum n/2·0 + n/4·1 + n/8·2 + … is bounded by 2n. Only the root can move the full log n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Python has no max-heap. How do you get one?</summary><div class="qa-body">Push the negative: <code>heappush(h, -x)</code>, read <code>-h[0]</code>. For tuples, negate the priority field: <code>(-score, item)</code>. For objects, wrap them in a class with a reversed <code>__lt__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>To find the k largest items, which heap do you keep and why?</summary><div class="qa-body">A min-heap of size k. After each push, if the size exceeds k, pop: that removes the smallest, which can never be among the top k. At the end the heap holds the k largest and <code>h[0]</code> is the kth largest. O(n log k) time, O(k) space, works on a stream.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Heap of size k vs sorting: when is each better?</summary><div class="qa-body">Heap: O(n log k), best when k is small compared to n or when the data streams in. Sort: O(n log n) but simpler and better when k is close to n or when you need the whole order. Quickselect: O(n) average for just the kth element.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the two-heaps median trick and the rebalancing rule.</summary><div class="qa-body">Max-heap for the lower half, min-heap for the upper half. Every new number goes into lower, lower's max moves to upper (keeps lower ≤ upper), and if upper is now bigger, upper's min moves back. Sizes differ by at most 1. Median = lower's top (odd count) or the average of both tops (even). O(log n) add, O(1) median.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You push (1, obj1) and (1, obj2) and get a TypeError. Why, and the fix?</summary><div class="qa-body">Tuples compare element by element. Priorities tie at 1, so Python compares obj1 &lt; obj2, which objects do not support. Add a unique counter: <code>(priority, count, obj)</code>. The counter settles the tie and also gives first-in-first-out among equal priorities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you remove or update an item that is already inside the heap?</summary><div class="qa-body">Not directly: finding it is O(n). Use lazy deletion: record it as removed in a set/dict, push the updated version, and whenever you pop, discard entries that are marked stale. Dijkstra and sliding-window problems use this.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge k sorted lists: complexity with a heap, and why not sort everything?</summary><div class="qa-body">Heap holds one head per list, so each of N items is pushed and popped once at O(log k): O(N log k), O(k) extra space. Sorting everything is O(N log N) and needs all data in memory; the heap version also works on k streams or files.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>h=[5,1,8]; heapq.heapify(h); print(h, heapq.heappushpop(h, 0), heapq.heapreplace(h, 0), h)</code></summary><div class="qa-body"><code>[0, 5, 8] 0 1 [0, 5, 8]</code>. heapify makes 1 the root. heappushpop pushes 0 and pops the min, which is the 0 itself, heap unchanged. heapreplace pops the min 1 first, then pushes 0. Bonus trap: the first <code>h</code> also prints <code>[0, 5, 8]</code>, because print evaluates all arguments before printing and the list was mutated in between.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name three real systems that use a priority queue.</summary><div class="qa-body">OS process scheduler (highest-priority process runs next), Dijkstra / A* in map navigation (closest unvisited node next), event simulation and timers (earliest event next), Huffman compression, and merging sorted runs in external sort / database engines.</div></details>
</main>
`
});
