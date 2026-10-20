// notes/dsa/dsa_sorting.js — Sorting
Object.assign(TOPIC_CONTENT, {
  "dsa_sorting": `<main>
<h1>Sorting</h1>
  <div class="where"><span>DSA</span><span>Foundations</span><span>Sorting</span></div>
  <p class="lead">Two pointers and binary search only work on <em>sorted</em> data, and so do half the tricks in the later notes. This note answers the question those notes skip: <strong>how does a list actually get sorted, and how fast can it be done?</strong> We sort Biteful's same 8 charges by hand again and again: first the slow O(n²) way (insertion sort), then merge sort (split and merge), quick sort (partition, and the input that ruins it), quickselect (when you only need one item), stability (the two ₹80 orders), the n log n speed limit, counting and radix sort (how to dodge that limit when keys are small), and finally Python's own Timsort with <code>sorted()</code>, <code>key=</code> and <code>cmp_to_key</code>. The note ends where interviews begin: sorting as the first step of a bigger answer. Every pattern has trigger words, a template, a traced table on the charges, tested code, its cost and practice problems from the tracker. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-so-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-so-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Arrays (two pointers) · Hashing · Complexity (recursion)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-so-ga)"/>
<rect x="170" y="62" width="300" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Sorting</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · 8 charges, in order</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-so-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Binary Search (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">needs the sorted list</text>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-so-ga)"/>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Intervals &amp; Greedy</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">sort by start / end, then sweep</text>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-so-ga)"/>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Heaps</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">top-k without a full sort</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-so-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Sorting: ~35 problems, Height Checker → Reverse Pairs</text>
</svg><figcaption>Reading order for the Foundations block: Complexity → Arrays → Hashing → <b>Sorting</b> → Binary Search. Sorting sits here because the next note (and Intervals &amp; Greedy later) starts with "first, sort it".</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_arrays">Arrays &amp; Two Pointers</a> and <a class="xref" data-note="dsa_hashing">Hashing</a></b><span>Arrays found the ₹280 combo in 5 steps with two pointers, but only after a line that said <code>s = sorted(charges)</code> and a promise that it costs O(n log n). Hashing avoided sorting with a dict. <a class="xref" data-note="dsa_complexity">Complexity</a> gave you Big-O and recursion (the call stack), which merge sort and quick sort use. Python syntax for lists is in <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>.</span></li>
    <li><b>This note adds: what is inside <code>sorted()</code></b><span>The sorting algorithms themselves, why O(n log n) is the best a comparison sort can do, how to beat it when keys are small integers, what "stable" means, and how to sort by any rule in Python.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_binsearch">Binary Search</a></b><span>Once the charges are sorted, "is ₹250 there?" takes 3 looks instead of 8. Later, <a class="xref" data-note="dsa_greedy">Intervals &amp; Greedy</a> sorts delivery windows by start or end before sweeping, and <a class="xref" data-note="dsa_heaps">Heaps</a> answers "top k" without sorting everything. Practise in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-so-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers are on Biteful's 8 charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b> (orders A to H, in time order).</p>
  <ol class="story">
    <li><b>Why sorted data</b><span>Q: two pointers and binary search both say "the list must be sorted". What goes wrong if it isn't? → On the raw charges, <code>bisect</code> looks for 250 in the wrong place. Sorted, the charges become [40, 60, 80, 80, 120, 200, 250, 310] and min, max, median, duplicates and closest pair are each one look or one pass. But how does a computer produce that order?</span></li>
    <li><b>Insertion sort (O(n²) sorts)</b><span>Q: what is the simplest way to sort? → Take the next charge and slide it left into place, like cards in your hand: 14 shifts, 19 comparisons on our 8. Fine for 8, hopeless for 10 lakh: n²/2 comparisons. Can we avoid comparing everything with everything?</span></li>
    <li><b>Merge sort</b><span>Q: can we sort faster by splitting the work? → Halve, sort each half, merge two sorted halves in one pass: 3 levels × 8 items. Always O(n log n). But it needs a second list of size n for merging. Can we sort in place?</span></li>
    <li><b>Quick sort</b><span>Q: can we split so that no merge is needed? → Partition around a pivot (200): smaller left, bigger right, pivot in its final slot. In place and fast. But on already-sorted input with the last item as pivot it degrades to n²/2. And if we only need one item, why sort both sides?</span></li>
    <li><b>Quickselect</b><span>Q: what is the median order without sorting all 8? → Partition, then follow only the side that holds index k: 80 after 5 partitions that shrink the range. O(n) average. Partition has another side effect though: it swaps over long distances, so the two ₹80 orders can swap places. Does that matter?</span></li>
    <li><b>Stability</b><span>Q: orders B and F both cost ₹80; does B stay before F? → A stable sort keeps ties in their old order (merge, insertion, Timsort); quick and selection sort may not (selection put F first). Stability is what lets you sort by several keys in passes. But all these sorts compare items. Is there a speed limit?</span></li>
    <li><b>The n log n wall</b><span>Q: can any comparison sort beat n log n? → No: 8 charges have 8! = 40,320 possible orders, each yes/no comparison can at best halve them, so the worst case needs at least log₂(40,320) ≈ 15.3, i.e. 16 comparisons. The only escape is to stop comparing…</span></li>
    <li><b>Counting &amp; radix sort</b><span>Q: when keys are small integers, can the value itself say where an item goes? → Counting sort: charges ÷ 10 are keys 4..31, one pile per key, O(n + k). Radix sort repeats a <em>stable</em> counting sort digit by digit. But real code rarely hand-writes any of these…</span></li>
    <li><b>Timsort, sorted(), key=, cmp_to_key</b><span>Q: what does Python actually do, and how do we sort by our own rule? → Timsort finds already-sorted runs, uses insertion sort on short pieces and merges runs: stable, O(n) on sorted input, O(n log n) worst. <code>key=</code> sorts orders by amount, by restaurant then amount, and so on. So in an interview, what is sorting <em>for</em>?</span></li>
    <li><b>Sort first, then…</b><span>Q: how do we spot that sorting is the first step of an answer? → After one O(n log n) sort, closest pair, distinct values, "how many under ₹100", the ₹280 combo, median and top-3 are each one pass. That is the bridge to Binary Search and Intervals &amp; Greedy.</span></li>
  </ol>

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
      <div class="rm-item rm-done" data-target="dsa-so-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Sorted Data</span><span class="rm-sub">What order buys you</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-simple"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Simple O(n²) Sorts</span><span class="rm-sub">Insertion traced; bubble, selection</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-merge"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Merge Sort</span><span class="rm-sub">Split, sort halves, merge</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-quick"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Quick Sort</span><span class="rm-sub">Partition traced, worst case shown</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-select"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Quickselect</span><span class="rm-sub">kth smallest in O(n) average</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-stable"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Stability</span><span class="rm-sub">The two ₹80 orders</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-bound"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The n log n Wall</span><span class="rm-sub">Why comparison sorts can't do better</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-counting"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Counting &amp; Radix Sort</span><span class="rm-sub">Sorting without comparing</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-python"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Sorting in Python</span><span class="rm-sub">Timsort, sorted vs sort, key, cmp_to_key</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Sort First, Then…</span><span class="rm-sub">Sorting as a preprocessing step</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">7 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">None returns, bad pivots, unstable keys</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-so-why"><span class="num">01</span>Why Sorted Data</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Arrays note found the ₹280 combo with two pointers, and the Binary Search note will find any charge in log n looks. Both start with "the list is sorted". We have been calling <code>sorted()</code> as if it were free. What do we gain from order, what goes wrong without it, and what does it cost?</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful's 8 orders for one day, in the order they happened (the same charges as the Complexity, Arrays and Hashing notes). We give each order a letter so we can follow it around:</p>
  <table class="tbl"><caption>charges</caption>
    <tr><th>order</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th></tr>
    <tr><th>index</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
    <tr><th>₹</th><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
  </table>
  <p>Think of the voter list pasted outside a polling booth. It is sorted by name. You find your row in seconds, because you can jump to "R" and stop as soon as you pass your name. If the list were in random order, you would read every line.</p>
  <p>That is what sorting buys: you pay once to put things in order, and then many questions become cheap. Here is what goes wrong when a sorted-only tool meets unsorted data, and what one <code>sorted()</code> call gives us:</p>
<div class="fx" data-lang="py">import bisect
charges = [120, 80, 250, 40, 310, 80, 60, 200]     # Biteful's 8 orders, in time order

def found(a, x):                                    # binary search: is x in a?
    i = bisect.bisect_left(a, x)
    return i &lt; len(a) and a[i] == x, i

# binary search assumes sorted data: on the raw list it gives a wrong answer
print("raw list:    is 60 there?", found(charges, 60))

s = sorted(charges)
print("sorted list:", s)
print("sorted list: is 60 there?", found(s, 60))

# what one sort buys: each answer below is one cheap look or one pass
print("cheapest, dearest, median:", s[0], s[-1], (s[3] + s[4]) / 2)
print("any repeated amount?", any(s[k] == s[k + 1] for k in range(len(s) - 1)))
print("closest two amounts differ by", min(s[k + 1] - s[k] for k in range(len(s) - 1)))</div>
  <div class="fx" data-lang="text">raw list:    is 60 there? (False, 0)
sorted list: [40, 60, 80, 80, 120, 200, 250, 310]
sorted list: is 60 there? (True, 1)
cheapest, dearest, median: 40 310 100.0
any repeated amount? True
closest two amounts differ by 0</div>
  <p>On the raw list, binary search says ₹60 is <em>not there</em>, although order G is ₹60. It looked at the middle (310), decided "60 is smaller, so it must be on the left", and kept throwing away halves on the assumption that the left is always smaller. That assumption is only true for sorted data. On the sorted list it finds 60 at index 1. And after sorting, the cheapest and dearest are the two ends, the median is the middle pair ((80 + 120)/2 = 100), equal amounts sit next to each other (80, 80) and the closest pair must be neighbours.</p>
  <table class="tbl">
    <tr><th>Task</th><th>Unsorted</th><th>After sorting (O(n log n) once)</th><th>On the charges</th></tr>
    <tr><td>Find x</td><td>O(n) scan</td><td>O(log n) binary search</td><td>60 at sorted index 1</td></tr>
    <tr><td>Any duplicates?</td><td>O(n²) pairs, or a set</td><td>O(n): duplicates are neighbours</td><td>80, 80</td></tr>
    <tr><td>Closest two numbers</td><td>O(n²) pairs</td><td>O(n): only neighbours can be closest</td><td>gap 0</td></tr>
    <tr><td>Two numbers summing to T</td><td>O(n²) pairs, or a dict</td><td>O(n) two pointers</td><td>80 + 200 = 280</td></tr>
    <tr><td>kth smallest, median</td><td>O(n) quickselect</td><td>O(1): just index it</td><td>median 100</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sorting</strong>: rearranging items so that each one is ≤ the next, by some rule (number, name, length, a key you choose). A <strong>comparison sort</strong> only learns about the items by asking "is a &lt; b?". Most sorts are comparison sorts.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Binary search and two pointers on unsorted data do not crash. They return a confident wrong answer. If a solution uses either, the first line must sort (or the problem must promise sorted input).</p>
  </div>
  <p>Where you meet it: "sort by price" on shopping sites, database <code>ORDER BY</code>, leaderboards, and the "sort first, then…" step of many interview answers.</p>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Sorting: <b>1051 Height Checker</b> (compare with a sorted copy), <b>1502 Can Make Arithmetic Progression From Sequence</b> (after sorting, only neighbours matter), <b>1200 Minimum Absolute Difference</b> (closest pairs are neighbours).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Simple Sorts.</b> We know <em>why</em> we want [40, 60, 80, 80, 120, 200, 250, 310]. We still have no idea how a program turns the day's charges into it.</div>

  <h2 id="dsa-so-simple"><span class="num">02</span>Simple O(n²) Sorts</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sorting is worth paying for. What is the most obvious way to do it, the way a person would sort 8 cards by hand, and how much does that cost?</p>
  </div>
  <p>These three are slow (O(n²)). Nobody uses them on big data. We learn them because they are how a person sorts by hand, and they make the fast sorts easier to understand.</p>
  <div class="cards">
    <div><b>Bubble sort</b><p>Walk the list, swap any two neighbours that are in the wrong order. After one pass, the biggest item has "bubbled" to the end. Repeat.</p><small>Stop early if a pass makes no swap</small></div>
    <div><b>Selection sort</b><p>Find the smallest item, swap it to the front. Find the smallest of the rest, swap it to position 1. Repeat.</p><small>Always n(n−1)/2 comparisons, few swaps</small></div>
    <div><b>Insertion sort</b><p>Like sorting playing cards in your hand: pick the next card and slide it left until it fits.</p><small>Fast on nearly sorted data</small></div>
  </div>
  <p>Insertion sort is the most useful of the three, so let us watch it on the charges. The left part (before the <code>|</code>) is always sorted; each step takes one new charge from the right and slides it in.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Playing teen patti or rummy: you pick up cards one at a time. Each new card goes into the right place among the cards already in your hand. You never re-sort the whole hand.</p>
  </div>
<div class="fx" data-lang="py">def insertion_sort(a, trace=False):
    a = a[:]                           # work on a copy
    shifts = 0
    for i in range(1, len(a)):
        x = a[i]                       # the card we picked up
        j = i - 1
        while j &gt;= 0 and a[j] &gt; x:
            a[j + 1] = a[j]            # shift a bigger card one step right
            j -= 1
            shifts += 1
        a[j + 1] = x                   # drop the card into the gap
        if trace:
            print(f"i={i} pick {x:&gt;3}: {a[:i + 1]} | {a[i + 1:]}")
    return a, shifts

charges = [120, 80, 250, 40, 310, 80, 60, 200]
out, shifts = insertion_sort(charges, trace=True)
print("shifts:", shifts)</div>
  <div class="fx" data-lang="text">i=1 pick  80: [80, 120] | [250, 40, 310, 80, 60, 200]
i=2 pick 250: [80, 120, 250] | [40, 310, 80, 60, 200]
i=3 pick  40: [40, 80, 120, 250] | [310, 80, 60, 200]
i=4 pick 310: [40, 80, 120, 250, 310] | [80, 60, 200]
i=5 pick  80: [40, 80, 80, 120, 250, 310] | [60, 200]
i=6 pick  60: [40, 60, 80, 80, 120, 250, 310] | [200]
i=7 pick 200: [40, 60, 80, 80, 120, 200, 250, 310] | []
shifts: 14</div>
  <table class="tbl out"><caption>Trace: insertion sort on the charges</caption>
    <tr><th>i</th><th>picked</th><th>slides past</th><th>shifts</th><th>sorted part after</th></tr>
    <tr><td>1</td><td>80</td><td>120</td><td>1</td><td>[80, 120]</td></tr>
    <tr><td>2</td><td>250</td><td>nothing</td><td>0</td><td>[80, 120, 250]</td></tr>
    <tr><td>3</td><td>40</td><td>250, 120, 80</td><td>3</td><td>[40, 80, 120, 250]</td></tr>
    <tr><td>4</td><td>310</td><td>nothing</td><td>0</td><td>[40, 80, 120, 250, 310]</td></tr>
    <tr><td>5</td><td>80</td><td>310, 250, 120 (stops at the other 80)</td><td>3</td><td>[40, 80, 80, 120, 250, 310]</td></tr>
    <tr><td>6</td><td>60</td><td>310, 250, 120, 80, 80</td><td>5</td><td>[40, 60, 80, 80, 120, 250, 310]</td></tr>
    <tr><td>7</td><td>200</td><td>310, 250</td><td>2</td><td>[40, 60, 80, 80, 120, 200, 250, 310]</td></tr>
  </table>
  <p>14 shifts in total. Each shift fixes exactly one pair that was in the wrong order (an <strong>inversion</strong>), so insertion sort's work = the number of inversions. The charges have 14; Count Inversions in section 11 confirms it with merge sort. How do the three simple sorts compare on the same 8 numbers?</p>
<div class="fx" data-lang="py">def bubble(a):
    a, comps = a[:], 0
    for end in range(len(a) - 1, 0, -1):
        swapped = False
        for j in range(end):
            comps += 1
            if a[j] &gt; a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]; swapped = True
        if not swapped:                # a pass with no swap: already sorted
            break
    return comps

def selection(a):
    a, comps = a[:], 0
    for i in range(len(a)):
        m = i
        for j in range(i + 1, len(a)):
            comps += 1
            if a[j] &lt; a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
    return comps

def insertion(a):
    a, comps = a[:], 0
    for i in range(1, len(a)):
        x, j = a[i], i - 1
        while j &gt;= 0:
            comps += 1
            if a[j] &lt;= x:
                break
            a[j + 1] = a[j]; j -= 1
        a[j + 1] = x
    return comps

charges = [120, 80, 250, 40, 310, 80, 60, 200]
for name, data in [("day's charges", charges), ("already sorted", sorted(charges)),
                   ("reversed", sorted(charges, reverse=True))]:
    print(f"{name:15} bubble {bubble(data):&gt;2}  selection {selection(data):&gt;2}  insertion {insertion(data):&gt;2}")</div>
  <div class="fx" data-lang="text">day's charges   bubble 27  selection 28  insertion 19
already sorted  bubble  7  selection 28  insertion  7
reversed        bubble 28  selection 28  insertion 28</div>
  <p>On the day's charges, 27, 28 and 19 comparisons. On already-sorted charges, bubble (with its early stop) and insertion need only 7 = n − 1, while selection still does all 28 = 8·7/2. Reversed input is the worst case for all three: 28.</p>
  <table class="tbl">
    <tr><th>Sort</th><th>Best</th><th>Average / worst</th><th>Extra space</th><th>Stable?</th></tr>
    <tr><td>Bubble (with early stop)</td><td>O(n) already sorted</td><td>O(n²)</td><td>O(1)</td><td>Yes</td></tr>
    <tr><td>Selection</td><td>O(n²) always</td><td>O(n²)</td><td>O(1)</td><td>No (long swaps jump over equals)</td></tr>
    <tr><td>Insertion</td><td>O(n) already sorted</td><td>O(n²)</td><td>O(1)</td><td>Yes</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Inversion</strong>: a pair of positions i &lt; j with <code>a[i] &gt; a[j]</code>. A sorted list has 0; a reversed list of n has the maximum n(n−1)/2. <strong>Insertion sort</strong> runs in O(n + inversions).</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Insertion sort's work equals the number of out-of-order pairs. On nearly sorted data that number is tiny, so it runs almost in O(n). That is why real libraries (Timsort included) use insertion sort for short pieces of around 32–64 items.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>8 items took 19 comparisons; 10 lakh random items would take about n²/4 = 2.5 × 10¹¹. "It works on the example" is not "it passes n ≤ 10⁵". Writing your own O(n²) sort in an interview instead of calling <code>sorted()</code> is a red flag unless they asked for it.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>1365 How Many Numbers Are Smaller Than the Current Number</b> (the O(n²) answer is fine for n ≤ 500, then do it with sorting or counting), <b>1051 Height Checker</b>. Try <b>912 Sort an Array</b> with insertion sort to <em>see</em> it time out.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Merge Sort.</b> Every simple sort compares each item with many others: n²/2 in the worst case. Can we split the list, sort small pieces, and combine them more cheaply?</div>

  <h2 id="dsa-so-merge"><span class="num">03</span>Merge Sort</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Insertion sort needed 19 comparisons on 8 charges and grows like n². Is there a way to sort where every item takes part in only a few comparisons?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"sort in O(n log n) <b>guaranteed</b>", "sort a <b>linked list</b>", "<b>stable</b>", "count pairs i &lt; j with a[i] &gt; a[j]" (inversions), "two sorted halves", "data bigger than memory".</p>
  </div>
  <p>Start with an easier job. Two class sections have each lined up by roll number. The teacher wants one combined line. She does not re-sort everyone. She looks at the front student of each line, sends the smaller roll number forward, and repeats. One pass, done. That is a <strong>merge</strong>.</p>
  <p>Suppose the first 4 charges (A to D) and the last 4 (E to H) have each been sorted already: [40, 80, 120, 250] and [60, 80, 200, 310]. Merging them compares only the two front items each time:</p>
<div class="fx" data-lang="py">def merge(left, right, trace=False):
    out, i, j = [], 0, 0
    while i &lt; len(left) and j &lt; len(right):
        if left[i] &lt;= right[j]:        # &lt;= keeps equal items in old order (stable)
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
        if trace:
            print(f"took {out[-1]:&gt;3}  out={out}")
    out.extend(left[i:])               # one side is used up;
    out.extend(right[j:])              # copy what is left of the other
    return out

# the two halves of the charges, each already sorted
print(merge([40, 80, 120, 250], [60, 80, 200, 310], trace=True))</div>
  <div class="fx" data-lang="text">took  40  out=[40]
took  60  out=[40, 60]
took  80  out=[40, 60, 80]
took  80  out=[40, 60, 80, 80]
took 120  out=[40, 60, 80, 80, 120]
took 200  out=[40, 60, 80, 80, 120, 200]
took 250  out=[40, 60, 80, 80, 120, 200, 250]
[40, 60, 80, 80, 120, 200, 250, 310]</div>
  <table class="tbl out"><caption>Trace: merging the two sorted halves of the charges</caption>
    <tr><th>step</th><th>left front</th><th>right front</th><th>take</th><th>why</th></tr>
    <tr><td>1</td><td>40</td><td>60</td><td>40</td><td>40 ≤ 60</td></tr>
    <tr><td>2</td><td>80</td><td>60</td><td>60</td><td>60 &lt; 80</td></tr>
    <tr><td>3</td><td>80 (B)</td><td>80 (F)</td><td>80 (B)</td><td>tie: <code>&lt;=</code> takes the left one first</td></tr>
    <tr><td>4</td><td>120</td><td>80 (F)</td><td>80 (F)</td><td>80 &lt; 120</td></tr>
    <tr><td>5</td><td>120</td><td>200</td><td>120</td><td>120 ≤ 200</td></tr>
    <tr><td>6</td><td>250</td><td>200</td><td>200</td><td>200 &lt; 250</td></tr>
    <tr><td>7</td><td>250</td><td>310</td><td>250</td><td>left is now empty</td></tr>
    <tr><td>—</td><td>—</td><td>310</td><td>310</td><td>copy the rest of the right side</td></tr>
  </table>
  <p>7 comparisons for 8 items: a merge costs at most n − 1 comparisons. Merging is easy only if both halves are already sorted. How do we get sorted halves? Sort them the same way: split again, and again, until each piece has one item. One item is always sorted. Then merge back up.</p>
<figure class="viz"><svg viewBox="0 0 600 315" width="600" font-size="11"><line x1="300" y1="44" x2="168" y2="70" stroke="currentColor" stroke-opacity="0.5"/><line x1="300" y1="44" x2="432" y2="70" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="94" x2="118" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="94" x2="218" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="94" x2="382" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="94" x2="482" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="118" y1="204" x2="168" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="218" y1="204" x2="168" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="382" y1="204" x2="432" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="482" y1="204" x2="432" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="254" x2="300" y2="280" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="254" x2="300" y2="280" stroke="currentColor" stroke-opacity="0.5"/><g class="fb sb"><rect x="164" y="20" width="34" height="24"/><rect x="198" y="20" width="34" height="24"/><rect x="232" y="20" width="34" height="24"/><rect x="266" y="20" width="34" height="24"/><rect x="300" y="20" width="34" height="24"/><rect x="334" y="20" width="34" height="24"/><rect x="368" y="20" width="34" height="24"/><rect x="402" y="20" width="34" height="24"/></g><g text-anchor="middle"><text x="181" y="36">120</text><text x="215" y="36">80</text><text x="249" y="36">250</text><text x="283" y="36">40</text><text x="317" y="36">310</text><text x="351" y="36">80</text><text x="385" y="36">60</text><text x="419" y="36">200</text></g><g class="fb sb"><rect x="100" y="70" width="34" height="24"/><rect x="134" y="70" width="34" height="24"/><rect x="168" y="70" width="34" height="24"/><rect x="202" y="70" width="34" height="24"/></g><g text-anchor="middle"><text x="117" y="86">120</text><text x="151" y="86">80</text><text x="185" y="86">250</text><text x="219" y="86">40</text></g><g class="fb sb"><rect x="364" y="70" width="34" height="24"/><rect x="398" y="70" width="34" height="24"/><rect x="432" y="70" width="34" height="24"/><rect x="466" y="70" width="34" height="24"/></g><g text-anchor="middle"><text x="381" y="86">310</text><text x="415" y="86">80</text><text x="449" y="86">60</text><text x="483" y="86">200</text></g><g class="fb sb"><rect x="84" y="120" width="34" height="24"/><rect x="118" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="101" y="136">120</text><text x="135" y="136">80</text></g><g class="fb sb"><rect x="184" y="120" width="34" height="24"/><rect x="218" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="201" y="136">250</text><text x="235" y="136">40</text></g><g class="fb sb"><rect x="348" y="120" width="34" height="24"/><rect x="382" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="365" y="136">310</text><text x="399" y="136">80</text></g><g class="fb sb"><rect x="448" y="120" width="34" height="24"/><rect x="482" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="465" y="136">60</text><text x="499" y="136">200</text></g><g class="fg sg"><rect x="84" y="180" width="34" height="24"/><rect x="118" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="101" y="196">80</text><text x="135" y="196">120</text></g><g class="fg sg"><rect x="184" y="180" width="34" height="24"/><rect x="218" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="201" y="196">40</text><text x="235" y="196">250</text></g><g class="fg sg"><rect x="348" y="180" width="34" height="24"/><rect x="382" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="365" y="196">80</text><text x="399" y="196">310</text></g><g class="fg sg"><rect x="448" y="180" width="34" height="24"/><rect x="482" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="465" y="196">60</text><text x="499" y="196">200</text></g><g class="fg sg"><rect x="100" y="230" width="34" height="24"/><rect x="134" y="230" width="34" height="24"/><rect x="168" y="230" width="34" height="24"/><rect x="202" y="230" width="34" height="24"/></g><g text-anchor="middle"><text x="117" y="246">40</text><text x="151" y="246">80</text><text x="185" y="246">120</text><text x="219" y="246">250</text></g><g class="fg sg"><rect x="364" y="230" width="34" height="24"/><rect x="398" y="230" width="34" height="24"/><rect x="432" y="230" width="34" height="24"/><rect x="466" y="230" width="34" height="24"/></g><g text-anchor="middle"><text x="381" y="246">60</text><text x="415" y="246">80</text><text x="449" y="246">200</text><text x="483" y="246">310</text></g><g class="fg sg"><rect x="164" y="280" width="34" height="24"/><rect x="198" y="280" width="34" height="24"/><rect x="232" y="280" width="34" height="24"/><rect x="266" y="280" width="34" height="24"/><rect x="300" y="280" width="34" height="24"/><rect x="334" y="280" width="34" height="24"/><rect x="368" y="280" width="34" height="24"/><rect x="402" y="280" width="34" height="24"/></g><g text-anchor="middle"><text x="181" y="296">40</text><text x="215" y="296">60</text><text x="249" y="296">80</text><text x="283" y="296">80</text><text x="317" y="296">120</text><text x="351" y="296">200</text><text x="385" y="296">250</text><text x="419" y="296">310</text></g><text x="10" y="36" class="tb">split</text><text x="10" y="86" class="tb">split</text><text x="10" y="136" class="tb">split</text><line x1="20" y1="164" x2="580" y2="164" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.4"/><text x="300" y="159" class="tm" text-anchor="middle">split pairs into single items (always sorted), then merge upward</text><text x="10" y="196" class="tg">merge</text><text x="10" y="246" class="tg">merge</text><text x="10" y="296" class="tg">merge</text></svg><figcaption>Merge sort on the 8 charges. Blue: keep cutting in half (log₂ 8 = 3 levels). Green: merge sorted halves back together. Each level touches all 8 charges once, so the total work is n × log n.</figcaption></figure>
<div class="fx" data-lang="py">def merge_sort(a, depth=0):
    pad = "    " * depth
    if len(a) &lt;= 1:                    # 0 or 1 item: already sorted
        return a
    mid = len(a) // 2
    print(f"{pad}split {a}")
    left = merge_sort(a[:mid], depth + 1)
    right = merge_sort(a[mid:], depth + 1)
    out = merge(left, right)
    print(f"{pad}merge {left} + {right} -&gt; {out}")
    return out

charges = [120, 80, 250, 40, 310, 80, 60, 200]
print(merge_sort(charges))</div>
  <div class="fx" data-lang="text">split [120, 80, 250, 40, 310, 80, 60, 200]
    split [120, 80, 250, 40]
        split [120, 80]
        merge [120] + [80] -&gt; [80, 120]
        split [250, 40]
        merge [250] + [40] -&gt; [40, 250]
    merge [80, 120] + [40, 250] -&gt; [40, 80, 120, 250]
    split [310, 80, 60, 200]
        split [310, 80]
        merge [310] + [80] -&gt; [80, 310]
        split [60, 200]
        merge [60] + [200] -&gt; [60, 200]
    merge [80, 310] + [60, 200] -&gt; [60, 80, 200, 310]
merge [40, 80, 120, 250] + [60, 80, 200, 310] -&gt; [40, 60, 80, 80, 120, 200, 250, 310]
[40, 60, 80, 80, 120, 200, 250, 310]</div>
  <p>The printout is the recursion tree read top to bottom: each <code>split</code> goes one level deeper (more indent), and each <code>merge</code> line happens on the way back up, when both halves have returned.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">def merge_sort(a):
    if len(a) &lt;= 1: return a                 # base case: already sorted
    mid = len(a) // 2
    return merge(merge_sort(a[:mid]),         # sort each half the same way
                 merge_sort(a[mid:]))         # then combine in one pass (&lt;= for stability)</div>
  <h3>Why O(n log n)</h3>
  <p>Count levels in the picture. 8 → 4 → 2 → 1 is 3 halvings, which is log₂ 8. On every level, the merges together touch all n items once. So the total is n per level × log n levels = <strong>O(n log n)</strong>. That holds for every input. For n = 1,000,000 that is about 20 million steps, against 10¹² for an O(n²) sort.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Divide and conquer</strong>: split the problem into smaller copies of itself, solve them (usually by recursion), and combine the answers. Merge sort does the real work in the <em>combine</em> step (merge). Quick sort, next, does it in the <em>divide</em> step (partition).</p>
  </div>
  <div class="callout def"><span class="label">Complexity</span>
    <p>Time <strong>O(n log n)</strong> best, average and worst. Extra space <strong>O(n)</strong> for the merged lists (plus O(log n) recursion depth). Stable.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Merge sort needs O(n) extra memory for the merged lists. Writing <code>left[i] &lt; right[j]</code> instead of <code>&lt;=</code> still sorts correctly, but at step 3 above it would take F's ₹80 before B's, so the sort is no longer stable.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>912 Sort an Array</b> (write merge sort yourself), <b>148 Sort List</b> (merge sort on a linked list), then the hard "count while merging" family: <b>493 Reverse Pairs</b>, <b>315 Count of Smaller Numbers After Self</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Quick Sort.</b> Merge sort is always O(n log n), but every merge writes into a new list: O(n) extra memory. Can we split the list so cleverly that no merge step is needed at all, and sort in place?</div>

  <h2 id="dsa-so-quick"><span class="num">04</span>Quick Sort</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Merge sort splits blindly down the middle and does all its work while merging, which needs a second list. What if we split by <em>value</em> instead, so that after the split every item on the left is already smaller than every item on the right?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>in place</b>", "<b>partition</b> around x", "move all smaller to the left", "0s, 1s and 2s", "one pass", "kth largest" (the next section).</p>
  </div>
  <p>A PT teacher wants students in height order. She picks one student, Ravi, as the <strong>pivot</strong>: "everyone shorter than Ravi, go left; taller, go right". Now Ravi is standing exactly where he belongs in the final line. Nobody on the left ever needs to swap with anyone on the right. She repeats the same trick inside each group.</p>
  <p>That step is called <strong>partition</strong>. Quick sort is: partition, then quick sort the left part and the right part.</p>
<figure class="viz"><svg viewBox="0 0 600 215" width="600">
<text x="10" y="42" class="tm">before</text>
<rect x="80" y="24" width="60" height="28" class="fs" stroke="currentColor"/><text x="110" y="43" text-anchor="middle">120</text>
<rect x="140" y="24" width="60" height="28" class="fs" stroke="currentColor"/><text x="170" y="43" text-anchor="middle">80</text>
<rect x="200" y="24" width="60" height="28" class="fs" stroke="currentColor"/><text x="230" y="43" text-anchor="middle">250</text>
<rect x="260" y="24" width="60" height="28" class="fs" stroke="currentColor"/><text x="290" y="43" text-anchor="middle">40</text>
<rect x="320" y="24" width="60" height="28" class="fs" stroke="currentColor"/><text x="350" y="43" text-anchor="middle">310</text>
<rect x="380" y="24" width="60" height="28" class="fs" stroke="currentColor"/><text x="410" y="43" text-anchor="middle">80</text>
<rect x="440" y="24" width="60" height="28" class="fs" stroke="currentColor"/><text x="470" y="43" text-anchor="middle">60</text>
<rect x="500" y="24" width="60" height="28" class="fg sg"/><text x="530" y="43" text-anchor="middle">200</text>
<text x="530" y="70" class="tg" text-anchor="middle">pivot</text><text x="10" y="132" class="tm">after</text>
<rect x="80" y="114" width="60" height="28" class="fb sb"/><text x="110" y="133" text-anchor="middle">120</text>
<rect x="140" y="114" width="60" height="28" class="fb sb"/><text x="170" y="133" text-anchor="middle">80</text>
<rect x="200" y="114" width="60" height="28" class="fb sb"/><text x="230" y="133" text-anchor="middle">40</text>
<rect x="260" y="114" width="60" height="28" class="fb sb"/><text x="290" y="133" text-anchor="middle">80</text>
<rect x="320" y="114" width="60" height="28" class="fb sb"/><text x="350" y="133" text-anchor="middle">60</text>
<rect x="380" y="114" width="60" height="28" class="fg sg"/><text x="410" y="133" text-anchor="middle">200</text>
<rect x="440" y="114" width="60" height="28" class="fr sr"/><text x="470" y="133" text-anchor="middle">310</text>
<rect x="500" y="114" width="60" height="28" class="fr sr"/><text x="530" y="133" text-anchor="middle">250</text>
<text x="300" y="94" class="tm" text-anchor="middle">↓ one pass, 7 comparisons with the pivot ↓</text>
<text x="230" y="164" class="tb" text-anchor="middle">all &lt; 200 (any order)</text><text x="410" y="164" class="tg" text-anchor="middle">final spot</text><text x="500" y="164" class="tr" text-anchor="middle">all &gt; 200</text>
<text x="230" y="192" class="tm" text-anchor="middle">quick sort this part</text><text x="500" y="192" class="tm" text-anchor="middle">quick sort this part</text></svg><figcaption>Partition the charges around the last one, ₹200. Afterwards 200 sits exactly where it will be in the final sorted list (index 5). Smaller charges are on its left (in any order), bigger ones on its right. Then each side is sorted the same way.</figcaption></figure>
  <h3>Lomuto partition (easiest to write)</h3>
  <p>Take the last item as pivot. Keep a pointer <code>i</code> = "next place for a small item". Walk <code>j</code> across the list; whenever <code>a[j] &lt; pivot</code>, swap it to position <code>i</code> and move <code>i</code> on. At the end, swap the pivot into position <code>i</code>.</p>
<div class="fx" data-lang="py">def lomuto_partition(a, lo, hi, trace=False):
    pivot = a[hi]
    i = lo                              # a[lo:i] holds items &lt; pivot
    for j in range(lo, hi):
        if a[j] &lt; pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
            if trace: print(f"j={j} {a[i-1]:&gt;3} &lt; {pivot}: swap into slot {i-1}  {a}")
        elif trace:
            print(f"j={j} {a[j]:&gt;3} &gt;= {pivot}: leave it        {a}")
    a[i], a[hi] = a[hi], a[i]           # pivot goes to its final spot
    if trace: print(f"pivot {pivot} -&gt; slot {i}            {a}")
    return i

charges = [120, 80, 250, 40, 310, 80, 60, 200]
a = charges[:]
p = lomuto_partition(a, 0, len(a) - 1, trace=True)
print("left:", a[:p], " pivot:", a[p], " right:", a[p + 1:])</div>
  <div class="fx" data-lang="text">j=0 120 &lt; 200: swap into slot 0  [120, 80, 250, 40, 310, 80, 60, 200]
j=1  80 &lt; 200: swap into slot 1  [120, 80, 250, 40, 310, 80, 60, 200]
j=2 250 &gt;= 200: leave it        [120, 80, 250, 40, 310, 80, 60, 200]
j=3  40 &lt; 200: swap into slot 2  [120, 80, 40, 250, 310, 80, 60, 200]
j=4 310 &gt;= 200: leave it        [120, 80, 40, 250, 310, 80, 60, 200]
j=5  80 &lt; 200: swap into slot 3  [120, 80, 40, 80, 310, 250, 60, 200]
j=6  60 &lt; 200: swap into slot 4  [120, 80, 40, 80, 60, 250, 310, 200]
pivot 200 -&gt; slot 5            [120, 80, 40, 80, 60, 200, 310, 250]
left: [120, 80, 40, 80, 60]  pivot: 200  right: [310, 250]</div>
  <table class="tbl out"><caption>Trace: Lomuto partition of the charges, pivot 200</caption>
    <tr><th>j</th><th>a[j]</th><th>&lt; 200?</th><th>action</th><th>i after</th></tr>
    <tr><td>0</td><td>120</td><td>yes</td><td>swap with slot 0 (itself)</td><td>1</td></tr>
    <tr><td>1</td><td>80</td><td>yes</td><td>swap with slot 1 (itself)</td><td>2</td></tr>
    <tr><td>2</td><td>250</td><td>no</td><td>leave</td><td>2</td></tr>
    <tr><td>3</td><td>40</td><td>yes</td><td>swap slots 2 ↔ 3 (40 ↔ 250)</td><td>3</td></tr>
    <tr><td>4</td><td>310</td><td>no</td><td>leave</td><td>3</td></tr>
    <tr><td>5</td><td>80</td><td>yes</td><td>swap slots 3 ↔ 5 (80 ↔ 250)</td><td>4</td></tr>
    <tr><td>6</td><td>60</td><td>yes</td><td>swap slots 4 ↔ 6 (60 ↔ 310)</td><td>5</td></tr>
    <tr><td>end</td><td colspan="3">swap pivot into slot i = 5 (200 ↔ 250)</td><td>pivot index 5</td></tr>
  </table>
  <p>7 comparisons (one per non-pivot item), and 200 is now in its final place. Now recurse on both sides:</p>
<div class="fx" data-lang="py">import random

def quick_sort(a, lo=0, hi=None, rand=True, depth=0, log=None):
    if hi is None:
        hi = len(a) - 1
    if lo &lt; hi:
        if rand:
            r = random.randint(lo, hi)  # random pivot: no input is reliably bad
            a[r], a[hi] = a[hi], a[r]
        p = lomuto_partition(a, lo, hi)
        if log is not None: log.append((depth, a[p], hi - lo + 1))
        quick_sort(a, lo, p - 1, rand, depth + 1, log)
        quick_sort(a, p + 1, hi, rand, depth + 1, log)

charges = [120, 80, 250, 40, 310, 80, 60, 200]
b = charges[:]
log = []
quick_sort(b, rand=False, log=log)      # last item as pivot, to match the trace
print("quick sorted:", b)
for depth, pivot, size in log:
    print("  " * depth + f"partition {size} items around {pivot}")

c = sorted(charges)                    # worst case: already sorted + last pivot
log = []
quick_sort(c, rand=False, log=log)
print("sorted input -&gt; partition sizes:", [size for _, _, size in log])</div>
  <div class="fx" data-lang="text">quick sorted: [40, 60, 80, 80, 120, 200, 250, 310]
partition 8 items around 200
  partition 5 items around 60
    partition 3 items around 80
      partition 2 items around 120
  partition 2 items around 250
sorted input -&gt; partition sizes: [8, 7, 6, 5, 4, 2]</div>
  <p>The first run shows the recursion: 8 items around 200, then the left 5 around 60, and so on. Each partition fixes one pivot for good. The second run is the bad news, explained next.</p>
  <h3>Hoare partition (fewer swaps)</h3>
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

c = [120, 80, 250, 40, 310, 80, 60, 200, 80, 80]   # the charges + two more ₹80 orders
quick_sort_hoare(c)
print(c)</div>
  <div class="fx" data-lang="text">[40, 60, 80, 80, 80, 80, 120, 200, 250, 310]</div>
  <h3>Pivot choice and the worst case</h3>
  <p>Quick sort is fast when the pivot splits the list roughly in half: log n levels, n work each, O(n log n). It is slow when the pivot is always the smallest or biggest item. Then each partition removes only one item: n + (n−1) + (n−2) + … ≈ n²/2. That is exactly what happened above when we fed it the <em>already sorted</em> charges with the last item as pivot: partition sizes 8, 7, 6, 5, 4, 2, each pivot (310, 250, 200, 120, 80, …) the biggest of its range, so nothing ever lands on the right. On 2,000 items the effect is dramatic:</p>
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
n*n/2 = 2000000    n*log2(n) = 21932</div>
  <p>Two lessons. A <strong>random pivot</strong> turns sorted input from 2 million comparisons into about 24 thousand. But <strong>all-equal input</strong> still hits n²/2 with Lomuto: every item is "not smaller" than the pivot, so the pivot lands at one end every time. The fix is a <strong>3-way partition</strong> (less | equal | greater) — the Dutch flag idea in Sort Colors below — or Hoare's scheme.</p>
  <div class="callout def"><span class="label">Complexity</span>
    <p>Time <strong>O(n log n) average</strong>, <strong>O(n²) worst</strong> (bad pivots). Extra space O(log n) average for the recursion, O(n) worst. In place. Not stable.</p>
  </div>
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
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>75 Sort Colors</b> (3-way partition, solved in section 11), <b>922 Sort Array By Parity II</b>, <b>2161 Partition Array According to Given Pivot</b> (a stable partition).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Quickselect.</b> Quick sort sorts both sides of every pivot. Often we only want <em>one</em> item, like the median order or the 3rd most expensive. Do we really need to sort the side that cannot contain it?</div>

  <h2 id="dsa-so-select"><span class="num">05</span>Quickselect</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Finance asks for the median charge of the day and the 3rd most expensive order. Sorting all 8 costs O(n log n). The partition step already put 200 in its final slot with one pass. Can we use that to find one item more cheaply?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>kth largest / smallest</b>", "<b>median</b>", "top k" (when the order among the top k does not matter), "closest k points", "without sorting".</p>
  </div>
  <p>Look at partition again. After one partition, the pivot is at its final index <code>p</code>. If we want index <code>k</code> and <code>k &lt; p</code>, the answer is somewhere on the left. We can forget the right side completely. That is <strong>quickselect</strong>: quick sort that only goes into one side.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Looking for the 10th tallest student. The teacher splits the class around Ravi, and 25 students are taller than him. The 10th tallest must be in that taller group, so the shorter group can go back to class.</p>
  </div>
<div class="fx" data-lang="py">def quickselect(nums, k, trace=False):
    """k-th smallest item, k counted from 0."""
    a = nums[:]
    lo, hi = 0, len(a) - 1
    while True:
        p = lomuto_partition(a, lo, hi)  # last item as pivot (random in real code)
        if trace: print(f"range [{lo}..{hi}] pivot {a[p]} lands at {p}: ", end="")
        if p == k:
            if trace: print("that's k, done")
            return a[p]
        if k &lt; p:
            if trace: print("k is left, drop the right side")
            hi = p - 1                   # answer is on the left
        else:
            if trace: print("k is right, drop the left side")
            lo = p + 1                   # answer is on the right

charges = [120, 80, 250, 40, 310, 80, 60, 200]
n = len(charges)
print("lower median = index 3 of the sorted list")
print("answer:", quickselect(charges, 3, trace=True))
print("3rd most expensive (index n - 3 = 5):", quickselect(charges, n - 3))
print("check:", sorted(charges))</div>
  <div class="fx" data-lang="text">lower median = index 3 of the sorted list
range [0..7] pivot 200 lands at 5: k is left, drop the right side
range [0..4] pivot 60 lands at 1: k is right, drop the left side
range [2..4] pivot 80 lands at 2: k is right, drop the left side
range [3..4] pivot 120 lands at 4: k is left, drop the right side
range [3..3] pivot 80 lands at 3: that's k, done
answer: 80
3rd most expensive (index n - 3 = 5): 200
check: [40, 60, 80, 80, 120, 200, 250, 310]</div>
  <table class="tbl out"><caption>Trace: lower median (k = 3) of the charges</caption>
    <tr><th>range</th><th>pivot</th><th>lands at</th><th>compare with k = 3</th><th>keep</th></tr>
    <tr><td>0..7</td><td>200</td><td>5</td><td>3 &lt; 5</td><td>left: 0..4</td></tr>
    <tr><td>0..4</td><td>60</td><td>1</td><td>3 &gt; 1</td><td>right: 2..4</td></tr>
    <tr><td>2..4</td><td>80</td><td>2</td><td>3 &gt; 2</td><td>right: 3..4</td></tr>
    <tr><td>3..4</td><td>120</td><td>4</td><td>3 &lt; 4</td><td>left: 3..3</td></tr>
    <tr><td>3..3</td><td>80</td><td>3</td><td>equal</td><td>answer 80</td></tr>
  </table>
  <p>The ranges shrink 8 → 5 → 3 → 2 → 1 and we never sorted the right side [310, 250]. For the 3rd most expensive (index n − 3 = 5), the very first pivot, 200, lands at 5: done after one pass.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">lo, hi = 0, n - 1
while True:
    p = partition(a, lo, hi)        # random pivot in real code
    if p == k: return a[p]
    if k &lt; p: hi = p - 1            # answer is left of the pivot
    else:     lo = p + 1            # answer is right of the pivot</div>
  <p>Why O(n) on average: the first partition looks at n items, the next at about n/2, then n/4… The sum n + n/2 + n/4 + … is less than 2n. Worst case is still O(n²) with unlucky pivots, which a random pivot makes very unlikely. The same duplicate trap applies; the Kth Largest problem below uses a 3-way version.</p>
  <p>Compare: sort then index is O(n log n); a heap of size k (<a class="xref" data-note="dsa_heaps">Heaps</a>) is O(n log k) and works on streams; quickselect is O(n) average and in place.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Off by one between "kth largest" (1-based, from the top) and the index in sorted order. kth largest = index <code>n − k</code>; kth smallest = index <code>k − 1</code>. With 8 charges, the 3rd largest is index 5, not 3.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>215 Kth Largest Element in an Array</b> (in the Heaps ladder; solved with quickselect in section 11), <b>462 Minimum Moves to Equal Array Elements II</b> (move everything to the median), <b>324 Wiggle Sort II</b> (median + 3-way partition).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Stability.</b> Partition swaps items across long distances. In the Lomuto trace, F's ₹80 jumped over others. When two orders have the same amount, does the sort keep them in their original order, and when does that matter?</div>

  <h2 id="dsa-so-stable"><span class="num">06</span>Stability</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Orders B and F both cost ₹80. B came first in the day. After sorting by amount, is B still before F? With plain numbers nobody can tell the two 80s apart, but with real orders (an id, a time, a restaurant) the answer changes what the customer or the report sees.</p>
  </div>
  <p>A results list is already in alphabetical order. Now you sort it by marks. Asha and Neha both scored 92. Should Asha still come before Neha? A <strong>stable</strong> sort promises yes: items with equal keys keep the order they had before. Our orders are in time order, so a stable sort by amount keeps the earlier ₹80 order first.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A queue at the ration shop is re-arranged by token colour. A fair (stable) shopkeeper keeps people with the same colour in the order they arrived. An unfair one lets someone with the same colour jump ahead.</p>
  </div>
<div class="fx" data-lang="py">orders = [("A", 120), ("B", 80), ("C", 250), ("D", 40),
          ("E", 310), ("F", 80), ("G", 60), ("H", 200)]     # in time order

print("stable (sorted):", sorted(orders, key=lambda o: o[1]))

def selection_sort(a, key):              # swaps over long distances
    a = a[:]
    for i in range(len(a)):
        m = min(range(i, len(a)), key=lambda j: key(a[j]))
        a[i], a[m] = a[m], a[i]
    return a

print("selection sort :", selection_sort(orders, key=lambda o: o[1]))</div>
  <div class="fx" data-lang="text">stable (sorted): [('D', 40), ('G', 60), ('B', 80), ('F', 80), ('A', 120), ('H', 200), ('C', 250), ('E', 310)]
selection sort : [('D', 40), ('G', 60), ('F', 80), ('B', 80), ('A', 120), ('H', 200), ('C', 250), ('E', 310)]</div>
  <p>Python's <code>sorted</code> keeps B before F. Selection sort swapped F ahead of B: in its first round it swapped A (₹120, slot 0) with D (₹40), in the second B (slot 1) with G (₹60), sending B to slot 6, behind F. A long-distance swap jumped B over its equal. That is exactly how quick sort's partition loses stability too.</p>
  <table class="tbl out"><caption>The two ₹80 orders after each sort</caption>
    <tr><th>Sort</th><th>Order of the 80s</th><th>Stable?</th></tr>
    <tr><td>Original (time order)</td><td>B, F</td><td>—</td></tr>
    <tr><td>sorted() / merge sort (<code>&lt;=</code>) / insertion</td><td>B, F</td><td>yes</td></tr>
    <tr><td>Selection sort</td><td>F, B</td><td>no</td></tr>
  </table>
  <h3>Why it matters: sorting by several keys</h3>
  <p>Stability lets you sort by several keys in passes: sort by the <em>least</em> important key first, then by the most important one. The last sort wins, and ties fall back to the earlier order. Finance wants the orders grouped by restaurant, and within each restaurant the dearest first:</p>
<div class="fx" data-lang="py"># order id, amount, restaurant
orders = [("A", 120, "Dosa Hut"), ("B", 80, "Chai Point"), ("C", 250, "Biryani Bros"),
          ("D", 40, "Chai Point"), ("E", 310, "Biryani Bros"), ("F", 80, "Dosa Hut"),
          ("G", 60, "Chai Point"), ("H", 200, "Dosa Hut")]

# two stable passes: minor key (amount, dearest first) first, then major key (restaurant)
step1 = sorted(orders, key=lambda o: o[1], reverse=True)
step2 = sorted(step1, key=lambda o: o[2])
for o in step2:
    print(o)

# one pass with a tuple key gives the same order
print(step2 == sorted(orders, key=lambda o: (o[2], -o[1])))</div>
  <div class="fx" data-lang="text">('E', 310, 'Biryani Bros')
('C', 250, 'Biryani Bros')
('B', 80, 'Chai Point')
('G', 60, 'Chai Point')
('D', 40, 'Chai Point')
('H', 200, 'Dosa Hut')
('A', 120, 'Dosa Hut')
('F', 80, 'Dosa Hut')
True</div>
  <p>After pass 2, the restaurants are A–Z, and inside each restaurant the order from pass 1 (dearest first) survived because pass 2 was stable. One <code>key=lambda o: (o[2], -o[1])</code> does the same in a single pass when the minor key is a number you can negate.</p>
  <table class="tbl">
    <tr><th>Stable</th><th>Not stable</th></tr>
    <tr><td>Insertion, bubble, merge sort, counting sort, radix sort, Timsort (Python's <code>sorted</code> / <code>list.sort</code>)</td><td>Selection sort, quick sort, heap sort (in their usual in-place forms)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A sort is <strong>stable</strong> if any two items with equal keys come out in the same relative order they went in. It only matters when items carry more than the key (records, tuples sorted by one field). Two equal plain 80s look the same either way.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Multi-pass sorting in the wrong order: sort by restaurant first, then by amount, and the restaurant grouping is destroyed (the last pass wins). Minor key first, major key last.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>1636 Sort Array by Increasing Frequency</b> (frequency up, then value down), <b>937 Reorder Data in Log Files</b> (relies on a stable sort), <b>2418 Sort the People</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The n log n Wall.</b> We now have sorts that are fast (merge, quick) and sorts that are stable (merge, insertion). Every one of them works by comparing two items. Could a cleverer comparison sort ever beat n log n?</div>

  <h2 id="dsa-so-bound"><span class="num">07</span>The n log n Wall</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Merge sort, quick sort (average) and heap sort are all O(n log n). Is that because nobody has been clever enough yet, or is there a real limit?</p>
  </div>
  <p>There is a proof that an O(n) comparison sort cannot exist. A comparison sort learns about the input only by asking yes/no questions: "is a &lt; b?". Draw every possible run of questions as a tree. Each leaf is one final answer, i.e. one ordering of the items.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The "guess the number" game with yes/no questions. With 1,000 possible numbers, even the best player needs about 10 questions (2¹⁰ = 1,024), because each answer can at best halve what is left. A sort is playing that game against all the possible orders of the input.</p>
  </div>
<figure class="viz"><svg viewBox="0 0 600 250" width="600"><line x1="300" y1="40" x2="160" y2="86" stroke="currentColor" stroke-opacity="0.6"/><text x="215" y="58" class="tm" text-anchor="middle">yes</text><line x1="300" y1="40" x2="440" y2="86" stroke="currentColor" stroke-opacity="0.6"/><text x="385" y="58" class="tm" text-anchor="middle">no</text><line x1="160" y1="112" x2="80" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="105" y="128" class="tm" text-anchor="middle">yes</text><line x1="160" y1="112" x2="230" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="210" y="128" class="tm" text-anchor="middle">no</text><line x1="440" y1="112" x2="370" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="390" y="128" class="tm" text-anchor="middle">yes</text><line x1="440" y1="112" x2="520" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="495" y="128" class="tm" text-anchor="middle">no</text><line x1="230" y1="176" x2="190" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="195" y="192" class="tm" text-anchor="middle">yes</text><line x1="230" y1="176" x2="270" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="265" y="192" class="tm" text-anchor="middle">no</text><line x1="520" y1="176" x2="480" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="485" y="192" class="tm" text-anchor="middle">yes</text><line x1="520" y1="176" x2="560" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="555" y="192" class="tm" text-anchor="middle">no</text><rect x="265.0" y="16" width="70" height="26" rx="13" class="fb sb"/><text x="300" y="34" text-anchor="middle">a &lt; b ?</text><rect x="125.0" y="86" width="70" height="26" rx="13" class="fb sb"/><text x="160" y="104" text-anchor="middle">b &lt; c ?</text><rect x="405.0" y="86" width="70" height="26" rx="13" class="fb sb"/><text x="440" y="104" text-anchor="middle">a &lt; c ?</text><rect x="50" y="149" width="60" height="24" class="fg sg"/><text x="80" y="166" text-anchor="middle">a b c</text><rect x="195.0" y="150" width="70" height="26" rx="13" class="fb sb"/><text x="230" y="168" text-anchor="middle">a &lt; c ?</text><rect x="340" y="149" width="60" height="24" class="fg sg"/><text x="370" y="166" text-anchor="middle">b a c</text><rect x="485.0" y="150" width="70" height="26" rx="13" class="fb sb"/><text x="520" y="168" text-anchor="middle">b &lt; c ?</text><rect x="160" y="209" width="60" height="24" class="fg sg"/><text x="190" y="226" text-anchor="middle">a c b</text><rect x="240" y="209" width="60" height="24" class="fg sg"/><text x="270" y="226" text-anchor="middle">c a b</text><rect x="450" y="209" width="60" height="24" class="fg sg"/><text x="480" y="226" text-anchor="middle">b c a</text><rect x="530" y="209" width="60" height="24" class="fg sg"/><text x="560" y="226" text-anchor="middle">c b a</text><text x="10" y="246" class="tm">3! = 6 orders → at least log₂ 6 ≈ 2.6, so 3 questions worst case</text></svg><figcaption>Any sort that only asks "is x &lt; y?" is a yes/no tree. Each leaf is one possible order of a, b, c. With n items there are n! leaves, so the tree must be at least log₂(n!) ≈ n log n deep.</figcaption></figure>
  <p>n items can be arranged in n! ways (3 items: 6 ways). The sort must be able to end at any of them, so the tree needs at least n! leaves. A yes/no tree of depth d has at most 2^d leaves. So 2^d ≥ n!, which means d ≥ log₂(n!). And log₂(n!) grows like n log₂ n.</p>
<div class="fx" data-lang="py">import math
for n in [3, 8, 1000, 1_000_000]:
    need = math.lgamma(n + 1) / math.log(2)          # log2(n!) without building n!
    print(f"n={n:&gt;9,}  log2(n!) = {need:&gt;12,.1f}   n*log2(n) = {n * math.log2(n):&gt;12,.1f}")
print("8 charges can be arranged in", math.factorial(8), "orders")</div>
  <div class="fx" data-lang="text">n=        3  log2(n!) =          2.6   n*log2(n) =          4.8
n=        8  log2(n!) =         15.3   n*log2(n) =         24.0
n=    1,000  log2(n!) =      8,529.4   n*log2(n) =      9,965.8
n=1,000,000  log2(n!) = 18,488,884.8   n*log2(n) = 19,931,568.6
8 charges can be arranged in 40320 orders</div>
  <p>For our 8 charges: 40,320 possible orders, so any comparison sort needs at least 16 comparisons in its worst case (2¹⁵ = 32,768 is too few leaves). Merge sort's merges above used 1 + 1 + 1 + 1 + 3 + 3 + 7 = 17 on this input. For n = 1,000: log₂(n!) ≈ 8,529 while n·log₂ n ≈ 9,966. For a million items: 18.5 million vs 19.9 million. Same growth.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every comparison is one yes/no answer, and it can at best cut the remaining possible orders in half. You need about log₂(n!) ≈ n log n halvings to get down to one order. So <strong>any</strong> comparison sort has a worst case of at least about n log n comparisons. The only way past the wall is to stop comparing — next section.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lower bound Ω(n log n)</strong>: every comparison sort needs at least about log₂(n!) ≈ n log₂ n comparisons on its worst input. Merge sort and heap sort meet it, so they are <em>optimal</em> comparison sorts.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The bound is about the <em>worst case of comparison sorts</em>. It does not say Timsort can't finish sorted input in n − 1 comparisons (it does), and it does not apply to counting sort, which never compares.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>When a problem demands O(n) and the obvious answer sorts, the wall tells you to look for buckets or counting: <b>164 Maximum Gap</b>, <b>1365 How Many Numbers Are Smaller Than the Current Number</b> (values ≤ 100).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Counting &amp; Radix Sort.</b> Comparisons cost at least n log n. Our charges are whole multiples of ₹10 between 40 and 310, a small range. Could the value itself tell us where an item goes, without comparing it with anything?</div>

  <h2 id="dsa-so-counting"><span class="num">08</span>Counting &amp; Radix Sort</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The wall only applies to sorts that compare. If the keys are small integers (marks 0–100, star ratings 1–5, charges in tens of rupees), can we sort in O(n) by using the key as a position?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"values in the range <b>0..100</b>", "<b>lowercase letters</b>", "ages", "ratings", "digits", "sort in <b>O(n)</b>", "frequency", "bucket".</p>
  </div>
  <p>A teacher has 500 answer sheets with marks from 0 to 100. She does not compare sheets. She makes 101 piles, one per mark, drops each sheet in its pile, then picks the piles up in order. Every sheet is touched once. That is <strong>counting sort</strong>.</p>
  <p>Every charge is a multiple of ₹10, so <code>charge // 10</code> is a whole number from 4 to 31. That is our key: 32 piles.</p>
<div class="fx" data-lang="py">def counting_sort(nums, max_value):
    count = [0] * (max_value + 1)
    for x in nums:                      # one pile per value
        count[x] += 1
    return [v for v, c in enumerate(count) for _ in range(c)]

charges = [120, 80, 250, 40, 310, 80, 60, 200]
tens = [c // 10 for c in charges]       # every charge is a multiple of 10: keys 0..31
print("keys:", tens)
out = counting_sort(tens, max(tens))
print("sorted keys:", out)
print("as rupees:  ", [k * 10 for k in out])</div>
  <div class="fx" data-lang="text">keys: [12, 8, 25, 4, 31, 8, 6, 20]
sorted keys: [4, 6, 8, 8, 12, 20, 25, 31]
as rupees:   [40, 60, 80, 80, 120, 200, 250, 310]</div>
  <table class="tbl out"><caption>Trace: the non-empty piles (key = charge ÷ 10)</caption>
    <tr><th>key</th><th>4</th><th>6</th><th>8</th><th>12</th><th>20</th><th>25</th><th>31</th></tr>
    <tr><th>count</th><td>1</td><td>1</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
    <tr><th>charges</th><td>40</td><td>60</td><td>80, 80</td><td>120</td><td>200</td><td>250</td><td>310</td></tr>
  </table>
  <p>Reading the 32 piles from left to right gives the sorted list, with zero comparisons between charges. Cost: O(n + k), where k is the range of keys (here 32). Great when k is small (marks, ages, ratings 1–5, letters a–z). Terrible when k is huge: sorting 10 phone numbers this way needs a count list of 10 billion slots.</p>
  <h3>Sorting whole records, stably</h3>
  <p>To sort <em>records</em> by a small integer key and keep ties in order (stable), use prefix sums (the Arrays note): <code>start[v]</code> = how many keys are smaller than v = where the first item with key v goes. Each order also got a star rating from 1 to 5:</p>
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

# the 8 orders with their star rating (1..5) from the customer
orders = [("A", 120, 4), ("B", 80, 5), ("C", 250, 3), ("D", 40, 5),
          ("E", 310, 4), ("F", 80, 2), ("G", 60, 5), ("H", 200, 3)]
by_stars = counting_sort_by(orders, key=lambda o: o[2], k=6)
print([(o[0], o[2]) for o in by_stars])</div>
  <div class="fx" data-lang="text">[('F', 2), ('C', 3), ('H', 3), ('A', 4), ('E', 4), ('B', 5), ('D', 5), ('G', 5)]</div>
  <p>Count of stars: one 2★, two 3★ (C, H), two 4★ (A, E), three 5★ (B, D, G). So start = 2★ at slot 0, 3★ at slot 1, 4★ at slot 3, 5★ at slot 5. Walking the orders left to right and dropping each into the next free slot of its group keeps time order inside each group: B, D, G among the 5★.</p>
  <h3>Radix sort: digit by digit</h3>
  <p><strong>Radix sort</strong> uses that stable counting sort many times, once per digit, starting from the <em>last</em> digit. After sorting by the ones digit, then (stably) by the tens, then by the hundreds, the numbers are fully sorted. Stability is what keeps the earlier digit order inside each pile.</p>
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

charges = [120, 80, 250, 40, 310, 80, 60, 200]
radix_sort(charges)
print()
radix_sort([170, 45, 75, 90, 802, 24, 2, 66])      # the same idea when every digit matters</div>
  <div class="fx" data-lang="text">by digit   1: [120, 80, 250, 40, 310, 80, 60, 200]
by digit  10: [200, 310, 120, 40, 250, 60, 80, 80]
by digit 100: [40, 60, 80, 80, 120, 200, 250, 310]

by digit   1: [170, 90, 802, 2, 24, 45, 75, 66]
by digit  10: [802, 2, 24, 45, 66, 170, 75, 90]
by digit 100: [2, 24, 45, 66, 75, 90, 170, 802]</div>
  <table class="tbl out"><caption>Trace: radix sort on the charges</caption>
    <tr><th>pass</th><th>digit used</th><th>result</th><th>what happened</th></tr>
    <tr><td>1</td><td>ones</td><td>[120, 80, 250, 40, 310, 80, 60, 200]</td><td>every ones digit is 0: one pile, order unchanged</td></tr>
    <tr><td>2</td><td>tens</td><td>[200, 310, 120, 40, 250, 60, 80, 80]</td><td>tens digits 0, 1, 2, 4, 5, 6, 8, 8</td></tr>
    <tr><td>3</td><td>hundreds</td><td>[40, 60, 80, 80, 120, 200, 250, 310]</td><td>hundreds 0, 0, 0, 0, 1, 2, 2, 3; ties keep pass-2 order (200 before 250)</td></tr>
  </table>
  <p>In pass 3, 200 and 250 both have hundreds digit 2. They stay in the order pass 2 left them (200 first, because its tens digit 0 is smaller than 5). That is stability doing the work. The second run, on numbers whose every digit differs, shows the same thing at a bigger scale.</p>
  <table class="tbl">
    <tr><th>Sort</th><th>Time</th><th>Space</th><th>Needs</th></tr>
    <tr><td>Counting</td><td>O(n + k)</td><td>O(n + k)</td><td>Integer keys in a small range 0..k−1</td></tr>
    <tr><td>Radix (LSD)</td><td>O(d · (n + b))</td><td>O(n + b)</td><td>Fixed-length keys: d digits in base b (ints, dates, fixed strings)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Counting sort</strong>: count how many times each key occurs, then place items by key, in O(n + k). <strong>Radix sort (LSD)</strong>: stable counting sort on each digit from least to most significant, in O(d·(n + b)). Neither compares two items, so the n log n wall does not apply.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Negative numbers break the simple versions (<code>count[-3]</code> silently means "third from the end"). Shift by the minimum first: use <code>x - min(nums)</code> as the index. And radix sort must use a <em>stable</em> inner sort, or the earlier digits get scrambled.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>1365 How Many Numbers Are Smaller Than the Current Number</b> (counts + prefix sums, exactly <code>start[v]</code>), <b>1833 Maximum Ice Cream Bars</b>, <b>451 Sort Characters By Frequency</b> (buckets by count), then <b>164 Maximum Gap</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Sorting in Python.</b> We can now hand-write six sorts. In real code and most interviews you call one line. What does that line do inside, and how do you make it sort orders by restaurant, then dearest first, or coupon codes by the number inside?</div>

  <h2 id="dsa-so-python"><span class="num">09</span>Sorting in Python</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the algorithms; Python gives us <code>sorted()</code> and <code>list.sort()</code>. Which algorithm is that, is it stable, how fast is it on data that is already almost in order, and how do we tell it <em>what</em> to sort by?</p>
  </div>
  <h3>Timsort</h3>
  <p>Python's built-in sort is <strong>Timsort</strong> (Tim Peters, 2002; Java uses it for objects too). Real data is rarely random: logs arrive mostly in time order, a list is "sorted plus a few new items". Timsort exploits that. It is built from two things this note already taught:</p>
  <ul>
    <li>It scans for <strong>runs</strong>: stretches already ascending (or strictly descending, which it reverses).</li>
    <li>Short runs are extended to a minimum length (32–64) with <strong>insertion sort</strong> (section 02: fast on short, nearly sorted pieces).</li>
    <li>Runs are <strong>merged</strong> like merge sort (section 03, with <code>&lt;=</code>, so stable), in a careful order that keeps merges balanced, with "galloping" to skip ahead when one run keeps winning.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A librarian re-shelving returns. She notices that most of the trolley is already in order in a few stretches, keeps those stretches as they are, tidies the short messy bits by hand, and then interleaves the stretches. She never treats the trolley as random.</p>
  </div>
  <p>Result: O(n) on sorted or reversed data, O(n log n) worst case, stable, O(n) extra space. Let us count the comparisons it really makes.</p>
<div class="fx" data-lang="py">import random, math
class Counted:
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
n*log2(n)     : 9966</div>
  <p>Sorted and reversed input: 999 comparisons, one per neighbour pair. Random input: below n log₂ n. Notice that Python sorts only ever call <code>&lt;</code>, so a class needs just <code>__lt__</code> to be sortable.</p>
  <h3>sorted() vs .sort()</h3>
<div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
new = sorted(charges)          # new list; the original stays in time order
print(charges)
print(new)
result = charges.sort()        # in place; returns None
print(charges, result)
print(sorted("BITEFUL"), sorted({"dosa": 2, "chai": 5}), sorted((3, 1, 2), reverse=True))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200]
[40, 60, 80, 80, 120, 200, 250, 310]
[40, 60, 80, 80, 120, 200, 250, 310] None
['B', 'E', 'F', 'I', 'L', 'T', 'U'] ['chai', 'dosa'] [3, 2, 1]</div>
  <p><code>sorted()</code> takes any iterable (string, tuple, dict keys, generator) and returns a new list; the charges stay in time order. <code>list.sort()</code> works only on lists, changes them in place, and returns <code>None</code>. Both are Timsort, both stable, both take keyword-only <code>key=</code> and <code>reverse=</code>.</p>
  <h3>key=: sort by what you choose</h3>
  <p><code>key</code> is a function called <strong>once per item</strong>. Python sorts by the returned values. Return a tuple to sort by several things; negate a number to flip just that part.</p>
<div class="fx" data-lang="py">from operator import itemgetter

orders = [("A", 120, "Dosa Hut"), ("B", 80, "Chai Point"), ("C", 250, "Biryani Bros"),
          ("D", 40, "Chai Point"), ("E", 310, "Biryani Bros"), ("F", 80, "Dosa Hut"),
          ("G", 60, "Chai Point"), ("H", 200, "Dosa Hut")]

print([o[0] for o in sorted(orders, key=itemgetter(1))])                 # by amount
print([o[0] for o in sorted(orders, key=lambda o: -o[1])])               # dearest first
print([o[0] for o in sorted(orders, key=lambda o: (len(o[2]), o[1]))])   # short names first, then amount

codes = ["bite10", "Bite5", "BITE100", "bite2"]      # coupon codes
print(sorted(codes))                                  # capitals first (ASCII order)
print(sorted(codes, key=str.lower))                   # ignore case, still text order
print(sorted(codes, key=lambda c: int(c[4:])))        # by the number inside</div>
  <div class="fx" data-lang="text">['D', 'G', 'B', 'F', 'A', 'H', 'C', 'E']
['E', 'C', 'H', 'A', 'B', 'F', 'G', 'D']
['F', 'A', 'H', 'D', 'G', 'B', 'C', 'E']
['BITE100', 'Bite5', 'bite10', 'bite2']
['bite10', 'BITE100', 'bite2', 'Bite5']
['bite2', 'Bite5', 'bite10', 'BITE100']</div>
  <table class="tbl out"><caption>What each key did to the 8 orders</caption>
    <tr><th>key</th><th>result</th><th>note</th></tr>
    <tr><td><code>itemgetter(1)</code> (amount)</td><td>D G B F A H C E</td><td>B before F: stable tie</td></tr>
    <tr><td><code>-o[1]</code> (dearest first)</td><td>E C H A B F G D</td><td>negating keeps B before F; <code>reverse=True</code> would too</td></tr>
    <tr><td><code>(len(name), amount)</code></td><td>F A H D G B C E</td><td>Dosa Hut (8 letters) first, then Chai Point (10), then Biryani Bros (12)</td></tr>
  </table>
  <p>The coupon codes show the classic string trap: <code>"BITE100"</code> sorts before <code>"Bite5"</code> because capitals come first in character order, and even with <code>str.lower</code>, "bite10" &lt; "bite2" because text compares character by character ('1' &lt; '2'). <code>key=lambda c: int(c[4:])</code> sorts by the number inside.</p>
  <h3>functools.cmp_to_key: when a key is hard to write</h3>
  <p>Sometimes the rule is about <em>pairs</em>: "a goes before b if …". Old-style comparison functions return a negative number (a first), zero (tie) or positive (b first). <code>cmp_to_key</code> wraps such a function so <code>sorted</code> can use it. Biteful's app versions are the example:</p>
<div class="fx" data-lang="py">from functools import cmp_to_key

def by_version(a, b):                  # "1.10" &gt; "1.9", which plain string sort gets wrong
    pa = [int(x) for x in a.split(".")]
    pb = [int(x) for x in b.split(".")]
    return (pa &gt; pb) - (pa &lt; pb)       # -1, 0 or 1

versions = ["1.10", "1.2", "1.9", "2.0", "1.2.1"]
print(sorted(versions))
print(sorted(versions, key=cmp_to_key(by_version)))</div>
  <div class="fx" data-lang="text">['1.10', '1.2', '1.2.1', '1.9', '2.0']
['1.2', '1.2.1', '1.9', '1.10', '2.0']</div>
  <p>Plain string order puts "1.10" before "1.2". Comparing the version numbers part by part as integers gives the order a human expects. (This one could also be written as <code>key=lambda v: [int(x) for x in v.split(".")]</code>; Largest Number in section 11 is a rule that really needs a pair comparison.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Timsort</strong>: a hybrid of insertion sort (short runs) and merge sort (merging runs); stable; O(n) best, O(n log n) worst. <strong>key function</strong>: maps each item to the value it is sorted by, called n times. <strong>Comparator</strong>: <code>cmp(a, b)</code> returning &lt; 0, 0 or &gt; 0, turned into a key by <code>cmp_to_key</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A comparator must be consistent: if a &lt; b and b &lt; c, then a &lt; c. A rule that breaks this (random results, "rock-paper-scissors") gives a garbage order with no error. Prefer <code>key=</code> whenever you can express the rule as "a value per item": it is faster (one call per item, not one per comparison) and harder to get wrong.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>2418 Sort the People</b> (sort pairs), <b>1636 Sort Array by Increasing Frequency</b> (tuple key), <b>179 Largest Number</b> (cmp_to_key), then <b>1366 Rank Teams by Votes</b> and <b>406 Queue Reconstruction by Height</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Sort First, Then….</b> We can sort anything by any rule in one line. The remaining skill is the interview one: reading a problem and noticing that sorting is the first step that makes the rest easy.</div>

  <h2 id="dsa-so-patterns"><span class="num">10</span>Sort First, Then…</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 said sorting makes questions cheap. Now that sorting itself is understood, how do we recognise, in a problem statement, that the answer begins with "sort", and which tool to apply after it?</p>
  </div>
  <p>Here is the day's charges again. One O(n log n) sort, and then five questions, each answered with one pass, one binary search or two pointers:</p>
<div class="fx" data-lang="py">import bisect
charges = [120, 80, 250, 40, 310, 80, 60, 200]
s = sorted(charges)                                  # pay O(n log n) once ...

# ... then each of these is O(n) or O(log n)
gaps = [s[i + 1] - s[i] for i in range(len(s) - 1)]
best = min(gaps)
print("1. closest amounts:", [(s[i], s[i + 1]) for i in range(len(s) - 1) if gaps[i] == best])
print("2. distinct amounts:", [x for i, x in enumerate(s) if i == 0 or x != s[i - 1]])
print("3. orders under ₹100:", bisect.bisect_left(s, 100))
l, r = 0, len(s) - 1
while s[l] + s[r] != 280:                            # two pointers (Arrays note)
    if s[l] + s[r] &lt; 280: l += 1
    else: r -= 1
print("4. combo worth ₹280:", s[l], "+", s[r])
print("5. median:", (s[3] + s[4]) / 2, " top-3:", s[-3:][::-1])</div>
  <div class="fx" data-lang="text">1. closest amounts: [(80, 80)]
2. distinct amounts: [40, 60, 80, 120, 200, 250, 310]
3. orders under ₹100: 4
4. combo worth ₹280: 80 + 200
5. median: 100.0  top-3: [310, 250, 200]</div>
  <table class="tbl out"><caption>Trace: what the sorted charges [40, 60, 80, 80, 120, 200, 250, 310] answer</caption>
    <tr><th>Question</th><th>After sorting</th><th>Cost after the sort</th><th>Without sorting</th></tr>
    <tr><td>Closest two amounts</td><td>compare neighbours only: (80, 80)</td><td>O(n)</td><td>all pairs, O(n²)</td></tr>
    <tr><td>Distinct amounts</td><td>skip x equal to its left neighbour</td><td>O(n)</td><td>a set</td></tr>
    <tr><td>Orders under ₹100</td><td><code>bisect_left(s, 100)</code> = 4</td><td>O(log n)</td><td>O(n) scan</td></tr>
    <tr><td>₹280 combo</td><td>two pointers: 80 + 200</td><td>O(n)</td><td>O(n²) or a dict</td></tr>
    <tr><td>Median, top 3</td><td>index: 100; [310, 250, 200]</td><td>O(1)</td><td>quickselect / heap</td></tr>
  </table>
  <h3>Template</h3>
<div class="fx" data-lang="text">s = sorted(items, key=...)          # O(n log n) once: equal things together, extremes at the ends
for i in range(1, len(s)):          # then ONE pass that only looks at neighbours,
    compare(s[i - 1], s[i])         # or two pointers from both ends, or bisect for counts</div>
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
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Sorting turns "compare everything with everything" into "compare neighbours". Whenever the brute force checks all pairs and the answer only depends on <em>values</em> (not original positions), ask: after sorting, which pairs could still matter? Usually only neighbours, or the two ends.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sorting loses the original positions. If the answer needs the original index (Two Sum returns indexes), sort pairs <code>(value, index)</code> or use a hash map instead. And do not sort just to read one item: <code>max()</code> is O(n).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>976 Largest Perimeter Triangle</b> (after sorting, only neighbours can form the best triangle), <b>945 Minimum Increment to Make Array Unique</b>, <b>628 Maximum Product of Three Numbers</b> (the two ends), <b>954 Array of Doubled Pairs</b>. In the Greedy ladder: <b>56 Merge Intervals</b> starts with a sort by start time.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> The patterns need practice on real interview questions, where the sort is hidden: a one-pass partition, a selection, a custom comparator, a merge from the back, a count during merging and a counting sort.</div>

<h2 id="dsa-so-problems"><span class="num">11</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section gave one tool. Can we use them on the problems interviewers actually ask, where the statement never says "use partition" or "count while merging"? Where a problem fits, it is also run on the charges.</p>
  </div>
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

for nums, k in [([120, 80, 250, 40, 310, 80, 60, 200], 3), ([3, 2, 1, 5, 6, 4], 2), ([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), ([7], 1), ([1] * 50000, 3), ([-1, -1], 2)]:
    print(nums if len(nums) &lt; 10 else "[1]*50000", k, "-&gt;", find_kth_largest(nums, k))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200] 3 -&gt; 200
[3, 2, 1, 5, 6, 4] 2 -&gt; 5
[3, 2, 3, 1, 2, 4, 5, 5, 6] 4 -&gt; 4
[7] 1 -&gt; 7
[1]*50000 3 -&gt; 1
[-1, -1] 2 -&gt; -1</div>  <p><strong>Complexity.</strong> Average O(n) time (n + n/2 + …), O(n) extra space for the lists. The in-place version from section 05 uses O(1) space; ask the interviewer which they prefer. On the charges, k = 3 gives 200, the same answer quickselect found in one partition.</p>

  <h3>3. Largest Number (LeetCode 179)</h3>
  <p><strong>Problem.</strong> Arrange non-negative integers so that, written side by side, they form the largest number. Return it as a string. <code>[3, 30, 34, 5, 9]</code> → <code>"9534330"</code>.</p>
  <p><strong>Brute force.</strong> Try every order: O(n!·n). Hopeless past 10 numbers.</p>
  <p><strong>Better.</strong> Normal descending sort fails: 30 &gt; 3, but "330" beats "303". The right rule compares <em>pairs</em>: put a before b if the string <code>a + b</code> &gt; <code>b + a</code>. For "3" and "30": "330" &gt; "303", so "3" goes first. This is a pair rule, so <code>cmp_to_key</code> fits. (The rule is consistent, which is what makes sorting with it valid.)</p>
<div class="fx" data-lang="py">from functools import cmp_to_key
def largest_number(nums):
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
  <p><strong>Better.</strong> Merge sort: guaranteed O(n log n), no bad inputs (plain quick sort with a fixed pivot fails this problem's sorted and all-equal tests). Here is the <strong>bottom-up</strong> version: no recursion. Merge runs of width 1 into width 2, then 2 into 4, and so on. It reuses <code>merge</code> from section 03. On the charges, width 1 merges neighbours into sorted pairs, width 2 builds the two sorted halves we merged by hand in section 03, and width 4 is that final merge.</p>
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

print(sort_array([120, 80, 250, 40, 310, 80, 60, 200], trace=True))
print(sort_array([]), sort_array([1]), sort_array([5, 1, 1, 2, 0, 0]))</div>
  <div class="fx" data-lang="text">width 1: [80, 120, 40, 250, 80, 310, 60, 200]
width 2: [40, 80, 120, 250, 60, 80, 200, 310]
width 4: [40, 60, 80, 80, 120, 200, 250, 310]
[40, 60, 80, 80, 120, 200, 250, 310]
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

for arr in [[120, 80, 250, 40, 310, 80, 60, 200], [2, 4, 1, 3, 5], [1, 2, 3], [3, 2, 1], [], [5, 5, 5], [8, 4, 2, 1]]:
    print(arr, "-&gt;", count_inversions(arr))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200] -&gt; 14
[2, 4, 1, 3, 5] -&gt; 3
[1, 2, 3] -&gt; 0
[3, 2, 1] -&gt; 3
[] -&gt; 0
[5, 5, 5] -&gt; 0
[8, 4, 2, 1] -&gt; 6</div>  <p><strong>Complexity.</strong> O(n log n) time, O(n) space. Equal items are not inversions, which is why the merge uses <code>&lt;=</code>. A reversed list of n has the maximum, n(n−1)/2. The charges have 14 inversions: exactly the 14 shifts insertion sort made in section 02.</p>

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
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Solutions that are right on paper still fail on one line of Python: a <code>None</code> from <code>.sort()</code>, a fixed pivot, a string compared as text.</div>

  <h2 id="dsa-so-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which small slips turn a correct sorting idea into a wrong answer or a timeout, and how do you spot them before the interviewer does?</p>
  </div>
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
    <p>Still sorted, but no longer stable (F's ₹80 overtakes B's), and in Count Inversions it wrongly counts equal pairs as inversions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: binary search or two pointers on unsorted data</span>
    <p>No error, just a wrong answer: on the raw charges, binary search said ₹60 was missing. Sort first, or check that the problem promises sorted input.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: kth largest off by one</span>
    <p>kth largest is sorted index <code>n − k</code>, not <code>k</code>. The 3rd largest charge is <code>s[5]</code> = 200, not <code>s[3]</code> = 80.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: multi-key sorting in the wrong order</span>
    <p>Stable passes go minor key first, major key last. Or use one tuple key: <code>(restaurant, -amount)</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have ten ideas and a list of traps. How does each idea grow out of the one before, and what does each give on the same 8 charges?</div>

  <h2 id="dsa-so-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Insertion, merge, quick, quickselect, stability, the n log n wall, counting, radix and Timsort: how is each one built from the ones before, and what does each give on the same 8 charges?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-so-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="210" y1="32" x2="230" y2="32" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<line x1="430" y1="32" x2="450" y2="32" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<line x1="550" y1="54" x2="550" y2="88" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<line x1="550" y1="132" x2="550" y2="166" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<line x1="450" y1="110" x2="430" y2="110" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<line x1="230" y1="110" x2="210" y2="110" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<line x1="110" y1="132" x2="110" y2="166" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<line x1="280" y1="132" x2="160" y2="166" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-so-a9)"/>
<line x1="500" y1="54" x2="380" y2="166" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-so-a9)"/>
<line x1="160" y1="210" x2="280" y2="244" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<line x1="330" y1="210" x2="330" y2="244" stroke="currentColor" marker-end="url(#dsa-so-a9)"/>
<rect x="10" y="10" width="200" height="44" rx="7" class="fr sr"/>
<text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">need: sorted data</text>
<text x="110" y="45" text-anchor="middle" class="tm" font-size="10">two pointers, binary search</text>
<rect x="230" y="10" width="200" height="44" rx="7" class="fb sb"/>
<text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">O(n²) sorts</text>
<text x="330" y="45" text-anchor="middle" class="tm" font-size="10">insertion: 14 shifts, 19 compares</text>
<rect x="450" y="10" width="200" height="44" rx="7" class="fg sg"/>
<text x="550" y="29" text-anchor="middle" font-size="11.5" font-weight="700">merge sort</text>
<text x="550" y="45" text-anchor="middle" class="tm" font-size="10">split + merge: n log n always</text>
<rect x="450" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="550" y="107" text-anchor="middle" font-size="11.5" font-weight="700">quick sort</text>
<text x="550" y="123" text-anchor="middle" class="tm" font-size="10">partition around 200, in place</text>
<rect x="450" y="166" width="200" height="44" rx="7" class="fb sb"/>
<text x="550" y="185" text-anchor="middle" font-size="11.5" font-weight="700">quickselect</text>
<text x="550" y="201" text-anchor="middle" class="tm" font-size="10">one side only: median 80</text>
<rect x="230" y="88" width="200" height="44" rx="7" class="ft st"/>
<text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">stability</text>
<text x="330" y="123" text-anchor="middle" class="tm" font-size="10">B (₹80) stays before F (₹80)</text>
<rect x="10" y="88" width="200" height="44" rx="7" class="fr sr"/>
<text x="110" y="107" text-anchor="middle" font-size="11.5" font-weight="700">n log n wall</text>
<text x="110" y="123" text-anchor="middle" class="tm" font-size="10">8! orders → ≥ 16 compares</text>
<rect x="10" y="166" width="200" height="44" rx="7" class="fg sg"/>
<text x="110" y="185" text-anchor="middle" font-size="11.5" font-weight="700">counting / radix</text>
<text x="110" y="201" text-anchor="middle" class="tm" font-size="10">keys 4..31, digit passes</text>
<rect x="230" y="166" width="200" height="44" rx="7" class="fg sg"/>
<text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">Timsort · sorted()</text>
<text x="330" y="201" text-anchor="middle" class="tm" font-size="10">runs + merges, key=, stable</text>
<rect x="230" y="244" width="200" height="44" rx="7" class="fv"/>
<text x="330" y="263" text-anchor="middle" font-size="11.5" font-weight="700">sort first, then…</text>
<text x="330" y="279" text-anchor="middle" class="tm" font-size="10">pairs, gaps, median, intervals</text>
</svg><figcaption>Top row: the need, the slow answer, and the first fast answer. Merge sort leads to quick sort (split by value instead of by position), which leads to quickselect (keep one side) and raises the stability question. Stability plus the n log n wall lead to counting/radix sort (radix needs a stable inner sort). Timsort is insertion sort + merge sort. Everything ends in the purple box: sorting as step one of a bigger answer.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's charges [120, 80, 250, 40, 310, 80, 60, 200]</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Why sorted</td><td>two pointers, binary search</td><td>what does order buy?</td><td>raw bisect: "60 missing"; sorted: found at 1, median 100</td><td>any time a tool says "sorted input"</td></tr>
    <tr><td>Insertion sort</td><td>slide each item left</td><td>simplest way to sort?</td><td>14 shifts = 14 inversions, 19 comparisons</td><td>n ≤ ~50, nearly sorted data</td></tr>
    <tr><td>Merge sort</td><td>divide &amp; conquer + merge</td><td>sort in n log n always?</td><td>3 levels; final merge 7 comparisons; 17 in all</td><td>guaranteed time, stability, linked lists, huge files</td></tr>
    <tr><td>Quick sort</td><td>partition around a pivot</td><td>sort in place, no merge?</td><td>pivot 200 → slot 5; sorted input → sizes 8, 7, 6, 5, 4, 2</td><td>arrays in memory, random pivot</td></tr>
    <tr><td>Quickselect</td><td>partition, one side only</td><td>one item without sorting?</td><td>median 80 in 5 partitions; 3rd largest 200 in 1</td><td>kth / median, O(n) average</td></tr>
    <tr><td>Stability</td><td>sorts that never jump equals</td><td>do ties keep their order?</td><td>sorted: B before F; selection: F before B</td><td>records, multi-key passes, radix</td></tr>
    <tr><td>n log n wall</td><td>yes/no decision tree</td><td>can comparisons beat n log n?</td><td>8! = 40,320 → at least 16 comparisons</td><td>knowing when to look for counting</td></tr>
    <tr><td>Counting / radix</td><td>key as an index + prefix sums (stable)</td><td>sort without comparing?</td><td>keys 4..31 → 32 piles; radix 3 passes</td><td>small integer keys, fixed digits</td></tr>
    <tr><td>Timsort / sorted()</td><td>insertion sort + merge sort on runs</td><td>what does Python do; sort by my rule?</td><td>key=itemgetter(1) → D G B F A H C E</td><td>almost always, in real code</td></tr>
    <tr><td>Sort first, then…</td><td>any sort + one pass</td><td>is sorting step one here?</td><td>closest (80, 80), ₹280 = 80 + 200, 4 under ₹100</td><td>pairs, gaps, intervals, greedy</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a comparison sort is a way of asking about log₂(n!) yes/no questions; merge sort asks them while combining, quick sort while splitting, and counting sort skips the questions by using the value as an address.</strong> Once sorted, every later question only needs neighbours or the two ends.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_binsearch">Binary Search</a>: the sorted charges are ready; how do we find ₹200, or "the first charge ≥ ₹100", in log n looks, and get the loop boundaries right?</div>

  <h2 id="dsa-so-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b> = orders A..H in time order; sorted <b>[40, 60, 80, 80, 120, 200, 250, 310]</b> (D G B F A H C E).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Why sorted</td><td>what does order buy?</td><td>binary search on raw data misses 60; sorted gives min/max/median/dupes in one look</td><td>how is it done?</td></tr>
    <tr><td>Insertion sort</td><td>simplest sort?</td><td>14 shifts, 19 comparisons</td><td>O(n²)</td></tr>
    <tr><td>Merge sort</td><td>faster by splitting?</td><td>3 levels, 17 comparisons</td><td>O(n) extra memory</td></tr>
    <tr><td>Quick sort</td><td>in place?</td><td>partition around 200 → [120, 80, 40, 80, 60 | 200 | 310, 250]</td><td>O(n²) on bad pivots; sorts both sides</td></tr>
    <tr><td>Quickselect</td><td>just one item?</td><td>median 80, 3rd largest 200</td><td>long swaps break ties</td></tr>
    <tr><td>Stability</td><td>do ties keep order?</td><td>B before F (stable) vs F before B (selection)</td><td>all of these compare</td></tr>
    <tr><td>n log n wall</td><td>can comparing be faster?</td><td>≥ log₂(8!) ≈ 15.3 → 16 comparisons</td><td>stop comparing</td></tr>
    <tr><td>Counting / radix</td><td>sort by using the value?</td><td>keys 4..31; radix 3 digit passes</td><td>only small integer keys</td></tr>
    <tr><td>Timsort / key=</td><td>what does Python do?</td><td>999 comparisons on 1,000 sorted items</td><td>when do I sort at all?</td></tr>
    <tr><td>Sort first, then…</td><td>is sorting step one?</td><td>closest (80, 80); 80 + 200 = 280</td><td>→ Binary Search, Greedy</td></tr>
  </table>
  <h3>Templates and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Inversions</td><td>pairs i &lt; j with a[i] &gt; a[j]; max n(n−1)/2</td><td>insertion sort = O(n + inversions)</td></tr>
    <tr><td>Merge</td><td>take <code>left[i]</code> if <code>left[i] &lt;= right[j]</code>, else <code>right[j]</code>; copy the leftovers</td><td>≤ n − 1 comparisons; <code>&lt;=</code> = stable</td></tr>
    <tr><td>Merge sort cost</td><td>T(n) = 2T(n/2) + n = O(n log n)</td><td>log₂ n levels × n work per level</td></tr>
    <tr><td>Lomuto partition</td><td>pivot = a[hi]; i = lo; for j: if a[j] &lt; pivot: swap a[i], a[j]; i += 1; finally swap a[i], a[hi]</td><td>i = next slot for a small item; returns the pivot's final index</td></tr>
    <tr><td>Quick sort cost</td><td>good split: n log n; always worst pivot: n + (n−1) + … ≈ n²/2</td><td>random pivot + 3-way partition</td></tr>
    <tr><td>Quickselect</td><td>p == k → done; k &lt; p → hi = p − 1; else lo = p + 1</td><td>n + n/2 + n/4 + … &lt; 2n; kth largest = index n − k</td></tr>
    <tr><td>Lower bound</td><td>2^d ≥ n! → d ≥ log₂(n!) ≈ n log₂ n</td><td>d = worst-case comparisons</td></tr>
    <tr><td>Counting sort</td><td>count[key] += 1; start[v] = Σ count[&lt; v]</td><td>O(n + k), k = number of possible keys</td></tr>
    <tr><td>Radix (LSD)</td><td>stable counting sort per digit, ones first</td><td>O(d·(n + b)), d digits, base b</td></tr>
    <tr><td>Python</td><td><code>sorted(x, key=f, reverse=False)</code> new list; <code>x.sort()</code> in place → None</td><td>tuple keys; negate numbers; <code>cmp_to_key(cmp)</code></td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>sorted() / Timsort</b><p>Almost always: stable, O(n) on sorted data, O(n log n) worst.</p><small>Not when one item or the max is enough</small></div>
    <div><b>Merge sort</b><p>Guaranteed n log n, stability, linked lists, counting inversions, external sorting.</p><small>Not when memory is tight (O(n) extra)</small></div>
    <div><b>Quick sort / partition</b><p>In-place array sorting; one-pass partitions (0/1/2, "move X left").</p><small>Not with a fixed pivot on sorted / equal data</small></div>
    <div><b>Quickselect</b><p>kth item or median in O(n) average.</p><small>Not on a stream (use a heap)</small></div>
    <div><b>Counting / radix</b><p>Small integer keys (marks, letters, ratings) or fixed-width digits.</p><small>Not when the key range k is huge</small></div>
    <div><b>Insertion sort</b><p>Tiny or nearly sorted inputs; inside Timsort.</p><small>Not for random data beyond ~50 items</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p><code>x = x.sort()</code> gives None; fixed end pivot on sorted input → O(n²) and RecursionError; Lomuto on all-equal data; merge with <code>&lt;</code> breaks stability; strings of digits sort as text ("10" &lt; "9"); multi-key passes in the wrong order; kth largest is index n − k; counting sort with negative values; inconsistent comparators; sorting when <code>max()</code> or a heap would do; sorting destroys original indexes.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Lomuto partition of the charges around 200: where does 200 land, and what is on each side?</td><td>Index 5; left [120, 80, 40, 80, 60], right [310, 250]</td></tr>
    <tr><td>How many comparisons does merging [40, 80, 120, 250] with [60, 80, 200, 310] take?</td><td>7 (the 8th item, 310, is copied without a comparison)</td></tr>
    <tr><td>Is quick sort stable? Is Python's sort?</td><td>Quick sort no (long swaps); Python's Timsort yes</td></tr>
    <tr><td>Minimum worst-case comparisons to sort 8 items by comparing?</td><td>⌈log₂ 8!⌉ = ⌈15.3⌉ = 16</td></tr>
    <tr><td>Sort orders by restaurant A–Z, dearest first within each, in one call?</td><td><code>sorted(orders, key=lambda o: (o[2], -o[1]))</code></td></tr>
  </table>

  
<h2 id="dsa-so-qa"><span class="num">14</span>Questions &amp; Answers</h2>
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
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Timsort use insertion sort at all, if insertion sort is O(n²)?</summary><div class="qa-body">Insertion sort costs O(n + inversions). On a short piece (32–64 items) that is already nearly in order, there are few inversions and almost no overhead, so it beats merge sort's bookkeeping. Timsort uses it only to build short runs, then merges runs with merge sort, so the total stays O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does radix sort need a stable counting sort? What breaks if you skip stability?</summary><div class="qa-body">Each pass sorts by one digit and must keep the order built by the earlier (less significant) digits for ties. On the charges, after the tens pass 200 is before 250; the hundreds pass sees both as "2" and must keep 200 first. An unstable inner sort could swap them and the final list would be wrong.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: quickselect and quick sort use the same partition. Why is one O(n) and the other O(n log n)?</summary><div class="qa-body">After a partition the pivot is final. Quick sort must sort both sides; quickselect knows which side holds index k and drops the other. On the charges, the median search shrank 8 → 5 → 3 → 2 → 1 and never touched [310, 250]. Work n + n/2 + … &lt; 2n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the Binary Search note (next) need this note, and what breaks if you skip the sort?</summary><div class="qa-body">Binary search throws away half the list on the assumption that everything on the left is smaller. On the raw charges it looked at 310, threw the right half away, and reported ₹60 missing although order G is ₹60. Sorting (O(n log n) once) is what makes each later search O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: counting sort is O(n + k) and beats the n log n wall. Why not always use it?</summary><div class="qa-body">The wall is for sorts that compare; counting sort uses the value as an index, which only works for integer keys in a small range. The charges have k = 32 tens-of-rupees keys, so it is great. Sorting 10 phone numbers would need about 10¹⁰ piles: O(n + k) is then far worse than n log n.</div></details>
</main>
`
});
