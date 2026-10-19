// problems/tries.js — Tries ladder
PROBLEMS.push(
  {
    num: 2185, title: "Counting Words With a Given Prefix", slug: "counting-words-with-a-given-prefix", lc: "Easy",
    topic: "tries",
    pattern: "Trie build + prefix walk",
    level: 1,
    order: 10,
    core: false,
    teaches: "Store a 'passing' count on every trie node; a prefix query is one walk plus one read.",
    learn: ["dsa_tries", "dsa-tri-impl"],
    pre: [],
    hints: ["For each word, which trie nodes does it pass through?", "Insert every word, adding 1 to a counter on each node you pass. Then walk the prefix and read that node's counter."],
    steps: ["root = {} with a count field per node.", "Insert each word: for each char, step into (or create) the child and add 1 to its count.", "Walk pref; if a child is missing return 0; else return the last node's count."],
    time: "O(total letters)", space: "O(total letters)",
    trap: "For a single query, words.startswith is simpler; the trie pays off when there are many prefix queries.",
    code: `class Solution:
    def prefixCount(self, words, pref):
        root = {}
        for w in words:
            node = root
            for ch in w:
                node = node.setdefault(ch, {"#": 0})
                node["#"] += 1
        node = root
        for ch in pref:
            if ch not in node:
                return 0
            node = node[ch]
        return node["#"]`
  },
  {
    num: 208, title: "Implement Trie (Prefix Tree)", slug: "implement-trie-prefix-tree", lc: "Medium",
    topic: "tries",
    pattern: "Trie build + prefix walk",
    level: 2,
    order: 20,
    core: true,
    teaches: "A trie is a tree of characters; an end flag marks where a whole word stops.",
    learn: ["dsa_tries", "dsa-tri-impl"],
    pre: [2185],
    hints: ["What does each node need: children for the next letter, and what else?", "A flag that says 'a word ends here'. search needs it; startsWith does not.", "Write one helper that walks a string and returns the last node (or None)."],
    steps: ["Node: children dict + end flag.", "insert: walk, creating children; set end = True.", "_walk(s): follow children, return None if missing.", "search: node and node.end. startsWith: node is not None."],
    time: "O(L) per operation", space: "O(total letters)",
    trap: "Returning True from search when only a prefix exists: 'app' is not found after inserting only 'apple'.",
    code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.end = True

    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end

    def startsWith(self, prefix):
        return self._walk(prefix) is not None`
  },
  {
    num: 3043, title: "Find the Length of the Longest Common Prefix", slug: "find-the-length-of-the-longest-common-prefix", lc: "Medium",
    topic: "tries",
    pattern: "Trie build + prefix walk",
    level: 2,
    order: 30,
    core: false,
    teaches: "Put one array's numbers (as digit strings) into a trie; walk each number of the other array as deep as it goes.",
    learn: ["dsa_tries", "dsa-tri-impl"],
    pre: [208],
    hints: ["A common prefix of two numbers is a common prefix of their digit strings.", "Insert every number of arr1 into a trie of digits.", "For each number of arr2, walk its digits until a child is missing; the depth reached is its best common prefix."],
    steps: ["Build a trie from str(x) for x in arr1.", "For y in arr2: walk str(y), counting matched digits.", "Return the maximum count."],
    time: "O((n + m) * D)", space: "O(n * D)",
    trap: "Comparing every pair is O(n * m * D) and too slow for 5 * 10^4 numbers each.",
    code: `class Solution:
    def longestCommonPrefix(self, arr1, arr2):
        root = {}
        for x in arr1:
            node = root
            for ch in str(x):
                node = node.setdefault(ch, {})
        best = 0
        for y in arr2:
            node, d = root, 0
            for ch in str(y):
                if ch not in node:
                    break
                node = node[ch]
                d += 1
            best = max(best, d)
        return best`
  },
  {
    num: 648, title: "Replace Words", slug: "replace-words", lc: "Medium",
    topic: "tries",
    pattern: "Stop at a word end on the path",
    level: 2,
    order: 40,
    core: true,
    teaches: "Walk each word through a trie of roots and stop at the first end flag: that is the shortest root.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [208],
    hints: ["For a word, which root should replace it if several fit?", "The shortest one, which is the first end flag you meet while walking the word.", "If the walk breaks before any end flag, keep the word unchanged."],
    steps: ["Insert every root (end flag at its last node).", "For each word: walk letters; if you reach a node with end, use word[:i+1]; if a child is missing, keep the word.", "Join with spaces."],
    time: "O(total letters)", space: "O(total letters of roots)",
    trap: "Checking every root with startswith is O(words * roots * L).",
    code: `class Solution:
    def replaceWords(self, dictionary, sentence):
        root = {}
        for r in dictionary:
            node = root
            for ch in r:
                node = node.setdefault(ch, {})
            node["$"] = True
        out = []
        for w in sentence.split():
            node, rep = root, w
            for i, ch in enumerate(w):
                if ch not in node:
                    break
                node = node[ch]
                if "$" in node:
                    rep = w[:i + 1]
                    break
            out.append(rep)
        return " ".join(out)`
  },
  {
    num: 720, title: "Longest Word in Dictionary", slug: "longest-word-in-dictionary", lc: "Medium",
    topic: "tries",
    pattern: "Stop at a word end on the path",
    level: 2,
    order: 50,
    core: false,
    teaches: "A word can be built one letter at a time if every node on its trie path is a word end.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [208],
    hints: ["What must be true about every prefix of a buildable word?", "Each prefix is itself in the list, i.e. every node along its path has the end flag.", "DFS from the root only into children that are word ends; track the longest (smallest on ties)."],
    steps: ["Insert all words, storing the word at its end node.", "DFS/stack from root, only stepping into children that have a word.", "Keep the best by (longer, then lexicographically smaller)."],
    time: "O(total letters)", space: "O(total letters)",
    trap: "Sorting and checking word[:-1] in a set also works (O(n log n)); remember ties go to the smaller word.",
    code: `class Solution:
    def longestWord(self, words):
        root = {}
        for w in words:
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["$"] = w
        best = ""
        stack = [root]
        while stack:
            node = stack.pop()
            for ch, child in node.items():
                if ch != "$" and "$" in child:
                    w = child["$"]
                    if len(w) > len(best) or (len(w) == len(best) and w < best):
                        best = w
                    stack.append(child)
        return best`
  },
  {
    num: 677, title: "Map Sum Pairs", slug: "map-sum-pairs", lc: "Medium",
    topic: "tries",
    pattern: "Extra data stored per node",
    level: 2,
    order: 60,
    core: true,
    teaches: "Each node keeps the sum of values of keys below it; update by the difference when a key changes.",
    learn: ["dsa_tries", "dsa-tri-more"],
    pre: [2185],
    hints: ["sum(prefix) is a total over all keys starting with prefix. What could the prefix node store?", "The sum of values of all keys passing through it.", "When a key is inserted again, add only delta = new - old along its path (keep old values in a dict)."],
    steps: ["vals = {} for current key values.", "insert(key, val): delta = val - vals.get(key, 0); vals[key] = val; add delta to every node on the path.", "sum(prefix): walk; return the node's total or 0."],
    time: "O(L) per call", space: "O(total letters)",
    trap: "Adding val instead of the difference double-counts keys that are overwritten.",
    code: `class MapSum:
    def __init__(self):
        self.root = {"#": 0}
        self.vals = {}

    def insert(self, key, val):
        delta = val - self.vals.get(key, 0)
        self.vals[key] = val
        node = self.root
        for ch in key:
            node = node.setdefault(ch, {"#": 0})
            node["#"] += delta

    def sum(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node:
                return 0
            node = node[ch]
        return node["#"]`
  },
  {
    num: 1268, title: "Search Suggestions System", slug: "search-suggestions-system", lc: "Medium",
    topic: "tries",
    pattern: "Trie build + prefix walk",
    level: 3,
    order: 70,
    core: true,
    teaches: "Store up to three suggestions on each node while inserting the words in sorted order.",
    learn: ["dsa_tries", "dsa-tri-impl"],
    pre: [208],
    hints: ["After each typed letter you need the 3 smallest words with that prefix. Can each prefix node remember them?", "Sort products first. Insert in that order and append a word to each node's list only while it has fewer than 3.", "Then walk searchWord; once a letter has no child, every later answer is empty."],
    steps: ["Sort products.", "Insert each word; at every node on its path, if len(node.sugg) < 3 append the word.", "Walk searchWord letter by letter, collecting node.sugg, or [] once the path breaks."],
    time: "O(total letters + n log n)", space: "O(total letters)",
    trap: "Forgetting to output [] for the remaining letters after the path breaks gives a too-short answer.",
    code: `class Solution:
    def suggestedProducts(self, products, searchWord):
        root = {}
        for w in sorted(products):
            node = root
            for ch in w:
                node = node.setdefault(ch, {"$": []})
                if len(node["$"]) < 3:
                    node["$"].append(w)
        res, node = [], root
        for ch in searchWord:
            node = node.get(ch) if node else None
            res.append(node["$"] if node else [])
        return res`
  },
  {
    num: 820, title: "Short Encoding of Words", slug: "short-encoding-of-words", lc: "Medium",
    topic: "tries",
    pattern: "Stop at a word end on the path",
    level: 3,
    order: 80,
    core: false,
    teaches: "Words that are suffixes of others are free; a trie of reversed words exposes them as non-leaf paths.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [208],
    hints: ["'me' is covered by 'time#'. When is a word covered by another?", "When it is a suffix of another word. Reverse the words: suffixes become prefixes.", "Insert reversed unique words; the answer is the sum of (length + 1) over words that end at a leaf."],
    steps: ["words = set(words).", "Insert each reversed word, remembering its end node.", "Sum len(w) + 1 for each word whose end node has no children."],
    time: "O(total letters)", space: "O(total letters)",
    trap: "Duplicate words must be counted once: deduplicate first.",
    code: `class Solution:
    def minimumLengthEncoding(self, words):
        words = list(set(words))
        root, ends = {}, []
        for w in words:
            node = root
            for ch in reversed(w):
                node = node.setdefault(ch, {})
            ends.append(node)
        return sum(len(w) + 1 for w, node in zip(words, ends) if not node)`
  },
  {
    num: 1233, title: "Remove Sub-Folders from the Filesystem", slug: "remove-sub-folders-from-the-filesystem", lc: "Medium",
    topic: "tries",
    pattern: "Stop at a word end on the path",
    level: 3,
    order: 90,
    core: false,
    teaches: "A trie over path parts: stop descending at the first folder that is marked as an end.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [648],
    hints: ["A trie does not have to use characters. What are the 'letters' of a path?", "The folder names: split '/a/b' into ['a', 'b'].", "Insert all paths, then DFS and stop at the first end node on each branch: it is kept, everything below is a sub-folder."],
    steps: ["Insert each folder by its parts, storing the full path at its end node.", "DFS: if a node has an end, add its path and do not go deeper; else visit children."],
    time: "O(total characters)", space: "O(total characters)",
    trap: "Using startswith('/a') wrongly treats '/ab' as inside '/a'; splitting on '/' avoids that.",
    code: `class Solution:
    def removeSubfolders(self, folder):
        root = {}
        for f in folder:
            node = root
            for part in f.split("/")[1:]:
                node = node.setdefault(part, {})
            node["$end"] = f
        res, stack = [], [root]
        while stack:
            node = stack.pop()
            if "$end" in node:
                res.append(node["$end"])
                continue
            stack.extend(node.values())
        return res`
  },
  {
    num: 2416, title: "Sum of Prefix Scores of Strings", slug: "sum-of-prefix-scores-of-strings", lc: "Hard",
    topic: "tries",
    pattern: "Extra data stored per node",
    level: 3,
    order: 100,
    core: false,
    teaches: "Passing counts per node: a word's score is the sum of the counts along its own path.",
    learn: ["dsa_tries", "dsa-tri-more"],
    pre: [2185],
    hints: ["The score of a prefix is how many words start with it. Where is that number stored?", "In the passing count of the prefix node.", "Insert all words with counts, then walk each word again adding up counts."],
    steps: ["Insert every word, adding 1 to each node's count on the path.", "For each word, walk it and sum the counts.", "Return the list of sums."],
    time: "O(total letters)", space: "O(total letters)",
    trap: "Comparing every pair of words for common prefixes is O(n^2 * L).",
    code: `class Solution:
    def sumPrefixScores(self, words):
        root = {}
        for w in words:
            node = root
            for ch in w:
                node = node.setdefault(ch, {"#": 0})
                node["#"] += 1
        res = []
        for w in words:
            node, total = root, 0
            for ch in w:
                node = node[ch]
                total += node["#"]
            res.append(total)
        return res`
  },
  {
    num: 211, title: "Design Add and Search Words Data Structure", slug: "design-add-and-search-words-data-structure", lc: "Medium",
    topic: "tries",
    pattern: "Trie + DFS / branching search",
    level: 3,
    order: 110,
    core: true,
    teaches: "A '.' turns the single trie walk into a small DFS over all children.",
    learn: ["dsa_tries", "dsa-tri-problems"],
    pre: [208],
    hints: ["Without dots the search is a normal walk. What changes at a '.'?", "Try every child at that position; succeed if any branch finds a word end.", "Write dfs(node, i): at a letter follow one child, at '.' loop over all children."],
    steps: ["Insert as in 208.", "dfs(node, i): if i == len(word) return node.end.", "If word[i] == '.': return any(dfs(child, i + 1) for child in children).", "Else follow the matching child (False if missing)."],
    time: "O(L) without dots; up to O(26^dots * L)", space: "O(total letters)",
    trap: "Forgetting to check the end flag at the last position accepts prefixes of words.",
    code: `class WordDictionary:
    def __init__(self):
        self.root = {}

    def addWord(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            ch = word[i]
            if ch == ".":
                return any(dfs(child, i + 1) for k, child in node.items() if k != "$")
            return ch in node and dfs(node[ch], i + 1)
        return dfs(self.root, 0)`
  },
  {
    num: 2452, title: "Words Within Two Edits of Dictionary", slug: "words-within-two-edits-of-dictionary", lc: "Medium",
    topic: "tries",
    pattern: "Trie + DFS / branching search",
    level: 3,
    order: 120,
    core: false,
    teaches: "DFS through the dictionary trie with an 'edits left' budget instead of a wildcard.",
    learn: ["dsa_tries", "dsa-tri-problems"],
    pre: [211],
    hints: ["Like '.' search, but any letter may differ at most twice. What extra argument do you carry?", "dfs(node, i, edits): following the matching child costs 0 edits, any other child costs 1.", "Stop a branch when edits would go above 2; succeed when you reach the end of the query."],
    steps: ["Insert all dictionary words.", "dfs(node, i, e): if i == len(q) return True.", "For each child ch: cost = 0 if ch == q[i] else 1; if e + cost <= 2 and dfs(child, i + 1, e + cost) return True.", "Keep each query for which dfs(root, 0, 0) is True."],
    time: "O(Q * min(D, 26^2) * L)", space: "O(D * L)",
    trap: "All words have the same length, so you never need insertions or deletions, only replacements.",
    code: `class Solution:
    def twoEditWords(self, queries, dictionary):
        root = {}
        for w in dictionary:
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
        def dfs(node, q, i, e):
            if i == len(q):
                return True
            for ch, child in node.items():
                cost = 0 if ch == q[i] else 1
                if e + cost <= 2 and dfs(child, q, i + 1, e + cost):
                    return True
            return False
        return [q for q in queries if dfs(root, q, 0, 0)]`
  },
  {
    num: 386, title: "Lexicographical Numbers", slug: "lexicographical-numbers", lc: "Medium",
    topic: "tries",
    pattern: "Implicit trie (lexicographic numbers)",
    level: 3,
    order: 130,
    core: false,
    teaches: "The numbers 1..n form a 10-ary trie; preorder of that trie is lexicographic order.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [144],
    hints: ["Draw 1..13 as a tree: 1 has children 10..19, and so on. Which traversal gives '1, 10, 11, 12, 13, 2, ...'?", "Preorder. You can do it without recursion: go to child cur * 10 if it is <= n.", "Otherwise move to the next sibling cur + 1, first climbing up (cur //= 10) while cur ends in 9 or cur + 1 > n."],
    steps: ["cur = 1.", "Repeat n times: append cur; if cur * 10 <= n: cur *= 10.", "Else: while cur % 10 == 9 or cur + 1 > n: cur //= 10; then cur += 1."],
    time: "O(n)", space: "O(1) extra",
    trap: "Sorting str(i) is O(n log n) and uses O(n) extra memory; the problem asks for O(n) time and O(1) space.",
    code: `class Solution:
    def lexicalOrder(self, n):
        res, cur = [], 1
        for _ in range(n):
            res.append(cur)
            if cur * 10 <= n:
                cur *= 10
            else:
                while cur % 10 == 9 or cur + 1 > n:
                    cur //= 10
                cur += 1
        return res`
  },
  {
    num: 421, title: "Maximum XOR of Two Numbers in an Array", slug: "maximum-xor-of-two-numbers-in-an-array", lc: "Medium",
    topic: "tries",
    pattern: "Binary (XOR) trie",
    level: 3,
    order: 140,
    core: true,
    teaches: "Store numbers bit by bit (high to low) in a binary trie; to maximise XOR, greedily take the opposite bit.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [208],
    hints: ["XOR is biggest when the highest bits differ. For a fixed x, which bit would you like at each level?", "The opposite of x's bit, from bit 30 down to 0. A binary trie lets you check whether such a number exists.", "Insert all numbers, then for each x walk the trie choosing the opposite bit when possible."],
    steps: ["Trie as lists: children[node] = [child0, child1].", "Insert each number from bit 30 down to 0.", "For each x: walk, preferring bit 1 - b; add (1 << i) to the result when you get it.", "Return the maximum."],
    time: "O(n * 31)", space: "O(n * 31)",
    trap: "Walking from the low bit first is wrong: the high bits dominate the value.",
    code: `class Solution:
    def findMaximumXOR(self, nums):
        children = [[0, 0]]
        for x in nums:
            node = 0
            for i in range(30, -1, -1):
                b = (x >> i) & 1
                if not children[node][b]:
                    children[node][b] = len(children)
                    children.append([0, 0])
                node = children[node][b]
        best = 0
        for x in nums:
            node, cur = 0, 0
            for i in range(30, -1, -1):
                b = (x >> i) & 1
                if children[node][1 - b]:
                    cur |= 1 << i
                    node = children[node][1 - b]
                else:
                    node = children[node][b]
            best = max(best, cur)
        return best`
  },
  {
    num: 3093, title: "Longest Common Suffix Queries", slug: "longest-common-suffix-queries", lc: "Hard",
    topic: "tries",
    pattern: "Extra data stored per node",
    level: 4,
    order: 150,
    core: false,
    teaches: "Trie of reversed words where every node stores its best word index (shortest, then earliest).",
    learn: ["dsa_tries", "dsa-tri-more"],
    pre: [820, 2416],
    hints: ["Common suffix -> reverse the strings so it becomes a common prefix.", "For a query, walk the reversed query as far as it matches; the answer is the best container word passing through that node.", "Store at each node (and at the root) the index of the shortest word through it, earliest on ties."],
    steps: ["root.best = best index over all words.", "Insert each reversed container word; on each node keep the better of (len, index).", "For each query, walk reversed until a child is missing; answer = last node's best."],
    time: "O(total letters)", space: "O(total letters)",
    trap: "The root must also hold a best index: a query with no common suffix still needs the shortest word overall.",
    code: `class Solution:
    def stringIndices(self, wordsContainer, wordsQuery):
        def better(i, j):
            return i if j is None or (len(wordsContainer[i]), i) < (len(wordsContainer[j]), j) else j
        root = {"#": None}
        for i, w in enumerate(wordsContainer):
            node = root
            node["#"] = better(i, node["#"])
            for ch in reversed(w):
                node = node.setdefault(ch, {"#": None})
                node["#"] = better(i, node["#"])
        res = []
        for q in wordsQuery:
            node = root
            for ch in reversed(q):
                if ch not in node:
                    break
                node = node[ch]
            res.append(node["#"])
        return res`
  },
  {
    num: 745, title: "Prefix and Suffix Search", slug: "prefix-and-suffix-search", lc: "Hard",
    topic: "tries",
    pattern: "Extra data stored per node",
    level: 4,
    order: 160,
    core: false,
    teaches: "Turn a two-sided query into a one-sided one: insert 'suffix#word' for every suffix and search 'suff#pref'.",
    learn: ["dsa_tries", "dsa-tri-more"],
    pre: [208, 677],
    hints: ["A trie only answers prefix questions. How can a suffix become part of a prefix?", "For word 'apple', insert 'e#apple', 'le#apple', ..., 'apple#apple' (and '#apple').", "Each node stores the largest index that passed through it. f(pref, suff) walks suff + '#' + pref."],
    steps: ["For each index i, word w: for k in 0..len(w): insert w[k:] + '#' + w, setting node.weight = i on the way.", "f(pref, suff): walk suff + '#' + pref; return the node's weight or -1."],
    time: "O(N * L^2) build, O(L) query", space: "O(N * L^2)",
    trap: "Inserting in index order makes later words overwrite earlier ones, which is exactly the 'largest index' rule.",
    code: `class WordFilter:
    def __init__(self, words):
        self.root = {}
        for i, w in enumerate(words):
            for k in range(len(w) + 1):
                node = self.root
                for ch in w[k:] + "#" + w:
                    node = node.setdefault(ch, {})
                    node["$"] = i

    def f(self, pref, suff):
        node = self.root
        for ch in suff + "#" + pref:
            if ch not in node:
                return -1
            node = node[ch]
        return node["$"]`
  },
  {
    num: 1032, title: "Stream of Characters", slug: "stream-of-characters", lc: "Hard",
    topic: "tries",
    pattern: "Trie + DFS / branching search",
    level: 4,
    order: 170,
    core: true,
    teaches: "Store reversed words; for each new letter walk the trie backwards from the newest character.",
    learn: ["dsa_tries", "dsa-tri-problems"],
    pre: [208, 820],
    hints: ["A query asks: does some word end at the latest letter? Which direction should you read the stream?", "Backwards from the newest letter. So insert the words reversed.", "Keep the last maxLen letters; walk them newest-first until a word end (True) or a missing child (False)."],
    steps: ["Insert each word reversed; maxlen = longest word.", "query(c): append c to a deque with maxlen.", "Walk from the newest letter backwards through the trie; return True at the first end flag."],
    time: "O(L) per query", space: "O(total letters + L)",
    trap: "Walking forward from every possible start each query is O(L^2) per query.",
    code: `from collections import deque
class StreamChecker:
    def __init__(self, words):
        self.root = {}
        for w in words:
            node = self.root
            for ch in reversed(w):
                node = node.setdefault(ch, {})
            node["$"] = True
        self.stream = deque(maxlen=max(map(len, words)))

    def query(self, letter):
        self.stream.appendleft(letter)
        node = self.root
        for ch in self.stream:
            if ch not in node:
                return False
            node = node[ch]
            if "$" in node:
                return True
        return False`
  },
  {
    num: 440, title: "K-th Smallest in Lexicographical Order", slug: "k-th-smallest-in-lexicographical-order", lc: "Hard",
    topic: "tries",
    pattern: "Implicit trie (lexicographic numbers)",
    level: 4,
    order: 180,
    core: false,
    teaches: "Count how many numbers sit under a prefix in the implicit 10-ary trie, then skip whole subtrees.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [386],
    hints: ["Walking one number at a time (386) is O(k), and k can be 10^9. Can you skip a whole subtree at once?", "The subtree of prefix p contains, at each depth, the numbers in [p, p + 1) scaled by 10, 100, ..., capped at n.", "If that count <= k, skip to the next sibling (k -= count); else step down into the first child (k -= 1)."],
    steps: ["count(p): a, b = p, p + 1; total = 0; while a <= n: total += min(n + 1, b) - a; a *= 10; b *= 10.", "cur = 1; k -= 1.", "While k > 0: c = count(cur); if c <= k: k -= c; cur += 1; else: cur *= 10; k -= 1.", "Return cur."],
    time: "O(log^2 n)", space: "O(1)",
    trap: "Forgetting to cap the range at n + 1 counts numbers that do not exist.",
    code: `class Solution:
    def findKthNumber(self, n, k):
        def count(p):
            a, b, total = p, p + 1, 0
            while a <= n:
                total += min(n + 1, b) - a
                a *= 10
                b *= 10
            return total
        cur = 1
        k -= 1
        while k > 0:
            c = count(cur)
            if c <= k:
                k -= c
                cur += 1
            else:
                cur *= 10
                k -= 1
        return cur`
  },
  {
    num: 1707, title: "Maximum XOR With an Element From Array", slug: "maximum-xor-with-an-element-from-array", lc: "Hard",
    topic: "tries",
    pattern: "Binary (XOR) trie",
    level: 4,
    order: 190,
    core: false,
    teaches: "Offline queries: sort queries by limit, insert numbers up to the limit, then run the max-XOR walk.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [421],
    hints: ["Each query only allows numbers <= m. If queries came in increasing m, what would happen to the allowed set?", "It only grows. Sort nums and the queries by m; insert numbers while they are <= m.", "Answer with the 421 walk, or -1 if nothing has been inserted yet. Store answers by the query's original index."],
    steps: ["Sort nums; order = query indices sorted by m.", "For each query (x, m): insert nums[p] while nums[p] <= m.", "If the trie is empty answer -1, else greedy opposite-bit walk."],
    time: "O((n + q) * 30 + n log n + q log q)", space: "O(n * 30)",
    trap: "Answering queries in input order with a growing trie mixes up limits: sort and remember original positions.",
    code: `class Solution:
    def maximizeXor(self, nums, queries):
        nums.sort()
        children = [[0, 0]]
        def insert(x):
            node = 0
            for i in range(29, -1, -1):
                b = (x >> i) & 1
                if not children[node][b]:
                    children[node][b] = len(children)
                    children.append([0, 0])
                node = children[node][b]
        res = [-1] * len(queries)
        p = 0
        for qi in sorted(range(len(queries)), key=lambda i: queries[i][1]):
            x, m = queries[qi]
            while p < len(nums) and nums[p] <= m:
                insert(nums[p])
                p += 1
            if p == 0:
                continue
            node, cur = 0, 0
            for i in range(29, -1, -1):
                b = (x >> i) & 1
                if children[node][1 - b]:
                    cur |= 1 << i
                    node = children[node][1 - b]
                else:
                    node = children[node][b]
            res[qi] = cur
        return res`
  },
  {
    num: 212, title: "Word Search II", slug: "word-search-ii", lc: "Hard",
    topic: "tries",
    pattern: "Trie + DFS / branching search",
    level: 5,
    order: 200,
    core: true,
    teaches: "Move on the grid and in the trie at the same time; the trie prunes paths that cannot become any word.",
    learn: ["dsa_tries", "dsa-tri-problems"],
    pre: [211, 79],
    hints: ["Searching each word separately repeats the same grid walks. Can one DFS look for all words at once?", "Put all words in a trie. Start a DFS at each cell, stepping into the trie child for that letter; stop when the child is missing.", "Store the word at its end node, record it when reached and delete it so it is reported once; prune empty trie branches."],
    steps: ["Build a trie; end node holds the word.", "dfs(r, c, parent): ch = board[r][c]; node = parent[ch]; if node has a word: record it, remove it.", "Mark the cell, recurse to 4 neighbours whose letter is in node, unmark.", "If node is now empty, delete parent[ch] (pruning)."],
    time: "O(R * C * 4 * 3^(L-1))", space: "O(total letters)",
    trap: "Without removing found words you report duplicates; without pruning, big inputs time out.",
    code: `class Solution:
    def findWords(self, board, words):
        root = {}
        for w in words:
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["$"] = w
        R, C = len(board), len(board[0])
        res = []

        def dfs(r, c, parent):
            ch = board[r][c]
            node = parent[ch]
            if "$" in node:
                res.append(node.pop("$"))
            board[r][c] = "#"
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < R and 0 <= nc < C and board[nr][nc] in node:
                    dfs(nr, nc, node)
            board[r][c] = ch
            if not node:
                parent.pop(ch)

        for r in range(R):
            for c in range(C):
                if board[r][c] in root:
                    dfs(r, c, root)
        return res`
  },
  {
    num: 472, title: "Concatenated Words", slug: "concatenated-words", lc: "Hard",
    topic: "tries",
    pattern: "Trie + DFS / branching search",
    level: 5,
    order: 210,
    core: false,
    teaches: "Word break with a trie: from each reachable position, walk the trie to find every word that starts there.",
    learn: ["dsa_tries", "dsa-tri-problems"],
    pre: [208, 139],
    hints: ["A concatenated word splits into at least two words from the list. Which DP does that remind you of?", "Word Break: ok[i] means word[:i] can be split. A trie lists every dictionary word starting at i in one walk.", "Exclude the split that uses the whole word as a single piece."],
    steps: ["Insert all words.", "For each word: ok = [True] + [False] * n.", "For each i with ok[i]: walk the trie from word[i]; at each end node j (not i == 0 and j == n - 1) set ok[j + 1] = True.", "Keep the word if ok[n]."],
    time: "O(sum of L^2)", space: "O(total letters)",
    trap: "Without excluding the whole-word split, every word counts as concatenated (of itself).",
    code: `class Solution:
    def findAllConcatenatedWordsInADict(self, words):
        root = {}
        for w in words:
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["$"] = True
        res = []
        for w in words:
            n = len(w)
            ok = [True] + [False] * n
            for i in range(n):
                if not ok[i]:
                    continue
                node = root
                for j in range(i, n):
                    node = node.get(w[j])
                    if node is None:
                        break
                    if "$" in node and not (i == 0 and j == n - 1):
                        ok[j + 1] = True
            if ok[n]:
                res.append(w)
        return res`
  },
  {
    num: 2935, title: "Maximum Strong Pair XOR II", slug: "maximum-strong-pair-xor-ii", lc: "Hard",
    topic: "tries",
    pattern: "Binary (XOR) trie",
    level: 5,
    order: 220,
    core: false,
    teaches: "Sliding window over sorted numbers plus a binary trie with counts, so numbers can be removed.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [1707],
    hints: ["With x <= y, the pair is strong when y <= 2x. If you sort, which partners are valid for y?", "A window of earlier numbers x with 2x >= y. As y grows, numbers leave the window from the left.", "Use a trie whose nodes count how many numbers pass through; removal decrements the counts. Only follow children with count > 0."],
    steps: ["Sort nums; l = 0.", "For each y: insert y; while 2 * nums[l] < y: remove nums[l]; l += 1.", "Query the max XOR of y against the trie (only through nodes with count > 0)."],
    time: "O(n log n + n * 20)", space: "O(n * 20)",
    trap: "Removing without counts would cut paths still used by other numbers in the window.",
    code: `class Solution:
    def maximumStrongPairXor(self, nums):
        nums.sort()
        B = 20
        children, cnt = [[0, 0]], [0]
        def update(x, d):
            node = 0
            for i in range(B - 1, -1, -1):
                b = (x >> i) & 1
                if not children[node][b]:
                    children[node][b] = len(children)
                    children.append([0, 0])
                    cnt.append(0)
                node = children[node][b]
                cnt[node] += d
        def query(x):
            node, cur = 0, 0
            for i in range(B - 1, -1, -1):
                b = (x >> i) & 1
                c = children[node][1 - b]
                if c and cnt[c] > 0:
                    cur |= 1 << i
                    node = c
                else:
                    node = children[node][b]
            return cur
        best, l = 0, 0
        for y in nums:
            update(y, 1)
            while 2 * nums[l] < y:
                update(nums[l], -1)
                l += 1
            best = max(best, query(y))
        return best`
  },
  {
    num: 1803, title: "Count Pairs With XOR in a Range", slug: "count-pairs-with-xor-in-a-range", lc: "Hard",
    topic: "tries",
    pattern: "Binary (XOR) trie",
    level: 5,
    order: 230,
    core: false,
    teaches: "Count pairs with XOR below a limit by walking the trie along the limit's bits, adding whole subtrees where XOR is already smaller.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [421],
    hints: ["Turn 'low <= xor <= high' into two easier counts: pairs with xor < high + 1 minus pairs with xor < low.", "For count(x, lim): walk bits from high to low. Where lim has bit 1, every number whose XOR bit with x is 0 is already smaller: add that child's count.", "Then continue along the child that makes the XOR bit equal to lim's bit. Insert each number after querying it."],
    steps: ["Trie nodes with counts.", "For each x: ans += below(x, high + 1) - below(x, low); then insert x.", "below(x, lim): node = root; for bit i: b = x bit, l = lim bit; if l == 1: add cnt of child b, go to child 1 - b; else go to child b; stop if missing."],
    time: "O(n * 15)", space: "O(n * 15)",
    trap: "Querying before inserting the current number avoids counting a pair (i, i) or counting pairs twice.",
    code: `class Solution:
    def countPairs(self, nums, low, high):
        B = 15
        children, cnt = [[0, 0]], [0]
        def insert(x):
            node = 0
            for i in range(B - 1, -1, -1):
                b = (x >> i) & 1
                if not children[node][b]:
                    children[node][b] = len(children)
                    children.append([0, 0])
                    cnt.append(0)
                node = children[node][b]
                cnt[node] += 1
        def below(x, lim):
            node, total = 0, 0
            for i in range(B - 1, -1, -1):
                b, l = (x >> i) & 1, (lim >> i) & 1
                if l:
                    if children[node][b]:
                        total += cnt[children[node][b]]
                    node = children[node][1 - b]
                else:
                    node = children[node][b]
                if not node:
                    break
            return total
        ans = 0
        for x in nums:
            ans += below(x, high + 1) - below(x, low)
            insert(x)
        return ans`
  },
  {
    num: 336, title: "Palindrome Pairs", slug: "palindrome-pairs", lc: "Hard",
    topic: "tries",
    pattern: "Trie + DFS / branching search",
    level: 6,
    order: 240,
    core: false,
    teaches: "Trie of reversed words where each node also lists words whose remaining part is a palindrome.",
    learn: ["dsa_tries", "dsa-tri-problems"],
    pre: [1032, 820],
    hints: ["words[i] + words[j] is a palindrome when words[i] starts with reverse(words[j]) and the rest is a palindrome, or the other way round.", "Insert every word reversed. At each node on the way, record the word's index if the part of the word not yet consumed is a palindrome.", "Walk each word i: at a node that ends word j, check the rest of word i is a palindrome; after a full walk, every index in that node's palindrome list pairs with i."],
    steps: ["Insert word j reversed: before consuming each char, if w[:len-k] is a palindrome add j to node.pals; at the end set node.word = j and add j to node.pals.", "For word i: walk its chars k; if node.word = j != i and w[k:] is a palindrome, add (i, j).", "If the walk consumes all of word i, add (i, j) for each j in node.pals with j != i."],
    time: "O(n * L^2)", space: "O(n * L^2)",
    trap: "The empty string pairs with every palindrome, in both orders; make sure your checks cover it.",
    code: `class Solution:
    def palindromePairs(self, words):
        def is_pal(s, i, j):
            while i < j:
                if s[i] != s[j]:
                    return False
                i += 1
                j -= 1
            return True
        root = {"word": -1, "pals": []}
        for j, w in enumerate(words):
            node = root
            for k in range(len(w) - 1, -1, -1):
                if is_pal(w, 0, k):
                    node["pals"].append(j)
                node = node.setdefault(w[k], {"word": -1, "pals": []})
            node["word"] = j
            node["pals"].append(j)
        res = []
        for i, w in enumerate(words):
            node = root
            for k, ch in enumerate(w):
                if node["word"] >= 0 and node["word"] != i and is_pal(w, k, len(w) - 1):
                    res.append([i, node["word"]])
                node = node.get(ch)
                if node is None:
                    break
            else:
                for j in node["pals"]:
                    if j != i:
                        res.append([i, j])
        return res`
  },
  {
    num: 1938, title: "Maximum Genetic Difference Query", slug: "maximum-genetic-difference-query", lc: "Hard",
    topic: "tries",
    pattern: "Binary (XOR) trie",
    level: 6,
    order: 250,
    core: false,
    teaches: "DFS the tree while keeping exactly the root-to-node values in a counted binary trie; answer queries at their node.",
    learn: ["dsa_tries", "dsa-tri-patterns"],
    pre: [2935],
    hints: ["A query at node v may only use values on the path from the root to v. Which traversal keeps exactly that set?", "DFS: insert v's value when you enter, remove it when you leave. A trie with counts supports both.", "Group queries by node; at each node answer its queries with the max-XOR walk. Use an iterative DFS for deep trees."],
    steps: ["Build children lists from parents; group queries by node.", "Iterative DFS with enter/exit events: on enter, insert v (count + 1) and answer its queries; on exit, remove v (count - 1).", "Max-XOR walk only through children with count > 0."],
    time: "O((n + q) * 18)", space: "O(n * 18 + q)",
    trap: "Recursive DFS on a path-shaped tree of 10^5 nodes overflows Python's recursion limit.",
    code: `class Solution:
    def maxGeneticDifference(self, parents, queries):
        n = len(parents)
        kids = [[] for _ in range(n)]
        root = 0
        for v, p in enumerate(parents):
            if p == -1:
                root = v
            else:
                kids[p].append(v)
        byNode = [[] for _ in range(n)]
        for qi, (node, val) in enumerate(queries):
            byNode[node].append((qi, val))
        B = 18
        children, cnt = [[0, 0]], [0]
        def update(x, d):
            node = 0
            for i in range(B - 1, -1, -1):
                b = (x >> i) & 1
                if not children[node][b]:
                    children[node][b] = len(children)
                    children.append([0, 0])
                    cnt.append(0)
                node = children[node][b]
                cnt[node] += d
        def query(x):
            node, cur = 0, 0
            for i in range(B - 1, -1, -1):
                b = (x >> i) & 1
                c = children[node][1 - b]
                if c and cnt[c] > 0:
                    cur |= 1 << i
                    node = c
                else:
                    node = children[node][b]
            return cur
        res = [0] * len(queries)
        stack = [(root, False)]
        while stack:
            v, leaving = stack.pop()
            if leaving:
                update(v, -1)
                continue
            update(v, 1)
            for qi, val in byNode[v]:
                res[qi] = query(val)
            stack.append((v, True))
            for c in kids[v]:
                stack.append((c, False))
        return res`
  }
);
