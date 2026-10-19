// problems/greedy.js — Intervals & Greedy ladder
PROBLEMS.push(
{
  "num": 455,
  "title": "Assign Cookies",
  "slug": "assign-cookies",
  "lc": "Easy",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 1,
  "order": 10,
  "core": true,
  "teaches": "Sort both lists and give each child the smallest cookie that satisfies them.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [],
  "hints": [
    "Which child is easiest to satisfy, and which cookie should you spend on them?",
    "Sort greed factors and cookie sizes. Walk the cookies from small to large.",
    "If the current cookie satisfies the current (least greedy) child, both move on; otherwise try a bigger cookie."
  ],
  "steps": [
    "Sort g and s.",
    "i = 0 (child), j = 0 (cookie).",
    "While i < len(g) and j < len(s): if s[j] >= g[i], i += 1. Always j += 1.",
    "Return i."
  ],
  "time": "O(n log n + m log m)",
  "space": "O(1) extra (sorting in place)",
  "trap": "Giving a big cookie to a child who would accept a small one wastes it; always use the smallest that works.",
  "code": `def findContentChildren(g, s):
    g.sort()
    s.sort()
    i = j = 0
    while i < len(g) and j < len(s):
        if s[j] >= g[i]:
            i += 1
        j += 1
    return i`
},
{
  "num": 1710,
  "title": "Maximum Units on a Truck",
  "slug": "maximum-units-on-a-truck",
  "lc": "Easy",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 1,
  "order": 20,
  "core": false,
  "teaches": "When every slot is worth its own value and nothing else matters, fill slots with the most valuable items first.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [],
  "hints": [
    "Every box takes one slot on the truck. Which boxes should take the slots?",
    "Boxes with more units each. Sort box types by units per box, highest first.",
    "Take as many of each type as still fit, then move to the next type."
  ],
  "steps": [
    "Sort boxTypes by units descending.",
    "For each (count, units): take = min(count, truckSize); total += take * units; truckSize -= take.",
    "Stop when truckSize is 0. Return total."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Sorting by the number of boxes instead of units per box.",
  "code": `def maximumUnits(boxTypes, truckSize):
    boxTypes.sort(key=lambda b: -b[1])
    total = 0
    for count, units in boxTypes:
        take = min(count, truckSize)
        total += take * units
        truckSize -= take
        if truckSize == 0:
            break
    return total`
},
{
  "num": 1221,
  "title": "Split a String in Balanced Strings",
  "slug": "split-a-string-in-balanced-strings",
  "lc": "Easy",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 1,
  "order": 30,
  "core": false,
  "teaches": "Cut as soon as you can: whenever the running balance returns to zero, end a piece.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [],
  "hints": [
    "Keep a running balance: +1 for 'L', -1 for 'R'. What does balance 0 mean?",
    "Balance 0 means the piece since the last cut is balanced. Cutting right there never hurts later pieces.",
    "Count how many times the balance hits 0."
  ],
  "steps": [
    "bal = 0, count = 0.",
    "For c in s: bal += 1 if c == 'L' else -1; if bal == 0, count += 1.",
    "Return count."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Waiting for a longer balanced piece only reduces the count; cut at the first chance.",
  "code": `def balancedStringSplit(s):
    bal = count = 0
    for c in s:
        bal += 1 if c == "L" else -1
        if bal == 0:
            count += 1
    return count`
},
{
  "num": 860,
  "title": "Lemonade Change",
  "slug": "lemonade-change",
  "lc": "Easy",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 1,
  "order": 40,
  "core": false,
  "teaches": "When making change, use the largest note that works so the smaller, more flexible notes are kept.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [],
  "hints": [
    "You only need to count how many $5 and $10 bills you hold.",
    "A $10 needs one $5 back. A $20 needs $15 back: either $10 + $5 or three $5s.",
    "Prefer $10 + $5 for a $20, because $5 bills are needed for both kinds of change."
  ],
  "steps": [
    "five = ten = 0.",
    "Bill 5: five += 1. Bill 10: need five > 0; five -= 1, ten += 1.",
    "Bill 20: if ten and five: ten -= 1, five -= 1; elif five >= 3: five -= 3; else return False.",
    "Return True."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Giving three $5s when a $10 + $5 is available can leave you without $5s later.",
  "code": `def lemonadeChange(bills):
    five = ten = 0
    for b in bills:
        if b == 5:
            five += 1
        elif b == 10:
            if five == 0:
                return False
            five -= 1
            ten += 1
        else:
            if ten and five:
                ten -= 1
                five -= 1
            elif five >= 3:
                five -= 3
            else:
                return False
    return True`
},
{
  "num": 56,
  "title": "Merge Intervals",
  "slug": "merge-intervals",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: merge and overlap",
  "level": 1,
  "order": 50,
  "core": true,
  "teaches": "Sort by start; each interval either overlaps the last merged one (extend it) or starts a new one.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-merge"
  ],
  "pre": [],
  "hints": [
    "After sorting by start, where can an interval overlap? Only with the most recent merged interval.",
    "Compare the current start with the end of the last merged interval.",
    "If start <= last end, set last end = max(last end, end). Otherwise append a new interval."
  ],
  "steps": [
    "Sort intervals by start.",
    "res = [first interval].",
    "For each [s, e]: if s <= res[-1][1], res[-1][1] = max(res[-1][1], e); else res.append([s, e]).",
    "Return res."
  ],
  "time": "O(n log n)",
  "space": "O(n)",
  "trap": "Setting last end = e instead of max(last end, e) breaks on contained intervals like [1,10],[2,3].",
  "code": `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    res = [intervals[0][:]]
    for s, e in intervals[1:]:
        if s <= res[-1][1]:
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    return res`
},
{
  "num": 2144,
  "title": "Minimum Cost of Buying Candies With Discount",
  "slug": "minimum-cost-of-buying-candies-with-discount",
  "lc": "Easy",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 2,
  "order": 60,
  "core": false,
  "teaches": "Sort descending and group in threes: the free item in each group is as expensive as it can be.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    1710
  ],
  "hints": [
    "For every two candies bought, the third (no more expensive than both) is free. Which candies should be free?",
    "You want the free ones to be as expensive as possible. Sort prices from high to low.",
    "Pay for positions 0 and 1, get position 2 free, pay 3 and 4, get 5 free, and so on."
  ],
  "steps": [
    "Sort cost descending.",
    "Sum cost[i] for every i where i % 3 != 2.",
    "Return the sum."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Sorting ascending makes the cheap candies free instead of the expensive ones.",
  "code": `def minimumCost(cost):
    cost.sort(reverse=True)
    return sum(c for i, c in enumerate(cost) if i % 3 != 2)`
},
{
  "num": 1561,
  "title": "Maximum Number of Coins You Can Get",
  "slug": "maximum-number-of-coins-you-can-get",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 2,
  "order": 70,
  "core": false,
  "teaches": "Sort, give Bob the smallest piles, and take the second-largest of each top pair.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    2144
  ],
  "hints": [
    "Alice always takes the largest of the three, Bob the smallest. You get the middle one. Which piles should Bob get?",
    "Give Bob the n/3 smallest piles. Out of the rest, pair them from the top: Alice takes the biggest, you the next.",
    "After sorting, your piles are at indices n/3, n/3 + 2, n/3 + 4, ..."
  ],
  "steps": [
    "Sort piles.",
    "Return sum(piles[len(piles) // 3 :: 2])."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Taking every second pile from index 0 gives you some of Bob's small piles.",
  "code": `def maxCoins(piles):
    piles.sort()
    return sum(piles[len(piles) // 3::2])`
},
{
  "num": 1005,
  "title": "Maximize Sum Of Array After K Negations",
  "slug": "maximize-sum-of-array-after-k-negations",
  "lc": "Easy",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 2,
  "order": 80,
  "core": false,
  "teaches": "Flip the most negative numbers first; spend leftover flips on the smallest absolute value.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    1710
  ],
  "hints": [
    "Which flip increases the sum the most?",
    "Flipping the most negative number. Sort and flip negatives from smallest upward while you have flips.",
    "If flips remain and their count is odd, one number must be flipped back: choose the one with the smallest absolute value."
  ],
  "steps": [
    "Sort nums.",
    "For i in range(n): if k > 0 and nums[i] < 0: nums[i] = -nums[i]; k -= 1.",
    "If k is odd: subtract 2 * min(nums) from the sum.",
    "Return the sum."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "After flipping negatives the smallest value may have moved; take min of the updated array.",
  "code": `def largestSumAfterKNegations(nums, k):
    nums.sort()
    for i in range(len(nums)):
        if k > 0 and nums[i] < 0:
            nums[i] = -nums[i]
            k -= 1
    total = sum(nums)
    if k % 2 == 1:
        total -= 2 * min(nums)
    return total`
},
{
  "num": 881,
  "title": "Boats to Save People",
  "slug": "boats-to-save-people",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 2,
  "order": 90,
  "core": false,
  "teaches": "Pair the heaviest person with the lightest if they fit; otherwise the heaviest rides alone.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    455
  ],
  "hints": [
    "Each boat carries at most two people. Who is hardest to place?",
    "The heaviest person. Their best partner is the lightest person (if anyone fits, the lightest does).",
    "Sort and use two pointers: lightest at i, heaviest at j."
  ],
  "steps": [
    "Sort people; i = 0, j = n - 1, boats = 0.",
    "While i <= j: if people[i] + people[j] <= limit, i += 1. Then j -= 1; boats += 1.",
    "Return boats."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Trying to fill a boat with more than two people; the limit is two per boat.",
  "code": `def numRescueBoats(people, limit):
    people.sort()
    i, j = 0, len(people) - 1
    boats = 0
    while i <= j:
        if people[i] + people[j] <= limit:
            i += 1
        j -= 1
        boats += 1
    return boats`
},
{
  "num": 122,
  "title": "Best Time to Buy and Sell Stock II",
  "slug": "best-time-to-buy-and-sell-stock-ii",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 2,
  "order": 100,
  "core": true,
  "teaches": "With unlimited trades, collect every upward step: sum all positive day-to-day differences.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [],
  "hints": [
    "Draw prices as a line. Which parts of the line can you profit from?",
    "Every rise from one day to the next. A long rise equals the sum of its daily rises.",
    "Add max(0, prices[i] - prices[i - 1]) for each day."
  ],
  "steps": [
    "profit = 0.",
    "For i from 1: if prices[i] > prices[i - 1], profit += prices[i] - prices[i - 1].",
    "Return profit."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Trying to find the single best buy and sell day solves a different problem (121).",
  "code": `def maxProfit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit`
},
{
  "num": 57,
  "title": "Insert Interval",
  "slug": "insert-interval",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: merge and overlap",
  "level": 2,
  "order": 110,
  "core": true,
  "teaches": "Three phases on a sorted list: copy intervals before, merge the ones that overlap, copy the rest.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-merge"
  ],
  "pre": [
    56
  ],
  "hints": [
    "The list is already sorted and non-overlapping. Which intervals can the new one touch?",
    "Intervals ending before newInterval starts are untouched; same for those starting after it ends.",
    "Everything in between overlaps it: grow newInterval to cover them all, then add it once."
  ],
  "steps": [
    "i = 0; while intervals[i] ends before new starts: copy it.",
    "While intervals[i] starts <= new end: new = [min starts, max ends]; i += 1.",
    "Append new, then copy the remaining intervals."
  ],
  "time": "O(n)",
  "space": "O(n)",
  "trap": "Use <= in both overlap checks: touching intervals like [1,5] and [5,7] must merge.",
  "code": `def insert(intervals, newInterval):
    res = []
    i, n = 0, len(intervals)
    s, e = newInterval
    while i < n and intervals[i][1] < s:
        res.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= e:
        s = min(s, intervals[i][0])
        e = max(e, intervals[i][1])
        i += 1
    res.append([s, e])
    res.extend(intervals[i:])
    return res`
},
{
  "num": 1288,
  "title": "Remove Covered Intervals",
  "slug": "remove-covered-intervals",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: merge and overlap",
  "level": 2,
  "order": 120,
  "core": false,
  "teaches": "Sort by start ascending and end descending; an interval is covered exactly when its end is within the max end seen so far.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-merge"
  ],
  "pre": [
    56
  ],
  "hints": [
    "After sorting by start, which earlier interval could cover the current one?",
    "Any earlier one whose end is >= current end. Keep the largest end seen so far.",
    "Ties on start: put the longer interval first (end descending), so the shorter one is seen as covered."
  ],
  "steps": [
    "Sort by (start, -end).",
    "max_end = -1, kept = 0.",
    "For [s, e]: if e > max_end: kept += 1, max_end = e.",
    "Return kept."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Sorting only by start misses cases like [1,2] and [1,4] where the second covers the first.",
  "code": `def removeCoveredIntervals(intervals):
    intervals.sort(key=lambda x: (x[0], -x[1]))
    kept = 0
    max_end = -1
    for s, e in intervals:
        if e > max_end:
            kept += 1
            max_end = e
    return kept`
},
{
  "num": 646,
  "title": "Maximum Length of Pair Chain",
  "slug": "maximum-length-of-pair-chain",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: keep earliest end",
  "level": 2,
  "order": 130,
  "core": false,
  "teaches": "Activity selection: sort by end and keep a pair whenever it starts strictly after the last kept end.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-nonov"
  ],
  "pre": [
    56
  ],
  "hints": [
    "A chain needs b < c between consecutive pairs. Which pair should start the chain?",
    "The one that ends earliest leaves the most room. Sort by the second number.",
    "Sweep: keep a pair if its start > end of the last kept pair."
  ],
  "steps": [
    "Sort pairs by end.",
    "cur = -infinity, count = 0.",
    "For [a, b]: if a > cur: count += 1, cur = b.",
    "Return count."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "This problem needs strict a > cur; equal values do not chain.",
  "code": `def findLongestChain(pairs):
    pairs.sort(key=lambda p: p[1])
    cur = float("-inf")
    count = 0
    for a, b in pairs:
        if a > cur:
            count += 1
            cur = b
    return count`
},
{
  "num": 435,
  "title": "Non-overlapping Intervals",
  "slug": "non-overlapping-intervals",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: keep earliest end",
  "level": 2,
  "order": 140,
  "core": true,
  "teaches": "Fewest removals = n minus the most intervals you can keep; keep the one that ends earliest.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-nonov"
  ],
  "pre": [
    646
  ],
  "hints": [
    "Flip the question: what is the largest set of intervals you can keep with no overlaps?",
    "Sort by end. Keep an interval if it starts at or after the end of the last kept one.",
    "Touching is fine here ([1,2] and [2,3]), so use >=. Answer = n - kept."
  ],
  "steps": [
    "Sort by end.",
    "end = -infinity, kept = 0.",
    "For [s, e]: if s >= end: kept += 1, end = e.",
    "Return n - kept."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Sorting by start and keeping the first interval can keep one long interval that blocks many short ones.",
  "code": `def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda x: x[1])
    end = float("-inf")
    kept = 0
    for s, e in intervals:
        if s >= end:
            kept += 1
            end = e
    return len(intervals) - kept`
},
{
  "num": 729,
  "title": "My Calendar I",
  "slug": "my-calendar-i",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: count overlaps (rooms)",
  "level": 2,
  "order": 150,
  "core": false,
  "teaches": "Two half-open intervals [s1, e1) and [s2, e2) overlap exactly when s1 < e2 and s2 < e1.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-rooms"
  ],
  "pre": [
    56
  ],
  "hints": [
    "Store every accepted booking. When does a new booking clash with an old one?",
    "Draw two intervals that do not overlap: one ends before (or as) the other starts.",
    "So they overlap when start < other_end and other_start < end. Reject if any stored booking overlaps."
  ],
  "steps": [
    "self.bookings = [].",
    "book(start, end): for (s, e) in bookings: if start < e and s < end, return False.",
    "Append (start, end) and return True."
  ],
  "time": "O(n) per booking (O(n^2) total)",
  "space": "O(n)",
  "trap": "End is exclusive: [10,20) and [20,30) do not overlap, so use strict <.",
  "code": `class MyCalendar:
    def __init__(self):
        self.bookings = []

    def book(self, startTime, endTime):
        for s, e in self.bookings:
            if startTime < e and s < endTime:
                return False
        self.bookings.append((startTime, endTime))
        return True`
},
{
  "num": 55,
  "title": "Jump Game",
  "slug": "jump-game",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Reach: jump game",
  "level": 2,
  "order": 160,
  "core": true,
  "teaches": "Track the farthest index you can reach; if you ever stand beyond it, you are stuck.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-jump"
  ],
  "pre": [],
  "hints": [
    "You do not need to choose jumps. Just ask: what is the farthest index reachable so far?",
    "Walk left to right. At index i (if i is reachable), farthest = max(farthest, i + nums[i]).",
    "If i > farthest at any point, return False. If farthest >= last index, return True."
  ],
  "steps": [
    "far = 0.",
    "For i in range(n): if i > far, return False; far = max(far, i + nums[i]).",
    "Return True."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Trying every jump length with recursion is exponential; the farthest-reach scan is enough.",
  "code": `def canJump(nums):
    far = 0
    for i, x in enumerate(nums):
        if i > far:
            return False
        far = max(far, i + x)
    return True`
},
{
  "num": 1029,
  "title": "Two City Scheduling",
  "slug": "two-city-scheduling",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 3,
  "order": 170,
  "core": false,
  "teaches": "Sort by the difference between the two choices; the people who save most by going to A go to A.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    1710
  ],
  "hints": [
    "Imagine sending everyone to B first. How much does moving one person to A change the cost?",
    "It changes by a - b. You must move exactly n people to A, so pick the n with the smallest a - b.",
    "Sort by a - b; first half go to A, second half to B."
  ],
  "steps": [
    "Sort costs by a - b.",
    "Sum a for the first n people and b for the last n.",
    "Return the sum."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Sending each person to their cheaper city ignores the rule that exactly n must go to each.",
  "code": `def twoCitySchedCost(costs):
    costs.sort(key=lambda c: c[0] - c[1])
    n = len(costs) // 2
    return sum(c[0] for c in costs[:n]) + sum(c[1] for c in costs[n:])`
},
{
  "num": 870,
  "title": "Advantage Shuffle",
  "slug": "advantage-shuffle",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 3,
  "order": 180,
  "core": false,
  "teaches": "Tian Ji's horse race: beat the strongest opponent if you can, otherwise sacrifice your weakest.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    455
  ],
  "hints": [
    "Look at nums2's largest value. Should you spend your largest number on it?",
    "If your largest beats it, yes (nothing else needs it more). If not, nothing beats it: give it your smallest number.",
    "Sort nums1; process nums2 indices from largest value down, with two pointers lo and hi on nums1."
  ],
  "steps": [
    "Sort nums1; order = indices of nums2 sorted by value descending.",
    "lo = 0, hi = n - 1.",
    "For idx in order: if nums1[hi] > nums2[idx], res[idx] = nums1[hi], hi -= 1; else res[idx] = nums1[lo], lo += 1.",
    "Return res."
  ],
  "time": "O(n log n)",
  "space": "O(n)",
  "trap": "Ties do not count as wins: use strict >.",
  "code": `def advantageCount(nums1, nums2):
    a = sorted(nums1)
    order = sorted(range(len(nums2)), key=lambda i: -nums2[i])
    res = [0] * len(nums2)
    lo, hi = 0, len(a) - 1
    for idx in order:
        if a[hi] > nums2[idx]:
            res[idx] = a[hi]
            hi -= 1
        else:
            res[idx] = a[lo]
            lo += 1
    return res`
},
{
  "num": 846,
  "title": "Hand of Straights",
  "slug": "hand-of-straights",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 3,
  "order": 190,
  "core": true,
  "teaches": "The smallest remaining card must start a group, so greedily build each group from the smallest card up.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    455
  ],
  "hints": [
    "Look at the smallest card. Which group can it belong to?",
    "It can only be the first card of a group (nothing smaller is left). So that group is fixed: x, x+1, ..., x+k-1.",
    "Use a counter. For each value in sorted order with count c > 0, remove c copies of each of the next groupSize values; fail if any is short."
  ],
  "steps": [
    "If len(hand) % groupSize != 0, return False.",
    "cnt = Counter(hand).",
    "For x in sorted(cnt): c = cnt[x]; if c == 0 continue; for y in x..x+groupSize-1: if cnt[y] < c return False; cnt[y] -= c.",
    "Return True."
  ],
  "time": "O(n log n)",
  "space": "O(n)",
  "trap": "Starting groups from an arbitrary card instead of the smallest can split cards the wrong way.",
  "code": `from collections import Counter

def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize:
        return False
    cnt = Counter(hand)
    for x in sorted(cnt):
        c = cnt[x]
        if c == 0:
            continue
        for y in range(x, x + groupSize):
            if cnt[y] < c:
                return False
            cnt[y] -= c
    return True`
},
{
  "num": 1647,
  "title": "Minimum Deletions to Make Character Frequencies Unique",
  "slug": "minimum-deletions-to-make-character-frequencies-unique",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 3,
  "order": 200,
  "core": false,
  "teaches": "Process frequencies from largest to smallest and lower each one until it hits an unused value.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    455
  ],
  "hints": [
    "Count each letter. Two letters with the same count clash. What is the cheapest fix?",
    "Deleting is the only move, so a clashing count must go down. Lower it just enough to reach a free value (or 0).",
    "Keep a set of counts already used. For each count: while it is > 0 and in the set, decrease it and add 1 to the answer."
  ],
  "steps": [
    "freq = counts of each letter.",
    "used = set(), dels = 0.",
    "For f in freq: while f > 0 and f in used: f -= 1; dels += 1. Then add f to used.",
    "Return dels."
  ],
  "time": "O(n + 26^2)",
  "space": "O(26)",
  "trap": "Only positive counts need to be unique; a letter reduced to 0 is gone and never clashes.",
  "code": `from collections import Counter

def minDeletions(s):
    used = set()
    dels = 0
    for f in sorted(Counter(s).values(), reverse=True):
        while f > 0 and f in used:
            f -= 1
            dels += 1
        used.add(f)
    return dels`
},
{
  "num": 134,
  "title": "Gas Station",
  "slug": "gas-station",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 3,
  "order": 210,
  "core": true,
  "teaches": "If the tank goes negative at station i, no start between the old start and i works, so restart at i + 1.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-jump"
  ],
  "pre": [
    122
  ],
  "hints": [
    "If total gas < total cost, no start works. Otherwise exactly one start does.",
    "Drive from a start and keep the tank. If it drops below 0 at station i, could any station between the start and i be the answer?",
    "No: each of them would arrive at i with even less fuel. So set start = i + 1 and reset the tank."
  ],
  "steps": [
    "If sum(gas) < sum(cost), return -1.",
    "tank = 0, start = 0.",
    "For i: tank += gas[i] - cost[i]; if tank < 0: start = i + 1, tank = 0.",
    "Return start."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Simulating a full lap from every station is O(n^2) and too slow.",
  "code": `def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start`
},
{
  "num": 1899,
  "title": "Merge Triplets to Form Target Triplet",
  "slug": "merge-triplets-to-form-target-triplet",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 3,
  "order": 220,
  "core": false,
  "teaches": "Throw away anything that would overshoot; then check whether the safe items together reach every target value.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    122
  ],
  "hints": [
    "Merging takes the max of each coordinate, so values never go down. Which triplets can never be used?",
    "Any triplet with some value larger than the target value there would ruin that coordinate forever.",
    "Among the safe triplets, check that each coordinate's target is matched by at least one of them."
  ],
  "steps": [
    "found = [False, False, False].",
    "For each triplet t: skip if any t[k] > target[k].",
    "Otherwise for k in 0..2: if t[k] == target[k], found[k] = True.",
    "Return all(found)."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Merging every triplet blindly can push a coordinate past the target.",
  "code": `def mergeTriplets(triplets, target):
    found = [False, False, False]
    for t in triplets:
        if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
            continue
        for k in range(3):
            if t[k] == target[k]:
                found[k] = True
    return all(found)`
},
{
  "num": 986,
  "title": "Interval List Intersections",
  "slug": "interval-list-intersections",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: merge and overlap",
  "level": 3,
  "order": 230,
  "core": false,
  "teaches": "Two sorted interval lists: intersect the current pair, then drop whichever ends first.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-iv"
  ],
  "pre": [
    56
  ],
  "hints": [
    "Two intervals [a1,a2] and [b1,b2] overlap in [max(a1,b1), min(a2,b2)] if that is not empty.",
    "Use one pointer per list. After checking the pair, which interval can you discard?",
    "The one that ends first: it cannot overlap anything later in the other list."
  ],
  "steps": [
    "i = j = 0, res = [].",
    "lo = max(A[i][0], B[j][0]); hi = min(A[i][1], B[j][1]); if lo <= hi, append [lo, hi].",
    "If A[i][1] < B[j][1], i += 1 else j += 1.",
    "Repeat while both pointers are in range."
  ],
  "time": "O(m + n)",
  "space": "O(1) extra",
  "trap": "Moving both pointers after each check misses intersections with the longer interval.",
  "code": `def intervalIntersection(firstList, secondList):
    i = j = 0
    res = []
    while i < len(firstList) and j < len(secondList):
        lo = max(firstList[i][0], secondList[j][0])
        hi = min(firstList[i][1], secondList[j][1])
        if lo <= hi:
            res.append([lo, hi])
        if firstList[i][1] < secondList[j][1]:
            i += 1
        else:
            j += 1
    return res`
},
{
  "num": 452,
  "title": "Minimum Number of Arrows to Burst Balloons",
  "slug": "minimum-number-of-arrows-to-burst-balloons",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: keep earliest end",
  "level": 3,
  "order": 240,
  "core": true,
  "teaches": "Shoot each arrow at the earliest end among balloons not yet burst; it bursts every balloon that starts by then.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-nonov"
  ],
  "pre": [
    435
  ],
  "hints": [
    "Look at the balloon that ends first. An arrow must hit it somewhere in its range. Where is the best spot?",
    "At its end: that position also hits every balloon that starts at or before it.",
    "Sort by end. A new arrow is needed only when a balloon starts after the last arrow's position."
  ],
  "steps": [
    "Sort points by end.",
    "arrows = 0, pos = -infinity.",
    "For [s, e]: if s > pos: arrows += 1, pos = e.",
    "Return arrows."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Touching counts as a hit here (s == pos bursts), so the test is s > pos, not s >= pos.",
  "code": `def findMinArrowShots(points):
    points.sort(key=lambda p: p[1])
    arrows = 0
    pos = float("-inf")
    for s, e in points:
        if s > pos:
            arrows += 1
            pos = e
    return arrows`
},
{
  "num": 1094,
  "title": "Car Pooling",
  "slug": "car-pooling",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: count overlaps (rooms)",
  "level": 3,
  "order": 250,
  "core": true,
  "teaches": "Sweep line: turn each trip into +passengers at pickup and -passengers at drop-off, then check the running load.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-rooms"
  ],
  "pre": [
    729
  ],
  "hints": [
    "At which moments does the number of people in the car change?",
    "Only at pickups (+) and drop-offs (-). Record those changes in a difference array or sorted events.",
    "Walk the locations in order keeping the running sum; if it ever exceeds capacity, return False."
  ],
  "steps": [
    "diff = [0] * 1001.",
    "For (num, start, end): diff[start] += num; diff[end] -= num.",
    "load = 0; for each location: load += diff[x]; if load > capacity, return False.",
    "Return True."
  ],
  "time": "O(n + L) where L = max location",
  "space": "O(L)",
  "trap": "Passengers leave at 'to', so the minus goes at index to (not to + 1).",
  "code": `def carPooling(trips, capacity):
    diff = [0] * 1001
    for num, start, end in trips:
        diff[start] += num
        diff[end] -= num
    load = 0
    for x in diff:
        load += x
        if load > capacity:
            return False
    return True`
},
{
  "num": 2406,
  "title": "Divide Intervals Into Minimum Number of Groups",
  "slug": "divide-intervals-into-minimum-number-of-groups",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: count overlaps (rooms)",
  "level": 3,
  "order": 260,
  "core": false,
  "teaches": "The fewest groups equals the most intervals overlapping at one point; count it with sorted start/end events.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-rooms"
  ],
  "pre": [
    1094
  ],
  "hints": [
    "When are two intervals forced into different groups?",
    "When they overlap. So the answer is at least the largest number of intervals covering one point, and that many groups always suffice.",
    "Make events (left, +1) and (right + 1, -1) for these inclusive intervals, sort them, and track the running max."
  ],
  "steps": [
    "events = [(l, 1), (r + 1, -1) for each interval].",
    "Sort events (for equal positions, -1 comes before +1, which sorting tuples does).",
    "cur = best = 0; for (x, d): cur += d; best = max(best, cur).",
    "Return best."
  ],
  "time": "O(n log n)",
  "space": "O(n)",
  "trap": "Intervals are inclusive: [1,5] and [5,8] overlap, so the end event goes at right + 1.",
  "code": `def minGroups(intervals):
    events = []
    for l, r in intervals:
        events.append((l, 1))
        events.append((r + 1, -1))
    events.sort()
    cur = best = 0
    for _, d in events:
        cur += d
        best = max(best, cur)
    return best`
},
{
  "num": 45,
  "title": "Jump Game II",
  "slug": "jump-game-ii",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Reach: jump game",
  "level": 3,
  "order": 270,
  "core": true,
  "teaches": "BFS by levels without a queue: each jump covers a window of indices, and the next window ends at the farthest reach from it.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-jump"
  ],
  "pre": [
    55
  ],
  "hints": [
    "Think of jumps as levels: level 0 is index 0, level 1 is every index reachable in one jump, and so on.",
    "Keep cur_end (end of the current level) and far (farthest reach from any index in this level).",
    "When i reaches cur_end, you must jump: jumps += 1 and cur_end = far."
  ],
  "steps": [
    "jumps = 0, cur_end = 0, far = 0.",
    "For i in range(n - 1): far = max(far, i + nums[i]); if i == cur_end: jumps += 1; cur_end = far.",
    "Return jumps."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Looping to n instead of n - 1 counts an extra jump when you are already at the last index.",
  "code": `def jump(nums):
    jumps = cur_end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == cur_end:
            jumps += 1
            cur_end = far
    return jumps`
},
{
  "num": 763,
  "title": "Partition Labels",
  "slug": "partition-labels",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Reach: jump game",
  "level": 3,
  "order": 280,
  "core": true,
  "teaches": "Extend the current piece to the last occurrence of every letter inside it; cut when you reach that point.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-jump"
  ],
  "pre": [
    55
  ],
  "hints": [
    "A letter's first and last occurrence must be in the same piece. Record the last index of each letter.",
    "Walk the string keeping end = max last index of letters seen in the current piece.",
    "When i == end, the piece is closed: record its size and start a new one."
  ],
  "steps": [
    "last = {c: i for i, c in enumerate(s)}.",
    "start = end = 0.",
    "For i, c: end = max(end, last[c]); if i == end: append end - start + 1; start = i + 1.",
    "Return the sizes."
  ],
  "time": "O(n)",
  "space": "O(26)",
  "trap": "Cutting when you see a letter for the last time is not enough; all letters in the piece must be finished.",
  "code": `def partitionLabels(s):
    last = {c: i for i, c in enumerate(s)}
    res = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            res.append(end - start + 1)
            start = i + 1
    return res`
},
{
  "num": 2136,
  "title": "Earliest Possible Day of Full Bloom",
  "slug": "earliest-possible-day-of-full-bloom",
  "lc": "Hard",
  "topic": "greedy",
  "pattern": "Sort, then take the best",
  "level": 4,
  "order": 290,
  "core": false,
  "teaches": "Exchange argument: plant the seeds that grow longest first, because their growing overlaps everyone else's planting.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    1029
  ],
  "hints": [
    "Planting days are always used up in total; only growing can overlap. Which seed should be planted first?",
    "Swap two neighbouring seeds and compare finish times: the one with the longer grow time should go first.",
    "Sort by grow time descending; track the day planting ends and the latest bloom."
  ],
  "steps": [
    "Order indices by growTime descending.",
    "cur = 0, ans = 0.",
    "For each i: cur += plantTime[i]; ans = max(ans, cur + growTime[i]).",
    "Return ans."
  ],
  "time": "O(n log n)",
  "space": "O(n)",
  "trap": "Sorting by plant time (or by plant + grow) is wrong; only grow time decides the order.",
  "code": `def earliestFullBloom(plantTime, growTime):
    order = sorted(range(len(plantTime)), key=lambda i: -growTime[i])
    cur = ans = 0
    for i in order:
        cur += plantTime[i]
        ans = max(ans, cur + growTime[i])
    return ans`
},
{
  "num": 678,
  "title": "Valid Parenthesis String",
  "slug": "valid-parenthesis-string",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 4,
  "order": 300,
  "core": true,
  "teaches": "Track a range of possible open counts [lo, hi] instead of one balance, since '*' can be three things.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    1221
  ],
  "hints": [
    "Without '*', a single balance counter works. What does '*' do to that counter?",
    "It could add 1, subtract 1 or do nothing. Keep the lowest and highest possible balance.",
    "If hi < 0, too many ')': fail. Clamp lo at 0 (a negative balance is never a choice you'd keep). At the end, valid if lo == 0."
  ],
  "steps": [
    "lo = hi = 0.",
    "'(': lo += 1, hi += 1. ')': lo -= 1, hi -= 1. '*': lo -= 1, hi += 1.",
    "If hi < 0 return False; lo = max(lo, 0).",
    "Return lo == 0."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Forgetting to clamp lo at 0 lets '*' act as ')' before any '(' exists.",
  "code": `def checkValidString(s):
    lo = hi = 0
    for c in s:
        if c == "(":
            lo += 1
            hi += 1
        elif c == ")":
            lo -= 1
            hi -= 1
        else:
            lo -= 1
            hi += 1
        if hi < 0:
            return False
        lo = max(lo, 0)
    return lo == 0`
},
{
  "num": 135,
  "title": "Candy",
  "slug": "candy",
  "lc": "Hard",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 4,
  "order": 310,
  "core": true,
  "teaches": "Satisfy one direction at a time: a left-to-right pass for left neighbours, a right-to-left pass for right ones.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    1221
  ],
  "hints": [
    "Each child needs more candy than a neighbour with a lower rating. That is two rules: left neighbour and right neighbour.",
    "Pass left to right: if rating rises, candy = left candy + 1, else 1.",
    "Pass right to left: if rating[i] > rating[i+1], candy[i] = max(candy[i], candy[i+1] + 1). Sum."
  ],
  "steps": [
    "candy = [1] * n.",
    "For i from 1 to n-1: if ratings[i] > ratings[i-1], candy[i] = candy[i-1] + 1.",
    "For i from n-2 down to 0: if ratings[i] > ratings[i+1], candy[i] = max(candy[i], candy[i+1] + 1).",
    "Return sum(candy)."
  ],
  "time": "O(n)",
  "space": "O(n)",
  "trap": "In the second pass, overwriting instead of taking max breaks the left-neighbour rule fixed in pass one.",
  "code": `def candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)`
},
{
  "num": 991,
  "title": "Broken Calculator",
  "slug": "broken-calculator",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 4,
  "order": 320,
  "core": false,
  "teaches": "Work backwards from the target: halving when even and adding 1 when odd is always the best move.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    1647
  ],
  "hints": [
    "Going forward you must guess when to double. Try reversing: from target, the moves become 'halve' and 'add 1'.",
    "If target is odd you cannot halve, so add 1. If target is even, halving is never worse than adding first.",
    "Once target <= startValue, only 'add 1' moves (that is, subtractions forward) remain: add startValue - target."
  ],
  "steps": [
    "ops = 0.",
    "While target > startValue: if target is odd, target += 1, else target //= 2; ops += 1.",
    "Return ops + startValue - target."
  ],
  "time": "O(log target)",
  "space": "O(1)",
  "trap": "Greedy forward (double whenever below target) gives too many steps; the reverse direction makes the choice forced.",
  "code": `def brokenCalc(startValue, target):
    ops = 0
    while target > startValue:
        if target % 2:
            target += 1
        else:
            target //= 2
        ops += 1
    return ops + startValue - target`
},
{
  "num": 2054,
  "title": "Two Best Non-Overlapping Events",
  "slug": "two-best-non-overlapping-events",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: keep earliest end",
  "level": 4,
  "order": 330,
  "core": false,
  "teaches": "Sweep events by start; a heap of ended events gives the best value that can pair with the current one.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-nonov"
  ],
  "pre": [
    435
  ],
  "hints": [
    "For each event, you want the most valuable event that ended strictly before it starts.",
    "Sort events by start. Keep a min-heap of (end, value) for events already seen.",
    "Before handling an event, pop all heap items with end < start and fold their values into best_before. Answer = max(value + best_before)."
  ],
  "steps": [
    "Sort events by start; heap = [], best_before = 0, ans = 0.",
    "For each (s, e, v): while heap and heap[0][0] < s: best_before = max(best_before, heappop(heap)[1]).",
    "ans = max(ans, v + best_before); push (e, v).",
    "Return ans."
  ],
  "time": "O(n log n)",
  "space": "O(n)",
  "trap": "Times are inclusive: an event ending at t and one starting at t overlap, so pop only when end < start.",
  "code": `import heapq

def maxTwoEvents(events):
    events.sort()
    heap = []
    best_before = 0
    ans = 0
    for s, e, v in events:
        while heap and heap[0][0] < s:
            best_before = max(best_before, heapq.heappop(heap)[1])
        ans = max(ans, v + best_before)
        heapq.heappush(heap, (e, v))
    return ans`
},
{
  "num": 1942,
  "title": "The Number of the Smallest Unoccupied Chair",
  "slug": "the-number-of-the-smallest-unoccupied-chair",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Intervals: count overlaps (rooms)",
  "level": 4,
  "order": 350,
  "core": false,
  "teaches": "Simulate rooms with two heaps: free chairs (smallest first) and occupied chairs keyed by leaving time.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-rooms"
  ],
  "pre": [
    2406
  ],
  "hints": [
    "Process friends by arrival time. When a friend arrives, which chairs are free?",
    "Every chair whose occupant left at or before now. Keep occupied chairs in a heap of (leave, chair) and release them.",
    "Free chairs go in another min-heap; the arriving friend takes the smallest one (or a brand-new chair number)."
  ],
  "steps": [
    "order = friends sorted by arrival; free = [] (min-heap), busy = [] (min-heap of (leave, chair)), next_chair = 0.",
    "For each friend: while busy[0].leave <= arrival: move that chair to free.",
    "chair = heappop(free) if free else next_chair++.",
    "If this is targetFriend, return chair. Push (leave, chair) to busy."
  ],
  "time": "O(n log n)",
  "space": "O(n)",
  "trap": "A chair freed at time t can be used by a friend arriving at time t, so release when leave <= arrival.",
  "code": `import heapq

def smallestChair(times, targetFriend):
    order = sorted(range(len(times)), key=lambda i: times[i][0])
    free = []
    busy = []
    next_chair = 0
    for i in order:
        arrive, leave = times[i]
        while busy and busy[0][0] <= arrive:
            heapq.heappush(free, heapq.heappop(busy)[1])
        if free:
            chair = heapq.heappop(free)
        else:
            chair = next_chair
            next_chair += 1
        if i == targetFriend:
            return chair
        heapq.heappush(busy, (leave, chair))`
},
{
  "num": 1024,
  "title": "Video Stitching",
  "slug": "video-stitching",
  "lc": "Medium",
  "topic": "greedy",
  "pattern": "Reach: jump game",
  "level": 4,
  "order": 360,
  "core": false,
  "teaches": "Convert clips into 'from start x you can reach y' and solve it as Jump Game II.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-jump"
  ],
  "pre": [
    45
  ],
  "hints": [
    "For each start time, only the clip that reaches farthest matters.",
    "Build reach[x] = max end of clips starting at x. Now it looks like Jump Game II over times 0..time.",
    "Do the level sweep: when you reach the end of the current coverage, take another clip; if nothing extends past it, return -1."
  ],
  "steps": [
    "reach = [0] * (time + 1); for (s, e) with s <= time: reach[s] = max(reach[s], e).",
    "count = cur_end = far = 0.",
    "For i in range(time): far = max(far, reach[i]); if i == cur_end: if far <= i return -1; count += 1; cur_end = far.",
    "Return count (cur_end >= time after the loop)."
  ],
  "time": "O(n + time)",
  "space": "O(time)",
  "trap": "A gap (no clip covering some second) must return -1; check far <= i before taking a clip.",
  "code": `def videoStitching(clips, time):
    reach = [0] * (time + 1)
    for s, e in clips:
        if s <= time:
            reach[s] = max(reach[s], e)
    count = cur_end = far = 0
    for i in range(time):
        far = max(far, reach[i])
        if i == cur_end:
            if far <= i:
                return -1
            count += 1
            cur_end = far
    return count`
},
{
  "num": 330,
  "title": "Patching Array",
  "slug": "patching-array",
  "lc": "Hard",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 5,
  "order": 370,
  "core": false,
  "teaches": "Track the smallest sum you cannot make yet (miss); patching with miss itself doubles the reachable range.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    991
  ],
  "hints": [
    "Suppose you can make every sum in [1, miss). What does the next array number x do if x <= miss?",
    "It extends the range to [1, miss + x). If x > miss, nothing in the array can make miss.",
    "Then patch by adding miss itself: the range becomes [1, 2 * miss). Repeat until miss > n."
  ],
  "steps": [
    "miss = 1, i = 0, patches = 0.",
    "While miss <= n: if i < len(nums) and nums[i] <= miss: miss += nums[i]; i += 1.",
    "Else: miss += miss; patches += 1.",
    "Return patches."
  ],
  "time": "O(len(nums) + log n)",
  "space": "O(1)",
  "trap": "Patching with a value other than miss (like n or a small number) wastes patches.",
  "code": `def minPatches(nums, n):
    miss = 1
    i = patches = 0
    while miss <= n:
        if i < len(nums) and nums[i] <= miss:
            miss += nums[i]
            i += 1
        else:
            miss += miss
            patches += 1
    return patches`
},
{
  "num": 1851,
  "title": "Minimum Interval to Include Each Query",
  "slug": "minimum-interval-to-include-each-query",
  "lc": "Hard",
  "topic": "greedy",
  "pattern": "Intervals: count overlaps (rooms)",
  "level": 5,
  "order": 400,
  "core": false,
  "teaches": "Offline sweep: sort queries, add intervals as they start, and keep a heap of (size, end) to pop ones that ended.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-rooms"
  ],
  "pre": [
    1942
  ],
  "hints": [
    "Answering each query by scanning all intervals is O(n * q). Can you process queries in sorted order?",
    "Sort intervals by start and queries by value. For query q, push every interval with start <= q as (size, end).",
    "Pop heap tops whose end < q (they can never help later queries either). The top is then the smallest containing interval."
  ],
  "steps": [
    "Sort intervals by start; order query indices by value.",
    "For each query q in order: push (r - l + 1, r) for intervals with l <= q.",
    "While heap top end < q: pop.",
    "ans[idx] = heap top size if heap else -1."
  ],
  "time": "O((n + q) log n + q log q)",
  "space": "O(n + q)",
  "trap": "Answers must be returned in the original query order; remember each query's index.",
  "code": `import heapq

def minInterval(intervals, queries):
    intervals.sort()
    order = sorted(range(len(queries)), key=lambda i: queries[i])
    ans = [-1] * len(queries)
    heap = []
    i = 0
    for qi in order:
        q = queries[qi]
        while i < len(intervals) and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(heap, (r - l + 1, r))
            i += 1
        while heap and heap[0][1] < q:
            heapq.heappop(heap)
        if heap:
            ans[qi] = heap[0][0]
    return ans`
},
{
  "num": 1326,
  "title": "Minimum Number of Taps to Open to Water a Garden",
  "slug": "minimum-number-of-taps-to-open-to-water-a-garden",
  "lc": "Hard",
  "topic": "greedy",
  "pattern": "Reach: jump game",
  "level": 5,
  "order": 410,
  "core": false,
  "teaches": "Each tap is an interval [i - r, i + r]; covering [0, n] with the fewest intervals is Video Stitching again.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-jump"
  ],
  "pre": [
    1024
  ],
  "hints": [
    "Turn tap i with range r into the interval [max(0, i - r), i + r].",
    "For each left end keep the farthest right end: reach[left] = max(reach[left], i + r).",
    "Now run the Jump Game II level sweep over 0..n; return -1 if you get stuck."
  ],
  "steps": [
    "reach = [0] * (n + 1); for each tap: l = max(0, i - r); reach[l] = max(reach[l], i + r).",
    "taps = cur_end = far = 0.",
    "For i in range(n): far = max(far, reach[i]); if i == cur_end: if far <= i return -1; taps += 1; cur_end = far.",
    "Return taps."
  ],
  "time": "O(n)",
  "space": "O(n)",
  "trap": "Coverage must be continuous: watering points 0..1 and 2..3 leaves the stretch between 1 and 2 dry.",
  "code": `def minTaps(n, ranges):
    reach = [0] * (n + 1)
    for i, r in enumerate(ranges):
        l = max(0, i - r)
        reach[l] = max(reach[l], i + r)
    taps = cur_end = far = 0
    for i in range(n):
        far = max(far, reach[i])
        if i == cur_end:
            if far <= i:
                return -1
            taps += 1
            cur_end = far
    return taps`
},
{
  "num": 517,
  "title": "Super Washing Machines",
  "slug": "super-washing-machines",
  "lc": "Hard",
  "topic": "greedy",
  "pattern": "One pass: running balance",
  "level": 6,
  "order": 420,
  "core": false,
  "teaches": "Count dresses that must flow across each boundary (prefix imbalance) and out of each machine; the answer is the largest.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-idea"
  ],
  "pre": [
    134,
    330
  ],
  "hints": [
    "If total % n != 0, it is impossible. Otherwise every machine must end with avg = total / n.",
    "Look at the boundary between machine i and i+1: the prefix surplus (sum of load - avg so far) must cross it, one dress per move.",
    "A machine with surplus s must send s dresses out, one per move, even if it can send in two directions. Answer = max(|prefix|, machine surplus)."
  ],
  "steps": [
    "If total % n, return -1. avg = total // n.",
    "bal = 0, ans = 0.",
    "For m in machines: d = m - avg; bal += d; ans = max(ans, abs(bal), d).",
    "Return ans."
  ],
  "time": "O(n)",
  "space": "O(1)",
  "trap": "Using abs(d) for a single machine is wrong: a machine short of dresses can receive from both sides in one move, so only positive d counts.",
  "code": `def findMinMoves(machines):
    total, n = sum(machines), len(machines)
    if total % n:
        return -1
    avg = total // n
    bal = ans = 0
    for m in machines:
        d = m - avg
        bal += d
        ans = max(ans, abs(bal), d)
    return ans`
},
{
  "num": 757,
  "title": "Set Intersection Size At Least Two",
  "slug": "set-intersection-size-at-least-two",
  "lc": "Hard",
  "topic": "greedy",
  "pattern": "Intervals: keep earliest end",
  "level": 6,
  "order": 430,
  "core": false,
  "teaches": "Arrows with a twist: each interval needs two points, so keep the two largest chosen points and add points at the end.",
  "learn": [
    "dsa_greedy",
    "dsa-gr2-nonov"
  ],
  "pre": [
    452
  ],
  "hints": [
    "Like Minimum Arrows, process intervals by end and place new points as far right as possible.",
    "Sort by end ascending, and for equal ends by start descending (the tighter interval first).",
    "Track the two largest chosen points a < b. If start > b, add e-1 and e. If start > a only, add e (a, b = b, e). Else nothing."
  ],
  "steps": [
    "Sort by (end, -start); a = b = -1; ans = 0.",
    "For [s, e]: if s > b: ans += 2; a, b = e - 1, e.",
    "Elif s > a: ans += 1; a, b = b, e.",
    "Return ans."
  ],
  "time": "O(n log n)",
  "space": "O(1) extra",
  "trap": "Without the start-descending tiebreak, an equal-end wider interval processed first places points the narrower one cannot use.",
  "code": `def intersectionSizeTwo(intervals):
    intervals.sort(key=lambda x: (x[1], -x[0]))
    a = b = -1
    ans = 0
    for s, e in intervals:
        if s > b:
            ans += 2
            a, b = e - 1, e
        elif s > a:
            ans += 1
            a, b = b, e
    return ans`
}
);
