// notes/dsa/dsa_backtrack.js — Recursion & Backtracking
Object.assign(TOPIC_CONTENT, {
  "dsa_backtrack": `<main>
<h1>Recursion &amp; Backtracking</h1>
  <div class="where"><span>DSA</span><span>Techniques</span><span>Recursion &amp; Backtracking</span></div>
  <p class="lead">Recursion is a function that solves a problem by calling itself on a smaller copy of the same problem. Backtracking uses recursion to <b>generate every option, one choice at a time, and undo a choice when it is finished or hopeless</b>. Interviews use it for "list all subsets / arrangements / combinations" questions, puzzles like N-Queens, and grid searches. This note first builds recursion itself (base case, call stack, recursion tree), then grows backtracking step by step on <b>one running example: Biteful's "build your combo" menu</b> (papad ₹20, raita ₹30, samosa ₹60, lassi ₹70): every add-on selection, every serving order, every combo that costs exactly ₹70, a budget thali with pruning, and dish names hidden in a promo puzzle. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-bt-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-bt-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="60" y="6" width="520" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Python Functions (recursion) · Trees (DFS) · Graphs (DFS + visited set)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-bt-ga)"/>
<rect x="170" y="62" width="300" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Recursion &amp; Backtracking</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · every option, then prune</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bt-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bt-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bt-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Dynamic Programming</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">next: repeated subproblems</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Tries</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">Word Search II = trie + this</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Bit Manipulation</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">subsets as bitmasks</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bt-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Backtracking: about 50 problems, from Fibonacci Number to Sudoku Solver</text>
</svg><figcaption>Reading order: Graphs → <b>Backtracking</b> → Dynamic Programming → Tries. Backtracking is the DFS from Graphs run over a tree of <em>choices</em> instead of a map of places.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_graphs">Graphs</a></b><span>Graph DFS walked Biteful's city deep-first and chalk-marked each place so it was visited once. It answered "what can I reach?", never "list every route". <a class="xref" data-note="py_functions">Python Functions</a> introduced recursion and <a class="xref" data-note="dsa_trees">Trees</a> used it for traversals; <a class="xref" data-note="dsa_complexity">Complexity</a> showed the call stack.</span></li>
    <li><b>This note adds: recursion done properly, then backtracking</b><span>Base case and call stack, the recursion tree and its cost, then the choose → explore → un-choose template and its families: subsets, permutations, combination sum, pruning, grid search, constraint placement (N-Queens).</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_dp">Dynamic Programming</a></b><span>The recursion tree for Fibonacci solves fib(2) again and again; Combination Sum explores the same "₹30 left" state from several paths. When the question asks only for a count or the best value, remembering those repeated answers turns exponential into polynomial. Later, <a class="xref" data-note="dsa_tries">Tries</a> combine a prefix tree with this note's grid search (Word Search II). Practise in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-bt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next. Running example: Biteful's combo menu <b>papad ₹20, raita ₹30, samosa ₹60, lassi ₹70</b>; add-ons are papad, raita, lassi.</p>
  <ol class="story">
    <li><b>Recursion</b><span>Q: how can a function solve a big problem without a loop? → call itself on a smaller copy: the bill [60, 30, 20] = 60 + bill of [30, 20] = 110. But where do the waiting calls live, and when does it stop?</span></li>
    <li><b>Base case &amp; call stack</b><span>Q: what stops it, and what does it cost in memory? → the base case; waiting calls pile up on the call stack (fact(4) = 4 frames). Some functions call themselves twice: how much work is that?</span></li>
    <li><b>Recursion tree &amp; cost</b><span>Q: how many calls? → draw the tree: fib(20) makes 21,891 calls, about 2<sup>n</sup>. That is waste when answers repeat, but when we <em>want</em> every branch it is exactly the tool…</span></li>
    <li><b>Generate every option</b><span>Q: list every add-on selection? → 3 nested loops give 8; but the number of loops must change with the number of add-ons. Recursion can nest loops to any depth…</span></li>
    <li><b>Decision tree &amp; template</b><span>Q: what is the general recipe? → choose, explore, un-choose, traced: 2 courses from 3 dishes = 9 menus. Now apply it to the classic shapes…</span></li>
    <li><b>Subsets</b><span>Q: every add-on selection? → take or skip each item: 2<sup>3</sup> = 8, from ₹0 to ₹120. But order never mattered there. What if it does?</span></li>
    <li><b>Permutations</b><span>Q: every serving order of 3 dishes? → any unused item in each slot (used[]): 3! = 6. Next: combos that hit a price exactly, where a dish may repeat…</span></li>
    <li><b>Combination sum</b><span>Q: which combos cost exactly ₹70? → start index (no reorders), reuse with j: [papad, papad, raita] and [lassi]. The search tries many paths that are already over budget…</span></li>
    <li><b>Pruning</b><span>Q: how do we stop wasting work? → cut a branch as soon as it cannot succeed: budget thali 1,111 calls → 281 → 84 with sorted prices and break; skip twin items for duplicates. Now a search on a board, where each cell may be used once…</span></li>
    <li><b>Word search</b><span>Q: is "MASALA" hidden in the promo puzzle? → grid DFS: mark the cell, try 4 neighbours, unmark: DOSA, DAL, MASALA yes; DOSAS no (S reused). Last: placing pieces under several rules at once…</span></li>
    <li><b>N-Queens</b><span>Q: place n queens with no attacks? → one per row, three sets for O(1) checks: n = 4 has 2 boards, n = 8 has 92. Then traps, and the bridge to DP: when we only need a count or a best value, stop listing.</span></li>
  </ol>

  <h2 id="dsa-bt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Recursion &amp; Backtracking</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Recursion basics</div>
        <ul>
          <li><b>Recursion</b> — a function calls itself on a smaller input</li>
          <li><b>Base case</b> (answer known) + <b>recursive step</b> (shrink, call, combine)</li>
          <li>💡 Ration-shop queue: ask the person ahead, add 1</li>
          <li><b>Call stack</b>: push on call, pop on return; space = max depth</li>
          <li>⚠ no base case → <code>RecursionError</code> (limit ≈ 1000)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursion tree &amp; cost</div>
        <ul>
          <li>One node per call; time ≈ nodes × work per node</li>
          <li>branches<sup>depth</sup>: fib → 2<sup>n</sup> (fib(20): 21,891 calls)</li>
          <li>subsets → 2<sup>n</sup>, permutations → n!</li>
          <li>Repeated nodes → memoise (DP)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Template</div>
        <ul>
          <li><b>Choose → explore → un-choose</b></li>
          <li>Goal check first: save <code>path[:]</code> (a copy)</li>
          <li>2 courses × 3 dishes = 9 menus, traced</li>
          <li>💡 number lock: set a dial, try the rest, turn it back</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Families</div>
        <ul>
          <li><b>Subsets</b>: take/skip → 8 selections, O(n·2<sup>n</sup>)</li>
          <li><b>Permutations</b>: used[] → 6 orders, O(n·n!)</li>
          <li><b>Combination sum</b>: start index; recurse with j to reuse → ₹70: [20,20,30], [70]</li>
          <li><b>Rules-based</b>: parentheses (open &lt; n, close &lt; open)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pruning</div>
        <ul>
          <li>Stop a branch that can never succeed</li>
          <li>Budget thali: 1,111 → 281 → 84 calls, same 21 answers</li>
          <li>Sort + <code>break</code> when price &gt; remaining</li>
          <li>Duplicates: sort, skip <code>items[j] == items[j-1]</code> when <code>j &gt; start</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Boards</div>
        <ul>
          <li><b>Word search</b>: mark "#", 4 neighbours, restore; O(R·C·3<sup>L</sup>)</li>
          <li>DOSA, DAL, MASALA found; DOSAS not (S reused)</li>
          <li><b>N-Queens</b>: one per row; sets for col, r−c, r+c</li>
          <li>n = 1…8: 1, 0, 0, 2, 10, 4, 40, 92</li>
          <li>⚠ <code>res.append(path)</code> → all answers empty</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-bt-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-rec"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Recursion from Scratch</span><span class="rm-sub">Ask the person ahead</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-stack"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Base Case &amp; Call Stack</span><span class="rm-sub">Where calls wait</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-tree"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Recursion Tree &amp; Cost</span><span class="rm-sub">fib calls counted</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-need"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Every Option, Then Prune</span><span class="rm-sub">Why nested loops fail</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-idea"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Decision Tree &amp; Template</span><span class="rm-sub">Choose, explore, un-choose traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-sub"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Subsets</span><span class="rm-sub">Take or skip</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-perm"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Permutations</span><span class="rm-sub">used[] array</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-comb"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Combination Sum &amp; Parentheses</span><span class="rm-sub">Start index, rules</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-prune"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Pruning</span><span class="rm-sub">Cut dead branches, duplicates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-grid"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Word Search &amp; N-Queens</span><span class="rm-sub">Boards and grids</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-pat"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">Trigger words → template</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Traps &amp; Complexity</span><span class="rm-sub">Bugs everyone makes</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bt-rec"><span class="num">01</span>Recursion from Scratch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Graph DFS called itself for every neighbour, and it worked, but why? How can a function solve a problem by calling <em>itself</em>, and what must be true so it does not run forever?</p>
  </div>
  <p>You stand at the back of a long queue at a ration shop. You want to know your position, but you cannot see the front. So you ask the person ahead: "What is your number?" They don't know either, so they ask the person ahead of them. This goes on until the question reaches the first person. She can see the counter, so she just says "1".</p>
  <figure class="viz"><svg viewBox="0 0 560 175" width="560">
<defs><marker id="dsa-bt-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<rect x="8" y="58" width="36" height="44" class="fs" stroke="currentColor"/><text x="26" y="120" text-anchor="middle" class="tm">shop</text>
<text x="300" y="20" text-anchor="middle">"What is your number?" goes forward</text>
<line x1="490" y1="32" x2="100" y2="32" stroke="currentColor" marker-end="url(#dsa-bt-ar1)"/>
<circle cx="90" cy="80" r="18" class="fg sg"/><text x="90" y="85" text-anchor="middle">P1</text>
<circle cx="190" cy="80" r="18" class="fb sb"/><text x="190" y="85" text-anchor="middle">P2</text>
<circle cx="290" cy="80" r="18" class="fb sb"/><text x="290" y="85" text-anchor="middle">P3</text>
<circle cx="390" cy="80" r="18" class="fb sb"/><text x="390" y="85" text-anchor="middle">P4</text>
<circle cx="490" cy="80" r="18" class="fv"/><text x="490" y="85" text-anchor="middle">you</text>
<line x1="80" y1="128" x2="500" y2="128" stroke="currentColor" marker-end="url(#dsa-bt-ar1)"/>
<text x="90" y="118" text-anchor="middle" class="tg">1</text><text x="190" y="118" text-anchor="middle" class="tg">1+1=2</text>
<text x="290" y="118" text-anchor="middle" class="tg">2+1=3</text><text x="390" y="118" text-anchor="middle" class="tg">3+1=4</text>
<text x="490" y="118" text-anchor="middle" class="tg">4+1=5</text>
<text x="90" y="150" text-anchor="middle" class="tm">base case</text>
<text x="330" y="150" text-anchor="middle" class="tm">answers come back, +1 at each step</text>
</svg><figcaption>The question travels to the front; the answer travels back. Each person does only one small job: add 1.</figcaption></figure>
  <p>Nobody worked out the whole queue alone. Each person did one tiny step and trusted the person ahead. This is called <strong>recursion</strong>: a function that solves a problem by calling itself on a smaller version of the same problem.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Russian dolls (matryoshka). Open a doll and you find a smaller doll. Keep opening until you reach the tiny solid doll that does not open. That solid doll is the <strong>base case</strong>: the smallest problem whose answer you already know.</p>
  </div>
  <p>Every recursive function has two parts:</p>
  <div class="cards">
    <div><b>Base case</b><p>The smallest input. Answer is known. Return it straight away, no more calls.</p><small>Front person: "I am 1" · empty bill: ₹0</small></div>
    <div><b>Recursive step</b><p>Make the input smaller, call yourself, then use that answer.</p><small>Everyone else: "ahead + 1" · first item + rest</small></div>
  </div>
  <p>By hand on a Biteful bill [60, 30, 20]: total([60, 30, 20]) = 60 + total([30, 20]) = 60 + (30 + total([20])) = 60 + (30 + (20 + total([]))) = 60 + 30 + 20 + 0 = 110.</p>
<div class="fx" data-lang="py">def position(i):
    # i = how many people stand ahead of me
    if i == 0:                  # base case: nobody ahead, I am number 1
        return 1
    ahead = position(i - 1)     # ask the person ahead (smaller problem)
    return ahead + 1            # my number = their number + 1

print(position(0), position(4))

def total(prices):              # a Biteful bill, the recursive way
    if not prices:              # base case: an empty bill adds up to 0
        return 0
    return prices[0] + total(prices[1:])   # first item + bill for the rest

print(total([60, 30, 20]), total([]))</div>
  <div class="fx" data-lang="text">1 5
110 0</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>When writing recursion, do not trace every call in your head. Assume the smaller call already returns the right answer (the "trust rule"). Only decide: what is the base case, and how do I use the smaller answer?</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>recursive function</strong> calls itself on a strictly smaller input and stops at a <strong>base case</strong>. It is correct if the base case is correct and each step is correct assuming the smaller call is (induction).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>prices[1:]</code> copies the rest of the list on every call, so this "sum" is O(n²) time. Fine for teaching; in real code pass an index (<code>total(prices, i + 1)</code>) or just use <code>sum</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Backtracking: <b>509 Fibonacci Number</b>, <b>1688 Count of Matches in Tournament</b>, <b>779 K-th Symbol in Grammar</b> (recursion on a smaller row).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Base Case &amp; Call Stack.</b> While the person at the back waits for an answer, where is their half-finished work kept, and what happens if the question never reaches someone who knows the answer?</div>

  <h2 id="dsa-bt-stack"><span class="num">02</span>Base Case &amp; Call Stack</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each call pauses mid-way (<code>ahead + 1</code> cannot finish until <code>ahead</code> is known). Where are all these paused calls kept, how much memory do they take, and what stops the pile from growing forever?</p>
  </div>
  <p>When a function calls another function, the first one waits. Python keeps all waiting calls on a pile called the <strong>call stack</strong> (a stack is a pile where you add and remove only from the top, like plates, see <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a>). A new call is <em>pushed</em> on top. When a call returns, it is <em>popped</em> off, and the call below it continues.</p>
  <p>Take factorial: <code>fact(4) = 4 × 3 × 2 × 1 = 24</code>. Written recursively, <code>fact(n) = n × fact(n − 1)</code> and <code>fact(1) = 1</code>.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<defs><marker id="dsa-bt-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<text x="110" y="18" text-anchor="middle">1. calls pile up (push)</text>
<rect x="40" y="30" width="140" height="30" class="fg sg"/><text x="110" y="50" text-anchor="middle">fact(1)  base</text>
<rect x="40" y="64" width="140" height="30" class="fb sb"/><text x="110" y="84" text-anchor="middle">fact(2) waits</text>
<rect x="40" y="98" width="140" height="30" class="fb sb"/><text x="110" y="118" text-anchor="middle">fact(3) waits</text>
<rect x="40" y="132" width="140" height="30" class="fb sb"/><text x="110" y="152" text-anchor="middle">fact(4) waits</text>
<line x1="20" y1="160" x2="20" y2="34" stroke="currentColor" marker-end="url(#dsa-bt-ar2)"/>
<text x="400" y="18" text-anchor="middle">2. answers flow back (pop)</text>
<rect x="310" y="30" width="180" height="30" class="fg sg"/><text x="400" y="50" text-anchor="middle">fact(1) = 1</text>
<rect x="310" y="64" width="180" height="30" class="ft st"/><text x="400" y="84" text-anchor="middle">fact(2) = 2 × 1 = 2</text>
<rect x="310" y="98" width="180" height="30" class="ft st"/><text x="400" y="118" text-anchor="middle">fact(3) = 3 × 2 = 6</text>
<rect x="310" y="132" width="180" height="30" class="ft st"/><text x="400" y="152" text-anchor="middle">fact(4) = 4 × 6 = 24</text>
<line x1="510" y1="34" x2="510" y2="160" stroke="currentColor" marker-end="url(#dsa-bt-ar2)"/>
<text x="280" y="190" text-anchor="middle" class="tm">max height of the pile = 4 frames → space O(n)</text>
</svg><figcaption>Left: each call waits on top of the previous one. Right: once fact(1) answers, each waiting call finishes and pops off.</figcaption></figure>
  <p>The indented trace below prints the same thing. Deeper indent = higher on the stack.</p>
<div class="fx" data-lang="py">def fact(n, depth=0):
    pad = "    " * depth
    print(f"{pad}fact({n}) called")
    if n == 1:
        print(f"{pad}fact(1) = 1   (base case)")
        return 1
    result = n * fact(n - 1, depth + 1)
    print(f"{pad}fact({n}) = {result}")
    return result

fact(4)</div>
  <div class="fx" data-lang="text">fact(4) called
    fact(3) called
        fact(2) called
            fact(1) called
            fact(1) = 1   (base case)
        fact(2) = 2
    fact(3) = 6
fact(4) = 24</div>
  <h3>What happens without a base case</h3>
  <p>The calls never stop, the pile keeps growing, and Python stops the program. Python allows about 1000 frames by default.</p>
<div class="fx" data-lang="py">import sys
print("limit:", sys.getrecursionlimit())

def countdown(n):
    return countdown(n - 1)     # forgot: if n == 0: return

try:
    countdown(5)
except RecursionError as e:
    print("RecursionError:", e)</div>
  <div class="fx" data-lang="text">limit: 1000
RecursionError: maximum recursion depth exceeded</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>call stack</strong> holds one <strong>frame</strong> (local variables + where to resume) per unfinished call. A recursive function's extra space is O(maximum depth): fact(n) uses O(n) frames even though it returns one number.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two ways to get <code>RecursionError</code>: no base case, or a step that never reaches it (e.g. <code>f(n - 2)</code> on an odd n with base case <code>n == 0</code>). Always check: does every call move closer to the base case?</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Recursion Tree &amp; Cost.</b> fact calls itself once per step, so its calls form a straight line. Many functions call themselves two or more times. How many calls is that in total, and how long will it take?</div>

  <h2 id="dsa-bt-tree"><span class="num">03</span>Recursion Tree &amp; Cost</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When a function makes two calls, and each of those makes two more, the calls branch out. How do we count them, and when is that branching wasted work versus exactly what we want?</p>
  </div>
  <p>Fibonacci numbers go 0, 1, 1, 2, 3, 5, 8…: each one is the sum of the two before it. So <code>fib(n) = fib(n − 1) + fib(n − 2)</code>. Draw one box per call, with lines to the calls it makes. That picture is the <strong>recursion tree</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
<line x1="280" y1="25" x2="160" y2="70" stroke="currentColor"/><line x1="280" y1="25" x2="400" y2="70" stroke="currentColor"/>
<line x1="160" y1="70" x2="100" y2="115" stroke="currentColor"/><line x1="160" y1="70" x2="220" y2="115" stroke="currentColor"/>
<line x1="400" y1="70" x2="360" y2="115" stroke="currentColor"/><line x1="400" y1="70" x2="440" y2="115" stroke="currentColor"/>
<line x1="100" y1="115" x2="60" y2="160" stroke="currentColor"/><line x1="100" y1="115" x2="140" y2="160" stroke="currentColor"/>
<rect x="250" y="13" width="60" height="24" rx="6" class="fb sb"/><text x="280" y="30" text-anchor="middle">fib(4)</text>
<rect x="130" y="58" width="60" height="24" rx="6" class="fb sb"/><text x="160" y="75" text-anchor="middle">fib(3)</text>
<rect x="370" y="58" width="60" height="24" rx="6" class="fr sr"/><text x="400" y="75" text-anchor="middle">fib(2)</text>
<rect x="70" y="103" width="60" height="24" rx="6" class="fr sr"/><text x="100" y="120" text-anchor="middle">fib(2)</text>
<rect x="190" y="103" width="60" height="24" rx="6" class="fg sg"/><text x="220" y="120" text-anchor="middle">fib(1)</text>
<rect x="330" y="103" width="60" height="24" rx="6" class="fg sg"/><text x="360" y="120" text-anchor="middle">fib(1)</text>
<rect x="410" y="103" width="60" height="24" rx="6" class="fg sg"/><text x="440" y="120" text-anchor="middle">fib(0)</text>
<rect x="30" y="148" width="60" height="24" rx="6" class="fg sg"/><text x="60" y="165" text-anchor="middle">fib(1)</text>
<rect x="110" y="148" width="60" height="24" rx="6" class="fg sg"/><text x="140" y="165" text-anchor="middle">fib(0)</text>
<text x="420" y="165" text-anchor="middle" class="tm">9 calls · height 4</text>
</svg><figcaption>Green = base cases. Red = fib(2) is solved twice. For bigger n the repeats explode.</figcaption></figure>
  <p>The tree tells you the cost:</p>
  <ul>
    <li><strong>Time</strong> ≈ number of boxes × work inside one box. Each box branches 2 ways and the tree is about n levels deep, so roughly 2<sup>n</sup> boxes.</li>
    <li><strong>Space</strong> = height of the tree, because only one path from root to leaf sits on the call stack at a time.</li>
  </ul>
<div class="fx" data-lang="py">calls = 0
def fib(n):
    global calls
    calls += 1
    if n &lt;= 1:
        return n
    return fib(n - 1) + fib(n - 2)

for n in [4, 10, 20, 25]:
    calls = 0
    print(f"fib({n}) = {fib(n):6d}   calls = {calls:,}")</div>
  <div class="fx" data-lang="text">fib(4) =      3   calls = 9
fib(10) =     55   calls = 177
fib(20) =   6765   calls = 21,891
fib(25) =  75025   calls = 242,785</div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Calls ≈ (branches per call)<sup>depth</sup>. Two branches, depth n → 2<sup>n</sup>. When the same box appears again and again (like fib(2)), that work is wasted: save its answer and reuse it. That fix is <a class="xref" data-note="dsa_dp">Dynamic Programming</a>. But when every leaf is a <em>different answer we want listed</em>, the branching is the job itself. That is backtracking.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>recursion tree</strong> has one node per call and an edge from each call to the calls it makes. Total time = sum of work over all nodes; extra space = height of the tree.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Counting only the depth ("fib goes n deep, so O(n)"). Depth gives the <em>space</em>; the <em>time</em> is the number of nodes, which for two branches is exponential.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Every Option, Then Prune.</b> A recursion tree with one leaf per possibility is exactly what we need to <em>list</em> possibilities. Biteful wants to show a customer every combo they could build. How do we turn that wish into a tree?</div>

  <h2 id="dsa-bt-need"><span class="num">04</span>Generate Every Option, Then Prune</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's "build your combo" screen offers add-ons: papad ₹20, raita ₹30, lassi ₹70. Product wants a list of every possible add-on selection with its price. How do we generate all of them, for any number of add-ons?</p>
  </div>
  <h3>The running example</h3>
  <table class="tbl"><caption>Biteful's combo menu (used throughout the note)</caption>
    <tr><th>dish</th><th>papad</th><th>raita</th><th>samosa</th><th>lassi</th></tr>
    <tr><td>price (₹)</td><td>20</td><td>30</td><td>60</td><td>70</td></tr>
  </table>
  <p>With exactly three add-ons we can write one loop per add-on: "take it or not" three times, nested.</p>
<div class="fx" data-lang="py">addons = ["papad", "raita", "lassi"]
price = {"papad": 20, "raita": 30, "samosa": 60, "lassi": 70}

# Fixed nesting: works only because we know there are exactly 3 add-ons
picks = []
for take_p in (0, 1):
    for take_r in (0, 1):
        for take_l in (0, 1):
            chosen = [a for a, t in zip(addons, (take_p, take_r, take_l)) if t]
            picks.append(chosen)
for c in picks:
    print(f"{str(c):28} Rs {sum(price[a] for a in c)}")
print(len(picks), "selections = 2^3")</div>
  <div class="fx" data-lang="text">[]                           Rs 0
['lassi']                    Rs 70
['raita']                    Rs 30
['raita', 'lassi']           Rs 100
['papad']                    Rs 20
['papad', 'lassi']           Rs 90
['papad', 'raita']           Rs 50
['papad', 'raita', 'lassi']  Rs 120
8 selections = 2^3</div>
  <p>It works: 2 × 2 × 2 = 8 selections, from ₹0 (nothing) to ₹120 (everything). But the code has three loops <em>because</em> there are three add-ons. With 7 add-ons we would need 7 nested loops, and the number of add-ons is only known when the program runs. We cannot write a variable number of loops by hand.</p>
  <p>Recursion can. One call handles one add-on ("take it or not") and then calls itself for the next add-on. The call stack plays the role of the nested loops, as deep as needed. Then, because the number of options grows like 2<sup>n</sup> or n!, we add the second half of the idea: <strong>prune</strong>, stop a branch as soon as it cannot lead to an answer we want (for example, already over budget).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Trying combinations on a cycle lock: set dial 1, then try every value for the remaining dials; if none opens, turn dial 1 back and set it to the next digit. One full guess at a time, undoing the last step to try the next.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Backtracking</strong> builds a candidate answer one choice at a time; when the candidate is complete (save it) or provably hopeless (prune), it undoes the last choice and tries the next option. It explores a tree of choices depth-first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for backtracking when the question wants only a <em>count</em> or the <em>best</em> option ("how many combos cost ₹70?", "cheapest combo with a drink?"). Listing 2<sup>n</sup> options to count them is exponential; DP often answers in polynomial time.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Decision Tree &amp; Template.</b> "One call per choice, then undo" is the idea. What exactly does the code look like, and what does the tree of calls look like when we trace it?</div>

  <h2 id="dsa-bt-idea"><span class="num">05</span>Decision Tree &amp; the Template</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What is the general shape of a backtracking function, and what happens to the partial answer as calls go down and come back up?</p>
  </div>
  <p>Draw the choices as a tree. The root is "nothing chosen". Each level makes one decision; each edge is one option. A path from the root to a leaf is one complete answer. Backtracking walks this <strong>decision tree</strong> depth-first, exactly like graph DFS, except it never needs a visited set: every node of the tree is a different partial answer.</p>
  <div class="flow"><span>Goal? save a COPY, return</span><span>for each option: Choose (path.append)</span><span>Explore (recurse)</span><span>Un-choose (path.pop)</span></div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"return all", "list every", "generate all", "all possible", "every way", "all valid", "find any arrangement that satisfies…", with small n (≤ 10–20).</p>
  </div>
  <h3>Traced: 2 courses, any of 3 dishes each</h3>
  <p>A tiny product menu: for course 1 pick papad, raita or lassi, and the same for course 2. Watch <code>path</code> grow on "choose", get saved at depth 2, and shrink on "undo".</p>
<div class="fx" data-lang="py">dishes = ["papad", "raita", "lassi"]

def pick(path, courses, out, depth=0):
    pad = "  " * depth
    if len(path) == courses:                 # goal: every course chosen
        out.append(path[:])                  # save a COPY
        print(f"{pad}save {path}")
        return
    for d in dishes:
        path.append(d)                       # 1. choose
        print(f"{pad}choose {d:5} -&gt; {path}")
        pick(path, courses, out, depth + 1)  # 2. explore
        path.pop()                           # 3. un-choose
        print(f"{pad}undo   {d:5} -&gt; {path}")

out = []
pick([], 2, out)                             # 2 courses, any dish in each
print(len(out), "menus:", out[:4], "...")</div>
  <div class="fx" data-lang="text">choose papad -&gt; ['papad']
  choose papad -&gt; ['papad', 'papad']
    save ['papad', 'papad']
  undo   papad -&gt; ['papad']
  choose raita -&gt; ['papad', 'raita']
    save ['papad', 'raita']
  undo   raita -&gt; ['papad']
  choose lassi -&gt; ['papad', 'lassi']
    save ['papad', 'lassi']
  undo   lassi -&gt; ['papad']
undo   papad -&gt; []
choose raita -&gt; ['raita']
  choose papad -&gt; ['raita', 'papad']
    save ['raita', 'papad']
  undo   papad -&gt; ['raita']
  choose raita -&gt; ['raita', 'raita']
    save ['raita', 'raita']
  undo   raita -&gt; ['raita']
  choose lassi -&gt; ['raita', 'lassi']
    save ['raita', 'lassi']
  undo   lassi -&gt; ['raita']
undo   raita -&gt; []
choose lassi -&gt; ['lassi']
  choose papad -&gt; ['lassi', 'papad']
    save ['lassi', 'papad']
  undo   papad -&gt; ['lassi']
  choose raita -&gt; ['lassi', 'raita']
    save ['lassi', 'raita']
  undo   raita -&gt; ['lassi']
  choose lassi -&gt; ['lassi', 'lassi']
    save ['lassi', 'lassi']
  undo   lassi -&gt; ['lassi']
undo   lassi -&gt; []
9 menus: [['papad', 'papad'], ['papad', 'raita'], ['papad', 'lassi'], ['raita', 'papad']] ...</div>
  <p>Read the first block: choose papad → choose papad → save [papad, papad] → undo papad → choose raita → … The undo is what lets the same <code>path</code> list be reused for the next option. Without it, path would become [papad, papad, raita, lassi, …]. 3 options × 3 options = 9 leaves = 9 menus.</p>
  <figure class="viz"><svg viewBox="0 0 560 215" width="560">
<g stroke-width="1.5"><line x1="280" y1="22" x2="140" y2="72" class="sg"/><line x1="280" y1="22" x2="420" y2="72" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="140" y1="72" x2="70" y2="122" class="sg"/><line x1="140" y1="72" x2="210" y2="122" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="420" y1="72" x2="350" y2="122" class="sg"/><line x1="420" y1="72" x2="490" y2="122" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="70" y1="122" x2="35" y2="172" class="sg"/><line x1="70" y1="122" x2="105" y2="172" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="210" y1="122" x2="175" y2="172" class="sg"/><line x1="210" y1="122" x2="245" y2="172" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="350" y1="122" x2="315" y2="172" class="sg"/><line x1="350" y1="122" x2="385" y2="172" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="490" y1="122" x2="455" y2="172" class="sg"/><line x1="490" y1="122" x2="525" y2="172" stroke="currentColor" stroke-dasharray="4 3"/></g>
<rect x="255" y="10" width="50" height="22" rx="5" class="fs" stroke="currentColor"/><text x="280" y="26" text-anchor="middle">[]</text>
<rect x="115" y="60" width="50" height="22" rx="5" class="fb sb"/><text x="140" y="76" text-anchor="middle">[P]</text>
<rect x="395" y="60" width="50" height="22" rx="5" class="fb sb"/><text x="420" y="76" text-anchor="middle">[]</text>
<rect x="40" y="110" width="60" height="22" rx="5" class="fb sb"/><text x="70" y="126" text-anchor="middle">[P,R]</text>
<rect x="185" y="110" width="50" height="22" rx="5" class="fb sb"/><text x="210" y="126" text-anchor="middle">[P]</text>
<rect x="325" y="110" width="50" height="22" rx="5" class="fb sb"/><text x="350" y="126" text-anchor="middle">[R]</text>
<rect x="465" y="110" width="50" height="22" rx="5" class="fb sb"/><text x="490" y="126" text-anchor="middle">[]</text>
<g text-anchor="middle"><rect x="4" y="160" width="62" height="22" rx="5" class="fg sg"/><text x="35" y="176">[P,R,L]</text>
<rect x="77" y="160" width="56" height="22" rx="5" class="fg sg"/><text x="105" y="176">[P,R]</text>
<rect x="147" y="160" width="56" height="22" rx="5" class="fg sg"/><text x="175" y="176">[P,L]</text>
<rect x="220" y="160" width="50" height="22" rx="5" class="fg sg"/><text x="245" y="176">[P]</text>
<rect x="287" y="160" width="56" height="22" rx="5" class="fg sg"/><text x="315" y="176">[R,L]</text>
<rect x="360" y="160" width="50" height="22" rx="5" class="fg sg"/><text x="385" y="176">[R]</text>
<rect x="430" y="160" width="50" height="22" rx="5" class="fg sg"/><text x="455" y="176">[L]</text>
<rect x="500" y="160" width="50" height="22" rx="5" class="fg sg"/><text x="525" y="176">[]</text></g>
<text x="12" y="48" class="tm">papad?</text><text x="12" y="100" class="tm">raita?</text><text x="12" y="150" class="tm">lassi?</text>
<text x="280" y="205" text-anchor="middle" class="tm">solid green = take · dashed = skip · 3 levels → 2³ = 8 leaves</text>
</svg><figcaption>The take-or-skip decision tree for the add-ons P (papad), R (raita), L (lassi), used in the next section. Moving down = choose; coming back up = un-choose. Each root-to-leaf path is one selection.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>backtracking template</strong>: <code>def bt(state): if complete(state): save copy; return · for choice in options(state): if not valid: continue · make(choice) · bt(state) · undo(choice)</code>. Time ≈ (number of tree nodes) × (work per node); extra space = depth of the tree.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>out.append(path)</code> instead of <code>out.append(path[:])</code>. Every saved entry is the same list object, which the undos empty out: you get 9 empty lists (section 12 shows it).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Backtracking: <b>17 Letter Combinations of a Phone Number</b> (exactly this: one letter per digit), <b>77 Combinations</b>, <b>401 Binary Watch</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Subsets.</b> The template allowed papad twice and listed [papad, raita] and [raita, papad] separately. For add-ons, each item is either in or out, once, and order does not matter. How does the template change?</div>

  <h2 id="dsa-bt-sub"><span class="num">06</span>Subsets (Take or Skip)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>List every add-on selection (any of papad, raita, lassi, including none and all), each exactly once. Section 04 did it with fixed loops; now for any number of add-ons.</p>
  </div>
  <p><strong>Idea:</strong> walk the items one by one. For each item, two branches: take it, or skip it. When you pass the last item, save the path. This is exactly the decision tree drawn above. There are 2<sup>n</sup> subsets, so any method must do at least that much work; backtracking writes the "nested loops" for you.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"all subsets", "power set", "every selection", "each item in or out", "sum of all subset …".</p>
  </div>
  <div class="flow"><span>go(i): i == n → save copy</span><span>take items[i], go(i + 1), pop</span><span>skip: go(i + 1)</span></div>
  <table class="tbl out">
    <caption>Dry run on [papad, raita, lassi], first steps</caption>
    <tr><th>Step</th><th>i</th><th>Action</th><th>path</th><th>Saved</th></tr>
    <tr><td>1</td><td>0</td><td>take papad</td><td>[P]</td><td></td></tr>
    <tr><td>2</td><td>1</td><td>take raita</td><td>[P, R]</td><td></td></tr>
    <tr><td>3</td><td>2</td><td>take lassi</td><td>[P, R, L]</td><td></td></tr>
    <tr><td>4</td><td>3</td><td>end reached</td><td>[P, R, L]</td><td>[P, R, L] ₹120</td></tr>
    <tr><td>5</td><td>2</td><td>pop lassi, skip lassi</td><td>[P, R]</td><td></td></tr>
    <tr><td>6</td><td>3</td><td>end reached</td><td>[P, R]</td><td>[P, R] ₹50</td></tr>
    <tr><td>7</td><td>1</td><td>pop raita, skip raita, then take lassi</td><td>[P, L]</td><td>[P, L] ₹90 next</td></tr>
  </table>
<div class="fx" data-lang="py">price = {"papad": 20, "raita": 30, "lassi": 70}

def subsets(items):
    res, path = [], []
    def go(i):
        if i == len(items):
            res.append(path[:])          # passed the last item: save a COPY
            return
        path.append(items[i])            # choose: take items[i]
        go(i + 1)                        # explore
        path.pop()                       # un-choose
        go(i + 1)                        # skip items[i]
    go(0)
    return res

for s in subsets(["papad", "raita", "lassi"]):
    print(f"{str(s):28} Rs {sum(price[x] for x in s)}")
print([] , "-&gt;", subsets([]), "| 10 items -&gt;", len(subsets(list(range(10)))), "selections")</div>
  <div class="fx" data-lang="text">['papad', 'raita', 'lassi']  Rs 120
['papad', 'raita']           Rs 50
['papad', 'lassi']           Rs 90
['papad']                    Rs 20
['raita', 'lassi']           Rs 100
['raita']                    Rs 30
['lassi']                    Rs 70
[]                           Rs 0
[] -&gt; [[]] | 10 items -&gt; 1024 selections</div>
  <p>Same 8 selections and prices as the hard-coded loops, now for any n (10 items → 1,024). The loop-style version saves every node, not just leaves. It gives the same 8 subsets in a different order, and it is the shape reused for combinations below:</p>
<div class="fx" data-lang="py">def subsets_loop(items):
    res, path = [], []
    def go(start):
        res.append(path[:])              # every node is a valid selection
        for j in range(start, len(items)):
            path.append(items[j])
            go(j + 1)                    # only later items: no repeats
            path.pop()
    go(0)
    return res

print(subsets_loop(["papad", "raita", "lassi"]))</div>
  <div class="fx" data-lang="text">[[], ['papad'], ['papad', 'raita'], ['papad', 'raita', 'lassi'], ['papad', 'lassi'], ['raita'], ['raita', 'lassi'], ['lassi']]</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>subsets</strong> (power set) of n distinct items: 2<sup>n</sup> of them. Backtracking with take/skip or a start-index loop: <strong>O(n · 2<sup>n</sup>) time</strong> (2<sup>n</sup> answers, each copied in O(n)), <strong>O(n) extra space</strong> for the path and the stack (output not counted). Bitmasks 0 … 2<sup>n</sup> − 1 list the same subsets (see <a class="xref" data-note="dsa_bits">Bit Manipulation</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Saving only at the leaves in the take/skip version but at every node in the loop version, and mixing the two: you get duplicates or missing sets. Pick one shape and keep its rule.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Backtracking: <b>78 Subsets</b>, <b>1863 Sum of All Subset XOR Totals</b>, <b>784 Letter Case Permutation</b> (each letter: lower or upper).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Permutations.</b> A selection ignores order: {papad, raita} is one subset. The kitchen also asks "in which order should the three small plates be served?", where papad-then-raita and raita-then-papad are different answers.</div>

  <h2 id="dsa-bt-perm"><span class="num">07</span>Permutations (used[])</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>List every serving order of papad, raita and lassi. Every dish appears exactly once, and order matters. The subsets template never puts an earlier item after a later one, so it cannot produce raita-before-papad.</p>
  </div>
  <p><strong>Idea:</strong> fill slots left to right. For each slot, try every dish not used yet. A <code>used</code> list of True/False remembers which dishes are already in the path. 3 choices for slot 1, 2 for slot 2, 1 for slot 3: 3 × 2 × 1 = 6 orders.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"all orderings", "arrangements", "permutations", "every sequence using each once", "rearrange".</p>
  </div>
  <div class="flow"><span>len(path) == n → save copy</span><span>for every j not used</span><span>used[j] = True, append → go() → pop, used[j] = False</span></div>
  <table class="tbl out">
    <caption>Dry run on [papad, raita, lassi]</caption>
    <tr><th>path</th><th>used</th><th>Next action</th></tr>
    <tr><td>[]</td><td>F F F</td><td>slot 1: try papad</td></tr>
    <tr><td>[P]</td><td>T F F</td><td>slot 2: papad used, try raita</td></tr>
    <tr><td>[P, R]</td><td>T T F</td><td>slot 3: only lassi is free</td></tr>
    <tr><td>[P, R, L]</td><td>T T T</td><td>full: save, pop lassi</td></tr>
    <tr><td>[P]</td><td>T F F</td><td>pop raita, try lassi in slot 2</td></tr>
    <tr><td>[P, L, R]</td><td>T T T</td><td>full: save</td></tr>
  </table>
<div class="fx" data-lang="py">def permute(items):
    res, path, used = [], [], [False] * len(items)
    def go():
        if len(path) == len(items):
            res.append(path[:])
            return
        for j in range(len(items)):
            if used[j]:
                continue
            used[j] = True;  path.append(items[j])     # choose
            go()                                       # explore
            path.pop();      used[j] = False           # un-choose
    go()
    return res

for p in permute(["papad", "raita", "lassi"]):        # serving orders
    print(p)
print([0, 1], "-&gt;", permute([0, 1]), "|", [1], "-&gt;", permute([1]))

from itertools import permutations                   # built-in, same count
print(len(permute([1, 2, 3, 4])), len(list(permutations([1, 2, 3, 4]))))</div>
  <div class="fx" data-lang="text">['papad', 'raita', 'lassi']
['papad', 'lassi', 'raita']
['raita', 'papad', 'lassi']
['raita', 'lassi', 'papad']
['lassi', 'papad', 'raita']
['lassi', 'raita', 'papad']
[0, 1] -&gt; [[0, 1], [1, 0]] | [1] -&gt; [[1]]
24 24</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>permutation</strong> of n distinct items is an ordering of all of them; there are n!. Backtracking with a <code>used</code> array: <strong>O(n · n!) time</strong>, O(n) extra space. At n = 10 that is 3.6 million orderings, so interviewers keep n small.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In an interview, write the backtracking yourself even though <code>itertools.permutations</code> and <code>itertools.combinations</code> exist. Mention the built-ins as "what I'd use in real code". And with duplicate items ([raita, raita, papad]) the plain version prints repeated orders: sort and skip a twin whose earlier copy is unused (Permutations II).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Backtracking: <b>46 Permutations</b>, <b>47 Permutations II</b> (duplicates), <b>526 Beautiful Arrangement</b> (prune while placing).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Combination Sum.</b> Now a target: "show every combo that costs exactly ₹70", where a dish may be ordered more than once and [papad, raita, papad] is the same combo as [papad, papad, raita]. Subsets forbid repeats, permutations count reorders. We need a third shape.</div>

  <h2 id="dsa-bt-comb"><span class="num">08</span>Combination Sum &amp; Generate Parentheses</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which combos from papad ₹20, raita ₹30, samosa ₹60, lassi ₹70 cost exactly ₹70, if any dish may repeat and order does not matter?</p>
  </div>
  <h3>Combination Sum (LeetCode 39)</h3>
  <p><strong>Brute force:</strong> try every sequence of dishes up to ₹70. That lists the same combo in many orders and wastes huge time.</p>
  <p><strong>Better idea:</strong> keep a <code>start</code> index. Only pick dishes at or after <code>start</code>, so the path is always in sorted order and each combo appears once. Recurse with <code>j</code> (not <code>j + 1</code>) because the same dish can be used again. Sort the prices first; once a price is bigger than what's left, all later prices are too, so <code>break</code>.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"combinations that sum to target", "choose k", "unlimited use" (recurse with j) or "each at most once" (recurse with j + 1), "order does not matter".</p>
  </div>
  <div class="flow"><span>remain == 0 → save</span><span>for j from start</span><span>price &gt; remain → break</span><span>append, go(j, remain − price), pop</span></div>
  <table class="tbl out">
    <caption>Dry run: prices [20, 30, 60, 70], target ₹70</caption>
    <tr><th>path</th><th>remaining</th><th>What happens</th></tr>
    <tr><td>[20]</td><td>50</td><td>keep going from papad</td></tr>
    <tr><td>[20, 20]</td><td>30</td><td>keep going</td></tr>
    <tr><td>[20, 20, 20]</td><td>10</td><td>next price 20 &gt; 10 → break (pruned)</td></tr>
    <tr><td>[20, 20, 30]</td><td>0</td><td><strong>save</strong> papad + papad + raita</td></tr>
    <tr><td>[20, 30]</td><td>20</td><td>30 &gt; 20 → break</td></tr>
    <tr><td>[30]</td><td>40</td><td>[30, 30] leaves 10 → dead; 60 &gt; 40 → break</td></tr>
    <tr><td>[60]</td><td>10</td><td>60 &gt; 10 → break</td></tr>
    <tr><td>[70]</td><td>0</td><td><strong>save</strong> lassi</td></tr>
  </table>
<div class="fx" data-lang="py">def combination_sum(candidates, target):
    cands = sorted(candidates)
    res, path = [], []
    def go(start, remain):
        if remain == 0:
            res.append(path[:])
            return
        for j in range(start, len(cands)):
            c = cands[j]
            if c &gt; remain:
                break                    # prune: the rest cost even more
            path.append(c)
            go(j, remain - c)            # j, not j + 1: the same dish may repeat
            path.pop()
    go(0, target)
    return res

menu = {20: "papad", 30: "raita", 60: "samosa", 70: "lassi"}
for combo in combination_sum([20, 30, 60, 70], 70):        # spend exactly Rs 70
    print(combo, "=", " + ".join(menu[c] for c in combo))
print(combination_sum([2, 3, 5], 8))
print(combination_sum([2], 1))           # impossible -&gt; []
print(combination_sum([1], 2))</div>
  <div class="fx" data-lang="text">[20, 20, 30] = papad + papad + raita
[70] = lassi
[[2, 2, 2, 2], [2, 3, 3], [3, 5]]
[]
[[1, 1]]</div>
  <p>Forget the start index and loop from the first dish every time, and the same combo comes out in every order:</p>
<div class="fx" data-lang="py">def combo_wrong(cands, target):
    res, path = [], []
    def go(remain):
        if remain == 0:
            res.append(path[:]); return
        for c in cands:                  # BUG: always from the first dish
            if c &lt;= remain:
                path.append(c); go(remain - c); path.pop()
    go(target)
    return res

print(combo_wrong([20, 30, 60, 70], 70))</div>
  <div class="fx" data-lang="text">[[20, 20, 30], [20, 30, 20], [30, 20, 20], [70]]</div>
  <p><strong>Complexity:</strong> exponential in the worst case: about O(k<sup>T/m</sup>) where k = number of dishes, T = target, m = cheapest price (the deepest path uses T/m dishes: 70/20 → 3 levels here). Space O(T/m) for the path.</p>
  <div class="callout intu"><span class="label">Related</span>
    <p>If the question asks only <em>how many</em> combos, or the <em>fewest dishes</em>, do not list them. Use DP (Coin Change in the <a class="xref" data-note="dsa_dp">DP note</a>): it is polynomial instead of exponential.</p>
  </div>
  <h3>Generate Parentheses (LeetCode 22): building under rules</h3>
  <p>Some problems allow a choice only while a rule still holds. Given n pairs of brackets, list every well-formed string. For n = 3: <code>((()))</code>, <code>(()())</code>, <code>(())()</code>, <code>()(())</code>, <code>()()()</code>. Brute force builds all 2<sup>2n</sup> strings and keeps the valid ones. Better: never build an invalid prefix.</p>
  <ul>
    <li>Add <code>(</code> only if fewer than n opens are used.</li>
    <li>Add <code>)</code> only if it closes something: closes &lt; opens.</li>
  </ul>
<div class="fx" data-lang="py">def generate_parenthesis(n):
    res = []
    def go(s, opened, closed):
        if len(s) == 2 * n:
            res.append(s)
            return
        if opened &lt; n:
            go(s + "(", opened + 1, closed)
        if closed &lt; opened:
            go(s + ")", opened, closed + 1)
    go("", 0, 0)
    return res

for n in [1, 2, 3]:
    print(n, generate_parenthesis(n))
print("counts n=1..8:", [len(generate_parenthesis(n)) for n in range(1, 9)])

from itertools import product                  # brute force, for comparison
def valid(s):
    bal = 0
    for ch in s:
        bal += 1 if ch == "(" else -1
        if bal &lt; 0: return False
    return bal == 0
all8 = ["".join(p) for p in product("()", repeat=16)]
print("n=8 brute force:", len(all8), "strings checked,", sum(map(valid, all8)), "valid")</div>
  <div class="fx" data-lang="text">1 ['()']
2 ['(())', '()()']
3 ['((()))', '(()())', '(())()', '()(())', '()()()']
counts n=1..8: [1, 2, 5, 14, 42, 132, 429, 1430]
n=8 brute force: 65536 strings checked, 1430 valid</div>
  <p>Because Python strings are immutable, <code>s + "("</code> creates a new string for the call. The caller's <code>s</code> is untouched, so there is nothing to undo. The counts 1, 2, 5, 14, 42… are the <strong>Catalan numbers</strong>; time about O(4<sup>n</sup>/√n), space O(n).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>combination</strong> is a selection where order does not matter. The <strong>start-index</strong> rule (only pick from position ≥ start) generates each combination once, in sorted order. Recurse with <code>j</code> for unlimited reuse, <code>j + 1</code> for at most once.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing up <code>go(j, …)</code> and <code>go(j + 1, …)</code>. With <code>j + 1</code> the ₹70 search loses [papad, papad, raita] (papad can no longer repeat); with <code>0</code> it gains reorders. Say out loud: "may this item repeat?"</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Backtracking: <b>39 Combination Sum</b>, <b>40 Combination Sum II</b> (each once, duplicates in input), <b>216 Combination Sum III</b>, <b>22 Generate Parentheses</b>, <b>131 Palindrome Partitioning</b> (choose where to cut).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Pruning.</b> The <code>break</code> already skipped [20, 20, 20, 20…]. How much work does cutting dead branches really save, and what other cuts are there?</div>

  <h2 id="dsa-bt-prune"><span class="num">09</span>Pruning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Backtracking lists every option, and the options grow exponentially. Most branches are hopeless long before they finish (the combo is already over budget). How do we stop early without losing any real answer?</p>
  </div>
  <p>Biteful's budget thali: three courses (starter, main, dessert), each with 10 dishes priced ₹0, 10, 20, …, 90. Show every thali costing exactly ₹50. Without pruning, the search builds all 10 × 10 × 10 = 1,000 full thalis. With pruning, a branch stops the moment its total passes ₹50: if starter + main is already ₹70, no dessert can fix it.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"within budget", "sum must not exceed", "valid so far", "partition into k equal groups", "minimum / maximum under constraints", any search where partial answers can already be judged.</p>
  </div>
  <div class="flow"><span>before recursing: can this branch still succeed?</span><span>no → return (cut)</span><span>sorted options + break: cut all later options at once</span></div>
<div class="fx" data-lang="py">prices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]    # 10 dishes per course (Rs)

def thali(path, prune, stats, budget=50):
    stats["calls"] += 1
    s = sum(path)
    if prune and s &gt; budget:            # already over budget: dead branch
        stats["cut"] += 1
        return
    if len(path) == 3:                  # starter, main, dessert chosen
        if s == budget:
            stats["found"] += 1
        return
    for p in prices:
        path.append(p); thali(path, prune, stats); path.pop()

for prune in [False, True]:
    stats = {"calls": 0, "found": 0, "cut": 0}
    thali([], prune, stats)
    print(f"prune={prune!s:5}  calls={stats['calls']:4}  branches cut={stats['cut']:3}  thalis found={stats['found']}")</div>
  <div class="fx" data-lang="text">prune=False  calls=1111  branches cut=  0  thalis found=21
prune=True   calls= 281  branches cut=197  thalis found=21</div>
  <p>Same 21 thalis; 1,111 calls drop to 281 because 197 branches are cut on entry. Moving the check <em>before</em> choosing (is <code>s + p</code> over budget?) and sorting the prices lets us <code>break</code> out of the whole loop instead of entering each bad call:</p>
<div class="fx" data-lang="py">prices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]    # sorted ascending

def thali_sorted(path, s, stats, budget=50):
    stats["calls"] += 1
    if len(path) == 3:
        stats["found"] += (s == budget)
        return
    for p in prices:
        if s + p &gt; budget:
            break                       # sorted: every later price is bigger too
        path.append(p); thali_sorted(path, s + p, stats); path.pop()

stats = {"calls": 0, "found": 0}
thali_sorted([], 0, stats)
print(f"check before choosing + break: calls={stats['calls']}  thalis found={stats['found']}")</div>
  <div class="fx" data-lang="text">check before choosing + break: calls=84  thalis found=21</div>
  <table class="tbl">
    <tr><th>Version</th><th>Calls</th><th>Answers</th></tr>
    <tr><td>no pruning</td><td>1,111</td><td>21</td></tr>
    <tr><td>prune on entry (sum &gt; budget → return)</td><td>281</td><td>21</td></tr>
    <tr><td>check before choosing + sorted + break</td><td>84</td><td>21</td></tr>
  </table>
  <h3>Pruning duplicates</h3>
  <p>A second kind of waste: identical answers. If the add-on list holds raita twice, plain subsets produce [papad, raita] twice. Sort the items, and in the loop skip an item equal to the previous one <em>at the same level</em> (<code>j &gt; start</code>):</p>
<div class="fx" data-lang="py">def subsets_with_dup(items):
    items = sorted(items)
    res, path = [], []
    def go(start):
        res.append(path[:])
        for j in range(start, len(items)):
            if j &gt; start and items[j] == items[j - 1]:
                continue                 # same item at the same level: skip the twin
            path.append(items[j]); go(j + 1); path.pop()
    go(0)
    return res

print(subsets_with_dup(["papad", "raita", "raita"]))</div>
  <div class="fx" data-lang="text">[[], ['papad'], ['papad', 'raita'], ['papad', 'raita', 'raita'], ['raita'], ['raita', 'raita']]</div>
  <p>6 distinct selections instead of 8 with repeats: [], [papad], [papad, raita], [papad, raita, raita], [raita], [raita, raita].</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pruning</strong> cuts a branch of the decision tree when no completion of it can be a valid (or better) answer. It never changes the set of answers, only the work. Common cuts: sum/size over limit, a constraint already broken, sorted options with <code>break</code>, skipping duplicate choices at the same level, and "cannot beat the best found so far" (branch and bound).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pruning on a condition that a later choice could still repair. "Over budget" is safe only because prices are non-negative; with discounts (negative prices) a branch over ₹50 could come back down, and the cut would lose answers.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Backtracking: <b>90 Subsets II</b> (duplicate skip), <b>698 Partition to K Equal Sum Subsets</b> (buckets + pruning), <b>473 Matchsticks to Square</b>, <b>2305 Fair Distribution of Cookies</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Word Search &amp; N-Queens.</b> So far the choices were items from a list. On a board, a choice is "which neighbouring cell next" or "which column in this row", the rules depend on what is already placed, and the undo must restore the board.</div>

  <h2 id="dsa-bt-grid"><span class="num">10</span>Word Search &amp; N-Queens</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's promo puzzle hides dish names in a letter grid: can "MASALA" be traced by moving up, down, left or right, using each cell at most once? This is graph DFS on a grid, but a cell used by <em>this</em> path must be free again for the next path.</p>
  </div>
  <h3>Word Search (LeetCode 79)</h3>
  <table class="tbl out"><caption>The promo puzzle</caption>
    <tr><th></th><th>c0</th><th>c1</th><th>c2</th><th>c3</th></tr>
    <tr><th>r0</th><td>D</td><td>A</td><td>L</td><td>V</td></tr>
    <tr><th>r1</th><td>O</td><td>S</td><td>A</td><td>I</td></tr>
    <tr><th>r2</th><td>M</td><td>A</td><td>H</td><td>D</td></tr>
  </table>
  <p><strong>Idea:</strong> start a DFS from every cell. At each step the cell must match the next letter. Mark the cell "#" so this path cannot reuse it, try the 4 neighbours, then put the letter back (un-choose).</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"path in a grid", "adjacent cells", "each cell used at most once", "trace the word", "collect the most gold", "visit every empty cell exactly once".</p>
  </div>
  <div class="flow"><span>k == len(word) → True</span><span>out of grid or letter ≠ word[k] → False</span><span>mark "#", try 4 neighbours with k + 1</span><span>restore letter</span></div>
  <table class="tbl out"><caption>Tracing MASALA</caption>
    <tr><th>k</th><th>letter</th><th>cell</th><th>why</th></tr>
    <tr><td>0</td><td>M</td><td>(2,0)</td><td>the only M</td></tr>
    <tr><td>1</td><td>A</td><td>(2,1)</td><td>right of M</td></tr>
    <tr><td>2</td><td>S</td><td>(1,1)</td><td>above</td></tr>
    <tr><td>3</td><td>A</td><td>(0,1)</td><td>above (A at (1,2) also matches; tried later only if needed)</td></tr>
    <tr><td>4</td><td>L</td><td>(0,2)</td><td>right</td></tr>
    <tr><td>5</td><td>A</td><td>(1,2)</td><td>below; (0,1) is marked "#" so it cannot be reused</td></tr>
    <tr><td>6</td><td>–</td><td>–</td><td>k == 6 → found</td></tr>
  </table>
<div class="fx" data-lang="py">def exist(board, word):
    R, C = len(board), len(board[0])
    def dfs(r, c, k):                   # k = index of the letter we need
        if k == len(word):
            return True                 # matched every letter
        if r &lt; 0 or c &lt; 0 or r &gt;= R or c &gt;= C or board[r][c] != word[k]:
            return False
        saved, board[r][c] = board[r][c], "#"           # choose: mark used
        found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or
                 dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))  # explore
        board[r][c] = saved                             # un-choose
        return found
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))

puzzle = [list("DALV"),                 # Biteful's promo puzzle: find dish names
          list("OSAI"),
          list("MAHD")]
for w in ["DOSA", "DAL", "MASALA", "DOSAS", "VADA"]:
    print(f"{w:7} {exist(puzzle, w)}")
print("board unchanged:", ["".join(row) for row in puzzle])
board = [list("ABCE"), list("SFCS"), list("ADEE")]   # LeetCode 79's example
print([exist(board, w) for w in ["ABCCED", "SEE", "ABCB"]])</div>
  <div class="fx" data-lang="text">DOSA    True
DAL     True
MASALA  True
DOSAS   False
VADA    False
board unchanged: ['DALV', 'OSAI', 'MAHD']
[True, True, False]</div>
  <p>DOSAS fails because the only S is already on the path after DOSA; VADA fails because V's neighbours are L and I. The board is restored after every search. <strong>Complexity:</strong> R·C starting cells; from each, the first step has 4 directions and later steps at most 3 (you can't go back) → O(R·C·4·3<sup>L−1</sup>) for word length L. Space O(L) for the stack.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Check <code>k == len(word)</code> <em>before</em> the bounds check, or a word that ends at the grid edge is reported as not found. And always restore the cell, or the next start position sees a damaged grid. Graph DFS kept its marks forever (visit each place once); backtracking removes them (each <em>path</em> uses a cell once).</p>
  </div>
  <h3>N-Queens (LeetCode 51)</h3>
  <p><strong>Problem:</strong> place n chess queens on an n × n board so no two attack each other. A queen attacks along its row, its column and both diagonals. Return every board. Brute force tries every way to put n queens on n² cells: for n = 8 that's 4.4 billion.</p>
  <p><strong>Better idea:</strong> two queens can never share a row, so place exactly one queen per row, top to bottom. For each row, try each column, skip attacked cells (prune), recurse to the next row, then remove the queen.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"place so that no two…", "constraints on rows, columns, boxes", "sudoku", "valid arrangement", "count the boards".</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 520 215" width="520">
<g stroke="currentColor" fill="none"><rect x="30" y="30" width="160" height="160"/><rect x="330" y="30" width="160" height="160"/>
<path d="M70,30 V190 M110,30 V190 M150,30 V190 M30,70 H190 M30,110 H190 M30,150 H190"/>
<path d="M370,30 V190 M410,30 V190 M450,30 V190 M330,70 H490 M330,110 H490 M330,150 H490"/></g>
<g class="fr"><rect x="31" y="31" width="38" height="38"/><rect x="111" y="31" width="38" height="38"/><rect x="151" y="31" width="38" height="38"/>
<rect x="71" y="71" width="38" height="38"/><rect x="71" y="111" width="38" height="38"/><rect x="71" y="151" width="38" height="38"/>
<rect x="31" y="71" width="38" height="38"/><rect x="111" y="71" width="38" height="38"/><rect x="151" y="111" width="38" height="38"/></g>
<rect x="71" y="31" width="38" height="38" class="fg"/><text x="90" y="56" text-anchor="middle" font-size="18">Q</text>
<g class="fg"><rect x="371" y="31" width="38" height="38"/><rect x="451" y="71" width="38" height="38"/><rect x="331" y="111" width="38" height="38"/><rect x="411" y="151" width="38" height="38"/></g>
<g text-anchor="middle" font-size="18"><text x="390" y="56">Q</text><text x="470" y="96">Q</text><text x="350" y="136">Q</text><text x="430" y="176">Q</text></g>
<text x="110" y="18" text-anchor="middle" class="tm">queen at (0,1) blocks the red cells</text>
<text x="410" y="18" text-anchor="middle" class="tm">one full answer for n = 4</text>
<text x="110" y="208" text-anchor="middle" class="tm">column 1 · diag r−c = −1 · diag r+c = 1</text>
</svg><figcaption>Cells on one "\\" diagonal share the same row − col; cells on one "/" diagonal share the same row + col. Three sets make the attack check O(1).</figcaption></figure>
  <p>Traced for n = 4 until the first full board. Watch the queen in row 0 move from column 0 to column 1 after everything below it failed:</p>
<div class="fx" data-lang="py">def queens_trace(n):
    cols, d1, d2, placed = set(), set(), set(), []
    def go(r):
        if r == n:
            print("SOLUTION", placed)
            return True
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2:
                continue                                   # attacked: prune
            cols.add(c); d1.add(r - c); d2.add(r + c); placed.append((r, c))
            print(f"place row {r} col {c}   queens={placed}")
            if go(r + 1):
                return True
            cols.remove(c); d1.remove(r - c); d2.remove(r + c); placed.pop()
            print(f"remove row {r} col {c}  (no way to finish rows {r + 1}..{n - 1})")
        return False
    go(0)

queens_trace(4)          # stop at the first full board</div>
  <div class="fx" data-lang="text">place row 0 col 0   queens=[(0, 0)]
place row 1 col 2   queens=[(0, 0), (1, 2)]
remove row 1 col 2  (no way to finish rows 2..3)
place row 1 col 3   queens=[(0, 0), (1, 3)]
place row 2 col 1   queens=[(0, 0), (1, 3), (2, 1)]
remove row 2 col 1  (no way to finish rows 3..3)
remove row 1 col 3  (no way to finish rows 2..3)
remove row 0 col 0  (no way to finish rows 1..3)
place row 0 col 1   queens=[(0, 1)]
place row 1 col 3   queens=[(0, 1), (1, 3)]
place row 2 col 0   queens=[(0, 1), (1, 3), (2, 0)]
place row 3 col 2   queens=[(0, 1), (1, 3), (2, 0), (3, 2)]
SOLUTION [(0, 1), (1, 3), (2, 0), (3, 2)]</div>
<div class="fx" data-lang="py">def solve_n_queens(n):
    res = []
    cols, diag1, diag2 = set(), set(), set()     # used columns, r-c, r+c
    board = [["."] * n for _ in range(n)]
    def go(r):
        if r == n:
            res.append(["".join(row) for row in board])
            return
        for c in range(n):
            if c in cols or (r - c) in diag1 or (r + c) in diag2:
                continue                         # attacked: prune
            cols.add(c); diag1.add(r - c); diag2.add(r + c); board[r][c] = "Q"
            go(r + 1)
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c); board[r][c] = "."
    go(0)
    return res

for sol in solve_n_queens(4):
    print("\\n".join(sol), end="\\n\\n")
print("solutions for n=1..8:", [len(solve_n_queens(n)) for n in range(1, 9)])</div>
  <div class="fx" data-lang="text">.Q..
...Q
Q...
..Q.

..Q.
Q...
...Q
.Q..

solutions for n=1..8: [1, 0, 0, 2, 10, 4, 40, 92]</div>
  <p><strong>Complexity:</strong> at most n choices in row 0, n − 1 in row 1… → O(n!) boards tried, far fewer with pruning. Space O(n) for the sets and the stack (plus the output). n = 2 and n = 3 have no answer.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Constraint placement</strong> backtracking places one piece per step (one queen per row, one digit per sudoku cell), keeps the constraints in sets for O(1) "is it legal?" checks, and undoes the placement on return. <strong>Grid path search</strong> marks the current cell, explores neighbours, and unmarks.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Checking attacks by scanning the whole board for every candidate (O(n²) per check) instead of the three sets. Correct but slow enough to time out for n = 9 or a sudoku.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Backtracking: <b>79 Word Search</b>, <b>1219 Path with Maximum Gold</b>, <b>980 Unique Paths III</b>; <b>51 N-Queens</b>, <b>52 N-Queens II</b>, <b>37 Sudoku Solver</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing the Pattern.</b> We now have five shapes: take/skip, used[], start index, rules-based building, grid/board placement. Facing a new problem, which one fits?</div>

  <h2 id="dsa-bt-pat"><span class="num">11</span>Choosing the Pattern</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given a fresh problem statement, how do we tell whether it needs backtracking at all, and if so, which loop shape?</p>
  </div>
  <p>Backtracking fits when a question asks for <em>all</em> answers, or when you must build an answer piece by piece under rules and n is small. If it asks only for the <em>count</em> or the <em>best</em> one, check DP first: backtracking may be too slow.</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Signal words</th><th>Key move</th><th>Section</th></tr>
    <tr><td><strong>Take or skip</strong></td><td>"all subsets", "power set", "every selection"</td><td>For item i: recurse with it, then without it</td><td>06</td></tr>
    <tr><td><strong>Pick any unused</strong></td><td>"all orderings", "arrangements", "permutations"</td><td><code>used[]</code> array; loop over all items</td><td>07</td></tr>
    <tr><td><strong>Start index</strong></td><td>"combinations", "sum to target", "choose k"</td><td>Loop <code>j</code> from <code>start</code> so order doesn't repeat</td><td>08</td></tr>
    <tr><td><strong>Cut the string</strong></td><td>"partition the string", "restore IP", "split into …"</td><td>Choose the end of the next piece; recurse on the rest</td><td>08</td></tr>
    <tr><td><strong>Rules-based building</strong></td><td>"valid", "well-formed", "place so that no two…"</td><td>Only add a piece if the rule still holds</td><td>08, 10</td></tr>
    <tr><td><strong>Buckets + pruning</strong></td><td>"split into k equal groups", "assign jobs to workers"</td><td>Put each item in some bucket; prune overfull and symmetric buckets</td><td>09</td></tr>
    <tr><td><strong>Grid DFS + mark</strong></td><td>"path in a grid", "adjacent cells", "each cell used once"</td><td>Mark cell, try 4 neighbours, unmark</td><td>10</td></tr>
  </table>
  <div class="cards">
    <div><b>Subset-style loop</b><p>Every node is an answer. Loop <code>j</code> from <code>start</code>, recurse with <code>j + 1</code>.</p><small>Subsets, combinations</small></div>
    <div><b>Permutation-style loop</b><p>Answer only at full length. Loop over all <code>j</code>, skip used ones.</p><small>Permutations, arrangements</small></div>
    <div><b>Reuse allowed</b><p>Same as subset-style but recurse with <code>j</code>, not <code>j + 1</code>.</p><small>Combination Sum, coin combos</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using backtracking for "how many ways" with n = 1000. If the state is small (index, remaining amount) and repeats across branches, that is DP; backtracking would time out.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Backtracking: <b>93 Restore IP Addresses</b> (cut the string), <b>1723 Find Minimum Time to Finish All Jobs</b> (buckets), <b>1239 Maximum Length of a Concatenated String with Unique Characters</b> (take/skip with a validity check).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Traps &amp; Complexity.</b> Backtracking code is short, which makes its bugs easy to write and hard to see. Which mistakes recur, and what does each pattern cost?</div>

  <h2 id="dsa-bt-traps"><span class="num">12</span>Traps &amp; Complexity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Why do correct-looking backtracking functions return empty or doubled answers, and how fast does each pattern grow?</p>
  </div>
  <h3>The most common bug: saving the path, not a copy</h3>
<div class="fx" data-lang="py">res, path = [], []
def go(i, nums):
    if i == len(nums):
        res.append(path)            # BUG: same list object every time
        return
    path.append(nums[i]); go(i + 1, nums); path.pop()
    go(i + 1, nums)

go(0, ["papad", "raita"])
print(res)                          # all four point to one list, now empty</div>
  <div class="fx" data-lang="text">[[], [], [], []]</div>
  <p><code>res</code> holds four references to one list. After all the pops, that list is empty. Fix: <code>res.append(path[:])</code> or <code>list(path)</code>.</p>
  <div class="callout trap"><span class="label">Trap: forgetting to un-choose</span>
    <p>Every change made before the recursive call (append, add to a set, mark a cell, set <code>used[j]</code>) must be reversed after it. Write the undo line right when you write the choose line.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deep recursion</span>
    <p>Python stops at about 1000 frames. Backtracking depth is usually small (n ≤ 20), but recursion on a 10,000-long list will crash. Use <code>sys.setrecursionlimit</code> only as a quick fix; a loop with your own stack is safer.</p>
  </div>
  <table class="tbl">
    <tr><th>Problem</th><th>Time</th><th>Extra space</th><th>Why</th></tr>
    <tr><td>Subsets</td><td>O(n·2<sup>n</sup>)</td><td>O(n)</td><td>2 choices per item; copy each answer</td></tr>
    <tr><td>Permutations</td><td>O(n·n!)</td><td>O(n)</td><td>n, then n−1, … choices per slot</td></tr>
    <tr><td>Combination Sum</td><td>O(k<sup>T/m</sup>)</td><td>O(T/m)</td><td>k items, depth up to T/m</td></tr>
    <tr><td>Generate Parentheses</td><td>O(4<sup>n</sup>/√n)</td><td>O(n)</td><td>Catalan number of answers</td></tr>
    <tr><td>N-Queens</td><td>O(n!)</td><td>O(n)</td><td>one queen per row, fewer columns each row</td></tr>
    <tr><td>Word Search</td><td>O(R·C·3<sup>L</sup>)</td><td>O(L)</td><td>every start cell, 3 ways per letter</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Backtracking cost = (number of nodes in the decision tree) × (work per node, often the O(n) copy at the leaves). Pruning shrinks the node count; it rarely changes the worst-case class.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Recursion, the call stack, the recursion tree, the template and five families: how is each built on the last, and what did each produce for Biteful's menu?</div>

  <h2 id="dsa-bt-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Seen together, which concepts are the machinery and which are variations of one template? And where exactly does backtracking hand over to dynamic programming?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 310" width="660">
<defs><marker id="dsa-bt-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">recursion</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">bill = 60 + bill(rest) = 110</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">call stack</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">space = depth (fact(4): 4)</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">recursion tree</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">time = nodes (fib(20): 21,891)</text>
<line x1="510" y1="54" x2="420" y2="90" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="600" y1="54" x2="600" y2="250" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-bt-a9)"/>
<rect x="200" y="92" width="260" height="44" rx="7" class="ft st"/><text x="330" y="111" text-anchor="middle" font-size="11.5" font-weight="700">template: choose → explore → un-choose</text><text x="330" y="127" text-anchor="middle" class="tm" font-size="10">2 courses × 3 dishes = 9 menus</text>
<line x1="250" y1="136" x2="80" y2="170" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="300" y1="136" x2="230" y2="170" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="360" y1="136" x2="390" y2="170" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="420" y1="136" x2="530" y2="170" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<rect x="10" y="172" width="140" height="50" rx="7" class="fg sg"/><text x="80" y="192" text-anchor="middle" font-size="11" font-weight="700">subsets</text><text x="80" y="209" text-anchor="middle" class="tm" font-size="10">8 selections</text>
<rect x="160" y="172" width="140" height="50" rx="7" class="fg sg"/><text x="230" y="192" text-anchor="middle" font-size="11" font-weight="700">permutations</text><text x="230" y="209" text-anchor="middle" class="tm" font-size="10">6 serving orders</text>
<rect x="310" y="172" width="150" height="50" rx="7" class="fg sg"/><text x="385" y="192" text-anchor="middle" font-size="11" font-weight="700">combination sum</text><text x="385" y="209" text-anchor="middle" class="tm" font-size="10">₹70: [20,20,30], [70]</text>
<rect x="470" y="172" width="120" height="50" rx="7" class="fg sg"/><text x="530" y="192" text-anchor="middle" font-size="11" font-weight="700">boards</text><text x="530" y="209" text-anchor="middle" class="tm" font-size="10">MASALA · 4-queens</text>
<line x1="300" y1="222" x2="300" y2="250" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<rect x="160" y="252" width="280" height="46" rx="7" class="fv"/><text x="300" y="271" text-anchor="middle" font-size="11.5" font-weight="700">pruning (all families)</text><text x="300" y="288" text-anchor="middle" class="tm" font-size="10">thali: 1,111 → 281 → 84 calls, still 21</text>
<rect x="470" y="252" width="180" height="46" rx="7" class="fr sr"/><text x="560" y="271" text-anchor="middle" font-size="11.5" font-weight="700">repeated nodes?</text><text x="560" y="288" text-anchor="middle" class="tm" font-size="10">count/best only → DP</text>
</svg><figcaption>Recursion and its stack are the machinery; the recursion tree measures cost. Backtracking is one template; the families differ only in the loop (take/skip, unused, from start, neighbours). Pruning applies to all. When nodes repeat and only a number is wanted, the dashed path leads to DP.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's menu</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Recursion</td><td>base case + smaller call</td><td>solve by shrinking?</td><td>bill [60, 30, 20] = 110</td><td>self-similar problems</td></tr>
    <tr><td>Call stack</td><td>one frame per waiting call</td><td>memory? when does it stop?</td><td>fact(4): 4 frames; no base case → RecursionError</td><td>reasoning about space</td></tr>
    <tr><td>Recursion tree</td><td>calls as nodes</td><td>how many calls?</td><td>fib(20): 21,891</td><td>estimating time</td></tr>
    <tr><td>Template</td><td>recursion + path + undo</td><td>how to list options?</td><td>9 two-course menus</td><td>"all …" questions</td></tr>
    <tr><td>Subsets</td><td>template, take/skip</td><td>every selection?</td><td>8 add-on sets, ₹0–₹120</td><td>in/out choices</td></tr>
    <tr><td>Permutations</td><td>template + used[]</td><td>every order?</td><td>6 serving orders</td><td>order matters</td></tr>
    <tr><td>Combination sum</td><td>template + start index</td><td>combos hitting a target?</td><td>₹70: papad+papad+raita, lassi</td><td>sum targets, choose k</td></tr>
    <tr><td>Pruning</td><td>a test before recursing</td><td>how to skip dead work?</td><td>thali calls 1,111 → 84</td><td>always, when partials can be judged</td></tr>
    <tr><td>Word search</td><td>grid DFS + mark/unmark</td><td>a path of cells?</td><td>DOSA, DAL, MASALA yes; DOSAS no</td><td>grid paths, each cell once</td></tr>
    <tr><td>N-Queens</td><td>one per row + constraint sets</td><td>legal placement?</td><td>n = 4: 2 boards; n = 8: 92</td><td>placement puzzles, sudoku</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>backtracking is DFS over a tree of choices: choose, recurse, un-choose, save a copy at the goal, and prune any branch that cannot succeed; the families differ only in which options the loop offers.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_dp">Dynamic Programming</a>: "how many combos cost exactly ₹70?" or "fewest dishes for ₹70?" do not need the list. The search reaches the same state ("₹30 left, from raita on") along several paths and re-solves it each time, just like fib(2). Remember each state's answer once, and exponential becomes polynomial.</div>

  <h2 id="dsa-bt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: Biteful combo menu <b>papad ₹20, raita ₹30, samosa ₹60, lassi ₹70</b>; add-ons papad, raita, lassi; budget thali: 3 courses × prices ₹0–90, total ₹50; promo puzzle DALV / OSAI / MAHD.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On the menu</th><th>Weakness → next</th></tr>
    <tr><td>Recursion</td><td>solve via a smaller self?</td><td>bill = 110</td><td>where do calls wait?</td></tr>
    <tr><td>Call stack</td><td>memory, stopping</td><td>fact(4) = 4 frames</td><td>multiple calls: how many?</td></tr>
    <tr><td>Recursion tree</td><td>total calls?</td><td>fib(20) = 21,891</td><td>wasted if repeated; ideal for listing</td></tr>
    <tr><td>Every option</td><td>list all add-on sets?</td><td>8 with 3 nested loops</td><td>loops fixed at 3</td></tr>
    <tr><td>Template</td><td>general recipe?</td><td>9 menus, traced</td><td>repeats and reorders</td></tr>
    <tr><td>Subsets</td><td>in or out?</td><td>8 selections</td><td>order ignored</td></tr>
    <tr><td>Permutations</td><td>every order?</td><td>6 orders</td><td>need target sums</td></tr>
    <tr><td>Combination sum</td><td>exactly ₹70?</td><td>[20,20,30], [70]</td><td>dead branches waste time</td></tr>
    <tr><td>Pruning</td><td>skip hopeless work?</td><td>1,111 → 281 → 84 calls</td><td>boards need mark/unmark</td></tr>
    <tr><td>Word search</td><td>trace a word?</td><td>MASALA yes, DOSAS no</td><td>several constraints at once</td></tr>
    <tr><td>N-Queens</td><td>legal placement?</td><td>2 boards for n = 4</td><td>count/best only → DP</td></tr>
  </table>
  <h3>Templates and costs</h3>
  <table class="tbl">
    <tr><th>Shape</th><th>Loop / recursion</th><th>Save when</th><th>Time</th></tr>
    <tr><td>Template</td><td>for option: choose; bt(); undo</td><td>goal reached (copy!)</td><td>nodes × work</td></tr>
    <tr><td>Subsets</td><td>take: go(i+1); pop; skip: go(i+1)</td><td>i == n</td><td>O(n·2<sup>n</sup>)</td></tr>
    <tr><td>Permutations</td><td>for j not used: mark, go(), unmark</td><td>len(path) == n</td><td>O(n·n!)</td></tr>
    <tr><td>Combination sum</td><td>for j ≥ start: go(j, remain − c) (reuse) or go(j+1, …) (once)</td><td>remain == 0</td><td>O(k<sup>T/m</sup>)</td></tr>
    <tr><td>Parentheses</td><td>"(" if open &lt; n; ")" if close &lt; open</td><td>len == 2n</td><td>O(4<sup>n</sup>/√n)</td></tr>
    <tr><td>Word search</td><td>mark "#", 4 neighbours (k + 1), restore</td><td>k == len(word)</td><td>O(R·C·3<sup>L</sup>)</td></tr>
    <tr><td>N-Queens</td><td>row r: each safe c (cols, r−c, r+c sets)</td><td>r == n</td><td>O(n!)</td></tr>
  </table>
  <p>Symbols: n = number of items, k = number of candidate values, T = target sum, m = smallest value, L = word length, R × C = grid size. Recursion space = maximum depth.</p>
  <div class="cards">
    <div><b>Use backtracking</b><p>"Return all …", "generate every …", small n, or placement puzzles where partial answers can be checked and pruned.</p><small>Subsets, permutations, combinations, N-Queens, word search.</small></div>
    <div><b>Avoid it</b><p>When only a count, yes/no or best value is asked and states repeat: use DP (Coin Change, Unique Paths). When n is large: 2<sup>n</sup> or n! will not finish.</p><small>Check constraints first: n ≤ 20 is a hint.</small></div>
  </div>
  <h3>Key traps</h3>
  <ul>
    <li><code>res.append(path)</code> saves a reference → all answers end up empty. Save <code>path[:]</code>.</li>
    <li>Every choose (append, used[j] = True, mark "#", add to set) needs its undo after the call.</li>
    <li>Combination loops start at <code>start</code>, not 0 (else reorders); recurse with <code>j</code> for reuse, <code>j + 1</code> for once.</li>
    <li>Duplicates: sort and skip <code>items[j] == items[j-1]</code> when <code>j &gt; start</code>.</li>
    <li>Prune only on conditions no later choice can repair (non-negative prices).</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>How many subsets of 3 add-ons, and how many serving orders? → 2<sup>3</sup> = 8 and 3! = 6.</li>
    <li>Combos for ₹70 from [20, 30, 60, 70] with reuse? → [20, 20, 30] and [70]; without the start index you also get [20, 30, 20] and [30, 20, 20].</li>
    <li>What does pruning change? → Only the work (1,111 → 281 calls), never the answers (21 thalis both times).</li>
    <li>Why restore the cell in word search? → So other paths and other start cells can use it; graph DFS keeps marks, backtracking removes them.</li>
    <li>How does N-Queens check a diagonal in O(1)? → Cells on one diagonal share r − c (or r + c); keep those values in sets.</li>
  </ol>

  <h2 id="dsa-bt-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What two parts does every recursive function need?</summary><div class="qa-body">A base case (smallest input, answer returned directly) and a recursive step that makes the input smaller and calls the function again. Without a base case, or if the step never reaches it, you get <code>RecursionError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the space complexity of recursive factorial, and why?</summary><div class="qa-body">O(n). Each call waits on the call stack until the one above it returns, so n frames are on the stack at the deepest point. An iterative loop would use O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is plain recursive Fibonacci slow? How many calls for fib(20)?</summary><div class="qa-body">Each call makes two more calls, and the same values (fib(2), fib(3)…) are recomputed again and again. The tree has about 2<sup>n</sup> nodes: fib(20) makes 21,891 calls. Memoisation cuts it to n + 1 distinct calls.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain backtracking in one line and name its three steps.</summary><div class="qa-body">Build a solution one choice at a time and undo the last choice when the path is finished or stuck. Steps: choose, explore (recurse), un-choose.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Subsets vs permutations: what changes in the code?</summary><div class="qa-body">Subsets loop from a <code>start</code> index and recurse with <code>j + 1</code>; every node (or every leaf in take/skip) is an answer. Permutations loop over all indices, skip ones in <code>used[]</code>, and save only when the path has length n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle duplicates, e.g. subsets of [papad, raita, raita]?</summary><div class="qa-body">Sort first. In the loop, skip an item equal to the previous one at the same level: <code>if j &gt; start and items[j] == items[j-1]: continue</code>. Result: 6 distinct selections, not 8.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Combination Sum, why recurse with <code>j</code> and not <code>j + 1</code>?</summary><div class="qa-body">Each dish can be reused, so the next pick may be the same dish again. Using <code>j + 1</code> gives Combination Sum II behaviour (each at most once). Starting from <code>j</code> rather than 0 avoids the same combo in different orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>res=[]; p=[1]; res.append(p); p.append(2); print(res)</code></summary><div class="qa-body"><code>[[1, 2]]</code>. <code>res</code> stores a reference to the list, not a snapshot. This is why backtracking saves <code>path[:]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does N-Queens check "is this cell attacked" in O(1)?</summary><div class="qa-body">One queen per row, so rows never clash. Keep three sets: used columns, used <code>r − c</code> values ("\\" diagonals) and used <code>r + c</code> values ("/" diagonals). A cell is safe if none of its three values is in the sets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Word Search: why mark the cell and then restore it?</summary><div class="qa-body">Marking stops the current path from using the same cell twice (DOSAS cannot reuse the S). Restoring lets other paths (from other start cells or other directions) use it. Without restoring, later searches see a broken grid and miss real answers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you NOT use backtracking?</summary><div class="qa-body">When the question asks only for a count, a yes/no, or the best value and the subproblems repeat. Then DP is polynomial while backtracking is exponential (number of coin combinations, min coins, number of paths in a grid).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is pruning and does it change the answer?</summary><div class="qa-body">Pruning stops a branch as soon as it cannot lead to a valid answer (over budget, queen attacked). It doesn't change the answers, only the time: the budget thali went from 1,111 calls to 281, and to 84 with sorted prices and break, always 21 thalis.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is backtracking related to graph DFS?</summary><div class="qa-body">Both go deep first with recursion or a stack. Graph DFS walks a given graph and keeps a visited mark forever, so each node is processed once. Backtracking walks an implicit tree of partial answers and removes its marks on the way back (un-choose), so every path is explored.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does backtracking need the call stack, and what breaks if you skip the un-choose step?</summary><div class="qa-body">The call stack remembers, for every level, which option is being tried and where to resume, which is what lets one recursive function act as a variable number of nested loops. Skipping un-choose leaves the previous branch's choices in the shared path, so later answers contain stale items (or the board stays marked and later searches fail).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what turns a backtracking solution into a DP solution?</summary><div class="qa-body">If the recursion's result depends only on a small state (index, remaining budget) and the same state is reached along different paths, store each state's answer the first time (memoisation). That only works when you need a value (count, min, max, yes/no), not the full list of answers.</div></details>
</main>
`
});
