// problems/advanced.js — Advanced Data Structures ladder
PROBLEMS.push(
  {
    num: 1409, title: "Queries on a Permutation With Key", slug: "queries-on-a-permutation-with-key", lc: "Medium",
    topic: "advanced",
    pattern: "Fenwick tree (BIT)",
    level: 2,
    order: 10,
    core: false,
    teaches: "A Fenwick tree over positions answers 'how many items are in front of me?' in O(log n), even as items move.",
    learn: ["dsa_advanced", "dsa-ad-bit"],
    pre: [],
    hints: [
      "The brute force (list.index + move to front) is O(m) per query. What do you actually need to know about an item?",
      "Its position = how many items sit before it. Give positions 1..n+m: items start at n+1..n+m, leaving n free slots in front.",
      "A Fenwick tree with a 1 at every occupied slot gives 'items before' as a prefix sum. Moving to front = clear old slot, fill the next free front slot."
    ],
    steps: [
      "pos[v] = n + v; add(pos[v], +1) for v in 1..m. front = n.",
      "For each query q: answer prefix(pos[q]) - 1.",
      "add(pos[q], -1); pos[q] = front; add(front, +1); front -= 1."
    ],
    time: "O((n + m) log(n + m))", space: "O(n + m)",
    trap: "Fenwick indices start at 1; index 0 would loop forever because 0 & -0 == 0.",
    code: `class Solution:
    def processQueries(self, queries: List[int], m: int) -> List[int]:
        n = len(queries)
        size = n + m
        tree = [0] * (size + 1)
        def add(i, d):
            while i <= size:
                tree[i] += d
                i += i & -i
        def prefix(i):
            s = 0
            while i > 0:
                s += tree[i]
                i -= i & -i
            return s
        pos = [0] * (m + 1)
        for v in range(1, m + 1):
            pos[v] = n + v
            add(pos[v], 1)
        res = []
        front = n
        for q in queries:
            res.append(prefix(pos[q]) - 1)   # items strictly before q
            add(pos[q], -1)
            pos[q] = front
            add(front, 1)
            front -= 1
        return res
`
  },
  {
    num: 307, title: "Range Sum Query - Mutable", slug: "range-sum-query-mutable", lc: "Medium",
    topic: "advanced",
    pattern: "Segment tree",
    level: 2,
    order: 20,
    core: true,
    teaches: "The segment tree from the note, used as-is: point update and range sum, both O(log n).",
    learn: ["dsa_advanced", "dsa-ad-seg"],
    pre: [],
    hints: [
      "Recomputing sums after every update is O(n). A prefix-sum array breaks on updates. What supports both?",
      "A segment tree: each node stores the sum of its range; an update fixes one root-to-leaf path.",
      "A query returns a node's sum when the node is fully inside [left, right], 0 when disjoint, and otherwise asks both children."
    ],
    steps: [
      "Build: tree[v] = tree[2v] + tree[2v+1], leaves hold nums.",
      "update(i, val): walk down to the leaf, set it, recompute sums on the way back up.",
      "sumRange(l, r): no overlap -> 0; full overlap -> tree[v]; partial -> left + right."
    ],
    time: "O(log n) per operation", space: "O(n)",
    trap: "Size the array 4n; 2n is not always enough for the recursive layout.",
    code: `class NumArray:
    def __init__(self, nums: List[int]):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)
        self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, v, lo, hi):
        if lo == hi:
            self.tree[v] = nums[lo]
            return
        mid = (lo + hi) // 2
        self._build(nums, 2 * v, lo, mid)
        self._build(nums, 2 * v + 1, mid + 1, hi)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]

    def update(self, index: int, val: int, v: int = 1, lo: int = 0, hi: int = None) -> None:
        if hi is None:
            hi = self.n - 1
        if lo == hi:
            self.tree[v] = val
            return
        mid = (lo + hi) // 2
        if index <= mid:
            self.update(index, val, 2 * v, lo, mid)
        else:
            self.update(index, val, 2 * v + 1, mid + 1, hi)
        self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]

    def sumRange(self, left: int, right: int, v: int = 1, lo: int = 0, hi: int = None) -> int:
        if hi is None:
            hi = self.n - 1
        if right < lo or hi < left:
            return 0
        if left <= lo and hi <= right:
            return self.tree[v]
        mid = (lo + hi) // 2
        return self.sumRange(left, right, 2 * v, lo, mid) + self.sumRange(left, right, 2 * v + 1, mid + 1, hi)
`
  },
  {
    num: 2349, title: "Design a Number Container System", slug: "design-a-number-container-system", lc: "Medium",
    topic: "advanced",
    pattern: "Ordered set / sorted map",
    level: 2,
    order: 30,
    core: true,
    teaches: "Two maps that stay in sync: index -> number, and number -> sorted set of indices (smallest is the answer).",
    learn: ["dsa_advanced", "dsa-ad-sorted"],
    pre: [],
    hints: [
      "find(number) wants the SMALLEST index holding number, and indices can be overwritten.",
      "Keep at[index] = number and where[number] = SortedList of indices.",
      "On change, remove the index from its old number's set before adding it to the new one."
    ],
    steps: [
      "change(i, x): if i in at, where[at[i]].remove(i). Then at[i] = x; where[x].add(i).",
      "find(x): return where[x][0] if where[x] else -1."
    ],
    time: "O(log n) per call", space: "O(n)",
    trap: "Forgetting to remove the index from the old number's set makes find return stale indices.",
    code: `from collections import defaultdict
from sortedcontainers import SortedList
class NumberContainers:
    def __init__(self):
        self.at = {}
        self.where = defaultdict(SortedList)

    def change(self, index: int, number: int) -> None:
        if index in self.at:
            self.where[self.at[index]].remove(index)
        self.at[index] = number
        self.where[number].add(index)

    def find(self, number: int) -> int:
        s = self.where.get(number)
        return s[0] if s else -1
`
  },
  {
    num: 1396, title: "Design Underground System", slug: "design-underground-system", lc: "Medium",
    topic: "advanced",
    pattern: "Design: cache and combined structures",
    level: 2,
    order: 40,
    core: false,
    teaches: "Two dictionaries: one for trips in progress, one for running (total time, count) per route.",
    learn: ["dsa_advanced", "dsa-ad-cache"],
    pre: [],
    hints: [
      "What do you need to remember between a check-in and its check-out?",
      "active[id] = (station, time). On check-out, add the trip time to stats[(start, end)] = [total, count].",
      "The average is total / count; no list of trips is needed."
    ],
    steps: [
      "checkIn: active[id] = (station, t).",
      "checkOut: (s, t0) = active.pop(id); stats[(s, station)] += (t - t0, 1).",
      "getAverageTime: total / count for the pair."
    ],
    time: "O(1) per call", space: "O(P + S^2)",
    trap: "Routes are directional: (A, B) and (B, A) are different keys.",
    code: `from collections import defaultdict
class UndergroundSystem:
    def __init__(self):
        self.active = {}
        self.stats = defaultdict(lambda: [0, 0])     # (start, end) -> [total, count]

    def checkIn(self, id: int, stationName: str, t: int) -> None:
        self.active[id] = (stationName, t)

    def checkOut(self, id: int, stationName: str, t: int) -> None:
        start, t0 = self.active.pop(id)
        s = self.stats[(start, stationName)]
        s[0] += t - t0
        s[1] += 1

    def getAverageTime(self, startStation: str, endStation: str) -> float:
        total, count = self.stats[(startStation, endStation)]
        return total / count
`
  },
  {
    num: 1395, title: "Count Number of Teams", slug: "count-number-of-teams", lc: "Medium",
    topic: "advanced",
    pattern: "Fenwick tree (BIT)",
    level: 3,
    order: 50,
    core: true,
    teaches: "Fix the middle soldier and count smaller/larger values on each side; a Fenwick tree gives the left-side counts.",
    learn: ["dsa_advanced", "dsa-ad-bit"],
    pre: [1409],
    hints: [
      "A team is i < j < k with ratings increasing or decreasing. Try fixing the middle soldier j.",
      "Teams with j in the middle = lessLeft * greaterRight + greaterLeft * lessRight.",
      "lessLeft comes from a Fenwick tree of ratings seen so far (compressed to ranks); the right-side counts follow from totals: lessRight = (rank - 1) - lessLeft."
    ],
    steps: [
      "Compress ratings to ranks 1..n (they are distinct).",
      "For j from left to right: lessLeft = prefix(rank - 1); greaterLeft = j - lessLeft.",
      "lessRight = (rank - 1) - lessLeft; greaterRight = (n - rank) - greaterLeft.",
      "ans += lessLeft * greaterRight + greaterLeft * lessRight; add(rank, 1)."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Enumerating all triples is O(n^3); even the O(n^2) 'count both sides for each j' is fine for n = 1000, but the BIT version scales.",
    code: `class Solution:
    def numTeams(self, rating: List[int]) -> int:
        n = len(rating)
        rank = {v: i + 1 for i, v in enumerate(sorted(rating))}
        tree = [0] * (n + 1)
        def add(i):
            while i <= n:
                tree[i] += 1
                i += i & -i
        def prefix(i):
            s = 0
            while i > 0:
                s += tree[i]
                i -= i & -i
            return s
        ans = 0
        for j, v in enumerate(rating):
            r = rank[v]
            less_left = prefix(r - 1)
            greater_left = j - less_left
            less_right = (r - 1) - less_left
            greater_right = (n - r) - greater_left
            ans += less_left * greater_right + greater_left * less_right
            add(r)
        return ans
`
  },
  {
    num: 3479, title: "Fruits Into Baskets III", slug: "fruits-into-baskets-iii", lc: "Medium",
    topic: "advanced",
    pattern: "Segment tree",
    level: 3,
    order: 60,
    core: false,
    teaches: "Segment tree of maxima lets you descend to the LEFTMOST position with value >= x in O(log n).",
    learn: ["dsa_advanced", "dsa-ad-seg"],
    pre: [307],
    hints: [
      "Each fruit takes the leftmost basket with capacity >= its quantity. A linear scan per fruit is O(n^2).",
      "Store the max capacity of each range in a segment tree. If the root max is < x, the fruit is unplaced.",
      "Otherwise walk down: go left if the left child's max >= x, else right. Mark the found basket used (set it to 0) and fix the maxima upward."
    ],
    steps: [
      "Build a max segment tree over baskets (iterative, size = power of two).",
      "For each fruit x: if tree[1] < x, unplaced += 1; continue.",
      "i = 1; while i is internal: i = 2i if tree[2i] >= x else 2i+1.",
      "Set tree[i] = 0 and recompute the maxima of its ancestors. Return unplaced."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Going right whenever the right child fits finds A basket, not the LEFTMOST one; always prefer the left child.",
    code: `class Solution:
    def numOfUnplacedFruits(self, fruits: List[int], baskets: List[int]) -> int:
        n = len(baskets)
        size = 1
        while size < n:
            size *= 2
        t = [0] * (2 * size)
        t[size:size + n] = baskets
        for i in range(size - 1, 0, -1):
            t[i] = max(t[2 * i], t[2 * i + 1])
        unplaced = 0
        for x in fruits:
            if t[1] < x:
                unplaced += 1
                continue
            i = 1
            while i < size:                       # descend, preferring the left child
                i = 2 * i if t[2 * i] >= x else 2 * i + 1
            t[i] = 0                               # basket used
            i //= 2
            while i:
                t[i] = max(t[2 * i], t[2 * i + 1])
                i //= 2
        return unplaced
`
  },
  {
    num: 731, title: "My Calendar II", slug: "my-calendar-ii", lc: "Medium",
    topic: "advanced",
    pattern: "Ordered set / sorted map",
    level: 3,
    order: 70,
    core: true,
    teaches: "Sweep line on a sorted map: +1 at each start, -1 at each end; the running sum is the overlap at every point.",
    learn: ["dsa_advanced", "dsa-ad-sorted"],
    pre: [2349],
    hints: [
      "A triple booking means some moment is covered 3 times. How can you measure coverage at every moment?",
      "Store delta[start] += 1 and delta[end] -= 1 in a sorted map, then walk the keys in order keeping a running sum.",
      "Add the new booking tentatively; if the running sum ever hits 3, undo it and return False."
    ],
    steps: [
      "delta[start] += 1; delta[end] -= 1 (SortedDict).",
      "Walk keys in order with active += value; if active >= 3: undo the two changes and return False. Stop once a key >= end.",
      "Return True."
    ],
    time: "O(n) per booking", space: "O(n)",
    trap: "Undo exactly what you added (and delete keys that drop to 0), or later checks see phantom bookings.",
    code: `from sortedcontainers import SortedDict
class MyCalendarTwo:
    def __init__(self):
        self.delta = SortedDict()

    def book(self, startTime: int, endTime: int) -> bool:
        d = self.delta
        d[startTime] = d.get(startTime, 0) + 1
        d[endTime] = d.get(endTime, 0) - 1
        active = 0
        for t, v in d.items():
            if t >= endTime:
                break
            active += v
            if active >= 3:                       # undo and reject
                d[startTime] -= 1
                d[endTime] += 1
                for key in (startTime, endTime):
                    if d[key] == 0:
                        del d[key]
                return False
        return True
`
  },
  {
    num: 1797, title: "Design Authentication Manager", slug: "design-authentication-manager", lc: "Medium",
    topic: "advanced",
    pattern: "Design: cache and combined structures",
    level: 3,
    order: 80,
    core: false,
    teaches: "An OrderedDict ordered by expiry: renewing moves a token to the end, and expired tokens are popped from the front.",
    learn: ["dsa_advanced", "dsa-ad-cache"],
    pre: [1396],
    hints: [
      "Every token lives for the same timeToLive and time only moves forward. What does that say about the order of expiry times?",
      "Tokens expire in the order they were last generated or renewed. Keep them in an OrderedDict; renewing = update + move_to_end.",
      "Before each operation, pop from the front while the first token's expiry <= currentTime."
    ],
    steps: [
      "clean(t): while the oldest expiry <= t, popitem(last=False).",
      "generate: clean, then exp[id] = t + ttl.",
      "renew: clean; if id still present, exp[id] = t + ttl and move_to_end(id).",
      "count: clean; return len(exp)."
    ],
    time: "O(1) amortised per call", space: "O(n)",
    trap: "A token that expires exactly at currentTime is already expired (expiry <= t), so renewing it must do nothing.",
    code: `from collections import OrderedDict
class AuthenticationManager:
    def __init__(self, timeToLive: int):
        self.ttl = timeToLive
        self.exp = OrderedDict()           # tokenId -> expiry, oldest first

    def _clean(self, t):
        while self.exp and next(iter(self.exp.values())) <= t:
            self.exp.popitem(last=False)

    def generate(self, tokenId: str, currentTime: int) -> None:
        self._clean(currentTime)
        self.exp[tokenId] = currentTime + self.ttl

    def renew(self, tokenId: str, currentTime: int) -> None:
        self._clean(currentTime)
        if tokenId in self.exp:
            self.exp[tokenId] = currentTime + self.ttl
            self.exp.move_to_end(tokenId)

    def countUnexpiredTokens(self, currentTime: int) -> int:
        self._clean(currentTime)
        return len(self.exp)
`
  },
  {
    num: 1649, title: "Create Sorted Array through Instructions", slug: "create-sorted-array-through-instructions", lc: "Hard",
    topic: "advanced",
    pattern: "Fenwick tree (BIT)",
    level: 4,
    order: 90,
    core: false,
    teaches: "Fenwick tree indexed by value: count how many earlier numbers are smaller and how many are larger, in O(log V).",
    learn: ["dsa_advanced", "dsa-ad-bit"],
    pre: [1395],
    hints: [
      "For each new number x you need: how many inserted so far are < x, and how many are > x.",
      "Keep a Fenwick tree over values 1..max(instructions); prefix(x - 1) counts the smaller ones.",
      "Larger = (numbers inserted so far) - prefix(x). Add min(smaller, larger) to the cost, mod 1e9+7."
    ],
    steps: [
      "tree over values 1..max; cost = 0.",
      "For i, x: less = prefix(x - 1); greater = i - prefix(x); cost += min(less, greater).",
      "add(x, 1). Return cost % MOD."
    ],
    time: "O(n log V)", space: "O(V)",
    trap: "Equal values are neither smaller nor larger; use prefix(x - 1) for smaller and prefix(x) when computing larger.",
    code: `class Solution:
    def createSortedArray(self, instructions: List[int]) -> int:
        MOD = 10**9 + 7
        V = max(instructions)
        tree = [0] * (V + 1)
        def add(i):
            while i <= V:
                tree[i] += 1
                i += i & -i
        def prefix(i):
            s = 0
            while i > 0:
                s += tree[i]
                i -= i & -i
            return s
        cost = 0
        for i, x in enumerate(instructions):
            less = prefix(x - 1)
            greater = i - prefix(x)
            cost += min(less, greater)
            add(x)
        return cost % MOD
`
  },
  {
    num: 2407, title: "Longest Increasing Subsequence II", slug: "longest-increasing-subsequence-ii", lc: "Hard",
    topic: "advanced",
    pattern: "Segment tree",
    level: 4,
    order: 100,
    core: false,
    teaches: "LIS as DP over VALUES: dp[v] = 1 + max dp over the value window [v-k, v-1], answered by a max segment tree.",
    learn: ["dsa_advanced", "dsa-ad-seg"],
    pre: [3479],
    hints: [
      "Classic LIS looks back at earlier indices. Here the restriction is on values: the previous element must be in [x - k, x - 1].",
      "Index the DP by value: best[v] = longest valid subsequence ending with value v so far.",
      "Processing nums left to right: best[x] = 1 + max(best[x-k .. x-1]). That is a range-max query plus a point update."
    ],
    steps: [
      "Build a max segment tree over values 0..max(nums), all zeros.",
      "For each x: m = query(max(1, x - k), x - 1) (0 if the range is empty); update(x, m + 1).",
      "Return the root maximum."
    ],
    time: "O(n log V)", space: "O(V)",
    trap: "Elements must be STRICTLY increasing, so the window ends at x - 1, not x.",
    code: `class Solution:
    def lengthOfLIS(self, nums: List[int], k: int) -> int:
        N = max(nums) + 1
        t = [0] * (2 * N)                   # iterative max segment tree over values
        def update(i, v):
            i += N
            t[i] = max(t[i], v)
            while i > 1:
                i //= 2
                t[i] = max(t[2 * i], t[2 * i + 1])
        def query(l, r):                    # max over values l..r inclusive
            res = 0
            l += N
            r += N + 1
            while l < r:
                if l & 1:
                    res = max(res, t[l]); l += 1
                if r & 1:
                    r -= 1; res = max(res, t[r])
                l //= 2
                r //= 2
            return res
        best = 0
        for x in nums:
            lo, hi = max(1, x - k), x - 1
            cur = (query(lo, hi) if lo <= hi else 0) + 1
            update(x, cur)
            best = max(best, cur)
        return best
`
  },
  {
    num: 732, title: "My Calendar III", slug: "my-calendar-iii", lc: "Hard",
    topic: "advanced",
    pattern: "Lazy segment tree / range updates",
    level: 4,
    order: 110,
    core: true,
    teaches: "Range add + global max on a huge coordinate range: a dynamic segment tree whose nodes are created only when touched.",
    learn: ["dsa_advanced", "dsa-ad-lazy"],
    pre: [307],
    hints: [
      "Each booking adds +1 to every time in [start, end). You need the maximum overlap after each booking.",
      "That is 'add 1 on a range, read the max'. Coordinates go up to 1e9, so allocate nodes lazily in dicts.",
      "Keep add[v] (pending +k for the whole node) and mx[v] = add[v] + max(children). No push-down needed for this pair of operations."
    ],
    steps: [
      "Use dicts mx and add keyed by node id (root 1, children 2v and 2v+1) over the range [0, 1e9].",
      "update(v, lo, hi, a, b): if fully covered, mx[v] += 1 and add[v] += 1; else recurse into both children and set mx[v] = add[v] + max(mx[2v], mx[2v+1]).",
      "book(s, e): update [s, e - 1]; return mx[1]."
    ],
    time: "O(log C) per booking", space: "O(q log C)",
    trap: "Bookings are half-open [start, end): update up to end - 1, or back-to-back bookings will look overlapping.",
    code: `from collections import defaultdict
class MyCalendarThree:
    def __init__(self):
        self.mx = defaultdict(int)          # max overlap inside the node's range
        self.add = defaultdict(int)         # +k applied to the whole node (kept, never pushed)

    def _update(self, v, lo, hi, a, b):
        if b < lo or hi < a:
            return
        if a <= lo and hi <= b:
            self.mx[v] += 1
            self.add[v] += 1
            return
        mid = (lo + hi) // 2
        self._update(2 * v, lo, mid, a, b)
        self._update(2 * v + 1, mid + 1, hi, a, b)
        self.mx[v] = self.add[v] + max(self.mx[2 * v], self.mx[2 * v + 1])

    def book(self, startTime: int, endTime: int) -> int:
        self._update(1, 0, 10**9, startTime, endTime - 1)
        return self.mx[1]
`
  },
  {
    num: 1483, title: "Kth Ancestor of a Tree Node", slug: "kth-ancestor-of-a-tree-node", lc: "Hard",
    topic: "advanced",
    pattern: "Sparse table / binary lifting",
    level: 4,
    order: 120,
    core: true,
    teaches: "Binary lifting: store each node's 2^j-th ancestor, then jump by the set bits of k.",
    learn: ["dsa_advanced", "dsa-ad-sparse"],
    pre: [],
    hints: [
      "Walking up k parents one by one is O(k) per query. Any k can be written as a sum of powers of two.",
      "Precompute up[j][v] = the 2^j-th ancestor of v. up[0] is parent; up[j][v] = up[j-1][ up[j-1][v] ] (or -1).",
      "To answer, for every set bit j of k jump node = up[j][node]; stop with -1 if you fall off the tree."
    ],
    steps: [
      "LOG = n.bit_length(); up[0] = parent.",
      "For j in 1..LOG-1: up[j][v] = -1 if up[j-1][v] == -1 else up[j-1][up[j-1][v]].",
      "Query: for each bit j of k: node = up[j][node]; return -1 as soon as node is -1."
    ],
    time: "O(n log n) build, O(log k) query", space: "O(n log n)",
    trap: "k can have a bit higher than any precomputed level; that always means 'no such ancestor', so return -1.",
    code: `class TreeAncestor:
    def __init__(self, n: int, parent: List[int]):
        self.LOG = max(1, n.bit_length())
        self.up = [parent[:]]
        for _ in range(1, self.LOG):
            prev = self.up[-1]
            self.up.append([-1 if prev[v] == -1 else prev[prev[v]] for v in range(n)])

    def getKthAncestor(self, node: int, k: int) -> int:
        j = 0
        while k and node != -1:
            if k & 1:
                if j >= self.LOG:
                    return -1
                node = self.up[j][node]
            k >>= 1
            j += 1
        return node
`
  },
  {
    num: 352, title: "Data Stream as Disjoint Intervals", slug: "data-stream-as-disjoint-intervals", lc: "Hard",
    topic: "advanced",
    pattern: "Ordered set / sorted map",
    level: 4,
    order: 130,
    core: false,
    teaches: "Sorted disjoint intervals: a new value either falls inside one, extends a neighbour, or bridges two neighbours.",
    learn: ["dsa_advanced", "dsa-ad-sorted"],
    pre: [2349],
    hints: [
      "Keep the intervals sorted by start. Which intervals can a new value v touch?",
      "Only the interval just before it (start <= v) and the one just after it. Find them with bisect.",
      "Cases: v already inside the left one; v == left.end + 1 (extend); v == right.start - 1 (extend); both (merge into one)."
    ],
    steps: [
      "i = intervals.bisect_right((v, inf)); left = intervals[i-1] if i > 0.",
      "If left exists and left.end >= v: return (already covered).",
      "lo = hi = v; if left.end == v - 1: lo = left.start and remove left. If right.start == v + 1: hi = right.end and remove right.",
      "Add (lo, hi). getIntervals returns the list."
    ],
    time: "O(log n) add, O(n) get", space: "O(n)",
    trap: "Adding a value that already exists (or lies inside an interval) must change nothing.",
    code: `from sortedcontainers import SortedList
class SummaryRanges:
    def __init__(self):
        self.iv = SortedList()              # (start, end), disjoint, sorted

    def addNum(self, value: int) -> None:
        iv = self.iv
        i = iv.bisect_right((value, float('inf')))
        if i > 0 and iv[i - 1][1] >= value:
            return                          # already covered
        lo = hi = value
        if i > 0 and iv[i - 1][1] == value - 1:
            lo = iv[i - 1][0]
            iv.pop(i - 1)
            i -= 1
        if i < len(iv) and iv[i][0] == value + 1:
            hi = iv[i][1]
            iv.pop(i)
        iv.add((lo, hi))

    def getIntervals(self) -> List[List[int]]:
        return [list(t) for t in self.iv]
`
  },
  {
    num: 2817, title: "Minimum Absolute Difference Between Elements With Constraint", slug: "minimum-absolute-difference-between-elements-with-constraint", lc: "Medium",
    topic: "advanced",
    pattern: "Ordered set / sorted map",
    level: 4,
    order: 140,
    core: false,
    teaches: "Slide a 'far enough' boundary: insert nums[i-x] into a sorted set, then look up the closest value to nums[i].",
    learn: ["dsa_advanced", "dsa-ad-sorted"],
    pre: [2349],
    hints: [
      "For index i, every j <= i - x is allowed. That allowed set only grows as i moves right.",
      "Keep a SortedList of the allowed values. When you reach i, first add nums[i - x].",
      "The closest value to nums[i] is at the bisect position or just before it."
    ],
    steps: [
      "sl = SortedList(); ans = inf.",
      "For i from x to n - 1: sl.add(nums[i - x]); j = sl.bisect_left(nums[i]).",
      "Check sl[j] - nums[i] and nums[i] - sl[j - 1] when they exist; keep the minimum.",
      "Return ans."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "With x = 0 an element may pair with itself, so the answer is 0.",
    code: `from sortedcontainers import SortedList
class Solution:
    def minAbsoluteDifference(self, nums: List[int], x: int) -> int:
        sl = SortedList()
        ans = float('inf')
        for i in range(x, len(nums)):
            sl.add(nums[i - x])
            v = nums[i]
            j = sl.bisect_left(v)
            if j < len(sl):
                ans = min(ans, sl[j] - v)
            if j > 0:
                ans = min(ans, v - sl[j - 1])
        return ans
`
  },
  {
    num: 146, title: "LRU Cache", slug: "lru-cache", lc: "Medium",
    topic: "advanced",
    pattern: "Design: cache and combined structures",
    level: 4,
    order: 150,
    core: true,
    teaches: "Hash map for O(1) lookup + doubly linked list for O(1) recency order: move to front on use, evict from the tail.",
    learn: ["dsa_advanced", "dsa-ad-cache"],
    pre: [1797],
    hints: [
      "get and put must be O(1), and you must know which key was used least recently.",
      "A dict finds the node for a key; a doubly linked list keeps nodes in recency order and can unlink any node in O(1).",
      "Use sentinel head and tail nodes. On get/put move the node to the front; when over capacity remove the node before tail and delete its key."
    ],
    steps: [
      "Node(key, val, prev, next); head <-> tail sentinels; map key -> node.",
      "get: if missing return -1; unlink the node, insert after head, return its value.",
      "put: if present, update and move to front; else create and insert at front; if size > capacity, unlink tail.prev and delete its key."
    ],
    time: "O(1) per operation", space: "O(capacity)",
    trap: "Store the key inside the node; without it you cannot delete the evicted entry from the dict. (OrderedDict with move_to_end is a valid shortcut.)",
    code: `class Node:
    __slots__ = ('key', 'val', 'prev', 'next')
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = Node(), Node()   # sentinels: head.next is most recent
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _push_front(self, node):
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        node = self.map.get(key)
        if node is None:
            return -1
        self._unlink(node)
        self._push_front(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        node = self.map.get(key)
        if node:
            node.val = value
            self._unlink(node)
            self._push_front(node)
            return
        node = Node(key, value)
        self.map[key] = node
        self._push_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._unlink(lru)
            del self.map[lru.key]
`
  },
  {
    num: 2179, title: "Count Good Triplets in an Array", slug: "count-good-triplets-in-an-array", lc: "Hard",
    topic: "advanced",
    pattern: "Fenwick tree (BIT)",
    level: 5,
    order: 160,
    core: false,
    teaches: "Re-index one array by positions in the other, then count increasing triplets with a Fenwick tree (fix the middle).",
    learn: ["dsa_advanced", "dsa-ad-bit"],
    pre: [1395],
    hints: [
      "A triplet is good if it appears in increasing position order in BOTH arrays. Can you reduce this to one array?",
      "Replace each value in nums1 by its index in nums2. Now a good triplet is just an increasing triplet in that new array.",
      "Fix the middle j: left = earlier values smaller than arr[j] (Fenwick); right = (n - 1 - arr[j]) - (j - left). Add left * right."
    ],
    steps: [
      "pos2[v] = index of v in nums2; arr = [pos2[v] for v in nums1].",
      "For j, v in enumerate(arr): left = prefix(v) (count of earlier values < v); right = (n - 1 - v) - (j - left).",
      "ans += left * right; add(v + 1, 1)."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Right side: values greater than v total n - 1 - v; subtract the ones already seen on the left (j - left).",
    code: `class Solution:
    def goodTriplets(self, nums1: List[int], nums2: List[int]) -> int:
        n = len(nums1)
        pos2 = [0] * n
        for i, v in enumerate(nums2):
            pos2[v] = i
        tree = [0] * (n + 1)
        def add(i):
            while i <= n:
                tree[i] += 1
                i += i & -i
        def prefix(i):                     # how many seen values are < i (values stored at index value + 1)
            s = 0
            while i > 0:
                s += tree[i]
                i -= i & -i
            return s
        ans = 0
        for j, x in enumerate(nums1):
            v = pos2[x]
            left = prefix(v)
            right = (n - 1 - v) - (j - left)
            ans += left * right
            add(v + 1)
        return ans
`
  },
  {
    num: 2286, title: "Booking Concert Tickets in Groups", slug: "booking-concert-tickets-in-groups", lc: "Hard",
    topic: "advanced",
    pattern: "Segment tree",
    level: 5,
    order: 170,
    core: false,
    teaches: "One segment tree storing both max and sum of free seats per row: 'first row with room' and 'total room in a prefix'.",
    learn: ["dsa_advanced", "dsa-ad-seg"],
    pre: [3479],
    hints: [
      "gather needs the FIRST row <= maxRow with at least k free seats. scatter needs the TOTAL free seats in rows 0..maxRow.",
      "Keep free[row] in a segment tree that stores both max and sum. gather = descend to the leftmost leaf with max >= k (restricted to rows <= maxRow).",
      "scatter: check the sum first; then fill rows from a pointer to the first non-full row. Each full row is passed only once overall."
    ],
    steps: [
      "Build a tree where every leaf (row) has free = m.",
      "gather: find leftmost row <= maxRow with free >= k; if none return []; seat = m - free; set free -= k.",
      "scatter: if sum(0..maxRow) < k return False; starting at the first non-full row, take min(free, k) seats per row, update, advance the pointer past full rows.",
      "Return True."
    ],
    time: "O((n + q) log n) amortised", space: "O(n)",
    trap: "Scanning from row 0 on every scatter is O(n) per call; keep a pointer to the first row that still has seats.",
    code: `class BookMyShow:
    def __init__(self, n: int, m: int):
        self.n, self.m = n, m
        self.mx = [0] * (4 * n)
        self.sm = [0] * (4 * n)
        self.used = [0] * n
        self.first = 0                      # rows before this one are full
        self._build(1, 0, n - 1)

    def _build(self, v, lo, hi):
        if lo == hi:
            self.mx[v] = self.sm[v] = self.m
            return
        mid = (lo + hi) // 2
        self._build(2 * v, lo, mid)
        self._build(2 * v + 1, mid + 1, hi)
        self.mx[v] = max(self.mx[2 * v], self.mx[2 * v + 1])
        self.sm[v] = self.sm[2 * v] + self.sm[2 * v + 1]

    def _set(self, v, lo, hi, i, free):
        if lo == hi:
            self.mx[v] = self.sm[v] = free
            return
        mid = (lo + hi) // 2
        if i <= mid:
            self._set(2 * v, lo, mid, i, free)
        else:
            self._set(2 * v + 1, mid + 1, hi, i, free)
        self.mx[v] = max(self.mx[2 * v], self.mx[2 * v + 1])
        self.sm[v] = self.sm[2 * v] + self.sm[2 * v + 1]

    def _sum(self, v, lo, hi, r):           # free seats in rows 0..r
        if lo > r:
            return 0
        if hi <= r:
            return self.sm[v]
        mid = (lo + hi) // 2
        return self._sum(2 * v, lo, mid, r) + self._sum(2 * v + 1, mid + 1, hi, r)

    def _first_fit(self, v, lo, hi, k, r):  # leftmost row <= r with free >= k
        if lo > r or self.mx[v] < k:
            return -1
        if lo == hi:
            return lo
        mid = (lo + hi) // 2
        i = self._first_fit(2 * v, lo, mid, k, r)
        return i if i != -1 else self._first_fit(2 * v + 1, mid + 1, hi, k, r)

    def gather(self, k: int, maxRow: int) -> List[int]:
        i = self._first_fit(1, 0, self.n - 1, k, maxRow)
        if i == -1:
            return []
        seat = self.used[i]
        self.used[i] += k
        self._set(1, 0, self.n - 1, i, self.m - self.used[i])
        return [i, seat]

    def scatter(self, k: int, maxRow: int) -> bool:
        if self._sum(1, 0, self.n - 1, maxRow) < k:
            return False
        i = self.first
        while k:
            take = min(self.m - self.used[i], k)
            if take:
                self.used[i] += take
                k -= take
                self._set(1, 0, self.n - 1, i, self.m - self.used[i])
            if self.used[i] == self.m and i == self.first:
                self.first += 1
            i += 1
        return True
`
  },
  {
    num: 699, title: "Falling Squares", slug: "falling-squares", lc: "Hard",
    topic: "advanced",
    pattern: "Lazy segment tree / range updates",
    level: 5,
    order: 180,
    core: false,
    teaches: "Coordinate-compress the x-range, then each square is 'range max' followed by 'range assign' on a lazy segment tree.",
    learn: ["dsa_advanced", "dsa-ad-lazy"],
    pre: [732],
    hints: [
      "A square lands on the highest point under its base, then raises that whole interval to (that height + size).",
      "Only the square edges matter: compress the x coordinates left and left + size - 1.",
      "Lazy segment tree with two operations: query max on [a, b], assign value on [a, b]. Push the pending assignment down before recursing."
    ],
    steps: [
      "Compress all left and left + size - 1 values.",
      "For each square: h = query(a, b) + size; assign(a, b, h); best = max(best, h); record best.",
      "assign sets mx and a lazy tag on fully covered nodes; push(v) copies the tag into both children before partial work."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Use left + size - 1 as the right end; squares that only touch at an edge must not stack.",
    code: `class Solution:
    def fallingSquares(self, positions: List[List[int]]) -> List[int]:
        xs = sorted({x for l, s in positions for x in (l, l + s - 1)})
        idx = {x: i for i, x in enumerate(xs)}
        n = len(xs)
        mx = [0] * (4 * n)
        tag = [0] * (4 * n)                 # 0 = no pending assignment (heights are >= 1)
        def push(v):
            if tag[v]:
                for c in (2 * v, 2 * v + 1):
                    mx[c] = tag[c] = tag[v]
                tag[v] = 0
        def query(v, lo, hi, a, b):
            if b < lo or hi < a:
                return 0
            if a <= lo and hi <= b:
                return mx[v]
            push(v)
            mid = (lo + hi) // 2
            return max(query(2 * v, lo, mid, a, b), query(2 * v + 1, mid + 1, hi, a, b))
        def assign(v, lo, hi, a, b, val):
            if b < lo or hi < a:
                return
            if a <= lo and hi <= b:
                mx[v] = tag[v] = val
                return
            push(v)
            mid = (lo + hi) // 2
            assign(2 * v, lo, mid, a, b, val)
            assign(2 * v + 1, mid + 1, hi, a, b, val)
            mx[v] = max(mx[2 * v], mx[2 * v + 1])
        res, best = [], 0
        for left, size in positions:
            a, b = idx[left], idx[left + size - 1]
            h = query(1, 0, n - 1, a, b) + size
            assign(1, 0, n - 1, a, b, h)
            best = max(best, h)
            res.append(best)
        return res
`
  },
  {
    num: 715, title: "Range Module", slug: "range-module", lc: "Hard",
    topic: "advanced",
    pattern: "Lazy segment tree / range updates",
    level: 5,
    order: 190,
    core: false,
    teaches: "A dynamic segment tree with range-assign (cover / uncover) and an 'is this whole range covered?' query.",
    learn: ["dsa_advanced", "dsa-ad-lazy"],
    pre: [732],
    hints: [
      "You must add and remove whole intervals and ask whether an interval is fully tracked. Think 'assign True/False on a range'.",
      "Use a dynamic segment tree over [1, 1e9]: cov[v] = whole node covered; tag[v] = pending assignment for the children.",
      "Query: if the node is fully inside the asked range return cov[v]; if it carries a tag the whole node is uniform, so return the tag."
    ],
    steps: [
      "assign(v, lo, hi, a, b, val): full cover -> cov[v] = tag[v] = val; else push the tag to both children, recurse, cov[v] = cov[2v] and cov[2v+1].",
      "query(v, lo, hi, a, b): disjoint -> True; inside -> cov[v]; tag present -> tag; else both children.",
      "addRange / removeRange / queryRange call these on [left, right - 1]."
    ],
    time: "O(log C) per call", space: "O(q log C)",
    trap: "Intervals are half-open [left, right); and a missing dict entry must mean 'not covered'.",
    code: `class RangeModule:
    def __init__(self):
        self.cov = {}                       # node -> fully covered?
        self.tag = {}                       # node -> pending assignment for its children
        self.HI = 10**9

    def _push(self, v):
        if v in self.tag:
            val = self.tag.pop(v)
            for c in (2 * v, 2 * v + 1):
                self.cov[c] = self.tag[c] = val

    def _assign(self, v, lo, hi, a, b, val):
        if b < lo or hi < a:
            return
        if a <= lo and hi <= b:
            self.cov[v] = self.tag[v] = val
            return
        self._push(v)
        mid = (lo + hi) // 2
        self._assign(2 * v, lo, mid, a, b, val)
        self._assign(2 * v + 1, mid + 1, hi, a, b, val)
        self.cov[v] = self.cov.get(2 * v, False) and self.cov.get(2 * v + 1, False)

    def _query(self, v, lo, hi, a, b):
        if b < lo or hi < a:
            return True
        if a <= lo and hi <= b or self.cov.get(v, False):
            return self.cov.get(v, False)
        if v in self.tag:                   # whole node is uniform
            return self.tag[v]
        mid = (lo + hi) // 2
        return self._query(2 * v, lo, mid, a, b) and self._query(2 * v + 1, mid + 1, hi, a, b)

    def addRange(self, left: int, right: int) -> None:
        self._assign(1, 1, self.HI, left, right - 1, True)

    def queryRange(self, left: int, right: int) -> bool:
        return self._query(1, 1, self.HI, left, right - 1)

    def removeRange(self, left: int, right: int) -> None:
        self._assign(1, 1, self.HI, left, right - 1, False)
`
  },
  {
    num: 2836, title: "Maximize Value of Function in a Ball Passing Game", slug: "maximize-value-of-function-in-a-ball-passing-game", lc: "Hard",
    topic: "advanced",
    pattern: "Sparse table / binary lifting",
    level: 5,
    order: 200,
    core: false,
    teaches: "Binary lifting with sums: alongside 'where am I after 2^j passes' store 'how much did those 2^j passes add'.",
    learn: ["dsa_advanced", "dsa-ad-sparse"],
    pre: [1483],
    hints: [
      "k can be 10^10, so you cannot simulate. The receiver array is a functional graph (each node has one next).",
      "Store nxt[j][x] = node after 2^j passes from x, and sm[j][x] = sum of the ids received during those passes.",
      "Combine: nxt[j][x] = nxt[j-1][nxt[j-1][x]], sm[j][x] = sm[j-1][x] + sm[j-1][nxt[j-1][x]]. For each start, add up the blocks for the set bits of k."
    ],
    steps: [
      "nxt[0] = receiver, sm[0] = receiver (the id of whoever receives).",
      "Build levels up to k.bit_length().",
      "For each start x: total = x, cur = x; for each set bit j of k: total += sm[j][cur]; cur = nxt[j][cur].",
      "Return the maximum total."
    ],
    time: "O(n log k)", space: "O(n log k)",
    trap: "The starting player's own id counts once (f(x) starts at x), and receivers can repeat, including self-passes.",
    code: `class Solution:
    def getMaxFunctionValue(self, receiver: List[int], k: int) -> int:
        n = len(receiver)
        LOG = k.bit_length()
        nxt = [receiver[:]]
        sm = [receiver[:]]
        for j in range(1, LOG):
            pn, ps = nxt[-1], sm[-1]
            nxt.append([pn[pn[x]] for x in range(n)])
            sm.append([ps[x] + ps[pn[x]] for x in range(n)])
        best = 0
        for x in range(n):
            total, cur = x, x
            for j in range(LOG):
                if k >> j & 1:
                    total += sm[j][cur]
                    cur = nxt[j][cur]
            best = max(best, total)
        return best
`
  },
  {
    num: 1847, title: "Closest Room", slug: "closest-room", lc: "Hard",
    topic: "advanced",
    pattern: "Ordered set / sorted map",
    level: 5,
    order: 210,
    core: false,
    teaches: "Answer queries offline: sort rooms and queries by size descending, so the set of valid room ids only grows.",
    learn: ["dsa_advanced", "dsa-ad-sorted"],
    pre: [2817],
    hints: [
      "Each query restricts to rooms with size >= minSize. If you handle the largest minSize first, how does the valid set change?",
      "It only grows. Sort queries by minSize descending, add rooms with size >= minSize into a SortedList of ids.",
      "Then the closest id to preferred is next to its bisect position; break ties by the smaller id."
    ],
    steps: [
      "Sort rooms by size descending; sort query indices by minSize descending.",
      "For each query: add all rooms with size >= minSize to the SortedList of ids.",
      "j = ids.bisect_left(preferred); compare ids[j] and ids[j-1] by (abs(id - preferred), id).",
      "Store the answer at the query's original index (-1 if no rooms)."
    ],
    time: "O((n + q) log n)", space: "O(n + q)",
    trap: "Answers must be returned in the ORIGINAL query order; keep the query indices when sorting.",
    code: `from sortedcontainers import SortedList
class Solution:
    def closestRoom(self, rooms: List[List[int]], queries: List[List[int]]) -> List[int]:
        rooms = sorted(rooms, key=lambda r: -r[1])
        order = sorted(range(len(queries)), key=lambda i: -queries[i][1])
        ids = SortedList()
        res = [-1] * len(queries)
        j = 0
        for qi in order:
            pref, need = queries[qi]
            while j < len(rooms) and rooms[j][1] >= need:
                ids.add(rooms[j][0])
                j += 1
            k = ids.bisect_left(pref)
            cands = [ids[t] for t in (k - 1, k) if 0 <= t < len(ids)]
            if cands:
                res[qi] = min(cands, key=lambda r: (abs(r - pref), r))
        return res
`
  },
  {
    num: 1825, title: "Finding MK Average", slug: "finding-mk-average", lc: "Hard",
    topic: "advanced",
    pattern: "Ordered set / sorted map",
    level: 5,
    order: 220,
    core: false,
    teaches: "Three sorted lists (smallest k, middle, largest k) kept balanced, with a running sum of the middle part.",
    learn: ["dsa_advanced", "dsa-ad-sorted"],
    pre: [2349],
    hints: [
      "You need the sum of the window after dropping the k smallest and k largest, after every insertion and removal.",
      "Split the last m elements into lo (k smallest), mid, and hi (k largest), each a SortedList, and keep sum(mid) updated.",
      "Insert into the right list, delete the element leaving the window from whichever list holds it, then rebalance by moving boundary elements."
    ],
    steps: [
      "Insert: num <= lo[-1] -> lo; num >= hi[0] -> hi; else mid (sum += num).",
      "If the window exceeds m, remove the oldest from lo, hi or mid (sum -= x if mid).",
      "Rebalance: move lo's largest / hi's smallest into mid while they exceed k; refill lo / hi from mid's ends while they are short.",
      "calculateMKAverage: -1 if fewer than m elements, else sum // (m - 2k)."
    ],
    time: "O(log m) per add, O(1) per query", space: "O(m)",
    trap: "Recomputing the middle sum by slicing on every query is O(m) and times out; keep the sum incrementally.",
    code: `from collections import deque
from sortedcontainers import SortedList
class MKAverage:
    def __init__(self, m: int, k: int):
        self.m, self.k = m, k
        self.q = deque()
        self.lo, self.mid, self.hi = SortedList(), SortedList(), SortedList()
        self.total = 0                       # sum of self.mid

    def _rebalance(self):
        k = self.k
        while len(self.lo) > k:
            x = self.lo.pop(); self.mid.add(x); self.total += x
        while len(self.hi) > k:
            x = self.hi.pop(0); self.mid.add(x); self.total += x
        while len(self.lo) < k and self.mid:
            x = self.mid.pop(0); self.total -= x; self.lo.add(x)
        while len(self.hi) < k and self.mid:
            x = self.mid.pop(); self.total -= x; self.hi.add(x)

    def addElement(self, num: int) -> None:
        self.q.append(num)
        if self.lo and num <= self.lo[-1]:
            self.lo.add(num)
        elif self.hi and num >= self.hi[0]:
            self.hi.add(num)
        else:
            self.mid.add(num); self.total += num
        if len(self.q) > self.m:
            x = self.q.popleft()
            if x in self.lo:
                self.lo.remove(x)
            elif x in self.hi:
                self.hi.remove(x)
            else:
                self.mid.remove(x); self.total -= x
        self._rebalance()

    def calculateMKAverage(self) -> int:
        if len(self.q) < self.m:
            return -1
        return self.total // (self.m - 2 * self.k)
`
  },
  {
    num: 975, title: "Odd Even Jump", slug: "odd-even-jump", lc: "Hard",
    topic: "advanced",
    pattern: "Ordered set / sorted map",
    level: 5,
    order: 230,
    core: false,
    teaches: "Go right to left with a sorted map value -> index: ceiling gives the odd jump, floor gives the even jump, then DP.",
    learn: ["dsa_advanced", "dsa-ad-sorted"],
    pre: [2817],
    hints: [
      "From i, the odd jump goes to the smallest value >= arr[i] to the right (smallest index on ties); the even jump to the largest value <= arr[i].",
      "Process i from right to left, keeping a sorted map value -> index of what lies to the right. Overwriting a value with a smaller index handles ties.",
      "odd[i] = even[next_odd(i)], even[i] = odd[next_even(i)]; the last index is good for both. Count i with odd[i] true."
    ],
    steps: [
      "odd[n-1] = even[n-1] = True; sd = SortedDict({arr[n-1]: n-1}).",
      "For i from n-2 down: ceiling key -> odd[i] = even[that index]; floor key -> even[i] = odd[that index].",
      "sd[arr[i]] = i. Return sum(odd)."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Start counting with odd jumps: the first jump from any start is jump number 1 (odd).",
    code: `from sortedcontainers import SortedDict
class Solution:
    def oddEvenJumps(self, arr: List[int]) -> int:
        n = len(arr)
        odd, even = [False] * n, [False] * n
        odd[-1] = even[-1] = True
        sd = SortedDict({arr[-1]: n - 1})
        for i in range(n - 2, -1, -1):
            v = arr[i]
            k = sd.bisect_left(v)                   # smallest key >= v
            if k < len(sd):
                odd[i] = even[sd.peekitem(k)[1]]
            k = sd.bisect_right(v) - 1              # largest key <= v
            if k >= 0:
                even[i] = odd[sd.peekitem(k)[1]]
            sd[v] = i                               # nearer index wins ties
        return sum(odd)
`
  },
  {
    num: 460, title: "LFU Cache", slug: "lfu-cache", lc: "Hard",
    topic: "advanced",
    pattern: "Design: cache and combined structures",
    level: 5,
    order: 240,
    core: true,
    teaches: "Group keys by frequency, each group an OrderedDict in recency order, and track the minimum frequency.",
    learn: ["dsa_advanced", "dsa-ad-cache"],
    pre: [146],
    hints: [
      "Eviction picks the lowest frequency, and among those the least recently used. How do you find that in O(1)?",
      "Keep groups[freq] = OrderedDict of keys (oldest first) and min_freq. Using a key moves it from groups[f] to groups[f + 1].",
      "When groups[min_freq] becomes empty after a move, min_freq increases by 1. A brand-new key always resets min_freq to 1."
    ],
    steps: [
      "val[key], freq[key], groups[f] = OrderedDict(), min_freq.",
      "touch(key): remove from groups[f]; if it was the last one and f == min_freq, min_freq += 1; add to groups[f + 1].",
      "get: missing -> -1; else touch and return the value.",
      "put: existing -> update value and touch. New: if full, evict groups[min_freq].popitem(last=False); insert with freq 1; min_freq = 1."
    ],
    time: "O(1) per operation", space: "O(capacity)",
    trap: "Capacity 0 must store nothing; and evict BEFORE inserting the new key, otherwise you might evict the key you just added.",
    code: `from collections import defaultdict, OrderedDict
class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.val = {}
        self.freq = {}
        self.groups = defaultdict(OrderedDict)   # freq -> keys, least recent first
        self.min_freq = 0

    def _touch(self, key):
        f = self.freq[key]
        del self.groups[f][key]
        if not self.groups[f]:
            del self.groups[f]
            if self.min_freq == f:
                self.min_freq = f + 1
        self.freq[key] = f + 1
        self.groups[f + 1][key] = None

    def get(self, key: int) -> int:
        if key not in self.val:
            return -1
        self._touch(key)
        return self.val[key]

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return
        if key in self.val:
            self.val[key] = value
            self._touch(key)
            return
        if len(self.val) >= self.cap:
            old, _ = self.groups[self.min_freq].popitem(last=False)
            if not self.groups[self.min_freq]:
                del self.groups[self.min_freq]
            del self.val[old], self.freq[old]
        self.val[key] = value
        self.freq[key] = 1
        self.groups[1][key] = None
        self.min_freq = 1
`
  },
  {
    num: 432, title: "All O`one Data Structure", slug: "all-oone-data-structure", lc: "Hard",
    topic: "advanced",
    pattern: "Design: cache and combined structures",
    level: 5,
    order: 250,
    core: false,
    teaches: "A doubly linked list of count buckets (each a set of keys) gives O(1) inc/dec and O(1) min/max at the two ends.",
    learn: ["dsa_advanced", "dsa-ad-cache"],
    pre: [146],
    hints: [
      "All four operations must be O(1). A heap gives O(log n); a sorted structure is too slow. What is special about inc/dec?",
      "Counts change by exactly 1, so a key only moves to a NEIGHBOURING bucket. Keep buckets in a doubly linked list sorted by count.",
      "Map key -> bucket. inc: move the key to the next bucket (create it if its count is not cur + 1). dec: move to the previous bucket or drop the key at count 1. Delete empty buckets. Min is head.next, max is tail.prev."
    ],
    steps: [
      "Bucket(count, keys=set(), prev, next) with head/tail sentinels; where[key] = bucket.",
      "inc: cur = where.get(key, head); nxt = cur.next if its count is cur.count + 1, else a new bucket after cur; move key; remove cur if empty (not head).",
      "dec: cur = where[key]; if count is 1 delete the key; else move it to cur.prev (creating count - 1 if needed); remove cur if empty.",
      "getMaxKey / getMinKey: any key of tail.prev / head.next, or ''."
    ],
    time: "O(1) per operation", space: "O(n)",
    trap: "Remove the old bucket only AFTER linking the new one next to it, or you lose your position in the list.",
    code: `class Bucket:
    __slots__ = ('count', 'keys', 'prev', 'next')
    def __init__(self, count):
        self.count = count
        self.keys = set()
        self.prev = self.next = None

class AllOne:
    def __init__(self):
        self.head, self.tail = Bucket(0), Bucket(0)
        self.head.next, self.tail.prev = self.tail, self.head
        self.where = {}

    def _insert_after(self, node, count):
        b = Bucket(count)
        b.prev, b.next = node, node.next
        node.next.prev = b
        node.next = b
        return b

    def _remove(self, b):
        b.prev.next, b.next.prev = b.next, b.prev

    def inc(self, key: str) -> None:
        cur = self.where.get(key, self.head)
        nxt = cur.next
        if nxt is self.tail or nxt.count != cur.count + 1:
            nxt = self._insert_after(cur, cur.count + 1)
        nxt.keys.add(key)
        self.where[key] = nxt
        if cur is not self.head:
            cur.keys.discard(key)
            if not cur.keys:
                self._remove(cur)

    def dec(self, key: str) -> None:
        cur = self.where[key]
        if cur.count == 1:
            del self.where[key]
        else:
            prv = cur.prev
            if prv is self.head or prv.count != cur.count - 1:
                prv = self._insert_after(prv, cur.count - 1)
            prv.keys.add(key)
            self.where[key] = prv
        cur.keys.discard(key)
        if not cur.keys:
            self._remove(cur)

    def getMaxKey(self) -> str:
        return '' if self.tail.prev is self.head else next(iter(self.tail.prev.keys))

    def getMinKey(self) -> str:
        return '' if self.head.next is self.tail else next(iter(self.head.next.keys))
`
  },
  {
    num: 2926, title: "Maximum Balanced Subsequence Sum", slug: "maximum-balanced-subsequence-sum", lc: "Hard",
    topic: "advanced",
    pattern: "Fenwick tree (BIT)",
    level: 6,
    order: 260,
    core: false,
    teaches: "Rewrite the constraint as key_j <= key_i with key = nums[i] - i, then run DP with a prefix-MAX Fenwick tree over compressed keys.",
    learn: ["dsa_advanced", "dsa-ad-bit"],
    pre: [2179],
    hints: [
      "The rule nums[i] - nums[j] >= i - j looks like it mixes two indices. Move terms around.",
      "It is nums[j] - j <= nums[i] - i. With key = nums[i] - i, a subsequence is balanced iff its keys never decrease.",
      "dp[i] = nums[i] + max(0, best dp[j] with key_j <= key_i). A Fenwick tree storing prefix MAXIMA over compressed keys answers that in O(log n)."
    ],
    steps: [
      "keys = nums[i] - i; compress them to ranks 1..k.",
      "Fenwick tree for prefix max, initialised to -infinity.",
      "For each i: best = query(rank_i); dp = nums[i] + max(0, best); update(rank_i, dp); ans = max(ans, dp).",
      "Return ans."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Values can be negative: never extend a negative best (use max(0, best)); and a prefix-max Fenwick tree only supports values that grow.",
    code: `class Solution:
    def maxBalancedSubsequenceSum(self, nums: List[int]) -> int:
        keys = [x - i for i, x in enumerate(nums)]
        rank = {k: i + 1 for i, k in enumerate(sorted(set(keys)))}
        m = len(rank)
        NEG = float('-inf')
        tree = [NEG] * (m + 1)
        def update(i, v):
            while i <= m:
                if v > tree[i]:
                    tree[i] = v
                i += i & -i
        def query(i):                       # max over ranks 1..i
            best = NEG
            while i > 0:
                if tree[i] > best:
                    best = tree[i]
                i -= i & -i
            return best
        ans = NEG
        for x, k in zip(nums, keys):
            r = rank[k]
            dp = x + max(0, query(r))
            update(r, dp)
            ans = max(ans, dp)
        return ans
`
  },
  {
    num: 2213, title: "Longest Substring of One Repeating Character", slug: "longest-substring-of-one-repeating-character", lc: "Hard",
    topic: "advanced",
    pattern: "Segment tree",
    level: 6,
    order: 270,
    core: false,
    teaches: "A segment tree whose nodes store (longest prefix run, longest suffix run, best run); merging two halves glues the runs at the middle.",
    learn: ["dsa_advanced", "dsa-ad-seg"],
    pre: [2286],
    hints: [
      "After each single-character update you need the longest block of equal characters. Recomputing is O(n) per query.",
      "For a range, store pre (run starting at its left end), suf (run ending at its right end), and best.",
      "Merge L and R: best = max(L.best, R.best, and L.suf + R.pre if the two middle characters match). pre extends into R only if L is one full run; suf likewise."
    ],
    steps: [
      "Build the tree over the characters; a leaf has pre = suf = best = 1.",
      "pull(v): copy L.pre and R.suf, best = max(L.best, R.best); if s[mid] == s[mid+1], extend pre/suf when a side is all one run and consider L.suf + R.pre.",
      "For each query: set the character, update the leaf, pull on the way up, record best at the root."
    ],
    time: "O((n + q) log n)", space: "O(n)",
    trap: "pre of the parent extends into the right half only when the left half is entirely one run (pre == its length).",
    code: `class Solution:
    def longestRepeating(self, s: str, queryCharacters: str, queryIndices: List[int]) -> List[int]:
        s = list(s)
        n = len(s)
        pre, suf, best = [0] * (4 * n), [0] * (4 * n), [0] * (4 * n)
        def pull(v, lo, hi):
            mid = (lo + hi) // 2
            L, R = 2 * v, 2 * v + 1
            pre[v], suf[v] = pre[L], suf[R]
            best[v] = max(best[L], best[R])
            if s[mid] == s[mid + 1]:                       # runs can join across the middle
                if pre[L] == mid - lo + 1:
                    pre[v] += pre[R]
                if suf[R] == hi - mid:
                    suf[v] += suf[L]
                best[v] = max(best[v], suf[L] + pre[R])
        def build(v, lo, hi):
            if lo == hi:
                pre[v] = suf[v] = best[v] = 1
                return
            mid = (lo + hi) // 2
            build(2 * v, lo, mid)
            build(2 * v + 1, mid + 1, hi)
            pull(v, lo, hi)
        def update(v, lo, hi, i):
            if lo == hi:
                return
            mid = (lo + hi) // 2
            if i <= mid:
                update(2 * v, lo, mid, i)
            else:
                update(2 * v + 1, mid + 1, hi, i)
            pull(v, lo, hi)
        build(1, 0, n - 1)
        res = []
        for ch, i in zip(queryCharacters, queryIndices):
            s[i] = ch
            update(1, 0, n - 1, i)
            res.append(best[1])
        return res
`
  },
  {
    num: 850, title: "Rectangle Area II", slug: "rectangle-area-ii", lc: "Hard",
    topic: "advanced",
    pattern: "Lazy segment tree / range updates",
    level: 6,
    order: 280,
    core: false,
    teaches: "Sweep a horizontal line upward; a segment tree over compressed x keeps 'covered length' with cover counts (no push-down needed).",
    learn: ["dsa_advanced", "dsa-ad-lazy"],
    pre: [699],
    hints: [
      "Between two consecutive y events, the covered area is (covered x-length) * (gap in y).",
      "Each rectangle adds +1 cover on [x1, x2) at y1 and -1 at y2. You need the total x-length with cover > 0 after every event.",
      "Segment tree over the compressed x gaps: cnt[v] = how many rectangles cover the whole node; length[v] = full width if cnt[v] > 0, else the children's sum (0 at a leaf)."
    ],
    steps: [
      "Events (y, +1/-1, x1, x2), sorted by y; xs = sorted distinct x values.",
      "For each event: area += length[root] * (y - prev_y); apply the +1/-1 to the gap range [idx(x1), idx(x2) - 1]; prev_y = y.",
      "update recomputes length[v] from cnt[v] or its children. Return area mod 1e9+7."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Store cover counts, not booleans; overlapping rectangles must not be double-counted, and removals must not uncover areas still covered by others.",
    code: `class Solution:
    def rectangleArea(self, rectangles: List[List[int]]) -> int:
        MOD = 10**9 + 7
        xs = sorted({x for x1, _, x2, _ in rectangles for x in (x1, x2)})
        idx = {x: i for i, x in enumerate(xs)}
        m = len(xs) - 1                     # number of elementary x gaps
        cnt = [0] * (4 * m)
        length = [0] * (4 * m)
        def update(v, lo, hi, a, b, d):
            if b < lo or hi < a:
                return
            if a <= lo and hi <= b:
                cnt[v] += d
            else:
                mid = (lo + hi) // 2
                update(2 * v, lo, mid, a, b, d)
                update(2 * v + 1, mid + 1, hi, a, b, d)
            if cnt[v] > 0:
                length[v] = xs[hi + 1] - xs[lo]
            elif lo == hi:
                length[v] = 0
            else:
                length[v] = length[2 * v] + length[2 * v + 1]
        events = []
        for x1, y1, x2, y2 in rectangles:
            events.append((y1, 1, x1, x2))
            events.append((y2, -1, x1, x2))
        events.sort()
        area, prev_y = 0, events[0][0]
        for y, d, x1, x2 in events:
            area += length[1] * (y - prev_y)
            update(1, 0, m - 1, idx[x1], idx[x2] - 1, d)
            prev_y = y
        return area % MOD
`
  },
  {
    num: 2569, title: "Handling Sum Queries After Update", slug: "handling-sum-queries-after-update", lc: "Hard",
    topic: "advanced",
    pattern: "Lazy segment tree / range updates",
    level: 6,
    order: 290,
    core: false,
    teaches: "Lazy segment tree with a FLIP tag: flipping a range of bits turns its count of ones into length - ones.",
    learn: ["dsa_advanced", "dsa-ad-lazy"],
    pre: [699],
    hints: [
      "Type 2 needs sum(nums1) at that moment; type 3 just reads a running total. So the real work is type 1: flip bits on a range.",
      "Store ones[v] per node. Flipping a whole node: ones = length - ones, and toggle a lazy flip flag.",
      "Push the flag to the children before working on part of a node. The total for type 3 is sum(nums2) + sum of p * ones[root] over type-2 queries."
    ],
    steps: [
      "Build ones[v] over nums1.",
      "Type 1 [l, r]: flip the range (apply = ones = len - ones; flag ^= 1; push before partial recursion).",
      "Type 2 p: total += p * ones[1]. Type 3: append total.",
      "Return the list."
    ],
    time: "O((n + q) log n)", space: "O(n)",
    trap: "Two pending flips cancel: toggle the flag with XOR rather than setting it to True.",
    code: `class Solution:
    def handleQuery(self, nums1: List[int], nums2: List[int], queries: List[List[int]]) -> List[int]:
        n = len(nums1)
        ones = [0] * (4 * n)
        flip = [False] * (4 * n)
        def build(v, lo, hi):
            if lo == hi:
                ones[v] = nums1[lo]
                return
            mid = (lo + hi) // 2
            build(2 * v, lo, mid)
            build(2 * v + 1, mid + 1, hi)
            ones[v] = ones[2 * v] + ones[2 * v + 1]
        def apply(v, lo, hi):
            ones[v] = (hi - lo + 1) - ones[v]
            flip[v] = not flip[v]
        def update(v, lo, hi, a, b):
            if b < lo or hi < a:
                return
            if a <= lo and hi <= b:
                apply(v, lo, hi)
                return
            mid = (lo + hi) // 2
            if flip[v]:                       # push the pending flip down
                apply(2 * v, lo, mid)
                apply(2 * v + 1, mid + 1, hi)
                flip[v] = False
            update(2 * v, lo, mid, a, b)
            update(2 * v + 1, mid + 1, hi, a, b)
            ones[v] = ones[2 * v] + ones[2 * v + 1]
        build(1, 0, n - 1)
        total = sum(nums2)
        res = []
        for t, a, b in queries:
            if t == 1:
                update(1, 0, n - 1, a, b)
            elif t == 2:
                total += a * ones[1]
            else:
                res.append(total)
        return res
`
  }
);
