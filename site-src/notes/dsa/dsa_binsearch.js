// notes/dsa/dsa_binsearch.js — Binary Search
Object.assign(TOPIC_CONTENT, {
  "dsa_binsearch": `<main>
<h1>Binary Search</h1>
  <p class="lead">Binary search finds an item in a sorted list by checking the middle and throwing away half the list each time. It turns a million checks into twenty. Interviewers love it because the idea is easy but the loop is easy to get wrong by one. It needs only lists and loops; Big-O from the complexity note helps.</p>

  <h2 id="dsa-bs-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Binary Search</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea &amp; need</div>
        <ul>
          <li><b>What</b> — look at the middle, throw away the half that can't have the answer</li>
          <li><b>Why</b> — linear search checks every item: 1 million items = 1 million checks</li>
          <li><b>Halving</b> — 1 million → 20 checks; 1 billion → 30 checks</li>
          <li><b>Cost</b> — O(log n) time, O(1) extra space (iterative)</li>
          <li>💡 Number guessing game with "higher / lower" hints; opening a dictionary near the middle</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When it works</div>
        <ul>
          <li><b>Sorted</b> data, or any <b>monotonic</b> yes/no question (once yes, always yes)</li>
          <li>Picture: <code>F F F F T T T</code> — find the first T</li>
          <li><b>Random access</b> needed — jump to index mid in O(1) (list, not linked list)</li>
          <li>⚠ Unsorted input gives wrong answers silently, no error</li>
          <li>Sorting first costs O(n log n) — worth it only for many searches</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li><b>Exact match</b> — <code>lo, hi = 0, n-1</code>; <code>while lo &lt;= hi</code>; <code>lo = mid+1</code> / <code>hi = mid-1</code></li>
          <li><b>mid</b> — <code>(lo + hi) // 2</code>; in Java/C++ write <code>lo + (hi-lo)//2</code> (overflow)</li>
          <li><b>Boundary (first True)</b> — <code>lo, hi = 0, n</code>; <code>while lo &lt; hi</code>; True → <code>hi = mid</code>, False → <code>lo = mid+1</code></li>
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
          <li><b>bisect_left(a, x)</b> — first index with a[i] ≥ x</li>
          <li><b>bisect_right(a, x)</b> — first index with a[i] &gt; x</li>
          <li><b>Count of x</b> = right − left · <b>count in [lo, hi]</b> = right(hi) − left(lo)</li>
          <li><b>insort</b> — keeps list sorted; find is O(log n) but insert shifts → O(n)</li>
          <li><b>key=</b> argument (Python 3.10+) to search by a field</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rotated arrays</div>
        <ul>
          <li><b>Rotated</b> — sorted list cut and swapped: <code>[4,5,6,7,0,1,2]</code></li>
          <li><b>Key fact</b> — at any mid, at least one half is fully sorted</li>
          <li><b>Search</b> — find the sorted half; is target inside its range? go there, else other side</li>
          <li><b>Find min</b> — compare <code>nums[mid]</code> with <code>nums[hi]</code>: bigger → min is right</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Search on the answer</div>
        <ul>
          <li><b>Signal</b> — "minimum speed / capacity / days such that …"</li>
          <li><b>How</b> — binary search the answer range; check each guess with a helper <code>ok(x)</code></li>
          <li><b>Koko</b> — speed k in [1, max(piles)]; hours = Σ ceil(p/k); first k with hours ≤ h</li>
          <li><b>Cost</b> — O(n · log(range))</li>
          <li>⚠ ceil(p/k) in integers: <code>(p + k - 1) // k</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Binary Search</b> — exact match loop</li>
          <li><b>Search Insert Position</b> — lower bound</li>
          <li><b>First/Last Position</b> — lower bound of x and of x+1 (or bisect_right − 1)</li>
          <li><b>Rotated search</b>, <b>Find Min in Rotated</b>, <b>Koko</b></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-bs-game"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Guessing Game</span><span class="rm-sub">Halving beats checking one by one</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-sorted"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Why It Must Be Sorted</span><span class="rm-sub">Sorted or yes/no monotonic</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-loop"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Loop: lo, hi, mid</span><span class="rm-sub">Code, trace, Big-O</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-traps"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Off-by-One Traps</span><span class="rm-sub">Two templates that always work</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-bisect"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Python's bisect Module</span><span class="rm-sub">bisect_left, bisect_right, insort</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-patterns"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-sortedprob"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Problems on Sorted Arrays</span><span class="rm-sub">Binary Search, Insert Position, First/Last</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-rotated"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Rotated Sorted Arrays</span><span class="rm-sub">Search, find minimum</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-answer"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Binary Search on the Answer</span><span class="rm-sub">Koko Eating Bananas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bs-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bs-game"><span class="num">01</span>The Guessing Game</h2>
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
  <p>How many halvings until one item is left? For 100 items: 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1. That is about 7 steps. The number of halvings is called <strong>log₂ n</strong> (log base 2 — "how many times can I halve n").</p>
<div class="fx" data-lang="py">import math
for n in [100, 1_000, 1_000_000, 1_000_000_000]:
    worst = math.ceil(math.log2(n + 1))
    print(f"{n:&gt;13,} items  linear: up to {n:&gt;13,} checks  binary: up to {worst} checks")</div>
  <div class="fx" data-lang="text">          100 items  linear: up to           100 checks  binary: up to 7 checks
        1,000 items  linear: up to         1,000 checks  binary: up to 10 checks
    1,000,000 items  linear: up to     1,000,000 checks  binary: up to 20 checks
1,000,000,000 items  linear: up to 1,000,000,000 checks  binary: up to 30 checks</div>
  <p>A billion items in 30 checks. This is why binary search is written as <strong>O(log n)</strong> and linear search as <strong>O(n)</strong>.</p>
  <h3>Where you meet it</h3>
  <ul>
    <li>Looking up a roll number in a marksheet sorted by roll number.</li>
    <li>Databases: B-tree indexes do a binary-search-like walk to find a row.</li>
    <li><code>git bisect</code>: finds the commit that broke the code by testing the middle commit.</li>
    <li>ML: picking a threshold, finding the smallest batch size that fits in GPU memory.</li>
    <li>Interviews: "sorted array", "find the minimum X such that…" — both point here.</li>
  </ul>

  <h2 id="dsa-bs-sorted"><span class="num">02</span>Why It Must Be Sorted</h2>
  <p>When we look at the middle and say "the answer is on the right", we are trusting the order. If the list is not sorted, that trust is wrong. Binary search then gives a wrong answer and no error.</p>
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

unsorted = [9, 2, 7, 4, 1, 8]
print("unsorted, find 9:", binary_search(unsorted, 9))
print("sorted,   find 9:", binary_search(sorted(unsorted), 9))</div>
  <div class="fx" data-lang="text">unsorted, find 9: -1
sorted,   find 9: 5</div>
  <p>9 is at index 0 of the unsorted list, but the search said −1 ("not there"). The middle was 7, 7 &lt; 9, so it threw away the left half — which held the 9.</p>
  <div class="callout def"><span class="label">The real requirement</span>
    <p>"Sorted" is one case of a wider rule: you need a yes/no question that, once it becomes yes, stays yes. This is called <strong>monotonic</strong> (only goes one way). Then the answers look like <code>F F F F T T T</code>, and binary search finds the first <code>T</code>.</p>
  </div>
  <table class="tbl">
    <tr><th>Question</th><th>Answers along the range</th><th>Monotonic?</th></tr>
    <tr><td>Is <code>a[i] ≥ 23</code> in a sorted list?</td><td>F F F F F T T T T T</td><td>Yes</td></tr>
    <tr><td>Can Koko finish the bananas at speed k?</td><td>F F F T T T T (faster never hurts)</td><td>Yes</td></tr>
    <tr><td>Does this commit have the bug? (git bisect)</td><td>F F F T T T (bug stays once added)</td><td>Yes</td></tr>
    <tr><td>Is <code>a[i]</code> even?</td><td>F T T F T F</td><td>No — can't binary search</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sorting just to search once. Sorting costs O(n log n), more than one linear scan O(n). Sort once only if you will search many times. Also, binary search needs <strong>random access</strong> (jump straight to index mid). A Python list has it; a linked list does not.</p>
  </div>

  <h2 id="dsa-bs-loop"><span class="num">03</span>The Loop: lo, hi, mid</h2>
  <p>We keep two markers. <code>lo</code> is the first index that can still hold the answer. <code>hi</code> is the last one. Everything outside <code>[lo, hi]</code> is ruled out.</p>
  <ol>
    <li>Take the middle: <code>mid = (lo + hi) // 2</code>.</li>
    <li>If <code>a[mid]</code> is the target, done.</li>
    <li>If <code>a[mid]</code> is too small, the answer is right of mid: <code>lo = mid + 1</code>.</li>
    <li>If too big, it's left of mid: <code>hi = mid - 1</code>.</li>
    <li>Stop when <code>lo &gt; hi</code>: nothing left to check, so not found.</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 560 205" width="560">
<text x="10" y="14" class="tm">find 23 in a sorted list of 10</text>
<g font-size="12" text-anchor="middle">
<text x="80" y="38">2</text><text x="128" y="38">5</text><text x="176" y="38">8</text><text x="224" y="38">12</text><text x="272" y="38" class="tb">16</text><text x="320" y="38">23</text><text x="368" y="38">38</text><text x="416" y="38">56</text><text x="464" y="38">72</text><text x="512" y="38">91</text>
</g>
<text x="10" y="38" class="tm">step 1</text>
<rect x="58" y="24" width="480" height="22" fill="none" stroke="currentColor"/>
<rect x="250" y="24" width="44" height="22" class="fb sb" fill-opacity="0.5"/>
<text x="80" y="62" class="tm" text-anchor="middle">lo</text><text x="272" y="62" class="tb" text-anchor="middle">mid=4</text><text x="512" y="62" class="tm" text-anchor="middle">hi</text>
<text x="540" y="78" class="tm" text-anchor="end">16 &lt; 23 → lo = 5</text>
<text x="10" y="108" class="tm">step 2</text>
<rect x="58" y="94" width="240" height="22" class="fs"/>
<rect x="298" y="94" width="240" height="22" fill="none" stroke="currentColor"/>
<rect x="394" y="94" width="44" height="22" class="fb sb"/>
<g font-size="12" text-anchor="middle"><text x="320" y="108">23</text><text x="368" y="108">38</text><text x="416" y="108" class="tb">56</text><text x="464" y="108">72</text><text x="512" y="108">91</text></g>
<text x="320" y="132" class="tm" text-anchor="middle">lo</text><text x="416" y="132" class="tb" text-anchor="middle">mid=7</text><text x="512" y="132" class="tm" text-anchor="middle">hi</text>
<text x="540" y="148" class="tm" text-anchor="end">56 &gt; 23 → hi = 6</text>
<text x="10" y="178" class="tm">step 3</text>
<rect x="58" y="164" width="240" height="22" class="fs"/><rect x="394" y="164" width="144" height="22" class="fs"/>
<rect x="298" y="164" width="96" height="22" fill="none" stroke="currentColor"/>
<rect x="298" y="164" width="48" height="22" class="fg sg"/>
<g font-size="12" text-anchor="middle"><text x="320" y="178">23</text><text x="368" y="178">38</text></g>
<text x="320" y="200" class="tg" text-anchor="middle">mid=5 ✓ found</text>
</svg><figcaption>Grey = ruled out. The box between lo and hi shrinks by half every step. 3 checks instead of 6.</figcaption></figure>
  <p>The same search in code, printing each step.</p>
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
    return -1                     # lo passed hi: nothing left

a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print("index:", binary_search_trace(a, 23))
print("index:", binary_search_trace(a, 40))</div>
  <div class="fx" data-lang="text">lo=0 hi=9 mid=4 a[mid]=16
lo=5 hi=9 mid=7 a[mid]=56
lo=5 hi=6 mid=5 a[mid]=23
index: 5
lo=0 hi=9 mid=4 a[mid]=16
lo=5 hi=9 mid=7 a[mid]=56
lo=5 hi=6 mid=5 a[mid]=23
lo=6 hi=6 mid=6 a[mid]=38
index: -1</div>
  <p>For 40 the window closes at <code>lo=7, hi=6</code>. <code>lo</code> passed <code>hi</code>, so 40 is not in the list. Note: <code>lo=7</code> is also exactly where 40 would be inserted to keep the list sorted. That fact comes back in Search Insert Position.</p>
  <h3>Big-O</h3>
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
  <div class="callout intu"><span class="label">Why mid = (lo + hi) // 2 is safe</span>
    <p><code>//</code> rounds down, so <code>mid</code> is always between <code>lo</code> and <code>hi</code>. Python integers never overflow. In Java or C++, <code>lo + hi</code> can pass the int limit, so write <code>lo + (hi - lo) / 2</code>. Interviewers like this point.</p>
  </div>

  <h2 id="dsa-bs-traps"><span class="num">04</span>Off-by-One Traps</h2>
  <p>The idea is simple. The bugs live in three small choices: <code>&lt;</code> or <code>&lt;=</code>, <code>mid</code> or <code>mid - 1</code>, <code>n</code> or <code>n - 1</code>. Mixing them gives wrong answers or a loop that never ends.</p>
  <div class="callout trap"><span class="label">Trap 1: while lo &lt; hi in the exact-match loop</span>
    <p>When the window has one item (<code>lo == hi</code>), the loop stops before checking it.</p>
  </div>
<div class="fx" data-lang="py">def search_bug1(a, target):
    lo, hi = 0, len(a) - 1
    while lo &lt; hi:                    # BUG: should be &lt;=
        mid = (lo + hi) // 2
        if a[mid] == target: return mid
        if a[mid] &lt; target: lo = mid + 1
        else: hi = mid - 1
    return -1

print(search_bug1([7], 7), search_bug1([1, 3], 3))     # both are present!</div>
  <div class="fx" data-lang="text">-1 -1</div>
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

print(search_bug2([1, 3, 5, 7], 7))</div>
  <div class="fx" data-lang="text">stuck at lo=2 hi=3</div>
  <p>The cure: learn two templates and never mix them.</p>
  <table class="tbl">
    <tr><th></th><th>Template A: exact match</th><th>Template B: first True (boundary)</th></tr>
    <tr><td>Question</td><td>"Where is x?" or −1</td><td>"First index where <code>ok(i)</code> is True"</td></tr>
    <tr><td>Start</td><td><code>lo, hi = 0, n - 1</code></td><td><code>lo, hi = 0, n</code></td></tr>
    <tr><td>Window means</td><td>[lo, hi], both ends included</td><td>[lo, hi), hi not included</td></tr>
    <tr><td>Loop</td><td><code>while lo &lt;= hi</code></td><td><code>while lo &lt; hi</code></td></tr>
    <tr><td>Move</td><td><code>lo = mid + 1</code> / <code>hi = mid - 1</code></td><td>True → <code>hi = mid</code>, False → <code>lo = mid + 1</code></td></tr>
    <tr><td>Answer</td><td>return mid when equal, else −1</td><td><code>lo</code> (n means "no True at all")</td></tr>
  </table>
  <p>Template B is called <strong>lower bound</strong> when <code>ok(i)</code> is <code>a[i] &gt;= x</code>. It answers more questions than template A: first position, insert position, count, ranges.</p>
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

a = [1, 3, 3, 3, 8]
for x in [0, 3, 4, 8, 9]:
    print(f"lower_bound({x}) = {lower_bound(a, x)}")
print("empty list:", lower_bound([], 5))</div>
  <div class="fx" data-lang="text">lower_bound(0) = 0
lower_bound(3) = 1
lower_bound(4) = 4
lower_bound(8) = 4
lower_bound(9) = 5
empty list: 0</div>
  <div class="callout intu"><span class="label">How to test any binary search in 30 seconds</span>
    <p>Try an empty list, one item (found and not found), two items (target first, target second), a target smaller than all and bigger than all, and duplicates. Most off-by-one bugs show up on sizes 0, 1 and 2.</p>
  </div>

  <h2 id="dsa-bs-bisect"><span class="num">05</span>Python's bisect Module</h2>
  <p>Python ships lower bound and its partner as the <code>bisect</code> module. In interviews you may use it unless asked to write the loop yourself.</p>
  <table class="tbl">
    <tr><th>Function</th><th>Returns</th><th>Time</th></tr>
    <tr><td><code>bisect_left(a, x)</code></td><td>First index with <code>a[i] &gt;= x</code> (lower bound)</td><td>O(log n)</td></tr>
    <tr><td><code>bisect_right(a, x)</code></td><td>First index with <code>a[i] &gt; x</code> (upper bound)</td><td>O(log n)</td></tr>
    <tr><td><code>insort(a, x)</code></td><td>Inserts x and keeps a sorted</td><td>O(n) — shifting</td></tr>
  </table>
<div class="fx" data-lang="py">from bisect import bisect_left, bisect_right, insort

marks = [35, 42, 42, 42, 67, 88, 91]
print("left of 42 :", bisect_left(marks, 42))
print("right of 42:", bisect_right(marks, 42))
print("how many 42s:", bisect_right(marks, 42) - bisect_left(marks, 42))
print("marks in [40, 70]:", bisect_right(marks, 70) - bisect_left(marks, 40))
insort(marks, 50)
print("after insort 50:", marks)</div>
  <div class="fx" data-lang="text">left of 42 : 1
right of 42: 4
how many 42s: 3
marks in [40, 70]: 4
after insort 50: [35, 42, 42, 42, 50, 67, 88, 91]</div>
  <p>A classic use: turn marks into grades without a long <code>if/elif</code> chain. The cut-offs are sorted, so <code>bisect_right</code> tells you which band a mark falls in.</p>
<div class="fx" data-lang="py">cutoffs = [40, 60, 75, 90]          # below 40 = F, 40-59 = C, ...
grades = "FCBAS"
def grade(score):
    return grades[bisect_right(cutoffs, score)]

print([(s, grade(s)) for s in [33, 40, 59, 60, 89, 90, 100]])</div>
  <div class="fx" data-lang="text">[(33, 'F'), (40, 'C'), (59, 'C'), (60, 'B'), (89, 'A'), (90, 'S'), (100, 'S')]</div>
  <p>Since Python 3.10 you can pass <code>key=</code> to search a list of records by one field.</p>
<div class="fx" data-lang="py">trains = [("Shatabdi", 6), ("Rajdhani", 16), ("Duronto", 20), ("Garib Rath", 22)]  # sorted by hour
i = bisect_left(trains, 17, key=lambda t: t[1])
print("first train at or after 17:00 -&gt;", trains[i])</div>
  <div class="fx" data-lang="text">first train at or after 17:00 -&gt; ('Duronto', 20)</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>bisect</code> does not check that the list is sorted. Pass an unsorted list and you get a confident wrong index. Also, <code>insort</code> in a loop of n items is O(n²) overall; for many inserts, collect then sort once, or use a heap.</p>
  </div>

  <h2 id="dsa-bs-patterns"><span class="num">06</span>Patterns</h2>
  <p>Almost every binary search question is one of four shapes. Spot the shape from the words in the question, then reuse the template.</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Signal words</th><th>Template</th><th>Solved below</th></tr>
    <tr><td><strong>1. Exact match</strong></td><td>"sorted array", "return index or −1", "in O(log n)"</td><td>A: <code>lo &lt;= hi</code>, mid ± 1</td><td>Binary Search</td></tr>
    <tr><td><strong>2. Boundary / lower bound</strong></td><td>"first", "last", "insert position", "smallest ≥", "count of"</td><td>B: <code>lo &lt; hi</code>, <code>hi = mid</code></td><td>Search Insert Position, First/Last Position</td></tr>
    <tr><td><strong>3. Rotated / half-sorted</strong></td><td>"rotated", "pivot", "sorted then shifted"</td><td>A or B + "which half is sorted?"</td><td>Rotated Search, Find Minimum</td></tr>
    <tr><td><strong>4. Search on the answer</strong></td><td>"minimum speed / capacity / days so that…", "maximise the minimum"</td><td>B over the answer range with <code>ok(x)</code></td><td>Koko Eating Bananas</td></tr>
  </table>
<div class="fx" data-lang="text"># Template B: the one to remember. Works for patterns 2, 3 (find min) and 4.
lo, hi = smallest_possible, largest_possible + 1   # or largest_possible if it surely works
while lo &lt; hi:
    mid = (lo + hi) // 2
    if ok(mid):          # ok must be F F F ... T T T over the range
        hi = mid         # mid works: try smaller
    else:
        lo = mid + 1     # mid fails: go bigger
return lo                # first value where ok is True</div>

  <h2 id="dsa-bs-sortedprob"><span class="num">07</span>Problems on Sorted Arrays</h2>
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
    <tr><td>1</td><td>1</td><td>—</td><td>loop ends</td><td>return 1</td></tr>
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
  <p><strong>Better.</strong> Two boundary searches. First = lower bound of target. Last = (first index with value &gt; target) − 1. For integers, "&gt; target" is the same as "≥ target + 1".</p>
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

tests = [([5, 7, 7, 8, 8, 10], 8), ([5, 7, 7, 8, 8, 10], 6), ([], 0), ([2, 2, 2], 2), ([1], 1), ([1, 3], 4)]
for nums, t in tests:
    print(nums, t, "-&gt;", search_range(nums, t), search_range_bisect(nums, t))</div>
  <div class="fx" data-lang="text">[5, 7, 7, 8, 8, 10] 8 -&gt; [3, 4] [3, 4]
[5, 7, 7, 8, 8, 10] 6 -&gt; [-1, -1] [-1, -1]
[] 0 -&gt; [-1, -1] [-1, -1]
[2, 2, 2] 2 -&gt; [0, 2] [0, 2]
[1] 1 -&gt; [0, 0] [0, 0]
[1, 3] 4 -&gt; [-1, -1] [-1, -1]</div>
  <p><strong>Complexity.</strong> Two O(log n) searches → O(log n) time, O(1) space.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the "is it really there?" check. Lower bound always returns some index, even when the target is missing. Check <code>first &lt; len(nums)</code> and <code>nums[first] == target</code>, in that order, or you get an IndexError.</p>
  </div>

  <h2 id="dsa-bs-rotated"><span class="num">08</span>Rotated Sorted Arrays</h2>
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

  <h3>Search in Rotated Sorted Array (LeetCode 33)</h3>
  <p><strong>Problem.</strong> Distinct numbers, sorted then rotated by an unknown amount. Return the target's index or −1, in O(log n).</p>
  <p><strong>Brute force.</strong> Linear scan, O(n). Or find the pivot first, then binary search the correct run (works, but two passes).</p>
  <p><strong>Better, one pass.</strong></p>
  <ol>
    <li>Find mid. If it is the target, done.</li>
    <li>Find which half is sorted (<code>nums[lo] &lt;= nums[mid]</code> → left).</li>
    <li>If the target lies inside the sorted half's range, search there. Else search the other half.</li>
  </ol>
  <table class="tbl out"><caption>Dry run: [4, 5, 6, 7, 0, 1, 2], target 0</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>nums[mid]</th><th>Sorted half</th><th>Target inside?</th><th>Action</th></tr>
    <tr><td>0</td><td>6</td><td>3</td><td>7</td><td>left [4..7]</td><td>4 ≤ 0 &lt; 7? no</td><td>lo = 4</td></tr>
    <tr><td>4</td><td>6</td><td>5</td><td>1</td><td>left [0..1]</td><td>0 ≤ 0 &lt; 1? yes</td><td>hi = 4</td></tr>
    <tr><td>4</td><td>4</td><td>4</td><td>0</td><td>—</td><td>—</td><td>found → 4</td></tr>
  </table>
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

tests = [([4, 5, 6, 7, 0, 1, 2], 0), ([4, 5, 6, 7, 0, 1, 2], 3), ([1], 0), ([1], 1),
         ([3, 1], 1), ([5, 1, 3], 5), ([1, 2, 3, 4], 4)]
for nums, t in tests:
    print(nums, t, "-&gt;", search_rotated(nums, t))</div>
  <div class="fx" data-lang="text">[4, 5, 6, 7, 0, 1, 2] 0 -&gt; 4
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
  <p><strong>Brute force.</strong> <code>min(nums)</code> — O(n).</p>
  <p><strong>Better.</strong> The minimum is the first item of the right run. Compare <code>nums[mid]</code> with <code>nums[hi]</code>:</p>
  <ul>
    <li><code>nums[mid] &gt; nums[hi]</code>: a drop happens after mid, so the minimum is right of mid → <code>lo = mid + 1</code>.</li>
    <li>Otherwise mid..hi is sorted, and mid itself may be the minimum → <code>hi = mid</code> (keep it).</li>
  </ul>
  <p>That is template B: the question "is <code>nums[i] &lt;= nums[-1]</code>?" goes F F F T T T, and the first T is the minimum.</p>
  <table class="tbl out"><caption>Dry run: [3, 4, 5, 1, 2]</caption>
    <tr><th>lo</th><th>hi</th><th>mid</th><th>nums[mid] vs nums[hi]</th><th>Action</th></tr>
    <tr><td>0</td><td>4</td><td>2</td><td>5 &gt; 2</td><td>lo = 3</td></tr>
    <tr><td>3</td><td>4</td><td>3</td><td>1 ≤ 2</td><td>hi = 3</td></tr>
    <tr><td>3</td><td>3</td><td>—</td><td>loop ends</td><td>return nums[3] = 1</td></tr>
  </table>
<div class="fx" data-lang="py">def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo &lt; hi:
        mid = (lo + hi) // 2
        if nums[mid] &gt; nums[hi]:
            lo = mid + 1          # minimum is strictly right of mid
        else:
            hi = mid              # mid could be the minimum
    return nums[lo]

for nums in [[3, 4, 5, 1, 2], [4, 5, 6, 7, 0, 1, 2], [11, 13, 15, 17], [2, 1], [1]]:
    print(nums, "-&gt;", find_min(nums))</div>
  <div class="fx" data-lang="text">[3, 4, 5, 1, 2] -&gt; 1
[4, 5, 6, 7, 0, 1, 2] -&gt; 0
[11, 13, 15, 17] -&gt; 11
[2, 1] -&gt; 1
[1] -&gt; 1</div>
  <p><strong>Complexity.</strong> O(log n) time, O(1) space.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing with <code>nums[lo]</code> instead of <code>nums[hi]</code>. For a list that is not rotated at all (<code>[11, 13, 15, 17]</code>), <code>nums[mid] &gt; nums[lo]</code> is true and pushes you right, away from the minimum. <code>nums[hi]</code> has no such problem. If duplicates are allowed (LeetCode 154), add: when equal, <code>hi -= 1</code>; worst case becomes O(n).</p>
  </div>

  <h2 id="dsa-bs-answer"><span class="num">09</span>Binary Search on the Answer</h2>
  <p>Sometimes there is no sorted list at all. Instead the question asks for "the smallest X that works". If a bigger X always works when a smaller one does, the yes/no answers look like <code>F F F T T T</code>. So binary search the <em>value</em> of X, and test each guess with a helper.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You must reach the station in 30 minutes. Is 10 km/h enough? No. Is 40? Yes. Is 25? Yes. Is 18? No. You keep halving the gap between "too slow" and "fast enough" until you find the slowest speed that still makes it.</p>
  </div>

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
    <tr><td>4</td><td>4</td><td>—</td><td>—</td><td>—</td><td>return 4</td></tr>
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
  <p><strong>Complexity.</strong> O(n · log M) time, where M = max(piles): about 30 guesses for M = 10⁹, each guess sums n piles. O(1) space.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using <code>p // k</code> (rounds down) or <code>math.ceil(p / k)</code> with huge numbers (float rounding). Use <code>(p + k - 1) // k</code>. Also start <code>lo</code> at 1, not 0, or you divide by zero.</p>
  </div>
  <p>The same shape solves "Capacity to Ship Packages Within D Days" (range = max weight … total weight), "Split Array Largest Sum", "Minimum Days to Make Bouquets" and integer square root. Only <code>ok(x)</code> changes.</p>
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

  <h2 id="dsa-bs-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does binary search need from the data, exactly?</summary><div class="qa-body">A yes/no question that is monotonic over the range: once it turns True it stays True (sorted data is one case). It also needs random access, so you can jump to index mid in O(1). A linked list fails the second condition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the time and space complexity of binary search? Why log n?</summary><div class="qa-body">O(log n) time because each step halves the window: n, n/2, n/4, … reaches 1 after log₂ n steps. Iterative uses O(1) extra space; recursive uses O(log n) for the call stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For 1 million sorted items, about how many comparisons in the worst case?</summary><div class="qa-body">About 20, because 2²⁰ ≈ 1,048,576. For a billion items, about 30.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why write mid = lo + (hi - lo) // 2 in Java/C++?</summary><div class="qa-body"><code>lo + hi</code> can exceed the 32-bit int limit and wrap to a negative number. <code>lo + (hi - lo) / 2</code> never exceeds hi. Python ints don't overflow, so <code>(lo + hi) // 2</code> is fine there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your loop is <code>while lo &lt; hi: ... lo = mid</code>. What goes wrong?</summary><div class="qa-body">When <code>hi = lo + 1</code>, mid rounds down to lo, so <code>lo = mid</code> changes nothing and the loop never ends. Use <code>lo = mid + 1</code>, or round mid up (<code>(lo + hi + 1) // 2</code>) if you really need <code>lo = mid</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>bisect_left vs bisect_right on [1, 2, 2, 2, 5] with x = 2?</summary><div class="qa-body">bisect_left = 1 (first index with value ≥ 2), bisect_right = 4 (first index with value &gt; 2). Their difference, 3, is the count of 2s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is bisect.insort O(log n)?</summary><div class="qa-body">No. Finding the spot is O(log n), but inserting into a Python list shifts every later item, so insort is O(n). n inserts cost O(n²). For many inserts with "get smallest", use a heap; for many inserts with order queries, sort once at the end or use a balanced tree (e.g. <code>sortedcontainers.SortedList</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the first and last position of x in a sorted list with duplicates?</summary><div class="qa-body">first = lower bound of x (first index ≥ x); last = (first index &gt; x) − 1, i.e. <code>bisect_right(a, x) - 1</code>. Check that <code>first &lt; n</code> and <code>a[first] == x</code>, else return [−1, −1]. Two O(log n) searches.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a rotated sorted array, why is one half always sorted?</summary><div class="qa-body">A rotated array has exactly one drop (the pivot). Mid splits the array into two halves, and the drop can be in only one of them. The half without the drop is a normal sorted run, so a simple range check tells you if the target can be there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Find Minimum in Rotated Array, why compare nums[mid] with nums[hi], not nums[lo]?</summary><div class="qa-body">nums[mid] &gt; nums[hi] proves the drop is right of mid; otherwise mid..hi is sorted and mid may be the minimum. Comparing with nums[lo] breaks on an unrotated array: mid &gt; lo there too, yet the minimum is at the far left.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you recognise "binary search on the answer"? Complexity of Koko?</summary><div class="qa-body">The question asks for the minimum (or maximum) value such that a condition holds, and the condition is monotonic: a bigger speed/capacity never hurts. Binary search the value range with a check function. Koko: O(n log M), M = max pile, because ~log M guesses each cost an O(n) sum.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have to search an unsorted list once. Sort and binary search, or scan?</summary><div class="qa-body">Scan: O(n). Sorting first costs O(n log n), which is already more. Sort only if you will search many times (k searches: O(n log n + k log n) vs O(k·n)), or use a set/dict for O(1) average lookups.</div></details>
</main>`
});
