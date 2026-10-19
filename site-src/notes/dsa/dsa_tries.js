// notes/dsa/dsa_tries.js — Tries
Object.assign(TOPIC_CONTENT, {
  "dsa_tries": `<main>
  <h1>Tries</h1>
  <p class="lead">A trie (say "try") is a tree of letters. Words that start the same share the same path, so "which words start with <em>am</em>?" is answered by walking two steps, not by scanning every word. It powers autocomplete, spell-check and word-grid puzzles. Builds on trees, dicts and DFS.</p>

  <h2 id="dsa-tri-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Tries</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea</div>
        <ul>
          <li><b>Prefix tree</b> — one node per prefix; each edge is one letter</li>
          <li><b>Shared starts</b> — "car", "cart", "cat" share the path c → a</li>
          <li><b>Root</b> — empty prefix "" · <b>end flag</b> — "a whole word stops here"</li>
          <li>💡 Phone contacts: type "am", see Aman, Amit, Amma</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Node</div>
        <ul>
          <li><code>children = {}</code> letter → node</li>
          <li><code>end = False</code> marks a complete word</li>
          <li>Extras: <code>passing</code> count, <code>freq</code>, the word itself, a top-3 list</li>
          <li>Array of 26 instead of dict: faster, more memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Operations (L = word length)</div>
        <ul>
          <li><b>insert</b> — walk, create missing nodes, set end: O(L)</li>
          <li><b>search</b> — walk, then check <code>end</code>: O(L)</li>
          <li><b>startsWith</b> — walk only: O(L)</li>
          <li><b>delete</b> — unset end, prune unused branch: O(L)</li>
          <li><b>autocomplete</b> — walk to prefix, DFS below: O(L + output)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">vs hash set</div>
        <ul>
          <li>Set: exact lookup O(L) too, but prefix query = scan all words</li>
          <li>Trie: prefix queries, sorted listing, shared storage</li>
          <li>⚠ Each node is a Python object + dict: heavy memory</li>
          <li>Sorted list + <code>bisect</code> often enough in Python</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Signal words</b> — "prefix", "starts with", "autocomplete", "dictionary of words", "wildcard"</li>
          <li><b>Many words on a grid</b> — trie + DFS (Word Search II)</li>
          <li><b>Shortest prefix match</b> — stop at first end flag (Replace Words)</li>
          <li><b>Wildcard '.'</b> — branch into every child</li>
          <li><b>Bitwise trie</b> — bits as letters, for max XOR</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Implement Trie</b> (208), <b>Add &amp; Search Word</b> (211)</li>
          <li><b>Word Search II</b> (212) — prune found words</li>
          <li><b>Replace Words</b> (648), <b>Longest Common Prefix</b> (14)</li>
          <li><b>Search Suggestions System</b> (1268) — top 3 per node</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-tri-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Phone Contacts</span><span class="rm-sub">Why "starts with" is slow on a list</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-idea"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Prefix Tree Idea</span><span class="rm-sub">Letters on edges, shared starts</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-impl"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Build One From Scratch</span><span class="rm-sub">insert, search, startsWith</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-cost"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Trie vs Hash Set</span><span class="rm-sub">Big-O and the memory bill</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-more"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Delete, Count, Suggest</span><span class="rm-sub">A real phone-book trie</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-python"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Pythonic Way</span><span class="rm-sub">Nested dicts, defaultdict, bisect</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-patterns"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-problems"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">6 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">End flag, empty string, memory</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-tri-need"><span class="num">01</span>Phone Contacts</h2>
  <p>Open the dialer on your phone and type <strong>a</strong>, then <strong>m</strong>. Before you finish, it shows Aman, Amit, Amma. It does this instantly even with 2,000 contacts, and again after every key you press.</p>
  <p>What would plain Python do? Keep the names in a list (or a set) and check every one:</p>
  <div class="fx" data-lang="py">contacts = ["amma", "aman", "amit", "anil", "papa", "priya"]

def starts_with_scan(words, prefix):     # what a list or set forces you to do
    return [w for w in words if w.startswith(prefix)]

print(starts_with_scan(contacts, "am"))
print(starts_with_scan(contacts, "p"), starts_with_scan(contacts, "z"))</div>
  <div class="fx" data-lang="text">['amma', 'aman', 'amit']
['papa', 'priya'] []</div>
  <p>Correct, but every key press scans all N names, and each check compares up to L letters: O(N·L) per key. A hash set does not help: it can answer "is <em>aman</em> stored?" in one step, but it has no idea which stored words <em>begin</em> with "am", because hashing scatters similar words randomly.</p>
  <p>The need: a structure where words that start the same are stored <strong>together</strong>, so that going from "a" to "am" narrows the search instead of restarting it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A printed dictionary with thumb tabs. You don't read every page to find words starting with "am". You open the "A" tab, then flip to where "am" begins, and every word you want is right there, together. A trie is that tab system, one tab per letter, at every depth.</p>
  </div>

  <h2 id="dsa-tri-idea"><span class="num">02</span>The Prefix Tree Idea</h2>
  <p>Store words as paths in a tree. The root means "nothing typed yet". Each edge is one letter. Walking down c → a → r spells "car". Words with the same start share the same first steps, so "car", "cart" and "cat" all use the c → a part once.</p>
  <figure class="viz"><svg viewBox="0 0 600 285" width="600"><line x1="300" y1="30" x2="220" y2="85" stroke="currentColor"/><line x1="300" y1="30" x2="400" y2="85" stroke="currentColor"/><line x1="220" y1="85" x2="220" y2="140" stroke="currentColor"/><line x1="220" y1="140" x2="170" y2="195" stroke="currentColor"/><line x1="220" y1="140" x2="270" y2="195" stroke="currentColor"/><line x1="270" y1="195" x2="270" y2="250" stroke="currentColor"/><line x1="400" y1="85" x2="400" y2="140" stroke="currentColor"/><line x1="400" y1="140" x2="400" y2="195" stroke="currentColor"/><circle cx="300" cy="30" r="16" class="fs sb"/><text x="300" y="34" text-anchor="middle">·</text><circle cx="220" cy="85" r="16" class="fb sb"/><text x="220" y="89" text-anchor="middle">c</text><circle cx="400" cy="85" r="16" class="fb sb"/><text x="400" y="89" text-anchor="middle">d</text><circle cx="220" cy="140" r="16" class="fb sb"/><text x="220" y="144" text-anchor="middle">a</text><circle cx="170" cy="195" r="16" class="fg sg"/><text x="170" y="199" text-anchor="middle">t</text><circle cx="270" cy="195" r="16" class="fg sg"/><text x="270" y="199" text-anchor="middle">r</text><circle cx="270" cy="250" r="16" class="fg sg"/><text x="270" y="254" text-anchor="middle">t</text><circle cx="400" cy="140" r="16" class="fb sb"/><text x="400" y="144" text-anchor="middle">o</text><circle cx="400" cy="195" r="16" class="fg sg"/><text x="400" y="199" text-anchor="middle">g</text><text x="322" y="34" class="tm">root = "" (empty prefix)</text><text x="200" y="117" text-anchor="end" class="tb">"ca" shared by 3 words</text><text x="170" y="230" text-anchor="middle" class="tg">cat</text><text x="292" y="199" class="tg">car</text><text x="292" y="254" class="tg">cart</text><text x="422" y="199" class="tg">dog</text><text x="440" y="250" text-anchor="middle" class="tm">green = end flag True</text></svg><figcaption>The trie for cat, car, cart, dog. 13 letters in the words, but only 8 letter nodes, because shared starts (c, a, r) are stored once. Green nodes are where a whole word ends; "car" ends in the middle of the path to "cart".</figcaption></figure>
  <p>Two things to notice:</p>
  <ul>
    <li>Every node stands for a <strong>prefix</strong>: the letters on the path from the root to it. The node under c → a means "ca".</li>
    <li>Reaching a node does not mean a word exists. "ca" is a node, but nobody stored "ca". So each node carries an <strong>end flag</strong>: True only where a stored word finishes. "car" needs it because the path keeps going to "cart".</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Trie</strong> (from re<em>trie</em>val): a tree where each edge holds one character, each node represents the prefix spelled from the root, and a flag marks nodes where a complete key ends. Also called a <strong>prefix tree</strong>.</p>
  </div>

  <h2 id="dsa-tri-impl"><span class="num">03</span>Build One From Scratch</h2>
  <p>A node needs two things: its children (letter → next node), and the end flag. A Python dict is the natural fit for children: only letters that are actually used take space.</p>
  <ul>
    <li><strong>insert(word)</strong>: start at the root. For each letter, go to that child, creating it if missing. At the last node, set <code>end = True</code>.</li>
    <li><strong>search(word)</strong>: walk the letters. Fall off (missing child) → False. Reach the end → return the end flag.</li>
    <li><strong>startsWith(prefix)</strong>: same walk, but reaching the end is enough. The flag does not matter.</li>
  </ul>
  <div class="fx" data-lang="py">class TrieNode:
    def __init__(self):
        self.children = {}      # letter -&gt; TrieNode
        self.end = False        # True if a whole word stops here

class Trie:
    def __init__(self):
        self.root = TrieNode()  # empty node: stands for the empty prefix ""

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()   # make the missing step
            node = node.children[ch]             # walk down one letter
        node.end = True                          # mark: a word ends here

    def _walk(self, s):         # follow s letter by letter; None if we fall off
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):     # whole word stored?
        node = self._walk(word)
        return node is not None and node.end

    def startsWith(self, prefix):   # any word begins with prefix?
        return self._walk(prefix) is not None

t = Trie()
for w in ["cat", "car", "cart", "dog"]:
    t.insert(w)
print(t.search("car"), t.search("ca"), t.startsWith("ca"), t.startsWith("cow"))
print(t.search("cart"), t.search("carts"), t.startsWith(""), t.search(""))</div>
  <div class="fx" data-lang="text">True False True False
True False True False</div>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600"><text x="100" y="18" text-anchor="middle" class="tb">search("car")</text><text x="300" y="18" text-anchor="middle" class="tb">search("ca")</text><text x="500" y="18" text-anchor="middle" class="tb">search("cow")</text><line x1="100" y1="45" x2="100" y2="210" stroke="currentColor"/><circle cx="100" cy="45" r="15" class="fs sb"/><text x="100" y="49" text-anchor="middle">·</text><circle cx="100" cy="100" r="15" class="fb sb"/><text x="100" y="104" text-anchor="middle">c</text><circle cx="100" cy="155" r="15" class="fb sb"/><text x="100" y="159" text-anchor="middle">a</text><circle cx="100" cy="210" r="15" class="fg sg"/><text x="100" y="214" text-anchor="middle">r</text><text x="122" y="214" class="tg">end = True</text><text x="100" y="252" text-anchor="middle" class="tg">→ True</text><line x1="300" y1="45" x2="300" y2="155" stroke="currentColor"/><circle cx="300" cy="45" r="15" class="fs sb"/><text x="300" y="49" text-anchor="middle">·</text><circle cx="300" cy="100" r="15" class="fb sb"/><text x="300" y="104" text-anchor="middle">c</text><circle cx="300" cy="155" r="15" class="fr sr"/><text x="300" y="159" text-anchor="middle">a</text><text x="322" y="159" class="tr">end = False</text><text x="300" y="232" text-anchor="middle" class="tr">search → False</text><text x="300" y="252" text-anchor="middle" class="tg">startsWith → True</text><line x1="500" y1="45" x2="500" y2="100" stroke="currentColor"/><line x1="500" y1="100" x2="500" y2="155" class="sr" stroke-dasharray="4 3"/><circle cx="500" cy="45" r="15" class="fs sb"/><text x="500" y="49" text-anchor="middle">·</text><circle cx="500" cy="100" r="15" class="fb sb"/><text x="500" y="104" text-anchor="middle">c</text><circle cx="500" cy="155" r="15" fill="none" class="sr" stroke-dasharray="4 3"/><text x="500" y="159" text-anchor="middle" class="tr">o?</text><text x="522" y="159" class="tr">missing</text><text x="500" y="252" text-anchor="middle" class="tr">fell off → False</text></svg><figcaption>Three walks in the cat/car/cart/dog trie. A word is found only if the walk finishes AND the last node has the end flag. startsWith only needs the walk to finish.</figcaption></figure>
  <p>The second print line shows edge cases: "carts" falls off after "cart"; <code>startsWith("")</code> is True because the root always exists; <code>search("")</code> is False because nobody inserted the empty word.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing <code>search</code> as "return True if the walk finishes" makes <code>search("ca")</code> True. That is <code>startsWith</code>, not <code>search</code>. The end flag is the whole difference between the two.</p>
  </div>

  <h2 id="dsa-tri-cost"><span class="num">04</span>Trie vs Hash Set</h2>
  <p>L is the length of the word or prefix you ask about, N the number of stored words. Note that a trie's cost does not depend on N at all: finding "aman" among 10 names or 10 crore names is the same four steps.</p>
  <table class="tbl">
    <tr><th>Question</th><th>Python set</th><th>Sorted list + bisect</th><th>Trie</th></tr>
    <tr><td>Add a word</td><td>O(L) to hash it</td><td>O(N) shift</td><td>O(L)</td></tr>
    <tr><td>Is this exact word stored?</td><td>O(L)</td><td>O(L log N)</td><td>O(L)</td></tr>
    <tr><td>Does any word start with p?</td><td>O(N·L) scan</td><td>O(L log N)</td><td><strong>O(L)</strong></td></tr>
    <tr><td>List all k words starting with p</td><td>O(N·L) scan</td><td>O(L log N + output)</td><td>O(L + size of that subtree)</td></tr>
    <tr><td>Words in sorted order</td><td>O(N log N) sort</td><td>already sorted</td><td>DFS, children in order</td></tr>
    <tr><td>Shortest stored prefix of a word</td><td>try every prefix: O(L²)</td><td>awkward</td><td><strong>O(L)</strong>, stop at the first end flag</td></tr>
    <tr><td>Memory</td><td>the words</td><td>the words</td><td>one object per distinct prefix</td></tr>
  </table>
  <h3>The memory bill</h3>
  <p>Sharing prefixes saves letters:</p>
  <div class="fx" data-lang="py">def count_nodes(node):
    return 1 + sum(count_nodes(c) for c in node.children.values())

words = ["interview", "internet", "internal", "interval", "intern", "into"]
t = Trie()
for w in words:
    t.insert(w)
print("letters typed :", sum(len(w) for w in words))
print("trie nodes    :", count_nodes(t.root) - 1)    # minus the empty root</div>
  <div class="fx" data-lang="text">letters typed : 43
trie nodes    : 17</div>
  <p>43 letters became 17 nodes. Sounds like a win, but in Python each node is an object plus a dict, roughly 150–300 bytes, while a letter inside a string costs 1 byte. So a Python trie usually uses <strong>more</strong> memory than the plain word list, often 10× or more. Words with few shared starts (random IDs) make it worse.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Choose a trie for its <em>queries</em> (prefix search, shortest/longest prefix match, walking letter by letter with backtracking), not to save memory. If you only need exact lookups, a set is simpler and lighter. Ways to shrink a trie: <code>__slots__</code> on the node class, a 26-slot array instead of a dict (fast but wasteful when sparse), or a <strong>compressed trie (radix tree)</strong> that stores a run like "erview" on one edge.</p>
  </div>

  <h2 id="dsa-tri-more"><span class="num">05</span>Delete, Count, Suggest</h2>
  <p>A real phone book needs more than search. Each extra feature is a small field on the node:</p>
  <ul>
    <li><strong>Count words with a prefix</strong>: every node keeps <code>passing</code>, the number of stored words whose path goes through it. Increase it on insert. The answer is the prefix node's count, O(L).</li>
    <li><strong>Delete</strong>: walk down decreasing <code>passing</code>. If a child's count drops to 0, no other word needs that branch: cut it off and stop. If the walk finishes, the word was a prefix of others ("car" inside "cart"), so only unset its end flag.</li>
    <li><strong>Autocomplete</strong>: walk to the prefix node, then DFS below it, collecting every node with the end flag. Visiting children in sorted order gives alphabetical results.</li>
    <li><strong>Top suggestions</strong>: store a frequency (calls made) at word ends and pick the best k.</li>
  </ul>
  <div class="fx" data-lang="py">import heapq

class Node:
    def __init__(self):
        self.children = {}
        self.end = False
        self.passing = 0         # how many stored words go through this node
        self.freq = 0            # e.g. how often this contact is called

class PhoneBook:
    def __init__(self):
        self.root = Node()

    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def insert(self, word, freq=0):
        node = self._walk(word)
        if node and node.end:                    # already stored: just update
            node.freq = freq
            return
        node = self.root
        node.passing += 1
        for ch in word:
            node = node.children.setdefault(ch, Node())
            node.passing += 1
        node.end, node.freq = True, freq

    def count_prefix(self, prefix):              # how many words start with prefix
        node = self._walk(prefix)
        return node.passing if node else 0

    def delete(self, word):
        node = self._walk(word)
        if node is None or not node.end:
            return False
        node = self.root
        node.passing -= 1
        for ch in word:
            child = node.children[ch]
            child.passing -= 1
            if child.passing == 0:               # no other word uses this branch
                del node.children[ch]            # cut it off in one go
                return True
            node = child
        node.end = False                         # word was a prefix of others
        return True

    def autocomplete(self, prefix):              # all words, alphabetical
        out = []
        def dfs(node, path):
            if node.end:
                out.append(path)
            for ch in sorted(node.children):
                dfs(node.children[ch], path + ch)
        start = self._walk(prefix)
        if start:
            dfs(start, prefix)
        return out

    def top(self, prefix, k):                    # k most-called, ties by name
        return heapq.nsmallest(k, self.autocomplete(prefix),
                               key=lambda w: (-self._walk(w).freq, w))

pb = PhoneBook()
for name, calls in [("amma", 90), ("aman", 40), ("amit", 40), ("anil", 5), ("ambika", 12), ("papa", 70)]:
    pb.insert(name, calls)
print(pb.autocomplete("am"), pb.count_prefix("am"), pb.count_prefix("a"))
print(pb.top("am", 2), pb.top("a", 3))
print(pb.delete("amit"), pb.delete("amit"), pb.autocomplete("am"), pb.count_prefix("am"))
print(pb.delete("am"), pb.autocomplete("p"), pb.count_prefix(""))</div>
  <div class="fx" data-lang="text">['aman', 'ambika', 'amit', 'amma'] 4 5
['amma', 'aman'] ['amma', 'aman', 'amit']
True False ['aman', 'ambika', 'amma'] 3
False ['papa'] 5</div>
  <p>Reading the output: "am" matches 4 names, "a" 5. Amma (90 calls) comes first; Aman and Amit tie at 40, and the tie goes alphabetically. Deleting "amit" twice gives True then False. Deleting "am" is False because it was never a word, only a prefix. The root's count is the total number of words.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Inserting the same word twice. Without the "already stored" check, <code>passing</code> counts go up twice and delete leaves a ghost count behind. Decide: either ignore duplicates (as here) or keep a per-word counter at the end node.</p>
  </div>
  <p><code>top</code> above collects every match and then picks k: fine for a phone book. Search engines with millions of words store the best k words <strong>in every node</strong> instead, so a key press costs O(L) no matter how many words match. That is exactly problem 6 below.</p>

  <h2 id="dsa-tri-python"><span class="num">06</span>The Pythonic Way</h2>
  <p>Python has no trie in the standard library. In interviews, many people skip the node class and use nested dicts directly. Same structure, less code:</p>
  <div class="fx" data-lang="py">import bisect
from collections import defaultdict

# 1. dict of dicts: the whole trie is nested dicts, "$" marks a word end
def make_trie(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})   # get the child, creating it if missing
        node["$"] = w                        # store the word itself at its end
    return root

trie = make_trie(["cat", "car", "dog"])
print(trie)

# 2. self-building trie: every missing key creates a new level automatically
Tree = lambda: defaultdict(Tree)
t = Tree()
for w in ["cat", "car"]:
    node = t
    for ch in w:
        node = node[ch]
    node["$"] = True
print(list(t["c"]["a"]), "x" in t["c"])

# 3. no trie at all: sorted list + bisect finds the prefix block in O(log n)
words = sorted(["amma", "aman", "amit", "anil", "papa", "ambika"])
def with_prefix(prefix):
    i = bisect.bisect_left(words, prefix)          # first word &gt;= prefix
    out = []
    while i &lt; len(words) and words[i].startswith(prefix):
        out.append(words[i])
        i += 1
    return out
print(words, with_prefix("am"), with_prefix("q"))</div>
  <div class="fx" data-lang="text">{'c': {'a': {'t': {'$': 'cat'}, 'r': {'$': 'car'}}}, 'd': {'o': {'g': {'$': 'dog'}}}}
['t', 'r'] False
['aman', 'ambika', 'amit', 'amma', 'anil', 'papa'] ['aman', 'ambika', 'amit', 'amma'] []</div>
  <div class="cards">
    <div><b>Nested dicts</b><p><code>node = node.setdefault(ch, {})</code> is the whole insert loop. A special key like <code>"$"</code> is the end flag and can hold the word.</p><small>Pick a key that can't be a letter</small></div>
    <div><b>defaultdict trie</b><p>One line, and children appear by themselves.</p><small>⚠ Even reading <code>t["x"]</code> creates a node; test with <code>in</code></small></div>
    <div><b>sorted + bisect</b><p>All words with a prefix sit in one block of a sorted list. <code>bisect_left</code> finds its start in O(log N).</p><small>Best when the word list doesn't change</small></div>
  </div>
  <p>Practical rule: for a static list and simple prefix lookups, sort + <code>bisect</code> is shortest and uses least memory. Reach for a trie when you walk letter by letter and need to stop or branch at each step (wildcards, grids, shortest-root match).</p>

  <h2 id="dsa-tri-patterns"><span class="num">07</span>Patterns</h2>
  <table class="tbl">
    <tr><th>Signal words</th><th>Pattern</th><th>Shape of the code</th></tr>
    <tr><td>"prefix", "starts with", "autocomplete", "type-ahead"</td><td><strong>Walk then collect</strong></td><td>Walk to prefix node; DFS for ends, or read a stored top-k list</td></tr>
    <tr><td>"find all words from a list in a grid / string"</td><td><strong>Trie + DFS together</strong></td><td>Move on the grid and in the trie at the same time; stop when the trie has no child</td></tr>
    <tr><td>"wildcard", "." matches any letter</td><td><strong>Branching search</strong></td><td>On "." loop over all children; otherwise follow one</td></tr>
    <tr><td>"shortest root", "replace with prefix", "is any word a prefix of"</td><td><strong>First end on the path</strong></td><td>Walk the word; return at the first end flag</td></tr>
    <tr><td>"longest common prefix", "longest word built one letter at a time"</td><td><strong>Single-path walk</strong></td><td>Walk while there is exactly one child (and no end)</td></tr>
    <tr><td>"maximum XOR of two numbers"</td><td><strong>Bitwise trie</strong></td><td>Insert numbers as 32 bits; for each, greedily take the opposite bit</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 255" width="600"><text x="300" y="16" text-anchor="middle" class="tb">search(".ad") in a trie of bad, dad, mad</text><line x1="300" y1="40" x2="180" y2="95" class="sg" stroke-width="2"/><line x1="300" y1="40" x2="300" y2="95" class="sg" stroke-width="2"/><line x1="300" y1="40" x2="420" y2="95" class="sg" stroke-width="2"/><line x1="180" y1="95" x2="180" y2="150" stroke="currentColor"/><line x1="300" y1="95" x2="300" y2="150" stroke="currentColor"/><line x1="420" y1="95" x2="420" y2="150" stroke="currentColor"/><line x1="180" y1="150" x2="180" y2="205" stroke="currentColor"/><line x1="300" y1="150" x2="300" y2="205" stroke="currentColor"/><line x1="420" y1="150" x2="420" y2="205" stroke="currentColor"/><circle cx="300" cy="40" r="15" class="fs sb"/><text x="300" y="44" text-anchor="middle">·</text><circle cx="180" cy="95" r="15" class="fb sb"/><text x="180" y="99" text-anchor="middle">b</text><circle cx="300" cy="95" r="15" class="fb sb"/><text x="300" y="99" text-anchor="middle">d</text><circle cx="420" cy="95" r="15" class="fb sb"/><text x="420" y="99" text-anchor="middle">m</text><circle cx="180" cy="150" r="15" class="fb sb"/><text x="180" y="154" text-anchor="middle">a</text><circle cx="300" cy="150" r="15" class="fb sb"/><text x="300" y="154" text-anchor="middle">a</text><circle cx="420" cy="150" r="15" class="fb sb"/><text x="420" y="154" text-anchor="middle">a</text><circle cx="180" cy="205" r="15" class="fg sg"/><text x="180" y="209" text-anchor="middle">d</text><circle cx="300" cy="205" r="15" class="fg sg"/><text x="300" y="209" text-anchor="middle">d</text><circle cx="420" cy="205" r="15" class="fg sg"/><text x="420" y="209" text-anchor="middle">d</text><text x="20" y="72" class="tg">"." → try all</text><text x="20" y="154" class="tm">"a" → one child</text><text x="20" y="209" class="tm">"d" → end?</text><text x="445" y="209" class="tg">yes → True</text><text x="300" y="245" text-anchor="middle" class="tm">the first branch that succeeds stops the search (any() short-circuits)</text></svg><figcaption>A wildcard turns the single walk into a small DFS. Each "." multiplies the paths to try by the number of children, so many dots on a big trie get slow.</figcaption></figure>

  <h2 id="dsa-tri-problems"><span class="num">08</span>Classic Problems</h2>
  <h3>1. Implement Trie (LeetCode 208)</h3>
  <p>Exactly the <code>Trie</code> class from section 03. LeetCode calls methods by name from two lists; this driver replays their sample.</p>
  <div class="fx" data-lang="py">ops  = ["Trie", "insert", "search", "search", "startsWith", "insert", "search"]
args = [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]
out = []
for op, a in zip(ops, args):
    if op == "Trie":
        trie = Trie(); out.append(None)
    else:
        out.append(getattr(trie, op)(*a))
print(out)</div>
  <div class="fx" data-lang="text">[None, None, True, False, True, None, True]</div>
  <p>"app" is not found until it is inserted, even though "apple" already passes through its nodes. That is the end flag doing its job. Each operation O(L); space O(total letters).</p>

  <h3>2. Design Add and Search Words (LeetCode 211)</h3>
  <p>Like a trie, but <code>search</code> may contain <code>.</code>, which matches any one letter. Normal letters follow one child; a dot tries every child (the diagram above).</p>
  <div class="fx" data-lang="py">class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.end = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.end
            ch = word[i]
            if ch == ".":                          # any letter: try every child
                return any(dfs(child, i + 1) for child in node.children.values())
            child = node.children.get(ch)
            return child is not None and dfs(child, i + 1)
        return dfs(self.root, 0)

wd = WordDictionary()
for w in ["bad", "dad", "mad"]:
    wd.addWord(w)
print([wd.search(q) for q in ["pad", "bad", ".ad", "b..", "b.", "...", "...."]])</div>
  <div class="fx" data-lang="text">[False, True, True, True, False, True, False]</div>
  <p>addWord O(L). search O(L) with no dots; with dots, the worst case is O(26<sup>d</sup> · L) for d dots, though real tries are sparse. <code>"b."</code> fails because no word of length 2 exists; <code>"...."</code> fails on length 4.</p>

  <h3>3. Word Search II (LeetCode 212)</h3>
  <p>A letter grid and a list of words: return every word that can be traced through neighbouring cells (up, down, left, right), using each cell at most once per word. Running a separate grid search for each word repeats the same work: "oath" and "oat" start the same. Put all words in a trie and run <strong>one</strong> DFS from each cell, moving on the grid and in the trie together. If the trie has no child for the next cell's letter, stop: no word goes that way.</p>
  <div class="fx" data-lang="py">def find_words(board, words):
    root = {}
    for w in words:                                # trie of dicts, "$" = word
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w
    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent[ch]
        if "$" in node:
            found.append(node.pop("$"))            # record once, then forget it
        board[r][c] = "#"                          # mark visited on this path
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 &lt;= nr &lt; rows and 0 &lt;= nc &lt; cols and board[nr][nc] in node:
                dfs(nr, nc, node)
        board[r][c] = ch                           # un-mark (backtrack)
        if not node:                               # branch fully used up:
            parent.pop(ch)                         # prune it from the trie

    for r in range(rows):
        for c in range(cols):
            if board[r][c] in root:
                dfs(r, c, root)
    return found

board = [list("oaan"), list("etae"), list("ihkr"), list("iflv")]
print(sorted(find_words(board, ["oath", "pea", "eat", "rain"])))
print(find_words([list("ab"), list("cd")], ["abdc", "abcd", "ab", "dcba"]))
print(find_words([list("a")], ["a", "aa"]))</div>
  <div class="fx" data-lang="text">['eat', 'oath']
['ab', 'abdc']
['a']</div>
  <p>Three tricks make it fast: the trie stops dead paths early; <code>node.pop("$")</code> records each word once; and removing trie branches that are used up keeps later searches from walking them again. Worst case O(R·C·4·3<sup>L−1</sup>) for longest word L, but pruning makes it far faster in practice. The board is restored by the un-mark step, so the caller's grid is unchanged.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Stopping the DFS when a word is found. "ab" and "abdc" share a path; after recording "ab", keep going. Also: the same word can be traced twice; without removing <code>"$"</code> it appears twice in the result.</p>
  </div>

  <h3>4. Replace Words (LeetCode 648)</h3>
  <p>Given roots like "cat", "bat", replace every word in a sentence by its <strong>shortest</strong> root: "cattle" → "cat". Walk each word in the trie of roots and return at the first end flag. If you fall off first, keep the word.</p>
  <div class="fx" data-lang="py">def replace_words(roots, sentence):
    trie = {}
    for r in roots:
        node = trie
        for ch in r:
            node = node.setdefault(ch, {})
        node["$"] = r
    def shortest_root(word):
        node = trie
        for ch in word:
            if "$" in node:
                return node["$"]               # first (shortest) root on the way
            if ch not in node:
                return word                    # no root matches: keep the word
            node = node[ch]
        return node.get("$", word)
    return " ".join(shortest_root(w) for w in sentence.split())

print(replace_words(["cat", "bat", "rat"], "the cattle was rattled by the battery"))
print(replace_words(["a", "b", "c"], "aadsfasf absbs bbab cadsfafs"))
print(replace_words(["ab", "abc"], "abc ab a"))</div>
  <div class="fx" data-lang="text">the cat was rat by the bat
a a b c
ab ab a</div>
  <p>O(total letters in roots + sentence). The brute force tries every prefix of every word in a set, O(L²) per word because each slice builds a new string. In the last line, "ab" wins over "abc" because the walk meets the shorter one first.</p>

  <h3>5. Longest Common Prefix (LeetCode 14)</h3>
  <p>The longest start shared by every string. In the trie, the common prefix is the path from the root while there is <strong>exactly one child</strong> and no word has ended. Interviewers also accept the direct column scan, which is simpler and uses O(1) extra space.</p>
  <div class="fx" data-lang="py">def lcp_trie(strs):
    if not strs:
        return ""
    t = Trie()
    for s in strs:
        t.insert(s)
    node, prefix = t.root, []
    while len(node.children) == 1 and not node.end:   # one road, no word stops here
        ch, node = next(iter(node.children.items()))
        prefix.append(ch)
    return "".join(prefix)

def lcp_scan(strs):                                   # simpler: compare column by column
    if not strs:
        return ""
    for i, ch in enumerate(strs[0]):
        if any(i == len(s) or s[i] != ch for s in strs[1:]):
            return strs[0][:i]
    return strs[0]

for strs in [["flower", "flow", "flight"], ["dog", "racecar", "car"], ["inter", "interview", "internet"], ["a"], ["", "b"]]:
    print(strs, repr(lcp_trie(strs)), repr(lcp_scan(strs)))</div>
  <div class="fx" data-lang="text">['flower', 'flow', 'flight'] 'fl' 'fl'
['dog', 'racecar', 'car'] '' ''
['inter', 'interview', 'internet'] 'inter' 'inter'
['a'] 'a' 'a'
['', 'b'] '' ''</div>
  <p>Both O(S) for S total characters. The <code>not node.end</code> check matters for <code>["inter", "interview"]</code>: after "inter" a word ends, so the common prefix cannot go further. The trie version shines when many LCP questions are asked about the same word set. Library one-liner: <code>os.path.commonprefix(strs)</code>.</p>

  <h3>6. Search Suggestions System (LeetCode 1268)</h3>
  <p>After each letter typed of <code>search_word</code>, return up to 3 products that start with what has been typed so far, in alphabetical order. Insert products in sorted order and let each node keep the first 3 that pass through it. Then each key press just reads a list.</p>
  <table class="tbl out"><caption>Products: mobile, moneypot, monitor, mouse, mousepad (sorted)</caption>
    <tr><th>typed</th><th>node keeps</th></tr>
    <tr><td>m</td><td>mobile, moneypot, monitor</td></tr>
    <tr><td>mo</td><td>mobile, moneypot, monitor</td></tr>
    <tr><td>mou</td><td>mouse, mousepad</td></tr>
    <tr><td>mous, mouse</td><td>mouse, mousepad</td></tr>
  </table>
  <div class="fx" data-lang="py">def suggested_products(products, search_word):
    root = {}
    for p in sorted(products):                   # sorted, so first 3 seen = best 3
        node = root
        for ch in p:
            node = node.setdefault(ch, {"#": []})
            if len(node["#"]) &lt; 3:
                node["#"].append(p)              # each node keeps its top 3
    out, node = [], root
    for ch in search_word:
        node = node.get(ch, {}) if node else {}  # once we fall off, stay off
        out.append(node.get("#", []) if node else [])
    return out

def suggested_bisect(products, search_word):     # no trie: sort + binary search
    products.sort()
    out, prefix = [], ""
    for ch in search_word:
        prefix += ch
        i = bisect.bisect_left(products, prefix)
        out.append([p for p in products[i:i + 3] if p.startswith(prefix)])
    return out

prods = ["mobile", "mouse", "moneypot", "monitor", "mousepad"]
for row in suggested_products(prods, "mouse"):
    print(row)
print(suggested_products(["havana"], "tatiana"), suggested_bisect(["havana"], "havana")[-1])
print(suggested_products(prods, "mouse") == suggested_bisect(prods, "mouse"))</div>
  <div class="fx" data-lang="text">['mobile', 'moneypot', 'monitor']
['mobile', 'moneypot', 'monitor']
['mouse', 'mousepad']
['mouse', 'mousepad']
['mouse', 'mousepad']
[[], [], [], [], [], [], []] ['havana']
True</div>
  <p>Trie: O(S log N) to sort, O(S) to build, O(L) to answer all key presses. The bisect version needs no trie at all: the 3 answers are the 3 words right after the insertion point, if they still start with the prefix. Both are accepted; say both. For "tatiana" vs "havana", the first letter already falls off, so every answer is empty.</p>

  <h2 id="dsa-tri-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: forgetting the end flag</span>
    <p>Reaching a node only proves a prefix exists. <code>search</code> must also check <code>node.end</code>. Mark the end on the last node, not on the root or the node before it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deleting too much</span>
    <p>Deleting "car" must not remove the nodes "cart" uses; deleting "cart" must not unset "car". Only cut branches nobody else passes through (the <code>passing</code> count), otherwise just unset the flag.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: defaultdict lookups that create nodes</span>
    <p>With a <code>defaultdict</code> trie, <code>node[ch]</code> in a search silently adds the letter. Your trie grows during reads and <code>startsWith</code> starts returning True for everything. Use <code>ch in node</code> or <code>node.get(ch)</code> when reading.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: end marker that is also a letter</span>
    <p>Using <code>"*"</code> or <code>"#"</code> as the end key breaks when the input may contain that character. Pick something impossible for the input, or use a node class.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: claiming a trie saves memory</span>
    <p>In Python each node is a heavy object. A trie saves <em>time</em> on prefix questions; it usually costs memory. Say so in interviews.</p>
  </div>

  <h2 id="dsa-tri-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does one trie node represent, and what does it store?</summary><div class="qa-body">A node represents the prefix spelled by the letters on the path from the root to it. It stores its children (letter → node, a dict or a 26-slot array) and an end flag saying whether a stored word finishes exactly there. Extras like counts or the word itself are optional.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between search and startsWith?</summary><div class="qa-body">Both walk the letters and fail if a child is missing. startsWith returns True as soon as the walk finishes. search also requires the final node's end flag to be True. With "apple" stored, search("app") is False and startsWith("app") is True.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Time and space of insert, search, startsWith?</summary><div class="qa-body">O(L) time each, where L is the length of the word or prefix, independent of how many words are stored. Insert adds at most L nodes. Total space is O(total letters) in the worst case (no shared prefixes), times the per-node overhead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hash set or trie: when do you pick which?</summary><div class="qa-body">Exact membership only → set: same O(L) and much less memory. Prefix queries, autocomplete, shortest/longest prefix match, sorted listing, or letter-by-letter search with pruning (grids, wildcards) → trie. For a static list with simple prefix queries, a sorted list with bisect is a lighter middle ground.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you delete a word without breaking others?</summary><div class="qa-body">First confirm the word exists. Walk down decreasing a per-node passing count; when a child's count hits 0, delete that child and stop, since no other word uses that branch. If the walk completes, the word is a prefix of others, so just set end to False.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you count the words that start with a prefix in O(L)?</summary><div class="qa-body">Keep a counter in every node, incremented on each insert as the word passes through. Walk to the prefix node and read its counter. Without counters you would DFS the whole subtree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Word Search II faster with a trie than searching each word separately?</summary><div class="qa-body">Words share prefixes, so one DFS per cell explores all words at once instead of repeating the same paths per word. The trie also stops a path the moment no word continues with that letter, and removing found words and empty branches prunes the search further.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the "." wildcard change search, and what does it cost?</summary><div class="qa-body">At a ".", the search tries every child recursively and succeeds if any branch succeeds. Without dots it is O(L). Each dot can multiply the work by up to 26, so the worst case is O(26<sup>d</sup> · L) for d dots.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you return the top 3 suggestions for every key press quickly?</summary><div class="qa-body">Store the best 3 words (alphabetical or by frequency) in every node at insert time. Each key press then moves one node down and reads its list: O(1) per key after the build. Alternative for a fixed list: sort it and use bisect to find the first word ≥ prefix, then take up to 3 that still match.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might a dict-of-children be preferred over an array of 26 in Python?</summary><div class="qa-body">Most nodes have only one or two children, so 26 slots per node waste memory, and Python lists of None are not cheap. A dict stores only real children and works for any alphabet (Unicode, digits). An array is faster in C/Java for a fixed small alphabet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a compressed trie (radix tree)?</summary><div class="qa-body">A trie where chains of single-child nodes are merged into one edge holding a string ("erview" instead of six nodes). Same queries, far fewer nodes. Used in routers' IP lookup tables and some key-value stores.</div></details>
</main>
`
});
