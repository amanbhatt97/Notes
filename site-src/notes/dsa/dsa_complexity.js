// notes/dsa/dsa_complexity.js — Complexity & Python Internals
Object.assign(TOPIC_CONTENT, {
  "dsa_complexity": `<main>
<h1>Complexity &amp; Python Internals</h1>
  <div class="where"><span>DSA</span><span>Foundations</span><span>Complexity &amp; Python Internals</span></div>
  <p class="lead">Two programs can give exactly the same answer and still differ in speed by a factor of a thousand, and the difference only shows up when the data gets big. <strong>Complexity analysis</strong> is the skill of predicting that difference from the code itself, before you run it: how much more work (time) and how much more memory (space) a program needs as its input grows. Every interview answer ends with "this is O(n) time and O(1) space", every problem statement hides a hint about the expected speed in its input limits, and every later note in this track quotes these labels, so this is the vocabulary for all of them. The running example is Biteful, a small food-delivery company, and the 8 charges (in rupees) its payment gateway made on one quiet day: <b>[120, 80, 250, 40, 310, 80, 60, 200]</b>. The Arrays, Hashing and Linked Lists notes use the same numbers. All outputs below are real runs on Python 3.13; timings depend on the machine, so treat them as approximate.</p>

  <h2 id="dsa-cx-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Complexity &amp; Python Internals</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Measuring work</div>
        <ul>
          <li>Count steps as a function of input size <b>n</b>, not seconds</li>
          <li>Usually the <b>worst case</b> input</li>
          <li><b>Big-O</b>: keep the fastest-growing term, drop constants</li>
          <li>Nested loops multiply, loops in sequence add</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The classes</div>
        <ul>
          <li>O(1) &lt; O(log n) &lt; O(n) &lt; O(n log n) &lt; O(n²) &lt; O(2ⁿ)</li>
          <li>log n = "halve each step" (binary search)</li>
          <li>Space = extra memory; recursion uses stack space</li>
          <li><b>Amortised</b> O(1): rare expensive steps averaged out</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python's containers</div>
        <ul>
          <li><b>list</b> = dynamic array: <code>a[i]</code>, <code>append</code> O(1); <code>insert(0)</code>, <code>x in a</code> O(n)</li>
          <li><b>dict / set</b> = hash table: lookup O(1) average</li>
          <li><code>deque</code> for both ends; <code>"".join</code> for strings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using it</div>
        <ul>
          <li>Python ≈ 10⁷ simple steps per second</li>
          <li>n ≤ 20 → 2ⁿ ok; n ≤ 10⁴ → n² ok; n ≤ 10⁵–10⁶ → n log n or n</li>
          <li>Always state time AND space</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-cx-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Speed Needs Measuring</span><span class="rm-sub">two correct programs, very different speeds</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-steps"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Counting Steps</span><span class="rm-sub">work as a function of n, worst case</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-bigo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Big-O Notation</span><span class="rm-sub">one short label for how work grows</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-classes"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Common Growth Classes</span><span class="rm-sub">O(1) to O(2ⁿ), measured</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-space"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Space Complexity</span><span class="rm-sub">extra memory, and trading it for time</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-amort"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Amortised Cost</span><span class="rm-sub">why append is O(1) though it sometimes copies</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-list"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Inside a Python List</span><span class="rm-sub">one block of slots, and what it makes slow</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-dict"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Inside dict and set</span><span class="rm-sub">hash tables, and the cost of every operation</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-recur"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Recursion and the Call Stack</span><span class="rm-sub">the hidden memory of a function calling itself</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-constraints"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Reading Constraints</span><span class="rm-sub">from "n ≤ 10⁵" to the Big-O you need</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">hidden loops, copies and stack frames</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">rules, classes, cost tables</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-cx-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about complexity</span></div></div>
    </div>
  </div>

  <h2 id="dsa-cx-need"><span class="num">01</span>Why Speed Needs Measuring</h2>
  <p>Biteful's finance team has a worry: the payment gateway sometimes sends the same charge twice. They want a check that answers one question: <strong>does any value appear more than once?</strong> In today's 8 charges the answer is yes, because 80 appears at positions 1 and 5. On a busy day the same check has to run over tens of thousands of charge ids.</p>
  <p>Here are two programs that both solve it. Each walks through the charges once and remembers what it has already seen. The only difference is the container used for remembering: the first uses a list, the second uses a set. We run both on today's charges, then on bigger and bigger lists of ids that contain no repeat at all, which forces each program to do the most work it can.</p>
  <div class="fx" data-lang="py">import time, random

def has_repeat_list(charges):        # remember what we have seen in a LIST
    seen = []
    for c in charges:
        if c in seen:                # Python compares c with every item in seen
            return True
        seen.append(c)
    return False

def has_repeat_set(charges):         # remember what we have seen in a SET
    seen = set()
    for c in charges:
        if c in seen:                # Python jumps straight to one slot
            return True
        seen.add(c)
    return False

today = [120, 80, 250, 40, 310, 80, 60, 200]
print("today:", has_repeat_list(today), has_repeat_set(today))

random.seed(7)
for n in [1_000, 10_000, 40_000]:
    ids = random.sample(range(10**9), n)     # n different ids: no repeat, the worst case
    t = time.perf_counter(); has_repeat_list(ids); t1 = time.perf_counter() - t
    t = time.perf_counter(); has_repeat_set(ids); t2 = time.perf_counter() - t
    print(f"n={n:&gt;6,}   list {t1:7.3f} s   set {t2:.4f} s")</div>
  <div class="fx" data-lang="text">today: True True
n= 1,000   list   0.003 s   set 0.0001 s
n=10,000   list   0.376 s   set 0.0009 s
n=40,000   list   4.316 s   set 0.0058 s</div>
  <p>Both programs agree on every input, so both are correct. On 1,000 ids nobody would notice a difference. But look at the list column as the input grows: 10 times more ids made it far more than 10 times slower, and at 40,000 ids it needs several seconds while the set version still finishes in a few milliseconds. The two programs are almost word for word the same, yet one is several hundred times slower on big input, and the gap keeps widening as n grows.</p>
  <p>Think of a watchman at a stadium gate who must stop anyone trying to enter twice. The first watchman keeps every pass he has checked in a pile, and for each new person he flips through the whole pile. The second has a cabinet with one labelled drawer per pass number and simply opens the right drawer. With eight visitors both are fine. With a stadium crowd, the first watchman is still flipping when the match ends.</p>
  <p>This is the problem complexity analysis exists to solve. Running both programs on big data told us which one is slow, but only after we had written both and waited. In an interview, or when designing a real system, you need to know <em>before</em> running anything. The rest of this note builds that skill: a way to look at code and say how its cost grows as the input grows. That growth is called the code's <strong>efficiency</strong>, and the main lesson of this section is that efficiency only shows itself at large inputs. A test on 8 or 1,000 items hides it completely, which is why online judges and real systems always try the largest input allowed.</p>

  <h2 id="dsa-cx-steps"><span class="num">02</span>Counting Steps</h2>
  <p>Seconds are a poor measure of code, because they change with the laptop, the Python version and whatever else the machine is doing. What stays the same everywhere is the number of basic <strong>steps</strong> the program performs: one comparison, one addition, one lookup. And because the interesting question is how the work grows, we write the step count as a function of the input size, which is always called <strong>n</strong> (here, the number of charges).</p>
  <p>The secret of the slow program is hidden inside the innocent-looking line <code>c in seen</code>. When <code>seen</code> is a list, Python answers that question by comparing <code>c</code> with each item of the list in turn, so a single line is really a whole loop. The code below makes that hidden loop visible and counts every comparison, and counts one lookup per charge for the set version:</p>
  <div class="fx" data-lang="py">def steps_list(charges):             # count the comparisons hidden inside "c in seen"
    seen, steps = [], 0
    for c in charges:
        for s in seen:
            steps += 1
            if s == c:
                return steps
        seen.append(c)
    return steps

def steps_set(charges):              # one lookup per charge
    seen, steps = set(), 0
    for c in charges:
        steps += 1
        if c in seen:
            return steps
        seen.add(c)
    return steps

today = [120, 80, 250, 40, 310, 80, 60, 200]
print("today: list", steps_list(today), " set", steps_set(today))
for n in [8, 100, 1_000, 3_000]:
    ids = list(range(n))             # all different: the worst case
    print(f"n={n:&gt;5,}  list={steps_list(ids):&gt;9,}  n(n-1)/2={n*(n-1)//2:&gt;9,}  set={steps_set(ids):&gt;5,}")</div>
  <div class="fx" data-lang="text">today: list 12  set 6
n=    8  list=       28  n(n-1)/2=       28  set=    8
n=  100  list=    4,950  n(n-1)/2=    4,950  set=  100
n=1,000  list=  499,500  n(n-1)/2=  499,500  set=1,000
n=3,000  list=4,498,500  n(n-1)/2=4,498,500  set=3,000</div>
  <p>On today's charges the list version needed 12 comparisons before it found the repeated 80, and the set version 6 lookups. The real story is in the worst case, where there is no repeat. The first charge is compared with nothing, the second with 1 earlier charge, the third with 2, and so on, so the total is 0 + 1 + 2 + … + (n − 1), which adds up to <strong>n(n − 1)/2</strong>. The counted numbers match that formula exactly: 28 for 8 charges, nearly 4.5 million for 3,000. The set version does exactly n lookups. For 1 lakh charges, that is about 5 billion comparisons against 1 lakh lookups.</p>
  <p>Notice that we measured the <strong>worst case</strong>: the input that makes the program do the most work. That is the usual convention, because a program that is fine on typical input but collapses on one bad input is still a bad program. You will also hear about the <strong>best case</strong> (here, a repeat in the first two charges, which stops immediately) and the <strong>average case</strong>, but when someone asks "what is the complexity?" without saying more, they mean the worst case.</p>
  <p>Counting steps also shows why some algorithms are fast in a way that is not obvious. Suppose finance wants to find the ₹310 charge, and the charges are sorted. A <strong>linear search</strong> reads them one by one from the left. A <strong>binary search</strong> looks at the middle charge, decides which half must contain 310, throws the other half away, and repeats. It is the way you look up a word in a paper dictionary: open the middle, see that your word comes later, and never look at the first half again.</p>
  <div class="fx" data-lang="py">def linear_search(a, target):
    steps = 0
    for i, x in enumerate(a):
        steps += 1
        if x == target:
            return i, steps
    return -1, steps

def binary_search(a, target, show=False):   # a must be sorted
    lo, hi, steps = 0, len(a) - 1, 0
    while lo &lt;= hi:
        steps += 1
        mid = (lo + hi) // 2
        if show:
            print(f"  look {steps}: lo={lo} hi={hi} mid={mid} a[mid]={a[mid]}")
        if a[mid] == target:
            return mid, steps
        if a[mid] &lt; target:
            lo = mid + 1                    # 310 must be in the right half
        else:
            hi = mid - 1                    # 310 must be in the left half
    return -1, steps

charges = sorted([120, 80, 250, 40, 310, 80, 60, 200])
print("sorted:", charges)
print("linear:", linear_search(charges, 310))
print("binary:", binary_search(charges, 310, show=True))
for n in [1_000, 1_000_000]:
    book = list(range(n))
    print(f"n={n:&gt;9,}  linear {linear_search(book, n - 1)[1]:&gt;9,} steps   binary {binary_search(book, n - 1)[1]} steps")</div>
  <div class="fx" data-lang="text">sorted: [40, 60, 80, 80, 120, 200, 250, 310]
linear: (7, 8)
  look 1: lo=0 hi=7 mid=3 a[mid]=80
  look 2: lo=4 hi=7 mid=5 a[mid]=200
  look 3: lo=6 hi=7 mid=6 a[mid]=250
  look 4: lo=7 hi=7 mid=7 a[mid]=310
binary: (7, 4)
n=    1,000  linear     1,000 steps   binary 10 steps
n=1,000,000  linear 1,000,000 steps   binary 20 steps</div>
  <p>On the 8 sorted charges, linear search needed 8 looks and binary search 4: the trace shows the range shrinking from positions 0–7 to 4–7 to 6–7 to just 7. The difference becomes dramatic as n grows. With a million items, the linear scan needs a million steps and binary search needs 20. The reason is that each look halves what is left: after k looks, n / 2ᵏ items remain, and the search ends when only one is left, which happens when k is about log₂ n. A <strong>logarithm</strong> here simply answers "how many times can I halve n before I reach 1?". For a thousand that is about 10, for a million about 20, and for a billion about 30. (Binary search only works because the data is sorted; the <a class="xref" data-note="dsa_binsearch">Binary Search</a> note covers it fully.)</p>

  <h2 id="dsa-cx-bigo"><span class="num">03</span>Big-O Notation</h2>
  <p>Exact step counts quickly get messy. A real function might take n(n − 1)/2 + n + 2 steps, and if you counted slightly differently (is <code>s = 0</code> a step?) you would get a slightly different formula. What we actually care about is simpler: <strong>if n doubles, how much more work is it?</strong> For 3n + 7 the answer is "about twice as much". For n²/2 + n it is "about four times as much". Those answers depend only on the part of the formula that grows fastest.</p>
  <p><strong>Big-O notation</strong> is the short label that keeps only that part. To find it, you take the step count, keep the fastest-growing term (the <strong>dominant term</strong>) and throw away its constant multiplier and every smaller term. So n + 1 becomes O(n), read "order n" or "linear", and n(n − 1)/2 = ½n² − ½n becomes O(n²), "quadratic". A shopping bill works the same way: if rice costs ₹60 a kilo and the carry bag ₹10, then for a 100 kg order the bag hardly matters and the bill is basically "60 × the kilos". Big-O keeps the rice and drops the bag.</p>
  <p>To see that this really captures behaviour, here are three small functions on Biteful's charges, each counting its own steps. A adds up the day's total in one pass. B checks every pair of charges to see if they make a ₹280 combo. C runs A, then B, then one more step. We run them on the 8 charges, then on 16, 32 and 64 (the same day repeated), and print how much each count grew when n doubled:</p>
  <div class="fx" data-lang="py">def total(charges):                  # A: add up the day, one pass
    steps = 1                        # s = 0
    s = 0
    for c in charges:
        s += c
        steps += 1                   # one addition per charge
    return steps

def pairs_to(charges, target):       # B: check every pair for a combo
    steps, combos = 0, 0
    for i in range(len(charges)):
        for j in range(i + 1, len(charges)):
            steps += 1               # one comparison per pair
            if charges[i] + charges[j] == target:
                combos += 1
    return steps

def report(charges):                 # C: A, then B, then one more step
    return total(charges) + pairs_to(charges, 280) + 1

today = [120, 80, 250, 40, 310, 80, 60, 200]
prev = None
for k in [1, 2, 4, 8]:
    data = today * k                 # 8, 16, 32, 64 charges
    row = (total(data), pairs_to(data, 280), report(data))
    grow = "" if prev is None else "   growth  " + "  ".join(f"x{r / p:.2f}" for r, p in zip(row, prev))
    print(f"n={len(data):&gt;2}  A={row[0]:&gt;3}  B={row[1]:&gt;4}  C={row[2]:&gt;4}{grow}")
    prev = row</div>
  <div class="fx" data-lang="text">n= 8  A=  9  B=  28  C=  38
n=16  A= 17  B= 120  C= 138   growth  x1.89  x4.29  x3.63
n=32  A= 33  B= 496  C= 530   growth  x1.94  x4.13  x3.84
n=64  A= 65  B=2016  C=2082   growth  x1.97  x4.06  x3.93</div>
  <p>A grows by ×1.89, ×1.94, ×1.97, heading towards ×2, which is what O(n) predicts. B grows by about ×4 each time, the signature of O(n²). C is the interesting one: it contains a whole O(n) pass, yet it grows like B, because at large n the pairs swamp everything else. So C is O(n²) as well. That is the "keep only the dominant term" rule in action, and it is why Big-O is useful: it predicts behaviour at large n without needing the exact formula.</p>
  <p>A few rules let you find the Big-O of most code just by reading it. Loops in sequence <strong>add</strong>: a loop over the charges followed by another loop over them is n + n = 2n, still O(n). Nested loops <strong>multiply</strong>: a loop inside a loop over the same list is n × n = O(n²). If there are two different inputs, give them different letters: comparing every charge from today (n of them) with every charge from yesterday (m of them) is O(n·m), not O(n²), because nobody promised the two lists are the same size. And always look inside the loop body: a single loop that does an O(n) operation each time round, such as <code>x in some_list</code>, <code>list.insert(0, x)</code>, a slice or a sort, is O(n²) overall. The slow program in section 01 was exactly that: one visible loop, with an invisible O(n) scan inside it.</p>
  <p>Strictly speaking, Big-O is an <em>upper bound</em>: O(f(n)) means "for large n, the work grows no faster than some constant times f(n)". Textbooks also define Big-Omega, Ω(f(n)), a lower bound ("at least this fast-growing"), and Big-Theta, Θ(f(n)), when both bounds match. In interviews and everyday speech, "O(n)" is used to mean the tight bound, and that is how this track uses it. Finally, remember that Big-O describes growth, not speed: an O(n) program with a huge constant can lose to an O(n²) one at n = 8, but it will always win once n is large enough.</p>

  <h2 id="dsa-cx-classes"><span class="num">04</span>The Common Growth Classes</h2>
  <p>Almost all the code you will meet in interviews falls into six Big-O classes. It helps to know them as a ladder from cheapest to most expensive, with one picture for each. <strong>O(1)</strong>, constant time, means the work does not depend on n at all, like reading <code>charges[5]</code> or <code>len(charges)</code>. <strong>O(log n)</strong> means each step throws away a fixed fraction of the problem, like binary search. <strong>O(n)</strong> means touching every item once, like summing the charges. <strong>O(n log n)</strong> is the cost of good sorting algorithms such as Python's <code>sorted()</code>. <strong>O(n²)</strong> means every item against every other item, typically nested loops. <strong>O(2ⁿ)</strong> means every item is either picked or skipped, so the number of possibilities doubles with every extra item; listing all subsets is the classic example.</p>
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
</svg><figcaption>The same n on the x-axis for every class. O(1) and O(log n) barely notice a bigger input; O(n) rises in a straight line; O(n log n) curves gently upwards; O(n²) and O(2ⁿ) shoot off the chart almost immediately.</figcaption></figure>
  <p>The picture gives the shape, but the numbers are what make it real. First, how many steps each label means for n from 10 to 10 lakh:</p>
  <div class="fx" data-lang="py">import math
print(f"{'n':&gt;9} {'log n':&gt;6} {'n log n':&gt;11} {'n^2':&gt;17}")
for n in [10, 100, 1_000, 10_000, 100_000, 1_000_000]:
    print(f"{n:&gt;9,} {math.ceil(math.log2(n)):&gt;6} {round(n * math.log2(n)):&gt;11,} {n * n:&gt;17,}")</div>
  <div class="fx" data-lang="text">        n  log n     n log n               n^2
       10      4          33               100
      100      7         664            10,000
    1,000     10       9,966         1,000,000
   10,000     14     132,877       100,000,000
  100,000     17   1,660,964    10,000,000,000
1,000,000     20  19,931,569 1,000,000,000,000</div>
  <p>At n = 1,000 the gap between n log n (about 10,000) and n² (a million) is already a factor of 100. At n = 10 lakh, n log n is about 20 million steps, which Python handles in a second or two, while n² is a trillion, which would take days. Now real stopwatch times on this machine, one small function per class, for the same sizes. Each cell is the time for one call:</p>
  <div class="fx" data-lang="py">import timeit, bisect, random

def per_call(f, a):                  # run f(a) repeatedly for ~0.2 s, return seconds per call
    number, total = timeit.Timer(lambda: f(a)).autorange()
    return total / number

def o1(a):     return a[len(a) // 2]                # jump to one slot
def ologn(a):  return bisect.bisect_left(a, -1)     # binary search (a is sorted)
def on(a):     return sum(a)                        # touch every item
def onlogn(a): return sorted(a)                     # sort
def on2(a):                                         # every pair
    c = 0
    for x in a:
        for y in a:
            c += 1
    return c

def fmt(s):
    return f"{s*1e6:7.2f} us" if s &lt; 1e-3 else (f"{s*1e3:7.2f} ms" if s &lt; 1 else f"{s:7.2f} s ")

random.seed(0)
print(f"{'n':&gt;9} {'O(1)':&gt;10} {'O(log n)':&gt;10} {'O(n)':&gt;10} {'O(n log n)':&gt;10} {'O(n^2)':&gt;10}")
for n in [10, 100, 1_000, 10_000, 100_000, 1_000_000]:
    a = random.sample(range(10 * n), n)
    s = sorted(a)
    cells = [fmt(per_call(f, x)) for f, x in [(o1, a), (ologn, s), (on, a), (onlogn, a)]]
    cells.append(fmt(per_call(on2, a)) if n &lt;= 10_000 else "   skipped")
    print(f"{n:&gt;9,} " + " ".join(f"{c:&gt;10}" for c in cells))</div>
  <div class="fx" data-lang="text">        n       O(1)   O(log n)       O(n) O(n log n)     O(n^2)
       10    0.07 us    0.07 us    0.11 us    0.17 us    1.52 us
      100    0.05 us    0.08 us    0.62 us    2.71 us  246.95 us
    1,000    0.10 us    0.11 us    5.79 us   56.79 us   17.84 ms
   10,000    0.07 us    0.12 us   76.16 us    1.23 ms    1.80 s 
  100,000    0.07 us    0.13 us    1.48 ms   25.15 ms    skipped
1,000,000    0.11 us    0.20 us    8.05 ms  353.20 ms    skipped</div>
  <p>Read it column by column. O(1) does not move: a tenth of a microsecond whatever n is. O(log n) barely moves. O(n) grows about 10× per row, as n does. O(n log n) grows a little more than 10× per row and is still well under a second at 10 lakh. O(n²) grows about 100× per row: tens of milliseconds at 1,000, a couple of seconds at 10,000, so minutes at 1 lakh, which is why it is skipped. Notice also the first two rows, where every class is instant. That is the trap of testing only on small input. O(2ⁿ) is in a different league again:</p>
  <div class="fx" data-lang="py">import time
def all_subsets(items):              # every item is either picked or skipped
    out = [[]]
    for x in items:
        out += [s + [x] for s in out]
    return out

for n in [10, 15, 20, 22]:
    t = time.perf_counter()
    k = len(all_subsets(list(range(n))))
    print(f"n={n}  subsets={k:&gt;9,}  time={(time.perf_counter() - t) * 1000:7.1f} ms")</div>
  <div class="fx" data-lang="text">n=10  subsets=    1,024  time=    0.1 ms
n=15  subsets=   32,768  time=    9.4 ms
n=20  subsets=1,048,576  time=  638.6 ms
n=22  subsets=4,194,304  time= 3599.2 ms</div>
  <p>Every 5 extra items multiplies the time by roughly 30 to 100, and 22 items already take seconds; 40 items would take years. Exponential algorithms are only usable for very small n, which is why problem statements that allow them say so with limits like n ≤ 20. The practical rule that comes out of this section is that moving an algorithm down one class (from O(n²) to O(n log n), say) matters far more at large n than any amount of tuning inside a class.</p>

  <h2 id="dsa-cx-space"><span class="num">05</span>Space Complexity</h2>
  <p>Time is not the only thing a program spends. The fast duplicate check in section 01 won by storing every charge it saw in a set. That set grows with the input, so the program bought its speed with memory. <strong>Space complexity</strong> describes how much <em>extra</em> memory an algorithm needs as n grows, using the same Big-O labels. The input itself is not counted, because it was there before the algorithm started. A handful of variables is O(1) space; a new list, set or dict with one entry per input item is O(n).</p>
  <p>Think of marking a 50-page answer sheet. Ticking answers on the sheet itself with one pen needs no extra paper: O(1) space. Copying every answer into a fresh notebook first needs 50 more pages: O(n) space. An algorithm that works entirely inside its input, like reversing a list by swapping from both ends, is called <strong>in place</strong>; one that builds a reversed copy with <code>charges[::-1]</code> uses O(n) extra space.</p>
  <p>Here is how much memory three correct duplicate checks actually keep while they run on 1 lakh charge ids. Python's <code>tracemalloc</code> module measures the bytes allocated by a piece of code:</p>
  <div class="fx" data-lang="py">import tracemalloc, random
random.seed(7)
ids = random.sample(range(10**9), 100_000)    # the input itself is not counted

def extra_mb(build):                          # memory the solution keeps while it runs
    tracemalloc.start()
    kept = build()
    used = tracemalloc.get_traced_memory()[0]
    tracemalloc.stop()
    return used / 1e6

def sort_then_scan():                         # sort in place, compare neighbours
    ids.sort()
    return any(ids[i] == ids[i + 1] for i in range(len(ids) - 1))

print(f"seen as a list: {extra_mb(lambda: list(ids)):.2f} MB")
print(f"seen as a set : {extra_mb(lambda: set(ids)):.2f} MB")
print(f"sort + scan   : {extra_mb(sort_then_scan):.2f} MB")</div>
  <div class="fx" data-lang="text">seen as a list: 0.80 MB
seen as a set : 4.19 MB
sort + scan   : 0.00 MB</div>
  <p>Keeping the seen ids in a list costs 0.8 MB, which is 8 bytes per id for the list's slots. The set costs about five times more, because a hash table deliberately keeps spare empty slots (section 08 explains why). The third approach, sorting the ids in place and then comparing neighbours, keeps essentially nothing new, but it pays in time, O(n log n) for the sort, and it rearranges the input. So we have three correct solutions with three different trade-offs:</p>
  <table class="tbl">
    <tr><th>Approach</th><th>Time</th><th>Extra space</th><th>What it costs you</th></tr>
    <tr><td>list of seen charges</td><td>O(n²)</td><td>O(n)</td><td>far too slow at large n</td></tr>
    <tr><td>set of seen charges</td><td>O(n)</td><td>O(n)</td><td>memory (~4 MB for 1 lakh ids)</td></tr>
    <tr><td>sort, then compare neighbours</td><td>O(n log n)</td><td>O(1)</td><td>slower than the set; input order is lost</td></tr>
  </table>
  <p>This exchange of memory for speed, called the <strong>time–space trade-off</strong>, is one of the most common ideas in the whole DSA track, and interviewers like to hear it stated out loud: "This is O(n) time and O(n) space. If memory is tight I can sort first for O(1) extra space, but then it is O(n log n) time and the original order is lost." Two kinds of space are easy to forget. Every slice, <code>sorted()</code> call or <code>a + b</code> builds a new list, so it costs O(n) extra space each time. And recursion uses memory even when it builds no list at all, because every call that is still waiting keeps its own record; section 09 shows this.</p>

  <h2 id="dsa-cx-amort"><span class="num">06</span>Amortised Cost</h2>
  <p>Both duplicate checks grew their container one item at a time, with <code>append</code> or <code>add</code>. That raises a question. A Python list stores its items in one continuous block of memory (the next section shows why). When the block is full and you append one more item, Python has to get a bigger block and copy every existing item across, which costs O(n). So is <code>append</code> O(1) or O(n)?</p>
  <p>The answer is "O(1) amortised", and the reason is that Python never grows the block by just one slot. When it has to grow, it reserves extra spare slots, so the next several appends are free. We can watch this happen with <code>sys.getsizeof</code>, which reports the bytes a list uses; each slot is an 8-byte pointer, so the change in bytes tells us how many slots are reserved:</p>
  <div class="fx" data-lang="py">import sys
orders = []
empty = sys.getsizeof(orders)                 # bytes used by an empty list
for amount in [120, 80, 250, 40, 310, 80, 60, 200]:
    before = sys.getsizeof(orders)
    orders.append(amount)
    after = sys.getsizeof(orders)
    slots = (after - empty) // 8              # each slot holds one 8-byte pointer
    note = "&lt;- full: new block, old items copied" if after != before else ""
    print(f"append {amount:&gt;3}  len={len(orders)}  slots reserved={slots}  {note}")</div>
  <div class="fx" data-lang="text">append 120  len=1  slots reserved=4  &lt;- full: new block, old items copied
append  80  len=2  slots reserved=4  
append 250  len=3  slots reserved=4  
append  40  len=4  slots reserved=4  
append 310  len=5  slots reserved=8  &lt;- full: new block, old items copied
append  80  len=6  slots reserved=8  
append  60  len=7  slots reserved=8  
append 200  len=8  slots reserved=8</div>
  <p>Only 2 of the 8 appends caused a resize. The first append reserved 4 slots, so appends 2 to 4 cost nothing extra. The fifth found the block full, moved to a block of 8 slots and copied the 4 existing items; appends 6 to 8 were free again. The same pattern holds at any size, and resizes get rarer as the list grows:</p>
  <div class="fx" data-lang="py">import sys
a, last, resizes = [], sys.getsizeof([]), 0
for i in range(1_000_000):
    a.append(i)
    if sys.getsizeof(a) != last:             # the block changed size: a resize happened
        resizes += 1
        last = sys.getsizeof(a)
print("1,000,000 appends, real resizes:", resizes)

def doubling_copies(n):                      # textbook model: double when full
    cap, size, copies = 1, 0, 0
    for _ in range(n):
        if size == cap:
            copies += size                   # copy every existing item
            cap *= 2
        size += 1
    return copies
for n in [8, 1_000, 1_000_000]:
    c = doubling_copies(n)
    print(f"n={n:&gt;9,}  total copies={c:&gt;9,}  copies per append={c / n:.2f}")</div>
  <div class="fx" data-lang="text">1,000,000 appends, real resizes: 86
n=        8  total copies=        7  copies per append=0.88
n=    1,000  total copies=    1,023  copies per append=1.02
n=1,000,000  total copies=1,048,575  copies per append=1.05</div>
  <p>A million appends caused only 86 real resizes. The second half of the output uses the simple textbook model, "double the size when full", to count copying work. The copies add up to 1 + 2 + 4 + 8 + …, a sum that never reaches 2n, so on average each append pays for about one copy. One append may be expensive, but n appends together cost O(n), so the cost per append averages out to O(1). That is exactly what <strong>amortised cost</strong> means: the average cost per operation over any long sequence of operations, as opposed to the cost of the single worst operation. (CPython actually grows lists by about 12% rather than doubling, but any growth by a constant factor gives the same result.)</p>
  <p>Moving house is a good picture. Moving day is a big, expensive job. But you move into a bigger house, and for years afterwards each new item simply goes onto a free shelf. Spread the moving cost over all those easy years and each item cost very little. The same reasoning makes <code>dict</code> and <code>set</code> insertion O(1) amortised, because hash tables also rebuild themselves bigger when they fill up. One caution: amortised O(1) is a guarantee about totals, not about each call. A system that can never tolerate one slow operation, such as a real-time controller, needs a different structure.</p>

  <h2 id="dsa-cx-list"><span class="num">07</span>Inside a Python List</h2>
  <p>Knowing the cost of each list operation is far easier when you can picture what a list is in memory, because then the costs stop being facts to memorise and become obvious. A Python list is a <strong>dynamic array</strong>: one continuous block of equal-size slots, with some spare slots at the end, that is replaced by a bigger block when it runs out. Each slot holds the memory address of one Python object, and every address takes 8 bytes on a 64-bit machine.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="10" y="18" class="tm">charges = [120, 80, 250, 40]     start address = 1000, each slot 8 bytes</text>
<rect x="60" y="34" width="80" height="34" class="fb sb"/><rect x="140" y="34" width="80" height="34" class="fb sb"/><rect x="220" y="34" width="80" height="34" class="fb sb"/><rect x="300" y="34" width="80" height="34" class="fb sb"/><rect x="380" y="34" width="80" height="34" class="fs" stroke="currentColor"/><rect x="460" y="34" width="80" height="34" class="fs" stroke="currentColor"/>
<text x="100" y="56" text-anchor="middle">120</text><text x="180" y="56" text-anchor="middle">80</text><text x="260" y="56" text-anchor="middle">250</text><text x="340" y="56" text-anchor="middle">40</text><text x="420" y="56" text-anchor="middle" class="tm">spare</text><text x="500" y="56" text-anchor="middle" class="tm">spare</text>
<text x="100" y="84" text-anchor="middle" class="tm" font-size="11">1000</text><text x="180" y="84" text-anchor="middle" class="tm" font-size="11">1008</text><text x="260" y="84" text-anchor="middle" class="tm" font-size="11">1016</text><text x="340" y="84" text-anchor="middle" class="tm" font-size="11">1024</text>
<text x="100" y="100" text-anchor="middle" class="tb" font-size="11">a[0]</text><text x="180" y="100" text-anchor="middle" class="tb" font-size="11">a[1]</text><text x="260" y="100" text-anchor="middle" class="tb" font-size="11">a[2]</text><text x="340" y="100" text-anchor="middle" class="tb" font-size="11">a[3]</text>
<text x="10" y="135" class="tm">a[3] → 1000 + 8 × 3 = 1024: one multiply, one jump. The length (4) is stored separately.</text>
</svg><figcaption>Slots sit side by side and are all the same size, so the address of any index is one small calculation away. The grey slots are the spare room that makes appends cheap.</figcaption></figure>
  <p>Walk through the picture. The list starts at address 1000. Slot 0 is at 1000, slot 1 at 1008, slot 2 at 1016, and in general slot i is at <code>1000 + 8 × i</code>. To read <code>a[3]</code>, Python does one multiplication and one addition, gets 1024, and jumps there. It does not matter whether the list has 4 items or 4 million: indexing is O(1). This ability to reach any position directly is called <strong>random access</strong>, and it is the one thing arrays do better than any other structure. The length is stored as a number next to the block, so <code>len(a)</code> is O(1) too, and appending only fills the next spare slot.</p>
  <p>The same picture explains the slow operations. Inserting at the front means every existing item must move one slot to the right to make room, so <code>insert(0, x)</code> costs n moves; removing from the front with <code>pop(0)</code> shifts everything left. Checking <code>x in a</code> has no way to know where x might be, so it reads slot after slot. Suppose Biteful wants to push urgent orders to the front of its delivery queue, 1 lakh times:</p>
  <div class="fx" data-lang="py">import time
from collections import deque

def timed(f):
    t = time.perf_counter(); f(); return (time.perf_counter() - t) * 1000

n = 100_000
def front_of_list():
    q = []
    for i in range(n): q.insert(0, i)        # every insert shifts the whole list right
def end_of_list():
    q = []
    for i in range(n): q.append(i)
def front_of_deque():
    q = deque()
    for i in range(n): q.appendleft(i)

print(f"list.insert(0, x)  x100,000: {timed(front_of_list):7.1f} ms")
print(f"list.append(x)     x100,000: {timed(end_of_list):7.1f} ms")
print(f"deque.appendleft   x100,000: {timed(front_of_deque):7.1f} ms")</div>
  <div class="fx" data-lang="text">list.insert(0, x)  x100,000:   892.3 ms
list.append(x)     x100,000:     2.7 ms
deque.appendleft   x100,000:     3.3 ms</div>
  <p>Inserting at the front of a list took roughly a second, a few hundred times slower than appending at the end, because each insert shifted the whole queue. Python's <code>collections.deque</code> ("double-ended queue") is built differently, as a chain of small blocks that is open at both ends, so adding at the front is as cheap as adding at the back. The <a class="xref" data-note="dsa_linkedlist">Linked Lists</a> note builds that kind of structure from scratch. Here is the full cost table for lists, and every line follows from the picture:</p>
  <table class="tbl">
    <tr><th>list operation</th><th>Cost</th><th>Why</th></tr>
    <tr><td><code>a[i]</code>, <code>a[i] = x</code>, <code>len(a)</code></td><td>O(1)</td><td>address arithmetic; length is stored</td></tr>
    <tr><td><code>a.append(x)</code>, <code>a.pop()</code></td><td>O(1) amortised</td><td>only the last slot changes; rare resize</td></tr>
    <tr><td><code>a.insert(0, x)</code>, <code>a.pop(0)</code></td><td>O(n)</td><td>every item shifts one slot</td></tr>
    <tr><td><code>a.insert(i, x)</code>, <code>del a[i]</code></td><td>O(n − i)</td><td>everything after i shifts</td></tr>
    <tr><td><code>x in a</code>, <code>a.index(x)</code>, <code>a.remove(x)</code>, <code>a.count(x)</code></td><td>O(n)</td><td>check slots one by one</td></tr>
    <tr><td><code>a[i:j]</code>, <code>a.copy()</code>, <code>a + b</code></td><td>O(length of result)</td><td>copies into a new list</td></tr>
    <tr><td><code>min</code>, <code>max</code>, <code>sum</code>, <code>reverse</code></td><td>O(n)</td><td>must touch every item</td></tr>
    <tr><td><code>a.sort()</code>, <code>sorted(a)</code></td><td>O(n log n)</td><td>Timsort (O(n) if already nearly sorted)</td></tr>
  </table>

  <h2 id="dsa-cx-dict"><span class="num">08</span>Inside dict and set</h2>
  <p>A list finds things by position. But most real questions are not about positions: "is this charge id already recorded?", "how many orders did customer 1032 place?". You do not know where the answer sits, so a list has to scan. The set in section 01 answered the same question in one step, and the way it does that is one of the most important ideas in computing. A <code>dict</code> (and a <code>set</code>, which is a dict that stores keys only) is a <strong>hash table</strong>: an array of slots plus a rule that turns the key itself into a slot number, so the key tells you where to look.</p>
  <p>Picture a school office with 26 pigeon-holes, one per letter of the alphabet. A letter for "Priya" goes straight into the P hole, and to find it later nobody searches every hole; they go to P. The rule "first letter → hole" is the <strong>hash function</strong>. If two names start with P they share a hole, and the clerk checks the two or three letters inside: that is a <strong>collision</strong>.</p>
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
<text x="10" y="160" class="tm">lookup 310: compute the same hash → slot 6 → compare the key stored there → found. No scanning.</text>
<text x="10" y="178" class="tm">collision: 80 also wants slot 0 (80 % 8 = 0), already taken by 120 → Python tries another slot.</text>
</svg><figcaption>The key is turned into a number, the number picks a slot, and both storing and looking up go straight to that slot.</figcaption></figure>
  <p>Follow the figure from left to right. Every <code>d[key]</code> or <code>x in s</code> does three things. First, <code>hash(key)</code> turns the key into an integer, and the same key always gives the same integer. Second, that integer is reduced to a slot number, conceptually <code>hash % number_of_slots</code>; for 310 in a table of 8 slots that is slot 6. Third, Python compares the key stored in that slot with yours, because a different key might have landed there. None of these steps depends on how many items the table holds, which is why lookup is O(1). Here is where Biteful's charges would land in an 8-slot table:</p>
  <div class="fx" data-lang="py">print(hash(120), hash(80), hash(-1))         # small ints hash to themselves (except -1)
print(hash("biteful") == hash("biteful"))    # same key, same hash, every time
for c in [120, 80, 250, 40, 310, 60, 200]:
    print(c, "-&gt; slot", hash(c) % 8)
try:
    d = {[80, 200]: "combo"}
except TypeError as e:
    print("TypeError:", e)
print({(80, 200): "combo"})                  # a tuple can be a key</div>
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
{(80, 200): 'combo'}</div>
  <p>Small integers hash to themselves (−1 is the odd exception, used internally as an error signal), so 250 goes to slot 2, 310 to slot 6 and 60 to slot 4. But 120, 80, 40 and 200 are all multiples of 8, so all four want slot 0. When a slot is taken, CPython tries other slots in a fixed order until it finds the key or an empty slot (this is called <strong>open addressing</strong>), and to keep those detours short it rebuilds the table bigger as soon as it is about two-thirds full. The rebuild is O(n), but like a list resize it is rare, which is why insertion is O(1) amortised. Because collisions can in theory pile up, the honest statement is "O(1) on average, O(n) in the worst case"; the <a class="xref" data-note="dsa_hashing">Hashing</a> note builds such a table by hand on exactly these charges.</p>
  <p>The <code>TypeError</code> at the end shows the one rule for keys: they must be <strong>hashable</strong>, which in practice means unchangeable. A list could be modified after being stored, its hash would change, and the table would look in the wrong slot forever, so Python refuses. A tuple cannot change, so it is allowed. The speed difference this design buys is enormous:</p>
  <div class="fx" data-lang="py">import time, random
random.seed(3)
n = 100_000
ids_list = list(range(n))
ids_set = set(ids_list)
queries = [random.randrange(2 * n) for _ in range(1_000)]

t = time.perf_counter(); a = sum(q in ids_list for q in queries); t_list = time.perf_counter() - t
t = time.perf_counter(); b = sum(q in ids_set for q in queries);  t_set = time.perf_counter() - t
print(f"1,000 lookups in a list of 1 lakh: {t_list * 1000:7.1f} ms")
print(f"1,000 lookups in a set of 1 lakh : {t_set * 1000:7.3f} ms   same answers: {a == b}")</div>
  <div class="fx" data-lang="text">1,000 lookups in a list of 1 lakh:   383.6 ms
1,000 lookups in a set of 1 lakh :   0.221 ms   same answers: True</div>
  <p>The same 1,000 questions took hundreds of milliseconds against a list and a fraction of a millisecond against a set, over a thousand times faster. Here is the cost table for dicts and sets, and a few other operations worth knowing, including strings. Strings are <strong>immutable</strong> (they can never be changed in place), so every <code>s + t</code> builds a brand-new string by copying both parts.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Cost</th><th>Why</th></tr>
    <tr><td><code>d[k]</code>, <code>k in d</code>, <code>d[k] = v</code>, <code>del d[k]</code></td><td>O(1) average</td><td>hash → slot; O(n) only if keys collide badly</td></tr>
    <tr><td><code>s.add(x)</code>, <code>x in s</code>, <code>s.remove(x)</code></td><td>O(1) average</td><td>same table, keys only</td></tr>
    <tr><td><code>for k in d</code>, <code>d.items()</code>, <code>set(lst)</code></td><td>O(n)</td><td>visit or insert every item</td></tr>
    <tr><td><code>s1 &amp; s2</code>, <code>s1 | s2</code></td><td>O(len(s1) + len(s2))</td><td>walk one, look up in the other</td></tr>
    <tr><td><code>s + t</code> on strings</td><td>O(len(s) + len(t))</td><td>a new string is built</td></tr>
    <tr><td><code>"".join(parts)</code></td><td>O(total length)</td><td>measures once, copies once</td></tr>
    <tr><td><code>deque.appendleft</code>, <code>deque.popleft</code></td><td>O(1)</td><td>open at both ends</td></tr>
    <tr><td><code>heapq.heappush</code>, <code>heappop</code></td><td>O(log n)</td><td>item moves along a tree of height log n</td></tr>
    <tr><td><code>bisect.bisect_left(a, x)</code></td><td>O(log n)</td><td>binary search on a sorted list</td></tr>
  </table>
  <p>Immutability makes one common habit dangerous: building a long string with <code>s = s + ch</code> in a loop. Each step may copy everything built so far, so n steps cost 1 + 2 + … + n copies, O(n²). CPython has a shortcut that grows the string in place when nothing else refers to it, so the habit often seems fine, but one extra reference is enough to switch the shortcut off:</p>
  <div class="fx" data-lang="py">import time
def timed(f):
    t = time.perf_counter(); f(); return (time.perf_counter() - t) * 1000

n = 100_000
def plus_only_name():
    s = ""
    for i in range(n): s = s + "x"
def plus_second_name():
    s = ""
    for i in range(n):
        other = s                    # a second name for the same string
        s = s + "x"                  # now Python must copy the whole string
def join_once():
    parts = []
    for i in range(n): parts.append("x")
    s = "".join(parts)

print(f"s + 'x', only name  : {timed(plus_only_name):6.1f} ms")
print(f"s + 'x', second name: {timed(plus_second_name):6.1f} ms")
print(f"''.join(parts)      : {timed(join_once):6.1f} ms")</div>
  <div class="fx" data-lang="text">s + 'x', only name  :    3.5 ms
s + 'x', second name:  148.0 ms
''.join(parts)      :    2.6 ms</div>
  <p>The same loop became dozens of times slower just because a second name pointed at the string, while <code>"".join(parts)</code> stayed fast. The safe rule is to collect the pieces in a list and join once.</p>

  <h2 id="dsa-cx-recur"><span class="num">09</span>Recursion and the Call Stack</h2>
  <p>A recursive function, one that calls itself, often builds no list at all, so by the rules of section 05 it looks like O(1) space. Yet deep recursion crashes Python. The hidden memory is the <strong>call stack</strong>. When a function calls another function (or itself), the caller is paused until the answer comes back, and its local variables must be kept somewhere while it waits. Python keeps one <strong>frame</strong> per waiting call, holding its variables and the point where it should resume. The newest call sits on top; when it returns, its frame is removed and the call below carries on.</p>
  <p>Imagine a manager who asks an assistant for the total of four bills. The assistant says "120 plus the total of the other three", hands those three bills to a junior, and waits. The junior does the same with two bills, and so on, until someone receives no bills and answers "0". Then the answers travel back up the chain. While the most junior person was working, everyone above was standing there waiting, and each waiting person is a stack frame. Here is that exact process on the first four charges, with indentation showing how deep the calls are:</p>
  <div class="fx" data-lang="py">def total(charges, i=0, depth=0):
    pad = "    " * depth
    if i == len(charges):                       # base case: nothing left to add
        print(f"{pad}total(i={i}) -&gt; 0   ({depth + 1} calls open now)")
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
                total(i=4) -&gt; 0   (5 calls open now)
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
</svg><figcaption>Frames pile up as the calls go deeper, then come off one at a time from the top as each answer is returned.</figcaption></figure>
  <p>The figure shows the moment of greatest depth. Five frames are open at once: four waiting calls, each holding one charge, and the base case on top. Reading the right-hand column from top to bottom shows the answers flowing back: 0, then 40, 290, 370 and finally 490. This gives both costs of a recursive function. Its <strong>time</strong> is the total number of calls multiplied by the work per call: here n + 1 calls doing O(1) each, so O(n). Its <strong>space</strong> is the greatest number of frames open at the same moment, the recursion <strong>depth</strong>: here n + 1, so O(n), even though no list was built.</p>
  <p>Python does not let the stack grow forever. By default it allows about 1,000 frames, and one more raises <code>RecursionError</code>. A loop doing the same job has no such limit and uses O(1) space:</p>
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
print(total(list(range(900))))
try:
    total(list(range(5_000)))
except RecursionError as e:
    print("RecursionError:", e)
print("loop, 1,000,000 charges:", total_loop(list(range(1_000_000))))</div>
  <div class="fx" data-lang="text">recursion limit: 1000
404550
RecursionError: maximum recursion depth exceeded
loop, 1,000,000 charges: 499999500000</div>
  <p>900 charges were fine, 5,000 crashed, and the loop summed 10 lakh without trouble. You can raise the limit with <code>sys.setrecursionlimit</code>, but each frame really uses memory and a very high limit can crash the interpreter itself, so for long straight chains (a list, a linked list) a loop is the right tool in Python. Recursion shines on branching structures such as trees, where the depth stays small.</p>
  <p>Time gets dramatic when each call makes more than one recursive call. <code>total</code> makes one call per level, a straight chain. A function that makes two calls per level builds a tree of calls that roughly doubles at every level. The classic example is the naive Fibonacci function:</p>
  <div class="fx" data-lang="py">import time
calls = 0
def fib(n):                          # two recursive calls per call
    global calls
    calls += 1
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)

for n in [10, 20, 25, 30]:
    calls = 0
    t = time.perf_counter()
    v = fib(n)
    print(f"fib({n}) = {v:&gt;6}   calls = {calls:&gt;9,}   {(time.perf_counter() - t) * 1000:6.1f} ms")</div>
  <div class="fx" data-lang="text">fib(10) =     55   calls =       177      0.0 ms
fib(20) =   6765   calls =    21,891      1.3 ms
fib(25) =  75025   calls =   242,785     13.4 ms
fib(30) = 832040   calls = 2,692,537    147.5 ms</div>
  <p>Each increase of 5 in n multiplies the number of calls by about 11, so the work grows exponentially, in the O(2ⁿ) family of section 04 (strictly about 1.6ⁿ): fib(30) already makes 2.7 million calls. Yet at any moment only one path down the tree is open, so the stack depth, and the space, is just O(n). The enormous waste comes from computing the same values again and again, and the cure, remembering answers already computed, is the starting point of the <a class="xref" data-note="dsa_dp">Dynamic Programming</a> note.</p>

  <h2 id="dsa-cx-constraints"><span class="num">10</span>Reading Constraints</h2>
  <p>Every interview problem ends with lines like "1 ≤ nums.length ≤ 10⁵". These <strong>constraints</strong> are the limits on the input, and they are a strong hint about which Big-O the expected solution has. To turn a limit into a decision you need one more number: roughly how many simple steps Python performs per second. It is easy to measure:</p>
  <div class="fx" data-lang="py">import time
n = 10_000_000
t = time.perf_counter()
s = 0
for i in range(n):
    s += i
dt = time.perf_counter() - t
print(f"{n:,} loop steps took {dt:.2f} s -&gt; about {n / dt / 1e6:.0f} million steps per second")</div>
  <div class="fx" data-lang="text">10,000,000 loop steps took 0.54 s -&gt; about 18 million steps per second</div>
  <p>About 10⁷ simple steps per second is the figure to remember (built-in functions written in C, such as <code>sum</code> or <code>sorted</code>, go 10 to 50 times faster per item). Online judges usually allow one or two seconds. So you put the largest n into each Big-O label and compare it with 10⁷. For n = 10⁵, n² is 10¹⁰ steps, about 1,000 seconds, hopeless; n log n is under 2 million, comfortable. The table below does that arithmetic for the usual limits:</p>
  <table class="tbl">
    <tr><th>Largest n</th><th>Steps at that n</th><th>Big-O that fits</th><th>Typical idea</th></tr>
    <tr><td>n ≤ 10–12</td><td>n! ≈ 4 × 10⁸ at 12</td><td>O(n!)</td><td>try every ordering</td></tr>
    <tr><td>n ≤ 20–25</td><td>2ⁿ ≈ 10⁶–3 × 10⁷</td><td>O(2ⁿ)</td><td>try every subset, backtracking</td></tr>
    <tr><td>n ≤ 500</td><td>n³ ≈ 10⁸</td><td>O(n³)</td><td>three nested loops, interval DP</td></tr>
    <tr><td>n ≤ 3,000–5,000</td><td>n² ≈ 10⁷</td><td>O(n²)</td><td>all pairs, 2-D DP</td></tr>
    <tr><td>n ≤ 10⁵–10⁶</td><td>n log n ≈ 2 × 10⁶–2 × 10⁷</td><td>O(n log n) or O(n)</td><td>sorting, two pointers, sliding window, hash map, heap</td></tr>
    <tr><td>n ≤ 10⁹ and above</td><td>—</td><td>O(log n) or O(1)</td><td>binary search on the answer, a formula</td></tr>
  </table>
  <p>Section 01's duplicate check is LeetCode 217, Contains Duplicate, whose limit is n ≤ 10⁵. Reading that limit tells you immediately that the "list of seen values" idea, O(n²), will time out, and that you need an O(n) idea (a set) or an O(n log n) one (sort, then compare neighbours). You know this before writing a line of code.</p>
  <p>After writing any solution, analyse it out loud in three steps: count the loops, check what each loop body really costs (including hidden scans, copies and sorts), and state both time and space. A full example on a new question, "did any customer order both today and yesterday?", with 20,000 customer ids each day:</p>
  <div class="fx" data-lang="py">import time, random
def common_slow(a, b):               # n items, each scans m items: O(n*m) time, O(1) space
    for x in a:
        if x in b:
            return True
    return False

def common_fast(a, b):               # one set of b, then n O(1) lookups: O(n+m) time, O(m) space
    seen = set(b)
    for x in a:
        if x in seen:
            return True
    return False

random.seed(1)
today = random.sample(range(10**7), 20_000)       # today's customer ids
yesterday = random.sample(range(10**7), 20_000)   # yesterday's customer ids
for f in (common_slow, common_fast):
    t = time.perf_counter(); r = f(today, yesterday)
    print(f"{f.__name__}: {r}  {(time.perf_counter() - t) * 1000:7.1f} ms")</div>
  <div class="fx" data-lang="text">common_slow: True    246.5 ms
common_fast: True      1.8 ms</div>
  <p>The way to explain this in an interview is: "The brute force checks each of today's n ids against yesterday's list with <code>in</code>, which scans m items, so it is O(n·m) time and O(1) space. If I first put yesterday's ids into a set, which costs O(m) time and O(m) space, each lookup becomes O(1), so the total is O(n + m) time." You name the brute force, the improvement, the trade-off, and both costs. The measured times agree: the set version was over a hundred times faster here. The value range in the constraints matters too: values up to 10⁹ rule out an array indexed by value, while values from 0 to 100 invite one (a list of 101 counters).</p>

  <h2 id="dsa-cx-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common mistake is calling a function "O(n) because it has one loop" without looking inside the loop. Any O(n) operation in the loop body multiplies the loop. This function looks like a fast seen-set check, but one careless line inside the loop sorts the whole list every time round:</p>
  <div class="fx" data-lang="py">def weird(nums):
    seen = set()
    for x in nums:                   # n times...
        if x in seen:                # O(1)
            return x
        seen.add(x)                  # O(1) amortised
        snapshot = sorted(nums)      # ...O(n log n) every time round the loop!
    return None

print(weird([120, 80, 250, 40, 310, 80, 60, 200]))</div>
  <div class="fx" data-lang="text">80</div>
  <p>It prints the right answer, 80, and on 8 items it is instant. But the loop runs n times and each <code>sorted()</code> costs O(n log n), so the function is O(n² log n) time, and O(n) space for the set plus a fresh sorted copy each time. Deleting that line makes it O(n). The usual suspects inside loops are <code>x in some_list</code>, <code>list.pop(0)</code>, <code>list.insert(0, x)</code>, <code>list.remove(x)</code>, slicing, <code>sorted()</code> and string <code>+</code>.</p>
  <p>The second mistake is forgetting that copies cost both time and space. Slicing is the usual culprit in recursion: passing <code>charges[1:]</code> to the next call copies the rest of the list every time, which turns an O(n) recursion into O(n²) time and O(n²) total copying. Passing an index instead avoids the copies:</p>
  <div class="fx" data-lang="py">def total_slices(charges):           # each call copies the rest of the list
    if not charges:
        return 0
    return charges[0] + total_slices(charges[1:])

def total_index(charges, i=0):       # each call only moves an index
    if i == len(charges):
        return 0
    return charges[i] + total_index(charges, i + 1)

import time
data = list(range(900))
for f in (total_slices, total_index):
    t = time.perf_counter()
    for _ in range(200):
        r = f(data)
    print(f"{f.__name__:13} {r}  {(time.perf_counter() - t) * 1000:6.1f} ms for 200 calls")</div>
  <div class="fx" data-lang="text">total_slices  404550   178.5 ms for 200 calls
total_index   404550    19.7 ms for 200 calls</div>
  <p>Both give the same total, but the slicing version is several times slower even at 900 items, and the gap grows with n. Other mistakes come up in interviews again and again. Calling recursion "O(1) space" forgets the call stack. Using one letter n for two different inputs hides an O(n·m) cost. Calling dict lookup "always O(1)" ignores the worst case; say "O(1) on average". Using <code>pop(0)</code> on a list as a queue makes every dequeue O(n); use <code>deque.popleft()</code>. Applying binary search to unsorted data simply gives wrong answers, and sorting first only pays off if you will search many times. And the most expensive mistake of all is judging speed from a small test: as section 04 showed, every algorithm looks instant at n = 100.</p>

  <h2 id="dsa-cx-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Time complexity</b>: how the number of steps grows with input size n, usually for the worst-case input.</li>
    <li><b>Space complexity</b>: how much extra memory (beyond the input) grows with n. <b>In place</b> = O(1) extra space.</li>
    <li><b>Big-O</b>: keep the dominant term, drop constants and smaller terms. ½n² + ½n + 2 → O(n²). Ω = lower bound, Θ = tight bound.</li>
    <li><b>Amortised O(1)</b>: n operations cost O(n) in total, even if one of them costs O(n).</li>
    <li><b>Dynamic array</b> (Python list): contiguous equal-size slots plus spare capacity; grows by a constant factor.</li>
    <li><b>Hash table</b> (dict, set): slot = hash(key) % size; O(1) average lookup, O(n) worst.</li>
    <li><b>Call stack</b>: one frame per call that has started and not returned. Recursion time = calls × work per call; space = maximum depth.</li>
  </ul>
  <h3>Growth classes</h3>
  <table class="tbl">
    <tr><th>Class</th><th>Picture</th><th>Doubling n does</th><th>Example</th></tr>
    <tr><td>O(1)</td><td>jump straight there</td><td>nothing</td><td><code>a[i]</code>, <code>d[k]</code>, <code>len(a)</code></td></tr>
    <tr><td>O(log n)</td><td>halve each step</td><td>+1 step</td><td>binary search, heap push/pop</td></tr>
    <tr><td>O(n)</td><td>touch each item once</td><td>×2</td><td>sum, max, one loop</td></tr>
    <tr><td>O(n log n)</td><td>good sorting</td><td>a bit over ×2</td><td><code>sorted()</code></td></tr>
    <tr><td>O(n²)</td><td>every pair</td><td>×4</td><td>nested loops</td></tr>
    <tr><td>O(2ⁿ)</td><td>pick or skip each item</td><td>squares it</td><td>all subsets, naive Fibonacci</td></tr>
  </table>
  <h3>Rules</h3>
  <ul>
    <li>Loops in sequence add; nested loops multiply; different inputs get different letters (O(n + m), O(n·m)).</li>
    <li>Count the cost of every built-in inside a loop.</li>
    <li>Pairs: n(n − 1)/2. Halving: about log₂ n steps (10³ → 10, 10⁶ → 20).</li>
    <li>Python ≈ 10⁷ simple steps per second. n ≤ 20 → 2ⁿ; n ≤ 10⁴ → n²; n ≤ 10⁵–10⁶ → n log n or n.</li>
  </ul>
  <h3>Cost tables</h3>
  <table class="tbl">
    <tr><th>O(1)</th><th>O(log n)</th><th>O(n)</th><th>O(n log n)</th></tr>
    <tr><td><code>a[i]</code>, <code>len</code>, <code>append</code>, <code>pop()</code>, <code>d[k]</code>, <code>k in d</code>, <code>x in s</code>, <code>s.add</code>, <code>deque.popleft</code></td><td><code>bisect</code>, <code>heappush</code>, <code>heappop</code></td><td><code>x in list</code>, <code>insert(0)</code>, <code>pop(0)</code>, <code>remove</code>, <code>index</code>, slices, <code>min</code>/<code>max</code>/<code>sum</code>, <code>set(lst)</code>, <code>"".join</code></td><td><code>sort</code>, <code>sorted</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import sys, time, tracemalloc
from collections import deque

t = time.perf_counter(); work(); print(time.perf_counter() - t)  # rough timing
sys.getsizeof(a)              # bytes used by a list's block
sys.getrecursionlimit()       # 1000 by default
q = deque(); q.appendleft(x); q.popleft()   # O(1) at both ends
s = set(lst)                  # O(n) once, then O(1) lookups
text = "".join(parts)         # O(n), not s += piece in a loop</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Hidden O(n) inside a loop: <code>in list</code>, <code>pop(0)</code>, <code>insert(0)</code>, slicing, <code>sorted</code>, string <code>+</code>.</li>
    <li>Recursion is O(depth) space; Python stops near 1,000 frames.</li>
    <li>Dict/set lookup is O(1) <em>average</em>; keys must be hashable (tuple yes, list no).</li>
    <li>Always state time AND space, and name the trade-off.</li>
    <li>Small tests hide slow code; think about the largest n.</li>
  </ul>

  <h2 id="dsa-cx-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is time complexity, and why don't we just measure seconds?</summary><div class="qa-body">Time complexity describes how the number of steps an algorithm takes grows as the input size n grows. Seconds depend on the machine, the language and what else is running, and they only tell you about the inputs you actually tried. A step count as a function of n is the same everywhere and predicts behaviour on inputs you have not run yet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Big-O notation mean? What is the Big-O of 5n² + 100n + 3?</summary><div class="qa-body">Big-O gives an upper bound on how work grows for large n, keeping only the fastest-growing term and dropping constant factors. 5n² + 100n + 3 is O(n²): for large n the n² term dominates, and the 5 does not change the fact that doubling n quadruples the work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between Big-O, Big-Omega and Big-Theta?</summary><div class="qa-body">Big-O is an upper bound (grows no faster than), Big-Omega a lower bound (grows at least as fast as), and Big-Theta means both bounds match, so it is a tight description. In interviews people say "O" but usually mean the tight bound, e.g. "binary search is O(log n)".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are best, average and worst case? Which does Big-O usually describe?</summary><div class="qa-body">They are the cost on the most favourable input, a typical input, and the least favourable input. Linear search is O(1) in the best case (target first) and O(n) in the worst (target last or absent). Unless stated otherwise, complexity means the worst case, because it is a guarantee.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where does the "log" in O(log n) come from? Give an example.</summary><div class="qa-body">From halving. If each step throws away half of what remains, after k steps n / 2ᵏ items are left, and you finish when that reaches 1, i.e. after log₂ n steps. Binary search on a sorted list is the classic example: a million items need about 20 looks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A function has a single loop. Can it be O(n²)?</summary><div class="qa-body">Yes, if the loop body itself does O(n) work, for example <code>x in some_list</code>, <code>list.insert(0, x)</code>, <code>pop(0)</code>, a slice or a sort. The body's cost multiplies the number of iterations. A "seen" list checked with <code>in</code> inside a loop is the textbook case.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two lists of sizes n and m, with a loop over one nested inside a loop over the other. What is the complexity?</summary><div class="qa-body">O(n·m), not O(n²), because the inputs can be different sizes and must keep separate letters. If the loops ran one after the other instead of nested, it would be O(n + m).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is space complexity? Does the input count?</summary><div class="qa-body">It is the extra memory an algorithm uses as a function of n, beyond the input itself. Building a set of all items is O(n) space; swapping inside the list with two indexes is O(1), called "in place". Hidden copies (slices, <code>sorted</code>) and recursion depth also count.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a time–space trade-off? Give an example.</summary><div class="qa-body">Using more memory to save time, or the reverse. Checking for duplicates with a set is O(n) time and O(n) space; sorting in place and comparing neighbours is O(n log n) time and O(1) extra space; comparing every pair is O(n²) time and O(1) space. Which is best depends on whether time or memory is the tighter limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>list.append</code> O(1) if a resize copies the whole list?</summary><div class="qa-body">Because it is O(1) amortised. The list grows its capacity by a constant factor, so resizes become rarer as it grows, and the total copying over n appends is O(n). Averaged over all appends that is O(1) each; a million appends in CPython trigger fewer than a hundred resizes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>a[i]</code> O(1) but <code>a.insert(0, x)</code> O(n) for a Python list?</summary><div class="qa-body">A list is a dynamic array: equal-size slots in one block, so slot i is at start + 8·i, one calculation away. Inserting at the front requires every existing item to shift one slot right to make room, which is n moves. For a queue that needs both ends, use <code>collections.deque</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>x in set</code> O(1) but <code>x in list</code> O(n)?</summary><div class="qa-body">A set is a hash table: it computes hash(x), turns it into a slot number and checks that slot, so the work does not depend on how many items are stored. A list has no idea where x might be and must compare slot by slot. Converting a list to a set once (O(n)) is worth it when you will do many lookups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When can a dict lookup be O(n)? Why can't a list be a dict key?</summary><div class="qa-body">When many keys land in the same slot, for example a class whose <code>__hash__</code> returns a constant, or keys crafted by an attacker; then each lookup probes through all of them. A list can't be a key because it is mutable: if it changed after being stored, its hash would change and it would never be found in its slot. Tuples work because they can't change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time and space complexity of a recursive function?</summary><div class="qa-body">Time is the total number of calls multiplied by the work done in each call. Space is the maximum recursion depth, because every waiting call keeps a frame on the call stack. Summing a list recursively is O(n) time and O(n) space; naive Fibonacci is exponential time but only O(n) space, since only one path of calls is open at a time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if recursion goes 10,000 levels deep in Python?</summary><div class="qa-body">Python raises <code>RecursionError</code>, because its default limit is about 1,000 frames. You can raise the limit with <code>sys.setrecursionlimit</code>, but frames really use memory, so the better fix for long linear chains is a loop or an explicit stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>"".join(parts)</code> preferred to <code>s += piece</code> in a loop?</summary><div class="qa-body">Strings are immutable, so <code>+</code> builds a new string and copies the old one each time, which adds up to O(n²). <code>join</code> computes the total length, allocates once and copies each character once, O(n). CPython sometimes optimises <code>+=</code> in place, but only when nothing else refers to the string, so you cannot rely on it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The constraints say n ≤ 10⁵. What complexity should your solution have?</summary><div class="qa-body">O(n) or O(n log n). Python manages roughly 10⁷ simple steps per second, so n² = 10¹⁰ steps would take far too long, while n log n is under 2 million. That tells you to reach for sorting, two pointers, a sliding window, a hash map or a heap rather than nested loops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is an O(n) algorithm always faster than an O(n²) one?</summary><div class="qa-body">No, only for large enough n. Big-O ignores constant factors, so an O(n) algorithm with heavy work per step can lose on small inputs; Python's sort even uses insertion sort (O(n²)) on small runs because it is faster there. Big-O tells you which one wins as n grows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you walk an interviewer through the complexity of your solution?</summary><div class="qa-body">Count the loops and how many times each runs, check the true cost of everything inside them (including built-ins and recursion), then state time and space separately. Mention the brute-force cost you improved on and any trade-off, e.g. "O(n) time, O(n) space for the set; O(1) space is possible by sorting, at O(n log n) time."</div></details>
</main>
`
});
