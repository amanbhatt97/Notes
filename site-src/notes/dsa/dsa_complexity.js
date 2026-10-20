// notes/dsa/dsa_complexity.js — Complexity & Python Internals
Object.assign(TOPIC_CONTENT, {
  "dsa_complexity": `<main>
<h1>Complexity &amp; Python Internals</h1>
  <div class="where"><span>DSA</span><span>Foundations</span><span>Complexity &amp; Python Internals</span></div>
  <p class="lead">How to say "this code is fast" in a way that stays true for 8 items and for 10 lakh items. The note starts from one shock: two correct programs for the same job, one finishing in a hundredth of a second and the other in half a minute. Everything after that is a tool for predicting such a gap <em>before</em> you run the code: counting steps, Big-O, the common growth classes, space, amortised cost, what Python's list and dict really do inside, the call stack, and finally how to read a problem's constraints and know which solution is expected. The running example is Biteful's 8 charges from one day, the same numbers the Arrays, Hashing and Linked Lists notes use. Every output below is a real run (Python 3.13); timings vary by machine, so the prose quotes rough ratios.</p>

  <h2 id="dsa-cx-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-cx-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Python: Functions (recursion) · Lists &amp; Tuples · Dicts &amp; Sets</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-cx-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Complexity &amp; Python Internals</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · how fast, how much memory</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-cx-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-cx-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-cx-ga)"/>
<line x1="200" y1="158" x2="228" y2="158" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#dsa-cx-ga)"/>
<line x1="410" y1="158" x2="438" y2="158" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#dsa-cx-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Arrays &amp; Two Pointers</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">O(n²) pair loops → O(n)</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Hashing</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">"seen before?" in O(1)</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Linked Lists</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">O(1) at the front</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-cx-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">every later DSA note · the Problem Tracker (each problem lists its time and space)</text>
</svg><figcaption>The first note of the DSA track. Read it first, then Arrays → Hashing → Linked Lists (dotted arrows). Every later note quotes Big-O, so this is the vocabulary for all of them.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>, <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>, <a class="xref" data-note="py_functions">Functions</a></b><span>You can already store Biteful's charges in a list, look things up in a dict or set, and write a function that calls itself. Those notes showed <em>how</em> to use them. They did not give you a way to predict how slow a program will get when the data grows from 8 rows to 1 lakh.</span></li>
    <li><b>This note adds: a way to measure code without a stopwatch</b><span>Count steps, label the growth with Big-O, know the cost of every list/dict operation and of recursion, and read a problem's input limits to know which Big-O the answer must have.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_arrays">Arrays, Strings &amp; Two Pointers</a></b><span>The first technique note. It takes the same 8 charges and turns every O(n²) "check all pairs" loop into an O(n) pass. Then <a class="xref" data-note="dsa_hashing">Hashing</a> (the set trick from section 01, in depth) and <a class="xref" data-note="dsa_linkedlist">Linked Lists</a> (the fix for the slow front insert of section 07). Practice problems live in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-cx-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it, and its weakness raises the next question. Numbers come from the running example and real runs.</p>
  <ol class="story">
    <li><b>The need</b><span>Q: does it matter how we write a correct program? → Yes. Two correct duplicate checks on 1 lakh charges: the set version took about 0.02 s, the list version about 29 s (measured). But measuring after the fact is too late. Can we predict the gap from the code?</span></li>
    <li><b>Counting steps</b><span>Q: how much work does each version do? → Count comparisons as a function of n: the list version does n(n−1)/2 (28 for our 8 charges, 5 billion for 1 lakh), the set version n lookups. Binary search on the sorted 8 charges needs 4 steps, a plain scan 8. But exact counts like n(n−1)/2 + n + 2 get messy…</span></li>
    <li><b>Big-O</b><span>Q: what single label tells us how the work grows? → Keep the dominant term, drop constants: n + 1 → O(n), n(n−1)/2 → O(n²). Traced on 3 snippets: doubling n doubles A and quadruples B and C. But what do these labels mean in seconds?</span></li>
    <li><b>The common classes</b><span>Q: how do O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ) compare in practice? → Measured for n = 10 … 10⁶: O(n²) is already 2 s at n = 10⁴ while O(n log n) is 0.3 s at 10⁶. But time is not the only thing a program spends…</span></li>
    <li><b>Space complexity</b><span>Q: how much extra memory does it use? → The set version kept about 4 MB for 1 lakh ids, the list version 0.8 MB, sort-and-scan almost nothing. We now see the trade: memory for speed. But the set and list grow one item at a time; isn't growing a container expensive?</span></li>
    <li><b>Amortised analysis</b><span>Q: why is <code>append</code> called O(1) when it sometimes copies everything? → Traced with <code>sys.getsizeof</code>: our 8 appends caused only 2 resizes; 10 lakh appends cause 86. Averaged, about one copy per append. But why are some list operations O(1) and others O(n) at all?</span></li>
    <li><b>Inside a Python list</b><span>Q: what is a list in memory? → A dynamic array: one block of slots, so <code>a[i]</code> is one jump but <code>insert(0, x)</code> shifts everyone (1 lakh front inserts: about a second vs a few ms for append). And how does a set find a value without scanning?</span></li>
    <li><b>Inside dict &amp; set</b><span>Q: how is <code>x in set</code> O(1)? → A hash table: hash(310) % 8 = slot 6, jump there. 1,000 lookups: list hundreds of ms, set a fifth of a ms. Now we know the cost of every container operation. What about the cost of a function calling itself?</span></li>
    <li><b>Recursion &amp; the call stack</b><span>Q: what does recursion cost? → Each waiting call is a stack frame: summing 4 charges recursively keeps 5 calls open, n charges keep n + 1. Python stops near 1000 (RecursionError). Naive Fibonacci makes 2.7 million calls for n = 30. With all these costs known, how do we choose a solution before writing it?</span></li>
    <li><b>Reading constraints</b><span>Q: the problem says n ≤ 10⁵; which Big-O do I need? → Python does roughly 10⁷ simple steps per second (14 million measured). n² = 10¹⁰ is far too many; n log n ≈ 1.7 million is fine. So "n ≤ 10⁵" means "find an O(n) or O(n log n) idea", which is what the next notes teach.</span></li>
  </ol>

  <h2 id="dsa-cx-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Complexity &amp; Python Internals</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What "fast" means</div>
        <ul>
          <li><b>Count steps, not seconds</b> — seconds change with the laptop; step count does not</li>
          <li><b>n</b> — input size (charges in the list, letters in the string)</li>
          <li><b>Worst case</b> — the slowest input; this is what Big-O usually describes</li>
          <li>💡 Phone book: reading every page = n steps; opening at the middle again and again = log n steps</li>
          <li>Real run: 1 lakh charges → list check ~29 s, set check ~0.02 s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Big-O rules</div>
        <ul>
          <li><b>Big-O</b> — how step count grows when n grows; only the biggest term, no constants</li>
          <li><b>Drop constants</b> — 3n → O(n); n/2 → O(n)</li>
          <li><b>Drop smaller terms</b> — n² + 5n + 20 → O(n²)</li>
          <li><b>Loops multiply, sequences add</b> — nested loops n·n; two loops one after another n + n</li>
          <li><b>Different inputs, different letters</b> — O(n + m), O(n·m), never "n" for both</li>
          <li>⚠ <b>Hidden cost inside a loop</b> — <code>x in list</code>, <code>.sort()</code>, slicing inside a loop multiply the loop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The classes (fast → slow)</div>
        <ul>
          <li><b>O(1)</b> — same steps whatever n: <code>a[i]</code>, <code>d[k]</code>, <code>len()</code></li>
          <li><b>O(log n)</b> — halve the problem each step: binary search, heap push/pop</li>
          <li><b>O(n)</b> — touch each item once: sum, max, one loop</li>
          <li><b>O(n log n)</b> — good sorting: <code>sorted()</code>, merge sort</li>
          <li><b>O(n²)</b> — every pair: nested loops, bubble sort</li>
          <li><b>O(2ⁿ)</b> — every subset (pick / skip each item); n = 22 already took ~3 s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Space complexity</div>
        <ul>
          <li><b>Space</b> — extra memory beyond the input; the input itself is not counted</li>
          <li><b>O(1)</b> — a few variables, swapping in place</li>
          <li><b>O(n)</b> — a new list / set / dict that grows with n</li>
          <li><b>Recursion</b> — each open call holds a stack frame; depth n → O(n) space</li>
          <li><b>Trade</b> — spend O(n) space (a set) to cut O(n²) time to O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Amortized cost</div>
        <ul>
          <li><b>Amortized</b> — average cost per operation over a long run, not the single worst one</li>
          <li><b>list.append</b> — usually O(1); when full, Python grabs a bigger block and copies (O(n))</li>
          <li>Resizes are rare: 10 lakh appends → only 86 resizes</li>
          <li>💡 Shifting to a bigger house: costly once, then years of free space</li>
          <li>Say "O(1) amortized" for append, <code>dict</code>/<code>set</code> insert</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside list, dict, set</div>
        <ul>
          <li><b>list = dynamic array</b> — slot i is at start + i × 8 bytes → <code>a[i]</code> O(1)</li>
          <li><b>insert(0) / pop(0) / x in list</b> — O(n): shift or scan</li>
          <li><b>dict / set = hash table</b> — <code>hash(key) % slots</code> → jump; O(1) average</li>
          <li>⚠ Keys must be hashable: <code>list</code> as key → <code>TypeError</code>; use <code>tuple</code></li>
          <li>Need a fast front? <code>collections.deque</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursion &amp; the stack</div>
        <ul>
          <li><b>Call stack</b> — every call that is still waiting keeps a frame</li>
          <li><b>Space</b> = deepest chain of waiting calls</li>
          <li><b>Time</b> = number of calls × work per call (naive Fibonacci: ~2ⁿ calls)</li>
          <li>⚠ Python's limit is 1000 frames → <code>RecursionError</code>; use a loop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading constraints</div>
        <ul>
          <li>Python ≈ 10⁷ simple steps per second</li>
          <li>n ≤ 20 → O(2ⁿ) ok · n ≤ 10⁴ → O(n²) ok · n ≤ 10⁵–10⁶ → O(n log n) / O(n)</li>
          <li><b>3 steps</b> — count loops → check the body → state time AND space</li>
          <li>Always say both: "O(n) time, O(n) space because of the set"</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-cx-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Two Correct Programs</span><span class="rm-sub">0.02 s vs 29 s, measured</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-steps"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Counting Steps</span><span class="rm-sub">n(n−1)/2 vs n; 8 vs 4</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-bigo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Big-O: The Growth Label</span><span class="rm-sub">Traced on 3 snippets</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-classes"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Common Classes</span><span class="rm-sub">Measured for n = 10 … 10⁶</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-space"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Space Complexity</span><span class="rm-sub">Extra memory, the trade</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-amort"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Amortised Cost</span><span class="rm-sub">append traced with getsizeof</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-list"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Inside a Python List</span><span class="rm-sub">One block of slots</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-dict"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Inside dict and set</span><span class="rm-sub">Hash → slot; the costs table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-recur"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Recursion &amp; the Call Stack</span><span class="rm-sub">Traced; the 1000 limit</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-constraints"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Reading Constraints</span><span class="rm-sub">n ≤ 10⁵ ⇒ O(n log n); analyse like an interviewer</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-cx-need"><span class="num">01</span>Two Correct Programs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>From the Python notes you can write a program that gives the right answer. Nothing so far tells you whether it will still finish when the data grows from 8 rows to 1 lakh rows, or whether two correct programs can differ in speed at all.</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful, the small food-delivery company from the SQL and pandas notes, logs every charge its payment gateway makes. On one quiet day there were 8 charges, in rupees, in the order they happened:</p>
  <table class="tbl"><caption>The running example (same numbers in Arrays, Hashing and Linked Lists)</caption>
    <tr><th>position</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
    <tr><td>charge (₹)</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
  </table>
  <p>Finance has a worry: the gateway sometimes sends the same charge twice. The question for the code is simple: <strong>does any value appear more than once?</strong> In our 8 charges, 80 appears at positions 1 and 5. On a busy day Biteful has 1 lakh (100,000) charges, each with an id, and the same check must run on all of them.</p>
  <p>Here are two correct programs. Both walk the charges once and remember what they have seen. The only difference is the container they remember in: a list or a set.</p>
<div class="fx" data-lang="py">import time, random

def has_repeat_v1(charges):          # solution 1: remember what we saw in a LIST
    seen = []
    for c in charges:
        if c in seen:                 # looks through the list, item by item
            return True
        seen.append(c)
    return False

def has_repeat_v2(charges):          # solution 2: remember what we saw in a SET
    seen = set()
    for c in charges:
        if c in seen:                 # jumps straight to one slot
            return True
        seen.add(c)
    return False

today = [120, 80, 250, 40, 310, 80, 60, 200]
print("today's 8 charges:", has_repeat_v1(today), has_repeat_v2(today))

random.seed(7)
for n in [1_000, 10_000, 100_000]:
    ids = random.sample(range(10**9), n)        # n different charge ids: no repeat, the worst case
    t = time.perf_counter(); r1 = has_repeat_v1(ids); t1 = time.perf_counter() - t
    t = time.perf_counter(); r2 = has_repeat_v2(ids); t2 = time.perf_counter() - t
    print(f"n={n:&gt;7,}   list version {t1:8.3f} s   set version {t2:7.4f} s   same answer: {r1 == r2}")</div>
  <div class="fx" data-lang="text">today's 8 charges: True True
n=  1,000   list version    0.004 s   set version  0.0001 s   same answer: True
n= 10,000   list version    0.238 s   set version  0.0011 s   same answer: True
n=100,000   list version   28.673 s   set version  0.0158 s   same answer: True</div>
  <p>Same answers every time. On 1,000 charges nobody would notice the difference. On 1 lakh charges the list version took about half a minute and the set version about a fiftieth of a second: <strong>roughly two thousand times slower</strong>, for a one-word change. And notice the pattern in the list column: 10× more charges made it about 60–120× slower, not 10×. That is the thing this whole note learns to predict.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A watchman checking entry passes. Version 1 keeps every pass he has seen in a pile and, for each new person, flips through the whole pile. Version 2 keeps a cabinet with one drawer per pass number and just opens the right drawer. With 8 visitors both are fine. With a stadium crowd, the pile-flipper is still at the gate after the match ends.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>algorithm's efficiency</strong> is how its cost (time, memory) grows as the input size <strong>n</strong> grows. Two correct algorithms can have wildly different efficiency, and the gap gets bigger as n grows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"It ran fast on my test, so it is fast." A test with 8 or 1,000 items hides the problem completely: both versions finished in a few milliseconds. Online judges and real data use the biggest n allowed. Always ask what happens at the largest input.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Counting Steps.</b> We only found the gap by running both programs for 30 seconds. We need a way to see it in the code itself, before running anything.</div>

  <h2 id="dsa-cx-steps"><span class="num">02</span>Counting Steps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 measured seconds, but seconds depend on the laptop, the Python version and what else is running. What can we count instead that is the same everywhere and still explains the 2,000× gap?</p>
  </div>
  <p>Programmers count <strong>steps</strong>: small actions such as one comparison, one addition or one lookup, written as a function of the input size <strong>n</strong>. The secret of version 1 is inside <code>c in seen</code>: for a list, Python compares <code>c</code> with each item in turn. So we make that hidden loop visible and count.</p>
  <h3>By hand on the 8 charges</h3>
  <table class="tbl out"><caption>Version 1 (list) vs version 2 (set) on 120, 80, 250, 40, 310, 80, 60, 200</caption>
    <tr><th>position</th><th>charge</th><th>seen list before</th><th>list comparisons</th><th>set lookups</th></tr>
    <tr><td>0</td><td>120</td><td>[ ]</td><td>0</td><td>1</td></tr>
    <tr><td>1</td><td>80</td><td>[120]</td><td>1</td><td>1</td></tr>
    <tr><td>2</td><td>250</td><td>[120, 80]</td><td>2</td><td>1</td></tr>
    <tr><td>3</td><td>40</td><td>[120, 80, 250]</td><td>3</td><td>1</td></tr>
    <tr><td>4</td><td>310</td><td>[120, 80, 250, 40]</td><td>4</td><td>1</td></tr>
    <tr><td>5</td><td>80</td><td>[120, 80, 250, 40, 310]</td><td>2 (found at the 2nd item) → stop</td><td>1 → stop</td></tr>
    <tr><td colspan="3"><b>total</b></td><td><b>12</b></td><td><b>6</b></td></tr>
  </table>
  <p>The list version's work grows with the size of the pile: 0, 1, 2, 3, 4… When there is <em>no</em> repeat (the worst case), the k-th charge compares against k earlier ones, so the total is 0 + 1 + 2 + … + (n − 1) = <strong>n(n − 1)/2</strong>. The set version does one lookup per charge: <strong>n</strong>. The code below counts both and checks the formula.</p>
<div class="fx" data-lang="py">def steps_list(charges):              # count what \`c in seen\` does inside: one comparison per item looked at
    seen, steps = [], 0
    for c in charges:
        for s in seen:
            steps += 1
            if s == c:
                return True, steps
        seen.append(c)
    return False, steps

def steps_set(charges):               # one hash lookup per charge
    seen, steps = set(), 0
    for c in charges:
        steps += 1
        if c in seen:
            return True, steps
        seen.add(c)
    return False, steps

today = [120, 80, 250, 40, 310, 80, 60, 200]
print("today:  list", steps_list(today), "  set", steps_set(today))
for n in [8, 100, 1_000, 3_000]:
    ids = list(range(n))              # all different: the worst case
    print(f"n={n:&gt;6,}  list steps={steps_list(ids)[1]:&gt;10,}  n(n-1)/2={n*(n-1)//2:&gt;10,}  set steps={steps_set(ids)[1]:&gt;6,}")
n = 100_000
print(f"n={n:,}: list would need n(n-1)/2 = {n*(n-1)//2:,} steps, set needs {n:,}")</div>
  <div class="fx" data-lang="text">today:  list (True, 12)   set (True, 6)
n=     8  list steps=        28  n(n-1)/2=        28  set steps=     8
n=   100  list steps=     4,950  n(n-1)/2=     4,950  set steps=   100
n= 1,000  list steps=   499,500  n(n-1)/2=   499,500  set steps= 1,000
n= 3,000  list steps= 4,498,500  n(n-1)/2= 4,498,500  set steps= 3,000
n=100,000: list would need n(n-1)/2 = 4,999,950,000 steps, set needs 100,000</div>
  <p>The counts match the formula exactly. For 1 lakh charges the list version needs about 5 billion comparisons, the set version 1 lakh lookups: 50,000 times fewer steps. The measured gap was "only" about 2,000× because one set lookup (hashing) is more work than one list comparison. Steps are not all the same size, but the <em>growth</em> is what decides the winner at large n.</p>
  <h3>A second example: searching the sorted charges</h3>
  <p>Finance wants to find the ₹310 charge. If the charges are sorted, we have two ways. Read them one by one from the left (linear search), or open the middle, throw away the half that cannot contain 310, and repeat (binary search).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding "Ravi Sharma" in a paper phone book of 10 lakh names. Way 1: read from page 1, name by name. Way 2: open the middle page; "Sharma" is after "Mehta", so throw away the first half; open the middle of what is left; repeat. Every look throws away half, so about 20 looks are enough.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
<text x="10" y="18" class="tm">Linear: check every charge from the left (8 looks)</text>
<rect x="10" y="26" width="58" height="26" class="fr sr"/><rect x="72" y="26" width="58" height="26" class="fr sr"/><rect x="134" y="26" width="58" height="26" class="fr sr"/><rect x="196" y="26" width="58" height="26" class="fr sr"/><rect x="258" y="26" width="58" height="26" class="fr sr"/><rect x="320" y="26" width="58" height="26" class="fr sr"/><rect x="382" y="26" width="58" height="26" class="fr sr"/><rect x="444" y="26" width="58" height="26" class="fg sg"/>
<text x="39" y="44" text-anchor="middle" font-size="11">40</text><text x="101" y="44" text-anchor="middle" font-size="11">60</text><text x="163" y="44" text-anchor="middle" font-size="11">80</text><text x="225" y="44" text-anchor="middle" font-size="11">80</text><text x="287" y="44" text-anchor="middle" font-size="11">120</text><text x="349" y="44" text-anchor="middle" font-size="11">200</text><text x="411" y="44" text-anchor="middle" font-size="11">250</text><text x="473" y="44" text-anchor="middle" font-size="11">310</text>
<text x="10" y="72" class="tr" font-size="11">8 charges → 8 looks</text>
<text x="10" y="100" class="tm">Binary: look at the middle, keep the half that can hold 310 (4 looks)</text>
<rect x="10" y="108" width="58" height="26" class="fs" stroke="currentColor"/><rect x="72" y="108" width="58" height="26" class="fs" stroke="currentColor"/><rect x="134" y="108" width="58" height="26" class="fs" stroke="currentColor"/><rect x="196" y="108" width="58" height="26" class="fb sb"/><rect x="258" y="108" width="58" height="26" class="fs" stroke="currentColor"/><rect x="320" y="108" width="58" height="26" class="fb sb"/><rect x="382" y="108" width="58" height="26" class="fb sb"/><rect x="444" y="108" width="58" height="26" class="fg sg"/>
<text x="225" y="126" text-anchor="middle" font-size="11">80</text><text x="349" y="126" text-anchor="middle" font-size="11">200</text><text x="411" y="126" text-anchor="middle" font-size="11">250</text><text x="473" y="126" text-anchor="middle" font-size="11">310</text>
<text x="225" y="150" text-anchor="middle" font-size="10" class="tb">1st</text><text x="349" y="150" text-anchor="middle" font-size="10" class="tb">2nd</text><text x="411" y="150" text-anchor="middle" font-size="10" class="tb">3rd</text><text x="473" y="150" text-anchor="middle" font-size="10" class="tg">4th: found</text>
<text x="10" y="178" class="tg" font-size="11">8 → 4 → 2 → 1 candidates: each look halves what is left</text>
</svg><figcaption>Top: every box is checked. Bottom: only the blue middle boxes are checked; each look throws away half of the remaining charges.</figcaption></figure>
<div class="fx" data-lang="py">def linear_search(a, target):
    steps = 0
    for i, x in enumerate(a):
        steps += 1
        if x == target:
            return i, steps
    return -1, steps

def binary_search(a, target):         # a must be sorted
    lo, hi, steps = 0, len(a) - 1, 0
    while lo &lt;= hi:
        steps += 1
        mid = (lo + hi) // 2
        print(f"   step {steps}: lo={lo} hi={hi} mid={mid} a[mid]={a[mid]}")
        if a[mid] == target:
            return mid, steps
        if a[mid] &lt; target:
            lo = mid + 1              # target is in the right half
        else:
            hi = mid - 1              # target is in the left half
    return -1, steps

charges = sorted([120, 80, 250, 40, 310, 80, 60, 200])
print("sorted:", charges)
print("linear:", linear_search(charges, 310))
print("binary:")
print("  -&gt;", binary_search(charges, 310))</div>
  <div class="fx" data-lang="text">sorted: [40, 60, 80, 80, 120, 200, 250, 310]
linear: (7, 8)
binary:
   step 1: lo=0 hi=7 mid=3 a[mid]=80
   step 2: lo=4 hi=7 mid=5 a[mid]=200
   step 3: lo=6 hi=7 mid=6 a[mid]=250
   step 4: lo=7 hi=7 mid=7 a[mid]=310
  -&gt; (7, 4)</div>
  <p>The trace shows the halving: positions 0–7, then 4–7, then 6–7, then 7. Now the same two searches on bigger sorted lists, always looking for the last item (the worst case for the scan):</p>
<div class="fx" data-lang="py">import io, contextlib
for n in [8, 1_000, 1_000_000]:
    book = list(range(n))             # a sorted list of n charge ids
    target = n - 1                    # worst case for the linear scan: the last one
    with contextlib.redirect_stdout(io.StringIO()):     # hide the step-by-step print
        b = binary_search(book, target)[1]
    print(f"n={n:&gt;9,}   linear: {linear_search(book, target)[1]:&gt;9,} steps   binary: {b:&gt;2} steps")</div>
  <div class="fx" data-lang="text">n=        8   linear:         8 steps   binary:  4 steps
n=    1,000   linear:     1,000 steps   binary: 10 steps
n=1,000,000   linear: 1,000,000 steps   binary: 20 steps</div>
  <p>Make the list 1,000 times bigger and the scan needs 1,000 times more steps; binary search needs only 10 more. Each look halves the list, so after k looks n/2ᵏ items remain, and it ends when that reaches 1: k = log₂ n. 10 lakh → about 20.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Time complexity</strong> is the number of steps an algorithm does, written as a function of the input size n. We usually count the <strong>worst case</strong>: the input that makes it do the most steps (no repeat at all; the target at the very end), because a program that is fine on average but dies on one bad input is still a bad program.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Counting only the lines you can see. <code>c in seen</code> is one line but a whole loop when <code>seen</code> is a list. Every built-in has a cost (sections 07 and 08 list them); count it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Big-O.</b> Exact counts work but get messy fast: a real function is "n(n − 1)/2 + n + 2" steps. We want one short label that says how the work grows and ignores details that don't matter.</div>

  <h2 id="dsa-cx-bigo"><span class="num">03</span>Big-O: The Growth Label</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can count steps exactly, but "n(n − 1)/2 + n + 2" is hard to compare with "3n + 7", and the exact constants change if we count a little differently. What part of a step count actually decides who wins at large n?</p>
  </div>
  <p>Ask one question about any step count: <strong>if I double n, how much more work is it?</strong> For 3n + 7 the answer is "about double". For n²/2 + n it is "about four times". So keep only the part that controls that answer, the <strong>dominant term</strong>, and throw away the constants. That short label is <strong>Big-O</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shop bill: 1 kg rice ₹60, 10 kg ₹600, 100 kg ₹6000, plus a ₹10 carry bag each time. For a big order the bag does not matter; the rice decides the bill. Big-O keeps "the rice" (the term that grows fastest) and drops "the bag" (constants and smaller terms).</p>
  </div>
  <h3>Traced on 3 snippets</h3>
  <p>Three small functions on Biteful's charges, each with a counter: A adds up the day's total, B checks every pair for a ₹280 combo (two orders that together cost exactly ₹280), C runs A, then B, then one more step. We run them on the 8 charges, then on 16, 32 and 64 (the day repeated) and watch what doubling n does.</p>
<div class="fx" data-lang="py">def total(charges):                   # snippet A: one pass
    ops = 1                           # s = 0
    s = 0
    for c in charges:
        s += c
        ops += 1                      # one addition per charge
    return s, ops

def pairs_to(charges, target):        # snippet B: every pair once
    ops, found = 0, []
    for i in range(len(charges)):
        for j in range(i + 1, len(charges)):
            ops += 1                  # one comparison per pair
            if charges[i] + charges[j] == target:
                found.append((charges[i], charges[j]))
    return found, ops

def report(charges):                  # snippet C: A, then B, then 1 more step
    s, a = total(charges)
    f, b = pairs_to(charges, 280)
    return a + b + 1

today = [120, 80, 250, 40, 310, 80, 60, 200]
print("A:", total(today), " B:", pairs_to(today, 280), " C:", report(today))
print(f"{'n':&gt;4} {'A ops':&gt;6} {'B ops':&gt;7} {'C ops':&gt;7}")
prev = None
for k in [1, 2, 4, 8]:
    data = today * k                  # 8, 16, 32, 64 charges
    row = (total(data)[1], pairs_to(data, 280)[1], report(data))
    ratio = "" if prev is None else "   x" + "  x".join(f"{r / p:.2f}" for r, p in zip(row, prev))
    print(f"{len(data):&gt;4} {row[0]:&gt;6} {row[1]:&gt;7} {row[2]:&gt;7}{ratio}")
    prev = row</div>
  <div class="fx" data-lang="text">A: (1140, 9)  B: ([(80, 200), (80, 200)], 28)  C: 38
   n  A ops   B ops   C ops
   8      9      28      38
  16     17     120     138   x1.89  x4.29  x3.63
  32     33     496     530   x1.94  x4.13  x3.84
  64     65    2016    2082   x1.97  x4.06  x3.93</div>
  <table class="tbl"><caption>From the exact count to the label</caption>
    <tr><th>Snippet</th><th>Exact steps</th><th>n = 8</th><th>Doubling n multiplies it by</th><th>Dominant term</th><th>Big-O</th></tr>
    <tr><td>A: total</td><td>n + 1</td><td>9</td><td>→ 2</td><td>n</td><td>O(n)</td></tr>
    <tr><td>B: all pairs</td><td>n(n − 1)/2 = ½n² − ½n</td><td>28</td><td>→ 4</td><td>½n² → drop ½</td><td>O(n²)</td></tr>
    <tr><td>C: A + B + 1</td><td>½n² + ½n + 2</td><td>38</td><td>→ 4</td><td>½n²</td><td>O(n²)</td></tr>
  </table>
  <p>Read the ratios: A goes ×1.89, ×1.94, ×1.97 (heading to ×2), B and C head to ×4. C contains a whole O(n) pass, yet it behaves like B, because at large n the pairs swamp everything else. That is the rule "keep the dominant term". (B also found the combo twice, 80 + 200 at positions 1 and 5: the same 80 again.)</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Plain meaning</th><th>Example</th></tr>
    <tr><td><strong>Drop constants</strong></td><td>Doing the loop twice is still "one loop's worth of growth"</td><td>3n → O(n); n/2 → O(n)</td></tr>
    <tr><td><strong>Drop smaller terms</strong></td><td>When n is big, only the biggest term is felt</td><td>n² + 5n + 20 → O(n²)</td></tr>
    <tr><td><strong>Nested loops multiply</strong></td><td>Inner loop runs fully for every outer step</td><td>loop in a loop → O(n²)</td></tr>
    <tr><td><strong>Loops in sequence add</strong></td><td>One after the other</td><td>n + n = 2n → O(n)</td></tr>
    <tr><td><strong>Separate inputs, separate letters</strong></td><td>Two lists of different sizes</td><td>O(n + m), O(n·m)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"One loop, so it is O(n)" is the most common wrong answer. Look at what is <em>inside</em> the loop. <code>x in some_list</code>, <code>list.sort()</code>, <code>list.insert(0, x)</code> or a slice each cost up to n steps on their own. A loop that does an O(n) thing n times is O(n²). Section 01 was exactly this:</p>
  </div>
<div class="fx" data-lang="py">def first_repeat_slow(nums):
    seen = []
    for x in nums:               # n times ...
        if x in seen:            # ... an O(n) scan of a list  -&gt; O(n^2) total
            return x
        seen.append(x)

def first_repeat_fast(nums):
    seen = set()
    for x in nums:               # n times ...
        if x in seen:            # ... an O(1) jump into a set -&gt; O(n) total
            return x
        seen.add(x)

today = [120, 80, 250, 40, 310, 80, 60, 200]
print(first_repeat_slow(today), first_repeat_fast(today))</div>
  <div class="fx" data-lang="text">80 80</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Big-O notation</strong>, written O(f(n)), says "for large n the step count grows no faster than a constant times f(n)". O(n) is read "order n" or "linear", O(n²) "quadratic". It describes growth, not speed: an O(n) program can be slower than an O(n²) one at n = 8, and will always lose to nothing at n = 1 lakh.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Common Classes.</b> We can now label code O(n) or O(n²), but what do the labels mean in practice? How big a gap is O(n log n) vs O(n²) in seconds, at n = 10 and at n = 10 lakh?</div>

  <h2 id="dsa-cx-classes"><span class="num">04</span>The Common Classes: O(1) to O(2ⁿ)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Big-O gives a label, but a beginner cannot yet feel the difference between O(n log n) and O(n²), or know which labels are "fine" and which are hopeless. We need the common labels side by side, with real timings.</p>
  </div>
  <p>Six labels cover almost every piece of code you will write in an interview. Learn them as a ladder from fastest to slowest, each with one picture in your head.</p>
  <div class="cards">
    <div><b>O(1) constant</b><p>Same steps whatever n. Jump straight to one box.</p><small>a[5], d["key"], len(a), a.append(x)</small></div>
    <div><b>O(log n) logarithmic</b><p>Each step throws away half. 10 lakh items → 20 steps.</p><small>binary search, heap push/pop</small></div>
    <div><b>O(n) linear</b><p>Touch every item once. Double n, double the work.</p><small>sum, max, x in list, one loop</small></div>
    <div><b>O(n log n)</b><p>n items, each handled log n times. The cost of good sorting.</p><small>sorted(), merge sort, heap sort</small></div>
    <div><b>O(n²) quadratic</b><p>Every item against every item. Double n, four times the work.</p><small>nested loops, all pairs</small></div>
    <div><b>O(2ⁿ) exponential</b><p>Every item is picked or skipped. Add one item, double the work.</p><small>all subsets, naive Fibonacci</small></div>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 290" width="560">
<line x1="50" y1="260" x2="540" y2="260" stroke="currentColor"/>
<line x1="50" y1="260" x2="50" y2="15" stroke="currentColor"/>
<text x="300" y="282" text-anchor="middle" class="tm">input size n →</text>
<text x="18" y="140" text-anchor="middle" class="tm" transform="rotate(-90 18 140)">steps →</text>
<polyline points="74,254 530,254" fill="none" class="sg" stroke-width="2"/>
<polyline points="74,260 110,252 146,248 182,245 218,243 254,241 290,240 326,239 362,238 398,237 434,236 470,235 506,235 530,234" fill="none" class="st" stroke-width="2"/>
<polyline points="74,254 530,140" fill="none" class="sb" stroke-width="2"/>
<polyline points="74,260 86,255 98,248 110,240 122,231 134,222 146,212 158,201 170,190 182,179 194,167 206,155 218,142 230,129 242,116 254,103 266,89 278,75 290,61 302,46 314,32 323,20" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 3"/>
<polyline points="74,254 86,246 98,236 110,222 122,206 134,186 146,164 158,138 170,110 182,78 194,44 202,20" fill="none" class="sr" stroke-width="2"/>
<polyline points="74,248 86,243 98,236 110,226 122,212 134,192 146,164 158,124 170,68 177,20" fill="none" class="sr" stroke-width="2" stroke-dasharray="2 3"/>
<text x="536" y="258" class="tg" font-size="11">O(1)</text>
<text x="536" y="238" font-size="11" style="fill:var(--teal)">O(log n)</text>
<text x="536" y="143" class="tb" font-size="11">O(n)</text>
<text x="330" y="22" font-size="11">O(n log n)</text>
<text x="208" y="22" class="tr" font-size="11">O(n²)</text>
<text x="118" y="22" class="tr" font-size="11">O(2ⁿ)</text>
</svg><figcaption>Same n on the x-axis for every curve. The flat ones barely notice a bigger input; the red ones shoot off the chart.</figcaption></figure>
  <p>First the raw step counts each label means, for n from 10 to 10 lakh:</p>
<div class="fx" data-lang="py">import math
print(f"{'n':&gt;9} {'log n':&gt;6} {'n log n':&gt;11} {'n^2':&gt;15} {'2^n':&gt;9}")
for n in [10, 100, 1_000, 10_000, 100_000, 1_000_000]:
    two = f"{2.0**n:.1e}" if n &lt;= 1000 else "huge"
    print(f"{n:&gt;9,} {math.ceil(math.log2(n)):&gt;6} {round(n * math.log2(n)):&gt;11,} {n * n:&gt;15,} {two:&gt;9}")</div>
  <div class="fx" data-lang="text">        n  log n     n log n             n^2       2^n
       10      4          33             100   1.0e+03
      100      7         664          10,000   1.3e+30
    1,000     10       9,966       1,000,000  1.1e+301
   10,000     14     132,877     100,000,000      huge
  100,000     17   1,660,964  10,000,000,000      huge
1,000,000     20  19,931,569 1,000,000,000,000      huge</div>
  <p>Now real stopwatch times on this machine, one function per label, for n = 10 to 10⁶. Each cell is the time for <em>one</em> call (small ones are repeated and averaged). O(n²) is skipped above 10⁴ because it would take minutes.</p>
<div class="fx" data-lang="py">import timeit, bisect, random

def per_call(f, a):                   # repeat f(a) until it adds up to 0.2 s; seconds per call
    number, total = timeit.Timer(lambda: f(a)).autorange()
    return total / number

def o1(a):      return a[len(a) // 2]                  # jump to one box
def ologn(a):   return bisect.bisect_left(a, -1)       # binary search (a is sorted)
def on(a):      return sum(a)                          # touch every item once
def onlogn(a):  return sorted(a)                       # good sort
def on2(a):                                            # every pair
    c = 0
    for x in a:
        for y in a:
            c += 1
    return c

def fmt(s):                                            # seconds -&gt; readable
    return f"{s*1e6:8.2f} us" if s &lt; 1e-3 else (f"{s*1e3:8.2f} ms" if s &lt; 1 else f"{s:8.2f} s ")

random.seed(0)
print(f"{'n':&gt;9} {'O(1)':&gt;11} {'O(log n)':&gt;11} {'O(n)':&gt;11} {'O(n log n)':&gt;11} {'O(n^2)':&gt;11}")
for n in [10, 100, 1_000, 10_000, 100_000, 1_000_000]:
    a = random.sample(range(10 * n), n)
    s = sorted(a)
    cells = [per_call(o1, a), per_call(ologn, s), per_call(on, a), per_call(onlogn, a)]
    cells = [fmt(c) for c in cells]
    cells.append(fmt(per_call(on2, a)) if n &lt;= 10_000 else "    skipped")
    print(f"{n:&gt;9,} " + " ".join(f"{c:&gt;11}" for c in cells))</div>
  <div class="fx" data-lang="text">        n        O(1)    O(log n)        O(n)  O(n log n)      O(n^2)
       10     0.07 us     0.11 us     0.12 us     0.19 us     1.65 us
      100     0.11 us     0.11 us     0.53 us     1.73 us   206.13 us
    1,000     0.09 us     0.13 us     4.75 us    34.16 us    20.14 ms
   10,000     0.09 us     0.17 us    39.43 us     1.45 ms     2.06 s 
  100,000     0.08 us     0.17 us     1.07 ms    23.60 ms     skipped
1,000,000     0.11 us     0.27 us     4.93 ms   271.18 ms     skipped</div>
  <p>Read it column by column. O(1) does not move (a tenth of a microsecond at every n). O(log n) creeps up a little. O(n) grows about 10× per row. O(n log n) grows a bit more than 10× per row and is still under a third of a second at 10 lakh. O(n²) grows about 100× per row: 20 ms at n = 1,000, 2 s at 10,000, so about 3–4 minutes at 1 lakh. At small n (the first two rows) every label is instant; that is why tiny tests hide slow code. O(2ⁿ) is in a class of its own:</p>
<div class="fx" data-lang="py">import time
def all_subsets(items):                 # O(2^n): every pick / skip choice
    out = [[]]
    for x in items:
        out += [s + [x] for s in out]
    return out
for n in [10, 15, 20, 22]:
    t = time.perf_counter()
    k = len(all_subsets(list(range(n))))
    print(f"n={n:&gt;2}  subsets={k:&gt;9,}  time={(time.perf_counter()-t)*1000:8.1f} ms")</div>
  <div class="fx" data-lang="text">n=10  subsets=    1,024  time=     0.1 ms
n=15  subsets=   32,768  time=     7.8 ms
n=20  subsets=1,048,576  time=   530.1 ms
n=22  subsets=4,194,304  time=  3147.6 ms</div>
  <p>Each +5 items multiplies the time by about 70, and n = 22 already takes seconds. At n = 40 it would take years.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>O(log n) means "halving", so it needs a way to halve: a sorted list (binary search) or a heap. Binary search on an unsorted list is simply wrong. And sorting first costs O(n log n), so for a single search a plain O(n) scan is cheaper; sort only when you will search many times.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Complexity classes</strong> are the standard growth labels, in order: O(1) &lt; O(log n) &lt; O(n) &lt; O(n log n) &lt; O(n²) &lt; O(2ⁿ). Moving one class down at large n usually matters more than any amount of tuning inside a class.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Space Complexity.</b> All of this measured time. But the fast duplicate check built a set of 1 lakh ids. Does that memory count, and how do we label it?</div>

  <h2 id="dsa-cx-space"><span class="num">05</span>Space Complexity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The set version of section 01 won on time, but it stored every charge it saw. Did it pay for its speed with memory, and how much? We have no way yet to describe memory use as n grows.</p>
  </div>
  <p>A program also spends memory. <strong>Space complexity</strong> is how much <em>extra</em> memory the code needs as n grows. The input itself is not counted; it was already there. A few loop variables are O(1). A new list or set with one slot per input item is O(n).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Checking a 50-page exam answer sheet. Ticking marks on the same sheet with one pen needs no extra paper (O(1)). Copying every answer to a fresh notebook first needs 50 more pages (O(n)).</p>
  </div>
  <p>Smallest example first: reversing the 8 charges. One version swaps from both ends inside the same list (two index variables, O(1) extra); the other builds a new list (8 new slots, O(n) extra).</p>
<div class="fx" data-lang="py">def reverse_in_place(nums):           # O(1) extra space: two index variables
    i, j = 0, len(nums) - 1
    while i &lt; j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1
    return nums

def reverse_copy(nums):               # O(n) extra space: a brand-new list
    return nums[::-1]

today = [120, 80, 250, 40, 310, 80, 60, 200]
print(reverse_copy(today))
print(reverse_in_place(today))</div>
  <div class="fx" data-lang="text">[200, 60, 80, 310, 40, 250, 80, 120]
[200, 60, 80, 310, 40, 250, 80, 120]</div>
  <p>Now the real question: how much did the three ways of checking 1 lakh charges for repeats keep in memory? <code>tracemalloc</code> measures the bytes a piece of code allocates.</p>
<div class="fx" data-lang="py">import tracemalloc, random
random.seed(7)
ids = random.sample(range(10**9), 100_000)     # the input: not counted as extra space

def extra_bytes(build):
    tracemalloc.start()
    kept = build()                             # what the solution keeps while it runs
    used = tracemalloc.get_traced_memory()[0]
    tracemalloc.stop()
    return used

print(f"seen as a list : {extra_bytes(lambda: list(ids)) / 1e6:5.2f} MB")
print(f"seen as a set  : {extra_bytes(lambda: set(ids)) / 1e6:5.2f} MB")
def sort_then_scan():
    ids.sort()                                 # sorts the input in place, no new container kept
    return any(ids[i] == ids[i + 1] for i in range(len(ids) - 1))
print(f"sort + scan    : {extra_bytes(sort_then_scan) / 1e6:5.2f} MB kept afterwards")</div>
  <div class="fx" data-lang="text">seen as a list :  0.80 MB
seen as a set  :  4.19 MB
sort + scan    :  0.00 MB kept afterwards</div>
  <p>Both section 01 versions are O(n) space: the list kept 0.8 MB (8 bytes per id), the set about 5× more (a hash table keeps spare empty slots, section 08). A third way, sort the charges and compare neighbours, keeps nothing new but costs O(n log n) time and reorders the input. Three correct solutions, three different trades:</p>
  <table class="tbl"><caption>The duplicate check, three ways</caption>
    <tr><th>Version</th><th>Time</th><th>Extra space</th><th>1 lakh charges (measured)</th></tr>
    <tr><td>list of seen charges</td><td>O(n²)</td><td>O(n)</td><td>~29 s, 0.8 MB</td></tr>
    <tr><td>set of seen charges</td><td>O(n)</td><td>O(n)</td><td>~0.02 s, ~4 MB</td></tr>
    <tr><td>sort, then compare neighbours</td><td>O(n log n)</td><td>O(1) kept (input is reordered)</td><td>~0 MB kept</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Code shape</th><th>Extra space</th><th>Why</th></tr>
    <tr><td>Few variables, swap in place</td><td>O(1)</td><td>Nothing grows with n</td></tr>
    <tr><td>Build a set / dict / list of the input</td><td>O(n)</td><td>One slot per item</td></tr>
    <tr><td>Recursion n levels deep</td><td>O(n)</td><td>n paused calls on the stack (section 09)</td></tr>
    <tr><td>n × m grid or table</td><td>O(n·m)</td><td>One cell per pair</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Space and time trade with each other. The set spent O(n) memory to bring time from O(n²) to O(n). Interviewers like hearing you name that trade: "O(n) time, O(n) space; I can do O(1) extra space if I sort first, but then it is O(n log n) time and the input order is lost."</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Space complexity</strong> = extra memory as a function of n, in Big-O. "In place" means O(1) extra space: the algorithm works inside the input itself.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting hidden copies. <code>a[1:]</code>, <code>a + b</code>, <code>sorted(a)</code> and <code>a[::-1]</code> all build a new list: O(n) extra each time. A slice inside a recursive call costs O(n) per call.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Amortised Cost.</b> The seen-list and seen-set grew one item at a time. A list lives in one block of memory, so what happens when the block is full, and why do we still call <code>append</code> O(1)?</div>

  <h2 id="dsa-cx-amort"><span class="num">06</span>Amortised Cost: Why list.append Is O(1)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01's list version appended every charge to <code>seen</code>. A list keeps its items in one continuous block. When the block is full, Python must find a bigger one and copy everything: that single append costs O(n). So is append O(1) or O(n)?</p>
  </div>
  <p>Both, and the word that joins them is <strong>amortised</strong>: the average cost per operation over a long run of operations. Python does not grow the block by one slot; it grabs extra spare slots so the next several appends are free.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Shifting house. Moving day is a big, costly job. But you move to a bigger house, so for years every new item just goes on a shelf with zero effort. Spread the moving cost over all those easy years and each item cost almost nothing.</p>
  </div>
  <h3>Traced on Biteful's 8 appends</h3>
  <p><code>sys.getsizeof</code> reports the bytes the list block uses. Each slot is an 8-byte pointer, so (bytes − 56) / 8 gives the number of slots reserved. We append the day's charges one by one:</p>
<div class="fx" data-lang="py">import sys
orders = []
empty = sys.getsizeof(orders)
print(f"empty list: {empty} bytes")
print("append  len  bytes  slots  resized?")
for amount in [120, 80, 250, 40, 310, 80, 60, 200]:
    before = sys.getsizeof(orders)
    orders.append(amount)
    after = sys.getsizeof(orders)
    slots = (after - empty) // 8              # each slot holds one 8-byte pointer
    print(f"{amount:&gt;6} {len(orders):&gt;4} {after:&gt;6} {slots:&gt;6}  {'yes: new block, old items copied' if after != before else ''}")</div>
  <div class="fx" data-lang="text">empty list: 56 bytes
append  len  bytes  slots  resized?
   120    1     88      4  yes: new block, old items copied
    80    2     88      4  
   250    3     88      4  
    40    4     88      4  
   310    5    120      8  yes: new block, old items copied
    80    6    120      8  
    60    7    120      8  
   200    8    120      8  </div>
  <p>Only 2 of the 8 appends caused a resize. The first reserved 4 slots; appends 2–4 were free. The fifth found the block full, got 8 slots and copied the 4 old pointers; appends 6–8 were free again. Total copying: 4 pointers for 8 appends.</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
<text x="10" y="18" class="tm">capacity 1</text>
<rect x="110" y="6" width="22" height="18" class="fb sb"/>
<text x="10" y="48" class="tm">capacity 2</text>
<rect x="110" y="36" width="22" height="18" class="fb sb"/><rect x="134" y="36" width="22" height="18" class="fb sb"/>
<text x="10" y="78" class="tm">capacity 4</text>
<rect x="110" y="66" width="22" height="18" class="fb sb"/><rect x="134" y="66" width="22" height="18" class="fb sb"/><rect x="158" y="66" width="22" height="18" class="fb sb"/><rect x="182" y="66" width="22" height="18" class="fs" stroke="currentColor"/>
<text x="10" y="108" class="tm">capacity 8</text>
<rect x="110" y="96" width="22" height="18" class="fb sb"/><rect x="134" y="96" width="22" height="18" class="fb sb"/><rect x="158" y="96" width="22" height="18" class="fb sb"/><rect x="182" y="96" width="22" height="18" class="fb sb"/><rect x="206" y="96" width="22" height="18" class="fb sb"/><rect x="230" y="96" width="22" height="18" class="fs" stroke="currentColor"/><rect x="254" y="96" width="22" height="18" class="fs" stroke="currentColor"/><rect x="278" y="96" width="22" height="18" class="fs" stroke="currentColor"/>
<text x="320" y="20" class="tr" font-size="11">copy 1 item</text>
<text x="320" y="50" class="tr" font-size="11">copy 2 items</text>
<text x="320" y="80" class="tr" font-size="11">copy 4 items</text>
<text x="320" y="110" class="tg" font-size="11">3 free appends, no copying</text>
<text x="10" y="150" class="tm">total copies for n appends = 1 + 2 + 4 + … ≈ n  →  about 1 per append  →  O(1) amortized</text>
</svg><figcaption>The textbook "double when full" model. Blue = filled slots, grey = spare room. Each doubling copies everything once, then gives that many free appends.</figcaption></figure>
  <p>A simulation of "double when full" makes the arithmetic visible for any n. The copies are 1 + 2 + 4 + … , a sum that never reaches 2n, so each append pays for about one copy on average:</p>
<div class="fx" data-lang="py"># Simulate a growing array that doubles when full; count copies
def append_cost(n):
    cap, size, copies, worst = 1, 0, 0, 0
    for _ in range(n):
        if size == cap:          # full: get a block twice as big, copy everything
            copies += size
            worst = max(worst, size)
            cap *= 2
        size += 1                # write the new item
    return copies, worst
for n in [8, 1_000, 1_000_000]:
    c, w = append_cost(n)
    print(f"n={n:&gt;9,}  total copies={c:&gt;9,}  copies per append={c/n:.2f}  worst single append copied {w:,}")</div>
  <div class="fx" data-lang="text">n=        8  total copies=        7  copies per append=0.88  worst single append copied 4
n=    1,000  total copies=    1,023  copies per append=1.02  worst single append copied 512
n=1,000,000  total copies=1,048,575  copies per append=1.05  worst single append copied 524,288</div>
  <p>The worst single append copied 5 lakh items, yet the average stays near 1. Real CPython grows by about 12% plus a little rather than 2× (you saw 4 → 8 slots above, then 16, 24, 32, 40, 52…), but any growth by a constant factor gives the same O(1) average. How rare are real resizes?</p>
<div class="fx" data-lang="py">import sys
a, last, resizes = [], sys.getsizeof([]), 0
for i in range(1_000_000):
    a.append(i)
    if sys.getsizeof(a) != last:
        resizes += 1
        last = sys.getsizeof(a)
print("appends: 1,000,000   real resizes:", resizes)</div>
  <div class="fx" data-lang="text">appends: 1,000,000   real resizes: 86</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Amortised O(1)</strong> means: any one call may be slow, but n calls together cost O(n), so the average per call is O(1). Say it for <code>list.append</code>, <code>list.pop()</code>, and dict/set insert (their tables also resize, section 08).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Amortised is not the same as "average over random inputs". It is a guarantee over any sequence of operations. But it is not a per-call guarantee: if one slow call is unacceptable (a real-time system), amortised O(1) may not be good enough.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Inside a Python List.</b> We now know a list is one block that grows. That picture should also explain why <code>a[i]</code> is instant while <code>insert(0, x)</code> and <code>x in a</code> are slow. Let us look inside.</div>

  <h2 id="dsa-cx-list"><span class="num">07</span>Inside a Python List</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have been told "<code>c in seen</code> is O(n) for a list" and "append is O(1)". Why? Without a picture of the list in memory, the cost of each operation is something to memorise rather than understand.</p>
  </div>
  <p>A list is a <strong>dynamic array</strong>: one continuous block of equal-size slots. Each slot holds the address of a Python object (8 bytes on a 64-bit machine). Because the slots are equal and side by side, slot i lives at <code>start + 8 × i</code>. One multiplication, one jump. That is why <code>a[i]</code> is O(1) for any i.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="10" y="18" class="tm">charges = [120, 80, 250, 40]     start address = 1000, each slot 8 bytes</text>
<rect x="60" y="34" width="80" height="34" class="fb sb"/><rect x="140" y="34" width="80" height="34" class="fb sb"/><rect x="220" y="34" width="80" height="34" class="fb sb"/><rect x="300" y="34" width="80" height="34" class="fb sb"/><rect x="380" y="34" width="80" height="34" class="fs" stroke="currentColor"/><rect x="460" y="34" width="80" height="34" class="fs" stroke="currentColor"/>
<text x="100" y="56" text-anchor="middle">120</text><text x="180" y="56" text-anchor="middle">80</text><text x="260" y="56" text-anchor="middle">250</text><text x="340" y="56" text-anchor="middle">40</text><text x="420" y="56" text-anchor="middle" class="tm">spare</text><text x="500" y="56" text-anchor="middle" class="tm">spare</text>
<text x="100" y="84" text-anchor="middle" class="tm" font-size="11">1000</text><text x="180" y="84" text-anchor="middle" class="tm" font-size="11">1008</text><text x="260" y="84" text-anchor="middle" class="tm" font-size="11">1016</text><text x="340" y="84" text-anchor="middle" class="tm" font-size="11">1024</text>
<text x="100" y="100" text-anchor="middle" class="tb" font-size="11">a[0]</text><text x="180" y="100" text-anchor="middle" class="tb" font-size="11">a[1]</text><text x="260" y="100" text-anchor="middle" class="tb" font-size="11">a[2]</text><text x="340" y="100" text-anchor="middle" class="tb" font-size="11">a[3]</text>
<text x="10" y="135" class="tm">a[3] → 1000 + 8 × 3 = 1024, one jump. len stored separately = 4. Spare slots make append free until they run out.</text>
</svg><figcaption>Slots sit side by side, so any index is one arithmetic step away. The spare slots at the end are the "bigger house" from section 06.</figcaption></figure>
  <p>The same picture explains the slow operations. Adding at the <em>end</em> only fills a spare slot. Adding at the <em>front</em> means every existing item must shift one slot right: n moves. Searching with <code>in</code> checks slots one by one. Suppose Biteful pushes VIP orders to the front of its delivery queue:</p>
<div class="fx" data-lang="py">import time
from collections import deque
def t(f):
    s = time.perf_counter(); f(); return (time.perf_counter() - s) * 1000
n = 100_000
def front_list():
    q = []
    for i in range(n): q.insert(0, i)       # VIP order to the front: shift everything right
def back_list():
    q = []
    for i in range(n): q.append(i)
def front_deque():
    q = deque()
    for i in range(n): q.appendleft(i)
print(f"list.insert(0, x) x {n:,}: {t(front_list):8.1f} ms")
print(f"list.append(x)    x {n:,}: {t(back_list):8.1f} ms")
print(f"deque.appendleft  x {n:,}: {t(front_deque):8.1f} ms")</div>
  <div class="fx" data-lang="text">list.insert(0, x) x 100,000:   1087.1 ms
list.append(x)    x 100,000:      4.2 ms
deque.appendleft  x 100,000:      3.6 ms</div>
  <p><code>insert(0, x)</code> was a few hundred times slower than <code>append</code>, because each insert shifts the whole queue. <code>collections.deque</code> is built for both ends (it is a linked structure; the <a class="xref" data-note="dsa_linkedlist">Linked Lists</a> note builds one from scratch), so <code>appendleft</code> is as fast as <code>append</code>.</p>
  <table class="tbl">
    <tr><th>list operation</th><th>Cost</th><th>Reason</th></tr>
    <tr><td><code>a[i]</code>, <code>a[i] = x</code></td><td>O(1)</td><td>start + 8·i, one jump</td></tr>
    <tr><td><code>len(a)</code></td><td>O(1)</td><td>Length is stored, not counted</td></tr>
    <tr><td><code>a.append(x)</code>, <code>a.pop()</code></td><td>O(1) amortized</td><td>Fill / free the last slot; rare resize</td></tr>
    <tr><td><code>a.insert(0, x)</code>, <code>a.pop(0)</code></td><td>O(n)</td><td>Every item shifts one slot</td></tr>
    <tr><td><code>a.insert(i, x)</code>, <code>del a[i]</code></td><td>O(n − i)</td><td>Everything after i shifts</td></tr>
    <tr><td><code>x in a</code>, <code>a.index(x)</code>, <code>a.remove(x)</code></td><td>O(n)</td><td>Check slots one by one</td></tr>
    <tr><td><code>a[i:j]</code></td><td>O(j − i)</td><td>Copies that many slots into a new list</td></tr>
    <tr><td><code>a.sort()</code>, <code>sorted(a)</code></td><td>O(n log n)</td><td>Timsort</td></tr>
    <tr><td><code>min(a)</code>, <code>max(a)</code>, <code>sum(a)</code></td><td>O(n)</td><td>Must look at every item</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>dynamic array</strong> is a contiguous block of equal-size slots plus spare capacity that is re-allocated (bigger, by a constant factor) when it runs out. Python's <code>list</code> is one.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>queue.pop(0)</code> to serve the oldest order looks innocent and is O(n). Inside a loop over n orders it makes the loop O(n²). Use <code>deque.popleft()</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Inside dict and set.</b> A list must scan to answer "is 80 here?". Yet the set in section 01 answered the same question in one step. How can a container find a value without looking through it?</div>

  <h2 id="dsa-cx-dict"><span class="num">08</span>Inside dict and set</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The list picture explains why <code>x in list</code> is O(n). The set version of section 01 did the same check about 2,000 times faster. What is a set in memory, and what is the full cost table of the containers we use every day?</p>
  </div>
  <p>A list finds an item by position. But most real questions are "is this charge id present?" or "how many orders did customer 1032 place?", and you do not know the position. A <strong>dict</strong> (and a <strong>set</strong>, which is a dict with keys only) answers in O(1) by turning the key itself into a position.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school office with 26 pigeon-holes, one per starting letter. A letter for "Priya" goes straight into the P hole. To find it later, nobody searches all holes; they go to P. The rule "first letter → hole number" is the <strong>hash function</strong>. Two names starting with P share a hole; that is a <strong>collision</strong>, and the clerk checks the two or three letters inside.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
<defs><marker id="dsa-cx-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<rect x="10" y="30" width="90" height="30" class="fb sb"/><text x="55" y="50" text-anchor="middle">310</text>
<rect x="150" y="30" width="110" height="30" class="fv"/><text x="205" y="50" text-anchor="middle" font-size="11">hash(310) → 310</text>
<rect x="310" y="30" width="90" height="30" class="ft st"/><text x="355" y="50" text-anchor="middle" font-size="11">310 % 8 = 6</text>
<line x1="102" y1="45" x2="147" y2="45" stroke="currentColor" marker-end="url(#dsa-cx-ar)"/>
<line x1="262" y1="45" x2="307" y2="45" stroke="currentColor" marker-end="url(#dsa-cx-ar)"/>
<text x="10" y="100" class="tm">slots:</text>
<rect x="80" y="82" width="56" height="30" class="fb sb"/><rect x="136" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="192" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="248" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="304" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="360" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="416" y="82" width="56" height="30" class="fg sg"/><rect x="472" y="82" width="56" height="30" class="fs" stroke="currentColor"/>
<text x="108" y="126" text-anchor="middle" class="tm" font-size="11">0</text><text x="164" y="126" text-anchor="middle" class="tm" font-size="11">1</text><text x="220" y="126" text-anchor="middle" class="tm" font-size="11">2</text><text x="276" y="126" text-anchor="middle" class="tm" font-size="11">3</text><text x="332" y="126" text-anchor="middle" class="tm" font-size="11">4</text><text x="388" y="126" text-anchor="middle" class="tm" font-size="11">5</text><text x="444" y="126" text-anchor="middle" class="tm" font-size="11">6</text><text x="500" y="126" text-anchor="middle" class="tm" font-size="11">7</text>
<text x="108" y="102" text-anchor="middle" font-size="10">120</text><text x="444" y="102" text-anchor="middle" font-size="10">310</text>
<line x1="355" y1="62" x2="440" y2="80" stroke="currentColor" marker-end="url(#dsa-cx-ar)"/>
<text x="10" y="160" class="tm">lookup 310 in s: compute the same hash → slot 6 → compare the value there → found. No scanning.</text>
<text x="10" y="178" class="tm">collision: 80 also wants slot 0 (80 % 8 = 0), already taken by 120 → Python probes another slot.</text>
</svg><figcaption>The key is turned into a number, the number picks a slot, and the lookup goes straight to that slot.</figcaption></figure>
  <p>Three steps happen on every <code>d[key]</code> or <code>x in s</code>: (1) <code>hash(key)</code> turns the key into an integer, always the same for the same key; (2) <code>hash % number_of_slots</code> picks a slot; (3) Python compares the key stored there with yours. Step 3 is needed because of collisions: two different keys can pick the same slot. Then Python tries other slots in a fixed pattern (<strong>open addressing</strong>). To keep those chains short, the table is rebuilt bigger as soon as it is about two-thirds full. That resize is the amortised part, just like list append. Here is where our charges would land in an 8-slot table:</p>
<div class="fx" data-lang="py">print(hash(120), hash(80), hash(-1))     # small ints hash to themselves (except -1)
print(hash("biteful") == hash("biteful"))
slots = 8
for c in [120, 80, 250, 40, 310, 60, 200]:
    print(c, "-&gt; slot", hash(c) % slots)
try:
    d = {[1, 2]: "x"}
except TypeError as e:
    print("TypeError:", e)
print({(1, 2): "ok"})                    # tuples are hashable</div>
  <div class="fx" data-lang="text">120 80 -2
True
120 -&gt; slot 0
80 -&gt; slot 0
250 -&gt; slot 2
40 -&gt; slot 0
310 -&gt; slot 6
60 -&gt; slot 4
200 -&gt; slot 0
TypeError: unhashable type: 'list'
{(1, 2): 'ok'}</div>
  <p>Small integers hash to themselves, so 120, 80, 40 and 200 all want slot 0: four keys colliding in one table of 8. Python handles that by probing other slots (and would resize long before 7 keys sit in 8 slots); the <a class="xref" data-note="dsa_hashing">Hashing</a> note builds such a table by hand on exactly these charges. The <code>TypeError</code> shows the one rule for keys: they must be <strong>hashable</strong> (unchangeable). A list could change after it is stored, so its slot would be wrong; a tuple cannot change, so it works. The speed difference is not small:</p>
<div class="fx" data-lang="py">import time, random
random.seed(3)
n = 100_000
ids_list = list(range(n))
ids_set = set(ids_list)
queries = [random.randrange(2 * n) for _ in range(1_000)]

t = time.perf_counter()
hits = sum(q in ids_list for q in queries)       # each check scans the list
t_list = time.perf_counter() - t

t = time.perf_counter()
hits2 = sum(q in ids_set for q in queries)       # each check jumps to a slot
t_set = time.perf_counter() - t
print(f"1,000 lookups in list: {t_list*1000:7.1f} ms")
print(f"1,000 lookups in set : {t_set*1000:7.3f} ms   (same answer: {hits == hits2})")</div>
  <div class="fx" data-lang="text">1,000 lookups in list:   373.1 ms
1,000 lookups in set :   0.194 ms   (same answer: True)</div>
  <table class="tbl">
    <tr><th>dict / set operation</th><th>Cost</th><th>Reason</th></tr>
    <tr><td><code>d[k]</code>, <code>k in d</code>, <code>d[k] = v</code>, <code>del d[k]</code></td><td>O(1) average</td><td>hash → slot; worst O(n) only if everything collides</td></tr>
    <tr><td><code>s.add(x)</code>, <code>x in s</code>, <code>s.remove(x)</code></td><td>O(1) average</td><td>Same table, no values</td></tr>
    <tr><td><code>for k in d</code>, <code>d.items()</code></td><td>O(n)</td><td>Visit every entry</td></tr>
    <tr><td><code>s1 &amp; s2</code>, <code>s1 | s2</code></td><td>O(len(s1) + len(s2))</td><td>Walk one, look up in the other</td></tr>
    <tr><td><code>dict(zip(keys, vals))</code>, <code>set(lst)</code></td><td>O(n)</td><td>n inserts of O(1)</td></tr>
  </table>
  <h3>The cost of every operation you use</h3>
  <p>The reference table to keep in your head. Everything in it follows from two pictures: a list is a block of slots, a dict/set is a hash table.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>One-line reason</th></tr>
    <tr><td><code>a[i]</code>, <code>len(a)</code>, <code>a.append(x)</code>, <code>a.pop()</code></td><td>O(1)</td><td>Jump to a slot / stored length / last slot</td></tr>
    <tr><td><code>a.insert(0,x)</code>, <code>a.pop(0)</code>, <code>x in a</code></td><td>O(n)</td><td>Shift or scan every slot</td></tr>
    <tr><td><code>a[i:j]</code>, <code>a.copy()</code>, <code>a + b</code></td><td>O(k)</td><td>Copies k items into a new list</td></tr>
    <tr><td><code>sorted(a)</code>, <code>a.sort()</code></td><td>O(n log n)</td><td>Timsort; O(n) if already nearly sorted</td></tr>
    <tr><td><code>d[k]</code>, <code>k in d</code>, <code>x in s</code>, <code>s.add(x)</code></td><td>O(1) avg</td><td>Hash → slot</td></tr>
    <tr><td><code>s + t</code> (strings)</td><td>O(len(s)+len(t))</td><td>Strings cannot change, so a new one is built</td></tr>
    <tr><td><code>"".join(parts)</code></td><td>O(total length)</td><td>Measures once, copies once</td></tr>
    <tr><td><code>deque.appendleft</code>, <code>deque.popleft</code></td><td>O(1)</td><td>Linked blocks, both ends open</td></tr>
    <tr><td><code>heapq.heappush</code>, <code>heappop</code></td><td>O(log n)</td><td>Item bubbles up / down a tree of height log n</td></tr>
    <tr><td><code>bisect.bisect_left(a, x)</code></td><td>O(log n)</td><td>Binary search on a sorted list</td></tr>
    <tr><td><code>min(a)</code>, <code>max(a)</code>, <code>sum(a)</code>, <code>a.count(x)</code></td><td>O(n)</td><td>Must see every item</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: building a string with +</span>
    <p>A string cannot be changed, so <code>s = s + ch</code> normally makes a new string and copies the old one: n copies of growing length → O(n²). CPython has a shortcut when <code>s</code> is the only name pointing at the string. One extra reference and the shortcut disappears. <code>"".join(parts)</code> is always O(n).</p>
  </div>
<div class="fx" data-lang="py">import time
def t(f):
    s = time.perf_counter(); f(); return (time.perf_counter() - s) * 1000
n = 100_000
def concat_plain():
    s = ""
    for i in range(n): s = s + "x"
def concat_shared():
    s = ""
    for i in range(n):
        alias = s                # a second name for the same string
        s = s + "x"              # now Python must copy every time
def join():
    parts = []
    for i in range(n): parts.append("x")
    s = "".join(parts)
print(f"s + 'x' (only name)  : {t(concat_plain):7.1f} ms")
print(f"s + 'x' (2nd ref)    : {t(concat_shared):7.1f} ms")
print(f"''.join(parts)       : {t(join):7.1f} ms")</div>
  <div class="fx" data-lang="text">s + 'x' (only name)  :     7.5 ms
s + 'x' (2nd ref)    :   187.9 ms
''.join(parts)       :     3.0 ms</div>
  <p>Same loop, one extra name, about 25× slower; <code>join</code> stays fast either way.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>hash table</strong> is an array of slots plus a hash function: <code>slot = hash(key) % size</code>. Lookup, insert and delete are O(1) on average, O(n) in the worst case (all keys collide). Python's <code>dict</code> and <code>set</code> are hash tables.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A dict remembers insertion order (Python 3.7+), a set does not promise any order. Never write code that depends on the order you see when printing a set. Floats as keys are risky too: <code>0.1 + 0.2</code> is not <code>0.3</code>, so they are different keys.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Recursion &amp; the Call Stack.</b> We now know the cost of every container operation. One cost is still invisible in the code: a function that calls itself. The <a class="xref" data-note="py_functions">Functions</a> note showed recursion works; what does it cost in time and memory?</div>

  <h2 id="dsa-cx-recur"><span class="num">09</span>Recursion &amp; the Call Stack</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A recursive function creates no list, so by the rules of section 05 it looks like O(1) space. Yet deep recursion crashes Python. Where is the hidden memory, and how do we count the time of a function that calls itself twice?</p>
  </div>
  <p>When a function calls another function (or itself), the caller is <strong>paused</strong> until the answer comes back. Its local variables must be kept somewhere while it waits. Python keeps one <strong>frame</strong> per waiting call on the <strong>call stack</strong>. The newest call sits on top; when it returns, its frame is removed and the call below it resumes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A manager asks an assistant for the total of 4 bills. The assistant says "120 plus the total of the other 3" and passes 3 bills to a junior, and waits. The junior does the same, and so on, until someone gets zero bills and answers "0". Then the answers travel back up: 40, 290, 370, 490. While the youngest worked, everyone above was standing there waiting. Each waiting person is a stack frame.</p>
  </div>
  <h3>Traced on the first 4 charges</h3>
<div class="fx" data-lang="py">def total(charges, i=0, depth=0):
    pad = "    " * depth
    if i == len(charges):                       # base case: nothing left to add
        print(f"{pad}total(i={i}) -&gt; 0   base case, {depth + 1} calls open")
        return 0
    print(f"{pad}total(i={i}) waits for total(i={i + 1})")
    rest = total(charges, i + 1, depth + 1)     # this call pauses here
    print(f"{pad}total(i={i}) = {charges[i]} + {rest} = {charges[i] + rest}")
    return charges[i] + rest

print(total([120, 80, 250, 40]))</div>
  <div class="fx" data-lang="text">total(i=0) waits for total(i=1)
    total(i=1) waits for total(i=2)
        total(i=2) waits for total(i=3)
            total(i=3) waits for total(i=4)
                total(i=4) -&gt; 0   base case, 5 calls open
            total(i=3) = 40 + 0 = 40
        total(i=2) = 250 + 40 = 290
    total(i=1) = 80 + 290 = 370
total(i=0) = 120 + 370 = 490
490</div>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<text x="10" y="18" class="tm">the call stack at its deepest moment (top = newest)</text>
<rect x="40" y="30" width="230" height="26" class="fg sg"/><text x="155" y="48" text-anchor="middle" font-size="11">total(i=4) → returns 0 (base case)</text>
<rect x="40" y="58" width="230" height="26" class="fb sb"/><text x="155" y="76" text-anchor="middle" font-size="11">total(i=3) waiting · holds 40</text>
<rect x="40" y="86" width="230" height="26" class="fb sb"/><text x="155" y="104" text-anchor="middle" font-size="11">total(i=2) waiting · holds 250</text>
<rect x="40" y="114" width="230" height="26" class="fb sb"/><text x="155" y="132" text-anchor="middle" font-size="11">total(i=1) waiting · holds 80</text>
<rect x="40" y="142" width="230" height="26" class="fb sb"/><text x="155" y="160" text-anchor="middle" font-size="11">total(i=0) waiting · holds 120</text>
<text x="300" y="48" class="tg" font-size="11">↓ returns 0</text>
<text x="300" y="76" font-size="11">40 + 0 = 40</text>
<text x="300" y="104" font-size="11">250 + 40 = 290</text>
<text x="300" y="132" font-size="11">80 + 290 = 370</text>
<text x="300" y="160" font-size="11">120 + 370 = 490 ✓</text>
<text x="10" y="190" class="tm">4 charges → 5 frames at once. n charges → n + 1 frames: O(n) space although no list was built.</text>
</svg><figcaption>Frames pile up on the way down (left) and are removed one by one as answers come back (right column, read bottom to top in time order: top first).</figcaption></figure>
  <p>The trace shows both costs. <strong>Time</strong>: one call per charge plus the base case, each doing O(1) work, so O(n). <strong>Space</strong>: at the deepest moment 5 calls were open at once, so O(n) memory for the stack, even though the function builds no list.</p>
  <h3>The recursion limit</h3>
  <p>Python refuses to let the stack grow forever. By default it allows about 1000 frames; one more raises <code>RecursionError</code>. The loop version has no such limit and O(1) space.</p>
<div class="fx" data-lang="py">import sys
def total(charges, i=0):
    if i == len(charges):
        return 0
    return charges[i] + total(charges, i + 1)   # one stack frame per charge

def total_loop(charges):
    s = 0
    for c in charges:
        s += c
    return s

print("recursion limit:", sys.getrecursionlimit())
print(total([120, 80, 250, 40, 310, 80, 60, 200]))
print(total(list(range(900))))
try:
    total(list(range(5000)))
except RecursionError as e:
    print("RecursionError:", e)
print("loop version, 1,000,000 charges:", total_loop(list(range(1_000_000))))</div>
  <div class="fx" data-lang="text">recursion limit: 1000
1140
404550
RecursionError: maximum recursion depth exceeded
loop version, 1,000,000 charges: 499999500000</div>
  <p>900 charges were fine, 5,000 crashed, and the loop summed 10 lakh without trouble. <code>sys.setrecursionlimit(10_000)</code> can raise the limit, but each frame really uses memory and a too-high limit can crash the interpreter itself. For linear chains (lists, linked lists), prefer a loop.</p>
  <h3>When recursion explodes: calls that branch</h3>
  <p>The time of a recursive function is <strong>number of calls × work per call</strong>. <code>total</code> makes one call per level, a straight chain. A function that makes <em>two</em> calls per level makes a tree of calls, and the tree doubles at every level:</p>
<div class="fx" data-lang="py">import time
calls = 0
def fib(n):                       # two recursive calls per call
    global calls
    calls += 1
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)

for n in [10, 20, 25, 30]:
    calls = 0
    t = time.perf_counter()
    v = fib(n)
    print(f"fib({n}) = {v:&gt;6}   calls = {calls:&gt;9,}   time = {(time.perf_counter() - t) * 1000:7.1f} ms")</div>
  <div class="fx" data-lang="text">fib(10) =     55   calls =       177   time =     0.0 ms
fib(20) =   6765   calls =    21,891   time =     1.5 ms
fib(25) =  75025   calls =   242,785   time =    15.5 ms
fib(30) = 832040   calls = 2,692,537   time =   202.2 ms</div>
  <p>Each +5 in n multiplies the calls by about 11, the O(2ⁿ) family from section 04 (strictly about 1.6ⁿ). Yet the stack depth is only n at any moment, so space is O(n). The fix is to remember answers already computed (memoisation), which the <a class="xref" data-note="dsa_dp">Dynamic Programming</a> note builds on exactly this function.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>call stack</strong> holds one frame (local variables + where to resume) for every call that has started and not yet returned. <strong>Recursion space</strong> = the maximum number of frames open at once (the depth). <strong>Recursion time</strong> = total number of calls × work per call.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling recursion "O(1) space because there are no lists". The stack is memory. A recursive linked-list reverse or tree walk on a 10,000-long chain is O(n) space and crashes Python at the default limit.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>509 Fibonacci Number</b> (write the naive recursion, count its calls, then fix it), <b>70 Climbing Stairs</b> (the same call tree in disguise). Say the time and the stack depth for each.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Constraints.</b> We can now cost any piece of code: loops, containers, recursion. But in an interview we must choose an approach <em>before</em> writing code. Which Big-O is "fast enough" for a given problem?</div>

  <h2 id="dsa-cx-constraints"><span class="num">10</span>Reading Constraints</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every problem statement ends with lines like "1 ≤ nums.length ≤ 10⁵". We can label solutions O(n) or O(n²), but we cannot yet turn that input limit into "which label do I need", so we don't know whether the brute force we thought of first is good enough.</p>
  </div>
  <p>The bridge from Big-O to seconds is one number: <strong>how many simple steps Python does per second</strong>. Measure it once:</p>
<div class="fx" data-lang="py">import time
n = 10_000_000
t = time.perf_counter()
s = 0
for i in range(n):
    s += i
dt = time.perf_counter() - t
print(f"{n:,} simple loop steps took {dt:.2f} s  -&gt;  about {n / dt / 1e6:.0f} million steps per second")</div>
  <div class="fx" data-lang="text">10,000,000 simple loop steps took 0.72 s  -&gt;  about 14 million steps per second</div>
  <p>Roughly 10⁷ simple steps per second (here about 14 million; built-ins written in C, such as <code>sum</code> or <code>sorted</code>, go 10–50× faster per item). Online judges usually allow 1–2 seconds. So plug the largest n into each label and compare with 10⁷:</p>
  <table class="tbl"><caption>Constraint → the Big-O you need (Python, ~1 second)</caption>
    <tr><th>Largest n</th><th>Steps the label means</th><th>Fits?</th><th>Expected idea</th></tr>
    <tr><td>n ≤ 10–12</td><td>n! ≈ 4×10⁸ at 12</td><td>O(n!) just about</td><td>try every order (permutations)</td></tr>
    <tr><td>n ≤ 20–25</td><td>2ⁿ ≈ 10⁶–3×10⁷</td><td>O(2ⁿ)</td><td>try every subset, backtracking</td></tr>
    <tr><td>n ≤ 500</td><td>n³ ≈ 10⁸ (tight)</td><td>O(n³)</td><td>three nested loops, interval DP</td></tr>
    <tr><td>n ≤ 3,000–5,000</td><td>n² ≈ 10⁷</td><td>O(n²)</td><td>all pairs, 2-D DP</td></tr>
    <tr><td>n ≤ 10⁵–10⁶</td><td>n log n ≈ 2×10⁶–2×10⁷</td><td>O(n log n) or O(n)</td><td>sort, two pointers, sliding window, hash map, heap</td></tr>
    <tr><td>n ≤ 10⁸</td><td>n = 10⁸</td><td>O(n) with very cheap steps only</td><td>one pass, often maths</td></tr>
    <tr><td>n ≤ 10⁹–10¹⁸</td><td>—</td><td>O(log n) or O(1)</td><td>binary search on the answer, formula</td></tr>
  </table>
  <h3>Worked: the duplicate check as an interview problem</h3>
  <p>Section 01 is LeetCode <b>217 Contains Duplicate</b>: "return true if any value appears at least twice; 1 ≤ nums.length ≤ 10⁵". Read the constraint: n² = 10¹⁰ steps, about 1,000 seconds at 10⁷/s. Our measured list version (the O(n²) idea) took ~29 s even with the scan running in C. Too slow, so the problem is telling you: find O(n) or O(n log n). Set: O(n). Sort + neighbours: O(n log n). Both pass.</p>
  <h3>Analyse like an interviewer: three steps</h3>
  <p>After every solution, say the complexity out loud before the interviewer asks.</p>
  <div class="flow"><span>1. Count the loops</span><span>2. Check the loop body</span><span>3. State time AND space</span></div>
  <div class="callout pred"><span class="label">Predict</span>
    <p>One loop, a <code>sorted()</code> inside the loop, and a set. What are the time and space? Decide before reading the comments.</p>
  </div>
<div class="fx" data-lang="py">def weird(nums):
    seen = set()
    for x in nums:                 # step 1: one loop, n times
        if x in seen:              # step 2: O(1) set lookup
            return x
        seen.add(x)                # O(1) amortized
        _ = sorted(nums)           # step 2: O(n log n) INSIDE the loop!
    return None
# step 3: time O(n * n log n) = O(n^2 log n); space O(n) for the set (+ O(n) per sorted copy)
print(weird([120, 80, 250, 40, 310, 80, 60, 200]))</div>
  <div class="fx" data-lang="text">80</div>
  <p>Remove the useless <code>sorted</code> line and the same function is O(n) time, O(n) space. That is the most common interview fix: find the hidden cost in the body and take it out, or replace a list scan with a set. A full rewrite from slow to fast, with the trade stated: "did any customer order both today and yesterday?" (20,000 ids each).</p>
<div class="fx" data-lang="py">import time, random
def common_slow(a, b):           # for each of n items, scan m items -&gt; O(n*m) time, O(1) space
    for x in a:
        if x in b:
            return True
    return False

def common_fast(a, b):           # build a set once (O(m)), then n O(1) lookups -&gt; O(n+m) time, O(m) space
    seen = set(b)
    for x in a:
        if x in seen:
            return True
    return False

random.seed(1)
a = random.sample(range(10**7), 20_000)     # today's customer ids
b = random.sample(range(10**7), 20_000)     # yesterday's customer ids
for f in (common_slow, common_fast):
    t = time.perf_counter(); r = f(a, b)
    print(f"{f.__name__:12s} answer={r}  {(time.perf_counter()-t)*1000:8.1f} ms")</div>
  <div class="fx" data-lang="text">common_slow  answer=True     167.2 ms
common_fast  answer=True       1.6 ms</div>
  <div class="callout intu"><span class="label">Say it like this</span>
    <p>"The brute force is O(n·m) time and O(1) space. I will put list b into a set, which costs O(m) space, and then each lookup is O(1), so total time is O(n + m)." Name the brute force, name the trade, name both time and space.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A problem's <strong>constraints</strong> are the bounds on its input (sizes, value ranges). Together with "about 10⁷ Python steps per second" they give the <strong>budget</strong>: the slowest Big-O that still finishes in time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ignoring the value range. "values up to 10⁹" rules out an array indexed by value (10⁹ slots); "values 0–100" invites one (counting sort, a list of 101 counters). Also: the budget is for the whole test file, so an O(n²) idea that passes small samples still times out on the hidden big case.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>217 Contains Duplicate</b> (the running example; write all three versions of section 05), <b>1 Two Sum</b> (n ≤ 10⁴: O(n²) passes, but say why O(n) is better), <b>349 Intersection of Two Arrays</b> (the common_slow → common_fast rewrite). For each, read the constraints first and write the budget before coding.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects</b>, then <a class="xref" data-note="dsa_arrays">Arrays</a>: we can now say a pair search over the 8 charges is O(n²) and that n ≤ 10⁵ forbids it, but not yet <em>how</em> to find a faster idea. The next note gives the first four: two pointers, sliding window, prefix sums and Kadane.</div>

  <h2 id="dsa-cx-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Steps, Big-O, classes, space, amortised cost, list and dict internals, the call stack and constraints: how is each built from the one before, and which one do you reach for when?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-cx-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">the need</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">same answer: 0.02 s vs 29 s</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">count steps</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">n(n−1)/2 = 28 vs n = 8</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Big-O</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">dominant term, no constants</text>
<line x1="555" y1="54" x2="555" y2="86" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="ft st"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">classes, measured</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">1 · log n · n · n log n · n² · 2ⁿ</text>
<line x1="460" y1="110" x2="422" y2="110" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="ft st"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">space</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">set 4 MB buys O(n) time</text>
<line x1="240" y1="110" x2="202" y2="110" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="10" y="88" width="190" height="44" rx="7" class="ft st"/><text x="105" y="107" text-anchor="middle" font-size="11.5" font-weight="700">amortised</text><text x="105" y="123" text-anchor="middle" class="tm" font-size="10">8 appends, 2 resizes</text>
<line x1="105" y1="132" x2="105" y2="164" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="10" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="105" y="185" text-anchor="middle" font-size="11.5" font-weight="700">list = dynamic array</text><text x="105" y="201" text-anchor="middle" class="tm" font-size="10">a[i] O(1) · insert(0) O(n)</text>
<line x1="200" y1="188" x2="238" y2="188" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="240" y="166" width="180" height="44" rx="7" class="fg sg"/><text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">dict / set = hash table</text><text x="330" y="201" text-anchor="middle" class="tm" font-size="10">310 % 8 = 6 → O(1) avg</text>
<line x1="420" y1="188" x2="458" y2="188" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="460" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="555" y="185" text-anchor="middle" font-size="11.5" font-weight="700">call stack</text><text x="555" y="201" text-anchor="middle" class="tm" font-size="10">depth n → O(n) space; limit 1000</text>
<line x1="555" y1="210" x2="420" y2="244" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<line x1="105" y1="210" x2="240" y2="244" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<line x1="330" y1="210" x2="330" y2="242" stroke="currentColor" marker-end="url(#dsa-cx-a9)"/>
<rect x="160" y="244" width="340" height="48" rx="7" class="fv"/><text x="330" y="264" text-anchor="middle" font-size="11.5" font-weight="700">reading constraints</text><text x="330" y="281" text-anchor="middle" class="tm" font-size="10">~10⁷ steps/s: n ≤ 10⁵ ⇒ O(n log n) or O(n)</text>
</svg><figcaption>Read it as a path. A measured gap forces us to count steps; counting gets messy, so Big-O; Big-O needs meaning, so the measured classes; memory is the second cost; growing containers needs amortised cost; that explains the list and dict internals; recursion adds the stack. All of it feeds one decision: given the constraints, which Big-O must my solution have?</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's charges</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>Use when</th></tr>
    <tr><td>The need</td><td>two correct programs</td><td>does the approach matter?</td><td>1 lakh charges: list ~29 s, set ~0.02 s</td><td>always test the largest n</td></tr>
    <tr><td>Counting steps</td><td>the code's loops + hidden loops</td><td>how much work, exactly?</td><td>list 12 / set 6 on today; worst n(n−1)/2 = 28 vs 8</td><td>tracing small cases, proofs</td></tr>
    <tr><td>Big-O</td><td>step counts, dominant term</td><td>how does work grow?</td><td>A n+1 → O(n); B ½n²−½n → O(n²); C → O(n²)</td><td>every answer in an interview</td></tr>
    <tr><td>Common classes</td><td>Big-O + measured times</td><td>what does each label cost?</td><td>n = 10⁴: O(n²) ~2 s, O(n log n) ~1.5 ms</td><td>comparing two ideas</td></tr>
    <tr><td>Space complexity</td><td>Big-O applied to memory</td><td>how much extra memory?</td><td>set ~4 MB, list 0.8 MB, sort ~0</td><td>naming the time–space trade</td></tr>
    <tr><td>Amortised cost</td><td>total cost ÷ number of ops</td><td>is append O(1) or O(n)?</td><td>8 appends → 2 resizes; 10 lakh → 86</td><td>append, dict/set insert</td></tr>
    <tr><td>list internals</td><td>dynamic array + amortised growth</td><td>why a[i] fast, insert(0) slow?</td><td>a[3] = 1000 + 8×3; front inserts ~1 s vs ~4 ms</td><td>choosing list vs deque</td></tr>
    <tr><td>dict/set internals</td><td>hash function + slots + resizing</td><td>how is x in s O(1)?</td><td>310 → slot 6; 120, 80, 40, 200 collide at 0</td><td>any membership/lookup in a loop</td></tr>
    <tr><td>Call stack</td><td>functions + frames</td><td>what does recursion cost?</td><td>4 charges → 5 frames; fib(30) 2.7 M calls</td><td>any recursive solution</td></tr>
    <tr><td>Constraints</td><td>classes + ~10⁷ steps/s</td><td>which Big-O do I need?</td><td>n ≤ 10⁵ ⇒ O(n²) out, O(n) set in</td><td>before writing any code</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>count how the work grows with n (Big-O), including the hidden cost of every built-in and every recursive call, then compare it with the budget the constraints allow.</strong> Everything else in the DSA track is a collection of tricks for moving a solution down one class.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_arrays">Arrays, Strings &amp; Two Pointers</a>: the same 8 charges, and the first tricks that turn O(n²) into O(n).</div>

  <h2 id="dsa-cx-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's 8 charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b> (80 repeats); sorted <b>[40, 60, 80, 80, 120, 200, 250, 310]</b>; at scale, 1 lakh charge ids.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>The need</td><td>does the approach matter?</td><td>list ~29 s vs set ~0.02 s at 1 lakh</td><td>only found by running → predict it</td></tr>
    <tr><td>Counting steps</td><td>how much work?</td><td>12 vs 6 today; n(n−1)/2 vs n; binary 4 vs linear 8</td><td>exact counts are messy</td></tr>
    <tr><td>Big-O</td><td>one label for growth?</td><td>A O(n), B O(n²), C O(n²); doubling → ×2, ×4, ×4</td><td>what do labels mean in seconds?</td></tr>
    <tr><td>Classes</td><td>how do they compare?</td><td>n = 10⁴: n² ~2 s; n = 10⁶: n log n ~0.3 s</td><td>memory not counted</td></tr>
    <tr><td>Space</td><td>extra memory?</td><td>set ~4 MB, list 0.8 MB, sort ~0</td><td>containers grow: cost?</td></tr>
    <tr><td>Amortised</td><td>append O(1) or O(n)?</td><td>8 appends, 2 resizes; 10 lakh, 86</td><td>why are some ops slow?</td></tr>
    <tr><td>list inside</td><td>what is a list?</td><td>slot i at start + 8i; insert(0) ~hundreds × slower</td><td>how does a set avoid scanning?</td></tr>
    <tr><td>dict/set inside</td><td>how is lookup O(1)?</td><td>310 % 8 = 6; list 1,000 lookups ~370 ms vs set ~0.2 ms</td><td>recursion cost unknown</td></tr>
    <tr><td>Call stack</td><td>cost of recursion?</td><td>4 charges → 5 frames; limit 1000; fib(30) 2.7 M calls</td><td>how to choose before coding?</td></tr>
    <tr><td>Constraints</td><td>which Big-O is needed?</td><td>~14 M steps/s; n ≤ 10⁵ ⇒ O(n log n)/O(n)</td><td>→ Arrays: how to get there</td></tr>
  </table>
  <h3>Rules and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>All pairs</td><td>0 + 1 + … + (n−1) = n(n−1)/2</td><td>n = number of items; 8 → 28, 10⁵ → ~5×10⁹</td></tr>
    <tr><td>Halving</td><td>steps = ⌈log₂ n⌉ (+1)</td><td>10³ → 10, 10⁶ → 20</td></tr>
    <tr><td>Big-O</td><td>keep the dominant term, drop constants</td><td>½n² + ½n + 2 → O(n²)</td></tr>
    <tr><td>Loops</td><td>nested multiply, sequential add</td><td>two inputs: O(n·m), O(n + m)</td></tr>
    <tr><td>Order</td><td>1 &lt; log n &lt; n &lt; n log n &lt; n² &lt; 2ⁿ &lt; n!</td><td>doubling n: ×1, +1 step, ×2, ~×2, ×4, squared</td></tr>
    <tr><td>Amortised</td><td>total cost of n ops ÷ n</td><td>doubling: copies 1 + 2 + 4 + … &lt; 2n → O(1) each</td></tr>
    <tr><td>List slot</td><td>address = start + 8 × i</td><td>8 bytes per pointer on 64-bit</td></tr>
    <tr><td>Hash slot</td><td>slot = hash(key) % size</td><td>small ints: hash(x) = x (except −1 → −2)</td></tr>
    <tr><td>Recursion</td><td>time = calls × work per call; space = max depth</td><td>chain: O(n)/O(n); two calls per level: ~2ⁿ calls</td></tr>
    <tr><td>Budget</td><td>~10⁷ simple Python steps per second</td><td>n ≤ 10⁴ → n² ok; n ≤ 10⁵–10⁶ → n log n</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a set / dict</b><p>Any "have I seen x?", lookup or count inside a loop.</p><small>Costs O(n) memory; no order (set)</small></div>
    <div><b>Use a list</b><p>Ordered data, index access, appends at the end.</p><small>Not for <code>x in</code> inside a loop, not for front inserts</small></div>
    <div><b>Use a deque</b><p>Queues: add/remove at both ends in O(1).</p><small>Not for index access in the middle</small></div>
    <div><b>Use recursion</b><p>Trees, branching searches, divide and conquer.</p><small>Not for long linear chains in Python (limit 1000)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Hidden O(n) inside a loop (<code>in list</code>, <code>insert(0)</code>, <code>pop(0)</code>, slicing, <code>sorted</code>); testing only small n; forgetting space (and the recursion stack); calling dict lookup "always O(1)" (average; worst O(n)); using n for two different inputs; <code>s = s + ch</code> in a loop; binary search on unsorted data; relying on set order.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Comparisons for the list duplicate check on 8 charges with no repeat?</td><td>8 × 7 / 2 = 28</td></tr>
    <tr><td>Big-O of 3n² + 100n + 7?</td><td>O(n²)</td></tr>
    <tr><td>Why is <code>append</code> O(1) if a resize copies everything?</td><td>Capacity grows by a constant factor, so resizes are rare and total copying over n appends is O(n): amortised O(1)</td></tr>
    <tr><td>Space of recursively summing n charges?</td><td>O(n): n + 1 frames open at the deepest point</td></tr>
    <tr><td>n ≤ 10⁵: is an O(n²) pair loop OK in Python?</td><td>No: 10¹⁰ steps ≫ 10⁷/s; need O(n log n) or O(n)</td></tr>
  </table>

  <h2 id="dsa-cx-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we count steps instead of measuring seconds?</summary><div class="qa-body">Seconds depend on the machine, the language and what else is running. Step count as a function of n is the same everywhere and tells you what happens when the input grows. Big-O keeps only the fastest-growing term of that count.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Big-O of 5n² + 100n + 3, and why?</summary><div class="qa-body">O(n²). For large n the n² term dominates everything else, and the constant 5 does not change how the count grows when n doubles (it still becomes 4×).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give an example of O(log n) and explain where the log comes from.</summary><div class="qa-body">Binary search on a sorted list. Each step throws away half the remaining items, so after k steps only n / 2ᵏ remain; it ends when that reaches 1, i.e. k = log₂ n. Our 8 sorted charges needed 4 looks for 310; 10 lakh items need about 20.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A function has a single for-loop. Can it still be O(n²)?</summary><div class="qa-body">Yes, if the loop body does O(n) work: <code>x in some_list</code>, <code>list.insert(0, x)</code>, <code>pop(0)</code>, a slice, or <code>sort()</code>. The body cost multiplies the loop count. Section 01's list version is exactly this.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is list.append O(1) if resizing copies the whole list?</summary><div class="qa-body">Resizes are rare and get rarer: the block grows by a factor, so n appends cause only about log n resizes and the total copy work is O(n). Spread over n appends that is O(1) each, called amortised O(1). Our 8 appends caused 2 resizes; 10 lakh appends caused 86.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is x in list O(n) but x in set O(1)?</summary><div class="qa-body">A list has no idea where x could be, so it checks slot by slot. A set computes hash(x), takes it modulo the table size, and jumps to that slot; only collisions cause a few extra probes. 1,000 lookups took hundreds of ms with a list of 1 lakh and about 0.2 ms with a set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a dict lookup O(n)?</summary><div class="qa-body">Only when almost every key lands in the same slot, e.g. a custom class whose <code>__hash__</code> returns a constant, or a deliberate attack with crafted keys. With normal keys say "O(1) average".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a list be a dict key?</summary><div class="qa-body">The slot is chosen from the hash of the key. A list can change after insertion, so its hash would change and the entry would be lost. Python forbids it (<code>TypeError: unhashable type</code>). A tuple of the same values works because it cannot change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the space complexity of a recursive function that goes n levels deep?</summary><div class="qa-body">O(n): every paused call keeps a frame on the call stack. Python's default limit is 1000 frames, so deep recursion raises <code>RecursionError</code>; convert to a loop or use an explicit stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two inputs: a list of size n and a list of size m, nested loops over both. Complexity?</summary><div class="qa-body">O(n·m) time, not O(n²). Different inputs keep different letters; you cannot assume they are the same size. Loops one after the other would be O(n + m).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is "".join(parts) preferred over s += ch in a loop?</summary><div class="qa-body">Strings are immutable, so + builds a new string and copies the old one; over n steps that is O(n²). join measures the total length once and copies once, O(n). CPython sometimes optimises += in place, but only if nothing else refers to the string (one extra name made it about 25× slower above), so do not rely on it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The input limit says n ≤ 10⁵. Which complexities are acceptable?</summary><div class="qa-body">O(n), O(n log n) comfortably; O(n²) is 10¹⁰ steps, far too slow at ~10⁷ Python steps per second. So the expected solution uses a hash map, sorting, two pointers, a sliding window or a heap, not nested loops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does list.pop(0) cost and what should you use instead for a queue?</summary><div class="qa-body">O(n): every remaining item shifts left by one slot. Use <code>collections.deque</code>, whose <code>popleft</code> and <code>appendleft</code> are O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did we need step counting if we can just time the code?</summary><div class="qa-body">Timing needs the code to exist and the big input to be run; the list version needed 29 seconds just to show it was bad, and on 10 lakh charges it would take nearly an hour. Counting predicts the growth (n(n−1)/2 vs n) from the code alone, on any machine, before running.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does amortised analysis have to come before the list and dict internals?</summary><div class="qa-body">Both containers grow by occasionally rebuilding themselves (a bigger block for a list, a bigger table for a dict). Without amortised cost, append and insert would look O(n) because of those rebuilds, and the cost tables ("append O(1)", "add O(1)") would seem wrong.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip space complexity and only optimise time?</summary><div class="qa-body">You lose half of every trade. The set version is faster only because it pays O(n) memory; the sort version saves memory but pays O(n log n) time and reorders the input. Recursion also hides O(n) stack memory that can crash Python. An interviewer expects "time AND space" every time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do Big-O classes and constraints work together to pick a solution?</summary><div class="qa-body">The constraint gives n; the class turns n into a step count (n², n log n…); ~10⁷ steps per second turns that into seconds. If the brute force's class exceeds the budget (n² at n = 10⁵), you know before coding that you need a technique that moves it down a class, such as the hash set here or the two-pointer and window ideas in the Arrays note.</div></details>
</main>
`
});
