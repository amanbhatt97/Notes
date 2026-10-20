// notes/dsa/dsa_dp.js — Dynamic Programming
Object.assign(TOPIC_CONTENT, {
  "dsa_dp": `<main>
<h1>Dynamic Programming</h1>
  <div class="where"><span>DSA</span><span>Techniques</span><span>Dynamic Programming</span></div>
  <p class="lead">Dynamic programming (DP) is recursion that remembers. When a problem breaks into smaller copies of itself, and the same small copies keep coming back, you solve each one once, write the answer down, and reuse it. That turns exponential brute force into a table you can fill by hand. This note starts from the waste you saw in the Backtracking note (fib(20) made 21,891 calls), fixes it with memoisation, then tabulation, then a 5-step recipe for designing any DP, and grows through the families: 1-D, 2-D grids and two sequences, knapsack, string edits, intervals, trees and bitmasks, ending with space optimisation. <b>Running example: one Biteful rider's shift, Ravi's</b>: his staircase, the tips on his street, the traffic minutes across the city grid, his bag's weight limit, his planned vs actual stops, a customer's typo, and the shortest round trip through his customers. Every table is filled by hand first; every output is a real run (Python 3.13).</p>

  <h2 id="dsa-dp-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-dp-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="60" y="6" width="520" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Backtracking (recursion trees) · Hashing (memo = dict) · Graphs (Bellman-Ford rounds)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-dp-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Dynamic Programming</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · solve each subproblem once</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-dp-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-dp-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-dp-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Tries (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">share prefixes, not subproblems</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Intervals &amp; Greedy</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">when one choice is always safe</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Bit Manipulation</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">masks for bitmask DP</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-dp-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → DP: about 110 problems, from N-th Tribonacci Number to Burst Balloons</text>
</svg><figcaption>Reading order: Graphs → Backtracking → <b>Dynamic Programming</b> → Tries. DP is what backtracking becomes when you only need a number and the same states keep coming back.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_backtrack">Recursion &amp; Backtracking</a></b><span>Backtracking listed every option by walking a recursion tree, and its tree for fib(20) had 21,891 nodes for only 21 different questions. When the question is "how many?" or "what is the best?", walking every path is waste. <a class="xref" data-note="dsa_hashing">Hashing</a> gave the dict we will use as the memo; <a class="xref" data-note="dsa_graphs">Graphs</a> already ran a DP without naming it (Bellman-Ford's "best cost with at most i roads").</span></li>
    <li><b>This note adds: remembering subproblem answers, and a recipe for designing them</b><span>Memoisation, tabulation, the 5-step state/transition recipe, then the families: 1-D, 2-D, knapsack, string, interval, tree, bitmask, and space optimisation.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_tries">Tries</a></b><span>DP shares <em>answers</em> between subproblems. Tries share <em>prefixes</em> between words, so "every dish starting with pa" is one walk instead of a scan. Also see <a class="xref" data-note="dsa_greedy">Intervals &amp; Greedy</a> (when one local choice is provably safe, no table is needed) and <a class="xref" data-note="dsa_bits">Bit Manipulation</a> (the masks used in bitmask DP). Practise in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>; <code>functools.cache</code> and recursion are in <a class="xref" data-note="py_functions">Python Functions</a>.</span></li>
  </ol>

  <h2 id="dsa-dp-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next. Running example: rider Ravi's shift (staircase of 5 steps; street tips [2, 7, 9, 3, 1]; traffic grid [[1, 3, 1], [1, 5, 1], [4, 2, 1]]; bag 4 kg with orders 1 kg/₹15, 3 kg/₹20, 4 kg/₹30; planned stops ABCDE vs actual ACE; typo "sambr" for "samosa"; round trip through 3 customers).</p>
  <ol class="story">
    <li><b>Repeated subproblems</b><span>Q: why is plain recursion so slow? → fib(30) makes 2,692,537 calls for 31 different questions: the same subtrees are recomputed. How do we stop recomputing?</span></li>
    <li><b>Memoisation</b><span>Q: what if each answer is written down the first time? → a dict checked before work: fib(30) in 59 calls. But each call still waits on the stack: fib_cache(5000) hits RecursionError…</span></li>
    <li><b>Tabulation</b><span>Q: can we fill the answers without recursion? → a list filled small to big: dp[7] = dp[6] + dp[5] = 13. Fine for Fibonacci, but how do we invent the table for a new problem?</span></li>
    <li><b>State &amp; transition recipe</b><span>Q: what are the steps? → state, recurrence (think about the last move), base case, order, answer. Ravi's 5-step staircase: 8 ways. Now apply it to real 1-D choices…</span></li>
    <li><b>1-D DP</b><span>Q: best tips on a street when neighbouring orders clash? → dp = max(skip, take + dp two back): 12 from [2, 7, 9, 3, 1]; fewest coins for ₹11: 3. One index is not enough when Ravi moves in two directions…</span></li>
    <li><b>2-D DP</b><span>Q: routes and quickest minutes across a grid; overlap of two stop lists? → dp[r][c] from north and west: 10 routes, 7 minutes; LCS table: ABCDE vs ACE share 3 stops. Now a capacity limit enters…</span></li>
    <li><b>Knapsack</b><span>Q: which orders fit a 4 kg bag for the best tips? → dp[i][w] = skip or take once: ₹35. Next: comparing two words needs more than "keep or drop"…</span></li>
    <li><b>String DP</b><span>Q: how many edits turn "sambr" into "samosa"? → edit distance table with insert, delete, replace: 3. Some problems are about a range l..r, not a prefix…</span></li>
    <li><b>Interval DP</b><span>Q: best value inside a slice when choices interact across it? → dp[l][r] from shorter slices; Burst Balloons: pick the <em>last</em> one, 167. Some structures are not lines at all…</span></li>
    <li><b>DP on trees</b><span>Q: promote hubs, but never a hub and its direct sub-hub? → each node returns (use, skip) to its parent: 9. And when the state is "which customers are already served"…</span></li>
    <li><b>Bitmask DP</b><span>Q: shortest round trip through all customers? → state (set of visited as bits, current place): 80 minutes from 13 states instead of trying every order. Tables can get big…</span></li>
    <li><b>Space optimisation</b><span>Q: do we need the whole table? → keep only the rows the recurrence reads: Fibonacci in 2 variables, grids in 1 row, knapsack in 1 row (right to left). Then families, classics, traps.</span></li>
  </ol>

  <h2 id="dsa-dp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dynamic Programming</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>DP</b> — solve each subproblem once, store it, reuse it</li>
          <li>fib(30): 2,692,537 calls → 59 with a memo</li>
          <li><b>Overlapping subproblems</b> + <b>optimal substructure</b></li>
          <li>💡 write the bill total down once, then just read it</li>
          <li>⚠ no overlap (merge sort) → not DP; "list all" → backtracking</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two ways to write it</div>
        <ul>
          <li><b>Memo (top-down)</b> — recursion + dict / <code>@cache</code></li>
          <li><b>Table (bottom-up)</b> — loop, fill in a safe order</li>
          <li>Time = states × work per state</li>
          <li>⚠ memo on deep inputs → RecursionError</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5-step recipe</div>
        <ul>
          <li><b>State</b>: what dp[i] means, one sentence</li>
          <li><b>Recurrence</b>: from the last move</li>
          <li><b>Base</b> · <b>Order</b> · <b>Answer</b></li>
          <li>Stairs: ways(i) = ways(i−1) + ways(i−2); 5 steps → 8</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">1-D &amp; 2-D</div>
        <ul>
          <li>Robber: max(skip, take + dp[i−2]) → tips 12</li>
          <li>Coins: min(dp[a−c] + 1) → ₹11 = 3 coins</li>
          <li>Grid: north + west → 10 routes; min → 7 minutes</li>
          <li>LCS: match → diagonal + 1 → ABCDE/ACE = 3</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Knapsack &amp; strings</div>
        <ul>
          <li><b>0/1</b>: dp[i][w] = max(skip, take once) → ₹35</li>
          <li>1 row: right→left (once) · left→right (reuse)</li>
          <li><b>Edit distance</b>: 1 + min(del, ins, rep) → sambr→samosa 3</li>
          <li>Table is (m+1)×(n+1): row/col 0 = empty prefix</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interval · tree · bitmask</div>
        <ul>
          <li><b>Interval</b>: dp[l][r], short slices first; burst LAST → 167</li>
          <li><b>Tree</b>: post-order returns (use, skip) → 9</li>
          <li><b>Bitmask</b>: dp[mask][i], n ≤ 20 → round trip 80</li>
          <li><b>Space</b>: keep only rows you read</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-dp-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Recursion Recomputes</span><span class="rm-sub">fib calls counted; when DP applies</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-memo"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Memoisation</span><span class="rm-sub">From scratch, then functools.cache</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-tab"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Tabulation</span><span class="rm-sub">Fill a table small to big</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-recipe"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">State &amp; Transition Recipe</span><span class="rm-sub">5 steps on Ravi's staircase</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-1d"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">1-D DP</span><span class="rm-sub">House robber traced, coin change</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-2d"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">2-D DP</span><span class="rm-sub">Grid paths, LCS by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-knap"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Knapsack</span><span class="rm-sub">0/1 table, unbounded, counting</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-str"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">String DP</span><span class="rm-sub">Edit distance table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-interval"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interval DP</span><span class="rm-sub">Palindromes, burst balloons</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-tree"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">DP on Trees</span><span class="rm-sub">(use, skip) pairs</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-bitmask"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Bitmask DP</span><span class="rm-sub">Round trip through all customers</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-space"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Space Optimisation</span><span class="rm-sub">Keep only what you read</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-patterns"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Choosing the Family</span><span class="rm-sub">Trigger words → state; stock state machine</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-problems"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">Coin change, LIS, partition, stock</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Off-by-one, loop order, mutable cache</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-connect"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-qa"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-dp-need"><span class="num">01</span>Recursion Recomputes the Same Subproblems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Backtracking's recursion tree was perfect for <em>listing</em> answers. But fib(20) took 21,891 calls to return one number. Where exactly does that work go, and how much of it is repeated?</p>
  </div>
  <p>Start with something you already know: the Fibonacci numbers 0, 1, 1, 2, 3, 5, 8, 13… Each number is the sum of the two before it. The recursive code is a direct copy of that sentence. Count the calls:</p>
<div class="fx" data-lang="py">calls = 0
def fib(n):
    global calls
    calls += 1
    if n &lt; 2:
        return n
    return fib(n - 1) + fib(n - 2)

for n in [5, 20, 30]:
    calls = 0
    print(f"fib({n}) = {fib(n)}  calls = {calls}")</div>
  <div class="fx" data-lang="text">fib(5) = 5  calls = 15
fib(20) = 6765  calls = 21891
fib(30) = 832040  calls = 2692537</div>
  <p>For n = 30 there are only 31 different questions (fib(0) to fib(30)), but the code makes 2.7 million calls. Draw the calls for fib(5) and you see why.</p>
  <figure class="viz"><svg viewBox="0 0 600 306" width="600"><line x1="300" y1="42" x2="170" y2="73" stroke="currentColor" /><line x1="300" y1="42" x2="440" y2="73" stroke="currentColor" /><line x1="170" y1="97" x2="95" y2="128" stroke="currentColor" /><line x1="170" y1="97" x2="245" y2="128" stroke="currentColor" /><line x1="440" y1="97" x2="390" y2="128" stroke="currentColor" /><line x1="440" y1="97" x2="490" y2="128" stroke="currentColor" /><line x1="95" y1="152" x2="55" y2="183" stroke="currentColor" /><line x1="95" y1="152" x2="135" y2="183" stroke="currentColor" /><line x1="245" y1="152" x2="215" y2="183" stroke="currentColor" /><line x1="245" y1="152" x2="275" y2="183" stroke="currentColor" /><line x1="390" y1="152" x2="360" y2="183" stroke="currentColor" /><line x1="390" y1="152" x2="420" y2="183" stroke="currentColor" /><line x1="55" y1="207" x2="30" y2="238" stroke="currentColor" /><line x1="55" y1="207" x2="80" y2="238" stroke="currentColor" /><rect x="278" y="18" width="44" height="24" rx="5" class="fb sb"/><text x="300" y="34" text-anchor="middle">f(5)</text><rect x="148" y="73" width="44" height="24" rx="5" class="fb sb"/><text x="170" y="89" text-anchor="middle">f(4)</text><rect x="418" y="73" width="44" height="24" rx="5" class="fg sg"/><text x="440" y="89" text-anchor="middle">f(3)</text><rect x="73" y="128" width="44" height="24" rx="5" class="fr sr"/><text x="95" y="144" text-anchor="middle">f(3)</text><rect x="223" y="128" width="44" height="24" rx="5" class="fg sg"/><text x="245" y="144" text-anchor="middle">f(2)</text><rect x="368" y="128" width="44" height="24" rx="5" class="fr sr"/><text x="390" y="144" text-anchor="middle">f(2)</text><rect x="468" y="128" width="44" height="24" rx="5" class="fv sb"/><text x="490" y="144" text-anchor="middle">f(1)</text><rect x="33" y="183" width="44" height="24" rx="5" class="fr sr"/><text x="55" y="199" text-anchor="middle">f(2)</text><rect x="113" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="135" y="199" text-anchor="middle">f(1)</text><rect x="193" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="215" y="199" text-anchor="middle">f(1)</text><rect x="253" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="275" y="199" text-anchor="middle">f(0)</text><rect x="338" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="360" y="199" text-anchor="middle">f(1)</text><rect x="398" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="420" y="199" text-anchor="middle">f(0)</text><rect x="8" y="238" width="44" height="24" rx="5" class="fv sb"/><text x="30" y="254" text-anchor="middle">f(1)</text><rect x="58" y="238" width="44" height="24" rx="5" class="fv sb"/><text x="80" y="254" text-anchor="middle">f(0)</text><rect x="400" y="225" width="14" height="14" class="fg sg"/><text x="420" y="237">first time</text><rect x="400" y="245" width="14" height="14" class="fr sr"/><text x="420" y="257" class="tr">repeat (wasted)</text><rect x="400" y="265" width="14" height="14" class="fv sb"/><text x="420" y="277">base case</text><text x="300" y="296" text-anchor="middle" class="tm">15 calls for f(5) · f(3) twice · f(2) three times · grows like 1.6^n</text></svg><figcaption>The call tree of plain recursive fib(5). The same sub-questions are asked again and again. Red boxes are pure repeat work; at n = 30 there are 2.7 million calls for only 31 different questions.</figcaption></figure>
  <table class="tbl out"><caption>fib(5) by hand: how often each question is asked</caption>
    <tr><th>question</th><th>f(5)</th><th>f(4)</th><th>f(3)</th><th>f(2)</th><th>f(1)</th><th>f(0)</th><th>total</th></tr>
    <tr><td>times computed</td><td>1</td><td>1</td><td>2</td><td>3</td><td>5</td><td>3</td><td><b>15</b></td></tr>
    <tr><td>times needed</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td><b>6</b></td></tr>
  </table>
  <p>fib(5) asks fib(4) and fib(3). But fib(4) <em>also</em> asks fib(3). Nobody remembers the first answer, so the whole fib(3) subtree is computed again. The repeats repeat too. The number of calls grows like 1.6ⁿ: add 1 to n and the work grows by 60%.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper adds up the same bill of 20 items every time a customer asks "how much was it?". A smart one writes the total on the bill the first time. Next time she just reads it. DP is writing the total on the bill.</p>
  </div>
  <h3>When DP applies: two properties</h3>
  <p>DP is not magic for every recursion. It needs two things. Check both before you start.</p>
  <table class="tbl">
    <tr><th>Property</th><th>Plain meaning</th><th>Fibonacci</th><th>Counter-example</th></tr>
    <tr><td><strong>Overlapping subproblems</strong></td><td>The same smaller question shows up again and again</td><td>fib(3) is needed by fib(4) and fib(5)</td><td>Merge sort: the two halves never share work, so caching saves nothing</td></tr>
    <tr><td><strong>Optimal substructure</strong></td><td>The best answer for the big problem is made from the best answers of smaller ones</td><td>fib(n) is exactly fib(n−1) + fib(n−2)</td><td>Longest <em>simple</em> path in a graph: the best path's pieces need not be best paths themselves</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Ask: "Can I describe where I am with a few numbers (an index, a remaining amount, two positions)?" If yes, and the future only depends on those numbers and not on <em>how</em> you got there, you have a DP state. The number of different states is small, but the number of paths through them is huge. DP walks states, not paths.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Dynamic programming</strong>: solve a problem by splitting it into smaller subproblems, solving each distinct subproblem <em>once</em>, storing its answer, and building bigger answers from stored ones. (The name, from Richard Bellman in the 1950s, just means "planning with a table".) Where you meet it: spell-check suggestions and <code>git diff</code> (edit distance, LCS), route planning, text justification, speech recognition (Viterbi), and a large share of interview "hard" questions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Coins [1, 3, 4], make 6. Greedy takes the biggest coin first: 4 + 1 + 1 = 3 coins. The best is 3 + 3 = 2 coins. Greedy is right for Indian coins (1, 2, 5, 10) but wrong in general. When greedy's choice can block a better later combination, you need DP to try all choices at each amount.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Memoisation.</b> We know the waste is repeated questions. The fix sounds obvious: write each answer down the first time. How exactly, and how many calls remain?</div>

  <h2 id="dsa-dp-memo"><span class="num">02</span>Memoisation (Top-Down)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>fib(30) asks 31 different questions 2.7 million times. Can we keep the simple recursive code but make every question cost real work only once?</p>
  </div>
  <p>Keep the recursive code. Add a dictionary (a "memo", from <a class="xref" data-note="dsa_hashing">Hashing</a>). <strong>Before computing fib(k), check if you already have it; after computing it, write it down.</strong></p>
  <div class="flow"><span>base case? return it</span><span>in memo? return memo[k]</span><span>else compute from smaller calls</span><span>memo[k] = answer, return</span></div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>You have a correct but slow recursive solution whose arguments repeat ("count the ways", "min cost from here"); the state is a few hashable values (index, remaining amount, tuple).</p>
  </div>
<div class="fx" data-lang="py">calls = 0
def fib_memo(n, memo=None):
    global calls
    calls += 1
    if memo is None:
        memo = {}                        # fresh notebook for each top-level call
    if n &lt; 2:
        return n
    if n not in memo:                    # first time: compute and write down
        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]                       # every later time: just read

for n in [5, 20, 30]:
    calls = 0
    print(f"fib({n}) = {fib_memo(n)}  calls = {calls}")</div>
  <div class="fx" data-lang="text">fib(5) = 5  calls = 9
fib(20) = 6765  calls = 39
fib(30) = 832040  calls = 59</div>
  <p>fib(30) now costs 59 calls instead of 2,692,537: each of the 31 answers is computed once (and fib(k) is called once more to read it, which is why it is 59 and not 31). The growth is linear: every extra n adds two calls.</p>
  <h3>The Python-library way: functools.cache</h3>
  <p>Python can add the dictionary for you. <code>@cache</code> (Python 3.9+) wraps the function: arguments become the key, the return value is stored. <code>@lru_cache(maxsize=None)</code> is the same thing on older versions.</p>
<div class="fx" data-lang="py">from functools import cache

@cache                                   # Python adds the dict: arguments -&gt; result
def fib_cache(n):
    if n &lt; 2:
        return n
    return fib_cache(n - 1) + fib_cache(n - 2)

print(fib_cache(50))
print(fib_cache.cache_info())

@cache
def fib_deep(n):
    return n if n &lt; 2 else fib_deep(n - 1) + fib_deep(n - 2)
try:
    fib_deep(5000)                       # fresh cache: 5000 nested calls
except RecursionError as e:
    print("RecursionError:", e)</div>
  <div class="fx" data-lang="text">12586269025
CacheInfo(hits=48, misses=51, maxsize=None, currsize=51)
RecursionError: maximum recursion depth exceeded</div>
  <p><code>cache_info()</code> proves the point: 51 misses (each of fib(0)…fib(50) computed once) and 48 hits (answers reused). Without the cache this would be about 40 billion calls. But the last line shows the limit: on a fresh cache, fib_deep(5000) nests 5000 calls, each waiting for the next, and Python stops at about 1000.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Memoisation</strong> (top-down DP): the recursive solution plus a cache from arguments to results. Only states actually reached are computed. Time = (number of distinct states) × (work per state); space = cache size + recursion depth.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the recursion limit, and a shared default</span>
    <p><code>fib_cache(5000)</code> on a fresh cache crashes even though the work is tiny. Fixes: switch to a table (next section), warm the cache in steps (<code>for i in range(n): f(i)</code>), or raise <code>sys.setrecursionlimit</code> (risky). And never write <code>def f(n, memo={})</code>: the default dict is created once and shared between calls; use <code>memo=None</code> as above.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>1137 N-th Tribonacci Number</b> (memo three back), <b>329 Longest Increasing Path in a Matrix</b> (memo on cells), <b>894 All Possible Full Binary Trees</b> (memo on n).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tabulation.</b> Memoisation removed the repeats but kept the recursion, and with it the call-stack depth. If we know which answers depend on which, can we compute them in a plain loop, smallest first, with no recursion at all?</div>

  <h2 id="dsa-dp-tab"><span class="num">03</span>Tabulation (Bottom-Up)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>fib(k) needs only fib(k−1) and fib(k−2). If we compute answers from small k upwards, everything needed is always ready. Can a loop over a list replace the recursion?</p>
  </div>
  <p>Throw away the recursion. Make a list <code>dp</code> where <code>dp[i]</code> is fib(i). Write the base cases in by hand, then fill the rest from small to big with a loop. When you reach <code>dp[i]</code>, <code>dp[i-1]</code> and <code>dp[i-2]</code> are already done.</p>
  <div class="flow"><span>make the table</span><span>write base cells by hand</span><span>loop in dependency order</span><span>read the answer cell</span></div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600"><defs><marker id="dsa-dp-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><rect x="100" y="80" width="50" height="36" class="fv sb"/><text x="125" y="103" text-anchor="middle">0</text><text x="125" y="136" class="tm" text-anchor="middle">0</text><rect x="150" y="80" width="50" height="36" class="fv sb"/><text x="175" y="103" text-anchor="middle">1</text><text x="175" y="136" class="tm" text-anchor="middle">1</text><rect x="200" y="80" width="50" height="36" class="ft st"/><text x="225" y="103" text-anchor="middle">1</text><text x="225" y="136" class="tm" text-anchor="middle">2</text><rect x="250" y="80" width="50" height="36" class="ft st"/><text x="275" y="103" text-anchor="middle">2</text><text x="275" y="136" class="tm" text-anchor="middle">3</text><rect x="300" y="80" width="50" height="36" class="ft st"/><text x="325" y="103" text-anchor="middle">3</text><text x="325" y="136" class="tm" text-anchor="middle">4</text><rect x="350" y="80" width="50" height="36" class="fg sg"/><text x="375" y="103" text-anchor="middle">5</text><text x="375" y="136" class="tm" text-anchor="middle">5</text><rect x="400" y="80" width="50" height="36" class="fg sg"/><text x="425" y="103" text-anchor="middle">8</text><text x="425" y="136" class="tm" text-anchor="middle">6</text><rect x="450" y="80" width="50" height="36" class="fr sr"/><text x="475" y="103" text-anchor="middle">13</text><text x="475" y="136" class="tm" text-anchor="middle">7</text><text x="50" y="103" text-anchor="middle">dp:</text><text x="50" y="136" class="tm" text-anchor="middle">i:</text><path d="M375,78 Q425,20 469,76" fill="none" class="sr" stroke="currentColor" stroke-width="1.5" marker-end="url(#dsa-dp-a1)"/><path d="M425,78 Q450,50 473,76" fill="none" class="sr" stroke="currentColor" stroke-width="1.5" marker-end="url(#dsa-dp-a1)"/><text x="415" y="22" class="tr" text-anchor="middle">dp[7] = dp[6] + dp[5]</text><text x="100" y="40" class="tb">fill left → right</text><text x="100" y="58" class="tm">each cell once, O(1) work</text><text x="300" y="160" text-anchor="middle" class="tm">purple = base cases · every other cell reads only cells to its left</text></svg><figcaption>Tabulation for Fibonacci. The table is filled in an order where every cell it needs is already done. 8 cells, 8 steps: O(n) instead of O(1.6ⁿ).</figcaption></figure>
<div class="fx" data-lang="py">def fib_table(n):
    if n &lt; 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1                            # base cases: dp[0] = 0, dp[1] = 1
    for i in range(2, n + 1):            # small to big: dp[i-1], dp[i-2] are ready
        dp[i] = dp[i - 1] + dp[i - 2]
        print(f"i={i}: dp[{i}] = dp[{i-1}] + dp[{i-2}] = {dp[i-1]} + {dp[i-2]} = {dp[i]}")
    return dp[n]

print("fib(7) =", fib_table(7))</div>
  <div class="fx" data-lang="text">i=2: dp[2] = dp[1] + dp[0] = 1 + 0 = 1
i=3: dp[3] = dp[2] + dp[1] = 1 + 1 = 2
i=4: dp[4] = dp[3] + dp[2] = 2 + 1 = 3
i=5: dp[5] = dp[4] + dp[3] = 3 + 2 = 5
i=6: dp[6] = dp[5] + dp[4] = 5 + 3 = 8
i=7: dp[7] = dp[6] + dp[5] = 8 + 5 = 13
fib(7) = 13</div>
  <table class="tbl">
    <tr><th></th><th>Memoisation (top-down)</th><th>Tabulation (bottom-up)</th></tr>
    <tr><td>How it looks</td><td>Recursion + cache</td><td>Loop + list/table</td></tr>
    <tr><td>Order of work</td><td>Automatic: recursion asks for what it needs</td><td>You must pick an order where inputs are ready</td></tr>
    <tr><td>Computes</td><td>Only the states actually reached</td><td>Every state in the table</td></tr>
    <tr><td>Depth limit</td><td>Python stops at ~1000 nested calls</td><td>No recursion, no limit</td></tr>
    <tr><td>Space trick</td><td>Hard (the cache holds everything)</td><td>Easy: keep only the last row or two values (section 12)</td></tr>
    <tr><td>Best for</td><td>Finding the recurrence, sparse states, trees</td><td>Final answer, big n, saving memory</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tabulation</strong> (bottom-up DP): allocate a table indexed by the state, fill the base cells, then fill every other cell in an order where its dependencies are already filled. Same Big-O as memoisation: <strong>time = (number of states) × (work per state)</strong>, <strong>space = number of states stored</strong>. Fibonacci: n states × O(1) = O(n) time, O(n) space.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Filling in the wrong order. If a cell reads a neighbour that has not been computed yet, it silently reads the initial 0. Before writing the loop, say which cells each cell reads, and make the loop visit those first.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>1137 N-th Tribonacci Number</b> (table of size n + 1), <b>70 Climbing Stairs</b> (next section).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The State &amp; Transition Recipe.</b> For Fibonacci the formula was handed to us. In a new problem nobody gives us "dp[i] = dp[i−1] + dp[i−2]". How do we find what a cell should mean and how it is built?</div>

  <h2 id="dsa-dp-recipe"><span class="num">04</span>The State &amp; Transition Recipe</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ravi delivers to a 5th-floor flat by a staircase of 5 steps and, being in a hurry, climbs 1 or 2 steps per stride. In how many different ways can he reach the top? There is no formula in the question. What steps turn a word problem into a table?</p>
  </div>
  <p>Every DP solution answers the same five questions. Write them down as comments <em>before</em> any code. Interviewers grade this more than the code.</p>
  <div class="flow"><span>1. State</span><span>2. Recurrence (transition)</span><span>3. Base case</span><span>4. Order</span><span>5. Answer</span></div>
  <p>Try small cases by hand first. n = 1: {1}, one way. n = 2: {1+1, 2}, two ways. n = 3: {1+1+1, 1+2, 2+1}, three ways. n = 4: five ways. The pattern looks like Fibonacci. The recipe tells us <em>why</em>.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Ravi's staircase</th></tr>
    <tr><td>1. State</td><td>What does one cell mean? One plain sentence.</td><td><code>ways(i)</code> = number of ways to stand on step i</td></tr>
    <tr><td>2. Recurrence</td><td>Look at the <em>last</em> move. What could it have been?</td><td>The last stride was 1 step (from i−1) or 2 steps (from i−2): <code>ways(i) = ways(i-1) + ways(i-2)</code></td></tr>
    <tr><td>3. Base case</td><td>Smallest states you can answer without the rule</td><td><code>ways(0) = 1</code> (stand on the ground: do nothing), <code>ways(1) = 1</code></td></tr>
    <tr><td>4. Order</td><td>Which states must be ready first?</td><td>i depends on smaller i → loop i from 2 up to n</td></tr>
    <tr><td>5. Answer</td><td>Which state is the final answer?</td><td><code>ways(5)</code></td></tr>
  </table>
  <table class="tbl out"><caption>Filled by hand</caption>
    <tr><th>step i</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><th>ways(i)</th><td>1</td><td>1</td><td>1+1 = 2</td><td>2+1 = 3</td><td>3+2 = 5</td><td>5+3 = <b>8</b></td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Step 2 is where most people get stuck. The trick is almost always: <strong>think about the last decision</strong>. "How did I arrive here?" splits every way into a few groups, and each group is a smaller copy of the problem. Adding the groups (count) or taking the best group (min/max) is the recurrence.</p>
  </div>
<div class="fx" data-lang="py">from functools import cache

def climb_top_down(n):
    @cache
    def ways(i):                 # 1. state: ways to stand on step i
        if i &lt;= 1:
            return 1             # 3. base: step 0 and step 1
        return ways(i - 1) + ways(i - 2)   # 2. last move was 1 or 2 steps
    return ways(n)               # 5. answer

def climb_bottom_up(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    if n &gt;= 1:
        dp[1] = 1
    for i in range(2, n + 1):    # 4. order: small to big
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp

print("Ravi's staircase, 5 steps: dp =", climb_bottom_up(5))
for n in [1, 2, 3, 4, 5, 10]:
    print(n, climb_top_down(n), climb_bottom_up(n)[n])</div>
  <div class="fx" data-lang="text">Ravi's staircase, 5 steps: dp = [1, 1, 2, 3, 5, 8]
1 1 1
2 2 2
3 3 3
4 5 5
5 8 8
10 89 89</div>
  <p>Notice the base case <code>ways(0) = 1</code>. "One way to climb zero steps: do nothing" feels odd, but it is what makes <code>ways(2) = ways(1) + ways(0) = 2</code> come out right. Counting DPs almost always start with "1 way to make nothing".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>state</strong> is the smallest set of numbers that fully describes a subproblem (here: the step i). A <strong>transition</strong> (recurrence) expresses a state's answer through smaller states, usually by enumerating the possible last choices. Combine with <code>+</code> to count, <code>min</code>/<code>max</code> to optimise, <code>or</code> for yes/no.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A fuzzy state. If you cannot say what <code>dp[i]</code> means in one sentence ("ways to stand on step i"), the recurrence will be wrong. "Ending at i" vs "among the first i" changes both the recurrence and the answer (<code>max(dp)</code> vs <code>dp[n]</code>).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>70 Climbing Stairs</b>, <b>91 Decode Ways</b> (last piece is 1 or 2 digits), <b>1155 Number of Dice Rolls With Target Sum</b> (last die shows 1..k).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: 1-D DP.</b> The staircase only counted. Real 1-D problems carry a choice with a value at each position: take this order's tip or not, pay with which coin. Does the recipe still work when the recurrence has a <code>max</code> or <code>min</code> in it?</div>

  <h2 id="dsa-dp-1d"><span class="num">05</span>1-D DP: Take or Skip, Last Coin</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Five orders sit in a row on Ravi's street with tips ₹2, 7, 9, 3, 1. Two neighbouring orders are due at the same minute, so he can never take both of a neighbouring pair. Which orders give the most tips? Trying every subset is 2⁵ = 32 checks, and 2ⁿ in general.</p>
  </div>
  <p>Walk the street once. At order i the only question is "take this one or not?" If he skips it, the best is whatever was best up to i−1. If he takes it, he must have skipped i−1, so it is the best up to i−2 plus this tip.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"array", "houses / orders in a row", "no two adjacent", "steps", "fewest coins / ways to make amount", "ways to decode", "word break".</p>
  </div>
  <div class="flow"><span>State: best tips from the first i orders</span><span>dp[i] = max(dp[i−1], dp[i−2] + tip[i])</span><span>Base: 0 orders → 0</span><span>left to right; answer = last</span></div>
  <h3>House Robber (Ravi's street), traced</h3>
  <table class="tbl out"><caption>Dry run on tips [2, 7, 9, 3, 1]</caption>
    <tr><th>tip</th><th>skip = best so far</th><th>take = best two back + tip</th><th>new best</th></tr>
    <tr><td>2</td><td>0</td><td>0 + 2</td><td>2</td></tr>
    <tr><td>7</td><td>2</td><td>0 + 7</td><td>7</td></tr>
    <tr><td>9</td><td>7</td><td>2 + 9</td><td>11</td></tr>
    <tr><td>3</td><td>11</td><td>7 + 3</td><td>11</td></tr>
    <tr><td>1</td><td>11</td><td>11 + 1</td><td>12 → answer (2 + 9 + 1)</td></tr>
  </table>
<div class="fx" data-lang="py">def rob_trace(nums):
    prev2, prev1 = 0, 0                 # best up to order i-2, i-1
    for x in nums:
        skip, take = prev1, prev2 + x
        prev2, prev1 = prev1, max(skip, take)   # skip x, or take x
        print(f"tip {x}: skip={skip:2}  take={take:2}  best={prev1}")
    return prev1

print("best tips:", rob_trace([2, 7, 9, 3, 1]))    # Ravi's street, 5 orders in a row

def rob(nums):
    prev2, prev1 = 0, 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1

for nums in [[1, 2, 3, 1], [5], [], [2, 1, 1, 2]]:
    print(nums, "-&gt;", rob(nums))</div>
  <div class="fx" data-lang="text">tip 2: skip= 0  take= 2  best=2
tip 7: skip= 2  take= 7  best=7
tip 9: skip= 7  take=11  best=11
tip 3: skip=11  take=10  best=11
tip 1: skip=11  take=12  best=12
best tips: 12
[1, 2, 3, 1] -&gt; 4
[5] -&gt; 5
[] -&gt; 0
[2, 1, 1, 2] -&gt; 4</div>
  <p>O(n) time, O(1) space (only the last two bests are read). <code>[2, 1, 1, 2]</code> catches the "take every other order" guess: the best is the two ends (2 + 2), skipping two in a row. Variant: orders around a roundabout (House Robber II) → run this twice, once without the first and once without the last.</p>
  <h3>Coin Change: try every last coin</h3>
  <p>Ravi must hand back ₹11 in change using coins ₹1, 2, 5. Fewest coins? State: <code>dp[a]</code> = fewest coins for amount a. Last coin was some c ≤ a: <code>dp[a] = min(dp[a − c] + 1)</code>. Base: <code>dp[0] = 0</code>; everything else starts at infinity ("not reachable yet").</p>
  <table class="tbl out"><caption>dp for coins [1, 2, 5], by hand: dp[a] = 1 + min(dp[a−1], dp[a−2], dp[a−5])</caption>
    <tr><th>a</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td></tr>
    <tr><th>dp[a]</th><td>0</td><td>1</td><td>1</td><td>2</td><td>2</td><td>1</td><td>2</td><td>2</td><td>3</td><td>3</td><td>2</td><td>3</td></tr>
  </table>
<div class="fx" data-lang="py">def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount           # dp[a] = fewest coins for amount a
    for a in range(1, amount + 1):
        for c in coins:
            if c &lt;= a and dp[a - c] + 1 &lt; dp[a]:
                dp[a] = dp[a - c] + 1   # use c as the last coin
    return dp

dp = coin_change([1, 2, 5], 11)          # Ravi gives Rs 11 change
print("a :", list(range(12)))
print("dp:", dp)
greedy_vs_dp = coin_change([1, 3, 4], 6)
print("coins [1,3,4], amount 6 -&gt; DP says", greedy_vs_dp[6], "(3+3); greedy 4+1+1 uses 3")</div>
  <div class="fx" data-lang="text">a : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
dp: [0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3]
coins [1,3,4], amount 6 -&gt; DP says 2 (3+3); greedy 4+1+1 uses 3</div>
  <p>dp[11] = 1 + min(dp[10], dp[9], dp[6]) = 1 + min(2, 3, 2) = 3 (5 + 5 + 1). The [1, 3, 4] case is the greedy-killer from section 01. Full code with edge cases is in section 14.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>1-D DP</strong>: one index (position, amount, length) describes the state; each cell reads a constant number of earlier cells (robber: O(n)) or scans a set of choices (coin change: O(amount × coins); LIS: O(n²)).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Wrong base value. Counting needs <code>dp[0] = 1</code>; min problems need <code>dp[0] = 0</code> and the rest infinity, not 0. Starting coin change with zeros makes every amount cost 0 coins.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>198 House Robber</b>, <b>213 House Robber II</b>, <b>746 Min Cost Climbing Stairs</b>, <b>740 Delete and Earn</b> (robber on values), <b>322 Coin Change</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: 2-D DP.</b> One index was enough because Ravi moved along a line. Across the city grid he moves east <em>and</em> south, and comparing his planned stops with his actual stops involves two positions at once. One number no longer describes "where we are".</div>

  <h2 id="dsa-dp-2d"><span class="num">06</span>2-D DP: Grid Paths and Two Sequences</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>From the kitchen (top-left) to a customer (bottom-right) Ravi rides only east or south. How many different routes are there, and which is quickest given each block's traffic minutes? And separately: how many of his 5 planned stops did he actually visit in order?</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"grid", "move only right / down", "matrix path", "minimum path sum", "two strings / two lists", "common subsequence", "match".</p>
  </div>
  <h3>Counting routes (Unique Paths)</h3>
  <p>Last move: he came from the north (above) or from the west (left). So the count for a block is the sum of those two blocks. The first row and first column have only one way in (straight along the edge).</p>
  <div class="flow"><span>State: dp[r][c] = routes to block (r, c)</span><span>dp[r][c] = dp[r−1][c] + dp[r][c−1]</span><span>Base: first row and column = 1</span><span>row by row; answer bottom-right</span></div>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600"><defs><marker id="dsa-dp-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><rect x="60" y="40" width="60" height="50" class="fv sb"/><text x="90" y="70" text-anchor="middle">1</text><rect x="120" y="40" width="60" height="50" class="fv sb"/><text x="150" y="70" text-anchor="middle">1</text><rect x="180" y="40" width="60" height="50" class="fv sb"/><text x="210" y="70" text-anchor="middle">1</text><rect x="240" y="40" width="60" height="50" class="fv sb"/><text x="270" y="70" text-anchor="middle">1</text><rect x="60" y="90" width="60" height="50" class="fv sb"/><text x="90" y="120" text-anchor="middle">1</text><rect x="120" y="90" width="60" height="50" class="ft st"/><text x="150" y="120" text-anchor="middle">2</text><rect x="180" y="90" width="60" height="50" class="fg sg"/><text x="210" y="120" text-anchor="middle">3</text><rect x="240" y="90" width="60" height="50" class="ft st"/><text x="270" y="120" text-anchor="middle">4</text><rect x="60" y="140" width="60" height="50" class="fv sb"/><text x="90" y="170" text-anchor="middle">1</text><rect x="120" y="140" width="60" height="50" class="fg sg"/><text x="150" y="170" text-anchor="middle">3</text><rect x="180" y="140" width="60" height="50" class="fr sr"/><text x="210" y="170" text-anchor="middle">6</text><rect x="240" y="140" width="60" height="50" class="ft st"/><text x="270" y="170" text-anchor="middle">10</text><text x="90" y="30" text-anchor="middle" class="tb">kitchen</text><text x="270" y="208" text-anchor="middle" class="tb">customer</text><line x1="210" y1="128" x2="210" y2="152" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a2)"/><line x1="162" y1="165" x2="196" y2="165" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a2)"/><text x="340" y="60">Ravi rides only → or ↓</text><text x="340" y="90" class="tr">dp[r][c] = dp[r-1][c] + dp[r][c-1]</text><text x="340" y="112" class="tm">from the north   from the west</text><text x="340" y="142">6 = 3 (north) + 3 (west)</text><text x="340" y="172" class="tm">purple edge blocks = 1 way</text><text x="340" y="192" class="tm">(ride straight along the edge)</text></svg><figcaption>Unique Paths on a 3 × 4 block grid. Every block is the sum of the block above and the block to its left, so filling row by row always has both ready. The bottom-right block (10) is the answer.</figcaption></figure>
<div class="fx" data-lang="py">def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]          # first row and column: 1 way
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # from the north + from the west
    return dp

for row in unique_paths(3, 4):               # kitchen top-left, customer bottom-right
    print(row)
print("3x7 grid:", unique_paths(3, 7)[-1][-1], "| 1x1:", unique_paths(1, 1)[-1][-1])</div>
  <div class="fx" data-lang="text">[1, 1, 1, 1]
[1, 2, 3, 4]
[1, 3, 6, 10]
3x7 grid: 28 | 1x1: 1</div>
  <p>Bonus: the answer is also C(m+n−2, m−1) (choose which of the 5 moves are "south": C(5, 2) = 10), but the DP version survives road closures, costs and other twists; the formula does not.</p>
  <h3>Quickest route (Minimum Path Sum), by hand</h3>
  <p>Same shape with <code>min</code> instead of <code>+</code> and the block's own minutes added: <code>dp[r][c] = min(north, west) + traffic[r][c]</code>.</p>
  <table class="tbl out"><caption>traffic minutes → dp (quickest minutes to reach each block)</caption>
    <tr><th>traffic</th><th>c0</th><th>c1</th><th>c2</th><th></th><th>dp</th><th>c0</th><th>c1</th><th>c2</th></tr>
    <tr><th>r0</th><td>1</td><td>3</td><td>1</td><td></td><th>r0</th><td>1</td><td>1+3 = 4</td><td>4+1 = 5</td></tr>
    <tr><th>r1</th><td>1</td><td>5</td><td>1</td><td></td><th>r1</th><td>1+1 = 2</td><td>min(4, 2)+5 = 7</td><td>min(5, 7)+1 = 6</td></tr>
    <tr><th>r2</th><td>4</td><td>2</td><td>1</td><td></td><th>r2</th><td>2+4 = 6</td><td>min(7, 6)+2 = 8</td><td>min(6, 8)+1 = <b>7</b></td></tr>
  </table>
<div class="fx" data-lang="py">def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]    # dp[r][c] = quickest minutes to reach (r, c)
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[0][0]
            elif r == 0:
                dp[r][c] = dp[r][c - 1] + grid[r][c]          # only from the west
            elif c == 0:
                dp[r][c] = dp[r - 1][c] + grid[r][c]          # only from the north
            else:
                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
    return dp

traffic = [[1, 3, 1],                         # minutes to cross each block
           [1, 5, 1],
           [4, 2, 1]]
for row in min_path_sum(traffic):
    print(row)
for g in [[[1, 2, 3], [4, 5, 6]], [[7]], [[1], [2], [3]]]:
    print(g, "-&gt;", min_path_sum(g)[-1][-1])</div>
  <div class="fx" data-lang="text">[1, 4, 5]
[2, 7, 6]
[6, 8, 7]
[[1, 2, 3], [4, 5, 6]] -&gt; 12
[[7]] -&gt; 7
[[1], [2], [3]] -&gt; 6</div>
  <p>7 minutes: 1 → 3 → 1 → 1 → 1 (east, east, south, south). The first row and column are special because they have only one neighbour to come from; the single-cell and single-column grids test exactly that.</p>
  <h3>Two sequences: Longest Common Subsequence, by hand</h3>
  <p>Ravi's plan for the evening was stops A B C D E; the GPS log shows he visited A C E. How many planned stops did he visit in the planned order? That is the longest sequence appearing in both, in order, gaps allowed: the LCS. (This is how <code>diff</code> finds unchanged lines.)</p>
  <p>The state is a pair of prefix lengths: <code>dp[i][j]</code> = LCS of the first i planned stops and the first j visited stops. Look at the last stops <code>a[i−1]</code> and <code>b[j−1]</code>: equal → both are in the LCS, go diagonally: <code>dp[i−1][j−1] + 1</code>; different → drop one from either side: <code>max(dp[i−1][j], dp[i][j−1])</code>. Row 0 and column 0 are the empty prefix: 0.</p>
  <table class="tbl out"><caption>LCS table, filled row by row (bold = a match, diagonal + 1)</caption>
    <tr><th></th><th>∅</th><th>A</th><th>C</th><th>E</th></tr>
    <tr><th>∅</th><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><th>A</th><td>0</td><td><b>1</b> (A = A: 0 + 1)</td><td>1</td><td>1</td></tr>
    <tr><th>B</th><td>0</td><td>1</td><td>1</td><td>1</td></tr>
    <tr><th>C</th><td>0</td><td>1</td><td><b>2</b> (C = C: 1 + 1)</td><td>2</td></tr>
    <tr><th>D</th><td>0</td><td>1</td><td>2</td><td>2</td></tr>
    <tr><th>E</th><td>0</td><td>1</td><td>2</td><td><b>3</b> (E = E: 2 + 1)</td></tr>
  </table>
<div class="fx" data-lang="py">def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[i][j] = LCS of a[:i], b[:j]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1          # match: diagonal + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # drop one char
    out, i, j = [], m, n                 # walk back to rebuild one LCS
    while i and j:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1]); i -= 1; j -= 1
        elif dp[i - 1][j] &gt;= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dp, "".join(reversed(out))

planned, actual = "ABCDE", "ACE"                 # stops on the plan vs stops visited
dp, common = lcs(planned, actual)
print("     ∅  " + "  ".join(actual))
for ch, row in zip("∅" + planned, dp):
    print(ch, row)
print("LCS =", dp[-1][-1], common)
for a, b in [("abc", "abc"), ("abc", "def"), ("", "x"), ("AGGTAB", "GXTXAYB")]:
    d, s = lcs(a, b)
    print(repr(a), repr(b), "-&gt;", d[-1][-1], repr(s))</div>
  <div class="fx" data-lang="text">     ∅  A  C  E
∅ [0, 0, 0, 0]
A [0, 1, 1, 1]
B [0, 1, 1, 1]
C [0, 1, 2, 2]
D [0, 1, 2, 2]
E [0, 1, 2, 3]
LCS = 3 ACE
'abc' 'abc' -&gt; 3 'abc'
'abc' 'def' -&gt; 0 ''
'' 'x' -&gt; 0 ''
'AGGTAB' 'GXTXAYB' -&gt; 4 'GTAB'</div>
  <p>O(m·n) time and space. Rebuilding the actual sequence needs the full table: walk back from <code>dp[m][n]</code>, going diagonal on a match, else towards the bigger neighbour.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>2-D DP</strong>: the state has two indexes, either a position (r, c) in a grid or a pair of prefix lengths (i, j) of two sequences. Each cell reads its north, west and/or diagonal neighbour, so row-by-row filling works. <strong>O(rows × cols)</strong> time and space.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: index shift</span>
    <p>The sequence table has one extra row and column for the empty prefix, so <code>dp[i][j]</code> talks about <code>a[i-1]</code> and <code>b[j-1]</code>. Writing <code>a[i] == b[j]</code> is the classic off-by-one here.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>62 Unique Paths</b>, <b>63 Unique Paths II</b> (road closures), <b>64 Minimum Path Sum</b>, <b>1143 Longest Common Subsequence</b>, <b>583 Delete Operation for Two Strings</b> (LCS in disguise).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Knapsack.</b> In the grid every block was visited in a fixed order. Now Ravi's bag holds only 4 kg and three orders wait: which to take? The state must remember both "which orders have I considered" and "how much room is left", and each order can be taken at most once.</div>

  <h2 id="dsa-dp-knap"><span class="num">07</span>Knapsack</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Three orders: 1 kg (tip ₹15), 3 kg (₹20), 4 kg (₹30). Ravi's bag holds 4 kg. Which orders should he carry for the most tips? Greedy by tip takes the 4 kg order alone (₹30) and is wrong.</p>
  </div>
  <p>State: <code>dp[i][w]</code> = best tips using only the first i orders with a bag of w kg. For order i (weight wt, tip val), the last decision is skip it (<code>dp[i−1][w]</code>) or take it once (<code>dp[i−1][w − wt] + val</code>, only if it fits). Base: no orders → 0 for every w.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"capacity / budget / weight limit", "pick items", "subset sums to target", "partition into two equal sums", "each item at most once" (0/1) or "unlimited supply" (unbounded), "number of ways to make amount".</p>
  </div>
  <div class="flow"><span>dp[i][w] = dp[i−1][w]</span><span>if wt ≤ w: max(…, dp[i−1][w − wt] + val)</span><span>row 0 = 0</span><span>answer dp[n][cap]</span></div>
  <h3>The 0/1 table, by hand</h3>
  <table class="tbl out"><caption>dp[i][w]: rows = orders considered, columns = bag size</caption>
    <tr><th>orders</th><th>w=0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>
    <tr><th>none</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><th>+ 1 kg / ₹15</th><td>0</td><td>15</td><td>15</td><td>15</td><td>15</td></tr>
    <tr><th>+ 3 kg / ₹20</th><td>0</td><td>15</td><td>15</td><td>max(15, 0+20) = 20</td><td>max(15, dp[1][1]+20 = 35) = <b>35</b></td></tr>
    <tr><th>+ 4 kg / ₹30</th><td>0</td><td>15</td><td>15</td><td>20</td><td>max(35, dp[2][0]+30 = 30) = <b>35</b></td></tr>
  </table>
<div class="fx" data-lang="py">def knapsack_table(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]   # dp[i][w]: first i orders, bag w kg
    for i in range(1, n + 1):
        wt, val = weights[i - 1], values[i - 1]
        for w in range(cap + 1):
            dp[i][w] = dp[i - 1][w]                          # skip order i
            if wt &lt;= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt] + val)   # take it once
    return dp

W, V = [1, 3, 4], [15, 20, 30]          # order weights (kg) and tips (Rs); bag holds 4 kg
dp = knapsack_table(W, V, 4)
print("w:      ", list(range(5)))
for i, row in enumerate(dp):
    label = "none" if i == 0 else f"+{W[i-1]}kg/{V[i-1]}"
    print(f"{label:8}", row)
print("best tips:", dp[-1][-1])</div>
  <div class="fx" data-lang="text">w:       [0, 1, 2, 3, 4]
none     [0, 0, 0, 0, 0]
+1kg/15  [0, 15, 15, 15, 15]
+3kg/20  [0, 15, 15, 20, 35]
+4kg/30  [0, 15, 15, 20, 35]
best tips: 35</div>
  <p>₹35 = the 1 kg order (15) + the 3 kg order (20). The tempting 4 kg order (30) fills the bag alone. Each cell reads only the row above, which is what "each order at most once" means.</p>
  <h3>One row, and the loop direction</h3>
  <p>Since each row reads only the previous row, keep a single row <code>dp[w]</code> and update it in place, one order at a time. The direction of the w loop then decides which problem you solve. <strong>Unbounded</strong> knapsack (unlimited copies of each item, like coins) differs only in that direction:</p>
<div class="fx" data-lang="py">def knapsack_01(weights, values, cap):
    dp = [0] * (cap + 1)                      # dp[w] = best value with capacity w
    for wt, val in zip(weights, values):
        for w in range(cap, wt - 1, -1):      # RIGHT to LEFT: each item once
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[cap]

def knapsack_unbounded(weights, values, cap):
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):
        for w in range(wt, cap + 1):          # LEFT to RIGHT: item reusable
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[cap]

W, V = [1, 3, 4], [15, 20, 30]
print(knapsack_01(W, V, 4), knapsack_unbounded(W, V, 4))</div>
  <div class="fx" data-lang="text">35 60</div>
  <p>0/1 answer 35; unbounded answer 60 = the 1 kg order four times (4 × 15), as if the restaurant had unlimited copies of it.</p>
  <div class="callout intu"><span class="label">Key insight: the loop direction is the whole difference</span>
    <p>With one row, <code>dp[w - wt]</code> on the right side is either the <em>old</em> value (this item not yet used) or the <em>new</em> value (this item already used). Going right to left, <code>dp[w - wt]</code> has not been updated yet in this round, so the item is used at most once: it is the 2-D table's "row above". Going left to right, it may already include this item, so the item can be reused. Same code, one reversed range.</p>
  </div>
  <h3>Counting with knapsack: combinations vs orderings</h3>
  <p><strong>Coin Change II</strong> counts the <em>combinations</em> of coins that make an amount. Coins outer loop, amount inner loop: each combination is counted once, in coin order. Swap the loops and you count <em>orderings</em> (1+2 and 2+1 twice), which is a different problem (Combination Sum IV).</p>
<div class="fx" data-lang="py">def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1                                 # one way to make 0: take nothing
    for coin in coins:                        # coins OUTER -&gt; combinations
        for a in range(coin, amount + 1):
            dp[a] += dp[a - coin]
    return dp[amount]

def change_orderings(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for a in range(1, amount + 1):            # amount OUTER -&gt; orderings
        for coin in coins:
            if coin &lt;= a:
                dp[a] += dp[a - coin]
    return dp[amount]

print(change(5, [1, 2, 5]), change_orderings(5, [1, 2, 5]))</div>
  <div class="fx" data-lang="text">4 9</div>
  <p>₹5 from [1, 2, 5]: 4 combinations (5; 2+2+1; 2+1+1+1; 1×5) but 9 orderings. Partition Equal Subset Sum (section 14) is the same 0/1 loop with "is this sum reachable?" as the value.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>0/1 knapsack</strong>: dp[i][w] = max(dp[i−1][w], dp[i−1][w − wt<sub>i</sub>] + val<sub>i</sub>); <strong>O(n × W)</strong> time, O(n × W) space or O(W) with one row looped right to left. <strong>Unbounded</strong>: one row looped left to right. This is "pseudo-polynomial": it depends on the number W, not on its number of digits.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: loop direction in 1-row knapsack</span>
    <p>0/1 (each item once): capacity from high to low. Unbounded (reuse allowed): low to high. Getting it backwards silently changes which problem you solve: Partition on [1] with target 2 would "reach" 2 by using the 1 twice.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>416 Partition Equal Subset Sum</b> (0/1, yes/no), <b>494 Target Sum</b> (0/1, count), <b>518 Coin Change II</b> (unbounded, combinations), <b>377 Combination Sum IV</b> (orderings).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: String DP.</b> LCS compared two sequences but could only keep or drop characters. A customer types "sambr" into the search box; to match it to "samosa" we also need to <em>replace</em> and <em>insert</em>, each costing one edit.</div>

  <h2 id="dsa-dp-str"><span class="num">08</span>String DP: Edit Distance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How many single-character edits (insert, delete, replace) turn the typed "sambr" into the menu's "samosa"? Biteful's search ranks suggestions by this number, so it must be the true minimum, not a guess.</p>
  </div>
  <p>State: <code>dp[i][j]</code> = fewest edits to turn the first i typed characters into the first j menu characters. Look at the last characters. Equal → no edit needed: <code>dp[i−1][j−1]</code>. Different → one edit plus the best of: delete the typed char (<code>dp[i−1][j]</code>), insert the menu char (<code>dp[i][j−1]</code>), replace one by the other (<code>dp[i−1][j−1]</code>). Base: turning i chars into nothing takes i deletes (<code>dp[i][0] = i</code>); nothing into j chars takes j inserts (<code>dp[0][j] = j</code>).</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"convert word1 to word2", "minimum operations / edits", "one edit away", "distinct subsequences", "interleaving", "wildcard / regex matching", two strings and a cost.</p>
  </div>
  <div class="flow"><span>equal: dp[i−1][j−1]</span><span>else 1 + min(delete dp[i−1][j], insert dp[i][j−1], replace dp[i−1][j−1])</span><span>row/col 0 = i / j</span></div>
  <table class="tbl out"><caption>"sambr" (rows) → "samosa" (columns), filled by hand</caption>
    <tr><th></th><th>∅</th><th>s</th><th>a</th><th>m</th><th>o</th><th>s</th><th>a</th></tr>
    <tr><th>∅</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
    <tr><th>s</th><td>1</td><td><b>0</b></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><th>a</th><td>2</td><td>1</td><td><b>0</b></td><td>1</td><td>2</td><td>3</td><td>4</td></tr>
    <tr><th>m</th><td>3</td><td>2</td><td>1</td><td><b>0</b></td><td>1</td><td>2</td><td>3</td></tr>
    <tr><th>b</th><td>4</td><td>3</td><td>2</td><td>1</td><td><b>1</b> replace b→o</td><td>2</td><td>3</td></tr>
    <tr><th>r</th><td>5</td><td>4</td><td>3</td><td>2</td><td>2</td><td><b>2</b> replace r→s</td><td><b>3</b> insert a</td></tr>
  </table>
<div class="fx" data-lang="py">def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[i][j] = cost a[:i] -&gt; b[:j]
    for i in range(m + 1):
        dp[i][0] = i                    # delete all i chars
    for j in range(n + 1):
        dp[0][j] = j                    # insert all j chars
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]              # same char: free
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],         # delete a[i-1]
                                   dp[i][j - 1],         # insert b[j-1]
                                   dp[i - 1][j - 1])     # replace
    return dp

typed, dish = "sambr", "samosa"          # what the customer typed vs the menu item
dp = min_distance(typed, dish)
print("   ∅ " + " ".join(dish))
for ch, row in zip("∅" + typed, dp):
    print(ch, row)
print("edits:", dp[-1][-1])
for a, b in [("horse", "ros"), ("intention", "execution"), ("", "abc"), ("same", "same"), ("kitten", "sitting")]:
    print(repr(a), repr(b), "-&gt;", min_distance(a, b)[-1][-1])</div>
  <div class="fx" data-lang="text">   ∅ s a m o s a
∅ [0, 1, 2, 3, 4, 5, 6]
s [1, 0, 1, 2, 3, 4, 5]
a [2, 1, 0, 1, 2, 3, 4]
m [3, 2, 1, 0, 1, 2, 3]
b [4, 3, 2, 1, 1, 2, 3]
r [5, 4, 3, 2, 2, 2, 3]
edits: 3
'horse' 'ros' -&gt; 3
'intention' 'execution' -&gt; 5
'' 'abc' -&gt; 3
'same' 'same' -&gt; 0
'kitten' 'sitting' -&gt; 3</div>
  <p>The bold path is one optimal edit script: "sam" matches for free, replace b → o, replace r → s, insert a: 3 edits. The classic horse → ros (3) and kitten → sitting (3) agree with the textbook values.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>edit (Levenshtein) distance</strong> between strings a and b is the fewest inserts, deletes and replaces turning a into b. DP over prefix pairs: <strong>O(m·n)</strong> time, O(m·n) space (O(n) with two rows if only the number is needed).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Leaving the base row and column at 0. Then turning "" into "abc" costs 0, and every cell built on them is too small. The base is "i deletes" / "j inserts", not "nothing".</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>72 Edit Distance</b>, <b>115 Distinct Subsequences</b> (count, not cost), <b>97 Interleaving String</b> (yes/no on two prefixes).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Interval DP.</b> Prefix states grow from the left. Some problems are about a slice in the middle: "is s[l..r] a palindrome?", "best score for the balloons strictly between l and r?", where a choice inside the slice changes both of its sides.</div>

  <h2 id="dsa-dp-interval"><span class="num">09</span>Interval DP</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When the answer for a range l..r depends on what happens <em>inside</em> it (which element is taken, where it is split), prefixes do not describe the subproblem. What state does, and in what order can we fill it?</p>
  </div>
  <p>The state is a slice <code>dp[l][r]</code>. A slice depends on <em>shorter</em> slices inside it, so fill by length: all length-1, then length-2, and so on.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"palindrome substring / subsequence", "burst", "merge stones", "split the range", "minimum cost to cut", "two players take from either end".</p>
  </div>
  <div class="flow"><span>State: dp[l][r] for the slice l..r</span><span>try every split / last choice k in l..r</span><span>fill by increasing length</span><span>answer dp[0][n−1]</span></div>
  <h3>Longest Palindromic Substring</h3>
  <p>s[l..r] is a palindrome if the ends match and s[l+1..r−1] is one. That DP is O(n²) time and space; in practice the simpler "expand around centre" (each centre grows outward while the ends match) is also O(n²) but O(1) space, and is what interviewers expect.</p>
<div class="fx" data-lang="py">def longest_palindrome(s):
    best = ""
    for center in range(len(s)):
        for lo, hi in ((center, center), (center, center + 1)):   # odd, even length
            while lo &gt;= 0 and hi &lt; len(s) and s[lo] == s[hi]:
                lo -= 1                       # grow while both ends match
                hi += 1
            if hi - lo - 1 &gt; len(best):
                best = s[lo + 1:hi]
    return best

for s in ["babad", "cbbd", "a", "", "forgeeksskeegfor"]:
    print(repr(s), "-&gt;", repr(longest_palindrome(s)))</div>
  <div class="fx" data-lang="text">'babad' -&gt; 'bab'
'cbbd' -&gt; 'bb'
'a' -&gt; 'a'
'' -&gt; ''
'forgeeksskeegfor' -&gt; 'geeksskeeg'</div>
  <h3>Burst Balloons: choose the LAST one</h3>
  <p>Bursting balloon k earns <code>left × k × right</code> with its current neighbours. Thinking "which balloon do I burst <em>first</em>?" fails: the neighbours change and the two sides get tangled. The trick is to ask "which balloon in (l, r) bursts <em>last</em>?" If k is last, its neighbours at that moment are exactly l and r (everything between is gone), and the left part (l, k) and right part (k, r) are independent.</p>
<div class="fx" data-lang="py">def max_coins(nums):
    a = [1] + nums + [1]                      # padding: imaginary 1s at both ends
    n = len(a)
    dp = [[0] * n for _ in range(n)]          # dp[l][r]: best for balloons strictly between l and r
    for gap in range(2, n):                   # short intervals first
        for l in range(0, n - gap):
            r = l + gap
            for k in range(l + 1, r):         # k = LAST balloon burst in (l, r)
                dp[l][r] = max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r])
    return dp[0][n - 1]

print(max_coins([3, 1, 5, 8]), max_coins([1, 5]), max_coins([]))</div>
  <div class="fx" data-lang="text">167 10 0</div>
  <p>[3, 1, 5, 8] → 167 (burst 1, 5, 3, 8: 3·1·5 + 3·5·8 + 1·3·8 + 1·8·1 = 15 + 120 + 24 + 8). O(n³) time, O(n²) space. The "last, not first" flip is the reusable idea: it is how you make interval subproblems independent.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Interval DP</strong>: state dp[l][r] over contiguous slices, recurrence over a split point or last choice k inside the slice, filled in order of increasing length. Typically O(n²) states × O(n) choices = <strong>O(n³)</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Filling row by row (l = 0, 1, 2 …) instead of by length. dp[0][4] needs dp[1][4], which a row-by-row loop has not computed yet. Loop over the gap/length first.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>5 Longest Palindromic Substring</b>, <b>516 Longest Palindromic Subsequence</b>, <b>877 Stone Game</b>, <b>312 Burst Balloons</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: DP on Trees.</b> Lines and slices can be filled with loops. Biteful's delivery hubs form a tree (city hub → area hubs → local hubs). There is no left-to-right order to fill, yet the "take it or skip it" choice from House Robber is back.</div>

  <h2 id="dsa-dp-tree"><span class="num">10</span>DP on Trees</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful wants to run a promotion in some hubs. A hub and its direct sub-hub must not both run it (they would split the same customers). Each hub's number is the extra orders it would bring. Which hubs maximise the total? The hubs form a tree, so there is no array to fill.</p>
  </div>
  <p>Use the <a class="xref" data-note="dsa_trees">Trees</a> note's post-order DFS (children first). Each node returns <strong>two</strong> numbers to its parent: the best for its subtree if it <em>uses</em> the promo, and if it <em>skips</em> it. The parent combines them: using a node forces both children to skip; skipping it lets each child take its better option.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"binary tree" + "no two adjacent", "maximum path sum", "diameter", "cameras to cover all nodes", "count subtrees with…"; any tree question where a node's answer depends on its children's answers under a few states.</p>
  </div>
  <div class="flow"><span>use node = val + skip(left) + skip(right)</span><span>skip node = best(left) + best(right)</span><span>answer = max of the root's pair</span></div>
  <table class="tbl out"><caption>Hub tree [3, 4, 5, 1, 3, None, 1]: root 3 → hubs 4 and 5; 4 → 1 and 3; 5 → 1. Bottom-up by hand:</caption>
    <tr><th>hub (value)</th><th>children's pairs (use, skip)</th><th>use</th><th>skip</th></tr>
    <tr><td>leaf 1 (under 4)</td><td>–</td><td>1</td><td>0</td></tr>
    <tr><td>leaf 3 (under 4)</td><td>–</td><td>3</td><td>0</td></tr>
    <tr><td>4</td><td>(1, 0), (3, 0)</td><td>4 + 0 + 0 = 4</td><td>1 + 3 = 4</td></tr>
    <tr><td>leaf 1 (under 5)</td><td>–</td><td>1</td><td>0</td></tr>
    <tr><td>5</td><td>(1, 0)</td><td>5 + 0 = 5</td><td>1</td></tr>
    <tr><td>root 3</td><td>(4, 4), (5, 1)</td><td>3 + 4 + 1 = 8</td><td>max(4,4) + max(5,1) = 9</td></tr>
  </table>
<div class="fx" data-lang="py">class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def rob_tree(root):
    def go(node):                       # returns (best if we USE node, best if we SKIP node)
        if not node:
            return 0, 0
        l_use, l_skip = go(node.left)   # children first (post-order)
        r_use, r_skip = go(node.right)
        use_it = node.val + l_skip + r_skip                 # children must be skipped
        skip_it = max(l_use, l_skip) + max(r_use, r_skip)   # children free to choose
        print(f"zone {node.val}: use={use_it}  skip={skip_it}")
        return use_it, skip_it
    return max(go(root))

def build(vals):                        # level-order list with None -&gt; tree
    if not vals or vals[0] is None:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in vals]
    kids = iter(nodes[1:])
    for nd in nodes:
        if nd:
            nd.left = next(kids, None)
            nd.right = next(kids, None)
    return nodes[0]

print("best:", rob_tree(build([3, 4, 5, 1, 3, None, 1])))</div>
  <div class="fx" data-lang="text">zone 1: use=1  skip=0
zone 3: use=3  skip=0
zone 4: use=4  skip=4
zone 1: use=1  skip=0
zone 5: use=5  skip=1
zone 3: use=8  skip=9
best: 9</div>
  <p>Best 9: skip the root, use hubs 4 and 5. More cases (the build helper is the same as above, hidden):</p>
<div class="fx" data-lang="py">for vals in [[3, 2, 3, None, 3, None, 1], [], [7], [4, 1, None, 2, None, 3]]:
    print(vals, "-&gt;", rob_tree(build(vals)))</div>
  <div class="fx" data-lang="text">[3, 2, 3, None, 3, None, 1] -&gt; 7
[] -&gt; 0
[7] -&gt; 7
[4, 1, None, 2, None, 3] -&gt; 7</div>
  <p>O(n) time, O(h) recursion stack. The chain 4-1-2-3 shows "use every other level" is wrong: the best is 4 + 3, skipping two levels in the middle. A plain memo on nodes (<code>@cache</code> on <code>rob(node)</code> calling grandchildren) also works, but the pair-return is cleaner and needs no cache.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tree DP</strong>: each node's answer is computed from its children's answers in a post-order traversal; the "state" is the node plus a small flag (used/skipped, covered/not), returned as a tuple. Every node is processed once: <strong>O(n)</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Returning a single number (the best) instead of the pair. The parent then cannot tell whether a child's best already used the child, and the "no two adjacent" rule is lost.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>337 House Robber III</b>, <b>968 Binary Tree Cameras</b> (three states per node), <b>2246 Longest Path With Different Adjacent Characters</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bitmask DP.</b> Every state so far was an index or two. Ravi's last job of the shift: start at the kitchen, serve three customers in any order, come back, in the fewest minutes. "Where am I" is not enough; the state must also remember <em>which</em> customers are already served.</div>

  <h2 id="dsa-dp-bitmask"><span class="num">11</span>Bitmask DP</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Kitchen 0, customers 1, 2, 3, with the minutes between every pair. What is the shortest round trip that serves everyone? Trying every order is (n−1)!; for 15 places that is 87 billion orders.</p>
  </div>
  <p>The future only depends on two things: which places are already visited, and where Ravi stands now. Store the visited set as the bits of an integer (see <a class="xref" data-note="dsa_bits">Bit Manipulation</a>): bit j is 1 if place j is visited. <code>mask | (1 &lt;&lt; j)</code> adds j, <code>mask &amp; (1 &lt;&lt; j)</code> tests it. With n ≤ 20 there are at most 2ⁿ × n states.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>n ≤ 20 (a strong hint), "visit all", "assign each worker one job", "every subset of items", "shortest superstring", "partition into work sessions".</p>
  </div>
  <div class="flow"><span>State: (mask = visited set, i = current place)</span><span>go(mask, i) = min over unvisited j of dist[i][j] + go(mask | 1&lt;&lt;j, j)</span><span>all visited: dist[i][0]</span><span>answer go(1, 0)</span></div>
  <table class="tbl out"><caption>Minutes between places (0 = kitchen)</caption>
    <tr><th></th><th>0</th><th>1</th><th>2</th><th>3</th></tr>
    <tr><th>0</th><td>0</td><td>10</td><td>15</td><td>20</td></tr>
    <tr><th>1</th><td>10</td><td>0</td><td>35</td><td>25</td></tr>
    <tr><th>2</th><td>15</td><td>35</td><td>0</td><td>30</td></tr>
    <tr><th>3</th><td>20</td><td>25</td><td>30</td><td>0</td></tr>
  </table>
  <p>By hand, the three essentially different round trips (each also has a mirror image): 0→1→2→3→0 = 10 + 35 + 30 + 20 = 95; 0→1→3→2→0 = 10 + 25 + 30 + 15 = <b>80</b>; 0→2→1→3→0 = 15 + 35 + 25 + 20 = 95.</p>
<div class="fx" data-lang="py">from functools import cache
from itertools import permutations

def tsp(dist):
    n = len(dist)
    @cache
    def go(mask, i):                          # visited set = mask, standing at place i
        if mask == (1 &lt;&lt; n) - 1:
            return dist[i][0]                 # everyone served: ride back to the kitchen
        best = float("inf")
        for j in range(n):
            if not mask &amp; (1 &lt;&lt; j):           # j not visited yet
                best = min(best, dist[i][j] + go(mask | (1 &lt;&lt; j), j))
        return best
    ans = go(1, 0)                            # start at the kitchen (0), only 0 visited
    return ans, go.cache_info().currsize

D = [[0, 10, 15, 20],                         # minutes: kitchen 0, customers 1, 2, 3
     [10, 0, 35, 25],
     [15, 35, 0, 30],
     [20, 25, 30, 0]]
best, states = tsp(D)
print("shortest round trip:", best, "minutes | states solved:", states)
brute = min(D[0][p[0]] + sum(D[a][b] for a, b in zip(p, p[1:])) + D[p[-1]][0]
            for p in permutations([1, 2, 3]))
print("brute force over all 3! orders:", brute)
mask = 0b1011                                 # bits 0, 1, 3 set: kitchen, customers 1 and 3 done
print(mask, "-&gt;", [j for j in range(4) if mask &amp; (1 &lt;&lt; j)], "| add customer 2:", bin(mask | (1 &lt;&lt; 2)))</div>
  <div class="fx" data-lang="text">shortest round trip: 80 minutes | states solved: 13
brute force over all 3! orders: 80
11 -&gt; [0, 1, 3] | add customer 2: 0b1111</div>
  <p>Only 13 (mask, place) states were ever solved. The win grows fast: 2ⁿ × n states × n work = O(2ⁿ n²). For n = 15 that is about 7 million steps instead of 87 billion orders.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bitmask DP</strong> uses an integer's bits as a set in the state (dp[mask][i]). Feasible when n ≤ ~20. Travelling Salesman: <strong>O(2ⁿ · n²)</strong> time, O(2ⁿ · n) space.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>mask &amp; (1 &lt;&lt; j)</code> is not 0/1: for mask 0b1011 and j = 3 it is 8. Test it as true/false (<code>if mask &amp; (1 &lt;&lt; j)</code>) or use <code>(mask &gt;&gt; j) &amp; 1</code>; never compare it with 1. And start from mask 1 (kitchen already visited), not 0, or the route may "visit" the kitchen as a customer. (Python's <code>&amp;</code> binds tighter than <code>==</code>; in C and Java it does not, so parenthesise anyway.)</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>1986 Minimum Number of Work Sessions to Finish the Tasks</b>, <b>464 Can I Win</b>, <b>943 Find the Shortest Superstring</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Space Optimisation.</b> The tables are getting large (2ⁿ × n, or m × n for two long strings). Many cells are read once and never again. Which ones can we throw away?</div>

  <h2 id="dsa-dp-space"><span class="num">12</span>Space Optimisation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Fibonacci keeps n + 1 cells but each step reads only two. The grid keeps every row but each row reads only the one above. Can we keep just what the recurrence reads?</p>
  </div>
  <p>Look at what the loop <em>reads</em>. Climbing stairs and Fibonacci read only <code>dp[i-1]</code> and <code>dp[i-2]</code>: keep two variables, O(n) space becomes O(1). If row r reads only row r−1 (grids, knapsack, LCS, edit distance), keep one or two rows: O(rows × cols) becomes O(cols).</p>
  <div class="flow"><span>write the full table first</span><span>list what each cell reads</span><span>keep only those rows/values</span><span>watch the update order</span></div>
<div class="fx" data-lang="py">def fib_two_vars(n):
    a, b = 0, 1                  # a = fib(i), b = fib(i+1)
    for _ in range(n):
        a, b = b, a + b          # slide the window one step right
    return a

def unique_paths_1row(m, n):     # one row instead of m rows
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1] # old row[c] = from the north, row[c-1] = new west
    return row[-1]

def lcs_len_2rows(a, b):         # only the previous row is ever read
    prev = [0] * (len(b) + 1)
    for i in range(1, len(a) + 1):
        cur = [0] * (len(b) + 1)
        for j in range(1, len(b) + 1):
            cur[j] = prev[j - 1] + 1 if a[i - 1] == b[j - 1] else max(prev[j], cur[j - 1])
        prev = cur
    return prev[-1]

print([fib_two_vars(i) for i in range(10)])
print(unique_paths_1row(3, 4), unique_paths_1row(3, 7), lcs_len_2rows("ABCDE", "ACE"))</div>
  <div class="fx" data-lang="text">[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
10 28 3</div>
  <p>Same answers as the full tables: Fibonacci, 10 and 28 routes, LCS 3 for ABCDE/ACE. In the one-row grid, <code>row[c]</code> still holds the value from the row above (north) when we read it, and <code>row[c-1]</code> was just updated in this row (west): exactly the two cells the 2-D recurrence needs.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Rolling arrays</strong>: when dp[i] depends only on dp[i−1] (and maybe dp[i−2]), store only those layers. Space drops by a factor of the number of rows; time is unchanged. You lose the ability to walk back and rebuild the actual answer (the LCS string, the chosen orders).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Write the full-table version first, get it correct, then shrink it. Shrinking first is where in-place bugs hide (reading a value you just overwrote, like the knapsack direction, or the diagonal in edit distance, which needs a temp). In an interview, say "this can drop to O(n) space" and only do it if asked.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>746 Min Cost Climbing Stairs</b> (two variables), <b>63 Unique Paths II</b> (one row with obstacles).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing the Family.</b> We have seen eight shapes of state. Facing a new problem, which one is it? The words in the problem usually say.</div>

  <h2 id="dsa-dp-patterns"><span class="num">13</span>Choosing the Family</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Hundreds of DP questions fall into a handful of shapes. Which words point to which state, and is there a shape we have not met yet?</p>
  </div>
  <table class="tbl">
    <tr><th>Family</th><th>Signal words</th><th>Typical state</th><th>Section · examples</th></tr>
    <tr><td>1-D / linear</td><td>"array", "steps", "houses", "ways to reach"</td><td><code>dp[i]</code> = answer for first i items / ending at i</td><td>04, 05 · Stairs, House Robber, Coin Change, LIS, Word Break</td></tr>
    <tr><td>Grid</td><td>"robot", "move right or down", "matrix path"</td><td><code>dp[r][c]</code> = answer to reach cell (r, c)</td><td>06 · Unique Paths, Min Path Sum, Maximal Square</td></tr>
    <tr><td>Two sequences</td><td>"two strings", "subsequence", "convert / edit"</td><td><code>dp[i][j]</code> on prefixes <code>a[:i]</code>, <code>b[:j]</code></td><td>06, 08 · LCS, Edit Distance, Distinct Subsequences</td></tr>
    <tr><td>Knapsack</td><td>"capacity", "subset sums to", "pick items, budget"</td><td><code>dp[w]</code> = best with capacity w</td><td>07 · Partition Equal Subset, Target Sum, Coin Change II</td></tr>
    <tr><td>Interval</td><td>"burst", "merge stones", "palindrome", "split range"</td><td><code>dp[l][r]</code> = answer for slice l..r</td><td>09 · Burst Balloons, Longest Palindromic Subsequence</td></tr>
    <tr><td>Tree</td><td>"binary tree", "no two adjacent nodes"</td><td>each node returns a small tuple</td><td>10 · House Robber III, Binary Tree Cameras</td></tr>
    <tr><td>Bitmask</td><td>n ≤ 20, "visit all", "assign each"</td><td><code>dp[mask][i]</code></td><td>11 · Shortest Superstring, Work Sessions</td></tr>
    <tr><td>State machine</td><td>"buy / sell", "cooldown", "at most k", "on / off"</td><td>one value per mode per day</td><td>below · stock problems</td></tr>
    <tr><td>Digit DP</td><td>"count numbers ≤ N with property…"</td><td>(position, tight, …) over N's digits</td><td>Count Special Integers, Numbers At Most N Given Digit Set</td></tr>
  </table>
  <h3>State machine: stock trading</h3>
  <p>Some problems have a few "modes" you switch between: holding a share or not, in cooldown or not, how many trades used. Draw the modes as circles and the allowed moves as arrows. The DP keeps the best cash for each mode, and every day updates all modes from yesterday's values.</p>
  <figure class="viz"><svg viewBox="0 0 600 260" width="600"><defs><marker id="dsa-dp-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><circle cx="300" cy="90" r="36" class="fb sb"/><text x="300" y="94" text-anchor="middle">hold</text><circle cx="470" cy="200" r="36" class="fr sr"/><text x="470" y="204" text-anchor="middle">sold</text><circle cx="130" cy="200" r="36" class="fg sg"/><text x="130" y="204" text-anchor="middle">rest</text><line x1="160" y1="180" x2="268" y2="110" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="190" y="128" text-anchor="middle">buy  −p</text><line x1="332" y1="110" x2="440" y2="180" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="412" y="128" text-anchor="middle">sell  +p</text><line x1="432" y1="208" x2="170" y2="208" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="300" y="228" text-anchor="middle">next day: cooldown</text><path d="M284,58 C268,14 332,14 316,58" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="345" y="28">wait</text><path d="M96,188 C58,170 58,232 96,214" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="40" y="250">wait</text></svg><figcaption>Best Time to Buy and Sell Stock with Cooldown as a state machine. Each day you are in exactly one state; each arrow is one choice. Keep the best cash for each state and update all three every day.</figcaption></figure>
  <p>Solved in section 14 with exactly this picture. The other stock variants are the same idea with different circles: one transaction (two states), unlimited (two states), at most k (2k states), with a fee (subtract it on sell).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"List all ways" is not DP: the output itself is exponential, so use backtracking. DP is for a count, a best value, or yes/no.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> The families are templates. A few classics still need their own care: LIS's "ending at i" state and its O(n log n) trick, Partition's reduction to knapsack, the stock state machine's update order.</div>

  <h2 id="dsa-dp-problems"><span class="num">14</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Do the recipe and the families hold up on the problems interviewers actually ask, with their edge cases (amount 0, impossible amounts, empty arrays, equal values)?</p>
  </div>
  <p>Already solved above, with tables: <b>House Robber</b> (section 05), <b>Minimum Path Sum</b> and <b>Longest Common Subsequence</b> (06), <b>Edit Distance</b> (08), <b>House Robber III</b> (10). Four more here; each lists the recipe first.</p>

  <h3>1. Coin Change (fewest coins, LeetCode 322)</h3>
  <p>State <code>dp[a]</code> = fewest coins for a; <code>dp[a] = min(dp[a − c] + 1)</code>; base <code>dp[0] = 0</code>, rest infinity; fill a = 1 … amount; answer <code>dp[amount]</code> or −1. The table for ₹11 is in section 05.</p>
<div class="fx" data-lang="py">def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount           # dp[a] = fewest coins for amount a
    for a in range(1, amount + 1):
        for c in coins:
            if c &lt;= a and dp[a - c] + 1 &lt; dp[a]:
                dp[a] = dp[a - c] + 1   # use c as the last coin
    return dp[amount] if dp[amount] != INF else -1

for coins, amt in [([1, 2, 5], 11), ([2], 3), ([1], 0), ([1, 3, 4], 6), ([186, 419, 83, 408], 6249)]:
    print(coins, amt, "-&gt;", coin_change(coins, amt))</div>
  <div class="fx" data-lang="text">[1, 2, 5] 11 -&gt; 3
[2] 3 -&gt; -1
[1] 0 -&gt; 0
[1, 3, 4] 6 -&gt; 2
[186, 419, 83, 408] 6249 -&gt; 20</div>
  <p>O(amount × coins) time, O(amount) space. This is unbounded knapsack with "min count" instead of "max value". <code>[1, 3, 4], 6 → 2</code> is the greedy-killer case.</p>

  <h3>2. Longest Increasing Subsequence (LeetCode 300)</h3>
  <p><code>[10, 9, 2, 5, 3, 7, 101, 18]</code>. A subsequence keeps order but may skip items. Longest strictly increasing one? Answer 4 (2, 3, 7, 18). The state must be "ending <em>at</em> i", because to extend a run you need to know its last value.</p>
  <p>State: <code>dp[i]</code> = length of the longest increasing subsequence <em>ending exactly at</em> i. Recurrence: <code>dp[i] = 1 + max(dp[j])</code> over j &lt; i with <code>nums[j] &lt; nums[i]</code>; every <code>dp[i]</code> starts at 1. Answer: <code>max(dp)</code>, not <code>dp[-1]</code>, because the best run can end anywhere.</p>
  <table class="tbl out"><caption>dp for [10, 9, 2, 5, 3, 7, 101, 18]</caption>
    <tr><th>nums</th><td>10</td><td>9</td><td>2</td><td>5</td><td>3</td><td>7</td><td>101</td><td>18</td></tr>
    <tr><th>dp</th><td>1</td><td>1</td><td>1</td><td>2</td><td>2</td><td>3</td><td>4</td><td>4</td></tr>
  </table>
  <p>Faster idea, O(n log n): keep <code>tails[k]</code> = the smallest possible last value of an increasing run of length k+1. A smaller tail is always better (easier to extend). For each x, binary-search the first tail ≥ x and replace it; if none, append. <code>tails</code> is not a real subsequence, but its length is the answer.</p>
<div class="fx" data-lang="py">from bisect import bisect_left

def lis_n2(nums):
    if not nums:
        return 0
    dp = [1] * len(nums)                # dp[i] = longest increasing run ENDING at i
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] &lt; nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)

def lis_fast(nums):
    tails = []                          # tails[k] = smallest tail of a run of length k+1
    for x in nums:
        k = bisect_left(tails, x)       # first tail &gt;= x
        if k == len(tails):
            tails.append(x)             # x extends the longest run
        else:
            tails[k] = x                # x is a smaller tail for length k+1
    return len(tails)

for nums in [[10, 9, 2, 5, 3, 7, 101, 18], [0, 1, 0, 3, 2, 3], [7, 7, 7, 7], [], [5]]:
    print(nums, "-&gt;", lis_n2(nums), lis_fast(nums))</div>
  <div class="fx" data-lang="text">[10, 9, 2, 5, 3, 7, 101, 18] -&gt; 4 4
[0, 1, 0, 3, 2, 3] -&gt; 4 4
[7, 7, 7, 7] -&gt; 1 1
[] -&gt; 0 0
[5] -&gt; 1 1</div>
  <p><code>bisect_left</code> keeps it <em>strictly</em> increasing (equal values replace, so <code>[7, 7, 7, 7]</code> → 1). For non-decreasing, use <code>bisect_right</code>. Trace of tails: [10] → [9] → [2] → [2, 5] → [2, 3] → [2, 3, 7] → [2, 3, 7, 101] → [2, 3, 7, 18].</p>

  <h3>3. Partition Equal Subset Sum (LeetCode 416) · 0/1 knapsack</h3>
  <p>Can <code>[1, 5, 11, 5]</code> be split into two groups with equal sums? Total 22, so we need a subset summing to 11 ({11} vs {1, 5, 5}: yes). This is section 07's 0/1 loop where the "value" is just "is this sum reachable?".</p>
<div class="fx" data-lang="py">def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False                    # odd total can't split evenly
    target = total // 2
    dp = [False] * (target + 1)         # dp[s] = some subset sums to s
    dp[0] = True                        # empty subset
    for x in nums:
        for s in range(target, x - 1, -1):   # right to left: use x once
            dp[s] = dp[s] or dp[s - x]
    return dp[target]

for nums in [[1, 5, 11, 5], [1, 2, 3, 5], [2, 2], [1], [3, 3, 3, 4, 5]]:
    print(nums, "-&gt;", can_partition(nums))</div>
  <div class="fx" data-lang="text">[1, 5, 11, 5] -&gt; True
[1, 2, 3, 5] -&gt; False
[2, 2] -&gt; True
[1] -&gt; False
[3, 3, 3, 4, 5] -&gt; True</div>
  <p>O(n × target) time, O(target) space. If you loop s left to right, <code>[1]</code> with target 2 would wrongly reach 2 by using the 1 twice: the 0/1 vs unbounded bug.</p>

  <h3>4. Best Time to Buy and Sell Stock with Cooldown (LeetCode 309) · state machine</h3>
  <p>Daily prices <code>[1, 2, 3, 0, 2]</code>. Buy and sell as often as you like, one share at a time, but after a sell you must wait one day before buying. Max profit? Answer 3: buy 1, sell 2, cooldown, buy 0, sell 2.</p>
  <table class="tbl">
    <tr><th>State (best cash so far if today ends…)</th><th>Comes from</th></tr>
    <tr><td><code>hold</code> — holding a share</td><td>yesterday's hold (wait), or yesterday's rest − price (buy)</td></tr>
    <tr><td><code>sold</code> — just sold today</td><td>yesterday's hold + price</td></tr>
    <tr><td><code>rest</code> — no share, free to buy tomorrow</td><td>yesterday's rest or yesterday's sold (cooldown over)</td></tr>
  </table>
  <table class="tbl out"><caption>Dry run on [1, 2, 3, 0, 2]</caption>
    <tr><th>price</th><th>hold</th><th>sold</th><th>rest</th></tr>
    <tr><td>1</td><td>−1</td><td>−∞</td><td>0</td></tr>
    <tr><td>2</td><td>−1</td><td>1</td><td>0</td></tr>
    <tr><td>3</td><td>−1</td><td>2</td><td>1</td></tr>
    <tr><td>0</td><td>1</td><td>−1</td><td>2</td></tr>
    <tr><td>2</td><td>1</td><td>3</td><td>2</td></tr>
  </table>
<div class="fx" data-lang="py">def max_profit_cooldown(prices):
    hold, sold, rest = float("-inf"), 0, 0
    for p in prices:
        hold, sold, rest = (max(hold, rest - p),   # keep holding, or buy today
                            hold + p,              # sell today
                            max(rest, sold))       # do nothing / cooldown ends
    return max(sold, rest)

for prices in [[1, 2, 3, 0, 2], [1], [], [5, 4, 3], [1, 4, 2, 7]]:
    print(prices, "-&gt;", max_profit_cooldown(prices))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 0, 2] -&gt; 3
[1] -&gt; 0
[] -&gt; 0
[5, 4, 3] -&gt; 0
[1, 4, 2, 7] -&gt; 6</div>
  <p>O(n) time, O(1) space. The tuple assignment matters: all three new values must be computed from <em>yesterday's</em> values. Updating <code>hold</code> first and then using it for <code>sold</code> would let you buy and sell on the same day.</p>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → DP: <b>322 Coin Change</b>, <b>300 Longest Increasing Subsequence</b>, <b>416 Partition Equal Subset Sum</b>, <b>309 Best Time to Buy and Sell Stock with Cooldown</b>, <b>139 Word Break</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Most wrong DP answers come from a handful of slips that look harmless: a base case, an index shift, a loop direction, a shared cache.</div>

  <h2 id="dsa-dp-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which slips make a DP compile, run, and return the wrong number?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a fuzzy state</span>
    <p>If you cannot say what <code>dp[i]</code> means in one sentence, the recurrence will be wrong. "Ending at i" vs "among the first i" changes both the recurrence and the answer (<code>max(dp)</code> vs <code>dp[n]</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong base case</span>
    <p>Counting problems need <code>dp[0] = 1</code> ("one way to make nothing"); min problems need <code>dp[0] = 0</code> and the rest infinity, not 0. Edit distance needs <code>dp[i][0] = i</code>, <code>dp[0][j] = j</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: loop direction in 1-row knapsack</span>
    <p>0/1 (each item once): capacity from high to low. Unbounded (reuse allowed): low to high. Getting it backwards silently changes which problem you solve.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: off-by-one with the empty prefix</span>
    <p>String tables are (m+1) × (n+1). <code>dp[i][j]</code> compares <code>a[i-1]</code> with <code>b[j-1]</code>. Forgetting the extra row, or the −1, gives index errors or wrong answers on empty strings.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mutable or unhashable cache arguments</span>
    <p><code>@cache</code> needs hashable arguments: pass indexes or tuples, not lists. A default <code>memo={}</code> in the signature is shared between calls; use <code>memo=None</code>. A module-level <code>@cache</code> also keeps answers between test cases: clear it with <code>f.cache_clear()</code> or define the cached helper inside the main function (as <code>climb_top_down</code> does).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: overwriting values you still need</span>
    <p>In space-optimised code, compute all new values from old ones before writing (tuple assignment), or save the old diagonal in a temp. The stock cooldown update is the classic example.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Twelve ideas, from "fib repeats itself" to bitmasks. How is each built on the one before, and what did each compute for Ravi's shift?</div>

  <h2 id="dsa-dp-connect"><span class="num">16</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Seen together: which ideas are the machinery (memo, table, recipe, space) and which are just different shapes of state, and what number did each produce on the running example?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 320" width="660">
<defs><marker id="dsa-dp-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">repeated subproblems</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">fib(30): 2,692,537 calls</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">memo (top-down)</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">59 calls; stack depth limit</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">table (bottom-up)</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">dp[7] = 13, no recursion</text>
<line x1="555" y1="54" x2="440" y2="88" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<rect x="200" y="90" width="260" height="44" rx="7" class="ft st"/><text x="330" y="109" text-anchor="middle" font-size="11.5" font-weight="700">recipe: state → transition → base → order</text><text x="330" y="125" text-anchor="middle" class="tm" font-size="10">staircase: 8 ways</text>
<line x1="230" y1="134" x2="70" y2="168" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<line x1="280" y1="134" x2="200" y2="168" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<line x1="330" y1="134" x2="330" y2="168" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<line x1="380" y1="134" x2="460" y2="168" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<line x1="430" y1="134" x2="590" y2="168" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<rect x="10" y="170" width="120" height="50" rx="7" class="fg sg"/><text x="70" y="190" text-anchor="middle" font-size="11" font-weight="700">1-D: dp[i]</text><text x="70" y="207" text-anchor="middle" class="tm" font-size="10">tips 12 · coins 3</text>
<rect x="140" y="170" width="120" height="50" rx="7" class="fg sg"/><text x="200" y="190" text-anchor="middle" font-size="11" font-weight="700">2-D: dp[i][j]</text><text x="200" y="207" text-anchor="middle" class="tm" font-size="10">10 · 7 min · LCS 3</text>
<rect x="270" y="170" width="120" height="50" rx="7" class="fg sg"/><text x="330" y="190" text-anchor="middle" font-size="11" font-weight="700">+capacity / edits</text><text x="330" y="207" text-anchor="middle" class="tm" font-size="10">bag ₹35 · sambr 3</text>
<rect x="400" y="170" width="120" height="50" rx="7" class="fg sg"/><text x="460" y="190" text-anchor="middle" font-size="11" font-weight="700">slice / tree</text><text x="460" y="207" text-anchor="middle" class="tm" font-size="10">167 · hubs 9</text>
<rect x="530" y="170" width="120" height="50" rx="7" class="fg sg"/><text x="590" y="190" text-anchor="middle" font-size="11" font-weight="700">set as bits</text><text x="590" y="207" text-anchor="middle" class="tm" font-size="10">round trip 80</text>
<line x1="330" y1="220" x2="330" y2="256" stroke="currentColor" marker-end="url(#dsa-dp-a9)"/>
<rect x="180" y="258" width="300" height="50" rx="7" class="fv"/><text x="330" y="278" text-anchor="middle" font-size="11.5" font-weight="700">space optimisation (any table)</text><text x="330" y="295" text-anchor="middle" class="tm" font-size="10">keep only rows the recurrence reads</text>
</svg><figcaption>The top row is the machinery: notice repeats, remember answers (memo), or fill them in order (table). The recipe turns a problem into a state; the green boxes are the same recipe with richer states. Space optimisation applies to any table.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Ravi's shift</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Repeated subproblems</td><td>recursion tree (Backtracking)</td><td>why is it slow?</td><td>fib(30): 2,692,537 calls, 31 questions</td><td>diagnosing exponential recursion</td></tr>
    <tr><td>Memoisation</td><td>recursion + dict</td><td>compute each once?</td><td>fib(30) in 59 calls</td><td>finding the recurrence, sparse states</td></tr>
    <tr><td>Tabulation</td><td>table + dependency order</td><td>no recursion?</td><td>dp[7] = 13</td><td>big n, space tricks</td></tr>
    <tr><td>Recipe</td><td>state + last move</td><td>how to design a DP?</td><td>staircase 5 → 8 ways</td><td>every DP</td></tr>
    <tr><td>1-D</td><td>dp[i] from 1–2 earlier cells or a scan</td><td>best along a line?</td><td>tips 12; ₹11 in 3 coins</td><td>arrays, amounts</td></tr>
    <tr><td>2-D</td><td>dp[r][c] or dp[i][j]</td><td>grid paths, two sequences?</td><td>10 routes; 7 minutes; LCS 3</td><td>grids, two strings</td></tr>
    <tr><td>Knapsack</td><td>items × capacity</td><td>best under a limit?</td><td>4 kg bag → ₹35 (unbounded 60)</td><td>budgets, subset sums</td></tr>
    <tr><td>String DP</td><td>2-D + insert/delete/replace</td><td>how many edits?</td><td>sambr → samosa: 3</td><td>fuzzy matching</td></tr>
    <tr><td>Interval DP</td><td>dp[l][r] by length</td><td>best inside a slice?</td><td>balloons 167</td><td>palindromes, splitting</td></tr>
    <tr><td>Tree DP</td><td>post-order + (use, skip)</td><td>best on a tree?</td><td>hubs 9</td><td>tree + adjacency rules</td></tr>
    <tr><td>Bitmask DP</td><td>set as bits + position</td><td>best order over all items?</td><td>round trip 80 (13 states)</td><td>n ≤ 20</td></tr>
    <tr><td>Space optimisation</td><td>rolling rows</td><td>less memory?</td><td>fib in 2 vars; grid in 1 row</td><td>large tables, value only</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>name the state (the few numbers that describe a subproblem), write its answer from the last choice in terms of smaller states, and compute every state once (memo or table); the families differ only in what the state is (an index, two indexes, a capacity, a slice, a tree node, a bitmask).</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_tries">Tries</a>: DP shares answers between overlapping <em>subproblems</em>. Biteful's search box has a different kind of overlap: 100,000 dish names share prefixes ("pa" → paneer, papad, pav bhaji). A tree of letters stores each shared prefix once, so "every dish starting with pa" costs the length of "pa", not a scan of the menu.</div>

  <h2 id="dsa-dp-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example, Ravi's shift: staircase 5 steps (1 or 2 per stride); street tips [2, 7, 9, 3, 1] (no two neighbours); change ₹11 with [1, 2, 5]; 3 × 4 block grid; traffic [[1,3,1],[1,5,1],[4,2,1]]; planned ABCDE vs actual ACE; bag 4 kg with 1 kg/₹15, 3 kg/₹20, 4 kg/₹30; typo sambr → samosa; hub tree [3, 4, 5, 1, 3, None, 1]; round trip through kitchen + 3 customers.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Ravi's shift</th><th>Weakness → next</th></tr>
    <tr><td>Repeated subproblems</td><td>why slow?</td><td>2.7 M calls for 31 questions</td><td>remember answers</td></tr>
    <tr><td>Memoisation</td><td>each once?</td><td>59 calls</td><td>recursion depth</td></tr>
    <tr><td>Tabulation</td><td>no recursion?</td><td>dp[7] = 13</td><td>how to design one?</td></tr>
    <tr><td>Recipe</td><td>state, transition, base, order, answer</td><td>8 ways up 5 steps</td><td>choices with values</td></tr>
    <tr><td>1-D</td><td>best along a line?</td><td>tips 12; 3 coins</td><td>two directions</td></tr>
    <tr><td>2-D</td><td>grid, two sequences?</td><td>10 routes; 7 min; LCS 3</td><td>capacity limit</td></tr>
    <tr><td>Knapsack</td><td>best under a limit?</td><td>₹35</td><td>insert/replace edits</td></tr>
    <tr><td>String DP</td><td>edit distance?</td><td>3</td><td>slices, not prefixes</td></tr>
    <tr><td>Interval</td><td>best inside l..r?</td><td>167</td><td>trees</td></tr>
    <tr><td>Tree</td><td>use/skip per node?</td><td>9</td><td>remember a set</td></tr>
    <tr><td>Bitmask</td><td>visit all in best order?</td><td>80 min</td><td>big tables</td></tr>
    <tr><td>Space</td><td>keep less?</td><td>2 vars / 1 row</td><td>→ Tries</td></tr>
  </table>
  <h3>Recurrences (each symbol explained)</h3>
  <table class="tbl">
    <tr><th>Problem</th><th>State</th><th>Recurrence</th><th>Base · answer · cost</th></tr>
    <tr><td>Fibonacci / stairs</td><td>dp[i] = fib(i) / ways onto step i</td><td>dp[i] = dp[i−1] + dp[i−2]</td><td>dp[0], dp[1] · dp[n] · O(n)</td></tr>
    <tr><td>House Robber</td><td>dp[i] = best from first i orders</td><td>max(dp[i−1], dp[i−2] + tip[i])</td><td>0 · last · O(n), O(1) space</td></tr>
    <tr><td>Coin Change</td><td>dp[a] = fewest coins for amount a</td><td>min over coins c ≤ a of dp[a−c] + 1</td><td>dp[0] = 0, rest ∞ · dp[amount] · O(A·k)</td></tr>
    <tr><td>Unique Paths</td><td>dp[r][c] = routes to (r, c)</td><td>dp[r−1][c] + dp[r][c−1]</td><td>edges = 1 · bottom-right · O(mn)</td></tr>
    <tr><td>Min Path Sum</td><td>dp[r][c] = quickest to (r, c)</td><td>min(north, west) + cost[r][c]</td><td>start cell · bottom-right · O(mn)</td></tr>
    <tr><td>LCS</td><td>dp[i][j] on prefixes a[:i], b[:j]</td><td>match: dp[i−1][j−1] + 1 · else max(dp[i−1][j], dp[i][j−1])</td><td>row/col 0 = 0 · dp[m][n] · O(mn)</td></tr>
    <tr><td>0/1 Knapsack</td><td>dp[i][w] = best, first i items, capacity w</td><td>max(dp[i−1][w], dp[i−1][w−wt] + val)</td><td>row 0 = 0 · dp[n][W] · O(nW)</td></tr>
    <tr><td>Edit Distance</td><td>dp[i][j] = edits a[:i] → b[:j]</td><td>equal: dp[i−1][j−1] · else 1 + min(del, ins, rep)</td><td>dp[i][0] = i, dp[0][j] = j · O(mn)</td></tr>
    <tr><td>Interval (balloons)</td><td>dp[l][r] = best strictly between l and r</td><td>max over k of dp[l][k] + a[l]·a[k]·a[r] + dp[k][r]</td><td>gap 1 = 0 · dp[0][n−1] · O(n³)</td></tr>
    <tr><td>Tree (robber III)</td><td>(use, skip) per node</td><td>use = val + skips; skip = Σ max(child pair)</td><td>null = (0, 0) · max(root) · O(n)</td></tr>
    <tr><td>Bitmask (TSP)</td><td>go(mask, i)</td><td>min over j ∉ mask of dist[i][j] + go(mask | 1&lt;&lt;j, j)</td><td>full mask: dist[i][0] · go(1, 0) · O(2ⁿn²)</td></tr>
  </table>
  <p>Complexity rule for every DP: <b>time = number of states × work per state; space = states stored</b> (+ recursion depth for memo).</p>
  <div class="cards">
    <div><b>Use DP</b><p>A count, a min/max, or yes/no; choices at each step; the same small state is reached along many paths (overlap) and best answers build from best sub-answers.</p><small>"number of ways", "minimum cost", "longest", "can you make…"</small></div>
    <div><b>Avoid DP</b><p>"List all" (backtracking: output is exponential); no overlap (divide and conquer, e.g. merge sort); a provably safe greedy choice (intervals, Dijkstra).</p><small>Check greedy against a counter-example like coins [1, 3, 4], 6.</small></div>
  </div>
  <h3>Key traps</h3>
  <ul>
    <li>State not definable in one sentence → wrong recurrence; "ending at i" needs <code>max(dp)</code>.</li>
    <li>Base cases: counting dp[0] = 1; min dp[0] = 0 with ∞ elsewhere; edit distance i and j.</li>
    <li>1-row knapsack: right → left for 0/1, left → right for unbounded.</li>
    <li>String tables (m+1)×(n+1): compare a[i−1], b[j−1].</li>
    <li>Memo: recursion limit; <code>memo={}</code> default shared; lists are unhashable for <code>@cache</code>.</li>
    <li>Interval DP filled by length, not by row.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>How many calls does memoised fib(30) make, and why not 31? → 59: each of the 31 values is computed once, and all but the base reads are asked twice.</li>
    <li>Ravi's tips [2, 7, 9, 3, 1], no two neighbours? → 12 (2 + 9 + 1), from dp = max(skip, take + best two back).</li>
    <li>Bag 4 kg, orders 1/₹15, 3/₹20, 4/₹30, each once? → ₹35; unlimited copies → ₹60.</li>
    <li>What does dp[i][j] = dp[i−1][j−1] + 1 mean in LCS? → The last characters match, so both join the common subsequence of the shorter prefixes.</li>
    <li>Why does Burst Balloons pick the balloon burst last? → Its neighbours are then exactly l and r, so the left and right parts become independent subproblems.</li>
  </ol>

  <h2 id="dsa-dp-qa"><span class="num">17</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Which two properties must a problem have for DP to help?</summary><div class="qa-body">Overlapping subproblems (the same smaller question is asked many times, so caching saves work) and optimal substructure (the best answer is built from best answers of subproblems). Merge sort has the second but not the first, so it is divide and conquer, not DP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is naive recursive Fibonacci exponential, and what does memoisation make it?</summary><div class="qa-body">Each call makes two calls and nothing is remembered, so fib(n−2)'s subtree is recomputed inside fib(n−1)'s; the call count grows like 1.6ⁿ (2.7 million for n = 30). With a cache each of the n+1 values is computed once: O(n) time, O(n) space (59 calls for n = 30).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List the 5 steps you write before coding a DP.</summary><div class="qa-body">1) State: what <code>dp[...]</code> means. 2) Recurrence: how it comes from smaller states (think about the last choice). 3) Base cases. 4) Fill order so dependencies are ready. 5) Where the answer is (one cell, or max over cells).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you estimate the time complexity of a DP?</summary><div class="qa-body">Number of states × work per state. LCS: (m+1)(n+1) states × O(1) = O(mn). LIS simple: n states × O(n) scan = O(n²). Burst Balloons: n² intervals × O(n) choices of last balloon = O(n³). TSP bitmask: 2ⁿ·n states × O(n) = O(2ⁿ n²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a 1-row 0/1 knapsack, why must the capacity loop go from high to low?</summary><div class="qa-body">The update reads <code>dp[w - wt]</code>. Going high to low, that cell still holds the value from before this item (the 2-D table's row above), so the item is counted at most once. Going low to high, <code>dp[w - wt]</code> may already include this item, which allows reuse: that is the unbounded knapsack (₹60 instead of ₹35).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the O(n log n) LIS work?</summary><div class="qa-body">Keep <code>tails[k]</code> = smallest last value of any increasing run of length k+1; it stays sorted. For each x, <code>bisect_left</code> finds the first tail ≥ x: replace it (a smaller tail is easier to extend) or append if x is bigger than all. The length of tails is the LIS length.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Burst Balloons, why choose the balloon burst last instead of first?</summary><div class="qa-body">If k is burst first, its neighbours change later and the left and right sides affect each other. If k is burst last inside (l, r), its neighbours at that moment are exactly l and r, and the parts (l, k) and (k, r) are independent subproblems: <code>dp[l][r] = max(dp[l][k] + a[l]·a[k]·a[r] + dp[k][r])</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is DP done on a tree, e.g. House Robber III?</summary><div class="qa-body">Post-order DFS. Each node returns a pair (best if used, best if skipped). Used = val + both children's skipped; skipped = sum of max(pair) of each child. Answer = max of the root's pair. O(n) time, O(h) stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use bitmask DP, and what is the state for TSP?</summary><div class="qa-body">When the state must remember which subset of up to ~20 items is used. TSP: <code>dp[mask][i]</code> = shortest path that has visited exactly the places in mask and stands at place i. O(2ⁿ n²) time, versus (n−1)! for trying every order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Model "stock with cooldown" as states. Why update with a tuple assignment?</summary><div class="qa-body">States: hold, sold (sold today), rest. hold = max(hold, rest − p); sold = hold + p; rest = max(rest, sold). All three must use yesterday's values; updating one first and reading it for another would allow buy-and-sell inside one day, breaking the cooldown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>DP vs backtracking: how do you pick?</summary><div class="qa-body">If the question asks for a count, a min/max, or yes/no, and states repeat, use DP. If it asks to list every solution (all permutations, all valid boards), the output itself is exponential, so backtracking is the tool; caching cannot shrink the output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does tabulation need a fill order when memoisation does not?</summary><div class="qa-body">Memoisation lets the recursion ask for exactly the states it needs, in whatever order they come up. A table is filled by a loop you write, so you must choose an order in which every cell's inputs are already filled: small i first, rows top to bottom, intervals by length.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the base case design step?</summary><div class="qa-body">Every other cell is built from the base cells, so a wrong base poisons the whole table: coin change starting at 0 everywhere says every amount needs 0 coins; edit distance with a 0 border says "" → "abc" is free; stairs with ways(0) = 0 gives ways(2) = 1 instead of 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are Bellman-Ford (Graphs) and DP related?</summary><div class="qa-body">Bellman-Ford's round i stores the cheapest cost using at most i edges, computed from round i − 1: best_i(v) = min(best_{i−1}(v), best_{i−1}(u) + w). That is a DP whose state is (node, edges used), filled in order of edges used, with a space optimisation that keeps only the last round.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is LCS a 2-D DP while House Robber is 1-D?</summary><div class="qa-body">The state must describe the subproblem completely. For the robber, "how many orders considered" is enough. For LCS, the remaining problem depends on how much of <em>each</em> sequence is left, so the state needs two indexes, and the table has (m+1)(n+1) cells.</div></details>
</main>
`
});
