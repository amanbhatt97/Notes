// notes/dsa/dsa_binsearch.js — Binary Search
Object.assign(TOPIC_CONTENT, {
  "dsa_binsearch": `<main>
<h1>Binary Search</h1>
  <div class="where"><span>DSA</span><span>Searching &amp; Sorting</span><span>Binary Search</span></div>
  <p class="lead">Binary search finds something in sorted data by looking at the middle and throwing away the half that cannot contain the answer, again and again, until one candidate is left. Because the search space halves at every step, a million items need only about twenty looks, which is why databases, version-control tools and countless interview answers rely on it. The idea is simple, but the loop is famously easy to get wrong by one, so this page spends real time on writing it correctly. The running example is Biteful's evening order log: the times of eleven orders, stored as minutes after 6:00 pm and kept sorted, <b>[2, 5, 8, 12, 23, 23, 23, 38, 56, 72, 91]</b>. We will find one order, then the first and last order in a busy minute, then search a log that wraps around, and finally use the same loop on questions that have no list at all, such as "what is the smallest delivery bag that works?".</p>

  <h2 id="dsa-bs-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Binary Search</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Look at the middle, drop the half that can't hold the answer</li>
          <li>O(log n): 10⁶ items → 20 looks, 10⁹ → 30</li>
          <li>Needs a yes/no question that flips once (F F F T T T), plus index access</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two templates</div>
        <ul>
          <li><b>A, exact match</b>: <code>hi = n-1</code>, <code>while lo &lt;= hi</code>, <code>mid ± 1</code></li>
          <li><b>B, first True</b>: <code>hi = n</code>, <code>while lo &lt; hi</code>, True → <code>hi = mid</code></li>
          <li>Never mix them; test sizes 0, 1, 2</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants</div>
        <ul>
          <li><b>bisect_left / bisect_right</b>: first ≥ x, first &gt; x</li>
          <li><b>Rotated</b>: one half around mid is always sorted</li>
          <li><b>2-D</b>: k → (k // cols, k % cols), or staircase</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">On the answer</div>
        <ul>
          <li>"Smallest X such that …" with a monotonic check <code>ok(x)</code></li>
          <li>Cost: O(log range) checks × cost of one check</li>
          <li>Integer ceil: <code>(p + k - 1) // k</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-bs-game"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Idea: Halving</span><span class="rm-sub">why twenty looks are enough for a million items</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-sorted"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">When Halving Is Safe</span><span class="rm-sub">sorted data and monotonic questions</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-loop"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Classic Loop: lo, hi, mid</span><span class="rm-sub">finding one order, step by step</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-traps"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Off-by-One Traps and the Two Templates</span><span class="rm-sub">loops that miss items or never stop</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-bisect"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Leftmost and Rightmost: Python's bisect</span><span class="rm-sub">first, last, count and insert position</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-sortedprob"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Problems on Sorted Arrays</span><span class="rm-sub">the three standard problems and their edge cases</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-rotated"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Rotated Sorted Arrays</span><span class="rm-sub">searching a log that wraps around</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-answer"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Binary Search on the Answer</span><span class="rm-sub">smallest bag, slowest speed that still works</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-matrix"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Searching a 2-D Matrix</span><span class="rm-sub">flatten the index, or walk a staircase</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">recognising binary search from the wording</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-mistakes"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">unchecked bounds, float ceil, wrong divisor</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">templates, formulas, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on binary search</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bs-game"><span class="num">01</span>The Idea: Halving</h2>
  <p>Biteful's support team gets calls like "my 6:38 order never arrived", and the first job is to find that order in the log. With eleven orders you can read the log from left to right. On a festival night, though, the log holds 10 lakh (one million) orders, and support takes thousands of calls. Reading from the left each time, called a <strong>linear search</strong> or scan, costs up to a million comparisons per call. The log is already sorted by time; the question is whether we can use that.</p>
  <p>Think of the guessing game. A friend picks a number from 1 to 100 and only tells you "higher" or "lower" after each guess. You could guess 1, 2, 3 and so on, needing up to 100 guesses. Or you could guess 50 first, and whatever she says, half of the numbers are ruled out with one question. Then guess the middle of what remains, and so on:</p>
<figure class="viz"><svg viewBox="0 0 580 200" width="580">
<text x="10" y="16" class="tm">secret = 63</text>
<text x="40" y="40" class="tm" text-anchor="end">1</text>
<rect x="45" y="28" width="500" height="16" class="fb sb"/><text x="560" y="40" class="tm">guess 50 → higher</text>
<rect x="45" y="58" width="250" height="16" class="fs"/><rect x="295" y="58" width="250" height="16" class="fb sb"/><text x="560" y="70" class="tm">75 → lower</text>
<rect x="45" y="88" width="250" height="16" class="fs"/><rect x="295" y="88" width="120" height="16" class="fb sb"/><rect x="415" y="88" width="130" height="16" class="fs"/><text x="560" y="100" class="tm">62 → higher</text>
<rect x="45" y="118" width="310" height="16" class="fs"/><rect x="355" y="118" width="60" height="16" class="fb sb"/><rect x="415" y="118" width="130" height="16" class="fs"/><text x="560" y="130" class="tm">68 → lower</text>
<rect x="45" y="148" width="310" height="16" class="fs"/><rect x="355" y="148" width="25" height="16" class="fb sb"/><rect x="380" y="148" width="165" height="16" class="fs"/><text x="560" y="160" class="tm">65 → lower</text>
<rect x="45" y="178" width="310" height="16" class="fs"/><rect x="355" y="178" width="10" height="16" class="fg sg"/><rect x="365" y="178" width="180" height="16" class="fs"/><text x="560" y="190" class="tg">63 ✓</text>
<text x="40" y="190" class="tm" text-anchor="end">100</text>
</svg><figcaption>Blue = numbers still possible. Each guess at the middle cuts the blue part in half. 6 guesses instead of 63.</figcaption></figure>
  <p>That is the whole idea. <strong>Binary search</strong> looks at the middle item of the part that is still possible, decides which half could still hold the answer, and drops the other half. It is called "binary" because each step splits the range in two. The same thing happens when you look up "mango" in a printed dictionary: you open near the middle, see "light", know that mango comes later, and never read page 1. It only works because the dictionary is in alphabetical order.</p>
  <p>How many halvings does it take? 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1 is seven steps. The number of times you can halve n before reaching 1 is called <strong>log₂ n</strong> (the logarithm base 2), and it grows extremely slowly:</p>
  <div class="fx" data-lang="py">import math
for n in [11, 100, 1_000, 1_000_000, 1_000_000_000]:
    worst = math.ceil(math.log2(n + 1))
    print(f"{n:&gt;13,} items   scan: up to {n:&gt;13,} checks   halving: up to {worst} checks")</div>
  <div class="fx" data-lang="text">           11 items   scan: up to            11 checks   halving: up to 4 checks
          100 items   scan: up to           100 checks   halving: up to 7 checks
        1,000 items   scan: up to         1,000 checks   halving: up to 10 checks
    1,000,000 items   scan: up to     1,000,000 checks   halving: up to 20 checks
1,000,000,000 items   scan: up to 1,000,000,000 checks   halving: up to 30 checks</div>
  <p>Our eleven orders need at most 4 looks, a million items need 20, and a billion need 30. This is why binary search is described as <strong>O(log n)</strong> time, while a scan is O(n). To see the difference in real time, the code below builds a sorted log of 10 lakh order times and looks up 200 of them twice: once with <code>list.index</code>, which scans from the left, and once with <code>bisect_left</code>, Python's built-in binary search (section 05 explains it). Timings are approximate and depend on the machine.</p>
  <div class="fx" data-lang="py">import random, time
from bisect import bisect_left

random.seed(42)
times_big = sorted(random.sample(range(50_000_000), 1_000_000))   # 10 lakh sorted order times
queries = random.sample(times_big, 200)

t = time.perf_counter()
pos_scan = [times_big.index(q) for q in queries]                   # walks from index 0 each time
t_scan = time.perf_counter() - t

t = time.perf_counter()
pos_half = [bisect_left(times_big, q) for q in queries]            # halves the range each time
t_half = time.perf_counter() - t

print(f"scan  : {t_scan:.3f} s for 200 lookups")
print(f"halve : {t_half * 1000:.3f} ms for 200 lookups")
print("same positions:", pos_scan == pos_half)</div>
  <div class="fx" data-lang="text">scan  : 3.194 s for 200 lookups
halve : 0.456 ms for 200 lookups
same positions: True</div>
  <p>Both methods find exactly the same positions, but the scan takes seconds while halving takes a fraction of a millisecond, thousands of times faster. The scan's cost also depends on where the order sits (an order near the end needs nearly a million comparisons), whereas halving needs about twenty wherever it is. A related point catches many people out: <code>x in my_list</code> looks like one cheap step, but it is a hidden scan, O(n). On sorted data use <code>bisect</code>; on unsorted data you query many times, use a set or dict (the <a class="xref" data-note="dsa_hashing">Hashing</a> note).</p>
  <p>You meet binary search far outside interview questions: database indexes (B-trees) do a halving-style walk to find a row, <code>git bisect</code> finds the commit that introduced a bug by testing the middle commit, and machine-learning engineers use it to find the largest batch size that fits in GPU memory.</p>

  <h2 id="dsa-bs-sorted"><span class="num">02</span>When Halving Is Safe</h2>
  <p>When binary search looks at the middle and says "the answer must be on the right", it is trusting the order of the data. If that trust is misplaced, the search throws away the half that actually held the answer, and it does so silently. Here is the same search run on the sorted log and on a copy that a bug has shuffled:</p>
  <div class="fx" data-lang="py">def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] &lt; target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

times = [2, 5, 8, 12, 23, 23, 23, 38, 56, 72, 91]
shuffled = [23, 2, 91, 23, 12, 56, 5, 38, 72, 8, 23]
print("sorted,   find 38:", binary_search(times, 38))
print("shuffled, find 38:", binary_search(shuffled, 38), "| but 38 is at index", shuffled.index(38))</div>
  <div class="fx" data-lang="text">sorted,   find 38: 7
shuffled, find 38: -1 | but 38 is at index 7</div>
  <p>In the shuffled log the 6:38 order is at index 7, yet the search reports −1, "not there". It looked at the middle value, 56, decided that 38 must be on the left, and discarded the right half, which contained 38. There was no crash and no warning, just a wrong answer.</p>
  <p>"Sorted" is actually one case of a more general condition, and understanding the general condition is what unlocks the later sections. What binary search really needs is a yes/no question about each position that, once it becomes yes, stays yes. Such a question is called <strong>monotonic</strong> (it only ever changes in one direction). Its answers along the range look like <code>F F F F T T T</code>, and binary search finds the boundary, the first <code>T</code>. Think of a row of street lights switched on from one end: you can find the first lit lamp by checking the middle one, because if it is lit, everything after it is lit too.</p>
  <table class="tbl">
    <tr><th>Question over a range</th><th>Answers</th><th>Monotonic?</th></tr>
    <tr><td>Is <code>times[i] ≥ 23</code>? for i = 0..10</td><td>F F F F T T T T T T T</td><td>Yes: the first T is index 4</td></tr>
    <tr><td>Can a bag of capacity c carry the orders in 3 trips?</td><td>F F T T T … (a bigger bag never hurts)</td><td>Yes (section 08)</td></tr>
    <tr><td>Does this commit contain the bug? (git bisect)</td><td>F F F T T T (a bug stays once added)</td><td>Yes</td></tr>
    <tr><td>Is <code>times[i]</code> even?</td><td>T F T T F F F T T T F</td><td>No: binary search cannot be used</td></tr>
  </table>
  <p>The second requirement is <strong>random access</strong>: the ability to jump straight to position <code>mid</code> in O(1). A Python list has it; a linked list does not, because reaching the middle means walking there. Finally, remember the cost of getting sorted data in the first place. Sorting is O(n log n), which is more than a single O(n) scan, so sorting only to search once is a loss. Sort once and search many times, and the sort pays for itself.</p>

  <h2 id="dsa-bs-loop"><span class="num">03</span>The Classic Loop: lo, hi, mid</h2>
  <p>"Look at the middle and drop half" has to become precise code. We keep two markers: <code>lo</code>, the first index that could still hold the answer, and <code>hi</code>, the last one. Everything outside the <strong>window</strong> <code>[lo, hi]</code> has been ruled out. Each step computes <code>mid = (lo + hi) // 2</code> (the <code>//</code> is floor division, so mid is a whole index). If <code>a[mid]</code> is the target we are done. If it is too small, the answer can only be to the right, so <code>lo = mid + 1</code>; if it is too big, <code>hi = mid - 1</code>. Notice the <code>+ 1</code> and <code>- 1</code>: mid has been checked, so it is excluded from the new window. When <code>lo</code> passes <code>hi</code> the window is empty and the target is not there.</p>
  <p>The picture shows this on the order log when support asks about the 6:38 order:</p>
<figure class="viz"><svg viewBox="0 0 620 288" width="620">
<text x="10" y="16" class="tm">find 38 (6:38 pm) in the 11 sorted order times</text>
<text x="10" y="46" class="tm">step 1</text>
<rect x="70" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="90.0" y="46" text-anchor="middle" font-size="12">2</text>
<rect x="114" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="134.0" y="46" text-anchor="middle" font-size="12">5</text>
<rect x="158" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="178.0" y="46" text-anchor="middle" font-size="12">8</text>
<rect x="202" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="222.0" y="46" text-anchor="middle" font-size="12">12</text>
<rect x="246" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="266.0" y="46" text-anchor="middle" font-size="12">23</text>
<rect x="290" y="30" width="40" height="24" rx="3" class="fb sb"/>
<text x="310.0" y="46" text-anchor="middle" font-size="12">23</text>
<rect x="334" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="354.0" y="46" text-anchor="middle" font-size="12">23</text>
<rect x="378" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="398.0" y="46" text-anchor="middle" font-size="12">38</text>
<rect x="422" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="442.0" y="46" text-anchor="middle" font-size="12">56</text>
<rect x="466" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="486.0" y="46" text-anchor="middle" font-size="12">72</text>
<rect x="510" y="30" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530.0" y="46" text-anchor="middle" font-size="12">91</text>
<text x="90.0" y="68" text-anchor="middle" class="tm" font-size="10">lo</text>
<text x="530.0" y="68" text-anchor="middle" class="tm" font-size="10">hi</text>
<text x="310.0" y="68" text-anchor="middle" class="tb" font-size="10">mid</text>
<text x="610" y="82" text-anchor="end" class="tm" font-size="11">23 &lt; 38 → lo = 6</text>
<text x="10" y="108" class="tm">step 2</text>
<rect x="70" y="92" width="40" height="24" rx="3" class="fs"/>
<text x="90.0" y="108" text-anchor="middle" font-size="12">2</text>
<rect x="114" y="92" width="40" height="24" rx="3" class="fs"/>
<text x="134.0" y="108" text-anchor="middle" font-size="12">5</text>
<rect x="158" y="92" width="40" height="24" rx="3" class="fs"/>
<text x="178.0" y="108" text-anchor="middle" font-size="12">8</text>
<rect x="202" y="92" width="40" height="24" rx="3" class="fs"/>
<text x="222.0" y="108" text-anchor="middle" font-size="12">12</text>
<rect x="246" y="92" width="40" height="24" rx="3" class="fs"/>
<text x="266.0" y="108" text-anchor="middle" font-size="12">23</text>
<rect x="290" y="92" width="40" height="24" rx="3" class="fs"/>
<text x="310.0" y="108" text-anchor="middle" font-size="12">23</text>
<rect x="334" y="92" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="354.0" y="108" text-anchor="middle" font-size="12">23</text>
<rect x="378" y="92" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="398.0" y="108" text-anchor="middle" font-size="12">38</text>
<rect x="422" y="92" width="40" height="24" rx="3" class="fb sb"/>
<text x="442.0" y="108" text-anchor="middle" font-size="12">56</text>
<rect x="466" y="92" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="486.0" y="108" text-anchor="middle" font-size="12">72</text>
<rect x="510" y="92" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530.0" y="108" text-anchor="middle" font-size="12">91</text>
<text x="354.0" y="130" text-anchor="middle" class="tm" font-size="10">lo</text>
<text x="530.0" y="130" text-anchor="middle" class="tm" font-size="10">hi</text>
<text x="442.0" y="130" text-anchor="middle" class="tb" font-size="10">mid</text>
<text x="610" y="144" text-anchor="end" class="tm" font-size="11">56 &gt; 38 → hi = 7</text>
<text x="10" y="170" class="tm">step 3</text>
<rect x="70" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="90.0" y="170" text-anchor="middle" font-size="12">2</text>
<rect x="114" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="134.0" y="170" text-anchor="middle" font-size="12">5</text>
<rect x="158" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="178.0" y="170" text-anchor="middle" font-size="12">8</text>
<rect x="202" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="222.0" y="170" text-anchor="middle" font-size="12">12</text>
<rect x="246" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="266.0" y="170" text-anchor="middle" font-size="12">23</text>
<rect x="290" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="310.0" y="170" text-anchor="middle" font-size="12">23</text>
<rect x="334" y="154" width="40" height="24" rx="3" class="fb sb"/>
<text x="354.0" y="170" text-anchor="middle" font-size="12">23</text>
<rect x="378" y="154" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-opacity="0.5"/>
<text x="398.0" y="170" text-anchor="middle" font-size="12">38</text>
<rect x="422" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="442.0" y="170" text-anchor="middle" font-size="12">56</text>
<rect x="466" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="486.0" y="170" text-anchor="middle" font-size="12">72</text>
<rect x="510" y="154" width="40" height="24" rx="3" class="fs"/>
<text x="530.0" y="170" text-anchor="middle" font-size="12">91</text>
<text x="354.0" y="192" text-anchor="middle" class="tb" font-size="10">lo/mid</text>
<text x="398.0" y="192" text-anchor="middle" class="tm" font-size="10">hi</text>
<text x="610" y="206" text-anchor="end" class="tm" font-size="11">23 &lt; 38 → lo = 7</text>
<text x="10" y="232" class="tm">step 4</text>
<rect x="70" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="90.0" y="232" text-anchor="middle" font-size="12">2</text>
<rect x="114" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="134.0" y="232" text-anchor="middle" font-size="12">5</text>
<rect x="158" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="178.0" y="232" text-anchor="middle" font-size="12">8</text>
<rect x="202" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="222.0" y="232" text-anchor="middle" font-size="12">12</text>
<rect x="246" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="266.0" y="232" text-anchor="middle" font-size="12">23</text>
<rect x="290" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="310.0" y="232" text-anchor="middle" font-size="12">23</text>
<rect x="334" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="354.0" y="232" text-anchor="middle" font-size="12">23</text>
<rect x="378" y="216" width="40" height="24" rx="3" class="fg sg"/>
<text x="398.0" y="232" text-anchor="middle" font-size="12">38</text>
<rect x="422" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="442.0" y="232" text-anchor="middle" font-size="12">56</text>
<rect x="466" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="486.0" y="232" text-anchor="middle" font-size="12">72</text>
<rect x="510" y="216" width="40" height="24" rx="3" class="fs"/>
<text x="530.0" y="232" text-anchor="middle" font-size="12">91</text>
<text x="398.0" y="254" text-anchor="middle" class="tb" font-size="10">lo/hi/mid</text>
<text x="610" y="268" text-anchor="end" class="tg" font-size="11">38 = 38 ✓ found at 7</text>
</svg><figcaption>Grey = ruled out, outlined = still possible, blue = the middle we test. The window between lo and hi halves every step: 4 checks instead of 8 for a left-to-right scan. Index 7 is the 8th order, 6:38 pm.</figcaption></figure>
  <p>Step 1 tests the middle of the full window, index 5, which holds 23; since 23 &lt; 38 the whole left half including index 5 is ruled out. Step 2 tests index 8, which is 56, too big, so the window shrinks to indices 6 and 7. Step 3 tests index 6 (23, too small), and step 4 tests index 7 and finds 38. The code does exactly the same and prints each step; the second call looks for 40, a time when no order arrived:</p>
  <div class="fx" data-lang="py">def binary_search(a, target):
    lo, hi = 0, len(a) - 1            # the window [lo, hi] may still hold the target
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        print(f"lo={lo} hi={hi} mid={mid} a[mid]={a[mid]}")
        if a[mid] == target:
            return mid
        if a[mid] &lt; target:
            lo = mid + 1              # answer is right of mid
        else:
            hi = mid - 1              # answer is left of mid
    print(f"stop: lo={lo} &gt; hi={hi}")
    return -1                         # window is empty: not there

print("index:", binary_search(times, 38))
print("index:", binary_search(times, 40))</div>
  <div class="fx" data-lang="text">lo=0 hi=10 mid=5 a[mid]=23
lo=6 hi=10 mid=8 a[mid]=56
lo=6 hi=7 mid=6 a[mid]=23
lo=7 hi=7 mid=7 a[mid]=38
index: 7
lo=0 hi=10 mid=5 a[mid]=23
lo=6 hi=10 mid=8 a[mid]=56
lo=6 hi=7 mid=6 a[mid]=23
lo=7 hi=7 mid=7 a[mid]=38
stop: lo=8 &gt; hi=7
index: -1</div>
  <p>The search for 38 matches the picture, four looks. The search for 40 follows the same first four steps, then sets <code>lo = 8</code>, and now <code>lo = 8 &gt; hi = 7</code>: the window is empty, so the answer is −1. Notice where <code>lo</code> ended up: index 8 is exactly where 40 would have to be inserted to keep the log sorted, between 6:38 and 6:56. That fact is the basis of section 05.</p>
  <p>Each step halves the window, so the loop runs at most about log₂ n times: <strong>O(log n) time</strong>. It uses three variables, so <strong>O(1) extra space</strong>. A recursive version is also O(log n) time but uses O(log n) space for the call stack, so the loop is preferred. One limitation shows up immediately on our data: if you search for 23, this loop returns index 5, because that happens to be the first 23 it tests. It promises <em>an</em> index of the target, not the first one. Finding the first and last 6:23 orders needs the second template, coming next. In interviews, the words "sorted array", "return the index or −1" and "in O(log n)" point to this loop.</p>

  <h2 id="dsa-bs-traps"><span class="num">04</span>Off-by-One Traps and the Two Templates</h2>
  <p>The classic loop has three small choices that people get wrong when writing it from memory: <code>&lt;</code> or <code>&lt;=</code> in the loop condition, <code>mid</code> or <code>mid ± 1</code> when moving a marker, and <code>n</code> or <code>n − 1</code> for the starting <code>hi</code>. An <strong>off-by-one error</strong> is a boundary mistake of exactly one, such as a loop that runs one time too few. In binary search, each wrong choice gives either a missed item or a loop that never ends. Let us see both.</p>
  <p>The first trap is writing <code>while lo &lt; hi</code> in the exact-match loop. When the window shrinks to a single item, <code>lo == hi</code>, the loop stops before checking it. In our search for 38, the final step had <code>lo = hi = 7</code>, which is exactly the step that found 38:</p>
  <div class="fx" data-lang="py">def search_bug1(a, target):
    lo, hi = 0, len(a) - 1
    while lo &lt; hi:                    # BUG: should be &lt;=
        mid = (lo + hi) // 2
        if a[mid] == target: return mid
        if a[mid] &lt; target: lo = mid + 1
        else: hi = mid - 1
    return -1

print(search_bug1(times, 38), search_bug1([7], 7), search_bug1([1, 3], 3))   # all present!</div>
  <div class="fx" data-lang="text">-1 -1 -1</div>
  <p>All three targets are present, and all three searches report −1. The second trap is writing <code>lo = mid</code> instead of <code>lo = mid + 1</code>. When only two items are left, <code>(lo + hi) // 2</code> rounds down to <code>lo</code>, so <code>lo = mid</code> changes nothing and the loop repeats forever (this version stops itself after 20 steps so we can see it):</p>
  <div class="fx" data-lang="py">def search_bug2(a, target):
    lo, hi, steps = 0, len(a) - 1, 0
    while lo &lt; hi:
        steps += 1
        if steps &gt; 20: return f"stuck at lo={lo} hi={hi}"
        mid = (lo + hi) // 2
        if a[mid] &lt; target: lo = mid  # BUG: should be mid + 1
        else: hi = mid
    return lo

print(search_bug2(times, 91))</div>
  <div class="fx" data-lang="text">stuck at lo=9 hi=10</div>
  <p>The window is stuck at indices 9 and 10. The third trap does not exist in Python but is a favourite interview question. In Java, C++ or Go, integers are usually 32 bits and cannot exceed about 2.1 billion. With very large indexes, <code>lo + hi</code> can overflow and wrap around to a negative number, giving a negative <code>mid</code>. The safe form is <code>lo + (hi - lo) / 2</code>, which never exceeds <code>hi</code>. Python's integers never overflow, so below we imitate 32-bit wrap-around to see it:</p>
  <div class="fx" data-lang="py">def as_int32(x):                       # what a 32-bit int would hold after overflow
    return (x + 2**31) % 2**32 - 2**31

lo, hi = 1_500_000_000, 2_000_000_000
print("Python (lo + hi) // 2      :", (lo + hi) // 2)
print("32-bit  (lo + hi) / 2      :", as_int32(lo + hi) // 2)
print("32-bit  lo + (hi - lo) / 2 :", as_int32(lo + as_int32(hi - lo) // 2))</div>
  <div class="fx" data-lang="text">Python (lo + hi) // 2      : 1750000000
32-bit  (lo + hi) / 2      : -397483648
32-bit  lo + (hi - lo) / 2 : 1750000000</div>
  <p>The cure for the first two traps is to learn two templates and never mix their parts. The exact-match loop from section 03 is <strong>template A</strong>. Its window <code>[lo, hi]</code> includes both ends, so it starts with <code>hi = n − 1</code>, loops <code>while lo &lt;= hi</code>, and always moves by <code>mid ± 1</code>. <strong>Template B</strong> answers a different and more useful question: "what is the first index where a yes/no question <code>ok(i)</code> becomes True?" Its window <code>[lo, hi)</code> includes <code>lo</code> but not <code>hi</code>, so it starts with <code>hi = n</code> (meaning "possibly no True at all"), loops <code>while lo &lt; hi</code>, and when <code>ok(mid)</code> is True it sets <code>hi = mid</code>, keeping mid because it might be the answer; otherwise <code>lo = mid + 1</code>. The loop ends when <code>lo == hi</code>, and <code>lo</code> is the answer.</p>
  <table class="tbl">
    <tr><th></th><th>Template A: exact match</th><th>Template B: first True</th></tr>
    <tr><td>Question</td><td>"Where is x?" (or −1)</td><td>"First index where <code>ok(i)</code> is True"</td></tr>
    <tr><td>Start</td><td><code>lo, hi = 0, n - 1</code></td><td><code>lo, hi = 0, n</code></td></tr>
    <tr><td>Window</td><td>[lo, hi], both ends included</td><td>[lo, hi), hi excluded</td></tr>
    <tr><td>Loop</td><td><code>while lo &lt;= hi</code></td><td><code>while lo &lt; hi</code></td></tr>
    <tr><td>Move</td><td><code>lo = mid + 1</code> / <code>hi = mid - 1</code></td><td>True → <code>hi = mid</code>; False → <code>lo = mid + 1</code></td></tr>
    <tr><td>Result</td><td>mid when equal, else −1</td><td><code>lo</code> (equals n if nothing is True)</td></tr>
  </table>
  <p>When the question is <code>a[i] &gt;= x</code>, template B finds the first item at or after x. This is called the <strong>lower bound</strong> of x:</p>
  <div class="fx" data-lang="py">def lower_bound(a, x):
    """First index i with a[i] &gt;= x (len(a) if there is none)."""
    lo, hi = 0, len(a)                 # window [lo, hi): hi itself is never looked at
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if a[mid] &gt;= x:
            hi = mid                   # mid might be the answer: keep it
        else:
            lo = mid + 1               # mid is too small: drop it
    return lo

for x in [0, 23, 30, 91, 100]:
    print(f"lower_bound(times, {x}) = {lower_bound(times, x)}")</div>
  <div class="fx" data-lang="text">lower_bound(times, 0) = 0
lower_bound(times, 23) = 4
lower_bound(times, 30) = 7
lower_bound(times, 91) = 10
lower_bound(times, 100) = 11</div>
  <p>Read the answers as Biteful facts. The first order at or after 6:23 is index 4. The first at or after 6:30 is index 7 (the 6:38 order). Nothing is at or after minute 100, so the answer is 11, which is <code>len(times)</code>, meaning "past the end". Template B never loops forever, because <code>hi = mid</code> always shrinks the window when <code>lo &lt; hi</code> (mid is strictly less than hi), and <code>lo = mid + 1</code> always moves past mid. Whichever template you write, test it in thirty seconds on an empty list, one item (found and not found), two items, a target smaller than everything, bigger than everything, and duplicates. Almost every off-by-one bug shows up on sizes 0, 1 and 2.</p>

  <h2 id="dsa-bs-bisect"><span class="num">05</span>Leftmost and Rightmost: Python's bisect</h2>
  <p>Three orders arrived at 6:23, when a cricket match ended, and support wants all of them: the first, the last and how many. Template A found "a" 6:23 order at index 5, and walking left and right from there would be O(n) if a whole festival rush landed in one minute. Two boundary searches answer it in O(log n). The <strong>lower bound</strong> of 23 is the first index whose value is ≥ 23. The <strong>upper bound</strong> is the first index whose value is &gt; 23, one past the last 23. All the 23s sit between them.</p>
  <p>Python provides both as the <code>bisect</code> module. <code>bisect_left(a, x)</code> is the lower bound, the leftmost position where x could be inserted while keeping a sorted. <code>bisect_right(a, x)</code> is the upper bound, the rightmost such position. <code>insort(a, x)</code> inserts x at that position. In an interview you may use the module unless you are asked to write the loop yourself.</p>
  <div class="fx" data-lang="py">from bisect import bisect_left, bisect_right, insort

print("first 6:23 order :", bisect_left(times, 23))
print("after last 6:23  :", bisect_right(times, 23))
print("orders at 6:23   :", bisect_right(times, 23) - bisect_left(times, 23))
print("orders 6:10-6:40 :", bisect_right(times, 40) - bisect_left(times, 10))
print("last order before 6:30 -&gt; minute", times[bisect_left(times, 30) - 1])
late = times.copy()
insort(late, 30)                      # a late entry at 6:30, kept in order
print(late)</div>
  <div class="fx" data-lang="text">first 6:23 order : 4
after last 6:23  : 7
orders at 6:23   : 3
orders 6:10-6:40 : 5
last order before 6:30 -&gt; minute 23
[2, 5, 8, 12, 23, 23, 23, 30, 38, 56, 72, 91]</div>
  <p>The lower bound of 23 is 4 and the upper bound is 7, so the 6:23 orders are indices 4, 5 and 6, and there are 7 − 4 = 3 of them. The same subtraction counts orders in a time range: <code>bisect_right(times, 40) - bisect_left(times, 10)</code> counts everything from 6:10 to 6:40 inclusive, five orders (12, 23, 23, 23, 38). The last order before 6:30 is the item just before the lower bound of 30. And <code>insort</code> keeps the log sorted when a late entry for 6:30 arrives. Every one of these is O(log n), except <code>insort</code>: finding the spot is O(log n), but inserting into a Python list shifts every later item one place right, which is O(n). Calling <code>insort</code> n times is therefore O(n²); for many inserts, collect them and sort once, or use a heap.</p>
  <p>Two more uses are worth knowing. A sorted list of cut-offs turns a score into a band without a long <code>if/elif</code> chain, and since Python 3.10 a <code>key=</code> argument lets you search a list of records by one field:</p>
  <div class="fx" data-lang="py">from bisect import bisect_left, bisect_right
cutoffs = [40, 60, 75, 90]          # below 40 = F, 40-59 = C, 60-74 = B, 75-89 = A, 90+ = S
grades = "FCBAS"
def grade(score):
    return grades[bisect_right(cutoffs, score)]

print([(s, grade(s)) for s in [33, 40, 59, 60, 89, 90, 100]])

orders = [("O1", 2), ("O2", 5), ("O3", 8), ("O4", 12), ("O5", 23), ("O6", 23), ("O7", 23), ("O8", 38)]
i = bisect_left(orders, 23, key=lambda o: o[1])      # key= needs Python 3.10+
j = bisect_right(orders, 23, key=lambda o: o[1])
print(orders[i:j])</div>
  <div class="fx" data-lang="text">[(33, 'F'), (40, 'C'), (59, 'C'), (60, 'B'), (89, 'A'), (90, 'S'), (100, 'S')]
[('O5', 23), ('O6', 23), ('O7', 23)]</div>
  <p>With cut-offs 40, 60, 75 and 90, <code>bisect_right</code> returns how many cut-offs the score has reached, which indexes straight into the grade letters: 59 has reached one cut-off (C), 60 has reached two (B). Biteful uses the same trick to turn a delivery time into a "late band". With <code>key=</code>, the search compares only the minute of each order record, and the slice between the two bounds is exactly the three 6:23 orders. Interview wording that points here: "first or last occurrence", "insert position", "how many equal to x", "how many in the range [a, b]", "smallest element greater than x", "floor" and "ceiling".</p>

  <h2 id="dsa-bs-sortedprob"><span class="num">06</span>Problems on Sorted Arrays</h2>
  <p>Three standard interview problems are exactly the tools from sections 03 to 05, stated in their own words. It is worth seeing that the templates survive them unchanged, including the edge cases that interviewers like: an empty list, one item, a target outside the range, and a list made entirely of the target.</p>
  <p><b>Binary Search (LeetCode 704)</b> gives a sorted list of distinct numbers and asks for the target's index or −1 in O(log n). That is template A, word for word. <b>Search Insert Position (LeetCode 35)</b> asks for the target's index if present, otherwise the index where it would be inserted. "The first index with <code>nums[i] &gt;= target</code>" is both of those at once, so it is simply the lower bound, or <code>bisect_left</code>. <b>Find First and Last Position of Element (LeetCode 34)</b> allows duplicates and asks for <code>[first, last]</code> or <code>[-1, -1]</code>. The brute force, finding any copy and walking outwards, is O(n) when every item equals the target. The better answer is two lower bounds: first = lower bound of target, and last = (lower bound of target + 1) − 1, because for integers "&gt; target" is the same as "≥ target + 1".</p>
  <div class="fx" data-lang="py">def search(nums, target):              # 704: exact match, template A
    lo, hi = 0, len(nums) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target: return mid
        if nums[mid] &lt; target: lo = mid + 1
        else: hi = mid - 1
    return -1

def search_insert(nums, target):       # 35: insert position = lower bound
    return lower_bound(nums, target)

def search_range(nums, target):        # 34: first and last position
    first = lower_bound(nums, target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]                # lower bound always returns *some* index
    return [first, lower_bound(nums, target + 1) - 1]

print(search([-1, 0, 3, 5, 9, 12], 9), search([-1, 0, 3, 5, 9, 12], 2), search([], 3), search([5], 5))
print([search_insert([1, 3, 5, 6], t) for t in [5, 2, 7, 0]], search_insert([], 4))
print(search_range(times, 23), search_range([5, 7, 7, 8, 8, 10], 6), search_range([], 0), search_range([2, 2, 2], 2))</div>
  <div class="fx" data-lang="text">4 -1 -1 0
[2, 1, 4, 0] 0
[4, 6] [-1, -1] [-1, -1] [0, 2]</div>
  <p>The first line is problem 704: 9 is at index 4, while 2 and the empty list give −1. The second line is problem 35: in <code>[1, 3, 5, 6]</code>, 5 is found at 2, 2 would go at 1, 7 at the end (4) and 0 at the front (0); an empty list gives 0. The third line is problem 34 on our own log: the 6:23 orders are <code>[4, 6]</code>. One line in <code>search_range</code> deserves attention. A lower bound always returns <em>some</em> index, even when the target is missing, so you must check that <code>first</code> is inside the list and that <code>nums[first]</code> really equals the target, in that order, or you either return a wrong range or hit an IndexError. All three run in O(log n) time and O(1) space. A good follow-up in the tracker is <b>2300 Successful Pairs of Spells and Potions</b>: sort the potions once, then do one bisect per spell.</p>

  <h2 id="dsa-bs-rotated"><span class="num">07</span>Rotated Sorted Arrays</h2>
  <p>Biteful stores its log in a <strong>ring buffer</strong>, a fixed block of slots where writing wraps back to the start when it reaches the end. As a result the nine distinct order times are stored as <code>[56, 72, 91, 2, 5, 8, 12, 23, 38]</code>: a sorted list that was cut at one point and had its two parts swapped. This is called a <strong>rotated sorted array</strong>, and the place where the values drop (from 91 to 2) is the <strong>pivot</strong>. Section 02 says plain binary search may fail on data that is not sorted. But this data is almost sorted: it is two sorted runs side by side. Can we still drop half at every step?</p>
<figure class="viz"><svg viewBox="0 0 520 170" width="520">
<g>
<rect x="40" y="70" width="40" height="40" class="fb sb"/><rect x="95" y="60" width="40" height="50" class="fb sb"/><rect x="150" y="50" width="40" height="60" class="fb sb"/><rect x="205" y="40" width="40" height="70" class="fv"/>
<rect x="260" y="100" width="40" height="10" class="ft st"/><rect x="315" y="90" width="40" height="20" class="ft st"/><rect x="370" y="80" width="40" height="30" class="ft st"/>
</g>
<g text-anchor="middle"><text x="60" y="128">4</text><text x="115" y="128">5</text><text x="170" y="128">6</text><text x="225" y="128">7</text><text x="280" y="128">0</text><text x="335" y="128">1</text><text x="390" y="128">2</text>
<text x="60" y="146" class="tm">0</text><text x="115" y="146" class="tm">1</text><text x="170" y="146" class="tm">2</text><text x="225" y="146" class="tm">3</text><text x="280" y="146" class="tm">4</text><text x="335" y="146" class="tm">5</text><text x="390" y="146" class="tm">6</text></g>
<text x="225" y="32" text-anchor="middle" class="tb">mid</text>
<text x="140" y="20" text-anchor="middle" class="tb">left run: sorted</text>
<text x="335" y="60" text-anchor="middle">right run: sorted</text>
<text x="252" y="164" text-anchor="middle" class="tr">↑ pivot (drop)</text>
<text x="440" y="146" class="tm">index</text>
</svg><figcaption>Bar height = value. Pick any mid: the pivot sits in only one half, so the other half is a plain sorted run.</figcaption></figure>
  <p>The key fact is in the picture. There is only one drop, and any mid splits the range into two halves, so the drop can be in at most one of them. The other half is an ordinary sorted run. We can tell which half is sorted with one comparison: if <code>nums[lo] &lt;= nums[mid]</code>, there is no drop between lo and mid, so the left half is sorted; otherwise the right half is. Inside a sorted half, two comparisons tell us whether the target can be there. If it can, search that half; if not, it must be in the other half.</p>
  <p>Searching the ring for the 6:08 order (8): with lo = 0 and hi = 8, mid is 4, holding 5. Since 56 &gt; 5, the left half contains the drop, so the right half (5 up to 38) is sorted, and 8 lies between 5 and 38, so we search the right: lo = 5. Now mid is 6, holding 12; the left half (8 to 12) is sorted and 8 is inside it, so hi = 5. Then mid = 5 holds 8: found. This is LeetCode 33, Search in Rotated Sorted Array:</p>
  <div class="fx" data-lang="py">def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] &lt;= nums[mid]:                    # left half lo..mid is sorted
            if nums[lo] &lt;= target &lt; nums[mid]:
                hi = mid - 1                         # target is inside it
            else:
                lo = mid + 1
        else:                                        # right half mid..hi is sorted
            if nums[mid] &lt; target &lt;= nums[hi]:
                lo = mid + 1                         # target is inside it
            else:
                hi = mid - 1
    return -1

print([search_rotated(ring, t) for t in [8, 72, 40]])
print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0), search_rotated([3, 1], 1), search_rotated([1], 0))</div>
  <div class="fx" data-lang="text">[5, 1, -1]
4 1 -1</div>
  <p>8 is found at index 5, 72 at index 1, and 40 (not present) gives −1. The test <code>[3, 1]</code> shows why the comparison must be <code>nums[lo] &lt;= nums[mid]</code> and not <code>&lt;</code>: with two items, lo and mid are the same index, the "left half" is that single item, and a single item is sorted. With <code>&lt;</code> the code would decide the right half is sorted and search in the wrong place.</p>
  <p>A related question is where the log really starts, which is the position of the minimum (LeetCode 153, Find Minimum in Rotated Sorted Array). The minimum is the first item of the second run. Compare <code>nums[mid]</code> with the last item of the window, <code>nums[hi]</code>. If <code>nums[mid] &gt; nums[hi]</code>, the drop must be to the right of mid, so the minimum is too: <code>lo = mid + 1</code>. Otherwise mid..hi is sorted and mid itself may be the minimum, so keep it: <code>hi = mid</code>. That is template B on the question "is <code>nums[i] &lt;= nums[-1]</code>?", which goes F F F T T T.</p>
  <div class="fx" data-lang="py">def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if nums[mid] &gt; nums[hi]:
            lo = mid + 1          # the drop is right of mid
        else:
            hi = mid              # mid..hi is sorted; mid could be the minimum
    return lo

i = find_min(ring)
print("log starts at index", i, "with minute", ring[i])
print([find_min(a) for a in [[3, 4, 5, 1, 2], [11, 13, 15, 17], [2, 1], [1]]])</div>
  <div class="fx" data-lang="text">log starts at index 3 with minute 2
[3, 0, 1, 0]</div>
  <p>The log starts at index 3 with minute 2 (6:02 pm). The second line gives the minimum's index for four more lists, including <code>[11, 13, 15, 17]</code>, which is not rotated at all, and the answer is correctly index 0. Comparing with <code>nums[lo]</code> instead of <code>nums[hi]</code> would fail exactly on that unrotated list, because mid is bigger than lo there too, which would push the search right, away from the minimum. Both searches are O(log n) time and O(1) space. If duplicates are allowed (LeetCode 81 and 154), a tie such as <code>nums[mid] == nums[hi]</code> tells you nothing, so you shrink the window by one (<code>hi -= 1</code>), and the worst case becomes O(n). Interview wording: "rotated", "pivot", "sorted then shifted", "circular".</p>

  <h2 id="dsa-bs-answer"><span class="num">08</span>Binary Search on the Answer</h2>
  <p>So far we always searched a list. Biteful's operations team now asks a question with no list to search. The first six orders on one road weigh <code>[3, 2, 2, 4, 1, 4]</code> kg. One rider must deliver them <strong>in that order</strong>, at most <strong>3 trips</strong>, and each trip she fills her bag with the next orders until the next one would not fit. What is the smallest bag capacity that works?</p>
  <p>The brute-force answer tries capacity 1, 2, 3, … and simulates the trips for each, which is O(range × n). The insight is in section 02. Ask the yes/no question "can capacity c do it in at most 3 trips?". A bigger bag never needs more trips than a smaller one, so the answers over increasing c look like F F F T T T: the question is monotonic. So we can binary search over the <em>capacity values</em>, using template B, and check each guess by simulating the trips. This technique is called <strong>binary search on the answer</strong>.</p>
  <p>Think of reaching a station 30 minutes away. Is 10 km/h fast enough? No. Is 40? Yes. Is 25? Yes. Is 18? No. You keep halving the gap between "too slow" and "fast enough" until you find the slowest speed that still makes it, without trying every speed.</p>
  <p>We also need a range to search. The bag must hold the heaviest single order, so the smallest sensible capacity is <code>max(weights)</code> = 4. A bag that holds everything needs only one trip, so <code>sum(weights)</code> = 16 surely works. The check function, usually called <code>ok(x)</code>, here counts trips greedily.</p>
  <div class="fx" data-lang="py">def trips_needed(weights, cap):
    trips, load = 1, 0
    for x in weights:
        if load + x &gt; cap:             # next order doesn't fit: start a new trip
            trips, load = trips + 1, 0
        load += x
    return trips

def min_bag_capacity(weights, max_trips):
    lo, hi = max(weights), sum(weights)
    while lo &lt; hi:
        mid = (lo + hi) // 2
        t = trips_needed(weights, mid)
        print(f"lo={lo:2} hi={hi:2} try {mid:2} kg -&gt; {t} trips {'ok' if t &lt;= max_trips else 'too many'}")
        if t &lt;= max_trips:
            hi = mid                   # mid works: try smaller
        else:
            lo = mid + 1               # mid fails: need bigger
    return lo

w = [3, 2, 2, 4, 1, 4]
print("trips per capacity:", [(c, trips_needed(w, c)) for c in range(4, 11)])
print("answer:", min_bag_capacity(w, 3))</div>
  <div class="fx" data-lang="text">trips per capacity: [(4, 5), (5, 4), (6, 3), (7, 3), (8, 3), (9, 2), (10, 2)]
lo= 4 hi=16 try 10 kg -&gt; 2 trips ok
lo= 4 hi=10 try  7 kg -&gt; 3 trips ok
lo= 4 hi= 7 try  5 kg -&gt; 4 trips too many
lo= 6 hi= 7 try  6 kg -&gt; 3 trips ok
answer: 6</div>
  <p>The first line confirms the monotonic shape: capacities 4 to 10 need 5, 4, 3, 3, 3, 2, 2 trips, so "≤ 3 trips" is False for 4 and 5 and True from 6 onwards. The search then finds that boundary in four checks: 10 works, 7 works, 5 does not, 6 works, so the answer is 6 kg. This is exactly LeetCode 1011, Capacity To Ship Packages Within D Days. The cost is O(n log R): about log R guesses, where R is the size of the answer range, each checked in O(n). For weights summing to 10⁹, that is about 30 checks.</p>
  <p>The famous interview version is LeetCode 875, Koko Eating Bananas. Koko has piles of bananas such as <code>[3, 6, 7, 11]</code> and h = 8 hours. At speed k she eats k bananas per hour from one pile (or the rest of that pile if fewer remain). Find the smallest k that finishes in h hours. A pile of p bananas takes ⌈p / k⌉ hours (rounded up: a pile of 7 at speed 4 takes 2 hours, not 1.75). Faster never hurts, so "hours(k) ≤ h" is monotonic over k = 1 … max(piles), and the same template applies with a different check:</p>
  <div class="fx" data-lang="py">def min_eating_speed(piles, h):        # LeetCode 875
    def hours(k):
        return sum((p + k - 1) // k for p in piles)   # ceil(p / k) without floats
    lo, hi = 1, max(piles)
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if hours(mid) &lt;= h:
            hi = mid                   # fast enough: try slower
        else:
            lo = mid + 1               # too slow: go faster
    return lo

print(min_eating_speed([3, 6, 7, 11], 8), min_eating_speed([30, 11, 23, 4, 20], 5),
      min_eating_speed([30, 11, 23, 4, 20], 6), min_eating_speed([1_000_000_000], 2))</div>
  <div class="fx" data-lang="text">4 30 23 500000000</div>
  <p>The answers for the four tests are 4, 30, 23 and 500 million. The rounding-up is written <code>(p + k - 1) // k</code>, which is the standard integer way to compute ⌈p / k⌉ without floating-point division, whose rounding goes wrong for very large numbers. Start <code>lo</code> at 1, not 0, or the check divides by zero. The same shape solves Split Array Largest Sum, Minimum Days to Make Bouquets and Smallest Divisor Given a Threshold: only the check changes. Even an integer square root fits: the largest r with r² ≤ n is one less than the first r with r² &gt; n.</p>
  <div class="fx" data-lang="py">def int_sqrt(n):
    """Largest r with r*r &lt;= n, found as (first r with r*r &gt; n) - 1."""
    lo, hi = 0, n + 1
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if mid * mid &gt; n:
            hi = mid
        else:
            lo = mid + 1
    return lo - 1

print([int_sqrt(n) for n in [0, 1, 8, 9, 10, 2_147_395_599]])</div>
  <div class="fx" data-lang="text">[0, 1, 2, 3, 3, 46339]</div>
  <p>The square roots of 8 and 10 come out as 2 and 3 (rounded down), and the last value shows it working on a number above two billion without floats. In interviews, the signal for this technique is wording like "minimum speed / capacity / days / time such that…", "maximise the minimum", "minimise the largest", and answer ranges up to 10⁹ that make trying every value impossible.</p>

  <h2 id="dsa-bs-matrix"><span class="num">09</span>Searching a 2-D Matrix</h2>
  <p>Biteful's dashboard shows the same times as a board, one row per half hour. With one more order at minute 98, the twelve times fill a 3 × 4 board row by row: <code>[[2, 5, 8, 12], [23, 23, 23, 38], [56, 72, 91, 98]]</code>. Each row continues where the previous one ended, so reading the board row by row gives the sorted list we already know. That means we can binary search it as if it were one list of 12 items, numbering the cells 0 to 11 (the <strong>flat index</strong> k), and convert each k back to a cell: <strong>row = k // cols, column = k % cols</strong>, where <code>cols</code> is the number of columns. Python's <code>divmod</code> does both at once. This is LeetCode 74:</p>
  <div class="fx" data-lang="py">def search_matrix(matrix, target):     # LeetCode 74
    if not matrix or not matrix[0]:
        return None
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        r, c = divmod(mid, cols)       # flat index -&gt; (row, column)
        print(f"  k={mid:2} -&gt; ({r}, {c}) = {matrix[r][c]}")
        if matrix[r][c] == target:
            return (r, c)
        if matrix[r][c] &lt; target:
            lo = mid + 1
        else:
            hi = mid - 1
    return None

board = [[2, 5, 8, 12], [23, 23, 23, 38], [56, 72, 91, 98]]
print(search_matrix(board, 38))</div>
  <div class="fx" data-lang="text">  k= 5 -&gt; (1, 1) = 23
  k= 8 -&gt; (2, 0) = 56
  k= 6 -&gt; (1, 2) = 23
  k= 7 -&gt; (1, 3) = 38
(1, 3)</div>
  <p>The flat indices tested are 5, 8, 6, 7, the same mids as the list search in section 03, because it is the same search; only the conversion is new. Index 7 is row 7 // 4 = 1, column 7 % 4 = 3. The cost is O(log(m·n)) for an m × n board. The divisor must be the number of columns, the row length; using the number of rows works by accident on square boards and fails on this 3 × 4 one.</p>
  <p>A harder version (LeetCode 240) has each row sorted left to right and each column sorted top to bottom, but rows do not continue one another, so there is no single sorted order to flatten. The trick is to start at the <strong>top-right corner</strong>. Everything to its left in the same row is smaller, and everything below it in the same column is bigger. So one comparison removes a whole column (if the value is too big, move left) or a whole row (if it is too small, move down), and the path looks like a staircase:</p>
  <div class="fx" data-lang="py">def search_matrix_ii(grid, target):    # LeetCode 240
    r, c = 0, len(grid[0]) - 1         # start at the top-right corner
    while r &lt; len(grid) and c &gt;= 0:
        v = grid[r][c]
        print(f"  ({r}, {c}) = {v}")
        if v == target:
            return (r, c)
        if v &gt; target:
            c -= 1                     # this whole column is too big from here down
        else:
            r += 1                     # this whole row is too small from here left
    return None

grid = [[2, 8, 23, 56], [5, 12, 38, 72], [23, 30, 40, 91]]
print(search_matrix_ii(grid, 30))</div>
  <div class="fx" data-lang="text">  (0, 3) = 56
  (0, 2) = 23
  (1, 2) = 38
  (1, 1) = 12
  (2, 1) = 30
(2, 1)</div>
  <p>Looking for 30 in a grid of delivery minutes by zone and slot, the walk starts at 56 (too big, move left), reaches 23 (too small, move down), 38 (too big, left), 12 (too small, down) and finds 30 at row 2, column 1. Each step removes a row or a column, so it takes at most m + n steps: O(m + n) time and O(1) space. The bottom-left corner works the same way with the directions swapped; the top-left and bottom-right corners do not, because from them both directions lead to bigger (or both to smaller) values.</p>

  <h2 id="dsa-bs-patterns"><span class="num">10</span>Patterns</h2>
  <p>An interview problem never says "use lower bound". It describes a situation, and your job is to recognise the shape. Nearly every binary search problem is one of six shapes, and five of them are template B with a different yes/no question. That is the most useful idea in this note: find a question that flips exactly once, then search for the flip. Here is template B written once as a reusable function that takes the question as an argument, used on three questions from this note:</p>
  <div class="fx" data-lang="py">def first_true(lo, hi, ok):
    """Smallest x in [lo, hi] with ok(x) True; ok must go F F ... T T. Returns hi + 1 if none."""
    hi += 1
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid                   # mid works: answer is mid or smaller
        else:
            lo = mid + 1               # mid fails: answer is bigger
    return lo

print("first 6:23 order  :", first_true(0, len(times) - 1, lambda i: times[i] &gt;= 23))
print("smallest bag (kg) :", first_true(max(w), sum(w), lambda c: trips_needed(w, c) &lt;= 3))
print("start of the ring :", first_true(0, len(ring) - 1, lambda i: ring[i] &lt;= ring[-1]))</div>
  <div class="fx" data-lang="text">first 6:23 order  : 4
smallest bag (kg) : 6
start of the ring : 3</div>
  <p>The same eight lines found the first 6:23 order (question: is <code>times[i] ≥ 23</code>?), the smallest bag (question: does capacity c need at most 3 trips?), and the start of the ring log (question: is <code>ring[i] ≤</code> its last item?). Once you can phrase the problem as "the smallest x for which <code>ok(x)</code> is true", the code is always the same. The table maps wording to shape.</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Pattern</th><th>Cost</th></tr>
    <tr><td>"sorted array", "return the index or −1", "O(log n)"</td><td>Exact match, template A</td><td>O(log n)</td></tr>
    <tr><td>"first / last occurrence", "insert position", "count of x", "smallest ≥ x", "floor / ceiling"</td><td>Boundary, template B or <code>bisect</code></td><td>O(log n)</td></tr>
    <tr><td>"rotated", "pivot", "sorted then shifted", "circular"</td><td>Rotated: find the sorted half, or B with <code>a[i] &lt;= a[-1]</code></td><td>O(log n)</td></tr>
    <tr><td>"minimum capacity / speed / days such that", "maximise the minimum", "minimise the largest"</td><td>Binary search on the answer with <code>ok(x)</code></td><td>O(n log R)</td></tr>
    <tr><td>"m × n matrix", "rows sorted", "rows and columns sorted"</td><td>Flatten (k // cols, k % cols) or staircase</td><td>O(log mn) / O(m + n)</td></tr>
    <tr><td>"peak", "mountain array", "bitonic"</td><td>Template B with <code>ok(i) = a[i] &gt; a[i + 1]</code></td><td>O(log n)</td></tr>
  </table>
  <p>The last row needs one sentence of explanation: in a mountain array the values rise and then fall, so "is the next value smaller?" is False on the way up and True on the way down, and its first True is the peak (LeetCode 852 and 162). The one thing to check before using any of these is that your question really is monotonic. "Is <code>times[i] == 23</code>?" is not: it goes F F F F T T T F F F F, and binary search on it can return anything. Turn equality into boundaries instead: "≥ 23" for the first and "&gt; 23" for one past the last.</p>

  <h2 id="dsa-bs-mistakes"><span class="num">11</span>Common Mistakes</h2>
  <p>Apart from the loop traps in section 04, the most common bug is using a lower bound as if it were an answer. A lower bound always returns some index, and when the target is bigger than everything that index is <code>len(a)</code>, one past the end. The second bug in the same block is computing a rounded-up division with floats:</p>
  <div class="fx" data-lang="py">import math

i = lower_bound(times, 95)               # no order at 6:95 or later
print(i, len(times))
try:
    print(times[i] == 95)                # forgot "i &lt; len(times)" first
except IndexError as e:
    print("IndexError:", e)

p, k = 10**17 + 1, 1
print(math.ceil(p / k), (p + k - 1) // k)   # float division loses the +1</div>
  <div class="fx" data-lang="text">11 11
IndexError: list index out of range
100000000000000000 100000000000000001</div>
  <p>Searching for minute 95 returns 11, which equals the length of the list, and reading <code>times[11]</code> raises an IndexError. Always check <code>i &lt; len(a)</code> before <code>a[i] == target</code>, in that order. In the second part, <code>math.ceil(p / k)</code> converts to a float, which cannot represent 10¹⁷ + 1 exactly, so the answer is off by one; <code>(p + k - 1) // k</code> stays in exact integers.</p>
  <p>Several other mistakes are worth recognising. Running binary search on unsorted data gives a silent wrong answer, as section 02 showed. Using exact match when the problem asks for the first or last occurrence returns whichever copy the loop happens to hit. In search on the answer, starting <code>lo</code> too low (0 for Koko, or below the heaviest order for the bag) either divides by zero or lets the check accept a bag that cannot hold an order. A check that is not monotonic makes the whole method invalid, so argue monotonicity before coding. In the rotated search, <code>&lt;</code> instead of <code>&lt;=</code> in the sorted-half test fails on two items. In the matrix, dividing by the number of rows instead of columns maps to the wrong cell. And calling <code>insort</code> in a loop is O(n²), not O(n log n).</p>

  <h2 id="dsa-bs-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Binary search</b>: repeatedly test the middle of the remaining range and discard the half that cannot hold the answer; O(log n).</li>
    <li><b>Monotonic question</b>: a yes/no question that, once True, stays True (F F F T T T); binary search finds the first True.</li>
    <li><b>Lower bound</b> (<code>bisect_left</code>): first index with a[i] ≥ x. <b>Upper bound</b> (<code>bisect_right</code>): first index with a[i] &gt; x. Copies of x occupy [lower, upper).</li>
    <li><b>Rotated sorted array</b>: a sorted array cut and swapped; exactly one drop, so one half around mid is always sorted.</li>
    <li><b>Binary search on the answer</b>: search the range of possible answers with a monotonic check <code>ok(x)</code>.</li>
  </ul>
  <h3>The two templates</h3>
  <table class="tbl">
    <tr><th></th><th>A: exact match</th><th>B: first True</th></tr>
    <tr><td>Start</td><td><code>lo, hi = 0, n - 1</code></td><td><code>lo, hi = 0, n</code></td></tr>
    <tr><td>Loop</td><td><code>while lo &lt;= hi</code></td><td><code>while lo &lt; hi</code></td></tr>
    <tr><td>Move</td><td><code>lo = mid + 1</code> / <code>hi = mid - 1</code></td><td>ok → <code>hi = mid</code>, else <code>lo = mid + 1</code></td></tr>
    <tr><td>Result</td><td>mid, or −1 when lo &gt; hi</td><td><code>lo</code> (n means none)</td></tr>
  </table>
  <h3>Formulas and costs</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Rule</th></tr>
    <tr><td>Looks needed</td><td>⌈log₂(n + 1)⌉: 11 → 4, 10⁶ → 20, 10⁹ → 30</td></tr>
    <tr><td>mid in Java/C++</td><td><code>lo + (hi - lo) / 2</code> (avoids overflow)</td></tr>
    <tr><td>Count of x; count in [a, b]</td><td><code>bisect_right(x) - bisect_left(x)</code>; <code>bisect_right(b) - bisect_left(a)</code></td></tr>
    <tr><td>Rotated</td><td>left sorted iff <code>a[lo] &lt;= a[mid]</code>; min: <code>a[mid] &gt; a[hi]</code> → go right</td></tr>
    <tr><td>On the answer</td><td>O(n log R); integer ceil <code>(p + k - 1) // k</code></td></tr>
    <tr><td>2-D</td><td>flat k → <code>divmod(k, cols)</code>; staircase from top-right O(m + n)</td></tr>
    <tr><td>insort</td><td>O(n) per insert (shifting)</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from bisect import bisect_left, bisect_right, insort

def first_true(lo, hi, ok):            # template B over [lo, hi]
    hi += 1
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if ok(mid): hi = mid
        else:       lo = mid + 1
    return lo                          # hi + 1 means "never True"

i = bisect_left(a, x)
found = i &lt; len(a) and a[i] == x       # check before trusting i</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Unsorted input: silent wrong answer.</li>
    <li><code>while lo &lt; hi</code> in template A misses the last item; <code>lo = mid</code> loops forever.</li>
    <li>Exact match on duplicates is not "the first".</li>
    <li>Check <code>i &lt; len(a)</code> before <code>a[i]</code> after a lower bound.</li>
    <li>Rotated half test uses <code>&lt;=</code>; find-min compares with <code>a[hi]</code>.</li>
    <li>Integer ceil, not <code>math.ceil(p / k)</code>; start Koko at 1, the bag at max weight.</li>
    <li>Flat index divides by columns.</li>
  </ul>

  <h2 id="dsa-bs-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is binary search, and what is its time and space complexity?</summary><div class="qa-body">It searches sorted data by testing the middle of the remaining range and discarding the half that cannot contain the answer. The range halves every step, so it takes O(log n) time. The iterative version uses O(1) extra space; a recursive version uses O(log n) for the call stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly does binary search require of the data?</summary><div class="qa-body">A yes/no question over the range that is monotonic, flipping from False to True only once; sorted data is the common case. It also needs random access, so that jumping to index mid is O(1). A linked list fails that second requirement.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>About how many comparisons does binary search need for a million items? A billion?</summary><div class="qa-body">About 20 for a million, because 2²⁰ ≈ 1,048,576, and about 30 for a billion. Each extra doubling of the data adds only one comparison.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should you sort an unsorted list in order to binary search it?</summary><div class="qa-body">Only if you will search many times. Sorting costs O(n log n), more than one O(n) scan. For k searches, sorting once costs O(n log n + k log n) versus O(k·n) for scanning. For many membership checks on unsorted data, a set gives O(1) average lookups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do Java and C++ programmers write <code>mid = lo + (hi - lo) / 2</code>?</summary><div class="qa-body">With 32-bit integers, <code>lo + hi</code> can exceed the maximum value and wrap around to a negative number, giving a negative index. <code>lo + (hi - lo) / 2</code> never exceeds hi. Python integers do not overflow, so <code>(lo + hi) // 2</code> is safe there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your loop is <code>while lo &lt; hi</code> with <code>lo = mid</code>. What goes wrong?</summary><div class="qa-body">When only two items remain, <code>(lo + hi) // 2</code> equals lo, so <code>lo = mid</code> changes nothing and the loop never ends. Use <code>lo = mid + 1</code>, or round mid up with <code>(lo + hi + 1) // 2</code> if the logic genuinely needs <code>lo = mid</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between the exact-match template and the boundary template?</summary><div class="qa-body">Exact match uses a closed window [lo, hi], loops while lo &lt;= hi, moves by mid ± 1 and returns an index of the target or −1. The boundary template uses a half-open window [lo, hi), loops while lo &lt; hi, keeps mid with hi = mid when the condition holds, and returns the first index where the condition is true. The boundary template handles duplicates, insert positions and search on the answer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>bisect_left</code> and <code>bisect_right</code> return, and how do you count occurrences of x?</summary><div class="qa-body"><code>bisect_left</code> returns the first index with a[i] ≥ x; <code>bisect_right</code> returns the first index with a[i] &gt; x. The number of copies of x is their difference. On the order log, x = 23 gives 4 and 7, so three orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>bisect.insort</code> O(log n)?</summary><div class="qa-body">No. Finding the position is O(log n), but inserting into a Python list shifts all later items, so each insort is O(n) and n of them cost O(n²). For many inserts, sort once at the end, use a heap, or use a balanced-tree structure such as <code>sortedcontainers.SortedList</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a rotated sorted array, why is one half around mid always sorted?</summary><div class="qa-body">A rotated array has exactly one drop. Mid splits the range into two halves, and the drop can be in only one of them, so the other half is an ordinary sorted run. A range check on that half tells you whether the target can be there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>To find the minimum of a rotated array, why compare <code>nums[mid]</code> with <code>nums[hi]</code> rather than <code>nums[lo]</code>?</summary><div class="qa-body">If nums[mid] &gt; nums[hi], the drop, and so the minimum, must be to the right of mid; otherwise mid..hi is sorted and mid may be the minimum. Comparing with nums[lo] breaks on an array that is not rotated at all, where mid is bigger than lo and the search would wrongly move right.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a rotated array with duplicates change the complexity?</summary><div class="qa-body">When nums[mid] equals nums[hi] (or nums[lo]), you cannot tell which half is sorted, so you can only shrink the window by one. In the worst case, such as all equal values with one different, that makes the search O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you recognise "binary search on the answer", and what is its cost?</summary><div class="qa-body">The problem asks for the smallest or largest value (speed, capacity, days) such that a condition holds, and the condition is monotonic, for example a bigger capacity never hurts. Binary search the range of values with a check function. Cost is O(log R) checks times the cost of one check, often O(n log R).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if the check in binary search on the answer is not monotonic?</summary><div class="qa-body">The search assumes that if mid works, everything bigger works, and throws away the upper half. If some larger value failed, the search could skip the true answer or return a value that does not work. That is why you argue monotonicity first, for example that trips only decrease as capacity grows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you search a matrix whose rows and columns are both sorted?</summary><div class="qa-body">Start at the top-right corner. If the value is bigger than the target, move left, ruling out that column; if smaller, move down, ruling out that row. At most m + n steps, so O(m + n). If the whole matrix is sorted row after row, treat it as one list and map k to (k // cols, k % cols) for O(log mn).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you find a peak in a mountain array in O(log n)?</summary><div class="qa-body">Use the boundary template with the question "is a[i] &gt; a[i + 1]?". On the way up it is False and on the way down it is True, so the first True is the peak.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test a binary search implementation quickly?</summary><div class="qa-body">Try an empty list, one item (target present and absent), two items (target first and second), a target smaller than everything and bigger than everything, and duplicates. Most off-by-one bugs show up on sizes 0, 1 and 2.</div></details>
</main>
`
});
