// notes/dsa/dsa_stacks.js — Stacks & Queues
Object.assign(TOPIC_CONTENT, {
  "dsa_stacks": `<main>
<h1>Stacks &amp; Queues</h1>
  <p class="lead">A stack gives back the newest item first; a queue gives back the oldest. These two tiny rules power undo buttons, bracket checking, expression evaluation, BFS, and the "monotonic stack" trick behind many hard-looking interview problems. In Python a stack is just a list and a queue is <code>collections.deque</code>. Builds on lists; the linked list note shows another way to build both.</p>

  <h2 id="dsa-sq-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Stacks &amp; Queues</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Two rules</div>
        <ul>
          <li><b>Stack = LIFO</b> — last in, first out (pile of plates)</li>
          <li><b>Queue = FIFO</b> — first in, first out (ticket line)</li>
          <li>Both: add, remove, peek in <b>O(1)</b></li>
          <li>No search, no middle access: that is the point</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In Python</div>
        <ul>
          <li><b>Stack</b> — list: <code>append</code>, <code>pop()</code>, <code>[-1]</code></li>
          <li><b>Queue</b> — <code>deque</code>: <code>append</code>, <code>popleft</code></li>
          <li>⚠ <code>list.pop(0)</code> is O(n): every item shifts left</li>
          <li><code>queue.Queue</code> only for threads</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stack uses</div>
        <ul>
          <li>Matching brackets, undo, browser back</li>
          <li>Function call stack, DFS, recursion → loop</li>
          <li>Expressions: RPN, calculators</li>
          <li><b>Min stack</b> — store (value, min so far)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Queue uses</div>
        <ul>
          <li><b>BFS</b> — level by level, shortest path in unweighted graphs</li>
          <li>Task queues, printers, rate limiters, buffers</li>
          <li><b>Two stacks → queue</b>, amortized O(1)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Monotonic stack</div>
        <ul>
          <li>Stack kept increasing or decreasing</li>
          <li><b>Signal</b> — "next greater / smaller", "how many days until", "span"</li>
          <li>Each index pushed once, popped once → <b>O(n)</b></li>
          <li>Histogram: pop = "this bar's rectangle ends here"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Monotonic deque</div>
        <ul>
          <li><b>Sliding window max/min</b> in O(n)</li>
          <li>Back: pop smaller items (they can't win)</li>
          <li>Front: pop index that left the window</li>
          <li>Front is always the answer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Valid Parentheses</b> · <b>Min Stack</b> · <b>Queue via Stacks</b></li>
          <li><b>Daily Temperatures</b> · <b>Next Greater Element</b> · <b>Largest Rectangle</b></li>
          <li><b>Sliding Window Max</b> · <b>Evaluate RPN</b> · <b>Basic Calculator</b></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-sq-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Plates and Lines</span><span class="rm-sub">LIFO vs FIFO</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-stack"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">A List as a Stack</span><span class="rm-sub">append, pop, peek</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-queue"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Queues: Use deque</span><span class="rm-sub">Why not list.pop(0)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-impl"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">A Queue From Two Stacks</span><span class="rm-sub">Amortized O(1)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-bfs"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">BFS Runs on a Queue</span><span class="rm-sub">Level by level, shortest path</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-mono"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Monotonic Stack</span><span class="rm-sub">Next greater element in O(n)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-deque"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Monotonic Deque</span><span class="rm-sub">Sliding window maximum</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-patterns"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-problems"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">8 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">pop(0), empty pops, // vs truncation</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-sq-need"><span class="num">01</span>Plates and Lines</h2>
  <p>At a wedding buffet, clean plates are stacked. Staff put new plates on top, and guests take from the top. The plate washed last is used first. Nobody pulls a plate from the bottom.</p>
  <p>At the railway ticket counter it is the opposite. People join at the back and the person at the front is served first. Whoever came first leaves first.</p>
<figure class="viz"><svg viewBox="0 0 600 230" width="600"><defs><marker id="sq-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="120" y="20" class="tb" text-anchor="middle">STACK (LIFO)</text><rect x="60" y="190" width="120" height="30" rx="4" class="fb sb"/><text x="120" y="210" text-anchor="middle">plate 1</text><rect x="60" y="154" width="120" height="30" rx="4" class="fb sb"/><text x="120" y="174" text-anchor="middle">plate 2</text><rect x="60" y="118" width="120" height="30" rx="4" class="fb sb"/><text x="120" y="138" text-anchor="middle">plate 3</text><rect x="60" y="82" width="120" height="30" rx="4" class="fr sr"/><text x="120" y="102" text-anchor="middle">plate 4</text><text x="190" y="104" class="tr">← top</text><text x="120" y="50" class="tm" text-anchor="middle">push / pop here only</text><path d="M100 58 v20" stroke="currentColor" marker-end="url(#sq-a)"/><path d="M140 78 v-20" stroke="currentColor" marker-end="url(#sq-a)"/><text x="430" y="20" class="tg" text-anchor="middle">QUEUE (FIFO)</text><rect x="290" y="100" width="62" height="34" rx="4" class="fg sg"/><text x="321" y="122" text-anchor="middle">Asha</text><rect x="360" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="391" y="122" text-anchor="middle">Ravi</text><rect x="430" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="461" y="122" text-anchor="middle">Neha</text><rect x="500" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="531" y="122" text-anchor="middle">Om</text><text x="321" y="160" class="tg" text-anchor="middle">front</text><text x="531" y="160" class="tm" text-anchor="middle">rear</text><path d="M290 117 h-40" stroke="currentColor" marker-end="url(#sq-a)"/><text x="268" y="92" class="tm" text-anchor="middle">leave</text><path d="M598 117 h-34" stroke="currentColor" marker-end="url(#sq-a)"/><text x="570" y="92" class="tm" text-anchor="middle">join</text><text x="430" y="200" class="tm" text-anchor="middle">join at the rear, leave from the front</text></svg><figcaption>Stack: the last plate put on is the first taken off. Queue: the first person in line is the first served. Same items, opposite order.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Stack</strong>: a collection where you add and remove only at one end, the <em>top</em>. Last in, first out (<strong>LIFO</strong>). Operations: <code>push</code>, <code>pop</code>, <code>peek</code>.<br><strong>Queue</strong>: add at the <em>rear</em>, remove from the <em>front</em>. First in, first out (<strong>FIFO</strong>). Operations: <code>enqueue</code>, <code>dequeue</code>, <code>peek</code>.</p>
  </div>
  <p>Why use something that can do <em>less</em> than a list? Because the limit is the meaning. A stack answers "what is the most recent unfinished thing?" — the last opened bracket, the previous page, the function that called me. A queue answers "who has waited longest?" — the next print job, the next node to explore.</p>
  <table class="tbl">
    <tr><th></th><th>Stack</th><th>Queue</th></tr>
    <tr><td>Order out</td><td>Newest first (LIFO)</td><td>Oldest first (FIFO)</td></tr>
    <tr><td>Python</td><td><code>list</code></td><td><code>collections.deque</code></td></tr>
    <tr><td>Add / remove / peek</td><td>O(1) / O(1) / O(1)</td><td>O(1) / O(1) / O(1)</td></tr>
    <tr><td>Seen in</td><td>Undo, back button, call stack, bracket matching, DFS</td><td>BFS, task schedulers, printer spool, message queues (Kafka, SQS)</td></tr>
  </table>

  <h2 id="dsa-sq-stack"><span class="num">02</span>A List as a Stack</h2>
  <p>A Python list already is a good stack. The end of the list is the top. <code>append</code> pushes, <code>pop()</code> removes the last item, <code>[-1]</code> peeks. All O(1), because nothing else in the list moves.</p>
<div class="fx" data-lang="py">history = []                       # browser back button
for page in ["home", "search", "product", "cart"]:
    history.append(page)           # push
print("stack:", history, "| top:", history[-1])
print("back -&gt;", history.pop(), "| now on:", history[-1])
print("size:", len(history), "| empty?", not history)

try:
    [].pop()
except IndexError as e:
    print("pop on empty:", e)</div>
  <div class="fx" data-lang="text">stack: ['home', 'search', 'product', 'cart'] | top: cart
back -&gt; cart | now on: product
size: 3 | empty? False
pop on empty: pop from empty list</div>  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ctrl+Z in a text editor. Every edit is pushed. Undo pops the latest edit. Undo again pops the one before. You never undo your first edit before your last.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Your program already runs on a stack. When <code>f</code> calls <code>g</code>, Python pushes a frame for <code>g</code>; when <code>g</code> returns, the frame is popped and <code>f</code> continues. That is why any recursion can be rewritten as a loop with your own stack — and why too-deep recursion gives <code>RecursionError</code> (the call stack is full).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Popping or peeking an empty stack raises <code>IndexError</code>. In problems, always guard: <code>if stack and stack[-1] == ...</code>. And use the <em>end</em> of the list as the top: <code>insert(0, x)</code> / <code>pop(0)</code> are O(n).</p>
  </div>

  <h2 id="dsa-sq-queue"><span class="num">03</span>Queues: Use deque</h2>
  <p>The obvious queue is a list with <code>append</code> to join and <code>pop(0)</code> to leave. It gives correct answers, but <code>pop(0)</code> is slow. A list is one block of memory; removing the first item means every other item must shift one place left. With a million people in the line, every "next please" moves a million items: O(n).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bench where people must sit packed from the left end. When the first person leaves, everybody slides one seat left. A <code>deque</code> is a bench where people simply get up from either end and nobody slides.</p>
  </div>
  <p><code>collections.deque</code> ("deck", double-ended queue) is built from linked blocks, so adding or removing at <em>either</em> end is O(1).</p>
<div class="fx" data-lang="py">from collections import deque

line = deque(["Asha", "Ravi"])
line.append("Neha")                 # join at the rear
print("served:", line.popleft(), "| waiting:", list(line), "| next:", line[0])
line.appendleft("Om")               # cut in at the front (deque allows both ends)
print(list(line), "| from the rear:", line.pop())

recent = deque(maxlen=3)            # keeps only the last 3 items
for song in ["s1", "s2", "s3", "s4", "s5"]:
    recent.append(song)
print("recently played:", list(recent))</div>
  <div class="fx" data-lang="text">served: Asha | waiting: ['Ravi', 'Neha'] | next: Ravi
['Om', 'Ravi', 'Neha'] | from the rear: Neha
recently played: ['s3', 's4', 's5']</div>  <table class="tbl">
    <tr><th>Operation</th><th>list</th><th>deque</th></tr>
    <tr><td>Add / remove at the right</td><td>O(1)</td><td>O(1)</td></tr>
    <tr><td>Add / remove at the left</td><td><strong>O(n)</strong> (<code>insert(0, x)</code>, <code>pop(0)</code>)</td><td><strong>O(1)</strong> (<code>appendleft</code>, <code>popleft</code>)</td></tr>
    <tr><td>Index in the middle <code>x[i]</code></td><td>O(1)</td><td>O(n) (fine at the ends)</td></tr>
    <tr><td>Slicing</td><td>Yes</td><td>No</td></tr>
  </table>
  <p>Other queues in Python: <code>queue.Queue</code> is a thread-safe queue for producer/consumer threads (slower, has locks, not for algorithms). <code>heapq</code> is a <em>priority</em> queue (most urgent first, see the heaps note). <code>asyncio.Queue</code> is for async code.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using a list with <code>pop(0)</code> in BFS. On a grid of 10⁶ cells it turns an O(n) search into O(n²) and times out. Interviewers notice this immediately. Always <code>from collections import deque</code>.</p>
  </div>

  <h2 id="dsa-sq-impl"><span class="num">04</span>A Queue From Two Stacks</h2>
  <p>A favourite interview question (LeetCode 232): build a FIFO queue using only stack operations. The trick: pouring a stack into another stack reverses it. Reverse LIFO, and you get FIFO.</p>
<figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="sq-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="130" y="18" class="tb" text-anchor="middle">inbox (push here)</text><text x="470" y="18" class="tg" text-anchor="middle">outbox (pop here)</text><rect x="100" y="150" width="60" height="28" class="fb sb"/><text x="130" y="169" text-anchor="middle">1</text><rect x="100" y="116" width="60" height="28" class="fb sb"/><text x="130" y="135" text-anchor="middle">2</text><rect x="100" y="82" width="60" height="28" class="fb sb"/><text x="130" y="101" text-anchor="middle">3</text><rect x="440" y="150" width="60" height="28" class="fg sg"/><text x="470" y="169" text-anchor="middle">3</text><rect x="440" y="116" width="60" height="28" class="fg sg"/><text x="470" y="135" text-anchor="middle">2</text><rect x="440" y="82" width="60" height="28" class="fr sr"/><text x="470" y="101" text-anchor="middle">1</text><path d="M180 110 C 260 80, 340 80, 420 110" fill="none" stroke="currentColor" marker-end="url(#sq-b)"/><text x="300" y="40" text-anchor="middle">only when outbox is empty:</text><text x="300" y="58" class="tm" text-anchor="middle">pop all from inbox, push to outbox</text><text x="510" y="102" class="tr">← oldest</text><text x="300" y="194" class="tm" text-anchor="middle">pouring a stack into another reverses it: LIFO + LIFO = FIFO</text></svg><figcaption>Queue from two stacks. 1, 2, 3 were pushed into the inbox (3 on top). Pouring them into the outbox flips the order, so 1, the oldest, is now on top and pops first.</figcaption></figure>
  <p>New items always go into the <strong>inbox</strong>. To remove, take from the <strong>outbox</strong>. Only when the outbox is empty, pour the whole inbox into it. Never pour while the outbox still has items, or newer items would land on top of older ones.</p>
<div class="fx" data-lang="py">class MyQueue:
    def __init__(self):
        self.inbox, self.outbox = [], []

    def push(self, x):
        self.inbox.append(x)

    def _refill(self):
        if not self.outbox:                     # only when outbox is empty
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def pop(self):
        self._refill()
        return self.outbox.pop()

    def peek(self):
        self._refill()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox

q = MyQueue()
for x in [1, 2, 3]:
    q.push(x)
print("peek:", q.peek(), "| pop:", q.pop(), "| inbox:", q.inbox, "outbox:", q.outbox)
q.push(4)
print("pops:", q.pop(), q.pop(), q.pop(), "| empty:", q.empty())</div>
  <div class="fx" data-lang="text">peek: 1 | pop: 1 | inbox: [] outbox: [3, 2]
pops: 2 3 4 | empty: True</div>  <p><strong>Cost.</strong> A single <code>pop</code> can be O(n) when it pours. But each item is moved from inbox to outbox <em>at most once</em> in its life: pushed once, poured once, popped once. So n operations cost O(n) in total, which is <strong>amortized O(1)</strong> per operation.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Amortized cost</strong>: the average cost per operation over any long sequence, even if a few single operations are expensive. Python's <code>list.append</code> is the same story: an occasional resize is O(n), but the average stays O(1).</p>
  </div>

  <h2 id="dsa-sq-bfs"><span class="num">05</span>BFS Runs on a Queue</h2>
  <p>Drop a stone in a pond. The ripple reaches everything 1 step away, then everything 2 steps away, and so on. <strong>Breadth-first search</strong> explores a graph the same way, and a queue is what keeps the order: places found earlier are explored earlier. Swap the queue for a stack and the same loop becomes depth-first search (go deep first).</p>
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
stack (DFS): ['A', 'C', 'F', 'B', 'E', 'D']</div>  <p>Because BFS reaches every place in order of distance, the first time it reaches the goal is along a shortest path (when every step costs the same). That makes it the standard tool for "minimum moves" questions on grids.</p>
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

maze = ["..#.",
        ".##.",
        "....",
        "#.#."]
print(shortest_path(maze, (0, 0), (0, 3)), shortest_path(maze, (0, 0), (3, 1)), shortest_path([".#", "#."], (0, 0), (1, 1)))</div>
  <div class="fx" data-lang="text">7 4 -1</div>  <div class="callout trap"><span class="label">Trap</span>
    <p>Mark a cell as seen when you <em>add</em> it to the queue, not when you pop it. Otherwise the same cell is added many times by different neighbours, and the queue can blow up. The graphs note covers BFS in depth.</p>
  </div>

  <h2 id="dsa-sq-mono"><span class="num">06</span>Monotonic Stack</h2>
  <p>A weather question: for each day, how many days until a warmer one? The direct way checks every later day for every day: O(n²). For a year of data that is fine; for 10⁵ days it is 10¹⁰ checks.</p>
<figure class="viz"><svg viewBox="0 0 600 270" width="600"><defs><marker id="sq-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><rect x="65" y="96" width="40" height="104" class="fb sb"/><text x="85" y="112" text-anchor="middle">73</text><text x="85" y="218" class="tm" text-anchor="middle">0</text><text x="85" y="244" class="tg" text-anchor="middle">1</text><rect x="127" y="88" width="40" height="112" class="fb sb"/><text x="147" y="104" text-anchor="middle">74</text><text x="147" y="218" class="tm" text-anchor="middle">1</text><text x="147" y="244" class="tg" text-anchor="middle">1</text><rect x="189" y="80" width="40" height="120" class="fb sb"/><text x="209" y="96" text-anchor="middle">75</text><text x="209" y="218" class="tm" text-anchor="middle">2</text><text x="209" y="244" class="tg" text-anchor="middle">4</text><rect x="251" y="112" width="40" height="88" class="fb sb"/><text x="271" y="128" text-anchor="middle">71</text><text x="271" y="218" class="tm" text-anchor="middle">3</text><text x="271" y="244" class="tg" text-anchor="middle">2</text><rect x="313" y="128" width="40" height="72" class="fb sb"/><text x="333" y="144" text-anchor="middle">69</text><text x="333" y="218" class="tm" text-anchor="middle">4</text><text x="333" y="244" class="tg" text-anchor="middle">1</text><rect x="375" y="104" width="40" height="96" class="fb sb"/><text x="395" y="120" text-anchor="middle">72</text><text x="395" y="218" class="tm" text-anchor="middle">5</text><text x="395" y="244" class="tg" text-anchor="middle">1</text><rect x="437" y="72" width="40" height="128" class="fb sb"/><text x="457" y="88" text-anchor="middle">76</text><text x="457" y="218" class="tm" text-anchor="middle">6</text><text x="457" y="244" class="tg" text-anchor="middle">0</text><rect x="499" y="96" width="40" height="104" class="fb sb"/><text x="519" y="112" text-anchor="middle">73</text><text x="519" y="218" class="tm" text-anchor="middle">7</text><text x="519" y="244" class="tg" text-anchor="middle">0</text><text x="10" y="218" class="tm">day</text><text x="10" y="244" class="tg">wait</text><path d="M91 92 Q 116.0 68 141 84" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M153 84 Q 178.0 60 203 76" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M215 76 Q 333.0 34 451 68" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M277 108 Q 333.0 78 389 100" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M339 124 Q 364.0 84 389 100" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M401 100 Q 426.0 52 451 68" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/></svg><figcaption>Daily temperatures. Each red arrow jumps from a day to the first warmer day ahead. "wait" is the gap. Day 2 (75) waits 4 days, because 71, 69 and 72 are all colder.</figcaption></figure>
  <p>Look at day 2 (75°). Days 3, 4, 5 are colder, so they are still waiting for their own warmer day. Who is waiting? A group of days, and the newest of them gets answered first when a warm day comes. Newest first — that is a stack.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Students wait in a corridor, each for "someone taller than me" to walk in. When a tall student arrives, every shorter student at the end of the waiting group gets the answer and leaves. Anyone taller than the newcomer keeps waiting, and the newcomer joins the end. So the waiting group, from first to last, always goes from tall to short: <strong>monotonic decreasing</strong>.</p>
  </div>
  <p>The template: walk left to right. Keep a stack of indices that are still waiting. When a new value is bigger than the value on top, the top's wait is over: pop it and record the answer. Repeat while that is true, then push the new index.</p>
<div class="fx" data-lang="py">def next_greater(nums, trace=False):
    ans = [-1] * len(nums)
    stack = []                                  # indices still waiting; values decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] &lt; x:    # x answers everyone smaller on top
            ans[stack.pop()] = x
        stack.append(i)
        if trace:
            print(f"i={i} x={x}  stack values={[nums[j] for j in stack]}  ans={ans}")
    return ans

next_greater([2, 1, 2, 4, 3], trace=True)</div>
  <div class="fx" data-lang="text">i=0 x=2  stack values=[2]  ans=[-1, -1, -1, -1, -1]
i=1 x=1  stack values=[2, 1]  ans=[-1, -1, -1, -1, -1]
i=2 x=2  stack values=[2, 2]  ans=[-1, 2, -1, -1, -1]
i=3 x=4  stack values=[4]  ans=[4, 2, 4, -1, -1]
i=4 x=3  stack values=[4, 3]  ans=[4, 2, 4, -1, -1]</div>  <p>Why O(n) even with a loop inside a loop? Each index is pushed once and popped at most once. Total pushes + pops ≤ 2n. That counting argument is the thing to say out loud in an interview.</p>
  <table class="tbl">
    <tr><th>Want</th><th>Stack keeps values</th><th>Pop when new x is</th></tr>
    <tr><td>Next greater</td><td>Decreasing</td><td><code>&gt;</code> top</td></tr>
    <tr><td>Next smaller</td><td>Increasing</td><td><code>&lt;</code> top</td></tr>
    <tr><td>Previous greater / smaller</td><td>Same stacks</td><td>Read the top <em>after</em> popping, before pushing</td></tr>
    <tr><td>Circular array</td><td>Same</td><td>Loop i over 2n, use <code>i % n</code></td></tr>
  </table>

  <h2 id="dsa-sq-deque"><span class="num">07</span>Monotonic Deque</h2>
  <p>Now a window of size k slides across the list, and we want the maximum of each window. Recomputing <code>max</code> for each window is O(n·k). A heap works in O(n log n) but needs lazy deletion. A deque does it in O(n).</p>
  <p>The idea: when a new number arrives, every older, smaller number in the window can <em>never</em> be the max again — the new one is bigger and will stay in the window longer. So throw them out from the back. What remains is decreasing from front to back, and the front is the max. The front also leaves when it slides out of the window.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket selector watching the last k matches for the best batter. A young player scores 120. Every older player who scored less is dropped from consideration for good: they are worse <em>and</em> will retire from the window sooner.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 600 250" width="600"><text x="10" y="26" class="tm">nums</text><rect x="150" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="174" y="28" text-anchor="middle">1</text><text x="174" y="50" class="tm" text-anchor="middle">0</text><rect x="198" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="222" y="28" text-anchor="middle">3</text><text x="222" y="50" class="tm" text-anchor="middle">1</text><rect x="246" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="270" y="28" text-anchor="middle">-1</text><text x="270" y="50" class="tm" text-anchor="middle">2</text><rect x="294" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="318" y="28" text-anchor="middle">-3</text><text x="318" y="50" class="tm" text-anchor="middle">3</text><rect x="342" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="366" y="28" text-anchor="middle">5</text><text x="366" y="50" class="tm" text-anchor="middle">4</text><rect x="390" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="414" y="28" text-anchor="middle">3</text><text x="414" y="50" class="tm" text-anchor="middle">5</text><rect x="438" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="462" y="28" text-anchor="middle">6</text><text x="462" y="50" class="tm" text-anchor="middle">6</text><rect x="486" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="510" y="28" text-anchor="middle">7</text><text x="510" y="50" class="tm" text-anchor="middle">7</text><text x="10" y="76" class="tm">window</text><text x="250" y="76" class="tb">deque (indices)</text><text x="390" y="76" class="tm">their values</text><text x="530" y="76" class="tg">max</text><g class="fs"><rect x="118" y="85" width="13" height="13"/><rect x="134" y="85" width="13" height="13"/><rect x="150" y="85" width="13" height="13"/><rect x="166" y="85" width="13" height="13"/><rect x="182" y="85" width="13" height="13"/></g><g class="fb sb"><rect x="70" y="85" width="13" height="13"/><rect x="86" y="85" width="13" height="13"/><rect x="102" y="85" width="13" height="13"/></g><text x="250" y="96">[1, 2]</text><text x="390" y="96" class="tm">3, -1</text><text x="530" y="96" class="tg">3</text><g class="fs"><rect x="70" y="109" width="13" height="13"/><rect x="134" y="109" width="13" height="13"/><rect x="150" y="109" width="13" height="13"/><rect x="166" y="109" width="13" height="13"/><rect x="182" y="109" width="13" height="13"/></g><g class="fb sb"><rect x="86" y="109" width="13" height="13"/><rect x="102" y="109" width="13" height="13"/><rect x="118" y="109" width="13" height="13"/></g><text x="250" y="120">[1, 2, 3]</text><text x="390" y="120" class="tm">3, -1, -3</text><text x="530" y="120" class="tg">3</text><g class="fs"><rect x="70" y="133" width="13" height="13"/><rect x="86" y="133" width="13" height="13"/><rect x="150" y="133" width="13" height="13"/><rect x="166" y="133" width="13" height="13"/><rect x="182" y="133" width="13" height="13"/></g><g class="fb sb"><rect x="102" y="133" width="13" height="13"/><rect x="118" y="133" width="13" height="13"/><rect x="134" y="133" width="13" height="13"/></g><text x="250" y="144">[4]</text><text x="390" y="144" class="tm">5</text><text x="530" y="144" class="tg">5</text><g class="fs"><rect x="70" y="157" width="13" height="13"/><rect x="86" y="157" width="13" height="13"/><rect x="102" y="157" width="13" height="13"/><rect x="166" y="157" width="13" height="13"/><rect x="182" y="157" width="13" height="13"/></g><g class="fb sb"><rect x="118" y="157" width="13" height="13"/><rect x="134" y="157" width="13" height="13"/><rect x="150" y="157" width="13" height="13"/></g><text x="250" y="168">[4, 5]</text><text x="390" y="168" class="tm">5, 3</text><text x="530" y="168" class="tg">5</text><g class="fs"><rect x="70" y="181" width="13" height="13"/><rect x="86" y="181" width="13" height="13"/><rect x="102" y="181" width="13" height="13"/><rect x="118" y="181" width="13" height="13"/><rect x="182" y="181" width="13" height="13"/></g><g class="fb sb"><rect x="134" y="181" width="13" height="13"/><rect x="150" y="181" width="13" height="13"/><rect x="166" y="181" width="13" height="13"/></g><text x="250" y="192">[6]</text><text x="390" y="192" class="tm">6</text><text x="530" y="192" class="tg">6</text><g class="fs"><rect x="70" y="205" width="13" height="13"/><rect x="86" y="205" width="13" height="13"/><rect x="102" y="205" width="13" height="13"/><rect x="118" y="205" width="13" height="13"/><rect x="134" y="205" width="13" height="13"/></g><g class="fb sb"><rect x="150" y="205" width="13" height="13"/><rect x="166" y="205" width="13" height="13"/><rect x="182" y="205" width="13" height="13"/></g><text x="250" y="216">[7]</text><text x="390" y="216" class="tm">7</text><text x="530" y="216" class="tg">7</text><text x="10" y="248" class="tm">k = 3 · deque values always decrease from front to back · front = max</text></svg><figcaption>Sliding window maximum, k = 3. The deque keeps only indices that could still become the max. A new big number (5 at index 4) throws out every smaller number behind it, because they can never win again.</figcaption></figure>
  <p>Store <strong>indices</strong>, not values: you need the index to know when the front has left the window. The full code is Sliding Window Maximum below. Each index enters and leaves the deque at most once: O(n) time, O(k) space.</p>

  <h2 id="dsa-sq-patterns"><span class="num">08</span>Patterns</h2>
  <table class="tbl">
    <tr><th>Pattern</th><th>Signal words</th><th>Tool</th><th>Solved below</th></tr>
    <tr><td><strong>1. Matching / nesting</strong></td><td>"valid brackets", "balanced", "decode nested string", "simplify path"</td><td>Stack of openers</td><td>Valid Parentheses</td></tr>
    <tr><td><strong>2. Stack with extra info</strong></td><td>"get min in O(1)", "max stack"</td><td>Push (value, running min)</td><td>Min Stack</td></tr>
    <tr><td><strong>3. Expression evaluation</strong></td><td>"evaluate", "postfix", "calculator", "+ - * / ( )"</td><td>Stack of numbers (and saved state at "(")</td><td>Evaluate RPN, Basic Calculator</td></tr>
    <tr><td><strong>4. Monotonic stack</strong></td><td>"next greater / smaller", "days until", "stock span", "largest rectangle", "trapping rain water"</td><td>Stack of indices kept sorted</td><td>Daily Temperatures, Next Greater, Largest Rectangle</td></tr>
    <tr><td><strong>5. Monotonic deque</strong></td><td>"sliding window max / min", "window of size k"</td><td>Deque of indices, decreasing values</td><td>Sliding Window Maximum</td></tr>
    <tr><td><strong>6. Level-order / shortest steps</strong></td><td>"minimum moves", "nearest", "level by level", "spread / rot / infect"</td><td>BFS with deque</td><td>Section 05</td></tr>
  </table>
<div class="fx" data-lang="text"># Monotonic stack template (next greater)
stack = []                       # indices; values decreasing bottom to top
for i, x in enumerate(nums):
    while stack and nums[stack[-1]] &lt; x:
        j = stack.pop()          # x is j's answer
        ...
    stack.append(i)
# whatever is left in the stack never found an answer</div>

  <h2 id="dsa-sq-problems"><span class="num">09</span>Classic Problems</h2>
  <h3>1. Valid Parentheses (LeetCode 20)</h3>
  <p><strong>Problem.</strong> A string of <code>()[]{}</code>. Is every bracket closed by the right type, in the right order? <code>"([]{})"</code> → True, <code>"(]"</code> → False, <code>"([)]"</code> → False.</p>
  <p><strong>Brute force.</strong> Repeatedly delete <code>()</code>, <code>[]</code>, <code>{}</code> pairs until nothing changes: O(n²).</p>
  <p><strong>Better.</strong> The bracket that must close next is always the most recently opened one — a stack. Push openers. On a closer, the top must be its partner. At the end the stack must be empty.</p>
  <table class="tbl out"><caption>Dry run on "([)]"</caption>
    <tr><th>char</th><th>action</th><th>stack</th></tr>
    <tr><td>(</td><td>push</td><td>(</td></tr>
    <tr><td>[</td><td>push</td><td>( [</td></tr>
    <tr><td>)</td><td>top is [, needs ( → False</td><td>—</td></tr>
  </table>
<div class="fx" data-lang="py">def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:                         # a closer
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)                    # an opener
    return not stack                            # leftovers = unclosed

for s in ["()", "([]{})", "(]", "([)]", "((", "]", ""]:
    print(repr(s), is_valid(s))</div>
  <div class="fx" data-lang="text">'()' True
'([]{})' True
'(]' False
'([)]' False
'((' False
']' False
'' True</div>  <p><strong>Complexity.</strong> O(n) time, O(n) space. The two edge cases interviewers check: a closer with an empty stack (<code>"]"</code>) and leftovers (<code>"(("</code>).</p>

  <h3>2. Min Stack (LeetCode 155)</h3>
  <p><strong>Problem.</strong> A stack with <code>push</code>, <code>pop</code>, <code>top</code> and <code>getMin</code>, all O(1).</p>
  <p><strong>Brute force.</strong> <code>min(stack)</code> on every call: O(n).</p>
  <p><strong>Better.</strong> Each entry remembers the minimum of everything at or below it. Store pairs <code>(value, min_so_far)</code>. When you pop, the entry below still has its own correct minimum — no recomputation.</p>
<div class="fx" data-lang="py">class MinStack:
    def __init__(self):
        self.s = []                              # (value, min of this and everything below)

    def push(self, val):
        m = min(val, self.s[-1][1]) if self.s else val
        self.s.append((val, m))

    def pop(self):
        self.s.pop()

    def top(self):
        return self.s[-1][0]

    def getMin(self):
        return self.s[-1][1]

ms = MinStack()
for v in [5, 3, 7, 3, 1]:
    ms.push(v)
    print(f"push {v}: min={ms.getMin()}")
for _ in range(3):
    ms.pop()
    print(f"pop   : top={ms.top()} min={ms.getMin()}")</div>
  <div class="fx" data-lang="text">push 5: min=5
push 3: min=3
push 7: min=3
push 3: min=3
push 1: min=1
pop   : top=3 min=3
pop   : top=7 min=3
pop   : top=3 min=3</div>  <p><strong>Complexity.</strong> O(1) for every operation, O(n) space. Duplicates of the minimum (the two 3s) work because every entry carries its own min.</p>

  <h3>3. Daily Temperatures (LeetCode 739)</h3>
  <p><strong>Problem.</strong> For each day, how many days until a warmer temperature? 0 if never. This is the picture in section 06.</p>
  <p><strong>Brute force.</strong> For each day scan forward: O(n²).</p>
  <p><strong>Better.</strong> Monotonic stack of waiting day indices. When a warmer day <code>i</code> arrives, each popped day <code>j</code> gets <code>i − j</code>.</p>
  <table class="tbl out"><caption>Dry run on [73, 74, 75, 71, 69, 72, 76, 73] (stack shows temperatures)</caption>
    <tr><th>day</th><th>temp</th><th>popped (answer)</th><th>stack after</th></tr>
    <tr><td>0</td><td>73</td><td>–</td><td>73</td></tr>
    <tr><td>1</td><td>74</td><td>day 0 (1)</td><td>74</td></tr>
    <tr><td>2</td><td>75</td><td>day 1 (1)</td><td>75</td></tr>
    <tr><td>3</td><td>71</td><td>–</td><td>75 71</td></tr>
    <tr><td>4</td><td>69</td><td>–</td><td>75 71 69</td></tr>
    <tr><td>5</td><td>72</td><td>day 4 (1), day 3 (2)</td><td>75 72</td></tr>
    <tr><td>6</td><td>76</td><td>day 5 (1), day 2 (4)</td><td>76</td></tr>
    <tr><td>7</td><td>73</td><td>–</td><td>76 73 → left over, answer 0</td></tr>
  </table>
<div class="fx" data-lang="py">def daily_temperatures(temps):
    ans = [0] * len(temps)
    stack = []                                   # indices of days still waiting
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] &lt; t:
            j = stack.pop()
            ans[j] = i - j
        stack.append(i)
    return ans

for temps in [[73, 74, 75, 71, 69, 72, 76, 73], [30, 40, 50, 60], [30, 60, 90], [90, 80, 70], [50, 50]]:
    print(temps, "-&gt;", daily_temperatures(temps))</div>
  <div class="fx" data-lang="text">[73, 74, 75, 71, 69, 72, 76, 73] -&gt; [1, 1, 4, 2, 1, 1, 0, 0]
[30, 40, 50, 60] -&gt; [1, 1, 1, 0]
[30, 60, 90] -&gt; [1, 1, 0]
[90, 80, 70] -&gt; [0, 0, 0]
[50, 50] -&gt; [0, 0]</div>  <p><strong>Complexity.</strong> O(n) time, O(n) space. Equal temperatures are not warmer, so the comparison is strict <code>&lt;</code>.</p>

  <h3>4. Next Greater Element I (LeetCode 496)</h3>
  <p><strong>Problem.</strong> <code>nums1</code> is a subset of <code>nums2</code> (distinct values). For each x in nums1, find the first greater number to the right of x <em>in nums2</em>, or −1.</p>
  <p><strong>Brute force.</strong> For each x, find it in nums2 and scan right: O(m·n).</p>
  <p><strong>Better.</strong> Run the monotonic stack once over nums2 and store each answer in a dict keyed by value. Then each query is a dict lookup.</p>
<div class="fx" data-lang="py">def next_greater_element(nums1, nums2):
    nge = {}
    stack = []                                   # values (distinct), decreasing
    for x in nums2:
        while stack and stack[-1] &lt; x:
            nge[stack.pop()] = x
        stack.append(x)
    return [nge.get(x, -1) for x in nums1]

print(next_greater_element([4, 1, 2], [1, 3, 4, 2]))
print(next_greater_element([2, 4], [1, 2, 3, 4]))
print(next_greater_element([], [1]), next_greater_element([5], [5]))</div>
  <div class="fx" data-lang="text">[-1, 3, -1]
[3, -1]
[] [-1]</div>  <p><strong>Complexity.</strong> O(m + n) time, O(n) space.</p>

  <h3>5. Largest Rectangle in Histogram (LeetCode 84)</h3>
  <p><strong>Problem.</strong> Bars of width 1 with given heights. Find the area of the largest rectangle inside the histogram. <code>[2, 1, 5, 6, 2, 3]</code> → 10 (heights 5 and 6, width 2, height 5).</p>
  <p><strong>Brute force.</strong> For every bar, spread left and right while bars are at least as tall: O(n²).</p>
  <p><strong>Better.</strong> For each bar, the best rectangle using its <em>full height</em> stretches from the first shorter bar on its left to the first shorter bar on its right. Keep a stack of indices with <strong>increasing</strong> heights. When a shorter bar arrives at <code>i</code>, the top bar has found its right limit (<code>i</code>), and the bar below it in the stack is its left limit. Pop and compute. A height-0 bar at the end flushes everything.</p>
  <table class="tbl out"><caption>Dry run on [2, 1, 5, 6, 2, 3] + sentinel 0</caption>
    <tr><th>i</th><th>h</th><th>popped bar: height × width</th><th>stack heights after</th></tr>
    <tr><td>0</td><td>2</td><td>–</td><td>2</td></tr>
    <tr><td>1</td><td>1</td><td>2 × 1 = 2</td><td>1</td></tr>
    <tr><td>2</td><td>5</td><td>–</td><td>1 5</td></tr>
    <tr><td>3</td><td>6</td><td>–</td><td>1 5 6</td></tr>
    <tr><td>4</td><td>2</td><td>6 × 1 = 6, then 5 × 2 = <strong>10</strong></td><td>1 2</td></tr>
    <tr><td>5</td><td>3</td><td>–</td><td>1 2 3</td></tr>
    <tr><td>6</td><td>0</td><td>3 × 1 = 3, 2 × 4 = 8, 1 × 6 = 6</td><td>0</td></tr>
  </table>
<div class="fx" data-lang="py">def largest_rectangle(heights):
    stack = []                                   # indices, heights increasing
    best = 0
    for i, h in enumerate(heights + [0]):        # sentinel 0 empties the stack
        while stack and heights[stack[-1]] &gt;= h:
            height = heights[stack.pop()]
            left = stack[-1] + 1 if stack else 0  # first bar after the shorter one on the left
            best = max(best, height * (i - left))
        stack.append(i)
    return best

for hs in [[2, 1, 5, 6, 2, 3], [2, 4], [1], [], [3, 3, 3], [6, 2, 5, 4, 5, 1, 6]]:
    print(hs, "-&gt;", largest_rectangle(hs))</div>
  <div class="fx" data-lang="text">[2, 1, 5, 6, 2, 3] -&gt; 10
[2, 4] -&gt; 4
[1] -&gt; 1
[] -&gt; 0
[3, 3, 3] -&gt; 9
[6, 2, 5, 4, 5, 1, 6] -&gt; 12</div>  <p><strong>Complexity.</strong> O(n) time, O(n) space. Popping on <code>&gt;=</code> handles equal heights: the last equal bar computes the full width. The same idea solves Maximal Rectangle in a 0/1 matrix (one histogram per row).</p>

  <h3>6. Sliding Window Maximum (LeetCode 239)</h3>
  <p><strong>Problem.</strong> Return the max of every window of size k. <code>[1, 3, -1, -3, 5, 3, 6, 7]</code>, k = 3 → <code>[3, 3, 5, 5, 6, 7]</code>.</p>
  <p><strong>Brute force.</strong> <code>max(nums[i:i+k])</code> for each window: O(n·k).</p>
  <p><strong>Better.</strong> Monotonic deque from section 07, step by step: (1) pop from the back every index whose value is ≤ the new one; (2) push the new index; (3) pop the front if it has left the window; (4) once the first window is full, the front is the answer.</p>
<div class="fx" data-lang="py">def max_sliding_window(nums, k):
    dq, out = deque(), []                        # indices; values decreasing
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] &lt;= x:          # smaller ones can never win now
            dq.pop()
        dq.append(i)
        if dq[0] &lt;= i - k:                       # front slid out of the window
            dq.popleft()
        if i &gt;= k - 1:
            out.append(nums[dq[0]])
    return out

print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
print(max_sliding_window([1], 1), max_sliding_window([9, 8, 7, 6], 2), max_sliding_window([4, 2, 12, 3], 4))</div>
  <div class="fx" data-lang="text">[3, 3, 5, 5, 6, 7]
[1] [9, 8, 7] [12]</div>  <p><strong>Complexity.</strong> O(n) time (each index added and removed once), O(k) space. For the window <em>minimum</em>, flip the comparison.</p>

  <h3>7. Evaluate Reverse Polish Notation (LeetCode 150)</h3>
  <p><strong>Problem.</strong> Evaluate an expression in postfix form, where the operator comes after its two numbers: <code>["2", "1", "+", "3", "*"]</code> means (2 + 1) × 3 = 9. Division truncates toward zero.</p>
  <p><strong>Idea.</strong> Numbers are pushed. An operator pops the top two (careful: the first pop is the <em>right</em> operand), computes, and pushes the result. No brackets or precedence rules are needed — that is why old HP calculators and the JVM use postfix.</p>
<div class="fx" data-lang="py">def eval_rpn(tokens):
    stack = []
    for tok in tokens:
        if tok in {"+", "-", "*", "/"}:
            b = stack.pop()                       # right operand comes off first
            a = stack.pop()
            if tok == "+":
                stack.append(a + b)
            elif tok == "-":
                stack.append(a - b)
            elif tok == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))          # truncate toward zero, not floor
        else:
            stack.append(int(tok))
    return stack[0]

print(eval_rpn(["2", "1", "+", "3", "*"]))
print(eval_rpn(["4", "13", "5", "/", "+"]))
print(eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]))
print(eval_rpn(["-7", "2", "/"]), -7 // 2, "&lt;- floor division would be wrong")</div>
  <div class="fx" data-lang="text">9
6
22
-3 -4 &lt;- floor division would be wrong</div>  <p><strong>Complexity.</strong> O(n) time and space. Watch <code>"-11"</code>: a negative number, not an operator, which is why we check exact tokens.</p>

  <h3>8. Basic Calculator (LeetCode 224)</h3>
  <p><strong>Problem.</strong> Evaluate a string with non-negative integers, <code>+</code>, <code>-</code>, brackets and spaces, like <code>"(1+(4+5+2)-3)+(6+8)"</code> → 23. Unary minus is allowed: <code>"-(2+3)"</code>. No <code>eval</code>.</p>
  <p><strong>Idea.</strong> Without brackets it is easy: keep a running <code>result</code> and the <code>sign</code> (+1 or −1) of the number being read. A <code>(</code> starts a fresh sub-problem, so <strong>save</strong> the current result and sign on a stack and start from 0. At <code>)</code>, finish the inner result and <strong>restore</strong>: <code>outer_result + outer_sign × inner_result</code>. The stack remembers the unfinished outer work — exactly its job.</p>
<div class="fx" data-lang="py">def calculate(s):
    stack = []
    result, num, sign = 0, 0, 1
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)             # multi-digit numbers
        elif ch in "+-":
            result += sign * num
            num, sign = 0, (1 if ch == "+" else -1)
        elif ch == "(":
            stack.append(result)                 # save outer state
            stack.append(sign)
            result, sign = 0, 1
        elif ch == ")":
            result += sign * num
            num = 0
            result = result * stack.pop() + stack.pop()   # sign first, then outer result
    return result + sign * num

for expr in ["1 + 1", " 2-1 + 2 ", "(1+(4+5+2)-3)+(6+8)", "-(2+3)", "1-(     -2)", "2147483647", "- (3 + (4 + 5))"]:
    print(repr(expr), "-&gt;", calculate(expr))</div>
  <div class="fx" data-lang="text">'1 + 1' -&gt; 2
' 2-1 + 2 ' -&gt; 3
'(1+(4+5+2)-3)+(6+8)' -&gt; 23
'-(2+3)' -&gt; -5
'1-(     -2)' -&gt; 3
'2147483647' -&gt; 2147483647
'- (3 + (4 + 5))' -&gt; -12</div>  <p><strong>Complexity.</strong> O(n) time, O(depth of brackets) space. Basic Calculator II (with <code>*</code> and <code>/</code>, no brackets) uses a stack differently: push <code>+num</code> / <code>-num</code>, and for <code>*</code> or <code>/</code> pop the top and push the combined value; the answer is the sum of the stack.</p>

  <h2 id="dsa-sq-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: list.pop(0) as a queue</span>
    <p>O(n) per dequeue. Use <code>deque.popleft()</code>. Same for <code>list.insert(0, x)</code>; use <code>appendleft</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: popping or peeking an empty stack</span>
    <p><code>stack[-1]</code> or <code>stack.pop()</code> on <code>[]</code> raises <code>IndexError</code>. Write <code>while stack and …</code> — the <code>stack and</code> part must come first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting leftovers</span>
    <p>After the loop, items still on the stack matter: unclosed brackets (answer False), days with no warmer day (answer 0), bars never popped (use a sentinel 0 to flush them).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: operand order and division</span>
    <p>In RPN, the first pop is the <em>right</em> operand: <code>b = pop(); a = pop(); a - b</code>. Python's <code>//</code> floors (−7 // 2 = −4); problems that say "truncate toward zero" need <code>int(a / b)</code> = −3.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: storing values instead of indices</span>
    <p>Daily Temperatures needs distances and Sliding Window Max needs to know when an item left the window. Both need <strong>indices</strong> on the stack/deque; read the value with <code>nums[i]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: &lt; vs &lt;= in monotonic stacks</span>
    <p>"Strictly warmer" pops on <code>&lt;</code>; equal days keep waiting. Choosing wrong silently shifts answers for duplicates. Test with repeated values like <code>[50, 50]</code>.</p>
  </div>

  <h2 id="dsa-sq-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>LIFO vs FIFO: give one real use of each.</summary><div class="qa-body">Stack (LIFO): undo, browser back, the function call stack, matching brackets. Queue (FIFO): BFS, print spooler, task/message queues, request buffers. Stack answers "most recent unfinished", queue answers "waited longest".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a Python list fine as a stack but bad as a queue?</summary><div class="qa-body">The stack top is the list's end: <code>append</code> / <code>pop()</code> are O(1). A queue removes from the front, and <code>pop(0)</code> shifts every remaining item left: O(n). <code>collections.deque</code> does <code>popleft</code> in O(1) because it is a linked list of blocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you build a queue from two stacks, and what does it cost?</summary><div class="qa-body">Push into an inbox stack. Pop from an outbox stack; only when the outbox is empty, pour the whole inbox into it (which reverses order, oldest on top). A single pop can be O(n), but each item is moved once, so it is amortized O(1) per operation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Min Stack get the minimum in O(1)?</summary><div class="qa-body">Each entry stores (value, min of itself and everything below). getMin reads the top's second field. After a pop, the new top already has its own correct minimum, so nothing is recomputed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The monotonic stack has a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body">Each index is pushed exactly once and popped at most once. So the total number of inner-loop pops over the whole run is ≤ n, and total work is O(n). This "count pushes and pops" argument is amortized analysis.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Largest Rectangle in Histogram, what do you learn when a bar is popped?</summary><div class="qa-body">The current index i is the first shorter bar to its right, and the new stack top is the first shorter bar to its left. So the widest rectangle at that bar's full height spans (left+1 … i−1), width i − left − 1 (or i if the stack is empty).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Sliding window maximum: why can we discard smaller items behind a new big one?</summary><div class="qa-body">The new item is bigger and entered later, so it stays in the window at least as long. A smaller, older item can never be the maximum of any future window. Removing them keeps the deque decreasing, so the front is the max. O(n) total.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What changes if you replace the queue in BFS with a stack?</summary><div class="qa-body">It becomes depth-first: it follows one branch as deep as possible before backtracking. You lose the "first time reached = shortest path" guarantee, which only BFS's level-by-level order gives in unweighted graphs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>s = [1, 2, 3]; s.append(s.pop() + s.pop()); print(s)</code></summary><div class="qa-body"><code>[1, 5]</code>. The two pops remove 3 then 2, their sum 5 is pushed. Order of operands matters for <code>-</code> and <code>/</code>: <code>s.pop() - s.pop()</code> would compute 3 − 2, the reverse of RPN's a − b.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Basic Calculator, what goes on the stack at "(" and why?</summary><div class="qa-body">The result so far and the sign in front of the bracket. The bracket is a fresh sub-expression, so we start it at 0; at ")" we combine: outer_result + sign × inner_result. The stack holds one saved state per open bracket, so nesting of any depth works.</div></details>
</main>
`
});
