// notes/dsa/dsa_dp.js — Dynamic Programming
Object.assign(TOPIC_CONTENT, {
  "dsa_dp": `<main>
  <h1>Dynamic Programming</h1>
  <p class="lead">Dynamic programming (DP) is recursion that remembers. When a problem breaks into smaller copies of itself, and the same small copies keep coming back, you solve each one once, write the answer down, and reuse it. That turns exponential brute force into a simple table fill. It builds on recursion and Big-O; the Backtracking and Greedy notes are its close cousins.</p>

  <h2 id="dsa-dp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dynamic Programming</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>DP</b> — solve each subproblem once, store it, reuse it</li>
          <li><b>Need</b> — plain recursive fib(n) makes ~1.6ⁿ calls for only n+1 different questions</li>
          <li>💡 Writing 7 × 8 = 56 on the board once instead of re-counting every time</li>
          <li><b>Overlapping subproblems</b> — same small question asked many times</li>
          <li><b>Optimal substructure</b> — best answer is built from best answers of smaller parts</li>
          <li>⚠ No overlap → plain recursion / divide &amp; conquer (merge sort), not DP</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two ways to write it</div>
        <ul>
          <li><b>Memoisation (top-down)</b> — recursion + cache; <code>@functools.cache</code></li>
          <li><b>Tabulation (bottom-up)</b> — fill a list/table in a safe order with a loop</li>
          <li>Same Big-O: (number of states) × (work per state)</li>
          <li>⚠ Memo on deep inputs → <code>RecursionError</code> (limit ≈ 1000)</li>
          <li><b>Space trick</b> — keep only the rows/values the recurrence reads</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5-step recipe</div>
        <ul>
          <li><b>1 State</b> — what does <code>dp[i]</code> mean, in one sentence</li>
          <li><b>2 Recurrence</b> — how <code>dp[i]</code> comes from smaller states (last choice)</li>
          <li><b>3 Base case</b> — the smallest states, answered by hand</li>
          <li><b>4 Order</b> — fill so every needed state is ready</li>
          <li><b>5 Answer</b> — which cell (or max over cells) is returned</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Families</div>
        <ul>
          <li><b>1D</b> — stairs, house robber, coin change, LIS</li>
          <li><b>Grid</b> — unique paths, min path sum: top + left</li>
          <li><b>Knapsack</b> — 0/1 loop capacity right→left; unbounded left→right</li>
          <li><b>Two strings</b> — LCS, edit distance: <code>dp[i][j]</code> on prefixes</li>
          <li><b>Interval</b> — <code>dp[l][r]</code>, short intervals first (burst balloons)</li>
          <li><b>Tree</b> — return (rob, skip) from each child</li>
          <li><b>Bitmask</b> — state = set of used items as bits (n ≤ 20)</li>
          <li><b>State machine</b> — stock: hold / sold / rest per day</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Signal words</div>
        <ul>
          <li>"number of ways", "minimum / maximum cost", "longest / shortest"</li>
          <li>"can you reach / make / partition…" (yes / no over choices)</li>
          <li>Choices at each step + answers depend on earlier choices</li>
          <li>⚠ "list all ways" → backtracking, not DP (output itself is exponential)</li>
          <li>⚠ Greedy fails on coins [1, 3, 4] amount 6 → DP</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>House Robber</b> — <code>max(skip, take + dp[i-2])</code></li>
          <li><b>Coin Change</b> — <code>min(dp[a-c] + 1)</code></li>
          <li><b>LIS</b> — O(n²) or O(n log n) with bisect</li>
          <li><b>LCS / Edit Distance</b> — diagonal on match</li>
          <li><b>Robber III</b> — (rob, skip) pairs · <b>Stock</b> — 3 states</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-dp-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Recursion Blows Up</span><span class="rm-sub">Fibonacci's call tree</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-props"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">When DP Applies</span><span class="rm-sub">Overlap + optimal substructure</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-memo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Memo vs Table</span><span class="rm-sub">From scratch, then functools.cache</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-recipe"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The 5-Step Recipe</span><span class="rm-sub">State, recurrence, base, order, answer</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-space"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Space Optimisation</span><span class="rm-sub">Keep only what you read</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-patterns"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The DP Families</span><span class="rm-sub">1D, grid, knapsack, strings, interval, tree, bitmask, states</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-problems"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">9 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Off-by-one, loop order, mutable cache</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-dp-need"><span class="num">01</span>Why Recursion Blows Up</h2>
  <p>Start with something you already know: the Fibonacci numbers 0, 1, 1, 2, 3, 5, 8, 13… Each number is the sum of the two before it. The recursive code is a direct copy of that sentence.</p>
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
  <p>fib(5) asks fib(4) and fib(3). But fib(4) <em>also</em> asks fib(3). Nobody remembers the first answer, so the whole fib(3) subtree is computed again. The repeats repeat too. The number of calls grows like 1.6ⁿ: add 1 to n and the work grows by 60%.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper adds up the same bill of 20 items every time a customer asks "how much was it?". A smart one writes the total on the bill the first time. Next time she just reads it. DP is writing the total on the bill.</p>
  </div>
  <p>The fix is one line of thinking: <strong>before computing fib(k), check if you already have it; after computing it, write it down</strong>. Now each of the 31 questions is answered once. 2.7 million calls become 31.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Dynamic programming</strong>: solve a problem by splitting it into smaller subproblems, solving each distinct subproblem <em>once</em>, storing its answer, and building bigger answers from stored ones. (The name, from Richard Bellman in the 1950s, just means "planning with a table".)</p>
  </div>
  <p>Where you meet it: spell-check suggestions and <code>git diff</code> (edit distance, LCS), DNA matching, route planning, text justification in word processors, speech recognition (Viterbi), stock trading back-tests, and a large share of interview "hard" questions.</p>

  <h2 id="dsa-dp-props"><span class="num">02</span>When DP Applies</h2>
  <p>DP is not magic for every recursion. It needs two things. Check both before you start.</p>
  <table class="tbl">
    <tr><th>Property</th><th>Plain meaning</th><th>Fibonacci</th><th>Counter-example</th></tr>
    <tr><td><strong>Overlapping subproblems</strong></td><td>The same smaller question shows up again and again</td><td>fib(3) is needed by fib(4) and fib(5)</td><td>Merge sort: the two halves never share work, so caching saves nothing</td></tr>
    <tr><td><strong>Optimal substructure</strong></td><td>The best answer for the big problem is made from the best answers of smaller ones</td><td>fib(n) is exactly fib(n−1) + fib(n−2)</td><td>Longest <em>simple</em> path in a graph: the best path's pieces need not be best paths themselves</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Ask: "Can I describe where I am with a few numbers (an index, a remaining amount, two positions)?" If yes, and the future only depends on those numbers and not on <em>how</em> you got there, you have a DP state. The number of different states is small, but the number of paths through them is huge. DP walks states, not paths.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Coins [1, 3, 4], make 6. Greedy takes the biggest coin first: 4 + 1 + 1 = 3 coins. The best is 3 + 3 = 2 coins. Greedy is right for Indian coins (1, 2, 5, 10) but wrong in general. When greedy's choice can block a better later combination, you need DP to try all choices at each amount.</p>
  </div>

  <h2 id="dsa-dp-memo"><span class="num">03</span>Memo vs Table</h2>
  <p>There are two ways to "remember". Both give the same Big-O. Learn both: memo is easier to <em>find</em>, the table is easier to <em>optimise</em>.</p>
  <h3>Top-down: memoisation (from scratch)</h3>
  <p>Keep the recursive code. Add a dictionary. Check it before working, fill it after.</p>
  <div class="fx" data-lang="py">def fib_memo(n, memo=None):
    if memo is None:
        memo = {}                        # fresh notebook for each top-level call
    if n &lt; 2:
        return n
    if n not in memo:                    # first time: compute and write down
        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]                       # every later time: just read</div>
  <h3>The Python-library way: functools.cache</h3>
  <p>Python can add the dictionary for you. <code>@cache</code> (Python 3.9+) wraps the function: arguments become the key, the return value is stored. <code>@lru_cache(maxsize=None)</code> is the same thing on older versions.</p>
  <div class="fx" data-lang="py">from functools import cache

@cache
def fib_cache(n):
    if n &lt; 2:
        return n
    return fib_cache(n - 1) + fib_cache(n - 2)</div>
  <h3>Bottom-up: tabulation</h3>
  <p>Throw away the recursion. Make a list <code>dp</code> where <code>dp[i]</code> is fib(i). Write the base cases in by hand, then fill the rest from small to big with a loop. When you reach <code>dp[i]</code>, <code>dp[i-1]</code> and <code>dp[i-2]</code> are already done.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600"><defs><marker id="dsadp-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><rect x="100" y="80" width="50" height="36" class="fv sb"/><text x="125" y="103" text-anchor="middle">0</text><text x="125" y="136" class="tm" text-anchor="middle">0</text><rect x="150" y="80" width="50" height="36" class="fv sb"/><text x="175" y="103" text-anchor="middle">1</text><text x="175" y="136" class="tm" text-anchor="middle">1</text><rect x="200" y="80" width="50" height="36" class="ft st"/><text x="225" y="103" text-anchor="middle">1</text><text x="225" y="136" class="tm" text-anchor="middle">2</text><rect x="250" y="80" width="50" height="36" class="ft st"/><text x="275" y="103" text-anchor="middle">2</text><text x="275" y="136" class="tm" text-anchor="middle">3</text><rect x="300" y="80" width="50" height="36" class="ft st"/><text x="325" y="103" text-anchor="middle">3</text><text x="325" y="136" class="tm" text-anchor="middle">4</text><rect x="350" y="80" width="50" height="36" class="fg sg"/><text x="375" y="103" text-anchor="middle">5</text><text x="375" y="136" class="tm" text-anchor="middle">5</text><rect x="400" y="80" width="50" height="36" class="fg sg"/><text x="425" y="103" text-anchor="middle">8</text><text x="425" y="136" class="tm" text-anchor="middle">6</text><rect x="450" y="80" width="50" height="36" class="fr sr"/><text x="475" y="103" text-anchor="middle">13</text><text x="475" y="136" class="tm" text-anchor="middle">7</text><text x="50" y="103" text-anchor="middle">dp:</text><text x="50" y="136" class="tm" text-anchor="middle">i:</text><path d="M375,78 Q425,20 469,76" fill="none" class="sr" stroke="currentColor" stroke-width="1.5" marker-end="url(#dsadp-a1)"/><path d="M425,78 Q450,50 473,76" fill="none" class="sr" stroke="currentColor" stroke-width="1.5" marker-end="url(#dsadp-a1)"/><text x="415" y="22" class="tr" text-anchor="middle">dp[7] = dp[6] + dp[5]</text><text x="100" y="40" class="tb">fill left → right</text><text x="100" y="58" class="tm">each cell once, O(1) work</text><text x="300" y="160" text-anchor="middle" class="tm">purple = base cases · every other cell reads only cells to its left</text></svg><figcaption>Tabulation for Fibonacci. The table is filled in an order where every cell it needs is already done. 8 cells, 8 steps: O(n) instead of O(1.6ⁿ).</figcaption></figure>
  <div class="fx" data-lang="py">def fib_table(n):
    if n &lt; 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1                            # base cases: dp[0] = 0, dp[1] = 1
    for i in range(2, n + 1):            # small to big
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

print(fib_memo(50), fib_cache(50), fib_table(50))
print(fib_cache.cache_info())
print([fib_table(i) for i in range(10)])</div>
  <div class="fx" data-lang="text">12586269025 12586269025 12586269025
CacheInfo(hits=48, misses=51, maxsize=None, currsize=51)
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]</div>
  <p><code>cache_info()</code> proves the point: 51 misses (each of fib(0)…fib(50) computed once) and 48 hits (answers reused). Without the cache this would be about 40 billion calls.</p>
  <table class="tbl">
    <tr><th></th><th>Memoisation (top-down)</th><th>Tabulation (bottom-up)</th></tr>
    <tr><td>How it looks</td><td>Recursion + cache</td><td>Loop + list/table</td></tr>
    <tr><td>Order of work</td><td>Automatic: recursion asks for what it needs</td><td>You must pick an order where inputs are ready</td></tr>
    <tr><td>Computes</td><td>Only the states actually reached</td><td>Every state in the table</td></tr>
    <tr><td>Depth limit</td><td>Python stops at ~1000 nested calls</td><td>No recursion, no limit</td></tr>
    <tr><td>Space trick</td><td>Hard (the cache holds everything)</td><td>Easy: keep only the last row or two values</td></tr>
    <tr><td>Best for</td><td>Finding the recurrence, sparse states, trees</td><td>Final answer, big n, saving memory</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: the recursion limit</span>
    <p><code>fib_cache(5000)</code> on a fresh cache crashes with <code>RecursionError: maximum recursion depth exceeded</code>, even though the work is tiny. Each call waits for the next, 5000 deep. Fixes: switch to the table version, or warm the cache in steps (<code>for i in range(n): f(i)</code>), or raise the limit with <code>sys.setrecursionlimit</code> (risky: a too-high limit can crash the interpreter itself).</p>
  </div>
  <p>Complexity of any DP: <strong>time = (number of states) × (work per state)</strong>, <strong>space = number of states stored</strong> (plus recursion depth for memo). Fibonacci: n states × O(1) = O(n) time, O(n) space.</p>

  <h2 id="dsa-dp-recipe"><span class="num">04</span>The 5-Step Recipe</h2>
  <p>Every DP solution answers the same five questions. Write them down as comments <em>before</em> any code. Interviewers grade this more than the code.</p>
  <div class="flow"><span>1. State</span><span>2. Recurrence</span><span>3. Base case</span><span>4. Order</span><span>5. Answer</span></div>
  <p>Let's run the recipe on <strong>Climbing Stairs</strong>: a staircase has n steps; each move you climb 1 or 2 steps. How many different ways reach the top?</p>
  <p>Try small cases by hand first. n = 1: {1}, one way. n = 2: {1+1, 2}, two ways. n = 3: {1+1+1, 1+2, 2+1}, three ways. n = 4: five ways. The pattern looks like Fibonacci. The recipe tells us <em>why</em>.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Climbing Stairs</th></tr>
    <tr><td>1. State</td><td>What does one cell mean? One plain sentence.</td><td><code>ways(i)</code> = number of ways to stand on step i</td></tr>
    <tr><td>2. Recurrence</td><td>Look at the <em>last</em> move. What could it have been?</td><td>The last move was 1 step (from i−1) or 2 steps (from i−2): <code>ways(i) = ways(i-1) + ways(i-2)</code></td></tr>
    <tr><td>3. Base case</td><td>Smallest states you can answer without the rule</td><td><code>ways(0) = 1</code> (stand on the ground: do nothing), <code>ways(1) = 1</code></td></tr>
    <tr><td>4. Order</td><td>Which states must be ready first?</td><td>i depends on smaller i → loop i from 2 up to n</td></tr>
    <tr><td>5. Answer</td><td>Which state is the final answer?</td><td><code>ways(n)</code></td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Step 2 is where most people get stuck. The trick is almost always: <strong>think about the last decision</strong>. "How did I arrive here?" splits every way into a few groups, and each group is a smaller copy of the problem. Adding the groups (count) or taking the best group (min/max) is the recurrence.</p>
  </div>
  <div class="fx" data-lang="py">def climb_top_down(n):
    @cache
    def ways(i):                 # 1. state: ways to stand on step i
        if i &lt;= 1:
            return 1             # 3. base: step 0 and step 1
        return ways(i - 1) + ways(i - 2)   # 2. last move was 1 or 2 steps
    return ways(n)               # 5. answer

def climb_bottom_up(n):
    dp = [0] * (n + 1)
    dp[0] = dp[1] = 1
    for i in range(2, n + 1):    # 4. order: small to big
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

for n in [1, 2, 3, 4, 5, 10]:
    print(n, climb_top_down(n), climb_bottom_up(n))</div>
  <div class="fx" data-lang="text">1 1 1
2 2 2
3 3 3
4 5 5
5 8 8
10 89 89</div>
  <p>Notice the base case <code>ways(0) = 1</code>. "One way to climb zero steps: do nothing" feels odd, but it is what makes <code>ways(2) = ways(1) + ways(0) = 2</code> come out right. Counting DPs almost always start with "1 way to make nothing".</p>

  <h2 id="dsa-dp-space"><span class="num">05</span>Space Optimisation</h2>
  <p>Look at what the loop <em>reads</em>. Climbing stairs and Fibonacci read only <code>dp[i-1]</code> and <code>dp[i-2]</code>. Everything older is dead weight. Keep two variables instead of a list: O(n) space becomes O(1).</p>
  <div class="fx" data-lang="py">def fib_two_vars(n):
    a, b = 0, 1                  # a = fib(i), b = fib(i+1)
    for _ in range(n):
        a, b = b, a + b          # slide the window one step right
    return a

print([fib_two_vars(i) for i in range(10)])</div>
  <div class="fx" data-lang="text">[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]</div>
  <p>The same idea on a 2D table: if row r reads only row r−1, keep one or two rows instead of the whole table. O(rows × cols) space becomes O(cols). You will see this for Unique Paths, knapsack, and LCS below.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Write the full-table version first, get it correct, then shrink it. Shrinking first is where in-place update bugs hide (reading a value you just overwrote). In an interview, say "this can drop to O(n) space" and only do it if asked.</p>
  </div>

  <h2 id="dsa-dp-patterns"><span class="num">06</span>The DP Families</h2>
  <p>Hundreds of DP questions fall into about eight shapes. Recognise the shape and the state almost writes itself.</p>
  <table class="tbl">
    <tr><th>Family</th><th>Signal words</th><th>Typical state</th><th>Examples</th></tr>
    <tr><td>1D / linear</td><td>"array", "steps", "houses", "ways to reach"</td><td><code>dp[i]</code> = answer for first i items / ending at i</td><td>Stairs, House Robber, Coin Change, LIS, Word Break</td></tr>
    <tr><td>Grid</td><td>"robot", "move right or down", "matrix path"</td><td><code>dp[r][c]</code> = answer to reach cell (r, c)</td><td>Unique Paths, Min Path Sum, Maximal Square</td></tr>
    <tr><td>Knapsack</td><td>"capacity", "subset sums to", "pick items, budget"</td><td><code>dp[w]</code> = best using items so far with capacity w</td><td>0/1 Knapsack, Partition Equal Subset, Coin Change II</td></tr>
    <tr><td>Two strings</td><td>"two strings", "subsequence", "convert / edit"</td><td><code>dp[i][j]</code> = answer for prefixes <code>a[:i]</code>, <code>b[:j]</code></td><td>LCS, Edit Distance, Distinct Subsequences</td></tr>
    <tr><td>Interval</td><td>"burst", "merge stones", "palindrome", "split range"</td><td><code>dp[l][r]</code> = answer for the slice l..r</td><td>Burst Balloons, Longest Palindromic Substring, Matrix Chain</td></tr>
    <tr><td>Tree</td><td>"binary tree", "no two adjacent nodes"</td><td>Each node returns a small tuple to its parent</td><td>House Robber III, Tree Diameter, Max Path Sum</td></tr>
    <tr><td>Bitmask</td><td>n ≤ 20, "visit all", "assign each"</td><td><code>dp[mask][i]</code>, mask = set of used items as bits</td><td>Travelling Salesman, Assignment, Shortest Superstring</td></tr>
    <tr><td>State machine</td><td>"buy / sell", "cooldown", "at most k", "on / off"</td><td>One value per state per day</td><td>Stock problems, Paint House</td></tr>
  </table>

  <h3>1D: Climbing Stairs, House Robber, Coin Change, LIS</h3>
  <p>You walk a list once. At index i you make a small choice (take / skip, which coin, which earlier element to extend) and read earlier cells. Climbing Stairs is done above; the other three are solved fully in Classic Problems.</p>

  <h3>Grid: Unique Paths</h3>
  <p>A robot sits at the top-left of an m × n grid and moves only right or down. How many paths reach the bottom-right? Last move: it came from above or from the left. So the count for a cell is the sum of those two cells.</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600"><defs><marker id="dsadp-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><rect x="60" y="40" width="60" height="50" class="fv sb"/><text x="90" y="70" text-anchor="middle">1</text><rect x="120" y="40" width="60" height="50" class="fv sb"/><text x="150" y="70" text-anchor="middle">1</text><rect x="180" y="40" width="60" height="50" class="fv sb"/><text x="210" y="70" text-anchor="middle">1</text><rect x="240" y="40" width="60" height="50" class="fv sb"/><text x="270" y="70" text-anchor="middle">1</text><rect x="60" y="90" width="60" height="50" class="fv sb"/><text x="90" y="120" text-anchor="middle">1</text><rect x="120" y="90" width="60" height="50" class="ft st"/><text x="150" y="120" text-anchor="middle">2</text><rect x="180" y="90" width="60" height="50" class="fg sg"/><text x="210" y="120" text-anchor="middle">3</text><rect x="240" y="90" width="60" height="50" class="ft st"/><text x="270" y="120" text-anchor="middle">4</text><rect x="60" y="140" width="60" height="50" class="fv sb"/><text x="90" y="170" text-anchor="middle">1</text><rect x="120" y="140" width="60" height="50" class="fg sg"/><text x="150" y="170" text-anchor="middle">3</text><rect x="180" y="140" width="60" height="50" class="fr sr"/><text x="210" y="170" text-anchor="middle">6</text><rect x="240" y="140" width="60" height="50" class="ft st"/><text x="270" y="170" text-anchor="middle">10</text><text x="90" y="30" text-anchor="middle" class="tb">start</text><text x="270" y="208" text-anchor="middle" class="tb">end</text><line x1="210" y1="128" x2="210" y2="152" class="sr" stroke-width="1.5" marker-end="url(#dsadp-a2)"/><line x1="162" y1="165" x2="196" y2="165" class="sr" stroke-width="1.5" marker-end="url(#dsadp-a2)"/><text x="340" y="60">robot moves only → or ↓</text><text x="340" y="90" class="tr">dp[r][c] = dp[r-1][c] + dp[r][c-1]</text><text x="340" y="112" class="tm">from above      from the left</text><text x="340" y="142">6 = 3 (top) + 3 (left)</text><text x="340" y="172" class="tm">purple edge cells = 1 way</text><text x="340" y="192" class="tm">(go straight along the wall)</text></svg><figcaption>Unique Paths on a 3 × 4 grid. Every cell is the sum of the cell above and the cell to its left, so filling row by row always has both ready. The bottom-right cell (10) is the answer.</figcaption></figure>
  <div class="fx" data-lang="py">def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]          # first row and column: 1 way
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # from top + from left
    return dp[m - 1][n - 1]

def unique_paths_1row(m, n):                 # space-optimised: one row
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]              # old row[c] = top, row[c-1] = new left
    return row[-1]

print(unique_paths(3, 4), unique_paths(3, 7), unique_paths(1, 1), unique_paths_1row(3, 7))</div>
  <div class="fx" data-lang="text">10 28 1 28</div>
  <p>Time O(m·n), space O(m·n) or O(n) with one row. Bonus: the answer is also C(m+n−2, m−1) (choose which of the m+n−2 moves are "down"), but the DP version survives obstacles, costs and other twists; the formula does not.</p>

  <h3>Knapsack: 0/1 vs unbounded</h3>
  <p>A thief with a bag of capacity W, items with weights and values. <strong>0/1</strong>: each item at most once. <strong>Unbounded</strong>: each item as many times as you like (like coins). State: <code>dp[w]</code> = best value with capacity w using the items seen so far. For each item, either skip it (<code>dp[w]</code> stays) or take it (<code>dp[w - wt] + val</code>).</p>
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
  <p>0/1 answer 35 = weight 1 (15) + weight 3 (20). The tempting pick, weight 4 (30), fills the bag alone, and 15 + 30 needs weight 5. Unbounded answer 60 = the weight-1 item four times (4 × 15).</p>
  <div class="callout intu"><span class="label">Key insight: the loop direction is the whole difference</span>
    <p>With one row, <code>dp[w - wt]</code> on the right side is either the <em>old</em> value (this item not yet used) or the <em>new</em> value (this item already used). Going right to left, <code>dp[w - wt]</code> has not been updated yet in this round, so the item is used at most once. Going left to right, it may already include this item, so the item can be reused. Same code, one reversed range.</p>
  </div>
  <p>A twist: <strong>Coin Change II</strong> counts the <em>combinations</em> of coins that make an amount. Coins outer loop, amount inner loop: each combination is counted once, in coin order. Swap the loops and you count <em>orderings</em> (1+2 and 2+1 twice).</p>
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

  <h3>Two strings: prefixes</h3>
  <p>With two strings a and b, the state is a pair of prefix lengths: <code>dp[i][j]</code> = answer for <code>a[:i]</code> and <code>b[:j]</code>. Look at the last characters <code>a[i-1]</code> and <code>b[j-1]</code>: if they match, go diagonally (<code>dp[i-1][j-1]</code>); if not, try dropping one from either side. Row 0 and column 0 (empty prefix) are the base cases. LCS and Edit Distance in Classic Problems are the two templates.</p>

  <h3>Interval: Longest Palindromic Substring and Burst Balloons</h3>
  <p>The state is a slice <code>dp[l][r]</code>. A slice depends on <em>shorter</em> slices inside it, so fill by length: all length-1, then length-2, and so on. For palindromes: <code>s[l..r]</code> is a palindrome if the ends match and <code>s[l+1..r-1]</code> is one. That DP is O(n²) time and space; in practice the simpler "expand around centre" is also O(n²) but O(1) space, and is what interviewers expect.</p>
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
  <p><strong>Burst Balloons</strong> is the famous hard interval DP. Bursting balloon k earns <code>left × k × right</code> with its current neighbours. Thinking "which balloon do I burst <em>first</em>?" fails: the neighbours change and the two sides get tangled. The trick is to ask "which balloon in (l, r) bursts <em>last</em>?" If k is last, its neighbours at that moment are exactly l and r (everything between is gone), and the left part (l, k) and right part (k, r) are independent.</p>
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
  <p>O(n³) time, O(n²) space. The "last, not first" flip is the reusable idea: it is how you make interval subproblems independent.</p>

  <h3>Tree DP</h3>
  <p>On a tree there is no array to fill. Instead, a post-order DFS (children first) returns a small tuple from each child to its parent. The tuple holds the answer for that subtree under each "state" of the child (robbed / not robbed, included / not included). House Robber III below is the template.</p>

  <h3>Bitmask DP (brief)</h3>
  <p>When the state must remember <em>which</em> items are already used and n is small (≤ 20), store that set as the bits of an integer. Bit j is 1 if item j is used. <code>mask | (1 &lt;&lt; j)</code> adds j, <code>mask &amp; (1 &lt;&lt; j)</code> tests it. Travelling Salesman: visit every city once and come home, shortest total. Brute force is (n−1)! orders; bitmask DP is 2ⁿ × n states × n work = O(2ⁿ n²). For n = 15 that is 7 million instead of 87 billion.</p>
  <div class="fx" data-lang="py">def tsp(dist):
    n = len(dist)
    @cache
    def go(mask, i):                          # visited set = mask, standing at city i
        if mask == (1 &lt;&lt; n) - 1:
            return dist[i][0]                 # all visited: return home
        best = float("inf")
        for j in range(n):
            if not mask &amp; (1 &lt;&lt; j):         # j not visited yet
                best = min(best, dist[i][j] + go(mask | (1 &lt;&lt; j), j))
        return best
    return go(1, 0)                           # start at city 0, only 0 visited

D = [[0, 10, 15, 20],
     [10, 0, 35, 25],
     [15, 35, 0, 30],
     [20, 25, 30, 0]]
print(tsp(D))</div>
  <div class="fx" data-lang="text">80</div>

  <h3>State machine: stock trading</h3>
  <p>Some problems have a few "modes" you switch between: holding a share or not, in cooldown or not, how many trades used. Draw the modes as circles and the allowed moves as arrows. The DP keeps the best cash for each mode, and every day updates all modes from yesterday's values.</p>
  <figure class="viz"><svg viewBox="0 0 600 260" width="600"><defs><marker id="dsadp-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><circle cx="300" cy="90" r="36" class="fb sb"/><text x="300" y="94" text-anchor="middle">hold</text><circle cx="470" cy="200" r="36" class="fr sr"/><text x="470" y="204" text-anchor="middle">sold</text><circle cx="130" cy="200" r="36" class="fg sg"/><text x="130" y="204" text-anchor="middle">rest</text><line x1="160" y1="180" x2="268" y2="110" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsadp-a3)"/><text x="190" y="128" text-anchor="middle">buy  −p</text><line x1="332" y1="110" x2="440" y2="180" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsadp-a3)"/><text x="412" y="128" text-anchor="middle">sell  +p</text><line x1="432" y1="208" x2="170" y2="208" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsadp-a3)"/><text x="300" y="228" text-anchor="middle">next day: cooldown</text><path d="M284,58 C268,14 332,14 316,58" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsadp-a3)"/><text x="345" y="28">wait</text><path d="M96,188 C58,170 58,232 96,214" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsadp-a3)"/><text x="40" y="250">wait</text></svg><figcaption>Best Time to Buy and Sell Stock with Cooldown as a state machine. Each day you are in exactly one state; each arrow is one choice. Keep the best cash for each state and update all three every day.</figcaption></figure>
  <p>Best Time to Buy and Sell Stock with Cooldown is solved below with exactly this picture. The other stock variants are the same idea with different circles: one transaction (two states), unlimited (two states), at most k (2k states), with a fee (subtract it on sell).</p>

  <h2 id="dsa-dp-problems"><span class="num">07</span>Classic Problems</h2>
  <p>Each problem: the 5-step recipe first, then the code, then edge cases. All code below was run; outputs are real.</p>

  <h3>1. House Robber</h3>
  <p>Houses in a row hold <code>[2, 7, 9, 3, 1]</code> rupees. You cannot rob two neighbours (the alarm is shared). Maximum loot? Brute force tries all 2ⁿ subsets. DP: at each house, the only question is "rob this one or not?"</p>
  <table class="tbl">
    <tr><th>Step</th><th>House Robber</th></tr>
    <tr><td>State</td><td><code>dp[i]</code> = best loot from the first i houses</td></tr>
    <tr><td>Recurrence</td><td>Skip house i: <code>dp[i-1]</code>. Rob it: <code>dp[i-2] + nums[i]</code>. Take the max.</td></tr>
    <tr><td>Base</td><td>0 houses → 0</td></tr>
    <tr><td>Order / space</td><td>Left to right; reads only the last two → two variables</td></tr>
    <tr><td>Answer</td><td>The last value</td></tr>
  </table>
  <table class="tbl out"><caption>Dry run on [2, 7, 9, 3, 1]</caption>
    <tr><th>house</th><th>skip = prev1</th><th>rob = prev2 + x</th><th>new best</th></tr>
    <tr><td>2</td><td>0</td><td>0 + 2</td><td>2</td></tr>
    <tr><td>7</td><td>2</td><td>0 + 7</td><td>7</td></tr>
    <tr><td>9</td><td>7</td><td>2 + 9</td><td>11</td></tr>
    <tr><td>3</td><td>11</td><td>7 + 3</td><td>11</td></tr>
    <tr><td>1</td><td>11</td><td>11 + 1</td><td>12 → answer (2 + 9 + 1)</td></tr>
  </table>
  <div class="fx" data-lang="py">def rob(nums):
    prev2, prev1 = 0, 0                 # best up to house i-2, i-1
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)   # skip x, or take x
    return prev1

for nums in [[1, 2, 3, 1], [2, 7, 9, 3, 1], [5], [], [2, 1, 1, 2]]:
    print(nums, "-&gt;", rob(nums))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 1] -&gt; 4
[2, 7, 9, 3, 1] -&gt; 12
[5] -&gt; 5
[] -&gt; 0
[2, 1, 1, 2] -&gt; 4</div>
  <p>O(n) time, O(1) space. <code>[2, 1, 1, 2]</code> catches the "take every other house" guess: the best is the two ends (2 + 2), skipping two houses in a row. Variant: houses in a circle (House Robber II) → run this twice, once without the first house and once without the last.</p>

  <h3>2. Coin Change (fewest coins)</h3>
  <p>Coins <code>[1, 2, 5]</code>, amount 11. Fewest coins? (5 + 5 + 1 = 3.) Return −1 if impossible. Greedy fails in general (see section 02), so try every coin as the <em>last</em> coin.</p>
  <p>State: <code>dp[a]</code> = fewest coins for amount a. Recurrence: <code>dp[a] = min(dp[a - c] + 1)</code> over coins c ≤ a. Base: <code>dp[0] = 0</code>, the rest infinity ("not reachable yet"). Fill a = 1 … amount; answer <code>dp[amount]</code> or −1.</p>
  <table class="tbl out"><caption>dp for coins [1, 2, 5]</caption>
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
    return dp[amount] if dp[amount] != INF else -1

for coins, amt in [([1, 2, 5], 11), ([2], 3), ([1], 0), ([1, 3, 4], 6), ([186, 419, 83, 408], 6249)]:
    print(coins, amt, "-&gt;", coin_change(coins, amt))</div>
  <div class="fx" data-lang="text">[1, 2, 5] 11 -&gt; 3
[2] 3 -&gt; -1
[1] 0 -&gt; 0
[1, 3, 4] 6 -&gt; 2
[186, 419, 83, 408] 6249 -&gt; 20</div>
  <p>O(amount × coins) time, O(amount) space. This is unbounded knapsack with "min count" instead of "max value". <code>[1, 3, 4], 6 → 2</code> is the greedy-killer case.</p>

  <h3>3. Longest Increasing Subsequence</h3>
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

  <h3>4. Minimum Path Sum</h3>
  <p>A grid of costs; move only right or down from top-left to bottom-right. Cheapest total? Same shape as Unique Paths, with <code>min</code> instead of <code>+</code> and the cell's own cost added.</p>
  <div class="fx" data-lang="py">def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]    # dp[r][c] = cheapest cost to reach (r, c)
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[0][0]
            elif r == 0:
                dp[r][c] = dp[r][c - 1] + grid[r][c]          # only from the left
            elif c == 0:
                dp[r][c] = dp[r - 1][c] + grid[r][c]          # only from above
            else:
                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
    return dp[-1][-1]

for g in [[[1, 3, 1], [1, 5, 1], [4, 2, 1]], [[1, 2, 3], [4, 5, 6]], [[7]], [[1], [2], [3]]]:
    print(g, "-&gt;", min_path_sum(g))</div>
  <div class="fx" data-lang="text">[[1, 3, 1], [1, 5, 1], [4, 2, 1]] -&gt; 7
[[1, 2, 3], [4, 5, 6]] -&gt; 12
[[7]] -&gt; 7
[[1], [2], [3]] -&gt; 6</div>
  <p>First example: 1 → 3 → 1 → 1 → 1 = 7. O(rows × cols) time; one row of space is enough. The first row and column are special because they have only one neighbour to come from; the single-cell and single-column grids test exactly that.</p>

  <h3>5. Partition Equal Subset Sum (0/1 knapsack)</h3>
  <p>Can <code>[1, 5, 11, 5]</code> be split into two groups with equal sums? Total 22, so we need a subset summing to 11 ({11} vs {1, 5, 5}: yes). This is 0/1 knapsack where the "value" is just "is this sum reachable?".</p>
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
  <p>O(n × target) time, O(target) space. If you loop s left to right, <code>[1]</code> with target 2 would wrongly reach 2 by using the 1 twice: that is the 0/1 vs unbounded bug.</p>

  <h3>6. Longest Common Subsequence</h3>
  <p>"abcde" and "ace": the longest sequence of characters appearing in both, in order (gaps allowed) is "ace", length 3. This is how <code>diff</code> finds unchanged lines between two files.</p>
  <p>State: <code>dp[i][j]</code> = LCS length of <code>a[:i]</code> and <code>b[:j]</code>. Last characters equal → <code>dp[i-1][j-1] + 1</code>; else <code>max(dp[i-1][j], dp[i][j-1])</code>. Row 0 and column 0 are 0 (empty string shares nothing). Answer <code>dp[m][n]</code>.</p>
  <table class="tbl out"><caption>dp for a = "abcde" (rows), b = "ace" (columns)</caption>
    <tr><th></th><th>∅</th><th>a</th><th>c</th><th>e</th></tr>
    <tr><th>∅</th><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><th>a</th><td>0</td><td><b>1</b></td><td>1</td><td>1</td></tr>
    <tr><th>b</th><td>0</td><td>1</td><td>1</td><td>1</td></tr>
    <tr><th>c</th><td>0</td><td>1</td><td><b>2</b></td><td>2</td></tr>
    <tr><th>d</th><td>0</td><td>1</td><td>2</td><td>2</td></tr>
    <tr><th>e</th><td>0</td><td>1</td><td>2</td><td><b>3</b></td></tr>
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
    return dp[m][n], "".join(reversed(out))

for a, b in [("abcde", "ace"), ("abc", "abc"), ("abc", "def"), ("", "x"), ("AGGTAB", "GXTXAYB")]:
    print(repr(a), repr(b), "-&gt;", lcs(a, b))</div>
  <div class="fx" data-lang="text">'abcde' 'ace' -&gt; (3, 'ace')
'abc' 'abc' -&gt; (3, 'abc')
'abc' 'def' -&gt; (0, '')
'' 'x' -&gt; (0, '')
'AGGTAB' 'GXTXAYB' -&gt; (4, 'GTAB')</div>
  <p>O(m·n) time and space; O(n) space if you only need the length (two rows). Rebuilding the actual string needs the full table: walk back from <code>dp[m][n]</code>, going diagonal on a match, else towards the bigger neighbour.</p>
  <div class="callout trap"><span class="label">Trap: index shift</span>
    <p>The table has one extra row and column for the empty prefix, so <code>dp[i][j]</code> talks about characters <code>a[i-1]</code> and <code>b[j-1]</code>. Writing <code>a[i] == b[j]</code> is the classic off-by-one here.</p>
  </div>

  <h3>7. Edit Distance</h3>
  <p>Fewest single-character edits (insert, delete, replace) to turn "horse" into "ros"? Answer 3: horse → rorse (replace h) → rose (delete r) → ros (delete e). Spell checkers use this to rank suggestions.</p>
  <p>State: <code>dp[i][j]</code> = edits to turn <code>a[:i]</code> into <code>b[:j]</code>. Last characters equal → <code>dp[i-1][j-1]</code> (free). Else 1 + min of delete <code>dp[i-1][j]</code>, insert <code>dp[i][j-1]</code>, replace <code>dp[i-1][j-1]</code>. Base: <code>dp[i][0] = i</code>, <code>dp[0][j] = j</code>.</p>
  <table class="tbl out"><caption>dp for "horse" (rows) → "ros" (columns)</caption>
    <tr><th></th><th>∅</th><th>r</th><th>o</th><th>s</th></tr>
    <tr><th>∅</th><td>0</td><td>1</td><td>2</td><td>3</td></tr>
    <tr><th>h</th><td>1</td><td>1</td><td>2</td><td>3</td></tr>
    <tr><th>o</th><td>2</td><td>2</td><td>1</td><td>2</td></tr>
    <tr><th>r</th><td>3</td><td>2</td><td>2</td><td>2</td></tr>
    <tr><th>s</th><td>4</td><td>3</td><td>3</td><td>2</td></tr>
    <tr><th>e</th><td>5</td><td>4</td><td>4</td><td><b>3</b></td></tr>
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
    return dp[m][n]

for a, b in [("horse", "ros"), ("intention", "execution"), ("", "abc"), ("same", "same"), ("kitten", "sitting")]:
    print(repr(a), repr(b), "-&gt;", min_distance(a, b))</div>
  <div class="fx" data-lang="text">'horse' 'ros' -&gt; 3
'intention' 'execution' -&gt; 5
'' 'abc' -&gt; 3
'same' 'same' -&gt; 0
'kitten' 'sitting' -&gt; 3</div>
  <p>O(m·n) time and space. Forgetting the base row/column (leaving them 0) is the most common bug: then converting "" to "abc" costs 0.</p>

  <h3>8. House Robber III (tree DP)</h3>
  <p>Houses form a binary tree; robbing a node and its direct child sets off the alarm. For each node there are two situations: we rob it, or we skip it. Each node returns both numbers to its parent.</p>
  <div class="flow"><span>rob node = val + skip(left) + skip(right)</span><span>skip node = best(left) + best(right)</span><span>answer = max of the root's pair</span></div>
  <div class="fx" data-lang="py">class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def rob_tree(root):
    def go(node):                       # returns (best if we ROB node, best if we SKIP node)
        if not node:
            return 0, 0
        l_rob, l_skip = go(node.left)   # children first (post-order)
        r_rob, r_skip = go(node.right)
        rob_it = node.val + l_skip + r_skip                 # children must be skipped
        skip_it = max(l_rob, l_skip) + max(r_rob, r_skip)   # children free to choose
        return rob_it, skip_it
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

for vals in [[3, 2, 3, None, 3, None, 1], [3, 4, 5, 1, 3, None, 1], [], [7], [4, 1, None, 2, None, 3]]:
    print(vals, "-&gt;", rob_tree(build(vals)))</div>
  <div class="fx" data-lang="text">[3, 2, 3, None, 3, None, 1] -&gt; 7
[3, 4, 5, 1, 3, None, 1] -&gt; 9
[] -&gt; 0
[7] -&gt; 7
[4, 1, None, 2, None, 3] -&gt; 7</div>
  <p>O(n) time, O(h) recursion stack. The last case (a chain 4-1-2-3) shows "rob every other level" is wrong: the best is 4 + 3, skipping two levels in the middle. A plain memo on nodes (<code>@cache</code> on <code>rob(node)</code> calling grandchildren) also works, but the pair-return is cleaner and has no cache.</p>

  <h3>9. Best Time to Buy and Sell Stock with Cooldown</h3>
  <p>Daily prices <code>[1, 2, 3, 0, 2]</code>. Buy and sell as often as you like, one share at a time, but after a sell you must wait one day before buying. Max profit? Answer 3: buy 1, sell 2, cooldown, buy 0, sell 2. Use the state machine drawn in section 06.</p>
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

  <h2 id="dsa-dp-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: a fuzzy state</span>
    <p>If you cannot say what <code>dp[i]</code> means in one sentence, the recurrence will be wrong. "Ending at i" vs "among the first i" changes both the recurrence and the answer (<code>max(dp)</code> vs <code>dp[n]</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong base case</span>
    <p>Counting problems need <code>dp[0] = 1</code> ("one way to make nothing"); min problems need <code>dp[0] = 0</code> and the rest infinity, not 0. Starting coin change with zeros makes every amount cost 0 coins.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: loop direction in 1-row knapsack</span>
    <p>0/1 (each item once): capacity from high to low. Unbounded (reuse allowed): low to high. Getting it backwards silently changes which problem you solve.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: off-by-one with the empty prefix</span>
    <p>String tables are (m+1) × (n+1). <code>dp[i][j]</code> compares <code>a[i-1]</code> with <code>b[j-1]</code>. Forgetting the extra row, or the −1, gives index errors or wrong answers on empty strings.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mutable or unhashable cache arguments</span>
    <p><code>@cache</code> needs hashable arguments: pass indexes or tuples, not lists. And a default <code>memo={}</code> in the signature is shared between calls (Python creates it once); use <code>memo=None</code> and create a new dict inside, as in section 03. A module-level <code>@cache</code> also keeps answers between test cases: clear it with <code>f.cache_clear()</code> or define the cached helper inside the main function.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: overwriting values you still need</span>
    <p>In space-optimised code, compute all new values from old ones before writing (tuple assignment), or save the old diagonal in a temp. The stock cooldown update is the classic example.</p>
  </div>

  <h2 id="dsa-dp-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Which two properties must a problem have for DP to help?</summary><div class="qa-body">Overlapping subproblems (the same smaller question is asked many times, so caching saves work) and optimal substructure (the best answer is built from best answers of subproblems). Merge sort has the second but not the first, so it is divide and conquer, not DP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is naive recursive Fibonacci exponential, and what does memoisation make it?</summary><div class="qa-body">Each call makes two calls and nothing is remembered, so fib(n−2)'s subtree is recomputed inside fib(n−1)'s; the call count grows like 1.6ⁿ (2.7 million for n = 30). With a cache each of the n+1 values is computed once: O(n) time, O(n) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List the 5 steps you write before coding a DP.</summary><div class="qa-body">1) State: what <code>dp[...]</code> means. 2) Recurrence: how it comes from smaller states (think about the last choice). 3) Base cases. 4) Fill order so dependencies are ready. 5) Where the answer is (one cell, or max over cells).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you estimate the time complexity of a DP?</summary><div class="qa-body">Number of states × work per state. LCS: (m+1)(n+1) states × O(1) = O(mn). LIS simple: n states × O(n) scan = O(n²). Burst Balloons: n² intervals × O(n) choices of last balloon = O(n³). TSP bitmask: 2ⁿ·n states × O(n) = O(2ⁿ n²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a 1-row 0/1 knapsack, why must the capacity loop go from high to low?</summary><div class="qa-body">The update reads <code>dp[w - wt]</code>. Going high to low, that cell still holds the value from before this item, so the item is counted at most once. Going low to high, <code>dp[w - wt]</code> may already include this item, which allows reuse: that is the unbounded knapsack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the O(n log n) LIS work?</summary><div class="qa-body">Keep <code>tails[k]</code> = smallest last value of any increasing run of length k+1; it stays sorted. For each x, <code>bisect_left</code> finds the first tail ≥ x: replace it (a smaller tail is easier to extend) or append if x is bigger than all. The length of tails is the LIS length.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Burst Balloons, why choose the balloon burst last instead of first?</summary><div class="qa-body">If k is burst first, its neighbours change later and the left and right sides affect each other. If k is burst last inside (l, r), its neighbours at that moment are exactly l and r, and the parts (l, k) and (k, r) are independent subproblems: <code>dp[l][r] = max(dp[l][k] + a[l]·a[k]·a[r] + dp[k][r])</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is DP done on a tree, e.g. House Robber III?</summary><div class="qa-body">Post-order DFS. Each node returns a pair (best if robbed, best if skipped). Robbed = val + both children's skipped; skipped = sum of max(pair) of each child. Answer = max of the root's pair. O(n) time, O(h) stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use bitmask DP, and what is the state for TSP?</summary><div class="qa-body">When the state must remember which subset of up to ~20 items is used. TSP: <code>dp[mask][i]</code> = shortest path that has visited exactly the cities in mask and stands at city i. O(2ⁿ n²) time, versus (n−1)! for trying every order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Model "stock with cooldown" as states. Why update with a tuple assignment?</summary><div class="qa-body">States: hold, sold (sold today), rest. hold = max(hold, rest − p); sold = hold + p; rest = max(rest, sold). All three must use yesterday's values; updating one first and reading it for another would allow buy-and-sell (or sell-and-buy) inside one day, breaking the cooldown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>DP vs backtracking: how do you pick?</summary><div class="qa-body">If the question asks for a count, a min/max, or yes/no, and states repeat, use DP. If it asks to list every solution (all permutations, all valid boards), the output itself is exponential, so backtracking (see the Backtracking note) is the tool; caching cannot shrink the output.</div></details>
</main>
`
});
