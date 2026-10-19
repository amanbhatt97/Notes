// problems/backtrack.js — Recursion & Backtracking ladder
PROBLEMS.push(
  {
    num: 509, title: "Fibonacci Number", slug: "fibonacci-number", lc: "Easy",
    topic: "backtrack",
    pattern: "Recursion: smaller subproblem",
    level: 1,
    order: 10,
    core: true,
    teaches: "A recursive function needs a base case and a smaller call; a memo stops it from redoing work.",
    learn: ["dsa_backtrack", "dsa-bt-rec"],
    pre: [],
    hints: [
      "Write fib(n) exactly as the definition says: fib(n - 1) + fib(n - 2).",
      "What are the smallest inputs you can answer without recursing? Those are the base cases.",
      "Plain recursion repeats the same calls many times. Cache each answer the first time you compute it."
    ],
    steps: [
      "If n < 2, return n (base cases fib(0) = 0, fib(1) = 1).",
      "Otherwise return fib(n - 1) + fib(n - 2).",
      "Wrap the helper in a cache (lru_cache) so each n is computed once."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Without the cache the call tree has about 2^n calls and times out for larger n.",
    code: `from functools import lru_cache

def fib(n):
    @lru_cache(maxsize=None)
    def f(k):
        if k < 2:
            return k
        return f(k - 1) + f(k - 2)
    return f(n)`
  },
  {
    num: 78, title: "Subsets", slug: "subsets", lc: "Medium",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 1,
    order: 20,
    core: true,
    teaches: "At each index make two choices, take it or skip it; every leaf of that tree is one subset.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [],
    hints: [
      "For each number you have exactly two options. How many subsets does that give?",
      "Write go(i): decide about nums[i], then call go(i + 1). When i == n, the path is one subset.",
      "Append a copy of the path at the leaf, not the path itself."
    ],
    steps: [
      "res = [], path = [].",
      "go(i): if i == n, append path[:] and return.",
      "Take: path.append(nums[i]); go(i + 1); path.pop().",
      "Skip: go(i + 1).",
      "Call go(0) and return res."
    ],
    time: "O(n * 2^n)", space: "O(n) extra (plus output)",
    trap: "Appending path instead of path[:] leaves every saved subset pointing to the same (finally empty) list.",
    code: `def subsets(nums):
    res, path = [], []
    def go(i):
        if i == len(nums):
            res.append(path[:])
            return
        path.append(nums[i])
        go(i + 1)
        path.pop()
        go(i + 1)
    go(0)
    return res`
  },
  {
    num: 1863, title: "Sum of All Subset XOR Totals", slug: "sum-of-all-subset-xor-totals", lc: "Easy",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 1,
    order: 30,
    core: false,
    teaches: "Same take-or-skip tree as Subsets, but carry a running value instead of a list.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [],
    hints: [
      "Visit every subset with the take/skip recursion.",
      "Instead of storing the subset, pass its XOR so far as a parameter.",
      "go(i, x) returns the total for all subsets that can still be formed: at the leaf return x."
    ],
    steps: [
      "go(i, x): if i == n, return x.",
      "Return go(i + 1, x ^ nums[i]) + go(i + 1, x).",
      "Answer is go(0, 0)."
    ],
    time: "O(2^n)", space: "O(n)",
    trap: "Do not store subsets in a list first; the running XOR is all you need.",
    code: `def subsetXORSum(nums):
    def go(i, x):
        if i == len(nums):
            return x
        return go(i + 1, x ^ nums[i]) + go(i + 1, x)
    return go(0, 0)`
  },
  {
    num: 46, title: "Permutations", slug: "permutations", lc: "Medium",
    topic: "backtrack",
    pattern: "Permutations: used[] array",
    level: 1,
    order: 40,
    core: true,
    teaches: "Permutations fill positions one by one; a used[] array stops you from picking the same item twice.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [],
    hints: [
      "How is this different from subsets? Every number must appear, and order matters.",
      "For each position, try every number not used yet.",
      "Mark it used, recurse, then unmark it and pop it (un-choose)."
    ],
    steps: [
      "used = [False] * n, path = [].",
      "go(): if len(path) == n, append path[:].",
      "For each i not used: used[i] = True, path.append(nums[i]), go(), path.pop(), used[i] = False."
    ],
    time: "O(n * n!)", space: "O(n)",
    trap: "Forgetting to reset used[i] after the recursive call means later branches never use that number.",
    code: `def permute(nums):
    res, path = [], []
    used = [False] * len(nums)
    def go():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i in range(len(nums)):
            if not used[i]:
                used[i] = True
                path.append(nums[i])
                go()
                path.pop()
                used[i] = False
    go()
    return res`
  },
  {
    num: 77, title: "Combinations", slug: "combinations", lc: "Medium",
    topic: "backtrack",
    pattern: "Combinations: start index",
    level: 1,
    order: 50,
    core: true,
    teaches: "Combinations: pass a start index so you only pick numbers after the last one, never going back.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [78],
    hints: [
      "Order does not matter, so [1,2] and [2,1] are the same. How do you avoid producing both?",
      "Only allow picking numbers larger than the last one picked: pass the next start number.",
      "Stop when the path has k numbers. Optional pruning: stop the loop when too few numbers remain."
    ],
    steps: [
      "go(start): if len(path) == k, append path[:] and return.",
      "For x from start to n: append x, go(x + 1), pop.",
      "Pruning: loop only up to n - (k - len(path)) + 1."
    ],
    time: "O(k * C(n, k))", space: "O(k)",
    trap: "Looping from 1 each time instead of from start gives repeated combinations in different orders.",
    code: `def combine(n, k):
    res, path = [], []
    def go(start):
        if len(path) == k:
            res.append(path[:])
            return
        for x in range(start, n - (k - len(path)) + 2):
            path.append(x)
            go(x + 1)
            path.pop()
    go(1)
    return res`
  },
  {
    num: 1688, title: "Count of Matches in Tournament", slug: "count-of-matches-in-tournament", lc: "Easy",
    topic: "backtrack",
    pattern: "Recursion: smaller subproblem",
    level: 2,
    order: 60,
    core: false,
    teaches: "Describe one round, then let recursion handle the smaller tournament that is left.",
    learn: ["dsa_backtrack", "dsa-bt-rec"],
    pre: [509],
    hints: [
      "After one round with n teams, how many matches were played and how many teams are left?",
      "Even n: n/2 matches, n/2 teams advance. Odd n: (n-1)/2 matches, (n-1)/2 + 1 teams advance.",
      "Base case: 1 team means 0 more matches."
    ],
    steps: [
      "If n == 1, return 0.",
      "Matches this round = n // 2; teams left = (n + 1) // 2.",
      "Return n // 2 + numberOfMatches((n + 1) // 2)."
    ],
    time: "O(log n)", space: "O(log n)",
    trap: "Forgetting that with an odd count one team advances for free, so the next round has (n + 1) // 2 teams.",
    code: `def numberOfMatches(n):
    if n == 1:
        return 0
    return n // 2 + numberOfMatches((n + 1) // 2)`
  },
  {
    num: 784, title: "Letter Case Permutation", slug: "letter-case-permutation", lc: "Medium",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 2,
    order: 70,
    core: false,
    teaches: "Branch only where there is a choice: letters split into two, digits pass straight through.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [78],
    hints: [
      "Which characters give you a choice and which do not?",
      "At a letter, branch twice (lower and upper). At a digit, just move on.",
      "Build the answer in a list of chars and join it at the end of the string."
    ],
    steps: [
      "go(i): if i == len(s), append ''.join(path).",
      "If s[i] is a letter: try s[i].lower() and s[i].upper(), recursing after each and popping.",
      "Else append s[i], recurse, pop."
    ],
    time: "O(n * 2^L) where L = number of letters", space: "O(n)",
    trap: "Branching on digits too creates duplicate strings.",
    code: `def letterCasePermutation(s):
    res, path = [], []
    def go(i):
        if i == len(s):
            res.append("".join(path))
            return
        if s[i].isalpha():
            for c in (s[i].lower(), s[i].upper()):
                path.append(c)
                go(i + 1)
                path.pop()
        else:
            path.append(s[i])
            go(i + 1)
            path.pop()
    go(0)
    return res`
  },
  {
    num: 2044, title: "Count Number of Maximum Bitwise-OR Subsets", slug: "count-number-of-maximum-bitwise-or-subsets", lc: "Medium",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 2,
    order: 80,
    core: false,
    teaches: "The best OR is the OR of everything; then count subsets reaching it with take/skip recursion.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [1863],
    hints: [
      "Adding numbers to an OR never makes it smaller. What is the largest possible OR?",
      "It is the OR of the whole array. Now count subsets whose OR equals that.",
      "go(i, cur) returns 1 at the leaf when cur equals the target, else 0."
    ],
    steps: [
      "target = OR of all nums.",
      "go(i, cur): if i == n return 1 if cur == target else 0.",
      "Return go(i + 1, cur | nums[i]) + go(i + 1, cur).",
      "Answer go(0, 0)."
    ],
    time: "O(2^n)", space: "O(n)",
    trap: "The empty subset has OR 0; it only counts if target is 0, which cannot happen since nums[i] >= 1.",
    code: `def countMaxOrSubsets(nums):
    target = 0
    for x in nums:
        target |= x
    def go(i, cur):
        if i == len(nums):
            return 1 if cur == target else 0
        return go(i + 1, cur | nums[i]) + go(i + 1, cur)
    return go(0, 0)`
  },
  {
    num: 1415, title: "The k-th Lexicographical String of All Happy Strings of Length n", slug: "the-k-th-lexicographical-string-of-all-happy-strings-of-length-n", lc: "Medium",
    topic: "backtrack",
    pattern: "Permutations: used[] array",
    level: 2,
    order: 90,
    core: false,
    teaches: "Generate in lexicographic order and stop as soon as you reach the k-th result.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [46],
    hints: [
      "If you try letters a, b, c in that order at each position, in what order do strings come out?",
      "They come out sorted. Skip a letter equal to the previous one (that is the 'happy' rule).",
      "Count complete strings; when the count reaches k, record it and stop exploring."
    ],
    steps: [
      "path = [], count = 0, ans = ''.",
      "go(): if len(path) == n: count += 1; if count == k, ans = ''.join(path); return.",
      "For c in 'abc': stop if ans is set; skip if path and path[-1] == c; append, go(), pop.",
      "Return ans (empty if fewer than k strings exist)."
    ],
    time: "O(n * min(k, 3 * 2^(n-1)))", space: "O(n)",
    trap: "If k is larger than 3 * 2^(n-1), the answer is the empty string.",
    code: `def getHappyString(n, k):
    path = []
    count = 0
    ans = ""
    def go():
        nonlocal count, ans
        if len(path) == n:
            count += 1
            if count == k:
                ans = "".join(path)
            return
        for c in "abc":
            if ans:
                return
            if path and path[-1] == c:
                continue
            path.append(c)
            go()
            path.pop()
    go()
    return ans`
  },
  {
    num: 216, title: "Combination Sum III", slug: "combination-sum-iii", lc: "Medium",
    topic: "backtrack",
    pattern: "Combinations: start index",
    level: 2,
    order: 100,
    core: false,
    teaches: "Combinations with two limits at once: exactly k numbers and a target sum, pruning when the sum is exceeded.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [77],
    hints: [
      "This is Combinations of 1..9 with an extra rule on the sum.",
      "Carry the remaining sum. Stop a branch when it goes negative.",
      "Record the path only when it has k numbers and the remaining sum is exactly 0."
    ],
    steps: [
      "go(start, remain): if len(path) == k: record if remain == 0; return.",
      "For x from start to 9: if x > remain, break; append, go(x + 1, remain - x), pop.",
      "Call go(1, n)."
    ],
    time: "O(k * C(9, k))", space: "O(k)",
    trap: "Recording a path with the right sum but the wrong count; check both conditions.",
    code: `def combinationSum3(k, n):
    res, path = [], []
    def go(start, remain):
        if len(path) == k:
            if remain == 0:
                res.append(path[:])
            return
        for x in range(start, 10):
            if x > remain:
                break
            path.append(x)
            go(x + 1, remain - x)
            path.pop()
    go(1, n)
    return res`
  },
  {
    num: 17, title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number", lc: "Medium",
    topic: "backtrack",
    pattern: "Combinations: start index",
    level: 2,
    order: 110,
    core: true,
    teaches: "One recursion level per input position; the options at each level come from a lookup table.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [78],
    hints: [
      "Each digit gives 3 or 4 letter choices. How many levels deep is the recursion?",
      "One level per digit. At level i, loop over the letters for digits[i].",
      "When the path length equals len(digits), join it. Watch the empty input."
    ],
    steps: [
      "If digits is empty, return [].",
      "phone = {'2': 'abc', ..., '9': 'wxyz'}.",
      "go(i): if i == len(digits), append ''.join(path).",
      "For c in phone[digits[i]]: append, go(i + 1), pop."
    ],
    time: "O(n * 4^n)", space: "O(n)",
    trap: "Empty input must return [], not [''].",
    code: `def letterCombinations(digits):
    if not digits:
        return []
    phone = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
             "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    res, path = [], []
    def go(i):
        if i == len(digits):
            res.append("".join(path))
            return
        for c in phone[digits[i]]:
            path.append(c)
            go(i + 1)
            path.pop()
    go(0)
    return res`
  },
  {
    num: 401, title: "Binary Watch", slug: "binary-watch", lc: "Easy",
    topic: "backtrack",
    pattern: "Combinations: start index",
    level: 2,
    order: 120,
    core: false,
    teaches: "Choose k of 10 LEDs with the start-index pattern, pruning as soon as hours or minutes go out of range.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [77],
    hints: [
      "There are 10 LEDs: 4 for hours (8,4,2,1) and 6 for minutes (32,...,1). You choose turnedOn of them.",
      "That is Combinations of 10 items taken turnedOn at a time. Carry the hour and minute sums.",
      "Prune if hours > 11 or minutes > 59. Format minutes with two digits."
    ],
    steps: [
      "List LED values as (hour_add, minute_add) pairs.",
      "go(start, left, h, m): if h > 11 or m > 59 return; if left == 0 record f'{h}:{m:02d}'.",
      "For i from start to 9: go(i + 1, left - 1, h + hour_add[i], m + minute_add[i])."
    ],
    time: "O(C(10, k))", space: "O(k)",
    trap: "Hours have no leading zero ('1:05'), but minutes always have two digits.",
    code: `def readBinaryWatch(turnedOn):
    leds = [(8, 0), (4, 0), (2, 0), (1, 0),
            (0, 32), (0, 16), (0, 8), (0, 4), (0, 2), (0, 1)]
    res = []
    def go(start, left, h, m):
        if h > 11 or m > 59:
            return
        if left == 0:
            res.append("%d:%02d" % (h, m))
            return
        for i in range(start, 10):
            go(i + 1, left - 1, h + leds[i][0], m + leds[i][1])
    go(0, turnedOn, 0, 0)
    return res`
  },
  {
    num: 39, title: "Combination Sum", slug: "combination-sum", lc: "Medium",
    topic: "backtrack",
    pattern: "Combinations: start index",
    level: 2,
    order: 130,
    core: true,
    teaches: "Unlimited reuse: recurse with the same index i (not i + 1) so an item can be picked again.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [77],
    hints: [
      "How is this different from Combinations? Each number can be used many times.",
      "After picking candidates[i], allow picking it again: recurse with start = i.",
      "Sort first so you can break the loop once a candidate is larger than what remains."
    ],
    steps: [
      "Sort candidates.",
      "go(start, remain): if remain == 0, record path[:].",
      "For i from start: if candidates[i] > remain, break; append, go(i, remain - candidates[i]), pop.",
      "Call go(0, target)."
    ],
    time: "O(2^(target / min))", space: "O(target / min)",
    trap: "Recursing with i + 1 forbids reuse; recursing from 0 creates the same combination in different orders.",
    code: `def combinationSum(candidates, target):
    candidates.sort()
    res, path = [], []
    def go(start, remain):
        if remain == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:
                break
            path.append(candidates[i])
            go(i, remain - candidates[i])
            path.pop()
    go(0, target)
    return res`
  },
  {
    num: 22, title: "Generate Parentheses", slug: "generate-parentheses", lc: "Medium",
    topic: "backtrack",
    pattern: "Combinations: start index",
    level: 2,
    order: 140,
    core: true,
    teaches: "Build only valid strings: add '(' while some are left, add ')' only while it would not close more than were opened.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [17],
    hints: [
      "Generating all 2^(2n) strings and filtering works but is slow. When is adding '(' allowed? When is ')' allowed?",
      "Track open and close counts. '(' is allowed if open < n. ')' is allowed if close < open.",
      "When the string has length 2n, it is valid by construction."
    ],
    steps: [
      "go(open, close): if len(path) == 2n, record ''.join(path).",
      "If open < n: append '(', go(open + 1, close), pop.",
      "If close < open: append ')', go(open, close + 1), pop."
    ],
    time: "O(4^n / sqrt(n))", space: "O(n)",
    trap: "Allowing ')' when close < n (instead of close < open) produces invalid strings like ')('.",
    code: `def generateParenthesis(n):
    res, path = [], []
    def go(open_, close):
        if len(path) == 2 * n:
            res.append("".join(path))
            return
        if open_ < n:
            path.append("(")
            go(open_ + 1, close)
            path.pop()
        if close < open_:
            path.append(")")
            go(open_, close + 1)
            path.pop()
    go(0, 0)
    return res`
  },
  {
    num: 79, title: "Word Search", slug: "word-search", lc: "Medium",
    topic: "backtrack",
    pattern: "Grid path search",
    level: 2,
    order: 150,
    core: true,
    teaches: "Grid backtracking: mark a cell as visited before exploring neighbours and unmark it when you return.",
    learn: ["dsa_backtrack", "dsa-bt-grid"],
    pre: [78],
    hints: [
      "Start a search from every cell that matches word[0].",
      "dfs(r, c, i): the cell must match word[i]; then try the 4 neighbours for word[i + 1].",
      "To stop reusing a cell in one path, overwrite it with '#' before recursing and restore it after."
    ],
    steps: [
      "dfs(r, c, i): if i == len(word) return True.",
      "If out of bounds or board[r][c] != word[i], return False.",
      "tmp = board[r][c]; board[r][c] = '#'.",
      "found = any dfs on the 4 neighbours with i + 1; restore board[r][c] = tmp; return found.",
      "Return True if dfs(r, c, 0) succeeds for any cell."
    ],
    time: "O(m * n * 3^L)", space: "O(L)",
    trap: "Forgetting to restore the cell after the search breaks later searches that start elsewhere.",
    code: `def exist(board, word):
    m, n = len(board), len(board[0])
    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != word[i]:
            return False
        tmp = board[r][c]
        board[r][c] = "#"
        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                 dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
        board[r][c] = tmp
        return found
    for r in range(m):
        for c in range(n):
            if dfs(r, c, 0):
                return True
    return False`
  },
  {
    num: 1823, title: "Find the Winner of the Circular Game", slug: "find-the-winner-of-the-circular-game", lc: "Medium",
    topic: "backtrack",
    pattern: "Recursion: smaller subproblem",
    level: 3,
    order: 160,
    core: false,
    teaches: "Josephus: the winner among n people comes from the winner among n - 1, shifted by k.",
    learn: ["dsa_backtrack", "dsa-bt-rec"],
    pre: [1688],
    hints: [
      "A list simulation works: remove index (i + k - 1) % len each round. Can you avoid the list?",
      "Number people 0..n-1. After the first person (index k-1) leaves, the game restarts with n-1 people starting from index k.",
      "If w is the 0-based winner for n-1 people, the winner for n people is (w + k) % n. Base: 1 person -> index 0."
    ],
    steps: [
      "Define win(m) = 0-based winner index among m people.",
      "win(1) = 0.",
      "win(m) = (win(m - 1) + k) % m.",
      "Return win(n) + 1 to convert to 1-based."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Mixing 0-based and 1-based numbering; do the math 0-based and add 1 only at the end.",
    code: `def findTheWinner(n, k):
    def win(m):
        if m == 1:
            return 0
        return (win(m - 1) + k) % m
    return win(n) + 1`
  },
  {
    num: 779, title: "K-th Symbol in Grammar", slug: "k-th-symbol-in-grammar", lc: "Medium",
    topic: "backtrack",
    pattern: "Recursion: smaller subproblem",
    level: 3,
    order: 170,
    core: false,
    teaches: "Each symbol comes from a parent in the row above, so recurse on the parent instead of building rows.",
    learn: ["dsa_backtrack", "dsa-bt-rec"],
    pre: [1688],
    hints: [
      "Row n has 2^(n-1) symbols, too many to build. Where does position k in row n come from?",
      "Position k comes from position (k + 1) // 2 in row n - 1. 0 becomes 01, 1 becomes 10.",
      "If k is odd it equals its parent; if k is even it is the flip of its parent."
    ],
    steps: [
      "If n == 1, return 0.",
      "parent = kthGrammar(n - 1, (k + 1) // 2).",
      "Return parent if k is odd, else 1 - parent."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Building the whole row runs out of memory: row 30 has over 500 million symbols.",
    code: `def kthGrammar(n, k):
    if n == 1:
        return 0
    parent = kthGrammar(n - 1, (k + 1) // 2)
    return parent if k % 2 == 1 else 1 - parent`
  },
  {
    num: 90, title: "Subsets II", slug: "subsets-ii", lc: "Medium",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 3,
    order: 180,
    core: true,
    teaches: "Sort, then at each level skip a value equal to the one just tried, so duplicates never branch twice.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [78],
    hints: [
      "With [1,2,2], which subsets come out twice with plain Subsets code?",
      "Sort first so equal values sit together. Use the loop form: go(start) tries each i >= start as the next element.",
      "Inside the loop, skip i if i > start and nums[i] == nums[i - 1]."
    ],
    steps: [
      "Sort nums.",
      "go(start): append path[:] (every node is a subset).",
      "For i from start to n-1: if i > start and nums[i] == nums[i-1], continue.",
      "Append nums[i], go(i + 1), pop."
    ],
    time: "O(n * 2^n)", space: "O(n)",
    trap: "The skip condition is i > start, not i > 0; i > 0 would also drop valid subsets like [2,2].",
    code: `def subsetsWithDup(nums):
    nums.sort()
    res, path = [], []
    def go(start):
        res.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            go(i + 1)
            path.pop()
    go(0)
    return res`
  },
  {
    num: 491, title: "Non-decreasing Subsequences", slug: "non-decreasing-subsequences", lc: "Medium",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 3,
    order: 190,
    core: false,
    teaches: "When you cannot sort, dedupe each level with a local 'used here' set.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [90],
    hints: [
      "You must keep the original order, so the sort-and-skip trick from Subsets II does not work.",
      "At one level of the recursion, picking the same value twice as the next element gives the same results.",
      "Keep a fresh set per call; skip a value already tried at this level or smaller than path[-1]."
    ],
    steps: [
      "go(start): if len(path) >= 2, append path[:].",
      "used = set() for this call.",
      "For i from start: skip if nums[i] in used or (path and nums[i] < path[-1]).",
      "Add nums[i] to used, append, go(i + 1), pop."
    ],
    time: "O(n * 2^n)", space: "O(n)",
    trap: "A single global used set is wrong; the set must be per recursion level.",
    code: `def findSubsequences(nums):
    res, path = [], []
    def go(start):
        if len(path) >= 2:
            res.append(path[:])
        used = set()
        for i in range(start, len(nums)):
            if nums[i] in used or (path and nums[i] < path[-1]):
                continue
            used.add(nums[i])
            path.append(nums[i])
            go(i + 1)
            path.pop()
    go(0)
    return res`
  },
  {
    num: 1239, title: "Maximum Length of a Concatenated String with Unique Characters", slug: "maximum-length-of-a-concatenated-string-with-unique-characters", lc: "Medium",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 3,
    order: 200,
    core: false,
    teaches: "Subset search where a choice is allowed only if it keeps a constraint (no shared letters).",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [78],
    hints: [
      "This is choosing a subset of the strings. What makes a choice illegal?",
      "Drop strings that repeat a letter themselves. Turn each remaining string into a 26-bit mask.",
      "Recurse over strings; you may take string j only if mask & m[j] == 0. Track the best length."
    ],
    steps: [
      "Convert each string with unique letters into (mask, length); skip the others.",
      "go(i, mask, length): update best; for j from i, if mask & m[j] == 0, go(j + 1, mask | m[j], length + len[j]).",
      "Return best after go(0, 0, 0)."
    ],
    time: "O(2^n)", space: "O(n)",
    trap: "A string like 'aa' can never be used; forgetting to drop it gives wrong answers.",
    code: `def maxLength(arr):
    items = []
    for s in arr:
        m = 0
        ok = True
        for c in s:
            b = 1 << (ord(c) - 97)
            if m & b:
                ok = False
                break
            m |= b
        if ok:
            items.append((m, len(s)))
    best = 0
    def go(i, mask, length):
        nonlocal best
        best = max(best, length)
        for j in range(i, len(items)):
            m, l = items[j]
            if mask & m == 0:
                go(j + 1, mask | m, length + l)
    go(0, 0, 0)
    return best`
  },
  {
    num: 2597, title: "The Number of Beautiful Subsets", slug: "the-number-of-beautiful-subsets", lc: "Medium",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 3,
    order: 210,
    core: false,
    teaches: "Take/skip recursion with a counter of chosen values, so the 'no pair differs by k' rule is an O(1) check.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [2044],
    hints: [
      "Enumerate subsets with take/skip. When is taking nums[i] forbidden?",
      "It is forbidden if x - k or x + k is already in the subset. Keep a Counter of chosen values.",
      "Count leaves, then subtract 1 for the empty subset."
    ],
    steps: [
      "cnt = Counter().",
      "go(i): if i == n return 1.",
      "total = go(i + 1) (skip).",
      "If cnt[x - k] == 0 and cnt[x + k] == 0: cnt[x] += 1, total += go(i + 1), cnt[x] -= 1.",
      "Return go(0) - 1."
    ],
    time: "O(2^n)", space: "O(n)",
    trap: "Use a counter, not a set: duplicates like [2,2] are both allowed and removing one must not forget the other.",
    code: `from collections import Counter

def beautifulSubsets(nums, k):
    cnt = Counter()
    def go(i):
        if i == len(nums):
            return 1
        total = go(i + 1)
        x = nums[i]
        if cnt[x - k] == 0 and cnt[x + k] == 0:
            cnt[x] += 1
            total += go(i + 1)
            cnt[x] -= 1
        return total
    return go(0) - 1`
  },
  {
    num: 47, title: "Permutations II", slug: "permutations-ii", lc: "Medium",
    topic: "backtrack",
    pattern: "Permutations: used[] array",
    level: 3,
    order: 220,
    core: true,
    teaches: "Sort, then never place a duplicate value at a position if its earlier twin is not already placed.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [46, 90],
    hints: [
      "Plain Permutations on [1,1,2] prints each answer twice. Why?",
      "Swapping the two 1s gives the same list. Force equal values to be used in their original order.",
      "Sort; skip i if nums[i] == nums[i-1] and not used[i-1]."
    ],
    steps: [
      "Sort nums; used = [False] * n.",
      "go(): if len(path) == n, append path[:].",
      "For each i: skip if used[i], or if i > 0 and nums[i] == nums[i-1] and not used[i-1].",
      "Otherwise mark, append, recurse, pop, unmark."
    ],
    time: "O(n * n!)", space: "O(n)",
    trap: "Forgetting to sort first; the duplicate check only works when equal values are adjacent.",
    code: `def permuteUnique(nums):
    nums.sort()
    res, path = [], []
    used = [False] * len(nums)
    def go():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            used[i] = True
            path.append(nums[i])
            go()
            path.pop()
            used[i] = False
    go()
    return res`
  },
  {
    num: 526, title: "Beautiful Arrangement", slug: "beautiful-arrangement", lc: "Medium",
    topic: "backtrack",
    pattern: "Permutations: used[] array",
    level: 3,
    order: 230,
    core: false,
    teaches: "Prune while building: only place a number at a position if the rule already holds there.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [46],
    hints: [
      "Generating all n! permutations and checking at the end is too slow for n = 15.",
      "Fill positions 1..n in order. Which numbers are allowed at position pos?",
      "Number x is allowed if x % pos == 0 or pos % x == 0. Count when pos passes n."
    ],
    steps: [
      "used = [False] * (n + 1).",
      "go(pos): if pos > n return 1.",
      "Sum go(pos + 1) over every unused x with x % pos == 0 or pos % x == 0 (mark and unmark x).",
      "Return go(1)."
    ],
    time: "O(number of valid partial arrangements), at most O(n!)", space: "O(n)",
    trap: "Checking the rule only at the end explores far too many permutations.",
    code: `def countArrangement(n):
    used = [False] * (n + 1)
    def go(pos):
        if pos > n:
            return 1
        total = 0
        for x in range(1, n + 1):
            if not used[x] and (x % pos == 0 or pos % x == 0):
                used[x] = True
                total += go(pos + 1)
                used[x] = False
        return total
    return go(1)`
  },
  {
    num: 1079, title: "Letter Tile Possibilities", slug: "letter-tile-possibilities", lc: "Medium",
    topic: "backtrack",
    pattern: "Permutations: used[] array",
    level: 3,
    order: 240,
    core: false,
    teaches: "Backtrack over a count map of letters, so equal tiles never create duplicate branches.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [47],
    hints: [
      "Duplicates in the tiles cause duplicate sequences. Instead of positions, think about letter counts.",
      "At each step choose a letter that still has count > 0; each choice makes one new non-empty sequence.",
      "Decrease the count, recurse, increase it back."
    ],
    steps: [
      "cnt = Counter(tiles).",
      "go(): total = 0; for each letter c with cnt[c] > 0: cnt[c] -= 1, total += 1 + go(), cnt[c] += 1.",
      "Return go()."
    ],
    time: "O(sum over lengths of distinct arrangements), at most O(n * n!)", space: "O(n)",
    trap: "Counting with positions instead of letters counts 'AA' twice for tiles 'AAB'.",
    code: `from collections import Counter

def numTilePossibilities(tiles):
    cnt = Counter(tiles)
    def go():
        total = 0
        for c in cnt:
            if cnt[c] > 0:
                cnt[c] -= 1
                total += 1 + go()
                cnt[c] += 1
        return total
    return go()`
  },
  {
    num: 40, title: "Combination Sum II", slug: "combination-sum-ii", lc: "Medium",
    topic: "backtrack",
    pattern: "Combinations: start index",
    level: 3,
    order: 250,
    core: true,
    teaches: "Combination Sum where each item is used once and the input has duplicates: i + 1 plus the skip-twin rule.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [39, 90],
    hints: [
      "Each number is used at most once, so recurse with i + 1.",
      "Duplicates in the input give duplicate combinations. Sort, then reuse the trick from Subsets II.",
      "In the loop, skip i if i > start and candidates[i] == candidates[i - 1]; break when a value exceeds remain."
    ],
    steps: [
      "Sort candidates.",
      "go(start, remain): if remain == 0, record.",
      "For i from start: skip twin (i > start and equal to previous); break if candidates[i] > remain.",
      "Append, go(i + 1, remain - candidates[i]), pop."
    ],
    time: "O(2^n)", space: "O(n)",
    trap: "Using a set of results to remove duplicates works but is much slower; skip twins at the same level instead.",
    code: `def combinationSum2(candidates, target):
    candidates.sort()
    res, path = [], []
    def go(start, remain):
        if remain == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            if candidates[i] > remain:
                break
            path.append(candidates[i])
            go(i + 1, remain - candidates[i])
            path.pop()
    go(0, target)
    return res`
  },
  {
    num: 1286, title: "Iterator for Combination", slug: "iterator-for-combination", lc: "Medium",
    topic: "backtrack",
    pattern: "Combinations: start index",
    level: 3,
    order: 260,
    core: false,
    teaches: "Backtracking can feed an iterator: generate combinations in lexicographic order once, then hand them out.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [77],
    hints: [
      "The characters are sorted and distinct. If you generate combinations with the start-index pattern, in what order do they come out?",
      "They come out in lexicographic order. There are at most C(15, 7) = 6435 of them, so storing all is fine.",
      "Store them in a list and keep a pointer for next() and hasNext()."
    ],
    steps: [
      "In __init__, run go(start) that picks characters at index >= start until the path has length k; save each ''.join(path).",
      "Keep self.i = 0.",
      "next(): return self.combos[self.i] and increment i.",
      "hasNext(): return self.i < len(self.combos)."
    ],
    time: "O(k * C(n, k)) to build, O(1) per call", space: "O(k * C(n, k))",
    trap: "Looping from 0 instead of start produces repeats and breaks the lexicographic order.",
    code: `class CombinationIterator:
    def __init__(self, characters, combinationLength):
        self.combos = []
        path = []
        def go(start):
            if len(path) == combinationLength:
                self.combos.append("".join(path))
                return
            for i in range(start, len(characters)):
                path.append(characters[i])
                go(i + 1)
                path.pop()
        go(0)
        self.i = 0

    def next(self):
        s = self.combos[self.i]
        self.i += 1
        return s

    def hasNext(self):
        return self.i < len(self.combos)`
  },
  {
    num: 131, title: "Palindrome Partitioning", slug: "palindrome-partitioning", lc: "Medium",
    topic: "backtrack",
    pattern: "Partitioning: cut the string",
    level: 3,
    order: 270,
    core: true,
    teaches: "Partition backtracking: at each start, try every end for the next piece and recurse on the rest.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [78],
    hints: [
      "Think of placing cuts. From index start, what can the next piece be?",
      "The next piece is s[start:end] for every end > start. Only continue if that piece is a palindrome.",
      "When start reaches len(s), the pieces so far form one answer."
    ],
    steps: [
      "go(start): if start == len(s), record path[:].",
      "For end from start + 1 to len(s): piece = s[start:end].",
      "If piece == piece[::-1]: append it, go(end), pop.",
      "Call go(0)."
    ],
    time: "O(n * 2^n)", space: "O(n)",
    trap: "Checking palindromes repeatedly is fine here, but you can precompute a table isPal[i][j] for speed.",
    code: `def partition(s):
    res, path = [], []
    def go(start):
        if start == len(s):
            res.append(path[:])
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece == piece[::-1]:
                path.append(piece)
                go(end)
                path.pop()
    go(0)
    return res`
  },
  {
    num: 93, title: "Restore IP Addresses", slug: "restore-ip-addresses", lc: "Medium",
    topic: "backtrack",
    pattern: "Partitioning: cut the string",
    level: 3,
    order: 280,
    core: true,
    teaches: "Partition into exactly 4 pieces with rules on each piece (0-255, no leading zero).",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [131],
    hints: [
      "You must cut the string into exactly 4 parts. How long can one part be?",
      "Each part has 1 to 3 digits, is at most 255, and cannot start with '0' unless it is exactly '0'.",
      "Recurse with (start, parts so far). Prune when the remaining length cannot fit the remaining parts."
    ],
    steps: [
      "go(start): if len(path) == 4: record '.'.join(path) if start == len(s); return.",
      "Prune: remaining chars must be between (4 - parts) and 3 * (4 - parts).",
      "For length 1..3: piece = s[start:start+length]; skip if leading zero or > 255; append, recurse, pop."
    ],
    time: "O(3^4) = O(1)", space: "O(1)",
    trap: "Forgetting the leading-zero rule turns '010' into a valid part.",
    code: `def restoreIpAddresses(s):
    res, path = [], []
    def go(start):
        left = 4 - len(path)
        if left == 0:
            if start == len(s):
                res.append(".".join(path))
            return
        rem = len(s) - start
        if rem < left or rem > 3 * left:
            return
        for length in range(1, 4):
            if start + length > len(s):
                break
            piece = s[start:start + length]
            if (piece[0] == "0" and length > 1) or int(piece) > 255:
                continue
            path.append(piece)
            go(start + length)
            path.pop()
    go(0)
    return res`
  },
  {
    num: 1593, title: "Split a String Into the Max Number of Unique Substrings", slug: "split-a-string-into-the-max-number-of-unique-substrings", lc: "Medium",
    topic: "backtrack",
    pattern: "Partitioning: cut the string",
    level: 3,
    order: 290,
    core: false,
    teaches: "Partition backtracking with a 'seen' set shared across pieces, maximizing the number of pieces.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [131],
    hints: [
      "Same shape as Palindrome Partitioning: from start, choose the next piece s[start:end].",
      "A piece is allowed only if it is not already used. Keep the used pieces in a set.",
      "Track the best count. Prune if count + (chars left) cannot beat the best."
    ],
    steps: [
      "seen = set(), best = 0.",
      "go(start, count): if start == len(s), best = max(best, count); return.",
      "Prune if count + (len(s) - start) <= best.",
      "For each end: piece = s[start:end]; if not in seen: add, go(end, count + 1), remove."
    ],
    time: "O(n * 2^n)", space: "O(n)",
    trap: "Forgetting to remove the piece from the set after recursing blocks it in sibling branches.",
    code: `def maxUniqueSplit(s):
    seen = set()
    best = 0
    def go(start, count):
        nonlocal best
        if start == len(s):
            best = max(best, count)
            return
        if count + (len(s) - start) <= best:
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece not in seen:
                seen.add(piece)
                go(end, count + 1)
                seen.remove(piece)
    go(0, 0)
    return best`
  },
  {
    num: 2698, title: "Find the Punishment Number of an Integer", slug: "find-the-punishment-number-of-an-integer", lc: "Medium",
    topic: "backtrack",
    pattern: "Partitioning: cut the string",
    level: 3,
    order: 300,
    core: false,
    teaches: "Partition the digits of a number and check if some split sums to a target.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [131],
    hints: [
      "For each i, write i*i as a string. Can you cut it into pieces whose integer values add to i?",
      "Recurse: from position start with target remaining, try every next piece and subtract its value.",
      "Return True as soon as start reaches the end with remaining exactly 0. Prune when remaining goes negative."
    ],
    steps: [
      "can(s, start, remain): if start == len(s), return remain == 0.",
      "For end in start+1..len(s): v = int(s[start:end]); if v > remain, break; if can(s, end, remain - v), return True.",
      "Sum i*i for every i in 1..n where can(str(i*i), 0, i)."
    ],
    time: "O(n * 2^d) where d = digits of n^2 (at most 7)", space: "O(d)",
    trap: "Breaking when v > remain is safe only because a longer piece is even bigger; do not break on other conditions.",
    code: `def punishmentNumber(n):
    def can(s, start, remain):
        if start == len(s):
            return remain == 0
        for end in range(start + 1, len(s) + 1):
            v = int(s[start:end])
            if v > remain:
                break
            if can(s, end, remain - v):
                return True
        return False
    total = 0
    for i in range(1, n + 1):
        if can(str(i * i), 0, i):
            total += i * i
    return total`
  },
  {
    num: 2305, title: "Fair Distribution of Cookies", slug: "fair-distribution-of-cookies", lc: "Medium",
    topic: "backtrack",
    pattern: "Bucket assignment with pruning",
    level: 3,
    order: 310,
    core: false,
    teaches: "Assign each item to one of k buckets; prune branches that are already worse than the best answer.",
    learn: ["dsa_backtrack", "dsa-bt-pat"],
    pre: [46],
    hints: [
      "Each cookie bag goes to one of k children. That is k choices per bag, a search tree of depth n.",
      "Track each child's total. At the end, the unfairness is the max total; keep the smallest seen.",
      "Prune: skip a child whose total would reach the current best. Also, if you try an empty child once, do not try other empty children."
    ],
    steps: [
      "Sort cookies descending (big bags first makes pruning stronger).",
      "go(i): if i == n, best = min(best, max(load)); return.",
      "For each child j: if load[j] + cookies[i] >= best, skip; add, go(i + 1), subtract.",
      "If load[j] was 0 before adding, break after trying it (other empty children are the same)."
    ],
    time: "O(k^n) worst case, much less with pruning", space: "O(n + k)",
    trap: "Without the 'empty child once' rule you explore k! symmetric copies of every distribution.",
    code: `def distributeCookies(cookies, k):
    cookies = sorted(cookies, reverse=True)
    load = [0] * k
    best = float("inf")
    def go(i):
        nonlocal best
        if i == len(cookies):
            best = min(best, max(load))
            return
        for j in range(k):
            if load[j] + cookies[i] >= best:
                continue
            load[j] += cookies[i]
            go(i + 1)
            load[j] -= cookies[i]
            if load[j] == 0:
                break
    go(0)
    return best`
  },
  {
    num: 1219, title: "Path with Maximum Gold", slug: "path-with-maximum-gold", lc: "Medium",
    topic: "backtrack",
    pattern: "Grid path search",
    level: 3,
    order: 320,
    core: false,
    teaches: "Grid backtracking that maximizes a value instead of matching a word: try every start, collect gold, undo the visit.",
    learn: ["dsa_backtrack", "dsa-bt-grid"],
    pre: [79],
    hints: [
      "Which cells can a path start from? Try every cell with gold.",
      "From a cell, take its gold, mark it 0 so it is not revisited, and explore the 4 neighbours that have gold.",
      "The value of a path from here = gold here + best value among neighbours. Restore the cell afterwards."
    ],
    steps: [
      "dfs(r, c): if out of bounds or grid[r][c] == 0, return 0.",
      "g = grid[r][c]; grid[r][c] = 0.",
      "best = max of dfs on the 4 neighbours; grid[r][c] = g; return g + best.",
      "Answer = max dfs(r, c) over all cells."
    ],
    time: "O(m * n * 3^G) where G = gold cells (at most 25)", space: "O(G)",
    trap: "Starting only from corners or from the richest cell misses the best path; try every gold cell.",
    code: `def getMaximumGold(grid):
    m, n = len(grid), len(grid[0])
    def dfs(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] == 0:
            return 0
        g = grid[r][c]
        grid[r][c] = 0
        best = max(dfs(r + 1, c), dfs(r - 1, c), dfs(r, c + 1), dfs(r, c - 1))
        grid[r][c] = g
        return g + best
    return max(dfs(r, c) for r in range(m) for c in range(n))`
  },
  {
    num: 51, title: "N-Queens", slug: "n-queens", lc: "Hard",
    topic: "backtrack",
    pattern: "Constraint placement",
    level: 3,
    order: 330,
    core: true,
    teaches: "Place one queen per row; sets for columns and both diagonals make each safety check O(1).",
    learn: ["dsa_backtrack", "dsa-bt-grid"],
    pre: [46],
    hints: [
      "There must be exactly one queen in each row. So recurse row by row and choose a column.",
      "A column c is unsafe if a queen already uses that column or the same diagonal.",
      "Cells on one diagonal share r - c; on the other they share r + c. Keep three sets."
    ],
    steps: [
      "cols, diag1 (r - c), diag2 (r + c) = empty sets; board = n rows of '.'.",
      "go(r): if r == n, record the board as strings.",
      "For each c: skip if c in cols or r - c in diag1 or r + c in diag2.",
      "Add to sets, put 'Q', go(r + 1), remove from sets, put '.' back."
    ],
    time: "O(n!)", space: "O(n)",
    trap: "Checking only columns and one diagonal; both diagonals (r - c and r + c) are needed.",
    code: `def solveNQueens(n):
    res = []
    board = [["."] * n for _ in range(n)]
    cols, d1, d2 = set(), set(), set()
    def go(r):
        if r == n:
            res.append(["".join(row) for row in board])
            return
        for c in range(n):
            if c in cols or (r - c) in d1 or (r + c) in d2:
                continue
            cols.add(c); d1.add(r - c); d2.add(r + c)
            board[r][c] = "Q"
            go(r + 1)
            board[r][c] = "."
            cols.remove(c); d1.remove(r - c); d2.remove(r + c)
    go(0)
    return res`
  },
  {
    num: 52, title: "N-Queens II", slug: "n-queens-ii", lc: "Hard",
    topic: "backtrack",
    pattern: "Constraint placement",
    level: 3,
    order: 340,
    core: false,
    teaches: "Same N-Queens search, but return a count instead of building boards.",
    learn: ["dsa_backtrack", "dsa-bt-grid"],
    pre: [51],
    hints: [
      "Reuse N-Queens exactly. What can you drop?",
      "You do not need the board, only the three sets.",
      "Return 1 at r == n and sum the counts of all safe columns."
    ],
    steps: [
      "go(r): if r == n return 1.",
      "total = 0; for each safe c: add to sets, total += go(r + 1), remove.",
      "Return go(0)."
    ],
    time: "O(n!)", space: "O(n)",
    trap: "Building boards just to count them wastes time and memory.",
    code: `def totalNQueens(n):
    cols, d1, d2 = set(), set(), set()
    def go(r):
        if r == n:
            return 1
        total = 0
        for c in range(n):
            if c in cols or (r - c) in d1 or (r + c) in d2:
                continue
            cols.add(c); d1.add(r - c); d2.add(r + c)
            total += go(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c)
        return total
    return go(0)`
  },
  {
    num: 241, title: "Different Ways to Add Parentheses", slug: "different-ways-to-add-parentheses", lc: "Medium",
    topic: "backtrack",
    pattern: "Recursion: smaller subproblem",
    level: 4,
    order: 350,
    core: false,
    teaches: "Divide and conquer: pick the last operator to apply, solve both sides recursively, combine every pair.",
    learn: ["dsa_backtrack", "dsa-bt-rec"],
    pre: [779],
    hints: [
      "Every way to add parentheses has some operator that is applied last. Try each operator as that last one.",
      "The left part and right part are smaller expressions: get all their values recursively.",
      "Combine every left value with every right value using the operator. Memoize by substring."
    ],
    steps: [
      "If the string is just a number, return [that number].",
      "For each operator at index i: L = ways(s[:i]), R = ways(s[i+1:]).",
      "For every a in L and b in R, append a op b.",
      "Cache results per substring and return the list."
    ],
    time: "O(n * Catalan(n))", space: "O(n * Catalan(n))",
    trap: "Numbers can have two digits; split only at operators, never between digits.",
    code: `from functools import lru_cache

def diffWaysToCompute(expression):
    @lru_cache(maxsize=None)
    def ways(s):
        if s.isdigit():
            return [int(s)]
        res = []
        for i, c in enumerate(s):
            if c in "+-*":
                for a in ways(s[:i]):
                    for b in ways(s[i + 1:]):
                        if c == "+":
                            res.append(a + b)
                        elif c == "-":
                            res.append(a - b)
                        else:
                            res.append(a * b)
        return res
    return ways(expression)`
  },
  {
    num: 1255, title: "Maximum Score Words Formed by Letters", slug: "maximum-score-words-formed-by-letters", lc: "Hard",
    topic: "backtrack",
    pattern: "Subsets: include or skip",
    level: 4,
    order: 360,
    core: false,
    teaches: "Take/skip over words while spending from a shared letter budget, and refund it when you back out.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [1239],
    hints: [
      "Each word is taken or skipped. What stops you from taking a word?",
      "Keep a Counter of letters left. A word fits if every letter count it needs is available.",
      "Subtract the word's counts before recursing and add them back after (the un-choose step)."
    ],
    steps: [
      "have = Counter(letters).",
      "go(i): if i == len(words) return 0.",
      "best = go(i + 1) (skip).",
      "If words[i] fits: subtract its counts, best = max(best, its score + go(i + 1)), add counts back.",
      "Return go(0)."
    ],
    time: "O(2^n * L) where L = total word length", space: "O(n + 26)",
    trap: "Forgetting to restore the letter counts after trying a word makes later branches see too few letters.",
    code: `from collections import Counter

def maxScoreWords(words, letters, score):
    have = Counter(letters)
    def go(i):
        if i == len(words):
            return 0
        best = go(i + 1)
        need = Counter(words[i])
        if all(have[c] >= n for c, n in need.items()):
            have.subtract(need)
            gain = sum(score[ord(c) - 97] * n for c, n in need.items())
            best = max(best, gain + go(i + 1))
            have.update(need)
        return best
    return go(0)`
  },
  {
    num: 2850, title: "Minimum Moves to Spread Stones Over Grid", slug: "minimum-moves-to-spread-stones-over-grid", lc: "Medium",
    topic: "backtrack",
    pattern: "Permutations: used[] array",
    level: 4,
    order: 370,
    core: false,
    teaches: "Model the task as matching extras to empty cells, then try every matching with backtracking and keep the cheapest.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [46],
    hints: [
      "Each empty cell needs one stone from some cell that has more than one. What is the cost of one move?",
      "Moving a stone costs the Manhattan distance |r1 - r2| + |c1 - c2|. List extra stones (one entry per surplus) and empty cells.",
      "Try every way to assign extras to empties (a permutation search) and prune when the cost already reaches the best."
    ],
    steps: [
      "extras = cells repeated grid[r][c] - 1 times; empties = cells with 0.",
      "go(i, cost): if cost >= best stop; if i == len(empties) set best = cost.",
      "For each unused extra j: mark it, go(i + 1, cost + distance(extra j, empty i)), unmark.",
      "Return best."
    ],
    time: "O(8!) worst case", space: "O(9)",
    trap: "Greedy (nearest stone first) is wrong; some empties must take a farther stone so others stay cheap.",
    code: `def minimumMoves(grid):
    extra, empty = [], []
    for r in range(3):
        for c in range(3):
            if grid[r][c] == 0:
                empty.append((r, c))
            for _ in range(grid[r][c] - 1):
                extra.append((r, c))
    best = float("inf")
    used = [False] * len(extra)
    def go(i, cost):
        nonlocal best
        if cost >= best:
            return
        if i == len(empty):
            best = cost
            return
        er, ec = empty[i]
        for j, (r, c) in enumerate(extra):
            if not used[j]:
                used[j] = True
                go(i + 1, cost + abs(r - er) + abs(c - ec))
                used[j] = False
    go(0, 0)
    return best`
  },
  {
    num: 306, title: "Additive Number", slug: "additive-number", lc: "Medium",
    topic: "backtrack",
    pattern: "Partitioning: cut the string",
    level: 4,
    order: 380,
    core: false,
    teaches: "Once the first two pieces are chosen, the rest of the partition is forced; backtrack only over those two cuts.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [93],
    hints: [
      "How many choices really exist? After picking the first two numbers, is the third one free?",
      "No: the third must be their sum, and so on. Try every length for the first and second numbers.",
      "Then walk forward checking that the string continues with the expected sum. Reject pieces with leading zeros."
    ],
    steps: [
      "For i (end of first) and j (end of second): a = s[:i], b = s[i:j]; skip if either has a leading zero.",
      "k = j; while k < len(s): c = str(int(a) + int(b)); if not s.startswith(c, k), fail; k += len(c); a, b = b, c.",
      "If k reaches len(s) (and at least 3 numbers were used), return True.",
      "Return False after all choices."
    ],
    time: "O(n^3)", space: "O(n)",
    trap: "Numbers like '03' are not allowed, but a single '0' is.",
    code: `def isAdditiveNumber(num):
    n = len(num)
    for i in range(1, n):
        for j in range(i + 1, n):
            a, b = num[:i], num[i:j]
            if (len(a) > 1 and a[0] == "0") or (len(b) > 1 and b[0] == "0"):
                continue
            k = j
            while k < n:
                c = str(int(a) + int(b))
                if not num.startswith(c, k):
                    break
                k += len(c)
                a, b = b, c
            if k == n:
                return True
    return False`
  },
  {
    num: 473, title: "Matchsticks to Square", slug: "matchsticks-to-square", lc: "Medium",
    topic: "backtrack",
    pattern: "Bucket assignment with pruning",
    level: 4,
    order: 390,
    core: false,
    teaches: "Bucket search with a fixed capacity per bucket: place each stick into one of 4 sides of length total/4.",
    learn: ["dsa_backtrack", "dsa-bt-pat"],
    pre: [2305],
    hints: [
      "If the sticks form a square, what is each side's length? What quick checks rule it out?",
      "Side = total / 4. Fail fast if total % 4 != 0 or any stick is longer than a side.",
      "Sort sticks descending and try each one in each side that still has room. Skip a side whose current length equals one already tried for this stick."
    ],
    steps: [
      "side = total // 4; return False if total % 4 or max > side.",
      "Sort descending; sides = [0] * 4.",
      "go(i): if i == n return True. For each side j: skip if sides[j] + m[i] > side, or if sides[j] equals a side length already tried at this step.",
      "Add, if go(i + 1) return True, subtract. Return False."
    ],
    time: "O(4^n) worst case, much less with pruning", space: "O(n)",
    trap: "Sorting ascending makes the search time out; place big sticks first so failures show up early.",
    code: `def makesquare(matchsticks):
    total = sum(matchsticks)
    if total % 4:
        return False
    side = total // 4
    m = sorted(matchsticks, reverse=True)
    if m[0] > side:
        return False
    sides = [0] * 4
    def go(i):
        if i == len(m):
            return True
        tried = set()
        for j in range(4):
            if sides[j] + m[i] > side or sides[j] in tried:
                continue
            tried.add(sides[j])
            sides[j] += m[i]
            if go(i + 1):
                return True
            sides[j] -= m[i]
        return False
    return go(0)`
  },
  {
    num: 980, title: "Unique Paths III", slug: "unique-paths-iii", lc: "Hard",
    topic: "backtrack",
    pattern: "Grid path search",
    level: 4,
    order: 400,
    core: false,
    teaches: "Count grid paths that visit every free cell exactly once by tracking how many cells are still unvisited.",
    learn: ["dsa_backtrack", "dsa-bt-grid"],
    pre: [1219],
    hints: [
      "You must walk over every non-obstacle square exactly once. How do you know at the end that you did?",
      "Count the empty cells first (including start). Each step uses one up.",
      "At the end square, the path counts only if the remaining count is 0. Mark and unmark cells as usual."
    ],
    steps: [
      "Find start; count = number of cells that are not -1 (start and end included, minus the end).",
      "dfs(r, c, left): if out of bounds or grid[r][c] == -1 return 0.",
      "If grid[r][c] == 2 return 1 if left == 0 else 0.",
      "Mark grid[r][c] = -1, sum dfs on 4 neighbours with left - 1, restore, return the sum."
    ],
    time: "O(3^(m*n))", space: "O(m * n)",
    trap: "Off-by-one in the count of cells to visit; decide clearly whether start and end are included.",
    code: `def uniquePathsIII(grid):
    m, n = len(grid), len(grid[0])
    todo = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 1:
                sr, sc = r, c
            if grid[r][c] in (0, 1):
                todo += 1
    def dfs(r, c, left):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] == -1:
            return 0
        if grid[r][c] == 2:
            return 1 if left == 0 else 0
        keep = grid[r][c]
        grid[r][c] = -1
        total = (dfs(r + 1, c, left - 1) + dfs(r - 1, c, left - 1) +
                 dfs(r, c + 1, left - 1) + dfs(r, c - 1, left - 1))
        grid[r][c] = keep
        return total
    return dfs(sr, sc, todo)`
  },
  {
    num: 1718, title: "Construct the Lexicographically Largest Valid Sequence", slug: "construct-the-lexicographically-largest-valid-sequence", lc: "Medium",
    topic: "backtrack",
    pattern: "Constraint placement",
    level: 4,
    order: 410,
    core: false,
    teaches: "Fill the first empty slot with the largest legal number first; the first complete fill is the lexicographically largest.",
    learn: ["dsa_backtrack", "dsa-bt-grid"],
    pre: [51],
    hints: [
      "The array has length 2n - 1. Number i (i > 1) occupies two slots exactly i apart; 1 occupies one slot.",
      "Fill positions left to right. At the first empty slot, try numbers from n down to 1.",
      "Placing i > 1 at position p also needs p + i to be empty and in range. The first full array you reach is the answer."
    ],
    steps: [
      "res = [0] * (2n - 1); used = [False] * (n + 1).",
      "go(p): skip to the next empty p; if p == len(res) return True.",
      "For i from n down to 1, if not used: if i == 1 place at p; else need p + i < len and res[p + i] == 0, place at p and p + i.",
      "If go(p + 1) return True; else undo. Return False."
    ],
    time: "O(n!) worst case, fast in practice", space: "O(n)",
    trap: "Trying small numbers first finds a valid sequence but not the lexicographically largest one.",
    code: `def constructDistancedSequence(n):
    size = 2 * n - 1
    res = [0] * size
    used = [False] * (n + 1)
    def go(p):
        while p < size and res[p]:
            p += 1
        if p == size:
            return True
        for i in range(n, 0, -1):
            if used[i]:
                continue
            if i == 1:
                res[p] = 1
                used[1] = True
                if go(p + 1):
                    return True
                res[p] = 0
                used[1] = False
            elif p + i < size and res[p + i] == 0:
                res[p] = res[p + i] = i
                used[i] = True
                if go(p + 1):
                    return True
                res[p] = res[p + i] = 0
                used[i] = False
        return False
    go(0)
    return res`
  },
  {
    num: 996, title: "Number of Squareful Arrays", slug: "number-of-squareful-arrays", lc: "Hard",
    topic: "backtrack",
    pattern: "Permutations: used[] array",
    level: 5,
    order: 420,
    core: false,
    teaches: "Permutations II plus a pruning rule on neighbours: only extend if the new adjacent pair sums to a square.",
    learn: ["dsa_backtrack", "dsa-bt-sub"],
    pre: [47, 2850],
    hints: [
      "You need distinct permutations, so start from the Permutations II template (sort + skip twin).",
      "Add one more check when placing a number: prev + x must be a perfect square.",
      "Count complete permutations instead of storing them."
    ],
    steps: [
      "Sort nums; used = [False] * n.",
      "go(prev, depth): if depth == n return 1.",
      "For each i: skip used or duplicate twins; skip if depth > 0 and prev + nums[i] is not a perfect square.",
      "Mark, add go(nums[i], depth + 1), unmark. Return go(None, 0)."
    ],
    time: "O(n * n!) worst case, far less with pruning", space: "O(n)",
    trap: "Without the duplicate skip you count [1,8,17] and its copy with the two equal values swapped as different arrays.",
    code: `from math import isqrt

def numSquarefulPerms(nums):
    nums.sort()
    n = len(nums)
    used = [False] * n
    def square(x):
        r = isqrt(x)
        return r * r == x
    def go(prev, depth):
        if depth == n:
            return 1
        total = 0
        for i in range(n):
            if used[i] or (i > 0 and nums[i] == nums[i - 1] and not used[i - 1]):
                continue
            if depth > 0 and not square(prev + nums[i]):
                continue
            used[i] = True
            total += go(nums[i], depth + 1)
            used[i] = False
        return total
    return go(None, 0)`
  },
  {
    num: 282, title: "Expression Add Operators", slug: "expression-add-operators", lc: "Hard",
    topic: "backtrack",
    pattern: "Partitioning: cut the string",
    level: 5,
    order: 430,
    core: false,
    teaches: "Partition digits and choose an operator per cut; carry the last operand so '*' can undo the previous add.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [306],
    hints: [
      "Each cut gets '+', '-' or '*'. The hard part is '*', which binds tighter than + and -.",
      "Carry two numbers: value (total so far) and last (the last term added, with its sign).",
      "For '*', the new value is value - last + last * cur, and the new last is last * cur. Skip numbers with a leading zero."
    ],
    steps: [
      "go(i, expr, value, last): if i == n, record expr when value == target.",
      "For j from i: piece = num[i:j+1]; stop if it has a leading zero; cur = int(piece).",
      "If i == 0: go(j+1, piece, cur, cur).",
      "Else try '+' (value + cur, cur), '-' (value - cur, -cur), '*' (value - last + last*cur, last*cur)."
    ],
    time: "O(n * 4^n)", space: "O(n)",
    trap: "Evaluating the whole expression string at each leaf is too slow; track value and last instead.",
    code: `def addOperators(num, target):
    res = []
    n = len(num)
    def go(i, expr, value, last):
        if i == n:
            if value == target:
                res.append(expr)
            return
        for j in range(i, n):
            if j > i and num[i] == "0":
                break
            piece = num[i:j + 1]
            cur = int(piece)
            if i == 0:
                go(j + 1, piece, cur, cur)
            else:
                go(j + 1, expr + "+" + piece, value + cur, cur)
                go(j + 1, expr + "-" + piece, value - cur, -cur)
                go(j + 1, expr + "*" + piece, value - last + last * cur, last * cur)
    go(0, "", 0, 0)
    return res`
  },
  {
    num: 301, title: "Remove Invalid Parentheses", slug: "remove-invalid-parentheses", lc: "Hard",
    topic: "backtrack",
    pattern: "Partitioning: cut the string",
    level: 5,
    order: 440,
    core: false,
    teaches: "First count the minimum removals, then backtrack deleting exactly that many, skipping equal neighbours to avoid duplicates.",
    learn: ["dsa_backtrack", "dsa-bt-comb"],
    pre: [22, 90],
    hints: [
      "Scan once: how many unmatched '(' and unmatched ')' are there? That is the minimum to remove.",
      "Backtrack over positions deleting a '(' while extra '(' remain, or a ')' while extra ')' remain.",
      "Skip a position equal to the previous one at the same level, and check validity when both counts reach 0."
    ],
    steps: [
      "Scan to get l (extra '(') and r (extra ')').",
      "go(start, s, l, r): if l == r == 0, add s to results if it is valid; return.",
      "For i from start: skip if i > start and s[i] == s[i-1].",
      "If s[i] == '(' and l > 0: go(i, s without s[i], l - 1, r); if s[i] == ')' and r > 0: go(i, s without s[i], l, r - 1).",
      "Return the result set as a list."
    ],
    time: "O(n * 2^n)", space: "O(n^2) for the strings on the stack",
    trap: "Removing more than the minimum count gives valid but non-minimal strings; compute l and r first.",
    code: `def removeInvalidParentheses(s):
    l = r = 0
    for c in s:
        if c == "(":
            l += 1
        elif c == ")":
            if l:
                l -= 1
            else:
                r += 1
    def valid(t):
        bal = 0
        for c in t:
            if c == "(":
                bal += 1
            elif c == ")":
                bal -= 1
                if bal < 0:
                    return False
        return bal == 0
    res = set()
    def go(start, t, l, r):
        if l == 0 and r == 0:
            if valid(t):
                res.add(t)
            return
        for i in range(start, len(t)):
            if i > start and t[i] == t[i - 1]:
                continue
            if t[i] == "(" and l > 0:
                go(i, t[:i] + t[i + 1:], l - 1, r)
            elif t[i] == ")" and r > 0:
                go(i, t[:i] + t[i + 1:], l, r - 1)
    go(0, s, l, r)
    return list(res)`
  },
  {
    num: 698, title: "Partition to K Equal Sum Subsets", slug: "partition-to-k-equal-sum-subsets", lc: "Medium",
    topic: "backtrack",
    pattern: "Bucket assignment with pruning",
    level: 5,
    order: 450,
    core: true,
    teaches: "Generalize the square check to k buckets of size total/k, with symmetry pruning so it stays fast.",
    learn: ["dsa_backtrack", "dsa-bt-pat"],
    pre: [473],
    hints: [
      "Matchsticks to Square is this problem with k = 4.",
      "Bucket size = total / k. Sort descending, place each number into a bucket with room.",
      "Key pruning: if placing into an empty bucket fails, placing into any other empty bucket fails too, so stop. Also skip buckets with a load already tried."
    ],
    steps: [
      "If total % k != 0 or max > total // k, return False.",
      "Sort descending; load = [0] * k.",
      "go(i): if i == n return True. For each bucket j with room and an untried load: add, recurse, subtract.",
      "After undoing, if load[j] == 0, break."
    ],
    time: "O(k^n) worst case, much less with pruning", space: "O(n + k)",
    trap: "Without the empty-bucket break the search explores k! symmetric copies and times out.",
    code: `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k:
        return False
    target = total // k
    nums = sorted(nums, reverse=True)
    if nums[0] > target:
        return False
    load = [0] * k
    def go(i):
        if i == len(nums):
            return True
        tried = set()
        for j in range(k):
            if load[j] + nums[i] > target or load[j] in tried:
                continue
            tried.add(load[j])
            load[j] += nums[i]
            if go(i + 1):
                return True
            load[j] -= nums[i]
            if load[j] == 0:
                break
        return False
    return go(0)`
  },
  {
    num: 37, title: "Sudoku Solver", slug: "sudoku-solver", lc: "Hard",
    topic: "backtrack",
    pattern: "Constraint placement",
    level: 5,
    order: 460,
    core: true,
    teaches: "Constraint search on a grid: fill one empty cell at a time with a digit legal for its row, column and box.",
    learn: ["dsa_backtrack", "dsa-bt-grid"],
    pre: [51, 1718],
    hints: [
      "Like N-Queens, keep sets so 'is this digit allowed here?' is O(1).",
      "Use 9 row sets, 9 column sets and 9 box sets; box index = (r // 3) * 3 + c // 3.",
      "List the empty cells. Recurse over them; on failure undo the digit. Return True as soon as all are filled."
    ],
    steps: [
      "Fill rows[r], cols[c], boxes[b] from the given digits; collect empty cells.",
      "go(k): if k == len(empty) return True.",
      "For d in '1'..'9' allowed at empty[k]: place it, add to sets; if go(k + 1) return True; remove and reset to '.'.",
      "Return False. Call go(0); the board is modified in place."
    ],
    time: "O(9^E) worst case where E = empty cells", space: "O(E)",
    trap: "Forgetting to stop after the first full solution makes the search undo the finished board.",
    code: `def solveSudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    empty = []
    for r in range(9):
        for c in range(9):
            d = board[r][c]
            if d == ".":
                empty.append((r, c))
            else:
                rows[r].add(d); cols[c].add(d); boxes[(r // 3) * 3 + c // 3].add(d)
    def go(k):
        if k == len(empty):
            return True
        r, c = empty[k]
        b = (r // 3) * 3 + c // 3
        for d in "123456789":
            if d in rows[r] or d in cols[c] or d in boxes[b]:
                continue
            board[r][c] = d
            rows[r].add(d); cols[c].add(d); boxes[b].add(d)
            if go(k + 1):
                return True
            rows[r].remove(d); cols[c].remove(d); boxes[b].remove(d)
            board[r][c] = "."
        return False
    go(0)`
  },
  {
    num: 1723, title: "Find Minimum Time to Finish All Jobs", slug: "find-minimum-time-to-finish-all-jobs", lc: "Hard",
    topic: "backtrack",
    pattern: "Bucket assignment with pruning",
    level: 6,
    order: 470,
    core: false,
    teaches: "Minimize the maximum bucket load with branch-and-bound: biggest jobs first, prune by best, break on empty workers.",
    learn: ["dsa_backtrack", "dsa-bt-pat"],
    pre: [698, 2305],
    hints: [
      "This is Fair Distribution of Cookies with up to 12 jobs, so pruning must be strong.",
      "Sort jobs descending. Keep the best answer found so far and skip any worker whose load would reach it.",
      "Symmetry: trying the job on one empty worker is enough. A quick greedy answer as the starting best speeds things up."
    ],
    steps: [
      "Sort jobs descending; load = [0] * k; best = sum(jobs) (or a greedy answer).",
      "go(i, cur_max): if i == n, best = cur_max; return.",
      "For each worker j: skip if load[j] + jobs[i] >= best; add, go(i + 1, max(cur_max, load[j])), subtract.",
      "If load[j] == 0 after undoing, break."
    ],
    time: "O(k^n) worst case, fast in practice with pruning", space: "O(n + k)",
    trap: "An alternative is binary search on the answer plus a feasibility backtrack; both need the empty-worker break.",
    code: `def minimumTimeRequired(jobs, k):
    jobs = sorted(jobs, reverse=True)
    load = [0] * k
    best = sum(jobs)
    def go(i, cur_max):
        nonlocal best
        if i == len(jobs):
            best = cur_max
            return
        for j in range(k):
            if load[j] + jobs[i] >= best:
                continue
            load[j] += jobs[i]
            go(i + 1, max(cur_max, load[j]))
            load[j] -= jobs[i]
            if load[j] == 0:
                break
    if k >= len(jobs):
        return jobs[0]
    go(0, 0)
    return best`
  },
  {
    num: 1307, title: "Verbal Arithmetic Puzzle", slug: "verbal-arithmetic-puzzle", lc: "Hard",
    topic: "backtrack",
    pattern: "Constraint placement",
    level: 6,
    order: 480,
    core: false,
    teaches: "Turn the puzzle into one weighted equation, then assign distinct digits with a bound that prunes impossible branches.",
    learn: ["dsa_backtrack", "dsa-bt-grid"],
    pre: [37],
    hints: [
      "Each letter contributes digit * (sum of its place values in the words) minus its place values in the result. The puzzle is: total weight sum == 0.",
      "Assign digits to letters one by one (distinct digits, no leading zero for multi-letter words).",
      "Sort letters by |weight| descending. If |current sum| is larger than 9 * (sum of |weights| still unassigned), no completion can reach 0: prune."
    ],
    steps: [
      "Reject early if the longest word is longer than the result.",
      "weight[c] += 10^pos for each letter in the words; weight[c] -= 10^pos for letters in result. Mark leading letters.",
      "Order letters by |weight| descending; rest[i] = 9 * sum of |weight| for letters i..end.",
      "go(i, total): if |total| > rest[i] return False; if i == L return total == 0.",
      "Try each unused digit (not 0 for leading letters): go(i + 1, total + weight * d)."
    ],
    time: "O(10! / (10 - L)!) worst case, far less with the bound", space: "O(L)",
    trap: "Leading zeros are not allowed for multi-letter words, but a single-letter word may be 0.",
    code: `def isSolvable(words, result):
    if max(len(w) for w in words) > len(result):
        return False
    weight = {}
    lead = set()
    for w in words + [result]:
        if len(w) > 1:
            lead.add(w[0])
    for w in words:
        p = 1
        for c in reversed(w):
            weight[c] = weight.get(c, 0) + p
            p *= 10
    p = 1
    for c in reversed(result):
        weight[c] = weight.get(c, 0) - p
        p *= 10
    letters = sorted(weight, key=lambda c: -abs(weight[c]))
    L = len(letters)
    rest = [0] * (L + 1)
    for i in range(L - 1, -1, -1):
        rest[i] = rest[i + 1] + 9 * abs(weight[letters[i]])
    used = [False] * 10
    def go(i, total):
        if abs(total) > rest[i]:
            return False
        if i == L:
            return total == 0
        c = letters[i]
        for d in range(10):
            if used[d] or (d == 0 and c in lead):
                continue
            used[d] = True
            if go(i + 1, total + weight[c] * d):
                return True
            used[d] = False
        return False
    return go(0, 0)`
  }
);
