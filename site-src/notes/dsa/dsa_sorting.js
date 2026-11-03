// notes/dsa/dsa_sorting.js — Sorting
Object.assign(TOPIC_CONTENT, {
  "dsa_sorting": `<main>
<h1>Sorting</h1>
  <div class="where"><span>DSA</span><span>Foundations</span><span>Sorting</span></div>
  <p class="lead">Sorting means putting items in order, smallest to largest or by any rule you choose. It matters far beyond "show prices low to high": binary search, two pointers, interval scheduling and many greedy answers only work on sorted data, so a huge number of interview solutions begin with the line "first, sort it". This page explains what actually happens inside that line and how fast it can possibly be. Our running example is the same one used in the Arrays and Hashing notes: Biteful, a food-delivery app, took eight orders today, labelled A to H in the order they arrived, with charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b> rupees. We will sort these eight numbers again and again, first the slow way a person would, then with merge sort, quick sort and counting sort, and finally with Python's own <code>sorted()</code>, so that each new idea is tried on numbers you already know.</p>

  <h2 id="dsa-so-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Sorting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why sort</div>
        <ul>
          <li>Pay O(n log n) once, then many questions become one look or one pass</li>
          <li>Binary search and two pointers silently fail on unsorted data</li>
          <li>After sorting, equal items and closest items are neighbours</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Comparison sorts</div>
        <ul>
          <li><b>Insertion</b>: O(n²), but O(n) on nearly sorted data</li>
          <li><b>Merge</b>: split, sort halves, merge; O(n log n) always, O(n) space, stable</li>
          <li><b>Quick</b>: partition around a pivot; O(n log n) average, O(n²) worst, in place</li>
          <li>No comparison sort beats about n log n comparisons</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Related ideas</div>
        <ul>
          <li><b>Quickselect</b>: kth smallest in O(n) average</li>
          <li><b>Stable</b>: equal keys keep their old order</li>
          <li><b>Counting / radix</b>: O(n + k) for small integer keys, no comparisons</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python</div>
        <ul>
          <li>Timsort: stable, O(n) on sorted input, O(n log n) worst</li>
          <li><code>sorted(x)</code> returns a new list; <code>x.sort()</code> returns None</li>
          <li><code>key=</code> with tuples; <code>cmp_to_key</code> for pair rules</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-so-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Sorted Data Matters</span><span class="rm-sub">what order buys, and what breaks without it</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-simple"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Simple Sorts: Insertion, Bubble, Selection</span><span class="rm-sub">how a person sorts, and why it is O(n²)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-merge"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Merge Sort</span><span class="rm-sub">split in half, sort each half, merge</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-quick"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Quick Sort</span><span class="rm-sub">partition around a pivot; the bad-pivot trap</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-select"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Quickselect</span><span class="rm-sub">one item without sorting everything</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-stable"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Stability</span><span class="rm-sub">what happens to the two ₹80 orders</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-bound"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The n log n Limit</span><span class="rm-sub">why no comparison sort can be faster</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-counting"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Counting Sort and Radix Sort</span><span class="rm-sub">sorting without comparing</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-python"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Sorting in Python</span><span class="rm-sub">Timsort, sorted vs sort, key, cmp_to_key</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns: Sort First, Then…</span><span class="rm-sub">spotting sorting inside an interview problem</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Practice Problems</span><span class="rm-sub">what to solve, in order, and what each teaches</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">None from .sort(), bad pivots, text vs numbers</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">costs, templates, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-so-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on sorting</span></div></div>
    </div>
  </div>

  <h2 id="dsa-so-why"><span class="num">01</span>Why Sorted Data Matters</h2>
  <p>Before learning how to sort, it is worth being clear about what sorting buys us, because sorting is never free and you should know what you are paying for. Our eight charges arrived in time order: A was ₹120, B ₹80, C ₹250, D ₹40, E ₹310, F ₹80, G ₹60 and H ₹200. In that order they are useful for "what happened first?", but almost useless for questions about the amounts themselves.</p>
  <p>Think of the voter list pasted outside a polling booth. It is sorted by name, so you can jump to the "R" section and stop as soon as you pass your own name. If the same list were printed in random order, you would have to read every line. Sorting is that one-time effort of arranging the list so that every later search is quick.</p>
  <p>Here is what goes wrong when a tool that expects sorted data meets unsorted data. Python's <code>bisect</code> module does binary search (the next note explains it fully): it looks at the middle item and throws away the half that cannot contain the answer. Watch it on the raw charges and then on the sorted ones:</p>
  <div class="fx" data-lang="py">import bisect
charges = [120, 80, 250, 40, 310, 80, 60, 200]   # orders A..H, in time order

def found(a, x):                                  # binary search: is x in a?
    i = bisect.bisect_left(a, x)
    return i &lt; len(a) and a[i] == x

print("raw list:    is 60 there?", found(charges, 60))
s = sorted(charges)
print("sorted list:", s)
print("sorted list: is 60 there?", found(s, 60))
print("cheapest, dearest, median:", s[0], s[-1], (s[3] + s[4]) / 2)
print("closest two amounts differ by", min(s[k + 1] - s[k] for k in range(len(s) - 1)))</div>
  <div class="fx" data-lang="text">raw list:    is 60 there? False
sorted list: [40, 60, 80, 80, 120, 200, 250, 310]
sorted list: is 60 there? True
cheapest, dearest, median: 40 310 100.0
closest two amounts differ by 0</div>
  <p>On the raw list, binary search says ₹60 is not there, even though order G is ₹60. It looked at a middle value, saw that 60 was smaller, and threw away the right half on the assumption that everything on the left is smaller. That assumption only holds for sorted data, and nothing warned us: there was no error, just a confident wrong answer. On the sorted list <code>[40, 60, 80, 80, 120, 200, 250, 310]</code> the search succeeds, and several other questions become trivial. The cheapest and dearest orders are simply the two ends. The median is the average of the middle pair, (80 + 120) / 2 = 100. Equal amounts now sit side by side, so the two ₹80 orders are neighbours and the closest pair of amounts differs by 0.</p>
  <p>So a <strong>sort</strong> is the rearrangement of items so that each one is less than or equal to the next, according to some rule (number, name, length, or any key you choose). Most sorting algorithms are <strong>comparison sorts</strong>, which means the only thing they ever do with two items is ask "is a smaller than b?". The table below shows what one O(n log n) sort turns into cheap work; you will meet each of these again in the Patterns section.</p>
  <table class="tbl">
    <tr><th>Task</th><th>On unsorted data</th><th>After one sort</th></tr>
    <tr><td>Is x present?</td><td>O(n) scan</td><td>O(log n) binary search</td></tr>
    <tr><td>Any duplicates? Closest pair?</td><td>O(n²) pairs (or a set for duplicates)</td><td>O(n): only neighbours need checking</td></tr>
    <tr><td>Two numbers adding to a target</td><td>O(n²) pairs (or a dict)</td><td>O(n) two pointers</td></tr>
    <tr><td>Median, kth smallest</td><td>O(n) average with quickselect</td><td>O(1): read the index</td></tr>
  </table>
  <p>The flip side is that sorting costs O(n log n), which is more than a single O(n) scan. If you only need the maximum, <code>max()</code> is cheaper than sorting; if you only need to look one value up once, a scan is cheaper. Sorting pays off when it makes many questions cheap, or when the rest of the algorithm depends on order.</p>

  <h2 id="dsa-so-simple"><span class="num">02</span>Simple Sorts: Insertion, Bubble, Selection</h2>
  <p>The most natural way to sort is the way you arrange playing cards. You pick up cards one at a time, and each new card is slid left into its correct place among the cards already in your hand. You never re-sort the whole hand; the cards in your hand are always in order, and the hand just grows. This is <strong>insertion sort</strong>: it keeps a sorted part on the left, takes the next item from the unsorted part on the right, and shifts bigger items one place right until the new item fits.</p>
  <p>The code below prints the list after each new card is placed. The part before the <code>|</code> is the sorted hand; the part after is still waiting.</p>
  <div class="fx" data-lang="py">def insertion_sort(a):
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
        print(f"pick {x:&gt;3}: {a[:i + 1]} | {a[i + 1:]}")
    return a, shifts

charges = [120, 80, 250, 40, 310, 80, 60, 200]
out, shifts = insertion_sort(charges)
print("shifts:", shifts)</div>
  <div class="fx" data-lang="text">pick  80: [80, 120] | [250, 40, 310, 80, 60, 200]
pick 250: [80, 120, 250] | [40, 310, 80, 60, 200]
pick  40: [40, 80, 120, 250] | [310, 80, 60, 200]
pick 310: [40, 80, 120, 250, 310] | [80, 60, 200]
pick  80: [40, 80, 80, 120, 250, 310] | [60, 200]
pick  60: [40, 60, 80, 80, 120, 250, 310] | [200]
pick 200: [40, 60, 80, 80, 120, 200, 250, 310] | []
shifts: 14</div>
  <p>Follow a few lines. Picking up 80, it slides past 120 (one shift). Picking up 250, nothing is bigger, so it stays put (zero shifts). Picking up 40, it slides past 250, 120 and 80 (three shifts) to the front. Picking up the second 80, it slides past 310, 250 and 120 and stops when it meets the first 80, because 80 is not bigger than 80. The total is 14 shifts. Each shift fixes exactly one pair of orders that were in the wrong order relative to each other. Such a pair is called an <strong>inversion</strong>: two positions i &lt; j where the earlier item is bigger. A sorted list has no inversions; a fully reversed list of n items has the maximum, n(n−1)/2. Insertion sort's work is exactly the number of inversions, so on our charges it is 14.</p>
  <p>Two other simple sorts are worth knowing because interviewers mention them. <strong>Bubble sort</strong> walks the list and swaps any neighbouring pair that is out of order; after one pass the biggest item has "bubbled" to the end, and you repeat on the rest. <strong>Selection sort</strong> finds the smallest item and swaps it to the front, then finds the smallest of the rest and swaps it to position 1, and so on. Let us count how many comparisons each one makes on three versions of our data:</p>
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
  <p>On today's charges, insertion sort needed 19 comparisons, bubble 27 and selection 28. On already-sorted charges, insertion and bubble (with its "stop if a pass made no swap" rule) each need only 7 = n − 1, one look at each neighbouring pair, while selection still does all 28 = 8·7/2, because it always scans the whole remainder to find the minimum. Reversed input is the worst case for all three.</p>
  <p>All three are <strong>O(n²)</strong> in the worst and average case: each item may be compared with every other item, which is about n²/2 comparisons. For 8 items that is nothing; for 10 lakh items it is about 5 × 10¹¹ comparisons, which would take many minutes. They use O(1) extra memory. Insertion and bubble sort keep equal items in their original order, a property called stability (section 06); selection sort does not. In practice only insertion sort is still used, and only for small or nearly sorted pieces, because its work is "n plus the number of inversions": on data that is almost in order, that is almost O(n). Python's own sort uses it for exactly this job, as we will see in section 09. The question for the next section is how to avoid comparing everything with everything.</p>

  <h2 id="dsa-so-merge"><span class="num">03</span>Merge Sort</h2>
  <p>Start with an easier job than sorting. Suppose the first four charges and the last four have each already been sorted: <code>[40, 80, 120, 250]</code> and <code>[60, 80, 200, 310]</code>. How do we combine them into one sorted list? Picture two class sections that have each lined up by roll number, and a teacher who wants one combined line. She does not re-sort everybody. She looks at the student at the front of each line, sends the smaller roll number forward, and repeats. Only the two front students are ever compared. This is a <strong>merge</strong>:</p>
  <div class="fx" data-lang="py">def merge(left, right):
    out, i, j = [], 0, 0
    while i &lt; len(left) and j &lt; len(right):
        if left[i] &lt;= right[j]:        # &lt;= : on a tie, take from the left first
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
        print(f"took {out[-1]:&gt;3}  out={out}")
    out.extend(left[i:])               # one side is used up;
    out.extend(right[j:])              # copy what is left of the other
    return out

print(merge([40, 80, 120, 250], [60, 80, 200, 310]))</div>
  <div class="fx" data-lang="text">took  40  out=[40]
took  60  out=[40, 60]
took  80  out=[40, 60, 80]
took  80  out=[40, 60, 80, 80]
took 120  out=[40, 60, 80, 80, 120]
took 200  out=[40, 60, 80, 80, 120, 200]
took 250  out=[40, 60, 80, 80, 120, 200, 250]
[40, 60, 80, 80, 120, 200, 250, 310]</div>
  <p>Each step compares the two front items and takes the smaller. When the fronts are the two ₹80 orders, the <code>&lt;=</code> takes the one from the left list first; that small choice keeps equal items in their original order and matters in section 06. After seven steps the left list is empty and the remaining 310 is copied over without any comparison. Merging two sorted lists of total length n therefore takes at most n − 1 comparisons, which is O(n).</p>
  <p>Merging is easy, but only if both halves are already sorted. How do we get sorted halves? By sorting each half the same way: split it in half again, and again, until every piece has one item. A single item is always sorted. Then merge the pieces back together, pairs into fours, fours into eights. This is <strong>merge sort</strong>, and it is the classic example of <strong>divide and conquer</strong>: split a problem into smaller copies of itself, solve those (usually by recursion, a function calling itself on a smaller input), and combine the answers.</p>
<figure class="viz"><svg viewBox="0 0 600 315" width="600" font-size="11"><line x1="300" y1="44" x2="168" y2="70" stroke="currentColor" stroke-opacity="0.5"/><line x1="300" y1="44" x2="432" y2="70" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="94" x2="118" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="94" x2="218" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="94" x2="382" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="94" x2="482" y2="120" stroke="currentColor" stroke-opacity="0.5"/><line x1="118" y1="204" x2="168" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="218" y1="204" x2="168" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="382" y1="204" x2="432" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="482" y1="204" x2="432" y2="230" stroke="currentColor" stroke-opacity="0.5"/><line x1="168" y1="254" x2="300" y2="280" stroke="currentColor" stroke-opacity="0.5"/><line x1="432" y1="254" x2="300" y2="280" stroke="currentColor" stroke-opacity="0.5"/><g class="fb sb"><rect x="164" y="20" width="34" height="24"/><rect x="198" y="20" width="34" height="24"/><rect x="232" y="20" width="34" height="24"/><rect x="266" y="20" width="34" height="24"/><rect x="300" y="20" width="34" height="24"/><rect x="334" y="20" width="34" height="24"/><rect x="368" y="20" width="34" height="24"/><rect x="402" y="20" width="34" height="24"/></g><g text-anchor="middle"><text x="181" y="36">120</text><text x="215" y="36">80</text><text x="249" y="36">250</text><text x="283" y="36">40</text><text x="317" y="36">310</text><text x="351" y="36">80</text><text x="385" y="36">60</text><text x="419" y="36">200</text></g><g class="fb sb"><rect x="100" y="70" width="34" height="24"/><rect x="134" y="70" width="34" height="24"/><rect x="168" y="70" width="34" height="24"/><rect x="202" y="70" width="34" height="24"/></g><g text-anchor="middle"><text x="117" y="86">120</text><text x="151" y="86">80</text><text x="185" y="86">250</text><text x="219" y="86">40</text></g><g class="fb sb"><rect x="364" y="70" width="34" height="24"/><rect x="398" y="70" width="34" height="24"/><rect x="432" y="70" width="34" height="24"/><rect x="466" y="70" width="34" height="24"/></g><g text-anchor="middle"><text x="381" y="86">310</text><text x="415" y="86">80</text><text x="449" y="86">60</text><text x="483" y="86">200</text></g><g class="fb sb"><rect x="84" y="120" width="34" height="24"/><rect x="118" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="101" y="136">120</text><text x="135" y="136">80</text></g><g class="fb sb"><rect x="184" y="120" width="34" height="24"/><rect x="218" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="201" y="136">250</text><text x="235" y="136">40</text></g><g class="fb sb"><rect x="348" y="120" width="34" height="24"/><rect x="382" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="365" y="136">310</text><text x="399" y="136">80</text></g><g class="fb sb"><rect x="448" y="120" width="34" height="24"/><rect x="482" y="120" width="34" height="24"/></g><g text-anchor="middle"><text x="465" y="136">60</text><text x="499" y="136">200</text></g><g class="fg sg"><rect x="84" y="180" width="34" height="24"/><rect x="118" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="101" y="196">80</text><text x="135" y="196">120</text></g><g class="fg sg"><rect x="184" y="180" width="34" height="24"/><rect x="218" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="201" y="196">40</text><text x="235" y="196">250</text></g><g class="fg sg"><rect x="348" y="180" width="34" height="24"/><rect x="382" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="365" y="196">80</text><text x="399" y="196">310</text></g><g class="fg sg"><rect x="448" y="180" width="34" height="24"/><rect x="482" y="180" width="34" height="24"/></g><g text-anchor="middle"><text x="465" y="196">60</text><text x="499" y="196">200</text></g><g class="fg sg"><rect x="100" y="230" width="34" height="24"/><rect x="134" y="230" width="34" height="24"/><rect x="168" y="230" width="34" height="24"/><rect x="202" y="230" width="34" height="24"/></g><g text-anchor="middle"><text x="117" y="246">40</text><text x="151" y="246">80</text><text x="185" y="246">120</text><text x="219" y="246">250</text></g><g class="fg sg"><rect x="364" y="230" width="34" height="24"/><rect x="398" y="230" width="34" height="24"/><rect x="432" y="230" width="34" height="24"/><rect x="466" y="230" width="34" height="24"/></g><g text-anchor="middle"><text x="381" y="246">60</text><text x="415" y="246">80</text><text x="449" y="246">200</text><text x="483" y="246">310</text></g><g class="fg sg"><rect x="164" y="280" width="34" height="24"/><rect x="198" y="280" width="34" height="24"/><rect x="232" y="280" width="34" height="24"/><rect x="266" y="280" width="34" height="24"/><rect x="300" y="280" width="34" height="24"/><rect x="334" y="280" width="34" height="24"/><rect x="368" y="280" width="34" height="24"/><rect x="402" y="280" width="34" height="24"/></g><g text-anchor="middle"><text x="181" y="296">40</text><text x="215" y="296">60</text><text x="249" y="296">80</text><text x="283" y="296">80</text><text x="317" y="296">120</text><text x="351" y="296">200</text><text x="385" y="296">250</text><text x="419" y="296">310</text></g><text x="10" y="36" class="tb">split</text><text x="10" y="86" class="tb">split</text><text x="10" y="136" class="tb">split</text><line x1="20" y1="164" x2="580" y2="164" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.4"/><text x="300" y="159" class="tm" text-anchor="middle">split pairs into single items (always sorted), then merge upward</text><text x="10" y="196" class="tg">merge</text><text x="10" y="246" class="tg">merge</text><text x="10" y="296" class="tg">merge</text></svg><figcaption>Merge sort on the 8 charges. Blue: keep cutting in half (log₂ 8 = 3 levels). Green: merge sorted halves back together. Each level touches all 8 charges once, so the total work is n × log n.</figcaption></figure>
  <p>The picture shows the whole process on our charges. The blue rows are the splitting: 8 items become two lists of 4, then four lists of 2, then single items. The green rows are the merging on the way back up. The code below does the same recursion and prints each merge as it happens; the indentation shows how deep in the recursion each merge is.</p>
  <div class="fx" data-lang="py">def merge_sort(a, depth=0):
    if len(a) &lt;= 1:                    # 0 or 1 item: already sorted
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid], depth + 1)
    right = merge_sort(a[mid:], depth + 1)
    out = merge(left, right)
    print("    " * depth + f"merge {left} + {right} -&gt; {out}")
    return out

merge_sort(charges)</div>
  <div class="fx" data-lang="text">        merge [120] + [80] -&gt; [80, 120]
        merge [250] + [40] -&gt; [40, 250]
    merge [80, 120] + [40, 250] -&gt; [40, 80, 120, 250]
        merge [310] + [80] -&gt; [80, 310]
        merge [60] + [200] -&gt; [60, 200]
    merge [80, 310] + [60, 200] -&gt; [60, 80, 200, 310]
merge [40, 80, 120, 250] + [60, 80, 200, 310] -&gt; [40, 60, 80, 80, 120, 200, 250, 310]</div>
  <p>The first merges happen at the deepest level: [120] and [80] become [80, 120], and [250] and [40] become [40, 250]. Those two pairs are merged into [40, 80, 120, 250], which is the left half we merged by hand above. The right half is built the same way, and the final line is the merge we already traced.</p>
  <p>Why is this fast? Count the levels in the picture: 8 → 4 → 2 → 1 is three halvings, and three is log₂ 8. On each level, the merges together touch every item once, which is n work. So the total is n work on each of log n levels, <strong>O(n log n)</strong>, and that is true for every input, sorted, reversed or random. For a million items that is about 20 million steps instead of the 5 × 10¹¹ an O(n²) sort needs. The cost is memory: each merge writes into a new list, so merge sort needs O(n) extra space. It is stable, as long as the merge uses <code>&lt;=</code>.</p>
  <p>Merge sort has a famous side use. While merging, whenever an item is taken from the right half, every item still waiting in the left half is bigger than it and came before it, so each of those is one inversion. Adding up <code>len(left) − i</code> at those moments counts all inversions in O(n log n) instead of checking all pairs in O(n²):</p>
  <div class="fx" data-lang="py">def count_inversions(a):
    if len(a) &lt;= 1:
        return a, 0
    mid = len(a) // 2
    left, inv_left = count_inversions(a[:mid])
    right, inv_right = count_inversions(a[mid:])
    out, i, j, cross = [], 0, 0, 0
    while i &lt; len(left) and j &lt; len(right):
        if left[i] &lt;= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
            cross += len(left) - i      # every item still waiting on the left is bigger
    out += left[i:] + right[j:]
    return out, inv_left + inv_right + cross

print(count_inversions(charges)[1], count_inversions([1, 2, 3])[1], count_inversions([3, 2, 1])[1])</div>
  <div class="fx" data-lang="text">14 0 3</div>
  <p>The charges have 14 inversions, the same 14 shifts insertion sort made. This "count while merging" trick is behind interview problems such as Count Inversions, Count of Smaller Numbers After Self and Reverse Pairs. Merge sort is also the natural way to sort a linked list, because merging only ever walks forward and never needs to jump to an index. In an interview, think of merge sort when you hear "guaranteed O(n log n)", "stable", "sort a linked list", "count pairs i &lt; j with a[i] &gt; a[j]", or "data too big for memory" (sort chunks, then merge them).</p>

  <h2 id="dsa-so-quick"><span class="num">04</span>Quick Sort</h2>
  <p>Merge sort splits the list blindly down the middle and does all the real work afterwards, while merging, which is why it needs a second list. Quick sort turns this around: it does the work while splitting, splitting by <em>value</em> so cleverly that no merge step is needed at all. Imagine a PT teacher who wants a class in height order. She picks one student, Ravi, and says "everyone shorter than Ravi stand on his left, everyone taller on his right". Ravi is now standing exactly where he belongs in the final line, and nobody on his left will ever need to swap with anybody on his right. She then repeats the same trick inside each group.</p>
  <p>The chosen item is called the <strong>pivot</strong>, and the step "smaller items to the left, bigger to the right, pivot in between" is called <strong>partition</strong>. <strong>Quick sort</strong> is simply: partition, then quick sort the left part, then quick sort the right part.</p>
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
  <p>The easiest partition to write is called <strong>Lomuto's scheme</strong>. It uses the last item as the pivot and keeps a marker <code>i</code> meaning "the next slot for a small item". A second index <code>j</code> walks across the list; whenever it finds an item smaller than the pivot, that item is swapped into slot <code>i</code> and <code>i</code> moves on. At the end, the pivot is swapped into slot <code>i</code>, which is exactly where it belongs.</p>
  <div class="fx" data-lang="py">def lomuto_partition(a, lo, hi):
    pivot = a[hi]                       # last item is the pivot
    i = lo                              # a[lo:i] holds items smaller than the pivot
    for j in range(lo, hi):
        if a[j] &lt; pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
            print(f"{a[i-1]:&gt;3} &lt; {pivot}: swap into slot {i-1}  {a}")
        else:
            print(f"{a[j]:&gt;3} &gt;= {pivot}: leave it        {a}")
    a[i], a[hi] = a[hi], a[i]           # pivot goes to its final spot
    return i

a = [120, 80, 250, 40, 310, 80, 60, 200]
p = lomuto_partition(a, 0, len(a) - 1)
print("left:", a[:p], " pivot:", a[p], " right:", a[p + 1:])</div>
  <div class="fx" data-lang="text">120 &lt; 200: swap into slot 0  [120, 80, 250, 40, 310, 80, 60, 200]
 80 &lt; 200: swap into slot 1  [120, 80, 250, 40, 310, 80, 60, 200]
250 &gt;= 200: leave it        [120, 80, 250, 40, 310, 80, 60, 200]
 40 &lt; 200: swap into slot 2  [120, 80, 40, 250, 310, 80, 60, 200]
310 &gt;= 200: leave it        [120, 80, 40, 250, 310, 80, 60, 200]
 80 &lt; 200: swap into slot 3  [120, 80, 40, 80, 310, 250, 60, 200]
 60 &lt; 200: swap into slot 4  [120, 80, 40, 80, 60, 250, 310, 200]
left: [120, 80, 40, 80, 60]  pivot: 200  right: [310, 250]</div>
  <p>The pivot is ₹200. The walk finds 120 and 80 already at the front (they swap with themselves), leaves 250 alone, then finds 40 and swaps it into slot 2 so that 250 moves right, and so on. After seven comparisons, one per non-pivot item, 200 is swapped into slot 5. Everything to its left is smaller (in no particular order) and everything to its right is bigger. Slot 5 is exactly where 200 sits in the final sorted list, so 200 is finished and will never move again.</p>
  <p>Quick sort now recurses on the left five items and the right two. When every pivot splits its range roughly in half, there are about log n levels of n work, so the cost is O(n log n), just like merge sort, but with no second list: the swaps happen inside the original list, which is called sorting <strong>in place</strong>. The only extra memory is the recursion, O(log n) deep on average. That, plus very fast inner loops, is why quick sort is often the fastest sort in practice for arrays in memory.</p>
  <div class="fx" data-lang="py">import random

def quick_sort(a, lo=0, hi=None, random_pivot=True, sizes=None):
    if hi is None:
        hi = len(a) - 1
    if lo &lt; hi:
        if random_pivot:
            r = random.randint(lo, hi)  # random pivot: no input is reliably bad
            a[r], a[hi] = a[hi], a[r]
        if sizes is not None:
            sizes.append(hi - lo + 1)
        p = lomuto_partition(a, lo, hi)
        quick_sort(a, lo, p - 1, random_pivot, sizes)
        quick_sort(a, p + 1, hi, random_pivot, sizes)

b = charges[:]
quick_sort(b)
print("quick sorted:", b)

sizes = []
quick_sort(sorted(charges), random_pivot=False, sizes=sizes)   # sorted input, last pivot
print("already sorted input, partition sizes:", sizes)</div>
  <div class="fx" data-lang="text">quick sorted: [40, 60, 80, 80, 120, 200, 250, 310]
already sorted input, partition sizes: [8, 7, 6, 5, 4, 2]</div>
  <p>The first line sorts the charges with a random pivot. The second line shows quick sort's weakness. When the input is <em>already sorted</em> and the last item is always the pivot, every pivot is the biggest item in its range, so nothing ever lands on its right. Each partition removes only one item: the sizes go 8, 7, 6, 5, 4, 2 instead of halving. The total work becomes n + (n−1) + (n−2) + … ≈ n²/2, which is <strong>O(n²)</strong>, the worst case. On a bigger list the difference is dramatic:</p>
  <div class="fx" data-lang="py">import random, math

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
  <p>On 2,000 already-sorted numbers, a fixed last-item pivot costs almost two million comparisons, exactly n²/2, while a random pivot costs about 24 thousand, close to n log₂ n. A <strong>random pivot</strong> means that no particular input is reliably bad; an unlucky run is possible in theory but astronomically unlikely in practice. The third line shows a second trap: if all items are equal, Lomuto's scheme still does n²/2 work even with a random pivot, because no item is "smaller than the pivot", so the pivot always lands at one end.</p>
  <p>The fix for duplicates is a <strong>three-way partition</strong>, which splits the range into three zones, less than the pivot, equal to it, and greater, so that all the equal items are finished in one go. It uses three markers: everything before <code>low</code> is smaller, everything from <code>low</code> up to <code>mid</code> is equal, everything after <code>high</code> is bigger, and <code>mid</code> walks through the unknown middle. This is Dijkstra's "Dutch national flag" algorithm, named after the three-coloured flag:</p>
  <div class="fx" data-lang="py">def three_way_partition(a, pivot):
    low, mid, high = 0, 0, len(a) - 1   # [0,low) &lt; pivot, [low,mid) == pivot, (high,end] &gt; pivot
    while mid &lt;= high:
        if a[mid] &lt; pivot:
            a[low], a[mid] = a[mid], a[low]
            low += 1; mid += 1
        elif a[mid] == pivot:
            mid += 1
        else:
            a[mid], a[high] = a[high], a[mid]
            high -= 1                   # mid stays: the item that came from high is unchecked
    return low, mid

a = [120, 80, 250, 80, 310, 80, 60, 200]     # a day with three Rs 80 orders
low, mid = three_way_partition(a, 80)
print(a[:low], a[low:mid], a[mid:])

colors = [2, 0, 2, 1, 1, 0]                   # LeetCode 75: Sort Colors is the same loop
three_way_partition(colors, 1)
print(colors)</div>
  <div class="fx" data-lang="text">[60] [80, 80, 80] [310, 250, 200, 120]
[0, 0, 1, 1, 2, 2]</div>
  <p>On a day with three ₹80 orders, partitioning around 80 puts 60 on the left, all three 80s together in the middle, and the bigger charges on the right. Quick sort would then recurse only on the left and right zones, never on the equal ones. Notice the one subtle line: when a big item is swapped to <code>high</code>, <code>mid</code> does not move, because the item that just arrived from <code>high</code> has not been checked yet. The second run sorts a list of 0s, 1s and 2s in a single pass, which is exactly LeetCode 75, Sort Colors.</p>
  <p>(There is a third partition scheme you may hear about, <strong>Hoare's</strong>, which moves two pointers inward from both ends and swaps a too-big item on the left with a too-small item on the right. It makes fewer swaps and copes well with duplicates, but the pivot does not end at a known index, so it is easier to get wrong in an interview.)</p>
  <table class="tbl">
    <tr><th></th><th>Merge sort</th><th>Quick sort</th></tr>
    <tr><td>Time</td><td>O(n log n) always</td><td>O(n log n) average, O(n²) worst</td></tr>
    <tr><td>Extra space</td><td>O(n)</td><td>O(log n) recursion, in place</td></tr>
    <tr><td>Stable?</td><td>Yes</td><td>No (partition swaps over long distances)</td></tr>
    <tr><td>Best for</td><td>linked lists, huge files, when stability or a guarantee matters</td><td>arrays in memory, with a random pivot</td></tr>
  </table>
  <p>In an interview, the words "in place", "partition around x", "move all smaller items to the left" or "0s, 1s and 2s" point to the partition step, even when nobody says "quick sort".</p>

  <h2 id="dsa-so-select"><span class="num">05</span>Quickselect</h2>
  <p>Often we do not need the whole list sorted, only one item from it: the median charge of the day, or the third most expensive order. Sorting everything costs O(n log n), but partition offers a shortcut. After one partition, the pivot is at its final index <code>p</code>. If we want the item that belongs at index <code>k</code> and <code>k &lt; p</code>, the answer must be somewhere on the left, and the right side can be forgotten completely. If <code>k &gt; p</code>, the left side can be forgotten. This is <strong>quickselect</strong>: quick sort that only ever goes into one side.</p>
  <p>Think of looking for the 10th tallest student. The teacher splits the class around Ravi and finds 25 students taller than him. The 10th tallest must be among those 25, so the shorter group can go back to class; there is no point arranging them.</p>
  <div class="fx" data-lang="py">def quickselect(nums, k):
    """k-th smallest item, k counted from 0."""
    a = nums[:]
    lo, hi = 0, len(a) - 1
    while True:
        p = lomuto_partition(a, lo, hi)  # last item as pivot (random in real code)
        print(f"range [{lo}..{hi}]: pivot {a[p]} lands at {p}")
        if p == k:
            return a[p]
        if k &lt; p:
            hi = p - 1                   # answer is on the left; forget the right
        else:
            lo = p + 1                   # answer is on the right; forget the left

print("lower median (index 3):", quickselect(charges, 3))
print("3rd most expensive (index 8 - 3 = 5):", quickselect(charges, 5))</div>
  <div class="fx" data-lang="text">range [0..7]: pivot 200 lands at 5
range [0..4]: pivot 60 lands at 1
range [2..4]: pivot 80 lands at 2
range [3..4]: pivot 120 lands at 4
range [3..3]: pivot 80 lands at 3
lower median (index 3): 80
range [0..7]: pivot 200 lands at 5
3rd most expensive (index 8 - 3 = 5): 200</div>
  <p>For the lower median (index 3 of the sorted list), the first pivot 200 lands at 5, so the answer is on the left and the right side [310, 250] is dropped for good. Then 60 lands at 1, so we go right; 80 lands at 2, right again; 120 lands at 4, left; and finally 80 lands at 3, which is k. The ranges shrank 8 → 5 → 3 → 2 → 1. For the third most expensive order, its index in sorted order is n − 3 = 5, and the very first pivot, 200, lands at 5, so one pass was enough.</p>
  <p>Why is this O(n) on average when quick sort is O(n log n)? Quick sort must process both sides of every pivot, so every level of recursion costs n. Quickselect follows only one side, so with reasonable pivots the work is n + n/2 + n/4 + …, which adds up to less than 2n. With unlucky pivots the worst case is still O(n²), which a random pivot makes extremely unlikely, and the three-way partition from the previous section protects it from duplicates. Compare the three ways to get the kth item: sort and index is O(n log n); a heap of size k (the <a class="xref" data-note="dsa_heaps">Heaps</a> note) is O(n log k) and works on a stream of data; quickselect is O(n) on average and works in place. Interview wording that points here: "kth largest", "kth smallest", "median", "top k" when the order among the top k does not matter, and "k closest points". Be careful with the index: the kth <em>largest</em> is index n − k in sorted order, and the kth smallest is index k − 1.</p>

  <h2 id="dsa-so-stable"><span class="num">06</span>Stability</h2>
  <p>Orders B and F both cost ₹80, and B came first in the day. After sorting by amount, is B still before F? With plain numbers nobody can tell the two 80s apart, so the question does not matter. But real orders are records that carry more than the amount, such as an order id, a time and a restaurant, and then it does matter which one comes first.</p>
  <p>A sort is <strong>stable</strong> if items with equal keys come out in the same relative order they went in. Think of a queue at a ration shop being rearranged by token colour. A fair shopkeeper keeps people with the same colour in the order they arrived; an unfair one lets someone jump ahead of another person with the same colour. Python's <code>sorted()</code> is the fair shopkeeper. Selection sort is not:</p>
  <div class="fx" data-lang="py">orders = [("A", 120), ("B", 80), ("C", 250), ("D", 40),
          ("E", 310), ("F", 80), ("G", 60), ("H", 200)]     # in time order

def selection_sort(a, key):              # swaps over long distances
    a = a[:]
    for i in range(len(a)):
        m = min(range(i, len(a)), key=lambda j: key(a[j]))
        a[i], a[m] = a[m], a[i]
    return a

print("sorted()      :", [o[0] for o in sorted(orders, key=lambda o: o[1])])
print("selection sort:", [o[0] for o in selection_sort(orders, key=lambda o: o[1])])</div>
  <div class="fx" data-lang="text">sorted()      : ['D', 'G', 'B', 'F', 'A', 'H', 'C', 'E']
selection sort: ['D', 'G', 'F', 'B', 'A', 'H', 'C', 'E']</div>
  <p>Python's sort keeps B before F. Selection sort puts F before B. To see why, follow its second round: it looks for the smallest item from slot 1 onwards, finds G (₹60) and swaps it with B, which sends B all the way to G's old slot 6, behind F. One long-distance swap jumped B over an equal item. Quick sort's partition makes the same kind of long swaps, which is why quick sort is not stable either. Merge sort with <code>&lt;=</code> and insertion sort only ever move an item past bigger items, so they never reorder equal ones.</p>
  <p>Stability is what makes sorting by several keys work. Suppose finance wants the orders grouped by restaurant, and within each restaurant the dearest first. With a stable sort you can do it in two passes: sort by the <em>less</em> important key first (amount, dearest first), then by the more important key (restaurant). The second sort decides the main order, and because it is stable, orders from the same restaurant keep the order the first pass gave them.</p>
  <div class="fx" data-lang="py">orders = [("A", 120, "Dosa Hut"), ("B", 80, "Chai Point"), ("C", 250, "Biryani Bros"),
          ("D", 40, "Chai Point"), ("E", 310, "Biryani Bros"), ("F", 80, "Dosa Hut"),
          ("G", 60, "Chai Point"), ("H", 200, "Dosa Hut")]

step1 = sorted(orders, key=lambda o: o[1], reverse=True)   # minor key first: dearest first
step2 = sorted(step1, key=lambda o: o[2])                  # then major key: restaurant
for o in step2:
    print(o)
print(step2 == sorted(orders, key=lambda o: (o[2], -o[1])))   # one tuple key does the same</div>
  <div class="fx" data-lang="text">('E', 310, 'Biryani Bros')
('C', 250, 'Biryani Bros')
('B', 80, 'Chai Point')
('G', 60, 'Chai Point')
('D', 40, 'Chai Point')
('H', 200, 'Dosa Hut')
('A', 120, 'Dosa Hut')
('F', 80, 'Dosa Hut')
True</div>
  <p>The restaurants come out A to Z, and inside each one the amounts are still in descending order from the first pass. The last line confirms that one sort with a tuple key, <code>(restaurant, -amount)</code>, gives the same result in a single pass; negating the amount flips that part of the order. The two-pass method is still useful when the minor key cannot be negated, for example a string you want in reverse order. The rule to remember is "minor key first, major key last". Of the sorts in this note, insertion, bubble, merge, counting, radix and Python's Timsort are stable; selection, quick and heap sort (in their usual in-place forms) are not.</p>

  <h2 id="dsa-so-bound"><span class="num">07</span>The n log n Limit</h2>
  <p>Merge sort, heap sort and quick sort on average are all O(n log n). Is that because nobody has been clever enough yet, or is there a real limit? There is a real limit, and the argument is short enough to give in an interview.</p>
  <p>A comparison sort learns about the input only by asking yes/no questions of the form "is a &lt; b?". Think of the game where a friend picks a number between 1 and 1,000 and answers your guesses with "higher" or "lower". Even the best player needs about 10 questions, because each answer can at best cut the remaining possibilities in half, and 2¹⁰ = 1,024. A sorting algorithm is playing the same game, except the thing it must identify is which of all the possible orderings of the input it was given.</p>
<figure class="viz"><svg viewBox="0 0 600 250" width="600"><line x1="300" y1="40" x2="160" y2="86" stroke="currentColor" stroke-opacity="0.6"/><text x="215" y="58" class="tm" text-anchor="middle">yes</text><line x1="300" y1="40" x2="440" y2="86" stroke="currentColor" stroke-opacity="0.6"/><text x="385" y="58" class="tm" text-anchor="middle">no</text><line x1="160" y1="112" x2="80" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="105" y="128" class="tm" text-anchor="middle">yes</text><line x1="160" y1="112" x2="230" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="210" y="128" class="tm" text-anchor="middle">no</text><line x1="440" y1="112" x2="370" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="390" y="128" class="tm" text-anchor="middle">yes</text><line x1="440" y1="112" x2="520" y2="150" stroke="currentColor" stroke-opacity="0.6"/><text x="495" y="128" class="tm" text-anchor="middle">no</text><line x1="230" y1="176" x2="190" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="195" y="192" class="tm" text-anchor="middle">yes</text><line x1="230" y1="176" x2="270" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="265" y="192" class="tm" text-anchor="middle">no</text><line x1="520" y1="176" x2="480" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="485" y="192" class="tm" text-anchor="middle">yes</text><line x1="520" y1="176" x2="560" y2="210" stroke="currentColor" stroke-opacity="0.6"/><text x="555" y="192" class="tm" text-anchor="middle">no</text><rect x="265.0" y="16" width="70" height="26" rx="13" class="fb sb"/><text x="300" y="34" text-anchor="middle">a &lt; b ?</text><rect x="125.0" y="86" width="70" height="26" rx="13" class="fb sb"/><text x="160" y="104" text-anchor="middle">b &lt; c ?</text><rect x="405.0" y="86" width="70" height="26" rx="13" class="fb sb"/><text x="440" y="104" text-anchor="middle">a &lt; c ?</text><rect x="50" y="149" width="60" height="24" class="fg sg"/><text x="80" y="166" text-anchor="middle">a b c</text><rect x="195.0" y="150" width="70" height="26" rx="13" class="fb sb"/><text x="230" y="168" text-anchor="middle">a &lt; c ?</text><rect x="340" y="149" width="60" height="24" class="fg sg"/><text x="370" y="166" text-anchor="middle">b a c</text><rect x="485.0" y="150" width="70" height="26" rx="13" class="fb sb"/><text x="520" y="168" text-anchor="middle">b &lt; c ?</text><rect x="160" y="209" width="60" height="24" class="fg sg"/><text x="190" y="226" text-anchor="middle">a c b</text><rect x="240" y="209" width="60" height="24" class="fg sg"/><text x="270" y="226" text-anchor="middle">c a b</text><rect x="450" y="209" width="60" height="24" class="fg sg"/><text x="480" y="226" text-anchor="middle">b c a</text><rect x="530" y="209" width="60" height="24" class="fg sg"/><text x="560" y="226" text-anchor="middle">c b a</text><text x="10" y="246" class="tm">3! = 6 orders → at least log₂ 6 ≈ 2.6, so 3 questions worst case</text></svg><figcaption>Any sort that only asks "is x &lt; y?" is a yes/no tree. Each leaf is one possible order of a, b, c. With n items there are n! leaves, so the tree must be at least log₂(n!) ≈ n log n deep.</figcaption></figure>
  <p>The picture shows every possible run of a sort on three items a, b, c as a tree of questions. Each path from the top ends at a leaf, and each leaf is one of the 3! = 6 possible orderings. Some paths need three questions, so three items need 3 comparisons in the worst case. In general, n items can be arranged in n! ways, so the tree must have at least n! leaves. A tree of yes/no questions that is d questions deep has at most 2^d leaves. So 2^d ≥ n!, which means d ≥ log₂(n!), and log₂(n!) grows like n log₂ n:</p>
  <div class="fx" data-lang="py">import math
for n in [3, 8, 1000, 1_000_000]:
    need = math.lgamma(n + 1) / math.log(2)          # log2(n!) without building n!
    print(f"n={n:&gt;9,}  log2(n!) = {need:&gt;12,.1f}   n*log2(n) = {n * math.log2(n):&gt;12,.1f}")</div>
  <div class="fx" data-lang="text">n=        3  log2(n!) =          2.6   n*log2(n) =          4.8
n=        8  log2(n!) =         15.3   n*log2(n) =         24.0
n=    1,000  log2(n!) =      8,529.4   n*log2(n) =      9,965.8
n=1,000,000  log2(n!) = 18,488,884.8   n*log2(n) = 19,931,568.6</div>
  <p>For our 8 charges, log₂(8!) is about 15.3, so any comparison sort needs at least 16 comparisons on its worst input; 8! = 40,320 orderings cannot be told apart with 15 questions, because 2¹⁵ = 32,768. For a million items the bound is about 18.5 million comparisons, against n log₂ n ≈ 19.9 million: the same growth. This is the <strong>lower bound</strong> for comparison sorting, written Ω(n log n) (Ω means "at least this, up to a constant"). Merge sort and heap sort reach it, so they are optimal comparison sorts.</p>
  <p>Two things the bound does not say are commonly confused in interviews. It is about the <em>worst case</em>, so it does not stop Timsort from sorting already-sorted input with n − 1 comparisons. And it only applies to sorts that learn by comparing, which leaves a way around it.</p>

  <h2 id="dsa-so-counting"><span class="num">08</span>Counting Sort and Radix Sort</h2>
  <p>A teacher has 500 answer sheets with marks from 0 to 100. She does not compare sheets with each other. She makes 101 piles, one per possible mark, drops each sheet onto its pile, and then picks the piles up in order. Every sheet is touched once and no two sheets are ever compared. This is <strong>counting sort</strong>: when the keys are small whole numbers, the key itself says where an item goes, so the n log n limit does not apply.</p>
  <p>Every Biteful charge is a multiple of ₹10, so <code>charge // 10</code> is a whole number between 4 and 31. Counting sort makes one counter per possible key, counts how many items have each key, and then reads the counters in order:</p>
  <div class="fx" data-lang="py">def counting_sort(keys, max_key):
    count = [0] * (max_key + 1)
    for k in keys:                      # one pile per possible key
        count[k] += 1
    return [k for k, c in enumerate(count) for _ in range(c)]

charges = [120, 80, 250, 40, 310, 80, 60, 200]
tens = [c // 10 for c in charges]       # every charge is a multiple of 10
print("keys:       ", tens)
print("sorted keys:", counting_sort(tens, max(tens)))</div>
  <div class="fx" data-lang="text">keys:        [12, 8, 25, 4, 31, 8, 6, 20]
sorted keys: [4, 6, 8, 8, 12, 20, 25, 31]</div>
  <p>The keys 4, 6, 8, 8, 12, 20, 25, 31 come out in order, which is ₹40, 60, 80, 80, 120, 200, 250, 310, with no comparisons between charges at all. The cost is O(n) to count plus O(k) to read k counters, written <strong>O(n + k)</strong>, where k is the range of possible keys. That is excellent when k is small (marks, ages, star ratings, the 26 lowercase letters) and terrible when it is huge: sorting ten phone numbers this way would need ten billion counters.</p>
  <p>Counting only works directly for bare numbers. To sort whole records by a small key, and keep equal keys in order, we turn the counts into starting positions with a running total (a prefix sum, from the Arrays note): <code>start[v]</code> is how many items have a key smaller than v, which is exactly the slot where the first item with key v should go. Each Biteful order also has a customer star rating from 1 to 5:</p>
  <div class="fx" data-lang="py">def counting_sort_by(items, key, k):
    count = [0] * k
    for it in items:
        count[key(it)] += 1
    start, total = [0] * k, 0
    for v in range(k):                  # start[v] = how many keys are smaller than v
        start[v], total = total, total + count[v]
    out = [None] * len(items)
    for it in items:                    # left to right keeps ties in their old order
        out[start[key(it)]] = it
        start[key(it)] += 1
    return out

# each order with the customer's star rating, 1..5
orders = [("A", 120, 4), ("B", 80, 5), ("C", 250, 3), ("D", 40, 5),
          ("E", 310, 4), ("F", 80, 2), ("G", 60, 5), ("H", 200, 3)]
print([(o[0], o[2]) for o in counting_sort_by(orders, key=lambda o: o[2], k=6)])</div>
  <div class="fx" data-lang="text">[('F', 2), ('C', 3), ('H', 3), ('A', 4), ('E', 4), ('B', 5), ('D', 5), ('G', 5)]</div>
  <p>There is one 2★ order, two 3★, two 4★ and three 5★, so the 2★ group starts at slot 0, 3★ at slot 1, 4★ at slot 3 and 5★ at slot 5. Walking through the orders from left to right and dropping each one into the next free slot of its group keeps time order inside each group: among the 5★ orders, B, D, G appear in the order they arrived. So this version is stable.</p>
  <p>Stability is what makes <strong>radix sort</strong> possible. Radix sort sorts numbers one digit at a time using a stable counting sort, starting from the <em>last</em> digit: first by the ones digit, then by the tens, then by the hundreds. Each pass has only 10 possible keys, so it is cheap, and because each pass is stable, numbers that tie on the current digit keep the order the earlier digits gave them.</p>
  <div class="fx" data-lang="py">def radix_sort(nums, base=10):
    out, place = nums[:], 1
    while place &lt;= max(nums):
        out = counting_sort_by(out, key=lambda x: (x // place) % base, k=base)
        print(f"by digit {place:&gt;3}: {out}")
        place *= base
    return out

radix_sort([170, 45, 75, 90, 802, 24, 2, 66])</div>
  <div class="fx" data-lang="text">by digit   1: [170, 90, 802, 2, 24, 45, 75, 66]
by digit  10: [802, 2, 24, 45, 66, 170, 75, 90]
by digit 100: [2, 24, 45, 66, 75, 90, 170, 802]</div>
  <p>After the ones pass, the numbers are ordered by their last digit only (170 and 90 end in 0, 802 and 2 end in 2, and so on). After the tens pass, 802 and 2 both have tens digit 0 and stay in the order the first pass left them. After the hundreds pass, the list is fully sorted. If the inner sort were not stable, a later pass could swap two numbers that tie on its digit and undo the work of the earlier passes. With d digits in base b, radix sort costs O(d · (n + b)). It suits fixed-length keys such as integers of bounded size, dates and fixed-width codes. In interview problems, phrases like "values are between 0 and 100", "lowercase letters", "ages" or "must run in O(n)" are the hint that counting or bucketing beats sorting.</p>

  <h2 id="dsa-so-python"><span class="num">09</span>Sorting in Python</h2>
  <p>In real code, and in most interviews unless you are asked to implement a sort, you call <code>sorted()</code> or <code>list.sort()</code>. It is worth knowing what that does inside, because it explains several interview answers. Python's sort is <strong>Timsort</strong>, designed by Tim Peters in 2002 and also used by Java for sorting objects. It is built from two algorithms you already know. Real data is rarely random; logs arrive mostly in time order, and lists are often "sorted plus a few new items". Timsort scans the list for <strong>runs</strong>, stretches that are already in order (or strictly descending, which it reverses). Short runs are extended to a minimum length of about 32 to 64 items using insertion sort, which is fast on short and nearly sorted pieces. Then the runs are merged, merge-sort style, in a careful order that keeps the merges balanced.</p>
  <p>A librarian re-shelving returned books works the same way: she notices that most of the trolley is already in order in a few stretches, keeps those stretches as they are, tidies the short messy bits by hand, and then interleaves the stretches. The result is a sort that is stable, O(n log n) in the worst case, and O(n) on data that is already sorted or reversed. We can check this by counting how many times Python compares two items:</p>
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
  <p>On 1,000 already-sorted or reversed numbers, Python made 999 comparisons, one per neighbouring pair: it found a single run and stopped. On random data it made 8,644, a little below n log₂ n. The <code>Counted</code> class also shows a useful fact: Python's sort only ever uses the <code>&lt;</code> operator, so a class needs just <code>__lt__</code> to be sortable.</p>
  <p>There are two ways to call it, and the difference is a classic source of bugs:</p>
  <div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
new = sorted(charges)          # new list; the original stays in time order
print(charges)
print(new)
result = charges.sort()        # sorts in place and returns None
print(charges, result)</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200]
[40, 60, 80, 80, 120, 200, 250, 310]
[40, 60, 80, 80, 120, 200, 250, 310] None</div>
  <p><code>sorted(charges)</code> builds and returns a <em>new</em> list and leaves the original in time order; it accepts any iterable, such as a string, a tuple, dictionary keys or a generator. <code>charges.sort()</code> sorts the list itself, in place, and returns <code>None</code>, as the last line shows. Both take the same two optional arguments, <code>reverse=True</code> for descending order and <code>key=</code>.</p>
  <p>The <strong>key</strong> argument is a function that Python calls once on each item; the items are then sorted by the values it returns, not by the items themselves. Returning a tuple sorts by several things at once, the first element first and the next one to break ties. Negating a number reverses just that part of the order.</p>
  <div class="fx" data-lang="py">from operator import itemgetter
orders = [("A", 120, "Dosa Hut"), ("B", 80, "Chai Point"), ("C", 250, "Biryani Bros"),
          ("D", 40, "Chai Point"), ("E", 310, "Biryani Bros"), ("F", 80, "Dosa Hut"),
          ("G", 60, "Chai Point"), ("H", 200, "Dosa Hut")]

print([o[0] for o in sorted(orders, key=itemgetter(1))])            # by amount
print([o[0] for o in sorted(orders, key=lambda o: -o[1])])          # dearest first
print([o[0] for o in sorted(orders, key=lambda o: (o[2], o[1]))])   # restaurant, then amount

codes = ["bite10", "Bite5", "BITE100", "bite2"]                      # coupon codes
print(sorted(codes))                                                 # text order: capitals first
print(sorted(codes, key=lambda c: int(c[4:])))                       # by the number inside</div>
  <div class="fx" data-lang="text">['D', 'G', 'B', 'F', 'A', 'H', 'C', 'E']
['E', 'C', 'H', 'A', 'B', 'F', 'G', 'D']
['C', 'E', 'D', 'G', 'B', 'F', 'A', 'H']
['BITE100', 'Bite5', 'bite10', 'bite2']
['bite2', 'Bite5', 'bite10', 'BITE100']</div>
  <p>By amount, the order is D G B F A H C E, with B before F because the sort is stable. Negating the amount gives the dearest first. The tuple key <code>(restaurant, amount)</code> groups by restaurant name (Biryani Bros, Chai Point, Dosa Hut) and orders by amount inside each group. The coupon codes show the classic text trap: strings compare character by character, and capital letters come before lowercase ones, so "BITE100" comes first and "bite10" comes before "bite2" because '1' is smaller than '2'. A key that extracts the number, <code>int(c[4:])</code>, sorts them the way a person would.</p>
  <p>Sometimes the rule cannot be written as "one value per item", only as "a goes before b if…". The classic example is LeetCode 179, Largest Number: arrange numbers so that, written side by side, they form the biggest possible number. Plain descending order fails, because "30" is bigger than "3" but "330" beats "303". The right rule compares <em>pairs</em>: a goes before b if the string a + b is bigger than b + a. Older code expressed such rules as a comparison function that returns a negative number (a first), zero (tie) or a positive number (b first); <code>functools.cmp_to_key</code> wraps such a function so that <code>sorted</code> can use it:</p>
  <div class="fx" data-lang="py">from functools import cmp_to_key

def largest_number(nums):              # LeetCode 179
    strs = [str(x) for x in nums]
    def cmp(a, b):
        if a + b &gt; b + a:
            return -1                   # a should come first
        if a + b &lt; b + a:
            return 1                    # b should come first
        return 0
    strs.sort(key=cmp_to_key(cmp))
    result = "".join(strs)
    return "0" if result[0] == "0" else result     # [0, 0] -&gt; "0", not "00"

print(sorted(["3", "30", "34", "5", "9"], reverse=True))   # plain descending: wrong
print(largest_number([3, 30, 34, 5, 9]), largest_number([0, 0]))</div>
  <div class="fx" data-lang="text">['9', '5', '34', '30', '3']
9534330 0</div>
  <p>Plain descending string order gives 9, 5, 34, 30, 3, which would form 9534303. The pair rule puts 3 before 30 and gives 9534330, the correct answer. The final check turns "00" into "0". Prefer <code>key=</code> whenever you can, because it calls your function n times rather than once per comparison, and because a comparison function must be consistent (if a comes before b and b before c, then a must come before c); a rule that breaks this produces a garbage order with no error.</p>

  <h2 id="dsa-so-patterns"><span class="num">10</span>Patterns: Sort First, Then…</h2>
  <p>In interviews, sorting is rarely the whole answer. It is usually the first step that makes the rest easy, and the skill is noticing that. The key idea is that sorting turns "compare everything with everything" into "compare neighbours". Whenever a brute-force answer checks all pairs, and the answer depends only on the values and not on their original positions, ask yourself: after sorting, which pairs could still matter? Usually only neighbours, or the two ends. Here is one sort of the charges followed by five questions, each answered with a single pass, a binary search or two pointers:</p>
  <div class="fx" data-lang="py">import bisect
charges = [120, 80, 250, 40, 310, 80, 60, 200]
s = sorted(charges)                                  # pay O(n log n) once ...

gaps = [s[i + 1] - s[i] for i in range(len(s) - 1)]  # ... then each answer is cheap
print("closest pair:", min(zip(gaps, s, s[1:]))[1:])
print("distinct:", [x for i, x in enumerate(s) if i == 0 or x != s[i - 1]])
print("orders under 100:", bisect.bisect_left(s, 100))
l, r = 0, len(s) - 1
while s[l] + s[r] != 280:                            # two pointers
    if s[l] + s[r] &lt; 280: l += 1
    else: r -= 1
print("pair worth 280:", s[l], "+", s[r])
print("top 3:", s[-3:][::-1])</div>
  <div class="fx" data-lang="text">closest pair: (80, 80)
distinct: [40, 60, 80, 120, 200, 250, 310]
orders under 100: 4
pair worth 280: 80 + 200
top 3: [310, 250, 200]</div>
  <p>The closest pair must be neighbours in sorted order, so one pass over the gaps finds (80, 80). Distinct values are the items that differ from their left neighbour. "How many orders under ₹100" is a single binary search: 4. The pair worth ₹280 is found by two pointers moving in from both ends, as in the Arrays note. And the top three are just the last three items. Each question costs O(n) or less after the one O(n log n) sort, instead of O(n²) for the pair questions on unsorted data. The general skeleton is short:</p>
  <div class="fx" data-lang="text">s = sorted(items, key=...)      # O(n log n) once: equal things together, extremes at the ends
for i in range(1, len(s)):      # then ONE pass that compares neighbours,
    compare(s[i - 1], s[i])     # or two pointers from both ends, or bisect for counts</div>
  <p>The table below maps the wording of a problem to the sorting idea it usually needs. Read the trigger words as hints, not rules: they tell you which tool to try first.</p>
  <table class="tbl">
    <tr><th>Trigger words in the problem</th><th>Pattern</th><th>Typical cost</th></tr>
    <tr><td>"closest", "pairs with sum", "duplicates", "intervals", "meetings", "group anagrams"</td><td>Sort first, then one pass / two pointers / greedy</td><td>O(n log n)</td></tr>
    <tr><td>"in place", "partition", "0s, 1s and 2s", "move all X to the front"</td><td>Partition (Lomuto or Dutch flag)</td><td>O(n), O(1) space</td></tr>
    <tr><td>"kth largest / smallest", "median", "top k" (order not needed)</td><td>Quickselect, or a heap of size k</td><td>O(n) average / O(n log k)</td></tr>
    <tr><td>"arrange to form the largest", "sort by frequency then value", "custom order"</td><td>Custom key (tuples) or <code>cmp_to_key</code></td><td>O(n log n)</td></tr>
    <tr><td>"two sorted arrays", "merge in place", "k sorted lists"</td><td>Merge with two pointers (from the back if in place); heap for k lists</td><td>O(n + m) / O(N log k)</td></tr>
    <tr><td>"pairs i &lt; j with a[i] &gt; a[j]", "smaller numbers after self"</td><td>Count while merging (merge sort)</td><td>O(n log n)</td></tr>
    <tr><td>"values in 0..100", "ages", "lowercase letters", "must be O(n)"</td><td>Counting sort / buckets</td><td>O(n + k)</td></tr>
  </table>
  <p>Two warnings go with this pattern. Sorting destroys the original positions, so if the answer needs original indexes (as in Two Sum), sort <code>(value, index)</code> pairs or use a hash map instead. And do not sort just to read one item: <code>max()</code> and <code>min()</code> are O(n).</p>

  <h2 id="dsa-so-problems"><span class="num">11</span>Practice Problems</h2>
  <p>The <a class="xref" data-note="dsa_problems">Problem Tracker</a> has about 35 sorting problems. Here is a sensible order through the most useful ones, with what each one is really practising. Start with <b>1051 Height Checker</b> and <b>1200 Minimum Absolute Difference</b>: both are "sort, then compare neighbours", the idea from section 01. <b>912 Sort an Array</b> asks you to write an O(n log n) sort yourself; write merge sort, and notice that a quick sort with a fixed pivot fails its sorted and all-equal tests, exactly as section 04 predicted. <b>75 Sort Colors</b> is the Dutch flag partition from section 04, and <b>215 Kth Largest Element in an Array</b> is quickselect from section 05 (remember: index n − k).</p>
  <p>Next, <b>88 Merge Sorted Array</b> is a merge with a twist: the result must go into the first array, which has empty slots at the end, so you merge from the back, placing the biggest items first so nothing useful is overwritten. <b>1636 Sort Array by Increasing Frequency</b> practises tuple keys, <b>179 Largest Number</b> practises <code>cmp_to_key</code>, and <b>274 H-Index</b> can be solved either by sorting in descending order or, because the answer never exceeds n, with counting buckets in O(n). <b>56 Merge Intervals</b> (in the greedy ladder) starts with a sort by start time. For the hard end, <b>315 Count of Smaller Numbers After Self</b> and <b>493 Reverse Pairs</b> are the "count while merging" idea, and <b>164 Maximum Gap</b> is the O(n) bucket idea from section 08.</p>

  <h2 id="dsa-so-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common sorting bug in Python is a single line. Because <code>list.sort()</code> sorts in place and returns <code>None</code>, writing <code>x = x.sort()</code> sorts the list and then throws it away. A second classic is sorting strings that contain numbers, which sorts them as text:</p>
  <div class="fx" data-lang="py">charges = [120, 80, 250, 40]
charges = charges.sort()                 # sorts, then throws the list away
print(charges)

prices = ["10", "9", "2", "100"]
print(sorted(prices), sorted(prices, key=int))</div>
  <div class="fx" data-lang="text">None
['10', '100', '2', '9'] ['2', '9', '10', '100']</div>
  <p>The first line prints <code>None</code>: the list is gone. Use <code>x.sort()</code> on its own line, or <code>x = sorted(x)</code>. In the second line, text order puts "100" before "2" and "9" because it compares character by character; <code>key=int</code> fixes it. The same bug sorts file names like <code>img10.png</code> before <code>img9.png</code>.</p>
  <p>A third mistake is writing quick sort with a fixed first or last pivot. On sorted input it is not only O(n²), it also recurses n levels deep, and Python's default recursion limit is about 1,000:</p>
  <div class="fx" data-lang="py">import sys
sys.setrecursionlimit(1000)              # Python's default

def quick_sort_last_pivot(a, lo, hi):
    if lo &lt; hi:
        pivot, i = a[hi], lo
        for j in range(lo, hi):
            if a[j] &lt; pivot:
                a[i], a[j] = a[j], a[i]; i += 1
        a[i], a[hi] = a[hi], a[i]
        quick_sort_last_pivot(a, lo, i - 1)
        quick_sort_last_pivot(a, i + 1, hi)

data = list(range(5000))                 # already sorted
try:
    quick_sort_last_pivot(data, 0, len(data) - 1)
except RecursionError as e:
    print("RecursionError:", e)</div>
  <div class="fx" data-lang="text">RecursionError: maximum recursion depth exceeded</div>
  <p>Five thousand already-sorted numbers are enough to crash it before it even gets slow. Use a random pivot, or a three-way partition when duplicates are common; merge sort's recursion is only log n deep.</p>
  <p>A few more slips are worth listing in words. Using <code>&lt;</code> instead of <code>&lt;=</code> in the merge step still sorts correctly but loses stability, and in an inversion count it wrongly counts equal pairs. Running binary search or two pointers on unsorted data gives a confident wrong answer, as section 01 showed with ₹60. The kth largest item is sorted index n − k, not k: the third largest charge is <code>s[5]</code> = 200, not <code>s[3]</code> = 80. Multi-key sorting in passes must go minor key first, major key last. Counting sort with negative numbers silently uses negative list indexes, so shift every key by the minimum first. And sorting a whole list just to find the maximum turns O(n) into O(n log n).</p>

  <h2 id="dsa-so-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Comparison sort</b>: learns about items only by asking "is a &lt; b?".</li>
    <li><b>Inversion</b>: a pair i &lt; j with a[i] &gt; a[j]; insertion sort does O(n + inversions) work. The charges have 14.</li>
    <li><b>Divide and conquer</b>: split into smaller copies, solve each, combine. Merge sort works in the combine step, quick sort in the split step.</li>
    <li><b>Partition</b>: smaller items left, pivot in its final slot, bigger items right.</li>
    <li><b>In place</b>: O(1) extra memory apart from recursion.</li>
    <li><b>Stable</b>: equal keys keep their original relative order.</li>
    <li><b>Lower bound</b>: any comparison sort needs ≥ log₂(n!) ≈ n log₂ n comparisons in the worst case.</li>
  </ul>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Extra space</th><th>Stable</th></tr>
    <tr><td>Insertion</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>Yes</td></tr>
    <tr><td>Bubble (early stop)</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>Yes</td></tr>
    <tr><td>Selection</td><td>O(n²)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>No</td></tr>
    <tr><td>Merge</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>Yes</td></tr>
    <tr><td>Quick</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n²)</td><td>O(log n)</td><td>No</td></tr>
    <tr><td>Heap</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(1)</td><td>No</td></tr>
    <tr><td>Counting</td><td colspan="3">O(n + k), k = key range</td><td>O(n + k)</td><td>Yes</td></tr>
    <tr><td>Radix (LSD)</td><td colspan="3">O(d · (n + b)), d digits, base b</td><td>O(n + b)</td><td>Yes</td></tr>
    <tr><td>Timsort (Python)</td><td>O(n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>Yes</td></tr>
    <tr><td>Quickselect</td><td colspan="2">O(n) average</td><td>O(n²)</td><td>O(1)</td><td>—</td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py">def merge(l, r):                       # stable merge
    out, i, j = [], 0, 0
    while i &lt; len(l) and j &lt; len(r):
        if l[i] &lt;= r[j]: out.append(l[i]); i += 1
        else:            out.append(r[j]); j += 1
    return out + l[i:] + r[j:]

def partition(a, lo, hi):              # Lomuto: pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if a[j] &lt; a[hi]: a[i], a[j] = a[j], a[i]; i += 1
    a[i], a[hi] = a[hi], a[i]
    return i                           # pivot's final index

# quickselect: p = partition(...); p == k → done; k &lt; p → hi = p - 1; else lo = p + 1
# Python: sorted(x, key=lambda o: (o.major, -o.minor)); x.sort() returns None
# from functools import cmp_to_key; sorted(x, key=cmp_to_key(cmp))</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>x = x.sort()</code> gives <code>None</code>.</li>
    <li>Fixed end pivot on sorted input → O(n²) and RecursionError; all-equal input needs a 3-way partition.</li>
    <li>Merge with <code>&lt;</code> instead of <code>&lt;=</code> loses stability.</li>
    <li>Strings of digits sort as text: use <code>key=int</code>.</li>
    <li>kth largest = index n − k.</li>
    <li>Multi-key passes: minor key first, major key last.</li>
    <li>Sorting loses original indexes; don't sort just to find the max.</li>
  </ul>

  <h2 id="dsa-so-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a comparison sort, and what is the best possible worst-case time for one?</summary><div class="qa-body">A comparison sort learns the order only by asking "is a &lt; b?". Its best possible worst case is Θ(n log n) comparisons: there are n! possible orders, each yes/no answer can at best halve them, so it needs at least log₂(n!) ≈ n log₂ n questions. Merge sort and heap sort reach this bound.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare merge sort and quick sort.</summary><div class="qa-body">Merge sort is O(n log n) in every case, uses O(n) extra space and is stable. Quick sort is O(n log n) on average but O(n²) in the worst case, sorts in place with O(log n) stack, and is not stable. Quick sort is usually faster on arrays in memory; merge sort wins when you need a guarantee, stability, a linked list or data bigger than memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does quick sort become O(n²), and how do you prevent it?</summary><div class="qa-body">When every pivot is the smallest or largest item in its range, for example a first- or last-item pivot on sorted or reversed input, or Lomuto partition on many equal items. Each partition then removes only one item, giving about n²/2 work. Use a random (or median-of-three) pivot and a three-way partition for duplicates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is insertion sort still used if it is O(n²)?</summary><div class="qa-body">Its work is O(n + number of inversions), so on small or nearly sorted inputs it is very fast and has almost no overhead. Timsort uses it to build short runs of 32 to 64 items before merging them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "stable" mean, and when does it matter?</summary><div class="qa-body">Items with equal keys keep their original relative order. It matters when you sort records by one field and the existing order carries meaning (time order), and for sorting by several keys in passes, minor key first. Radix sort depends on a stable inner sort.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which common sorts are stable?</summary><div class="qa-body">Insertion, bubble, merge (with <code>&lt;=</code>), counting, radix and Timsort are stable. Selection sort, quick sort and heap sort, in their usual in-place forms, are not, because they swap items over long distances.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>a = [3, 1, 2]; b = a.sort(); print(a, b, sorted(a, reverse=True))</code></summary><div class="qa-body"><code>[1, 2, 3] None [3, 2, 1]</code>. <code>a.sort()</code> sorts a in place and returns None; <code>sorted</code> returns a new list and leaves a unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What algorithm does Python's sort use, and what are its properties?</summary><div class="qa-body">Timsort, a hybrid of insertion sort and merge sort. It finds runs that are already ordered, extends short runs with insertion sort, and merges runs. It is stable, O(n) on sorted or reversed input, O(n log n) in the worst case, and uses O(n) extra memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you sort records by department ascending and salary descending in one call?</summary><div class="qa-body"><code>sorted(rows, key=lambda r: (r["dept"], -r["salary"]))</code>. If the descending field cannot be negated (a string, say), use two stable sorts: first by that field with <code>reverse=True</code>, then by department.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>cmp_to_key</code> instead of a key function?</summary><div class="qa-body">When the ordering rule is about pairs and cannot be expressed as one value per item, such as Largest Number, where a goes first if a + b &gt; b + a. Otherwise prefer <code>key=</code>: it is called n times rather than once per comparison, and it cannot be inconsistent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the kth largest element faster than sorting?</summary><div class="qa-body">Quickselect: partition around a random pivot and continue only into the side that contains index n − k. Average work is n + n/2 + n/4 + … &lt; 2n, so O(n). Alternatively keep a min-heap of size k for O(n log k), which also works on a stream.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is quickselect O(n) on average while quick sort is O(n log n)?</summary><div class="qa-body">Both use the same partition. Quick sort must sort both sides of every pivot, so every level of recursion costs n, over log n levels. Quickselect follows only one side, so the work shrinks geometrically: n + n/2 + n/4 + … &lt; 2n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Counting sort is O(n + k). Doesn't that break the n log n lower bound?</summary><div class="qa-body">No. The bound only applies to sorts that learn by comparing. Counting sort uses the key as a list index, which is extra information. It only works for integer keys in a small range; if k is huge, O(n + k) is far worse than n log n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must radix sort use a stable sort for each digit?</summary><div class="qa-body">Each pass sorts by one digit and must keep the order produced by the earlier, less significant digits for numbers that tie on the current digit. An unstable pass could swap such numbers and undo the earlier passes, leaving the list unsorted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you count inversions in O(n log n)?</summary><div class="qa-body">Use merge sort. Inversions inside each half are counted by recursion. During the merge, whenever an item is taken from the right half, every item still waiting in the left half is bigger and earlier, so add the number of waiting left items. Equal items are not inversions, which is why the merge uses <code>&lt;=</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which sort would you use for: 20 items; 10⁸ ages; a linked list; 1 TB of logs?</summary><div class="qa-body">20 items: insertion sort or simply <code>sorted()</code>. Ages 0–120: counting sort, O(n). A linked list: merge sort, which needs no random access. 1 TB: external merge sort, sorting chunks that fit in memory, writing them to disk, then k-way merging them with a heap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not sort?</summary><div class="qa-body">When you only need the min or max (O(n) with <code>max</code>), one membership check (a scan, or a set for many checks), or the kth item (quickselect or a heap). Also when the answer needs original positions, unless you sort (value, index) pairs.</div></details>
</main>
`
});
