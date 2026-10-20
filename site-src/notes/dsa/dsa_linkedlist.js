// notes/dsa/dsa_linkedlist.js — Linked Lists
Object.assign(TOPIC_CONTENT, {
  "dsa_linkedlist": `<main>
<h1>Linked Lists</h1>
  <div class="where"><span>DSA</span><span>Linear structures</span><span>Linked Lists</span></div>
  <p class="lead">A linked list is a chain of small boxes, each holding a value and the address of the next box. It makes inserting and removing at the front (or next to a node you hold) cheap, at the cost of slow lookup by position. This note starts from one problem on Biteful's delivery queue: VIP orders must jump to the front, and on a Python list every front insert shifts the whole queue. From there: nodes and pointers drawn, traversal / insert / delete traced, the dummy head trick, reversing (with a pointer table per step), fast &amp; slow pointers (middle, Floyd's cycle detection), merging two sorted shifts, the doubly linked list, and finally the LRU cache (dict + doubly linked list) traced on 5 operations. The values are Biteful's charges from the earlier notes. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-ll-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-ll-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Complexity (list = array) · Arrays (two pointers) · Hashing (dict) · Python: Functions, classes</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-ll-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Linked Lists</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · O(1) at the front, order kept</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ll-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ll-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ll-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Stacks &amp; Queues (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">deque = linked blocks</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Trees · Graphs</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">nodes with 2+ pointers</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Heaps</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">merge k sorted lists</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-ll-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Linked Lists: about 35 problems tagged dummy head, reversal, fast &amp; slow, merge</text>
</svg><figcaption>Reading order for the first DSA block: Complexity → Arrays → Hashing → <b>Linked Lists</b>. A node with one pointer here becomes a tree node with two pointers later.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_complexity">Complexity</a>, <a class="xref" data-note="dsa_arrays">Arrays</a>, <a class="xref" data-note="dsa_hashing">Hashing</a></b><span>Complexity showed a Python list is one block of slots, so <code>insert(0, x)</code> shifts everyone (O(n)). Arrays taught two pointers moving through a sequence. Hashing gave O(1) lookup by key but no notion of order. You also need classes (<a class="xref" data-note="py_functions">Functions</a> and the OOP notes) to define a node.</span></li>
    <li><b>This note adds: pointer-based sequences</b><span>Nodes linked by references: O(1) insert/delete where you stand, O(n) to reach position i. The standard pointer techniques (dummy head, reverse, fast &amp; slow, merge), the doubly linked list, and the LRU cache.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a></b><span>Stacks and queues are the two most common uses of "add/remove at an end in O(1)"; Python's <code>deque</code> is the linked version. Trees and graphs reuse the node-and-pointer idea with more pointers. Practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-ll-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next. Running example: Biteful's delivery queue <b>120 → 80 → 250 → 40 → 310</b> (the first charges of the day), the sorted shifts lunch <b>[40, 80, 120, 250]</b> and dinner <b>[60, 80, 200, 310]</b>, and a recent-orders cache of size 2.</p>
  <ol class="story">
    <li><b>The front-insert problem</b><span>Q: VIP orders must go to the front of a 2-lakh queue; what does that cost on a Python list? → Every <code>insert(0, x)</code> shifts all items: 1,000 VIP inserts took about 40 ms vs well under 1 ms at the back. Can we add at the front without moving anyone?</span></li>
    <li><b>Nodes &amp; pointers</b><span>Q: what if each order only knew the order behind it? → A node = value + <code>next</code>; the queue is head → 120 → 80 → 250 → 40 → 310 → None. Nobody sits in a numbered slot. But how do we read, add and remove now?</span></li>
    <li><b>Traversal, insert, delete</b><span>Q: what do the basic operations cost? → Walk with <code>cur = cur.next</code> (find 40: 4 steps; O(n)); push to the front or insert after a node you hold: 2 pointer changes, O(1); delete after: 1 change. But deleting the <em>head</em> needs a special case…</span></li>
    <li><b>Dummy head</b><span>Q: how do we stop treating the first node differently? → A fake node before the head: removing every cancelled 80 from 80 → 120 → 80 → 250 needs one loop, returns <code>dummy.next</code> = 120 → 250. Now, the first real pointer puzzle: reversing.</span></li>
    <li><b>Reverse</b><span>Q: how do we flip every arrow without losing the rest? → prev / cur / nxt: save nxt, flip, slide. 4 steps turn 120 → 80 → 250 → 40 into 40 → 250 → 80 → 120. O(n), O(1) space. But many questions need a position (the middle, k from the end) and we don't know the length…</span></li>
    <li><b>Fast &amp; slow pointers</b><span>Q: middle in one pass? loop detection without extra memory? → Slow moves 1, fast moves 2: middle of the 5-order queue = 250; with a bug (310 → 80) they meet after 4 steps (Floyd), and the loop start (80) is found by a second walk. Next: combining two lists…</span></li>
    <li><b>Merge two sorted lists</b><span>Q: lunch and dinner shifts are each sorted; one sorted queue? → Compare heads, take the smaller, re-link: 40 → 60 → 80 → 80 → 120 → 200 → 250 → 310 with no new nodes. But a singly list can only go forward, and deleting a node needs the one before it…</span></li>
    <li><b>Doubly linked list</b><span>Q: remove a node when you hold only that node? walk backwards? → Each node also has <code>prev</code>: cancel 250 in O(1) given its node; read the queue backwards. Python's <code>deque</code> is built this way. Last: combine it with a dict…</span></li>
    <li><b>LRU cache</b><span>Q: keep the 2 most recently viewed orders, O(1) get and put? → dict key → node for O(1) find, doubly list for recency order. Traced on put 101, put 102, get 101, put 103 (evicts 102), get 102 → −1.</span></li>
  </ol>

  <h2 id="dsa-ll-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linked Lists</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Node</b> — value + pointer (<code>next</code>) to the next node; last points to <code>None</code></li>
          <li><b>Head</b> — the first node; the only thing you hold; lose it = lose the list</li>
          <li><b>Why</b> — insert/delete at the front or next to a held node is O(1); a list shifts everything</li>
          <li><b>Cost</b> — no index: reaching position i takes O(i) steps</li>
          <li>💡 Train coaches hooked one to the next; add a coach by changing two hooks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Singly vs doubly</div>
        <ul>
          <li><b>Singly</b> — <code>next</code> only; forward walk; less memory</li>
          <li><b>Doubly</b> — <code>prev</code> and <code>next</code>; delete a node in O(1) given the node; backward walk</li>
          <li><b>Python</b> — <code>collections.deque</code> is a doubly linked block list; O(1) at both ends</li>
          <li>⚠ Python <code>list</code> is an array, not a linked list: <code>insert(0, x)</code> is O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Big-O</div>
        <ul>
          <li><b>Access i-th / search</b> — O(n): walk from head</li>
          <li><b>Insert/delete at head</b> — O(1)</li>
          <li><b>Insert/delete after a known node</b> — O(1)</li>
          <li><b>Append at tail</b> — O(n), or O(1) with a stored tail pointer</li>
          <li><b>Space</b> — O(n), one extra pointer per node (two if doubly)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core tricks</div>
        <ul>
          <li><b>Dummy head</b> — fake node before the head; return <code>dummy.next</code></li>
          <li><b>Reverse</b> — <code>prev, cur, nxt</code>; save <code>nxt</code> before flipping <code>cur.next</code></li>
          <li><b>Fast/slow</b> — fast moves 2, slow moves 1; fast at end → slow at middle</li>
          <li><b>Gap of n</b> — lead by n → when lead hits end, trailer is n from end</li>
          <li>⚠ Order of assignments matters; draw the picture before coding</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Walk with prev</b> — delete / insert needs the node <em>before</em></li>
          <li><b>Fast &amp; slow (Floyd)</b> — middle, cycle detection, cycle start</li>
          <li><b>Merge with dummy</b> — two sorted lists → one, re-link nodes</li>
          <li><b>In-place reverse</b> — whole list, a part, or k groups</li>
          <li><b>Hash map + list</b> — LRU cache</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>⚠ <code>None.next</code> — check <code>fast and fast.next</code> before <code>fast.next.next</code></li>
          <li>⚠ Losing the rest — save <code>nxt</code> before changing <code>cur.next</code></li>
          <li>⚠ Returning the old head after reversing — the new head is <code>prev</code></li>
          <li>⚠ Infinite loop on a cycle when printing — bound the walk</li>
          <li>⚠ Recursion depth — Python stops near 1000 calls; prefer loops</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-ll-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Front-Insert Problem</span><span class="rm-sub">VIP orders on a Python list</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-nodes"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Nodes &amp; Pointers</span><span class="rm-sub">Value + next, head, None</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-ops"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Traverse, Insert, Delete</span><span class="rm-sub">Traced, with Big-O</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-dummy"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Dummy Head Trick</span><span class="rm-sub">Kill the "first node" special case</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-reverse"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Reverse a List</span><span class="rm-sub">Pointer table per step</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-fastslow"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Fast &amp; Slow Pointers</span><span class="rm-sub">Middle, Floyd's cycle, gap of n</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-merge"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Merge Two Sorted Lists</span><span class="rm-sub">Lunch + dinner shifts</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-types"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Doubly Linked Lists</span><span class="rm-sub">prev pointers, sentinels, deque</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-lru"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">LRU Cache</span><span class="rm-sub">Dict + doubly list, 5 operations traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">Signal words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">Reverse, Merge, Cycle, Middle, Nth from end</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ll-need"><span class="num">01</span>The Front-Insert Problem</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every structure so far stores items in one block (list) or in hash slots (dict). A dict has no order; a list has order but must shift every item to make room at the front. Biteful's delivery queue needs both: an order, and cheap changes at the front.</p>
  </div>
  <p>Biteful's dispatch screen holds a queue of orders waiting for riders. Normal orders join at the back. VIP orders (Biteful Gold members) jump to the <strong>front</strong>. On a busy evening the queue holds 2 lakh orders. Measure both on a Python list, and on <code>collections.deque</code>:</p>
<div class="fx" data-lang="py">import timeit
from collections import deque
n = 200_000
queue = list(range(n))                     # 2 lakh orders waiting
t_end   = timeit.timeit(lambda: queue.append(1),    number=1000)
t_front = timeit.timeit(lambda: queue.insert(0, 1), number=1000)
dq = deque(range(n))
t_dq    = timeit.timeit(lambda: dq.appendleft(1),   number=1000)
print(f"1000 normal orders at the back   (list.append)     : {t_end*1000:6.2f} ms")
print(f"1000 VIP orders at the front     (list.insert(0,x)): {t_front*1000:6.2f} ms  (each shifts {n:,}+ items)")
print(f"1000 VIP orders at the front     (deque.appendleft): {t_dq*1000:6.2f} ms")</div>
  <div class="fx" data-lang="text">1000 normal orders at the back   (list.append)     :   0.07 ms
1000 VIP orders at the front     (list.insert(0,x)):  39.31 ms  (each shifts 200,000+ items)
1000 VIP orders at the front     (deque.appendleft):   0.04 ms</div>
  <p>Front inserts on the list were several hundred times slower than back inserts, because a list is one block: every VIP order shifts all 2 lakh pointers one slot right (the Complexity note drew this). The deque did the same front inserts as cheaply as appends. How? It doesn't keep items in one row; it keeps them in <strong>linked</strong> pieces. That idea, at its simplest, is the <strong>linked list</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A train is a line of coaches, each hooked to the next. To add a coach at the front, staff hook it to the engine side; no other coach moves. But to find coach number 9 you walk from the engine and count: there is no "jump to coach 9". A Python list is the opposite: a cinema row with numbered seats, instant to find seat 9, painful to squeeze someone into seat 0.</p>
  </div>
  <table class="tbl">
    <tr><th>Need</th><th>Python list (array)</th><th>Linked list</th></tr>
    <tr><td>Read item number i</td><td>O(1) — jump</td><td>O(i) — walk</td></tr>
    <tr><td>Insert / delete at the front</td><td>O(n) — shift all</td><td>O(1)</td></tr>
    <tr><td>Insert / delete next to a node you hold</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Memory per item</td><td>one slot</td><td>value + pointer (more)</td></tr>
    <tr><td>Used for</td><td>almost everything in Python</td><td>queues, LRU caches, undo chains, interview questions</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>linked list</strong> is a sequence of nodes where each node stores a value and a reference to the next node. Order comes from the links, not from positions in memory.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Linked lists are faster than lists." Only at the front or next to a node you already hold. For reading by position, scanning and memory use, the array wins; in everyday Python you use a list or a deque, and write your own nodes mainly in interviews and inside data structures like the LRU cache.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Nodes &amp; Pointers.</b> We know <em>that</em> a chain of linked pieces avoids shifting. We have not built one: what exactly is a node, and what does the program hold on to?</div>

  <h2 id="dsa-ll-nodes"><span class="num">02</span>Nodes &amp; Pointers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Without numbered slots, how does the program know which order comes after 120, or where the queue starts and ends?</p>
  </div>
  <p>A <strong>node</strong> is a tiny object with two fields: the <strong>value</strong> and <strong>next</strong>, a reference to the following node. A <strong>pointer</strong> is any variable that refers to a node. The last node's <code>next</code> is <code>None</code>. The <strong>head</strong> is the first node, and it is the only thing you keep.</p>
<figure class="viz"><svg viewBox="0 0 560 120" width="560">
<defs><marker id="dsa-ll-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<text x="30" y="30" class="tb">head</text>
<line x1="42" y1="36" x2="42" y2="58" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<g>
<rect x="20" y="60" width="44" height="34" class="fb sb"/><rect x="64" y="60" width="26" height="34" class="fs" stroke="currentColor"/>
<text x="42" y="82" text-anchor="middle">120</text><circle cx="77" cy="77" r="3" fill="currentColor"/>
<line x1="77" y1="77" x2="148" y2="77" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="150" y="60" width="44" height="34" class="fb sb"/><rect x="194" y="60" width="26" height="34" class="fs" stroke="currentColor"/>
<text x="172" y="82" text-anchor="middle">80</text><circle cx="207" cy="77" r="3" fill="currentColor"/>
<line x1="207" y1="77" x2="278" y2="77" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="280" y="60" width="44" height="34" class="fb sb"/><rect x="324" y="60" width="26" height="34" class="fs" stroke="currentColor"/>
<text x="302" y="82" text-anchor="middle">250</text><circle cx="337" cy="77" r="3" fill="currentColor"/>
<line x1="337" y1="77" x2="408" y2="77" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="410" y="60" width="44" height="34" class="fb sb"/><rect x="454" y="60" width="26" height="34" class="fs" stroke="currentColor"/>
<text x="432" y="82" text-anchor="middle">40</text><text x="467" y="82" text-anchor="middle" class="tm">/</text>
<text x="500" y="82" class="tm">None</text>
</g>
<text x="42" y="112" text-anchor="middle" class="tm">val</text><text x="77" y="112" text-anchor="middle" class="tm">next</text>
</svg><figcaption>Biteful's delivery queue as four nodes. Each box = value (blue) + next pointer (grey). The last pointer is None. Only "head" is held by your code.</figcaption></figure>
<div class="fx" data-lang="py">class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

# Biteful's delivery queue: 120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
head = Node(120, Node(80, Node(250, Node(40, Node(310)))))

cur = head                    # walk: start at head, follow next until None
while cur:
    print(cur.val, end=" -&gt; ")
    cur = cur.next
print("None")
print(head.val, head.next.val, head.next.next.val, head.next.next.next.next.next)</div>
  <div class="fx" data-lang="text">120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
120 80 250 None</div>
  <p>Each <code>.next</code> hop moves one order along: <code>head.next.next.val</code> is 250, and five hops past the head is <code>None</code>, the end. Two helpers keep the rest of the note short: <code>build</code> turns a Python list into a chain, <code>show</code> prints a chain (with a limit, so a looped chain cannot hang it).</p>
<div class="fx" data-lang="py">class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def build(values):
    head = None
    for v in reversed(values):          # build from the back so each new node points to the old head
        head = Node(v, head)
    return head

def show(head, limit=20):
    out, cur = [], head
    while cur and len(out) &lt; limit:
        out.append(str(cur.val))
        cur = cur.next
    return " -&gt; ".join(out) + (" -&gt; None" if cur is None else " -&gt; ...")

print(show(build([120, 80, 250, 40, 310])))
print(show(build([])))</div>
  <div class="fx" data-lang="text">120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
 -&gt; None</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Node</strong>: (value, next). <strong>Head</strong>: reference to the first node. <strong>Tail</strong>: the node whose next is None. <strong>Pointer</strong>: a variable holding a node reference (in Python, every variable is one).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Moving <code>head</code> itself while walking (<code>head = head.next</code>). Afterwards nothing points to the first node: the list is lost. Walk with a second variable (<code>cur</code>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Traverse, Insert, Delete.</b> We can build and print a chain. What do reading, adding and removing cost now that there are no positions?</div>

  <h2 id="dsa-ll-ops"><span class="num">03</span>Traverse, Insert, Delete</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The promise was "cheap at the front". We need to see each operation's pointer changes and step count, and where the linked list is slower than the array.</p>
  </div>
  <h3>Traversal: the only way to reach anything</h3>
<div class="fx" data-lang="py">def walk(head):
    total = count = 0
    cur = head
    while cur:                      # visit every node once: O(n)
        total += cur.val
        count += 1
        cur = cur.next
    return count, total

def find(head, target):
    steps, cur = 0, head
    while cur:
        steps += 1
        if cur.val == target:
            return cur, steps
        cur = cur.next
    return None, steps

def get(head, i):                   # "item number i": no index, walk i hops
    cur = head
    for _ in range(i):
        cur = cur.next
    return cur.val

q = build([120, 80, 250, 40, 310])
print(walk(q), find(q, 40)[1], "steps to find 40 |", find(q, 999)[1], "steps to miss | item 3 =", get(q, 3))</div>
  <div class="fx" data-lang="text">(5, 800) 4 steps to find 40 | 5 steps to miss | item 3 = 40</div>
  <p>5 orders worth ₹800; finding 40 took 4 hops; missing a value walks all 5; "item number 3" (40) needs 3 hops. Every read by position or value is <strong>O(n)</strong>.</p>
  <h3>Insert and delete: change pointers, move nothing</h3>
  <p>Every change is "make some <code>next</code> point somewhere else". Draw the before and after pictures, then write the pointer changes in an order that never loses a node.</p>
<figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="10" y="22" class="tm">before</text>
<rect x="70" y="10" width="44" height="28" class="fb sb"/><text x="92" y="29" text-anchor="middle">120</text>
<line x1="116" y1="24" x2="168" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="10" width="44" height="28" class="fb sb"/><text x="192" y="29" text-anchor="middle">80</text>
<line x1="216" y1="24" x2="268" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="10" width="44" height="28" class="fb sb"/><text x="292" y="29" text-anchor="middle">250</text>
<rect x="170" y="50" width="44" height="28" class="fg sg"/><text x="192" y="69" text-anchor="middle">60</text><text x="225" y="69" class="tm">new node, not linked yet</text>
<text x="10" y="112" class="tm">after</text>
<rect x="70" y="100" width="44" height="28" class="fb sb"/><text x="92" y="119" text-anchor="middle">120</text>
<line x1="116" y1="114" x2="168" y2="114" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="100" width="44" height="28" class="fb sb"/><text x="192" y="119" text-anchor="middle">80</text>
<path d="M214,114 Q240,114 268,114" fill="none" class="sg" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="100" width="44" height="28" class="fg sg"/><text x="292" y="119" text-anchor="middle">60</text>
<path d="M314,114 Q340,114 368,114" fill="none" class="sg" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<rect x="370" y="100" width="44" height="28" class="fb sb"/><text x="392" y="119" text-anchor="middle">250</text>
<text x="430" y="119" class="tm">2 pointer changes</text>
</svg><figcaption>Insert 60 after the node holding 80. Green arrows are the only changes: new.next = node.next, then node.next = new. Do it in that order, or 250 is lost.</figcaption></figure>
<figure class="viz"><svg viewBox="0 0 560 100" width="560">
<text x="10" y="22" class="tm">before</text>
<rect x="70" y="10" width="44" height="28" class="fb sb"/><text x="92" y="29" text-anchor="middle">80</text>
<line x1="116" y1="24" x2="168" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="10" width="44" height="28" class="fr sr"/><text x="192" y="29" text-anchor="middle">250</text>
<line x1="216" y1="24" x2="268" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="10" width="44" height="28" class="fb sb"/><text x="292" y="29" text-anchor="middle">40</text>
<text x="10" y="72" class="tm">after</text>
<rect x="70" y="60" width="44" height="28" class="fb sb"/><text x="92" y="79" text-anchor="middle">80</text>
<path d="M114,74 Q192,40 268,74" fill="none" class="sg" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="60" width="44" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="192" y="79" text-anchor="middle" class="tm">250</text>
<rect x="270" y="60" width="44" height="28" class="fb sb"/><text x="292" y="79" text-anchor="middle">40</text>
<text x="340" y="79" class="tm">1 pointer change: prev.next = prev.next.next</text>
</svg><figcaption>Cancel 250. Nothing moves: the 80 node simply skips over it. With nothing pointing to it, Python frees the 250 node.</figcaption></figure>
<div class="fx" data-lang="py">def push_front(head, val):          # VIP order: O(1), nothing shifts
    return Node(val, head)          # the new node points at the old head

def insert_after(node, val):
    new = Node(val)
    new.next = node.next            # 1. new node grabs the rest of the chain
    node.next = new                 # 2. previous node points to the new node
    return new

def delete_after(node):
    if node.next:
        node.next = node.next.next  # skip one node; nothing moves

q = build([120, 80, 250, 40, 310])
q = push_front(q, 999)
print("VIP at front :", show(q))
insert_after(q.next.next, 60)       # after the node holding 80
print("60 after 80  :", show(q))
delete_after(q.next.next.next)      # remove the node after 60 (250 was cancelled)
print("250 removed  :", show(q))</div>
  <div class="fx" data-lang="text">VIP at front : 999 -&gt; 120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
60 after 80  : 999 -&gt; 120 -&gt; 80 -&gt; 60 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
250 removed  : 999 -&gt; 120 -&gt; 80 -&gt; 60 -&gt; 40 -&gt; 310 -&gt; None</div>
  <table class="tbl out"><caption>Trace of the three operations</caption>
    <tr><th>operation</th><th>pointer changes</th><th>steps</th><th>queue after</th></tr>
    <tr><td>VIP 999 at the front</td><td>new.next = head; head = new</td><td>O(1)</td><td>999 → 120 → 80 → 250 → 40 → 310</td></tr>
    <tr><td>60 after the 80 node</td><td>new.next = node.next; node.next = new</td><td>O(1) (holding the 80 node)</td><td>… 80 → 60 → 250 …</td></tr>
    <tr><td>cancel 250</td><td>node.next = node.next.next (node = 60)</td><td>O(1)</td><td>… 80 → 60 → 40 → 310</td></tr>
  </table>
  <p>Why does the order of the two lines in <code>insert_after</code> matter? Do them the other way round and see:</p>
<div class="fx" data-lang="py">q = build([120, 80, 250])
node = q                            # insert 60 after 120, in the WRONG order
new = Node(60)
node.next = new                     # 1. 120 now points to 60 ...
new.next = node.next                # 2. ... so 60 points to itself; 80 and 250 are lost
print(show(q, limit=6))</div>
  <div class="fx" data-lang="text">120 -&gt; 60 -&gt; 60 -&gt; 60 -&gt; 60 -&gt; 60 -&gt; ...</div>
  <p>Once 120 points at 60, nothing points at 80 any more; then <code>new.next = node.next</code> makes 60 point at itself. 80, 250 and the rest are gone, and the chain loops forever (the <code>limit</code> in <code>show</code> saved us).</p>
  <h3>Big-O for every operation</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Singly</th><th>Doubly</th><th>Why</th></tr>
    <tr><td>Read the i-th item</td><td>O(n)</td><td>O(n)</td><td>No index; walk i hops from the head</td></tr>
    <tr><td>Search for a value</td><td>O(n)</td><td>O(n)</td><td>Look at each node in turn</td></tr>
    <tr><td>Insert / delete at the head</td><td>O(1)</td><td>O(1)</td><td>Change the head pointer only</td></tr>
    <tr><td>Insert / delete after a node you hold</td><td>O(1)</td><td>O(1)</td><td>One or two pointer changes</td></tr>
    <tr><td>Delete a node you hold (not its predecessor)</td><td>O(n)</td><td>O(1)</td><td>Singly must find the previous node; doubly has <code>prev</code></td></tr>
    <tr><td>Append at the tail</td><td>O(n), O(1) with tail pointer</td><td>O(1) with tail pointer</td><td>Walking to the end costs n unless you remember the tail</td></tr>
    <tr><td>Space</td><td>O(n)</td><td>O(n)</td><td>One (or two) pointers per value</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Saying "insert is O(1)" without the condition. Inserting at position i is O(i) because you must walk there first; only the pointer change itself is O(1).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Linked Lists: <b>1290 Convert Binary Number in a Linked List to Integer</b> (traversal), <b>83 Remove Duplicates from Sorted List</b> (delete after), <b>2807 Insert Greatest Common Divisors</b> (insert after). Then 707 Design Linked List.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Dummy Head Trick.</b> <code>delete_after</code> needs the node <em>before</em> the one we remove. The head has no node before it, so removing a cancelled first order needs separate code. That special case causes most linked-list bugs.</div>

  <h2 id="dsa-ll-dummy"><span class="num">04</span>The Dummy Head Trick</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful must remove every cancelled ₹80 order from the queue 80 → 120 → 80 → 250. The first 80 is the head: there is no previous node to re-link, so the head pointer itself must change. How do we handle every position with one loop?</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>remove</b> all nodes with…", "delete", "<b>the head may change</b>", "partition", "merge", "insert into sorted list", "remove nth from end".</p>
  </div>
  <p>Put a fake node in front of the real head. Now every real node has a node before it, so one loop handles all of them. At the end return <code>dummy.next</code>, which is the real head even if it changed.</p>
<figure class="viz"><svg viewBox="0 0 560 70" width="560">
<rect x="20" y="20" width="60" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="50" y="39" text-anchor="middle" class="tm">dummy</text>
<line x1="82" y1="34" x2="118" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="120" y="20" width="44" height="28" class="fr sr"/><text x="142" y="39" text-anchor="middle">80</text>
<line x1="166" y1="34" x2="218" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="220" y="20" width="44" height="28" class="fb sb"/><text x="242" y="39" text-anchor="middle">120</text>
<line x1="266" y1="34" x2="318" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="320" y="20" width="44" height="28" class="fr sr"/><text x="342" y="39" text-anchor="middle">80</text>
<line x1="366" y1="34" x2="418" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="420" y="20" width="44" height="28" class="fb sb"/><text x="442" y="39" text-anchor="middle">250</text>
<line x1="466" y1="34" x2="502" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="508" y="39" class="tm">None</text>
<text x="142" y="64" text-anchor="middle" class="tm">real head (to delete)</text>
</svg><figcaption>Remove every cancelled ₹80 order. The first 80 is the head, but with a dummy in front it is "the node after dummy", just like the other 80.</figcaption></figure>
<div class="fx" data-lang="py">def remove_all(head, val):
    dummy = Node(0, head)           # fake node in front
    prev = dummy
    while prev.next:
        if prev.next.val == val:
            print(f"  prev={prev.val:&gt;3}: next is {val} -&gt; skip it")
            prev.next = prev.next.next   # skip it; prev stays, maybe the next one is also val
        else:
            print(f"  prev={prev.val:&gt;3}: next is {prev.next.val} -&gt; keep, move on")
            prev = prev.next
    return dummy.next               # the real head, even if it changed

q = build([80, 120, 80, 250])       # the head itself is a cancelled 80
print(show(remove_all(q, 80)))
print(show(remove_all(build([80, 80]), 80)), "|", show(remove_all(build([120, 250]), 80)))</div>
  <div class="fx" data-lang="text">  prev=  0: next is 80 -&gt; skip it
  prev=  0: next is 120 -&gt; keep, move on
  prev=120: next is 80 -&gt; skip it
  prev=120: next is 250 -&gt; keep, move on
120 -&gt; 250 -&gt; None
  prev=  0: next is 80 -&gt; skip it
  prev=  0: next is 80 -&gt; skip it
  prev=  0: next is 120 -&gt; keep, move on
  prev=120: next is 250 -&gt; keep, move on
 -&gt; None | 120 -&gt; 250 -&gt; None</div>
  <table class="tbl out"><caption>Trace on 80 → 120 → 80 → 250, remove 80 (dummy shown as 0)</caption>
    <tr><th>prev</th><th>prev.next</th><th>action</th><th>chain from dummy</th></tr>
    <tr><td>dummy</td><td>80</td><td>skip it (prev stays)</td><td>0 → 120 → 80 → 250</td></tr>
    <tr><td>dummy</td><td>120</td><td>keep, prev = 120</td><td>0 → 120 → 80 → 250</td></tr>
    <tr><td>120</td><td>80</td><td>skip it (prev stays)</td><td>0 → 120 → 250</td></tr>
    <tr><td>120</td><td>250</td><td>keep, prev = 250</td><td>0 → 120 → 250</td></tr>
  </table>
  <p>The removed head needed no special code; neither did "every node removed" (<code>[80, 80]</code> → empty) or "nothing removed".</p>
<div class="fx" data-lang="text">dummy = Node(0, head); prev = dummy
while prev.next:
    if should_remove(prev.next): prev.next = prev.next.next     # prev stays
    else: prev = prev.next
return dummy.next</div>
  <div class="callout def"><span class="label">Definition &amp; complexity</span>
    <p>A <strong>dummy (sentinel) head</strong> is a placeholder node before the first real node so that every real node has a predecessor. Costs one node; the removal loop is <strong>O(n) time, O(1) space</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Advancing <code>prev</code> after a removal. If two 80s are adjacent, moving on would skip checking the second one. After a skip, <code>prev</code> stays and the loop looks at the new <code>prev.next</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Linked Lists: <b>203 Remove Linked List Elements</b> (this trace), <b>82 Remove Duplicates from Sorted List II</b>, <b>86 Partition List</b> (two dummies).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Reverse a List.</b> Insert and delete change one or two pointers. Dispatch wants the queue reversed (latest order first for a report), which means changing <em>every</em> pointer while still being able to reach the rest of the chain.</div>

  <h2 id="dsa-ll-reverse"><span class="num">05</span>Reverse a List</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Flipping a node's <code>next</code> to point backwards cuts it off from the nodes after it. If we flip 120 → None first, how do we still get to 80, 250 and 40?</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>reverse</b> the list", "reverse between positions", "in groups of k", "<b>palindrome</b> list", "reorder", "twin sum".</p>
  </div>
  <p>Walk once with three pointers: <code>prev</code> (the already reversed part), <code>cur</code> (the node being flipped) and <code>nxt</code> (the rest, saved <em>before</em> the flip). Each step: save, flip, slide.</p>
<figure class="viz"><svg viewBox="0 0 560 170" width="560">
<text x="10" y="20" class="tm">step 2: cur = 80</text>
<text x="92" y="48" text-anchor="middle" class="tb">prev</text><text x="192" y="48" text-anchor="middle" class="tb">cur</text><text x="292" y="48" text-anchor="middle" class="tb">nxt</text>
<text x="20" y="79" class="tm">None</text><line x1="68" y1="74" x2="52" y2="74" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="70" y="60" width="44" height="28" class="fg sg"/><text x="92" y="79" text-anchor="middle">120</text>
<path d="M170,74 Q140,74 116,74" fill="none" class="sg" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="60" width="44" height="28" class="fv"/><text x="192" y="79" text-anchor="middle">80</text>
<line x1="216" y1="74" x2="268" y2="74" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="60" width="44" height="28" class="fb sb"/><text x="292" y="79" text-anchor="middle">250</text>
<line x1="316" y1="74" x2="368" y2="74" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="370" y="60" width="44" height="28" class="fb sb"/><text x="392" y="79" text-anchor="middle">40</text>
<line x1="416" y1="74" x2="452" y2="74" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="458" y="79" class="tm">None</text>
<text x="10" y="120" class="tm">1. nxt = cur.next    (save 250; the dashed arrow is about to be cut)</text>
<text x="10" y="138" class="tm">2. cur.next = prev   (80 now points back to 120: the green arrow)</text>
<text x="10" y="156" class="tm">3. prev = cur; cur = nxt   (slide all three one step right)</text>
</svg><figcaption>Green = already reversed. Violet = being flipped. Saving nxt first is what keeps 250 and 40 reachable.</figcaption></figure>
<div class="fx" data-lang="py">def reverse(head):
    prev, cur = None, head
    step = 0
    while cur:
        nxt = cur.next              # 1. save the rest
        cur.next = prev             # 2. flip this arrow
        step += 1
        print(f"step {step}: flipped {cur.val} -&gt; {prev.val if prev else None};"
              f" prev={cur.val}, cur={nxt.val if nxt else None}")
        prev, cur = cur, nxt        # 3. move both forward
    return prev                     # prev is the new head

q = build([120, 80, 250, 40])
print(show(reverse(q)))</div>
  <div class="fx" data-lang="text">step 1: flipped 120 -&gt; None; prev=120, cur=80
step 2: flipped 80 -&gt; 120; prev=80, cur=250
step 3: flipped 250 -&gt; 80; prev=250, cur=40
step 4: flipped 40 -&gt; 250; prev=40, cur=None
40 -&gt; 250 -&gt; 80 -&gt; 120 -&gt; None</div>
  <table class="tbl out"><caption>Pointer table on 120 → 80 → 250 → 40</caption>
    <tr><th>step</th><th>prev (before)</th><th>cur</th><th>nxt saved</th><th>flip</th><th>reversed part afterwards</th><th>prev, cur after</th></tr>
    <tr><td>start</td><td>None</td><td>120</td><td>—</td><td>—</td><td>(empty)</td><td>None, 120</td></tr>
    <tr><td>1</td><td>None</td><td>120</td><td>80</td><td>120.next = None</td><td>120</td><td>120, 80</td></tr>
    <tr><td>2</td><td>120</td><td>80</td><td>250</td><td>80.next = 120</td><td>80 → 120</td><td>80, 250</td></tr>
    <tr><td>3</td><td>80</td><td>250</td><td>40</td><td>250.next = 80</td><td>250 → 80 → 120</td><td>250, 40</td></tr>
    <tr><td>4</td><td>250</td><td>40</td><td>None</td><td>40.next = 250</td><td>40 → 250 → 80 → 120</td><td>40, None → stop</td></tr>
  </table>
<div class="fx" data-lang="text">prev, cur = None, head
while cur:
    nxt = cur.next; cur.next = prev; prev, cur = cur, nxt
return prev                         # the new head</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p><strong>O(n) time, O(1) extra space</strong>, no new nodes. The recursive version is O(n) space (one frame per node) and hits Python's recursion limit near 1000 nodes (Complexity note, call stack).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Returning <code>head</code> after the loop. <code>head</code> still points at 120, which is now the <em>tail</em>; returning it gives the one-node list 120 → None. The new head is <code>prev</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Linked Lists: <b>206 Reverse Linked List</b>, <b>92 Reverse Linked List II</b> (reverse a section, dummy head helps), <b>234 Palindrome Linked List</b> (middle + reverse second half: needs the next section too).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Fast &amp; Slow Pointers.</b> Palindrome checks, "middle of the queue" and "k from the end" all need a <em>position</em>, and a linked list doesn't know its length. A buggy list may not even have an end. Can two pointers moving at different speeds answer these in one pass?</div>

  <h2 id="dsa-ll-fastslow"><span class="num">06</span>Fast &amp; Slow Pointers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To find the middle we could count the nodes and walk again (two passes). And if a bug made the last order point back into the queue, a walk would never end, so we couldn't even count. How do we find the middle in one pass, and detect a loop without storing every node?</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>middle</b> node", "<b>cycle</b> / loop", "where does the cycle begin", "<b>nth from the end</b>", "one pass", "O(1) extra space", "intersection of two lists", "happy number".</p>
  </div>
  <h3>The middle</h3>
  <p><code>slow</code> moves one node per step, <code>fast</code> moves two. When fast reaches the end, slow has covered half the distance: the middle.</p>
<figure class="viz"><svg viewBox="0 0 560 120" width="560">
<g>
<rect x="20" y="40" width="44" height="28" class="fb sb"/><text x="42" y="59" text-anchor="middle">120</text>
<line x1="66" y1="54" x2="118" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="120" y="40" width="44" height="28" class="fb sb"/><text x="142" y="59" text-anchor="middle">80</text>
<line x1="166" y1="54" x2="218" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="220" y="40" width="44" height="28" class="fg sg"/><text x="242" y="59" text-anchor="middle">250</text>
<line x1="266" y1="54" x2="318" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="320" y="40" width="44" height="28" class="fb sb"/><text x="342" y="59" text-anchor="middle">40</text>
<line x1="366" y1="54" x2="418" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="420" y="40" width="44" height="28" class="fv"/><text x="442" y="59" text-anchor="middle">310</text>
<line x1="466" y1="54" x2="502" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="508" y="59" class="tm">None</text>
</g>
<text x="42" y="24" text-anchor="middle" class="tm">s f</text><text x="142" y="24" text-anchor="middle" class="tm">s</text><text x="242" y="24" text-anchor="middle" class="tg">s</text><text x="242" y="86" text-anchor="middle" class="tm">f</text><text x="442" y="86" text-anchor="middle" class="tm">f</text>
<text x="20" y="110" class="tm">step 0: both at 120 · step 1: slow 80, fast 250 · step 2: slow 250, fast 310 → fast.next is None, stop. slow = middle.</text>
</svg><figcaption>Fast covers twice the distance. When fast reaches the end, slow has covered half: the middle of the 5-order queue is 250.</figcaption></figure>
<div class="fx" data-lang="py">def middle(head):
    slow = fast = head
    while fast and fast.next:        # both checks, or fast.next.next crashes
        slow = slow.next
        fast = fast.next.next
        print(f"  slow={slow.val:&gt;3}  fast={fast.val if fast else None}")
    return slow

for vals in [[120, 80, 250, 40, 310], [120, 80, 250, 40, 310, 80]]:
    print(vals)
    print("middle =", middle(build(vals)).val)</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310]
  slow= 80  fast=250
  slow=250  fast=310
middle = 250
[120, 80, 250, 40, 310, 80]
  slow= 80  fast=250
  slow=250  fast=310
  slow= 40  fast=None
middle = 40</div>
  <p>Five orders → 250. Six orders (an 80 added at the end) → fast falls off after 3 steps and slow is at 40, the <em>second</em> of the two middles (250, 40). To get the first middle, start <code>fast</code> at <code>head.next</code>.</p>
  <h3>Cycles: Floyd's tortoise and hare</h3>
  <p>A <strong>cycle</strong> means some node's <code>next</code> points back to an earlier node, so walking never reaches <code>None</code>. Put fast and slow on it: once both are inside the loop, fast gains exactly one node on slow per step, so the gap shrinks to 0 and they land on the same node. Without a cycle, fast simply reaches <code>None</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two runners on a circular school ground, one twice as fast. The fast one always catches up from behind. On a straight road the fast one just reaches the end first and they never meet.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 560 150" width="560">
<rect x="20" y="60" width="60" height="30" class="fb sb"/><text x="50" y="80" text-anchor="middle">120</text>
<line x1="82" y1="75" x2="123" y2="75" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="125" y="60" width="60" height="30" class="fg sg"/><text x="155" y="80" text-anchor="middle">80</text>
<line x1="187" y1="75" x2="228" y2="75" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="230" y="60" width="60" height="30" class="fb sb"/><text x="260" y="80" text-anchor="middle">250</text>
<line x1="292" y1="75" x2="333" y2="75" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="335" y="60" width="60" height="30" class="fb sb"/><text x="365" y="80" text-anchor="middle">40</text>
<line x1="397" y1="75" x2="438" y2="75" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="440" y="60" width="60" height="30" class="fv"/><text x="470" y="80" text-anchor="middle">310</text>
<path d="M470,92 C440,140 170,140 155,94" fill="none" class="sr" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<text x="310" y="142" text-anchor="middle" class="tr" font-size="11">bug: 310.next = 80 instead of None</text>
<text x="280" y="30" text-anchor="middle" class="tm" font-size="11">slow: 80, 250, 40, 310 · fast: 250, 310, 250, 310 → both on 310 after 4 steps</text>
<text x="150" y="52" text-anchor="middle" class="tg" font-size="10">loop starts here</text>
</svg><figcaption>The queue with a broken last pointer: a plain walk would print 80, 250, 40, 310 forever. Fast and slow pointers enter the loop and must meet (here on 310).</figcaption></figure>
<div class="fx" data-lang="py">def has_cycle(head):
    slow = fast = head
    step = 0
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        step += 1
        print(f"step {step}: slow={slow.val:&gt;3} fast={fast.val:&gt;3}  same node? {slow is fast}")
        if slow is fast:
            return True
    return False

q = build([120, 80, 250, 40, 310])
tail = q.next.next.next.next         # 310
tail.next = q.next                   # BUG: 310 points back to 80 -&gt; a loop
print(show(q, limit=9))
print(has_cycle(q), has_cycle(build([120, 80, 250])))</div>
  <div class="fx" data-lang="text">120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; ...
step 1: slow= 80 fast=250  same node? False
step 2: slow=250 fast=310  same node? False
step 3: slow= 40 fast=250  same node? False
step 4: slow=310 fast=310  same node? True
step 1: slow= 80 fast=250  same node? False
True False</div>
  <table class="tbl out"><caption>Floyd trace: 120 → 80 → 250 → 40 → 310 → (back to 80)</caption>
    <tr><th>step</th><th>slow</th><th>fast</th><th>same node?</th></tr>
    <tr><td>0</td><td>120</td><td>120</td><td>start</td></tr>
    <tr><td>1</td><td>80</td><td>250</td><td>no</td></tr>
    <tr><td>2</td><td>250</td><td>310</td><td>no</td></tr>
    <tr><td>3</td><td>40</td><td>250 (310 → 80 → 250)</td><td>no</td></tr>
    <tr><td>4</td><td>310</td><td>310 (250 → 40 → 310)</td><td><b>yes → cycle</b></td></tr>
  </table>
  <p>The second call (a healthy 3-order queue) stops after one step because fast reaches the end. To find <em>where</em> the loop starts (LeetCode 142): after they meet, start one pointer at the head and move both one step at a time; they meet at the loop's first node.</p>
<div class="fx" data-lang="py">def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:             # phase 1: they meet inside the loop
            p = head                 # phase 2: one from the head, one from the meeting point
            while p is not slow:
                p, slow = p.next, slow.next
            return p                 # they meet where the loop starts
    return None

q = build([120, 80, 250, 40, 310])
q.next.next.next.next.next = q.next  # 310 -&gt; 80 again
print("loop starts at", cycle_start(q).val)</div>
  <div class="fx" data-lang="text">loop starts at 80</div>
  <p>From the meeting point 310, one step reaches 80; from the head, one step reaches 80. Why it works: if the loop starts L steps from the head, the meeting point is also L steps (around the loop) before the start, so both walks arrive together.</p>
  <h3>Gap of n: the nth node from the end</h3>
  <p>Move a <code>lead</code> pointer n + 1 steps ahead of <code>trail</code> (both starting at a dummy), then move both until lead falls off: trail is just before the node to remove. Solved in section 11 (LeetCode 19).</p>
<div class="fx" data-lang="text">slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast: ...            # cycle (compare nodes with \`is\`, not values)
# loop ended normally: slow is the (second) middle</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p>Middle, cycle detection, cycle start, nth from end: <strong>O(n) time, O(1) space</strong>. The obvious alternative for cycles, a set of visited nodes, is O(n) space.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>while fast.next</code> without <code>fast and</code>: on an even-length list fast becomes <code>None</code> and <code>None.next</code> raises AttributeError. And compare nodes with <code>is</code>: our queue has two different nodes with value 80.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Linked Lists: <b>876 Middle of the Linked List</b>, <b>141 Linked List Cycle</b>, <b>142 Linked List Cycle II</b> (the start), <b>19 Remove Nth Node From End</b>. Then 287 Find the Duplicate Number (Floyd on an array).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Merge Two Sorted Lists.</b> So far we changed one list. Dispatch now has two queues, lunch and dinner, each sorted by amount, and wants one sorted queue without copying orders into new nodes.</div>

  <h2 id="dsa-ll-merge"><span class="num">07</span>Merge Two Sorted Lists</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Collecting both shifts into a Python list and sorting costs O((n + m) log(n + m)) and builds new storage, even though each shift is already sorted. Can we use that order and just re-link the existing nodes?</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>merge</b> two sorted lists", "combine sorted", "merge k sorted", "sort a linked list" (merge sort), "interleave / reorder".</p>
  </div>
  <p>Like merging two sorted stacks of bills: look at the top of each, take the smaller, repeat. A <code>tail</code> pointer always marks the last node of the merged list; a dummy head avoids "which list gives the first node?". When one list runs out, attach the rest of the other in one step.</p>
<div class="fx" data-lang="py">def merge_two(l1, l2):
    dummy = tail = Node(0)
    while l1 and l2:
        if l1.val &lt;= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
        done, cur = [], dummy.next
        while cur is not tail.next:                 # print only the merged part
            done.append(cur.val); cur = cur.next
        print(f"  took {tail.val:&gt;3}   merged so far: {done}")
    tail.next = l1 or l2            # whichever list still has nodes
    return dummy.next

lunch = build([40, 80, 120, 250])     # lunch shift, sorted
dinner = build([60, 80, 200, 310])    # dinner shift, sorted
print(show(merge_two(lunch, dinner)))</div>
  <div class="fx" data-lang="text">  took  40   merged so far: [40]
  took  60   merged so far: [40, 60]
  took  80   merged so far: [40, 60, 80]
  took  80   merged so far: [40, 60, 80, 80]
  took 120   merged so far: [40, 60, 80, 80, 120]
  took 200   merged so far: [40, 60, 80, 80, 120, 200]
  took 250   merged so far: [40, 60, 80, 80, 120, 200, 250]
40 -&gt; 60 -&gt; 80 -&gt; 80 -&gt; 120 -&gt; 200 -&gt; 250 -&gt; 310 -&gt; None</div>
  <table class="tbl out"><caption>Trace: lunch 40 → 80 → 120 → 250, dinner 60 → 80 → 200 → 310</caption>
    <tr><th>lunch head</th><th>dinner head</th><th>take</th><th>merged so far</th></tr>
    <tr><td>40</td><td>60</td><td>40 (lunch)</td><td>40</td></tr>
    <tr><td>80</td><td>60</td><td>60 (dinner)</td><td>40, 60</td></tr>
    <tr><td>80</td><td>80</td><td>80 (lunch; ties → lunch)</td><td>40, 60, 80</td></tr>
    <tr><td>120</td><td>80</td><td>80 (dinner)</td><td>40, 60, 80, 80</td></tr>
    <tr><td>120</td><td>200</td><td>120</td><td>… 120</td></tr>
    <tr><td>250</td><td>200</td><td>200</td><td>… 200</td></tr>
    <tr><td>250</td><td>310</td><td>250</td><td>… 250</td></tr>
    <tr><td>None</td><td>310</td><td>attach the rest (310)</td><td>40 → 60 → 80 → 80 → 120 → 200 → 250 → 310</td></tr>
  </table>
  <p>The result is exactly the day's charges in sorted order, the list the Arrays note sorted for two pointers, produced here with zero new nodes.</p>
<div class="fx" data-lang="text">dummy = tail = Node(0)
while l1 and l2:
    if l1.val &lt;= l2.val: tail.next, l1 = l1, l1.next
    else:               tail.next, l2 = l2, l2.next
    tail = tail.next
tail.next = l1 or l2
return dummy.next</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p><strong>O(n + m) time, O(1) extra space</strong> (only the dummy). Merge k lists with a heap: O(N log k) (<a class="xref" data-note="dsa_heaps">Heaps</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>tail.next = l1 or l2</code>: the leftover 310 would be dropped. And using <code>&lt;</code> instead of <code>&lt;=</code> is not wrong but makes the merge unstable (equal values from the second list first).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Linked Lists: <b>21 Merge Two Sorted Lists</b>, <b>1669 Merge In Between Linked Lists</b>, <b>143 Reorder List</b> (middle + reverse + merge: three sections in one problem).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Doubly Linked Lists.</b> Everything so far walks forward only, and removing a node needs the node <em>before</em> it. When a customer cancels and we hold only their node, a singly list must walk from the head to find its predecessor: O(n).</div>

  <h2 id="dsa-ll-types"><span class="num">08</span>Doubly Linked Lists</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With only <code>next</code>, a node cannot reach the node before it. Cancelling an order we hold (and reading the queue newest-first) needs a way back.</p>
  </div>
  <p>A <strong>doubly linked</strong> list gives each node two references, <code>next</code> and <code>prev</code>. You can walk both ways, and delete a node when you hold only that node: <code>node.prev.next = node.next; node.next.prev = node.prev</code>. Two <strong>sentinel</strong> nodes (HEAD and TAIL dummies) at the ends mean every real node always has both neighbours, so insert and remove never need special cases.</p>
<figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="10" y="22" class="tm">singly</text>
<g>
<rect x="80" y="10" width="50" height="28" class="fb sb"/><text x="105" y="29" text-anchor="middle">A</text>
<line x1="132" y1="24" x2="178" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="180" y="10" width="50" height="28" class="fb sb"/><text x="205" y="29" text-anchor="middle">B</text>
<line x1="232" y1="24" x2="278" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="280" y="10" width="50" height="28" class="fb sb"/><text x="305" y="29" text-anchor="middle">C</text>
<line x1="332" y1="24" x2="368" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="375" y="29" class="tm">None</text>
</g>
<text x="10" y="92" class="tm">doubly</text>
<g>
<text x="40" y="84" class="tm">None</text><line x1="130" y1="78" x2="82" y2="78" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="80" y="70" width="50" height="28" class="ft st"/><text x="105" y="89" text-anchor="middle">A</text>
<line x1="132" y1="78" x2="178" y2="78" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<line x1="178" y1="90" x2="132" y2="90" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="180" y="70" width="50" height="28" class="ft st"/><text x="205" y="89" text-anchor="middle">B</text>
<line x1="232" y1="78" x2="278" y2="78" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<line x1="278" y1="90" x2="232" y2="90" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="280" y="70" width="50" height="28" class="ft st"/><text x="305" y="89" text-anchor="middle">C</text>
<line x1="332" y1="78" x2="368" y2="78" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="375" y="84" class="tm">None</text>
<text x="155" y="68" text-anchor="middle" class="tm">next</text><text x="155" y="112" text-anchor="middle" class="tm">prev</text>
</g>
<text x="10" y="140" class="tm">Doubly: hold B alone and you can still unhook it (B.prev.next = B.next; B.next.prev = B.prev).</text>
</svg><figcaption>Singly = forward arrows only. Doubly = arrows both ways, so any node can reach its neighbours.</figcaption></figure>
<div class="fx" data-lang="py">class DNode:
    def __init__(self, val=None):
        self.val, self.prev, self.next = val, None, None

class Deque:                               # doubly linked, two sentinels
    def __init__(self):
        self.head, self.tail = DNode("HEAD"), DNode("TAIL")
        self.head.next, self.tail.prev = self.tail, self.head

    def _insert_between(self, node, a, b):  # a &lt;-&gt; node &lt;-&gt; b
        node.prev, node.next = a, b
        a.next = node
        b.prev = node
        return node

    def push_back(self, val):  return self._insert_between(DNode(val), self.tail.prev, self.tail)
    def push_front(self, val): return self._insert_between(DNode(val), self.head, self.head.next)

    def remove(self, node):                # O(1): the node knows both neighbours
        node.prev.next = node.next
        node.next.prev = node.prev

    def forward(self):
        out, cur = [], self.head.next
        while cur is not self.tail:
            out.append(cur.val); cur = cur.next
        return out

    def backward(self):
        out, cur = [], self.tail.prev
        while cur is not self.head:
            out.append(cur.val); cur = cur.prev
        return out

q = Deque()
nodes = {v: q.push_back(v) for v in [120, 80, 250, 40]}
q.push_front(999)                          # VIP order
q.remove(nodes[250])                       # cancel 250, holding only its node
print(q.forward(), q.backward())</div>
  <div class="fx" data-lang="text">[999, 120, 80, 40] [40, 80, 120, 999]</div>
  <p>The VIP order went to the front; 250 was removed holding only its node (no walk); the backward read needed no reversing.</p>
  <table class="tbl">
    <tr><th></th><th>Singly linked</th><th>Doubly linked</th></tr>
    <tr><td>Pointers per node</td><td>1 (<code>next</code>)</td><td>2 (<code>prev</code>, <code>next</code>)</td></tr>
    <tr><td>Delete a node you hold</td><td>O(n) — find the node before it</td><td>O(1)</td></tr>
    <tr><td>Walk backwards</td><td>No</td><td>Yes</td></tr>
    <tr><td>Memory</td><td>Less</td><td>More</td></tr>
    <tr><td>Used by</td><td>Most interview questions, stacks</td><td>Queues, LRU cache, browser history, <code>collections.deque</code></td></tr>
  </table>
  <p>In real Python work you rarely write your own. <code>collections.deque</code> is a doubly linked chain of small blocks: O(1) add and remove at both ends.</p>
<div class="fx" data-lang="py">import timeit
from collections import deque
d = deque([120, 80, 250])
d.appendleft(999); d.append(40)
print(d)
print("popleft:", d.popleft(), "| pop:", d.pop(), "| left:", d)
front = timeit.timeit(lambda: (d.appendleft(0), d.popleft()), number=100_000)
print(f"100k appendleft+popleft on deque: {front*1000:.1f} ms")</div>
  <div class="fx" data-lang="text">deque([999, 120, 80, 250, 40])
popleft: 999 | pop: 40 | left: deque([120, 80, 250])
100k appendleft+popleft on deque: 4.8 ms</div>
  <div class="callout def"><span class="label">Definition &amp; complexity</span>
    <p><strong>Doubly linked list</strong>: nodes with <code>prev</code> and <code>next</code>. Insert/remove at either end or at a held node: <strong>O(1)</strong>; search or index: O(n); space O(n) with two pointers per node.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Updating only one direction. Every insert or remove changes four references (two <code>next</code>, two <code>prev</code>); forgetting one leaves the list correct forwards and broken backwards. And <code>deque[i]</code> in the middle is O(n): deque is for the ends.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>707 Design Linked List</b> (try it doubly with sentinels), <b>430 Flatten a Multilevel Doubly Linked List</b>, <b>641 Design Circular Deque</b> (Stacks &amp; Queues).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: LRU Cache.</b> A doubly list keeps order and moves any held node in O(1), but finding "the node for order 102" is still an O(n) walk. A dict finds it in O(1) but has no order. The last section joins them.</div>

  <h2 id="dsa-ll-lru"><span class="num">09</span>LRU Cache</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Biteful app keeps the details of the 2 most recently viewed orders in memory. Viewing an order must be O(1), and when a third order is viewed the one untouched longest must be thrown out, also in O(1). A dict alone can't say which is oldest; a list alone can't find an order quickly.</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>LRU</b>", "least recently used", "cache with capacity", "<b>O(1) get and put</b>", "evict", "most recently used", "LFU".</p>
  </div>
  <p>Use both. The <strong>dict</strong> maps key → node, so any order is found in O(1). The <strong>doubly linked list</strong> keeps recency: most recent right after the head dummy, least recent right before the tail dummy. A get or put moves the node to the front (unlink + add front, both O(1) because the node knows its neighbours); when over capacity, evict <code>tail.prev</code> and delete its key from the dict (the node stores its key for exactly this).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A small desk with room for two files. Every time you use a file, you put it on top. When a third file arrives, the one at the bottom (untouched longest) goes back to the cabinet. The stack on the desk is the linked list; a sticky-note index saying where each file sits is the dict.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 560 130" width="560">
<text x="10" y="22" class="tm">dict: key → node</text>
<rect x="10" y="30" width="110" height="24" class="fv"/><text x="65" y="46" text-anchor="middle">103 → node 103</text>
<rect x="10" y="58" width="110" height="24" class="fv"/><text x="65" y="74" text-anchor="middle">101 → node 101</text>
<text x="180" y="22" class="tm">doubly linked list: most recent at the front</text>
<rect x="180" y="34" width="50" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="205" y="53" text-anchor="middle" class="tm">head</text>
<line x1="232" y1="48" x2="268" y2="48" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="34" width="50" height="28" class="fg sg"/><text x="295" y="53" text-anchor="middle">103</text>
<line x1="322" y1="48" x2="358" y2="48" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><line x1="358" y1="58" x2="322" y2="58" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="360" y="34" width="50" height="28" class="fb sb"/><text x="385" y="53" text-anchor="middle">101</text>
<line x1="412" y1="48" x2="448" y2="48" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="450" y="34" width="50" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="475" y="53" text-anchor="middle" class="tm">tail</text>
<path d="M120,42 Q200,80 270,64" fill="none" class="sg" stroke-dasharray="3 3"/>
<text x="295" y="88" text-anchor="middle" class="tg">most recent</text><text x="385" y="88" text-anchor="middle" class="tm">evict from here</text>
<text x="10" y="118" class="tm">get(101): dict finds node 101 in O(1); unlink it and re-insert after head in O(1).</text>
</svg><figcaption>The cache after put(103, 250): 103 is most recent, 101 is next to be evicted. Two dummy nodes (head, tail) mean every real node always has a prev and a next, so unlink/insert never need special cases.</figcaption></figure>
<div class="fx" data-lang="py">class DNode:
    def __init__(self, key=None, val=None):
        self.key, self.val, self.prev, self.next = key, val, None, None

class LRUCache:
    def __init__(self, capacity):
        self.cap, self.map = capacity, {}
        self.head, self.tail = DNode(), DNode()          # dummies
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map: return -1
        node = self.map[key]
        self._unlink(node); self._add_front(node)       # mark as most recent
        return node.val

    def put(self, key, val):
        if key in self.map:
            self._unlink(self.map[key])
        node = DNode(key, val)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) &gt; self.cap:
            old = self.tail.prev                        # least recently used
            self._unlink(old); del self.map[old.key]

    def order(self):                                    # most recent first
        out, cur = [], self.head.next
        while cur is not self.tail:
            out.append(cur.key); cur = cur.next
        return out

cache = LRUCache(2)                 # Biteful app: keep the 2 most recently viewed orders
ops = [("put", 101, 120), ("put", 102, 80), ("get", 101), ("put", 103, 250), ("get", 102)]
for op in ops:
    result = cache.put(op[1], op[2]) if op[0] == "put" else cache.get(op[1])
    call = f"{op[0]}({', '.join(map(str, op[1:]))})"
    shown = "" if result is None else f"-&gt; {result}"
    print(f"{call:15} {shown:7} list (recent first) = {cache.order()}  dict keys = {sorted(cache.map)}")</div>
  <div class="fx" data-lang="text">put(101, 120)           list (recent first) = [101]  dict keys = [101]
put(102, 80)            list (recent first) = [102, 101]  dict keys = [101, 102]
get(101)        -&gt; 120  list (recent first) = [101, 102]  dict keys = [101, 102]
put(103, 250)           list (recent first) = [103, 101]  dict keys = [101, 103]
get(102)        -&gt; -1   list (recent first) = [103, 101]  dict keys = [101, 103]</div>
  <table class="tbl out"><caption>LRU trace, capacity 2 (keys = order ids, values = charges)</caption>
    <tr><th>#</th><th>operation</th><th>dict finds?</th><th>list moves</th><th>evicted</th><th>result</th><th>list after (recent first)</th></tr>
    <tr><td>1</td><td>put(101, 120)</td><td>new</td><td>add 101 at front</td><td>—</td><td>—</td><td>[101]</td></tr>
    <tr><td>2</td><td>put(102, 80)</td><td>new</td><td>add 102 at front</td><td>—</td><td>—</td><td>[102, 101]</td></tr>
    <tr><td>3</td><td>get(101)</td><td>yes, O(1)</td><td>unlink 101, add at front</td><td>—</td><td>120</td><td>[101, 102]</td></tr>
    <tr><td>4</td><td>put(103, 250)</td><td>new</td><td>add 103 at front; size 3 &gt; 2</td><td><b>102</b> (tail.prev)</td><td>—</td><td>[103, 101]</td></tr>
    <tr><td>5</td><td>get(102)</td><td>no</td><td>—</td><td>—</td><td>−1</td><td>[103, 101]</td></tr>
  </table>
  <p>Step 3 is the whole point: reading 101 made it recent, so when 103 arrived, 102 (not 101) was the least recently used and was evicted. In production Python, <code>collections.OrderedDict</code> (a dict with a doubly linked list inside) or <code>functools.lru_cache</code> do this for you:</p>
<div class="fx" data-lang="py">from collections import OrderedDict
class LRU:
    def __init__(self, cap):
        self.cap, self.d = cap, OrderedDict()
    def get(self, k):
        if k not in self.d: return -1
        self.d.move_to_end(k)              # most recent goes to the end
        return self.d[k]
    def put(self, k, v):
        self.d[k] = v
        self.d.move_to_end(k)
        if len(self.d) &gt; self.cap:
            self.d.popitem(last=False)     # evict the oldest (front)

c = LRU(2)
c.put(101, 120); c.put(102, 80)
print(c.get(101)); c.put(103, 250); print(c.get(102), list(c.d))</div>
  <div class="fx" data-lang="text">120
-1 [101, 103]</div>
<div class="fx" data-lang="text">get(key):  node = map.get(key) or return -1;  unlink(node); add_front(node);  return node.val
put(key):  if key in map: unlink(map[key])
           node = Node(key, val); map[key] = node; add_front(node)
           if len(map) &gt; cap: old = tail.prev; unlink(old); del map[old.key]</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p><strong>get and put O(1)</strong> (dict lookup + a constant number of pointer changes); space O(capacity). Without the list, eviction needs an O(n) scan for the oldest; without the dict, get needs an O(n) walk.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to store the key in the node. On eviction you hold <code>tail.prev</code> and must delete its dict entry; without <code>node.key</code> you can't. Also: a <code>put</code> on an existing key must update and move it, not add a second node.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>146 LRU Cache</b> (Advanced; exactly this class), <b>380 Insert Delete GetRandom O(1)</b> (another dict + structure combo, Hashing), <b>707 Design Linked List</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing the Pattern.</b> We have six techniques. Faced with a new linked-list question, which one, and what does each template look like side by side?</div>

  <h2 id="dsa-ll-patterns"><span class="num">10</span>Choosing the Pattern</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each technique arrived with a question shaped for it. New problems won't name the technique; we need a lookup from the wording to the pattern.</p>
  </div>
  <table class="tbl">
    <tr><th>Pattern</th><th>Signal words</th><th>Template</th><th>Section</th></tr>
    <tr><td><strong>1. Walk with prev (+ dummy)</strong></td><td>"remove", "delete", "insert", "partition", "head may change"</td><td><code>dummy → prev loop → return dummy.next</code></td><td>03, 04</td></tr>
    <tr><td><strong>2. In-place reverse</strong></td><td>"reverse", "palindrome list", "reorder", "k-group"</td><td><code>prev, cur, nxt</code> loop</td><td>05</td></tr>
    <tr><td><strong>3. Fast &amp; slow</strong></td><td>"middle", "cycle", "loop", "one pass", "O(1) space"</td><td><code>while fast and fast.next</code></td><td>06</td></tr>
    <tr><td><strong>4. Gap of n</strong></td><td>"nth from the end", "k-th last"</td><td>lead moves n + 1 first; then both move</td><td>06, 11</td></tr>
    <tr><td><strong>5. Merge with dummy + tail</strong></td><td>"merge sorted", "combine", "sort list"</td><td>take the smaller head, attach the rest</td><td>07</td></tr>
    <tr><td><strong>6. Hash map + doubly list</strong></td><td>"O(1) get and put", "cache", "most recently used"</td><td>dict → node; list keeps order</td><td>08, 09</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every linked-list technique is about <strong>which pointers you hold</strong>: the node before (dummy/prev), the rest of the chain (nxt), a second pointer at another speed or distance (fast/slow, lead/trail), or a direct handle from a dict. Choose the pointers first, then write the loop.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Converting to a Python list "to make it easy". It works and is O(n), but uses O(n) extra space and creates new nodes; most linked-list questions are asked precisely to see the in-place pointer version.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> The five most-asked linked-list problems, with their LeetCode examples, edge cases (empty list, one node, removing the head) and tests.</div>

  <h2 id="dsa-ll-problems"><span class="num">11</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We traced each technique on Biteful's queue. The interview versions come with their own examples and corner cases, which is where pointer code usually breaks.</p>
  </div>
  <h3>Reverse Linked List (LeetCode 206)</h3>
  <p><strong>Problem.</strong> Reverse a singly linked list and return the new head. <strong>Brute force.</strong> Copy values into a Python list, reverse, rebuild: O(n) but O(n) extra space and new nodes. <strong>Better.</strong> The three-pointer loop of section 05.</p>
<div class="fx" data-lang="py">def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev

for vals in [[1, 2, 3, 4, 5], [1, 2], [1], []]:
    print(vals, "-&gt;", show(reverse_list(build(vals))))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5] -&gt; 5 -&gt; 4 -&gt; 3 -&gt; 2 -&gt; 1 -&gt; None
[1, 2] -&gt; 2 -&gt; 1 -&gt; None
[1] -&gt; 1 -&gt; None
[] -&gt;  -&gt; None</div>
  <p><strong>Complexity.</strong> O(n) time, O(1) space.</p>

  <h3>Merge Two Sorted Lists (LeetCode 21)</h3>
  <p><strong>Problem.</strong> Merge two sorted lists by re-linking nodes. <strong>Brute force.</strong> Collect, sort, rebuild: O((n+m) log(n+m)). <strong>Better.</strong> Section 07.</p>
<div class="fx" data-lang="py">def merge_two(l1, l2):
    dummy = tail = Node(0)
    while l1 and l2:
        if l1.val &lt;= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
    tail.next = l1 or l2            # whichever list still has nodes
    return dummy.next

tests = [([1, 2, 4], [1, 3, 4]), ([], []), ([], [0]), ([5], [1, 2, 3]), ([1, 1], [1])]
for a, b in tests:
    print(a, b, "-&gt;", show(merge_two(build(a), build(b))))</div>
  <div class="fx" data-lang="text">[1, 2, 4] [1, 3, 4] -&gt; 1 -&gt; 1 -&gt; 2 -&gt; 3 -&gt; 4 -&gt; 4 -&gt; None
[] [] -&gt;  -&gt; None
[] [0] -&gt; 0 -&gt; None
[5] [1, 2, 3] -&gt; 1 -&gt; 2 -&gt; 3 -&gt; 5 -&gt; None
[1, 1] [1] -&gt; 1 -&gt; 1 -&gt; 1 -&gt; None</div>
  <p><strong>Complexity.</strong> O(n + m) time, O(1) extra space.</p>

  <h3>Linked List Cycle (LeetCode 141)</h3>
  <p><strong>Problem.</strong> Return True if the list has a cycle. <strong>Brute force.</strong> A set of visited nodes: O(n) space. <strong>Better.</strong> Floyd (section 06). Compare with <code>is</code>.</p>
<div class="fx" data-lang="py">def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

def has_cycle_set(head):              # the O(n)-space version
    seen, cur = set(), head
    while cur:
        if cur in seen: return True
        seen.add(cur); cur = cur.next
    return False

def build_cycle(values, pos):         # tail points back to index pos (-1 = no cycle)
    head = build(values)
    if pos &lt; 0: return head
    nodes, cur = [], head
    while cur: nodes.append(cur); cur = cur.next
    nodes[-1].next = nodes[pos]
    return head

for vals, pos in [([1, 2, 3, 4], 1), ([1, 2], 0), ([1], -1), ([1, 2, 3], -1), ([], -1), ([1], 0)]:
    h = build_cycle(vals, pos)
    print(vals, "tail -&gt;", pos, ":", has_cycle(h), has_cycle_set(h))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4] tail -&gt; 1 : True True
[1, 2] tail -&gt; 0 : True True
[1] tail -&gt; -1 : False False
[1, 2, 3] tail -&gt; -1 : False False
[] tail -&gt; -1 : False False
[1] tail -&gt; 0 : True True</div>
  <p><strong>Complexity.</strong> O(n) time, O(1) space; the set version is shown alongside as a checker.</p>

  <h3>Middle of the Linked List (LeetCode 876)</h3>
  <p><strong>Problem.</strong> Return the middle node (second middle for even length). <strong>Brute force.</strong> Count, then walk n // 2: two passes. <strong>Better.</strong> Fast and slow in one pass.</p>
<div class="fx" data-lang="py">def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow

for vals in [[1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6], [1], [1, 2]]:
    print(vals, "-&gt;", show(middle_node(build(vals))))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5] -&gt; 3 -&gt; 4 -&gt; 5 -&gt; None
[1, 2, 3, 4, 5, 6] -&gt; 4 -&gt; 5 -&gt; 6 -&gt; None
[1] -&gt; 1 -&gt; None
[1, 2] -&gt; 2 -&gt; None</div>
  <p><strong>Complexity.</strong> O(n) time, O(1) space.</p>

  <h3>Remove Nth Node From End of List (LeetCode 19)</h3>
  <p><strong>Problem.</strong> Remove the n-th node from the end; for <code>1→2→3→4→5</code> and n = 2, remove 4. <strong>Brute force.</strong> Count the length, walk again: two passes. <strong>Better.</strong> Gap of n + 1 between <code>lead</code> and <code>trail</code>, both starting at a dummy.</p>
<figure class="viz"><svg viewBox="0 0 560 110" width="560">
<rect x="10" y="30" width="50" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="35" y="49" text-anchor="middle" class="tm">dummy</text>
<line x1="62" y1="44" x2="88" y2="44" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="90" y="30" width="40" height="28" class="fb sb"/><text x="110" y="49" text-anchor="middle">1</text>
<line x1="132" y1="44" x2="168" y2="44" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="30" width="40" height="28" class="fb sb"/><text x="190" y="49" text-anchor="middle">2</text>
<line x1="212" y1="44" x2="248" y2="44" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="250" y="30" width="40" height="28" class="fg sg"/><text x="270" y="49" text-anchor="middle">3</text>
<line x1="292" y1="44" x2="328" y2="44" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="330" y="30" width="40" height="28" class="fr sr"/><text x="350" y="49" text-anchor="middle">4</text>
<line x1="372" y1="44" x2="408" y2="44" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="410" y="30" width="40" height="28" class="fb sb"/><text x="430" y="49" text-anchor="middle">5</text>
<line x1="452" y1="44" x2="488" y2="44" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="494" y="49" class="tm">None</text>
<text x="270" y="22" text-anchor="middle" class="tg">trail</text><text x="505" y="22" text-anchor="middle" class="tm">lead</text>
<text x="350" y="80" text-anchor="middle" class="tr">remove (n = 2)</text>
<text x="10" y="104" class="tm">gap between lead and trail stays n + 1 = 3 hops, so when lead falls off, trail is right before the target</text>
</svg><figcaption>Final position. trail.next = trail.next.next removes 4. The dummy handles the case where the head itself is removed.</figcaption></figure>
  <table class="tbl out"><caption>Dry run: 1→2→3→4→5, n = 2</caption>
    <tr><th>Phase</th><th>lead</th><th>trail</th></tr>
    <tr><td>start</td><td>dummy</td><td>dummy</td></tr>
    <tr><td>lead moves n+1 = 3</td><td>3</td><td>dummy</td></tr>
    <tr><td>both move</td><td>4</td><td>1</td></tr>
    <tr><td>both move</td><td>5</td><td>2</td></tr>
    <tr><td>both move</td><td>None</td><td>3 → delete 3.next (4)</td></tr>
  </table>
<div class="fx" data-lang="py">def remove_nth_from_end(head, n):
    dummy = Node(0, head)
    lead = trail = dummy
    for _ in range(n + 1):
        lead = lead.next
    while lead:
        lead, trail = lead.next, trail.next
    trail.next = trail.next.next
    return dummy.next

for vals, n in [([1, 2, 3, 4, 5], 2), ([1], 1), ([1, 2], 2), ([1, 2], 1), ([1, 2, 3], 3)]:
    print(vals, n, "-&gt;", show(remove_nth_from_end(build(vals), n)))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5] 2 -&gt; 1 -&gt; 2 -&gt; 3 -&gt; 5 -&gt; None
[1] 1 -&gt;  -&gt; None
[1, 2] 2 -&gt; 2 -&gt; None
[1, 2] 1 -&gt; 1 -&gt; None
[1, 2, 3] 3 -&gt; 2 -&gt; 3 -&gt; None</div>
  <p><strong>Complexity.</strong> O(n) time, O(1) space, one pass. Starting at <code>head</code> instead of <code>dummy</code> breaks the case where the head itself is removed (<code>[1, 2]</code>, n = 2).</p>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture of how every technique in this note grew from the front-insert problem.</div>

  <h2 id="dsa-ll-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Nodes, traversal, insert/delete, dummy head, reverse, fast &amp; slow, merge, doubly lists and the LRU cache: how is each built from the one before, and what did each do to Biteful's queue?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-ll-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">front insert on a list</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">O(n) shift per VIP order</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-ll-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">nodes &amp; pointers</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">value + next; hold the head</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-ll-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">walk · insert · delete</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">O(n) walk, O(1) re-link</text>
<line x1="555" y1="54" x2="555" y2="86" stroke="currentColor" marker-end="url(#dsa-ll-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="fg sg"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">dummy head</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">every node has a predecessor</text>
<line x1="460" y1="110" x2="422" y2="110" stroke="currentColor" marker-end="url(#dsa-ll-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="fg sg"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">reverse</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">prev / cur / nxt</text>
<line x1="240" y1="110" x2="202" y2="110" stroke="currentColor" marker-end="url(#dsa-ll-a9)"/>
<rect x="10" y="88" width="190" height="44" rx="7" class="fg sg"/><text x="105" y="107" text-anchor="middle" font-size="11.5" font-weight="700">fast &amp; slow</text><text x="105" y="123" text-anchor="middle" class="tm" font-size="10">middle 250; Floyd meets at 310</text>
<line x1="105" y1="132" x2="105" y2="164" stroke="currentColor" marker-end="url(#dsa-ll-a9)"/>
<rect x="10" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="105" y="185" text-anchor="middle" font-size="11.5" font-weight="700">merge</text><text x="105" y="201" text-anchor="middle" class="tm" font-size="10">lunch + dinner → sorted day</text>
<line x1="200" y1="188" x2="238" y2="188" stroke="currentColor" marker-end="url(#dsa-ll-a9)"/>
<rect x="240" y="166" width="180" height="44" rx="7" class="ft st"/><text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">doubly linked</text><text x="330" y="201" text-anchor="middle" class="tm" font-size="10">prev: O(1) remove of a held node</text>
<line x1="420" y1="188" x2="458" y2="188" stroke="currentColor" marker-end="url(#dsa-ll-a9)"/>
<rect x="460" y="166" width="190" height="44" rx="7" class="fv"/><text x="555" y="185" text-anchor="middle" font-size="11.5" font-weight="700">LRU cache</text><text x="555" y="201" text-anchor="middle" class="tm" font-size="10">doubly list + dict (Hashing)</text>
<line x1="555" y1="210" x2="555" y2="242" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-ll-a9)"/>
<rect x="400" y="244" width="250" height="46" rx="7" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.6"/><text x="525" y="263" text-anchor="middle" font-size="11">→ Stacks &amp; Queues, Trees</text><text x="525" y="279" text-anchor="middle" class="tm" font-size="10">deque · nodes with two children</text>
</svg><figcaption>The front-insert problem forces nodes; nodes force walking; walking with a held predecessor gives insert/delete, made uniform by the dummy. Reverse and fast &amp; slow are smarter walks; merge combines two walks; adding prev gives O(1) removal anywhere, and a dict on top gives the LRU cache.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's queue</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Front-insert problem</td><td>list = array (Complexity)</td><td>why not a list?</td><td>1,000 VIP inserts ~40 ms vs ~0.07 ms at the back</td><td>frequent front/middle changes</td></tr>
    <tr><td>Nodes &amp; pointers</td><td>objects + references</td><td>order without slots?</td><td>head → 120 → 80 → 250 → 40 → 310 → None</td><td>any linked structure</td></tr>
    <tr><td>Traverse / insert / delete</td><td>nodes + a walking pointer</td><td>basic operations and costs?</td><td>find 40: 4 hops; VIP 999 at front: O(1)</td><td>queues, editing chains</td></tr>
    <tr><td>Dummy head</td><td>insert/delete needing a predecessor</td><td>remove the head uniformly?</td><td>80 → 120 → 80 → 250 → 120 → 250</td><td>head may change</td></tr>
    <tr><td>Reverse</td><td>walk + saved next</td><td>flip all links in place?</td><td>4 steps → 40 → 250 → 80 → 120</td><td>reverse, palindrome, reorder</td></tr>
    <tr><td>Fast &amp; slow</td><td>two walks at different speeds</td><td>middle / cycle in one pass?</td><td>middle 250; meet at 310; loop starts at 80</td><td>middle, cycles, nth from end</td></tr>
    <tr><td>Merge</td><td>dummy + tail + two walks</td><td>combine two sorted lists?</td><td>40 → 60 → 80 → 80 → 120 → 200 → 250 → 310</td><td>merge, merge sort on lists</td></tr>
    <tr><td>Doubly linked</td><td>nodes + prev + sentinels</td><td>remove a held node, walk back?</td><td>cancel 250 in O(1); backward 40, 80, 120, 999</td><td>deques, caches, history</td></tr>
    <tr><td>LRU cache</td><td>doubly list + dict (Hashing)</td><td>O(1) get/put with eviction?</td><td>get(102) → −1 after 102 evicted</td><td>caches with capacity</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a linked list trades "jump to position i" for "change the chain anywhere you hold a pointer in O(1)", so every technique is about holding the right pointers (predecessor, next, a second speed, a dict handle) at the right moment.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a>: the two disciplined ways of using "add and remove at an end", built on lists and deques.</div>

  <h2 id="dsa-ll-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: queue <b>120 → 80 → 250 → 40 → 310</b>; cancelled-80 list <b>80 → 120 → 80 → 250</b>; lunch <b>40 → 80 → 120 → 250</b>, dinner <b>60 → 80 → 200 → 310</b>; LRU capacity 2 with order ids 101, 102, 103.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Front insert</td><td>VIP at the front of a list?</td><td>O(n) shift; ~40 ms per 1,000 on 2 lakh</td><td>need no-shift storage</td></tr>
    <tr><td>Nodes</td><td>order without slots?</td><td>head → 120 → … → 310 → None</td><td>how to operate?</td></tr>
    <tr><td>Walk/insert/delete</td><td>costs?</td><td>find 40: 4 hops; insert after: 2 changes</td><td>head has no predecessor</td></tr>
    <tr><td>Dummy</td><td>uniform removal?</td><td>→ 120 → 250</td><td>flip every link?</td></tr>
    <tr><td>Reverse</td><td>flip without losing the rest?</td><td>40 → 250 → 80 → 120 in 4 steps</td><td>positions unknown</td></tr>
    <tr><td>Fast &amp; slow</td><td>middle, cycle?</td><td>250; meet at 310; start 80</td><td>two lists?</td></tr>
    <tr><td>Merge</td><td>one sorted queue?</td><td>40 … 310, no new nodes</td><td>can't go back / remove held node</td></tr>
    <tr><td>Doubly</td><td>O(1) remove of held node?</td><td>cancel 250; read backwards</td><td>can't find a node fast</td></tr>
    <tr><td>LRU</td><td>O(1) cache with eviction?</td><td>evicts 102; get(102) → −1</td><td>→ Stacks &amp; Queues</td></tr>
  </table>
  <h3>Templates</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Core lines</th><th>Notes</th></tr>
    <tr><td>Walk</td><td><code>cur = head; while cur: …; cur = cur.next</code></td><td>never move <code>head</code> itself</td></tr>
    <tr><td>Insert after</td><td><code>new.next = node.next; node.next = new</code></td><td>this order, or the rest is lost</td></tr>
    <tr><td>Delete after</td><td><code>node.next = node.next.next</code></td><td>needs the predecessor</td></tr>
    <tr><td>Dummy</td><td><code>dummy = Node(0, head) … return dummy.next</code></td><td>head may change</td></tr>
    <tr><td>Reverse</td><td><code>nxt = cur.next; cur.next = prev; prev, cur = cur, nxt</code></td><td>return <code>prev</code></td></tr>
    <tr><td>Fast/slow</td><td><code>while fast and fast.next: slow, fast = slow.next, fast.next.next</code></td><td>even length → second middle; compare with <code>is</code></td></tr>
    <tr><td>Cycle start</td><td>after meeting: p = head; step p and slow together</td><td>they meet at the loop start</td></tr>
    <tr><td>Nth from end</td><td>lead n + 1 ahead from dummy; move both; <code>trail.next = trail.next.next</code></td><td>one pass</td></tr>
    <tr><td>Merge</td><td>take smaller head onto <code>tail</code>; <code>tail.next = l1 or l2</code></td><td><code>&lt;=</code> keeps it stable</td></tr>
    <tr><td>DLL remove</td><td><code>n.prev.next = n.next; n.next.prev = n.prev</code></td><td>sentinels avoid None checks</td></tr>
    <tr><td>LRU</td><td>dict key → node; touch = unlink + add front; evict tail.prev</td><td>node stores its key</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a linked structure</b><p>Many inserts/removes at the ends or at held nodes; order matters; LRU-style caches.</p><small>In Python, usually <code>deque</code> or <code>OrderedDict</code></small></div>
    <div><b>Use a Python list</b><p>Index access, appends at the end, scanning, sorting, less memory.</p><small>Not for front inserts in a loop</small></div>
    <div><b>Use fast &amp; slow</b><p>Middle, cycles, nth from end, O(1) space required.</p><small>Not when a length counter is already stored</small></div>
    <div><b>Use recursion on lists</b><p>Short lists, or when the problem asks for it.</p><small>Not for long lists in Python (limit ~1000)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Losing the rest (flip before saving nxt; insert in the wrong order); returning the old head after reverse; <code>while fast.next</code> without <code>fast and</code>; comparing node values instead of identity; moving <code>head</code> while walking; advancing prev after a removal; forgetting <code>tail.next = l1 or l2</code>; updating only one direction in a doubly list; not storing the key in LRU nodes.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Cost of inserting at the front: Python list vs linked list?</td><td>O(n) vs O(1)</td></tr>
    <tr><td>Reverse 120 → 80 → 250 → 40: what is <code>prev</code> after step 2?</td><td>80 (reversed part 80 → 120)</td></tr>
    <tr><td>Middle of 120 → 80 → 250 → 40 → 310 → 80 by fast/slow?</td><td>40 (the second middle)</td></tr>
    <tr><td>Why does Floyd's fast pointer always meet slow inside a loop?</td><td>It gains one node per step, so the gap shrinks to 0</td></tr>
    <tr><td>LRU (cap 2): put 101, put 102, get 101, put 103. Who is evicted?</td><td>102, the least recently used</td></tr>
  </table>

  <h2 id="dsa-ll-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Array vs linked list: when would you pick each?</summary><div class="qa-body">Array (Python list): need index access, mostly append at the end, cache-friendly, less memory. Linked list: many inserts/deletes at the front or next to a held node, never need "item number i". In Python, reach for <code>deque</code> for a queue and a list for almost everything else.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Complexity of reading the 100th node, inserting at the head, and inserting after a node you hold?</summary><div class="qa-body">O(n) (walk 100 hops), O(1), O(1). The last two are O(1) because only pointers change, nothing shifts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Python's list.insert(0, x) O(n) if a list is "like" a linked list?</summary><div class="qa-body">It isn't a linked list. A Python list is a dynamic array: one contiguous block. Inserting at the front shifts every element right (1,000 VIP inserts on 2 lakh orders: ~40 ms). <code>deque.appendleft</code> is O(1) because deque is a doubly linked chain of blocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Reverse a linked list in place. What are the three pointers for?</summary><div class="qa-body"><code>prev</code> = the reversed part so far, <code>cur</code> = node being flipped, <code>nxt</code> = saved copy of <code>cur.next</code> so you can keep walking after the flip. Return <code>prev</code>. O(n) time, O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dummy head and why use it?</summary><div class="qa-body">A fake node placed before the real head. It guarantees every real node has a predecessor, so deleting or inserting at the head uses the same code as any other position. Return <code>dummy.next</code> at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect a cycle in O(1) space, and why does it work?</summary><div class="qa-body">Floyd's fast/slow pointers: slow moves 1, fast moves 2. If fast hits None, no cycle. Inside a cycle, fast gains one node on slow every step, so the gap shrinks to 0 and they land on the same node (310 after 4 steps in our trace). O(n) time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Middle of a list with 6 nodes using fast/slow: which middle do you get?</summary><div class="qa-body">The second one. On 120, 80, 250, 40, 310, 80 slow stops at 40. To get the first middle, start fast at <code>head.next</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Remove the nth node from the end in one pass. Why n + 1 steps for the lead pointer?</summary><div class="qa-body">Start both at a dummy. Moving lead n + 1 steps makes the gap n + 1, so when lead becomes None, trail is at the node <em>before</em> the target, which is what you need to re-link. Starting at dummy handles removing the head.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge two sorted lists: complexity and why no new nodes?</summary><div class="qa-body">O(n + m) time, O(1) extra space. You only re-point <code>next</code> on existing nodes through a running <code>tail</code>; when one list ends, attach the other's remainder in one step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does an LRU cache need both a dict and a doubly linked list?</summary><div class="qa-body">The dict gives O(1) lookup from key to node. The doubly linked list keeps recency order and lets you unlink a node and move it to the front in O(1), because the node knows both its neighbours. A singly list would need O(n) to find the previous node; a dict alone has no order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why avoid recursion on linked lists in Python?</summary><div class="qa-body">Each node adds one stack frame, and Python's default recursion limit is about 1000. A list of 10,000 nodes raises RecursionError. Loops are O(1) space and have no limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does reversing need the "insert in the right order" lesson from section 03?</summary><div class="qa-body">Both are the same danger: once a node's <code>next</code> is overwritten, whatever it pointed to is unreachable unless another variable holds it. Insert-after saves it by linking the new node first; reverse saves it in <code>nxt</code> before flipping. Skip the save and the rest of the queue is lost (our wrong-order demo looped on 60 forever).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do fast &amp; slow pointers relate to the two pointers of the Arrays note?</summary><div class="qa-body">Same idea, two positions moving under a rule so one pass does the work of many. On an array the pointers can jump to any index (opposite ends); on a linked list they can only move forward, so the useful differences are <em>speed</em> (middle, cycles) and <em>distance</em> (nth from end).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in the LRU cache if you use a singly linked list?</summary><div class="qa-body">Moving a node to the front, or evicting the last node, requires changing its predecessor's <code>next</code>. With only <code>next</code> pointers, finding the predecessor is an O(n) walk, so get and put become O(n). <code>prev</code> pointers (section 08) are what make both O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did the dummy head reappear in merge, nth-from-end and the LRU cache?</summary><div class="qa-body">All three may change what the first (or last) real node is: the merged list's head comes from either input, the removed node can be the head, and the LRU list's front and back change constantly. A dummy (or head/tail sentinels) gives every real node a neighbour, so one code path covers every position.</div></details>
</main>
`
});
