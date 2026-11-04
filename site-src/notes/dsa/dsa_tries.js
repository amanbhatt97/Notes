// notes/dsa/dsa_tries.js — Tries
Object.assign(TOPIC_CONTENT, {
  "dsa_tries": `<main>
<h1>Tries</h1>
  <div class="where"><span>DSA</span><span>Trees &amp; graphs</span><span>Tries</span></div>
  <p class="lead">A trie (pronounced "try") is a tree that stores words letter by letter, so that words which start the same way share the same path. That one idea makes "which words start with <em>pa</em>?" a walk of two steps instead of a scan of every word, which is why tries sit behind search-box autocomplete, spell checkers, IP routing tables and word-puzzle solvers. In interviews they appear whenever a problem talks about prefixes, a dictionary of words, or many words searched at once. The running example is Biteful's search box: as a customer types "p", "pa", "pan", the app must show matching dishes from a list of 100,000 dish names, instantly, after every key press. We start with the obvious list-based solution, see why it is too slow, build a trie from scratch, and then add autocomplete, ranking, grid search and the other patterns one at a time on the same menu.</p>

  <h2 id="dsa-tri-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Tries</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>A tree of letters: each edge is one letter, each node is a prefix</li>
          <li>Words with the same start share one path</li>
          <li>The <b>end flag</b> marks nodes where a whole word stops</li>
          <li>Prefix questions cost O(L), whatever the number of words</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core operations</div>
        <ul>
          <li><b>insert</b>: walk, create missing children, set end</li>
          <li><b>search</b>: walk, then check the end flag</li>
          <li><b>startsWith</b>: walk only</li>
          <li>All O(L); a set is lighter if you only need exact lookups</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Extra fields, extra powers</div>
        <ul>
          <li><code>passing</code> count: "how many start with p?" in O(L)</li>
          <li>Top-k list per node: suggestions per key press</li>
          <li>Delete with counts: cut unused branches only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li>Walk then collect: autocomplete</li>
          <li>Trie + grid DFS: Word Search II</li>
          <li>First end flag on the path: Replace Words</li>
          <li>"." wildcard: branch into every child</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-tri-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Prefix Search Problem</span><span class="rm-sub">why a list or a set is not enough</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-idea"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">What a Trie Is</span><span class="rm-sub">letters on edges, prefixes as nodes, the end flag</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-impl"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">insert, search and startsWith</span><span class="rm-sub">building a trie from scratch, traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-cost"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Cost, Memory and Alternatives</span><span class="rm-sub">trie vs set vs sorted list</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-more"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Autocomplete</span><span class="rm-sub">list, count, rank and delete</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-python"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Tries as Nested Dicts</span><span class="rm-sub">the short form used in interviews</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-wsii"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Word Search II</span><span class="rm-sub">a trie steering a grid search</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-replace"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Replace Words</span><span class="rm-sub">stopping at the shortest stored prefix</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-wild"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Wildcard Search</span><span class="rm-sub">"." matches any letter</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">trigger words, one skeleton</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">what to practise, in order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">end flags, deletes, phantom nodes</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">operations, costs, traps</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on tries</span></div></div>
    </div>
  </div>

  <h2 id="dsa-tri-need"><span class="num">01</span>The Prefix Search Problem</h2>
  <p>Biteful's search box has one job: after every key press, show the dishes whose names start with what the customer has typed so far. Type "p" and you see paneer, papad, pasta, pav and poha; type "pa" and poha disappears. The question the program must answer is called a <strong>prefix query</strong>: given a string p (the <strong>prefix</strong>, meaning the first few letters of a word), find every stored word that begins with p. Let us see how far plain Python gets with it.</p>
  <p>The obvious approach is to keep the dish names in a list and check each one with <code>startswith</code>:</p>
  <div class="fx" data-lang="py">dishes = ["dal", "dalia", "dosa", "dhokla", "paneer", "papad", "pasta", "pav", "poha", "samosa"]

def starts_with_scan(words, prefix):     # check every stored name
    return [w for w in words if w.startswith(prefix)]

print(starts_with_scan(dishes, "pa"))
print(starts_with_scan(dishes, "d"), starts_with_scan(dishes, "z"))

menu = set(dishes)
print("pav" in menu, "pa" in menu)       # a set knows whole words only</div>
  <div class="fx" data-lang="text">['paneer', 'papad', 'pasta', 'pav']
['dal', 'dalia', 'dosa', 'dhokla'] []
True False</div>
  <p>The answers are right, but look at how they are produced. To find the four "pa" dishes, the function checked all ten names. With N names of up to L letters each, every key press costs O(N · L), because each of the N names is compared letter by letter. Biteful has 100,000 dish names, and a customer typing "paneer" sends six queries in a couple of seconds, from thousands of customers at once. Every query re-reads the entire list, and it gets slower with every dish a restaurant adds.</p>
  <p>The last line shows why the usual speed-up, a hash set, does not help. A set answers "is <em>pav</em> on the menu?" in one step, because it hashes the whole word and jumps straight to it. But "pa" is not a word on the menu, so <code>"pa" in menu</code> is simply False. Hashing deliberately scatters similar strings to unrelated places, so "paneer" and "papad" end up nowhere near each other, and the set has no way to say which stored words <em>begin</em> with "pa" except by checking every one. A set is excellent for exact lookups and useless for prefix questions.</p>
  <p>What we want is a structure where words that start the same way are stored together, so that going from "p" to "pa" narrows the search instead of restarting it. Think of a printed dictionary with thumb tabs. To find words starting with "pa" you do not read every page: you open the P tab, then flip to where "pa" begins, and every word you want is right there in one block. A trie is that tab system, with a tab for every letter at every depth. The next section shows what it looks like.</p>

  <h2 id="dsa-tri-idea"><span class="num">02</span>What a Trie Is</h2>
  <p>A <strong>trie</strong> (from re<em>trie</em>val, also called a <strong>prefix tree</strong>) is a tree that stores words as paths, one letter per step. The top node, the <strong>root</strong>, stands for "nothing typed yet". Each edge going down is labelled with one letter, so walking down d → a → l spells "dal". Words that start the same way share the same first steps: "dal", "dalia" and "dosa" all go through the single d node, and "dal" and "dalia" share the whole path d → a → l. Here is the trie for four dishes:</p>
  <figure class="viz"><svg viewBox="0 0 600 340" width="600"><line x1="300" y1="30" x2="200" y2="85" stroke="currentColor"/><line x1="300" y1="30" x2="430" y2="85" stroke="currentColor"/><line x1="200" y1="85" x2="150" y2="140" stroke="currentColor"/><line x1="200" y1="85" x2="260" y2="140" stroke="currentColor"/><line x1="150" y1="140" x2="150" y2="195" stroke="currentColor"/><line x1="150" y1="195" x2="150" y2="250" stroke="currentColor"/><line x1="150" y1="250" x2="150" y2="305" stroke="currentColor"/><line x1="260" y1="140" x2="260" y2="195" stroke="currentColor"/><line x1="260" y1="195" x2="260" y2="250" stroke="currentColor"/><line x1="430" y1="85" x2="430" y2="140" stroke="currentColor"/><line x1="430" y1="140" x2="430" y2="195" stroke="currentColor"/><circle cx="300" cy="30" r="16" style="fill:var(--bg)"/><circle cx="300" cy="30" r="16" class="fs sb"/><text x="300" y="34" text-anchor="middle">·</text><circle cx="200" cy="85" r="16" style="fill:var(--bg)"/><circle cx="200" cy="85" r="16" class="fb sb"/><text x="200" y="89" text-anchor="middle">d</text><circle cx="430" cy="85" r="16" style="fill:var(--bg)"/><circle cx="430" cy="85" r="16" class="fb sb"/><text x="430" y="89" text-anchor="middle">p</text><circle cx="150" cy="140" r="16" style="fill:var(--bg)"/><circle cx="150" cy="140" r="16" class="fb sb"/><text x="150" y="144" text-anchor="middle">a</text><circle cx="260" cy="140" r="16" style="fill:var(--bg)"/><circle cx="260" cy="140" r="16" class="fb sb"/><text x="260" y="144" text-anchor="middle">o</text><circle cx="150" cy="195" r="16" style="fill:var(--bg)"/><circle cx="150" cy="195" r="16" class="fg sg"/><text x="150" y="199" text-anchor="middle">l</text><circle cx="150" cy="250" r="16" style="fill:var(--bg)"/><circle cx="150" cy="250" r="16" class="fb sb"/><text x="150" y="254" text-anchor="middle">i</text><circle cx="150" cy="305" r="16" style="fill:var(--bg)"/><circle cx="150" cy="305" r="16" class="fg sg"/><text x="150" y="309" text-anchor="middle">a</text><circle cx="260" cy="195" r="16" style="fill:var(--bg)"/><circle cx="260" cy="195" r="16" class="fb sb"/><text x="260" y="199" text-anchor="middle">s</text><circle cx="260" cy="250" r="16" style="fill:var(--bg)"/><circle cx="260" cy="250" r="16" class="fg sg"/><text x="260" y="254" text-anchor="middle">a</text><circle cx="430" cy="140" r="16" style="fill:var(--bg)"/><circle cx="430" cy="140" r="16" class="fb sb"/><text x="430" y="144" text-anchor="middle">a</text><circle cx="430" cy="195" r="16" style="fill:var(--bg)"/><circle cx="430" cy="195" r="16" class="fg sg"/><text x="430" y="199" text-anchor="middle">v</text><text x="322" y="34" class="tm">root = "" (empty prefix)</text><text x="180" y="72" text-anchor="end" class="tb">"d" shared by 3 dishes</text><text x="172" y="199" class="tg">dal</text><text x="172" y="309" class="tg">dalia</text><text x="282" y="254" class="tg">dosa</text><text x="452" y="199" class="tg">pav</text><text x="470" y="300" text-anchor="middle" class="tm">green = end flag True</text></svg><figcaption>The trie for dal, dalia, dosa and pav. The four words have 15 letters, but the trie has only 11 letter nodes, because shared starts are stored once. Green nodes are where a whole dish name ends.</figcaption></figure>
  <p>Two facts about this picture explain everything that follows. First, every node stands for a prefix: the letters on the path from the root down to it. The node reached by d → a stands for "da", and everything below it is a word starting with "da". That is why a prefix query becomes easy: walk down the letters of the prefix, and the answer is the whole subtree under the node you land on. The walk takes as many steps as the prefix has letters, no matter whether the trie holds ten words or ten million.</p>
  <p>Second, reaching a node does not mean a word exists there. "da" is a node, but no dish is called "da"; it exists only because "dal" and "dalia" pass through it. And "dal" is a real dish even though the path carries on to "dalia". The tree's shape cannot tell these cases apart, so every node carries one extra bit called the <strong>end flag</strong>: True only at nodes where a stored word finishes (the green ones). Forgetting this flag is the most common trie bug, and we will see it again.</p>
  <p>Notice also where the letters live. In a trie the letter belongs to the edge, not to the node: a node simply holds a mapping from each next letter to the child node it leads to. The root has no letter at all, because it stands for the empty prefix "". So a <strong>trie node</strong> needs exactly two fields: <code>children</code>, a dict from letter to child node (a dict means only letters actually used take space), and <code>end</code>, the end flag. Later sections add optional extras such as counts, but these two are the whole structure.</p>

  <h2 id="dsa-tri-impl"><span class="num">03</span>insert, search and startsWith</h2>
  <p>A trie needs three operations, and they are all the same walk from the root with a different ending. To <strong>insert</strong> a word, start at the root and, for each letter, go to the child for that letter, creating it if it does not exist yet; at the last node, set the end flag. To <strong>search</strong> for a whole word, walk its letters; if a child is missing you have "fallen off" the trie and the answer is False; if you reach the end, the answer is the last node's end flag. To ask <strong>startsWith</strong> (does any stored word begin with this prefix?), do the same walk, but reaching the end is enough, because the node exists only if some word passes through it.</p>
  <p>Before running code, trace the inserts by hand on an empty trie. Inserting "dal" creates three nodes (d, a, l) and sets the flag on l. Inserting "dalia" walks the existing d, a and l, then creates i and a, and sets the flag on the new a. Inserting "dosa" reuses only d and creates o, s and a. Inserting "pav" shares nothing and creates three nodes. The code below prints <code>+</code> for a created node and <code>=</code> for a reused one, so you can check this trace against it:</p>
  <div class="fx" data-lang="py">class TrieNode:
    def __init__(self):
        self.children = {}      # letter -&gt; TrieNode
        self.end = False        # True if a whole word stops here

class Trie:
    def __init__(self):
        self.root = TrieNode()  # stands for the empty prefix ""

    def insert(self, word):
        node, steps = self.root, []
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()   # make the missing step
                steps.append(f"+{ch}")
            else:
                steps.append(f"={ch}")           # shared prefix: reuse the node
            node = node.children[ch]
        node.end = True                          # a word ends here
        print(f"insert {word:6} {' '.join(steps)}")

    def _walk(self, s):         # follow s letter by letter; None if we fall off
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):     # is this whole word stored?
        node = self._walk(word)
        return node is not None and node.end

    def startsWith(self, prefix):   # does any stored word begin with prefix?
        return self._walk(prefix) is not None

t = Trie()
for w in ["dal", "dalia", "dosa", "pav"]:
    t.insert(w)
print("search dal:", t.search("dal"), "| search da:", t.search("da"),
      "| startsWith da:", t.startsWith("da"), "| startsWith dh:", t.startsWith("dh"))
print("search dalias:", t.search("dalias"), "| startsWith '':", t.startsWith(""),
      "| search '':", t.search(""))</div>
  <div class="fx" data-lang="text">insert dal    +d +a +l
insert dalia  =d =a =l +i +a
insert dosa   =d +o +s +a
insert pav    +p +a +v
search dal: True | search da: False | startsWith da: True | startsWith dh: False
search dalias: False | startsWith '': True | search '': False</div>
  <p>The four insert lines match the hand trace exactly: "dalia" reused three nodes and created two. Now look at the queries. <code>search("dal")</code> walks root → d → a → l and finds the end flag set, so True. <code>search("da")</code> walks root → d → a successfully, but the a node's end flag is False, so the answer is False: "da" is a prefix of stored words but not a word itself. <code>startsWith("da")</code> does the same walk and does not look at the flag, so it returns True. <code>startsWith("dh")</code> reaches d, finds no child h, and falls off, so False. <code>search("dalias")</code> falls off after "dalia". The last line shows two edge cases interviewers like: <code>startsWith("")</code> is True because the walk takes zero steps and the root always exists, while <code>search("")</code> is False because nobody inserted the empty word.</p>
  <p>The whole difference between <code>search</code> and <code>startsWith</code> is that one line checking <code>node.end</code>. If you forget it, <code>search("da")</code> returns True, and your "search" has silently become "startsWith".</p>
  <p>The cost of all three operations is <strong>O(L)</strong> time, where L is the length of the word or prefix: one dict lookup per letter, and the number of stored words N never appears. Insert creates at most L new nodes, so the total space is at most O(total letters of all words), and less when words share prefixes. In an interview, "implement a trie", "a dictionary that supports insert and prefix lookup", or "count words with a given prefix" all mean exactly this class.</p>

  <h2 id="dsa-tri-cost"><span class="num">04</span>Cost, Memory and Alternatives</h2>
  <p>An honest interview answer about tries has to cover what they cost, not only what they do. Start with time. A Python set also does an exact lookup in O(L), because it must hash all L letters of the word, so for "is this exact word stored?" the trie wins nothing. The trie wins on every question that involves prefixes, and the table below compares it with a set and with a third option, a sorted list searched with <code>bisect</code> (binary search):</p>
  <table class="tbl">
    <tr><th>Question</th><th>Hash set</th><th>Sorted list + bisect</th><th>Trie</th></tr>
    <tr><td>Add a word</td><td>O(L)</td><td>O(N) to shift elements</td><td>O(L)</td></tr>
    <tr><td>Is this exact word stored?</td><td>O(L)</td><td>O(L log N)</td><td>O(L)</td></tr>
    <tr><td>Does any word start with p?</td><td>O(N · L) scan</td><td>O(L log N)</td><td>O(L)</td></tr>
    <tr><td>List the k words starting with p</td><td>O(N · L) scan</td><td>O(L log N + k)</td><td>O(L + size of the subtree)</td></tr>
    <tr><td>Shortest stored prefix of a word</td><td>try every prefix, O(L²)</td><td>awkward</td><td>O(L), stop at the first end flag</td></tr>
    <tr><td>Memory</td><td>the words</td><td>the words</td><td>one object per distinct prefix</td></tr>
  </table>
  <p>The memory row is where tries hurt in Python. Sharing prefixes sounds like it should save space, and in letters it does. But each node is a full Python object with its own dict, which costs a few hundred bytes, while a letter inside an ordinary string costs one byte. Measuring both on Biteful's 100,000 dish names (the exact megabytes are approximate and vary by Python version):</p>
  <div class="fx" data-lang="py">import tracemalloc
# (Trie is the class from the previous section, without the prints)

def count_nodes(node):
    return 1 + sum(count_nodes(c) for c in node.children.values())

small = ["paneer", "papad", "pasta", "pav", "paratha", "pakora"]
t = Trie()
for w in small:
    t.insert(w)
print("6 dishes:", sum(map(len, small)), "letters -&gt;", count_nodes(t.root) - 1, "nodes")

names = make_names()                 # 100,000 made-up dish names
tracemalloc.start()
big = Trie()
for w in names:
    big.insert(w)
trie_bytes = tracemalloc.get_traced_memory()[0]
tracemalloc.stop()
strings = sum(len(w) + 49 for w in names) + 8 * len(names)   # str objects + list pointers
print(f"100,000 names: {sum(map(len, names)):,} letters -&gt; {count_nodes(big.root) - 1:,} nodes")
print(f"trie ~{trie_bytes / 1e6:.0f} MB vs plain list of strings ~{strings / 1e6:.0f} MB")</div>
  <div class="fx" data-lang="text">6 dishes: 32 letters -&gt; 22 nodes
100,000 names: 1,091,258 letters -&gt; 340,184 nodes
trie ~84 MB vs plain list of strings ~7 MB</div>
  <p>For six "pa…" dishes, 32 letters became 22 nodes, which looks like a saving. At Biteful's scale, 1.09 million letters became 340,184 nodes using roughly 84 MB, against roughly 7 MB for the same names kept as a plain list of strings: about twelve times more. Words with few shared starts, such as random IDs, make the ratio worse. So you choose a trie for its <em>queries</em>, never to save memory, and you should say so in an interview. If memory matters, there are known ways to shrink one: <code>__slots__</code> on the node class, a fixed 26-slot array instead of a dict (fast, but wasteful when most slots are empty), or a <strong>compressed trie</strong> (also called a radix tree), which merges every chain of single-child nodes into one edge labelled with a string, so "neer" becomes one edge instead of four nodes.</p>
  <p>The middle column of the table deserves its own look, because it often beats a trie for a fixed word list. If the names are sorted, all names starting with "pa" sit in one unbroken block, just like the dictionary's thumb-tab section. <code>bisect.bisect_left(words, prefix)</code> finds the first position where the prefix could be inserted, which is exactly the start of that block, in O(log N) comparisons. Then you read forward while names still start with the prefix:</p>
  <div class="fx" data-lang="py">import bisect

words = sorted(["paneer", "papad", "pasta", "pav", "poha", "dal", "dosa"])

def with_prefix(prefix):
    i = bisect.bisect_left(words, prefix)        # first word &gt;= prefix
    out = []
    while i &lt; len(words) and words[i].startswith(prefix):
        out.append(words[i])                     # the matches sit in one block
        i += 1
    return out

print(words)
print(with_prefix("pa"), with_prefix("d"), with_prefix("q"))</div>
  <div class="fx" data-lang="text">['dal', 'dosa', 'paneer', 'papad', 'pasta', 'pav', 'poha']
['paneer', 'papad', 'pasta', 'pav'] ['dal', 'dosa'] []</div>
  <p>The "pa" block is found and read off directly, "d" gives its two names, and "q" finds an empty block. This uses no extra memory beyond the list itself. Its weakness is change: inserting a new name into a sorted list shifts everything after it, O(N), so it suits a menu that is rebuilt once a night, not one that changes every second. The practical rule is: exact lookups only, use a set; a static list with plain prefix lookups, use sort plus <code>bisect</code>; words that change often, or a search that must walk letter by letter and decide something at each step (counts, rankings, grids, wildcards, shortest-prefix matches), use a trie. The rest of this note is about that last group.</p>

  <h2 id="dsa-tri-more"><span class="num">05</span>Autocomplete</h2>
  <p><code>startsWith</code> only says yes or no. Biteful's search box needs much more: it must list the matching dishes, show how many there are, put the most-ordered ones first, and stay correct when a restaurant takes a dish off the menu. Each of these becomes a small addition to the trie, and together they are what interviewers mean by <strong>autocomplete</strong> (also called type-ahead).</p>
  <p>Listing is the easy one. Walk down to the node for the typed prefix, then do a depth-first search (DFS, the "go as deep as possible, then back up" walk from <a class="xref" data-note="dsa_trees">Trees</a>) of everything below it, collecting each node whose end flag is set. If the DFS visits children in alphabetical order, the results come out alphabetical too.</p>
  <p>Counting could be done the same way, by listing and taking the length, but that visits the whole subtree. Instead, give every node a counter called <code>passing</code>: the number of stored words whose path goes through this node. Insert increases the counter on every node along the word's path. Then "how many dishes start with pa?" is just: walk to the "pa" node and read its counter, O(L). Ranking needs one more field, <code>freq</code>, holding today's order count at each word's end node, so we can pick the best k matches.</p>
  <p>Deleting is the subtle one, because other words may share the path. Deleting "dal" must not remove the nodes "dalia" uses; deleting "dalia" must not remove "dal". The <code>passing</code> counts solve it: walk down the word decreasing each count. If some child's count drops to 0, no other word uses that branch any more, so cut the whole branch off at that point and stop. If the walk reaches the end without that happening, the word was a prefix of other words, so only unset its end flag. Today's menu, with orders, is paneer 90, papad 40, pasta 40, pav 75, poha 12, dal 60, dalia 8 and dosa 95:</p>
  <div class="fx" data-lang="py">import heapq

class Node:
    def __init__(self):
        self.children = {}
        self.end = False
        self.passing = 0         # how many stored dishes go through this node
        self.freq = 0            # orders today, used for ranking

class DishSearch:
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
        if node and node.end:                    # already stored: only update
            node.freq = freq
            return
        node = self.root
        node.passing += 1
        for ch in word:
            node = node.children.setdefault(ch, Node())
            node.passing += 1
        node.end, node.freq = True, freq

    def count_prefix(self, prefix):              # how many dishes start with prefix
        node = self._walk(prefix)
        return node.passing if node else 0

    def autocomplete(self, prefix):              # every match, alphabetical
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

    def top(self, prefix, k):                    # k most-ordered, ties by name
        return heapq.nsmallest(k, self.autocomplete(prefix),
                               key=lambda w: (-self._walk(w).freq, w))

    def delete(self, word):
        node = self._walk(word)
        if node is None or not node.end:
            return False                         # not a stored dish
        node = self.root
        node.passing -= 1
        for ch in word:
            child = node.children[ch]
            child.passing -= 1
            if child.passing == 0:               # no other dish uses this branch
                del node.children[ch]            # cut the whole branch off
                return True
            node = child
        node.end = False                         # dish was a prefix of another
        return True

ds = DishSearch()
for dish, orders in [("paneer", 90), ("papad", 40), ("pasta", 40), ("pav", 75),
                     ("poha", 12), ("dal", 60), ("dalia", 8), ("dosa", 95)]:
    ds.insert(dish, orders)
print(ds.autocomplete("pa"), ds.count_prefix("pa"), ds.count_prefix("p"))
print(ds.top("pa", 2), ds.top("p", 3))
print(ds.delete("pasta"), ds.delete("pasta"), ds.autocomplete("pa"))
print(ds.delete("da"), ds.delete("dal"), ds.autocomplete("da"), ds.count_prefix(""))</div>
  <div class="fx" data-lang="text">['paneer', 'papad', 'pasta', 'pav'] 4 5
['paneer', 'pav'] ['paneer', 'pav', 'papad']
True False ['paneer', 'papad', 'pav']
False True ['dalia'] 6</div>
  <p>Read the output line by line. "pa" matches four dishes in alphabetical order, <code>count_prefix("pa")</code> is 4 and <code>count_prefix("p")</code> is 5 (poha joins). Ranked by orders, paneer (90) and pav (75) lead "pa"; for "p" the third place goes to papad, which ties pasta at 40 and wins on the alphabetical tie-break. Deleting "pasta" returns True and then False the second time, because it is gone. Deleting "da" is False because "da" was never a dish, only a prefix. Deleting "dal" succeeds and leaves "dalia" intact, because the walk reached the end of "dal" with counts still above zero and only unset its flag. Finally the root's counter is the number of dishes left on the menu: 6.</p>
  <p>Now the payoff. Here is the "how many dishes start with what has been typed?" question on all 100,000 names, answered once by scanning the list and once by the trie, for 120 key presses (timings are approximate and depend on the machine):</p>
  <div class="fx" data-lang="py">from autobase import DishSearch
import time
# (DishSearch is the class above; make_names builds the 100,000 made-up names)

names = make_names()
ds = DishSearch()
for w in names:
    ds.insert(w)

def count_scan(prefix):                      # O(N * L): check every name
    return sum(1 for w in names if w.startswith(prefix))

presses = ["p", "pa", "pan", "pane", "panee", "paneer"] * 20     # 120 key presses
for f in (count_scan, ds.count_prefix):
    t = time.perf_counter()
    res = [f(q) for q in presses]
    ms = (time.perf_counter() - t) * 1000
    print(f"{f.__name__:12} {ms:8.2f} ms for 120 key presses | counts {res[:6]}")</div>
  <div class="fx" data-lang="text">count_scan     726.77 ms for 120 key presses | counts [12534, 6299, 389, 389, 25, 25]
count_prefix     0.06 ms for 120 key presses | counts [12534, 6299, 389, 389, 25, 25]</div>
  <p>Both give identical counts (12,534 names start with "p", 25 with "panee"), but the scan takes hundreds of milliseconds, a few milliseconds per key press, while the trie answers all 120 queries in well under a millisecond. The scan grows with every dish added; the trie's cost depends only on the length of what was typed.</p>
  <p>There is one remaining weakness: <code>top</code> collects every match and then picks the best k. For "p" on 100,000 names that means collecting 12,534 words to show three. Real search engines avoid this by storing the best k words <strong>inside every node</strong> while building the trie. Then each key press just moves one node down and reads a ready-made list. If the words are inserted in sorted order, the first three words that pass through a node are its three alphabetically smallest, which is exactly LeetCode's "Search Suggestions System":</p>
  <div class="fx" data-lang="py">def build_suggestions(products):
    root = {}
    for p in sorted(products):                   # sorted: the first 3 seen are the best 3
        node = root
        for ch in p:
            node = node.setdefault(ch, {"#": []})
            if len(node["#"]) &lt; 3:
                node["#"].append(p)              # every node keeps its own top 3
    return root

def suggestions(root, typed):
    out, node = [], root
    for ch in typed:
        node = node.get(ch) if node else None    # once we fall off, stay off
        out.append(node["#"] if node else [])
    return out

root = build_suggestions(["paneer", "papad", "pasta", "pav", "poha", "pakora"])
for i, row in enumerate(suggestions(root, "pas"), 1):
    print(f"{'pas'[:i]:4}", row)
print(suggestions(root, "qa"))</div>
  <div class="fx" data-lang="text">p    ['pakora', 'paneer', 'papad']
pa   ['pakora', 'paneer', 'papad']
pas  ['pasta']
[[], []]</div>
  <p>Each typed prefix reads its node's list directly: "p" and "pa" both show pakora, paneer, papad, and "pas" shows only pasta. Typing "q" falls off at once, and the code stays "off" for every later letter, so both answers are empty lists. The price is memory (k words referenced from every node) in exchange for O(1) work per key press after the walk. Recognise this whole family in interviews by the words "autocomplete", "suggestions after each character", "top 3", "count / sum of words with prefix" (Map Sum Pairs stores a sum in each node instead of a count).</p>

  <h2 id="dsa-tri-python"><span class="num">06</span>Tries as Nested Dicts</h2>
  <p>The node class makes the structure easy to see, but in interviews most people write a trie with no class at all. Since a node is really "a dict of children plus an end flag", you can make each node <em>be</em> a dict, and store the end flag as a special key in the same dict. The key <code>"$"</code> works well because it can never be a letter of a dish name, and it is convenient to store the whole word under it, so that whoever reaches the end node knows which word it was:</p>
  <div class="fx" data-lang="py">from collections import defaultdict

def make_trie(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})   # child for ch, created if missing
        node["$"] = w                        # end marker; it also stores the word
    return root

print(make_trie(["dal", "dalia", "pav"]))

Tree = lambda: defaultdict(Tree)             # every missing key makes a new level
t = Tree()
for w in ["dal", "dosa"]:
    node = t
    for ch in w:
        node = node[ch]
    node["$"] = True
print(sorted(t["d"]), "x" in t["d"])         # 'in' only looks
t["d"]["x"]                                  # a plain read...
print(sorted(t["d"]))                        # ...created a node for 'x'</div>
  <div class="fx" data-lang="text">{'d': {'a': {'l': {'$': 'dal', 'i': {'a': {'$': 'dalia'}}}}}, 'p': {'a': {'v': {'$': 'pav'}}}}
['a', 'o'] False
['a', 'o', 'x']</div>
  <p>The printed structure is the same trie as the picture in section 02, written as nested dicts: d leads to a, a leads to l, and the l dict holds both <code>'$': 'dal'</code> (a word ends here) and the child <code>'i'</code> (the path continues to "dalia"). The whole insert loop is one line, <code>node = node.setdefault(ch, {})</code>, which returns the child for <code>ch</code>, creating an empty one first if it is missing.</p>
  <p>The second half shows an even shorter version and its trap. <code>Tree = lambda: defaultdict(Tree)</code> makes a dict that creates a new empty level whenever a missing key is read, so <code>node = node[ch]</code> both walks and builds. That is neat for inserting, and dangerous for searching: the plain read <code>t["d"]["x"]</code> in the code silently created a node for "x", as the last line shows. A search written with <code>node[ch]</code> on such a trie grows the trie with every miss and soon reports that every prefix exists. When reading, always test with <code>ch in node</code> or <code>node.get(ch)</code>, as the first line of the output does. The nested-dict form is what the next three sections use.</p>

  <h2 id="dsa-tri-wsii"><span class="num">07</span>Word Search II</h2>
  <p>Biteful runs a promo puzzle: a grid of letters, and customers win a coupon for every dish name they can trace by moving up, down, left or right, without using a cell twice in one word. The <a class="xref" data-note="dsa_backtrack">Backtracking</a> note solved the one-word version, "Word Search": start from each cell and run a DFS that marks a cell when it joins the path and unmarks it on the way back. Here the question is the reverse: given a whole list of dish names, which of them are in the grid?</p>
  <table class="tbl"><caption>The promo puzzle</caption>
    <tr><th></th><th>c0</th><th>c1</th><th>c2</th><th>c3</th></tr>
    <tr><th>r0</th><td>d</td><td>a</td><td>l</td><td>v</td></tr>
    <tr><th>r1</th><td>o</td><td>s</td><td>a</td><td>i</td></tr>
    <tr><th>r2</th><td>m</td><td>a</td><td>h</td><td>d</td></tr>
  </table>
  <p>The brute force runs the one-word search once per dish name. That repeats a huge amount of work: "dosa" and "dosas" begin with the same four letters, so their searches walk exactly the same cells, and with thousands of names most of the grid is walked thousands of times. The key insight is to put all the names into one trie and run a <strong>single</strong> backtracking search that moves on the grid and in the trie at the same time. At each cell, the current trie node says which letters can come next. If a neighbouring cell's letter is not a child of that node, no dish name continues that way, so the search does not even step there. If the node has the <code>"$"</code> end marker, a whole name has just been traced.</p>
  <p>Trace it from the top-left d. The trie node for "d" has children a and o. The cell below holds o, a child, so step there; the node is now "do". Its only child is s, and (1,1) holds s, so step there: "dos". From "dos" the child is a, and three neighbouring cells hold a; try (2,1) first: the node "dosa" has the end marker, so record <strong>dosa</strong>. It also has a child s (for "dosas"), but there is no unused s next to (2,1), so back up. Eventually the search returns to d, tries the neighbour a at (0,1), then l at (0,2), and records <strong>dal</strong>. Here is the code:</p>
  <div class="fx" data-lang="py">def find_words(board, words):
    root = {}
    for w in words:                                # trie of dicts, "$" = word ends
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
        board[r][c] = "#"                          # choose: mark cell as on the path
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 &lt;= nr &lt; rows and 0 &lt;= nc &lt; cols and board[nr][nc] in node:
                dfs(nr, nc, node)                  # only letters the trie allows
        board[r][c] = ch                           # un-choose (backtrack)
        if not node:                               # branch used up completely:
            parent.pop(ch)                         # prune it from the trie

    for r in range(rows):
        for c in range(cols):
            if board[r][c] in root:
                dfs(r, c, root)
    return found

puzzle = [list("dalv"), list("osai"), list("mahd")]       # Biteful's promo puzzle
print(sorted(find_words(puzzle, ["dosa", "dal", "masala", "dosas", "vada", "halva", "sam"])))
print(["".join(row) for row in puzzle])                   # board restored
print(find_words([list("ab"), list("cd")], ["abdc", "ab"]))</div>
  <div class="fx" data-lang="text">['dal', 'dosa', 'masala', 'sam']
['dalv', 'osai', 'mahd']
['ab', 'abdc']</div>
  <p>Four dish names are in the puzzle: dal, dosa, masala and sam. "dosas" is not (the grid has only one s), and neither are vada or halva. The second line shows the board restored to its original letters, because every cell is unmarked on the way back, which is the backtracking "un-choose" step. The third line is a small but important case: after recording "ab", the search must keep going, because "abdc" continues along the same path. That is why the code records the word and carries on instead of returning.</p>
  <p>Three details make this fast. The trie check <code>board[nr][nc] in node</code> stops dead-end paths before they start. <code>node.pop("$")</code> records each word once, so a name that can be traced two different ways is not reported twice. And when a trie branch has been completely used up (all its words found), <code>parent.pop(ch)</code> deletes it, so later searches from other cells do not walk it again. How much does this matter? On a random 12 × 12 board with a few thousand candidate words (timings are approximate):</p>
  <div class="fx" data-lang="py">import random, time
# (find_words is the function above)

def exist(board, word):                            # one backtracking search per word
    R, C = len(board), len(board[0])
    def dfs(r, c, k):
        if k == len(word):
            return True
        if r &lt; 0 or c &lt; 0 or r &gt;= R or c &gt;= C or board[r][c] != word[k]:
            return False
        saved, board[r][c] = board[r][c], "#"
        ok = dfs(r+1, c, k+1) or dfs(r-1, c, k+1) or dfs(r, c+1, k+1) or dfs(r, c-1, k+1)
        board[r][c] = saved
        return ok
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))

random.seed(3)
board = [[random.choice("aadlmopsv") for _ in range(12)] for _ in range(12)]
words = list({"".join(random.choice("aadlmopsv") for _ in range(random.randint(3, 7)))
              for _ in range(3000)})
t = time.perf_counter(); a = sorted(w for w in words if exist([row[:] for row in board], w)); t1 = time.perf_counter() - t
t = time.perf_counter(); b = sorted(find_words([row[:] for row in board], words)); t2 = time.perf_counter() - t
print(f"{len(words)} words, 12x12 board: found {len(a)}; same answer: {a == b}")
print(f"one search per word: {t1*1000:6.1f} ms | one trie-guided search: {t2*1000:5.1f} ms")</div>
  <div class="fx" data-lang="text">2680 words, 12x12 board: found 768; same answer: True
one search per word:  115.7 ms | one trie-guided search:   6.6 ms</div>
  <p>Both methods find the same 768 words, but the single trie-guided search is well over ten times faster, because shared prefixes are walked once for all words instead of once per word. The worst-case time is O(R · C · 4 · 3<sup>L−1</sup>) for an R × C grid and longest word L (four directions for the first step, at most three afterwards because you cannot step back onto the cell you came from), but pruning makes real runs far faster; the trie takes O(total letters) space. Recognise this pattern when a problem asks to find <em>all</em> words from a list in a grid or a text, or to check a stream of characters against many words at once.</p>

  <h2 id="dsa-tri-replace"><span class="num">08</span>Replace Words</h2>
  <p>Word Search II needed a whole word to match. Some problems want the opposite: walk along a long word and stop at the <em>first</em> stored word you meet. Biteful's kitchen dashboard receives order lines as free text, such as "pavbhaji dalmakhani paneertikka", and wants to group them by base dish. The base dishes (called <strong>roots</strong> in the LeetCode version, "Replace Words") are pav, dal, paneer and pan. For each word in the order line, the task is to replace it with the shortest root it starts with, or leave it unchanged if none matches.</p>
  <p>The brute force tries every prefix of the word, "p", "pa", "pav", … and checks each one in a set of roots. That is L lookups per word, and each lookup builds a new prefix string of up to L letters, so O(L²) per word. With a trie of roots it is one walk: follow the word's letters, and the first node you reach that has an end flag is the shortest root, so return it immediately. If you fall off the trie first, no root matches.</p>
  <table class="tbl"><caption>Roots: pav, dal, paneer, pan</caption>
    <tr><th>word</th><th>walk</th><th>first end flag</th><th>output</th></tr>
    <tr><td>pavbhaji</td><td>p → a → v</td><td>at "pav"</td><td>pav</td></tr>
    <tr><td>dalmakhani</td><td>d → a → l</td><td>at "dal"</td><td>dal</td></tr>
    <tr><td>paneertikka</td><td>p → a → n</td><td>at "pan", before "paneer"</td><td>pan</td></tr>
    <tr><td>masaladosa</td><td>no child m at the root</td><td>none</td><td>masaladosa</td></tr>
  </table>
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
                return node["$"]       # first (shortest) root met on the way
            if ch not in node:
                return word            # fell off: no root matches
            node = node[ch]
        return node.get("$", word)     # the word itself may be a root

    return " ".join(shortest_root(w) for w in sentence.split())

print(replace_words(["pav", "dal", "paneer", "pan"],
                    "pavbhaji dalmakhani paneertikka masaladosa dal"))
print(replace_words(["cat", "bat", "rat"], "the cattle was rattled by the battery"))</div>
  <div class="fx" data-lang="text">pav dal pan masaladosa dal
the cat was rat by the bat</div>
  <p>The output matches the table, and the LeetCode example on the second line works the same way. Note "paneertikka" becomes "pan", not "paneer": the walk meets the shorter root first, which is exactly what "shortest root" asks for. The important detail in the code is that the end-flag check happens at <em>every step, before moving on</em>; if you checked only after the loop, the walk would never stop early at "pan". The cost is O(total letters in the roots) to build plus O(L) per word. A close cousin is <strong>longest-prefix match</strong>, used by internet routers to choose a route for an IP address: keep walking instead of stopping, remember the last end flag you passed, and return that one when you fall off. Problem wording that points here: "shortest root", "replace with its prefix", "is any word a prefix of another", "remove sub-folders".</p>

  <h2 id="dsa-tri-wild"><span class="num">09</span>Wildcard Search</h2>
  <p>Suppose Biteful lets staff search with a wildcard: "p.v" should match any three-letter dish starting with p and ending with v, where the dot stands for exactly one unknown letter. With a list you would compare every word of the right length letter by letter. With a trie, the normal walk handles every ordinary letter by following one child, and only the dot is new: at a dot you do not know which child to follow, so you try <strong>all</strong> of them, and the search succeeds if any branch succeeds. The single walk turns into a small DFS.</p>
  <figure class="viz"><svg viewBox="0 0 600 255" width="600"><text x="300" y="16" text-anchor="middle" class="tb">search(".ad") in a trie of bad, dad, mad</text><line x1="300" y1="40" x2="180" y2="95" class="sg" stroke-width="2"/><line x1="300" y1="40" x2="300" y2="95" class="sg" stroke-width="2"/><line x1="300" y1="40" x2="420" y2="95" class="sg" stroke-width="2"/><line x1="180" y1="95" x2="180" y2="150" stroke="currentColor"/><line x1="300" y1="95" x2="300" y2="150" stroke="currentColor"/><line x1="420" y1="95" x2="420" y2="150" stroke="currentColor"/><line x1="180" y1="150" x2="180" y2="205" stroke="currentColor"/><line x1="300" y1="150" x2="300" y2="205" stroke="currentColor"/><line x1="420" y1="150" x2="420" y2="205" stroke="currentColor"/><circle cx="300" cy="40" r="15" style="fill:var(--bg)"/><circle cx="300" cy="40" r="15" class="fs sb"/><text x="300" y="44" text-anchor="middle">·</text><circle cx="180" cy="95" r="15" style="fill:var(--bg)"/><circle cx="180" cy="95" r="15" class="fb sb"/><text x="180" y="99" text-anchor="middle">b</text><circle cx="300" cy="95" r="15" style="fill:var(--bg)"/><circle cx="300" cy="95" r="15" class="fb sb"/><text x="300" y="99" text-anchor="middle">d</text><circle cx="420" cy="95" r="15" style="fill:var(--bg)"/><circle cx="420" cy="95" r="15" class="fb sb"/><text x="420" y="99" text-anchor="middle">m</text><circle cx="180" cy="150" r="15" style="fill:var(--bg)"/><circle cx="180" cy="150" r="15" class="fb sb"/><text x="180" y="154" text-anchor="middle">a</text><circle cx="300" cy="150" r="15" style="fill:var(--bg)"/><circle cx="300" cy="150" r="15" class="fb sb"/><text x="300" y="154" text-anchor="middle">a</text><circle cx="420" cy="150" r="15" style="fill:var(--bg)"/><circle cx="420" cy="150" r="15" class="fb sb"/><text x="420" y="154" text-anchor="middle">a</text><circle cx="180" cy="205" r="15" style="fill:var(--bg)"/><circle cx="180" cy="205" r="15" class="fg sg"/><text x="180" y="209" text-anchor="middle">d</text><circle cx="300" cy="205" r="15" style="fill:var(--bg)"/><circle cx="300" cy="205" r="15" class="fg sg"/><text x="300" y="209" text-anchor="middle">d</text><circle cx="420" cy="205" r="15" style="fill:var(--bg)"/><circle cx="420" cy="205" r="15" class="fg sg"/><text x="420" y="209" text-anchor="middle">d</text><text x="20" y="72" class="tg">"." → try all</text><text x="20" y="154" class="tm">"a" → one child</text><text x="20" y="209" class="tm">"d" → end?</text><text x="445" y="209" class="tg">yes → True</text><text x="300" y="245" text-anchor="middle" class="tm">the first branch that succeeds stops the search</text></svg><figcaption>At the root the query has a dot, so all three children are tried; below that, "a" and "d" each follow exactly one child. The b branch already succeeds, so the other two are never needed.</figcaption></figure>
  <p>The picture shows the classic LeetCode example: the dot fans out to b, d and m, and each branch then follows the fixed letters "a" and "d" one child at a time, checking the end flag at the bottom. Here is LeetCode's "Design Add and Search Words Data Structure" on Biteful's dishes, reusing the <code>TrieNode</code> class:</p>
  <div class="fx" data-lang="py"># (TrieNode is the node class from section 03)

class WordDictionary:
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
for w in ["dal", "dosa", "pav", "poha"]:
    wd.addWord(w)
for q in ["pav", "p.v", "d..", "p..a", "d.l.", "....."]:
    print(f"{q:5}", wd.search(q))</div>
  <div class="fx" data-lang="text">pav   True
p.v   True
d..   True
p..a  True
d.l.  False
..... False</div>
  <p>"p.v" matches pav and "p..a" matches poha. "d.." matches dal, because the dot at position two tries both a (from dal and dalia) and o (from dosa), and the a branch ends on a word after three letters. "d.l." fails because the only four-letter path that fits, d → a → l → i, ends on "dali", which is not a word; and "....." fails because no dish has five letters. The length of the query matters as much as the letters: the search succeeds only if it ends exactly on an end flag.</p>
  <p>Without dots the cost is O(L), as before. Each dot can multiply the number of paths by the number of children at that depth, up to 26, so the worst case is O(26<sup>d</sup> · L) for d dots. In practice tries are sparse and <code>any()</code> stops at the first success, so it is much faster, but a query of all dots on a big trie really does visit everything of that length. Problem wording: "wildcard", "'.' matches any letter", "pattern search in a dictionary".</p>

  <h2 id="dsa-tri-patterns"><span class="num">10</span>Choosing the Pattern</h2>
  <p>Every pattern in this note is the same walk from the root, with a different rule for what to do along the way and when to stop. Search stops at the end of the word and checks the flag. startsWith stops at the end and ignores the flag. Autocomplete stops at the end of the prefix and then collects the whole subtree below. Replace Words stops at the first end flag it passes. Wildcard search branches into every child at a dot. Word Search II replaces "the next letter of the word" with "the letter in a neighbouring cell". Once you see that, a new trie problem is mostly a question of which stopping rule it wants. This skeleton shows three of the rules on one small trie:</p>
  <div class="fx" data-lang="py">def build(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w
    return root

def walk(root, s, on_end_flag=None):
    """The one loop behind every trie pattern: follow s letter by letter."""
    node = root
    for ch in s:
        if on_end_flag and "$" in node:
            return on_end_flag(node)         # stop early (shortest root)
        if ch not in node:
            return None                      # fell off: nothing goes this way
        node = node[ch]
    return node                              # the node for s

def collect(node):                           # everything below a node
    out = [node["$"]] if "$" in node else []
    for ch in sorted(k for k in node if k != "$"):
        out += collect(node[ch])
    return out

menu = build(["dal", "dalia", "dosa", "pav", "paneer"])
n = walk(menu, "dal")
print("search dal:", n is not None and "$" in n)              # exact word
print("startsWith pa:", walk(menu, "pa") is not None)         # prefix exists
print("autocomplete d:", collect(walk(menu, "d")))            # walk, then collect
print("shortest root of dalmakhani:", walk(menu, "dalmakhani", lambda nd: nd["$"]))</div>
  <div class="fx" data-lang="text">search dal: True
startsWith pa: True
autocomplete d: ['dal', 'dalia', 'dosa']
shortest root of dalmakhani: dal</div>
  <p>One <code>walk</code> function answered four different questions: an exact search (walk, then check <code>"$"</code>), a prefix check (walk, then check that the node exists), autocomplete (walk, then collect everything below) and shortest root (walk with an early stop at the first end marker). When a problem arrives, the first job is to recognise from its wording that a trie helps at all, and then which rule to apply. This table maps the usual trigger words to the pattern and its cost:</p>
  <table class="tbl">
    <tr><th>Trigger words in the problem</th><th>Pattern</th><th>What the walk does</th><th>Cost</th></tr>
    <tr><td>"implement a trie", "insert and search", "starts with"</td><td>Basic trie</td><td>walk; check the end flag (search) or not (prefix)</td><td>O(L) per operation</td></tr>
    <tr><td>"autocomplete", "suggestions", "top 3", "count / sum of words with prefix"</td><td>Walk then collect</td><td>walk to the prefix node; DFS below, or read a stored count / top-k list</td><td>O(L + matches), or O(L) with stored extras</td></tr>
    <tr><td>"find all words from a list in a grid", "stream of characters"</td><td>Trie + DFS together</td><td>move on the grid and in the trie at once; stop when no child</td><td>O(R · C · 4 · 3<sup>L−1</sup>) worst case</td></tr>
    <tr><td>"shortest root", "replace with prefix", "is any word a prefix of another"</td><td>First end flag on the path</td><td>walk; return at the first end flag</td><td>O(L) per word</td></tr>
    <tr><td>"wildcard", "'.' matches any letter"</td><td>Branching search</td><td>at a dot, try every child</td><td>O(26<sup>d</sup> · L) worst case</td></tr>
    <tr><td>"longest common prefix", "longest word built one letter at a time"</td><td>Single-path walk</td><td>walk while there is exactly one child (and no end flag)</td><td>O(total letters)</td></tr>
    <tr><td>"maximum XOR of two numbers"</td><td>Bitwise trie</td><td>store numbers as bits; greedily step to the opposite bit</td><td>O(32) per number</td></tr>
    <tr><td>"lexicographical order of numbers 1..n"</td><td>Implicit trie</td><td>DFS over digits 0–9 without building nodes</td><td>O(n)</td></tr>
  </table>
  <p>Two rows need a word of explanation. A <strong>bitwise trie</strong> treats each number as a 32-letter word over the alphabet {0, 1}; to find the partner that gives the largest XOR with a number, walk from the highest bit and always step to the opposite bit when that child exists (details in <a class="xref" data-note="dsa_bits">Bit Manipulation</a>). An <strong>implicit trie</strong> is a trie you never build: listing 1 to n in dictionary order (1, 10, 11, …, 2, …) is a DFS over a tree whose children are "append a digit", generated on the fly. Finally, the opposite signal matters as much: if a problem only asks "is this exact word in the dictionary?", a set is simpler, lighter and just as fast, and building a trie is a mistake.</p>

  <h2 id="dsa-tri-problems"><span class="num">11</span>Classic Problems</h2>
  <p>The <a class="xref" data-note="dsa_problems">Problem Tracker</a> lists the trie problems; this section is the order in which to practise them and what each one adds. Start with <b>208 Implement Trie</b>, which is exactly the class from section 03; LeetCode replays a list of method calls such as <code>insert("apple")</code>, <code>search("app")</code>, <code>startsWith("app")</code>, and the point of its sample is that "app" is not found until it is inserted, even though "apple" already passes through its nodes. <b>2185 Counting Words With a Given Prefix</b> and <b>3043 Find the Length of the Longest Common Prefix</b> are warm-ups on the same walk.</p>
  <p>Next comes the autocomplete group: <b>677 Map Sum Pairs</b> (store a running sum in each node instead of a count), <b>2416 Sum of Prefix Scores of Strings</b> (the <code>passing</code> count from section 05, summed along each word's path) and <b>1268 Search Suggestions System</b> (top three per node, or sort plus <code>bisect</code>; say both in an interview). Then <b>211 Design Add and Search Words</b>, which is section 09's wildcard search. Then the "first end flag" group: <b>648 Replace Words</b>, <b>1233 Remove Sub-Folders from the Filesystem</b> (a folder is removed if one of its prefixes, split on "/", is already a stored folder) and <b>720 Longest Word in Dictionary</b> (every prefix of the answer must itself end a word, so the walk may only pass through end-flag nodes).</p>
  <p>The hard problems combine a trie with another technique. <b>212 Word Search II</b> is section 07. <b>1032 Stream of Characters</b> stores the words <em>reversed</em> and walks backwards over the most recent letters, so "does any word end here?" becomes a prefix question. <b>472 Concatenated Words</b> combines a trie with a DFS over cut points (dynamic programming helps), <b>421 Maximum XOR of Two Numbers</b> is the bitwise trie, and <b>336 Palindrome Pairs</b> is the hardest of the set. One classic deserves code here because it shows the single-path walk, <b>14 Longest Common Prefix</b>: the common prefix of all words is the path from the root while there is exactly one child and no word has ended yet.</p>
  <div class="fx" data-lang="py"># (Trie is the class from section 03)

def lcp_trie(strs):
    t = Trie()
    for s in strs:
        t.insert(s)
    node, prefix = t.root, []
    while len(node.children) == 1 and not node.end:   # one road, and no word stops
        ch, node = next(iter(node.children.items()))
        prefix.append(ch)
    return "".join(prefix)

def lcp_scan(strs):                                   # simpler: compare column by column
    for i, ch in enumerate(strs[0]):
        if any(i == len(s) or s[i] != ch for s in strs[1:]):
            return strs[0][:i]
    return strs[0]

for strs in [["paneer", "panipuri", "pantua"], ["dal", "dalia"], ["dosa", "pav"]]:
    print(strs, repr(lcp_trie(strs)), repr(lcp_scan(strs)))</div>
  <div class="fx" data-lang="text">['paneer', 'panipuri', 'pantua'] 'pan' 'pan'
['dal', 'dalia'] 'dal' 'dal'
['dosa', 'pav'] '' ''</div>
  <p>For "paneer", "panipuri" and "pantua" the walk follows p, a, n, then reaches a node with three children (e, i, t) and stops: "pan". For "dal" and "dalia" it stops after "dal" because a word ends there, even though there is only one child; without the <code>not node.end</code> check it would wrongly return "dal" plus more. Both versions cost O(total letters). Interviewers usually accept the simpler column scan, which needs no extra space; the trie version pays off when many prefix questions are asked about the same set of words.</p>

  <h2 id="dsa-tri-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common trie bug is forgetting the end flag in <code>search</code>. Reaching a node proves only that some word passes through it, so a search that returns True whenever the walk finishes is really <code>startsWith</code>:</p>
  <div class="fx" data-lang="py"># (Trie is the class from section 03)

def search_wrong(t, word):
    return t._walk(word) is not None             # forgets the end flag

def search(t, word):
    node = t._walk(word)
    return node is not None and node.end         # a word must end here

t = Trie()
t.insert("dal")
print("wrong:", search_wrong(t, "da"), "| right:", search(t, "da"), search(t, "dal"))</div>
  <div class="fx" data-lang="text">wrong: True | right: False True</div>
  <p>With "dal" stored, the wrong version says "da" is a dish. The fix is the one extra condition. A related slip is setting the flag on the wrong node: it belongs on the node reached after the <em>last</em> letter, not on the root or the node before.</p>
  <p>The second mistake is deleting too much. Removing the nodes of "dal" also destroys "dalia", and unsetting flags along the way of "dalia" wrongly removes "dal". Only cut a branch when its <code>passing</code> count says no other word uses it; otherwise only unset the end flag, as in section 05. Inserting the same word twice causes a similar problem: the counts go up twice and a later delete leaves a ghost count, so check whether the word is already stored first (or keep a per-word counter at the end node).</p>
  <p>The third is the <code>defaultdict</code> trie that grows while you read it. <code>node[ch]</code> on a <code>defaultdict</code> creates the missing child, so a search for "x" adds an x node and later <code>startsWith("x")</code> says True. Use <code>ch in node</code> or <code>node.get(ch)</code> whenever you are only looking. In the same spirit, the end-marker key of a nested-dict trie must be something that can never be a letter of the input; <code>"#"</code> breaks the moment a word contains "#".</p>
  <p>In Word Search II, two slips are typical: forgetting to restore the cell after exploring it (later searches then see "#" instead of a letter and miss words), and forgetting to remove <code>"$"</code> after recording a word (it is then reported once for every way it can be traced). Stopping the search after the first word found on a path is also wrong, because a longer word may continue along the same path ("ab" and "abdc").</p>
  <p>Finally, two judgement mistakes. Building a trie when the problem only needs exact membership adds code and memory for nothing; use a set. And claiming that a trie "saves memory because prefixes are shared" is wrong in Python: 100,000 names took about 84 MB as a trie and about 7 MB as a list. A trie saves time on prefix questions, not space.</p>

  <h2 id="dsa-tri-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Prefix query</b>: find, count or check the stored words that begin with a string p.</li>
    <li><b>Trie / prefix tree</b>: a tree where each edge is one letter, each node is the prefix spelled from the root, and an end flag marks complete words.</li>
    <li><b>Root</b>: the node for the empty prefix ""; it has no letter.</li>
    <li><b>End flag</b>: True at nodes where a stored word finishes; it separates "dal" (a word) from "da" (just a prefix).</li>
    <li><b>passing count</b>: number of stored words through a node; gives prefix counts in O(L) and safe deletes.</li>
    <li><b>Compressed trie / radix tree</b>: chains of single-child nodes merged into one string-labelled edge.</li>
    <li><b>Bitwise trie</b>: numbers stored as bit strings; used for maximum XOR.</li>
  </ul>
  <h3>Operations and costs</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>How</th><th>Time</th></tr>
    <tr><td>insert(w)</td><td>walk, create missing children, set end</td><td>O(L)</td></tr>
    <tr><td>search(w)</td><td>walk; fell off → False; else node.end</td><td>O(L)</td></tr>
    <tr><td>startsWith(p)</td><td>walk; fell off → False; else True</td><td>O(L)</td></tr>
    <tr><td>count with prefix</td><td>walk; read passing</td><td>O(L)</td></tr>
    <tr><td>autocomplete(p)</td><td>walk; DFS below, collect end nodes</td><td>O(L + subtree)</td></tr>
    <tr><td>top-k per key press</td><td>store k words in every node</td><td>O(1) per key after the walk</td></tr>
    <tr><td>delete(w)</td><td>walk decreasing passing; cut at 0, else unset end</td><td>O(L)</td></tr>
    <tr><td>shortest root</td><td>walk; return at first end flag</td><td>O(L)</td></tr>
    <tr><td>wildcard search</td><td>"." → try every child</td><td>O(26<sup>d</sup> · L)</td></tr>
    <tr><td>Word Search II</td><td>grid DFS following trie children; pop "$"; prune</td><td>O(R · C · 4 · 3<sup>L−1</sup>)</td></tr>
  </table>
  <p>Space: O(total letters) nodes at most, each a few hundred bytes in Python. L = word or prefix length, d = number of dots, R × C = grid size.</p>
  <h3>Trie, set or sorted list?</h3>
  <table class="tbl">
    <tr><th>Need</th><th>Use</th><th>Why</th></tr>
    <tr><td>Exact membership only</td><td>set</td><td>same O(L), far less memory</td></tr>
    <tr><td>Static list, simple prefix lookups</td><td>sorted list + <code>bisect</code></td><td>O(log N) to find the block, no extra memory</td></tr>
    <tr><td>Changing words, counts, rankings, grids, wildcards, shortest prefix</td><td>trie</td><td>prefix queries in O(L), decisions at every letter</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">root = {}
for w in words:                          # build: nested dicts, "$" = end
    node = root
    for ch in w:
        node = node.setdefault(ch, {})
    node["$"] = w

def walk(s):                             # the walk every pattern uses
    node = root
    for ch in s:
        if ch not in node:               # 'in', never node[ch] on a defaultdict
            return None
        node = node[ch]
    return node

found = walk("dal") is not None and "$" in walk("dal")   # search
prefix_ok = walk("pa") is not None                        # startsWith</div>
  <h3>Gotchas</h3>
  <ul>
    <li>search without the end flag is startsWith.</li>
    <li>Delete must not cut branches other words use, nor unset a longer word.</li>
    <li><code>defaultdict</code> reads create nodes; test with <code>in</code> or <code>.get</code>.</li>
    <li>The end-marker key must not be a possible letter.</li>
    <li>Word Search II: keep going after a match, pop "$", restore the cell.</li>
    <li>A trie saves time on prefix questions, not memory (84 MB vs 7 MB for 100k names).</li>
  </ul>

  <h2 id="dsa-tri-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a trie and what problem does it solve?</summary><div class="qa-body">A trie is a tree that stores strings letter by letter, so strings with a common start share one path. It makes prefix questions ("which words start with pa?") cost O(length of the prefix) instead of a scan over every stored word. It is used for autocomplete, spell checking, IP routing and word-search puzzles.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a trie node represent, and what does it store?</summary><div class="qa-body">A node represents the prefix spelled by the letters on the path from the root to it. It stores its children (letter → child node, usually a dict or a 26-slot array) and an end flag saying whether a stored word finishes exactly there. Counts, the word itself or a top-k list are optional extras.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a trie need an end flag?</summary><div class="qa-body">Every prefix of a stored word exists as a node, whether or not it is a word itself. With "dal" and "dalia" stored, the node for "dali" exists but "dali" is not a word, and "dal" is a word even though the path continues. The structure alone cannot tell these apart; the end flag carries that one bit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between search and startsWith?</summary><div class="qa-body">Both walk the letters and return False if a child is missing. startsWith returns True as soon as the walk finishes. search additionally requires the last node's end flag to be True. With only "dalia" stored, search("dal") is False and startsWith("dal") is True.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the time and space costs of insert, search and startsWith?</summary><div class="qa-body">Each is O(L) time, where L is the length of the word or prefix, independent of how many words are stored. Insert creates at most L nodes, so total space is O(total letters) in the worst case (no shared prefixes), multiplied by the per-node overhead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hash set or trie: how do you choose?</summary><div class="qa-body">For exact membership only, a set: it is also O(L) and uses far less memory. For prefix queries, autocomplete, counts by prefix, shortest or longest prefix matching, wildcards, or letter-by-letter search with pruning, a trie. For a static word list with simple prefix lookups, a sorted list with bisect is a lighter middle ground.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does a trie save memory compared with storing the words in a list?</summary><div class="qa-body">Usually not in Python. Shared prefixes save letters, but each node is an object with a dict costing hundreds of bytes, while a letter in a string costs one byte. In the measured run, 100,000 names took about 84 MB as a trie and about 7 MB as a list. Tries save time on prefix questions, not memory; radix trees, arrays or __slots__ reduce the overhead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you count the words starting with a prefix in O(L)?</summary><div class="qa-body">Keep a counter in every node, incremented on insert for each node along the word's path. To answer, walk to the prefix node and read its counter. Without counters you would have to DFS the whole subtree below the prefix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you delete a word without breaking other words?</summary><div class="qa-body">First confirm the word is stored. Walk down decreasing each node's passing count; when a child's count reaches 0, no other word uses that branch, so delete that child and stop. If the walk finishes, the word is a prefix of others ("dal" under "dalia"), so only set its end flag to False.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you return the top 3 suggestions for every key press quickly?</summary><div class="qa-body">Store the best three words in every node while building the trie (insert in sorted order for alphabetical results, or keep the three most frequent). Each key press then moves one node down and reads its list, so the work after building is O(1) per key. For a fixed list, an alternative is to sort it and use bisect to find the first word at or after the prefix, then take up to three that still match.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Word Search II faster with a trie than searching for each word separately?</summary><div class="qa-body">Words share prefixes, so a single DFS per cell explores all words at once instead of walking the same paths once per word. The trie also stops a path as soon as no word continues with the next letter, and removing found words and empty branches prunes further. In the measured run it was well over ten times faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a "." wildcard change the search, and what does it cost?</summary><div class="qa-body">At a dot the search cannot choose one child, so it recursively tries every child and succeeds if any branch succeeds; ordinary letters still follow one child. Without dots it is O(L). Each dot can multiply the work by up to 26, so the worst case is O(26^d · L) for d dots.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the shortest root of a word, and how does longest-prefix match differ?</summary><div class="qa-body">Walk the word in a trie of roots and return at the first node with an end flag; fall off and there is no root. Checking the flag at every step is what makes it the shortest. Longest-prefix match, used in IP routing, keeps walking, remembers the last end flag seen, and returns that when the walk ends or falls off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Dict of children or an array of 26: which would you use?</summary><div class="qa-body">In Python, a dict: most nodes have one or two children, so 26 slots per node waste memory, and a dict works for any alphabet (digits, spaces, Unicode). In C++ or Java with a fixed lowercase alphabet, an array is faster because indexing is cheaper than hashing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a compressed trie (radix tree), and why use one?</summary><div class="qa-body">It merges every chain of single-child nodes into one edge labelled with a string, so "neer" is one edge instead of four nodes. It answers the same queries with far fewer nodes, so it uses much less memory. Routers' IP lookup tables and some databases use radix trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How can a trie find the maximum XOR of two numbers in an array?</summary><div class="qa-body">Store each number as a 32-bit string in a binary trie. For each number, walk from the highest bit and at each level step to the child with the opposite bit if it exists, because a 1 in a high position of the XOR outweighs everything below it. That gives the best partner in O(32), so the whole array takes O(32 · n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you detect, in a stream of characters, whether any word from a list just ended?</summary><div class="qa-body">Insert the words reversed into a trie. After each new character, walk the trie backwards over the most recent characters (newest first); if you pass an end flag, some word ends at the current position. The walk is at most the length of the longest word, so each character costs O(max word length).</div></details>
</main>
`
});
