// notes/dsa/dsa_heaps.js — Heaps & Priority Queue
Object.assign(TOPIC_CONTENT, {
  "dsa_heaps": `<main>
<h1>Heaps &amp; Priority Queue</h1>
  <div class="where"><span>DSA</span><span>Trees &amp; Graphs</span><span>Heaps &amp; Priority Queue</span></div>
  <p class="lead">A heap is a list that always knows its smallest item, and keeps knowing it, cheaply, after every insert and every removal. That one ability is what a dispatcher needs to always send the most urgent delivery next, what a dashboard needs to show "the top 10" while data keeps arriving, and what Dijkstra's shortest-path algorithm needs to always extend the closest route. Heaps are a very common interview topic because a handful of patterns built on them (top-k, k-way merge, two heaps for a running median, greedy scheduling) solve problems that look unrelated at first. The running example is Biteful's 8 pending deliveries at 8 pm: each has a bill (the same 8 charges as the other DSA notes) and a number of minutes left before its promised delivery time. All outputs are real runs of Python 3.13; timings are approximate.</p>

  <h2 id="dsa-hp-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Heaps &amp; Priority Queue</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What it is</div>
        <ul>
          <li><b>Priority queue</b>: "next" means most urgent, not oldest</li>
          <li><b>Min-heap</b>: every parent ≤ its children, so <code>h[0]</code> is the minimum</li>
          <li>Only the root is promised; the rest is not sorted</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How it works</div>
        <ul>
          <li>Complete tree stored in a list: children 2i+1, 2i+2; parent (i−1)//2</li>
          <li>Push: append, sift up · Pop: last to root, sift down</li>
          <li>Peek O(1), push/pop O(log n), heapify O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">heapq</div>
        <ul>
          <li>Functions on a plain list; min-heap only</li>
          <li>Max-heap: push <code>-x</code></li>
          <li>Ties: push <code>(priority, counter, item)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li>Top-k: size-k heap of the opposite kind, O(n log k)</li>
          <li>k-way merge: one head per list, O(N log k)</li>
          <li>Two heaps: running median</li>
          <li>Greedy schedule: heap + cooldown queue</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-hp-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Priority Queues</span><span class="rm-sub">most urgent first, and why lists are too slow</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-tree"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">A Tree Inside a List</span><span class="rm-sub">the heap rule and the index formulas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-ops"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Push and Pop</span><span class="rm-sub">sift up, sift down, heapify, built by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-heapq"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Python's heapq</span><span class="rm-sub">min-heap, max-heap trick, priorities, ties</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-topk"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Top-k</span><span class="rm-sub">the k biggest without sorting everything</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-stream"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">K-th Largest in a Stream</span><span class="rm-sub">keeping the top-k heap alive</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-merge"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Merge k Sorted Lists</span><span class="rm-sub">one head per list</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-median"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Two Heaps: Running Median</span><span class="rm-sub">the middle at two tops</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-sched"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Task Scheduler</span><span class="rm-sub">greedy choice with a cooldown</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Recognising the Pattern</span><span class="rm-sub">problem wording to heap pattern</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">More Classic Problems</span><span class="rm-sub">kth largest, top-k frequent, k closest, practice order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">ties, direct edits, wrong heap kind</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, costs, templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on heaps</span></div></div>
    </div>
  </div>

  <h2 id="dsa-hp-need"><span class="num">01</span>Priority Queues: Most Urgent First</h2>
  <p>At 8 pm Biteful has 8 deliveries waiting for a rider. Their bills are the familiar 8 charges; the new information is how many minutes are left before each order's promised delivery time.</p>
  <table class="tbl">
    <tr><th>order</th><th>O1</th><th>O2</th><th>O3</th><th>O4</th><th>O5</th><th>O6</th><th>O7</th><th>O8</th></tr>
    <tr><td>bill (₹)</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
    <tr><td>minutes left</td><td>25</td><td>12</td><td>40</td><td>8</td><td>30</td><td>15</td><td>5</td><td>18</td></tr>
  </table>
  <p>Whenever a rider becomes free, the dispatcher must hand over the delivery with the <em>fewest minutes left</em>: O7 (5 minutes) first, then O4 (8), then O2 (12), and so on. Meanwhile new orders keep arriving. Neither structure from the Stacks &amp; Queues note helps: a stack would hand out the newest order and a queue the oldest, so a queue would send O1, with 25 minutes to spare, before O7, which is about to be late. What we need is a <strong>priority queue</strong>: a collection where every item has a priority number, and "remove the next item" always removes the one with the best priority, however recently it arrived.</p>
  <p>A government hospital's emergency room works this way. Patients arrive in any order, a triage nurse gives each one a card (1 for critical, 2 for serious, 3 for can wait), and the doctor only ever asks one question: "who has the smallest number right now?" New patients keep arriving, and the answer has to be found quickly every single time.</p>
  <p>Why not just keep the pending orders in a Python list? There are two obvious ways, and each makes one of the two operations slow. An unsorted list makes adding an order cheap (<code>append</code>), but finding the most urgent one means scanning the whole list with <code>min</code>, O(n) per pick. A sorted list makes picking cheap, but every new order has to be slotted into its place, shifting all the items after it, O(n) per arrival. Let us measure all three approaches, the third being the heap this note is about, on a busy evening: n orders are pending, and 5,000 times a new order arrives and the most urgent one is picked.</p>
<div class="fx" data-lang="py">import random, time, heapq
from bisect import insort

def rounds_unsorted(pending, arrivals):
    a = pending[:]
    for x in arrivals:
        a.append(x)
        a.remove(min(a))              # scan for the minimum, then scan again to remove it

def rounds_sorted(pending, arrivals):
    a = sorted(pending)
    for x in arrivals:
        insort(a, x)                  # binary search + shift
        a.pop(0)                      # shift everything left

def rounds_heap(pending, arrivals):
    h = pending[:]
    heapq.heapify(h)
    for x in arrivals:
        heapq.heappush(h, x)          # O(log n)
        heapq.heappop(h)              # O(log n)

random.seed(5)
for n in [10_000, 40_000]:
    pending = [random.randint(1, 10**6) for _ in range(n)]
    arrivals = [random.randint(1, 10**6) for _ in range(5_000)]
    times = []
    for f in (rounds_unsorted, rounds_sorted, rounds_heap):
        t = time.perf_counter(); f(pending, arrivals); times.append(time.perf_counter() - t)
    print(f"n={n:&gt;6,}: unsorted list {times[0]:.3f} s | sorted list {times[1]:.4f} s | heap {times[2]:.4f} s")</div>
  <div class="fx" data-lang="text">n=10,000: unsorted list 0.747 s | sorted list 0.0207 s | heap 0.0024 s
n=40,000: unsorted list 2.784 s | sorted list 0.0717 s | heap 0.0048 s</div>
  <p>The exact times depend on the machine, but the shape is clear. When the backlog grows four times, the unsorted list gets roughly that much slower, because every pick scans everything. The sorted list also grows with n, because every insert and every <code>pop(0)</code> shifts items (it is quick only because the shifting happens in fast C code). The heap stays at a few milliseconds throughout: its operations cost O(log n), and log₂ of 40,000 is only about 15.</p>
  <p>A <strong>heap</strong> is the standard way to build a priority queue. It keeps the items "half sorted": just enough order that the most urgent item is always at the front, without paying for the full sorting that the sorted list maintains. In a <strong>min-heap</strong>, the front is the smallest item; in a <strong>max-heap</strong>, it is the biggest. Heaps appear in Python's <code>heapq</code>, in operating-system schedulers, in Dijkstra's shortest-path algorithm, in "top 10 trending" lists and in merging huge sorted files. The next two sections show how a plain list can hold this half-sorted order.</p>

  <h2 id="dsa-hp-tree"><span class="num">02</span>A Tree Inside a List</h2>
  <p>The order a heap keeps is easiest to describe as a tree. A min-heap is a binary tree in which <strong>every parent is smaller than or equal to its children</strong>. That single rule, called the <strong>heap property</strong>, is enough to guarantee that the root is the smallest item of all: the root is smaller than its children, each of them is smaller than theirs, and so on all the way down. Notice what the rule does <em>not</em> say: nothing about the order of two siblings, or of cousins in different branches. That missing order is exactly what makes a heap cheaper to maintain than a sorted list.</p>
  <p>A heap also has a fixed shape: it is a <strong>complete binary tree</strong>, which means every level is completely full except possibly the last one, and the last level is filled from the left with no gaps. Because there are no gaps, the tree can be stored in an ordinary Python list, level by level, with no node objects and no pointers at all: the root at index 0, its two children at 1 and 2, their children at 3, 4, 5 and 6, and so on. Here are our 8 deliveries in a min-heap, keyed by minutes left (section 03 shows how they got into this arrangement):</p>
  <figure class="viz"><svg viewBox="0 0 580 330" width="580">
<line x1="300" y1="40" x2="170" y2="105" stroke="currentColor"/><line x1="300" y1="40" x2="430" y2="105" stroke="currentColor"/><line x1="170" y1="105" x2="100" y2="170" stroke="currentColor"/><line x1="170" y1="105" x2="240" y2="170" stroke="currentColor"/><line x1="430" y1="105" x2="360" y2="170" stroke="currentColor"/><line x1="430" y1="105" x2="500" y2="170" stroke="currentColor"/><line x1="100" y1="170" x2="60" y2="235" stroke="currentColor"/>
<circle cx="300" cy="40" r="19" style="fill:var(--bg)"/><circle cx="300" cy="40" r="19" class="fg sg"/><text x="300" y="44" text-anchor="middle" font-size="12">5</text><text x="323" y="30" class="tm" font-size="9.5">O7 · i=0</text>
<circle cx="170" cy="105" r="19" style="fill:var(--bg)"/><circle cx="170" cy="105" r="19" class="fb sb"/><text x="170" y="109" text-anchor="middle" font-size="12">12</text><text x="193" y="95" class="tm" font-size="9.5">O2 · i=1</text>
<circle cx="430" cy="105" r="19" style="fill:var(--bg)"/><circle cx="430" cy="105" r="19" class="fb sb"/><text x="430" y="109" text-anchor="middle" font-size="12">8</text><text x="453" y="95" class="tm" font-size="9.5">O4 · i=2</text>
<circle cx="100" cy="170" r="19" style="fill:var(--bg)"/><circle cx="100" cy="170" r="19" class="fb sb"/><text x="100" y="174" text-anchor="middle" font-size="12">18</text><text x="123" y="160" class="tm" font-size="9.5">O8 · i=3</text>
<circle cx="240" cy="170" r="19" style="fill:var(--bg)"/><circle cx="240" cy="170" r="19" class="fb sb"/><text x="240" y="174" text-anchor="middle" font-size="12">30</text><text x="263" y="160" class="tm" font-size="9.5">O5 · i=4</text>
<circle cx="360" cy="170" r="19" style="fill:var(--bg)"/><circle cx="360" cy="170" r="19" class="fb sb"/><text x="360" y="174" text-anchor="middle" font-size="12">40</text><text x="383" y="160" class="tm" font-size="9.5">O3 · i=5</text>
<circle cx="500" cy="170" r="19" style="fill:var(--bg)"/><circle cx="500" cy="170" r="19" class="fb sb"/><text x="500" y="174" text-anchor="middle" font-size="12">15</text><text x="523" y="160" class="tm" font-size="9.5">O6 · i=6</text>
<circle cx="60" cy="235" r="19" style="fill:var(--bg)"/><circle cx="60" cy="235" r="19" class="fb sb"/><text x="60" y="239" text-anchor="middle" font-size="12">25</text><text x="83" y="225" class="tm" font-size="9.5">O1 · i=7</text>
<text x="560" y="40" class="tb" font-size="11" text-anchor="end">left child = 2i + 1</text><text x="560" y="58" class="tb" font-size="11" text-anchor="end">right child = 2i + 2</text><text x="560" y="76" class="tr" font-size="11" text-anchor="end">parent = (i − 1) // 2</text>
<text x="96" y="292" text-anchor="end" font-size="11">list:</text><text x="96" y="318" class="tm" text-anchor="end" font-size="10">index:</text>
<rect x="110" y="272" width="50" height="30" class="fg sg"/><text x="135" y="292" text-anchor="middle" font-size="12">5</text><text x="135" y="318" class="tm" text-anchor="middle" font-size="10">0</text>
<rect x="162" y="272" width="50" height="30" class="ft st"/><text x="187" y="292" text-anchor="middle" font-size="12">12</text><text x="187" y="318" class="tm" text-anchor="middle" font-size="10">1</text>
<rect x="214" y="272" width="50" height="30" class="ft st"/><text x="239" y="292" text-anchor="middle" font-size="12">8</text><text x="239" y="318" class="tm" text-anchor="middle" font-size="10">2</text>
<rect x="266" y="272" width="50" height="30" class="ft st"/><text x="291" y="292" text-anchor="middle" font-size="12">18</text><text x="291" y="318" class="tm" text-anchor="middle" font-size="10">3</text>
<rect x="318" y="272" width="50" height="30" class="ft st"/><text x="343" y="292" text-anchor="middle" font-size="12">30</text><text x="343" y="318" class="tm" text-anchor="middle" font-size="10">4</text>
<rect x="370" y="272" width="50" height="30" class="ft st"/><text x="395" y="292" text-anchor="middle" font-size="12">40</text><text x="395" y="318" class="tm" text-anchor="middle" font-size="10">5</text>
<rect x="422" y="272" width="50" height="30" class="ft st"/><text x="447" y="292" text-anchor="middle" font-size="12">15</text><text x="447" y="318" class="tm" text-anchor="middle" font-size="10">6</text>
<rect x="474" y="272" width="50" height="30" class="ft st"/><text x="499" y="292" text-anchor="middle" font-size="12">25</text><text x="499" y="318" class="tm" text-anchor="middle" font-size="10">7</text>
</svg><figcaption>The 8 pending deliveries as a min-heap on minutes left. Top: the tree; bottom: the list it is actually stored in, level by level. Every parent is ≤ its children, so index 0 holds the most urgent order, O7. The rest is not sorted: index 1 holds 12 while index 2 holds 8.</figcaption></figure>
  <p>Walk through the picture. The root, index 0, holds 5 (O7). Its children are at indices 1 and 2, holding 12 and 8; both are bigger than 5, as the rule requires. Index 1's children are at 3 and 4 (18 and 30), index 2's children are at 5 and 6 (40 and 15), and index 3's left child is at 7 (25). There is a simple pattern: the children of the node at index i are always at <strong>2i + 1</strong> and <strong>2i + 2</strong>, and so the parent of index i is at <strong>(i − 1) // 2</strong>. These three formulas replace pointers entirely. Let us check them, and the heap property, on the list:</p>
<div class="fx" data-lang="py">h = [5, 12, 8, 18, 30, 40, 15, 25]
n = len(h)
for i in range(n):
    kids = [h[c] for c in (2 * i + 1, 2 * i + 2) if c &lt; n]
    parent = h[(i - 1) // 2] if i &gt; 0 else None
    print(f"i={i} value={h[i]:2}  parent={parent}  children={kids}")
print("every parent &lt;= its children:", all(h[(i - 1) // 2] &lt;= h[i] for i in range(1, n)))
print("is the list sorted?", h == sorted(h))</div>
  <div class="fx" data-lang="text">i=0 value= 5  parent=None  children=[12, 8]
i=1 value=12  parent=5  children=[18, 30]
i=2 value= 8  parent=5  children=[40, 15]
i=3 value=18  parent=12  children=[25]
i=4 value=30  parent=12  children=[]
i=5 value=40  parent=8  children=[]
i=6 value=15  parent=8  children=[]
i=7 value=25  parent=18  children=[]
every parent &lt;= its children: True
is the list sorted? False</div>
  <p>Every line agrees with the picture, and the last two lines state the key fact of this whole note: the heap property holds everywhere, yet the list is <em>not</em> sorted. A heap promises only that the minimum is at index 0. Think of an army's chain of command: every officer outranks the soldiers directly under them, so the general at the top outranks everyone, but that tells you nothing about how two captains in different units compare.</p>
  <p>Because the tree is complete, its height is ⌊log₂ n⌋: 8 deliveries fit in 4 levels (height 3), a million items in about 20. That number is what every heap operation costs, as the next section shows.</p>

  <h2 id="dsa-hp-ops"><span class="num">03</span>Push and Pop: Sift Up, Sift Down</h2>
  <p>A priority queue needs two operations: <em>push</em> a new item, and <em>pop</em> the smallest. Both break the heap property in exactly one place, and both repair it by swapping along a single path from the root to a leaf. Since that path has at most log₂ n steps, both are O(log n).</p>
  <p>To <strong>push</strong>, append the new item at the end of the list, which is the next free spot on the bottom level, so the tree stays complete. The new item might be smaller than its parent, which would break the rule. So compare it with its parent and swap them if it is smaller, then compare again from its new position, and keep going until its parent is smaller or it reaches the root. This is called <strong>sift up</strong>: the new item bubbles up to its correct level, like a new employee who keeps getting promoted while they outrank their boss.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="hp-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><line x1="95" y1="50" x2="48" y2="108" stroke="currentColor" /><line x1="95" y1="50" x2="142" y2="108" stroke="currentColor" /><line x1="48" y1="108" x2="24" y2="166" stroke="currentColor" /><line x1="48" y1="108" x2="71" y2="166" stroke="currentColor" /><line x1="142" y1="108" x2="119" y2="166" stroke="currentColor" /><circle cx="95" cy="50" r="17" style="fill:var(--bg)"/><circle cx="95" cy="50" r="17" class="fb sb"/><text x="95" y="54" text-anchor="middle">1</text><circle cx="48" cy="108" r="17" style="fill:var(--bg)"/><circle cx="48" cy="108" r="17" class="fb sb"/><text x="48" y="112" text-anchor="middle">3</text><circle cx="142" cy="108" r="17" style="fill:var(--bg)"/><circle cx="142" cy="108" r="17" class="fb sb"/><text x="142" y="112" text-anchor="middle">8</text><circle cx="24" cy="166" r="17" style="fill:var(--bg)"/><circle cx="24" cy="166" r="17" class="fb sb"/><text x="24" y="170" text-anchor="middle">5</text><circle cx="71" cy="166" r="17" style="fill:var(--bg)"/><circle cx="71" cy="166" r="17" class="fb sb"/><text x="71" y="170" text-anchor="middle">9</text><circle cx="119" cy="166" r="17" style="fill:var(--bg)"/><circle cx="119" cy="166" r="17" class="fr sr"/><text x="119" y="170" text-anchor="middle">2</text><text x="95" y="18" text-anchor="middle">1. append at the end</text><line x1="295" y1="50" x2="248" y2="108" stroke="currentColor" /><line x1="295" y1="50" x2="342" y2="108" stroke="currentColor" /><line x1="248" y1="108" x2="224" y2="166" stroke="currentColor" /><line x1="248" y1="108" x2="271" y2="166" stroke="currentColor" /><line x1="342" y1="108" x2="319" y2="166" stroke="currentColor" /><circle cx="295" cy="50" r="17" style="fill:var(--bg)"/><circle cx="295" cy="50" r="17" class="fb sb"/><text x="295" y="54" text-anchor="middle">1</text><circle cx="248" cy="108" r="17" style="fill:var(--bg)"/><circle cx="248" cy="108" r="17" class="fb sb"/><text x="248" y="112" text-anchor="middle">3</text><circle cx="342" cy="108" r="17" style="fill:var(--bg)"/><circle cx="342" cy="108" r="17" class="fr sr"/><text x="342" y="112" text-anchor="middle">8</text><circle cx="224" cy="166" r="17" style="fill:var(--bg)"/><circle cx="224" cy="166" r="17" class="fb sb"/><text x="224" y="170" text-anchor="middle">5</text><circle cx="271" cy="166" r="17" style="fill:var(--bg)"/><circle cx="271" cy="166" r="17" class="fb sb"/><text x="271" y="170" text-anchor="middle">9</text><circle cx="319" cy="166" r="17" style="fill:var(--bg)"/><circle cx="319" cy="166" r="17" class="fr sr"/><text x="319" y="170" text-anchor="middle">2</text><text x="295" y="18" text-anchor="middle">2. 2 &lt; parent 8 → swap</text><path d="M339,160 Q360,137 362,114" fill="none" class="sr" stroke-width="1.5" marker-end="url(#hp-a1)"/><line x1="495" y1="50" x2="448" y2="108" stroke="currentColor" /><line x1="495" y1="50" x2="542" y2="108" stroke="currentColor" /><line x1="448" y1="108" x2="424" y2="166" stroke="currentColor" /><line x1="448" y1="108" x2="471" y2="166" stroke="currentColor" /><line x1="542" y1="108" x2="519" y2="166" stroke="currentColor" /><circle cx="495" cy="50" r="17" style="fill:var(--bg)"/><circle cx="495" cy="50" r="17" class="fg sg"/><text x="495" y="54" text-anchor="middle">1</text><circle cx="448" cy="108" r="17" style="fill:var(--bg)"/><circle cx="448" cy="108" r="17" class="fb sb"/><text x="448" y="112" text-anchor="middle">3</text><circle cx="542" cy="108" r="17" style="fill:var(--bg)"/><circle cx="542" cy="108" r="17" class="fg sg"/><text x="542" y="112" text-anchor="middle">2</text><circle cx="424" cy="166" r="17" style="fill:var(--bg)"/><circle cx="424" cy="166" r="17" class="fb sb"/><text x="424" y="170" text-anchor="middle">5</text><circle cx="471" cy="166" r="17" style="fill:var(--bg)"/><circle cx="471" cy="166" r="17" class="fb sb"/><text x="471" y="170" text-anchor="middle">9</text><circle cx="519" cy="166" r="17" style="fill:var(--bg)"/><circle cx="519" cy="166" r="17" class="fb sb"/><text x="519" y="170" text-anchor="middle">8</text><text x="495" y="18" text-anchor="middle">3. 2 &gt; parent 1 → stop</text></svg><figcaption>push(2) on a small heap: 2 is appended as the last leaf, swaps with its parent 8 because it is smaller, and stops below 1 because 1 is smaller still.</figcaption></figure>
  <p>To <strong>pop</strong>, the answer is the root, but removing it would leave a hole at the top. The trick is to move the <em>last</em> item in the list into the root's place (removing from the end keeps the tree complete), and then repair the top. The moved item is probably too big for the top, so compare it with its two children and swap it with the <strong>smaller</strong> child; repeat until both children are bigger or it reaches the bottom. This is <strong>sift down</strong>. It must be the smaller child, because whichever child moves up becomes the parent of the other, and only the smaller one can be a valid parent.</p>
  <p>Here are both operations on the running example. First, pushing the minutes of O1 to O8 one at a time into an empty heap:</p>
  <table class="tbl">
    <tr><th>push</th><th>lands at index</th><th>sift up</th><th>heap after</th></tr>
    <tr><td>25 (O1)</td><td>0</td><td>root</td><td>[25]</td></tr>
    <tr><td>12 (O2)</td><td>1</td><td>12 &lt; 25: swap</td><td>[12, 25]</td></tr>
    <tr><td>40 (O3)</td><td>2</td><td>40 ≥ 12: stop</td><td>[12, 25, 40]</td></tr>
    <tr><td>8 (O4)</td><td>3</td><td>8 &lt; 25 swap; 8 &lt; 12 swap</td><td>[8, 12, 40, 25]</td></tr>
    <tr><td>30 (O5)</td><td>4</td><td>30 ≥ 12: stop</td><td>[8, 12, 40, 25, 30]</td></tr>
    <tr><td>15 (O6)</td><td>5</td><td>15 &lt; 40 swap; 15 ≥ 8 stop</td><td>[8, 12, 15, 25, 30, 40]</td></tr>
    <tr><td>5 (O7)</td><td>6</td><td>5 &lt; 15 swap; 5 &lt; 8 swap</td><td>[5, 12, 8, 25, 30, 40, 15]</td></tr>
    <tr><td>18 (O8)</td><td>7</td><td>18 &lt; 25 swap; 18 ≥ 12 stop</td><td>[5, 12, 8, 18, 30, 40, 15, 25]</td></tr>
  </table>
  <p>Then a rider becomes free and pops: the answer is 5 (O7); the last item, 25, moves to the root; its children are 12 and 8, and the smaller is 8, so they swap; now its children are 40 and 15, the smaller is 15, so they swap again; it has reached the bottom. The new root is 8 (O4), the next most urgent order. In total, 8 pushes needed only 7 swaps and the pop needed 2. Here is the whole structure written from scratch, about 30 lines, which interviewers sometimes ask for to check that you understand what <code>heapq</code> does:</p>
<div class="fx" data-lang="py">class MinHeap:
    def __init__(self):
        self.a = []                      # the tree, stored level by level

    def push(self, x):
        a = self.a
        a.append(x)                      # 1. next free spot
        i = len(a) - 1
        while i &gt; 0:                     # 2. sift up
            p = (i - 1) // 2
            if a[i] &lt; a[p]:
                a[i], a[p] = a[p], a[i]
                i = p
            else:
                break

    def pop(self):
        a = self.a
        top = a[0]
        last = a.pop()                   # 1. take the last item out
        if a:
            a[0] = last                  # 2. put it at the root
            i, n = 0, len(a)
            while True:                  # 3. sift down
                l, r, small = 2 * i + 1, 2 * i + 2, i
                if l &lt; n and a[l] &lt; a[small]: small = l
                if r &lt; n and a[r] &lt; a[small]: small = r
                if small == i:
                    break
                a[i], a[small] = a[small], a[i]
                i = small
        return top

minutes = [25, 12, 40, 8, 30, 15, 5, 18]       # O1..O8
mh = MinHeap()
for m in minutes:
    mh.push(m)
print("after 8 pushes:", mh.a)
print("pop", mh.pop(), "-&gt;", mh.a)
print("riders take, in order:", [mh.pop() for _ in range(len(mh.a))])</div>
  <div class="fx" data-lang="text">after 8 pushes: [5, 12, 8, 18, 30, 40, 15, 25]
pop 5 -&gt; [8, 12, 15, 18, 30, 40, 25]
riders take, in order: [8, 12, 15, 18, 25, 30, 40]</div>
  <p>The list after the pushes is exactly the last row of the table, and the pop leaves <code>[8, 12, 15, 18, 30, 40, 25]</code>, matching the hand trace. Popping everything that is left hands out the minutes in increasing order, 8, 12, 15, 18, 25, 30, 40, one O(log n) pop at a time. Repeatedly popping a heap is in fact a sorting algorithm, <strong>heap sort</strong>, with O(n log n) time.</p>
  <p>There is one more operation worth understanding. If all the items are known in advance, we could build the heap with n pushes, costing O(n log n). <strong>Heapify</strong> does it faster: it treats the unsorted list as a complete tree and sifts down every parent, starting from the last parent (index n // 2 − 1) and moving backwards to the root. That is O(n), which surprises most people. The reason is that most nodes are near the bottom, where there is almost nothing below them to sift through: half the nodes are leaves and never move, a quarter can move at most one level, an eighth at most two, and the total is bounded by about 2n. Counting the swaps confirms it:</p>
<div class="fx" data-lang="py">import random

def heapify_swaps(a):
    a, n, swaps = a[:], len(a), 0
    for i in range(n // 2 - 1, -1, -1):          # last parent back to the root
        while True:
            l, r, small = 2 * i + 1, 2 * i + 2, i
            if l &lt; n and a[l] &lt; a[small]: small = l
            if r &lt; n and a[r] &lt; a[small]: small = r
            if small == i: break
            a[i], a[small] = a[small], a[i]; i = small; swaps += 1
    return a, swaps

print(heapify_swaps(minutes))
random.seed(0)
for n in [1_000, 100_000]:
    _, s = heapify_swaps([random.random() for _ in range(n)])
    print(f"n={n:&gt;7,}: {s:&gt;6,} swaps, {s / n:.2f} per item")</div>
  <div class="fx" data-lang="text">([5, 8, 15, 12, 30, 25, 40, 18], 4)
n=  1,000:    780 swaps, 0.78 per item
n=100,000: 74,374 swaps, 0.74 per item</div>
  <p>Heapifying our 8 minutes takes only 4 swaps and produces <code>[5, 8, 15, 12, 30, 25, 40, 18]</code>, which is a different list from the one the pushes built, yet equally valid: the same items can form many correct heaps. On random data the swaps per item stay below one however large n gets, which is what O(n) looks like in practice.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>Why</th></tr>
    <tr><td>peek at the minimum, <code>h[0]</code></td><td>O(1)</td><td>it is always at index 0</td></tr>
    <tr><td>push</td><td>O(log n)</td><td>sift up follows one leaf-to-root path</td></tr>
    <tr><td>pop</td><td>O(log n)</td><td>sift down follows one root-to-leaf path</td></tr>
    <tr><td>heapify n items</td><td>O(n)</td><td>most nodes are near the bottom and barely move</td></tr>
    <tr><td>search for, or delete, an arbitrary value</td><td>O(n)</td><td>no order among siblings, so you may have to scan everything</td></tr>
  </table>

  <h2 id="dsa-hp-heapq"><span class="num">04</span>Python's heapq</h2>
  <p>In practice nobody writes <code>MinHeap</code>; Python ships the same algorithm, written in C, as the <code>heapq</code> module. It is not a class. It is a set of functions that treat an ordinary Python list as a min-heap: you own the list, and the functions keep it in heap order. <code>heappush(h, x)</code> pushes, <code>heappop(h)</code> pops the smallest, <code>h[0]</code> peeks, and <code>heapify(h)</code> turns an existing list into a heap in place in O(n).</p>
  <p>Real items have more than a priority: the dispatcher needs to know <em>which order</em> has 5 minutes left. The usual way is to push tuples. Python compares tuples field by field, so a tuple <code>(minutes, order)</code> is ordered by minutes first, and the order name only matters when two minutes are equal. Two more tools complete the picture. Python has no max-heap, so to get "biggest first" you push the <em>negative</em> of the priority: the smallest negative belongs to the biggest original value, and you negate again when reading. And <code>nlargest(k, items)</code> and <code>nsmallest(k, items)</code> return the k biggest or smallest items directly, optionally with a <code>key</code> function.</p>
<div class="fx" data-lang="py">import heapq

orders = ["O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8"]
bills = [120, 80, 250, 40, 310, 80, 60, 200]

urgent = []
for m, o in zip(minutes, orders):
    heapq.heappush(urgent, (m, o))               # priority first, then the item
print("riders take:", [heapq.heappop(urgent)[1] for _ in range(3)], "| next up:", urgent[0])

vip = [(-b, o) for b, o in zip(bills, orders)]   # max-heap by bill: store negatives
heapq.heapify(vip)
b, o = heapq.heappop(vip)
print("most expensive:", o, -b, "| next:", vip[0][1], -vip[0][0])

print(heapq.nlargest(3, bills), heapq.nsmallest(2, minutes))
print(heapq.nlargest(2, zip(orders, bills), key=lambda ob: ob[1]))</div>
  <div class="fx" data-lang="text">riders take: ['O7', 'O4', 'O2'] | next up: (15, 'O6')
most expensive: O5 310 | next: O3 250
[310, 250, 200] [5, 8]
[('O5', 310), ('O3', 250)]</div>
  <p>The riders take O7, O4 and O2, the three most urgent orders, and the next one waiting at the top is O6 with 15 minutes. With negated bills the max-heap hands out O5 (₹310) first, and O3 (₹250) is next. <code>nlargest</code> gives the three biggest bills, <code>nsmallest</code> the two smallest minutes, and with a <code>key</code> it can pick whole (order, bill) pairs by bill.</p>
  <p>Two combined operations save a sift each. <code>heappushpop(h, x)</code> pushes x and then pops the smallest, so it returns whichever is smaller, x or the old top. <code>heapreplace(h, x)</code> pops first and then pushes x, so it always returns the old top, even if x is smaller. Both are useful when a heap must stay the same size, as in the top-k pattern of the next section.</p>
  <p>Tuples have one trap that every heap user meets eventually. O2 and O6 both have a ₹80 bill. If the second field of the tuple is something Python cannot compare, such as a dictionary or a custom object, then two equal priorities force Python to compare the second fields, and it crashes. The fix is to put a unique, increasing counter between the priority and the item, so ties are settled before Python ever looks at the item; as a bonus, equal priorities then come out first-in-first-out.</p>
<div class="fx" data-lang="py">h = []
try:
    for p in [{"id": "O2"}, {"id": "O6"}]:
        heapq.heappush(h, (-80, p))
except TypeError as e:
    print("crash:", e)

h = []
for i, p in enumerate([{"id": "O2"}, {"id": "O6"}]):
    heapq.heappush(h, (-80, i, p))               # i settles ties
print(heapq.heappop(h))</div>
  <div class="fx" data-lang="text">crash: '&lt;' not supported between instances of 'dict' and 'dict'
(-80, 0, {'id': 'O2'})</div>
  <p>The first attempt fails with "'&lt;' not supported between instances of 'dict' and 'dict'"; the second pops O2 first because its counter, 0, is smaller. One last rule: the heap is a plain list, so nothing stops you from calling <code>h.append(x)</code> or <code>h.sort()</code> on it, but doing so bypasses the sifting and silently breaks (or wastefully rebuilds) the heap order. Only touch it through <code>heapq</code> functions. (<code>queue.PriorityQueue</code> also exists, but it is a thread-safe wrapper with locks and is slower; use <code>heapq</code> in algorithms.)</p>

  <h2 id="dsa-hp-topk"><span class="num">05</span>Top-k</h2>
  <p>Finance wants the 3 most expensive orders of the day. <code>sorted(bills)[-3:]</code> works, but it sorts all n bills, O(n log n), and keeps all of them in memory, just to keep 3. On a day with 10 lakh orders, or on a stream of orders that never ends, most of that work is wasted. A heap lets us keep only k candidates at any time.</p>
  <p>The trick confuses almost everyone the first time: to find the k <em>largest</em> items, keep a <em>min</em>-heap of size k. The heap holds the best k seen so far, and its top is the <em>weakest</em> of them, the current cut-off. When a new item arrives, push it; if the heap now has k + 1 items, pop the smallest, which is exactly the one that no longer belongs in the top k. Think of a team with 11 places: every new player who tries out joins, and then the weakest of the 12 is sent home. The weakest player still in the team is the bar a newcomer must beat, so he is the one you want to see first.</p>
  <table class="tbl">
    <tr><th>bill</th><th>heap after push (sorted for reading)</th><th>size &gt; 3?</th><th>heap after</th></tr>
    <tr><td>120, 80, 250</td><td>[80, 120, 250]</td><td>–</td><td>[80, 120, 250]</td></tr>
    <tr><td>40</td><td>[40, 80, 120, 250]</td><td>pop 40</td><td>[80, 120, 250]</td></tr>
    <tr><td>310</td><td>[80, 120, 250, 310]</td><td>pop 80</td><td>[120, 250, 310]</td></tr>
    <tr><td>80, 60</td><td>each is pushed and popped straight back out</td><td>pop 80, pop 60</td><td>[120, 250, 310]</td></tr>
    <tr><td>200</td><td>[120, 200, 250, 310]</td><td>pop 120</td><td><b>[200, 250, 310]</b></td></tr>
  </table>
<div class="fx" data-lang="py">def top_k(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) &gt; k:
            heapq.heappop(h)          # remove the smallest of the k + 1
    return h                          # the k largest; h[0] is the kth largest

best3 = top_k(bills, 3)
print("top 3:", sorted(best3, reverse=True), "| 3rd largest:", best3[0])</div>
  <div class="fx" data-lang="text">top 3: [310, 250, 200] | 3rd largest: 200</div>
  <p>The heap ends holding 200, 250 and 310, and its top, 200, is the 3rd largest bill. Because the heap never holds more than k + 1 items, every push and pop costs O(log k) instead of O(log n), so the total is <strong>O(n log k)</strong> time and only O(k) memory. It gets even better in practice: once the heap is full, a new bill smaller than the cut-off <code>h[0]</code> can be rejected with a single comparison, without touching the heap. On 10 lakh random bills with k = 10:</p>
<div class="fx" data-lang="py">import random, time
random.seed(11)
big = [random.randint(1, 10**6) for _ in range(1_000_000)]
k = 10

t = time.perf_counter(); by_sort = sorted(big, reverse=True)[:k]; t_sort = time.perf_counter() - t

t = time.perf_counter()
h, heap_ops = [], 0
for x in big:
    if len(h) &lt; k:
        heapq.heappush(h, x); heap_ops += 1
    elif x &gt; h[0]:                    # only better bills touch the heap
        heapq.heapreplace(h, x); heap_ops += 1
t_heap = time.perf_counter() - t

t = time.perf_counter(); by_lib = heapq.nlargest(k, big); t_lib = time.perf_counter() - t

print(f"sort everything  : {t_sort:.3f} s")
print(f"size-{k} heap loop: {t_heap:.3f} s  (heap operations: {heap_ops} of {len(big):,} bills)")
print(f"heapq.nlargest   : {t_lib:.3f} s")
print("same answer:", by_sort == sorted(h, reverse=True) == by_lib)</div>
  <div class="fx" data-lang="text">sort everything  : 0.296 s
size-10 heap loop: 0.082 s  (heap operations: 135 of 1,000,000 bills)
heapq.nlargest   : 0.017 s
same answer: True</div>
  <p>The hand-written heap loop beats a full sort even though it is a Python loop competing with C, and <code>nlargest</code>, the same idea optimised in the library, is faster still (exact seconds vary by machine). The striking number is the count of heap operations: only around a hundred of the 10 lakh bills ever entered the heap. Everything else was rejected by one comparison with the cut-off.</p>
  <p>The same pattern, mirrored, finds the k <em>smallest</em> items: keep a <em>max</em>-heap of size k (negated values), whose top is the biggest of the small ones and the first to throw out. A simple sentence fixes which kind to use every time: "the heap's top is the item I am ready to throw away." Recognise top-k from phrases like "k largest", "k smallest", "k closest", "k most frequent", "top 10" or "kth largest element". If k is close to n, or you need the full order anyway, plain sorting is simpler; if k is 1, just use <code>max</code>.</p>

  <h2 id="dsa-hp-stream"><span class="num">06</span>K-th Largest in a Stream</h2>
  <p>Top-k ran once over a finished list. Biteful's live dashboard must show "the 3rd biggest bill so far", updated the instant each new order arrives. Rerunning top-k after every order would cost O(n log k) each time and O(n² log k) over the day. But notice that the size-k min-heap from the last section already <em>is</em> the information we need: it holds the k biggest bills so far, and its top is the k-th biggest. So keep it alive between arrivals. Each new bill does at most one push and one pop, and the answer is always <code>h[0]</code>.</p>
  <p>Say the dashboard starts with the first three bills, [120, 80, 250], so the heap is [80, 120, 250] and the answer is 80. Then 40 arrives: it is below the cut-off 80, so it is rejected and the answer stays 80. Then 310 arrives: it beats 80, which is replaced, and the heap becomes [120, 250, 310], answer 120. Then 80 and 60 are rejected, and finally 200 replaces 120, making the answer 200.</p>
<div class="fx" data-lang="py">class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.h = nums[:]
        heapq.heapify(self.h)                 # O(n)
        while len(self.h) &gt; k:
            heapq.heappop(self.h)             # keep only the k largest

    def add(self, val):
        if len(self.h) &lt; self.k:
            heapq.heappush(self.h, val)       # still filling up
        elif val &gt; self.h[0]:
            heapq.heapreplace(self.h, val)    # replace the cut-off: one sift
        return self.h[0]

board = KthLargest(3, bills[:3])
print("start:", board.h[0], "| after each new bill:", [board.add(b) for b in bills[3:]])
lc = KthLargest(3, [4, 5, 8, 2])
print([lc.add(x) for x in [3, 5, 10, 9, 4]])</div>
  <div class="fx" data-lang="text">start: 80 | after each new bill: [80, 120, 120, 120, 200]
[4, 5, 5, 8, 8]</div>
  <p>The dashboard shows 80, then 80, 120, 120, 120, 200 as the five remaining bills arrive, exactly as traced; the second line is LeetCode's own example for this problem. The <code>len(self.h) &lt; self.k</code> branch matters when the class starts with fewer than k values: until the heap has k items there is no k-th largest yet, and the new value must simply be added. Each <code>add</code> costs O(log k) and the memory stays O(k), however long the stream runs. The signals for this pattern are "stream", "after each insertion return…", "design a class", "leaderboard", or "smallest available seat number".</p>

  <h2 id="dsa-hp-merge"><span class="num">07</span>Merge k Sorted Lists</h2>
  <p>So far all the items came from one place. Now three restaurant kitchens each send a list of when their orders will be ready (in minutes from now), and each list is already sorted: Dosa Corner [5, 18, 30], Wok Express [8, 12, 40] and Sweet Tooth [15, 25]. The riders need a single time-ordered list. Joining the lists and sorting the result works but costs O(N log N) for N items, and throws away the fact that each list is already in order.</p>
  <p>The key observation is that the next item overall must be the smallest of the <em>current heads</em> of the lists, because each list's head is its own smallest remaining item. So we only ever need to compare k items, one per list, and a heap does exactly that. Put the first item of every list into a min-heap, along with which list it came from. Repeatedly pop the smallest, output it, and push the next item from the <em>same</em> list. Think of three queues at a ticket counter, each already in order of arrival time: the clerk only needs to look at the person at the front of each queue and call whoever arrived earliest.</p>
  <table class="tbl">
    <tr><th>heap before pop</th><th>pop</th><th>push next from that kitchen</th><th>output so far</th></tr>
    <tr><td>(5,D) (8,W) (15,S)</td><td>5 (D)</td><td>18 (D)</td><td>5</td></tr>
    <tr><td>(8,W) (15,S) (18,D)</td><td>8 (W)</td><td>12 (W)</td><td>5 8</td></tr>
    <tr><td>(12,W) (15,S) (18,D)</td><td>12 (W)</td><td>40 (W)</td><td>5 8 12</td></tr>
    <tr><td>(15,S) (18,D) (40,W)</td><td>15 (S)</td><td>25 (S)</td><td>… 15</td></tr>
    <tr><td>(18,D) (25,S) (40,W)</td><td>18 (D)</td><td>30 (D)</td><td>… 18</td></tr>
    <tr><td>(25,S) (30,D) (40,W)</td><td>25, 30, 40 in turn</td><td>lists run out</td><td>5 8 12 15 18 25 30 40</td></tr>
  </table>
<div class="fx" data-lang="py">def merge_k(lists):
    h = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]   # (value, which list, position)
    heapq.heapify(h)
    out = []
    while h:
        val, i, j = heapq.heappop(h)          # smallest head of all lists
        out.append(val)
        if j + 1 &lt; len(lists[i]):
            heapq.heappush(h, (lists[i][j + 1], i, j + 1))
    return out

kitchens = [[5, 18, 30], [8, 12, 40], [15, 25]]
print(merge_k(kitchens))
print(list(heapq.merge(*kitchens)))          # the library version
print(merge_k([[1, 4, 5], [1, 3, 4], [2, 6]]), merge_k([]), merge_k([[], [1]]))</div>
  <div class="fx" data-lang="text">[5, 8, 12, 15, 18, 25, 30, 40]
[5, 8, 12, 15, 18, 25, 30, 40]
[1, 1, 2, 3, 4, 4, 5, 6] [] [1]</div>
  <p>The merged list is exactly the 8 deliveries' minutes in order, the same order the heap of section 03 popped them in. <code>heapq.merge</code> does the same thing lazily, as a generator. The edge cases on the last line, no lists at all and an empty list among others, are handled by skipping empty lists when building the first heap. The list index <code>i</code> in each tuple does double duty: it says which list to take the next item from, and it breaks ties between equal values. That second job matters in the LeetCode version of this problem, where the lists are linked lists: the heap holds <code>(node.val, i, node)</code>, and without <code>i</code>, two equal values would make Python try to compare two nodes and crash.</p>
  <p>The heap never holds more than k items, and each of the N items is pushed once and popped once, so the cost is <strong>O(N log k)</strong> time and O(k) extra space. Because it only ever looks at the front of each list, it also works when the lists are huge files or endless streams that do not fit in memory, which is how databases merge sorted chunks of data on disk. Recognise it from "k sorted lists / arrays / files", "kth smallest in a sorted matrix" (each row is a sorted list) or "smallest range covering elements from k lists".</p>

  <h2 id="dsa-hp-median"><span class="num">08</span>Two Heaps: Running Median</h2>
  <p>A heap always hands over an extreme value, the smallest or the biggest. Finance's next question is about the <em>middle</em>: "What is the median bill so far?", after every order. The <strong>median</strong> is the middle value when the values are sorted; with an even count it is the average of the two middle values. Keeping a sorted list and reading the middle works, but every insert is O(n). One heap cannot help, because it only knows its top. The trick is to use two.</p>
  <p>Split the bills seen so far into a lower half and an upper half. Keep the lower half in a <strong>max</strong>-heap, whose top is the biggest of the small bills, and the upper half in a <strong>min</strong>-heap, whose top is the smallest of the big bills. If every value in the lower half is ≤ every value in the upper half, and the two halves have equal size (or the lower half has one extra), then the median is sitting right at the tops: it is the lower top when the count is odd, and the average of the two tops when it is even. Picture a class lined up by height and split into two groups at the middle: the tallest student of the short group and the shortest student of the tall group stand next to each other, and the median is between them.</p>
  <p>The rule for adding a value keeps both conditions true with three moves. Push the new value into the lower heap. Then move the lower heap's biggest value across to the upper heap; this guarantees that nothing in the lower half is bigger than anything in the upper half. Finally, if the upper heap has become bigger than the lower one, move its smallest value back. Here are the 8 bills arriving one by one:</p>
  <table class="tbl">
    <tr><th>add</th><th>lower half (max-heap)</th><th>upper half (min-heap)</th><th>median</th></tr>
    <tr><td>120</td><td>120</td><td>–</td><td>120</td></tr>
    <tr><td>80</td><td>80</td><td>120</td><td>(80 + 120) / 2 = 100</td></tr>
    <tr><td>250</td><td>80, 120</td><td>250</td><td>120</td></tr>
    <tr><td>40</td><td>40, 80</td><td>120, 250</td><td>100</td></tr>
    <tr><td>310</td><td>40, 80, 120</td><td>250, 310</td><td>120</td></tr>
    <tr><td>80</td><td>40, 80, 80</td><td>120, 250, 310</td><td>100</td></tr>
    <tr><td>60</td><td>40, 60, 80, 80</td><td>120, 250, 310</td><td>80</td></tr>
    <tr><td>200</td><td>40, 60, 80, 80</td><td>120, 200, 250, 310</td><td>(80 + 120) / 2 = 100</td></tr>
  </table>
<div class="fx" data-lang="py">class MedianFinder:
    def __init__(self):
        self.small = []      # max-heap (negatives): lower half
        self.large = []      # min-heap: upper half

    def add(self, x):
        heapq.heappush(self.small, -x)
        heapq.heappush(self.large, -heapq.heappop(self.small))   # biggest small value moves up
        if len(self.large) &gt; len(self.small):                    # keep small the same size or 1 bigger
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def median(self):
        if len(self.small) &gt; len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2

mf = MedianFinder()
medians = []
for b in bills:
    mf.add(b)
    medians.append(mf.median())
print(medians)
print("lower:", sorted(-v for v in mf.small), "upper:", sorted(mf.large))</div>
  <div class="fx" data-lang="text">[120, 100.0, 120, 100.0, 120, 100.0, 80, 100.0]
lower: [40, 60, 80, 80] upper: [120, 200, 250, 310]</div>
  <p>The medians after each arrival are 120, 100, 120, 100, 120, 100, 80 and 100, matching the table, and the final halves are {40, 60, 80, 80} and {120, 200, 250, 310}. Each <code>add</code> does a constant number of pushes and pops, so it is O(log n), and reading the median is O(1). The one mistake to avoid is skipping the "move across" step and simply pushing each value into whichever heap is smaller: the sizes stay balanced, but a big bill can land in the lower half, the halves stop being halves, and the median comes out wrong. Recognise this pattern from "running median", "median of a data stream", "sliding window median" (which also needs a way to remove old values, see Common Mistakes), or any problem that keeps two competing groups balanced.</p>

  <h2 id="dsa-hp-sched"><span class="num">09</span>Task Scheduler</h2>
  <p>Every pattern so far took the best item the moment it was asked for. Real schedules often have waiting rules. A rider has 6 pickups this hour: 3 from Dosa Corner (call it A), 2 from Wok Express (B) and 1 from Sweet Tooth (C). After handing over an order, a kitchen needs <strong>2 slots</strong> before it can hand over the next one, so two pickups from the same kitchen must be at least 3 slots apart. In a slot where nothing is ready, the rider must wait (an idle slot). What is the smallest number of slots?</p>
  <p>The greedy idea is: in every slot, take the available task with the <strong>most copies still remaining</strong>, because that is the task hardest to fit in later; if you leave A's three pickups until the end, they will be forced into a row with idle slots between them. A max-heap of remaining counts gives that task instantly. But once a task runs, it is unavailable for a while, so it cannot stay in the heap. It waits in a FIFO queue together with the slot number at which it becomes available again, and goes back into the heap at that time. The heap answers "what is the best task now?", and the queue holds "tasks that are cooling down", in the order they will come back.</p>
  <table class="tbl">
    <tr><th>slot</th><th>heap (remaining copies)</th><th>run</th><th>cooling down after the slot</th></tr>
    <tr><td>1</td><td>A3 B2 C1</td><td>A</td><td>A2 (ready after slot 3)</td></tr>
    <tr><td>2</td><td>B2 C1</td><td>B</td><td>A2, B1 (after 4)</td></tr>
    <tr><td>3</td><td>C1</td><td>C (done)</td><td>A2 returns to the heap; B1 waits</td></tr>
    <tr><td>4</td><td>A2</td><td>A</td><td>B1 returns; A1 (after 6)</td></tr>
    <tr><td>5</td><td>B1</td><td>B (done)</td><td>A1</td></tr>
    <tr><td>6</td><td>(empty)</td><td><b>idle</b></td><td>A1 returns</td></tr>
    <tr><td>7</td><td>A1</td><td>A (done)</td><td>–</td></tr>
  </table>
<div class="fx" data-lang="py">from collections import Counter, deque

def schedule(tasks, n):
    heap = [(-c, t) for t, c in Counter(tasks).items()]   # max-heap by remaining count
    heapq.heapify(heap)
    cooling = deque()                                     # (slot when ready again, -count, task)
    slot, plan = 0, []
    while heap or cooling:
        slot += 1
        if heap:
            c, t = heapq.heappop(heap)
            plan.append(t)
            if c + 1 &lt; 0:                                 # copies left: cool down
                cooling.append((slot + n, c + 1, t))
        else:
            plan.append("idle")
        if cooling and cooling[0][0] == slot:             # ready again: back to the heap
            _, c, t = cooling.popleft()
            heapq.heappush(heap, (c, t))
    return plan

def least_interval(tasks, n):                             # just the length, by formula
    counts = Counter(tasks).values()
    top = max(counts)
    n_top = sum(1 for c in counts if c == top)
    return max(len(tasks), (top - 1) * (n + 1) + n_top)

plan = schedule("AAABBC", 2)
print(" ".join(plan), "-&gt;", len(plan), "slots | formula:", least_interval("AAABBC", 2))
for tasks, n in [("AAABBB", 2), ("AAABBB", 0), ("AAAAAABCDEFG", 2)]:
    print(tasks, n, "-&gt;", len(schedule(tasks, n)), least_interval(tasks, n))</div>
  <div class="fx" data-lang="text">A B C A B idle A -&gt; 7 slots | formula: 7
AAABBB 2 -&gt; 8 8
AAABBB 0 -&gt; 6 6
AAAAAABCDEFG 2 -&gt; 16 16</div>
  <p>The simulation produces A B C A B idle A, 7 slots, as traced, and agrees with the formula on the other inputs too. The formula explains the answer without simulating. The most frequent task, A, appears f = 3 times, and between consecutive A's there must be a full block of n + 1 = 3 slots; that is (f − 1) × (n + 1) = 6 slots, plus one final slot for the last A (or more, if other tasks also appear f times). If there are so many different tasks that no idle slot is ever needed, the answer is simply the number of tasks, hence the <code>max</code>. The interview version of this problem only asks for the number, so the formula is O(N) to count; the simulation, O(T log m) for T slots and m distinct tasks, is what you need when the actual plan matters, and its "heap of the best available plus a queue of the temporarily unavailable" shape reappears in CPU scheduling, server assignment and "reorganise a string so no two neighbours are equal" problems.</p>

  <h2 id="dsa-hp-patterns"><span class="num">10</span>Recognising the Pattern</h2>
  <p>Every heap pattern answers the same underlying need: you repeatedly want the best item of a collection that keeps changing. What differs is what the heap holds and what you do with its top. Before coding, say one sentence out loud: either "the heap's top is the item I will <em>use</em> next" (taking the best, merging, scheduling) or "the heap's top is the item I will <em>throw away</em> next" (top-k, k-th in a stream, the two halves of a median). That sentence decides min-heap or max-heap every time.</p>
  <table class="tbl">
    <tr><th>Trigger words in the problem</th><th>Pattern</th><th>What the heap holds</th><th>Cost</th></tr>
    <tr><td>"most urgent first", "smash the two heaviest", "take from the richest pile"</td><td>repeatedly take the best</td><td>everything (max via negation)</td><td>O(n + m log n) for m picks</td></tr>
    <tr><td>"k largest / smallest / closest / most frequent", "top 10"</td><td>top-k</td><td>k items, opposite kind</td><td>O(n log k)</td></tr>
    <tr><td>"stream", "after each add return the kth…"</td><td>k-th in a stream</td><td>a size-k heap kept alive</td><td>O(log k) per add</td></tr>
    <tr><td>"k sorted lists / arrays / files", "kth smallest in a sorted matrix"</td><td>k-way merge</td><td>one head per list</td><td>O(N log k)</td></tr>
    <tr><td>"running median", "sliding window median", two balanced groups</td><td>two heaps</td><td>max-heap lower half, min-heap upper half</td><td>O(log n) add, O(1) read</td></tr>
    <tr><td>"cooldown", "no two adjacent equal", "CPU / server scheduling", "meeting rooms"</td><td>greedy schedule</td><td>available items; a queue or sorted events for the rest</td><td>O(n log n)</td></tr>
  </table>
  <p>Two skeletons cover most of these, shown here as runnable functions on the running example. The first serves the current best repeatedly; the second keeps the k best by a key, with a counter in each tuple so that ties never compare the items themselves:</p>
<div class="fx" data-lang="py">def take_best(items, steps):
    h = list(items)
    heapq.heapify(h)                          # O(n)
    return [heapq.heappop(h) for _ in range(min(steps, len(h)))]

def top_k_by(items, k, key):
    h = []
    for i, x in enumerate(items):
        entry = (key(x), i, x)                # i settles ties
        if len(h) &lt; k:
            heapq.heappush(h, entry)
        elif entry &gt; h[0]:
            heapq.heapreplace(h, entry)       # drop the current cut-off
    return [x for _, _, x in sorted(h, reverse=True)]

print(take_best(zip(minutes, orders), 3))
print(top_k_by(list(zip(orders, bills)), 3, key=lambda ob: ob[1]))</div>
  <div class="fx" data-lang="text">[(5, 'O7'), (8, 'O4'), (12, 'O2')]
[('O5', 310), ('O3', 250), ('O8', 200)]</div>
  <p>The first gives the three most urgent deliveries with their minutes; the second gives the three most expensive orders with their bills. One more piece of judgement: a heap is not always the answer. If all the data is known in advance and you need it in full sorted order, <code>sorted</code> is simpler and fast. Heaps win when data keeps arriving, when k is much smaller than n, or when the "best" item changes as you go.</p>

  <h2 id="dsa-hp-problems"><span class="num">11</span>More Classic Problems</h2>
  <p>Several famous heap problems are already solved above: Kth Largest in a Stream (section 06), Merge k Sorted Lists (07), Find Median from Data Stream (08) and Task Scheduler (09). Three more come up constantly, and each adds a small twist to the top-k pattern.</p>
  <p><strong>Kth Largest Element in an Array</strong> asks for the k-th largest value of an unsorted array, for example the 2nd largest of [3, 2, 1, 5, 6, 4], which is 5. Sorting and reading index −k costs O(n log n); the size-k min-heap from section 05 costs O(n log k), and its top at the end is the answer. In an interview, also mention <em>quickselect</em>, a partitioning method related to quicksort that finds the k-th element in O(n) on average. <strong>Top K Frequent Elements</strong> asks for the k values that occur most often. The twist is to count first with a <code>Counter</code> (a dictionary from value to number of occurrences) and then run top-k on the counts. Because a count can never exceed n, there is also an O(n) answer that interviewers like to hear: put each value into a "bucket" list indexed by its count, then read the buckets from the highest count down. <strong>K Closest Points to Origin</strong> asks for the k points nearest to (0, 0), or in Biteful terms, the k riders nearest to a restaurant. Now we want the k <em>smallest</em> distances, so the heap is the opposite kind, a max-heap of size k using negated distances, and its top is the farthest point still kept. Comparing squared distances avoids square roots, since the order does not change.</p>
<div class="fx" data-lang="py">def find_kth_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) &gt; k:
            heapq.heappop(h)
    return h[0]

def top_k_frequent(nums, k):
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)

def top_k_frequent_bucket(nums, k):           # O(n): a count is at most n
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(nums), 0, -1):
        for x in buckets[c]:
            out.append(x)
            if len(out) == k:
                return out
    return out

def k_closest(points, k):
    h = []                                    # max-heap of size k on squared distance
    for x, y in points:
        heapq.heappush(h, (-(x * x + y * y), x, y))
        if len(h) &gt; k:
            heapq.heappop(h)                  # drop the farthest
    return sorted([x, y] for _, x, y in h)

print(find_kth_largest([3, 2, 1, 5, 6, 4], 2), find_kth_largest(bills, 3))
print(top_k_frequent(bills, 1), top_k_frequent([1, 1, 1, 2, 2, 3], 2), top_k_frequent_bucket([1, 1, 1, 2, 2, 3], 2))
print(k_closest([[3, 3], [5, -1], [-2, 4]], 2))</div>
  <div class="fx" data-lang="text">5 200
[80] [1, 2] [1, 2]
[[-2, 4], [3, 3]]</div>
  <p>The 2nd largest of the sample array is 5, and the 3rd largest bill is ₹200, the same cut-off as in section 05. The most frequent bill is ₹80 (O2 and O6), and both versions of top-k frequent agree on [1, 2] for the standard example. The two closest points are (3, 3) and (−2, 4), with squared distances 18 and 20, while (5, −1) at 26 is dropped. All three heap versions are O(n log k) time and O(k) extra space.</p>
  <p>For practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, this order adds one idea at a time. Start with "repeatedly take the best": <b>1046 Last Stone Weight</b> (the max-heap trick) and <b>2558 Take Gifts From the Richest Pile</b>. Then top-k: <b>215 Kth Largest Element in an Array</b>, <b>973 K Closest Points to Origin</b>, <b>347 Top K Frequent Elements</b> and <b>692 Top K Frequent Words</b> (ties broken alphabetically). Then the stream version, <b>703 Kth Largest Element in a Stream</b>. Next, k-way merge with <b>23 Merge k Sorted Lists</b> and <b>378 Kth Smallest Element in a Sorted Matrix</b>; two heaps with <b>295 Find Median from Data Stream</b> and <b>502 IPO</b>; and scheduling with <b>621 Task Scheduler</b>, <b>767 Reorganize String</b> and <b>1834 Single-Threaded CPU</b> (sort tasks by arrival, keep a heap of the ones that have arrived). For each problem, say the "top is the item I use / throw away" sentence before choosing min or max.</p>

  <h2 id="dsa-hp-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common misunderstanding is reading the heap list as if it were sorted. Only <code>h[0]</code> means anything. In our deliveries heap, <code>h[1]</code> is 12, but the second most urgent order is 8, sitting at <code>h[2]</code>. To get the k smallest in order, pop k times or use <code>nsmallest</code>.</p>
<div class="fx" data-lang="py">h = []
for m, o in zip(minutes, orders):
    heapq.heappush(h, (m, o))
print("h[1] is", h[1], "but the 2nd most urgent is", heapq.nsmallest(2, h)[1])</div>
  <div class="fx" data-lang="text">h[1] is (12, 'O2') but the 2nd most urgent is (8, 'O4')</div>
  <p>The second is editing the list directly. <code>h.append(x)</code>, <code>h[0] = x</code> or <code>h.remove(x)</code> do not sift, so they silently break the heap property, and later pops return wrong answers without any error:</p>
<div class="fx" data-lang="py">h = [5, 12, 8, 18, 30, 40, 15, 25]
h.append(1)                                   # bypasses sift up
print("pop after append:", heapq.heappop(h))

h = [5, 12, 8, 18, 30, 40, 15, 25]
heapq.heappush(h, 1)                          # the right way
print("pop after heappush:", heapq.heappop(h))</div>
  <div class="fx" data-lang="text">pop after append: 5
pop after heappush: 1</div>
  <p>After a plain <code>append</code>, the 1 sits at the bottom of the tree and the pop wrongly returns 5; with <code>heappush</code>, the 1 sifts up to the root and is popped first. If you ever must edit the list directly, call <code>heapify</code> again afterwards.</p>
  <p>A third mistake is trying to delete or update an item in the middle of the heap. There is no fast way to find it, since the heap has no order among siblings, so <code>h.remove(x)</code> is O(n) and also breaks the order. The standard fix is <strong>lazy deletion</strong>: instead of removing the old entry, push the updated version and record the old one as invalid (in a set or dictionary); whenever you pop, first throw away entries that have been marked invalid. If O3's promised time changes, you push its new entry and ignore the stale one when it surfaces. Dijkstra's algorithm and the sliding-window median both rely on this.</p>
  <p>Finally, three smaller slips. Using the wrong heap kind for top-k (a max-heap of everything for the k largest) gives right answers but O(n) memory and no streaming; remember that the top is the one you throw away. Building a heap with n pushes costs O(n log n) when <code>heapify</code> does it in O(n). And pushing tuples whose second field cannot be compared, such as dictionaries or nodes, crashes on the first tie; put a counter in between, as in section 04. A related reflex: if a problem says "priority" or "most urgent", reaching for <code>deque</code> because of the word "queue" is wrong, since a deque only knows arrival order.</p>

  <h2 id="dsa-hp-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Priority queue</b>: insert items; remove the one with the best priority, regardless of arrival order.</li>
    <li><b>Min-heap</b>: complete binary tree where every parent ≤ its children; <code>h[0]</code> is the minimum. <b>Max-heap</b>: parent ≥ children.</li>
    <li><b>Complete tree</b>: all levels full except the last, filled from the left; stored in a list with no gaps.</li>
    <li><b>Sift up / sift down</b>: swap along one path to restore the heap property after a push / pop.</li>
    <li><b>Heapify</b>: build a heap from a list in O(n) by sifting down every parent from the last one backwards.</li>
    <li><b>Lazy deletion</b>: mark entries invalid and skip them when popped, instead of removing from the middle.</li>
  </ul>
  <h3>Formulas and costs</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Value</th></tr>
    <tr><td>children of i / parent of i</td><td>2i + 1, 2i + 2 / (i − 1) // 2</td></tr>
    <tr><td>height</td><td>⌊log₂ n⌋</td></tr>
    <tr><td>peek / push / pop</td><td>O(1) / O(log n) / O(log n)</td></tr>
    <tr><td>heapify / search / delete arbitrary</td><td>O(n) / O(n) / O(n) (use lazy deletion)</td></tr>
    <tr><td>top-k with a size-k heap</td><td>O(n log k) time, O(k) space</td></tr>
    <tr><td>k-way merge of N items</td><td>O(N log k)</td></tr>
    <tr><td>running median</td><td>add O(log n), read O(1)</td></tr>
    <tr><td>task scheduler length</td><td>max(T, (f − 1)(n + 1) + c): T tasks, f top count, c tasks with count f, n cooldown</td></tr>
  </table>
  <h3>heapq syntax</h3>
  <div class="fx" data-lang="py">import heapq
heapq.heappush(h, x); x = heapq.heappop(h); top = h[0]
heapq.heapify(lst)                       # O(n), in place
heapq.heappush(h, -x); biggest = -h[0]   # max-heap trick
heapq.heappush(h, (priority, count, item))   # safe ties
heapq.heappushpop(h, x)                  # push then pop
heapq.heapreplace(h, x)                  # pop then push
heapq.nlargest(k, it, key=f); heapq.nsmallest(k, it, key=f)
heapq.merge(*sorted_lists)               # lazy k-way merge</div>
  <h3>Running example</h3>
  <ul>
    <li>Minutes O1..O8: 25, 12, 40, 8, 30, 15, 5, 18 → pushed heap [5, 12, 8, 18, 30, 40, 15, 25]; riders take O7, O4, O2.</li>
    <li>Bills: 120, 80, 250, 40, 310, 80, 60, 200 → top 3 {200, 250, 310}; running medians 120, 100, 120, 100, 120, 100, 80, 100.</li>
    <li>Kitchens merged: 5 8 12 15 18 25 30 40. Pickups AAABBC, cooldown 2 → 7 slots.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>The list is not sorted; only <code>h[0]</code> is meaningful.</li>
    <li>Never <code>append</code>, assign or <code>remove</code> on a heap list directly.</li>
    <li>k largest → min-heap of size k; k smallest → max-heap of size k.</li>
    <li>Add a counter to tuples when items cannot be compared.</li>
    <li>Sift down swaps with the <em>smaller</em> child.</li>
  </ul>

  <h2 id="dsa-hp-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a heap, and what does it guarantee?</summary><div class="qa-body">A heap is a complete binary tree, usually stored in a list, in which every parent is ≤ its children (a min-heap) or ≥ them (a max-heap). It guarantees only that the root is the minimum (or maximum). The rest of the list is not sorted: siblings and cousins can be in any order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a priority queue and a heap?</summary><div class="qa-body">A priority queue is the abstract idea: a collection that supports inserting items and removing the one with the best priority. A heap is the most common way to implement it, giving O(log n) insert and remove. A sorted list or a balanced BST could also implement a priority queue, with different costs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is a heap stored in an array? Where are the children and parent of index i?</summary><div class="qa-body">Level by level, left to right, with the root at index 0. The children of i are at 2i + 1 and 2i + 2, and the parent of i is at (i − 1) // 2. This works because a complete tree has no gaps, so no pointers are needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must a heap be a complete tree, when a BST does not have to be?</summary><div class="qa-body">Completeness is what allows the list storage with the index formulas, and it guarantees the height is ⌊log₂ n⌋, so every sift is O(log n). A BST uses pointers and keeps a stronger order (everything sorted), so it can take any shape, and it needs separate balancing rules to keep its height logarithmic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through push and pop. What do they cost?</summary><div class="qa-body">Push appends the item at the next free spot and sifts it up, swapping with its parent while it is smaller. Pop takes the root, moves the last item to the root and sifts it down, swapping with the smaller child while it is bigger. Each follows one root-to-leaf path, so both are O(log n); peeking at the root is O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is heapify O(n) and not O(n log n)?</summary><div class="qa-body">Heapify sifts down every parent from the last one back to the root. A node's sift-down cost is its height, and most nodes are near the bottom: half are leaves and do nothing, a quarter move at most one level, an eighth at most two. The sum n/4·1 + n/8·2 + … is bounded by about 2n. Building with n separate pushes costs O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a sorted array a valid min-heap? Is a min-heap a sorted array?</summary><div class="qa-body">A sorted array is always a valid min-heap, because every element at index i is ≤ the elements at 2i + 1 and 2i + 2. The reverse is false: [5, 12, 8, …] is a valid heap but not sorted. The heap's weaker order is exactly why it is cheaper to maintain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Python's heapq only provides a min-heap. How do you get a max-heap?</summary><div class="qa-body">Store negated priorities: push <code>-x</code> and read <code>-h[0]</code>. For tuples, negate only the priority field, as in <code>(-bill, order)</code>. For objects, you can wrap them in a class whose <code>__lt__</code> compares in reverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You push <code>(1, obj1)</code> and <code>(1, obj2)</code> and get a TypeError. Why, and how do you fix it?</summary><div class="qa-body">Tuples compare field by field, so equal priorities make Python compare obj1 with obj2, and those objects do not support <code>&lt;</code>. Insert a unique increasing counter: <code>(priority, count, obj)</code>. The counter breaks every tie before the objects are compared, and also makes equal priorities come out in insertion order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>To find the k largest elements, which heap do you use and why?</summary><div class="qa-body">A min-heap of size k. Its top is the smallest of the current top k, the cut-off; when a new element is bigger, it replaces the top. At the end the heap holds the k largest and its top is the k-th largest. It costs O(n log k) time and O(k) memory, and it works on a stream.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For finding the k largest of n items, compare sorting, a heap and quickselect.</summary><div class="qa-body">Sorting is O(n log n) and simplest, good when k is close to n or you need everything in order. A size-k heap is O(n log k) with O(k) memory, best when k is small or data streams in. Quickselect finds the k-th element in O(n) on average (O(n²) in the worst case) but needs all data in memory and rearranges it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you merge k sorted lists efficiently?</summary><div class="qa-body">Put the head of each list in a min-heap together with its list index. Repeatedly pop the smallest, output it, and push the next item from the same list. The heap holds at most k items, and each of the N items is pushed and popped once, so it costs O(N log k) time and O(k) extra space, and it works on files or streams that do not fit in memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you maintain the median of a stream of numbers?</summary><div class="qa-body">Keep a max-heap of the lower half and a min-heap of the upper half. Each new number goes into the lower heap, the lower heap's maximum moves to the upper heap, and if the upper heap becomes larger its minimum moves back. Sizes then differ by at most one, so the median is the lower top or the average of both tops: O(log n) per insert, O(1) per query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you remove or update an item that is already inside a heap?</summary><div class="qa-body">There is no efficient direct way, because finding it is O(n). Use lazy deletion: push the updated entry and mark the old one invalid in a set or dictionary; when popping, skip any entry marked invalid. The heap may temporarily hold stale entries, but every operation stays O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What changes if you replace the queue in BFS with a min-heap keyed by distance?</summary><div class="qa-body">Nodes are taken out in order of their current shortest distance instead of discovery order. With equal edge weights this behaves like BFS; with different weights it becomes Dijkstra's algorithm, which finds shortest paths that plain BFS cannot. A stack gives newest-first, a queue oldest-first, and a heap best-first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>h = [5, 1, 8]; heapq.heapify(h); print(heapq.heappushpop(h, 0), heapq.heapreplace(h, 0), h)</code></summary><div class="qa-body"><code>0 1 [0, 5, 8]</code>. After heapify the heap is [1, 5, 8]. <code>heappushpop</code> pushes 0 and then pops the minimum, which is that same 0, leaving the heap unchanged. <code>heapreplace</code> pops the minimum 1 first and then pushes 0, giving [0, 5, 8].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a heap over a balanced BST, and the other way round?</summary><div class="qa-body">Choose a heap when you only ever need the minimum or maximum of a changing collection: it is simpler, stored in one list, and has O(n) heapify and O(1) peek. Choose a balanced BST (or a sorted container) when you also need ordered queries such as "next bigger than x", the k-th element at any time, range queries, or deleting arbitrary values in O(log n).</div></details>
</main>
`
});
