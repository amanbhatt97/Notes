// notes/dsa/dsa_stacks.js — Stacks & Queues
Object.assign(TOPIC_CONTENT, {
  "dsa_stacks": `<main>
<h1>Stacks &amp; Queues</h1>
  <div class="where"><span>DSA</span><span>Linear Structures</span><span>Stacks &amp; Queues</span></div>
  <p class="lead">A stack and a queue are both collections that let you take items out in only one fixed order: a stack always gives back the newest item, a queue always gives back the oldest. That sounds like a limitation, but those two rules are exactly what an undo button, a bracket checker, a kitchen ticket rail and a shortest-path search need, and a clever variation of the stack (the "monotonic stack") quietly solves a whole family of interview problems that look hard at first sight. In Python neither is a special type: a stack is an ordinary list and a queue is <code>collections.deque</code>. The whole page follows one story, Biteful's dispatcher handling the evening's 8 orders, whose bills are the same 8 charges used in the other DSA notes, so every new idea is added to data you have already seen. All outputs are real runs of Python 3.13; timings are approximate and vary by machine.</p>

  <h2 id="dsa-sq-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Stacks &amp; Queues</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Two removal orders</div>
        <ul>
          <li><b>Stack</b> = LIFO: newest out first (undo, brackets, call stack)</li>
          <li><b>Queue</b> = FIFO: oldest out first (tickets, BFS)</li>
          <li>Add, remove, peek: all O(1)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In Python</div>
        <ul>
          <li>Stack: list with <code>append</code>, <code>pop()</code>, <code>[-1]</code></li>
          <li>Queue: <code>deque</code> with <code>append</code>, <code>popleft()</code></li>
          <li><code>list.pop(0)</code> is O(n): never use it as a queue</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stack tricks</div>
        <ul>
          <li>Brackets: push openers, closer must match the top</li>
          <li>Min stack: store (value, min so far)</li>
          <li>Expressions: RPN, calculators save state at "("</li>
          <li>Monotonic stack: next greater / smaller in O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Queue tricks</div>
        <ul>
          <li>Two stacks make a queue, amortised O(1)</li>
          <li>BFS: first arrival = shortest path</li>
          <li>Monotonic deque: sliding window max in O(n)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-sq-stack"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Stacks: Newest First</span><span class="rm-sub">undo, LIFO, a list used at one end</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-match"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Matching Brackets</span><span class="rm-sub">checking nesting with a stack</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-minstack"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Min Stack</span><span class="rm-sub">the minimum in O(1), even after undo</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-queue"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Queues and deque</span><span class="rm-sub">oldest first, and why pop(0) is slow</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-impl"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">A Queue From Two Stacks</span><span class="rm-sub">FIFO built from LIFO, amortised cost</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-bfs"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">BFS Runs on a Queue</span><span class="rm-sub">fewest steps on a grid</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-mono"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Monotonic Stack</span><span class="rm-sub">next greater bill for every order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-deque"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Monotonic Deque</span><span class="rm-sub">maximum of every sliding window</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Recognising the Pattern</span><span class="rm-sub">problem wording to tool, with skeletons</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-problems"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">histogram, RPN, calculator, practice order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">empty pops, &lt; vs &lt;=, values vs indices</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">operations, costs, templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on stacks and queues</span></div></div>
    </div>
  </div>

  <h2 id="dsa-sq-stack"><span class="num">01</span>Stacks: Newest First</h2>
  <p>Biteful had 8 orders this evening. Their bills, in the order they arrived, are the running example for the whole page:</p>
  <table class="tbl">
    <tr><th>order</th><th>O1</th><th>O2</th><th>O3</th><th>O4</th><th>O5</th><th>O6</th><th>O7</th><th>O8</th></tr>
    <tr><td>index</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
    <tr><td>bill (₹)</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
  </table>
  <p>The dispatcher builds delivery batches on her screen. She adds O1, O2 and O3 to a batch and then presses Undo. Which order should come out? Obviously O3, the one she added last. If she presses Undo again, O2 comes out, then O1. Undo always works on the <em>most recent</em> action that has not been undone yet. A Python list can store the batch, but a list lets you remove from anywhere; what we want is a structure whose only removal rule is "newest first", so that Undo can never pick the wrong item.</p>
  <p>That structure is the <strong>stack</strong>: a collection where items are added and removed at one end only, called the top, so the last item put in is the first one taken out. This rule is called <strong>LIFO</strong>, short for "last in, first out". Adding an item is called a <strong>push</strong>, removing the top item is a <strong>pop</strong>, and looking at the top without removing it is a <strong>peek</strong>. Think of the stack of clean plates at a wedding buffet: staff put new plates on top, guests take plates from the top, and the plate at the very bottom, put there first, is the last to be used. Nobody pulls a plate out of the middle.</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600"><defs><marker id="sq-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="120" y="20" class="tb" text-anchor="middle">STACK (LIFO)</text><rect x="60" y="190" width="120" height="30" rx="4" class="fb sb"/><text x="120" y="210" text-anchor="middle">O1 ₹120</text><rect x="60" y="154" width="120" height="30" rx="4" class="fb sb"/><text x="120" y="174" text-anchor="middle">O2 ₹80</text><rect x="60" y="118" width="120" height="30" rx="4" class="fr sr"/><text x="120" y="138" text-anchor="middle">O3 ₹250</text><text x="190" y="140" class="tr">← top</text><text x="120" y="70" class="tm" text-anchor="middle">push / pop here only</text><path d="M100 80 v30" stroke="currentColor" marker-end="url(#sq-a)"/><path d="M140 110 v-30" stroke="currentColor" marker-end="url(#sq-a)"/><text x="430" y="20" class="tg" text-anchor="middle">QUEUE (FIFO)</text><rect x="290" y="100" width="62" height="34" rx="4" class="fg sg"/><text x="321" y="122" text-anchor="middle">O1</text><rect x="360" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="391" y="122" text-anchor="middle">O2</text><rect x="430" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="461" y="122" text-anchor="middle">O3</text><rect x="500" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="531" y="122" text-anchor="middle">O4</text><text x="321" y="160" class="tg" text-anchor="middle">front</text><text x="531" y="160" class="tm" text-anchor="middle">rear</text><path d="M290 117 h-40" stroke="currentColor" marker-end="url(#sq-a)"/><text x="268" y="92" class="tm" text-anchor="middle">leave</text><path d="M598 117 h-34" stroke="currentColor" marker-end="url(#sq-a)"/><text x="570" y="92" class="tm" text-anchor="middle">join</text><text x="430" y="200" class="tm" text-anchor="middle">join at the rear, leave from the front</text></svg><figcaption>Left: the dispatcher's batch as a stack; O3 was added last, so it is on top and Undo removes it first. Right: the kitchen's tickets as a queue (section 04); O1 arrived first, so it is served first.</figcaption></figure>
  <p>Python has no separate stack type, because a list already does the job perfectly as long as you only touch its <em>end</em>. The end of the list is the top: <code>append(x)</code> pushes, <code>pop()</code> with no argument removes and returns the last item, and <code>s[-1]</code> peeks. All three are O(1), because nothing else in the list has to move. (The Complexity note showed that <code>append</code> is amortised O(1) even when the list occasionally has to grow.) Here is the dispatcher's evening: add O1, O2, O3, Undo, look at the top, add O4, Undo twice.</p>
<div class="fx" data-lang="py">batch = []                                  # bottom ... top
batch.append(120); print("add O1  ", batch)
batch.append(80);  print("add O2  ", batch)
batch.append(250); print("add O3  ", batch)
print("undo  -&gt;", batch.pop(), batch)
print("peek  -&gt;", batch[-1], batch)
batch.append(40);  print("add O4  ", batch)
print("undo  -&gt;", batch.pop(), batch)
print("undo  -&gt;", batch.pop(), batch)
print("anything left to undo?", bool(batch))

try:
    [].pop()
except IndexError as e:
    print("undo on an empty batch:", e)</div>
  <div class="fx" data-lang="text">add O1   [120]
add O2   [120, 80]
add O3   [120, 80, 250]
undo  -&gt; 250 [120, 80]
peek  -&gt; 80 [120, 80]
add O4   [120, 80, 40]
undo  -&gt; 40 [120, 80]
undo  -&gt; 80 [120]
anything left to undo? True
undo on an empty batch: pop from empty list</div>
  <p>Read the output line by line. The first Undo returns 250 (O3), the newest bill, and leaves <code>[120, 80]</code>. Peeking shows 80 without removing it. After O4 is added, the next Undo removes 40 (O4) and the one after that removes 80 (O2): always the most recent item still in the batch. The last line shows the one thing that can go wrong: popping an empty list raises <code>IndexError</code>. That is why stack code almost always checks first, with <code>if batch:</code> (an empty list counts as false).</p>
  <p>Stacks matter far beyond undo buttons, because "the most recent unfinished thing" is a very common question. The browser's Back button is a stack of pages. Most importantly, your program itself runs on a stack: when function <code>f</code> calls <code>g</code>, Python pushes a "frame" for <code>g</code> on the <strong>call stack</strong>, and when <code>g</code> returns, that frame is popped and <code>f</code> continues where it left off. This is why any recursive function can be rewritten as a loop with your own list as the stack (the Trees note does exactly this), and why recursion that goes too deep fails with <code>RecursionError</code>: the call stack has a size limit.</p>
  <p>One warning about the end you choose. If you use the <em>front</em> of the list as the top, with <code>insert(0, x)</code> and <code>pop(0)</code>, the code still gives correct answers, but every push and pop now shifts every other item one place, which is O(n). Always use the end.</p>

  <h2 id="dsa-sq-match"><span class="num">02</span>Matching Brackets</h2>
  <p>So far the stack has only stored things and handed them back. Its first real job is checking. Biteful's menu service stores each combo meal as nested brackets, something like <code>{"combo": [{"id": 3}, {"id": 5}]}</code>, and a corrupted file with a missing or misplaced bracket crashes the app. If we ignore everything except the brackets, that combo is <code>{[{}{}]}</code>. The question is: is every bracket closed by the right kind of bracket, in the right order?</p>
  <p>A first idea is to count: the number of <code>(</code> should equal the number of <code>)</code>, and the same for the other types. Counting fails, though. The string <code>([)]</code> has one of each, yet it is broken, because the <code>)</code> arrives while the <code>[</code> is still open. The real rule of nesting is that a closing bracket must match the <strong>most recently opened bracket that is still open</strong>. "Most recent unfinished thing" is exactly what the top of a stack holds. Think of opening Russian nesting dolls: you can only close the innermost open doll first.</p>
  <p>So the algorithm is: walk through the string; when you see an opening bracket, push it; when you see a closing bracket, the top of the stack must be the matching opener, so pop it and compare (if the stack is empty or the top is the wrong kind, the string is invalid); at the end, the stack must be empty, because anything left over was never closed. Here is that process on the combo string, with the stack written bottom to top:</p>
  <table class="tbl">
    <tr><th>#</th><th>char</th><th>action</th><th>stack after</th></tr>
    <tr><td>1</td><td>{</td><td>opener: push</td><td>{</td></tr>
    <tr><td>2</td><td>[</td><td>opener: push</td><td>{ [</td></tr>
    <tr><td>3</td><td>{</td><td>opener: push</td><td>{ [ {</td></tr>
    <tr><td>4</td><td>}</td><td>top is { : matches, pop</td><td>{ [</td></tr>
    <tr><td>5</td><td>{</td><td>opener: push</td><td>{ [ {</td></tr>
    <tr><td>6</td><td>}</td><td>top is { : matches, pop</td><td>{ [</td></tr>
    <tr><td>7</td><td>]</td><td>top is [ : matches, pop</td><td>{</td></tr>
    <tr><td>8</td><td>}</td><td>top is { : matches, pop</td><td>(empty) → valid</td></tr>
  </table>
  <p>In code, a small dictionary maps each closer to its opener, so "is this a closer?" is <code>ch in pairs</code> and "which opener must be on top?" is <code>pairs[ch]</code>:</p>
<div class="fx" data-lang="py">def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:                              # a closer
            if not stack or stack.pop() != pairs[ch]:
                return False                         # nothing open, or wrong kind
        else:
            stack.append(ch)                         # an opener
    return not stack                                 # leftovers were never closed

for s in ["{[{}{}]}", "{[}]", "{[{}]", "([)]", "]", ""]:
    print(repr(s), is_valid(s))</div>
  <div class="fx" data-lang="text">'{[{}{}]}' True
'{[}]' False
'{[{}]' False
'([)]' False
']' False
'' True</div>
  <p>The combo string is valid, as the table showed. <code>{[}]</code> fails at the third character, because <code>}</code> arrives while <code>[</code> is on top. <code>{[{}]</code> fails for the opposite reason: every closer matched, but one <code>{</code> is left on the stack at the end. <code>([)]</code>, the string that fooled counting, fails here. <code>"]"</code> fails because there is nothing to pop, and the empty string is valid, since nothing in it is unclosed. These edge cases are exactly the ones interviewers test.</p>
  <p>Every character is pushed or popped at most once, so the check is O(n) time, with O(n) space in the worst case (a string of only openers). The brute-force alternative, repeatedly deleting adjacent pairs like <code>()</code> until nothing changes, is O(n²). Whenever a problem talks about "valid", "balanced", "nested" or "well-formed" input, or about decoding something like <code>3[a2[c]]</code>, the thing that must close next is the most recently opened one, and that is your signal to use a stack.</p>

  <h2 id="dsa-sq-minstack"><span class="num">03</span>Min Stack</h2>
  <p>The finance team now wants one more number on the dispatcher's screen: the cheapest bill currently in the batch, kept correct after every add and every Undo. The obvious answer, <code>min(batch)</code>, scans the whole batch every time it is asked, which is O(n). Keeping a single variable <code>cheapest</code> and updating it on every push looks like it works, until Undo removes the cheapest order. What was the minimum <em>before</em> that order was added? The variable has forgotten, and the only way to find out is to scan again.</p>
  <p>The fix is a small but important idea: store the answer alongside the data. A <strong>min stack</strong> is a stack in which every entry is a pair (value, minimum of everything at or below this entry). When a new bill is pushed, its pair records <code>min(new bill, the minimum stored in the entry below)</code>. Because each entry carries its own snapshot of the minimum, popping an entry automatically reveals the snapshot from before it was added. Think of a pile of exam answer sheets where every student also writes "lowest score so far" in the corner: when the top sheet is taken away, the corner of the next sheet already tells you the lowest score among the remaining ones, without anybody re-reading the pile.</p>
<div class="fx" data-lang="py">class MinStack:
    def __init__(self):
        self.s = []                       # (value, min of this and everything below)

    def push(self, val):
        m = min(val, self.s[-1][1]) if self.s else val
        self.s.append((val, m))

    def pop(self):
        self.s.pop()

    def top(self):
        return self.s[-1][0]

    def get_min(self):
        return self.s[-1][1]

ms = MinStack()
for bill in [120, 80, 250, 40]:
    ms.push(bill)
    print(f"push {bill:3}: min={ms.get_min():3}  pairs={ms.s}")
for _ in range(3):
    ms.pop()
    print(f"undo    : top={ms.top():3} min={ms.get_min()}")</div>
  <div class="fx" data-lang="text">push 120: min=120  pairs=[(120, 120)]
push  80: min= 80  pairs=[(120, 120), (80, 80)]
push 250: min= 80  pairs=[(120, 120), (80, 80), (250, 80)]
push  40: min= 40  pairs=[(120, 120), (80, 80), (250, 80), (40, 40)]
undo    : top=250 min=80
undo    : top= 80 min=80
undo    : top=120 min=120</div>
  <p>Follow the pairs. Pushing 120 stores (120, 120). Pushing 80 stores (80, 80) because 80 is smaller. Pushing 250 stores (250, 80): 250 is not the cheapest, so it simply copies 80 from below. Pushing 40 stores (40, 40). Now the Undos: removing O4 exposes (250, 80), so the minimum is instantly 80 again, with no scanning; two more Undos expose 80 and then 120. Every operation is O(1) time, at the cost of one extra number per entry (O(n) space). Duplicates are not a problem either, because each entry has its own copy of the minimum.</p>
  <p>The general lesson is wider than minimums: whenever a statistic of "everything below me" must survive pops, store it with each push. The same trick handles "max stack", browser history with back and forward, and "increment the bottom k elements" with a lazy value stored per entry.</p>

  <h2 id="dsa-sq-queue"><span class="num">04</span>Queues and deque</h2>
  <p>Everything so far was newest-first. The kitchen needs the opposite. Orders are cooked in the order they arrived, so when a cook is free, the ticket that has waited <em>longest</em> (O1) must go next. A stack can never do this; it would always hand over the newest ticket, and in a busy hour O1 might never be cooked at all.</p>
  <p>The structure for this is the <strong>queue</strong>: a collection where items join at one end, the rear, and leave from the other end, the front, so the first item in is the first item out. This rule is <strong>FIFO</strong>, "first in, first out". Adding is often called <em>enqueue</em> and removing <em>dequeue</em>. The railway ticket counter is a queue: you join at the back, and the person at the front is served first.</p>
  <p>The tempting way to write a queue in Python is a list with <code>append</code> to join and <code>pop(0)</code> to serve. It gives the right answers, but it hides a cost. A list is one continuous block of memory, and removing the first item means every remaining item must slide one place to the left. With 1 lakh tickets waiting, each "next please" moves 1 lakh items. Picture a bench where people must sit packed from the left end: when the first person leaves, everybody shuffles one seat along. Let us measure it by putting n tickets in a queue and serving them all, once with a list and once with <code>collections.deque</code>:</p>
<div class="fx" data-lang="py">import time
from collections import deque

def serve_all_list(n):
    q = list(range(n))
    t = time.perf_counter()
    while q:
        q.pop(0)                      # every remaining ticket shifts left
    return time.perf_counter() - t

def serve_all_deque(n):
    q = deque(range(n))
    t = time.perf_counter()
    while q:
        q.popleft()                   # nothing shifts
    return time.perf_counter() - t

for n in [25_000, 50_000, 100_000, 200_000]:
    a, b = serve_all_list(n), serve_all_deque(n)
    print(f"n={n:&gt;7,}  list.pop(0): {a:6.3f} s   deque.popleft: {b:6.4f} s")</div>
  <div class="fx" data-lang="text">n= 25,000  list.pop(0):  0.069 s   deque.popleft: 0.0010 s
n= 50,000  list.pop(0):  0.223 s   deque.popleft: 0.0019 s
n=100,000  list.pop(0):  0.855 s   deque.popleft: 0.0026 s
n=200,000  list.pop(0):  3.548 s   deque.popleft: 0.0044 s</div>
  <p>The numbers are approximate, but the pattern is what matters. The deque's time grows roughly in step with n: O(1) per ticket. The list's time roughly <em>quadruples</em> each time n doubles, which is the signature of O(n) per ticket and O(n²) to serve them all. At 2 lakh tickets the list is hundreds of times slower, and the gap keeps widening.</p>
  <p><code>collections.deque</code> (pronounced "deck", short for <strong>double-ended queue</strong>) is built from a chain of small fixed-size blocks rather than one continuous block, so adding or removing at <em>either</em> end is O(1) and nothing ever shifts. Use <code>append</code> to join at the rear, <code>popleft()</code> to serve from the front, and <code>q[0]</code> to peek at the next ticket. Because it is double-ended it can also push at the front (<code>appendleft</code>) and remove from the rear (<code>pop</code>), and with <code>maxlen</code> it automatically drops the oldest items, which is handy for "the last k events":</p>
<div class="fx" data-lang="py">from collections import deque

kitchen = deque(["O1", "O2"])
kitchen.append("O3")                  # a new ticket joins at the rear
print("cook:", kitchen.popleft(), "| waiting:", list(kitchen), "| next:", kitchen[0])
kitchen.appendleft("O9")              # a re-cook jumps to the front
print(list(kitchen), "| cancel newest:", kitchen.pop())

recent = deque(maxlen=3)              # the screen shows only the last 3 tickets
for t in ["O1", "O2", "O3", "O4", "O5"]:
    recent.append(t)
print("last three tickets:", list(recent))</div>
  <div class="fx" data-lang="text">cook: O1 | waiting: ['O2', 'O3'] | next: O2
['O9', 'O2', 'O3'] | cancel newest: O3
last three tickets: ['O3', 'O4', 'O5']</div>
  <p>The kitchen cooks O1 first and O2 is next in line, exactly first-in-first-out. The re-cooked O9 jumps to the front with <code>appendleft</code>, and the newest ticket, O3, can be cancelled from the rear. The <code>maxlen=3</code> deque kept only O3, O4 and O5, silently dropping the older tickets as new ones arrived.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>list</th><th>deque</th></tr>
    <tr><td>add / remove at the right end</td><td>O(1)</td><td>O(1)</td></tr>
    <tr><td>add / remove at the left end</td><td>O(n): <code>insert(0, x)</code>, <code>pop(0)</code></td><td>O(1): <code>appendleft</code>, <code>popleft</code></td></tr>
    <tr><td>index in the middle <code>x[i]</code></td><td>O(1)</td><td>O(n) (fast near the ends)</td></tr>
  </table>
  <p>Python has two other "queues" that you should not confuse with this one. <code>queue.Queue</code> is a thread-safe queue with locks, meant for passing work between threads; it is slower and not used in algorithms. <code>heapq</code> is a <em>priority</em> queue, which hands out the most urgent item rather than the oldest; that is the subject of the <a class="xref" data-note="dsa_heaps">Heaps</a> note.</p>

  <h2 id="dsa-sq-impl"><span class="num">05</span>A Queue From Two Stacks</h2>
  <p>A favourite interview question takes the deque away: "You only have stacks. Build a queue." It sounds impossible, since a stack gives newest-first and a queue needs oldest-first. But the question teaches two useful ideas: how one structure can be built out of another, and what "amortised" cost means.</p>
  <p>The key observation is that pouring one stack into another <em>reverses</em> it. If O1, O2, O3 are pushed onto a stack, O3 is on top. Pop them one by one and push each onto a second stack, and now O1 is on top. Reversing newest-first gives oldest-first. Think of a pile of letters in an in-tray, newest on top: if you lift letters one at a time onto an empty out-tray, the oldest letter ends up on top of the out-tray, ready to be handled first.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="sq-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="130" y="18" class="tb" text-anchor="middle">inbox (push here)</text><text x="470" y="18" class="tg" text-anchor="middle">outbox (pop here)</text><rect x="100" y="150" width="60" height="28" class="fb sb"/><text x="130" y="169" text-anchor="middle">O1</text><rect x="100" y="116" width="60" height="28" class="fb sb"/><text x="130" y="135" text-anchor="middle">O2</text><rect x="100" y="82" width="60" height="28" class="fb sb"/><text x="130" y="101" text-anchor="middle">O3</text><rect x="440" y="150" width="60" height="28" class="fg sg"/><text x="470" y="169" text-anchor="middle">O3</text><rect x="440" y="116" width="60" height="28" class="fg sg"/><text x="470" y="135" text-anchor="middle">O2</text><rect x="440" y="82" width="60" height="28" class="fr sr"/><text x="470" y="101" text-anchor="middle">O1</text><path d="M180 110 C 260 80, 340 80, 420 110" fill="none" stroke="currentColor" marker-end="url(#sq-b)"/><text x="300" y="40" text-anchor="middle">only when outbox is empty:</text><text x="300" y="58" class="tm" text-anchor="middle">pop all from inbox, push to outbox</text><text x="510" y="102" class="tr">← oldest</text><text x="300" y="194" class="tm" text-anchor="middle">pouring a stack into another reverses it: LIFO + LIFO = FIFO</text></svg><figcaption>O1, O2, O3 were pushed into the inbox, so O3 is on top. Pouring them into the empty outbox flips the order: O1, the oldest, is now on top and is served first.</figcaption></figure>
  <p>The design uses two stacks. New tickets are always pushed onto the <em>inbox</em>. To serve, pop from the <em>outbox</em>. When the outbox is empty, pour the whole inbox into it first. The rule "only pour when the outbox is empty" is essential: if you poured while the outbox still held older tickets, the newer ones would land on top of them and be served first, breaking FIFO.</p>
<div class="fx" data-lang="py">class MyQueue:
    def __init__(self):
        self.inbox, self.outbox = [], []

    def push(self, x):
        self.inbox.append(x)

    def _refill(self):
        if not self.outbox:                       # only when outbox is empty
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def pop(self):
        self._refill()
        return self.outbox.pop()

    def peek(self):
        self._refill()
        return self.outbox[-1]

q = MyQueue()
for t in ["O1", "O2", "O3"]:
    q.push(t)
print("pop:", q.pop(), "| inbox:", q.inbox, "outbox:", q.outbox)
q.push("O4")
print("pop:", q.pop(), "| inbox:", q.inbox, "outbox:", q.outbox)
print("pops:", q.pop(), q.pop())</div>
  <div class="fx" data-lang="text">pop: O1 | inbox: [] outbox: ['O3', 'O2']
pop: O2 | inbox: ['O4'] outbox: ['O3']
pops: O3 O4</div>
  <p>The first pop finds the outbox empty, pours O1, O2, O3 across (so the outbox is <code>['O3', 'O2']</code> after O1 is served), and returns O1. Then O4 arrives and goes into the inbox. The next pop does <em>not</em> pour, because the outbox still has O2 and O3, so O2 comes out correctly. O3 and then O4 follow: strict arrival order.</p>
  <p>What does it cost? A single pop that has to pour can take O(n) time. But look at the life of one ticket: it is pushed onto the inbox once, poured across once, and popped from the outbox once. Three O(1) moves per ticket, ever. So any sequence of n operations does at most about 3n moves in total, which is O(1) per operation on average. This kind of average over a whole sequence is called <strong>amortised</strong> cost: some single operations are expensive, but they are rare enough that the average stays constant. Python's <code>list.append</code> is the same story, with its occasional expensive resize. (The mirror puzzle, a stack from queues, works by rotating the queue after every push, which makes push O(n).)</p>

  <h2 id="dsa-sq-bfs"><span class="num">06</span>BFS Runs on a Queue</h2>
  <p>Oldest-first is not just fair; it is what finds shortest paths. A Biteful rider must cross a grid of city blocks, some closed for a wedding procession, and we want the fewest blocks to the customer. Trying every possible route would take exponential time. Instead, think of dropping a stone in a pond: the ripple reaches everything 1 step away, then everything 2 steps away, and so on. If we explore the grid in the same widening rings, the first time we reach the customer must be along a shortest route, because every shorter distance was fully explored before.</p>
  <p>That exploration is called <strong>breadth-first search</strong>, or BFS: start from one place, and repeatedly take the place that was discovered earliest, then record its undiscovered neighbours as discovered. "Discovered earliest" is oldest-first, so the to-do list is a queue. To see that the queue is really what creates the rings, here is the same loop on a small map of six localities, once taking from the front (a queue) and once from the back (a stack):</p>
<div class="fx" data-lang="py">graph = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"], "D": [], "E": ["F"], "F": []}

def visit_order(start, use_queue):
    todo, seen, order = deque([start]), {start}, []
    while todo:
        node = todo.popleft() if use_queue else todo.pop()   # the ONLY difference
        order.append(node)
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt)
                todo.append(nxt)
    return order

print("queue (BFS):", visit_order("A", True))
print("stack (DFS):", visit_order("A", False))</div>
  <div class="fx" data-lang="text">queue (BFS): ['A', 'B', 'C', 'D', 'E', 'F']
stack (DFS): ['A', 'C', 'F', 'B', 'E', 'D']</div>
  <p>With the queue, A is visited first, then its neighbours B and C (one step away), then D, E and F (two steps away): ring by ring. With the stack, the loop follows the newest discovery and dives down one branch, A then C then F, before coming back; that is depth-first search (DFS). One line of difference turns one algorithm into the other.</p>
  <p>Now the rider's grid. Open blocks are <code>.</code> and closed ones are <code>#</code>; each queue entry carries a cell and its distance from the start:</p>
<div class="fx" data-lang="py">def shortest_path(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    q = deque([(start, 0)])
    seen = {start}
    while q:
        (r, c), dist = q.popleft()
        if (r, c) == goal:
            return dist
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 &lt;= nr &lt; rows and 0 &lt;= nc &lt; cols and grid[nr][nc] == "." and (nr, nc) not in seen:
                seen.add((nr, nc))              # mark when ADDED, not when popped
                q.append(((nr, nc), dist + 1))
    return -1

streets = ["..#.",
           ".##.",
           "....",
           "#.#."]
print(shortest_path(streets, (0, 0), (0, 3)), shortest_path(streets, (0, 0), (3, 1)),
      shortest_path([".#", "#."], (0, 0), (1, 1)))</div>
  <div class="fx" data-lang="text">7 4 -1</div>
  <p>The top-right corner is 7 blocks away, because the rider has to go down and around the closed blocks; row 3, column 1 is 4 blocks away; and −1 means the customer is unreachable. Note the comment on <code>seen.add</code>: a cell is marked as seen the moment it is <em>added</em> to the queue, not when it is popped. Otherwise several neighbours can add the same cell, and the queue fills with duplicates.</p>
  <p>BFS visits each cell (or node) once and looks at each connection once, so it costs O(V + E), where V is the number of places and E the number of connections. It finds shortest paths only when every step costs the same; when roads take different times, the queue is replaced by a heap, which gives Dijkstra's algorithm. The interview signals are "minimum number of moves", "nearest", "level by level", or something spreading step by step ("rotting oranges"). The <a class="xref" data-note="dsa_graphs">Graphs</a> note covers BFS in depth, and the <a class="xref" data-note="dsa_trees">Trees</a> note uses it to read a tree level by level.</p>

  <h2 id="dsa-sq-mono"><span class="num">07</span>Monotonic Stack</h2>
  <p>Back to the 8 bills: [120, 80, 250, 40, 310, 80, 60, 200]. Finance asks, "For each order, which later order was the first to have a bigger bill?" For O1 (₹120) the answer is O3's ₹250; for O5 (₹310) there is none. The direct approach checks, for every order, each later order until a bigger one appears. That is O(n²): 28 comparisons for 8 orders, but about 5 billion for 1 lakh orders.</p>
  <p>Look at what happens as the bills arrive. O1 (120) is waiting for something bigger. O2 (80) arrives; it does not answer O1, so now both are waiting. O3 (250) arrives and answers <em>both</em> of them at once, newest first: O2 then O1. The orders still waiting always form a group in which the bills <em>decrease</em> from oldest to newest, because if a bigger bill had come after a smaller one, it would already have answered the smaller one and removed it from the group. And when a big bill arrives, it answers the waiting orders from the newest end. "Newest end" means a stack.</p>
  <p>This gives the <strong>monotonic stack</strong>: a stack whose values are always kept in sorted order (here decreasing from bottom to top), where every pop is the moment an item's answer is found. ("Monotonic" just means "always moving in one direction".) Picture students waiting in a corridor, each waiting for someone taller than them to walk in. When a tall student arrives, every shorter student at the end of the waiting line gets their answer and leaves; anyone taller than the newcomer keeps waiting, and the newcomer joins the end of the line. The line is always tallest-to-shortest.</p>
  <p>The algorithm walks left to right and keeps the <em>indices</em> of the orders still waiting. For each new bill x: while the bill on top of the stack is smaller than x, pop it and record x as its answer; then push the new index. Here is the trace, with the stack shown as bills:</p>
  <table class="tbl">
    <tr><th>order</th><th>bill</th><th>pops (and their answer)</th><th>stack after</th></tr>
    <tr><td>O1</td><td>120</td><td>–</td><td>120</td></tr>
    <tr><td>O2</td><td>80</td><td>– (80 &lt; 120, wait)</td><td>120 80</td></tr>
    <tr><td>O3</td><td>250</td><td>O2 → 250, O1 → 250</td><td>250</td></tr>
    <tr><td>O4</td><td>40</td><td>–</td><td>250 40</td></tr>
    <tr><td>O5</td><td>310</td><td>O4 → 310, O3 → 310</td><td>310</td></tr>
    <tr><td>O6</td><td>80</td><td>–</td><td>310 80</td></tr>
    <tr><td>O7</td><td>60</td><td>–</td><td>310 80 60</td></tr>
    <tr><td>O8</td><td>200</td><td>O7 → 200, O6 → 200</td><td>310 200</td></tr>
  </table>
  <p>At the end, O5 and O8 are still on the stack: they never found a bigger bill, so their answer stays −1.</p>
<div class="fx" data-lang="py">def next_greater(nums):
    ans = [-1] * len(nums)
    stack = []                                # indices still waiting; bills decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] &lt; x:  # x answers everyone smaller on top
            ans[stack.pop()] = x
        stack.append(i)
    return ans

def orders_until_bigger(nums):                # same stack, store the distance instead
    ans = [0] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] &lt; x:
            j = stack.pop()
            ans[j] = i - j
        stack.append(i)
    return ans

bills = [120, 80, 250, 40, 310, 80, 60, 200]
print(next_greater(bills))
print(orders_until_bigger(bills))
print(orders_until_bigger([73, 74, 75, 71, 69, 72, 76, 73]))</div>
  <div class="fx" data-lang="text">[250, 250, 310, 310, -1, 200, 200, -1]
[2, 1, 2, 1, 0, 2, 1, 0]
[1, 1, 4, 2, 1, 1, 0, 0]</div>
  <p>The first line matches the table: [250, 250, 310, 310, −1, 200, 200, −1]. The second line uses the same stack but records <code>i − j</code>, the number of orders until a bigger bill: O1 waits 2 orders, O2 waits 1, and so on. The third line runs that version on daily temperatures, and it is the complete solution to the well-known interview problem <em>Daily Temperatures</em> ("how many days until a warmer day?"): day 2 (75°) waits 4 days because 71, 69 and 72 are all colder.</p>
  <p>Why is this O(n) when there is a <code>while</code> loop inside a <code>for</code> loop? Count the stack moves instead of the loops. Each index is pushed exactly once and popped at most once, so over the whole run there are at most n pushes and n pops: at most 2n moves in total. On our 8 bills that was 8 pushes and 6 pops. This "count the pushes and pops" argument is the sentence to say out loud in an interview. The space is O(n) for the stack. A rough timing shows the difference on falling bills, which is the brute force's worst case:</p>
<div class="fx" data-lang="py">import random, time

def next_greater_brute(nums):
    n, ans = len(nums), [-1] * len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[j] &gt; nums[i]:
                ans[i] = nums[j]
                break
    return ans

random.seed(7)
for n in [2_000, 8_000]:
    data = sorted((random.randint(10, 999) for _ in range(n)), reverse=True)
    t = time.perf_counter(); a = next_greater_brute(data); tb = time.perf_counter() - t
    t = time.perf_counter(); b = next_greater(data); ts = time.perf_counter() - t
    print(f"n={n:,}: brute {tb:.3f} s, stack {ts:.4f} s, same answer: {a == b}")</div>
  <div class="fx" data-lang="text">n=2,000: brute 0.042 s, stack 0.0002 s, same answer: True
n=8,000: brute 0.735 s, stack 0.0007 s, same answer: True</div>
  <p>Four times the data makes the brute force roughly 16 times slower (O(n²)) while the stack version grows only about 4 times (O(n)); the exact seconds will differ on your machine.</p>
  <p>The same stack answers a family of related questions by flipping one comparison or reading the stack at a different moment:</p>
  <table class="tbl">
    <tr><th>Question</th><th>Stack keeps values</th><th>Pop when the new value is</th></tr>
    <tr><td>next greater</td><td>decreasing</td><td>bigger than the top</td></tr>
    <tr><td>next smaller</td><td>increasing</td><td>smaller than the top</td></tr>
    <tr><td>previous greater / smaller</td><td>same stacks</td><td>after popping, the new top is the answer for the new item</td></tr>
    <tr><td>circular array</td><td>same</td><td>loop i over 2n and use <code>i % n</code></td></tr>
  </table>
  <p>Recognise this pattern when a problem asks, for every element, about the first bigger or smaller element to its left or right: "next greater element", "days until warmer", "stock span" (how many previous days were cheaper), "largest rectangle in a histogram", "trapping rain water", or "remove k digits to make the smallest number".</p>

  <h2 id="dsa-sq-deque"><span class="num">08</span>Monotonic Deque: Sliding Window Maximum</h2>
  <p>Operations now asks a different question: "What was the biggest bill among the <em>last 3</em> orders, at every point in the evening?" A run of consecutive items like this is called a <strong>sliding window</strong>: a window of size k that moves one position at a time. Recomputing <code>max</code> for every window is O(n·k). The monotonic stack cannot help directly, because it remembers everything since the start; here old orders must <em>leave</em> once they fall out of the window, and they leave from the oldest end, while new orders arrive at the newest end. We need a structure that can remove from both ends: a deque.</p>
  <p>The insight is about which bills can ever matter again. When a new bill arrives, every older bill in the window that is smaller than it can <em>never</em> be the maximum of any future window: the new bill is bigger, and it will stay in the window longer than they will. So throw them out. Think of a cricket selector picking the best batter from the last k matches: when a young player scores 120, every older player who scored less is dropped for good, because they are worse and will also retire from the window sooner. What remains in the deque is decreasing from front to back, so the front is always the maximum. The front also has to leave when its index slides out of the window.</p>
  <p>This is the <strong>monotonic deque</strong>: a deque of indices whose values decrease from front to back. Each step does four things: pop from the back while the back's value is at most the new value; push the new index; pop the front if its index is now outside the window (index ≤ i − k); and once the first full window is reached, read the front. Here it is on the bills with k = 3 (deque shown as index:bill):</p>
  <table class="tbl">
    <tr><th>i</th><th>bill</th><th>pop from back</th><th>pop from front (expired)</th><th>deque after</th><th>window max</th></tr>
    <tr><td>0</td><td>120</td><td>–</td><td>–</td><td>0:120</td><td>–</td></tr>
    <tr><td>1</td><td>80</td><td>–</td><td>–</td><td>0:120 1:80</td><td>–</td></tr>
    <tr><td>2</td><td>250</td><td>80, 120</td><td>–</td><td>2:250</td><td>250</td></tr>
    <tr><td>3</td><td>40</td><td>–</td><td>–</td><td>2:250 3:40</td><td>250</td></tr>
    <tr><td>4</td><td>310</td><td>40, 250</td><td>–</td><td>4:310</td><td>310</td></tr>
    <tr><td>5</td><td>80</td><td>–</td><td>–</td><td>4:310 5:80</td><td>310</td></tr>
    <tr><td>6</td><td>60</td><td>–</td><td>–</td><td>4:310 5:80 6:60</td><td>310</td></tr>
    <tr><td>7</td><td>200</td><td>60, 80</td><td>index 4 (4 ≤ 7 − 3)</td><td>7:200</td><td>200</td></tr>
  </table>
  <p>The last row shows both kinds of removal in one step: ₹60 and ₹80 leave from the back because ₹200 beats them, and ₹310 leaves from the front because O5 is no longer among the last 3 orders. This is why the deque stores indices rather than bills: without the index there is no way to know when the front has expired.</p>
<div class="fx" data-lang="py">def max_sliding_window(nums, k):
    dq, out = deque(), []                     # indices; values decreasing front to back
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] &lt;= x:       # smaller ones can never win now
            dq.pop()
        dq.append(i)
        if dq[0] &lt;= i - k:                    # front slid out of the window
            dq.popleft()
        if i &gt;= k - 1:
            out.append(nums[dq[0]])
    return out

print(max_sliding_window(bills, 3))
print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
print(max_sliding_window([9, 8, 7, 6], 2), max_sliding_window([4, 2, 12, 3], 4))</div>
  <div class="fx" data-lang="text">[250, 250, 310, 310, 310, 200]
[3, 3, 5, 5, 6, 7]
[9, 8, 7] [12]</div>
  <p>The bills give [250, 250, 310, 310, 310, 200], one maximum per window, exactly as traced. The second line is the standard LeetCode example. The last line covers two edge cases: a falling sequence, where nothing is ever popped from the back and the front keeps expiring, and k equal to the whole list, which gives a single window.</p>
  <p>Each index enters the deque once and leaves at most once, from the back or the front, so the whole run is O(n) time, and the deque never holds more than k indices, so the space is O(k). For a window <em>minimum</em>, flip the comparison so the deque is increasing. Recognise this pattern from "sliding window maximum / minimum", "window of size k", or "longest subarray where max − min stays within a limit" (one max-deque and one min-deque). Notice how the monotonic deque combines the two halves of this page: its back end behaves like the monotonic stack (new items evict weaker ones), and its front end behaves like a queue (the oldest item leaves first).</p>

  <h2 id="dsa-sq-patterns"><span class="num">09</span>Recognising the Pattern</h2>
  <p>In an interview nobody says "use a monotonic deque". You get a story about temperatures, brackets or stock prices, and you have to hear which order of removal the problem needs. The most useful question to ask yourself is: <em>which item do I need next?</em> If it is the most recent unfinished one, use a stack. If it is the one that has waited longest, use a queue. If it is the best one that is still possible (the next bigger value, the current window's maximum), keep the items in sorted order and throw away anything that can no longer win: a monotonic stack, or a monotonic deque when items must also expire. And if it is simply the most urgent one, that is a heap, not a stack or queue.</p>
  <table class="tbl">
    <tr><th>Trigger words in the problem</th><th>Pattern</th><th>Cost</th></tr>
    <tr><td>"undo", "backspace", "remove adjacent duplicates", "cancel the previous"</td><td>plain stack</td><td>O(n)</td></tr>
    <tr><td>"valid brackets", "balanced", "nested", "decode <code>3[a2[c]]</code>", "simplify path"</td><td>stack of openers / saved state</td><td>O(n)</td></tr>
    <tr><td>"get min / max in O(1)", "design a stack that also…"</td><td>stack of (value, running statistic)</td><td>O(1) per op</td></tr>
    <tr><td>"evaluate", "postfix", "calculator", <code>+ - * / ( )</code></td><td>stack of numbers (see Classic Problems)</td><td>O(n)</td></tr>
    <tr><td>"in order of arrival", "recent calls in the last t ms", "round robin"</td><td>deque as a queue</td><td>O(1) per op</td></tr>
    <tr><td>"minimum moves", "nearest", "level by level", "spreads each minute"</td><td>BFS with a deque</td><td>O(V + E)</td></tr>
    <tr><td>"next greater / smaller", "days until", "stock span", "largest rectangle", "trapping rain water"</td><td>monotonic stack of indices</td><td>O(n)</td></tr>
    <tr><td>"sliding window max / min", "window of size k"</td><td>monotonic deque of indices</td><td>O(n)</td></tr>
  </table>
  <p>Three skeletons cover most of these problems. The matching skeleton pushes openers and checks closers against the top; the monotonic stack skeleton pops everything the new item beats and records answers at each pop; the monotonic deque skeleton adds expiry at the front. Here they are as runnable functions, checked on the running example so you can see they are the real thing:</p>
<div class="fx" data-lang="py">def matching_template(s, pairs={")": "(", "]": "[", "}": "{"}):
    stack = []
    for ch in s:
        if ch in pairs:                       # closer: must match the newest opener
            if not stack or stack.pop() != pairs[ch]:
                return False
        elif ch in pairs.values():            # opener: remember it
            stack.append(ch)
    return not stack                          # leftovers = unclosed

def monotonic_stack_template(nums):
    ans, stack = [-1] * len(nums), []         # indices; values decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] &lt; x:
            ans[stack.pop()] = x              # x is the popped index's answer
        stack.append(i)
    return ans                                # leftovers never found an answer

def monotonic_deque_template(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] &lt;= x:
            dq.pop()                          # can never be the max again
        dq.append(i)
        if dq[0] &lt;= i - k:
            dq.popleft()                      # expired
        if i &gt;= k - 1:
            out.append(nums[dq[0]])
    return out

print(matching_template('{"combo": [{"id": 3}, {"id": 5}]}'))
print(monotonic_stack_template(bills))
print(monotonic_deque_template(bills, 3))</div>
  <div class="fx" data-lang="text">True
[250, 250, 310, 310, -1, 200, 200, -1]
[250, 250, 310, 310, 310, 200]</div>
  <p>The matching template ignores every character that is not a bracket, so it checks the real combo string directly. The other two reproduce the answers from sections 07 and 08. A warning about one word: "previous" does not automatically mean a stack. "Previous smaller element" is a monotonic stack, but "the previous k values" is a window (deque), and "the most urgent so far" is a heap. Name the order you need before you choose.</p>

  <h2 id="dsa-sq-problems"><span class="num">10</span>Classic Problems</h2>
  <p>Several famous interview problems are already solved above: Valid Parentheses (section 02), Min Stack (03), Queue using Stacks (05), Daily Temperatures and Next Greater Element (07) and Sliding Window Maximum (08). Three more come up often and each adds a twist worth seeing once: a monotonic stack that computes areas, and two problems where the stack evaluates arithmetic.</p>
  <p><strong>Largest Rectangle in Histogram.</strong> Bars of width 1 have given heights, and we want the area of the largest rectangle that fits inside them; for <code>[2, 1, 5, 6, 2, 3]</code> the answer is 10 (the bars of height 5 and 6, width 2, height 5). The brute force spreads left and right from every bar while the neighbours are at least as tall, which is O(n²). The insight is that the best rectangle using a bar's <em>full height</em> stretches from the first shorter bar on its left to the first shorter bar on its right, which is "previous smaller" and "next smaller": a monotonic stack of indices with <em>increasing</em> heights. When a shorter bar arrives at index i, the bar on top of the stack has found its right limit (i), and the bar just below it in the stack is its left limit, so we can pop it and compute its rectangle immediately. A sentinel bar of height 0 at the end pops everything that is left.</p>
  <table class="tbl">
    <tr><th>i</th><th>height</th><th>popped bar: height × width</th><th>stack heights after</th></tr>
    <tr><td>0</td><td>2</td><td>–</td><td>2</td></tr>
    <tr><td>1</td><td>1</td><td>2 × 1 = 2</td><td>1</td></tr>
    <tr><td>2, 3</td><td>5, 6</td><td>–</td><td>1 5 6</td></tr>
    <tr><td>4</td><td>2</td><td>6 × 1 = 6, then 5 × 2 = <b>10</b></td><td>1 2</td></tr>
    <tr><td>5</td><td>3</td><td>–</td><td>1 2 3</td></tr>
    <tr><td>6 (sentinel)</td><td>0</td><td>3 × 1 = 3, 2 × 4 = 8, 1 × 6 = 6</td><td>0</td></tr>
  </table>
<div class="fx" data-lang="py">def largest_rectangle(heights):
    stack, best = [], 0                       # indices, heights increasing
    for i, h in enumerate(heights + [0]):     # sentinel 0 empties the stack
        while stack and heights[stack[-1]] &gt;= h:
            height = heights[stack.pop()]
            left = stack[-1] + 1 if stack else 0   # first bar after the shorter one on the left
            best = max(best, height * (i - left))
        stack.append(i)
    return best

for hs in [[2, 1, 5, 6, 2, 3], [2, 4], [3, 3, 3], [], [6, 2, 5, 4, 5, 1, 6]]:
    print(hs, "-&gt;", largest_rectangle(hs))</div>
  <div class="fx" data-lang="text">[2, 1, 5, 6, 2, 3] -&gt; 10
[2, 4] -&gt; 4
[3, 3, 3] -&gt; 9
[] -&gt; 0
[6, 2, 5, 4, 5, 1, 6] -&gt; 12</div>
  <p>The first answer is 10, found at i = 4 exactly as in the trace. Equal heights (<code>[3, 3, 3]</code>) give 9 because popping on <code>&gt;=</code> lets the last equal bar compute the full width. The whole thing is O(n) time and space, for the same push-once, pop-once reason as before.</p>
  <p><strong>Evaluate Reverse Polish Notation.</strong> In postfix notation (also called Reverse Polish Notation, RPN) the operator comes <em>after</em> its two numbers: <code>["120", "80", "+", "2", "*"]</code> means (120 + 80) × 2. Postfix needs no brackets and no precedence rules, which is why old calculators and the Java virtual machine use it. Evaluating it is a pure stack job: push numbers; when an operator arrives, pop the top two numbers, apply the operator, and push the result. The one subtle point is the order: the first value popped is the <em>right</em> operand.</p>
<div class="fx" data-lang="py">def eval_rpn(tokens):
    stack = []
    for tok in tokens:
        if tok in {"+", "-", "*", "/"}:
            b = stack.pop()                   # right operand comes off first
            a = stack.pop()
            if tok == "+":   stack.append(a + b)
            elif tok == "-": stack.append(a - b)
            elif tok == "*": stack.append(a * b)
            else:            stack.append(int(a / b))   # truncate toward zero
        else:
            stack.append(int(tok))
    return stack[0]

print(eval_rpn(["120", "80", "+", "2", "*"]))
print(eval_rpn(["4", "13", "5", "/", "+"]))
print(eval_rpn(["-7", "2", "/"]), "vs floor division:", -7 // 2)</div>
  <div class="fx" data-lang="text">400
6
-3 vs floor division: -4</div>
  <p>Biteful's expression gives 400. In the second, 13 / 5 is evaluated first (2), then added to 4. The last line shows a classic trap: the problem says division truncates toward zero, so −7 / 2 must be −3, but Python's <code>//</code> rounds down to −4. <code>int(a / b)</code> gives the truncated answer. Note also that <code>"-7"</code> is a negative number, not an operator, which is why the code compares whole tokens.</p>
  <p><strong>Basic Calculator.</strong> Now evaluate an ordinary string with <code>+</code>, <code>-</code>, brackets and spaces, such as <code>"310 - (120 + 80)"</code>, without using <code>eval</code>. Without brackets it is easy: keep a running <code>result</code> and the <code>sign</code> (+1 or −1) of the number being read. A <code>(</code> starts a fresh sub-calculation, so we <em>save</em> the current result and sign on a stack and start again from 0; at the matching <code>)</code> we finish the inner result and <em>restore</em>: outer result + outer sign × inner result. The stack holds one saved state per open bracket, which is exactly the "most recent unfinished thing" again.</p>
<div class="fx" data-lang="py">def calculate(s):
    stack, result, num, sign = [], 0, 0, 1
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)          # multi-digit numbers
        elif ch in "+-":
            result += sign * num
            num, sign = 0, (1 if ch == "+" else -1)
        elif ch == "(":
            stack.append(result)              # save the outer state
            stack.append(sign)
            result, sign = 0, 1
        elif ch == ")":
            result += sign * num
            num = 0
            result = result * stack.pop() + stack.pop()   # sign first, then outer result
    return result + sign * num

for expr in ["310 - (120 + 80)", "(1+(4+5+2)-3)+(6+8)", "-(2+3)", "1-(     -2)"]:
    print(repr(expr), "-&gt;", calculate(expr))</div>
  <div class="fx" data-lang="text">'310 - (120 + 80)' -&gt; 110
'(1+(4+5+2)-3)+(6+8)' -&gt; 23
'-(2+3)' -&gt; -5
'1-(     -2)' -&gt; 3</div>
  <p>310 − (120 + 80) is 110. The nested example gives 23, and the unary minus cases work because a leading <code>-</code> simply sets the sign before the bracket. The cost is O(n) time and O(depth of brackets) space.</p>
  <p>For practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, a good order is: start with plain stacks (<b>1047 Remove All Adjacent Duplicates In String</b>, <b>2390 Removing Stars From a String</b>, <b>682 Baseball Game</b>), which teach push and pop as "cancel the previous". Then <b>20 Valid Parentheses</b> and <b>921 Minimum Add to Make Parentheses Valid</b> for matching, and <b>155 Min Stack</b> for storing extra information. For queues, <b>933 Number of Recent Calls</b> and <b>232 Implement Queue using Stacks</b>, then <b>994 Rotting Oranges</b> for BFS. Move on to the monotonic stack with <b>496 Next Greater Element I</b>, <b>739 Daily Temperatures</b> and <b>901 Online Stock Span</b>, then the deque with <b>239 Sliding Window Maximum</b>. Finish with the hard ones from this section: <b>150 Evaluate Reverse Polish Notation</b>, <b>394 Decode String</b>, <b>84 Largest Rectangle in Histogram</b> and <b>224 Basic Calculator</b>. For each one, fill in a small trace table like the ones on this page before writing code; once the table is right, the code is short.</p>

  <h2 id="dsa-sq-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common slip is popping or peeking an empty stack. <code>stack[-1]</code> and <code>stack.pop()</code> on an empty list raise <code>IndexError</code>, and it usually happens inside a monotonic-stack loop. The guard <code>stack and …</code> must come <em>first</em> in the condition, because Python stops evaluating <code>and</code> as soon as the left side is false:</p>
<div class="fx" data-lang="py">nums, stack = [5, 7], []
try:
    for x in nums:
        while nums[stack[-1]] &lt; x and stack:      # wrong order: peeks before checking
            stack.pop()
        stack.append(0)
except IndexError as e:
    print("IndexError:", e)

stack = []
for i, x in enumerate(nums):
    while stack and nums[stack[-1]] &lt; x:          # right: check emptiness first
        stack.pop()
    stack.append(i)
print("fixed:", stack)</div>
  <div class="fx" data-lang="text">IndexError: list index out of range
fixed: [1]</div>
  <p>The first loop crashes on its very first comparison, because it reads <code>stack[-1]</code> of an empty stack before testing whether the stack has anything in it. Swapping the two conditions fixes it.</p>
  <p>The second mistake is choosing <code>&lt;</code> versus <code>&lt;=</code> carelessly in a monotonic stack. O2 and O6 both have a ₹80 bill: is ₹80 "greater" than ₹80? With <code>&lt;</code> (strictly greater) equal bills keep waiting; with <code>&lt;=</code> an equal bill answers them. Both are reasonable; the problem statement decides. Test with repeated values:</p>
<div class="fx" data-lang="py">def ng(nums, strict=True):
    ans, stack = [-1] * len(nums), []
    for i, x in enumerate(nums):
        while stack and (nums[stack[-1]] &lt; x if strict else nums[stack[-1]] &lt;= x):
            ans[stack.pop()] = x
        stack.append(i)
    return ans

print("strictly greater:", ng([80, 80, 90]))
print("greater or equal:", ng([80, 80, 90], strict=False))</div>
  <div class="fx" data-lang="text">strictly greater: [90, 90, -1]
greater or equal: [80, 90, -1]</div>
  <p>With strict comparison the first ₹80 waits for ₹90; with <code>&lt;=</code> it is answered by the second ₹80. A wrong choice gives silently wrong answers only on inputs with duplicates, which is exactly what hidden tests contain.</p>
  <p>A few other mistakes are worth knowing by name. Using a list with <code>pop(0)</code> as a queue, especially inside BFS, turns an O(n) algorithm into O(n²) and times out on large grids (section 04 measured it). Storing <em>values</em> instead of <em>indices</em> on a monotonic stack or deque breaks every problem that needs a distance (days until warmer) or an expiry check (sliding window). Forgetting the leftovers after the loop is another: items still on the stack mean unclosed brackets, orders with no bigger bill, or histogram bars that still need their area computed (which is why we added the sentinel 0). In RPN, popping the operands in the wrong order computes b − a instead of a − b, and using <code>//</code> where the problem says "truncate toward zero" gives the wrong answer for negative numbers. Finally, a min stack with a single <code>min</code> variable breaks the moment the minimum is popped, and marking BFS cells as seen when they are popped instead of when they are added lets duplicates flood the queue.</p>

  <h2 id="dsa-sq-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Stack</b>: add and remove at one end (the top); LIFO, last in first out.</li>
    <li><b>Queue</b>: add at the rear, remove from the front; FIFO, first in first out.</li>
    <li><b>Deque</b>: double-ended queue; O(1) add and remove at both ends.</li>
    <li><b>Min stack</b>: each entry stores (value, minimum of everything at or below it).</li>
    <li><b>Amortised cost</b>: average cost per operation over any long sequence (two-stack queue, list append).</li>
    <li><b>BFS</b>: explore in order of discovery using a queue; first arrival = shortest path when steps cost the same.</li>
    <li><b>Monotonic stack</b>: stack kept sorted; each pop is the moment an item's next greater/smaller is found.</li>
    <li><b>Monotonic deque</b>: deque of indices kept sorted; back evicts weaker items, front expires old ones; front = window max.</li>
  </ul>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Cost</th><th>Note</th></tr>
    <tr><td>list <code>append</code>, <code>pop()</code>, <code>[-1]</code></td><td>O(1)</td><td>use the end as the top</td></tr>
    <tr><td>list <code>pop(0)</code>, <code>insert(0, x)</code></td><td>O(n)</td><td>everything shifts; never a queue</td></tr>
    <tr><td>deque <code>append</code>, <code>popleft</code>, <code>appendleft</code>, <code>pop</code></td><td>O(1)</td><td>middle access is O(n)</td></tr>
    <tr><td>valid parentheses</td><td>O(n) time, O(n) space</td><td>stack must be empty at the end</td></tr>
    <tr><td>two-stack queue</td><td>amortised O(1)</td><td>pour only when the outbox is empty</td></tr>
    <tr><td>BFS</td><td>O(V + E)</td><td>mark seen when added</td></tr>
    <tr><td>monotonic stack / deque</td><td>O(n) time</td><td>each index pushed once, popped at most once</td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py">from collections import deque

stack = []; stack.append(x); top = stack[-1]; stack.pop()
q = deque(); q.append(x); front = q[0]; q.popleft()

# monotonic stack: next greater
for i, x in enumerate(nums):
    while stack and nums[stack[-1]] &lt; x:
        ans[stack.pop()] = x
    stack.append(i)

# monotonic deque: window max of size k
for i, x in enumerate(nums):
    while dq and nums[dq[-1]] &lt;= x: dq.pop()
    dq.append(i)
    if dq[0] &lt;= i - k: dq.popleft()
    if i &gt;= k - 1: out.append(nums[dq[0]])</div>
  <h3>Running example</h3>
  <ul>
    <li>Bills O1..O8: 120, 80, 250, 40, 310, 80, 60, 200.</li>
    <li>Next greater: 250, 250, 310, 310, −1, 200, 200, −1. Window-3 max: 250, 250, 310, 310, 310, 200.</li>
    <li>Min stack after 120, 80, 250, 40: 40; after one undo: 80.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Guard with <code>stack and …</code> before peeking; the guard comes first.</li>
    <li><code>&lt;</code> vs <code>&lt;=</code> decides how equal values are treated.</li>
    <li>Store indices on monotonic structures, not values.</li>
    <li>Handle leftovers after the loop (or use a sentinel).</li>
    <li>RPN: first pop is the right operand; truncate with <code>int(a / b)</code>, not <code>//</code>.</li>
  </ul>

  <h2 id="dsa-sq-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a stack and a queue? Give a real use of each.</summary><div class="qa-body">A stack removes the newest item first (LIFO); a queue removes the oldest item first (FIFO). A stack fits "the most recent unfinished thing": undo, the browser Back button, the function call stack, bracket matching. A queue fits "who has waited longest": print jobs, task queues, kitchen tickets, BFS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you implement a stack and a queue in Python?</summary><div class="qa-body">A stack is a plain list using only its end: <code>append</code> to push, <code>pop()</code> to pop, <code>s[-1]</code> to peek, all O(1). A queue is <code>collections.deque</code> with <code>append</code> to enqueue and <code>popleft()</code> to dequeue, both O(1). Neither needs a custom class for most problems.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a list a bad queue?</summary><div class="qa-body">Removing from the front with <code>pop(0)</code> shifts every remaining item one place left, so each dequeue is O(n) and draining n items is O(n²). A deque is built from linked blocks, so removing from either end moves nothing and is O(1). On 2 lakh items the difference is hundreds of times.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time complexity of push, pop and peek on a stack, and of searching it?</summary><div class="qa-body">Push, pop and peek are O(1) because they only touch the top. Searching for an arbitrary value is O(n), because you would have to look through every item; stacks are not meant for search. If you need lookups, use a set or dict alongside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does checking balanced brackets need a stack and not a counter?</summary><div class="qa-body">A counter knows how many brackets are open, but not which kind was opened most recently. Nesting requires each closer to match the most recent unclosed opener, which is exactly the top of a stack. <code>([)]</code> has balanced counts but fails because <code>)</code> meets <code>[</code> on top. A counter is enough only when there is a single bracket type.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a min stack return the minimum in O(1), even after pops?</summary><div class="qa-body">Each entry stores the value together with the minimum of itself and everything below it. <code>get_min</code> reads the top entry's stored minimum. When an entry is popped, the entry below already holds the correct minimum for the remaining stack, so nothing has to be recomputed. A single variable fails because it forgets the previous minimum.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you build a queue from two stacks, and what is its cost?</summary><div class="qa-body">Push into an inbox stack; pop from an outbox stack; when the outbox is empty, pour the whole inbox into it, which reverses the order so the oldest is on top. One pop can be O(n), but each item is pushed, poured and popped once, so n operations cost O(n) in total: amortised O(1) per operation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "amortised O(1)" mean?</summary><div class="qa-body">It means the average cost per operation over any long sequence is constant, even though a few individual operations are expensive. The expensive ones (a pour in the two-stack queue, a resize in <code>list.append</code>) happen rarely enough that their cost, spread over all operations, adds only a constant. It is a guarantee about sequences, not about every single call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you replace the queue in BFS with a stack?</summary><div class="qa-body">The search becomes depth-first: it follows the newest discovery and dives down one branch before backtracking. It still visits everything reachable, but you lose the guarantee that the first time you reach a node is by a shortest path, which only the ring-by-ring order of a queue gives in unweighted graphs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In BFS, why mark a node as seen when it is added to the queue rather than when it is removed?</summary><div class="qa-body">If you mark on removal, several neighbours can each add the same node before it is ever processed, so the queue fills with duplicates and the work can blow up. Marking on addition guarantees each node enters the queue once, keeping BFS at O(V + E).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a monotonic stack and when do you use it?</summary><div class="qa-body">It is a stack whose values are kept in sorted order; before pushing a new item you pop every item it "beats", and each pop is the moment that item's answer is found. Use it when every element needs its next or previous greater or smaller element: next greater element, daily temperatures, stock span, largest rectangle in a histogram, trapping rain water.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The monotonic stack has a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body">Count stack operations rather than loop iterations. Each index is pushed exactly once and popped at most once, so across the whole run there are at most 2n stack moves, however they are distributed among the iterations. On the 8 bills there were 8 pushes and 6 pops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do monotonic stacks and deques usually store indices instead of values?</summary><div class="qa-body">An index gives you the value (<code>nums[i]</code>) and the position. Position is needed for distances, such as "how many days until a warmer day" (i − j), and for expiry in a sliding window (is the front's index ≤ i − k?). With duplicate values, indices also tell equal items apart.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the sliding window maximum run in O(n), and why can smaller items be discarded?</summary><div class="qa-body">A deque holds indices with decreasing values. A new item evicts smaller items from the back, because it is bigger and will stay in the window longer, so they can never be a future maximum. The front leaves when its index falls outside the window, and the front is always the current maximum. Each index enters and leaves once, so the total is O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Largest Rectangle in Histogram, what do you learn when a bar is popped?</summary><div class="qa-body">The current index is the first shorter bar to its right, and the new top of the stack is the first shorter bar to its left. So the widest rectangle at the popped bar's full height spans between those two, and its area can be computed at that moment. A sentinel of height 0 at the end pops the remaining bars.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>s = [1, 2, 3]; s.append(s.pop() - s.pop()); print(s)</code></summary><div class="qa-body"><code>[1, 1]</code>. The first pop returns 3 and the second returns 2, so it computes 3 − 2 = 1. This is the reverse of RPN's rule, where the first value popped is the right operand: you must write <code>b = pop(); a = pop(); a - b</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you evaluate an expression with brackets, such as <code>"310 - (120 + 80)"</code>, without eval?</summary><div class="qa-body">Scan left to right keeping a running result and the current sign. At <code>(</code>, push the result and sign onto a stack and start a fresh result; at <code>)</code>, finish the inner result and combine it with the saved state: outer result + saved sign × inner result. One saved state per open bracket handles any nesting depth in O(n). With <code>*</code> and <code>/</code>, push signed numbers and combine with the top immediately for the higher-precedence operators.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a heap over a queue?</summary><div class="qa-body">When "next" means the most urgent or best item rather than the oldest. A queue serves strictly in arrival order, so an urgent order that arrived late would wait behind everyone; a heap (priority queue) always hands out the item with the best priority in O(log n). Swapping BFS's queue for a heap is exactly how Dijkstra's algorithm handles roads of different lengths.</div></details>
</main>
`
});
