// problems/graphs.js — Graphs ladder
PROBLEMS.push(
  {
    num: 1791, title: "Find Center of Star Graph", slug: "find-center-of-star-graph", lc: "Easy",
    topic: "graphs",
    pattern: "Graph basics: degrees",
    level: 1,
    order: 10,
    core: false,
    teaches: "The degree of a node (how many edges touch it) already tells you a lot about a graph.",
    learn: ["dsa_graphs", "dsa-gr-store"],
    pre: [],
    hints: [
      "In a star, how many edges touch the center? How many touch every other node?",
      "The center is in every edge, so it must appear in both of the first two edges."
    ],
    steps: [
      "Take the first two edges.",
      "Return the endpoint of edge 0 that also appears in edge 1."
    ],
    time: "O(1)", space: "O(1)",
    trap: "Building a full degree count works but is unnecessary: two edges are enough.",
    code: `class Solution:
    def findCenter(self, edges: List[List[int]]) -> int:
        a, b = edges[0]
        return a if a in edges[1] else b
`
  },
  {
    num: 733, title: "Flood Fill", slug: "flood-fill", lc: "Easy",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 1,
    order: 20,
    core: true,
    teaches: "Flood fill: start at one cell and spread to every 4-neighbour with the same colour.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [],
    hints: [
      "Which cells must change? Only those connected to the start through cells of the start's colour.",
      "Use a stack (or recursion): pop a cell, recolour it, push its 4 neighbours that still have the old colour.",
      "If the new colour equals the old colour, return the image unchanged."
    ],
    steps: [
      "old = image[sr][sc]; if old == color return image.",
      "Push (sr, sc). While the stack is not empty: pop (r, c), set it to color, push in-bounds neighbours equal to old.",
      "Return image."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "When color == old colour the 'visited' check never triggers and the fill loops forever; return early.",
    code: `class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, color: int) -> List[List[int]]:
        old = image[sr][sc]
        if old == color:
            return image
        m, n = len(image), len(image[0])
        stack = [(sr, sc)]
        image[sr][sc] = color
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n and image[nr][nc] == old:
                    image[nr][nc] = color          # recolour = mark visited
                    stack.append((nr, nc))
        return image
`
  },
  {
    num: 1971, title: "Find if Path Exists in Graph", slug: "find-if-path-exists-in-graph", lc: "Easy",
    topic: "graphs",
    pattern: "DFS on adjacency list",
    level: 1,
    order: 30,
    core: true,
    teaches: "Build an adjacency list from the edge list, then DFS from the source and see if you reach the destination.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [],
    hints: [
      "First turn the edge list into a dict: node -> list of neighbours (both directions).",
      "Run DFS with a stack and a visited set starting at source; stop when you pop destination."
    ],
    steps: [
      "graph = defaultdict(list); add both directions for every edge.",
      "stack = [source], seen = {source}. Pop a node; if it is destination return True; push unseen neighbours.",
      "Return False when the stack empties."
    ],
    time: "O(n + m)", space: "O(n + m)",
    trap: "Forgetting to add the reverse direction: the graph is undirected.",
    code: `from collections import defaultdict
class Solution:
    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:
        graph = defaultdict(list)
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)
        stack, seen = [source], {source}
        while stack:
            u = stack.pop()
            if u == destination:
                return True
            for v in graph[u]:
                if v not in seen:
                    seen.add(v)
                    stack.append(v)
        return False
`
  },
  {
    num: 997, title: "Find the Town Judge", slug: "find-the-town-judge", lc: "Easy",
    topic: "graphs",
    pattern: "Graph basics: degrees",
    level: 2,
    order: 40,
    core: true,
    teaches: "Count in-degree and out-degree: the judge is trusted by n-1 people and trusts nobody.",
    learn: ["dsa_graphs", "dsa-gr-store"],
    pre: [1791],
    hints: [
      "Think of 'a trusts b' as a directed edge a -> b. What are the judge's in-degree and out-degree?",
      "Keep one score per person: +1 when someone trusts them, -1 when they trust someone.",
      "The judge is the person whose score is exactly n - 1."
    ],
    steps: [
      "score = [0] * (n + 1).",
      "For each (a, b): score[a] -= 1, score[b] += 1.",
      "Return the person i in 1..n with score[i] == n - 1, else -1."
    ],
    time: "O(n + t)", space: "O(n)",
    trap: "n = 1 with no trust pairs: person 1 is the judge (score 0 == n - 1).",
    code: `class Solution:
    def findJudge(self, n: int, trust: List[List[int]]) -> int:
        score = [0] * (n + 1)
        for a, b in trust:
            score[a] -= 1      # a trusts someone -> cannot be judge
            score[b] += 1      # b is trusted by one more person
        for i in range(1, n + 1):
            if score[i] == n - 1:
                return i
        return -1
`
  },
  {
    num: 1615, title: "Maximal Network Rank", slug: "maximal-network-rank", lc: "Medium",
    topic: "graphs",
    pattern: "Graph basics: degrees",
    level: 2,
    order: 50,
    core: false,
    teaches: "Rank of a pair = deg(a) + deg(b), minus 1 if a and b share an edge.",
    learn: ["dsa_graphs", "dsa-gr-store"],
    pre: [1791],
    hints: [
      "Each road touching a or b counts once. Which road could be counted twice?",
      "Compute degrees and keep the edges in a set so you can test 'are a and b directly connected?' in O(1).",
      "Try every pair; n is small (100)."
    ],
    steps: [
      "Count deg[x] for every node and store each edge as a pair in a set.",
      "For every pair a < b: rank = deg[a] + deg[b] - (1 if (a, b) is an edge else 0).",
      "Return the maximum rank."
    ],
    time: "O(n^2 + m)", space: "O(n + m)",
    trap: "Forgetting to subtract 1 when the two cities are directly connected (that road is counted twice).",
    code: `class Solution:
    def maximalNetworkRank(self, n: int, roads: List[List[int]]) -> int:
        deg = [0] * n
        edge = set()
        for a, b in roads:
            deg[a] += 1
            deg[b] += 1
            edge.add((min(a, b), max(a, b)))
        best = 0
        for a in range(n):
            for b in range(a + 1, n):
                best = max(best, deg[a] + deg[b] - ((a, b) in edge))
        return best
`
  },
  {
    num: 463, title: "Island Perimeter", slug: "island-perimeter", lc: "Easy",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 2,
    order: 60,
    core: false,
    teaches: "In a grid, each land cell has 4 sides; every shared side with another land cell hides 2 of them.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [733],
    hints: [
      "How many sides does one land cell add to the perimeter on its own?",
      "When two land cells touch, how many perimeter sides disappear?",
      "perimeter = 4 * land - 2 * (number of land-land adjacencies); count only the up and left neighbour to avoid double counting."
    ],
    steps: [
      "For every land cell add 4.",
      "If the cell above is land subtract 2; if the cell to the left is land subtract 2.",
      "Return the total."
    ],
    time: "O(m*n)", space: "O(1)",
    trap: "Checking all 4 neighbours and subtracting 2 each time double-counts every shared edge.",
    code: `class Solution:
    def islandPerimeter(self, grid: List[List[int]]) -> int:
        total = 0
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == 1:
                    total += 4
                    if r > 0 and grid[r-1][c] == 1:
                        total -= 2
                    if c > 0 and grid[r][c-1] == 1:
                        total -= 2
        return total
`
  },
  {
    num: 841, title: "Keys and Rooms", slug: "keys-and-rooms", lc: "Medium",
    topic: "graphs",
    pattern: "DFS on adjacency list",
    level: 2,
    order: 70,
    core: false,
    teaches: "The rooms are nodes and the keys are edges: can DFS from room 0 reach every room?",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [1971],
    hints: [
      "rooms[i] is already an adjacency list: room i -> rooms whose keys it holds.",
      "DFS from room 0 and count how many rooms you visit."
    ],
    steps: [
      "seen = {0}, stack = [0].",
      "Pop a room; push every key-room not yet seen.",
      "Return len(seen) == len(rooms)."
    ],
    time: "O(n + keys)", space: "O(n)",
    trap: "Keys can repeat or point back to visited rooms; the visited set prevents loops.",
    code: `class Solution:
    def canVisitAllRooms(self, rooms: List[List[int]]) -> bool:
        seen, stack = {0}, [0]
        while stack:
            for k in rooms[stack.pop()]:
                if k not in seen:
                    seen.add(k)
                    stack.append(k)
        return len(seen) == len(rooms)
`
  },
  {
    num: 547, title: "Number of Provinces", slug: "number-of-provinces", lc: "Medium",
    topic: "graphs",
    pattern: "DFS on adjacency list",
    level: 2,
    order: 80,
    core: true,
    teaches: "Count connected components: start a DFS from every unvisited node and count the starts.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [1971],
    hints: [
      "The input is an adjacency matrix: isConnected[i][j] == 1 means an edge.",
      "Loop over cities; each time you meet an unvisited one, that's a new province: DFS to mark its whole component."
    ],
    steps: [
      "seen = set(), count = 0.",
      "For i in range(n): if i not seen, count += 1 and DFS from i over row isConnected[u].",
      "Return count."
    ],
    time: "O(n^2)", space: "O(n)",
    trap: "The diagonal is always 1; it is harmless because the node is already marked visited.",
    code: `class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        seen = [False] * n
        count = 0
        for i in range(n):
            if not seen[i]:
                count += 1
                seen[i] = True
                stack = [i]
                while stack:
                    u = stack.pop()
                    for v in range(n):
                        if isConnected[u][v] and not seen[v]:
                            seen[v] = True
                            stack.append(v)
        return count
`
  },
  {
    num: 1926, title: "Nearest Exit from Entrance in Maze", slug: "nearest-exit-from-entrance-in-maze", lc: "Medium",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 2,
    order: 90,
    core: false,
    teaches: "BFS explores cells in order of distance, so the first border cell it reaches is the nearest exit.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [733],
    hints: [
      "Every move costs 1 step. Which search finds the fewest steps: DFS or BFS?",
      "BFS from the entrance, storing (row, col, steps). The first popped border cell that is not the entrance is the answer."
    ],
    steps: [
      "Mark the entrance as visited ('+') and push (r, c, 0).",
      "Pop a cell; for each open neighbour: if it lies on the border return steps + 1; else mark it and push it.",
      "Return -1 if the queue empties."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "The entrance itself does not count as an exit even when it is on the border.",
    code: `from collections import deque
class Solution:
    def nearestExit(self, maze: List[List[str]], entrance: List[int]) -> int:
        m, n = len(maze), len(maze[0])
        r0, c0 = entrance
        maze[r0][c0] = '+'
        q = deque([(r0, c0, 0)])
        while q:
            r, c, d = q.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n and maze[nr][nc] == '.':
                    if nr in (0, m - 1) or nc in (0, n - 1):
                        return d + 1
                    maze[nr][nc] = '+'
                    q.append((nr, nc, d + 1))
        return -1
`
  },
  {
    num: 1765, title: "Map of Highest Peak", slug: "map-of-highest-peak", lc: "Medium",
    topic: "graphs",
    pattern: "Multi-source BFS",
    level: 2,
    order: 100,
    core: false,
    teaches: "Multi-source BFS: put every source in the queue at distance 0, then expand them together.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1926],
    hints: [
      "Each land cell's height is its distance to the nearest water. How do you get the nearest of many sources?",
      "Push ALL water cells into the queue at height 0 before starting; the BFS waves then grow from all of them at once."
    ],
    steps: [
      "height = -1 everywhere; for each water cell set 0 and enqueue it.",
      "Pop a cell; each neighbour still -1 gets height + 1 and is enqueued.",
      "Return the height grid."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Running a separate BFS from each water cell is O((mn)^2); one shared queue does it in O(mn).",
    code: `from collections import deque
class Solution:
    def highestPeak(self, isWater: List[List[int]]) -> List[List[int]]:
        m, n = len(isWater), len(isWater[0])
        h = [[-1] * n for _ in range(m)]
        q = deque()
        for i in range(m):
            for j in range(n):
                if isWater[i][j]:
                    h[i][j] = 0
                    q.append((i, j))
        while q:
            r, c = q.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n and h[nr][nc] == -1:
                    h[nr][nc] = h[r][c] + 1
                    q.append((nr, nc))
        return h
`
  },
  {
    num: 1557, title: "Minimum Number of Vertices to Reach All Nodes", slug: "minimum-number-of-vertices-to-reach-all-nodes", lc: "Medium",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 2,
    order: 110,
    core: false,
    teaches: "In a DAG, the nodes nobody points to (in-degree 0) are exactly the ones you must start from.",
    learn: ["dsa_graphs", "dsa-gr-topo"],
    pre: [997],
    hints: [
      "Can a node with an incoming edge ever be needed as a starting point?",
      "No: it is reachable from its parent. Nodes with in-degree 0 cannot be reached from anything, so they are required."
    ],
    steps: [
      "Mark every edge target as 'has incoming edge'.",
      "Return all nodes that were never marked."
    ],
    time: "O(n + m)", space: "O(n)",
    trap: "Overthinking it with DFS from every node; one pass over the edges is enough.",
    code: `class Solution:
    def findSmallestSetOfVertices(self, n: int, edges: List[List[int]]) -> List[int]:
        has_in = [False] * n
        for _, b in edges:
            has_in[b] = True
        return [i for i in range(n) if not has_in[i]]
`
  },
  {
    num: 990, title: "Satisfiability of Equality Equations", slug: "satisfiability-of-equality-equations", lc: "Medium",
    topic: "graphs",
    pattern: "Union-Find",
    level: 2,
    order: 120,
    core: false,
    teaches: "Union-Find basics: union everything that must be equal, then check that no '!=' pair ended up together.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [547],
    hints: [
      "Equalities group variables together. Which structure merges groups quickly?",
      "First pass: union a and b for every 'a==b'. Second pass: for every 'a!=b', if find(a) == find(b) return False.",
      "Do all unions before any check, because a later equality can connect an earlier inequality."
    ],
    steps: [
      "parent = list(range(26)) with find (path compression) and union.",
      "Union for every '=='.",
      "For every '!=', return False if both letters share a root. Return True."
    ],
    time: "O(n * alpha(26))", space: "O(1)",
    trap: "'a!=a' is always False; it is caught automatically since find(a) == find(a).",
    code: `class Solution:
    def equationsPossible(self, equations: List[str]) -> bool:
        parent = list(range(26))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]   # path halving
                x = parent[x]
            return x
        for e in equations:
            if e[1] == '=':
                parent[find(ord(e[0]) - 97)] = find(ord(e[3]) - 97)
        for e in equations:
            if e[1] == '!' and find(ord(e[0]) - 97) == find(ord(e[3]) - 97):
                return False
        return True
`
  },
  {
    num: 743, title: "Network Delay Time", slug: "network-delay-time", lc: "Medium",
    topic: "graphs",
    pattern: "Weighted shortest path",
    level: 2,
    order: 130,
    core: true,
    teaches: "Textbook Dijkstra: a min-heap of (distance, node), skipping stale entries.",
    learn: ["dsa_graphs", "dsa-gr-sp"],
    pre: [1971],
    hints: [
      "Edges have different positive weights, so plain BFS is not enough. Which algorithm handles that?",
      "Dijkstra from k with a heap. The time for all nodes to get the signal is the largest final distance.",
      "If some node is never reached, return -1."
    ],
    steps: [
      "adj[u].append((v, w)); dist = {}; heap = [(0, k)].",
      "Pop (d, u); if u already in dist, skip; else dist[u] = d and push (d + w, v) for each edge.",
      "Return max(dist.values()) if len(dist) == n else -1."
    ],
    time: "O(E log E)", space: "O(V + E)",
    trap: "Not skipping stale heap entries (a node popped a second time with a larger distance) wastes time and can overwrite answers.",
    code: `import heapq
from collections import defaultdict
class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        adj = defaultdict(list)
        for u, v, w in times:
            adj[u].append((v, w))
        dist = {}
        heap = [(0, k)]
        while heap:
            d, u = heapq.heappop(heap)
            if u in dist:
                continue                     # stale entry
            dist[u] = d
            for v, w in adj[u]:
                if v not in dist:
                    heapq.heappush(heap, (d + w, v))
        return max(dist.values()) if len(dist) == n else -1
`
  },
  {
    num: 1042, title: "Flower Planting With No Adjacent", slug: "flower-planting-with-no-adjacent", lc: "Medium",
    topic: "graphs",
    pattern: "Bipartite / coloring",
    level: 2,
    order: 140,
    core: false,
    teaches: "Greedy colouring: with degree <= 3 and 4 colours, each garden can take any colour its neighbours aren't using.",
    learn: ["dsa_graphs", "dsa-gr-bip"],
    pre: [1971],
    hints: [
      "Each garden has at most 3 neighbours, and there are 4 flower types. Can a garden ever run out of choices?",
      "No. Go through gardens in order and pick the smallest type not used by any already-coloured neighbour."
    ],
    steps: [
      "Build adjacency (1-indexed).",
      "For each garden i: used = {colour of neighbours}; colour[i] = first of 1..4 not in used.",
      "Return the colours."
    ],
    time: "O(n + paths)", space: "O(n + paths)",
    trap: "Backtracking is unnecessary here because the degree bound guarantees a free colour.",
    code: `class Solution:
    def gardenNoAdj(self, n: int, paths: List[List[int]]) -> List[int]:
        adj = [[] for _ in range(n)]
        for a, b in paths:
            adj[a - 1].append(b - 1)
            adj[b - 1].append(a - 1)
        colour = [0] * n
        for i in range(n):
            used = {colour[j] for j in adj[i]}
            colour[i] = next(c for c in range(1, 5) if c not in used)
        return colour
`
  },
  {
    num: 785, title: "Is Graph Bipartite", slug: "is-graph-bipartite", lc: "Medium",
    topic: "graphs",
    pattern: "Bipartite / coloring",
    level: 2,
    order: 150,
    core: true,
    teaches: "Two-colour each component with BFS; an edge between same-coloured nodes means not bipartite.",
    learn: ["dsa_graphs", "dsa-gr-bip"],
    pre: [1971],
    hints: [
      "Bipartite means you can colour nodes with 2 colours so every edge joins different colours.",
      "BFS from each uncoloured node: give it colour 0, its neighbours colour 1, their neighbours 0, ...",
      "If you ever see a neighbour already having the SAME colour as the current node, return False. The graph may be disconnected."
    ],
    steps: [
      "colour = [-1] * n.",
      "For each uncoloured start: colour 0, BFS. For neighbour v: if uncoloured, colour[v] = 1 - colour[u] and enqueue; elif colour[v] == colour[u] return False.",
      "Return True."
    ],
    time: "O(V + E)", space: "O(V)",
    trap: "Only starting from node 0 misses other components.",
    code: `from collections import deque
class Solution:
    def isBipartite(self, graph: List[List[int]]) -> bool:
        n = len(graph)
        colour = [-1] * n
        for s in range(n):
            if colour[s] != -1:
                continue
            colour[s] = 0
            q = deque([s])
            while q:
                u = q.popleft()
                for v in graph[u]:
                    if colour[v] == -1:
                        colour[v] = 1 - colour[u]
                        q.append(v)
                    elif colour[v] == colour[u]:
                        return False
        return True
`
  },
  {
    num: 200, title: "Number of Islands", slug: "number-of-islands", lc: "Medium",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 3,
    order: 160,
    core: true,
    teaches: "Count connected components in a grid: every time you find unvisited land, flood it and add one.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [733],
    hints: [
      "Scan every cell. What should happen when you hit a '1' you have not seen before?",
      "Flood fill from it (DFS or BFS) and mark the whole island visited, e.g. by turning '1' into '0'.",
      "The number of times you start a flood is the answer."
    ],
    steps: [
      "count = 0. For each cell that is '1': count += 1 and flood fill from it, setting each visited cell to '0'.",
      "The flood uses a stack and pushes 4-neighbours that are '1'.",
      "Return count."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Cells are strings '1'/'0', not ints; also mark cells when you push them, or the same cell is pushed many times.",
    code: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        count = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == '1':
                    count += 1
                    grid[i][j] = '0'
                    stack = [(i, j)]
                    while stack:
                        r, c = stack.pop()
                        for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == '1':
                                grid[nr][nc] = '0'
                                stack.append((nr, nc))
        return count
`
  },
  {
    num: 695, title: "Max Area of Island", slug: "max-area-of-island", lc: "Medium",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 3,
    order: 170,
    core: true,
    teaches: "Same flood fill as counting islands, but the flood also returns how many cells it touched.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [200],
    hints: [
      "How would you change Number of Islands so that each flood reports a size?",
      "Count cells as you pop them from the stack; keep the maximum over all islands."
    ],
    steps: [
      "For each land cell: flood fill it, zeroing visited cells and counting them.",
      "best = max(best, size).",
      "Return best (0 when there is no land)."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Return 0, not -1, for a grid with no land.",
    code: `class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        best = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    grid[i][j] = 0
                    stack, size = [(i, j)], 0
                    while stack:
                        r, c = stack.pop()
                        size += 1
                        for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                                grid[nr][nc] = 0
                                stack.append((nr, nc))
                    best = max(best, size)
        return best
`
  },
  {
    num: 1254, title: "Number of Closed Islands", slug: "number-of-closed-islands", lc: "Medium",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 3,
    order: 180,
    core: false,
    teaches: "Flood everything touching the border first; whatever land is left is fully enclosed.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [200],
    hints: [
      "Here 0 is land and 1 is water. Which islands can never be closed?",
      "An island that touches the border is not closed. Erase those first by flood filling from every border land cell.",
      "Then count the remaining islands exactly like Number of Islands."
    ],
    steps: [
      "Flood fill (set to 1) from every 0 on the border.",
      "Scan the inner grid: for every remaining 0, count += 1 and flood fill it.",
      "Return count."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Land is 0 here (reversed from Number of Islands), and a closed island must not touch the border anywhere.",
    code: `class Solution:
    def closedIsland(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        def flood(i, j):
            grid[i][j] = 1
            stack = [(i, j)]
            while stack:
                r, c = stack.pop()
                for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 0:
                        grid[nr][nc] = 1
                        stack.append((nr, nc))
        for i in range(m):
            for j in range(n):
                if (i in (0, m - 1) or j in (0, n - 1)) and grid[i][j] == 0:
                    flood(i, j)
        count = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 0:
                    count += 1
                    flood(i, j)
        return count
`
  },
  {
    num: 1020, title: "Number of Enclaves", slug: "number-of-enclaves", lc: "Medium",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 3,
    order: 190,
    core: false,
    teaches: "Border-first flood fill again: remove land reachable from the edge, then count what is left.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [1254],
    hints: [
      "Which land cells can walk off the grid? Those connected to a border land cell.",
      "Flood fill from every border land cell and erase it; the land cells that remain are the answer."
    ],
    steps: [
      "Flood fill (set to 0) from every border cell that is 1.",
      "Return the number of cells still equal to 1."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "The answer is a count of cells, not of islands.",
    code: `class Solution:
    def numEnclaves(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        stack = []
        for i in range(m):
            for j in range(n):
                if (i in (0, m - 1) or j in (0, n - 1)) and grid[i][j] == 1:
                    grid[i][j] = 0
                    stack.append((i, j))
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                    grid[nr][nc] = 0
                    stack.append((nr, nc))
        return sum(map(sum, grid))
`
  },
  {
    num: 130, title: "Surrounded Regions", slug: "surrounded-regions", lc: "Medium",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 3,
    order: 200,
    core: true,
    teaches: "Mark the 'O's that are safe (connected to the border), then flip everything else.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [1254],
    hints: [
      "Which 'O' cells can never be captured?",
      "Any 'O' connected to a border 'O'. Flood fill from border 'O's and mark them with a temporary symbol like '#'.",
      "Finally turn remaining 'O' into 'X' and '#' back into 'O'."
    ],
    steps: [
      "Flood fill from every border 'O', changing it to '#'.",
      "Scan the board: 'O' -> 'X', '#' -> 'O'.",
      "Modify in place; return nothing."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Trying to decide region by region from the inside is messy; start from the border instead.",
    code: `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        m, n = len(board), len(board[0])
        stack = [(i, j) for i in range(m) for j in range(n)
                 if (i in (0, m - 1) or j in (0, n - 1)) and board[i][j] == 'O']
        for i, j in stack:
            board[i][j] = '#'
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n and board[nr][nc] == 'O':
                    board[nr][nc] = '#'
                    stack.append((nr, nc))
        for i in range(m):
            for j in range(n):
                board[i][j] = 'O' if board[i][j] == '#' else 'X'
`
  },
  {
    num: 1905, title: "Count Sub Islands", slug: "count-sub-islands", lc: "Medium",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 3,
    order: 210,
    core: false,
    teaches: "Flood each island of grid2 and check every one of its cells against grid1.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [200],
    hints: [
      "An island of grid2 is a sub-island when every one of its cells is land in grid1.",
      "Flood fill each grid2 island fully; while flooding, keep a flag that turns False if any cell is water in grid1.",
      "Do not stop early when the flag turns False, or the rest of the island will be counted later as a new island."
    ],
    steps: [
      "For each land cell in grid2: flood fill it (zeroing grid2), ok = True.",
      "For every flooded cell, if grid1 is 0 there, ok = False.",
      "If ok, count += 1. Return count."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Breaking out of the flood as soon as a bad cell appears leaves part of the island unvisited.",
    code: `class Solution:
    def countSubIslands(self, grid1: List[List[int]], grid2: List[List[int]]) -> int:
        m, n = len(grid2), len(grid2[0])
        count = 0
        for i in range(m):
            for j in range(n):
                if grid2[i][j] == 1:
                    grid2[i][j] = 0
                    stack, ok = [(i, j)], True
                    while stack:
                        r, c = stack.pop()
                        if grid1[r][c] == 0:
                            ok = False          # keep flooding anyway
                        for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                            if 0 <= nr < m and 0 <= nc < n and grid2[nr][nc] == 1:
                                grid2[nr][nc] = 0
                                stack.append((nr, nc))
                    count += ok
        return count
`
  },
  {
    num: 1466, title: "Reorder Routes to Make All Paths Lead to the City Zero", slug: "reorder-routes-to-make-all-paths-lead-to-the-city-zero", lc: "Medium",
    topic: "graphs",
    pattern: "DFS on adjacency list",
    level: 3,
    order: 220,
    core: false,
    teaches: "Treat the tree as undirected but remember each edge's original direction; count edges that point away from 0.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [1971],
    hints: [
      "If you DFS outward from city 0, every edge you walk across should point toward 0 (child -> parent).",
      "Store each road twice: (b, cost 1) in a's list for the original a -> b, and (a, cost 0) in b's list.",
      "The answer is the sum of costs of the edges used by the DFS from 0."
    ],
    steps: [
      "For each road a -> b: graph[a].append((b, 1)); graph[b].append((a, 0)).",
      "DFS from 0; when moving to an unvisited neighbour add its cost.",
      "Return the total."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Walking only along original directions from 0 reaches almost nothing; you must traverse both directions.",
    code: `class Solution:
    def minReorder(self, n: int, connections: List[List[int]]) -> int:
        graph = [[] for _ in range(n)]
        for a, b in connections:
            graph[a].append((b, 1))   # points away from 0 if we walk a -> b
            graph[b].append((a, 0))
        seen = [False] * n
        seen[0] = True
        stack, flips = [0], 0
        while stack:
            u = stack.pop()
            for v, cost in graph[u]:
                if not seen[v]:
                    seen[v] = True
                    flips += cost
                    stack.append(v)
        return flips
`
  },
  {
    num: 133, title: "Clone Graph", slug: "clone-graph", lc: "Medium",
    topic: "graphs",
    pattern: "DFS on adjacency list",
    level: 3,
    order: 230,
    core: true,
    teaches: "Copy a graph with DFS/BFS and a dict old-node -> new-node, which doubles as the visited set.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [1971],
    hints: [
      "You need one copy per node, even though a node can be reached many times. What structure remembers 'already copied'?",
      "Keep clones = {original: copy}. When you discover a neighbour that is not in clones, create its copy and schedule it.",
      "For each node you process, append clones[nb] for every neighbour nb to the copy's neighbor list."
    ],
    steps: [
      "If node is None return None.",
      "clones = {node: Node(node.val)}, stack = [node].",
      "Pop u; for each nb: if nb not in clones, create its copy and push nb; append clones[nb] to clones[u].neighbors.",
      "Return clones[node]."
    ],
    time: "O(V + E)", space: "O(V)",
    trap: "Creating a new copy every time you meet a node (instead of reusing the dict entry) breaks cycles and duplicates nodes.",
    code: `"""
# Definition for a Node.
class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
"""
class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if node is None:
            return None
        clones = {node: Node(node.val)}
        stack = [node]
        while stack:
            u = stack.pop()
            for nb in u.neighbors:
                if nb not in clones:
                    clones[nb] = Node(nb.val)
                    stack.append(nb)
                clones[u].neighbors.append(clones[nb])
        return clones[node]
`
  },
  {
    num: 2101, title: "Detonate the Maximum Bombs", slug: "detonate-the-maximum-bombs", lc: "Medium",
    topic: "graphs",
    pattern: "DFS on adjacency list",
    level: 3,
    order: 240,
    core: false,
    teaches: "Build a directed graph (bomb i reaches bomb j) and DFS from every start; keep the largest reach.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [841],
    hints: [
      "Bomb i triggers bomb j when the distance between centres is at most r_i. Is that relation symmetric?",
      "No, so build a DIRECTED edge i -> j when (xi-xj)^2 + (yi-yj)^2 <= ri^2 (compare squares, no sqrt).",
      "n is at most 100: run a DFS from every bomb and count visited nodes."
    ],
    steps: [
      "For every ordered pair (i, j), add edge i -> j if dx*dx + dy*dy <= r_i*r_i.",
      "For each i: DFS from i, count reachable bombs.",
      "Return the maximum count."
    ],
    time: "O(n^3)", space: "O(n^2)",
    trap: "Treating the graph as undirected: a big bomb can reach a small one without the reverse being true.",
    code: `class Solution:
    def maximumDetonation(self, bombs: List[List[int]]) -> int:
        n = len(bombs)
        graph = [[] for _ in range(n)]
        for i, (xi, yi, ri) in enumerate(bombs):
            for j, (xj, yj, _) in enumerate(bombs):
                if i != j and (xi - xj) ** 2 + (yi - yj) ** 2 <= ri * ri:
                    graph[i].append(j)
        best = 0
        for s in range(n):
            seen, stack = {s}, [s]
            while stack:
                for v in graph[stack.pop()]:
                    if v not in seen:
                        seen.add(v)
                        stack.append(v)
            best = max(best, len(seen))
        return best
`
  },
  {
    num: 1091, title: "Shortest Path in Binary Matrix", slug: "shortest-path-in-binary-matrix", lc: "Medium",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 3,
    order: 250,
    core: true,
    teaches: "Grid BFS with 8 directions; the answer counts cells on the path, so the start is distance 1.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1926],
    hints: [
      "Moves can be diagonal, so each cell has up to 8 neighbours. All moves cost the same.",
      "BFS from (0, 0) with distance 1; mark cells visited when you push them.",
      "Check the start and end cells first: if either is 1 there is no path."
    ],
    steps: [
      "If grid[0][0] or grid[n-1][n-1] is 1 return -1.",
      "BFS from (0, 0, 1) over the 8 neighbours with value 0, marking them as you push.",
      "Return the distance when (n-1, n-1) is popped; -1 if never reached."
    ],
    time: "O(n^2)", space: "O(n^2)",
    trap: "The path length counts cells, not moves: a 1x1 grid [[0]] answers 1.",
    code: `from collections import deque
class Solution:
    def shortestPathBinaryMatrix(self, grid: List[List[int]]) -> int:
        n = len(grid)
        if grid[0][0] or grid[n-1][n-1]:
            return -1
        grid[0][0] = 1
        q = deque([(0, 0, 1)])
        while q:
            r, c, d = q.popleft()
            if r == n - 1 and c == n - 1:
                return d
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                        grid[nr][nc] = 1
                        q.append((nr, nc, d + 1))
        return -1
`
  },
  {
    num: 752, title: "Open the Lock", slug: "open-the-lock", lc: "Medium",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 3,
    order: 260,
    core: false,
    teaches: "BFS over states, not cells: each lock combination is a node with 8 neighbours.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1926],
    hints: [
      "Think of every 4-digit string as a node. Which strings are one move away from '0000'?",
      "Each of the 4 wheels can turn up or down: 8 neighbours. BFS from '0000', skipping deadends.",
      "Put the deadends into the visited set from the start; check whether '0000' itself is a deadend."
    ],
    steps: [
      "seen = set(deadends); if '0000' in seen return -1.",
      "BFS from ('0000', 0). For each state, generate 8 neighbours by turning one digit +1 or -1 mod 10.",
      "Return the step count when target is popped; -1 if the queue empties."
    ],
    time: "O(10^4 * 8)", space: "O(10^4)",
    trap: "'0000' may itself be a deadend; and the wheel wraps: 9 + 1 = 0, 0 - 1 = 9.",
    code: `from collections import deque
class Solution:
    def openLock(self, deadends: List[str], target: str) -> int:
        seen = set(deadends)
        if '0000' in seen:
            return -1
        seen.add('0000')
        q = deque([('0000', 0)])
        while q:
            s, d = q.popleft()
            if s == target:
                return d
            for i in range(4):
                x = int(s[i])
                for y in ((x + 1) % 10, (x - 1) % 10):
                    t = s[:i] + str(y) + s[i+1:]
                    if t not in seen:
                        seen.add(t)
                        q.append((t, d + 1))
        return -1
`
  },
  {
    num: 433, title: "Minimum Genetic Mutation", slug: "minimum-genetic-mutation", lc: "Medium",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 3,
    order: 270,
    core: false,
    teaches: "State BFS where the allowed states come from a word bank: change one letter at a time.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [752],
    hints: [
      "Each gene string is a node; two genes are neighbours if they differ in one position and the new one is in the bank.",
      "BFS from startGene, trying all 8 positions x 4 letters, keeping only strings in the bank set.",
      "Remove (or mark) bank strings once visited."
    ],
    steps: [
      "bank = set(bank); if endGene not in bank return -1 (unless start == end).",
      "BFS from (startGene, 0). For each position and each letter in 'ACGT', form the new string; if it is in bank and unseen, push it.",
      "Return steps when endGene is popped; -1 otherwise."
    ],
    time: "O(B * 8 * 4)", space: "O(B)",
    trap: "The start gene need not be in the bank, but every intermediate and the end gene must be.",
    code: `from collections import deque
class Solution:
    def minMutation(self, startGene: str, endGene: str, bank: List[str]) -> int:
        bank = set(bank)
        q = deque([(startGene, 0)])
        seen = {startGene}
        while q:
            g, d = q.popleft()
            if g == endGene:
                return d
            for i in range(len(g)):
                for ch in 'ACGT':
                    t = g[:i] + ch + g[i+1:]
                    if t in bank and t not in seen:
                        seen.add(t)
                        q.append((t, d + 1))
        return -1
`
  },
  {
    num: 994, title: "Rotting Oranges", slug: "rotting-oranges", lc: "Medium",
    topic: "graphs",
    pattern: "Multi-source BFS",
    level: 3,
    order: 280,
    core: true,
    teaches: "Multi-source BFS measured in rounds: each BFS level is one minute.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1765],
    hints: [
      "All rotten oranges spread at the same time. Which BFS variant models several starting points?",
      "Enqueue every rotten orange first and count fresh ones. Process the queue one level (one minute) at a time.",
      "At the end, if any fresh orange is left the answer is -1."
    ],
    steps: [
      "Queue all 2-cells; fresh = number of 1-cells; minutes = 0.",
      "While queue and fresh > 0: process one whole level, rotting fresh neighbours (fresh -= 1); minutes += 1.",
      "Return minutes if fresh == 0 else -1."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "With no fresh oranges the answer is 0, even if there are no rotten ones; don't count a final empty level as a minute.",
    code: `from collections import deque
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        q = deque()
        fresh = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 2:
                    q.append((i, j))
                elif grid[i][j] == 1:
                    fresh += 1
        minutes = 0
        while q and fresh:
            for _ in range(len(q)):              # one minute = one BFS level
                r, c = q.popleft()
                for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        q.append((nr, nc))
            minutes += 1
        return minutes if fresh == 0 else -1
`
  },
  {
    num: 542, title: "01 Matrix", slug: "01-matrix", lc: "Medium",
    topic: "graphs",
    pattern: "Multi-source BFS",
    level: 3,
    order: 290,
    core: true,
    teaches: "Distance to the nearest 0 for every cell = one multi-source BFS starting from all zeros.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1765],
    hints: [
      "BFS from each 1 to find a 0 is too slow. Flip the direction.",
      "Start from every 0 at distance 0 and expand outwards; the first time a 1-cell is reached gives its distance."
    ],
    steps: [
      "dist = 0 for zeros (enqueue them), -1 (unknown) for ones.",
      "BFS: for each neighbour with dist -1, set dist = dist[cur] + 1 and enqueue.",
      "Return dist."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Starting a BFS from every 1 separately is O((mn)^2) and times out.",
    code: `from collections import deque
class Solution:
    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:
        m, n = len(mat), len(mat[0])
        dist = [[-1] * n for _ in range(m)]
        q = deque()
        for i in range(m):
            for j in range(n):
                if mat[i][j] == 0:
                    dist[i][j] = 0
                    q.append((i, j))
        while q:
            r, c = q.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n and dist[nr][nc] == -1:
                    dist[nr][nc] = dist[r][c] + 1
                    q.append((nr, nc))
        return dist
`
  },
  {
    num: 1162, title: "As Far from Land as Possible", slug: "as-far-from-land-as-possible", lc: "Medium",
    topic: "graphs",
    pattern: "Multi-source BFS",
    level: 3,
    order: 300,
    core: false,
    teaches: "Multi-source BFS from all land cells; the last water cell reached is the farthest from land.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [542],
    hints: [
      "You want, for each water cell, the distance to the nearest land; then take the maximum.",
      "Multi-source BFS from all land cells. The distance of the last cell popped is the answer.",
      "If the grid is all land or all water, return -1."
    ],
    steps: [
      "Enqueue all land cells. If none or all cells are land, return -1.",
      "BFS level by level, turning reached water into land (mark visited).",
      "Return the number of levels expanded (distance of the last reached cell)."
    ],
    time: "O(n^2)", space: "O(n^2)",
    trap: "All-land and all-water grids both answer -1.",
    code: `from collections import deque
class Solution:
    def maxDistance(self, grid: List[List[int]]) -> int:
        n = len(grid)
        q = deque((i, j) for i in range(n) for j in range(n) if grid[i][j] == 1)
        if len(q) in (0, n * n):
            return -1
        dist = -1
        while q:
            dist += 1
            for _ in range(len(q)):
                r, c = q.popleft()
                for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                    if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                        grid[nr][nc] = 1
                        q.append((nr, nc))
        return dist
`
  },
  {
    num: 2115, title: "Find All Possible Recipes from Given Supplies", slug: "find-all-possible-recipes-from-given-supplies", lc: "Medium",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 3,
    order: 310,
    core: false,
    teaches: "Kahn's algorithm on a dependency graph: an item becomes available when all of its inputs are available.",
    learn: ["dsa_graphs", "dsa-gr-topo"],
    pre: [1557],
    hints: [
      "Draw an edge ingredient -> recipe. A recipe can be made once all its incoming ingredients are made.",
      "Use in-degree = number of ingredients still missing. Start the queue with the supplies.",
      "When you pop an item, decrement the in-degree of every recipe that uses it; at 0 the recipe is made and enters the queue."
    ],
    steps: [
      "indeg[recipe] = len(ingredients); users[ing].append(recipe).",
      "queue = supplies. Pop x; for each recipe r in users[x]: indeg[r] -= 1; if 0, add r to answer and queue.",
      "Return the answer list."
    ],
    time: "O(total ingredients + supplies)", space: "O(total ingredients)",
    trap: "Recipes in a cycle (a needs b, b needs a) never reach in-degree 0, so Kahn's correctly leaves them out.",
    code: `from collections import defaultdict, deque
class Solution:
    def findAllRecipes(self, recipes: List[str], ingredients: List[List[str]], supplies: List[str]) -> List[str]:
        indeg = {}
        users = defaultdict(list)
        for r, ings in zip(recipes, ingredients):
            indeg[r] = len(ings)
            for ing in ings:
                users[ing].append(r)
        q = deque(supplies)
        made = []
        while q:
            x = q.popleft()
            for r in users[x]:
                indeg[r] -= 1
                if indeg[r] == 0:
                    made.append(r)
                    q.append(r)
        return made
`
  },
  {
    num: 2192, title: "All Ancestors of a Node in a Directed Acyclic Graph", slug: "all-ancestors-of-a-node-in-a-directed-acyclic-graph", lc: "Medium",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 3,
    order: 320,
    core: false,
    teaches: "Push ancestry down the DAG: DFS from each node in increasing order and append it to every descendant.",
    learn: ["dsa_graphs", "dsa-gr-topo"],
    pre: [1557],
    hints: [
      "Finding ancestors of a node means walking edges backwards. Is there an easier direction?",
      "Walk forward instead: from node i, every node you can reach has i as an ancestor.",
      "Do this for i = 0, 1, 2, ... so each answer list is filled in sorted order automatically."
    ],
    steps: [
      "Build children lists.",
      "For i in 0..n-1: DFS from i with a fresh visited set; append i to ans[v] for every reached v != i.",
      "Return ans."
    ],
    time: "O(n * (n + m))", space: "O(n + m)",
    trap: "Merging ancestor sets in topological order also works, but then you must sort and deduplicate each list.",
    code: `class Solution:
    def getAncestors(self, n: int, edges: List[List[int]]) -> List[List[int]]:
        children = [[] for _ in range(n)]
        for a, b in edges:
            children[a].append(b)
        ans = [[] for _ in range(n)]
        for i in range(n):
            seen = [False] * n
            stack = [i]
            while stack:
                u = stack.pop()
                for v in children[u]:
                    if not seen[v]:
                        seen[v] = True
                        ans[v].append(i)        # i < next i, so lists stay sorted
                        stack.append(v)
        return ans
`
  },
  {
    num: 851, title: "Loud and Rich", slug: "loud-and-rich", lc: "Medium",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 3,
    order: 330,
    core: false,
    teaches: "DFS with memoization on a DAG: a node's answer is the best of itself and its parents' answers.",
    learn: ["dsa_graphs", "dsa-gr-topo"],
    pre: [2192],
    hints: [
      "For person x you need the quietest among x and everyone richer than x. The 'richer' relation is a DAG.",
      "Point edges from poorer to richer: graph[b].append(a) for each (a richer than b).",
      "ans(x) = x or ans(y) for some richer neighbour y, whichever has the smaller quiet value; memoize."
    ],
    steps: [
      "Build richer lists: for (a, b) add a to graph[b].",
      "dfs(x): if memo, return it; best = x; for y in graph[x]: c = dfs(y); if quiet[c] < quiet[best], best = c.",
      "Return [dfs(x) for x in range(n)]."
    ],
    time: "O(n + m)", space: "O(n + m)",
    trap: "Without memoization the same richer chains are explored again and again (exponential in the worst case).",
    code: `import sys
class Solution:
    def loudAndRich(self, richer: List[List[int]], quiet: List[int]) -> List[int]:
        sys.setrecursionlimit(10000)
        n = len(quiet)
        graph = [[] for _ in range(n)]
        for a, b in richer:
            graph[b].append(a)              # a is richer than b
        ans = [-1] * n
        def dfs(x):
            if ans[x] == -1:
                best = x
                for y in graph[x]:
                    c = dfs(y)
                    if quiet[c] < quiet[best]:
                        best = c
                ans[x] = best
            return ans[x]
        return [dfs(x) for x in range(n)]
`
  },
  {
    num: 1559, title: "Detect Cycles in 2D Grid", slug: "detect-cycles-in-2d-grid", lc: "Medium",
    topic: "graphs",
    pattern: "Cycle detection",
    level: 3,
    order: 340,
    core: false,
    teaches: "Undirected cycle detection: during a traversal, reaching an already-visited cell that is not your parent means a cycle.",
    learn: ["dsa_graphs", "dsa-gr-cycle"],
    pre: [200],
    hints: [
      "In an undirected graph, every edge looks back at the node you came from. That is not a cycle.",
      "Traverse each same-letter region remembering each cell's parent. Seeing a visited neighbour that is not the parent proves a cycle.",
      "BFS works as well as DFS here because any non-tree edge closes a cycle."
    ],
    steps: [
      "For each unvisited cell, BFS over same-letter neighbours with (cell, parent).",
      "If a neighbour is visited and is not the parent, return True; otherwise mark and enqueue it with parent = current.",
      "Return False after all regions."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Without the parent check, the edge you just walked along looks like a cycle of length 2.",
    code: `from collections import deque
class Solution:
    def containsCycle(self, grid: List[List[str]]) -> bool:
        m, n = len(grid), len(grid[0])
        seen = [[False] * n for _ in range(m)]
        for i in range(m):
            for j in range(n):
                if seen[i][j]:
                    continue
                seen[i][j] = True
                q = deque([(i, j, -1, -1)])
                while q:
                    r, c, pr, pc = q.popleft()
                    for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                        if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == grid[r][c]:
                            if (nr, nc) == (pr, pc):
                                continue
                            if seen[nr][nc]:
                                return True
                            seen[nr][nc] = True
                            q.append((nr, nc, r, c))
        return False
`
  },
  {
    num: 684, title: "Redundant Connection", slug: "redundant-connection", lc: "Medium",
    topic: "graphs",
    pattern: "Union-Find",
    level: 3,
    order: 350,
    core: true,
    teaches: "Add edges one by one with Union-Find; the first edge whose ends are already connected closes a cycle.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [990],
    hints: [
      "A tree plus one edge has exactly one cycle. Which edge is redundant?",
      "Process edges in order. If find(a) == find(b) before you union them, this edge connects two already-connected nodes.",
      "Because you process in order, that is also the last such edge in the input."
    ],
    steps: [
      "parent = list(range(n + 1)).",
      "For each (a, b): ra, rb = find(a), find(b); if equal return [a, b]; else parent[ra] = rb."
    ],
    time: "O(n * alpha(n))", space: "O(n)",
    trap: "Nodes are 1-indexed, so size the parent array n + 1.",
    code: `class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        parent = list(range(len(edges) + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return [a, b]
            parent[ra] = rb
        return []
`
  },
  {
    num: 1319, title: "Number of Operations to Make Network Connected", slug: "number-of-operations-to-make-network-connected", lc: "Medium",
    topic: "graphs",
    pattern: "Union-Find",
    level: 3,
    order: 360,
    core: false,
    teaches: "Components minus one cables are needed, and you can only move cables you have spare (edges >= n - 1).",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [684],
    hints: [
      "How many cables does it take to join k separate components?",
      "k - 1. You also need at least n - 1 cables in total; otherwise it is impossible.",
      "Count components with Union-Find (start at n, subtract 1 per successful union)."
    ],
    steps: [
      "If len(connections) < n - 1 return -1.",
      "comps = n; for each (a, b): if union succeeds, comps -= 1.",
      "Return comps - 1."
    ],
    time: "O(m * alpha(n))", space: "O(n)",
    trap: "Check the cable count first; with too few cables the answer is -1 no matter how they are arranged.",
    code: `class Solution:
    def makeConnected(self, n: int, connections: List[List[int]]) -> int:
        if len(connections) < n - 1:
            return -1
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        comps = n
        for a, b in connections:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
                comps -= 1
        return comps - 1
`
  },
  {
    num: 2492, title: "Minimum Score of a Path Between Two Cities", slug: "minimum-score-of-a-path-between-two-cities", lc: "Medium",
    topic: "graphs",
    pattern: "Union-Find",
    level: 3,
    order: 370,
    core: false,
    teaches: "You may revisit roads, so the answer is simply the smallest road anywhere in city 1's component.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [684],
    hints: [
      "Paths can repeat roads and cities. Which roads could a path from 1 to n possibly use?",
      "Any road in the connected component containing 1 (and n). So the score is the minimum distance in that component.",
      "Union all roads, then take the min over roads whose endpoint is in find(1)'s set."
    ],
    steps: [
      "Union every road.",
      "root = find(1).",
      "Return min(d for a, b, d in roads if find(a) == root)."
    ],
    time: "O(m * alpha(n))", space: "O(n)",
    trap: "Running Dijkstra for a shortest path answers a different question; the path need not be simple.",
    code: `class Solution:
    def minScore(self, n: int, roads: List[List[int]]) -> int:
        parent = list(range(n + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a, b, _ in roads:
            parent[find(a)] = find(b)
        root = find(1)
        return min(d for a, b, d in roads if find(a) == root)
`
  },
  {
    num: 1514, title: "Path with Maximum Probability", slug: "path-with-maximum-probability", lc: "Medium",
    topic: "graphs",
    pattern: "Weighted shortest path",
    level: 3,
    order: 380,
    core: false,
    teaches: "Dijkstra works for 'best product of probabilities' too: use a max-heap since multiplying by p <= 1 never improves.",
    learn: ["dsa_graphs", "dsa-gr-sp"],
    pre: [743],
    hints: [
      "Dijkstra needs that extending a path never makes it better. Does multiplying by a probability <= 1 satisfy that?",
      "Yes. Run Dijkstra with a max-heap (push negative probabilities) starting from (1.0, start).",
      "The first time you pop end, its probability is optimal."
    ],
    steps: [
      "Build an undirected adjacency list with probabilities.",
      "best = [0.0] * n; best[start] = 1.0; heap = [(-1.0, start)].",
      "Pop (-p, u); if u == end return p; skip if p < best[u]; relax neighbours with p * w when it improves best[v].",
      "Return 0.0 if end is never popped."
    ],
    time: "O(E log V)", space: "O(V + E)",
    trap: "The graph is undirected: add each edge in both directions.",
    code: `import heapq
class Solution:
    def maxProbability(self, n: int, edges: List[List[int]], succProb: List[float], start_node: int, end_node: int) -> float:
        adj = [[] for _ in range(n)]
        for (a, b), p in zip(edges, succProb):
            adj[a].append((b, p))
            adj[b].append((a, p))
        best = [0.0] * n
        best[start_node] = 1.0
        heap = [(-1.0, start_node)]
        while heap:
            p, u = heapq.heappop(heap)
            p = -p
            if u == end_node:
                return p
            if p < best[u]:
                continue
            for v, w in adj[u]:
                if p * w > best[v]:
                    best[v] = p * w
                    heapq.heappush(heap, (-best[v], v))
        return 0.0
`
  },
  {
    num: 1334, title: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", slug: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", lc: "Medium",
    topic: "graphs",
    pattern: "Weighted shortest path",
    level: 3,
    order: 390,
    core: false,
    teaches: "Floyd-Warshall: all-pairs shortest paths with three nested loops, ideal when n is small (<= 100).",
    learn: ["dsa_graphs", "dsa-gr-sp"],
    pre: [743],
    hints: [
      "You need distances between every pair of cities. Running Dijkstra n times works; is there a shorter-to-write option?",
      "Floyd-Warshall: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]) for every k, i, j (k is the OUTER loop).",
      "Count reachable cities within the threshold for each city; ties go to the larger index."
    ],
    steps: [
      "dist = INF matrix, 0 on the diagonal, edge weights both ways.",
      "for k: for i: for j: relax through k.",
      "For each city count j != i with dist <= threshold; pick the smallest count, preferring the larger city index."
    ],
    time: "O(n^3)", space: "O(n^2)",
    trap: "The k loop must be outermost; putting it inside gives wrong distances.",
    code: `class Solution:
    def findTheCity(self, n: int, edges: List[List[int]], distanceThreshold: int) -> int:
        INF = float('inf')
        dist = [[INF] * n for _ in range(n)]
        for i in range(n):
            dist[i][i] = 0
        for a, b, w in edges:
            dist[a][b] = dist[b][a] = min(dist[a][b], w)
        for k in range(n):
            dk = dist[k]
            for i in range(n):
                di = dist[i]
                if di[k] == INF:
                    continue
                for j in range(n):
                    if di[k] + dk[j] < di[j]:
                        di[j] = di[k] + dk[j]
        best_city, best_cnt = -1, INF
        for i in range(n):
            cnt = sum(1 for j in range(n) if j != i and dist[i][j] <= distanceThreshold)
            if cnt <= best_cnt:                 # '<=' prefers the larger index
                best_city, best_cnt = i, cnt
        return best_city
`
  },
  {
    num: 1584, title: "Min Cost to Connect All Points", slug: "min-cost-to-connect-all-points", lc: "Medium",
    topic: "graphs",
    pattern: "Minimum spanning tree",
    level: 3,
    order: 400,
    core: true,
    teaches: "Prim's algorithm on a dense (complete) graph: an O(n^2) array version beats sorting all n^2 edges.",
    learn: ["dsa_graphs", "dsa-gr-mst"],
    pre: [743],
    hints: [
      "Connecting all points as cheaply as possible is a minimum spanning tree. Every pair of points is an edge.",
      "Prim's: grow a tree from point 0; keep best[v] = cheapest edge from the tree to v.",
      "With a complete graph, scanning an array for the minimum each step (O(n^2)) is simpler and faster than a heap."
    ],
    steps: [
      "best = [INF] * n; best[0] = 0; in_tree = [False] * n; total = 0.",
      "Repeat n times: pick u not in tree with smallest best; add best[u] to total; mark it.",
      "For every v not in tree: best[v] = min(best[v], manhattan(u, v)).",
      "Return total."
    ],
    time: "O(n^2)", space: "O(n)",
    trap: "Kruskal with all n^2 edges sorted is O(n^2 log n) and heavy on memory for n = 1000.",
    code: `class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        INF = float('inf')
        best = [INF] * n
        best[0] = 0
        in_tree = [False] * n
        total = 0
        for _ in range(n):
            u = min((i for i in range(n) if not in_tree[i]), key=best.__getitem__)
            in_tree[u] = True
            total += best[u]
            ux, uy = points[u]
            for v in range(n):
                if not in_tree[v]:
                    d = abs(ux - points[v][0]) + abs(uy - points[v][1])
                    if d < best[v]:
                        best[v] = d
        return total
`
  },
  {
    num: 886, title: "Possible Bipartition", slug: "possible-bipartition", lc: "Medium",
    topic: "graphs",
    pattern: "Bipartite / coloring",
    level: 3,
    order: 410,
    core: false,
    teaches: "Build the graph from the 'dislike' pairs yourself, then run the same two-colouring check.",
    learn: ["dsa_graphs", "dsa-gr-bip"],
    pre: [785],
    hints: [
      "Two groups where no dislike pair is in the same group: that is exactly a 2-colouring.",
      "Build an undirected graph from dislikes (1-indexed) and run the bipartite BFS from every uncoloured person."
    ],
    steps: [
      "adj from dislikes; colour = [-1] * (n + 1).",
      "BFS two-colouring from each uncoloured node; conflict -> False.",
      "Return True."
    ],
    time: "O(n + d)", space: "O(n + d)",
    trap: "People are numbered 1..n, and people with no dislikes are free to go anywhere.",
    code: `from collections import deque
class Solution:
    def possibleBipartition(self, n: int, dislikes: List[List[int]]) -> bool:
        adj = [[] for _ in range(n + 1)]
        for a, b in dislikes:
            adj[a].append(b)
            adj[b].append(a)
        colour = [-1] * (n + 1)
        for s in range(1, n + 1):
            if colour[s] != -1:
                continue
            colour[s] = 0
            q = deque([s])
            while q:
                u = q.popleft()
                for v in adj[u]:
                    if colour[v] == -1:
                        colour[v] = 1 - colour[u]
                        q.append(v)
                    elif colour[v] == colour[u]:
                        return False
        return True
`
  },
  {
    num: 417, title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow", lc: "Medium",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 4,
    order: 420,
    core: true,
    teaches: "Reverse the flow: search uphill from each ocean, then take the cells both searches reach.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [130],
    hints: [
      "Searching from every cell is O((mn)^2). Can you search from the oceans instead?",
      "Water flows downhill from a cell to the ocean, so from the ocean you can walk uphill (to neighbours with height >= current).",
      "Run one search from all Pacific border cells and one from all Atlantic border cells; answer = cells in both sets."
    ],
    steps: [
      "pac = cells reachable going uphill from the top row and left column.",
      "atl = cells reachable going uphill from the bottom row and right column.",
      "Return every cell in pac and atl."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "The uphill condition is heights[next] >= heights[cur] (equal heights still flow).",
    code: `class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        m, n = len(heights), len(heights[0])
        def climb(starts):
            seen = set(starts)
            stack = list(starts)
            while stack:
                r, c = stack.pop()
                for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                    if (0 <= nr < m and 0 <= nc < n and (nr, nc) not in seen
                            and heights[nr][nc] >= heights[r][c]):
                        seen.add((nr, nc))
                        stack.append((nr, nc))
            return seen
        pac = climb([(0, j) for j in range(n)] + [(i, 0) for i in range(m)])
        atl = climb([(m - 1, j) for j in range(n)] + [(i, n - 1) for i in range(m)])
        return [[r, c] for r, c in pac & atl]
`
  },
  {
    num: 399, title: "Evaluate Division", slug: "evaluate-division", lc: "Medium",
    topic: "graphs",
    pattern: "DFS on adjacency list",
    level: 4,
    order: 430,
    core: false,
    teaches: "Each equation a / b = k is a weighted edge a -> b (k) and b -> a (1/k); a query is the product along a path.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [1971],
    hints: [
      "If a / b = 2 and b / c = 3, how do you get a / c?",
      "Multiply along the path a -> b -> c. Build a graph with weight k on a -> b and 1/k on b -> a.",
      "For each query, DFS from the numerator carrying the running product; unknown variables give -1."
    ],
    steps: [
      "Build graph[a].append((b, k)) and graph[b].append((a, 1/k)).",
      "For query (x, y): if either is unknown return -1.0; else DFS from x with product 1.0.",
      "When you reach y return the product; if DFS finishes without reaching it return -1.0."
    ],
    time: "O(Q * (V + E))", space: "O(V + E)",
    trap: "x / x is 1.0 only if x appears in the equations; an unknown variable over itself is -1.0.",
    code: `from collections import defaultdict
class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        graph = defaultdict(list)
        for (a, b), k in zip(equations, values):
            graph[a].append((b, k))
            graph[b].append((a, 1.0 / k))
        def solve(x, y):
            if x not in graph or y not in graph:
                return -1.0
            stack, seen = [(x, 1.0)], {x}
            while stack:
                u, prod = stack.pop()
                if u == y:
                    return prod
                for v, w in graph[u]:
                    if v not in seen:
                        seen.add(v)
                        stack.append((v, prod * w))
            return -1.0
        return [solve(x, y) for x, y in queries]
`
  },
  {
    num: 1129, title: "Shortest Path with Alternating Colors", slug: "shortest-path-with-alternating-colors", lc: "Medium",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 4,
    order: 440,
    core: false,
    teaches: "When the rule depends on how you arrived, make that part of the BFS state: (node, colour of last edge).",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1091],
    hints: [
      "Visiting a node after a red edge is different from visiting it after a blue edge. How do you track that?",
      "Use states (node, lastColour). From a state with last colour red you may only take blue edges, and vice versa.",
      "Start BFS from both (0, red) and (0, blue) at distance 0; the answer for a node is the first time any of its states is reached."
    ],
    steps: [
      "Build red and blue adjacency lists.",
      "BFS over (node, colour) starting from (0, 0) and (0, 1); from colour c follow edges of colour 1 - c.",
      "ans[node] = distance when the node is first popped; nodes never reached stay -1."
    ],
    time: "O(n + r + b)", space: "O(n + r + b)",
    trap: "Marking only nodes (not node+colour) as visited loses paths that arrive with the other colour.",
    code: `from collections import deque
class Solution:
    def shortestAlternatingPaths(self, n: int, redEdges: List[List[int]], blueEdges: List[List[int]]) -> List[int]:
        adj = [[[] for _ in range(n)] for _ in range(2)]   # adj[colour][u]
        for a, b in redEdges:
            adj[0][a].append(b)
        for a, b in blueEdges:
            adj[1][a].append(b)
        ans = [-1] * n
        seen = {(0, 0), (0, 1)}
        q = deque([(0, 0, 0), (0, 1, 0)])          # node, colour of last edge, dist
        while q:
            u, c, d = q.popleft()
            if ans[u] == -1:
                ans[u] = d
            for v in adj[1 - c][u]:
                if (v, 1 - c) not in seen:
                    seen.add((v, 1 - c))
                    q.append((v, 1 - c, d + 1))
        return ans
`
  },
  {
    num: 909, title: "Snakes and Ladders", slug: "snakes-and-ladders", lc: "Medium",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 4,
    order: 450,
    core: false,
    teaches: "BFS on squares 1..n*n where each dice roll is an edge; the tricky part is mapping a square number to (row, col).",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1091],
    hints: [
      "Each square is a node; from square s you can move to s+1 .. s+6, then follow a snake or ladder if present.",
      "Write a helper: square s -> row and column on a board numbered from the bottom-left in alternating directions.",
      "BFS from square 1; the first time you reach n*n gives the minimum number of rolls."
    ],
    steps: [
      "pos(s): q, r = divmod(s - 1, n); row = n - 1 - q; col = r if q is even else n - 1 - r.",
      "BFS from 1. For each next in s+1..min(s+6, n*n): if board at pos(next) != -1, next = that value.",
      "If next == n*n return moves + 1; push unseen squares. Return -1 if unreachable."
    ],
    time: "O(n^2)", space: "O(n^2)",
    trap: "You take at most one snake or ladder per move: do not chain them, and mark the destination (not the landing square) as visited.",
    code: `from collections import deque
class Solution:
    def snakesAndLadders(self, board: List[List[int]]) -> int:
        n = len(board)
        def cell(s):
            q, r = divmod(s - 1, n)
            row = n - 1 - q
            col = r if q % 2 == 0 else n - 1 - r
            return board[row][col]
        target = n * n
        if target == 1:
            return 0
        seen = {1}
        q = deque([(1, 0)])
        while q:
            s, moves = q.popleft()
            for nxt in range(s + 1, min(s + 6, target) + 1):
                dest = cell(nxt)
                if dest != -1:
                    nxt = dest
                if nxt == target:
                    return moves + 1
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, moves + 1))
        return -1
`
  },
  {
    num: 934, title: "Shortest Bridge", slug: "shortest-bridge", lc: "Medium",
    topic: "graphs",
    pattern: "Multi-source BFS",
    level: 4,
    order: 460,
    core: false,
    teaches: "Combine DFS and BFS: flood one island to collect it, then multi-source BFS outward until you touch the other.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [994, 200],
    hints: [
      "The bridge length is the shortest water distance between the two islands.",
      "Find any land cell and flood fill its whole island (DFS), putting every cell in a queue.",
      "Multi-source BFS from that queue over water; the level at which you first step on a 1 is the answer."
    ],
    steps: [
      "Find the first 1; DFS its island, marking cells 2 and adding them to a deque.",
      "BFS level by level: for each neighbour, if it is 1 return the current level; if it is 0 mark 2 and enqueue.",
      "Level counts flipped water cells."
    ],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Mark the first island before BFS starts, or BFS will think it touched 'the other island' immediately.",
    code: `from collections import deque
class Solution:
    def shortestBridge(self, grid: List[List[int]]) -> int:
        n = len(grid)
        si, sj = next((i, j) for i in range(n) for j in range(n) if grid[i][j] == 1)
        q = deque()
        stack = [(si, sj)]
        grid[si][sj] = 2
        while stack:                              # DFS: collect the first island
            r, c = stack.pop()
            q.append((r, c))
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    stack.append((nr, nc))
        steps = 0
        while q:                                  # BFS: grow it until we touch island 2
            for _ in range(len(q)):
                r, c = q.popleft()
                for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                    if 0 <= nr < n and 0 <= nc < n:
                        if grid[nr][nc] == 1:
                            return steps
                        if grid[nr][nc] == 0:
                            grid[nr][nc] = 2
                            q.append((nr, nc))
            steps += 1
        return -1
`
  },
  {
    num: 207, title: "Course Schedule", slug: "course-schedule", lc: "Medium",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 4,
    order: 470,
    core: true,
    teaches: "Kahn's algorithm doubles as cycle detection: if you cannot process every node, a cycle blocks them.",
    learn: ["dsa_graphs", "dsa-gr-cycle"],
    pre: [2115],
    hints: [
      "Courses and prerequisites form a directed graph. When is it impossible to finish?",
      "Exactly when there is a cycle. Kahn's: repeatedly take a course with no remaining prerequisites (in-degree 0).",
      "Count the courses you take; if the count is less than numCourses, some cycle prevented the rest."
    ],
    steps: [
      "Build adj[pre].append(course) and indeg[course] += 1.",
      "Queue all courses with indeg 0. Pop, count += 1, decrement each neighbour's indeg; enqueue at 0.",
      "Return count == numCourses."
    ],
    time: "O(V + E)", space: "O(V + E)",
    trap: "Edge direction: [a, b] means b must come before a, so the edge is b -> a.",
    code: `from collections import deque
class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        adj = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            adj[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        taken = 0
        while q:
            u = q.popleft()
            taken += 1
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    q.append(v)
        return taken == numCourses
`
  },
  {
    num: 210, title: "Course Schedule II", slug: "course-schedule-ii", lc: "Medium",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 4,
    order: 480,
    core: true,
    teaches: "Kahn's algorithm again, but record the order in which nodes leave the queue: that is a topological order.",
    learn: ["dsa_graphs", "dsa-gr-topo"],
    pre: [207],
    hints: [
      "Course Schedule told you whether an order exists. What do you get if you write down the pop order?",
      "The pop order of Kahn's algorithm is a valid order; return [] if it does not contain every course."
    ],
    steps: [
      "Same setup as Course Schedule: adj and indeg.",
      "Queue in-degree-0 courses; append each popped course to order and relax its neighbours.",
      "Return order if len(order) == numCourses else []."
    ],
    time: "O(V + E)", space: "O(V + E)",
    trap: "Returning a partial order when a cycle exists; the problem wants [] in that case.",
    code: `from collections import deque
class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        adj = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            adj[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        order = []
        while q:
            u = q.popleft()
            order.append(u)
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    q.append(v)
        return order if len(order) == numCourses else []
`
  },
  {
    num: 310, title: "Minimum Height Trees", slug: "minimum-height-trees", lc: "Medium",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 4,
    order: 490,
    core: false,
    teaches: "Peel leaves layer by layer (Kahn's on an undirected tree); the last 1 or 2 nodes are the centres.",
    learn: ["dsa_graphs", "dsa-gr-topo"],
    pre: [210],
    hints: [
      "Rooting at a leaf gives a tall tree. Where would the best root be?",
      "In the middle of the longest path. Remove all leaves (degree 1) at once, again and again, like peeling an onion.",
      "Stop when at most 2 nodes remain; they are the answer."
    ],
    steps: [
      "If n <= 2 return list(range(n)).",
      "Compute degrees; leaves = nodes with degree 1; remaining = n.",
      "While remaining > 2: remaining -= len(leaves); for each leaf decrement its neighbour's degree, collecting new leaves.",
      "Return leaves."
    ],
    time: "O(n)", space: "O(n)",
    trap: "n == 1 has no edges: the answer is [0].",
    code: `class Solution:
    def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:
        if n <= 2:
            return list(range(n))
        adj = [set() for _ in range(n)]
        for a, b in edges:
            adj[a].add(b)
            adj[b].add(a)
        leaves = [i for i in range(n) if len(adj[i]) == 1]
        remaining = n
        while remaining > 2:
            remaining -= len(leaves)
            new = []
            for leaf in leaves:
                nb = adj[leaf].pop()
                adj[nb].remove(leaf)
                if len(adj[nb]) == 1:
                    new.append(nb)
            leaves = new
        return leaves
`
  },
  {
    num: 802, title: "Find Eventual Safe States", slug: "find-eventual-safe-states", lc: "Medium",
    topic: "graphs",
    pattern: "Cycle detection",
    level: 4,
    order: 500,
    core: false,
    teaches: "Safe nodes are those that cannot reach a cycle; peel them from the terminal nodes backwards (Kahn's on the reversed graph).",
    learn: ["dsa_graphs", "dsa-gr-cycle"],
    pre: [207],
    hints: [
      "A node is unsafe exactly when some path from it reaches a cycle. Terminal nodes (no out-edges) are safe.",
      "A node is safe when ALL its out-neighbours are safe. That is Kahn's algorithm run on the reversed graph, with out-degree as the counter.",
      "(Alternative: 3-colour DFS — a node is unsafe if DFS from it finds a grey node.)"
    ],
    steps: [
      "Build reverse edges and outdeg[u] = len(graph[u]).",
      "Queue all nodes with outdeg 0. Pop v; for each u with an edge u -> v: outdeg[u] -= 1; enqueue at 0.",
      "Every node that was ever queued is safe; return them sorted."
    ],
    time: "O(V + E)", space: "O(V + E)",
    trap: "A recursive 3-colour DFS can hit Python's recursion limit on 10^4 nodes; the reverse-Kahn version is iterative.",
    code: `from collections import deque
class Solution:
    def eventualSafeNodes(self, graph: List[List[int]]) -> List[int]:
        n = len(graph)
        rev = [[] for _ in range(n)]
        outdeg = [0] * n
        for u in range(n):
            outdeg[u] = len(graph[u])
            for v in graph[u]:
                rev[v].append(u)
        q = deque(i for i in range(n) if outdeg[i] == 0)
        safe = [False] * n
        while q:
            v = q.popleft()
            safe[v] = True
            for u in rev[v]:
                outdeg[u] -= 1
                if outdeg[u] == 0:
                    q.append(u)
        return [i for i in range(n) if safe[i]]
`
  },
  {
    num: 2360, title: "Longest Cycle in a Graph", slug: "longest-cycle-in-a-graph", lc: "Hard",
    topic: "graphs",
    pattern: "Cycle detection",
    level: 4,
    order: 510,
    core: false,
    teaches: "With out-degree at most 1, walk each path once, stamping nodes with the step number; meeting your own stamp measures the cycle.",
    learn: ["dsa_graphs", "dsa-gr-cycle"],
    pre: [802],
    hints: [
      "Each node has at most one outgoing edge, so from any start there is only one path.",
      "Walk from each unvisited node, recording visit time t for every node. Use a global clock so no node is walked twice.",
      "If you reach a node visited during THIS walk, the cycle length is clock - time[node]."
    ],
    steps: [
      "time = [0] * n, clock = 1.",
      "For each start: remember walk_start = clock; follow edges while node != -1 and unvisited, stamping time[node] = clock++.",
      "If you stopped at a node with time >= walk_start, best = max(best, clock - time[node]).",
      "Return best or -1."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Stopping at a node visited in an EARLIER walk does not form a new cycle; compare against this walk's start time.",
    code: `class Solution:
    def longestCycle(self, edges: List[int]) -> int:
        n = len(edges)
        time = [0] * n
        clock = 1
        best = -1
        for start in range(n):
            if time[start]:
                continue
            walk_start = clock
            u = start
            while u != -1 and time[u] == 0:
                time[u] = clock
                clock += 1
                u = edges[u]
            if u != -1 and time[u] >= walk_start:
                best = max(best, clock - time[u])
        return best
`
  },
  {
    num: 721, title: "Accounts Merge", slug: "accounts-merge", lc: "Medium",
    topic: "graphs",
    pattern: "Union-Find",
    level: 4,
    order: 520,
    core: true,
    teaches: "Union-Find over emails: every account unions its emails; then group emails by root.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [684],
    hints: [
      "Two accounts are the same person if they share any email. What should be the nodes?",
      "Make each email a node. Within an account, union every email with the account's first email.",
      "Finally group emails by find(email), sort each group, and prefix the owner's name."
    ],
    steps: [
      "owner[email] = name; union(email, account[1]) for every email in the account.",
      "groups[find(email)].append(email) for every email.",
      "Return [owner[root]] + sorted(group) for each group."
    ],
    time: "O(E log E)", space: "O(E)",
    trap: "Merging by name is wrong: two different people can share a name.",
    code: `from collections import defaultdict
class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        parent = {}
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        owner = {}
        for acc in accounts:
            name, first = acc[0], acc[1]
            for e in acc[1:]:
                parent.setdefault(e, e)
                owner[e] = name
                parent[find(e)] = find(first)
        groups = defaultdict(list)
        for e in parent:
            groups[find(e)].append(e)
        return [[owner[r]] + sorted(es) for r, es in groups.items()]
`
  },
  {
    num: 1202, title: "Smallest String With Swaps", slug: "smallest-string-with-swaps", lc: "Medium",
    topic: "graphs",
    pattern: "Union-Find",
    level: 4,
    order: 530,
    core: false,
    teaches: "Swaps are transitive: inside one connected group of indices you can arrange the letters in any order.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [684],
    hints: [
      "If you can swap (0,1) and (1,2) any number of times, which arrangements of positions 0..2 are reachable?",
      "All of them. Union the index pairs; each component can be freely permuted.",
      "For each component, sort its indices and its letters, then place the smallest letters at the smallest indices."
    ],
    steps: [
      "Union every pair.",
      "Group indices by root.",
      "For each group: sorted indices, sorted letters; write letters into those indices in order.",
      "Join and return."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Simulating swaps greedily gets stuck; think in components, not individual swaps.",
    code: `from collections import defaultdict
class Solution:
    def smallestStringWithSwaps(self, s: str, pairs: List[List[int]]) -> str:
        parent = list(range(len(s)))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a, b in pairs:
            parent[find(a)] = find(b)
        groups = defaultdict(list)
        for i in range(len(s)):
            groups[find(i)].append(i)       # indices are added in increasing order
        res = list(s)
        for idx in groups.values():
            for i, ch in zip(idx, sorted(s[i] for i in idx)):
                res[i] = ch
        return ''.join(res)
`
  },
  {
    num: 947, title: "Most Stones Removed with Same Row or Column", slug: "most-stones-removed-with-same-row-or-column", lc: "Medium",
    topic: "graphs",
    pattern: "Union-Find",
    level: 4,
    order: 540,
    core: false,
    teaches: "Union a stone's row with its column; in each connected group all stones but one can be removed.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [684],
    hints: [
      "Stones sharing a row or column are connected. How many stones can be removed from a connected group of size k?",
      "k - 1 (remove leaves of a spanning tree one by one). So answer = stones - number of components.",
      "Trick: instead of comparing all pairs, union the node 'row x' with the node 'column y' for each stone; use ~y (or y + 10001) to keep column ids separate."
    ],
    steps: [
      "For each stone (x, y): union(x, ~y).",
      "Count distinct roots among the row/column nodes used.",
      "Return len(stones) - components."
    ],
    time: "O(n * alpha(n))", space: "O(n)",
    trap: "Row id 3 and column id 3 must be different nodes; encode columns differently.",
    code: `class Solution:
    def removeStones(self, stones: List[List[int]]) -> int:
        parent = {}
        def find(x):
            parent.setdefault(x, x)
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for x, y in stones:
            parent[find(x)] = find(~y)       # ~y keeps columns apart from rows
        comps = len({find(k) for k in parent})
        return len(stones) - comps
`
  },
  {
    num: 839, title: "Similar String Groups", slug: "similar-string-groups", lc: "Hard",
    topic: "graphs",
    pattern: "Union-Find",
    level: 4,
    order: 550,
    core: false,
    teaches: "Build the graph implicitly (two words are adjacent if they differ in exactly two positions) and count components with Union-Find.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [684],
    hints: [
      "When are two anagram strings 'similar'? Count the positions where they differ.",
      "Exactly 0 or 2 differing positions. Compare every pair (n <= 300) and union similar ones.",
      "The number of groups is the number of components."
    ],
    steps: [
      "comps = n; for i < j: if similar(strs[i], strs[j]) and union succeeds, comps -= 1.",
      "similar(a, b): count differing positions, stopping early above 2; return count in (0, 2).",
      "Return comps."
    ],
    time: "O(n^2 * L)", space: "O(n)",
    trap: "Similarity is not transitive by itself; groups are connected components, so 'tars' and 'arts' can be in the same group through 'rats'.",
    code: `class Solution:
    def numSimilarGroups(self, strs: List[str]) -> int:
        n = len(strs)
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def similar(a, b):
            diff = 0
            for x, y in zip(a, b):
                if x != y:
                    diff += 1
                    if diff > 2:
                        return False
            return diff in (0, 2)
        comps = n
        for i in range(n):
            for j in range(i + 1, n):
                if similar(strs[i], strs[j]):
                    ri, rj = find(i), find(j)
                    if ri != rj:
                        parent[ri] = rj
                        comps -= 1
        return comps
`
  },
  {
    num: 1631, title: "Path With Minimum Effort", slug: "path-with-minimum-effort", lc: "Medium",
    topic: "graphs",
    pattern: "Weighted shortest path",
    level: 4,
    order: 560,
    core: true,
    teaches: "Dijkstra with a different path cost: the cost of a path is its largest single step, not the sum.",
    learn: ["dsa_graphs", "dsa-gr-sp"],
    pre: [743],
    hints: [
      "A path's effort is the MAX absolute height difference along it. Does Dijkstra still work if you combine with max instead of +?",
      "Yes: max(effort, step) never decreases along a path. Run Dijkstra on the grid with cost = max(current, |h1 - h2|).",
      "Return the effort when the bottom-right cell is popped. (Binary search on the answer + BFS also works.)"
    ],
    steps: [
      "effort = INF grid; effort[0][0] = 0; heap = [(0, 0, 0)].",
      "Pop (e, r, c); if it is the target return e; skip if e > effort[r][c].",
      "For each neighbour: ne = max(e, abs(h[nr][nc] - h[r][c])); if ne < effort there, update and push."
    ],
    time: "O(m*n log(m*n))", space: "O(m*n)",
    trap: "Summing the differences (normal Dijkstra) answers a different question.",
    code: `import heapq
class Solution:
    def minimumEffortPath(self, heights: List[List[int]]) -> int:
        m, n = len(heights), len(heights[0])
        effort = [[float('inf')] * n for _ in range(m)]
        effort[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            e, r, c = heapq.heappop(heap)
            if r == m - 1 and c == n - 1:
                return e
            if e > effort[r][c]:
                continue
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n:
                    ne = max(e, abs(heights[nr][nc] - heights[r][c]))
                    if ne < effort[nr][nc]:
                        effort[nr][nc] = ne
                        heapq.heappush(heap, (ne, nr, nc))
        return 0
`
  },
  {
    num: 787, title: "Cheapest Flights Within K Stops", slug: "cheapest-flights-within-k-stops", lc: "Medium",
    topic: "graphs",
    pattern: "Weighted shortest path",
    level: 4,
    order: 570,
    core: true,
    teaches: "Bellman-Ford limited to k+1 rounds: each round allows one more edge, so it naturally respects 'at most k stops'.",
    learn: ["dsa_graphs", "dsa-gr-sp"],
    pre: [743],
    hints: [
      "Plain Dijkstra ignores the stop limit: a cheap path with too many stops can block a valid one.",
      "Bellman-Ford's round i finds the cheapest prices using at most i edges. You need at most k + 1 edges.",
      "In each round relax from a COPY of the previous round's prices, so one round cannot chain several edges."
    ],
    steps: [
      "price = [INF] * n; price[src] = 0.",
      "Repeat k + 1 times: new = price[:]; for (u, v, w): if price[u] + w < new[v], new[v] = price[u] + w; price = new.",
      "Return price[dst] or -1."
    ],
    time: "O(k * E)", space: "O(n)",
    trap: "Relaxing in place (without the copy) lets a single round use several flights and break the stop limit.",
    code: `class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        INF = float('inf')
        price = [INF] * n
        price[src] = 0
        for _ in range(k + 1):
            new = price[:]                   # read old round, write new round
            for u, v, w in flights:
                if price[u] + w < new[v]:
                    new[v] = price[u] + w
            price = new
        return price[dst] if price[dst] < INF else -1
`
  },
  {
    num: 2290, title: "Minimum Obstacle Removal to Reach Corner", slug: "minimum-obstacle-removal-to-reach-corner", lc: "Hard",
    topic: "graphs",
    pattern: "Weighted shortest path",
    level: 4,
    order: 580,
    core: false,
    teaches: "0-1 BFS: with edge weights 0 or 1, a deque replaces Dijkstra's heap (0-edges to the front, 1-edges to the back).",
    learn: ["dsa_graphs", "dsa-gr-sp"],
    pre: [1631],
    hints: [
      "Moving onto an empty cell costs 0, onto an obstacle costs 1. Which shortest-path tool fits weights 0/1?",
      "0-1 BFS: pop from the left of a deque; push 0-cost neighbours to the LEFT and 1-cost neighbours to the RIGHT.",
      "Keep a dist grid and only push when you improve it."
    ],
    steps: [
      "dist = INF grid; dist[0][0] = 0; dq = deque([(0, 0)]).",
      "Pop (r, c); for each neighbour with w = grid[nr][nc]: if dist[r][c] + w < dist[nr][nc], update and appendleft if w == 0 else append.",
      "Return dist[m-1][n-1]."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Plain BFS (treating every move as cost 1) counts steps, not removed obstacles.",
    code: `from collections import deque
class Solution:
    def minimumObstacles(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        INF = float('inf')
        dist = [[INF] * n for _ in range(m)]
        dist[0][0] = 0
        dq = deque([(0, 0)])
        while dq:
            r, c = dq.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n:
                    w = grid[nr][nc]
                    if dist[r][c] + w < dist[nr][nc]:
                        dist[nr][nc] = dist[r][c] + w
                        if w == 0:
                            dq.appendleft((nr, nc))
                        else:
                            dq.append((nr, nc))
        return dist[m-1][n-1]
`
  },
  {
    num: 778, title: "Swim in Rising Water", slug: "swim-in-rising-water", lc: "Hard",
    topic: "graphs",
    pattern: "Minimum spanning tree",
    level: 4,
    order: 590,
    core: false,
    teaches: "Minimax path = Kruskal: add cells in order of height and stop as soon as start and end are connected.",
    learn: ["dsa_graphs", "dsa-gr-mst"],
    pre: [1584, 684],
    hints: [
      "At time t you can use every cell with height <= t. When do (0,0) and (n-1,n-1) first become connected?",
      "Activate cells from lowest to highest, union each with active neighbours (that is Kruskal on a grid).",
      "The height of the cell whose activation first connects start and end is the answer. (Dijkstra with max also works.)"
    ],
    steps: [
      "Sort cells by height (heights are a permutation of 0..n*n-1, so pos[h] gives the cell).",
      "For h = 0, 1, ...: activate pos[h]; union with each active neighbour.",
      "If find(start) == find(end), return h."
    ],
    time: "O(n^2 * alpha)", space: "O(n^2)",
    trap: "The answer is at least grid[0][0] and grid[n-1][n-1]; the activation order handles that automatically.",
    code: `class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        parent = list(range(n * n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        pos = [0] * (n * n)
        for r in range(n):
            for c in range(n):
                pos[grid[r][c]] = (r, c)
        for h in range(n * n):
            r, c = pos[h]
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] <= h:
                    parent[find(r * n + c)] = find(nr * n + nc)
            if find(0) == find(n * n - 1):
                return h
        return n * n - 1
`
  },
  {
    num: 827, title: "Making A Large Island", slug: "making-a-large-island", lc: "Hard",
    topic: "graphs",
    pattern: "Grid DFS / flood fill",
    level: 5,
    order: 600,
    core: false,
    teaches: "Label every island with an id and its size; then each water cell can be scored from its distinct neighbour ids.",
    learn: ["dsa_graphs", "dsa-gr-dfs"],
    pre: [695],
    hints: [
      "Flipping one 0 joins the islands around it. Recomputing islands for every 0 is too slow.",
      "First pass: give each island an id (2, 3, ...) written into the grid and record size[id].",
      "Second pass: for each 0, add 1 + the sizes of the DISTINCT ids among its 4 neighbours. Handle the all-land grid."
    ],
    steps: [
      "Flood fill each island, writing id into its cells and storing size[id].",
      "best = max(size) (or 0). For each 0 cell: ids = set of neighbour ids; best = max(best, 1 + sum(size[i] for i in ids)).",
      "Return best; if the grid has no 0, best is n*n."
    ],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Two neighbours of the same 0 can belong to the same island; use a set of ids so it is counted once.",
    code: `class Solution:
    def largestIsland(self, grid: List[List[int]]) -> int:
        n = len(grid)
        size = {}
        nid = 2
        for i in range(n):
            for j in range(n):
                if grid[i][j] == 1:
                    grid[i][j] = nid
                    stack, cnt = [(i, j)], 0
                    while stack:
                        r, c = stack.pop()
                        cnt += 1
                        for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                            if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 1:
                                grid[nr][nc] = nid
                                stack.append((nr, nc))
                    size[nid] = cnt
                    nid += 1
        best = max(size.values(), default=0)
        for r in range(n):
            for c in range(n):
                if grid[r][c] == 0:
                    ids = {grid[nr][nc] for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1))
                           if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] > 1}
                    best = max(best, 1 + sum(size[k] for k in ids))
        return best
`
  },
  {
    num: 127, title: "Word Ladder", slug: "word-ladder", lc: "Hard",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 5,
    order: 610,
    core: true,
    teaches: "Word-level BFS made fast with wildcard buckets: 'h*t' links every word that differs only in that position.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [433],
    hints: [
      "Each word is a node; neighbours differ by one letter. Comparing all pairs is O(N^2 * L) — too slow for 5000 words.",
      "Group words by patterns like 'h*t', '*ot', 'ho*'. Two words are neighbours iff they share a pattern.",
      "BFS from beginWord; after expanding a pattern's bucket, clear it so it is never scanned again."
    ],
    steps: [
      "If endWord not in wordList return 0.",
      "buckets[pattern] = list of words for every word and every position.",
      "BFS from (beginWord, 1). For each pattern of the word, visit each unseen word in the bucket; then empty the bucket.",
      "Return the level when endWord is reached, else 0."
    ],
    time: "O(N * L^2)", space: "O(N * L^2)",
    trap: "The answer counts words in the sequence (beginWord included), so one change gives 2, not 1.",
    code: `from collections import defaultdict, deque
class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        if endWord not in wordList:
            return 0
        L = len(beginWord)
        buckets = defaultdict(list)
        for w in wordList:
            for i in range(L):
                buckets[w[:i] + '*' + w[i+1:]].append(w)
        seen = {beginWord}
        q = deque([(beginWord, 1)])
        while q:
            w, d = q.popleft()
            if w == endWord:
                return d
            for i in range(L):
                key = w[:i] + '*' + w[i+1:]
                for nb in buckets[key]:
                    if nb not in seen:
                        seen.add(nb)
                        q.append((nb, d + 1))
                buckets[key] = []          # never scan this bucket again
        return 0
`
  },
  {
    num: 1293, title: "Shortest Path in a Grid with Obstacles Elimination", slug: "shortest-path-in-a-grid-with-obstacles-elimination", lc: "Hard",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 5,
    order: 620,
    core: false,
    teaches: "BFS where the state is (row, col, eliminations left); keep the best 'k left' seen at each cell to prune.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1129, 1091],
    hints: [
      "Reaching the same cell with more eliminations left is strictly better. So the state must include k.",
      "BFS over (r, c, k_left). Stepping on a 1 costs one elimination.",
      "Prune: only push a state if k_left is larger than the best ever recorded for that cell. Shortcut: if k >= m+n-2 the answer is m+n-2."
    ],
    steps: [
      "If k >= m + n - 2 return m + n - 2.",
      "best[r][c] = -1 everywhere; best[0][0] = k; BFS from (0, 0, k) with steps 0.",
      "For each neighbour: nk = k_left - grid[nr][nc]; if nk >= 0 and nk > best[nr][nc], record it and push.",
      "Return steps + 1 when the neighbour is the bottom-right cell; -1 if BFS ends."
    ],
    time: "O(m*n*k)", space: "O(m*n*k)",
    trap: "A visited set on cells alone is wrong: a later visit with more eliminations left can still win.",
    code: `from collections import deque
class Solution:
    def shortestPath(self, grid: List[List[int]], k: int) -> int:
        m, n = len(grid), len(grid[0])
        if k >= m + n - 2:
            return m + n - 2
        best = [[-1] * n for _ in range(m)]   # most eliminations left seen at each cell
        best[0][0] = k
        q = deque([(0, 0, k, 0)])
        while q:
            r, c, left, d = q.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < m and 0 <= nc < n:
                    nk = left - grid[nr][nc]
                    if nk >= 0 and nk > best[nr][nc]:
                        if nr == m - 1 and nc == n - 1:
                            return d + 1
                        best[nr][nc] = nk
                        q.append((nr, nc, nk, d + 1))
        return -1
`
  },
  {
    num: 847, title: "Shortest Path Visiting All Nodes", slug: "shortest-path-visiting-all-nodes", lc: "Hard",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 5,
    order: 630,
    core: false,
    teaches: "BFS over (node, bitmask of visited nodes), starting from every node at once.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1129],
    hints: [
      "You may revisit nodes and start anywhere. What must the state remember to know when you are done?",
      "State = (current node, set of nodes visited so far) encoded as a bitmask; n <= 12 so there are at most 12 * 4096 states.",
      "Seed the queue with (i, 1 << i) for every i; the first state whose mask is all ones gives the answer."
    ],
    steps: [
      "full = (1 << n) - 1. Queue all (i, 1 << i, 0); mark them seen.",
      "Pop (u, mask, d). If mask == full return d.",
      "For each neighbour v: state (v, mask | 1 << v); push it if unseen with d + 1."
    ],
    time: "O(n^2 * 2^n)", space: "O(n * 2^n)",
    trap: "A single-node graph answers 0; and you must start from all nodes, not just node 0.",
    code: `from collections import deque
class Solution:
    def shortestPathLength(self, graph: List[List[int]]) -> int:
        n = len(graph)
        full = (1 << n) - 1
        q = deque((i, 1 << i, 0) for i in range(n))
        seen = {(i, 1 << i) for i in range(n)}
        while q:
            u, mask, d = q.popleft()
            if mask == full:
                return d
            for v in graph[u]:
                state = (v, mask | (1 << v))
                if state not in seen:
                    seen.add(state)
                    q.append((v, state[1], d + 1))
        return -1
`
  },
  {
    num: 2050, title: "Parallel Courses III", slug: "parallel-courses-iii", lc: "Hard",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 5,
    order: 640,
    core: false,
    teaches: "Longest path in a DAG via topological order: a course finishes at its own time plus the latest prerequisite finish.",
    learn: ["dsa_graphs", "dsa-gr-topo"],
    pre: [210],
    hints: [
      "With unlimited parallel courses, when can course v start?",
      "As soon as ALL its prerequisites are done: start[v] = max(finish[u]) over prerequisites u.",
      "Process nodes in Kahn order so every prerequisite is final before you use it; answer = max finish."
    ],
    steps: [
      "finish[v] = time[v] initially; build adj and indeg.",
      "Kahn's: pop u; for each v: finish[v] = max(finish[v], finish[u] + time[v]); decrement indeg and enqueue at 0.",
      "Return max(finish)."
    ],
    time: "O(n + m)", space: "O(n + m)",
    trap: "Courses are 1-indexed in relations but time is 0-indexed.",
    code: `from collections import deque
class Solution:
    def minimumTime(self, n: int, relations: List[List[int]], time: List[int]) -> int:
        adj = [[] for _ in range(n)]
        indeg = [0] * n
        for a, b in relations:
            adj[a - 1].append(b - 1)
            indeg[b - 1] += 1
        finish = time[:]
        q = deque(i for i in range(n) if indeg[i] == 0)
        while q:
            u = q.popleft()
            for v in adj[u]:
                finish[v] = max(finish[v], finish[u] + time[v])
                indeg[v] -= 1
                if indeg[v] == 0:
                    q.append(v)
        return max(finish)
`
  },
  {
    num: 1579, title: "Remove Max Number of Edges to Keep Graph Fully Traversable", slug: "remove-max-number-of-edges-to-keep-graph-fully-traversable", lc: "Hard",
    topic: "graphs",
    pattern: "Union-Find",
    level: 5,
    order: 650,
    core: false,
    teaches: "Greedy with two Union-Finds: use shared (type 3) edges first, then each person's own edges; count every edge you didn't need.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [1319],
    hints: [
      "A type-3 edge helps both Alice and Bob at once, so it is never worse to take it first.",
      "Keep one DSU for Alice and one for Bob. Add type-3 edges to both; count the edge as used if it joins anything.",
      "Then add type-1 edges to Alice's DSU and type-2 to Bob's. At the end both must have one component; answer = total - used."
    ],
    steps: [
      "Two DSUs with component counters.",
      "For type 3: if union in Alice's DSU succeeds (Bob's will too in the same way), used += 1; union both.",
      "For type 1 / 2: union in that person's DSU; used += 1 if it succeeds.",
      "If either DSU has more than 1 component return -1; else return len(edges) - used."
    ],
    time: "O(m * alpha(n))", space: "O(n)",
    trap: "Processing type 1/2 edges before type 3 can waste edges that a shared edge would have covered.",
    code: `class DSU:
    def __init__(self, n):
        self.parent = list(range(n + 1))
        self.comps = n
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        self.parent[ra] = rb
        self.comps -= 1
        return True

class Solution:
    def maxNumEdgesToRemove(self, n: int, edges: List[List[int]]) -> int:
        alice, bob = DSU(n), DSU(n)
        used = 0
        for t, a, b in edges:
            if t == 3:
                if alice.union(a, b):
                    bob.union(a, b)
                    used += 1
        for t, a, b in edges:
            if t == 1 and alice.union(a, b):
                used += 1
            elif t == 2 and bob.union(a, b):
                used += 1
        if alice.comps > 1 or bob.comps > 1:
            return -1
        return len(edges) - used
`
  },
  {
    num: 1976, title: "Number of Ways to Arrive at Destination", slug: "number-of-ways-to-arrive-at-destination", lc: "Medium",
    topic: "graphs",
    pattern: "Weighted shortest path",
    level: 5,
    order: 660,
    core: false,
    teaches: "Dijkstra plus counting: when you find an equal shortest distance add the ways, when you find a shorter one replace them.",
    learn: ["dsa_graphs", "dsa-gr-sp"],
    pre: [743],
    hints: [
      "Run Dijkstra from 0. How can you count how many shortest paths reach each node at the same time?",
      "ways[v]: if d + w < dist[v], set dist[v] and ways[v] = ways[u]; if d + w == dist[v], ways[v] += ways[u].",
      "Because nodes are finalized in distance order, ways[u] is complete when u is popped. Take results modulo 1e9+7."
    ],
    steps: [
      "dist = [INF] * n, ways = [0] * n; dist[0] = 0, ways[0] = 1; heap = [(0, 0)].",
      "Pop (d, u); skip if d > dist[u]. For each (v, w): shorter -> replace dist and ways, push; equal -> add ways.",
      "Return ways[n-1] % MOD."
    ],
    time: "O(E log V)", space: "O(V + E)",
    trap: "Distances can exceed 2^31; and do not count 'equal' paths from stale heap entries (skip them first).",
    code: `import heapq
class Solution:
    def countPaths(self, n: int, roads: List[List[int]]) -> int:
        MOD = 10**9 + 7
        adj = [[] for _ in range(n)]
        for u, v, w in roads:
            adj[u].append((v, w))
            adj[v].append((u, w))
        dist = [float('inf')] * n
        ways = [0] * n
        dist[0], ways[0] = 0, 1
        heap = [(0, 0)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in adj[u]:
                nd = d + w
                if nd < dist[v]:
                    dist[v], ways[v] = nd, ways[u]
                    heapq.heappush(heap, (nd, v))
                elif nd == dist[v]:
                    ways[v] = (ways[v] + ways[u]) % MOD
        return ways[n-1] % MOD
`
  },
  {
    num: 1368, title: "Minimum Cost to Make at Least One Valid Path in a Grid", slug: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid", lc: "Hard",
    topic: "graphs",
    pattern: "Weighted shortest path",
    level: 5,
    order: 670,
    core: false,
    teaches: "Model each cell's arrow as a free (cost 0) edge and every other direction as cost 1, then run 0-1 BFS.",
    learn: ["dsa_graphs", "dsa-gr-sp"],
    pre: [2290],
    hints: [
      "Following the sign costs nothing; changing it costs 1. What does that make the edge weights?",
      "From each cell, the move in the sign's direction has weight 0, the other three have weight 1.",
      "Run 0-1 BFS (deque) from (0, 0) to (m-1, n-1)."
    ],
    steps: [
      "dirs = {1: right, 2: left, 3: down, 4: up}.",
      "dist grid INF; dist[0][0] = 0; deque with (0, 0).",
      "Pop a cell; for each of the 4 directions, w = 0 if it matches grid[r][c] else 1; relax and push left for 0, right for 1.",
      "Return dist[m-1][n-1]."
    ],
    time: "O(m*n)", space: "O(m*n)",
    trap: "Mixing up the sign numbering: 1 right, 2 left, 3 down, 4 up.",
    code: `from collections import deque
class Solution:
    def minCost(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]      # signs 1, 2, 3, 4
        INF = float('inf')
        dist = [[INF] * n for _ in range(m)]
        dist[0][0] = 0
        dq = deque([(0, 0)])
        while dq:
            r, c = dq.popleft()
            for k, (dr, dc) in enumerate(dirs):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    w = 0 if grid[r][c] == k + 1 else 1
                    if dist[r][c] + w < dist[nr][nc]:
                        dist[nr][nc] = dist[r][c] + w
                        if w == 0:
                            dq.appendleft((nr, nc))
                        else:
                            dq.append((nr, nc))
        return dist[m-1][n-1]
`
  },
  {
    num: 1489, title: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree", slug: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree", lc: "Hard",
    topic: "graphs",
    pattern: "Minimum spanning tree",
    level: 5,
    order: 680,
    core: false,
    teaches: "Test each edge against the MST weight: forbidding a critical edge raises it, forcing a pseudo-critical edge keeps it.",
    learn: ["dsa_graphs", "dsa-gr-mst"],
    pre: [1584],
    hints: [
      "First compute the MST weight W with Kruskal.",
      "Edge e is critical if Kruskal WITHOUT e gives weight > W (or cannot connect the graph).",
      "Otherwise e is pseudo-critical if Kruskal that starts by FORCING e in still gives exactly W."
    ],
    steps: [
      "Attach original indices and sort edges by weight.",
      "kruskal(skip, force): union force first (adding its weight), then the rest except skip; return INF if not connected.",
      "W = kruskal(None, None). For each edge i: if kruskal(skip=i) > W -> critical; elif kruskal(force=i) == W -> pseudo.",
      "Return [critical, pseudo]."
    ],
    time: "O(E^2 * alpha(V))", space: "O(V + E)",
    trap: "Check 'critical' first: a critical edge would also pass the forced test, but it belongs only in the first list.",
    code: `class Solution:
    def findCriticalAndPseudoCriticalEdges(self, n: int, edges: List[List[int]]) -> List[List[int]]:
        es = sorted((w, a, b, i) for i, (a, b, w) in enumerate(edges))
        INF = float('inf')
        def kruskal(skip, force):
            parent = list(range(n))
            def find(x):
                while parent[x] != x:
                    parent[x] = parent[parent[x]]
                    x = parent[x]
                return x
            total, used = 0, 0
            if force is not None:
                a, b, w = edges[force]
                parent[find(a)] = find(b)
                total, used = w, 1
            for w, a, b, i in es:
                if i == skip:
                    continue
                ra, rb = find(a), find(b)
                if ra != rb:
                    parent[ra] = rb
                    total += w
                    used += 1
            return total if used == n - 1 else INF
        W = kruskal(None, None)
        critical, pseudo = [], []
        for i in range(len(edges)):
            if kruskal(i, None) > W:
                critical.append(i)
            elif kruskal(None, i) == W:
                pseudo.append(i)
        return [critical, pseudo]
`
  },
  {
    num: 332, title: "Reconstruct Itinerary", slug: "reconstruct-itinerary", lc: "Hard",
    topic: "graphs",
    pattern: "Eulerian path (Hierholzer)",
    level: 5,
    order: 690,
    core: true,
    teaches: "Hierholzer's algorithm: follow unused edges until stuck, appending nodes on the way back; reverse at the end.",
    learn: ["dsa_graphs", "dsa-gr-patterns"],
    pre: [210],
    hints: [
      "You must use every ticket exactly once: an Eulerian path starting at JFK. Greedy 'always take the smallest airport' can get stuck in a dead end.",
      "Hierholzer: walk edges (smallest destination first) with a stack; when a node has no unused edges left, pop it into the route.",
      "The route comes out reversed. Sorting destinations in reverse and popping from the end gives lexical order cheaply."
    ],
    steps: [
      "adj[src] = destinations sorted in reverse (so pop() gives the smallest).",
      "stack = ['JFK']; route = [].",
      "While stack: if adj[top] is non-empty, push adj[top].pop(); else route.append(stack.pop()).",
      "Return route reversed."
    ],
    time: "O(E log E)", space: "O(E)",
    trap: "Plain DFS that stops at the first dead end fails: the dead end must be visited LAST, which post-order handles.",
    code: `from collections import defaultdict
class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        adj = defaultdict(list)
        for a, b in sorted(tickets, reverse=True):
            adj[a].append(b)            # reverse-sorted, so pop() gives the smallest
        stack, route = ['JFK'], []
        while stack:
            if adj[stack[-1]]:
                stack.append(adj[stack[-1]].pop())
            else:
                route.append(stack.pop())
        return route[::-1]
`
  },
  {
    num: 864, title: "Shortest Path to Get All Keys", slug: "shortest-path-to-get-all-keys", lc: "Hard",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 6,
    order: 700,
    core: false,
    teaches: "Grid BFS whose state also carries the set of keys collected (a bitmask over at most 6 keys).",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [1293, 847],
    hints: [
      "Walking back over a cell after picking up a key is a genuinely new situation. What extra state do you need?",
      "State = (r, c, keysMask). A lock 'A' is passable only if bit 0 of keysMask is set; stepping on 'a' sets bit 0.",
      "BFS from '@' with mask 0; stop when mask equals all keys present."
    ],
    steps: [
      "Find the start and count keys K; goal = (1 << K) - 1.",
      "BFS over (r, c, mask) with a seen set. Skip walls; skip a lock whose key bit is missing.",
      "On a key cell, mask |= bit. If mask == goal return steps. Return -1 if BFS ends."
    ],
    time: "O(m*n*2^K)", space: "O(m*n*2^K)",
    trap: "Update the mask before checking the goal and before deduplicating the new state.",
    code: `from collections import deque
class Solution:
    def shortestPathAllKeys(self, grid: List[str]) -> int:
        m, n = len(grid), len(grid[0])
        K = 0
        for i in range(m):
            for j in range(n):
                ch = grid[i][j]
                if ch == '@':
                    start = (i, j)
                elif ch.islower():
                    K += 1
        goal = (1 << K) - 1
        q = deque([(start[0], start[1], 0, 0)])
        seen = {(start[0], start[1], 0)}
        while q:
            r, c, mask, d = q.popleft()
            if mask == goal:
                return d
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if not (0 <= nr < m and 0 <= nc < n):
                    continue
                ch = grid[nr][nc]
                if ch == '#':
                    continue
                if ch.isupper() and not (mask >> (ord(ch) - ord('A')) & 1):
                    continue
                nmask = mask | (1 << (ord(ch) - ord('a'))) if ch.islower() else mask
                if (nr, nc, nmask) not in seen:
                    seen.add((nr, nc, nmask))
                    q.append((nr, nc, nmask, d + 1))
        return -1
`
  },
  {
    num: 126, title: "Word Ladder II", slug: "word-ladder-ii", lc: "Hard",
    topic: "graphs",
    pattern: "BFS shortest path (unweighted)",
    level: 6,
    order: 710,
    core: false,
    teaches: "Run BFS level by level recording parents, then backtrack from endWord to list every shortest path.",
    learn: ["dsa_graphs", "dsa-gr-bfs"],
    pre: [127],
    hints: [
      "Start from Word Ladder: BFS gives the distance. You now need ALL shortest sequences.",
      "Do the BFS one level at a time and record, for each newly reached word, every parent on the previous level. Remove a level's words from the word set only after the level ends.",
      "Then DFS backwards from endWord through the parent lists to beginWord, and reverse each path."
    ],
    steps: [
      "words = set(wordList); if endWord missing return [].",
      "level = {beginWord}; parents = defaultdict(set). While level and endWord not found: remove level from words; for each word and each one-letter change in words, add parent; next level = new words.",
      "Backtrack from endWord through parents to build all paths; reverse them."
    ],
    time: "O(N * L * 26 + output)", space: "O(N * L + output)",
    trap: "Deleting a word as soon as it is first reached drops other parents on the same level, losing valid paths.",
    code: `from collections import defaultdict
class Solution:
    def findLadders(self, beginWord: str, endWord: str, wordList: List[str]) -> List[List[str]]:
        words = set(wordList)
        if endWord not in words:
            return []
        parents = defaultdict(set)
        level = {beginWord}
        found = False
        while level and not found:
            words -= level                       # remove the whole level at once
            nxt = set()
            for w in level:
                for i in range(len(w)):
                    for ch in 'abcdefghijklmnopqrstuvwxyz':
                        t = w[:i] + ch + w[i+1:]
                        if t in words:
                            parents[t].add(w)
                            nxt.add(t)
                            if t == endWord:
                                found = True
            level = nxt
        if not found:
            return []
        res = []
        path = [endWord]
        def back(w):
            if w == beginWord:
                res.append(path[::-1])
                return
            for p in parents[w]:
                path.append(p)
                back(p)
                path.pop()
        back(endWord)
        return res
`
  },
  {
    num: 1203, title: "Sort Items by Groups Respecting Dependencies", slug: "sort-items-by-groups-respecting-dependencies", lc: "Hard",
    topic: "graphs",
    pattern: "Topological sort / DAG",
    level: 6,
    order: 720,
    core: false,
    teaches: "Two-level topological sort: order the groups, then order items inside each group.",
    learn: ["dsa_graphs", "dsa-gr-topo"],
    pre: [2050],
    hints: [
      "Items of one group must be contiguous. Think of a graph of groups and, separately, a graph of items.",
      "Give every ungrouped item its own new group id. An edge between items in different groups also becomes an edge between their groups.",
      "Topologically sort the groups and the items (both with Kahn's). Then emit items group by group, keeping item topo order inside each group. Any cycle -> []."
    ],
    steps: [
      "Assign fresh group ids to items with group -1.",
      "For each item i and each before b: if same group, add item edge b -> i; else add group edge group[b] -> group[i]. Always add the item edge too.",
      "Topo-sort items and groups; if either fails return [].",
      "Bucket the sorted items by group, then concatenate buckets in group topo order."
    ],
    time: "O(n + m + edges)", space: "O(n + m + edges)",
    trap: "Forgetting to give each -1 item its own group makes all ungrouped items stick together.",
    code: `from collections import deque
class Solution:
    def sortItems(self, n: int, m: int, group: List[int], beforeItems: List[List[int]]) -> List[int]:
        group = group[:]
        for i in range(n):
            if group[i] == -1:
                group[i] = m
                m += 1
        def topo(k, edges):
            adj = [[] for _ in range(k)]
            indeg = [0] * k
            for a, b in edges:
                adj[a].append(b)
                indeg[b] += 1
            q = deque(i for i in range(k) if indeg[i] == 0)
            order = []
            while q:
                u = q.popleft()
                order.append(u)
                for v in adj[u]:
                    indeg[v] -= 1
                    if indeg[v] == 0:
                        q.append(v)
            return order if len(order) == k else None
        item_edges, group_edges = [], []
        for i in range(n):
            for b in beforeItems[i]:
                item_edges.append((b, i))
                if group[b] != group[i]:
                    group_edges.append((group[b], group[i]))
        items = topo(n, item_edges)
        groups = topo(m, group_edges)
        if items is None or groups is None:
            return []
        bucket = [[] for _ in range(m)]
        for it in items:
            bucket[group[it]].append(it)
        return [it for g in groups for it in bucket[g]]
`
  },
  {
    num: 685, title: "Redundant Connection II", slug: "redundant-connection-ii", lc: "Hard",
    topic: "graphs",
    pattern: "Union-Find",
    level: 6,
    order: 730,
    core: false,
    teaches: "In a rooted tree with one extra directed edge, either some node has two parents or there is a cycle; handle both cases with Union-Find.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [684],
    hints: [
      "Two things can break a rooted tree: a node with two parents, or a directed cycle. They can also happen together.",
      "First find a node with two parents; call its two incoming edges cand1 (earlier) and cand2 (later).",
      "Run Union-Find over all edges except cand2. If no cycle appears, cand2 is the answer. If a cycle appears: return cand1 if it exists, else the edge that closed the cycle."
    ],
    steps: [
      "parentOf = {}; scan edges: if v already has a parent, cand1 = [parentOf[v], v], cand2 = [u, v]; else record it.",
      "DSU over edges, skipping cand2. If an edge joins two already-connected nodes: return cand1 if cand1 else that edge.",
      "If no cycle was found, return cand2."
    ],
    time: "O(n * alpha(n))", space: "O(n)",
    trap: "Reusing Redundant Connection I as-is fails when the extra edge points at a node that already has a parent.",
    code: `class Solution:
    def findRedundantDirectedConnection(self, edges: List[List[int]]) -> List[int]:
        n = len(edges)
        par = {}
        cand1 = cand2 = None
        for u, v in edges:
            if v in par:
                cand1, cand2 = [par[v], v], [u, v]
            else:
                par[v] = u
        root = list(range(n + 1))
        def find(x):
            while root[x] != x:
                root[x] = root[root[x]]
                x = root[x]
            return x
        for u, v in edges:
            if [u, v] == cand2:
                continue
            ru, rv = find(u), find(v)
            if ru == rv:                     # this edge closes a cycle
                return cand1 if cand1 else [u, v]
            root[rv] = ru
        return cand2
`
  },
  {
    num: 2421, title: "Number of Good Paths", slug: "number-of-good-paths", lc: "Hard",
    topic: "graphs",
    pattern: "Union-Find",
    level: 6,
    order: 740,
    core: false,
    teaches: "Offline Union-Find by value: add nodes from smallest value up; when merging, pair counts of the current max value multiply.",
    learn: ["dsa_graphs", "dsa-gr-uf"],
    pre: [1579],
    hints: [
      "A good path's endpoints have the maximum value on the path. Process nodes in increasing value so all smaller nodes are already 'active'.",
      "When you activate value v, union each such node with neighbours whose value <= v.",
      "Then, among nodes with value v, group by root: a group of size k adds k*(k+1)/2 good paths (single nodes included)."
    ],
    steps: [
      "Sort node ids by value; build adjacency.",
      "For each distinct value v (in increasing order): for each node u with value v and each neighbour w with vals[w] <= v: union(u, w).",
      "Count nodes with value v per root; add k*(k+1)//2 for each count.",
      "Return the total."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Counting after each single union instead of after the whole value group misses pairs joined later in the same group.",
    code: `from collections import Counter, defaultdict
class Solution:
    def numberOfGoodPaths(self, vals: List[int], edges: List[List[int]]) -> int:
        n = len(vals)
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        by_val = defaultdict(list)
        for i, v in enumerate(vals):
            by_val[v].append(i)
        total = 0
        for v in sorted(by_val):
            nodes = by_val[v]
            for u in nodes:
                for w in adj[u]:
                    if vals[w] <= v:
                        parent[find(u)] = find(w)
            cnt = Counter(find(u) for u in nodes)
            total += sum(k * (k + 1) // 2 for k in cnt.values())
        return total
`
  },
  {
    num: 2097, title: "Valid Arrangement of Pairs", slug: "valid-arrangement-of-pairs", lc: "Hard",
    topic: "graphs",
    pattern: "Eulerian path (Hierholzer)",
    level: 6,
    order: 750,
    core: false,
    teaches: "Find the Euler path's start from degrees (out - in == 1), then run Hierholzer and read edges off the route.",
    learn: ["dsa_graphs", "dsa-gr-patterns"],
    pre: [332],
    hints: [
      "Each pair is a directed edge; a valid arrangement uses every edge once: an Eulerian path.",
      "Where must the path start? At the node whose out-degree exceeds its in-degree by 1; if none exists (a circuit), anywhere.",
      "Run iterative Hierholzer from there; consecutive nodes in the reversed route are the pairs."
    ],
    steps: [
      "Build adj and degree balance (out - in).",
      "start = node with balance 1, else pairs[0][0].",
      "stack = [start]; while stack: push adj[top].pop() if it has edges, else append pop() to route.",
      "Reverse route; return [[route[i], route[i+1]] for i in range(len(route) - 1)]."
    ],
    time: "O(E)", space: "O(E)",
    trap: "Recursive Hierholzer overflows Python's stack at 10^5 edges; use the explicit stack.",
    code: `from collections import defaultdict
class Solution:
    def validArrangement(self, pairs: List[List[int]]) -> List[List[int]]:
        adj = defaultdict(list)
        bal = defaultdict(int)
        for a, b in pairs:
            adj[a].append(b)
            bal[a] += 1
            bal[b] -= 1
        start = next((x for x in bal if bal[x] == 1), pairs[0][0])
        stack, route = [start], []
        while stack:
            if adj[stack[-1]]:
                stack.append(adj[stack[-1]].pop())
            else:
                route.append(stack.pop())
        route.reverse()
        return [[route[i], route[i + 1]] for i in range(len(route) - 1)]
`
  },
  {
    num: 753, title: "Cracking the Safe", slug: "cracking-the-safe", lc: "Hard",
    topic: "graphs",
    pattern: "Eulerian path (Hierholzer)",
    level: 6,
    order: 760,
    core: false,
    teaches: "De Bruijn sequence: nodes are (n-1)-digit strings, each n-digit password is an edge, and an Euler circuit covers them all.",
    learn: ["dsa_graphs", "dsa-gr-patterns"],
    pre: [332],
    hints: [
      "The shortest string has length k^n + n - 1, so consecutive passwords must overlap in n-1 digits.",
      "Make each (n-1)-digit string a node; appending digit d moves to the node formed by its last n-1 digits. Every password is exactly one edge.",
      "Every node has in-degree = out-degree = k, so an Euler circuit exists. Run Hierholzer from '0' * (n-1) and record the digit of each edge."
    ],
    steps: [
      "start = '0' * (n - 1); next_digit[node] counts edges already used.",
      "Stack of (node, digit used to arrive). If the top has an unused digit d: mark it and push ((node + d)[1:], d). Else pop and append its digit.",
      "Answer = start + the collected digits reversed."
    ],
    time: "O(k^n)", space: "O(k^n)",
    trap: "n == 1: the nodes are empty strings; the same code works and returns all k digits.",
    code: `class Solution:
    def crackSafe(self, n: int, k: int) -> str:
        start = '0' * (n - 1)
        used = {}                          # node -> number of outgoing digits used
        stack = [(start, '')]
        digits = []
        while stack:
            node, d = stack[-1]
            i = used.get(node, 0)
            if i < k:
                used[node] = i + 1
                nxt = (node + str(i))[1:]      # drop the oldest digit
                stack.append((nxt, str(i)))
            else:
                stack.pop()
                digits.append(d)
        return start + ''.join(reversed(digits))
`
  },
  {
    num: 1192, title: "Critical Connections in a Network", slug: "critical-connections-in-a-network", lc: "Hard",
    topic: "graphs",
    pattern: "Bridges (Tarjan low-link)",
    level: 6,
    order: 770,
    core: false,
    teaches: "Tarjan's bridges: an edge u-v is a bridge when v's subtree cannot reach u or above without it (low[v] > disc[u]).",
    learn: ["dsa_graphs", "dsa-gr-patterns"],
    pre: [1971, 684],
    hints: [
      "Removing an edge disconnects the graph iff it lies on no cycle. Checking each edge separately is O(E * (V + E)).",
      "DFS once, giving each node a discovery time disc. low[v] = smallest disc reachable from v's subtree using at most one back edge.",
      "Tree edge u -> v is a bridge iff low[v] > disc[u]. Use an iterative DFS for 10^5 nodes and skip only the edge you came in on."
    ],
    steps: [
      "Adjacency list with edge ids. disc = [-1] * n, low = [0] * n.",
      "Iterative DFS: on discovering v, disc[v] = low[v] = time++. A visited neighbour (not the parent edge) gives low[u] = min(low[u], disc[v]).",
      "When v finishes, low[parent] = min(low[parent], low[v]); if low[v] > disc[parent], record the bridge.",
      "Return all bridges."
    ],
    time: "O(V + E)", space: "O(V + E)",
    trap: "Recursive DFS hits Python's recursion limit on long chains; also skip the parent by edge id, not by node, to stay correct with parallel edges.",
    code: `class Solution:
    def criticalConnections(self, n: int, connections: List[List[int]]) -> List[List[int]]:
        adj = [[] for _ in range(n)]
        for i, (a, b) in enumerate(connections):
            adj[a].append((b, i))
            adj[b].append((a, i))
        disc = [-1] * n
        low = [0] * n
        t = 0
        res = []
        for s in range(n):
            if disc[s] != -1:
                continue
            disc[s] = low[s] = t; t += 1
            stack = [(s, -1, iter(adj[s]))]
            while stack:
                u, pe, it = stack[-1]
                pushed = False
                for v, eid in it:
                    if eid == pe:
                        continue
                    if disc[v] == -1:
                        disc[v] = low[v] = t; t += 1
                        stack.append((v, eid, iter(adj[v])))
                        pushed = True
                        break
                    low[u] = min(low[u], disc[v])          # back edge
                if not pushed:
                    stack.pop()
                    if stack:
                        p = stack[-1][0]
                        low[p] = min(low[p], low[u])
                        if low[u] > disc[p]:
                            res.append([p, u])
        return res
`
  }
);
