// notes/dsa/dsa_stacks.js — Stacks & Queues
Object.assign(TOPIC_CONTENT, {
  "dsa_stacks": `<main>
<h1>Stacks &amp; Queues</h1>
  <div class="where"><span>DSA</span><span>Linear Structures</span><span>Stacks &amp; Queues</span></div>
  <p class="lead">A stack gives back the newest item first; a queue gives back the oldest. These two tiny rules power undo buttons, bracket checking, expression evaluation, BFS, and the "monotonic stack" trick behind many hard-looking interview problems. In Python a stack is just a list and a queue is <code>collections.deque</code>. The whole note follows one story: Biteful's dispatcher handling the day's 8 orders, whose bills are the same 8 charges used in the Complexity, Arrays, Hashing and Linked Lists notes. Every output below is a real run (Python 3.13); timings vary by machine, so the prose quotes rough ratios.</p>

  <h2 id="dsa-sq-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-sq-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="60" y="6" width="520" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Lists &amp; Tuples (append/pop) · Complexity (amortised O(1), pop(0) is O(n)) · Linked Lists</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-sq-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Stacks &amp; Queues</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · newest first / oldest first</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-sq-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-sq-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-sq-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Binary Search</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">next in reading order</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Trees</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">DFS = stack · BFS = queue</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Heaps</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">"most urgent", not newest/oldest</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-sq-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">used again in</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Graphs (BFS, DFS) · Backtracking (the call stack) · the Problem Tracker's stack ladder</text>
</svg><figcaption>Stacks &amp; Queues closes the "linear structures" group. Reading order for the next notes: Binary Search → Trees → Heaps. Trees reuse both structures from this note: depth-first search is a stack, level order is a queue.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>, <a class="xref" data-note="dsa_complexity">Complexity</a>, <a class="xref" data-note="dsa_linkedlist">Linked Lists</a></b><span>You can append to and pop from a list, you know <code>append</code> is amortised O(1) while <code>pop(0)</code> shifts every item (O(n)), and you have seen a structure that is cheap at the front. Nobody has yet told you which <em>order</em> to take items out in, or why that choice solves problems.</span></li>
    <li><b>This note adds: two removal orders and what they buy</b><span>Newest-first (stack) answers "what is the most recent unfinished thing?": undo, brackets, the call stack, the next bigger value. Oldest-first (queue) answers "who has waited longest?": order tickets, BFS, sliding windows.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_binsearch">Binary Search</a>, <a class="xref" data-note="dsa_trees">Trees</a>, <a class="xref" data-note="dsa_heaps">Heaps</a></b><span>Binary Search is the next note in reading order. Trees walk depth-first with a stack and level by level with a queue. Heaps give a third order: "most urgent first". Practice problems are in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-sq-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it, and its weakness raises the next question. All numbers come from Biteful's 8 orders and real runs.</p>
  <ol class="story">
    <li><b>The need</b><span>Q: the dispatcher added orders O1, O2, O3 to a delivery batch and presses Undo. Which order comes out? → The most recent one, O3. And a combo config <code>{[{}{}]}</code>: which bracket must close next? Again the most recent open one. Both questions are "newest unfinished thing". What structure answers that cheaply?</span></li>
    <li><b>LIFO stack</b><span>Q: how do we store "newest first"? → A Python list used only at its end: <code>append</code> = push, <code>pop()</code> = pop, <code>[-1]</code> = peek, all O(1). Traced on the batch: push 120, 80, 250, undo gives 250 back. But can it check brackets, not just undo?</span></li>
    <li><b>Valid parentheses</b><span>Q: is <code>{[{}{}]}</code> well formed? → Push every opener; every closer must match the top. Traced: 8 characters, stack ends empty, so valid; <code>{[}]</code> fails at the third character. But what if we also need the <em>cheapest</em> order in the batch at every moment, even after undo?</span></li>
    <li><b>Min stack</b><span>Q: what is the minimum right now, in O(1), after any undo? → Store (value, min so far) pairs: after pushing 120, 80, 250, 40 the min is 40; two undos later it is 80, with no rescanning. Stacks only give the newest. The kitchen must cook the <em>oldest</em> ticket first…</span></li>
    <li><b>Queue &amp; deque</b><span>Q: how do we serve oldest first? → A queue. A list with <code>pop(0)</code> works but shifts everything: draining 2 lakh orders took about 3 s, <code>deque.popleft</code> about 0.005 s (measured). Can a queue be built from stacks alone?</span></li>
    <li><b>Queue from two stacks</b><span>Q: FIFO using only LIFO? → Pour an inbox stack into an outbox stack; each order moves once, amortised O(1). What does FIFO order buy in algorithms?</span></li>
    <li><b>BFS on a queue</b><span>Q: what is the fewest number of blocks a rider must travel? → Explore in waves with a queue; the first arrival is the shortest path (7 blocks in our grid). Back to the bills: for each order, which later order has a bigger bill?</span></li>
    <li><b>Monotonic stack</b><span>Q: next greater bill for each of the 8 orders, without O(n²) checks? → Keep waiting orders on a stack with decreasing bills; a big bill pops and answers everyone smaller. Traced: 120→250, 80→250, 250→310, 40→310, 310→none, 80→200, 60→200, 200→none. Each order is pushed and popped once: O(n). But a stack only sees "everything so far", not "the last 3 orders"…</span></li>
    <li><b>Monotonic deque</b><span>Q: the biggest bill in every window of 3 consecutive orders? → A deque with decreasing bills: drop smaller ones at the back, drop expired ones at the front, read the max at the front. Traced: [250, 250, 310, 310, 310, 200] in O(n).</span></li>
  </ol>

  <h2 id="dsa-sq-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Stacks &amp; Queues</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Two rules</div>
        <ul>
          <li><b>Stack = LIFO</b>: last in, first out (pile of plates, Undo)</li>
          <li><b>Queue = FIFO</b>: first in, first out (kitchen tickets)</li>
          <li>Both: add, remove, peek in <b>O(1)</b></li>
          <li>No search, no middle access: that is the point</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In Python</div>
        <ul>
          <li><b>Stack</b>: list: <code>append</code>, <code>pop()</code>, <code>[-1]</code></li>
          <li><b>Queue</b>: <code>deque</code>: <code>append</code>, <code>popleft</code></li>
          <li>⚠ <code>list.pop(0)</code> is O(n): every item shifts left (measured: hundreds of times slower)</li>
          <li><code>queue.Queue</code> only for threads</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stack uses</div>
        <ul>
          <li><b>Matching brackets</b>: push openers, closer must match the top</li>
          <li>Undo, browser back, function call stack, DFS</li>
          <li>Expressions: RPN, calculators (save state at "(")</li>
          <li><b>Min stack</b>: store (value, min so far)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Queue uses</div>
        <ul>
          <li><b>BFS</b>: level by level, shortest path in unweighted grids</li>
          <li>Task queues, printers, rate limiters, buffers</li>
          <li><b>Two stacks → queue</b>, amortised O(1)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Monotonic stack</div>
        <ul>
          <li>Stack kept increasing or decreasing</li>
          <li><b>Signal</b>: "next greater / smaller", "how many days until", "span"</li>
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
        <div class="mm-title">Running example</div>
        <ul>
          <li>Bills O1..O8: <b>120, 80, 250, 40, 310, 80, 60, 200</b></li>
          <li>Next greater: 250, 250, 310, 310, −1, 200, 200, −1</li>
          <li>Window-3 max: 250, 250, 310, 310, 310, 200</li>
          <li>Batch min after 120, 80, 250, 40: 40</li>
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
      <div class="rm-item rm-done" data-target="dsa-sq-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Undo the Last Action</span><span class="rm-sub">LIFO vs FIFO; the running example</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-stack"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">A List as a Stack</span><span class="rm-sub">push, pop, peek traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-match"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Matching Brackets</span><span class="rm-sub">Valid Parentheses traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-minstack"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Min Stack</span><span class="rm-sub">Minimum in O(1) after any undo</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-queue"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Queues: Use deque</span><span class="rm-sub">Why list.pop(0) is slow, measured</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-impl"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">A Queue From Two Stacks</span><span class="rm-sub">Amortised O(1)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-bfs"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">BFS Runs on a Queue</span><span class="rm-sub">Level by level, shortest path</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-mono"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Monotonic Stack</span><span class="rm-sub">Next greater bill, stack table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-deque"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Monotonic Deque</span><span class="rm-sub">Sliding window maximum</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Trigger words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">6 more solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">pop(0), empty pops, // vs truncation</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-sq-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-sq-need"><span class="num">01</span>Undo the Last Action</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Lists let us store items and take them out from anywhere. But many real tasks don't care about "anywhere": they always want either the <em>newest</em> item or the <em>oldest</em> one. We have no name for those two orders yet, and no idea why limiting ourselves to them is useful.</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful, the food-delivery company from the other notes, had 8 orders today. Their bills are the same 8 charges you met in Complexity, Arrays, Hashing and Linked Lists:</p>
  <table class="tbl"><caption>The running example: today's 8 orders, in the order they arrived</caption>
    <tr><th>order</th><th>O1</th><th>O2</th><th>O3</th><th>O4</th><th>O5</th><th>O6</th><th>O7</th><th>O8</th></tr>
    <tr><td>index</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
    <tr><td>bill (₹)</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
  </table>
  <p>Biteful's dispatcher works on one screen all evening, and that screen keeps raising two kinds of question:</p>
  <ul>
    <li><strong>"Undo"</strong>. She adds O1, O2, O3 to a delivery batch and presses Undo. The order that comes out must be O3, the most recent. Press again: O2. The batch is undone newest-first.</li>
    <li><strong>"Next ticket"</strong>. The kitchen cooks orders in the order they arrived. When a cook is free, the ticket that has waited longest (O1) goes first. The tickets are served oldest-first.</li>
  </ul>
  <p>Away from Biteful, the same two shapes are everywhere. At a wedding buffet, clean plates are stacked: staff put new plates on top and guests take from the top. At the railway ticket counter people join at the back and the person at the front is served first.</p>
<figure class="viz"><svg viewBox="0 0 600 230" width="600"><defs><marker id="sq-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="120" y="20" class="tb" text-anchor="middle">STACK (LIFO)</text><rect x="60" y="190" width="120" height="30" rx="4" class="fb sb"/><text x="120" y="210" text-anchor="middle">plate 1</text><rect x="60" y="154" width="120" height="30" rx="4" class="fb sb"/><text x="120" y="174" text-anchor="middle">plate 2</text><rect x="60" y="118" width="120" height="30" rx="4" class="fb sb"/><text x="120" y="138" text-anchor="middle">plate 3</text><rect x="60" y="82" width="120" height="30" rx="4" class="fr sr"/><text x="120" y="102" text-anchor="middle">plate 4</text><text x="190" y="104" class="tr">← top</text><text x="120" y="50" class="tm" text-anchor="middle">push / pop here only</text><path d="M100 58 v20" stroke="currentColor" marker-end="url(#sq-a)"/><path d="M140 78 v-20" stroke="currentColor" marker-end="url(#sq-a)"/><text x="430" y="20" class="tg" text-anchor="middle">QUEUE (FIFO)</text><rect x="290" y="100" width="62" height="34" rx="4" class="fg sg"/><text x="321" y="122" text-anchor="middle">Asha</text><rect x="360" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="391" y="122" text-anchor="middle">Ravi</text><rect x="430" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="461" y="122" text-anchor="middle">Neha</text><rect x="500" y="100" width="62" height="34" rx="4" class="fb sb"/><text x="531" y="122" text-anchor="middle">Om</text><text x="321" y="160" class="tg" text-anchor="middle">front</text><text x="531" y="160" class="tm" text-anchor="middle">rear</text><path d="M290 117 h-40" stroke="currentColor" marker-end="url(#sq-a)"/><text x="268" y="92" class="tm" text-anchor="middle">leave</text><path d="M598 117 h-34" stroke="currentColor" marker-end="url(#sq-a)"/><text x="570" y="92" class="tm" text-anchor="middle">join</text><text x="430" y="200" class="tm" text-anchor="middle">join at the rear, leave from the front</text></svg><figcaption>Stack: the last plate put on is the first taken off. Queue: the first person in line is the first served. Same items, opposite order.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ctrl+Z in a text editor is a stack: every edit is pushed, Undo pops the latest edit. You never undo your first edit before your last. A token counter at a clinic is a queue: token 1 is called before token 2, however urgent token 2 feels (urgency needs a third structure, the heap).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Stack</strong>: a collection where you add and remove only at one end, the <em>top</em>. Last in, first out (<strong>LIFO</strong>). Operations: <code>push</code>, <code>pop</code>, <code>peek</code>.<br><strong>Queue</strong>: add at the <em>rear</em>, remove from the <em>front</em>. First in, first out (<strong>FIFO</strong>). Operations: <code>enqueue</code>, <code>dequeue</code>, <code>peek</code>.</p>
  </div>
  <p>Why use something that can do <em>less</em> than a list? Because the limit is the meaning. A stack answers "what is the most recent unfinished thing?": the last opened bracket, the previous page, the function that called me, the order still waiting for a bigger bill. A queue answers "who has waited longest?": the next print job, the next ticket, the next place to explore.</p>
  <table class="tbl">
    <tr><th></th><th>Stack</th><th>Queue</th></tr>
    <tr><td>Order out</td><td>Newest first (LIFO)</td><td>Oldest first (FIFO)</td></tr>
    <tr><td>Biteful</td><td>Undo on the batch: O3, then O2, then O1</td><td>Kitchen tickets: O1, then O2, then O3</td></tr>
    <tr><td>Python</td><td><code>list</code></td><td><code>collections.deque</code></td></tr>
    <tr><td>Add / remove / peek</td><td>O(1) / O(1) / O(1)</td><td>O(1) / O(1) / O(1)</td></tr>
    <tr><td>Seen in</td><td>Undo, back button, call stack, bracket matching, DFS</td><td>BFS, task schedulers, printer spool, message queues (Kafka, SQS)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Thinking "stack" and "queue" are special Python types you must import. A stack is an ordinary list used only at its end; a queue is a <code>deque</code>. What makes them a stack or a queue is the discipline of only touching one end (or the two ends), not the type.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A List as a Stack.</b> We know <em>what</em> order we want for Undo. We still need to see exactly how a Python list does push, pop and peek, and why each is O(1).</div>

  <h2 id="dsa-sq-stack"><span class="num">02</span>A List as a Stack</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 named the order (newest first) but not the mechanics. Which list operations give "newest first", and do they stay cheap when the batch grows to thousands of actions?</p>
  </div>
  <p>A Python list already is a good stack. The <strong>end</strong> of the list is the top. <code>append</code> pushes, <code>pop()</code> removes the last item, <code>[-1]</code> peeks. All O(1), because nothing else in the list moves (and from the Complexity note: <code>append</code> is amortised O(1) even when the list resizes).</p>
  <h3>Traced on the dispatcher's batch</h3>
  <p>The dispatcher adds O1 (₹120), O2 (₹80), O3 (₹250), presses Undo, adds O4 (₹40), then presses Undo twice. Before running anything, here is the trace by hand. The list is written bottom → top.</p>
  <table class="tbl out"><caption>Undo history as a stack (list end = top)</caption>
    <tr><th>step</th><th>action</th><th>list operation</th><th>returns</th><th>batch after</th></tr>
    <tr><td>1</td><td>add O1</td><td><code>append(120)</code></td><td>–</td><td>[120]</td></tr>
    <tr><td>2</td><td>add O2</td><td><code>append(80)</code></td><td>–</td><td>[120, 80]</td></tr>
    <tr><td>3</td><td>add O3</td><td><code>append(250)</code></td><td>–</td><td>[120, 80, 250]</td></tr>
    <tr><td>4</td><td>Undo</td><td><code>pop()</code></td><td>250</td><td>[120, 80]</td></tr>
    <tr><td>5</td><td>look at top</td><td><code>[-1]</code></td><td>80</td><td>[120, 80]</td></tr>
    <tr><td>6</td><td>add O4</td><td><code>append(40)</code></td><td>–</td><td>[120, 80, 40]</td></tr>
    <tr><td>7</td><td>Undo</td><td><code>pop()</code></td><td>40</td><td>[120, 80]</td></tr>
    <tr><td>8</td><td>Undo</td><td><code>pop()</code></td><td>80</td><td>[120]</td></tr>
  </table>
  <p>The code does exactly those eight steps and prints the batch after each one. The <code>try</code> at the end shows what happens if you press Undo on an empty batch.</p>
<div class="fx" data-lang="py">batch = []                                  # bottom ... top
batch.append(120); print("add O1  ", batch)
batch.append(80);  print("add O2  ", batch)
batch.append(250); print("add O3  ", batch)
print("undo  -&gt;", batch.pop(), batch)
print("peek  -&gt;", batch[-1], batch)
batch.append(40);  print("add O4  ", batch)
print("undo  -&gt;", batch.pop(), batch)
print("undo  -&gt;", batch.pop(), batch)
print("size:", len(batch), "| empty?", not batch)

try:
    [].pop()
except IndexError as e:
    print("undo on empty batch:", e)</div>
  <div class="fx" data-lang="text">add O1   [120]
add O2   [120, 80]
add O3   [120, 80, 250]
undo  -&gt; 250 [120, 80]
peek  -&gt; 80 [120, 80]
add O4   [120, 80, 40]
undo  -&gt; 40 [120, 80]
undo  -&gt; 80 [120]
size: 1 | empty? False
undo on empty batch: pop from empty list</div>
  <p>The output matches the hand trace line for line. Notice the guard <code>not batch</code>: an empty list is falsy, so <code>if batch:</code> is the idiomatic "is there anything to undo?".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A spike for paper bills at a dhaba counter. Each new bill is pushed onto the spike; to check a bill you can only lift the top one off. The first bill of the day is at the very bottom and comes off last.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Your program already runs on a stack. When <code>f</code> calls <code>g</code>, Python pushes a frame for <code>g</code>; when <code>g</code> returns, the frame is popped and <code>f</code> continues. That is why any recursion can be rewritten as a loop with your own stack (the Trees note does this for depth-first search), and why too-deep recursion gives <code>RecursionError</code>: the call stack is full.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>stack in Python</strong> is a list on which you only call <code>append(x)</code> (push), <code>pop()</code> (pop the top), <code>s[-1]</code> (peek) and <code>len(s)</code> / truthiness (size / empty). Each is O(1).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Popping or peeking an empty stack raises <code>IndexError</code>. In problems, always guard: <code>if stack and stack[-1] == ...</code>. And use the <em>end</em> of the list as the top: <code>insert(0, x)</code> / <code>pop(0)</code> are O(n), because every other item shifts.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>1047 Remove All Adjacent Duplicates In String</b> (a letter cancels the top), <b>2390 Removing Stars From a String</b> (each <code>*</code> is an Undo), <b>682 Baseball Game</b> (push scores, "C" pops). Trace each on paper with a stack table like the one above before coding.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Matching Brackets.</b> Undo only ever asks "give me the top". Can the same three operations <em>check</em> something, such as whether every bracket in a config string is closed in the right order?</div>

  <h2 id="dsa-sq-match"><span class="num">03</span>Matching Brackets: Valid Parentheses</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can push and pop, but so far the stack only stored things. Biteful's menu service stores a combo as nested brackets, and a corrupted file crashes the app. How do we check, in one pass, that every bracket closes in the right order?</p>
  </div>
  <p>A combo config looks like <code>{"combo": [{"id": 3}, {"id": 5}]}</code>. Ignore everything except the brackets and you get <code>{[{}{}]}</code>. It is well formed when every opener is closed by the same type, and inner pairs close before outer ones.</p>
  <h3>Recognise it</h3>
  <p>Trigger words: "valid brackets", "balanced", "well-formed", "nested", "decode <code>3[a2[c]]</code>", "simplify path", "remove the minimum to make valid". The thing that must close next is always the <strong>most recently opened</strong> one, which is exactly the top of a stack.</p>
  <h3>Template</h3>
  <div class="flow"><span>opener → push it</span><span>closer → stack empty or top is the wrong type? invalid</span><span>else pop the matching opener</span><span>end: stack must be empty</span></div>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Valid Parentheses on "{[{}{}]}" (stack written bottom → top)</caption>
    <tr><th>#</th><th>char</th><th>kind</th><th>check</th><th>stack after</th></tr>
    <tr><td>1</td><td>{</td><td>opener</td><td>push</td><td>{</td></tr>
    <tr><td>2</td><td>[</td><td>opener</td><td>push</td><td>{ [</td></tr>
    <tr><td>3</td><td>{</td><td>opener</td><td>push</td><td>{ [ {</td></tr>
    <tr><td>4</td><td>}</td><td>closer</td><td>top { matches → pop</td><td>{ [</td></tr>
    <tr><td>5</td><td>{</td><td>opener</td><td>push</td><td>{ [ {</td></tr>
    <tr><td>6</td><td>}</td><td>closer</td><td>top { matches → pop</td><td>{ [</td></tr>
    <tr><td>7</td><td>]</td><td>closer</td><td>top [ matches → pop</td><td>{</td></tr>
    <tr><td>8</td><td>}</td><td>closer</td><td>top { matches → pop</td><td>(empty)</td></tr>
    <tr><td colspan="4">end of string</td><td><b>empty → valid</b></td></tr>
  </table>
  <table class="tbl out"><caption>Two corrupted configs</caption>
    <tr><th>string</th><th>what happens</th><th>result</th></tr>
    <tr><td><code>{[}]</code></td><td>push {, push [, then } arrives but the top is [ (needs {)</td><td>False at char 3</td></tr>
    <tr><td><code>{[{}]</code></td><td>every closer matches, but { is left on the stack at the end</td><td>False (unclosed)</td></tr>
  </table>
  <h3>The code</h3>
  <p>The dict <code>pairs</code> maps each closer to its opener, so "is this a closer?" is <code>ch in pairs</code> and "what must the top be?" is <code>pairs[ch]</code>. The function also prints its stack when <code>trace=True</code>, so you can compare with the table.</p>
<div class="fx" data-lang="py">def is_valid(s, trace=False):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for i, ch in enumerate(s, 1):
        if ch in pairs:                         # a closer
            if not stack or stack.pop() != pairs[ch]:
                if trace: print(f"{i}: {ch} does not match -&gt; False")
                return False
        else:
            stack.append(ch)                    # an opener
        if trace: print(f"{i}: {ch}  stack={''.join(stack) or '(empty)'}")
    return not stack                            # leftovers = unclosed

print(is_valid("{[{}{}]}", trace=True))
print(is_valid("{[}]", trace=True))
for s in ["{[{}]", "()", "([]{})", "(]", "]", ""]:
    print(repr(s), is_valid(s))</div>
  <div class="fx" data-lang="text">1: {  stack={
2: [  stack={[
3: {  stack={[{
4: }  stack={[
5: {  stack={[{
6: }  stack={[
7: ]  stack={
8: }  stack=(empty)
True
1: {  stack={
2: [  stack={[
3: } does not match -&gt; False
False
'{[{}]' False
'()' True
'([]{})' True
'(]' False
']' False
'' True</div>
  <p>The first trace is the table above, line for line. The edge cases at the bottom are the ones interviewers check: a closer on an empty stack (<code>"]"</code>), leftovers (<code>"{[{}]"</code>) and the empty string (valid: nothing is unclosed).</p>
  <h3>Complexity</h3>
  <p>O(n) time: each character is pushed or popped at most once. O(n) space in the worst case (all openers). The brute force, "repeatedly delete <code>()</code>, <code>[]</code>, <code>{}</code> pairs until nothing changes", is O(n²).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A bracket string is <strong>valid</strong> when every closer matches the most recent unmatched opener of the same type, and no opener is left unmatched at the end. The stack holds exactly the unmatched openers, newest on top.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Counting instead of stacking. "Number of ( equals number of )" accepts <code>([)]</code> and <code>)(</code>. A counter works only when there is a single bracket type and you also check it never goes negative; with three types you need the stack.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>20 Valid Parentheses</b> (this section), <b>1614 Maximum Nesting Depth of the Parentheses</b> (the answer is the tallest the stack ever gets), <b>921 Minimum Add to Make Parentheses Valid</b> (count unmatched closers and leftover openers).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Min Stack.</b> A stack tells us the newest item instantly. Finance also wants "the cheapest order currently in the batch", and it must stay correct after every Undo. <code>min(batch)</code> rescans everything each time. Can the stack remember the minimum too?</div>

  <h2 id="dsa-sq-minstack"><span class="num">04</span>A Stack That Remembers: Min Stack</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The stack answers "what is on top?" in O(1). But "what is the smallest bill in the batch?" needs a scan, O(n), every time it is asked. And keeping one <code>best</code> variable breaks the moment Undo removes the minimum: what was the minimum <em>before</em> it?</p>
  </div>
  <p>The idea: when an order is pushed, also record the minimum of everything at or below it. Then each entry carries its own answer. Undo pops an entry, and the entry now on top still has <em>its</em> correct minimum. Nothing is recomputed.</p>
  <h3>Recognise it</h3>
  <p>Trigger words: "get min (or max) in O(1)", "design a stack that also…", "undo with a running statistic", "browser history". Whenever a statistic of "everything below me" must survive pops, store it alongside each push.</p>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Min stack on the batch: push O1–O4, then Undo three times</caption>
    <tr><th>action</th><th>pushed pair (value, min so far)</th><th>stack of pairs (bottom → top)</th><th>getMin()</th></tr>
    <tr><td>push 120</td><td>(120, 120)</td><td>(120,120)</td><td>120</td></tr>
    <tr><td>push 80</td><td>(80, min(80,120) = 80)</td><td>(120,120) (80,80)</td><td>80</td></tr>
    <tr><td>push 250</td><td>(250, min(250,80) = 80)</td><td>… (80,80) (250,80)</td><td>80</td></tr>
    <tr><td>push 40</td><td>(40, min(40,80) = 40)</td><td>… (250,80) (40,40)</td><td>40</td></tr>
    <tr><td>Undo</td><td>pops (40, 40)</td><td>(120,120) (80,80) (250,80)</td><td>80</td></tr>
    <tr><td>Undo</td><td>pops (250, 80)</td><td>(120,120) (80,80)</td><td>80</td></tr>
    <tr><td>Undo</td><td>pops (80, 80)</td><td>(120,120)</td><td>120</td></tr>
  </table>
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
for bill in [120, 80, 250, 40]:
    ms.push(bill)
    print(f"push {bill:3}: min={ms.getMin()}  pairs={ms.s}")
for _ in range(3):
    ms.pop()
    print(f"undo     : top={ms.top()} min={ms.getMin()}")</div>
  <div class="fx" data-lang="text">push 120: min=120  pairs=[(120, 120)]
push  80: min=80  pairs=[(120, 120), (80, 80)]
push 250: min=80  pairs=[(120, 120), (80, 80), (250, 80)]
push  40: min=40  pairs=[(120, 120), (80, 80), (250, 80), (40, 40)]
undo     : top=250 min=80
undo     : top=80 min=80
undo     : top=120 min=120</div>
  <p>The printout reproduces the table: 40 is the minimum only while O4 is in the batch; after its Undo the old answer 80 is already sitting in the pair below. Duplicated minimums (two orders of ₹80, say) also work, because every entry carries its own copy.</p>
  <h3>Complexity</h3>
  <p>O(1) for push, pop, top and getMin; O(n) space (one extra number per entry). The brute force <code>min(stack)</code> is O(n) per call.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>min stack</strong> is a stack whose every entry stores <code>(value, minimum of the stack up to and including this entry)</code>. <code>getMin</code> returns the top entry's second field.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Keeping a single <code>self.min</code> variable. After the minimum is popped you have no idea what the next minimum is, and recomputing it is O(n). The per-entry min (or a second stack of minimums) is the fix.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>155 Min Stack</b> (this section), <b>1381 Design a Stack With Increment Operation</b> (store a lazy "add" per entry, the same trick), <b>1472 Design Browser History</b> (two stacks: back and forward).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Queues.</b> Everything so far is newest-first. The kitchen needs the opposite: the ticket that has waited <em>longest</em> must be cooked next. A list can pop from the front with <code>pop(0)</code>, but is that cheap?</div>

  <h2 id="dsa-sq-queue"><span class="num">05</span>Queues: Use deque</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A stack can never give us O1 before O8: it always returns the newest ticket. We need oldest-first. The obvious list version, <code>append</code> to join and <code>pop(0)</code> to serve, gives correct answers. Is it fast enough on a busy day?</p>
  </div>
  <p>A list is one block of memory (the Complexity note's "inside a list"). Removing the first item means every other item must shift one place left. With 1 lakh tickets waiting, every "next please" moves 1 lakh pointers: O(n) per ticket, O(n²) to serve them all.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bench where people must sit packed from the left end. When the first person leaves, everybody slides one seat left. A <code>deque</code> is a bench where people simply get up from either end and nobody slides.</p>
  </div>
  <h3>Measured: serving every ticket</h3>
  <p>We put n ticket numbers in a queue and serve them all, once with <code>list.pop(0)</code> and once with <code>deque.popleft()</code>. Same answers, very different times.</p>
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
    print(f"n={n:&gt;7,}  list.pop(0): {a:7.3f} s   deque.popleft: {b:6.4f} s   ratio ~{a / b:,.0f}x")</div>
  <div class="fx" data-lang="text">n= 25,000  list.pop(0):   0.048 s   deque.popleft: 0.0006 s   ratio ~77x
n= 50,000  list.pop(0):   0.195 s   deque.popleft: 0.0013 s   ratio ~155x
n=100,000  list.pop(0):   0.775 s   deque.popleft: 0.0046 s   ratio ~168x
n=200,000  list.pop(0):   3.228 s   deque.popleft: 0.0052 s   ratio ~617x</div>
  <p>Two things to read off. The deque times stay at a few milliseconds and grow roughly in line with n: O(1) per ticket. The list time roughly <strong>quadruples</strong> each time n doubles (about 0.05 → 0.2 → 0.8 → 3.2 s): O(n) per ticket, O(n²) in total. At 2 lakh tickets the list is several hundred times slower, and the gap keeps widening.</p>
  <p><code>collections.deque</code> ("deck", double-ended queue) is built from linked blocks, so adding or removing at <em>either</em> end is O(1).</p>
  <h3>The kitchen queue, traced</h3>
<div class="fx" data-lang="py">kitchen = deque(["O1", "O2"])
kitchen.append("O3")                  # a new ticket joins at the rear
print("cook:", kitchen.popleft(), "| waiting:", list(kitchen), "| next:", kitchen[0])
kitchen.appendleft("O9")              # a VIP re-cook jumps the line (deque allows both ends)
print(list(kitchen), "| cancel newest:", kitchen.pop())

recent = deque(maxlen=3)              # the screen shows only the last 3 tickets
for t in ["O1", "O2", "O3", "O4", "O5"]:
    recent.append(t)
print("last three tickets:", list(recent))</div>
  <div class="fx" data-lang="text">cook: O1 | waiting: ['O2', 'O3'] | next: O2
['O9', 'O2', 'O3'] | cancel newest: O3
last three tickets: ['O3', 'O4', 'O5']</div>
  <table class="tbl">
    <tr><th>Operation</th><th>list</th><th>deque</th></tr>
    <tr><td>Add / remove at the right</td><td>O(1)</td><td>O(1)</td></tr>
    <tr><td>Add / remove at the left</td><td><strong>O(n)</strong> (<code>insert(0, x)</code>, <code>pop(0)</code>)</td><td><strong>O(1)</strong> (<code>appendleft</code>, <code>popleft</code>)</td></tr>
    <tr><td>Index in the middle <code>x[i]</code></td><td>O(1)</td><td>O(n) (fine at the ends)</td></tr>
    <tr><td>Slicing</td><td>Yes</td><td>No</td></tr>
  </table>
  <p>Other queues in Python: <code>queue.Queue</code> is a thread-safe queue for producer/consumer threads (slower, has locks, not for algorithms). <code>heapq</code> is a <em>priority</em> queue (most urgent first, see the <a class="xref" data-note="dsa_heaps">Heaps</a> note). <code>asyncio.Queue</code> is for async code.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>queue in Python</strong> is a <code>collections.deque</code> used with <code>append(x)</code> (enqueue at the rear), <code>popleft()</code> (dequeue from the front) and <code>q[0]</code> (peek). A <strong>deque</strong> allows O(1) adds and removes at both ends.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using a list with <code>pop(0)</code> in BFS. On a grid of 10⁶ cells it turns an O(n) search into O(n²) and times out. Interviewers notice this immediately. Always <code>from collections import deque</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>933 Number of Recent Calls</b> (pop expired calls from the front), <b>622 Design Circular Queue</b> (a fixed array with a head index instead of shifting), <b>950 Reveal Cards In Increasing Order</b> (simulate the deck with a deque).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A Queue From Two Stacks.</b> The deque is a ready-made queue. A classic interview question takes it away: if all you have is stacks (newest-first), can you still serve the oldest ticket first, and at what cost?</div>

  <h2 id="dsa-sq-impl"><span class="num">06</span>A Queue From Two Stacks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Stacks and queues look like opposites. Is FIFO really a different machine, or can it be built out of LIFO pieces? The answer explains "amortised O(1)" on a structure you build yourself.</p>
  </div>
  <p>A favourite interview question (LeetCode 232): build a FIFO queue using only stack operations. The trick: pouring a stack into another stack reverses it. Reverse LIFO, and you get FIFO.</p>
<figure class="viz"><svg viewBox="0 0 600 200" width="600"><defs><marker id="sq-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><text x="130" y="18" class="tb" text-anchor="middle">inbox (push here)</text><text x="470" y="18" class="tg" text-anchor="middle">outbox (pop here)</text><rect x="100" y="150" width="60" height="28" class="fb sb"/><text x="130" y="169" text-anchor="middle">1</text><rect x="100" y="116" width="60" height="28" class="fb sb"/><text x="130" y="135" text-anchor="middle">2</text><rect x="100" y="82" width="60" height="28" class="fb sb"/><text x="130" y="101" text-anchor="middle">3</text><rect x="440" y="150" width="60" height="28" class="fg sg"/><text x="470" y="169" text-anchor="middle">3</text><rect x="440" y="116" width="60" height="28" class="fg sg"/><text x="470" y="135" text-anchor="middle">2</text><rect x="440" y="82" width="60" height="28" class="fr sr"/><text x="470" y="101" text-anchor="middle">1</text><path d="M180 110 C 260 80, 340 80, 420 110" fill="none" stroke="currentColor" marker-end="url(#sq-b)"/><text x="300" y="40" text-anchor="middle">only when outbox is empty:</text><text x="300" y="58" class="tm" text-anchor="middle">pop all from inbox, push to outbox</text><text x="510" y="102" class="tr">← oldest</text><text x="300" y="194" class="tm" text-anchor="middle">pouring a stack into another reverses it: LIFO + LIFO = FIFO</text></svg><figcaption>Queue from two stacks. 1, 2, 3 were pushed into the inbox (3 on top). Pouring them into the outbox flips the order, so 1, the oldest, is now on top and pops first.</figcaption></figure>
  <p>New tickets always go into the <strong>inbox</strong>. To serve, take from the <strong>outbox</strong>. Only when the outbox is empty, pour the whole inbox into it. Never pour while the outbox still has items, or newer tickets would land on top of older ones.</p>
  <table class="tbl out"><caption>Traced on O1–O4 (stacks written bottom → top)</caption>
    <tr><th>action</th><th>inbox</th><th>outbox</th><th>returns</th></tr>
    <tr><td>push O1, O2, O3</td><td>O1 O2 O3</td><td>–</td><td>–</td></tr>
    <tr><td>pop: outbox empty → pour</td><td>–</td><td>O3 O2 O1</td><td>O1</td></tr>
    <tr><td>push O4</td><td>O4</td><td>O3 O2</td><td>–</td></tr>
    <tr><td>pop (outbox not empty, no pour)</td><td>O4</td><td>O3</td><td>O2</td></tr>
    <tr><td>pop</td><td>O4</td><td>–</td><td>O3</td></tr>
    <tr><td>pop: outbox empty → pour</td><td>–</td><td>–</td><td>O4</td></tr>
  </table>
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
for t in ["O1", "O2", "O3"]:
    q.push(t)
print("peek:", q.peek(), "| pop:", q.pop(), "| inbox:", q.inbox, "outbox:", q.outbox)
q.push("O4")
print("pops:", q.pop(), q.pop(), q.pop(), "| empty:", q.empty())</div>
  <div class="fx" data-lang="text">peek: O1 | pop: O1 | inbox: [] outbox: ['O3', 'O2']
pops: O2 O3 O4 | empty: True</div>
  <p><strong>Cost.</strong> A single <code>pop</code> can be O(n) when it pours. But each ticket is moved from inbox to outbox <em>at most once</em> in its life: pushed once, poured once, popped once. So n operations cost O(n) in total, which is <strong>amortised O(1)</strong> per operation.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Amortised cost</strong>: the average cost per operation over any long sequence, even if a few single operations are expensive. Python's <code>list.append</code> is the same story: an occasional resize is O(n), but the average stays O(1).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pouring on every pop, or pouring while the outbox is non-empty. The first makes every pop O(n); the second mixes old and new tickets and breaks FIFO (O4 would come out before O2).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>232 Implement Queue using Stacks</b> (this section), <b>225 Implement Stack using Queues</b> (the mirror puzzle: rotate the queue after each push).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: BFS.</b> We can now serve oldest-first in O(1). What does that order buy in an algorithm? It turns out "oldest first" is exactly what finds the <em>shortest</em> route for a rider.</div>

  <h2 id="dsa-sq-bfs"><span class="num">07</span>BFS Runs on a Queue</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>So far the queue only served tickets. A Biteful rider must cross a block of streets, some closed for a wedding procession. What is the fewest number of blocks to the customer, and why would a queue, rather than a stack, find it?</p>
  </div>
  <p>Drop a stone in a pond. The ripple reaches everything 1 step away, then everything 2 steps away, and so on. <strong>Breadth-first search</strong> explores the same way, and a queue is what keeps the order: places found earlier are explored earlier. Swap the queue for a stack and the same loop becomes depth-first search (go deep first). Here is that one-line difference on a small map of six localities:</p>
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
  <p>Because BFS reaches every place in order of distance, the first time it reaches the goal is along a shortest path (when every step costs the same). That makes it the standard tool for "minimum moves" questions on grids. The rider's grid: <code>.</code> is an open block, <code>#</code> is closed.</p>
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
print(shortest_path(streets, (0, 0), (0, 3)), shortest_path(streets, (0, 0), (3, 1)), shortest_path([".#", "#."], (0, 0), (1, 1)))</div>
  <div class="fx" data-lang="text">7 4 -1</div>
  <p>7 blocks to the top-right corner (the rider must go down and around the closed blocks), 4 blocks to row 3 column 1, and −1 when the customer is unreachable.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Breadth-first search (BFS)</strong>: start from one place, then repeatedly take the oldest discovered place from a queue and add its undiscovered neighbours to the rear. Places come out in order of distance, so in an unweighted grid or graph the first time you reach a place is by a shortest path. O(V + E) time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mark a cell as seen when you <em>add</em> it to the queue, not when you pop it. Otherwise the same cell is added many times by different neighbours, and the queue can blow up. The <a class="xref" data-note="dsa_graphs">Graphs</a> note covers BFS in depth; the <a class="xref" data-note="dsa_trees">Trees</a> note uses it for level order.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>994 Rotting Oranges</b> (BFS from many starts at once), <b>1091 Shortest Path in Binary Matrix</b> (this grid, with 8 directions), <b>102 Binary Tree Level Order Traversal</b> (BFS on a tree).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Monotonic Stack.</b> Back to the 8 bills. Finance asks: "for each order, which later order had a bigger bill?" Checking every later order for every order is O(n²). Is there a stack trick that answers all 8 in one pass?</div>

  <h2 id="dsa-sq-mono"><span class="num">08</span>Monotonic Stack</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Plain stacks remember "the most recent unfinished thing". The next-greater question has many unfinished things at once: every order still waiting for a bigger bill. Which of them should a new bill answer, and how do we avoid checking all of them?</p>
  </div>
  <p>The direct way checks every later order for every order: O(n²). For 8 orders that is 28 comparisons; for 1 lakh orders it is 5 billion.</p>
  <p>Look at O3 (₹250). O4 (₹40) arrives: it can't answer O3, so O4 waits too. Who is waiting? A group of orders, and the newest of them gets answered first when a big bill comes. Newest first: that is a stack. And whoever is waiting is always in decreasing order of bill: if a bigger bill had come after a smaller one, it would have already answered the smaller one.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Students wait in a corridor, each for "someone taller than me" to walk in. When a tall student arrives, every shorter student at the end of the waiting group gets the answer and leaves. Anyone taller than the newcomer keeps waiting, and the newcomer joins the end. So the waiting group, from first to last, always goes from tall to short: <strong>monotonic decreasing</strong>.</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "next greater / smaller element", "how many days until a warmer day", "stock span", "first bigger to the right", "previous smaller", "largest rectangle", "trapping rain water", "remove k digits to make it smallest".</p>
  <h3>Template</h3>
  <p>Walk left to right. Keep a stack of <strong>indices</strong> that are still waiting. When a new value is bigger than the value on top, the top's wait is over: pop it and record the answer. Repeat while that is true, then push the new index.</p>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Next greater bill for O1..O8 = [120, 80, 250, 40, 310, 80, 60, 200] (stack shows waiting bills, bottom → top)</caption>
    <tr><th>order</th><th>bill</th><th>pops (and their answer)</th><th>stack after</th></tr>
    <tr><td>O1</td><td>120</td><td>–</td><td>120</td></tr>
    <tr><td>O2</td><td>80</td><td>– (80 &lt; 120, wait)</td><td>120 80</td></tr>
    <tr><td>O3</td><td>250</td><td>O2 → 250, O1 → 250</td><td>250</td></tr>
    <tr><td>O4</td><td>40</td><td>–</td><td>250 40</td></tr>
    <tr><td>O5</td><td>310</td><td>O4 → 310, O3 → 310</td><td>310</td></tr>
    <tr><td>O6</td><td>80</td><td>–</td><td>310 80</td></tr>
    <tr><td>O7</td><td>60</td><td>–</td><td>310 80 60</td></tr>
    <tr><td>O8</td><td>200</td><td>O7 → 200, O6 → 200</td><td>310 200</td></tr>
    <tr><td colspan="3">end: O5 and O8 never found a bigger bill</td><td>answer −1</td></tr>
  </table>
  <p>Answer: <b>[250, 250, 310, 310, −1, 200, 200, −1]</b>. Count the work: 8 pushes and 6 pops, 14 stack moves, instead of up to 28 pair checks.</p>
  <h3>The code</h3>
<div class="fx" data-lang="py">def next_greater(nums, trace=False):
    ans = [-1] * len(nums)
    stack = []                                  # indices still waiting; values decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] &lt; x:    # x answers everyone smaller on top
            ans[stack.pop()] = x
        stack.append(i)
        if trace:
            print(f"O{i + 1} bill={x:3}  stack bills={[nums[j] for j in stack]}  ans={ans}")
    return ans

bills = [120, 80, 250, 40, 310, 80, 60, 200]
print(next_greater(bills, trace=True))</div>
  <div class="fx" data-lang="text">O1 bill=120  stack bills=[120]  ans=[-1, -1, -1, -1, -1, -1, -1, -1]
O2 bill= 80  stack bills=[120, 80]  ans=[-1, -1, -1, -1, -1, -1, -1, -1]
O3 bill=250  stack bills=[250]  ans=[250, 250, -1, -1, -1, -1, -1, -1]
O4 bill= 40  stack bills=[250, 40]  ans=[250, 250, -1, -1, -1, -1, -1, -1]
O5 bill=310  stack bills=[310]  ans=[250, 250, 310, 310, -1, -1, -1, -1]
O6 bill= 80  stack bills=[310, 80]  ans=[250, 250, 310, 310, -1, -1, -1, -1]
O7 bill= 60  stack bills=[310, 80, 60]  ans=[250, 250, 310, 310, -1, -1, -1, -1]
O8 bill=200  stack bills=[310, 200]  ans=[250, 250, 310, 310, -1, 200, 200, -1]
[250, 250, 310, 310, -1, 200, 200, -1]</div>
  <p>The same stack answers "how many orders until a bigger bill?" if we store the distance <code>i − j</code> instead of the value. That is LeetCode 739 Daily Temperatures in disguise (section 11 solves it on temperatures).</p>
<div class="fx" data-lang="py">def orders_until_bigger(nums):
    ans = [0] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] &lt; x:
            j = stack.pop()
            ans[j] = i - j                      # distance instead of value
        stack.append(i)
    return ans

print(orders_until_bigger(bills))</div>
  <div class="fx" data-lang="text">[2, 1, 2, 1, 0, 2, 1, 0]</div>
  <h3>Measured: why the trick matters</h3>
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
    data = sorted(random.randint(10, 999) for _ in range(n))[::-1]   # falling bills: brute force's worst case
    t = time.perf_counter(); a = next_greater_brute(data); tb = time.perf_counter() - t
    t = time.perf_counter(); b = next_greater(data); ts = time.perf_counter() - t
    print(f"n={n:,}: brute {tb:.3f} s, stack {ts:.4f} s, same answer: {a == b}")</div>
  <div class="fx" data-lang="text">n=2,000: brute 0.074 s, stack 0.0002 s, same answer: True
n=8,000: brute 1.080 s, stack 0.0010 s, same answer: True</div>
  <p>When bills keep falling, nobody finds a bigger bill quickly and the brute force scans to the end every time: 4× the data, about 15× the time (O(n²)). The stack version only grows 4× (O(n)).</p>
  <h3>Complexity</h3>
  <p>Why O(n) even with a loop inside a loop? Each index is pushed once and popped at most once. Total pushes + pops ≤ 2n. That counting argument is the thing to say out loud in an interview. Space O(n) for the stack.</p>
  <table class="tbl">
    <tr><th>Want</th><th>Stack keeps values</th><th>Pop when new x is</th></tr>
    <tr><td>Next greater</td><td>Decreasing</td><td><code>&gt;</code> top</td></tr>
    <tr><td>Next smaller</td><td>Increasing</td><td><code>&lt;</code> top</td></tr>
    <tr><td>Previous greater / smaller</td><td>Same stacks</td><td>Read the top <em>after</em> popping, before pushing</td></tr>
    <tr><td>Circular array</td><td>Same</td><td>Loop i over 2n, use <code>i % n</code></td></tr>
  </table>
  <p>The same pattern on daily temperatures (LeetCode 739, solved in section 11): each arrow jumps from a day to the first warmer day ahead, exactly as each popped order jumped to its first bigger bill.</p>
<figure class="viz"><svg viewBox="0 0 600 270" width="600"><defs><marker id="sq-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><rect x="65" y="96" width="40" height="104" class="fb sb"/><text x="85" y="112" text-anchor="middle">73</text><text x="85" y="218" class="tm" text-anchor="middle">0</text><text x="85" y="244" class="tg" text-anchor="middle">1</text><rect x="127" y="88" width="40" height="112" class="fb sb"/><text x="147" y="104" text-anchor="middle">74</text><text x="147" y="218" class="tm" text-anchor="middle">1</text><text x="147" y="244" class="tg" text-anchor="middle">1</text><rect x="189" y="80" width="40" height="120" class="fb sb"/><text x="209" y="96" text-anchor="middle">75</text><text x="209" y="218" class="tm" text-anchor="middle">2</text><text x="209" y="244" class="tg" text-anchor="middle">4</text><rect x="251" y="112" width="40" height="88" class="fb sb"/><text x="271" y="128" text-anchor="middle">71</text><text x="271" y="218" class="tm" text-anchor="middle">3</text><text x="271" y="244" class="tg" text-anchor="middle">2</text><rect x="313" y="128" width="40" height="72" class="fb sb"/><text x="333" y="144" text-anchor="middle">69</text><text x="333" y="218" class="tm" text-anchor="middle">4</text><text x="333" y="244" class="tg" text-anchor="middle">1</text><rect x="375" y="104" width="40" height="96" class="fb sb"/><text x="395" y="120" text-anchor="middle">72</text><text x="395" y="218" class="tm" text-anchor="middle">5</text><text x="395" y="244" class="tg" text-anchor="middle">1</text><rect x="437" y="72" width="40" height="128" class="fb sb"/><text x="457" y="88" text-anchor="middle">76</text><text x="457" y="218" class="tm" text-anchor="middle">6</text><text x="457" y="244" class="tg" text-anchor="middle">0</text><rect x="499" y="96" width="40" height="104" class="fb sb"/><text x="519" y="112" text-anchor="middle">73</text><text x="519" y="218" class="tm" text-anchor="middle">7</text><text x="519" y="244" class="tg" text-anchor="middle">0</text><text x="10" y="218" class="tm">day</text><text x="10" y="244" class="tg">wait</text><path d="M91 92 Q 116.0 68 141 84" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M153 84 Q 178.0 60 203 76" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M215 76 Q 333.0 34 451 68" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M277 108 Q 333.0 78 389 100" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M339 124 Q 364.0 84 389 100" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/><path d="M401 100 Q 426.0 52 451 68" fill="none" class="sr" stroke-width="1.4" marker-end="url(#sq-c)"/></svg><figcaption>Daily temperatures. Each red arrow jumps from a day to the first warmer day ahead. "wait" is the gap. Day 2 (75) waits 4 days, because 71, 69 and 72 are all colder.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>monotonic stack</strong> is a stack whose values are kept in sorted order (all decreasing or all increasing) from bottom to top. Before pushing a new item you pop every item that breaks the order; each pop is the moment that item's "next greater" (or smaller) is found.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>&lt; vs &lt;=. O2 and O6 both have ₹80: is ₹80 "bigger" than ₹80? With <code>&lt;</code> (strictly bigger) equal bills keep waiting; with <code>&lt;=</code> an equal bill answers. Read the problem, then test with repeated values like <code>[80, 80]</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>496 Next Greater Element I</b> (this section plus a dict), <b>739 Daily Temperatures</b> (the distance version), <b>901 Online Stock Span</b> (previous greater, one price at a time), <b>503 Next Greater Element II</b> (circular: loop twice).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Monotonic Deque.</b> The stack looks at <em>everything so far</em>. Operations wants "the biggest bill among the <em>last 3</em> orders", for every position. Old orders must leave the window from the far end, which a stack cannot do.</div>

  <h2 id="dsa-sq-deque"><span class="num">09</span>Monotonic Deque: Sliding Window Maximum</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A monotonic stack drops useless items from one end. A sliding window also needs items to <em>expire</em> from the other end once they are older than k positions. How do we keep the window's maximum available in O(1) while items arrive at one end and leave at the other?</p>
  </div>
  <p>Now a window of size k slides across the bills, and we want the maximum of each window. Recomputing <code>max</code> for each window is O(n·k). A heap works in O(n log n) but needs lazy deletion. A deque does it in O(n).</p>
  <p>The idea: when a new bill arrives, every older, smaller bill in the window can <em>never</em> be the max again, because the new one is bigger and will stay in the window longer. So throw them out from the back. What remains is decreasing from front to back, and the front is the max. The front also leaves when it slides out of the window.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket selector watching the last k matches for the best batter. A young player scores 120. Every older player who scored less is dropped from consideration for good: they are worse <em>and</em> will retire from the window sooner.</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "sliding window maximum / minimum", "window of size k", "max − min within limit", "best value in the last k steps" (DP with a window, e.g. Jump Game VI).</p>
  <h3>Template</h3>
  <div class="flow"><span>1. pop the back while its value ≤ new value</span><span>2. push the new index</span><span>3. pop the front if its index ≤ i − k</span><span>4. once i ≥ k − 1, front is the window max</span></div>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Biggest bill in every window of 3 orders (deque shows index:bill, front → back)</caption>
    <tr><th>i</th><th>bill</th><th>pop from back</th><th>pop from front (expired)</th><th>deque after</th><th>window</th><th>max</th></tr>
    <tr><td>0</td><td>120</td><td>–</td><td>–</td><td>0:120</td><td>–</td><td>–</td></tr>
    <tr><td>1</td><td>80</td><td>–</td><td>–</td><td>0:120 1:80</td><td>–</td><td>–</td></tr>
    <tr><td>2</td><td>250</td><td>80, 120</td><td>–</td><td>2:250</td><td>O1–O3</td><td>250</td></tr>
    <tr><td>3</td><td>40</td><td>–</td><td>–</td><td>2:250 3:40</td><td>O2–O4</td><td>250</td></tr>
    <tr><td>4</td><td>310</td><td>40, 250</td><td>–</td><td>4:310</td><td>O3–O5</td><td>310</td></tr>
    <tr><td>5</td><td>80</td><td>–</td><td>–</td><td>4:310 5:80</td><td>O4–O6</td><td>310</td></tr>
    <tr><td>6</td><td>60</td><td>–</td><td>–</td><td>4:310 5:80 6:60</td><td>O5–O7</td><td>310</td></tr>
    <tr><td>7</td><td>200</td><td>60, 80</td><td>index 4 (≤ 7 − 3)</td><td>7:200</td><td>O6–O8</td><td>200</td></tr>
  </table>
  <p>Answer: <b>[250, 250, 310, 310, 310, 200]</b>. The last row shows both kinds of removal: ₹60 and ₹80 leave from the back because ₹200 beats them, and ₹310 leaves from the front because O5 has slid out of the window.</p>
<figure class="viz"><svg viewBox="0 0 600 250" width="600"><text x="10" y="26" class="tm">nums</text><rect x="150" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="174" y="28" text-anchor="middle">1</text><text x="174" y="50" class="tm" text-anchor="middle">0</text><rect x="198" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="222" y="28" text-anchor="middle">3</text><text x="222" y="50" class="tm" text-anchor="middle">1</text><rect x="246" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="270" y="28" text-anchor="middle">-1</text><text x="270" y="50" class="tm" text-anchor="middle">2</text><rect x="294" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="318" y="28" text-anchor="middle">-3</text><text x="318" y="50" class="tm" text-anchor="middle">3</text><rect x="342" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="366" y="28" text-anchor="middle">5</text><text x="366" y="50" class="tm" text-anchor="middle">4</text><rect x="390" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="414" y="28" text-anchor="middle">3</text><text x="414" y="50" class="tm" text-anchor="middle">5</text><rect x="438" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="462" y="28" text-anchor="middle">6</text><text x="462" y="50" class="tm" text-anchor="middle">6</text><rect x="486" y="10" width="48" height="26" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="510" y="28" text-anchor="middle">7</text><text x="510" y="50" class="tm" text-anchor="middle">7</text><text x="10" y="76" class="tm">window</text><text x="250" y="76" class="tb">deque (indices)</text><text x="390" y="76" class="tm">their values</text><text x="530" y="76" class="tg">max</text><g class="fs"><rect x="118" y="85" width="13" height="13"/><rect x="134" y="85" width="13" height="13"/><rect x="150" y="85" width="13" height="13"/><rect x="166" y="85" width="13" height="13"/><rect x="182" y="85" width="13" height="13"/></g><g class="fb sb"><rect x="70" y="85" width="13" height="13"/><rect x="86" y="85" width="13" height="13"/><rect x="102" y="85" width="13" height="13"/></g><text x="250" y="96">[1, 2]</text><text x="390" y="96" class="tm">3, -1</text><text x="530" y="96" class="tg">3</text><g class="fs"><rect x="70" y="109" width="13" height="13"/><rect x="134" y="109" width="13" height="13"/><rect x="150" y="109" width="13" height="13"/><rect x="166" y="109" width="13" height="13"/><rect x="182" y="109" width="13" height="13"/></g><g class="fb sb"><rect x="86" y="109" width="13" height="13"/><rect x="102" y="109" width="13" height="13"/><rect x="118" y="109" width="13" height="13"/></g><text x="250" y="120">[1, 2, 3]</text><text x="390" y="120" class="tm">3, -1, -3</text><text x="530" y="120" class="tg">3</text><g class="fs"><rect x="70" y="133" width="13" height="13"/><rect x="86" y="133" width="13" height="13"/><rect x="150" y="133" width="13" height="13"/><rect x="166" y="133" width="13" height="13"/><rect x="182" y="133" width="13" height="13"/></g><g class="fb sb"><rect x="102" y="133" width="13" height="13"/><rect x="118" y="133" width="13" height="13"/><rect x="134" y="133" width="13" height="13"/></g><text x="250" y="144">[4]</text><text x="390" y="144" class="tm">5</text><text x="530" y="144" class="tg">5</text><g class="fs"><rect x="70" y="157" width="13" height="13"/><rect x="86" y="157" width="13" height="13"/><rect x="102" y="157" width="13" height="13"/><rect x="166" y="157" width="13" height="13"/><rect x="182" y="157" width="13" height="13"/></g><g class="fb sb"><rect x="118" y="157" width="13" height="13"/><rect x="134" y="157" width="13" height="13"/><rect x="150" y="157" width="13" height="13"/></g><text x="250" y="168">[4, 5]</text><text x="390" y="168" class="tm">5, 3</text><text x="530" y="168" class="tg">5</text><g class="fs"><rect x="70" y="181" width="13" height="13"/><rect x="86" y="181" width="13" height="13"/><rect x="102" y="181" width="13" height="13"/><rect x="118" y="181" width="13" height="13"/><rect x="182" y="181" width="13" height="13"/></g><g class="fb sb"><rect x="134" y="181" width="13" height="13"/><rect x="150" y="181" width="13" height="13"/><rect x="166" y="181" width="13" height="13"/></g><text x="250" y="192">[6]</text><text x="390" y="192" class="tm">6</text><text x="530" y="192" class="tg">6</text><g class="fs"><rect x="70" y="205" width="13" height="13"/><rect x="86" y="205" width="13" height="13"/><rect x="102" y="205" width="13" height="13"/><rect x="118" y="205" width="13" height="13"/><rect x="134" y="205" width="13" height="13"/></g><g class="fb sb"><rect x="150" y="205" width="13" height="13"/><rect x="166" y="205" width="13" height="13"/><rect x="182" y="205" width="13" height="13"/></g><text x="250" y="216">[7]</text><text x="390" y="216" class="tm">7</text><text x="530" y="216" class="tg">7</text><text x="10" y="248" class="tm">k = 3 · deque values always decrease from front to back · front = max</text></svg><figcaption>Sliding window maximum, k = 3. The deque keeps only indices that could still become the max. A new big number (5 at index 4) throws out every smaller number behind it, because they can never win again.</figcaption></figure>
  <p>Store <strong>indices</strong>, not values: you need the index to know when the front has left the window.</p>
  <h3>The code</h3>
<div class="fx" data-lang="py">def max_sliding_window(nums, k, trace=False):
    dq, out = deque(), []                        # indices; values decreasing
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] &lt;= x:          # smaller ones can never win now
            dq.pop()
        dq.append(i)
        if dq[0] &lt;= i - k:                       # front slid out of the window
            dq.popleft()
        if i &gt;= k - 1:
            out.append(nums[dq[0]])
        if trace:
            print(f"i={i} bill={x:3}  deque={[f'{j}:{nums[j]}' for j in dq]}  out={out}")
    return out

print(max_sliding_window(bills, 3, trace=True))
print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
print(max_sliding_window([1], 1), max_sliding_window([9, 8, 7, 6], 2), max_sliding_window([4, 2, 12, 3], 4))</div>
  <div class="fx" data-lang="text">i=0 bill=120  deque=['0:120']  out=[]
i=1 bill= 80  deque=['0:120', '1:80']  out=[]
i=2 bill=250  deque=['2:250']  out=[250]
i=3 bill= 40  deque=['2:250', '3:40']  out=[250, 250]
i=4 bill=310  deque=['4:310']  out=[250, 250, 310]
i=5 bill= 80  deque=['4:310', '5:80']  out=[250, 250, 310, 310]
i=6 bill= 60  deque=['4:310', '5:80', '6:60']  out=[250, 250, 310, 310, 310]
i=7 bill=200  deque=['7:200']  out=[250, 250, 310, 310, 310, 200]
[250, 250, 310, 310, 310, 200]
[3, 3, 5, 5, 6, 7]
[1] [9, 8, 7] [12]</div>
  <h3>Measured against the brute force</h3>
<div class="fx" data-lang="py">random.seed(1)
big = [random.randint(10, 999) for _ in range(100_000)]
k = 1_000
t = time.perf_counter(); brute = [max(big[i:i + k]) for i in range(len(big) - k + 1)]; tb = time.perf_counter() - t
t = time.perf_counter(); fast = max_sliding_window(big, k); tf = time.perf_counter() - t
print(f"n=1 lakh, k={k}: max() per window {tb:.2f} s, deque {tf:.3f} s, same: {brute == fast}")</div>
  <div class="fx" data-lang="text">n=1 lakh, k=1000: max() per window 1.28 s, deque 0.021 s, same: True</div>
  <p>The brute force does about n·k = 10 crore element visits (fast per element, because <code>max</code> runs in C, but still over a second); the deque touches each index at most twice.</p>
  <h3>Complexity</h3>
  <p>O(n) time: each index is added once and removed at most once (from the back or the front). O(k) space: the deque never holds more than k indices. For the window <em>minimum</em>, flip the comparison.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>monotonic deque</strong> is a deque of indices whose values are kept decreasing (for max) from front to back. New items evict smaller items at the back; expired indices leave at the front; the front is always the current window's maximum.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Checking expiry with the wrong index or forgetting it. The front must leave when <code>dq[0] &lt;= i - k</code>. Without this line the trace above would report ₹310 for the last window too, although O5 is no longer in it.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>239 Sliding Window Maximum</b> (this section), <b>1438 Longest Continuous Subarray With Absolute Diff ≤ Limit</b> (one max-deque and one min-deque), <b>1696 Jump Game VI</b> (window max over DP values).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Patterns.</b> We now have six tools. In an interview nobody says "use a monotonic deque". We need to go from the words in a problem statement to the right tool.</div>

  <h2 id="dsa-sq-patterns"><span class="num">10</span>Patterns: Recognise and Template</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section taught one tool on Biteful's orders. Faced with a new problem, which words point to which tool, and what is the skeleton to start typing?</p>
  </div>
  <table class="tbl">
    <tr><th>Pattern</th><th>Trigger words</th><th>Tool</th><th>Section / solved</th></tr>
    <tr><td><strong>1. Undo / cancel with previous</strong></td><td>"backspace", "remove adjacent", "cancel", "undo"</td><td>Plain stack</td><td>02</td></tr>
    <tr><td><strong>2. Matching / nesting</strong></td><td>"valid brackets", "balanced", "decode nested string", "simplify path"</td><td>Stack of openers</td><td>03, Valid Parentheses</td></tr>
    <tr><td><strong>3. Stack with extra info</strong></td><td>"get min in O(1)", "max stack", "increment the bottom k"</td><td>Push (value, running min)</td><td>04, Min Stack</td></tr>
    <tr><td><strong>4. Expression evaluation</strong></td><td>"evaluate", "postfix", "calculator", "+ - * / ( )"</td><td>Stack of numbers (and saved state at "(")</td><td>11: Evaluate RPN, Basic Calculator</td></tr>
    <tr><td><strong>5. Queue simulation</strong></td><td>"in order of arrival", "recent calls in the last t ms", "round robin"</td><td>deque</td><td>05</td></tr>
    <tr><td><strong>6. Level-order / shortest steps</strong></td><td>"minimum moves", "nearest", "level by level", "spread / rot / infect"</td><td>BFS with deque</td><td>07</td></tr>
    <tr><td><strong>7. Monotonic stack</strong></td><td>"next greater / smaller", "days until", "stock span", "largest rectangle", "trapping rain water"</td><td>Stack of indices kept sorted</td><td>08; 11: Daily Temperatures, Next Greater, Largest Rectangle</td></tr>
    <tr><td><strong>8. Monotonic deque</strong></td><td>"sliding window max / min", "window of size k"</td><td>Deque of indices, decreasing values</td><td>09, Sliding Window Maximum</td></tr>
  </table>
  <p>The three skeletons worth memorising, as runnable functions. Each is tested on the running example so you can see it is the real thing, not pseudo-code.</p>
<div class="fx" data-lang="py">def matching_template(s, pairs={")": "(", "]": "[", "}": "{"}):
    stack = []
    for ch in s:
        if ch in pairs:                              # closer: must match the newest opener
            if not stack or stack.pop() != pairs[ch]:
                return False
        elif ch in pairs.values():                   # opener: remember it
            stack.append(ch)
    return not stack                                 # leftovers = unclosed

def monotonic_stack_template(nums):
    ans = [-1] * len(nums)
    stack = []                                       # indices; values decreasing bottom to top
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] &lt; x:
            ans[stack.pop()] = x                     # x is the popped index's answer
        stack.append(i)
    return ans                                       # whatever is left never found an answer

def monotonic_deque_template(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] &lt;= x:
            dq.pop()                                 # can never be the max again
        dq.append(i)
        if dq[0] &lt;= i - k:
            dq.popleft()                             # expired
        if i &gt;= k - 1:
            out.append(nums[dq[0]])
    return out

print(matching_template('{"combo": [{"id": 3}, {"id": 5}]}'))
print(monotonic_stack_template(bills))
print(monotonic_deque_template(bills, 3))</div>
  <div class="fx" data-lang="text">True
[250, 250, 310, 310, -1, 200, 200, -1]
[250, 250, 310, 310, 310, 200]</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for a stack because the problem mentions "previous". "Previous smaller" is a monotonic stack; "the previous k values" is a window (deque); "the most urgent" is a heap. Say which order you need (newest, oldest, sorted-by-value-within-window, most urgent) before choosing.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>394 Decode String</b> (nesting + saved state), <b>150 Evaluate Reverse Polish Notation</b> (expression stack), <b>1475 Final Prices With a Special Discount</b> (next smaller-or-equal: an easy monotonic stack).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> The templates are short. The interview versions add twists: distances instead of values, a histogram, operators and brackets. Let us solve the six most asked.</div>

  <h2 id="dsa-sq-problems"><span class="num">11</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Valid Parentheses (section 03), Min Stack (04), Queue via Stacks (06) and Sliding Window Maximum (09) are done. Do the same tools carry over unchanged to the other famous stack problems, or do they need new ideas?</p>
  </div>

  <h3>1. Daily Temperatures (LeetCode 739)</h3>
  <p><strong>Problem.</strong> For each day, how many days until a warmer temperature? 0 if never. It is <code>orders_until_bigger</code> from section 08 on temperatures (the picture in section 08).</p>
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
[50, 50] -&gt; [0, 0]</div>
  <p><strong>Complexity.</strong> O(n) time, O(n) space. Equal temperatures are not warmer, so the comparison is strict <code>&lt;</code>.</p>

  <h3>2. Next Greater Element I (LeetCode 496)</h3>
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
[] [-1]</div>
  <p><strong>Complexity.</strong> O(m + n) time, O(n) space.</p>

  <h3>3. Largest Rectangle in Histogram (LeetCode 84)</h3>
  <p><strong>Problem.</strong> Bars of width 1 with given heights. Find the area of the largest rectangle inside the histogram. <code>[2, 1, 5, 6, 2, 3]</code> → 10 (heights 5 and 6, width 2, height 5).</p>
  <p><strong>Brute force.</strong> For every bar, spread left and right while bars are at least as tall: O(n²).</p>
  <p><strong>Better.</strong> For each bar, the best rectangle using its <em>full height</em> stretches from the first shorter bar on its left to the first shorter bar on its right. That is "previous smaller" and "next smaller": a monotonic stack with <strong>increasing</strong> heights. When a shorter bar arrives at <code>i</code>, the top bar has found its right limit (<code>i</code>), and the bar below it in the stack is its left limit. Pop and compute. A height-0 bar at the end flushes everything.</p>
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
[6, 2, 5, 4, 5, 1, 6] -&gt; 12</div>
  <p><strong>Complexity.</strong> O(n) time, O(n) space. Popping on <code>&gt;=</code> handles equal heights: the last equal bar computes the full width. The same idea solves Maximal Rectangle in a 0/1 matrix (one histogram per row).</p>

  <h3>4. Evaluate Reverse Polish Notation (LeetCode 150)</h3>
  <p><strong>Problem.</strong> Evaluate an expression in postfix form, where the operator comes after its two numbers: <code>["2", "1", "+", "3", "*"]</code> means (2 + 1) × 3 = 9. Division truncates toward zero.</p>
  <p><strong>Idea.</strong> Numbers are pushed. An operator pops the top two (careful: the first pop is the <em>right</em> operand), computes, and pushes the result. No brackets or precedence rules are needed, which is why old HP calculators and the JVM use postfix. Biteful's bill engine could compute "₹120 plus ₹80, times 2" as <code>["120", "80", "+", "2", "*"]</code> = 400.</p>
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

print(eval_rpn(["120", "80", "+", "2", "*"]))
print(eval_rpn(["2", "1", "+", "3", "*"]))
print(eval_rpn(["4", "13", "5", "/", "+"]))
print(eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]))
print(eval_rpn(["-7", "2", "/"]), -7 // 2, "&lt;- floor division would be wrong")</div>
  <div class="fx" data-lang="text">400
9
6
22
-3 -4 &lt;- floor division would be wrong</div>
  <p><strong>Complexity.</strong> O(n) time and space. Watch <code>"-11"</code>: a negative number, not an operator, which is why we check exact tokens.</p>

  <h3>5. Basic Calculator (LeetCode 224)</h3>
  <p><strong>Problem.</strong> Evaluate a string with non-negative integers, <code>+</code>, <code>-</code>, brackets and spaces, like <code>"(1+(4+5+2)-3)+(6+8)"</code> → 23. Unary minus is allowed: <code>"-(2+3)"</code>. No <code>eval</code>.</p>
  <p><strong>Idea.</strong> Without brackets it is easy: keep a running <code>result</code> and the <code>sign</code> (+1 or −1) of the number being read. A <code>(</code> starts a fresh sub-problem, so <strong>save</strong> the current result and sign on a stack and start from 0. At <code>)</code>, finish the inner result and <strong>restore</strong>: <code>outer_result + outer_sign × inner_result</code>. The stack remembers the unfinished outer work: exactly its job, the same as matching brackets in section 03.</p>
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

for expr in ["1 + 1", " 2-1 + 2 ", "(1+(4+5+2)-3)+(6+8)", "-(2+3)", "1-(     -2)", "2147483647", "- (3 + (4 + 5))", "310 - (120 + 80)"]:
    print(repr(expr), "-&gt;", calculate(expr))</div>
  <div class="fx" data-lang="text">'1 + 1' -&gt; 2
' 2-1 + 2 ' -&gt; 3
'(1+(4+5+2)-3)+(6+8)' -&gt; 23
'-(2+3)' -&gt; -5
'1-(     -2)' -&gt; 3
'2147483647' -&gt; 2147483647
'- (3 + (4 + 5))' -&gt; -12
'310 - (120 + 80)' -&gt; 110</div>
  <p><strong>Complexity.</strong> O(n) time, O(depth of brackets) space. Basic Calculator II (with <code>*</code> and <code>/</code>, no brackets) uses a stack differently: push <code>+num</code> / <code>-num</code>, and for <code>*</code> or <code>/</code> pop the top and push the combined value; the answer is the sum of the stack.</p>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>84 Largest Rectangle in Histogram</b>, <b>224 Basic Calculator</b>, <b>227 Basic Calculator II</b>. Write the dry-run table first; the code is short once the table is right.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> All six solutions are a few lines, and that is the danger: one wrong comparison or a missing guard gives a silently wrong answer. Let us list the mistakes that actually happen.</div>

  <h2 id="dsa-sq-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The tools are right, so why do correct-looking stack solutions still fail hidden tests? Almost always because of one of six small slips.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: list.pop(0) as a queue</span>
    <p>O(n) per dequeue (section 05 measured about 3 s against 0.005 s at 2 lakh tickets). Use <code>deque.popleft()</code>. Same for <code>list.insert(0, x)</code>; use <code>appendleft</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: popping or peeking an empty stack</span>
    <p><code>stack[-1]</code> or <code>stack.pop()</code> on <code>[]</code> raises <code>IndexError</code>. Write <code>while stack and …</code>: the <code>stack and</code> part must come first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting leftovers</span>
    <p>After the loop, items still on the stack matter: unclosed brackets (answer False), orders with no bigger bill (answer −1), days with no warmer day (answer 0), bars never popped (use a sentinel 0 to flush them).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: operand order and division</span>
    <p>In RPN, the first pop is the <em>right</em> operand: <code>b = pop(); a = pop(); a - b</code>. Python's <code>//</code> floors (−7 // 2 = −4); problems that say "truncate toward zero" need <code>int(a / b)</code> = −3.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: storing values instead of indices</span>
    <p>Daily Temperatures needs distances and Sliding Window Max needs to know when an item left the window. Both need <strong>indices</strong> on the stack/deque; read the value with <code>nums[i]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: &lt; vs &lt;= in monotonic stacks</span>
    <p>"Strictly bigger" pops on <code>&lt;</code>; equal bills keep waiting. Choosing wrong silently shifts answers for duplicates. Test with repeated values like <code>[80, 80]</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have many tools and many traps. How are the tools built from one another, and which question does each answer on the same 8 orders?</div>

  <h2 id="dsa-sq-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>LIFO, FIFO, brackets, min stack, deque, two-stack queue, BFS, monotonic stack and deque: how is each built from the one before, and which one do you reach for when?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-sq-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">the need</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">Undo O3 · next ticket O1</text>
<line x1="105" y1="54" x2="105" y2="86" stroke="currentColor" marker-end="url(#dsa-sq-a9)"/>
<line x1="200" y1="32" x2="458" y2="32" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-sq-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">queue = deque (FIFO)</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">popleft O(1); pop(0) O(n)</text>
<rect x="10" y="88" width="190" height="44" rx="7" class="fb sb"/><text x="105" y="107" text-anchor="middle" font-size="11.5" font-weight="700">stack = list (LIFO)</text><text x="105" y="123" text-anchor="middle" class="tm" font-size="10">append / pop / [-1]</text>
<line x1="200" y1="110" x2="238" y2="110" stroke="currentColor" marker-end="url(#dsa-sq-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="ft st"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">matching brackets</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">{[{}{}]} → empty → valid</text>
<line x1="105" y1="132" x2="105" y2="164" stroke="currentColor" marker-end="url(#dsa-sq-a9)"/>
<rect x="10" y="166" width="190" height="44" rx="7" class="ft st"/><text x="105" y="185" text-anchor="middle" font-size="11.5" font-weight="700">min stack</text><text x="105" y="201" text-anchor="middle" class="tm" font-size="10">(value, min so far): 40 → 80</text>
<line x1="200" y1="132" x2="458" y2="98" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#dsa-sq-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="ft st"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">queue from 2 stacks</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">pour once: amortised O(1)</text>
<line x1="555" y1="54" x2="555" y2="164" stroke="currentColor" marker-end="url(#dsa-sq-a9)"/>
<rect x="460" y="166" width="190" height="44" rx="7" class="ft st"/><text x="555" y="185" text-anchor="middle" font-size="11.5" font-weight="700">BFS</text><text x="555" y="201" text-anchor="middle" class="tm" font-size="10">waves → shortest path: 7</text>
<line x1="105" y1="210" x2="200" y2="244" stroke="currentColor" marker-end="url(#dsa-sq-a9)"/>
<rect x="160" y="244" width="200" height="48" rx="7" class="fg sg"/><text x="260" y="264" text-anchor="middle" font-size="11.5" font-weight="700">monotonic stack</text><text x="260" y="281" text-anchor="middle" class="tm" font-size="10">next greater: 250 250 310 310 −1 …</text>
<line x1="360" y1="268" x2="408" y2="268" stroke="currentColor" marker-end="url(#dsa-sq-a9)"/>
<line x1="555" y1="210" x2="520" y2="244" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-sq-a9)"/>
<rect x="410" y="244" width="240" height="48" rx="7" class="fg sg"/><text x="530" y="264" text-anchor="middle" font-size="11.5" font-weight="700">monotonic deque</text><text x="530" y="281" text-anchor="middle" class="tm" font-size="10">window-3 max: 250 250 310 310 310 200</text>
</svg><figcaption>Two roots, one per removal order. The stack branch adds information to each entry (min stack) or keeps entries sorted (monotonic stack). The queue branch gives BFS. The monotonic deque is the meeting point: a stack-like sorted back end plus a queue-like expiring front end.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's 8 orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>Use when</th></tr>
    <tr><td>Stack (LIFO)</td><td>list end: append / pop</td><td>what is the newest unfinished thing?</td><td>add 120, 80, 250; Undo → 250</td><td>undo, call stack, DFS</td></tr>
    <tr><td>Valid parentheses</td><td>stack of openers</td><td>is the nesting well formed?</td><td><code>{[{}{}]}</code> valid; <code>{[}]</code> fails at char 3</td><td>brackets, nested decode</td></tr>
    <tr><td>Min stack</td><td>stack of (value, min so far)</td><td>minimum now, after any undo?</td><td>after 120, 80, 250, 40: 40; two undos: 80</td><td>O(1) statistic that survives pops</td></tr>
    <tr><td>Queue (deque)</td><td>linked blocks, both ends O(1)</td><td>who has waited longest?</td><td>serve O1 first; 2 lakh pops: list ~3 s vs deque ~0.005 s</td><td>tickets, BFS, recent-calls windows</td></tr>
    <tr><td>Queue from 2 stacks</td><td>two LIFOs, pour when empty</td><td>can FIFO be built from LIFO?</td><td>push O1–O3, pop O1; push O4; pops O2, O3, O4</td><td>interview design questions</td></tr>
    <tr><td>BFS</td><td>queue + seen set</td><td>fewest steps?</td><td>rider grid: 7 blocks</td><td>unweighted shortest path, levels</td></tr>
    <tr><td>Monotonic stack</td><td>stack of indices, values sorted</td><td>next greater / smaller for every item?</td><td>[250, 250, 310, 310, −1, 200, 200, −1]</td><td>next/previous greater, spans, histograms</td></tr>
    <tr><td>Monotonic deque</td><td>deque of indices, values sorted + expiry</td><td>max / min of every window?</td><td>k = 3: [250, 250, 310, 310, 310, 200]</td><td>sliding window extremes</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>decide which item you need next (newest, oldest, or "the best one still possible"), and keep only the items that could still be that answer.</strong> A stack keeps all unfinished items; a monotonic stack also throws away items that can no longer matter; a monotonic deque additionally lets old items expire.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_binsearch">Binary Search</a>: every tool here walks the data once in arrival order. None can answer "is there an order at 6:23 pm?" in a sorted log of 10 lakh orders without walking through it. That needs halving, the next note.</div>

  <h2 id="dsa-sq-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's 8 orders O1..O8 with bills <b>[120, 80, 250, 40, 310, 80, 60, 200]</b>.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>The need</td><td>which item comes out?</td><td>Undo gives O3; kitchen serves O1</td><td>need a structure for each order</td></tr>
    <tr><td>Stack</td><td>newest first, cheaply?</td><td>push 120, 80, 250; pop → 250; peek → 80</td><td>only stores; can it check?</td></tr>
    <tr><td>Valid parentheses</td><td>well-formed nesting?</td><td><code>{[{}{}]}</code> → empty stack → valid</td><td>no running minimum</td></tr>
    <tr><td>Min stack</td><td>min in O(1) after undo?</td><td>40, then 80 after undo, then 120</td><td>stacks never give oldest</td></tr>
    <tr><td>Queue / deque</td><td>oldest first, cheaply?</td><td>pop(0) O(n): ~3 s vs ~0.005 s at 2 lakh</td><td>can FIFO come from LIFO?</td></tr>
    <tr><td>Two-stack queue</td><td>FIFO from stacks?</td><td>pour once; amortised O(1)</td><td>what does FIFO buy?</td></tr>
    <tr><td>BFS</td><td>fewest steps?</td><td>rider grid: 7</td><td>next bigger bill is O(n²) by brute force</td></tr>
    <tr><td>Monotonic stack</td><td>next greater for all?</td><td>250, 250, 310, 310, −1, 200, 200, −1</td><td>can't expire old items</td></tr>
    <tr><td>Monotonic deque</td><td>max of every window?</td><td>k = 3: 250, 250, 310, 310, 310, 200</td><td>→ Binary Search, Trees, Heaps</td></tr>
  </table>
  <h3>Rules and costs</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Stack ops</td><td><code>append</code>, <code>pop()</code>, <code>s[-1]</code>: O(1)</td><td>end of list = top; never <code>pop(0)</code></td></tr>
    <tr><td>Queue ops</td><td><code>append</code>, <code>popleft()</code>, <code>q[0]</code>: O(1)</td><td><code>from collections import deque</code></td></tr>
    <tr><td>list.pop(0)</td><td>O(n) each, O(n²) to drain n items</td><td>n = items in the list; doubling n ≈ 4× time</td></tr>
    <tr><td>Min stack entry</td><td>(v, min(v, below's min))</td><td>v = pushed value</td></tr>
    <tr><td>Amortised (2-stack queue)</td><td>total work for n ops = O(n) → O(1) each</td><td>each item: push, pour, pop once</td></tr>
    <tr><td>Monotonic stack</td><td>pushes + pops ≤ 2n → O(n)</td><td>pop while <code>nums[top] &lt; x</code> (next greater)</td></tr>
    <tr><td>Monotonic deque</td><td>back: pop while ≤ x; front: pop if index ≤ i − k</td><td>k = window size; O(n) time, O(k) space</td></tr>
    <tr><td>BFS</td><td>O(V + E) time; mark seen on push</td><td>V = places, E = connections</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Stack (list)</b><p>Undo, nesting, "most recent unfinished", DFS without recursion.</p><small>Not for oldest-first or for search</small></div>
    <div><b>Queue (deque)</b><p>Arrival order, BFS, time windows of recent events.</p><small>Not for middle access (O(n)) or "most urgent" (heap)</small></div>
    <div><b>Monotonic stack</b><p>Next/previous greater or smaller for every item, spans, histograms.</p><small>Not when items must expire after k steps</small></div>
    <div><b>Monotonic deque</b><p>Max/min of every window of size k.</p><small>Not for window median or sum (use heaps / prefix sums)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p><code>list.pop(0)</code> as a queue; popping an empty stack (guard with <code>stack and</code>); ignoring leftovers after the loop; values instead of indices on monotonic structures; <code>&lt;</code> vs <code>&lt;=</code> with duplicates; RPN operand order and <code>//</code> vs truncation; single <code>min</code> variable in a min stack; marking BFS cells seen on pop instead of push.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Push 120, 80, 250, pop, push 40. What is on top, and what is the min-stack minimum?</td><td>Top 40; minimum 40 (pairs: (120,120) (80,80) (40,40))</td></tr>
    <tr><td>Is <code>{[}]</code> valid? Where does it fail?</td><td>No: at the 3rd char, <code>}</code> meets top <code>[</code></td></tr>
    <tr><td>Why is the monotonic stack O(n) despite the inner while?</td><td>Each index is pushed once and popped at most once: ≤ 2n moves</td></tr>
    <tr><td>Next greater bill of O6 (₹80)?</td><td>₹200 (O8); O7's ₹60 is smaller</td></tr>
    <tr><td>Window k = 3 at O6–O8: max, and why does ₹310 leave?</td><td>₹200; index 4 ≤ 7 − 3, so O5 expired from the front</td></tr>
  </table>

  <h2 id="dsa-sq-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>LIFO vs FIFO: give one real use of each.</summary><div class="qa-body">Stack (LIFO): undo, browser back, the function call stack, matching brackets. Queue (FIFO): BFS, print spooler, task/message queues, kitchen tickets. Stack answers "most recent unfinished", queue answers "waited longest".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a Python list fine as a stack but bad as a queue?</summary><div class="qa-body">The stack top is the list's end: <code>append</code> / <code>pop()</code> are O(1). A queue removes from the front, and <code>pop(0)</code> shifts every remaining item left: O(n). Draining 2 lakh items took about 3 s with a list and about 0.005 s with a deque. <code>collections.deque</code> does <code>popleft</code> in O(1) because it is a linked list of blocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you build a queue from two stacks, and what does it cost?</summary><div class="qa-body">Push into an inbox stack. Pop from an outbox stack; only when the outbox is empty, pour the whole inbox into it (which reverses order, oldest on top). A single pop can be O(n), but each item is moved once, so it is amortised O(1) per operation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Min Stack get the minimum in O(1)?</summary><div class="qa-body">Each entry stores (value, min of itself and everything below). getMin reads the top's second field. After a pop, the new top already has its own correct minimum, so nothing is recomputed. On Biteful's batch: 40 while O4 is in, 80 right after its undo.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The monotonic stack has a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body">Each index is pushed exactly once and popped at most once. So the total number of inner-loop pops over the whole run is ≤ n, and total work is O(n). On the 8 bills: 8 pushes and 6 pops. This "count pushes and pops" argument is amortised analysis.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Largest Rectangle in Histogram, what do you learn when a bar is popped?</summary><div class="qa-body">The current index i is the first shorter bar to its right, and the new stack top is the first shorter bar to its left. So the widest rectangle at that bar's full height spans (left+1 … i−1), width i − left − 1 (or i if the stack is empty).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Sliding window maximum: why can we discard smaller items behind a new big one?</summary><div class="qa-body">The new item is bigger and entered later, so it stays in the window at least as long. A smaller, older item can never be the maximum of any future window. Removing them keeps the deque decreasing, so the front is the max. O(n) total.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What changes if you replace the queue in BFS with a stack?</summary><div class="qa-body">It becomes depth-first: it follows one branch as deep as possible before backtracking. You lose the "first time reached = shortest path" guarantee, which only BFS's level-by-level order gives in unweighted graphs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>s = [1, 2, 3]; s.append(s.pop() + s.pop()); print(s)</code></summary><div class="qa-body"><code>[1, 5]</code>. The two pops remove 3 then 2, their sum 5 is pushed. Order of operands matters for <code>-</code> and <code>/</code>: <code>s.pop() - s.pop()</code> would compute 3 − 2, the reverse of RPN's a − b.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Basic Calculator, what goes on the stack at "(" and why?</summary><div class="qa-body">The result so far and the sign in front of the bracket. The bracket is a fresh sub-expression, so we start it at 0; at ")" we combine: outer_result + sign × inner_result. The stack holds one saved state per open bracket, so nesting of any depth works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Valid Parentheses need a stack and not just a counter?</summary><div class="qa-body">A counter only knows how many brackets are open, not <em>which kind</em> was opened last. The closer must match the most recent opener (that is what nesting means), and "most recent" is exactly what a stack's top gives. <code>([)]</code> has balanced counts but fails because <code>)</code> meets <code>[</code> on top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you build the monotonic stack with values instead of indices?</summary><div class="qa-body">Next Greater Element still works (you only need values), but anything that needs a position breaks: "how many orders until a bigger bill" needs i − j, and the sliding window needs to know when the front has expired. With duplicate bills (two ₹80 orders) values alone can't even tell the two orders apart.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is the monotonic deque a "stack at the back and a queue at the front"?</summary><div class="qa-body">At the back it behaves exactly like the monotonic stack of section 08: a new bill pops every smaller bill. At the front it behaves like the queue of section 05: the oldest index leaves first when it falls out of the window. Neither structure alone can do both, which is why the window maximum needs a deque.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what would go wrong in the kitchen if tickets were kept on a stack?</summary><div class="qa-body">The newest ticket would always be cooked first. In a busy hour O1 could wait forever while new orders keep arriving on top (starvation). FIFO guarantees everyone is served in arrival order; if some orders are genuinely more urgent, you need a priority queue (heap), not a stack.</div></details>
</main>
`
});
