// notes/dsa/dsa_backtrack.js — Recursion & Backtracking
Object.assign(TOPIC_CONTENT, {
  "dsa_backtrack": `<main>
  <h1>Recursion &amp; Backtracking</h1>
  <p class="lead">Recursion is a function that solves a problem by calling itself on a smaller copy of the same problem. Backtracking uses recursion to try every choice, step by step, and undo a choice when it leads nowhere. Interviews use it for "list all subsets / arrangements / ways" questions, puzzles like N-Queens, and grid searches. It also sets up Dynamic Programming and tree/graph DFS.</p>

  <h2 id="dsa-bt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Recursion &amp; Backtracking</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Recursion basics</div>
        <ul>
          <li><b>Recursion</b> — a function calls itself on a smaller input</li>
          <li><b>Two parts</b> — base case (smallest input, answer known) + recursive step (shrink, call, combine)</li>
          <li>💡 Queue at a ration shop: ask the person ahead their number, add 1</li>
          <li>💡 Russian dolls: open one, a smaller one inside, stop at the solid doll</li>
          <li><b>Trust rule</b> — assume the smaller call works; only write how to use its answer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Call stack &amp; base case</div>
        <ul>
          <li><b>Call stack</b> — pile of unfinished calls; newest on top</li>
          <li><b>Push</b> on call, <b>pop</b> on return; answers flow back down</li>
          <li><b>Space</b> = max depth of the stack, e.g. fact(n) → O(n)</li>
          <li>⚠ No base case / input never shrinks → <code>RecursionError</code></li>
          <li>Python limit ≈ 1000 frames (<code>sys.getrecursionlimit()</code>)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursion tree &amp; cost</div>
        <ul>
          <li><b>Tree</b> — one node per call, children = calls it makes</li>
          <li><b>Time</b> ≈ number of nodes × work per node</li>
          <li><b>Rough count</b> — branches<sup>depth</sup>: fib → 2<sup>n</sup>, subsets → 2<sup>n</sup>, perms → n!</li>
          <li><b>Space</b> = height of the tree (deepest path)</li>
          <li>Same node appears many times → use memo (Dynamic Programming)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Backtracking template</div>
        <ul>
          <li><b>Choose → explore → un-choose</b></li>
          <li>💡 Number lock: set a dial, try the rest, turn it back, try next digit</li>
          <li><b>Goal check</b> first: path complete → save <code>path[:]</code> (a copy)</li>
          <li><b>Pruning</b> — stop early when a path can never succeed</li>
          <li><b>start index</b> → combinations (no reorders); <b>used[]</b> → permutations</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Subsets &amp; Permutations</div>
        <ul>
          <li><b>Subsets</b> — each item: take or skip → 2<sup>n</sup> answers, O(n·2<sup>n</sup>)</li>
          <li><b>Permutations</b> — pick any unused item for each slot → n! answers, O(n·n!)</li>
          <li><b>Duplicates</b> — sort, skip <code>nums[j] == nums[j-1]</code> when <code>j &gt; start</code></li>
          <li>Bitmask also lists subsets: mask 0 … 2<sup>n</sup>−1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Combination Sum &amp; Parentheses</div>
        <ul>
          <li><b>Combination Sum</b> — loop from <code>start</code>; recurse with <code>j</code> (reuse allowed)</li>
          <li>Sort + <code>break</code> when number &gt; remaining → big pruning</li>
          <li>⚠ Loop from 0 every time → [2,2,3], [2,3,2], [3,2,2] duplicates</li>
          <li><b>Parentheses</b> — add "(" if open &lt; n; add ")" if close &lt; open</li>
          <li>Counts 1, 2, 5, 14, 42… (Catalan numbers)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">N-Queens &amp; Word Search</div>
        <ul>
          <li><b>N-Queens</b> — one queen per row; sets for columns, r−c and r+c diagonals</li>
          <li>Answers for n = 1…8: 1, 0, 0, 2, 10, 4, 40, 92</li>
          <li><b>Word Search</b> — DFS from each cell; mark "#" before going deeper, restore after</li>
          <li>Time O(R·C·3<sup>L</sup>), space O(L) for word length L</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>⚠ <code>res.append(path)</code> saves the same list → all answers empty; use <code>path[:]</code></li>
          <li>⚠ Forgot to un-choose (pop / unmark) → later branches see old choices</li>
          <li>⚠ Deep recursion → raise limit or convert to a loop with your own stack</li>
          <li>⚠ Strings are immutable: <code>s + "("</code> makes a new string, so no undo needed</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-bt-rec"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Recursion from Scratch</span><span class="rm-sub">Ask the person ahead</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-stack"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Base Case &amp; Call Stack</span><span class="rm-sub">Where calls wait</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-tree"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Recursion Tree &amp; Cost</span><span class="rm-sub">Count the calls</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-idea"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Backtracking</span><span class="rm-sub">Choose, explore, un-choose</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-pat"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Patterns &amp; Signal Words</span><span class="rm-sub">Spot it in a question</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-sub"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Subsets &amp; Permutations</span><span class="rm-sub">Take/skip and used[]</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-comb"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Combination Sum &amp; Parentheses</span><span class="rm-sub">Start index and rules</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-grid"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">N-Queens &amp; Word Search</span><span class="rm-sub">Boards and grids</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Traps &amp; Complexity</span><span class="rm-sub">Bugs everyone makes</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bt-rec"><span class="num">01</span>Recursion from Scratch</h2>
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
    <p>Russian dolls (matryoshka). Open a doll and you find a smaller doll. Keep opening until you reach the tiny solid doll that does not open. That solid doll is the <strong>base case</strong> — the smallest problem whose answer you already know.</p>
  </div>
  <p>Every recursive function has two parts:</p>
  <div class="cards">
    <div><b>Base case</b><p>The smallest input. Answer is known. Return it straight away, no more calls.</p><small>Front person: "I am 1"</small></div>
    <div><b>Recursive step</b><p>Make the input smaller, call yourself, then use that answer.</p><small>Everyone else: "ahead + 1"</small></div>
  </div>
<div class="fx" data-lang="py">def position(i):
    # i = how many people stand ahead of me
    if i == 0:                  # base case: nobody ahead, I am number 1
        return 1
    ahead = position(i - 1)     # ask the person ahead (smaller problem)
    return ahead + 1            # my number = their number + 1

print(position(0), position(4))

def total(marks):               # sum of a list, the recursive way
    if not marks:               # base case: empty list adds up to 0
        return 0
    return marks[0] + total(marks[1:])   # first item + sum of the rest

print(total([40, 35, 25]), total([]))</div>
  <div class="fx" data-lang="text">1 5
100 0</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>When writing recursion, do not trace every call in your head. Assume the smaller call already returns the right answer. Only decide: what is the base case, and how do I use the smaller answer?</p>
  </div>

  <h2 id="dsa-bt-stack"><span class="num">02</span>Base Case &amp; Call Stack</h2>
  <p>When a function calls another function, the first one waits. Python keeps all waiting calls on a pile called the <strong>call stack</strong> (a stack is a pile where you add and remove only from the top, like plates). A new call is <em>pushed</em> on top. When a call returns, it is <em>popped</em> off, and the call below it continues.</p>
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
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two ways to get this error: no base case, or a step that never reaches it (e.g. <code>f(n - 2)</code> on an odd n with base case <code>n == 0</code>). Always check: does every call move closer to the base case?</p>
  </div>

  <h2 id="dsa-bt-tree"><span class="num">03</span>Recursion Tree &amp; Cost</h2>
  <p>Some functions call themselves more than once. Fibonacci numbers go 0, 1, 1, 2, 3, 5, 8…: each one is the sum of the two before it. So <code>fib(n) = fib(n − 1) + fib(n − 2)</code>. Draw one box per call, with lines to the calls it makes. That picture is the <strong>recursion tree</strong>.</p>
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
    <p>Calls ≈ (branches per call)<sup>depth</sup>. Two branches, depth n → 2<sup>n</sup>. When the same box appears again and again (like fib(2)), save its answer and reuse it. That fix is Dynamic Programming (see the DP note).</p>
  </div>

  <h2 id="dsa-bt-idea"><span class="num">04</span>Backtracking: Choose → Explore → Un-choose</h2>
  <p>You forgot the code of a 3-digit number lock on your cycle. You set the first dial to 0, then try every value for the other two. If none open it, you turn the first dial back and set it to 1. You build one full guess at a time, and undo the last step to try the next option.</p>
  <p>This is called <strong>backtracking</strong>: build an answer one choice at a time; when a path is finished or stuck, step back (undo the last choice) and try the next option.</p>
  <div class="flow"><span>Choose an option</span><span>Explore (recurse with it)</span><span>Un-choose (undo it)</span><span>Try next option</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking through a maze with chalk. At each turn you pick a path and mark it. At a dead end you walk back to the last turn, rub out the mark, and try the other path.</p>
  </div>
<div class="fx" data-lang="py">def try_lock(path, digits, n, out):
    if len(path) == n:              # all dials set: one full guess
        out.append("".join(path))
        return
    for d in digits:
        path.append(d)              # choose
        try_lock(path, digits, n, out)   # explore
        path.pop()                  # un-choose

out = []
try_lock([], "012", 2, out)        # 2 dials, digits 0-2
print(out)</div>
  <div class="fx" data-lang="text">['00', '01', '02', '10', '11', '12', '20', '21', '22']</div>
  <h3>Pruning: stop early on a hopeless path</h3>
  <p>Say you remember the 3 digits of the lock add up to 5. If the first two dials already add to 7, no third digit can fix it. So stop there. Cutting such dead paths is called <strong>pruning</strong>. It does not change the answers; it only skips useless work.</p>
<div class="fx" data-lang="py">def search(path, prune, stats):
    stats["nodes"] += 1
    s = sum(path)
    if prune and s &gt; 5:              # already too big: dead path
        return
    if len(path) == 3:
        if s == 5:
            stats["found"] += 1
        return
    for d in range(10):
        path.append(d); search(path, prune, stats); path.pop()

for prune in [False, True]:
    stats = {"nodes": 0, "found": 0}
    search([], prune, stats)
    print(f"prune={prune!s:5}  calls={stats['nodes']:4}  codes found={stats['found']}")</div>
  <div class="fx" data-lang="text">prune=False  calls=1111  codes found=21
prune=True   calls= 281  codes found=21</div>
  <h3>The template</h3>
  <p>Almost every backtracking answer has this shape. Learn it once, then change only the marked parts.</p>
  <div class="fx" data-lang="py">def backtrack(state):
    if is_complete(state):            # 1. goal: save a COPY of the answer
        results.append(state[:])
        return
    for choice in options(state):     # 2. every option at this step
        if not valid(choice, state):  # 3. prune dead options early
            continue
        make(choice, state)           # 4. choose
        backtrack(state)              # 5. explore
        undo(choice, state)           # 6. un-choose</div>
  <p>Below, the take-or-skip decision tree for the subsets of [1, 2, 3]. Each level decides one number. Every leaf is one answer.</p>
  <figure class="viz"><svg viewBox="0 0 560 215" width="560">
<g stroke-width="1.5"><line x1="280" y1="22" x2="140" y2="72" class="sg"/><line x1="280" y1="22" x2="420" y2="72" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="140" y1="72" x2="70" y2="122" class="sg"/><line x1="140" y1="72" x2="210" y2="122" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="420" y1="72" x2="350" y2="122" class="sg"/><line x1="420" y1="72" x2="490" y2="122" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="70" y1="122" x2="35" y2="172" class="sg"/><line x1="70" y1="122" x2="105" y2="172" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="210" y1="122" x2="175" y2="172" class="sg"/><line x1="210" y1="122" x2="245" y2="172" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="350" y1="122" x2="315" y2="172" class="sg"/><line x1="350" y1="122" x2="385" y2="172" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="490" y1="122" x2="455" y2="172" class="sg"/><line x1="490" y1="122" x2="525" y2="172" stroke="currentColor" stroke-dasharray="4 3"/></g>
<rect x="255" y="10" width="50" height="22" rx="5" class="fs" stroke="currentColor"/><text x="280" y="26" text-anchor="middle">[]</text>
<rect x="115" y="60" width="50" height="22" rx="5" class="fb sb"/><text x="140" y="76" text-anchor="middle">[1]</text>
<rect x="395" y="60" width="50" height="22" rx="5" class="fb sb"/><text x="420" y="76" text-anchor="middle">[]</text>
<rect x="40" y="110" width="60" height="22" rx="5" class="fb sb"/><text x="70" y="126" text-anchor="middle">[1,2]</text>
<rect x="185" y="110" width="50" height="22" rx="5" class="fb sb"/><text x="210" y="126" text-anchor="middle">[1]</text>
<rect x="325" y="110" width="50" height="22" rx="5" class="fb sb"/><text x="350" y="126" text-anchor="middle">[2]</text>
<rect x="465" y="110" width="50" height="22" rx="5" class="fb sb"/><text x="490" y="126" text-anchor="middle">[]</text>
<g text-anchor="middle"><rect x="4" y="160" width="62" height="22" rx="5" class="fg sg"/><text x="35" y="176">[1,2,3]</text>
<rect x="77" y="160" width="56" height="22" rx="5" class="fg sg"/><text x="105" y="176">[1,2]</text>
<rect x="147" y="160" width="56" height="22" rx="5" class="fg sg"/><text x="175" y="176">[1,3]</text>
<rect x="220" y="160" width="50" height="22" rx="5" class="fg sg"/><text x="245" y="176">[1]</text>
<rect x="287" y="160" width="56" height="22" rx="5" class="fg sg"/><text x="315" y="176">[2,3]</text>
<rect x="360" y="160" width="50" height="22" rx="5" class="fg sg"/><text x="385" y="176">[2]</text>
<rect x="430" y="160" width="50" height="22" rx="5" class="fg sg"/><text x="455" y="176">[3]</text>
<rect x="500" y="160" width="50" height="22" rx="5" class="fg sg"/><text x="525" y="176">[]</text></g>
<text x="12" y="48" class="tm">decide 1</text><text x="12" y="100" class="tm">decide 2</text><text x="12" y="150" class="tm">decide 3</text>
<text x="280" y="205" text-anchor="middle" class="tm">solid green line = take · dashed line = skip · 3 levels → 2³ = 8 leaves</text>
</svg><figcaption>Moving down = choose. Coming back up = un-choose. The path from root to a leaf is one subset.</figcaption></figure>

  <h2 id="dsa-bt-pat"><span class="num">05</span>Patterns &amp; Signal Words</h2>
  <p>Backtracking fits when a question asks for <em>all</em> answers, or when you must build an answer piece by piece under rules. If it asks only for the <em>count</em> or the <em>best</em> one, check DP first: backtracking may be too slow.</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Signal words</th><th>Key move</th><th>Solved below</th></tr>
    <tr><td><strong>Take or skip</strong></td><td>"all subsets", "power set", "every selection"</td><td>For item i: recurse with it, then without it</td><td>Subsets</td></tr>
    <tr><td><strong>Pick any unused</strong></td><td>"all orderings", "arrangements", "permutations"</td><td><code>used[]</code> array; loop over all items</td><td>Permutations</td></tr>
    <tr><td><strong>Start index</strong></td><td>"combinations", "sum to target", "choose k"</td><td>Loop <code>j</code> from <code>start</code> so order doesn't repeat</td><td>Combination Sum</td></tr>
    <tr><td><strong>Rules-based building</strong></td><td>"valid", "well-formed", "place so that no two…"</td><td>Only add a piece if the rule still holds</td><td>Parentheses, N-Queens</td></tr>
    <tr><td><strong>Grid DFS + mark</strong></td><td>"path in a grid", "adjacent cells", "each cell used once"</td><td>Mark cell, try 4 neighbours, unmark</td><td>Word Search</td></tr>
  </table>
  <div class="cards">
    <div><b>Subset-style loop</b><p>Every node is an answer. Loop <code>j</code> from <code>start</code>, recurse with <code>j + 1</code>.</p><small>Subsets, combinations</small></div>
    <div><b>Permutation-style loop</b><p>Answer only at full length. Loop over all <code>j</code>, skip used ones.</p><small>Permutations, arrangements</small></div>
    <div><b>Reuse allowed</b><p>Same as subset-style but recurse with <code>j</code>, not <code>j + 1</code>.</p><small>Combination Sum, coin combos</small></div>
  </div>

  <h2 id="dsa-bt-sub"><span class="num">06</span>Subsets &amp; Permutations</h2>
  <h3>Subsets (LeetCode 78)</h3>
  <p><strong>Problem:</strong> given distinct numbers, return every possible subset (any selection, including none and all). For [1, 2, 3] there are 8.</p>
  <p><strong>Brute force idea:</strong> for size 0, 1, 2, 3 use nested loops. But the number of loops depends on n, so you cannot write it by hand. There are 2<sup>n</sup> subsets, so any method must do at least that much work. Backtracking writes the "nested loops" for you.</p>
  <p><strong>Better idea:</strong> walk the numbers one by one. For each number, two branches: take it, or skip it. When you pass the last number, save the path. This is exactly the tree drawn above.</p>
  <table class="tbl">
    <caption>Dry run on [1, 2, 3] — first few steps</caption>
    <tr><th>Step</th><th>i</th><th>Action</th><th>path</th><th>Saved</th></tr>
    <tr><td>1</td><td>0</td><td>take 1</td><td>[1]</td><td></td></tr>
    <tr><td>2</td><td>1</td><td>take 2</td><td>[1, 2]</td><td></td></tr>
    <tr><td>3</td><td>2</td><td>take 3</td><td>[1, 2, 3]</td><td></td></tr>
    <tr><td>4</td><td>3</td><td>end reached</td><td>[1, 2, 3]</td><td>[1, 2, 3]</td></tr>
    <tr><td>5</td><td>2</td><td>pop 3, skip 3</td><td>[1, 2]</td><td></td></tr>
    <tr><td>6</td><td>3</td><td>end reached</td><td>[1, 2]</td><td>[1, 2]</td></tr>
    <tr><td>7</td><td>1</td><td>pop 2, skip 2, then take 3</td><td>[1, 3]</td><td>[1, 3] next</td></tr>
  </table>
<div class="fx" data-lang="py">def subsets(nums):
    res, path = [], []
    def go(i):
        if i == len(nums):
            res.append(path[:])          # save a COPY
            return
        path.append(nums[i])             # choose: take nums[i]
        go(i + 1)                        # explore
        path.pop()                       # un-choose
        go(i + 1)                        # skip nums[i]
    go(0)
    return res

for t in [[1, 2, 3], [], [5]]:
    print(t, "-&gt;", subsets(t))
print("n=10 -&gt;", len(subsets(list(range(10)))), "subsets")</div>
  <div class="fx" data-lang="text">[1, 2, 3] -&gt; [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]
[] -&gt; [[]]
[5] -&gt; [[5], []]
n=10 -&gt; 1024 subsets</div>
  <p>The loop-style version saves every node, not just leaves. It gives the same 8 subsets in a different order, and it is the version used for combination problems.</p>
<div class="fx" data-lang="py">def subsets_loop(nums):
    res, path = [], []
    def go(start):
        res.append(path[:])              # every node is a valid subset
        for j in range(start, len(nums)):
            path.append(nums[j])
            go(j + 1)                    # only later numbers: no repeats
            path.pop()
    go(0)
    return res

print(subsets_loop([1, 2, 3]))</div>
  <div class="fx" data-lang="text">[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]</div>
  <p><strong>Complexity:</strong> 2<sup>n</sup> subsets, and copying each costs up to n → time O(n·2<sup>n</sup>). Extra space O(n) for the path and the stack (the output itself is not counted).</p>

  <h3>Permutations (LeetCode 46)</h3>
  <p><strong>Problem:</strong> given distinct numbers, return every ordering. [1, 2, 3] has 3 × 2 × 1 = 6 orderings.</p>
  <p><strong>Idea:</strong> fill slots left to right. For each slot, try every number not used yet. A <code>used</code> list of True/False remembers which numbers are already in the path.</p>
  <table class="tbl">
    <caption>Dry run on [1, 2, 3]</caption>
    <tr><th>path</th><th>used</th><th>Next action</th></tr>
    <tr><td>[]</td><td>F F F</td><td>slot 1: try 1</td></tr>
    <tr><td>[1]</td><td>T F F</td><td>slot 2: 1 is used, try 2</td></tr>
    <tr><td>[1, 2]</td><td>T T F</td><td>slot 3: only 3 is free</td></tr>
    <tr><td>[1, 2, 3]</td><td>T T T</td><td>full: save, pop 3</td></tr>
    <tr><td>[1]</td><td>T F F</td><td>pop 2, try 3 in slot 2</td></tr>
    <tr><td>[1, 3, 2]</td><td>T T T</td><td>full: save</td></tr>
  </table>
<div class="fx" data-lang="py">def permute(nums):
    res, path, used = [], [], [False] * len(nums)
    def go():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for j in range(len(nums)):
            if used[j]:
                continue
            used[j] = True;  path.append(nums[j])     # choose
            go()                                      # explore
            path.pop();      used[j] = False          # un-choose
    go()
    return res

for t in [[1, 2, 3], [0, 1], [1]]:
    print(t, "-&gt;", permute(t))

from itertools import permutations             # built-in, same count
print(len(permute([1, 2, 3, 4])), len(list(permutations([1, 2, 3, 4]))))</div>
  <div class="fx" data-lang="text">[1, 2, 3] -&gt; [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
[0, 1] -&gt; [[0, 1], [1, 0]]
[1] -&gt; [[1]]
24 24</div>
  <p><strong>Complexity:</strong> n! orderings, each copied in O(n) → O(n·n!). At n = 10 that is 3.6 million orderings, so interviewers keep n small.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In an interview, write the backtracking yourself even though <code>itertools.permutations</code> and <code>itertools.combinations</code> exist. Mention the built-ins as "what I'd use in real code".</p>
  </div>

  <h2 id="dsa-bt-comb"><span class="num">07</span>Combination Sum &amp; Generate Parentheses</h2>
  <h3>Combination Sum (LeetCode 39)</h3>
  <p><strong>Problem:</strong> you have coins of values [2, 3, 6, 7] (unlimited of each). List every different combination that adds to 7. Order does not matter: [2, 2, 3] and [3, 2, 2] are the same.</p>
  <p><strong>Brute force:</strong> try every sequence of coins up to the target. That lists the same combination in many orders and wastes huge time.</p>
  <p><strong>Better idea:</strong> keep a <code>start</code> index. Only pick coins at or after <code>start</code>, so the path is always in sorted order and each combination appears once. Recurse with <code>j</code> (not <code>j + 1</code>) because the same coin can be used again. Sort the coins first; once a coin is bigger than what's left, all later coins are too, so <code>break</code>.</p>
  <table class="tbl">
    <caption>Dry run: coins [2, 3, 6, 7], target 7</caption>
    <tr><th>path</th><th>remaining</th><th>What happens</th></tr>
    <tr><td>[2]</td><td>5</td><td>keep going from coin 2</td></tr>
    <tr><td>[2, 2]</td><td>3</td><td>keep going</td></tr>
    <tr><td>[2, 2, 2]</td><td>1</td><td>next coin 2 &gt; 1 → break (pruned)</td></tr>
    <tr><td>[2, 2, 3]</td><td>0</td><td><strong>save</strong></td></tr>
    <tr><td>[2, 3]</td><td>2</td><td>coin 3 &gt; 2 → break</td></tr>
    <tr><td>[3]</td><td>4</td><td>[3, 3] leaves 1 → dead; 6 &gt; 4 → break</td></tr>
    <tr><td>[6]</td><td>1</td><td>6 &gt; 1 → break</td></tr>
    <tr><td>[7]</td><td>0</td><td><strong>save</strong></td></tr>
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
                break                    # prune: rest are even bigger
            path.append(c)
            go(j, remain - c)            # j, not j + 1: reuse allowed
            path.pop()
    go(0, target)
    return res

print(combination_sum([2, 3, 6, 7], 7))
print(combination_sum([2, 3, 5], 8))
print(combination_sum([2], 1))           # impossible -&gt; []
print(combination_sum([1], 2))</div>
  <div class="fx" data-lang="text">[[2, 2, 3], [7]]
[[2, 2, 2, 2], [2, 3, 3], [3, 5]]
[]
[[1, 1]]</div>
  <p>Forget the start index and loop from 0 every time, and the same combination comes out in every order:</p>
<div class="fx" data-lang="py">def combo_wrong(cands, target):
    res, path = [], []
    def go(remain):
        if remain == 0:
            res.append(path[:]); return
        for c in cands:                  # BUG: always from the first coin
            if c &lt;= remain:
                path.append(c); go(remain - c); path.pop()
    go(target)
    return res

print(combo_wrong([2, 3, 6, 7], 7))</div>
  <div class="fx" data-lang="text">[[2, 2, 3], [2, 3, 2], [3, 2, 2], [7]]</div>
  <p><strong>Complexity:</strong> exponential in the worst case: about O(k<sup>T/m</sup>) where k = number of coins, T = target, m = smallest coin (the deepest path uses T/m coins). Space O(T/m) for the path.</p>
  <div class="callout intu"><span class="label">Related</span>
    <p>If the question asks only <em>how many</em> combinations, or the <em>fewest coins</em>, do not list them. Use DP (Coin Change in the DP note) — it's polynomial instead of exponential.</p>
  </div>

  <h3>Generate Parentheses (LeetCode 22)</h3>
  <p><strong>Problem:</strong> given n pairs of brackets, list every valid (well-formed) string. For n = 3: <code>((()))</code>, <code>(()())</code>, <code>(())()</code>, <code>()(())</code>, <code>()()()</code>.</p>
  <p><strong>Brute force:</strong> build every string of length 2n from "(" and ")" (2<sup>2n</sup> of them) and keep the valid ones. Most are invalid, like <code>))((</code>.</p>
  <p><strong>Better idea:</strong> never build an invalid prefix. Two rules decide each next character:</p>
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
  <p>Because Python strings are immutable (cannot be changed in place), <code>s + "("</code> creates a new string for the call. The caller's <code>s</code> is untouched, so there is nothing to undo. The counts 1, 2, 5, 14, 42… are called <strong>Catalan numbers</strong>; time is about O(4<sup>n</sup>/√n), space O(n).</p>

  <h2 id="dsa-bt-grid"><span class="num">08</span>N-Queens &amp; Word Search</h2>
  <h3>N-Queens (LeetCode 51)</h3>
  <p><strong>Problem:</strong> place n chess queens on an n × n board so no two attack each other. A queen attacks along its row, its column and both diagonals. Return every board.</p>
  <p><strong>Brute force:</strong> try every way to put n queens on n² cells: for n = 8 that's 4.4 billion. Far too many.</p>
  <p><strong>Better idea:</strong> two queens can never share a row, so place exactly one queen per row, top to bottom. For each row, try each column, skip attacked cells, recurse to the next row, then remove the queen.</p>
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
  <p><strong>Complexity:</strong> at most n choices in row 0, n − 1 in row 1… → O(n!) boards tried, much less with pruning. Space O(n) for the sets and the stack (plus the output). n = 2 and n = 3 have no answer.</p>

  <h3>Word Search (LeetCode 79)</h3>
  <p><strong>Problem:</strong> a grid of letters and a word. Can you trace the word by moving up, down, left or right, using each cell at most once?</p>
  <figure class="viz"><svg viewBox="0 0 400 150" width="400">
<defs><marker id="dsa-bt-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<g class="fg sg"><rect x="20" y="10" width="40" height="40"/><rect x="60" y="10" width="40" height="40"/><rect x="100" y="10" width="40" height="40"/><rect x="100" y="50" width="40" height="40"/><rect x="100" y="90" width="40" height="40"/><rect x="60" y="90" width="40" height="40"/></g>
<g fill="none" stroke="currentColor"><rect x="20" y="10" width="160" height="120"/><path d="M60,10 V130 M100,10 V130 M140,10 V130 M20,50 H180 M20,90 H180"/></g>
<g text-anchor="middle" font-size="16"><text x="40" y="36">A</text><text x="80" y="36">B</text><text x="120" y="36">C</text><text x="160" y="36">E</text>
<text x="40" y="76">S</text><text x="80" y="76">F</text><text x="120" y="76">C</text><text x="160" y="76">S</text>
<text x="40" y="116">A</text><text x="80" y="116">D</text><text x="120" y="116">E</text><text x="160" y="116">E</text></g>
<text x="200" y="40">word = "ABCCED"</text>
<text x="200" y="64" class="tg">A→B→C→C→E→D found</text>
<text x="200" y="88" class="tm">"ABCB": needs B again,</text>
<text x="200" y="106" class="tm">but that cell is used → False</text>
</svg><figcaption>Green cells trace ABCCED. A cell cannot be reused, so the path must remember where it has been.</figcaption></figure>
  <p><strong>Idea:</strong> start a DFS (depth-first search: go as deep as possible before turning back) from every cell. At each step, the cell must match the next letter. Mark the cell "#" so this path cannot reuse it, try the 4 neighbours, then put the letter back (un-choose).</p>
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

board = [list("ABCE"), list("SFCS"), list("ADEE")]
for w in ["ABCCED", "SEE", "ABCB", "A", "Z", "ESCCBA"]:
    print(f"{w:7} {exist(board, w)}")
print("board unchanged:", ["".join(row) for row in board])</div>
  <div class="fx" data-lang="text">ABCCED  True
SEE     True
ABCB    False
A       True
Z       False
ESCCBA  True
board unchanged: ['ABCE', 'SFCS', 'ADEE']</div>
  <p><strong>Complexity:</strong> R·C starting cells; from each, the first step has 4 directions and later steps at most 3 (you can't go back) → O(R·C·4·3<sup>L−1</sup>) for word length L. Space O(L) for the stack.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Check <code>k == len(word)</code> <em>before</em> the bounds check, or a word that ends at the grid edge is reported as not found. And always restore the cell, or the next start position sees a damaged grid.</p>
  </div>

  <h2 id="dsa-bt-traps"><span class="num">09</span>Traps &amp; Complexity</h2>
  <h3>The most common bug: saving the path, not a copy</h3>
<div class="fx" data-lang="py">res, path = [], []
def go(i, nums):
    if i == len(nums):
        res.append(path)            # BUG: same list object every time
        return
    path.append(nums[i]); go(i + 1, nums); path.pop()
    go(i + 1, nums)

go(0, [1, 2])
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
    <tr><td>Combination Sum</td><td>O(k<sup>T/m</sup>)</td><td>O(T/m)</td><td>k coins, depth up to T/m</td></tr>
    <tr><td>Generate Parentheses</td><td>O(4<sup>n</sup>/√n)</td><td>O(n)</td><td>Catalan number of answers</td></tr>
    <tr><td>N-Queens</td><td>O(n!)</td><td>O(n)</td><td>one queen per row, fewer columns each row</td></tr>
    <tr><td>Word Search</td><td>O(R·C·3<sup>L</sup>)</td><td>O(L)</td><td>every start cell, 3 ways per letter</td></tr>
  </table>

  <h2 id="dsa-bt-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What two parts does every recursive function need?</summary><div class="qa-body">A base case (smallest input, answer returned directly) and a recursive step that makes the input smaller and calls the function again. Without a base case, or if the step never reaches it, you get <code>RecursionError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the space complexity of recursive factorial, and why?</summary><div class="qa-body">O(n). Each call waits on the call stack until the one above it returns, so n frames are on the stack at the deepest point. An iterative loop would use O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is plain recursive Fibonacci slow? How many calls for fib(20)?</summary><div class="qa-body">Each call makes two more calls, and the same values (fib(2), fib(3)…) are recomputed again and again. The tree has about 2<sup>n</sup> nodes: fib(20) makes 21,891 calls. Memoization cuts it to n + 1 distinct calls.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain backtracking in one line and name its three steps.</summary><div class="qa-body">Build a solution one choice at a time and undo the last choice when the path is finished or stuck. Steps: choose, explore (recurse), un-choose.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Subsets vs permutations: what changes in the code?</summary><div class="qa-body">Subsets loop from a <code>start</code> index and recurse with <code>j + 1</code>; every node (or every leaf in take/skip) is an answer. Permutations loop over all indices, skip ones in <code>used[]</code>, and save only when the path has length n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle duplicates, e.g. subsets of [1, 2, 2]?</summary><div class="qa-body">Sort first. In the loop, skip a number equal to the previous one at the same level: <code>if j &gt; start and nums[j] == nums[j-1]: continue</code>. Result: [], [1], [1,2], [1,2,2], [2], [2,2] — 6, not 8.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Combination Sum, why recurse with <code>j</code> and not <code>j + 1</code>?</summary><div class="qa-body">Each number can be reused, so the next pick may be the same number again. Using <code>j + 1</code> gives Combination Sum II behaviour (each number at most once). Starting from <code>j</code> rather than 0 avoids the same combination in different orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>res=[]; p=[1]; res.append(p); p.append(2); print(res)</code></summary><div class="qa-body"><code>[[1, 2]]</code>. <code>res</code> stores a reference to the list, not a snapshot. This is why backtracking saves <code>path[:]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does N-Queens check "is this cell attacked" in O(1)?</summary><div class="qa-body">One queen per row, so rows never clash. Keep three sets: used columns, used <code>r − c</code> values ("\\" diagonals) and used <code>r + c</code> values ("/" diagonals). A cell is safe if none of its three values is in the sets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Word Search: why mark the cell and then restore it?</summary><div class="qa-body">Marking stops the current path from using the same cell twice. Restoring lets other paths (from other start cells or other directions) use it. Without restoring, later searches see a broken grid and miss real answers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you NOT use backtracking?</summary><div class="qa-body">When the question asks only for a count, a yes/no, or the best value and the sub-problems repeat. Then DP is polynomial while backtracking is exponential (e.g. number of coin combinations, min coins, number of paths in a grid).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is pruning and does it change the answer?</summary><div class="qa-body">Pruning means stopping a branch as soon as it cannot lead to a valid answer (sum already too big, queen attacked). It doesn't change the answers, only the time. In the lock demo it cut calls from 1,111 to under 400.</div></details>
</main>`
});
