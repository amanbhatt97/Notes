// notes/dsa/dsa_greedy.js — Intervals & Greedy
Object.assign(TOPIC_CONTENT, {
  "dsa_greedy": `<main>
<h1>Intervals &amp; Greedy</h1>
  <div class="where"><span>DSA</span><span>Problem-Solving Techniques</span><span>Intervals &amp; Greedy</span></div>
  <p class="lead">A greedy algorithm builds an answer by taking the option that looks best right now, at every step, and never going back to change it. When it is correct it is the fastest and shortest solution there is, usually one sort followed by one pass, but it is only correct for some problems, and telling which ones is the real skill. Greedy ideas run delivery dispatch, meeting-room booking, calendar apps and network routing, and interval questions ("merge these time ranges", "how many rooms do we need?") are some of the most common interview problems. This note follows one Biteful evening with seven delivery windows, orders A to G between 6:00 and 7:50 pm, and asks harder and harder questions about them: when is the rider busy, what happens when a new order arrives, how many riders are needed at once, and how many deliveries one rider can take. It then leaves the timeline for two route problems and ends with the most important part: spotting when greedy fails and dynamic programming is needed instead.</p>

  <h2 id="dsa-gr2-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Intervals &amp; Greedy</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Greedy idea</div>
        <ul>
          <li>Take the best option now; never undo</li>
          <li>Correct only with the <b>greedy-choice property</b></li>
          <li>Prove with an <b>exchange argument</b>; break with a tiny counter-example</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Intervals</div>
        <ul>
          <li>Overlap: <code>a.s &lt;= b.e and b.s &lt;= a.e</code></li>
          <li>Merge / insert: sort by <b>start</b></li>
          <li>Most non-overlapping: sort by <b>end</b></li>
          <li>Rooms needed: min-heap of ends, or ±1 sweep</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Routes</div>
        <ul>
          <li>Jump Game: track the farthest reachable index</li>
          <li>Jump Game II: jump at the edge of each range</li>
          <li>Gas Station: reset the start after a deficit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When greedy fails</div>
        <ul>
          <li>Coins 1, 3, 4 for 6: greedy 3 coins, best 2</li>
          <li>Weighted intervals: greedy ₹90, best ₹140</li>
          <li>Choices interact → DP</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-gr2-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Greedy Idea</span><span class="rm-sub">best option now, never look back</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-iv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Intervals and the Overlap Test</span><span class="rm-sub">seven delivery windows on a timeline</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-merge"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Merge &amp; Insert Interval</span><span class="rm-sub">when is the rider busy?</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-rooms"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Meeting Rooms (Riders Needed)</span><span class="rm-sub">the most deliveries running at once</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-nonov"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Activity Selection</span><span class="rm-sub">most deliveries for one rider, and the proof</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-jump"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Jump Game &amp; Gas Station</span><span class="rm-sub">greedy on a route</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-fail"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">When Greedy Fails</span><span class="rm-sub">counter-examples, and handing over to DP</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-pat"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">trigger words, skeleton, what to practise</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">sort key, touching ends, shrinking blocks</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">templates, costs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about greedy and intervals</span></div></div>
    </div>
  </div>

  <h2 id="dsa-gr2-idea"><span class="num">01</span>The Greedy Idea</h2>
  <p>In the Backtracking note, "choose the best set of items" meant trying every combination, 2<sup>n</sup> of them. That is safe but slow. Sometimes there is a much faster way: make one obvious choice at a time and never look at the alternatives. A shopkeeper giving ₹78 in change does not consider every combination of notes and coins. He hands over the biggest note that fits (₹50), then the biggest that fits what is left (₹20), then ₹5, ₹2 and ₹1, and he is done in seconds.</p>
  <p>That is a <strong>greedy algorithm</strong>: an algorithm that builds a solution step by step, at each step taking the choice that looks best at that moment, and never revising it. There is no recursion tree and no table; most greedy solutions are a sort to put the options in the right order, followed by a single pass. Here is the shopkeeper's rule in code, for a Biteful rider whose customer pays for a ₹120 order with a ₹500 note:</p>
  <div class="fx" data-lang="py">def make_change(amount, notes=(500, 200, 100, 50, 20, 10, 5, 2, 1)):
    used = []
    for n in notes:                 # biggest note first
        while amount &gt;= n:          # take it as long as it fits
            used.append(n)
            amount -= n
    return used

print("change for Rs 380:", make_change(500 - 120))   # order A costs 120, paid with 500
print("change for Rs 78: ", make_change(78))</div>
  <div class="fx" data-lang="text">change for Rs 380: [200, 100, 50, 20, 10]
change for Rs 78:  [50, 20, 5, 2, 1]</div>
  <p>₹380 comes back as 200, 100, 50, 20, 10: at each step the largest note that still fits is taken, and the remaining amount shrinks from 380 to 180, 80, 30, 10 and finally 0. Five notes is the fewest possible here, and the algorithm never had to compare options.</p>
  <p>The catch is that "best right now" is not always best overall. Think of filling a suitcase: grabbing the biggest item first feels right, but it can block an arrangement that fits more. A greedy algorithm is correct only when the problem has the <strong>greedy-choice property</strong>: some optimal answer contains the locally best first choice, so committing to it never closes the door on the best result. Indian currency has this property, because each note is a "clean" multiple of the smaller ones; section 07 shows coin systems that do not. Greedy code is so short that it always <em>looks</em> right, so the habit to build is: argue why the greedy choice is safe (section 05 shows the standard argument), and try to break it with a three-item example before trusting it (section 07).</p>

  <h2 id="dsa-gr2-iv"><span class="num">02</span>Intervals and the Overlap Test</h2>
  <p>For notes, "best" meant "biggest". Tonight's real problem is a set of delivery windows, and before asking which one is "best" we need a way to talk about them. An <strong>interval</strong> is a stretch of a line given by a start and an end, written <code>[start, end]</code>: a meeting from 9 to 10, a train journey from 14:00 to 18:30, a delivery window from 6:15 to 6:30. Here are the seven windows we will use throughout, in minutes after 6:00 pm:</p>
  <table class="tbl"><caption>The running example: tonight's delivery windows</caption>
    <tr><th>order</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th></tr>
    <tr><th>window (min)</th><td>[0, 50]</td><td>[10, 20]</td><td>[15, 30]</td><td>[30, 45]</td><td>[40, 70]</td><td>[60, 80]</td><td>[90, 110]</td></tr>
    <tr><th>clock</th><td>6:00–6:50</td><td>6:10–6:20</td><td>6:15–6:30</td><td>6:30–6:45</td><td>6:40–7:10</td><td>7:00–7:20</td><td>7:30–7:50</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
<text x="20" y="27" font-size="11">A</text><text x="40" y="27" class="tm" font-size="9">0–50</text>
<rect x="70" y="14" width="210" height="16" rx="3" class="fb sb"/>
<text x="20" y="51" font-size="11">B</text><text x="40" y="51" class="tm" font-size="9">10–20</text>
<rect x="112" y="38" width="42" height="16" rx="3" class="fb sb"/>
<text x="20" y="75" font-size="11">C</text><text x="40" y="75" class="tm" font-size="9">15–30</text>
<rect x="133" y="62" width="63" height="16" rx="3" class="fb sb"/>
<text x="20" y="99" font-size="11">D</text><text x="40" y="99" class="tm" font-size="9">30–45</text>
<rect x="196" y="86" width="63" height="16" rx="3" class="fb sb"/>
<text x="20" y="123" font-size="11">E</text><text x="40" y="123" class="tm" font-size="9">40–70</text>
<rect x="238" y="110" width="126" height="16" rx="3" class="fb sb"/>
<text x="20" y="147" font-size="11">F</text><text x="40" y="147" class="tm" font-size="9">60–80</text>
<rect x="322" y="134" width="84" height="16" rx="3" class="fb sb"/>
<text x="20" y="171" font-size="11">G</text><text x="40" y="171" class="tm" font-size="9">90–110</text>
<rect x="448" y="158" width="84" height="16" rx="3" class="fb sb"/>
<line x1="70.0" y1="186" x2="574.0" y2="186" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="70" y1="186" x2="70" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="70" y="202" text-anchor="middle" class="tm" font-size="10">6:00</text>
<line x1="154" y1="186" x2="154" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="154" y="202" text-anchor="middle" class="tm" font-size="10">6:20</text>
<line x1="238" y1="186" x2="238" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="238" y="202" text-anchor="middle" class="tm" font-size="10">6:40</text>
<line x1="322" y1="186" x2="322" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="322" y="202" text-anchor="middle" class="tm" font-size="10">7:00</text>
<line x1="406" y1="186" x2="406" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="406" y="202" text-anchor="middle" class="tm" font-size="10">7:20</text>
<line x1="490" y1="186" x2="490" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="490" y="202" text-anchor="middle" class="tm" font-size="10">7:40</text>
<line x1="574" y1="186" x2="574" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="574" y="202" text-anchor="middle" class="tm" font-size="10">8:00</text>
<line x1="196" y1="8" x2="196" y2="182" stroke="currentColor" stroke-dasharray="3 3" stroke-opacity="0.6"/>
<text x="200" y="10" class="tm" font-size="9">C ends, D starts (touch)</text>
</svg><figcaption>Tonight's seven windows on a timeline. A is long and overlaps B, C, D and E. C ends exactly when D starts (dashed line).</figcaption></figure>
  <p>Almost every interval question comes down to one smaller question: do two intervals <strong>overlap</strong>, that is, share some time? Two windows overlap exactly when neither one ends before the other begins, which in code is <code>a.start &lt;= b.end and b.start &lt;= a.end</code>. Look at the picture: A and B overlap, B and D do not (B is over by 6:20 and D starts at 6:30), and C and D touch at exactly 6:30.</p>
  <div class="fx" data-lang="py">def overlap(a, b):
    return a[0] &lt;= b[1] and b[0] &lt;= a[1]      # neither ends before the other starts

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}   # minutes after 6:00 pm
print("A,B:", overlap(windows["A"], windows["B"]),
      " B,D:", overlap(windows["B"], windows["D"]),
      " C,D:", overlap(windows["C"], windows["D"]))

names = sorted(windows)
clash = [(p, q) for i, p in enumerate(names) for q in names[i + 1:]
         if overlap(windows[p], windows[q])]
print(len(names) * (len(names) - 1) // 2, "pair checks -&gt;", clash)
print("by start:", sorted(windows, key=lambda k: windows[k][0]))
print("by end:  ", sorted(windows, key=lambda k: windows[k][1]))</div>
  <div class="fx" data-lang="text">A,B: True  B,D: False  C,D: True
21 pair checks -&gt; [('A', 'B'), ('A', 'C'), ('A', 'D'), ('A', 'E'), ('B', 'C'), ('C', 'D'), ('D', 'E'), ('E', 'F')]
by start: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
by end:   ['B', 'C', 'D', 'A', 'E', 'F', 'G']</div>
  <p>Checking every pair of 7 windows takes 21 checks and finds 8 clashing pairs; for n windows, all pairs is n(n − 1)/2 checks, which is O(n²). The touching pair C, D counts as overlapping with <code>&lt;=</code>. Whether touching should count depends on the question: LeetCode's Merge Intervals treats [1, 3] and [3, 5] as overlapping, while Non-overlapping Intervals and Meeting Rooms treat them as compatible, because a delivery can start the minute another ends. In an interview, ask, or state your assumption out loud.</p>
  <p>The way out of all-pairs checking is <strong>sorting</strong>. A railway timetable is printed in order of departure, so to see whether a train is still at the platform when the next one arrives you only look at the line above; nobody compares the 6:00 train with the 23:00 train. In the same way, once intervals are sorted by start, each one only needs to be compared with the one just before it, or with a running summary of everything before it. Sorting costs O(n log n) and the pass after it costs O(n). Walking through sorted intervals from left to right while keeping a small running state is called a <strong>sweep</strong>. The last two output lines show that sorting by start and sorting by end give different orders (by end, B, C and D come before A), and choosing which key to sort by is the main design decision in every problem that follows.</p>

  <h2 id="dsa-gr2-merge"><span class="num">03</span>Merge &amp; Insert Interval</h2>
  <p>The dispatcher's first question is: during which stretches of the evening is at least one delivery running? In other words, merge all overlapping windows into "busy" blocks (Merge Intervals, LeetCode 56). Comparing every pair and merging until nothing changes works but is O(n²) or worse. The greedy way is to sort by start and sweep once, keeping a result list: if the next window starts at or before the end of the last block, it overlaps, so stretch the block's end; otherwise there is a gap, so start a new block. Think of laying tape along a wall from left to right: if the next stripe starts before the current tape ends, you pull the tape further; if there is a gap, you cut the tape and start a new strip.</p>
  <div class="fx" data-lang="py">def merge(intervals):
    intervals = sorted(intervals, key=lambda iv: iv[0])   # by start (a new list)
    res = []
    for s, e in intervals:
        if res and s &lt;= res[-1][1]:               # overlaps the last block
            res[-1][1] = max(res[-1][1], e)       # stretch its end
            print(f"[{s:&gt;3},{e:&gt;3}] overlaps -&gt; block {res[-1]}")
        else:
            res.append([s, e])                    # a gap: start a new block
            print(f"[{s:&gt;3},{e:&gt;3}] gap      -&gt; new   {res[-1]}")
    return res

windows = [[0, 50], [10, 20], [15, 30], [30, 45], [40, 70], [60, 80], [90, 110]]
print("busy:", merge(windows))</div>
  <div class="fx" data-lang="text">[  0, 50] gap      -&gt; new   [0, 50]
[ 10, 20] overlaps -&gt; block [0, 50]
[ 15, 30] overlaps -&gt; block [0, 50]
[ 30, 45] overlaps -&gt; block [0, 50]
[ 40, 70] overlaps -&gt; block [0, 70]
[ 60, 80] overlaps -&gt; block [0, 80]
[ 90,110] gap      -&gt; new   [90, 110]
busy: [[0, 80], [90, 110]]</div>
  <p>A opens the first block [0, 50]. B, C and D all start inside it and end before 50, so the block does not change. E starts at 40, inside the block, and ends at 70, so the block stretches to [0, 70]; F stretches it to [0, 80]. G starts at 90, after 80, so it opens a new block. The rider is busy from 6:00 to 7:20 and from 7:30 to 7:50, with a ten-minute break in between. Notice the <code>max</code> when stretching: B ends at 20, which is earlier than the block's 50, and a short window inside a long one must never shrink the block. The cost is O(n log n) for the sort plus O(n) for the pass, and O(n) space for the output.</p>
  <p>At 7:25 a new order H arrives with window [85, 95]. The busy blocks are already sorted and non-overlapping, so re-sorting everything with <code>merge</code> would work in O(n log n), but an interviewer will want O(n) (Insert Interval, LeetCode 57). Because the blocks are sorted, they fall into three groups in order: blocks that end before the new window starts (copy them unchanged), blocks that overlap the new window (absorb each one by widening the new window), and blocks that start after it (copy them unchanged).</p>
  <div class="fx" data-lang="py">def insert(blocks, new):
    res, i, n = [], 0, len(blocks)
    while i &lt; n and blocks[i][1] &lt; new[0]:        # 1. ends before new starts: copy
        res.append(blocks[i]); i += 1
    while i &lt; n and blocks[i][0] &lt;= new[1]:       # 2. overlaps new: absorb it
        new = [min(new[0], blocks[i][0]), max(new[1], blocks[i][1])]
        i += 1
    res.append(new)
    res.extend(blocks[i:])                        # 3. starts after new: copy
    return res

busy = [[0, 80], [90, 110]]
print(insert(busy, [85, 95]))      # new order H, 7:25-7:35
print(insert(busy, [82, 88]))      # fits in the gap
print(insert(busy, [70, 100]))     # bridges both blocks</div>
  <div class="fx" data-lang="text">[[0, 80], [85, 110]]
[[0, 80], [82, 88], [90, 110]]
[[0, 110]]</div>
  <p>For H, the block [0, 80] ends before 85, so it is copied. The block [90, 110] starts at 90, which is before H ends at 95, so it is absorbed and H widens to [85, 110]. The second call, [82, 88], falls neatly into the gap and touches nothing; the third, [70, 100], overlaps both blocks and swallows them into [0, 110]. Note the comparisons: phase 1 uses strict <code>&lt;</code> ("ends before the new one starts") and phase 2 uses <code>&lt;=</code>, which keeps the touching convention of Merge Intervals. Recognise these problems from "merge overlapping", "busy or free slots", "union of ranges", "total time covered" and "insert into a sorted list of intervals".</p>

  <h2 id="dsa-gr2-rooms"><span class="num">04</span>Meeting Rooms (Riders Needed)</h2>
  <p>Merging tells us the evening is busy from 6:00 to 7:20, but not <em>how</em> busy. At 6:15, A, B and C are all running at the same time. Each rider does one delivery at a time, so the operations team needs to know the largest number of deliveries running at any single instant: that is how many riders must be on duty. The classic version of this question is Meeting Rooms II (LeetCode 253), where meetings need rooms; here riders are the rooms. A delivery may start the minute another ends.</p>
  <p>The first way to answer it uses a min-heap from <a class="xref" data-note="dsa_heaps">Heaps</a>, a structure that always gives you its smallest item in O(log n). Think of the dispatcher's board listing when each hired rider will be free, earliest at the top. Go through the windows in order of start time. For each one, look at the top of the board: if that rider is already free by the time this window starts, give them this delivery (pop their old free-at time); otherwise hire a new rider. Either way, push this window's end, the time this rider will be free again. The largest size the heap ever reaches is the number of riders needed.</p>
  <div class="fx" data-lang="py">import heapq

def min_riders_heap(windows):
    order = sorted(windows.items(), key=lambda kv: kv[1][0])   # by start
    ends = []                                  # min-heap: when each hired rider is free
    riders = 0
    for name, (s, e) in order:
        freed = bool(ends) and ends[0] &lt;= s    # is the earliest-free rider free by now?
        if freed:
            heapq.heappop(ends)                # reuse that rider
        heapq.heappush(ends, e)
        riders = max(riders, len(ends))
        print(f"{name} [{s:&gt;3},{e:&gt;3}] {'reuse' if freed else 'hire '}  free-at times={sorted(ends)}")
    return riders

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}
print("riders needed:", min_riders_heap(windows))</div>
  <div class="fx" data-lang="text">A [  0, 50] hire   free-at times=[50]
B [ 10, 20] hire   free-at times=[20, 50]
C [ 15, 30] hire   free-at times=[20, 30, 50]
D [ 30, 45] reuse  free-at times=[30, 45, 50]
E [ 40, 70] reuse  free-at times=[45, 50, 70]
F [ 60, 80] reuse  free-at times=[50, 70, 80]
G [ 90,110] reuse  free-at times=[70, 80, 110]
riders needed: 3</div>
  <p>A, B and C each find the earliest-free rider still busy, so three riders are hired, and the heap holds [20, 30, 50]. When D starts at 30, the top of the heap is 20 (B's rider is free), so that rider is reused. E, F and G each reuse a rider in the same way, and the heap never grows past 3. The heap keeps one entry per <em>hired</em> rider, not per busy one: at G, the riders free at 70 and 80 are idle but still listed. That is fine, because we only need the most riders ever hired, and we pop at most one per window.</p>
  <p>The second way is the <strong>sweep line</strong>. Think of a guard at a hall door counting people: every start is "+1", every end is "−1". Turn each window into those two events, sort all events by time, walk through them with a running count, and remember the highest value. The green line below is that running count for tonight.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
<line x1="70.0" y1="130" x2="574.0" y2="130" stroke="currentColor" stroke-opacity="0.12"/><text x="60.0" y="134" text-anchor="end" class="tm" font-size="10">0</text>
<line x1="70.0" y1="100" x2="574.0" y2="100" stroke="currentColor" stroke-opacity="0.12"/><text x="60.0" y="104" text-anchor="end" class="tm" font-size="10">1</text>
<line x1="70.0" y1="70" x2="574.0" y2="70" stroke="currentColor" stroke-opacity="0.12"/><text x="60.0" y="74" text-anchor="end" class="tm" font-size="10">2</text>
<line x1="70.0" y1="40" x2="574.0" y2="40" stroke="currentColor" stroke-opacity="0.12"/><text x="60.0" y="44" text-anchor="end" class="tm" font-size="10">3</text>
<polyline fill="none" class="sg" stroke-width="2.5" points="70,130 70,100 112,100 112,70 133,70 133,40 154,40 154,70 196,70 196,100 196,100 196,70 238,70 238,40 259,40 259,70 280,70 280,100 322,100 322,70 364,70 364,100 406,100 406,130 448,130 448,100 532,100 532,130 574,130"/>
<text x="141" y="34" text-anchor="middle" class="tg" font-size="10">peak 3 (A, B, C)</text>
<text x="246" y="34" text-anchor="middle" class="tg" font-size="10">3 (A, D, E)</text>
<line x1="70.0" y1="136" x2="574.0" y2="136" stroke="currentColor" stroke-opacity="0.5"/>
<text x="70" y="152" text-anchor="middle" class="tm" font-size="10">6:00</text>
<text x="154" y="152" text-anchor="middle" class="tm" font-size="10">6:20</text>
<text x="238" y="152" text-anchor="middle" class="tm" font-size="10">6:40</text>
<text x="322" y="152" text-anchor="middle" class="tm" font-size="10">7:00</text>
<text x="406" y="152" text-anchor="middle" class="tm" font-size="10">7:20</text>
<text x="490" y="152" text-anchor="middle" class="tm" font-size="10">7:40</text>
<text x="574" y="152" text-anchor="middle" class="tm" font-size="10">8:00</text>
</svg><figcaption>Deliveries running at each moment. The line rises by one at each start and falls by one at each end; its highest point, 3, is the number of riders needed.</figcaption></figure>
  <p>The line climbs to 3 at 6:15 (A, B and C running) and again at 6:40 (A, D and E). At 6:30 it dips briefly, because C's end is processed before D's start. That ordering is exactly what Python's tuple sorting gives for free: <code>(30, -1)</code> sorts before <code>(30, 1)</code>, so a rider is freed before the next delivery at the same minute takes one.</p>
  <div class="fx" data-lang="py">def min_riders_sweep(intervals):
    events = []
    for s, e in intervals:
        events.append((s, 1))                  # a delivery starts
        events.append((e, -1))                 # a delivery ends
    events.sort()                              # at equal times (t, -1) sorts before (t, 1)
    running = peak = 0
    for t, delta in events:
        running += delta
        peak = max(peak, running)
    return peak

windows = [[0, 50], [10, 20], [15, 30], [30, 45], [40, 70], [60, 80], [90, 110]]
print("peak:", min_riders_sweep(windows))</div>
  <div class="fx" data-lang="text">peak: 3</div>
  <p>Both methods give 3 and both cost O(n log n) time for the sort and O(n) space. The heap version can also tell you <em>which</em> rider takes which delivery; the sweep is shorter and extends naturally to weighted counts, such as Car Pooling, where each trip adds its number of passengers instead of 1. Recognise this pattern from "minimum number of rooms, platforms, riders or cars", "maximum overlapping at once" and "divide into the fewest groups with no overlap".</p>

  <h2 id="dsa-gr2-nonov"><span class="num">05</span>Activity Selection</h2>
  <p>Now flip the question. On a slow night there is only one rider. Which deliveries should they accept to complete as many as possible, with no two windows clashing (touching is fine)? Trying every subset is 2<sup>7</sup> = 128 checks here and 2<sup>n</sup> in general. This is the classic <strong>activity selection</strong> problem: from a list of events, attend the most without any clash. LeetCode phrases it as "remove the fewest intervals so that the rest do not overlap" (Non-overlapping Intervals, 435), which is the same thing, since removals = n − kept.</p>
  <p>The greedy choice is: always take the window that <strong>ends earliest</strong>. Ending early leaves the most time for everything after it. Think of a film festival where shows clash and you want to see as many films as possible: whatever you could watch after a show that finishes at 9:30, you can also watch after one that finishes at 9:00. So sort by end, sweep once, and keep a window if it starts at or after the end of the last kept one. To see why the sort key matters, the code also tries sorting by start:</p>
  <div class="fx" data-lang="py">def max_deliveries(windows, key):
    kept, last_end = [], float("-inf")
    for name in sorted(windows, key=key):
        s, e = windows[name]
        if s &gt;= last_end:                       # no clash with the last kept window
            kept.append(name)
            last_end = e
    return kept

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}
print("earliest end   :", max_deliveries(windows, key=lambda k: windows[k][1]))
print("earliest start :", max_deliveries(windows, key=lambda k: windows[k][0]))</div>
  <div class="fx" data-lang="text">earliest end   : ['B', 'D', 'F', 'G']
earliest start : ['A', 'F', 'G']</div>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
<text x="20" y="27" font-size="11">A</text><text x="40" y="27" class="tm" font-size="9">0–50</text>
<rect x="70" y="14" width="210" height="16" rx="3" class="fr sr"/>
<text x="20" y="51" font-size="11">B</text><text x="40" y="51" class="tm" font-size="9">10–20</text>
<rect x="112" y="38" width="42" height="16" rx="3" class="fg sg"/>
<text x="20" y="75" font-size="11">C</text><text x="40" y="75" class="tm" font-size="9">15–30</text>
<rect x="133" y="62" width="63" height="16" rx="3" class="fr sr"/>
<text x="20" y="99" font-size="11">D</text><text x="40" y="99" class="tm" font-size="9">30–45</text>
<rect x="196" y="86" width="63" height="16" rx="3" class="fg sg"/>
<text x="20" y="123" font-size="11">E</text><text x="40" y="123" class="tm" font-size="9">40–70</text>
<rect x="238" y="110" width="126" height="16" rx="3" class="fr sr"/>
<text x="20" y="147" font-size="11">F</text><text x="40" y="147" class="tm" font-size="9">60–80</text>
<rect x="322" y="134" width="84" height="16" rx="3" class="fg sg"/>
<text x="20" y="171" font-size="11">G</text><text x="40" y="171" class="tm" font-size="9">90–110</text>
<rect x="448" y="158" width="84" height="16" rx="3" class="fg sg"/>
<line x1="70.0" y1="186" x2="574.0" y2="186" stroke="currentColor" stroke-opacity="0.5"/>
<text x="70" y="202" text-anchor="middle" class="tm" font-size="10">6:00</text>
<text x="154" y="202" text-anchor="middle" class="tm" font-size="10">6:20</text>
<text x="238" y="202" text-anchor="middle" class="tm" font-size="10">6:40</text>
<text x="322" y="202" text-anchor="middle" class="tm" font-size="10">7:00</text>
<text x="406" y="202" text-anchor="middle" class="tm" font-size="10">7:20</text>
<text x="490" y="202" text-anchor="middle" class="tm" font-size="10">7:40</text>
<text x="574" y="202" text-anchor="middle" class="tm" font-size="10">8:00</text>
</svg><figcaption>Earliest-end greedy keeps the green windows B, D, F and G. Each red window clashes with a kept one.</figcaption></figure>
  <p>Sorted by end, the order is B (20), C (30), D (45), A (50), E (70), F (80), G (110). B is kept and the last end becomes 20. C starts at 15, before 20, so it is dropped. D starts at 30, so it is kept and the last end becomes 45. A starts at 0 and E at 40, both before 45, so both are dropped. F starts at 60 and G at 90, so both are kept: four deliveries. Sorting by start instead takes A first, because it starts at 6:00, and that one long window blocks B, C, D and E, leaving only three. Is four really the best possible? A brute-force check over every subset agrees:</p>
  <div class="fx" data-lang="py">from itertools import combinations

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}
def ok(group):
    ivs = sorted(windows[k] for k in group)
    return all(ivs[i][1] &lt;= ivs[i + 1][0] for i in range(len(ivs) - 1))

best = max((g for r in range(8) for g in combinations(windows, r) if ok(g)), key=len)
print("checked all", 2 ** 7, "subsets -&gt;", best)</div>
  <div class="fx" data-lang="text">checked all 128 subsets -&gt; ('B', 'D', 'F', 'G')</div>
  <p>Checking a few examples is reassuring, but the reason greedy is always right here is an <strong>exchange argument</strong>, the standard way to prove a greedy algorithm correct: show that any optimal answer can be changed, one swap at a time, into the greedy answer without getting worse. Take any best schedule, say one that starts with C (ending at 30). Greedy's first pick, B, ends at 20, no later than C. Swap C for B: everything after C in that schedule starts at 30 or later, which is also after 20, so nothing clashes and the count is unchanged. Now the best schedule and greedy agree on the first choice, and the same argument repeats on what comes after. No swap ever loses a delivery, so greedy keeps as many as the best schedule.</p>
  <p>The LeetCode form counts removals instead of keeping a list:</p>
  <div class="fx" data-lang="py">def erase_overlap(intervals):
    removed, last_end = 0, float("-inf")
    for s, e in sorted(intervals, key=lambda iv: iv[1]):   # by END
        if s &gt;= last_end:
            last_end = e                        # keep it
        else:
            removed += 1                        # drop it: it ends later than the kept one
    return removed

print(erase_overlap([[0, 50], [10, 20], [15, 30], [30, 45], [40, 70], [60, 80], [90, 110]]))
print(erase_overlap([[1, 7], [2, 3], [4, 5], [6, 7]]))</div>
  <div class="fx" data-lang="text">3
1</div>
  <p>Seven windows minus four kept gives 3 removals. The second test, [[1, 7], [2, 3], [4, 5], [6, 7]], is the same trap as window A: one long early interval that a sort by start would keep, blocking three short ones. Activity selection costs O(n log n) time for the sort and O(1) extra space. Recognise it from "maximum number of non-overlapping", "minimum removals so none overlap", "attend the most events", "longest chain of pairs" and "minimum arrows to burst balloons".</p>

  <h2 id="dsa-gr2-jump"><span class="num">06</span>Jump Game &amp; Gas Station</h2>
  <p>Intervals are not the only place greedy works. On a route the stops come in a fixed order, so there is nothing to sort, but one pass while remembering one number can still decide the answer. The rider's e-scooter travels along stops 0, 1, 2, …; at stop i a quick charge gives enough battery to go at most <code>nums[i]</code> stops further. Starting at stop 0, can the rider reach the last stop (Jump Game, LeetCode 55)? Backtracking would try every jump length at every stop, which is exponential. The greedy insight is that you never need to know <em>which</em> jumps to take, only <em>how far</em> you could possibly get. Keep <code>far</code>, the farthest stop reachable so far, and walk left to right: if the current stop is beyond <code>far</code>, you could never have arrived there, so you are stuck; otherwise update <code>far = max(far, i + nums[i])</code>.</p>
  <div class="fx" data-lang="py">def can_jump(nums):
    far = 0                         # farthest stop reachable so far
    for i, step in enumerate(nums):
        if i &gt; far:                 # this stop was never reachable
            print(f"stop {i}: beyond far={far} -&gt; stuck")
            return False
        far = max(far, i + step)
        print(f"stop {i}: battery {step}, far = {far}")
    return True

print(can_jump([3, 2, 1, 0, 4]))</div>
  <div class="fx" data-lang="text">stop 0: battery 3, far = 3
stop 1: battery 2, far = 3
stop 2: battery 1, far = 3
stop 3: battery 0, far = 3
stop 4: beyond far=3 -&gt; stuck
False</div>
  <p>On the route [3, 2, 1, 0, 4], stop 0 allows reaching stop 3, and stops 1, 2 and 3 never push <code>far</code> beyond 3, because every path lands on the stop with 0 battery. At stop 4 the check <code>4 &gt; far</code> fires, so the answer is False. On tonight's actual route [2, 3, 1, 1, 4] <code>far</code> reaches the end, so the answer is True.</p>
  <p>Jump Game II (LeetCode 45) asks how few charging stops the rider needs to reach the end. Think of it as levels, as in breadth-first search: everything reachable with one jump is level 1, everything reachable from those is level 2, and so on. While walking through the current level, keep track of <code>far</code>. When you reach the edge of the current level (<code>i == cur_end</code>), you must charge, and you charge to go as far as anything in this level allows.</p>
  <div class="fx" data-lang="py">def min_jumps(nums):
    jumps = cur_end = far = 0
    for i in range(len(nums) - 1):  # the last stop never needs a jump out of it
        far = max(far, i + nums[i])
        if i == cur_end:            # edge of what the current charges can reach
            jumps += 1
            cur_end = far
            print(f"stop {i}: must charge (#{jumps}), can now reach stop {cur_end}")
    return jumps

print("charges:", min_jumps([2, 3, 1, 1, 4]))</div>
  <div class="fx" data-lang="text">stop 0: must charge (#1), can now reach stop 2
stop 2: must charge (#2), can now reach stop 4
charges: 2</div>
  <p>At stop 0 the first charge is needed, and it can reach stop 2. While walking stops 1 and 2, <code>far</code> grows to 4 (stop 1 has battery 3). At stop 2, the edge of the first level, the second charge is needed, and it reaches stop 4, the end. Two charges: stop 0 → stop 1 → stop 4. The loop stops before the last stop, because standing on the last stop never requires another jump; running it one step further would count one jump too many. Both Jump Game problems are O(n) time and O(1) space.</p>
  <p>Gas Station (LeetCode 134) puts restaurants on a circular loop. At restaurant i the rider gains <code>gas[i]</code> units of charge, and riding on to restaurant i + 1 costs <code>cost[i]</code>. Starting with an empty battery, from which restaurant can the rider complete one full circle? Trying every start and simulating the loop is O(n²). Two facts make it one pass. First, if the total charge gained is less than the total cost, no start can work; otherwise some start always does. Second, if you start at i and the tank goes negative when leaving j, then no restaurant between i and j can be a valid start either: you arrived at each of them with a non-negative tank, so starting there with an empty one can only be worse. So when the tank goes negative, restart the candidate at j + 1 with an empty tank.</p>
  <div class="fx" data-lang="py">def can_complete_circuit(gas, cost):
    if sum(gas) &lt; sum(cost):
        return -1                          # not enough charge around the whole loop
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank &lt; 0:                       # failed leaving i: no start in start..i works
            print(f"tank {tank} after restaurant {i}: restart from {i + 1}")
            start, tank = i + 1, 0
    return start

print("start at:", can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]))
print("start at:", can_complete_circuit([2, 3, 4], [3, 4, 3]))</div>
  <div class="fx" data-lang="text">tank -2 after restaurant 0: restart from 1
tank -2 after restaurant 1: restart from 2
tank -2 after restaurant 2: restart from 3
start at: 3
start at: -1</div>
  <p>With gains [1, 2, 3, 4, 5] and costs [3, 4, 5, 1, 2], each of the first three restaurants loses 2, so the candidate moves to 1, then 2, then 3. From 3 the tank goes to 3 and then 6 and never drops below zero, and since total gain (15) equals total cost (15), the answer is 3. The second loop gains 9 but costs 10, so the total check returns −1 straight away. This "reset after a deficit" idea is the same as Kadane's algorithm in the <a class="xref" data-note="dsa_arrays">Arrays</a> note: a stretch with a negative running total can only hurt whatever follows it. O(n) time, O(1) space. Recognise these from "can you reach the last index", "minimum number of jumps", "circular route", "starting station" and "partition so each letter appears in one part".</p>

  <h2 id="dsa-gr2-fail"><span class="num">07</span>When Greedy Fails</h2>
  <p>Every greedy so far came with a reason it is safe. When that reason is missing, the same "take the best now" instinct gives wrong answers that look perfectly reasonable. Imagine a country with coins of 1, 3 and 4, and you need to pay 6. Greedy takes the biggest coin, 4, and then has to pay the remaining 2 with two 1s: three coins. But 3 + 3 is only two coins. The first pick looked best and left an awkward remainder that only small coins could pay. The code compares greedy with a DP that tries every possible last coin:</p>
  <div class="fx" data-lang="py">def greedy_coins(amount, coins):
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else None

def best_coins(amount, coins):          # DP: tries every last coin (see the DP note)
    best = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c &lt;= a:
                best[a] = min(best[a], best[a - c] + 1)
    return best[amount]

for amount, coins in [(380, [1, 2, 5, 10, 20, 50, 100, 200, 500]), (6, [1, 3, 4]), (12, [1, 5, 8])]:
    print(f"amount {amount:3} coins {coins}: greedy={greedy_coins(amount, coins)}  best={best_coins(amount, coins)}")

def shortest_first(windows):            # another tempting greedy for "most deliveries"
    kept = []
    for s, e in sorted(windows, key=lambda iv: iv[1] - iv[0]):
        if all(e &lt;= ks or s &gt;= ke for ks, ke in kept):
            kept.append((s, e))
    return kept
print("shortest first:", shortest_first([(0, 10), (9, 12), (11, 20)]))</div>
  <div class="fx" data-lang="text">amount 380 coins [1, 2, 5, 10, 20, 50, 100, 200, 500]: greedy=5  best=5
amount   6 coins [1, 3, 4]: greedy=3  best=2
amount  12 coins [1, 5, 8]: greedy=5  best=4
shortest first: [(9, 12)]</div>
  <p>With Indian notes the two agree on ₹380 (five notes). With coins {1, 3, 4} or {1, 5, 8} they disagree: greedy uses 3 and 5 coins where 2 and 4 are possible. The last line is another tempting greedy for "most deliveries": take the shortest window first. On [(0, 10), (9, 12), (11, 20)] it takes the short window (9, 12), which clashes with both others, so it keeps one delivery where two were possible. Only "earliest end" has an exchange argument behind it.</p>
  <p>The most important failure for interviews is on our own evening. Suppose each delivery pays a different fee: A ₹90, B ₹20, C ₹25, D ₹20, E ₹60, F ₹20 and G ₹30, and the rider wants the most <em>money</em>, not the most deliveries.</p>
  <div class="fx" data-lang="py">from itertools import combinations
# the same 7 windows, now each delivery pays a different fee (Rs)
windows = {"A": (0, 50, 90), "B": (10, 20, 20), "C": (15, 30, 25), "D": (30, 45, 20),
           "E": (40, 70, 60), "F": (60, 80, 20), "G": (90, 110, 30)}

def ok(group):
    ivs = sorted(windows[k][:2] for k in group)
    return all(ivs[i][1] &lt;= ivs[i + 1][0] for i in range(len(ivs) - 1))
pay = lambda g: sum(windows[k][2] for k in g)

greedy = ["B", "D", "F", "G"]                      # earliest-end greedy from before
best = max((g for r in range(8) for g in combinations(windows, r) if ok(g)), key=pay)
print("earliest-end greedy:", greedy, "pays", pay(greedy))
print("best over all sets: ", list(best), "pays", pay(best))</div>
  <div class="fx" data-lang="text">earliest-end greedy: ['B', 'D', 'F', 'G'] pays 90
best over all sets:  ['A', 'F', 'G'] pays 140</div>
  <p>Earliest-end greedy still picks B, D, F and G, four deliveries for ₹90. But taking the long window A (₹90) and then F and G earns ₹140. The exchange argument breaks: swapping the first window of the best schedule for the earliest-ending one keeps the <em>count</em> the same but can lose <em>money</em>, because B pays far less than A. Once the choices interact like this, you have to compare "take this window" against "skip it" for every window and remember the best result for each starting point, which is <a class="xref" data-note="dsa_dp">Dynamic Programming</a>. This problem, weighted interval scheduling (Maximum Profit in Job Scheduling, LeetCode 1235), is solved by sorting by end and, for each job, binary-searching the last job that does not clash, in O(n log n).</p>
  <p>So how do you decide before coding? Greedy needs two properties: the <strong>greedy-choice property</strong> (a locally best first choice is part of some optimal answer) and <strong>optimal substructure</strong> (after that choice, what remains is a smaller copy of the same problem). DP needs only the second, which is why DP works in more places but costs more. In practice, spend thirty seconds trying to break your greedy with a tiny example of three to five items, especially one where an early "best" pick blocks two good later ones. The examples in the problem statement are usually chosen so that greedy works, so make your own. If you cannot break it and can sketch the exchange argument, greedy is safe; if you can break it, think DP.</p>
  <table class="tbl">
    <tr><th>Greedy works</th><th>Greedy fails</th></tr>
    <tr><td>Change with Indian currency</td><td>Change with coins like {1, 3, 4} (DP)</td></tr>
    <tr><td>Most non-overlapping windows (sort by end)</td><td>Most money from non-overlapping windows (weighted: DP)</td></tr>
    <tr><td>Fractional knapsack: best value per kg first</td><td>0/1 knapsack: whole items only (DP)</td></tr>
    <tr><td>Dijkstra, Kruskal, Prim, Huffman coding</td><td>Shortest path with negative edges; longest path</td></tr>
  </table>

  <h2 id="dsa-gr2-pat"><span class="num">08</span>Choosing the Pattern</h2>
  <p>Greedy problems announce themselves with "maximum number of …", "minimum number of … needed", "can you reach", "fewest coins, boats, arrows or riders", "schedule" or "assign", together with input sizes such as n up to 10<sup>5</sup>, which rule out trying subsets. Interval problems add "merge", "overlap", "free slots", "book" and "rooms". The skeleton is always the same three steps: put the options in the right order, check each one cheaply against what has already been chosen, and decide it for good. Here it is on one more interval question: the dispatcher wants to phone riders as few times as possible so that every delivery gets one call while its window is open (the same problem as Minimum Number of Arrows to Burst Balloons, LeetCode 452):</p>
  <div class="fx" data-lang="py">def fewest_calls(windows):
    calls = []                              # times at which the dispatcher phones riders
    for s, e in sorted(windows, key=lambda iv: iv[1]):   # 1. order: by END
        if not calls or s &gt; calls[-1]:      # 2. check: the last call was before this window
            calls.append(e)                 # 3. decide: call as late as possible, at its end
    return calls

windows = [[0, 50], [10, 20], [15, 30], [30, 45], [40, 70], [60, 80], [90, 110]]
print("call at minutes:", fewest_calls(windows))</div>
  <div class="fx" data-lang="text">call at minutes: [20, 45, 80, 110]</div>
  <p>Sorting by end, B comes first, and the best time to call is as late as possible within it, at minute 20, which also covers C (open from 15 to 30). D opens at 30, after the last call, so a second call at 45 covers D, A and E. F needs a call at 80 and G one at 110: four calls. It is the activity-selection idea again, with "one call per kept window". The table maps trigger words to the patterns in this note.</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Pattern</th><th>Order / state</th><th>Cost</th></tr>
    <tr><td>"merge overlapping", "union", "busy / free slots"</td><td>Merge intervals</td><td>sort by start; last block</td><td>O(n log n)</td></tr>
    <tr><td>"insert into sorted intervals"</td><td>Insert interval</td><td>already sorted; three phases</td><td>O(n)</td></tr>
    <tr><td>"minimum rooms / platforms / riders", "max overlap"</td><td>Heap or sweep line</td><td>by start + heap of ends; or ±1 events</td><td>O(n log n)</td></tr>
    <tr><td>"max non-overlapping", "min removals", "min arrows", "pair chain"</td><td>Activity selection</td><td>sort by end; last kept end</td><td>O(n log n)</td></tr>
    <tr><td>"can you reach", "minimum jumps"</td><td>Reach greedy</td><td>fixed order; farthest reach</td><td>O(n)</td></tr>
    <tr><td>"circular route", "starting station", running gains and costs</td><td>Running balance</td><td>fixed order; reset on deficit</td><td>O(n)</td></tr>
    <tr><td>"assign", "match smallest that fits", "boats", "cookies"</td><td>Sort + two pointers</td><td>sort both sides; match ends</td><td>O(n log n)</td></tr>
    <tr><td>weights, "exactly", arbitrary coins, "maximum profit"</td><td>Not greedy</td><td>DP</td><td>usually O(n²) or O(n log n)</td></tr>
  </table>
  <p>For practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, start with 455 Assign Cookies and 860 Lemonade Change (the basic greedy choice), then 56 Merge Intervals and 57 Insert Interval, then 435 Non-overlapping Intervals and 452 Minimum Number of Arrows (sort by end), then 2406 Divide Intervals Into Minimum Number of Groups and 1094 Car Pooling (heap and sweep line), then 55 and 45 Jump Game and 134 Gas Station (route greedy), 763 Partition Labels (reach on letters), and finally 135 Candy and 1235 Maximum Profit in Job Scheduling, where the obvious greedy is wrong.</p>

  <h2 id="dsa-gr2-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The most common merge bug is stretching a block to the new window's end without taking the maximum. A short window inside a long one then shrinks the block, and later windows that should merge are left out:</p>
  <div class="fx" data-lang="py">def merge_bad(intervals):
    res = []
    for s, e in sorted(intervals):
        if res and s &lt;= res[-1][1]:
            res[-1][1] = e                 # BUG: should be max(res[-1][1], e)
        else:
            res.append([s, e])
    return res

print(merge_bad([[1, 10], [2, 3], [4, 5]]))</div>
  <div class="fx" data-lang="text">[[1, 3], [4, 5]]</div>
  <p>[2, 3] lies inside [1, 10], but the buggy line sets the block's end to 3, so [4, 5] looks like a separate block and the answer becomes [[1, 3], [4, 5]] instead of [[1, 10]]. On tonight's windows the same bug would shrink [0, 50] to [0, 20] at window B. The fix is <code>res[-1][1] = max(res[-1][1], e)</code>.</p>
  <p>The sweep line has its own trap: at equal times, ends must be processed before starts. Sorting starts first makes a delivery that starts the minute another ends look like a clash:</p>
  <div class="fx" data-lang="py">def peak_bad(intervals):
    events = [(s, 1) for s, e in intervals] + [(e, -1) for s, e in intervals]
    events.sort(key=lambda ev: (ev[0], -ev[1]))   # BUG: starts before ends at equal times
    running = peak = 0
    for t, d in events:
        running += d
        peak = max(peak, running)
    return peak

print("riders for [1,2] and [2,3]:", peak_bad([[1, 2], [2, 3]]))</div>
  <div class="fx" data-lang="text">riders for [1,2] and [2,3]: 2</div>
  <p>Two back-to-back windows need only one rider, but this version reports 2, because at minute 2 it counts the new start before releasing the finished delivery. Plain tuple sorting, where <code>(2, -1)</code> comes before <code>(2, 1)</code>, gets it right. The heap version has the matching trap: comparing with <code>&lt;</code> instead of <code>&lt;=</code> refuses to reuse a rider who is free exactly when the next window starts.</p>
  <p>Beyond these, the biggest mistake is the wrong sort key: merging needs sort by start, while picking the most non-overlapping windows needs sort by end, and tonight sorting by start keeps 3 deliveries instead of 4. Also decide once how touching ends are treated and keep it consistent; remember that <code>intervals.sort()</code> changes the caller's list in place, so use <code>sorted()</code> if the original order still matters; and never trust a greedy without trying to break it with a tiny example, because greedy code looks right even when it is wrong.</p>

  <h2 id="dsa-gr2-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Greedy algorithm</b>: take the locally best choice at each step and never revise it.</li>
    <li><b>Greedy-choice property</b>: some optimal answer contains the greedy first choice. <b>Optimal substructure</b>: the rest is a smaller copy of the problem.</li>
    <li><b>Exchange argument</b>: turn any optimal answer into the greedy one by swaps that never make it worse.</li>
    <li><b>Interval</b>: [start, end]. <b>Overlap</b>: <code>a.s &lt;= b.e and b.s &lt;= a.e</code>.</li>
    <li><b>Sweep line</b>: turn intervals into sorted events and walk them once with a running state.</li>
  </ul>
  <h3>Templates</h3>
  <table class="tbl">
    <tr><th>Problem</th><th>Rule</th><th>Sort by</th><th>Time · space</th></tr>
    <tr><td>Merge</td><td>if s ≤ last.e: last.e = max(last.e, e) else append</td><td>start</td><td>O(n log n) · O(n)</td></tr>
    <tr><td>Insert</td><td>copy while e &lt; new.s; absorb while s ≤ new.e; copy rest</td><td>already sorted</td><td>O(n) · O(n)</td></tr>
    <tr><td>Rooms (heap)</td><td>if heap[0] ≤ s: pop; push e; answer = max size</td><td>start</td><td>O(n log n) · O(n)</td></tr>
    <tr><td>Rooms (sweep)</td><td>(s, +1), (e, −1); sort; running sum; peak</td><td>event time, ends first</td><td>O(n log n) · O(n)</td></tr>
    <tr><td>Selection</td><td>keep if s ≥ last_end; removals = n − kept</td><td>end</td><td>O(n log n) · O(1)</td></tr>
    <tr><td>Jump Game</td><td>if i &gt; far: fail; far = max(far, i + nums[i])</td><td>none</td><td>O(n) · O(1)</td></tr>
    <tr><td>Jump Game II</td><td>for i &lt; n − 1: update far; if i == cur_end: jumps += 1, cur_end = far</td><td>none</td><td>O(n) · O(1)</td></tr>
    <tr><td>Gas Station</td><td>Σgain &lt; Σcost → −1; tank &lt; 0 → start = i + 1, tank = 0</td><td>none</td><td>O(n) · O(1)</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import heapq
ivs.sort(key=lambda iv: iv[0])          # by start (merge, rooms)
ivs.sort(key=lambda iv: iv[1])          # by end (selection, arrows)
heapq.heappush(ends, e); ends[0]        # earliest end on top
heapq.heappop(ends)
events = [(s, 1) for s, e in ivs] + [(e, -1) for s, e in ivs]
events.sort()                           # (t, -1) before (t, 1)</div>
  <h3>On tonight's windows</h3>
  <ul>
    <li>A [0, 50], B [10, 20], C [15, 30], D [30, 45], E [40, 70], F [60, 80], G [90, 110].</li>
    <li>Merged: [0, 80], [90, 110]. Insert H [85, 95] → [0, 80], [85, 110].</li>
    <li>Riders needed: 3. Most deliveries for one rider: B, D, F, G (by start: only 3).</li>
    <li>Paid deliveries: greedy ₹90, best ₹140 (A, F, G) → DP.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Wrong sort key: start for merge, end for selection.</li>
    <li>Stretch with <code>max(last.e, e)</code>, never just <code>e</code>.</li>
    <li>Touching ends: decide the rule and say it; in the sweep, ends before starts.</li>
    <li>Jump Game II loops to n − 1; Gas Station needs the total check.</li>
    <li>Greedy that you cannot prove: try a 3-item counter-example. Weights usually mean DP.</li>
  </ul>

  <h2 id="dsa-gr2-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a greedy algorithm?</summary><div class="qa-body">An algorithm that builds a solution step by step, at each step taking the option that looks best at that moment and never revisiting it. It is usually a sort followed by one pass, so it is fast and short, but it is only correct for problems with the greedy-choice property.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you prove a greedy algorithm is correct?</summary><div class="qa-body">With an exchange argument: take any optimal solution and show that replacing its first choice with the greedy choice keeps it valid and no worse, then repeat on the rest. If every optimal solution can be transformed into the greedy one without loss, greedy is optimal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Greedy versus dynamic programming: what is the difference?</summary><div class="qa-body">Greedy commits to one choice per step and never compares alternatives, so it needs the greedy-choice property. DP compares all choices at each step and stores the best result for each subproblem, so it only needs optimal substructure. DP works in more places; greedy is faster when it is valid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give an example where greedy coin change fails.</summary><div class="qa-body">Coins {1, 3, 4} and amount 6: greedy takes 4 + 1 + 1, three coins, while 3 + 3 uses two. Greedy works for standard currencies like Indian notes, but for arbitrary coin sets you need DP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the overlap test for two intervals.</summary><div class="qa-body"><code>a.start &lt;= b.end and b.start &lt;= a.end</code>: neither ends before the other begins. If the list is sorted by start and b comes after a, it reduces to <code>b.start &lt;= a.end</code>. Use <code>&lt;</code> instead if touching intervals should not count as overlapping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge Intervals: why sort by start, and what is the complexity?</summary><div class="qa-body">After sorting by start, any interval that overlaps the blocks built so far must overlap the last block, so one comparison per interval is enough. It costs O(n log n) for the sort and O(n) for the pass, with O(n) space for the output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Insert Interval: how do you do it in O(n)?</summary><div class="qa-body">The list is already sorted, so walk it once in three phases: copy intervals that end before the new one starts, absorb every interval that overlaps it by widening the new interval with min and max, then append it and copy the remaining intervals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Meeting Rooms II: what does the heap hold, and why does its size give the answer?</summary><div class="qa-body">It holds the end times of the rooms in use, earliest on top. For each meeting in start order, if the earliest-ending room is free by the start time, reuse it (pop); then push this meeting's end. The heap's largest size is the most rooms ever in use at once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the sweep-line method, why must an end at time t be processed before a start at time t?</summary><div class="qa-body">A meeting ending at 10 frees its room for one starting at 10. Processing the end first gives the correct count; processing the start first briefly counts one room too many, so [1, 2] and [2, 3] would wrongly need two rooms. Sorting tuples (t, −1) before (t, 1) handles it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Non-overlapping Intervals: why sort by end instead of start?</summary><div class="qa-body">Keeping the interval that ends earliest leaves the most room for the rest, and the exchange argument shows this never loses. Sorting by start can keep one long early interval that blocks many short ones: [[1,7],[2,3],[4,5],[6,7]] keeps 1 by start but 3 by end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose DP over greedy for an interval problem?</summary><div class="qa-body">When intervals carry weights, such as maximising total pay from non-overlapping jobs. Earliest-end greedy maximises the count but ignores value; weighted interval scheduling sorts by end and uses DP with a binary search for the last compatible job, in O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Jump Game: what is the greedy invariant?</summary><div class="qa-body"><code>far</code> is the farthest index reachable using the elements seen so far. If the current index is greater than <code>far</code>, it cannot be reached, and neither can anything after it. Otherwise update <code>far = max(far, i + nums[i])</code>. O(n) time, O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Jump Game II count the minimum jumps in one pass?</summary><div class="qa-body">It treats the reachable indices as BFS levels. While scanning the current level it tracks the farthest reach; when the scan reaches the end of the current level, it must jump, so it adds one and sets the new level's end to that farthest reach. The loop stops at n − 1 so the last index does not trigger an extra jump.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Gas Station: why can you skip every start between a failed start and the failure point?</summary><div class="qa-body">Starting at i, you reached each station between i and j with a non-negative tank. Starting at one of them with an empty tank gives no more fuel at j, so it also fails at j. The next candidate is therefore j + 1, and if total gas is at least total cost, the last candidate works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Minimum railway platforms for given arrival and departure times: which technique?</summary><div class="qa-body">The same as Meeting Rooms II: sort arrival (+1) and departure (−1) events by time, with departures first on ties, and track the running count; its peak is the number of platforms. Alternatively sort by arrival and keep a min-heap of departure times. Both are O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does almost every interval problem start with a sort?</summary><div class="qa-body">Sorting lets you compare each interval with only one thing, the last merged block or the last kept end, instead of every other interval. Without it, an interval that clashes with an early one could appear anywhere in the list, and you are back to checking all pairs in O(n²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>sorted([[6,8],[1,3],[8,9],[2,5]], key=lambda iv: iv[1])</code> return?</summary><div class="qa-body"><code>[[1, 3], [2, 5], [6, 8], [8, 9]]</code>, ordered by end value. Without a key, lists compare by their first element and then the second.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name some well-known algorithms that are greedy.</summary><div class="qa-body">Dijkstra's shortest path (always settle the closest unvisited node), Kruskal's and Prim's minimum spanning tree (always add the cheapest safe edge), Huffman coding (always merge the two least frequent symbols), and fractional knapsack (best value per kilogram first). Each has its own exchange-style proof.</div></details>
</main>
`
});
