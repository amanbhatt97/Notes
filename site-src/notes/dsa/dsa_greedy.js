// notes/dsa/dsa_greedy.js — Intervals & Greedy
Object.assign(TOPIC_CONTENT, {
  "dsa_greedy": `<main>
<h1>Intervals &amp; Greedy</h1>
  <div class="where"><span>DSA</span><span>Problem-Solving Techniques</span><span>Intervals &amp; Greedy</span></div>
  <p class="lead">A greedy algorithm takes the best-looking option at each step and never goes back. It is fast and short, but only right for some problems. This note follows one Biteful evening: <strong>7 delivery windows</strong> (orders A to G between 6:00 and 7:50 pm). We ask harder and harder questions about them: when is the rider busy (merge), what if a new order arrives (insert), how many riders do we need at once (heap or sweep line), how many deliveries can one rider take (activity selection, with the exchange argument that proves it), and then two route questions (jump game, gas station). The note ends with the most important skill: spotting when greedy <em>fails</em> and DP is needed. Every pattern has trigger words, a template, a traced table on the windows, tested code, its cost and practice problems from the tracker. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-gr2-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-gr2-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Sorting (key=) · Heaps (min-heap) · Backtracking (try all)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-gr2-ga)"/>
<rect x="170" y="62" width="300" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Intervals &amp; Greedy</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · 7 delivery windows</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-gr2-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Dynamic Programming (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">when greedy fails</text>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-gr2-ga)"/>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Graphs</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">Dijkstra, Kruskal = greedy</text>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-gr2-ga)"/>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Advanced structures</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">bookings one by one</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-gr2-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Greedy: ~40 problems, Assign Cookies → Patching Array</text>
</svg><figcaption>Reading order for the techniques block: Backtracking → <b>Intervals &amp; Greedy</b> → Dynamic Programming → Bit Manipulation → Math. Greedy sits between "try everything" (backtracking) and "try everything, but remember" (DP): it tries <em>one</em> thing.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_sorting">Sorting</a>, <a class="xref" data-note="dsa_heaps">Heaps</a> and <a class="xref" data-note="dsa_backtrack">Backtracking</a></b><span>Sorting ended with "sort first, then one pass": every interval question here starts exactly like that, with <code>key=</code> choosing start or end. Heaps gave you a min-heap (<code>heapq</code>) that always knows the earliest end time. Backtracking showed the brute force for "choose a subset": try all 2ⁿ, which is what greedy avoids.</span></li>
    <li><b>This note adds: deciding once, never undoing</b><span>The greedy idea, the overlap test, merge and insert interval, counting simultaneous intervals (heap or sweep line), activity selection with its exchange-argument proof, jump game I/II, gas station, and a reliable way to catch greedy when it is wrong.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_dp">Dynamic Programming</a></b><span>When each delivery pays a different fee, "most deliveries" is no longer "most money": greedy earns ₹90 where ₹140 was possible. Fixing that needs DP. Later, <a class="xref" data-note="dsa_graphs">Graphs</a> uses greedy again (Dijkstra, Kruskal), and <a class="xref" data-note="dsa_advanced">Advanced Data Structures</a> handles bookings that arrive one at a time. Practise in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-gr2-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. The running example is tonight's 7 delivery windows, in minutes after 6:00 pm: <b>A [0, 50], B [10, 20], C [15, 30], D [30, 45], E [40, 70], F [60, 80], G [90, 110]</b>.</p>
  <ol class="story">
    <li><b>The greedy idea</b><span>Q: can we build an answer by always taking the best option right now? → Change for ₹380: 200, 100, 50, 20, 10, biggest note first, never reconsidered. Fast and simple. But "best right now" needs a notion of order, and our evening is made of time windows…</span></li>
    <li><b>Intervals and the overlap test</b><span>Q: when do two delivery windows clash? → <code>a.start ≤ b.end and b.start ≤ a.end</code>; checking all pairs is 21 checks for 7 windows (O(n²)). Sorted by start, each window only needs comparing with the one before. What can that single pass compute?</span></li>
    <li><b>Merge intervals</b><span>Q: when is the rider busy? → Sort by start, stretch the current block while the next window starts inside it: busy [0, 80] and [90, 110]. O(n log n). But a new order arrives at 7:25: must we sort everything again?</span></li>
    <li><b>Insert interval</b><span>Q: add window H [85, 95] to sorted busy blocks? → Copy blocks before, absorb overlapping ones, copy the rest: [0, 80], [85, 110] in O(n). Merging tells us when someone is busy, not how many riders are busy at once…</span></li>
    <li><b>Meeting rooms (riders needed)</b><span>Q: how many riders must be on duty so every delivery has one? → Peak overlap: a min-heap of end times, or a sweep of +1/−1 events: 3 (A, B, C at 6:15; A, D, E at 6:40). Now the opposite question: with one rider, how many deliveries fit?</span></li>
    <li><b>Activity selection</b><span>Q: the most windows one rider can do without clashes? → Sort by <em>end</em>, keep whatever starts after the last kept end: B, D, F, G = 4 (by start: only 3). The exchange argument proves earliest-end is never worse. Greedy also works on routes…</span></li>
    <li><b>Jump game I / II</b><span>Q: on a route where each stop's battery lets you jump up to k stops, can the rider reach the end, and with how few charges? → Track the farthest reachable stop: route [2, 3, 1, 1, 4] reachable in 2 charges; [3, 2, 1, 0, 4] stuck at stop 4. And on a circular loop with fuel gains and costs?</span></li>
    <li><b>Gas station</b><span>Q: from which pump can the rider complete the loop? → If the tank goes negative, no pump since the last start works: restart after it. Start 3. One pass. But are we sure greedy is always right?</span></li>
    <li><b>When greedy fails</b><span>Q: how do we catch a wrong greedy before the interviewer does? → Try a tiny counter-example: coins {1, 3, 4} for 6 (greedy 3 coins, best 2); paid deliveries (greedy ₹90, best ₹140). When an early choice can block a better combination, use DP.</span></li>
  </ol>

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
      <div class="rm-item rm-done" data-target="dsa-gr2-iv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Intervals on a Timeline</span><span class="rm-sub">7 windows, overlap test, sort</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-merge"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Merge &amp; Insert Interval</span><span class="rm-sub">Sort by start, extend the end</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-rooms"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Meeting Rooms (Riders)</span><span class="rm-sub">Heap or sweep line</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-nonov"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Activity Selection</span><span class="rm-sub">Sort by end, exchange argument</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-jump"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Jump Game &amp; Gas Station</span><span class="rm-sub">One pass, remember the best</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-fail"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">When Greedy Fails</span><span class="rm-sub">Counter-examples, then DP</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Traps &amp; Complexity</span><span class="rm-sub">Sort key, touching ends</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr2-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-gr2-idea"><span class="num">01</span>The Greedy Idea</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Backtracking answers "choose the best set" by trying every combination: 2ⁿ of them. Sorting showed that one ordered pass can replace a lot of checking. Can we sometimes build the best answer by making one obvious choice at a time, and never trying the alternatives at all?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>maximum number</b> of …", "<b>minimum number</b> of … needed", "assign / schedule", "can you reach", "fewest coins / boats / arrows", and constraints like n ≤ 10⁵ that rule out trying subsets.</p>
  </div>
  <p>A shopkeeper has to return ₹78 in change. He does not think about all possible combinations of notes. He gives the biggest note that fits (₹50), then the biggest that fits in the rest (₹20), then ₹5, then ₹2, ₹1. Five notes and coins, done in seconds. A Biteful rider does the same when order A (₹120) is paid with a ₹500 note.</p>
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

# order A costs ₹120 and the customer pays with a ₹500 note
print("change for ₹380:", make_change(500 - 120))
print("change for ₹78: ", make_change(78))</div>
  <div class="fx" data-lang="text">change for ₹380: [200, 100, 50, 20, 10]
change for ₹78:  [50, 20, 5, 2, 1]</div>
  <table class="tbl out"><caption>Trace: change for ₹380</caption>
    <tr><th>step</th><th>left to pay</th><th>biggest note that fits</th><th>left after</th></tr>
    <tr><td>1</td><td>380</td><td>200</td><td>180</td></tr>
    <tr><td>2</td><td>180</td><td>100</td><td>80</td></tr>
    <tr><td>3</td><td>80</td><td>50</td><td>30</td></tr>
    <tr><td>4</td><td>30</td><td>20</td><td>10</td></tr>
    <tr><td>5</td><td>10</td><td>10</td><td>0</td></tr>
  </table>
  <h3>Template</h3>
<div class="fx" data-lang="text">options = sorted(options, key=what_makes_one_best)   # often the whole trick is choosing this key
answer = empty
for x in options:
    if x is compatible with answer so far:      # one check against the last choice
        add x to answer                          # decided for good, never undone
return answer</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>greedy algorithm</strong> builds a solution step by step, at each step taking the locally best choice and never revising it. It is correct when the problem has the <strong>greedy-choice property</strong>: some globally best answer contains the locally best first choice. Indian currency has this property (every note is a "clean" multiple of the smaller ones); section 07 shows coins that do not.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Greedy code is so short that it always <em>looks</em> right. It is only right when you can argue it (exchange argument, section 05) or at least fail to break it with a 3-item example (section 07).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Greedy: <b>455 Assign Cookies</b> (sort both, match smallest), <b>860 Lemonade Change</b> (give change with the biggest bills first), <b>1710 Maximum Units on a Truck</b>, then <b>122 Best Time to Buy and Sell Stock II</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Intervals on a Timeline.</b> For notes, "best" means "biggest". Tonight's real problem is 7 delivery windows. What does "best" or "clash" even mean for a time window, and in which order should we look at them?</div>

  <h2 id="dsa-gr2-iv"><span class="num">02</span>Intervals on a Timeline</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every question about the evening (busy times, riders needed, most deliveries) depends on one smaller question: do two delivery windows clash? And checking every pair of windows is the O(n²) habit we are trying to break.</p>
  </div>
  <p>An <strong>interval</strong> is a start and an end on a line: a meeting from 9 to 10, a train journey from 14:00 to 18:30, a delivery window from 6:15 to 6:30. Written as <code>[start, end]</code>. Tonight's 7 windows, in minutes after 6:00 pm:</p>
  <table class="tbl"><caption>The running example: delivery windows</caption>
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
<line x1="112" y1="186" x2="112" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="154" y1="186" x2="154" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="154" y="202" text-anchor="middle" class="tm" font-size="10">6:20</text>
<line x1="196" y1="186" x2="196" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="238" y1="186" x2="238" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="238" y="202" text-anchor="middle" class="tm" font-size="10">6:40</text>
<line x1="280" y1="186" x2="280" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="322" y1="186" x2="322" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="322" y="202" text-anchor="middle" class="tm" font-size="10">7:00</text>
<line x1="364" y1="186" x2="364" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="406" y1="186" x2="406" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="406" y="202" text-anchor="middle" class="tm" font-size="10">7:20</text>
<line x1="448" y1="186" x2="448" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="490" y1="186" x2="490" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="490" y="202" text-anchor="middle" class="tm" font-size="10">7:40</text>
<line x1="532" y1="186" x2="532" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="574" y1="186" x2="574" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="574" y="202" text-anchor="middle" class="tm" font-size="10">8:00</text>
<line x1="196" y1="8" x2="196" y2="182" stroke="currentColor" stroke-dasharray="3 3" stroke-opacity="0.6"/>
<text x="200" y="10" class="tm" font-size="9">C ends, D starts (touch)</text>
</svg><figcaption>Tonight's 7 windows. A is long and overlaps B, C, D and E. C ends exactly when D starts (dashed line): whether that counts as a clash depends on the question.</figcaption></figure>
  <p>Almost every interval question is really about one thing: which intervals <strong>overlap</strong> (share some time)?</p>
  <div class="callout def"><span class="label">Overlap test</span>
    <p>A and B overlap when <code>A.start &lt;= B.end and B.start &lt;= A.end</code>. In words: neither one ends before the other begins. If the intervals are sorted by start, this shrinks to <code>B.start &lt;= A.end</code>.</p>
  </div>
<div class="fx" data-lang="py">def overlap(a, b):
    return a[0] &lt;= b[1] and b[0] &lt;= a[1]

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}   # minutes after 6:00 pm
print("A,B", overlap(windows["A"], windows["B"]), " B,D", overlap(windows["B"], windows["D"]),
      " C,D", overlap(windows["C"], windows["D"]), "(touch at 30)")

# all pairs: 21 checks for 7 windows
names = sorted(windows)
clash = [(p, q) for i, p in enumerate(names) for q in names[i + 1:]
         if overlap(windows[p], windows[q])]
print(len(names) * (len(names) - 1) // 2, "pair checks -&gt;", clash)

print("by start:", sorted(windows, key=lambda k: windows[k][0]))
print("by end:  ", sorted(windows, key=lambda k: windows[k][1]))</div>
  <div class="fx" data-lang="text">A,B True  B,D False  C,D True (touch at 30)
21 pair checks -&gt; [('A', 'B'), ('A', 'C'), ('A', 'D'), ('A', 'E'), ('B', 'C'), ('C', 'D'), ('D', 'E'), ('E', 'F')]
by start: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
by end:   ['B', 'C', 'D', 'A', 'E', 'F', 'G']</div>
  <p>8 clashing pairs, found with 21 checks. The second big idea is <strong>sorting</strong> (the Sorting note's "sort first, then…"). Unsorted intervals force you to compare every pair: n² checks. Sorted by start, each interval only needs to be compared with the one just before it (or the current merged block). Sort once (n log n), then one <strong>sweep</strong> left to right, like reading a timetable top to bottom. Notice that sorting by end gives a different order (B, C, D before A): which key to sort by is the whole design decision in this note.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A railway timetable is printed in order of departure. To see whether a train is still on the platform when the next one arrives, you only look at the line above. Nobody compares the 6:00 train with the 23:00 train.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: touching ends</span>
    <p>Do C [15, 30] and D [30, 45] overlap? The test above with <code>&lt;=</code> says yes, and LeetCode "Merge Intervals" agrees (merge to [15, 45]). "Non-overlapping Intervals" and "Meeting Rooms" say no: a delivery can start the minute another ends. Read the question, and say your assumption out loud in an interview.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>986 Interval List Intersections</b> (two sorted lists, two pointers, the overlap test), <b>1288 Remove Covered Intervals</b> (sort by start, then by end descending).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Merge &amp; Insert.</b> We can test one pair and we know to sort. The dispatcher's first real question: during which stretches of the evening is at least one delivery running?</div>

  <h2 id="dsa-gr2-merge"><span class="num">03</span>Merge &amp; Insert Interval</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The overlap test compares two windows. The dispatcher wants the whole evening summarised as "busy from … to …" blocks, and later wants to add new orders to that summary without redoing everything.</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>merge</b> overlapping", "busy / free <b>slots</b>", "union of ranges", "<b>insert</b> a new interval into a sorted list", "total time covered".</p>
  </div>
  <h3>Merge Intervals (LeetCode 56)</h3>
  <p><strong>Problem:</strong> return the windows with overlaps merged: the stretches when the dispatcher has at least one delivery running.</p>
  <p><strong>Brute force:</strong> compare every pair, merge, repeat until nothing changes. O(n²) or worse, and messy.</p>
  <p><strong>Better idea:</strong> sort by start. Keep a result list. For each window, if it starts before or at the end of the last merged block, they overlap: stretch the block's end. Otherwise, start a new block.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Painting stripes on a wall from left to right with tape. If the next stripe starts before the current tape ends, you just pull the tape further. If there is a gap, you cut the tape and start a new strip.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
<text x="20" y="27" font-size="11">A</text><text x="40" y="27" class="tm" font-size="9">0–50</text>
<rect x="70" y="14" width="210" height="16" rx="3" class="fs" stroke="currentColor" stroke-opacity="0.6"/>
<text x="20" y="51" font-size="11">B</text><text x="40" y="51" class="tm" font-size="9">10–20</text>
<rect x="112" y="38" width="42" height="16" rx="3" class="fs" stroke="currentColor" stroke-opacity="0.6"/>
<text x="20" y="75" font-size="11">C</text><text x="40" y="75" class="tm" font-size="9">15–30</text>
<rect x="133" y="62" width="63" height="16" rx="3" class="fs" stroke="currentColor" stroke-opacity="0.6"/>
<text x="20" y="99" font-size="11">D</text><text x="40" y="99" class="tm" font-size="9">30–45</text>
<rect x="196" y="86" width="63" height="16" rx="3" class="fs" stroke="currentColor" stroke-opacity="0.6"/>
<text x="20" y="123" font-size="11">E</text><text x="40" y="123" class="tm" font-size="9">40–70</text>
<rect x="238" y="110" width="126" height="16" rx="3" class="fs" stroke="currentColor" stroke-opacity="0.6"/>
<text x="20" y="147" font-size="11">F</text><text x="40" y="147" class="tm" font-size="9">60–80</text>
<rect x="322" y="134" width="84" height="16" rx="3" class="fs" stroke="currentColor" stroke-opacity="0.6"/>
<text x="20" y="171" font-size="11">G</text><text x="40" y="171" class="tm" font-size="9">90–110</text>
<rect x="448" y="158" width="84" height="16" rx="3" class="fs" stroke="currentColor" stroke-opacity="0.6"/>
<text x="20" y="200" font-size="11" font-weight="700">busy</text>
<rect x="70" y="187" width="336" height="18" rx="3" class="fg sg"/><text x="238" y="200" text-anchor="middle" font-size="10">[0, 80]</text>
<rect x="448" y="187" width="84" height="18" rx="3" class="fg sg"/><text x="490" y="200" text-anchor="middle" font-size="10">[90, 110]</text>
<line x1="70.0" y1="216" x2="574.0" y2="216" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="70" y1="216" x2="70" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<text x="70" y="232" text-anchor="middle" class="tm" font-size="10">6:00</text>
<line x1="112" y1="216" x2="112" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="154" y1="216" x2="154" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<text x="154" y="232" text-anchor="middle" class="tm" font-size="10">6:20</text>
<line x1="196" y1="216" x2="196" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="238" y1="216" x2="238" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<text x="238" y="232" text-anchor="middle" class="tm" font-size="10">6:40</text>
<line x1="280" y1="216" x2="280" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="322" y1="216" x2="322" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<text x="322" y="232" text-anchor="middle" class="tm" font-size="10">7:00</text>
<line x1="364" y1="216" x2="364" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="406" y1="216" x2="406" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<text x="406" y="232" text-anchor="middle" class="tm" font-size="10">7:20</text>
<line x1="448" y1="216" x2="448" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="490" y1="216" x2="490" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<text x="490" y="232" text-anchor="middle" class="tm" font-size="10">7:40</text>
<line x1="532" y1="216" x2="532" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="574" y1="216" x2="574" y2="220" stroke="currentColor" stroke-opacity="0.5"/>
<text x="574" y="232" text-anchor="middle" class="tm" font-size="10">8:00</text>
</svg><figcaption>Sorted by start, each window either stretches the current block or starts a new one. A to F melt into one block [0, 80]; G is separate. The 10-minute gap 7:20–7:30 is the rider's only break.</figcaption></figure>
<div class="fx" data-lang="py">def merge(intervals):
    intervals = sorted(intervals, key=lambda iv: iv[0])   # by start (a copy)
    res = []
    for s, e in intervals:
        if res and s &lt;= res[-1][1]:               # overlaps the last merged one
            res[-1][1] = max(res[-1][1], e)       # stretch its end
            print(f"[{s:&gt;3},{e:&gt;3}] overlaps -&gt; stretch to {res[-1]}")
        else:
            res.append([s, e])                    # start a new block
            print(f"[{s:&gt;3},{e:&gt;3}] gap      -&gt; new block   {res[-1]}")
    return res

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}   # minutes after 6:00 pm
print(merge(list(windows.values())))</div>
  <div class="fx" data-lang="text">[  0, 50] gap      -&gt; new block   [0, 50]
[ 10, 20] overlaps -&gt; stretch to [0, 50]
[ 15, 30] overlaps -&gt; stretch to [0, 50]
[ 30, 45] overlaps -&gt; stretch to [0, 50]
[ 40, 70] overlaps -&gt; stretch to [0, 70]
[ 60, 80] overlaps -&gt; stretch to [0, 80]
[ 90,110] gap      -&gt; new block   [90, 110]
[[0, 80], [90, 110]]</div>
  <table class="tbl out"><caption>Trace: merge on tonight's windows (sorted by start: A, B, C, D, E, F, G)</caption>
    <tr><th>Window</th><th>Last block</th><th>start ≤ last.end?</th><th>Result</th></tr>
    <tr><td>A [0, 50]</td><td>—</td><td>list empty → add</td><td>[[0, 50]]</td></tr>
    <tr><td>B [10, 20]</td><td>[0, 50]</td><td>10 ≤ 50 yes → end = max(50, 20) = 50</td><td>[[0, 50]]</td></tr>
    <tr><td>C [15, 30]</td><td>[0, 50]</td><td>15 ≤ 50 yes → end stays 50</td><td>[[0, 50]]</td></tr>
    <tr><td>D [30, 45]</td><td>[0, 50]</td><td>30 ≤ 50 yes → end stays 50</td><td>[[0, 50]]</td></tr>
    <tr><td>E [40, 70]</td><td>[0, 50]</td><td>40 ≤ 50 yes → end = 70</td><td>[[0, 70]]</td></tr>
    <tr><td>F [60, 80]</td><td>[0, 70]</td><td>60 ≤ 70 yes → end = 80</td><td>[[0, 80]]</td></tr>
    <tr><td>G [90, 110]</td><td>[0, 80]</td><td>90 ≤ 80 no → add</td><td>[[0, 80], [90, 110]]</td></tr>
  </table>
  <p>Edge cases worth running once:</p>
<div class="fx" data-lang="py">def merge(intervals):
    intervals = sorted(intervals, key=lambda iv: iv[0])
    res = []
    for s, e in intervals:
        if res and s &lt;= res[-1][1]:
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    return res

print(merge([[1, 4], [4, 5]]))          # touching -&gt; merged
print(merge([[1, 10], [2, 3], [4, 5]])) # one big one swallows the rest
print(merge([[5, 6]]), merge([]))</div>
  <div class="fx" data-lang="text">[[1, 5]]
[[1, 10]]
[[5, 6]] []</div>
  <h3>Template</h3>
<div class="fx" data-lang="text">res = []
for s, e in sorted(intervals):                 # by start
    if res and s &lt;= res[-1][1]: res[-1][1] = max(res[-1][1], e)   # stretch
    else: res.append([s, e])                    # gap: new block</div>
  <p><strong>Complexity:</strong> O(n log n) for the sort, then one O(n) pass. Space O(n) for the output.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing <code>res[-1][1] = e</code> instead of <code>max(res[-1][1], e)</code>. At window B the block end would shrink from 50 to 20, and C, D would wrongly be checked against 20. On [1,10], [2,3], [4,5] the end shrinks from 10 to 3 and [4,5] becomes a separate block.</p>
  </div>

  <h3>Insert Interval (LeetCode 57)</h3>
  <p><strong>Problem:</strong> the busy blocks [[0, 80], [90, 110]] are already sorted and non-overlapping. A new order H arrives with window [85, 95] (7:25–7:35). Insert it and merge if needed.</p>
  <p><strong>Lazy way:</strong> append the new one and call <code>merge</code>. Correct, O(n log n). The interviewer wants O(n), since the list is already sorted.</p>
  <p><strong>Better idea:</strong> three phases in one pass. Copy blocks that end before the new one starts. Then absorb every block that overlaps into the new one (stretch its start and end). Then add the new one and copy whatever is left.</p>
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

busy = [[0, 80], [90, 110]]                        # the merged busy blocks
print(insert(busy, [85, 95]))      # new order H, 7:25-7:35: joins the second block
print(insert(busy, [82, 88]))      # fits in the gap
print(insert(busy, [70, 100]))     # bridges both blocks
print(insert([], [5, 7]), insert([[3, 5]], [1, 2]))</div>
  <div class="fx" data-lang="text">[[0, 80], [85, 110]]
[[0, 80], [82, 88], [90, 110]]
[[0, 110]]
[[5, 7]] [[1, 2], [3, 5]]</div>
  <table class="tbl out"><caption>Trace: insert H [85, 95] into [[0, 80], [90, 110]]</caption>
    <tr><th>phase</th><th>block</th><th>test</th><th>action</th><th>new</th></tr>
    <tr><td>1. before</td><td>[0, 80]</td><td>80 &lt; 85: ends before new starts</td><td>copy</td><td>[85, 95]</td></tr>
    <tr><td>2. overlap</td><td>[90, 110]</td><td>90 ≤ 95: starts before new ends</td><td>absorb</td><td>[85, 110]</td></tr>
    <tr><td>3. after</td><td>—</td><td>none left</td><td>append new</td><td>[[0, 80], [85, 110]]</td></tr>
  </table>
  <p>The other runs: [82, 88] fits in the gap and touches nothing; [70, 100] swallows both blocks into one [0, 110]. <strong>Complexity:</strong> O(n) time, O(n) for the result.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Phase 1 uses strict <code>&lt;</code> (ends <em>before</em> the new one starts) and phase 2 uses <code>&lt;=</code>. Mixing them up either merges blocks that only touch the gap or misses a touching one. Test with a window that starts exactly at a block's end.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>56 Merge Intervals</b> (exactly the trace above), <b>57 Insert Interval</b>, <b>1288 Remove Covered Intervals</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Meeting Rooms.</b> Merging says the evening is busy from 6:00 to 7:20, but not how busy. At 6:15, A, B and C are all running. How many riders must be on duty at once so that no delivery waits?</div>

  <h2 id="dsa-gr2-rooms"><span class="num">04</span>Meeting Rooms (Riders Needed)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A merged block hides how many windows overlap inside it. The ops team needs the maximum number of deliveries running at the same instant, because that is how many riders must be on duty (each rider does one delivery at a time).</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>minimum number of rooms</b> / platforms / riders / cars", "<b>maximum overlapping</b>", "how many at the same time", "car pooling capacity", "divide into fewest groups".</p>
  </div>
  <p><strong>Problem (LeetCode 253, "Meeting Rooms II"):</strong> rooms = riders, meetings = delivery windows. A delivery can start the minute another ends (touching is fine). The real question: at the busiest instant, how many windows are running? Two ways to find it.</p>
  <h3>Way 1: min-heap of end times</h3>
  <p>Sort by start. Walk through the windows. Keep a min-heap (<a class="xref" data-note="dsa_heaps">Heaps</a>: a pile where the smallest item is always on top) of end times of riders already hired. For each new window: if the earliest-finishing rider is already free (its end ≤ this start), reuse that rider (pop). Push this window's end. The heap size is the number of riders hired; its largest value is the answer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The dispatcher keeps the riders' "free at" times on a board, earliest at the top. A new order comes in: if the top rider is already free, give it to them; otherwise call in a new rider.</p>
  </div>
<div class="fx" data-lang="py">import heapq

def min_riders_heap(windows):
    order = sorted(windows.items(), key=lambda kv: kv[1][0])   # by start
    ends = []                                  # min-heap of end times in progress
    riders = 0
    for name, (s, e) in order:
        freed = bool(ends) and ends[0] &lt;= s    # earliest delivery finished?
        if freed:
            heapq.heappop(ends)                # that rider is free again
        heapq.heappush(ends, e)
        riders = max(riders, len(ends))
        print(f"{name} [{s:&gt;3},{e:&gt;3}] {'reuse a rider' if freed else 'new rider   '} heap={sorted(ends)}")
    return riders

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}   # minutes after 6:00 pm
print("riders needed:", min_riders_heap(windows))</div>
  <div class="fx" data-lang="text">A [  0, 50] new rider    heap=[50]
B [ 10, 20] new rider    heap=[20, 50]
C [ 15, 30] new rider    heap=[20, 30, 50]
D [ 30, 45] reuse a rider heap=[30, 45, 50]
E [ 40, 70] reuse a rider heap=[45, 50, 70]
F [ 60, 80] reuse a rider heap=[50, 70, 80]
G [ 90,110] reuse a rider heap=[70, 80, 110]
riders needed: 3</div>
  <table class="tbl out"><caption>Trace: riders needed for tonight (sorted by start)</caption>
    <tr><th>Window</th><th>Heap before</th><th>Earliest end ≤ start?</th><th>Heap after</th><th>Riders</th></tr>
    <tr><td>A [0, 50]</td><td>[]</td><td>—</td><td>[50]</td><td>1</td></tr>
    <tr><td>B [10, 20]</td><td>[50]</td><td>50 ≤ 10 no → new rider</td><td>[20, 50]</td><td>2</td></tr>
    <tr><td>C [15, 30]</td><td>[20, 50]</td><td>20 ≤ 15 no → new rider</td><td>[20, 30, 50]</td><td>3</td></tr>
    <tr><td>D [30, 45]</td><td>[20, 30, 50]</td><td>20 ≤ 30 yes → B's rider</td><td>[30, 45, 50]</td><td>3</td></tr>
    <tr><td>E [40, 70]</td><td>[30, 45, 50]</td><td>30 ≤ 40 yes → C's rider</td><td>[45, 50, 70]</td><td>3</td></tr>
    <tr><td>F [60, 80]</td><td>[45, 50, 70]</td><td>45 ≤ 60 yes → D's rider</td><td>[50, 70, 80]</td><td>3</td></tr>
    <tr><td>G [90, 110]</td><td>[50, 70, 80]</td><td>50 ≤ 90 yes → A's rider</td><td>[70, 80, 110]</td><td>3</td></tr>
  </table>
  <p>Note that the heap holds one end time per <em>hired</em> rider, not per busy rider: at G, riders who finished at 70 and 80 are idle but still listed. That is fine, because we only need the most riders ever hired, and we pop at most one per new window.</p>
  <h3>Way 2: sweep line with +1 / −1 events</h3>
  <p>Think of a security guard counting people in a hall. Every start is "+1 person", every end is "−1". Sort all events by time, walk through, keep a running count, remember the peak.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
<line x1="70.0" y1="130" x2="574.0" y2="130" stroke="currentColor" stroke-opacity="0.12"/><text x="60.0" y="134" text-anchor="end" class="tm" font-size="10">0</text>
<line x1="70.0" y1="100" x2="574.0" y2="100" stroke="currentColor" stroke-opacity="0.12"/><text x="60.0" y="104" text-anchor="end" class="tm" font-size="10">1</text>
<line x1="70.0" y1="70" x2="574.0" y2="70" stroke="currentColor" stroke-opacity="0.12"/><text x="60.0" y="74" text-anchor="end" class="tm" font-size="10">2</text>
<line x1="70.0" y1="40" x2="574.0" y2="40" stroke="currentColor" stroke-opacity="0.12"/><text x="60.0" y="44" text-anchor="end" class="tm" font-size="10">3</text>
<polyline fill="none" class="sg" stroke-width="2.5" points="70,130 70,100 112,100 112,70 133,70 133,40 154,40 154,70 196,70 196,100 196,100 196,70 238,70 238,40 259,40 259,70 280,70 280,100 322,100 322,70 364,70 364,100 406,100 406,130 448,130 448,100 532,100 532,130 574,130"/>
<text x="141" y="34" text-anchor="middle" class="tg" font-size="10">peak 3 (A, B, C)</text>
<text x="246" y="34" text-anchor="middle" class="tg" font-size="10">3 (A, D, E)</text>
<line x1="70.0" y1="136" x2="574.0" y2="136" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="70" y1="136" x2="70" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<text x="70" y="152" text-anchor="middle" class="tm" font-size="10">6:00</text>
<line x1="112" y1="136" x2="112" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="154" y1="136" x2="154" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<text x="154" y="152" text-anchor="middle" class="tm" font-size="10">6:20</text>
<line x1="196" y1="136" x2="196" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="238" y1="136" x2="238" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<text x="238" y="152" text-anchor="middle" class="tm" font-size="10">6:40</text>
<line x1="280" y1="136" x2="280" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="322" y1="136" x2="322" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<text x="322" y="152" text-anchor="middle" class="tm" font-size="10">7:00</text>
<line x1="364" y1="136" x2="364" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="406" y1="136" x2="406" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<text x="406" y="152" text-anchor="middle" class="tm" font-size="10">7:20</text>
<line x1="448" y1="136" x2="448" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="490" y1="136" x2="490" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<text x="490" y="152" text-anchor="middle" class="tm" font-size="10">7:40</text>
<line x1="532" y1="136" x2="532" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="574" y1="136" x2="574" y2="140" stroke="currentColor" stroke-opacity="0.5"/>
<text x="574" y="152" text-anchor="middle" class="tm" font-size="10">8:00</text>
</svg><figcaption>The green line is "deliveries running right now". Its highest point, 3, is the number of riders. At 6:30 it dips: C's end (−1) is processed before D's start (+1).</figcaption></figure>
<div class="fx" data-lang="py">def min_riders_sweep(windows):
    events = []
    for s, e in windows.values():
        events.append((s, 1))                  # a delivery starts
        events.append((e, -1))                 # a delivery ends
    events.sort()                              # ties: (30,-1) before (30,1): end frees first
    running = peak = 0
    for t, delta in events:
        running += delta
        peak = max(peak, running)
        print(f"t={t:&gt;3} {'+1' if delta &gt; 0 else '-1'} running={running}")
    return peak

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}   # minutes after 6:00 pm
print("peak:", min_riders_sweep(windows))</div>
  <div class="fx" data-lang="text">t=  0 +1 running=1
t= 10 +1 running=2
t= 15 +1 running=3
t= 20 -1 running=2
t= 30 -1 running=1
t= 30 +1 running=2
t= 40 +1 running=3
t= 45 -1 running=2
t= 50 -1 running=1
t= 60 +1 running=2
t= 70 -1 running=1
t= 80 -1 running=0
t= 90 +1 running=1
t=110 -1 running=0
peak: 3</div>
  <p>Sorting tuples puts <code>(30, -1)</code> before <code>(30, 1)</code>, so C ending at 6:30 frees its rider before D starting at 6:30 takes one. If the starts came first, the count would jump to 3 at t = 30 for an instant, which happens to be harmless here but gives a wrong answer on [[1, 2], [2, 3]] (2 instead of 1).</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">events = [(s, +1) for s, e in iv] + [(e, -1) for s, e in iv]
running = peak = 0
for t, d in sorted(events):        # ends (-1) sort before starts (+1) at the same t
    running += d
    peak = max(peak, running)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>sweep line</strong> turns intervals into sorted events and walks them once, keeping a running state (here a count). The <strong>peak overlap</strong> is the minimum number of rooms / riders / platforms. <strong>Complexity:</strong> both ways O(n log n) time, O(n) space.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using "merged blocks" to count riders: merging says one block [0, 80], which tells you nothing about 3 deliveries at once. And with the heap, comparing with <code>&lt;</code> instead of <code>&lt;=</code> refuses to reuse a rider who finishes exactly when the next window starts: [[1, 2], [2, 3]] would need 2 riders instead of 1.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>1094 Car Pooling</b> (sweep with passenger counts instead of ±1), <b>2406 Divide Intervals Into Minimum Number of Groups</b> (exactly riders needed), <b>729 My Calendar I</b>, then <b>1942 The Number of the Smallest Unoccupied Chair</b> (two heaps). Meeting Rooms II itself is a premium LeetCode problem; 2406 is the same question.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Activity Selection.</b> We know 3 riders cover everything. Flip it: on a slow night there is only <em>one</em> rider. Which deliveries should they accept to complete as many as possible, and why would a greedy choice be safe?</div>

  <h2 id="dsa-gr2-nonov"><span class="num">05</span>Activity Selection (Non-overlapping Intervals)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One rider, 7 windows that clash. Trying every subset is 2⁷ = 128 checks (2ⁿ in general). Is there one sort order that lets us decide window by window, and can we prove it never loses?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>maximum number</b> of non-overlapping …", "<b>minimum removals</b> so that none overlap", "attend the most events", "longest chain of pairs", "<b>minimum arrows</b> to burst balloons".</p>
  </div>
  <p><strong>Problem (LeetCode 435):</strong> remove the fewest windows so that none overlap (touching is fine). Flip the question: <em>keep</em> as many as possible, and removals = n − kept. This is the classic <strong>activity selection</strong> problem: from a list of events, attend the most without clashes.</p>
  <p><strong>Greedy choice:</strong> always keep the window that <strong>ends earliest</strong>. Ending early leaves the most room for everything after it. Sort by end, then sweep: keep a window if it starts at or after the end of the last kept one.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A film festival with clashing shows and one ticket-holder who wants to see the most films. Always pick the show that <em>finishes</em> first: whatever you could have watched after a later-ending show, you can also watch after this one.</p>
  </div>
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
<line x1="70" y1="186" x2="70" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="70" y="202" text-anchor="middle" class="tm" font-size="10">6:00</text>
<line x1="112" y1="186" x2="112" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="154" y1="186" x2="154" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="154" y="202" text-anchor="middle" class="tm" font-size="10">6:20</text>
<line x1="196" y1="186" x2="196" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="238" y1="186" x2="238" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="238" y="202" text-anchor="middle" class="tm" font-size="10">6:40</text>
<line x1="280" y1="186" x2="280" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="322" y1="186" x2="322" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="322" y="202" text-anchor="middle" class="tm" font-size="10">7:00</text>
<line x1="364" y1="186" x2="364" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="406" y1="186" x2="406" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="406" y="202" text-anchor="middle" class="tm" font-size="10">7:20</text>
<line x1="448" y1="186" x2="448" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="490" y1="186" x2="490" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="490" y="202" text-anchor="middle" class="tm" font-size="10">7:40</text>
<line x1="532" y1="186" x2="532" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="574" y1="186" x2="574" y2="190" stroke="currentColor" stroke-opacity="0.5"/>
<text x="574" y="202" text-anchor="middle" class="tm" font-size="10">8:00</text>
</svg><figcaption>Earliest-end greedy keeps the green windows B, D, F, G (4 deliveries). The red ones clash with a kept window. A is long and early: taking it first would block B, C, D and E.</figcaption></figure>
<div class="fx" data-lang="py">def max_deliveries(windows, key):
    order = sorted(windows, key=key)
    kept, last_end = [], float("-inf")
    for name in order:
        s, e = windows[name]
        if s &gt;= last_end:                       # no clash with the last kept
            kept.append(name); last_end = e     # keep it
    return kept

windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}   # minutes after 6:00 pm
by_end = max_deliveries(windows, key=lambda k: windows[k][1])
by_start = max_deliveries(windows, key=lambda k: windows[k][0])
print("earliest end   :", by_end, len(by_end))
print("earliest start :", by_start, len(by_start))</div>
  <div class="fx" data-lang="text">earliest end   : ['B', 'D', 'F', 'G'] 4
earliest start : ['A', 'F', 'G'] 3</div>
  <table class="tbl out"><caption>Trace: sorted by end → B(20), C(30), D(45), A(50), E(70), F(80), G(110)</caption>
    <tr><th>Window</th><th>last_end</th><th>start ≥ last_end?</th><th>Action</th></tr>
    <tr><td>B [10, 20]</td><td>−∞</td><td>yes</td><td>keep, last_end = 20</td></tr>
    <tr><td>C [15, 30]</td><td>20</td><td>15 ≥ 20 no</td><td>drop</td></tr>
    <tr><td>D [30, 45]</td><td>20</td><td>30 ≥ 20 yes</td><td>keep, last_end = 45</td></tr>
    <tr><td>A [0, 50]</td><td>45</td><td>0 ≥ 45 no</td><td>drop</td></tr>
    <tr><td>E [40, 70]</td><td>45</td><td>40 ≥ 45 no</td><td>drop</td></tr>
    <tr><td>F [60, 80]</td><td>45</td><td>60 ≥ 45 yes</td><td>keep, last_end = 80</td></tr>
    <tr><td>G [90, 110]</td><td>80</td><td>90 ≥ 80 yes</td><td>keep, last_end = 110</td></tr>
  </table>
  <p>Sorting by <em>start</em> takes A first (it starts at 6:00), and A blocks four windows: only 3 deliveries. Is 4 really the best? Brute force over all 128 subsets agrees:</p>
<div class="fx" data-lang="py">from itertools import combinations
windows = {"A": [0, 50], "B": [10, 20], "C": [15, 30], "D": [30, 45],
           "E": [40, 70], "F": [60, 80], "G": [90, 110]}   # minutes after 6:00 pm
def ok(group):
    ivs = sorted(windows[k] for k in group)
    return all(ivs[i][1] &lt;= ivs[i + 1][0] for i in range(len(ivs) - 1))

best = max((g for r in range(len(windows) + 1) for g in combinations(windows, r) if ok(g)), key=len)
print("brute force over all", 2 ** len(windows), "subsets -&gt;", best, len(best))</div>
  <div class="fx" data-lang="text">brute force over all 128 subsets -&gt; ('B', 'D', 'F', 'G') 4</div>
  <h3>Why greedy is safe: the exchange argument in plain words</h3>
  <ol>
    <li>Take <em>any</em> best schedule, say one that starts with C (ends at 30).</li>
    <li>Greedy's first pick, B, ends at 20, which is no later than C's 30.</li>
    <li>Swap C for B. Everything that came after C in that schedule starts at ≥ 30 ≥ 20, so it still does not clash with B. Same number of deliveries: still a best schedule.</li>
    <li>Now the best schedule and greedy agree on the first pick. Repeat the argument on what comes after. At no step do we lose a delivery, so greedy keeps as many as the best schedule.</li>
  </ol>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Exchange argument</strong>: show that any optimal answer can be changed, one swap at a time, into the greedy answer without getting worse. Then greedy is optimal too. It is the standard way to prove a greedy algorithm correct.</p>
  </div>
  <p>The removal version (LeetCode 435) on tonight's windows and the classic tests:</p>
<div class="fx" data-lang="py">def erase_overlap(intervals):
    intervals = sorted(intervals, key=lambda iv: iv[1])   # by END
    removed, last_end = 0, float("-inf")
    for s, e in intervals:
        if s &gt;= last_end:                       # no clash with the last kept
            last_end = e                        # keep it
        else:
            removed += 1                        # drop it (it ends later)
    return removed

windows = [[0, 50], [10, 20], [15, 30], [30, 45], [40, 70], [60, 80], [90, 110]]
print(erase_overlap(windows))                   # 7 windows - 4 kept
print(erase_overlap([[1, 2], [2, 3], [3, 4], [1, 3]]))
print(erase_overlap([[1, 2], [1, 2], [1, 2]]))
print(erase_overlap([[1, 7], [2, 3], [4, 5], [6, 7]]))
print(erase_overlap([]))</div>
  <div class="fx" data-lang="text">3
1
2
1
0</div>
  <p>7 windows − 4 kept = 3 removals. The last test, [[1,7],[2,3],[4,5],[6,7]], is the same trap as A: one long early interval. <strong>Complexity:</strong> O(n log n) time, O(1) extra space.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sorting by start (or by length) "because that's what merge did". Merge needs start; selection needs <strong>end</strong>. Shortest-first also fails: see section 07.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>435 Non-overlapping Intervals</b> (the trace above), <b>452 Minimum Number of Arrows to Burst Balloons</b> (same sort by end; one arrow per kept group), <b>646 Maximum Length of Pair Chain</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Jump Game &amp; Gas Station.</b> Intervals are not the only place greedy works. The rider's e-scooter has to make it along a route of charging stops, and around a circular loop of restaurants. Can one pass with one remembered number decide those too?</div>

  <h2 id="dsa-gr2-jump"><span class="num">06</span>Jump Game &amp; Gas Station</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>So far greedy meant "sort, then sweep". On a route there is nothing to sort: the stops come in a fixed order. Can greedy still decide "can we make it?" and "with how few stops?" in one pass, without trying every path (which backtracking would do in exponential time)?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>can you reach</b> the last index", "<b>minimum number of jumps</b>", "each element is the max jump length", "<b>circular</b> route", "gas / cost", "starting station", "partition so each letter appears in one part".</p>
  </div>
  <h3>Jump Game (LeetCode 55)</h3>
  <p><strong>Problem:</strong> the rider's route has stops 0, 1, 2, …. At stop i, a quick charge gives enough battery to go at most <code>nums[i]</code> stops further. Starting at stop 0, can the rider reach the last stop? Tonight's route [2, 3, 1, 1, 4] → yes. A bad route [3, 2, 1, 0, 4] → no (every path lands on the stop with 0 and gets stuck).</p>
  <p><strong>Brute force:</strong> try every jump length at every stop (backtracking). Exponential.</p>
  <p><strong>Greedy idea:</strong> you don't need to know <em>which</em> jumps to take, only <em>how far</em> you could possibly get. Keep <code>far</code> = farthest stop reachable so far. Walk left to right. If the current stop is beyond <code>far</code>, you could never have got here: stuck. Otherwise update <code>far = max(far, i + nums[i])</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking along a row of stepping stones while someone shouts how far each stone lets you leap. You don't plan the leaps; you just keep a finger on the farthest stone anyone has made reachable. If you ever stand on a stone past your finger, you could not really be there.</p>
  </div>
<div class="fx" data-lang="py">def can_jump(nums, trace=False):
    far = 0
    for i, step in enumerate(nums):
        if i &gt; far:                 # this stop was never reachable
            if trace: print(f"i={i}: {i} &gt; far={far} -&gt; stuck")
            return False
        far = max(far, i + step)
        if trace: print(f"i={i} step={step} far={far}")
    return True

def min_jumps(nums):                # Jump Game II: fewest jumps (charges) to the end
    jumps = cur_end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == cur_end:            # must jump now: go as far as we can
            jumps += 1
            cur_end = far
    return jumps

route = [2, 3, 1, 1, 4]             # stops on tonight's route: battery hops from each stop
print(can_jump(route))
print(can_jump([3, 2, 1, 0, 4], trace=True))
for t in [[0], [2, 0, 0], [0, 1]]:
    print(t, can_jump(t))
print("min charges:", min_jumps(route), min_jumps([2, 3, 0, 1, 4]), min_jumps([1]))</div>
  <div class="fx" data-lang="text">True
i=0 step=3 far=3
i=1 step=2 far=3
i=2 step=1 far=3
i=3 step=0 far=3
i=4: 4 &gt; far=3 -&gt; stuck
False
[0] True
[2, 0, 0] True
[0, 1] False
min charges: 2 2 0</div>
  <table class="tbl out"><caption>Trace: the bad route [3, 2, 1, 0, 4]</caption>
    <tr><th>i</th><th>nums[i]</th><th>i &gt; far?</th><th>far after</th></tr>
    <tr><td>0</td><td>3</td><td>0 &gt; 0 no</td><td>max(0, 0+3) = 3</td></tr>
    <tr><td>1</td><td>2</td><td>no</td><td>max(3, 3) = 3</td></tr>
    <tr><td>2</td><td>1</td><td>no</td><td>max(3, 3) = 3</td></tr>
    <tr><td>3</td><td>0</td><td>no</td><td>max(3, 3) = 3</td></tr>
    <tr><td>4</td><td>4</td><td>4 &gt; 3 <strong>yes → stuck</strong></td><td>return False</td></tr>
  </table>
  <h3>Jump Game II (LeetCode 45): fewest charges</h3>
  <p>Now the route is reachable; how few charging stops does the rider need? Think of it as BFS by levels: everything reachable with 1 jump is level 1, everything reachable from those is level 2, and so on. While walking through the current level, track <code>far</code>. When you reach the edge of the current level (<code>i == cur_end</code>), you must jump, and you jump as far as anything in this level allows.</p>
<div class="fx" data-lang="py">def min_jumps_trace(nums):
    jumps = cur_end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        msg = ""
        if i == cur_end:
            jumps += 1
            cur_end = far
            msg = f"edge of range -&gt; jump #{jumps}, new range ends at {cur_end}"
        print(f"i={i} nums[i]={nums[i]} far={far} {msg}")
    return jumps

print(min_jumps_trace([2, 3, 1, 1, 4]))</div>
  <div class="fx" data-lang="text">i=0 nums[i]=2 far=2 edge of range -&gt; jump #1, new range ends at 2
i=1 nums[i]=3 far=4 
i=2 nums[i]=1 far=4 edge of range -&gt; jump #2, new range ends at 4
i=3 nums[i]=1 far=4 
2</div>
  <table class="tbl out"><caption>Trace: tonight's route [2, 3, 1, 1, 4]</caption>
    <tr><th>i</th><th>nums[i]</th><th>far</th><th>i == cur_end?</th><th>jumps, cur_end</th></tr>
    <tr><td>0</td><td>2</td><td>2</td><td>0 == 0 yes → jump</td><td>1, 2</td></tr>
    <tr><td>1</td><td>3</td><td>4</td><td>no</td><td>1, 2</td></tr>
    <tr><td>2</td><td>1</td><td>4</td><td>2 == 2 yes → jump</td><td>2, 4</td></tr>
    <tr><td>3</td><td>1</td><td>4</td><td>no</td><td>2, 4 (the last stop is inside the range)</td></tr>
  </table>
  <p>2 charges: stop 0 → stop 1 → stop 4. <strong>Complexity:</strong> both O(n) time, O(1) space.</p>

  <h3>Gas Station (LeetCode 134)</h3>
  <p><strong>Problem:</strong> 5 restaurants on a circular loop, each with a charging point. <code>gas[i]</code> = range gained at restaurant i; <code>cost[i]</code> = range needed to ride to restaurant i+1. Start with an empty battery at some restaurant and complete one full circle. Return that start, or −1 if impossible. Tonight: gas [1, 2, 3, 4, 5], cost [3, 4, 5, 1, 2] → start at 3.</p>
  <p><strong>Brute force:</strong> try each start and simulate a full circle: O(n²).</p>
  <p><strong>Greedy idea, two facts:</strong></p>
  <ol>
    <li>If total gas &lt; total cost, no start works. If total gas ≥ total cost, some start always works.</li>
    <li>Start from i. If the tank goes negative when leaving j, then no restaurant between i and j can be a valid start either (you arrived at each of them with charge ≥ 0, so starting there with 0 would be even worse). So restart the candidate at j + 1.</li>
  </ol>
  <table class="tbl out">
    <caption>Trace: gas [1, 2, 3, 4, 5], cost [3, 4, 5, 1, 2] (gas − cost = [−2, −2, −2, 3, 3])</caption>
    <tr><th>i</th><th>tank += gas−cost</th><th>tank &lt; 0?</th><th>start</th></tr>
    <tr><td>0</td><td>−2</td><td>yes → reset</td><td>1</td></tr>
    <tr><td>1</td><td>−2</td><td>yes → reset</td><td>2</td></tr>
    <tr><td>2</td><td>−2</td><td>yes → reset</td><td>3</td></tr>
    <tr><td>3</td><td>3</td><td>no</td><td>3</td></tr>
    <tr><td>4</td><td>6</td><td>no</td><td>3 → total 15 − 15 = 0 ≥ 0, answer 3</td></tr>
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
  <h3>Template</h3>
<div class="fx" data-lang="text">far = 0                                   # reach: "how far could I get?"
for i, x in enumerate(nums):
    if i &gt; far: return False
    far = max(far, i + x)

start = tank = 0                          # running balance: "reset after a deficit"
for i in range(n):
    tank += gain[i] - cost[i]
    if tank &lt; 0: start, tank = i + 1, 0</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reach greedy</strong>: keep the farthest reachable index; one pass. <strong>Running-balance greedy</strong>: keep a running total and reset the candidate when it goes negative (the same idea as Kadane in the Arrays note). Both are O(n) time, O(1) space.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Jump Game II's loop runs to <code>len(nums) − 1</code>, not <code>len(nums)</code>: if you also "jump" at the last stop, you count one jump too many. Gas Station: forgetting the total check returns a start even when the loop is impossible ([2, 3, 4] / [3, 4, 3] must give −1).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>55 Jump Game</b>, <b>45 Jump Game II</b>, <b>134 Gas Station</b>, then <b>763 Partition Labels</b> (reach greedy on letters) and <b>1024 Video Stitching</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: When Greedy Fails.</b> Six problems, six greedy wins. That is dangerous: the same "take the best now" instinct is wrong for many problems that look just like these. How do we tell, before coding?</div>

  <h2 id="dsa-gr2-fail"><span class="num">07</span>When Greedy Fails</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every greedy so far came with a reason it is safe. What happens when the reason is missing, how do we notice quickly, and what do we use instead?</p>
  </div>
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

for amount, coins in [(6, [1, 3, 4]), (380, [1, 2, 5, 10, 20, 50, 100, 200, 500]), (12, [1, 5, 8])]:
    print(f"amount {amount:3} coins {coins}: greedy={greedy_coins(amount, coins)}  best={best_coins(amount, coins)}")

# "shortest window first" is another tempting greedy for max deliveries
def by_shortest(ivs):
    kept = []
    for s, e in sorted(ivs, key=lambda iv: iv[1] - iv[0]):
        if all(e &lt;= ks or s &gt;= ke for ks, ke in kept):
            kept.append((s, e))
    return kept
print("shortest first:", by_shortest([(0, 10), (9, 12), (11, 20)]), "  best: [(0, 10), (11, 20)]")</div>
  <div class="fx" data-lang="text">amount   6 coins [1, 3, 4]: greedy=3  best=2
amount 380 coins [1, 2, 5, 10, 20, 50, 100, 200, 500]: greedy=5  best=5
amount  12 coins [1, 5, 8]: greedy=5  best=4
shortest first: [(9, 12)]   best: [(0, 10), (11, 20)]</div>
  <p>With Indian notes, greedy and the exhaustive DP agree on ₹380 (5 notes). With coins {1, 3, 4} or {1, 5, 8} they disagree. And "shortest window first" for max deliveries picks [9, 12], which blocks both other windows: 1 delivery instead of 2.</p>
  <h3>The Biteful counter-example: deliveries that pay differently</h3>
  <p>Back to tonight's 7 windows, but now each delivery pays a different fee: A ₹90, B ₹20, C ₹25, D ₹20, E ₹60, F ₹20, G ₹30. The rider wants the most <em>money</em>, not the most deliveries.</p>
<div class="fx" data-lang="py">from itertools import combinations
# the same 7 windows, now each delivery pays a different fee (₹)
windows = {"A": (0, 50, 90), "B": (10, 20, 20), "C": (15, 30, 25), "D": (30, 45, 20),
           "E": (40, 70, 60), "F": (60, 80, 20), "G": (90, 110, 30)}

def ok(group):
    ivs = sorted(windows[k][:2] for k in group)
    return all(ivs[i][1] &lt;= ivs[i + 1][0] for i in range(len(ivs) - 1))

greedy = ["B", "D", "F", "G"]                      # earliest-end greedy: most deliveries
print("greedy (most deliveries):", greedy, "pay", sum(windows[k][2] for k in greedy))
best = max((g for r in range(8) for g in combinations(windows, r) if ok(g)),
           key=lambda g: sum(windows[k][2] for k in g))
print("best pay (all subsets):  ", list(best), "pay", sum(windows[k][2] for k in best))</div>
  <div class="fx" data-lang="text">greedy (most deliveries): ['B', 'D', 'F', 'G'] pay 90
best pay (all subsets):   ['A', 'F', 'G'] pay 140</div>
  <p>Earliest-end greedy still picks B, D, F, G (4 deliveries, ₹90). Taking the long window A (₹90) and then F and G earns ₹140. The exchange argument breaks: swapping a best schedule's first window for the earliest-ending one keeps the <em>count</em> but can lose <em>money</em>. Choices now interact, so we must compare "take A" against "skip A" for each window: that is <a class="xref" data-note="dsa_dp">Dynamic Programming</a> (weighted interval scheduling: sort by end, binary search the last compatible window, O(n log n)).</p>
  <div class="callout intu"><span class="label">How to decide</span>
    <p>Before trusting greedy, try to break it with a tiny example (3–5 items). If you can't, and you can argue "swapping any optimal choice for the greedy one never makes things worse" (the <strong>exchange argument</strong>), greedy is safe. If you can break it, the problem needs DP or backtracking.</p>
  </div>
  <table class="tbl">
    <tr><th>Greedy works</th><th>Greedy fails</th></tr>
    <tr><td>Indian currency change</td><td>Coin change with odd coin sets (needs DP)</td></tr>
    <tr><td>Most non-overlapping windows (sort by end)</td><td>Most <em>money</em> from non-overlapping windows (weighted: DP)</td></tr>
    <tr><td>Fractional knapsack: best value per kg first</td><td>0/1 Knapsack: biggest value first is wrong</td></tr>
    <tr><td>Dijkstra's shortest path, Huffman codes, Kruskal MST</td><td>Shortest path with negative edges; longest path</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Greedy-choice property</strong>: a locally best first choice is part of some optimal answer. <strong>Optimal substructure</strong>: after that choice, the rest is a smaller copy of the same problem. Greedy needs both; DP needs only the second.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Testing greedy only on the examples given in the problem statement. They are usually chosen so that greedy works. Make your own 3-item example where an early "best" pick blocks two good later ones.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>In the DP ladder: <b>322 Coin Change</b> (the coin counter-example at scale), <b>1235 Maximum Profit in Job Scheduling</b> (the paid-deliveries problem). In this ladder, <b>135 Candy</b> and <b>678 Valid Parenthesis String</b> are greedy problems where the obvious greedy is wrong and a cleverer one is right.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Traps &amp; Complexity.</b> We know when greedy is safe. What remains are the small slips (wrong sort key, touching ends, mutating the input) and a single table of costs.</div>

<h2 id="dsa-gr2-traps"><span class="num">08</span>Traps &amp; Complexity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which small slips turn a correct greedy idea into a wrong answer, and what does each technique cost?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong sort key</span>
    <p>Merging needs sort by <strong>start</strong>. Picking the most non-overlapping needs sort by <strong>end</strong>. Mixing them gives wrong answers: tonight, sorting by start keeps 3 deliveries instead of 4 (window A blocks B, C, D, E).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sorting the caller's list</span>
    <p><code>intervals.sort()</code> changes the input in place. Fine on LeetCode; in real code use <code>sorted(intervals)</code> if the caller still needs the original order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting greedy without a check</span>
    <p>"Take the biggest/earliest/cheapest first" feels right for many problems and is wrong for a lot of them (0/1 knapsack, coin change with odd coins, longest path). Spend 30 seconds trying to break it with a 3-item example before coding.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: touching ends</span>
    <p>C [15, 30] and D [30, 45]: merged by Merge Intervals (<code>&lt;=</code>), compatible for selection (<code>s &gt;= last_end</code>), and in the sweep the end must come before the start. Decide once, and say it out loud.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: max(…) when stretching</span>
    <p><code>res[-1][1] = max(res[-1][1], e)</code>: a short window inside a long one (B inside A) must not shrink the block.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have nine ideas. How does each grow out of the one before, and what does each give on the same 7 windows?</div>

  <h2 id="dsa-gr2-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Greedy idea, overlap test, merge, insert, riders needed, activity selection, jump game, gas station and the failure cases: how is each built from the ones before, and what does each give on tonight's 7 windows?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-gr2-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="210" y1="32" x2="230" y2="32" stroke="currentColor" marker-end="url(#dsa-gr2-a9)"/>
<line x1="430" y1="32" x2="450" y2="32" stroke="currentColor" marker-end="url(#dsa-gr2-a9)"/>
<line x1="550" y1="54" x2="550" y2="88" stroke="currentColor" marker-end="url(#dsa-gr2-a9)"/>
<line x1="500" y1="54" x2="380" y2="88" stroke="currentColor" marker-end="url(#dsa-gr2-a9)"/>
<line x1="230" y1="110" x2="210" y2="110" stroke="currentColor" marker-end="url(#dsa-gr2-a9)"/>
<line x1="110" y1="132" x2="110" y2="166" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-gr2-a9)"/>
<line x1="210" y1="188" x2="230" y2="188" stroke="currentColor" marker-end="url(#dsa-gr2-a9)"/>
<line x1="430" y1="188" x2="450" y2="188" stroke="currentColor" marker-end="url(#dsa-gr2-a9)"/>
<line x1="160" y1="132" x2="500" y2="166" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-gr2-a9)"/>
<line x1="550" y1="210" x2="550" y2="244" stroke="currentColor" marker-end="url(#dsa-gr2-a9)"/>
<rect x="10" y="10" width="200" height="44" rx="7" class="fb sb"/>
<text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">greedy idea</text>
<text x="110" y="45" text-anchor="middle" class="tm" font-size="10">change ₹380: 200,100,50,20,10</text>
<rect x="230" y="10" width="200" height="44" rx="7" class="fb sb"/>
<text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">intervals + overlap</text>
<text x="330" y="45" text-anchor="middle" class="tm" font-size="10">7 windows, 21 pair checks</text>
<rect x="450" y="10" width="200" height="44" rx="7" class="fg sg"/>
<text x="550" y="29" text-anchor="middle" font-size="11.5" font-weight="700">merge (sort by start)</text>
<text x="550" y="45" text-anchor="middle" class="tm" font-size="10">[0,80], [90,110]</text>
<rect x="450" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="550" y="107" text-anchor="middle" font-size="11.5" font-weight="700">insert interval</text>
<text x="550" y="123" text-anchor="middle" class="tm" font-size="10">H [85,95] → [85,110], O(n)</text>
<rect x="230" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">riders: heap / sweep</text>
<text x="330" y="123" text-anchor="middle" class="tm" font-size="10">peak 3 at once</text>
<rect x="10" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="110" y="107" text-anchor="middle" font-size="11.5" font-weight="700">activity selection (end)</text>
<text x="110" y="123" text-anchor="middle" class="tm" font-size="10">keep B, D, F, G = 4</text>
<rect x="10" y="166" width="200" height="44" rx="7" class="ft st"/>
<text x="110" y="185" text-anchor="middle" font-size="11.5" font-weight="700">jump game I / II</text>
<text x="110" y="201" text-anchor="middle" class="tm" font-size="10">reach far; 2 charges</text>
<rect x="230" y="166" width="200" height="44" rx="7" class="ft st"/>
<text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">gas station</text>
<text x="330" y="201" text-anchor="middle" class="tm" font-size="10">reset start on deficit → 3</text>
<rect x="450" y="166" width="200" height="44" rx="7" class="fr sr"/>
<text x="550" y="185" text-anchor="middle" font-size="11.5" font-weight="700">when greedy fails</text>
<text x="550" y="201" text-anchor="middle" class="tm" font-size="10">coins 1,3,4; pay 90 vs 140</text>
<rect x="450" y="244" width="200" height="44" rx="7" class="fv"/>
<text x="550" y="263" text-anchor="middle" font-size="11.5" font-weight="700">→ Dynamic Programming</text>
<text x="550" y="279" text-anchor="middle" class="tm" font-size="10">try all choices, remember</text>
</svg><figcaption>Blue: the two basic ideas. Green: interval greedies that start with a sort (merge by start, insert in O(n), peak overlap with a heap or sweep, selection by end). Gold: greedies on a route, with no sort (reach and running balance). Red: where greedy stops being safe, which hands over to DP.</figcaption></figure>
  <table class="tbl"><caption>Every concept on tonight's windows A [0, 50], B [10, 20], C [15, 30], D [30, 45], E [40, 70], F [60, 80], G [90, 110]</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Greedy idea</td><td>an order + "best now"</td><td>build an answer without trying all?</td><td>₹380 → 200, 100, 50, 20, 10</td><td>when a local best never blocks the global best</td></tr>
    <tr><td>Overlap test</td><td>two comparisons</td><td>do two windows clash?</td><td>8 clashing pairs out of 21</td><td>inside every interval problem</td></tr>
    <tr><td>Merge</td><td>sort by start + stretch</td><td>when is the rider busy?</td><td>[0, 80], [90, 110]</td><td>union, busy/free slots</td></tr>
    <tr><td>Insert</td><td>merge on sorted input, 3 phases</td><td>add one window in O(n)?</td><td>H [85, 95] → [0, 80], [85, 110]</td><td>input already sorted</td></tr>
    <tr><td>Riders needed</td><td>heap of ends / ±1 sweep</td><td>how many at once?</td><td>peak 3 (A, B, C and A, D, E)</td><td>rooms, platforms, capacity</td></tr>
    <tr><td>Activity selection</td><td>sort by end + exchange argument</td><td>most deliveries for one rider?</td><td>B, D, F, G = 4 (by start: 3)</td><td>max non-overlapping, min removals, arrows</td></tr>
    <tr><td>Jump game I / II</td><td>farthest reach, BFS levels</td><td>reachable? fewest stops?</td><td>[2, 3, 1, 1, 4]: yes, 2 charges</td><td>reach / jump arrays</td></tr>
    <tr><td>Gas station</td><td>running balance + reset</td><td>where to start a loop?</td><td>start 3 (total 15 = 15)</td><td>circular surplus/deficit</td></tr>
    <tr><td>When greedy fails</td><td>counter-example search</td><td>is greedy safe here?</td><td>coins {1, 3, 4}: 3 vs 2; pay ₹90 vs ₹140</td><td>weights, "exactly", odd coins → DP</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>greedy = choose the right order (start, end, or the route itself), keep one small piece of state (last block, heap of ends, last end, farthest reach, tank), and decide each item once.</strong> It is correct only when an exchange argument shows that the early choice never blocks a better future; when choices interact (weights, odd coins), you must compare options, and that is DP.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_dp">Dynamic Programming</a>: the paid deliveries (₹140, not ₹90) and coin change with {1, 3, 4}, solved by trying both choices and remembering sub-answers.</div>

  <h2 id="dsa-gr2-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example, minutes after 6:00 pm: <b>A [0, 50], B [10, 20], C [15, 30], D [30, 45], E [40, 70], F [60, 80], G [90, 110]</b>. Sorted by end: B, C, D, A, E, F, G. Route [2, 3, 1, 1, 4]; loop gas [1, 2, 3, 4, 5], cost [3, 4, 5, 1, 2].</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Greedy idea</td><td>best now, never undo?</td><td>₹380 = 200 + 100 + 50 + 20 + 10</td><td>needs an order; windows?</td></tr>
    <tr><td>Overlap test</td><td>do two windows clash?</td><td>A–B yes, B–D no, C–D touch</td><td>all pairs O(n²) → sort</td></tr>
    <tr><td>Merge</td><td>when busy?</td><td>[0, 80], [90, 110]</td><td>new order → re-sort?</td></tr>
    <tr><td>Insert</td><td>add H [85, 95]?</td><td>[0, 80], [85, 110], O(n)</td><td>doesn't count simultaneous</td></tr>
    <tr><td>Riders needed</td><td>how many at once?</td><td>3</td><td>one rider: which to take?</td></tr>
    <tr><td>Activity selection</td><td>most deliveries?</td><td>B, D, F, G (4)</td><td>routes have no sort</td></tr>
    <tr><td>Jump game I / II</td><td>reach the end? fewest charges?</td><td>yes; 2</td><td>circular loop?</td></tr>
    <tr><td>Gas station</td><td>where to start?</td><td>3</td><td>is greedy always right?</td></tr>
    <tr><td>When greedy fails</td><td>how to catch it?</td><td>pay ₹90 vs ₹140; coins 3 vs 2</td><td>→ DP</td></tr>
  </table>
  <h3>Templates and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Overlap</td><td><code>a.s &lt;= b.e and b.s &lt;= a.e</code>; sorted by start: <code>b.s &lt;= a.e</code></td><td>s = start, e = end; use &lt; if touching is allowed</td></tr>
    <tr><td>Merge</td><td>sort by s; if s ≤ last.e: last.e = max(last.e, e) else append</td><td>O(n log n)</td></tr>
    <tr><td>Insert</td><td>copy while e &lt; new.s; absorb while s ≤ new.e; append; copy rest</td><td>O(n), input sorted</td></tr>
    <tr><td>Rooms (heap)</td><td>sort by s; if heap[0] ≤ s: pop; push e; answer = max size</td><td>heap = end times of hired riders</td></tr>
    <tr><td>Rooms (sweep)</td><td>events (s, +1), (e, −1); sort; running sum; peak</td><td>(t, −1) sorts before (t, +1)</td></tr>
    <tr><td>Selection</td><td>sort by e; keep if s ≥ last_end</td><td>removals = n − kept</td></tr>
    <tr><td>Jump I</td><td>if i &gt; far: fail; far = max(far, i + nums[i])</td><td>far = farthest reachable index</td></tr>
    <tr><td>Jump II</td><td>for i &lt; n − 1: far = max(...); if i == cur_end: jumps += 1, cur_end = far</td><td>BFS levels</td></tr>
    <tr><td>Gas station</td><td>if Σgas &lt; Σcost: −1; tank += g − c; if tank &lt; 0: start = i + 1, tank = 0</td><td>one pass</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Sort by start</b><p>Merge, insert, union of ranges, riders/rooms with a heap.</p><small>Not for "most non-overlapping"</small></div>
    <div><b>Sort by end</b><p>Max non-overlapping, min removals, min arrows, pair chains.</p><small>Not when intervals carry weights (DP)</small></div>
    <div><b>Sweep line</b><p>Peak overlap, capacity checks, "how many at time t".</p><small>Not when you need which interval is where (use a heap)</small></div>
    <div><b>Reach / balance</b><p>Jump games, gas station, partition labels.</p><small>Not when you must list every path (backtracking)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Wrong sort key (start vs end); touching ends ([15, 30] and [30, 45]); <code>=e</code> instead of <code>max(…, e)</code> when stretching; <code>intervals.sort()</code> mutates the caller's list; ends must sort before starts in the sweep; Jump II loop to n − 1; gas station without the total check; trusting greedy without a 3-item counter-example; weights turn greedy into DP.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Merge tonight's windows.</td><td>[0, 80], [90, 110]</td></tr>
    <tr><td>Most deliveries for one rider, and which sort key?</td><td>4 (B, D, F, G), sort by end</td></tr>
    <tr><td>Riders needed, and at which moments is the peak reached?</td><td>3: 6:15–6:20 (A, B, C) and 6:40–6:45 (A, D, E)</td></tr>
    <tr><td>Jump Game on [3, 2, 1, 0, 4]?</td><td>False: at i = 4, far is still 3</td></tr>
    <tr><td>Why is "most deliveries" greedy but "most money" not?</td><td>Swapping in the earliest-ending window keeps the count but can lose money (A pays ₹90): choices interact → DP</td></tr>
  </table>

  
<h2 id="dsa-gr2-qa"><span class="num">10</span>Questions &amp; Answers</h2>
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
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does almost every interval greedy start with a sort, and what breaks if you skip it?</summary><div class="qa-body">Sorting is what lets you compare each interval with only the last block (merge) or the last kept end (selection). Without it, a window that overlaps an early block could appear at the end of the list, so one pass misses it and you are back to all pairs, O(n²): 21 checks for 7 windows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: merge and riders-needed both sort by start. Why can't merged blocks tell you how many riders you need?</summary><div class="qa-body">Merging only records whether <em>at least one</em> delivery is running: tonight it is one block [0, 80]. Riders needed is the <em>maximum number</em> running at once (3), which needs a count: a heap of end times or a ±1 sweep.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does the exchange argument rely on, and why does it fail for paid deliveries?</summary><div class="qa-body">It relies on "swapping the first chosen window for the earliest-ending one never makes the answer worse". For counts that is true (same number of windows, more room after). With fees, the swap can replace A (₹90) by B (₹20): the count stays, the money drops. So earliest-end greedy gets ₹90 while ₹140 was possible, and DP is needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is Gas Station's reset related to Kadane's algorithm in the Arrays note?</summary><div class="qa-body">Both keep a running sum of a stretch and drop the stretch the moment it goes negative, because a negative prefix can only hurt whatever follows. Kadane looks for the best stretch; Gas Station looks for the start of a stretch that never goes negative.</div></details>
</main>
`
});
