// notes/dsa/dsa_graphs.js — Graphs
Object.assign(TOPIC_CONTENT, {
  "dsa_graphs": `<main>
<h1>Graphs</h1>
  <div class="where"><span>DSA</span><span>Trees &amp; graphs</span><span>Graphs</span></div>
  <p class="lead">A graph is a set of things together with the connections between them: places joined by roads, people joined by friendships, tasks joined by "must happen before" rules, cells of a map joined to their neighbours. A tree is a special graph with exactly one route between any two nodes; most real networks have loops and several routes, and that changes how every algorithm must work. Graphs are among the most frequently asked interview topics, because a large share of problems ("islands", "prerequisites", "minimum steps", "cheapest route", "connected groups") are graph problems in disguise. The running example for the whole note is Biteful's city map: seven places (two restaurants, a crossing and four customers) joined by seven roads, each taking a few minutes to ride. We will store it, walk it deep and in rings, find its loops, put tasks in order, merge groups, find the quickest routes, connect it cheaply and split it into two sides, adding one tool at a time to the same map.</p>

  <h2 id="dsa-gr-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Graphs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Basics</div>
        <ul>
          <li><b>Node</b> = thing, <b>edge</b> = connection; V nodes, E edges</li>
          <li>Directed or undirected; weighted or not</li>
          <li>Store as an <b>adjacency list</b>: O(V + E)</li>
          <li>Every walk needs a <b>visited</b> set because of loops</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Walking</div>
        <ul>
          <li><b>DFS</b> (stack / recursion): what can I reach?</li>
          <li><b>BFS</b> (queue): fewest edges</li>
          <li>Grids: cells are nodes, 4 neighbours</li>
          <li>Both O(V + E)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Structure</div>
        <ul>
          <li>Cycle: non-parent visited (undirected), GREY node (directed)</li>
          <li>Topological sort: Kahn's in-degree queue</li>
          <li>Union-Find: "same group?" as edges arrive</li>
          <li>Bipartite: 2-colouring; fails on an odd cycle</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Weighted</div>
        <ul>
          <li><b>Dijkstra</b>: heap, weights ≥ 0, O((V + E) log V)</li>
          <li><b>Bellman-Ford</b>: negatives, V − 1 rounds, O(V · E)</li>
          <li><b>MST</b>: Kruskal (sort + Union-Find) or Prim (heap)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-gr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Graph Is</span><span class="rm-sub">Biteful's city, loops and the vocabulary</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-store"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Storing a Graph</span><span class="rm-sub">edge list, adjacency list, matrix</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-dfs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Depth-First Search</span><span class="rm-sub">what can I reach? components</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-bfs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Breadth-First Search</span><span class="rm-sub">fewest roads, shortest unweighted path</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-grid"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Grids as Graphs</span><span class="rm-sub">islands, multi-source BFS</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-cycle"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Cycle Detection</span><span class="rm-sub">parent check, three colours</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-topo"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Topological Sort</span><span class="rm-sub">putting dependent tasks in order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-uf"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Union-Find</span><span class="rm-sub">merging groups as edges arrive</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-sp"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Dijkstra's Algorithm</span><span class="rm-sub">quickest route when roads have costs</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-bf"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Bellman-Ford</span><span class="rm-sub">negative costs and "at most k edges"</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-mst"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Minimum Spanning Tree</span><span class="rm-sub">cheapest set of edges joining everyone</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-bip"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Bipartite Graphs</span><span class="rm-sub">can the nodes be split into two sides?</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-patterns"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">from problem wording to algorithm</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">visited timing, direction, wrong tool</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">templates, costs, the city's numbers</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on graphs</span></div></div>
    </div>
  </div>

  <h2 id="dsa-gr-need"><span class="num">01</span>What a Graph Is</h2>
  <p>Biteful delivers food across a small city. On one side of a creek are two restaurants, A (Rasoi) and B (Bakehouse), a busy crossing C (Chowk), and two customers, D (Dhruv) and E (Esha). Across the creek live two more customers, F (Farah) and G (Gopal), joined only to each other by a footbridge path. Every road is two-way and takes some number of minutes to ride:</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640"><line x1="60" y1="110" x2="200" y2="40" stroke="currentColor"/><line x1="60" y1="110" x2="200" y2="180" stroke="currentColor"/><line x1="200" y1="40" x2="200" y2="180" stroke="currentColor"/><line x1="200" y1="40" x2="340" y2="110" stroke="currentColor"/><line x1="200" y1="180" x2="340" y2="110" stroke="currentColor"/><line x1="340" y1="110" x2="480" y2="110" stroke="currentColor"/><line x1="580" y1="45" x2="580" y2="175" stroke="currentColor"/><path d="M528 10 C 518 50, 538 90, 528 130 S 518 190, 528 220" fill="none" class="sb" stroke-dasharray="5 4"/><text x="510" y="222" class="tm" text-anchor="end">creek</text><text x="120" y="66" text-anchor="middle">4</text><text x="120" y="166" text-anchor="middle">1</text><text x="212" y="114">2</text><text x="282" y="66" text-anchor="middle">1</text><text x="282" y="166" text-anchor="middle">5</text><text x="410" y="102" text-anchor="middle">3</text><text x="592" y="114">2</text><circle cx="60" cy="110" r="17" style="fill:var(--bg)"/><circle cx="60" cy="110" r="17" class="fg sg"/><text x="60" y="114" text-anchor="middle">A</text><circle cx="200" cy="40" r="17" style="fill:var(--bg)"/><circle cx="200" cy="40" r="17" class="fg sg"/><text x="200" y="44" text-anchor="middle">B</text><circle cx="200" cy="180" r="17" style="fill:var(--bg)"/><circle cx="200" cy="180" r="17" class="fb sb"/><text x="200" y="184" text-anchor="middle">C</text><circle cx="340" cy="110" r="17" style="fill:var(--bg)"/><circle cx="340" cy="110" r="17" class="fv sb"/><text x="340" y="114" text-anchor="middle">D</text><circle cx="480" cy="110" r="17" style="fill:var(--bg)"/><circle cx="480" cy="110" r="17" class="fv sb"/><text x="480" y="114" text-anchor="middle">E</text><circle cx="580" cy="45" r="17" style="fill:var(--bg)"/><circle cx="580" cy="45" r="17" class="fv sb"/><text x="580" y="49" text-anchor="middle">F</text><circle cx="580" cy="175" r="17" style="fill:var(--bg)"/><circle cx="580" cy="175" r="17" class="fv sb"/><text x="580" y="179" text-anchor="middle">G</text><text x="60" y="148" class="tm" text-anchor="middle">Rasoi</text><text x="232" y="30" class="tm">Bakehouse</text><text x="200" y="216" class="tm" text-anchor="middle">Chowk</text><text x="340" y="146" class="tm" text-anchor="middle">Dhruv</text><text x="480" y="146" class="tm" text-anchor="middle">Esha</text><text x="604" y="49" class="tm">Farah</text><text x="604" y="179" class="tm">Gopal</text></svg><figcaption>Biteful's city, used throughout the note. Green = restaurants, blue = crossing, purple = customers; numbers are minutes. There are two loops, A–B–C and B–C–D, and F–G are cut off by the creek.</figcaption></figure>
  <p>This picture is a <strong>graph</strong>: a set of <strong>nodes</strong> (also called vertices; here the seven places) and a set of <strong>edges</strong>, each joining two nodes (here the roads). We write V for the number of nodes and E for the number of edges. The edges here are <strong>undirected</strong>, meaning they work both ways; a one-way street, or a rule like "cook before packing", is a <strong>directed</strong> edge, an arrow. The edges are also <strong>weighted</strong>: each carries a number, the minutes. Think of your phone contacts: each person is a node, "we have each other's number" is an undirected edge, and an Instagram "follow" is a directed edge, because you can follow someone who does not follow you back.</p>
  <p>You have met a kind of graph before: a tree, where every node except the root has exactly one parent, so there is exactly one route between any two nodes and walking down from the root never reaches anything twice. Biteful's city is not like that, and the difference is measurable. A tree on n nodes always has exactly n − 1 edges; every extra edge creates a loop.</p>
  <div class="fx" data-lang="py">roads = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2), ("B", "D", 1),
         ("C", "D", 5), ("D", "E", 3), ("F", "G", 2)]      # (place, place, minutes)

main = {"A", "B", "C", "D", "E"}
inside = [r for r in roads if r[0] in main]
print("main area:", len(main), "places,", len(inside), "roads")
print("a tree on 5 places has exactly", len(main) - 1, "roads")
print("extra roads:", len(inside) - (len(main) - 1), "-&gt; each one closes a loop")</div>
  <div class="fx" data-lang="text">main area: 5 places, 6 roads
a tree on 5 places has exactly 4 roads
extra roads: 2 -&gt; each one closes a loop</div>
  <p>Two extra roads mean two independent loops, A–B–C and B–C–D. The practical effect is that there is more than one route between the same two places. Listing every loop-free route from Rasoi (A) to Dhruv (D) by hand:</p>
  <table class="tbl"><caption>Every loop-free route from A (Rasoi) to D (Dhruv)</caption>
    <tr><th>route</th><th>roads used</th><th>minutes</th></tr>
    <tr><td>A → B → D</td><td>2</td><td>4 + 1 = 5</td></tr>
    <tr><td>A → C → D</td><td>2</td><td>1 + 5 = 6</td></tr>
    <tr><td>A → C → B → D</td><td>3</td><td>1 + 2 + 1 = <b>4</b> (quickest)</td></tr>
    <tr><td>A → B → C → D</td><td>3</td><td>4 + 2 + 5 = 11</td></tr>
  </table>
  <p>This small table previews the whole note. First, a rider who keeps turning can come back to where they started (A → B → C → A), so any program that walks this graph must remember which places it has already visited, or it will go round the loop forever; that remembered collection is called the <strong>visited set</strong>, and it is the first line of almost every algorithm below. Second, the route with the fewest roads (A → B → D, two roads) is not the quickest (A → C → B → D, four minutes), so "fewest edges" and "least total weight" are different questions needing different tools. Third, F and G cannot be reached from A at all: the city is in two pieces. Each piece, a largest group of nodes in which everyone can reach everyone, is called a <strong>connected component</strong>.</p>
  <p>A few more words complete the vocabulary. The <strong>degree</strong> of a node is the number of edges touching it (B has degree 3). A <strong>path</strong> is a route along edges; a <strong>cycle</strong> is a path that returns to its start. A directed graph with no cycles is called a <strong>DAG</strong> (directed acyclic graph), and dependency rules form one. Almost every graph algorithm in this note runs in <strong>O(V + E)</strong> time, because it looks at each node once and each edge once (twice for undirected edges, once from each end).</p>

  <h2 id="dsa-gr-store"><span class="num">02</span>Storing a Graph</h2>
  <p>A program does not see the picture. Interview problems usually hand you an <strong>edge list</strong>: a plain list of pairs <code>(u, v)</code>, or triples <code>(u, v, weight)</code>, one per edge. That is a fine way to describe a graph, but a poor way to walk one, because every walk keeps asking the same question millions of times: "standing at D, where can I go next, and how long does each road take?" With an edge list, answering means scanning all E edges every time.</p>
  <p>The fix is to reorganise the list once, at the start, into an <strong>adjacency list</strong>: for every node, the list of its neighbours (with weights, if any). For each road (u, v, w) you write v under u <em>and</em> u under v, because the road works both ways. Think of the signboard at each crossing listing where each exit leads; the edge list is the municipal register of all roads, and the adjacency list is that register cut up and posted at every crossing. A third option is the <strong>adjacency matrix</strong>, a V × V table whose cell [u][v] holds the weight of road u–v, or 0 if there is none, like the distance chart in a road atlas with every town against every town. The code builds both from the same seven roads:</p>
  <div class="fx" data-lang="py">from collections import defaultdict

nodes = "ABCDEFG"
roads = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2), ("B", "D", 1),
         ("C", "D", 5), ("D", "E", 3), ("F", "G", 2)]   # edge list: (u, v, minutes)

adj = defaultdict(list)                  # adjacency list: place -&gt; [(neighbour, minutes)]
for u, v, w in roads:
    adj[u].append((v, w))
    adj[v].append((u, w))                # two-way road: store it from both ends
for u in nodes:
    print(u, "-&gt;", adj[u])

idx = {u: i for i, u in enumerate(nodes)}   # matrix: each place needs a row number
mat = [[0] * len(nodes) for _ in nodes]     # 0 = no road
for u, v, w in roads:
    mat[idx[u]][idx[v]] = mat[idx[v]][idx[u]] = w
print("   ", "  ".join(nodes))
for u in nodes:
    print(u, mat[idx[u]])</div>
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
G [0, 0, 0, 0, 0, 2, 0]</div>
  <p>D's entry in the adjacency list is three pairs, so "who are D's neighbours?" costs three steps, and the total size of all lists is 14 entries, two per road. The matrix answers "is there a road B–D?" in a single lookup (row B, column D holds 1), but it spends 49 cells on 7 roads, and finding D's neighbours means reading D's whole row of 7. Real graphs are usually <strong>sparse</strong>, with far fewer edges than the V² possible pairs, so the adjacency list is the default choice:</p>
  <table class="tbl">
    <tr><th>Store as</th><th>Space</th><th>Neighbours of u</th><th>Is u–v an edge?</th><th>Use when</th></tr>
    <tr><td>Adjacency list</td><td>O(V + E)</td><td>O(degree of u)</td><td>O(degree), or O(1) with sets</td><td>almost always</td></tr>
    <tr><td>Adjacency matrix</td><td>O(V²)</td><td>O(V), read the row</td><td>O(1)</td><td>small, dense graphs; all-pairs algorithms</td></tr>
    <tr><td>Edge list</td><td>O(E)</td><td>O(E), scan everything</td><td>O(E)</td><td>algorithms that loop over edges (Kruskal, Bellman-Ford)</td></tr>
  </table>
  <p>Two details cause real bugs. If you forget the second append, <code>adj[v].append(...)</code>, on an undirected graph, the code still runs, but D can no longer see B and parts of the city silently become unreachable. And a node with no edges at all never appears in a <code>defaultdict</code> built from the edge list, so when you need every node (counting components, for example), loop over the full node list, not over <code>adj</code>. The rest of the note uses the adjacency list built here, written <code>adj</code> when only neighbours matter and <code>wadj</code> when the minutes matter too. Building it is O(V + E), the cost of reading the input.</p>

  <h2 id="dsa-gr-dfs"><span class="num">03</span>Depth-First Search</h2>
  <p>The first real question: standing at Rasoi, which places can a rider reach at all? The adjacency list only shows the next step. We need a systematic walk that reaches every reachable place exactly once, even though the roads loop. Imagine exploring an old haveli with many rooms, with one rule: keep walking into a new room as long as you can, and when a room has no unexplored door, walk back one room and try its next door. To avoid exploring a room twice, you chalk a mark on each room as you enter it.</p>
  <p>That is <strong>depth-first search</strong> (DFS): go as deep as possible along one route before backing up. The "walk back one room" is exactly what happens when a recursive function returns to its caller, so DFS is naturally written with recursion, and the chalk mark is the visited set. The rule is three lines: mark the current place; for each neighbour, if it is not marked, run DFS from it. The output's indentation shows how deep the recursion is:</p>
  <div class="fx" data-lang="py"># adj: the unweighted adjacency list of the city, built as in section 02

def dfs(u, seen, depth=0):
    seen.add(u)                           # chalk mark BEFORE going deeper
    print("  " * depth + f"enter {u}")
    for v in adj[u]:
        if v not in seen:
            dfs(v, seen, depth + 1)
    print("  " * depth + f"leave {u}")

seen = set()
dfs("A", seen)
print("reached:", sorted(seen))</div>
  <div class="fx" data-lang="text">enter A
  enter B
    enter C
      enter D
        enter E
        leave E
      leave D
    leave C
  leave B
leave A
reached: ['A', 'B', 'C', 'D', 'E']</div>
  <p>Follow it with the map. From A the first neighbour is B, so DFS enters B. From B, A is already marked, so it moves to C. From C, A and B are marked, so it goes to D, then from D to E. E's only neighbour, D, is marked, so E is a dead end and the walk backs up: leave E, then D, C, B and A each find nothing new. Five places reached, each entered once. Without the marks, step two would go from B back to A, then to B again, forever. Notice also that DFS reached D by the long way, A → B → C → D (three roads), although A → B → D needs only two: DFS finds <em>a</em> route, not the shortest one.</p>
  <p>Recursion has a practical limit in Python: about 1,000 nested calls by default. A 300 × 300 map of land is one region of 90,000 cells, so a recursive DFS on it crashes with <code>RecursionError</code>. The fix is to manage the "rooms to come back to" yourself with a list used as a <strong>stack</strong> (last in, first out): push the start; repeatedly pop the newest place, mark it if it is not already marked, and push its unmarked neighbours. The same loop, run from every place that is still unmarked, also finds the connected components:</p>
  <div class="fx" data-lang="py"># adj: the unweighted adjacency list of the city

def dfs_iter(start, seen):
    order, stack = [], [start]
    while stack:
        u = stack.pop()                   # newest first = keep going deep
        if u in seen:                     # pushed twice? skip the repeat
            continue
        seen.add(u)
        order.append(u)
        for v in reversed(adj[u]):        # reversed: first neighbour comes out first
            if v not in seen:
                stack.append(v)
    return order

def components(nodes):
    seen, comps = set(), []
    for s in nodes:                       # try every place as a start
        if s not in seen:
            comps.append(dfs_iter(s, seen))
    return comps

print(dfs_iter("A", set()))
print(components("ABCDEFG"))</div>
  <div class="fx" data-lang="text">['A', 'B', 'C', 'D', 'E']
[['A', 'B', 'C', 'D', 'E'], ['F', 'G']]</div>
  <p>The iterative version visits A, B, C, D, E in the same order as the recursion, because neighbours are pushed in reverse so the first one is popped first. A place can be pushed twice before it is popped (C is pushed by both A and B), which is why the popped place is checked against <code>seen</code> before use. The <code>components</code> loop tries every place as a start; A starts the first component and marks all five places on its side of the creek, B to E are skipped as already seen, and F starts a second component that contains G. That gives the two pieces of the city.</p>
  <p>DFS visits each node once and looks at each edge once from each end, so it costs <strong>O(V + E) time</strong> and <strong>O(V) extra space</strong> for the visited set and the stack. Recognise it when a problem asks "can X reach Y?", "is there a path?", "how many groups / provinces / regions?", "visit everything", or "copy the whole graph" (Clone Graph keeps a dict from each original node to its copy, which doubles as the visited set). Whenever the order of visiting does not matter, DFS is the simplest walk to write.</p>

  <h2 id="dsa-gr-bfs"><span class="num">04</span>Breadth-First Search</h2>
  <p>DFS told us Rasoi can reach Dhruv, but it got there along three roads when two would do. Suppose dispatch wants the fewest roads from Rasoi to every place, perhaps because each road crossing costs a toll. We need a walk in which the first time a place is reached, it is reached by the fewest roads. Drop a stone into a pond: the ripple reaches everything one metre away first, then everything two metres away, then three. <strong>Breadth-first search</strong> (BFS) visits places in the same way: first all neighbours of the start (one road away), then all their new neighbours (two roads), and so on, ring by ring.</p>
  <figure class="viz"><svg viewBox="0 0 600 235" width="600"><rect x="20" y="30" width="100" height="170" rx="8" class="fs"/><rect x="140" y="30" width="100" height="170" rx="8" class="fs"/><rect x="260" y="30" width="100" height="170" rx="8" class="fs"/><rect x="380" y="30" width="100" height="170" rx="8" class="fs"/><line x1="70" y1="115" x2="190" y2="70" stroke="currentColor"/><line x1="70" y1="115" x2="190" y2="160" stroke="currentColor"/><line x1="190" y1="70" x2="190" y2="160" stroke="currentColor" stroke-dasharray="4 4"/><line x1="190" y1="70" x2="310" y2="115" stroke="currentColor"/><line x1="190" y1="160" x2="310" y2="115" stroke="currentColor" stroke-dasharray="4 4"/><line x1="310" y1="115" x2="430" y2="115" stroke="currentColor"/><circle cx="70" cy="115" r="17" style="fill:var(--bg)"/><circle cx="70" cy="115" r="17" class="fg sg"/><text x="70" y="119" text-anchor="middle">A</text><circle cx="190" cy="70" r="17" style="fill:var(--bg)"/><circle cx="190" cy="70" r="17" class="fb sb"/><text x="190" y="74" text-anchor="middle">B</text><circle cx="190" cy="160" r="17" style="fill:var(--bg)"/><circle cx="190" cy="160" r="17" class="fb sb"/><text x="190" y="164" text-anchor="middle">C</text><circle cx="310" cy="115" r="17" style="fill:var(--bg)"/><circle cx="310" cy="115" r="17" class="fb sb"/><text x="310" y="119" text-anchor="middle">D</text><circle cx="430" cy="115" r="17" style="fill:var(--bg)"/><circle cx="430" cy="115" r="17" class="fb sb"/><text x="430" y="119" text-anchor="middle">E</text><text x="70" y="222" class="tm" text-anchor="middle">0 roads</text><text x="190" y="222" class="tm" text-anchor="middle">1 road</text><text x="310" y="222" class="tm" text-anchor="middle">2 roads</text><text x="430" y="222" class="tm" text-anchor="middle">3 roads</text><text x="500" y="80" class="tb">BFS order</text><text x="500" y="100">A B C D E</text><text x="500" y="140" class="tr">DFS reached D</text><text x="500" y="160">via A B C D</text></svg><figcaption>BFS from Rasoi sweeps the city in rings. Solid lines are the roads BFS used to first reach each place (each place's "parent"); dashed roads were never needed for a fewest-roads route. D is in ring 2 because A–B–D uses two roads.</figcaption></figure>
  <p>The tool that produces this order is a <strong>queue</strong> (first in, first out), like the line at a ration shop: whoever was discovered earlier is processed earlier, so every place one road away is processed before any place two roads away. In Python the queue is a <code>deque</code> (double-ended queue), whose <code>popleft()</code> is O(1). The algorithm: give the start distance 0 and put it in the queue; repeatedly take the oldest place u out; for each neighbour v not yet seen, set its distance to u's distance plus one, remember u as v's <strong>parent</strong> (the place we reached it from), and add v to the queue.</p>
  <div class="fx" data-lang="py">from collections import deque
# adj: the unweighted adjacency list of the city

def bfs(src):
    dist = {src: 0}                  # also serves as the visited set
    parent = {src: None}
    q = deque([src])
    while q:
        u = q.popleft()              # oldest first = nearest first
        for v in adj[u]:
            if v not in dist:        # first time seen = fewest roads
                dist[v] = dist[u] + 1
                parent[v] = u
                q.append(v)
        print(f"pop {u}  queue={list(q)}  dist={dist}")
    return dist, parent

def path_to(parent, t):
    out = []
    while t is not None:             # follow parents back to the source
        out.append(t)
        t = parent[t]
    return out[::-1]

dist, parent = bfs("A")
print("A to E:", dist["E"], "roads via", path_to(parent, "E"), "| F reachable?", "F" in dist)</div>
  <div class="fx" data-lang="text">pop A  queue=['B', 'C']  dist={'A': 0, 'B': 1, 'C': 1}
pop B  queue=['C', 'D']  dist={'A': 0, 'B': 1, 'C': 1, 'D': 2}
pop C  queue=['D']  dist={'A': 0, 'B': 1, 'C': 1, 'D': 2}
pop D  queue=['E']  dist={'A': 0, 'B': 1, 'C': 1, 'D': 2, 'E': 3}
pop E  queue=[]  dist={'A': 0, 'B': 1, 'C': 1, 'D': 2, 'E': 3}
A to E: 3 roads via ['A', 'B', 'D', 'E'] | F reachable? False</div>
  <p>Trace the rings in the output. Popping A discovers B and C at distance 1. Popping B discovers D at distance 2 (A and C are already known). Popping C discovers nothing new, because A, B and D are all known. Popping D discovers E at distance 3, and popping E ends the walk. The <code>dist</code> dict doubles as the visited set: a place is in it from the moment it is first discovered. To recover the route itself, follow the <code>parent</code> links back from E (E ← D ← B ← A) and reverse them: A, B, D, E. F never enters the queue, so it is unreachable.</p>
  <p>Why is the first discovery always along a fewest-roads route? Because the queue holds every place at distance d before any place at distance d + 1, so a place is first seen from the earliest possible ring. This guarantee holds only when every edge costs the same. With minutes instead of road counts it breaks: BFS says A → B → D (two roads, five minutes), but A → C → B → D takes four minutes. Section 09 deals with that.</p>
  <p>Two details matter in the code. A place is marked when it is <em>added</em> to the queue, not when it is taken out; otherwise several neighbours add the same place and the queue fills with duplicates (Common Mistakes shows this). And the queue must be a <code>deque</code>: <code>list.pop(0)</code> shifts every element and costs O(n), turning BFS into O(V²). With both right, BFS costs <strong>O(V + E) time and O(V) space</strong>. Recognise it in problem wording such as "minimum number of steps / moves / hops / transformations", "shortest path" when every step costs the same, "nearest", "level by level", or "spreads one step every minute".</p>

  <h2 id="dsa-gr-grid"><span class="num">05</span>Grids as Graphs</h2>
  <p>Many interview problems never mention nodes or edges. They hand you a grid: a map of land and water, a maze, a board. Biteful's operations team has a map of the city in square blocks, where 1 is a built-up block a rider can serve and 0 is water or park, and asks: how many separate neighbourhoods are there? That is a connected-components question, but there is no edge list to build an adjacency list from.</p>
  <p>A grid is a graph in disguise. Each cell (r, c) is a node, and its up, down, left and right cells are its neighbours (diagonals do not count unless the problem says so). Instead of storing an adjacency list, you compute the four neighbours on the fly as <code>(r+1, c)</code>, <code>(r−1, c)</code>, <code>(r, c+1)</code>, <code>(r, c−1)</code> and skip any that fall outside the grid. Counting neighbourhoods, usually called "islands", is then the components loop from section 03: scan every cell, and whenever you find unvisited land, count a new island and flood the whole island with a BFS (or DFS) so its cells are marked and not counted again.</p>
  <table class="tbl"><caption>The block map (rows 0–3, columns 0–4)</caption>
    <tr><th></th><th>c0</th><th>c1</th><th>c2</th><th>c3</th><th>c4</th></tr>
    <tr><th>r0</th><td><b>1</b></td><td><b>1</b></td><td>0</td><td>0</td><td>0</td></tr>
    <tr><th>r1</th><td><b>1</b></td><td><b>1</b></td><td>0</td><td>0</td><td>0</td></tr>
    <tr><th>r2</th><td>0</td><td>0</td><td><b>1</b></td><td>0</td><td>0</td></tr>
    <tr><th>r3</th><td>0</td><td>0</td><td>0</td><td><b>1</b></td><td><b>1</b></td></tr>
  </table>
  <div class="fx" data-lang="py">from collections import deque

zone = ["11000",          # Biteful's block map: 1 = built-up block, 0 = water or park
        "11000",
        "00100",
        "00011"]

def count_islands(grid):
    R, C = len(grid), len(grid[0])
    seen, count = set(), 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1" and (r, c) not in seen:
                count += 1                       # unvisited land: a new island
                q = deque([(r, c)])
                seen.add((r, c))
                cells = []
                while q:                         # BFS floods the whole island
                    cr, cc = q.popleft()
                    cells.append((cr, cc))
                    for nr, nc in ((cr+1, cc), (cr-1, cc), (cr, cc+1), (cr, cc-1)):
                        if (0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C and grid[nr][nc] == "1"
                                and (nr, nc) not in seen):
                            seen.add((nr, nc))
                            q.append((nr, nc))
                print(f"island {count} from {(r, c)}: {cells}")
    return count

print("islands:", count_islands(zone))</div>
  <div class="fx" data-lang="text">island 1 from (0, 0): [(0, 0), (1, 0), (0, 1), (1, 1)]
island 2 from (2, 2): [(2, 2)]
island 3 from (3, 3): [(3, 3), (3, 4)]
islands: 3</div>
  <p>The scan finds (0,0) first, counts island 1 and floods the 2 × 2 block. It skips those four cells later because they are marked, finds (2,2) and counts island 2 (its four neighbours are all water; the diagonal neighbours (1,1) and (3,3) do not count), then finds (3,3) and floods it together with (3,4). Three islands. The bounds check <code>0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C</code> must come before reading the cell: without it the bottom row raises <code>IndexError</code>, and worse, the top row silently wraps around, because <code>grid[-1]</code> in Python is the last row. A grid has V = R × C nodes and at most four edges each, so every traversal is <strong>O(R × C)</strong>.</p>
  <p>Grids also bring a useful BFS variant. "For every block, how far is the nearest Biteful kitchen?" could be answered by one BFS per kitchen, costing (kitchens × cells). Instead, put <strong>all</strong> kitchens into the queue at distance 0 before starting, and run a single BFS. It is like dropping several stones into the pond at the same moment: the ripples spread together, and each cell is reached first by the ripple from its nearest stone. This is called <strong>multi-source BFS</strong>:</p>
  <div class="fx" data-lang="py">from collections import deque

def nearest_kitchen(grid):               # 0 = a Biteful kitchen, 1 = a street block
    R, C = len(grid), len(grid[0])
    dist = [[-1] * C for _ in range(R)]  # -1 = not reached yet
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

for row in nearest_kitchen([[0, 1, 1, 1],
                            [1, 1, 1, 1],
                            [1, 1, 1, 0]]):
    print(row)</div>
  <div class="fx" data-lang="text">[0, 1, 2, 2]
[1, 2, 2, 1]
[2, 2, 1, 0]</div>
  <p>The kitchens are in the top-left and bottom-right corners (the 0s). Each other cell shows its distance to whichever kitchen is closer: the middle cells are 2 from both. One BFS, O(R × C), however many kitchens there are. The well-known problem "Rotting Oranges" is exactly this: all rotten oranges start in the queue, each BFS ring is one minute, the answer is the largest distance reached, and −1 if some fresh orange is never reached. Problem wording that signals grid graphs: "grid", "matrix of 0s and 1s", "islands", "regions", "flood fill"; and for multi-source BFS: "nearest X from every cell", "spreads to adjacent cells every minute", "all at once".</p>

  <h2 id="dsa-gr-cycle"><span class="num">06</span>Cycle Detection</h2>
  <p>In every walk so far, the visited set kept saying "already seen": C saw A again, D saw C again. Some of those moments are loops in the map. Sometimes the loop itself is the question: does this road network contain a cycle? Does this set of rules contain a circular dependency, so that the tasks can never all be finished? The tricky part is that not every "already seen" means a cycle, and the rule is different for undirected and directed graphs.</p>
  <p>In an undirected graph, the neighbour you just came from is always already visited: that is simply the road behind you, not a loop. So DFS passes along the <strong>parent</strong> (the node it arrived from) and ignores it. If DFS meets any <em>other</em> already-visited neighbour, that neighbour can be reached by two different routes, which together form a cycle:</p>
  <div class="fx" data-lang="py">from collections import defaultdict

def has_cycle_undirected(nodes, edges):
    adj = defaultdict(list)
    for u, v, *_ in edges:
        adj[u].append(v)
        adj[v].append(u)
    seen = set()

    def dfs(u, parent):
        seen.add(u)
        for v in adj[u]:
            if v == parent:          # the road I just came along: not a loop
                continue
            if v in seen:            # reached again by ANOTHER road: a loop
                print(f"  at {u}: {v} already seen and is not my parent ({parent})")
                return True
            if dfs(v, u):
                return True
        return False

    return any(u not in seen and dfs(u, None) for u in nodes)

roads = [("A", "B"), ("A", "C"), ("B", "C"), ("B", "D"), ("C", "D"), ("D", "E"), ("F", "G")]
print("city:", has_cycle_undirected("ABCDEFG", roads))
tree = [("A", "C"), ("C", "B"), ("B", "D"), ("D", "E")]     # only one route anywhere
print("tree:", has_cycle_undirected("ABCDE", tree))</div>
  <div class="fx" data-lang="text">  at C: A already seen and is not my parent (B)
city: True
tree: False</div>
  <p>On the city, DFS goes A → B → C. At C, neighbour A is already visited and is not C's parent (B), so the loop A–B–C–A is found. On the four-road tree (A–C, C–B, B–D, D–E), the walk only ever meets its own parent and finishes with no cycle.</p>
  <p>Directed graphs need a different test. Suppose Biteful's central zone switches to one-way streets: A→B, A→C, C→B, B→D, D→E. B can be reached two ways (A→B, and A→C→B), so DFS will meet B "already visited" a second time, yet there is no loop: you can never return to where you started by following the arrows. What matters is whether a node is on the path <strong>you are walking right now</strong>. Theseus in the labyrinth unrolls a thread as he walks; if a corridor leads into a room where the thread already lies, he has walked in a circle, but reaching a room he finished earlier and rolled the thread back from just means two corridors join.</p>
  <p>DFS models the thread with three colours. <strong>WHITE</strong> means not visited yet. <strong>GREY</strong> means entered and still on the current path (the thread lies there). <strong>BLACK</strong> means finished: every exit has been explored and the thread rolled back. An edge into a GREY node leads back onto your own path, so it closes a cycle (this is called a <strong>back edge</strong>); an edge into a BLACK node merely joins a finished branch.</p>
  <table class="tbl"><caption>The one-way city, then the same with a new street E→C</caption>
    <tr><th>walk</th><th>colours as we go</th><th>verdict</th></tr>
    <tr><td>A→B→D→E</td><td>A, B, D, E turn grey; E has no exit, so E, D, B turn black</td><td>no cycle yet</td></tr>
    <tr><td>back at A: A→C</td><td>C grey; C→B finds B BLACK: fine; C, A turn black</td><td>no cycle</td></tr>
    <tr><td>with E→C: A→B→D→E→C</td><td>A, B, D, E, C all grey; C→B finds B GREY</td><td><b>cycle</b> B→D→E→C→B</td></tr>
  </table>
  <div class="fx" data-lang="py">from collections import defaultdict

WHITE, GREY, BLACK = "white", "grey", "black"

def has_cycle_directed(nodes, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)                 # one-way street u -&gt; v
    color = {u: WHITE for u in nodes}

    def dfs(u):
        color[u] = GREY                  # on the path being walked right now
        for v in adj[u]:
            if color[v] == GREY:         # back onto my own path: a loop
                print(f"  edge {u}-&gt;{v}: {v} is GREY -&gt; cycle")
                return True
            if color[v] == WHITE and dfs(v):
                return True
        color[u] = BLACK                 # every exit explored: finished, safe
        return False

    return any(color[u] == WHITE and dfs(u) for u in nodes)

one_way = [("A", "B"), ("A", "C"), ("C", "B"), ("B", "D"), ("D", "E")]
print("one-way city:", has_cycle_directed("ABCDE", one_way))
print("after E-&gt;C opens:", has_cycle_directed("ABCDE", one_way + [("E", "C")]))</div>
  <div class="fx" data-lang="text">one-way city: False
  edge C-&gt;B: B is GREY -&gt; cycle
after E-&gt;C opens: True</div>
  <p>Without the new street, C→B finds B already BLACK and no cycle is reported, even though B is visited twice. With E→C, the walk A→B→D→E→C is still in progress (all GREY) when C's arrow points to B, so the loop B→D→E→C→B is found. Both tests run in <strong>O(V + E)</strong>. Using the undirected parent trick, or a plain two-state visited set, on a directed graph wrongly reports a cycle on A→B, A→C→B; directed graphs need the three colours (or Kahn's algorithm in the next section). A second way to detect an undirected cycle, Union-Find, comes in section 08. Problem wording: "is there a cycle / loop", "deadlock", "can all tasks be finished" (a cycle means no), "eventual safe states" (nodes from which no path reaches a cycle), "is this a valid tree" (connected and no cycle).</p>

  <h2 id="dsa-gr-topo"><span class="num">07</span>Topological Sort</h2>
  <p>Cycle detection answers yes or no. When the arrows are rules and there is no cycle, we usually want more: an actual order in which to do everything. Each Biteful order goes through five steps with rules: accepting comes before assigning a rider and before cooking, cooking comes before packing, and both packing and the rider come before hand-over. In what order can the system run the steps so that no step starts before its prerequisites are done?</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600"><defs><marker id="dsa-gr-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="125" y1="98" x2="165" y2="55" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><line x1="125" y1="117" x2="165" y2="160" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><line x1="275" y1="47" x2="470" y2="98" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><line x1="275" y1="167" x2="315" y2="167" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><line x1="425" y1="160" x2="470" y2="118" stroke="currentColor" marker-end="url(#dsa-gr-a1)"/><rect x="15" y="90" width="110" height="34" rx="6" class="fg sg"/><text x="70" y="111" text-anchor="middle">accept (0)</text><rect x="165" y="30" width="110" height="34" rx="6" class="fb sb"/><text x="220" y="51" text-anchor="middle">rider (1)</text><rect x="165" y="150" width="110" height="34" rx="6" class="fb sb"/><text x="220" y="171" text-anchor="middle">cook (2)</text><rect x="315" y="150" width="110" height="34" rx="6" class="fb sb"/><text x="370" y="171" text-anchor="middle">pack (3)</text><rect x="470" y="90" width="115" height="34" rx="6" class="fv sb"/><text x="527" y="111" text-anchor="middle">hand over (4)</text><text x="70" y="142" class="tm" text-anchor="middle">in=0</text><text x="220" y="82" class="tm" text-anchor="middle">in=1</text><text x="220" y="202" class="tm" text-anchor="middle">in=1</text><text x="370" y="202" class="tm" text-anchor="middle">in=1</text><text x="527" y="142" class="tm" text-anchor="middle">in=2</text><text x="300" y="238" text-anchor="middle" class="tb">one valid order: accept, rider, cook, pack, hand over</text></svg><figcaption>Biteful's order pipeline as a DAG. An arrow u → v means "u must happen before v". "in" is each step's in-degree: how many steps must finish before it can start.</figcaption></figure>
  <p>An order of the nodes in which every arrow u → v has u before v is called a <strong>topological order</strong>, and finding one is <strong>topological sort</strong>. It exists only if the graph has no cycle (if "cook before pack" and "pack before cook" were both rules, nothing could go first), and there may be several valid orders. Getting dressed is a familiar example: socks before shoes, shirt before tie, but socks and shirt can come in either order.</p>
  <p>The most common method is <strong>Kahn's algorithm</strong>, which is a BFS on counts. For every step, count how many prerequisites it is still waiting for; this count is its <strong>in-degree</strong>, the number of arrows pointing into it. Any step with in-degree 0 can start now, so put all of them in a queue. Repeatedly take one out, "do" it (append it to the order), and decrease the in-degree of every step that was waiting for it; any step whose count drops to 0 has all its prerequisites done, so it joins the queue. Steps are numbered 0 to 4 as in the picture:</p>
  <div class="fx" data-lang="py">from collections import defaultdict, deque

steps = ["accept", "assign rider", "cook", "pack", "hand over"]   # Biteful's order pipeline
rules = [(0, 1), (0, 2), (1, 4), (2, 3), (3, 4)]                  # (u, v): u before v

def topo_kahn(n, edges):
    adj = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1                        # v waits for one more step
    q = deque(u for u in range(n) if indeg[u] == 0)
    order = []
    print(f"start  indeg={indeg}  queue={list(q)}")
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1                    # one prerequisite of v is done
            if indeg[v] == 0:
                q.append(v)
        print(f"pop {u}  indeg={indeg}  queue={list(q)}")
    return order if len(order) == n else []  # fewer than n: a cycle

print([steps[i] for i in topo_kahn(5, rules)])
print("with a loop:", topo_kahn(2, [(0, 1), (1, 0)]))</div>
  <div class="fx" data-lang="text">start  indeg=[0, 1, 1, 1, 2]  queue=[0]
pop 0  indeg=[0, 0, 0, 1, 2]  queue=[1, 2]
pop 1  indeg=[0, 0, 0, 1, 1]  queue=[2]
pop 2  indeg=[0, 0, 0, 0, 1]  queue=[3]
pop 3  indeg=[0, 0, 0, 0, 0]  queue=[4]
pop 4  indeg=[0, 0, 0, 0, 0]  queue=[]
['accept', 'assign rider', 'cook', 'pack', 'hand over']
start  indeg=[1, 1]  queue=[]
with a loop: []</div>
  <p>At the start only accept (0) has in-degree 0. Doing it lowers rider and cook to 0, so both join the queue. Rider lowers hand-over from 2 to 1, which is not yet 0. Cook frees pack, and pack lowers hand-over to 0, so it goes last. The second run shows the cycle check for free: with rules "0 before 1" and "1 before 0" both in-degrees start at 1, the queue starts empty, and nothing is output. If Kahn's algorithm outputs fewer than V nodes, the leftover nodes are stuck on a cycle.</p>
  <p>There is also a DFS version that reuses the three colours. When a node turns BLACK, everything that must come after it has already been finished, so appending nodes as they finish produces the order backwards; reversing that list gives a topological order:</p>
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
                return False             # edge into GREY: a cycle
            if color[v] == 0 and not dfs(v):
                return False
        color[u] = 2
        finished.append(u)               # everything after u is already finished
        return True

    for u in range(n):
        if color[u] == 0 and not dfs(u):
            return []
    print("finish order:", finished)
    return finished[::-1]

print("topo order:  ", topo_dfs(5, [(0, 1), (0, 2), (1, 4), (2, 3), (3, 4)]))</div>
  <div class="fx" data-lang="text">finish order: [4, 1, 3, 2, 0]
topo order:   [0, 2, 3, 1, 4]</div>
  <p>Hand-over (4) finishes first because nothing follows it; accept (0) finishes last. Reversed, the order is accept, cook, pack, rider, hand-over, which differs from Kahn's but is equally valid, because rider and the cook-pack chain are independent. For real code Python also has <code>graphlib</code> (3.9+), which takes each node's <em>prerequisites</em>, the opposite direction from an adjacency list:</p>
  <div class="fx" data-lang="py">from graphlib import TopologicalSorter, CycleError

# graphlib wants each step's PREREQUISITES, not its successors
ts = TopologicalSorter({"assign rider": ["accept"], "cook": ["accept"],
                        "pack": ["cook"], "hand over": ["assign rider", "pack"]})
print(list(ts.static_order()))
try:
    list(TopologicalSorter({"a": ["b"], "b": ["a"]}).static_order())
except CycleError as e:
    print("CycleError:", e.args[1])</div>
  <div class="fx" data-lang="text">['accept', 'assign rider', 'cook', 'pack', 'hand over']
CycleError: ['a', 'b', 'a']</div>
  <p><code>static_order()</code> returns the same pipeline order, and a circular rule raises <code>CycleError</code> listing the loop. In interviews you are expected to write Kahn's yourself, but mentioning <code>graphlib</code> shows you know the standard library. Both methods are <strong>O(V + E)</strong>. The most common bug is edge direction: in LeetCode's Course Schedule, the pair <code>[a, b]</code> means "take b before a", so the arrow goes from b to a; say the direction out loud before writing code. Problem wording: "prerequisites", "dependencies", "order of tasks", "build order", "course schedule", "recipe needs ingredients", "can all be finished".</p>

  <h2 id="dsa-gr-uf"><span class="num">08</span>Union-Find</h2>
  <p>Every tool so far takes the whole graph and walks it once. Now a different situation: a flood closed all of Biteful's roads, and they reopen one at a time: A–C, then B–D, B–C, F–G, A–B and D–E. After each reopening, dispatch asks "can Esha be reached from Rasoi yet?" and "did that road just close a loop?" Re-running DFS after every road costs O(V + E) each time. We need a structure that merges groups as edges arrive and answers "are these two in the same group?" almost instantly.</p>
  <p>That structure is <strong>Union-Find</strong>, also called a <strong>disjoint set union</strong> (DSU). Think of a village of joint families, each with one head, the mukhiya. "Are Ravi and Asha in the same family?" means: compare their mukhiyas. "These two families merge" means: one mukhiya now reports to the other. In code, every element has a <code>parent</code>, the person it reports to; a head reports to itself. <code>find(x)</code> follows parents up until it reaches the head. <code>union(a, b)</code> finds both heads; if they differ, it puts one head under the other, merging the groups. If they are the same, a and b were already connected, so the new edge closes a loop.</p>
  <p>Two small tricks keep this fast. Without them, the parent chains can grow long, and <code>find</code> becomes a slow walk. <strong>Path compression</strong>: after <code>find(x)</code> walks up to the head, point every node on that path straight at the head, so next time it is one hop. <strong>Union by rank</strong>: keep a rough height ("rank") for each group's tree and always put the shorter tree under the taller one, so trees never grow tall in the first place. The code replays the reopening roads:</p>
  <div class="fx" data-lang="py">class DSU:
    def __init__(self, names):
        self.parent = {x: x for x in names}   # everyone heads their own group
        self.rank = {x: 0 for x in names}     # rough height of each group's tree
        self.count = len(names)               # number of separate groups

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])   # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                      # already connected: this edge closes a loop
        if self.rank[ra] &lt; self.rank[rb]:
            ra, rb = rb, ra                   # ra = the taller tree
        self.parent[rb] = ra                  # short tree goes under the tall one
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.count -= 1
        return True

d = DSU("ABCDEFG")
for a, b in [("A", "C"), ("B", "D"), ("B", "C"), ("F", "G"), ("A", "B"), ("D", "E")]:
    merged = d.union(a, b)                    # roads reopen one by one
    print(f"open {a}-{b}: {'merged' if merged else 'LOOP  '} "
          f"parent={''.join(d.parent[x] for x in 'ABCDEFG')} groups={d.count}")
print("E reaches A?", d.find("E") == d.find("A"), "| F reaches A?", d.find("F") == d.find("A"))
print("before find(C):", "".join(d.parent[x] for x in "ABCDEFG"), " C -&gt; A -&gt; B, two hops")
d.find("C")                                   # walks C -&gt; A -&gt; B, then points C straight at B
print("after  find(C):", "".join(d.parent[x] for x in "ABCDEFG"), " C -&gt; B, one hop")</div>
  <div class="fx" data-lang="text">open A-C: merged parent=ABADEFG groups=6
open B-D: merged parent=ABABEFG groups=5
open B-C: merged parent=BBABEFG groups=4
open F-G: merged parent=BBABEFF groups=3
open A-B: LOOP   parent=BBABEFF groups=3
open D-E: merged parent=BBABBFF groups=2
E reaches A? True | F reaches A? False
before find(C): BBABBFF  C -&gt; A -&gt; B, two hops
after  find(C): BBBBBFF  C -&gt; B, one hop</div>
  <p>The parent string lists the parent of A to G in order. Opening A–C puts C under A; B–D puts D under B. Opening B–C finds heads B and A, both of rank 1, so A goes under B: now all four are one group. F–G makes a second group. Then A–B returns False: A's head and B's head are both B, so A and B were already connected through C, and this road closes the loop A–B–C. That is exactly the LeetCode problem "Redundant Connection". D–E puts E under B, leaving two groups, so Esha is reachable from Rasoi and Farah is not. The last two lines show path compression: C still pointed at A (two hops to the head), and a single <code>find("C")</code> re-pointed it straight at B.</p>
  <p>With both tricks, a sequence of m operations on n elements costs <strong>O(m · α(n))</strong>, where α is the inverse Ackermann function, which is at most 4 for any input that fits in the universe; in practice, each operation is O(1). Space is O(n). The limitation is that Union-Find only answers "same group?"; it cannot tell you the path between two nodes or how far apart they are. A common bug is linking the original nodes instead of their heads (<code>parent[a] = b</code> instead of <code>parent[find(a)] = find(b)</code>), which detaches a from its old group. Problem wording: "edges added one by one", "are they connected (yet)", "merge accounts / groups", "number of components as edges arrive", "redundant edge"; and Kruskal's algorithm in section 11 uses it internally.</p>

  <h2 id="dsa-gr-sp"><span class="num">09</span>Dijkstra's Algorithm</h2>
  <p>DFS, BFS and Union-Find all ignore the minutes on the roads. Dispatch really wants the quickest time from Rasoi to every customer, and BFS's ring order assumed every road costs the same. Here a route with more roads can be quicker: A → C → B → D takes 1 + 2 + 1 = 4 minutes, while BFS's A → B → D takes 5. We need to process places in order of <em>minutes</em> from the start, not road count. This is the <strong>single-source shortest path</strong> problem on a weighted graph.</p>
  <p>Imagine riders leaving Rasoi in every direction at once while you watch a clock. The first rider to arrive at a place fixes that place's quickest time; any rider arriving there later is simply slower. <strong>Dijkstra's algorithm</strong> simulates this. It keeps, for each place, the best time found so far, and a priority queue (a heap, from <a class="xref" data-note="dsa_heaps">Heaps</a>) of <code>(minutes, place)</code> pairs, which always hands back the smallest. Each step pops the closest place not yet settled. Its time is now final: any other route to it would have to pass through some place that is at least as far, and adding roads never makes a trip shorter as long as no road has a negative cost. Then it tries every road out of that place; if going through it gives a neighbour a quicker time than known so far, it records the new time and pushes it. That update step is called <strong>relaxing</strong> an edge.</p>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600"><line x1="60" y1="110" x2="200" y2="40" stroke="currentColor" stroke-dasharray="4 4"/><line x1="200" y1="180" x2="340" y2="110" stroke="currentColor" stroke-dasharray="4 4"/><line x1="60" y1="110" x2="200" y2="180" class="sg" stroke-width="3"/><line x1="200" y1="180" x2="200" y2="40" class="sg" stroke-width="3"/><line x1="200" y1="40" x2="340" y2="110" class="sg" stroke-width="3"/><line x1="340" y1="110" x2="480" y2="110" class="sg" stroke-width="3"/><text x="120" y="66" text-anchor="middle">4</text><text x="120" y="166" text-anchor="middle">1</text><text x="212" y="114">2</text><text x="282" y="66" text-anchor="middle">1</text><text x="282" y="166" text-anchor="middle">5</text><text x="410" y="102" text-anchor="middle">3</text><circle cx="60" cy="110" r="17" style="fill:var(--bg)"/><circle cx="60" cy="110" r="17" class="fg sg"/><text x="60" y="114" text-anchor="middle">A</text><circle cx="200" cy="40" r="17" style="fill:var(--bg)"/><circle cx="200" cy="40" r="17" class="fb sb"/><text x="200" y="44" text-anchor="middle">B</text><circle cx="200" cy="180" r="17" style="fill:var(--bg)"/><circle cx="200" cy="180" r="17" class="fb sb"/><text x="200" y="184" text-anchor="middle">C</text><circle cx="340" cy="110" r="17" style="fill:var(--bg)"/><circle cx="340" cy="110" r="17" class="fb sb"/><text x="340" y="114" text-anchor="middle">D</text><circle cx="480" cy="110" r="17" style="fill:var(--bg)"/><circle cx="480" cy="110" r="17" class="fb sb"/><text x="480" y="114" text-anchor="middle">E</text><text x="60" y="146" class="tg" text-anchor="middle">0</text><text x="226" y="44" class="tg">3</text><text x="226" y="184" class="tg">1</text><text x="340" y="146" class="tg" text-anchor="middle">4</text><text x="480" y="146" class="tg" text-anchor="middle">7</text><text x="300" y="226" text-anchor="middle" class="tb">settled in order: A 0 · C 1 · B 3 · D 4 · E 7</text></svg><figcaption>Dijkstra from Rasoi. The direct road A–B costs 4, but A → C → B costs 3, so Bakehouse settles at 3. Thick green roads form the quickest-route tree; dashed roads are never part of a quickest route.</figcaption></figure>
  <div class="fx" data-lang="py">import heapq
# wadj: the weighted adjacency list from section 02, place -&gt; [(neighbour, minutes)]

def dijkstra(src):
    dist = {src: 0}
    pq = [(0, src)]                       # heap of (minutes so far, place)
    while pq:
        d, u = heapq.heappop(pq)          # the closest place not yet settled
        if d &gt; dist[u]:                   # stale entry: a quicker one already won
            print(f"pop ({d},{u})  stale, skip")
            continue
        relaxed = []
        for v, w in wadj[u]:
            if d + w &lt; dist.get(v, float("inf")):
                dist[v] = d + w           # relax: found a quicker way to v
                heapq.heappush(pq, (d + w, v))
                relaxed.append(f"{v}={d + w}")
        print(f"pop ({d},{u})  relax {', '.join(relaxed) or '-':10} heap={sorted(pq)}")
    return dist

print(dijkstra("A"))</div>
  <div class="fx" data-lang="text">pop (0,A)  relax B=4, C=1   heap=[(1, 'C'), (4, 'B')]
pop (1,C)  relax B=3, D=6   heap=[(3, 'B'), (4, 'B'), (6, 'D')]
pop (3,B)  relax D=4        heap=[(4, 'B'), (4, 'D'), (6, 'D')]
pop (4,B)  stale, skip
pop (4,D)  relax E=7        heap=[(6, 'D'), (7, 'E')]
pop (6,D)  stale, skip
pop (7,E)  relax -          heap=[]
{'A': 0, 'B': 3, 'C': 1, 'D': 4, 'E': 7}</div>
  <p>Follow the heap. Popping A (0) gives B 4 and C 1. Popping C (1), the closest, improves B to 1 + 2 = 3 and gives D 1 + 5 = 6. Popping B (3) improves D to 3 + 1 = 4. Next the heap hands back <code>(4, B)</code>, the old entry from before B improved; since 4 is more than B's best of 3, it is <strong>stale</strong> and skipped. Python's <code>heapq</code> cannot change an entry's priority in place, so instead of updating we push a new entry and discard old ones when they surface; this is called lazy deletion. Popping D (4) gives E 7, the stale <code>(6, D)</code> is skipped, and E settles at 7. Dhruv's 4 minutes via A–C–B–D matches the quickest row of the hand-made table in section 01.</p>
  <p>The one rule that separates Dijkstra from BFS is <em>when</em> a distance becomes final. BFS marks a place when it is added to the queue. Dijkstra must not: if B were treated as final when it was first pushed at 4, the 3-minute route through C would be ignored. A distance is final only when it comes off the heap. With a binary heap the cost is <strong>O((V + E) log V) time</strong> (each relaxation may push once, at O(log) cost) and <strong>O(V + E) space</strong>, counting the stale entries. Problem wording: "cheapest", "fastest", "minimum cost / time / effort" with non-negative weights, "network delay" (Dijkstra from the source, answer = the largest distance), "path with maximum probability" (a max-heap of products). If every edge costs the same, use BFS instead; the heap only adds a log factor.</p>

  <h2 id="dsa-gr-bf"><span class="num">10</span>Bellman-Ford</h2>
  <p>Dijkstra's promise, "popped means final", depends on edges never having negative cost. Biteful pays riders a pickup bonus on some legs, so a leg's net cost to the company is fuel minus bonus, and on one leg the bonus is bigger than the fuel: the leg C→B costs −3. Now a place that looked settled can become cheaper later. Here are four one-way legs: A→B 4, A→C 5, C→B −3, B→D 2. The cheapest way to B is A→C→B, 5 − 3 = 2, and to D is 2 + 2 = 4. Watch what a Dijkstra that trusts "popped means final" does with them:</p>
  <div class="fx" data-lang="py">import heapq
from collections import defaultdict

def dijkstra_settle_once(edges, src):      # a place is final the first time it is popped
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
  <p>It pops B at 4 (before C, which costs 5), declares B final, and later refuses the cheaper 5 − 3 = 2. D inherits the mistake and ends at 6 instead of 4. A single negative edge breaks the method.</p>
  <p><strong>Bellman-Ford</strong> fixes this by giving up on "final" altogether. It simply relaxes <strong>every</strong> edge, over and over, V − 1 times. Why V − 1? A cheapest route that does not repeat places uses at most V − 1 edges, and after round i, every cheapest route that uses at most i edges has been found, because each round extends the known routes by one more edge. No heap and no settling, so negative edges are fine. The legs are given to it in an unhelpful order to show that the order does not matter:</p>
  <div class="fx" data-lang="py">def bellman_ford(nodes, edges, src):
    INF = float("inf")
    dist = {u: INF for u in nodes}
    dist[src] = 0
    for rnd in range(1, len(nodes)):           # a cheapest path has at most V-1 edges
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w &lt; dist[v]:
                dist[v] = dist[u] + w          # relax every edge, every round
                changed = True
        print(f"round {rnd}: {dist}")
        if not changed:
            break                              # nothing improved: finished early
    for u, v, w in edges:                      # one extra check: still improving?
        if dist[u] != INF and dist[u] + w &lt; dist[v]:
            return None                        # yes: a negative cycle
    return dist

# net cost of a leg = fuel minus pickup bonus; C-&gt;B carries a big bonus: -3
legs = [("B", "D", 2), ("C", "B", -3), ("A", "C", 5), ("A", "B", 4)]
print(bellman_ford("ABCD", legs, "A"))
print(bellman_ford("ABC", [("A", "B", 1), ("B", "C", -2), ("C", "B", 1)], "A"))</div>
  <div class="fx" data-lang="text">round 1: {'A': 0, 'B': 4, 'C': 5, 'D': inf}
round 2: {'A': 0, 'B': 2, 'C': 5, 'D': 6}
round 3: {'A': 0, 'B': 2, 'C': 5, 'D': 4}
{'A': 0, 'B': 2, 'C': 5, 'D': 4}
round 1: {'A': 0, 'B': 0, 'C': -1}
round 2: {'A': 0, 'B': -1, 'C': -2}
None</div>
  <p>In round 1 only edges leaving A can do anything, giving B 4 and C 5 (the B→D and C→B edges came first in the list, when B and C were still unknown). Round 2 uses C→B: 5 − 3 = 2 beats 4, and B→D gives D 6 from the old B. Round 3 updates D through the new B to 4. The answers match the hand calculation. The second graph contains a loop B → C → B whose total cost is −2 + 1 = −1, so going round it again and again makes costs fall forever; such a loop is called a <strong>negative cycle</strong>, and with one present "cheapest" has no answer. The extra check after the V − 1 rounds catches it: if any edge can still be relaxed, there must be a negative cycle, so the function returns None.</p>
  <p>Bellman-Ford costs <strong>O(V · E) time and O(V) space</strong>, much slower than Dijkstra, so use it only when you need it. The idea "cheapest cost using at most i edges, built from the answers for i − 1 edges" is dynamic programming (see <a class="xref" data-note="dsa_dp">Dynamic Programming</a>), and it gives Bellman-Ford a second use: limiting the number of edges. LeetCode's "Cheapest Flights Within K Stops" asks for the cheapest route with at most k stops, that is k + 1 flights, which is just k + 1 rounds. One change is essential: each round must read from a copy of the previous round's costs, otherwise one round could chain two flights and break the limit:</p>
  <div class="fx" data-lang="py">def cheapest_price(n, flights, src, dst, k):
    INF = float("inf")
    cost = [INF] * n
    cost[src] = 0
    for _ in range(k + 1):              # k stops = at most k + 1 flights
        new = cost[:]                   # read last round, write this round
        for u, v, p in flights:
            if cost[u] != INF and cost[u] + p &lt; new[v]:
                new[v] = cost[u] + p
        cost = new
    return -1 if cost[dst] == INF else cost[dst]

flights = [[0, 1, 100], [1, 2, 100], [2, 3, 100], [0, 2, 500], [1, 3, 600]]
print(cheapest_price(4, flights, 0, 3, 1), cheapest_price(4, flights, 0, 3, 2))</div>
  <div class="fx" data-lang="text">600 300</div>
  <p>With at most one stop the best price from city 0 to 3 is 600 (0 → 1 → 3); allowing two stops opens 0 → 1 → 2 → 3 for 300. Without the copy, the first round could already use 0 → 1 and then 1 → 2 in the same pass. This table summarises which shortest-path tool fits which situation:</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Use</th><th>Time</th></tr>
    <tr><td>Every edge costs the same</td><td>BFS</td><td>O(V + E)</td></tr>
    <tr><td>Edge costs are only 0 or 1</td><td>0-1 BFS: a deque, cost-0 edges to the front, cost-1 to the back</td><td>O(V + E)</td></tr>
    <tr><td>Non-negative weights</td><td>Dijkstra</td><td>O((V + E) log V)</td></tr>
    <tr><td>Negative edges, or "at most k edges"</td><td>Bellman-Ford</td><td>O(V · E), or O(k · E)</td></tr>
    <tr><td>DAG with any weights</td><td>relax edges in topological order</td><td>O(V + E)</td></tr>
    <tr><td>All pairs, small V (a few hundred)</td><td>Floyd-Warshall: triple loop over a matrix</td><td>O(V³)</td></tr>
  </table>

  <h2 id="dsa-gr-mst"><span class="num">11</span>Minimum Spanning Tree</h2>
  <p>Shortest paths answer "quickest from Rasoi to each place". Biteful's next question has no starting point at all: the city will paint bike lanes on some roads, and every place in the main area must be connected to every other by lanes, using the fewest total kilometres (assume the road lengths in km equal the minutes on the map). A loop of lanes is wasted, because dropping any one lane of the loop still leaves everyone connected, so the answer contains no cycle: it is a tree that touches every node, with exactly V − 1 edges. Such a tree is a <strong>spanning tree</strong>, and the one with the smallest total weight is the <strong>minimum spanning tree</strong> (MST).</p>
  <p>The MST is not the same as Dijkstra's quickest-route tree. Dijkstra minimises each place's distance from one source; the MST minimises the sum of all chosen edges, with no source at all. Laying cable to connect offices, or pipes to connect houses, are MST problems; routing one delivery is a shortest-path problem.</p>
  <p><strong>Kruskal's algorithm</strong> builds the MST greedily: sort all edges from cheapest to most expensive, and take each edge unless it would close a loop with the edges already taken. "Would it close a loop?" is exactly what Union-Find answers: if both ends already have the same head, they are already connected. Stop after V − 1 edges.</p>
  <div class="fx" data-lang="py">roads = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2), ("B", "D", 1), ("C", "D", 5), ("D", "E", 3)]

def kruskal(nodes, edges):
    parent = {x: x for x in nodes}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]               # path halving, no recursion
            x = parent[x]
        return x
    total, used = 0, []
    for u, v, w in sorted(edges, key=lambda e: e[2]):   # cheapest road first
        ru, rv = find(u), find(v)
        if ru != rv:                                    # joins two groups: take it
            parent[ru] = rv
            total += w
            used.append(f"{u}-{v}")
            print(f"{u}-{v} {w}: take   total={total}")
        else:
            print(f"{u}-{v} {w}: skip   (already connected, would close a loop)")
    return total, used

print(kruskal("ABCDE", roads))</div>
  <div class="fx" data-lang="text">A-C 1: take   total=1
B-D 1: take   total=2
B-C 2: take   total=4
D-E 3: take   total=7
A-B 4: skip   (already connected, would close a loop)
C-D 5: skip   (already connected, would close a loop)
(7, ['A-C', 'B-D', 'B-C', 'D-E'])</div>
  <p>The two 1 km roads, A–C and B–D, join four places into two pairs. B–C (2) joins the pairs. D–E (3) brings in Esha, making four lanes for five places, total 7 km. A–B (4) and C–D (5) are skipped because their ends are already connected; either would close a loop. Why is greed safe here? Split the nodes into any two groups; the cheapest edge crossing between them must be in some MST, because if it were not, swapping it in for a more expensive crossing edge would give a cheaper tree. Kruskal only ever takes such an edge. Its cost is <strong>O(E log E)</strong>, dominated by the sort.</p>
  <p><strong>Prim's algorithm</strong> reaches the same total from a different angle: start from any node and grow a single tree, each time adding the cheapest edge that leaves the tree, found with a heap. It looks like Dijkstra, with one crucial difference: the heap is keyed on the single edge's weight <code>w</code>, not on the total distance <code>dist + w</code>. Mixing the two up is the classic bug.</p>
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
        w, u = heapq.heappop(pq)      # cheapest road leaving the tree (just w, not dist + w)
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
  <p>Prim also finds 7 km. Choose Kruskal when you are given an edge list and the graph is sparse; choose Prim, <strong>O(E log V)</strong>, for an adjacency list or a dense graph, such as "connect all points" problems where every pair of points is a possible edge. An MST only exists for a connected undirected graph: the whole city including F and G has no spanning tree, only a spanning forest, so check that Kruskal took V − 1 edges. Problem wording: "connect all cities / points / houses with minimum total cost", "minimum cable", "cheapest network".</p>

  <h2 id="dsa-gr-bip"><span class="num">12</span>Bipartite Graphs</h2>
  <p>One structural question remains. Biteful keeps a second graph, "who has delivered to whom": restaurant A has delivered to customers D and E, restaurant B to D and F. Every edge joins a restaurant to a customer, never two restaurants or two customers. A graph whose nodes can be split into two sides so that every edge crosses from one side to the other is called <strong>bipartite</strong>. Given only the edges, can we find such a split, or prove there is none?</p>
  <p>Think of a school picnic with two buses, where certain pairs of students must not ride together. Put the first student on bus 0. Everyone they clash with must go on bus 1; everyone those students clash with must go on bus 0, and so on. If at some point two students who clash are forced onto the same bus, no seating plan works. In graph terms this is <strong>2-colouring</strong> with BFS: colour the start 0, give every uncoloured neighbour the opposite colour, and fail if an edge ever joins two nodes of the same colour. The graph may be in several pieces, so restart from every uncoloured node:</p>
  <div class="fx" data-lang="py">from collections import deque, defaultdict

def is_bipartite(nodes, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    color = {}
    for s in nodes:                          # the graph may be in several pieces
        if s in color:
            continue
        color[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if v not in color:
                    color[v] = 1 - color[u]  # the opposite side
                    q.append(v)
                elif color[v] == color[u]:
                    print(f"  {u}-{v}: both on side {color[u]}")
                    return False
    print("  sides:", color)
    return True

orders = [("A", "D"), ("A", "E"), ("B", "D"), ("B", "F")]     # restaurant -- customer
print("orders graph:", is_bipartite("ABDEF", orders))
city = [("A", "B"), ("A", "C"), ("B", "C"), ("B", "D"), ("C", "D"), ("D", "E")]
print("road graph:", is_bipartite("ABCDE", city))</div>
  <div class="fx" data-lang="text">  sides: {'A': 0, 'D': 1, 'E': 1, 'B': 0, 'F': 1}
orders graph: True
  B-C: both on side 1
road graph: False</div>
  <p>The orders graph colours cleanly: A and B on side 0, D, E and F on side 1, which is the restaurant/customer split. The road graph fails at once: A is 0, so B and C must both be 1, but B–C is a road joining two nodes of colour 1. The reason is the triangle A–B–C. In general, a graph is bipartite exactly when it has <strong>no cycle of odd length</strong>: going round a cycle the colours alternate 0, 1, 0, 1, …, which only returns to the starting colour after an even number of steps. A square works; a triangle cannot.</p>
  <p>The check costs <strong>O(V + E)</strong>. The common bug is colouring only from node 0, which misses an odd cycle hiding in another component; the loop over all nodes fixes that. Problem wording: "split into two groups", "two teams", "possible bipartition" (build the graph from the "dislikes" pairs first), "no two adjacent nodes have the same colour", or matching two kinds of things, such as riders to orders.</p>

  <h2 id="dsa-gr-patterns"><span class="num">13</span>Choosing the Pattern</h2>
  <p>Most graph problems never say "graph". They talk about islands, courses, words, locks or flights, and the hardest step is usually the first one: deciding what the nodes and edges are. Once you can say "node = …, edge = …", the algorithm is mostly a template. Then three questions narrow the choice: is the graph directed or undirected? Are the edges weighted, and can weights be negative? And what is being asked: reachability, fewest steps, an order, groups, cheapest route, connect everything, or two sides?</p>
  <p>It also helps to see that DFS and BFS are one loop with a different container. Take a place out, record it, put its unseen neighbours in. If the container hands back the newest place (a stack), the walk goes deep; if it hands back the oldest (a queue), the walk goes in rings; Dijkstra is the same loop with a heap that hands back the closest place. This skeleton shows the first two on the city:</p>
  <div class="fx" data-lang="py">from collections import deque
# adj: the unweighted adjacency list of the city

def walk(start, take):
    """Take a place out of the box, record it, put its unseen neighbours in."""
    box, seen, order = deque([start]), {start}, []
    while box:
        u = take(box)
        order.append(u)
        for v in adj[u]:
            if v not in seen:
                seen.add(v)
                box.append(v)
    return order

print("take newest (stack):", walk("A", deque.pop))
print("take oldest (queue):", walk("A", deque.popleft))</div>
  <div class="fx" data-lang="text">take newest (stack): ['A', 'C', 'D', 'E', 'B']
take oldest (queue): ['A', 'B', 'C', 'D', 'E']</div>
  <p>The queue gives the BFS rings A, B, C, D, E. The stack goes deep, visiting A, C, D, E, B, which differs from the recursive DFS order of section 03 because this skeleton marks places when they are added rather than when they are entered; for reachability and counting components the order does not matter, and both reach the same five places. Naming the nodes is the real skill. In "Word Ladder" (turn "hit" into "cog" one letter at a time, every word in a dictionary), the nodes are words and an edge joins words that differ in one letter; "fewest changes" means BFS. Comparing every pair of words is slow, so each word is filed under patterns with one letter blanked out, and words sharing a pattern are neighbours:</p>
  <div class="fx" data-lang="py">from collections import deque, defaultdict

def ladder_length(begin, end, word_list):
    words = set(word_list)
    if end not in words:
        return 0
    buckets = defaultdict(list)          # "h*t" -&gt; every word matching that pattern
    for w in words | {begin}:
        for i in range(len(w)):
            buckets[w[:i] + "*" + w[i+1:]].append(w)
    q, seen = deque([(begin, 1)]), {begin}
    while q:
        w, steps = q.popleft()
        if w == end:
            return steps
        for i in range(len(w)):
            key = w[:i] + "*" + w[i+1:]
            for nxt in buckets[key]:     # neighbours: differ in exactly one letter
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, steps + 1))
            buckets[key] = []            # bucket fully used: never scan it again
    return 0

print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]))
print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log"]))</div>
  <div class="fx" data-lang="text">5
0</div>
  <p>hit → hot → dot → dog → cog is five words. Without "cog" in the dictionary there is no chain, so the answer is 0. Building the buckets costs O(N · L²) for N words of length L, much cheaper than comparing all pairs. The same move, "the nodes are states", appears in "Open the Lock" (nodes are four-digit codes, edges are single wheel turns) and in many puzzle problems. The table maps the trigger words in a problem to the pattern and its cost:</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Pattern</th><th>Cost</th></tr>
    <tr><td>"can reach", "is there a path", "connected", "provinces", "islands", "flood fill", "clone"</td><td>DFS or BFS from every unvisited node; count the starts</td><td>O(V + E)</td></tr>
    <tr><td>"minimum steps / moves / transformations", every step equal</td><td>BFS (with a parent map for the path)</td><td>O(V + E)</td></tr>
    <tr><td>"spreads every minute", "nearest X from every cell"</td><td>multi-source BFS</td><td>O(V + E)</td></tr>
    <tr><td>"cycle", "deadlock", "safe states", "valid tree"</td><td>parent check (undirected), three colours (directed)</td><td>O(V + E)</td></tr>
    <tr><td>"prerequisites", "dependencies", "order of tasks", "can all finish"</td><td>topological sort (Kahn)</td><td>O(V + E)</td></tr>
    <tr><td>"edges added one by one", "connected yet", "merge groups", "redundant edge"</td><td>Union-Find</td><td>≈ O(1) per operation</td></tr>
    <tr><td>"cheapest / fastest / minimum cost", weights ≥ 0</td><td>Dijkstra</td><td>O((V + E) log V)</td></tr>
    <tr><td>"negative costs", "at most k stops / edges"</td><td>Bellman-Ford (k rounds, with a copy)</td><td>O(V · E)</td></tr>
    <tr><td>"connect all with minimum total cost"</td><td>MST: Kruskal or Prim</td><td>O(E log E)</td></tr>
    <tr><td>"two groups", "no two adjacent the same"</td><td>bipartite 2-colouring</td><td>O(V + E)</td></tr>
    <tr><td>"use every edge exactly once", "itinerary"</td><td>Eulerian path (Hierholzer: DFS, add node on the way back)</td><td>O(E)</td></tr>
    <tr><td>"critical connection", "which edge disconnects"</td><td>bridges (Tarjan: DFS with discovery times and low-links)</td><td>O(V + E)</td></tr>
  </table>
  <p>To practise, work through the Graphs list in the <a class="xref" data-note="dsa_problems">Problem Tracker</a> in this order. Start with storage and degrees (Find Center of Star Graph, Find the Town Judge), then plain DFS and BFS (Find if Path Exists, Number of Provinces, Keys and Rooms), then grids (Flood Fill, Number of Islands, Max Area of Island, Rotting Oranges, 01 Matrix). Then the structural tools: Course Schedule I and II (topological sort, and the edge direction trap), Redundant Connection and Accounts Merge (Union-Find), Is Graph Bipartite and Possible Bipartition. Then weighted graphs: Network Delay Time and Path With Minimum Effort (Dijkstra), Cheapest Flights Within K Stops (k-round Bellman-Ford), Min Cost to Connect All Points (Prim). Finish with Clone Graph, Word Ladder, Reconstruct Itinerary and Critical Connections, which each need one extra idea.</p>

  <h2 id="dsa-gr-traps"><span class="num">14</span>Common Mistakes</h2>
  <p>The most common graph bug is marking places at the wrong moment. Without any visited set, a walk on the city goes round A–B–C forever. With a visited set that is only updated when a place is taken out of the queue, the walk terminates, but the same place can be added many times before it is first taken out:</p>
  <div class="fx" data-lang="py">from collections import deque
# adj: the unweighted adjacency list of the city

def bfs_mark_on_pop(src):                # the mistake
    seen, q, pushes = set(), deque([src]), []
    while q:
        u = q.popleft()
        if u in seen:
            continue
        seen.add(u)                      # marked only when it comes out
        for v in adj[u]:
            if v not in seen:
                q.append(v)
                pushes.append(v)
    return pushes

def bfs_mark_on_push(src):               # the fix
    seen, q, pushes = {src}, deque([src]), []
    while q:
        u = q.popleft()
        for v in adj[u]:
            if v not in seen:
                seen.add(v)              # marked the moment it is queued
                q.append(v)
                pushes.append(v)
    return pushes

print("mark on pop :", bfs_mark_on_pop("A"))
print("mark on push:", bfs_mark_on_push("A"))</div>
  <div class="fx" data-lang="text">mark on pop : ['B', 'C', 'C', 'D', 'D', 'E']
mark on push: ['B', 'C', 'D', 'E']</div>
  <p>Marking on pop queued C twice (by A and by B) and D twice (by B and by C); on a dense graph the queue can grow to O(E) entries instead of O(V). Marking when a place is added queues each place exactly once. The rule: in BFS and iterative DFS, mark when you add; in recursive DFS, mark as the first line of the function. Dijkstra is the exception: there a distance becomes final only when it is popped, and the stale-entry check handles the duplicates.</p>
  <p>The second mistake is storing an undirected graph one way only. If the problem says "bidirectional", "undirected" or "friends", both <code>adj[u].append(v)</code> and <code>adj[v].append(u)</code> are needed; with only one, half the graph is silently unreachable. The mirror-image mistake is reversing a directed edge: in Course Schedule, <code>[a, b]</code> means b before a, so the arrow goes b → a. Write the direction as a comment on the line that builds the list.</p>
  <p>Third, forgetting nodes that have no edges, or nodes in other components. A <code>defaultdict</code> built from the edge list does not contain isolated nodes, so loop over <code>range(n)</code> or the full node list when counting components, colouring, or sorting; F and G only appeared in section 03 because the loop covered "ABCDEFG". Reading <code>adj[x]</code> on a <code>defaultdict</code> to "check" a node also silently adds it; use <code>adj.get(x, [])</code> when only looking.</p>
  <p>Fourth, using the wrong shortest-path tool: BFS on weighted roads (it says A–B–D, 5 minutes, instead of A–C–B–D, 4), Dijkstra with a negative edge (D = 6 instead of 4), or Bellman-Ford with a stop limit but without copying the costs each round. Match the tool to the weights. Related: using <code>list.pop(0)</code> as a queue, which is O(n) per pop, or a list as the visited collection, which makes every "seen?" check O(V); both quietly turn an O(V + E) algorithm into O(V²).</p>
  <p>Finally, recursion depth: a recursive DFS on a large grid or a long chain exceeds Python's limit of about 1,000 frames. <code>sys.setrecursionlimit</code> sometimes helps but can crash the interpreter; an explicit stack or BFS is the safe choice for big inputs.</p>

  <h2 id="dsa-gr-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Graph</b>: nodes (V) and edges (E). <b>Directed</b> edges are one-way; <b>weighted</b> edges carry a number.</li>
    <li><b>Degree</b>: edges touching a node. <b>In-degree</b>: arrows into a node.</li>
    <li><b>Path / cycle</b>: a route; a route that returns to its start. <b>DAG</b>: directed, no cycles.</li>
    <li><b>Connected component</b>: a largest group in which everyone reaches everyone.</li>
    <li><b>Tree</b>: connected, no cycles, exactly V − 1 edges.</li>
    <li><b>Adjacency list</b>: node → its neighbours (and weights). Default storage.</li>
    <li><b>Relax an edge</b>: if going through u gives v a cheaper cost, update v.</li>
    <li><b>Topological order</b>: every arrow u → v has u before v; exists only for a DAG.</li>
    <li><b>Union-Find</b>: groups as trees with a head; find + union, ≈ O(1).</li>
    <li><b>Spanning tree / MST</b>: V − 1 edges connecting everything; the one with least total weight.</li>
    <li><b>Bipartite</b>: nodes split into two sides with every edge crossing; no odd cycle.</li>
  </ul>
  <h3>Algorithms and costs</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Rule in one line</th><th>Time</th></tr>
    <tr><td>DFS</td><td>mark u; for each unvisited neighbour, DFS it (or a stack)</td><td>O(V + E)</td></tr>
    <tr><td>BFS</td><td>deque; dist[v] = dist[u] + 1 when first seen; mark on push</td><td>O(V + E)</td></tr>
    <tr><td>Multi-source BFS</td><td>all sources in the queue at distance 0</td><td>O(V + E)</td></tr>
    <tr><td>Undirected cycle</td><td>visited neighbour that is not the parent</td><td>O(V + E)</td></tr>
    <tr><td>Directed cycle</td><td>edge into a GREY node (white → grey → black)</td><td>O(V + E)</td></tr>
    <tr><td>Kahn's topological sort</td><td>queue in-degree 0; pop, decrement; output &lt; V ⇒ cycle</td><td>O(V + E)</td></tr>
    <tr><td>Union-Find</td><td>path compression + union by rank; same head ⇒ loop</td><td>≈ O(1) each</td></tr>
    <tr><td>Dijkstra</td><td>heap; pop min, skip stale; relax; final on pop; w ≥ 0</td><td>O((V + E) log V)</td></tr>
    <tr><td>Bellman-Ford</td><td>relax all edges V − 1 times; still improving ⇒ negative cycle</td><td>O(V · E)</td></tr>
    <tr><td>Kruskal</td><td>sort edges; take if find(u) ≠ find(v)</td><td>O(E log E)</td></tr>
    <tr><td>Prim</td><td>heap of edges leaving the tree, keyed on w alone</td><td>O(E log V)</td></tr>
    <tr><td>Bipartite</td><td>colour[v] = 1 − colour[u]; same colour on an edge ⇒ no</td><td>O(V + E)</td></tr>
  </table>
  <h3>The city's numbers</h3>
  <table class="tbl">
    <tr><th>From A</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F, G</th></tr>
    <tr><td>BFS roads</td><td>0</td><td>1</td><td>1</td><td>2</td><td>3</td><td>unreachable</td></tr>
    <tr><td>Dijkstra minutes</td><td>0</td><td>3</td><td>1</td><td>4</td><td>7</td><td>unreachable</td></tr>
  </table>
  <p>Components {A, B, C, D, E} and {F, G}; loops A–B–C and B–C–D; MST A–C, B–D, B–C, D–E = 7; not bipartite (triangle A–B–C); reopening A–B is the redundant road.</p>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from collections import defaultdict, deque
import heapq

adj = defaultdict(list)
for u, v, w in edges:
    adj[u].append((v, w))
    adj[v].append((u, w))                 # undirected: both ways

def bfs(src):                             # fewest edges
    dist, q = {src: 0}, deque([src])
    while q:
        u = q.popleft()
        for v, _ in adj[u]:
            if v not in dist:             # mark on push
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def dijkstra(src):                        # least total weight, w &gt;= 0
    dist, pq = {src: 0}, [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d &gt; dist[u]:
            continue                      # stale entry
        for v, w in adj[u]:
            if d + w &lt; dist.get(v, float("inf")):
                dist[v] = d + w
                heapq.heappush(pq, (d + w, v))
    return dist</div>
  <h3>Gotchas</h3>
  <ul>
    <li>No visited set → infinite loop. Mark on push (BFS/DFS); final on pop (Dijkstra).</li>
    <li>Undirected graph stored one way → half the graph unreachable.</li>
    <li>Loop over all nodes, not <code>adj</code>, or isolated nodes and other components are missed.</li>
    <li>"[a, b] = b before a" → the arrow is b → a.</li>
    <li>BFS on weights, Dijkstra on negatives, Bellman-Ford with a stop limit but no copy: all wrong.</li>
    <li>Prim's heap key is w, not dist + w.</li>
    <li><code>deque.popleft()</code>, never <code>list.pop(0)</code>; a set for visited, never a list.</li>
  </ul>

  <h2 id="dsa-gr-qa"><span class="num">15</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a graph, and how is it different from a tree?</summary><div class="qa-body">A graph is a set of nodes and a set of edges joining pairs of nodes; edges may be directed or undirected, weighted or not. A tree is a special graph that is connected and has no cycles, so it has exactly V − 1 edges and one route between any two nodes. General graphs can have loops and several routes, which is why graph walks need a visited set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Adjacency list or adjacency matrix: which would you use and why?</summary><div class="qa-body">An adjacency list by default: it takes O(V + E) space and listing a node's neighbours costs only its degree, which suits sparse real-world graphs. A matrix takes O(V²) space and answers "is u–v an edge?" in O(1); it suits small dense graphs or all-pairs algorithms like Floyd-Warshall.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time complexity of BFS and DFS, and why?</summary><div class="qa-body">O(V + E). Each node is marked once, so it is processed once, and each edge is examined once from each end (twice for undirected), which is still O(E). On an R × C grid that is O(R × C). Extra space is O(V) for the visited set and the queue or stack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does BFS find shortest paths in an unweighted graph but DFS does not?</summary><div class="qa-body">BFS's queue processes every node at distance d before any node at distance d + 1, so the first time a node is reached is along a fewest-edges route. DFS follows one branch as deep as it can and may reach a node through a detour first. The guarantee only holds when all edges cost the same.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should a node be marked visited in BFS, and when is a distance final in Dijkstra?</summary><div class="qa-body">In BFS, mark a node when it is added to the queue, so no node is queued twice. In Dijkstra a node may be pushed several times with improving distances; its distance is final only when it is popped from the heap, and older (stale) entries are skipped when they surface.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you count connected components?</summary><div class="qa-body">Loop over every node; whenever one is unvisited, increase the count and run DFS or BFS from it to mark its whole component. The number of starts is the number of components, in O(V + E). Alternatively start with n groups in Union-Find and subtract one for every union that merges two groups, which also works when edges arrive over time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect a cycle in an undirected graph versus a directed graph?</summary><div class="qa-body">Undirected: run DFS remembering the parent; a visited neighbour that is not the parent means a cycle (or Union-Find finds an edge whose ends already share a head). Directed: DFS with three colours; an edge into a GREY node, one still on the current path, is a cycle. Kahn's algorithm also detects it by outputting fewer than V nodes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a topological sort and how does Kahn's algorithm work?</summary><div class="qa-body">A topological order lists the nodes of a directed graph so every edge u → v has u before v; it exists only if the graph has no cycle. Kahn's algorithm computes in-degrees, queues every node with in-degree 0, and repeatedly pops a node, outputs it and decrements its successors' in-degrees, queueing any that reach 0. O(V + E); fewer than V nodes output means a cycle.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Union-Find, and what makes it fast?</summary><div class="qa-body">A structure that keeps disjoint groups as trees, each with a head. find follows parents to the head; union attaches one head under another. Path compression points every node on a find path straight at the head, and union by rank attaches the shorter tree under the taller; together each operation costs O(α(n)), effectively constant.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose Union-Find over DFS?</summary><div class="qa-body">When edges arrive over time and you must answer "are these connected?" or "does this edge close a loop?" after each one; DFS would need a fresh O(V + E) walk each time. Also inside Kruskal's algorithm. DFS is better when you need actual paths, distances or the order of a traversal, which Union-Find cannot give.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Dijkstra's algorithm work, and what is its complexity?</summary><div class="qa-body">It keeps a best-known distance per node and a min-heap of (distance, node). It repeatedly pops the closest unsettled node, which is now final, and relaxes its edges, pushing any improved neighbours. With a binary heap it runs in O((V + E) log V) time and O(V + E) space including stale heap entries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't Dijkstra handle negative edge weights?</summary><div class="qa-body">It treats a node as final when popped, assuming any other route must be at least as long because extra edges only add cost. A negative edge found later can make an already-final node cheaper, and every distance computed from it is then wrong. Bellman-Ford handles negative edges and also detects negative cycles.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Bellman-Ford work, and how does it detect a negative cycle?</summary><div class="qa-body">It relaxes every edge V − 1 times; after round i, every cheapest route using at most i edges is correct, and a cheapest simple route has at most V − 1 edges. If one more round can still improve a distance, some route keeps getting cheaper, which means a reachable negative cycle. It costs O(V · E).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For "cheapest flight with at most k stops", why not plain Dijkstra, and why copy the array?</summary><div class="qa-body">Dijkstra keeps only the cheapest way into each city, which may use too many stops, so it can discard a slightly dearer route that respects the limit. Bellman-Ford with k + 1 rounds counts edges exactly. Each round must read from a copy of the previous round's costs; updating in place could chain two flights in one round and exceed the limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a minimum spanning tree? Kruskal or Prim?</summary><div class="qa-body">A set of V − 1 edges that connects all nodes of a connected undirected graph with the least total weight. Kruskal sorts edges and takes each one that joins two different Union-Find groups, O(E log E), and suits sparse graphs given as edge lists. Prim grows one tree from a start using a heap of edges leaving it, O(E log V), and suits dense graphs; both give the same total.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is an MST different from a shortest-path tree?</summary><div class="qa-body">The MST minimises the total weight of all chosen edges, with no source node. A shortest-path tree, as built by Dijkstra, minimises each node's distance from one particular source. They can differ: an MST may route a node through a long chain of cheap edges that would be a slow route from the source.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a graph bipartite and how do you check it?</summary><div class="qa-body">Exactly when it has no odd-length cycle. Check with BFS 2-colouring: colour the start 0 and every neighbour the opposite colour; if an edge ever joins two nodes of the same colour, it is not bipartite. Restart from every uncoloured node to cover all components; O(V + E).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>DFS, BFS and Dijkstra look almost the same. What is the real difference?</summary><div class="qa-body">The container that decides which node to process next: a stack (newest first) goes deep, a queue (oldest first) goes in rings by edge count, and a heap keyed on distance goes in order of total weight. The rest of the loop (take a node, look at its neighbours, add the useful ones) is the same.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you approach Word Ladder, and what is the cost?</summary><div class="qa-body">Model words as nodes and connect words that differ in one letter; "fewest changes" with equal costs means BFS from the start word. To find neighbours quickly, file each word under patterns with one letter replaced by "*" and treat words in the same bucket as neighbours. Building buckets costs O(N · L²) for N words of length L; bidirectional BFS from both ends reduces the search further.</div></details>
</main>
`
});
