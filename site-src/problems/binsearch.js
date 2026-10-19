// problems/binsearch.js — Binary Search ladder
PROBLEMS.push(
  {
    num: 704, title: "Binary Search", slug: "binary-search", lc: "Easy",
    topic: "binsearch",
    pattern: "Classic exact match",
    level: 1,
    order: 10,
    core: true,
    teaches: "Halve a sorted range each step: compare with the middle, keep the half that can still hold the target.",
    learn: ["dsa_binsearch", "dsa-bs-loop"],
    pre: [],
    hints: [
      "The array is sorted. If the middle value is too small, which half can you throw away?",
      "Keep lo and hi; loop while lo <= hi; move lo to mid + 1 or hi to mid - 1."
    ],
    steps: [
      "lo, hi = 0, n - 1.",
      "While lo <= hi: mid = (lo + hi) // 2.",
      "If nums[mid] == target return mid; if smaller, lo = mid + 1; else hi = mid - 1.",
      "Return -1."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Using while lo < hi with hi = n - 1 skips checking the last remaining element.",
    code: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`
  },
  {
    num: 374, title: "Guess Number Higher or Lower", slug: "guess-number-higher-or-lower", lc: "Easy",
    topic: "binsearch",
    pattern: "Classic exact match",
    level: 1,
    order: 20,
    core: false,
    teaches: "The same halving loop works when the 'array' is just the numbers 1..n and an API tells you higher or lower.",
    learn: ["dsa_binsearch", "dsa-bs-loop"],
    pre: [704],
    hints: [
      "guess(mid) tells you which side the pick is on, exactly like comparing with nums[mid].",
      "Search lo = 1, hi = n; if guess says -1 the pick is smaller, so hi = mid - 1."
    ],
    steps: [
      "lo, hi = 1, n.",
      "While lo <= hi: mid = (lo + hi) // 2; r = guess(mid).",
      "r == 0: return mid. r == -1: hi = mid - 1. r == 1: lo = mid + 1."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "guess returns -1 when YOUR guess is too high (pick is lower), not the other way round.",
    code: `# The guess API is already defined for you:
# guess(num) -> -1 if num > pick, 1 if num < pick, 0 if equal
def guessNumber(n):
    lo, hi = 1, n
    while lo <= hi:
        mid = (lo + hi) // 2
        r = guess(mid)
        if r == 0:
            return mid
        if r == -1:
            hi = mid - 1
        else:
            lo = mid + 1`
  },
  {
    num: 35, title: "Search Insert Position", slug: "search-insert-position", lc: "Easy",
    topic: "binsearch",
    pattern: "Lower / upper bound",
    level: 1,
    order: 30,
    core: true,
    teaches: "Lower bound: the first index whose value is >= target is both 'found here' and 'insert here'.",
    learn: ["dsa_binsearch", "dsa-bs-sortedprob"],
    pre: [704],
    hints: [
      "If the target is missing, where would it go? The first spot with a value >= target.",
      "Use lo = 0, hi = n (one past the end) and loop while lo < hi; when nums[mid] >= target set hi = mid."
    ],
    steps: [
      "lo, hi = 0, len(nums).",
      "While lo < hi: mid = (lo + hi) // 2.",
      "If nums[mid] < target: lo = mid + 1; else hi = mid.",
      "Return lo (same as bisect_left)."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "hi must start at n, not n - 1, or a target bigger than everything can never return n.",
    code: `def searchInsert(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo`
  },
  {
    num: 278, title: "First Bad Version", slug: "first-bad-version", lc: "Easy",
    topic: "binsearch",
    pattern: "Lower / upper bound",
    level: 1,
    order: 40,
    core: true,
    teaches: "Find the first True in a False...False True...True sequence with lo < hi and hi = mid.",
    learn: ["dsa_binsearch", "dsa-bs-traps"],
    pre: [35],
    hints: [
      "The answers look like good, good, bad, bad. You want the first bad one.",
      "If mid is bad, the answer is mid or to its left (hi = mid). If good, it is to the right (lo = mid + 1)."
    ],
    steps: [
      "lo, hi = 1, n.",
      "While lo < hi: mid = (lo + hi) // 2.",
      "If isBadVersion(mid): hi = mid; else lo = mid + 1.",
      "Return lo."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Setting hi = mid - 1 when mid is bad can skip the very first bad version.",
    code: `# isBadVersion(version) -> bool is already defined for you
def firstBadVersion(n):
    lo, hi = 1, n
    while lo < hi:
        mid = (lo + hi) // 2
        if isBadVersion(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 744, title: "Find Smallest Letter Greater Than Target", slug: "find-smallest-letter-greater-than-target", lc: "Easy",
    topic: "binsearch",
    pattern: "Lower / upper bound",
    level: 2,
    order: 50,
    core: false,
    teaches: "Upper bound (first value strictly greater) plus a wrap-around when nothing is greater.",
    learn: ["dsa_binsearch", "dsa-bs-bisect"],
    pre: [35],
    hints: [
      "You need the first letter strictly greater than target: that is bisect_right, not bisect_left.",
      "If that index equals len(letters), wrap around to letters[0]."
    ],
    steps: [
      "i = bisect_right(letters, target) (or the lo < hi loop with letters[mid] <= target -> lo = mid + 1).",
      "Return letters[i % len(letters)]."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Using >= instead of > returns the target letter itself when it is present.",
    code: `def nextGreatestLetter(letters, target):
    lo, hi = 0, len(letters)
    while lo < hi:
        mid = (lo + hi) // 2
        if letters[mid] <= target:
            lo = mid + 1
        else:
            hi = mid
    return letters[lo % len(letters)]`
  },
  {
    num: 34, title: "Find First and Last Position of Element in Sorted Array", slug: "find-first-and-last-position-of-element-in-sorted-array", lc: "Medium",
    topic: "binsearch",
    pattern: "Lower / upper bound",
    level: 2,
    order: 60,
    core: true,
    teaches: "Two boundary searches: first index >= target and first index > target bracket every copy of the target.",
    learn: ["dsa_binsearch", "dsa-bs-bisect"],
    pre: [35],
    hints: [
      "One binary search can find the leftmost copy; a second, slightly different one finds where copies end.",
      "left = lower_bound(target); right = lower_bound(target + 1) - 1 (or bisect_right - 1).",
      "If left == n or nums[left] != target, return [-1, -1]."
    ],
    steps: [
      "Write lower(x): first index with nums[i] >= x (lo < hi loop).",
      "l = lower(target). If l == n or nums[l] != target return [-1, -1].",
      "Return [l, lower(target + 1) - 1]."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Finding one copy and then walking outwards is O(n) when the whole array is the target.",
    code: `def searchRange(nums, target):
    def lower(x):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        return lo
    l = lower(target)
    if l == len(nums) or nums[l] != target:
        return [-1, -1]
    return [l, lower(target + 1) - 1]`
  },
  {
    num: 2529, title: "Maximum Count of Positive Integer and Negative Integer", slug: "maximum-count-of-positive-integer-and-negative-integer", lc: "Easy",
    topic: "binsearch",
    pattern: "Lower / upper bound",
    level: 2,
    order: 70,
    core: false,
    teaches: "Counting values in a sorted array is just subtracting two boundary indexes.",
    learn: ["dsa_binsearch", "dsa-bs-bisect"],
    pre: [34],
    hints: [
      "How many numbers are < 0? That is the first index whose value is >= 0.",
      "Positives start at the first index whose value is > 0 (bisect_right(nums, 0))."
    ],
    steps: [
      "neg = bisect_left(nums, 0).",
      "pos = len(nums) - bisect_right(nums, 0).",
      "Return max(neg, pos)."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Zeros are neither positive nor negative; using bisect_left for both counts includes them.",
    code: `from bisect import bisect_left, bisect_right

def maximumCount(nums):
    neg = bisect_left(nums, 0)
    pos = len(nums) - bisect_right(nums, 0)
    return max(neg, pos)`
  },
  {
    num: 2300, title: "Successful Pairs of Spells and Potions", slug: "successful-pairs-of-spells-and-potions", lc: "Medium",
    topic: "binsearch",
    pattern: "Sort + bisect",
    level: 2,
    order: 80,
    core: false,
    teaches: "Sort one side once, then answer each query with a binary search instead of a scan.",
    learn: ["dsa_binsearch", "dsa-bs-bisect"],
    pre: [35],
    hints: [
      "For a spell s, which potions work? Those with p >= success / s.",
      "Sort potions; the working ones form a suffix. Find where it starts with bisect_left.",
      "Use integer ceiling: need = (success + s - 1) // s."
    ],
    steps: [
      "Sort potions.",
      "For each spell s: need = ceil(success / s).",
      "count = m - bisect_left(potions, need).",
      "Collect the counts."
    ],
    time: "O((n + m) log m)", space: "O(m) for the sort",
    trap: "Floating-point division can be off by one for huge values; use integer ceiling.",
    code: `from bisect import bisect_left

def successfulPairs(spells, potions, success):
    potions.sort()
    m = len(potions)
    return [m - bisect_left(potions, (success + s - 1) // s) for s in spells]`
  },
  {
    num: 2389, title: "Longest Subsequence With Limited Sum", slug: "longest-subsequence-with-limited-sum", lc: "Easy",
    topic: "binsearch",
    pattern: "Sort + bisect",
    level: 2,
    order: 90,
    core: false,
    teaches: "Sort, build prefix sums, then bisect_right the budget to see how many items fit.",
    learn: ["dsa_binsearch", "dsa-bs-bisect"],
    pre: [2300],
    hints: [
      "To fit the most numbers under a budget, which numbers should you take?",
      "Take the smallest ones: sort and build prefix sums. The answer is how many prefix sums are <= q."
    ],
    steps: [
      "Sort nums; build prefix sums pre[i] = sum of the first i+1.",
      "For each q: answer = bisect_right(pre, q)."
    ],
    time: "O((n + q) log n)", space: "O(n)",
    trap: "bisect_left misses prefixes exactly equal to the query.",
    code: `from bisect import bisect_right
from itertools import accumulate

def answerQueries(nums, queries):
    pre = list(accumulate(sorted(nums)))
    return [bisect_right(pre, q) for q in queries]`
  },
  {
    num: 1351, title: "Count Negative Numbers in a Sorted Matrix", slug: "count-negative-numbers-in-a-sorted-matrix", lc: "Easy",
    topic: "binsearch",
    pattern: "2D matrix",
    level: 2,
    order: 100,
    core: false,
    teaches: "Rows and columns both sorted: walk a staircase from a corner instead of scanning every cell.",
    learn: ["dsa_binsearch", "dsa-bs-sortedprob"],
    pre: [35],
    hints: [
      "Each row is sorted descending, so its negatives form a suffix; a binary search per row already gives O(m log n).",
      "Better: the first negative column can only move left as you go down the rows. Walk it like a staircase."
    ],
    steps: [
      "Start at row = m - 1, col = 0 (bottom-left).",
      "If grid[row][col] < 0: everything right of it is negative, add n - col, move up a row.",
      "Else move right (col += 1).",
      "Stop when row < 0 or col == n."
    ],
    time: "O(m + n)", space: "O(1)",
    trap: "Counting cell by cell is O(m*n) and ignores the sorting entirely.",
    code: `def countNegatives(grid):
    m, n = len(grid), len(grid[0])
    r, c, count = m - 1, 0, 0
    while r >= 0 and c < n:
        if grid[r][c] < 0:
            count += n - c
            r -= 1
        else:
            c += 1
    return count`
  },
  {
    num: 74, title: "Search a 2D Matrix", slug: "search-a-2d-matrix", lc: "Medium",
    topic: "binsearch",
    pattern: "2D matrix",
    level: 2,
    order: 110,
    core: true,
    teaches: "A matrix sorted row after row is one long sorted array; map index k to (k // n, k % n).",
    learn: ["dsa_binsearch", "dsa-bs-sortedprob"],
    pre: [704],
    hints: [
      "If you laid the rows end to end, would the numbers be sorted?",
      "Binary search k in [0, m*n - 1] and read matrix[k // n][k % n]."
    ],
    steps: [
      "lo, hi = 0, m*n - 1.",
      "While lo <= hi: mid; v = matrix[mid // n][mid % n].",
      "Return True on match; else move lo or hi like classic binary search.",
      "Return False."
    ],
    time: "O(log(m*n))", space: "O(1)",
    trap: "Dividing by m (rows) instead of n (columns) gives wrong cells on non-square matrices.",
    code: `def searchMatrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    lo, hi = 0, m * n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = matrix[mid // n][mid % n]
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`
  },
  {
    num: 153, title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", lc: "Medium",
    topic: "binsearch",
    pattern: "Rotated array",
    level: 2,
    order: 120,
    core: true,
    teaches: "In a rotated sorted array, comparing nums[mid] with nums[hi] tells you which side the minimum is on.",
    learn: ["dsa_binsearch", "dsa-bs-rotated"],
    pre: [278],
    hints: [
      "If nums[mid] > nums[hi], the drop (and the minimum) must be to the right of mid.",
      "Otherwise the right half is sorted and mid could be the minimum: hi = mid."
    ],
    steps: [
      "lo, hi = 0, n - 1.",
      "While lo < hi: mid = (lo + hi) // 2.",
      "If nums[mid] > nums[hi]: lo = mid + 1; else hi = mid.",
      "Return nums[lo]."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Comparing with nums[lo] instead of nums[hi] breaks on an array that is not rotated at all.",
    code: `def findMin(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`
  },
  {
    num: 852, title: "Peak Index in a Mountain Array", slug: "peak-index-in-a-mountain-array", lc: "Medium",
    topic: "binsearch",
    pattern: "Peak / slope",
    level: 2,
    order: 130,
    core: false,
    teaches: "Binary search works on a slope: 'am I still going up?' is False...True, so search for where it flips.",
    learn: ["dsa_binsearch", "dsa-bs-patterns"],
    pre: [278],
    hints: [
      "At index mid, compare arr[mid] with arr[mid + 1]. What does it tell you about where the peak is?",
      "If arr[mid] < arr[mid + 1] you are on the uphill side: the peak is to the right."
    ],
    steps: [
      "lo, hi = 0, n - 1.",
      "While lo < hi: mid = (lo + hi) // 2.",
      "If arr[mid] < arr[mid + 1]: lo = mid + 1; else hi = mid.",
      "Return lo."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Using lo <= hi lets mid reach n - 1, and arr[mid + 1] goes out of range.",
    code: `def peakIndexInMountainArray(arr):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < arr[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`
  },
  {
    num: 69, title: "Sqrt(x)", slug: "sqrtx", lc: "Easy",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 2,
    order: 140,
    core: true,
    teaches: "Binary search can run over possible answers (0..x), not just over array indexes.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [278],
    hints: [
      "The answer k is the largest integer with k*k <= x. Is 'k*k <= x' True...True False...False as k grows?",
      "Search k in [0, x]; keep the last k that passes, or find the first k with k*k > x and subtract 1."
    ],
    steps: [
      "lo, hi = 0, x + 1 (hi is surely too big).",
      "While lo < hi: mid = (lo + hi) // 2.",
      "If mid * mid > x: hi = mid; else lo = mid + 1.",
      "Return lo - 1."
    ],
    time: "O(log x)", space: "O(1)",
    trap: "Returning lo instead of lo - 1 gives the first k that is too big.",
    code: `def mySqrt(x):
    lo, hi = 0, x + 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mid * mid > x:
            hi = mid
        else:
            lo = mid + 1
    return lo - 1`
  },
  {
    num: 367, title: "Valid Perfect Square", slug: "valid-perfect-square", lc: "Easy",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 2,
    order: 150,
    core: false,
    teaches: "Same search over answers, but now you only care whether an exact match exists.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [69],
    hints: [
      "Search k in [1, num] for k*k == num.",
      "It is the classic exact-match loop, just comparing k*k with num."
    ],
    steps: [
      "lo, hi = 1, num.",
      "While lo <= hi: mid; sq = mid * mid.",
      "sq == num: True; sq < num: lo = mid + 1; else hi = mid - 1.",
      "Return False."
    ],
    time: "O(log num)", space: "O(1)",
    trap: "Using floating-point sqrt can misjudge very large perfect squares.",
    code: `def isPerfectSquare(num):
    lo, hi = 1, num
    while lo <= hi:
        mid = (lo + hi) // 2
        sq = mid * mid
        if sq == num:
            return True
        if sq < num:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`
  },
  {
    num: 441, title: "Arranging Coins", slug: "arranging-coins", lc: "Easy",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 2,
    order: 160,
    core: false,
    teaches: "Find the largest k whose cost k*(k+1)/2 fits the budget by searching over k.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [69],
    hints: [
      "k complete rows need 1 + 2 + ... + k = k*(k+1)/2 coins.",
      "Find the largest k with k*(k+1)//2 <= n, exactly like the square-root search."
    ],
    steps: [
      "lo, hi = 0, n + 1.",
      "While lo < hi: mid; if mid*(mid+1)//2 > n: hi = mid else lo = mid + 1.",
      "Return lo - 1."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Simulating row by row is O(sqrt n) and fine, but the search is the pattern to learn; watch the off-by-one.",
    code: `def arrangeCoins(n):
    lo, hi = 0, n + 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mid * (mid + 1) // 2 > n:
            hi = mid
        else:
            lo = mid + 1
    return lo - 1`
  },
  {
    num: 275, title: "H-Index II", slug: "h-index-ii", lc: "Medium",
    topic: "binsearch",
    pattern: "Lower / upper bound",
    level: 3,
    order: 170,
    core: false,
    teaches: "Turn a definition ('h papers with >= h citations') into a monotone test on the index.",
    learn: ["dsa_binsearch", "dsa-bs-patterns"],
    pre: [35],
    hints: [
      "With sorted citations, if citations[i] >= n - i then the last n - i papers all have at least n - i citations.",
      "That test is False...True as i grows. Find the first i where it holds; the answer is n - i."
    ],
    steps: [
      "lo, hi = 0, n.",
      "While lo < hi: mid; if citations[mid] >= n - mid: hi = mid else lo = mid + 1.",
      "Return n - lo."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Returning the index (lo) instead of n - lo.",
    code: `def hIndex(citations):
    n = len(citations)
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi) // 2
        if citations[mid] >= n - mid:
            hi = mid
        else:
            lo = mid + 1
    return n - lo`
  },
  {
    num: 981, title: "Time Based Key-Value Store", slug: "time-based-key-value-store", lc: "Medium",
    topic: "binsearch",
    pattern: "Bisect inside a design",
    level: 3,
    order: 180,
    core: true,
    teaches: "Timestamps arrive in increasing order, so each key's history is already sorted: bisect it.",
    learn: ["dsa_binsearch", "dsa-bs-bisect"],
    pre: [744],
    hints: [
      "Store, for each key, the list of timestamps and the list of values in arrival order. Are the timestamps sorted?",
      "get needs the largest timestamp <= t: that is bisect_right(times, t) - 1."
    ],
    steps: [
      "set: append timestamp and value to that key's two lists.",
      "get: i = bisect_right(times[key], t) - 1.",
      "Return values[key][i] if i >= 0 else \"\"."
    ],
    time: "O(1) set, O(log n) get", space: "O(n)",
    trap: "bisect_left misses an entry whose timestamp equals t exactly.",
    code: `from bisect import bisect_right
from collections import defaultdict

class TimeMap:
    def __init__(self):
        self.times = defaultdict(list)
        self.vals = defaultdict(list)

    def set(self, key, value, timestamp):
        self.times[key].append(timestamp)
        self.vals[key].append(value)

    def get(self, key, timestamp):
        i = bisect_right(self.times[key], timestamp) - 1
        return self.vals[key][i] if i >= 0 else ""`
  },
  {
    num: 240, title: "Search a 2D Matrix II", slug: "search-a-2d-matrix-ii", lc: "Medium",
    topic: "binsearch",
    pattern: "2D matrix",
    level: 3,
    order: 190,
    core: false,
    teaches: "When only rows and columns are sorted, start at the top-right: every step rules out a whole row or column.",
    learn: ["dsa_binsearch", "dsa-bs-sortedprob"],
    pre: [74, 1351],
    hints: [
      "One flat binary search no longer works: the rows don't continue each other. Which corner gives a clear decision?",
      "At the top-right, a value too big means the whole column below is too big; too small means the whole row to the left is too small."
    ],
    steps: [
      "r, c = 0, n - 1.",
      "While r < m and c >= 0: v = matrix[r][c].",
      "v == target: True. v > target: c -= 1. v < target: r += 1.",
      "Return False."
    ],
    time: "O(m + n)", space: "O(1)",
    trap: "Starting at the top-left: both moves increase the value, so you cannot decide which way to go.",
    code: `def searchMatrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    r, c = 0, n - 1
    while r < m and c >= 0:
        v = matrix[r][c]
        if v == target:
            return True
        if v > target:
            c -= 1
        else:
            r += 1
    return False`
  },
  {
    num: 33, title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", lc: "Medium",
    topic: "binsearch",
    pattern: "Rotated array",
    level: 3,
    order: 200,
    core: true,
    teaches: "After a rotation one half around mid is always sorted; check if the target lies inside that sorted half.",
    learn: ["dsa_binsearch", "dsa-bs-rotated"],
    pre: [153, 704],
    hints: [
      "Pick mid. Either nums[lo..mid] or nums[mid..hi] is in sorted order. How can you tell which?",
      "If nums[lo] <= nums[mid] the left half is sorted. Then the target is there exactly when nums[lo] <= target < nums[mid].",
      "Otherwise the right half is sorted: check nums[mid] < target <= nums[hi]."
    ],
    steps: [
      "lo, hi = 0, n - 1; while lo <= hi: mid.",
      "If nums[mid] == target return mid.",
      "If nums[lo] <= nums[mid]: go left if nums[lo] <= target < nums[mid], else go right.",
      "Else: go right if nums[mid] < target <= nums[hi], else go left.",
      "Return -1."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Writing nums[lo] < nums[mid] (strict) fails when lo == mid in a two-element range.",
    code: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`
  },
  {
    num: 162, title: "Find Peak Element", slug: "find-peak-element", lc: "Medium",
    topic: "binsearch",
    pattern: "Peak / slope",
    level: 3,
    order: 210,
    core: true,
    teaches: "You don't need a sorted array: any local slope guarantees a peak exists on the uphill side.",
    learn: ["dsa_binsearch", "dsa-bs-patterns"],
    pre: [852],
    hints: [
      "The ends count as minus infinity. If nums[mid] < nums[mid + 1], is there surely a peak on the right?",
      "Yes: keep walking uphill and you must stop at a peak. Same loop as the mountain array."
    ],
    steps: [
      "lo, hi = 0, n - 1.",
      "While lo < hi: mid; if nums[mid] < nums[mid + 1]: lo = mid + 1 else hi = mid.",
      "Return lo."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Thinking it needs the global maximum; any peak is accepted.",
    code: `def findPeakElement(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`
  },
  {
    num: 540, title: "Single Element in a Sorted Array", slug: "single-element-in-a-sorted-array", lc: "Medium",
    topic: "binsearch",
    pattern: "Index-property split",
    level: 3,
    order: 220,
    core: false,
    teaches: "Binary search on a property of the index: before the single element pairs start at even indexes, after it at odd ones.",
    learn: ["dsa_binsearch", "dsa-bs-patterns"],
    pre: [278],
    hints: [
      "Look at pairs (0,1), (2,3), ... Before the single element, nums[even] == nums[even + 1]. What happens after it?",
      "After it, the pairs shift: nums[even] != nums[even + 1]. That is a False...True split.",
      "Force mid to be even, then compare nums[mid] with nums[mid + 1]."
    ],
    steps: [
      "lo, hi = 0, n - 1.",
      "While lo < hi: mid = (lo + hi) // 2; if mid is odd, mid -= 1.",
      "If nums[mid] == nums[mid + 1]: lo = mid + 2; else hi = mid.",
      "Return nums[lo]."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "XOR of everything is O(n); the problem asks for O(log n).",
    code: `def singleNonDuplicate(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mid % 2 == 1:
            mid -= 1
        if nums[mid] == nums[mid + 1]:
            lo = mid + 2
        else:
            hi = mid
    return nums[lo]`
  },
  {
    num: 1539, title: "Kth Missing Positive Number", slug: "kth-missing-positive-number", lc: "Easy",
    topic: "binsearch",
    pattern: "Index-property split",
    level: 3,
    order: 230,
    core: false,
    teaches: "arr[i] - (i + 1) counts how many numbers are missing before index i, and that count only grows.",
    learn: ["dsa_binsearch", "dsa-bs-patterns"],
    pre: [540],
    hints: [
      "If nothing were missing, arr[i] would be i + 1. So how many are missing before arr[i]?",
      "missing(i) = arr[i] - i - 1 is non-decreasing. Find the first i with missing(i) >= k.",
      "Then the answer is i + k (k missing numbers plus the i present ones before it)."
    ],
    steps: [
      "lo, hi = 0, n.",
      "While lo < hi: mid; if arr[mid] - mid - 1 < k: lo = mid + 1 else hi = mid.",
      "Return lo + k."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Returning arr[lo] + something breaks when lo == n; lo + k works for every case.",
    code: `def findKthPositive(arr, k):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] - mid - 1 < k:
            lo = mid + 1
        else:
            hi = mid
    return lo + k`
  },
  {
    num: 875, title: "Koko Eating Bananas", slug: "koko-eating-bananas", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 3,
    order: 240,
    core: true,
    teaches: "'Minimum speed such that it works' means: binary search the speed and test it with a fast check.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [69],
    hints: [
      "If speed k lets Koko finish in time, does every faster speed also work?",
      "So ok(k) is False...True. Search k in [1, max(piles)]; ok(k) = sum(ceil(p / k)) <= h."
    ],
    steps: [
      "lo, hi = 1, max(piles).",
      "ok(k): sum((p + k - 1) // k for p in piles) <= h.",
      "While lo < hi: mid; if ok(mid): hi = mid else lo = mid + 1.",
      "Return lo."
    ],
    time: "O(n log max)", space: "O(1)",
    trap: "Using p // k instead of ceiling: a partial pile still costs a full hour.",
    code: `def minEatingSpeed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum((p + mid - 1) // mid for p in piles) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 1011, title: "Capacity To Ship Packages Within D Days", slug: "capacity-to-ship-packages-within-d-days", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 3,
    order: 250,
    core: false,
    teaches: "Search the capacity; check it greedily by filling each day until the next package would overflow.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [875],
    hints: [
      "Smallest possible capacity? It must carry the heaviest package. Largest needed? The total weight.",
      "For a capacity C, count days greedily: start a new day when the next package does not fit. ok(C) = days <= D."
    ],
    steps: [
      "lo, hi = max(weights), sum(weights).",
      "days(C): walk weights, start a new day when load + w > C.",
      "Binary search the first C with days(C) <= days.",
      "Return lo."
    ],
    time: "O(n log(sum))", space: "O(1)",
    trap: "Starting lo at 1 lets a capacity below the heaviest package look feasible in a sloppy check.",
    code: `def shipWithinDays(weights, days):
    def need(cap):
        d, load = 1, 0
        for w in weights:
            if load + w > cap:
                d += 1
                load = 0
            load += w
        return d

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if need(mid) <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 1283, title: "Find the Smallest Divisor Given a Threshold", slug: "find-the-smallest-divisor-given-a-threshold", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 3,
    order: 260,
    core: false,
    teaches: "A bigger divisor only makes the rounded-up sum smaller, so the search over divisors is monotone.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [875],
    hints: [
      "Is the sum of ceil(x / d) larger or smaller when d grows?",
      "Search d in [1, max(nums)] for the first d whose sum is <= threshold."
    ],
    steps: [
      "lo, hi = 1, max(nums).",
      "ok(d): sum((x + d - 1) // d) <= threshold.",
      "First d with ok(d) via lo < hi loop."
    ],
    time: "O(n log max)", space: "O(1)",
    trap: "Forgetting the ceiling makes the sum too small and the divisor too small.",
    code: `def smallestDivisor(nums, threshold):
    lo, hi = 1, max(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum((x + mid - 1) // mid for x in nums) <= threshold:
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 1482, title: "Minimum Number of Days to Make m Bouquets", slug: "minimum-number-of-days-to-make-m-bouquets", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 3,
    order: 270,
    core: false,
    teaches: "Search the day; check it by scanning for runs of k adjacent bloomed flowers.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [875],
    hints: [
      "If you can make m bouquets by day D, can you also by day D + 1?",
      "ok(D): walk the garden, count consecutive flowers with bloomDay <= D; every k in a row makes one bouquet.",
      "If m * k > n it is impossible from the start: return -1."
    ],
    steps: [
      "If m * k > n return -1.",
      "lo, hi = min(bloomDay), max(bloomDay).",
      "ok(D): run = 0, made = 0; for each b: run = run + 1 if b <= D else 0; when run == k, made += 1 and run = 0. Return made >= m.",
      "Binary search the first D with ok(D)."
    ],
    time: "O(n log max)", space: "O(1)",
    trap: "Not resetting the run after a bouquet lets one flower be used twice.",
    code: `def minDays(bloomDay, m, k):
    if m * k > len(bloomDay):
        return -1

    def ok(day):
        made = run = 0
        for b in bloomDay:
            run = run + 1 if b <= day else 0
            if run == k:
                made += 1
                run = 0
        return made >= m

    lo, hi = min(bloomDay), max(bloomDay)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 2187, title: "Minimum Time to Complete Trips", slug: "minimum-time-to-complete-trips", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 3,
    order: 280,
    core: false,
    teaches: "Search the total time; in time T each bus finishes T // time[i] trips.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [875],
    hints: [
      "In T units of time, how many trips does a bus with period t make?",
      "ok(T) = sum(T // t) >= totalTrips. The upper bound: the fastest bus alone, min(time) * totalTrips."
    ],
    steps: [
      "lo, hi = 1, min(time) * totalTrips.",
      "ok(T): sum(T // t for t in time) >= totalTrips.",
      "First T with ok(T)."
    ],
    time: "O(n log(min * trips))", space: "O(1)",
    trap: "Simulating time unit by unit is far too slow; totalTrips and time[i] go up to 10^7.",
    code: `def minimumTime(time, totalTrips):
    lo, hi = 1, min(time) * totalTrips
    while lo < hi:
        mid = (lo + hi) // 2
        if sum(mid // t for t in time) >= totalTrips:
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 2226, title: "Maximum Candies Allocated to K Children", slug: "maximum-candies-allocated-to-k-children", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 3,
    order: 290,
    core: false,
    teaches: "Maximising instead of minimising: find the LAST size x that still works (True...True False...False).",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [875],
    hints: [
      "If every child can get x candies, can every child also get x - 1?",
      "ok(x) = sum(c // x) >= k. Find the largest x in [1, max] with ok(x); if even x = 1 fails, return 0."
    ],
    steps: [
      "lo, hi = 0, max(candies) (lo = 0 always 'works' as a fallback).",
      "While lo < hi: mid = (lo + hi + 1) // 2; if sum(c // mid) >= k: lo = mid else hi = mid - 1.",
      "Return lo."
    ],
    time: "O(n log max)", space: "O(1)",
    trap: "With lo = mid you must round mid up ((lo + hi + 1) // 2) or the loop never ends.",
    code: `def maximumCandies(candies, k):
    lo, hi = 0, max(candies)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if sum(c // mid for c in candies) >= k:
            lo = mid
        else:
            hi = mid - 1
    return lo`
  },
  {
    num: 1146, title: "Snapshot Array", slug: "snapshot-array", lc: "Medium",
    topic: "binsearch",
    pattern: "Bisect inside a design",
    level: 4,
    order: 300,
    core: false,
    teaches: "Store only changes: each index keeps a sorted history of (snap_id, value); get bisects it.",
    learn: ["dsa_binsearch", "dsa-bs-bisect"],
    pre: [981],
    hints: [
      "Copying the whole array on every snap is too slow. What actually needs remembering?",
      "Per index, keep a list of [snap_id, value] pairs, updating the last one if it has the current snap_id.",
      "get(index, s): the last pair with snap_id <= s, found with bisect."
    ],
    steps: [
      "hist[i] = [[0], [0]] (snap ids, values); snap_id = 0.",
      "set: if hist[i] ids end with snap_id overwrite that value, else append.",
      "snap: snap_id += 1; return snap_id - 1.",
      "get: j = bisect_right(ids, s) - 1; return vals[j]."
    ],
    time: "O(1) set/snap, O(log s) get", space: "O(n + sets)",
    trap: "Appending a new entry on every set (instead of overwriting within the same snap) still works but bloats memory.",
    code: `from bisect import bisect_right

class SnapshotArray:
    def __init__(self, length):
        self.ids = [[0] for _ in range(length)]
        self.vals = [[0] for _ in range(length)]
        self.snap_id = 0

    def set(self, index, val):
        if self.ids[index][-1] == self.snap_id:
            self.vals[index][-1] = val
        else:
            self.ids[index].append(self.snap_id)
            self.vals[index].append(val)

    def snap(self):
        self.snap_id += 1
        return self.snap_id - 1

    def get(self, index, snap_id):
        j = bisect_right(self.ids[index], snap_id) - 1
        return self.vals[index][j]`
  },
  {
    num: 81, title: "Search in Rotated Sorted Array II", slug: "search-in-rotated-sorted-array-ii", lc: "Medium",
    topic: "binsearch",
    pattern: "Rotated array",
    level: 4,
    order: 310,
    core: false,
    teaches: "Duplicates can hide which half is sorted; when ends and middle are equal, shrink both ends and retry.",
    learn: ["dsa_binsearch", "dsa-bs-rotated"],
    pre: [33],
    hints: [
      "With duplicates, nums[lo] == nums[mid] == nums[hi] tells you nothing about which half is sorted.",
      "In that case just do lo += 1, hi -= 1 (neither end can be the only copy of the target, since mid has the same value). Otherwise use the 33 logic."
    ],
    steps: [
      "While lo <= hi: mid; if nums[mid] == target return True.",
      "If nums[lo] == nums[mid] == nums[hi]: lo += 1; hi -= 1; continue.",
      "Else apply the sorted-half test from Search in Rotated Sorted Array.",
      "Return False."
    ],
    time: "O(log n) average, O(n) worst case", space: "O(1)",
    trap: "The worst case is unavoidably O(n) (e.g. all 1s and one 0); don't promise O(log n).",
    code: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return True
        if nums[lo] == nums[mid] == nums[hi]:
            lo += 1
            hi -= 1
        elif nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return False`
  },
  {
    num: 154, title: "Find Minimum in Rotated Sorted Array II", slug: "find-minimum-in-rotated-sorted-array-ii", lc: "Hard",
    topic: "binsearch",
    pattern: "Rotated array",
    level: 4,
    order: 320,
    core: false,
    teaches: "Same as Find Minimum, but when nums[mid] == nums[hi] you can safely drop just hi.",
    learn: ["dsa_binsearch", "dsa-bs-rotated"],
    pre: [153, 81],
    hints: [
      "Use the 153 comparison with nums[hi]. What should happen when they are equal?",
      "If nums[mid] == nums[hi], hi's value also exists at mid, so removing hi never loses the minimum: hi -= 1."
    ],
    steps: [
      "lo, hi = 0, n - 1; while lo < hi: mid.",
      "nums[mid] > nums[hi]: lo = mid + 1. nums[mid] < nums[hi]: hi = mid. Equal: hi -= 1.",
      "Return nums[lo]."
    ],
    time: "O(log n) average, O(n) worst", space: "O(1)",
    trap: "Doing lo += 1 on equality can skip the minimum (e.g. [3,1,3]).",
    code: `def findMin(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        elif nums[mid] < nums[hi]:
            hi = mid
        else:
            hi -= 1
    return nums[lo]`
  },
  {
    num: 1095, title: "Find in Mountain Array", slug: "find-in-mountain-array", lc: "Hard",
    topic: "binsearch",
    pattern: "Peak / slope",
    level: 4,
    order: 330,
    core: false,
    teaches: "Three binary searches: find the peak, search the rising side, then search the falling side with flipped comparisons.",
    learn: ["dsa_binsearch", "dsa-bs-patterns"],
    pre: [852, 704],
    hints: [
      "You may only call get about 100 times, so a scan is out. First find the peak like in 852.",
      "Left of the peak is sorted ascending: binary search it first (we want the smallest index).",
      "If not found, search the right side, which is sorted descending (swap the < test)."
    ],
    steps: [
      "Find peak with the slope search (get(mid) < get(mid + 1)).",
      "Binary search [0, peak] ascending; return index if found.",
      "Binary search [peak + 1, n - 1] descending; return index if found, else -1."
    ],
    time: "O(log n) calls", space: "O(1)",
    trap: "Searching the right side first can return the larger index when the target appears on both sides.",
    code: `# MountainArray API: mountain_arr.get(i), mountain_arr.length()
def findInMountainArray(target, mountain_arr):
    n = mountain_arr.length()
    lo, hi = 0, n - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mountain_arr.get(mid) < mountain_arr.get(mid + 1):
            lo = mid + 1
        else:
            hi = mid
    peak = lo

    def find(lo, hi, ascending):
        while lo <= hi:
            mid = (lo + hi) // 2
            v = mountain_arr.get(mid)
            if v == target:
                return mid
            if (v < target) == ascending:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1

    i = find(0, peak, True)
    return i if i != -1 else find(peak + 1, n - 1, False)`
  },
  {
    num: 658, title: "Find K Closest Elements", slug: "find-k-closest-elements", lc: "Medium",
    topic: "binsearch",
    pattern: "Index-property split",
    level: 4,
    order: 340,
    core: false,
    teaches: "Binary search the START of the k-window: compare the distance of x to arr[mid] and to arr[mid + k].",
    learn: ["dsa_binsearch", "dsa-bs-patterns"],
    pre: [35],
    hints: [
      "The answer is a contiguous window arr[s:s+k]. Search s in [0, n - k].",
      "Compare the element leaving (arr[mid]) and the one that would enter (arr[mid + k]).",
      "If x - arr[mid] > arr[mid + k] - x, the window should slide right: lo = mid + 1; else hi = mid."
    ],
    steps: [
      "lo, hi = 0, n - k.",
      "While lo < hi: mid; if x - arr[mid] > arr[mid + k] - x: lo = mid + 1 else hi = mid.",
      "Return arr[lo:lo + k]."
    ],
    time: "O(log(n - k) + k)", space: "O(1) besides output",
    trap: "Using abs() in the comparison breaks ties and duplicates; the signed form handles them.",
    code: `def findClosestElements(arr, k, x):
    lo, hi = 0, len(arr) - k
    while lo < hi:
        mid = (lo + hi) // 2
        if x - arr[mid] > arr[mid + k] - x:
            lo = mid + 1
        else:
            hi = mid
    return arr[lo:lo + k]`
  },
  {
    num: 410, title: "Split Array Largest Sum", slug: "split-array-largest-sum", lc: "Hard",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 4,
    order: 350,
    core: true,
    teaches: "'Minimise the largest part' = binary search the cap, check greedily how many parts it needs.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [1011],
    hints: [
      "This is Ship Packages in disguise: k subarrays are k days, the largest sum is the capacity.",
      "Search cap in [max(nums), sum(nums)]; count parts greedily; ok(cap) = parts <= k."
    ],
    steps: [
      "lo, hi = max(nums), sum(nums).",
      "parts(cap): greedy, start a new part when the sum would exceed cap.",
      "First cap with parts(cap) <= k."
    ],
    time: "O(n log(sum))", space: "O(1)",
    trap: "A DP over split points works but is O(k n^2); recognising the monotone check is the key insight.",
    code: `def splitArray(nums, k):
    def parts(cap):
        cnt, cur = 1, 0
        for x in nums:
            if cur + x > cap:
                cnt += 1
                cur = 0
            cur += x
        return cnt

    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if parts(mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 1552, title: "Magnetic Force Between Two Balls", slug: "magnetic-force-between-two-balls", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 4,
    order: 360,
    core: false,
    teaches: "'Maximise the minimum gap': search the gap, place balls greedily as early as allowed.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [2226, 1011],
    hints: [
      "Sort the positions. If every gap can be at least d, can it also be at least d - 1?",
      "ok(d): put a ball at the first basket, then at each next basket at least d away; count them.",
      "Find the largest d with ok(d) (round mid up)."
    ],
    steps: [
      "Sort positions.",
      "ok(d): count = 1, last = pos[0]; for p: if p - last >= d: count += 1, last = p. Return count >= m.",
      "lo, hi = 1, pos[-1] - pos[0]; while lo < hi: mid = (lo + hi + 1) // 2; ok(mid) ? lo = mid : hi = mid - 1.",
      "Return lo."
    ],
    time: "O(n log n + n log range)", space: "O(1) besides the sort",
    trap: "Forgetting to sort the positions first.",
    code: `def maxDistance(position, m):
    position.sort()

    def ok(d):
        count, last = 1, position[0]
        for p in position:
            if p - last >= d:
                count += 1
                last = p
        return count >= m

    lo, hi = 1, position[-1] - position[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if ok(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo`
  },
  {
    num: 1802, title: "Maximum Value at a Given Index in a Bounded Array", slug: "maximum-value-at-a-given-index-in-a-bounded-array", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 4,
    order: 370,
    core: false,
    teaches: "Search the peak value; the cheapest array around it slopes down by 1 each step (never below 1), summed with arithmetic series.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [2226, 441],
    hints: [
      "If value v at index fits within maxSum, does v - 1 fit too? So search the largest v.",
      "For a given v, the smallest total puts v - 1, v - 2, ... on each side, stopping at 1s.",
      "A side with c cells: if v - 1 >= c the sum is (v-1 + v-c) * c / 2; else (v-1)*v/2 + (c - (v - 1)) ones."
    ],
    steps: [
      "side(v, c): sum of c cells descending from v - 1, floored at 1 (formula, O(1)).",
      "total(v) = v + side(v, index) + side(v, n - index - 1).",
      "Binary search the largest v in [1, maxSum] with total(v) <= maxSum."
    ],
    time: "O(log maxSum)", space: "O(1)",
    trap: "Simulating each candidate array is O(n) per check and too slow; and forgetting the floor of 1.",
    code: `def maxValue(n, index, maxSum):
    def side(v, c):
        if v - 1 >= c:
            return (v - 1 + v - c) * c // 2
        return (v - 1) * v // 2 + (c - (v - 1))

    lo, hi = 1, maxSum
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid + side(mid, index) + side(mid, n - index - 1) <= maxSum:
            lo = mid
        else:
            hi = mid - 1
    return lo`
  },
  {
    num: 668, title: "Kth Smallest Number in Multiplication Table", slug: "kth-smallest-number-in-multiplication-table", lc: "Hard",
    topic: "binsearch",
    pattern: "Kth value by counting",
    level: 4,
    order: 380,
    core: true,
    teaches: "Find the k-th smallest by searching the VALUE: row i of the table has min(v // i, n) entries <= v, so counting is cheap.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [240, 875],
    hints: [
      "Search the answer VALUE v instead of positions: the k-th number is the smallest v with at least k entries <= v. The table is too big to build.",
      "How many entries in row i (i, 2i, 3i, ... ni) are <= v? min(v // i, n).",
      "Smallest v with sum over rows >= k."
    ],
    steps: [
      "lo, hi = 1, m * n.",
      "count(v) = sum(min(v // i, n) for i in 1..m).",
      "First v with count(v) >= k."
    ],
    time: "O(m log(mn))", space: "O(1)",
    trap: "Building and sorting the table is O(mn log mn); m and n go to 3*10^4.",
    code: `def findKthNumber(m, n, k):
    lo, hi = 1, m * n
    while lo < hi:
        mid = (lo + hi) // 2
        if sum(min(mid // i, n) for i in range(1, m + 1)) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 878, title: "Nth Magical Number", slug: "nth-magical-number", lc: "Hard",
    topic: "binsearch",
    pattern: "Kth value by counting",
    level: 4,
    order: 390,
    core: false,
    teaches: "Count multiples of a or b up to x with inclusion-exclusion (x//a + x//b - x//lcm), then search x.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [668],
    hints: [
      "How many numbers <= x are divisible by a or by b? Don't double count those divisible by both.",
      "count(x) = x // a + x // b - x // lcm(a, b). It only grows with x.",
      "Smallest x with count(x) >= n; reduce modulo 10^9 + 7 at the end."
    ],
    steps: [
      "l = a * b // gcd(a, b).",
      "lo, hi = 1, n * min(a, b).",
      "First x with x//a + x//b - x//l >= n.",
      "Return x % (10**9 + 7)."
    ],
    time: "O(log(n * min(a, b)))", space: "O(1)",
    trap: "Taking the modulo inside the search breaks the ordering; only reduce the final answer.",
    code: `from math import gcd

def nthMagicalNumber(n, a, b):
    l = a * b // gcd(a, b)
    lo, hi = 1, n * min(a, b)
    while lo < hi:
        mid = (lo + hi) // 2
        if mid // a + mid // b - mid // l >= n:
            hi = mid
        else:
            lo = mid + 1
    return lo % (10**9 + 7)`
  },
  {
    num: 1901, title: "Find a Peak Element II", slug: "find-a-peak-element-ii", lc: "Medium",
    topic: "binsearch",
    pattern: "Peak / slope",
    level: 5,
    order: 400,
    core: false,
    teaches: "Peak finding in 2D: take the max of the middle row, then move toward a bigger vertical neighbour.",
    learn: ["dsa_binsearch", "dsa-bs-patterns"],
    pre: [162],
    hints: [
      "Pick the middle row and its maximum cell. It already beats its left and right neighbours.",
      "If the cell below is bigger, a peak must exist in the lower half (walk uphill); likewise above.",
      "Binary search on rows: O(n log m)."
    ],
    steps: [
      "lo, hi = 0, m - 1.",
      "While lo < hi: mid row; j = argmax of mat[mid].",
      "If mat[mid][j] < mat[mid + 1][j]: lo = mid + 1; else hi = mid.",
      "Return [lo, argmax of mat[lo]]."
    ],
    time: "O(n log m)", space: "O(1)",
    trap: "Picking any cell (not the row maximum) in the middle row breaks the left/right guarantee.",
    code: `def findPeakGrid(mat):
    lo, hi = 0, len(mat) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        j = max(range(len(mat[mid])), key=mat[mid].__getitem__)
        if mat[mid][j] < mat[mid + 1][j]:
            lo = mid + 1
        else:
            hi = mid
    j = max(range(len(mat[lo])), key=mat[lo].__getitem__)
    return [lo, j]`
  },
  {
    num: 2616, title: "Minimize the Maximum Difference of Pairs", slug: "minimize-the-maximum-difference-of-pairs", lc: "Medium",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 5,
    order: 410,
    core: false,
    teaches: "Search the max difference d; after sorting, greedily pairing adjacent elements whenever their gap <= d is optimal.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [1552],
    hints: [
      "Sort first: good pairs are always neighbours in sorted order.",
      "For a fixed d, scan left to right: if nums[i+1] - nums[i] <= d take the pair and skip both, else move on.",
      "That greedy count is monotone in d, so binary search the smallest d giving >= p pairs."
    ],
    steps: [
      "Sort nums.",
      "ok(d): i = 0, cnt = 0; while i + 1 < n: if nums[i+1] - nums[i] <= d: cnt += 1, i += 2 else i += 1. Return cnt >= p.",
      "lo, hi = 0, nums[-1] - nums[0]; first d with ok(d)."
    ],
    time: "O(n log n + n log range)", space: "O(1) besides the sort",
    trap: "Trying to prove the greedy is the hard part: taking the earliest valid pair never blocks a better solution.",
    code: `def minimizeMax(nums, p):
    nums.sort()
    n = len(nums)

    def ok(d):
        i = cnt = 0
        while i + 1 < n:
            if nums[i + 1] - nums[i] <= d:
                cnt += 1
                i += 2
            else:
                i += 1
        return cnt >= p

    lo, hi = 0, nums[-1] - nums[0]
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 2141, title: "Maximum Running Time of N Computers", slug: "maximum-running-time-of-n-computers", lc: "Hard",
    topic: "binsearch",
    pattern: "Search on the answer",
    level: 5,
    order: 420,
    core: false,
    teaches: "To run n computers for T minutes, a battery can contribute at most T minutes: feasible iff sum(min(b, T)) >= n * T.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [2187],
    hints: [
      "Search the running time T. What is the most one battery can help with in T minutes?",
      "A battery can't power two computers at once, so it gives at most min(b, T). Swapping is free, so that bound is reachable.",
      "ok(T) = sum(min(b, T)) >= n * T; the upper bound is sum(batteries) // n."
    ],
    steps: [
      "lo, hi = 0, sum(batteries) // n.",
      "ok(T): sum(min(b, T) for b in batteries) >= n * T.",
      "Largest T with ok(T): mid = (lo + hi + 1) // 2, lo = mid on success else hi = mid - 1.",
      "Return lo."
    ],
    time: "O(m log(sum / n))", space: "O(1)",
    trap: "Assuming the answer is simply sum // n: one huge battery cannot run two computers at the same time.",
    code: `def maxRunTime(n, batteries):
    lo, hi = 0, sum(batteries) // n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if sum(min(b, mid) for b in batteries) >= n * mid:
            lo = mid
        else:
            hi = mid - 1
    return lo`
  },
  {
    num: 719, title: "Find K-th Smallest Pair Distance", slug: "find-k-th-smallest-pair-distance", lc: "Hard",
    topic: "binsearch",
    pattern: "Kth value by counting",
    level: 5,
    order: 430,
    core: false,
    teaches: "Search the distance d; count pairs with gap <= d in O(n) with a sliding two-pointer over the sorted array.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [668],
    hints: [
      "There are n^2 pairs, too many to list. Search the answer value instead.",
      "After sorting, for each right end j, the pairs (i, j) with nums[j] - nums[i] <= d have i in a window that only moves right.",
      "Smallest d with count(d) >= k."
    ],
    steps: [
      "Sort nums.",
      "count(d): i = 0; for j: while nums[j] - nums[i] > d: i += 1; total += j - i.",
      "lo, hi = 0, nums[-1] - nums[0]; first d with count(d) >= k."
    ],
    time: "O(n log n + n log range)", space: "O(1) besides the sort",
    trap: "Counting with a heap of pairs is O(k log n) and k can be ~n^2/2.",
    code: `def smallestDistancePair(nums, k):
    nums.sort()

    def count(d):
        total = i = 0
        for j, x in enumerate(nums):
            while x - nums[i] > d:
                i += 1
            total += j - i
        return total

    lo, hi = 0, nums[-1] - nums[0]
    while lo < hi:
        mid = (lo + hi) // 2
        if count(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 1201, title: "Ugly Number III", slug: "ugly-number-iii", lc: "Medium",
    topic: "binsearch",
    pattern: "Kth value by counting",
    level: 5,
    order: 440,
    core: false,
    teaches: "Three-way inclusion-exclusion inside a value search: add singles, subtract pairs, add the triple.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [878],
    hints: [
      "Like Nth Magical Number, but with three divisors a, b, c.",
      "count(x) = x//a + x//b + x//c - x//lcm(a,b) - x//lcm(a,c) - x//lcm(b,c) + x//lcm(a,b,c).",
      "Smallest x with count(x) >= n; hi = 2 * 10^9 is guaranteed enough."
    ],
    steps: [
      "Precompute the three pair lcms and the triple lcm.",
      "lo, hi = 1, 2 * 10**9.",
      "First x with count(x) >= n."
    ],
    time: "O(log(2e9))", space: "O(1)",
    trap: "Forgetting to add back x // lcm(a, b, c) undercounts numbers divisible by all three.",
    code: `from math import gcd

def nthUglyNumber(n, a, b, c):
    def lcm(x, y):
        return x * y // gcd(x, y)
    ab, ac, bc = lcm(a, b), lcm(a, c), lcm(b, c)
    abc = lcm(ab, c)

    def count(x):
        return (x // a + x // b + x // c
                - x // ab - x // ac - x // bc + x // abc)

    lo, hi = 1, 2 * 10**9
    while lo < hi:
        mid = (lo + hi) // 2
        if count(mid) >= n:
            hi = mid
        else:
            lo = mid + 1
    return lo`
  },
  {
    num: 4, title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", lc: "Hard",
    topic: "binsearch",
    pattern: "Kth value by counting",
    level: 6,
    order: 450,
    core: true,
    teaches: "Binary search a cut in the shorter array so that the left parts of both arrays hold exactly half the elements, all <= the right parts.",
    learn: ["dsa_binsearch", "dsa-bs-answer"],
    pre: [33, 668],
    hints: [
      "Merging is O(m + n). Instead, think: the median splits all numbers into a left half and a right half.",
      "Choose i elements from A (binary search i over the shorter array); then B contributes j = (m + n + 1) // 2 - i.",
      "The cut is right when A[i-1] <= B[j] and B[j-1] <= A[i] (use -inf/+inf past the ends). Move i by which test fails."
    ],
    steps: [
      "Make A the shorter array; half = (m + n + 1) // 2; lo, hi = 0, m.",
      "While lo <= hi: i = (lo + hi) // 2; j = half - i; read Aleft, Aright, Bleft, Bright with infinities at the edges.",
      "If Aleft > Bright: hi = i - 1. Elif Bleft > Aright: lo = i + 1.",
      "Else: odd total -> max(Aleft, Bleft); even -> (max(lefts) + min(rights)) / 2."
    ],
    time: "O(log min(m, n))", space: "O(1)",
    trap: "Searching over the longer array lets j go negative; always binary search the shorter one.",
    code: `def findMedianSortedArrays(nums1, nums2):
    A, B = nums1, nums2
    if len(A) > len(B):
        A, B = B, A
    m, n = len(A), len(B)
    half = (m + n + 1) // 2
    INF = float('inf')
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = A[i - 1] if i > 0 else -INF
        a_right = A[i] if i < m else INF
        b_left = B[j - 1] if j > 0 else -INF
        b_right = B[j] if j < n else INF
        if a_left > b_right:
            hi = i - 1
        elif b_left > a_right:
            lo = i + 1
        else:
            if (m + n) % 2:
                return float(max(a_left, b_left))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2`
  }
);
