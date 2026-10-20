// notes/dsa/dsa_tries.js — Tries
Object.assign(TOPIC_CONTENT, {
  "dsa_tries": `<main>
<h1>Tries</h1>
  <div class="where"><span>DSA</span><span>Trees &amp; graphs</span><span>Tries</span></div>
  <p class="lead">A trie (say "try") is a tree of letters. Words that start the same share the same path, so "which dishes start with <em>pa</em>?" is answered by walking two steps, not by scanning every word. It powers autocomplete, spell-check and word-grid puzzles. This note builds it from one need, <b>Biteful's search box over 100,000 dish names</b>, used as the running example throughout: the trie node, insert / search / startsWith traced, the cost and memory bill, autocomplete with counts and rankings, Word Search II (a trie steering the backtracking search from the previous notes), Replace Words, then the Pythonic shortcuts, patterns and classic problems. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-tri-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-tri-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="60" y="6" width="520" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Trees (nodes, DFS) · Hashing (dict children) · Backtracking (grid search) · DP (sharing work)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-tri-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Tries</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · words sharing prefixes</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-tri-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-tri-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-tri-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Bit Manipulation</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">XOR trie: bits as letters</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Advanced Structures</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">segment / Fenwick trees</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Vector search (GenAI)</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">search beyond prefixes</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-tri-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Tries: 25 problems, from Counting Words With a Given Prefix to Palindrome Pairs</text>
</svg><figcaption>Reading order for this stretch: Graphs → Backtracking → Dynamic Programming → <b>Tries</b>. A trie is a tree (Trees), its children live in a dict (Hashing), and its hardest problem steers a backtracking grid search (Backtracking).</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_dp">Dynamic Programming</a>, <a class="xref" data-note="dsa_backtrack">Backtracking</a> and <a class="xref" data-note="dsa_trees">Trees</a></b><span>DP saved work by sharing answers between overlapping subproblems. Search boxes have a different overlap: thousands of words share their first letters. Trees gave nodes and DFS; <a class="xref" data-note="dsa_hashing">Hashing</a> showed that a set answers "is this exact word stored?" in O(1) but knows nothing about prefixes; Backtracking's Word Search found one word in a grid at a time.</span></li>
    <li><b>This note adds: the prefix tree</b><span>A node per prefix, insert / search / startsWith in O(L), autocomplete with counts and rankings, Word Search II (trie + backtracking), shortest-root matching (Replace Words), wildcards, and when a sorted list with <code>bisect</code> is the lighter answer.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_bits">Bit Manipulation</a> and <a class="xref" data-note="dsa_advanced">Advanced Data Structures</a></b><span>A binary trie stores numbers bit by bit to find the maximum XOR pair; segment and Fenwick trees are other "tree over the keys" structures. Practise in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>; the dict and <code>setdefault</code> tricks are in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>, recursion in <a class="xref" data-note="py_functions">Python Functions</a>.</span></li>
  </ol>

  <h2 id="dsa-tri-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next. Running example: Biteful's dish search; small menu <b>dal, dalia, dosa, pav</b> for hand traces, <b>paneer, papad, pasta, pav, poha, dal, dalia, dosa</b> (with today's order counts) for autocomplete, and 100,000 made-up dish names for timing.</p>
  <ol class="story">
    <li><b>Prefix search</b><span>Q: as a customer types "p", "pa", "pan"…, which dishes match? → a list scan checks every name on every key press: 434 ms for 120 presses over 100,000 names; a set cannot answer prefixes at all. Can similar names be stored together?</span></li>
    <li><b>The trie node</b><span>Q: what structure keeps "dal", "dalia", "dosa" together? → a tree of letters: a node per prefix, children by letter, and an end flag ("dal" ends mid-path to "dalia"). How do we build and query it?</span></li>
    <li><b>insert / search / startsWith</b><span>Q: how do the three operations walk? → insert creates missing nodes (dalia reuses d, a, l), search needs the end flag (search "da" False), startsWith does not (True): each O(L). What does that cost against a set, and in memory?</span></li>
    <li><b>Cost &amp; memory</b><span>Q: is it worth it? → prefix queries O(L) instead of O(N·L), but 100,000 names cost ~84 MB as a Python trie vs ~7 MB as a list. Now the real feature: suggestions as you type…</span></li>
    <li><b>Autocomplete</b><span>Q: list, count and rank the dishes under "pa"? → walk to the node, DFS below it (paneer, papad, pasta, pav), passing counts (4), top-k by orders (paneer 90, pav 75), and safe delete. Next: many words searched on a grid at once…</span></li>
    <li><b>Word Search II</b><span>Q: which of a list of dish names hide in the promo puzzle? → one backtracking DFS per cell, steered by the trie: dal, dosa, masala, sam; on 2,680 words, 7 ms instead of 138 ms for one search per word. Last pattern: stopping at the first word on the path…</span></li>
    <li><b>Replace Words</b><span>Q: tag each order line with its shortest base dish? → walk and return at the first end flag: "pavbhaji dalmakhani paneertikka" → "pav dal pan". Then the Pythonic shortcuts, patterns and classics.</span></li>
  </ol>

  <h2 id="dsa-tri-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Tries</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea</div>
        <ul>
          <li><b>Prefix tree</b> — one node per prefix; each edge is one letter</li>
          <li>"dal", "dalia", "dosa" share the path from d</li>
          <li><b>Root</b> = empty prefix · <b>end flag</b> = a whole word stops here</li>
          <li>💡 dictionary thumb tabs, at every depth</li>
          <li>Scan 434 ms vs trie 0.06 ms for 120 key presses</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Node &amp; operations</div>
        <ul>
          <li><code>children = {}</code>, <code>end = False</code></li>
          <li><b>insert</b>: walk, create missing, set end — O(L)</li>
          <li><b>search</b>: walk + end flag · <b>startsWith</b>: walk only</li>
          <li>⚠ search("da") False, startsWith("da") True</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">vs set / bisect</div>
        <ul>
          <li>Set: exact O(L), prefix = scan all</li>
          <li>Trie: prefix O(L), independent of N</li>
          <li>⚠ memory: ~84 MB vs ~7 MB for 100k names</li>
          <li>Sorted list + <code>bisect</code>: light, static lists</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Autocomplete</div>
        <ul>
          <li>Walk to prefix, DFS below: paneer, papad, pasta, pav</li>
          <li><code>passing</code> count → "how many start with pa?" in O(L)</li>
          <li>Top-k by orders; store top-k per node for speed</li>
          <li>Delete: cut branch at passing 0, else unset end</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Word Search II &amp; roots</div>
        <ul>
          <li>Trie + grid backtracking; stop when no child</li>
          <li><code>node.pop("$")</code> records once; prune empty branches</li>
          <li>Puzzle: dal, dosa, masala, sam</li>
          <li><b>Replace Words</b>: first end flag on the path</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns &amp; classics</div>
        <ul>
          <li>"prefix", "starts with", "autocomplete", "wildcard"</li>
          <li>Wildcard "." → branch into every child</li>
          <li>Bitwise trie → max XOR</li>
          <li>208 Implement · 211 Add &amp; Search · 1268 Suggestions</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-tri-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Prefix Search over 100k Dishes</span><span class="rm-sub">Why a list or set is slow</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-idea"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Trie Node</span><span class="rm-sub">Letters on edges, end flags</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-impl"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">insert, search, startsWith</span><span class="rm-sub">Built from scratch, traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-cost"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Trie vs Hash Set</span><span class="rm-sub">Big-O and the memory bill</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-more"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Autocomplete</span><span class="rm-sub">Count, rank, delete</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-wsii"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Word Search II</span><span class="rm-sub">Trie + backtracking</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-replace"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Replace Words</span><span class="rm-sub">First end flag on the path</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-python"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Pythonic Way</span><span class="rm-sub">Nested dicts, defaultdict, bisect</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">Trigger words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-problems"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">208, 211, 14, 1268 tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">End flag, deletes, memory</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tri-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-tri-need"><span class="num">01</span>Prefix Search over 100k Dish Names</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's search box must show matching dishes after every key press: "p", then "pa", then "pan". With 100,000 dish names across all restaurants, and a new query every key press, how do we find every name that <em>starts with</em> what has been typed, fast?</p>
  </div>
  <p>What would plain Python do? Keep the names in a list (or a set) and check every one:</p>
<div class="fx" data-lang="py">dishes = ["dal", "dalia", "dosa", "dhokla", "paneer", "papad", "pasta", "pav", "poha", "samosa"]

def starts_with_scan(words, prefix):     # what a list or set forces you to do
    return [w for w in words if w.startswith(prefix)]

print(starts_with_scan(dishes, "pa"))
print(starts_with_scan(dishes, "d"), starts_with_scan(dishes, "z"))
menu_set = set(dishes)
print("pav" in menu_set, "pa" in menu_set)   # a set knows whole words only</div>
  <div class="fx" data-lang="text">['paneer', 'papad', 'pasta', 'pav']
['dal', 'dalia', 'dosa', 'dhokla'] []
True False</div>
  <p>Correct, but every key press scans all N names, and each check compares up to L letters: O(N·L) per key. A hash set does not help: it answers "is <em>pav</em> on the menu?" in one step, but "pa" is not a stored word, and the set has no idea which stored words <em>begin</em> with "pa", because hashing scatters similar words randomly. At Biteful's scale:</p>
<div class="fx" data-lang="py">import random, time
random.seed(7)
parts = ["pa", "ne", "er", "dal", "do", "sa", "ma", "ka", "ti", "ra", "bha", "ji", "po", "ha", "ch", "ole"]
names = set()
while len(names) &lt; 100_000:                     # 100,000 distinct made-up dish names
    names.add("".join(random.choice(parts) for _ in range(random.randint(2, 6))))
names = sorted(names)
print("dish names:", len(names), "e.g.", sorted(names)[:3])

root = {}                                       # a dict-of-dicts trie; "#" = count below
for w in names:
    node = root
    for ch in w:
        node = node.setdefault(ch, {"#": 0})
        node["#"] += 1

def count_scan(prefix):                          # check every name: O(N * L)
    return sum(1 for w in names if w.startswith(prefix))

def count_trie(prefix):                          # walk len(prefix) steps: O(L)
    node = root
    for ch in prefix:
        node = node.get(ch)
        if node is None:
            return 0
    return node["#"]

queries = ["p", "pa", "pan", "pane", "panee", "paneer"] * 20     # 120 key presses
for f in (count_scan, count_trie):
    t = time.perf_counter()
    res = [f(q) for q in queries]
    ms = (time.perf_counter() - t) * 1000
    print(f"{f.__name__:11} {ms:9.2f} ms for {len(queries)} key presses | counts {res[:6]}")</div>
  <div class="fx" data-lang="text">dish names: 100000 e.g. ['bhabha', 'bhabhabha', 'bhabhabhadalbha']
count_scan     434.40 ms for 120 key presses | counts [12534, 6299, 389, 389, 25, 25]
count_trie       0.06 ms for 120 key presses | counts [12534, 6299, 389, 389, 25, 25]</div>
  <p>The scan takes about 3.6 ms per key press, and it gets slower with every new dish. The trie answer (built in the next sections) walks at most 6 letters per query and returns the same counts in microseconds, whatever N is. Notice also how quickly the matches narrow: 12,534 names start with "p", 25 with "panee".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A printed dictionary with thumb tabs. You don't read every page to find words starting with "pa". You open the "P" tab, then flip to where "pa" begins, and every word you want is right there, together. A trie is that tab system, one tab per letter, at every depth.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>prefix query</strong> asks for (or counts, or checks the existence of) every stored key that begins with a given string p. With a list or hash set it costs O(N · |p|); a structure that groups keys by their first letters can answer in O(|p|) plus the size of the answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"A set is O(1), so use a set." That is true only for exact lookups. The moment the question says "starts with", a set degrades to a full scan.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Trie Node.</b> We need words that start the same to be stored together, so that going from "p" to "pa" narrows the search instead of restarting it. What does such a structure look like?</div>

  <h2 id="dsa-tri-idea"><span class="num">02</span>The Trie Node</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"dal", "dalia" and "dosa" all start with d; "dal" and "dalia" share three letters. How do we store words so that a shared start is stored once, and how do we still know that "dal" is a dish but "da" is not?</p>
  </div>
  <p>Store words as paths in a tree. The root means "nothing typed yet". Each edge is one letter. Walking down d → a → l spells "dal". Words with the same start share the same first steps, so "dal", "dalia" and "dosa" all use the d node once, and "dal" and "dalia" share d → a → l.</p>
  <figure class="viz"><svg viewBox="0 0 600 340" width="600"><line x1="300" y1="30" x2="200" y2="85" stroke="currentColor"/><line x1="300" y1="30" x2="430" y2="85" stroke="currentColor"/><line x1="200" y1="85" x2="150" y2="140" stroke="currentColor"/><line x1="200" y1="85" x2="260" y2="140" stroke="currentColor"/><line x1="150" y1="140" x2="150" y2="195" stroke="currentColor"/><line x1="150" y1="195" x2="150" y2="250" stroke="currentColor"/><line x1="150" y1="250" x2="150" y2="305" stroke="currentColor"/><line x1="260" y1="140" x2="260" y2="195" stroke="currentColor"/><line x1="260" y1="195" x2="260" y2="250" stroke="currentColor"/><line x1="430" y1="85" x2="430" y2="140" stroke="currentColor"/><line x1="430" y1="140" x2="430" y2="195" stroke="currentColor"/><circle cx="300" cy="30" r="16" class="fs sb"/><text x="300" y="34" text-anchor="middle">·</text><circle cx="200" cy="85" r="16" class="fb sb"/><text x="200" y="89" text-anchor="middle">d</text><circle cx="430" cy="85" r="16" class="fb sb"/><text x="430" y="89" text-anchor="middle">p</text><circle cx="150" cy="140" r="16" class="fb sb"/><text x="150" y="144" text-anchor="middle">a</text><circle cx="260" cy="140" r="16" class="fb sb"/><text x="260" y="144" text-anchor="middle">o</text><circle cx="150" cy="195" r="16" class="fg sg"/><text x="150" y="199" text-anchor="middle">l</text><circle cx="150" cy="250" r="16" class="fb sb"/><text x="150" y="254" text-anchor="middle">i</text><circle cx="150" cy="305" r="16" class="fg sg"/><text x="150" y="309" text-anchor="middle">a</text><circle cx="260" cy="195" r="16" class="fb sb"/><text x="260" y="199" text-anchor="middle">s</text><circle cx="260" cy="250" r="16" class="fg sg"/><text x="260" y="254" text-anchor="middle">a</text><circle cx="430" cy="140" r="16" class="fb sb"/><text x="430" y="144" text-anchor="middle">a</text><circle cx="430" cy="195" r="16" class="fg sg"/><text x="430" y="199" text-anchor="middle">v</text><text x="322" y="34" class="tm">root = "" (empty prefix)</text><text x="180" y="72" text-anchor="end" class="tb">"d" shared by 3 dishes</text><text x="172" y="199" class="tg">dal</text><text x="172" y="309" class="tg">dalia</text><text x="282" y="254" class="tg">dosa</text><text x="452" y="199" class="tg">pav</text><text x="470" y="300" text-anchor="middle" class="tm">green = end flag True</text></svg><figcaption>The trie for dal, dalia, dosa, pav. 15 letters in the words, but only 11 letter nodes, because shared starts (d; d-a-l) are stored once. Green nodes are where a whole dish name ends; "dal" ends in the middle of the path to "dalia".</figcaption></figure>
  <p>Two things to notice:</p>
  <ul>
    <li>Every node stands for a <strong>prefix</strong>: the letters on the path from the root to it. The node under d → a means "da".</li>
    <li>Reaching a node does not mean a word exists. "da" is a node, but no dish is called "da". So each node carries an <strong>end flag</strong>: True only where a stored word finishes. "dal" needs it because the path keeps going to "dalia".</li>
  </ul>
  <p>So a node needs exactly two fields: its children (letter → next node; a Python dict, so only letters actually used take space) and the end flag.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Trie</strong> (from re<em>trie</em>val): a tree where each edge holds one character, each node represents the prefix spelled from the root, and a flag marks nodes where a complete key ends. Also called a <strong>prefix tree</strong>. A <strong>trie node</strong> = <code>children</code> (char → node) + <code>end</code> (bool), plus optional extras (counts, the word, top-k list).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Putting the letter <em>inside</em> the node and forgetting the root. In a trie the letter belongs to the edge (the dict key); the root has no letter and stands for "". This is why <code>startsWith("")</code> is always True.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: insert, search, startsWith.</b> We have the shape. How exactly does a word get added, and how do the two questions "is this a dish?" and "does any dish start with this?" walk the tree differently?</div>

  <h2 id="dsa-tri-impl"><span class="num">03</span>insert, search, startsWith (Traced)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Starting from an empty root, how do dal, dalia, dosa, pav go in, which nodes are created and which are reused, and why does search("da") say no while startsWith("da") says yes?</p>
  </div>
  <ul>
    <li><strong>insert(word)</strong>: start at the root. For each letter, go to that child, creating it if missing. At the last node, set <code>end = True</code>.</li>
    <li><strong>search(word)</strong>: walk the letters. Fall off (missing child) → False. Reach the end → return the end flag.</li>
    <li><strong>startsWith(prefix)</strong>: same walk, but reaching the end is enough. The flag does not matter.</li>
  </ul>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"implement a trie / prefix tree", "dictionary of words with insert and lookup", "count words with prefix", "starts with", "is prefix of".</p>
  </div>
  <div class="flow"><span>node = root</span><span>for ch in word: create/follow children[ch]</span><span>insert: end = True · search: return end · startsWith: return True</span><span>fell off → False</span></div>
  <h3>Inserting, by hand</h3>
  <table class="tbl out"><caption>+ = node created, = = existing node reused</caption>
    <tr><th>insert</th><th>d</th><th>a / o / p</th><th>…</th><th>end flag set on</th><th>new nodes</th></tr>
    <tr><td>dal</td><td>+d</td><td>+a</td><td>+l</td><td>l (dal)</td><td>3</td></tr>
    <tr><td>dalia</td><td>=d</td><td>=a</td><td>=l +i +a</td><td>a (dalia)</td><td>2</td></tr>
    <tr><td>dosa</td><td>=d</td><td>+o</td><td>+s +a</td><td>a (dosa)</td><td>3</td></tr>
    <tr><td>pav</td><td>+p</td><td>+a</td><td>+v</td><td>v (pav)</td><td>3</td></tr>
  </table>
<div class="fx" data-lang="py">class TrieNode:
    def __init__(self):
        self.children = {}      # letter -&gt; TrieNode
        self.end = False        # True if a whole word stops here

class Trie:
    def __init__(self):
        self.root = TrieNode()  # empty node: stands for the empty prefix ""

    def insert(self, word):
        node, steps = self.root, []
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()   # make the missing step
                steps.append(f"+{ch}")
            else:
                steps.append(f"={ch}")           # shared prefix: reuse the node
            node = node.children[ch]             # walk down one letter
        node.end = True                          # mark: a word ends here
        print(f"insert {word:6} {' '.join(steps)}")

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
for w in ["dal", "dalia", "dosa", "pav"]:
    t.insert(w)
print("search dal:", t.search("dal"), "| search da:", t.search("da"),
      "| startsWith da:", t.startsWith("da"), "| startsWith dh:", t.startsWith("dh"))
print("search dalia:", t.search("dalia"), "| search dalias:", t.search("dalias"),
      "| startsWith '':", t.startsWith(""), "| search '':", t.search(""))</div>
  <div class="fx" data-lang="text">insert dal    +d +a +l
insert dalia  =d =a =l +i +a
insert dosa   =d +o +s +a
insert pav    +p +a +v
search dal: True | search da: False | startsWith da: True | startsWith dh: False
search dalia: True | search dalias: False | startsWith '': True | search '': False</div>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600"><text x="100" y="18" text-anchor="middle" class="tb">search("dal")</text><text x="300" y="18" text-anchor="middle" class="tb">search("da")</text><text x="500" y="18" text-anchor="middle" class="tb">startsWith("dh")</text><line x1="100" y1="45" x2="100" y2="210" stroke="currentColor"/><circle cx="100" cy="45" r="15" class="fs sb"/><text x="100" y="49" text-anchor="middle">·</text><circle cx="100" cy="100" r="15" class="fb sb"/><text x="100" y="104" text-anchor="middle">d</text><circle cx="100" cy="155" r="15" class="fb sb"/><text x="100" y="159" text-anchor="middle">a</text><circle cx="100" cy="210" r="15" class="fg sg"/><text x="100" y="214" text-anchor="middle">l</text><text x="122" y="214" class="tg">end = True</text><text x="100" y="252" text-anchor="middle" class="tg">→ True</text><line x1="300" y1="45" x2="300" y2="155" stroke="currentColor"/><circle cx="300" cy="45" r="15" class="fs sb"/><text x="300" y="49" text-anchor="middle">·</text><circle cx="300" cy="100" r="15" class="fb sb"/><text x="300" y="104" text-anchor="middle">d</text><circle cx="300" cy="155" r="15" class="fr sr"/><text x="300" y="159" text-anchor="middle">a</text><text x="322" y="159" class="tr">end = False</text><text x="300" y="232" text-anchor="middle" class="tr">search → False</text><text x="300" y="252" text-anchor="middle" class="tg">startsWith → True</text><line x1="500" y1="45" x2="500" y2="100" stroke="currentColor"/><line x1="500" y1="100" x2="500" y2="155" class="sr" stroke-dasharray="4 3"/><circle cx="500" cy="45" r="15" class="fs sb"/><text x="500" y="49" text-anchor="middle">·</text><circle cx="500" cy="100" r="15" class="fb sb"/><text x="500" y="104" text-anchor="middle">d</text><circle cx="500" cy="155" r="15" fill="none" class="sr" stroke-dasharray="4 3"/><text x="500" y="159" text-anchor="middle" class="tr">h?</text><text x="522" y="159" class="tr">missing</text><text x="500" y="252" text-anchor="middle" class="tr">fell off → False</text></svg><figcaption>Three walks in the dal/dalia/dosa/pav trie. A word is found only if the walk finishes AND the last node has the end flag. startsWith only needs the walk to finish.</figcaption></figure>
  <table class="tbl out"><caption>The queries, step by step</caption>
    <tr><th>query</th><th>walk</th><th>last node's end</th><th>result</th></tr>
    <tr><td>search("dal")</td><td>root → d → a → l</td><td>True</td><td>True</td></tr>
    <tr><td>search("da")</td><td>root → d → a</td><td>False</td><td>False</td></tr>
    <tr><td>startsWith("da")</td><td>root → d → a</td><td>(not checked)</td><td>True</td></tr>
    <tr><td>startsWith("dh")</td><td>root → d → no child h</td><td>–</td><td>False (fell off)</td></tr>
    <tr><td>search("dalias")</td><td>… → a → no child s</td><td>–</td><td>False</td></tr>
  </table>
  <p>The second print line shows edge cases: <code>startsWith("")</code> is True because the root always exists; <code>search("")</code> is False because nobody inserted the empty word.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a word or prefix of length L: <strong>insert, search and startsWith are O(L) time</strong>, independent of the number of stored words N. Insert adds at most L nodes, so total space is O(total letters) in the worst case (no shared prefixes).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing <code>search</code> as "return True if the walk finishes" makes <code>search("da")</code> True. That is <code>startsWith</code>, not <code>search</code>. The end flag is the whole difference between the two.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Tries: <b>2185 Counting Words With a Given Prefix</b>, <b>208 Implement Trie (Prefix Tree)</b>, <b>3043 Find the Length of the Longest Common Prefix</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Trie vs Hash Set.</b> Every operation is O(L). A set's exact lookup is also O(L) (it hashes L letters). So what exactly do we gain, and what do all these node objects cost in memory?</div>

  <h2 id="dsa-tri-cost"><span class="num">04</span>Trie vs Hash Set: Cost and Memory</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which questions does a trie answer faster than a set or a sorted list, and is it cheaper or more expensive to store 100,000 dish names this way?</p>
  </div>
  <p>L is the length of the word or prefix you ask about, N the number of stored words. A trie's cost does not depend on N at all: finding "pav" among 10 names or 10 crore names is the same three steps.</p>
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
  <p>Sharing prefixes saves letters, but every node is a Python object with its own dict:</p>
<div class="fx" data-lang="py">import random, tracemalloc
random.seed(7)
def count_nodes(node):
    return 1 + sum(count_nodes(c) for c in node.children.values())

words = ["paneer", "papad", "pasta", "pav", "paratha", "pakora"]
t = Trie()
for w in words:
    t.insert(w)
print("letters typed :", sum(len(w) for w in words))
print("trie nodes    :", count_nodes(t.root) - 1)    # minus the empty root

parts = ["pa", "ne", "er", "dal", "do", "sa", "ma", "ka", "ti", "ra", "bha", "ji", "po", "ha", "ch", "ole"]
names = set()
while len(names) &lt; 100_000:                     # 100,000 distinct made-up dish names
    names.add("".join(random.choice(parts) for _ in range(random.randint(2, 6))))
names = sorted(names)
tracemalloc.start()
as_list = list(names); m1 = tracemalloc.get_traced_memory()[0]
big = Trie()
for w in names:
    big.insert(w)
m2 = tracemalloc.get_traced_memory()[0]
tracemalloc.stop()
print(f"100,000 names: {sum(map(len, names)):,} letters, {count_nodes(big.root) - 1:,} trie nodes")
print(f"trie memory ~{(m2 - m1) / 1e6:.0f} MB vs the list itself (pointers) ~{m1 / 1e6:.1f} MB + strings ~{sum(len(w) + 49 for w in names) / 1e6:.1f} MB")</div>
  <div class="fx" data-lang="text">letters typed : 32
trie nodes    : 22
100,000 names: 1,091,258 letters, 340,184 trie nodes
trie memory ~84 MB vs the list itself (pointers) ~0.8 MB + strings ~6.0 MB</div>
  <p>Six "pa…" dishes: 32 letters became 22 nodes. Sounds like a win. But at Biteful's scale, 1.09 million letters became 340,184 nodes taking about 84 MB, against about 7 MB for the plain list of strings: roughly 12× more. In Python each node is an object plus a dict, a few hundred bytes, while a letter inside a string costs 1 byte. Words with few shared starts (random IDs) make it worse.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Choose a trie for its <em>queries</em> (prefix search, shortest/longest prefix match, walking letter by letter with backtracking), not to save memory. If you only need exact lookups, a set is simpler and lighter. Ways to shrink a trie: <code>__slots__</code> on the node class, a 26-slot array instead of a dict (fast but wasteful when sparse), or a <strong>compressed trie (radix tree)</strong> that stores a run like "neer" on one edge.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>Trie space = O(number of distinct prefixes) nodes ≤ O(total letters), times the per-node overhead (in Python, hundreds of bytes). A <strong>radix tree</strong> merges every chain of single-child nodes into one edge labelled with a string.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: claiming a trie saves memory</span>
    <p>In Python each node is a heavy object. A trie saves <em>time</em> on prefix questions; it usually costs memory. Say so in interviews.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Autocomplete.</b> startsWith only says yes or no. The search box must <em>list</em> the matching dishes, say how many there are, rank them by popularity, and stay correct when a restaurant removes a dish.</div>

  <h2 id="dsa-tri-more"><span class="num">05</span>Autocomplete: List, Count, Rank, Delete</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The customer types "pa". Show every matching dish in order, the number of matches, the two most-ordered ones first, and keep all of that right after "pasta" is taken off the menu.</p>
  </div>
  <p>Each extra feature is a small field on the node:</p>
  <ul>
    <li><strong>Autocomplete</strong>: walk to the prefix node, then DFS below it, collecting every node with the end flag. Visiting children in sorted order gives alphabetical results.</li>
    <li><strong>Count words with a prefix</strong>: every node keeps <code>passing</code>, the number of stored words whose path goes through it. Increase it on insert. The answer is the prefix node's count, O(L).</li>
    <li><strong>Top suggestions</strong>: store a frequency (orders today) at word ends and pick the best k.</li>
    <li><strong>Delete</strong>: walk down decreasing <code>passing</code>. If a child's count drops to 0, no other word needs that branch: cut it off and stop. If the walk finishes, the word was a prefix of others ("dal" inside "dalia"), so only unset its end flag.</li>
  </ul>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"autocomplete", "type-ahead", "suggestions after each character", "top 3 products", "sum / count of words with prefix", "map sum".</p>
  </div>
  <div class="flow"><span>walk to the prefix node (O(L))</span><span>DFS below it, collect end nodes</span><span>count = node.passing</span><span>rank by freq; delete via passing counts</span></div>
  <table class="tbl out"><caption>Today's menu and orders</caption>
    <tr><th>dish</th><td>paneer</td><td>papad</td><td>pasta</td><td>pav</td><td>poha</td><td>dal</td><td>dalia</td><td>dosa</td></tr>
    <tr><th>orders</th><td>90</td><td>40</td><td>40</td><td>75</td><td>12</td><td>60</td><td>8</td><td>95</td></tr>
  </table>
<div class="fx" data-lang="py">import heapq

class Node:
    def __init__(self):
        self.children = {}
        self.end = False
        self.passing = 0         # how many stored dishes go through this node
        self.freq = 0            # orders today, for ranking suggestions

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
        if node and node.end:                    # already stored: just update
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

    def delete(self, word):
        node = self._walk(word)
        if node is None or not node.end:
            return False
        node = self.root
        node.passing -= 1
        for ch in word:
            child = node.children[ch]
            child.passing -= 1
            if child.passing == 0:               # no other dish uses this branch
                del node.children[ch]            # cut it off in one go
                return True
            node = child
        node.end = False                         # dish was a prefix of others
        return True

    def autocomplete(self, prefix):              # all dishes, alphabetical
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

ds = DishSearch()
for dish, orders in [("paneer", 90), ("papad", 40), ("pasta", 40), ("pav", 75), ("poha", 12),
                     ("dal", 60), ("dalia", 8), ("dosa", 95)]:
    ds.insert(dish, orders)
print(ds.autocomplete("pa"), ds.count_prefix("pa"), ds.count_prefix("p"))
print(ds.top("pa", 2), ds.top("p", 3), ds.top("d", 3))
print(ds.delete("pasta"), ds.delete("pasta"), ds.autocomplete("pa"), ds.count_prefix("pa"))
print(ds.delete("da"), ds.delete("dal"), ds.autocomplete("da"), ds.count_prefix(""))</div>
  <div class="fx" data-lang="text">['paneer', 'papad', 'pasta', 'pav'] 4 5
['paneer', 'pav'] ['paneer', 'pav', 'papad'] ['dosa', 'dal', 'dalia']
True False ['paneer', 'papad', 'pav'] 3
False True ['dalia'] 6</div>
  <p>Reading the output: "pa" matches 4 dishes, "p" 5. Ranked by orders, paneer (90) and pav (75) lead; for "p" the third is papad, which ties pasta at 40 and wins alphabetically. Deleting "pasta" twice gives True then False. Deleting "da" is False because it was never a dish, only a prefix. Deleting "dal" keeps "dalia" (only the end flag is unset). The root's count is the number of dishes left: 6.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Autocomplete</strong> with a trie: O(L) to reach the prefix node plus O(size of its subtree) to list the matches. Storing a <code>passing</code> count per node answers "how many?" in O(L); storing the best k words per node answers "top k" in O(L).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Inserting the same word twice. Without the "already stored" check, <code>passing</code> counts go up twice and delete leaves a ghost count behind. Decide: either ignore duplicates (as here) or keep a per-word counter at the end node.</p>
  </div>
  <p><code>top</code> above collects every match and then picks k: fine for one restaurant's menu. Search engines with millions of words store the best k words <strong>in every node</strong> instead, so a key press costs O(L) no matter how many words match. That is Search Suggestions System (section 10).</p>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Tries: <b>677 Map Sum Pairs</b> (sum stored per node), <b>2416 Sum of Prefix Scores of Strings</b> (passing counts), <b>1268 Search Suggestions System</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Word Search II.</b> So far a single walk followed a typed prefix. Biteful's promo puzzle asks the reverse: given a whole list of dish names, which can be traced in a letter grid? Backtracking found one word per search; with many words that repeats the same paths.</div>

  <h2 id="dsa-tri-wsii"><span class="num">06</span>Word Search II: Trie + Backtracking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Backtracking note searched the promo puzzle for one word at a time. With a list of dish names, running one grid search per word re-walks the same cells again and again ("dosa" and "dosas" begin the same). Can one search find all of them?</p>
  </div>
  <p>Put all words in a trie and run <strong>one</strong> backtracking DFS from each cell, moving on the grid and in the trie together. The trie node says which letters can come next; if the next cell's letter is not a child, stop: no word goes that way. Mark the cell while it is on the path, unmark on the way back (exactly the Backtracking template).</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"find all words from a list in a grid / board", "many patterns in one text", "stream of characters, does any word end here", "concatenated words".</p>
  </div>
  <div class="flow"><span>build a trie of all words</span><span>DFS from each cell with the trie node</span><span>"$" here → record, pop it</span><span>mark → neighbours that are children → unmark</span><span>prune empty branches</span></div>
  <table class="tbl out"><caption>The promo puzzle (from the Backtracking note)</caption>
    <tr><th></th><th>c0</th><th>c1</th><th>c2</th><th>c3</th></tr>
    <tr><th>r0</th><td>d</td><td>a</td><td>l</td><td>v</td></tr>
    <tr><th>r1</th><td>o</td><td>s</td><td>a</td><td>i</td></tr>
    <tr><th>r2</th><td>m</td><td>a</td><td>h</td><td>d</td></tr>
  </table>
  <table class="tbl out"><caption>Traced from cell (0,0) "d" with words dosa, dal, dosas, …</caption>
    <tr><th>cell</th><th>trie node</th><th>action</th></tr>
    <tr><td>(0,0) d</td><td>"d"</td><td>children a, o; neighbours: (1,0) o is a child → go</td></tr>
    <tr><td>(1,0) o</td><td>"do"</td><td>child s; neighbour (1,1) s → go</td></tr>
    <tr><td>(1,1) s</td><td>"dos"</td><td>child a; neighbours (2,1) a, (0,1) a, (1,2) a → try (2,1)</td></tr>
    <tr><td>(2,1) a</td><td>"dosa"</td><td>"$" → record <b>dosa</b>; child s ("dosas") but no unused s nearby → back</td></tr>
    <tr><td>back at (0,0)</td><td>"d"</td><td>neighbour (0,1) a → "da" → (0,2) l → "dal": record <b>dal</b></td></tr>
  </table>
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
        board[r][c] = "#"                          # choose: mark visited on this path
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 &lt;= nr &lt; rows and 0 &lt;= nc &lt; cols and board[nr][nc] in node:
                dfs(nr, nc, node)                  # explore only letters the trie allows
        board[r][c] = ch                           # un-choose (backtrack)
        if not node:                               # branch fully used up:
            parent.pop(ch)                         # prune it from the trie

    for r in range(rows):
        for c in range(cols):
            if board[r][c] in root:
                dfs(r, c, root)
    return found

puzzle = [list("dalv"), list("osai"), list("mahd")]       # Biteful's promo puzzle
print(sorted(find_words(puzzle, ["dosa", "dal", "masala", "dosas", "vada", "halva", "sam"])))
print(["".join(row) for row in puzzle])                   # restored
board = [list("oaan"), list("etae"), list("ihkr"), list("iflv")]   # LeetCode 212's example
print(sorted(find_words(board, ["oath", "pea", "eat", "rain"])))
print(find_words([list("ab"), list("cd")], ["abdc", "abcd", "ab", "dcba"]))
print(find_words([list("a")], ["a", "aa"]))</div>
  <div class="fx" data-lang="text">['dal', 'dosa', 'masala', 'sam']
['dalv', 'osai', 'mahd']
['eat', 'oath']
['ab', 'abdc']
['a']</div>
  <p>dal, dosa, masala and sam are found; dosas (only one s), vada and halva are not. The board is restored after the search. Three tricks make it fast: the trie stops dead paths early; <code>node.pop("$")</code> records each word once; and removing trie branches that are used up keeps later searches from walking them again. How much faster, on a 12 × 12 board with a few thousand candidate words:</p>
<div class="fx" data-lang="py">import random, time

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
words = list({"".join(random.choice("aadlmopsv") for _ in range(random.randint(3, 7))) for _ in range(3000)})
t = time.perf_counter(); a = sorted(w for w in words if exist([row[:] for row in board], w)); t1 = time.perf_counter() - t
t = time.perf_counter(); b = sorted(find_words([row[:] for row in board], words)); t2 = time.perf_counter() - t
print(f"{len(words)} words on a 12x12 board: found {len(a)}; same answer: {a == b}")
print(f"one search per word: {t1*1000:7.1f} ms | one trie-guided search: {t2*1000:7.1f} ms")</div>
  <div class="fx" data-lang="text">2680 words on a 12x12 board: found 768; same answer: True
one search per word:   138.1 ms | one trie-guided search:     7.4 ms</div>
  <p>Same 768 words found either way; one trie-guided search is about 18× faster than one backtracking search per word, because shared prefixes are walked once. Worst case O(R·C·4·3<sup>L−1</sup>) for longest word L, but pruning makes it far faster in practice.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Word Search II</strong>: trie of the word list + backtracking DFS on the grid where each step must follow a trie child. Time O(R·C·4·3<sup>L−1</sup>) worst case; space O(total letters) for the trie + O(L) recursion.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Stopping the DFS when a word is found. "ab" and "abdc" share a path; after recording "ab", keep going. Also: the same word can be traced twice; without removing <code>"$"</code> it appears twice in the result.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Tries: <b>212 Word Search II</b>, <b>1032 Stream of Characters</b> (trie of reversed words), <b>472 Concatenated Words</b> (trie + DFS over cut points).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Replace Words.</b> Word Search II needed the <em>whole</em> word to match. Sometimes we want the opposite: walk a long word and stop at the <em>first</em> stored word met on the way, its shortest stored prefix.</div>

  <h2 id="dsa-tri-replace"><span class="num">07</span>Replace Words: First End Flag on the Path</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Order lines arrive as free text: "pavbhaji dalmakhani paneertikka masaladosa". The kitchen dashboard groups them by base dish (pav, dal, paneer…). For each word, which is the <em>shortest</em> base dish name it starts with, if any?</p>
  </div>
  <p>Build a trie of the base names (the "roots"). Walk each word letter by letter; the first node with an end flag is the shortest root, so return it at once. If you fall off the trie first, no root matches: keep the word unchanged.</p>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"shortest root / prefix", "replace with its prefix", "is any word a prefix of another", "remove sub-folders", "short encoding".</p>
  </div>
  <div class="flow"><span>walk the word in the roots trie</span><span>end flag here → return the root</span><span>missing child → keep the word</span></div>
  <table class="tbl out"><caption>Roots: pav, dal, paneer, pan</caption>
    <tr><th>word</th><th>walk</th><th>first end flag</th><th>output</th></tr>
    <tr><td>pavbhaji</td><td>p → a → v</td><td>at "pav"</td><td>pav</td></tr>
    <tr><td>dalmakhani</td><td>d → a → l</td><td>at "dal"</td><td>dal</td></tr>
    <tr><td>paneertikka</td><td>p → a → n</td><td>at "pan" (before "paneer")</td><td>pan</td></tr>
    <tr><td>masaladosa</td><td>no child m at the root</td><td>–</td><td>masaladosa</td></tr>
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
                return node["$"]               # first (shortest) root on the way
            if ch not in node:
                return word                    # no root matches: keep the word
            node = node[ch]
        return node.get("$", word)
    return " ".join(shortest_root(w) for w in sentence.split())

# Biteful tags each order line with its base dish
print(replace_words(["pav", "dal", "paneer", "pan"], "pavbhaji dalmakhani paneertikka masaladosa dal"))
print(replace_words(["cat", "bat", "rat"], "the cattle was rattled by the battery"))
print(replace_words(["a", "b", "c"], "aadsfasf absbs bbab cadsfafs"))
print(replace_words(["ab", "abc"], "abc ab a"))</div>
  <div class="fx" data-lang="text">pav dal pan masaladosa dal
the cat was rat by the bat
a a b c
ab ab a</div>
  <p>"paneertikka" becomes "pan", not "paneer": the walk meets the shorter root first, which is exactly what the problem asks. O(total letters in roots + sentence). The brute force tries every prefix of every word in a set, O(L²) per word because each slice builds a new string.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shortest-prefix match</strong>: walk the query in a trie of keys and return at the first node whose end flag is set. O(L) per query. The longest-prefix match (IP routing) keeps walking and remembers the last end flag seen.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Checking the end flag only after the loop. Then "paneertikka" would never stop at "pan"; you would return the root only if the whole word were a root. Check the flag at every step, before moving on.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Tries: <b>648 Replace Words</b>, <b>1233 Remove Sub-Folders from the Filesystem</b>, <b>720 Longest Word in Dictionary</b> (every prefix must end a word).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Pythonic Way.</b> We wrote node classes for clarity. Interview code is shorter with nested dicts, and sometimes a sorted list with <code>bisect</code> answers prefix queries with no trie at all.</div>

  <h2 id="dsa-tri-python"><span class="num">08</span>The Pythonic Way</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Python has no trie in the standard library. What is the shortest correct way to write one, and when can we skip it entirely?</p>
  </div>
  <p>In interviews, many people skip the node class and use nested dicts directly. Same structure, less code:</p>
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

print(make_trie(["dal", "dalia", "pav"]))

# 2. self-building trie: every missing key creates a new level automatically
Tree = lambda: defaultdict(Tree)
t = Tree()
for w in ["dal", "dosa"]:
    node = t
    for ch in w:
        node = node[ch]
    node["$"] = True
print(list(t["d"]), "x" in t["d"])

# 3. no trie at all: sorted list + bisect finds the prefix block in O(log n)
words = sorted(["paneer", "papad", "pasta", "pav", "poha", "dal", "dosa"])
def with_prefix(prefix):
    i = bisect.bisect_left(words, prefix)          # first word &gt;= prefix
    out = []
    while i &lt; len(words) and words[i].startswith(prefix):
        out.append(words[i])
        i += 1
    return out
print(words, with_prefix("pa"), with_prefix("q"))</div>
  <div class="fx" data-lang="text">{'d': {'a': {'l': {'$': 'dal', 'i': {'a': {'$': 'dalia'}}}}}, 'p': {'a': {'v': {'$': 'pav'}}}}
['a', 'o'] False
['dal', 'dosa', 'paneer', 'papad', 'pasta', 'pav', 'poha'] ['paneer', 'papad', 'pasta', 'pav'] []</div>
  <div class="cards">
    <div><b>Nested dicts</b><p><code>node = node.setdefault(ch, {})</code> is the whole insert loop. A special key like <code>"$"</code> is the end flag and can hold the word.</p><small>Pick a key that can't be a letter</small></div>
    <div><b>defaultdict trie</b><p>One line, and children appear by themselves.</p><small>⚠ Even reading <code>t["x"]</code> creates a node; test with <code>in</code></small></div>
    <div><b>sorted + bisect</b><p>All words with a prefix sit in one block of a sorted list. <code>bisect_left</code> finds its start in O(log N).</p><small>Best when the word list doesn't change</small></div>
  </div>
  <p>Practical rule: for a static list and simple prefix lookups, sort + <code>bisect</code> is shortest and uses least memory. Reach for a trie when you walk letter by letter and need to stop or branch at each step (wildcards, grids, shortest-root match), or when words are added all the time.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>dict-of-dicts trie</strong> represents each node as a dict from letters to child dicts, with a reserved key (here <code>"$"</code>) for the end marker. It is the same trie as the class version, written with built-ins.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: end marker that is also a letter</span>
    <p>Using <code>"*"</code> or <code>"#"</code> as the end key breaks when the input may contain that character. Pick something impossible for the input, or use a node class.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing the Pattern.</b> We have seen walk-then-collect, trie + grid DFS and first-end-on-path. Which words in a problem point to which, and what other trie patterns exist (wildcards, XOR)?</div>

  <h2 id="dsa-tri-patterns"><span class="num">09</span>Choosing the Pattern</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Facing a new problem with a dictionary of words, how do we know a trie helps, and which walk to write?</p>
  </div>
  <table class="tbl">
    <tr><th>Signal words</th><th>Pattern</th><th>Shape of the code</th><th>Section</th></tr>
    <tr><td>"prefix", "starts with", "autocomplete", "type-ahead"</td><td><strong>Walk then collect</strong></td><td>Walk to prefix node; DFS for ends, or read a stored count / top-k list</td><td>03, 05</td></tr>
    <tr><td>"find all words from a list in a grid / string"</td><td><strong>Trie + DFS together</strong></td><td>Move on the grid and in the trie at the same time; stop when the trie has no child</td><td>06</td></tr>
    <tr><td>"shortest root", "replace with prefix", "is any word a prefix of"</td><td><strong>First end on the path</strong></td><td>Walk the word; return at the first end flag</td><td>07</td></tr>
    <tr><td>"wildcard", "." matches any letter</td><td><strong>Branching search</strong></td><td>On "." loop over all children; otherwise follow one</td><td>10</td></tr>
    <tr><td>"longest common prefix", "longest word built one letter at a time"</td><td><strong>Single-path walk</strong></td><td>Walk while there is exactly one child (and no end)</td><td>10</td></tr>
    <tr><td>"lexicographical order of numbers", "k-th smallest in dictionary order"</td><td><strong>Implicit trie</strong></td><td>Treat numbers as digit strings; DFS in digit order without building nodes</td><td>–</td></tr>
    <tr><td>"maximum XOR of two numbers"</td><td><strong>Bitwise trie</strong></td><td>Insert numbers as 32 bits; for each, greedily take the opposite bit</td><td>see <a class="xref" data-note="dsa_bits">Bits</a></td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 255" width="600"><text x="300" y="16" text-anchor="middle" class="tb">search(".ad") in a trie of bad, dad, mad</text><line x1="300" y1="40" x2="180" y2="95" class="sg" stroke-width="2"/><line x1="300" y1="40" x2="300" y2="95" class="sg" stroke-width="2"/><line x1="300" y1="40" x2="420" y2="95" class="sg" stroke-width="2"/><line x1="180" y1="95" x2="180" y2="150" stroke="currentColor"/><line x1="300" y1="95" x2="300" y2="150" stroke="currentColor"/><line x1="420" y1="95" x2="420" y2="150" stroke="currentColor"/><line x1="180" y1="150" x2="180" y2="205" stroke="currentColor"/><line x1="300" y1="150" x2="300" y2="205" stroke="currentColor"/><line x1="420" y1="150" x2="420" y2="205" stroke="currentColor"/><circle cx="300" cy="40" r="15" class="fs sb"/><text x="300" y="44" text-anchor="middle">·</text><circle cx="180" cy="95" r="15" class="fb sb"/><text x="180" y="99" text-anchor="middle">b</text><circle cx="300" cy="95" r="15" class="fb sb"/><text x="300" y="99" text-anchor="middle">d</text><circle cx="420" cy="95" r="15" class="fb sb"/><text x="420" y="99" text-anchor="middle">m</text><circle cx="180" cy="150" r="15" class="fb sb"/><text x="180" y="154" text-anchor="middle">a</text><circle cx="300" cy="150" r="15" class="fb sb"/><text x="300" y="154" text-anchor="middle">a</text><circle cx="420" cy="150" r="15" class="fb sb"/><text x="420" y="154" text-anchor="middle">a</text><circle cx="180" cy="205" r="15" class="fg sg"/><text x="180" y="209" text-anchor="middle">d</text><circle cx="300" cy="205" r="15" class="fg sg"/><text x="300" y="209" text-anchor="middle">d</text><circle cx="420" cy="205" r="15" class="fg sg"/><text x="420" y="209" text-anchor="middle">d</text><text x="20" y="72" class="tg">"." → try all</text><text x="20" y="154" class="tm">"a" → one child</text><text x="20" y="209" class="tm">"d" → end?</text><text x="445" y="209" class="tg">yes → True</text><text x="300" y="245" text-anchor="middle" class="tm">the first branch that succeeds stops the search (any() short-circuits)</text></svg><figcaption>A wildcard turns the single walk into a small DFS. Each "." multiplies the paths to try by the number of children, so many dots on a big trie get slow.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Building a trie for a problem that only needs exact membership ("is this word in the dictionary?"). A set is simpler, lighter and just as fast.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Tries: <b>386 Lexicographical Numbers</b> (implicit trie), <b>421 Maximum XOR of Two Numbers in an Array</b> (bitwise trie), <b>820 Short Encoding of Words</b> (trie of reversed words).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> The patterns, applied to the exact interview problems: the LeetCode class interface, wildcard search, longest common prefix and per-keystroke suggestions.</div>

  <h2 id="dsa-tri-problems"><span class="num">10</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Do the templates hold up on the standard interview problems, with their call formats and edge cases (empty strings, no match, words that are prefixes of others)?</p>
  </div>
  <p>Already solved above: <b>Word Search II</b> (section 06) and <b>Replace Words</b> (section 07).</p>
  <h3>1. Implement Trie (LeetCode 208)</h3>
  <p>Exactly the <code>Trie</code> class from section 03 (without the print). LeetCode calls methods by name from two lists; this driver replays their sample.</p>
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

  <h3>3. Longest Common Prefix (LeetCode 14)</h3>
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

  <h3>4. Search Suggestions System (LeetCode 1268)</h3>
  <p>After each letter typed of <code>search_word</code>, return up to 3 products that start with what has been typed so far, in alphabetical order. This is Biteful's search box with a fixed k = 3: insert products in sorted order and let each node keep the first 3 that pass through it. Then each key press just reads a list.</p>
  <table class="tbl out"><caption>Products: mobile, moneypot, monitor, mouse, mousepad (sorted)</caption>
    <tr><th>typed</th><th>node keeps</th></tr>
    <tr><td>m</td><td>mobile, moneypot, monitor</td></tr>
    <tr><td>mo</td><td>mobile, moneypot, monitor</td></tr>
    <tr><td>mou</td><td>mouse, mousepad</td></tr>
    <tr><td>mous, mouse</td><td>mouse, mousepad</td></tr>
  </table>
<div class="fx" data-lang="py">import bisect

def suggested_products(products, search_word):
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
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Tries: <b>208 Implement Trie (Prefix Tree)</b>, <b>211 Design Add and Search Words Data Structure</b>, <b>1268 Search Suggestions System</b>, <b>2452 Words Within Two Edits of Dictionary</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Trie code is short; its bugs hide in the end flag, in deletes, and in reads that quietly create nodes.</div>

  <h2 id="dsa-tri-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which slips make a trie answer "yes" for prefixes that are not words, lose words on delete, or grow while you only read it?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the end flag</span>
    <p>Reaching a node only proves a prefix exists. <code>search</code> must also check <code>node.end</code>. Mark the end on the last node, not on the root or the node before it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deleting too much</span>
    <p>Deleting "dal" must not remove the nodes "dalia" uses; deleting "dalia" must not unset "dal". Only cut branches nobody else passes through (the <code>passing</code> count), otherwise just unset the flag.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: defaultdict lookups that create nodes</span>
    <p>With a <code>defaultdict</code> trie, <code>node[ch]</code> in a search silently adds the letter. Your trie grows during reads and <code>startsWith</code> starts returning True for everything. Use <code>ch in node</code> or <code>node.get(ch)</code> when reading.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: not restoring the grid / not removing found words</span>
    <p>In Word Search II, forgetting to unmark a cell breaks later searches; forgetting <code>pop("$")</code> reports a word twice.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: claiming a trie saves memory</span>
    <p>84 MB vs about 7 MB for 100,000 names. A trie saves <em>time</em> on prefix questions, not memory.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Seven ideas built on one node with two fields. How does each build on the last, and what did each produce for Biteful's search box?</div>

  <h2 id="dsa-tri-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Seen together: which ideas are the core structure, which are walks over it, and which borrow from earlier notes (Trees, Hashing, Backtracking)?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-tri-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="44" rx="7" class="fr sr"/><text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">prefix search is slow</text><text x="110" y="45" text-anchor="middle" class="tm" font-size="10">scan 434 ms / 120 presses</text>
<line x1="210" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-tri-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">trie node</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">children dict + end flag</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-tri-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">insert / search / startsWith</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">O(L); "da": False / True</text>
<line x1="555" y1="54" x2="555" y2="86" stroke="currentColor" marker-end="url(#dsa-tri-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="ft st"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">cost &amp; memory</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">fast prefixes, ~12× memory</text>
<line x1="510" y1="132" x2="110" y2="168" stroke="currentColor" marker-end="url(#dsa-tri-a9)"/>
<line x1="540" y1="132" x2="330" y2="168" stroke="currentColor" marker-end="url(#dsa-tri-a9)"/>
<line x1="570" y1="132" x2="555" y2="168" stroke="currentColor" marker-end="url(#dsa-tri-a9)"/>
<rect x="10" y="170" width="200" height="50" rx="7" class="fg sg"/><text x="110" y="190" text-anchor="middle" font-size="11" font-weight="700">autocomplete (walk + DFS)</text><text x="110" y="207" text-anchor="middle" class="tm" font-size="10">pa → 4 dishes; top paneer, pav</text>
<rect x="240" y="170" width="180" height="50" rx="7" class="fg sg"/><text x="330" y="190" text-anchor="middle" font-size="11" font-weight="700">Word Search II</text><text x="330" y="207" text-anchor="middle" class="tm" font-size="10">trie + backtracking: 4 found</text>
<rect x="460" y="170" width="190" height="50" rx="7" class="fg sg"/><text x="555" y="190" text-anchor="middle" font-size="11" font-weight="700">Replace Words</text><text x="555" y="207" text-anchor="middle" class="tm" font-size="10">first end flag: pav, dal, pan</text>
<rect x="240" y="250" width="180" height="44" rx="7" class="fv"/><text x="330" y="269" text-anchor="middle" font-size="11.5" font-weight="700">Backtracking note</text><text x="330" y="285" text-anchor="middle" class="tm" font-size="10">mark / explore / unmark</text>
<line x1="330" y1="250" x2="330" y2="222" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-tri-a9)"/>
<rect x="10" y="250" width="200" height="44" rx="7" class="fv"/><text x="110" y="269" text-anchor="middle" font-size="11.5" font-weight="700">Trees note</text><text x="110" y="285" text-anchor="middle" class="tm" font-size="10">DFS below a node</text>
<line x1="110" y1="250" x2="110" y2="222" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-tri-a9)"/>
</svg><figcaption>One node type with two fields supports three O(L) walks. Everything after that is a walk with a different stopping rule: collect the whole subtree (autocomplete), follow the grid (Word Search II), or stop at the first end flag (Replace Words). Dashed arrows: ideas borrowed from earlier notes.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's dish search</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Prefix search need</td><td>list / set scan</td><td>why not a list or set?</td><td>434 ms vs 0.06 ms for 120 presses</td><td>diagnosing slow "starts with"</td></tr>
    <tr><td>Trie node</td><td>tree + dict + end flag</td><td>how to store shared starts?</td><td>dal, dalia, dosa, pav → 11 nodes for 15 letters</td><td>any word set with prefix queries</td></tr>
    <tr><td>insert / search / startsWith</td><td>a walk from the root</td><td>is it a word? a prefix?</td><td>search("da") False, startsWith("da") True</td><td>Implement Trie</td></tr>
    <tr><td>Cost &amp; memory</td><td>node count × overhead</td><td>worth it?</td><td>~84 MB vs ~7 MB for 100k names</td><td>choosing trie vs set vs bisect</td></tr>
    <tr><td>Autocomplete</td><td>walk + DFS + counts</td><td>list, count, rank, delete?</td><td>pa → paneer, papad, pasta, pav; 4; top 2 paneer, pav</td><td>search boxes</td></tr>
    <tr><td>Word Search II</td><td>trie + grid backtracking</td><td>which words hide in a grid?</td><td>dal, dosa, masala, sam; 18× faster at scale</td><td>many words, one board</td></tr>
    <tr><td>Replace Words</td><td>walk + first end flag</td><td>shortest stored prefix?</td><td>pavbhaji → pav, paneertikka → pan</td><td>roots, sub-folders</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a trie turns "which words start with p?" into a walk of |p| steps by storing every prefix once as a node; each pattern is the same walk with a different rule for what to do along the way (stop at the end flag, collect the subtree, follow a grid, branch on a wildcard).</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_bits">Bit Manipulation</a>: a trie whose "letters" are the bits of numbers (0 or 1) finds the pair with the largest XOR by always stepping to the opposite bit. Bits themselves, and the masks used in bitmask DP, are the next topic.</div>

  <h2 id="dsa-tri-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: Biteful's dish search. Hand traces on <b>dal, dalia, dosa, pav</b>; autocomplete on <b>paneer 90, papad 40, pasta 40, pav 75, poha 12, dal 60, dalia 8, dosa 95</b> (orders today); 100,000 made-up names for timing; promo puzzle dalv / osai / mahd.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On the dish search</th><th>Weakness → next</th></tr>
    <tr><td>Prefix search</td><td>which names start with p?</td><td>scan 3.6 ms per key press</td><td>set can't do prefixes</td></tr>
    <tr><td>Trie node</td><td>store shared starts once?</td><td>11 nodes for 15 letters</td><td>how to build/query</td></tr>
    <tr><td>insert / search / startsWith</td><td>word? prefix?</td><td>"da": False / True</td><td>worth the memory?</td></tr>
    <tr><td>Cost &amp; memory</td><td>trie vs set vs bisect</td><td>O(L) prefix; ~12× memory</td><td>need lists and rankings</td></tr>
    <tr><td>Autocomplete</td><td>list, count, rank, delete</td><td>pa: 4 dishes; paneer, pav</td><td>many words in a grid</td></tr>
    <tr><td>Word Search II</td><td>all words in a board</td><td>dal, dosa, masala, sam</td><td>shortest prefix instead</td></tr>
    <tr><td>Replace Words</td><td>shortest root</td><td>pav, dal, pan</td><td>→ Pythonic forms, patterns</td></tr>
  </table>
  <h3>Operations and costs</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>How</th><th>Time</th></tr>
    <tr><td>insert(w)</td><td>walk, create missing children, end = True</td><td>O(L)</td></tr>
    <tr><td>search(w)</td><td>walk; fell off → False; else node.end</td><td>O(L)</td></tr>
    <tr><td>startsWith(p)</td><td>walk; fell off → False; else True</td><td>O(L)</td></tr>
    <tr><td>count_prefix(p)</td><td>walk; read node.passing</td><td>O(L)</td></tr>
    <tr><td>autocomplete(p)</td><td>walk; DFS below, collect end nodes (sorted children = alphabetical)</td><td>O(L + subtree)</td></tr>
    <tr><td>delete(w)</td><td>walk decreasing passing; cut child at 0, else unset end</td><td>O(L)</td></tr>
    <tr><td>shortest root</td><td>walk; return at first end flag</td><td>O(L)</td></tr>
    <tr><td>wildcard search</td><td>"." → try every child</td><td>O(26<sup>d</sup> · L)</td></tr>
    <tr><td>Word Search II</td><td>grid DFS following trie children; pop "$"; prune</td><td>O(R·C·4·3<sup>L−1</sup>)</td></tr>
  </table>
  <p>Symbols: L = length of the word or prefix, N = number of stored words, d = number of "." wildcards, R × C = grid size, S = total letters. Space: O(S) nodes, each a few hundred bytes in Python.</p>
  <div class="cards">
    <div><b>Use a trie</b><p>Prefix queries on a changing word set, autocomplete with counts/rankings, shortest/longest prefix match, wildcards, many words searched in one grid or stream.</p><small>Biteful's search box; Word Search II; Replace Words.</small></div>
    <div><b>Avoid a trie</b><p>Exact membership only (use a set); a static list with simple prefix queries (sorted list + bisect); tight memory budgets in Python.</p><small>84 MB vs ~7 MB for 100k names.</small></div>
  </div>
  <h3>Key traps</h3>
  <ul>
    <li>search without the end flag = startsWith.</li>
    <li>Delete must not cut branches other words use (passing counts) and must not unset a longer word.</li>
    <li><code>defaultdict</code> reads create nodes; use <code>in</code> / <code>.get</code>.</li>
    <li>End marker key must not be a possible letter.</li>
    <li>Word Search II: keep going after a match, pop "$" once, restore the cell.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>With dal and dalia stored, search("dal") and search("dali")? → True (end flag on l) and False (node exists, no end flag).</li>
    <li>Why can't a set answer "starts with pa" quickly? → Hashing scatters similar words; "pa" is not a stored key, so every word must be scanned.</li>
    <li>How do you count dishes starting with "pa" in O(L)? → Keep a passing count on every node, increment on insert, read it at the prefix node (4).</li>
    <li>Why is Word Search II faster with a trie? → Shared prefixes are walked once for all words, and paths stop as soon as no word continues.</li>
    <li>What does Replace Words return for "paneertikka" with roots pan and paneer? → "pan": the walk meets the shorter root's end flag first.</li>
  </ol>

  <h2 id="dsa-tri-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does one trie node represent, and what does it store?</summary><div class="qa-body">A node represents the prefix spelled by the letters on the path from the root to it. It stores its children (letter → node, a dict or a 26-slot array) and an end flag saying whether a stored word finishes exactly there. Extras like counts or the word itself are optional.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between search and startsWith?</summary><div class="qa-body">Both walk the letters and fail if a child is missing. startsWith returns True as soon as the walk finishes. search also requires the final node's end flag to be True. With "dalia" stored, search("dal") is False unless "dal" was inserted too, and startsWith("dal") is True.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Time and space of insert, search, startsWith?</summary><div class="qa-body">O(L) time each, where L is the length of the word or prefix, independent of how many words are stored. Insert adds at most L nodes. Total space is O(total letters) in the worst case (no shared prefixes), times the per-node overhead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hash set or trie: when do you pick which?</summary><div class="qa-body">Exact membership only → set: same O(L) and much less memory. Prefix queries, autocomplete, shortest/longest prefix match, sorted listing, or letter-by-letter search with pruning (grids, wildcards) → trie. For a static list with simple prefix queries, a sorted list with bisect is a lighter middle ground.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you delete a word without breaking others?</summary><div class="qa-body">First confirm the word exists. Walk down decreasing a per-node passing count; when a child's count hits 0, delete that child and stop, since no other word uses that branch. If the walk completes, the word is a prefix of others ("dal" under "dalia"), so just set end to False.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you count the words that start with a prefix in O(L)?</summary><div class="qa-body">Keep a counter in every node, incremented on each insert as the word passes through. Walk to the prefix node and read its counter. Without counters you would DFS the whole subtree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Word Search II faster with a trie than searching each word separately?</summary><div class="qa-body">Words share prefixes, so one DFS per cell explores all words at once instead of repeating the same paths per word. The trie also stops a path the moment no word continues with that letter, and removing found words and empty branches prunes further (138 ms vs 7 ms in the measured run).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the "." wildcard change search, and what does it cost?</summary><div class="qa-body">At a ".", the search tries every child recursively and succeeds if any branch succeeds. Without dots it is O(L). Each dot can multiply the work by up to 26, so the worst case is O(26<sup>d</sup> · L) for d dots.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you return the top 3 suggestions for every key press quickly?</summary><div class="qa-body">Store the best 3 words (alphabetical or by frequency) in every node at insert time. Each key press then moves one node down and reads its list: O(1) per key after the build. Alternative for a fixed list: sort it and use bisect to find the first word ≥ prefix, then take up to 3 that still match.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might a dict-of-children be preferred over an array of 26 in Python?</summary><div class="qa-body">Most nodes have only one or two children, so 26 slots per node waste memory, and Python lists of None are not cheap. A dict stores only real children and works for any alphabet (Unicode, digits, spaces in dish names). An array is faster in C/Java for a fixed small alphabet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a compressed trie (radix tree)?</summary><div class="qa-body">A trie where chains of single-child nodes are merged into one edge holding a string ("neer" instead of four nodes). Same queries, far fewer nodes. Used in routers' IP lookup tables and some key-value stores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a trie need the end flag when a tree from the Trees note did not?</summary><div class="qa-body">In a trie the nodes are prefixes, and every prefix of a stored word exists as a node whether or not it is a word itself. The structure alone cannot tell "dal" (a dish) from "da" (just a prefix); the end flag carries that one bit of information.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does Word Search II combine this note with Backtracking?</summary><div class="qa-body">The grid walk is the Backtracking template (mark the cell, explore 4 neighbours, unmark). The trie decides which neighbours are worth exploring (only letters that are children of the current trie node) and when a word is complete (the "$" end marker). Without the trie it is one backtracking search per word.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you implement autocomplete on a hash set instead?</summary><div class="qa-body">Every key press must scan all N words with startswith (O(N·L)), counts need a full scan, and ranking means sorting all matches each time: 434 ms vs 0.06 ms for 120 presses over 100,000 names in the measured run. A set has no notion of "words near this prefix".</div></details>
</main>
`
});
