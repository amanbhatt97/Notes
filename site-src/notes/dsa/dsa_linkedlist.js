// notes/dsa/dsa_linkedlist.js — Linked Lists
Object.assign(TOPIC_CONTENT, {
  "dsa_linkedlist": `<main>
<h1>Linked Lists</h1>
  <p class="lead">A linked list is a chain of small boxes, each holding a value and the address of the next box. It makes inserting and removing in the middle cheap, at the cost of slow lookup by position. Interviewers use it to test pointer handling: reversing, merging, cycle finding and the fast/slow trick. Needs only Python classes and loops.</p>

  <h2 id="dsa-ll-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linked Lists</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Node</b> — value + pointer (<code>next</code>) to the next node; last points to <code>None</code></li>
          <li><b>Head</b> — the first node; the only thing you hold; lose it = lose the list</li>
          <li><b>Why</b> — insert/delete in the middle is O(1) once you stand there; a list shifts everything</li>
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
          <li><b>Dummy head</b> — fake node before the real head; removes "is it the first node?" special cases; return <code>dummy.next</code></li>
          <li><b>Reverse</b> — three pointers <code>prev, cur, nxt</code>; save <code>nxt</code> before flipping <code>cur.next</code></li>
          <li><b>Fast/slow</b> — fast moves 2, slow moves 1; fast at end → slow at middle</li>
          <li><b>Two pointers with a gap</b> — lead by n → when lead hits end, trailer is n from end</li>
          <li>⚠ Order of assignments matters; draw the picture before coding</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Walk with prev</b> — delete / insert needs the node <em>before</em></li>
          <li><b>Fast &amp; slow (Floyd)</b> — middle, cycle detection, cycle start</li>
          <li><b>Merge with dummy</b> — two sorted lists → one, re-link nodes, no new nodes</li>
          <li><b>In-place reverse</b> — whole list, a part, or k groups</li>
          <li><b>Hash map + list</b> — LRU cache: dict for O(1) find, doubly list for O(1) move</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Reverse Linked List</b> — prev/cur loop; O(n), O(1)</li>
          <li><b>Merge Two Sorted Lists</b> — dummy + tail; O(n+m)</li>
          <li><b>Linked List Cycle</b> — fast meets slow; O(n), O(1) (set gives O(n) space)</li>
          <li><b>Middle of the List</b> — slow when fast ends; second middle for even length</li>
          <li><b>Remove Nth From End</b> — gap of n, start both at dummy</li>
          <li><b>LRU Cache</b> — dict + doubly linked list, or <code>OrderedDict</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>⚠ <code>None.next</code> — always check <code>fast and fast.next</code> before <code>fast.next.next</code></li>
          <li>⚠ Losing the rest of the list — save <code>nxt</code> before changing <code>cur.next</code></li>
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
      <div class="rm-item rm-done" data-target="dsa-ll-train"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Train Coaches</span><span class="rm-sub">Why not just use a list?</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-nodes"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Nodes &amp; Pointers</span><span class="rm-sub">Value + next, head, None</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-types"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Singly vs Doubly</span><span class="rm-sub">One hook or two; Python's deque</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-ops"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Insert, Delete, Reverse</span><span class="rm-sub">Before/after pictures and Big-O</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-dummy"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Dummy Head Trick</span><span class="rm-sub">Kill the "first node" special case</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-fastslow"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Fast &amp; Slow Pointers</span><span class="rm-sub">Middle, cycle, gap of n</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-patterns"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-problems"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">Reverse, Merge, Cycle, Middle, Nth from end</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-lru"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">LRU Cache Idea</span><span class="rm-sub">Dict + doubly linked list</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ll-train"><span class="num">01</span>Train Coaches</h2>
  <p>A train is a line of coaches. Each coach is hooked to the next one. To add a coach in the middle, the railway staff unhook one joint and hook the new coach in. The other coaches do not move. To find coach number 9, though, you have to walk from the engine and count. There is no "jump to coach 9".</p>
  <p>A Python <code>list</code> is the opposite. It is one long row of numbered seats in memory. Seat 9 is reached instantly (<code>a[9]</code>). But inserting at seat 2 means every seat after it must shift right by one.</p>
<div class="fx" data-lang="py">import timeit
n = 200_000
big = list(range(n))
t_end   = timeit.timeit(lambda: big.append(1),    number=1000)
t_front = timeit.timeit(lambda: big.insert(0, 1), number=1000)
print(f"1000 appends at end : {t_end*1000:6.1f} ms")
print(f"1000 inserts at front: {t_front*1000:6.1f} ms  (every insert shifts {n:,}+ items)")</div>
  <div class="fx" data-lang="text">1000 appends at end :    0.1 ms
1000 inserts at front:   40.9 ms  (every insert shifts 200,000+ items)</div>
  <p>That gap is the need. When your program inserts or removes in the middle all the time, and rarely looks up "item number i", a chain of linked boxes wins. That chain is a <strong>linked list</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Train coaches: each coach knows only the coach behind it. Adding or removing a coach means changing two hooks. Finding a coach means walking from the engine. Where it breaks: real coaches can be seen from outside; a program sees only one node at a time, through its pointer.</p>
  </div>
  <table class="tbl">
    <tr><th>Need</th><th>Python list (array)</th><th>Linked list</th></tr>
    <tr><td>Read item number i</td><td>O(1) — jump</td><td>O(i) — walk</td></tr>
    <tr><td>Insert / delete at the front</td><td>O(n) — shift all</td><td>O(1)</td></tr>
    <tr><td>Insert / delete after a node you hold</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Memory per item</td><td>one slot</td><td>value + pointer (more)</td></tr>
    <tr><td>Used for</td><td>almost everything in Python</td><td>queues, LRU caches, undo chains, interview questions</td></tr>
  </table>
  <p>Where you meet it in a job: <code>collections.deque</code>, LRU caches in web servers, the "undo" chain in editors, blockchains (each block points at the previous), and the memory allocator inside Python itself. In interviews it is a favourite because the code is short but one wrong pointer breaks everything.</p>

  <h2 id="dsa-ll-nodes"><span class="num">02</span>Nodes &amp; Pointers</h2>
  <p>A <strong>node</strong> is a tiny object with two fields: the <strong>value</strong> and <strong>next</strong>, the address of the following node. A <strong>pointer</strong> is just a variable that holds a node (in Python, any variable that refers to an object). The last node's <code>next</code> is <code>None</code>: nothing follows. The <strong>head</strong> is the first node, and it is the only thing you keep.</p>
  <figure class="viz"><svg viewBox="0 0 560 120" width="560">
<defs><marker id="dsa-ll-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<text x="30" y="30" class="tb">head</text>
<line x1="42" y1="36" x2="42" y2="58" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<g>
<rect x="20" y="60" width="44" height="34" class="fb sb"/><rect x="64" y="60" width="26" height="34" class="fs" stroke="currentColor"/>
<text x="42" y="82" text-anchor="middle">7</text><circle cx="77" cy="77" r="3" fill="currentColor"/>
<line x1="77" y1="77" x2="148" y2="77" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="150" y="60" width="44" height="34" class="fb sb"/><rect x="194" y="60" width="26" height="34" class="fs" stroke="currentColor"/>
<text x="172" y="82" text-anchor="middle">3</text><circle cx="207" cy="77" r="3" fill="currentColor"/>
<line x1="207" y1="77" x2="278" y2="77" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="280" y="60" width="44" height="34" class="fb sb"/><rect x="324" y="60" width="26" height="34" class="fs" stroke="currentColor"/>
<text x="302" y="82" text-anchor="middle">9</text><circle cx="337" cy="77" r="3" fill="currentColor"/>
<line x1="337" y1="77" x2="408" y2="77" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="410" y="60" width="44" height="34" class="fb sb"/><rect x="454" y="60" width="26" height="34" class="fs" stroke="currentColor"/>
<text x="432" y="82" text-anchor="middle">4</text><text x="467" y="82" text-anchor="middle" class="tm">/</text>
<text x="500" y="82" class="tm">None</text>
</g>
<text x="42" y="112" text-anchor="middle" class="tm">val</text><text x="77" y="112" text-anchor="middle" class="tm">next</text>
</svg><figcaption>Four nodes. Each box = value (blue) + next pointer (grey). The last pointer is None. Only "head" is held by your code.</figcaption></figure>
  <p>In Python a node is a small class. Building the picture above by hand looks like this.</p>
<div class="fx" data-lang="py">class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

head = Node(7, Node(3, Node(9, Node(4))))     # 7 -&gt; 3 -&gt; 9 -&gt; 4 -&gt; None

cur = head                    # walk: start at head, follow next until None
while cur:
    print(cur.val, end=" -&gt; ")
    cur = cur.next
print("None")</div>
  <div class="fx" data-lang="text">7 -&gt; 3 -&gt; 9 -&gt; 4 -&gt; None</div>
  <p>Two helpers make the rest of the note short: <code>build</code> turns a Python list into a chain, <code>show</code> prints a chain (with a limit so a cycle cannot hang it).</p>
<div class="fx" data-lang="py">def build(values):
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

print(show(build([1, 2, 3])))
print(show(build([])))</div>
  <div class="fx" data-lang="text">1 -&gt; 2 -&gt; 3 -&gt; None
 -&gt; None</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Moving <code>head</code> itself while walking (<code>head = head.next</code>). Afterwards you have lost the list; nothing points to the first node any more. Walk with a second variable (<code>cur</code>).</p>
  </div>

  <h2 id="dsa-ll-types"><span class="num">03</span>Singly vs Doubly</h2>
  <p>The list above is <strong>singly linked</strong>: each node has one hook, forward. A <strong>doubly linked</strong> list gives each node two hooks, <code>next</code> and <code>prev</code>. You can walk both ways, and you can delete a node when you hold only that node, because you can reach its neighbours on both sides.</p>
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
  <table class="tbl">
    <tr><th></th><th>Singly linked</th><th>Doubly linked</th></tr>
    <tr><td>Pointers per node</td><td>1 (<code>next</code>)</td><td>2 (<code>prev</code>, <code>next</code>)</td></tr>
    <tr><td>Delete a node you hold</td><td>O(n) — must find the node before it</td><td>O(1)</td></tr>
    <tr><td>Walk backwards</td><td>No</td><td>Yes</td></tr>
    <tr><td>Memory</td><td>Less</td><td>More</td></tr>
    <tr><td>Used by</td><td>Most interview questions, stacks</td><td>Queues, LRU cache, browser history, <code>collections.deque</code></td></tr>
  </table>
  <p>In real Python work you rarely write your own list. <code>collections.deque</code> ("double-ended queue") is a doubly linked chain of small blocks: O(1) add and remove at both ends.</p>
<div class="fx" data-lang="py">from collections import deque
d = deque([2, 3, 4])
d.appendleft(1); d.append(5)
print(d, "| popleft:", d.popleft(), "| pop:", d.pop(), "|", d)
front = timeit.timeit(lambda: (d.appendleft(0), d.popleft()), number=100_000)
print(f"100k appendleft+popleft on deque: {front*1000:.1f} ms")</div>
  <div class="fx" data-lang="text">deque([2, 3, 4]) | popleft: 1 | pop: 5 | deque([2, 3, 4])
100k appendleft+popleft on deque: 4.9 ms</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>deque[i]</code> in the middle is O(n), not O(1). deque is for the ends. If you need fast middle access, use a list.</p>
  </div>

  <h2 id="dsa-ll-ops"><span class="num">04</span>Insert, Delete, Reverse</h2>
  <p>Every linked-list operation is "change which node a pointer points to". The trick is always the same: draw the before picture, draw the after picture, and write the pointer changes in an order that never loses a node.</p>
  <h3>Insert after a node</h3>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="10" y="22" class="tm">before</text>
<rect x="70" y="10" width="44" height="28" class="fb sb"/><text x="92" y="29" text-anchor="middle">1</text>
<line x1="116" y1="24" x2="168" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="10" width="44" height="28" class="fb sb"/><text x="192" y="29" text-anchor="middle">2</text>
<line x1="216" y1="24" x2="268" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="10" width="44" height="28" class="fb sb"/><text x="292" y="29" text-anchor="middle">4</text>
<rect x="170" y="50" width="44" height="28" class="fg sg"/><text x="192" y="69" text-anchor="middle">3</text><text x="225" y="69" class="tm">new node, not linked yet</text>
<text x="10" y="112" class="tm">after</text>
<rect x="70" y="100" width="44" height="28" class="fb sb"/><text x="92" y="119" text-anchor="middle">1</text>
<line x1="116" y1="114" x2="168" y2="114" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="100" width="44" height="28" class="fb sb"/><text x="192" y="119" text-anchor="middle">2</text>
<path d="M214,114 Q240,114 268,114" fill="none" class="sg" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="100" width="44" height="28" class="fg sg"/><text x="292" y="119" text-anchor="middle">3</text>
<path d="M314,114 Q340,114 368,114" fill="none" class="sg" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<rect x="370" y="100" width="44" height="28" class="fb sb"/><text x="392" y="119" text-anchor="middle">4</text>
<text x="430" y="119" class="tm">2 pointer changes</text>
</svg><figcaption>Green arrows are the only changes: new.next = 2.next, then 2.next = new. Do it in that order, or node 4 is lost.</figcaption></figure>
<div class="fx" data-lang="py">def insert_after(node, val):
    new = Node(val)
    new.next = node.next        # first: new node grabs the rest of the chain
    node.next = new             # then: previous node points to new node
    return new

head = build([1, 2, 4])
insert_after(head.next, 3)      # after the node holding 2
print(show(head))</div>
  <div class="fx" data-lang="text">1 -&gt; 2 -&gt; 3 -&gt; 4 -&gt; None</div>
  <h3>Delete the node after a node</h3>
  <figure class="viz"><svg viewBox="0 0 560 100" width="560">
<text x="10" y="22" class="tm">before</text>
<rect x="70" y="10" width="44" height="28" class="fb sb"/><text x="92" y="29" text-anchor="middle">1</text>
<line x1="116" y1="24" x2="168" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="10" width="44" height="28" class="fr sr"/><text x="192" y="29" text-anchor="middle">2</text>
<line x1="216" y1="24" x2="268" y2="24" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="10" width="44" height="28" class="fb sb"/><text x="292" y="29" text-anchor="middle">3</text>
<text x="10" y="72" class="tm">after</text>
<rect x="70" y="60" width="44" height="28" class="fb sb"/><text x="92" y="79" text-anchor="middle">1</text>
<path d="M114,74 Q192,40 268,74" fill="none" class="sg" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="60" width="44" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="192" y="79" text-anchor="middle" class="tm">2</text>
<rect x="270" y="60" width="44" height="28" class="fb sb"/><text x="292" y="79" text-anchor="middle">3</text>
<text x="340" y="79" class="tm">1 pointer change: prev.next = prev.next.next</text>
</svg><figcaption>Nothing moves. Node 1 simply skips over node 2. With nothing pointing to it, Python frees node 2.</figcaption></figure>
<div class="fx" data-lang="py">def delete_after(node):
    if node.next:
        node.next = node.next.next     # skip one node

head = build([1, 2, 3])
delete_after(head)
print(show(head))</div>
  <div class="fx" data-lang="text">1 -&gt; 3 -&gt; None</div>
  <h3>Reverse the whole list</h3>
  <p>Walk the list once. At each node, flip its <code>next</code> to point backwards. You need three pointers: <code>prev</code> (already reversed part), <code>cur</code> (the node being flipped), <code>nxt</code> (saved so we can still move forward after the flip).</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
<text x="10" y="20" class="tm">step: cur = 2</text>
<text x="92" y="48" text-anchor="middle" class="tb">prev</text><text x="192" y="48" text-anchor="middle" class="tb">cur</text><text x="292" y="48" text-anchor="middle" class="tb">nxt</text>
<text x="20" y="79" class="tm">None</text><line x1="68" y1="74" x2="52" y2="74" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="70" y="60" width="44" height="28" class="fg sg"/><text x="92" y="79" text-anchor="middle">1</text>
<path d="M170,74 Q140,74 116,74" fill="none" class="sg" stroke-width="2" marker-end="url(#dsa-ll-ar)"/>
<rect x="170" y="60" width="44" height="28" class="fv"/><text x="192" y="79" text-anchor="middle">2</text>
<line x1="216" y1="74" x2="268" y2="74" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="60" width="44" height="28" class="fb sb"/><text x="292" y="79" text-anchor="middle">3</text>
<line x1="316" y1="74" x2="368" y2="74" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="370" y="60" width="44" height="28" class="fb sb"/><text x="392" y="79" text-anchor="middle">4</text>
<line x1="416" y1="74" x2="452" y2="74" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="458" y="79" class="tm">None</text>
<text x="10" y="120" class="tm">1. nxt = cur.next    (save 3, dashed arrow is about to be cut)</text>
<text x="10" y="138" class="tm">2. cur.next = prev   (2 now points back to 1: the green arrow)</text>
<text x="10" y="156" class="tm">3. prev = cur; cur = nxt   (slide all three one step right)</text>
</svg><figcaption>Green = already reversed. Violet = being flipped. Saving nxt first is what keeps 3 and 4 reachable.</figcaption></figure>
<div class="fx" data-lang="py">def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next          # 1. save the rest
        cur.next = prev         # 2. flip this arrow
        prev, cur = cur, nxt    # 3. move both forward
    return prev                 # prev is the new head

head = build([1, 2, 3, 4])
print(show(reverse(head)))
print(show(reverse(build([1]))), "|", show(reverse(build([]))))</div>
  <div class="fx" data-lang="text">4 -&gt; 3 -&gt; 2 -&gt; 1 -&gt; None
1 -&gt; None |  -&gt; None</div>
  <h3>Big-O for every operation</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Singly</th><th>Doubly</th><th>Why</th></tr>
    <tr><td>Read the i-th item</td><td>O(n)</td><td>O(n)</td><td>No index; walk i hops from the head</td></tr>
    <tr><td>Search for a value</td><td>O(n)</td><td>O(n)</td><td>Must look at each node in turn</td></tr>
    <tr><td>Insert / delete at the head</td><td>O(1)</td><td>O(1)</td><td>Change the head pointer only</td></tr>
    <tr><td>Insert / delete after a node you hold</td><td>O(1)</td><td>O(1)</td><td>Two pointer changes, nothing shifts</td></tr>
    <tr><td>Delete a node you hold (not its predecessor)</td><td>O(n)</td><td>O(1)</td><td>Singly must find the previous node; doubly has <code>prev</code></td></tr>
    <tr><td>Append at the tail</td><td>O(n), O(1) with tail pointer</td><td>O(1) with tail pointer</td><td>Walking to the end costs n unless you remember the tail</td></tr>
    <tr><td>Reverse</td><td>O(n) time, O(1) space</td><td>O(n)</td><td>One pass, three variables</td></tr>
    <tr><td>Space</td><td>O(n)</td><td>O(n)</td><td>One (or two) pointers per value</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Reversing is O(n) time but what about space?" Iterative reverse is O(1) extra space. The recursive version is O(n) because of the call stack, and Python's stack limit (about 1000) makes it crash on long lists.</p>
  </div>

  <h2 id="dsa-ll-dummy"><span class="num">05</span>The Dummy Head Trick</h2>
  <p>Deleting the first node is different from deleting any other node: there is no node before it, so you must change <code>head</code> itself. That means an <code>if</code> for the head and separate code for the rest. Easy to get wrong.</p>
  <p>The fix: put a fake node in front of the real head. Now every real node has a node before it, so one loop handles all of them. At the end return <code>dummy.next</code>, the real head (which may have changed).</p>
  <figure class="viz"><svg viewBox="0 0 560 70" width="560">
<rect x="20" y="20" width="60" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="50" y="39" text-anchor="middle" class="tm">dummy</text>
<line x1="82" y1="34" x2="118" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="120" y="20" width="44" height="28" class="fr sr"/><text x="142" y="39" text-anchor="middle">6</text>
<line x1="166" y1="34" x2="218" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="220" y="20" width="44" height="28" class="fb sb"/><text x="242" y="39" text-anchor="middle">1</text>
<line x1="266" y1="34" x2="318" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="320" y="20" width="44" height="28" class="fr sr"/><text x="342" y="39" text-anchor="middle">6</text>
<line x1="366" y1="34" x2="418" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="420" y="20" width="44" height="28" class="fb sb"/><text x="442" y="39" text-anchor="middle">2</text>
<line x1="466" y1="34" x2="502" y2="34" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="508" y="39" class="tm">None</text>
<text x="142" y="64" text-anchor="middle" class="tm">real head (to delete)</text>
</svg><figcaption>Remove every 6. The first 6 is the head, but with a dummy in front it is "the node after dummy", just like the other 6.</figcaption></figure>
<div class="fx" data-lang="py">def remove_all(head, val):
    dummy = Node(0, head)           # fake node in front
    prev = dummy
    while prev.next:
        if prev.next.val == val:
            prev.next = prev.next.next   # skip it; prev stays, maybe the next one is also val
        else:
            prev = prev.next
    return dummy.next               # the real head, even if it changed

print(show(remove_all(build([6, 1, 6, 2]), 6)))
print(show(remove_all(build([6, 6, 6]), 6)))
print(show(remove_all(build([1, 2]), 9)))</div>
  <div class="fx" data-lang="text">1 -&gt; 2 -&gt; None
 -&gt; None
1 -&gt; 2 -&gt; None</div>
  <div class="callout intu"><span class="label">When to reach for a dummy</span>
    <p>Whenever the head might change or be removed: deleting nodes, merging lists, removing the nth from the end, partitioning. It costs one node and saves a special case every time.</p>
  </div>

  <h2 id="dsa-ll-fastslow"><span class="num">06</span>Fast &amp; Slow Pointers</h2>
  <p>You cannot ask a linked list "how long are you?" without walking it. Two pointers moving at different speeds answer many questions in one pass. <code>slow</code> moves one node per step, <code>fast</code> moves two.</p>
  <figure class="viz"><svg viewBox="0 0 560 120" width="560">
<g>
<rect x="20" y="40" width="44" height="28" class="fb sb"/><text x="42" y="59" text-anchor="middle">1</text>
<line x1="66" y1="54" x2="118" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="120" y="40" width="44" height="28" class="fb sb"/><text x="142" y="59" text-anchor="middle">2</text>
<line x1="166" y1="54" x2="218" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="220" y="40" width="44" height="28" class="fg sg"/><text x="242" y="59" text-anchor="middle">3</text>
<line x1="266" y1="54" x2="318" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="320" y="40" width="44" height="28" class="fb sb"/><text x="342" y="59" text-anchor="middle">4</text>
<line x1="366" y1="54" x2="418" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="420" y="40" width="44" height="28" class="fv"/><text x="442" y="59" text-anchor="middle">5</text>
<line x1="466" y1="54" x2="502" y2="54" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><text x="508" y="59" class="tm">None</text>
</g>
<text x="42" y="24" text-anchor="middle" class="tm">s f</text><text x="142" y="24" text-anchor="middle" class="tm">s</text><text x="242" y="24" text-anchor="middle" class="tg">s</text><text x="242" y="86" text-anchor="middle" class="tm">f</text><text x="442" y="86" text-anchor="middle" class="tm">f</text>
<text x="20" y="110" class="tm">step 0: both at 1 · step 1: slow 2, fast 3 · step 2: slow 3, fast 5 → fast.next is None, stop. slow = middle.</text>
</svg><figcaption>Fast covers twice the distance. When fast reaches the end, slow has covered half: the middle.</figcaption></figure>
<div class="fx" data-lang="py">def middle(head):
    slow = fast = head
    while fast and fast.next:        # both checks, or fast.next.next crashes
        slow = slow.next
        fast = fast.next.next
    return slow

for vals in [[1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6], [1], [1, 2]]:
    print(vals, "-&gt; middle =", middle(build(vals)).val)</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5] -&gt; middle = 3
[1, 2, 3, 4, 5, 6] -&gt; middle = 4
[1] -&gt; middle = 1
[1, 2] -&gt; middle = 2</div>
  <p>For an even length (6 items) this returns the second of the two middles (4). LeetCode asks for exactly that. If you want the first middle, start <code>fast</code> at <code>head.next</code>.</p>
  <h3>Cycles</h3>
  <p>A <strong>cycle</strong> means some node's <code>next</code> points back to an earlier node, so walking never reaches <code>None</code>. A plain walk loops forever. With fast and slow on a circular track, the fast runner must eventually lap the slow one and land on the same node. If there is no cycle, fast reaches <code>None</code>. This is <strong>Floyd's cycle detection</strong> (the tortoise and hare).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two runners on a circular school ground, one twice as fast. The fast one always catches up from behind. On a straight road, the fast one simply reaches the end first and they never meet.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing <code>while fast.next</code> without <code>fast and</code>. On an even-length list, <code>fast</code> becomes <code>None</code> and <code>None.next</code> raises <code>AttributeError</code>. Always: <code>while fast and fast.next</code>.</p>
  </div>

  <h2 id="dsa-ll-patterns"><span class="num">07</span>Patterns</h2>
  <table class="tbl">
    <tr><th>Pattern</th><th>Signal words</th><th>Template</th><th>Solved below</th></tr>
    <tr><td><strong>1. Walk with a prev pointer (+ dummy)</strong></td><td>"remove", "delete", "insert", "merge", "partition"</td><td><code>dummy → prev loop → return dummy.next</code></td><td>Merge Two Sorted Lists, Remove Nth From End</td></tr>
    <tr><td><strong>2. In-place reverse</strong></td><td>"reverse", "palindrome list", "reorder", "k-group"</td><td><code>prev, cur, nxt</code> loop</td><td>Reverse Linked List</td></tr>
    <tr><td><strong>3. Fast &amp; slow</strong></td><td>"middle", "cycle", "loop", "without extra space", "one pass"</td><td><code>while fast and fast.next</code></td><td>Middle of the List, Linked List Cycle</td></tr>
    <tr><td><strong>4. Two pointers with a gap</strong></td><td>"nth from the end", "k-th last"</td><td>lead moves n first; then both move</td><td>Remove Nth From End</td></tr>
    <tr><td><strong>5. Hash map + linked list</strong></td><td>"O(1) get and put", "cache", "most recently used"</td><td>dict → node; doubly list keeps order</td><td>LRU Cache (idea)</td></tr>
  </table>
<div class="fx" data-lang="text"># Template 1: dummy + prev walk
dummy = Node(0, head)
prev = dummy
while prev.next:
    if should_remove(prev.next): prev.next = prev.next.next
    else: prev = prev.next
return dummy.next

# Template 3: fast &amp; slow
slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast: ...            # cycle check goes here</div>

  <h2 id="dsa-ll-problems"><span class="num">08</span>Classic Problems</h2>
  <h3>Reverse Linked List (LeetCode 206)</h3>
  <p><strong>Problem.</strong> Given the head of a singly linked list, reverse it and return the new head. <code>1→2→3→4→5</code> becomes <code>5→4→3→2→1</code>.</p>
  <p><strong>Brute force.</strong> Copy the values into a Python list, reverse it, build a new linked list. O(n) time but O(n) extra space, and it makes new nodes. Interviewers want in-place.</p>
  <p><strong>Better.</strong> The three-pointer loop from section 04. Dry run on <code>1→2→3</code>:</p>
  <table class="tbl out"><caption>Dry run</caption>
    <tr><th>Step</th><th>prev</th><th>cur</th><th>nxt</th><th>After cur.next = prev</th></tr>
    <tr><td>start</td><td>None</td><td>1</td><td>—</td><td>—</td></tr>
    <tr><td>1</td><td>None</td><td>1</td><td>2</td><td>1→None; prev=1, cur=2</td></tr>
    <tr><td>2</td><td>1</td><td>2</td><td>3</td><td>2→1→None; prev=2, cur=3</td></tr>
    <tr><td>3</td><td>2</td><td>3</td><td>None</td><td>3→2→1→None; prev=3, cur=None → stop</td></tr>
  </table>
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
  <p><strong>Complexity.</strong> O(n) time, O(1) space. The recursive version (<code>reverse(head.next)</code> then <code>head.next.next = head; head.next = None</code>) is O(n) space and hits Python's recursion limit around 1000 nodes.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Returning <code>head</code> instead of <code>prev</code>. After the loop, <code>head</code> is the old first node, now the tail. The new head is <code>prev</code>.</p>
  </div>

  <h3>Merge Two Sorted Lists (LeetCode 21)</h3>
  <p><strong>Problem.</strong> Two sorted linked lists. Merge them into one sorted list by re-linking the existing nodes.</p>
  <p><strong>Brute force.</strong> Collect all values, sort, rebuild: O((n+m) log(n+m)) and new nodes. Wasteful, since both inputs are already sorted.</p>
  <p><strong>Better.</strong> Like merging two sorted stacks of exam papers: look at the top of each, take the smaller, repeat. Keep a <code>tail</code> that always points to the last node of the merged list. A dummy head avoids "which list gives the first node?".</p>
  <table class="tbl out"><caption>Dry run: l1 = 1→2→4, l2 = 1→3→4</caption>
    <tr><th>l1 head</th><th>l2 head</th><th>Take</th><th>Merged so far</th></tr>
    <tr><td>1</td><td>1</td><td>l1's 1 (ties → l1)</td><td>1</td></tr>
    <tr><td>2</td><td>1</td><td>l2's 1</td><td>1→1</td></tr>
    <tr><td>2</td><td>3</td><td>2</td><td>1→1→2</td></tr>
    <tr><td>4</td><td>3</td><td>3</td><td>1→1→2→3</td></tr>
    <tr><td>4</td><td>4</td><td>l1's 4</td><td>1→1→2→3→4</td></tr>
    <tr><td>None</td><td>4</td><td>attach the rest of l2</td><td>1→1→2→3→4→4</td></tr>
  </table>
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
  <p><strong>Complexity.</strong> O(n + m) time, O(1) extra space (no new nodes except the dummy).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>tail.next = l1 or l2</code>. When one list runs out, the other's remaining nodes are already sorted; attach them in one step instead of looping.</p>
  </div>

  <h3>Linked List Cycle (LeetCode 141)</h3>
  <p><strong>Problem.</strong> Return True if the list has a cycle (some <code>next</code> points to an earlier node).</p>
  <p><strong>Brute force.</strong> Keep a <code>set</code> of visited nodes; if you see a node twice, there is a cycle. O(n) time but O(n) space.</p>
  <p><strong>Better.</strong> Fast and slow. If they ever point to the same node, there is a cycle. If fast reaches <code>None</code>, there is none. Compare with <code>is</code> (same object), not <code>==</code> on values.</p>
  <table class="tbl out"><caption>Dry run: 1→2→3→4→(back to 2)</caption>
    <tr><th>Step</th><th>slow</th><th>fast</th><th>Same?</th></tr>
    <tr><td>0</td><td>1</td><td>1</td><td>start</td></tr>
    <tr><td>1</td><td>2</td><td>3</td><td>no</td></tr>
    <tr><td>2</td><td>3</td><td>2 (4→2)</td><td>no</td></tr>
    <tr><td>3</td><td>4</td><td>4 (2→3→4)</td><td>yes → cycle</td></tr>
  </table>
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
  <p><strong>Complexity.</strong> O(n) time, O(1) space. Follow-up (LeetCode 142, cycle start): after they meet, put one pointer back at the head and move both one step at a time; they meet at the cycle's first node.</p>

  <h3>Middle of the Linked List (LeetCode 876)</h3>
  <p><strong>Problem.</strong> Return the middle node. For an even count, return the second middle.</p>
  <p><strong>Brute force.</strong> Walk once to count n, walk again n // 2 steps. Two passes, O(n).</p>
  <p><strong>Better.</strong> Fast and slow in one pass (section 06). Dry run for <code>1→2→3→4→5→6</code>: slow 1→2→3→4, fast 1→3→5→None. Stop with slow at 4, the second middle.</p>
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
  <p><strong>Complexity.</strong> O(n) time, O(1) space. Both versions are O(n); the fast/slow one is a single pass, which is what the interviewer wants to hear.</p>

  <h3>Remove Nth Node From End of List (LeetCode 19)</h3>
  <p><strong>Problem.</strong> Remove the n-th node counting from the end. For <code>1→2→3→4→5</code> and n = 2, remove 4.</p>
  <p><strong>Brute force.</strong> Count the length L, then walk to node L − n − 1 and skip the next one. Two passes. Works, but the "one pass" version is the one asked.</p>
  <p><strong>Better.</strong> Two pointers with a gap. Start both at a dummy. Move <code>lead</code> n + 1 steps. Then move both until <code>lead</code> is <code>None</code>. Now <code>trail</code> stands just before the node to delete.</p>
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
  <p><strong>Complexity.</strong> O(n) time, O(1) space, one pass.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Starting <code>lead</code> and <code>trail</code> at <code>head</code> instead of <code>dummy</code>. Then removing the first node (n = length) fails, because there is no node before it to re-link.</p>
  </div>

  <h2 id="dsa-ll-lru"><span class="num">09</span>LRU Cache Idea</h2>
  <p>An <strong>LRU cache</strong> (least recently used) holds a fixed number of items, say 2. When full and a new item comes, it throws out the item that has not been touched for the longest. Both <code>get</code> and <code>put</code> must be O(1). This is the most famous "linked list in production" question.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A small desk with room for two books. Every time you use a book, you put it at the front. When a third book arrives, the one at the back (untouched longest) goes to the shelf. The desk is the linked list; a sticky-note index telling you where each book sits is the dict.</p>
  </div>
  <p>Why both structures? A dict finds a key in O(1) but keeps no "who was used last" order. A doubly linked list keeps that order and can move any node to the front in O(1), but only if you already hold the node. So: dict maps key → node, list keeps recency order.</p>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
<text x="10" y="22" class="tm">dict: key → node</text>
<rect x="10" y="30" width="110" height="24" class="fv"/><text x="65" y="46" text-anchor="middle">"a" → node a</text>
<rect x="10" y="58" width="110" height="24" class="fv"/><text x="65" y="74" text-anchor="middle">"b" → node b</text>
<text x="180" y="22" class="tm">doubly linked list: most recent at the front</text>
<rect x="180" y="34" width="50" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="205" y="53" text-anchor="middle" class="tm">head</text>
<line x1="232" y1="48" x2="268" y2="48" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="270" y="34" width="50" height="28" class="fg sg"/><text x="295" y="53" text-anchor="middle">a</text>
<line x1="322" y1="48" x2="358" y2="48" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/><line x1="358" y1="58" x2="322" y2="58" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="360" y="34" width="50" height="28" class="fb sb"/><text x="385" y="53" text-anchor="middle">b</text>
<line x1="412" y1="48" x2="448" y2="48" stroke="currentColor" marker-end="url(#dsa-ll-ar)"/>
<rect x="450" y="34" width="50" height="28" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="475" y="53" text-anchor="middle" class="tm">tail</text>
<path d="M120,42 Q200,80 270,64" fill="none" class="sg" stroke-dasharray="3 3"/>
<text x="295" y="88" text-anchor="middle" class="tg">most recent</text><text x="385" y="88" text-anchor="middle" class="tm">evict from here</text>
<text x="10" y="118" class="tm">get("b"): dict finds node b in O(1); unlink it and re-insert after head in O(1).</text>
</svg><figcaption>Two dummy nodes (head, tail) mean every real node always has a prev and a next, so unlink/insert never needs special cases.</figcaption></figure>
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

c = LRUCache(2)
c.put(1, 1); c.put(2, 2)
print("get 1:", c.get(1))        # 1 becomes most recent
c.put(3, 3)                      # evicts 2
print("get 2:", c.get(2))
c.put(4, 4)                      # evicts 1
print("get 1:", c.get(1), "| get 3:", c.get(3), "| get 4:", c.get(4))</div>
  <div class="fx" data-lang="text">get 1: 1
get 2: -1
get 1: -1 | get 3: 3 | get 4: 4</div>
  <p>In production Python you would use <code>collections.OrderedDict</code> (<code>move_to_end</code> + <code>popitem(last=False)</code>) or <code>functools.lru_cache</code>, which do the same thing inside. Cache design, hit rates and eviction policies (LFU, TTL) are covered in the system design notes.</p>

  <h2 id="dsa-ll-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Array vs linked list: when would you pick each?</summary><div class="qa-body">Array (Python list): need index access, mostly append at the end, cache-friendly, less memory. Linked list: many inserts/deletes in the middle or at the front while holding a node, never need "item number i". In Python, reach for <code>deque</code> for a queue and a list for almost everything else.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Complexity of reading the 100th node, inserting at the head, and inserting after a node you hold?</summary><div class="qa-body">O(n) (walk 100 hops), O(1), O(1). The last two are O(1) because only pointers change, nothing shifts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Python's list.insert(0, x) O(n) if a list is "like" a linked list?</summary><div class="qa-body">It isn't a linked list. A Python list is a dynamic array: one contiguous block. Inserting at the front shifts every element right. <code>deque.appendleft</code> is O(1) because deque is a doubly linked chain of blocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Reverse a linked list in place. What are the three pointers for?</summary><div class="qa-body"><code>prev</code> = the reversed part so far, <code>cur</code> = node being flipped, <code>nxt</code> = saved copy of <code>cur.next</code> so you can keep walking after the flip. Loop: <code>nxt = cur.next; cur.next = prev; prev, cur = cur, nxt</code>. Return <code>prev</code>. O(n) time, O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dummy head and why use it?</summary><div class="qa-body">A fake node placed before the real head. It guarantees every real node has a predecessor, so deleting or inserting at the head uses the same code as any other position. Return <code>dummy.next</code> at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect a cycle in O(1) space, and why does it work?</summary><div class="qa-body">Floyd's fast/slow pointers: slow moves 1, fast moves 2. If fast hits None, no cycle. Inside a cycle, fast gains one node on slow every step, so the gap shrinks to 0 and they land on the same node. O(n) time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Middle of a list with 6 nodes using fast/slow: which middle do you get?</summary><div class="qa-body">The second one (node 4 of 1…6). Slow: 1→2→3→4, fast: 1→3→5→None. To get the first middle, start fast at <code>head.next</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Remove the nth node from the end in one pass. Why n + 1 steps for the lead pointer?</summary><div class="qa-body">Start both at a dummy. Moving lead n + 1 steps makes the gap n + 1, so when lead becomes None, trail is at the node <em>before</em> the target, which is what you need to re-link (<code>trail.next = trail.next.next</code>). Starting at dummy handles removing the head.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge two sorted lists: complexity and why no new nodes?</summary><div class="qa-body">O(n + m) time, O(1) extra space. You only re-point <code>next</code> on existing nodes through a running <code>tail</code>; when one list ends, attach the other's remainder in one step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does an LRU cache need both a dict and a doubly linked list?</summary><div class="qa-body">The dict gives O(1) lookup from key to node. The doubly linked list keeps recency order and lets you unlink a node and move it to the front in O(1), because the node knows both its neighbours. A singly list would need O(n) to find the previous node; a dict alone has no order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why avoid recursion on linked lists in Python?</summary><div class="qa-body">Each node adds one stack frame, and Python's default recursion limit is about 1000. A list of 10,000 nodes raises RecursionError. Loops are O(1) space and have no limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes wrong with <code>while fast.next</code> instead of <code>while fast and fast.next</code>?</summary><div class="qa-body">On an even-length list fast becomes None after <code>fast.next.next</code>, and the next check reads <code>None.next</code>, raising AttributeError. Check <code>fast</code> first.</div></details>
</main>`
});
