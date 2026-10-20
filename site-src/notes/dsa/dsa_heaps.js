// notes/dsa/dsa_heaps.js — Heaps & Priority Queue
Object.assign(TOPIC_CONTENT, {
  "dsa_heaps": `<main>
<h1>Heaps &amp; Priority Queue</h1>
  <div class="where"><span>DSA</span><span>Trees &amp; Graphs</span><span>Heaps &amp; Priority Queue</span></div>
  <p class="lead">A heap is a list that always knows its smallest (or biggest) item, and keeps knowing it after every insert and remove. It powers Python's <code>heapq</code>, "top-k" questions, streaming medians, schedulers and Dijkstra. The whole note follows one running example: Biteful's 8 pending deliveries, each with a bill (the same 8 charges as the other DSA notes) and the minutes left before its promised time. Every output below is a real run (Python 3.13); timings vary by machine, so the prose quotes rough ratios.</p>

  <h2 id="dsa-hp-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-hp-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="40" y="6" width="560" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Stacks &amp; Queues (newest / oldest first) · Trees (complete trees, height) · Binary Search (insort is O(n))</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-hp-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Heaps &amp; Priority Queue</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · most urgent first</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-hp-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-hp-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-hp-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Graphs</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">Dijkstra = BFS with a heap</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Intervals &amp; Greedy</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">meeting rooms, scheduling</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Sorting</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">heap sort, k-way merge</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-hp-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">used again in</text>
<text x="320" y="245" text-anchor="middle" font-size="11">OS schedulers · "trending top 10" · merging sorted files · the Problem Tracker's heap ladder</text>
</svg><figcaption>Heaps add a third removal order to the stack (newest) and queue (oldest): most urgent. The structure is a complete binary tree from the Trees note, packed into a plain list.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a>, <a class="xref" data-note="dsa_trees">Trees</a>, <a class="xref" data-note="dsa_binsearch">Binary Search</a></b><span>A stack gives the newest item, a queue the oldest. A BST keeps everything sorted but needs node objects and balancing; a sorted list keeps everything sorted but pays O(n) per insert. None of them is cheap when all we want is "the most urgent item, right now, again and again".</span></li>
    <li><b>This note adds: a half-sorted list</b><span>A heap keeps just enough order that the best item is always at index 0: push and pop in O(log n), peek in O(1). Then the patterns built on it: top-k, k-th largest in a stream, k-way merge, two heaps for the median, and greedy scheduling.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_graphs">Graphs</a></b><span>Dijkstra's shortest path is BFS with the queue replaced by a heap. Greedy interval problems (<a class="xref" data-note="dsa_greedy">Intervals &amp; Greedy</a>) use the same "take the best now" loop. Practice problems are in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-hp-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it, and its weakness raises the next question. All numbers come from Biteful's 8 pending deliveries and real runs.</p>
  <ol class="story">
    <li><b>The need</b><span>Q: which delivery must the next free rider take? → The one with the fewest minutes left (O7, 5 min), not the oldest. A list needs a full scan per pick, a sorted list a shift per arrival: with 40,000 pending orders, 5,000 rounds took about 2.3 s (scan), 0.07 s (sorted list) and 0.003 s (heap). What is the heap?</span></li>
    <li><b>Complete tree in a list</b><span>Q: how can a list hold a tree with no pointers? → Fill levels left to right; children of i are 2i + 1 and 2i + 2, parent is (i − 1) // 2. Our heap is [5, 12, 8, 18, 30, 40, 15, 25]. How did the orders get into that shape?</span></li>
    <li><b>Push and pop (sift up / sift down)</b><span>Q: how is the rule kept after each change? → Push appends and swaps up (O7's 5 climbs from index 6 to the root in 2 swaps); pop moves the last item to the root and swaps down with the smaller child. One path each: O(log n). Do we have to write this ourselves?</span></li>
    <li><b>heapq</b><span>Q: what does Python give us? → Functions on a plain list: <code>heappush</code>, <code>heappop</code>, <code>heapify</code>, <code>nlargest</code>. Min-heap only; for "most expensive first" push −bill. Now: Finance wants only the 3 biggest bills…</span></li>
    <li><b>Top-k</b><span>Q: the k biggest of n items without sorting all n? → Keep a min-heap of size k and throw out its smallest: [200, 250, 310]. O(n log k): on 10 lakh bills it beat a full sort about 4×. What if the bills keep arriving?</span></li>
    <li><b>K-th largest in a stream</b><span>Q: the 3rd biggest bill so far, after every new bill? → The same size-3 heap kept alive; its top is the answer: 80, 120, 120, 120, 200. And if orders come from several restaurants, each already in time order?</span></li>
    <li><b>Merge k sorted lists</b><span>Q: one time-ordered queue from 3 sorted kitchen lists? → Heap of the 3 current heads; pop the earliest, push its successor: [5, 8, 12, 15, 18, 25, 30, 40]. O(N log k). But a heap's top is an extreme; what about the middle?</span></li>
    <li><b>Two heaps: running median</b><span>Q: the median bill after each arrival? → Max-heap of the lower half, min-heap of the upper half: medians 120, 100, 120, 100, 120, 100, 80, 100. Last: what if "the best now" has to wait for a cooldown?</span></li>
    <li><b>Task scheduler</b><span>Q: shortest pickup plan when the same restaurant needs 2 slots between pickups? → Max-heap by remaining count plus a cooldown queue: A B C A B idle A = 7 slots, matching (3 − 1) × 3 + 1.</span></li>
  </ol>

  <h2 id="dsa-hp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Heaps &amp; Priority Queue</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Priority queue</b>: "give me the most urgent item next", not the oldest</li>
          <li><b>Heap</b>: the usual way to build one; a complete binary tree with parent ≤ children (min-heap)</li>
          <li><b>Only promise</b>: the root is the min; the rest is NOT sorted</li>
          <li>💡 Hospital emergency room: heart attack goes before a fever, whoever came first</li>
          <li><b>Why not a list?</b> sorted list insert O(n); unsorted list find-min O(n); heap does both O(log n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stored in a list</div>
        <ul>
          <li><b>Children of i</b>: <code>2i+1</code>, <code>2i+2</code> · <b>parent</b>: <code>(i-1)//2</code></li>
          <li><b>Complete tree</b>: every level full except the last, filled left to right → no gaps in the list</li>
          <li><b>push</b>: append at end, sift up (swap with parent while smaller)</li>
          <li><b>pop</b>: take root, move last to root, sift down (swap with smaller child)</li>
          <li><b>Height</b>: log₂ n, so each sift is O(log n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Big-O</div>
        <ul>
          <li><b>peek</b> <code>h[0]</code>: O(1)</li>
          <li><b>push / pop</b>: O(log n)</li>
          <li><b>heapify</b>: O(n), not O(n log n)</li>
          <li><b>search / delete arbitrary</b>: O(n); use lazy deletion instead</li>
          <li><b>k pops</b>: O(k log n); <b>size-k heap over n</b>: O(n log k)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">heapq (min-heap only)</div>
        <ul>
          <li><code>heappush(h, x)</code>, <code>heappop(h)</code>, <code>h[0]</code> peek</li>
          <li><code>heapify(lst)</code> in place · <code>nlargest / nsmallest(k, it, key=)</code></li>
          <li><code>heappushpop</code> (push then pop) · <code>heapreplace</code> (pop then push)</li>
          <li><b>Max-heap trick</b>: push <code>-x</code>, read <code>-h[0]</code></li>
          <li><b>Priorities</b>: push tuples <code>(priority, tiebreak, item)</code></li>
          <li>⚠ <code>h</code> is a plain list; never <code>h.append</code> or sort it between heap calls</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Top-k</b>: heap of size k of the opposite kind (min-heap for k largest); O(n log k)</li>
          <li><b>Stream k-th</b>: the same heap kept alive; answer = top</li>
          <li><b>k-way merge</b>: heap of one head per list; pop min, push its successor</li>
          <li><b>Two heaps</b>: max-heap lower half, min-heap upper half → median in O(1)</li>
          <li><b>Scheduling / greedy</b>: always take the current best (+ cooldown queue)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running example</div>
        <ul>
          <li>O1..O8 minutes left: <b>25, 12, 40, 8, 30, 15, 5, 18</b> → heap [5, 12, 8, 18, 30, 40, 15, 25]</li>
          <li>Bills: <b>120, 80, 250, 40, 310, 80, 60, 200</b> → top-3 [200, 250, 310]</li>
          <li>Running median: 120, 100, 120, 100, 120, 100, 80, 100</li>
          <li>Pickups AAABBC, cooldown 2 → 7 slots</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Kth Largest</b>: min-heap size k; answer <code>h[0]</code></li>
          <li><b>Top K Frequent</b>: Counter + <code>nlargest(k, key=count.get)</code>; bucket sort is O(n)</li>
          <li><b>Merge K Sorted Lists</b>: heap of (val, i, node); O(N log k)</li>
          <li><b>Median from Stream</b>: two heaps, rebalance so sizes differ by ≤ 1</li>
          <li><b>Task Scheduler</b>: max-heap + cooldown queue, or the formula</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-hp-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Most Urgent Order Next</span><span class="rm-sub">Most urgent, not oldest; measured</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-tree"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">A Tree Inside a List</span><span class="rm-sub">Children at 2i+1 and 2i+2</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-ops"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Push &amp; Pop Step by Step</span><span class="rm-sub">Sift up, sift down, traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-impl"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Build One From Scratch</span><span class="rm-sub">30 lines of Python + Big-O table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-heapq"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Python's heapq</span><span class="rm-sub">Min-heap, max-heap trick, ties</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-topk"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Top-k</span><span class="rm-sub">Size-k heap, O(n log k), measured</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-stream"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">K-th Largest in a Stream</span><span class="rm-sub">The same heap, kept alive</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-merge"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Merge k Sorted Lists</span><span class="rm-sub">One head per list</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-median"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Two Heaps: Running Median</span><span class="rm-sub">Lower max-heap, upper min-heap</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-sched"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Task Scheduler</span><span class="rm-sub">Greedy heap + cooldown queue</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-patterns"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Trigger words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-problems"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">More Classic Problems</span><span class="rm-sub">Kth largest, top-k frequent, k closest</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Ties, plain-list edits, wrong heap kind</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hp-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-hp-need"><span class="num">01</span>Always the Most Urgent Order Next</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A stack hands out the newest item and a queue the oldest. Biteful's dispatcher needs neither: she needs the order closest to missing its promised time, and new orders keep arriving while she works. Which structure answers "most urgent" fast, again and again?</p>
  </div>
  <h3>The running example</h3>
  <p>At 8 pm Biteful has 8 pending deliveries. Their bills are the same 8 charges as in the other DSA notes; the new column is how many minutes are left before each order's promised delivery time.</p>
  <table class="tbl"><caption>The running example: 8 pending deliveries</caption>
    <tr><th>order</th><th>O1</th><th>O2</th><th>O3</th><th>O4</th><th>O5</th><th>O6</th><th>O7</th><th>O8</th></tr>
    <tr><td>bill (₹)</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
    <tr><td>minutes left</td><td>25</td><td>12</td><td>40</td><td>8</td><td>30</td><td>15</td><td>5</td><td>18</td></tr>
  </table>
  <p>When a rider becomes free, she must take the delivery with the <strong>fewest minutes left</strong>: O7 (5), then O4 (8), then O2 (12), and so on. Meanwhile new orders keep arriving. That is a <strong>priority queue</strong>: a bag of items where "next" means "the most urgent", not "the oldest". A normal queue (ration-shop line) gives the oldest. A priority queue gives the one with the best priority number.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A government hospital emergency room. A fever came at 9:00, a broken arm at 9:10, a heart attack at 9:20. The triage nurse gives every patient a card: 1 = critical, 2 = serious, 3 = can wait. The doctor only ever asks one question: "who has the smallest number right now?" New patients can arrive any time, and the nurse must answer that question fast, every time.</p>
  </div>
  <p>Why not just keep a Python list?</p>
  <table class="tbl">
    <tr><th>Store pending orders as</th><th>Add an order</th><th>Find and remove the most urgent</th><th>Problem</th></tr>
    <tr><td>Unsorted list</td><td>O(1) append</td><td>O(n) scan with <code>min</code>, O(n) remove</td><td>Every pick is a full scan</td></tr>
    <tr><td>Sorted list</td><td>O(n) shift items to insert</td><td>O(1) find, O(n) <code>pop(0)</code> (or keep it reversed)</td><td>Every arrival shifts the line</td></tr>
    <tr><td><strong>Heap</strong></td><td><strong>O(log n)</strong></td><td><strong>O(1) peek, O(log n) remove</strong></td><td>Both fast. That is the whole point.</td></tr>
  </table>
  <h3>Measured: one new order, one pick, 5,000 times</h3>
  <p>A busy festival evening: n orders are pending, and 5,000 times a new order arrives and a rider takes the most urgent one. The three versions give the same picks; only the speed differs.</p>
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
        heapq.heappush(h, x)          # sift up: O(log n)
        heapq.heappop(h)              # sift down: O(log n)

random.seed(5)
for n in [10_000, 40_000]:
    pending = [random.randint(1, 10**6) for _ in range(n)]
    arrivals = [random.randint(1, 10**6) for _ in range(5_000)]
    times = []
    for f in (rounds_unsorted, rounds_sorted, rounds_heap):
        t = time.perf_counter(); f(pending, arrivals); times.append(time.perf_counter() - t)
    print(f"n={n:&gt;6,}: unsorted list {times[0]:.3f} s | sorted list {times[1]:.4f} s | heap {times[2]:.4f} s")</div>
  <div class="fx" data-lang="text">n=10,000: unsorted list 0.801 s | sorted list 0.0190 s | heap 0.0024 s
n=40,000: unsorted list 2.312 s | sorted list 0.0748 s | heap 0.0030 s</div>
  <p>When the backlog grows 4×, the unsorted list gets about 3× slower (each pick is O(n)), the sorted list about 4× (each shift is O(n), but done in fast C), while the heap barely changes: O(log n) per operation, and log₂ of 40,000 is only about 15.</p>
  <p>A <strong>heap</strong> is the usual way to build a priority queue. It keeps the items "half sorted": just enough order that the best one is always at the front, without paying for a full sort.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>priority queue</strong> supports insert and remove-the-best. A <strong>min-heap</strong> implements it as a tree where every parent is ≤ its children, so the root is the smallest item. <strong>Max-heap</strong>: every parent ≥ its children, root is the biggest. Nothing else is promised: siblings and cousins can be in any order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using a <code>deque</code> (or <code>queue.Queue</code>) because the word "queue" appears. Those are FIFO: they would send O1 (25 minutes left) before O7 (5 minutes left). "Priority" means a heap.</p>
  </div>
  <p>Where you meet it: <code>heapq</code> in Python, the task scheduler in an OS, Dijkstra shortest path (Google Maps), "top 10 trending" on any feed, merging sorted files in a data pipeline, and a very common interview topic ("find the k largest").</p>
  <div class="bridge"><b>What this still can't tell us → next: A Tree Inside a List.</b> "Every parent ≤ its children" describes a tree, yet the heap was a plain list in the code. How can a list hold a tree without any pointers?</div>

  <h2 id="dsa-hp-tree"><span class="num">02</span>A Tree Inside a List</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Trees note built trees from <code>TreeNode</code> objects with <code>left</code> and <code>right</code> links. A heap needs no node objects at all. What special shape makes that possible, and how do we find a node's parent and children from its position?</p>
  </div>
  <p>A heap is a <strong>complete binary tree</strong>: every level is full except maybe the last, and the last is filled from the left. Because there are no gaps, the tree can be stored in a plain list, level by level. No node objects, no pointers.</p>
<figure class="viz"><svg viewBox="0 0 580 330" width="580">
<line x1="300" y1="40" x2="170" y2="105" stroke="currentColor"/>
<line x1="300" y1="40" x2="430" y2="105" stroke="currentColor"/>
<line x1="170" y1="105" x2="100" y2="170" stroke="currentColor"/>
<line x1="170" y1="105" x2="240" y2="170" stroke="currentColor"/>
<line x1="430" y1="105" x2="360" y2="170" stroke="currentColor"/>
<line x1="430" y1="105" x2="500" y2="170" stroke="currentColor"/>
<line x1="100" y1="170" x2="60" y2="235" stroke="currentColor"/>
<circle cx="300" cy="40" r="19" class="fg sg"/><text x="300" y="44" text-anchor="middle" font-size="12">5</text>
<text x="323" y="30" class="tm" font-size="9.5">O7 · i=0</text>
<circle cx="170" cy="105" r="19" class="fb sb"/><text x="170" y="109" text-anchor="middle" font-size="12">12</text>
<text x="193" y="95" class="tm" font-size="9.5">O2 · i=1</text>
<circle cx="430" cy="105" r="19" class="fb sb"/><text x="430" y="109" text-anchor="middle" font-size="12">8</text>
<text x="453" y="95" class="tm" font-size="9.5">O4 · i=2</text>
<circle cx="100" cy="170" r="19" class="fb sb"/><text x="100" y="174" text-anchor="middle" font-size="12">18</text>
<text x="123" y="160" class="tm" font-size="9.5">O8 · i=3</text>
<circle cx="240" cy="170" r="19" class="fb sb"/><text x="240" y="174" text-anchor="middle" font-size="12">30</text>
<text x="263" y="160" class="tm" font-size="9.5">O5 · i=4</text>
<circle cx="360" cy="170" r="19" class="fb sb"/><text x="360" y="174" text-anchor="middle" font-size="12">40</text>
<text x="383" y="160" class="tm" font-size="9.5">O3 · i=5</text>
<circle cx="500" cy="170" r="19" class="fb sb"/><text x="500" y="174" text-anchor="middle" font-size="12">15</text>
<text x="523" y="160" class="tm" font-size="9.5">O6 · i=6</text>
<circle cx="60" cy="235" r="19" class="fb sb"/><text x="60" y="239" text-anchor="middle" font-size="12">25</text>
<text x="83" y="225" class="tm" font-size="9.5">O1 · i=7</text>
<text x="560" y="40" class="tb" font-size="11" text-anchor="end">left child = 2i + 1</text>
<text x="560" y="58" class="tb" font-size="11" text-anchor="end">right child = 2i + 2</text>
<text x="560" y="76" class="tr" font-size="11" text-anchor="end">parent = (i − 1) // 2</text>
<text x="96" y="292" text-anchor="end" font-size="11">list:</text><text x="96" y="318" class="tm" text-anchor="end" font-size="10">index:</text>
<rect x="110" y="272" width="50" height="30" class="fg sg"/><text x="135" y="292" text-anchor="middle" font-size="12">5</text><text x="135" y="318" class="tm" text-anchor="middle" font-size="10">0</text>
<rect x="162" y="272" width="50" height="30" class="ft st"/><text x="187" y="292" text-anchor="middle" font-size="12">12</text><text x="187" y="318" class="tm" text-anchor="middle" font-size="10">1</text>
<rect x="214" y="272" width="50" height="30" class="ft st"/><text x="239" y="292" text-anchor="middle" font-size="12">8</text><text x="239" y="318" class="tm" text-anchor="middle" font-size="10">2</text>
<rect x="266" y="272" width="50" height="30" class="ft st"/><text x="291" y="292" text-anchor="middle" font-size="12">18</text><text x="291" y="318" class="tm" text-anchor="middle" font-size="10">3</text>
<rect x="318" y="272" width="50" height="30" class="ft st"/><text x="343" y="292" text-anchor="middle" font-size="12">30</text><text x="343" y="318" class="tm" text-anchor="middle" font-size="10">4</text>
<rect x="370" y="272" width="50" height="30" class="ft st"/><text x="395" y="292" text-anchor="middle" font-size="12">40</text><text x="395" y="318" class="tm" text-anchor="middle" font-size="10">5</text>
<rect x="422" y="272" width="50" height="30" class="ft st"/><text x="447" y="292" text-anchor="middle" font-size="12">15</text><text x="447" y="318" class="tm" text-anchor="middle" font-size="10">6</text>
<rect x="474" y="272" width="50" height="30" class="ft st"/><text x="499" y="292" text-anchor="middle" font-size="12">25</text><text x="499" y="318" class="tm" text-anchor="middle" font-size="10">7</text>
</svg><figcaption>The 8 pending deliveries after pushing O1…O8 (minutes left). Top: the tree; bottom: the Python list it is really stored in, level by level. Every parent is ≤ its children, so index 0 holds the most urgent order, O7 with 5 minutes. The rest is not sorted (index 2 holds 8, index 1 holds 12).</figcaption></figure>
  <h3>Index math, traced on the running example</h3>
  <table class="tbl out"><caption>Heap [5, 12, 8, 18, 30, 40, 15, 25] (minutes left)</caption>
    <tr><th>i</th><th>value (order)</th><th>left child 2i+1</th><th>right child 2i+2</th><th>parent (i−1)//2</th><th>parent ≤ me?</th></tr>
    <tr><td>0</td><td>5 (O7)</td><td>1 → 12</td><td>2 → 8</td><td>–</td><td>root</td></tr>
    <tr><td>1</td><td>12 (O2)</td><td>3 → 18</td><td>4 → 30</td><td>0 → 5</td><td>5 ≤ 12 ✓</td></tr>
    <tr><td>2</td><td>8 (O4)</td><td>5 → 40</td><td>6 → 15</td><td>0 → 5</td><td>5 ≤ 8 ✓</td></tr>
    <tr><td>3</td><td>18 (O8)</td><td>7 → 25</td><td>8 → none</td><td>1 → 12</td><td>12 ≤ 18 ✓</td></tr>
    <tr><td>4</td><td>30 (O5)</td><td>9 → none</td><td>–</td><td>1 → 12</td><td>12 ≤ 30 ✓</td></tr>
    <tr><td>7</td><td>25 (O1)</td><td>none</td><td>none</td><td>3 → 18</td><td>18 ≤ 25 ✓</td></tr>
  </table>
<div class="fx" data-lang="py">h = [5, 12, 8, 18, 30, 40, 15, 25]
n = len(h)
for i in range(n):
    kids = [h[c] for c in (2 * i + 1, 2 * i + 2) if c &lt; n]
    parent = h[(i - 1) // 2] if i &gt; 0 else None
    print(f"i={i} value={h[i]:2}  parent={parent}  children={kids}")
print("heap rule holds:", all(h[(i - 1) // 2] &lt;= h[i] for i in range(1, n)))
print("is the list sorted?", h == sorted(h))</div>
  <div class="fx" data-lang="text">i=0 value= 5  parent=None  children=[12, 8]
i=1 value=12  parent=5  children=[18, 30]
i=2 value= 8  parent=5  children=[40, 15]
i=3 value=18  parent=12  children=[25]
i=4 value=30  parent=12  children=[]
i=5 value=40  parent=8  children=[]
i=6 value=15  parent=8  children=[]
i=7 value=25  parent=18  children=[]
heap rule holds: True
is the list sorted? False</div>
  <p>These three formulas are all a heap needs to walk up and down the tree. The last two lines are the key fact: the heap rule holds everywhere, yet the list is <em>not</em> sorted.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every parent is smaller than its children, so <code>h[0]</code> is guaranteed to be the minimum: O7 with 5 minutes. A heap gives you "the minimum is always at index 0", nothing more. That weaker promise is exactly why it is cheaper than keeping everything sorted.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>complete binary tree</strong> has every level full except possibly the last, which is filled from the left. Stored level by level in a list, node i has children 2i + 1 and 2i + 2 and parent ⌊(i − 1) / 2⌋; its height is ⌊log₂ n⌋.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"A heap is sorted" is the most common wrong statement. Printing <code>h</code> gives <code>[5, 12, 8, 18, 30, 40, 15, 25]</code>: 8 sits after 12. To get sorted output you must pop n times (that is heap sort, O(n log n)).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Push &amp; Pop.</b> We can read the heap, but how did the 8 orders get into this shape? And when the rider takes O7, who moves up to index 0 without breaking the rule?</div>

  <h2 id="dsa-hp-ops"><span class="num">03</span>Push &amp; Pop Step by Step</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Appending a new order at the end of the list, or removing index 0, breaks the "parent ≤ children" rule in one spot. How do we repair it without re-sorting, and how much work does the repair cost?</p>
  </div>
  <p>Both operations do the same trick: break the rule in one spot, then fix it by swapping along one path. The path is at most the height of the tree, log₂ n, so each operation is O(log n). First the picture on a tiny heap, then the full trace on our deliveries.</p>
  <h3>push(x): add at the end, sift up</h3>
<figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="hp-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><line x1="95" y1="50" x2="48" y2="108" stroke="currentColor" /><line x1="95" y1="50" x2="142" y2="108" stroke="currentColor" /><line x1="48" y1="108" x2="24" y2="166" stroke="currentColor" /><line x1="48" y1="108" x2="71" y2="166" stroke="currentColor" /><line x1="142" y1="108" x2="119" y2="166" stroke="currentColor" /><circle cx="95" cy="50" r="17" class="fb sb"/><text x="95" y="54" text-anchor="middle">1</text><circle cx="48" cy="108" r="17" class="fb sb"/><text x="48" y="112" text-anchor="middle">3</text><circle cx="142" cy="108" r="17" class="fb sb"/><text x="142" y="112" text-anchor="middle">8</text><circle cx="24" cy="166" r="17" class="fb sb"/><text x="24" y="170" text-anchor="middle">5</text><circle cx="71" cy="166" r="17" class="fb sb"/><text x="71" y="170" text-anchor="middle">9</text><circle cx="119" cy="166" r="17" class="fr sr"/><text x="119" y="170" text-anchor="middle">2</text><text x="95" y="18" text-anchor="middle">1. append at the end</text><line x1="295" y1="50" x2="248" y2="108" stroke="currentColor" /><line x1="295" y1="50" x2="342" y2="108" stroke="currentColor" /><line x1="248" y1="108" x2="224" y2="166" stroke="currentColor" /><line x1="248" y1="108" x2="271" y2="166" stroke="currentColor" /><line x1="342" y1="108" x2="319" y2="166" stroke="currentColor" /><circle cx="295" cy="50" r="17" class="fb sb"/><text x="295" y="54" text-anchor="middle">1</text><circle cx="248" cy="108" r="17" class="fb sb"/><text x="248" y="112" text-anchor="middle">3</text><circle cx="342" cy="108" r="17" class="fr sr"/><text x="342" y="112" text-anchor="middle">8</text><circle cx="224" cy="166" r="17" class="fb sb"/><text x="224" y="170" text-anchor="middle">5</text><circle cx="271" cy="166" r="17" class="fb sb"/><text x="271" y="170" text-anchor="middle">9</text><circle cx="319" cy="166" r="17" class="fr sr"/><text x="319" y="170" text-anchor="middle">2</text><text x="295" y="18" text-anchor="middle">2. 2 &lt; parent 8 → swap</text><path d="M339,160 Q360,137 362,114" fill="none" class="sr" stroke-width="1.5" marker-end="url(#hp-a1)"/><line x1="495" y1="50" x2="448" y2="108" stroke="currentColor" /><line x1="495" y1="50" x2="542" y2="108" stroke="currentColor" /><line x1="448" y1="108" x2="424" y2="166" stroke="currentColor" /><line x1="448" y1="108" x2="471" y2="166" stroke="currentColor" /><line x1="542" y1="108" x2="519" y2="166" stroke="currentColor" /><circle cx="495" cy="50" r="17" class="fg sg"/><text x="495" y="54" text-anchor="middle">1</text><circle cx="448" cy="108" r="17" class="fb sb"/><text x="448" y="112" text-anchor="middle">3</text><circle cx="542" cy="108" r="17" class="fg sg"/><text x="542" y="112" text-anchor="middle">2</text><circle cx="424" cy="166" r="17" class="fb sb"/><text x="424" y="170" text-anchor="middle">5</text><circle cx="471" cy="166" r="17" class="fb sb"/><text x="471" y="170" text-anchor="middle">9</text><circle cx="519" cy="166" r="17" class="fb sb"/><text x="519" y="170" text-anchor="middle">8</text><text x="495" y="18" text-anchor="middle">3. 2 &gt; parent 1 → stop</text></svg><figcaption>push(2): the new value starts at the bottom and keeps swapping with its parent while it is smaller. It climbs at most one level per step.</figcaption></figure>
  <p>The new value 2 is appended as the last leaf (index 5). Its parent is 8, and 2 &lt; 8, so swap. Now its parent is 1, and 2 &gt; 1, so stop. Only one path from leaf to root is ever touched.</p>
  <h3>pop(): take the root, move the last to the top, sift down</h3>
<figure class="viz"><svg viewBox="0 0 600 200" width="600"><line x1="95" y1="50" x2="48" y2="108" stroke="currentColor" /><line x1="95" y1="50" x2="142" y2="108" stroke="currentColor" /><line x1="48" y1="108" x2="24" y2="166" stroke="currentColor" /><line x1="48" y1="108" x2="71" y2="166" stroke="currentColor" /><line x1="142" y1="108" x2="119" y2="166" stroke="currentColor" /><circle cx="95" cy="50" r="17" class="fr sr"/><text x="95" y="54" text-anchor="middle">1</text><circle cx="48" cy="108" r="17" class="fb sb"/><text x="48" y="112" text-anchor="middle">3</text><circle cx="142" cy="108" r="17" class="fb sb"/><text x="142" y="112" text-anchor="middle">2</text><circle cx="24" cy="166" r="17" class="fb sb"/><text x="24" y="170" text-anchor="middle">5</text><circle cx="71" cy="166" r="17" class="fb sb"/><text x="71" y="170" text-anchor="middle">9</text><circle cx="119" cy="166" r="17" class="fv sb"/><text x="119" y="170" text-anchor="middle">8</text><text x="95" y="18" text-anchor="middle">1. answer = root 1</text><line x1="295" y1="50" x2="248" y2="108" stroke="currentColor" /><line x1="295" y1="50" x2="342" y2="108" stroke="currentColor" /><line x1="248" y1="108" x2="224" y2="166" stroke="currentColor" /><line x1="248" y1="108" x2="271" y2="166" stroke="currentColor" /><circle cx="295" cy="50" r="17" class="fr sr"/><text x="295" y="54" text-anchor="middle">8</text><circle cx="248" cy="108" r="17" class="fb sb"/><text x="248" y="112" text-anchor="middle">3</text><circle cx="342" cy="108" r="17" class="fg sg"/><text x="342" y="112" text-anchor="middle">2</text><circle cx="224" cy="166" r="17" class="fb sb"/><text x="224" y="170" text-anchor="middle">5</text><circle cx="271" cy="166" r="17" class="fb sb"/><text x="271" y="170" text-anchor="middle">9</text><text x="295" y="18" text-anchor="middle">2. last (8) to the root</text><line x1="495" y1="50" x2="448" y2="108" stroke="currentColor" /><line x1="495" y1="50" x2="542" y2="108" stroke="currentColor" /><line x1="448" y1="108" x2="424" y2="166" stroke="currentColor" /><line x1="448" y1="108" x2="471" y2="166" stroke="currentColor" /><circle cx="495" cy="50" r="17" class="fg sg"/><text x="495" y="54" text-anchor="middle">2</text><circle cx="448" cy="108" r="17" class="fb sb"/><text x="448" y="112" text-anchor="middle">3</text><circle cx="542" cy="108" r="17" class="fr sr"/><text x="542" y="112" text-anchor="middle">8</text><circle cx="424" cy="166" r="17" class="fb sb"/><text x="424" y="170" text-anchor="middle">5</text><circle cx="471" cy="166" r="17" class="fb sb"/><text x="471" y="170" text-anchor="middle">9</text><text x="495" y="18" text-anchor="middle">3. swap with child 2</text></svg><figcaption>pop(): take the root, move the last value to the top, then push it down, always swapping with the smaller child, until both children are bigger.</figcaption></figure>
  <p>The answer is the root, 1. To fill the hole without leaving a gap, the <em>last</em> value (8) jumps to the root. Now 8 is bigger than its children 3 and 2. Swap it with the <strong>smaller</strong> child (2), so the new root is still the smallest. Repeat until both children are bigger or it reaches the bottom.</p>
  <h3>Traced on the running example: pushing O1…O8</h3>
  <table class="tbl out"><caption>Push minutes 25, 12, 40, 8, 30, 15, 5, 18 into an empty min-heap</caption>
    <tr><th>push</th><th>lands at index</th><th>sift up</th><th>heap after</th></tr>
    <tr><td>25 (O1)</td><td>0</td><td>root</td><td>[25]</td></tr>
    <tr><td>12 (O2)</td><td>1</td><td>12 &lt; parent 25 → swap</td><td>[12, 25]</td></tr>
    <tr><td>40 (O3)</td><td>2</td><td>40 ≥ 12 → stop</td><td>[12, 25, 40]</td></tr>
    <tr><td>8 (O4)</td><td>3</td><td>8 &lt; 25 swap; 8 &lt; 12 swap</td><td>[8, 12, 40, 25]</td></tr>
    <tr><td>30 (O5)</td><td>4</td><td>30 ≥ 12 → stop</td><td>[8, 12, 40, 25, 30]</td></tr>
    <tr><td>15 (O6)</td><td>5</td><td>15 &lt; 40 swap; 15 ≥ 8 stop</td><td>[8, 12, 15, 25, 30, 40]</td></tr>
    <tr><td>5 (O7)</td><td>6</td><td>5 &lt; 15 swap; 5 &lt; 8 swap</td><td>[5, 12, 8, 25, 30, 40, 15]</td></tr>
    <tr><td>18 (O8)</td><td>7</td><td>18 &lt; 25 swap; 18 ≥ 12 stop</td><td>[5, 12, 8, 18, 30, 40, 15, 25]</td></tr>
  </table>
  <table class="tbl out"><caption>Pop once: the rider takes O7</caption>
    <tr><th>step</th><th>action</th><th>heap</th></tr>
    <tr><td>1</td><td>answer = root 5 (O7); last value 25 moves to the root</td><td>[25, 12, 8, 18, 30, 40, 15]</td></tr>
    <tr><td>2</td><td>children 12 and 8; smaller is 8 &lt; 25 → swap</td><td>[8, 12, 25, 18, 30, 40, 15]</td></tr>
    <tr><td>3</td><td>children 40 and 15; smaller is 15 &lt; 25 → swap</td><td>[8, 12, 15, 18, 30, 40, 25]</td></tr>
    <tr><td>4</td><td>index 6 has no children → stop</td><td>new root 8 (O4) is next</td></tr>
  </table>
  <p>Count the work: 8 pushes needed 7 swaps in total, and the pop needed 2. A sorted list would have shifted items on most of those inserts. Section 04 runs exactly these steps in code.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sift up</strong>: while the item is smaller than its parent, swap them. <strong>Sift down</strong>: while the item is bigger than its smaller child, swap with that child. Each moves along one root-to-leaf path: O(log n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In sift down, always swap with the <em>smaller</em> child. In step 2 above, swapping 25 with 12 (the bigger child) would put 12 above 8, breaking the rule again.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Build One From Scratch.</b> The tables are hand traces. Do they match real code, and what do all the operations cost when written down precisely?</div>

  <h2 id="dsa-hp-impl"><span class="num">04</span>Build One From Scratch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We traced sift up and sift down by hand. Can the whole structure really be 30 lines of Python, and which operations are cheap or expensive once it exists?</p>
  </div>
  <p>You will use <code>heapq</code> in interviews, but being able to write this proves you understand it. The three index formulas and the two sift loops are the whole thing.</p>
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

minutes = [25, 12, 40, 8, 30, 15, 5, 18]       # O1..O8
h = MinHeap()
for m in minutes:
    h.push(m)
    print("push", m, "-&gt;", h.a)
print("pop", h.pop(), "-&gt;", h.a)
print("riders take, in order:", [h.pop() for _ in range(len(h.a))])</div>
  <div class="fx" data-lang="text">push 25 -&gt; [25]
push 12 -&gt; [12, 25]
push 40 -&gt; [12, 25, 40]
push 8 -&gt; [8, 12, 40, 25]
push 30 -&gt; [8, 12, 40, 25, 30]
push 15 -&gt; [8, 12, 15, 25, 30, 40]
push 5 -&gt; [5, 12, 8, 25, 30, 40, 15]
push 18 -&gt; [5, 12, 8, 18, 30, 40, 15, 25]
pop 5 -&gt; [8, 12, 15, 18, 30, 40, 25]
riders take, in order: [8, 12, 15, 18, 25, 30, 40]</div>
  <p>Every line matches the hand trace of section 03. Popping everything out gives the minutes in sorted order (8, 12, 15, 18, 25, 30, 40), one O(log n) pop at a time.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>Plain reason</th></tr>
    <tr><td>peek min <code>h[0]</code></td><td>O(1)</td><td>It is always at index 0</td></tr>
    <tr><td>push</td><td>O(log n)</td><td>Sift up walks one path leaf → root; the tree has log₂ n levels</td></tr>
    <tr><td>pop</td><td>O(log n)</td><td>Sift down walks one path root → leaf</td></tr>
    <tr><td>heapify a list of n</td><td>O(n)</td><td>Sift down from the last parent backwards; most nodes are near the bottom and move only 1–2 steps</td></tr>
    <tr><td>search for a value</td><td>O(n)</td><td>No order among siblings, so you may scan everything</td></tr>
    <tr><td>delete an arbitrary value</td><td>O(n)</td><td>Find it first (O(n)); the fix is "lazy deletion", see Common Mistakes</td></tr>
    <tr><td>space</td><td>O(n)</td><td>One list, no pointers</td></tr>
  </table>
  <h3>Why heapify is O(n): count the moves</h3>
<div class="fx" data-lang="py">def heapify_moves(a):
    a, n, moves = a[:], len(a), 0
    for i in range(n // 2 - 1, -1, -1):            # last parent down to the root
        while True:
            l, r, small = 2 * i + 1, 2 * i + 2, i
            if l &lt; n and a[l] &lt; a[small]: small = l
            if r &lt; n and a[r] &lt; a[small]: small = r
            if small == i: break
            a[i], a[small] = a[small], a[i]; i = small; moves += 1
    return a, moves

print(heapify_moves(minutes))
random.seed(0)
for n in [1_000, 10_000, 100_000]:
    _, mv = heapify_moves([random.random() for _ in range(n)])
    print(f"n={n:&gt;7,}: heapify swaps {mv:&gt;7,}  (swaps per item {mv / n:.2f})")</div>
  <div class="fx" data-lang="text">([5, 8, 15, 12, 30, 25, 40, 18], 4)
n=  1,000: heapify swaps     780  (swaps per item 0.78)
n= 10,000: heapify swaps   7,460  (swaps per item 0.75)
n=100,000: heapify swaps  74,258  (swaps per item 0.74)</div>
  <p>Heapify of our 8 minutes needs only 4 swaps (and builds a different but equally valid heap, [5, 8, 15, 12, 30, 25, 40, 18]: a heap is not unique), and on random data the swaps per item stay below 1 however large n gets: half the nodes are leaves and never move, a quarter move at most 1 step, an eighth at most 2… The sum is bounded by 2n. Building by n pushes would cost O(n log n).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Heapify</strong> turns an arbitrary list into a heap in place by sifting down every parent, from the last parent (index n // 2 − 1) back to the root. Total work O(n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>pop</code> on an empty heap: <code>a[0]</code> raises <code>IndexError</code>. Real code checks <code>if h:</code> first, exactly like a stack.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Python's heapq.</b> Our class works, but Python already ships a fast version written in C. How do we use it, and what if we want the <em>biggest</em> bill first instead of the smallest?</div>

  <h2 id="dsa-hp-heapq"><span class="num">05</span>Python's heapq</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Writing MinHeap every time is slow and error-prone. Python's <code>heapq</code> is the standard tool, but it only does min-heaps and works on plain lists. How do we attach orders to priorities, get a max-heap, and avoid crashes when two orders tie?</p>
  </div>
  <p><code>heapq</code> is not a class. It is a set of functions that treat a normal Python list as a <strong>min-heap</strong>. You keep the list; the functions keep it in heap order.</p>
<div class="fx" data-lang="py">orders = ["O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8"]
bills = [120, 80, 250, 40, 310, 80, 60, 200]

# most urgent first: (minutes_left, order)
urgent = []
for m, o in zip(minutes, orders):
    heapq.heappush(urgent, (m, o))
print("heap:", urgent)
print("riders take:", [heapq.heappop(urgent)[1] for _ in range(3)], "| next up:", urgent[0])

# heapify an existing list in O(n)
mins = minutes[:]
heapq.heapify(mins)
print("heapify:", mins)

# max-heap trick: most expensive bill first -&gt; store negatives
vip = [(-b, o) for b, o in zip(bills, orders)]
heapq.heapify(vip)
b, o = heapq.heappop(vip)
print("most expensive:", o, -b, "| next:", vip[0][1], -vip[0][0])

print(heapq.nlargest(3, bills), heapq.nsmallest(2, minutes))
print(heapq.nlargest(2, zip(orders, bills), key=lambda ob: ob[1]))
print(heapq.heappushpop([5, 12, 8], 3), heapq.heapreplace([5, 12, 8], 3))</div>
  <div class="fx" data-lang="text">heap: [(5, 'O7'), (12, 'O2'), (8, 'O4'), (18, 'O8'), (30, 'O5'), (40, 'O3'), (15, 'O6'), (25, 'O1')]
riders take: ['O7', 'O4', 'O2'] | next up: (15, 'O6')
heapify: [5, 8, 15, 12, 30, 25, 40, 18]
most expensive: O5 310 | next: O3 250
[310, 250, 200] [5, 8]
[('O5', 310), ('O3', 250)]
3 5</div>
  <div class="cards">
    <div><b>Max-heap trick</b><p>Python has no max-heap. Push <code>-x</code>, and the smallest negative is the biggest original. Negate again when reading.</p><small>For tuples: <code>(-bill, order)</code></small></div>
    <div><b>Tuples = priorities</b><p>Tuples compare field by field, so <code>(minutes, order)</code> orders by minutes first.</p><small>Equal priority → compares the next field</small></div>
    <div><b>heapify</b><p>Turns an existing list into a heap in O(n). Faster than n pushes (O(n log n)).</p><small>Use when you already have all the data</small></div>
    <div><b>nlargest / nsmallest</b><p>"k biggest" in O(n log k) with a <code>key=</code>. For k = 1 just use <code>max()</code>; for k near n just <code>sorted()</code>.</p><small>Returns a sorted list</small></div>
  </div>
  <p>The last line shows the two combined calls. <code>heappushpop(h, x)</code> pushes x then pops the min, so the result is the smaller of x and the old min (here 3, because 3 &lt; 5). <code>heapreplace(h, x)</code> pops the min first and then pushes x, so it always returns the old min (5) even if x is smaller. Both are one sift instead of two.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Equal priorities. O2 and O6 both have a ₹80 bill. Push <code>(-80, {"id": "O2"})</code> and <code>(-80, {"id": "O6"})</code>, and Python compares the dicts to break the tie and crashes with <code>TypeError: '&lt;' not supported between instances of 'dict' and 'dict'</code>. Fix: push <code>(priority, counter, item)</code> with a running counter so the tie is settled before Python looks at the item. The counter also keeps equal priorities first-in-first-out.</p>
  </div>
<div class="fx" data-lang="py">h = []
try:
    for p in [{"id": "O2"}, {"id": "O6"}]:
        heapq.heappush(h, (-80, p))
except TypeError as e:
    print("crash:", e)

h = []
for i, p in enumerate([{"id": "O2"}, {"id": "O6"}]):
    heapq.heappush(h, (-80, i, p))     # i breaks ties
print(heapq.heappop(h))</div>
  <div class="fx" data-lang="text">crash: '&lt;' not supported between instances of 'dict' and 'dict'
(-80, 0, {'id': 'O2'})</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>heapq</strong> keeps a Python list in min-heap order: <code>heappush</code>/<code>heappop</code> O(log n), <code>h[0]</code> peek O(1), <code>heapify</code> O(n), <code>nlargest</code>/<code>nsmallest</code> O(n log k). A max-heap is simulated by negating priorities.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>1046 Last Stone Weight</b> (max-heap trick, pop two, push the difference), <b>2558 Take Gifts From the Richest Pile</b> (pop the max k times), <b>1962 Remove Stones to Minimize the Total</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Top-k.</b> Finance only wants the 3 most expensive orders of the day. <code>sorted(bills)[-3:]</code> works, but it sorts everything to keep 3. On a day with 10 lakh orders, can a heap do less work?</div>

  <h2 id="dsa-hp-topk"><span class="num">06</span>Top-k With a Size-k Heap</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sorting n bills costs O(n log n) and needs all n in memory at once. If we only want the k biggest, most of that sorting is wasted. How do we keep only k candidates, and which kind of heap holds them?</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "k largest", "k smallest", "k closest", "k most frequent", "top 10", "kth largest element".</p>
  <h3>Template</h3>
  <p>The trick that confuses everyone: to find the k <strong>largest</strong>, keep a <strong>min</strong>-heap of size k. Its top is the weakest of the current top k, which is exactly the one to throw away when someone better arrives.</p>
  <div class="flow"><span>Push each item</span><span>Heap grows past k?</span><span>Pop the min (the weakest of the top k)</span><span>At the end: heap = the k best, h[0] = kth best</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team selection with 11 seats. Every new player who tries out joins, then the <em>weakest</em> of the 12 is sent home. The weakest player still in the team is the cut-off, and he is at the top of the min-heap.</p>
  </div>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Three biggest bills of [120, 80, 250, 40, 310, 80, 60, 200], k = 3 (heap shown sorted)</caption>
    <tr><th>bill</th><th>heap after push</th><th>size &gt; 3 → pop min</th><th>heap (top = cut-off)</th></tr>
    <tr><td>120 (O1)</td><td>[120]</td><td>–</td><td>[120]</td></tr>
    <tr><td>80 (O2)</td><td>[80, 120]</td><td>–</td><td>[80, 120]</td></tr>
    <tr><td>250 (O3)</td><td>[80, 120, 250]</td><td>–</td><td>[80, 120, 250]</td></tr>
    <tr><td>40 (O4)</td><td>[40, 80, 120, 250]</td><td>pop 40</td><td>[80, 120, 250]</td></tr>
    <tr><td>310 (O5)</td><td>[80, 120, 250, 310]</td><td>pop 80</td><td>[120, 250, 310]</td></tr>
    <tr><td>80 (O6)</td><td>[80, 120, 250, 310]</td><td>pop 80</td><td>[120, 250, 310]</td></tr>
    <tr><td>60 (O7)</td><td>[60, 120, 250, 310]</td><td>pop 60</td><td>[120, 250, 310]</td></tr>
    <tr><td>200 (O8)</td><td>[120, 200, 250, 310]</td><td>pop 120</td><td><b>[200, 250, 310]</b></td></tr>
  </table>
<div class="fx" data-lang="py">def top_k(nums, k, trace=False):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) &gt; k:
            out = heapq.heappop(h)    # remove the smallest of the k+1
            if trace: print(f"push {x:3}, drop {out:3} -&gt; {sorted(h)}")
        elif trace:
            print(f"push {x:3}           -&gt; {sorted(h)}")
    return h                          # k largest; h[0] is the kth largest

best3 = top_k(bills, 3, trace=True)
print("top 3:", sorted(best3, reverse=True), "| 3rd largest:", best3[0])</div>
  <div class="fx" data-lang="text">push 120           -&gt; [120]
push  80           -&gt; [80, 120]
push 250           -&gt; [80, 120, 250]
push  40, drop  40 -&gt; [80, 120, 250]
push 310, drop  80 -&gt; [120, 250, 310]
push  80, drop  80 -&gt; [120, 250, 310]
push  60, drop  60 -&gt; [120, 250, 310]
push 200, drop 120 -&gt; [200, 250, 310]
top 3: [310, 250, 200] | 3rd largest: 200</div>
  <h3>Measured: why O(n log k)</h3>
  <p>The heap never holds more than k + 1 items, so each push/pop costs O(log k), not O(log n). And most items do even less: once the heap is full, a bill smaller than the cut-off <code>h[0]</code> is rejected with one comparison. On 10 lakh random bills with k = 10:</p>
<div class="fx" data-lang="py">random.seed(11)
big = [random.randint(1, 10**6) for _ in range(1_000_000)]
k = 10

t = time.perf_counter(); by_sort = sorted(big, reverse=True)[:k]; t_sort = time.perf_counter() - t

t = time.perf_counter()
h, heap_ops = [], 0
for x in big:
    if len(h) &lt; k:
        heapq.heappush(h, x); heap_ops += 1
    elif x &gt; h[0]:                     # only better bills touch the heap
        heapq.heapreplace(h, x); heap_ops += 1
t_heap = time.perf_counter() - t

t = time.perf_counter(); by_lib = heapq.nlargest(k, big); t_lib = time.perf_counter() - t

print(f"sort everything  : {t_sort:.3f} s")
print(f"size-{k} heap loop: {t_heap:.3f} s  (heap operations: {heap_ops} out of {len(big):,} bills)")
print(f"heapq.nlargest   : {t_lib:.3f} s")
print("same answer:", by_sort == sorted(h, reverse=True) == by_lib)</div>
  <div class="fx" data-lang="text">sort everything  : 0.350 s
size-10 heap loop: 0.086 s  (heap operations: 135 out of 1,000,000 bills)
heapq.nlargest   : 0.023 s
same answer: True</div>
  <p>The hand-written heap loop beats a full sort even though it is a Python loop and <code>sorted</code> runs in C, and <code>nlargest</code> (the same idea, optimised) is faster still. Only about 135 of the 10 lakh bills ever entered the heap. Memory is O(k), so this also works on a stream you cannot hold.</p>
  <h3>Complexity</h3>
  <p>O(n log k) time, O(k) space. Sorting: O(n log n) time, O(n) space. For n = 10⁷ and k = 10 that is log 10 ≈ 3 versus log 10⁷ ≈ 23 per item.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>top-k pattern</strong> keeps a heap of the k best items seen so far, of the <em>opposite</em> kind (min-heap for the k largest, max-heap for the k smallest), so its top is the current cut-off and the first thing to discard.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Wrong heap kind. A max-heap of all bills and k pops also works, but it holds all n items (O(n) memory, O(n + k log n) time) and cannot run on a stream. "The heap top is the one I am ready to throw away": for the k largest, that is the smallest.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>215 Kth Largest Element in an Array</b>, <b>973 K Closest Points to Origin</b> (k smallest distances: max-heap), <b>347 Top K Frequent Elements</b> (count first, then top-k).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: K-th Largest in a Stream.</b> Top-k ran once over a finished list. Biteful's dashboard must show the 3rd biggest bill <em>so far</em>, updated the moment each new order arrives. Do we rerun everything per order?</div>

  <h2 id="dsa-hp-stream"><span class="num">07</span>K-th Largest in a Stream</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Recomputing top-k after every new bill costs O(n log k) each time, O(n² log k) over the day. Is there state we can keep between arrivals so each update is cheap?</p>
  </div>
  <p>Yes: the size-k min-heap from section 06 <em>is</em> that state. Keep it alive between calls. Each new bill does at most one push and one pop, and the answer is always <code>h[0]</code>.</p>
  <h3>Recognise it</h3>
  <p>Trigger words: "stream", "after each add, return", "design a class", "kth largest so far", "leaderboard", "seat reservation / smallest available".</p>
  <h3>Traced on the running example</h3>
  <p>The dashboard starts with the first three bills [120, 80, 250]; then the rest arrive one by one. k = 3.</p>
  <table class="tbl out"><caption>KthLargest(3, [120, 80, 250]), then add the remaining bills</caption>
    <tr><th>event</th><th>heap (sorted)</th><th>3rd largest = h[0]</th></tr>
    <tr><td>start</td><td>[80, 120, 250]</td><td>80</td></tr>
    <tr><td>add 40</td><td>40 &lt; 80: pushed and popped at once → [80, 120, 250]</td><td>80</td></tr>
    <tr><td>add 310</td><td>pop 80 → [120, 250, 310]</td><td>120</td></tr>
    <tr><td>add 80</td><td>80 &lt; 120: rejected</td><td>120</td></tr>
    <tr><td>add 60</td><td>rejected</td><td>120</td></tr>
    <tr><td>add 200</td><td>pop 120 → [200, 250, 310]</td><td>200</td></tr>
  </table>
<div class="fx" data-lang="py">class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.h = nums[:]
        heapq.heapify(self.h)                 # O(n)
        while len(self.h) &gt; k:
            heapq.heappop(self.h)             # keep only the k largest

    def add(self, val):
        if len(self.h) &lt; self.k:
            heapq.heappush(self.h, val)
        elif val &gt; self.h[0]:
            heapq.heapreplace(self.h, val)    # pop the cut-off, push val: one sift
        return self.h[0]

board = KthLargest(3, bills[:3])
print("start:", board.h[0])
print([board.add(b) for b in bills[3:]])
lc = KthLargest(3, [4, 5, 8, 2])
print([lc.add(x) for x in [3, 5, 10, 9, 4]])</div>
  <div class="fx" data-lang="text">start: 80
[80, 120, 120, 120, 200]
[4, 5, 5, 8, 8]</div>
  <p>The dashboard shows 80, 120, 120, 120, 200 after the five arrivals, matching the table. The second line is LeetCode 703's own example.</p>
  <h3>Complexity</h3>
  <p>Constructor O(n) (heapify) + O((n − k) log n) pops; each <code>add</code> O(log k) time; O(k) space.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>streaming k-th statistic</strong> is maintained by a size-k heap that persists across inserts; the heap top is the answer after every insert.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Starting with fewer than k values. Before the heap reaches size k there is no "kth largest"; the <code>len(self.h) &lt; self.k</code> branch fills it up first. Forgetting it makes <code>h[0]</code> report the smallest of too few items.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>703 Kth Largest Element in a Stream</b>, <b>1337 The K Weakest Rows in a Matrix</b>, <b>2336 Smallest Number in Infinite Set</b> (a heap plus a set as persistent state).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Merge k Sorted Lists.</b> So far all items came from one source. Biteful's three restaurant kitchens each send a list of ready-times that is already sorted. Can a heap use that existing order instead of re-sorting everything?</div>

  <h2 id="dsa-hp-merge"><span class="num">08</span>Merge k Sorted Lists</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Joining k sorted lists and sorting the result costs O(N log N) and ignores the work already done. At any moment, the next item overall must be one of the k current heads. How do we pick the smallest head quickly, again and again?</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "k sorted lists / arrays / files / streams", "merge", "kth smallest in a sorted matrix", "smallest range covering k lists", "generate numbers in order".</p>
  <h3>Template</h3>
  <p>Put the first item of every list in a heap, with the list's index. Pop the smallest, output it, and push the next item from the <em>same</em> list. Each item is pushed once and popped once.</p>
  <h3>Traced on the running example</h3>
  <p>Three kitchens report when their orders will be ready (minutes from now), each list already sorted: Dosa Corner [5, 18, 30], Wok Express [8, 12, 40], Sweet Tooth [15, 25]. The riders need one time-ordered list.</p>
  <table class="tbl out"><caption>k-way merge, heap entries (time, kitchen)</caption>
    <tr><th>heap before pop</th><th>pop</th><th>push next from that kitchen</th><th>output so far</th></tr>
    <tr><td>(5,D) (8,W) (15,S)</td><td>(5,D)</td><td>(18,D)</td><td>5</td></tr>
    <tr><td>(8,W) (15,S) (18,D)</td><td>(8,W)</td><td>(12,W)</td><td>5 8</td></tr>
    <tr><td>(12,W) (15,S) (18,D)</td><td>(12,W)</td><td>(40,W)</td><td>5 8 12</td></tr>
    <tr><td>(15,S) (18,D) (40,W)</td><td>(15,S)</td><td>(25,S)</td><td>… 15</td></tr>
    <tr><td>(18,D) (25,S) (40,W)</td><td>(18,D)</td><td>(30,D)</td><td>… 18</td></tr>
    <tr><td>(25,S) (30,D) (40,W)</td><td>(25,S)</td><td>– (Sweet Tooth done)</td><td>… 25</td></tr>
    <tr><td>(30,D) (40,W)</td><td>(30,D)</td><td>– (Dosa Corner done)</td><td>… 30</td></tr>
    <tr><td>(40,W)</td><td>(40,W)</td><td>–</td><td>5 8 12 15 18 25 30 40</td></tr>
  </table>
  <p>The merged times are exactly the 8 deliveries' minutes, sorted: the heap of section 03 popped out in the same order.</p>
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
  <p>LeetCode 23 uses linked lists instead of Python lists. The loop is the same; the heap holds nodes, with the list index as a tie-breaker because nodes cannot be compared.</p>
<div class="fx" data-lang="py">class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def to_linked(values):                       # helper: Python list -&gt; linked list
    dummy = tail = ListNode(0)
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

def to_list(node):                           # helper: linked list -&gt; Python list
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out

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

for case in [kitchens, [[1, 4, 5], [1, 3, 4], [2, 6]], [], [[]], [[2], [], [1, 1]]]:
    print(case, "-&gt;", to_list(merge_k_lists([to_linked(c) for c in case])))</div>
  <div class="fx" data-lang="text">[[5, 18, 30], [8, 12, 40], [15, 25]] -&gt; [5, 8, 12, 15, 18, 25, 30, 40]
[[1, 4, 5], [1, 3, 4], [2, 6]] -&gt; [1, 1, 2, 3, 4, 4, 5, 6]
[] -&gt; []
[[]] -&gt; []
[[2], [], [1, 1]] -&gt; [1, 1, 2]</div>
  <h3>Complexity</h3>
  <p>The heap holds at most k items, and each of the N items is pushed and popped once: O(N log k) time, O(k) extra space. Sorting everything is O(N log N) and needs all data in memory; the heap version also works on k streams or files (external sort in databases does exactly this).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>k-way merge</strong>: merge k sorted sequences by keeping their current heads in a min-heap; repeatedly pop the smallest head and push its successor from the same sequence.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pushing empty lists, or pushing <code>(node.val, node)</code> without the index: two equal values make Python compare the nodes and crash. The <code>if node:</code> skip and the <code>i</code> tie-breaker fix both.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>23 Merge k Sorted Lists</b>, <b>378 Kth Smallest Element in a Sorted Matrix</b> (each row is a sorted list), <b>373 Find K Pairs with Smallest Sums</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Two Heaps.</b> A heap always hands us an extreme: the smallest or the biggest. Finance's next question is about the <em>middle</em>: "what is the median bill so far?", after every order. One heap can't see the middle.</div>

  <h2 id="dsa-hp-median"><span class="num">09</span>Two Heaps: the Running Median</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Keeping all bills sorted and reading the middle costs O(n) per insert. A single heap knows only its top. Can we arrange things so the middle is always at a top?</p>
  </div>
  <p>Split the bills into two halves. Keep the smaller half in a <strong>max</strong>-heap (its top is the biggest small bill) and the bigger half in a <strong>min</strong>-heap (its top is the smallest big bill). If the halves are the same size, the median is the average of the two tops; if the lower half has one extra, it is the lower top.</p>
<figure class="viz"><svg viewBox="0 0 600 175" width="600">
<rect x="30" y="40" width="240" height="90" rx="10" class="fb sb"/><text x="150" y="30" class="tb" text-anchor="middle" font-size="12">lower half: MAX-heap</text>
<text x="150" y="80" text-anchor="middle" font-size="13">40   60   80   80</text><text x="150" y="110" class="tm" text-anchor="middle" font-size="11">top = 80 (biggest of the small bills)</text>
<rect x="330" y="40" width="240" height="90" rx="10" class="fg sg"/><text x="450" y="30" class="tg" text-anchor="middle" font-size="12">upper half: MIN-heap</text>
<text x="450" y="80" text-anchor="middle" font-size="13">120   200   250   310</text><text x="450" y="110" class="tm" text-anchor="middle" font-size="11">top = 120 (smallest of the big bills)</text>
<text x="300" y="90" text-anchor="middle" font-size="14">≤</text>
<text x="300" y="160" text-anchor="middle" font-size="11">8 bills (even) → median = (80 + 120) / 2 = ₹100 ;  odd count → top of lower</text>
</svg><figcaption>Two heaps split the 8 bills into a smaller half and a bigger half. The median always sits at the two tops, so it is read in O(1).</figcaption></figure>
  <h3>Recognise it</h3>
  <p>Trigger words: "running median", "median of a data stream", "sliding window median", "balance two groups", "maximise capital with two constraints" (one heap per constraint).</p>
  <h3>Template</h3>
  <div class="flow"><span>push x into lower (max-heap)</span><span>move lower's max to upper (keeps lower ≤ upper)</span><span>if upper is bigger, move its min back</span><span>median = lower top, or average of both tops</span></div>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Bills arriving 120, 80, 250, 40, 310, 80, 60, 200</caption>
    <tr><th>add</th><th>lower half (max-heap)</th><th>upper half (min-heap)</th><th>median</th></tr>
    <tr><td>120</td><td>120</td><td>–</td><td>120</td></tr>
    <tr><td>80</td><td>80</td><td>120</td><td>(80 + 120) / 2 = 100</td></tr>
    <tr><td>250</td><td>80, 120</td><td>250</td><td>120</td></tr>
    <tr><td>40</td><td>40, 80</td><td>120, 250</td><td>100</td></tr>
    <tr><td>310</td><td>40, 80, 120</td><td>250, 310</td><td>120</td></tr>
    <tr><td>80</td><td>40, 80, 80</td><td>120, 250, 310</td><td>100</td></tr>
    <tr><td>60</td><td>40, 60, 80, 80</td><td>120, 250, 310</td><td>80</td></tr>
    <tr><td>200</td><td>40, 60, 80, 80</td><td>120, 200, 250, 310</td><td>100</td></tr>
  </table>
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
for b in bills:
    m.addNum(b)
    print(f"add {b:3}: lower={sorted(-v for v in m.small)} upper={sorted(m.large)} median={m.findMedian()}")
m2 = MedianFinder(); m2.addNum(-1); m2.addNum(-2); print(m2.findMedian())</div>
  <div class="fx" data-lang="text">add 120: lower=[120] upper=[] median=120
add  80: lower=[80] upper=[120] median=100.0
add 250: lower=[80, 120] upper=[250] median=120
add  40: lower=[40, 80] upper=[120, 250] median=100.0
add 310: lower=[40, 80, 120] upper=[250, 310] median=120
add  80: lower=[40, 80, 80] upper=[120, 250, 310] median=100.0
add  60: lower=[40, 60, 80, 80] upper=[120, 250, 310] median=80
add 200: lower=[40, 60, 80, 80] upper=[120, 200, 250, 310] median=100.0
-1.5</div>
  <p>Every add does the same three moves: push into lower, move lower's max to upper (this guarantees lower ≤ upper), and if upper got bigger, move its min back. Sizes always differ by at most 1, so the median is at the tops. Python's <code>statistics.median(bills)</code> agrees: (80 + 120) / 2 = 100.</p>
  <h3>Complexity</h3>
  <p><code>addNum</code>: a constant number of pushes and pops, O(log n). <code>findMedian</code>: O(1). Space O(n). The sorted-list alternative is O(n) per add.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>two-heaps pattern</strong> keeps a max-heap of the lower half and a min-heap of the upper half, with every lower value ≤ every upper value and sizes differing by at most 1. The median is read from the tops.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pushing into whichever heap is smaller without the "move across" step. The sizes stay balanced but the halves stop being halves: a big bill can end up in the lower heap and the median becomes wrong. Always route through one heap to the other.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>295 Find Median from Data Stream</b>, <b>480 Sliding Window Median</b> (two heaps + lazy deletion), <b>502 IPO</b> (one heap of affordable projects, one of locked ones).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Task Scheduler.</b> Every pattern so far took the best item the moment it was asked. Real schedules have rules: a restaurant can't hand over two orders back to back. How does "take the best now" work when the best item must sometimes wait?</div>

  <h2 id="dsa-hp-sched"><span class="num">10</span>Task Scheduler</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Greedy "take the most urgent" is easy when every item is always available. If an item becomes unavailable for a while after being used (a cooldown), the heap's top may be blocked. Where do blocked items wait, and when do they come back?</p>
  </div>
  <p>A rider makes 6 pickups this hour: 3 from Dosa Corner (A), 2 from Wok Express (B), 1 from Sweet Tooth (C). A kitchen needs <strong>n = 2</strong> slots after a pickup before it can hand over the next order, so the same letter must be at least 3 slots apart. In some slots the rider may have to wait (idle). What is the fewest number of slots?</p>
  <h3>Recognise it</h3>
  <p>Trigger words: "cooldown", "same task at least n apart", "reorganize so no two adjacent are equal", "longest happy string", "CPU scheduling", "process tasks using servers".</p>
  <h3>Template</h3>
  <p>Greedy: in each slot, run the available task with the <strong>most remaining copies</strong> (a max-heap of counts), because that task is the hardest to fit later. A task that just ran goes into a FIFO cooldown queue with the slot when it becomes available again; it returns to the heap at that time.</p>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Pickups A A A B B C, cooldown n = 2</caption>
    <tr><th>slot</th><th>heap (count) before</th><th>run</th><th>cooldown queue after</th><th>returns to heap at end of slot</th></tr>
    <tr><td>1</td><td>A3 B2 C1</td><td>A</td><td>A2 (back after slot 3)</td><td>–</td></tr>
    <tr><td>2</td><td>B2 C1</td><td>B</td><td>A2, B1 (after 4)</td><td>–</td></tr>
    <tr><td>3</td><td>C1</td><td>C (done)</td><td>A2, B1</td><td>A2</td></tr>
    <tr><td>4</td><td>A2</td><td>A</td><td>B1, A1 (after 6)</td><td>B1</td></tr>
    <tr><td>5</td><td>B1</td><td>B (done)</td><td>A1</td><td>–</td></tr>
    <tr><td>6</td><td>(empty)</td><td><b>idle</b></td><td>A1</td><td>A1</td></tr>
    <tr><td>7</td><td>A1</td><td>A (done)</td><td>–</td><td>–</td></tr>
  </table>
  <p>Schedule: <b>A B C A B idle A</b> = 7 slots.</p>
<div class="fx" data-lang="py">from collections import Counter, deque

def schedule(tasks, n, trace=False):
    heap = [(-c, t) for t, c in Counter(tasks).items()]   # max-heap by remaining count
    heapq.heapify(heap)
    cooldown = deque()                                     # (slot when available again, -count, task)
    slot, plan = 0, []
    while heap or cooldown:
        slot += 1
        if heap:
            c, t = heapq.heappop(heap)
            plan.append(t)
            if c + 1 &lt; 0:                                   # copies left
                cooldown.append((slot + n, c + 1, t))
        else:
            plan.append("idle")
        if cooldown and cooldown[0][0] == slot:             # cooled down: back to the heap
            _, c, t = cooldown.popleft()
            heapq.heappush(heap, (c, t))
    return plan

def least_interval(tasks, n):                               # LeetCode 621: just the length
    counts = Counter(tasks).values()
    top = max(counts)
    n_top = sum(1 for c in counts if c == top)
    return max(len(tasks), (top - 1) * (n + 1) + n_top)

plan = schedule("AAABBC", 2)
print(" ".join(plan), "-&gt;", len(plan), "slots | formula:", least_interval("AAABBC", 2))
for tasks, n in [("AAABBB", 2), ("ACABDB", 1), ("AAABBB", 0), ("AAAAAABCDEFG", 2)]:
    print(tasks, n, "-&gt;", len(schedule(tasks, n)), least_interval(tasks, n))</div>
  <div class="fx" data-lang="text">A B C A B idle A -&gt; 7 slots | formula: 7
AAABBB 2 -&gt; 8 8
ACABDB 1 -&gt; 6 6
AAABBB 0 -&gt; 6 6
AAAAAABCDEFG 2 -&gt; 16 16</div>
  <p>The simulation and the formula agree. The formula comes from the most frequent task: its 3 copies need (3 − 1) full gaps of n + 1 slots, then the last copy (plus any other task with the same top count): (3 − 1) × 3 + 1 = 7. If there are so many different tasks that no idle slot is needed, the answer is just the number of tasks, hence the <code>max</code>.</p>
  <h3>Complexity</h3>
  <p>Simulation: O(T log m) for T slots and m distinct tasks (at most 26 letters, so effectively O(T)). Formula: O(N) to count.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>greedy heap schedule</strong> repeatedly takes the best currently-available item from a heap; items that become temporarily unavailable wait in a FIFO cooldown queue and are pushed back when their wait ends.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Picking any available task instead of the one with the most copies left. With A A A B B C, running C early can leave three A's bunched at the end, forcing extra idle slots. The heap's job is precisely to pick the hardest task first.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>621 Task Scheduler</b>, <b>767 Reorganize String</b> (cooldown 1, no idle allowed), <b>1834 Single-Threaded CPU</b> (sort by arrival, heap by processing time).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Patterns.</b> We have six heap techniques. Given a new problem, which words point to which one, and what skeleton do we start from?</div>

  <h2 id="dsa-hp-patterns"><span class="num">11</span>Patterns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section solved one Biteful question. In an interview, how do we go from the problem's wording to the right heap pattern, and which kind of heap (min or max, size k or all items) does it need?</p>
  </div>
  <table class="tbl">
    <tr><th>Pattern</th><th>Trigger words</th><th>Heap</th><th>Cost</th><th>Section</th></tr>
    <tr><td><strong>1. Repeatedly take the best</strong></td><td>"smash the two heaviest", "take from the richest pile", "most urgent first"</td><td>one heap of everything (max via negation)</td><td>O(n + m log n)</td><td>05</td></tr>
    <tr><td><strong>2. Top-k</strong></td><td>"k largest / smallest / closest / most frequent"</td><td>size k, opposite kind</td><td>O(n log k)</td><td>06, 12</td></tr>
    <tr><td><strong>3. Stream k-th</strong></td><td>"after each add", "kth largest so far"</td><td>size-k heap kept alive</td><td>O(log k) per add</td><td>07</td></tr>
    <tr><td><strong>4. k-way merge</strong></td><td>"k sorted lists / arrays / files", "kth smallest in sorted matrix"</td><td>one head per list</td><td>O(N log k)</td><td>08</td></tr>
    <tr><td><strong>5. Two heaps</strong></td><td>"running median", "sliding window median", two competing groups</td><td>max-heap + min-heap</td><td>O(log n) add, O(1) read</td><td>09</td></tr>
    <tr><td><strong>6. Greedy schedule</strong></td><td>"cooldown", "no two adjacent equal", "minimum cost to…", "meeting rooms"</td><td>heap + queue / sorted events</td><td>O(n log n)</td><td>10</td></tr>
  </table>
  <p>The two skeletons used most, as runnable functions, tested on the running example:</p>
<div class="fx" data-lang="py">def take_best_template(items, steps):
    """Pattern 1: always serve the current best (here: most urgent = fewest minutes)."""
    h = list(items)
    heapq.heapify(h)                          # O(n)
    return [heapq.heappop(h) for _ in range(min(steps, len(h)))]

def top_k_template(items, k, key=lambda x: x):
    """Pattern 2: k largest by key, with a min-heap of size k."""
    h = []
    for i, x in enumerate(items):
        entry = (key(x), i, x)                # i breaks ties
        if len(h) &lt; k:
            heapq.heappush(h, entry)
        elif entry &gt; h[0]:
            heapq.heapreplace(h, entry)       # drop the current cut-off
    return [x for _, _, x in sorted(h, reverse=True)]

print(take_best_template(zip(minutes, orders), 3))
print(top_k_template(list(zip(orders, bills)), 3, key=lambda ob: ob[1]))</div>
  <div class="fx" data-lang="text">[(5, 'O7'), (8, 'O4'), (12, 'O2')]
[('O5', 310), ('O3', 250), ('O8', 200)]</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Before coding, say one sentence: "the heap top is the item I will <em>use</em> next" (patterns 1, 4, 6) or "the heap top is the item I will <em>throw away</em> next" (patterns 2, 3, 5). That sentence fixes min-heap versus max-heap every time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for a heap when sorting once is enough. If all data is known up front and you need the full order, <code>sorted</code> is simpler and fast. Heaps win when data keeps arriving, when k ≪ n, or when the "best" changes as you go.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>1642 Furthest Building You Can Reach</b> (greedy + size-k heap of the biggest climbs), <b>2462 Total Cost to Hire K Workers</b> (two heaps), <b>264 Ugly Number II</b> (generate in order with a heap).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: More Classic Problems.</b> Let us confirm the patterns on three famous problems with their own twists: kth largest in an array (and its O(n) rival), top-k frequent (count first), and k closest points (max-heap for the smallest).</div>

  <h2 id="dsa-hp-problems"><span class="num">12</span>More Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Merge k lists (08), median (09) and task scheduler (10) are done. Do the other top interview heap problems need anything beyond the top-k template, and when does a non-heap answer beat it?</p>
  </div>
  <p>If you arrived from an event-simulation problem in the tracker (1353, 1834, 1882, 2402: sort events by time, keep a heap of what is available), its lesson is the greedy loop of section 10; two-heap problems are in section 09, k-way merge in section 08.</p>
  <h3>1. Kth Largest Element in an Array (LeetCode 215)</h3>
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

for nums, k in [(bills, 3), ([3, 2, 1, 5, 6, 4], 2), ([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), ([7], 1), ([-1, -1], 2)]:
    print(nums, k, "-&gt;", find_kth_largest(nums, k))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200] 3 -&gt; 200
[3, 2, 1, 5, 6, 4] 2 -&gt; 5
[3, 2, 3, 1, 2, 4, 5, 5, 6] 4 -&gt; 4
[7] 1 -&gt; 7
[-1, -1] 2 -&gt; -1</div>
  <p>Time O(n log k), space O(k). Mention in the interview: Quickselect does it in O(n) average, and <code>heapq.nlargest(k, nums)[-1]</code> is the one-liner.</p>

  <h3>2. Top K Frequent Elements (LeetCode 347)</h3>
  <p><code>[1, 1, 1, 2, 2, 3]</code>, k = 2 → <code>[1, 2]</code>. Count first with a <code>Counter</code> (a dict of value → how many times). Then it is top-k on the counts. On Biteful's bills, the most frequent amount is ₹80 (O2 and O6).</p>
<div class="fx" data-lang="py">def top_k_frequent(nums, k):
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

for nums, k in [(bills, 1), ([1, 1, 1, 2, 2, 3], 2), ([1], 1), ([4, 4, 5, 5, 5, 6, 6, 6, 6], 2)]:
    print(nums, k, "-&gt;", top_k_frequent(nums, k), top_k_frequent_bucket(nums, k))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200] 1 -&gt; [80] [80]
[1, 1, 1, 2, 2, 3] 2 -&gt; [1, 2] [1, 2]
[1] 1 -&gt; [1] [1]
[4, 4, 5, 5, 5, 6, 6, 6, 6] 2 -&gt; [6, 5] [6, 5]</div>
  <p>Heap version: O(n log k). Bucket version: O(n), because a frequency is at most n, so an array indexed by frequency replaces sorting. Interviewers like hearing both.</p>

  <h3>3. K Closest Points to Origin (LeetCode 973)</h3>
  <p>Points <code>[[3,3],[5,-1],[-2,4]]</code>, k = 2 → the two nearest to (0,0). Biteful version: the 2 riders nearest to the restaurant. Top-k pattern again, but now we want the k <strong>smallest</strong> distances, so the heap holds the opposite: a <strong>max</strong>-heap (negated distance) of size k.</p>
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
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>215 Kth Largest Element in an Array</b>, <b>347 Top K Frequent Elements</b>, <b>973 K Closest Points to Origin</b>, then <b>692 Top K Frequent Words</b> (ties broken alphabetically).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Heap code is short, and its bugs are silent: a wrong heap kind or a direct list edit gives plausible but wrong answers.</div>

  <h2 id="dsa-hp-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The patterns are right, so why do heap solutions still fail? Almost always one of these five slips.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: editing the list directly</span>
    <p><code>h.append(x)</code>, <code>h[0] = 5</code>, <code>h.sort()</code>, <code>h.remove(x)</code> all break the heap order silently (well, <code>sort</code> keeps it valid but costs O(n log n)). Only touch the list through <code>heapq</code> functions, or call <code>heapify</code> again after a direct edit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong heap kind for top-k</span>
    <p>k largest → min-heap (pop the small ones out). k smallest → max-heap (pop the big ones out). Say it out loud before coding: "the heap top is the one I am ready to throw away".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deleting or updating a value inside the heap</span>
    <p>There is no O(log n) "remove this value". If O3's promised time changes, the standard fix is <strong>lazy deletion</strong>: push the updated entry, record the old one as stale in a set or dict, and when popping, skip anything stale. Dijkstra uses exactly this: push the new better distance, ignore the stale entry when it pops.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading h as sorted</span>
    <p><code>h[1]</code> is not the second smallest: in our heap <code>h[1]</code> is 12 but the second most urgent is 8 at <code>h[2]</code>. Only <code>h[0]</code> means anything. For the k smallest in order, pop k times or use <code>nsmallest</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: heapify cost and ties</span>
    <p>Building a heap by n pushes is O(n log n); <code>heapify</code> is O(n). And when priorities can tie, add a counter before the item: <code>(priority, count, item)</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have the structure, its operations, the library and six patterns. How does each grow from the one before, and what does each give on Biteful's 8 deliveries?</div>

  <h2 id="dsa-hp-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How is each concept built from the previous one, which question does each answer, and when do you reach for it?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-hp-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">the need</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">most urgent: O7 (5 min)</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">complete tree in a list</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">2i+1, 2i+2, (i−1)//2</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">sift up / sift down</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">O(log n): 7 swaps for 8 pushes</text>
<line x1="555" y1="54" x2="555" y2="86" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="ft st"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">heapq</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">min-heap; −bill for max</text>
<line x1="460" y1="110" x2="422" y2="110" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="ft st"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">top-k (size-k heap)</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">[200, 250, 310]</text>
<line x1="240" y1="110" x2="202" y2="110" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<rect x="10" y="88" width="190" height="44" rx="7" class="ft st"/><text x="105" y="107" text-anchor="middle" font-size="11.5" font-weight="700">k-th in a stream</text><text x="105" y="123" text-anchor="middle" class="tm" font-size="10">80 → 120 → 200</text>
<line x1="555" y1="132" x2="555" y2="164" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<line x1="555" y1="132" x2="330" y2="164" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<line x1="555" y1="132" x2="105" y2="164" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<rect x="10" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="105" y="185" text-anchor="middle" font-size="11.5" font-weight="700">k-way merge</text><text x="105" y="201" text-anchor="middle" class="tm" font-size="10">3 kitchens → 5 8 12 … 40</text>
<rect x="240" y="166" width="180" height="44" rx="7" class="fg sg"/><text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">two heaps</text><text x="330" y="201" text-anchor="middle" class="tm" font-size="10">median of 8 bills: 100</text>
<rect x="460" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="555" y="185" text-anchor="middle" font-size="11.5" font-weight="700">greedy schedule</text><text x="555" y="201" text-anchor="middle" class="tm" font-size="10">A B C A B idle A = 7</text>
<line x1="105" y1="210" x2="240" y2="244" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<line x1="330" y1="210" x2="330" y2="242" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<line x1="555" y1="210" x2="420" y2="244" stroke="currentColor" marker-end="url(#dsa-hp-a9)"/>
<rect x="160" y="244" width="340" height="48" rx="7" class="fv"/><text x="330" y="264" text-anchor="middle" font-size="11.5" font-weight="700">one promise: h[0] is the best, in O(1)</text><text x="330" y="281" text-anchor="middle" class="tm" font-size="10">keep it true in O(log n) per change</text>
</svg><figcaption>Read it as a path. The need for "most urgent" forces a weaker order than sorting; a complete tree packs that order into a list; sifting keeps it in O(log n); heapq packages it. The patterns differ only in what the heap holds (everything, the best k, one head per list, half the data) and what we do with the top.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's 8 pending deliveries</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>Use when</th></tr>
    <tr><td>Priority queue (need)</td><td>"best first" instead of LIFO/FIFO</td><td>which order next?</td><td>O7 (5 min), then O4, O2; 40k backlog: ~2.3 s vs ~0.003 s</td><td>items keep arriving, best leaves</td></tr>
    <tr><td>Complete tree in a list</td><td>Trees note + level-order packing</td><td>where are parent and children?</td><td>[5, 12, 8, 18, 30, 40, 15, 25]; children of 1: 3, 4</td><td>always (it is the heap)</td></tr>
    <tr><td>Sift up / down</td><td>swaps along one path</td><td>how is the rule restored?</td><td>8 pushes: 7 swaps; pop: 2 swaps; heapify: 4 swaps</td><td>understanding O(log n)</td></tr>
    <tr><td>heapq</td><td>C implementation on a list</td><td>how in real Python?</td><td>riders take O7, O4, O2; max via −bill: O5</td><td>every heap problem</td></tr>
    <tr><td>Top-k</td><td>size-k heap of the opposite kind</td><td>k best of n?</td><td>[200, 250, 310]; 10 lakh: faster than sorting</td><td>k ≪ n, streams</td></tr>
    <tr><td>Stream k-th</td><td>top-k heap kept alive</td><td>k-th best after each arrival?</td><td>80, 120, 120, 120, 200</td><td>dashboards, leaderboards</td></tr>
    <tr><td>k-way merge</td><td>heap of list heads</td><td>merge sorted sources?</td><td>[5, 8, 12, 15, 18, 25, 30, 40]</td><td>k sorted lists/files/streams</td></tr>
    <tr><td>Two heaps</td><td>max-heap + min-heap, balanced</td><td>running median?</td><td>120, 100, 120, 100, 120, 100, 80, 100</td><td>medians, two competing groups</td></tr>
    <tr><td>Greedy schedule</td><td>max-heap + cooldown queue</td><td>best plan under waiting rules?</td><td>A B C A B idle A = 7</td><td>cooldowns, CPU/server scheduling</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a heap promises only "the best item is at index 0", and that small promise is cheap to keep (O(log n) per change), so use it whenever you repeatedly need the best of a changing collection.</strong> If you need full order, sort; if you need lookups by value, use a dict or a BST.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_graphs">Graphs</a>: our riders so far choose between orders. Choosing the fastest <em>route</em> through a city of roads with different travel times is Dijkstra's algorithm, which is BFS with this note's heap in place of the queue.</div>

  <h2 id="dsa-hp-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's 8 pending deliveries O1..O8 with minutes left <b>[25, 12, 40, 8, 30, 15, 5, 18]</b> and bills <b>[120, 80, 250, 40, 310, 80, 60, 200]</b>.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Need</td><td>most urgent next, fast?</td><td>O7 first; list scan O(n) per pick</td><td>what structure?</td></tr>
    <tr><td>Tree in a list</td><td>no pointers?</td><td>[5, 12, 8, 18, 30, 40, 15, 25]</td><td>how to keep the rule?</td></tr>
    <tr><td>Sift up / down</td><td>repair after change?</td><td>5 climbs 2 levels; pop: 25 sinks 2 levels</td><td>write it every time?</td></tr>
    <tr><td>heapq</td><td>Python's version?</td><td>min-heap; −bill → O5 first</td><td>only want k items</td></tr>
    <tr><td>Top-k</td><td>k biggest of n?</td><td>[200, 250, 310]</td><td>data keeps arriving</td></tr>
    <tr><td>Stream k-th</td><td>k-th after each add?</td><td>80, 120, 120, 120, 200</td><td>several sorted sources</td></tr>
    <tr><td>k-way merge</td><td>merge sorted lists?</td><td>5 8 12 15 18 25 30 40</td><td>tops are extremes, not the middle</td></tr>
    <tr><td>Two heaps</td><td>running median?</td><td>final median 100</td><td>best may need to wait</td></tr>
    <tr><td>Scheduler</td><td>plan with cooldown?</td><td>7 slots</td><td>→ Graphs (Dijkstra)</td></tr>
  </table>
  <h3>Rules and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Heap rule (min)</td><td>h[(i − 1) // 2] ≤ h[i] for all i ≥ 1</td><td>so h[0] = minimum</td></tr>
    <tr><td>Index math</td><td>left 2i + 1, right 2i + 2, parent (i − 1) // 2</td><td>i = position in the list</td></tr>
    <tr><td>Height</td><td>⌊log₂ n⌋</td><td>n = 8 → 3 levels below the root</td></tr>
    <tr><td>Costs</td><td>peek O(1); push, pop O(log n); heapify O(n); search O(n)</td><td>heapify ≤ 2n swaps</td></tr>
    <tr><td>Max-heap</td><td>push −x, read −h[0]</td><td>tuples: (−priority, tiebreak, item)</td></tr>
    <tr><td>Top-k</td><td>O(n log k) time, O(k) space</td><td>k largest → min-heap of size k</td></tr>
    <tr><td>k-way merge</td><td>O(N log k)</td><td>N = total items, k = lists</td></tr>
    <tr><td>Median</td><td>odd: −lower[0]; even: (−lower[0] + upper[0]) / 2</td><td>sizes differ by ≤ 1, lower ≤ upper</td></tr>
    <tr><td>Task scheduler</td><td>max(T, (f − 1)(n + 1) + c)</td><td>T = tasks, f = top count, c = tasks with count f, n = cooldown</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Heap</b><p>Repeatedly need the best of a changing set; k ≪ n; streams.</p><small>Not for search by value or full sorted order</small></div>
    <div><b>Size-k heap</b><p>Top-k, k-th largest, k closest.</p><small>If k ≈ n, just sort</small></div>
    <div><b>Two heaps</b><p>Medians and "split into halves" problems.</p><small>Window versions need lazy deletion</small></div>
    <div><b>Heap + queue</b><p>Greedy with cooldowns or release times.</p><small>Check if a closed formula exists (621)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Thinking the heap list is sorted (<code>h[1]</code> means nothing); editing <code>h</code> directly; wrong heap kind for top-k; tuple ties comparing dicts or nodes (add a counter); n pushes instead of heapify; deleting from the middle (use lazy deletion); a deque when the problem says "priority"; swapping with the bigger child in sift down.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Children and parent of index 3 in [5, 12, 8, 18, 30, 40, 15, 25]?</td><td>Children 7 (25) and 8 (none); parent 1 (12)</td></tr>
    <tr><td>After popping 5, what is the new root and the list?</td><td>8; [8, 12, 15, 18, 30, 40, 25]</td></tr>
    <tr><td>Which heap finds the 3 biggest bills, and its final contents?</td><td>Min-heap of size 3: {200, 250, 310}; top 200 = 3rd largest</td></tr>
    <tr><td>Why is heapify O(n)?</td><td>Most nodes are near the bottom and sift down 0–2 levels; total ≤ 2n</td></tr>
    <tr><td>Running median after 80, 120, 250?</td><td>120 (lower {80, 120}, upper {250})</td></tr>
  </table>

  <h2 id="dsa-hp-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a heap, and what does it promise?</summary><div class="qa-body">A complete binary tree stored in a list, where every parent is ≤ its children (min-heap). It promises only that the root <code>h[0]</code> is the minimum. The rest of the list is not sorted: our deliveries heap is [5, 12, 8, 18, …].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where are the children and parent of index i?</summary><div class="qa-body">Children at <code>2i+1</code> and <code>2i+2</code>, parent at <code>(i-1)//2</code>. This works because a complete tree has no gaps, so levels pack into the list one after another.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Complexity of push, pop, peek, heapify, and search?</summary><div class="qa-body">push O(log n), pop O(log n), peek O(1), heapify O(n), search O(n). The log comes from the tree height; sift up/down touch one root-to-leaf path only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is heapify O(n) and not O(n log n)?</summary><div class="qa-body">It sifts down starting from the last parent. Half the nodes are leaves and do no work; a quarter move at most 1 step; an eighth at most 2 steps. The sum n/2·0 + n/4·1 + n/8·2 + … is bounded by 2n. Measured: fewer than one swap per item on random data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Python has no max-heap. How do you get one?</summary><div class="qa-body">Push the negative: <code>heappush(h, -x)</code>, read <code>-h[0]</code>. For tuples, negate the priority field: <code>(-bill, order)</code>. For objects, wrap them in a class with a reversed <code>__lt__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>To find the k largest items, which heap do you keep and why?</summary><div class="qa-body">A min-heap of size k. After each push, if the size exceeds k, pop: that removes the smallest, which can never be among the top k. At the end the heap holds the k largest and <code>h[0]</code> is the kth largest. O(n log k) time, O(k) space, works on a stream.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Heap of size k vs sorting: when is each better?</summary><div class="qa-body">Heap: O(n log k), best when k is small compared to n or when the data streams in (on 10 lakh bills with k = 10 it beat a full sort). Sort: O(n log n) but simpler and better when k is close to n or when you need the whole order. Quickselect: O(n) average for just the kth element.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the two-heaps median trick and the rebalancing rule.</summary><div class="qa-body">Max-heap for the lower half, min-heap for the upper half. Every new number goes into lower, lower's max moves to upper (keeps lower ≤ upper), and if upper is now bigger, upper's min moves back. Sizes differ by at most 1. Median = lower's top (odd count) or the average of both tops (even). O(log n) add, O(1) median.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You push (1, obj1) and (1, obj2) and get a TypeError. Why, and the fix?</summary><div class="qa-body">Tuples compare element by element. Priorities tie at 1, so Python compares obj1 &lt; obj2, which objects do not support. Add a unique counter: <code>(priority, count, obj)</code>. The counter settles the tie and also gives first-in-first-out among equal priorities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you remove or update an item that is already inside the heap?</summary><div class="qa-body">Not directly: finding it is O(n). Use lazy deletion: record it as removed in a set/dict, push the updated version, and whenever you pop, discard entries that are marked stale. Dijkstra and sliding-window problems use this.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge k sorted lists: complexity with a heap, and why not sort everything?</summary><div class="qa-body">Heap holds one head per list, so each of N items is pushed and popped once at O(log k): O(N log k), O(k) extra space. Sorting everything is O(N log N) and needs all data in memory; the heap version also works on k streams or files.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>h=[5,1,8]; heapq.heapify(h); print(h, heapq.heappushpop(h, 0), heapq.heapreplace(h, 0), h)</code></summary><div class="qa-body"><code>[0, 5, 8] 0 1 [0, 5, 8]</code>. heapify makes 1 the root. heappushpop pushes 0 and pops the min, which is the 0 itself, heap unchanged. heapreplace pops the min 1 first, then pushes 0. Bonus trap: the first <code>h</code> also prints <code>[0, 5, 8]</code>, because print evaluates all arguments before printing and the list was mutated in between.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a heap need to be a <em>complete</em> tree, when a BST does not?</summary><div class="qa-body">Completeness is what lets the tree live in a list with the 2i + 1 / 2i + 2 index math and no gaps, and it guarantees height ⌊log₂ n⌋, so every sift is O(log n). A BST stores nodes with pointers and keeps a stronger order (everything sorted), so it can have any shape and needs separate balancing to stay O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what changes if you replace the deque in BFS with a heap?</summary><div class="qa-body">Nodes come out by priority (smallest distance so far) instead of discovery order. With equal edge weights it behaves like BFS; with different weights it becomes Dijkstra's algorithm, which finds shortest paths that BFS cannot. The Stacks &amp; Queues note had newest-first and oldest-first; the heap adds best-first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the k-th-in-a-stream class reuse the top-k heap instead of a sorted list?</summary><div class="qa-body">The top-k heap already holds exactly the state needed (the k best so far, cut-off at the top), and each new bill costs O(log k). A sorted list of all bills would answer too, but each insert is O(n) (shifting, as Binary Search's <code>insort</code> showed) and memory grows with every order.</div></details>
</main>
`
});
