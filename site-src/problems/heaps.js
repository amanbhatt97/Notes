// problems/heaps.js — Heaps ladder
PROBLEMS.push(
  {
    num: 1046, title: "Last Stone Weight", slug: "last-stone-weight", lc: "Easy",
    topic: "heaps",
    pattern: "Repeatedly take the best (heap simulation)",
    level: 1,
    order: 10,
    core: true,
    teaches: "Python's heapq is a min-heap; push negatives to get a max-heap.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [],
    hints: ["Each turn you need the two heaviest stones. Which structure gives the max quickly, again and again?", "Put -stone into a heapq list. Pop twice, push back the difference (negated) if it is not zero."],
    steps: ["h = [-s for s in stones]; heapify(h).", "While len(h) > 1: a = -pop, b = -pop; if a != b push -(a - b).", "Return -h[0] if h else 0."],
    time: "O(n log n)", space: "O(n)",
    trap: "Re-sorting the list every turn works but costs O(n^2 log n).",
    code: `import heapq
class Solution:
    def lastStoneWeight(self, stones):
        h = [-s for s in stones]
        heapq.heapify(h)
        while len(h) > 1:
            a = -heapq.heappop(h)
            b = -heapq.heappop(h)
            if a != b:
                heapq.heappush(h, -(a - b))
        return -h[0] if h else 0`
  },
  {
    num: 2558, title: "Take Gifts From the Richest Pile", slug: "take-gifts-from-the-richest-pile", lc: "Easy",
    topic: "heaps",
    pattern: "Repeatedly take the best (heap simulation)",
    level: 1,
    order: 20,
    core: false,
    teaches: "Max-heap simulation: pop the largest, change it, push it back.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [1046],
    hints: ["Every second you need the richest pile. How do you get the max k times cheaply?", "Max-heap with negatives: pop, push back -isqrt(value)."],
    steps: ["h = [-g for g in gifts]; heapify.", "Repeat k times: x = -pop; push -isqrt(x).", "Return -sum(h)."],
    time: "O(n + k log n)", space: "O(n)",
    trap: "Use integer square root (math.isqrt); float sqrt can round wrongly for big numbers.",
    code: `import heapq, math
class Solution:
    def pickGifts(self, gifts, k):
        h = [-g for g in gifts]
        heapq.heapify(h)
        for _ in range(k):
            x = -heapq.heappop(h)
            heapq.heappush(h, -math.isqrt(x))
        return -sum(h)`
  },
  {
    num: 1962, title: "Remove Stones to Minimize the Total", slug: "remove-stones-to-minimize-the-total", lc: "Medium",
    topic: "heaps",
    pattern: "Repeatedly take the best (heap simulation)",
    level: 2,
    order: 30,
    core: false,
    teaches: "Greedy: always halve the current largest pile; a max-heap tracks it.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [2558],
    hints: ["Which pile gives the biggest reduction when you remove floor(x / 2)?", "The largest one, every time. Use a max-heap and repeat k times."],
    steps: ["h = [-p for p in piles]; heapify.", "k times: x = -pop; push -(x - x // 2).", "Return -sum(h)."],
    time: "O(n + k log n)", space: "O(n)",
    trap: "You remove floor(x/2), so the pile becomes x - x // 2 (the ceiling), not x // 2.",
    code: `import heapq
class Solution:
    def minStoneSum(self, piles, k):
        h = [-p for p in piles]
        heapq.heapify(h)
        for _ in range(k):
            x = -heapq.heappop(h)
            heapq.heappush(h, -(x - x // 2))
        return -sum(h)`
  },
  {
    num: 1337, title: "The K Weakest Rows in a Matrix", slug: "the-k-weakest-rows-in-a-matrix", lc: "Easy",
    topic: "heaps",
    pattern: "Top-k with a size-k heap",
    level: 2,
    order: 40,
    core: false,
    teaches: "Top-k smallest: keep a max-heap of size k, keyed by (count, row).",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [1046],
    hints: ["What key decides which row is weaker?", "(number of soldiers, row index). You want the k smallest keys.", "Keep a size-k max-heap (negate the key); pop when it grows past k. Sort what is left."],
    steps: ["For each row i: c = sum(row); push (-c, -i); if len > k pop.", "Return row indices sorted by (c, i)."],
    time: "O(m * n + m log k)", space: "O(k)",
    trap: "Ties go to the smaller row index, so the index must be part of the key.",
    code: `import heapq
class Solution:
    def kWeakestRows(self, mat, k):
        h = []
        for i, row in enumerate(mat):
            heapq.heappush(h, (-sum(row), -i))
            if len(h) > k:
                heapq.heappop(h)
        return [-i for c, i in sorted(h, reverse=True)]`
  },
  {
    num: 703, title: "Kth Largest Element in a Stream", slug: "kth-largest-element-in-a-stream", lc: "Easy",
    topic: "heaps",
    pattern: "Top-k with a size-k heap",
    level: 2,
    order: 50,
    core: true,
    teaches: "The kth largest is the top of a min-heap that holds only the k largest values.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [1046],
    hints: ["Which k values do you need to keep, and which one of them is the answer?", "Keep the k largest in a min-heap; its smallest (h[0]) is the kth largest.", "On add: push, then pop if size > k."],
    steps: ["__init__: push all nums, popping while len > k.", "add(val): push val; if len > k pop; return h[0]."],
    time: "O(log k) per add", space: "O(k)",
    trap: "A max-heap of everything makes each query O(k log n) and grows forever.",
    code: `import heapq
class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.h = []
        for x in nums:
            self.add(x)

    def add(self, val):
        heapq.heappush(self.h, val)
        if len(self.h) > self.k:
            heapq.heappop(self.h)
        return self.h[0]`
  },
  {
    num: 215, title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", lc: "Medium",
    topic: "heaps",
    pattern: "Top-k with a size-k heap",
    level: 2,
    order: 60,
    core: true,
    teaches: "Min-heap of size k over the array: the survivor at the top is the kth largest.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [703],
    hints: ["You do not need the array sorted. How many elements must you remember?", "Only the k largest so far. Push each; pop when the heap exceeds k."],
    steps: ["h = [].", "For x in nums: push x; if len(h) > k: pop.", "Return h[0]."],
    time: "O(n log k)", space: "O(k)",
    trap: "Duplicates count separately: kth largest of [3,3,2] with k = 2 is 3.",
    code: `import heapq
class Solution:
    def findKthLargest(self, nums, k):
        h = []
        for x in nums:
            heapq.heappush(h, x)
            if len(h) > k:
                heapq.heappop(h)
        return h[0]`
  },
  {
    num: 973, title: "K Closest Points to Origin", slug: "k-closest-points-to-origin", lc: "Medium",
    topic: "heaps",
    pattern: "Top-k with a size-k heap",
    level: 2,
    order: 70,
    core: true,
    teaches: "Top-k smallest by a computed key: max-heap of size k on -distance.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [215],
    hints: ["You want the k smallest distances. Which heap type evicts the worst of the k?", "A max-heap (push -dist). Squared distance is enough; no square root needed."],
    steps: ["For each point: push (-(x*x + y*y), x, y); if len > k pop.", "Return the points left in the heap."],
    time: "O(n log k)", space: "O(k)",
    trap: "Using a min-heap of all points and popping k is fine too (O(n + k log n)), but a size-k min-heap keeps the wrong end.",
    code: `import heapq
class Solution:
    def kClosest(self, points, k):
        h = []
        for x, y in points:
            heapq.heappush(h, (-(x * x + y * y), x, y))
            if len(h) > k:
                heapq.heappop(h)
        return [[x, y] for _, x, y in h]`
  },
  {
    num: 2099, title: "Find Subsequence of Length K With the Largest Sum", slug: "find-subsequence-of-length-k-with-the-largest-sum", lc: "Easy",
    topic: "heaps",
    pattern: "Top-k with a size-k heap",
    level: 2,
    order: 80,
    core: false,
    teaches: "Pick the k largest with a heap of (value, index), then restore the original order by index.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [215],
    hints: ["A subsequence keeps the original order. Which k values give the largest sum?", "The k largest. Keep (value, index) in a size-k min-heap.", "Sort the survivors by index to output them in order."],
    steps: ["h = []; for i, v: push (v, i); if len > k pop.", "Sort h by index; return the values."],
    time: "O(n log k)", space: "O(k)",
    trap: "Returning the k largest in sorted-by-value order breaks the subsequence order.",
    code: `import heapq
class Solution:
    def maxSubsequence(self, nums, k):
        h = []
        for i, v in enumerate(nums):
            heapq.heappush(h, (v, i))
            if len(h) > k:
                heapq.heappop(h)
        return [v for v, i in sorted(h, key=lambda t: t[1])]`
  },
  {
    num: 23, title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", lc: "Hard",
    topic: "heaps",
    pattern: "K-way merge / generate in order",
    level: 2,
    order: 90,
    core: true,
    teaches: "Keep one 'current head' per list in a min-heap; pop the smallest, push its successor.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [21],
    hints: ["At any moment, which nodes could be the next smallest overall?", "Only the current heads of the k lists. Keep them in a min-heap.", "Push (val, i, node): the index i breaks ties so Python never compares two nodes."],
    steps: ["h = [(node.val, i, node) for each non-empty list]; heapify.", "dummy tail; while h: val, i, node = pop; tail.next = node; tail = node; if node.next push it.", "Return dummy.next."],
    time: "O(N log k)", space: "O(k)",
    trap: "Pushing (val, node) crashes on equal values because ListNode has no < operator.",
    code: `import heapq
class Solution:
    def mergeKLists(self, lists):
        h = [(node.val, i, node) for i, node in enumerate(lists) if node]
        heapq.heapify(h)
        dummy = tail = ListNode()
        while h:
            val, i, node = heapq.heappop(h)
            tail.next = node
            tail = node
            if node.next:
                heapq.heappush(h, (node.next.val, i, node.next))
        return dummy.next`
  },
  {
    num: 2336, title: "Smallest Number in Infinite Set", slug: "smallest-number-in-infinite-set", lc: "Medium",
    topic: "heaps",
    pattern: "Heap + lazy deletion (design)",
    level: 2,
    order: 100,
    core: false,
    teaches: "A counter for 'everything from here up' plus a small heap (and set) of numbers added back.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [1046],
    hints: ["The set is infinite. What simple variable describes most of it?", "cur = the smallest number never popped; everything >= cur is present.", "Numbers below cur that are added back go into a min-heap with a set to avoid duplicates."],
    steps: ["cur = 1; h = []; inh = set().", "popSmallest: if h: x = pop, remove from set, return x; else cur += 1, return cur - 1.", "addBack(x): if x < cur and x not in inh: push and add to set."],
    time: "O(log n) per call", space: "O(n)",
    trap: "Adding back a number >= cur (still present) or adding it twice creates duplicates.",
    code: `import heapq
class SmallestInfiniteSet:
    def __init__(self):
        self.cur = 1
        self.h = []
        self.inh = set()

    def popSmallest(self):
        if self.h:
            x = heapq.heappop(self.h)
            self.inh.discard(x)
            return x
        self.cur += 1
        return self.cur - 1

    def addBack(self, num):
        if num < self.cur and num not in self.inh:
            self.inh.add(num)
            heapq.heappush(self.h, num)`
  },
  {
    num: 2593, title: "Find Score of an Array After Marking All Elements", slug: "find-score-of-an-array-after-marking-all-elements", lc: "Medium",
    topic: "heaps",
    pattern: "Repeatedly take the best (heap simulation)",
    level: 3,
    order: 110,
    core: false,
    teaches: "Heap of (value, index) gives the smallest-then-leftmost element; a marked array lets you skip stale entries.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [1046],
    hints: ["You need the smallest unmarked value, ties broken by index. What tuple should go into the heap?", "Push (value, index) for all elements; tuples compare by value then index.", "Pop; if that index is already marked, skip it. Otherwise add the value and mark index-1, index, index+1."],
    steps: ["h = [(v, i) for i, v in enumerate(nums)]; heapify; marked = [False] * (n + 2).", "While h: v, i = pop; if marked[i] continue; score += v; mark i - 1, i, i + 1.", "Return score."],
    time: "O(n log n)", space: "O(n)",
    trap: "Removing neighbours from the heap directly is expensive; mark them and skip them when popped (lazy deletion).",
    code: `import heapq
class Solution:
    def findScore(self, nums):
        n = len(nums)
        h = [(v, i) for i, v in enumerate(nums)]
        heapq.heapify(h)
        marked = [False] * (n + 1)
        score = 0
        while h:
            v, i = heapq.heappop(h)
            if marked[i]:
                continue
            score += v
            marked[i] = marked[i + 1] = True
            if i > 0:
                marked[i - 1] = True
        return score`
  },
  {
    num: 767, title: "Reorganize String", slug: "reorganize-string", lc: "Medium",
    topic: "heaps",
    pattern: "Repeatedly take the best (heap simulation)",
    level: 3,
    order: 120,
    core: true,
    teaches: "Place the most frequent remaining letter each time, but hold back the one you just used.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [1046, 347],
    hints: ["Greedy: which letter is the most dangerous to leave for later?", "The most frequent one. Use a max-heap of (count, letter), but you cannot use the same letter twice in a row.", "Pop the top, append it, then push back the letter held from the previous step; hold the current one."],
    steps: ["h = [(-count, ch)] for each letter; heapify; prev = None.", "While h: c, ch = pop; append ch; if prev and prev count < 0: push prev; prev = (c + 1, ch).", "If the result length != len(s) return ''; else return it."],
    time: "O(n log A)", space: "O(A)",
    trap: "If any letter appears more than (n + 1) // 2 times there is no answer; the loop must detect it rather than loop forever.",
    code: `import heapq
from collections import Counter
class Solution:
    def reorganizeString(self, s):
        h = [(-c, ch) for ch, c in Counter(s).items()]
        heapq.heapify(h)
        res, prev = [], None
        while h:
            c, ch = heapq.heappop(h)
            res.append(ch)
            if prev and prev[0] < 0:
                heapq.heappush(h, prev)
            prev = (c + 1, ch)
        return "".join(res) if len(res) == len(s) else ""`
  },
  {
    num: 347, title: "Top K Frequent Elements", slug: "top-k-frequent-elements", lc: "Medium",
    topic: "heaps",
    pattern: "Top-k with a size-k heap",
    level: 3,
    order: 130,
    core: true,
    teaches: "Count first, then run top-k on the (frequency, value) pairs.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [215],
    hints: ["Top k of what? First turn the array into frequencies.", "Counter(nums), then keep a size-k min-heap keyed by frequency.", "Bucket sort by frequency gives O(n) as an alternative."],
    steps: ["cnt = Counter(nums).", "For (v, c) in cnt: push (c, v); if len > k pop.", "Return the values in the heap."],
    time: "O(n log k)", space: "O(n)",
    trap: "Sorting all distinct values by count is O(n log n); fine in practice, but the follow-up asks for better.",
    code: `import heapq
from collections import Counter
class Solution:
    def topKFrequent(self, nums, k):
        h = []
        for v, c in Counter(nums).items():
            heapq.heappush(h, (c, v))
            if len(h) > k:
                heapq.heappop(h)
        return [v for c, v in h]`
  },
  {
    num: 692, title: "Top K Frequent Words", slug: "top-k-frequent-words", lc: "Medium",
    topic: "heaps",
    pattern: "Top-k with a size-k heap",
    level: 3,
    order: 140,
    core: false,
    teaches: "Order by (-count, word) and take k: heapify all pairs, then pop k.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [347],
    hints: ["Ties must be broken alphabetically. Which key makes a min-heap pop the right word first?", "(-count, word): higher count first, then smaller word.", "Heapify all pairs in O(n), then pop k times."],
    steps: ["cnt = Counter(words).", "h = [(-c, w) for w, c in cnt.items()]; heapify(h).", "Return [heappop(h)[1] for _ in range(k)]."],
    time: "O(n + k log n)", space: "O(n)",
    trap: "A size-k min-heap needs a reversed string order for ties, which Python tuples cannot express directly.",
    code: `import heapq
from collections import Counter
class Solution:
    def topKFrequent(self, words, k):
        h = [(-c, w) for w, c in Counter(words).items()]
        heapq.heapify(h)
        return [heapq.heappop(h)[1] for _ in range(k)]`
  },
  {
    num: 264, title: "Ugly Number II", slug: "ugly-number-ii", lc: "Medium",
    topic: "heaps",
    pattern: "K-way merge / generate in order",
    level: 3,
    order: 150,
    core: false,
    teaches: "Generate numbers in increasing order with a heap: pop the smallest, push it times 2, 3 and 5.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [1046],
    hints: ["Every ugly number is a smaller ugly number times 2, 3 or 5. How do you produce them in order?", "Start the heap with 1. Each pop is the next ugly number; push x*2, x*3, x*5.", "Use a seen set so duplicates like 6 = 2*3 = 3*2 are pushed once."],
    steps: ["h = [1], seen = {1}.", "Repeat n times: x = pop; for f in (2, 3, 5): if x*f not in seen add and push.", "Return the last x."],
    time: "O(n log n)", space: "O(n)",
    trap: "Without the seen set the heap fills with duplicates and you return the wrong nth value. (A 3-pointer DP does it in O(n).)",
    code: `import heapq
class Solution:
    def nthUglyNumber(self, n):
        h, seen = [1], {1}
        for _ in range(n):
            x = heapq.heappop(h)
            for f in (2, 3, 5):
                if x * f not in seen:
                    seen.add(x * f)
                    heapq.heappush(h, x * f)
        return x`
  },
  {
    num: 378, title: "Kth Smallest Element in a Sorted Matrix", slug: "kth-smallest-element-in-a-sorted-matrix", lc: "Medium",
    topic: "heaps",
    pattern: "K-way merge / generate in order",
    level: 3,
    order: 160,
    core: false,
    teaches: "Each row is a sorted list: k-way merge the rows and stop at the kth pop.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [23],
    hints: ["Treat the matrix as n sorted lists. What is the merge of sorted lists?", "Push the first element of each row as (value, row, col).", "Pop k - 1 times, each time pushing the next element of that row; the top is the answer."],
    steps: ["h = [(matrix[r][0], r, 0) for r in range(min(n, k))]; heapify.", "Repeat k - 1 times: v, r, c = pop; if c + 1 < n push (matrix[r][c+1], r, c + 1).", "Return h[0][0]."],
    time: "O(k log min(n, k))", space: "O(min(n, k))",
    trap: "Flattening and sorting is O(n^2 log n) and ignores the sorted structure. Binary search on the value also works in O(n log(max - min)).",
    code: `import heapq
class Solution:
    def kthSmallest(self, matrix, k):
        n = len(matrix)
        h = [(matrix[r][0], r, 0) for r in range(min(n, k))]
        heapq.heapify(h)
        for _ in range(k - 1):
            v, r, c = heapq.heappop(h)
            if c + 1 < n:
                heapq.heappush(h, (matrix[r][c + 1], r, c + 1))
        return h[0][0]`
  },
  {
    num: 355, title: "Design Twitter", slug: "design-twitter", lc: "Medium",
    topic: "heaps",
    pattern: "Heap + lazy deletion (design)",
    level: 3,
    order: 170,
    core: true,
    teaches: "News feed = k-way merge of each followed user's tweet list (newest first), stopping at 10.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [23],
    hints: ["Each user's tweets are already in time order. What does merging several sorted lists remind you of?", "Give every tweet a global increasing timestamp. Keep each user's tweets in a list.", "For the feed, push the newest tweet of each followee (and self) into a heap and pop up to 10 times, pushing the next older one."],
    steps: ["post: tweets[u].append((time, id)); time += 1.", "follow/unfollow: maintain a set per user (never unfollow yourself).", "getNewsFeed: heap of (-time, id, user, index) from each source's last tweet; pop 10, pushing index - 1."],
    time: "O(F + 10 log F) per feed", space: "O(users + tweets)",
    trap: "Collecting and sorting all tweets of all followees each time is slow for heavy users.",
    code: `import heapq
from collections import defaultdict
class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)
        self.follows = defaultdict(set)

    def postTweet(self, userId, tweetId):
        self.tweets[userId].append((self.time, tweetId))
        self.time += 1

    def getNewsFeed(self, userId):
        h = []
        for u in self.follows[userId] | {userId}:
            if self.tweets[u]:
                i = len(self.tweets[u]) - 1
                t, tid = self.tweets[u][i]
                h.append((-t, tid, u, i))
        heapq.heapify(h)
        res = []
        while h and len(res) < 10:
            t, tid, u, i = heapq.heappop(h)
            res.append(tid)
            if i > 0:
                t2, tid2 = self.tweets[u][i - 1]
                heapq.heappush(h, (-t2, tid2, u, i - 1))
        return res

    def follow(self, followerId, followeeId):
        if followerId != followeeId:
            self.follows[followerId].add(followeeId)

    def unfollow(self, followerId, followeeId):
        self.follows[followerId].discard(followeeId)`
  },
  {
    num: 1642, title: "Furthest Building You Can Reach", slug: "furthest-building-you-can-reach", lc: "Medium",
    topic: "heaps",
    pattern: "Greedy + heap (best affordable / regret)",
    level: 3,
    order: 180,
    core: true,
    teaches: "Give ladders to the biggest climbs: keep climbs in a min-heap of size 'ladders' and pay bricks for the smallest extra.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [215],
    hints: ["Ladders are worth most on the tallest climbs. But you do not know the future climbs yet.", "Tentatively use a ladder for every climb, keeping those climbs in a min-heap.", "When you have more climbs than ladders, pop the smallest and pay for it with bricks. If bricks go negative, stop."],
    steps: ["h = [].", "For i in range(n - 1): d = heights[i+1] - heights[i]; if d <= 0 continue.", "push d; if len(h) > ladders: bricks -= pop. If bricks < 0 return i.", "Return n - 1."],
    time: "O(n log L)", space: "O(L)",
    trap: "Spending bricks first and ladders later fails: a large climb late in the walk may have no ladder left.",
    code: `import heapq
class Solution:
    def furthestBuilding(self, heights, bricks, ladders):
        h = []
        for i in range(len(heights) - 1):
            d = heights[i + 1] - heights[i]
            if d <= 0:
                continue
            heapq.heappush(h, d)
            if len(h) > ladders:
                bricks -= heapq.heappop(h)
                if bricks < 0:
                    return i
        return len(heights) - 1`
  },
  {
    num: 1353, title: "Maximum Number of Events That Can Be Attended", slug: "maximum-number-of-events-that-can-be-attended", lc: "Medium",
    topic: "heaps",
    pattern: "Event simulation (sort by time + heaps)",
    level: 3,
    order: 190,
    core: false,
    teaches: "Sweep days; a min-heap of end days of open events tells you which one to attend (the one ending soonest).",
    learn: ["dsa_heaps", "dsa-hp-problems"],
    pre: [1642],
    hints: ["On a given day several events may be open. Which one should you attend?", "The one that ends first; others can wait.", "Sort by start. For each day, push ends of events starting today, drop expired ones, and attend the top."],
    steps: ["Sort events; i = 0; day = 0; h = [].", "While i < n or h: if h empty jump day to events[i] start.", "Push ends of events with start == day (i advances); pop ends < day.", "If h: pop one, count += 1. day += 1."],
    time: "O(n log n)", space: "O(n)",
    trap: "Looping over every day up to 1e5 without jumping still passes, but forgetting to drop expired events counts invalid attendance.",
    code: `import heapq
class Solution:
    def maxEvents(self, events):
        events.sort()
        h, i, n, day, count = [], 0, len(events), 0, 0
        while i < n or h:
            if not h:
                day = max(day, events[i][0])
            while i < n and events[i][0] <= day:
                heapq.heappush(h, events[i][1])
                i += 1
            while h and h[0] < day:
                heapq.heappop(h)
            if h:
                heapq.heappop(h)
                count += 1
            day += 1
        return count`
  },
  {
    num: 621, title: "Task Scheduler", slug: "task-scheduler", lc: "Medium",
    topic: "heaps",
    pattern: "Repeatedly take the best (heap simulation)",
    level: 4,
    order: 200,
    core: true,
    teaches: "Max-heap of remaining counts plus a cooldown queue simulates the CPU; the most frequent task decides the length.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [767],
    hints: ["At each time unit, which available task should you run?", "The one with the most copies left. Keep a max-heap of counts.", "After running a task, park it in a queue with the time it becomes available again (t + n + 1 - 1); move it back to the heap when that time comes."],
    steps: ["h = max-heap of counts; q = deque(); t = 0.", "While h or q: t += 1; if h: c = pop - 1 (as negative +1); if c remains push (c, t + n) to q.", "If q and q[0] time == t: push its count back to the heap.", "Return t."],
    time: "O(T log 26) where T is the answer", space: "O(26)",
    trap: "The closed form (maxCount - 1) * (n + 1) + numberOfMax, then max with len(tasks), is O(n); forgetting the max with len(tasks) is the classic bug.",
    code: `import heapq
from collections import Counter, deque
class Solution:
    def leastInterval(self, tasks, n):
        h = [-c for c in Counter(tasks).values()]
        heapq.heapify(h)
        q = deque()  # (negative count left, time it is ready again)
        t = 0
        while h or q:
            t += 1
            if h:
                c = heapq.heappop(h) + 1
                if c:
                    q.append((c, t + n))
            if q and q[0][1] == t:
                heapq.heappush(h, q.popleft()[0])
        return t`
  },
  {
    num: 1405, title: "Longest Happy String", slug: "longest-happy-string", lc: "Medium",
    topic: "heaps",
    pattern: "Repeatedly take the best (heap simulation)",
    level: 4,
    order: 210,
    core: false,
    teaches: "Take the letter with most remaining unless it would make three in a row; then take the runner-up.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [767],
    hints: ["Greedy by count again. When are you not allowed to use the top letter?", "When the last two characters of the answer are already that letter.", "Then use the second letter in the heap once (if there is none, stop), and push both back."],
    steps: ["h = max-heap of (-count, ch) for counts > 0.", "Loop: pop top. If the last two chars equal top: if heap empty stop; pop second, use it, push second back if left, push top back.", "Else use top and push it back if count left.", "Return the string."],
    time: "O((a + b + c) log 3)", space: "O(1)",
    trap: "Pushing back a letter with count 0 lets it be used again.",
    code: `import heapq
class Solution:
    def longestDiverseString(self, a, b, c):
        h = [(-cnt, ch) for cnt, ch in ((a, 'a'), (b, 'b'), (c, 'c')) if cnt]
        heapq.heapify(h)
        res = []
        while h:
            cnt, ch = heapq.heappop(h)
            if len(res) >= 2 and res[-1] == res[-2] == ch:
                if not h:
                    break
                cnt2, ch2 = heapq.heappop(h)
                res.append(ch2)
                if cnt2 + 1:
                    heapq.heappush(h, (cnt2 + 1, ch2))
                heapq.heappush(h, (cnt, ch))
            else:
                res.append(ch)
                if cnt + 1:
                    heapq.heappush(h, (cnt + 1, ch))
        return "".join(res)`
  },
  {
    num: 373, title: "Find K Pairs with Smallest Sums", slug: "find-k-pairs-with-smallest-sums", lc: "Medium",
    topic: "heaps",
    pattern: "K-way merge / generate in order",
    level: 4,
    order: 220,
    core: false,
    teaches: "Pairs (i, j) form n sorted lists (fix i, vary j); merge them lazily with a heap.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [378],
    hints: ["For a fixed i, the sums nums1[i] + nums2[j] are sorted by j. What does that make the problem?", "A k-way merge: start each list i at j = 0.", "Pop the smallest (sum, i, j), record the pair, push (i, j + 1). Stop after k pairs."],
    steps: ["h = [(nums1[i] + nums2[0], i, 0) for i in range(min(k, len(nums1)))]; heapify.", "While h and len(res) < k: s, i, j = pop; res.append([nums1[i], nums2[j]]); if j + 1 < len(nums2) push (nums1[i] + nums2[j+1], i, j + 1).", "Return res."],
    time: "O(k log k)", space: "O(k)",
    trap: "Generating all len1 * len2 pairs times out; push neighbours only when needed.",
    code: `import heapq
class Solution:
    def kSmallestPairs(self, nums1, nums2, k):
        h = [(nums1[i] + nums2[0], i, 0) for i in range(min(k, len(nums1)))]
        heapq.heapify(h)
        res = []
        while h and len(res) < k:
            s, i, j = heapq.heappop(h)
            res.append([nums1[i], nums2[j]])
            if j + 1 < len(nums2):
                heapq.heappush(h, (nums1[i] + nums2[j + 1], i, j + 1))
        return res`
  },
  {
    num: 2353, title: "Design a Food Rating System", slug: "design-a-food-rating-system", lc: "Medium",
    topic: "heaps",
    pattern: "Heap + lazy deletion (design)",
    level: 4,
    order: 230,
    core: false,
    teaches: "Lazy deletion: push a new entry on every update and discard heap tops that no longer match the current rating.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [2336],
    hints: ["You cannot change a value inside a heapq list cheaply. What can you do instead?", "Push a fresh (-rating, name) on each change. Old entries stay in the heap.", "When reading the top, pop while its rating differs from the food's current rating."],
    steps: ["Maps: food -> cuisine, food -> rating, cuisine -> heap of (-rating, name).", "changeRating: update map; push (-new, food) into its cuisine heap.", "highestRated: while top rating != current rating of that food: pop. Return top name."],
    time: "O(log n) amortized", space: "O(n + updates)",
    trap: "Tuples (-rating, name) already break ties by the smaller name, which the problem asks for.",
    code: `import heapq
from collections import defaultdict
class FoodRatings:
    def __init__(self, foods, cuisines, ratings):
        self.cuisine = {}
        self.rating = {}
        self.heaps = defaultdict(list)
        for f, c, r in zip(foods, cuisines, ratings):
            self.cuisine[f] = c
            self.rating[f] = r
            heapq.heappush(self.heaps[c], (-r, f))

    def changeRating(self, food, newRating):
        self.rating[food] = newRating
        heapq.heappush(self.heaps[self.cuisine[food]], (-newRating, food))

    def highestRated(self, cuisine):
        h = self.heaps[cuisine]
        while -h[0][0] != self.rating[h[0][1]]:
            heapq.heappop(h)
        return h[0][1]`
  },
  {
    num: 2034, title: "Stock Price Fluctuation", slug: "stock-price-fluctuation", lc: "Medium",
    topic: "heaps",
    pattern: "Heap + lazy deletion (design)",
    level: 4,
    order: 240,
    core: false,
    teaches: "Keep the true prices in a dict and two heaps of (price, time); drop stale tops lazily.",
    learn: ["dsa_heaps", "dsa-hp-heapq"],
    pre: [2353],
    hints: ["Prices at old timestamps can be corrected. How do you keep max and min valid after a correction?", "Store timestamp -> price in a dict. Push every update into a max-heap and a min-heap.", "When reading max or min, pop entries whose price no longer matches the dict."],
    steps: ["update: prices[t] = p; latest = max(latest, t); push (-p, t) and (p, t).", "current: prices[latest].", "maximum/minimum: pop while prices[t] != heap price; return the top."],
    time: "O(log n) amortized", space: "O(updates)",
    trap: "Deleting the old entry from the heap with list.remove is O(n); lazy deletion avoids it.",
    code: `import heapq
class StockPrice:
    def __init__(self):
        self.prices = {}
        self.latest = 0
        self.mx = []
        self.mn = []

    def update(self, timestamp, price):
        self.prices[timestamp] = price
        self.latest = max(self.latest, timestamp)
        heapq.heappush(self.mx, (-price, timestamp))
        heapq.heappush(self.mn, (price, timestamp))

    def current(self):
        return self.prices[self.latest]

    def maximum(self):
        while self.prices[self.mx[0][1]] != -self.mx[0][0]:
            heapq.heappop(self.mx)
        return -self.mx[0][0]

    def minimum(self):
        while self.prices[self.mn[0][1]] != self.mn[0][0]:
            heapq.heappop(self.mn)
        return self.mn[0][0]`
  },
  {
    num: 502, title: "IPO", slug: "ipo", lc: "Hard",
    topic: "heaps",
    pattern: "Greedy + heap (best affordable / regret)",
    level: 4,
    order: 250,
    core: true,
    teaches: "Sort projects by capital; as capital grows, push newly affordable profits into a max-heap and take the best.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [1642],
    hints: ["Of the projects you can afford now, which one should you do?", "The most profitable. But finishing it may unlock more projects.", "Sort by capital; with a pointer, push every affordable profit into a max-heap; pop the best each round."],
    steps: ["projects = sorted(zip(capital, profits)); i = 0; h = [].", "Repeat k times: while i < n and projects[i][0] <= w: push -profit; i += 1.", "If h is empty break; w += -pop.", "Return w."],
    time: "O(n log n + k log n)", space: "O(n)",
    trap: "Re-scanning all projects each round is O(n*k).",
    code: `import heapq
class Solution:
    def findMaximizedCapital(self, k, w, profits, capital):
        projects = sorted(zip(capital, profits))
        h, i = [], 0
        for _ in range(k):
            while i < len(projects) and projects[i][0] <= w:
                heapq.heappush(h, -projects[i][1])
                i += 1
            if not h:
                break
            w -= heapq.heappop(h)
        return w`
  },
  {
    num: 1834, title: "Single-Threaded CPU", slug: "single-threaded-cpu", lc: "Medium",
    topic: "heaps",
    pattern: "Event simulation (sort by time + heaps)",
    level: 4,
    order: 260,
    core: false,
    teaches: "Sort tasks by arrival, keep the available ones in a heap by (processing time, index), and jump the clock when idle.",
    learn: ["dsa_heaps", "dsa-hp-problems"],
    pre: [1353],
    hints: ["When the CPU is free, which tasks can it choose from, and which does it pick?", "All tasks with enqueueTime <= now; pick smallest processing time, then smallest index.", "If nothing is available, jump time to the next arrival."],
    steps: ["order = indices sorted by enqueue time; t = 0; i = 0; h = [].", "While len(res) < n: if h empty and t < next arrival: t = next arrival.", "Push all arrived (proc, idx). Pop one; t += proc; append idx."],
    time: "O(n log n)", space: "O(n)",
    trap: "Advancing time one unit at a time when idle is far too slow (times go up to 1e9).",
    code: `import heapq
class Solution:
    def getOrder(self, tasks):
        n = len(tasks)
        order = sorted(range(n), key=lambda i: tasks[i][0])
        h, res, t, i = [], [], 0, 0
        while len(res) < n:
            if not h and t < tasks[order[i]][0]:
                t = tasks[order[i]][0]
            while i < n and tasks[order[i]][0] <= t:
                j = order[i]
                heapq.heappush(h, (tasks[j][1], j))
                i += 1
            p, j = heapq.heappop(h)
            t += p
            res.append(j)
        return res`
  },
  {
    num: 1882, title: "Process Tasks Using Servers", slug: "process-tasks-using-servers", lc: "Medium",
    topic: "heaps",
    pattern: "Event simulation (sort by time + heaps)",
    level: 4,
    order: 270,
    core: false,
    teaches: "Two heaps: free servers by (weight, index) and busy servers by (free time, weight, index).",
    learn: ["dsa_heaps", "dsa-hp-problems"],
    pre: [1834],
    hints: ["Two groups of servers change over time. What does each group need to be ordered by?", "Free servers: smallest weight, then index. Busy servers: earliest time they become free.", "For task j at time max(t, j): release finished servers; if none free, jump to the earliest finish time."],
    steps: ["free = heap of (w, i); busy = []; t = 0.", "For task j: t = max(t, j); if free empty: t = max(t, busy[0][0]).", "Move every busy server with free time <= t back to free.", "w, i = pop free; push (t + task, w, i) to busy; ans[j] = i."],
    time: "O((n + m) log n)", space: "O(n + m)",
    trap: "When jumping to the earliest finish, several servers may free up at that same time; release them all before choosing.",
    code: `import heapq
class Solution:
    def assignTasks(self, servers, tasks):
        free = [(w, i) for i, w in enumerate(servers)]
        heapq.heapify(free)
        busy, res, t = [], [], 0
        for j, d in enumerate(tasks):
            t = max(t, j)
            if not free:
                t = max(t, busy[0][0])
            while busy and busy[0][0] <= t:
                _, w, i = heapq.heappop(busy)
                heapq.heappush(free, (w, i))
            w, i = heapq.heappop(free)
            heapq.heappush(busy, (t + d, w, i))
            res.append(i)
        return res`
  },
  {
    num: 2462, title: "Total Cost to Hire K Workers", slug: "total-cost-to-hire-k-workers", lc: "Medium",
    topic: "heaps",
    pattern: "Two heaps",
    level: 4,
    order: 280,
    core: false,
    teaches: "Two min-heaps for the first and last candidates; take the cheaper top and refill that side from the middle.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [215],
    hints: ["Each round you choose among the first c and last c remaining workers. What structure gives the cheapest of each group?", "A min-heap for the left group and one for the right, with pointers i and j to the next unused workers.", "Take the smaller top (left wins ties: smaller index). Refill that side only while i <= j."],
    steps: ["i = 0, j = n - 1. Fill left with up to c costs from the front (i moves right) and right with up to c from the back (j moves left), never letting i pass j.", "k times: if right empty or (left and left[0] <= right[0]): take left, refill from i; else take right, refill from j.", "Return the total."],
    time: "O((k + c) log c)", space: "O(c)",
    trap: "When the two groups overlap (2c >= n), a worker must not be put in both heaps.",
    code: `import heapq
class Solution:
    def totalCost(self, costs, k, candidates):
        n = len(costs)
        i, j = 0, n - 1
        left, right = [], []
        while i <= j and len(left) < candidates:
            heapq.heappush(left, costs[i]); i += 1
        while i <= j and len(right) < candidates:
            heapq.heappush(right, costs[j]); j -= 1
        total = 0
        for _ in range(k):
            if not right or (left and left[0] <= right[0]):
                total += heapq.heappop(left)
                if i <= j:
                    heapq.heappush(left, costs[i]); i += 1
            else:
                total += heapq.heappop(right)
                if i <= j:
                    heapq.heappush(right, costs[j]); j -= 1
        return total`
  },
  {
    num: 786, title: "K-th Smallest Prime Fraction", slug: "k-th-smallest-prime-fraction", lc: "Medium",
    topic: "heaps",
    pattern: "K-way merge / generate in order",
    level: 5,
    order: 290,
    core: false,
    teaches: "For each denominator the fractions arr[i]/arr[j] grow with i: k-way merge those lists.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [373],
    hints: ["Fix the denominator arr[j]. In which order do arr[0]/arr[j], arr[1]/arr[j], ... come?", "Increasing, because arr is sorted. That is one sorted list per j.", "Start every list at i = 0; pop k - 1 times, each time pushing (i + 1, j) if i + 1 < j."],
    steps: ["h = [(arr[0] / arr[j], 0, j) for j in 1..n-1]; heapify.", "Repeat k - 1 times: _, i, j = pop; if i + 1 < j push (arr[i+1] / arr[j], i + 1, j).", "Return [arr[i], arr[j]] of the top."],
    time: "O(n + k log n)", space: "O(n)",
    trap: "Binary search on the fraction value is the O(n log W) alternative; the heap is simpler to get right.",
    code: `import heapq
class Solution:
    def kthSmallestPrimeFraction(self, arr, k):
        n = len(arr)
        h = [(arr[0] / arr[j], 0, j) for j in range(1, n)]
        heapq.heapify(h)
        for _ in range(k - 1):
            _, i, j = heapq.heappop(h)
            if i + 1 < j:
                heapq.heappush(h, (arr[i + 1] / arr[j], i + 1, j))
        _, i, j = h[0]
        return [arr[i], arr[j]]`
  },
  {
    num: 632, title: "Smallest Range Covering Elements from K Lists", slug: "smallest-range-covering-elements-from-k-lists", lc: "Hard",
    topic: "heaps",
    pattern: "K-way merge / generate in order",
    level: 5,
    order: 300,
    core: false,
    teaches: "Hold one element per list in a min-heap and track the current max: [heap min, max] is always a valid range.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [23],
    hints: ["A range covers all lists if it contains one element from each. How can you keep exactly one pointer per list?", "Min-heap of the current element of each list, plus a variable for the current maximum.", "Pop the min; try [min, max]; advance that list and push its next value (update max). Stop when any list runs out."],
    steps: ["h = [(lst[0], i, 0)]; hi = max of firsts; best = [-inf, inf].", "Loop: lo, i, j = pop; if hi - lo < best width: best = [lo, hi].", "If j + 1 == len(nums[i]) break; push nums[i][j+1]; hi = max(hi, it)."],
    time: "O(N log k)", space: "O(k)",
    trap: "Stopping when the heap empties is wrong: once one list is exhausted, no further range can cover it.",
    code: `import heapq
class Solution:
    def smallestRange(self, nums):
        h = [(lst[0], i, 0) for i, lst in enumerate(nums)]
        heapq.heapify(h)
        hi = max(lst[0] for lst in nums)
        best = [float('-inf'), float('inf')]
        while True:
            lo, i, j = heapq.heappop(h)
            if hi - lo < best[1] - best[0]:
                best = [lo, hi]
            if j + 1 == len(nums[i]):
                return best
            nxt = nums[i][j + 1]
            hi = max(hi, nxt)
            heapq.heappush(h, (nxt, i, j + 1))`
  },
  {
    num: 871, title: "Minimum Number of Refueling Stops", slug: "minimum-number-of-refueling-stops", lc: "Hard",
    topic: "heaps",
    pattern: "Greedy + heap (best affordable / regret)",
    level: 5,
    order: 310,
    core: false,
    teaches: "Drive as far as you can; only when stuck, retroactively refuel at the biggest station you passed.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [1642],
    hints: ["You never need to decide at a station. You can decide later which past stations you 'did' stop at.", "Keep a max-heap of fuel amounts of stations already passed.", "Whenever the next station (or target) is out of reach, pop the largest fuel and count a stop. If the heap is empty, return -1."],
    steps: ["fuel = startFuel; h = []; stops = 0.", "For each station (pos, gas) plus (target, 0): while fuel < pos: if h empty return -1; fuel += -pop; stops += 1.", "push -gas.", "Return stops."],
    time: "O(n log n)", space: "O(n)",
    trap: "Greedy 'refuel at every station' or 'refuel when low' is wrong; the deferred max choice is what makes it optimal.",
    code: `import heapq
class Solution:
    def minRefuelStops(self, target, startFuel, stations):
        fuel, stops, h = startFuel, 0, []
        for pos, gas in stations + [[target, 0]]:
            while fuel < pos:
                if not h:
                    return -1
                fuel -= heapq.heappop(h)
                stops += 1
            heapq.heappush(h, -gas)
        return stops`
  },
  {
    num: 630, title: "Course Schedule III", slug: "course-schedule-iii", lc: "Hard",
    topic: "heaps",
    pattern: "Greedy + heap (best affordable / regret)",
    level: 5,
    order: 320,
    core: false,
    teaches: "Process courses by deadline; if time overflows, drop the longest course taken so far (max-heap).",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [1642],
    hints: ["In which order should you consider courses?", "By lastDay. Take each course; keep the durations in a max-heap.", "If total time exceeds this deadline, remove the longest course taken. The count can only stay or grow."],
    steps: ["Sort by lastDay; t = 0; h = [].", "For d, last: push -d; t += d; if t > last: t += pop (removes the longest).", "Return len(h)."],
    time: "O(n log n)", space: "O(n)",
    trap: "Dropping the current course instead of the longest one gives a worse total time for later courses.",
    code: `import heapq
class Solution:
    def scheduleCourse(self, courses):
        courses.sort(key=lambda c: c[1])
        h, t = [], 0
        for d, last in courses:
            heapq.heappush(h, -d)
            t += d
            if t > last:
                t += heapq.heappop(h)
        return len(h)`
  },
  {
    num: 857, title: "Minimum Cost to Hire K Workers", slug: "minimum-cost-to-hire-k-workers", lc: "Hard",
    topic: "heaps",
    pattern: "Greedy + heap (best affordable / regret)",
    level: 5,
    order: 330,
    core: false,
    teaches: "Sort workers by wage/quality ratio; the current ratio sets the pay, a max-heap keeps the k smallest qualities.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [502],
    hints: ["In a group, everyone is paid at the highest wage/quality ratio in that group. What do you minimise then?", "cost = ratio * total quality. Process workers by increasing ratio so the current one is the captain.", "Keep the k smallest qualities seen so far in a max-heap with a running sum."],
    steps: ["workers = sorted by wage/quality.", "For each: push -q; qsum += q; if len > k: qsum += pop.", "If len == k: best = min(best, qsum * ratio).", "Return best."],
    time: "O(n log n)", space: "O(n)",
    trap: "Trying every captain with a fresh sort of qualities is O(n^2 log n).",
    code: `import heapq
class Solution:
    def mincostToHireWorkers(self, quality, wage, k):
        workers = sorted((w / q, q) for q, w in zip(quality, wage))
        h, qsum, best = [], 0, float('inf')
        for ratio, q in workers:
            heapq.heappush(h, -q)
            qsum += q
            if len(h) > k:
                qsum += heapq.heappop(h)
            if len(h) == k:
                best = min(best, qsum * ratio)
        return best`
  },
  {
    num: 1675, title: "Minimize Deviation in Array", slug: "minimize-deviation-in-array", lc: "Hard",
    topic: "heaps",
    pattern: "Greedy + heap (best affordable / regret)",
    level: 5,
    order: 340,
    core: false,
    teaches: "Normalise every number to its largest form (odd x 2), then keep halving the maximum while tracking the minimum.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [1046],
    hints: ["Odd numbers can only go up once, even numbers can only go down. Can you make all moves one-directional?", "Double every odd number first. Now the only move is halving an even number.", "Max-heap: pop the max, record max - min, halve it if even (update min) and push; stop when the max is odd."],
    steps: ["h = [-(x * 2 if x odd else x)]; mn = min of those.", "Loop: x = -pop; best = min(best, x - mn).", "If x odd: break. Else x //= 2; mn = min(mn, x); push -x.", "Return best."],
    time: "O(n log n log M)", space: "O(n)",
    trap: "Halving the max only while it is even is the stopping rule; continuing would need to grow an odd max, which is impossible.",
    code: `import heapq
class Solution:
    def minimumDeviation(self, nums):
        h = [-(x * 2 if x % 2 else x) for x in nums]
        heapq.heapify(h)
        mn = -max(h)
        best = float('inf')
        while True:
            x = -heapq.heappop(h)
            best = min(best, x - mn)
            if x % 2:
                return best
            x //= 2
            mn = min(mn, x)
            heapq.heappush(h, -x)`
  },
  {
    num: 2402, title: "Meeting Rooms III", slug: "meeting-rooms-iii", lc: "Hard",
    topic: "heaps",
    pattern: "Event simulation (sort by time + heaps)",
    level: 5,
    order: 350,
    core: false,
    teaches: "Free rooms in a min-heap by number, busy rooms in a min-heap by (end time, room); delayed meetings keep their duration.",
    learn: ["dsa_heaps", "dsa-hp-problems"],
    pre: [1882],
    hints: ["Process meetings by start time. What two questions do you need answered fast?", "Which is the lowest-numbered free room? Which busy room frees up first (lowest number on ties)?", "If no room is free, the meeting waits: it takes the earliest-freed room and ends at that end time + its duration."],
    steps: ["Sort meetings; free = [0..n-1]; busy = [].", "For s, e: release all busy with end <= s into free.", "If free: r = pop; push (e, r). Else: end, r = pop busy; push (end + e - s, r).", "count[r] += 1; return the room with the max count (smallest index on ties)."],
    time: "O(m log m + m log n)", space: "O(n)",
    trap: "When a meeting is delayed, its new end is old end + duration, not its original end.",
    code: `import heapq
class Solution:
    def mostBooked(self, n, meetings):
        meetings.sort()
        free = list(range(n))
        busy = []
        count = [0] * n
        for s, e in meetings:
            while busy and busy[0][0] <= s:
                _, r = heapq.heappop(busy)
                heapq.heappush(free, r)
            if free:
                r = heapq.heappop(free)
                heapq.heappush(busy, (e, r))
            else:
                end, r = heapq.heappop(busy)
                heapq.heappush(busy, (end + e - s, r))
            count[r] += 1
        return count.index(max(count))`
  },
  {
    num: 295, title: "Find Median from Data Stream", slug: "find-median-from-data-stream", lc: "Hard",
    topic: "heaps",
    pattern: "Two heaps",
    level: 5,
    order: 360,
    core: true,
    teaches: "A max-heap of the lower half and a min-heap of the upper half; their tops are the middle.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [703],
    hints: ["The median splits the data into a small half and a big half. What do you need from each half?", "The largest of the small half and the smallest of the big half: a max-heap and a min-heap.", "Add: push to lo, move lo's top to hi, and if hi gets bigger than lo move hi's top back."],
    steps: ["lo = max-heap (negatives), hi = min-heap.", "addNum: push -x to lo; push -pop(lo) to hi; if len(hi) > len(lo): push -pop(hi) to lo.", "findMedian: if len(lo) > len(hi) return -lo[0]; else (-lo[0] + hi[0]) / 2."],
    time: "O(log n) add, O(1) median", space: "O(n)",
    trap: "Forgetting the 'pass through the other heap' step can leave a small number in the upper half.",
    code: `import heapq
class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap via negatives
        self.hi = []  # min-heap

    def addNum(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self):
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])
        return (-self.lo[0] + self.hi[0]) / 2`
  },
  {
    num: 480, title: "Sliding Window Median", slug: "sliding-window-median", lc: "Hard",
    topic: "heaps",
    pattern: "Two heaps",
    level: 6,
    order: 370,
    core: false,
    teaches: "Two heaps for the median plus lazy deletion with a 'delayed' counter and explicit size counts.",
    learn: ["dsa_heaps", "dsa-hp-patterns"],
    pre: [295, 2353],
    hints: ["A sliding window needs removals, but heapq cannot remove an arbitrary element cheaply.", "Mark the outgoing value in a delayed counter and only physically pop it when it reaches a heap top.", "Track the number of valid elements in each heap yourself, rebalance using those counts, and prune tops after every change."],
    steps: ["lo (max), hi (min), delayed = Counter(), sizes ls, hs.", "add(x): push to lo if x <= lo top else hi; rebalance so ls == hs or ls == hs + 1.", "remove(x): delayed[x] += 1; decrease the size of the heap x belongs to (x <= lo top -> lo); prune that heap's top; rebalance.", "After each step i >= k - 1 read the median from the tops."],
    time: "O(n log n)", space: "O(n)",
    trap: "Rebalancing by len(heap) is wrong because heaps contain dead entries; use your own size counters.",
    code: `import heapq
from collections import defaultdict
class Solution:
    def medianSlidingWindow(self, nums, k):
        lo, hi = [], []
        delayed = defaultdict(int)
        size = [0, 0]  # valid counts in lo, hi

        def prune(h, sign):
            while h and delayed[sign * h[0]]:
                delayed[sign * h[0]] -= 1
                heapq.heappop(h)

        def balance():
            if size[0] > size[1] + 1:
                heapq.heappush(hi, -heapq.heappop(lo))
                size[0] -= 1; size[1] += 1
                prune(lo, -1)
            elif size[0] < size[1]:
                heapq.heappush(lo, -heapq.heappop(hi))
                size[1] -= 1; size[0] += 1
                prune(hi, 1)

        def add(x):
            if not lo or x <= -lo[0]:
                heapq.heappush(lo, -x); size[0] += 1
            else:
                heapq.heappush(hi, x); size[1] += 1
            balance()

        def remove(x):
            delayed[x] += 1
            if x <= -lo[0]:
                size[0] -= 1
                if x == -lo[0]:
                    prune(lo, -1)
            else:
                size[1] -= 1
                if x == hi[0]:
                    prune(hi, 1)
            balance()

        res = []
        for i, x in enumerate(nums):
            add(x)
            if i >= k:
                remove(nums[i - k])
            if i >= k - 1:
                res.append(float(-lo[0]) if k % 2 else (-lo[0] + hi[0]) / 2)
        return res`
  }
);
