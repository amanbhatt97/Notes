// problems/hashing.js — Hashing ladder
PROBLEMS.push(
  {
    num: 217, title: "Contains Duplicate", slug: "contains-duplicate", lc: "Easy",
    topic: "hashing",
    pattern: "Set: seen-before check",
    level: 1,
    order: 10,
    core: true,
    teaches: "A set answers 'have I seen this?' in O(1).",
    learn: ["dsa_hashing", "dsa-hs-problems"],
    pre: [],
    hints: [
      "What would you need to remember about the numbers you have already looked at?",
      "Keep every number you have seen in a set; check the set before adding the current one."
    ],
    steps: [
      "Create an empty set.",
      "For each x: if x is in the set, return True; otherwise add x.",
      "Return False after the loop."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Checking x in a list instead of a set makes each check O(n) and the whole thing O(n^2).",
    code: `def containsDuplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`
  },
  {
    num: 771, title: "Jewels and Stones", slug: "jewels-and-stones", lc: "Easy",
    topic: "hashing",
    pattern: "Set: membership and set ops",
    level: 1,
    order: 20,
    core: false,
    teaches: "Turn the 'allowed' list into a set once, then every membership check is O(1).",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [],
    hints: [
      "For each stone you ask one yes/no question. What is it?",
      "Put the jewel letters into a set and count stones whose letter is in it."
    ],
    steps: [
      "J = set(jewels).",
      "Return the number of characters c in stones with c in J."
    ],
    time: "O(j + s)", space: "O(j)",
    trap: "Letters are case-sensitive: 'a' and 'A' are different jewels.",
    code: `def numJewelsInStones(jewels, stones):
    J = set(jewels)
    return sum(c in J for c in stones)`
  },
  {
    num: 349, title: "Intersection of Two Arrays", slug: "intersection-of-two-arrays", lc: "Easy",
    topic: "hashing",
    pattern: "Set: membership and set ops",
    level: 1,
    order: 30,
    core: true,
    teaches: "Python set operators (&, |, -) do intersection, union and difference in linear time.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [],
    hints: [
      "The answer has no duplicates. Which data structure drops duplicates for free?",
      "Convert both lists to sets and take the intersection with &."
    ],
    steps: [
      "a, b = set(nums1), set(nums2).",
      "Return list(a & b)."
    ],
    time: "O(n + m)", space: "O(n + m)",
    trap: "A nested loop with 'x in nums2' is O(n*m) and also returns duplicates.",
    code: `def intersection(nums1, nums2):
    return list(set(nums1) & set(nums2))`
  },
  {
    num: 2215, title: "Find the Difference of Two Arrays", slug: "find-the-difference-of-two-arrays", lc: "Easy",
    topic: "hashing",
    pattern: "Set: membership and set ops",
    level: 1,
    order: 40,
    core: false,
    teaches: "Set difference a - b gives 'in a but not in b' directly.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [349],
    hints: [
      "You need two lists: things only in nums1, and things only in nums2.",
      "Make both sets, then answer is [list(a - b), list(b - a)]."
    ],
    steps: [
      "a, b = set(nums1), set(nums2).",
      "Return [list(a - b), list(b - a)]."
    ],
    time: "O(n + m)", space: "O(n + m)",
    trap: "Each answer list must contain distinct values; filtering the raw list keeps duplicates.",
    code: `def findDifference(nums1, nums2):
    a, b = set(nums1), set(nums2)
    return [list(a - b), list(b - a)]`
  },
  {
    num: 383, title: "Ransom Note", slug: "ransom-note", lc: "Easy",
    topic: "hashing",
    pattern: "Counter: frequency count",
    level: 1,
    order: 50,
    core: true,
    teaches: "Count what you have, then spend counts as you use them.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [],
    hints: [
      "Each magazine letter can be used once. What do you need to know about the magazine?",
      "Count magazine letters with a Counter; for each note letter, subtract one and fail if it would go below zero."
    ],
    steps: [
      "have = Counter(magazine).",
      "For each ch in ransomNote: if have[ch] == 0 return False; else have[ch] -= 1.",
      "Return True."
    ],
    time: "O(n + m)", space: "O(1) (26 letters)",
    trap: "Checking only 'ch in magazine' ignores how many times each letter is needed.",
    code: `def canConstruct(ransomNote, magazine):
    have = Counter(magazine)
    for ch in ransomNote:
        if have[ch] == 0:
            return False
        have[ch] -= 1
    return True`
  },
  {
    num: 1512, title: "Number of Good Pairs", slug: "number-of-good-pairs", lc: "Easy",
    topic: "hashing",
    pattern: "Map: complement / pair counting",
    level: 1,
    order: 60,
    core: false,
    teaches: "Count pairs in one pass: each new item pairs with every equal item seen before it.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [],
    hints: [
      "When you reach a value x, how many good pairs end at this position?",
      "Exactly as many as earlier copies of x. Keep a Counter and add seen[x] before incrementing it."
    ],
    steps: [
      "seen = Counter(), pairs = 0.",
      "For each x: pairs += seen[x]; seen[x] += 1.",
      "Return pairs."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Incrementing before adding counts each element as a pair with itself.",
    code: `def numIdenticalPairs(nums):
    seen = Counter()
    pairs = 0
    for x in nums:
        pairs += seen[x]
        seen[x] += 1
    return pairs`
  },
  {
    num: 219, title: "Contains Duplicate II", slug: "contains-duplicate-ii", lc: "Easy",
    topic: "hashing",
    pattern: "Set: seen-before check",
    level: 2,
    order: 70,
    core: true,
    teaches: "Store the last index of each value, not just the value, when distance matters.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [217],
    hints: [
      "For a value seen before, which earlier copy is the best one to compare with?",
      "The most recent copy is always the closest, so a dict value -> last index is enough.",
      "At index i, if x is in the dict and i - last[x] <= k you are done; then update last[x] = i."
    ],
    steps: [
      "last = {} maps value -> most recent index.",
      "For each i, x: if x in last and i - last[x] <= k, return True.",
      "Set last[x] = i.",
      "Return False."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Forgetting to update last[x] when the gap is too big; a later copy may still be close to this one.",
    code: `def containsNearbyDuplicate(nums, k):
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i
    return False`
  },
  {
    num: 2260, title: "Minimum Consecutive Cards to Pick Up", slug: "minimum-consecutive-cards-to-pick-up", lc: "Medium",
    topic: "hashing",
    pattern: "Set: seen-before check",
    level: 2,
    order: 80,
    core: false,
    teaches: "Last-seen index of each value gives the shortest window between equal values.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [219],
    hints: [
      "The answer window must start and end with the same card value. Why?",
      "For each card, the best partner is its most recent earlier copy.",
      "Keep last[value] = index; at each repeat, the window length is i - last[value] + 1."
    ],
    steps: [
      "last = {}, best = infinity.",
      "For each i, c: if c in last, best = min(best, i - last[c] + 1).",
      "Set last[c] = i.",
      "Return best, or -1 if it never changed."
    ],
    time: "O(n)", space: "O(n)",
    trap: "The length is i - last + 1, not i - last; both end cards are picked up.",
    code: `def minimumCardPickup(cards):
    last = {}
    best = float("inf")
    for i, c in enumerate(cards):
        if c in last:
            best = min(best, i - last[c] + 1)
        last[c] = i
    return -1 if best == float("inf") else best`
  },
  {
    num: 36, title: "Valid Sudoku", slug: "valid-sudoku", lc: "Medium",
    topic: "hashing",
    pattern: "Set: membership and set ops",
    level: 2,
    order: 90,
    core: true,
    teaches: "Tuple keys like ('row', r, digit) let one set track many separate constraints.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [217],
    hints: [
      "Each filled digit must be unique in its row, its column and its 3x3 box. How do you name a box?",
      "Box index is (r // 3, c // 3). You could keep 27 sets, or one set of tuple keys.",
      "For each digit v, build keys ('row', r, v), ('col', c, v), ('box', r//3, c//3, v); if any is already in the set, the board is invalid."
    ],
    steps: [
      "seen = set().",
      "For every cell (r, c) with digit v (skip '.'): build the three keys.",
      "If any key is in seen return False; otherwise add all three.",
      "Return True."
    ],
    time: "O(81)", space: "O(81)",
    trap: "Only check filled cells; the board does not need to be solvable, just consistent so far.",
    code: `def isValidSudoku(board):
    seen = set()
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                continue
            keys = (("row", r, v), ("col", c, v), ("box", r // 3, c // 3, v))
            if any(k in seen for k in keys):
                return False
            seen.update(keys)
    return True`
  },
  {
    num: 242, title: "Valid Anagram", slug: "valid-anagram", lc: "Easy",
    topic: "hashing",
    pattern: "Counter: frequency count",
    level: 2,
    order: 100,
    core: true,
    teaches: "Two strings are anagrams exactly when their letter counts are equal.",
    learn: ["dsa_hashing", "dsa-hs-problems"],
    pre: [383],
    hints: [
      "What stays the same when you rearrange letters?",
      "The count of each letter. Compare Counter(s) with Counter(t).",
      "Different lengths can return False straight away."
    ],
    steps: [
      "If len(s) != len(t) return False.",
      "Return Counter(s) == Counter(t)."
    ],
    time: "O(n)", space: "O(1) (26 letters)",
    trap: "sorted(s) == sorted(t) also works but costs O(n log n).",
    code: `def isAnagram(s, t):
    return len(s) == len(t) and Counter(s) == Counter(t)`
  },
  {
    num: 350, title: "Intersection of Two Arrays II", slug: "intersection-of-two-arrays-ii", lc: "Easy",
    topic: "hashing",
    pattern: "Counter: frequency count",
    level: 2,
    order: 110,
    core: false,
    teaches: "When duplicates matter, use counts instead of a set.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [349, 383],
    hints: [
      "Unlike 349, a value appearing twice in both lists appears twice in the answer.",
      "Count nums1. Walk nums2: if the count of x is positive, output x and decrement."
    ],
    steps: [
      "count = Counter(nums1), out = [].",
      "For x in nums2: if count[x] > 0, append x and count[x] -= 1.",
      "Return out."
    ],
    time: "O(n + m)", space: "O(min(n, m))",
    trap: "Using set intersection loses the repeat counts.",
    code: `def intersect(nums1, nums2):
    count = Counter(nums1)
    out = []
    for x in nums2:
        if count[x] > 0:
            out.append(x)
            count[x] -= 1
    return out`
  },
  {
    num: 387, title: "First Unique Character in a String", slug: "first-unique-character-in-a-string", lc: "Easy",
    topic: "hashing",
    pattern: "Counter: frequency count",
    level: 2,
    order: 120,
    core: true,
    teaches: "Two passes: first count everything, then scan in order using the counts.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [383],
    hints: [
      "You cannot know a letter is unique until you have seen the whole string.",
      "Pass 1: count letters. Pass 2: return the first index whose letter has count 1."
    ],
    steps: [
      "count = Counter(s).",
      "For i, ch in enumerate(s): if count[ch] == 1 return i.",
      "Return -1."
    ],
    time: "O(n)", space: "O(1) (26 letters)",
    trap: "Returning the first letter not yet repeated in a single pass fails for 'aab'-style inputs that repeat later.",
    code: `def firstUniqChar(s):
    count = Counter(s)
    for i, ch in enumerate(s):
        if count[ch] == 1:
            return i
    return -1`
  },
  {
    num: 1189, title: "Maximum Number of Balloons", slug: "maximum-number-of-balloons", lc: "Easy",
    topic: "hashing",
    pattern: "Counter: frequency count",
    level: 2,
    order: 130,
    core: false,
    teaches: "How many copies can you build? Divide available counts by needed counts and take the minimum.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [383],
    hints: [
      "'balloon' needs b, a, n once each but l and o twice.",
      "For each letter of 'balloon', have[ch] // need[ch] copies are possible; the scarcest letter limits you."
    ],
    steps: [
      "have = Counter(text), need = Counter('balloon').",
      "Return min(have[ch] // need[ch] for ch in need)."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Forgetting that l and o are needed twice per word.",
    code: `def maxNumberOfBalloons(text):
    have = Counter(text)
    need = Counter("balloon")
    return min(have[ch] // k for ch, k in need.items())`
  },
  {
    num: 409, title: "Longest Palindrome", slug: "longest-palindrome", lc: "Easy",
    topic: "hashing",
    pattern: "Counter: frequency count",
    level: 2,
    order: 140,
    core: false,
    teaches: "A palindrome uses letters in pairs, plus at most one odd letter in the middle.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [383],
    hints: [
      "In a palindrome, how do letters pair up around the centre?",
      "Each letter contributes count // 2 * 2 letters. One leftover letter can sit in the middle.",
      "If the pairs used fewer letters than the whole string, add 1 for the middle."
    ],
    steps: [
      "count = Counter(s).",
      "length = sum(c // 2 * 2 for each count).",
      "If length < len(s) add 1.",
      "Return length."
    ],
    time: "O(n)", space: "O(1) (52 letters)",
    trap: "Adding 1 for every odd count; only one letter can be in the middle.",
    code: `def longestPalindrome(s):
    count = Counter(s)
    length = sum(c // 2 * 2 for c in count.values())
    return length + 1 if length < len(s) else length`
  },
  {
    num: 1, title: "Two Sum", slug: "two-sum", lc: "Easy",
    topic: "hashing",
    pattern: "Map: complement / pair counting",
    level: 2,
    order: 150,
    core: true,
    teaches: "For each x, look up its partner target - x in a dict of values seen so far.",
    learn: ["dsa_hashing", "dsa-hs-problems"],
    pre: [217],
    hints: [
      "For a fixed x, which exact value would complete the pair?",
      "target - x. Instead of scanning for it, keep a dict value -> index of numbers already passed.",
      "Check the dict before storing x, so x never pairs with itself."
    ],
    steps: [
      "index = {}.",
      "For i, x: if target - x in index return [index[target - x], i].",
      "Otherwise index[x] = i."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Storing x before checking makes 3 + 3 = 6 match the same element.",
    code: `def twoSum(nums, target):
    index = {}
    for i, x in enumerate(nums):
        if target - x in index:
            return [index[target - x], i]
        index[x] = i`
  },
  {
    num: 1679, title: "Max Number of K-Sum Pairs", slug: "max-number-of-k-sum-pairs", lc: "Medium",
    topic: "hashing",
    pattern: "Map: complement / pair counting",
    level: 2,
    order: 160,
    core: false,
    teaches: "Two Sum with counts: a waiting partner is used up once matched.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [1],
    hints: [
      "This is Two Sum, but each number can be used once and you want as many pairs as possible.",
      "Keep a Counter of unmatched numbers. If k - x is waiting, match them and remove one copy; else x waits."
    ],
    steps: [
      "waiting = Counter(), ops = 0.",
      "For each x: if waiting[k - x] > 0, decrement it and ops += 1; else waiting[x] += 1.",
      "Return ops."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Using a set instead of counts loses duplicates like [3, 3, 3, 3] with k = 6 (answer 2).",
    code: `def maxOperations(nums, k):
    waiting = Counter()
    ops = 0
    for x in nums:
        if waiting[k - x] > 0:
            waiting[k - x] -= 1
            ops += 1
        else:
            waiting[x] += 1
    return ops`
  },
  {
    num: 205, title: "Isomorphic Strings", slug: "isomorphic-strings", lc: "Easy",
    topic: "hashing",
    pattern: "Map: two-way mapping",
    level: 2,
    order: 170,
    core: true,
    teaches: "A one-to-one mapping needs two dicts: s -> t and t -> s.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [1],
    hints: [
      "Walk both strings together. Each s-letter must always map to the same t-letter.",
      "That alone is not enough: two different s-letters must not map to the same t-letter ('ab' -> 'cc').",
      "Keep st and ts dicts; for each pair (a, b) both must agree or be unset."
    ],
    steps: [
      "st, ts = {}, {}.",
      "For a, b in zip(s, t): if st.setdefault(a, b) != b or ts.setdefault(b, a) != a, return False.",
      "Return True."
    ],
    time: "O(n)", space: "O(1) (alphabet size)",
    trap: "Checking only one direction accepts 'badc' -> 'baba'.",
    code: `def isIsomorphic(s, t):
    st, ts = {}, {}
    for a, b in zip(s, t):
        if st.setdefault(a, b) != b or ts.setdefault(b, a) != a:
            return False
    return True`
  },
  {
    num: 290, title: "Word Pattern", slug: "word-pattern", lc: "Easy",
    topic: "hashing",
    pattern: "Map: two-way mapping",
    level: 2,
    order: 180,
    core: false,
    teaches: "Same bijection check as Isomorphic Strings, with words instead of letters.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [205],
    hints: [
      "Split s into words. If the number of words differs from len(pattern), stop.",
      "Then it is Isomorphic Strings: letter -> word and word -> letter must both be consistent."
    ],
    steps: [
      "words = s.split(); if len(words) != len(pattern) return False.",
      "Keep pw and wp dicts; for each (p, w) both mappings must agree.",
      "Return True."
    ],
    time: "O(n)", space: "O(n)",
    trap: "zip stops at the shorter input, so without the length check 'aaa' vs 'aa aa aa aa' looks fine.",
    code: `def wordPattern(pattern, s):
    words = s.split()
    if len(words) != len(pattern):
        return False
    pw, wp = {}, {}
    for p, w in zip(pattern, words):
        if pw.setdefault(p, w) != w or wp.setdefault(w, p) != p:
            return False
    return True`
  },
  {
    num: 2352, title: "Equal Row and Column Pairs", slug: "equal-row-and-column-pairs", lc: "Medium",
    topic: "hashing",
    pattern: "Grouping by canonical key",
    level: 2,
    order: 190,
    core: false,
    teaches: "A list can't be a dict key, but a tuple can: hash whole rows as tuples.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [1512],
    hints: [
      "Comparing every row with every column element by element is O(n^3).",
      "Turn each row into a tuple and count them. zip(*grid) gives the columns as tuples.",
      "For each column, add how many rows equal it."
    ],
    steps: [
      "rows = Counter(tuple(r) for r in grid).",
      "Return sum(rows[col] for col in zip(*grid))."
    ],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Using a list as a key raises TypeError: unhashable type 'list'.",
    code: `def equalPairs(grid):
    rows = Counter(tuple(r) for r in grid)
    return sum(rows[col] for col in zip(*grid))`
  },
  {
    num: 705, title: "Design HashSet", slug: "design-hashset", lc: "Easy",
    topic: "hashing",
    pattern: "Design: hash structures",
    level: 2,
    order: 200,
    core: false,
    teaches: "A hash set is an array of buckets; key % size picks the bucket, and a short list inside handles collisions.",
    learn: ["dsa_hashing", "dsa-hs-impl"],
    pre: [217],
    hints: [
      "You can't use set(). Picture a fixed array of buckets. Which bucket does key go in?",
      "Bucket index = key % size (a prime like 1009 spreads keys well). Collisions share a bucket.",
      "Each bucket is a small list: add if absent, remove if present, contains = 'key in bucket'."
    ],
    steps: [
      "__init__: size = 1009, buckets = list of empty lists.",
      "add: append key to its bucket if not already there.",
      "remove: delete key from its bucket if present.",
      "contains: return key in its bucket."
    ],
    time: "O(1) average", space: "O(n + size)",
    trap: "A 10^6-element boolean array also passes but doesn't teach collisions and wastes memory.",
    code: `class MyHashSet:
    def __init__(self):
        self.size = 1009
        self.buckets = [[] for _ in range(self.size)]

    def add(self, key):
        b = self.buckets[key % self.size]
        if key not in b:
            b.append(key)

    def remove(self, key):
        b = self.buckets[key % self.size]
        if key in b:
            b.remove(key)

    def contains(self, key):
        return key in self.buckets[key % self.size]`
  },
  {
    num: 706, title: "Design HashMap", slug: "design-hashmap", lc: "Easy",
    topic: "hashing",
    pattern: "Design: hash structures",
    level: 2,
    order: 210,
    core: true,
    teaches: "A hash map is a hash set whose buckets hold [key, value] pairs; put must update an existing key.",
    learn: ["dsa_hashing", "dsa-hs-impl"],
    pre: [705],
    hints: [
      "Start from Design HashSet. What else must each bucket entry hold?",
      "Store [key, value] pairs. get scans one bucket for the key.",
      "put must first look for the key and overwrite its value; only append when it is missing."
    ],
    steps: [
      "Buckets of [key, value] lists, index = key % size.",
      "put: if key exists in its bucket, update value; else append [key, value].",
      "get: return the value or -1.",
      "remove: pop the pair if present."
    ],
    time: "O(1) average", space: "O(n + size)",
    trap: "Appending on every put leaves a stale old value that get may return.",
    code: `class MyHashMap:
    def __init__(self):
        self.size = 1009
        self.buckets = [[] for _ in range(self.size)]

    def put(self, key, value):
        b = self.buckets[key % self.size]
        for pair in b:
            if pair[0] == key:
                pair[1] = value
                return
        b.append([key, value])

    def get(self, key):
        for k, v in self.buckets[key % self.size]:
            if k == key:
                return v
        return -1

    def remove(self, key):
        b = self.buckets[key % self.size]
        for i, (k, _) in enumerate(b):
            if k == key:
                b.pop(i)
                return`
  },
  {
    num: 535, title: "Encode and Decode TinyURL", slug: "encode-and-decode-tinyurl", lc: "Medium",
    topic: "hashing",
    pattern: "Design: hash structures",
    level: 2,
    order: 220,
    core: false,
    teaches: "Two dicts give a reversible mapping: long -> short for encoding, short -> long for decoding.",
    learn: ["dsa_hashing", "dsa-hs-python"],
    pre: [706],
    hints: [
      "decode(encode(url)) must return url. What do you need to remember?",
      "Keep a dict code -> long URL. A simple counter can generate unique codes.",
      "Keep a second dict long -> code so encoding the same URL twice gives the same short link."
    ],
    steps: [
      "encode: if url is new, code = str(len(short_to_long)); store both directions.",
      "Return 'http://tinyurl.com/' + code.",
      "decode: return short_to_long[shortUrl]."
    ],
    time: "O(L) per call", space: "O(total URL length)",
    trap: "Hashing the URL with hash() and truncating can collide; a counter (or random code with a retry) is collision-free.",
    code: `class Codec:
    BASE = "http://tinyurl.com/"

    def __init__(self):
        self.long_to_short = {}
        self.short_to_long = {}

    def encode(self, longUrl):
        if longUrl not in self.long_to_short:
            short = self.BASE + str(len(self.short_to_long))
            self.long_to_short[longUrl] = short
            self.short_to_long[short] = longUrl
        return self.long_to_short[longUrl]

    def decode(self, shortUrl):
        return self.short_to_long[shortUrl]`
  },
  {
    num: 448, title: "Find All Numbers Disappeared in an Array", slug: "find-all-numbers-disappeared-in-an-array", lc: "Easy",
    topic: "hashing",
    pattern: "In-place hashing (index as key)",
    level: 2,
    order: 230,
    core: false,
    teaches: "When values are 1..n, the array itself can be the hash table: mark value v by negating nums[v - 1].",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [217],
    hints: [
      "A seen set works in O(n) space. Values are all in 1..n; could the array remember them instead?",
      "For each value v, flip nums[v - 1] to negative to mean 'v was seen'. Use abs() since values may already be flipped.",
      "At the end, every index i that is still positive means i + 1 never appeared."
    ],
    steps: [
      "For each x: i = abs(x) - 1; if nums[i] > 0, set nums[i] = -nums[i].",
      "Return [i + 1 for i where nums[i] > 0]."
    ],
    time: "O(n)", space: "O(1) extra",
    trap: "Reading nums[x - 1] without abs() breaks once x itself has been negated.",
    code: `def findDisappearedNumbers(nums):
    for x in nums:
        i = abs(x) - 1
        if nums[i] > 0:
            nums[i] = -nums[i]
    return [i + 1 for i, x in enumerate(nums) if x > 0]`
  },
  {
    num: 645, title: "Set Mismatch", slug: "set-mismatch", lc: "Easy",
    topic: "hashing",
    pattern: "In-place hashing (index as key)",
    level: 2,
    order: 240,
    core: false,
    teaches: "The negation trick finds both the repeat (slot already negative) and the gap (slot still positive).",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [448],
    hints: [
      "One number appears twice and one is missing from 1..n.",
      "Use the 448 marking trick. If nums[v - 1] is already negative when you reach v, v is the duplicate.",
      "After marking, the index still positive gives the missing number."
    ],
    steps: [
      "For each x: i = abs(x) - 1; if nums[i] < 0 then dup = abs(x); else negate nums[i].",
      "missing = first i + 1 with nums[i] > 0.",
      "Return [dup, missing]."
    ],
    time: "O(n)", space: "O(1) extra",
    trap: "Returning [missing, dup] in the wrong order; the duplicate comes first.",
    code: `def findErrorNums(nums):
    dup = -1
    for x in nums:
        i = abs(x) - 1
        if nums[i] < 0:
            dup = abs(x)
        else:
            nums[i] = -nums[i]
    missing = next(i + 1 for i, x in enumerate(nums) if x > 0)
    return [dup, missing]`
  },
  {
    num: 187, title: "Repeated DNA Sequences", slug: "repeated-dna-sequences", lc: "Medium",
    topic: "hashing",
    pattern: "Set: seen-before check",
    level: 3,
    order: 250,
    core: false,
    teaches: "Hash fixed-length substrings to find repeats; use a second set so each repeat is reported once.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [217],
    hints: [
      "How many 10-letter windows does a string of length n have?",
      "Put each window into a seen set. When a window is already there, it repeats.",
      "Collect repeats in a second set so a window that appears three times is not listed twice."
    ],
    steps: [
      "seen, repeated = set(), set().",
      "For i in 0..len(s)-10: sub = s[i:i+10]; if sub in seen add it to repeated; add sub to seen.",
      "Return list(repeated)."
    ],
    time: "O(n * 10)", space: "O(n * 10)",
    trap: "Using a list for the answer adds the same sequence more than once when it appears 3+ times.",
    code: `def findRepeatedDnaSequences(s):
    seen, repeated = set(), set()
    for i in range(len(s) - 9):
        sub = s[i:i + 10]
        if sub in seen:
            repeated.add(sub)
        seen.add(sub)
    return list(repeated)`
  },
  {
    num: 128, title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", lc: "Medium",
    topic: "hashing",
    pattern: "Set: membership and set ops",
    level: 3,
    order: 260,
    core: true,
    teaches: "Only start counting a run at x when x - 1 is missing; each number is then visited O(1) times.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [217],
    hints: [
      "Sorting gives O(n log n). The question asks for O(n). What can a set tell you about x - 1 and x + 1?",
      "If x - 1 is in the set, x is not the start of a run, so skip it.",
      "From each run start, walk x + 1, x + 2, ... while they are in the set; the total walking over all starts is O(n)."
    ],
    steps: [
      "s = set(nums), best = 0.",
      "For each x in s: if x - 1 not in s, walk y = x upward while y + 1 in s.",
      "best = max(best, y - x + 1).",
      "Return best."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Starting a walk from every number (not just run starts) or looping over nums with many duplicates degrades to O(n^2).",
    code: `def longestConsecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best`
  },
  {
    num: 1657, title: "Determine if Two Strings Are Close", slug: "determine-if-two-strings-are-close", lc: "Medium",
    topic: "hashing",
    pattern: "Counter: frequency count",
    level: 3,
    order: 270,
    core: false,
    teaches: "Look at the counts of the counts: what multiset of frequencies the operations can and cannot change.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [242],
    hints: [
      "Operation 1 reorders letters; operation 2 swaps which letters own which frequencies. What can never change?",
      "The set of letters used can't change, and the multiset of frequency values can't change.",
      "Compare set(c1) == set(c2) and sorted(c1.values()) == sorted(c2.values())."
    ],
    steps: [
      "c1, c2 = Counter(word1), Counter(word2).",
      "Return set(c1) == set(c2) and sorted(c1.values()) == sorted(c2.values())."
    ],
    time: "O(n)", space: "O(1) (26 letters)",
    trap: "Checking only the frequency multiset misses that a letter can't be created: 'aab' vs 'ccd' fails.",
    code: `def closeStrings(word1, word2):
    c1, c2 = Counter(word1), Counter(word2)
    return set(c1) == set(c2) and sorted(c1.values()) == sorted(c2.values())`
  },
  {
    num: 1010, title: "Pairs of Songs With Total Durations Divisible by 60", slug: "pairs-of-songs-with-total-durations-divisible-by-60", lc: "Medium",
    topic: "hashing",
    pattern: "Map: complement / pair counting",
    level: 3,
    order: 280,
    core: false,
    teaches: "Complement lookup works on remainders: x pairs with any y where (x + y) % 60 == 0.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [1512, 1],
    hints: [
      "Only t % 60 matters. Which remainder does a song with remainder r need as a partner?",
      "It needs (60 - r) % 60. Remainder 0 pairs with 0, and 30 pairs with 30.",
      "Keep counts of remainders seen so far and add count[(60 - r) % 60] before recording r."
    ],
    steps: [
      "count = [0] * 60, pairs = 0.",
      "For each t: r = t % 60; pairs += count[(60 - r) % 60]; count[r] += 1.",
      "Return pairs."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Using 60 - r without the final % 60 sends r = 0 to bucket 60, which does not exist.",
    code: `def numPairsDivisibleBy60(time):
    count = [0] * 60
    pairs = 0
    for t in time:
        r = t % 60
        pairs += count[(60 - r) % 60]
        count[r] += 1
    return pairs`
  },
  {
    num: 454, title: "4Sum II", slug: "4sum-ii", lc: "Medium",
    topic: "hashing",
    pattern: "Map: complement / pair counting",
    level: 3,
    order: 290,
    core: true,
    teaches: "Meet in the middle: hash all sums of one half, then look up the negated sums of the other half.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [1],
    hints: [
      "Four nested loops is O(n^4). Can you split the four lists into two pairs?",
      "Count every a + b in a Counter (n^2 sums).",
      "For every c + d, add ab[-(c + d)] to the answer."
    ],
    steps: [
      "ab = Counter(a + b for a in nums1 for b in nums2).",
      "Return the sum of ab[-(c + d)] over all c in nums3, d in nums4."
    ],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Storing a set of sums instead of counts loses how many (a, b) pairs give the same sum.",
    code: `def fourSumCount(nums1, nums2, nums3, nums4):
    ab = Counter(a + b for a in nums1 for b in nums2)
    return sum(ab[-(c + d)] for c in nums3 for d in nums4)`
  },
  {
    num: 2364, title: "Count Number of Bad Pairs", slug: "count-number-of-bad-pairs", lc: "Medium",
    topic: "hashing",
    pattern: "Map: complement / pair counting",
    level: 3,
    order: 300,
    core: false,
    teaches: "Rearrange the condition so each side depends on one index, then count equal keys; bad = all pairs - good.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [1512],
    hints: [
      "j - i == nums[j] - nums[i] mixes both indices. Move terms so each side has only i or only j.",
      "It becomes nums[i] - i == nums[j] - j. Good pairs share the key nums[x] - x.",
      "Count good pairs like Number of Good Pairs, then subtract from n * (n - 1) / 2."
    ],
    steps: [
      "seen = Counter(), good = 0.",
      "For i, x: key = x - i; good += seen[key]; seen[key] += 1.",
      "Return n * (n - 1) // 2 - good."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Counting bad pairs directly is O(n^2); count the complement (good pairs) instead.",
    code: `def countBadPairs(nums):
    seen = Counter()
    good = 0
    for i, x in enumerate(nums):
        good += seen[x - i]
        seen[x - i] += 1
    n = len(nums)
    return n * (n - 1) // 2 - good`
  },
  {
    num: 49, title: "Group Anagrams", slug: "group-anagrams", lc: "Medium",
    topic: "hashing",
    pattern: "Grouping by canonical key",
    level: 3,
    order: 310,
    core: true,
    teaches: "Give every item a canonical key (sorted letters); items with the same key belong to the same group.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [242],
    hints: [
      "Two words are anagrams when some 'signature' of them is the same. What signature?",
      "The sorted letters: 'eat', 'tea', 'ate' all become 'aet'.",
      "Use a defaultdict(list) from signature to words; return its values."
    ],
    steps: [
      "groups = defaultdict(list).",
      "For each s: groups[''.join(sorted(s))].append(s).",
      "Return list(groups.values())."
    ],
    time: "O(n k log k)", space: "O(n k)",
    trap: "A list (or Counter) can't be a key; use a string or tuple. A 26-count tuple key gives O(n k).",
    code: `def groupAnagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        groups["".join(sorted(s))].append(s)
    return list(groups.values())`
  },
  {
    num: 2342, title: "Max Sum of a Pair With Equal Sum of Digits", slug: "max-sum-of-a-pair-with-equal-sum-of-digits", lc: "Medium",
    topic: "hashing",
    pattern: "Grouping by canonical key",
    level: 3,
    order: 320,
    core: false,
    teaches: "Group by a computed key (digit sum) and keep only what you need per group: its best value.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [1],
    hints: [
      "Only numbers with the same digit sum can pair. What key should you group by?",
      "For each digit sum, you only need the largest number seen so far.",
      "For each x: if its key already has a best value b, try b + x; then keep max(b, x)."
    ],
    steps: [
      "best = {}, ans = -1.",
      "For each x: k = digit sum of x.",
      "If k in best: ans = max(ans, best[k] + x) and best[k] = max(best[k], x); else best[k] = x.",
      "Return ans."
    ],
    time: "O(n log M)", space: "O(n)",
    trap: "Storing whole lists per key and sorting them works but is slower; keep just the max.",
    code: `def maximumSum(nums):
    best = {}
    ans = -1
    for x in nums:
        k = sum(int(d) for d in str(x))
        if k in best:
            ans = max(ans, best[k] + x)
            best[k] = max(best[k], x)
        else:
            best[k] = x
    return ans`
  },
  {
    num: 560, title: "Subarray Sum Equals K", slug: "subarray-sum-equals-k", lc: "Medium",
    topic: "hashing",
    pattern: "Prefix sum + hashmap",
    level: 3,
    order: 330,
    core: true,
    teaches: "sum(i..j) = prefix[j] - prefix[i-1], so count earlier prefixes equal to current - k (Two Sum on prefixes).",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [1],
    hints: [
      "Sliding window fails because numbers can be negative. Write the subarray sum using prefix sums.",
      "A subarray ending at j sums to k when some earlier prefix equals prefix[j] - k.",
      "Keep a Counter of prefix sums seen so far, starting with {0: 1} for the empty prefix."
    ],
    steps: [
      "seen = Counter({0: 1}), total = count = 0.",
      "For each x: total += x; count += seen[total - k]; seen[total] += 1.",
      "Return count."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Forgetting seen[0] = 1 misses every subarray that starts at index 0.",
    code: `def subarraySum(nums, k):
    seen = Counter({0: 1})
    total = count = 0
    for x in nums:
        total += x
        count += seen[total - k]
        seen[total] += 1
    return count`
  },
  {
    num: 1248, title: "Count Number of Nice Subarrays", slug: "count-number-of-nice-subarrays", lc: "Medium",
    topic: "hashing",
    pattern: "Prefix sum + hashmap",
    level: 3,
    order: 340,
    core: false,
    teaches: "Map each number to 0/1 (odd?) and the problem becomes Subarray Sum Equals K.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [560],
    hints: [
      "Only odd/even matters. Replace each number by x % 2.",
      "Now you need subarrays whose sum is exactly k: same as 560.",
      "Prefix count of odds, Counter of earlier prefixes, start with {0: 1}."
    ],
    steps: [
      "seen = Counter({0: 1}), odd = ans = 0.",
      "For each x: odd += x % 2; ans += seen[odd - k]; seen[odd] += 1.",
      "Return ans."
    ],
    time: "O(n)", space: "O(n)",
    trap: "A two-pointer window for 'exactly k' needs the atMost(k) - atMost(k - 1) trick; the hashmap avoids it.",
    code: `def numberOfSubarrays(nums, k):
    seen = Counter({0: 1})
    odd = ans = 0
    for x in nums:
        odd += x % 2
        ans += seen[odd - k]
        seen[odd] += 1
    return ans`
  },
  {
    num: 974, title: "Subarray Sums Divisible by K", slug: "subarray-sums-divisible-by-k", lc: "Medium",
    topic: "hashing",
    pattern: "Prefix sum + hashmap",
    level: 3,
    order: 350,
    core: false,
    teaches: "A subarray sum is divisible by k when two prefix sums have the same remainder mod k.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [560],
    hints: [
      "sum(i..j) % k == 0 means prefix[j] and prefix[i-1] have the same remainder.",
      "So count, for each prefix, how many earlier prefixes had the same remainder.",
      "Start with remainder 0 seen once. In Python % already gives a non-negative remainder."
    ],
    steps: [
      "seen = Counter({0: 1}), total = ans = 0.",
      "For each x: total = (total + x) % k; ans += seen[total]; seen[total] += 1.",
      "Return ans."
    ],
    time: "O(n)", space: "O(k)",
    trap: "In Java/C++ a negative sum gives a negative remainder; normalise with ((s % k) + k) % k.",
    code: `def subarraysDivByK(nums, k):
    seen = Counter({0: 1})
    total = ans = 0
    for x in nums:
        total = (total + x) % k
        ans += seen[total]
        seen[total] += 1
    return ans`
  },
  {
    num: 523, title: "Continuous Subarray Sum", slug: "continuous-subarray-sum", lc: "Medium",
    topic: "hashing",
    pattern: "Prefix sum + hashmap",
    level: 3,
    order: 360,
    core: false,
    teaches: "When length matters, store the FIRST index of each prefix remainder, not a count.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [974],
    hints: [
      "Same remainder trick as 974, but the subarray must have length at least 2.",
      "To get the longest gap for a remainder, remember the earliest index it appeared at.",
      "Start with first[0] = -1. At index i, if first[r] exists and i - first[r] >= 2, return True."
    ],
    steps: [
      "first = {0: -1}, total = 0.",
      "For i, x: total = (total + x) % k.",
      "If total in first: if i - first[total] >= 2 return True. Else first[total] = i.",
      "Return False."
    ],
    time: "O(n)", space: "O(min(n, k))",
    trap: "Overwriting first[r] with later indices shrinks the gap; [5, 0, 0, 0], k = 3 needs the earliest index.",
    code: `def checkSubarraySum(nums, k):
    first = {0: -1}
    total = 0
    for i, x in enumerate(nums):
        total = (total + x) % k
        if total in first:
            if i - first[total] >= 2:
                return True
        else:
            first[total] = i
    return False`
  },
  {
    num: 525, title: "Contiguous Array", slug: "contiguous-array", lc: "Medium",
    topic: "hashing",
    pattern: "Prefix sum + hashmap",
    level: 3,
    order: 370,
    core: true,
    teaches: "Turn 0 into -1; equal 0s and 1s means sum 0, i.e. two equal prefix balances.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [560],
    hints: [
      "Equal numbers of 0s and 1s: can you turn that into 'sum equals something'?",
      "Count 1 as +1 and 0 as -1. A balanced subarray has sum 0, so its two prefix balances are equal.",
      "Store the first index of each balance (balance 0 at index -1); the answer is the largest i - first[balance]."
    ],
    steps: [
      "first = {0: -1}, bal = best = 0.",
      "For i, x: bal += 1 if x == 1 else -1.",
      "If bal in first: best = max(best, i - first[bal]); else first[bal] = i.",
      "Return best."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Updating first[bal] on every visit gives the shortest, not the longest, subarray.",
    code: `def findMaxLength(nums):
    first = {0: -1}
    bal = best = 0
    for i, x in enumerate(nums):
        bal += 1 if x == 1 else -1
        if bal in first:
            best = max(best, i - first[bal])
        else:
            first[bal] = i
    return best`
  },
  {
    num: 447, title: "Number of Boomerangs", slug: "number-of-boomerangs", lc: "Medium",
    topic: "hashing",
    pattern: "Geometry hashing",
    level: 3,
    order: 380,
    core: false,
    teaches: "Fix the middle point, group the other points by distance, and count ordered pairs inside each group.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [1512],
    hints: [
      "A boomerang (i, j, k) has i in the middle. Try fixing i.",
      "With i fixed, j and k must be the same distance from i. Group other points by squared distance.",
      "A group of size m gives m * (m - 1) ordered pairs; add 2 * count each time a new point joins a group."
    ],
    steps: [
      "For each point i: dist = Counter().",
      "For each point j: d = squared distance; total += 2 * dist[d]; dist[d] += 1.",
      "Return total."
    ],
    time: "O(n^2)", space: "O(n)",
    trap: "Using sqrt distances risks float errors; squared distances are exact integers.",
    code: `def numberOfBoomerangs(points):
    total = 0
    for x1, y1 in points:
        dist = Counter()
        for x2, y2 in points:
            d = (x1 - x2) ** 2 + (y1 - y2) ** 2
            total += 2 * dist[d]
            dist[d] += 1
    return total`
  },
  {
    num: 380, title: "Insert Delete GetRandom O(1)", slug: "insert-delete-getrandom-o1", lc: "Medium",
    topic: "hashing",
    pattern: "Design: hash structures",
    level: 3,
    order: 390,
    core: true,
    teaches: "Pair a list (random pick by index) with a dict value -> index; delete by swapping with the last element.",
    learn: ["dsa_hashing", "dsa-hs-impl"],
    pre: [706],
    hints: [
      "A set gives O(1) insert/remove but not O(1) random pick. A list gives random pick but slow remove.",
      "Use both: a list of values and a dict value -> its index in the list.",
      "To remove in O(1), move the last list element into the removed slot, update its index, then pop the end."
    ],
    steps: [
      "insert: if val in pos return False; pos[val] = len(vals); vals.append(val).",
      "remove: if missing return False; i = pos.pop(val); last = vals.pop(); if i < len(vals): vals[i] = last, pos[last] = i.",
      "getRandom: random.choice(vals)."
    ],
    time: "O(1) average per op", space: "O(n)",
    trap: "When removing the last element itself, writing it back into slot i re-adds it; check i < len(vals) after popping.",
    code: `import random

class RandomizedSet:
    def __init__(self):
        self.vals = []
        self.pos = {}

    def insert(self, val):
        if val in self.pos:
            return False
        self.pos[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val):
        if val not in self.pos:
            return False
        i = self.pos.pop(val)
        last = self.vals.pop()
        if i < len(self.vals):
            self.vals[i] = last
            self.pos[last] = i
        return True

    def getRandom(self):
        return random.choice(self.vals)`
  },
  {
    num: 442, title: "Find All Duplicates in an Array", slug: "find-all-duplicates-in-an-array", lc: "Medium",
    topic: "hashing",
    pattern: "In-place hashing (index as key)",
    level: 3,
    order: 400,
    core: false,
    teaches: "Negation marks act as a one-bit 'seen' flag per value, giving O(1) extra space duplicate detection.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [448],
    hints: [
      "Every value is in 1..n and appears once or twice. You must not use a set.",
      "Visit each x and look at slot abs(x) - 1. If it is already negative, x was seen before.",
      "Otherwise negate it. Collect the values that hit an already-negative slot."
    ],
    steps: [
      "out = [].",
      "For each x: i = abs(x) - 1; if nums[i] < 0 append abs(x); else nums[i] = -nums[i].",
      "Return out."
    ],
    time: "O(n)", space: "O(1) extra",
    trap: "Appending x instead of abs(x) returns negative numbers when x itself was already flipped.",
    code: `def findDuplicates(nums):
    out = []
    for x in nums:
        i = abs(x) - 1
        if nums[i] < 0:
            out.append(abs(x))
        else:
            nums[i] = -nums[i]
    return out`
  },
  {
    num: 166, title: "Fraction to Recurring Decimal", slug: "fraction-to-recurring-decimal", lc: "Medium",
    topic: "hashing",
    pattern: "Set: seen-before check",
    level: 4,
    order: 410,
    core: false,
    teaches: "In long division the digits repeat exactly when a remainder repeats; a map remainder -> position finds where.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [202],
    hints: [
      "Do long division by hand for 1/6 and 4/333. What decides the next digit?",
      "Only the remainder decides what comes next. If a remainder shows up again, the digits from its first appearance repeat.",
      "Map each remainder to the index of the digit it produced; on a repeat, put '(' at that index. Handle the sign and zero separately."
    ],
    steps: [
      "If numerator is 0 return '0'. Work out the sign, then use absolute values n, d.",
      "whole, rem = divmod(n, d). If rem is 0 return sign + whole.",
      "While rem is not 0 and not in pos: pos[rem] = len(digits); q, rem = divmod(rem * 10, d); append q.",
      "If rem is not 0, wrap digits from pos[rem] onward in parentheses.",
      "Return sign + whole + '.' + fraction."
    ],
    time: "O(d)", space: "O(d)",
    trap: "Getting the sign wrong for -50/8 or 7/-12: decide the sign once, then divide absolute values.",
    code: `def fractionToDecimal(numerator, denominator):
    if numerator == 0:
        return "0"
    sign = "-" if (numerator < 0) != (denominator < 0) else ""
    n, d = abs(numerator), abs(denominator)
    whole, rem = divmod(n, d)
    if rem == 0:
        return sign + str(whole)
    digits, pos = [], {}
    while rem and rem not in pos:
        pos[rem] = len(digits)
        q, rem = divmod(rem * 10, d)
        digits.append(str(q))
    if rem:
        i = pos[rem]
        frac = "".join(digits[:i]) + "(" + "".join(digits[i:]) + ")"
    else:
        frac = "".join(digits)
    return sign + str(whole) + "." + frac`
  },
  {
    num: 1590, title: "Make Sum Divisible by P", slug: "make-sum-divisible-by-p", lc: "Medium",
    topic: "hashing",
    pattern: "Prefix sum + hashmap",
    level: 4,
    order: 420,
    core: false,
    teaches: "Remove the shortest subarray whose sum % p equals total % p: look up the LATEST prefix with the needed remainder.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [974, 523],
    hints: [
      "Let need = sum(nums) % p. If need is 0, remove nothing. Otherwise remove a subarray with sum % p == need.",
      "For a subarray ending at i: (prefix[i] - prefix[j]) % p == need, so prefix[j] % p == (prefix[i] - need) % p.",
      "To make it shortest, keep the most recent index of each prefix remainder (start with {0: -1}). Removing the whole array is not allowed."
    ],
    steps: [
      "need = sum(nums) % p; if 0 return 0.",
      "last = {0: -1}, total = 0, best = n.",
      "For i, x: total = (total + x) % p; last[total] = i; want = (total - need) % p; if want in last, best = min(best, i - last[want]).",
      "Return best if best < n else -1."
    ],
    time: "O(n)", space: "O(min(n, p))",
    trap: "Returning n (removing everything) is not allowed; that case must become -1.",
    code: `def minSubarray(nums, p):
    need = sum(nums) % p
    if need == 0:
        return 0
    last = {0: -1}
    total = 0
    best = len(nums)
    for i, x in enumerate(nums):
        total = (total + x) % p
        last[total] = i
        want = (total - need) % p
        if want in last:
            best = min(best, i - last[want])
    return best if best < len(nums) else -1`
  },
  {
    num: 2013, title: "Detect Squares", slug: "detect-squares", lc: "Medium",
    topic: "hashing",
    pattern: "Geometry hashing",
    level: 4,
    order: 430,
    core: false,
    teaches: "Store point counts in a dict; enumerate the diagonal corner and look up the other two corners in O(1).",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [447],
    hints: [
      "A query point fixes one corner. If you also fix the opposite (diagonal) corner, the square is fully decided.",
      "Diagonal corner (px, py) needs |px - x| == |py - y| != 0. The other corners are (x, py) and (px, y).",
      "Multiply counts: cnt[(px, py)] * cnt[(x, py)] * cnt[(px, y)], summed over all stored points."
    ],
    steps: [
      "add: cnt[(x, y)] += 1.",
      "count(x, y): for each stored (px, py) with |px - x| == |py - y| and px != x,",
      "add cnt[(px, py)] * cnt[(x, py)] * cnt[(px, y)].",
      "Return the total."
    ],
    time: "add O(1), count O(p)", space: "O(p)",
    trap: "Zero-area squares (px == x) must be skipped; duplicates must be multiplied, not counted once.",
    code: `class DetectSquares:
    def __init__(self):
        self.pts = Counter()

    def add(self, point):
        self.pts[tuple(point)] += 1

    def count(self, point):
        x, y = point
        total = 0
        for (px, py), c in self.pts.items():
            if px != x and abs(px - x) == abs(py - y):
                total += c * self.pts[(x, py)] * self.pts[(px, y)]
        return total`
  },
  {
    num: 381, title: "Insert Delete GetRandom O(1) - Duplicates allowed", slug: "insert-delete-getrandom-o1-duplicates-allowed", lc: "Hard",
    topic: "hashing",
    pattern: "Design: hash structures",
    level: 4,
    order: 440,
    core: false,
    teaches: "With duplicates, map each value to a SET of its indices; the swap-with-last trick still works.",
    learn: ["dsa_hashing", "dsa-hs-impl"],
    pre: [380],
    hints: [
      "Start from RandomizedSet. With duplicates, one index per value is not enough.",
      "Map value -> set of indices where it sits in the list.",
      "Remove: take any index i of val, move the last element there, fix the last element's index set (add i, discard the old last index), then pop."
    ],
    steps: [
      "insert: idx[val].add(len(vals)); vals.append(val); return len(idx[val]) == 1.",
      "remove: if idx[val] is empty return False; i = idx[val].pop(); last = vals[-1].",
      "vals[i] = last; idx[last].add(i); idx[last].discard(len(vals) - 1); vals.pop(); return True.",
      "getRandom: random.choice(vals) (duplicates make frequent values more likely, as required)."
    ],
    time: "O(1) average per op", space: "O(n)",
    trap: "Doing discard before add breaks the case where i is the last index (then add puts back a stale index).",
    code: `import random
from collections import defaultdict

class RandomizedCollection:
    def __init__(self):
        self.vals = []
        self.idx = defaultdict(set)

    def insert(self, val):
        self.idx[val].add(len(self.vals))
        self.vals.append(val)
        return len(self.idx[val]) == 1

    def remove(self, val):
        if not self.idx[val]:
            return False
        i = self.idx[val].pop()
        last = self.vals[-1]
        self.vals[i] = last
        self.idx[last].add(i)
        self.idx[last].discard(len(self.vals) - 1)
        self.vals.pop()
        return True

    def getRandom(self):
        return random.choice(self.vals)`
  },
  {
    num: 41, title: "First Missing Positive", slug: "first-missing-positive", lc: "Hard",
    topic: "hashing",
    pattern: "In-place hashing (index as key)",
    level: 4,
    order: 450,
    core: true,
    teaches: "Cyclic sort: swap each value v in 1..n into slot v - 1; the first slot that holds the wrong value is the answer.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [448, 442],
    hints: [
      "The answer is always in 1..n+1. Values outside 1..n can be ignored.",
      "Try to put every v in 1..n at index v - 1 by swapping, like sorting cards into numbered boxes.",
      "Keep swapping at index i while nums[i] is in range and its home slot doesn't already hold it; then scan for the first i with nums[i] != i + 1."
    ],
    steps: [
      "For i in range(n): while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]: swap nums[i] into its home j = nums[i] - 1.",
      "For i in range(n): if nums[i] != i + 1 return i + 1.",
      "Return n + 1."
    ],
    time: "O(n)", space: "O(1) extra",
    trap: "Writing nums[i], nums[nums[i]-1] = ... in one line changes nums[i] before the second index is computed; save j first.",
    code: `def firstMissingPositive(nums):
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`
  },
  {
    num: 1074, title: "Number of Submatrices That Sum to Target", slug: "number-of-submatrices-that-sum-to-target", lc: "Hard",
    topic: "hashing",
    pattern: "Prefix sum + hashmap",
    level: 5,
    order: 460,
    core: false,
    teaches: "Fix a pair of rows, squash the band into one array of column sums, and run Subarray Sum Equals K on it.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [560],
    hints: [
      "Counting 1D subarrays with sum k is 560. Can you reduce the 2D problem to many 1D ones?",
      "Choose a top row and a bottom row. The column sums between them form a 1D array.",
      "Grow bottom from top downward, updating column sums in O(cols), and run the prefix + Counter count each time."
    ],
    steps: [
      "For each top row: colsum = [0] * cols.",
      "For each bottom >= top: add row bottom into colsum.",
      "Run 560 on colsum: seen = Counter({0: 1}), running total, ans += seen[total - target].",
      "Return ans."
    ],
    time: "O(r^2 * c)", space: "O(c)",
    trap: "Recomputing column sums from scratch for every (top, bottom) pair adds another factor of r.",
    code: `def numSubmatrixSumTarget(matrix, target):
    rows, cols = len(matrix), len(matrix[0])
    ans = 0
    for top in range(rows):
        colsum = [0] * cols
        for bottom in range(top, rows):
            for c in range(cols):
                colsum[c] += matrix[bottom][c]
            seen = Counter({0: 1})
            total = 0
            for v in colsum:
                total += v
                ans += seen[total - target]
                seen[total] += 1
    return ans`
  },
  {
    num: 149, title: "Max Points on a Line", slug: "max-points-on-a-line", lc: "Hard",
    topic: "hashing",
    pattern: "Geometry hashing",
    level: 5,
    order: 470,
    core: false,
    teaches: "Hash slopes as reduced (dx, dy) pairs with gcd and a sign rule, so equal slopes get equal keys exactly.",
    learn: ["dsa_hashing", "dsa-hs-patterns"],
    pre: [447],
    hints: [
      "Fix one point as an anchor. Points on the same line through it share a slope.",
      "Floats for slope are risky. Use the pair (dx, dy) divided by gcd(dx, dy).",
      "Normalise the sign (make dx > 0, or dx == 0 and dy > 0) so (1, 2) and (-1, -2) match; answer is max count + 1."
    ],
    steps: [
      "If n <= 2 return n.",
      "For each anchor i: slopes = Counter().",
      "For each j > i: dx, dy, divide by g = gcd(dx, dy), fix the sign, slopes[(dx, dy)] += 1.",
      "best = max(best, max count + 1). Return best."
    ],
    time: "O(n^2 log M)", space: "O(n)",
    trap: "Float slopes like dy / dx break on vertical lines and on precision; reduced integer pairs are exact.",
    code: `from math import gcd

def maxPoints(points):
    n = len(points)
    if n <= 2:
        return n
    best = 0
    for i in range(n):
        x1, y1 = points[i]
        slopes = Counter()
        for j in range(i + 1, n):
            dx = points[j][0] - x1
            dy = points[j][1] - y1
            g = gcd(dx, dy)
            dx, dy = dx // g, dy // g
            if dx < 0 or (dx == 0 and dy < 0):
                dx, dy = -dx, -dy
            slopes[(dx, dy)] += 1
        best = max(best, max(slopes.values(), default=0) + 1)
    return best`
  }
);
