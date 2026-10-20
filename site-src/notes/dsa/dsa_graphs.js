// notes/dsa/dsa_graphs.js — Graphs
Object.assign(TOPIC_CONTENT, {
  "dsa_graphs": `<main>
<h1>Graphs</h1>
  <div class="where"><span>DSA</span><span>Trees &amp; graphs</span><span>Graphs</span></div>
  <p class="lead">A graph is "places plus connections": Biteful's restaurants and customers joined by roads, courses joined by prerequisites, cells of a map joined to their neighbours. A tree was a graph with exactly one route between any two places; real cities have loops, so we need new tools. This note builds them one need at a time on <b>one running example, Biteful's city map</b> (7 places, 7 roads, travel times in minutes): how to store it, how to walk it deep (DFS) and in rings (BFS), grids as graphs, loops (cycle detection), order (topological sort), merging groups (Union-Find), quickest routes with weights (Dijkstra, then Bellman-Ford for negative costs), the cheapest network that connects everyone (MST) and two-sided graphs (bipartite). Each pattern has trigger words, a template, a traced table, tested code, its cost and practice problems from the tracker. Every output below is a real run (Python 3.13).</p>

  <h2 id="dsa-gr-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-gr-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="60" y="6" width="520" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Hashing (visited set) · Stacks &amp; Queues (stack, deque) · Trees (DFS/BFS) · Heaps (heapq)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-gr-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Graphs</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · places + roads, with loops</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-gr-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-gr-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-gr-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Backtracking (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">DFS over choices, then undo</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Dynamic Programming</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">Bellman-Ford is a DP table</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Tries</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">a tree of letters + DFS</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-gr-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Graphs: about 75 problems, from Find Center of Star Graph to Critical Connections</text>
</svg><figcaption>Reading order for this stretch: Graphs → Backtracking → Dynamic Programming → Tries. Every earlier container returns here: the set marks visited places, the stack drives DFS, the deque drives BFS, the heap drives Dijkstra.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_trees">Trees</a> and <a class="xref" data-note="dsa_heaps">Heaps</a></b><span>Trees taught DFS (pre/in/post-order, by recursion) and BFS (level order, with a queue) on a structure with no loops: from the root there is exactly one way down to each node, so nothing is ever reached twice. Heaps gave a priority queue that always hands back the smallest item in O(log n). <a class="xref" data-note="dsa_hashing">Hashing</a> gave the O(1) "seen before?" set and <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a> the stack and the deque.</span></li>
    <li><b>This note adds: walking a network that has loops and costs</b><span>Storing a graph, DFS and BFS with a visited set, grids, cycle detection, topological sort, Union-Find, Dijkstra, Bellman-Ford, minimum spanning trees and bipartite checks, all on Biteful's city map.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_backtrack">Recursion &amp; Backtracking</a></b><span>DFS visits every <em>place</em> once. Backtracking runs the same deep walk over <em>choices</em> (which dish next in a combo?) and un-marks on the way back, so every <em>path</em> is explored. After that, <a class="xref" data-note="dsa_dp">Dynamic Programming</a> (Bellman-Ford's "best cost with at most i roads" is already a DP table) and <a class="xref" data-note="dsa_tries">Tries</a>. Practise in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>; recursion basics are in <a class="xref" data-note="py_functions">Python Functions</a>.</span></li>
  </ol>

  <h2 id="dsa-gr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next. Running example: Biteful's city, places <b>A</b> Rasoi (restaurant), <b>B</b> Bakehouse (restaurant), <b>C</b> Chowk crossing, <b>D</b> Dhruv, <b>E</b> Esha, and across the creek <b>F</b> Farah, <b>G</b> Gopal; roads in minutes <b>A–B 4, A–C 1, B–C 2, B–D 1, C–D 5, D–E 3, F–G 2</b>.</p>
  <ol class="story">
    <li><b>Graph</b><span>Q: how do we describe the city at all? → places (nodes) and roads (edges). It is not a tree: 5 places with 6 roads means 2 loops, and Rasoi reaches Dhruv by 4 different routes. So how do we put it in memory?</span></li>
    <li><b>Representations</b><span>Q: how do we store it? → the edge list we are given becomes an adjacency list (D → B 1, C 5, E 3) or a 7 × 7 matrix. Now: how do we visit everything reachable from Rasoi without going round a loop forever?</span></li>
    <li><b>DFS</b><span>Q: what can Rasoi reach? → go deep, chalk-mark each place: A, B, C, D, E; F and G form a second component. But DFS reached D through B and C, a 3-road detour, when B–D is only 2 roads from A. How do we get the fewest roads?</span></li>
    <li><b>BFS</b><span>Q: fewest roads from Rasoi to each place? → ripple out with a queue: B 1, C 1, D 2, E 3, path A–B–D–E. Many problems hand us a grid instead of a list of roads…</span></li>
    <li><b>Grid graphs</b><span>Q: how many separate neighbourhoods on a map of blocks? → each cell is a node with 4 neighbours: 3 islands; all kitchens at once (multi-source BFS) for "nearest kitchen". DFS kept bumping into already-visited places. Is that a loop?</span></li>
    <li><b>Cycle detection</b><span>Q: does the city have a loop? → undirected: a visited neighbour that is not my parent (C sees A again: yes). One-way streets need three colours: a road back to a GREY place. And when arrows mean "must happen before", we want an order with no loop…</span></li>
    <li><b>Topological sort</b><span>Q: in what order can the order pipeline run (accept, assign rider, cook, pack, hand over)? → Kahn: repeatedly take a step with no unfinished prerequisite. Next: roads reopen one at a time after a flood; "connected yet?" after each one, without a fresh DFS each time?</span></li>
    <li><b>Union-Find</b><span>Q: are these two places connected yet? → each group has a head; union merges heads, find follows parents (path compression flattens the chain). A–B reopening closes a loop. But all these tools count roads, not minutes…</span></li>
    <li><b>Dijkstra</b><span>Q: quickest route in minutes? → always settle the closest unsettled place, using a heap: B 3 (via C, not the direct 4), D 4, E 7. Breaks if a road has a negative cost…</span></li>
    <li><b>Bellman-Ford</b><span>Q: what if a leg carries a bonus (negative cost)? → relax every road V − 1 times: B 2 via the −3 bonus, which Dijkstra misses; an extra round detects a negative loop. Different question: which roads should get bike lanes?</span></li>
    <li><b>Minimum spanning tree</b><span>Q: cheapest set of lanes that still connects every place? → Kruskal: cheapest road first, skip any that closes a loop (Union-Find again): A–C, B–D, B–C, D–E = 7 km. Last question: can the graph be split into two sides?</span></li>
    <li><b>Bipartite check</b><span>Q: does every edge join a restaurant to a customer? → 2-colour with BFS: the orders graph splits; the road graph has a triangle A–B–C, so it cannot. Then the toolkit, how to pick the pattern, and 8 classic problems.</span></li>
  </ol>

  <h2 id="dsa-gr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Graphs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Vocabulary &amp; storage</div>
        <ul>
          <li><b>Node</b> = place, <b>edge</b> = road; V nodes, E edges</li>
          <li><b>Directed</b> (one-way) vs <b>undirected</b>; <b>weighted</b> = minutes</li>
          <li>Not a tree: 5 places, 6 roads → 2 loops, 4 routes A→D</li>
          <li><b>Adjacency list</b> O(V+E), the default · <b>matrix</b> O(V²) · <b>edge list</b></li>
          <li>⚠ undirected → add both ways</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Walking it</div>
        <ul>
          <li><b>DFS</b> — deep first; recursion or stack: A B C D E</li>
          <li><b>BFS</b> — rings; deque: B 1, C 1, D 2, E 3</li>
          <li>Both O(V+E); mark visited when you push</li>
          <li><b>Components</b>: {A..E}, {F, G}</li>
          <li><b>Grid</b>: 4 neighbours; 3 islands; multi-source BFS</li>
          <li>⚠ Python recursion limit ≈ 1000</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Loops &amp; order</div>
        <ul>
          <li><b>Undirected cycle</b>: visited non-parent (C sees A)</li>
          <li><b>Directed cycle</b>: edge into GREY (3 colours)</li>
          <li><b>Topo sort</b>: Kahn in-degree queue; accept → … → hand over</li>
          <li>Kahn outputs &lt; V nodes ⇒ cycle</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Groups</div>
        <ul>
          <li><b>Union-Find</b>: find (path compression) + union (by rank)</li>
          <li>≈ O(1) each; "connected yet?" as edges arrive</li>
          <li>Union returns False ⇒ that edge closes a loop (A–B)</li>
          <li><b>Bipartite</b>: 2-colour; fails on an odd cycle (A–B–C)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Weighted</div>
        <ul>
          <li><b>Dijkstra</b>: heap, settle closest: B 3, D 4, E 7</li>
          <li>O((V+E) log V); ⚠ no negative edges</li>
          <li><b>Bellman-Ford</b>: V−1 rounds, O(V·E); negatives OK</li>
          <li><b>MST</b>: Kruskal sort + DSU = 7; Prim = heap</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Islands</b>, <b>Clone Graph</b> — DFS/BFS</li>
          <li><b>Rotting Oranges</b> — multi-source BFS · <b>Word Ladder</b> — BFS</li>
          <li><b>Course Schedule</b> — Kahn · <b>Redundant Connection</b> — DSU</li>
          <li><b>Network Delay</b> — Dijkstra · <b>Cheapest Flights</b> — k-round Bellman-Ford</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-gr-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Not a Tree</span><span class="rm-sub">Biteful's city, loops, vocabulary</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-store"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Storing a Graph</span><span class="rm-sub">Edge list → list / matrix, costs</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-dfs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">DFS: Go Deep</span><span class="rm-sub">Recursive, stack, components</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-bfs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">BFS: Fewest Roads</span><span class="rm-sub">Queue, shortest unweighted path</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-grid"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Grid Graphs</span><span class="rm-sub">Islands, multi-source BFS</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-cycle"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Cycle Detection</span><span class="rm-sub">Parent check, three colours</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-topo"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Topological Sort</span><span class="rm-sub">Kahn traced, DFS version</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-uf"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Union-Find</span><span class="rm-sub">Path compression traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-sp"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Dijkstra</span><span class="rm-sub">Weighted shortest path, heap table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-bf"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Bellman-Ford</span><span class="rm-sub">Negative edges, rounds</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-mst"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Minimum Spanning Tree</span><span class="rm-sub">Kruskal with Union-Find, Prim</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-bip"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Bipartite Check</span><span class="rm-sub">Two sides, two colours</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-lib"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">The Python Toolkit</span><span class="rm-sub">defaultdict, deque, heapq, graphlib</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-patterns"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">Trigger words → algorithm</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-problems"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">8 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-traps"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Visited timing, direction, stale entries</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-connect"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-qa"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-gr-need"><span class="num">01</span>Restaurants and Roads Aren't a Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Trees note walked structures where every node has one parent, so from the root there is exactly one way to reach anything. Biteful's city is different: Rasoi can reach Dhruv along several roads, and a rider who keeps turning can come back to where they started. What is this structure, and what changes when there are loops?</p>
  </div>
  <h3>The running example: Biteful's city</h3>
  <p>Biteful delivers food. Two restaurants (A Rasoi, B Bakehouse), one busy crossing (C Chowk), and customers Dhruv (D) and Esha (E) sit on one side of a creek; customers Farah (F) and Gopal (G) live on the other side, joined only to each other. Each road is two-way and takes some minutes to ride.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640"><line x1="60" y1="110" x2="200" y2="40" stroke="currentColor"/><line x1="60" y1="110" x2="200" y2="180" stroke="currentColor"/><line x1="200" y1="40" x2="200" y2="180" stroke="currentColor"/><line x1="200" y1="40" x2="340" y2="110" stroke="currentColor"/><line x1="200" y1="180" x2="340" y2="110" stroke="currentColor"/><line x1="340" y1="110" x2="480" y2="110" stroke="currentColor"/><line x1="580" y1="45" x2="580" y2="175" stroke="currentColor"/><path d="M528 10 C 518 50, 538 90, 528 130 S 518 190, 528 220" fill="none" class="sb" stroke-dasharray="5 4"/><text x="510" y="222" class="tm" text-anchor="end">creek</text><text x="120" y="66" text-anchor="middle">4</text><text x="120" y="166" text-anchor="middle">1</text><text x="212" y="114">2</text><text x="282" y="66" text-anchor="middle">1</text><text x="282" y="166" text-anchor="middle">5</text><text x="410" y="102" text-anchor="middle">3</text><text x="592" y="114">2</text><circle cx="60" cy="110" r="17" class="fg sg"/><text x="60" y="114" text-anchor="middle">A</text><circle cx="200" cy="40" r="17" class="fg sg"/><text x="200" y="44" text-anchor="middle">B</text><circle cx="200" cy="180" r="17" class="fb sb"/><text x="200" y="184" text-anchor="middle">C</text><circle cx="340" cy="110" r="17" class="fv sb"/><text x="340" y="114" text-anchor="middle">D</text><circle cx="480" cy="110" r="17" class="fv sb"/><text x="480" y="114" text-anchor="middle">E</text><circle cx="580" cy="45" r="17" class="fv sb"/><text x="580" y="49" text-anchor="middle">F</text><circle cx="580" cy="175" r="17" class="fv sb"/><text x="580" y="179" text-anchor="middle">G</text><text x="60" y="148" class="tm" text-anchor="middle">Rasoi</text><text x="232" y="30" class="tm">Bakehouse</text><text x="200" y="216" class="tm" text-anchor="middle">Chowk</text><text x="340" y="146" class="tm" text-anchor="middle">Dhruv</text><text x="480" y="146" class="tm" text-anchor="middle">Esha</text><text x="604" y="49" class="tm">Farah</text><text x="604" y="179" class="tm">Gopal</text></svg><figcaption>The running example for the whole note. Green = restaurants, blue = crossing, purple = customers. Numbers are minutes. Two loops: A–B–C and B–C–D. F and G are cut off by the creek.</figcaption></figure>
<div class="fx" data-lang="py">places = {"A": "Rasoi (restaurant)", "B": "Bakehouse (restaurant)", "C": "Chowk crossing",
          "D": "Dhruv (customer)",   "E": "Esha (customer)",
          "F": "Farah (customer)",   "G": "Gopal (customer)"}
roads = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2), ("B", "D", 1),
         ("C", "D", 5), ("D", "E", 3), ("F", "G", 2)]      # (from, to, minutes)

print(len(places), "places,", len(roads), "roads")
main = {"A", "B", "C", "D", "E"}
inside = [r for r in roads if r[0] in main]
print("main area:", len(main), "places,", len(inside), "roads;",
      "a tree on 5 places has exactly", len(main) - 1)
print("extra roads =", len(inside) - (len(main) - 1), "-&gt; each extra road closes a loop")</div>
  <div class="fx" data-lang="text">7 places, 7 roads
main area: 5 places, 6 roads; a tree on 5 places has exactly 4
extra roads = 2 -&gt; each extra road closes a loop</div>
  <p>A tree on 5 places has exactly 4 edges; one more edge always creates a loop. The main area has 6 roads, so 2 extra roads and 2 independent loops (A–B–C and B–C–D). The practical effect: more than one route between the same two places. Rasoi to Dhruv, by hand:</p>
  <table class="tbl"><caption>Every loop-free route from A (Rasoi) to D (Dhruv)</caption>
    <tr><th>route</th><th>roads used</th><th>minutes</th></tr>
    <tr><td>A → B → D</td><td>2</td><td>4 + 1 = 5</td></tr>
    <tr><td>A → C → D</td><td>2</td><td>1 + 5 = 6</td></tr>
    <tr><td>A → C → B → D</td><td>3</td><td>1 + 2 + 1 = <b>4</b> (quickest)</td></tr>
    <tr><td>A → B → C → D</td><td>3</td><td>4 + 2 + 5 = 11</td></tr>
  </table>
  <p>Notice three things this table already tells us. A walk can return to a place it has already seen (A → B → C → A), so every algorithm needs a <strong>visited</strong> mark. The route with the fewest roads (A–B–D, 2 roads) is not the quickest (A–C–B–D, 4 minutes), so "fewest roads" and "least minutes" need different tools. And F, G cannot be reached at all: the city is in two pieces.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>WhatsApp contacts: each person is a <strong>node</strong>, "saved each other's number" is an <strong>edge</strong>. Instagram "follow" is a <strong>directed</strong> edge: you can follow a cricketer without him following back. A family group, where everyone reaches everyone through some chain, is a <strong>connected component</strong>.</p>
  </div>
  <table class="tbl">
    <tr><th>Word</th><th>Plain meaning</th><th>In Biteful's city</th></tr>
    <tr><td>Node (vertex)</td><td>A thing</td><td>A, B, C, D, E, F, G</td></tr>
    <tr><td>Edge</td><td>A connection between two nodes</td><td>the road B–D</td></tr>
    <tr><td>Undirected</td><td>The edge works both ways</td><td>all 7 roads</td></tr>
    <tr><td>Directed</td><td>One way only (an arrow)</td><td>one-way streets (section 06); "cook before pack" (section 07)</td></tr>
    <tr><td>Weighted</td><td>Each edge carries a number</td><td>minutes: B–D = 1</td></tr>
    <tr><td>Degree</td><td>How many edges touch a node</td><td>B has 3 (A, C, D)</td></tr>
    <tr><td>Path / cycle</td><td>A route; a route that returns to its start</td><td>A–C–B–D; A–B–C–A</td></tr>
    <tr><td>DAG</td><td>Directed, no cycles</td><td>the order pipeline (section 07)</td></tr>
    <tr><td>Connected component</td><td>A largest group where everyone reaches everyone</td><td>{A, B, C, D, E} and {F, G}</td></tr>
    <tr><td>Tree</td><td>Connected, no cycles, exactly V − 1 edges</td><td>keep A–C, C–B, B–D, D–E only</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>graph</strong> G = (V, E) is a set of vertices V and a set of edges E, each edge joining two vertices. A tree is the special case "connected and no cycles". Almost every graph walk costs <strong>O(V + E)</strong>: visit each node once, look at each edge once (twice if undirected).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating a graph like a tree: "I'll just recurse into every neighbour." On a tree each node is reached once; here A → B → C → A → B … never stops. The fix, the visited set, is the first line of every graph algorithm in this note.</p>
  </div>
  <p>Where you meet graphs: maps and delivery apps, LinkedIn "2nd-degree connections", pip installing dependencies in order, and in interviews every "grid", "prerequisites", "connected" or "minimum steps" question.</p>
  <div class="bridge"><b>What this still can't tell us → next: Storing a Graph.</b> We drew the city and listed routes by eye. A program is handed only a list of roads. What shape should it turn that list into so "who are D's neighbours?" is fast?</div>

  <h2 id="dsa-gr-store"><span class="num">02</span>Storing a Graph: Edge List → Adjacency List / Matrix</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every walk will repeat one question millions of times: "standing at D, where can I go next, and how long does each road take?" With only a list of 7 roads, answering it means scanning all 7. Which storage answers it in one step?</p>
  </div>
  <p>Interviews usually hand you an <strong>edge list</strong>: <code>[(u, v), …]</code> or <code>[(u, v, cost), …]</code>. Your first job is almost always to turn it into an <strong>adjacency list</strong>: for every node, the list of its neighbours (with costs if weighted). A third option is the <strong>adjacency matrix</strong>: a V × V table where cell [u][v] holds the cost of road u–v (0 = no road).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Edge list = the municipal register of roads, one line per road. Adjacency list = the signboard at each crossing listing where each exit goes. Matrix = the distance chart printed in a road atlas: every town against every town, mostly empty boxes.</p>
  </div>
  <p>By hand first. For each road (u, v, w) write v under u <em>and</em> u under v, because the road is two-way: A–B 4 gives A: (B, 4) and B: (A, 4). After all 7 roads: A: B4 C1 · B: A4 C2 D1 · C: A1 B2 D5 · D: B1 C5 E3 · E: D3 · F: G2 · G: F2. Fourteen entries for 7 roads.</p>
<div class="fx" data-lang="py">from collections import defaultdict

nodes = "ABCDEFG"
roads = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2), ("B", "D", 1),
         ("C", "D", 5), ("D", "E", 3), ("F", "G", 2)]   # 1) edge list: (u, v, minutes)

adj = defaultdict(list)                  # 2) adjacency list: place -&gt; [(neighbour, minutes)]
for u, v, w in roads:
    adj[u].append((v, w))
    adj[v].append((u, w))                # two-way road: store it from both ends
for u in nodes:
    print(u, "-&gt;", adj[u])

idx = {u: i for i, u in enumerate(nodes)}   # 3) adjacency matrix: needs a number per place
mat = [[0] * len(nodes) for _ in nodes]     # 0 = no road
for u, v, w in roads:
    mat[idx[u]][idx[v]] = mat[idx[v]][idx[u]] = w
print("   ", "  ".join(nodes))
for u in nodes:
    print(u, mat[idx[u]])
print("road B-D?", mat[idx["B"]][idx["D"]], "min | neighbours of D:", [v for v, _ in adj["D"]])</div>
  <div class="fx" data-lang="text">A -&gt; [('B', 4), ('C', 1)]
B -&gt; [('A', 4), ('C', 2), ('D', 1)]
C -&gt; [('A', 1), ('B', 2), ('D', 5)]
D -&gt; [('B', 1), ('C', 5), ('E', 3)]
E -&gt; [('D', 3)]
F -&gt; [('G', 2)]
G -&gt; [('F', 2)]
    A  B  C  D  E  F  G
A [0, 4, 1, 0, 0, 0, 0]
B [4, 0, 2, 1, 0, 0, 0]
C [1, 2, 0, 5, 0, 0, 0]
D [0, 1, 5, 0, 3, 0, 0]
E [0, 0, 0, 3, 0, 0, 0]
F [0, 0, 0, 0, 0, 0, 2]
G [0, 0, 0, 0, 0, 2, 0]
road B-D? 1 min | neighbours of D: ['B', 'C', 'E']</div>
  <p>Reading the output: D's row in the list is three entries, so "neighbours of D" costs 3 steps. The matrix answers "is there a road B–D?" in one lookup (1 minute) but spends 49 cells on 7 roads, and finding D's neighbours means reading its whole row of 7.</p>
  <table class="tbl">
    <tr><th>Store as</th><th>Space</th><th>"Neighbours of u?"</th><th>"Is u–v an edge?"</th><th>Use when</th></tr>
    <tr><td><strong>Adjacency list</strong></td><td>O(V + E)</td><td>O(degree)</td><td>O(degree) (O(1) with sets)</td><td>Almost always. Real graphs are sparse.</td></tr>
    <tr><td>Adjacency matrix</td><td>O(V²)</td><td>O(V) scan the row</td><td>O(1)</td><td>Small, dense graphs; Floyd-Warshall</td></tr>
    <tr><td>Edge list</td><td>O(E)</td><td>O(E) scan all</td><td>O(E)</td><td>Algorithms that loop over edges: Kruskal, Bellman-Ford</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>adjacency list</strong> maps each node to the collection of its neighbours (and edge weights). For an undirected graph every edge is stored twice, so the lists hold 2E entries; for a directed graph, E entries. Building it from an edge list is O(V + E).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the second line, <code>adj[v].append(u)</code>, on an undirected graph. The code runs, but D can no longer see B, and half the city silently becomes unreachable. Also: places with no roads never appear in a <code>defaultdict</code> built from edges, so loop over the full node list, not over <code>adj</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>1791 Find Center of Star Graph</b> (degrees from the edge list), <b>997 Find the Town Judge</b> (in-degree vs out-degree), <b>1615 Maximal Network Rank</b> (degree + "is u–v a road?" as a set).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: DFS.</b> We can list D's neighbours instantly. But "which places can Rasoi reach?" needs a walk that follows roads outward without circling the A–B–C loop forever.</div>

  <h2 id="dsa-gr-dfs"><span class="num">03</span>DFS: Go Deep</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Standing at Rasoi, which places can a rider reach at all? The adjacency list shows only the next step. We need a systematic walk that reaches every reachable place exactly once, even though the roads loop.</p>
  </div>
  <p>You are exploring an old haveli with many rooms. One rule: keep walking into a new room as long as you can. When a room has no unexplored door, walk back one room and try its next door. Chalk a mark on each room you enter so you never explore it twice.</p>
  <p>That is <strong>Depth-First Search</strong>. The "walk back" is exactly what recursion does when a function returns (or what popping a stack does). The chalk mark is the <strong>visited set</strong> from <a class="xref" data-note="dsa_hashing">Hashing</a>.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"can X reach Y", "is there a path", "connected", "count the groups / provinces / regions", "visit every node", "flood fill", "clone", any traversal where the order does not matter.</p>
  </div>
  <div class="flow"><span>mark u visited</span><span>for each neighbour v of u</span><span>if v not visited: DFS(v)</span><span>return (back up one room)</span></div>
  <h3>Traced by hand from A</h3>
  <table class="tbl out"><caption>Recursive DFS on the city (neighbours in alphabetical order)</caption>
    <tr><th>step</th><th>at</th><th>neighbours checked</th><th>action</th><th>call stack</th></tr>
    <tr><td>1</td><td>A</td><td>B</td><td>B unvisited → go</td><td>A</td></tr>
    <tr><td>2</td><td>B</td><td>A (seen), C</td><td>C unvisited → go</td><td>A B</td></tr>
    <tr><td>3</td><td>C</td><td>A (seen), B (seen), D</td><td>D unvisited → go</td><td>A B C</td></tr>
    <tr><td>4</td><td>D</td><td>B (seen), C (seen), E</td><td>E unvisited → go</td><td>A B C D</td></tr>
    <tr><td>5</td><td>E</td><td>D (seen)</td><td>dead end → return</td><td>A B C D E</td></tr>
    <tr><td>6</td><td>D, C, B, A</td><td>nothing new left</td><td>return, return, return, return</td><td>(empty)</td></tr>
  </table>
<div class="fx" data-lang="py">adj = defaultdict(list)                   # unweighted view of the city (section 02)
for u, v, _ in roads:
    adj[u].append(v)
    adj[v].append(u)

def dfs(u, seen, order, depth=0):
    seen.add(u)                           # chalk mark BEFORE going deeper
    order.append(u)
    print("  " * depth + f"enter {u}   seen={sorted(seen)}")
    for v in adj[u]:
        if v not in seen:
            dfs(v, seen, order, depth + 1)
    print("  " * depth + f"leave {u}")

order = []
dfs("A", set(), order)
print("recursive order:", order)</div>
  <div class="fx" data-lang="text">enter A   seen=['A']
  enter B   seen=['A', 'B']
    enter C   seen=['A', 'B', 'C']
      enter D   seen=['A', 'B', 'C', 'D']
        enter E   seen=['A', 'B', 'C', 'D', 'E']
        leave E
      leave D
    leave C
  leave B
leave A
recursive order: ['A', 'B', 'C', 'D', 'E']</div>
  <p>The indentation in the output is the recursion depth. Order A, B, C, D, E. Note that DFS reached D by the long way (A → B → C → D, 3 roads); DFS finds <em>a</em> path, not the shortest one. Without the seen check, step 2 would go back to A, then to B again, forever.</p>
  <h3>The same walk with an explicit stack</h3>
  <p>Recursion uses Python's call stack, which is limited to about 1000 frames. An explicit list used as a stack has no such limit. Push the start; repeatedly pop the newest item, mark it, and push its unvisited neighbours (reversed, so the first neighbour comes out first and the order matches the recursion).</p>
<div class="fx" data-lang="py">def dfs_iter(start, seen):
    order, stack = [], [start]
    print(f"{'pop':4} {'stack after pushes':22} order")
    while stack:
        u = stack.pop()                   # LIFO: newest first = go deep
        if u in seen:                     # pushed twice? skip the repeat
            print(f"{u:4} (already seen, skip)")
            continue
        seen.add(u)
        order.append(u)
        for v in reversed(adj[u]):        # reversed so the first neighbour is popped first
            if v not in seen:
                stack.append(v)
        print(f"{u:4} {str(stack):22} {order}")
    return order

seen = set()
print("iterative order:", dfs_iter("A", seen))

def components(nodes):
    seen, comps = set(), []
    for s in nodes:                       # try every place as a start
        if s not in seen:
            comps.append(dfs_quiet(s, seen))
    return comps

def dfs_quiet(start, seen):
    order, stack = [], [start]
    while stack:
        u = stack.pop()
        if u in seen:
            continue
        seen.add(u)
        order.append(u)
        stack.extend(v for v in reversed(adj[u]) if v not in seen)
    return order

print("components:", components("ABCDEFG"))</div>
  <div class="fx" data-lang="text">pop  stack after pushes     order
A    ['C', 'B']             ['A']
B    ['C', 'D', 'C']        ['A', 'B']
C    ['C', 'D', 'D']        ['A', 'B', 'C']
D    ['C', 'D', 'E']        ['A', 'B', 'C', 'D']
E    ['C', 'D']             ['A', 'B', 'C', 'D', 'E']
D    (already seen, skip)
C    (already seen, skip)
iterative order: ['A', 'B', 'C', 'D', 'E']
components: [['A', 'B', 'C', 'D', 'E'], ['F', 'G']]</div>
  <p>The stack can hold the same place twice (C was pushed by A and again by B), so the popped item is checked against <code>seen</code> before use: the two "skip" lines. The <code>components</code> loop tries every place as a start; each still-unvisited one begins a new component, giving {A, B, C, D, E} and {F, G}.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Depth-first search</strong> explores as far as possible along one branch before backing up, using recursion or a LIFO stack plus a visited set. It visits each node once and examines each edge once per direction: <strong>O(V + E) time, O(V) space</strong> (the visited set and the stack).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A 300 × 300 grid that is all land is one island of 90,000 cells. Recursive DFS goes 90,000 calls deep and crashes with <code>RecursionError</code>. <code>sys.setrecursionlimit(10**6)</code> sometimes helps but can crash the interpreter itself. In Python, prefer an explicit stack or BFS for big inputs.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>1971 Find if Path Exists in Graph</b> (exactly this walk), <b>547 Number of Provinces</b> (the components loop, on a matrix), <b>841 Keys and Rooms</b> (DFS from room 0; did we see every room?).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: BFS.</b> DFS told us Rasoi reaches Dhruv, but it got there by A → B → C → D, three roads, while A → B → D needs only two. "Fewest roads" needs a walk that finishes all places 1 road away before any place 2 roads away.</div>

  <h2 id="dsa-gr-bfs"><span class="num">04</span>BFS: Fewest Roads</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How many roads, at minimum, from Rasoi to each place? DFS dives down one branch first, so the first time it reaches a place may be via a detour. We need an order of visiting that guarantees "first reached = reached by the fewest roads".</p>
  </div>
  <p>Drop a stone in a pond. The ripple reaches everything 1 metre away first, then everything 2 metres away, then 3. <strong>Breadth-First Search</strong> visits places the same way: all neighbours of the start (1 road), then all their new neighbours (2 roads), and so on.</p>
  <p>The tool is a <strong>queue</strong> (first in, first out, a <code>deque</code> from <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a>), like a ration-shop line. Whoever was found earlier is processed earlier, so nearer places are always processed before farther ones.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"minimum number of steps / moves / hops / transformations", "shortest path" when every step costs the same, "nearest", "level by level", "spreads every minute".</p>
  </div>
  <div class="flow"><span>dist[src] = 0, queue = [src]</span><span>pop the oldest u</span><span>each unseen v: dist[v] = dist[u] + 1, parent[v] = u, push v</span><span>repeat until the queue is empty</span></div>
  <figure class="viz"><svg viewBox="0 0 600 235" width="600"><rect x="20" y="30" width="100" height="170" rx="8" class="fs"/><rect x="140" y="30" width="100" height="170" rx="8" class="fs"/><rect x="260" y="30" width="100" height="170" rx="8" class="fs"/><rect x="380" y="30" width="100" height="170" rx="8" class="fs"/><line x1="70" y1="115" x2="190" y2="70" stroke="currentColor"/><line x1="70" y1="115" x2="190" y2="160" stroke="currentColor"/><line x1="190" y1="70" x2="190" y2="160" stroke="currentColor" stroke-dasharray="4 4"/><line x1="190" y1="70" x2="310" y2="115" stroke="currentColor"/><line x1="190" y1="160" x2="310" y2="115" stroke="currentColor" stroke-dasharray="4 4"/><line x1="310" y1="115" x2="430" y2="115" stroke="currentColor"/><circle cx="70" cy="115" r="17" class="fg sg"/><text x="70" y="119" text-anchor="middle">A</text><circle cx="190" cy="70" r="17" class="fb sb"/><text x="190" y="74" text-anchor="middle">B</text><circle cx="190" cy="160" r="17" class="fb sb"/><text x="190" y="164" text-anchor="middle">C</text><circle cx="310" cy="115" r="17" class="fb sb"/><text x="310" y="119" text-anchor="middle">D</text><circle cx="430" cy="115" r="17" class="fb sb"/><text x="430" y="119" text-anchor="middle">E</text><text x="70" y="222" class="tm" text-anchor="middle">0 roads</text><text x="190" y="222" class="tm" text-anchor="middle">1 road</text><text x="310" y="222" class="tm" text-anchor="middle">2 roads</text><text x="430" y="222" class="tm" text-anchor="middle">3 roads</text><text x="500" y="80" class="tb">BFS order</text><text x="500" y="100">A B C D E</text><text x="500" y="140" class="tr">DFS reached D</text><text x="500" y="160">via A B C D</text></svg><figcaption>BFS from Rasoi sweeps the city in rings. Solid lines form the BFS tree (each place's parent); dashed roads were never needed for a fewest-roads route. D sits in ring 2 because A–B–D uses 2 roads.</figcaption></figure>
  <h3>Traced by hand from A</h3>
  <table class="tbl out"><caption>BFS queue on the city</caption>
    <tr><th>pop</th><th>new neighbours (dist)</th><th>queue after</th><th>parent recorded</th></tr>
    <tr><td>A (0)</td><td>B 1, C 1</td><td>[B, C]</td><td>B←A, C←A</td></tr>
    <tr><td>B (1)</td><td>D 2 (A, C already seen)</td><td>[C, D]</td><td>D←B</td></tr>
    <tr><td>C (1)</td><td>none (A, B, D seen)</td><td>[D]</td><td>–</td></tr>
    <tr><td>D (2)</td><td>E 3</td><td>[E]</td><td>E←D</td></tr>
    <tr><td>E (3)</td><td>none</td><td>[]</td><td>–</td></tr>
  </table>
<div class="fx" data-lang="py">from collections import deque

def bfs(src):
    dist = {src: 0}                  # doubles as the visited set
    parent = {src: None}
    q = deque([src])
    while q:
        u = q.popleft()              # FIFO: oldest first = nearest first
        for v in adj[u]:
            if v not in dist:        # first time seen = fewest roads
                dist[v] = dist[u] + 1
                parent[v] = u
                q.append(v)
        print(f"pop {u}  queue={list(q)}  dist={dist}")
    return dist, parent

def path_to(parent, t):
    out = []
    while t is not None:             # walk parents back to the source
        out.append(t)
        t = parent[t]
    return out[::-1]

dist, parent = bfs("A")
print("fewest roads A -&gt; E:", dist["E"], "via", path_to(parent, "E"))
print("F reachable from A?", "F" in dist)</div>
  <div class="fx" data-lang="text">pop A  queue=['B', 'C']  dist={'A': 0, 'B': 1, 'C': 1}
pop B  queue=['C', 'D']  dist={'A': 0, 'B': 1, 'C': 1, 'D': 2}
pop C  queue=['D']  dist={'A': 0, 'B': 1, 'C': 1, 'D': 2}
pop D  queue=['E']  dist={'A': 0, 'B': 1, 'C': 1, 'D': 2, 'E': 3}
pop E  queue=[]  dist={'A': 0, 'B': 1, 'C': 1, 'D': 2, 'E': 3}
fewest roads A -&gt; E: 3 via ['A', 'B', 'D', 'E']
F reachable from A? False</div>
  <p>The <code>dist</code> dict doubles as the visited set: a place is in it from the moment it is first discovered. The path comes from walking <code>parent</code> back from E: E ← D ← B ← A, reversed. F never enters the queue, so it is unreachable from A.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>When every edge costs the same, <strong>the first time BFS reaches a node is along a shortest path</strong>: the queue holds all distance-d nodes before any distance-(d+1) node. That is why "minimum number of steps / moves" means BFS. With minutes instead of road counts this breaks: BFS says A–B–D (2 roads, 5 minutes), but A–C–B–D takes 4 minutes. Section 09 fixes that.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Breadth-first search</strong> visits nodes in order of their distance (edge count) from the source using a FIFO queue and a visited set. It computes shortest paths in unweighted graphs. <strong>O(V + E) time, O(V) space.</strong></p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mark a node visited <strong>when you push it</strong>, not when you pop it; otherwise several neighbours push the same node and the queue explodes (C would be queued by A and by B). And use <code>deque.popleft()</code>: <code>list.pop(0)</code> is O(n), turning BFS into O(V²).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>1926 Nearest Exit from Entrance in Maze</b> (BFS on a grid), <b>1091 Shortest Path in Binary Matrix</b> (8 neighbours), <b>752 Open the Lock</b> (nodes are 4-digit codes).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Grid Graphs.</b> DFS and BFS need an adjacency list. Many problems hand us a picture instead: a grid of land and water, a maze, a map of blocks. Where are the nodes and edges in a grid?</div>

  <h2 id="dsa-gr-grid"><span class="num">05</span>Grid Graphs: Islands</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's operations team has a map of the city in square blocks: 1 = built-up block a rider can serve, 0 = water or park. "How many separate neighbourhoods are there?" is a components question, but there is no list of roads to build an adjacency list from.</p>
  </div>
  <p>A grid is a graph in disguise. Each cell <code>(r, c)</code> is a node, and its up / down / left / right cells are its neighbours. You never build an adjacency list: you compute the 4 neighbours on the fly and skip any that fall outside the grid. A corner cell has 2 neighbours, an edge cell 3, a middle cell 4.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"grid", "matrix of 0/1", "islands", "regions", "flood fill", "surrounded", "nearest X from every cell", "spreads to adjacent cells every minute".</p>
  </div>
  <div class="flow"><span>for every cell</span><span>if land and unseen: count += 1</span><span>BFS/DFS floods the whole island</span><span>neighbours = (r±1, c), (r, c±1) inside the borders</span></div>
  <h3>Counting neighbourhoods, traced</h3>
  <table class="tbl out"><caption>The zone map (rows 0–3, columns 0–4)</caption>
    <tr><th></th><th>c0</th><th>c1</th><th>c2</th><th>c3</th><th>c4</th></tr>
    <tr><th>r0</th><td><b>1</b></td><td><b>1</b></td><td>0</td><td>0</td><td>0</td></tr>
    <tr><th>r1</th><td><b>1</b></td><td><b>1</b></td><td>0</td><td>0</td><td>0</td></tr>
    <tr><th>r2</th><td>0</td><td>0</td><td><b>1</b></td><td>0</td><td>0</td></tr>
    <tr><th>r3</th><td>0</td><td>0</td><td>0</td><td><b>1</b></td><td><b>1</b></td></tr>
  </table>
  <p>Scan row by row. (0,0) is unseen land: island 1; flood it and mark (0,0), (1,0), (0,1), (1,1). The scan skips those, finds (2,2): island 2 (its 4 neighbours are all water; diagonals do not count). Then (3,3): island 3, flooding (3,4). Answer 3.</p>
<div class="fx" data-lang="py">from collections import deque

zone = ["11000",          # Biteful's delivery map: 1 = built-up block, 0 = water/park
        "11000",
        "00100",
        "00011"]

def count_islands(grid):
    R, C = len(grid), len(grid[0])
    seen = set()
    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1" and (r, c) not in seen:
                count += 1                       # a new, unvisited block of land
                q = deque([(r, c)])
                seen.add((r, c))
                cells = []
                while q:                         # BFS floods the whole island
                    cr, cc = q.popleft()
                    cells.append((cr, cc))
                    for nr, nc in ((cr+1, cc), (cr-1, cc), (cr, cc+1), (cr, cc-1)):
                        if 0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C and grid[nr][nc] == "1" \\
                                and (nr, nc) not in seen:
                            seen.add((nr, nc))
                            q.append((nr, nc))
                print(f"island {count} starts at {(r, c)}: {cells}")
    return count

print("islands:", count_islands(zone))</div>
  <div class="fx" data-lang="text">island 1 starts at (0, 0): [(0, 0), (1, 0), (0, 1), (1, 1)]
island 2 starts at (2, 2): [(2, 2)]
island 3 starts at (3, 3): [(3, 3), (3, 4)]
islands: 3</div>
  <h3>Multi-source BFS: nearest kitchen</h3>
  <p>"For every block, how far is the nearest Biteful kitchen?" Running one BFS per kitchen costs (kitchens × cells). Instead put <strong>all</strong> kitchens in the queue at distance 0 and run one BFS. Ripples start from every stone at once; each cell is reached first by its nearest kitchen.</p>
<div class="fx" data-lang="py">from collections import deque

def nearest_kitchen(grid):               # 0 = a Biteful kitchen, 1 = a street block
    R, C = len(grid), len(grid[0])
    dist = [[-1] * C for _ in range(R)]
    q = deque()
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 0:          # EVERY kitchen starts in the queue
                dist[r][c] = 0
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
            if 0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                q.append((nr, nc))
    return dist

for row in nearest_kitchen([[0, 1, 1], [1, 1, 1], [1, 1, 0]]):
    print(row)</div>
  <div class="fx" data-lang="text">[0, 1, 2]
[1, 2, 1]
[2, 1, 0]</div>
  <p>Kitchens at the two corners (0,0) and (2,2). The centre (1,1) is 2 steps from both. Cost: one BFS, O(R × C), however many sources there are. Rotting Oranges (section 15) is this exact pattern with "minutes" instead of distance.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>grid graph</strong> has one node per cell and an edge between 4-adjacent cells (8-adjacent if diagonals count). V = R × C, E ≤ 4V, so every traversal is <strong>O(R × C)</strong>. <strong>Multi-source BFS</strong> seeds the queue with every source at distance 0 and computes, for every node, the distance to its nearest source in one pass.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the border check gives an <code>IndexError</code> at the bottom row, or, worse, silently wraps around at the top because <code>grid[-1]</code> is the last row in Python. Always test <code>0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C</code> before reading the cell.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>733 Flood Fill</b>, <b>200 Number of Islands</b>, <b>695 Max Area of Island</b>; multi-source: <b>994 Rotting Oranges</b>, <b>542 01 Matrix</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Cycle Detection.</b> In every walk so far the visited set kept saying "already seen" (C saw A again, D saw C again). Each such bump is a loop in the map. Sometimes the loop itself is the question: "does this road network, or this set of rules, contain a cycle?"</div>

  <h2 id="dsa-gr-cycle"><span class="num">06</span>Cycle Detection</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Is there a loop in the city? For two-way roads, every place we came from is "already visited", which is not a loop. For one-way streets, two routes merging into the same place is not a loop either. What exactly marks a real cycle?</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"is there a cycle / loop", "can all tasks finish" (a cycle means no), "deadlock", "eventual safe states", "redundant edge", "is it a valid tree" (connected and no cycle).</p>
  </div>
  <h3>Undirected: a visited neighbour that is not my parent</h3>
  <p>In a two-way graph, the neighbour you just came from is always visited. That is the road behind you, not a loop. So remember the <strong>parent</strong>. If you meet any <em>other</em> visited neighbour, there are two different routes to it: a cycle.</p>
  <div class="flow"><span>DFS(u, parent)</span><span>v == parent → ignore</span><span>v seen → CYCLE</span><span>else DFS(v, u)</span></div>
  <table class="tbl out"><caption>Traced on the city from A</caption>
    <tr><th>at</th><th>parent</th><th>neighbour</th><th>verdict</th></tr>
    <tr><td>A</td><td>–</td><td>B</td><td>unseen → go to B</td></tr>
    <tr><td>B</td><td>A</td><td>A</td><td>my parent → ignore</td></tr>
    <tr><td>B</td><td>A</td><td>C</td><td>unseen → go to C</td></tr>
    <tr><td>C</td><td>B</td><td>A</td><td>seen and NOT my parent → <b>cycle</b> (A–B–C–A)</td></tr>
  </table>
<div class="fx" data-lang="py">def has_cycle_undirected(nodes, edges):
    adj = defaultdict(list)
    for u, v, *_ in edges:
        adj[u].append(v)
        adj[v].append(u)
    seen = set()

    def dfs(u, parent):
        seen.add(u)
        for v in adj[u]:
            if v == parent:          # the road I just came on: not a loop
                continue
            if v in seen:            # reached again by ANOTHER road: a loop
                print(f"  at {u}: neighbour {v} is already seen and is not my parent ({parent})")
                return True
            print(f"  {u} -&gt; {v}")
            if dfs(v, u):
                return True
        return False

    return any(u not in seen and dfs(u, None) for u in nodes)

print("city:", has_cycle_undirected("ABCDEFG", roads))
tree_roads = [("A", "C"), ("C", "B"), ("B", "D"), ("D", "E")]   # a tree: one route only
print("tree:", has_cycle_undirected("ABCDE", tree_roads))</div>
  <div class="fx" data-lang="text">  A -&gt; B
  B -&gt; C
  at C: neighbour A is already seen and is not my parent (B)
city: True
  A -&gt; C
  C -&gt; B
  B -&gt; D
  D -&gt; E
tree: False</div>
  <p>Keep only 4 roads (A–C, C–B, B–D, D–E, a tree) and the walk finishes without ever meeting a non-parent visited place: no cycle.</p>
  <h3>Directed: three colours</h3>
  <p>Biteful's central zone switches to one-way streets: A→B, A→C, C→B, B→D, D→E. B is reachable two ways (A→B and A→C→B), so a 2-state "visited" check would wrongly report a loop. We need to know whether a node is <strong>on the path we are walking right now</strong>.</p>
  <p>Give every node a colour: <strong>WHITE</strong> = not visited, <strong>GREY</strong> = entered, still on the current path, <strong>BLACK</strong> = finished and safe. An edge into a GREY node goes back onto our own path: a cycle. An edge into a BLACK node just joins a finished branch.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Theseus in the labyrinth unrolls a thread as he walks. Rooms on the thread are GREY. If a corridor leads to a room where the thread already lies, he has walked in a circle. A room he finished and rolled the thread back from is BLACK; reaching it again just means two corridors join.</p>
  </div>
  <table class="tbl out"><caption>One-way city, then the same with a new street E→C</caption>
    <tr><th>walk</th><th>colours as we go</th><th>verdict</th></tr>
    <tr><td>A→B→D→E</td><td>A, B, D, E grey; E has no exit → E black, D black, B black</td><td>–</td></tr>
    <tr><td>back at A: A→C</td><td>C grey; C→B: B is BLACK → fine; C black, A black</td><td>no cycle</td></tr>
    <tr><td>with E→C: A→B→D→E→C</td><td>A, B, D, E, C all grey; C→B: B is GREY</td><td><b>cycle</b> B→D→E→C→B</td></tr>
  </table>
<div class="fx" data-lang="py">from collections import defaultdict

WHITE, GREY, BLACK = "white", "grey", "black"

def has_cycle_directed(nodes, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)                 # one-way street u -&gt; v
    color = {u: WHITE for u in nodes}

    def dfs(u):
        color[u] = GREY                  # on the path I am walking now
        for v in adj[u]:
            if color[v] == GREY:         # back onto my own path: a loop
                print(f"  edge {u}-&gt;{v}: {v} is GREY -&gt; cycle")
                return True
            if color[v] == WHITE and dfs(v):
                return True
        color[u] = BLACK                 # finished, every exit explored, safe
        print(f"  {u} done -&gt; BLACK")
        return False

    return any(color[u] == WHITE and dfs(u) for u in nodes)

one_way = [("A", "B"), ("A", "C"), ("C", "B"), ("B", "D"), ("D", "E")]
print("one-way city:", has_cycle_directed("ABCDE", one_way))
print("after E-&gt;C opens:", has_cycle_directed("ABCDE", one_way + [("E", "C")]))</div>
  <div class="fx" data-lang="text">  E done -&gt; BLACK
  D done -&gt; BLACK
  B done -&gt; BLACK
  C done -&gt; BLACK
  A done -&gt; BLACK
one-way city: False
  edge C-&gt;B: B is GREY -&gt; cycle
after E-&gt;C opens: True</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>undirected</strong> graph has a cycle iff DFS meets a visited neighbour other than its parent (equivalently, Union-Find meets an edge whose ends already share a root, section 08). A <strong>directed</strong> graph has a cycle iff DFS finds an edge into a GREY (in-progress) node, a "back edge". Both O(V + E).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using the undirected "parent" trick on a directed graph gives a wrong "cycle" on A→B, A→C→B. Using two colours (just visited / not) does the same. Directed = three colours (or Kahn's algorithm, next section). And on a multigraph (two separate roads between the same pair) the parent trick misses the 2-road loop: compare edge ids, not node ids.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>207 Course Schedule</b> (directed cycle = impossible), <b>802 Find Eventual Safe States</b> (nodes that never reach a GREY), <b>1559 Detect Cycles in 2D Grid</b> (undirected, parent cell).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Topological Sort.</b> Cycle detection says yes or no. When the arrows are rules ("cook before pack") and there is no cycle, we want more: an actual order in which to do every step.</div>

  <h2 id="dsa-gr-topo"><span class="num">07</span>Topological Sort</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each Biteful order goes through five steps with rules: accept before assigning a rider and before cooking, cooking before packing, and both packing and the rider before hand-over. In what order can the system run them so that no step starts before its prerequisites? Three colours only told us "no loop".</p>
  </div>
  <p>Any order that respects every "before" rule is a <strong>topological order</strong>. It exists only if the rules have no loop (a DAG). Often there are several.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"prerequisites", "order of tasks", "dependencies", "build order", "course schedule", "recipe needs ingredients", "alien dictionary", "can all be finished".</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600"><defs><marker id="dsa-gr-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="125" y1="98" x2="165" y2="55" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><line x1="125" y1="117" x2="165" y2="160" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><line x1="275" y1="47" x2="470" y2="98" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><line x1="275" y1="167" x2="315" y2="167" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><line x1="425" y1="160" x2="470" y2="118" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><rect x="15" y="90" width="110" height="34" rx="6" class="fg sg"/><text x="70" y="111" text-anchor="middle">accept (0)</text><rect x="165" y="30" width="110" height="34" rx="6" class="fb sb"/><text x="220" y="51" text-anchor="middle">rider (1)</text><rect x="165" y="150" width="110" height="34" rx="6" class="fb sb"/><text x="220" y="171" text-anchor="middle">cook (2)</text><rect x="315" y="150" width="110" height="34" rx="6" class="fb sb"/><text x="370" y="171" text-anchor="middle">pack (3)</text><rect x="470" y="90" width="115" height="34" rx="6" class="fv sb"/><text x="527" y="111" text-anchor="middle">hand over (4)</text><text x="70" y="142" class="tm" text-anchor="middle">in=0</text><text x="220" y="82" class="tm" text-anchor="middle">in=1</text><text x="220" y="202" class="tm" text-anchor="middle">in=1</text><text x="370" y="202" class="tm" text-anchor="middle">in=1</text><text x="527" y="142" class="tm" text-anchor="middle">in=2</text><text x="300" y="238" text-anchor="middle" class="tb">Kahn order: accept, rider, cook, pack, hand over</text></svg><figcaption>Biteful's order pipeline as a DAG. "in" is the in-degree: how many steps must finish first. Kahn's algorithm starts with every in=0 step and lowers the counts as steps finish.</figcaption></figure>
  <h3>Kahn's algorithm (BFS on in-degrees)</h3>
  <p>Count, for each step, how many prerequisites it still waits for (its <strong>in-degree</strong>). Put every step with 0 in a queue. Pop one, "do" it, and decrease the count of every step that depended on it. Whoever drops to 0 joins the queue.</p>
  <div class="flow"><span>indeg[v] = number of arrows into v</span><span>queue = all v with indeg 0</span><span>pop u, output u, indeg[next] −= 1</span><span>0 → push; output &lt; V ⇒ cycle</span></div>
  <table class="tbl out"><caption>Dry run on the pipeline (in-degrees of steps 0..4)</caption>
    <tr><th>pop</th><th>in-degrees after</th><th>queue</th><th>order</th></tr>
    <tr><td>start</td><td>[0, 1, 1, 1, 2]</td><td>[0]</td><td>[]</td></tr>
    <tr><td>0 accept</td><td>[0, 0, 0, 1, 2]</td><td>[1, 2]</td><td>[0]</td></tr>
    <tr><td>1 rider</td><td>[0, 0, 0, 1, 1]</td><td>[2]</td><td>[0, 1]</td></tr>
    <tr><td>2 cook</td><td>[0, 0, 0, 0, 1]</td><td>[3]</td><td>[0, 1, 2]</td></tr>
    <tr><td>3 pack</td><td>[0, 0, 0, 0, 0]</td><td>[4]</td><td>[0, 1, 2, 3]</td></tr>
    <tr><td>4 hand over</td><td>–</td><td>[]</td><td>[0, 1, 2, 3, 4]</td></tr>
  </table>
<div class="fx" data-lang="py">from collections import defaultdict, deque

steps = ["accept", "assign rider", "cook", "pack", "hand over"]   # Biteful order pipeline
rules = [(0, 1), (0, 2), (1, 4), (2, 3), (3, 4)]                  # (u, v): u must happen before v

def topo_kahn(n, edges):
    adj = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1                        # v waits for one more step
    q = deque(u for u in range(n) if indeg[u] == 0)
    order = []
    print(f"start     indeg={indeg}  queue={list(q)}")
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1                    # one prerequisite of v is done
            if indeg[v] == 0:
                q.append(v)
        print(f"pop {u}     indeg={indeg}  queue={list(q)}  order={order}")
    return order if len(order) == n else []  # [] means a cycle

order = topo_kahn(5, rules)
print([steps[i] for i in order])
print("with a loop:", topo_kahn(2, [(0, 1), (1, 0)]))</div>
  <div class="fx" data-lang="text">start     indeg=[0, 1, 1, 1, 2]  queue=[0]
pop 0     indeg=[0, 0, 0, 1, 2]  queue=[1, 2]  order=[0]
pop 1     indeg=[0, 0, 0, 1, 1]  queue=[2]  order=[0, 1]
pop 2     indeg=[0, 0, 0, 0, 1]  queue=[3]  order=[0, 1, 2]
pop 3     indeg=[0, 0, 0, 0, 0]  queue=[4]  order=[0, 1, 2, 3]
pop 4     indeg=[0, 0, 0, 0, 0]  queue=[]  order=[0, 1, 2, 3, 4]
['accept', 'assign rider', 'cook', 'pack', 'hand over']
start     indeg=[1, 1]  queue=[]
with a loop: []</div>
  <p>With a loop (0 before 1, 1 before 0) both in-degrees start at 1, the queue starts empty and nothing is output: fewer than V steps means a cycle. That is why Kahn's algorithm doubles as a cycle detector.</p>
  <h3>DFS version (post-order, reversed)</h3>
  <p>Run the 3-colour DFS. When a node turns BLACK, everything that must come <em>after</em> it is already finished and added. So add it to a list at that moment, and reverse the list at the end.</p>
<div class="fx" data-lang="py">from collections import defaultdict

def topo_dfs(n, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
    color, finished = [0] * n, []        # 0 white, 1 grey, 2 black

    def dfs(u):
        color[u] = 1
        for v in adj[u]:
            if color[v] == 1:
                return False             # cycle
            if color[v] == 0 and not dfs(v):
                return False
        color[u] = 2
        finished.append(u)               # added AFTER everything that must follow it
        return True

    for u in range(n):
        if color[u] == 0 and not dfs(u):
            return []
    print("finish order:", finished)
    return finished[::-1]

print("topo order:  ", topo_dfs(5, [(0, 1), (0, 2), (1, 4), (2, 3), (3, 4)]))</div>
  <div class="fx" data-lang="text">finish order: [4, 1, 3, 2, 0]
topo order:   [0, 2, 3, 1, 4]</div>
  <p>Hand over (4) finishes first because nothing follows it; accept (0) finishes last. Reversed: accept, cook, pack, rider, hand over. A different but equally valid order. Both run in O(V + E).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>topological order</strong> of a directed graph lists every node so that every edge u → v has u before v. It exists iff the graph is a DAG. <strong>Kahn's algorithm</strong> repeatedly removes a node of in-degree 0; reversed DFS finish order also works. <strong>O(V + E).</strong></p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Edge direction. In Course Schedule, <code>[a, b]</code> means "b before a", so the edge goes <code>b → a</code>. Getting this backwards gives a reversed order that still "looks" fine on symmetric tests. Say the direction out loud: "arrow from the thing that must happen first".</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>210 Course Schedule II</b> (Kahn, return the order), <b>2115 Find All Possible Recipes from Given Supplies</b> (nodes are strings), <b>1557 Minimum Number of Vertices to Reach All Nodes</b> (just the in-degree-0 nodes).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Union-Find.</b> All tools so far take the whole graph and walk it once. After a flood, Biteful's roads reopen one at a time, and dispatch asks after each one: "can Esha be reached from Rasoi yet?" Re-running DFS after every road costs O(V + E) each time.</div>

  <h2 id="dsa-gr-uf"><span class="num">08</span>Union-Find (Disjoint Set Union)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Roads arrive one by one: A–C, B–D, B–C, F–G, A–B, D–E. After each, "are these two places connected yet?" and "did this road just close a loop?" We need a structure that merges groups and answers "same group?" almost instantly, without walking the map again.</p>
  </div>
  <p>A village of joint families. Each family has one <strong>mukhiya</strong> (head). "Are Ravi and Asha in the same family?" = compare their mukhiyas. "These two families merge" = one mukhiya now reports to the other. Union-Find answers both in almost O(1).</p>
  <ul>
    <li><code>parent[x]</code>: whom x reports to. A head reports to itself.</li>
    <li><code>find(x)</code>: follow parents up to the head.</li>
    <li><code>union(a, b)</code>: find both heads; if different, attach one head under the other. If equal, a and b were already connected, so the new edge closes a loop.</li>
  </ul>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"edges added one by one", "are they connected (yet)", "merge groups / accounts", "number of connected components" (especially as edges arrive), "redundant edge", "equations a==b", Kruskal.</p>
  </div>
  <div class="flow"><span>parent[x] = x for all</span><span>find: follow parent to the head (compress on the way back)</span><span>union: heads differ → short tree under tall</span><span>heads equal → this edge closes a loop</span></div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Two small tricks keep the chains almost flat. <strong>Path compression</strong>: after <code>find(x)</code> walks up, point everyone on that path straight at the head, so the next find is one hop. <strong>Union by rank</strong>: attach the shorter tree under the taller one, so trees never grow tall. Together, each operation is O(α(n)), where α (inverse Ackermann) is ≤ 4 for any n you will ever see.</p>
  </div>
  <h3>Traced as the roads reopen</h3>
  <table class="tbl out"><caption>parent of A B C D E F G after each road (rank in brackets for heads)</caption>
    <tr><th>road</th><th>find heads</th><th>action</th><th>parent A..G</th><th>groups</th></tr>
    <tr><td>start</td><td>–</td><td>everyone heads themselves</td><td>A B C D E F G</td><td>7</td></tr>
    <tr><td>A–C</td><td>A, C (both rank 0)</td><td>C under A; A rank 1</td><td>A B <b>A</b> D E F G</td><td>6</td></tr>
    <tr><td>B–D</td><td>B, D (rank 0)</td><td>D under B; B rank 1</td><td>A B A <b>B</b> E F G</td><td>5</td></tr>
    <tr><td>B–C</td><td>B, A (both rank 1)</td><td>A under B; B rank 2</td><td><b>B</b> B A B E F G</td><td>4</td></tr>
    <tr><td>F–G</td><td>F, G</td><td>G under F</td><td>B B A B E F <b>F</b></td><td>3</td></tr>
    <tr><td>A–B</td><td>B, B</td><td><b>same head: loop!</b> nothing merged</td><td>B B A B E F F</td><td>3</td></tr>
    <tr><td>D–E</td><td>B, E</td><td>E under B</td><td>B B A B <b>B</b> F F</td><td>2</td></tr>
    <tr><td>find(C)</td><td>C → A → B</td><td>compress: C now points at B</td><td>B B <b>B</b> B B F F</td><td>2</td></tr>
  </table>
<div class="fx" data-lang="py">class DSU:
    def __init__(self, names):
        self.parent = {x: x for x in names}   # everyone is their own head
        self.rank = {x: 0 for x in names}     # rough tree height
        self.count = len(names)               # number of separate groups

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])   # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                      # already connected: this road closes a loop
        if self.rank[ra] &lt; self.rank[rb]:
            ra, rb = rb, ra                   # ra = the taller tree
        self.parent[rb] = ra                  # short tree goes under tall tree
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.count -= 1
        return True

d = DSU("ABCDEFG")
reopened = [("A", "C"), ("B", "D"), ("B", "C"), ("F", "G"), ("A", "B"), ("D", "E")]
for a, b in reopened:                         # roads reopen one by one after the flood
    merged = d.union(a, b)
    print(f"open {a}-{b}: {'merged ' if merged else 'LOOP   '} parent={''.join(d.parent[x] for x in 'ABCDEFG')} groups={d.count}")
print("E reaches A?", d.find("E") == d.find("A"), "| F reaches A?", d.find("F") == d.find("A"))
print("before find(C):", "".join(d.parent[x] for x in "ABCDEFG"), "(C -&gt; A -&gt; B: two hops)")
d.find("C")                                   # walks C -&gt; A -&gt; B, then points C straight at B
print("after  find(C):", "".join(d.parent[x] for x in "ABCDEFG"), "(C -&gt; B: one hop)")</div>
  <div class="fx" data-lang="text">open A-C: merged  parent=ABADEFG groups=6
open B-D: merged  parent=ABABEFG groups=5
open B-C: merged  parent=BBABEFG groups=4
open F-G: merged  parent=BBABEFF groups=3
open A-B: LOOP    parent=BBABEFF groups=3
open D-E: merged  parent=BBABBFF groups=2
E reaches A? True | F reaches A? False
before find(C): BBABBFF (C -&gt; A -&gt; B: two hops)
after  find(C): BBBBBFF (C -&gt; B: one hop)</div>
  <p>The A–B road returns False: Rasoi and Bakehouse were already joined through C, so that road is redundant (it closes the loop A–B–C). This is exactly "Redundant Connection". The last two lines show path compression: before, finding C took two hops (C → A → B); after one find, C points straight at B.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>disjoint set union</strong> keeps a forest where each tree is one group and its root is the representative. <code>find</code> returns the root; <code>union</code> links two roots. With path compression and union by rank, m operations on n elements cost <strong>O(m · α(n))</strong>, effectively O(1) each; space O(n). It answers "same group?" only, never "which path?" or "how far?".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Linking the original nodes instead of their heads: <code>parent[a] = b</code> instead of <code>parent[find(a)] = find(b)</code>. It cuts a out of its old group and merges the wrong things. Always union the <em>roots</em>. And recursive <code>find</code> can hit the recursion limit on a long chain before compression kicks in; the iterative "path halving" version in section 11 avoids that.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>684 Redundant Connection</b> (exactly the A–B step), <b>1319 Number of Operations to Make Network Connected</b> (count groups and spare edges), <b>721 Accounts Merge</b> (union by shared email).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Dijkstra.</b> DFS, BFS and Union-Find all ignore the minutes on the roads. BFS said A–B–D is best (2 roads), but the clock says A–C–B–D (4 minutes) beats it (5 minutes). With different costs per road, "fewest roads" is the wrong question.</div>

  <h2 id="dsa-gr-sp"><span class="num">09</span>Dijkstra: Quickest Route by Minutes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What is the quickest time from Rasoi to every customer? BFS's ring order assumed every road costs 1. With roads of 1 to 5 minutes, a place reached via more roads can be quicker. We need an order that processes places by <em>minutes</em> from the start, not by road count.</p>
  </div>
  <p>Keep a heap (from <a class="xref" data-note="dsa_heaps">Heaps</a>) of <code>(minutes so far, place)</code>. Pop the smallest. Its time is now final: any other route to it would pass through something at least as far, and minutes never go negative. Then try each road out of it ("relax"): if it gives a neighbour a quicker time, record it and push.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Riders leave Rasoi in every direction at once, and you watch a clock. The first rider to arrive at a place fixes that place's quickest time; later riders arriving there are simply too slow. The heap is the "who arrives next?" board.</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"cheapest / fastest / minimum cost / minimum time" with non-negative weights, "network delay", "minimum effort", "probability" (max-product with a max-heap), weighted grid.</p>
  </div>
  <div class="flow"><span>dist[src] = 0, heap = [(0, src)]</span><span>pop smallest (d, u); skip if d &gt; dist[u]</span><span>for (v, w): if d + w &lt; dist[v] → update, push</span><span>until heap empty</span></div>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600"><line x1="60" y1="110" x2="200" y2="40" stroke="currentColor" stroke-dasharray="4 4"/><line x1="200" y1="180" x2="340" y2="110" stroke="currentColor" stroke-dasharray="4 4"/><line x1="60" y1="110" x2="200" y2="180" class="sg" stroke-width="3"/><line x1="200" y1="180" x2="200" y2="40" class="sg" stroke-width="3"/><line x1="200" y1="40" x2="340" y2="110" class="sg" stroke-width="3"/><line x1="340" y1="110" x2="480" y2="110" class="sg" stroke-width="3"/><text x="120" y="66" text-anchor="middle">4</text><text x="120" y="166" text-anchor="middle">1</text><text x="212" y="114">2</text><text x="282" y="66" text-anchor="middle">1</text><text x="282" y="166" text-anchor="middle">5</text><text x="410" y="102" text-anchor="middle">3</text><circle cx="60" cy="110" r="17" class="fg sg"/><text x="60" y="114" text-anchor="middle">A</text><circle cx="200" cy="40" r="17" class="fb sb"/><text x="200" y="44" text-anchor="middle">B</text><circle cx="200" cy="180" r="17" class="fb sb"/><text x="200" y="184" text-anchor="middle">C</text><circle cx="340" cy="110" r="17" class="fb sb"/><text x="340" y="114" text-anchor="middle">D</text><circle cx="480" cy="110" r="17" class="fb sb"/><text x="480" y="114" text-anchor="middle">E</text><text x="60" y="146" class="tg" text-anchor="middle">0</text><text x="226" y="44" class="tg">3</text><text x="226" y="184" class="tg">1</text><text x="340" y="146" class="tg" text-anchor="middle">4</text><text x="480" y="146" class="tg" text-anchor="middle">7</text><text x="300" y="226" text-anchor="middle" class="tb">settled in order: A 0 · C 1 · B 3 · D 4 · E 7</text></svg><figcaption>Dijkstra from Rasoi. The direct road A–B costs 4, but A → C → B costs 1 + 2 = 3, so Bakehouse ends at 3. Thick green roads form the quickest-route tree; dashed roads are never part of a best route.</figcaption></figure>
  <h3>Traced with the heap</h3>
  <table class="tbl out"><caption>Dry run from A (heap shown sorted; dist = best known minutes)</caption>
    <tr><th>pop</th><th>action</th><th>dist after</th><th>heap after</th></tr>
    <tr><td>(0, A)</td><td>B = 0+4 = 4, C = 0+1 = 1</td><td>A0 B4 C1</td><td>(1,C) (4,B)</td></tr>
    <tr><td>(1, C)</td><td>B: 1+2 = 3 &lt; 4 → 3; D = 1+5 = 6</td><td>A0 B3 C1 D6</td><td>(3,B) (4,B) (6,D)</td></tr>
    <tr><td>(3, B)</td><td>D: 3+1 = 4 &lt; 6 → 4; A, C no better</td><td>A0 B3 C1 D4</td><td>(4,B) (4,D) (6,D)</td></tr>
    <tr><td>(4, B)</td><td>stale: 4 &gt; dist[B] = 3, skip</td><td>same</td><td>(4,D) (6,D)</td></tr>
    <tr><td>(4, D)</td><td>E = 4+3 = 7</td><td>A0 B3 C1 D4 E7</td><td>(6,D) (7,E)</td></tr>
    <tr><td>(6, D)</td><td>stale, skip</td><td>same</td><td>(7,E)</td></tr>
    <tr><td>(7, E)</td><td>nothing better</td><td>final</td><td>empty</td></tr>
  </table>
<div class="fx" data-lang="py">import heapq
from collections import defaultdict

adj = defaultdict(list)                   # weighted city from section 02
for u, v, w in roads:
    adj[u].append((v, w))
    adj[v].append((u, w))

def dijkstra(src):
    dist = {src: 0}
    pq = [(0, src)]                       # heap of (minutes so far, place)
    while pq:
        d, u = heapq.heappop(pq)          # closest unsettled place
        if d &gt; dist[u]:                   # stale entry: a quicker one already won
            print(f"pop ({d},{u})  stale, skip")
            continue
        notes = []
        for v, w in adj[u]:
            nd = d + w
            if nd &lt; dist.get(v, float("inf")):
                dist[v] = nd              # relax: found a quicker way to v
                heapq.heappush(pq, (nd, v))
                notes.append(f"{v}={nd}")
        print(f"pop ({d},{u})  relax {', '.join(notes) or '-':12} heap={sorted(pq)}")
    return dist

print(dijkstra("A"))</div>
  <div class="fx" data-lang="text">pop (0,A)  relax B=4, C=1     heap=[(1, 'C'), (4, 'B')]
pop (1,C)  relax B=3, D=6     heap=[(3, 'B'), (4, 'B'), (6, 'D')]
pop (3,B)  relax D=4          heap=[(4, 'B'), (4, 'D'), (6, 'D')]
pop (4,B)  stale, skip
pop (4,D)  relax E=7          heap=[(6, 'D'), (7, 'E')]
pop (6,D)  stale, skip
pop (7,E)  relax -            heap=[]
{'A': 0, 'B': 3, 'C': 1, 'D': 4, 'E': 7}</div>
  <p>Python's heap cannot "decrease a key", so we push a new entry and leave the old one behind. The <code>if d &gt; dist[u]: continue</code> line throws those stale entries away when they surface (lazy deletion, see <a class="xref" data-note="dsa_heaps">Heaps</a>). Dhruv: 4 minutes via A–C–B–D, exactly the quickest row in section 01's hand table.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Dijkstra's algorithm</strong> computes single-source shortest paths in a graph with <strong>non-negative</strong> edge weights by repeatedly settling the unsettled node with the smallest tentative distance and relaxing its edges. With a binary heap: <strong>O((V + E) log V) time, O(V + E) space</strong> (stale entries included).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Marking a node "done" when you <em>push</em> it (BFS habit) instead of when you <em>pop</em> it. B would be fixed at 4 from the first push and the 3-minute route through C would be ignored. In Dijkstra, a distance is final only when it comes off the heap.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>743 Network Delay Time</b> (Dijkstra, answer = largest distance), <b>1631 Path With Minimum Effort</b> (cost = max step on the path), <b>1514 Path with Maximum Probability</b> (max-heap of products).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bellman-Ford.</b> Dijkstra's promise "popped = final" holds because adding a road never makes a trip shorter. Biteful pays riders a pickup bonus on some legs, so a leg's net cost can be negative, and a place already settled can get cheaper later.</div>

  <h2 id="dsa-gr-bf"><span class="num">10</span>Bellman-Ford: Negative Edges</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A rider's net cost per leg is fuel minus bonus. Leg C→B pays a bonus larger than its fuel: net −3 rupees. What is the cheapest net cost from Rasoi to each place now, and how would we even notice if some loop of legs paid money forever?</p>
  </div>
  <p>Bellman-Ford is slower than Dijkstra but simple: relax <strong>every</strong> edge, V − 1 times. A cheapest path without loops has at most V − 1 edges, and after round i every cheapest path that uses at most i edges is correct. No heap, no "final" moment, so negative edges are fine.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"negative weights / costs / cashback", "detect a negative cycle / arbitrage", "at most k stops / k edges" (stop after k rounds).</p>
  </div>
  <div class="flow"><span>dist[src] = 0, others ∞</span><span>repeat V − 1 rounds: for every edge (u, v, w): dist[v] = min(dist[v], dist[u] + w)</span><span>one more round improves something ⇒ negative cycle</span></div>
  <p>The legs (directed): A→B 4, A→C 5, C→B −3, B→D 2, listed to the algorithm in the unhelpful order B→D, C→B, A→C, A→B.</p>
  <table class="tbl out"><caption>Rounds, by hand</caption>
    <tr><th>round</th><th>B→D</th><th>C→B</th><th>A→C</th><th>A→B</th><th>A B C D after</th></tr>
    <tr><td>start</td><td colspan="4">only A known</td><td>0 ∞ ∞ ∞</td></tr>
    <tr><td>1</td><td>B ∞, skip</td><td>C ∞, skip</td><td>C = 5</td><td>B = 4</td><td>0 4 5 ∞</td></tr>
    <tr><td>2</td><td>D = 4+2 = 6</td><td>B: 5−3 = 2 &lt; 4 → 2</td><td>–</td><td>4 not &lt; 2</td><td>0 2 5 6</td></tr>
    <tr><td>3</td><td>D: 2+2 = 4 &lt; 6 → 4</td><td>–</td><td>–</td><td>–</td><td>0 2 5 4</td></tr>
  </table>
<div class="fx" data-lang="py">def bellman_ford(nodes, edges, src):
    INF = float("inf")
    dist = {u: INF for u in nodes}
    dist[src] = 0
    for rnd in range(1, len(nodes)):           # a shortest path has at most V-1 edges
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w &lt; dist[v]:
                dist[v] = dist[u] + w          # relax every edge, every round
                changed = True
        print(f"round {rnd}: {dist}")
        if not changed:
            break                              # nothing improved: done early
    for u, v, w in edges:                      # one extra check: still improving?
        if dist[u] != INF and dist[u] + w &lt; dist[v]:
            return None                        # negative cycle
    return dist

# rider's net cost in rupees = fuel minus pickup bonus; C-&gt;B carries a bonus: net -3
legs = [("B", "D", 2), ("C", "B", -3), ("A", "C", 5), ("A", "B", 4)]   # edges in any order
print(bellman_ford("ABCD", legs, "A"))
print(bellman_ford("ABC", [("A", "B", 1), ("B", "C", -2), ("C", "B", 1)], "A"))</div>
  <div class="fx" data-lang="text">round 1: {'A': 0, 'B': 4, 'C': 5, 'D': inf}
round 2: {'A': 0, 'B': 2, 'C': 5, 'D': 6}
round 3: {'A': 0, 'B': 2, 'C': 5, 'D': 4}
{'A': 0, 'B': 2, 'C': 5, 'D': 4}
round 1: {'A': 0, 'B': 0, 'C': -1}
round 2: {'A': 0, 'B': -1, 'C': -2}
None</div>
  <p>Second graph: the loop B → C → B costs −2 + 1 = −1, so costs fall forever; the extra check after V − 1 rounds still finds an improvement and returns None. Now compare a Dijkstra that settles each place the first time it is popped, on the same legs:</p>
<div class="fx" data-lang="py">import heapq
from collections import defaultdict

def dijkstra_settle_once(edges, src):      # finalises a node the first time it is popped
    adj = defaultdict(list)
    for u, v, w in edges:
        adj[u].append((v, w))
    done, pq = {}, [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if u in done:
            continue
        done[u] = d
        for v, w in adj[u]:
            if v not in done:
                heapq.heappush(pq, (d + w, v))
    return done

legs = [("B", "D", 2), ("C", "B", -3), ("A", "C", 5), ("A", "B", 4)]
print(dijkstra_settle_once(legs, "A"))</div>
  <div class="fx" data-lang="text">{'A': 0, 'B': 4, 'C': 5, 'D': 6}</div>
  <p>It pops B at 4 (before C at 5), declares B final, and later never accepts 5 − 3 = 2. D inherits the mistake: 6 instead of 4. One negative edge is enough to break "popped = final".</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Use</th><th>Time</th></tr>
    <tr><td>All edges cost the same</td><td>BFS</td><td>O(V + E)</td></tr>
    <tr><td>Edge costs 0 or 1 only</td><td>0-1 BFS (deque: cost 0 → appendleft, cost 1 → append)</td><td>O(V + E)</td></tr>
    <tr><td>Non-negative weights</td><td><strong>Dijkstra</strong></td><td>O((V + E) log V)</td></tr>
    <tr><td>Negative edges, or "at most k edges"</td><td><strong>Bellman-Ford</strong></td><td>O(V · E)</td></tr>
    <tr><td>DAG with any weights</td><td>Topological order, then relax in that order</td><td>O(V + E)</td></tr>
    <tr><td>All pairs, small V (≤ ~400)</td><td>Floyd-Warshall (triple loop over a matrix)</td><td>O(V³)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bellman-Ford</strong> relaxes all E edges V − 1 times; after round i, dist[v] ≤ the cheapest cost of any path to v with at most i edges. If a V-th round still improves a distance, a <strong>negative cycle</strong> is reachable. <strong>O(V · E) time, O(V) space.</strong> It is dynamic programming over "number of edges used", the idea the <a class="xref" data-note="dsa_dp">DP note</a> builds on.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>For "at most k stops", updating <code>dist</code> in place lets one round chain two edges and break the limit. Copy the array at the start of each round and read from the copy (Cheapest Flights, section 15). For plain Bellman-Ford in-place updates are fine; they only converge faster.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>787 Cheapest Flights Within K Stops</b> (k + 1 rounds with a copy), <b>1334 Find the City With the Smallest Number of Neighbors at a Threshold Distance</b> (all-pairs: Floyd-Warshall or V × Dijkstra).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Minimum Spanning Tree.</b> Shortest paths answer "quickest from Rasoi to each place". Biteful now asks a network question with no starting point: build bike lanes on some roads so every place is connected, using as few kilometres as possible.</div>

  <h2 id="dsa-gr-mst"><span class="num">11</span>Minimum Spanning Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which roads should get bike lanes so every place in the main area is connected to every other, with the least total kilometres? A loop of lanes is wasted (drop any one lane of the loop and everyone is still connected), so the answer is a tree, but which tree?</p>
  </div>
  <p>You need exactly V − 1 lanes (one more makes a wasted loop) with the smallest total. That set is the <strong>Minimum Spanning Tree</strong> (MST). It minimises total length, not the distance from one source, so it is not Dijkstra's tree.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"connect all points / cities with minimum total cost", "minimum cable / wire / road to connect everyone", "cheapest network".</p>
  </div>
  <div class="cards">
    <div><b>Kruskal</b><p>Sort all edges cheapest first. Take an edge if it joins two different groups (Union-Find says so); skip it if both ends are already connected.</p><small>O(E log E) · edge list + DSU</small></div>
    <div><b>Prim</b><p>Start from any node. Repeatedly take the cheapest edge leaving the current tree (heap), adding its new node.</p><small>O(E log V) · adjacency list + heap</small></div>
  </div>
  <div class="flow"><span>sort roads by length</span><span>for each: find(u) ≠ find(v)?</span><span>yes → take it, union</span><span>no → skip (would close a loop)</span><span>stop at V − 1 edges</span></div>
  <table class="tbl out"><caption>Kruskal on the main area (lengths as km)</caption>
    <tr><th>road (sorted)</th><th>groups before</th><th>take?</th><th>total</th></tr>
    <tr><td>A–C 1</td><td>{A} {B} {C} {D} {E}</td><td>yes</td><td>1</td></tr>
    <tr><td>B–D 1</td><td>{A,C} {B} {D} {E}</td><td>yes</td><td>2</td></tr>
    <tr><td>B–C 2</td><td>{A,C} {B,D} {E}</td><td>yes</td><td>4</td></tr>
    <tr><td>D–E 3</td><td>{A,B,C,D} {E}</td><td>yes</td><td>7</td></tr>
    <tr><td>A–B 4</td><td>{A,B,C,D,E}</td><td>no, loop</td><td>7</td></tr>
    <tr><td>C–D 5</td><td>{A,B,C,D,E}</td><td>no, loop</td><td>7</td></tr>
  </table>
<div class="fx" data-lang="py">roads = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2), ("B", "D", 1), ("C", "D", 5), ("D", "E", 3)]

def kruskal(nodes, edges):
    parent = {x: x for x in nodes}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]               # path halving
            x = parent[x]
        return x
    total, used = 0, []
    for u, v, w in sorted(edges, key=lambda e: e[2]):   # cheapest road first
        ru, rv = find(u), find(v)
        if ru != rv:                                    # joins two different groups: take it
            parent[ru] = rv
            total += w
            used.append((u, v, w))
            print(f"{u}-{v} {w}: take   total={total}")
        else:
            print(f"{u}-{v} {w}: skip   ({u} and {v} already joined -&gt; would make a loop)")
    return total, used

total, used = kruskal("ABCDE", roads)
print("bike lanes:", used, "| km:", total, "| lanes:", len(used), "= V-1 =", len("ABCDE") - 1)</div>
  <div class="fx" data-lang="text">A-C 1: take   total=1
B-D 1: take   total=2
B-C 2: take   total=4
D-E 3: take   total=7
A-B 4: skip   (A and B already joined -&gt; would make a loop)
C-D 5: skip   (C and D already joined -&gt; would make a loop)
bike lanes: [('A', 'C', 1), ('B', 'D', 1), ('B', 'C', 2), ('D', 'E', 3)] | km: 7 | lanes: 4 = V-1 = 4</div>
  <p>Prim from A grows one tree outward and reaches the same total:</p>
<div class="fx" data-lang="py">import heapq
from collections import defaultdict
roads = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2), ("B", "D", 1), ("C", "D", 5), ("D", "E", 3)]

def prim(nodes, edges, start):
    adj = defaultdict(list)
    for u, v, w in edges:
        adj[u].append((w, v))
        adj[v].append((w, u))
    seen, total, pq = set(), 0, [(0, start)]
    while pq and len(seen) &lt; len(nodes):
        w, u = heapq.heappop(pq)      # cheapest road leaving the tree (NOT dist + w)
        if u in seen:
            continue
        seen.add(u)
        total += w
        for e in adj[u]:
            if e[1] not in seen:
                heapq.heappush(pq, e)
    return total

print(prim("ABCDE", roads, "A"))</div>
  <div class="fx" data-lang="text">7</div>
  <p>The lanes A–C, C–B, B–D, D–E are exactly the "tree" road set from section 01. Compare with Dijkstra's tree: also A–C, C–B, B–D, D–E here, but that is a coincidence of this map; in general the MST minimises the sum of all edges, Dijkstra minimises each place's distance from one source. F–G sits across the creek: the whole city has no spanning tree, only a spanning <em>forest</em>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>spanning tree</strong> of a connected undirected graph is a subset of V − 1 edges that connects all V nodes with no cycle. A <strong>minimum spanning tree</strong> has the least total weight. Kruskal: <strong>O(E log E)</strong>; Prim with a heap: <strong>O(E log V)</strong>. Both are greedy and both are correct because the cheapest edge crossing any split of the nodes is always safe to take.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>MST is for <strong>undirected</strong> graphs. If the graph is disconnected there is no spanning tree (Kruskal returns fewer than V − 1 edges; check that). And Prim's heap is keyed on the single edge weight <code>w</code>, not on <code>dist + w</code> as in Dijkstra. Mixing the two up is the classic bug.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>1584 Min Cost to Connect All Points</b> (Prim on a complete graph), <b>778 Swim in Rising Water</b> (Kruskal-style: add cells by height until corners join), <b>1489 Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree</b> (hard).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bipartite Check.</b> One structural question remains. In the "who delivers to whom" graph, every edge should join a restaurant to a customer, never two restaurants or two customers. Given only the edges, can we split the nodes into two such sides?</div>

  <h2 id="dsa-gr-bip"><span class="num">12</span>Bipartite Check</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can the places be split into two sides so that every edge crosses from one side to the other? For the orders graph (A and B deliver to D, E, F) the answer should be "restaurants vs customers". For the road graph, is there any such split at all?</p>
  </div>
  <p>Idea: put the first node on side 0. Everything joined to it must be on side 1. Everything joined to <em>those</em> must be on side 0, and so on, with BFS. If an edge ever has both ends on the same side, no split exists.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school picnic: split the students into two buses so that no two students who fight are on the same bus. Each "fights with" pair is an edge.</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"split into two groups", "two teams", "no two adjacent have the same colour", "possible bipartition", "is graph bipartite", matching two kinds of things.</p>
  </div>
  <div class="flow"><span>colour[start] = 0</span><span>BFS: uncoloured neighbour gets 1 − colour[u]</span><span>neighbour with the same colour → NOT bipartite</span><span>restart from every uncoloured node</span></div>
  <table class="tbl out"><caption>Two graphs, traced</caption>
    <tr><th>graph</th><th>colouring by BFS</th><th>verdict</th></tr>
    <tr><td>orders: A–D, A–E, B–D, B–F</td><td>A 0 → D 1, E 1 → (from D) B 0 → F 1</td><td>bipartite: {A, B} | {D, E, F}</td></tr>
    <tr><td>roads: A–B, A–C, B–C, B–D, C–D, D–E</td><td>A 0 → B 1, C 1 → edge B–C joins 1 and 1</td><td>not bipartite (triangle A–B–C)</td></tr>
  </table>
<div class="fx" data-lang="py">from collections import deque, defaultdict

def is_bipartite(nodes, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    color = {}
    for s in nodes:                          # the graph may be in pieces
        if s in color:
            continue
        color[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if v not in color:
                    color[v] = 1 - color[u]  # opposite side
                    q.append(v)
                elif color[v] == color[u]:
                    print(f"  {u}-{v}: both on side {color[u]}")
                    return False
    print("  sides:", color)
    return True

# who-delivers-to-whom: restaurant A, B  &lt;-&gt;  customers D, E, F
orders = [("A", "D"), ("A", "E"), ("B", "D"), ("B", "F")]
print("orders graph:", is_bipartite("ABDEF", orders))
city = [("A", "B"), ("A", "C"), ("B", "C"), ("B", "D"), ("C", "D"), ("D", "E")]
print("road graph:", is_bipartite("ABCDE", city))</div>
  <div class="fx" data-lang="text">  sides: {'A': 0, 'D': 1, 'E': 1, 'B': 0, 'F': 1}
orders graph: True
  B-C: both on side 1
road graph: False</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A graph is bipartite exactly when it has <strong>no odd-length cycle</strong>. A square (4-cycle) alternates 0, 1, 0, 1 fine. A triangle forces its third node to be both 0 and 1, and the city has the triangle A–B–C.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A graph is <strong>bipartite</strong> if its nodes split into two sets with every edge between the sets. Checked by BFS/DFS 2-colouring, restarted for each component: <strong>O(V + E)</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running the colouring from node 0 only. If the graph has several components, an uncoloured component is never checked and an odd cycle hiding there is missed. Loop over every node as a possible start, as the code does.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Graphs: <b>785 Is Graph Bipartite</b>, <b>886 Possible Bipartition</b> (build the graph from dislikes first), <b>1042 Flower Planting With No Adjacent</b> (4 colours, greedy).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Python Toolkit.</b> We have every algorithm. Python has no graph type, so each one was assembled from the same few standard-library parts. Which parts, and which of them hide traps?</div>

  <h2 id="dsa-gr-lib"><span class="num">13</span>The Python Toolkit</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Twelve sections used <code>defaultdict</code>, <code>deque</code>, <code>heapq</code> and sets. Is there anything ready-made, and what quietly goes wrong with the parts we used?</p>
  </div>
  <p>There is no graph type in the standard library, and interviews expect you to build it from basic parts. Adjacency list: <code>defaultdict(list)</code> or <code>[[] for _ in range(n)]</code>. Visited: <code>set()</code> or <code>[False] * n</code>. BFS queue: <code>deque</code>. DFS stack: a plain list. Dijkstra and Prim: <code>heapq</code>. Topological sort: <code>graphlib</code> (Python 3.9+).</p>
<div class="fx" data-lang="py">from collections import defaultdict
from graphlib import TopologicalSorter, CycleError

adj = defaultdict(list)          # missing key -&gt; empty list, no KeyError
adj["A"].append("B")
print(adj["Z"], len(adj))        # careful: just reading created key "Z"

# graphlib (Python 3.9+): give each step its PREREQUISITES
ts = TopologicalSorter({"assign rider": ["accept"], "cook": ["accept"], "pack": ["cook"],
                        "hand over": ["assign rider", "pack"]})
print(list(ts.static_order()))

try:
    list(TopologicalSorter({"a": ["b"], "b": ["a"]}).static_order())
except CycleError as e:
    print("CycleError:", e.args[1])</div>
  <div class="fx" data-lang="text">[] 2
['accept', 'assign rider', 'cook', 'pack', 'hand over']
CycleError: ['a', 'b', 'a']</div>
  <p>Reading <code>adj["Z"]</code> from a <code>defaultdict</code> silently added Z, so <code>len(adj)</code> became 2; use <code>adj.get(u, [])</code> when you only want to look. <code>graphlib</code> takes each node's <em>prerequisites</em>, the opposite direction from an adjacency list, and it produced the pipeline order accept → assign rider → cook → pack → hand over. <code>networkx</code> has everything ready-made, but interviews want you to write it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>graphlib.TopologicalSorter(graph)</code> takes a dict node → iterable of predecessors; <code>static_order()</code> yields a topological order or raises <code>CycleError</code> whose <code>args[1]</code> lists a cycle.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>visited = []</code> instead of <code>set()</code> makes every "seen?" check O(V), turning an O(V + E) walk into O(V²). Same bug as in Hashing, and just as invisible on small tests.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing the Pattern.</b> Knowing twelve tools is not the same as knowing which one a problem wants. Problems rarely say "graph"; they say "islands", "prerequisites", "minimum moves".</div>

  <h2 id="dsa-gr-patterns"><span class="num">14</span>Choosing the Pattern</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given a fresh problem statement, which of the tools do we reach for? We need a mapping from the words in the problem to the algorithm.</p>
  </div>
  <p>Most graph questions do not say "graph". Learn to hear the signal words, then ask the two questions in the flow below.</p>
  <div class="flow"><span>What is a node? What is an edge?</span><span>Directed? Weighted? Negative?</span><span>Reach / count / order / group / cheapest / connect-all / two sides?</span><span>→ the template</span></div>
  <table class="tbl">
    <tr><th>Signal words</th><th>Reach for</th><th>Section</th><th>Example</th></tr>
    <tr><td>"islands", "regions", "flood fill", "connected", "provinces"</td><td>DFS/BFS from every unvisited node, count starts</td><td>03, 05</td><td>Number of Islands, Max Area of Island</td></tr>
    <tr><td>"minimum steps / moves / transformations", unweighted</td><td>BFS with levels</td><td>04</td><td>Word Ladder, Open the Lock, Snakes and Ladders</td></tr>
    <tr><td>"spreads", "all at once", "nearest X from every cell"</td><td>Multi-source BFS</td><td>05</td><td>Rotting Oranges, 01 Matrix, As Far from Land as Possible</td></tr>
    <tr><td>"is there a cycle", "safe states", "valid tree"</td><td>Parent check / three colours</td><td>06</td><td>Find Eventual Safe States, Detect Cycles in 2D Grid</td></tr>
    <tr><td>"prerequisites", "order of tasks", "dependencies", "build order"</td><td>Topological sort (Kahn)</td><td>07</td><td>Course Schedule, Find All Possible Recipes</td></tr>
    <tr><td>"edges added one by one", "are they connected", "merge groups"</td><td>Union-Find</td><td>08</td><td>Redundant Connection, Accounts Merge</td></tr>
    <tr><td>"cheapest / fastest / minimum cost", weights ≥ 0</td><td>Dijkstra</td><td>09</td><td>Network Delay Time, Path With Minimum Effort</td></tr>
    <tr><td>"at most k stops / edges", negative costs</td><td>Bellman-Ford (k rounds)</td><td>10</td><td>Cheapest Flights Within K Stops</td></tr>
    <tr><td>"connect all with minimum total cost"</td><td>MST (Kruskal / Prim)</td><td>11</td><td>Min Cost to Connect All Points</td></tr>
    <tr><td>"split into two groups", "no two adjacent same"</td><td>Bipartite 2-colouring</td><td>12</td><td>Is Graph Bipartite, Possible Bipartition</td></tr>
    <tr><td>"use every edge exactly once", "itinerary"</td><td>Eulerian path (Hierholzer: DFS, add node on the way back)</td><td>advanced</td><td>Reconstruct Itinerary, Cracking the Safe</td></tr>
    <tr><td>"critical connection", "which edge disconnects"</td><td>Bridges (Tarjan low-link, a DFS with timestamps)</td><td>advanced</td><td>Critical Connections in a Network</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The hardest step is usually naming the nodes. In Word Ladder the nodes are words and an edge is "differs by one letter". In Open the Lock the nodes are 4-digit codes. In a grid the nodes are cells. Once you can say "node = …, edge = …", the algorithm is a template.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for Dijkstra whenever you see "shortest". If every step costs the same, BFS is simpler and O(V + E); Dijkstra's heap only adds a log factor and bugs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> Templates are clean; interview problems add their own edge cases (empty grid, no route, a cycle in prerequisites) and input formats. Eight classics, solved and tested.</div>

  <h2 id="dsa-gr-problems"><span class="num">15</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Do the templates survive real problem statements, with LeetCode's input formats and edge cases? Each problem below names its pattern, then solves it.</p>
  </div>

  <h3>1. Number of Islands (LeetCode 200) · grid DFS/BFS</h3>
  <p>A grid of <code>"1"</code> (land) and <code>"0"</code> (water). Count the islands, where land connects up/down/left/right. That is section 05's neighbourhood count: each unvisited land cell starts a new island, and a BFS marks all of it.</p>
<div class="fx" data-lang="py">from collections import deque

def num_islands(grid):
    if not grid:
        return 0
    R, C = len(grid), len(grid[0])
    seen = set()

    def sink(r, c):  # BFS over one island
        q = deque([(r, c)])
        seen.add((r, c))
        while q:
            r, c = q.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if (0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C and grid[nr][nc] == "1"
                        and (nr, nc) not in seen):
                    seen.add((nr, nc))
                    q.append((nr, nc))

    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1" and (r, c) not in seen:
                count += 1  # new island found
                sink(r, c)
    return count

g1 = ["11000",
      "11000",
      "00100",
      "00011"]
g2 = ["111", "010", "111"]
for g in [g1, g2, ["0"], ["1"], []]:
    print(g, "-&gt;", num_islands(g))</div>
  <div class="fx" data-lang="text">['11000', '11000', '00100', '00011'] -&gt; 3
['111', '010', '111'] -&gt; 1
['0'] -&gt; 0
['1'] -&gt; 1
[] -&gt; 0</div>
  <p>Time O(R × C): each cell is visited once. Space O(R × C) for the seen set (or O(1) extra if you are allowed to overwrite land with <code>"0"</code>). BFS avoids the recursion-depth crash on a huge all-land grid.</p>

  <h3>2. Clone Graph (LeetCode 133) · DFS with a dict</h3>
  <p>Given one node of a connected undirected graph, return a deep copy: new node objects, same shape. The danger is cycles: node 1 → 2 → 1 would copy forever. The fix is a dict <code>original → copy</code>, which is both the visited set and the way to find an existing copy.</p>
<div class="fx" data-lang="py">class Node:
    def __init__(self, val, neighbors=None):
        self.val = val
        self.neighbors = neighbors or []

def clone_graph(node):
    if node is None:
        return None
    copies = {}  # original node -&gt; its copy

    def dfs(u):
        if u in copies:  # already copied: reuse (stops loops)
            return copies[u]
        c = Node(u.val)
        copies[u] = c    # register BEFORE visiting neighbours
        for v in u.neighbors:
            c.neighbors.append(dfs(v))
        return c

    return dfs(node)

for case in [[[2, 4], [1, 3], [2, 4], [1, 3]], [[]]]:
    orig = build(case)
    copy = clone_graph(orig)
    print(case, "-&gt;", to_adj(copy), "| new object:", copy is not orig)
print(clone_graph(None))</div>
  <div class="fx" data-lang="text">[[2, 4], [1, 3], [2, 4], [1, 3]] -&gt; [[2, 4], [1, 3], [2, 4], [1, 3]] | new object: True
[[]] -&gt; [[]] | new object: True
None</div>
  <p><code>build</code> and <code>to_adj</code> (not shown) turn the LeetCode adjacency format into nodes and back. The key line is <code>copies[u] = c</code> <strong>before</strong> the loop: when the walk comes back to u through a cycle, it finds the copy instead of making a second one. Time O(V + E), space O(V).</p>

  <h3>3. Rotting Oranges (LeetCode 994) · multi-source BFS</h3>
  <p>Grid: 0 empty, 1 fresh, 2 rotten. Every minute, rotten oranges rot their 4 neighbours. Return the minutes until no fresh orange remains, or −1 if some can never rot. All rotten oranges spread at the same time: multi-source BFS, where each layer of the queue is one minute.</p>
  <table class="tbl out"><caption>Dry run on [[2,1,1],[1,1,0],[0,1,1]]</caption>
    <tr><th>minute</th><th>newly rotten</th><th>fresh left</th></tr>
    <tr><td>0</td><td>(0,0) is the start</td><td>6</td></tr>
    <tr><td>1</td><td>(0,1), (1,0)</td><td>4</td></tr>
    <tr><td>2</td><td>(0,2), (1,1)</td><td>2</td></tr>
    <tr><td>3</td><td>(2,1)</td><td>1</td></tr>
    <tr><td>4</td><td>(2,2)</td><td>0 → answer 4</td></tr>
  </table>
<div class="fx" data-lang="py">from collections import deque

def oranges_rotting(grid):
    R, C = len(grid), len(grid[0])
    q, fresh = deque(), 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 2:
                q.append((r, c))      # all rotten oranges start together
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):       # one full layer = one minute
            r, c = q.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C and grid[nr][nc] == 1:
                    grid[nr][nc] = 2  # rot it now so nobody counts it twice
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1

for g in [[[2, 1, 1], [1, 1, 0], [0, 1, 1]],
          [[2, 1, 1], [0, 1, 1], [1, 0, 1]],
          [[0, 2]],
          [[1]]]:
    print(g, "-&gt;", oranges_rotting([row[:] for row in g]))</div>
  <div class="fx" data-lang="text">[[2, 1, 1], [1, 1, 0], [0, 1, 1]] -&gt; 4
[[2, 1, 1], [0, 1, 1], [1, 0, 1]] -&gt; -1
[[0, 2]] -&gt; 0
[[1]] -&gt; -1</div>
  <p>The <code>for _ in range(len(q))</code> loop processes one layer, so <code>minutes</code> counts layers; <code>while q and fresh</code> avoids an extra empty minute at the end. No fresh oranges → 0; a walled-off fresh orange → −1. Time and space O(R × C).</p>

  <h3>4. Course Schedule I and II (LeetCode 207, 210) · Kahn</h3>
  <p><code>numCourses</code> courses, pairs <code>[a, b]</code> meaning "take b before a". I: can you finish all? II: return one valid order (or <code>[]</code>). Both are Kahn's algorithm; a prerequisite cycle leaves courses stuck above in-degree 0.</p>
<div class="fx" data-lang="py">from collections import deque

def find_order(numCourses, prerequisites):
    adj = [[] for _ in range(numCourses)]
    indeg = [0] * numCourses
    for course, pre in prerequisites:  # [a, b] means b before a
        adj[pre].append(course)
        indeg[course] += 1
    q = deque(c for c in range(numCourses) if indeg[c] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == numCourses else []

def can_finish(numCourses, prerequisites):
    return len(find_order(numCourses, prerequisites)) == numCourses

for n, pre in [(2, [[1, 0]]), (2, [[1, 0], [0, 1]]),
               (4, [[1, 0], [2, 0], [3, 1], [3, 2]]), (1, [])]:
    print(n, pre, "-&gt;", can_finish(n, pre), find_order(n, pre))</div>
  <div class="fx" data-lang="text">2 [[1, 0]] -&gt; True [0, 1]
2 [[1, 0], [0, 1]] -&gt; False []
4 [[1, 0], [2, 0], [3, 1], [3, 2]] -&gt; True [0, 1, 2, 3]
1 [] -&gt; True [0]</div>
  <p>Time O(V + E), space O(V + E). The 3-colour DFS also works for I. In the interview, state the edge direction (<code>b → a</code>) before writing any code.</p>

  <h3>5. Redundant Connection (LeetCode 684) &amp; counting components · Union-Find</h3>
  <p><strong>Redundant Connection</strong>: a tree on nodes 1..n plus one extra edge. Return the edge that, when removed, leaves a tree (the last such edge in the input). Feed edges into Union-Find one by one; the first edge whose two ends already share a head is the one that closes the loop, exactly the A–B road in section 08. <strong>Counting components</strong> (the idea behind Number of Provinces and Number of Operations to Make Network Connected): start with n groups and subtract one for every union that actually merges two groups.</p>
<div class="fx" data-lang="py">def find_redundant_connection(edges):
    parent = list(range(len(edges) + 1))  # nodes are 1..n
    rank = [0] * (len(edges) + 1)

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]  # already connected: this edge makes the loop
        if rank[ru] &lt; rank[rv]:
            ru, rv = rv, ru
        parent[rv] = ru
        if rank[ru] == rank[rv]:
            rank[ru] += 1
    return []

def count_components(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path halving (no recursion)
            x = parent[x]
        return x

    groups = n
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            groups -= 1  # two groups became one
    return groups

print(find_redundant_connection([[1, 2], [1, 3], [2, 3]]))
print(find_redundant_connection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]))
print(count_components(5, [[0, 1], [1, 2], [3, 4]]))
print(count_components(5, [[0, 1], [1, 2], [2, 3], [3, 4]]))
print(count_components(3, []))</div>
  <div class="fx" data-lang="text">[2, 3]
[1, 4]
2
1
3</div>
  <p>Both run in O(E · α(n)) ≈ O(E), space O(n). Components could also be counted with DFS (section 03); Union-Find shines when edges stream in and you need the answer after each one.</p>

  <h3>6. Network Delay Time (LeetCode 743) · Dijkstra</h3>
  <p>n computers, directed <code>times[i] = [u, v, w]</code>: a signal from u reaches v after w ms. Send from k. How long until every computer has it? That is the quickest time to the <em>farthest</em> node: Dijkstra from k, answer = max distance, or −1 if some node is unreachable.</p>
<div class="fx" data-lang="py">import heapq
from collections import defaultdict

def network_delay_time(times, n, k):
    adj = defaultdict(list)
    for u, v, w in times:  # directed: u sends to v in w ms
        adj[u].append((v, w))
    dist = {}              # final, settled times
    pq = [(0, k)]
    while pq:
        d, u = heapq.heappop(pq)
        if u in dist:      # already settled with a smaller d
            continue
        dist[u] = d
        for v, w in adj[u]:
            if v not in dist:
                heapq.heappush(pq, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1

print(network_delay_time([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))
print(network_delay_time([[1, 2, 1]], 2, 1))
print(network_delay_time([[1, 2, 1]], 2, 2))
print(network_delay_time([[1, 2, 5], [1, 3, 1], [3, 2, 1]], 3, 1))</div>
  <div class="fx" data-lang="text">2
1
-1
2</div>
  <p>This version uses a "settled" dict: a node's distance is written the first time it is popped, and later pops of it are skipped. Same idea as the stale check, slightly shorter. In the last case, 1 → 3 → 2 (1 + 1 = 2) beats the direct 1 → 2 (5), just like A–C–B beating A–B. Time O(E log E), space O(V + E).</p>

  <h3>7. Word Ladder (LeetCode 127) · BFS on an implicit graph</h3>
  <p>Change <code>"hit"</code> into <code>"cog"</code> one letter at a time, every middle word in the dictionary. Return the number of words in the shortest chain (0 if impossible). Nodes = words, edge = differ in one letter, "shortest" with equal steps = BFS.</p>
  <p>Finding neighbours is the real problem. Comparing every pair of words is O(N² · L). Instead, put each word into "wildcard buckets": <code>hot</code> goes into <code>*ot</code>, <code>h*t</code>, <code>ho*</code>. Words in the same bucket are neighbours.</p>
<div class="fx" data-lang="py">from collections import deque, defaultdict

def ladder_length(beginWord, endWord, wordList):
    words = set(wordList)
    if endWord not in words:
        return 0
    L = len(beginWord)
    buckets = defaultdict(list)  # "h*t" -&gt; ["hot", "hit", ...]
    for w in words | {beginWord}:
        for i in range(L):
            buckets[w[:i] + "*" + w[i+1:]].append(w)
    q = deque([(beginWord, 1)])
    seen = {beginWord}
    while q:
        w, steps = q.popleft()
        if w == endWord:
            return steps
        for i in range(L):
            key = w[:i] + "*" + w[i+1:]
            for nxt in buckets[key]:
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, steps + 1))
            buckets[key] = []    # this bucket is fully used; never scan again
    return 0

words = ["hot", "dot", "dog", "lot", "log", "cog"]
print(ladder_length("hit", "cog", words))
print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log"]))
print(ladder_length("a", "c", ["a", "b", "c"]))</div>
  <div class="fx" data-lang="text">5
0
2</div>
  <p>hit → hot → dot → dog → cog = 5 words. Emptying a used bucket is safe: all its words are already queued at this level. Time O(N · L²), space O(N · L²). Bonus: bidirectional BFS from both ends searches far less.</p>

  <h3>8. Cheapest Flights Within K Stops (LeetCode 787) · k-round Bellman-Ford</h3>
  <p>n cities, flights <code>[from, to, price]</code>. Cheapest price from src to dst using <strong>at most k stops</strong> (k + 1 flights), or −1. Plain Dijkstra keeps only the cheapest way into each city, which may use too many stops. Bellman-Ford fits: after round i, <code>cost</code> holds the cheapest price using at most i flights. Run exactly k + 1 rounds.</p>
  <table class="tbl out"><caption>Dry run, k = 1: cost of cities 0..3 after each round</caption>
    <tr><th>round</th><th>cost</th><th>meaning</th></tr>
    <tr><td>start</td><td>[0, ∞, ∞, ∞]</td><td>only src</td></tr>
    <tr><td>1</td><td>[0, 100, 500, ∞]</td><td>best with ≤ 1 flight</td></tr>
    <tr><td>2</td><td>[0, 100, 200, 600]</td><td>best with ≤ 2 flights → answer 600</td></tr>
  </table>
<div class="fx" data-lang="py">def find_cheapest_price(n, flights, src, dst, k):
    INF = float("inf")
    cost = [INF] * n
    cost[src] = 0
    for _ in range(k + 1):  # k stops = at most k+1 flights
        new = cost[:]       # read old round, write new round
        for u, v, p in flights:
            if cost[u] != INF and cost[u] + p &lt; new[v]:
                new[v] = cost[u] + p
        cost = new
    return -1 if cost[dst] == INF else cost[dst]

flights = [[0, 1, 100], [1, 2, 100], [2, 3, 100], [0, 2, 500], [1, 3, 600]]
print(find_cheapest_price(4, flights, 0, 3, 1))
print(find_cheapest_price(4, flights, 0, 3, 2))
print(find_cheapest_price(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0))
print(find_cheapest_price(3, [[0, 1, 100]], 0, 2, 5))</div>
  <div class="fx" data-lang="text">600
300
500
-1</div>
  <p>The copy <code>new = cost[:]</code> is the whole trick. Without it, one round could chain two flights (0 → 1 then 1 → 2 in the same pass) and break the stop limit. With k = 2 the route 0 → 1 → 2 → 3 for 300 becomes allowed. Time O(k · E), space O(n).</p>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Most wrong answers in graph problems come from the same handful of slips, regardless of the algorithm. Collect them in one place.</div>

  <h2 id="dsa-gr-traps"><span class="num">16</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which bugs recur across DFS, BFS, Dijkstra and the rest, and what is the one-line rule that prevents each?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no visited set, or marking too late</span>
    <p>Without a visited set, the A–B–C loop runs forever. Marking at pop time instead of push time in BFS lets the same node enter the queue many times. Rule: mark when you add to the queue/stack (or as the first line of recursive DFS). Exception: Dijkstra finalises at pop time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: one-way edge for an undirected graph</span>
    <p>Building <code>adj[u].append(v)</code> but forgetting <code>adj[v].append(u)</code> silently makes half the graph unreachable. Read the problem: "bidirectional", "undirected", "friends" all mean both ways.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting isolated nodes and other components</span>
    <p>Nodes with no edges never appear in the edge list, so a <code>defaultdict</code> built from edges does not contain them. Loop over <code>range(n)</code> (or the full node list), not over <code>adj</code>, when counting components or doing topological sort. Farah and Gopal only show up because we looped over "ABCDEFG".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the wrong shortest-path tool</span>
    <p>BFS on weighted roads (says A–B–D, 5 minutes, instead of A–C–B–D, 4). Dijkstra with a negative edge (says D = 6 instead of 4). Edge-count limit with an in-place Bellman-Ford. Match the tool to the weights.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong edge direction</span>
    <p>"[a, b] means b before a": the arrow goes b → a. Write the direction as a comment on the line that builds the adjacency list.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Twelve tools, each answering one question. How is each built from the one before, and what did each compute on Biteful's city?</div>

  <h2 id="dsa-gr-connect"><span class="num">17</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We met the tools one by one. Seen together: which ones are the same walk with a different container, which reuse another tool inside, and what was each one's answer on the city?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 330" width="660">
<defs><marker id="dsa-gr-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="44" rx="7" class="fr sr"/><text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">city has loops</text><text x="110" y="45" text-anchor="middle" class="tm" font-size="10">5 places, 6 roads, 4 routes A→D</text>
<line x1="210" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">adjacency list</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">D → B1 C5 E3</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">walk + visited set</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">container decides the order</text>
<line x1="500" y1="54" x2="110" y2="88" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<line x1="540" y1="54" x2="330" y2="88" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<line x1="580" y1="54" x2="555" y2="88" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<rect x="10" y="90" width="200" height="44" rx="7" class="ft st"/><text x="110" y="109" text-anchor="middle" font-size="11.5" font-weight="700">stack → DFS</text><text x="110" y="125" text-anchor="middle" class="tm" font-size="10">reach: A B C D E · {F,G}</text>
<rect x="240" y="90" width="180" height="44" rx="7" class="ft st"/><text x="330" y="109" text-anchor="middle" font-size="11.5" font-weight="700">queue → BFS</text><text x="330" y="125" text-anchor="middle" class="tm" font-size="10">fewest roads: E = 3</text>
<rect x="460" y="90" width="190" height="44" rx="7" class="ft st"/><text x="555" y="109" text-anchor="middle" font-size="11.5" font-weight="700">heap → Dijkstra</text><text x="555" y="125" text-anchor="middle" class="tm" font-size="10">least minutes: E = 7</text>
<line x1="110" y1="134" x2="110" y2="168" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<line x1="330" y1="134" x2="330" y2="168" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<line x1="555" y1="134" x2="555" y2="168" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<rect x="10" y="170" width="200" height="50" rx="7" class="fg sg"/><text x="110" y="190" text-anchor="middle" font-size="11" font-weight="700">cycle (colours) · topo DFS</text><text x="110" y="207" text-anchor="middle" class="tm" font-size="10">C sees A · E→C closes a loop</text>
<rect x="240" y="170" width="180" height="50" rx="7" class="fg sg"/><text x="330" y="190" text-anchor="middle" font-size="11" font-weight="700">grids · Kahn · bipartite</text><text x="330" y="207" text-anchor="middle" class="tm" font-size="10">3 islands · pipeline · A–B–C odd</text>
<rect x="460" y="170" width="190" height="50" rx="7" class="fg sg"/><text x="555" y="190" text-anchor="middle" font-size="11" font-weight="700">Bellman-Ford</text><text x="555" y="207" text-anchor="middle" class="tm" font-size="10">negative leg: B = 2 not 4</text>
<rect x="120" y="256" width="200" height="50" rx="7" class="fv"/><text x="220" y="276" text-anchor="middle" font-size="11" font-weight="700">Union-Find</text><text x="220" y="293" text-anchor="middle" class="tm" font-size="10">A–B reopening = loop</text>
<line x1="320" y1="281" x2="378" y2="281" stroke="currentColor" marker-end="url(#dsa-gr-a9)"/>
<rect x="380" y="256" width="200" height="50" rx="7" class="fv"/><text x="480" y="276" text-anchor="middle" font-size="11" font-weight="700">Kruskal MST</text><text x="480" y="293" text-anchor="middle" class="tm" font-size="10">sort + DSU = 7 km</text>
<line x1="110" y1="220" x2="180" y2="254" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-gr-a9)"/>
</svg><figcaption>One walk, three containers: a stack gives DFS, a queue gives BFS, a heap keyed by minutes gives Dijkstra. Everything else is built on one of them; Union-Find is the walk-free alternative for "same group?", and Kruskal is sorting plus Union-Find.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's city</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Graph</td><td>nodes + edges</td><td>what is the city?</td><td>7 places, 7 roads, 2 loops, 2 components</td><td>anything with connections</td></tr>
    <tr><td>Adjacency list</td><td>edge list, both directions</td><td>who are u's neighbours?</td><td>D → B 1, C 5, E 3</td><td>default storage</td></tr>
    <tr><td>DFS</td><td>stack / recursion + visited</td><td>what can I reach?</td><td>A B C D E; components {A..E}, {F, G}</td><td>reachability, components, cycles</td></tr>
    <tr><td>BFS</td><td>queue + visited</td><td>fewest edges?</td><td>B 1, C 1, D 2, E 3; A–B–D–E</td><td>unweighted shortest path</td></tr>
    <tr><td>Grid graph</td><td>cells + 4 neighbours, BFS/DFS</td><td>regions in a map?</td><td>3 islands; nearest kitchen grid</td><td>any 2-D board</td></tr>
    <tr><td>Cycle detection</td><td>DFS + parent / 3 colours</td><td>is there a loop?</td><td>C sees A (yes); one-way: no, until E→C</td><td>validity, deadlock</td></tr>
    <tr><td>Topological sort</td><td>in-degrees + queue (or DFS finish order)</td><td>what order respects the rules?</td><td>accept, rider, cook, pack, hand over</td><td>dependencies</td></tr>
    <tr><td>Union-Find</td><td>parent array + find/union</td><td>connected yet? loop?</td><td>A–B is the loop; 2 groups at the end</td><td>edges arriving over time</td></tr>
    <tr><td>Dijkstra</td><td>BFS shape + heap by distance</td><td>least total weight (≥ 0)?</td><td>C 1, B 3, D 4, E 7</td><td>weighted, non-negative</td></tr>
    <tr><td>Bellman-Ford</td><td>relax all edges V − 1 times</td><td>least weight with negatives?</td><td>B 2, D 4; loop −1 detected</td><td>negative edges, ≤ k edges</td></tr>
    <tr><td>MST</td><td>sorting + Union-Find (or heap)</td><td>cheapest network joining all?</td><td>A–C, B–D, B–C, D–E = 7</td><td>connect everything cheaply</td></tr>
    <tr><td>Bipartite</td><td>BFS + 2 colours</td><td>two sides?</td><td>orders: yes; roads: no (A–B–C)</td><td>two-group splits</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a graph walk is "take a place from a container, mark it, add its unvisited neighbours"; the container decides what you get (stack = reach, queue = fewest edges, heap = least weight), and the remaining tools either read the walk (colours, finish order, in-degrees, two colours) or replace it with Union-Find when edges arrive one at a time.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_backtrack">Recursion &amp; Backtracking</a>: DFS visits each place once and never un-marks it. "List every route from Rasoi to Dhruv" or "every combo from the menu" needs the same deep walk with one change: un-mark on the way back so other paths may reuse the place.</div>

  <h2 id="dsa-gr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: Biteful's city, roads in minutes <b>A–B 4, A–C 1, B–C 2, B–D 1, C–D 5, D–E 3, F–G 2</b> (A Rasoi, B Bakehouse, C Chowk, D Dhruv, E Esha, F Farah, G Gopal); pipeline accept → {rider, cook}, cook → pack, {rider, pack} → hand over.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On the city</th><th>Weakness → next</th></tr>
    <tr><td>Graph</td><td>what is it?</td><td>2 loops; 4 routes A→D</td><td>needs storage</td></tr>
    <tr><td>Adjacency list</td><td>neighbours fast?</td><td>D → B1 C5 E3</td><td>how to walk it?</td></tr>
    <tr><td>DFS</td><td>what is reachable?</td><td>A B C D E; F, G separate</td><td>detours, not fewest roads</td></tr>
    <tr><td>BFS</td><td>fewest roads?</td><td>E = 3 via A–B–D–E</td><td>grids have no list</td></tr>
    <tr><td>Grid graph</td><td>regions?</td><td>3 islands</td><td>"seen again" = loops?</td></tr>
    <tr><td>Cycle detection</td><td>loop?</td><td>C sees A</td><td>want an order, not yes/no</td></tr>
    <tr><td>Topological sort</td><td>valid order?</td><td>accept, rider, cook, pack, hand over</td><td>edges arrive one by one</td></tr>
    <tr><td>Union-Find</td><td>connected yet?</td><td>A–B closes a loop</td><td>ignores minutes</td></tr>
    <tr><td>Dijkstra</td><td>quickest (w ≥ 0)?</td><td>B 3, D 4, E 7</td><td>negative legs break it</td></tr>
    <tr><td>Bellman-Ford</td><td>quickest with negatives?</td><td>B 2, D 4</td><td>different question: connect all</td></tr>
    <tr><td>MST</td><td>cheapest connecting set?</td><td>7 km, 4 lanes</td><td>two-sided?</td></tr>
    <tr><td>Bipartite</td><td>split into two sides?</td><td>orders yes, roads no</td><td>→ every path: backtracking</td></tr>
  </table>
  <h3>Rules, templates and costs</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Rule in one line</th><th>Time · space</th></tr>
    <tr><td>Adjacency list</td><td>for (u, v, w): adj[u] += (v, w); adj[v] += (u, w) if undirected</td><td>O(V + E) · O(V + E)</td></tr>
    <tr><td>Adjacency matrix</td><td>mat[u][v] = w; O(1) edge test</td><td>O(V²) space</td></tr>
    <tr><td>DFS</td><td>mark u; for v in adj[u]: if unseen, DFS(v)</td><td>O(V + E) · O(V)</td></tr>
    <tr><td>BFS</td><td>dist[v] = dist[u] + 1 when first seen; mark on push; deque</td><td>O(V + E) · O(V)</td></tr>
    <tr><td>Multi-source BFS</td><td>all sources in the queue at distance 0</td><td>O(V + E)</td></tr>
    <tr><td>Undirected cycle</td><td>visited neighbour ≠ parent</td><td>O(V + E)</td></tr>
    <tr><td>Directed cycle</td><td>edge into GREY (white → grey → black)</td><td>O(V + E)</td></tr>
    <tr><td>Kahn</td><td>queue in-degree 0; pop, decrement; output &lt; V ⇒ cycle</td><td>O(V + E)</td></tr>
    <tr><td>Union-Find</td><td>find with path compression; union roots by rank</td><td>O(α(n)) ≈ O(1) each</td></tr>
    <tr><td>Dijkstra</td><td>pop min (d, u); skip stale; if d + w &lt; dist[v]: update, push</td><td>O((V + E) log V)</td></tr>
    <tr><td>Bellman-Ford</td><td>V − 1 rounds relaxing every edge; V-th improvement ⇒ negative cycle</td><td>O(V · E)</td></tr>
    <tr><td>Kruskal</td><td>sort edges; take if find(u) ≠ find(v)</td><td>O(E log E)</td></tr>
    <tr><td>Prim</td><td>heap of (w, v) leaving the tree; key = edge weight only</td><td>O(E log V)</td></tr>
    <tr><td>Bipartite</td><td>colour[v] = 1 − colour[u]; same colour on an edge ⇒ no</td><td>O(V + E)</td></tr>
  </table>
  <p>Symbols: V = number of nodes, E = number of edges, w = edge weight, d = distance popped from the heap, α = inverse Ackermann (≤ 4 in practice), in-degree = number of arrows into a node.</p>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Place</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F, G</th></tr>
    <tr><td>DFS order (from A)</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>other component</td></tr>
    <tr><td>BFS roads</td><td>0</td><td>1</td><td>1</td><td>2</td><td>3</td><td>unreachable</td></tr>
    <tr><td>Dijkstra minutes</td><td>0</td><td>3</td><td>1</td><td>4</td><td>7</td><td>unreachable</td></tr>
    <tr><td>Bellman-Ford net cost (legs A→B 4, A→C 5, C→B −3, B→D 2)</td><td>0</td><td>2</td><td>5</td><td>4</td><td>–</td><td>–</td></tr>
    <tr><td>Union-Find head at the end</td><td>B</td><td>B</td><td>B</td><td>B</td><td>B</td><td>F</td></tr>
  </table>
  <div class="cards">
    <div><b>Use DFS / BFS</b><p>Reachability, components, flood fill (DFS or BFS); fewest steps with equal costs (BFS only).</p><small>Avoid recursive DFS on 10⁴+ deep inputs in Python.</small></div>
    <div><b>Use Kahn / colours</b><p>Dependencies and "can everything finish?"; directed cycle checks.</p><small>Avoid the parent trick on directed graphs.</small></div>
    <div><b>Use Union-Find</b><p>Edges arriving over time, "same group?", redundant edge, Kruskal.</p><small>Avoid when you need the actual path or distance.</small></div>
    <div><b>Use Dijkstra / Bellman-Ford</b><p>Weighted shortest paths: Dijkstra for w ≥ 0, Bellman-Ford for negatives or ≤ k edges.</p><small>Avoid BFS on weighted graphs and Dijkstra with negative edges.</small></div>
  </div>
  <h3>Key traps</h3>
  <ul>
    <li>No visited set → infinite loop on A–B–C. Mark on push (BFS/DFS); finalise on pop (Dijkstra).</li>
    <li>Undirected graph stored one way → half the city unreachable.</li>
    <li>Looping over <code>adj</code> instead of all nodes → isolated nodes and other components missed.</li>
    <li>Wrong edge direction for prerequisites: "[a, b] = b before a" → arrow b → a.</li>
    <li>"At most k edges" with in-place updates → copy the array each round.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>Why does BFS give fewest roads but not least minutes? → It orders by edge count; A–B–D has 2 roads (5 min) but A–C–B–D takes 4 min. Weights need Dijkstra.</li>
    <li>What does it mean when <code>union(a, b)</code> returns False? → a and b already share a head, so the edge closes a cycle (A–B in the city).</li>
    <li>How does Kahn's algorithm reveal a cycle? → It outputs fewer than V nodes, because nodes on the cycle never reach in-degree 0.</li>
    <li>Why can't Dijkstra handle the −3 leg? → It finalised B at 4 when popped; the later route through C (5 − 3 = 2) is never accepted.</li>
    <li>Why is the city not bipartite? → The triangle A–B–C is an odd cycle: A on side 0 forces B and C onto side 1, yet B–C is an edge.</li>
  </ol>

  <h2 id="dsa-gr-qa"><span class="num">18</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Adjacency list or matrix: which and why?</summary><div class="qa-body">List by default: O(V + E) space and neighbour loops cost only the degree. A matrix is O(V²) space and wastes memory on sparse graphs (49 cells for the city's 7 roads), but answers "is u–v an edge?" in O(1); use it for small dense graphs or Floyd-Warshall.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time complexity of BFS and DFS, and why?</summary><div class="qa-body">O(V + E). Each node is marked visited once, so it is processed once; each edge is looked at once from each end (twice for undirected), which is still O(E). On an R × C grid that is O(R × C).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does BFS give shortest paths but DFS does not?</summary><div class="qa-body">BFS's queue processes all nodes at distance d before any at d + 1, so the first time a node is reached is via a fewest-edges path. DFS follows one branch as deep as it goes and can reach a node through a detour first (it reached D via A–B–C–D). This holds only when all edges cost the same.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect a cycle in an undirected vs a directed graph?</summary><div class="qa-body">Undirected: DFS/BFS remembering the parent; a visited neighbour that is not the parent means a cycle (or Union-Find: an edge whose ends already share a root). Directed: 3-colour DFS; an edge into a GREY node (on the current path) is a cycle. Or run Kahn's: if fewer than V nodes come out, there is a cycle.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't Dijkstra handle negative edges?</summary><div class="qa-body">It finalises a node when it pops it, assuming no later route can be cheaper because every extra edge only adds cost. A negative edge discovered later can lower the cost of an already-final node, and everything computed from it is then wrong (B = 4 instead of 2, D = 6 instead of 4). Use Bellman-Ford (O(V·E)), which also detects negative cycles.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a graph bipartite, and how do you check it?</summary><div class="qa-body">Exactly when it has no odd-length cycle. Check by BFS/DFS 2-colouring: give the start colour 0, every neighbour the opposite colour; if an edge ever joins two nodes of the same colour, it is not bipartite. Start a new BFS from every uncoloured node to cover all components. O(V + E).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should a node be marked visited in BFS, and in Dijkstra?</summary><div class="qa-body">BFS: when it is pushed, so no node is queued twice. Dijkstra: a distance is final only when it is popped; pushing may happen several times (stale entries are skipped on pop).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Complexity of Dijkstra with heapq?</summary><div class="qa-body">O((V + E) log V) time: each relaxation may push once at O(log) cost, and each node is settled once. O(V + E) space because stale entries stay in the heap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Kruskal or Prim?</summary><div class="qa-body">Kruskal (sort edges + Union-Find, O(E log E)) suits an edge list and sparse graphs. Prim (heap of edges leaving the tree, O(E log V)) suits an adjacency list and dense graphs. Same total weight (7 on the city).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Cheapest Flights copy the cost array each round?</summary><div class="qa-body">So each round adds exactly one flight. Updating in place could chain two flights in one round and break the stop limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does every graph walk need a visited set when tree traversals did not?</summary><div class="qa-body">In a tree each node has one parent, so walking down from the root reaches every node exactly once. A graph has cycles (A–B–C) and several routes to one node (4 routes to D), so without a mark the walk revisits nodes, and on a cycle never stops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: DFS, BFS and Dijkstra look almost identical. What is the one real difference?</summary><div class="qa-body">The container that decides which node to process next: a stack (newest first → deep), a queue (oldest first → by edge count), a heap keyed on distance (smallest first → by total weight). Everything else (mark, look at neighbours, push) is the same loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Kruskal need Union-Find, and what breaks if you use DFS instead?</summary><div class="qa-body">For each sorted edge Kruskal asks "are u and v already connected by the edges taken so far?". Union-Find answers in ≈ O(1) and absorbs the new edge with one union. A DFS on the partial tree per edge also works but costs O(V) each, making Kruskal O(E · V) instead of O(E log E).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip topological order and just process prerequisites in input order?</summary><div class="qa-body">A step can be processed before something it depends on (hand over before pack), so the result is invalid, and a cycle in the rules goes unnoticed. Kahn's in-degree counting is what guarantees "all prerequisites done" and flags cycles by outputting fewer than V nodes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is Bellman-Ford related to dynamic programming?</summary><div class="qa-body">Round i computes "cheapest cost using at most i edges" from round i − 1's answers: best_i(v) = min(best_{i−1}(v), best_{i−1}(u) + w). That is a DP over the number of edges, which is also why "at most k stops" is just k + 1 rounds.</div></details>
</main>
`
});
