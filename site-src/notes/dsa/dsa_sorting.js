// notes/dsa/dsa_sorting.js — Sorting
Object.assign(TOPIC_CONTENT, {
  "dsa_sorting": `<main>
<h1>Sorting</h1>
  <p class="lead">Sorting puts items in order, and once they are in order a lot of hard questions become easy: search, duplicates, medians, closest pairs, merging. This note builds the classic sorts by hand (merge sort, quick sort, quickselect, counting and radix sort), explains why O(n log n) is the speed limit, and then shows how Python's own <code>sorted()</code> does it all for you. Builds on lists, recursion and Big-O; binary search and heaps are good companions.</p>

  <h2 id="dsa-so-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Sorting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why sort</div>
        <ul>
          <li><b>Order unlocks</b> — binary search, two pointers, greedy on intervals</li>
          <li><b>Equal items sit together</b> — duplicates, grouping, counting become one scan</li>
          <li><b>Min / max / median</b> — read straight from the ends and the middle</li>
          <li>💡 Ration-card list sorted by name: anyone can find their row in seconds</li>
          <li><b>Cost</b> — O(n log n) once, then many cheap questions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Simple sorts O(n²)</div>
        <ul>
          <li><b>Bubble</b> — swap neighbours that are out of order; biggest floats to the end</li>
          <li><b>Selection</b> — find the min, put it at the front; repeat</li>
          <li><b>Insertion</b> — pick the next card, slide it left into place</li>
          <li>Insertion is fast on <b>nearly sorted</b> data (almost O(n))</li>
          <li>Only for tiny inputs and for intuition</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Merge sort</div>
        <ul>
          <li><b>Split</b> in half, sort each half, <b>merge</b> two sorted lists</li>
          <li><b>Always</b> O(n log n): log n levels × n work per level</li>
          <li>O(n) extra space · <b>stable</b> (use <code>&lt;=</code> in merge)</li>
          <li>Bonus: counts inversions while merging</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Quick sort</div>
        <ul>
          <li><b>Partition</b> around a pivot: small | pivot | big, then recurse</li>
          <li><b>Lomuto</b> — pivot at end, one pointer i · <b>Hoare</b> — two pointers from both ends</li>
          <li>Average O(n log n), in place, fast in practice; <b>not stable</b></li>
          <li>⚠ Worst O(n²): sorted input + first/last pivot, or many duplicates</li>
          <li>Fix: random pivot, 3-way partition</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Quickselect</div>
        <ul>
          <li>kth smallest without sorting everything</li>
          <li>Partition once, recurse into <b>one</b> side only</li>
          <li>n + n/2 + n/4 + … ≈ 2n → <b>O(n) average</b>, O(n²) worst</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Beyond comparisons</div>
        <ul>
          <li><b>Lower bound</b> — any compare-only sort needs ≈ n log n comparisons (n! orders)</li>
          <li><b>Counting sort</b> — small integer range k: O(n + k)</li>
          <li><b>Radix sort</b> — digit by digit with a stable counting sort: O(d·(n + base))</li>
          <li>They beat n log n by not comparing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python way</div>
        <ul>
          <li><b>Timsort</b> — finds sorted runs, merges them; O(n) on sorted data</li>
          <li><code>sorted(x)</code> new list · <code>x.sort()</code> in place, returns <b>None</b></li>
          <li><code>key=</code> one value per item · tuples for many keys · <code>reverse=True</code></li>
          <li><code>functools.cmp_to_key</code> for "compare two items" rules</li>
          <li><b>Stable</b> — equal keys keep their old order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Sort Colors</b> (Dutch flag) · <b>Kth Largest</b> (quickselect)</li>
          <li><b>Largest Number</b> (cmp_to_key) · <b>Merge Sorted Array</b> (from the back)</li>
          <li><b>Sort an Array</b> (merge sort) · <b>Count Inversions</b> · <b>H-Index</b></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-so-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Sorting Matters</span><span class="rm-sub">What order buys you</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-simple"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Three Simple Sorts</span><span class="rm-sub">Bubble, selection, insertion</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-merge"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Merge Sort</span><span class="rm-sub">Split, sort halves, merge</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-quick"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Quick Sort</span><span class="rm-sub">Lomuto, Hoare, pivots, worst case</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-select"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Quickselect</span><span class="rm-sub">kth smallest in O(n) average</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-bound"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The n log n Wall</span><span class="rm-sub">Why comparison sorts can't do better</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-counting"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Counting &amp; Radix Sort</span><span class="rm-sub">Sorting without comparing</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-stable"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Stability</span><span class="rm-sub">Ties keep their order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-python"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Sorting in Python</span><span class="rm-sub">Timsort, sorted vs sort, key, cmp_to_key</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words and which tool</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">7 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">None returns, bad pivots, unstable keys</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-so-why"><span class="num">01</span>Why Sorting Matters</h2>
  <p>Think of the voter list pasted outside a polling booth. It is sorted by name. You find your row in seconds, because you can jump to "R" and stop as soon as you pass your name. If the list were in random order, you would read every line.</p>
  <p>That is what sorting buys: you pay once to put things in order, and then many questions become cheap. Look at what one <code>sorted()</code> call gives us.</p>
<div class="fx" data-lang="py">marks = [67, 92, 45, 88, 92, 73, 51]
s = sorted(marks)
print("sorted:", s)
print("min, max, median:", s[0], s[-1], s[len(s) // 2])
print("has duplicates:", any(s[i] == s[i + 1] for i in range(len(s) - 1)))
print("closest pair gap:", min(s[i + 1] - s[i] for i in range(len(s) - 1)))</div>
  <div class="fx" data-lang="text">sorted: [45, 51, 67, 73, 88, 92, 92]
min, max, median: 45 92 73
has duplicates: True
closest pair gap: 0</div>  <p>Each of those is one pass over the sorted list. On the unsorted list, "closest pair" would need every pair checked: O(n²).</p>
  <table class="tbl">
    <tr><th>Task</th><th>Unsorted</th><th>After sorting (O(n log n) once)</th></tr>
    <tr><td>Find x</td><td>O(n) scan</td><td>O(log n) binary search</td></tr>
    <tr><td>Any duplicates?</td><td>O(n²) pairs, or a set</td><td>O(n): duplicates are neighbours</td></tr>
    <tr><td>Closest two numbers</td><td>O(n²) pairs</td><td>O(n): only neighbours can be closest</td></tr>
    <tr><td>Two numbers summing to T</td><td>O(n²) pairs, or a dict</td><td>O(n) two pointers</td></tr>
    <tr><td>kth smallest, median</td><td>O(n) quickselect</td><td>O(1): just index it</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sorting</strong>: rearranging items so that each one is ≤ the next, by some rule (number, name, length, a key you choose). A <strong>comparison sort</strong> only learns about the items by asking "is a &lt; b?". Most sorts are comparison sorts.</p>
  </div>
  <p>Where you meet it: "sort by price" on shopping sites, database <code>ORDER BY</code>, leaderboards, and the "sort first, then…" step of many interview answers.</p>

  <h2 id="dsa-so-simple"><span class="num">02</span>Three Simple Sorts</h2>
  <p>These three are slow (O(n²)). Nobody uses them on big data. We learn them because they are how a person sorts by hand, and they make the fast sorts easier to understand.</p>
  <div class="cards">
    <div><b>Bubble sort</b><p>Walk the list, swap any two neighbours that are in the wrong order. After one pass, the biggest item has "bubbled" to the end. Repeat.</p><small>Stop early if a pass makes no swap</small></div>
    <div><b>Selection sort</b><p>Find the smallest item, swap it to the front. Find the smallest of the rest, swap it to position 1. Repeat.</p><small>Always n²/2 comparisons, few swaps</small></div>
    <div><b>Insertion sort</b><p>Like sorting playing cards in your hand: pick the next card and slide it left until it fits.</p><small>Fast on nearly sorted data</small></div>
  </div>
  <p>Insertion sort is the most useful of the three, so let us watch it. The left part is always sorted; each step takes one new card from the right and slides it in.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Playing teen patti or rummy: you pick up cards one at a time. Each new card goes into the right place among the cards already in your hand. You never re-sort the whole hand.</p>
  </div>
<div class="fx" data-lang="py">def insertion_sort(a, trace=False):
    a = a[:]
    for i in range(1, len(a)):
        x = a[i]                       # the card we picked up
        j = i - 1
        while j &gt;= 0 and a[j] &gt; x:
            a[j + 1] = a[j]            # shift bigger card one step right
            j -= 1
        a[j + 1] = x                   # drop the card into the gap
        if trace:
            print(f"i={i} placed {x}: {a}")
    return a

insertion_sort([5, 2, 4, 6, 1, 3], trace=True)</div>
  <div class="fx" data-lang="text">i=1 placed 2: [2, 5, 4, 6, 1, 3]
i=2 placed 4: [2, 4, 5, 6, 1, 3]
i=3 placed 6: [2, 4, 5, 6, 1, 3]
i=4 placed 1: [1, 2, 4, 5, 6, 3]
i=5 placed 3: [1, 2, 3, 4, 5, 6]</div>  <table class="tbl">
    <tr><th>Sort</th><th>Best</th><th>Average / worst</th><th>Extra space</th><th>Stable?</th></tr>
    <tr><td>Bubble (with early stop)</td><td>O(n) already sorted</td><td>O(n²)</td><td>O(1)</td><td>Yes</td></tr>
    <tr><td>Selection</td><td>O(n²) always</td><td>O(n²)</td><td>O(1)</td><td>No (long swaps jump over equals)</td></tr>
    <tr><td>Insertion</td><td>O(n) already sorted</td><td>O(n²)</td><td>O(1)</td><td>Yes</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Insertion sort's work equals the number of out-of-order pairs. On nearly sorted data that number is tiny, so it runs almost in O(n). That is why real libraries (Timsort included) use insertion sort for short pieces of around 32–64 items.</p>
  </div>

  <h2 id="dsa-so-merge"><span class="num">03</span>Merge Sort</h2>
  <p>Start with an easier job. Two class sections have each lined up by roll number. The teacher wants one combined line. She does not re-sort everyone. She looks at the front student of each line, sends the smaller roll number forward, and repeats. One pass, done. That is a <strong>merge</strong>.</p>
<div class="fx" data-lang="py">def merge(left, right):
    out, i, j = [], 0, 0
    while i &lt; len(left) and j &lt; len(right):
        if left[i] &lt;= right[j]:        # &lt;= keeps equal items in old order (stable)
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])               # one side is used up;
    out.extend(right[j:])              # copy what is left of the other
    return out

print(merge([3, 27, 38, 43], [9, 10, 15, 82]))</div>
  <div class="fx" data-lang="text">[3, 9, 10, 15, 27, 38, 43, 82]</div>  <p>Merging is easy only if both halves are already sorted. How do we get sorted halves? Sort them the same way: split again, and again, until each piece has one item. One item is always sorted. Then merge back up.</p>
<figure class="viz"><svg viewBox="0 0 600 315" width="600"><line x1="300" y1="44" x2="168" y2="70" stroke="currentColor" stroke-opacity="0.5"/><line x1="300" y1="44" x2="432" y2="70" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="94" x2="118" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="94" x2="218" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="94" x2="382" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="94" x2="482" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="118" y1="204" x2="168" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="218" y1="204" x2="168" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="382" y1="204" x2="432" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="482" y1="204" x2="432" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="254" x2="300" y2="280" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="254" x2="300" y2="280" stroke="currentColor" stroke-opacity="0.5"/><g class="fb sb"><rect x="164" y="20" width="34" height="24"/><rect x="198" y="20" width="34" height="24"/><rect x="232" y="20" width="34" height="24"/><rect x="266" y="20" width="34" height="24"/><rect x="300" y="20" width="34" height="24"/><rect x="334" y="20" width="34" height="24"/><rect x="368" y="20" width="34" height="24"/><rect x="402" y="20" width="34" height="24"/></g><g text-anchor="middle"><text x="181" y="36">38</text><text x="215" y="36">27</text><text x="249" y="36">43</text><text x="283" y="36">3</text><text x="317" y="36">9</text><text x="351" y="36">82</text><text x="385" y="36">10</text><text x="419" y="36">15</text></g><g class="fb sb"><rect x="100" y="70" width="34" height="24"/><rect x="134" y="70" width="34" height="24"/><rect x="168" y="70" width="34" height="24"/><rect x="202" y="70" width="34" height="24"/></g><g text-anchor="middle"><text x="117" y="86">38</text><text x="151" y="86">27</text><text x="185" y="86">43</text><text x="219" y="86">3</text></g><g class="fb sb"><rect x="364" y="70" width="34" height="24"/><rect x="398" y="70" width="34" height="24"/><rect x="432" y="70" width="34" height="24"/><rect x="466" y="70" width="34" height="24"/></g><g text-anchor="middle"><text x="381" y="86">9</text><text x="415" y="86">82</text><text x="449" y="86">10</text><text x="483" y="86">15</text></g><g class="fb sb"><rect x="84" y="120" width="34" height="24"/><rect x="118" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="101" y="136">38</text><text x="135" y="136">27</text></g><g class="fb sb"><rect x="184" y="120" width="34" height="24"/><rect x="218" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="201" y="136">43</text><text x="235" y="136">3</text></g><g class="fb sb"><rect x="348" y="120" width="34" height="24"/><rect x="382" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="365" y="136">9</text><text x="399" y="136">82</text></g><g class="fb sb"><rect x="448" y="120" width="34" height="24"/><rect x="482" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="465" y="136">10</text><text x="499" y="136">15</text></g><g class="fg sg"><rect x="84" y="180" width="34" height="24"/><rect x="118" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="101" y="196">27</text><text x="135" y="196">38</text></g><g class="fg sg"><rect x="184" y="180" width="34" height="24"/><rect x="218" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="201" y="196">3</text><text x="235" y="196">43</text></g><g class="fg sg"><rect x="348" y="180" width="34" height="24"/><rect x="382" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="365" y="196">9</text><text x="399" y="196">82</text></g><g class="fg sg"><rect x="448" y="180" width="34" height="24"/><rect x="482" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="465" y="196">10</text><text x="499" y="196">15</text></g><g class="fg sg"><rect x="100" y="230" width="34" height="24"/><rect x="134" y="230" width="34" height="24"/><rect x="168" y="230" width="34" height="24"/><rect x="202" y="230" width="34" height="24"/></g><g text-anchor="middle"><text x="117" y="246">3</text><text x="151" y="246">27</text><text x="185" y="246">38</text><text x="219" y="246">43</text></g><g class="fg sg"><rect x="364" y="230" width="34" height="24"/><rect x="398" y="230" width="34" height="24"/><rect x="432" y="230" width="34" height="24"/><rect x="466" y="230" width="34" height="24"/></g><g text-anchor="middle"><text x="381" y="246">9</text><text x="415" y="246">10</text><text x="449" y="246">15</text><text x="483" y="246">82</text></g><g class="fg sg"><rect x="164" y="280" width="34" height="24"/><rect x="198" y="280" width="34" height="24"/><rect x="232" y="280" width="34" height="24"/><rect x="266" y="280" width="34" height="24"/><rect x="300" y="280" width="34" height="24"/><rect x="334" y="280" width="34" height="24"/><rect x="368" y="280" width="34" height="24"/><rect x="402" y="280" width="34" height="24"/></g><g text-anchor="middle"><text x="181" y="296">3</text><text x="215" y="296">9</text><text x="249" y="296">10</text><text x="283" y="296">15</text><text x="317" y="296">27</text><text x="351" y="296">38</text><text x="385" y="296">43</text><text x="419" y="296">82</text></g><text x="10" y="36" class="tb">split</text><text x="10" y="86" class="tb">split</text><text x="10" y="136" class="tb">split</text><line x1="20" y1="164" x2="580" y2="164" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.4"/><text x="300" y="159" class="tm" text-anchor="middle">split pairs into single items (always sorted), then merge upward</text><text x="10" y="196" class="tg">merge</text><text x="10" y="246" class="tg">merge</text><text x="10" y="296" class="tg">merge</text></svg><figcaption>Merge sort on 8 numbers. Blue: keep cutting in half (log₂ 8 = 3 levels). Green: merge sorted halves back together. Each level touches all 8 numbers once, so the total work is n × log n.</figcaption></figure>
<div class="fx" data-lang="py">def merge_sort(a):
    if len(a) &lt;= 1:                    # 0 or 1 item: already sorted
        return a
    mid = len(a) // 2
    return merge(merge_sort(a[:mid]), merge_sort(a[mid:]))

print(merge_sort([38, 27, 43, 3, 9, 82, 10, 15]))
print(merge_sort([]), merge_sort([1]), merge_sort([2, 1, 2, 1]))</div>
  <div class="fx" data-lang="text">[3, 9, 10, 15, 27, 38, 43, 82]
[] [1] [1, 1, 2, 2]</div>  <h3>Why O(n log n)</h3>
  <p>Count levels in the picture. 8 → 4 → 2 → 1 is 3 halvings, which is log₂ 8. On every level, the merges together touch all n items once. So the total is n per level × log n levels = <strong>O(n log n)</strong>. That holds for every input. For n = 1,000,000 that is about 20 million steps, against 10¹² for an O(n²) sort.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Divide and conquer</strong>: split the problem into smaller copies of itself, solve them (usually by recursion), and combine the answers. Merge sort does the real work in the <em>combine</em> step (merge). Quick sort, next, does it in the <em>divide</em> step (partition).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Merge sort needs O(n) extra memory for the merged lists. Writing <code>left[i] &lt; right[j]</code> instead of <code>&lt;=</code> still sorts correctly, but takes equal items from the right first, so the sort is no longer stable.</p>
  </div>

  <h2 id="dsa-so-quick"><span class="num">04</span>Quick Sort</h2>
  <p>A PT teacher wants students in height order. She picks one student, Ravi, as the <strong>pivot</strong>: "everyone shorter than Ravi, go left; taller, go right". Now Ravi is standing exactly where he belongs in the final line. Nobody on the left ever needs to swap with anyone on the right. She repeats the same trick inside each group.</p>
  <p>That step is called <strong>partition</strong>. Quick sort is: partition, then quick sort the left part and the right part.</p>
<figure class="viz"><svg viewBox="0 0 600 215" width="600"><text x="10" y="42" class="tm">before</text><rect x="125" y="24" width="50" height="28" class="fs" stroke="currentColor"/><text x="150" y="43" text-anchor="middle">7</text><rect x="175" y="24" width="50" height="28" class="fs" stroke="currentColor"/><text x="200" y="43" text-anchor="middle">2</text><rect x="225" y="24" width="50" height="28" class="fs" stroke="currentColor"/><text x="250" y="43" text-anchor="middle">9</text><rect x="275" y="24" width="50" height="28" class="fs" stroke="currentColor"/><text x="300" y="43" text-anchor="middle">4</text><rect x="325" y="24" width="50" height="28" class="fs" stroke="currentColor"/><text x="350" y="43" text-anchor="middle">3</text><rect x="375" y="24" width="50" height="28" class="fs" stroke="currentColor"/><text x="400" y="43" text-anchor="middle">8</text><rect x="425" y="24" width="50" height="28" class="fg sg" stroke="currentColor"/><text x="450" y="43" text-anchor="middle">5</text><text x="450" y="70" class="tg" text-anchor="middle">pivot</text><text x="10" y="132" class="tm">after</text><rect x="125" y="114" width="50" height="28" class="fb sb"/><text x="150" y="133" text-anchor="middle">2</text><rect x="175" y="114" width="50" height="28" class="fb sb"/><text x="200" y="133" text-anchor="middle">4</text><rect x="225" y="114" width="50" height="28" class="fb sb"/><text x="250" y="133" text-anchor="middle">3</text><rect x="275" y="114" width="50" height="28" class="fg sg"/><text x="300" y="133" text-anchor="middle">5</text><rect x="325" y="114" width="50" height="28" class="fr sr"/><text x="350" y="133" text-anchor="middle">9</text><rect x="375" y="114" width="50" height="28" class="fr sr"/><text x="400" y="133" text-anchor="middle">8</text><rect x="425" y="114" width="50" height="28" class="fr sr"/><text x="450" y="133" text-anchor="middle">7</text><text x="300" y="94" class="tm" text-anchor="middle">↓ one pass, 6 comparisons ↓</text><text x="200" y="164" class="tb" text-anchor="middle">all &lt; 5</text><text x="300" y="164" class="tg" text-anchor="middle">final spot</text><text x="400" y="164" class="tr" text-anchor="middle">all &gt; 5</text><text x="200" y="192" class="tm" text-anchor="middle">quick sort this part</text><text x="400" y="192" class="tm" text-anchor="middle">quick sort this part</text></svg><figcaption>Partition around the pivot 5. Afterwards 5 sits exactly where it will be in the final sorted list. Smaller numbers are on its left (in any order), bigger ones on its right. Then each side is sorted the same way.</figcaption></figure>
  <h3>Lomuto partition (easiest to write)</h3>
  <p>Take the last item as pivot. Keep a pointer <code>i</code> = "next place for a small item". Walk <code>j</code> across the list; whenever <code>a[j] &lt; pivot</code>, swap it to position <code>i</code> and move <code>i</code> on. At the end, swap the pivot into position <code>i</code>.</p>
<div class="fx" data-lang="py">import random

def lomuto_partition(a, lo, hi):
    pivot = a[hi]
    i = lo                              # a[lo:i] holds items &lt; pivot
    for j in range(lo, hi):
        if a[j] &lt; pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]           # pivot goes to its final spot
    return i

def quick_sort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo &lt; hi:
        r = random.randint(lo, hi)      # random pivot: no bad input exists
        a[r], a[hi] = a[hi], a[r]
        p = lomuto_partition(a, lo, hi)
        quick_sort(a, lo, p - 1)
        quick_sort(a, p + 1, hi)

a = [7, 2, 9, 4, 3, 8, 5]
p = lomuto_partition(a, 0, len(a) - 1)
print("after one partition:", a, "pivot index:", p)
b = [38, 27, 43, 3, 9, 82, 10, 15]
quick_sort(b)                           # sorts in place, returns None
print("quick sorted:", b)</div>
  <div class="fx" data-lang="text">after one partition: [2, 4, 3, 5, 9, 8, 7] pivot index: 3
quick sorted: [3, 9, 10, 15, 27, 38, 43, 82]</div>  <h3>Hoare partition (fewer swaps)</h3>
  <p>Hoare's original version uses two pointers walking toward each other. The left one stops at an item that is too big, the right one at an item that is too small, and they swap. It swaps less than Lomuto and copes well with many equal items. The catch: the pivot does not end at a fixed index, so recursion uses <code>(lo, p)</code> and <code>(p+1, hi)</code>.</p>
<div class="fx" data-lang="py">def hoare_partition(a, lo, hi):
    pivot = a[(lo + hi) // 2]
    i, j = lo - 1, hi + 1
    while True:
        i += 1
        while a[i] &lt; pivot:             # find a big item on the left
            i += 1
        j -= 1
        while a[j] &gt; pivot:             # find a small item on the right
            j -= 1
        if i &gt;= j:
            return j                    # a[lo..j] &lt;= pivot &lt;= a[j+1..hi]
        a[i], a[j] = a[j], a[i]

def quick_sort_hoare(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo &lt; hi:
        p = hoare_partition(a, lo, hi)
        quick_sort_hoare(a, lo, p)      # note: p, not p - 1
        quick_sort_hoare(a, p + 1, hi)

c = [7, 2, 9, 4, 3, 8, 5, 5, 5]
quick_sort_hoare(c)
print(c)</div>
  <div class="fx" data-lang="text">[2, 3, 4, 5, 5, 5, 7, 8, 9]</div>  <h3>Pivot choice and the worst case</h3>
  <p>Quick sort is fast when the pivot splits the list roughly in half: log n levels, n work each, O(n log n). It is slow when the pivot is always the smallest or biggest item. Then each partition removes only one item: n + (n−1) + (n−2) + … ≈ n²/2. That is what happens if you always take the last item as pivot and the input is <em>already sorted</em>. Let us count comparisons.</p>
<div class="fx" data-lang="py">import math

def count_comparisons(values, random_pivot):
    a, count = list(values), 0
    todo = [(0, len(a) - 1)]            # our own stack instead of recursion
    while todo:
        lo, hi = todo.pop()
        if lo &gt;= hi:
            continue
        if random_pivot:
            r = random.randint(lo, hi)
            a[r], a[hi] = a[hi], a[r]
        count += hi - lo                # partition compares each item with the pivot
        p = lomuto_partition(a, lo, hi)
        todo += [(lo, p - 1), (p + 1, hi)]
    return count

random.seed(1)
n = 2000
print("sorted input, last pivot  :", count_comparisons(range(n), False))
print("sorted input, random pivot:", count_comparisons(range(n), True))
print("all equal,    random pivot:", count_comparisons([7] * n, True))
print("n*n/2 =", n * n // 2, "   n*log2(n) =", round(n * math.log2(n)))</div>
  <div class="fx" data-lang="text">sorted input, last pivot  : 1999000
sorted input, random pivot: 24214
all equal,    random pivot: 1999000
n*n/2 = 2000000    n*log2(n) = 21932</div>  <p>Two lessons. A <strong>random pivot</strong> turns sorted input from 2 million comparisons into about 25 thousand. But <strong>all-equal input</strong> still hits n²/2 with Lomuto: every item is "not smaller" than the pivot, so the pivot lands at one end every time. The fix is a <strong>3-way partition</strong> (less | equal | greater) — the Dutch flag idea in Sort Colors below — or Hoare's scheme.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Recursive quick sort with a bad pivot also goes n levels deep. Python's default recursion limit is 1000, so sorting 5,000 already-sorted numbers with a last-item pivot crashes with <code>RecursionError</code> before it even gets slow. Merge sort's depth is only log n.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Merge sort</th><th>Quick sort</th></tr>
    <tr><td>Time</td><td>O(n log n) always</td><td>O(n log n) average, O(n²) worst</td></tr>
    <tr><td>Extra space</td><td>O(n)</td><td>O(log n) stack (in place)</td></tr>
    <tr><td>Stable</td><td>Yes</td><td>No</td></tr>
    <tr><td>Where it shines</td><td>Linked lists, external sorting (files bigger than RAM), when stability matters</td><td>Arrays in memory: cache friendly, tiny constant</td></tr>
  </table>

  <h2 id="dsa-so-select"><span class="num">05</span>Quickselect</h2>
  <p>Sometimes you do not need the whole list sorted. You need one item: the median salary, the 3rd highest score, the kth smallest. Sorting everything costs O(n log n). Can we do less?</p>
  <p>Look at partition again. After one partition, the pivot is at its final index <code>p</code>. If we want index <code>k</code> and <code>k &lt; p</code>, the answer is somewhere on the left. We can forget the right side completely. That is <strong>quickselect</strong>: quick sort that only goes into one side.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Looking for the 10th tallest student. The teacher splits the class around Ravi, and 25 students are taller than him. The 10th tallest must be in that taller group, so the shorter group can go back to class.</p>
  </div>
<div class="fx" data-lang="py">def quickselect(nums, k):
    """k-th smallest item, k counted from 0."""
    a = nums[:]
    lo, hi = 0, len(a) - 1
    while True:
        r = random.randint(lo, hi)
        a[r], a[hi] = a[hi], a[r]
        p = lomuto_partition(a, lo, hi)
        if p == k:
            return a[p]
        if k &lt; p:
            hi = p - 1                   # answer is on the left
        else:
            lo = p + 1                   # answer is on the right

data = [7, 2, 9, 4, 3, 8, 5]
print("sorted:", sorted(data))
print("0th, 3rd (median), 6th smallest:", quickselect(data, 0), quickselect(data, 3), quickselect(data, 6))</div>
  <div class="fx" data-lang="text">sorted: [2, 3, 4, 5, 7, 8, 9]
0th, 3rd (median), 6th smallest: 2 5 9</div>  <p>Why O(n) on average: the first partition looks at n items, the next at about n/2, then n/4… The sum n + n/2 + n/4 + … is less than 2n. Worst case is still O(n²) with unlucky pivots, which a random pivot makes very unlikely. The same duplicate trap applies; the Kth Largest problem below uses a 3-way version.</p>
  <p>Compare: sort then index is O(n log n); a heap of size k (heaps note) is O(n log k) and works on streams; quickselect is O(n) average and in place.</p>

  <h2 id="dsa-so-bound"><span class="num">06</span>The n log n Wall</h2>
  <p>Merge sort, quick sort (average) and heap sort are all O(n log n). Why does nobody find an O(n) comparison sort? Because there is a proof that it cannot exist.</p>
  <p>A comparison sort learns about the input only by asking yes/no questions: "is a &lt; b?". Draw every possible run of questions as a tree. Each leaf is one final answer, i.e. one ordering of the items.</p>
<figure class="viz"><svg viewBox="0 0 600 250" width="600"><line x1="300" y1="40" x2="160" y2="86" stroke="currentColor" stroke-opacity="0.6"/><text x="215" y="58" class="tm" text-anchor="middle">yes</text><line x1="300" y1="40" x2="440" y2="86" stroke="currentColor" stroke-opacity="0.6"/><text x="385" y="58" class="tm" text-anchor="middle">no</text><line x1="160" y1="112" x2="80" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="105" y="128" class="tm" text-anchor="middle">yes</text><line x1="160" y1="112" x2="230" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="210" y="128" class="tm" text-anchor="middle">no</text><line x1="440" y1="112" x2="370" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="390" y="128" class="tm" text-anchor="middle">yes</text><line x1="440" y1="112" x2="520" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="495" y="128" class="tm" text-anchor="middle">no</text><line x1="230" y1="176" x2="190" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="195" y="192" class="tm" text-anchor="middle">yes</text><line x1="230" y1="176" x2="270" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="265" y="192" class="tm" text-anchor="middle">no</text><line x1="520" y1="176" x2="480" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="485" y="192" class="tm" text-anchor="middle">yes</text><line x1="520" y1="176" x2="560" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="555" y="192" class="tm" text-anchor="middle">no</text><rect x="265.0" y="16" width="70" height="26" rx="13" class="fb sb"/><text x="300" y="34" text-anchor="middle">a &lt; b ?</text><rect x="125.0" y="86" width="70" height="26" rx="13" class="fb sb"/><text x="160" y="104" text-anchor="middle">b &lt; c ?</text><rect x="405.0" y="86" width="70" height="26" rx="13" class="fb sb"/><text x="440" y="104" text-anchor="middle">a &lt; c ?</text><rect x="50" y="149" width="60" height="24" class="fg sg"/><text x="80" y="166" text-anchor="middle">a b c</text><rect x="195.0" y="150" width="70" height="26" rx="13" class="fb sb"/><text x="230" y="168" text-anchor="middle">a &lt; c ?</text><rect x="340" y="149" width="60" height="24" class="fg sg"/><text x="370" y="166" text-anchor="middle">b a c</text><rect x="485.0" y="150" width="70" height="26" rx="13" class="fb sb"/><text x="520" y="168" text-anchor="middle">b &lt; c ?</text><rect x="160" y="209" width="60" height="24" class="fg sg"/><text x="190" y="226" text-anchor="middle">a c b</text><rect x="240" y="209" width="60" height="24" class="fg sg"/><text x="270" y="226" text-anchor="middle">c a b</text><rect x="450" y="209" width="60" height="24" class="fg sg"/><text x="480" y="226" text-anchor="middle">b c a</text><rect x="530" y="209" width="60" height="24" class="fg sg"/><text x="560" y="226" text-anchor="middle">c b a</text><text x="10" y="246" class="tm">3! = 6 orders → at least log₂ 6 ≈ 2.6, so 3 questions worst case</text></svg><figcaption>Any sort that only asks "is x &lt; y?" is a yes/no tree. Each leaf is one possible order of a, b, c. With n items there are n! leaves, so the tree must be at least log₂(n!) ≈ n log n deep.</figcaption></figure>
  <p>n items can be arranged in n! ways (3 items: 6 ways). The sort must be able to end at any of them, so the tree needs at least n! leaves. A yes/no tree of depth d has at most 2^d leaves. So 2^d ≥ n!, which means d ≥ log₂(n!). And log₂(n!) grows like n log₂ n.</p>
  <p>For n = 1,000: log₂(n!) ≈ 8,529 while n·log₂ n ≈ 9,966. For a million items: 18.5 million vs 19.9 million. Same growth.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every comparison is one yes/no answer, and it can at best cut the remaining possible orders in half. You need about log₂(n!) ≈ n log n halvings to get down to one order. So <strong>any</strong> comparison sort has a worst case of at least about n log n comparisons. The only way past the wall is to stop comparing — next section.</p>
  </div>

  <h2 id="dsa-so-counting"><span class="num">07</span>Counting &amp; Radix Sort</h2>
  <p>A teacher has 500 answer sheets with marks from 0 to 100. She does not compare sheets. She makes 101 piles, one per mark, drops each sheet in its pile, then picks the piles up in order. Every sheet is touched once. That is <strong>counting sort</strong>.</p>
<div class="fx" data-lang="py">def counting_sort(nums, max_value):
    count = [0] * (max_value + 1)
    for x in nums:                      # one pile per value
        count[x] += 1
    return [v for v, c in enumerate(count) for _ in range(c)]</div>  <p>Cost: O(n + k), where k is the range of values. Great when k is small (marks, ages, ratings 1–5, letters a–z). Terrible when k is huge: sorting 10 phone numbers this way needs a count list of 10 billion slots.</p>
  <p>To sort <em>records</em> by a small integer key and keep ties in order (stable), use prefix sums: <code>start[v]</code> = how many keys are smaller than v = where the first item with key v goes.</p>
<div class="fx" data-lang="py">def counting_sort_by(items, key, k):
    count = [0] * k
    for it in items:
        count[key(it)] += 1
    start, total = [0] * k, 0
    for v in range(k):                  # start[v] = number of keys smaller than v
        start[v], total = total, total + count[v]
    out = [None] * len(items)
    for it in items:                    # left to right keeps ties in order
        out[start[key(it)]] = it
        start[key(it)] += 1
    return out

students = [("Asha", 2), ("Ravi", 1), ("Neha", 2), ("Om", 0), ("Zoya", 1)]
print(counting_sort_by(students, key=lambda s: s[1], k=3))</div>
  <div class="fx" data-lang="text">[('Om', 0), ('Ravi', 1), ('Zoya', 1), ('Asha', 2), ('Neha', 2)]</div>  <p><strong>Radix sort</strong> uses that stable counting sort many times, once per digit, starting from the <em>last</em> digit. After sorting by the ones digit, then (stably) by the tens, then by the hundreds, the numbers are fully sorted. Stability is what keeps the earlier digit order inside each pile.</p>
<div class="fx" data-lang="py">def radix_sort(nums, base=10):
    """Non-negative integers. LSD = least significant digit first."""
    if not nums:
        return []
    out, place = nums[:], 1
    while place &lt;= max(nums):
        out = counting_sort_by(out, key=lambda x: (x // place) % base, k=base)
        print(f"by digit {place:&gt;3}: {out}")
        place *= base
    return out

radix_sort([170, 45, 75, 90, 802, 24, 2, 66])</div>
  <div class="fx" data-lang="text">by digit   1: [170, 90, 802, 2, 24, 45, 75, 66]
by digit  10: [802, 2, 24, 45, 66, 170, 75, 90]
by digit 100: [2, 24, 45, 66, 75, 90, 170, 802]</div>  <table class="tbl">
    <tr><th>Sort</th><th>Time</th><th>Space</th><th>Needs</th></tr>
    <tr><td>Counting</td><td>O(n + k)</td><td>O(n + k)</td><td>Integer keys in a small range 0..k−1</td></tr>
    <tr><td>Radix (LSD)</td><td>O(d · (n + b))</td><td>O(n + b)</td><td>Fixed-length keys: d digits in base b (ints, dates, fixed strings)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Negative numbers break the simple versions (<code>count[-3]</code> silently means "third from the end"). Shift by the minimum first: use <code>x - min(nums)</code> as the index. And radix sort must use a <em>stable</em> inner sort, or the earlier digits get scrambled.</p>
  </div>

  <h2 id="dsa-so-stable"><span class="num">08</span>Stability</h2>
  <p>A results list is already in alphabetical order. Now you sort it by marks. Asha and Neha both scored 92. Should Asha still come before Neha? A <strong>stable</strong> sort promises yes: items with equal keys keep the order they had before.</p>
<div class="fx" data-lang="py">results = [("Asha", 92), ("Bala", 78), ("Neha", 92), ("Om", 78), ("Ravi", 85)]   # A-Z
by_marks = sorted(results, key=lambda r: r[1], reverse=True)
print(by_marks)</div>
  <div class="fx" data-lang="text">[('Asha', 92), ('Neha', 92), ('Ravi', 85), ('Bala', 78), ('Om', 78)]</div>  <p>Asha stays before Neha, Bala before Om. This lets you sort by several keys in passes: sort by the <em>least</em> important key first, then by the most important one. The last sort wins, and ties fall back to the earlier order.</p>
  <p>One <code>key=lambda s: (s.dept, -s.salary)</code> does the same in a single pass when the minor key is a number.</p>
  <table class="tbl">
    <tr><th>Stable</th><th>Not stable</th></tr>
    <tr><td>Insertion, bubble, merge sort, counting sort, radix sort, Timsort (Python's <code>sorted</code> / <code>list.sort</code>)</td><td>Selection sort, quick sort, heap sort (in their usual in-place forms)</td></tr>
  </table>
  <p>Stability only matters when items carry more than the key (records, tuples sorted by one field). Two equal plain 5s look the same either way.</p>

  <h2 id="dsa-so-python"><span class="num">09</span>Sorting in Python</h2>
  <h3>Timsort</h3>
  <p>Python's built-in sort is <strong>Timsort</strong> (Tim Peters, 2002; Java uses it for objects too). Real data is rarely random: logs arrive mostly in time order, a list is "sorted plus a few new items". Timsort exploits that.</p>
  <ul>
    <li>It scans for <strong>runs</strong>: stretches already ascending (or strictly descending, which it reverses).</li>
    <li>Short runs are extended to a minimum length (32–64) with <strong>insertion sort</strong>.</li>
    <li>Runs are <strong>merged</strong> like merge sort, in a careful order that keeps merges balanced, with "galloping" to skip ahead when one run keeps winning.</li>
  </ul>
  <p>Result: O(n) on sorted or reversed data, O(n log n) worst case, stable, O(n) extra space. Let us count the comparisons it really makes.</p>
<div class="fx" data-lang="py">class Counted:
    calls = 0
    def __init__(self, v):
        self.v = v
    def __lt__(self, other):            # sorted() only ever uses &lt;
        Counted.calls += 1
        return self.v &lt; other.v

def comparisons(values):
    Counted.calls = 0
    sorted(Counted(v) for v in values)
    return Counted.calls

n = 1000
random.seed(7)
print("already sorted:", comparisons(range(n)))
print("reversed      :", comparisons(range(n, 0, -1)))
print("random order  :", comparisons(random.sample(range(n), n)))
print("n*log2(n)     :", round(n * math.log2(n)))</div>
  <div class="fx" data-lang="text">already sorted: 999
reversed      : 999
random order  : 8644
n*log2(n)     : 9966</div>  <p>Sorted and reversed input: 999 comparisons, one per neighbour pair. Random input: below n log₂ n. Notice that Python sorts only ever call <code>&lt;</code>, so a class needs just <code>__lt__</code> to be sortable.</p>
  <h3>sorted() vs .sort()</h3>
<div class="fx" data-lang="py">nums = [3, 1, 2]
new = sorted(nums)            # new list; original untouched
print(nums, new)
result = nums.sort()          # in place; returns None
print(nums, result)
print(sorted("banana"), sorted({"b": 1, "a": 2}), sorted((3, 1, 2), reverse=True))</div>
  <div class="fx" data-lang="text">[3, 1, 2] [1, 2, 3]
[1, 2, 3] None
['a', 'a', 'a', 'b', 'n', 'n'] ['a', 'b'] [3, 2, 1]</div>  <p><code>sorted()</code> takes any iterable (string, tuple, dict keys, generator) and returns a new list. <code>list.sort()</code> works only on lists, changes them in place, and returns <code>None</code>. Both are Timsort, both stable, both take keyword-only <code>key=</code> and <code>reverse=</code>.</p>
  <h3>key=: sort by what you choose</h3>
  <p><code>key</code> is a function called <strong>once per item</strong>. Python sorts by the returned values. Return a tuple to sort by several things; negate a number to flip just that part.</p>
<div class="fx" data-lang="py">from operator import itemgetter

words = ["kiwi", "Apple", "fig", "banana", "Cherry"]
print(sorted(words))                                  # capitals first (ASCII)
print(sorted(words, key=str.lower))                   # ignore case
print(sorted(words, key=lambda w: (-len(w), w.lower())))   # longest first, then A-Z

people = [("Asha", 31), ("Ravi", 25), ("Neha", 31)]
print(sorted(people, key=itemgetter(1)))              # same as lambda p: p[1]</div>
  <div class="fx" data-lang="text">['Apple', 'Cherry', 'banana', 'fig', 'kiwi']
['Apple', 'banana', 'Cherry', 'fig', 'kiwi']
['banana', 'Cherry', 'Apple', 'kiwi', 'fig']
[('Ravi', 25), ('Asha', 31), ('Neha', 31)]</div>  <h3>functools.cmp_to_key: when a key is hard to write</h3>
  <p>Sometimes the rule is about <em>pairs</em>: "a goes before b if …". Old-style comparison functions return a negative number (a first), zero (tie) or positive (b first). <code>cmp_to_key</code> wraps such a function so <code>sorted</code> can use it.</p>
<div class="fx" data-lang="py">from functools import cmp_to_key

def by_version(a, b):                  # "1.10" &gt; "1.9", which plain string sort gets wrong
    pa = [int(x) for x in a.split(".")]
    pb = [int(x) for x in b.split(".")]
    return (pa &gt; pb) - (pa &lt; pb)       # -1, 0 or 1

versions = ["1.10", "1.2", "1.9", "2.0", "1.2.1"]
print(sorted(versions))
print(sorted(versions, key=cmp_to_key(by_version)))</div>
  <div class="fx" data-lang="text">['1.10', '1.2', '1.2.1', '1.9', '2.0']
['1.2', '1.2.1', '1.9', '1.10', '2.0']</div>  <div class="callout trap"><span class="label">Trap</span>
    <p>A comparator must be consistent: if a &lt; b and b &lt; c, then a &lt; c. A rule that breaks this (random results, "rock-paper-scissors") gives a garbage order with no error. Prefer <code>key=</code> whenever you can express the rule as "a value per item": it is faster (one call per item, not one per comparison) and harder to get wrong.</p>
  </div>

  <h2 id="dsa-so-patterns"><span class="num">10</span>Patterns</h2>
  <table class="tbl">
    <tr><th>Pattern</th><th>Signal words</th><th>Tool</th><th>Solved below</th></tr>
    <tr><td><strong>1. Sort first, then sweep</strong></td><td>"intervals", "meetings", "closest", "pairs with sum", "group anagrams"</td><td><code>sort</code> + one pass / two pointers / greedy</td><td>H-Index</td></tr>
    <tr><td><strong>2. Partition</strong></td><td>"in place", "0s, 1s and 2s", "move all X to the front", "one pass"</td><td>Lomuto / Dutch national flag pointers</td><td>Sort Colors</td></tr>
    <tr><td><strong>3. Selection</strong></td><td>"kth largest / smallest", "median", "top k" without full order</td><td>Quickselect O(n) avg; heap O(n log k)</td><td>Kth Largest</td></tr>
    <tr><td><strong>4. Custom order</strong></td><td>"arrange to form the largest", "sort by frequency then value", "custom alphabet"</td><td><code>key=</code> tuples, <code>cmp_to_key</code></td><td>Largest Number</td></tr>
    <tr><td><strong>5. Merge</strong></td><td>"two sorted arrays", "in place into the first", "k sorted lists"</td><td>Two pointers (from the back if in place); heap for k lists</td><td>Merge Sorted Array, Sort an Array</td></tr>
    <tr><td><strong>6. Count while merging</strong></td><td>"pairs i &lt; j with a[i] &gt; a[j]", "smaller numbers after self", "reverse pairs"</td><td>Merge sort with a counter</td><td>Count Inversions</td></tr>
    <tr><td><strong>7. Small value range</strong></td><td>"values 0..100", "ages", "lowercase letters", "O(n) required"</td><td>Counting sort / buckets</td><td>H-Index (counting version)</td></tr>
  </table>

  <h2 id="dsa-so-problems"><span class="num">11</span>Classic Problems</h2>
  <h3>1. Sort Colors (LeetCode 75)</h3>
  <p><strong>Problem.</strong> A list holds only 0, 1 and 2 (red, white, blue). Sort it in place, in one pass, without <code>sort()</code>.</p>
  <p><strong>Brute force.</strong> Count the 0s, 1s, 2s, then overwrite: two passes, O(n). Fine, but the one-pass version is the real question.</p>
  <p><strong>Better: Dutch national flag (Dijkstra).</strong> Three pointers split the list into four zones: <code>[0, low)</code> = 0s, <code>[low, mid)</code> = 1s, <code>[mid, high]</code> = not seen yet, <code>(high, end]</code> = 2s. Look at <code>nums[mid]</code>: a 0 is swapped to <code>low</code>; a 1 is already fine; a 2 is swapped to <code>high</code> — and <code>mid</code> does <em>not</em> move, because the item that came from <code>high</code> is not checked yet.</p>
  <table class="tbl out"><caption>Dry run on [2, 0, 2, 1, 1, 0]</caption>
    <tr><th>nums[mid]</th><th>Action</th><th>nums after</th><th>low, mid, high</th></tr>
    <tr><td>—</td><td>start</td><td>[2, 0, 2, 1, 1, 0]</td><td>0, 0, 5</td></tr>
    <tr><td>2</td><td>swap mid, high; high−1</td><td>[0, 0, 2, 1, 1, 2]</td><td>0, 0, 4</td></tr>
    <tr><td>0</td><td>swap low, mid; both +1</td><td>[0, 0, 2, 1, 1, 2]</td><td>1, 1, 4</td></tr>
    <tr><td>0</td><td>swap low, mid; both +1</td><td>[0, 0, 2, 1, 1, 2]</td><td>2, 2, 4</td></tr>
    <tr><td>2</td><td>swap mid, high; high−1</td><td>[0, 0, 1, 1, 2, 2]</td><td>2, 2, 3</td></tr>
    <tr><td>1</td><td>mid+1</td><td>[0, 0, 1, 1, 2, 2]</td><td>2, 3, 3</td></tr>
    <tr><td>1</td><td>mid+1 → mid &gt; high, stop</td><td>[0, 0, 1, 1, 2, 2]</td><td>2, 4, 3</td></tr>
  </table>
<div class="fx" data-lang="py">def sort_colors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid &lt;= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:                                   # 2
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1                           # mid stays: new nums[mid] unchecked

for case in [[2, 0, 2, 1, 1, 0], [2, 0, 1], [0], [], [2, 2, 1, 1, 0, 0]]:
    original = case[:]
    sort_colors(case)
    print(original, "-&gt;", case)</div>
  <div class="fx" data-lang="text">[2, 0, 2, 1, 1, 0] -&gt; [0, 0, 1, 1, 2, 2]
[2, 0, 1] -&gt; [0, 1, 2]
[0] -&gt; [0]
[] -&gt; []
[2, 2, 1, 1, 0, 0] -&gt; [0, 0, 1, 1, 2, 2]</div>  <p><strong>Complexity.</strong> O(n) time, one pass; O(1) space. The same 3-way split is how quick sort survives many duplicates.</p>

  <h3>2. Kth Largest Element in an Array (LeetCode 215)</h3>
  <p><strong>Problem.</strong> Return the kth largest item (k = 1 is the max). <code>[3, 2, 1, 5, 6, 4]</code>, k = 2 → 5.</p>
  <p><strong>Brute force.</strong> <code>sorted(nums)[-k]</code>: O(n log n). The heaps note does it in O(n log k).</p>
  <p><strong>Better: quickselect.</strong> The kth largest is the item at index <code>n − k</code> in sorted order. Partition around a random pivot into three groups (bigger, equal, smaller). If the bigger group has at least k items, the answer is inside it. If bigger + equal reaches k, the pivot is the answer. Otherwise look in the smaller group for the (k − bigger − equal)th largest. The 3-way split makes many duplicates harmless.</p>
<div class="fx" data-lang="py">def find_kth_largest(nums, k):
    while True:
        pivot = random.choice(nums)
        bigger = [x for x in nums if x &gt; pivot]
        equal = sum(1 for x in nums if x == pivot)
        if k &lt;= len(bigger):
            nums = bigger                       # answer is among the bigger ones
        elif k &lt;= len(bigger) + equal:
            return pivot                        # answer is the pivot itself
        else:
            k -= len(bigger) + equal
            nums = [x for x in nums if x &lt; pivot]

for nums, k in [([3, 2, 1, 5, 6, 4], 2), ([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), ([7], 1), ([1] * 50000, 3), ([-1, -1], 2)]:
    print(nums if len(nums) &lt; 10 else "[1]*50000", k, "-&gt;", find_kth_largest(nums, k))</div>
  <div class="fx" data-lang="text">[3, 2, 1, 5, 6, 4] 2 -&gt; 5
[3, 2, 3, 1, 2, 4, 5, 5, 6] 4 -&gt; 4
[7] 1 -&gt; 7
[1]*50000 3 -&gt; 1
[-1, -1] 2 -&gt; -1</div>  <p><strong>Complexity.</strong> Average O(n) time (n + n/2 + …), O(n) extra space for the lists. The in-place version from section 05 uses O(1) space; ask the interviewer which they prefer.</p>

  <h3>3. Largest Number (LeetCode 179)</h3>
  <p><strong>Problem.</strong> Arrange non-negative integers so that, written side by side, they form the largest number. Return it as a string. <code>[3, 30, 34, 5, 9]</code> → <code>"9534330"</code>.</p>
  <p><strong>Brute force.</strong> Try every order: O(n!·n). Hopeless past 10 numbers.</p>
  <p><strong>Better.</strong> Normal descending sort fails: 30 &gt; 3, but "330" beats "303". The right rule compares <em>pairs</em>: put a before b if the string <code>a + b</code> &gt; <code>b + a</code>. For "3" and "30": "330" &gt; "303", so "3" goes first. This is a pair rule, so <code>cmp_to_key</code> fits. (The rule is consistent, which is what makes sorting with it valid.)</p>
<div class="fx" data-lang="py">def largest_number(nums):
    strs = [str(x) for x in nums]
    def cmp(a, b):
        if a + b &gt; b + a:
            return -1                   # a should come first
        if a + b &lt; b + a:
            return 1
        return 0
    strs.sort(key=cmp_to_key(cmp))
    result = "".join(strs)
    return "0" if result[0] == "0" else result     # [0, 0] -&gt; "0", not "00"

for nums in [[10, 2], [3, 30, 34, 5, 9], [0, 0], [1], [121, 12], [0, 9, 0]]:
    print(nums, "-&gt;", largest_number(nums))</div>
  <div class="fx" data-lang="text">[10, 2] -&gt; 210
[3, 30, 34, 5, 9] -&gt; 9534330
[0, 0] -&gt; 0
[1] -&gt; 1
[121, 12] -&gt; 12121
[0, 9, 0] -&gt; 900</div>  <p><strong>Complexity.</strong> O(n log n) comparisons, each O(L) for numbers of length L. O(n·L) space for the strings.</p>

  <h3>4. Merge Sorted Array (LeetCode 88)</h3>
  <p><strong>Problem.</strong> <code>nums1</code> has m real items followed by n empty slots (zeros). <code>nums2</code> has n items. Both sorted. Merge <code>nums2</code> into <code>nums1</code> in place.</p>
  <p><strong>Brute force.</strong> Copy nums2 into the slots and call <code>sort()</code>: O((m+n) log(m+n)). It works, but ignores that both are sorted.</p>
  <p><strong>Better.</strong> A normal merge from the front would overwrite nums1 items we have not used yet. So merge from the <strong>back</strong>: the free slots are at the end, and the biggest items go there first. Nothing useful is ever overwritten.</p>
  <p>Dry run on <code>[1, 2, 3, _, _, _]</code> and <code>[2, 5, 6]</code>: 6 goes to slot 5, 5 to slot 4, then 3 (from nums1) to slot 3, then 2 (from nums2) to slot 2. nums2 is used up, and <code>[1, 2]</code> is already in place.</p>
<div class="fx" data-lang="py">def merge_sorted_array(nums1, m, nums2, n):
    i, j, k = m - 1, n - 1, m + n - 1
    while j &gt;= 0:                       # once nums2 is used up, nums1's rest is in place
        if i &gt;= 0 and nums1[i] &gt; nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1

for a, m, b, n in [([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3), ([1], 1, [], 0), ([0], 0, [1], 1), ([4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3)]:
    merge_sorted_array(a, m, b, n)
    print(a)</div>
  <div class="fx" data-lang="text">[1, 2, 2, 3, 5, 6]
[1]
[1]
[1, 2, 3, 4, 5, 6]</div>  <p><strong>Complexity.</strong> O(m + n) time, O(1) extra space.</p>

  <h3>5. Sort an Array (LeetCode 912)</h3>
  <p><strong>Problem.</strong> Sort a list of integers in O(n log n) without built-in sort functions. Up to 5·10⁴ items, values can repeat a lot.</p>
  <p><strong>Brute force.</strong> Insertion or bubble sort: O(n²), too slow at 50,000.</p>
  <p><strong>Better.</strong> Merge sort: guaranteed O(n log n), no bad inputs (plain quick sort with a fixed pivot fails this problem's sorted and all-equal tests). Here is the <strong>bottom-up</strong> version: no recursion. Merge runs of width 1 into width 2, then 2 into 4, and so on. It reuses <code>merge</code> from section 03.</p>
<div class="fx" data-lang="py">def sort_array(nums, trace=False):
    a = nums[:]
    n, width = len(a), 1
    while width &lt; n:
        for lo in range(0, n, 2 * width):
            mid = min(lo + width, n)
            hi = min(lo + 2 * width, n)
            a[lo:hi] = merge(a[lo:mid], a[mid:hi])
        if trace:
            print(f"width {width}: {a}")
        width *= 2
    return a

print(sort_array([5, 2, 3, 1, 7, 4], trace=True))
print(sort_array([]), sort_array([1]), sort_array([5, 1, 1, 2, 0, 0]))</div>
  <div class="fx" data-lang="text">width 1: [2, 5, 1, 3, 4, 7]
width 2: [1, 2, 3, 5, 4, 7]
width 4: [1, 2, 3, 4, 5, 7]
[1, 2, 3, 4, 5, 7]
[] [1] [0, 0, 1, 1, 2, 5]</div>  <p><strong>Complexity.</strong> O(n log n) time in every case, O(n) extra space, and no recursion-depth worries.</p>

  <h3>6. Count Inversions</h3>
  <p><strong>Problem.</strong> An <strong>inversion</strong> is a pair i &lt; j with <code>a[i] &gt; a[j]</code>. Count them. It measures "how unsorted" a list is (and how many swaps bubble sort would do). <code>[2, 4, 1, 3, 5]</code> → 3: (2,1), (4,1), (4,3).</p>
  <p><strong>Brute force.</strong> Check every pair: O(n²).</p>
  <p><strong>Better.</strong> Use merge sort. Inversions are either inside the left half, inside the right half, or cross pairs (one in each). The halves count their own by recursion. Cross pairs are counted during the merge: when an item from the <em>right</em> half is taken, every item still waiting in the left half is bigger than it and comes before it. That is <code>len(left) − i</code> inversions in one go.</p>
<div class="fx" data-lang="py">def count_inversions(a):
    def sort_count(x):
        if len(x) &lt;= 1:
            return x, 0
        mid = len(x) // 2
        left, inv_left = sort_count(x[:mid])
        right, inv_right = sort_count(x[mid:])
        merged, i, j, cross = [], 0, 0, 0
        while i &lt; len(left) and j &lt; len(right):
            if left[i] &lt;= right[j]:
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
                cross += len(left) - i          # all waiting left items are bigger
        merged += left[i:] + right[j:]
        return merged, inv_left + inv_right + cross
    return sort_count(a)[1]

for arr in [[2, 4, 1, 3, 5], [1, 2, 3], [3, 2, 1], [], [5, 5, 5], [8, 4, 2, 1]]:
    print(arr, "-&gt;", count_inversions(arr))</div>
  <div class="fx" data-lang="text">[2, 4, 1, 3, 5] -&gt; 3
[1, 2, 3] -&gt; 0
[3, 2, 1] -&gt; 3
[] -&gt; 0
[5, 5, 5] -&gt; 0
[8, 4, 2, 1] -&gt; 6</div>  <p><strong>Complexity.</strong> O(n log n) time, O(n) space. Equal items are not inversions, which is why the merge uses <code>&lt;=</code>. A reversed list of n has the maximum, n(n−1)/2.</p>

  <h3>7. H-Index (LeetCode 274)</h3>
  <p><strong>Problem.</strong> <code>citations[i]</code> = citations of paper i. The h-index is the largest h such that the researcher has at least h papers with at least h citations each. <code>[3, 0, 6, 1, 5]</code> → 3 (papers with 6, 5, 3 citations).</p>
  <p><strong>Brute force.</strong> For each h from n down to 0, count papers with ≥ h citations: O(n²).</p>
  <p><strong>Better.</strong> Sort descending: <code>[6, 5, 3, 1, 0]</code>. Walk with position i (1-based). While the ith paper has ≥ i citations, h = i. The first time it fails, stop. Since h can never exceed n, a counting version with n+1 buckets (anything above n goes into bucket n) runs in O(n).</p>
<div class="fx" data-lang="py">def h_index(citations):
    c = sorted(citations, reverse=True)
    h = 0
    for i, x in enumerate(c, start=1):
        if x &gt;= i:
            h = i                       # i papers with at least i citations
        else:
            break
    return h

def h_index_counting(citations):
    n = len(citations)
    buckets = [0] * (n + 1)
    for c in citations:
        buckets[min(c, n)] += 1         # cap at n: h is never above n
    papers = 0
    for h in range(n, -1, -1):
        papers += buckets[h]            # papers with &gt;= h citations
        if papers &gt;= h:
            return h

for cit in [[3, 0, 6, 1, 5], [1, 3, 1], [0], [100], [], [4, 4, 4, 4]]:
    print(cit, "-&gt;", h_index(cit), h_index_counting(cit))</div>
  <div class="fx" data-lang="text">[3, 0, 6, 1, 5] -&gt; 3 3
[1, 3, 1] -&gt; 1 1
[0] -&gt; 0 0
[100] -&gt; 1 1
[] -&gt; 0 0
[4, 4, 4, 4] -&gt; 4 4</div>  <p><strong>Complexity.</strong> Sorting version O(n log n) time, O(n) space. Counting version O(n) time, O(n) space: a good example of "small value range → counting sort".</p>

  <h2 id="dsa-so-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: x = x.sort()</span>
    <p><code>list.sort()</code> sorts in place and returns <code>None</code>. <code>x = x.sort()</code> throws your list away. Use <code>x.sort()</code> alone, or <code>x = sorted(x)</code>. Same with <code>return nums.sort()</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: quick sort with a fixed end pivot</span>
    <p>Sorted or reversed input makes it O(n²) and n levels deep (<code>RecursionError</code> in Python). Use a random or middle pivot, and a 3-way partition if duplicates are common.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sorting strings that hold numbers</span>
    <p><code>sorted(["10", "9", "2"])</code> gives <code>['10', '2', '9']</code> — string order, character by character. Use <code>key=int</code>. The same bug hits file names like <code>img10.png</code> vs <code>img9.png</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sorting when you don't need to</span>
    <p>Max or min: <code>max()</code>, O(n). kth item: quickselect or a heap. Membership: a set. Sorting a list just to read one item turns O(n) into O(n log n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: merge with &lt; instead of &lt;=</span>
    <p>Still sorted, but no longer stable, and in Count Inversions it wrongly counts equal pairs as inversions.</p>
  </div>

  <h2 id="dsa-so-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Merge sort vs quick sort: give time, space and stability for each.</summary><div class="qa-body">Merge sort: O(n log n) in every case, O(n) extra space, stable. Quick sort: O(n log n) average, O(n²) worst, O(log n) stack space, in place, not stable. Quick sort is usually faster on arrays in memory; merge sort wins when you need stability, guaranteed time, linked lists, or data bigger than RAM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does quick sort hit O(n²), and how do you prevent it?</summary><div class="qa-body">When every pivot is the smallest or largest item: e.g. first/last-item pivot on sorted or reversed input, or Lomuto partition on many equal items. Each partition then removes one item, giving n²/2 work. Prevent it with a random (or median-of-three) pivot and a 3-way partition for duplicates. Introsort (C++ std::sort) also switches to heap sort if recursion gets too deep.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is quickselect O(n) on average while quick sort is O(n log n)?</summary><div class="qa-body">After partitioning, quickselect recurses into only one side. The work is n + n/2 + n/4 + … ≤ 2n. Quick sort recurses into both sides, so each of the log n levels costs n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the Ω(n log n) lower bound for comparison sorting.</summary><div class="qa-body">A comparison sort is a binary decision tree: each "a &lt; b?" splits into yes/no. It must be able to output any of the n! orderings, so it needs ≥ n! leaves, so its height is ≥ log₂(n!) ≈ n log₂ n. The height is the worst-case number of comparisons.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Counting sort is O(n + k). Doesn't that break the lower bound?</summary><div class="qa-body">No. The bound only covers sorts that learn by comparing. Counting sort uses the value itself as a list index, which is extra information. It only works for integer keys in a small range k; if k is huge (like 10⁹), O(n + k) is worse than n log n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "stable" mean and when does it matter?</summary><div class="qa-body">Items with equal keys keep their original relative order. It matters when sorting records by one field, and for multi-key sorting in passes (minor key first, then major key). Radix sort depends on it. Python's sort is stable; quick sort and heap sort usually are not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>a = [3, 1, 2]; b = a.sort(); print(a, b, sorted(a, reverse=True))</code></summary><div class="qa-body"><code>[1, 2, 3] None [3, 2, 1]</code>. <code>a.sort()</code> sorts a in place and returns None. <code>sorted</code> makes a new list and leaves a unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you sort a list of dicts by "dept" ascending and "salary" descending in one call?</summary><div class="qa-body"><code>sorted(rows, key=lambda r: (r["dept"], -r["salary"]))</code>. If the descending field is not numeric (e.g. a string), use two stable sorts: first <code>key=salary-field, reverse=True</code>, then <code>key=dept</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name a sort you'd use for each: 10 items; 10⁸ ages; a linked list; 1 TB of logs on disk.</summary><div class="qa-body">10 items: insertion sort (or just sorted()). Ages 0–120: counting sort, O(n). Linked list: merge sort (no random access needed, O(1) extra space with pointer merging). 1 TB: external merge sort — sort chunks that fit in RAM, write them out, then k-way merge the chunks with a heap.</div></details>
</main>
`
});
