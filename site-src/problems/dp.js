// problems/dp.js — Dynamic Programming ladder
PROBLEMS.push(
  {
    num: 1137, title: "N-th Tribonacci Number", slug: "n-th-tribonacci-number", lc: "Easy",
    topic: "dp",
    pattern: "1D: steps (Fibonacci-style)",
    level: 1,
    order: 10,
    core: false,
    teaches: "A DP value is built from a few earlier values; keep only the ones you still need.",
    learn: ["dsa_dp", "dsa-dp-memo"],
    pre: [509],
    hints: [
      "Write T(n) using only T(n-1), T(n-2), T(n-3).",
      "State: T(i). Recurrence: T(i) = T(i-1) + T(i-2) + T(i-3). Base: T(0)=0, T(1)=T(2)=1.",
      "You only ever read the last three values, so three variables are enough."
    ],
    steps: ["Set a, b, c = 0, 1, 1 (T(0), T(1), T(2)).", "Repeat n times: a, b, c = b, c, a + b + c.", "Return a."],
    time: "O(n)", space: "O(1)",
    trap: "Plain recursion without memo repeats work and takes exponential time.",
    code: `class Solution:
    def tribonacci(self, n: int) -> int:
        a, b, c = 0, 1, 1        # T(i), T(i+1), T(i+2)
        for _ in range(n):
            a, b, c = b, c, a + b + c
        return a`
  },
  {
    num: 62, title: "Unique Paths", slug: "unique-paths", lc: "Medium",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 1,
    order: 20,
    core: true,
    teaches: "In a grid, a cell is reached only from above or from the left: add those two.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [],
    hints: [
      "How did the robot arrive at cell (r, c)?",
      "State: dp[r][c] = paths to (r, c). First row and first column are all 1.",
      "dp[r][c] = dp[r-1][c] + dp[r][c-1]. One row of size n is enough."
    ],
    steps: ["row = [1] * n.", "For each next row: for c from 1: row[c] += row[c-1].", "Return row[-1]."],
    time: "O(m * n)", space: "O(n)",
    trap: "The answer is also C(m+n-2, m-1), but learn the table first.",
    code: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        row = [1] * n            # first row: one way to reach each cell
        for _ in range(1, m):
            for c in range(1, n):
                row[c] += row[c - 1]   # from above (old row[c]) + from left
        return row[-1]`
  },
  {
    num: 674, title: "Longest Continuous Increasing Subsequence", slug: "longest-continuous-increasing-subsequence", lc: "Easy",
    topic: "dp",
    pattern: "LIS: best chain ending at i",
    level: 1,
    order: 30,
    core: false,
    teaches: "dp 'ending at i': the run ending at i extends the run ending at i-1 or restarts.",
    learn: ["dsa_dp", "dsa-dp-recipe"],
    pre: [],
    hints: [
      "What is the longest increasing run that ends exactly at index i?",
      "It is run(i-1) + 1 if nums[i] > nums[i-1], else 1."
    ],
    steps: ["cur = best = 1.", "For i from 1: cur = cur + 1 if nums[i] > nums[i-1] else 1; best = max(best, cur).", "Return best."],
    time: "O(n)", space: "O(1)",
    trap: "Equal neighbours break the run (strictly increasing).",
    code: `class Solution:
    def findLengthOfLCIS(self, nums: list[int]) -> int:
        best = cur = 1               # cur = length of increasing run ending at i
        for i in range(1, len(nums)):
            cur = cur + 1 if nums[i] > nums[i - 1] else 1
            best = max(best, cur)
        return best`
  },
  {
    num: 70, title: "Climbing Stairs", slug: "climbing-stairs", lc: "Easy",
    topic: "dp",
    pattern: "1D: steps (Fibonacci-style)",
    level: 2,
    order: 40,
    core: true,
    teaches: "Think about the LAST move: the ways to reach step i split by whether you came from i-1 or i-2.",
    learn: ["dsa_dp", "dsa-dp-recipe"],
    pre: [509],
    hints: [
      "How could your very last move onto step n have looked?",
      "State: ways(i) = number of ways to stand on step i. The last move was 1 step or 2 steps.",
      "Recurrence: ways(i) = ways(i-1) + ways(i-2), with ways(0) = ways(1) = 1. It is Fibonacci."
    ],
    steps: ["ways(0) = ways(1) = 1.", "For i from 2 to n: ways(i) = ways(i-1) + ways(i-2), kept in two variables.", "Return ways(n)."],
    time: "O(n)", space: "O(1)",
    trap: "Base case ways(0) = 1 (do nothing), not 0; otherwise every answer is off.",
    code: `class Solution:
    def climbStairs(self, n: int) -> int:
        # ways(i) = ways(i-1) + ways(i-2); ways(0) = ways(1) = 1
        a, b = 1, 1              # ways(i), ways(i+1)
        for _ in range(n):
            a, b = b, a + b
        return a`
  },
  {
    num: 746, title: "Min Cost Climbing Stairs", slug: "min-cost-climbing-stairs", lc: "Easy",
    topic: "dp",
    pattern: "1D: steps (Fibonacci-style)",
    level: 2,
    order: 50,
    core: true,
    teaches: "Same shape as Climbing Stairs, but take the cheaper of the two ways in, instead of adding them.",
    learn: ["dsa_dp", "dsa-dp-space"],
    pre: [70],
    hints: [
      "You can arrive at step i only from i-1 or i-2. Which is cheaper?",
      "State: dp[i] = cheapest cost to stand on step i (the top is step n). dp[0] = dp[1] = 0.",
      "Recurrence: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). Keep two variables."
    ],
    steps: ["prev2 = prev1 = 0 (cost to stand on step 0 and step 1).", "For i from 2 to n: cur = min(prev1 + cost[i-1], prev2 + cost[i-2]); shift.", "Return prev1 (top = step n)."],
    time: "O(n)", space: "O(1)",
    trap: "The top is one past the last index; returning dp[n-1] misses the final climb.",
    code: `class Solution:
    def minCostClimbingStairs(self, cost: list[int]) -> int:
        # dp[i] = cheapest way to STAND on step i (top is step n)
        prev2, prev1 = 0, 0      # dp[0], dp[1]: you may start on either for free
        for i in range(2, len(cost) + 1):
            prev2, prev1 = prev1, min(prev1 + cost[i - 1], prev2 + cost[i - 2])
        return prev1`
  },
  {
    num: 198, title: "House Robber", slug: "house-robber", lc: "Medium",
    topic: "dp",
    pattern: "1D: take or skip",
    level: 2,
    order: 60,
    core: true,
    teaches: "At each item the only question is take it or skip it; taking blocks the neighbour.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [70],
    hints: [
      "For the last house: if you rob it, what can't you rob?",
      "State: dp[i] = best loot from the first i houses.",
      "Recurrence: dp[i] = max(dp[i-1] (skip), dp[i-2] + nums[i-1] (rob)). Two variables are enough."
    ],
    steps: ["prev2 = prev1 = 0.", "For each x: prev2, prev1 = prev1, max(prev1, prev2 + x).", "Return prev1."],
    time: "O(n)", space: "O(1)",
    trap: "Taking every other house is not optimal: [2,1,1,2] -> 4 skips two in a row.",
    code: `class Solution:
    def rob(self, nums: list[int]) -> int:
        prev2, prev1 = 0, 0      # best loot up to house i-2, i-1
        for x in nums:
            prev2, prev1 = prev1, max(prev1, prev2 + x)   # skip x, or rob x
        return prev1`
  },
  {
    num: 63, title: "Unique Paths II", slug: "unique-paths-ii", lc: "Medium",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 2,
    order: 70,
    core: false,
    teaches: "Unique Paths with blocked cells: a rock cell has 0 ways.",
    learn: ["dsa_dp", "dsa-dp-space"],
    pre: [62],
    hints: [
      "What is the number of ways to stand on a rock?",
      "Same table as Unique Paths, but set dp = 0 on obstacles.",
      "The first row/column are no longer all 1: once a rock appears, everything after it in that row/column is 0."
    ],
    steps: ["row = [0]*n; row[0] = 1.", "For each grid row, for each c: if rock, row[c] = 0, else if c > 0, row[c] += row[c-1].", "Return row[-1]."],
    time: "O(m * n)", space: "O(n)",
    trap: "A rock on the start cell means the answer is 0.",
    code: `class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: list[list[int]]) -> int:
        n = len(obstacleGrid[0])
        row = [0] * n
        row[0] = 1               # one way to stand on the start (if it is free)
        for r in obstacleGrid:
            for c in range(n):
                if r[c] == 1:
                    row[c] = 0               # rock: nobody gets here
                elif c > 0:
                    row[c] += row[c - 1]
        return row[-1]`
  },
  {
    num: 64, title: "Minimum Path Sum", slug: "minimum-path-sum", lc: "Medium",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 2,
    order: 80,
    core: true,
    teaches: "Grid DP with min instead of +: the cheapest way in is the cheaper of above and left.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [62],
    hints: [
      "The path into (r, c) came from above or from the left. Which do you want?",
      "State: dp[r][c] = smallest sum of a path ending at (r, c).",
      "dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]); edges have only one option."
    ],
    steps: ["row = [inf]*n; row[0] = 0.", "For each cell: row[c] = grid[r][c] + min(row[c] (above), row[c-1] (left)).", "Return row[-1]."],
    time: "O(m * n)", space: "O(n)",
    trap: "Edge cells have a missing neighbour: use infinity for it, not 0.",
    code: `class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        m, n = len(grid), len(grid[0])
        INF = float('inf')
        row = [INF] * n
        row[0] = 0
        for r in range(m):
            for c in range(n):
                left = row[c - 1] if c > 0 else INF
                row[c] = grid[r][c] + min(row[c], left)   # row[c] still holds "above"
        return row[-1]`
  },
  {
    num: 2915, title: "Length of the Longest Subsequence That Sums to Target", slug: "length-of-the-longest-subsequence-that-sums-to-target", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack 0/1: each item once",
    level: 2,
    order: 90,
    core: false,
    teaches: "0/1 knapsack basic form: dp over sums, loop the sum backwards so each item is used once.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [],
    hints: [
      "For each number: put it in the subsequence or not. What should the table be indexed by?",
      "State: dp[s] = most numbers picked (so far) with sum exactly s; dp[0] = 0, others -inf.",
      "For each x, for s from target down to x: dp[s] = max(dp[s], dp[s-x] + 1)."
    ],
    steps: ["dp = [-inf]*(target+1); dp[0] = 0.", "For each x, loop s from target down to x and relax.", "Return dp[target] or -1."],
    time: "O(n * target)", space: "O(target)",
    trap: "Looping s upward reuses the same item many times (that is unbounded knapsack).",
    code: `class Solution:
    def lengthOfLongestSubsequence(self, nums: list[int], target: int) -> int:
        NEG = float('-inf')
        dp = [NEG] * (target + 1)   # dp[s] = most items picked so far that sum to exactly s
        dp[0] = 0
        for x in nums:
            for s in range(target, x - 1, -1):   # right-to-left: each item used once
                if dp[s - x] + 1 > dp[s]:
                    dp[s] = dp[s - x] + 1
        return dp[target] if dp[target] != NEG else -1`
  },
  {
    num: 377, title: "Combination Sum IV", slug: "combination-sum-iv", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack unbounded: reuse items",
    level: 2,
    order: 100,
    core: false,
    teaches: "Climbing Stairs with any step sizes; order matters, so loop the amount outside.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [70],
    hints: [
      "This is Climbing Stairs where a step can be any number in nums.",
      "State: dp[t] = ordered ways to reach t; dp[0] = 1.",
      "dp[t] = sum of dp[t - x] for x in nums with x <= t (the last step was x)."
    ],
    steps: ["dp[0] = 1.", "For t from 1 to target: for each x <= t: dp[t] += dp[t-x].", "Return dp[target]."],
    time: "O(target * n)", space: "O(target)",
    trap: "Swapping the loops (coins outside) counts combinations, not sequences.",
    code: `class Solution:
    def combinationSum4(self, nums: list[int], target: int) -> int:
        dp = [0] * (target + 1)     # dp[t] = ordered ways to reach t ("stairs" with steps nums)
        dp[0] = 1
        for t in range(1, target + 1):           # amount outside: order matters
            for x in nums:
                if x <= t:
                    dp[t] += dp[t - x]           # last step was x
        return dp[target]`
  },
  {
    num: 300, title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", lc: "Medium",
    topic: "dp",
    pattern: "LIS: best chain ending at i",
    level: 2,
    order: 110,
    core: true,
    teaches: "LIS: dp[i] = longest chain ending at i, built from any earlier smaller element.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [674],
    hints: [
      "Unlike 674, the previous element may be anywhere to the left. Which ones can come before nums[i]?",
      "State: dp[i] = length of the longest increasing subsequence that ends at i.",
      "dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i]; the answer is max(dp), not dp[-1]."
    ],
    steps: ["dp = [1]*n.", "For each i, for each j < i with nums[j] < nums[i]: dp[i] = max(dp[i], dp[j] + 1).", "Return max(dp)."],
    time: "O(n^2)", space: "O(n)",
    trap: "dp[-1] is not the answer: the best chain can end anywhere. (O(n log n) with tails + bisect: see 354.)",
    code: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        n = len(nums)
        dp = [1] * n                 # dp[i] = longest increasing subsequence ENDING at i
        for i in range(n):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)   # extend the chain that ends at j
        return max(dp)`
  },
  {
    num: 647, title: "Palindromic Substrings", slug: "palindromic-substrings", lc: "Medium",
    topic: "dp",
    pattern: "Palindromes: center or range",
    level: 2,
    order: 120,
    core: true,
    teaches: "Every palindrome has a center; grow outward from all 2n-1 centers.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [],
    hints: [
      "A palindrome is mirrored around its middle. How many possible middles are there?",
      "n single-letter centers and n-1 between-letter centers.",
      "From each center, expand while s[l] == s[r], counting one palindrome per step."
    ],
    steps: ["For each of 2n-1 centers set l, r.", "While in bounds and s[l] == s[r]: count += 1, expand.", "Return count."],
    time: "O(n^2)", space: "O(1)",
    trap: "Forgetting even-length centers misses 'aa'.",
    code: `class Solution:
    def countSubstrings(self, s: str) -> int:
        n, count = len(s), 0
        for center in range(2 * n - 1):          # n odd centers + (n-1) even centers
            l, r = center // 2, center // 2 + center % 2
            while l >= 0 and r < n and s[l] == s[r]:
                count += 1                        # s[l..r] is a palindrome
                l -= 1
                r += 1
        return count`
  },
  {
    num: 877, title: "Stone Game", slug: "stone-game", lc: "Medium",
    topic: "dp",
    pattern: "Interval: split the range l..r",
    level: 2,
    order: 130,
    core: false,
    teaches: "Two-player games on a row: dp[i][j] = score lead of the player to move on piles i..j.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [],
    hints: [
      "After you take a pile, your opponent plays the same game on a smaller range.",
      "State: dp[i][j] = (my total - opponent total) when it's my turn on piles[i..j].",
      "dp[i][j] = max(piles[i] - dp[i+1][j], piles[j] - dp[i][j-1]). Alice wins if dp[0][n-1] > 0."
    ],
    steps: ["dp[i][i] = piles[i].", "Fill i downward, j upward.", "Return dp[0][n-1] > 0."],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Fun fact: with an even count and odd total Alice always wins, but learn the DP.",
    code: `class Solution:
    def stoneGame(self, piles: list[int]) -> bool:
        n = len(piles)
        # dp[i][j] = (my stones - opponent's stones) when it's my turn on piles[i..j]
        dp = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            dp[i][i] = piles[i]
            for j in range(i + 1, n):
                dp[i][j] = max(piles[i] - dp[i + 1][j],   # take left, then opponent leads
                               piles[j] - dp[i][j - 1])   # take right
        return dp[0][n - 1] > 0`
  },
  {
    num: 96, title: "Unique Binary Search Trees", slug: "unique-binary-search-trees", lc: "Medium",
    topic: "dp",
    pattern: "Tree DP: tuple from children",
    level: 2,
    order: 140,
    core: false,
    teaches: "Count tree shapes by choosing the root: left and right sizes multiply.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [],
    hints: [
      "If node r is the root, which values go left and which go right?",
      "Only the sizes matter: r-1 nodes left, n-r right. State: dp[k] = shapes with k nodes; dp[0] = 1.",
      "dp[k] = sum over root r of dp[r-1] * dp[k-r] (Catalan numbers)."
    ],
    steps: ["dp[0] = 1.", "For k = 1..n, sum dp[r-1] * dp[k-r] over r = 1..k.", "Return dp[n]."],
    time: "O(n^2)", space: "O(n)",
    trap: "dp[0] must be 1 (an empty side is one shape), not 0.",
    code: `class Solution:
    def numTrees(self, n: int) -> int:
        dp = [0] * (n + 1)                       # dp[k] = number of BST shapes with k nodes
        dp[0] = 1                                # empty tree: one shape
        for k in range(1, n + 1):
            for root in range(1, k + 1):         # root-1 nodes go left, k-root go right
                dp[k] += dp[root - 1] * dp[k - root]
        return dp[n]`
  },
  {
    num: 2466, title: "Count Ways To Build Good Strings", slug: "count-ways-to-build-good-strings", lc: "Medium",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 2,
    order: 150,
    core: false,
    teaches: "Climbing Stairs with step sizes 'zero' and 'one', summed over a range of lengths.",
    learn: ["dsa_dp", "dsa-dp-recipe"],
    pre: [70],
    hints: [
      "A string is built block by block. What was the last block?",
      "State: dp[L] = strings of length L. dp[0] = 1.",
      "dp[L] = dp[L - zero] + dp[L - one]; answer = sum of dp[low..high] mod 1e9+7."
    ],
    steps: ["dp[0] = 1.", "Fill dp up to high with the rule, mod 1e9+7.", "Return the sum over low..high."],
    time: "O(high)", space: "O(high)",
    trap: "Take the mod during the loop, not only at the end.",
    code: `class Solution:
    def countGoodStrings(self, low: int, high: int, zero: int, one: int) -> int:
        MOD = 10**9 + 7
        dp = [0] * (high + 1)                    # dp[L] = strings of length L we can build
        dp[0] = 1
        for L in range(1, high + 1):
            if L >= zero:
                dp[L] += dp[L - zero]            # last block was \`zero\` 0s
            if L >= one:
                dp[L] += dp[L - one]             # last block was \`one\` 1s
            dp[L] %= MOD
        return sum(dp[low:high + 1]) % MOD`
  },
  {
    num: 1220, title: "Count Vowels Permutation", slug: "count-vowels-permutation", lc: "Hard",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 2,
    order: 160,
    core: false,
    teaches: "Count strings by their last letter; the rules say which letters may come before.",
    learn: ["dsa_dp", "dsa-dp-recipe"],
    pre: [],
    hints: [
      "What do you need to know about a string to extend it?",
      "Only its last vowel. Keep a count per last vowel.",
      "Reverse the rules: a <- e,i,u; e <- a,i; i <- e,o; o <- i; u <- i,o."
    ],
    steps: ["All five counts = 1 for length 1.", "Repeat n-1 times with the reversed rules, mod 1e9+7.", "Return the sum."],
    time: "O(n)", space: "O(1)",
    trap: "Mixing up 'a is followed by e' with 'a follows e' flips the transitions.",
    code: `class Solution:
    def countVowelPermutation(self, n: int) -> int:
        MOD = 10**9 + 7
        a = e = i = o = u = 1                    # strings of length 1 ending in each vowel
        for _ in range(n - 1):
            # who may come BEFORE each vowel: a<-e,i,u  e<-a,i  i<-e,o  o<-i  u<-i,o
            a, e, i, o, u = (e + i + u) % MOD, (a + i) % MOD, (e + o) % MOD, i, (i + o) % MOD
        return (a + e + i + o + u) % MOD`
  },
  {
    num: 357, title: "Count Numbers with Unique Digits", slug: "count-numbers-with-unique-digits", lc: "Medium",
    topic: "dp",
    pattern: "Digit DP: build numbers up to N",
    level: 2,
    order: 170,
    core: false,
    teaches: "Count numbers by length: each new digit has one fewer choice.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [],
    hints: [
      "How many 1-digit numbers have unique digits? 2-digit?",
      "k-digit: 9 choices for the first digit (no 0), then 9, 8, 7, ... for the rest.",
      "Answer = 1 (for 0) + sum over k = 1..n of those products."
    ],
    steps: ["total = 1, ways = 9.", "For k = 1..n: if k > 1, ways *= (11 - k); total += ways.", "Return total."],
    time: "O(n)", space: "O(1)",
    trap: "Leading zeros: the first digit has 9 options, not 10.",
    code: `class Solution:
    def countNumbersWithUniqueDigits(self, n: int) -> int:
        total, ways = 1, 9                       # total counts 0; ways = k-digit numbers so far
        for k in range(1, min(n, 10) + 1):
            if k > 1:
                ways *= 11 - k                   # k-th digit: 10 - (k - 1) unused digits left
            total += ways
        return total`
  },
  {
    num: 91, title: "Decode Ways", slug: "decode-ways", lc: "Medium",
    topic: "dp",
    pattern: "1D: steps (Fibonacci-style)",
    level: 3,
    order: 180,
    core: true,
    teaches: "Climbing Stairs with rules: a one-digit or two-digit last piece is allowed only when it is a valid letter.",
    learn: ["dsa_dp", "dsa-dp-recipe"],
    pre: [70],
    hints: [
      "Look at how the decoded message ends: the last letter used 1 digit or 2 digits.",
      "State: dp[i] = ways to decode the first i characters, dp[0] = 1.",
      "Recurrence: add dp[i-1] if s[i-1] != '0'; add dp[i-2] if s[i-2:i] is between '10' and '26'."
    ],
    steps: ["dp[0] = 1.", "For each i: start at 0; add dp[i-1] if the last digit is 1-9; add dp[i-2] if the last two digits form 10-26.", "Keep only the last two values; return dp[n]."],
    time: "O(n)", space: "O(1)",
    trap: "'0' alone is not a letter, and '06' is not 6: zeros kill paths.",
    code: `class Solution:
    def numDecodings(self, s: str) -> int:
        # dp[i] = ways to decode the first i characters
        prev2, prev1 = 1, 1      # dp[i-2], dp[i-1]; dp[0] = 1 (empty string)
        for i in range(1, len(s) + 1):
            cur = 0
            if s[i - 1] != '0':                       # last piece is one digit
                cur += prev1
            if i >= 2 and '10' <= s[i - 2:i] <= '26':  # last piece is two digits
                cur += prev2
            prev2, prev1 = prev1, cur
        return prev1`
  },
  {
    num: 213, title: "House Robber II", slug: "house-robber-ii", lc: "Medium",
    topic: "dp",
    pattern: "1D: take or skip",
    level: 3,
    order: 190,
    core: true,
    teaches: "Break a circle into two straight lines and reuse the line solution.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [198],
    hints: [
      "The first and the last house are now neighbours. Can both be robbed?",
      "At least one of them is skipped. So the answer is the better of two straight streets.",
      "Run House Robber on nums[1:] and on nums[:-1]; take the max (one house: return it)."
    ],
    steps: ["If one house, return it.", "best1 = rob(nums[1:]), best2 = rob(nums[:-1]) with the House Robber loop.", "Return max."],
    time: "O(n)", space: "O(n)",
    trap: "With one house both slices are empty; handle n = 1 first.",
    code: `class Solution:
    def rob(self, nums: list[int]) -> int:
        def line(arr):
            prev2, prev1 = 0, 0
            for x in arr:
                prev2, prev1 = prev1, max(prev1, prev2 + x)
            return prev1
        if len(nums) == 1:
            return nums[0]
        # first and last are neighbours: drop one of them
        return max(line(nums[1:]), line(nums[:-1]))`
  },
  {
    num: 740, title: "Delete and Earn", slug: "delete-and-earn", lc: "Medium",
    topic: "dp",
    pattern: "1D: take or skip",
    level: 3,
    order: 200,
    core: false,
    teaches: "Turn the problem into House Robber by grouping equal values: values v-1 and v+1 are the neighbours.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [198],
    hints: [
      "If you take a 5, you lose every 4 and 6. Does it ever pay to take only some of the 5s?",
      "Taking value v earns v * count(v). Build gain[v] for v = 0..max.",
      "Now it is House Robber on gain: adjacent values cannot both be taken."
    ],
    steps: ["gain[v] += v for every x = v.", "Run the House Robber loop over gain[0..max].", "Return the result."],
    time: "O(n + m)", space: "O(m)",
    trap: "m = max value. Sorting distinct values works too, but check v-1 gaps.",
    code: `class Solution:
    def deleteAndEarn(self, nums: list[int]) -> int:
        m = max(nums)
        gain = [0] * (m + 1)
        for x in nums:
            gain[x] += x         # taking value v earns v * count(v)
        # values v-1 and v+1 are "neighbour houses": House Robber over 0..m
        prev2, prev1 = 0, 0
        for g in gain:
            prev2, prev1 = prev1, max(prev1, prev2 + g)
        return prev1`
  },
  {
    num: 2140, title: "Solving Questions With Brainpower", slug: "solving-questions-with-brainpower", lc: "Medium",
    topic: "dp",
    pattern: "1D: take or skip",
    level: 3,
    order: 210,
    core: false,
    teaches: "When a choice jumps you forward, fill the table from the right.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [198],
    hints: [
      "If you solve question i, which question can you look at next?",
      "State: dp[i] = best score from question i to the end. dp[n] = 0.",
      "Recurrence: dp[i] = max(dp[i+1], points[i] + dp[i + power[i] + 1]) (clamp the index to n)."
    ],
    steps: ["dp = [0] * (n + 1).", "For i from n-1 down to 0: dp[i] = max(skip = dp[i+1], solve = points + dp[min(n, i+power+1)]).", "Return dp[0]."],
    time: "O(n)", space: "O(n)",
    trap: "Going left to right forces you to remember which questions are blocked; right to left removes that.",
    code: `class Solution:
    def mostPoints(self, questions: list[list[int]]) -> int:
        n = len(questions)
        dp = [0] * (n + 1)       # dp[i] = best score from question i to the end
        for i in range(n - 1, -1, -1):
            points, power = questions[i]
            solve = points + dp[min(n, i + power + 1)]
            skip = dp[i + 1]
            dp[i] = max(solve, skip)
        return dp[0]`
  },
  {
    num: 139, title: "Word Break", slug: "word-break", lc: "Medium",
    topic: "dp",
    pattern: "1D: cut off the last piece",
    level: 3,
    order: 220,
    core: true,
    teaches: "Prefix DP: a prefix is good if some good shorter prefix plus one dictionary word makes it.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [91],
    hints: [
      "If s[:i] can be split, what does its last word look like?",
      "State: dp[i] = True if s[:i] can be split into words. dp[0] = True.",
      "Recurrence: dp[i] = any(dp[j] and s[j:i] in words) for j in the last maxLen positions."
    ],
    steps: ["Put words in a set; dp[0] = True.", "For each i, try each j from i - maxLen to i-1; if dp[j] and s[j:i] is a word, set dp[i] and stop.", "Return dp[n]."],
    time: "O(n * L)", space: "O(n)",
    trap: "Greedy longest-word-first fails ('aaaaaaa' with 'aaaa', 'aaa'); you need all split points.",
    code: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        longest = max(map(len, words))
        n = len(s)
        dp = [False] * (n + 1)   # dp[i] = s[:i] can be split into words
        dp[0] = True
        for i in range(1, n + 1):
            for j in range(max(0, i - longest), i):
                if dp[j] and s[j:i] in words:   # last word is s[j:i]
                    dp[i] = True
                    break
        return dp[n]`
  },
  {
    num: 2369, title: "Check if There is a Valid Partition For The Array", slug: "check-if-there-is-a-valid-partition-for-the-array", lc: "Medium",
    topic: "dp",
    pattern: "1D: cut off the last piece",
    level: 3,
    order: 230,
    core: false,
    teaches: "Same prefix idea with fixed piece sizes: the last block has length 2 or 3.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [91],
    hints: [
      "What could the last block of a valid partition be?",
      "State: dp[i] = nums[:i] can be partitioned. dp[0] = True.",
      "dp[i] is True if dp[i-2] and the last 2 are equal, or dp[i-3] and the last 3 are equal or consecutive +1."
    ],
    steps: ["dp[0] = True.", "For i from 2 to n, check the 2-block rule with dp[i-2] and the 3-block rules with dp[i-3].", "Return dp[n]."],
    time: "O(n)", space: "O(n)",
    trap: "Consecutive means increasing by exactly 1: [1,2,3] yes, [3,2,1] no.",
    code: `class Solution:
    def validPartition(self, nums: list[int]) -> bool:
        n = len(nums)
        dp = [False] * (n + 1)   # dp[i] = nums[:i] has a valid partition
        dp[0] = True
        for i in range(2, n + 1):
            a, b = nums[i - 2], nums[i - 1]
            if dp[i - 2] and a == b:
                dp[i] = True
            if i >= 3 and dp[i - 3]:
                x = nums[i - 3]
                if (x == a == b) or (a == x + 1 and b == x + 2):
                    dp[i] = True
        return dp[n]`
  },
  {
    num: 983, title: "Minimum Cost For Tickets", slug: "minimum-cost-for-tickets", lc: "Medium",
    topic: "dp",
    pattern: "1D: cut off the last piece",
    level: 3,
    order: 240,
    core: false,
    teaches: "Index the DP by calendar day; on travel days choose which pass covers today.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [746],
    hints: [
      "On a travel day, the pass that covers today was bought 1, 7, or 30 days ago at the latest.",
      "State: dp[d] = cheapest cost to cover all trips up to day d. Non-travel day: dp[d] = dp[d-1].",
      "Travel day: dp[d] = min(dp[d-1] + c1, dp[d-7] + c7, dp[d-30] + c30), clamping negative days to 0."
    ],
    steps: ["Make a set of travel days.", "For d = 1..last day, apply the rule above.", "Return dp[last]."],
    time: "O(D)", space: "O(D)",
    trap: "D = last travel day (at most 365). A 7-day pass can be cheaper than 1-day even for 2 trips.",
    code: `class Solution:
    def mincostTickets(self, days: list[int], costs: list[int]) -> int:
        travel = set(days)
        last = days[-1]
        dp = [0] * (last + 1)    # dp[d] = cheapest cover for all trips up to day d
        for d in range(1, last + 1):
            if d not in travel:
                dp[d] = dp[d - 1]
                continue
            dp[d] = min(dp[d - 1] + costs[0],
                        dp[max(0, d - 7)] + costs[1],
                        dp[max(0, d - 30)] + costs[2])
        return dp[last]`
  },
  {
    num: 120, title: "Triangle", slug: "triangle", lc: "Medium",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 3,
    order: 250,
    core: true,
    teaches: "Fill from the bottom up so each cell has exactly two children to choose from.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [64],
    hints: [
      "Top-down, the edges of each row have one parent and the middle has two. Is there a direction with no special cases?",
      "State: dp[c] (for row r) = best path sum from (r, c) to the bottom. Start with the bottom row.",
      "dp[c] = triangle[r][c] + min(dp[c], dp[c+1]), going up row by row."
    ],
    steps: ["dp = copy of last row.", "For r from second-last up to 0, for c in 0..r: dp[c] = tri[r][c] + min(dp[c], dp[c+1]).", "Return dp[0]."],
    time: "O(n^2)", space: "O(n)",
    trap: "Greedy (pick the smaller child each step) is wrong.",
    code: `class Solution:
    def minimumTotal(self, triangle: list[list[int]]) -> int:
        dp = triangle[-1][:]     # best path from the bottom row up to each cell
        for r in range(len(triangle) - 2, -1, -1):
            for c in range(r + 1):
                dp[c] = triangle[r][c] + min(dp[c], dp[c + 1])
        return dp[0]`
  },
  {
    num: 931, title: "Minimum Falling Path Sum", slug: "minimum-falling-path-sum", lc: "Medium",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 3,
    order: 260,
    core: false,
    teaches: "Row-by-row DP where each cell looks at three cells in the row above.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [64],
    hints: [
      "Which cells of the previous row can fall into (r, c)?",
      "State: dp[r][c] = smallest falling sum ending at (r, c).",
      "dp[r][c] = matrix[r][c] + min(dp[r-1][c-1], dp[r-1][c], dp[r-1][c+1]) (skip ones off the edge). Answer = min of last row."
    ],
    steps: ["prev = first row.", "For each next row build cur with the rule above.", "Return min(prev)."],
    time: "O(n^2)", space: "O(n)",
    trap: "The answer is the min over the whole last row, not one corner.",
    code: `class Solution:
    def minFallingPathSum(self, matrix: list[list[int]]) -> int:
        n = len(matrix)
        prev = matrix[0][:]
        for r in range(1, n):
            cur = [0] * n
            for c in range(n):
                best = prev[c]
                if c > 0:
                    best = min(best, prev[c - 1])
                if c < n - 1:
                    best = min(best, prev[c + 1])
                cur[c] = matrix[r][c] + best
            prev = cur
        return min(prev)`
  },
  {
    num: 221, title: "Maximal Square", slug: "maximal-square", lc: "Medium",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 3,
    order: 270,
    core: true,
    teaches: "Store the biggest square ENDING at each cell; it is limited by its three neighbours.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [64],
    hints: [
      "If (r, c) is the bottom-right corner of a k x k square, what must be true of the cells above, left and diagonal?",
      "State: dp[r][c] = side of the largest all-1 square whose bottom-right corner is (r, c).",
      "dp[r][c] = 1 + min(up, left, up-left) when the cell is '1', else 0. Answer = (max side)^2."
    ],
    steps: ["Make a (m+1) x (n+1) table of zeros (padding avoids edge checks).", "For each '1' cell, apply the min-of-three rule and track the max side.", "Return side * side."],
    time: "O(m * n)", space: "O(m * n)",
    trap: "Cells are the strings '1'/'0', not ints. Return the area, not the side.",
    code: `class Solution:
    def maximalSquare(self, matrix: list[list[str]]) -> int:
        m, n = len(matrix), len(matrix[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[r+1][c+1] = side of best square ending at (r, c)
        side = 0
        for r in range(m):
            for c in range(n):
                if matrix[r][c] == '1':
                    dp[r + 1][c + 1] = 1 + min(dp[r][c + 1], dp[r + 1][c], dp[r][c])
                    side = max(side, dp[r + 1][c + 1])
        return side * side`
  },
  {
    num: 1277, title: "Count Square Submatrices with All Ones", slug: "count-square-submatrices-with-all-ones", lc: "Medium",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 3,
    order: 280,
    core: false,
    teaches: "The same square table counts squares: a cell with side k ends exactly k squares.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [221],
    hints: [
      "Reuse Maximal Square's dp. How many squares end at a cell whose best side is 3?",
      "Sides 1, 2 and 3 all end there: 3 squares.",
      "So the answer is the sum of dp over all cells."
    ],
    steps: ["Build dp with 1 + min(up, left, diag) on 1-cells.", "Add each dp value to a total.", "Return the total."],
    time: "O(m * n)", space: "O(m * n)",
    trap: "Counting only the largest square per cell misses the smaller ones inside it.",
    code: `class Solution:
    def countSquares(self, matrix: list[list[int]]) -> int:
        m, n = len(matrix), len(matrix[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        total = 0
        for r in range(m):
            for c in range(n):
                if matrix[r][c] == 1:
                    dp[r + 1][c + 1] = 1 + min(dp[r][c + 1], dp[r + 1][c], dp[r][c])
                    total += dp[r + 1][c + 1]   # a side-k square holds k squares ending here
        return total`
  },
  {
    num: 416, title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack 0/1: each item once",
    level: 3,
    order: 290,
    core: true,
    teaches: "Equal halves means 'is there a subset summing to total/2': boolean 0/1 knapsack.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [2915],
    hints: [
      "If two halves are equal, what does each half sum to?",
      "Odd total -> impossible. Else target = total/2. State: dp[s] = some subset reaches s.",
      "For each x, for s from target down to x: dp[s] |= dp[s-x]."
    ],
    steps: ["If total is odd return False.", "dp[0] = True; for each x loop s backwards and set dp[s] if dp[s-x].", "Return dp[total/2]."],
    time: "O(n * total)", space: "O(total)",
    trap: "Forward loops let one number count twice.",
    code: `class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        half = total // 2
        dp = [False] * (half + 1)   # dp[s] = some subset of items seen so far sums to s
        dp[0] = True
        for x in nums:
            for s in range(half, x - 1, -1):     # backwards so x is used at most once
                if dp[s - x]:
                    dp[s] = True
        return dp[half]`
  },
  {
    num: 494, title: "Target Sum", slug: "target-sum", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack 0/1: each item once",
    level: 3,
    order: 300,
    core: true,
    teaches: "Rewrite +/- signs as choosing a subset: count subsets with a fixed sum.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [416],
    hints: [
      "Split numbers into a plus group P and a minus group N. What are P + N and P - N?",
      "P = (total + target) / 2. It must be a non-negative integer.",
      "Count subsets that sum to P: dp[0] = 1; for each x, for s backwards: dp[s] += dp[s-x]."
    ],
    steps: ["If |target| > total or (total+target) is odd, return 0.", "goal = (total+target)//2; count subsets with the backwards loop.", "Return dp[goal]."],
    time: "O(n * total)", space: "O(total)",
    trap: "Zeros double the count (+0 and -0); the s loop must include s = x = 0 to get that.",
    code: `class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        total = sum(nums)
        # plus - minus = target, plus + minus = total  ->  plus = (total + target) / 2
        if abs(target) > total or (total + target) % 2:
            return 0
        goal = (total + target) // 2
        dp = [0] * (goal + 1)       # dp[s] = number of subsets summing to s
        dp[0] = 1
        for x in nums:
            for s in range(goal, x - 1, -1):
                dp[s] += dp[s - x]
        return dp[goal]`
  },
  {
    num: 2787, title: "Ways to Express an Integer as Sum of Powers", slug: "ways-to-express-an-integer-as-sum-of-powers", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack 0/1: each item once",
    level: 3,
    order: 310,
    core: false,
    teaches: "The items are the powers 1^x, 2^x, ...; count the subsets that sum to n.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [416],
    hints: [
      "'Unique integers' means each base is used at most once. Which knapsack is that?",
      "Items: b^x for every b with b^x <= n. State: dp[s] = ways to make s.",
      "For each power p, for s from n down to p: dp[s] += dp[s-p] (mod 1e9+7)."
    ],
    steps: ["dp[0] = 1.", "For b = 1, 2, ... while b^x <= n: backwards loop adding dp[s-p].", "Return dp[n] mod 1e9+7."],
    time: "O(n * n^(1/x))", space: "O(n)",
    trap: "Use a fresh power list per call, and take the result mod 1e9+7.",
    code: `class Solution:
    def numberOfWays(self, n: int, x: int) -> int:
        MOD = 10**9 + 7
        dp = [0] * (n + 1)          # dp[s] = ways to write s with distinct powers seen so far
        dp[0] = 1
        b = 1
        while b ** x <= n:
            p = b ** x
            for s in range(n, p - 1, -1):        # each base used at most once
                dp[s] = (dp[s] + dp[s - p]) % MOD
            b += 1
        return dp[n]`
  },
  {
    num: 322, title: "Coin Change", slug: "coin-change", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack unbounded: reuse items",
    level: 3,
    order: 320,
    core: true,
    teaches: "Unbounded knapsack for a minimum: the last coin was one of the coins.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [377],
    hints: [
      "To make amount a, what was the last coin?",
      "State: dp[a] = fewest coins to make a; dp[0] = 0, others infinity.",
      "dp[a] = min(dp[a - c] + 1) over coins c <= a. Infinity at the end means -1."
    ],
    steps: ["dp = [0] + [inf]*amount.", "For a = 1..amount, for each coin c <= a: dp[a] = min(dp[a], dp[a-c] + 1).", "Return dp[amount] or -1."],
    time: "O(amount * n)", space: "O(amount)",
    trap: "Greedy (largest coin first) fails, e.g. coins [1,3,4], amount 6.",
    code: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        INF = amount + 1
        dp = [0] + [INF] * amount   # dp[a] = fewest coins that make a
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a and dp[a - c] + 1 < dp[a]:
                    dp[a] = dp[a - c] + 1        # last coin was c
        return dp[amount] if dp[amount] != INF else -1`
  },
  {
    num: 279, title: "Perfect Squares", slug: "perfect-squares", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack unbounded: reuse items",
    level: 3,
    order: 330,
    core: false,
    teaches: "Coin Change where the coins are the perfect squares.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [322],
    hints: [
      "Which 'coins' can you use?",
      "Coins = 1, 4, 9, ... up to n. State: dp[i] = fewest squares summing to i.",
      "dp[i] = min(dp[i - k*k] + 1) for k*k <= i."
    ],
    steps: ["List squares up to n.", "dp[0] = 0; for i = 1..n take the min over squares.", "Return dp[n]."],
    time: "O(n sqrt n)", space: "O(n)",
    trap: "Greedy (take the largest square) fails: 12 = 4+4+4, not 9+1+1+1.",
    code: `class Solution:
    def numSquares(self, n: int) -> int:
        squares = [k * k for k in range(1, int(n ** 0.5) + 1)]
        dp = [0] + [n] * n          # dp[i] = fewest squares summing to i (n ones always works)
        for i in range(1, n + 1):
            for sq in squares:
                if sq > i:
                    break
                dp[i] = min(dp[i], dp[i - sq] + 1)
        return dp[n]`
  },
  {
    num: 518, title: "Coin Change II", slug: "coin-change-ii", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack unbounded: reuse items",
    level: 3,
    order: 340,
    core: true,
    teaches: "Counting combinations (order ignored): put the coin loop OUTSIDE the amount loop.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [322, 377],
    hints: [
      "1+2 and 2+1 should count once. How can a loop order enforce that?",
      "Process coins one at a time: every combination is built in coin order, so it is counted once.",
      "dp[0] = 1; for each coin c: for a from c up to amount: dp[a] += dp[a-c] (forward = reuse allowed)."
    ],
    steps: ["dp[0] = 1.", "For c in coins: for a in c..amount: dp[a] += dp[a-c].", "Return dp[amount]."],
    time: "O(amount * n)", space: "O(amount)",
    trap: "Amount-outer loops count permutations (that's 377 Combination Sum IV).",
    code: `class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        dp = [0] * (amount + 1)     # dp[a] = combinations (order ignored) that make a
        dp[0] = 1
        for c in coins:                          # coin outside: each combination counted once
            for a in range(c, amount + 1):       # left-to-right: coin c reusable
                dp[a] += dp[a - c]
        return dp[amount]`
  },
  {
    num: 1218, title: "Longest Arithmetic Subsequence of Given Difference", slug: "longest-arithmetic-subsequence-of-given-difference", lc: "Medium",
    topic: "dp",
    pattern: "LIS: best chain ending at i",
    level: 3,
    order: 350,
    core: false,
    teaches: "When the previous value is fixed (x - d), a hash map replaces the inner loop.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [300],
    hints: [
      "In this LIS variant, which value must come right before x?",
      "Exactly x - difference. State: dp[v] = longest chain ending with value v seen so far.",
      "dp[x] = dp.get(x - difference, 0) + 1."
    ],
    steps: ["dp = {}.", "For each x: dp[x] = dp.get(x - d, 0) + 1.", "Return max(dp.values())."],
    time: "O(n)", space: "O(n)",
    trap: "The O(n^2) LIS loop times out at n = 10^5.",
    code: `class Solution:
    def longestSubsequence(self, arr: list[int], difference: int) -> int:
        dp = {}                      # dp[v] = longest chain ending with value v so far
        for x in arr:
            dp[x] = dp.get(x - difference, 0) + 1
        return max(dp.values())`
  },
  {
    num: 1048, title: "Longest String Chain", slug: "longest-string-chain", lc: "Medium",
    topic: "dp",
    pattern: "LIS: best chain ending at i",
    level: 3,
    order: 360,
    core: false,
    teaches: "LIS on words: sort by length, then each word looks up its one-letter-shorter predecessors.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [300],
    hints: [
      "A predecessor is one letter shorter. What order makes predecessors ready first?",
      "Sort by length. State: dp[w] = longest chain ending with w.",
      "dp[w] = 1 + max(dp[w without letter i]) over every i where that word exists."
    ],
    steps: ["Sort words by length.", "For each word, try deleting each letter and look it up in dp.", "Return max(dp.values())."],
    time: "O(n * L^2)", space: "O(n * L)",
    trap: "Comparing every pair of words is O(n^2 L) and slow; deleting letters is faster.",
    code: `class Solution:
    def longestStrChain(self, words: list[str]) -> int:
        dp = {}                      # dp[w] = longest chain ending with word w
        for w in sorted(words, key=len):          # shorter words are ready first
            dp[w] = 1
            for i in range(len(w)):
                prev = w[:i] + w[i + 1:]          # remove one letter
                if prev in dp:
                    dp[w] = max(dp[w], dp[prev] + 1)
        return max(dp.values())`
  },
  {
    num: 368, title: "Largest Divisible Subset", slug: "largest-divisible-subset", lc: "Medium",
    topic: "dp",
    pattern: "LIS: best chain ending at i",
    level: 3,
    order: 370,
    core: false,
    teaches: "LIS with a divisibility link, plus a parent array to rebuild the answer.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [300],
    hints: [
      "After sorting, if a divides b and b divides c, does a divide c?",
      "So a chain where each element divides the next is a valid subset. State: dp[i] = longest such chain ending at nums[i].",
      "dp[i] = 1 + max(dp[j]) for j < i with nums[i] % nums[j] == 0; store parent[i] = j to rebuild."
    ],
    steps: ["Sort nums.", "Fill dp and parent with the LIS loop and the divisibility test.", "Start at argmax dp and follow parents; reverse."],
    time: "O(n^2)", space: "O(n)",
    trap: "Without sorting first, the chain property does not hold.",
    code: `class Solution:
    def largestDivisibleSubset(self, nums: list[int]) -> list[int]:
        nums.sort()
        n = len(nums)
        dp = [1] * n                 # dp[i] = largest subset whose biggest element is nums[i]
        parent = [-1] * n
        for i in range(n):
            for j in range(i):
                if nums[i] % nums[j] == 0 and dp[j] + 1 > dp[i]:
                    dp[i] = dp[j] + 1
                    parent[i] = j
        i = max(range(n), key=dp.__getitem__)
        out = []
        while i != -1:               # walk the parent links back
            out.append(nums[i])
            i = parent[i]
        return out[::-1]`
  },
  {
    num: 1143, title: "Longest Common Subsequence", slug: "longest-common-subsequence", lc: "Medium",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 3,
    order: 380,
    core: true,
    teaches: "Two-string DP: dp[i][j] for prefixes; match the last characters or drop one of them.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [392],
    hints: [
      "Compare the LAST characters of text1[:i] and text2[:j]. What if they are equal? If not?",
      "State: dp[i][j] = LCS of text1[:i] and text2[:j]; row 0 and column 0 are 0.",
      "Equal: dp[i-1][j-1] + 1. Different: max(dp[i-1][j], dp[i][j-1]). Two rows are enough."
    ],
    steps: ["prev = [0]*(n+1).", "For each i, build cur with the rule above.", "Return prev[n]."],
    time: "O(m * n)", space: "O(n)",
    trap: "Index carefully: dp[i][j] uses text1[i-1] and text2[j-1].",
    code: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        prev = [0] * (n + 1)         # dp row for i-1; dp[i][j] = LCS of text1[:i], text2[:j]
        for i in range(1, m + 1):
            cur = [0] * (n + 1)
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    cur[j] = prev[j - 1] + 1           # use both last chars
                else:
                    cur[j] = max(prev[j], cur[j - 1])  # drop one of them
            prev = cur
        return prev[n]`
  },
  {
    num: 1035, title: "Uncrossed Lines", slug: "uncrossed-lines", lc: "Medium",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 3,
    order: 390,
    core: false,
    teaches: "Recognise a disguise: non-crossing matching lines are exactly a common subsequence.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1143],
    hints: [
      "Draw two lines that cross. What happens to the order of their endpoints?",
      "Non-crossing lines keep the same order on both sides: that's a common subsequence.",
      "Run LCS on the two arrays."
    ],
    steps: ["Same table as LCS.", "Return dp[m][n]."],
    time: "O(m * n)", space: "O(n)",
    trap: "Trying to greedily match the first equal pair can block better matches.",
    code: `class Solution:
    def maxUncrossedLines(self, nums1: list[int], nums2: list[int]) -> int:
        # Lines that never cross = a common subsequence. This is LCS.
        m, n = len(nums1), len(nums2)
        prev = [0] * (n + 1)
        for i in range(1, m + 1):
            cur = [0] * (n + 1)
            for j in range(1, n + 1):
                if nums1[i - 1] == nums2[j - 1]:
                    cur[j] = prev[j - 1] + 1
                else:
                    cur[j] = max(prev[j], cur[j - 1])
            prev = cur
        return prev[n]`
  },
  {
    num: 583, title: "Delete Operation for Two Strings", slug: "delete-operation-for-two-strings", lc: "Medium",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 3,
    order: 400,
    core: true,
    teaches: "Deleting until equal leaves a common subsequence; keep the longest one.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1143],
    hints: [
      "After all deletions, what is left of both words?",
      "A common subsequence. Fewer deletions = longer kept part = LCS.",
      "Answer = (m - LCS) + (n - LCS)."
    ],
    steps: ["Compute LCS with the two-row table.", "Return m + n - 2 * LCS."],
    time: "O(m * n)", space: "O(n)",
    trap: "Deletions are allowed in both words, so count both sides.",
    code: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        prev = [0] * (n + 1)
        for i in range(1, m + 1):
            cur = [0] * (n + 1)
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    cur[j] = prev[j - 1] + 1
                else:
                    cur[j] = max(prev[j], cur[j - 1])
            prev = cur
        lcs = prev[n]
        return (m - lcs) + (n - lcs)  # delete everything outside the LCS`
  },
  {
    num: 712, title: "Minimum ASCII Delete Sum for Two Strings", slug: "minimum-ascii-delete-sum-for-two-strings", lc: "Medium",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 3,
    order: 410,
    core: false,
    teaches: "Same prefix table, but each choice now has a cost: drop a char and pay its ASCII value.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [583],
    hints: [
      "The longest common subsequence might not be the cheapest to keep. What should dp store instead?",
      "State: dp[i][j] = min delete sum to make s1[:i] and s2[:j] equal. Row/column 0 = sum of the other prefix.",
      "Equal last chars: dp[i-1][j-1]. Else min(dp[i-1][j] + ord(s1[i-1]), dp[i][j-1] + ord(s2[j-1]))."
    ],
    steps: ["Fill the first row with prefix ASCII sums of s2.", "For each row, cur[0] = prev[0] + ord(s1[i-1]); apply the rule.", "Return dp[m][n]."],
    time: "O(m * n)", space: "O(n)",
    trap: "Base row/column are not zero: deleting a whole prefix costs its ASCII sum.",
    code: `class Solution:
    def minimumDeleteSum(self, s1: str, s2: str) -> int:
        m, n = len(s1), len(s2)
        # dp[i][j] = cheapest deletes to make s1[:i] and s2[:j] equal
        prev = [0] * (n + 1)
        for j in range(1, n + 1):
            prev[j] = prev[j - 1] + ord(s2[j - 1])      # s1 empty: delete all of s2[:j]
        for i in range(1, m + 1):
            cur = [0] * (n + 1)
            cur[0] = prev[0] + ord(s1[i - 1])
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    cur[j] = prev[j - 1]                 # keep both, free
                else:
                    cur[j] = min(prev[j] + ord(s1[i - 1]),   # delete s1's last char
                                 cur[j - 1] + ord(s2[j - 1]))  # delete s2's last char
            prev = cur
        return prev[n]`
  },
  {
    num: 5, title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", lc: "Medium",
    topic: "dp",
    pattern: "Palindromes: center or range",
    level: 3,
    order: 420,
    core: true,
    teaches: "Expand around centers, but remember the longest instead of counting.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [647],
    hints: [
      "Reuse the 2n-1 centers from 647.",
      "After expanding, the palindrome is s[l+1 .. r-1] (the loop overshoots by one).",
      "Track the longest. (A dp[i][j] palindrome table also works but uses O(n^2) space.)"
    ],
    steps: ["For each center, expand while equal.", "Compare length r - l - 1 with the best; store bounds.", "Return the best slice."],
    time: "O(n^2)", space: "O(1)",
    trap: "Off-by-one after the loop: the last valid window is l+1..r-1.",
    code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        best_l, best_r = 0, 0
        for center in range(2 * n - 1):
            l, r = center // 2, center // 2 + center % 2
            while l >= 0 and r < n and s[l] == s[r]:
                l -= 1
                r += 1
            # loop overshot by one on each side: palindrome is s[l+1 .. r-1]
            if (r - 1) - (l + 1) > best_r - best_l:
                best_l, best_r = l + 1, r - 1
        return s[best_l:best_r + 1]`
  },
  {
    num: 516, title: "Longest Palindromic Subsequence", slug: "longest-palindromic-subsequence", lc: "Medium",
    topic: "dp",
    pattern: "Palindromes: center or range",
    level: 3,
    order: 430,
    core: true,
    teaches: "Interval DP on a string: dp[i][j] from its inside dp[i+1][j-1] or by dropping one end.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [5, 1143],
    hints: [
      "Subsequence, not substring: you may skip letters. Look at the two ends s[i] and s[j].",
      "State: dp[i][j] = longest palindromic subsequence in s[i..j]; dp[i][i] = 1.",
      "Equal ends: dp[i+1][j-1] + 2. Else max(dp[i+1][j], dp[i][j-1]). Loop i downward."
    ],
    steps: ["Table n x n; i from n-1 down, j from i+1 up.", "Apply the rule.", "Return dp[0][n-1]."],
    time: "O(n^2)", space: "O(n^2)",
    trap: "It equals LCS(s, reverse(s)), a nice cross-check.",
    code: `class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        # dp[i][j] = longest palindromic subsequence inside s[i..j]
        dp = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):           # i goes down so dp[i+1][*] is ready
            dp[i][i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    dp[i][j] = dp[i + 1][j - 1] + 2   # wrap the inside with both ends
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
        return dp[0][n - 1]`
  },
  {
    num: 486, title: "Predict the Winner", slug: "predict-the-winner", lc: "Medium",
    topic: "dp",
    pattern: "Interval: split the range l..r",
    level: 3,
    order: 440,
    core: false,
    teaches: "Same game DP; player 1 wins ties.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [877],
    hints: [
      "This is Stone Game without the guarantees. Reuse the score-lead state.",
      "dp[i][j] = max(nums[i] - dp[i+1][j], nums[j] - dp[i][j-1]).",
      "Player 1 wins if dp[0][n-1] >= 0."
    ],
    steps: ["dp[i][i] = nums[i].", "Fill by i downward.", "Return dp[0][n-1] >= 0."],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Greedy 'take the bigger end' loses to a smart opponent.",
    code: `class Solution:
    def predictTheWinner(self, nums: list[int]) -> bool:
        n = len(nums)
        dp = [[0] * n for _ in range(n)]         # dp[i][j] = best score lead for the player to move
        for i in range(n - 1, -1, -1):
            dp[i][i] = nums[i]
            for j in range(i + 1, n):
                dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1])
        return dp[0][n - 1] >= 0                 # a tie counts as a win for player 1`
  },
  {
    num: 337, title: "House Robber III", slug: "house-robber-iii", lc: "Medium",
    topic: "dp",
    pattern: "Tree DP: tuple from children",
    level: 3,
    order: 450,
    core: true,
    teaches: "Tree DP: each node returns a small tuple (rob me, skip me) to its parent.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [198],
    hints: [
      "House Robber on a tree: what does a parent need to know about a child?",
      "Return (best if child is robbed, best if child is skipped) from a post-order DFS.",
      "rob = val + l.skip + r.skip; skip = max(l) + max(r). Answer = max at the root."
    ],
    steps: ["dfs(None) = (0, 0).", "Combine children as above.", "Return max(dfs(root))."],
    time: "O(n)", space: "O(h)",
    trap: "Grandchildren-based recursion without memo repeats work exponentially.",
    code: `class Solution:
    def rob(self, root) -> int:
        def dfs(node):
            # returns (best if we rob node, best if we skip node)
            if not node:
                return 0, 0
            l_rob, l_skip = dfs(node.left)
            r_rob, r_skip = dfs(node.right)
            rob_here = node.val + l_skip + r_skip            # children must be skipped
            skip_here = max(l_rob, l_skip) + max(r_rob, r_skip)
            return rob_here, skip_here
        return max(dfs(root))`
  },
  {
    num: 894, title: "All Possible Full Binary Trees", slug: "all-possible-full-binary-trees", lc: "Medium",
    topic: "dp",
    pattern: "Tree DP: tuple from children",
    level: 3,
    order: 460,
    core: false,
    teaches: "Memoize by size: every full tree of size k = root + full trees of odd sizes that add up to k-1.",
    learn: ["dsa_dp", "dsa-dp-memo"],
    pre: [96],
    hints: [
      "A full binary tree has an odd number of nodes. How can the left and right sizes split k-1?",
      "State: build(k) = list of all full trees with k nodes; build(1) = [single node].",
      "For each odd left size L: pair every tree in build(L) with every tree in build(k-1-L)."
    ],
    steps: ["Return [] for even n.", "Memoized build(k) loops over odd left sizes and combines.", "Return build(n)."],
    time: "O(n * C(n))", space: "O(n * C(n))",
    trap: "C(n) = number of answers (Catalan-sized). Output size is Catalan-like; sharing subtrees between answers is fine.",
    code: `from functools import cache

class Solution:
    def allPossibleFBT(self, n: int) -> list:
        @cache
        def build(k):                            # every full binary tree with k nodes
            if k == 1:
                return [TreeNode(0)]
            out = []
            for left in range(1, k - 1, 2):      # odd sizes only
                for L in build(left):
                    for R in build(k - 1 - left):
                        out.append(TreeNode(0, L, R))   # subtrees may be shared; that is allowed
            return out
        return build(n) if n % 2 else []`
  },
  {
    num: 1879, title: "Minimum XOR Sum of Two Arrays", slug: "minimum-xor-sum-of-two-arrays", lc: "Hard",
    topic: "dp",
    pattern: "Bitmask DP: set of used items",
    level: 3,
    order: 470,
    core: false,
    teaches: "Assignment DP: the mask says which partners are used; its popcount says who is next.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [526],
    hints: [
      "n <= 14: trying all n! pairings is too slow, but 2^n subsets is fine.",
      "State: dp[mask] = min cost pairing nums1[0..k-1] with the nums2 indices in mask, where k = popcount(mask).",
      "From mask, give nums1[k] any unused j: dp[mask | 1<<j] = min(.., dp[mask] + (nums1[k] ^ nums2[j]))."
    ],
    steps: ["dp[0] = 0, others inf.", "For each mask in increasing order, push to masks with one more bit.", "Return dp[full]."],
    time: "O(2^n * n)", space: "O(2^n)",
    trap: "You don't need i in the state: popcount(mask) already tells you.",
    code: `class Solution:
    def minimumXORSum(self, nums1: list[int], nums2: list[int]) -> int:
        n = len(nums1)
        INF = float('inf')
        dp = [INF] * (1 << n)    # dp[mask] = best cost pairing nums1[0..k-1] with the nums2 indices in mask (k = popcount)
        dp[0] = 0
        for mask in range(1 << n):
            if dp[mask] == INF:
                continue
            i = bin(mask).count('1')             # next nums1 index to place
            if i == n:
                continue
            for j in range(n):
                if not mask >> j & 1:
                    nxt = mask | 1 << j
                    dp[nxt] = min(dp[nxt], dp[mask] + (nums1[i] ^ nums2[j]))
        return dp[(1 << n) - 1]`
  },
  {
    num: 714, title: "Best Time to Buy and Sell Stock with Transaction Fee", slug: "best-time-to-buy-and-sell-stock-with-transaction-fee", lc: "Medium",
    topic: "dp",
    pattern: "State machine: stock trading",
    level: 3,
    order: 480,
    core: true,
    teaches: "Two states per day: holding a share or not. A fee changes only the sell transition.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [122],
    hints: [
      "At the end of each day you either hold a share or you don't.",
      "hold = best money while holding; cash = best money while not holding.",
      "hold = max(hold, cash - p); cash = max(cash, hold + p - fee)."
    ],
    steps: ["hold = -inf, cash = 0.", "Update both from the old values each day.", "Return cash."],
    time: "O(n)", space: "O(1)",
    trap: "Charge the fee once per transaction (on sell OR on buy, not both).",
    code: `class Solution:
    def maxProfit(self, prices: list[int], fee: int) -> int:
        hold, cash = float('-inf'), 0            # best money while holding / not holding a share
        for p in prices:
            hold, cash = max(hold, cash - p), max(cash, hold + p - fee)   # pay the fee when selling
        return cash`
  },
  {
    num: 309, title: "Best Time to Buy and Sell Stock with Cooldown", slug: "best-time-to-buy-and-sell-stock-with-cooldown", lc: "Medium",
    topic: "dp",
    pattern: "State machine: stock trading",
    level: 3,
    order: 490,
    core: true,
    teaches: "Add a state when a rule needs memory: cooldown = a 'just sold' state.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [122],
    hints: [
      "After selling you can't buy tomorrow. What extra fact must you remember?",
      "Three states: hold, sold (sold today), rest (free, may buy).",
      "hold = max(hold, rest - p); sold = hold + p; rest = max(rest, sold). Use old values on the right."
    ],
    steps: ["hold = -inf, sold = rest = 0.", "Update all three at once each day.", "Return max(sold, rest)."],
    time: "O(n)", space: "O(1)",
    trap: "Buying from 'sold' breaks the cooldown; buy only from 'rest'.",
    code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        hold, sold, rest = float('-inf'), 0, 0   # holding / just sold today / free to buy
        for p in prices:
            hold, sold, rest = (max(hold, rest - p),   # keep holding, or buy (only from rest)
                                hold + p,              # sell today
                                max(rest, sold))       # cooldown ends
        return max(sold, rest)`
  },
  {
    num: 1155, title: "Number of Dice Rolls With Target Sum", slug: "number-of-dice-rolls-with-target-sum", lc: "Medium",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 3,
    order: 500,
    core: true,
    teaches: "Count sums layer by layer: one more die each round.",
    learn: ["dsa_dp", "dsa-dp-recipe"],
    pre: [2466],
    hints: [
      "With one more die, how did the sum t come about?",
      "State: dp[t] = ways the dice so far sum to t; dp[0] = 1 with zero dice.",
      "new[t] = sum of dp[t - f] for faces f = 1..k."
    ],
    steps: ["dp = [1, 0, ...].", "Repeat n times, building new from dp.", "Return dp[target] mod 1e9+7."],
    time: "O(n * target * k)", space: "O(target)",
    trap: "Use a fresh array per die: each die must be used exactly once.",
    code: `class Solution:
    def numRollsToTarget(self, n: int, k: int, target: int) -> int:
        MOD = 10**9 + 7
        dp = [1] + [0] * target                  # dp[t] = ways to reach sum t with the dice so far
        for _ in range(n):
            new = [0] * (target + 1)
            for t in range(1, target + 1):
                for face in range(1, min(k, t) + 1):
                    new[t] += dp[t - face]       # this die shows \`face\`
                new[t] %= MOD
            dp = new
        return dp[target]`
  },
  {
    num: 790, title: "Domino and Tromino Tiling", slug: "domino-and-tromino-tiling", lc: "Medium",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 3,
    order: 510,
    core: false,
    teaches: "Find the recurrence from small cases: dp[n] = 2*dp[n-1] + dp[n-3].",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [70],
    hints: [
      "Draw the boards for n = 1, 2, 3, 4: 1, 2, 5, 11.",
      "Track also partial boards (one cell sticking out) or guess from the numbers.",
      "dp[n] = 2*dp[n-1] + dp[n-3] with dp[0] = 1, dp[1] = 1, dp[2] = 2."
    ],
    steps: ["Seed dp[0..2] = 1, 1, 2.", "Fill up to n with the rule, mod 1e9+7.", "Return dp[n]."],
    time: "O(n)", space: "O(n)",
    trap: "Trominoes create 'jagged' states; ignoring them gives plain Fibonacci (wrong).",
    code: `class Solution:
    def numTilings(self, n: int) -> int:
        MOD = 10**9 + 7
        dp = [1, 1, 2] + [0] * max(0, n - 2)     # dp[i] = tilings of a 2 x i board
        for i in range(3, n + 1):
            dp[i] = (2 * dp[i - 1] + dp[i - 3]) % MOD
        return dp[n]`
  },
  {
    num: 935, title: "Knight Dialer", slug: "knight-dialer", lc: "Medium",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 3,
    order: 520,
    core: false,
    teaches: "Count by the last key: each digit spreads its count to the digits a knight can reach.",
    learn: ["dsa_dp", "dsa-dp-recipe"],
    pre: [1220],
    hints: [
      "To extend a number, which fact about it matters?",
      "Only the last digit. dp[d] = numbers of the current length ending on d.",
      "Each step: new[next] += dp[d] for every knight move d -> next; 5 has no moves."
    ],
    steps: ["dp = [1]*10.", "Repeat n-1 times with the move table.", "Return sum mod 1e9+7."],
    time: "O(n)", space: "O(1)",
    trap: "For n = 1, digit 5 counts (answer 10).",
    code: `class Solution:
    def knightDialer(self, n: int) -> int:
        MOD = 10**9 + 7
        moves = {0: (4, 6), 1: (6, 8), 2: (7, 9), 3: (4, 8), 4: (0, 3, 9),
                 5: (), 6: (0, 1, 7), 7: (2, 6), 8: (1, 3), 9: (2, 4)}
        dp = [1] * 10                            # dp[d] = numbers of the current length ending on digit d
        for _ in range(n - 1):
            new = [0] * 10
            for d in range(10):
                for nxt in moves[d]:
                    new[nxt] = (new[nxt] + dp[d]) % MOD
            dp = new
        return sum(dp) % MOD`
  },
  {
    num: 576, title: "Out of Boundary Paths", slug: "out-of-boundary-paths", lc: "Medium",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 3,
    order: 530,
    core: false,
    teaches: "Grid DP over time: dp[r][c] after k moves, and count every move that leaves the grid.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [62],
    hints: [
      "Paths can revisit cells, so the state needs the number of moves made.",
      "dp[r][c] = ways to be at (r, c) after this many moves.",
      "Each move spreads dp[r][c] to 4 neighbours; a neighbour outside adds dp[r][c] to the answer."
    ],
    steps: ["dp[start] = 1.", "Repeat maxMove times, building a new grid and counting exits.", "Return the total mod 1e9+7."],
    time: "O(maxMove * m * n)", space: "O(m * n)",
    trap: "Count exits on every move, not only after the last one.",
    code: `class Solution:
    def findPaths(self, m: int, n: int, maxMove: int, startRow: int, startColumn: int) -> int:
        MOD = 10**9 + 7
        dp = [[0] * n for _ in range(m)]         # dp[r][c] = ways to stand on (r, c) after this many moves
        dp[startRow][startColumn] = 1
        out = 0
        for _ in range(maxMove):
            new = [[0] * n for _ in range(m)]
            for r in range(m):
                for c in range(n):
                    if not dp[r][c]:
                        continue
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= nr < m and 0 <= nc < n:
                            new[nr][nc] = (new[nr][nc] + dp[r][c]) % MOD
                        else:
                            out = (out + dp[r][c]) % MOD   # this move leaves the grid
            dp = new
        return out`
  },
  {
    num: 688, title: "Knight Probability in Chessboard", slug: "knight-probability-in-chessboard", lc: "Medium",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 3,
    order: 540,
    core: false,
    teaches: "Same spreading DP with probabilities instead of counts.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [576],
    hints: [
      "Each jump picks one of 8 moves with probability 1/8.",
      "dp[r][c] = probability of being on (r, c) after this many moves.",
      "Spread dp[r][c] / 8 to each on-board target; the answer is the total probability left on the board."
    ],
    steps: ["dp[start] = 1.0.", "Repeat k times.", "Return the sum of dp."],
    time: "O(k * n^2)", space: "O(n^2)",
    trap: "Simulating random walks is too slow and inexact.",
    code: `class Solution:
    def knightProbability(self, n: int, k: int, row: int, column: int) -> float:
        jumps = ((1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1))
        dp = [[0.0] * n for _ in range(n)]       # dp[r][c] = probability of being on (r, c) now
        dp[row][column] = 1.0
        for _ in range(k):
            new = [[0.0] * n for _ in range(n)]
            for r in range(n):
                for c in range(n):
                    if dp[r][c]:
                        for dr, dc in jumps:
                            nr, nc = r + dr, c + dc
                            if 0 <= nr < n and 0 <= nc < n:
                                new[nr][nc] += dp[r][c] / 8
            dp = new
        return sum(map(sum, dp))`
  },
  {
    num: 1269, title: "Number of Ways to Stay in the Same Place After Some Steps", slug: "number-of-ways-to-stay-in-the-same-place-after-some-steps", lc: "Hard",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 3,
    order: 550,
    core: false,
    teaches: "Spreading DP on a line, and cap the width: you can't go farther than steps/2 and return.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [576],
    hints: [
      "arrLen can be 10^6, but how far can you go and still get back?",
      "Only to index steps // 2. State: dp[i] = ways to be at index i now.",
      "new[i] = dp[i] + dp[i-1] + dp[i+1] (stay, from left, from right)."
    ],
    steps: ["width = min(arrLen, steps//2 + 1).", "Repeat steps times.", "Return dp[0] mod 1e9+7."],
    time: "O(steps * min(n, steps))", space: "O(min(n, steps))",
    trap: "Without the width cap you build arrays of 10^6 per step.",
    code: `class Solution:
    def numWays(self, steps: int, arrLen: int) -> int:
        MOD = 10**9 + 7
        width = min(arrLen, steps // 2 + 1)      # farther than steps/2 and you can't come back
        dp = [0] * width                         # dp[i] = ways to be at index i now
        dp[0] = 1
        for _ in range(steps):
            new = [0] * width
            for i in range(width):
                total = dp[i]                                  # stay
                if i > 0:
                    total += dp[i - 1]                         # came from the left
                if i + 1 < width:
                    total += dp[i + 1]                         # came from the right
                new[i] = total % MOD
            dp = new
        return dp[0]`
  },
  {
    num: 902, title: "Numbers At Most N Given Digit Set", slug: "numbers-at-most-n-given-digit-set", lc: "Hard",
    topic: "dp",
    pattern: "Digit DP: build numbers up to N",
    level: 3,
    order: 560,
    core: false,
    teaches: "Digit DP basics: count shorter numbers freely, then walk N's digits while 'tight'.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [357],
    hints: [
      "Numbers with fewer digits than N are always <= N. How many are there?",
      "For the same length, go digit by digit: a smaller digit here frees the rest (d^(rest) options).",
      "If N's digit is not in the set, stop; if you get through all digits, add 1 for N itself."
    ],
    steps: ["total = sum of d^k for k < L.", "For each position, add smaller * d^(L-i-1); stop if N's digit is missing.", "Return total (+1 if N was fully matched)."],
    time: "O(L * d)", space: "O(1)",
    trap: "Forgetting the final +1 when N itself is buildable.",
    code: `class Solution:
    def atMostNGivenDigitSet(self, digits: list[str], n: int) -> int:
        s = str(n)
        L, d = len(s), len(digits)
        total = sum(d ** k for k in range(1, L))  # every shorter number is fine
        for i, ch in enumerate(s):               # same length: walk the digits of n
            smaller = sum(1 for x in digits if x < ch)
            total += smaller * d ** (L - i - 1)  # put a smaller digit here, anything after
            if ch not in digits:
                return total                     # can't copy n's digit: stop
        return total + 1                         # n itself can be built`
  },
  {
    num: 2008, title: "Maximum Earnings From Taxi", slug: "maximum-earnings-from-taxi", lc: "Medium",
    topic: "dp",
    pattern: "1D: take or skip",
    level: 4,
    order: 570,
    core: false,
    teaches: "Weighted interval choice: index the DP by position and group the rides by where they end.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [2140],
    hints: [
      "At point p, either no ride ended here, or some ride (s, p) ended here.",
      "State: dp[p] = best earnings when the taxi has reached point p.",
      "Recurrence: dp[p] = max(dp[p-1], max over rides ending at p of dp[s] + (p - s + tip))."
    ],
    steps: ["Bucket rides by end point.", "For p from 1 to n: dp[p] = dp[p-1]; for each ride (s, earn) ending at p, dp[p] = max(dp[p], dp[s] + earn).", "Return dp[n]."],
    time: "O(n + m)", space: "O(n + m)",
    trap: "Earnings are end - start + tip, not just tip.",
    code: `class Solution:
    def maxTaxiEarnings(self, n: int, rides: list[list[int]]) -> int:
        ending = [[] for _ in range(n + 1)]
        for s, e, tip in rides:
            ending[e].append((s, e - s + tip))
        dp = [0] * (n + 1)       # dp[p] = best earnings once the taxi reaches point p
        for p in range(1, n + 1):
            dp[p] = dp[p - 1]    # no ride ends here
            for s, earn in ending[p]:
                dp[p] = max(dp[p], dp[s] + earn)
        return dp[n]`
  },
  {
    num: 329, title: "Longest Increasing Path in a Matrix", slug: "longest-increasing-path-in-a-matrix", lc: "Hard",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 4,
    order: 580,
    core: false,
    teaches: "When moves are not just right/down, find an order where dependencies are ready (here: by value).",
    learn: ["dsa_dp", "dsa-dp-memo"],
    pre: [64],
    hints: [
      "Paths can go in any direction, so row order doesn't work. What always increases along a path?",
      "State: dp[r][c] = longest increasing path starting at (r, c) = 1 + max dp of bigger neighbours.",
      "Process cells from largest value to smallest (or use memoized DFS); bigger neighbours are already done."
    ],
    steps: ["Sort all cells by value, descending.", "For each cell: dp = 1 + max(dp of neighbours with a larger value, else 0).", "Return the max dp."],
    time: "O(mn log(mn))", space: "O(mn)",
    trap: "Memoized DFS is O(mn) but can hit Python's recursion limit on a long snake path.",
    code: `class Solution:
    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:
        m, n = len(matrix), len(matrix[0])
        cells = sorted(((matrix[r][c], r, c) for r in range(m) for c in range(n)), reverse=True)
        dp = [[1] * n for _ in range(m)]   # dp[r][c] = longest path starting at (r, c)
        best = 1
        for v, r, c in cells:              # bigger values first: their answers are ready
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > v:
                    dp[r][c] = max(dp[r][c], 1 + dp[nr][nc])
            best = max(best, dp[r][c])
        return best`
  },
  {
    num: 174, title: "Dungeon Game", slug: "dungeon-game", lc: "Hard",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 4,
    order: 590,
    core: false,
    teaches: "Some grid DPs must run backwards: the need at a cell depends on what comes after it.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [64],
    hints: [
      "Going forward you need to track both current health and the lowest point. Going backward?",
      "State: need[r][c] = minimum health when entering (r, c) to survive to the end.",
      "need[r][c] = max(1, min(need below, need right) - dungeon[r][c]); at the princess: max(1, 1 - d)."
    ],
    steps: ["Fill a row of size n+1 with infinity, from bottom-right to top-left.", "For the princess cell use 1 as the next need; otherwise min of below/right.", "need = max(1, next - d); return dp[0]."],
    time: "O(m * n)", space: "O(n)",
    trap: "Health must be at least 1 at every moment, not just at the end: the max(1, ...) handles that.",
    code: `class Solution:
    def calculateMinimumHP(self, dungeon: list[list[int]]) -> int:
        m, n = len(dungeon), len(dungeon[0])
        INF = float('inf')
        dp = [INF] * (n + 1)     # dp[c] = min health needed when ENTERING (r, c)
        for r in range(m - 1, -1, -1):
            for c in range(n - 1, -1, -1):
                if r == m - 1 and c == n - 1:
                    need = 1                       # must still be alive after the princess room
                else:
                    need = min(dp[c], dp[c + 1])   # below (old dp[c]) or right
                dp[c] = max(1, need - dungeon[r][c])
        return dp[0]`
  },
  {
    num: 1049, title: "Last Stone Weight II", slug: "last-stone-weight-ii", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack 0/1: each item once",
    level: 4,
    order: 600,
    core: false,
    teaches: "Smashing stones = splitting into two piles and taking the difference; minimise it with subset sum.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [416],
    hints: [
      "Write the final stone as a sum of stones with + and - signs.",
      "So the answer is |pile A - pile B|. Make pile A as close to total/2 as possible.",
      "Boolean knapsack up to total//2; best = largest reachable s; answer = total - 2*best."
    ],
    steps: ["half = total // 2; dp[0] = True.", "For each stone, loop s backwards from half and mark reachable sums.", "Return total - 2 * max reachable s."],
    time: "O(n * total)", space: "O(total)",
    trap: "Simulating 'smash the two heaviest' (greedy) gives wrong answers.",
    code: `class Solution:
    def lastStoneWeightII(self, stones: list[int]) -> int:
        total = sum(stones)
        half = total // 2
        dp = [False] * (half + 1)   # dp[s] = one pile can weigh exactly s
        dp[0] = True
        for x in stones:
            for s in range(half, x - 1, -1):
                if dp[s - x]:
                    dp[s] = True
        best = max(s for s in range(half + 1) if dp[s])
        return total - 2 * best     # the two piles smash into their difference`
  },
  {
    num: 474, title: "Ones and Zeroes", slug: "ones-and-zeroes", lc: "Medium",
    topic: "dp",
    pattern: "Knapsack 0/1: each item once",
    level: 4,
    order: 610,
    core: false,
    teaches: "Knapsack with two capacities: a 2D dp, both loops backwards.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [416],
    hints: [
      "Each string costs some zeros and some ones. How many budgets do you have?",
      "State: dp[z][o] = most strings using at most z zeros and o ones.",
      "For each string (zc, oc): for z down from m, o down from n: dp[z][o] = max(dp[z][o], dp[z-zc][o-oc] + 1)."
    ],
    steps: ["dp = (m+1) x (n+1) zeros.", "For each string, count zeros/ones, then loop both capacities backwards.", "Return dp[m][n]."],
    time: "O(L * m * n)", space: "O(m * n)",
    trap: "Either capacity looped forward lets a string be taken twice.",
    code: `class Solution:
    def findMaxForm(self, strs: list[str], m: int, n: int) -> int:
        dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[z][o] = most strings within z zeros, o ones
        for s in strs:
            zeros = s.count('0')
            ones = len(s) - zeros
            for z in range(m, zeros - 1, -1):        # both capacities backwards
                for o in range(n, ones - 1, -1):
                    dp[z][o] = max(dp[z][o], dp[z - zeros][o - ones] + 1)
        return dp[m][n]`
  },
  {
    num: 1449, title: "Form Largest Integer With Digits That Add up to Target", slug: "form-largest-integer-with-digits-that-add-up-to-target", lc: "Hard",
    topic: "dp",
    pattern: "Knapsack unbounded: reuse items",
    level: 4,
    order: 620,
    core: false,
    teaches: "Two steps: unbounded knapsack for the max digit count, then rebuild the largest string greedily.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [322],
    hints: [
      "Which matters more for 'largest number': more digits or bigger digits?",
      "State: dp[t] = most digits with cost exactly t (-inf if impossible). dp[t] = max(dp[t - cost[d]] + 1).",
      "Rebuild: from t = target, pick the biggest digit d with dp[t - cost[d]] == dp[t] - 1; repeat."
    ],
    steps: ["Fill dp for t = 1..target over the 9 costs.", "If dp[target] < 0 return '0'.", "Walk down from target choosing the largest digit that keeps the count optimal."],
    time: "O(9 * target)", space: "O(target)",
    trap: "Cost must be EXACTLY target; init with -inf, not 0.",
    code: `class Solution:
    def largestNumber(self, cost: list[int], target: int) -> str:
        NEG = float('-inf')
        dp = [NEG] * (target + 1)   # dp[t] = most digits whose costs sum to exactly t
        dp[0] = 0
        for t in range(1, target + 1):
            for c in cost:
                if c <= t and dp[t - c] + 1 > dp[t]:
                    dp[t] = dp[t - c] + 1
        if dp[target] < 0:
            return "0"
        out, t = [], target
        while t > 0:                             # greedily place the biggest digit that keeps max length
            for d in range(9, 0, -1):
                c = cost[d - 1]
                if c <= t and dp[t - c] == dp[t] - 1:
                    out.append(str(d))
                    t -= c
                    break
        return ''.join(out)`
  },
  {
    num: 673, title: "Number of Longest Increasing Subsequence", slug: "number-of-longest-increasing-subsequence", lc: "Medium",
    topic: "dp",
    pattern: "LIS: best chain ending at i",
    level: 4,
    order: 630,
    core: true,
    teaches: "Carry a count next to each dp value: how many ways reach that best length.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [300],
    hints: [
      "Alongside the LIS length ending at i, what else do you need to count the longest ones?",
      "Keep length[i] and count[i]. When j improves length[i], copy count[j]; when it ties, add count[j].",
      "Answer: sum of count[i] over all i with length[i] == max length."
    ],
    steps: ["length = count = [1]*n.", "For i, j < i, nums[j] < nums[i]: improve (set) or tie (add).", "Sum counts at the max length."],
    time: "O(n^2)", space: "O(n)",
    trap: "On a tie you must ADD, and on an improvement RESET the count.",
    code: `class Solution:
    def findNumberOfLIS(self, nums: list[int]) -> int:
        n = len(nums)
        length = [1] * n             # longest increasing subsequence ending at i
        count = [1] * n              # how many of that length end at i
        for i in range(n):
            for j in range(i):
                if nums[j] < nums[i]:
                    if length[j] + 1 > length[i]:
                        length[i] = length[j] + 1
                        count[i] = count[j]          # new best: inherit j's count
                    elif length[j] + 1 == length[i]:
                        count[i] += count[j]         # another way to the same best
        best = max(length)
        return sum(c for l, c in zip(length, count) if l == best)`
  },
  {
    num: 1027, title: "Longest Arithmetic Subsequence", slug: "longest-arithmetic-subsequence", lc: "Medium",
    topic: "dp",
    pattern: "LIS: best chain ending at i",
    level: 4,
    order: 640,
    core: false,
    teaches: "Add the step size to the state: dp[i][d] = longest arithmetic run ending at i with difference d.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1218],
    hints: [
      "An arithmetic subsequence is fixed by its last element and its difference.",
      "State: dp[i] is a dict: d -> length of the longest run ending at i with step d.",
      "For each j < i: d = nums[i] - nums[j]; dp[i][d] = dp[j].get(d, 1) + 1."
    ],
    steps: ["dp = list of dicts.", "Double loop over j < i updating dp[i][d].", "Return the largest value seen (at least 2)."],
    time: "O(n^2)", space: "O(n^2)",
    trap: "dp[j].get(d, 1): a pair (j, i) is already length 2.",
    code: `class Solution:
    def longestArithSeqLength(self, nums: list[int]) -> int:
        n = len(nums)
        dp = [dict() for _ in range(n)]   # dp[i][d] = longest arithmetic run ending at i with step d
        best = 2
        for i in range(n):
            for j in range(i):
                d = nums[i] - nums[j]
                dp[i][d] = dp[j].get(d, 1) + 1
                best = max(best, dp[i][d])
        return best`
  },
  {
    num: 97, title: "Interleaving String", slug: "interleaving-string", lc: "Medium",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 4,
    order: 650,
    core: true,
    teaches: "Prefix DP with a coupled index: s3[:i+j] is built from s1[:i] and s2[:j].",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1143],
    hints: [
      "Greedily taking from s1 when chars match can fail. What should the state remember?",
      "State: dp[i][j] = s1[:i] and s2[:j] can interleave to s3[:i+j].",
      "dp[i][j] = (dp[i-1][j] and s1[i-1] == s3[i+j-1]) or (dp[i][j-1] and s2[j-1] == s3[i+j-1])."
    ],
    steps: ["If lengths don't add up, return False.", "dp[0][0] = True; fill row by row with one array.", "Return dp[n]."],
    time: "O(m * n)", space: "O(n)",
    trap: "Check len(s1) + len(s2) == len(s3) first.",
    code: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        dp = [False] * (n + 1)       # dp[j] (row i) = s1[:i] and s2[:j] can build s3[:i+j]
        for i in range(m + 1):
            for j in range(n + 1):
                if i == 0 and j == 0:
                    dp[j] = True
                    continue
                from_s1 = i > 0 and dp[j] and s1[i - 1] == s3[i + j - 1]       # dp[j] is still row i-1
                from_s2 = j > 0 and dp[j - 1] and s2[j - 1] == s3[i + j - 1]
                dp[j] = from_s1 or from_s2
        return dp[n]`
  },
  {
    num: 1458, title: "Max Dot Product of Two Subsequences", slug: "max-dot-product-of-two-subsequences", lc: "Hard",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 4,
    order: 660,
    core: false,
    teaches: "Two-sequence DP where the result must be non-empty: 'start fresh with this pair' is its own option.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1143],
    hints: [
      "LCS-style, but what if every product is negative? Empty is not allowed.",
      "State: dp[i][j] = best dot product of NON-EMPTY subsequences of nums1[:i], nums2[:j]; init -inf.",
      "dp[i][j] = max(p, p + dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) with p = nums1[i-1]*nums2[j-1]."
    ],
    steps: ["dp filled with -inf.", "Apply the four-option max for every (i, j).", "Return dp[m][n]."],
    time: "O(m * n)", space: "O(m * n)",
    trap: "Init with 0 and you wrongly allow empty (all-negative case returns 0).",
    code: `class Solution:
    def maxDotProduct(self, nums1: list[int], nums2: list[int]) -> int:
        m, n = len(nums1), len(nums2)
        NEG = float('-inf')
        # dp[i][j] = best dot product of NON-EMPTY subsequences of nums1[:i], nums2[:j]
        dp = [[NEG] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                pair = nums1[i - 1] * nums2[j - 1]
                dp[i][j] = max(pair,                         # start fresh with this pair
                               pair + dp[i - 1][j - 1],      # extend an earlier pairing
                               dp[i - 1][j],                 # skip nums1[i-1]
                               dp[i][j - 1])                 # skip nums2[j-1]
        return dp[m][n]`
  },
  {
    num: 1312, title: "Minimum Insertion Steps to Make a String Palindrome", slug: "minimum-insertion-steps-to-make-a-string-palindrome", lc: "Hard",
    topic: "dp",
    pattern: "Palindromes: center or range",
    level: 4,
    order: 670,
    core: false,
    teaches: "Reduce to a known DP: the chars outside the longest palindromic subsequence each need a twin.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [516],
    hints: [
      "Which characters can stay unpaired with an inserted twin?",
      "The longest palindromic subsequence is already symmetric; every other char needs one insertion.",
      "Answer = n - LPS(s)."
    ],
    steps: ["Compute LPS with the interval table.", "Return n - LPS."],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Counting mismatched mirror positions is wrong; insertions can shift positions.",
    code: `class Solution:
    def minInsertions(self, s: str) -> int:
        n = len(s)
        dp = [[0] * n for _ in range(n)]         # longest palindromic subsequence of s[i..j]
        for i in range(n - 1, -1, -1):
            dp[i][i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    dp[i][j] = dp[i + 1][j - 1] + 2
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
        # keep the longest palindromic subsequence; every other char needs a mirror twin
        return n - dp[0][n - 1]`
  },
  {
    num: 1745, title: "Palindrome Partitioning IV", slug: "palindrome-partitioning-iv", lc: "Hard",
    topic: "dp",
    pattern: "Palindromes: center or range",
    level: 4,
    order: 680,
    core: false,
    teaches: "Precompute a palindrome table once, then try all split points in O(1) each.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [5],
    hints: [
      "Checking each piece from scratch costs O(n) per check. Can you answer 'is s[i..j] a palindrome' instantly?",
      "pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i+1][j-1]).",
      "Try all (i, j) cuts for three non-empty pieces using the table."
    ],
    steps: ["Build pal with i going down.", "For each first cut i with pal[0][i-1], for each j: check pal[i][j] and pal[j+1][n-1].", "Return whether any works."],
    time: "O(n^2)", space: "O(n^2)",
    trap: "All three pieces must be non-empty.",
    code: `class Solution:
    def checkPartitioning(self, s: str) -> bool:
        n = len(s)
        pal = [[False] * n for _ in range(n)]    # pal[i][j] = s[i..j] is a palindrome
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
        for i in range(1, n - 1):                # first piece s[:i]
            if not pal[0][i - 1]:
                continue
            for j in range(i, n - 1):            # middle s[i..j], last s[j+1:]
                if pal[i][j] and pal[j + 1][n - 1]:
                    return True
        return False`
  },
  {
    num: 1130, title: "Minimum Cost Tree From Leaf Values", slug: "minimum-cost-tree-from-leaf-values", lc: "Medium",
    topic: "dp",
    pattern: "Interval: split the range l..r",
    level: 4,
    order: 690,
    core: false,
    teaches: "Classic interval DP: try every split point k of the range i..j.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [486],
    hints: [
      "The root splits the leaves into a left part i..k and a right part k+1..j.",
      "State: dp[i][j] = min non-leaf sum for leaves i..j; dp[i][i] = 0.",
      "dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + max(i..k) * max(k+1..j). Fill by length."
    ],
    steps: ["Precompute range maxima.", "For length 2..n, for i, try every k.", "Return dp[0][n-1]."],
    time: "O(n^3)", space: "O(n^2)",
    trap: "A monotonic stack gives O(n), but the interval DP is the general tool.",
    code: `class Solution:
    def mctFromLeafValues(self, arr: list[int]) -> int:
        n = len(arr)
        big = [[0] * n for _ in range(n)]        # big[i][j] = max(arr[i..j])
        for i in range(n):
            big[i][i] = arr[i]
            for j in range(i + 1, n):
                big[i][j] = max(big[i][j - 1], arr[j])
        dp = [[0] * n for _ in range(n)]         # dp[i][j] = min sum of non-leaf nodes for leaves i..j
        for length in range(2, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                dp[i][j] = min(dp[i][k] + dp[k + 1][j] + big[i][k] * big[k + 1][j]
                               for k in range(i, j))   # root splits leaves into i..k | k+1..j
        return dp[0][n - 1]`
  },
  {
    num: 1039, title: "Minimum Score Triangulation of Polygon", slug: "minimum-score-triangulation-of-polygon", lc: "Medium",
    topic: "dp",
    pattern: "Interval: split the range l..r",
    level: 4,
    order: 700,
    core: false,
    teaches: "Pick the triangle that uses edge (i, j); it splits the polygon into two smaller ranges.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [486],
    hints: [
      "In any triangulation, edge (i, j) belongs to one triangle (i, k, j). What remains?",
      "Two sub-polygons: i..k and k..j. State: dp[i][j] = best score for vertices i..j.",
      "dp[i][j] = min over i < k < j of dp[i][k] + dp[k][j] + v[i]*v[k]*v[j]."
    ],
    steps: ["dp = 0 for ranges with fewer than 3 vertices.", "Fill by length from 3 to n.", "Return dp[0][n-1]."],
    time: "O(n^3)", space: "O(n^2)",
    trap: "k must be strictly between i and j.",
    code: `class Solution:
    def minScoreTriangulation(self, values: list[int]) -> int:
        n = len(values)
        dp = [[0] * n for _ in range(n)]         # dp[i][j] = best for the polygon i, i+1, ..., j
        for length in range(3, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                # edge (i, j) sits in exactly one triangle (i, k, j)
                dp[i][j] = min(dp[i][k] + dp[k][j] + values[i] * values[k] * values[j]
                               for k in range(i + 1, j))
        return dp[0][n - 1]`
  },
  {
    num: 375, title: "Guess Number Higher or Lower II", slug: "guess-number-higher-or-lower-ii", lc: "Medium",
    topic: "dp",
    pattern: "Interval: split the range l..r",
    level: 4,
    order: 710,
    core: false,
    teaches: "Minimax interval DP: you choose the guess (min), the answer is adversarial (max).",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [486],
    hints: [
      "You pick k; the worst case sends you to the more expensive side.",
      "State: dp[i][j] = money that guarantees a win when the number is in [i, j]; dp[i][i] = 0.",
      "dp[i][j] = min over k of k + max(dp[i][k-1], dp[k+1][j])."
    ],
    steps: ["Table of size (n+2) x (n+2) so k-1 and k+1 are safe.", "Fill by length.", "Return dp[1][n]."],
    time: "O(n^3)", space: "O(n^2)",
    trap: "Binary search (middle guess) is not the cheapest; costs depend on k.",
    code: `class Solution:
    def getMoneyAmount(self, n: int) -> int:
        # dp[i][j] = money that guarantees a win when the number is in [i, j]
        dp = [[0] * (n + 2) for _ in range(n + 2)]
        for length in range(2, n + 1):
            for i in range(1, n - length + 2):
                j = i + length - 1
                dp[i][j] = min(k + max(dp[i][k - 1], dp[k + 1][j])   # guess k, worst side follows
                               for k in range(i, j + 1))
        return dp[1][n]`
  },
  {
    num: 2246, title: "Longest Path With Different Adjacent Characters", slug: "longest-path-with-different-adjacent-characters", lc: "Hard",
    topic: "dp",
    pattern: "Tree DP: tuple from children",
    level: 4,
    order: 720,
    core: false,
    teaches: "Longest path through a node = 1 + its two best child chains (diameter pattern) with a filter.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [337],
    hints: [
      "A path bends at its highest node. What does it use from that node's children?",
      "State: down[u] = longest valid chain starting at u going down. Only children with a different letter count.",
      "down[u] = 1 + best; answer = max over u of 1 + best + second best."
    ],
    steps: ["Build children lists; get a DFS order iteratively.", "In reverse order, compute top two child chains with a different letter.", "Track the best 1 + top1 + top2."],
    time: "O(n)", space: "O(n)",
    trap: "n = 10^5: recursive DFS can hit the recursion limit; process in reverse DFS order.",
    code: `class Solution:
    def longestPath(self, parent: list[int], s: str) -> int:
        n = len(parent)
        children = [[] for _ in range(n)]
        for v in range(1, n):
            children[parent[v]].append(v)
        order, stack = [], [0]
        while stack:                             # iterative DFS order (no recursion limit)
            u = stack.pop()
            order.append(u)
            stack.extend(children[u])
        down = [1] * n                           # down[u] = longest valid chain starting at u going down
        best = 1
        for u in reversed(order):                # children before parents
            top1 = top2 = 0                      # two longest child chains with a different letter
            for v in children[u]:
                if s[v] != s[u]:
                    if down[v] > top1:
                        top1, top2 = down[v], top1
                    elif down[v] > top2:
                        top2 = down[v]
            down[u] = 1 + top1
            best = max(best, 1 + top1 + top2)    # path bends at u
        return best`
  },
  {
    num: 464, title: "Can I Win", slug: "can-i-win", lc: "Medium",
    topic: "dp",
    pattern: "Bitmask DP: set of used items",
    level: 4,
    order: 730,
    core: false,
    teaches: "Game DP on a bitmask: a state wins if some move leads to a losing state for the opponent.",
    learn: ["dsa_dp", "dsa-dp-memo"],
    pre: [1879],
    hints: [
      "What fully describes the game position?",
      "The set of used numbers (a mask); the remaining total follows from it. Memoize win(mask).",
      "win = any(k >= remaining or not win(mask | k)) over unused k. Handle total <= 0 and sum < total first."
    ],
    steps: ["Early exits: desired <= 0 -> True; 1+..+M < desired -> False.", "Memoized recursion over masks.", "Return win(0)."],
    time: "O(2^M * M)", space: "O(2^M)",
    trap: "Without the 'sum too small' check, both players run out and the logic misreports.",
    code: `from functools import cache

class Solution:
    def canIWin(self, maxChoosableInteger: int, desiredTotal: int) -> bool:
        M = maxChoosableInteger
        if desiredTotal <= 0:
            return True
        if M * (M + 1) // 2 < desiredTotal:
            return False                         # nobody can ever reach it
        @cache
        def wins(used, remaining):               # can the player to move force a win?
            for k in range(1, M + 1):
                bit = 1 << k
                if used & bit:
                    continue
                if k >= remaining or not wins(used | bit, remaining - k):
                    return True                  # win now, or leave the opponent a losing state
            return False
        return wins(0, desiredTotal)`
  },
  {
    num: 1986, title: "Minimum Number of Work Sessions to Finish the Tasks", slug: "minimum-number-of-work-sessions-to-finish-the-tasks", lc: "Medium",
    topic: "dp",
    pattern: "Bitmask DP: set of used items",
    level: 4,
    order: 740,
    core: false,
    teaches: "Bitmask DP storing a pair: (sessions used, time in the last session), compared lexicographically.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1879],
    hints: [
      "Packing tasks into sessions: what about a set of finished tasks matters for the future?",
      "State: dp[mask] = smallest (sessions, last session load) after doing the tasks in mask.",
      "Add task i: fits -> (s, load + t); else -> (s + 1, t). Keep the smaller pair."
    ],
    steps: ["dp[0] = (1, 0).", "For each mask, try every unused task and relax.", "Return dp[full][0]."],
    time: "O(2^n * n)", space: "O(2^n)",
    trap: "Sorting + greedy bin packing (first fit) is not always optimal.",
    code: `class Solution:
    def minSessions(self, tasks: list[int], sessionTime: int) -> int:
        n = len(tasks)
        INF = (float('inf'), float('inf'))
        # dp[mask] = (sessions used, time used in the last session), smallest pair wins
        dp = [INF] * (1 << n)
        dp[0] = (1, 0)
        for mask in range(1 << n):
            if dp[mask] == INF:
                continue
            s, used = dp[mask]
            for i in range(n):
                if mask >> i & 1:
                    continue
                if used + tasks[i] <= sessionTime:
                    cand = (s, used + tasks[i])  # fits in the current session
                else:
                    cand = (s + 1, tasks[i])     # open a new session
                nxt = mask | 1 << i
                if cand < dp[nxt]:
                    dp[nxt] = cand
        return dp[(1 << n) - 1][0]`
  },
  {
    num: 123, title: "Best Time to Buy and Sell Stock III", slug: "best-time-to-buy-and-sell-stock-iii", lc: "Hard",
    topic: "dp",
    pattern: "State machine: stock trading",
    level: 4,
    order: 750,
    core: true,
    teaches: "At most k transactions = chain of states buy1 -> sell1 -> buy2 -> sell2.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [714],
    hints: [
      "With at most 2 trades, list the stages you can be in.",
      "buy1, sell1, buy2, sell2 = best money after reaching each stage.",
      "buy1 = max(buy1, -p); sell1 = max(sell1, buy1 + p); buy2 = max(buy2, sell1 - p); sell2 = max(sell2, buy2 + p)."
    ],
    steps: ["buys = -inf, sells = 0.", "Update the four in order each day.", "Return sell2."],
    time: "O(n)", space: "O(1)",
    trap: "Splitting at every day and running 121 twice is O(n^2) (or needs prefix/suffix arrays).",
    code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        buy1 = buy2 = float('-inf')
        sell1 = sell2 = 0
        for p in prices:                         # four states, in the order they happen
            buy1 = max(buy1, -p)
            sell1 = max(sell1, buy1 + p)
            buy2 = max(buy2, sell1 - p)
            sell2 = max(sell2, buy2 + p)
        return sell2`
  },
  {
    num: 1639, title: "Number of Ways to Form a Target String Given a Dictionary", slug: "number-of-ways-to-form-a-target-string-given-a-dictionary", lc: "Hard",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 4,
    order: 760,
    core: false,
    teaches: "Count per column, then a two-index DP: column and position in target.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1155],
    hints: [
      "Within one column, which word you pick doesn't matter except for its letter.",
      "cnt[col][ch] = words with ch in that column. dp[j] = ways to build target[:j] with columns so far.",
      "For each column, for j backwards: dp[j] += dp[j-1] * cnt[col][target[j-1]]."
    ],
    steps: ["Build cnt.", "dp = [1, 0, ...]; process columns left to right with j backwards.", "Return dp[len(target)] mod 1e9+7."],
    time: "O(L * (W + t))", space: "O(L + t)",
    trap: "j must go backwards so a column is used once.",
    code: `class Solution:
    def numWays(self, words: list[str], target: str) -> int:
        MOD = 10**9 + 7
        L, t = len(words[0]), len(target)
        cnt = [[0] * 26 for _ in range(L)]       # cnt[col][ch] = how many words have ch in column col
        for w in words:
            for col, ch in enumerate(w):
                cnt[col][ord(ch) - 97] += 1
        dp = [1] + [0] * t                       # dp[j] = ways to build target[:j] using columns so far
        for col in range(L):
            for j in range(min(t, col + 1), 0, -1):   # backwards: each column used at most once
                c = cnt[col][ord(target[j - 1]) - 97]
                if c:
                    dp[j] = (dp[j] + dp[j - 1] * c) % MOD
        return dp[t]`
  },
  {
    num: 2376, title: "Count Special Integers", slug: "count-special-integers", lc: "Hard",
    topic: "dp",
    pattern: "Digit DP: build numbers up to N",
    level: 4,
    order: 770,
    core: false,
    teaches: "Full digit DP template: (position, used-digits mask, tight, started) with memoization.",
    learn: ["dsa_dp", "dsa-dp-memo"],
    pre: [902],
    hints: [
      "What must you remember while placing digits from the left?",
      "Position i, which digits are used (mask), whether you're still equal to N's prefix (tight), and whether a non-zero digit started.",
      "Try each digit up to limit (N's digit if tight, else 9); skip used digits; leading zeros don't use digit 0."
    ],
    steps: ["Memoized go(i, mask, tight, started).", "Return 1 at the end if started.", "Answer = go(0, 0, True, False)."],
    time: "O(L * 2^10 * 10)", space: "O(L * 2^10)",
    trap: "Leading zeros must not mark 0 as used (else 10 is rejected).",
    code: `from functools import cache

class Solution:
    def countSpecialNumbers(self, n: int) -> int:
        s = str(n)
        @cache
        def go(i, used, tight, started):
            # i = position, used = digit mask, tight = still equal to n's prefix, started = past leading zeros
            if i == len(s):
                return 1 if started else 0
            limit = int(s[i]) if tight else 9
            total = 0
            for d in range(limit + 1):
                if started and used >> d & 1:
                    continue                     # repeated digit
                if not started and d == 0:
                    total += go(i + 1, used, tight and d == limit, False)   # still a leading zero
                else:
                    total += go(i + 1, used | 1 << d, tight and d == limit, True)
            return total
        return go(0, 0, True, False)`
  },
  {
    num: 1012, title: "Numbers With Repeated Digits", slug: "numbers-with-repeated-digits", lc: "Hard",
    topic: "dp",
    pattern: "Digit DP: build numbers up to N",
    level: 4,
    order: 780,
    core: false,
    teaches: "Count the complement: numbers with repeats = n - numbers with all-distinct digits.",
    learn: ["dsa_dp", "dsa-dp-memo"],
    pre: [2376],
    hints: [
      "Counting 'at least one repeat' directly is messy. What is easier to count?",
      "Numbers whose digits are all different (2376's digit DP).",
      "Answer = n - unique(n)."
    ],
    steps: ["Reuse the digit DP from 2376.", "Return n - its result."],
    time: "O(L * 2^10 * 10)", space: "O(L * 2^10)",
    trap: "The DP counts 1..n; don't count 0.",
    code: `from functools import cache

class Solution:
    def numDupDigitsAtMostN(self, n: int) -> int:
        s = str(n)
        @cache
        def unique(i, used, tight, started):     # numbers with all-distinct digits (digit DP)
            if i == len(s):
                return 1 if started else 0
            limit = int(s[i]) if tight else 9
            total = 0
            for d in range(limit + 1):
                if started and used >> d & 1:
                    continue
                if not started and d == 0:
                    total += unique(i + 1, used, tight and d == limit, False)
                else:
                    total += unique(i + 1, used | 1 << d, tight and d == limit, True)
            return total
        return n - unique(0, 0, True, False)     # complement: total minus all-distinct`
  },
  {
    num: 1235, title: "Maximum Profit in Job Scheduling", slug: "maximum-profit-in-job-scheduling", lc: "Hard",
    topic: "dp",
    pattern: "1D: take or skip",
    level: 5,
    order: 790,
    core: false,
    teaches: "Weighted interval scheduling: sort by end and binary-search the last job that finishes in time.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [2008],
    hints: [
      "Times go up to 10^9, so you can't index by time. What order makes 'compatible earlier jobs' a prefix?",
      "Sort jobs by end. State: best[k] = max profit using jobs that end by ends[k].",
      "For job (s, e, p): take = best[last index with end <= s] + p (bisect). Keep it only if it beats the current best."
    ],
    steps: ["Sort jobs by end time.", "Keep lists ends = [0], best = [0].", "For each job: i = bisect_right(ends, s) - 1; take = best[i] + p; if take > best[-1], append (e, take).", "Return best[-1]."],
    time: "O(n log n)", space: "O(n)",
    trap: "A job may start exactly when another ends: use bisect_right on start.",
    code: `from bisect import bisect_right

class Solution:
    def jobScheduling(self, startTime: list[int], endTime: list[int], profit: list[int]) -> int:
        jobs = sorted(zip(endTime, startTime, profit))
        ends, best = [0], [0]    # best[i] = max profit using jobs that end by ends[i]
        for e, s, p in jobs:
            i = bisect_right(ends, s) - 1      # last finished time <= s
            take = best[i] + p
            if take > best[-1]:                # only store improvements
                ends.append(e)
                best.append(take)
        return best[-1]`
  },
  {
    num: 1463, title: "Cherry Pickup II", slug: "cherry-pickup-ii", lc: "Hard",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 5,
    order: 800,
    core: false,
    teaches: "Two robots moving together: put both positions in the state.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [931],
    hints: [
      "Both robots go down one row per step. What changes between rows?",
      "State: dp[a][b] = best cherries with robot 1 in column a and robot 2 in column b at the current row.",
      "Next row: try all 9 combinations of moves (-1, 0, +1 each); gain grid[r][a] + grid[r][b] (once if a == b)."
    ],
    steps: ["dp for row 0: only (0, cols-1) is reachable.", "For each row, build new[a][b] = best of 9 previous states + gain.", "Return the max over the last table."],
    time: "O(rows * cols^2)", space: "O(cols^2)",
    trap: "When both robots share a cell, count its cherries once.",
    code: `class Solution:
    def cherryPickup(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        NEG = float('-inf')
        dp = [[NEG] * cols for _ in range(cols)]   # dp[a][b] = best with robots at columns a, b
        dp[0][cols - 1] = grid[0][0] + (grid[0][cols - 1] if cols > 1 else 0)
        for r in range(1, rows):
            new = [[NEG] * cols for _ in range(cols)]
            for a in range(cols):
                for b in range(cols):
                    best = NEG
                    for pa in (a - 1, a, a + 1):
                        for pb in (b - 1, b, b + 1):
                            if 0 <= pa < cols and 0 <= pb < cols:
                                best = max(best, dp[pa][pb])
                    if best == NEG:
                        continue
                    gain = grid[r][a] + (grid[r][b] if a != b else 0)
                    new[a][b] = best + gain
            dp = new
        return max(max(row) for row in dp)`
  },
  {
    num: 879, title: "Profitable Schemes", slug: "profitable-schemes", lc: "Hard",
    topic: "dp",
    pattern: "Knapsack 0/1: each item once",
    level: 5,
    order: 810,
    core: false,
    teaches: "Knapsack with a 'reach at least' goal: cap the profit dimension at minProfit.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [474],
    hints: [
      "Profit above minProfit doesn't matter. How can that shrink the table?",
      "State: dp[g][p] = schemes using g members with profit min(total, minProfit) = p.",
      "For each crime: for g backwards, p backwards: dp[g][p] += dp[g-need][max(0, p-gain)]. Sum dp[g][minProfit]."
    ],
    steps: ["dp[0][0] = 1.", "Process each crime with backward loops over members and profit.", "Return sum over g of dp[g][minProfit] mod 1e9+7."],
    time: "O(k * n * P)", space: "O(n * P)",
    trap: "Without capping profit the table blows up; with max(0, ...) it stays small.",
    code: `class Solution:
    def profitableSchemes(self, n: int, minProfit: int, group: list[int], profit: list[int]) -> int:
        MOD = 10**9 + 7
        # dp[g][p] = schemes using exactly g people with profit p (p capped at minProfit)
        dp = [[0] * (minProfit + 1) for _ in range(n + 1)]
        dp[0][0] = 1
        for need, gain in zip(group, profit):
            for g in range(n, need - 1, -1):
                for p in range(minProfit, -1, -1):
                    dp[g][p] = (dp[g][p] + dp[g - need][max(0, p - gain)]) % MOD
        return sum(dp[g][minProfit] for g in range(n + 1)) % MOD`
  },
  {
    num: 354, title: "Russian Doll Envelopes", slug: "russian-doll-envelopes", lc: "Hard",
    topic: "dp",
    pattern: "LIS: best chain ending at i",
    level: 5,
    order: 820,
    core: false,
    teaches: "2D LIS: sort one dimension, run fast LIS (tails + binary search) on the other.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [300],
    hints: [
      "If widths are sorted, the problem is LIS on heights. But equal widths can't nest. How to stop that?",
      "Sort by width ascending and height DESCENDING for equal widths; then a strict LIS on heights never takes two equal widths.",
      "Fast LIS: tails[k] = smallest end height of an increasing run of length k+1; bisect_left to replace or append."
    ],
    steps: ["Sort by (w, -h).", "For each h: k = bisect_left(tails, h); append or replace tails[k].", "Return len(tails)."],
    time: "O(n log n)", space: "O(n)",
    trap: "O(n^2) LIS times out (n = 10^5). Sorting heights ascending for equal widths breaks it.",
    code: `from bisect import bisect_left

class Solution:
    def maxEnvelopes(self, envelopes: list[list[int]]) -> int:
        # width ascending; for equal widths, height DESCENDING so two of them never chain
        envelopes.sort(key=lambda e: (e[0], -e[1]))
        tails = []                   # tails[k] = smallest last height of an increasing run of length k+1
        for _, h in envelopes:
            k = bisect_left(tails, h)
            if k == len(tails):
                tails.append(h)
            else:
                tails[k] = h
        return len(tails)`
  },
  {
    num: 72, title: "Edit Distance", slug: "edit-distance", lc: "Medium",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 5,
    order: 830,
    core: true,
    teaches: "Edit distance: three operations map to three neighbouring cells.",
    learn: ["dsa_dp", "dsa-dp-problems"],
    pre: [583],
    hints: [
      "Look at the last characters. If equal, nothing to do. If not, which three operations could fix the end?",
      "State: dp[i][j] = edits to turn word1[:i] into word2[:j]. dp[i][0] = i, dp[0][j] = j.",
      "Different: 1 + min(dp[i-1][j-1] (replace), dp[i-1][j] (delete), dp[i][j-1] (insert))."
    ],
    steps: ["prev = 0..n.", "For each i: cur[0] = i; apply match / 1 + min of three.", "Return prev[n]."],
    time: "O(m * n)", space: "O(n)",
    trap: "Base cases matter: turning a prefix into empty costs its length.",
    code: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        prev = list(range(n + 1))    # word1 empty: insert j chars
        for i in range(1, m + 1):
            cur = [i] + [0] * n      # word2 empty: delete i chars
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    cur[j] = prev[j - 1]                 # last chars match: free
                else:
                    cur[j] = 1 + min(prev[j - 1],        # replace
                                     prev[j],            # delete from word1
                                     cur[j - 1])         # insert into word1
            prev = cur
        return prev[n]`
  },
  {
    num: 115, title: "Distinct Subsequences", slug: "distinct-subsequences", lc: "Hard",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 5,
    order: 840,
    core: false,
    teaches: "Counting version of two-string DP: either use this char of s to match t's char, or skip it.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1143],
    hints: [
      "For s[:i] and t[:j]: s[i-1] can be ignored, or (if equal) matched with t[j-1].",
      "State: dp[i][j] = ways s[:i] contains t[:j]. dp[i][0] = 1.",
      "dp[i][j] = dp[i-1][j] + (dp[i-1][j-1] if s[i-1] == t[j-1]). One row, j looped backwards."
    ],
    steps: ["dp = [1] + [0]*len(t).", "For each char of s: for j from len(t) down to 1: if t[j-1] == ch: dp[j] += dp[j-1].", "Return dp[len(t)]."],
    time: "O(m * n)", space: "O(n)",
    trap: "Looping j forward uses the current char twice.",
    code: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        n = len(t)
        dp = [1] + [0] * n           # dp[j] = ways s[:i] contains t[:j] as a subsequence
        for ch in s:
            for j in range(n, 0, -1):            # backwards: use old dp[j-1]
                if t[j - 1] == ch:
                    dp[j] += dp[j - 1]           # match ch with t[j-1], or not (already in dp[j])
        return dp[n]`
  },
  {
    num: 44, title: "Wildcard Matching", slug: "wildcard-matching", lc: "Hard",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 5,
    order: 850,
    core: false,
    teaches: "Pattern matching DP: '*' either matches nothing or eats one more character.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [72],
    hints: [
      "What can the last pattern char be: a letter, '?', or '*'? Handle each.",
      "State: dp[i][j] = s[:i] matches p[:j]. dp[0][j] is True only while p[:j] is all stars.",
      "'*': dp[i][j-1] (empty) or dp[i-1][j] (eat s[i-1]). Letter/'?': dp[i-1][j-1] if it matches."
    ],
    steps: ["dp[0][0] = True; fill row 0 for leading stars.", "Fill the table with the rules.", "Return dp[m][n]."],
    time: "O(m * n)", space: "O(m * n)",
    trap: "Backtracking on '*' without memo is exponential.",
    code: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        # dp[i][j] = s[:i] matches p[:j]
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for j in range(1, n + 1):
            dp[0][j] = dp[0][j - 1] and p[j - 1] == '*'   # only stars match empty
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == '*':
                    dp[i][j] = dp[i][j - 1] or dp[i - 1][j]   # star eats nothing / one more char
                elif p[j - 1] == '?' or p[j - 1] == s[i - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
        return dp[m][n]`
  },
  {
    num: 1092, title: "Shortest Common Supersequence", slug: "shortest-common-supersequence", lc: "Hard",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 5,
    order: 860,
    core: false,
    teaches: "Rebuild a string from a DP table: walk backwards through the LCS table.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1143],
    hints: [
      "The shortest supersequence writes the common part once. Which common part?",
      "Its length is m + n - LCS. Build the full LCS table to know the choices.",
      "From (m, n): equal chars -> write once, move diagonally; else move toward the larger neighbour and write that char. Append leftovers, reverse."
    ],
    steps: ["Build the LCS table.", "Walk back from (m, n) writing chars as described.", "Add the remaining prefix of whichever string is left; reverse the result."],
    time: "O(m * n)", space: "O(m * n)",
    trap: "A two-row LCS can't be walked back; keep the full table here.",
    code: `class Solution:
    def shortestCommonSupersequence(self, str1: str, str2: str) -> str:
        m, n = len(str1), len(str2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]    # LCS table
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if str1[i - 1] == str2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        out, i, j = [], m, n
        while i > 0 and j > 0:                   # walk back; shared chars written once
            if str1[i - 1] == str2[j - 1]:
                out.append(str1[i - 1]); i -= 1; j -= 1
            elif dp[i - 1][j] >= dp[i][j - 1]:
                out.append(str1[i - 1]); i -= 1
            else:
                out.append(str2[j - 1]); j -= 1
        out.extend(reversed(str1[:i]))
        out.extend(reversed(str2[:j]))
        return ''.join(reversed(out))`
  },
  {
    num: 132, title: "Palindrome Partitioning II", slug: "palindrome-partitioning-ii", lc: "Hard",
    topic: "dp",
    pattern: "Palindromes: center or range",
    level: 5,
    order: 870,
    core: false,
    teaches: "Palindrome table + prefix DP: the last piece of the best cut is some palindrome s[i..j].",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1745, 139],
    hints: [
      "Think like Word Break: what does the last piece of the prefix s[:j+1] look like?",
      "State: cuts[j] = fewest cuts for s[0..j]. If s[0..j] is a palindrome, 0.",
      "Else cuts[j] = min(cuts[i-1] + 1) over i with pal[i][j]. Build pal first."
    ],
    steps: ["Build pal.", "For each j compute cuts[j] with the rule.", "Return cuts[n-1]."],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Backtracking all partitions (problem 131) is exponential.",
    code: `class Solution:
    def minCut(self, s: str) -> int:
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
        cuts = [0] * n                           # cuts[j] = fewest cuts for s[:j+1]
        for j in range(n):
            if pal[0][j]:
                cuts[j] = 0                      # whole prefix is one palindrome
                continue
            cuts[j] = min(cuts[i - 1] + 1 for i in range(1, j + 1) if pal[i][j])   # last piece s[i..j]
        return cuts[n - 1]`
  },
  {
    num: 1547, title: "Minimum Cost to Cut a Stick", slug: "minimum-cost-to-cut-a-stick", lc: "Hard",
    topic: "dp",
    pattern: "Interval: split the range l..r",
    level: 5,
    order: 880,
    core: false,
    teaches: "Interval DP over the cut positions, not over the stick length.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1039],
    hints: [
      "The stick can be 10^6 long but there are at most 100 cuts. What should the indices be?",
      "Add 0 and n to the sorted cuts: c. State: dp[i][j] = cheapest to make all cuts strictly between c[i] and c[j].",
      "dp[i][j] = (c[j] - c[i]) + min over i < k < j of dp[i][k] + dp[k][j]."
    ],
    steps: ["c = [0] + sorted(cuts) + [n].", "Fill by gap from 2 up.", "Return dp[0][len(c)-1]."],
    time: "O(m^3)", space: "O(m^2)",
    trap: "Forgetting to sort the cuts breaks the ranges.",
    code: `class Solution:
    def minCost(self, n: int, cuts: list[int]) -> int:
        c = [0] + sorted(cuts) + [n]
        m = len(c)
        dp = [[0] * m for _ in range(m)]         # dp[i][j] = cheapest way to make every cut between c[i] and c[j]
        for gap in range(2, m):
            for i in range(m - gap):
                j = i + gap
                dp[i][j] = (c[j] - c[i]) + min(dp[i][k] + dp[k][j] for k in range(i + 1, j))   # first cut at c[k]
        return dp[0][m - 1]`
  },
  {
    num: 968, title: "Binary Tree Cameras", slug: "binary-tree-cameras", lc: "Hard",
    topic: "dp",
    pattern: "Tree DP: tuple from children",
    level: 5,
    order: 890,
    core: false,
    teaches: "Tree DP with three states per node: uncovered, covered, has camera.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [337],
    hints: [
      "Leaves should never hold a camera. Their parents should. Why?",
      "Post-order: return 0 (needs cover), 1 (covered, no camera), 2 (has camera); null returns 1.",
      "If a child is 0: put a camera here (return 2). Else if a child is 2: return 1. Else return 0. Fix the root at the end."
    ],
    steps: ["DFS returns the state and counts cameras.", "If the root returns 0, add one camera.", "Return the count."],
    time: "O(n)", space: "O(h)",
    trap: "Forgetting the root case: an uncovered root still needs a camera.",
    code: `class Solution:
    def minCameraCover(self, root) -> int:
        # state of a node after its subtree is handled:
        # 0 = not covered yet, 1 = covered (no camera), 2 = has a camera
        cameras = 0
        def dfs(node):
            nonlocal cameras
            if not node:
                return 1                         # empty child needs nothing
            l, r = dfs(node.left), dfs(node.right)
            if l == 0 or r == 0:                 # a child is uncovered: camera here
                cameras += 1
                return 2
            if l == 2 or r == 2:                 # a child's camera covers me
                return 1
            return 0                             # let my parent cover me
        if dfs(root) == 0:
            cameras += 1
        return cameras`
  },
  {
    num: 1125, title: "Smallest Sufficient Team", slug: "smallest-sufficient-team", lc: "Hard",
    topic: "dp",
    pattern: "Bitmask DP: set of used items",
    level: 5,
    order: 900,
    core: false,
    teaches: "Knapsack over skill masks: each person ORs their skills into every known mask.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1986],
    hints: [
      "There are at most 16 skills. What could index the table?",
      "State: team[mask] = smallest team covering exactly the skills in mask; team[0] = [].",
      "For each person with mask pm: for every known mask m: new = m | pm; keep the shorter team."
    ],
    steps: ["Map skills to bits; team = {0: []}.", "For each person, relax all current entries (iterate over a snapshot).", "Return team[full]."],
    time: "O(p * 2^s)", space: "O(2^s * p)",
    trap: "Iterate over a copy of the dict while adding new entries.",
    code: `class Solution:
    def smallestSufficientTeam(self, req_skills: list[str], people: list[list[str]]) -> list[int]:
        idx = {s: i for i, s in enumerate(req_skills)}
        full = (1 << len(req_skills)) - 1
        team = {0: []}                           # team[mask] = smallest team covering skills in mask
        for p, skills in enumerate(people):
            pm = 0
            for s in skills:
                pm |= 1 << idx[s]
            if pm == 0:
                continue
            for mask, members in list(team.items()):
                new = mask | pm
                if new not in team or len(team[new]) > len(members) + 1:
                    team[new] = members + [p]
        return team[full]`
  },
  {
    num: 1434, title: "Number of Ways to Wear Different Hats to Each Other", slug: "number-of-ways-to-wear-different-hats-to-each-other", lc: "Hard",
    topic: "dp",
    pattern: "Bitmask DP: set of used items",
    level: 5,
    order: 910,
    core: false,
    teaches: "Put the SMALL set in the mask: 10 people as bits, loop over the 40 hats.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1879],
    hints: [
      "Mask over hats (2^40) is too big. What is small here?",
      "People (<= 10). State: dp[mask] = ways where exactly the people in mask have hats, using hats seen so far.",
      "For each hat h: for mask backwards: for each person p who likes h and isn't in mask: dp[mask | p] += dp[mask]."
    ],
    steps: ["Build who[h] = people who like hat h.", "dp[0] = 1; process hats 1..40, masks from high to low.", "Return dp[full] mod 1e9+7."],
    time: "O(40 * 2^n * n)", space: "O(2^n)",
    trap: "Looping masks upward would give one hat to two people.",
    code: `class Solution:
    def numberWays(self, hats: list[list[int]]) -> int:
        MOD = 10**9 + 7
        n = len(hats)
        who = [[] for _ in range(41)]            # who[h] = people who like hat h
        for person, hs in enumerate(hats):
            for h in hs:
                who[h].append(person)
        dp = [0] * (1 << n)                      # dp[mask] = ways where exactly the people in mask wear a hat
        dp[0] = 1
        for h in range(1, 41):                   # loop over hats: 40 of them, only 10 people
            for mask in range((1 << n) - 1, -1, -1):   # backwards so hat h is used once
                if not dp[mask]:
                    continue
                for person in who[h]:
                    if not mask >> person & 1:
                        nxt = mask | 1 << person
                        dp[nxt] = (dp[nxt] + dp[mask]) % MOD
        return dp[(1 << n) - 1]`
  },
  {
    num: 188, title: "Best Time to Buy and Sell Stock IV", slug: "best-time-to-buy-and-sell-stock-iv", lc: "Hard",
    topic: "dp",
    pattern: "State machine: stock trading",
    level: 5,
    order: 920,
    core: true,
    teaches: "Generalize the stage chain to k transactions with arrays.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [123],
    hints: [
      "123 had 2 buy/sell pairs. What if there are k?",
      "buy[t] = best money holding in the t-th transaction; sell[t] = best after t full transactions.",
      "buy[t] = max(buy[t], sell[t-1] - p); sell[t] = max(sell[t], buy[t] + p)."
    ],
    steps: ["buy = [-inf]*(k+1), sell = [0]*(k+1).", "For each price, for t = 1..k update buy then sell.", "Return sell[k]."],
    time: "O(n * k)", space: "O(k)",
    trap: "If k >= n/2 it is unlimited trades; the same code still works.",
    code: `class Solution:
    def maxProfit(self, k: int, prices: list[int]) -> int:
        buy = [float('-inf')] * (k + 1)          # buy[t] = best money holding a share in transaction t
        sell = [0] * (k + 1)                     # sell[t] = best money after finishing t transactions
        for p in prices:
            for t in range(1, k + 1):
                buy[t] = max(buy[t], sell[t - 1] - p)
                sell[t] = max(sell[t], buy[t] + p)
        return sell[k]`
  },
  {
    num: 940, title: "Distinct Subsequences II", slug: "distinct-subsequences-ii", lc: "Hard",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 5,
    order: 930,
    core: false,
    teaches: "Count distinct subsequences by their last letter: new ones ending in c replace the old ones.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [115],
    hints: [
      "Appending c to every distinct subsequence (plus the empty one) gives all subsequences ending in c.",
      "end[c] = number of distinct subsequences that end with c.",
      "On reading c: end[c] = sum(end) + 1. Older ones ending in c are included in the new set."
    ],
    steps: ["end = [0]*26.", "For each char: end[c] = (sum(end) + 1) mod 1e9+7.", "Return sum(end) mod 1e9+7."],
    time: "O(26 n)", space: "O(1)",
    trap: "Adding instead of replacing double-counts repeated letters.",
    code: `class Solution:
    def distinctSubseqII(self, s: str) -> int:
        MOD = 10**9 + 7
        end = [0] * 26                           # end[c] = distinct subsequences that END with letter c
        for ch in s:
            # every distinct subsequence so far, plus the empty one, extended by ch
            end[ord(ch) - 97] = (sum(end) + 1) % MOD
        return sum(end) % MOD`
  },
  {
    num: 629, title: "K Inverse Pairs Array", slug: "k-inverse-pairs-array", lc: "Hard",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 5,
    order: 940,
    core: false,
    teaches: "Insert the largest number last: it adds 0..i-1 inverse pairs; use a sliding window sum.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1155],
    hints: [
      "Where can the number i go in a permutation of 1..i-1, and how many pairs does it add?",
      "dp[i][j] = sum of dp[i-1][j - t] for t in 0..i-1.",
      "That's a window of length i; keep a running sum to get each value in O(1)."
    ],
    steps: ["dp = [1, 0, ...] for i = 1.", "For i = 2..n, build new[j] with a sliding window over dp.", "Return dp[k] mod 1e9+7."],
    time: "O(n * k)", space: "O(k)",
    trap: "The direct triple loop O(n * k * n) is too slow at 1000.",
    code: `class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        MOD = 10**9 + 7
        dp = [1] + [0] * k                       # dp[j] = permutations of 1..i with j inverse pairs
        for i in range(2, n + 1):
            new = [0] * (k + 1)
            window = 0                           # sum of dp[j-i+1 .. j]
            for j in range(k + 1):
                window += dp[j]                  # placing i adds 0..i-1 new pairs
                if j >= i:
                    window -= dp[j - i]
                new[j] = window % MOD
            dp = new
        return dp[k]`
  },
  {
    num: 600, title: "Non-negative Integers without Consecutive Ones", slug: "non-negative-integers-without-consecutive-ones", lc: "Hard",
    topic: "dp",
    pattern: "Digit DP: build numbers up to N",
    level: 5,
    order: 950,
    core: false,
    teaches: "Digit DP in binary: free suffixes without '11' are counted by Fibonacci numbers.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [2376],
    hints: [
      "How many binary strings of length k have no two adjacent 1s?",
      "fib[k] with fib[0] = 1, fib[1] = 2. Walk n's bits from the top while tight.",
      "At a 1-bit, add fib[remaining] (put 0 here, rest free). If two 1-bits in a row appear in n, stop. If not, add 1 for n."
    ],
    steps: ["Precompute fib up to 32.", "Walk the bits as described.", "Return total (+1 if n itself is valid)."],
    time: "O(log n)", space: "O(log n)",
    trap: "Stop right after adding for the second of two adjacent 1s; n itself is then invalid.",
    code: `class Solution:
    def findIntegers(self, n: int) -> int:
        # fib[k] = binary strings of length k with no "11"
        fib = [1, 2] + [0] * 30
        for k in range(2, 32):
            fib[k] = fib[k - 1] + fib[k - 2]
        bits = bin(n)[2:]
        L = len(bits)
        total, prev = 0, '0'
        for i, b in enumerate(bits):             # walk n's bits from the top (tight prefix)
            if b == '1':
                total += fib[L - i - 1]          # put 0 here: the rest is free
                if prev == '1':
                    return total                 # n's prefix itself has "11": stop
            prev = b
        return total + 1                         # n itself is valid`
  },
  {
    num: 741, title: "Cherry Pickup", slug: "cherry-pickup", lc: "Hard",
    topic: "dp",
    pattern: "Grid: paths and squares",
    level: 6,
    order: 960,
    core: false,
    teaches: "Turn 'go and come back' into two walkers going forward at the same time.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1463],
    hints: [
      "A return path is just another forward path. Can two walkers move together?",
      "After t steps a walker at row r is at column t - r. State: dp[r1][r2] at step t.",
      "From the 4 combinations of previous moves, take the best; add both cells (once if same); thorn cells are -inf."
    ],
    steps: ["dp[0][0] = grid[0][0].", "For t = 1..2n-2, for r1 <= r2 with valid open cells: best of 4 predecessors + gain.", "Return max(0, dp[n-1][n-1])."],
    time: "O(n^3)", space: "O(n^2)",
    trap: "Doing the best path, removing cherries, then the best path again is wrong (greedy).",
    code: `class Solution:
    def cherryPickup(self, grid: list[list[int]]) -> int:
        n = len(grid)
        NEG = float('-inf')
        # Two walkers leave (0,0) together; after t steps walker k is at (rk, t - rk).
        dp = [[NEG] * n for _ in range(n)]   # dp[r1][r2], keep r1 <= r2
        dp[0][0] = grid[0][0]
        for t in range(1, 2 * n - 1):
            new = [[NEG] * n for _ in range(n)]
            lo, hi = max(0, t - n + 1), min(n - 1, t)
            for r1 in range(lo, hi + 1):
                c1 = t - r1
                if grid[r1][c1] == -1:
                    continue
                for r2 in range(r1, hi + 1):
                    c2 = t - r2
                    if grid[r2][c2] == -1:
                        continue
                    best = dp[r1][r2]                      # both moved right
                    if r1 > 0:
                        best = max(best, dp[r1 - 1][r2])   # walker 1 moved down
                    if r2 > 0:
                        best = max(best, dp[r1][r2 - 1])   # walker 2 moved down
                    if r1 > 0 and r2 > 0:
                        best = max(best, dp[r1 - 1][r2 - 1])
                    if best == NEG:
                        continue
                    gain = grid[r1][c1] + (grid[r2][c2] if r1 != r2 else 0)
                    new[r1][r2] = best + gain
            dp = new
        return max(0, dp[n - 1][n - 1])`
  },
  {
    num: 956, title: "Tallest Billboard", slug: "tallest-billboard", lc: "Hard",
    topic: "dp",
    pattern: "Knapsack 0/1: each item once",
    level: 6,
    order: 970,
    core: false,
    teaches: "Choose for each rod: left, right, or neither; keep only the difference between sides as state.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1049],
    hints: [
      "Two sides with the same height... What really matters about a partial build?",
      "Only the difference between the sides matters for the future. State: dp[diff] = biggest shorter side.",
      "For a rod r: skip; add to taller (diff + r); add to shorter (|diff - r|, shorter grows by min(r, diff))."
    ],
    steps: ["dp = {0: 0}.", "For each rod, build a new dict from the three options, keeping max shorter side per diff.", "Return dp[0]."],
    time: "O(n * S)", space: "O(S)",
    trap: "S = sum of rods. Tracking both heights as state is too large.",
    code: `class Solution:
    def tallestBillboard(self, rods: list[int]) -> int:
        dp = {0: 0}   # dp[diff] = biggest SHORTER side when taller - shorter = diff
        for r in rods:
            new = dict(dp)                       # option 1: leave the rod out
            for diff, short in dp.items():
                # option 2: weld r onto the taller side
                new[diff + r] = max(new.get(diff + r, -1), short)
                # option 3: weld r onto the shorter side
                if r <= diff:
                    new[diff - r] = max(new.get(diff - r, -1), short + r)
                else:                            # shorter side becomes the taller one
                    new[r - diff] = max(new.get(r - diff, -1), short + diff)
            dp = new
        return dp[0]`
  },
  {
    num: 10, title: "Regular Expression Matching", slug: "regular-expression-matching", lc: "Hard",
    topic: "dp",
    pattern: "Two strings: prefixes i, j",
    level: 6,
    order: 980,
    core: false,
    teaches: "The 'x*' token is one unit: skip it, or let it eat one char and stay on it.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [44],
    hints: [
      "Look at p[j+1]: if it is '*', p[j] and the star act as one token.",
      "State: dp[i][j] = s[i:] matches p[j:] (suffix form). dp[m][n] = True.",
      "first = i < m and p[j] in (s[i], '.'). Star next: dp[i][j+2] or (first and dp[i+1][j]). Else: first and dp[i+1][j+1]."
    ],
    steps: ["Table (m+1) x (n+1), dp[m][n] = True.", "Fill i from m down, j from n-1 down with the rules.", "Return dp[0][0]."],
    time: "O(m * n)", space: "O(m * n)",
    trap: "Note i runs to m (empty s can still match 'a*').",
    code: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        # dp[i][j] = s[i:] matches p[j:]  (suffix form keeps 'x*' handling simple)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[m][n] = True
        for i in range(m, -1, -1):
            for j in range(n - 1, -1, -1):
                first = i < m and p[j] in (s[i], '.')
                if j + 1 < n and p[j + 1] == '*':
                    dp[i][j] = dp[i][j + 2] or (first and dp[i + 1][j])   # skip 'x*' / eat one char
                else:
                    dp[i][j] = first and dp[i + 1][j + 1]
        return dp[0][0]`
  },
  {
    num: 730, title: "Count Different Palindromic Subsequences", slug: "count-different-palindromic-subsequences", lc: "Hard",
    topic: "dp",
    pattern: "Palindromes: center or range",
    level: 6,
    order: 990,
    core: false,
    teaches: "Count DISTINCT palindromic subsequences by handling duplicates of the end letter inside the range.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [516],
    hints: [
      "Different ends: inclusion-exclusion with dp[i+1][j] + dp[i][j-1] - dp[i+1][j-1].",
      "Same end letter c: every inner palindrome can be wrapped in c...c, so 2 * inner, plus 'c' and 'cc' unless already counted.",
      "Find the first (lo) and last (hi) c strictly inside: none -> +2, one -> +1, two or more -> subtract dp[lo+1][hi-1]."
    ],
    steps: ["Precompute next/prev occurrence of each letter.", "Fill dp[i][j] (i down, j up) with the three cases, mod 1e9+7.", "Return dp[0][n-1]."],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Python's % keeps the subtraction case non-negative; in other languages add MOD before %.",
    code: `class Solution:
    def countPalindromicSubsequences(self, s: str) -> int:
        MOD = 10**9 + 7
        n = len(s)
        nxt = [[n] * 4 for _ in range(n + 1)]    # nxt[i][c] = first index >= i holding letter c
        for i in range(n - 1, -1, -1):
            nxt[i] = nxt[i + 1][:]
            nxt[i][ord(s[i]) - 97] = i
        prv = [[-1] * 4 for _ in range(n + 1)]   # prv[j+1][c] = last index <= j holding letter c
        for j in range(n):
            prv[j + 1] = prv[j][:]
            prv[j + 1][ord(s[j]) - 97] = j
        # dp[i][j] = distinct non-empty palindromic subsequences of s[i..j] (0 when i > j)
        dp = [[0] * (n + 1) for _ in range(n + 1)]
        for i in range(n - 1, -1, -1):
            dp[i][i] = 1
            for j in range(i + 1, n):
                if s[i] != s[j]:
                    dp[i][j] = dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1]
                else:
                    c = ord(s[i]) - 97
                    lo, hi = nxt[i + 1][c], prv[j][c]   # same letter strictly inside?
                    inner = dp[i + 1][j - 1] if i + 1 <= j - 1 else 0
                    if lo > hi:                  # none inside: add "c" and "cc"
                        dp[i][j] = 2 * inner + 2
                    elif lo == hi:               # one inside: "c" already counted, add "cc"
                        dp[i][j] = 2 * inner + 1
                    else:                        # two or more: drop what was double counted
                        dp[i][j] = 2 * inner - (dp[lo + 1][hi - 1] if lo + 1 <= hi - 1 else 0)
                dp[i][j] %= MOD
        return dp[0][n - 1]`
  },
  {
    num: 312, title: "Burst Balloons", slug: "burst-balloons", lc: "Hard",
    topic: "dp",
    pattern: "Interval: split the range l..r",
    level: 6,
    order: 1000,
    core: true,
    teaches: "Choose the LAST balloon popped in a range; then its neighbours are the fixed range ends.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1547],
    hints: [
      "If you choose the first balloon to pop, the remaining neighbours change. What if you choose the last one?",
      "Pad with 1s. State: dp[i][j] = best coins for balloons strictly between i and j.",
      "dp[i][j] = max over i < k < j of dp[i][k] + dp[k][j] + a[i]*a[k]*a[j]."
    ],
    steps: ["a = [1] + nums + [1].", "Fill by gap from 2 up.", "Return dp[0][n-1]."],
    time: "O(n^3)", space: "O(n^2)",
    trap: "Thinking 'first to pop' leads to states that depend on the whole history.",
    code: `class Solution:
    def maxCoins(self, nums: list[int]) -> int:
        a = [1] + nums + [1]
        n = len(a)
        dp = [[0] * n for _ in range(n)]         # dp[i][j] = best for balloons strictly between i and j
        for gap in range(2, n):
            for i in range(n - gap):
                j = i + gap
                # k = the LAST balloon popped in (i, j): its neighbours are then a[i] and a[j]
                dp[i][j] = max(dp[i][k] + dp[k][j] + a[i] * a[k] * a[j] for k in range(i + 1, j))
        return dp[0][n - 1]`
  },
  {
    num: 664, title: "Strange Printer", slug: "strange-printer", lc: "Hard",
    topic: "dp",
    pattern: "Interval: split the range l..r",
    level: 6,
    order: 1010,
    core: false,
    teaches: "Merge strokes: the last character can share a stroke with an earlier equal character.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1547],
    hints: [
      "Printing t[i..j]: what if t[j] is printed together with some earlier t[k] == t[j]?",
      "State: dp[i][j] = fewest turns for t[i..j]. Default: dp[i][j-1] + 1.",
      "For k in i..j-1 with t[k] == t[j]: dp[i][j] = min(dp[i][k] + dp[k+1][j-1]) (inner part empty -> 0)."
    ],
    steps: ["Remove consecutive duplicates.", "Fill i downward, j upward with the rule.", "Return dp[0][n-1]."],
    time: "O(n^3)", space: "O(n^2)",
    trap: "Collapsing 'aaa' to 'a' first is safe and speeds things up.",
    code: `class Solution:
    def strangePrinter(self, s: str) -> int:
        t = []
        for ch in s:                             # "aaab" prints like "ab"
            if not t or t[-1] != ch:
                t.append(ch)
        n = len(t)
        dp = [[0] * n for _ in range(n)]         # dp[i][j] = fewest turns to print t[i..j]
        for i in range(n - 1, -1, -1):
            dp[i][i] = 1
            for j in range(i + 1, n):
                dp[i][j] = dp[i][j - 1] + 1      # print t[j] on its own
                for k in range(i, j):
                    if t[k] == t[j]:             # t[j] rides along with the stroke that printed t[k]
                        inner = dp[k + 1][j - 1] if k + 1 <= j - 1 else 0
                        dp[i][j] = min(dp[i][j], dp[i][k] + inner)
        return dp[0][n - 1]`
  },
  {
    num: 834, title: "Sum of Distances in Tree", slug: "sum-of-distances-in-tree", lc: "Hard",
    topic: "dp",
    pattern: "Tree DP: tuple from children",
    level: 6,
    order: 1020,
    core: false,
    teaches: "Rerooting: compute the answer for one root, then shift the root along each edge in O(1).",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [2246],
    hints: [
      "Doing a BFS from every node is O(n^2). How does the answer change when the root moves from p to its child u?",
      "First pass: size[u] and down[u] (distance sum inside u's subtree); ans[0] = down[0].",
      "Second pass: ans[u] = ans[p] - size[u] + (n - size[u])."
    ],
    steps: ["Iterative DFS from 0 for an order and parents.", "Post-order: sizes and down sums. Pre-order: the reroot formula.", "Return ans."],
    time: "O(n)", space: "O(n)",
    trap: "Use iterative traversal; recursion depth can reach 3 * 10^4.",
    code: `class Solution:
    def sumOfDistancesInTree(self, n: int, edges: list[list[int]]) -> list[int]:
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        parent, order, stack = [-1] * n, [], [0]
        seen = [False] * n
        seen[0] = True
        while stack:                             # iterative DFS from root 0
            u = stack.pop()
            order.append(u)
            for v in adj[u]:
                if not seen[v]:
                    seen[v] = True
                    parent[v] = u
                    stack.append(v)
        size = [1] * n                           # subtree sizes
        down = [0] * n                           # sum of distances from u into its subtree
        for u in reversed(order):
            p = parent[u]
            if p != -1:
                size[p] += size[u]
                down[p] += down[u] + size[u]
        ans = [0] * n
        ans[0] = down[0]
        for u in order:                          # reroot: moving root p -> u
            p = parent[u]
            if p != -1:
                ans[u] = ans[p] - size[u] + (n - size[u])   # size[u] nodes get closer, the rest farther
        return ans`
  },
  {
    num: 943, title: "Find the Shortest Superstring", slug: "find-the-shortest-superstring", lc: "Hard",
    topic: "dp",
    pattern: "Bitmask DP: set of used items",
    level: 6,
    order: 1030,
    core: false,
    teaches: "Travelling-salesman DP: dp[mask][last] with overlap 'savings' between words, then rebuild the order.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [1125],
    hints: [
      "Placing word j right after word i saves overlap(i, j) letters. What are you maximizing?",
      "State: dp[mask][last] = max letters saved using the words in mask, ending with last.",
      "dp[mask | j][j] = max(dp[mask][last] + gain[last][j]); keep a parent table to rebuild."
    ],
    steps: ["Precompute gain[i][j] (longest suffix of i that is a prefix of j).", "Fill dp over masks; store parents.", "Rebuild the order from the best end and join with overlaps."],
    time: "O(2^n * n^2)", space: "O(2^n * n)",
    trap: "Rebuilding is part of the job; store the parent of each state.",
    code: `class Solution:
    def shortestSuperstring(self, words: list[str]) -> str:
        n = len(words)
        # gain[i][j] = how many letters word j saves when it follows word i
        gain = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j:
                    for k in range(min(len(words[i]), len(words[j])), 0, -1):
                        if words[i].endswith(words[j][:k]):
                            gain[i][j] = k
                            break
        full = 1 << n
        dp = [[-1] * n for _ in range(full)]     # dp[mask][last] = max letters saved
        par = [[-1] * n for _ in range(full)]
        for i in range(n):
            dp[1 << i][i] = 0
        for mask in range(full):
            for last in range(n):
                if dp[mask][last] < 0:
                    continue
                for j in range(n):
                    if mask >> j & 1:
                        continue
                    nm = mask | 1 << j
                    val = dp[mask][last] + gain[last][j]
                    if val > dp[nm][j]:
                        dp[nm][j] = val
                        par[nm][j] = last
        mask = full - 1
        last = max(range(n), key=lambda i: dp[mask][i])
        order = []
        while last != -1:                        # rebuild the visiting order backwards
            order.append(last)
            prev = par[mask][last]
            mask ^= 1 << last
            last = prev
        order.reverse()
        out = words[order[0]]
        for a, b in zip(order, order[1:]):
            out += words[b][gain[a][b]:]
        return out`
  },
  {
    num: 903, title: "Valid Permutations for DI Sequence", slug: "valid-permutations-for-di-sequence", lc: "Hard",
    topic: "dp",
    pattern: "Counting: number of ways",
    level: 6,
    order: 1040,
    core: false,
    teaches: "Track the RANK of the last number among those used, not its value.",
    learn: ["dsa_dp", "dsa-dp-patterns"],
    pre: [629],
    hints: [
      "The values don't matter, only relative order. What about the last element matters?",
      "dp[i][j] = valid arrangements of i+1 numbers where the last one is the j-th smallest.",
      "'I': dp[i][j] = sum of dp[i-1][k] for k < j. 'D': sum for k >= j. Prefix sums make it O(1)."
    ],
    steps: ["dp = [1].", "For each char, build the next row with a running sum (left to right for I, right to left for D).", "Return sum(dp) mod 1e9+7."],
    time: "O(n^2)", space: "O(n)",
    trap: "Trying permutations is n!; the rank trick is the whole insight.",
    code: `class Solution:
    def numPermsDISequence(self, s: str) -> int:
        MOD = 10**9 + 7
        n = len(s)
        dp = [1]                                 # dp[j] = ways where the last number is the j-th smallest so far
        for i, ch in enumerate(s, start=1):      # now placing number count i+1
            new = [0] * (i + 1)
            if ch == 'I':                        # previous rank must be < j
                run = 0
                for j in range(i + 1):
                    new[j] = run
                    if j < i:
                        run = (run + dp[j]) % MOD
            else:                                # 'D': previous rank must be >= j
                run = 0
                for j in range(i - 1, -1, -1):
                    run = (run + dp[j]) % MOD
                    new[j] = run
            dp = new
        return sum(dp) % MOD`
  }
);
