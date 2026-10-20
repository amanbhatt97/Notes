// notes/dsa/dsa_binsearch.js — Binary Search
Object.assign(TOPIC_CONTENT, {
  "dsa_binsearch": `<main>
<h1>Binary Search</h1>
  <div class="where"><span>DSA</span><span>Searching &amp; Sorting</span><span>Binary Search</span></div>
  <p class="lead">Binary search finds an item in a sorted list by checking the middle and throwing away half the list each time. It turns a million checks into twenty. Interviewers love it because the idea is easy but the loop is easy to get wrong by one. The whole note follows one running example: the times of Biteful's evening orders, kept sorted. We start by finding one order, then the first and last order at a busy minute, then a rotated log, then questions where nothing is sorted at all but binary search still works ("the smallest bag that fits"). Every output below is a real run (Python 3.13).</p>

  <h2 id="dsa-bs-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-bs-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="60" y="6" width="520" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Complexity (O(log n)) · Arrays (index access) · Sorting (sorted data) · Stacks &amp; Queues</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-bs-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Binary Search</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · halve the search space</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bs-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bs-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bs-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Trees</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">BST = binary search as a structure</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Heaps</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">order without full sorting</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Greedy &amp; DP</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">"search on the answer" + a check</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bs-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">used again in</text>
<text x="320" y="245" text-anchor="middle" font-size="11">database indexes (B-trees) · git bisect · the Problem Tracker's binary search ladder</text>
</svg><figcaption>Binary Search needs data that is sorted (Sorting note) and can be jumped into by index (Arrays). The next note, Trees, turns the same halving idea into a structure: the binary search tree.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_complexity">Complexity</a>, <a class="xref" data-note="dsa_arrays">Arrays</a>, <a class="xref" data-note="dsa_sorting">Sorting</a>, <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a></b><span>You can sort a list, jump to any index in O(1), and you know O(log n) means "halving". The stack and queue tools all walk the data once in order, O(n). None of them uses the fact that the data is <em>sorted</em>.</span></li>
    <li><b>This note adds: search by halving</b><span>On sorted data (or any yes/no question that flips only once), look at the middle and throw away the half that cannot hold the answer. Exact match, first/last position, rotated arrays, a 2-D board, and "search on the answer".</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_trees">Trees</a></b><span>A binary search tree is this note's loop frozen into nodes, so lookups stay O(log n) even while orders are inserted. Then <a class="xref" data-note="dsa_heaps">Heaps</a>. Practice problems are in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-bs-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it, and its weakness raises the next question. Numbers come from Biteful's 11 order times and real runs.</p>
  <ol class="story">
    <li><b>The need</b><span>Q: was there an order at 6:38 pm, among 10 lakh sorted order times, without scanning? → A scan checks up to 10 lakh times; 200 lookups took about 2 s. Halving needs about 20 checks per lookup and the same 200 lookups took well under a millisecond (measured). But why does halving need the list sorted?</span></li>
    <li><b>Sortedness / monotonic</b><span>Q: when may we throw half away? → Only when a yes/no question flips once: F F F T T T. On a shuffled list the search for an order that exists returns −1. So how do we actually run the halving?</span></li>
    <li><b>Classic binary search</b><span>Q: where is 38 in [2, 5, 8, 12, 23, 23, 23, 38, 56, 72, 91]? → lo/hi/mid table: 4 checks, index 7. Absent 40 ends with lo = 8. But tiny changes (&lt; vs &lt;=, mid vs mid − 1) break it…</span></li>
    <li><b>Off-by-one traps</b><span>Q: why do my loops miss items or never stop? → <code>while lo &lt; hi</code> skips the last item; <code>lo = mid</code> loops forever; in Java <code>lo + hi</code> overflows. Fix: two templates, never mixed. And the classic search for 23 returned index 5, but the first 6:23 order is index 4…</span></li>
    <li><b>Leftmost / rightmost (bisect)</b><span>Q: first and last order at 6:23? → lower bound 4, upper bound 7: three orders, indices 4..6. <code>bisect_left</code> / <code>bisect_right</code> do it in one call. But what if the log is not plainly sorted, because it wraps around midnight?</span></li>
    <li><b>Rotated array</b><span>Q: search a sorted log that was cut and swapped, [56, 72, 91, 2, 5, 8, 12, 23, 38]? → One half around mid is always sorted; check that half's range. 8 found at index 5; the minimum 2 at index 3. What if there is no list at all, only a question like "smallest bag that fits"?</span></li>
    <li><b>Binary search on the answer</b><span>Q: smallest rider bag capacity to carry orders weighing [3, 2, 2, 4, 1, 4] kg, in order, in 3 trips? → "fits in 3 trips?" is F F T T over capacities 4..16; binary search finds 6 in 4 checks. And when the sorted data comes as a grid?</span></li>
    <li><b>2-D matrix</b><span>Q: is 38 on a 3 × 4 board of times? → Treat the board as one sorted list: index k is row k // 4, column k % 4. 4 checks again. If only rows and columns are sorted, walk a staircase from the top-right in O(m + n).</span></li>
  </ol>

  <h2 id="dsa-bs-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Binary Search</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea &amp; need</div>
        <ul>
          <li><b>What</b>: look at the middle, throw away the half that can't have the answer</li>
          <li><b>Why</b>: linear search checks every item: 10 lakh items = 10 lakh checks</li>
          <li><b>Halving</b>: 1 million → 20 checks; 1 billion → 30 checks</li>
          <li><b>Cost</b>: O(log n) time, O(1) extra space (iterative)</li>
          <li>💡 Number guessing game with "higher / lower" hints; opening a dictionary near the middle</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When it works</div>
        <ul>
          <li><b>Sorted</b> data, or any <b>monotonic</b> yes/no question (once yes, always yes)</li>
          <li>Picture: <code>F F F F T T T</code>: find the first T</li>
          <li><b>Random access</b> needed: jump to index mid in O(1) (list, not linked list)</li>
          <li>⚠ Unsorted input gives wrong answers silently, no error</li>
          <li>Sorting first costs O(n log n): worth it only for many searches</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li><b>Exact match</b>: <code>lo, hi = 0, n-1</code>; <code>while lo &lt;= hi</code>; <code>lo = mid+1</code> / <code>hi = mid-1</code></li>
          <li><b>mid</b>: <code>(lo + hi) // 2</code>; in Java/C++ write <code>lo + (hi-lo)//2</code> (overflow)</li>
          <li><b>Boundary (first True)</b>: <code>lo, hi = 0, n</code>; <code>while lo &lt; hi</code>; True → <code>hi = mid</code>, False → <code>lo = mid+1</code></li>
          <li>Answer of the boundary loop = <code>lo</code> (can be n = "not found / insert at end")</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Off-by-one traps</div>
        <ul>
          <li>⚠ <code>while lo &lt; hi</code> with exact-match loop skips the last single item</li>
          <li>⚠ <code>lo = mid</code> (not mid+1) → infinite loop when lo + 1 == hi</li>
          <li>⚠ Mixing templates: <code>hi = n</code> but <code>hi = mid - 1</code></li>
          <li>Fix: pick one template, know what [lo, hi] means, test sizes 0, 1, 2</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">bisect module</div>
        <ul>
          <li><b>bisect_left(a, x)</b>: first index with a[i] ≥ x</li>
          <li><b>bisect_right(a, x)</b>: first index with a[i] &gt; x</li>
          <li><b>Count of x</b> = right − left · <b>count in [lo, hi]</b> = right(hi) − left(lo)</li>
          <li><b>insort</b>: keeps list sorted; find is O(log n) but insert shifts → O(n)</li>
          <li><b>key=</b> argument (Python 3.10+) to search by a field</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rotated arrays</div>
        <ul>
          <li><b>Rotated</b>: sorted list cut and swapped: <code>[56, 72, 91, 2, 5, …]</code></li>
          <li><b>Key fact</b>: at any mid, at least one half is fully sorted</li>
          <li><b>Search</b>: find the sorted half; is target inside its range? go there, else other side</li>
          <li><b>Find min</b>: compare <code>nums[mid]</code> with <code>nums[hi]</code>: bigger → min is right</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Search on the answer</div>
        <ul>
          <li><b>Signal</b>: "minimum speed / capacity / days such that …"</li>
          <li><b>How</b>: binary search the answer range; check each guess with a helper <code>ok(x)</code></li>
          <li><b>Bag capacity</b>: range [max weight, total]; first capacity with trips ≤ D</li>
          <li><b>Cost</b>: O(n · log(range))</li>
          <li>⚠ ceil(p/k) in integers: <code>(p + k - 1) // k</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running example</div>
        <ul>
          <li>Times: <b>[2, 5, 8, 12, 23, 23, 23, 38, 56, 72, 91]</b> (minutes after 6 pm)</li>
          <li>38 → index 7 in 4 checks; 40 → absent, insert at 8</li>
          <li>23: first 4, last 6, count 3</li>
          <li>Bag for [3, 2, 2, 4, 1, 4] in 3 trips: 6 kg</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-bs-game"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Find an Order Without Scanning</span><span class="rm-sub">10 lakh times, measured</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-sorted"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Why It Must Be Sorted</span><span class="rm-sub">Sorted or yes/no monotonic</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-loop"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Classic Loop</span><span class="rm-sub">lo/hi/mid table, Big-O</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-traps"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Off-by-One Traps</span><span class="rm-sub">Two templates; mid overflow</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-bisect"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Leftmost &amp; Rightmost</span><span class="rm-sub">bisect_left, bisect_right, insort</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-sortedprob"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Problems on Sorted Arrays</span><span class="rm-sub">Binary Search, Insert Position, First/Last</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-rotated"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Rotated Sorted Arrays</span><span class="rm-sub">Search, find minimum</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-answer"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Binary Search on the Answer</span><span class="rm-sub">Bag capacity, Koko</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-matrix"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">2-D Matrix</span><span class="rm-sub">Flatten the index; staircase</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Trigger words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bs-game"><span class="num">01</span>Find an Order Without Scanning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every tool so far (loops, two pointers, stacks, queues) walks the data from one end. With 10 lakh orders that is 10 lakh steps per question. If the data is already sorted, is there a way to find one item without looking at most of them?</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful logs the time of every order as minutes after 6:00 pm, and the log is always kept sorted. On a quiet evening there were 11 orders; three of them came in the same minute, 6:23 pm, when a cricket match ended:</p>
  <table class="tbl"><caption>The running example: 11 sorted order times (minutes after 6:00 pm)</caption>
    <tr><th>index</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr>
    <tr><td>minute</td><td>2</td><td>5</td><td>8</td><td>12</td><td>23</td><td>23</td><td>23</td><td>38</td><td>56</td><td>72</td><td>91</td></tr>
    <tr><td>clock</td><td>6:02</td><td>6:05</td><td>6:08</td><td>6:12</td><td>6:23</td><td>6:23</td><td>6:23</td><td>6:38</td><td>6:56</td><td>7:12</td><td>7:31</td></tr>
  </table>
  <p>Support gets calls like "my order at 6:38 didn't arrive". The first job is to find that order. With 11 orders, reading left to right is fine. On a festival night Biteful has 10 lakh orders, and support gets thousands of such calls.</p>
  <h3>Measured: scanning vs halving</h3>
  <p>We build 10 lakh sorted order times (seconds since opening) and look up 200 of them, once by scanning (<code>list.index</code>, which walks from the left) and once with <code>bisect_left</code>, Python's built-in binary search (explained in section 05). Both give the same positions.</p>
<div class="fx" data-lang="py">import random, time
from bisect import bisect_left

random.seed(42)
times_big = sorted(random.sample(range(50_000_000), 1_000_000))   # 10 lakh distinct order times
queries = random.sample(times_big, 200)

t = time.perf_counter()
pos_scan = [times_big.index(q) for q in queries]                   # walks from index 0 each time
t_scan = time.perf_counter() - t

t = time.perf_counter()
pos_half = [bisect_left(times_big, q) for q in queries]            # halves the range each time
t_half = time.perf_counter() - t

print(f"scan  : {t_scan:.3f} s for 200 lookups")
print(f"halve : {t_half * 1000:.3f} ms for 200 lookups")
print("same positions:", pos_scan == pos_half, "| about", round(t_scan / t_half), "times faster")</div>
  <div class="fx" data-lang="text">scan  : 2.037 s for 200 lookups
halve : 0.261 ms for 200 lookups
same positions: True | about 7803 times faster</div>
  <p>Same answers, and halving is thousands of times faster. The scan's cost depends on <em>where</em> the order sits (an order near the end needs nearly 10 lakh comparisons); halving needs about 20 comparisons wherever it sits.</p>
  <h3>The idea: the guessing game</h3>
  <p>A friend thinks of a number from 1 to 100. You guess, and she only says "higher" or "lower". You could ask 1, 2, 3, … and need up to 100 guesses. Or you could guess 50 first. Whatever she says, half the numbers are gone in one go.</p>
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
  <p>That is the whole idea. <strong>Binary search</strong> means: look at the middle item, decide which half can still hold the answer, and drop the other half. "Binary" because each step splits into two.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding "mango" in a printed dictionary. You open near the middle, see "light", and know mango is after it. You never read page 1. It works only because the dictionary is in A–Z order.</p>
  </div>
  <p>How many halvings until one item is left? For 100 items: 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1. That is about 7 steps. The number of halvings is called <strong>log₂ n</strong> (log base 2: "how many times can I halve n").</p>
<div class="fx" data-lang="py">import math
for n in [11, 100, 1_000, 1_000_000, 1_000_000_000]:
    worst = math.ceil(math.log2(n + 1))
    print(f"{n:&gt;13,} items  linear: up to {n:&gt;13,} checks  binary: up to {worst} checks")</div>
  <div class="fx" data-lang="text">           11 items  linear: up to            11 checks  binary: up to 4 checks
          100 items  linear: up to           100 checks  binary: up to 7 checks
        1,000 items  linear: up to         1,000 checks  binary: up to 10 checks
    1,000,000 items  linear: up to     1,000,000 checks  binary: up to 20 checks
1,000,000,000 items  linear: up to 1,000,000,000 checks  binary: up to 30 checks</div>
  <p>Our 11 orders need at most 4 checks; a billion items need 30. This is why binary search is written as <strong>O(log n)</strong> and linear search as <strong>O(n)</strong>.</p>
  <h3>Where you meet it</h3>
  <ul>
    <li>Looking up a roll number in a marksheet sorted by roll number.</li>
    <li>Databases: B-tree indexes do a binary-search-like walk to find a row.</li>
    <li><code>git bisect</code>: finds the commit that broke the code by testing the middle commit.</li>
    <li>ML: picking a threshold, finding the smallest batch size that fits in GPU memory.</li>
    <li>Interviews: "sorted array", "find the minimum X such that…": both point here.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Binary search</strong>: repeatedly compare the target with the middle element of the remaining range of a sorted sequence and discard the half that cannot contain it. O(log n) comparisons, because the range halves each step.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"<code>x in my_list</code> is one line, so it is fast." It is a hidden scan, O(n). On sorted data, use <code>bisect</code>; on unsorted data that you query many times, use a set or dict (the <a class="xref" data-note="dsa_hashing">Hashing</a> note).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Why It Must Be Sorted.</b> Halving threw away half the orders after one look. That is only safe if the order of the list guarantees the answer is not in the discarded half. What exactly must be true of the data?</div>

  <h2 id="dsa-bs-sorted"><span class="num">02</span>Why It Must Be Sorted</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 assumed the log was sorted. What happens if it isn't, and is "sorted" really the condition, or is there a more general rule that lets binary search work on things that are not lists at all?</p>
  </div>
  <p>When we look at the middle and say "the answer is on the right", we are trusting the order. If the list is not sorted, that trust is wrong. Binary search then gives a wrong answer and no error. Here is the same search on our order times, once as logged (sorted) and once after a bug shuffled the log.</p>
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
  <p>38 is at index 7 of the shuffled log, but the search said −1 ("not there"). The middle was 56, and 56 &gt; 38, so it threw away the right half, which held the 38. No crash, just a wrong answer.</p>
  <div class="callout def"><span class="label">The real requirement</span>
    <p>"Sorted" is one case of a wider rule: you need a yes/no question that, once it becomes yes, stays yes. This is called <strong>monotonic</strong> (only goes one way). Then the answers look like <code>F F F F T T T</code>, and binary search finds the first <code>T</code>.</p>
  </div>
  <table class="tbl">
    <tr><th>Question</th><th>Answers along the range</th><th>Monotonic?</th></tr>
    <tr><td>Is <code>times[i] ≥ 23</code>? (i = 0..10)</td><td>F F F F T T T T T T T</td><td>Yes: first T at index 4</td></tr>
    <tr><td>Does a bag of capacity c carry the orders in 3 trips?</td><td>F F T T T … (bigger never hurts)</td><td>Yes: section 08</td></tr>
    <tr><td>Does this commit have the bug? (git bisect)</td><td>F F F T T T (bug stays once added)</td><td>Yes</td></tr>
    <tr><td>Is <code>times[i]</code> even?</td><td>T F T T F F F T T T F</td><td>No: can't binary search</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sorting just to search once. Sorting costs O(n log n), more than one linear scan O(n). Sort once only if you will search many times. Also, binary search needs <strong>random access</strong> (jump straight to index mid). A Python list has it; a linked list does not.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Classic Loop.</b> We know <em>when</em> halving is allowed. Now we need the exact loop: which variables, which comparisons, and when to stop.</div>

  <h2 id="dsa-bs-loop"><span class="num">03</span>The Classic Loop: lo, hi, mid</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Look at the middle and drop half" is an idea, not code. How do we keep track of the part still possible, what exactly happens at each step, and how do we know when the order is not there?</p>
  </div>
  <p>We keep two markers. <code>lo</code> is the first index that can still hold the answer. <code>hi</code> is the last one. Everything outside <code>[lo, hi]</code> is ruled out.</p>
  <ol>
    <li>Take the middle: <code>mid = (lo + hi) // 2</code>.</li>
    <li>If <code>a[mid]</code> is the target, done.</li>
    <li>If <code>a[mid]</code> is too small, the answer is right of mid: <code>lo = mid + 1</code>.</li>
    <li>If too big, it's left of mid: <code>hi = mid - 1</code>.</li>
    <li>Stop when <code>lo &gt; hi</code>: nothing left to check, so not found.</li>
  </ol>
  <h3>Recognise it</h3>
  <p>Trigger words: "sorted array", "return the index or −1", "in O(log n)", "guess higher or lower".</p>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Find 38 (the 6:38 order) in [2, 5, 8, 12, 23, 23, 23, 38, 56, 72, 91]</caption>
    <tr><th>step</th><th>lo</th><th>hi</th><th>mid</th><th>a[mid]</th><th>compare</th><th>action</th></tr>
    <tr><td>1</td><td>0</td><td>10</td><td>5</td><td>23</td><td>23 &lt; 38</td><td>lo = 6</td></tr>
    <tr><td>2</td><td>6</td><td>10</td><td>8</td><td>56</td><td>56 &gt; 38</td><td>hi = 7</td></tr>
    <tr><td>3</td><td>6</td><td>7</td><td>6</td><td>23</td><td>23 &lt; 38</td><td>lo = 7</td></tr>
    <tr><td>4</td><td>7</td><td>7</td><td>7</td><td>38</td><td>equal</td><td>return 7</td></tr>
  </table>
  <table class="tbl out"><caption>Find 40 (no order at 6:40): same first three steps, then</caption>
    <tr><th>step</th><th>lo</th><th>hi</th><th>mid</th><th>a[mid]</th><th>compare</th><th>action</th></tr>
    <tr><td>4</td><td>7</td><td>7</td><td>7</td><td>38</td><td>38 &lt; 40</td><td>lo = 8</td></tr>
    <tr><td>–</td><td>8</td><td>7</td><td colspan="4">lo &gt; hi: window empty → return −1</td></tr>
  </table>
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
  <h3>The code</h3>
  <p>The same search, printing each step so you can compare it with the tables.</p>
<div class="fx" data-lang="py">def binary_search_trace(a, target):
    lo, hi = 0, len(a) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        print(f"lo={lo} hi={hi} mid={mid} a[mid]={a[mid]}")
        if a[mid] == target:
            return mid
        if a[mid] &lt; target:
            lo = mid + 1          # answer is right of mid
        else:
            hi = mid - 1          # answer is left of mid
    print(f"stop: lo={lo} &gt; hi={hi}")
    return -1                     # lo passed hi: nothing left

print("index:", binary_search_trace(times, 38))
print("index:", binary_search_trace(times, 40))</div>
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
  <p>For 40 the window closes at <code>lo=8, hi=7</code>. <code>lo</code> passed <code>hi</code>, so 40 is not in the list. Note: <code>lo=8</code> is also exactly where 40 would be inserted to keep the list sorted (between 6:38 and 6:56). That fact comes back in Search Insert Position.</p>
  <h3>Complexity</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>Why</th></tr>
    <tr><td>Linear search (any list)</td><td>O(n)</td><td>May look at every item once</td></tr>
    <tr><td>Binary search, iterative</td><td>O(log n) time, O(1) space</td><td>Halves the window each step; only 3 variables</td></tr>
    <tr><td>Binary search, recursive</td><td>O(log n) time, O(log n) space</td><td>Each halving adds one call to the call stack</td></tr>
    <tr><td>Sort, then search once</td><td>O(n log n)</td><td>Sorting is the expensive part</td></tr>
    <tr><td>Sort once, then k searches</td><td>O(n log n + k log n)</td><td>Pays off when k is large</td></tr>
    <tr><td><code>bisect.insort</code> into a list</td><td>O(n)</td><td>Finding the spot is O(log n), but shifting items right is O(n)</td></tr>
    <tr><td>Search on the answer</td><td>O(n · log R)</td><td>log R guesses over the answer range R, each check costs O(n)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Classic (exact-match) binary search</strong> keeps the closed window <code>[lo, hi]</code> of indices that may still hold the target, tests <code>mid = (lo + hi) // 2</code>, and moves <code>lo = mid + 1</code> or <code>hi = mid − 1</code>. It ends when the target is found or when <code>lo &gt; hi</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Duplicates. Search the running example for 23 and the loop returns index 5 (the first mid it tries), not 4, the <em>first</em> 6:23 order. Exact match promises "an" index, never "the first". Section 05 fixes this.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>704 Binary Search</b> (this loop), <b>374 Guess Number Higher or Lower</b> (the guessing game with an API), <b>35 Search Insert Position</b> (return <code>lo</code> instead of −1).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Off-by-One Traps.</b> The loop has three tiny choices: <code>&lt;</code> or <code>&lt;=</code>, <code>mid</code> or <code>mid − 1</code>, <code>n</code> or <code>n − 1</code>. Change any one and it can skip the answer or never stop. Which combinations are safe?</div>

  <h2 id="dsa-bs-traps"><span class="num">04</span>Off-by-One Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The classic loop works, but most people rewrite it from memory with one symbol different. Which small changes break it, how do they show up, and is there a safe rule for writing it every time?</p>
  </div>
  <p>The idea is simple. The bugs live in three small choices: <code>&lt;</code> or <code>&lt;=</code>, <code>mid</code> or <code>mid - 1</code>, <code>n</code> or <code>n - 1</code>. Mixing them gives wrong answers or a loop that never ends.</p>
  <div class="callout trap"><span class="label">Trap 1: while lo &lt; hi in the exact-match loop</span>
    <p>When the window has one item (<code>lo == hi</code>), the loop stops before checking it. In our 38 search, step 4 had <code>lo = hi = 7</code>: exactly the step that finds 38.</p>
  </div>
<div class="fx" data-lang="py">def search_bug1(a, target):
    lo, hi = 0, len(a) - 1
    while lo &lt; hi:                    # BUG: should be &lt;=
        mid = (lo + hi) // 2
        if a[mid] == target: return mid
        if a[mid] &lt; target: lo = mid + 1
        else: hi = mid - 1
    return -1

print(search_bug1(times, 38), search_bug1([7], 7), search_bug1([1, 3], 3))     # all present!</div>
  <div class="fx" data-lang="text">-1 -1 -1</div>
  <div class="callout trap"><span class="label">Trap 2: lo = mid causes an infinite loop</span>
    <p>With two items left, <code>mid</code> rounds down to <code>lo</code>. Setting <code>lo = mid</code> changes nothing, so the loop runs forever.</p>
  </div>
<div class="fx" data-lang="py">def search_bug2(a, target):
    lo, hi, steps = 0, len(a) - 1, 0
    while lo &lt; hi:
        steps += 1
        if steps &gt; 20: return "stuck at lo=%d hi=%d" % (lo, hi)
        mid = (lo + hi) // 2
        if a[mid] &lt; target: lo = mid  # BUG: should be mid + 1
        else: hi = mid
    return lo

print(search_bug2(times, 91))</div>
  <div class="fx" data-lang="text">stuck at lo=9 hi=10</div>
  <div class="callout trap"><span class="label">Trap 3: mid overflow (Java, C++, Go)</span>
    <p>Python integers never overflow, so <code>(lo + hi) // 2</code> is always safe here. In languages with 32-bit <code>int</code>, <code>lo + hi</code> can pass 2,147,483,647 and wrap to a negative number, giving a negative mid. The safe form is <code>lo + (hi - lo) / 2</code>. Below we imitate 32-bit wrap-around to see it.</p>
  </div>
<div class="fx" data-lang="py">def as_int32(x):                       # what a 32-bit int would hold
    return (x + 2**31) % 2**32 - 2**31

lo, hi = 1_500_000_000, 2_000_000_000
print("Python (lo + hi) // 2      :", (lo + hi) // 2)
print("32-bit  (lo + hi) / 2      :", as_int32(lo + hi) // 2, "&lt;- negative index!")
print("32-bit  lo + (hi - lo) / 2 :", as_int32(lo + as_int32(hi - lo) // 2))</div>
  <div class="fx" data-lang="text">Python (lo + hi) // 2      : 1750000000
32-bit  (lo + hi) / 2      : -397483648 &lt;- negative index!
32-bit  lo + (hi - lo) / 2 : 1750000000</div>
  <p>The cure for traps 1 and 2: learn two templates and never mix them.</p>
  <table class="tbl">
    <tr><th></th><th>Template A: exact match</th><th>Template B: first True (boundary)</th></tr>
    <tr><td>Question</td><td>"Where is x?" or −1</td><td>"First index where <code>ok(i)</code> is True"</td></tr>
    <tr><td>Start</td><td><code>lo, hi = 0, n - 1</code></td><td><code>lo, hi = 0, n</code></td></tr>
    <tr><td>Window means</td><td>[lo, hi], both ends included</td><td>[lo, hi), hi not included</td></tr>
    <tr><td>Loop</td><td><code>while lo &lt;= hi</code></td><td><code>while lo &lt; hi</code></td></tr>
    <tr><td>Move</td><td><code>lo = mid + 1</code> / <code>hi = mid - 1</code></td><td>True → <code>hi = mid</code>, False → <code>lo = mid + 1</code></td></tr>
    <tr><td>Answer</td><td>return mid when equal, else −1</td><td><code>lo</code> (n means "no True at all")</td></tr>
  </table>
  <p>Template B is called <strong>lower bound</strong> when <code>ok(i)</code> is <code>a[i] &gt;= x</code>. It answers more questions than template A: first position, insert position, count, ranges, and (section 08) "smallest capacity that works".</p>
<div class="fx" data-lang="py">def lower_bound(a, x):
    """First index i with a[i] &gt;= x (len(a) if none)."""
    lo, hi = 0, len(a)
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if a[mid] &gt;= x:
            hi = mid            # mid might be the answer: keep it
        else:
            lo = mid + 1        # mid is too small: drop it
    return lo

for x in [0, 23, 30, 91, 100]:
    print(f"lower_bound(times, {x}) = {lower_bound(times, x)}")
print("empty list:", lower_bound([], 5))</div>
  <div class="fx" data-lang="text">lower_bound(times, 0) = 0
lower_bound(times, 23) = 4
lower_bound(times, 30) = 7
lower_bound(times, 91) = 10
lower_bound(times, 100) = 11
empty list: 0</div>
  <p>Read the answers as Biteful facts: the first order at or after 6:23 is index 4; the first at or after 6:30 is index 7 (6:38); nothing is at or after minute 100, so the answer is 11 = <code>len(times)</code>.</p>
  <div class="callout intu"><span class="label">How to test any binary search in 30 seconds</span>
    <p>Try an empty list, one item (found and not found), two items (target first, target second), a target smaller than all and bigger than all, and duplicates. Most off-by-one bugs show up on sizes 0, 1 and 2.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>off-by-one error</strong> is a boundary mistake of exactly one: a loop that runs one time too few or too many, or an index one too low or high. In binary search it comes from mixing a closed window <code>[lo, hi]</code> with a half-open one <code>[lo, hi)</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>278 First Bad Version</b> (template B on F F F T T), <b>35 Search Insert Position</b> (lower bound), <b>69 Sqrt(x)</b> (a boundary where the off-by-one is easy to get wrong).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Leftmost &amp; Rightmost.</b> Template B can find the first order at or after a time. Support's real question at 6:23 is "which orders came in that minute?": the first <em>and</em> the last index of 23, and how many.</div>

  <h2 id="dsa-bs-bisect"><span class="num">05</span>Leftmost &amp; Rightmost: Python's bisect</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Exact match found <em>a</em> 6:23 order at index 5, but three orders share that minute. Which is the first, which is the last, and can we count them without walking left and right (which is O(n) if a whole festival rush lands in one minute)?</p>
  </div>
  <p>Two boundary searches answer it. <strong>Leftmost</strong> (lower bound): first index with value ≥ 23. <strong>Rightmost + 1</strong> (upper bound): first index with value &gt; 23. Everything in between equals 23.</p>
  <h3>Recognise it</h3>
  <p>Trigger words: "first / last occurrence", "insert position", "how many equal to x", "how many in the range [a, b]", "smallest element greater than x", "floor / ceiling".</p>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Lower bound of 23: first index with times[i] ≥ 23 (template B, n = 11)</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>times[mid]</th><th>≥ 23?</th><th>action</th></tr>
    <tr><td>0</td><td>11</td><td>5</td><td>23</td><td>yes</td><td>hi = 5</td></tr>
    <tr><td>0</td><td>5</td><td>2</td><td>8</td><td>no</td><td>lo = 3</td></tr>
    <tr><td>3</td><td>5</td><td>4</td><td>23</td><td>yes</td><td>hi = 4</td></tr>
    <tr><td>3</td><td>4</td><td>3</td><td>12</td><td>no</td><td>lo = 4</td></tr>
    <tr><td colspan="5">lo == hi</td><td><b>4</b></td></tr>
  </table>
  <table class="tbl out"><caption>Upper bound of 23: first index with times[i] &gt; 23</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>times[mid]</th><th>&gt; 23?</th><th>action</th></tr>
    <tr><td>0</td><td>11</td><td>5</td><td>23</td><td>no</td><td>lo = 6</td></tr>
    <tr><td>6</td><td>11</td><td>8</td><td>56</td><td>yes</td><td>hi = 8</td></tr>
    <tr><td>6</td><td>8</td><td>7</td><td>38</td><td>yes</td><td>hi = 7</td></tr>
    <tr><td>6</td><td>7</td><td>6</td><td>23</td><td>no</td><td>lo = 7</td></tr>
    <tr><td colspan="5">lo == hi</td><td><b>7</b></td></tr>
  </table>
  <p>So the 6:23 orders are indices 4, 5, 6 (first = 4, last = 7 − 1 = 6), and there are 7 − 4 = <b>3</b> of them. Python ships these two searches as the <code>bisect</code> module. In interviews you may use it unless asked to write the loop yourself.</p>
  <table class="tbl">
    <tr><th>Function</th><th>Returns</th><th>Time</th></tr>
    <tr><td><code>bisect_left(a, x)</code></td><td>First index with <code>a[i] &gt;= x</code> (lower bound)</td><td>O(log n)</td></tr>
    <tr><td><code>bisect_right(a, x)</code></td><td>First index with <code>a[i] &gt; x</code> (upper bound)</td><td>O(log n)</td></tr>
    <tr><td><code>insort(a, x)</code></td><td>Inserts x and keeps a sorted</td><td>O(n): shifting</td></tr>
  </table>
  <h3>The code</h3>
<div class="fx" data-lang="py">from bisect import bisect_left, bisect_right, insort

print("first 6:23 order :", bisect_left(times, 23))
print("after last 6:23  :", bisect_right(times, 23))
print("orders at 6:23   :", bisect_right(times, 23) - bisect_left(times, 23))
print("orders 6:10-6:40 :", bisect_right(times, 40) - bisect_left(times, 10))
i = bisect_left(times, 40)
print("first order at/after 6:40 -&gt; minute", times[i], "| last before 6:30 -&gt; minute", times[bisect_left(times, 30) - 1])
late = times.copy()
insort(late, 30)
print("after a late entry at 6:30:", late)</div>
  <div class="fx" data-lang="text">first 6:23 order : 4
after last 6:23  : 7
orders at 6:23   : 3
orders 6:10-6:40 : 5
first order at/after 6:40 -&gt; minute 56 | last before 6:30 -&gt; minute 23
after a late entry at 6:30: [2, 5, 8, 12, 23, 23, 23, 30, 38, 56, 72, 91]</div>
  <p>Every line is a Biteful question answered in O(log n): first and last order of a minute, the count in a minute, the count in a time range (5 orders between 6:10 and 6:40: 12, 23, 23, 23, 38), the next order after a time, the last order before a time, and keeping the log sorted when a late entry arrives.</p>
  <p>A classic use: turn marks into grades without a long <code>if/elif</code> chain. The cut-offs are sorted, so <code>bisect_right</code> tells you which band a mark falls in. Biteful uses the same trick to turn a delivery time into a "late band".</p>
<div class="fx" data-lang="py">cutoffs = [40, 60, 75, 90]          # below 40 = F, 40-59 = C, ...
grades = "FCBAS"
def grade(score):
    return grades[bisect_right(cutoffs, score)]

print([(s, grade(s)) for s in [33, 40, 59, 60, 89, 90, 100]])</div>
  <div class="fx" data-lang="text">[(33, 'F'), (40, 'C'), (59, 'C'), (60, 'B'), (89, 'A'), (90, 'S'), (100, 'S')]</div>
  <p>Since Python 3.10 you can pass <code>key=</code> to search a list of records by one field.</p>
<div class="fx" data-lang="py">orders = [("O1", 2), ("O2", 5), ("O3", 8), ("O4", 12), ("O5", 23), ("O6", 23), ("O7", 23), ("O8", 38)]  # sorted by minute
i = bisect_left(orders, 23, key=lambda o: o[1])
j = bisect_right(orders, 23, key=lambda o: o[1])
print("orders placed at 6:23 -&gt;", orders[i:j])</div>
  <div class="fx" data-lang="text">orders placed at 6:23 -&gt; [('O5', 23), ('O6', 23), ('O7', 23)]</div>
  <h3>Complexity</h3>
  <p>Each bisect call is O(log n) time, O(1) space. First/last/count = two calls = still O(log n). <code>insort</code> is O(n) because of the shift.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lower bound</strong> (<code>bisect_left</code>): the first index whose value is ≥ x, i.e. the leftmost place x could be inserted. <strong>Upper bound</strong> (<code>bisect_right</code>): the first index whose value is &gt; x, the rightmost insert place. For a value that is present, its copies occupy <code>[lower, upper)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>bisect</code> does not check that the list is sorted. Pass an unsorted list and you get a confident wrong index. Also, <code>insort</code> in a loop of n items is O(n²) overall; for many inserts, collect then sort once, or use a heap.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>34 Find First and Last Position of Element in Sorted Array</b> (exactly this section), <b>744 Find Smallest Letter Greater Than Target</b> (upper bound with wrap-around), <b>2529 Maximum Count of Positive Integer and Negative Integer</b> (two bounds around 0).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Problems on Sorted Arrays.</b> We have both templates and the bisect module. Let us check that they solve the three standard interview problems as they are actually stated, with all edge cases.</div>

  <h2 id="dsa-bs-sortedprob"><span class="num">06</span>Problems on Sorted Arrays</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sections 03–05 built the tools on Biteful's times. Interview problems state the same tasks with their own wording and edge cases (empty input, one item, target outside the range). Do our templates survive them unchanged?</p>
  </div>
  <h3>Binary Search (LeetCode 704)</h3>
  <p><strong>Problem.</strong> Given a sorted list of distinct numbers and a target, return the target's index, or −1 if it is absent. Must be O(log n).</p>
  <p><strong>Brute force.</strong> Scan from the left: O(n). Fine for 10 items, too slow for 10 million lookups.</p>
  <p><strong>Better.</strong> Template A. Dry run for <code>nums = [-1, 0, 3, 5, 9, 12]</code>, target 9:</p>
  <table class="tbl out"><caption>Dry run</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>nums[mid]</th><th>Action</th></tr>
    <tr><td>0</td><td>5</td><td>2</td><td>3</td><td>3 &lt; 9 → lo = 3</td></tr>
    <tr><td>3</td><td>5</td><td>4</td><td>9</td><td>found → return 4</td></tr>
  </table>
<div class="fx" data-lang="py">def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] &lt; target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

tests = [([-1, 0, 3, 5, 9, 12], 9), ([-1, 0, 3, 5, 9, 12], 2), ([5], 5), ([5], 1), ([], 3), ([1, 2], 2)]
for nums, t in tests:
    print(nums, t, "-&gt;", search(nums, t))</div>
  <div class="fx" data-lang="text">[-1, 0, 3, 5, 9, 12] 9 -&gt; 4
[-1, 0, 3, 5, 9, 12] 2 -&gt; -1
[5] 5 -&gt; 0
[5] 1 -&gt; -1
[] 3 -&gt; -1
[1, 2] 2 -&gt; 1</div>
  <p><strong>Complexity.</strong> O(log n) time, O(1) space.</p>

  <h3>Search Insert Position (LeetCode 35)</h3>
  <p><strong>Problem.</strong> Sorted, distinct numbers. Return the index of the target if present; otherwise the index where it would be inserted to keep the order.</p>
  <p><strong>Brute force.</strong> Walk until you find the first number ≥ target. O(n).</p>
  <p><strong>Better.</strong> "First index with <code>nums[i] &gt;= target</code>" is exactly lower bound (template B). If the target exists, that is its index. If not, that is where it fits. Dry run: <code>[1, 3, 5, 6]</code>, target 2.</p>
  <table class="tbl out"><caption>Dry run</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>nums[mid] ≥ 2?</th><th>Action</th></tr>
    <tr><td>0</td><td>4</td><td>2</td><td>5 ≥ 2 yes</td><td>hi = 2</td></tr>
    <tr><td>0</td><td>2</td><td>1</td><td>3 ≥ 2 yes</td><td>hi = 1</td></tr>
    <tr><td>0</td><td>1</td><td>0</td><td>1 ≥ 2 no</td><td>lo = 1</td></tr>
    <tr><td>1</td><td>1</td><td>–</td><td>loop ends</td><td>return 1</td></tr>
  </table>
<div class="fx" data-lang="py">def search_insert(nums, target):
    lo, hi = 0, len(nums)
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if nums[mid] &gt;= target:
            hi = mid
        else:
            lo = mid + 1
    return lo

for t in [5, 2, 7, 0]:
    print([1, 3, 5, 6], t, "-&gt;", search_insert([1, 3, 5, 6], t), "| bisect_left:", bisect_left([1, 3, 5, 6], t))
print([], 4, "-&gt;", search_insert([], 4))</div>
  <div class="fx" data-lang="text">[1, 3, 5, 6] 5 -&gt; 2 | bisect_left: 2
[1, 3, 5, 6] 2 -&gt; 1 | bisect_left: 1
[1, 3, 5, 6] 7 -&gt; 4 | bisect_left: 4
[1, 3, 5, 6] 0 -&gt; 0 | bisect_left: 0
[] 4 -&gt; 0</div>
  <p><strong>Complexity.</strong> O(log n) time, O(1) space. One line with the module: <code>bisect_left(nums, target)</code>.</p>

  <h3>Find First and Last Position of Element (LeetCode 34)</h3>
  <p><strong>Problem.</strong> Sorted list, may have duplicates. Return <code>[first, last]</code> index of the target, or <code>[-1, -1]</code>.</p>
  <p><strong>Brute force.</strong> Find any copy with binary search, then walk left and right. If all n items equal the target, the walk is O(n).</p>
  <p><strong>Better.</strong> Two boundary searches, as in section 05. First = lower bound of target. Last = (first index with value &gt; target) − 1. For integers, "&gt; target" is the same as "≥ target + 1".</p>
  <table class="tbl out"><caption>Dry run: nums = [5, 7, 7, 8, 8, 10], target 8</caption>
    <tr><th>Call</th><th>Meaning</th><th>Result</th></tr>
    <tr><td><code>lower_bound(nums, 8)</code></td><td>first index with value ≥ 8</td><td>3</td></tr>
    <tr><td><code>lower_bound(nums, 9)</code></td><td>first index with value ≥ 9</td><td>5</td></tr>
    <tr><td>check <code>nums[3] == 8</code></td><td>target really present</td><td>[3, 5 − 1] = [3, 4]</td></tr>
  </table>
<div class="fx" data-lang="py">def search_range(nums, target):
    first = lower_bound(nums, target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    last = lower_bound(nums, target + 1) - 1
    return [first, last]

def search_range_bisect(nums, target):          # same idea with the module
    l = bisect_left(nums, target)
    if l == len(nums) or nums[l] != target:
        return [-1, -1]
    return [l, bisect_right(nums, target) - 1]

tests = [(times, 23), ([5, 7, 7, 8, 8, 10], 8), ([5, 7, 7, 8, 8, 10], 6), ([], 0), ([2, 2, 2], 2), ([1], 1), ([1, 3], 4)]
for nums, t in tests:
    print(nums, t, "-&gt;", search_range(nums, t), search_range_bisect(nums, t))</div>
  <div class="fx" data-lang="text">[2, 5, 8, 12, 23, 23, 23, 38, 56, 72, 91] 23 -&gt; [4, 6] [4, 6]
[5, 7, 7, 8, 8, 10] 8 -&gt; [3, 4] [3, 4]
[5, 7, 7, 8, 8, 10] 6 -&gt; [-1, -1] [-1, -1]
[] 0 -&gt; [-1, -1] [-1, -1]
[2, 2, 2] 2 -&gt; [0, 2] [0, 2]
[1] 1 -&gt; [0, 0] [0, 0]
[1, 3] 4 -&gt; [-1, -1] [-1, -1]</div>
  <p><strong>Complexity.</strong> Two O(log n) searches → O(log n) time, O(1) space. The first line is the running example: the 6:23 orders are [4, 6].</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the "is it really there?" check. Lower bound always returns some index, even when the target is missing. Check <code>first &lt; len(nums)</code> and <code>nums[first] == target</code>, in that order, or you get an IndexError.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>704 Binary Search</b>, <b>35 Search Insert Position</b>, <b>34 Find First and Last Position</b>, then <b>2300 Successful Pairs of Spells and Potions</b> (sort once, then one bisect per spell). The matrix problems of this group (<b>74</b>, <b>240</b>, <b>1351</b>) are taught in section 09.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Rotated Sorted Arrays.</b> All of this needs the list sorted from left to right. Biteful's ring-buffer log starts writing at a random slot, so it looks like [56, 72, 91, 2, 5, 8, 12, 23, 38]: sorted, but cut and swapped. Is binary search dead?</div>

  <h2 id="dsa-bs-rotated"><span class="num">07</span>Rotated Sorted Arrays</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A rotated list is not sorted, so section 02 says the plain loop can give wrong answers. But it is <em>almost</em> sorted: two sorted runs. Can we still throw half away at each step?</p>
  </div>
  <p>Take a sorted list <code>[0, 1, 2, 4, 5, 6, 7]</code>, cut it at some point and swap the two parts: <code>[4, 5, 6, 7, 0, 1, 2]</code>. This is a <strong>rotated sorted array</strong>. It is two sorted runs side by side. The drop point is called the <strong>pivot</strong>.</p>
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
  <p>That last sentence is the key idea. Compare <code>nums[lo]</code> with <code>nums[mid]</code>. If <code>nums[lo] &lt;= nums[mid]</code>, the left half has no drop, so it is sorted. Otherwise the right half is sorted. In a sorted half you can tell, with two comparisons, whether the target can be there.</p>
  <h3>Recognise it</h3>
  <p>Trigger words: "rotated", "pivot", "sorted then shifted", "circular log", "find the minimum of a rotated array".</p>
  <h3>Traced on the running example</h3>
  <p>Biteful's ring buffer holds the 9 distinct times, written starting at slot 3: <code>[56, 72, 91, 2, 5, 8, 12, 23, 38]</code>. Find the 6:08 order (8).</p>
  <table class="tbl out"><caption>Search 8 in [56, 72, 91, 2, 5, 8, 12, 23, 38]</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>nums[mid]</th><th>Sorted half</th><th>Target inside?</th><th>Action</th></tr>
    <tr><td>0</td><td>8</td><td>4</td><td>5</td><td>56 ≤ 5? no → right [5..38]</td><td>5 &lt; 8 ≤ 38? yes</td><td>lo = 5</td></tr>
    <tr><td>5</td><td>8</td><td>6</td><td>12</td><td>8 ≤ 12 → left [8..12]</td><td>8 ≤ 8 &lt; 12? yes</td><td>hi = 5</td></tr>
    <tr><td>5</td><td>5</td><td>5</td><td>8</td><td>–</td><td>–</td><td>found → 5</td></tr>
  </table>
  <table class="tbl out"><caption>Find the minimum (where the log really starts): compare nums[mid] with nums[hi]</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>nums[mid] vs nums[hi]</th><th>Action</th></tr>
    <tr><td>0</td><td>8</td><td>4</td><td>5 ≤ 38</td><td>hi = 4</td></tr>
    <tr><td>0</td><td>4</td><td>2</td><td>91 &gt; 5</td><td>lo = 3</td></tr>
    <tr><td>3</td><td>4</td><td>3</td><td>2 ≤ 5</td><td>hi = 3</td></tr>
    <tr><td>3</td><td>3</td><td>–</td><td>loop ends</td><td>return nums[3] = 2</td></tr>
  </table>

  <h3>Search in Rotated Sorted Array (LeetCode 33)</h3>
  <p><strong>Problem.</strong> Distinct numbers, sorted then rotated by an unknown amount. Return the target's index or −1, in O(log n).</p>
  <p><strong>Brute force.</strong> Linear scan, O(n). Or find the pivot first, then binary search the correct run (works, but two passes).</p>
  <p><strong>Better, one pass.</strong></p>
  <ol>
    <li>Find mid. If it is the target, done.</li>
    <li>Find which half is sorted (<code>nums[lo] &lt;= nums[mid]</code> → left).</li>
    <li>If the target lies inside the sorted half's range, search there. Else search the other half.</li>
  </ol>
<div class="fx" data-lang="py">def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] &lt;= nums[mid]:                    # left half lo..mid is sorted
            if nums[lo] &lt;= target &lt; nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                        # right half mid..hi is sorted
            if nums[mid] &lt; target &lt;= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

ring = [56, 72, 91, 2, 5, 8, 12, 23, 38]
tests = [(ring, 8), (ring, 72), (ring, 40), ([4, 5, 6, 7, 0, 1, 2], 0), ([4, 5, 6, 7, 0, 1, 2], 3),
         ([1], 0), ([1], 1), ([3, 1], 1), ([5, 1, 3], 5), ([1, 2, 3, 4], 4)]
for nums, t in tests:
    print(nums, t, "-&gt;", search_rotated(nums, t))</div>
  <div class="fx" data-lang="text">[56, 72, 91, 2, 5, 8, 12, 23, 38] 8 -&gt; 5
[56, 72, 91, 2, 5, 8, 12, 23, 38] 72 -&gt; 1
[56, 72, 91, 2, 5, 8, 12, 23, 38] 40 -&gt; -1
[4, 5, 6, 7, 0, 1, 2] 0 -&gt; 4
[4, 5, 6, 7, 0, 1, 2] 3 -&gt; -1
[1] 0 -&gt; -1
[1] 1 -&gt; 0
[3, 1] 1 -&gt; 1
[5, 1, 3] 5 -&gt; 0
[1, 2, 3, 4] 4 -&gt; 3</div>
  <p><strong>Complexity.</strong> O(log n) time, O(1) space.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing <code>nums[lo] &lt; nums[mid]</code> instead of <code>&lt;=</code>. When <code>lo == mid</code> (two items left, e.g. <code>[3, 1]</code>), the left half is one item and is sorted. With <code>&lt;</code> the code picks the wrong half and misses the target.</p>
  </div>

  <h3>Find Minimum in Rotated Sorted Array (LeetCode 153)</h3>
  <p><strong>Problem.</strong> Same kind of list (distinct, rotated). Return the smallest value in O(log n).</p>
  <p><strong>Brute force.</strong> <code>min(nums)</code>: O(n).</p>
  <p><strong>Better.</strong> The minimum is the first item of the right run. Compare <code>nums[mid]</code> with <code>nums[hi]</code>:</p>
  <ul>
    <li><code>nums[mid] &gt; nums[hi]</code>: a drop happens after mid, so the minimum is right of mid → <code>lo = mid + 1</code>.</li>
    <li>Otherwise mid..hi is sorted, and mid itself may be the minimum → <code>hi = mid</code> (keep it).</li>
  </ul>
  <p>That is template B: the question "is <code>nums[i] &lt;= nums[-1]</code>?" goes F F F T T T, and the first T is the minimum.</p>
<div class="fx" data-lang="py">def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if nums[mid] &gt; nums[hi]:
            lo = mid + 1          # minimum is strictly right of mid
        else:
            hi = mid              # mid could be the minimum
    return nums[lo]

for nums in [ring, [3, 4, 5, 1, 2], [4, 5, 6, 7, 0, 1, 2], [11, 13, 15, 17], [2, 1], [1]]:
    print(nums, "-&gt;", find_min(nums))</div>
  <div class="fx" data-lang="text">[56, 72, 91, 2, 5, 8, 12, 23, 38] -&gt; 2
[3, 4, 5, 1, 2] -&gt; 1
[4, 5, 6, 7, 0, 1, 2] -&gt; 0
[11, 13, 15, 17] -&gt; 11
[2, 1] -&gt; 1
[1] -&gt; 1</div>
  <p><strong>Complexity.</strong> O(log n) time, O(1) space.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>rotated sorted array</strong> is a sorted array cut at one index and swapped: <code>a[k:] + a[:k]</code>. It has exactly one drop (the pivot), so for any mid at least one of the halves <code>[lo..mid]</code>, <code>[mid..hi]</code> is sorted.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing with <code>nums[lo]</code> instead of <code>nums[hi]</code> in find-min. For a list that is not rotated at all (<code>[11, 13, 15, 17]</code>), <code>nums[mid] &gt; nums[lo]</code> is true and pushes you right, away from the minimum. <code>nums[hi]</code> has no such problem. If duplicates are allowed (LeetCode 154), add: when equal, <code>hi -= 1</code>; worst case becomes O(n).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>33 Search in Rotated Sorted Array</b>, <b>153 Find Minimum in Rotated Sorted Array</b>, <b>81 Search in Rotated Sorted Array II</b> (duplicates: shrink both ends when they tie).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Binary Search on the Answer.</b> Every search so far was over a list of times. Operations now asks a question with no list to search at all: "what is the smallest bag a rider needs?" Can halving work on a range of possible answers?</div>

  <h2 id="dsa-bs-answer"><span class="num">08</span>Binary Search on the Answer</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sometimes there is no sorted list at all. The question asks for "the smallest X that works", and all we can do is test a guess. Trying X = 1, 2, 3, … is O(range × test). Section 02 said binary search only needs a yes/no question that flips once. Is "does X work?" such a question?</p>
  </div>
  <p>If a bigger X always works when a smaller one does, the yes/no answers look like <code>F F F T T T</code>. So binary search the <em>value</em> of X, and test each guess with a helper.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You must reach the station in 30 minutes. Is 10 km/h enough? No. Is 40? Yes. Is 25? Yes. Is 18? No. You keep halving the gap between "too slow" and "fast enough" until you find the slowest speed that still makes it.</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "minimum speed / capacity / days / time such that…", "maximise the minimum", "minimise the largest", "at most D days / h hours", and huge value ranges (up to 10⁹) that make trying every value impossible.</p>
  <h3>Template</h3>
  <div class="flow"><span>range: lo = smallest possible, hi = surely enough</span><span>write ok(x): does x work? (O(n))</span><span>template B: ok(mid) → hi = mid, else lo = mid + 1</span><span>answer = lo</span></div>
  <h3>Traced on the running example: the smallest rider bag</h3>
  <p>The first six orders weigh <code>[3, 2, 2, 4, 1, 4]</code> kg. One rider must carry them <strong>in order</strong> (the restaurants are on one road) and has at most <strong>D = 3 trips</strong>. Each trip, she fills the bag with the next orders until the next one would not fit. What is the smallest bag capacity that works?</p>
  <ul>
    <li>Lowest possible capacity: 4 (the heaviest order must fit). Highest needed: 16 (everything in one trip).</li>
    <li><code>trips(c)</code> only goes down as c grows, so "trips(c) ≤ 3" is F … F T … T over 4..16.</li>
  </ul>
  <table class="tbl out"><caption>Binary search over capacities 4..16, D = 3</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>trips at capacity mid (greedy packing)</th><th>≤ 3?</th><th>action</th></tr>
    <tr><td>4</td><td>16</td><td>10</td><td>[3,2,2] [4,1,4] = 2</td><td>yes</td><td>hi = 10</td></tr>
    <tr><td>4</td><td>10</td><td>7</td><td>[3,2,2] [4,1] [4] = 3</td><td>yes</td><td>hi = 7</td></tr>
    <tr><td>4</td><td>7</td><td>5</td><td>[3,2] [2] [4,1] [4] = 4</td><td>no</td><td>lo = 6</td></tr>
    <tr><td>6</td><td>7</td><td>6</td><td>[3,2] [2,4] [1,4] = 3</td><td>yes</td><td>hi = 6</td></tr>
    <tr><td colspan="5">lo == hi</td><td><b>6 kg</b></td></tr>
  </table>
<div class="fx" data-lang="py">def trips_needed(weights, cap):
    trips, load = 1, 0
    for w in weights:
        if load + w &gt; cap:             # next order doesn't fit: start a new trip
            trips, load = trips + 1, 0
        load += w
    return trips

def min_bag_capacity(weights, days, trace=False):
    lo, hi = max(weights), sum(weights)
    while lo &lt; hi:
        mid = (lo + hi) // 2
        t = trips_needed(weights, mid)
        if trace: print(f"lo={lo:2} hi={hi:2} mid={mid:2} trips={t} {'ok' if t &lt;= days else 'too many'}")
        if t &lt;= days:
            hi = mid                   # mid works: try smaller
        else:
            lo = mid + 1               # mid fails: need bigger
    return lo

w = [3, 2, 2, 4, 1, 4]
print("answer:", min_bag_capacity(w, 3, trace=True))
print([(c, trips_needed(w, c)) for c in range(4, 11)])
print(min_bag_capacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), min_bag_capacity([3, 2, 2, 4, 1, 4], 3), min_bag_capacity([1, 2, 3, 1, 1], 4))</div>
  <div class="fx" data-lang="text">lo= 4 hi=16 mid=10 trips=2 ok
lo= 4 hi=10 mid= 7 trips=3 ok
lo= 4 hi= 7 mid= 5 trips=4 too many
lo= 6 hi= 7 mid= 6 trips=3 ok
answer: 6
[(4, 5), (5, 4), (6, 3), (7, 3), (8, 3), (9, 2), (10, 2)]
15 6 3</div>
  <p>The middle line prints trips for every capacity: 5, 4, 3, 3, 3, 2, 2 for capacities 4..10. Monotonic, as promised, and the first capacity with ≤ 3 trips is 6. The last line runs LeetCode 1011's own examples (15, 6, 3).</p>

  <h3>Koko Eating Bananas (LeetCode 875)</h3>
  <p><strong>Problem.</strong> There are piles of bananas, e.g. <code>[3, 6, 7, 11]</code>. Koko picks a speed k (bananas per hour). Each hour she eats from one pile: k bananas, or the whole pile if it has fewer. The guards return in h hours (here 8). Find the smallest k that lets her finish.</p>
  <p><strong>Hours needed at speed k</strong> = sum over piles of ceil(pile / k). "ceil" means round up: a pile of 7 at speed 4 takes 2 hours, not 1.75.</p>
<figure class="viz"><svg viewBox="0 0 560 120" width="560">
<text x="10" y="30" class="tm">speed k</text><text x="10" y="62" class="tm">hours</text><text x="10" y="94" class="tm">≤ 8 ?</text>
<g text-anchor="middle">
<rect x="80" y="40" width="50" height="34" class="fr"/><text x="105" y="30">1</text><text x="105" y="62">27</text><text x="105" y="94" class="tr">F</text>
<rect x="135" y="40" width="50" height="34" class="fr"/><text x="160" y="30">2</text><text x="160" y="62">15</text><text x="160" y="94" class="tr">F</text>
<rect x="190" y="40" width="50" height="34" class="fr"/><text x="215" y="30">3</text><text x="215" y="62">10</text><text x="215" y="94" class="tr">F</text>
<rect x="245" y="40" width="50" height="34" class="fg sg"/><text x="270" y="30" class="tg">4</text><text x="270" y="62">8</text><text x="270" y="94" class="tg">T</text>
<rect x="300" y="40" width="50" height="34" class="fg"/><text x="325" y="30">5</text><text x="325" y="62">8</text><text x="325" y="94" class="tg">T</text>
<rect x="355" y="40" width="50" height="34" class="fg"/><text x="380" y="30">6</text><text x="380" y="62">6</text><text x="380" y="94" class="tg">T</text>
<rect x="410" y="40" width="50" height="34" class="fg"/><text x="435" y="30">7</text><text x="435" y="62">5</text><text x="435" y="94" class="tg">T</text>
<rect x="465" y="40" width="50" height="34" class="fg"/><text x="490" y="30">… 11</text><text x="490" y="62">4</text><text x="490" y="94" class="tg">T</text>
</g>
<text x="270" y="114" text-anchor="middle" class="tg">answer = first T</text>
</svg><figcaption>piles = [3, 6, 7, 11], h = 8. Faster never hurts, so the yes/no row is F F F T T T. Binary search finds the first T.</figcaption></figure>
  <p><strong>Brute force.</strong> Try k = 1, 2, 3, … until it works. Up to max(piles) tries, each O(n). With piles up to 10⁹ that is far too slow.</p>
  <p><strong>Better.</strong> The answer is between 1 and max(piles) (at speed max(piles) every pile takes 1 hour, and h ≥ number of piles). Binary search that range with template B.</p>
  <table class="tbl out"><caption>Dry run: piles = [3, 6, 7, 11], h = 8</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>hours(mid)</th><th>≤ 8?</th><th>Action</th></tr>
    <tr><td>1</td><td>11</td><td>6</td><td>1+1+2+2 = 6</td><td>yes</td><td>hi = 6</td></tr>
    <tr><td>1</td><td>6</td><td>3</td><td>1+2+3+4 = 10</td><td>no</td><td>lo = 4</td></tr>
    <tr><td>4</td><td>6</td><td>5</td><td>1+2+2+3 = 8</td><td>yes</td><td>hi = 5</td></tr>
    <tr><td>4</td><td>5</td><td>4</td><td>1+2+2+3 = 8</td><td>yes</td><td>hi = 4</td></tr>
    <tr><td>4</td><td>4</td><td>–</td><td>–</td><td>–</td><td>return 4</td></tr>
  </table>
<div class="fx" data-lang="py">def min_eating_speed(piles, h):
    def hours(k):
        return sum((p + k - 1) // k for p in piles)   # ceil(p / k) without floats
    lo, hi = 1, max(piles)
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if hours(mid) &lt;= h:
            hi = mid          # fast enough: try slower
        else:
            lo = mid + 1      # too slow: must go faster
    return lo

tests = [([3, 6, 7, 11], 8), ([30, 11, 23, 4, 20], 5), ([30, 11, 23, 4, 20], 6),
         ([1], 1), ([1_000_000_000], 2), ([312884470], 968709470)]
for piles, h in tests:
    print(piles, h, "-&gt;", min_eating_speed(piles, h))</div>
  <div class="fx" data-lang="text">[3, 6, 7, 11] 8 -&gt; 4
[30, 11, 23, 4, 20] 5 -&gt; 30
[30, 11, 23, 4, 20] 6 -&gt; 23
[1] 1 -&gt; 1
[1000000000] 2 -&gt; 500000000
[312884470] 968709470 -&gt; 1</div>
  <p><strong>Complexity.</strong> O(n · log M) time, where M = max(piles) (or total weight for the bag): about 30 guesses for M = 10⁹, each guess sums n piles. O(1) space.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using <code>p // k</code> (rounds down) or <code>math.ceil(p / k)</code> with huge numbers (float rounding). Use <code>(p + k - 1) // k</code>. Also start <code>lo</code> at 1, not 0, or you divide by zero; for the bag, start at <code>max(weights)</code>, or the greedy packer may try to put a 4 kg order into a 3 kg bag.</p>
  </div>
  <p>The same shape solves "Split Array Largest Sum", "Minimum Days to Make Bouquets" and integer square root. Only <code>ok(x)</code> changes.</p>
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
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Binary search on the answer</strong>: when the answer is a number in a known range and a check <code>ok(x)</code> is monotonic (false below some value, true from it on), binary search the range for the first x with <code>ok(x)</code> true. Cost = O(log range) checks × cost of one check.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>1011 Capacity To Ship Packages Within D Days</b> (the bag above), <b>875 Koko Eating Bananas</b>, <b>1283 Find the Smallest Divisor Given a Threshold</b> (same ceil trick), then <b>410 Split Array Largest Sum</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: 2-D Matrix.</b> All our sorted data has been one row. Biteful's dashboard shows the same times as a board, one row per half hour. Searching a grid row by row is O(rows × columns). Can halving work in two dimensions?</div>

  <h2 id="dsa-bs-matrix"><span class="num">09</span>2-D Matrix</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A grid has two indices, so "the middle" is not obvious. If every row continues where the previous one ended, is the grid secretly one sorted list? And what if only each row and each column are sorted, but not the whole thing?</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "m × n matrix", "each row sorted", "first integer of each row is greater than the last of the previous row" (fully sorted: flatten), or "rows and columns sorted" (staircase).</p>
  <h3>Case 1: fully sorted board (LeetCode 74)</h3>
  <p>With one more order at minute 98, Biteful's 12 times fill a 3 × 4 board, row by row:</p>
  <table class="tbl"><caption>board (3 rows × 4 columns); k = flat index</caption>
    <tr><th></th><th>col 0</th><th>col 1</th><th>col 2</th><th>col 3</th></tr>
    <tr><td>row 0</td><td>2 (k 0)</td><td>5 (k 1)</td><td>8 (k 2)</td><td>12 (k 3)</td></tr>
    <tr><td>row 1</td><td>23 (k 4)</td><td>23 (k 5)</td><td>23 (k 6)</td><td>38 (k 7)</td></tr>
    <tr><td>row 2</td><td>56 (k 8)</td><td>72 (k 9)</td><td>91 (k 10)</td><td>98 (k 11)</td></tr>
  </table>
  <p>Read row by row, the board <em>is</em> the sorted list. So binary search the flat index k from 0 to 11, and convert: <strong>row = k // 4, column = k % 4</strong> (4 = number of columns).</p>
  <table class="tbl out"><caption>Search 38 on the board</caption>
    <tr><th>lo</th><th>hi</th><th>mid k</th><th>(row, col)</th><th>value</th><th>action</th></tr>
    <tr><td>0</td><td>11</td><td>5</td><td>(1, 1)</td><td>23</td><td>23 &lt; 38 → lo = 6</td></tr>
    <tr><td>6</td><td>11</td><td>8</td><td>(2, 0)</td><td>56</td><td>56 &gt; 38 → hi = 7</td></tr>
    <tr><td>6</td><td>7</td><td>6</td><td>(1, 2)</td><td>23</td><td>23 &lt; 38 → lo = 7</td></tr>
    <tr><td>7</td><td>7</td><td>7</td><td>(1, 3)</td><td>38</td><td>found</td></tr>
  </table>
<div class="fx" data-lang="py">def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        r, c = divmod(mid, cols)               # flat index -&gt; (row, column)
        v = matrix[r][c]
        if v == target:
            return (r, c)
        if v &lt; target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False

board = [[2, 5, 8, 12], [23, 23, 23, 38], [56, 72, 91, 98]]
print(search_matrix(board, 38), search_matrix(board, 40), search_matrix(board, 98), search_matrix([[1]], 2))</div>
  <div class="fx" data-lang="text">(1, 3) False (2, 3) False</div>
  <p>Same 4 checks as section 03, because it is the same search; only the index conversion is new. O(log(m·n)) time, O(1) space.</p>
  <h3>Case 2: rows and columns sorted (LeetCode 240)</h3>
  <p>Now each row is sorted left to right and each column top to bottom, but row 1 does not continue row 0. Example: delivery minutes by zone (rows) and by hour slot (columns):</p>
  <table class="tbl"><caption>grid: rows sorted, columns sorted</caption>
    <tr><td>2</td><td>8</td><td>23</td><td>56</td></tr>
    <tr><td>5</td><td>12</td><td>38</td><td>72</td></tr>
    <tr><td>23</td><td>30</td><td>40</td><td>91</td></tr>
  </table>
  <p>Start at the <strong>top-right</strong> corner. Everything left of it is smaller, everything below is bigger. So one comparison removes a whole column (too big → move left) or a whole row (too small → move down): a staircase walk.</p>
  <table class="tbl out"><caption>Staircase search for 30, starting at (0, 3)</caption>
    <tr><th>position</th><th>value</th><th>compare</th><th>move</th></tr>
    <tr><td>(0, 3)</td><td>56</td><td>56 &gt; 30</td><td>left (column 3 is all ≥ 56)</td></tr>
    <tr><td>(0, 2)</td><td>23</td><td>23 &lt; 30</td><td>down (row 0 left of here is all ≤ 23)</td></tr>
    <tr><td>(1, 2)</td><td>38</td><td>38 &gt; 30</td><td>left</td></tr>
    <tr><td>(1, 1)</td><td>12</td><td>12 &lt; 30</td><td>down</td></tr>
    <tr><td>(2, 1)</td><td>30</td><td>equal</td><td>found</td></tr>
  </table>
<div class="fx" data-lang="py">def search_matrix_ii(grid, target):
    if not grid:
        return False
    r, c = 0, len(grid[0]) - 1                 # top-right corner
    while r &lt; len(grid) and c &gt;= 0:
        v = grid[r][c]
        if v == target:
            return (r, c)
        if v &gt; target:
            c -= 1                             # whole column below is even bigger
        else:
            r += 1                             # whole row to the left is even smaller
    return False

grid = [[2, 8, 23, 56], [5, 12, 38, 72], [23, 30, 40, 91]]
print(search_matrix_ii(grid, 30), search_matrix_ii(grid, 41), search_matrix_ii(grid, 2), search_matrix_ii(grid, 91))</div>
  <div class="fx" data-lang="text">(2, 1) False (0, 0) (2, 3)</div>
  <p><strong>Complexity.</strong> Each step moves one row down or one column left: at most m + n steps, O(m + n) time, O(1) space. (Binary searching every row would be O(m log n), also fine when rows are few.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A matrix is <strong>fully sorted</strong> when reading it row by row gives a sorted list; it is then searched as one list with <code>row = k // cols</code>, <code>col = k % cols</code>. A <strong>row- and column-sorted</strong> matrix is searched by the staircase walk from the top-right (or bottom-left) corner.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using <code>k // rows</code> instead of <code>k // cols</code>. On a square board you won't notice; on our 3 × 4 board, k = 7 would map to (2, 1) = 72 instead of (1, 3) = 38. The divisor is always the row length.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>74 Search a 2D Matrix</b> (flatten), <b>240 Search a 2D Matrix II</b> (staircase), <b>1351 Count Negative Numbers in a Sorted Matrix</b> (staircase counting).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Patterns.</b> We have five shapes of binary search. Given a fresh problem, which words tell us which shape, and what skeleton do we type?</div>

  <h2 id="dsa-bs-patterns"><span class="num">10</span>Patterns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section solved one Biteful question. In an interview the problem never says "use lower bound". How do we map the wording to one of the templates?</p>
  </div>
  <p>Almost every binary search question is one of these shapes. Spot the shape from the words in the question, then reuse the template.</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Trigger words</th><th>Template</th><th>Section / solved</th></tr>
    <tr><td><strong>1. Exact match</strong></td><td>"sorted array", "return index or −1", "in O(log n)"</td><td>A: <code>lo &lt;= hi</code>, mid ± 1</td><td>03, Binary Search</td></tr>
    <tr><td><strong>2. Boundary / lower bound</strong></td><td>"first", "last", "insert position", "smallest ≥", "count of"</td><td>B: <code>lo &lt; hi</code>, <code>hi = mid</code></td><td>05, Search Insert Position, First/Last Position</td></tr>
    <tr><td><strong>3. Rotated / half-sorted</strong></td><td>"rotated", "pivot", "sorted then shifted"</td><td>A or B + "which half is sorted?"</td><td>07, Rotated Search, Find Minimum</td></tr>
    <tr><td><strong>4. Search on the answer</strong></td><td>"minimum speed / capacity / days so that…", "maximise the minimum"</td><td>B over the answer range with <code>ok(x)</code></td><td>08, bag capacity, Koko</td></tr>
    <tr><td><strong>5. 2-D matrix</strong></td><td>"m × n matrix", "rows sorted"</td><td>flatten (k // cols) or staircase</td><td>09</td></tr>
    <tr><td><strong>6. Peak / slope</strong></td><td>"peak", "mountain", "bitonic"</td><td>B with <code>ok(i) = a[i] &gt; a[i+1]</code></td><td>tracker: 162, 852</td></tr>
  </table>
  <p>Template B is the one to remember: it covers patterns 2, 3 (find min), 4 and 6. Here it is as a real function that takes the yes/no question as an argument, tested on three Biteful questions.</p>
<div class="fx" data-lang="py">def first_true(lo, hi, ok):
    """Smallest x in [lo, hi] with ok(x) True (ok must go F F ... T T); hi + 1 if none."""
    hi += 1
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if ok(mid):          # mid works: try smaller
            hi = mid
        else:                # mid fails: go bigger
            lo = mid + 1
    return lo

print("first 6:23 order  :", first_true(0, len(times) - 1, lambda i: times[i] &gt;= 23))
print("smallest bag (kg) :", first_true(max(w), sum(w), lambda c: trips_needed(w, c) &lt;= 3))
print("start of the ring :", first_true(0, len(ring) - 1, lambda i: ring[i] &lt;= ring[-1]))</div>
  <div class="fx" data-lang="text">first 6:23 order  : 4
smallest bag (kg) : 6
start of the ring : 3</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing an <code>ok</code> that is not monotonic. "Is <code>times[i] == 23</code>?" goes F F F F T T T F F F F: true, then false again. Binary search on it can return anything. Turn equality into a boundary: "≥ 23" (first) and "&gt; 23" (after last).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>852 Peak Index in a Mountain Array</b> (pattern 6), <b>162 Find Peak Element</b>, <b>275 H-Index II</b> (a boundary with an index-dependent question).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have six shapes. How do they grow out of one another, and which one answers which Biteful question?</div>

  <h2 id="dsa-bs-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Halving, sortedness, the classic loop, the traps, bounds, rotation, search on the answer, matrices: how is each built from the one before, and which one do you reach for when?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-bs-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">the need</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">10 lakh times: scan vs ~20 checks</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">monotonic yes/no</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">F F F T T T · sorted is one case</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">classic loop (A)</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">38 → index 7 in 4 checks</text>
<line x1="555" y1="54" x2="555" y2="86" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="ft st"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">off-by-one traps</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">two templates, never mixed</text>
<line x1="460" y1="110" x2="422" y2="110" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="ft st"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">boundary (B) = bisect</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">23: first 4, last 6, count 3</text>
<line x1="330" y1="132" x2="105" y2="164" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<line x1="330" y1="132" x2="330" y2="164" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<line x1="330" y1="132" x2="555" y2="164" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<rect x="10" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="105" y="185" text-anchor="middle" font-size="11.5" font-weight="700">rotated array</text><text x="105" y="201" text-anchor="middle" class="tm" font-size="10">one half sorted · min = 2 at 3</text>
<rect x="240" y="166" width="180" height="44" rx="7" class="fg sg"/><text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">search on the answer</text><text x="330" y="201" text-anchor="middle" class="tm" font-size="10">bag: trips ≤ 3 first at 6 kg</text>
<rect x="460" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="555" y="185" text-anchor="middle" font-size="11.5" font-weight="700">2-D matrix</text><text x="555" y="201" text-anchor="middle" class="tm" font-size="10">k → (k // 4, k % 4); staircase</text>
<line x1="105" y1="210" x2="240" y2="244" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<line x1="330" y1="210" x2="330" y2="242" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<line x1="555" y1="210" x2="420" y2="244" stroke="currentColor" marker-end="url(#dsa-bs-a9)"/>
<rect x="160" y="244" width="340" height="48" rx="7" class="fv"/><text x="330" y="264" text-anchor="middle" font-size="11.5" font-weight="700">one engine: first_true(lo, hi, ok)</text><text x="330" y="281" text-anchor="middle" class="tm" font-size="10">O(log range) checks × cost of ok</text>
</svg><figcaption>Read it as a path. A measured gap forces halving; halving is only safe on a monotonic question; the classic loop does it for exact matches; its traps lead to the boundary template; that template, with a different yes/no question, solves rotation, search on the answer and matrices.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's order times</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>Use when</th></tr>
    <tr><td>Halving (the need)</td><td>sorted list + index access</td><td>can we skip most items?</td><td>10 lakh: ~20 checks; 200 lookups ~2 s vs ~0.25 ms</td><td>many lookups on sorted data</td></tr>
    <tr><td>Monotonic question</td><td>a yes/no that flips once</td><td>may we discard half?</td><td>times[i] ≥ 23: F F F F T T…; shuffled log → wrong −1</td><td>always check before coding</td></tr>
    <tr><td>Classic loop (A)</td><td>lo, hi, mid; [lo, hi] closed</td><td>where is x, or −1?</td><td>38 → 7 (4 checks); 40 → −1, lo ends at 8</td><td>exact match, distinct values</td></tr>
    <tr><td>Off-by-one rules</td><td>window meaning + loop condition</td><td>why does my loop fail?</td><td><code>lo &lt; hi</code> misses 38; <code>lo = mid</code> sticks at (9, 10)</td><td>every time you write the loop</td></tr>
    <tr><td>Bounds (B) / bisect</td><td>template B with ≥ x and &gt; x</td><td>first, last, count, insert?</td><td>23: first 4, last 6, count 3; 6:10–6:40: 5 orders</td><td>duplicates, ranges, insert points</td></tr>
    <tr><td>Rotated array</td><td>A/B + "which half is sorted"</td><td>search a cut-and-swapped list?</td><td>8 → index 5; min 2 at index 3</td><td>circular logs, rotated input</td></tr>
    <tr><td>Search on the answer</td><td>B over values + ok(x)</td><td>smallest X that works?</td><td>bag capacity 6 kg in 4 checks; Koko speed 4</td><td>"minimum capacity/speed/days"</td></tr>
    <tr><td>2-D matrix</td><td>A on flat index, or staircase</td><td>search a grid?</td><td>38 at (1, 3); 30 at (2, 1) in 5 steps</td><td>sorted boards, sorted rows+cols</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>find a yes/no question that flips exactly once, then halve the range until you find where it flips.</strong> Sorted lists, bounds, rotation, capacities and grids are just different questions plugged into the same loop.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_trees">Trees</a>: binary search needs the data already sorted in a list, and inserting a new order into a sorted list costs O(n) (every later item shifts). A binary search <em>tree</em> keeps the halving and makes inserts O(log n) too.</div>

  <h2 id="dsa-bs-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's 11 sorted order times (minutes after 6 pm) <b>[2, 5, 8, 12, 23, 23, 23, 38, 56, 72, 91]</b>; ring log <b>[56, 72, 91, 2, 5, 8, 12, 23, 38]</b>; order weights <b>[3, 2, 2, 4, 1, 4]</b> kg.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Need</td><td>find without scanning?</td><td>10 lakh: scan vs ~20 checks (thousands × faster)</td><td>when is halving safe?</td></tr>
    <tr><td>Monotonic</td><td>may we drop half?</td><td>shuffled log: 38 "not found"</td><td>need the exact loop</td></tr>
    <tr><td>Classic loop</td><td>where is x?</td><td>38 → 7 in 4 checks; 40 → −1 (lo = 8)</td><td>easy to break by one</td></tr>
    <tr><td>Traps</td><td>why does it fail?</td><td><code>lo &lt; hi</code>, <code>lo = mid</code>, overflow</td><td>finds "a" 23, not the first</td></tr>
    <tr><td>Bounds</td><td>first / last / count?</td><td>23: [4, 6], count 3</td><td>needs plain sorted order</td></tr>
    <tr><td>Rotated</td><td>search a cut log?</td><td>8 → 5; min 2 at 3</td><td>no list at all?</td></tr>
    <tr><td>On the answer</td><td>smallest X that works?</td><td>bag 6 kg; Koko 4</td><td>data on a grid?</td></tr>
    <tr><td>2-D matrix</td><td>search a board?</td><td>38 at (1, 3); staircase finds 30 at (2, 1)</td><td>→ Trees (fast inserts)</td></tr>
  </table>
  <h3>Rules and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Checks needed</td><td>⌈log₂(n + 1)⌉</td><td>n = items; 11 → 4, 10⁶ → 20, 10⁹ → 30</td></tr>
    <tr><td>mid</td><td><code>(lo + hi) // 2</code>; Java/C++: <code>lo + (hi - lo) / 2</code></td><td>// = floor division; avoids 32-bit overflow</td></tr>
    <tr><td>Template A</td><td><code>lo, hi = 0, n-1</code>; <code>while lo &lt;= hi</code>; mid ± 1</td><td>window [lo, hi] closed; not found when lo &gt; hi</td></tr>
    <tr><td>Template B</td><td><code>lo, hi = 0, n</code>; <code>while lo &lt; hi</code>; ok → hi = mid else lo = mid + 1</td><td>window [lo, hi) half-open; answer = lo</td></tr>
    <tr><td>Bounds</td><td>first = bisect_left(a, x); last = bisect_right(a, x) − 1</td><td>count = right − left; range count = right(b) − left(a)</td></tr>
    <tr><td>Rotated</td><td>left sorted iff <code>a[lo] &lt;= a[mid]</code>; min: <code>a[mid] &gt; a[hi]</code> → go right</td><td>distinct values; duplicates → hi −= 1, O(n) worst</td></tr>
    <tr><td>On the answer</td><td>O(n · log R)</td><td>R = size of the answer range; n = cost of ok(x)</td></tr>
    <tr><td>Integer ceil</td><td><code>(p + k - 1) // k</code></td><td>= ⌈p / k⌉ without floats</td></tr>
    <tr><td>Flat index</td><td>row = k // cols, col = k % cols</td><td>cols = row length</td></tr>
    <tr><td>Staircase</td><td>start top-right; &gt; target → left, &lt; → down</td><td>O(m + n)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Binary search</b><p>Many lookups on sorted data, or a monotonic yes/no over a range.</p><small>Not on unsorted data searched once (scan) or many times (set)</small></div>
    <div><b>bisect</b><p>First/last/count/insert position in a sorted list.</p><small>insort is O(n) per insert: not for many inserts</small></div>
    <div><b>Search on the answer</b><p>"Smallest/largest X such that…", huge ranges.</p><small>Needs a monotonic, cheap ok(x)</small></div>
    <div><b>Staircase</b><p>Rows and columns sorted, not globally.</p><small>For fully sorted boards flatten instead (log)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Unsorted input (silent wrong answer); <code>while lo &lt; hi</code> in template A; <code>lo = mid</code> with floor mid (infinite loop); mixing [lo, hi] with [lo, hi); <code>lo + hi</code> overflow in Java/C++; exact match on duplicates is not "first"; forgetting the "is it really there?" check after lower bound; <code>&lt;</code> vs <code>&lt;=</code> in the rotated half test; ceil with floats; k // rows instead of k // cols.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Checks to find 38 in the 11 times?</td><td>4 (mids 5, 8, 6, 7)</td></tr>
    <tr><td>bisect_left and bisect_right of 23?</td><td>4 and 7 → three orders at 6:23</td></tr>
    <tr><td>Why does <code>lo = mid</code> loop forever?</td><td>With hi = lo + 1, mid = lo, so nothing changes</td></tr>
    <tr><td>Smallest bag for [3, 2, 2, 4, 1, 4] in 3 trips, and the search range?</td><td>6 kg; range 4 (max) to 16 (sum)</td></tr>
    <tr><td>Flat index 7 on a 3 × 4 board?</td><td>(7 // 4, 7 % 4) = (1, 3)</td></tr>
  </table>

  <h2 id="dsa-bs-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does binary search need from the data, exactly?</summary><div class="qa-body">A yes/no question that is monotonic over the range: once it turns True it stays True (sorted data is one case). It also needs random access, so you can jump to index mid in O(1). A linked list fails the second condition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the time and space complexity of binary search? Why log n?</summary><div class="qa-body">O(log n) time because each step halves the window: n, n/2, n/4, … reaches 1 after log₂ n steps. Iterative uses O(1) extra space; recursive uses O(log n) for the call stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For 1 million sorted items, about how many comparisons in the worst case?</summary><div class="qa-body">About 20, because 2²⁰ ≈ 1,048,576. For a billion items, about 30. For our 11 order times, 4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why write mid = lo + (hi - lo) // 2 in Java/C++?</summary><div class="qa-body"><code>lo + hi</code> can exceed the 32-bit int limit and wrap to a negative number (section 04 showed 1.5 billion + 2 billion wrapping). <code>lo + (hi - lo) / 2</code> never exceeds hi. Python ints don't overflow, so <code>(lo + hi) // 2</code> is fine there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your loop is <code>while lo &lt; hi: ... lo = mid</code>. What goes wrong?</summary><div class="qa-body">When <code>hi = lo + 1</code>, mid rounds down to lo, so <code>lo = mid</code> changes nothing and the loop never ends. Use <code>lo = mid + 1</code>, or round mid up (<code>(lo + hi + 1) // 2</code>) if you really need <code>lo = mid</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>bisect_left vs bisect_right on the order times with x = 23?</summary><div class="qa-body">bisect_left = 4 (first index with value ≥ 23), bisect_right = 7 (first index with value &gt; 23). Their difference, 3, is the number of orders at 6:23; the last one is at index 7 − 1 = 6.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is bisect.insort O(log n)?</summary><div class="qa-body">No. Finding the spot is O(log n), but inserting into a Python list shifts every later item, so insort is O(n). n inserts cost O(n²). For many inserts with "get smallest", use a heap; for many inserts with order queries, sort once at the end or use a balanced tree (e.g. <code>sortedcontainers.SortedList</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a rotated sorted array, why is one half always sorted?</summary><div class="qa-body">A rotated array has exactly one drop (the pivot). Mid splits the array into two halves, and the drop can be in only one of them. The half without the drop is a normal sorted run, so a simple range check tells you if the target can be there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Find Minimum in Rotated Array, why compare nums[mid] with nums[hi], not nums[lo]?</summary><div class="qa-body">nums[mid] &gt; nums[hi] proves the drop is right of mid; otherwise mid..hi is sorted and mid may be the minimum. Comparing with nums[lo] breaks on an unrotated array: mid &gt; lo there too, yet the minimum is at the far left.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you recognise "binary search on the answer"? Complexity of the bag problem?</summary><div class="qa-body">The question asks for the minimum (or maximum) value such that a condition holds, and the condition is monotonic: a bigger capacity/speed never hurts. Binary search the value range with a check function. Bag capacity: O(n log S), S = total weight, because ~log S guesses each cost an O(n) greedy packing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have to search an unsorted list once. Sort and binary search, or scan?</summary><div class="qa-body">Scan: O(n). Sorting first costs O(n log n), which is already more. Sort only if you will search many times (k searches: O(n log n + k log n) vs O(k·n)), or use a set/dict for O(1) average lookups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did we need template B if template A already finds 23?</summary><div class="qa-body">Template A stops at the first 23 it happens to test (index 5) and only promises "an" index. Support needs the first and last orders of the minute and their count. Template B keeps mid when it might be the answer (<code>hi = mid</code>) and so converges on the exact boundary: 4 for ≥ 23, 7 for &gt; 23.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in "search on the answer" if the check is not monotonic?</summary><div class="qa-body">Binary search assumes that if mid works, everything bigger works too, so it throws away the upper half. If, say, capacity 7 worked but 8 didn't, the search could jump over the true smallest answer or return a value that fails. That is why we first argued that trips only go down as capacity grows (5, 4, 3, 3, 3, 2, 2 for capacities 4..10).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is the 2-D board search the same as section 03?</summary><div class="qa-body">A fully sorted board read row by row is the sorted list. The loop is template A over flat indices 0..m·n − 1; the only new line converts k to (k // cols, k % cols). On Biteful's board, searching 38 visits flat indices 5, 8, 6, 7: the same mids as the list search.</div></details>
</main>
`
});
