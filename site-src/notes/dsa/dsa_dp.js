// notes/dsa/dsa_dp.js — Dynamic Programming
Object.assign(TOPIC_CONTENT, {
  "dsa_dp": `<main>
<h1>Dynamic Programming</h1>
  <div class="where"><span>DSA</span><span>Techniques</span><span>Dynamic Programming</span></div>
  <p class="lead">Dynamic programming, usually shortened to DP, is recursion that remembers. When a problem breaks into smaller copies of itself and the same small copies keep coming back, DP solves each one once, writes the answer down, and reuses it, which turns brute force that takes exponential time into a table you could fill by hand. It is behind spell-check suggestions and <code>git diff</code>, route planning and speech recognition, and it makes up a large share of "hard" interview questions, mostly because people do not know how to find the table. This note starts from the waste you saw in the Backtracking note, fixes it with memoisation and then tabulation, gives a five-step recipe for designing any DP, and then applies the recipe family by family. The running example is one Biteful rider's evening shift, Ravi's: his staircase, the tips on his street, the traffic across the city grid, his bag's weight limit, his planned and actual stops, a customer's typo, and the shortest round trip through his customers.</p>

  <h2 id="dsa-dp-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dynamic Programming</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What and why</div>
        <ul>
          <li>Solve each subproblem once, store it, reuse it</li>
          <li>Needs <b>overlapping subproblems</b> + <b>optimal substructure</b></li>
          <li>fib(30): 2,692,537 calls → 59 with a memo</li>
          <li>Time = states × work per state</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two ways to write it</div>
        <ul>
          <li><b>Memoisation</b>: recursion + cache (<code>@cache</code>)</li>
          <li><b>Tabulation</b>: loop filling a table in dependency order</li>
          <li>Memo hits the recursion limit; tables do not</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The recipe</div>
        <ul>
          <li><b>State</b>: what dp[i] means, in one sentence</li>
          <li><b>Transition</b>: think about the last choice</li>
          <li><b>Base</b> · <b>order</b> · <b>answer</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Families</div>
        <ul>
          <li>1-D, grid, two sequences, knapsack</li>
          <li>Interval dp[l][r], tree (use, skip), bitmask dp[mask][i]</li>
          <li>Space: keep only the rows you read</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-dp-memo"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Repeated Subproblems and Memoisation</span><span class="rm-sub">why recursion is slow, and remembering answers</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-tab"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Tabulation (Bottom-Up)</span><span class="rm-sub">filling a table without recursion</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-recipe"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The State &amp; Transition Recipe</span><span class="rm-sub">five steps to design any DP</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-1d"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">1-D DP</span><span class="rm-sub">House Robber and Coin Change</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-2d"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">2-D DP: Grids and Two Sequences</span><span class="rm-sub">grid paths and longest common subsequence</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-knap"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Knapsack</span><span class="rm-sub">best value under a capacity limit</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-str"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Edit Distance</span><span class="rm-sub">string DP with insert, delete, replace</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-interval"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Interval DP</span><span class="rm-sub">answers for slices l..r</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-tree"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">DP on Trees and Bitmasks</span><span class="rm-sub">states that are nodes or sets</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-space"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Space Optimisation</span><span class="rm-sub">keeping only what the recurrence reads</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-patterns"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Choosing the Family</span><span class="rm-sub">trigger words, skeleton, DP vs greedy vs backtracking</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-problems"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">LIS, partition, stock, word break, practice order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">base cases, loop direction, index shifts</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">recurrences, costs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-dp-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about DP</span></div></div>
    </div>
  </div>

  <h2 id="dsa-dp-memo"><span class="num">01</span>Repeated Subproblems and Memoisation</h2>
  <p>Start with something you already know: the Fibonacci numbers 0, 1, 1, 2, 3, 5, 8, 13, …, where each number is the sum of the two before it. The recursive code is a direct copy of that sentence, and it is correct. Let us count how many calls it makes:</p>
  <div class="fx" data-lang="py">calls = 0
def fib(n):
    global calls
    calls += 1
    if n &lt; 2:
        return n
    return fib(n - 1) + fib(n - 2)

for n in [5, 20, 30]:
    calls = 0
    print(f"fib({n}) = {fib(n)}  calls = {calls:,}")</div>
  <div class="fx" data-lang="text">fib(5) = 5  calls = 15
fib(20) = 6765  calls = 21,891
fib(30) = 832040  calls = 2,692,537</div>
  <p>For n = 30 there are only 31 different questions to answer, fib(0) up to fib(30), yet the code makes 2.7 million calls. The picture of the calls for fib(5) shows where the work goes.</p>
  <figure class="viz"><svg viewBox="0 0 600 306" width="600"><line x1="300" y1="42" x2="170" y2="73" stroke="currentColor" /><line x1="300" y1="42" x2="440" y2="73" stroke="currentColor" /><line x1="170" y1="97" x2="95" y2="128" stroke="currentColor" /><line x1="170" y1="97" x2="245" y2="128" stroke="currentColor" /><line x1="440" y1="97" x2="390" y2="128" stroke="currentColor" /><line x1="440" y1="97" x2="490" y2="128" stroke="currentColor" /><line x1="95" y1="152" x2="55" y2="183" stroke="currentColor" /><line x1="95" y1="152" x2="135" y2="183" stroke="currentColor" /><line x1="245" y1="152" x2="215" y2="183" stroke="currentColor" /><line x1="245" y1="152" x2="275" y2="183" stroke="currentColor" /><line x1="390" y1="152" x2="360" y2="183" stroke="currentColor" /><line x1="390" y1="152" x2="420" y2="183" stroke="currentColor" /><line x1="55" y1="207" x2="30" y2="238" stroke="currentColor" /><line x1="55" y1="207" x2="80" y2="238" stroke="currentColor" /><rect x="278" y="18" width="44" height="24" rx="5" class="fb sb"/><text x="300" y="34" text-anchor="middle">f(5)</text><rect x="148" y="73" width="44" height="24" rx="5" class="fb sb"/><text x="170" y="89" text-anchor="middle">f(4)</text><rect x="418" y="73" width="44" height="24" rx="5" class="fg sg"/><text x="440" y="89" text-anchor="middle">f(3)</text><rect x="73" y="128" width="44" height="24" rx="5" class="fr sr"/><text x="95" y="144" text-anchor="middle">f(3)</text><rect x="223" y="128" width="44" height="24" rx="5" class="fg sg"/><text x="245" y="144" text-anchor="middle">f(2)</text><rect x="368" y="128" width="44" height="24" rx="5" class="fr sr"/><text x="390" y="144" text-anchor="middle">f(2)</text><rect x="468" y="128" width="44" height="24" rx="5" class="fv sb"/><text x="490" y="144" text-anchor="middle">f(1)</text><rect x="33" y="183" width="44" height="24" rx="5" class="fr sr"/><text x="55" y="199" text-anchor="middle">f(2)</text><rect x="113" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="135" y="199" text-anchor="middle">f(1)</text><rect x="193" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="215" y="199" text-anchor="middle">f(1)</text><rect x="253" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="275" y="199" text-anchor="middle">f(0)</text><rect x="338" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="360" y="199" text-anchor="middle">f(1)</text><rect x="398" y="183" width="44" height="24" rx="5" class="fv sb"/><text x="420" y="199" text-anchor="middle">f(0)</text><rect x="8" y="238" width="44" height="24" rx="5" class="fv sb"/><text x="30" y="254" text-anchor="middle">f(1)</text><rect x="58" y="238" width="44" height="24" rx="5" class="fv sb"/><text x="80" y="254" text-anchor="middle">f(0)</text><rect x="400" y="225" width="14" height="14" class="fg sg"/><text x="420" y="237">first time</text><rect x="400" y="245" width="14" height="14" class="fr sr"/><text x="420" y="257" class="tr">repeat (wasted)</text><rect x="400" y="265" width="14" height="14" class="fv sb"/><text x="420" y="277">base case</text><text x="300" y="296" text-anchor="middle" class="tm">15 calls for f(5) · f(3) twice · f(2) three times · grows like 1.6^n</text></svg><figcaption>The call tree of plain recursive fib(5). Red boxes are sub-questions that were already answered somewhere else in the tree and are being answered again.</figcaption></figure>
  <p>fib(5) asks for fib(4) and fib(3). But fib(4) <em>also</em> asks for fib(3), and since nobody remembers the first answer, the whole fib(3) subtree is computed a second time. Inside those subtrees, fib(2) is computed three times. The repeats contain repeats of their own, which is why the call count grows like 1.6<sup>n</sup>: add 1 to n and the work grows by about 60%. A smaller question that has to be answered on the way to the big one is called a <strong>subproblem</strong>, and when the same subproblems come up again and again we say the problem has <strong>overlapping subproblems</strong>.</p>
  <p>Think of a shopkeeper who adds up the same 20-item bill every time a customer asks "how much was it?". A sensible shopkeeper writes the total on the bill the first time, and next time just reads it. Doing exactly that in code is called <strong>memoisation</strong> (from "memo", a note to yourself): before computing an answer, check whether you have already written it down; after computing it, write it down. The notebook is just a dictionary from the arguments to the answer, the hash map from <a class="xref" data-note="dsa_hashing">Hashing</a>.</p>
  <div class="fx" data-lang="py">calls = 0
def fib_memo(n, memo=None):
    global calls
    calls += 1
    if memo is None:
        memo = {}                        # a fresh notebook for each top-level call
    if n &lt; 2:
        return n
    if n not in memo:                    # first time: compute and write it down
        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]                       # every later time: just read it

for n in [5, 20, 30]:
    calls = 0
    print(f"fib({n}) = {fib_memo(n)}  calls = {calls}")</div>
  <div class="fx" data-lang="text">fib(5) = 5  calls = 9
fib(20) = 6765  calls = 39
fib(30) = 832040  calls = 59</div>
  <p>fib(30) now takes 59 calls instead of 2,692,537. Each of the 31 values is computed once, and most values are asked for one extra time, when the answer is simply read from the dictionary; that is why the count is 59 and not 31. The growth has become linear: every extra n adds two calls. The <code>memo=None</code> default with a fresh dictionary created inside matters: writing <code>memo={}</code> in the signature would create one dictionary when the function is defined and silently share it between unrelated calls.</p>
  <p>Python can manage the dictionary for you. The <code>@cache</code> decorator from <code>functools</code> (Python 3.9 and later; <code>@lru_cache(maxsize=None)</code> on older versions) wraps the function so that its arguments become the dictionary key and the return value is stored. The arguments must therefore be hashable: integers, strings and tuples, not lists.</p>
  <div class="fx" data-lang="py">from functools import cache

@cache                                   # Python keeps the dict: arguments -&gt; result
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
    fib_deep(5000)                       # empty cache: 5000 calls nested inside each other
except RecursionError as e:
    print("RecursionError:", e)</div>
  <div class="fx" data-lang="text">12586269025
CacheInfo(hits=48, misses=51, maxsize=None, currsize=51)
RecursionError: maximum recursion depth exceeded</div>
  <p><code>cache_info()</code> confirms what happened: 51 misses, one for each of fib(0) to fib(50) computed for the first time, and 48 hits, where an answer was reused. Without the cache, fib(50) would take about 40 billion calls. The last line shows memoisation's weak spot. With an empty cache, <code>fib_deep(5000)</code> must call <code>fib_deep(4999)</code>, which calls <code>fib_deep(4998)</code>, and so on, 5000 calls waiting inside each other on the call stack, and Python stops at about 1000. The work is tiny, but the recursion is too deep.</p>
  <p>Memoisation is also called <strong>top-down DP</strong>, because it starts from the big question and lets the recursion ask for the smaller ones it needs. Its cost follows a rule that holds for every DP: time is the number of distinct states (different argument values) multiplied by the work done per state, and space is the size of the cache plus the depth of the recursion. For Fibonacci that is n states × O(1) work = O(n) time and O(n) space. Reach for memoisation when you already have a correct but slow recursive solution whose arguments repeat; adding a cache is often the fastest route to a working DP in an interview.</p>

  <h2 id="dsa-dp-tab"><span class="num">02</span>Tabulation (Bottom-Up)</h2>
  <p>Memoisation removed the repeated work but kept the recursion, and with it the stack-depth problem. Look at what fib(k) needs: only fib(k − 1) and fib(k − 2). If we compute the answers in order from small k upwards, everything a value needs is always ready before we need it, and we do not need recursion at all. Make a list <code>dp</code> where <code>dp[i]</code> holds fib(i), fill in the base cases by hand, and fill every other cell with a loop. This is <strong>tabulation</strong>, or <strong>bottom-up DP</strong>: answers are written into a table starting from the smallest subproblems.</p>
  <div class="fx" data-lang="py">def fib_table(n):
    if n &lt; 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1                            # base cases: dp[0] = 0, dp[1] = 1
    for i in range(2, n + 1):            # small to big: dp[i-1] and dp[i-2] are ready
        dp[i] = dp[i - 1] + dp[i - 2]
        print(f"dp[{i}] = dp[{i-1}] + dp[{i-2}] = {dp[i-1]} + {dp[i-2]} = {dp[i]}")
    return dp[n]

print("fib(7) =", fib_table(7))</div>
  <div class="fx" data-lang="text">dp[2] = dp[1] + dp[0] = 1 + 0 = 1
dp[3] = dp[2] + dp[1] = 1 + 1 = 2
dp[4] = dp[3] + dp[2] = 2 + 1 = 3
dp[5] = dp[4] + dp[3] = 3 + 2 = 5
dp[6] = dp[5] + dp[4] = 5 + 3 = 8
dp[7] = dp[6] + dp[5] = 8 + 5 = 13
fib(7) = 13</div>
  <p>Each line fills one cell from two cells to its left that are already filled: <code>dp[7] = dp[6] + dp[5] = 8 + 5 = 13</code>. Because there is no recursion, there is no depth limit either:</p>
  <div class="fx" data-lang="py">def fib_table(n):
    dp = [0, 1] + [0] * max(0, n - 1)
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

print("fib(5000) has", len(str(fib_table(5000))), "digits")   # no recursion, no limit</div>
  <div class="fx" data-lang="text">fib(5000) has 1045 digits</div>
  <p>The same fib(5000) that crashed the memoised version is computed by the loop without trouble (Python integers grow as large as needed, so the answer simply has 1,045 digits). Think of filling in a multiplication table at school: you fill the small entries first, and each new entry is built from ones already on the page.</p>
  <p>The two styles have the same Big-O, but they suit different situations, and interviewers like to ask about the difference:</p>
  <table class="tbl">
    <tr><th></th><th>Memoisation (top-down)</th><th>Tabulation (bottom-up)</th></tr>
    <tr><td>How it looks</td><td>recursion + cache</td><td>loop + list or grid</td></tr>
    <tr><td>Order of work</td><td>automatic: recursion asks for what it needs</td><td>you must choose an order where inputs are ready</td></tr>
    <tr><td>Computes</td><td>only the states actually reached</td><td>every state in the table</td></tr>
    <tr><td>Depth limit</td><td>about 1000 nested calls in Python</td><td>none</td></tr>
    <tr><td>Saving memory</td><td>hard: the cache holds everything</td><td>easy: keep only the rows you still read</td></tr>
    <tr><td>Good for</td><td>finding the recurrence, sparse states, trees</td><td>final solutions, large inputs, space tricks</td></tr>
  </table>
  <p>The one thing tabulation asks of you is the fill order. If a cell reads a neighbour that has not been computed yet, it silently reads the initial 0 and produces a wrong answer with no error. So before writing the loop, say out loud which cells each cell reads, and make the loop visit those first: smaller i first, rows top to bottom, short intervals before long ones.</p>

  <h2 id="dsa-dp-recipe"><span class="num">03</span>The State &amp; Transition Recipe</h2>
  <p>For Fibonacci the formula was handed to us. In a new problem nobody gives you "dp[i] = dp[i − 1] + dp[i − 2]"; you have to invent the table. First check that DP applies at all. It needs two properties. We have met <strong>overlapping subproblems</strong>: the same smaller questions recur, so caching saves work (merge sort's two halves never share work, so caching would not help it). The second is <strong>optimal substructure</strong>: the best answer to the big problem is built from the best answers to smaller ones. Shortest routes have it, because any piece of a shortest route is itself a shortest route between its ends; the longest simple path in a graph does not, so DP cannot solve it.</p>
  <p>Then design the DP with five steps, written as comments before any code. The <strong>state</strong> is the small set of numbers that fully describes one subproblem, and you must be able to say what <code>dp[...]</code> means in one plain sentence. The <strong>transition</strong>, also called the recurrence, expresses a state's answer through smaller states. The <strong>base cases</strong> are the smallest states, answered without the rule. The <strong>order</strong> is the sequence in which a table can be filled so every state's inputs are ready. The <strong>answer</strong> says which state (or which combination of states) is the final result.</p>
  <p>Let us use the recipe on a real question. Ravi delivers to a flat at the top of a 5-step staircase and, being in a hurry, climbs either 1 or 2 steps per stride. In how many different ways can he reach the top? Small cases by hand suggest a pattern: 1 step has one way, 2 steps have two (1+1 or 2), 3 steps have three (1+1+1, 1+2, 2+1), 4 steps have five. The recipe explains <em>why</em>. The state is <code>ways(i)</code>, the number of ways to stand on step i. For the transition, the trick that works almost every time is to <strong>think about the last move</strong>: how did Ravi arrive on step i? His last stride was either 1 step, from step i − 1, or 2 steps, from step i − 2. Every way of reaching step i falls into exactly one of those two groups, and each group is a smaller copy of the same problem, so <code>ways(i) = ways(i − 1) + ways(i − 2)</code>. The base cases are <code>ways(0) = 1</code> (one way to climb no steps: do nothing) and <code>ways(1) = 1</code>. Each state depends on smaller i, so the order is i from 2 upwards, and the answer is <code>ways(5)</code>.</p>
  <div class="fx" data-lang="py">from functools import cache

def climb_top_down(n):
    @cache
    def ways(i):                 # 1. state: number of ways to stand on step i
        if i &lt;= 1:
            return 1             # 3. base: step 0 (do nothing) and step 1
        return ways(i - 1) + ways(i - 2)   # 2. last stride was 1 or 2 steps
    return ways(n)               # 5. answer

def climb_bottom_up(n):
    dp = [1] * (n + 1)           # dp[0] = dp[1] = 1
    for i in range(2, n + 1):    # 4. order: small to big
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp

print("Ravi's staircase, 5 steps: dp =", climb_bottom_up(5))
print([climb_top_down(n) for n in range(1, 11)])</div>
  <div class="fx" data-lang="text">Ravi's staircase, 5 steps: dp = [1, 1, 2, 3, 5, 8]
[1, 2, 3, 5, 8, 13, 21, 34, 55, 89]</div>
  <p>Both versions give 8 ways for 5 steps, and the list shows the familiar Fibonacci numbers, which is no coincidence: the recurrence is the same. Notice the odd-looking base case <code>ways(0) = 1</code>. It is what makes <code>ways(2) = ways(1) + ways(0) = 2</code> come out right, and counting problems almost always start from "one way to make nothing". Thinking about the last move works for every kind of DP: for counting you add the groups, for "best" problems you take the <code>min</code> or <code>max</code> over the groups, and for yes/no problems you <code>or</code> them together.</p>
  <p>The most common way to go wrong is a fuzzy state. If you cannot say what <code>dp[i]</code> means in one sentence, the recurrence will be wrong. Small wording differences matter: "the best answer among the first i items" and "the best answer that ends exactly at item i" lead to different recurrences and different final answers (<code>dp[n]</code> versus <code>max(dp)</code>). In an interview, saying the five steps out loud before coding earns as much credit as the code.</p>

  <h2 id="dsa-dp-1d"><span class="num">04</span>1-D DP</h2>
  <p>The staircase only counted. Most 1-D problems carry a choice with a value at each position. Five orders sit in a row along Ravi's street, with tips of ₹2, 7, 9, 3 and 1. Two neighbouring orders are always due at the same minute, so he can never take both of a neighbouring pair. Which orders should he take for the most tips? This is the classic House Robber problem (LeetCode 198). Trying every allowed subset of orders is 2<sup>n</sup> work.</p>
  <p>With the recipe: the state is <code>dp[i]</code>, the best tips from the first i orders. For the last choice, look at order i itself. If Ravi skips it, the best is whatever was best for the first i − 1 orders. If he takes it, he must have skipped order i − 1, so the best is the best for the first i − 2 orders plus this tip. So <code>dp[i] = max(dp[i − 1], dp[i − 2] + tip[i])</code>, with 0 for no orders. Because each step only reads the two previous answers, two variables are enough:</p>
  <div class="fx" data-lang="py">def rob_trace(tips):
    prev2, prev1 = 0, 0                 # best from the orders up to i-2, up to i-1
    for x in tips:
        skip, take = prev1, prev2 + x
        prev2, prev1 = prev1, max(skip, take)
        print(f"tip {x}: skip={skip:2}  take={take:2}  best={prev1}")
    return prev1

print("best tips:", rob_trace([2, 7, 9, 3, 1]))    # Ravi's street, 5 orders in a row</div>
  <div class="fx" data-lang="text">tip 2: skip= 0  take= 2  best=2
tip 7: skip= 2  take= 7  best=7
tip 9: skip= 7  take=11  best=11
tip 3: skip=11  take=10  best=11
tip 1: skip=11  take=12  best=12
best tips: 12</div>
  <p>Read the third line: at the ₹9 order, skipping keeps the best so far (7), while taking adds 9 to the best from two orders back (2), giving 11, so the new best is 11. At the ₹3 order, taking would give only 7 + 3 = 10, so he skips it. The final answer, 12, is 2 + 9 + 1. The tempting shortcut "take every other order" fails on tips like [2, 1, 1, 2], where the best is the two ends; the DP handles that automatically because it compares both options at every position. O(n) time and O(1) space.</p>
  <p>The second classic 1-D problem is Coin Change (LeetCode 322). Ravi must hand back ₹11 in change using coins of ₹1, 2 and 5: what is the fewest number of coins? The state is <code>dp[a]</code>, the fewest coins that make amount a. For the last choice, the last coin handed over was some coin c no bigger than a, and before it Ravi had made a − c, so <code>dp[a] = 1 + min(dp[a − c])</code> over all coins c ≤ a. The base case is <code>dp[0] = 0</code>, and every other amount starts at infinity, meaning "not reachable yet"; starting them at 0 would claim every amount costs nothing.</p>
  <div class="fx" data-lang="py">def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount           # dp[a] = fewest coins that make amount a
    for a in range(1, amount + 1):
        for c in coins:
            if c &lt;= a and dp[a - c] + 1 &lt; dp[a]:
                dp[a] = dp[a - c] + 1   # c is the last coin
    return dp

dp = coin_change([1, 2, 5], 11)          # Ravi hands back Rs 11 in change
print("a :", list(range(12)))
print("dp:", dp)
print("coins [1, 3, 4], amount 6 -&gt;", coin_change([1, 3, 4], 6)[6], "coins")
print("coins [2], amount 3       -&gt;", coin_change([2], 3)[3])</div>
  <div class="fx" data-lang="text">a : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
dp: [0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3]
coins [1, 3, 4], amount 6 -&gt; 2 coins
coins [2], amount 3       -&gt; inf</div>
  <p>dp[11] = 1 + min(dp[10], dp[9], dp[6]) = 1 + min(2, 3, 2) = 3, which is 5 + 5 + 1. The third line is important. With coins of 1, 3 and 4, the greedy idea "always hand over the biggest coin that fits" gives 4 + 1 + 1 = three coins, but the DP finds 3 + 3 = two coins, because it tries every possible last coin at every amount instead of committing to one. The last line shows an impossible amount: ₹3 from ₹2 coins stays at infinity, which a full solution turns into −1. Coin Change costs O(amount × number of coins). Recognise 1-D DP from phrases like "houses in a row", "no two adjacent", "ways to climb", "fewest coins to make", "ways to decode" and "can the string be split into words".</p>

  <h2 id="dsa-dp-2d"><span class="num">05</span>2-D DP: Grids and Two Sequences</h2>
  <p>One index was enough because Ravi moved along a line. Across the city he rides on a grid of blocks from the kitchen in the top-left corner to a customer in the bottom-right, moving only east or south. How many different routes are there, and if each block takes a known number of traffic minutes to cross, which route is quickest? One number can no longer describe "where we are"; we need a row and a column, so the state becomes <code>dp[r][c]</code>.</p>
  <p>For counting routes (Unique Paths, LeetCode 62) the last move into block (r, c) came either from the north, block (r − 1, c), or from the west, block (r, c − 1), so <code>dp[r][c] = dp[r − 1][c] + dp[r][c − 1]</code>. Blocks along the top row and left column have only one way in, straight along the edge, so they are 1. For the quickest route (Minimum Path Sum, LeetCode 64) the shape is identical with <code>min</code> instead of <code>+</code>, plus the block's own minutes: <code>dp[r][c] = min(north, west) + traffic[r][c]</code>. Filling row by row, left to right, guarantees the north and west neighbours are always ready.</p>
  <div class="fx" data-lang="py">def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]          # first row and column: one way in
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # from the north + from the west
    return dp

def min_path_sum(grid):
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

print("routes on a 3 x 4 grid:")
for row in unique_paths(3, 4):
    print(" ", row)
traffic = [[1, 3, 1],                         # minutes to cross each block
           [1, 5, 1],
           [4, 2, 1]]
print("quickest minutes:")
for row in min_path_sum(traffic):
    print(" ", row)</div>
  <div class="fx" data-lang="text">routes on a 3 x 4 grid:
  [1, 1, 1, 1]
  [1, 2, 3, 4]
  [1, 3, 6, 10]
quickest minutes:
  [1, 4, 5]
  [2, 7, 6]
  [6, 8, 7]</div>
  <p>In the route table, every cell is the sum of the cell above and the cell to its left: the 6 in the bottom row is 3 from the north plus 3 from the west, and the bottom-right corner gives 10 routes. In the minutes table, the bottom-right cell 7 is min(6 from the north, 8 from the west) + 1; the quickest ride goes east, east, south, south through blocks costing 1, 3, 1, 1, 1. The edge cells needed their own branches in the code because they have only one neighbour to come from.</p>
  <p>The same 2-D table also compares two sequences. Ravi's plan for the evening was stops A B C D E, and the GPS log shows he visited A C E. How many planned stops did he visit in the planned order? A <strong>subsequence</strong> keeps the order of a sequence but may skip items, and the longest sequence that is a subsequence of both lists is the <strong>longest common subsequence</strong>, or LCS. It is how <code>diff</code> finds the unchanged lines between two versions of a file.</p>
  <p>The state is a pair of prefix lengths: <code>dp[i][j]</code> is the LCS of the first i planned stops and the first j visited stops. Look at the last stop of each prefix, <code>a[i − 1]</code> and <code>b[j − 1]</code> (the −1 is there because the table has an extra row and column for empty prefixes). If they are equal, that stop belongs to the common subsequence, and the rest is the LCS of both shorter prefixes: <code>dp[i − 1][j − 1] + 1</code>, the diagonal neighbour plus one. If they differ, at least one of them is not in the LCS, so drop one or the other and keep the better: <code>max(dp[i − 1][j], dp[i][j − 1])</code>. Row 0 and column 0 stand for an empty prefix and are 0.</p>
  <div class="fx" data-lang="py">def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[i][j] = LCS of a[:i] and b[:j]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1          # match: diagonal + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # drop one stop from either side
    out, i, j = [], m, n                 # walk back from the corner to rebuild one LCS
    while i and j:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1]); i -= 1; j -= 1
        elif dp[i - 1][j] &gt;= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dp, "".join(reversed(out))

planned, actual = "ABCDE", "ACE"                 # planned stops vs stops in the GPS log
dp, common = lcs(planned, actual)
print("  ∅  " + "  ".join(actual))
for ch, row in zip("∅" + planned, dp):
    print(ch, row)
print("LCS =", dp[-1][-1], common)</div>
  <div class="fx" data-lang="text">  ∅  A  C  E
∅ [0, 0, 0, 0]
A [0, 1, 1, 1]
B [0, 1, 1, 1]
C [0, 1, 2, 2]
D [0, 1, 2, 2]
E [0, 1, 2, 3]
LCS = 3 ACE</div>
  <p>Each match shows up as a step up along the diagonal: A meets A and the value becomes 1, C meets C and it becomes 2, E meets E and it becomes 3. Rows B and D, which match nothing, just copy the best from above or the left. The answer, 3, is in the bottom-right corner, and walking back from that corner (diagonally on a match, otherwise towards the larger neighbour) rebuilds the actual sequence ACE. Both grid problems and LCS cost <strong>O(rows × columns)</strong> time and space. Recognise them from "grid", "move only right or down", "two strings", "common subsequence", "minimum deletions to make two strings equal".</p>

  <h2 id="dsa-dp-knap"><span class="num">06</span>Knapsack</h2>
  <p>Three orders are waiting at the restaurant: 1 kg with a ₹15 tip, 3 kg with ₹20, and 4 kg with ₹30. Ravi's bag holds 4 kg. Which orders should he carry for the most tips? Greedy by tip takes the 4 kg order alone for ₹30, which turns out to be wrong. This is the <strong>0/1 knapsack</strong> problem: each item is either taken whole, once, or left behind (the "0/1"), and the total weight may not exceed the capacity. Think of packing a suitcase with a weight limit at the airport: every item is a yes-or-no decision, and the decisions compete for the same space.</p>
  <p>The state has to remember two things: which orders have been considered, and how much room is left. So <code>dp[i][w]</code> is the best tips using only the first i orders with a bag of w kg. For order i with weight wt and tip val, the last choice is to skip it, giving <code>dp[i − 1][w]</code>, or, if it fits, take it once, giving <code>dp[i − 1][w − wt] + val</code>. With no orders the best is 0 for every bag size.</p>
  <div class="fx" data-lang="py">def knapsack_table(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]   # dp[i][w]: first i orders, bag of w kg
    for i in range(1, n + 1):
        wt, val = weights[i - 1], values[i - 1]
        for w in range(cap + 1):
            dp[i][w] = dp[i - 1][w]                          # skip order i
            if wt &lt;= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt] + val)   # take it once
    return dp

W, V = [1, 3, 4], [15, 20, 30]          # order weights (kg) and tips (Rs); the bag holds 4 kg
dp = knapsack_table(W, V, 4)
print("w:      ", list(range(5)))
for i, row in enumerate(dp):
    label = "none" if i == 0 else f"+{W[i-1]}kg/{V[i-1]}"
    print(f"{label:8}", row)</div>
  <div class="fx" data-lang="text">w:       [0, 1, 2, 3, 4]
none     [0, 0, 0, 0, 0]
+1kg/15  [0, 15, 15, 15, 15]
+3kg/20  [0, 15, 15, 20, 35]
+4kg/30  [0, 15, 15, 20, 35]</div>
  <p>Read the table row by row. With only the 1 kg order, any bag of 1 kg or more earns ₹15. Adding the 3 kg order, a 4 kg bag can now take both: <code>dp[1][1] + 20 = 15 + 20 = 35</code>. Adding the 4 kg order, the last cell compares 35 (skip it) with <code>dp[2][0] + 30 = 30</code> (take it alone) and keeps 35. So the answer is ₹35, from the 1 kg and 3 kg orders. Each row reads only the row above it, and that is exactly what "each order at most once" means.</p>
  <p>Because each row reads only the previous row, we can keep a single row <code>dp[w]</code> and update it in place, one order at a time. Then the direction of the w loop decides which problem you are solving. Going from high w down to low w, the cell <code>dp[w − wt]</code> on the right-hand side has not been updated yet in this round, so it still holds the "row above" value and each order is used at most once. Going from low to high, <code>dp[w − wt]</code> may already include this order, so the order can be used again. That second version is the <strong>unbounded knapsack</strong>, where every item has unlimited copies, like coins:</p>
  <div class="fx" data-lang="py">def knapsack_01(weights, values, cap):
    dp = [0] * (cap + 1)                      # dp[w] = best tips with capacity w
    for wt, val in zip(weights, values):
        for w in range(cap, wt - 1, -1):      # RIGHT to LEFT: each order at most once
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[cap]

def knapsack_unbounded(weights, values, cap):
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):
        for w in range(wt, cap + 1):          # LEFT to RIGHT: an order may repeat
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[cap]

W, V = [1, 3, 4], [15, 20, 30]
print("0/1:", knapsack_01(W, V, 4), "  unbounded:", knapsack_unbounded(W, V, 4))</div>
  <div class="fx" data-lang="text">0/1: 35   unbounded: 60</div>
  <p>The same code with one reversed range gives ₹35 for the 0/1 version and ₹60 for the unbounded one (the 1 kg order four times). This loop direction is the single most common knapsack bug, so it is worth remembering the reason, not just the rule.</p>
  <p>Knapsack also counts. Coin Change II (LeetCode 518) asks how many <em>combinations</em> of coins make an amount. Using coins as the outer loop and amounts as the inner loop counts each combination once, because coins are added in a fixed order. Swapping the loops counts every <em>ordering</em> separately, which is a different problem (Combination Sum IV):</p>
  <div class="fx" data-lang="py">def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1                                 # one way to make 0: take nothing
    for coin in coins:                        # coins OUTER -&gt; each combination once
        for a in range(coin, amount + 1):
            dp[a] += dp[a - coin]
    return dp[amount]

def change_orderings(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for a in range(1, amount + 1):            # amount OUTER -&gt; every ordering counted
        for coin in coins:
            if coin &lt;= a:
                dp[a] += dp[a - coin]
    return dp[amount]

print("combinations:", change(5, [1, 2, 5]), "  orderings:", change_orderings(5, [1, 2, 5]))</div>
  <div class="fx" data-lang="text">combinations: 4   orderings: 9</div>
  <p>₹5 from coins 1, 2 and 5 can be made in 4 combinations (5; 2+2+1; 2+1+1+1; 1+1+1+1+1) but 9 orderings, because 2+1+1+1 and 1+2+1+1 count separately in the second version. Knapsack costs <strong>O(n × W)</strong> time for n items and capacity W, and O(W) space with one row. This is called pseudo-polynomial, because it grows with the value of W rather than the number of digits needed to write it. Recognise knapsack from "capacity", "budget", "weight limit", "pick items", "subset that sums to", "partition into two equal sums" and "number of ways to make an amount".</p>

  <h2 id="dsa-dp-str"><span class="num">07</span>Edit Distance</h2>
  <p>LCS compared two sequences but could only keep or drop items. A customer types "sambr" into Biteful's search box. To decide that the closest menu item is "samosa", the app needs to know how many single-letter edits turn one into the other, where an edit is inserting a letter, deleting a letter, or replacing one letter with another. The smallest number of such edits is the <strong>edit distance</strong>, also called Levenshtein distance, and it is what spell-checkers use to rank suggestions.</p>
  <p>The state is the same pair of prefixes as LCS: <code>dp[i][j]</code> is the fewest edits that turn the first i typed letters into the first j menu letters. Look at the last letters. If they are equal, they cost nothing and the answer is the diagonal, <code>dp[i − 1][j − 1]</code>. If they differ, the last edit was one of three things, and we pay 1 plus the best of them: delete the typed letter (<code>dp[i − 1][j]</code>), insert the menu letter (<code>dp[i][j − 1]</code>), or replace one with the other (<code>dp[i − 1][j − 1]</code>). The base cases are not zero this time: turning i letters into nothing takes i deletes, so <code>dp[i][0] = i</code>, and turning nothing into j letters takes j inserts, so <code>dp[0][j] = j</code>.</p>
  <div class="fx" data-lang="py">def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[i][j] = edits to turn a[:i] into b[:j]
    for i in range(m + 1):
        dp[i][0] = i                    # delete all i characters
    for j in range(n + 1):
        dp[0][j] = j                    # insert all j characters
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]              # same letter: free
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],         # delete a[i-1]
                                   dp[i][j - 1],         # insert b[j-1]
                                   dp[i - 1][j - 1])     # replace a[i-1] by b[j-1]
    return dp

typed, dish = "sambr", "samosa"          # what the customer typed vs the menu item
dp = min_distance(typed, dish)
print("   ∅  " + "  ".join(dish))
for ch, row in zip("∅" + typed, dp):
    print(ch, row)
print("edits:", dp[-1][-1], "| horse -&gt; ros:", min_distance("horse", "ros")[-1][-1])</div>
  <div class="fx" data-lang="text">   ∅  s  a  m  o  s  a
∅ [0, 1, 2, 3, 4, 5, 6]
s [1, 0, 1, 2, 3, 4, 5]
a [2, 1, 0, 1, 2, 3, 4]
m [3, 2, 1, 0, 1, 2, 3]
b [4, 3, 2, 1, 1, 2, 3]
r [5, 4, 3, 2, 2, 2, 3]
edits: 3 | horse -&gt; ros: 3</div>
  <p>The first three letters "sam" match, so the diagonal stays at 0 down to row m. In row b, column o, the letters differ and the best option is a replace (0 + 1 = 1). In row r, column s, another replace gives 2, and the last column needs one insert of "a", giving 3 in the bottom-right corner: replace b with o, replace r with s, insert a. The textbook pair horse → ros also gives 3. Edit distance costs <strong>O(m × n)</strong> time and space, or O(n) space with two rows if you only need the number. Recognise it from "convert word1 to word2", "minimum operations", "one edit away", and generally two strings with a cost; Distinct Subsequences and Interleaving String use the same prefix-pair table.</p>

  <h2 id="dsa-dp-interval"><span class="num">08</span>Interval DP</h2>
  <p>Prefix states grow from the left, which suits problems that read a string or list from start to end. Some problems are about a slice in the middle, and a choice made inside the slice affects both of its sides: "what is the longest palindrome inside s[l..r]?", "what is the best score for the balloons strictly between l and r?". For these the state is the slice itself, <code>dp[l][r]</code>, and this is called <strong>interval DP</strong>. A slice depends on shorter slices inside it, so the table is filled by length: all slices of length 1, then all of length 2, and so on. Filling row by row would be wrong here, because <code>dp[0][4]</code> needs <code>dp[1][4]</code>, which a row-by-row loop has not reached yet.</p>
  <p>A <strong>palindrome</strong> reads the same forwards and backwards, like "malayalam". The longest palindromic subsequence of s[l..r] follows from its two ends: if they are equal, both can wrap around the best palindrome inside, giving <code>dp[l + 1][r − 1] + 2</code>; if not, at least one end is not used, so take <code>max(dp[l + 1][r], dp[l][r − 1])</code>. A single letter is a palindrome of length 1.</p>
  <div class="fx" data-lang="py">def longest_pal_subseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]          # dp[l][r] = longest palindrome inside s[l..r]
    for i in range(n):
        dp[i][i] = 1                          # one letter is a palindrome
    for length in range(2, n + 1):            # short slices first
        for l in range(n - length + 1):
            r = l + length - 1
            if s[l] == s[r]:
                dp[l][r] = dp[l + 1][r - 1] + 2      # both ends join the inner palindrome
            else:
                dp[l][r] = max(dp[l + 1][r], dp[l][r - 1])   # drop one end
    return dp[0][n - 1] if n else 0

for s in ["bbbab", "masala", "cbbd", "a"]:
    print(s, "-&gt;", longest_pal_subseq(s))</div>
  <div class="fx" data-lang="text">bbbab -&gt; 4
masala -&gt; 3
cbbd -&gt; 2
a -&gt; 1</div>
  <p>"bbbab" contains "bbbb" (length 4), and the dish name "masala" contains "aaa" or "asa" (length 3). For the related question of the longest palindromic <em>substring</em> (contiguous letters), interviewers usually expect the simpler "expand around each centre" method, which is also O(n²) time but O(1) space.</p>
  <p>Burst Balloons (LeetCode 312) shows the key trick of interval DP. Bursting balloon k earns <code>left × k × right</code>, using its neighbours at that moment. Asking "which balloon do I burst <em>first</em>?" fails, because after that burst the neighbours change and the two sides get tangled together. The trick is to ask "which balloon in the slice bursts <em>last</em>?" If k is the last one burst between l and r, then at that moment its neighbours are exactly l and r, because everything between them is already gone, and the left part (l, k) and right part (k, r) can be solved independently.</p>
  <div class="fx" data-lang="py">def max_coins(nums):
    a = [1] + nums + [1]                      # imaginary balloons worth 1 at both ends
    n = len(a)
    dp = [[0] * n for _ in range(n)]          # dp[l][r]: best for balloons strictly between l and r
    for gap in range(2, n):                   # short intervals first
        for l in range(0, n - gap):
            r = l + gap
            for k in range(l + 1, r):         # k = the LAST balloon burst between l and r
                dp[l][r] = max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r])
    return dp[0][n - 1]

print(max_coins([3, 1, 5, 8]), max_coins([1, 5]), max_coins([]))</div>
  <div class="fx" data-lang="text">167 10 0</div>
  <p>For [3, 1, 5, 8] the best is 167: burst 1, then 5, then 3, then 8, earning 3·1·5 + 3·5·8 + 1·3·8 + 1·8·1 = 15 + 120 + 24 + 8. Interval DP has O(n²) slices, each trying O(n) split points or last choices, so it is typically <strong>O(n³)</strong> time and O(n²) space. Recognise it from "palindrome", "burst", "merge stones", "minimum cost to cut a stick", and games where two players take from either end of a row.</p>

  <h2 id="dsa-dp-tree"><span class="num">09</span>DP on Trees and Bitmasks</h2>
  <p>Lines, grids and slices can all be filled with loops. Biteful's delivery hubs form a tree instead: a city hub at the top, area hubs under it, local hubs under those. Biteful wants to run a promotion in some hubs, but a hub and its direct sub-hub must not both run it, because they would split the same customers. Each hub has a number, the extra orders it would bring. Which hubs maximise the total? This is House Robber again, on a tree (House Robber III, LeetCode 337), and there is no left-to-right order to fill.</p>
  <p>The fill order comes from the tree itself: process children before their parent, which is a post-order traversal from the <a class="xref" data-note="dsa_trees">Trees</a> note. The state needs one extra piece of information, because a parent must know whether its child used the promotion. So each node returns <strong>two</strong> numbers: the best total for its subtree if it <em>uses</em> the promotion, and the best if it <em>skips</em> it. Using a node forces both children to skip; skipping it lets each child take whichever of its two numbers is better.</p>
  <div class="fx" data-lang="py">def rob_tree(root):
    def go(node):                       # returns (best if we USE node, best if we SKIP it)
        if not node:
            return 0, 0
        l_use, l_skip = go(node.left)   # children first (post-order)
        r_use, r_skip = go(node.right)
        use_it = node.val + l_skip + r_skip                 # children must skip
        skip_it = max(l_use, l_skip) + max(r_use, r_skip)   # children free to choose
        print(f"hub {node.val}: use={use_it}  skip={skip_it}")
        return use_it, skip_it
    return max(go(root))

hubs = build([3, 4, 5, 1, 3, None, 1])  # root 3; children 4 and 5; 4 -&gt; 1, 3; 5 -&gt; 1
print("best:", rob_tree(hubs))</div>
  <div class="fx" data-lang="text">hub 1: use=1  skip=0
hub 3: use=3  skip=0
hub 4: use=4  skip=4
hub 1: use=1  skip=0
hub 5: use=5  skip=1
hub 3: use=8  skip=9
best: 9</div>
  <p>The hub tree has root 3 with children 4 and 5; hub 4 has children 1 and 3, and hub 5 has a child 1. The leaves report (use, skip) = (1, 0) and (3, 0). Hub 4 using the promotion gets 4 + 0 + 0 = 4; skipping it lets its children use theirs, 1 + 3 = 4. At the root, using it gives 3 + 4 + 1 = 8, while skipping it gives max(4, 4) + max(5, 1) = 9, so the answer is 9 from hubs 4 and 5. Every node is visited once, so tree DP is <strong>O(n)</strong> time with O(height) stack space. Returning just the single best number would not work, because the parent could not tell whether that best already used the child.</p>
  <p>Ravi's last job of the shift needs a different kind of state. Starting from the kitchen (place 0), he must serve customers 1, 2 and 3 in some order and come back, in the fewest minutes. This is the Travelling Salesman Problem, and trying every order is (n − 1)! routes, about 87 billion for 15 places. Notice that the future depends only on two things: <em>which</em> places are already visited, and <em>where</em> Ravi stands now; the order in which he visited them no longer matters. So the state is (visited set, current place). A set of up to about 20 places fits in the bits of one integer, called a <strong>bitmask</strong>: bit j is 1 when place j is visited, <code>mask | (1 &lt;&lt; j)</code> adds place j, and <code>mask &amp; (1 &lt;&lt; j)</code> tests it (see <a class="xref" data-note="dsa_bits">Bit Manipulation</a>).</p>
  <div class="fx" data-lang="py">from functools import cache

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
    return go(1, 0), go.cache_info().currsize # start at the kitchen; only bit 0 set

D = [[0, 10, 15, 20],                         # minutes: kitchen 0, customers 1, 2, 3
     [10, 0, 35, 25],
     [15, 35, 0, 30],
     [20, 25, 30, 0]]
best, states = tsp(D)
print("shortest round trip:", best, "minutes | states solved:", states)
mask = 0b1011                                 # bits 0, 1 and 3 set
print(bin(mask), "means visited", [j for j in range(4) if mask &amp; (1 &lt;&lt; j)])</div>
  <div class="fx" data-lang="text">shortest round trip: 80 minutes | states solved: 13
0b1011 means visited [0, 1, 3]</div>
  <p>The shortest round trip is 80 minutes (0 → 1 → 3 → 2 → 0: 10 + 25 + 30 + 15), found after solving only 13 (mask, place) states. The second line decodes a mask: 0b1011 has bits 0, 1 and 3 set, so the kitchen and customers 1 and 3 are done. In general there are 2<sup>n</sup> × n states, each trying n next places, so <strong>bitmask DP</strong> costs O(2<sup>n</sup> · n²) time: about 7 million steps for 15 places instead of 87 billion orders. The tell-tale sign in a problem statement is n ≤ 20 together with "visit all", "assign each worker one job" or "every subset".</p>

  <h2 id="dsa-dp-space"><span class="num">10</span>Space Optimisation</h2>
  <p>DP tables can get large: m × n for two long strings, 2<sup>n</sup> × n for a bitmask. But many cells are read once and never again. Look at what the recurrence <em>reads</em>. Fibonacci and the staircase read only the two previous values, so two variables replace a whole list: O(n) space becomes O(1). Grid, knapsack, LCS and edit distance read only the current row and the row above, so one or two rows replace the whole table: O(rows × columns) becomes O(columns). Keeping only the layers you still need is called using <strong>rolling arrays</strong>.</p>
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
print(unique_paths_1row(3, 4), lcs_len_2rows("ABCDE", "ACE"))</div>
  <div class="fx" data-lang="text">[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
10 3</div>
  <p>The answers match the full tables: the Fibonacci numbers, 10 routes on the 3 × 4 grid, and an LCS of 3 for ABCDE and ACE. The one-row grid deserves a closer look. When <code>row[c] += row[c - 1]</code> runs, <code>row[c]</code> still holds the value from the previous row, which is the "north" neighbour, and <code>row[c - 1]</code> has just been updated in this row, which is the "west" neighbour: exactly the two cells the 2-D recurrence needs.</p>
  <p>Two cautions. First, the time does not change, only the memory, and you lose the ability to walk back through the table to rebuild the actual answer (the LCS string itself, or which orders went into the bag). Second, in-place updates are where subtle bugs hide: reading a value you have just overwritten, as in the knapsack direction or the diagonal cell in edit distance, which needs a temporary variable. The safe workflow is to write the full table, get it correct, and only then shrink it. In an interview, it is usually enough to say "this can drop to O(n) space because each row only reads the previous one" and do it if asked.</p>

  <h2 id="dsa-dp-patterns"><span class="num">11</span>Choosing the Family</h2>
  <p>Hundreds of DP questions fall into a handful of shapes, and the wording of the problem usually tells you which one. First decide whether it is DP at all. DP fits when the question asks for a count ("how many ways"), a best value ("minimum cost", "longest", "maximum profit") or a yes/no ("can you make…"), and the choices at each step lead to the same small states along many different paths. If it asks you to <em>list</em> every answer, the output itself is exponential and caching cannot shrink it, so it is backtracking. If one local choice can be proven always safe (an exchange argument), greedy is simpler and faster; test greedy with a tiny counter-example such as coins 1, 3, 4 for amount 6 before trusting it.</p>
  <p>Once you know it is DP, the skeleton is always the same: write the five steps as comments, then code the memoised version, which is the quickest to get right, and convert to a table only if needed. Here is the skeleton on Min Cost Climbing Stairs (LeetCode 746), where each step has a cost to step off and you may start on step 0 or 1:</p>
  <div class="fx" data-lang="py">from functools import cache

def min_cost_climb(cost):
    n = len(cost)
    @cache
    def best(i):                         # STATE: cheapest way to reach step i
        if i &lt;= 1:
            return 0                     # BASE: start on step 0 or step 1 for free
        return min(best(i - 1) + cost[i - 1],   # TRANSITION: last stride from i-1 ...
                   best(i - 2) + cost[i - 2])   # ... or from i-2
    return best(n)                       # ANSWER: the top, one past the last step

print(min_cost_climb([10, 15, 20]), min_cost_climb([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]))</div>
  <div class="fx" data-lang="text">15 6</div>
  <p>For costs [10, 15, 20] the cheapest climb is 15 (start on step 1 and stride two steps to the top). The labelled comments are the five steps of the recipe, and only those lines change from problem to problem. The table maps trigger words to the family and its usual state and cost.</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Family</th><th>Typical state</th><th>Typical cost</th></tr>
    <tr><td>"array", "steps", "houses in a row", "ways to reach", "decode"</td><td>1-D</td><td><code>dp[i]</code>: first i items, or ending at i</td><td>O(n) or O(n²)</td></tr>
    <tr><td>"grid", "move right or down", "matrix path"</td><td>Grid</td><td><code>dp[r][c]</code>: reaching cell (r, c)</td><td>O(m·n)</td></tr>
    <tr><td>"two strings", "subsequence", "convert / edit", "match"</td><td>Two sequences</td><td><code>dp[i][j]</code> on prefixes a[:i], b[:j]</td><td>O(m·n)</td></tr>
    <tr><td>"capacity", "budget", "subset sums to", "ways to make amount"</td><td>Knapsack</td><td><code>dp[w]</code>: best with capacity w</td><td>O(n·W)</td></tr>
    <tr><td>"palindrome", "burst", "merge stones", "split the range"</td><td>Interval</td><td><code>dp[l][r]</code>: slice l..r</td><td>O(n³)</td></tr>
    <tr><td>"binary tree" + "no two adjacent", "cameras", "max path"</td><td>Tree</td><td>small tuple returned per node</td><td>O(n)</td></tr>
    <tr><td>n ≤ 20, "visit all", "assign each"</td><td>Bitmask</td><td><code>dp[mask][i]</code></td><td>O(2<sup>n</sup>·n²)</td></tr>
    <tr><td>"buy / sell", "cooldown", "at most k transactions"</td><td>State machine</td><td>one value per mode per day</td><td>O(n·modes)</td></tr>
    <tr><td>"list all", "every arrangement"</td><td>Not DP</td><td>backtracking</td><td>exponential</td></tr>
  </table>

  <h2 id="dsa-dp-problems"><span class="num">12</span>Classic Problems</h2>
  <p>A few interview classics need more care than the families above: an "ending at i" state, a reduction to knapsack, a state machine, and a string split. The earlier sections already solved House Robber, Coin Change, Unique Paths, Minimum Path Sum, LCS, Edit Distance, Burst Balloons and House Robber III.</p>
  <p><strong>Longest Increasing Subsequence</strong> (LeetCode 300) asks for the longest strictly increasing subsequence of a list such as [10, 9, 2, 5, 3, 7, 101, 18]; the answer is 4, for example 2, 3, 7, 18. The state must be "the longest increasing subsequence <em>ending exactly at</em> index i", because to extend a run you need to know its last value. Then <code>dp[i] = 1 + max(dp[j])</code> over earlier j with <code>nums[j] &lt; nums[i]</code>, each <code>dp[i]</code> starts at 1, and the answer is <code>max(dp)</code>, not <code>dp[-1]</code>, because the best run can end anywhere. That is O(n²). A faster O(n log n) idea keeps <code>tails[k]</code>, the smallest possible last value of an increasing run of length k + 1; a smaller tail is always better because it is easier to extend. For each number, binary-search the first tail that is ≥ it and replace that tail, or append if there is none. The <code>tails</code> list is not itself a valid subsequence, but its length is the answer.</p>
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
    tails = []                          # tails[k] = smallest last value of a run of length k+1
    for x in nums:
        k = bisect_left(tails, x)       # first tail &gt;= x
        if k == len(tails):
            tails.append(x)             # x extends the longest run
        else:
            tails[k] = x                # x is a smaller tail for runs of length k+1
    return len(tails)

for nums in [[10, 9, 2, 5, 3, 7, 101, 18], [7, 7, 7, 7], []]:
    print(nums, "-&gt;", lis_n2(nums), lis_fast(nums))</div>
  <div class="fx" data-lang="text">[10, 9, 2, 5, 3, 7, 101, 18] -&gt; 4 4
[7, 7, 7, 7] -&gt; 1 1
[] -&gt; 0 0</div>
  <p>Both methods agree. <code>bisect_left</code> makes equal values replace each other, which is why [7, 7, 7, 7] gives 1 for a <em>strictly</em> increasing run; use <code>bisect_right</code> for non-decreasing.</p>
  <p><strong>Partition Equal Subset Sum</strong> (LeetCode 416) asks whether a list can be split into two groups with equal sums. [1, 5, 11, 5] totals 22, so the question becomes "is there a subset adding up to 11?", which is the 0/1 knapsack loop with "is this sum reachable?" as the value, looped right to left so each number is used once.</p>
  <div class="fx" data-lang="py">def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False                    # an odd total cannot split evenly
    target = total // 2
    dp = [False] * (target + 1)         # dp[s] = some subset adds up to s
    dp[0] = True                        # the empty subset
    for x in nums:
        for s in range(target, x - 1, -1):   # right to left: each number once
            dp[s] = dp[s] or dp[s - x]
    return dp[target]

for nums in [[1, 5, 11, 5], [1, 2, 3, 5], [1]]:
    print(nums, "-&gt;", can_partition(nums))</div>
  <div class="fx" data-lang="text">[1, 5, 11, 5] -&gt; True
[1, 2, 3, 5] -&gt; False
[1] -&gt; False</div>
  <p>[1, 5, 11, 5] splits into {11} and {1, 5, 5}; [1, 2, 3, 5] totals 11, which is odd, so it cannot split. O(n × target) time, O(target) space.</p>
  <p><strong>Best Time to Buy and Sell Stock with Cooldown</strong> (LeetCode 309) gives daily prices, lets you buy and sell one share as often as you like, but forces a one-day wait after every sale. Here the state is a <strong>mode</strong> you are in at the end of each day, and the problem is easiest to see as a state machine: circles for the modes, arrows for the moves allowed between them.</p>
  <figure class="viz"><svg viewBox="0 0 600 260" width="600"><defs><marker id="dsa-dp-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs><circle cx="300" cy="90" r="36" style="fill:var(--bg)"/><circle cx="300" cy="90" r="36" class="fb sb"/><text x="300" y="94" text-anchor="middle">hold</text><circle cx="470" cy="200" r="36" style="fill:var(--bg)"/><circle cx="470" cy="200" r="36" class="fr sr"/><text x="470" y="204" text-anchor="middle">sold</text><circle cx="130" cy="200" r="36" style="fill:var(--bg)"/><circle cx="130" cy="200" r="36" class="fg sg"/><text x="130" y="204" text-anchor="middle">rest</text><line x1="160" y1="180" x2="268" y2="110" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="190" y="128" text-anchor="middle">buy  −p</text><line x1="332" y1="110" x2="440" y2="180" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="412" y="128" text-anchor="middle">sell  +p</text><line x1="432" y1="208" x2="170" y2="208" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="300" y="228" text-anchor="middle">next day: cooldown</text><path d="M284,58 C268,14 332,14 316,58" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="345" y="28">wait</text><path d="M96,188 C58,170 58,232 96,214" fill="none" class="sr" stroke-width="1.5" marker-end="url(#dsa-dp-a3)"/><text x="40" y="250">wait</text></svg><figcaption>The three modes of the cooldown problem. Each day you are in exactly one mode, and each arrow is one allowed move.</figcaption></figure>
  <p>From <em>rest</em> (no share, free to buy) you can wait or buy, moving to <em>hold</em> and paying the price. From <em>hold</em> you can wait or sell, moving to <em>sold</em> and receiving the price. From <em>sold</em> the only move is the cooldown back to <em>rest</em>. The DP keeps the best cash for each mode and updates all three every day from yesterday's values: <code>hold = max(hold, rest − p)</code>, <code>sold = hold + p</code>, <code>rest = max(rest, sold)</code>.</p>
  <div class="fx" data-lang="py">def max_profit_cooldown(prices):
    hold, sold, rest = float("-inf"), 0, 0
    for p in prices:
        hold, sold, rest = (max(hold, rest - p),   # keep holding, or buy today
                            hold + p,              # sell today
                            max(rest, sold))       # do nothing; a cooldown ends
        print(f"price {p}: hold={hold}  sold={sold}  rest={rest}")
    return max(sold, rest)

print("profit:", max_profit_cooldown([1, 2, 3, 0, 2]))</div>
  <div class="fx" data-lang="text">price 1: hold=-1  sold=-inf  rest=0
price 2: hold=-1  sold=1  rest=0
price 3: hold=-1  sold=2  rest=1
price 0: hold=1  sold=-1  rest=2
price 2: hold=1  sold=3  rest=2
profit: 3</div>
  <p>On day 4 (price 0) the hold value jumps to 1, because buying at 0 from a rest value of 1 (the profit from buying at 1 and selling at 2) is better than the old hold; on day 5 selling at 2 gives 3. The tuple assignment matters: all three new values must be computed from yesterday's values, or you could buy and sell on the same day and skip the cooldown. O(n) time, O(1) space. The other stock problems are the same idea with different circles: one transaction, unlimited transactions, at most k transactions, or a fee per sale.</p>
  <p><strong>Word Break</strong> (LeetCode 139) asks whether a string can be split into words from a dictionary. The state is <code>dp[i]</code>: can the first i letters be split? Thinking about the last word, <code>dp[i]</code> is true if some earlier split point j has <code>dp[j]</code> true and the piece <code>s[j:i]</code> is a word.</p>
  <div class="fx" data-lang="py">def word_break(s, words):
    words = set(words)
    dp = [True] + [False] * len(s)      # dp[i] = s[:i] can be split into menu words
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:   # last word is s[j:i]
                dp[i] = True
                break
    return dp[-1]

menu = ["pav", "bhaji", "pani", "puri", "masala"]
for q in ["pavbhaji", "masalapuri", "panipuribhaj"]:
    print(q, "-&gt;", word_break(q, menu))</div>
  <div class="fx" data-lang="text">pavbhaji -&gt; True
masalapuri -&gt; True
panipuribhaj -&gt; False</div>
  <p>"pavbhaji" splits into pav + bhaji and "masalapuri" into masala + puri, but "panipuribhaj" ends in "bhaj", which is not on the menu. This is O(n²) substring checks.</p>
  <p>For practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, work in this order: 70 Climbing Stairs and 746 Min Cost Climbing Stairs (the recipe), 198 and 213 House Robber (take or skip), 322 Coin Change and 139 Word Break (try every last choice), 62 Unique Paths and 64 Minimum Path Sum (grids), 1143 Longest Common Subsequence and 72 Edit Distance (two sequences), 416 Partition Equal Subset Sum and 518 Coin Change II (knapsack and its loop order), 300 Longest Increasing Subsequence ("ending at i"), 309 Stock with Cooldown (state machine), 337 House Robber III (trees), 516 Longest Palindromic Subsequence and 312 Burst Balloons (intervals), and finally 943 Find the Shortest Superstring (bitmask).</p>

  <h2 id="dsa-dp-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>Most wrong DP answers come from a few slips that compile, run and return a plausible number. The first is a wrong base case. In a "fewest" problem, every unreachable state must start at infinity; if the table starts at all zeros, <code>min</code> never moves away from 0:</p>
  <div class="fx" data-lang="py">def coin_change_bad(coins, amount):
    dp = [0] * (amount + 1)             # BUG: should be 0 then infinity
    for a in range(1, amount + 1):
        for c in coins:
            if c &lt;= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount]

print("fewest coins for 11:", coin_change_bad([1, 2, 5], 11))</div>
  <div class="fx" data-lang="text">fewest coins for 11: 0</div>
  <p>The code claims ₹11 needs 0 coins. The fix is <code>dp = [0] + [float("inf")] * amount</code>. The matching rules are: counting problems start with <code>dp[0] = 1</code> ("one way to make nothing"), minimum problems with <code>dp[0] = 0</code> and infinity elsewhere, and edit distance with <code>dp[i][0] = i</code> and <code>dp[0][j] = j</code>.</p>
  <p>The second is looping the wrong way in a one-row 0/1 knapsack. Going left to right lets an item be used again, which turns the problem into the unbounded version without any error:</p>
  <div class="fx" data-lang="py">def can_reach_bad(nums, target):
    dp = [True] + [False] * target
    for x in nums:
        for s in range(x, target + 1):  # BUG: left to right lets x be used twice
            dp[s] = dp[s] or dp[s - x]
    return dp[target]

print("can [1] make 2?", can_reach_bad([1], 2))</div>
  <div class="fx" data-lang="text">can [1] make 2? True</div>
  <p>A single 1 cannot make 2, yet the loop says it can, because <code>dp[1]</code> became true earlier in the same pass and was reused for <code>dp[2]</code>. For "each item once", loop the capacity from high to low.</p>
  <p>A few more come up often. In string tables of size (m + 1) × (n + 1), <code>dp[i][j]</code> compares <code>a[i − 1]</code> with <code>b[j − 1]</code>; writing <code>a[i] == b[j]</code> is the classic off-by-one. Interval tables must be filled by increasing length, not row by row. <code>@cache</code> needs hashable arguments, so pass indexes or tuples rather than lists, and a module-level cached function keeps its answers between test cases unless you call <code>cache_clear()</code> or define it inside the main function. In space-optimised code, compute all new values from the old ones before overwriting (tuple assignment, or a temporary for the diagonal). And above all, a state you cannot describe in one sentence is the root of most wrong recurrences.</p>

  <h2 id="dsa-dp-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Dynamic programming</b>: solve each distinct subproblem once, store its answer, build bigger answers from stored ones.</li>
    <li><b>Overlapping subproblems</b>: the same smaller questions recur. <b>Optimal substructure</b>: best answers are built from best sub-answers.</li>
    <li><b>Memoisation (top-down)</b>: recursion + cache. <b>Tabulation (bottom-up)</b>: loop filling a table in dependency order.</li>
    <li><b>State</b>: the few numbers that describe a subproblem. <b>Transition</b>: its answer in terms of smaller states, found by thinking about the last choice.</li>
    <li>Cost of any DP: <b>time = states × work per state</b>; space = states stored (+ recursion depth for memo).</li>
  </ul>
  <h3>Recurrences</h3>
  <table class="tbl">
    <tr><th>Problem</th><th>State</th><th>Recurrence</th><th>Base · cost</th></tr>
    <tr><td>Stairs</td><td>ways onto step i</td><td>dp[i−1] + dp[i−2]</td><td>dp[0] = dp[1] = 1 · O(n)</td></tr>
    <tr><td>House Robber</td><td>best from first i</td><td>max(dp[i−1], dp[i−2] + x)</td><td>0 · O(n), O(1) space</td></tr>
    <tr><td>Coin Change</td><td>fewest coins for a</td><td>1 + min(dp[a−c])</td><td>dp[0] = 0, rest ∞ · O(A·k)</td></tr>
    <tr><td>Grid paths</td><td>routes to (r, c)</td><td>north + west (min + cost for quickest)</td><td>edges = 1 · O(mn)</td></tr>
    <tr><td>LCS</td><td>prefixes a[:i], b[:j]</td><td>match: diag + 1; else max(up, left)</td><td>0 border · O(mn)</td></tr>
    <tr><td>0/1 knapsack</td><td>first i items, capacity w</td><td>max(skip, dp[i−1][w−wt] + val)</td><td>0 · O(nW); 1 row right→left</td></tr>
    <tr><td>Edit distance</td><td>edits a[:i] → b[:j]</td><td>equal: diag; else 1 + min(del, ins, rep)</td><td>dp[i][0] = i, dp[0][j] = j · O(mn)</td></tr>
    <tr><td>Interval</td><td>slice l..r</td><td>best over split / last choice k</td><td>length 1 · O(n³), fill by length</td></tr>
    <tr><td>Tree</td><td>(use, skip) per node</td><td>use = val + skips; skip = Σ max(child)</td><td>null = (0, 0) · O(n)</td></tr>
    <tr><td>Bitmask TSP</td><td>(mask, place)</td><td>min over unvisited j of dist + go(mask | 1&lt;&lt;j, j)</td><td>full mask → home · O(2<sup>n</sup>n²)</td></tr>
    <tr><td>LIS</td><td>longest ending at i</td><td>1 + max(dp[j]) for nums[j] &lt; nums[i]</td><td>1 · O(n²); tails + bisect O(n log n)</td></tr>
  </table>
  <h3>Memo and table syntax</h3>
  <div class="fx" data-lang="py">from functools import cache

@cache                                  # top-down: arguments must be hashable
def ways(i):
    if i &lt;= 1:
        return 1                        # base
    return ways(i - 1) + ways(i - 2)    # transition

dp = [1] * (n + 1)                      # bottom-up
for i in range(2, n + 1):               # order: inputs ready first
    dp[i] = dp[i - 1] + dp[i - 2]

for w in range(cap, wt - 1, -1): ...    # 0/1 knapsack: right to left
for w in range(wt, cap + 1): ...        # unbounded: left to right</div>
  <h3>On Ravi's shift</h3>
  <ul>
    <li>fib(30): 2,692,537 plain calls → 59 memoised. Staircase of 5: 8 ways.</li>
    <li>Tips [2, 7, 9, 3, 1]: 12. ₹11 from [1, 2, 5]: 3 coins; [1, 3, 4] for 6: 2 coins (greedy says 3).</li>
    <li>3 × 4 grid: 10 routes; traffic grid: 7 minutes; ABCDE vs ACE: LCS 3.</li>
    <li>Bag 4 kg: ₹35 (unbounded ₹60). sambr → samosa: 3 edits. Balloons: 167. Hubs: 9. Round trip: 80.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Fuzzy state → wrong recurrence; "ending at i" needs <code>max(dp)</code>.</li>
    <li>Base cases: count dp[0] = 1; min dp[0] = 0 with ∞ elsewhere.</li>
    <li>1-row knapsack: right → left for 0/1, left → right for unbounded.</li>
    <li>Coins outer loop = combinations; amount outer loop = orderings.</li>
    <li>String tables: compare a[i−1] and b[j−1]. Interval tables: fill by length.</li>
    <li>Memo: recursion limit ~1000; never <code>memo={}</code> as a default; lists are unhashable.</li>
    <li>"List all" is backtracking, not DP.</li>
  </ul>

  <h2 id="dsa-dp-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is dynamic programming?</summary><div class="qa-body">DP is a way of solving a problem by breaking it into smaller subproblems, solving each distinct subproblem only once, storing the answers, and building larger answers from the stored ones. It turns many exponential recursive solutions into polynomial ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which two properties must a problem have for DP to help?</summary><div class="qa-body">Overlapping subproblems, meaning the same smaller questions are asked many times so caching saves work, and optimal substructure, meaning the best answer is built from best answers to subproblems. Merge sort has optimal substructure but no overlap, so it is divide and conquer, not DP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Memoisation versus tabulation: what is the difference, and when would you pick each?</summary><div class="qa-body">Memoisation keeps the recursion and adds a cache, so it computes only the states actually reached and the order is automatic. Tabulation fills a table with loops in an order you choose, so it has no recursion limit and makes space optimisation easy. Memo is quicker to write from a recursive idea; tables are better for large inputs and memory savings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is naive recursive Fibonacci exponential, and what does memoisation make it?</summary><div class="qa-body">Each call makes two calls and nothing is remembered, so whole subtrees are recomputed; the call count grows like 1.6<sup>n</sup> (2.7 million calls for n = 30). With a cache each value is computed once: O(n) time and O(n) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What steps do you go through before coding a DP?</summary><div class="qa-body">Define the state (what dp[...] means in one sentence), write the transition by thinking about the last choice, set the base cases, choose a fill order so inputs are ready, and say where the answer is (one cell, or the max over cells).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you estimate the time complexity of a DP?</summary><div class="qa-body">Number of states times work per state. LCS has (m+1)(n+1) states with O(1) work, so O(mn). Simple LIS has n states each scanning O(n), so O(n²). Burst Balloons has n² intervals each trying O(n) last balloons, so O(n³). TSP has 2<sup>n</sup>·n states each trying n moves, so O(2<sup>n</sup>n²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Python memoisation sometimes fail on large inputs, and what do you do?</summary><div class="qa-body">Each memoised call that is not yet cached waits on the call stack for the smaller one, so a chain of 5000 states nests 5000 calls and hits the default recursion limit of about 1000. Convert to a bottom-up table, warm the cache in increasing order, or (riskily) raise the recursion limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does greedy fail for Coin Change with coins 1, 3 and 4?</summary><div class="qa-body">For amount 6, greedy takes 4 first and then needs 1 + 1, three coins, while 3 + 3 uses two. Taking the biggest coin blocked a better combination. DP tries every possible last coin at every amount, so it finds 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a one-row 0/1 knapsack, why must the capacity loop go from high to low?</summary><div class="qa-body">The update reads <code>dp[w − wt]</code>. Going high to low, that cell has not been updated for this item yet, so it is the previous row's value and the item is used at most once. Going low to high, it may already include this item, which allows reuse: that is the unbounded knapsack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Coin Change II counts combinations. What changes if you swap the two loops?</summary><div class="qa-body">With coins in the outer loop, coins are added in a fixed order, so each combination is counted once. With amounts in the outer loop, every coin can be the last one at every amount, so different orderings of the same coins are counted separately (₹5 from 1, 2, 5: 4 combinations but 9 orderings).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the LCS recurrence.</summary><div class="qa-body">dp[i][j] is the LCS of the first i items of a and the first j items of b. If a[i−1] equals b[j−1], that item extends the LCS of both shorter prefixes: dp[i−1][j−1] + 1. Otherwise at least one of them is unused, so take max(dp[i−1][j], dp[i][j−1]). Row and column 0 are empty prefixes with value 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the base cases of edit distance and why?</summary><div class="qa-body">dp[i][0] = i because turning i characters into an empty string takes i deletions, and dp[0][j] = j because building j characters from nothing takes j insertions. Leaving them at 0 makes every cell too small.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the O(n log n) LIS algorithm work?</summary><div class="qa-body">It keeps <code>tails[k]</code>, the smallest last value of any increasing run of length k + 1, which stays sorted. For each number it binary-searches the first tail ≥ it and replaces that tail, or appends if the number is larger than all tails. The length of <code>tails</code> is the LIS length, though the list itself is not necessarily a real subsequence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Burst Balloons, why choose the balloon burst last instead of first?</summary><div class="qa-body">If k is burst first, its neighbours change afterwards and the two sides affect each other. If k is the last balloon burst between l and r, its neighbours at that moment are exactly l and r, so the left and right parts are independent subproblems: dp[l][r] = max over k of dp[l][k] + a[l]·a[k]·a[r] + dp[k][r].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you do DP on a tree?</summary><div class="qa-body">Use a post-order DFS so children are solved before parents, and have each node return a small tuple describing its subtree under a few states, such as (best if this node is used, best if skipped). The parent combines its children's tuples. Each node is processed once, so it is O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use bitmask DP?</summary><div class="qa-body">When the state must remember which subset of a small set of items (about 20 or fewer) has been used, as in TSP or assigning jobs to workers. The subset is stored as the bits of an integer, giving states like dp[mask][i]; the cost is roughly 2<sup>n</sup> times a polynomial instead of n!.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How can you reduce the space of a 2-D DP, and what do you lose?</summary><div class="qa-body">If each row only reads the row above, keep one or two rows instead of the whole table, dropping space from O(mn) to O(n); if only the last two values are read, keep two variables. Time is unchanged, but you can no longer walk back through the table to rebuild the actual solution.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>DP, greedy or backtracking: how do you decide?</summary><div class="qa-body">If the question asks to list every solution, use backtracking, because the output itself is exponential. If it asks for a count, a best value or yes/no and states repeat, use DP. If a single local choice can be proven always safe (and a small counter-example search fails to break it), greedy is simpler and faster.</div></details>
</main>
`
});
