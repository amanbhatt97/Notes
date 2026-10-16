// notes/dsa/dsa_greedy.js — Intervals & Greedy
Object.assign(TOPIC_CONTENT, {
  "dsa_greedy": `<main>
  <h1>Intervals &amp; Greedy</h1>
  <p class="lead">A greedy algorithm takes the best-looking option at each step and never goes back. It is fast and short, but only right for some problems. Interval problems (meetings, bookings, timetables) are where greedy shines: sort by time, sweep left to right, decide once. This note shows how to tell when greedy is safe, and solves the six interval and greedy questions interviews ask most.</p>

  <h2 id="dsa-gr2-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Intervals &amp; Greedy</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Greedy idea</div>
        <ul>
          <li><b>Greedy</b> — pick the best option now, never undo</li>
          <li>💡 Giving change: biggest coin first</li>
          <li><b>Works when</b> — a local best never blocks the global best (greedy-choice property)</li>
          <li><b>Fails when</b> — an early pick blocks a better later combination</li>
          <li>⚠ Coins [1, 3, 4], amount 6: greedy 4+1+1 = 3 coins, best 3+3 = 2</li>
          <li><b>Proof style</b> — "exchange argument": swap any optimal choice for the greedy one, nothing gets worse</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interval basics</div>
        <ul>
          <li><b>Interval</b> — [start, end] on a timeline</li>
          <li><b>Overlap test</b> — <code>a.start &lt;= b.end and b.start &lt;= a.end</code></li>
          <li><b>Step 1 is almost always</b> — sort by start (merge) or by end (pick max non-overlapping)</li>
          <li><b>Sweep</b> — walk left to right, keep only the "current" interval in mind</li>
          <li>⚠ Touching intervals [1,3] and [3,5]: overlap or not? Ask; LeetCode merge says yes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Merge &amp; Insert</div>
        <ul>
          <li><b>Merge Intervals</b> — sort by start; if <code>cur.start &lt;= last.end</code> extend <code>last.end = max(...)</code> else append</li>
          <li>O(n log n) time for the sort, O(n) output</li>
          <li><b>Insert Interval</b> — list already sorted: copy all ending before new, merge all overlapping, copy the rest</li>
          <li>O(n), no sort needed</li>
          <li>⚠ Extend with <code>max(last.end, cur.end)</code>, not <code>cur.end</code> — [1,10],[2,3]</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Non-overlapping &amp; Meeting Rooms</div>
        <ul>
          <li><b>Non-overlapping Intervals</b> — min removals = n − max kept; sort by END, keep when start ≥ last end</li>
          <li>⚠ Sorting by start is wrong here: one long early interval kills many short ones</li>
          <li><b>Meeting Rooms II</b> — rooms = max overlap at any instant</li>
          <li>Two ways: min-heap of end times, or sweep of +1/−1 events sorted by time</li>
          <li>Both O(n log n); heap size = rooms in use</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Jump Game &amp; Gas Station</div>
        <ul>
          <li><b>Jump Game</b> — track <code>far</code> = farthest index reachable; stuck if <code>i &gt; far</code></li>
          <li><b>Jump Game II</b> — count jumps: when i reaches end of current jump range, jump to <code>far</code></li>
          <li><b>Gas Station</b> — if total gas &lt; total cost → −1; else restart candidate after any point where tank &lt; 0</li>
          <li>Why: if you fail at j starting from i, every start between i and j also fails at j</li>
          <li>All three O(n) time, O(1) space</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Signal words</div>
        <ul>
          <li>"merge", "overlap", "free slots", "book", "schedule", "rooms", "minimum removals"</li>
          <li>"can you reach", "minimum jumps", "circular route"</li>
          <li>Greedy fits when the answer needs no look-back; else think DP</li>
          <li>Always try a tiny counter-example before trusting greedy</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-gr2-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Greedy Idea</span><span class="rm-sub">Best now, never look back</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-fail"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">When Greedy Fails</span><span class="rm-sub">The coin counter-example</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-iv"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Intervals on a Timeline</span><span class="rm-sub">Overlap test, sort, sweep</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-merge"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Merge &amp; Insert Interval</span><span class="rm-sub">Sort by start, extend the end</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-nonov"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Non-overlapping Intervals</span><span class="rm-sub">Sort by end, keep the most</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-rooms"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Meeting Rooms II</span><span class="rm-sub">Heap or sweep line</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-jump"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Jump Game &amp; Gas Station</span><span class="rm-sub">One pass, remember the best</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Traps &amp; Complexity</span><span class="rm-sub">Sort key, touching ends</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-gr2-idea"><span class="num">01</span>The Greedy Idea</h2>
  <p>A shopkeeper has to return ₹78 in change. He does not think about all possible combinations of notes. He gives the biggest note that fits (₹50), then the biggest that fits in the rest (₹20), then ₹5, then ₹2, ₹1. Five notes and coins, done in seconds.</p>
  <p>This is a <strong>greedy algorithm</strong>: at every step, take the choice that looks best right now, and never go back to change it. No recursion tree, no table. Usually one sort plus one pass.</p>
  <div class="flow"><span>Sort or order the options</span><span>Take the best one now</span><span>Move on, never revisit</span><span>Done after one pass</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Filling a bucket with stones. Biggest stones first, then small ones fill the gaps. It works for stones. But for packing a suitcase, grabbing the biggest item first can block a better arrangement. Greedy is the first instinct; the question is always whether it is safe.</p>
  </div>
<div class="fx" data-lang="py">def make_change(amount, notes=(500, 200, 100, 50, 20, 10, 5, 2, 1)):
    used = []
    for n in notes:                 # biggest first
        while amount &gt;= n:          # take it as long as it fits
            used.append(n); amount -= n
    return used

print(make_change(78))
print(make_change(1234))</div>
  <div class="fx" data-lang="text">[50, 20, 5, 2, 1]
[500, 500, 200, 20, 10, 2, 2]</div>
  <p>Greedy is correct when the problem has the <strong>greedy-choice property</strong>: the locally best choice is always part of some globally best answer. Indian currency has this property (every note is a "clean" multiple of the smaller ones). The next section shows coins that do not.</p>

  <h2 id="dsa-gr2-fail"><span class="num">02</span>When Greedy Fails</h2>
  <p>Imagine a country with coins of 1, 3 and 4. You need to pay 6. Greedy takes 4 first (biggest). Then 1, then 1: three coins. But 3 + 3 is two coins. Greedy took a step that looked best and it blocked the better answer.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="20" y="22">coins {1, 3, 4}, amount 6</text>
<text x="20" y="62" class="tr">greedy</text>
<rect x="90" y="42" width="120" height="30" class="fr sr"/><text x="150" y="62" text-anchor="middle">4</text>
<rect x="214" y="42" width="30" height="30" class="fr sr"/><text x="229" y="62" text-anchor="middle">1</text>
<rect x="248" y="42" width="30" height="30" class="fr sr"/><text x="263" y="62" text-anchor="middle">1</text>
<text x="300" y="62" class="tr">3 coins</text>
<text x="20" y="112" class="tg">best</text>
<rect x="90" y="92" width="90" height="30" class="fg sg"/><text x="135" y="112" text-anchor="middle">3</text>
<rect x="184" y="92" width="90" height="30" class="fg sg"/><text x="229" y="112" text-anchor="middle">3</text>
<text x="300" y="112" class="tg">2 coins</text>
<text x="400" y="62" class="tm">taking 4 leaves 2,</text><text x="400" y="80" class="tm">which only 1s can pay</text>
</svg><figcaption>The first greedy pick (4) looks best but leaves an awkward remainder. The best answer never uses the 4 at all.</figcaption></figure>
<div class="fx" data-lang="py">def greedy_coins(amount, coins):
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else None

def best_coins(amount, coins):          # DP: tries everything (see the DP note)
    best = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c &lt;= a:
                best[a] = min(best[a], best[a - c] + 1)
    return best[amount]

for amount, coins in [(6, [1, 3, 4]), (78, [1, 2, 5, 10, 20, 50]), (12, [1, 5, 8])]:
    print(f"amount {amount:2} coins {coins}: greedy={greedy_coins(amount, coins)}  best={best_coins(amount, coins)}")</div>
  <div class="fx" data-lang="text">amount  6 coins [1, 3, 4]: greedy=3  best=2
amount 78 coins [1, 2, 5, 10, 20, 50]: greedy=5  best=5
amount 12 coins [1, 5, 8]: greedy=5  best=4</div>
  <div class="callout intu"><span class="label">How to decide</span>
    <p>Before trusting greedy, try to break it with a tiny example (3–5 items). If you can't, and you can argue "swapping any optimal choice for the greedy one never makes things worse" (the <strong>exchange argument</strong>), greedy is safe. If you can break it, the problem needs DP or backtracking.</p>
  </div>
  <table class="tbl">
    <tr><th>Greedy works</th><th>Greedy fails</th></tr>
    <tr><td>Indian currency change</td><td>Coin change with odd coin sets (needs DP)</td></tr>
    <tr><td>Pick max non-overlapping intervals (sort by end)</td><td>0/1 Knapsack: biggest value first is wrong</td></tr>
    <tr><td>Fractional knapsack: best value per kg first</td><td>Longest path, most puzzles with "exactly k"</td></tr>
    <tr><td>Dijkstra's shortest path, Huffman codes, Kruskal MST</td><td>Shortest path with negative edges</td></tr>
  </table>

  <h2 id="dsa-gr2-iv"><span class="num">03</span>Intervals on a Timeline</h2>
  <p>An <strong>interval</strong> is a start and an end on a line: a meeting from 9 to 10, a train journey from 14:00 to 18:30, a hotel booking from the 3rd to the 7th. Written as <code>[start, end]</code>. Almost every interval question is really about one thing: which intervals <strong>overlap</strong> (share some time)?</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
<defs><marker id="dsa-gr2-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<line x1="30" y1="150" x2="540" y2="150" stroke="currentColor" marker-end="url(#dsa-gr2-ar1)"/>
<g class="tm" text-anchor="middle"><text x="40" y="170">0</text><text x="90" y="170">1</text><text x="140" y="170">2</text><text x="190" y="170">3</text><text x="240" y="170">4</text><text x="290" y="170">5</text><text x="340" y="170">6</text><text x="390" y="170">7</text><text x="440" y="170">8</text><text x="490" y="170">9</text></g>
<g stroke="currentColor"><line x1="40" y1="146" x2="40" y2="154"/><line x1="90" y1="146" x2="90" y2="154"/><line x1="140" y1="146" x2="140" y2="154"/><line x1="190" y1="146" x2="190" y2="154"/><line x1="240" y1="146" x2="240" y2="154"/><line x1="290" y1="146" x2="290" y2="154"/><line x1="340" y1="146" x2="340" y2="154"/><line x1="390" y1="146" x2="390" y2="154"/><line x1="440" y1="146" x2="440" y2="154"/><line x1="490" y1="146" x2="490" y2="154"/></g>
<rect x="90" y="30" width="100" height="22" rx="4" class="fb sb"/><text x="140" y="46" text-anchor="middle">A [1,3]</text>
<rect x="140" y="62" width="150" height="22" rx="4" class="fb sb"/><text x="215" y="78" text-anchor="middle">B [2,5]</text>
<rect x="340" y="62" width="100" height="22" rx="4" class="fg sg"/><text x="390" y="78" text-anchor="middle">C [6,8]</text>
<rect x="440" y="30" width="50" height="22" rx="4" class="fg sg"/><text x="465" y="46" text-anchor="middle">D [8,9]</text>
<rect x="140" y="94" width="50" height="22" rx="4" class="fv"/><text x="165" y="110" text-anchor="middle">A∩B</text>
<text x="330" y="118" class="tm">A, B overlap: 2 ≤ 3 and 1 ≤ 5</text>
<text x="330" y="134" class="tm">B, C don't: 6 &gt; 5 · C, D touch at 8</text>
</svg><figcaption>Two intervals overlap when each starts before the other ends. B and C have a gap; C and D only touch at one point.</figcaption></figure>
  <div class="callout def"><span class="label">Overlap test</span>
    <p>A and B overlap when <code>A.start &lt;= B.end and B.start &lt;= A.end</code>. In words: neither one ends before the other begins. If the intervals are sorted by start, this shrinks to <code>B.start &lt;= A.end</code>.</p>
  </div>
  <p>The second big idea is <strong>sorting</strong>. Unsorted intervals force you to compare every pair: n² checks. Sorted by start, each interval only needs to be compared with the one just before it. Sort once (n log n), then one <strong>sweep</strong> left to right, like reading a timetable top to bottom.</p>
<div class="fx" data-lang="py">def overlap(a, b):
    return a[0] &lt;= b[1] and b[0] &lt;= a[1]

A, B, C, D = [1, 3], [2, 5], [6, 8], [8, 9]
print(overlap(A, B), overlap(B, C), overlap(C, D))
ivs = [[6, 8], [1, 3], [8, 9], [2, 5]]
print(sorted(ivs))                         # lists sort by first item, then second
print(sorted(ivs, key=lambda iv: iv[1]))   # sort by END</div>
  <div class="fx" data-lang="text">True False True
[[1, 3], [2, 5], [6, 8], [8, 9]]
[[1, 3], [2, 5], [6, 8], [8, 9]]</div>
  <div class="callout trap"><span class="label">Trap: touching ends</span>
    <p>Do [1, 3] and [3, 5] overlap? LeetCode "Merge Intervals" says yes (merge to [1, 5]); "Non-overlapping Intervals" and "Meeting Rooms" say no (a meeting can start the minute another ends). Read the question, and say your assumption out loud in an interview.</p>
  </div>

  <h2 id="dsa-gr2-merge"><span class="num">04</span>Merge &amp; Insert Interval</h2>
  <h3>Merge Intervals (LeetCode 56)</h3>
  <p><strong>Problem:</strong> you have busy slots from several calendars: [1,3], [8,10], [2,6], [15,18]. Return the busy slots with overlaps merged: [1,6], [8,10], [15,18].</p>
  <p><strong>Brute force:</strong> compare every pair, merge, repeat until nothing changes. O(n²) or worse, and messy.</p>
  <p><strong>Better idea:</strong> sort by start. Keep a result list. For each interval, if it starts before or at the end of the last merged interval, they overlap: stretch the last one's end. Otherwise, start a new merged interval.</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
<defs><marker id="dsa-gr2-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<text x="20" y="20">sorted input</text>
<rect x="55" y="30" width="60" height="20" rx="4" class="fb sb"/><text x="85" y="44" text-anchor="middle">[1,3]</text>
<rect x="85" y="54" width="120" height="20" rx="4" class="fb sb"/><text x="145" y="68" text-anchor="middle">[2,6]</text>
<rect x="265" y="30" width="60" height="20" rx="4" class="fb sb"/><text x="295" y="44" text-anchor="middle">[8,10]</text>
<rect x="475" y="30" width="80" height="20" rx="4" class="fb sb"/><text x="515" y="44" text-anchor="middle">[15,18]</text>
<line x1="280" y1="82" x2="280" y2="100" stroke="currentColor" marker-end="url(#dsa-gr2-ar2)"/>
<text x="20" y="128">merged</text>
<rect x="55" y="110" width="150" height="20" rx="4" class="fg sg"/><text x="130" y="124" text-anchor="middle">[1,6]</text>
<rect x="265" y="110" width="60" height="20" rx="4" class="fg sg"/><text x="295" y="124" text-anchor="middle">[8,10]</text>
<rect x="475" y="110" width="80" height="20" rx="4" class="fg sg"/><text x="515" y="124" text-anchor="middle">[15,18]</text>
<text x="20" y="158" class="tm">2 ≤ 3 → stretch end to max(3, 6) = 6 · 8 &gt; 6 → new interval · 15 &gt; 10 → new interval</text>
</svg><figcaption>Only neighbours matter after sorting. Each interval either stretches the last merged one or starts a new one.</figcaption></figure>
  <table class="tbl">
    <caption>Dry run on [[1,3],[2,6],[8,10],[15,18]]</caption>
    <tr><th>Current</th><th>Last merged</th><th>cur.start ≤ last.end?</th><th>Result list</th></tr>
    <tr><td>[1,3]</td><td>—</td><td>list empty → add</td><td>[[1,3]]</td></tr>
    <tr><td>[2,6]</td><td>[1,3]</td><td>2 ≤ 3 yes → last.end = max(3,6)</td><td>[[1,6]]</td></tr>
    <tr><td>[8,10]</td><td>[1,6]</td><td>8 ≤ 6 no → add</td><td>[[1,6],[8,10]]</td></tr>
    <tr><td>[15,18]</td><td>[8,10]</td><td>15 ≤ 10 no → add</td><td>[[1,6],[8,10],[15,18]]</td></tr>
  </table>
<div class="fx" data-lang="py">def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])          # by start
    res = []
    for s, e in intervals:
        if res and s &lt;= res[-1][1]:               # overlaps the last merged one
            res[-1][1] = max(res[-1][1], e)       # stretch its end
        else:
            res.append([s, e])                    # start a new block
    return res

print(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))
print(merge([[1, 4], [4, 5]]))          # touching -&gt; merged
print(merge([[1, 10], [2, 3], [4, 5]])) # one big one swallows the rest
print(merge([[5, 6]]), merge([]))</div>
  <div class="fx" data-lang="text">[[1, 6], [8, 10], [15, 18]]
[[1, 5]]
[[1, 10]]
[[5, 6]] []</div>
  <p><strong>Complexity:</strong> O(n log n) for the sort, then one O(n) pass. Space O(n) for the output (O(1) extra if you sort in place).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing <code>res[-1][1] = e</code> instead of <code>max(res[-1][1], e)</code>. With [1,10] then [2,3], the end would shrink from 10 to 3 and the next interval [4,5] would wrongly become separate.</p>
  </div>

  <h3>Insert Interval (LeetCode 57)</h3>
  <p><strong>Problem:</strong> the intervals are already sorted and non-overlapping. Insert a new interval and merge if needed. Example: [[1,3],[6,9]] + [2,5] → [[1,5],[6,9]].</p>
  <p><strong>Lazy way:</strong> append the new one and call <code>merge</code>. Correct, O(n log n). The interviewer wants O(n), since the list is already sorted.</p>
  <p><strong>Better idea:</strong> three phases in one pass. Copy intervals that end before the new one starts. Then absorb every interval that overlaps into the new one (stretch its start and end). Then add the new one and copy whatever is left.</p>
<div class="fx" data-lang="py">def insert(intervals, new):
    res, i, n = [], 0, len(intervals)
    while i &lt; n and intervals[i][1] &lt; new[0]:      # 1. fully before: copy
        res.append(intervals[i]); i += 1
    while i &lt; n and intervals[i][0] &lt;= new[1]:     # 2. overlapping: absorb
        new = [min(new[0], intervals[i][0]), max(new[1], intervals[i][1])]
        i += 1
    res.append(new)
    res.extend(intervals[i:])                      # 3. fully after: copy
    return res

print(insert([[1, 3], [6, 9]], [2, 5]))
print(insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]))
print(insert([], [5, 7]))
print(insert([[1, 5]], [6, 8]))        # goes after, no merge
print(insert([[3, 5]], [1, 2]))        # goes before</div>
  <div class="fx" data-lang="text">[[1, 5], [6, 9]]
[[1, 2], [3, 10], [12, 16]]
[[5, 7]]
[[1, 5], [6, 8]]
[[1, 2], [3, 5]]</div>
  <p><strong>Complexity:</strong> O(n) time, O(n) for the result.</p>

  <h2 id="dsa-gr2-nonov"><span class="num">05</span>Non-overlapping Intervals</h2>
  <p><strong>Problem (LeetCode 435):</strong> given intervals, remove the fewest so that none overlap. Touching ([1,2] and [2,3]) is fine. Example: [[1,2],[2,3],[3,4],[1,3]] → remove 1 (the [1,3]).</p>
  <p>Flip the question: <em>keep</em> as many as possible, and removals = n − kept. This is the classic <strong>activity selection</strong> problem: from a list of events, attend the most events without clashes.</p>
  <p><strong>Greedy choice:</strong> always keep the interval that <strong>ends earliest</strong>. Ending early leaves the most room for everything after it. Sort by end, then sweep: keep an interval if it starts at or after the end of the last kept one.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<text x="20" y="20" class="tr">sort by START, keep greedily — wrong</text>
<rect x="30" y="30" width="300" height="20" rx="4" class="fr sr"/><text x="180" y="44" text-anchor="middle">[1,7] kept first</text>
<rect x="80" y="54" width="60" height="20" rx="4" class="fs" stroke="currentColor"/><text x="110" y="68" text-anchor="middle" class="tm">[2,3]</text>
<rect x="160" y="54" width="60" height="20" rx="4" class="fs" stroke="currentColor"/><text x="190" y="68" text-anchor="middle" class="tm">[4,5]</text>
<rect x="240" y="54" width="60" height="20" rx="4" class="fs" stroke="currentColor"/><text x="270" y="68" text-anchor="middle" class="tm">[6,7]</text>
<text x="350" y="60" class="tr">kept 1, removed 3</text>
<text x="20" y="120" class="tg">sort by END, keep greedily — right</text>
<rect x="30" y="130" width="300" height="20" rx="4" class="fs" stroke="currentColor"/><text x="180" y="144" text-anchor="middle" class="tm">[1,7] removed</text>
<rect x="80" y="154" width="60" height="20" rx="4" class="fg sg"/><text x="110" y="168" text-anchor="middle">[2,3]</text>
<rect x="160" y="154" width="60" height="20" rx="4" class="fg sg"/><text x="190" y="168" text-anchor="middle">[4,5]</text>
<rect x="240" y="154" width="60" height="20" rx="4" class="fg sg"/><text x="270" y="168" text-anchor="middle">[6,7]</text>
<text x="350" y="160" class="tg">kept 3, removed 1</text>
</svg><figcaption>The long early interval blocks three short ones. Sorting by end picks the short ones first.</figcaption></figure>
  <table class="tbl">
    <caption>Dry run on [[1,2],[2,3],[3,4],[1,3]] sorted by end → [1,2],[2,3],[1,3],[3,4]</caption>
    <tr><th>Interval</th><th>last_end</th><th>start ≥ last_end?</th><th>Action</th></tr>
    <tr><td>[1,2]</td><td>−∞</td><td>yes</td><td>keep, last_end = 2</td></tr>
    <tr><td>[2,3]</td><td>2</td><td>2 ≥ 2 yes</td><td>keep, last_end = 3</td></tr>
    <tr><td>[1,3]</td><td>3</td><td>1 ≥ 3 no</td><td>remove (count 1)</td></tr>
    <tr><td>[3,4]</td><td>3</td><td>3 ≥ 3 yes</td><td>keep, last_end = 4</td></tr>
  </table>
<div class="fx" data-lang="py">def erase_overlap(intervals):
    intervals.sort(key=lambda iv: iv[1])        # by END
    removed, last_end = 0, float("-inf")
    for s, e in intervals:
        if s &gt;= last_end:                       # no clash with the last kept
            last_end = e                        # keep it
        else:
            removed += 1                        # drop it (it ends later)
    return removed

print(erase_overlap([[1, 2], [2, 3], [3, 4], [1, 3]]))
print(erase_overlap([[1, 2], [1, 2], [1, 2]]))
print(erase_overlap([[1, 2], [2, 3]]))
print(erase_overlap([[1, 7], [2, 3], [4, 5], [6, 7]]))
print(erase_overlap([]))</div>
  <div class="fx" data-lang="text">1
2
0
1
0</div>
  <p><strong>Complexity:</strong> O(n log n) time, O(1) extra space. <strong>Why greedy is safe:</strong> take any best answer. Its first kept interval ends at some time t. Our earliest-ending interval ends at time ≤ t, so swapping it in clashes with nothing that comes after. Repeat for the next one. The swap never loses an interval, so greedy keeps at least as many. That is the exchange argument.</p>

  <h2 id="dsa-gr2-rooms"><span class="num">06</span>Meeting Rooms II</h2>
  <p><strong>Problem (LeetCode 253):</strong> meetings [[0,30],[5,10],[15,20]]. What is the fewest rooms needed so no two meetings share a room at the same time? Answer: 2 (the 0–30 meeting runs alongside each short one).</p>
  <p>The real question: at the busiest instant, how many meetings run at once? That number is the rooms needed. Two ways to find it.</p>
  <h3>Way 1: min-heap of end times</h3>
  <p>Sort by start. Walk through meetings. Keep a heap (a pile where the smallest item is always on top) of end times of meetings in progress. For each new meeting: if the earliest-ending meeting is already over (its end ≤ this start), that room is free, pop it. Push this meeting's end. The heap size is the number of rooms in use; the biggest it ever gets is the answer.</p>
  <table class="tbl">
    <caption>Dry run on [[0,30],[5,10],[15,20]]</caption>
    <tr><th>Meeting</th><th>Heap before</th><th>Earliest end ≤ start?</th><th>Heap after</th><th>Rooms</th></tr>
    <tr><td>[0,30]</td><td>[]</td><td>—</td><td>[30]</td><td>1</td></tr>
    <tr><td>[5,10]</td><td>[30]</td><td>30 ≤ 5 no → new room</td><td>[10, 30]</td><td>2</td></tr>
    <tr><td>[15,20]</td><td>[10, 30]</td><td>10 ≤ 15 yes → reuse</td><td>[20, 30]</td><td>2</td></tr>
  </table>
<div class="fx" data-lang="py">import heapq

def min_rooms_heap(meetings):
    meetings.sort(key=lambda m: m[0])
    ends = []                                  # min-heap of end times
    rooms = 0
    for s, e in meetings:
        if ends and ends[0] &lt;= s:              # earliest meeting finished?
            heapq.heappop(ends)                # free that room
        heapq.heappush(ends, e)
        rooms = max(rooms, len(ends))
    return rooms

for m in [[[0, 30], [5, 10], [15, 20]], [[7, 10], [2, 4]], [[1, 5], [2, 6], [3, 7], [4, 8]],
          [[1, 2], [2, 3], [3, 4]], []]:
    print(m, "-&gt;", min_rooms_heap(m))</div>
  <div class="fx" data-lang="text">[[0, 30], [5, 10], [15, 20]] -&gt; 2
[[2, 4], [7, 10]] -&gt; 1
[[1, 5], [2, 6], [3, 7], [4, 8]] -&gt; 4
[[1, 2], [2, 3], [3, 4]] -&gt; 1
[] -&gt; 0</div>
  <h3>Way 2: sweep line with +1 / −1 events</h3>
  <p>Think of a security guard counting people in a hall. Every start is "+1 person", every end is "−1". Sort all events by time, walk through, keep a running count, remember the peak.</p>
  <figure class="viz"><svg viewBox="0 0 560 175" width="560">
<defs><marker id="dsa-gr2-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<rect x="40" y="20" width="450" height="18" rx="4" class="fb sb"/><text x="265" y="33" text-anchor="middle">[0,30]</text>
<rect x="115" y="42" width="75" height="18" rx="4" class="fb sb"/><text x="152" y="55" text-anchor="middle">[5,10]</text>
<rect x="265" y="42" width="75" height="18" rx="4" class="fb sb"/><text x="302" y="55" text-anchor="middle">[15,20]</text>
<line x1="30" y1="140" x2="530" y2="140" stroke="currentColor" marker-end="url(#dsa-gr2-ar3)"/>
<g class="tm" text-anchor="middle"><text x="40" y="160">0</text><text x="115" y="160">5</text><text x="190" y="160">10</text><text x="265" y="160">15</text><text x="340" y="160">20</text><text x="490" y="160">30</text></g>
<polyline points="40,130 40,110 115,110 115,90 190,90 190,110 265,110 265,90 340,90 340,110 490,110 490,130" fill="none" class="sg" stroke-width="2"/>
<text x="20" y="114" class="tm">1</text><text x="20" y="94" class="tm">2</text>
<text x="400" y="80" class="tg">peak = 2 rooms</text>
<text x="40" y="104" class="tg">+1</text><text x="115" y="84" class="tg">+1</text><text x="190" y="104" class="tr">−1</text><text x="265" y="84" class="tg">+1</text><text x="340" y="104" class="tr">−1</text><text x="470" y="128" class="tr">−1</text>
</svg><figcaption>The green line is "meetings running right now". Its highest point is the number of rooms.</figcaption></figure>
<div class="fx" data-lang="py">def min_rooms_sweep(meetings):
    events = []
    for s, e in meetings:
        events.append((s, 1))                  # a meeting starts
        events.append((e, -1))                 # a meeting ends
    events.sort()                              # ties: (10,-1) before (10,1): end frees first
    running = peak = 0
    for _, delta in events:
        running += delta
        peak = max(peak, running)
    return peak

for m in [[[0, 30], [5, 10], [15, 20]], [[1, 5], [2, 6], [3, 7], [4, 8]], [[1, 2], [2, 3], [3, 4]]]:
    print(m, "-&gt;", min_rooms_sweep(m))</div>
  <div class="fx" data-lang="text">[[0, 30], [5, 10], [15, 20]] -&gt; 2
[[1, 5], [2, 6], [3, 7], [4, 8]] -&gt; 4
[[1, 2], [2, 3], [3, 4]] -&gt; 1</div>
  <p>Sorting tuples puts <code>(10, -1)</code> before <code>(10, 1)</code>, so a meeting ending at 10 frees its room before one starting at 10 takes it. <strong>Complexity:</strong> both ways O(n log n) time, O(n) space. The same sweep answers "max people online at once", "max overlapping bookings", and "minimum platforms at a railway station".</p>

  <h2 id="dsa-gr2-jump"><span class="num">07</span>Jump Game &amp; Gas Station</h2>
  <h3>Jump Game (LeetCode 55)</h3>
  <p><strong>Problem:</strong> you stand on index 0 of <code>nums</code>. Each number is the maximum you may jump forward from there. Can you reach the last index? [2,3,1,1,4] → yes. [3,2,1,0,4] → no (you always land on the 0 and get stuck).</p>
  <p><strong>Brute force:</strong> try every jump length at every position (backtracking). Exponential.</p>
  <p><strong>Greedy idea:</strong> you don't need to know <em>which</em> jumps to take, only <em>how far</em> you could possibly get. Keep <code>far</code> = farthest index reachable so far. Walk left to right. If the current index is beyond <code>far</code>, you could never have got here: stuck. Otherwise update <code>far = max(far, i + nums[i])</code>.</p>
  <table class="tbl">
    <caption>Dry run on [3,2,1,0,4]</caption>
    <tr><th>i</th><th>nums[i]</th><th>i &gt; far?</th><th>far after</th></tr>
    <tr><td>0</td><td>3</td><td>0 &gt; 0 no</td><td>max(0, 0+3) = 3</td></tr>
    <tr><td>1</td><td>2</td><td>no</td><td>max(3, 3) = 3</td></tr>
    <tr><td>2</td><td>1</td><td>no</td><td>max(3, 3) = 3</td></tr>
    <tr><td>3</td><td>0</td><td>no</td><td>max(3, 3) = 3</td></tr>
    <tr><td>4</td><td>4</td><td>4 &gt; 3 <strong>yes → stuck</strong></td><td>return False</td></tr>
  </table>
<div class="fx" data-lang="py">def can_jump(nums):
    far = 0
    for i, step in enumerate(nums):
        if i &gt; far:                 # this index was never reachable
            return False
        far = max(far, i + step)
    return True

def min_jumps(nums):                # Jump Game II: fewest jumps to the end
    jumps = cur_end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == cur_end:            # must jump now: go as far as we can
            jumps += 1
            cur_end = far
    return jumps

for t in [[2, 3, 1, 1, 4], [3, 2, 1, 0, 4], [0], [2, 0, 0], [0, 1]]:
    print(f"{t!s:18} can_jump={can_jump(t)}")
print("min jumps:", min_jumps([2, 3, 1, 1, 4]), min_jumps([2, 3, 0, 1, 4]), min_jumps([1]))</div>
  <div class="fx" data-lang="text">[2, 3, 1, 1, 4]    can_jump=True
[3, 2, 1, 0, 4]    can_jump=False
[0]                can_jump=True
[2, 0, 0]          can_jump=True
[0, 1]             can_jump=False
min jumps: 2 2 0</div>
  <p><strong>Complexity:</strong> O(n) time, O(1) space. Jump Game II is greedy too: whenever you reach the edge of the current jump's range, you must jump, and you jump to the farthest point you have seen (like BFS level by level).</p>

  <h3>Gas Station (LeetCode 134)</h3>
  <p><strong>Problem:</strong> petrol pumps on a circular road. <code>gas[i]</code> = fuel you get at pump i; <code>cost[i]</code> = fuel to drive to pump i+1. Start with an empty tank at some pump and complete one full circle. Return that starting pump, or −1 if impossible. Example: gas [1,2,3,4,5], cost [3,4,5,1,2] → start at 3.</p>
  <p><strong>Brute force:</strong> try each start and simulate a full circle: O(n²).</p>
  <p><strong>Greedy idea, two facts:</strong></p>
  <ol>
    <li>If total gas &lt; total cost, no start works. If total gas ≥ total cost, some start always works.</li>
    <li>Start from pump i. If the tank goes negative when leaving pump j, then no pump between i and j can be a valid start either (you arrived at each of them with fuel ≥ 0, so starting there with 0 would be even worse). So restart the candidate at j + 1.</li>
  </ol>
  <table class="tbl">
    <caption>Dry run: gas [1,2,3,4,5], cost [3,4,5,1,2] (gas − cost = [−2,−2,−2,3,3])</caption>
    <tr><th>i</th><th>tank += gas−cost</th><th>tank &lt; 0?</th><th>start</th></tr>
    <tr><td>0</td><td>−2</td><td>yes → reset</td><td>1</td></tr>
    <tr><td>1</td><td>−2</td><td>yes → reset</td><td>2</td></tr>
    <tr><td>2</td><td>−2</td><td>yes → reset</td><td>3</td></tr>
    <tr><td>3</td><td>3</td><td>no</td><td>3</td></tr>
    <tr><td>4</td><td>6</td><td>no</td><td>3 → total 0 ≥ 0, answer 3</td></tr>
  </table>
<div class="fx" data-lang="py">def can_complete_circuit(gas, cost):
    if sum(gas) &lt; sum(cost):
        return -1                          # fact 1: not enough fuel overall
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank &lt; 0:                       # fact 2: nothing from start..i works
            start, tank = i + 1, 0
    return start

print(can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]))
print(can_complete_circuit([2, 3, 4], [3, 4, 3]))
print(can_complete_circuit([5, 1, 2, 3, 4], [4, 4, 1, 5, 1]))
print(can_complete_circuit([4], [5]), can_complete_circuit([5], [4]))</div>
  <div class="fx" data-lang="text">3
-1
4
-1 0</div>
  <p><strong>Complexity:</strong> O(n) time, O(1) space.</p>

  <h2 id="dsa-gr2-traps"><span class="num">08</span>Traps &amp; Complexity</h2>
  <div class="callout trap"><span class="label">Trap: wrong sort key</span>
    <p>Merging needs sort by <strong>start</strong>. Picking the most non-overlapping needs sort by <strong>end</strong>. Mixing them gives wrong answers on inputs like [[1,7],[2,3],[4,5],[6,7]] (shown above: 1 kept instead of 3).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sorting the caller's list</span>
    <p><code>intervals.sort()</code> changes the input in place. Fine on LeetCode; in real code use <code>sorted(intervals)</code> if the caller still needs the original order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting greedy without a check</span>
    <p>"Take the biggest/earliest/cheapest first" feels right for many problems and is wrong for a lot of them (0/1 knapsack, coin change with odd coins, longest path). Spend 30 seconds trying to break it with a 3-item example before coding.</p>
  </div>
  <table class="tbl">
    <tr><th>Problem</th><th>Sort by</th><th>Time</th><th>Extra space</th></tr>
    <tr><td>Merge Intervals</td><td>start</td><td>O(n log n)</td><td>O(n) output</td></tr>
    <tr><td>Insert Interval</td><td>already sorted</td><td>O(n)</td><td>O(n) output</td></tr>
    <tr><td>Non-overlapping Intervals</td><td>end</td><td>O(n log n)</td><td>O(1)</td></tr>
    <tr><td>Meeting Rooms II</td><td>start (heap) / events</td><td>O(n log n)</td><td>O(n)</td></tr>
    <tr><td>Jump Game I / II</td><td>—</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Gas Station</td><td>—</td><td>O(n)</td><td>O(1)</td></tr>
  </table>

  <h2 id="dsa-gr2-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a greedy algorithm, and when is it correct?</summary><div class="qa-body">It picks the locally best option at each step and never revisits. It's correct when the problem has the greedy-choice property (a local best is part of some global best) and optimal substructure. Prove it with an exchange argument; disprove it with a small counter-example.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give an example where greedy coin change fails.</summary><div class="qa-body">Coins {1, 3, 4}, amount 6. Greedy: 4 + 1 + 1 = 3 coins. Optimal: 3 + 3 = 2 coins. Greedy works for Indian currency because each note is a multiple of the ones below it; for arbitrary coin sets, use DP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the overlap test for two intervals.</summary><div class="qa-body"><code>a.start &lt;= b.end and b.start &lt;= a.end</code>. If the list is sorted by start and b comes after a, just <code>b.start &lt;= a.end</code>. Use <code>&lt;</code> instead of <code>&lt;=</code> if touching ends don't count as overlap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge Intervals: why sort by start, and what's the complexity?</summary><div class="qa-body">After sorting by start, any interval that overlaps the current block must overlap its last piece, so you only compare with <code>res[-1]</code>. O(n log n) for the sort, O(n) for the sweep.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Non-overlapping Intervals: why sort by end instead of start?</summary><div class="qa-body">Keeping the interval that ends earliest leaves the most room for later ones. Sorting by start can pick a long early interval that blocks many short ones: [[1,7],[2,3],[4,5],[6,7]] keeps 1 by start but 3 by end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Meeting Rooms II: what does the heap hold and what is its size?</summary><div class="qa-body">End times of meetings currently running, smallest on top. Before adding a meeting, pop the top if that meeting has ended (end ≤ new start). The heap's maximum size during the sweep is the number of rooms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the sweep-line version, why must an end event at time t come before a start event at t?</summary><div class="qa-body">A meeting ending at 10 frees its room for a meeting starting at 10. Sorting tuples <code>(10, -1)</code> before <code>(10, 1)</code> does this. If starts came first, the count would briefly be one too high.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Jump Game: what is the greedy invariant?</summary><div class="qa-body"><code>far</code> = farthest index reachable using the elements seen so far. If some index i &gt; far, i can't be reached, so nothing after it can either. Otherwise <code>far = max(far, i + nums[i])</code>. O(n), O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Gas Station: why can you skip all pumps between a failed start and the failure point?</summary><div class="qa-body">Starting at i, you reached every pump between i and j with tank ≥ 0. Starting at any of those pumps with an empty tank gives less fuel at j, so it fails at j too. So the next candidate is j + 1. Combined with "total gas ≥ total cost means some start works", one pass is enough.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>sorted([[6,8],[1,3],[8,9],[2,5]], key=lambda iv: iv[1])</code> return?</summary><div class="qa-body"><code>[[1, 3], [2, 5], [6, 8], [8, 9]]</code>: sorted by the end value. Without the key, lists sort by first element, then second.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Minimum railway platforms for given arrival/departure times: which technique?</summary><div class="qa-body">Same as Meeting Rooms II. Sweep events (+1 on arrival, −1 on departure) sorted by time, departures before arrivals on ties; the peak running count is the platforms needed. O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose DP over greedy for an interval problem?</summary><div class="qa-body">When intervals have weights (e.g. maximise total value of non-overlapping jobs). Earliest-end greedy ignores value; weighted interval scheduling needs DP with binary search for the last compatible job, O(n log n).</div></details>
</main>`
});
