// notes/dsa/dsa_linkedlist.js — Linked Lists
Object.assign(TOPIC_CONTENT, {
  "dsa_linkedlist": `<main>
<h1>Linked Lists</h1>
  <div class="where"><span>DSA</span><span>Linear structures</span><span>Linked Lists</span></div>
  <p class="lead">A linked list stores a sequence not in one block of numbered slots, like a Python list, but as a chain of small separate objects, each holding one value and a reference to the next one. That makes adding or removing an item at the front, or next to an item you already hold, very cheap, at the price of losing the ability to jump straight to "item number 500". Linked lists matter in real work because queues, caches and undo histories are built on them (Python's <code>deque</code> and <code>OrderedDict</code> are linked inside), and they matter in interviews because they test whether you can manipulate references without losing data. Our running example is Biteful's delivery queue: orders waiting for riders, with the charges from earlier notes, <b>120 → 80 → 250 → 40 → 310</b>. We start with a real problem on that queue, VIP orders that must jump to the front, and build every technique on the page from it, ending with the LRU cache that the Biteful app uses to remember recently viewed orders.</p>

  <h2 id="dsa-ll-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linked Lists</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What and why</div>
        <ul>
          <li><b>Node</b> = value + <code>next</code>; the last <code>next</code> is None</li>
          <li>You hold only the <b>head</b>; lose it and the list is gone</li>
          <li>O(1) insert/delete at the front or after a held node; O(n) to reach position i</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core techniques</div>
        <ul>
          <li><b>Dummy head</b>: fake node in front, return <code>dummy.next</code></li>
          <li><b>Reverse</b>: save <code>nxt</code>, flip, slide; return <code>prev</code></li>
          <li><b>Fast and slow</b>: middle, cycles, nth from the end</li>
          <li><b>Merge</b>: dummy + tail, take the smaller head</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Doubly linked</div>
        <ul>
          <li><code>prev</code> and <code>next</code>: remove a held node in O(1), walk backwards</li>
          <li>Sentinels at both ends remove special cases</li>
          <li>Python: <code>collections.deque</code>, <code>OrderedDict</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LRU cache</div>
        <ul>
          <li>dict key → node for O(1) lookup</li>
          <li>doubly list for recency: touch = move to front, evict from back</li>
          <li>The node stores its key so eviction can delete it from the dict</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-ll-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Linked Lists Exist</span><span class="rm-sub">VIP orders at the front of a 2-lakh queue</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-nodes"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Nodes and Pointers</span><span class="rm-sub">value, next, head and None</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-ops"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Traverse, Insert, Delete</span><span class="rm-sub">what each operation costs, and why order matters</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-dummy"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Dummy Head</span><span class="rm-sub">one loop for every position, including the head</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-reverse"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Reversing a List</span><span class="rm-sub">flipping every arrow without losing the rest</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-fastslow"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Fast and Slow Pointers</span><span class="rm-sub">middle, cycles, nth from the end</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-merge"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Merging Two Sorted Lists</span><span class="rm-sub">lunch and dinner queues into one</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-types"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Doubly Linked Lists</span><span class="rm-sub">prev pointers, sentinels, deque</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-lru"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The LRU Cache</span><span class="rm-sub">a dict and a doubly linked list together</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">from the problem's wording to the technique</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">what to practise, in order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">lost nodes, wrong head, None.next</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">costs, templates, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ll-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on linked lists</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ll-need"><span class="num">01</span>Why Linked Lists Exist</h2>
  <p>Biteful's dispatch screen holds a queue of orders waiting for riders. Normal orders join at the back. Orders from Biteful Gold members are VIP and must jump to the <strong>front</strong>. On a busy evening the queue holds 2 lakh (200,000) orders. The obvious way to store the queue is a Python list, using <code>append</code> for normal orders and <code>insert(0, x)</code> for VIPs. Let us time both, and compare with <code>collections.deque</code>, a structure from the standard library. Timings are approximate and vary by machine.</p>
  <div class="fx" data-lang="py">import timeit
from collections import deque

n = 200_000
queue = list(range(n))                     # 2 lakh orders waiting
t_back  = timeit.timeit(lambda: queue.append(1),    number=1000)
t_front = timeit.timeit(lambda: queue.insert(0, 1), number=1000)
dq = deque(range(n))
t_dq    = timeit.timeit(lambda: dq.appendleft(1),   number=1000)
print(f"1000 orders at the back  (list.append)      : {t_back * 1000:6.2f} ms")
print(f"1000 VIPs at the front   (list.insert(0, x)): {t_front * 1000:6.2f} ms")
print(f"1000 VIPs at the front   (deque.appendleft) : {t_dq * 1000:6.2f} ms")</div>
  <div class="fx" data-lang="text">1000 orders at the back  (list.append)      :   0.06 ms
1000 VIPs at the front   (list.insert(0, x)):  45.86 ms
1000 VIPs at the front   (deque.appendleft) :   0.06 ms</div>
  <p>A thousand VIP inserts at the front of the list took hundreds of times longer than a thousand appends at the back, while the deque handled front inserts as cheaply as appends. The reason is how a Python list is stored. It is one contiguous block of memory with numbered slots (the Complexity note drew it). Appending fills the next free slot at the end. But putting something into slot 0 means every one of the 2 lakh existing items must first move one slot to the right to make room, so each front insert is O(n). The deque does not store its items in one row; it keeps them in linked pieces, so adding at the front never moves anything. That idea, in its simplest form, is the <strong>linked list</strong>.</p>
  <p>A train is a good picture. It is a line of coaches, each hooked to the next. To add a coach at the front, the staff hook it on, and no other coach moves. But if you want coach number 9, you must walk from the engine and count, because there is no way to jump straight to it. A Python list is the opposite, more like a cinema row with numbered seats: finding seat 9 is instant, but squeezing a new person into seat 0 makes everyone shift along.</p>
  <table class="tbl">
    <tr><th>Need</th><th>Python list (array)</th><th>Linked list</th></tr>
    <tr><td>Read item number i</td><td>O(1), jump to the slot</td><td>O(i), walk from the front</td></tr>
    <tr><td>Insert or delete at the front</td><td>O(n), shift everything</td><td>O(1)</td></tr>
    <tr><td>Insert or delete next to an item you hold</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Memory per item</td><td>one slot</td><td>value plus at least one reference</td></tr>
  </table>
  <p>So a linked list is not simply "faster". It wins only for changes at the front or next to a position you already have, and it loses for reading by position, scanning and memory use. In everyday Python you use a list or a deque and rarely write your own nodes; you write them in interviews and when building structures like the LRU cache at the end of this page.</p>

  <h2 id="dsa-ll-nodes"><span class="num">02</span>Nodes and Pointers</h2>
  <p>Without numbered slots, how does the program know which order comes after 120, or where the queue begins and ends? Each item carries that information itself. A <strong>node</strong> is a tiny object with two fields: <code>val</code>, the value (here, the order's charge), and <code>next</code>, a reference to the node that follows it. A <strong>pointer</strong> is simply a variable that refers to a node; in Python every variable that holds an object is a reference, so "pointer" just means "a variable holding a node". The last node's <code>next</code> is <code>None</code>, which marks the end. The first node is called the <strong>head</strong>, and it is the only thing the program keeps hold of: from the head, every other node can be reached by following <code>next</code>.</p>
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
  <p>In code, a node is a small class with two attributes. The queue below is built by nesting: the node holding 120 is created with its <code>next</code> already pointing at the node holding 80, and so on. To read the queue we <strong>traverse</strong> it: start a second variable <code>cur</code> at the head and keep following <code>next</code> until it becomes <code>None</code>.</p>
  <div class="fx" data-lang="py">class Node:
    def __init__(self, val, next=None):
        self.val = val                 # the order's charge
        self.next = next               # the node behind it, or None

# Biteful's delivery queue: 120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
head = Node(120, Node(80, Node(250, Node(40, Node(310)))))

cur = head                             # walk: start at the head, follow next until None
while cur:
    print(cur.val, end=" -&gt; ")
    cur = cur.next
print("None")
print(head.val, head.next.val, head.next.next.val)</div>
  <div class="fx" data-lang="text">120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
120 80 250</div>
  <p>Each <code>.next</code> hop moves one order along: <code>head.next.val</code> is 80 and <code>head.next.next.val</code> is 250. Notice that the walk uses <code>cur</code>, not <code>head</code>. If we had written <code>head = head.next</code> in the loop, then after the loop nothing would point to the first node any more, and the start of the queue would be lost for good. Typing nested <code>Node(...)</code> calls quickly gets tiring, so the rest of the page uses two small helpers: <code>build</code> turns a Python list into a chain, and <code>show</code> turns a chain into text. <code>show</code> stops after 20 nodes, so that a chain that accidentally loops back on itself cannot hang the program.</p>
  <div class="fx" data-lang="py">def build(values):                     # Python list -&gt; chain of nodes
    head = None
    for v in reversed(values):         # build from the back: each new node points at the old head
        head = Node(v, head)
    return head

def show(head, limit=20):              # chain -&gt; text; the limit stops a looped chain
    out, cur = [], head
    while cur and len(out) &lt; limit:
        out.append(str(cur.val))
        cur = cur.next
    return " -&gt; ".join(out) + (" -&gt; None" if cur is None else " -&gt; ...")

print(show(build([120, 80, 250, 40, 310])))</div>
  <div class="fx" data-lang="text">120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None</div>
  <p><code>build</code> works from the back: it creates 310 first, then 40 pointing at 310, then 250 pointing at 40, and so on, so each new node simply points at the previous head. The <strong>tail</strong> is the last node, the one whose <code>next</code> is <code>None</code>.</p>

  <h2 id="dsa-ll-ops"><span class="num">03</span>Traverse, Insert, Delete</h2>
  <p>Now we can measure the promise from section 01. Reading is the weak side. A linked list has no index, so finding a value, or reaching "item number i", means walking from the head one hop at a time:</p>
  <div class="fx" data-lang="py">def find(head, target):
    steps, cur = 0, head
    while cur:
        steps += 1
        if cur.val == target:
            return steps
        cur = cur.next
    return steps

def get(head, i):                      # "item number i": no index, so walk i hops
    cur = head
    for _ in range(i):
        cur = cur.next
    return cur.val

q = build([120, 80, 250, 40, 310])
print("steps to find 40:", find(q, 40), "| steps to miss 999:", find(q, 999), "| item 3:", get(q, 3))</div>
  <div class="fx" data-lang="text">steps to find 40: 4 | steps to miss 999: 5 | item 3: 40</div>
  <p>Finding 40 took 4 hops, a value that is not there (999) took all 5, and item number 3 needed 3 hops. Reading by value or by position is therefore <strong>O(n)</strong>.</p>
  <p>Changes are the strong side. Every change to a linked list is just "make some <code>next</code> point somewhere else"; no value ever moves. Three operations cover almost everything. To <strong>push to the front</strong>, create a node whose <code>next</code> is the old head, and make it the new head. To <strong>insert after</strong> a node you hold, the new node first takes over that node's <code>next</code>, and then the node is pointed at the new node. To <strong>delete after</strong> a node, point it past its neighbour: <code>node.next = node.next.next</code>. The pictures show the insert and the delete.</p>
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
</svg><figcaption>Cancel 250. Nothing moves: the node in front of it simply points past it. With nothing pointing to it any more, Python frees the 250 node.</figcaption></figure>
  <p>Here are the three operations on the queue: a VIP order ₹999 jumps the queue, an order of ₹60 is placed right after the 80, and then the ₹250 order is cancelled.</p>
  <div class="fx" data-lang="py">def push_front(head, val):             # VIP order: O(1), nothing shifts
    return Node(val, head)             # the new node points at the old head

def insert_after(node, val):
    new = Node(val)
    new.next = node.next               # 1. the new node grabs the rest of the chain
    node.next = new                    # 2. the node in front points to the new node

def delete_after(node):
    if node.next:
        node.next = node.next.next     # skip one node; nothing moves

q = build([120, 80, 250, 40, 310])
q = push_front(q, 999)
print("VIP at front:", show(q))
eighty = q.next.next                   # the node holding 80
insert_after(eighty, 60)
print("60 after 80 :", show(q))
delete_after(eighty.next)              # the node after 60 is 250: cancel it
print("250 removed :", show(q))</div>
  <div class="fx" data-lang="text">VIP at front: 999 -&gt; 120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
60 after 80 : 999 -&gt; 120 -&gt; 80 -&gt; 60 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; None
250 removed : 999 -&gt; 120 -&gt; 80 -&gt; 60 -&gt; 40 -&gt; 310 -&gt; None</div>
  <p>Each operation changed one or two references and took the same tiny time whether the queue had five orders or five million. That is <strong>O(1)</strong>, with one important condition: you must already hold the node next to where the change happens. Inserting at position i costs O(i), because you must first walk there; only the re-linking itself is O(1). Also notice that deleting needs the node <em>before</em> the one being removed, since that is the node whose <code>next</code> changes. Keep that in mind; it causes the problem the next section solves.</p>
  <p>The order of the two lines in <code>insert_after</code> is not a matter of style. Here is what happens when they are swapped:</p>
  <div class="fx" data-lang="py">q = build([120, 80, 250])
node, new = q, Node(60)                # insert 60 after 120, in the WRONG order
node.next = new                        # 1. 120 now points to 60 ...
new.next = node.next                   # 2. ... so 60 points to itself; 80 and 250 are lost
print(show(q, limit=6))</div>
  <div class="fx" data-lang="text">120 -&gt; 60 -&gt; 60 -&gt; 60 -&gt; 60 -&gt; 60 -&gt; ...</div>
  <p>The first line made 120 point at 60, so at that moment nothing pointed at 80 any more. The second line then read <code>node.next</code>, which is now 60 itself, and made 60 point at itself. The 80 and 250 orders are unreachable, and the chain loops on 60 forever (the limit in <code>show</code> stopped the printing). This is the central danger of all linked-list code: the moment you overwrite a <code>next</code>, whatever it pointed to is gone unless some other variable still refers to it. The safe habit is to draw the before and after pictures, then write the changes in an order that never leaves a node without a reference.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Singly linked</th><th>Why</th></tr>
    <tr><td>Read item i, search for a value</td><td>O(n)</td><td>walk from the head</td></tr>
    <tr><td>Insert or delete at the head</td><td>O(1)</td><td>change the head reference</td></tr>
    <tr><td>Insert or delete after a held node</td><td>O(1)</td><td>one or two reference changes</td></tr>
    <tr><td>Delete a held node itself</td><td>O(n)</td><td>must first find the node before it</td></tr>
    <tr><td>Append at the tail</td><td>O(n), or O(1) if you keep a tail reference</td><td>walking to the end costs n</td></tr>
  </table>

  <h2 id="dsa-ll-dummy"><span class="num">04</span>The Dummy Head</h2>
  <p>Biteful needs to remove every cancelled ₹80 order from the queue 80 → 120 → 80 → 250. Deleting needs the node before the one being removed, and for the second 80 that is easy: the 120 node points past it. But the first 80 is the head, and the head has no node before it. Removing it means changing the head variable itself, which needs separate code, and that special case ("what if the node to change is the first one?") is the source of most linked-list bugs.</p>
  <p>The fix is a small trick: put a fake node, the <strong>dummy head</strong> (also called a <strong>sentinel</strong>), in front of the real head before you start. Now every real node, including the first one, has a node before it, so one loop handles every position. When the loop finishes, the real head is whatever <code>dummy.next</code> points to, even if the original head was removed. Think of a queue at a ticket counter with a permanent "queue starts here" sign: nobody ever has to ask "am I first?", because everybody has someone, or the sign, in front of them.</p>
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
  <p>The loop keeps a pointer <code>prev</code>, starting at the dummy, and always looks at <code>prev.next</code>. If that node is a cancelled 80, it is unlinked and <code>prev</code> stays where it is, because the node that has just slid into <code>prev.next</code> might be another 80. Otherwise <code>prev</code> moves on. The dummy's own value is 0, which is what the trace prints for it.</p>
  <div class="fx" data-lang="py">def remove_all(head, val):
    dummy = Node(0, head)              # fake node in front of the real head
    prev = dummy
    while prev.next:
        if prev.next.val == val:
            print(f"  prev={prev.val:&gt;3}: next is {val}, skip it")
            prev.next = prev.next.next # unlink it; prev stays (the new next may also be val)
        else:
            print(f"  prev={prev.val:&gt;3}: next is {prev.next.val}, keep it and move on")
            prev = prev.next
    return dummy.next                  # the real head, even if it changed

print(show(remove_all(build([80, 120, 80, 250]), 80)))
print(show(remove_all(build([80, 80]), 80)))</div>
  <div class="fx" data-lang="text">  prev=  0: next is 80, skip it
  prev=  0: next is 120, keep it and move on
  prev=120: next is 80, skip it
  prev=120: next is 250, keep it and move on
120 -&gt; 250 -&gt; None
  prev=  0: next is 80, skip it
  prev=  0: next is 80, skip it
 -&gt; None</div>
  <p>Read the first trace. With <code>prev</code> at the dummy, the next node is the head 80, so it is skipped: the dummy now points at 120. No special code was needed for removing the head. Then 120 is kept, the second 80 is skipped, and 250 is kept, leaving 120 → 250. The second run, <code>[80, 80]</code>, removes every node: the dummy ends up pointing at <code>None</code>, so the function correctly returns an empty list. The dummy costs one extra node, and the whole removal is <strong>O(n) time and O(1) extra space</strong>.</p>
  <p>The general shape is worth memorising, because it reappears in merging, partitioning and removing the nth node from the end:</p>
  <div class="fx" data-lang="text">dummy = Node(0, head)
prev = dummy
while prev.next:
    if should_remove(prev.next): prev.next = prev.next.next     # prev stays
    else:                        prev = prev.next
return dummy.next</div>
  <p>In interviews, reach for a dummy head whenever the head might change: "remove all nodes with value…", "delete duplicates", "partition the list", "merge", "insert into a sorted list" and "remove the nth node from the end".</p>

  <h2 id="dsa-ll-reverse"><span class="num">05</span>Reversing a List</h2>
  <p>For an end-of-day report, dispatch wants the queue newest first: 120 → 80 → 250 → 40 must become 40 → 250 → 80 → 120. We could copy the values into a Python list, reverse it and build new nodes, but that uses O(n) extra space, and interviewers want the in-place version that only re-points the existing arrows. The difficulty is the danger from section 03. If we flip 120's arrow to point at <code>None</code> (it will be the new tail), we immediately lose our only way to reach 80, 250 and 40.</p>
  <p>The solution walks the list once with three pointers. <code>prev</code> is the front of the part already reversed (initially nothing, <code>None</code>). <code>cur</code> is the node being flipped. <code>nxt</code> is a saved reference to the rest of the chain, taken <em>before</em> the flip. Each step does three things: save, flip, slide. It is like turning round a line of people who are holding the shoulder of the person in front: before you let go of the person ahead and turn to face the person behind, you note who was ahead, so you can move on to them next.</p>
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
  <p>The picture freezes step 2: 120 has already been reversed (it points to <code>None</code>), <code>cur</code> is at 80, and <code>nxt</code> has saved 250 before 80's arrow is turned to point back at 120.</p>
  <div class="fx" data-lang="py">def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next                 # 1. save the rest of the chain
        cur.next = prev                # 2. flip this node's arrow backwards
        print(f"flipped {cur.val} -&gt; {prev.val if prev else None};  "
              f"next up: {nxt.val if nxt else None}")
        prev, cur = cur, nxt           # 3. slide both one step forward
    return prev                        # prev is the new head

print(show(reverse(build([120, 80, 250, 40]))))</div>
  <div class="fx" data-lang="text">flipped 120 -&gt; None;  next up: 80
flipped 80 -&gt; 120;  next up: 250
flipped 250 -&gt; 80;  next up: 40
flipped 40 -&gt; 250;  next up: None
40 -&gt; 250 -&gt; 80 -&gt; 120 -&gt; None</div>
  <p>The trace shows each flip. 120 is flipped to <code>None</code>, with 80 saved as next up. 80 is flipped to point at 120, with 250 saved. 250 is flipped to 80, and finally 40 is flipped to 250. At that point <code>cur</code> becomes <code>None</code> and the loop stops, with <code>prev</code> on 40, the new head. The function must return <code>prev</code>; the old <code>head</code> variable still refers to 120, which is now the tail. Reversal visits each node once and uses three variables, so it is <strong>O(n) time and O(1) extra space</strong>. A recursive version also exists, but it uses one stack frame per node, O(n) space, and Python stops recursion at about 1,000 frames, so a long list would crash it.</p>
  <div class="fx" data-lang="text">prev, cur = None, head
while cur:
    nxt = cur.next; cur.next = prev; prev, cur = cur, nxt
return prev                          # the new head</div>
  <p>Wording that points to reversal: "reverse the list", "reverse between positions m and n", "reverse in groups of k", "is the list a palindrome?" (reverse the second half and compare), and "reorder the list".</p>

  <h2 id="dsa-ll-fastslow"><span class="num">06</span>Fast and Slow Pointers</h2>
  <p>Many questions need a position in the list: the middle order, or the order k places from the end. A linked list does not know its own length, so the obvious method is two passes, one to count and one to walk to the position. Worse, if a bug has made the last node point back into the queue, a walk never reaches <code>None</code>, so we cannot even count. The <strong>fast and slow pointer</strong> technique (also called the tortoise and hare) answers all of these in one pass and O(1) space by moving two pointers through the same list at different speeds or with a fixed gap between them.</p>
  <p>Start with the middle. <code>slow</code> moves one node per step and <code>fast</code> moves two. When fast reaches the end, slow has covered exactly half the distance, so it is at the middle.</p>
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
    while fast and fast.next:          # both checks, or fast.next.next can crash
        slow = slow.next               # one step
        fast = fast.next.next          # two steps
    return slow

print(middle(build([120, 80, 250, 40, 310])).val)
print(middle(build([120, 80, 250, 40, 310, 80])).val)</div>
  <div class="fx" data-lang="text">250
40</div>
  <p>On the five-order queue, slow moves to 80 and then 250 while fast moves to 250 and then 310; fast cannot take two more steps, so slow stops at 250, the middle. With a sixth order added, the list has two middles, 250 and 40, and this loop returns the second one, 40. If a problem wants the first middle, start <code>fast</code> at <code>head.next</code>. The loop condition <code>while fast and fast.next</code> needs both parts: on an even-length list <code>fast</code> itself becomes <code>None</code>, and on an odd-length one <code>fast.next</code> does, and in either case <code>fast.next.next</code> would crash.</p>
  <p>Now cycles. A <strong>cycle</strong> means some node's <code>next</code> points back to an earlier node, so the chain never ends. Imagine a bug sets 310's <code>next</code> to the 80 node instead of <code>None</code>. Put slow and fast on it. If there is no cycle, fast simply reaches <code>None</code>. If there is one, both pointers eventually enter the loop, and from then on fast gains exactly one node on slow at every step, so the gap between them shrinks by one each step until it reaches zero and they stand on the same node. This is <strong>Floyd's cycle detection</strong>. Picture two runners on a circular track, one twice as fast: the fast one always catches the slow one from behind, whereas on a straight road it just reaches the end first.</p>
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
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        print(f"  slow={slow.val:&gt;3} fast={fast.val:&gt;3}  same node? {slow is fast}")
        if slow is fast:
            return True
    return False

q = build([120, 80, 250, 40, 310])
q.next.next.next.next.next = q.next    # BUG: 310 points back to 80 instead of None
print(show(q, limit=9))
print(has_cycle(q))
print(has_cycle(build([120, 80, 250])))</div>
  <div class="fx" data-lang="text">120 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; 80 -&gt; 250 -&gt; 40 -&gt; 310 -&gt; ...
  slow= 80 fast=250  same node? False
  slow=250 fast=310  same node? False
  slow= 40 fast=250  same node? False
  slow=310 fast=310  same node? True
True
  slow= 80 fast=250  same node? False
False</div>
  <p>The first line shows the broken queue going round and round (stopped by <code>show</code>'s limit). Then slow visits 80, 250, 40, 310 while fast, moving two at a time around the loop, visits 250, 310, 250, 310; after four steps both are on the 310 node, so there is a cycle. On a healthy three-order queue, fast falls off the end after one step and the answer is False. Notice the comparison is <code>slow is fast</code>, which asks "is this the same node object?". Comparing values would be wrong, because our queue has two different nodes that both hold 80.</p>
  <p>A follow-up question (LeetCode 142) asks where the loop starts. After the two pointers meet, put one walker back at the head and move it and the slow pointer one step at a time; they meet exactly at the first node of the loop. The reason, briefly: if the loop starts L steps from the head, the meeting point turns out to be L steps (going round the loop) before the loop's start, so both walkers arrive there together.</p>
  <div class="fx" data-lang="py">def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:               # phase 1: they meet somewhere inside the loop
            p = head                   # phase 2: one walker from the head, one from the meeting point
            while p is not slow:
                p, slow = p.next, slow.next
            return p                   # they meet where the loop starts
    return None

q = build([120, 80, 250, 40, 310])
q.next.next.next.next.next = q.next    # 310 -&gt; 80 again
print("loop starts at", cycle_start(q).val)</div>
  <div class="fx" data-lang="text">loop starts at 80</div>
  <p>From the meeting point 310, one step reaches 80; from the head 120, one step also reaches 80. The loop starts at 80, which is the node the bug pointed back to.</p>
  <p>The third use keeps the two pointers at the same speed but a fixed distance apart. To remove the nth node from the end in one pass (LeetCode 19), start both <code>lead</code> and <code>trail</code> at a dummy, move <code>lead</code> n + 1 steps ahead, and then move both together until <code>lead</code> falls off the end. Because the gap stays n + 1, <code>trail</code> stops on the node just <em>before</em> the one to remove, which is exactly the node we need in order to unlink it. Starting at a dummy means the head itself can be removed with no special case.</p>
  <div class="fx" data-lang="py">def remove_nth_from_end(head, n):
    dummy = Node(0, head)
    lead = trail = dummy
    for _ in range(n + 1):             # open a gap of n + 1 nodes
        lead = lead.next
    while lead:                        # move both until lead falls off the end
        lead, trail = lead.next, trail.next
    trail.next = trail.next.next       # trail is just before the target
    return dummy.next

print(show(remove_nth_from_end(build([120, 80, 250, 40, 310]), 2)))   # 2nd from the end: 40
print(show(remove_nth_from_end(build([120, 80]), 2)))                 # removes the head itself</div>
  <div class="fx" data-lang="text">120 -&gt; 80 -&gt; 250 -&gt; 310 -&gt; None
80 -&gt; None</div>
  <p>Removing the 2nd order from the end of 120 → 80 → 250 → 40 → 310 removes 40. The second test removes the 2nd from the end of a two-node list, which is the head; the dummy handles it. All the uses in this section run in <strong>O(n) time and O(1) space</strong>; the obvious alternative for cycles, remembering every visited node in a set, needs O(n) space. Wording that points here: "middle", "cycle", "loop", "where does the cycle begin", "nth from the end", "in one pass", "O(1) extra space".</p>

  <h2 id="dsa-ll-merge"><span class="num">07</span>Merging Two Sorted Lists</h2>
  <p>Dispatch now has two queues, one from the lunch shift and one from the dinner shift, each already sorted by amount: lunch 40 → 80 → 120 → 250 and dinner 60 → 80 → 200 → 310. It wants one sorted queue. Copying everything into a Python list and sorting it would cost O((n + m) log(n + m)) time and new storage, and it ignores the fact that both queues are already sorted. Instead we can do what you would do with two sorted piles of bills: look at the top of each pile, take the smaller, and repeat.</p>
  <p>With linked lists this needs no new nodes at all: we just re-link the existing ones. A <code>tail</code> pointer marks the last node of the merged chain so far, and each step attaches the smaller front node to it. A dummy node at the start avoids a special case for "which list provides the first node?". When one list runs out, the rest of the other is already sorted and linked, so it is attached in a single step.</p>
  <div class="fx" data-lang="py">def merge_two(a, b):
    dummy = tail = Node(0)             # tail = last node of the merged chain so far
    while a and b:
        if a.val &lt;= b.val:
            tail.next, a = a, a.next   # re-link lunch's front node
        else:
            tail.next, b = b, b.next   # re-link dinner's front node
        tail = tail.next
        print(f"  took {tail.val:&gt;3}")
    tail.next = a or b                 # one list ran out: attach the rest of the other
    return dummy.next

lunch = build([40, 80, 120, 250])
dinner = build([60, 80, 200, 310])
print(show(merge_two(lunch, dinner)))</div>
  <div class="fx" data-lang="text">  took  40
  took  60
  took  80
  took  80
  took 120
  took 200
  took 250
40 -&gt; 60 -&gt; 80 -&gt; 80 -&gt; 120 -&gt; 200 -&gt; 250 -&gt; 310 -&gt; None</div>
  <p>The merge took 40 from lunch, 60 from dinner, then the lunch 80 (on a tie, <code>&lt;=</code> takes from the first list, which keeps equal items in their original order), then the dinner 80, 120, 200 and 250. At that point lunch was empty, so <code>tail.next = a or b</code> attached the remaining dinner node, 310, in one step. Forgetting that last line is a classic bug that silently drops the leftovers. The result is exactly the day's charges in sorted order, built from the original eight nodes. Merging is <strong>O(n + m) time and O(1) extra space</strong>. It is also the heart of merge sort on a linked list (LeetCode 148), and merging k sorted lists uses a heap to pick the smallest of k fronts (the <a class="xref" data-note="dsa_heaps">Heaps</a> note).</p>

  <h2 id="dsa-ll-types"><span class="num">08</span>Doubly Linked Lists</h2>
  <p>Everything so far moves forward only, and removing a node requires the node before it. That is a real limitation. When a customer cancels and the app holds a reference to exactly their order's node, a singly linked list must walk from the head to find the node in front of it, which is O(n). And reading the queue newest-first would need a full reversal.</p>
  <p>A <strong>doubly linked list</strong> gives each node two references: <code>next</code> to the node after it, and <code>prev</code> to the node before it. Now a node can reach both neighbours on its own, so removing a held node is two reference changes, <code>node.prev.next = node.next</code> and <code>node.next.prev = node.prev</code>, in O(1), and the list can be walked in either direction. The cost is one extra reference per node and four references to update on every insert or remove instead of two.</p>
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
  <p>A doubly linked list is usually built with two sentinels, a HEAD dummy at the front and a TAIL dummy at the back, which are never removed. Then every real node always has a real <code>prev</code> and a real <code>next</code>, so inserting and removing never have to check for <code>None</code>. The whole class below fits in a few lines:</p>
  <div class="fx" data-lang="py">class DNode:
    def __init__(self, val=None):
        self.val, self.prev, self.next = val, None, None

class DoublyList:
    def __init__(self):
        self.head, self.tail = DNode("HEAD"), DNode("TAIL")   # two sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def _insert_between(self, node, a, b):                  # a &lt;-&gt; node &lt;-&gt; b
        node.prev, node.next = a, b
        a.next = node
        b.prev = node
        return node

    def push_back(self, val):  return self._insert_between(DNode(val), self.tail.prev, self.tail)
    def push_front(self, val): return self._insert_between(DNode(val), self.head, self.head.next)

    def remove(self, node):                                 # O(1): the node knows both neighbours
        node.prev.next = node.next
        node.next.prev = node.prev

    def backward(self):
        out, cur = [], self.tail.prev
        while cur is not self.head:
            out.append(cur.val); cur = cur.prev
        return out

q = DoublyList()
nodes = {v: q.push_back(v) for v in [120, 80, 250, 40]}
q.push_front(999)                      # VIP order
q.remove(nodes[250])                   # cancel 250, holding only its node
print(q.backward())</div>
  <div class="fx" data-lang="text">[40, 80, 120, 999]</div>
  <p>After adding four orders, pushing a VIP order to the front and cancelling 250 while holding only its node, reading backwards from TAIL gives 40, 80, 120, 999. The removal involved no walking, and the backward read needed no reversing. Python's <code>collections.deque</code>, which we timed in section 01, is a doubly linked chain of small blocks, so it gives O(1) adds and removes at both ends:</p>
  <div class="fx" data-lang="py">from collections import deque
d = deque([120, 80, 250])
d.appendleft(999)                      # VIP at the front, O(1)
d.append(40)                           # normal order at the back, O(1)
print(d)
print(d.popleft(), d.pop(), d)         # remove from both ends, O(1)</div>
  <div class="fx" data-lang="text">deque([999, 120, 80, 250, 40])
999 40 deque([120, 80, 250])</div>
  <p>In real Python code, use <code>deque</code> whenever you need a queue or need to add and remove at both ends. One warning: <code>deque</code> is for the ends. Reading <code>d[i]</code> in the middle is O(n), because it still has to walk.</p>
  <table class="tbl">
    <tr><th></th><th>Singly linked</th><th>Doubly linked</th></tr>
    <tr><td>References per node</td><td>1 (<code>next</code>)</td><td>2 (<code>prev</code>, <code>next</code>)</td></tr>
    <tr><td>Delete a node you hold</td><td>O(n): find the node before it</td><td>O(1)</td></tr>
    <tr><td>Walk backwards</td><td>No</td><td>Yes</td></tr>
    <tr><td>Typical uses</td><td>most interview problems, stacks</td><td>queues, LRU caches, browser history, <code>deque</code></td></tr>
  </table>

  <h2 id="dsa-ll-lru"><span class="num">09</span>The LRU Cache</h2>
  <p>The Biteful app keeps the full details of recently viewed orders in memory, so that opening one again is instant. Memory is limited, so it keeps only the most recent few, two in our example. The rule for what to throw out is <strong>LRU, least recently used</strong>: when the cache is full and a new order is viewed, the order that has gone unused for the longest is evicted. Both looking an order up (<code>get</code>) and adding one (<code>put</code>) must be O(1). This is one of the most asked design questions in interviews (LeetCode 146).</p>
  <p>Neither structure we know can do it alone. A dict finds any order in O(1), but it cannot tell us cheaply which entry was used least recently. A doubly linked list kept in order of use can move a node to the front and remove the last node in O(1), but finding the node for a given order means walking. So we use both. The dict maps each key to its node, for O(1) lookup. The doubly linked list keeps the nodes in order of recency, most recent just after the head sentinel and least recent just before the tail sentinel. Think of a small desk with room for two files: every file you use goes on top of the pile, and when a third file arrives the one at the bottom goes back to the cabinet; a sticky-note index telling you where each file is on the desk is the dict.</p>
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
  <p>Every <code>get</code> or <code>put</code> of a key moves its node to the front, which is an unlink and an add-at-front, both O(1) because the node knows its neighbours. When the dict grows past the capacity, the node just before the tail sentinel is the least recently used; it is unlinked and its key is deleted from the dict. That is why each node stores its key as well as its value: on eviction we hold only the node, and we need its key to remove the dict entry.</p>
  <div class="fx" data-lang="py">class DNode:
    def __init__(self, key=None, val=None):
        self.key, self.val, self.prev, self.next = key, val, None, None

class LRUCache:
    def __init__(self, capacity):
        self.cap, self.map = capacity, {}                 # key -&gt; node
        self.head, self.tail = DNode(), DNode()           # sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):                           # front = most recently used
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._unlink(node); self._add_front(node)        # touched: now the most recent
        return node.val

    def put(self, key, val):
        if key in self.map:
            self._unlink(self.map[key])
        node = DNode(key, val)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) &gt; self.cap:
            old = self.tail.prev                         # least recently used
            self._unlink(old)
            del self.map[old.key]                        # why the node stores its key

    def order(self):
        out, cur = [], self.head.next
        while cur is not self.tail:
            out.append(cur.key); cur = cur.next
        return out

cache = LRUCache(2)                    # remember the 2 most recently viewed orders
for op, *args in [("put", 101, 120), ("put", 102, 80), ("get", 101), ("put", 103, 250), ("get", 102)]:
    result = getattr(cache, op)(*args)
    call = f"{op}({', '.join(map(str, args))})"
    shown = "" if result is None else f"-&gt; {result}"
    print(f"{call:14} {shown:7} recent first: {cache.order()}")</div>
  <div class="fx" data-lang="text">put(101, 120)          recent first: [101]
put(102, 80)           recent first: [102, 101]
get(101)       -&gt; 120  recent first: [101, 102]
put(103, 250)          recent first: [103, 101]
get(102)       -&gt; -1   recent first: [103, 101]</div>
  <p>Follow the five operations. Orders 101 and 102 are added; 102 is now the most recent. Then 101 is viewed, which moves it to the front, so the order of recency becomes 101, 102. When 103 is added, the cache holds three orders, one more than its capacity, so the least recently used one is evicted. That is 102, not 101, precisely because viewing 101 a moment earlier made it recent. The final <code>get(102)</code> therefore misses and returns −1. Both operations are <strong>O(1)</strong>: one dict lookup plus a fixed number of reference changes. Space is O(capacity).</p>
  <p>In production Python you would not write this by hand. <code>collections.OrderedDict</code> is a dict with a doubly linked list inside it, and it offers <code>move_to_end</code> and <code>popitem(last=False)</code>, which are exactly the two operations we needed. (For caching a function's results, <code>functools.lru_cache</code> does all of it with one decorator.)</p>
  <div class="fx" data-lang="py">from collections import OrderedDict

class LRU:
    def __init__(self, cap):
        self.cap, self.d = cap, OrderedDict()
    def get(self, k):
        if k not in self.d:
            return -1
        self.d.move_to_end(k)          # most recent goes to the end
        return self.d[k]
    def put(self, k, v):
        self.d[k] = v
        self.d.move_to_end(k)
        if len(self.d) &gt; self.cap:
            self.d.popitem(last=False) # evict from the front: the oldest

c = LRU(2)
c.put(101, 120); c.put(102, 80); c.get(101); c.put(103, 250)
print(c.get(102), list(c.d))</div>
  <div class="fx" data-lang="text">-1 [101, 103]</div>
  <p>The same sequence of operations evicts 102 again, leaving 101 and 103. In an interview, though, you are usually asked to build the dict-plus-list version, because it shows that you understand why both parts are needed. The trigger words are "LRU", "least recently used", "cache with a capacity", "O(1) get and put" and "evict".</p>

  <h2 id="dsa-ll-patterns"><span class="num">10</span>Choosing the Pattern</h2>
  <p>Every technique on this page is really about one question: which pointers do you need to hold at the moment you make a change? To delete or insert, you need the node before the change, which is what <code>prev</code> and the dummy give you. To re-point an arrow without losing the rest, you need a saved <code>nxt</code>. To find a position you cannot index, you need a second pointer moving at another speed or a fixed distance ahead. To jump straight to any node, you need a dict that maps keys to nodes. When you meet a new linked-list problem, decide which pointers you need first, draw the before and after pictures, and only then write the loop. The table maps common wording to the technique.</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Pattern</th><th>Cost</th></tr>
    <tr><td>"remove", "delete", "insert", "partition", "the head may change"</td><td>Walk with <code>prev</code> from a dummy head; return <code>dummy.next</code></td><td>O(n), O(1) space</td></tr>
    <tr><td>"reverse", "palindrome list", "reorder", "in groups of k"</td><td>In-place reversal with <code>prev</code>, <code>cur</code>, <code>nxt</code></td><td>O(n), O(1) space</td></tr>
    <tr><td>"middle", "cycle", "loop", "where does the cycle start"</td><td>Fast and slow pointers, <code>while fast and fast.next</code></td><td>O(n), O(1) space</td></tr>
    <tr><td>"nth from the end", "kth last"</td><td>Two pointers with a gap of n + 1, from a dummy</td><td>O(n), one pass</td></tr>
    <tr><td>"merge sorted lists", "sort a linked list"</td><td>Dummy + tail, take the smaller front; merge sort for sorting</td><td>O(n + m); O(n log n) to sort</td></tr>
    <tr><td>"O(1) get and put", "cache", "most recently used", "evict"</td><td>Dict of key → node + doubly linked list</td><td>O(1) per operation</td></tr>
  </table>
  <p>One shortcut to avoid: copying the values into a Python list "to make it easy". It works, and it is still O(n) time, but it uses O(n) extra space and builds new nodes, and most linked-list questions exist precisely to see whether you can do the in-place pointer version. Combinations are common, too. Palindrome Linked List is "find the middle, reverse the second half, compare"; Reorder List (LeetCode 143) is "find the middle, reverse the second half, merge the two halves".</p>

  <h2 id="dsa-ll-problems"><span class="num">11</span>Classic Problems</h2>
  <p>The <a class="xref" data-note="dsa_problems">Problem Tracker</a> lists about 35 linked-list problems. A good order is to start with the five that interviewers ask most often, because each is one technique from this page in its purest form. <b>206 Reverse Linked List</b> is section 05 exactly; test it on an empty list and a single node. <b>21 Merge Two Sorted Lists</b> is section 07; test it with one or both lists empty. <b>141 Linked List Cycle</b> is Floyd's detection from section 06, and <b>876 Middle of the Linked List</b> is the middle loop from the same section (it wants the second middle, which is what our loop returns). <b>19 Remove Nth Node From End of List</b> is the gap-of-n technique; make sure your version passes the case where the head itself is removed.</p>
  <p>Then widen out. <b>203 Remove Linked List Elements</b> and <b>83</b>/<b>82 Remove Duplicates from Sorted List</b> practise the dummy head and the "prev stays after a removal" rule. <b>142 Linked List Cycle II</b> adds finding the start of the loop. <b>234 Palindrome Linked List</b> and <b>143 Reorder List</b> combine middle, reverse and merge. <b>92 Reverse Linked List II</b> reverses only a section and is much easier with a dummy. <b>707 Design Linked List</b> is a good place to build a doubly linked list with sentinels, and <b>146 LRU Cache</b> is section 09 as an interview question. For harder practice, <b>25 Reverse Nodes in k-Group</b> and <b>148 Sort List</b> (merge sort on a linked list) are standard.</p>

  <h2 id="dsa-ll-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common bug in reversal is returning the wrong node. After the loop, the original <code>head</code> variable still refers to the first node of the old list, which has become the last node of the new one:</p>
  <div class="fx" data-lang="py">def reverse_wrong(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next; cur.next = prev; prev, cur = cur, nxt
    return head                        # BUG: head is now the tail

print(show(reverse_wrong(build([120, 80, 250, 40]))))</div>
  <div class="fx" data-lang="text">120 -&gt; None</div>
  <p>Returning <code>head</code> gives a one-node list, 120 → None, and the other three orders are unreachable from it. The new head is <code>prev</code>. The most common crash in fast and slow pointer code is checking only <code>fast.next</code>:</p>
  <div class="fx" data-lang="py">def middle_wrong(head):
    slow = fast = head
    while fast.next:                   # BUG: forgot "fast and"
        slow, fast = slow.next, fast.next.next
    return slow

try:
    middle_wrong(build([120, 80, 250, 40]))
except AttributeError as e:
    print("AttributeError:", e)</div>
  <div class="fx" data-lang="text">AttributeError: 'NoneType' object has no attribute 'next'</div>
  <p>On a list with an even number of nodes, <code>fast</code> jumps two steps and lands on <code>None</code>, and the next check, <code>fast.next</code>, asks <code>None</code> for an attribute it does not have. The condition must be <code>while fast and fast.next</code>, in that order.</p>
  <p>The rest of the usual mistakes come from losing a reference or forgetting a case. Overwriting a <code>next</code> before saving what it pointed to loses the rest of the list, as the wrong-order insert in section 03 showed. Moving <code>head</code> itself while traversing loses the start of the list; walk with a separate <code>cur</code>. In the dummy-head removal loop, advancing <code>prev</code> after removing a node skips checking the node that just slid into place, so two adjacent 80s would leave one behind. Forgetting <code>tail.next = a or b</code> at the end of a merge drops the leftovers. Comparing node values instead of identity (<code>is</code>) gives false cycle reports when two nodes hold the same value. In a doubly linked list, updating <code>next</code> but forgetting <code>prev</code> leaves a list that reads correctly forwards and is broken backwards. In the LRU cache, forgetting to store the key in the node makes eviction impossible, and a <code>put</code> on an existing key must update and move that node rather than add a second one. Finally, recursive linked-list functions crash on long lists in Python because of the recursion limit of about 1,000; prefer loops.</p>

  <h2 id="dsa-ll-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Node</b>: an object holding a value and a reference (<code>next</code>) to the following node.</li>
    <li><b>Head</b>: the first node, the only one the program holds. <b>Tail</b>: the node whose <code>next</code> is None.</li>
    <li><b>Dummy head / sentinel</b>: a fake node placed before the head (or at both ends) so every real node has neighbours.</li>
    <li><b>Doubly linked list</b>: nodes with both <code>prev</code> and <code>next</code>.</li>
    <li><b>Cycle</b>: a <code>next</code> that points back to an earlier node, so the walk never reaches None.</li>
    <li><b>LRU cache</b>: a fixed-size cache that evicts the least recently used entry; dict + doubly linked list.</li>
  </ul>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Python list</th><th>Singly linked</th><th>Doubly linked</th></tr>
    <tr><td>Read item i</td><td>O(1)</td><td>O(n)</td><td>O(n)</td></tr>
    <tr><td>Insert/delete at the front</td><td>O(n)</td><td>O(1)</td><td>O(1)</td></tr>
    <tr><td>Insert/delete after a held node</td><td>O(n)</td><td>O(1)</td><td>O(1)</td></tr>
    <tr><td>Delete a held node itself</td><td>O(n)</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Append at the end</td><td>O(1) amortised</td><td>O(1) with a tail reference</td><td>O(1)</td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py">new.next = node.next; node.next = new              # insert after (this order!)
node.next = node.next.next                          # delete after

dummy = Node(0, head); prev = dummy                 # dummy head; return dummy.next

prev, cur = None, head                              # reverse; return prev
while cur:
    nxt = cur.next; cur.next = prev; prev, cur = cur, nxt

slow = fast = head                                  # middle / cycle
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast: ...                            # cycle

dummy = tail = Node(0)                              # merge
while a and b:
    if a.val &lt;= b.val: tail.next, a = a, a.next
    else:              tail.next, b = b, b.next
    tail = tail.next
tail.next = a or b

node.prev.next = node.next; node.next.prev = node.prev   # doubly: remove a held node</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Save <code>next</code> before overwriting it, or the rest of the list is lost.</li>
    <li>Return <code>prev</code> after reversing, not <code>head</code>.</li>
    <li><code>while fast and fast.next</code>; compare nodes with <code>is</code>.</li>
    <li>After removing <code>prev.next</code>, don't advance <code>prev</code>.</li>
    <li>Nth from end: lead moves n + 1 from a dummy.</li>
    <li>LRU node stores its key; doubly lists update both directions.</li>
    <li>Python <code>list.insert(0, x)</code> is O(n); use <code>deque</code>.</li>
  </ul>

  <h2 id="dsa-ll-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a linked list, and how does it differ from an array?</summary><div class="qa-body">A linked list is a chain of nodes, each storing a value and a reference to the next node; order comes from the links, not from positions in memory. An array stores items in one contiguous block, so it can jump to index i in O(1) but must shift items to insert or delete at the front. A linked list inserts or deletes at the front or next to a held node in O(1) but needs O(n) to reach position i.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a linked list over an array?</summary><div class="qa-body">When you make many inserts and removals at the front or at positions you already hold, and rarely need "item number i", for example queues, LRU caches and undo histories. For index access, scanning, sorting and low memory use, an array is better. In Python that usually means a list for general work and a deque for queues.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a Python list a linked list? Why is <code>list.insert(0, x)</code> slow?</summary><div class="qa-body">No. A Python list is a dynamic array, one contiguous block of references, so inserting at the front shifts every element one place, which is O(n). <code>collections.deque</code> is a doubly linked chain of blocks, so <code>appendleft</code> is O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the costs of reading the 100th node, inserting at the head, and inserting after a node you hold?</summary><div class="qa-body">O(n) to reach the 100th node, because you must walk 100 hops. O(1) to insert at the head and O(1) to insert after a held node, because only references change and nothing shifts. Inserting at an arbitrary position is O(n) overall because of the walk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dummy head node and why is it useful?</summary><div class="qa-body">It is a placeholder node placed before the real head. It gives every real node a predecessor, so removing or inserting at the head uses the same code as any other position. At the end you return <code>dummy.next</code>, which is correct even if the original head was removed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you reverse a singly linked list in place?</summary><div class="qa-body">Walk once with three pointers: <code>prev</code> (the reversed part, starting at None), <code>cur</code> (the node being flipped) and <code>nxt</code> (the saved rest of the list). Each step saves <code>nxt = cur.next</code>, flips <code>cur.next = prev</code>, then moves <code>prev</code> and <code>cur</code> forward. Return <code>prev</code>. It is O(n) time and O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the iterative reversal preferred to the recursive one in Python?</summary><div class="qa-body">The recursive version uses one stack frame per node, which is O(n) space, and Python's default recursion limit of about 1,000 means it raises RecursionError on long lists. The loop uses O(1) space and has no such limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the middle of a linked list in one pass?</summary><div class="qa-body">Move a slow pointer one step and a fast pointer two steps at a time while <code>fast and fast.next</code>. When fast reaches the end, slow is at the middle. For an even number of nodes this gives the second middle; starting fast at <code>head.next</code> gives the first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect a cycle in O(1) space, and why does it work?</summary><div class="qa-body">Floyd's algorithm: slow moves one step, fast moves two. If fast reaches None there is no cycle. If there is a cycle, both pointers end up inside it, and fast gains one node on slow every step, so the gap shrinks to zero and they meet on the same node. It runs in O(n) time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the node where a cycle begins?</summary><div class="qa-body">After slow and fast meet, start a new pointer at the head and move it and slow one step at a time. They meet at the first node of the cycle, because the distance from the head to the cycle start equals the distance from the meeting point to the cycle start, going round the loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you remove the nth node from the end in one pass?</summary><div class="qa-body">Start a lead and a trail pointer at a dummy node, move lead n + 1 steps ahead, then move both until lead is None. Trail is then just before the node to remove, so <code>trail.next = trail.next.next</code>. Starting at a dummy handles removing the head.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you merge two sorted linked lists, and what does it cost?</summary><div class="qa-body">Use a dummy node and a tail pointer. Repeatedly attach the smaller of the two front nodes to the tail and advance that list; when one list is empty, attach the rest of the other in one step. It is O(n + m) time and O(1) extra space, because existing nodes are re-linked and none are created.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a doubly linked list give you over a singly linked one, and at what cost?</summary><div class="qa-body">Each node also has a <code>prev</code> reference, so you can walk backwards and remove a node you hold in O(1) without searching for its predecessor. The cost is extra memory per node and twice as many references to update on every insert and remove.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does an LRU cache use both a hash map and a doubly linked list?</summary><div class="qa-body">The hash map finds a key's node in O(1). The doubly linked list keeps entries in order of use and lets you move a node to the front or remove the least recent one at the back in O(1), because each node knows both neighbours. A dict alone has no cheap way to find the oldest entry, and a list alone needs O(n) to find a key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must each LRU node store its key?</summary><div class="qa-body">On eviction you take the node just before the tail sentinel and must also delete its entry from the dict. Without the key stored in the node, you would not know which dict entry to delete without an O(n) search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you check whether a linked list is a palindrome in O(1) extra space?</summary><div class="qa-body">Find the middle with fast and slow pointers, reverse the second half in place, then walk the first half and the reversed second half together comparing values. Optionally reverse the second half back to restore the list. It is O(n) time and O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you sort a linked list in O(n log n)?</summary><div class="qa-body">Merge sort: find the middle with fast and slow pointers, split the list there, sort each half recursively, and merge the two sorted halves by re-linking nodes. It needs no random access, which is why it suits linked lists better than quick sort or heap sort.</div></details>
</main>
`
});
