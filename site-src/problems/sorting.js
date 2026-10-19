// problems/sorting.js — Sorting ladder
PROBLEMS.push(
  {
    num: 1051, title: "Height Checker", slug: "height-checker", lc: "Easy",
    topic: "sorting",
    pattern: "Sort then scan",
    level: 1,
    order: 10,
    core: false,
    teaches: "sorted() gives you the expected order; compare it with the original position by position.",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [],
    hints: [
      "What order should the students be standing in?",
      "Make a sorted copy and count the positions where the original and the copy differ."
    ],
    steps: [
      "expected = sorted(heights).",
      "Return the number of i with heights[i] != expected[i]."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "heights.sort() changes the original list, so you lose what you need to compare against.",
    code: `def heightChecker(heights):
    expected = sorted(heights)
    return sum(a != b for a, b in zip(heights, expected))`
  },
  {
    num: 1502, title: "Can Make Arithmetic Progression From Sequence", slug: "can-make-arithmetic-progression-from-sequence", lc: "Easy",
    topic: "sorting",
    pattern: "Sort then scan",
    level: 1,
    order: 20,
    core: false,
    teaches: "After sorting, neighbours are the only pairs you need to compare.",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [],
    hints: [
      "If the numbers can form a progression, what order would they be in?",
      "Sort, then check that every neighbouring difference equals arr[1] - arr[0]."
    ],
    steps: [
      "arr = sorted(arr); d = arr[1] - arr[0].",
      "Return True if every arr[i + 1] - arr[i] == d."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Checking differences in the original order: [3, 5, 1] is a progression only after sorting.",
    code: `def canMakeArithmeticProgression(arr):
    arr = sorted(arr)
    d = arr[1] - arr[0]
    return all(arr[i + 1] - arr[i] == d for i in range(len(arr) - 1))`
  },
  {
    num: 2418, title: "Sort the People", slug: "sort-the-people", lc: "Easy",
    topic: "sorting",
    pattern: "Custom sort key / comparator",
    level: 1,
    order: 30,
    core: false,
    teaches: "To sort one list by another, zip them into pairs and sort the pairs.",
    learn: ["dsa_sorting", "dsa-so-python"],
    pre: [],
    hints: [
      "You need names ordered by height. How can you keep each name attached to its height while sorting?",
      "zip(heights, names) makes pairs; sort them in reverse and keep the names."
    ],
    steps: [
      "pairs = sorted(zip(heights, names), reverse=True).",
      "Return [name for _, name in pairs]."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Sorting names and heights separately breaks the link between a person and their height.",
    code: `def sortPeople(names, heights):
    return [name for _, name in sorted(zip(heights, names), reverse=True)]`
  },
  {
    num: 1365, title: "How Many Numbers Are Smaller Than the Current Number", slug: "how-many-numbers-are-smaller-than-the-current-number", lc: "Easy",
    topic: "sorting",
    pattern: "Counting / bucket sort",
    level: 1,
    order: 40,
    core: true,
    teaches: "With small values, count each value; a running total of counts tells how many are smaller.",
    learn: ["dsa_sorting", "dsa-so-counting"],
    pre: [],
    hints: [
      "Values are only 0..100. Could you count how many times each value occurs?",
      "The number of values smaller than x is the sum of counts of 0..x-1: a prefix sum over the count array."
    ],
    steps: [
      "count = [0] * 102; for x: count[x + 1] += 1.",
      "Prefix-sum count, so count[x] = how many values are < x.",
      "Return [count[x] for x in nums]."
    ],
    time: "O(n + k)", space: "O(k)",
    trap: "The double loop is O(n^2); fine here but it misses the counting idea.",
    code: `def smallerNumbersThanCurrent(nums):
    count = [0] * 102
    for x in nums:
        count[x + 1] += 1
    for v in range(1, 102):
        count[v] += count[v - 1]
    return [count[x] for x in nums]`
  },
  {
    num: 1200, title: "Minimum Absolute Difference", slug: "minimum-absolute-difference", lc: "Easy",
    topic: "sorting",
    pattern: "Sort then scan",
    level: 2,
    order: 50,
    core: true,
    teaches: "The closest pair in a sorted list is always a pair of neighbours.",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [1502],
    hints: [
      "In a sorted list, can the closest pair ever be two numbers that are not next to each other?",
      "No. So sort, take the minimum neighbour difference, then collect every neighbour pair with that difference."
    ],
    steps: [
      "arr = sorted(arr).",
      "best = min(b - a for neighbouring a, b).",
      "Return [[a, b] for neighbours with b - a == best]."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Comparing all pairs is O(n^2); only neighbours matter after sorting.",
    code: `def minimumAbsDifference(arr):
    arr = sorted(arr)
    best = min(b - a for a, b in zip(arr, arr[1:]))
    return [[a, b] for a, b in zip(arr, arr[1:]) if b - a == best]`
  },
  {
    num: 976, title: "Largest Perimeter Triangle", slug: "largest-perimeter-triangle", lc: "Easy",
    topic: "sorting",
    pattern: "Sort then scan",
    level: 2,
    order: 60,
    core: true,
    teaches: "Sort descending and test consecutive triples: the first valid one is the largest perimeter.",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [1502],
    hints: [
      "Triangle rule: the longest side must be shorter than the other two added together.",
      "For a fixed longest side, the best partners are the next two largest values.",
      "Sort descending; return the first a, b, c (consecutive) with a < b + c."
    ],
    steps: [
      "nums = sorted(nums, reverse=True).",
      "For i in range(n - 2): if nums[i] < nums[i+1] + nums[i+2], return their sum.",
      "Return 0."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Using <= instead of <: sides 1, 1, 2 make a flat line, not a triangle.",
    code: `def largestPerimeter(nums):
    nums = sorted(nums, reverse=True)
    for i in range(len(nums) - 2):
        if nums[i] < nums[i + 1] + nums[i + 2]:
            return nums[i] + nums[i + 1] + nums[i + 2]
    return 0`
  },
  {
    num: 628, title: "Maximum Product of Three Numbers", slug: "maximum-product-of-three-numbers", lc: "Easy",
    topic: "sorting",
    pattern: "Sort then scan",
    level: 2,
    order: 70,
    core: false,
    teaches: "After sorting, the extremes at both ends hold every candidate answer.",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [1502],
    hints: [
      "If all numbers were positive, which three would you pick?",
      "Two large negatives multiply to a large positive. Which other triple could win?",
      "Answer = max(last three product, first two * last)."
    ],
    steps: [
      "nums = sorted(nums).",
      "Return max(nums[-1] * nums[-2] * nums[-3], nums[0] * nums[1] * nums[-1])."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Taking only the three largest misses [-10, -10, 1, 2, 3] where -10 * -10 * 3 wins.",
    code: `def maximumProduct(nums):
    nums = sorted(nums)
    return max(nums[-1] * nums[-2] * nums[-3], nums[0] * nums[1] * nums[-1])`
  },
  {
    num: 1636, title: "Sort Array by Increasing Frequency", slug: "sort-array-by-increasing-frequency", lc: "Easy",
    topic: "sorting",
    pattern: "Custom sort key / comparator",
    level: 2,
    order: 80,
    core: true,
    teaches: "Mix directions in a tuple key by negating a number: (count, -value).",
    learn: ["dsa_sorting", "dsa-so-python"],
    pre: [1356],
    hints: [
      "Primary: frequency ascending. Ties: value descending.",
      "Count with a Counter, then sort with key=lambda x: (count[x], -x)."
    ],
    steps: [
      "count = Counter(nums).",
      "Return sorted(nums, key=lambda x: (count[x], -x))."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Using reverse=True flips both fields; negate only the field that should go descending.",
    code: `def frequencySort(nums):
    count = Counter(nums)
    return sorted(nums, key=lambda x: (count[x], -x))`
  },
  {
    num: 1122, title: "Relative Sort Array", slug: "relative-sort-array", lc: "Easy",
    topic: "sorting",
    pattern: "Custom sort key / comparator",
    level: 2,
    order: 90,
    core: false,
    teaches: "A rank dict turns 'custom order' into a number you can sort by.",
    learn: ["dsa_sorting", "dsa-so-python"],
    pre: [1356],
    hints: [
      "Elements of arr2 go first, in arr2's order. Give each a rank: its index in arr2.",
      "Everything else goes last in ascending order: rank len(arr2), tie-break by value.",
      "key=lambda x: (rank.get(x, len(arr2)), x)."
    ],
    steps: [
      "rank = {x: i for i, x in enumerate(arr2)}.",
      "Return sorted(arr1, key=lambda x: (rank.get(x, len(arr2)), x))."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Calling arr2.index(x) inside the key is O(m) per call; build the rank dict once.",
    code: `def relativeSortArray(arr1, arr2):
    rank = {x: i for i, x in enumerate(arr2)}
    return sorted(arr1, key=lambda x: (rank.get(x, len(arr2)), x))`
  },
  {
    num: 791, title: "Custom Sort String", slug: "custom-sort-string", lc: "Medium",
    topic: "sorting",
    pattern: "Custom sort key / comparator",
    level: 2,
    order: 100,
    core: false,
    teaches: "With a custom alphabet you can skip comparisons: count letters, then emit them in the given order.",
    learn: ["dsa_sorting", "dsa-so-counting"],
    pre: [1122],
    hints: [
      "Sorting by rank works (like Relative Sort Array). Can you avoid sorting altogether?",
      "Count the letters of s. Walk order and output each letter count times.",
      "Letters not in order can go anywhere; append them at the end."
    ],
    steps: [
      "count = Counter(s).",
      "For ch in order: append ch * count.pop(ch, 0).",
      "Append the remaining letters with their counts.",
      "Join and return."
    ],
    time: "O(n + 26)", space: "O(26)",
    trap: "Forgetting letters of s that are not in order; they must still appear.",
    code: `def customSortString(order, s):
    count = Counter(s)
    out = [ch * count.pop(ch, 0) for ch in order]
    out.extend(ch * c for ch, c in count.items())
    return "".join(out)`
  },
  {
    num: 922, title: "Sort Array By Parity II", slug: "sort-array-by-parity-ii", lc: "Easy",
    topic: "sorting",
    pattern: "Partition (quick sort style)",
    level: 2,
    order: 110,
    core: false,
    teaches: "Two pointers that each walk their own parity of indices fix misplaced pairs with one swap.",
    learn: ["dsa_sorting", "dsa-so-quick"],
    pre: [905],
    hints: [
      "An odd number at an even index means somewhere an even number sits at an odd index.",
      "Walk i over even indices. When nums[i] is odd, move j over odd indices until nums[j] is even, then swap."
    ],
    steps: [
      "j = 1.",
      "For i in 0, 2, 4, ...: if nums[i] is odd, advance j by 2 while nums[j] is odd, then swap nums[i], nums[j].",
      "Return nums."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Resetting j for each i makes it O(n^2); j only moves forward.",
    code: `def sortArrayByParityII(nums):
    j = 1
    for i in range(0, len(nums), 2):
        if nums[i] % 2:
            while nums[j] % 2:
                j += 2
            nums[i], nums[j] = nums[j], nums[i]
    return nums`
  },
  {
    num: 2161, title: "Partition Array According to Given Pivot", slug: "partition-array-according-to-given-pivot", lc: "Medium",
    topic: "sorting",
    pattern: "Partition (quick sort style)",
    level: 2,
    order: 120,
    core: false,
    teaches: "A stable three-way partition: less, equal, greater, each keeping input order.",
    learn: ["dsa_sorting", "dsa-so-quick"],
    pre: [905],
    hints: [
      "Three groups: < pivot, == pivot, > pivot. Relative order inside a group must not change.",
      "In-place swapping is not stable. Make three passes (or three lists) instead."
    ],
    steps: [
      "less = [x < pivot], equal = [x == pivot], more = [x > pivot], each in input order.",
      "Return less + equal + more."
    ],
    time: "O(n)", space: "O(n)",
    trap: "The in-place Dutch flag swap is unstable and fails this problem's order requirement.",
    code: `def pivotArray(nums, pivot):
    less = [x for x in nums if x < pivot]
    equal = [x for x in nums if x == pivot]
    more = [x for x in nums if x > pivot]
    return less + equal + more`
  },
  {
    num: 1985, title: "Find the Kth Largest Integer in the Array", slug: "find-the-kth-largest-integer-in-the-array", lc: "Medium",
    topic: "sorting",
    pattern: "Quickselect / kth element",
    level: 2,
    order: 130,
    core: false,
    teaches: "Numbers as strings compare by (length, text), and the kth largest is index k - 1 after sorting descending.",
    learn: ["dsa_sorting", "dsa-so-python"],
    pre: [1356],
    hints: [
      "The numbers can be 100 digits long. Comparing as strings: '9' > '10' is wrong. What fixes it?",
      "With no leading zeros, a longer string is a bigger number. Sort by (len(s), s).",
      "Sort descending with that key and return element k - 1."
    ],
    steps: [
      "nums.sort(key=lambda s: (len(s), s), reverse=True).",
      "Return nums[k - 1]."
    ],
    time: "O(n log n * L)", space: "O(n)",
    trap: "Plain string sort puts '9' after '10'; converting to int also works in Python but not in most languages.",
    code: `def kthLargestNumber(nums, k):
    nums = sorted(nums, key=lambda s: (len(s), s), reverse=True)
    return nums[k - 1]`
  },
  {
    num: 1833, title: "Maximum Ice Cream Bars", slug: "maximum-ice-cream-bars", lc: "Medium",
    topic: "sorting",
    pattern: "Counting / bucket sort",
    level: 2,
    order: 140,
    core: false,
    teaches: "Counting sort lets a greedy 'cheapest first' run in O(n + max) instead of O(n log n).",
    learn: ["dsa_sorting", "dsa-so-counting"],
    pre: [1365],
    hints: [
      "To buy the most bars, which bars should you buy first?",
      "The cheapest. The problem asks you to avoid sort(): count how many bars have each price.",
      "Walk prices upward; at price p buy min(count[p], coins // p) bars; stop when you can't afford all of them."
    ],
    steps: [
      "count[c] += 1 for each cost.",
      "For price p ascending with count k > 0: take = min(k, coins // p); bars += take; coins -= take * p.",
      "If take < k stop.",
      "Return bars."
    ],
    time: "O(n + max cost)", space: "O(max cost)",
    trap: "Continuing after you could not afford a price is pointless; every later price is higher.",
    code: `def maxIceCream(costs, coins):
    count = [0] * (max(costs) + 1)
    for c in costs:
        count[c] += 1
    bars = 0
    for price, k in enumerate(count):
        if k == 0:
            continue
        take = min(k, coins // price)
        bars += take
        coins -= take * price
        if take < k:
            break
    return bars`
  },
  {
    num: 451, title: "Sort Characters By Frequency", slug: "sort-characters-by-frequency", lc: "Medium",
    topic: "sorting",
    pattern: "Counting / bucket sort",
    level: 2,
    order: 150,
    core: false,
    teaches: "Bucket by frequency: bucket[f] lists the characters that appear f times; read buckets from high to low.",
    learn: ["dsa_sorting", "dsa-so-counting"],
    pre: [1365, 387],
    hints: [
      "First count every character. Then you need characters ordered by count.",
      "A count is at most len(s), so make buckets 0..len(s) and drop each character into bucket[count].",
      "Walk buckets from high to low, writing each character count times."
    ],
    steps: [
      "count = Counter(s); buckets = [[] for _ in range(len(s) + 1)].",
      "For ch, c: buckets[c].append(ch).",
      "For c from len(s) down to 1: for ch in buckets[c]: output ch * c.",
      "Join and return."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Outputting each character once instead of count times.",
    code: `def frequencySort(s):
    count = Counter(s)
    buckets = [[] for _ in range(len(s) + 1)]
    for ch, c in count.items():
        buckets[c].append(ch)
    out = []
    for c in range(len(s), 0, -1):
        for ch in buckets[c]:
            out.append(ch * c)
    return "".join(out)`
  },
  {
    num: 912, title: "Sort an Array", slug: "sort-an-array", lc: "Medium",
    topic: "sorting",
    pattern: "Merge sort and counting pairs",
    level: 2,
    order: 160,
    core: true,
    teaches: "Merge sort: split in half, sort each half, merge two sorted lists with two pointers. O(n log n) always.",
    learn: ["dsa_sorting", "dsa-so-merge"],
    pre: [],
    hints: [
      "You may not use sorted(). Which O(n log n) sort is guaranteed (no bad pivot cases)?",
      "Merge sort: a list of length <= 1 is sorted; otherwise sort both halves recursively.",
      "Merge: compare the fronts of the two halves, take the smaller, and append whatever is left at the end."
    ],
    steps: [
      "If len(nums) <= 1 return nums.",
      "left = sortArray(first half), right = sortArray(second half).",
      "Merge with i, j pointers (<= keeps it stable), then extend with the leftovers.",
      "Return merged."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Quick sort with a fixed pivot hits O(n^2) on LeetCode's sorted/equal test cases and times out.",
    code: `def sortArray(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left, right = sortArray(nums[:mid]), sortArray(nums[mid:])
    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged`
  },
  {
    num: 945, title: "Minimum Increment to Make Array Unique", slug: "minimum-increment-to-make-array-unique", lc: "Medium",
    topic: "sorting",
    pattern: "Sort then scan",
    level: 3,
    order: 170,
    core: true,
    teaches: "Sort, then push each value up to the smallest value not yet taken; sorting makes the greedy obvious.",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [1200],
    hints: [
      "After sorting, each number only has to be bigger than the one placed before it.",
      "Track nxt = smallest value still free. If x < nxt, raise x to nxt (cost nxt - x).",
      "Then nxt = (the value you used) + 1."
    ],
    steps: [
      "nums = sorted(nums); moves = 0; nxt = 0.",
      "For x in nums: if x < nxt: moves += nxt - x; nxt += 1. Else nxt = x + 1.",
      "Return moves."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Incrementing duplicates one step at a time and rechecking is O(n^2) or worse.",
    code: `def minIncrementForUnique(nums):
    nums = sorted(nums)
    moves = 0
    nxt = 0
    for x in nums:
        if x < nxt:
            moves += nxt - x
            nxt += 1
        else:
            nxt = x + 1
    return moves`
  },
  {
    num: 954, title: "Array of Doubled Pairs", slug: "array-of-doubled-pairs", lc: "Medium",
    topic: "sorting",
    pattern: "Sort then scan",
    level: 3,
    order: 180,
    core: false,
    teaches: "Process values by absolute value: the smallest one left can only be the half of a pair, never the double.",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [1200],
    hints: [
      "Look at the smallest number by absolute value. Can it be the 'double' in a pair?",
      "No, so it must be matched with 2x. Process values in order of abs(x) using a Counter.",
      "For each x: count[2x] must be at least count[x]; use them up. Zeros pair with zeros, so their count must be even."
    ],
    steps: [
      "count = Counter(arr).",
      "For x in sorted(count, key=abs): if x == 0, its count must be even; continue.",
      "If count[x] > count[2x] return False; else count[2x] -= count[x].",
      "Return True."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Sorting by plain value breaks for negatives: -2 is the half of -4, so the order must be by abs(x), not by x.",
    code: `def canReorderDoubled(arr):
    count = Counter(arr)
    for x in sorted(count, key=abs):
        if x == 0:
            if count[0] % 2:
                return False
            continue
        if count[x] > count[2 * x]:
            return False
        count[2 * x] -= count[x]
    return True`
  },
  {
    num: 937, title: "Reorder Data in Log Files", slug: "reorder-data-in-log-files", lc: "Medium",
    topic: "sorting",
    pattern: "Custom sort key / comparator",
    level: 3,
    order: 190,
    core: false,
    teaches: "One key function can send items to different groups; a stable sort keeps the untouched group in input order.",
    learn: ["dsa_sorting", "dsa-so-python"],
    pre: [1356],
    hints: [
      "Letter-logs come before digit-logs. Digit-logs keep their original order.",
      "Write key(log): split off the identifier; letter-logs get (0, content, identifier), digit-logs get (1,).",
      "Python's sort is stable, so all digit-logs (same key) stay in input order."
    ],
    steps: [
      "key(log): ident, rest = log.split(' ', 1).",
      "If rest[0] is a letter return (0, rest, ident); else return (1,).",
      "Return sorted(logs, key=key)."
    ],
    time: "O(n L log n)", space: "O(n L)",
    trap: "Splitting on every space and comparing only the first word of content gives wrong ties.",
    code: `def reorderLogFiles(logs):
    def key(log):
        ident, rest = log.split(" ", 1)
        if rest[0].isalpha():
            return (0, rest, ident)
        return (1,)
    return sorted(logs, key=key)`
  },
  {
    num: 179, title: "Largest Number", slug: "largest-number", lc: "Medium",
    topic: "sorting",
    pattern: "Custom sort key / comparator",
    level: 3,
    order: 200,
    core: true,
    teaches: "When the right order depends on pairs, write a comparator: a goes first if a + b > b + a as strings.",
    learn: ["dsa_sorting", "dsa-so-python"],
    pre: [1356],
    hints: [
      "Plain numeric or string order fails: 9 should beat 34, but 3 should beat 30. What decides it?",
      "Compare two pieces by trying both orders: is a + b bigger than b + a?",
      "Sort the strings with functools.cmp_to_key on that rule, join, and turn '000' into '0'."
    ],
    steps: [
      "strs = [str(x) for x in nums].",
      "Sort with cmp(a, b) = -1 if a + b > b + a, 1 if smaller, else 0.",
      "res = ''.join(strs).",
      "Return '0' if res starts with '0', else res."
    ],
    time: "O(n log n * L)", space: "O(n L)",
    trap: "All zeros gives '000'; the answer must be '0'.",
    code: `from functools import cmp_to_key

def largestNumber(nums):
    def cmp(a, b):
        if a + b > b + a:
            return -1
        if a + b < b + a:
            return 1
        return 0
    strs = sorted((str(x) for x in nums), key=cmp_to_key(cmp))
    res = "".join(strs)
    return "0" if res[0] == "0" else res`
  },
  {
    num: 1366, title: "Rank Teams by Votes", slug: "rank-teams-by-votes", lc: "Medium",
    topic: "sorting",
    pattern: "Custom sort key / comparator",
    level: 3,
    order: 210,
    core: false,
    teaches: "A whole list of counts can be a sort key; lists compare element by element like words in a dictionary.",
    learn: ["dsa_sorting", "dsa-so-python"],
    pre: [1636],
    hints: [
      "Team A beats B if it has more 1st-place votes; tie -> compare 2nd-place votes; and so on.",
      "Build count[team] = [votes at position 0, position 1, ...].",
      "Sort teams by key ([-c for c in count[t]], t): more votes first, then alphabetical."
    ],
    steps: [
      "count[t] = [0] * n for each team.",
      "For each vote string, count[t][i] += 1 for team t at position i.",
      "Return ''.join(sorted(teams, key=lambda t: ([-c for c in count[t]], t)))."
    ],
    time: "O(V n + n^2 log n)", space: "O(n^2)",
    trap: "reverse=True would also reverse the alphabetical tie-break; negate the counts instead.",
    code: `def rankTeams(votes):
    n = len(votes[0])
    count = {t: [0] * n for t in votes[0]}
    for v in votes:
        for i, t in enumerate(v):
            count[t][i] += 1
    return "".join(sorted(votes[0], key=lambda t: ([-c for c in count[t]], t)))`
  },
  {
    num: 75, title: "Sort Colors", slug: "sort-colors", lc: "Medium",
    topic: "sorting",
    pattern: "Partition (quick sort style)",
    level: 3,
    order: 220,
    core: true,
    teaches: "Dutch national flag: three pointers split the array into 0s, 1s, unknown and 2s in one pass.",
    learn: ["dsa_sorting", "dsa-so-quick"],
    pre: [905],
    hints: [
      "Counting 0s, 1s, 2s then overwriting works in two passes. Can one pass do it?",
      "Keep zones: [0, low) are 0s, [low, mid) are 1s, (high, end] are 2s, [mid, high] unknown.",
      "nums[mid] == 0: swap with low, move both. == 1: mid += 1. == 2: swap with high, high -= 1, but don't move mid."
    ],
    steps: [
      "low = mid = 0, high = n - 1.",
      "While mid <= high: 0 -> swap(low, mid), low += 1, mid += 1.",
      "1 -> mid += 1.",
      "2 -> swap(mid, high), high -= 1 (recheck the swapped-in value)."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Advancing mid after swapping with high skips the unexamined value that came from high.",
    code: `def sortColors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1`
  },
  {
    num: 215, title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", lc: "Medium",
    topic: "sorting",
    pattern: "Quickselect / kth element",
    level: 3,
    order: 230,
    core: true,
    teaches: "Quickselect: partition around a random pivot and keep only the side that contains index k.",
    learn: ["dsa_sorting", "dsa-so-select"],
    pre: [75, 1985],
    hints: [
      "Sorting is O(n log n). After one partition, the pivot is at its final index p. Which side holds your answer?",
      "kth largest = index n - k in ascending order. If that index is left of the pivot block, go left; right, go right.",
      "Use a random pivot and a 3-way partition (<, ==, >) so duplicates don't make it O(n^2)."
    ],
    steps: [
      "target = n - k; lo, hi = 0, n - 1.",
      "Pick a random pivot in nums[lo..hi]; 3-way partition into < pivot [lo, lt), == [lt, gt], > (gt, hi].",
      "If target < lt: hi = lt - 1. If target > gt: lo = gt + 1. Else return pivot."
    ],
    time: "O(n) average, O(n^2) worst", space: "O(1)",
    trap: "A fixed first/last pivot turns sorted input into O(n^2); an array of equal values does too without the 3-way split.",
    code: `import random

def findKthLargest(nums, k):
    target = len(nums) - k
    lo, hi = 0, len(nums) - 1
    while True:
        pivot = nums[random.randint(lo, hi)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if nums[i] < pivot:
                nums[lt], nums[i] = nums[i], nums[lt]
                lt += 1
                i += 1
            elif nums[i] > pivot:
                nums[i], nums[gt] = nums[gt], nums[i]
                gt -= 1
            else:
                i += 1
        if target < lt:
            hi = lt - 1
        elif target > gt:
            lo = gt + 1
        else:
            return pivot`
  },
  {
    num: 462, title: "Minimum Moves to Equal Array Elements II", slug: "minimum-moves-to-equal-array-elements-ii", lc: "Medium",
    topic: "sorting",
    pattern: "Quickselect / kth element",
    level: 3,
    order: 240,
    core: false,
    teaches: "The sum of distances |x - m| is smallest when m is the median, and quickselect finds the median in O(n).",
    learn: ["dsa_sorting", "dsa-so-select"],
    pre: [215],
    hints: [
      "Every element moves to the same target m. Which m minimises the total distance?",
      "The median: moving m toward the median always lowers the total.",
      "Find the median with quickselect (index n // 2), then sum abs(x - median)."
    ],
    steps: [
      "m = quickselect(nums, n // 2) (kth smallest, 0-based).",
      "Return sum(abs(x - m) for x in nums)."
    ],
    time: "O(n) average", space: "O(n)",
    trap: "Using the mean instead of the median gives the wrong answer for skewed data like [1, 0, 0, 8, 6].",
    code: `import random

def minMoves2(nums):
    a = nums[:]
    target = len(a) // 2
    lo, hi = 0, len(a) - 1
    while True:
        pivot = a[random.randint(lo, hi)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if a[i] < pivot:
                a[lt], a[i] = a[i], a[lt]
                lt += 1
                i += 1
            elif a[i] > pivot:
                a[i], a[gt] = a[gt], a[i]
                gt -= 1
            else:
                i += 1
        if target < lt:
            hi = lt - 1
        elif target > gt:
            lo = gt + 1
        else:
            break
    return sum(abs(x - pivot) for x in nums)`
  },
  {
    num: 274, title: "H-Index", slug: "h-index", lc: "Medium",
    topic: "sorting",
    pattern: "Counting / bucket sort",
    level: 3,
    order: 250,
    core: true,
    teaches: "Cap values at n and count them; scanning h from n down with a running total finds the answer in O(n).",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [1365],
    hints: [
      "h-index h: at least h papers have at least h citations. Sorted descending, how would you find it?",
      "h can't exceed n, so a paper with 1000 citations counts the same as one with n. Bucket by min(c, n).",
      "Walk h from n down to 0 adding bucket counts; the first h where papers >= h is the answer."
    ],
    steps: [
      "count = [0] * (n + 1); count[min(c, n)] += 1 for each paper.",
      "papers = 0; for h from n down to 0: papers += count[h]; if papers >= h return h."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Off-by-one in the sorted version: with citations sorted descending, h is the largest i with citations[i - 1] >= i.",
    code: `def hIndex(citations):
    n = len(citations)
    count = [0] * (n + 1)
    for c in citations:
        count[min(c, n)] += 1
    papers = 0
    for h in range(n, -1, -1):
        papers += count[h]
        if papers >= h:
            return h`
  },
  {
    num: 148, title: "Sort List", slug: "sort-list", lc: "Medium",
    topic: "sorting",
    pattern: "Merge sort and counting pairs",
    level: 3,
    order: 260,
    core: false,
    teaches: "Merge sort suits linked lists: find the middle with slow/fast pointers, cut, sort halves, merge by relinking.",
    learn: ["dsa_sorting", "dsa-so-merge"],
    pre: [912],
    hints: [
      "Quick sort needs random access; linked lists don't have it. Which sort only needs sequential access?",
      "Merge sort. Find the middle with slow/fast pointers and cut the list into two halves.",
      "Sort both halves recursively and merge them with a dummy head, relinking nodes instead of copying."
    ],
    steps: [
      "If head is None or has one node, return it.",
      "slow = head, fast = head.next; advance until fast ends; mid = slow.next; slow.next = None.",
      "left = sortList(head), right = sortList(mid).",
      "Merge with a dummy node and a tail pointer; attach the leftover list.",
      "Return dummy.next."
    ],
    time: "O(n log n)", space: "O(log n) recursion",
    trap: "Starting fast at head (not head.next) never splits a 2-node list, causing infinite recursion.",
    code: `def sortList(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    mid = slow.next
    slow.next = None
    left, right = sortList(head), sortList(mid)
    dummy = tail = ListNode()
    while left and right:
        if left.val <= right.val:
            tail.next = left
            left = left.next
        else:
            tail.next = right
            right = right.next
        tail = tail.next
    tail.next = left or right
    return dummy.next`
  },
  {
    num: 2948, title: "Make Lexicographically Smallest Array by Swapping Elements", slug: "make-lexicographically-smallest-array-by-swapping-elements", lc: "Medium",
    topic: "sorting",
    pattern: "Sort then scan",
    level: 4,
    order: 270,
    core: false,
    teaches: "Sort indices by value; a run of sorted values with gaps <= limit forms one swappable group, then sort each group's positions.",
    learn: ["dsa_sorting", "dsa-so-patterns"],
    pre: [945, 2418],
    hints: [
      "Swaps chain: if a~b and b~c you can rearrange all three freely. Which values end up connected?",
      "In sorted order, values belong to the same group as long as each gap to the next value is at most limit.",
      "For each group, put its values (ascending) into its original positions (ascending)."
    ],
    steps: [
      "order = indices sorted by nums[i].",
      "Walk order; whenever the next value jumps by more than limit, close the current group.",
      "For a group: res[p] = v for p in sorted(positions) paired with values in ascending order.",
      "Return res."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Grouping by comparing with the group's first value instead of the previous value misses chained swaps.",
    code: `def lexicographicallySmallestArray(nums, limit):
    n = len(nums)
    order = sorted(range(n), key=lambda i: nums[i])
    res = [0] * n
    start = 0
    for end in range(n):
        if end == n - 1 or nums[order[end + 1]] - nums[order[end]] > limit:
            group = order[start:end + 1]
            for pos, i in zip(sorted(group), group):
                res[pos] = nums[i]
            start = end + 1
    return res`
  },
  {
    num: 406, title: "Queue Reconstruction by Height", slug: "queue-reconstruction-by-height", lc: "Medium",
    topic: "sorting",
    pattern: "Custom sort key / comparator",
    level: 4,
    order: 280,
    core: false,
    teaches: "Sort tallest first (k ascending), then insert each person at index k: shorter people never disturb taller ones.",
    learn: ["dsa_sorting", "dsa-so-python"],
    pre: [1636],
    hints: [
      "Shorter people are invisible to a taller person's k. Who should you place first?",
      "Process tallest first. When you place someone, everyone already placed is at least as tall.",
      "Sort by (-h, k) and insert each person at position k of the result list."
    ],
    steps: [
      "people.sort(key=lambda p: (-p[0], p[1])).",
      "queue = [].",
      "For p in people: queue.insert(p[1], p).",
      "Return queue."
    ],
    time: "O(n^2)", space: "O(n)",
    trap: "Sorting equal heights by k descending puts them in the wrong relative order.",
    code: `def reconstructQueue(people):
    people = sorted(people, key=lambda p: (-p[0], p[1]))
    queue = []
    for p in people:
        queue.insert(p[1], p)
    return queue`
  },
  {
    num: 1738, title: "Find Kth Largest XOR Coordinate Value", slug: "find-kth-largest-xor-coordinate-value", lc: "Medium",
    topic: "sorting",
    pattern: "Quickselect / kth element",
    level: 4,
    order: 290,
    core: false,
    teaches: "Combine a 2D prefix (here XOR) to build all values, then quickselect the kth largest.",
    learn: ["dsa_sorting", "dsa-so-select"],
    pre: [215],
    hints: [
      "Value (a, b) is the XOR of the whole rectangle from (0, 0) to (a, b). Can you build it from neighbours?",
      "pre[i][j] = pre[i-1][j] ^ pre[i][j-1] ^ pre[i-1][j-1] ^ matrix[i][j] (the overlap cancels like in 2D prefix sums).",
      "Collect all m*n values and quickselect index m*n - k."
    ],
    steps: [
      "Build pre with one extra row and column of zeros using the XOR recurrence; collect every value.",
      "Quickselect the (len - k)th smallest value (random pivot, 3-way partition).",
      "Return it."
    ],
    time: "O(m n) average", space: "O(m n)",
    trap: "Forgetting pre[i-1][j-1]: both neighbours include that corner, so it cancels out and must be XOR-ed back in.",
    code: `import random

def kthLargestValue(matrix, k):
    m, n = len(matrix), len(matrix[0])
    pre = [[0] * (n + 1) for _ in range(m + 1)]
    vals = []
    for i in range(m):
        for j in range(n):
            pre[i + 1][j + 1] = pre[i][j + 1] ^ pre[i + 1][j] ^ pre[i][j] ^ matrix[i][j]
            vals.append(pre[i + 1][j + 1])
    target = len(vals) - k
    lo, hi = 0, len(vals) - 1
    while True:
        pivot = vals[random.randint(lo, hi)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if vals[i] < pivot:
                vals[lt], vals[i] = vals[i], vals[lt]
                lt += 1
                i += 1
            elif vals[i] > pivot:
                vals[i], vals[gt] = vals[gt], vals[i]
                gt -= 1
            else:
                i += 1
        if target < lt:
            hi = lt - 1
        elif target > gt:
            lo = gt + 1
        else:
            return pivot`
  },
  {
    num: 220, title: "Contains Duplicate III", slug: "contains-duplicate-iii", lc: "Hard",
    topic: "sorting",
    pattern: "Counting / bucket sort",
    level: 4,
    order: 300,
    core: false,
    teaches: "Buckets of width valueDiff + 1: two values in one bucket are close enough; only neighbour buckets need a check.",
    learn: ["dsa_sorting", "dsa-so-counting"],
    pre: [219, 1365],
    hints: [
      "Contains Duplicate II handled the index window. Now values only need to be within valueDiff.",
      "Use buckets of width w = valueDiff + 1 (bucket id x // w). Any two values in the same bucket differ by at most valueDiff.",
      "Keep at most one value per bucket for the last indexDiff indices; check the same bucket and both neighbours, then evict nums[i - indexDiff]."
    ],
    steps: [
      "w = valueDiff + 1; buckets = {}.",
      "For i, x: b = x // w. If b in buckets return True.",
      "If b - 1 or b + 1 holds a value within valueDiff of x return True.",
      "buckets[b] = x; if i >= indexDiff delete the bucket of nums[i - indexDiff].",
      "Return False."
    ],
    time: "O(n)", space: "O(min(n, indexDiff))",
    trap: "With valueDiff = 0, width 0 would divide by zero; that's why the width is valueDiff + 1.",
    code: `def containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff):
    w = valueDiff + 1
    buckets = {}
    for i, x in enumerate(nums):
        b = x // w
        if b in buckets:
            return True
        if b - 1 in buckets and x - buckets[b - 1] <= valueDiff:
            return True
        if b + 1 in buckets and buckets[b + 1] - x <= valueDiff:
            return True
        buckets[b] = x
        if i >= indexDiff:
            del buckets[nums[i - indexDiff] // w]
    return False`
  },
  {
    num: 493, title: "Reverse Pairs", slug: "reverse-pairs", lc: "Hard",
    topic: "sorting",
    pattern: "Merge sort and counting pairs",
    level: 4,
    order: 310,
    core: true,
    teaches: "During merge sort, both halves are sorted, so pairs (left, right) can be counted with one moving pointer before merging.",
    learn: ["dsa_sorting", "dsa-so-merge"],
    pre: [912],
    hints: [
      "Pairs i < j: i in the left half, j in the right half, is exactly the split merge sort makes.",
      "If both halves are sorted, for each x in left the right-side values with x > 2 * y form a prefix of right.",
      "That prefix only grows as x grows, so one pointer j counts all pairs in O(n). Count first, then merge."
    ],
    steps: [
      "sort(a) returns (sorted a, count).",
      "Recursively sort and count both halves.",
      "j = 0; for x in left: while j < len(right) and x > 2 * right[j]: j += 1; count += j.",
      "Merge the halves normally; return (merged, total)."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Counting inside the merge loop with the merge condition (x > y) is wrong; the 2 * y test needs its own pass.",
    code: `def reversePairs(nums):
    def sort(a):
        if len(a) <= 1:
            return a, 0
        mid = len(a) // 2
        left, c1 = sort(a[:mid])
        right, c2 = sort(a[mid:])
        count = c1 + c2
        j = 0
        for x in left:
            while j < len(right) and x > 2 * right[j]:
                j += 1
            count += j
        merged, i, j = [], 0, 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, count
    return sort(nums)[1]`
  },
  {
    num: 324, title: "Wiggle Sort II", slug: "wiggle-sort-ii", lc: "Medium",
    topic: "sorting",
    pattern: "Quickselect / kth element",
    level: 5,
    order: 320,
    core: false,
    teaches: "Split around the median (quickselect + 3-way partition), then interleave both halves in reverse so equal medians never touch.",
    learn: ["dsa_sorting", "dsa-so-select"],
    pre: [215, 75],
    hints: [
      "Small values must sit at even indices and large values at odd indices. Where is the dividing line?",
      "The median. Find it with quickselect and 3-way partition into smaller, equal, larger.",
      "Put the smaller half (reversed) on even indices and the larger half (reversed) on odd indices; reversing keeps the median copies apart."
    ],
    steps: [
      "m = median via quickselect.",
      "s = [x < m] + [x == m] + [x > m]; half = (n + 1) // 2.",
      "nums[::2] = reversed(s[:half]); nums[1::2] = reversed(s[half:])."
    ],
    time: "O(n) average", space: "O(n)",
    trap: "Interleaving the halves without reversing them puts median copies next to each other, e.g. [4, 5, 5, 6].",
    code: `import random

def wiggleSort(nums):
    a = nums[:]
    target = len(a) // 2
    lo, hi = 0, len(a) - 1
    while True:
        pivot = a[random.randint(lo, hi)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if a[i] < pivot:
                a[lt], a[i] = a[i], a[lt]
                lt += 1
                i += 1
            elif a[i] > pivot:
                a[i], a[gt] = a[gt], a[i]
                gt -= 1
            else:
                i += 1
        if target < lt:
            hi = lt - 1
        elif target > gt:
            lo = gt + 1
        else:
            break
    m = pivot
    s = [x for x in nums if x < m] + [x for x in nums if x == m] + [x for x in nums if x > m]
    half = (len(nums) + 1) // 2
    nums[::2] = s[:half][::-1]
    nums[1::2] = s[half:][::-1]`
  },
  {
    num: 164, title: "Maximum Gap", slug: "maximum-gap", lc: "Medium",
    topic: "sorting",
    pattern: "Counting / bucket sort",
    level: 5,
    order: 330,
    core: false,
    teaches: "Pigeonhole: with buckets narrower than the average gap, the max gap is always between buckets, so keep only each bucket's min and max.",
    learn: ["dsa_sorting", "dsa-so-counting"],
    pre: [220],
    hints: [
      "n numbers span hi - lo, so some gap is at least (hi - lo) / (n - 1). Can a gap inside a small bucket ever be the maximum?",
      "Make buckets of size max(1, (hi - lo) // (n - 1)). Gaps inside a bucket are smaller than that, so they can't win.",
      "Store only min and max per bucket; the answer is the largest (bucket min - previous non-empty bucket max)."
    ],
    steps: [
      "If n < 2 or all equal return 0.",
      "size = max(1, (hi - lo) // (n - 1)); count = (hi - lo) // size + 1.",
      "Track bmin, bmax per bucket.",
      "Scan non-empty buckets: best = max(best, bmin - prev_max); prev_max = bmax.",
      "Return best."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Sorting first is O(n log n); the problem asks for linear time.",
    code: `def maximumGap(nums):
    n = len(nums)
    if n < 2:
        return 0
    lo, hi = min(nums), max(nums)
    if lo == hi:
        return 0
    size = max(1, (hi - lo) // (n - 1))
    count = (hi - lo) // size + 1
    bmin = [None] * count
    bmax = [None] * count
    for x in nums:
        b = (x - lo) // size
        bmin[b] = x if bmin[b] is None else min(bmin[b], x)
        bmax[b] = x if bmax[b] is None else max(bmax[b], x)
    best, prev = 0, lo
    for b in range(count):
        if bmin[b] is None:
            continue
        best = max(best, bmin[b] - prev)
        prev = bmax[b]
    return best`
  },
  {
    num: 315, title: "Count of Smaller Numbers After Self", slug: "count-of-smaller-numbers-after-self", lc: "Hard",
    topic: "sorting",
    pattern: "Merge sort and counting pairs",
    level: 5,
    order: 340,
    core: false,
    teaches: "Merge-sort the indices, not the values: while merging, each left element gains the number of right elements already placed before it.",
    learn: ["dsa_sorting", "dsa-so-merge"],
    pre: [493],
    hints: [
      "For each element you need how many smaller elements are to its right. Merge sort splits into left and right halves.",
      "During a merge, when a left element is placed, every right element already placed was smaller and came from its right.",
      "Sort indices (compared by nums value) so you know which original position to credit: counts[i] += j."
    ],
    steps: [
      "counts = [0] * n. sort(idx) returns idx sorted by nums value.",
      "Merge: for each i in left, first move right elements with nums[right[j]] < nums[i] into merged.",
      "counts[i] += j (right elements placed so far); then place i.",
      "Append remaining right; return counts."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Sorting values instead of indices loses track of which original position each count belongs to.",
    code: `def countSmaller(nums):
    counts = [0] * len(nums)

    def sort(idx):
        if len(idx) <= 1:
            return idx
        mid = len(idx) // 2
        left, right = sort(idx[:mid]), sort(idx[mid:])
        merged, j = [], 0
        for i in left:
            while j < len(right) and nums[right[j]] < nums[i]:
                merged.append(right[j])
                j += 1
            counts[i] += j
            merged.append(i)
        merged.extend(right[j:])
        return merged

    sort(list(range(len(nums))))
    return counts`
  },
  {
    num: 2426, title: "Number of Pairs Satisfying Inequality", slug: "number-of-pairs-satisfying-inequality", lc: "Hard",
    topic: "sorting",
    pattern: "Merge sort and counting pairs",
    level: 5,
    order: 350,
    core: false,
    teaches: "Rewrite a two-array condition into one array a[i] <= a[j] + diff, then count pairs with merge sort like Reverse Pairs.",
    learn: ["dsa_sorting", "dsa-so-merge"],
    pre: [493],
    hints: [
      "Move everything about i to one side and everything about j to the other.",
      "With a[k] = nums1[k] - nums2[k], the condition becomes a[i] <= a[j] + diff for i < j.",
      "Count with merge sort: for each y in the sorted right half, count left values x <= y + diff with a pointer that only moves forward."
    ],
    steps: [
      "a = [x - y for x, y in zip(nums1, nums2)].",
      "sort(arr) returns (sorted arr, count); recurse on halves.",
      "i = 0; for y in right: while i < len(left) and left[i] <= y + diff: i += 1; count += i.",
      "Merge and return; answer is the total."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Forgetting to transform first leaves a condition on two arrays that merge sort can't use.",
    code: `def numberOfPairs(nums1, nums2, diff):
    a = [x - y for x, y in zip(nums1, nums2)]

    def sort(arr):
        if len(arr) <= 1:
            return arr, 0
        mid = len(arr) // 2
        left, c1 = sort(arr[:mid])
        right, c2 = sort(arr[mid:])
        count = c1 + c2
        i = 0
        for y in right:
            while i < len(left) and left[i] <= y + diff:
                i += 1
            count += i
        merged, i, j = [], 0, 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, count

    return sort(a)[1]`
  },
  {
    num: 327, title: "Count of Range Sum", slug: "count-of-range-sum", lc: "Hard",
    topic: "sorting",
    pattern: "Merge sort and counting pairs",
    level: 6,
    order: 360,
    core: false,
    teaches: "Range sums are prefix differences; merge-sort the prefix array and count, for each right prefix, left prefixes inside a value window with two pointers.",
    learn: ["dsa_sorting", "dsa-so-merge"],
    pre: [493, 560],
    hints: [
      "sum(i..j) = P[j + 1] - P[i]. You need pairs of prefixes with lower <= P[b] - P[a] <= upper, a < b.",
      "In merge sort, for each y in the right half you need left prefixes x with y - upper <= x <= y - lower.",
      "Left is sorted and y only grows, so two pointers (lo, hi) both move forward; add hi - lo for each y."
    ],
    steps: [
      "P = prefix sums with a leading 0.",
      "sort(a) returns (sorted, count); recurse on halves.",
      "lo = hi = 0; for y in right: advance lo while left[lo] < y - upper; advance hi while left[hi] <= y - lower; count += hi - lo.",
      "Merge; return the total for P."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Forgetting the leading 0 prefix misses every range that starts at index 0.",
    code: `def countRangeSum(nums, lower, upper):
    pre = [0]
    for x in nums:
        pre.append(pre[-1] + x)

    def sort(a):
        if len(a) <= 1:
            return a, 0
        mid = len(a) // 2
        left, c1 = sort(a[:mid])
        right, c2 = sort(a[mid:])
        count = c1 + c2
        lo = hi = 0
        for y in right:
            while lo < len(left) and left[lo] < y - upper:
                lo += 1
            while hi < len(left) and left[hi] <= y - lower:
                hi += 1
            count += hi - lo
        merged, i, j = [], 0, 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, count

    return sort(pre)[1]`
  }
);
