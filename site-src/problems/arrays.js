// problems/arrays.js — Arrays, Strings & Two Pointers ladder
PROBLEMS.push(
  {
    num: 1929, title: "Concatenation of Array", slug: "concatenation-of-array", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 1,
    order: 10,
    core: false,
    teaches: "Building a new list from an old one with a single loop (or list concatenation).",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [],
    hints: [
      "The answer has length 2n. Where does ans[i] come from, and where does ans[i + n] come from?",
      "Both come from nums[i]. In Python, nums + nums builds exactly that."
    ],
    steps: [
      "Create ans as an empty list.",
      "Append every element of nums once, then every element again.",
      "Return ans (or simply return nums + nums)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "The output is a new list of size 2n; that extra space is the answer itself, not overhead.",
    code: `def getConcatenation(nums):
    ans = []
    for _ in range(2):          # two passes over nums
        for x in nums:
            ans.append(x)
    return ans                  # same as: return nums + nums`
  },
  {
    num: 1470, title: "Shuffle the Array", slug: "shuffle-the-array", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 1,
    order: 20,
    core: false,
    teaches: "Index arithmetic: element i pairs with element i + n.",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [1929],
    hints: [
      "Write out the answer for [x1,x2,x3,y1,y2,y3]. Which index does y1 sit at in the input?",
      "x_i is nums[i] and y_i is nums[i + n]. Loop i from 0 to n - 1 and append both."
    ],
    steps: [
      "Create res = [].",
      "For i in 0..n-1: append nums[i], then nums[i + n].",
      "Return res."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Loop only to n, not 2n, or nums[i + n] runs off the end.",
    code: `def shuffle(nums, n):
    res = []
    for i in range(n):
        res.append(nums[i])       # x_i
        res.append(nums[i + n])   # y_i
    return res`
  },
  {
    num: 1431, title: "Kids With the Greatest Number of Candies", slug: "kids-with-the-greatest-number-of-candies", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 1,
    order: 30,
    core: false,
    teaches: "Two passes: first compute a summary (the max), then compare every element to it.",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [],
    hints: [
      "A kid ends up with the most candies if their total is at least the current maximum.",
      "Find max(candies) once, then check candies[i] + extraCandies >= that max for every i."
    ],
    steps: [
      "best = max(candies).",
      "For each c: append c + extraCandies >= best.",
      "Return the list of booleans."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Ties count as 'greatest': use >=, not >.",
    code: `def kidsWithCandies(candies, extraCandies):
    best = max(candies)
    return [c + extraCandies >= best for c in candies]`
  },
  {
    num: 485, title: "Max Consecutive Ones", slug: "max-consecutive-ones", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 1,
    order: 40,
    core: false,
    teaches: "A running counter that resets: track the current streak and the best streak.",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [],
    hints: [
      "Scan left to right. What should happen to your streak when you see a 1? And a 0?",
      "On 1: cur += 1 and update best. On 0: cur = 0."
    ],
    steps: [
      "cur = best = 0.",
      "For each x: if x == 1, cur += 1 and best = max(best, cur); else cur = 0.",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Update best inside the loop; if you only update it on a 0, a streak at the very end is lost.",
    code: `def findMaxConsecutiveOnes(nums):
    cur = best = 0
    for x in nums:
        if x == 1:
            cur += 1
            best = max(best, cur)
        else:
            cur = 0
    return best`
  },
  {
    num: 1920, title: "Build Array from Permutation", slug: "build-array-from-permutation", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 1,
    order: 50,
    core: false,
    teaches: "Using values as indexes: nums[nums[i]].",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [],
    hints: [
      "The answer at position i is just nums[nums[i]]. Read it straight from the definition.",
      "Build a new list with one loop. (Follow-up for later: store two numbers in one cell as a + b*n to do it in place.)"
    ],
    steps: [
      "ans = [nums[nums[i]] for each i].",
      "Return ans."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Writing into nums while reading from it corrupts later reads; use a new list (or the a + b*n encoding).",
    code: `def buildArray(nums):
    return [nums[x] for x in nums]   # ans[i] = nums[nums[i]]`
  },
  {
    num: 1108, title: "Defanging an IP Address", slug: "defanging-an-ip-address", lc: "Easy",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 1,
    order: 60,
    core: false,
    teaches: "Strings are immutable: build a new one character by character (or with replace).",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [],
    hints: [
      "You cannot change a Python string in place. Build a new one.",
      "Walk the characters; append '[.]' for a dot and the character itself otherwise, then ''.join the pieces."
    ],
    steps: [
      "parts = [].",
      "For ch in address: append '[.]' if ch == '.' else ch.",
      "Return ''.join(parts)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Building with s += ch in a loop can be O(n^2) in some languages; collecting pieces and joining is the safe habit.",
    code: `def defangIPaddr(address):
    parts = []
    for ch in address:
        parts.append("[.]" if ch == "." else ch)
    return "".join(parts)       # same as address.replace(".", "[.]")`
  },
  {
    num: 709, title: "To Lower Case", slug: "to-lower-case", lc: "Easy",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 1,
    order: 70,
    core: false,
    teaches: "Characters are numbers: ord/chr and the fixed gap of 32 between 'A' and 'a'.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [1108],
    hints: [
      "Upper-case letters are 'A'..'Z'; each has a lower-case partner.",
      "ord('a') - ord('A') == 32. If a character is between 'A' and 'Z', add 32 to its code."
    ],
    steps: [
      "For each ch: if 'A' <= ch <= 'Z', append chr(ord(ch) + 32), else append ch.",
      "Join and return."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Only shift letters A-Z; digits and symbols must stay unchanged.",
    code: `def toLowerCase(s):
    out = []
    for ch in s:
        if "A" <= ch <= "Z":
            out.append(chr(ord(ch) + 32))   # 'A'(65) -> 'a'(97)
        else:
            out.append(ch)
    return "".join(out)`
  },
  {
    num: 58, title: "Length of Last Word", slug: "length-of-last-word", lc: "Easy",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 1,
    order: 80,
    core: false,
    teaches: "Scanning a string from the end.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [1108],
    hints: [
      "Start at the last character. There may be trailing spaces.",
      "Skip spaces from the right, then count letters until you hit a space or the start."
    ],
    steps: [
      "i = len(s) - 1; while s[i] == ' ': i -= 1.",
      "length = 0; while i >= 0 and s[i] != ' ': length += 1; i -= 1.",
      "Return length."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Trailing spaces: 'fly me   to   the moon  ' ends with spaces; the answer is 4, not 0.",
    code: `def lengthOfLastWord(s):
    i = len(s) - 1
    while i >= 0 and s[i] == " ":
        i -= 1                     # skip trailing spaces
    length = 0
    while i >= 0 and s[i] != " ":
        length += 1
        i -= 1
    return length`
  },
  {
    num: 344, title: "Reverse String", slug: "reverse-string", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 1,
    order: 90,
    core: true,
    teaches: "The basic two-pointer move: one pointer at each end, swap, step both inward.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [],
    hints: [
      "Put l at the first index and r at the last.",
      "Swap s[l] and s[r], then move l right and r left. Stop when they meet."
    ],
    steps: [
      "l, r = 0, len(s) - 1.",
      "While l < r: swap s[l], s[r]; l += 1; r -= 1."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Modify the list in place; returning s[::-1] creates a new list and does not change the input.",
    code: `def reverseString(s):
    l, r = 0, len(s) - 1
    while l < r:
        s[l], s[r] = s[r], s[l]
        l += 1
        r -= 1`
  },
  {
    num: 27, title: "Remove Element", slug: "remove-element", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: reader/writer",
    level: 1,
    order: 100,
    core: true,
    teaches: "Slow writer / fast reader: copy every element you keep to the write position.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [],
    hints: [
      "Use one pointer to read every element and another (k) for the next free spot to write a kept element.",
      "If nums[i] != val, write it at nums[k] and do k += 1. Return k."
    ],
    steps: [
      "k = 0.",
      "For each x in nums: if x != val: nums[k] = x; k += 1.",
      "Return k."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Return the count k; the judge only checks the first k elements.",
    code: `def removeElement(nums, val):
    k = 0                      # next write position
    for x in nums:
        if x != val:
            nums[k] = x
            k += 1
    return k`
  },
  {
    num: 26, title: "Remove Duplicates from Sorted Array", slug: "remove-duplicates-from-sorted-array", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: reader/writer",
    level: 1,
    order: 110,
    core: true,
    teaches: "Reader/writer on sorted input: keep an element only if it differs from the last kept one.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [27],
    hints: [
      "Sorted means duplicates are next to each other.",
      "Keep a write index k (starting at 1). Write nums[i] only when it differs from nums[k - 1], the last kept value."
    ],
    steps: [
      "k = 1.",
      "For i in 1..n-1: if nums[i] != nums[k - 1]: nums[k] = nums[i]; k += 1.",
      "Return k."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Compare with the last WRITTEN value nums[k-1], which is always correct even after overwrites.",
    code: `def removeDuplicates(nums):
    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[k - 1]:     # new value: keep it
            nums[k] = nums[i]
            k += 1
    return k`
  },
  {
    num: 905, title: "Sort Array By Parity", slug: "sort-array-by-parity", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: reader/writer",
    level: 1,
    order: 120,
    core: false,
    teaches: "Writer pointer that swaps wanted elements to the front (partition in place).",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [27],
    hints: [
      "You want all even numbers first. Keep k = next slot for an even number.",
      "Scan with i; when nums[i] is even, swap it into position k and move k forward."
    ],
    steps: [
      "k = 0.",
      "For i: if nums[i] % 2 == 0: swap nums[i], nums[k]; k += 1.",
      "Return nums."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Any order inside each group is accepted; swapping (not copying) keeps the odd numbers.",
    code: `def sortArrayByParity(nums):
    k = 0
    for i in range(len(nums)):
        if nums[i] % 2 == 0:
            nums[i], nums[k] = nums[k], nums[i]
            k += 1
    return nums`
  },
  {
    num: 1768, title: "Merge Strings Alternately", slug: "merge-strings-alternately", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: two sequences",
    level: 1,
    order: 130,
    core: false,
    teaches: "One pointer per sequence, advanced together; then append the leftovers.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [],
    hints: [
      "Take one character from word1, then one from word2, while both still have characters.",
      "When one runs out, append the rest of the other."
    ],
    steps: [
      "i = 0; out = [].",
      "While i < len(word1) or i < len(word2): if i < len(word1) append word1[i]; if i < len(word2) append word2[i]; i += 1.",
      "Return ''.join(out)."
    ],
    time: "O(n + m)", space: "O(n + m)",
    trap: "The words can have different lengths; do not stop at the shorter one.",
    code: `def mergeAlternately(word1, word2):
    out = []
    i = 0
    while i < len(word1) or i < len(word2):
        if i < len(word1):
            out.append(word1[i])
        if i < len(word2):
            out.append(word2[i])
        i += 1
    return "".join(out)`
  },
  {
    num: 392, title: "Is Subsequence", slug: "is-subsequence", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: two sequences",
    level: 1,
    order: 140,
    core: true,
    teaches: "Two pointers on two strings: the pointer on s only advances on a match.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [1768],
    hints: [
      "Walk through t once. Keep i = how many characters of s you have matched so far.",
      "When t[j] == s[i], advance i. s is a subsequence if i reaches len(s)."
    ],
    steps: [
      "i = 0.",
      "For ch in t: if i < len(s) and s[i] == ch: i += 1.",
      "Return i == len(s)."
    ],
    time: "O(n + m)", space: "O(1)",
    trap: "An empty s is always a subsequence; check i < len(s) before indexing.",
    code: `def isSubsequence(s, t):
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:
            i += 1
    return i == len(s)`
  },
  {
    num: 643, title: "Maximum Average Subarray I", slug: "maximum-average-subarray-i", lc: "Easy",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 1,
    order: 150,
    core: true,
    teaches: "Fixed window: add the element entering on the right, subtract the one leaving on the left.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [],
    hints: [
      "Recomputing every window sum costs O(n*k). What changes when the window slides one step?",
      "One element enters (nums[i]) and one leaves (nums[i - k]). Keep a running sum and update it in O(1).",
      "Track the best sum; divide by k only at the end."
    ],
    steps: [
      "window = sum(nums[:k]); best = window.",
      "For i in range(k, n): window += nums[i] - nums[i - k]; best = max(best, window).",
      "Return best / k."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Initialise best with the first window's sum, not 0: all numbers may be negative.",
    code: `def findMaxAverage(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]    # one in, one out
        best = max(best, window)
    return best / k`
  },
  {
    num: 1876, title: "Substrings of Size Three with Distinct Characters", slug: "substrings-of-size-three-with-distinct-characters", lc: "Easy",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 1,
    order: 160,
    core: false,
    teaches: "Check every window of size 3 directly; with tiny k you can just look at the window.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [643],
    hints: [
      "There are n - 2 windows of length 3: s[i], s[i+1], s[i+2].",
      "A window is good if its three characters are pairwise different."
    ],
    steps: [
      "count = 0.",
      "For i in range(len(s) - 2): a, b, c = s[i], s[i+1], s[i+2]; if a != b and b != c and a != c: count += 1.",
      "Return count."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Strings shorter than 3 have no windows; the range is then empty, which is correct.",
    code: `def countGoodSubstrings(s):
    count = 0
    for i in range(len(s) - 2):
        a, b, c = s[i], s[i + 1], s[i + 2]
        if a != b and b != c and a != c:
            count += 1
    return count`
  },
  {
    num: 1480, title: "Running Sum of 1d Array", slug: "running-sum-of-1d-array", lc: "Easy",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 1,
    order: 170,
    core: true,
    teaches: "A prefix (running) sum: each entry is the previous total plus the current element.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [],
    hints: [
      "The answer at i is nums[0] + ... + nums[i]. How does it relate to the answer at i - 1?",
      "running[i] = running[i - 1] + nums[i]. Keep one running total while you scan."
    ],
    steps: [
      "total = 0; res = [].",
      "For x in nums: total += x; res.append(total).",
      "Return res."
    ],
    time: "O(n)", space: "O(n) for the output",
    trap: "Re-summing nums[:i+1] for each i is O(n^2); reuse the previous total.",
    code: `def runningSum(nums):
    res = []
    total = 0
    for x in nums:
        total += x
        res.append(total)
    return res`
  },
  {
    num: 1732, title: "Find the Highest Altitude", slug: "find-the-highest-altitude", lc: "Easy",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 1,
    order: 180,
    core: false,
    teaches: "The prefix sums ARE the altitudes; track the maximum (including the start at 0).",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [1480],
    hints: [
      "gain[i] is the change between points. The altitude after i steps is the running sum of gains.",
      "Start at altitude 0 and keep the maximum of all running sums, including 0."
    ],
    steps: [
      "alt = best = 0.",
      "For g in gain: alt += g; best = max(best, alt).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "The start point (altitude 0) counts; if all gains are negative the answer is 0.",
    code: `def largestAltitude(gain):
    alt = best = 0                 # the start point has altitude 0
    for g in gain:
        alt += g
        best = max(best, alt)
    return best`
  },
  {
    num: 303, title: "Range Sum Query - Immutable", slug: "range-sum-query-immutable", lc: "Easy",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 1,
    order: 190,
    core: true,
    teaches: "Precompute prefix[i] = sum of the first i numbers; any range sum is one subtraction.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [1480],
    hints: [
      "sumRange is called many times. Summing the slice each time costs O(n) per call.",
      "Store pre with pre[0] = 0 and pre[i + 1] = pre[i] + nums[i].",
      "Sum of nums[left..right] = pre[right + 1] - pre[left]."
    ],
    steps: [
      "In __init__: pre = [0]; for x in nums: pre.append(pre[-1] + x).",
      "sumRange(l, r): return pre[r + 1] - pre[l]."
    ],
    time: "O(n) build, O(1) per query", space: "O(n)",
    trap: "The leading 0 (pre has n + 1 entries) avoids a special case for left == 0.",
    code: `class NumArray:
    def __init__(self, nums):
        self.pre = [0]
        for x in nums:
            self.pre.append(self.pre[-1] + x)

    def sumRange(self, left, right):
        return self.pre[right + 1] - self.pre[left]`
  },
  {
    num: 53, title: "Maximum Subarray", slug: "maximum-subarray", lc: "Medium",
    topic: "arrays",
    pattern: "Kadane: best run ending here",
    level: 1,
    order: 200,
    core: true,
    teaches: "Kadane: the best subarray ending here either extends the previous one or starts fresh at this element.",
    learn: ["dsa_arrays", "dsa-ar-kadane"],
    pre: [],
    hints: [
      "Think about the best sum of a subarray that ENDS at index i.",
      "It is either nums[i] alone, or nums[i] plus the best sum ending at i - 1. Pick the larger.",
      "The answer is the largest of these 'ending here' values."
    ],
    steps: [
      "cur = best = nums[0].",
      "For x in nums[1:]: cur = max(x, cur + x); best = max(best, cur).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Start with nums[0], not 0: if every number is negative the answer is the largest single number.",
    code: `def maxSubArray(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)          # extend or start fresh
        best = max(best, cur)
    return best`
  },
  {
    num: 1672, title: "Richest Customer Wealth", slug: "richest-customer-wealth", lc: "Easy",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 1,
    order: 210,
    core: false,
    teaches: "Looping over a matrix: rows first, then the cells in each row.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [],
    hints: [
      "Each row is one customer. Their wealth is the sum of that row.",
      "Compute sum(row) for every row and return the largest."
    ],
    steps: [
      "best = 0.",
      "For row in accounts: best = max(best, sum(row)).",
      "Return best."
    ],
    time: "O(R*C)", space: "O(1)",
    trap: "The answer is a row sum, not a column sum: accounts[i] is customer i.",
    code: `def maximumWealth(accounts):
    best = 0
    for row in accounts:
        best = max(best, sum(row))
    return best`
  },
  {
    num: 1572, title: "Matrix Diagonal Sum", slug: "matrix-diagonal-sum", lc: "Easy",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 1,
    order: 220,
    core: false,
    teaches: "Diagonal index patterns: primary is (i, i), secondary is (i, n - 1 - i).",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [1672],
    hints: [
      "The primary diagonal cells are mat[i][i]. The secondary ones are mat[i][n - 1 - i].",
      "Add both for every row i. When n is odd, the centre cell is on both diagonals: subtract it once."
    ],
    steps: [
      "total = 0; for i in range(n): total += mat[i][i] + mat[i][n - 1 - i].",
      "If n is odd: total -= mat[n // 2][n // 2].",
      "Return total."
    ],
    time: "O(n)", space: "O(1)",
    trap: "The centre cell of an odd-sized matrix is counted twice unless you remove it.",
    code: `def diagonalSum(mat):
    n = len(mat)
    total = 0
    for i in range(n):
        total += mat[i][i] + mat[i][n - 1 - i]
    if n % 2 == 1:
        total -= mat[n // 2][n // 2]   # centre counted twice
    return total`
  },
  {
    num: 867, title: "Transpose Matrix", slug: "transpose-matrix", lc: "Easy",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 1,
    order: 230,
    core: true,
    teaches: "Transpose: cell (i, j) moves to (j, i); a R x C matrix becomes C x R.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [1672],
    hints: [
      "The new matrix has C rows and R columns.",
      "Set res[j][i] = matrix[i][j] for every cell."
    ],
    steps: [
      "res = [[0] * R for _ in range(C)].",
      "For i in range(R): for j in range(C): res[j][i] = matrix[i][j].",
      "Return res."
    ],
    time: "O(R*C)", space: "O(R*C) for the output",
    trap: "For a non-square matrix you need a new matrix; in-place swapping only works when R == C.",
    code: `def transpose(matrix):
    R, C = len(matrix), len(matrix[0])
    res = [[0] * R for _ in range(C)]
    for i in range(R):
        for j in range(C):
            res[j][i] = matrix[i][j]
    return res`
  },
  {
    num: 896, title: "Monotonic Array", slug: "monotonic-array", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 2,
    order: 240,
    core: false,
    teaches: "Compare neighbours: one pass with two boolean flags.",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [485],
    hints: [
      "You only need to look at adjacent pairs nums[i-1], nums[i].",
      "Keep two flags: could it still be non-decreasing? could it still be non-increasing? A pair can break one of them.",
      "If nums[i] < nums[i-1] it cannot be increasing; if nums[i] > nums[i-1] it cannot be decreasing. Return inc or dec."
    ],
    steps: [
      "inc = dec = True.",
      "For i from 1: if nums[i] > nums[i-1], dec = False; if nums[i] < nums[i-1], inc = False.",
      "Return inc or dec."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Equal neighbours are allowed in both directions; an all-equal array is monotonic.",
    code: `def isMonotonic(nums):
    inc = dec = True
    for i in range(1, len(nums)):
        if nums[i] > nums[i - 1]:
            dec = False
        elif nums[i] < nums[i - 1]:
            inc = False
    return inc or dec`
  },
  {
    num: 414, title: "Third Maximum Number", slug: "third-maximum-number", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 2,
    order: 250,
    core: false,
    teaches: "Tracking the top three distinct values in one pass by shifting them down.",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [485],
    hints: [
      "Keep three slots: first, second, third largest distinct values seen so far.",
      "When a new value beats first, everything shifts down one slot. Skip values equal to any slot.",
      "If third never gets filled, the problem says return the maximum."
    ],
    steps: [
      "first = second = third = None.",
      "For each x: skip if x equals one of them.",
      "If x > first: shift (third, second, first) = (second, first, x); elif x > second: (third, second) = (second, x); elif x > third: third = x (treat None as smaller than anything).",
      "Return third if it is not None, else first."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Duplicates do not count: [2, 2, 3, 1] has third max 1, not 2.",
    code: `def thirdMax(nums):
    first = second = third = None
    for x in nums:
        if x == first or x == second or x == third:
            continue                       # distinct values only
        if first is None or x > first:
            first, second, third = x, first, second
        elif second is None or x > second:
            second, third = x, second
        elif third is None or x > third:
            third = x
    return third if third is not None else first`
  },
  {
    num: 1752, title: "Check if Array Is Sorted and Rotated", slug: "check-if-array-is-sorted-and-rotated", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 2,
    order: 260,
    core: false,
    teaches: "Counting 'drops' between neighbours, including the wrap-around pair.",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [896],
    hints: [
      "A sorted array rotated once looks like two increasing runs glued together.",
      "Count positions where nums[i] > nums[i + 1]. Also compare the last element with the first (wrap around).",
      "Valid if there is at most one such drop."
    ],
    steps: [
      "drops = 0.",
      "For i in 0..n-1: if nums[i] > nums[(i + 1) % n], drops += 1.",
      "Return drops <= 1."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Forgetting the wrap-around pair: [2, 1, 3, 4] has one inner drop but 4 > 2 adds a second, so it is false.",
    code: `def check(nums):
    n = len(nums)
    drops = 0
    for i in range(n):
        if nums[i] > nums[(i + 1) % n]:   # (i + 1) % n wraps last -> first
            drops += 1
    return drops <= 1`
  },
  {
    num: 228, title: "Summary Ranges", slug: "summary-ranges", lc: "Easy",
    topic: "arrays",
    pattern: "Array basics: scan & build",
    level: 2,
    order: 270,
    core: false,
    teaches: "Grouping consecutive runs: remember where the current run started.",
    learn: ["dsa_arrays", "dsa-ar-dynamic"],
    pre: [485],
    hints: [
      "A run continues while nums[i] == nums[i-1] + 1.",
      "Remember the start of the current run. When the run breaks (or the array ends), write it out.",
      "Write 'a' if start == end, otherwise 'a->b'."
    ],
    steps: [
      "res = [], i = 0.",
      "While i < n: start = nums[i]; while i + 1 < n and nums[i + 1] == nums[i] + 1: i += 1.",
      "Append str(start) if start == nums[i] else f'{start}->{nums[i]}'; i += 1.",
      "Return res."
    ],
    time: "O(n)", space: "O(1) extra",
    trap: "Empty input must return []; and do not forget to flush the last run.",
    code: `def summaryRanges(nums):
    res = []
    i, n = 0, len(nums)
    while i < n:
        start = nums[i]
        while i + 1 < n and nums[i + 1] == nums[i] + 1:
            i += 1                      # extend the run
        res.append(str(start) if start == nums[i] else f"{start}->{nums[i]}")
        i += 1
    return res`
  },
  {
    num: 14, title: "Longest Common Prefix", slug: "longest-common-prefix", lc: "Easy",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 2,
    order: 280,
    core: true,
    teaches: "Vertical scan: compare column by column across all strings.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [58],
    hints: [
      "The prefix can be no longer than the shortest string.",
      "Check column j: do all strings have the same character at index j?",
      "Stop at the first column where a string is too short or a character differs."
    ],
    steps: [
      "For j in range(len(strs[0])): ch = strs[0][j].",
      "For every other string s: if j == len(s) or s[j] != ch, return strs[0][:j].",
      "Return strs[0]."
    ],
    time: "O(total characters)", space: "O(1) extra",
    trap: "A string shorter than strs[0] ends the prefix; check the length before indexing.",
    code: `def longestCommonPrefix(strs):
    first = strs[0]
    for j, ch in enumerate(first):
        for s in strs[1:]:
            if j == len(s) or s[j] != ch:
                return first[:j]
    return first`
  },
  {
    num: 13, title: "Roman to Integer", slug: "roman-to-integer", lc: "Easy",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 2,
    order: 290,
    core: false,
    teaches: "Scan with a look-ahead: subtract a symbol when a bigger one follows it.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [1108],
    hints: [
      "Map each symbol to its value. Normally you just add them up.",
      "IV, IX, XL... are the exceptions: a smaller symbol before a bigger one is subtracted.",
      "For each i: if value[s[i]] < value[s[i+1]] subtract it, otherwise add it."
    ],
    steps: [
      "val = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}.",
      "total = 0; for i: v = val[s[i]]; if i + 1 < n and v < val[s[i+1]]: total -= v else total += v.",
      "Return total."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Check i + 1 < n before looking ahead at the last character.",
    code: `def romanToInt(s):
    val = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i, ch in enumerate(s):
        v = val[ch]
        if i + 1 < len(s) and v < val[s[i + 1]]:
            total -= v                 # IV, IX, XL, ... : subtract
        else:
            total += v
    return total`
  },
  {
    num: 28, title: "Find the Index of the First Occurrence in a String", slug: "find-the-index-of-the-first-occurrence-in-a-string", lc: "Easy",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 2,
    order: 300,
    core: false,
    teaches: "Brute-force substring search: try every start and compare.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [14],
    hints: [
      "Try each start index i where the needle could still fit (i <= n - m).",
      "At each start compare haystack[i:i + m] with needle; return i on the first match."
    ],
    steps: [
      "For i in range(n - m + 1): if haystack[i:i + m] == needle: return i.",
      "Return -1."
    ],
    time: "O(n*m)", space: "O(1)",
    trap: "Loop to n - m inclusive; a needle at the very end is easy to miss. (KMP makes it O(n + m), not needed here.)",
    code: `def strStr(haystack, needle):
    n, m = len(haystack), len(needle)
    for i in range(n - m + 1):
        if haystack[i:i + m] == needle:
            return i
    return -1`
  },
  {
    num: 557, title: "Reverse Words in a String III", slug: "reverse-words-in-a-string-iii", lc: "Easy",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 2,
    order: 310,
    core: false,
    teaches: "Split into words, transform each, join back.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [344],
    hints: [
      "Words are separated by single spaces and their order stays the same.",
      "Reverse each word on its own, then join with ' '."
    ],
    steps: [
      "words = s.split(' ').",
      "Return ' '.join(w[::-1] for w in words)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Reverse each word, not the whole sentence; the word order must not change.",
    code: `def reverseWords(s):
    return " ".join(w[::-1] for w in s.split(" "))`
  },
  {
    num: 125, title: "Valid Palindrome", slug: "valid-palindrome", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 2,
    order: 320,
    core: true,
    teaches: "Opposite-end pointers that skip characters you do not care about.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [344],
    hints: [
      "A palindrome reads the same from both ends, so compare s[l] and s[r] while moving inward.",
      "Before comparing, move l forward past non-alphanumeric characters, and r backward likewise.",
      "Compare lower-cased characters; any mismatch means False."
    ],
    steps: [
      "l, r = 0, len(s) - 1.",
      "While l < r: skip non-alnum on both sides (keeping l < r).",
      "If s[l].lower() != s[r].lower(): return False; else l += 1, r -= 1.",
      "Return True."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Keep l < r inside the skipping loops, or a string like '.,' runs past the ends.",
    code: `def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`
  },
  {
    num: 977, title: "Squares of a Sorted Array", slug: "squares-of-a-sorted-array", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 2,
    order: 330,
    core: false,
    teaches: "The largest square is at one of the two ends; fill the answer from the back.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [344],
    hints: [
      "Negative numbers make the squares unsorted, but the biggest square is always nums[0]^2 or nums[-1]^2.",
      "Compare the two ends, put the bigger square at the last free position of the answer, and move that pointer inward."
    ],
    steps: [
      "res = [0] * n; l, r = 0, n - 1.",
      "For pos from n - 1 down to 0: if abs(nums[l]) > abs(nums[r]): res[pos] = nums[l]^2, l += 1; else res[pos] = nums[r]^2, r -= 1.",
      "Return res."
    ],
    time: "O(n)", space: "O(n) for the output",
    trap: "Squaring then sorting works but costs O(n log n); the two-pointer fill is O(n).",
    code: `def sortedSquares(nums):
    n = len(nums)
    res = [0] * n
    l, r = 0, n - 1
    for pos in range(n - 1, -1, -1):   # biggest square goes last
        if abs(nums[l]) > abs(nums[r]):
            res[pos] = nums[l] * nums[l]
            l += 1
        else:
            res[pos] = nums[r] * nums[r]
            r -= 1
    return res`
  },
  {
    num: 167, title: "Two Sum II - Input Array Is Sorted", slug: "two-sum-ii-input-array-is-sorted", lc: "Medium",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 2,
    order: 340,
    core: true,
    teaches: "Sorted input: if the sum is too small move the left pointer up, if too big move the right pointer down.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [344],
    hints: [
      "The array is sorted. Start with the smallest (left) and largest (right) number.",
      "If their sum is less than target, the only way to grow it is to move l right. If more, move r left.",
      "Return 1-based indexes [l + 1, r + 1] when the sum matches."
    ],
    steps: [
      "l, r = 0, n - 1.",
      "While l < r: s = numbers[l] + numbers[r]; if s == target return [l + 1, r + 1]; if s < target l += 1 else r -= 1."
    ],
    time: "O(n)", space: "O(1)",
    trap: "The answer is 1-indexed.",
    code: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]      # 1-based
        if s < target:
            l += 1                     # need a bigger sum
        else:
            r -= 1                     # need a smaller sum
    return []`
  },
  {
    num: 283, title: "Move Zeroes", slug: "move-zeroes", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: reader/writer",
    level: 2,
    order: 350,
    core: true,
    teaches: "Reader/writer with swaps keeps the order of kept elements and pushes the rest to the end.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [27],
    hints: [
      "Like Remove Element with val = 0, but the zeros must end up at the back.",
      "Swap nums[i] with nums[k] whenever nums[i] != 0; the zeros drift to the back automatically.",
      "The relative order of non-zero values is preserved because k only moves forward."
    ],
    steps: [
      "k = 0.",
      "For i in range(n): if nums[i] != 0: swap nums[k], nums[i]; k += 1."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Must be in place; building a new list and copying back is not allowed by the problem.",
    code: `def moveZeroes(nums):
    k = 0
    for i in range(len(nums)):
        if nums[i] != 0:
            nums[k], nums[i] = nums[i], nums[k]
            k += 1`
  },
  {
    num: 2460, title: "Apply Operations to an Array", slug: "apply-operations-to-an-array", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: reader/writer",
    level: 2,
    order: 360,
    core: false,
    teaches: "Simulate a pass of operations, then reuse Move Zeroes.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [283],
    hints: [
      "Do exactly what the statement says first: for i in 0..n-2, if nums[i] == nums[i+1], double nums[i] and set nums[i+1] = 0.",
      "Then shift all zeros to the end keeping order: that is Move Zeroes."
    ],
    steps: [
      "For i in range(n - 1): if nums[i] == nums[i + 1]: nums[i] *= 2; nums[i + 1] = 0.",
      "k = 0; for i: if nums[i] != 0: swap nums[k], nums[i]; k += 1.",
      "Return nums."
    ],
    time: "O(n)", space: "O(1)",
    trap: "The operations are applied in order on the changing array, one left-to-right pass.",
    code: `def applyOperations(nums):
    n = len(nums)
    for i in range(n - 1):
        if nums[i] == nums[i + 1]:
            nums[i] *= 2
            nums[i + 1] = 0
    k = 0
    for i in range(n):                 # move zeroes to the end
        if nums[i] != 0:
            nums[k], nums[i] = nums[i], nums[k]
            k += 1
    return nums`
  },
  {
    num: 88, title: "Merge Sorted Array", slug: "merge-sorted-array", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: two sequences",
    level: 2,
    order: 370,
    core: true,
    teaches: "Merge from the back so you never overwrite unread values.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [1768],
    hints: [
      "Merging from the front would overwrite nums1 values you still need.",
      "nums1 has free space at the end. Compare the largest remaining values (nums1[i], nums2[j]) and write the bigger at position k from the back.",
      "When nums2 runs out you are done; leftover nums1 values are already in place."
    ],
    steps: [
      "i, j, k = m - 1, n - 1, m + n - 1.",
      "While j >= 0: if i >= 0 and nums1[i] > nums2[j]: nums1[k] = nums1[i]; i -= 1; else nums1[k] = nums2[j]; j -= 1. k -= 1."
    ],
    time: "O(m + n)", space: "O(1)",
    trap: "Loop on j >= 0, not i >= 0: leftover nums2 values must still be copied.",
    code: `def merge(nums1, m, nums2, n):
    i, j, k = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1`
  },
  {
    num: 925, title: "Long Pressed Name", slug: "long-pressed-name", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: two sequences",
    level: 2,
    order: 380,
    core: false,
    teaches: "Two pointers where one side may repeat its last character.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [392],
    hints: [
      "Walk typed with j and name with i.",
      "If typed[j] matches name[i], advance both. Else if typed[j] repeats typed[j-1], it is a long press: skip it. Else return False.",
      "At the end all of name must be matched."
    ],
    steps: [
      "i = 0.",
      "For j in range(len(typed)): if i < len(name) and name[i] == typed[j]: i += 1; elif j > 0 and typed[j] == typed[j - 1]: continue; else return False.",
      "Return i == len(name)."
    ],
    time: "O(n + m)", space: "O(1)",
    trap: "Extra characters at the end of typed must also be repeats, and name must be fully matched.",
    code: `def isLongPressedName(name, typed):
    i = 0
    for j in range(len(typed)):
        if i < len(name) and name[i] == typed[j]:
            i += 1
        elif j > 0 and typed[j] == typed[j - 1]:
            continue                   # long press of the previous key
        else:
            return False
    return i == len(name)`
  },
  {
    num: 1343, title: "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold", slug: "number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 2,
    order: 390,
    core: false,
    teaches: "Fixed window sum compared against a target (avoid division: compare sum with threshold * k).",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [643],
    hints: [
      "Average >= threshold is the same as window sum >= threshold * k. No floats needed.",
      "Slide a window of size k with a running sum and count how many windows pass."
    ],
    steps: [
      "need = threshold * k; window = sum(arr[:k]); count = 1 if window >= need else 0.",
      "For i in range(k, n): window += arr[i] - arr[i - k]; if window >= need: count += 1.",
      "Return count."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Remember to test the very first window before the loop.",
    code: `def numOfSubarrays(arr, k, threshold):
    need = threshold * k
    window = sum(arr[:k])
    count = 1 if window >= need else 0
    for i in range(k, len(arr)):
        window += arr[i] - arr[i - k]
        if window >= need:
            count += 1
    return count`
  },
  {
    num: 1456, title: "Maximum Number of Vowels in a Substring of Given Length", slug: "maximum-number-of-vowels-in-a-substring-of-given-length", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 2,
    order: 400,
    core: false,
    teaches: "A fixed window can track a count instead of a sum.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [643],
    hints: [
      "Instead of a sum, keep the number of vowels in the current window.",
      "When s[i] enters, add 1 if it is a vowel; when s[i - k] leaves, subtract 1 if it is a vowel."
    ],
    steps: [
      "V = set('aeiou'); cur = number of vowels in s[:k]; best = cur.",
      "For i in range(k, n): cur += (s[i] in V) - (s[i - k] in V); best = max(best, cur).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Do not recount each window from scratch; that is O(n*k).",
    code: `def maxVowels(s, k):
    vowels = set("aeiou")
    cur = sum(1 for ch in s[:k] if ch in vowels)
    best = cur
    for i in range(k, len(s)):
        cur += (s[i] in vowels) - (s[i - k] in vowels)
        best = max(best, cur)
    return best`
  },
  {
    num: 2379, title: "Minimum Recolors to Get K Consecutive Black Blocks", slug: "minimum-recolors-to-get-k-consecutive-black-blocks", lc: "Easy",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 2,
    order: 410,
    core: false,
    teaches: "Rephrase the goal as a window count: the fewest 'W's in any window of length k.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [1456],
    hints: [
      "To make k consecutive blacks you must recolor every 'W' inside the chosen window.",
      "So the answer is the minimum number of 'W' over all windows of length k: slide and count."
    ],
    steps: [
      "cur = s[:k].count('W'); best = cur.",
      "For i in range(k, n): cur += (blocks[i] == 'W') - (blocks[i - k] == 'W'); best = min(best, cur).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "This is a minimum, so start best at the first window's count, not 0.",
    code: `def minimumRecolors(blocks, k):
    cur = blocks[:k].count("W")
    best = cur
    for i in range(k, len(blocks)):
        cur += (blocks[i] == "W") - (blocks[i - k] == "W")
        best = min(best, cur)
    return best`
  },
  {
    num: 209, title: "Minimum Size Subarray Sum", slug: "minimum-size-subarray-sum", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 2,
    order: 420,
    core: true,
    teaches: "Variable window, 'shortest' template: grow right until valid, then shrink left while still valid.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [643],
    hints: [
      "All numbers are positive, so adding grows the sum and removing shrinks it.",
      "Extend the right end and add to the sum. As soon as sum >= target, the window is valid.",
      "While valid, record its length and drop nums[left] to try a shorter window."
    ],
    steps: [
      "left = 0; total = 0; best = inf.",
      "For right, x in enumerate(nums): total += x.",
      "While total >= target: best = min(best, right - left + 1); total -= nums[left]; left += 1.",
      "Return 0 if best is inf else best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Return 0 when no window reaches the target. (With negative numbers this window trick would not work.)",
    code: `def minSubArrayLen(target, nums):
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:             # valid: try to shrink
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best`
  },
  {
    num: 1208, title: "Get Equal Substrings Within Budget", slug: "get-equal-substrings-within-budget", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 2,
    order: 430,
    core: false,
    teaches: "Variable window, 'longest' template: grow right; if the budget is exceeded, shrink left until it fits.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [209],
    hints: [
      "Each position costs abs(s[i] - t[i]). You want the longest stretch whose total cost <= maxCost.",
      "Grow right, adding its cost. If the total goes over budget, remove costs from the left until it fits.",
      "After each step the window is valid; record its length."
    ],
    steps: [
      "left = cost = best = 0.",
      "For right: cost += abs(ord(s[right]) - ord(t[right])).",
      "While cost > maxCost: cost -= cost at left; left += 1.",
      "best = max(best, right - left + 1). Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Shrink with while, not if; one removal may not be enough.",
    code: `def equalSubstring(s, t, maxCost):
    left = cost = best = 0
    for right in range(len(s)):
        cost += abs(ord(s[right]) - ord(t[right]))
        while cost > maxCost:
            cost -= abs(ord(s[left]) - ord(t[left]))
            left += 1
        best = max(best, right - left + 1)
    return best`
  },
  {
    num: 1004, title: "Max Consecutive Ones III", slug: "max-consecutive-ones-iii", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 2,
    order: 440,
    core: true,
    teaches: "Longest window with at most k 'bad' elements (zeros).",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [485, 1208],
    hints: [
      "Flipping at most k zeros = finding the longest window containing at most k zeros.",
      "Grow right and count zeros. While zeros > k, move left forward (decrease the count if nums[left] was 0)."
    ],
    steps: [
      "left = zeros = best = 0.",
      "For right: if nums[right] == 0: zeros += 1.",
      "While zeros > k: if nums[left] == 0: zeros -= 1; left += 1.",
      "best = max(best, right - left + 1). Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "You do not actually flip anything; just count the zeros in the window.",
    code: `def longestOnes(nums, k):
    left = zeros = best = 0
    for right, x in enumerate(nums):
        if x == 0:
            zeros += 1
        while zeros > k:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`
  },
  {
    num: 1413, title: "Minimum Value to Get Positive Step by Step Sum", slug: "minimum-value-to-get-positive-step-by-step-sum", lc: "Easy",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 2,
    order: 450,
    core: false,
    teaches: "The lowest point of the running sum decides the starting value.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [1732],
    hints: [
      "The step-by-step sum is startValue + prefix sum. It must stay >= 1 at every step.",
      "Find the minimum prefix sum m (over all steps). You need startValue + m >= 1.",
      "So the answer is max(1, 1 - m)."
    ],
    steps: [
      "total = 0; low = 0.",
      "For x in nums: total += x; low = min(low, total).",
      "Return 1 - low (low <= 0, so this is >= 1)."
    ],
    time: "O(n)", space: "O(1)",
    trap: "startValue must be positive itself; starting low at 0 makes the answer at least 1.",
    code: `def minStartValue(nums):
    total = low = 0
    for x in nums:
        total += x
        low = min(low, total)      # lowest running sum
    return 1 - low`
  },
  {
    num: 724, title: "Find Pivot Index", slug: "find-pivot-index", lc: "Easy",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 2,
    order: 460,
    core: true,
    teaches: "Left sum from a running total, right sum = total - left - nums[i].",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [303],
    hints: [
      "For index i you need the sum to the left and the sum to the right.",
      "Compute total once. While scanning, keep leftSum. Then rightSum = total - leftSum - nums[i].",
      "Return the first i where leftSum == rightSum."
    ],
    steps: [
      "total = sum(nums); left = 0.",
      "For i, x: if left == total - left - x: return i; left += x.",
      "Return -1."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Update left AFTER the check; nums[i] belongs to neither side.",
    code: `def pivotIndex(nums):
    total = sum(nums)
    left = 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1`
  },
  {
    num: 1854, title: "Maximum Population Year", slug: "maximum-population-year", lc: "Easy",
    topic: "arrays",
    pattern: "Prefix sums: difference array",
    level: 2,
    order: 470,
    core: true,
    teaches: "Difference array: +1 where a range starts, -1 just after it ends; a running sum gives the value at every point.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [1480],
    hints: [
      "Adding 1 to every year of every life is slow. Mark only the change points.",
      "Person alive from birth to death - 1: do diff[birth] += 1 and diff[death] -= 1.",
      "The running sum of diff over the years is the population in each year; take the earliest maximum."
    ],
    steps: [
      "diff = [0] * 101 (years 1950..2050, offset by 1950).",
      "For b, d in logs: diff[b - 1950] += 1; diff[d - 1950] -= 1.",
      "Scan with a running sum; keep the first year with the largest value.",
      "Return that year."
    ],
    time: "O(n + Y) with Y = 101 years", space: "O(Y)",
    trap: "The death year is NOT counted as alive; the -1 goes at index death, not death + 1.",
    code: `def maximumPopulation(logs):
    diff = [0] * 101
    for b, d in logs:
        diff[b - 1950] += 1
        diff[d - 1950] -= 1        # not alive in the death year
    best_year, best, cur = 1950, 0, 0
    for i in range(101):
        cur += diff[i]
        if cur > best:             # strict: keep the earliest year
            best, best_year = cur, 1950 + i
    return best_year`
  },
  {
    num: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", lc: "Easy",
    topic: "arrays",
    pattern: "Kadane: best run ending here",
    level: 2,
    order: 480,
    core: true,
    teaches: "Keep the best value seen so far (the cheapest buy day) and compare each new day against it.",
    learn: ["dsa_arrays", "dsa-ar-kadane"],
    pre: [53],
    hints: [
      "For each day as the selling day, what is the best day to have bought?",
      "The cheapest price seen so far. Keep a running minimum.",
      "Profit if you sell today = price - minSoFar. Track the maximum."
    ],
    steps: [
      "low = inf; best = 0.",
      "For p in prices: low = min(low, p); best = max(best, p - low).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "You must buy before you sell; using max(prices) - min(prices) ignores the order.",
    code: `def maxProfit(prices):
    low = float("inf")
    best = 0
    for p in prices:
        low = min(low, p)              # cheapest buy so far
        best = max(best, p - low)      # sell today
    return best`
  },
  {
    num: 2606, title: "Find the Substring With Maximum Cost", slug: "find-the-substring-with-maximum-cost", lc: "Medium",
    topic: "arrays",
    pattern: "Kadane: best run ending here",
    level: 2,
    order: 490,
    core: false,
    teaches: "Map each character to a value, then it is Maximum Subarray where the empty substring (cost 0) is allowed.",
    learn: ["dsa_arrays", "dsa-ar-kadane"],
    pre: [53],
    hints: [
      "Turn every character into its value: vals for characters in chars, otherwise its alphabet position.",
      "Now find the maximum subarray sum, but an empty substring is allowed, so the answer is at least 0.",
      "Kadane with cur = max(0, cur + v) handles the empty option."
    ],
    steps: [
      "value = {c: v for c, v in zip(chars, vals)}.",
      "cur = best = 0.",
      "For ch in s: v = value.get(ch, ord(ch) - 96); cur = max(0, cur + v); best = max(best, cur).",
      "Return best."
    ],
    time: "O(n)", space: "O(1) (at most 26 entries)",
    trap: "The empty substring has cost 0, so the answer is never negative.",
    code: `def maximumCostSubstring(s, chars, vals):
    value = dict(zip(chars, vals))
    cur = best = 0
    for ch in s:
        v = value.get(ch, ord(ch) - 96)
        cur = max(0, cur + v)          # empty substring allowed
        best = max(best, cur)
    return best`
  },
  {
    num: 1749, title: "Maximum Absolute Sum of Any Subarray", slug: "maximum-absolute-sum-of-any-subarray", lc: "Medium",
    topic: "arrays",
    pattern: "Kadane: best run ending here",
    level: 2,
    order: 500,
    core: false,
    teaches: "Run Kadane twice: once for the largest sum, once for the smallest; the answer is the bigger absolute value.",
    learn: ["dsa_arrays", "dsa-ar-kadane"],
    pre: [53],
    hints: [
      "The largest absolute sum comes either from the most positive subarray or the most negative one.",
      "Track both in one pass: hi = max(x, hi + x), lo = min(x, lo + x).",
      "Answer = max(best_hi, -best_lo) (the empty subarray gives 0)."
    ],
    steps: [
      "hi = lo = 0; best = 0.",
      "For x: hi = max(0, hi) + x; lo = min(0, lo) + x; best = max(best, hi, -lo).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Do not take abs of each element first; signs matter inside a subarray.",
    code: `def maxAbsoluteSum(nums):
    hi = lo = best = 0
    for x in nums:
        hi = max(hi, 0) + x            # best sum ending here
        lo = min(lo, 0) + x            # worst sum ending here
        best = max(best, hi, -lo)
    return best`
  },
  {
    num: 832, title: "Flipping an Image", slug: "flipping-an-image", lc: "Easy",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 2,
    order: 510,
    core: false,
    teaches: "Row-by-row two pointers: reverse and invert each row in one pass.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [344, 1672],
    hints: [
      "Each row is handled on its own: reverse it, then flip 0 <-> 1.",
      "Use two pointers on each row: swap the ends while inverting both (x ^ 1). If l == r, just invert the middle."
    ],
    steps: [
      "For each row: l, r = 0, n - 1.",
      "While l <= r: row[l], row[r] = row[r] ^ 1, row[l] ^ 1; l += 1; r -= 1.",
      "Return image."
    ],
    time: "O(n^2)", space: "O(1)",
    trap: "When l == r (odd length) the middle element must still be inverted; the l <= r loop does this.",
    code: `def flipAndInvertImage(image):
    for row in image:
        l, r = 0, len(row) - 1
        while l <= r:
            row[l], row[r] = row[r] ^ 1, row[l] ^ 1   # reverse + invert
            l += 1
            r -= 1
    return image`
  },
  {
    num: 566, title: "Reshape the Matrix", slug: "reshape-the-matrix", lc: "Easy",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 2,
    order: 520,
    core: false,
    teaches: "Flattened index k maps to (k // C, k % C); use it to move between shapes.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [867],
    hints: [
      "If R * C != r * c the reshape is impossible: return the original.",
      "Number all cells 0..R*C-1 in row-major order. Cell k of the old matrix is mat[k // C][k % C].",
      "In the new matrix the same k goes to res[k // c][k % c]."
    ],
    steps: [
      "If R * C != r * c: return mat.",
      "res = [[0] * c for _ in range(r)].",
      "For k in range(R * C): res[k // c][k % c] = mat[k // C][k % C].",
      "Return res."
    ],
    time: "O(R*C)", space: "O(R*C) for the output",
    trap: "Divide by the number of COLUMNS of the matrix you are indexing, not by the number of rows.",
    code: `def matrixReshape(mat, r, c):
    R, C = len(mat), len(mat[0])
    if R * C != r * c:
        return mat
    res = [[0] * c for _ in range(r)]
    for k in range(R * C):
        res[k // c][k % c] = mat[k // C][k % C]
    return res`
  },
  {
    num: 2482, title: "Difference Between Ones and Zeros in Row and Column", slug: "difference-between-ones-and-zeros-in-row-and-column", lc: "Medium",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 2,
    order: 530,
    core: false,
    teaches: "Precompute row and column summaries once, then combine them per cell.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [1672],
    hints: [
      "Counting ones in row i and column j for every cell from scratch is O(R*C*(R+C)).",
      "Count ones per row and per column once. Zeros in row i = C - onesRow[i]; zeros in column j = R - onesCol[j].",
      "diff[i][j] = onesRow[i] + onesCol[j] - zerosRow[i] - zerosCol[j] = 2*onesRow[i] + 2*onesCol[j] - R - C."
    ],
    steps: [
      "onesRow[i] = sum(grid[i]); onesCol[j] = sum of column j.",
      "res[i][j] = 2 * onesRow[i] + 2 * onesCol[j] - R - C.",
      "Return res."
    ],
    time: "O(R*C)", space: "O(R + C) extra",
    trap: "Mixing up R and C in the zeros formulas: a row has C cells, a column has R cells.",
    code: `def onesMinusZeros(grid):
    R, C = len(grid), len(grid[0])
    row = [sum(r) for r in grid]
    col = [sum(grid[i][j] for i in range(R)) for j in range(C)]
    return [[2 * row[i] + 2 * col[j] - R - C for j in range(C)] for i in range(R)]`
  },
  {
    num: 541, title: "Reverse String II", slug: "reverse-string-ii", lc: "Easy",
    topic: "arrays",
    pattern: "In-place: reversal tricks",
    level: 2,
    order: 540,
    core: false,
    teaches: "Reversing pieces of an array in place: the two-pointer reverse applied to chunks.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [344],
    hints: [
      "Work in blocks of 2k characters starting at 0, 2k, 4k, ...",
      "In each block reverse the first k characters (or all that remain if fewer than k) with the two-pointer swap.",
      "Strings are immutable in Python: convert to a list first, join at the end."
    ],
    steps: [
      "a = list(s).",
      "For start in range(0, n, 2k): l = start; r = min(start + k, n) - 1; swap inward while l < r.",
      "Return ''.join(a)."
    ],
    time: "O(n)", space: "O(n) for the character list",
    trap: "The last block may have fewer than k characters; clamp r with min(start + k, n) - 1.",
    code: `def reverseStr(s, k):
    a = list(s)
    for start in range(0, len(a), 2 * k):
        l, r = start, min(start + k, len(a)) - 1   # first k of this block
        while l < r:
            a[l], a[r] = a[r], a[l]
            l += 1
            r -= 1
    return "".join(a)`
  },
  {
    num: 151, title: "Reverse Words in a String", slug: "reverse-words-in-a-string", lc: "Medium",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 3,
    order: 550,
    core: true,
    teaches: "Clean messy spacing with split(), then reverse the word list.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [557],
    hints: [
      "There may be leading, trailing and repeated spaces. s.split() with no argument drops all of them.",
      "Once you have a clean list of words, reverse its order and join with single spaces.",
      "Follow-up without split: reverse the whole string, then reverse each word (like Rotate Array)."
    ],
    steps: [
      "words = s.split().",
      "Reverse the list with two pointers (or words[::-1]).",
      "Return ' '.join(words)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "s.split(' ') keeps empty strings for repeated spaces; use s.split().",
    code: `def reverseWords(s):
    words = s.split()              # no argument: drops extra spaces
    l, r = 0, len(words) - 1
    while l < r:
        words[l], words[r] = words[r], words[l]
        l += 1
        r -= 1
    return " ".join(words)`
  },
  {
    num: 165, title: "Compare Version Numbers", slug: "compare-version-numbers", lc: "Medium",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 3,
    order: 560,
    core: false,
    teaches: "Parse a string into parts, then compare part by part, padding the shorter one with zeros.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [14],
    hints: [
      "Split each version on '.', and turn each part into an int (this drops leading zeros).",
      "Compare the parts in order. If one version has fewer parts, treat its missing parts as 0."
    ],
    steps: [
      "a = list(map(int, v1.split('.'))); b = same for v2.",
      "For i in range(max(len(a), len(b))): x = a[i] if i < len(a) else 0; y likewise.",
      "If x < y return -1; if x > y return 1.",
      "Return 0."
    ],
    time: "O(n + m)", space: "O(n + m)",
    trap: "'1.0' and '1' are equal; a missing part counts as 0.",
    code: `def compareVersion(version1, version2):
    a = [int(p) for p in version1.split(".")]
    b = [int(p) for p in version2.split(".")]
    for i in range(max(len(a), len(b))):
        x = a[i] if i < len(a) else 0
        y = b[i] if i < len(b) else 0
        if x != y:
            return -1 if x < y else 1
    return 0`
  },
  {
    num: 6, title: "Zigzag Conversion", slug: "zigzag-conversion", lc: "Medium",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 3,
    order: 570,
    core: false,
    teaches: "Simulation: walk a row index up and down, appending each character to its row.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [1108],
    hints: [
      "Instead of computing positions, simulate writing: keep one string builder per row.",
      "Move the row index down 0,1,...,numRows-1, then back up, bouncing at both ends.",
      "Join the rows in order at the end. With numRows == 1 return s unchanged."
    ],
    steps: [
      "If numRows == 1: return s.",
      "rows = [[] for _ in range(numRows)]; r = 0; step = 1.",
      "For ch in s: rows[r].append(ch); if r == 0: step = 1; elif r == numRows - 1: step = -1; r += step.",
      "Return ''.join(''.join(row) for row in rows)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "numRows == 1 makes the bounce logic step out of range; handle it first.",
    code: `def convert(s, numRows):
    if numRows == 1:
        return s
    rows = [[] for _ in range(numRows)]
    r, step = 0, 1
    for ch in s:
        rows[r].append(ch)
        if r == 0:
            step = 1                   # bounce off the top
        elif r == numRows - 1:
            step = -1                  # bounce off the bottom
        r += step
    return "".join("".join(row) for row in rows)`
  },
  {
    num: 38, title: "Count and Say", slug: "count-and-say", lc: "Medium",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 3,
    order: 580,
    core: false,
    teaches: "Run-length encoding: group equal neighbours and write count + digit.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [228],
    hints: [
      "Each term describes the previous one: '1211' reads as one 1, one 2, two 1s -> '111221'.",
      "Write a helper that scans a string and groups runs of equal characters.",
      "Apply it n - 1 times starting from '1'."
    ],
    steps: [
      "s = '1'.",
      "Repeat n - 1 times: walk s with i; let j advance while s[j] == s[i]; append str(j - i) + s[i]; i = j.",
      "Return s."
    ],
    time: "O(n * L) where L is the term length", space: "O(L)",
    trap: "Do not forget to write out the final run after the loop ends.",
    code: `def countAndSay(n):
    s = "1"
    for _ in range(n - 1):
        out = []
        i = 0
        while i < len(s):
            j = i
            while j < len(s) and s[j] == s[i]:
                j += 1
            out.append(str(j - i) + s[i])   # count, then digit
            i = j
        s = "".join(out)
    return s`
  },
  {
    num: 11, title: "Container With Most Water", slug: "container-with-most-water", lc: "Medium",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 3,
    order: 590,
    core: true,
    teaches: "Moving the taller wall can never help, so always move the shorter one.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [167],
    hints: [
      "Start with the widest container: l = 0, r = n - 1. Water = min(height[l], height[r]) * (r - l).",
      "Every step the width shrinks by one. Which wall is limiting the water?",
      "Moving the taller wall keeps the same (or lower) limit with less width, so it never helps. Move the shorter wall."
    ],
    steps: [
      "l, r = 0, n - 1; best = 0.",
      "While l < r: best = max(best, min(h[l], h[r]) * (r - l)); if h[l] < h[r]: l += 1 else r -= 1.",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "This is not about sorted input; the pointer rule comes from the 'shorter wall limits' argument.",
    code: `def maxArea(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1                     # the shorter wall limits us: drop it
        else:
            r -= 1
    return best`
  },
  {
    num: 15, title: "3Sum", slug: "3sum", lc: "Medium",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 3,
    order: 600,
    core: true,
    teaches: "Fix one number, then run Two Sum II on the rest of the sorted array; skip duplicates.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [167],
    hints: [
      "Sort the array. If you fix nums[i] as the first number, you need two numbers to its right summing to -nums[i].",
      "That inner search is exactly Two Sum II with two pointers.",
      "To avoid repeated triplets, skip i when nums[i] == nums[i-1], and after a match skip equal values for l."
    ],
    steps: [
      "Sort nums.",
      "For i in range(n - 2): skip if i > 0 and nums[i] == nums[i-1]; break if nums[i] > 0.",
      "l, r = i + 1, n - 1; while l < r: s = nums[i] + nums[l] + nums[r]; move l up if s < 0, r down if s > 0.",
      "On s == 0: record, move both, then skip duplicate nums[l]."
    ],
    time: "O(n^2)", space: "O(1) extra (besides output and sort)",
    trap: "[0, 0, 0, 0] must give [[0, 0, 0]] once; both duplicate-skip rules are needed.",
    code: `def threeSum(nums):
    nums.sort()
    res = []
    n = len(nums)
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                   # same first number again
        if nums[i] > 0:
            break                      # all remaining are positive
        l, r = i + 1, n - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1             # skip repeated second numbers
    return res`
  },
  {
    num: 680, title: "Valid Palindrome II", slug: "valid-palindrome-ii", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 3,
    order: 610,
    core: false,
    teaches: "On the first mismatch you get one deletion: try skipping the left char or the right char.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [125],
    hints: [
      "Compare from both ends as in Valid Palindrome until the first mismatch.",
      "At a mismatch you may delete one character: either s[l] or s[r].",
      "Check whether s[l+1..r] or s[l..r-1] is a palindrome (plain check, no more deletions)."
    ],
    steps: [
      "Helper pal(i, j) checks s[i..j] with two pointers.",
      "l, r = 0, n - 1; while l < r: if s[l] != s[r]: return pal(l + 1, r) or pal(l, r - 1); l += 1; r -= 1.",
      "Return True."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Try both deletions; always skipping the left (or always the right) character fails when the extra character is on the other side.",
    code: `def validPalindrome(s):
    def pal(i, j):
        while i < j:
            if s[i] != s[j]:
                return False
            i += 1
            j -= 1
        return True

    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return pal(l + 1, r) or pal(l, r - 1)   # delete one side
        l += 1
        r -= 1
    return True`
  },
  {
    num: 16, title: "3Sum Closest", slug: "3sum-closest", lc: "Medium",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 3,
    order: 620,
    core: false,
    teaches: "3Sum's loop, but track the sum closest to target instead of exact zeros.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [15],
    hints: [
      "Sort and fix nums[i]; use two pointers on the rest just like 3Sum.",
      "At each step compare abs(s - target) with the best so far.",
      "If s < target move l up, if s > target move r down, if equal you can return immediately."
    ],
    steps: [
      "Sort; best = sum of first three.",
      "For i: l, r = i + 1, n - 1; while l < r: s = nums[i] + nums[l] + nums[r]; update best if closer.",
      "If s < target: l += 1; elif s > target: r -= 1; else return s.",
      "Return best."
    ],
    time: "O(n^2)", space: "O(1) extra",
    trap: "Initialise best with a real triple sum, not 0 or infinity, so the return is always a valid sum.",
    code: `def threeSumClosest(nums, target):
    nums.sort()
    n = len(nums)
    best = nums[0] + nums[1] + nums[2]
    for i in range(n - 2):
        l, r = i + 1, n - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if abs(s - target) < abs(best - target):
                best = s
            if s < target:
                l += 1
            elif s > target:
                r -= 1
            else:
                return s
    return best`
  },
  {
    num: 80, title: "Remove Duplicates from Sorted Array II", slug: "remove-duplicates-from-sorted-array-ii", lc: "Medium",
    topic: "arrays",
    pattern: "Two pointers: reader/writer",
    level: 3,
    order: 630,
    core: false,
    teaches: "Allow at most two copies: compare with the value two places behind the writer.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [26],
    hints: [
      "Remove Duplicates compares with nums[k - 1]. Here each value may appear twice.",
      "A value is safe to write if nums[i] != nums[k - 2]: then the last two written values are not both equal to it."
    ],
    steps: [
      "k = 0.",
      "For x in nums: if k < 2 or x != nums[k - 2]: nums[k] = x; k += 1.",
      "Return k."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Compare with the written array nums[k-2], not the original nums[i-2], which may have been overwritten.",
    code: `def removeDuplicates(nums):
    k = 0
    for x in nums:
        if k < 2 or x != nums[k - 2]:   # at most two copies
            nums[k] = x
            k += 1
    return k`
  },
  {
    num: 443, title: "String Compression", slug: "string-compression", lc: "Medium",
    topic: "arrays",
    pattern: "Two pointers: reader/writer",
    level: 3,
    order: 640,
    core: false,
    teaches: "Reader finds a run, writer writes the character and its count digits into the same array.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [26, 38],
    hints: [
      "Use i to read a run of equal characters and k to write the compressed form.",
      "For each run write the character, then (only if the run length > 1) each digit of the length.",
      "The writer never overtakes the reader, so writing in place is safe."
    ],
    steps: [
      "i = k = 0.",
      "While i < n: j = i; while j < n and chars[j] == chars[i]: j += 1.",
      "chars[k] = chars[i]; k += 1; if j - i > 1: for d in str(j - i): chars[k] = d; k += 1.",
      "i = j. Return k."
    ],
    time: "O(n)", space: "O(1)",
    trap: "A count like 12 is written as two characters '1', '2'; and a run of length 1 gets no number.",
    code: `def compress(chars):
    n = len(chars)
    i = k = 0
    while i < n:
        j = i
        while j < n and chars[j] == chars[i]:
            j += 1
        chars[k] = chars[i]
        k += 1
        if j - i > 1:
            for d in str(j - i):
                chars[k] = d
                k += 1
        i = j
    return k`
  },
  {
    num: 1089, title: "Duplicate Zeros", slug: "duplicate-zeros", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: reader/writer",
    level: 3,
    order: 650,
    core: false,
    teaches: "Writing from the back: count how far each element shifts, then copy right-to-left so nothing is overwritten early.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [88],
    hints: [
      "Copying left to right overwrites values you still need. Work from the right instead.",
      "Count zeros: element i moves to i + (zeros before or at i). Walk i from the end with a write index j = n + zeros - 1.",
      "When j < n write nums[i] there; if nums[i] is 0, write it twice (j and j - 1)."
    ],
    steps: [
      "zeros = nums.count(0); j = n + zeros - 1.",
      "For i from n - 1 down to 0: if j < n: nums[j] = nums[i]. If nums[i] == 0: j -= 1; if j < n: nums[j] = 0. Then j -= 1."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Elements shifted past the end are dropped; only write when j < n.",
    code: `def duplicateZeros(arr):
    n = len(arr)
    zeros = arr.count(0)
    j = n + zeros - 1                  # position in the imaginary longer array
    for i in range(n - 1, -1, -1):
        if j < n:
            arr[j] = arr[i]
        if arr[i] == 0:
            j -= 1
            if j < n:
                arr[j] = 0             # the duplicate zero
        j -= 1`
  },
  {
    num: 844, title: "Backspace String Compare", slug: "backspace-string-compare", lc: "Easy",
    topic: "arrays",
    pattern: "Two pointers: two sequences",
    level: 3,
    order: 660,
    core: false,
    teaches: "Walk both strings from the end, skipping characters erased by '#', and compare as you go.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [925],
    hints: [
      "Building the final strings with a stack is O(n) space. Can you compare without building them?",
      "From the right, a '#' means 'skip one more real character'. Keep a skip counter for each string.",
      "Find the next surviving character in each string, compare, step both left."
    ],
    steps: [
      "i, j = len(s) - 1, len(t) - 1.",
      "Loop: move i left past erased characters (skip counter); same for j.",
      "If both i, j < 0 return True; if only one < 0 or s[i] != t[j] return False; i -= 1; j -= 1."
    ],
    time: "O(n + m)", space: "O(1)",
    trap: "A '#' on an empty string does nothing; the skip counter handles that naturally.",
    code: `def backspaceCompare(s, t):
    def next_char(x, i):
        skip = 0
        while i >= 0:
            if x[i] == "#":
                skip += 1
            elif skip:
                skip -= 1
            else:
                break
            i -= 1
        return i                       # index of next surviving char, or -1

    i, j = len(s) - 1, len(t) - 1
    while True:
        i, j = next_char(s, i), next_char(t, j)
        if i < 0 and j < 0:
            return True
        if i < 0 or j < 0 or s[i] != t[j]:
            return False
        i -= 1
        j -= 1`
  },
  {
    num: 2090, title: "K Radius Subarray Averages", slug: "k-radius-subarray-averages", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 3,
    order: 670,
    core: false,
    teaches: "Fixed window centred on i: the window is i-k..i+k, size 2k+1, and its answer is written at the centre.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [643],
    hints: [
      "The window for index i covers i - k .. i + k, so its size is 2k + 1.",
      "Slide a window of size 2k + 1 as usual; when the window ends at index r, its centre is r - k.",
      "Positions without a full window keep -1. Use integer division."
    ],
    steps: [
      "res = [-1] * n; size = 2k + 1; if size > n return res.",
      "window = 0; for r in range(n): window += nums[r]; if r >= size: window -= nums[r - size]; if r >= size - 1: res[r - k] = window // size.",
      "Return res."
    ],
    time: "O(n)", space: "O(n) for the output",
    trap: "When 2k + 1 > n there is no valid window at all; every answer stays -1.",
    code: `def getAverages(nums, k):
    n = len(nums)
    size = 2 * k + 1
    res = [-1] * n
    window = 0
    for r in range(n):
        window += nums[r]
        if r >= size:
            window -= nums[r - size]
        if r >= size - 1:
            res[r - k] = window // size    # centre of the window
    return res`
  },
  {
    num: 567, title: "Permutation in String", slug: "permutation-in-string", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 3,
    order: 680,
    core: true,
    teaches: "Fixed window of length len(s1) whose letter counts must equal s1's counts.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [1456],
    hints: [
      "A permutation of s1 is any string with exactly the same letter counts.",
      "So slide a window of length len(s1) over s2 and compare letter counts.",
      "Keep a 26-slot count for the window, updating one letter in and one out per step; compare with s1's counts."
    ],
    steps: [
      "If len(s1) > len(s2) return False.",
      "need = counts of s1; have = counts of s2[:m].",
      "If have == need return True. For i in range(m, n): add s2[i], remove s2[i - m]; if have == need return True.",
      "Return False."
    ],
    time: "O(26 * n) = O(n)", space: "O(1)",
    trap: "Comparing two 26-length arrays per step is fine (constant); sorting each window would be much slower.",
    code: `def checkInclusion(s1, s2):
    m, n = len(s1), len(s2)
    if m > n:
        return False
    need = [0] * 26
    have = [0] * 26
    for i in range(m):
        need[ord(s1[i]) - 97] += 1
        have[ord(s2[i]) - 97] += 1
    if have == need:
        return True
    for i in range(m, n):
        have[ord(s2[i]) - 97] += 1         # enters
        have[ord(s2[i - m]) - 97] -= 1     # leaves
        if have == need:
            return True
    return False`
  },
  {
    num: 438, title: "Find All Anagrams in a String", slug: "find-all-anagrams-in-a-string", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 3,
    order: 690,
    core: true,
    teaches: "Same window as Permutation in String, but collect every start index instead of stopping.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [567],
    hints: [
      "This is Permutation in String, but you record every window that matches.",
      "When the window ends at index i, its start is i - len(p) + 1."
    ],
    steps: [
      "If len(p) > len(s) return [].",
      "need = counts of p; have = counts of s[:m]; res = [0] if equal.",
      "For i in range(m, n): add s[i], remove s[i - m]; if have == need: res.append(i - m + 1).",
      "Return res."
    ],
    time: "O(n)", space: "O(1)",
    trap: "The start index of the window ending at i is i - m + 1, not i - m.",
    code: `def findAnagrams(s, p):
    m, n = len(p), len(s)
    if m > n:
        return []
    need = [0] * 26
    have = [0] * 26
    for i in range(m):
        need[ord(p[i]) - 97] += 1
        have[ord(s[i]) - 97] += 1
    res = [0] if have == need else []
    for i in range(m, n):
        have[ord(s[i]) - 97] += 1
        have[ord(s[i - m]) - 97] -= 1
        if have == need:
            res.append(i - m + 1)
    return res`
  },
  {
    num: 1423, title: "Maximum Points You Can Obtain from Cards", slug: "maximum-points-you-can-obtain-from-cards", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 3,
    order: 700,
    core: false,
    teaches: "Flip the view: taking k cards from the ends = leaving a window of n - k cards in the middle with the smallest sum.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [643],
    hints: [
      "You take some cards from the left and the rest from the right. What is left over?",
      "The cards you do NOT take form one contiguous block of length n - k.",
      "Maximise what you take = total - (minimum sum of a window of length n - k)."
    ],
    steps: [
      "total = sum(cardPoints); w = n - k.",
      "If w == 0 return total.",
      "window = sum(cardPoints[:w]); low = window; slide: window += c[i] - c[i - w]; low = min(low, window).",
      "Return total - low."
    ],
    time: "O(n)", space: "O(1)",
    trap: "When k == n the middle window is empty; return the total directly.",
    code: `def maxScore(cardPoints, k):
    n = len(cardPoints)
    total = sum(cardPoints)
    w = n - k                          # cards left in the middle
    if w == 0:
        return total
    window = sum(cardPoints[:w])
    low = window
    for i in range(w, n):
        window += cardPoints[i] - cardPoints[i - w]
        low = min(low, window)
    return total - low`
  },
  {
    num: 1052, title: "Grumpy Bookstore Owner", slug: "grumpy-bookstore-owner", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 3,
    order: 710,
    core: false,
    teaches: "Split the answer into a fixed base plus the best extra gain from one fixed window.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [643],
    hints: [
      "Customers in non-grumpy minutes are satisfied no matter what. Add them up first.",
      "The technique only changes grumpy minutes inside a window of length `minutes`.",
      "Slide that window and track the maximum sum of customers[i] where grumpy[i] == 1."
    ],
    steps: [
      "base = sum(c for c, g in zip(customers, grumpy) if g == 0).",
      "extra = sum of customers[i] * grumpy[i] for i < minutes; best = extra.",
      "For i in range(minutes, n): extra += customers[i]*grumpy[i] - customers[i-minutes]*grumpy[i-minutes]; best = max(best, extra).",
      "Return base + best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Do not count non-grumpy customers inside the window twice: the window only adds grumpy minutes.",
    code: `def maxSatisfied(customers, grumpy, minutes):
    n = len(customers)
    base = sum(c for c, g in zip(customers, grumpy) if g == 0)
    extra = sum(customers[i] * grumpy[i] for i in range(minutes))
    best = extra
    for i in range(minutes, n):
        extra += customers[i] * grumpy[i] - customers[i - minutes] * grumpy[i - minutes]
        best = max(best, extra)
    return base + best`
  },
  {
    num: 1493, title: "Longest Subarray of 1's After Deleting One Element", slug: "longest-subarray-of-1s-after-deleting-one-element", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 3,
    order: 720,
    core: false,
    teaches: "Max Consecutive Ones III with k = 1, but the deleted element is not counted in the length.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [1004],
    hints: [
      "Allow at most one zero in the window (that is the element you delete).",
      "The answer is the window length minus one, because one element must be deleted, even if it is a 1."
    ],
    steps: [
      "left = zeros = best = 0.",
      "For right: count zeros; while zeros > 1: shrink from the left.",
      "best = max(best, right - left). (right - left + 1 minus the deleted element.)",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "All ones [1, 1, 1] gives 2, not 3: you must delete one element.",
    code: `def longestSubarray(nums):
    left = zeros = best = 0
    for right, x in enumerate(nums):
        if x == 0:
            zeros += 1
        while zeros > 1:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left)     # window size - 1 deleted element
    return best`
  },
  {
    num: 3, title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 3,
    order: 730,
    core: true,
    teaches: "Longest window with no repeated character; a dict of last positions lets left jump in one step.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [1208],
    hints: [
      "Grow the window to the right. A repeat inside the window makes it invalid.",
      "Remember the last index of each character. On a repeat, move left to just past the earlier copy.",
      "Only jump if that earlier copy is inside the current window (last[ch] >= left)."
    ],
    steps: [
      "last = {}; left = best = 0.",
      "For right, ch in enumerate(s): if ch in last and last[ch] >= left: left = last[ch] + 1.",
      "last[ch] = right; best = max(best, right - left + 1).",
      "Return best."
    ],
    time: "O(n)", space: "O(k) for k distinct characters",
    trap: "'abba': without the last[ch] >= left check, left jumps backwards and the answer becomes wrong.",
    code: `def lengthOfLongestSubstring(s):
    last = {}                          # char -> last index seen
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1        # jump past the earlier copy
        last[ch] = right
        best = max(best, right - left + 1)
    return best`
  },
  {
    num: 904, title: "Fruit Into Baskets", slug: "fruit-into-baskets", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 3,
    order: 740,
    core: false,
    teaches: "Longest window with at most 2 distinct values: count values in a dict, shrink when it has 3 keys.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [1004],
    hints: [
      "Strip away the story: find the longest subarray with at most 2 distinct values.",
      "Keep a count dict for the window. When it has more than 2 keys, shrink from the left, deleting keys whose count drops to 0."
    ],
    steps: [
      "count = {}; left = best = 0.",
      "For right: count[f] += 1.",
      "While len(count) > 2: count[fruits[left]] -= 1; delete it if 0; left += 1.",
      "best = max(best, right - left + 1). Return best."
    ],
    time: "O(n)", space: "O(1) (at most 3 keys)",
    trap: "Delete keys that reach 0, or len(count) never shrinks.",
    code: `def totalFruit(fruits):
    count = {}
    left = best = 0
    for right, f in enumerate(fruits):
        count[f] = count.get(f, 0) + 1
        while len(count) > 2:
            g = fruits[left]
            count[g] -= 1
            if count[g] == 0:
                del count[g]
            left += 1
        best = max(best, right - left + 1)
    return best`
  },
  {
    num: 1695, title: "Maximum Erasure Value", slug: "maximum-erasure-value", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 3,
    order: 750,
    core: false,
    teaches: "Longest-unique window, but maximise the sum instead of the length.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [3],
    hints: [
      "This is Longest Substring Without Repeating Characters with numbers, scoring by sum.",
      "Keep a set of values in the window and the window sum. On a repeat, remove from the left until the repeat is gone."
    ],
    steps: [
      "seen = set(); left = total = best = 0.",
      "For x in nums: while x in seen: remove nums[left] from seen and total; left += 1.",
      "Add x to seen and total; best = max(best, total).",
      "Return best."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Remove values one by one until the duplicate is gone; you cannot jump without also fixing the sum.",
    code: `def maximumUniqueSubarray(nums):
    seen = set()
    left = total = best = 0
    for x in nums:
        while x in seen:
            seen.remove(nums[left])
            total -= nums[left]
            left += 1
        seen.add(x)
        total += x
        best = max(best, total)
    return best`
  },
  {
    num: 713, title: "Subarray Product Less Than K", slug: "subarray-product-less-than-k", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 3,
    order: 760,
    core: false,
    teaches: "Counting windows: each valid window ending at right adds right - left + 1 subarrays.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [209],
    hints: [
      "All numbers are positive, so a product only grows as the window grows.",
      "For each right end, shrink left until the product < k. Then every subarray ending at right and starting in left..right is valid.",
      "That is right - left + 1 new subarrays. If k <= 1 nothing can be valid."
    ],
    steps: [
      "If k <= 1 return 0.",
      "prod = 1; left = count = 0.",
      "For right: prod *= nums[right]; while prod >= k: prod //= nums[left]; left += 1.",
      "count += right - left + 1. Return count."
    ],
    time: "O(n)", space: "O(1)",
    trap: "k <= 1: the shrink loop would run past right; return 0 up front.",
    code: `def numSubarrayProductLessThanK(nums, k):
    if k <= 1:
        return 0
    prod = 1
    left = count = 0
    for right, x in enumerate(nums):
        prod *= x
        while prod >= k:
            prod //= nums[left]
            left += 1
        count += right - left + 1      # subarrays ending at right
    return count`
  },
  {
    num: 2024, title: "Maximize the Confusion of an Exam", slug: "maximize-the-confusion-of-an-exam", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 3,
    order: 770,
    core: false,
    teaches: "Run the same 'at most k bad' window twice, once per target letter.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [1004],
    hints: [
      "Making all 'T' means flipping the 'F's in the window: longest window with at most k 'F'.",
      "Do the same for all 'F' (at most k 'T'), and return the better of the two."
    ],
    steps: [
      "Helper longest(bad): left = cnt = best = 0; for right: cnt += answerKey[right] == bad; while cnt > k: shrink.",
      "Return max(longest('F'), longest('T'))."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Check both letters; the best answer may come from either.",
    code: `def maxConsecutiveAnswers(answerKey, k):
    def longest(bad):
        left = cnt = best = 0
        for right, ch in enumerate(answerKey):
            cnt += ch == bad
            while cnt > k:
                cnt -= answerKey[left] == bad
                left += 1
            best = max(best, right - left + 1)
        return best

    return max(longest("F"), longest("T"))`
  },
  {
    num: 238, title: "Product of Array Except Self", slug: "product-of-array-except-self", lc: "Medium",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 3,
    order: 780,
    core: true,
    teaches: "Prefix and suffix products: answer[i] = (product of everything left of i) * (product of everything right of i).",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [724],
    hints: [
      "Division is not allowed (and zeros would break it anyway).",
      "answer[i] = product of nums[0..i-1] times product of nums[i+1..n-1]. Both are running products.",
      "First pass left-to-right writes the left products into res; second pass right-to-left multiplies in a running right product."
    ],
    steps: [
      "res = [1] * n; left = 1; for i in 0..n-1: res[i] = left; left *= nums[i].",
      "right = 1; for i from n-1 down to 0: res[i] *= right; right *= nums[i].",
      "Return res."
    ],
    time: "O(n)", space: "O(1) extra (the output does not count)",
    trap: "Write the running product BEFORE multiplying nums[i] in, so nums[i] itself is excluded.",
    code: `def productExceptSelf(nums):
    n = len(nums)
    res = [1] * n
    left = 1
    for i in range(n):
        res[i] = left              # product of everything left of i
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        res[i] *= right            # times everything right of i
        right *= nums[i]
    return res`
  },
  {
    num: 304, title: "Range Sum Query 2D - Immutable", slug: "range-sum-query-2d-immutable", lc: "Medium",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 3,
    order: 790,
    core: false,
    teaches: "2D prefix sums: pre[r][c] = sum of the rectangle above-left; any rectangle is four lookups (inclusion-exclusion).",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [303],
    hints: [
      "Extend the 1D idea: pre[i+1][j+1] = sum of matrix[0..i][0..j]. Add a zero row and a zero column.",
      "Build: pre[i+1][j+1] = matrix[i][j] + pre[i][j+1] + pre[i+1][j] - pre[i][j] (the overlap was added twice).",
      "Query (r1,c1)-(r2,c2) = pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]."
    ],
    steps: [
      "Build pre of size (R+1) x (C+1) with the formula above.",
      "sumRegion: return the four-term combination."
    ],
    time: "O(R*C) build, O(1) per query", space: "O(R*C)",
    trap: "Add back pre[r1][c1]: it was subtracted twice.",
    code: `class NumMatrix:
    def __init__(self, matrix):
        R, C = len(matrix), len(matrix[0])
        self.pre = [[0] * (C + 1) for _ in range(R + 1)]
        for i in range(R):
            for j in range(C):
                self.pre[i + 1][j + 1] = (matrix[i][j] + self.pre[i][j + 1]
                                          + self.pre[i + 1][j] - self.pre[i][j])

    def sumRegion(self, row1, col1, row2, col2):
        p = self.pre
        return (p[row2 + 1][col2 + 1] - p[row1][col2 + 1]
                - p[row2 + 1][col1] + p[row1][col1])`
  },
  {
    num: 2483, title: "Minimum Penalty for a Shop", slug: "minimum-penalty-for-a-shop", lc: "Medium",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 3,
    order: 800,
    core: false,
    teaches: "Sweep the split point: moving the closing hour one step changes the penalty by +1 or -1.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [724],
    hints: [
      "Closing at hour j costs (number of 'N' before j) + (number of 'Y' from j on).",
      "Start with j = 0: penalty = count of 'Y'. Moving j past an hour: a 'Y' there now counts as served (-1), an 'N' now counts as open-with-no-customer (+1).",
      "Track the smallest penalty and the earliest j that reaches it."
    ],
    steps: [
      "pen = customers.count('Y'); best = pen; ans = 0.",
      "For j, ch in enumerate(customers): pen += -1 if ch == 'Y' else 1; if pen < best: best = pen; ans = j + 1.",
      "Return ans."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Use < not <= so the earliest hour wins ties; and closing at hour n (never closing) is allowed.",
    code: `def bestClosingTime(customers):
    pen = customers.count("Y")         # close at hour 0
    best, ans = pen, 0
    for j, ch in enumerate(customers):
        pen += -1 if ch == "Y" else 1  # now close at hour j + 1
        if pen < best:
            best, ans = pen, j + 1
    return ans`
  },
  {
    num: 1109, title: "Corporate Flight Bookings", slug: "corporate-flight-bookings", lc: "Medium",
    topic: "arrays",
    pattern: "Prefix sums: difference array",
    level: 3,
    order: 810,
    core: true,
    teaches: "Range updates in O(1) each with a difference array, then one prefix-sum pass.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [1854],
    hints: [
      "Each booking adds seats to every flight from first to last. Doing that loop is O(n) per booking.",
      "Instead: diff[first - 1] += seats and diff[last] -= seats (flights are 1-indexed).",
      "The prefix sum of diff gives the total for every flight."
    ],
    steps: [
      "diff = [0] * (n + 1).",
      "For first, last, s in bookings: diff[first - 1] += s; diff[last] -= s.",
      "Running sum over diff[:n] gives the answer."
    ],
    time: "O(n + b)", space: "O(n)",
    trap: "Make diff one longer (n + 1) so diff[last] is valid when last == n.",
    code: `def corpFlightBookings(bookings, n):
    diff = [0] * (n + 1)
    for first, last, seats in bookings:
        diff[first - 1] += seats
        diff[last] -= seats
    res = []
    cur = 0
    for i in range(n):
        cur += diff[i]
        res.append(cur)
    return res`
  },
  {
    num: 2381, title: "Shifting Letters II", slug: "shifting-letters-ii", lc: "Medium",
    topic: "arrays",
    pattern: "Prefix sums: difference array",
    level: 3,
    order: 820,
    core: false,
    teaches: "Difference array of shift amounts, then apply each net shift modulo 26.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [1109],
    hints: [
      "Each query shifts a range forward (+1) or backward (-1). Record it as a range update.",
      "diff[start] += d and diff[end + 1] -= d where d is +1 or -1.",
      "Prefix-sum diff to get the net shift of each character; apply (c + shift) mod 26."
    ],
    steps: [
      "diff = [0] * (n + 1).",
      "For start, end, direction: d = 1 if direction else -1; diff[start] += d; diff[end + 1] -= d.",
      "cur = 0; for i: cur += diff[i]; out.append(chr((ord(s[i]) - 97 + cur) % 26 + 97)).",
      "Return ''.join(out)."
    ],
    time: "O(n + q)", space: "O(n)",
    trap: "Python's % handles negative shifts correctly; in other languages add 26 first.",
    code: `def shiftingLetters(s, shifts):
    n = len(s)
    diff = [0] * (n + 1)
    for start, end, direction in shifts:
        d = 1 if direction == 1 else -1
        diff[start] += d
        diff[end + 1] -= d
    out = []
    cur = 0
    for i in range(n):
        cur += diff[i]
        out.append(chr((ord(s[i]) - 97 + cur) % 26 + 97))
    return "".join(out)`
  },
  {
    num: 152, title: "Maximum Product Subarray", slug: "maximum-product-subarray", lc: "Medium",
    topic: "arrays",
    pattern: "Kadane: best run ending here",
    level: 3,
    order: 830,
    core: true,
    teaches: "Kadane for products: track both the max and the min ending here, because a negative number swaps them.",
    learn: ["dsa_arrays", "dsa-ar-kadane"],
    pre: [53],
    hints: [
      "With sums, the best run ending here only needs the previous best. With products, a big negative times a negative becomes big positive.",
      "Keep hi and lo = the largest and smallest product of a subarray ending at i - 1.",
      "New hi = max(x, hi*x, lo*x); new lo = min(x, hi*x, lo*x). Compute both from the OLD values."
    ],
    steps: [
      "hi = lo = best = nums[0].",
      "For x in nums[1:]: candidates = (x, hi*x, lo*x); hi, lo = max(candidates), min(candidates); best = max(best, hi).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Update hi and lo at the same time (tuple assignment); updating hi first corrupts lo's calculation.",
    code: `def maxProduct(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        cand = (x, hi * x, lo * x)
        hi, lo = max(cand), min(cand)  # a negative x swaps roles
        best = max(best, hi)
    return best`
  },
  {
    num: 48, title: "Rotate Image", slug: "rotate-image", lc: "Medium",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 3,
    order: 840,
    core: true,
    teaches: "Rotate 90 degrees clockwise in place = transpose, then reverse each row.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [867, 344],
    hints: [
      "Look at where the first row goes after a clockwise rotation: it becomes the last column.",
      "Transposing turns the first row into the first column. Reversing each row then moves it to the last column.",
      "Transpose in place by swapping matrix[i][j] with matrix[j][i] for j > i only."
    ],
    steps: [
      "For i in range(n): for j in range(i + 1, n): swap matrix[i][j], matrix[j][i].",
      "For each row: row.reverse()."
    ],
    time: "O(n^2)", space: "O(1)",
    trap: "In the in-place transpose, loop j from i + 1; looping over all j swaps every pair twice and undoes the work.",
    code: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):          # transpose (upper triangle only)
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()                      # then mirror left-right`
  },
  {
    num: 54, title: "Spiral Matrix", slug: "spiral-matrix", lc: "Medium",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 3,
    order: 850,
    core: true,
    teaches: "Spiral order with four shrinking boundaries: top, bottom, left, right.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [1672],
    hints: [
      "Keep four walls: top, bottom, left, right. Walk the outer ring, then move the walls inward.",
      "One ring: left->right along top (then top += 1), top->bottom along right (right -= 1), right->left along bottom (bottom -= 1), bottom->top along left (left += 1).",
      "Before the bottom and left passes, re-check top <= bottom and left <= right, or a single row/column is read twice."
    ],
    steps: [
      "top, bottom, left, right = 0, R - 1, 0, C - 1; res = [].",
      "While top <= bottom and left <= right: do the four passes, shrinking the matching wall after each.",
      "Guard the bottom pass with top <= bottom and the left pass with left <= right."
    ],
    time: "O(R*C)", space: "O(1) extra",
    trap: "Missing the two guards duplicates cells in matrices like [[1, 2, 3]] or a single column.",
    code: `def spiralOrder(matrix):
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            res.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1):
            res.append(matrix[i][right])
        right -= 1
        if top <= bottom:
            for j in range(right, left - 1, -1):
                res.append(matrix[bottom][j])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1):
                res.append(matrix[i][left])
            left += 1
    return res`
  },
  {
    num: 59, title: "Spiral Matrix II", slug: "spiral-matrix-ii", lc: "Medium",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 3,
    order: 860,
    core: false,
    teaches: "The same four-boundary spiral, but writing 1..n^2 instead of reading.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [54],
    hints: [
      "Reuse the Spiral Matrix walls, but write a counter into each cell instead of reading it.",
      "Since the matrix is square, the walls meet cleanly; keep the same guards anyway."
    ],
    steps: [
      "res = n x n zeros; val = 1; top, bottom, left, right = 0, n-1, 0, n-1.",
      "While val <= n*n: fill the top row, right column, bottom row, left column, shrinking walls after each.",
      "Return res."
    ],
    time: "O(n^2)", space: "O(1) extra",
    trap: "For n = 1 make sure the loop writes the single cell and stops.",
    code: `def generateMatrix(n):
    res = [[0] * n for _ in range(n)]
    val = 1
    top, bottom, left, right = 0, n - 1, 0, n - 1
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            res[top][j] = val; val += 1
        top += 1
        for i in range(top, bottom + 1):
            res[i][right] = val; val += 1
        right -= 1
        if top <= bottom:
            for j in range(right, left - 1, -1):
                res[bottom][j] = val; val += 1
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1):
                res[i][left] = val; val += 1
            left += 1
    return res`
  },
  {
    num: 73, title: "Set Matrix Zeroes", slug: "set-matrix-zeroes", lc: "Medium",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 3,
    order: 870,
    core: true,
    teaches: "Record first, change later; for O(1) space, use the first row and column as the marker arrays.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [2482],
    hints: [
      "If you zero cells while scanning, the new zeros wrongly trigger more zeros. Record which rows and columns to clear first.",
      "Simple version: two sets (rows, cols), then a second pass. That is O(R + C) space.",
      "O(1) space: use matrix[i][0] and matrix[0][j] as the markers, and keep one extra flag for whether row 0 itself had a zero."
    ],
    steps: [
      "row0 = does row 0 contain a zero? col0 = does column 0 contain a zero?",
      "For i >= 1, j >= 1: if matrix[i][j] == 0, set matrix[i][0] = 0 and matrix[0][j] = 0 (the markers).",
      "For i >= 1, j >= 1: if matrix[i][0] == 0 or matrix[0][j] == 0, set the cell to 0.",
      "Last: if col0, zero column 0; if row0, zero row 0."
    ],
    time: "O(R*C)", space: "O(1)",
    trap: "Clear the marker row and column LAST, or you erase the markers before using them.",
    code: `def setZeroes(matrix):
    R, C = len(matrix), len(matrix[0])
    row0 = any(matrix[0][j] == 0 for j in range(C))
    col0 = any(matrix[i][0] == 0 for i in range(R))
    for i in range(1, R):
        for j in range(1, C):
            if matrix[i][j] == 0:
                matrix[i][0] = 0           # mark the row
                matrix[0][j] = 0           # mark the column
    for i in range(1, R):
        for j in range(1, C):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    if col0:
        for i in range(R):
            matrix[i][0] = 0
    if row0:
        for j in range(C):
            matrix[0][j] = 0`
  },
  {
    num: 1886, title: "Determine Whether Matrix Can Be Obtained By Rotation", slug: "determine-whether-matrix-can-be-obtained-by-rotation", lc: "Easy",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 3,
    order: 880,
    core: false,
    teaches: "Reuse Rotate Image: try the four rotations and compare.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [48],
    hints: [
      "There are only four orientations: 0, 90, 180 and 270 degrees.",
      "Rotate mat 90 degrees (transpose + reverse rows) up to four times and compare with target each time."
    ],
    steps: [
      "Repeat 4 times: if mat == target return True; mat = rotate90(mat).",
      "Return False."
    ],
    time: "O(n^2)", space: "O(n^2) (or O(1) if you rotate in place)",
    trap: "Check before the first rotation too: the matrices may already be equal.",
    code: `def findRotation(mat, target):
    for _ in range(4):
        if mat == target:
            return True
        mat = [list(row)[::-1] for row in zip(*mat)]   # rotate 90 clockwise
    return False`
  },
  {
    num: 189, title: "Rotate Array", slug: "rotate-array", lc: "Medium",
    topic: "arrays",
    pattern: "In-place: reversal tricks",
    level: 3,
    order: 890,
    core: true,
    teaches: "Rotation = three reversals: reverse all, then reverse each of the two parts.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [541],
    hints: [
      "First reduce k with k %= n. Rotating right by k moves the last k elements to the front.",
      "Reversing the whole array puts those last k at the front, but each part is now backwards.",
      "Reverse the first k and the remaining n - k separately to fix their order."
    ],
    steps: [
      "k %= n.",
      "reverse(0, n-1); reverse(0, k-1); reverse(k, n-1) using a two-pointer swap helper."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Forgetting k %= n: k can be bigger than n.",
    code: `def rotate(nums, k):
    n = len(nums)
    k %= n

    def rev(l, r):
        while l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1
            r -= 1

    rev(0, n - 1)    # last k elements come to the front (backwards)
    rev(0, k - 1)    # fix their order
    rev(k, n - 1)    # fix the rest`
  },
  {
    num: 8, title: "String to Integer (atoi)", slug: "string-to-integer-atoi", lc: "Medium",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 4,
    order: 900,
    core: false,
    teaches: "Careful parsing with an index: skip spaces, read a sign, read digits, then clamp.",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [13],
    hints: [
      "Handle the steps in order: leading spaces, optional sign, then digits until a non-digit.",
      "Build the number with num = num * 10 + digit.",
      "At the end multiply by the sign and clamp into [-2^31, 2^31 - 1]."
    ],
    steps: [
      "i = 0; skip ' '.",
      "sign = -1 if s[i] == '-' else 1; advance past '+' or '-'.",
      "While s[i] is a digit: num = num*10 + int(s[i]).",
      "Return max(-2**31, min(2**31 - 1, sign * num))."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Only one sign is allowed and only at the start: '+-12' is 0, and 'words 987' is 0.",
    code: `def myAtoi(s):
    i, n = 0, len(s)
    while i < n and s[i] == " ":
        i += 1
    sign = 1
    if i < n and s[i] in "+-":
        sign = -1 if s[i] == "-" else 1
        i += 1
    num = 0
    while i < n and s[i].isdigit():
        num = num * 10 + (ord(s[i]) - ord("0"))
        i += 1
    return max(-2**31, min(2**31 - 1, sign * num))`
  },
  {
    num: 18, title: "4Sum", slug: "4sum", lc: "Medium",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 4,
    order: 910,
    core: false,
    teaches: "Add one more fixed loop around 3Sum; duplicate skipping now happens at two levels.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [15],
    hints: [
      "Sort. Fix nums[i], then fix nums[j] (j > i), then two pointers for the last two.",
      "Skip duplicates for i (i > 0 and same as previous) and for j (j > i + 1 and same as previous).",
      "After a match, move both pointers and skip equal values."
    ],
    steps: [
      "Sort nums.",
      "For i: skip dup. For j in i+1..: skip dup.",
      "l, r = j + 1, n - 1; while l < r: s = sum of four; if s == target record and skip dups; elif s < target l += 1 else r -= 1."
    ],
    time: "O(n^3)", space: "O(1) extra",
    trap: "The duplicate check for j must be j > i + 1, not j > 0, or valid quadruplets get skipped.",
    code: `def fourSum(nums, target):
    nums.sort()
    n = len(nums)
    res = []
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            l, r = j + 1, n - 1
            while l < r:
                s = nums[i] + nums[j] + nums[l] + nums[r]
                if s == target:
                    res.append([nums[i], nums[j], nums[l], nums[r]])
                    l += 1
                    r -= 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
                elif s < target:
                    l += 1
                else:
                    r -= 1
    return res`
  },
  {
    num: 611, title: "Valid Triangle Number", slug: "valid-triangle-number", lc: "Medium",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 4,
    order: 920,
    core: false,
    teaches: "Fix the largest side; then if nums[l] + nums[r] > largest, every l' between l and r works too: count r - l at once.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [15],
    hints: [
      "Sort. A triangle needs the two smaller sides to sum to more than the largest.",
      "Fix the largest side at index k, and use l = 0, r = k - 1 for the other two.",
      "If nums[l] + nums[r] > nums[k], then all pairs (l..r-1, r) also work: add r - l and move r down. Otherwise move l up."
    ],
    steps: [
      "Sort; count = 0.",
      "For k from n - 1 down to 2: l, r = 0, k - 1.",
      "While l < r: if nums[l] + nums[r] > nums[k]: count += r - l; r -= 1; else l += 1.",
      "Return count."
    ],
    time: "O(n^2)", space: "O(1) extra",
    trap: "Counting r - l pairs in one step is the key; checking each pair is O(n^3).",
    code: `def triangleNumber(nums):
    nums.sort()
    count = 0
    for k in range(len(nums) - 1, 1, -1):     # nums[k] = largest side
        l, r = 0, k - 1
        while l < r:
            if nums[l] + nums[r] > nums[k]:
                count += r - l                # every l..r-1 pairs with r
                r -= 1
            else:
                l += 1
    return count`
  },
  {
    num: 2134, title: "Minimum Swaps to Group All 1's Together II", slug: "minimum-swaps-to-group-all-1s-together-ii", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 4,
    order: 930,
    core: false,
    teaches: "Window size is decided by the data (number of 1s), and the circle is handled with indexes mod n.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [2379],
    hints: [
      "If there are `ones` 1s in total, they will end up in some block of length `ones`.",
      "The swaps needed for a block = the number of 0s inside it. So find the window of length `ones` with the fewest 0s.",
      "The array is circular: let the window's right end run over 0..n+ones-1 and read nums[i % n]."
    ],
    steps: [
      "ones = sum(nums); if ones == 0 return 0.",
      "zeros = count of 0 in nums[:ones]; best = zeros.",
      "For i in range(ones, n + ones): zeros += (nums[i % n] == 0) - (nums[(i - ones) % n] == 0); best = min(best, zeros).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Without the wrap-around, groups that cross the end of the array are missed.",
    code: `def minSwaps(nums):
    n = len(nums)
    ones = sum(nums)
    if ones == 0:
        return 0
    zeros = nums[:ones].count(0)
    best = zeros
    for i in range(ones, n + ones):            # wrap around the circle
        zeros += (nums[i % n] == 0) - (nums[(i - ones) % n] == 0)
        best = min(best, zeros)
    return best`
  },
  {
    num: 424, title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 4,
    order: 940,
    core: true,
    teaches: "Window is valid if (length - count of its most common letter) <= k; the max count never needs to go down.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [2024],
    hints: [
      "You keep the most frequent letter in the window and replace the others. Replacements needed = length - maxCount.",
      "Grow right, update counts and maxCount. If length - maxCount > k, move left by one.",
      "maxCount can stay stale (too high) when you shrink: the answer only improves when a truly higher maxCount appears, so the result is still correct."
    ],
    steps: [
      "count = {}; left = maxf = best = 0.",
      "For right: count[ch] += 1; maxf = max(maxf, count[ch]).",
      "If (right - left + 1) - maxf > k: count[s[left]] -= 1; left += 1.",
      "best = max(best, right - left + 1). Return best."
    ],
    time: "O(n)", space: "O(26)",
    trap: "Recomputing maxCount over 26 letters each step is also fine (O(26n)); the stale-max trick is optional.",
    code: `def characterReplacement(s, k):
    count = {}
    left = maxf = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        maxf = max(maxf, count[ch])
        if (right - left + 1) - maxf > k:     # too many replacements needed
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`
  },
  {
    num: 1658, title: "Minimum Operations to Reduce X to Zero", slug: "minimum-operations-to-reduce-x-to-zero", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 4,
    order: 950,
    core: false,
    teaches: "Flip the view: removing from both ends = keeping the longest middle window with sum total - x.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [209, 1423],
    hints: [
      "Whatever you remove from the two ends, what remains is one contiguous middle block.",
      "Its sum must be total - x. Fewest removals = longest such middle block.",
      "All numbers are positive, so find the longest window with sum exactly total - x using a variable window."
    ],
    steps: [
      "want = sum(nums) - x; if want < 0 return -1; if want == 0 return n.",
      "left = cur = 0; best = -1. For right: cur += nums[right]; while cur > want: cur -= nums[left]; left += 1.",
      "If cur == want: best = max(best, right - left + 1).",
      "Return -1 if best == -1 else n - best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "If want == 0 you remove everything (answer n); if want < 0 it is impossible.",
    code: `def minOperations(nums, x):
    n = len(nums)
    want = sum(nums) - x               # sum of the part we keep
    if want < 0:
        return -1
    if want == 0:
        return n
    left = cur = 0
    best = -1
    for right in range(n):
        cur += nums[right]
        while cur > want:
            cur -= nums[left]
            left += 1
        if cur == want:
            best = max(best, right - left + 1)
    return -1 if best == -1 else n - best`
  },
  {
    num: 1838, title: "Frequency of the Most Frequent Element", slug: "frequency-of-the-most-frequent-element", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 4,
    order: 960,
    core: false,
    teaches: "Sort, then a window is valid if raising everything to its largest value costs <= k: cost = max * len - sum.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [1208],
    hints: [
      "It is best to raise numbers up to some existing value, using the numbers just below it. Sort first.",
      "For a window ending at right (largest value nums[right]), the cost to equalise = nums[right] * length - window sum.",
      "Grow right; while the cost exceeds k, shrink from the left. Track the longest window."
    ],
    steps: [
      "Sort nums; left = total = best = 0.",
      "For right: total += nums[right].",
      "While nums[right] * (right - left + 1) - total > k: total -= nums[left]; left += 1.",
      "best = max(best, right - left + 1). Return best."
    ],
    time: "O(n log n)", space: "O(1) extra",
    trap: "You can only increment, so the target must be the largest value in the window; that is why sorting is needed.",
    code: `def maxFrequency(nums, k):
    nums.sort()
    left = total = best = 0
    for right, x in enumerate(nums):
        total += x
        while x * (right - left + 1) - total > k:   # cost to raise all to x
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best`
  },
  {
    num: 930, title: "Binary Subarrays With Sum", slug: "binary-subarrays-with-sum", lc: "Medium",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 4,
    order: 970,
    core: false,
    teaches: "'Exactly k' = atMost(k) - atMost(k - 1), where atMost is a simple counting window.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [713],
    hints: [
      "Counting windows with sum EXACTLY goal is awkward: a window can be extended by zeros and stay valid.",
      "Counting windows with sum AT MOST goal is easy: for each right, add right - left + 1 (like Subarray Product Less Than K).",
      "exactly(goal) = atMost(goal) - atMost(goal - 1). atMost of a negative number is 0."
    ],
    steps: [
      "Helper atMost(g): if g < 0 return 0; left = cur = count = 0; for right: cur += nums[right]; while cur > g: cur -= nums[left]; left += 1; count += right - left + 1.",
      "Return atMost(goal) - atMost(goal - 1)."
    ],
    time: "O(n)", space: "O(1)",
    trap: "goal = 0 makes atMost(-1) necessary; return 0 for a negative bound.",
    code: `def numSubarraysWithSum(nums, goal):
    def at_most(g):
        if g < 0:
            return 0
        left = cur = count = 0
        for right, x in enumerate(nums):
            cur += x
            while cur > g:
                cur -= nums[left]
                left += 1
            count += right - left + 1
        return count

    return at_most(goal) - at_most(goal - 1)`
  },
  {
    num: 76, title: "Minimum Window Substring", slug: "minimum-window-substring", lc: "Hard",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 4,
    order: 980,
    core: true,
    teaches: "Shortest window covering all of t: track how many required characters are still missing, so validity is O(1).",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [209, 438],
    hints: [
      "Use the 'shortest' template: grow right until the window covers t, then shrink left while it still covers t.",
      "Keep need = Counter(t) (it may go negative for extras) and missing = len(t), the number of t's characters not yet covered.",
      "When adding ch with need[ch] > 0, missing drops. When missing == 0, shrink: if removing s[left] makes need[s[left]] > 0, the window stops covering."
    ],
    steps: [
      "need = Counter(t); missing = len(t); left = 0; best = (inf, 0, 0).",
      "For right, ch: if need[ch] > 0: missing -= 1; need[ch] -= 1.",
      "While missing == 0: record window if shorter; need[s[left]] += 1; if need[s[left]] > 0: missing += 1; left += 1.",
      "Return s[start:end] of the best window, or ''."
    ],
    time: "O(len(s) + len(t))", space: "O(k) for k distinct characters",
    trap: "t may contain repeats ('AA'): count characters, not just 'is present'.",
    code: `from collections import Counter

def minWindow(s, t):
    need = Counter(t)
    missing = len(t)
    left = 0
    best_len, best_l = float("inf"), 0
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:                    # window covers t: shrink
            if right - left + 1 < best_len:
                best_len, best_l = right - left + 1, left
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    return "" if best_len == float("inf") else s[best_l:best_l + best_len]`
  },
  {
    num: 2017, title: "Grid Game", slug: "grid-game", lc: "Medium",
    topic: "arrays",
    pattern: "Prefix sums",
    level: 4,
    order: 990,
    core: false,
    teaches: "Robot 1's turn column splits the grid; robot 2 gets either the top suffix or the bottom prefix, so try every split with running sums.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [2483],
    hints: [
      "Robot 1 goes right on the top row, down at some column i, then right on the bottom row. It empties those cells.",
      "Robot 2 can then only collect the top row to the right of i, OR the bottom row to the left of i (not both).",
      "For each i, robot 2 gets max(topSuffix after i, bottomPrefix before i). Robot 1 picks i to minimise that."
    ],
    steps: [
      "top = sum(grid[0]); bottom = 0; best = inf.",
      "For i in range(n): top -= grid[0][i]; best = min(best, max(top, bottom)); bottom += grid[1][i].",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Robot 1 maximising its own points is NOT the same as minimising robot 2's; optimise what the problem asks.",
    code: `def gridGame(grid):
    top = sum(grid[0])
    bottom = 0
    best = float("inf")
    for i in range(len(grid[0])):
        top -= grid[0][i]                  # top cells right of i
        best = min(best, max(top, bottom)) # robot 2 takes the better side
        bottom += grid[1][i]               # bottom cells left of i+1
    return best`
  },
  {
    num: 1589, title: "Maximum Sum Obtained of Any Permutation", slug: "maximum-sum-obtained-of-any-permutation", lc: "Medium",
    topic: "arrays",
    pattern: "Prefix sums: difference array",
    level: 4,
    order: 1000,
    core: false,
    teaches: "Count how often each index is used (difference array), then pair the biggest counts with the biggest numbers.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [1109],
    hints: [
      "The total of all requests = sum over i of nums[i] * (number of requests covering i).",
      "Get the coverage count of every index with a difference array.",
      "To maximise, give the largest numbers to the most-used positions: sort both and multiply pairwise."
    ],
    steps: [
      "diff = [0] * (n + 1); for s, e: diff[s] += 1; diff[e + 1] -= 1.",
      "count = prefix sums of diff[:n].",
      "Sort nums and count; return sum(a * b) % (10**9 + 7)."
    ],
    time: "O(n log n + r)", space: "O(n)",
    trap: "Take the modulo of the final sum (Python ints do not overflow, but the judge expects the modded value).",
    code: `def maxSumRangeQuery(nums, requests):
    n = len(nums)
    diff = [0] * (n + 1)
    for s, e in requests:
        diff[s] += 1
        diff[e + 1] -= 1
    count = []
    cur = 0
    for i in range(n):
        cur += diff[i]
        count.append(cur)
    nums.sort()
    count.sort()
    return sum(a * b for a, b in zip(nums, count)) % (10**9 + 7)`
  },
  {
    num: 918, title: "Maximum Sum Circular Subarray", slug: "maximum-sum-circular-subarray", lc: "Medium",
    topic: "arrays",
    pattern: "Kadane: best run ending here",
    level: 4,
    order: 1010,
    core: true,
    teaches: "A wrapping subarray = total minus a middle subarray, so max circular = max(normal Kadane, total - min Kadane).",
    learn: ["dsa_arrays", "dsa-ar-kadane"],
    pre: [1749],
    hints: [
      "Either the best subarray does not wrap (plain Kadane) or it wraps around the end.",
      "If it wraps, what is left out is a contiguous middle part. To maximise what you keep, minimise what you leave out.",
      "Answer = max(maxKadane, total - minKadane), except when all numbers are negative (then total - min would be the empty array): return maxKadane."
    ],
    steps: [
      "Run Kadane for max (best_hi) and min (best_lo) in one pass; total = sum(nums).",
      "If best_hi < 0 return best_hi.",
      "Return max(best_hi, total - best_lo)."
    ],
    time: "O(n)", space: "O(1)",
    trap: "All negative: total - minKadane = 0 means choosing nothing, which is not allowed.",
    code: `def maxSubarraySumCircular(nums):
    total = 0
    hi = lo = 0
    best_hi, best_lo = nums[0], nums[0]
    for x in nums:
        hi = max(hi, 0) + x
        lo = min(lo, 0) + x
        best_hi = max(best_hi, hi)
        best_lo = min(best_lo, lo)
        total += x
    if best_hi < 0:                    # all negative
        return best_hi
    return max(best_hi, total - best_lo)`
  },
  {
    num: 1186, title: "Maximum Subarray Sum with One Deletion", slug: "maximum-subarray-sum-with-one-deletion", lc: "Medium",
    topic: "arrays",
    pattern: "Kadane: best run ending here",
    level: 4,
    order: 1020,
    core: false,
    teaches: "Kadane with two states: best sum ending here with no deletion, and with exactly one deletion used.",
    learn: ["dsa_arrays", "dsa-ar-kadane"],
    pre: [53],
    hints: [
      "Track two values for subarrays ending at i: keep = no deletion used, dele = one deletion used.",
      "dele can come from (a) deleting the current element: keep at i - 1, or (b) deleting earlier and extending: dele at i - 1 + x.",
      "keep is plain Kadane. The answer is the max of both over all i (the subarray must stay non-empty)."
    ],
    steps: [
      "keep = arr[0]; dele = -inf; best = arr[0].",
      "For x in arr[1:]: dele = max(dele + x, keep); keep = max(keep + x, x); best = max(best, keep, dele).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Compute the new dele from the OLD keep, so update dele before keep.",
    code: `def maximumSum(arr):
    keep = best = arr[0]
    dele = float("-inf")
    for x in arr[1:]:
        dele = max(dele + x, keep)     # delete x, or a deletion happened earlier
        keep = max(keep + x, x)        # plain Kadane
        best = max(best, keep, dele)
    return best`
  },
  {
    num: 498, title: "Diagonal Traverse", slug: "diagonal-traverse", lc: "Medium",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 4,
    order: 1030,
    core: false,
    teaches: "Cells on one anti-diagonal share i + j; collect each diagonal and reverse every other one.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [54],
    hints: [
      "All cells with the same i + j lie on one anti-diagonal. There are R + C - 1 of them.",
      "For diagonal d, collect cells from top to bottom: i from max(0, d - C + 1) to min(d, R - 1), j = d - i.",
      "The direction alternates: on even d the traversal goes up (reverse the collected list)."
    ],
    steps: [
      "res = [].",
      "For d in range(R + C - 1): cells = [mat[i][d - i] for i in range(max(0, d - C + 1), min(d, R - 1) + 1)].",
      "If d is even: cells.reverse(). res.extend(cells).",
      "Return res."
    ],
    time: "O(R*C)", space: "O(min(R, C)) extra",
    trap: "Clamp i to the matrix: the start is max(0, d - C + 1), not 0, for wide/tall matrices.",
    code: `def findDiagonalOrder(mat):
    R, C = len(mat), len(mat[0])
    res = []
    for d in range(R + C - 1):
        cells = [mat[i][d - i] for i in range(max(0, d - C + 1), min(d, R - 1) + 1)]
        if d % 2 == 0:
            cells.reverse()            # even diagonals go upward
        res.extend(cells)
    return res`
  },
  {
    num: 289, title: "Game of Life", slug: "game-of-life", lc: "Medium",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 4,
    order: 1040,
    core: false,
    teaches: "Update in place by storing the next state in a spare bit, so neighbours still read the old state.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [73],
    hints: [
      "All cells change at the same time, so you must count neighbours using the OLD board.",
      "Each cell holds 0 or 1 in bit 0. Store the next state in bit 1 (cell |= 2) and count neighbours with cell & 1.",
      "After the full pass, shift every cell right by one (cell >>= 1)."
    ],
    steps: [
      "For each cell: live = sum(board[x][y] & 1 for the 8 neighbours inside the grid).",
      "If (cell & 1 and live in (2, 3)) or (not cell & 1 and live == 3): board[i][j] |= 2.",
      "Second pass: board[i][j] >>= 1."
    ],
    time: "O(R*C)", space: "O(1)",
    trap: "Reading board[x][y] directly (without & 1) after an earlier update gives wrong neighbour counts.",
    code: `def gameOfLife(board):
    R, C = len(board), len(board[0])
    for i in range(R):
        for j in range(C):
            live = 0
            for x in range(max(0, i - 1), min(R, i + 2)):
                for y in range(max(0, j - 1), min(C, j + 2)):
                    if (x, y) != (i, j):
                        live += board[x][y] & 1        # old state only
            if (board[i][j] & 1 and live in (2, 3)) or (not board[i][j] & 1 and live == 3):
                board[i][j] |= 2                       # next state in bit 1
    for i in range(R):
        for j in range(C):
            board[i][j] >>= 1`
  },
  {
    num: 885, title: "Spiral Matrix III", slug: "spiral-matrix-iii", lc: "Medium",
    topic: "arrays",
    pattern: "Matrix traversal",
    level: 4,
    order: 1050,
    core: false,
    teaches: "Walk an ever-growing spiral (step lengths 1,1,2,2,3,3,...) and record only the positions inside the grid.",
    learn: ["dsa_arrays", "dsa-ar-matrix"],
    pre: [54],
    hints: [
      "You cannot use shrinking walls here: the spiral starts in the middle and goes outside the grid.",
      "Walk the spiral directly: directions right, down, left, up; step lengths 1, 1, 2, 2, 3, 3, ...",
      "Record a position only when it is inside the grid; stop when you have rows * cols positions."
    ],
    steps: [
      "res = [[r, c]]; dirs = [(0,1),(1,0),(0,-1),(-1,0)]; step = 1; d = 0.",
      "While len(res) < rows * cols: repeat twice: walk `step` cells in dirs[d], recording in-grid cells; d = (d + 1) % 4. Then step += 1.",
      "Return res."
    ],
    time: "O(max(rows, cols)^2)", space: "O(1) extra",
    trap: "Step length grows after every TWO turns, not every turn.",
    code: `def spiralMatrixIII(rows, cols, rStart, cStart):
    res = [[rStart, cStart]]
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]   # right, down, left, up
    r, c = rStart, cStart
    step, d = 1, 0
    while len(res) < rows * cols:
        for _ in range(2):                       # two legs per step length
            dr, dc = dirs[d]
            for _ in range(step):
                r += dr
                c += dc
                if 0 <= r < rows and 0 <= c < cols:
                    res.append([r, c])
            d = (d + 1) % 4
        step += 1
    return res`
  },
  {
    num: 31, title: "Next Permutation", slug: "next-permutation", lc: "Medium",
    topic: "arrays",
    pattern: "In-place: reversal tricks",
    level: 4,
    order: 1060,
    core: false,
    teaches: "Find the rightmost ascent, swap with the next-larger value to its right, then reverse the suffix.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [189],
    hints: [
      "Look from the right. The longest non-increasing suffix is already the 'largest' arrangement of those digits.",
      "Let i be the index just before that suffix (nums[i] < nums[i+1]). Swap nums[i] with the smallest value in the suffix that is still bigger than it.",
      "The suffix is still non-increasing after the swap; reverse it to make it the smallest. If no such i exists, reverse the whole array."
    ],
    steps: [
      "i = n - 2; while i >= 0 and nums[i] >= nums[i + 1]: i -= 1.",
      "If i >= 0: j = n - 1; while nums[j] <= nums[i]: j -= 1; swap nums[i], nums[j].",
      "Reverse nums[i + 1:] in place."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Use >= and <= in the scans so duplicates like [1, 5, 1] are handled.",
    code: `def nextPermutation(nums):
    n = len(nums)
    i = n - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1                         # find rightmost ascent
    if i >= 0:
        j = n - 1
        while nums[j] <= nums[i]:
            j -= 1                     # smallest value > nums[i] in the suffix
        nums[i], nums[j] = nums[j], nums[i]
    l, r = i + 1, n - 1
    while l < r:                       # reverse the suffix
        nums[l], nums[r] = nums[r], nums[l]
        l += 1
        r -= 1`
  },
  {
    num: 68, title: "Text Justification", slug: "text-justification", lc: "Hard",
    topic: "arrays",
    pattern: "Strings: build & parse",
    level: 5,
    order: 1070,
    core: false,
    teaches: "Greedy line packing plus careful space distribution (extra spaces go to the left gaps).",
    learn: ["dsa_arrays", "dsa-ar-strings"],
    pre: [8],
    hints: [
      "First decide which words go on each line: add words while total letters + gaps (one per word boundary) still fits.",
      "For a normal line, spread maxWidth - letters spaces over the gaps: each gets q = spaces // gaps, and the first r = spaces % gaps gaps get one more.",
      "The last line and lines with a single word are left-justified: single spaces between words, padding on the right."
    ],
    steps: [
      "i = 0. While i < len(words): grow j from i while letters + words[j] + (j - i) <= maxWidth.",
      "gaps = j - i - 1. If j == len(words) or gaps == 0: line = ' '.join(words[i:j]).ljust(maxWidth).",
      "Else q, r = divmod(maxWidth - letters, gaps); build the line giving q + 1 spaces to the first r gaps and q to the rest.",
      "Append the line; i = j."
    ],
    time: "O(total characters)", space: "O(maxWidth) per line",
    trap: "The last line is left-justified even if it has several words.",
    code: `def fullJustify(words, maxWidth):
    res = []
    i = 0
    while i < len(words):
        j, letters = i, 0
        while j < len(words) and letters + len(words[j]) + (j - i) <= maxWidth:
            letters += len(words[j])
            j += 1
        gaps = j - i - 1
        if j == len(words) or gaps == 0:          # last line or single word
            line = " ".join(words[i:j]).ljust(maxWidth)
        else:
            q, r = divmod(maxWidth - letters, gaps)
            parts = []
            for k in range(i, j - 1):
                parts.append(words[k])
                parts.append(" " * (q + (1 if k - i < r else 0)))
            parts.append(words[j - 1])
            line = "".join(parts)
        res.append(line)
        i = j
    return res`
  },
  {
    num: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", lc: "Hard",
    topic: "arrays",
    pattern: "Two pointers: opposite ends",
    level: 5,
    order: 1080,
    core: true,
    teaches: "Water above a bar = min(max to the left, max to the right) - height; two pointers let you know the smaller side's max for sure.",
    learn: ["dsa_arrays", "dsa-ar-twoptr"],
    pre: [11],
    hints: [
      "Water above bar i is min(maxLeft[i], maxRight[i]) - height[i]. You could precompute both arrays in O(n) space.",
      "With pointers at both ends, keep leftMax and rightMax. If leftMax < rightMax, the left side is the limit for bar l, whatever lies between.",
      "So process whichever side has the smaller max: add max - height there and move that pointer inward."
    ],
    steps: [
      "l, r = 0, n - 1; leftMax = rightMax = water = 0.",
      "While l < r: if height[l] < height[r]: leftMax = max(leftMax, height[l]); water += leftMax - height[l]; l += 1.",
      "Else: rightMax = max(rightMax, height[r]); water += rightMax - height[r]; r -= 1.",
      "Return water."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Update the max before adding water, so a new tallest bar adds 0 rather than a negative amount.",
    code: `def trap(height):
    l, r = 0, len(height) - 1
    left_max = right_max = water = 0
    while l < r:
        if height[l] < height[r]:          # left side is the limit
            left_max = max(left_max, height[l])
            water += left_max - height[l]
            l += 1
        else:
            right_max = max(right_max, height[r])
            water += right_max - height[r]
            r -= 1
    return water`
  },
  {
    num: 30, title: "Substring with Concatenation of All Words", slug: "substring-with-concatenation-of-all-words", lc: "Hard",
    topic: "arrays",
    pattern: "Sliding window: fixed size",
    level: 5,
    order: 1090,
    core: false,
    teaches: "Slide in word-sized steps, once for each starting offset 0..wordLen-1, keeping word counts in the window.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [438],
    hints: [
      "All words have the same length L. A valid substring is exactly len(words) words of length L back to back.",
      "If you start at offset 0, L, 2L, ... the words line up. So run a separate window for each offset 0..L-1, stepping L characters at a time.",
      "In each window keep a Counter of words. Unknown word: reset the window. A word over its allowed count: shrink from the left. When the window holds all words, record its start."
    ],
    steps: [
      "need = Counter(words); L = len(words[0]); k = len(words).",
      "For off in range(L): left = off; have = Counter(); used = 0.",
      "For right in range(off, len(s) - L + 1, L): w = s[right:right+L]. If w not in need: reset have, used = 0, left = right + L; continue.",
      "have[w] += 1; used += 1; while have[w] > need[w]: drop s[left:left+L]; left += L; used -= 1.",
      "If used == k: record left; drop the leftmost word and move left by L."
    ],
    time: "O(L * n)", space: "O(k)",
    trap: "Words can repeat, so compare counts, not sets.",
    code: `from collections import Counter

def findSubstring(s, words):
    L, k = len(words[0]), len(words)
    need = Counter(words)
    res = []
    for off in range(L):
        left, used = off, 0
        have = Counter()
        for right in range(off, len(s) - L + 1, L):
            w = s[right:right + L]
            if w not in need:                  # breaks every window: reset
                have.clear()
                used = 0
                left = right + L
                continue
            have[w] += 1
            used += 1
            while have[w] > need[w]:           # too many copies: shrink
                have[s[left:left + L]] -= 1
                used -= 1
                left += L
            if used == k:
                res.append(left)
                have[s[left:left + L]] -= 1    # slide past the first word
                used -= 1
                left += L
    return res`
  },
  {
    num: 992, title: "Subarrays with K Different Integers", slug: "subarrays-with-k-different-integers", lc: "Hard",
    topic: "arrays",
    pattern: "Sliding window: variable size",
    level: 5,
    order: 1100,
    core: false,
    teaches: "Exactly k distinct = atMost(k) - atMost(k - 1), with a count dict in the window.",
    learn: ["dsa_arrays", "dsa-ar-window"],
    pre: [904, 930],
    hints: [
      "Counting windows with exactly K distinct values directly is hard: shrinking and growing both change the count.",
      "At most K distinct is easy (Fruit Into Baskets with K instead of 2), and you can count right - left + 1 per step.",
      "Subtract: exactly(K) = atMost(K) - atMost(K - 1)."
    ],
    steps: [
      "Helper atMost(k): count dict, left = 0, total = 0; for right: add; while len(count) > k: remove nums[left] (delete at 0), left += 1; total += right - left + 1.",
      "Return atMost(K) - atMost(K - 1)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Running the window twice is still O(n); trying to count 'exactly' in one plain window misses subarrays.",
    code: `def subarraysWithKDistinct(nums, k):
    def at_most(kk):
        count = {}
        left = total = 0
        for right, x in enumerate(nums):
            count[x] = count.get(x, 0) + 1
            while len(count) > kk:
                y = nums[left]
                count[y] -= 1
                if count[y] == 0:
                    del count[y]
                left += 1
            total += right - left + 1
        return total

    return at_most(k) - at_most(k - 1)`
  },
  {
    num: 798, title: "Smallest Rotation with Highest Score", slug: "smallest-rotation-with-highest-score", lc: "Hard",
    topic: "arrays",
    pattern: "Prefix sums: difference array",
    level: 5,
    order: 1110,
    core: false,
    teaches: "For each element find the range of rotations where it scores, and add those ranges with a circular difference array.",
    learn: ["dsa_arrays", "dsa-ar-prefix"],
    pre: [1589],
    hints: [
      "Rotating by k moves nums[i] to index (i - k) mod n. It scores if that index >= nums[i].",
      "For a fixed i, the good k values form one circular range: k from i + 1 (mod n) through i - nums[i] (mod n), wrapping around.",
      "Add +1 over each good range with a difference array (split a wrapped range in two), prefix-sum it, and pick the smallest k with the highest score."
    ],
    steps: [
      "diff = [0] * (n + 1).",
      "For i, x: lo = (i + 1) % n; hi = (i - x + n) % n. If lo <= hi: diff[lo] += 1; diff[hi + 1] -= 1. Else: diff[0] += 1; diff[hi + 1] -= 1; diff[lo] += 1; diff[n] -= 1.",
      "Prefix-sum diff[:n]; return the first index of the maximum."
    ],
    time: "O(n)", space: "O(n)",
    trap: "When x == 0 the element always scores: lo = i + 1 and hi = i, which wraps to cover all n rotations; check your range logic on it.",
    code: `def bestRotation(nums):
    n = len(nums)
    diff = [0] * (n + 1)
    for i, x in enumerate(nums):
        lo = (i + 1) % n               # first k where it scores
        hi = (i - x + n) % n           # last k where it scores
        if lo <= hi:
            diff[lo] += 1
            diff[hi + 1] -= 1
        else:                          # range wraps around
            diff[0] += 1
            diff[hi + 1] -= 1
            diff[lo] += 1
            diff[n] -= 1
    best_k, best, cur = 0, -1, 0
    for k in range(n):
        cur += diff[k]
        if cur > best:
            best, best_k = cur, k
    return best_k`
  },
  {
    num: 1191, title: "K-Concatenation Maximum Sum", slug: "k-concatenation-maximum-sum", lc: "Medium",
    topic: "arrays",
    pattern: "Kadane: best run ending here",
    level: 5,
    order: 1120,
    core: false,
    teaches: "Only two copies matter for the shape; if the whole array sums positive, the middle copies all add their total.",
    learn: ["dsa_arrays", "dsa-ar-kadane"],
    pre: [918],
    hints: [
      "For k = 1 it is just Kadane (empty allowed, so at least 0).",
      "For k >= 2, the best subarray either fits in two copies, or it spans the end of copy 1, some full middle copies, and the start of the last copy.",
      "So answer = kadane(arr + arr) + (k - 2) * max(0, sum(arr)), taken mod 1e9+7."
    ],
    steps: [
      "Helper kadane(a) with cur = max(0, cur) + x, best starting at 0.",
      "If k == 1 return kadane(arr) % MOD.",
      "Return (kadane(arr * 2) + (k - 2) * max(0, sum(arr))) % MOD."
    ],
    time: "O(n)", space: "O(n) for arr * 2 (can be done by looping twice)",
    trap: "Do not build arr * k: k can be 10^5, giving 10^10 elements.",
    code: `def kConcatenationMaxSum(arr, k):
    MOD = 10**9 + 7

    def kadane(a):
        cur = best = 0                 # empty subarray allowed
        for x in a:
            cur = max(cur, 0) + x
            best = max(best, cur)
        return best

    if k == 1:
        return kadane(arr) % MOD
    return (kadane(arr * 2) + (k - 2) * max(0, sum(arr))) % MOD`
  }
);
