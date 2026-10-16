// notes/dsa/dsa_complexity.js — Complexity & Python Internals
Object.assign(TOPIC_CONTENT, {
  "dsa_complexity": `<main>
  <h1>Complexity &amp; Python Internals</h1>
  <p class="lead">How to say "this code is fast" in a way that stays true for 10 items and for 10 crore items. Big-O is the label interviewers ask for after every solution, and knowing how Python's list, dict and set work inside tells you which operations are cheap. Needs only basic Python (loops, lists, dicts).</p>

  <h2 id="dsa-cx-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Complexity &amp; Python Internals</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What "fast" means</div>
        <ul>
          <li><b>Count steps, not seconds</b> — seconds change with the laptop; step count does not</li>
          <li><b>n</b> — input size (items in the list, letters in the string)</li>
          <li><b>Worst case</b> — the slowest input; this is what Big-O usually describes</li>
          <li>💡 Phone book: reading every page = n steps; opening at the middle again and again = log n steps</li>
          <li>Real run: 10 lakh names → linear 10,00,000 steps, binary search 20 steps</li>
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
        <div class="mm-title">The ladder (fast → slow)</div>
        <ul>
          <li><b>O(1)</b> — same steps whatever n: <code>a[i]</code>, <code>d[k]</code>, <code>len()</code></li>
          <li><b>O(log n)</b> — halve the problem each step: binary search, heap push/pop</li>
          <li><b>O(n)</b> — touch each item once: sum, max, one loop</li>
          <li><b>O(n log n)</b> — good sorting: <code>sorted()</code>, merge sort</li>
          <li><b>O(n²)</b> — every pair: nested loops, bubble sort</li>
          <li><b>O(2ⁿ)</b> — every subset (pick / skip each item); n = 22 already took 3.7 s</li>
          <li>Rule of thumb for 1 second: n ≤ 10⁷ for O(n), 10⁴ for O(n²), 22 for O(2ⁿ)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Space complexity</div>
        <ul>
          <li><b>Space</b> — extra memory beyond the input; the input itself is not counted</li>
          <li><b>O(1)</b> — a few variables, swapping in place</li>
          <li><b>O(n)</b> — a new list / set / dict that grows with n</li>
          <li><b>Recursion</b> — each open call holds a stack frame; depth n → O(n) space</li>
          <li>⚠ Python stops at ~1000 nested calls (<code>RecursionError</code>); loop or raise the limit</li>
          <li><b>Trade</b> — spend O(n) space (a set) to cut O(n²) time to O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Amortized cost</div>
        <ul>
          <li><b>Amortized</b> — average cost per operation over a long run, not the single worst one</li>
          <li><b>list.append</b> — usually O(1); when full, Python grabs a bigger block and copies (O(n))</li>
          <li>Resizes are rare: 10 lakh appends → only 86 resizes; ≈ 1.05 copies per append</li>
          <li>💡 Shifting to a bigger house: costly once, then years of free space</li>
          <li>Say "O(1) amortized" for append, <code>dict</code>/<code>set</code> insert</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside list</div>
        <ul>
          <li><b>Dynamic array</b> — one continuous block of slots; slot i is at start + i × 8 bytes</li>
          <li><b>Index</b> O(1), <b>append / pop()</b> O(1) amortized, <b>len</b> O(1) (stored)</li>
          <li><b>insert(0) / pop(0)</b> O(n) — every item shifts one slot</li>
          <li><b>x in list</b> O(n) — checks slot by slot</li>
          <li><b>Slice a[i:j]</b> O(j − i) — copies</li>
          <li>Need a fast front? use <code>collections.deque</code> (appendleft O(1))</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside dict &amp; set</div>
        <ul>
          <li><b>Hash table</b> — <code>hash(key) % buckets</code> gives the slot number; jump straight there</li>
          <li><b>Lookup / insert / delete</b> — O(1) average, O(n) only if everything collides</li>
          <li><b>Collision</b> — two keys, same slot; Python probes the next slots</li>
          <li><b>Load</b> — table grows when 2/3 full, so chains stay short</li>
          <li>⚠ Keys must be hashable: <code>list</code> as key → <code>TypeError</code>; use <code>tuple</code></li>
          <li>dict keeps insertion order (3.7+); set does not promise any order</li>
          <li>Real run: 1000 lookups — list 437 ms, set 0.3 ms</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps &amp; interview habit</div>
        <ul>
          <li>⚠ <code>s = s + ch</code> in a loop — can become O(n²); use <code>"".join(parts)</code></li>
          <li>⚠ <code>list.insert(0, x)</code> in a loop — O(n²); 1 lakh inserts took 1.26 s vs 3 ms for append</li>
          <li>⚠ "One loop so O(n)" — look inside the loop body first</li>
          <li><b>3 steps</b> — count loops → check the body → state time AND space</li>
          <li>Always say both: "O(n) time, O(n) space because of the set"</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-cx-fast"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What "Fast" Means</span><span class="rm-sub">Count steps, not seconds</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-bigo"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Big-O: The Growth Label</span><span class="rm-sub">Keep the biggest term only</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-ladder"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Ladder</span><span class="rm-sub">O(1) to O(2ⁿ), with real timings</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-space"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Space Complexity</span><span class="rm-sub">Extra memory, recursion stack</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-amort"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Amortized Cost</span><span class="rm-sub">Why list.append is O(1)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-list"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Inside a Python List</span><span class="rm-sub">One block of slots</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-dict"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Inside dict and set</span><span class="rm-sub">Hash → bucket → jump</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-table"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Cost of Every Operation</span><span class="rm-sub">The reference table + traps</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-habit"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Hands-on: Analyse Like an Interviewer</span><span class="rm-sub">3 steps on real code</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-cx-fast"><span class="num">01</span>What "Fast" Means</h2>
  <p>You wrote a function. Your friend wrote another one for the same job. Which is faster? Timing with a stopwatch gives a different answer on every laptop, and it changes if the input is bigger. So programmers do not count seconds. They count <strong>steps</strong>: how many small actions (compare, add, read one item) the code does for an input of size <strong>n</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding "Ravi Sharma" in a paper phone book of 10 lakh names. Way 1: read from page 1, name by name. Worst case you read all 10 lakh names. Way 2: open the middle page. "Sharma" is after "Mehta", so throw away the first half. Open the middle of what is left. Repeat. Every step throws away half, so you need only about 20 steps. Same book, same name, 10,00,000 steps against 20.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
<text x="10" y="18" class="tm">Way 1: read every name (worst case = n steps)</text>
<g>
<rect x="10" y="26" width="44" height="26" class="fr sr"/><rect x="58" y="26" width="44" height="26" class="fr sr"/><rect x="106" y="26" width="44" height="26" class="fr sr"/><rect x="154" y="26" width="44" height="26" class="fr sr"/><rect x="202" y="26" width="44" height="26" class="fr sr"/><rect x="250" y="26" width="44" height="26" class="fr sr"/><rect x="298" y="26" width="44" height="26" class="fr sr"/><rect x="346" y="26" width="44" height="26" class="fr sr"/><rect x="394" y="26" width="44" height="26" class="fr sr"/><rect x="442" y="26" width="44" height="26" class="fr sr"/><rect x="490" y="26" width="44" height="26" class="fg sg"/>
<text x="32" y="44" text-anchor="middle" font-size="10">Aman</text><text x="80" y="44" text-anchor="middle" font-size="10">Asha</text><text x="128" y="44" text-anchor="middle" font-size="10">Ben</text><text x="176" y="44" text-anchor="middle" font-size="10">Chen</text><text x="224" y="44" text-anchor="middle" font-size="10">Dia</text><text x="272" y="44" text-anchor="middle" font-size="10">Kiran</text><text x="320" y="44" text-anchor="middle" font-size="10">Mehta</text><text x="368" y="44" text-anchor="middle" font-size="10">Neha</text><text x="416" y="44" text-anchor="middle" font-size="10">Priya</text><text x="464" y="44" text-anchor="middle" font-size="10">Raj</text><text x="512" y="44" text-anchor="middle" font-size="10">Ravi</text>
<text x="10" y="70" class="tr" font-size="11">11 names → 11 looks</text>
</g>
<text x="10" y="100" class="tm">Way 2: open the middle, throw away half (log n steps)</text>
<g>
<rect x="10" y="108" width="44" height="26" class="fs" stroke="currentColor"/><rect x="58" y="108" width="44" height="26" class="fs" stroke="currentColor"/><rect x="106" y="108" width="44" height="26" class="fs" stroke="currentColor"/><rect x="154" y="108" width="44" height="26" class="fs" stroke="currentColor"/><rect x="202" y="108" width="44" height="26" class="fs" stroke="currentColor"/><rect x="250" y="108" width="44" height="26" class="fb sb"/><rect x="298" y="108" width="44" height="26" class="fs" stroke="currentColor"/><rect x="346" y="108" width="44" height="26" class="fs" stroke="currentColor"/><rect x="394" y="108" width="44" height="26" class="fb sb"/><rect x="442" y="108" width="44" height="26" class="fs" stroke="currentColor"/><rect x="490" y="108" width="44" height="26" class="fg sg"/>
<text x="272" y="126" text-anchor="middle" font-size="10">Kiran</text><text x="416" y="126" text-anchor="middle" font-size="10">Priya</text><text x="512" y="126" text-anchor="middle" font-size="10">Ravi</text>
<text x="272" y="150" text-anchor="middle" font-size="10" class="tb">1st look</text><text x="416" y="150" text-anchor="middle" font-size="10" class="tb">2nd look</text><text x="512" y="150" text-anchor="middle" font-size="10" class="tg">3rd: found</text>
<text x="10" y="178" class="tg" font-size="11">11 names → 3 looks (11 → 5 → 2 → 1)</text>
</g>
</svg><figcaption>Top row: every box is checked. Bottom row: only the blue middle boxes are checked, each look halves the search area.</figcaption></figure>
  <p>The code below counts the steps for both ways. Notice the second number barely moves when the book becomes 1000 times bigger.</p>
<div class="fx" data-lang="py"># counting steps
def linear_search(names, target):
    steps = 0
    for i, name in enumerate(names):
        steps += 1
        if name == target:
            return i, steps
    return -1, steps

def binary_search(names, target):
    lo, hi, steps = 0, len(names) - 1, 0
    while lo &lt;= hi:
        steps += 1
        mid = (lo + hi) // 2
        if names[mid] == target:
            return mid, steps
        if names[mid] &lt; target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

for n in [1_000, 1_000_000]:
    book = list(range(n))           # a sorted "phone book"
    target = n - 1                  # worst case: last name
    print(n, "linear:", linear_search(book, target)[1], "steps | binary:", binary_search(book, target)[1], "steps")</div>
  <div class="fx" data-lang="text">1000 linear: 1000 steps | binary: 10 steps
1000000 linear: 1000000 steps | binary: 20 steps</div>
  <p>Two words you will hear again and again. <strong>n</strong> is the size of the input (how many names, numbers, characters). <strong>Worst case</strong> is the input that makes the code do the most steps, like the name being on the last page. Interviewers normally ask about the worst case, because a plan that is fine on average but dies on one bad input is still a bad plan.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Time complexity</strong> is a count of the steps the code does, written as a function of the input size n. It is about growth, not seconds on a clock.</p>
  </div>

  <h2 id="dsa-cx-bigo"><span class="num">02</span>Big-O: The Growth Label</h2>
  <p>Exact step counts get messy. One function does 3n + 7 steps, another does n²/2 + n. Nobody wants to compare those. What matters is the question: <strong>if I double n, how much more work is it?</strong> For 3n + 7 the answer is "about double". For n²/2 + n it is "about four times". So we keep only the part that controls that answer and throw away the rest. That short label is called <strong>Big-O</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shop bill: 1 kg rice ₹60, 10 kg ₹600, 100 kg ₹6000, plus a ₹10 carry bag each time. For a big order the bag price does not matter. The rice decides the bill. Big-O keeps "the rice" (the term that grows) and drops "the bag" (constants and small terms).</p>
  </div>
  <table class="tbl">
    <tr><th>Rule</th><th>Plain meaning</th><th>Example</th></tr>
    <tr><td><strong>Drop constants</strong></td><td>Doing the loop twice is still "one loop's worth of growth"</td><td>3n → O(n); n/2 → O(n)</td></tr>
    <tr><td><strong>Drop smaller terms</strong></td><td>When n is big, only the biggest term is felt</td><td>n² + 5n + 20 → O(n²)</td></tr>
    <tr><td><strong>Nested loops multiply</strong></td><td>Inner loop runs fully for every outer step</td><td>loop in a loop → O(n²)</td></tr>
    <tr><td><strong>Loops in sequence add</strong></td><td>One after the other</td><td>n + n = 2n → O(n)</td></tr>
    <tr><td><strong>Separate inputs, separate letters</strong></td><td>Two lists of different sizes</td><td>O(n + m), O(n·m)</td></tr>
  </table>
<div class="fx" data-lang="py">def total(nums):                 # one pass: n steps          -&gt; O(n)
    s = 0
    for x in nums:
        s += x
    return s

def has_pair_sum(nums, k):       # every pair: n * n steps     -&gt; O(n^2)
    for a in nums:
        for b in nums:
            if a + b == k:
                return True
    return False

def both(nums, words):           # n steps then m steps        -&gt; O(n + m)
    print(max(nums))             # n
    print(len(" ".join(words)))  # m</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"One loop, so it is O(n)" is the most common wrong answer. Look at what is <em>inside</em> the loop. <code>x in some_list</code>, <code>list.sort()</code>, <code>list.insert(0, x)</code> or a slice each cost up to n steps on their own. A loop that does an O(n) thing n times is O(n²).</p>
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
        seen.add(x)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Big-O notation</strong>, written O(f(n)), says "for large n the step count grows no faster than f(n), ignoring constant factors". O(n) is read "order n" or "linear".</p>
  </div>

  <h2 id="dsa-cx-ladder"><span class="num">03</span>The Ladder: O(1) to O(2ⁿ)</h2>
  <p>Six labels cover almost every piece of code you will write in an interview. Learn them as a ladder from fastest to slowest, each with one picture in your head.</p>
  <div class="cards">
    <div><b>O(1) constant</b><p>Same steps whatever n. Jump straight to one box.</p><small>a[5], d["key"], len(a), a.append(x)</small></div>
    <div><b>O(log n) logarithmic</b><p>Each step throws away half. 10 lakh items → 20 steps.</p><small>binary search, heap push/pop</small></div>
    <div><b>O(n) linear</b><p>Touch every item once. Double n, double the work.</p><small>sum, max, x in list, one loop</small></div>
    <div><b>O(n log n)</b><p>n items, each handled log n times. The cost of good sorting.</p><small>sorted(), merge sort, heap sort</small></div>
    <div><b>O(n²) quadratic</b><p>Every item against every item. Double n, four times the work.</p><small>nested loops, bubble sort</small></div>
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
  <p>The curves are real numbers, not just a drawing. For a few sizes of n, this is how many steps each label means:</p>
<div class="fx" data-lang="py">import math
print(f"{'n':&gt;9} {'log n':&gt;6} {'n log n':&gt;10} {'n^2':&gt;14} {'2^n':&gt;10}")
for n in [10, 100, 1000, 1_000_000]:
    two = f"{2**n:.1e}" if n &lt;= 1000 else "huge"
    print(f"{n:&gt;9} {math.ceil(math.log2(n)):&gt;6} {round(n*math.log2(n)):&gt;10} {n*n:&gt;14} {two:&gt;10}")</div>
  <div class="fx" data-lang="text">        n  log n    n log n            n^2        2^n
       10      4         33            100    1.0e+03
      100      7        664          10000    1.3e+30
     1000     10       9966        1000000   1.1e+301
  1000000     20   19931569  1000000000000       huge</div>
  <p>And here are real stopwatch times on this machine for one function from each label. Watch how each column reacts when n grows 10×.</p>
<div class="fx" data-lang="py">import time, bisect, random

def timed(f, *a):
    t = time.perf_counter(); f(*a); return (time.perf_counter() - t) * 1000  # ms

def o1(a):      return a[len(a) // 2]                  # jump to one box
def ologn(a):   return bisect.bisect_left(a, -1)       # binary search
def on(a):      return sum(a)                          # touch every item once
def onlogn(a):  return sorted(a)                       # good sort
def on2(a):                                            # every pair
    c = 0
    for x in a:
        for y in a:
            c += 1
    return c

random.seed(0)
print(f"{'n':&gt;7} {'O(1)':&gt;8} {'O(log n)':&gt;9} {'O(n)':&gt;8} {'O(n log n)':&gt;11} {'O(n^2)':&gt;10}   (ms)")
for n in [1_000, 10_000, 100_000]:
    a = random.sample(range(10 * n), n)
    s = sorted(a)
    row = [timed(o1, a), timed(ologn, s), timed(on, a), timed(onlogn, a)]
    cells = [f"{v:&gt;8.3f}" for v in row[:3]] + [f"{row[3]:&gt;11.2f}"]
    cells.append(f"{timed(on2, a):&gt;10.1f}" if n &lt;= 10_000 else "   skipped")
    print(f"{n:&gt;7} " + " ".join(cells))</div>
  <div class="fx" data-lang="text">      n     O(1)  O(log n)     O(n)  O(n log n)     O(n^2)   (ms)
   1000    0.002    0.002    0.006        0.08       23.2
  10000    0.003    0.003    0.040        1.28     2163.6
 100000    0.006    0.006    1.408       22.42    skipped</div>
  <p>O(1) and O(log n) do not move. O(n) grows 10×. O(n log n) grows a little more than 10×. O(n²) grows 100× (22 ms → 2.2 s), and at n = 1 lakh it would need about 4 minutes, so it was skipped. O(2ⁿ) is in a class of its own:</p>
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
  <div class="fx" data-lang="text">n=10  subsets=    1,024  time=     0.2 ms
n=15  subsets=   32,768  time=    11.2 ms
n=20  subsets=1,048,576  time=   536.7 ms
n=22  subsets=4,194,304  time=  4598.9 ms</div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Python does roughly 10⁷ simple steps per second. So within about 1 second: O(n) handles n ≈ 10⁷, O(n log n) handles n ≈ 10⁶, O(n²) handles n ≈ 10⁴ (3000–5000 to be safe), O(2ⁿ) handles n ≈ 22. Read the input limits in a question and this tells you which label the expected solution has.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>O(log n) means "halving", so it needs a way to halve: a sorted list (binary search) or a heap. Binary search on an unsorted list is simply wrong. And sorting first costs O(n log n), so for a single search a plain O(n) scan is cheaper.</p>
  </div>

  <h2 id="dsa-cx-space"><span class="num">04</span>Space Complexity</h2>
  <p>Time is not the only thing a program spends. It also uses memory. <strong>Space complexity</strong> is how much <em>extra</em> memory the code needs, as n grows. The input itself is not counted; it was already there. A few loop variables are O(1). A new list with one slot per input item is O(n).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Checking a 50-page exam answer sheet. Ticking marks on the same sheet with one pen needs no extra paper (O(1)). Copying every answer to a fresh notebook first needs 50 more pages (O(n)).</p>
  </div>
<div class="fx" data-lang="py">def reverse_in_place(nums):           # O(1) extra space: two index variables
    i, j = 0, len(nums) - 1
    while i &lt; j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1
    return nums

def reverse_copy(nums):               # O(n) extra space: a brand-new list
    return nums[::-1]

a = [1, 2, 3, 4, 5]
print(reverse_in_place(a), reverse_copy([1, 2, 3, 4, 5]))</div>
  <div class="fx" data-lang="text">[5, 4, 3, 2, 1] [5, 4, 3, 2, 1]</div>
  <h3>Recursion uses the stack</h3>
  <p>When a function calls itself, the outer call is paused and waits. Every waiting call keeps its variables alive in a memory area called the <strong>call stack</strong>. So a recursion that goes n levels deep uses O(n) space even if it creates no list. Python also sets a limit on this depth (1000 by default).</p>
<div class="fx" data-lang="py">import sys
def count_down(n):
    if n == 0:
        return 0
    return 1 + count_down(n - 1)     # each call waits on the stack
print(count_down(900))
try:
    count_down(5000)
except RecursionError as e:
    print("RecursionError:", e)</div>
  <div class="fx" data-lang="text">900
RecursionError: maximum recursion depth exceeded</div>
  <table class="tbl">
    <tr><th>Code shape</th><th>Extra space</th><th>Why</th></tr>
    <tr><td>Few variables, swap in place</td><td>O(1)</td><td>Nothing grows with n</td></tr>
    <tr><td>Build a set / dict / list of the input</td><td>O(n)</td><td>One slot per item</td></tr>
    <tr><td>Recursion n levels deep</td><td>O(n)</td><td>n paused calls on the stack</td></tr>
    <tr><td>Binary-search recursion</td><td>O(log n)</td><td>Depth halves each call</td></tr>
    <tr><td>n × m grid or DP table</td><td>O(n·m)</td><td>One cell per pair</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Space and time trade with each other. <code>first_repeat_fast</code> above spent O(n) space on a set to bring time from O(n²) to O(n). Interviewers like hearing you name that trade: "O(n) time, O(n) space; I can do O(1) space if I sort first, but then it is O(n log n) time."</p>
  </div>

  <h2 id="dsa-cx-amort"><span class="num">05</span>Amortized Cost: Why list.append is O(1)</h2>
  <p>A Python list keeps its items in one continuous block of memory (details in the next section). When the block is full and you append one more item, Python must get a bigger block and copy everything over. That single append costs O(n). Yet everyone says <code>append</code> is O(1). Both are true, and the word that joins them is <strong>amortized</strong>: the average cost per operation over a long run of operations.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Shifting house. Moving day is a big, costly job. But you move to a house twice as big, so for years every new item just goes on a shelf with zero effort. Spread the moving cost over all those easy years and each item cost almost nothing.</p>
  </div>
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
<text x="10" y="150" class="tm">total copies for n appends = 1 + 2 + 4 + … ≈ 2n  →  about 2 per append  →  O(1) amortized</text>
</svg><figcaption>Blue = filled slots, grey = spare room. Each doubling copies everything once, then gives that many free appends.</figcaption></figure>
  <p>A small simulation of "double when full" makes the arithmetic visible. The total copy work stays close to n, so each append pays for about one copy.</p>
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
for n in [1_000, 1_000_000]:
    c, w = append_cost(n)
    print(f"n={n:&gt;9,}  total copies={c:&gt;9,}  copies per append={c/n:.2f}  worst single append copied {w:,}")</div>
  <div class="fx" data-lang="text">n=    1,000  total copies=    1,023  copies per append=1.02  worst single append copied 512
n=1,000,000  total copies=1,048,575  copies per append=1.05  worst single append copied 524,288</div>
  <p>Real CPython grows by about 12% plus a little, not exactly 2×, but the idea is the same. <code>sys.getsizeof</code> shows the block size jumping only now and then:</p>
<div class="fx" data-lang="py">import sys
a = []
last = sys.getsizeof(a)
print("len  bytes   (bytes jump = Python grabbed a bigger block)")
for i in range(20):
    a.append(i)
    size = sys.getsizeof(a)
    if size != last:
        print(f"{len(a):&gt;3}  {size:&gt;5}   &lt;- resize")
        last = size</div>
  <div class="fx" data-lang="text">len  bytes   (bytes jump = Python grabbed a bigger block)
  1     88   &lt;- resize
  5    120   &lt;- resize
  9    184   &lt;- resize
 17    248   &lt;- resize</div>
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
    <p><strong>Amortized O(1)</strong> means: any one call may be slow, but n calls together cost O(n), so the average per call is O(1). Use the word for <code>list.append</code>, <code>list.pop()</code>, and dict/set insert (their tables also resize).</p>
  </div>

  <h2 id="dsa-cx-list"><span class="num">06</span>Inside a Python List</h2>
  <p>A list looks like a row of boxes, and in memory it really is one: a <strong>dynamic array</strong>, one continuous block of equal-size slots. Each slot holds the address of a Python object (8 bytes on a 64-bit machine). Because the slots are equal and side by side, slot i lives at <code>start + 8 × i</code>. One multiplication, one jump. That is why <code>a[i]</code> is O(1) for any i.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="10" y="18" class="tm">a = [10, 20, 30, 40]     start address = 1000, each slot 8 bytes</text>
<rect x="60" y="34" width="80" height="34" class="fb sb"/><rect x="140" y="34" width="80" height="34" class="fb sb"/><rect x="220" y="34" width="80" height="34" class="fb sb"/><rect x="300" y="34" width="80" height="34" class="fb sb"/><rect x="380" y="34" width="80" height="34" class="fs" stroke="currentColor"/><rect x="460" y="34" width="80" height="34" class="fs" stroke="currentColor"/>
<text x="100" y="56" text-anchor="middle">10</text><text x="180" y="56" text-anchor="middle">20</text><text x="260" y="56" text-anchor="middle">30</text><text x="340" y="56" text-anchor="middle">40</text><text x="420" y="56" text-anchor="middle" class="tm">spare</text><text x="500" y="56" text-anchor="middle" class="tm">spare</text>
<text x="100" y="84" text-anchor="middle" class="tm" font-size="11">1000</text><text x="180" y="84" text-anchor="middle" class="tm" font-size="11">1008</text><text x="260" y="84" text-anchor="middle" class="tm" font-size="11">1016</text><text x="340" y="84" text-anchor="middle" class="tm" font-size="11">1024</text>
<text x="100" y="100" text-anchor="middle" class="tb" font-size="11">a[0]</text><text x="180" y="100" text-anchor="middle" class="tb" font-size="11">a[1]</text><text x="260" y="100" text-anchor="middle" class="tb" font-size="11">a[2]</text><text x="340" y="100" text-anchor="middle" class="tb" font-size="11">a[3]</text>
<text x="10" y="135" class="tm">a[3] → 1000 + 8 × 3 = 1024, one jump. len stored separately = 4. Spare slots make append free until they run out.</text>
</svg><figcaption>Slots sit side by side, so any index is one arithmetic step away. The spare slots at the end are the "bigger house" from the last section.</figcaption></figure>
  <p>The same picture explains the slow operations. Adding at the <em>end</em> only fills a spare slot. Adding at the <em>front</em> means every existing item must shift one slot right, n moves. Removing from the front shifts them all left. Searching with <code>in</code> checks slots one by one.</p>
<div class="fx" data-lang="py">import time
from collections import deque
def t(f):
    s = time.perf_counter(); f(); return (time.perf_counter() - s) * 1000
n = 100_000
def front_list():
    a = []
    for i in range(n): a.insert(0, i)       # shift everything right each time
def back_list():
    a = []
    for i in range(n): a.append(i)
def front_deque():
    d = deque()
    for i in range(n): d.appendleft(i)
print(f"list.insert(0, x) x {n:,}: {t(front_list):8.1f} ms")
print(f"list.append(x)    x {n:,}: {t(back_list):8.1f} ms")
print(f"deque.appendleft  x {n:,}: {t(front_deque):8.1f} ms")
def concat():
    s = ""
    for i in range(n): s = s + "x"           # may copy the whole string
def join():
    parts = []
    for i in range(n): parts.append("x")
    s = "".join(parts)
print(f"s = s + 'x'       x {n:,}: {t(concat):8.1f} ms")
print(f"''.join(parts)    x {n:,}: {t(join):8.1f} ms")</div>
  <div class="fx" data-lang="text">list.insert(0, x) x 100,000:   1197.5 ms
list.append(x)    x 100,000:      3.2 ms
deque.appendleft  x 100,000:      4.1 ms
s = s + 'x'       x 100,000:      3.3 ms
''.join(parts)    x 100,000:      5.5 ms</div>
  <p>Two things to notice. <code>insert(0, x)</code> is 400× slower than <code>append</code>, because each insert shifts the whole list. <code>collections.deque</code> is built for both ends, so <code>appendleft</code> is as fast as <code>append</code>. The string lines look equally fast here only because of a special CPython shortcut; the next section's trap shows when it breaks.</p>
  <table class="tbl">
    <tr><th>list operation</th><th>Cost</th><th>Reason</th></tr>
    <tr><td><code>a[i]</code>, <code>a[i] = x</code></td><td>O(1)</td><td>start + 8·i, one jump</td></tr>
    <tr><td><code>len(a)</code></td><td>O(1)</td><td>Length is stored, not counted</td></tr>
    <tr><td><code>a.append(x)</code>, <code>a.pop()</code></td><td>O(1) amortized</td><td>Fill / free the last slot; rare resize</td></tr>
    <tr><td><code>a.insert(0, x)</code>, <code>a.pop(0)</code></td><td>O(n)</td><td>Every item shifts one slot</td></tr>
    <tr><td><code>x in a</code>, <code>a.index(x)</code>, <code>a.remove(x)</code></td><td>O(n)</td><td>Check slots one by one</td></tr>
    <tr><td><code>a[i:j]</code></td><td>O(j − i)</td><td>Copies that many slots into a new list</td></tr>
    <tr><td><code>a.sort()</code>, <code>sorted(a)</code></td><td>O(n log n)</td><td>Timsort</td></tr>
    <tr><td><code>min(a)</code>, <code>max(a)</code>, <code>sum(a)</code></td><td>O(n)</td><td>Must look at every item</td></tr>
  </table>

  <h2 id="dsa-cx-dict"><span class="num">07</span>Inside dict and set</h2>
  <p>A list finds an item by position. But most real questions are "is this roll number present?" or "how many orders did customer 1032 place?", and you do not know the position. Scanning the whole list each time is O(n). A <strong>dict</strong> (and a <strong>set</strong>, which is a dict with keys only) answers in O(1) by turning the key itself into a position.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school office with 26 pigeon-holes, one per starting letter. A letter for "Priya" goes straight into the P hole. To find it later, nobody searches all holes; they go to P. The rule "first letter → hole number" is the <strong>hash function</strong>. Two names starting with P share a hole; that is a <strong>collision</strong>, and the clerk checks the two or three letters inside.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
<defs><marker id="dsa-cx-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<rect x="10" y="30" width="90" height="30" class="fb sb"/><text x="55" y="50" text-anchor="middle">"Priya"</text>
<rect x="150" y="30" width="110" height="30" class="fv"/><text x="205" y="50" text-anchor="middle" font-size="11">hash() → 8217</text>
<rect x="310" y="30" width="90" height="30" class="ft st"/><text x="355" y="50" text-anchor="middle" font-size="11">8217 % 8 = 1</text>
<line x1="102" y1="45" x2="147" y2="45" stroke="currentColor" marker-end="url(#dsa-cx-ar)"/>
<line x1="262" y1="45" x2="307" y2="45" stroke="currentColor" marker-end="url(#dsa-cx-ar)"/>
<text x="10" y="100" class="tm">buckets:</text>
<rect x="80" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="136" y="82" width="56" height="30" class="fg sg"/><rect x="192" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="248" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="304" y="82" width="56" height="30" class="fb sb"/><rect x="360" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="416" y="82" width="56" height="30" class="fs" stroke="currentColor"/><rect x="472" y="82" width="56" height="30" class="fs" stroke="currentColor"/>
<text x="108" y="126" text-anchor="middle" class="tm" font-size="11">0</text><text x="164" y="126" text-anchor="middle" class="tm" font-size="11">1</text><text x="220" y="126" text-anchor="middle" class="tm" font-size="11">2</text><text x="276" y="126" text-anchor="middle" class="tm" font-size="11">3</text><text x="332" y="126" text-anchor="middle" class="tm" font-size="11">4</text><text x="388" y="126" text-anchor="middle" class="tm" font-size="11">5</text><text x="444" y="126" text-anchor="middle" class="tm" font-size="11">6</text><text x="500" y="126" text-anchor="middle" class="tm" font-size="11">7</text>
<text x="164" y="102" text-anchor="middle" font-size="10">Priya</text><text x="332" y="102" text-anchor="middle" font-size="10">Ravi</text>
<line x1="355" y1="62" x2="170" y2="80" stroke="currentColor" marker-end="url(#dsa-cx-ar)"/>
<text x="10" y="160" class="tm">lookup d["Priya"]: compute the same hash → bucket 1 → compare the key → found. No scanning.</text>
<text x="10" y="178" class="tm">collision: another key also lands on 1 → Python probes a nearby bucket and stores it there.</text>
</svg><figcaption>The key is turned into a number, the number picks a bucket, and the lookup goes straight to that bucket.</figcaption></figure>
  <p>Three steps happen on every <code>d[key]</code>: (1) <code>hash(key)</code> turns the key into a big integer, always the same for the same key; (2) <code>hash % number_of_buckets</code> picks a slot; (3) Python compares the key stored there with yours. Step 3 is needed because of collisions: two different keys can pick the same slot. When that happens Python tries the next slots in a fixed pattern (<strong>open addressing</strong>). To keep those chains short, the table is rebuilt at about double the size as soon as it is two-thirds full. That resize is the amortized part, just like list append.</p>
<div class="fx" data-lang="py">print(hash(42), hash(7), hash(-3))       # small ints hash to themselves (except -1)
print(hash("cat") == hash("cat"))        # same key -&gt; same hash, always (in one run)
buckets = 8
for key in [42, 7, 15, 23]:
    print(key, "-&gt; bucket", hash(key) % buckets)
try:
    d = {[1, 2]: "x"}
except TypeError as e:
    print("TypeError:", e)
print({(1, 2): "ok"})                    # tuples are hashable</div>
  <div class="fx" data-lang="text">42 7 -3
True
42 -&gt; bucket 2
7 -&gt; bucket 7
15 -&gt; bucket 7
23 -&gt; bucket 7
TypeError: unhashable type: 'list'
{(1, 2): 'ok'}</div>
  <p>Keys 7, 15 and 23 all land on bucket 7 with 8 buckets; that is a collision, handled by probing. The <code>TypeError</code> shows the one rule for keys: they must be <strong>hashable</strong>, which means unchangeable. A list can change after it is stored, so its hash would become wrong; a tuple cannot change, so it works. The speed difference is not small:</p>
<div class="fx" data-lang="py">import time, random
n = 100_000
nums_list = list(range(n))
nums_set = set(nums_list)
queries = [random.randrange(2 * n) for _ in range(1_000)]

t = time.perf_counter()
hits = sum(q in nums_list for q in queries)       # each check scans the list
t_list = time.perf_counter() - t

t = time.perf_counter()
hits2 = sum(q in nums_set for q in queries)       # each check jumps to a bucket
t_set = time.perf_counter() - t
print(f"1,000 lookups in list: {t_list*1000:7.1f} ms")
print(f"1,000 lookups in set : {t_set*1000:7.3f} ms   (same answer: {hits == hits2})")</div>
  <div class="fx" data-lang="text">1,000 lookups in list:   502.5 ms
1,000 lookups in set :   0.197 ms   (same answer: True)</div>
  <table class="tbl">
    <tr><th>dict / set operation</th><th>Cost</th><th>Reason</th></tr>
    <tr><td><code>d[k]</code>, <code>k in d</code>, <code>d[k] = v</code>, <code>del d[k]</code></td><td>O(1) average</td><td>hash → bucket; worst O(n) only if everything collides</td></tr>
    <tr><td><code>s.add(x)</code>, <code>x in s</code>, <code>s.remove(x)</code></td><td>O(1) average</td><td>Same table, no values</td></tr>
    <tr><td><code>for k in d</code>, <code>d.items()</code></td><td>O(n)</td><td>Visit every entry</td></tr>
    <tr><td><code>s1 &amp; s2</code>, <code>s1 | s2</code></td><td>O(len(s1) + len(s2))</td><td>Walk one, look up in the other</td></tr>
    <tr><td><code>dict(zip(keys, vals))</code>, <code>set(lst)</code></td><td>O(n)</td><td>n inserts of O(1)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A dict remembers insertion order (Python 3.7+), a set does not promise any order. Never write code that depends on the order you see when printing a set. Also, floats as keys are risky: <code>0.1 + 0.2</code> is not <code>0.3</code>, so the hashes differ.</p>
  </div>

  <h2 id="dsa-cx-table"><span class="num">08</span>Cost of Every Operation You Use</h2>
  <p>The reference table to keep in your head. Everything in it follows from the two pictures above: a list is a block of slots, a dict is a hash table.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>One-line reason</th></tr>
    <tr><td><code>a[i]</code>, <code>len(a)</code>, <code>a.append(x)</code>, <code>a.pop()</code></td><td>O(1)</td><td>Jump to a slot / stored length / last slot</td></tr>
    <tr><td><code>a.insert(0,x)</code>, <code>a.pop(0)</code>, <code>x in a</code></td><td>O(n)</td><td>Shift or scan every slot</td></tr>
    <tr><td><code>a[i:j]</code>, <code>a.copy()</code>, <code>a + b</code></td><td>O(k)</td><td>Copies k items into a new list</td></tr>
    <tr><td><code>sorted(a)</code>, <code>a.sort()</code></td><td>O(n log n)</td><td>Timsort; O(n) if already nearly sorted</td></tr>
    <tr><td><code>d[k]</code>, <code>k in d</code>, <code>x in s</code>, <code>s.add(x)</code></td><td>O(1) avg</td><td>Hash → bucket</td></tr>
    <tr><td><code>s + t</code> (strings)</td><td>O(len(s)+len(t))</td><td>Strings cannot change, so a new one is built</td></tr>
    <tr><td><code>"".join(parts)</code></td><td>O(total length)</td><td>Measures once, copies once</td></tr>
    <tr><td><code>deque.appendleft</code>, <code>deque.popleft</code></td><td>O(1)</td><td>Built as linked blocks, both ends open</td></tr>
    <tr><td><code>heapq.heappush</code>, <code>heappop</code></td><td>O(log n)</td><td>Item bubbles up / down a tree of height log n</td></tr>
    <tr><td><code>bisect.bisect_left(a, x)</code></td><td>O(log n)</td><td>Binary search on a sorted list</td></tr>
    <tr><td><code>min(a)</code>, <code>max(a)</code>, <code>sum(a)</code>, <code>a.count(x)</code></td><td>O(n)</td><td>Must see every item</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: building a string with +</span>
    <p>A string cannot be changed, so <code>s = s + ch</code> normally makes a new string and copies the old one: n copies of growing length → O(n²). CPython has a shortcut when <code>s</code> is the only name pointing at the string, which is why the earlier timing looked fine. One extra reference and the shortcut disappears. <code>"".join(parts)</code> is always O(n).</p>
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
print(f"s + 'x' (only name)  : {t(concat_plain):7.1f} ms")
print(f"s + 'x' (2nd ref)    : {t(concat_shared):7.1f} ms")</div>
  <div class="fx" data-lang="text">s + 'x' (only name)  :     3.8 ms
s + 'x' (2nd ref)    :   179.4 ms</div>

  <h2 id="dsa-cx-habit"><span class="num">09</span>Hands-on: Analyse Like an Interviewer</h2>
  <p>After every solution, say the complexity out loud before the interviewer asks. Three steps, always in this order.</p>
  <div class="flow"><span>1. Count the loops</span><span>2. Check the loop body</span><span>3. State time AND space</span></div>
  <p>Try it on this function, which finds the first number that appears twice in a list. Decide the time and space before reading the comments.</p>
  <div class="callout pred"><span class="label">Predict</span>
    <p>One loop, a <code>sorted()</code> inside the loop, and a set. What are the time and space?</p>
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
print(weird([3, 1, 4, 1, 5]))</div>
  <div class="fx" data-lang="text">1</div>
  <p>Remove the useless <code>sorted</code> line and the same function is O(n) time, O(n) space. That is the most common interview fix: find the hidden cost in the body and take it out, or replace a list scan with a set.</p>
  <p>Now a full rewrite from slow to fast, with the trade stated: "Do these two lists share any number?"</p>
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
a = random.sample(range(10**7), 20_000)
b = random.sample(range(10**7), 20_000)
for f in (common_slow, common_fast):
    t = time.perf_counter(); r = f(a, b)
    print(f"{f.__name__:12s} answer={r}  {(time.perf_counter()-t)*1000:8.1f} ms")</div>
  <div class="fx" data-lang="text">common_slow  answer=True     162.6 ms
common_fast  answer=True       1.6 ms</div>
  <div class="callout intu"><span class="label">Say it like this</span>
    <p>"The brute force is O(n·m) time and O(1) space. I will put list b into a set, which costs O(m) space, and then each lookup is O(1), so total time is O(n + m)." Name the brute force, name the trade, name both time and space.</p>
  </div>

  <h2 id="dsa-cx-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we count steps instead of measuring seconds?</summary><div class="qa-body">Seconds depend on the machine, the language and what else is running. Step count as a function of n is the same everywhere and tells you what happens when the input grows. Big-O keeps only the fastest-growing term of that count.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Big-O of 5n² + 100n + 3, and why?</summary><div class="qa-body">O(n²). For large n the n² term dominates everything else, and the constant 5 does not change how the count grows when n doubles (it still becomes 4×).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give an example of O(log n) and explain where the log comes from.</summary><div class="qa-body">Binary search on a sorted list. Each step throws away half the remaining items, so after k steps only n / 2ᵏ remain; it ends when that reaches 1, i.e. k = log₂ n. 10 lakh items need about 20 steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A function has a single for-loop. Can it still be O(n²)?</summary><div class="qa-body">Yes, if the loop body does O(n) work: <code>x in some_list</code>, <code>list.insert(0, x)</code>, <code>pop(0)</code>, a slice, or <code>sort()</code>. The body cost multiplies the loop count.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is list.append O(1) if resizing copies the whole list?</summary><div class="qa-body">Resizes are rare and get rarer: the block grows by a factor, so n appends cause only about log n resizes and the total copy work is O(n). Spread over n appends that is O(1) each, called amortized O(1). The run above showed 86 resizes in 10 lakh appends.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is x in list O(n) but x in set O(1)?</summary><div class="qa-body">A list has no idea where x could be, so it checks slot by slot. A set computes hash(x), takes it modulo the table size, and jumps to that bucket; only collisions cause a few extra probes. 1000 lookups took 437 ms with a list and 0.3 ms with a set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a dict lookup O(n)?</summary><div class="qa-body">Only when almost every key lands in the same bucket, e.g. a custom class whose <code>__hash__</code> returns a constant, or a deliberate attack with crafted keys. With normal keys say "O(1) average".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a list be a dict key?</summary><div class="qa-body">The bucket is chosen from the hash of the key. A list can change after insertion, so its hash would change and the entry would be lost. Python forbids it (<code>TypeError: unhashable type</code>). A tuple of the same values works because it cannot change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the space complexity of a recursive function that goes n levels deep?</summary><div class="qa-body">O(n): every paused call keeps a frame on the call stack. Python's default limit is 1000 frames, so deep recursion raises <code>RecursionError</code>; convert to a loop or use an explicit stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two inputs: a list of size n and a list of size m, nested loops over both. Complexity?</summary><div class="qa-body">O(n·m) time, not O(n²). Different inputs keep different letters; you cannot assume they are the same size. Loops one after the other would be O(n + m).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is "".join(parts) preferred over s += ch in a loop?</summary><div class="qa-body">Strings are immutable, so + builds a new string and copies the old one; over n steps that is O(n²). join measures the total length once and copies once, O(n). CPython sometimes optimises += in place, but only if nothing else refers to the string, so do not rely on it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The input limit says n ≤ 10⁵. Which complexities are acceptable?</summary><div class="qa-body">O(n), O(n log n) comfortably; O(n²) is 10¹⁰ steps, far too slow. So the expected solution uses a hash map, sorting, two pointers or a heap, not nested loops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does list.pop(0) cost and what should you use instead for a queue?</summary><div class="qa-body">O(n): every remaining item shifts left by one slot. Use <code>collections.deque</code>, whose <code>popleft</code> and <code>appendleft</code> are O(1).</div></details>
</main>`
});
