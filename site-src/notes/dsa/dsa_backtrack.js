// notes/dsa/dsa_backtrack.js — Recursion & Backtracking
Object.assign(TOPIC_CONTENT, {
  "dsa_backtrack": `<main>
<h1>Recursion &amp; Backtracking</h1>
  <div class="where"><span>DSA</span><span>Techniques</span><span>Recursion &amp; Backtracking</span></div>
  <p class="lead">Recursion is a way of solving a problem by letting a function call itself on a smaller copy of the same problem, and backtracking is the technique built on top of it for generating every possible answer one choice at a time. Interviewers use backtracking for questions that say "return all subsets", "list every arrangement", "find every combination that adds up to a target", for puzzles such as N-Queens and Sudoku, and for searching a word in a grid of letters. In real work the same idea powers schedulers, puzzle solvers and any tool that must explore every option under some rules. We will first build recursion itself from nothing (the base case, the call stack and the cost of a recursion tree) and then grow backtracking on one running example: Biteful's "build your combo" menu, with papad ₹20, raita ₹30, samosa ₹60 and lassi ₹70. Every selection, serving order, exact-price combo, budget thali and hidden dish name in this note comes from that one menu.</p>

  <h2 id="dsa-bt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Recursion &amp; Backtracking</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Recursion</div>
        <ul>
          <li>A function calls itself on a smaller input</li>
          <li><b>Base case</b> stops it; <b>recursive step</b> shrinks the input</li>
          <li>Waiting calls sit on the <b>call stack</b>: space = max depth</li>
          <li>Time = number of nodes in the recursion tree</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Backtracking</div>
        <ul>
          <li><b>Choose → explore → un-choose</b></li>
          <li>At the goal, save <code>path[:]</code> (a copy)</li>
          <li>DFS over a tree of choices; no visited set</li>
          <li><b>Pruning</b>: stop a branch that cannot succeed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Families</div>
        <ul>
          <li><b>Subsets</b>: take or skip, O(n·2<sup>n</sup>)</li>
          <li><b>Permutations</b>: <code>used[]</code>, O(n·n!)</li>
          <li><b>Combinations</b>: start index; <code>j</code> = reuse, <code>j + 1</code> = once</li>
          <li><b>Boards</b>: mark, try neighbours, unmark; constraint sets</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Watch out</div>
        <ul>
          <li><code>res.append(path)</code> saves a reference: answers end up empty</li>
          <li>Every choose needs its undo</li>
          <li>Only a count or best value wanted → think DP</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-bt-rec"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Recursion from Scratch</span><span class="rm-sub">base case, recursive step, the call stack</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-tree"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Recursion Tree and Its Cost</span><span class="rm-sub">counting calls to estimate time and space</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-idea"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Backtracking: Choose, Explore, Un-choose</span><span class="rm-sub">the template that lists every option</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-sub"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Subsets (Take or Skip)</span><span class="rm-sub">every selection of the add-ons</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-perm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Permutations</span><span class="rm-sub">every serving order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-comb"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Combination Sum &amp; Generate Parentheses</span><span class="rm-sub">hitting a target; building under rules</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-prune"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pruning</span><span class="rm-sub">cutting branches that cannot succeed</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-grid"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Word Search &amp; N-Queens</span><span class="rm-sub">backtracking on grids and boards</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-pat"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">trigger words, skeleton, what to practise</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">copies, missing undos, wrong start index</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">templates, costs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about recursion and backtracking</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bt-rec"><span class="num">01</span>Recursion from Scratch</h2>
  <p>Imagine you are standing at the back of a long queue at a ration shop and you want to know your position, but you cannot see the counter. You ask the person in front of you, "What number are you?" They cannot see either, so they ask the person in front of them, and the question travels forward until it reaches the first person, who can see the counter and simply says "1". Now the answers travel back: the second person says "1 + 1 = 2", the third says "3", and so on until the answer reaches you. Nobody worked out the whole queue alone. Each person did one tiny step and trusted the person ahead to do theirs.</p>
  <p>That is exactly what <strong>recursion</strong> is: a function that solves a problem by calling itself on a smaller version of the same problem. Every recursive function has two parts. The <strong>base case</strong> is the smallest version of the problem, whose answer is known straight away, like the first person in the queue; when the function reaches it, it returns without calling itself again. The <strong>recursive step</strong> makes the problem a little smaller, calls the function on that smaller problem, and uses the answer, like "my number is the number ahead of me plus one".</p>
  <p>Here is the idea on a Biteful bill. The total of the prices [60, 30, 20] is the first price, 60, plus the total of the rest, [30, 20]. That smaller total is 30 plus the total of [20], which is 20 plus the total of the empty list. An empty bill costs 0, and that is our base case:</p>
  <div class="fx" data-lang="py">def total(prices):                  # the bill for a list of dish prices
    if not prices:                  # base case: an empty bill costs 0
        return 0
    return prices[0] + total(prices[1:])   # first price + bill for the rest

print(total([60, 30, 20]))
print(total([]))</div>
  <div class="fx" data-lang="text">110
0</div>
  <p>The call <code>total([60, 30, 20])</code> never adds three numbers itself. It adds 60 to whatever <code>total([30, 20])</code> returns, and trusts that call to be right. This "trust" is the key habit for writing recursion: you do not trace every call in your head. You only make sure that the base case is correct and that each step is correct <em>assuming</em> the smaller call returns the right answer. If both are true, the whole function is correct, for the same reason a proof by induction works. (Slicing with <code>prices[1:]</code> copies the list on every call, so this version is O(n²); real code would pass an index, but the slice keeps the idea easy to see.)</p>
  <p>While <code>total([60, 30, 20])</code> waits for <code>total([30, 20])</code> to answer, it has half-finished work: it still needs to add 60. Python keeps every waiting call on a pile called the <strong>call stack</strong>. A stack is a pile where you only add and remove at the top, like a stack of plates (see <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a>). Each call gets a <strong>frame</strong> on the stack holding its local variables and the place where it must resume. A new call is pushed on top; when a call returns, its frame is popped and the call underneath carries on. Factorial shows this clearly: <code>fact(4) = 4 × fact(3)</code>, and <code>fact(1) = 1</code> is the base case.</p>
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
</svg><figcaption>Left: each call waits on top of the one that called it. Right: once fact(1) answers, each waiting call finishes its multiplication and pops off.</figcaption></figure>
  <p>On the left of the picture, the calls pile up: <code>fact(4)</code> calls <code>fact(3)</code>, which calls <code>fact(2)</code>, which calls <code>fact(1)</code>, and each one waits on top of the previous. On the right, <code>fact(1)</code> answers 1 straight away, and the answers flow back down: <code>fact(2)</code> finishes with 2, <code>fact(3)</code> with 6 and <code>fact(4)</code> with 24. The same thing printed by code, where a deeper indent means higher on the stack:</p>
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
  <p>The deepest line, <code>fact(1) called</code>, is the moment the stack is tallest: four frames. That height is the extra memory a recursive function needs, so the space cost of recursion is O(maximum depth), even though <code>fact</code> only returns one number. A loop computing the same factorial would need O(1) extra space.</p>
  <p>What if the base case is missing, or the steps never reach it? Then the calls never stop and the stack keeps growing. Python protects itself by allowing only about 1000 frames, and raises <code>RecursionError</code> when you go past that:</p>
  <div class="fx" data-lang="py">import sys
print("limit:", sys.getrecursionlimit())

def countdown(n):
    return countdown(n - 1)         # forgot: if n == 0: return

try:
    countdown(5)
except RecursionError as e:
    print("RecursionError:", e)</div>
  <div class="fx" data-lang="text">limit: 1000
RecursionError: maximum recursion depth exceeded</div>
  <p>So every recursive function needs both parts, and every call must move closer to the base case. A step like <code>f(n - 2)</code> with base case <code>n == 0</code> fails for odd n, because it jumps over 0. The 1000-frame limit also means recursion on a list of 10,000 items will crash in Python even when the logic is right; backtracking problems are usually shallow (depth 10 to 20), so this rarely bites there.</p>

  <h2 id="dsa-bt-tree"><span class="num">02</span>The Recursion Tree and Its Cost</h2>
  <p><code>total</code> and <code>fact</code> call themselves once per step, so their calls form a straight line. Many recursive functions call themselves two or more times, and then the calls branch out. To see how much work that is, we draw a <strong>recursion tree</strong>: one box for each call, with lines from a call to the calls it makes. The classic example is Fibonacci, the sequence 0, 1, 1, 2, 3, 5, 8, … where each number is the sum of the two before it, so <code>fib(n) = fib(n − 1) + fib(n − 2)</code>.</p>
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
</svg><figcaption>The recursion tree of fib(4). Green boxes are base cases. The red boxes show fib(2) being solved twice.</figcaption></figure>
  <p>The tree tells you both costs at a glance. The <strong>time</strong> is roughly the number of boxes multiplied by the work done inside one box. Each box here does O(1) work and splits into two, and the tree is about n levels deep, so the number of boxes grows roughly like 2<sup>n</sup>. The <strong>space</strong> is the height of the tree, not its size, because the call stack only ever holds the one path from the root down to the box currently running. Counting real calls confirms how fast the box count grows:</p>
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
  <p>Going from n = 20 to n = 25 multiplies the calls by more than ten, from 21,891 to 242,785, while the stack is never more than 25 frames deep. A useful rule of thumb: the number of calls is about (branches per call)<sup>depth</sup>. Two branches and depth n give 2<sup>n</sup>; n branches at the top, then n − 1, and so on, give n!.</p>
  <p>Look again at the red boxes. <code>fib(2)</code> is computed twice in the small tree, and for larger n the same small questions are recomputed thousands of times. That repeated work is pure waste, and removing it by remembering each answer is the job of <a class="xref" data-note="dsa_dp">Dynamic Programming</a>. But there is a different kind of problem where every leaf of the tree is a <em>different</em> answer that we actually want to list, such as every possible combo on the menu. There, the branching is not waste; it is the job itself. That kind of recursion is backtracking.</p>

  <h2 id="dsa-bt-idea"><span class="num">03</span>Backtracking: Choose, Explore, Un-choose</h2>
  <p>Biteful's "build your combo" screen offers three add-ons: papad ₹20, raita ₹30 and lassi ₹70. The product team wants a list of every possible selection of add-ons with its price, from "nothing" to "all three". With exactly three add-ons we can write it with three nested loops, one per add-on, each deciding "take it or not":</p>
  <div class="fx" data-lang="py">price = {"papad": 20, "raita": 30, "lassi": 70}
addons = ["papad", "raita", "lassi"]

picks = []
for take_p in (0, 1):               # one loop per add-on: works only for exactly 3
    for take_r in (0, 1):
        for take_l in (0, 1):
            chosen = [a for a, t in zip(addons, (take_p, take_r, take_l)) if t]
            picks.append(chosen)
for c in picks:
    print(f"{str(c):28} Rs {sum(price[a] for a in c)}")
print(len(picks), "selections")</div>
  <div class="fx" data-lang="text">[]                           Rs 0
['lassi']                    Rs 70
['raita']                    Rs 30
['raita', 'lassi']           Rs 100
['papad']                    Rs 20
['papad', 'lassi']           Rs 90
['papad', 'raita']           Rs 50
['papad', 'raita', 'lassi']  Rs 120
8 selections</div>
  <p>It works: 2 × 2 × 2 = 8 selections, from ₹0 for nothing to ₹120 for everything. But the code has three loops <em>because</em> there are three add-ons. With seven add-ons we would need seven nested loops, and in a real program the number of add-ons is only known when the program runs. You cannot write a variable number of nested loops by hand.</p>
  <p>Recursion can do it. One call handles one decision and then calls itself for the next decision, so the call stack plays the part of the nested loops and grows exactly as deep as needed. This is <strong>backtracking</strong>: building a candidate answer one choice at a time, and whenever the candidate is complete (save it) or cannot possibly work (abandon it), undoing the last choice and trying the next option. Think of opening a number lock by trial: you set the first dial, try every setting of the remaining dials, and if none opens the lock you turn the first dial back and move it to the next digit. You only ever change the last thing you set.</p>
  <p>Every backtracking function has the same three moves inside a loop over the options. <strong>Choose</strong>: add an option to the partial answer (usually a list called <code>path</code>). <strong>Explore</strong>: call the function again to make the remaining decisions. <strong>Un-choose</strong>: remove that option again so the same <code>path</code> list is clean for the next option. Before the loop, a goal check saves a copy of <code>path</code> when the answer is complete. Here is the template tracing a tiny menu: two courses, each either papad or raita.</p>
  <div class="fx" data-lang="py">def pick(path, dishes, courses, out, depth=0):
    pad = "  " * depth
    if len(path) == courses:                 # goal: every course chosen
        out.append(path[:])                  # save a COPY
        print(f"{pad}save {path}")
        return
    for d in dishes:
        path.append(d)                       # 1. choose
        print(f"{pad}choose {d}")
        pick(path, dishes, courses, out, depth + 1)   # 2. explore
        path.pop()                           # 3. un-choose
        print(f"{pad}undo   {d} -&gt; {path}")

out = []
pick([], ["papad", "raita"], 2, out)         # 2 courses, papad or raita in each
print(len(out), "menus:", out)</div>
  <div class="fx" data-lang="text">choose papad
  choose papad
    save ['papad', 'papad']
  undo   papad -&gt; ['papad']
  choose raita
    save ['papad', 'raita']
  undo   raita -&gt; ['papad']
undo   papad -&gt; []
choose raita
  choose papad
    save ['raita', 'papad']
  undo   papad -&gt; ['raita']
  choose raita
    save ['raita', 'raita']
  undo   raita -&gt; ['raita']
undo   raita -&gt; []
4 menus: [['papad', 'papad'], ['papad', 'raita'], ['raita', 'papad'], ['raita', 'raita']]</div>
  <p>Follow the first block of the output. The top call chooses papad, so <code>path</code> is [papad]. The second call chooses papad again, the third call sees two courses and saves [papad, papad]. Then the second call undoes papad, leaving [papad], chooses raita and saves [papad, raita]. When that loop ends, the top call undoes its papad, leaving [], and moves on to raita. The undo is what lets one list be reused for every answer; without it, <code>path</code> would keep growing into [papad, papad, raita, …]. Two options in each of two courses give 2 × 2 = 4 menus.</p>
  <p>If you draw these calls, you get a <strong>decision tree</strong>: the root is "nothing chosen yet", each level makes one decision, each line is one option, and every path from the root to a leaf is one complete answer. Backtracking walks this tree depth-first, exactly like depth-first search in <a class="xref" data-note="dsa_graphs">Graphs</a>, with one difference. Graph DFS marks each place visited and never returns to it, because it wants to visit each place once. Backtracking removes its marks on the way back (that is the un-choose step), because it wants to walk every <em>path</em>, and different paths may share the same choices.</p>
  <p>The cost of any backtracking function follows from the tree: time is the number of nodes in the decision tree times the work per node (often the O(n) copy made at each saved answer), and the extra space is the depth of the tree plus the <code>path</code>. Because the number of answers itself grows like 2<sup>n</sup> or n!, interview problems that want backtracking keep n small, typically 20 or less. When a question only asks for a count or the single best answer ("how many combos cost ₹70?"), listing everything is usually the wrong tool, and that is the signal to think about DP instead.</p>

  <h2 id="dsa-bt-sub"><span class="num">04</span>Subsets (Take or Skip)</h2>
  <p>The template above let papad appear twice and listed [papad, raita] and [raita, papad] as different menus. For the add-on screen we want something stricter: each add-on is either in the selection or not, once, and order does not matter. A set of items chosen from a collection, ignoring order, is called a <strong>subset</strong>, and the collection of all subsets is the <strong>power set</strong>. With n items there are 2<sup>n</sup> subsets, because each item independently has two possibilities.</p>
  <p>The backtracking version follows that sentence directly. Walk through the items in order, and at item i make exactly two branches: take it, or skip it. When you have passed the last item, every item has been decided, so <code>path</code> is a complete subset and you save it. The picture below is the decision tree for papad (P), raita (R) and lassi (L).</p>
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
</svg><figcaption>The take-or-skip decision tree. Moving down a solid line is "take" (choose); moving down a dashed line is "skip". Coming back up is un-choose. Each leaf is one subset.</figcaption></figure>
  <p>The leftmost path takes everything and ends at [P, R, L]; the rightmost skips everything and ends at []. The code walks the tree in exactly that left-to-right order: take first, explore, pop, then skip and explore again.</p>
  <div class="fx" data-lang="py">price = {"papad": 20, "raita": 30, "lassi": 70}

def subsets(items):
    res, path = [], []
    def go(i):
        if i == len(items):
            res.append(path[:])          # decided every item: save a COPY
            return
        path.append(items[i])            # choose: take items[i]
        go(i + 1)                        # explore
        path.pop()                       # un-choose
        go(i + 1)                        # explore again without items[i]
    go(0)
    return res

for s in subsets(["papad", "raita", "lassi"]):
    print(f"{str(s):28} Rs {sum(price[x] for x in s)}")
print("10 items -&gt;", len(subsets(list(range(10)))), "subsets")</div>
  <div class="fx" data-lang="text">['papad', 'raita', 'lassi']  Rs 120
['papad', 'raita']           Rs 50
['papad', 'lassi']           Rs 90
['papad']                    Rs 20
['raita', 'lassi']           Rs 100
['raita']                    Rs 30
['lassi']                    Rs 70
[]                           Rs 0
10 items -&gt; 1024 subsets</div>
  <p>The output lists the same 8 selections and prices that the hard-coded loops produced, starting with the leftmost leaf [papad, raita, lassi] at ₹120 and ending with the empty selection at ₹0, and now the same function handles 10 items (1,024 subsets) or any other number. There is a second common way to write subsets that you will reuse for combinations. Instead of "take or skip item i", each call loops over the items that come <em>after</em> the last one taken, using a <code>start</code> index, and every node of that tree is itself a valid subset, so it saves at every call rather than only at the leaves:</p>
  <div class="fx" data-lang="py">def subsets_loop(items):
    res, path = [], []
    def go(start):
        res.append(path[:])              # every node is a valid selection
        for j in range(start, len(items)):
            path.append(items[j])
            go(j + 1)                    # only later items: no reorders
            path.pop()
    go(0)
    return res

print(subsets_loop(["papad", "raita", "lassi"]))</div>
  <div class="fx" data-lang="text">[[], ['papad'], ['papad', 'raita'], ['papad', 'raita', 'lassi'], ['papad', 'lassi'], ['raita'], ['raita', 'lassi'], ['lassi']]</div>
  <p>Same eight subsets, in a different order: [], then [papad] and everything that extends it, then [raita] and its extensions, then [lassi]. Because the loop only looks at later items, [raita, papad] can never appear after [papad, raita] has. Both versions cost <strong>O(n · 2<sup>n</sup>) time</strong>: there are 2<sup>n</sup> subsets and copying each one takes up to n steps. The extra space is O(n) for <code>path</code> and the stack, not counting the output. The same subsets can also be listed without recursion by counting from 0 to 2<sup>n</sup> − 1 and reading each number's bits as take/skip (see <a class="xref" data-note="dsa_bits">Bit Manipulation</a>). In an interview, recognise subsets from phrases like "all subsets", "power set", "every selection" or "each element is in or out".</p>

  <h2 id="dsa-bt-perm"><span class="num">05</span>Permutations</h2>
  <p>A subset ignores order: {papad, raita} is one selection. The kitchen has a different question: in which order should the three small plates be served? Now papad-then-raita and raita-then-papad are different answers, and every dish must appear exactly once. An ordering of all the items is called a <strong>permutation</strong>, and n distinct items have n! of them: n choices for the first slot, n − 1 for the second, and so on. Three dishes give 3 × 2 × 1 = 6 orders.</p>
  <p>The subset code cannot produce these, because its <code>start</code> index never lets an earlier item come after a later one. The permutation version fills slots from left to right, and for each slot it tries <em>every</em> dish that is not already on the plate. To know which dishes are already used without searching the path each time, it keeps a list of booleans, <code>used</code>, with one entry per dish. Choosing a dish sets its flag and appends it; un-choosing pops it and clears the flag. The goal is reached when the path has all n dishes.</p>
  <table class="tbl">
    <tr><th>path</th><th>used (P R L)</th><th>what happens next</th></tr>
    <tr><td>[]</td><td>F F F</td><td>slot 1: try papad</td></tr>
    <tr><td>[P]</td><td>T F F</td><td>slot 2: papad is used, try raita</td></tr>
    <tr><td>[P, R]</td><td>T T F</td><td>slot 3: only lassi is free</td></tr>
    <tr><td>[P, R, L]</td><td>T T T</td><td>full: save, then pop lassi</td></tr>
    <tr><td>[P]</td><td>T F F</td><td>raita popped too; slot 2 now tries lassi</td></tr>
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
                continue                               # already on the plate
            used[j] = True;  path.append(items[j])     # choose
            go()                                       # explore
            path.pop();      used[j] = False           # un-choose
    go()
    return res

for p in permute(["papad", "raita", "lassi"]):
    print(p)
print(len(permute([1, 2, 3, 4])), "orders of 4 items")</div>
  <div class="fx" data-lang="text">['papad', 'raita', 'lassi']
['papad', 'lassi', 'raita']
['raita', 'papad', 'lassi']
['raita', 'lassi', 'papad']
['lassi', 'papad', 'raita']
['lassi', 'raita', 'papad']
24 orders of 4 items</div>
  <p>The first two orders both start with papad, exactly as the trace table shows; then raita takes the first slot, then lassi. Four items give 24 orders. The cost is <strong>O(n · n!) time</strong> (n! answers, each copied in O(n)) and O(n) extra space. At n = 10 that is already 3.6 million orderings, which is why interviewers keep n tiny. Python has <code>itertools.permutations</code> and <code>itertools.combinations</code>, and in real code you would use them, but in an interview you are expected to write the backtracking yourself and mention the built-ins. If the input contains duplicates, such as [raita, raita, papad], this code prints repeated orders; the fix is to sort and skip a twin whose earlier copy is not used, the same duplicate-skipping idea shown in the pruning section. Recognise permutations from "all orderings", "arrangements", "every sequence using each item once".</p>

  <h2 id="dsa-bt-comb"><span class="num">06</span>Combination Sum &amp; Generate Parentheses</h2>
  <p>Now the menu gets a target. A customer has a ₹70 voucher and wants to see every combo that costs exactly ₹70, choosing from papad ₹20, raita ₹30, samosa ₹60 and lassi ₹70, where any dish may be ordered more than once and order does not matter ([papad, raita, papad] is the same combo as [papad, papad, raita]). Subsets do not allow repeats and permutations count reorders, so we need a third shape. A selection where order does not matter is called a <strong>combination</strong>, and this problem is known as Combination Sum (LeetCode 39).</p>
  <p>The brute-force idea, trying every sequence of dishes until the money runs out, lists the same combo in every possible order and wastes most of its time. Two small changes fix it. First, keep a <strong>start index</strong>: each call may only pick dishes at position <code>start</code> or later. That forces every path into sorted order, so each combo can only be built one way. Second, recurse with <code>j</code>, not <code>j + 1</code>, after picking dish j, so the next pick may be the same dish again; that is how repeats are allowed. Sorting the prices first gives a free bonus: once a price is bigger than the money left, every later price is too, so the loop can <code>break</code>.</p>
  <table class="tbl">
    <tr><th>path</th><th>left</th><th>what happens</th></tr>
    <tr><td>[20]</td><td>50</td><td>keep going, starting from papad again</td></tr>
    <tr><td>[20, 20]</td><td>30</td><td>keep going</td></tr>
    <tr><td>[20, 20, 20]</td><td>10</td><td>next price 20 &gt; 10 → break</td></tr>
    <tr><td>[20, 20, 30]</td><td>0</td><td><b>save</b> papad + papad + raita</td></tr>
    <tr><td>[20, 30]</td><td>20</td><td>30 &gt; 20 → break</td></tr>
    <tr><td>[30]</td><td>40</td><td>[30, 30] leaves 10, dead; 60 &gt; 40 → break</td></tr>
    <tr><td>[60]</td><td>10</td><td>60 &gt; 10 → break</td></tr>
    <tr><td>[70]</td><td>0</td><td><b>save</b> lassi</td></tr>
  </table>
  <div class="fx" data-lang="py">def combination_sum(prices, target):
    prices = sorted(prices)
    res, path = [], []
    def go(start, remain):
        if remain == 0:
            res.append(path[:])
            return
        for j in range(start, len(prices)):
            p = prices[j]
            if p &gt; remain:
                break                    # sorted: every later price is bigger too
            path.append(p)
            go(j, remain - p)            # j, not j + 1: the same dish may repeat
            path.pop()
    go(0, target)
    return res

menu = {20: "papad", 30: "raita", 60: "samosa", 70: "lassi"}
for combo in combination_sum([20, 30, 60, 70], 70):
    print(combo, "=", " + ".join(menu[p] for p in combo))
print(combination_sum([2, 3, 5], 8))</div>
  <div class="fx" data-lang="text">[20, 20, 30] = papad + papad + raita
[70] = lassi
[[2, 2, 2, 2], [2, 3, 3], [3, 5]]</div>
  <p>Exactly two combos cost ₹70: papad + papad + raita, and a single lassi. The second line is LeetCode's own example, where 8 can be made as 2+2+2+2, 2+3+3 or 3+5. To see why the start index matters, here is the same search with the loop always starting from the first dish:</p>
  <div class="fx" data-lang="py">def combo_wrong(prices, target):
    res, path = [], []
    def go(remain):
        if remain == 0:
            res.append(path[:]); return
        for p in prices:                 # BUG: always restarts from the first dish
            if p &lt;= remain:
                path.append(p); go(remain - p); path.pop()
    go(target)
    return res

print(combo_wrong([20, 30, 60, 70], 70))</div>
  <div class="fx" data-lang="text">[[20, 20, 30], [20, 30, 20], [30, 20, 20], [70]]</div>
  <p>The papad-papad-raita combo now appears three times, once for each position the raita can take. The rule to say out loud in an interview is: "start from <code>start</code> so order cannot repeat; recurse with <code>j</code> if an item may be reused and with <code>j + 1</code> if each item may be used at most once" (the second version is Combination Sum II). The cost is exponential: with k dishes, a target T and a cheapest price m, the path is at most T/m long, so the tree has about k<sup>T/m</sup> nodes. If the question only asks <em>how many</em> combos there are, or the <em>fewest</em> dishes that reach ₹70, do not list them at all; that is Coin Change, solved in polynomial time in the <a class="xref" data-note="dsa_dp">DP note</a>.</p>
  <p>Some problems allow a choice only while a rule still holds, and the rules do the pruning for you. Generate Parentheses (LeetCode 22) asks for every well-formed string of n pairs of brackets. The brute force builds all 2<sup>2n</sup> strings of "(" and ")" and throws away the invalid ones. Backtracking never builds an invalid prefix in the first place, using two rules: add "(" only if fewer than n have been used, and add ")" only if it closes something, that is, if fewer ")" than "(" have been used so far.</p>
  <div class="fx" data-lang="py">def generate_parenthesis(n):
    res = []
    def go(s, opened, closed):
        if len(s) == 2 * n:
            res.append(s)
            return
        if opened &lt; n:                   # rule 1: still have an "(" to place
            go(s + "(", opened + 1, closed)
        if closed &lt; opened:              # rule 2: ")" must close something
            go(s + ")", opened, closed + 1)
    go("", 0, 0)
    return res

print(generate_parenthesis(3))
print("counts for n = 1..8:", [len(generate_parenthesis(n)) for n in range(1, 9)])</div>
  <div class="fx" data-lang="text">['((()))', '(()())', '(())()', '()(())', '()()()']
counts for n = 1..8: [1, 2, 5, 14, 42, 132, 429, 1430]</div>
  <p>For n = 3 there are five strings. For n = 8 there are 1,430, while the brute force would have generated 2<sup>16</sup> = 65,536 strings to find them. The counts 1, 2, 5, 14, 42, … are the Catalan numbers, which grow roughly like 4<sup>n</sup>/n<sup>1.5</sup>. Notice there is no explicit un-choose here: <code>s + "("</code> creates a new string for the call (Python strings cannot be changed in place), so the caller's <code>s</code> is untouched and there is nothing to undo. The same "only add a piece if the rule allows it" shape appears in Palindrome Partitioning and Restore IP Addresses, where each choice is "where does the next piece end?".</p>

  <h2 id="dsa-bt-prune"><span class="num">07</span>Pruning</h2>
  <p>Backtracking explores every option, and the number of options explodes. Most branches, though, are hopeless long before they finish: a combo that already costs more than the budget cannot become cheaper by adding dishes. <strong>Pruning</strong> means cutting off a branch of the decision tree as soon as you can prove that no completion of it can be a valid answer. Think of searching a building for a meeting room: if a corridor's sign says "storage only", you do not walk down it and open every door. Pruning never changes the answers, only how much work it takes to find them.</p>
  <p>Biteful's budget thali shows how big the saving can be. There are three courses (starter, main, dessert), each with ten dishes priced ₹0, 10, 20, …, 90, and the app must show every thali costing exactly ₹50. Without pruning, the search builds all 10 × 10 × 10 = 1,000 full thalis and checks each one. With pruning, a branch stops the moment its total passes ₹50: if starter plus main is already ₹70, no dessert can fix it. The code counts both:</p>
  <div class="fx" data-lang="py">prices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]    # 10 dishes per course (Rs)

def thali(path, prune, stats, budget=50):
    stats["calls"] += 1
    s = sum(path)
    if prune and s &gt; budget:            # already over budget: dead branch
        stats["cut"] += 1
        return
    if len(path) == 3:                  # starter, main, dessert chosen
        stats["found"] += (s == budget)
        return
    for p in prices:
        path.append(p); thali(path, prune, stats); path.pop()

for prune in [False, True]:
    stats = {"calls": 0, "found": 0, "cut": 0}
    thali([], prune, stats)
    print(f"prune={prune!s:5}  calls={stats['calls']:4}  cut={stats['cut']:3}  thalis={stats['found']}")</div>
  <div class="fx" data-lang="text">prune=False  calls=1111  cut=  0  thalis=21
prune=True   calls= 281  cut=197  thalis=21</div>
  <p>Both versions find the same 21 thalis, but pruning drops the calls from 1,111 to 281, because 197 branches are cut the moment they are entered. We can do better still. Instead of entering a call and then discovering it is over budget, check <em>before</em> choosing whether <code>s + p</code> would exceed the budget, and because the prices are sorted, the first price that is too much means every later one is too much as well, so the whole rest of the loop can be skipped with <code>break</code>:</p>
  <div class="fx" data-lang="py">prices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]    # sorted ascending

def thali_sorted(path, s, stats, budget=50):
    stats["calls"] += 1
    if len(path) == 3:
        stats["found"] += (s == budget)
        return
    for p in prices:
        if s + p &gt; budget:
            break                       # this price and every later one is too much
        path.append(p); thali_sorted(path, s + p, stats); path.pop()

stats = {"calls": 0, "found": 0}
thali_sorted([], 0, stats)
print(f"check before choosing + break: calls={stats['calls']}  thalis={stats['found']}")</div>
  <div class="fx" data-lang="text">check before choosing + break: calls=84  thalis=21</div>
  <p>The same 21 thalis now take only 84 calls, about thirteen times less work than the plain search. That is the general shape of good pruning: test as early as possible, and sort the options so that one failed test can rule out many options at once.</p>
  <p>A second kind of waste is finding the same answer twice. If the add-on list contains raita twice, plain subsets produce [papad, raita] twice, once with each raita. The fix is to sort the items so that equal items sit next to each other, and then, inside the loop, skip an item that equals the one just before it <em>at the same level</em> of the tree. The condition <code>j &gt; start</code> is what "at the same level" means: the first copy may still be taken, and a deeper call may take the second copy after the first, but two sibling branches may not both start with raita.</p>
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
  <p>Six distinct selections instead of eight with repeats: [raita, raita] appears once, and so does [papad, raita]. This "sort, then skip twins when <code>j &gt; start</code>" line is the standard fix in Subsets II, Combination Sum II and Permutations II.</p>
  <p>Pruning is only safe when the condition you prune on can never be repaired by a later choice. "Over budget" is safe because prices are never negative; if the menu had discounts with negative prices, a thali over ₹50 could come back down, and cutting it would lose real answers. Other common prunes are "a constraint is already broken" (two queens attack each other), "not enough items left to reach the required size", and, in optimisation problems, "this branch cannot beat the best answer found so far", which is called <strong>branch and bound</strong>. Pruning shrinks the tree in practice, but it rarely changes the worst-case complexity class.</p>

  <h2 id="dsa-bt-grid"><span class="num">08</span>Word Search &amp; N-Queens</h2>
  <p>So far the choices came from a list. On a board, a choice is "which neighbouring cell next" or "which column in this row", the rules depend on what has already been placed, and the un-choose step must restore the board. Biteful's promo puzzle hides dish names in a grid of letters, and the question (Word Search, LeetCode 79) is whether a word can be traced by moving up, down, left or right, using each cell at most once in that word.</p>
  <table class="tbl"><caption>The promo puzzle</caption>
    <tr><th></th><th>c0</th><th>c1</th><th>c2</th><th>c3</th></tr>
    <tr><th>r0</th><td>D</td><td>A</td><td>L</td><td>V</td></tr>
    <tr><th>r1</th><td>O</td><td>S</td><td>A</td><td>I</td></tr>
    <tr><th>r2</th><td>M</td><td>A</td><td>H</td><td>D</td></tr>
  </table>
  <p>The search is the grid DFS from the Graphs note with backtracking added. Try every cell as a starting point. A call <code>dfs(r, c, k)</code> asks: "can the word be finished from cell (r, c), given that letter k is the next one needed?" If k has reached the end of the word, everything matched. If the cell is off the board or holds the wrong letter, this branch fails. Otherwise, choose the cell by overwriting it with "#" so this path cannot use it again, explore the four neighbours with k + 1, and then un-choose by putting the letter back. Tracing MASALA: M is at (2,0), A to its right at (2,1), S above at (1,1), A above that at (0,1), L to the right at (0,2), and the final A below at (1,2). The A at (0,1) is marked "#" by then, so the path cannot cheat by reusing it.</p>
  <div class="fx" data-lang="py">def exist(board, word):
    R, C = len(board), len(board[0])
    def dfs(r, c, k):                   # k = index of the letter we need next
        if k == len(word):
            return True                 # matched every letter
        if r &lt; 0 or c &lt; 0 or r &gt;= R or c &gt;= C or board[r][c] != word[k]:
            return False
        saved, board[r][c] = board[r][c], "#"           # choose: mark the cell used
        found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or
                 dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))  # explore
        board[r][c] = saved                             # un-choose: restore it
        return found
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))

puzzle = [list("DALV"),                 # Biteful's promo puzzle
          list("OSAI"),
          list("MAHD")]
for w in ["DOSA", "DAL", "MASALA", "DOSAS", "VADA"]:
    print(f"{w:7} {exist(puzzle, w)}")
print("board afterwards:", ["".join(row) for row in puzzle])</div>
  <div class="fx" data-lang="text">DOSA    True
DAL     True
MASALA  True
DOSAS   False
VADA    False
board afterwards: ['DALV', 'OSAI', 'MAHD']</div>
  <p>DOSA, DAL and MASALA are found. DOSAS fails because the grid has only one S and it is already on the path after DOSA. VADA fails because V's only neighbours are L and I. The last line shows the board is exactly as it started, because every cell that was marked was restored. This is the difference from graph DFS worth remembering: graph DFS keeps its visited marks forever, because each place should be processed once; backtracking removes them, because each <em>path</em> may use a cell once but a different path may need the same cell. The cost is O(R · C · 3<sup>L</sup>) for an R × C board and a word of length L: every cell can be a start, and after the first step each letter has at most 3 directions to try (it cannot go back). The extra space is O(L) for the stack.</p>
  <p>N-Queens (LeetCode 51) is the classic placement puzzle: put n chess queens on an n × n board so that no two attack each other, where a queen attacks along its row, its column and both diagonals, and return every such board. Trying every way to place 8 queens on 64 squares is about 4.4 billion placements. The key insight is that two queens can never share a row, so exactly one queen goes in each row. That turns the problem into backtracking with one decision per row: for row r, try each column c, skip it if it is attacked, place the queen, recurse into row r + 1, then remove the queen.</p>
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
</svg><figcaption>Left: a queen at row 0, column 1 attacks its column and two diagonals. Right: one of the two solutions for n = 4.</figcaption></figure>
  <p>The left board shows the trick for checking attacks quickly. Every cell on a "\\" diagonal has the same value of row − column, and every cell on a "/" diagonal has the same row + column. The queen at (0, 1) blocks column 1, the diagonal where r − c = −1, and the diagonal where r + c = 1. So instead of scanning the board, we keep three sets, the used columns, the used r − c values and the used r + c values, and a cell is safe exactly when none of its three values is in those sets: an O(1) check. Here is the search for n = 4, printing each placement and removal until the first full board:</p>
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
            print(f"place  row {r} col {c}")
            if go(r + 1):
                return True
            cols.remove(c); d1.remove(r - c); d2.remove(r + c); placed.pop()
            print(f"remove row {r} col {c}")
        return False
    go(0)

queens_trace(4)          # stop at the first full board</div>
  <div class="fx" data-lang="text">place  row 0 col 0
place  row 1 col 2
remove row 1 col 2
place  row 1 col 3
place  row 2 col 1
remove row 2 col 1
remove row 1 col 3
remove row 0 col 0
place  row 0 col 1
place  row 1 col 3
place  row 2 col 0
place  row 3 col 2
SOLUTION [(0, 1), (1, 3), (2, 0), (3, 2)]</div>
  <p>The trace shows backtracking at work. With the first queen at column 0, row 1 tries column 2, finds that rows 2 and 3 cannot be completed, removes it, tries column 3, gets one row further, and fails again. Every option under "row 0, column 0" is exhausted, so that queen is removed too, and the search moves it to column 1. From there each row finds a safe column and the board (0,1), (1,3), (2,0), (3,2) is complete, matching the right-hand picture. The full solver collects every board instead of stopping at the first:</p>
  <div class="fx" data-lang="py">def solve_n_queens(n):
    res = []
    cols, diag1, diag2 = set(), set(), set()     # used columns, r-c values, r+c values
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

print(solve_n_queens(4))
print("solutions for n = 1..8:", [len(solve_n_queens(n)) for n in range(1, 9)])</div>
  <div class="fx" data-lang="text">[['.Q..', '...Q', 'Q...', '..Q.'], ['..Q.', 'Q...', '...Q', '.Q..']]
solutions for n = 1..8: [1, 0, 0, 2, 10, 4, 40, 92]</div>
  <p>n = 4 has two boards (mirror images of each other), n = 2 and n = 3 have none, and the famous n = 8 has 92. The time is bounded by O(n!), since row 0 has n choices, row 1 at most n − 1 that avoid the first column, and so on, and the attack checks prune far more than that in practice. The extra space is O(n) for the sets and the stack. Sudoku Solver uses the same shape: one decision per empty cell, sets for each row, column and 3 × 3 box, place, recurse, remove.</p>

  <h2 id="dsa-bt-pat"><span class="num">09</span>Choosing the Pattern</h2>
  <p>Backtracking is the right tool when a question asks for <em>all</em> answers ("return all", "list every", "generate all possible", "find every valid…"), or asks you to build one answer piece by piece under rules, and the input is small (n up to about 20, a board up to 9 × 9). If the question asks only for the number of answers, the best answer, or yes/no, and the same small state is reached along many paths, check dynamic programming first, because listing an exponential number of answers just to count them is the slow way.</p>
  <p>Once you know it is backtracking, the families in this note differ in only one place: which options the loop offers at each step. Everything else, the goal check, choose, explore, un-choose and pruning, is the same skeleton. Here it is written once and plugged into one family, the 2-dish combos from the add-on menu:</p>
  <div class="fx" data-lang="py">def backtrack(path, options, out):
    if is_goal(path):
        out.append(path[:])              # save a COPY, then stop going deeper
        return
    for opt in options(path):            # the only line that changes between families
        if not is_valid(path, opt):
            continue                     # prune
        path.append(opt)                 # choose
        backtrack(path, options, out)    # explore
        path.pop()                       # un-choose

# plug in one family: 2-dish combos from the add-on menu, order ignored
menu = ["papad", "raita", "lassi"]
is_goal = lambda path: len(path) == 2
options = lambda path: menu[menu.index(path[-1]) + 1:] if path else menu
is_valid = lambda path, opt: True
out = []
backtrack([], options, out)
print(out)</div>
  <div class="fx" data-lang="text">[['papad', 'raita'], ['papad', 'lassi'], ['raita', 'lassi']]</div>
  <p>Only <code>options</code> changed to make this a combinations search: "dishes after the last one chosen". Swapping in "all unused dishes" would make it permutations, "this item or nothing" would make it subsets, and "the four neighbours of the current cell" would make it a grid search. The table maps the words you will see in problem statements to the family and its cost.</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Pattern</th><th>Options at each step</th><th>Cost</th></tr>
    <tr><td>"all subsets", "power set", "each element in or out"</td><td>Subsets</td><td>take item i or skip it</td><td>O(n·2<sup>n</sup>)</td></tr>
    <tr><td>"all orderings", "arrangements", "permutations"</td><td>Permutations</td><td>any unused item (<code>used[]</code>)</td><td>O(n·n!)</td></tr>
    <tr><td>"combinations", "choose k", "sum to target"</td><td>Combinations</td><td>items from <code>start</code>; recurse <code>j</code> (reuse) or <code>j + 1</code> (once)</td><td>O(k<sup>T/m</sup>) or O(C(n, k)·k)</td></tr>
    <tr><td>"valid", "well-formed", "partition the string", "restore IP"</td><td>Build under rules</td><td>only pieces the rules still allow</td><td>number of valid answers × length</td></tr>
    <tr><td>"split into k equal groups", "assign jobs to workers"</td><td>Buckets + pruning</td><td>put the next item into some bucket</td><td>O(k<sup>n</sup>), pruned heavily</td></tr>
    <tr><td>"path in a grid", "adjacent cells", "each cell used once"</td><td>Grid DFS + mark</td><td>the 4 neighbours</td><td>O(R·C·3<sup>L</sup>)</td></tr>
    <tr><td>"place so that no two…", "sudoku", "count the boards"</td><td>Constraint placement</td><td>each legal column / digit, checked with sets</td><td>O(n!) for N-Queens</td></tr>
    <tr><td>"how many ways", "minimum", "can you", with large n</td><td>Not backtracking</td><td>use DP or greedy</td><td>polynomial</td></tr>
  </table>
  <p>In the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, a good order is: 78 Subsets and 784 Letter Case Permutation (take or skip), then 46 Permutations and 47 Permutations II (the <code>used[]</code> array and duplicates), then 39, 40 and 216 Combination Sum (start index, <code>j</code> versus <code>j + 1</code>), 17 Letter Combinations of a Phone Number and 22 Generate Parentheses (building under rules), 90 Subsets II and 131 Palindrome Partitioning (duplicate skipping and cutting a string), 79 Word Search (grid marking), and finally 51 N-Queens and 37 Sudoku Solver (constraint sets), with 698 Partition to K Equal Sum Subsets as the hardest pruning exercise.</p>

  <h2 id="dsa-bt-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common backtracking bug is saving <code>path</code> itself instead of a copy of it. <code>res.append(path)</code> stores a reference to the one shared list, not a snapshot of its current contents, so when the un-choose steps later empty that list, every saved "answer" empties with it:</p>
  <div class="fx" data-lang="py">res, path = [], []
def go(i, items):
    if i == len(items):
        res.append(path)            # BUG: saves the same list object every time
        return
    path.append(items[i]); go(i + 1, items); path.pop()
    go(i + 1, items)

go(0, ["papad", "raita"])
print(res)</div>
  <div class="fx" data-lang="text">[[], [], [], []]</div>
  <p>All four saved entries are the same list object, and after the last pop it is empty. The fix is <code>res.append(path[:])</code> or <code>res.append(list(path))</code>, which stores a new list with the current contents.</p>
  <p>The second classic bug is forgetting the un-choose step. Every change made before the recursive call (an append, setting <code>used[j] = True</code>, marking a cell "#", adding to a set) must be reversed after it, or the next branch starts with the previous branch's leftovers:</p>
  <div class="fx" data-lang="py">res, path = [], []
def go(i, items):
    if i == len(items):
        res.append(path[:])
        return
    path.append(items[i]); go(i + 1, items)    # BUG: no path.pop() after the call
    go(i + 1, items)

go(0, ["papad", "raita"])
print(res)</div>
  <div class="fx" data-lang="text">[['papad', 'raita'], ['papad', 'raita'], ['papad', 'raita', 'raita'], ['papad', 'raita', 'raita']]</div>
  <p>Instead of the four subsets [papad, raita], [papad], [raita] and [], the output is full of stale items, including [papad, raita, raita], because nothing ever removed what was appended. A good habit is to write the undo line at the same moment you write the choose line.</p>
  <p>Three more mistakes come up regularly. In combination problems, looping from 0 instead of from <code>start</code> produces the same combo in every order, and recursing with <code>j + 1</code> instead of <code>j</code> silently forbids reuse (the ₹70 search would lose papad + papad + raita). In grid searches, forgetting to restore the cell leaves later start positions with a damaged board, so real answers are missed. And pruning on a condition that a later choice could repair, such as "over budget" when some prices are negative, loses answers without any error. Finally, remember that Python's recursion limit is about 1000 frames: fine for backtracking on 20 items, fatal for recursion over a 10,000-element list.</p>

  <h2 id="dsa-bt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Recursion</b>: a function that calls itself on a smaller input. Needs a <b>base case</b> (answer known, no more calls) and a <b>recursive step</b> (shrink, call, use the answer).</li>
    <li><b>Call stack</b>: one frame per waiting call. Recursion's extra space = maximum depth.</li>
    <li><b>Recursion tree</b>: one node per call. Time ≈ nodes × work per node; calls ≈ branches<sup>depth</sup>.</li>
    <li><b>Backtracking</b>: build an answer one choice at a time; choose, explore, un-choose; save a copy at the goal.</li>
    <li><b>Pruning</b>: stop a branch that cannot lead to a valid answer. Changes the work, never the answers.</li>
  </ul>
  <h3>Families</h3>
  <table class="tbl">
    <tr><th>Family</th><th>Loop / recursion</th><th>Save when</th><th>Time</th></tr>
    <tr><td>Subsets</td><td>take: go(i+1), pop; skip: go(i+1)</td><td>i == n</td><td>O(n·2<sup>n</sup>)</td></tr>
    <tr><td>Permutations</td><td>for j not used: mark, go(), unmark</td><td>len(path) == n</td><td>O(n·n!)</td></tr>
    <tr><td>Combination sum</td><td>for j ≥ start: go(j, left − p) or go(j + 1, …)</td><td>left == 0</td><td>O(k<sup>T/m</sup>)</td></tr>
    <tr><td>Parentheses</td><td>"(" if open &lt; n; ")" if close &lt; open</td><td>len == 2n</td><td>O(4<sup>n</sup>/√n)</td></tr>
    <tr><td>Word search</td><td>mark "#", 4 neighbours with k + 1, restore</td><td>k == len(word)</td><td>O(R·C·3<sup>L</sup>)</td></tr>
    <tr><td>N-Queens</td><td>row r: each safe c (sets: col, r−c, r+c)</td><td>r == n</td><td>O(n!)</td></tr>
  </table>
  <h3>Skeleton</h3>
  <div class="fx" data-lang="py">def backtrack(path, start):
    if is_goal(path):
        res.append(path[:])          # copy!
        return
    for j in range(start, len(items)):
        if j &gt; start and items[j] == items[j - 1]:
            continue                 # skip duplicate at the same level (sorted input)
        if cannot_succeed(path, items[j]):
            break                    # prune (sorted input)
        path.append(items[j])        # choose
        backtrack(path, j + 1)       # explore (j to allow reuse)
        path.pop()                   # un-choose</div>
  <h3>On the running example</h3>
  <ul>
    <li>Add-ons papad, raita, lassi: 2<sup>3</sup> = 8 selections, 3! = 6 serving orders.</li>
    <li>₹70 from [20, 30, 60, 70] with reuse: [20, 20, 30] and [70].</li>
    <li>Budget thali: 1,111 calls → 281 (prune on entry) → 84 (check before choosing + break), always 21 thalis.</li>
    <li>Promo puzzle: DOSA, DAL, MASALA found; DOSAS, VADA not.</li>
    <li>N-Queens solutions for n = 1…8: 1, 0, 0, 2, 10, 4, 40, 92.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>res.append(path)</code> saves a reference → all answers end up empty. Save <code>path[:]</code>.</li>
    <li>Every choose (append, <code>used[j] = True</code>, mark "#", add to set) needs its undo.</li>
    <li>Combinations start at <code>start</code>, not 0; <code>j</code> for reuse, <code>j + 1</code> for once.</li>
    <li>Duplicates: sort, then skip <code>items[j] == items[j-1]</code> when <code>j &gt; start</code>.</li>
    <li>Prune only on conditions no later choice can repair.</li>
    <li>Count / best value only, with repeated states → DP, not backtracking.</li>
  </ul>

  <h2 id="dsa-bt-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is recursion, and what two parts must every recursive function have?</summary><div class="qa-body">Recursion is a function solving a problem by calling itself on a smaller version of the same problem. It needs a base case, the smallest input whose answer is returned directly, and a recursive step that makes the input smaller, calls the function and uses the result. Without a reachable base case the calls never stop and Python raises <code>RecursionError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the call stack, and what is the space complexity of recursive factorial?</summary><div class="qa-body">The call stack holds one frame (local variables and a resume point) for every call that has started but not finished. Recursive <code>fact(n)</code> has n frames on the stack at its deepest point, so it uses O(n) extra space even though it returns one number. A loop would use O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the time complexity of a recursive function?</summary><div class="qa-body">Draw the recursion tree and count its nodes, then multiply by the work done in one node. A rough rule is branches<sup>depth</sup>: two calls per step and depth n gives about 2<sup>n</sup>. The depth of the tree gives the space, not the time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is naive recursive Fibonacci slow, and how would you fix it?</summary><div class="qa-body">Each call makes two more calls and nothing is remembered, so the same values are recomputed many times; fib(20) makes 21,891 calls and the count grows exponentially. Storing each fib(k) the first time it is computed (memoisation) or filling a table from small to large makes it O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is backtracking? Name its three steps.</summary><div class="qa-body">Backtracking builds a solution one choice at a time and undoes the most recent choice when the partial solution is complete or cannot succeed, so it can try the next option. The steps are choose (add the option), explore (recurse), and un-choose (remove it). It is a depth-first search over a tree of choices.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is backtracking different from graph DFS?</summary><div class="qa-body">Both go deep first. Graph DFS walks a given graph and keeps a visited mark forever, so each node is processed once. Backtracking walks an implicit tree of partial answers and removes its marks on the way back, because every path must be explored even if paths share cells or items.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many subsets and permutations do n distinct items have, and what does generating them cost?</summary><div class="qa-body">2<sup>n</sup> subsets and n! permutations. Generating them takes O(n·2<sup>n</sup>) and O(n·n!) time, because each answer is copied in O(n). Extra space beyond the output is O(n) for the path and the stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Subsets versus permutations: what changes in the code?</summary><div class="qa-body">Subsets loop from a <code>start</code> index and recurse with <code>j + 1</code> (or take/skip each item), so later items never come before earlier ones. Permutations loop over every index, skip those marked in a <code>used</code> array, and save only when the path holds all n items.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Combination Sum, why recurse with <code>j</code> and not <code>j + 1</code>, and why start from <code>start</code> rather than 0?</summary><div class="qa-body">Recursing with <code>j</code> lets the same item be picked again, which the problem allows. Starting at <code>start</code> keeps every path in sorted order, so each combination is produced once instead of once per ordering. With <code>j + 1</code> each item is used at most once, which is Combination Sum II.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you avoid duplicate answers when the input has repeated values?</summary><div class="qa-body">Sort the input so equal values are adjacent, then in the loop skip an item equal to the previous one when <code>j &gt; start</code>. That stops two sibling branches from starting with the same value while still allowing a deeper call to use the second copy. For permutations, skip a twin whose earlier copy is not currently used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>res = []; p = [1]; res.append(p); p.append(2); print(res)</code></summary><div class="qa-body"><code>[[1, 2]]</code>. <code>res</code> stores a reference to the list, not a snapshot, so later changes to <code>p</code> show up inside <code>res</code>. This is why backtracking saves <code>path[:]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is pruning, and when is it unsafe?</summary><div class="qa-body">Pruning stops exploring a branch once it is certain that no completion can be a valid answer, for example a combo that is already over budget. It changes only the work, not the answers. It is unsafe when a later choice could still repair the condition, such as pruning "over budget" when some prices can be negative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Word Search, why do you mark the cell and then restore it?</summary><div class="qa-body">Marking stops the current path from using the same cell twice. Restoring makes the cell available again for other paths and other starting cells. Without restoring, later searches see a damaged board and miss words that are really there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does N-Queens check whether a square is attacked in O(1)?</summary><div class="qa-body">It places one queen per row, so rows never clash. It keeps three sets: used columns, used <code>row − col</code> values (one diagonal direction) and used <code>row + col</code> values (the other). A square is safe if none of its three values is in the sets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Generate Parentheses: why is backtracking better than generating all strings and filtering?</summary><div class="qa-body">Filtering builds all 2<sup>2n</sup> strings and checks each one. Backtracking only adds "(" while fewer than n are used and ")" while it closes an open bracket, so it never builds an invalid prefix and does work proportional to the valid answers (the Catalan numbers), which are far fewer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use backtracking?</summary><div class="qa-body">When the question wants only a count, a yes/no or the best value, and the same subproblem (say, an index and a remaining amount) is reached by many paths. Dynamic programming then solves it in polynomial time, while backtracking would be exponential. Also when n is large: 2<sup>n</sup> or n! will not finish.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you turn a backtracking solution into a DP solution?</summary><div class="qa-body">Make the recursive function return a value (a count or a best cost) instead of building a path, and make its result depend only on a small state such as (index, remaining amount). Then cache the result for each state the first time it is computed. This only works when you need a value, not the full list of answers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can deep recursion be a problem in Python, and what can you do?</summary><div class="qa-body">CPython allows about 1000 nested calls by default and raises <code>RecursionError</code> beyond that, and each frame costs memory. Backtracking is usually shallow, but for deep recursion you can rewrite it with an explicit stack in a loop; raising <code>sys.setrecursionlimit</code> is a quick fix that can crash the interpreter if pushed too far.</div></details>
</main>
`
});
