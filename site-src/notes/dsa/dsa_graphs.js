// notes/dsa/dsa_graphs.js — Graphs
Object.assign(TOPIC_CONTENT, {
  "dsa_graphs": `<main>
  <h1>Graphs</h1>
  <p class="lead">A graph is just "things" and "connections between things": cities and roads, people and friendships, courses and prerequisites. Learn two ways to walk it (DFS and BFS) and a handful of tools on top (topological sort, Union-Find, Dijkstra, MST), and a huge share of interview problems open up, including every "grid" puzzle. Builds on lists, hash maps, queues, recursion and heaps.</p>

  <h2 id="dsa-gr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Graphs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Vocabulary</div>
        <ul>
          <li><b>Node</b> = thing, <b>edge</b> = connection; V nodes, E edges</li>
          <li><b>Directed</b> (one-way) vs <b>undirected</b>; <b>weighted</b> = edges have costs</li>
          <li><b>DAG</b> — directed, no cycles: tasks with prerequisites</li>
          <li><b>Component</b> — a group where everyone reaches everyone</li>
          <li>💡 Railway map: stations = nodes, tracks = edges</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Storing it</div>
        <ul>
          <li><b>Adjacency list</b> — O(V+E); the default</li>
          <li><b>Matrix</b> — O(V²); O(1) edge check · <b>edge list</b> — Kruskal, Bellman-Ford</li>
          <li><b>Grid</b> — implicit graph, 4 neighbours, check borders</li>
          <li>⚠ Undirected → add both ways</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Walking it</div>
        <ul>
          <li><b>DFS</b> — deep first; recursion or stack · <b>BFS</b> — layers; deque</li>
          <li>Both O(V+E); mark visited when you push</li>
          <li><b>BFS = shortest path</b> when all edges cost the same</li>
          <li><b>Multi-source BFS</b> — all sources in the queue at once</li>
          <li>⚠ Recursion limit ≈ 1000 in Python</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Order &amp; groups</div>
        <ul>
          <li><b>Cycle</b> — undirected: visited non-parent; directed: edge to GREY</li>
          <li><b>Topo sort</b> — Kahn (in-degree queue) or reversed DFS post-order</li>
          <li><b>Union-Find</b> — path compression + union by rank ≈ O(1)</li>
          <li><b>Bipartite</b> — BFS 2-colouring; no odd cycle</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Weighted</div>
        <ul>
          <li><b>Dijkstra</b> — heapq; O((V+E) log V); no negatives</li>
          <li><b>Bellman-Ford</b> — V−1 rounds; O(V·E); negatives OK</li>
          <li><b>MST</b> — Kruskal (sort + DSU) or Prim (heap)</li>
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
      <div class="rm-item rm-done" data-target="dsa-gr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Cities and Roads</span><span class="rm-sub">Nodes, edges, the words you need</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-store"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Storing a Graph</span><span class="rm-sub">List, matrix, edge list, grid</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-dfs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">DFS: Go Deep</span><span class="rm-sub">Recursive, iterative, components</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-bfs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">BFS: Ripples</span><span class="rm-sub">Shortest path, multi-source</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-cycle"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Cycle Detection</span><span class="rm-sub">Parent check, three colours</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-topo"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Topological Sort</span><span class="rm-sub">Kahn's and DFS</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-uf"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Union-Find</span><span class="rm-sub">Path compression, union by rank</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-sp"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Weighted Shortest Paths</span><span class="rm-sub">Dijkstra, Bellman-Ford</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-mst"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Minimum Spanning Tree</span><span class="rm-sub">Kruskal, Prim</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-bip"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Bipartite Check</span><span class="rm-sub">Two teams, two colours</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-lib"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">The Python Toolkit</span><span class="rm-sub">defaultdict, deque, heapq, graphlib</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-patterns"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words → algorithm</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-problems"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">8 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Visited timing, recursion, stale entries</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-gr-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-gr-need"><span class="num">01</span>Cities and Roads</h2>
  <p>Open the Indian Railways map. There are stations, and there are tracks between some pairs of stations. "Can I go from Jaipur to Kochi?", "What is the fewest number of changes?", "What is the cheapest route?" are all questions about stations and tracks, not about trains.</p>
  <p>That picture, things plus connections, is a <strong>graph</strong>. Trees and linked lists are special graphs.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>WhatsApp contacts: each person is a <strong>node</strong>, "saved each other's number" is an <strong>edge</strong>. Instagram "follow" is a <strong>directed</strong> edge: you can follow a cricketer without him following back. A family group, where everyone reaches everyone through some chain, is a <strong>connected component</strong>.</p>
  </div>
  <table class="tbl">
    <tr><th>Word</th><th>Plain meaning</th><th>Example</th></tr>
    <tr><td>Node (vertex)</td><td>A thing</td><td>A station, a person, a course, a grid cell</td></tr>
    <tr><td>Edge</td><td>A connection between two nodes</td><td>A track between two stations</td></tr>
    <tr><td>Undirected</td><td>The edge works both ways</td><td>A normal two-way road</td></tr>
    <tr><td>Directed</td><td>The edge has an arrow, one way only</td><td>One-way street; "course A before course B"</td></tr>
    <tr><td>Weighted</td><td>Each edge has a number (cost)</td><td>Km, minutes, ticket price</td></tr>
    <tr><td>Cycle</td><td>A path that comes back to where it started</td><td>A circular bus route</td></tr>
    <tr><td>DAG</td><td>Directed Acyclic Graph: arrows, and no cycles</td><td>Course prerequisites, build steps, a recipe</td></tr>
    <tr><td>Connected component</td><td>A largest group where every node reaches every other</td><td>Islands on a map</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>graph</strong> G = (V, E) is a set of vertices V and a set of edges E, each edge joining two vertices. Almost every graph walk costs <strong>O(V + E)</strong>: visit each node once, look at each edge once (twice if undirected).</p>
  </div>
  <p>Where you meet graphs: Google Maps, LinkedIn "2nd-degree connections", pip installing dependencies in order, and in interviews every "grid", "prerequisites" or "minimum steps" question.</p>

  <h2 id="dsa-gr-store"><span class="num">02</span>Storing a Graph</h2>
  <p>Before walking a graph you need it in memory. Interviews usually hand you an <strong>edge list</strong> like <code>[(0, 1), (0, 2), ...]</code>. Your first job is almost always to turn it into an <strong>adjacency list</strong>: for every node, the list of its neighbours.</p>
  <figure class="viz"><svg viewBox="0 0 600 248" width="600"><text x="10" y="16" class="tb">the graph (undirected)</text><text x="380" y="16" class="tb">adjacency list</text><line x1="50" y1="110" x2="130" y2="50" stroke="currentColor"/><line x1="50" y1="110" x2="130" y2="170" stroke="currentColor"/><line x1="130" y1="50" x2="210" y2="110" stroke="currentColor"/><line x1="130" y1="170" x2="210" y2="110" stroke="currentColor"/><line x1="210" y1="110" x2="290" y2="110" stroke="currentColor"/><line x1="240" y1="200" x2="320" y2="200" stroke="currentColor"/><circle cx="50" cy="110" r="17" class="fb sb"/><text x="50" y="114" text-anchor="middle">0</text><circle cx="130" cy="50" r="17" class="fb sb"/><text x="130" y="54" text-anchor="middle">1</text><circle cx="130" cy="170" r="17" class="fb sb"/><text x="130" y="174" text-anchor="middle">2</text><circle cx="210" cy="110" r="17" class="fb sb"/><text x="210" y="114" text-anchor="middle">3</text><circle cx="290" cy="110" r="17" class="fb sb"/><text x="290" y="114" text-anchor="middle">4</text><circle cx="240" cy="200" r="17" class="fg sg"/><text x="240" y="204" text-anchor="middle">5</text><circle cx="320" cy="200" r="17" class="fg sg"/><text x="320" y="204" text-anchor="middle">6</text><text x="280" y="238" class="tm" text-anchor="middle">second component</text><text x="390" y="43" class="tb">0 →</text><text x="418" y="43">[1, 2]</text><text x="390" y="73" class="tb">1 →</text><text x="418" y="73">[0, 3]</text><text x="390" y="103" class="tb">2 →</text><text x="418" y="103">[0, 3]</text><text x="390" y="133" class="tb">3 →</text><text x="418" y="133">[1, 2, 4]</text><text x="390" y="163" class="tb">4 →</text><text x="418" y="163">[3]</text><text x="390" y="193" class="tg">5 →</text><text x="418" y="193">[6]</text><text x="390" y="223" class="tg">6 →</text><text x="418" y="223">[5]</text></svg><figcaption>The running example for this note. Left: 7 nodes, 6 undirected edges, two connected components. Right: the same graph as an adjacency list. Every undirected edge appears twice (0 lists 1, and 1 lists 0).</figcaption></figure>
  <p>Starting from the edge list for nodes 0–4, build the other two forms:</p>
  <div class="fx" data-lang="py">from collections import defaultdict

n = 5
edges = [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4)]

adj = defaultdict(list)  # adjacency list
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)     # undirected: add both ways
print(dict(adj))

mat = [[0] * n for _ in range(n)]  # adjacency matrix
for u, v in edges:
    mat[u][v] = mat[v][u] = 1
for row in mat:
    print(row)
print("edge 1-3?", mat[1][3] == 1, "| neighbours of 3:", adj[3])</div>
  <div class="fx" data-lang="text">{0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2, 4], 4: [3]}
[0, 1, 1, 0, 0]
[1, 0, 0, 1, 0]
[1, 0, 0, 1, 0]
[0, 1, 1, 0, 1]
[0, 0, 0, 1, 0]
edge 1-3? True | neighbours of 3: [1, 2, 4]</div>
  <table class="tbl">
    <tr><th>Store as</th><th>Space</th><th>"Neighbours of u?"</th><th>"Is u–v an edge?"</th><th>Use when</th></tr>
    <tr><td><strong>Adjacency list</strong></td><td>O(V + E)</td><td>O(degree)</td><td>O(degree) (O(1) with sets)</td><td>Almost always. Real graphs are sparse.</td></tr>
    <tr><td>Adjacency matrix</td><td>O(V²)</td><td>O(V) scan the row</td><td>O(1)</td><td>Small, dense graphs; Floyd-Warshall</td></tr>
    <tr><td>Edge list</td><td>O(E)</td><td>O(E) scan all</td><td>O(E)</td><td>Algorithms that loop over edges: Kruskal, Bellman-Ford</td></tr>
  </table>
  <h3>Grids are graphs in disguise</h3>
  <p>A grid of <code>"1"</code>/<code>"0"</code>, a maze, a chessboard: each cell <code>(r, c)</code> is a node, and its up/down/left/right cells are its neighbours. You never build an adjacency list. You compute the 4 neighbours on the fly with <code>for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):</code> and skip any outside the grid. A corner cell has 2 neighbours, a middle cell 4. Every grid problem below uses this one line.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the border check gives an <code>IndexError</code> at the bottom row, or, worse, silently wraps around at the top because <code>grid[-1]</code> is the last row in Python. Always test <code>0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C</code> before reading the cell.</p>
  </div>

  <h2 id="dsa-gr-dfs"><span class="num">03</span>DFS: Go Deep</h2>
  <p>You are exploring an old haveli with many rooms. One rule: keep walking into a new room as long as you can. When a room has no unexplored door, walk back one room and try its next door. Chalk a mark on each room you enter so you never explore it twice.</p>
  <p>That is <strong>Depth-First Search</strong>. The "walk back" is exactly what recursion does when a function returns. The chalk mark is the <strong>visited set</strong>.</p>
  <p>Trace on the graph above, starting at 0: visit 0 → first unvisited neighbour 1 → its first unvisited neighbour 3 → 3's first unvisited neighbour is 2 (1 is done) → 2 has nothing new, go back to 3 → next is 4 → done. Order: 0, 1, 3, 2, 4.</p>
  <div class="fx" data-lang="py">adj = {0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2, 4], 4: [3], 5: [6], 6: [5]}

def dfs(u, seen, order):
    seen.add(u)  # mark BEFORE going deeper
    order.append(u)
    for v in adj[u]:
        if v not in seen:
            dfs(v, seen, order)

order = []
dfs(0, set(), order)
print("recursive:", order)

def dfs_iter(start):
    seen, order, stack = set(), [], [start]
    while stack:
        u = stack.pop()
        if u in seen:               # may be pushed twice; skip repeats
            continue
        seen.add(u)
        order.append(u)
        for v in reversed(adj[u]):  # reversed: same order as recursion
            if v not in seen:
                stack.append(v)
    return order

print("iterative:", dfs_iter(0))

def components(adj):
    seen, comps = set(), []
    for s in adj:  # try every node as a start
        if s not in seen:
            order = []
            dfs(s, seen, order)
            comps.append(order)
    return comps

print("components:", components(adj))</div>
  <div class="fx" data-lang="text">recursive: [0, 1, 3, 2, 4]
iterative: [0, 1, 3, 2, 4]
components: [[0, 1, 3, 2, 4], [5, 6]]</div>
  <p>The <code>components</code> loop handles disconnected graphs: try every node as a start; each unvisited one begins a new component. Iterative DFS uses a list as the stack and has no depth limit. Both are O(V + E) time, O(V) space.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A 300 × 300 grid that is all land is one island of 90,000 cells. Recursive DFS goes 90,000 calls deep and crashes. <code>sys.setrecursionlimit(10**6)</code> sometimes helps but can still crash the interpreter. In Python, prefer BFS or an explicit stack for big grids.</p>
  </div>

  <h2 id="dsa-gr-bfs"><span class="num">04</span>BFS: Ripples in a Pond</h2>
  <p>Drop a stone in a pond. The ripple reaches everything 1 metre away first, then everything 2 metres away, then 3. <strong>Breadth-First Search</strong> visits nodes the same way: all neighbours of the start (distance 1), then all their new neighbours (distance 2), and so on.</p>
  <p>The tool is a <strong>queue</strong> (first in, first out), like a ration-shop line. Whoever was found earlier is processed earlier, so nearer nodes are always processed before farther ones.</p>
  <figure class="viz"><svg viewBox="0 0 600 235" width="600"><rect x="20" y="30" width="100" height="170" rx="8" class="fs"/><rect x="140" y="30" width="100" height="170" rx="8" class="fs"/><rect x="260" y="30" width="100" height="170" rx="8" class="fs"/><rect x="380" y="30" width="100" height="170" rx="8" class="fs"/><line x1="70" y1="115" x2="190" y2="70" stroke="currentColor"/><line x1="70" y1="115" x2="190" y2="160" stroke="currentColor"/><line x1="190" y1="70" x2="310" y2="115" stroke="currentColor"/><line x1="190" y1="160" x2="310" y2="115" stroke="currentColor"/><line x1="310" y1="115" x2="430" y2="115" stroke="currentColor"/><circle cx="70" cy="115" r="17" class="fg sg"/><text x="70" y="119" text-anchor="middle">0</text><circle cx="190" cy="70" r="17" class="fb sb"/><text x="190" y="74" text-anchor="middle">1</text><circle cx="190" cy="160" r="17" class="fb sb"/><text x="190" y="164" text-anchor="middle">2</text><circle cx="310" cy="115" r="17" class="fb sb"/><text x="310" y="119" text-anchor="middle">3</text><circle cx="430" cy="115" r="17" class="fb sb"/><text x="430" y="119" text-anchor="middle">4</text><text x="70" y="222" class="tm" text-anchor="middle">dist 0</text><text x="190" y="222" class="tm" text-anchor="middle">dist 1</text><text x="310" y="222" class="tm" text-anchor="middle">dist 2</text><text x="430" y="222" class="tm" text-anchor="middle">dist 3</text><text x="500" y="80" class="tb">BFS order</text><text x="500" y="100">0 1 2 3 4</text><text x="500" y="140" class="tr">DFS order</text><text x="500" y="160">0 1 3 2 4</text></svg><figcaption>BFS from node 0 sweeps the graph in layers. Every node in a layer is exactly that many edges from the start. DFS on the same graph dives 0 → 1 → 3 before it ever looks at 2.</figcaption></figure>
  <div class="fx" data-lang="py">from collections import deque

adj = {0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2, 4], 4: [3], 5: [6], 6: [5]}

def bfs(adj, src):
    dist = {src: 0}            # doubles as the visited set
    parent = {src: None}
    q = deque([src])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if v not in dist:  # first time seen = shortest
                dist[v] = dist[u] + 1
                parent[v] = u
                q.append(v)
    return dist, parent

def path_to(parent, t):
    out = []
    while t is not None:  # walk parents back to the source
        out.append(t)
        t = parent[t]
    return out[::-1]

dist, parent = bfs(adj, 0)
print("dist:", dist)
print("path 0 -&gt; 4:", path_to(parent, 4))
print("5 reachable?", 5 in dist)</div>
  <div class="fx" data-lang="text">dist: {0: 0, 1: 1, 2: 1, 3: 2, 4: 3}
path 0 -&gt; 4: [0, 1, 3, 4]
5 reachable? False</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>When every edge costs the same, <strong>the first time BFS reaches a node is along a shortest path</strong>: the queue holds all distance-d nodes before any distance-(d+1) node. That is why "minimum number of steps / moves" means BFS.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mark a node visited <strong>when you push it</strong>, not when you pop it; otherwise several neighbours push the same node and the queue explodes. And use <code>deque</code>: <code>list.pop(0)</code> is O(n), turning BFS into O(V²).</p>
  </div>
  <h3>Multi-source BFS</h3>
  <p>"For every cell, how far is the nearest hospital?" Instead of one BFS per hospital, put <strong>all</strong> hospitals in the queue at distance 0 and run one BFS. Ripples start from every stone at once; each cell is reached first by its nearest source.</p>
  <div class="fx" data-lang="py">from collections import deque

def nearest_zero(mat):
    R, C = len(mat), len(mat[0])
    dist = [[-1] * C for _ in range(R)]
    q = deque()
    for r in range(R):
        for c in range(C):
            if mat[r][c] == 0:  # every source starts in the queue
                dist[r][c] = 0
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
            if 0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                q.append((nr, nc))
    return dist

for row in nearest_zero([[0, 1, 1], [1, 1, 1], [1, 1, 0]]):
    print(row)</div>
  <div class="fx" data-lang="text">[0, 1, 2]
[1, 2, 1]
[2, 1, 0]</div>
  <p>Cost: one BFS, O(R × C), however many sources there are. Rotting Oranges (problem 3) is this exact pattern with "minutes" instead of distance.</p>

  <h2 id="dsa-gr-cycle"><span class="num">05</span>Cycle Detection</h2>
  <p>"Is there a loop?" sounds like one question, but the answer differs for two-way and one-way graphs.</p>
  <h3>Undirected: a visited neighbour that is not my parent</h3>
  <p>In a two-way graph, every neighbour you came from is already visited. That is not a loop, that is just the road behind you. So remember the <strong>parent</strong> (the node you came from). If you meet any <em>other</em> visited neighbour, there are two different routes to it: a cycle.</p>
  <h3>Directed: three colours</h3>
  <p>For one-way graphs, "visited" is not enough. In the diamond 0→1→3 and 0→2→3, node 3 is visited twice but there is no loop. You need to know if a node is <strong>on the path you are walking right now</strong>.</p>
  <p>Give every node a colour: <strong>WHITE</strong> = not visited, <strong>GREY</strong> = entered, still on the current path, <strong>BLACK</strong> = finished and safe.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Theseus in the labyrinth unrolls a thread as he walks. Rooms on the thread are GREY. If a corridor leads to a room where the thread already lies, he has walked in a circle. A room he finished and rolled the thread back from is BLACK; reaching it again just means two corridors join.</p>
  </div>
  <div class="fx" data-lang="py">from collections import defaultdict

def has_cycle_undirected(n, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    seen = set()

    def dfs(u, parent):
        seen.add(u)
        for v in adj[u]:
            if v == parent:  # the road I just came on: ignore
                continue
            if v in seen:    # seen by another road: a loop
                return True
            if dfs(v, u):
                return True
        return False

    return any(u not in seen and dfs(u, -1) for u in range(n))

print(has_cycle_undirected(4, [(0, 1), (1, 2), (2, 3)]))          # a line
print(has_cycle_undirected(4, [(0, 1), (1, 2), (2, 0), (2, 3)]))  # triangle

WHITE, GREY, BLACK = 0, 1, 2

def has_cycle_directed(n, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
    color = [WHITE] * n

    def dfs(u):
        color[u] = GREY           # on the current path
        for v in adj[u]:
            if color[v] == GREY:  # back to my own path: cycle
                return True
            if color[v] == WHITE and dfs(v):
                return True
        color[u] = BLACK          # fully explored, safe
        return False

    return any(color[u] == WHITE and dfs(u) for u in range(n))

print(has_cycle_directed(4, [(0, 1), (0, 2), (1, 3), (2, 3)]))  # diamond, no cycle
print(has_cycle_directed(3, [(0, 1), (1, 2), (2, 0)]))          # 0-&gt;1-&gt;2-&gt;0</div>
  <div class="fx" data-lang="text">False
True
False
True</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using the undirected "parent" trick on a directed graph gives a wrong "cycle" on the diamond. Using two colours (just visited/not) on a directed graph does the same. Directed = three colours (or Kahn's algorithm, next section).</p>
  </div>

  <h2 id="dsa-gr-topo"><span class="num">06</span>Topological Sort</h2>
  <p>Your morning: wake up before brushing and before bath, bath before dressing, brushing and dressing before breakfast. Any order that respects every "before" rule is a <strong>topological order</strong>. It exists only if the rules have no loop (a DAG).</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600"><defs><marker id="gr-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="125" y1="98" x2="165" y2="55" stroke="currentColor" marker-end="url(#gr-a1)"/><line x1="125" y1="117" x2="165" y2="160" stroke="currentColor" marker-end="url(#gr-a1)"/><line x1="275" y1="47" x2="470" y2="98" stroke="currentColor" marker-end="url(#gr-a1)"/><line x1="275" y1="167" x2="315" y2="167" stroke="currentColor" marker-end="url(#gr-a1)"/><line x1="425" y1="160" x2="470" y2="118" stroke="currentColor" marker-end="url(#gr-a1)"/><rect x="15" y="90" width="110" height="34" rx="6" class="fg sg"/><text x="70" y="111" text-anchor="middle">wake (0)</text><rect x="165" y="30" width="110" height="34" rx="6" class="fb sb"/><text x="220" y="51" text-anchor="middle">brush (1)</text><rect x="165" y="150" width="110" height="34" rx="6" class="fb sb"/><text x="220" y="171" text-anchor="middle">bath (2)</text><rect x="315" y="150" width="110" height="34" rx="6" class="fb sb"/><text x="370" y="171" text-anchor="middle">dress (3)</text><rect x="470" y="90" width="115" height="34" rx="6" class="fv sb"/><text x="527" y="111" text-anchor="middle">breakfast (4)</text><text x="70" y="142" class="tm" text-anchor="middle">in=0</text><text x="220" y="82" class="tm" text-anchor="middle">in=1</text><text x="220" y="202" class="tm" text-anchor="middle">in=1</text><text x="370" y="202" class="tm" text-anchor="middle">in=1</text><text x="527" y="142" class="tm" text-anchor="middle">in=2</text><text x="300" y="238" text-anchor="middle" class="tb">Kahn order: wake, brush, bath, dress, breakfast</text></svg><figcaption>A DAG of morning tasks. "in" is the in-degree: how many tasks must happen first. Kahn's algorithm starts with every in=0 task and lowers the counts as tasks finish.</figcaption></figure>
  <h3>Kahn's algorithm (BFS on in-degrees)</h3>
  <p>Count, for each task, how many prerequisites it still waits for (its <strong>in-degree</strong>). Put every task with 0 in a queue. Pop one, "do" it, and decrease the count of every task that depended on it. Whoever drops to 0 joins the queue.</p>
  <table class="tbl out"><caption>Dry run on the morning DAG (in-degrees of nodes 0..4)</caption>
    <tr><th>pop</th><th>in-degrees after</th><th>queue</th><th>order</th></tr>
    <tr><td>start</td><td>[0, 1, 1, 1, 2]</td><td>[0]</td><td>[]</td></tr>
    <tr><td>0</td><td>[0, 0, 0, 1, 2]</td><td>[1, 2]</td><td>[0]</td></tr>
    <tr><td>1</td><td>[0, 0, 0, 1, 1]</td><td>[2]</td><td>[0, 1]</td></tr>
    <tr><td>2</td><td>[0, 0, 0, 0, 1]</td><td>[3]</td><td>[0, 1, 2]</td></tr>
    <tr><td>3</td><td>[0, 0, 0, 0, 0]</td><td>[4]</td><td>[0, 1, 2, 3]</td></tr>
    <tr><td>4</td><td>–</td><td>[]</td><td>[0, 1, 2, 3, 4]</td></tr>
  </table>
  <h3>DFS version (post-order, reversed)</h3>
  <p>Run the 3-colour DFS. When a node turns BLACK, everything that must come <em>after</em> it is already finished and added. So add it to a list at that moment, and reverse the list at the end.</p>
  <div class="fx" data-lang="py">from collections import defaultdict, deque

def topo_kahn(n, edges):
    adj = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:                       # u must come before v
        adj[u].append(v)
        indeg[v] += 1
    q = deque(u for u in range(n) if indeg[u] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1                    # one prerequisite done
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []  # [] means a cycle

def topo_dfs(n, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
    color, order = [0] * n, []

    def dfs(u):
        color[u] = 1
        for v in adj[u]:
            if color[v] == 1:
                return False  # cycle
            if color[v] == 0 and not dfs(v):
                return False
        color[u] = 2
        order.append(u)       # added AFTER all its children
        return True

    for u in range(n):
        if color[u] == 0 and not dfs(u):
            return []
    return order[::-1]

# 0 = wake up, 1 = brush, 2 = bath, 3 = dress, 4 = breakfast
morning = [(0, 1), (0, 2), (1, 4), (2, 3), (3, 4)]
print("kahn:", topo_kahn(5, morning))
print("dfs: ", topo_dfs(5, morning))
print("cycle:", topo_kahn(2, [(0, 1), (1, 0)]), topo_dfs(2, [(0, 1), (1, 0)]))</div>
  <div class="fx" data-lang="text">kahn: [0, 1, 2, 3, 4]
dfs:  [0, 2, 3, 1, 4]
cycle: [] []</div>
  <p>Both are valid orders; a DAG often has many. Both run in O(V + E). Kahn's has a bonus: if the output is shorter than n, some tasks never reached in-degree 0, so there is a cycle. That makes it the go-to for "can all courses be finished?".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Edge direction. In Course Schedule, <code>[a, b]</code> means "b before a", so the edge goes <code>b → a</code>. Getting this backwards gives a reversed order that still "looks" fine on symmetric tests. Say the direction out loud: "arrow from the thing that must happen first".</p>
  </div>

  <h2 id="dsa-gr-uf"><span class="num">07</span>Union-Find (Disjoint Set Union)</h2>
  <p>A village of joint families. Each family has one <strong>mukhiya</strong> (head). "Are Ravi and Asha in the same family?" = compare their mukhiyas. "These two families merge" = one mukhiya now reports to the other. Union-Find answers both in almost O(1).</p>
  <ul>
    <li><code>parent[x]</code>: whom x reports to. A head reports to itself.</li>
    <li><code>find(x)</code>: follow parents up to the head.</li>
    <li><code>union(a, b)</code>: find both heads; if different, attach one head under the other.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Two small tricks make the chains almost flat. <strong>Path compression</strong>: after <code>find(x)</code> walks up, point everyone on that path straight at the head, so the next find is one hop. <strong>Union by rank</strong>: attach the shorter tree under the taller one, so trees never grow tall. Together, each operation is O(α(n)), where α (inverse Ackermann) is ≤ 4 for any n you will ever see.</p>
  </div>
  <div class="fx" data-lang="py">class DSU:
    def __init__(self, n):
        self.parent = list(range(n))  # everyone is their own boss
        self.rank = [0] * n           # rough tree height
        self.count = n                # number of separate groups

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False      # already in the same group
        if self.rank[ra] &lt; self.rank[rb]:
            ra, rb = rb, ra   # ra = the taller tree
        self.parent[rb] = ra  # short tree goes under tall tree
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.count -= 1
        return True

d = DSU(6)
for a, b in [(0, 1), (2, 3), (1, 3), (4, 5)]:
    d.union(a, b)
print("groups:", d.count)
print("0 and 2 same?", d.find(0) == d.find(2), "| 0 and 4 same?", d.find(0) == d.find(4))
print("union(0, 3) again:", d.union(0, 3))
print("parent:", d.parent)</div>
  <div class="fx" data-lang="text">groups: 2
0 and 2 same? True | 0 and 4 same? False
union(0, 3) again: False
parent: [0, 0, 0, 0, 4, 4]</div>
  <p>union(1, 3) finds heads 0 and 2 (equal rank), so 2 goes under 0. union(0, 3) finds one head and returns False; its find also pointed 3 straight at 0. Use Union-Find when edges arrive one by one and you keep asking "connected yet?": counting components, finding the edge that closes a cycle, Kruskal. For actual paths or distances use BFS/DFS; Union-Find only knows "same group or not".</p>

  <h2 id="dsa-gr-sp"><span class="num">08</span>Weighted Shortest Paths</h2>
  <p>BFS counts edges. But Delhi → Agra is 230 km while Agra → Gwalior is 120 km. When edges have different costs, the route with the fewest edges is not always the cheapest. Two tools cover nearly every interview case.</p>
  <h3>Dijkstra: always settle the closest unsettled node</h3>
  <p>Keep a heap of <code>(distance so far, node)</code>. Pop the smallest. Its distance is now final: any other route passes through something at least as far, and costs never go negative. Try each edge out of it ("relax"): if it gives a neighbour a cheaper distance, record it and push.</p>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600"><line x1="60" y1="110" x2="200" y2="40" stroke="currentColor" stroke-dasharray="4 4"/><line x1="200" y1="180" x2="340" y2="110" stroke="currentColor" stroke-dasharray="4 4"/><line x1="60" y1="110" x2="200" y2="180" class="sg" stroke-width="3"/><line x1="200" y1="180" x2="200" y2="40" class="sg" stroke-width="3"/><line x1="200" y1="40" x2="340" y2="110" class="sg" stroke-width="3"/><line x1="340" y1="110" x2="480" y2="110" class="sg" stroke-width="3"/><text x="120" y="66" text-anchor="middle">4</text><text x="120" y="166" text-anchor="middle">1</text><text x="212" y="114">2</text><text x="282" y="66" text-anchor="middle">1</text><text x="282" y="166" text-anchor="middle">5</text><text x="410" y="102" text-anchor="middle">3</text><circle cx="60" cy="110" r="17" class="fg sg"/><text x="60" y="114" text-anchor="middle">A</text><circle cx="200" cy="40" r="17" class="fb sb"/><text x="200" y="44" text-anchor="middle">B</text><circle cx="200" cy="180" r="17" class="fb sb"/><text x="200" y="184" text-anchor="middle">C</text><circle cx="340" cy="110" r="17" class="fb sb"/><text x="340" y="114" text-anchor="middle">D</text><circle cx="480" cy="110" r="17" class="fb sb"/><text x="480" y="114" text-anchor="middle">E</text><text x="60" y="146" class="tg" text-anchor="middle">d=0</text><text x="226" y="44" class="tg">d=3</text><text x="226" y="184" class="tg">d=1</text><text x="340" y="146" class="tg" text-anchor="middle">d=4</text><text x="480" y="146" class="tg" text-anchor="middle">d=7</text><text x="300" y="226" text-anchor="middle" class="tb">pop order: A(0)  C(1)  B(3)  D(4)  E(7)</text></svg><figcaption>Dijkstra from A. The direct road A–B costs 4, but A → C → B costs 1 + 2 = 3, so B ends at 3. Thick green edges form the shortest-path tree; dashed edges were never part of a best route.</figcaption></figure>
  <div class="fx" data-lang="py">import heapq
from collections import defaultdict

def dijkstra(adj, src):
    dist = {src: 0}
    pq = [(0, src)]           # (distance so far, node)
    while pq:
        d, u = heapq.heappop(pq)
        if d &gt; dist[u]:       # stale entry: a shorter one won already
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd &lt; dist.get(v, float("inf")):
                dist[v] = nd  # relax: found a cheaper way
                heapq.heappush(pq, (nd, v))
    return dist

roads = [("A", "B", 4), ("A", "C", 1), ("C", "B", 2), ("B", "D", 1), ("C", "D", 5), ("D", "E", 3)]
adj = defaultdict(list)
for u, v, w in roads:
    adj[u].append((v, w))
    adj[v].append((u, w))
print(dijkstra(adj, "A"))</div>
  <div class="fx" data-lang="text">{'A': 0, 'B': 3, 'C': 1, 'D': 4, 'E': 7}</div>
  <table class="tbl out"><caption>Dry run from A (heap shown sorted)</caption>
    <tr><th>pop</th><th>action</th><th>heap after</th></tr>
    <tr><td>(0, A)</td><td>B = 4, C = 1</td><td>(1,C) (4,B)</td></tr>
    <tr><td>(1, C)</td><td>B: 1+2 = 3 &lt; 4 → 3; D = 6</td><td>(3,B) (4,B) (6,D)</td></tr>
    <tr><td>(3, B)</td><td>D: 3+1 = 4 &lt; 6 → 4</td><td>(4,B) (4,D) (6,D)</td></tr>
    <tr><td>(4, B)</td><td>stale: 4 &gt; dist[B] = 3, skip</td><td>(4,D) (6,D)</td></tr>
    <tr><td>(4, D)</td><td>E = 7</td><td>(6,D) (7,E)</td></tr>
    <tr><td>(6, D)</td><td>stale, skip</td><td>(7,E)</td></tr>
    <tr><td>(7, E)</td><td>nothing new</td><td>empty</td></tr>
  </table>
  <p>Python's heap cannot "decrease a key", so we push a new entry and leave the old one behind. The <code>if d &gt; dist[u]: continue</code> line throws those stale entries away when they surface (lazy deletion, see the heaps note). Time O((V + E) log V), space O(V + E).</p>
  <h3>Bellman-Ford: negative edges allowed</h3>
  <p>Cashback can make a step cost negative. Then "popped = final" breaks: a later negative edge can make a settled node cheaper. Bellman-Ford is slower but simple: relax <strong>every</strong> edge, V − 1 times. A shortest path has at most V − 1 edges, and round i fixes all paths of i edges.</p>
  <div class="fx" data-lang="py">def bellman_ford(n, edges, src):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    for _ in range(n - 1):  # a shortest path has at most n-1 edges
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w &lt; dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break           # early stop: nothing improved
    for u, v, w in edges:   # one more round: still improving?
        if dist[u] != INF and dist[u] + w &lt; dist[v]:
            return None     # negative cycle
    return dist

print(bellman_ford(4, [(0, 1, 4), (0, 2, 5), (2, 1, -3), (1, 3, 2)], 0))
print(bellman_ford(3, [(0, 1, 1), (1, 2, -2), (2, 1, 1)], 0))</div>
  <div class="fx" data-lang="text">[0, 2, 5, 4]
None</div>
  <p>First graph: 0 → 2 → 1 costs 5 − 3 = 2, beating the direct 4, so node 3 = 4. A "pop once, final" Dijkstra settles node 1 at 4 and node 3 at 6, both wrong. Second graph: the loop 1 → 2 → 1 costs −1, so costs fall forever; the extra V-th round catches it because something still improves.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Use</th><th>Time</th></tr>
    <tr><td>All edges cost the same</td><td>BFS</td><td>O(V + E)</td></tr>
    <tr><td>Edge costs 0 or 1 only</td><td>0-1 BFS (deque: cost 0 → appendleft, cost 1 → append)</td><td>O(V + E)</td></tr>
    <tr><td>Non-negative weights</td><td><strong>Dijkstra</strong></td><td>O((V + E) log V)</td></tr>
    <tr><td>Negative edges, or "at most k edges"</td><td><strong>Bellman-Ford</strong></td><td>O(V · E)</td></tr>
    <tr><td>DAG with any weights</td><td>Topological order, then relax in that order</td><td>O(V + E)</td></tr>
    <tr><td>All pairs, small V (≤ ~400)</td><td>Floyd-Warshall (triple loop over a matrix)</td><td>O(V³)</td></tr>
  </table>

  <h2 id="dsa-gr-mst"><span class="num">09</span>Minimum Spanning Tree</h2>
  <p>The panchayat must connect 5 villages with electricity cable, paid per km, so that every village is reachable. You need exactly V − 1 cables (one more makes a wasted loop) with the smallest total cost. That set is the <strong>Minimum Spanning Tree</strong> (MST). It minimises total cable, not the distance from one source, so it is not Dijkstra's tree.</p>
  <div class="cards">
    <div><b>Kruskal</b><p>Sort all edges cheapest first. Take an edge if it joins two different groups (Union-Find says so); skip it if both ends are already connected.</p><small>O(E log E) · edge list + DSU</small></div>
    <div><b>Prim</b><p>Start from any node. Repeatedly take the cheapest edge leaving the current tree (heap), adding its new node.</p><small>O(E log V) · adjacency list + heap</small></div>
  </div>
  <p>On the Dijkstra graph above (as cables): sorted edges are A–C 1, B–D 1, C–B 2, D–E 3, A–B 4, C–D 5. Kruskal takes the first four, each joining two groups. A–B would close the loop A–C–B, so it is skipped. Total 1 + 1 + 2 + 3 = 7.</p>
  <div class="fx" data-lang="py">import heapq
from collections import defaultdict

roads = [("A", "B", 4), ("A", "C", 1), ("C", "B", 2), ("B", "D", 1), ("C", "D", 5), ("D", "E", 3)]

def kruskal(nodes, edges):
    parent = {x: x for x in nodes}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]              # path halving
            x = parent[x]
        return x
    total, used = 0, []
    for u, v, w in sorted(edges, key=lambda e: e[2]):  # cheapest first
        ru, rv = find(u), find(v)
        if ru != rv:                                   # joins two different groups: take it
            parent[ru] = rv
            total += w
            used.append((u, v, w))
    return total, used

def prim(nodes, edges, start):
    adj = defaultdict(list)
    for u, v, w in edges:
        adj[u].append((w, v))
        adj[v].append((w, u))
    seen, total, pq = set(), 0, [(0, start)]
    while pq and len(seen) &lt; len(nodes):
        w, u = heapq.heappop(pq)  # cheapest edge leaving the tree
        if u in seen:
            continue
        seen.add(u)
        total += w
        for e in adj[u]:
            if e[1] not in seen:
                heapq.heappush(pq, e)
    return total

print(kruskal("ABCDE", roads))
print(prim("ABCDE", roads, "A"))</div>
  <div class="fx" data-lang="text">(7, [('A', 'C', 1), ('B', 'D', 1), ('C', 'B', 2), ('D', 'E', 3)])
7</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>MST is for <strong>undirected</strong> graphs. If the graph is disconnected there is no spanning tree (Kruskal returns fewer than V − 1 edges; check that). And Prim's heap is keyed on the single edge weight <code>w</code>, not on <code>dist + w</code> as in Dijkstra. Mixing the two up is the classic bug.</p>
  </div>

  <h2 id="dsa-gr-bip"><span class="num">10</span>Bipartite Check</h2>
  <p>A school picnic: split the students into two buses so that no two students who fight are on the same bus. Each "fights with" pair is an edge. If such a split exists, the graph is <strong>bipartite</strong>.</p>
  <p>Idea: put the first student in bus 0. Everyone they fight with must go in bus 1. Everyone <em>those</em> students fight with must go in bus 0, and so on, with BFS. If you ever find an edge with both ends in the same bus, it is impossible.</p>
  <div class="fx" data-lang="py">from collections import deque

def is_bipartite(graph):                     # graph[u] = list of neighbours
    color = {}
    for s in range(len(graph)):              # graph may be disconnected
        if s in color:
            continue
        color[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if v not in color:
                    color[v] = 1 - color[u]  # opposite team
                    q.append(v)
                elif color[v] == color[u]:
                    return False             # same team on one edge
    return True

print(is_bipartite([[1, 3], [0, 2], [1, 3], [0, 2]]))        # square: yes
print(is_bipartite([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]))  # has a triangle: no</div>
  <div class="fx" data-lang="text">True
False</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A graph is bipartite exactly when it has <strong>no odd-length cycle</strong>. A square (4-cycle) alternates 0, 1, 0, 1 fine. A triangle forces the third node to be both 0 and 1. Uses: "Possible Bipartition", matching jobs to people, two-team splits.</p>
  </div>

  <h2 id="dsa-gr-lib"><span class="num">11</span>The Python Toolkit</h2>
  <p>There is no graph type in the standard library, and interviews expect you to build it from basic parts. These are the parts:</p>
  <p>Adjacency list: <code>defaultdict(list)</code> or <code>[[] for _ in range(n)]</code>. Visited: <code>set()</code> or <code>[False] * n</code>. BFS queue: <code>deque</code>. DFS stack: a plain list. Dijkstra and Prim: <code>heapq</code>. Topological sort: <code>graphlib</code> (Python 3.9+).</p>
  <div class="fx" data-lang="py">from collections import defaultdict
from graphlib import TopologicalSorter, CycleError

adj = defaultdict(list)       # missing key -&gt; empty list, no KeyError
adj["Delhi"].append("Agra")
print(adj["Pune"], len(adj))  # careful: reading also creates the key

# graphlib (Python 3.9+): give each node its prerequisites
ts = TopologicalSorter({"dress": ["bath"], "breakfast": ["brush", "dress"],
                        "bath": ["wake"], "brush": ["wake"]})
print(list(ts.static_order()))

try:
    list(TopologicalSorter({"a": ["b"], "b": ["a"]}).static_order())
except CycleError as e:
    print("CycleError:", e.args[1])</div>
  <div class="fx" data-lang="text">[] 2
['wake', 'bath', 'brush', 'dress', 'breakfast']
CycleError: ['a', 'b', 'a']</div>
  <p>Reading <code>adj["Pune"]</code> from a <code>defaultdict</code> silently added Pune, so <code>len(adj)</code> became 2; use <code>adj.get(u, [])</code> when you only want to look. <code>graphlib</code> takes each node's <em>prerequisites</em>, the opposite direction from an adjacency list. <code>networkx</code> has everything ready-made, but interviews want you to write it.</p>

  <h2 id="dsa-gr-patterns"><span class="num">12</span>Patterns</h2>
  <p>Most graph questions do not say "graph". Learn to hear the signal words.</p>
  <table class="tbl">
    <tr><th>Signal words</th><th>Reach for</th><th>Example</th></tr>
    <tr><td>"islands", "regions", "flood fill", "connected", "provinces"</td><td>DFS/BFS from every unvisited cell, count starts</td><td>Number of Islands, Max Area of Island</td></tr>
    <tr><td>"minimum steps / moves / transformations", unweighted</td><td>BFS with levels</td><td>Word Ladder, Open the Lock, Knight moves</td></tr>
    <tr><td>"spreads", "all at once", "nearest X from every cell"</td><td>Multi-source BFS</td><td>Rotting Oranges, 01 Matrix, Walls and Gates</td></tr>
    <tr><td>"prerequisites", "order of tasks", "dependencies", "build order"</td><td>Topological sort (Kahn)</td><td>Course Schedule, Alien Dictionary</td></tr>
    <tr><td>"edges added one by one", "are they connected", "merge groups"</td><td>Union-Find</td><td>Redundant Connection, Accounts Merge</td></tr>
    <tr><td>"cheapest / fastest / minimum cost", weights ≥ 0</td><td>Dijkstra</td><td>Network Delay Time, Path With Minimum Effort</td></tr>
    <tr><td>"at most k stops / edges", negative costs</td><td>Bellman-Ford (k rounds)</td><td>Cheapest Flights Within K Stops</td></tr>
    <tr><td>"connect all with minimum total cost"</td><td>MST (Kruskal / Prim)</td><td>Min Cost to Connect All Points</td></tr>
    <tr><td>"split into two groups", "no two adjacent same"</td><td>Bipartite 2-colouring</td><td>Is Graph Bipartite, Possible Bipartition</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The hardest step is usually naming the nodes. In Word Ladder the nodes are words and an edge is "differs by one letter". In Open the Lock the nodes are 4-digit codes. In a grid the nodes are cells. Once you can say "node = ..., edge = ...", the algorithm is a template.</p>
  </div>

  <h2 id="dsa-gr-problems"><span class="num">13</span>Classic Problems</h2>

  <h3>1. Number of Islands</h3>
  <p>A grid of <code>"1"</code> (land) and <code>"0"</code> (water). Count the islands, where land connects up/down/left/right. That is the number of connected components: each unvisited land cell starts a new island, and a BFS marks all of it.</p>
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

  <h3>2. Clone Graph</h3>
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

  <h3>3. Rotting Oranges</h3>
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

  <h3>4. Course Schedule I and II</h3>
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

  <h3>5. Redundant Connection &amp; Number of Connected Components</h3>
  <p><strong>Redundant Connection</strong>: a tree on nodes 1..n plus one extra edge. Return the edge that, when removed, leaves a tree (the last such edge in the input). Feed edges into Union-Find one by one; the first edge whose two ends already share a head is the one that closes the loop. <strong>Number of Connected Components</strong>: start with n groups and subtract one for every union that actually merges two groups.</p>
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

  <h3>6. Network Delay Time</h3>
  <p>n computers, directed <code>times[i] = [u, v, w]</code>: a signal from u reaches v after w ms. Send from k. How long until every computer has it? That is the shortest time to the <em>farthest</em> node: Dijkstra from k, answer = max distance, or −1 if some node is unreachable.</p>
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
  <p>This version uses a "settled" dict: a node's distance is written the first time it is popped, and later pops of it are skipped. Same idea as the stale check, slightly shorter. In the last case, 1 → 3 → 2 (1 + 1 = 2) beats the direct 1 → 2 (5). Time O(E log E), space O(V + E).</p>

  <h3>7. Word Ladder</h3>
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

  <h3>8. Cheapest Flights Within K Stops</h3>
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

  <h2 id="dsa-gr-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: no visited set, or marking too late</span>
    <p>Without a visited set, any cycle loops forever. Marking at pop time instead of push time lets the same node enter the queue many times. Rule: mark when you add to the queue/stack (or as the first line of recursive DFS).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: one-way edge for an undirected graph</span>
    <p>Building <code>adj[u].append(v)</code> but forgetting <code>adj[v].append(u)</code> silently makes half the graph unreachable. Read the problem: "bidirectional", "undirected", "friends" all mean both ways.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting isolated nodes and other components</span>
    <p>Nodes with no edges never appear in the edge list, so a <code>defaultdict</code> built from edges does not contain them. Loop over <code>range(n)</code>, not over <code>adj</code>, when counting components or doing topological sort.</p>
  </div>

  <h2 id="dsa-gr-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Adjacency list or matrix: which and why?</summary><div class="qa-body">List by default: O(V + E) space and neighbour loops cost only the degree. A matrix is O(V²) space and wastes memory on sparse graphs, but answers "is u–v an edge?" in O(1); use it for small dense graphs or Floyd-Warshall.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time complexity of BFS and DFS, and why?</summary><div class="qa-body">O(V + E). Each node is marked visited once, so it is processed once; each edge is looked at once from each end (twice for undirected), which is still O(E). On an R × C grid that is O(R × C).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does BFS give shortest paths but DFS does not?</summary><div class="qa-body">BFS's queue processes all nodes at distance d before any at d + 1, so the first time a node is reached is via a fewest-edges path. DFS follows one branch as deep as it goes and can reach a node through a long detour first. This holds only when all edges cost the same.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect a cycle in an undirected vs a directed graph?</summary><div class="qa-body">Undirected: DFS/BFS remembering the parent; a visited neighbour that is not the parent means a cycle (or Union-Find: an edge whose ends already share a root). Directed: 3-colour DFS; an edge into a GREY node (on the current path) is a cycle. Or run Kahn's: if fewer than V nodes come out, there is a cycle.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't Dijkstra handle negative edges?</summary><div class="qa-body">It finalises a node when it pops it, assuming no later route can be cheaper because every extra edge only adds cost. A negative edge discovered later can lower the cost of an already-final node, and everything computed from it is then wrong. Use Bellman-Ford (O(V·E)), which also detects negative cycles.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a graph bipartite, and how do you check it?</summary><div class="qa-body">Exactly when it has no odd-length cycle. Check by BFS/DFS 2-colouring: give the start colour 0, every neighbour the opposite colour; if an edge ever joins two nodes of the same colour, it is not bipartite. Start a new BFS from every uncoloured node to cover all components. O(V + E).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should a node be marked visited in BFS?</summary><div class="qa-body">When it is pushed. Marking at pop time lets several neighbours push the same node, wasting time and memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Complexity of Dijkstra with heapq?</summary><div class="qa-body">O((V + E) log V) time: each relaxation may push once at O(log) cost, and each node is settled once. O(V + E) space because stale entries stay in the heap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Kruskal or Prim?</summary><div class="qa-body">Kruskal (sort edges + Union-Find, O(E log E)) suits an edge list and sparse graphs. Prim (heap of edges leaving the tree, O(E log V)) suits an adjacency list and dense graphs. Same total weight.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Cheapest Flights copy the cost array each round?</summary><div class="qa-body">So each round adds exactly one flight. Updating in place could chain two flights in one round and break the stop limit.</div></details>
</main>
`
});
