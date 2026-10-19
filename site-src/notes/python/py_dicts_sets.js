// notes/python/py_dicts_sets.js — Dicts & Sets
Object.assign(TOPIC_CONTENT, {
  "py_dicts_sets": `<main>
<h1>Dicts &amp; Sets</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Dicts &amp; Sets</span></div>
  <p class="lead">A dict finds a value by its name ("what does a samosa cost?") and a set answers "is this one here?" ("has Esha come today?"), both in the same tiny time whether they hold ten items or ten million. They do it with one trick, hashing, and this note teaches that trick first, by hand, on an eight-slot table. Then everything else follows from it: why lookup is O(1), why keys must be hashable, dict create/read/update/delete, <code>get</code> and <code>setdefault</code>, iteration order, dict comprehensions, <code>Counter</code> and <code>defaultdict</code>, set operations, a measured list-vs-set race, and the traps. The running example is the same Chai Corner morning as the rest of the group: six orders, a menu of four prices, and the set of customers. Run on Python 3.13.</p>

  <h2 id="pds-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pds-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="120" y="6" width="400" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Fundamentals · Values &amp; Types · Control Flow · Functions</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pds-ga)"/>
<line x1="320" y1="100" x2="110" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pds-ga)"/>
<line x1="320" y1="100" x2="320" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pds-ga)"/>
<line x1="320" y1="100" x2="530" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pds-ga)"/>
<line x1="200" y1="152" x2="228" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pds-ga)"/>
<line x1="410" y1="152" x2="438" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pds-ga)"/>
<rect x="210" y="62" width="220" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="400">Python Collections: the map</text>
<text x="320" y="94" text-anchor="middle" class="tm" font-size="10">which container, and why</text>
<rect x="20" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="149" text-anchor="middle" font-size="12" font-weight="400">Lists &amp; Tuples</text>
<text x="110" y="164" text-anchor="middle" class="tm" font-size="10">order · fixed records</text>
<rect x="230" y="132" width="180" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="149" text-anchor="middle" font-size="12" font-weight="700">Dicts &amp; Sets</text>
<text x="320" y="164" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · lookup by key · unique</text>
<rect x="440" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="149" text-anchor="middle" font-size="12" font-weight="400">Strings</text>
<text x="530" y="164" text-anchor="middle" class="tm" font-size="10">text is a sequence too</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pds-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Iterators &amp; Generators · OOP · DSA: Arrays, Hashing · Pandas</text>
</svg><figcaption>The Python Collections group. Read the map first, then left to right: each note answers a question the one before could not. The dotted arrows are the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a></b><span>We can store the six orders in a list and each order as a tuple. But a list finds things only by position, or by scanning every item, and the last section there ended on a promise: a tuple is hashable, so it can be a dict key. The map note <a class="xref" data-note="py_ds">Python Collections</a> placed this note on the need "look up by name / is it there?".</span></li>
    <li><b>This note adds: the hash-based containers</b><span>dict (key → value) and set (keys only). How hashing works, what it costs, how to read, write, count and group with them, and how to combine sets.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_strings">Strings</a></b><span>Our menu keys and customer names are strings, and the orders actually arrive as text lines like "Asha: 2 masala chai ₹40". The next note pulls those lines apart. Further on: <a class="xref" data-note="dsa_hashing">DSA: Hashing</a> uses dicts and sets for interview patterns (two-sum, group anagrams), <a class="xref" data-note="py_oop">OOP</a> shows how to make your own objects hashable (<code>__hash__</code>, <code>__eq__</code>), and <a class="xref" data-note="da_pandas">Pandas</a> builds DataFrames from dicts and uses hash tables inside <code>groupby</code> and <code>merge</code>.</span></li>
  </ol>

  <h2 id="pds-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers come from the running example.</p>
  <ol class="story">
    <li><b>The lookup problem</b><span>Q: what does a bun maska cost? → With a list of (item, price) pairs we scan: 4 comparisons for bun maska, 4 to learn vada pav is missing. For n items, n steps. Can we jump straight to the answer?</span></li>
    <li><b>Hashing</b><span>Q: how can a key tell us where it is stored? → Turn it into a number and take the remainder by the table size: "bun maska" → 882 → slot 2. "samosa" also wants slot 4 (taken by masala chai), so it tries slot 5: a collision. But is this really constant time, and are there rules?</span></li>
    <li><b>O(1) lookup &amp; hashable keys</b><span>Q: why is it fast, and what can be a key? → Lookup costs one hash plus a few slot checks, whatever the size: a few dozen nanoseconds for 10 keys and for a million. It only works if a key's hash never changes, so keys must be hashable; a key that changes gets lost. Now, how do we use a dict day to day?</span></li>
    <li><b>Dict CRUD</b><span>Q: how do we create, read, update and delete? → <code>menu["samosa"]</code>, <code>menu[k] = v</code>, <code>del</code>, <code>pop</code>, <code>|</code>. But reading a missing key raises KeyError, which happens constantly when totals start from nothing…</span></li>
    <li><b>get &amp; setdefault</b><span>Q: how do we read with a fallback, or create on first use? → <code>totals.get(name, 0) + …</code> gives Asha 65, Ben 85, Chen 20, Dia 60. Then: in what order do we get them back when we loop?</span></li>
    <li><b>Iteration order &amp; views</b><span>Q: what does a loop over a dict give, and in what order? → Keys, in insertion order (guaranteed since 3.7); <code>.items()</code> for pairs; never change the size while looping. But building a dict with a loop is wordy…</span></li>
    <li><b>Dict comprehensions</b><span>Q: one line for a whole dict? → <code>{item: round(p * 1.05) for item, p in menu.items()}</code>. And the most common dict jobs, counting and grouping, still need get/setdefault boilerplate…</span></li>
    <li><b>Counter &amp; defaultdict</b><span>Q: counting and grouping without boilerplate? → <code>Counter</code>: masala chai 5, samosa 3; <code>defaultdict(list)</code>: Asha → [masala chai, ginger chai]. Now: what if we need only the keys, no values?</span></li>
    <li><b>Sets &amp; set operations</b><span>Q: unique customers, and who came both days? → <code>set(names)</code> = 4 customers; today &amp; yesterday = {Ben, Dia}; today − yesterday = {Asha, Chen}. How much faster is "is it there?" really?</span></li>
    <li><b>Membership speed, measured</b><span>Q: list vs set for <code>in</code>? → On 100,000 ids the set was thousands of times faster; a list inside a loop turned a 1 ms job into a 1 s job. What can still go wrong?</span></li>
    <li><b>Traps</b><span>Q: where do dicts and sets bite? → Mutating while iterating, mutable keys, <code>1 == True</code> sharing a key, <code>hash()</code> changing between runs, <code>{}</code> being a dict, lost order in <code>list(set(x))</code>.</span></li>
  </ol>

  <h2 id="pds-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dicts &amp; Sets</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Hashing</div>
        <ul>
          <li><b>slot = hash(key) % table size</b>; compare key there</li>
          <li><b>Collision</b>: slot taken by another key → probe another slot</li>
          <li>Toy: masala chai 4, ginger chai 1, samosa 4→5, bun maska 2</li>
          <li>💡 cloakroom token: number → shelf, no search</li>
          <li>Table grows when ~2/3 full (8 → 16 → 32 slots)</li>
          <li>Real str hashes are salted per process</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cost &amp; keys</div>
        <ul>
          <li><b>O(1) average</b> get/set/del/in; worst O(n) if all collide</li>
          <li>10 keys vs 1,000,000 keys: about the same few dozen ns</li>
          <li><b>Hashable</b>: hash never changes; equal ⇒ equal hash</li>
          <li>Keys: str, int, float, tuple of hashables, frozenset</li>
          <li>⚠ a key whose hash changes is lost inside the dict</li>
          <li>⚠ <code>1 == 1.0 == True</code> → one key</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dict CRUD</div>
        <ul>
          <li>Create: <code>{}</code>, <code>dict(zip(k, v))</code>, <code>dict.fromkeys</code></li>
          <li>Read: <code>d[k]</code> (KeyError), <code>k in d</code>, <code>d.get(k, default)</code></li>
          <li>Update: <code>d[k] = v</code>, <code>d | other</code>, <code>d.update()</code></li>
          <li>Delete: <code>del d[k]</code>, <code>pop(k, default)</code>, <code>popitem()</code></li>
          <li><code>setdefault(k, [])</code>.append(x) groups in one line</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Iterating &amp; building</div>
        <ul>
          <li>Loop gives <b>keys</b>; <code>.items()</code> pairs; <code>.values()</code></li>
          <li><b>Insertion order</b> kept (3.7+); updating a key keeps its place</li>
          <li>Views are live windows; key views do set maths</li>
          <li>⚠ changing size while looping → RuntimeError; loop over <code>list(d)</code></li>
          <li>Comprehension <code>{k: v for … if …}</code>; invert <code>{v: k …}</code></li>
          <li>Sort by value: <code>sorted(d.items(), key=lambda kv: kv[1])</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Counter &amp; defaultdict</div>
        <ul>
          <li><b>Counter</b>: missing → 0; <code>most_common(k)</code>; <code>+ −</code></li>
          <li>Sold: masala chai 5, samosa 3, bun maska 2, ginger chai 1</li>
          <li><b>defaultdict(list)</b>: group; <b>defaultdict(int)</b>: sum</li>
          <li>Bills: Asha 65, Ben 85, Chen 20, Dia 60 → 230</li>
          <li>⚠ reading a missing key of a defaultdict creates it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sets</div>
        <ul>
          <li>Unique, unordered, hashable items; O(1) <code>in</code></li>
          <li><code>| &amp; - ^</code>: either, both, only-left, one-only</li>
          <li>Today &amp; yesterday {Ben, Dia}; new {Asha, Chen}; lapsed {Esha}</li>
          <li><code>add</code>, <code>discard</code> (safe), <code>remove</code> (KeyError)</li>
          <li>⚠ <code>{}</code> is a dict → <code>set()</code>; frozenset is hashable</li>
          <li>Dedupe keeping order: <code>list(dict.fromkeys(xs))</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pds-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pds-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Lookup Problem</span><span class="rm-sub">Why scanning is not enough</span></div></div>
      <div class="rm-item rm-done" data-target="pds-hash"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hashing by Hand</span><span class="rm-sub">An 8-slot table traced</span></div></div>
      <div class="rm-item rm-done" data-target="pds-o1"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">O(1) &amp; Hashable Keys</span><span class="rm-sub">Why fast, why immutable</span></div></div>
      <div class="rm-item rm-done" data-target="pds-crud"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Dict CRUD</span><span class="rm-sub">Create, read, update, delete</span></div></div>
      <div class="rm-item rm-done" data-target="pds-get"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">get &amp; setdefault</span><span class="rm-sub">Missing keys handled</span></div></div>
      <div class="rm-item rm-done" data-target="pds-iter"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Iteration Order</span><span class="rm-sub">keys, values, items, views</span></div></div>
      <div class="rm-item rm-done" data-target="pds-comp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Dict Comprehensions</span><span class="rm-sub">Whole dicts in one line</span></div></div>
      <div class="rm-item rm-done" data-target="pds-coll"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Counter &amp; defaultdict</span><span class="rm-sub">Counting and grouping</span></div></div>
      <div class="rm-item rm-done" data-target="pds-set"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Sets &amp; Set Operations</span><span class="rm-sub">Today vs yesterday</span></div></div>
      <div class="rm-item rm-done" data-target="pds-speed"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Membership Speed</span><span class="rm-sub">List vs set, measured</span></div></div>
      <div class="rm-item rm-done" data-target="pds-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Traps, Demonstrated</span><span class="rm-sub">Where dicts and sets bite</span></div></div>
      <div class="rm-item rm-done" data-target="pds-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pds-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pds-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pds-need"><span class="num">01</span>The Lookup Problem</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The orders list from <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> tells us Asha had 2 masala chai, but not what she owes: for that we need each item's price. Prices are looked up by <em>name</em>, not by position. With only lists, how fast can we answer "what does a bun maska cost?"</p>
  </div>
  <h3>The running example</h3>
  <p>Chai Corner, Monday morning. Six orders <code>(customer, item, qty)</code>, and a menu of four prices in rupees:</p>
  <table class="tbl"><caption>The running example</caption>
    <tr><th>orders</th><th>menu (₹ each)</th></tr>
    <tr><td>(Asha, masala chai, 2) · (Ben, samosa, 3) · (Asha, ginger chai, 1) · (Chen, masala chai, 1) · (Dia, bun maska, 2) · (Ben, masala chai, 2)</td><td>masala chai 20 · ginger chai 25 · samosa 15 · bun maska 30</td></tr>
  </table>
  <div class="fx" data-lang="py">orders = [
    ("Asha", "masala chai", 2),
    ("Ben",  "samosa",      3),
    ("Asha", "ginger chai", 1),
    ("Chen", "masala chai", 1),
    ("Dia",  "bun maska",   2),
    ("Ben",  "masala chai", 2),
]</div>
  <div class="fx" data-lang="text"></div>
  <h3>Lookup with a list of pairs</h3>
  <p>With only lists and tuples, the menu is a list of (item, price) pairs, and finding a price means walking the list until the names match. We count the steps:</p>
  <div class="fx" data-lang="py">menu_pairs = [("masala chai", 20), ("ginger chai", 25), ("samosa", 15), ("bun maska", 30)]
def price_of(item):
    steps = 0
    for name, price in menu_pairs:      # look at every pair until we find it
        steps += 1
        if name == item:
            return price, steps
    return None, steps
for item in ["masala chai", "bun maska", "vada pav"]:
    print(item, "-&gt;", price_of(item))</div>
  <div class="fx" data-lang="text">masala chai -&gt; (20, 1)
bun maska -&gt; (30, 4)
vada pav -&gt; (None, 4)</div>
  <p>Masala chai is first, so 1 step. Bun maska is last: 4 steps. Vada pav is not on the menu, and the only way to be sure is to check all 4. With a 400-item menu, or a million customer ids, every lookup costs up to n comparisons. And we look up a price for every order, all day: n orders × m menu items.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Finding a phone number in a notebook where names were written in the order you met people. You read from the top every time. What you want is the contacts app: type the name, get the number.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Linear search</strong>: compare the target with each element in turn until found or the end is reached. O(n) comparisons in the worst case; it is what <code>x in list</code>, <code>list.index</code> and <code>list.remove</code> do.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Sorting the list and using binary search (<code>bisect</code>) gets you to O(log n), but every insert must keep the order (O(n)). Hashing gets O(1) for both lookup and insert, which is why Python's dict and set use it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Hashing by Hand.</b> We want the key itself to say where its value is stored, so we can jump there instead of searching. How can a word like "samosa" become a shelf number?</div>

  <h2 id="pds-hash"><span class="num">02</span>Hashing by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Positions are fast (a list jumps to slot i in one step). Names are what we have. If we could turn every name into a position, a name lookup would be as fast as an index. How do we do that, and what happens when two names want the same position?</p>
  </div>
  <h3>Plain words</h3>
  <p>A dict keeps an array of <strong>slots</strong> (say 8). To store a key, Python computes a number from the key, its <strong>hash</strong>, and takes the remainder after dividing by the number of slots: <code>hash(key) % 8</code> is a slot number from 0 to 7. The key and value go into that slot. To look the key up later, compute the same number, go straight to that slot, and check the key there.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A railway cloakroom. You hand in a bag and get a token; the token number says which shelf the bag is on. Coming back, the attendant walks straight to that shelf. Nobody checks every shelf.</p></div>
  <h3>A toy hash, by hand</h3>
  <p>Python's real hash function is a scrambling formula we cannot do in our heads, so we use a toy one with the same shape: add up the character codes (<code>ord</code>) of the name. For "samosa": s 115 + a 97 + m 109 + o 111 + s 115 + a 97 = 644, and 644 % 8 = 4 (644 = 80 × 8 + 4).</p>
  <div class="fx" data-lang="py">def toy_hash(key):
    return sum(ord(ch) for ch in key)          # add up the letter codes

for item in ["masala chai", "ginger chai", "samosa", "bun maska"]:
    h = toy_hash(item)
    print(f"{item:12} codes add up to {h:5}  -&gt; slot {h} % 8 = {h % 8}")</div>
  <div class="fx" data-lang="text">masala chai  codes add up to  1060  -&gt; slot 1060 % 8 = 4
ginger chai  codes add up to  1073  -&gt; slot 1073 % 8 = 1
samosa       codes add up to   644  -&gt; slot 644 % 8 = 4
bun maska    codes add up to   882  -&gt; slot 882 % 8 = 2</div>
  <p>Two of our four items, "masala chai" and "samosa", both land on slot 4. That is a <strong>collision</strong>: different keys, same slot. Collisions are normal (only 8 slots, endless possible names), so every hash table needs a rule for them. Our toy rule: if the slot is taken by a different key, try the next slot, and the next, until a free one turns up (called <em>linear probing</em>; CPython uses a cleverer jump sequence, but the idea is the same).</p>
  <h3>Building the table, step by step</h3>
  <table class="tbl">
    <tr><th>insert</th><th>toy hash % 8</th><th>slot free?</th><th>stored in</th></tr>
    <tr><td>masala chai: 20</td><td>4</td><td>yes</td><td>4</td></tr>
    <tr><td>ginger chai: 25</td><td>1</td><td>yes</td><td>1</td></tr>
    <tr><td>samosa: 15</td><td>4</td><td>no (masala chai) → try 5: yes</td><td>5</td></tr>
    <tr><td>bun maska: 30</td><td>2</td><td>yes</td><td>2</td></tr>
  </table>
  <div class="fx" data-lang="py">class ToyDict:
    """A tiny hash table: 8 slots, toy hash, 'try the next slot' on a collision."""
    def __init__(self, size=8):
        self.slots = [None] * size
    def _probe(self, key):
        i = toy_hash(key) % len(self.slots)
        path = [i]
        while self.slots[i] is not None and self.slots[i][0] != key:
            i = (i + 1) % len(self.slots)       # collision: try the next slot
            path.append(i)
        return i, path
    def put(self, key, value):
        i, path = self._probe(key)
        self.slots[i] = (key, value)
        print(f"put {key!r:14} slots tried {path}")
    def get(self, key):
        i, path = self._probe(key)
        found = self.slots[i] is not None
        print(f"get {key!r:14} slots tried {path} -&gt; {self.slots[i][1] if found else 'not there'}")

menu_t = ToyDict()
for item, price in [("masala chai", 20), ("ginger chai", 25), ("samosa", 15), ("bun maska", 30)]:
    menu_t.put(item, price)
for i, s in enumerate(menu_t.slots):
    print(i, s)</div>
  <div class="fx" data-lang="text">put 'masala chai'  slots tried [4]
put 'ginger chai'  slots tried [1]
put 'samosa'       slots tried [4, 5]
put 'bun maska'    slots tried [2]
0 None
1 ('ginger chai', 25)
2 ('bun maska', 30)
3 None
4 ('masala chai', 20)
5 ('samosa', 15)
6 None
7 None</div>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
    <defs><marker id="pds-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" class="tm">key</text><text x="130" y="16" class="tm">toy hash % 8</text><text x="360" y="16" class="tm">slots</text>
    <rect x="10" y="30" width="100" height="24" rx="4" class="fb sb"/><text x="18" y="47">masala chai</text>
    <rect x="10" y="74" width="100" height="24" rx="4" class="fb sb"/><text x="18" y="91">ginger chai</text>
    <rect x="10" y="118" width="100" height="24" rx="4" class="fb sb"/><text x="30" y="135">samosa</text>
    <rect x="10" y="162" width="100" height="24" rx="4" class="fb sb"/><text x="22" y="179">bun maska</text>
    <text x="130" y="47">1060 → 4</text><text x="130" y="91">1073 → 1</text><text x="130" y="135" class="tr">644 → 4 (taken!)</text><text x="130" y="179">882 → 2</text>
    <g stroke="currentColor" fill="none"><rect x="330" y="26" width="150" height="22"/><rect x="330" y="48" width="150" height="22"/><rect x="330" y="70" width="150" height="22"/><rect x="330" y="92" width="150" height="22"/><rect x="330" y="114" width="150" height="22"/><rect x="330" y="136" width="150" height="22"/><rect x="330" y="158" width="150" height="22"/><rect x="330" y="180" width="150" height="22"/></g>
    <g class="tm"><text x="314" y="42">0</text><text x="314" y="64">1</text><text x="314" y="86">2</text><text x="314" y="108">3</text><text x="314" y="130">4</text><text x="314" y="152">5</text><text x="314" y="174">6</text><text x="314" y="196">7</text></g>
    <rect x="331" y="49" width="148" height="20" class="fb"/><text x="338" y="64">ginger chai: 25</text>
    <rect x="331" y="71" width="148" height="20" class="fb"/><text x="338" y="86">bun maska: 30</text>
    <rect x="331" y="115" width="148" height="20" class="fb"/><text x="338" y="130">masala chai: 20</text>
    <rect x="331" y="137" width="148" height="20" class="fr"/><text x="338" y="152">samosa: 15</text>
    <line x1="210" y1="43" x2="328" y2="124" stroke="currentColor" marker-end="url(#pds-ah)"/>
    <line x1="210" y1="87" x2="328" y2="60" stroke="currentColor" marker-end="url(#pds-ah)"/>
    <line x1="210" y1="175" x2="328" y2="82" stroke="currentColor" marker-end="url(#pds-ah)"/>
    <path d="M490,124 C520,130 520,142 490,147" class="sr" fill="none" stroke-dasharray="4 3" marker-end="url(#pds-ah)"/>
    <text x="500" y="112" class="tr">probe</text>
    <text x="10" y="222" class="tm">lookup = hash the key, jump to its slot, compare the key; on a different key, follow the same probe path</text>
  </svg><figcaption>Our menu in an 8-slot toy table. Samosa collides with masala chai on slot 4 and probes to slot 5. Slots 0, 3, 6, 7 stay empty: a hash table always keeps spare room.</figcaption></figure>
  <h3>Looking up, traced</h3>
  <div class="fx" data-lang="py">menu_t.get("bun maska")
menu_t.get("samosa")
menu_t.get("vada pav")
print("vada pav lands on slot", toy_hash("vada pav") % 8)</div>
  <div class="fx" data-lang="text">get 'bun maska'    slots tried [2] -&gt; 30
get 'samosa'       slots tried [4, 5] -&gt; 15
get 'vada pav'     slots tried [3] -&gt; not there
vada pav lands on slot 3</div>
  <p>Bun maska: hash → slot 2, key matches, done in 1 step. Samosa: slot 4 holds masala chai (wrong key), follow the same rule to slot 5, match: 2 steps. Vada pav: its toy hash sends it to slot 3, which is empty, so it cannot be anywhere else: "not there" after 1 step, without looking at the other keys. Compare with the 4-step scan of section 01.</p>
  <h3>Python's real hash</h3>
  <div class="fx" data-lang="py">print(hash(101), hash(-7), hash(2**61 + 5))     # small ints hash to themselves
print(hash(1) == hash(1.0) == hash(True))      # equal values, equal hashes
import subprocess, sys
for run in (1, 2):                              # string hashes are salted per process
    r = subprocess.run([sys.executable, "-c", "print(hash('samosa'))"], capture_output=True, text=True)
    print(f"process {run}: hash('samosa') = {r.stdout.strip()}")</div>
  <div class="fx" data-lang="text">101 -7 6
True
process 1: hash('samosa') = 8485604537271404483
process 2: hash('samosa') = -9059955716747355068</div>
  <ul>
    <li>Small ints hash to themselves (101 → 101), so in a real dict the key 101 goes straight to slot 101 % size. Huge ints are reduced modulo 2<sup>61</sup> − 1, which is why 2<sup>61</sup> + 5 hashes to 6.</li>
    <li>Equal numbers hash equally across types: 1, 1.0 and True all hash to 1 (this matters in section 11).</li>
    <li>String hashes are <strong>salted</strong>: each new Python process picks a random secret and mixes it in, so "samosa" gets a different hash in each run. This stops attackers from sending many keys that all collide. Within one process the hash is stable, which is all a dict needs.</li>
  </ul>
  <h3>The real dict: spare room, growth, and order</h3>
  <div class="fx" data-lang="py">menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
print(menu["samosa"])
print(list(menu))                       # keys come back in insertion order
import sys
d = {}
prev = sys.getsizeof(d)
for i in range(12):
    d[f"item{i}"] = i
    size = sys.getsizeof(d)
    if size != prev:
        print(f"{len(d):2} keys: {size} bytes (table grew)")
        prev = size</div>
  <div class="fx" data-lang="text">15
['masala chai', 'ginger chai', 'samosa', 'bun maska']
 1 keys: 184 bytes (table grew)
 6 keys: 272 bytes (table grew)
11 keys: 464 bytes (table grew)</div>
  <p>A real dict also keeps spare room: when its table is about 2/3 full it moves to a bigger one (here at the 6th and 11th keys: an 8-slot table holds 5 keys, 16 slots hold 10). Collisions stay rare because the table is never crowded. Inside CPython, the slot table holds only small numbers pointing into a separate, compact list of (hash, key, value) entries kept in insertion order. That second list is why <code>list(menu)</code> comes back in the order you inserted, a guarantee since Python 3.7 (section 06).</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>hash table</strong> stores entries in an array of slots, placing each key at a slot computed from <code>hash(key)</code>. A <strong>hash function</strong> maps a key to an integer; equal keys must map to equal integers. A <strong>collision</strong> is two different keys mapped to the same slot; <strong>open addressing</strong> (what CPython uses) resolves it by probing other slots of the same array. The <strong>load factor</strong> (used slots ÷ total slots) is kept below about 2/3 by resizing.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The toy hash (sum of codes) is a bad real hash: "listen" and "silent" have the same letters, so the same sum, and would always collide. Real hash functions scramble every bit. Never write your own for production; use <code>hash()</code> inside a process and <code>hashlib</code> when the number must be the same across runs (section 11).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: O(1) &amp; Hashable Keys.</b> We traced lookups of 1 and 2 steps on 4 keys. Does that stay true for a million keys? And what happens if a key changes after it has been filed on a shelf?</div>

  <h2 id="pds-o1"><span class="num">03</span>Why Lookup Is O(1), and Why Keys Must Be Hashable</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The table worked on four items. The claims we hear are bigger: "dict lookup is constant time" and "lists can't be keys". Why is the first true (and when is it false)? And why is the second a rule rather than a limitation?</p>
  </div>
  <h3>Why O(1)</h3>
  <p>A lookup does three things: compute the hash (depends on the key's length, not on the dict's size), jump to one slot (one array index), and compare a few keys along the probe path. Because the table is kept less than 2/3 full and a good hash spreads keys evenly, the expected number of slots checked is a small constant, whether the dict has 10 keys or 10 million. Measured:</p>
  <div class="fx" data-lang="py">import timeit
small = {i: i for i in range(10)}
big = {i: i for i in range(1_000_000)}
t_small = timeit.timeit(lambda: small[7], number=1_000_000)
t_big = timeit.timeit(lambda: big[777_777], number=1_000_000)
print(f"10 keys:        {t_small * 1000:.0f} ns per lookup")
print(f"1,000,000 keys: {t_big * 1000:.0f} ns per lookup")</div>
  <div class="fx" data-lang="text">10 keys:        35 ns per lookup
1,000,000 keys: 45 ns per lookup</div>
  <p>A hundred thousand times more keys, about the same time per lookup (the small difference comes from memory caching, not from searching). A list would take a hundred thousand times longer.</p>
  <p><strong>Worst case O(n)</strong>: if every key landed on the same slot, each lookup would walk past all of them, like a list. With a good hash this practically never happens, which is why we say "O(1) on average".</p>
  <h3>Why keys must be hashable: a key that changes is lost</h3>
  <p>The slot is chosen from the key's hash at the moment it is stored. If the key could change afterwards, its hash would change, and a later lookup would compute a different slot and look on the wrong shelf. Python cannot let that happen, so mutable built-ins (list, dict, set) simply have no hash. We can see the disaster by building, on purpose, a bad key type whose hash depends on a list that can change (classes are explained in <a class="xref" data-note="py_oop">OOP</a>; read the class as "a table whose hash is computed from who sits there"):</p>
  <div class="fx" data-lang="py">class Table:
    """A table whose hash depends on who sits there: a BAD key, on purpose."""
    def __init__(self, people):
        self.people = people
    def __hash__(self):
        return hash(tuple(self.people))
    def __eq__(self, other):
        return self.people == other.people

t1 = Table(["Asha", "Ben"])
bill = {t1: 85}
print(bill[t1])                  # found
t1.people.append("Esha")         # the key changes AFTER it was filed
print(t1 in bill)                # now looked for on a different shelf
print(len(bill), list(bill.values()))   # yet the entry is still inside</div>
  <div class="fx" data-lang="text">85
False
1 [85]</div>
  <p>Trace: the table (Asha, Ben) is filed with bill 85, and found. Then Esha sits down: the key object changes, its hash changes, and <code>t1 in bill</code> says False, although <code>len(bill)</code> is 1 and the 85 is still inside. The entry is unreachable: it sits on the shelf chosen by the <em>old</em> hash.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Your cloakroom token is written in pencil and someone rubs out the 4 and writes 7. The attendant now walks to shelf 7. Your bag is still on shelf 4, but nobody will ever look there.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An object is <strong>hashable</strong> if <code>hash(obj)</code> never changes during its lifetime and <code>a == b</code> implies <code>hash(a) == hash(b)</code>. Hashable built-ins: int, float, complex, str, bytes, bool, None, frozenset, and tuples whose items are all hashable. Not hashable: list, dict, set, bytearray. Dict keys and set items must be hashable; dict <em>values</em> can be anything.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The rule is "equal ⇒ same hash", not the other way round. Different keys may share a hash (a collision), and that is fine, because the dict always confirms with <code>==</code>. If you define <code>__eq__</code> on your own class, define a matching <code>__hash__</code> from immutable fields (or Python sets <code>__hash__</code> to None and the objects become unhashable).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Dict CRUD.</b> We know how a dict works inside. Now the everyday question: how do we create one, read from it, change it and delete from it, and what happens at the edges (missing keys, clashing merges)?</div>

  <h2 id="pds-crud"><span class="num">04</span>Dict CRUD: Create, Read, Update, Delete</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The stall's menu changes: a new item arrives, a price goes up, an item is dropped. Which operations do each job, and which ones crash on a missing key?</p>
  </div>
  <p>A <strong>dict</strong> (dictionary) stores pairs <strong>key → value</strong>. Keys are unique and hashable; values can be anything and can repeat. It is written <code>{key: value, …}</code>.</p>
  <div class="fx" data-lang="py">menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15}          # Create: literal
print(dict(zip(["samosa", "bun maska"], [15, 30])))               # Create: from two lists
print(dict.fromkeys(["Asha", "Ben"], 0))                          # Create: same start value
print(menu["samosa"], "samosa" in menu, "vada pav" in menu, len(menu))   # Read
try:
    menu["vada pav"]
except KeyError as e:
    print("KeyError:", e)
menu["bun maska"] = 30           # Update or insert: new key -&gt; added at the end
menu["samosa"] = 18              # existing key -&gt; value replaced, position kept
print(menu)
del menu["ginger chai"]          # Delete by key (KeyError if missing)
price = menu.pop("samosa")       # remove AND return the value
print(price, menu)
print(menu.pop("vada pav", None))           # pop with a default: no error
print(menu.popitem(), menu)                 # remove the LAST inserted pair</div>
  <div class="fx" data-lang="text">{'samosa': 15, 'bun maska': 30}
{'Asha': 0, 'Ben': 0}
15 True False 3
KeyError: 'vada pav'
{'masala chai': 20, 'ginger chai': 25, 'samosa': 18, 'bun maska': 30}
18 {'masala chai': 20, 'bun maska': 30}
None
('bun maska', 30) {'masala chai': 20}</div>
  <ul>
    <li><strong>Create</strong>: a literal; <code>dict(zip(keys, values))</code> pairs two lists; <code>dict.fromkeys(keys, 0)</code> gives every key the same start value.</li>
    <li><strong>Read</strong>: <code>menu["samosa"]</code> is 15; <code>in</code> checks keys (True/False); a missing key raises <code>KeyError: 'vada pav'</code>.</li>
    <li><strong>Update/insert</strong>: <code>d[k] = v</code> adds a new key at the end (bun maska), or replaces the value of an existing key in place (samosa 15 → 18, still third).</li>
    <li><strong>Delete</strong>: <code>del d[k]</code>; <code>pop(k)</code> removes and returns the value (18); <code>pop(k, None)</code> returns the default instead of raising; <code>popitem()</code> removes the last inserted pair.</li>
  </ul>
  <h3>Merging</h3>
  <div class="fx" data-lang="py">menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
specials = {"samosa": 12, "vada pav": 18}
print(menu | specials)           # new dict; right side wins on clashes
print(menu["samosa"])            # menu unchanged
menu.update(specials)            # in place (same as menu |= specials)
print(menu)</div>
  <div class="fx" data-lang="text">{'masala chai': 20, 'ginger chai': 25, 'samosa': 12, 'bun maska': 30, 'vada pav': 18}
15
{'masala chai': 20, 'ginger chai': 25, 'samosa': 12, 'bun maska': 30, 'vada pav': 18}</div>
  <p><code>menu | specials</code> builds a new dict; where both have a key (samosa), the right side wins (12), and new keys (vada pav) go at the end. <code>menu</code> itself is unchanged until <code>update</code> (or <code>|=</code>) merges in place.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The menu board on the wall: each line is "item — price". You can add a line, change a price, rub a line out. Two items cannot share a line name; two items can share a price.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>dict</strong> is a mutable mapping from hashable keys to arbitrary values, implemented as a hash table that preserves insertion order. <code>d[k]</code>, <code>d[k] = v</code>, <code>del d[k]</code>, <code>k in d</code> are O(1) on average; <code>len(d)</code> is O(1).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>k in d</code> checks <em>keys</em> only: <code>20 in menu</code> is False even though 20 is a price. Use <code>20 in menu.values()</code> (which is an O(n) scan).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: get &amp; setdefault.</b> To total each customer's bill we must add to a value that does not exist yet the first time we see that customer, and <code>d[k]</code> crashes on missing keys. How do we read with a fallback?</div>

  <h2 id="pds-get"><span class="num">05</span>get &amp; setdefault</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"How much does each customer owe?" Walking the orders, the first time we meet Asha there is no total to add to. Checking <code>if name in totals</code> every time works but doubles the code. Is there a one-step "read, or use a default"?</p>
  </div>
  <h3>get: read with a default</h3>
  <p><code>d.get(k, default)</code> returns <code>d[k]</code> if the key exists, otherwise <code>default</code> (None if not given). It never adds the key. Here each order adds qty × price to the customer's total, starting from 0:</p>
  <div class="fx" data-lang="py">menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
totals = {}
for name, item, qty in orders:
    totals[name] = totals.get(name, 0) + qty * menu[item]   # 0 the first time we see a name
    print(f"{name:4} +{qty * menu[item]:3} -&gt; {totals}")</div>
  <div class="fx" data-lang="text">Asha + 40 -&gt; {'Asha': 40}
Ben  + 45 -&gt; {'Asha': 40, 'Ben': 45}
Asha + 25 -&gt; {'Asha': 65, 'Ben': 45}
Chen + 20 -&gt; {'Asha': 65, 'Ben': 45, 'Chen': 20}
Dia  + 60 -&gt; {'Asha': 65, 'Ben': 45, 'Chen': 20, 'Dia': 60}
Ben  + 40 -&gt; {'Asha': 65, 'Ben': 85, 'Chen': 20, 'Dia': 60}</div>
  <table class="tbl">
    <tr><th>order</th><th>qty × price</th><th>get returns</th><th>new total</th></tr>
    <tr><td>Asha, masala chai, 2</td><td>2 × 20 = 40</td><td>0 (new)</td><td>Asha 40</td></tr>
    <tr><td>Ben, samosa, 3</td><td>3 × 15 = 45</td><td>0 (new)</td><td>Ben 45</td></tr>
    <tr><td>Asha, ginger chai, 1</td><td>1 × 25 = 25</td><td>40</td><td>Asha 65</td></tr>
    <tr><td>Chen, masala chai, 1</td><td>1 × 20 = 20</td><td>0 (new)</td><td>Chen 20</td></tr>
    <tr><td>Dia, bun maska, 2</td><td>2 × 30 = 60</td><td>0 (new)</td><td>Dia 60</td></tr>
    <tr><td>Ben, masala chai, 2</td><td>2 × 20 = 40</td><td>45</td><td>Ben 85</td></tr>
  </table>
  <p>The day's bills: Asha ₹65, Ben ₹85, Chen ₹20, Dia ₹60, total ₹230. These numbers are reused for the rest of the group.</p>
  <h3>setdefault: read, or insert and read</h3>
  <p><code>d.setdefault(k, default)</code> returns <code>d[k]</code> if present; otherwise it first stores <code>d[k] = default</code> and returns that. It is made for grouping: "the list for this customer, creating an empty one the first time":</p>
  <div class="fx" data-lang="py">by_customer = {}
for name, item, qty in orders:
    by_customer.setdefault(name, []).append(item)   # create [] once, then append
print(by_customer)
print(menu.get("vada pav"), menu.get("vada pav", "not on menu"))</div>
  <div class="fx" data-lang="text">{'Asha': ['masala chai', 'ginger chai'], 'Ben': ['samosa', 'masala chai'], 'Chen': ['masala chai'], 'Dia': ['bun maska']}
None not on menu</div>
  <p>The first Asha order creates <code>[]</code> under "Asha" and appends masala chai; the second finds that same list and appends ginger chai. The last line: <code>get</code> on a missing key gives None, or the default we pass.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>get</code>: "what's Asha's tab? If she has none, call it zero" (nothing written down). <code>setdefault</code>: "give me Asha's page in the ledger; if she has no page, open a blank one for her first".</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>dict.get(key, default=None)</code> → <code>d[key]</code> if key in d else default; never modifies d. <code>dict.setdefault(key, default=None)</code> → <code>d[key]</code> if present, else sets <code>d[key] = default</code> and returns it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>setdefault(k, [])</code> builds a new empty list on every call, even when the key exists and it is thrown away. Harmless for small data; for heavy defaults use <code>defaultdict</code> (section 08), which only builds one when needed.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Iteration Order &amp; Views.</b> We have a dict of four totals. To print a receipt we must loop over it. What exactly does a loop over a dict give us, and in what order?</div>

  <h2 id="pds-iter"><span class="num">06</span>Iteration Order &amp; Views</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Hashing scatters keys over slots (masala chai on 4, ginger chai on 1). Will a loop give them back in that scattered order? And can we print customers from the biggest bill down?</p>
  </div>
  <div class="fx" data-lang="py">totals = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
for name in totals:                      # iterating a dict gives its KEYS
    print(name, end=" ")
print()
print(list(totals.values()), sum(totals.values()))
for name, rupees in totals.items():      # pairs, unpacked
    print(f"{name}: Rs {rupees}")
print(sorted(totals.items(), key=lambda kv: kv[1], reverse=True))   # by value
print(max(totals, key=totals.get))       # key with the largest value</div>
  <div class="fx" data-lang="text">Asha Ben Chen Dia 
[65, 85, 20, 60] 230
Asha: Rs 65
Ben: Rs 85
Chen: Rs 20
Dia: Rs 60
[('Ben', 85), ('Asha', 65), ('Dia', 60), ('Chen', 20)]
Ben</div>
  <ul>
    <li><strong>A loop over a dict gives its keys</strong>, in <strong>insertion order</strong> (Asha, Ben, Chen, Dia), not slot order: the compact entries list of section 02 keeps arrival order. Guaranteed since Python 3.7.</li>
    <li><code>.values()</code> gives the values (sum 230); <code>.items()</code> gives (key, value) pairs, unpacked in the <code>for</code>.</li>
    <li>A dict itself is not "sorted"; <code>sorted(d.items(), key=lambda kv: kv[1], reverse=True)</code> gives a list of pairs by value: Ben 85 first.</li>
    <li><code>max(totals, key=totals.get)</code>: loop over keys, compare by their values: Ben.</li>
  </ul>
  <h3>Views are live</h3>
  <div class="fx" data-lang="py">keys = totals.keys()
print(keys)
totals["Esha"] = 30                      # views are live windows, not copies
print(keys, len(keys))
print(totals.keys() &amp; {"Asha", "Zoya"})  # key views support set operations</div>
  <div class="fx" data-lang="text">dict_keys(['Asha', 'Ben', 'Chen', 'Dia'])
dict_keys(['Asha', 'Ben', 'Chen', 'Dia', 'Esha']) 5
{'Asha'}</div>
  <p><code>keys()</code>, <code>values()</code> and <code>items()</code> return <strong>views</strong>: windows onto the dict, not copies. After adding Esha, the same <code>keys</code> object shows 5 keys. Key views also behave like sets: <code>&amp;</code> with another set gives the common keys.</p>
  <h3>Do not change the size while looping</h3>
  <div class="fx" data-lang="py">totals = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
try:
    for name in totals:
        if totals[name] &lt; 50:
            del totals[name]             # changes the size during the loop
except RuntimeError as e:
    print("RuntimeError:", e)
totals = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
for name in list(totals):                # loop over a COPY of the keys
    if totals[name] &lt; 50:
        del totals[name]
print(totals)
totals = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
print({n: r for n, r in totals.items() if r &gt;= 50})   # or build a new dict</div>
  <div class="fx" data-lang="text">RuntimeError: dictionary changed size during iteration
{'Asha': 65, 'Ben': 85, 'Dia': 60}
{'Asha': 65, 'Ben': 85, 'Dia': 60}</div>
  <p>Deleting Chen while looping over <code>totals</code> raises <code>RuntimeError: dictionary changed size during iteration</code>: the loop is walking the entries list as it is being rearranged. Two fixes: loop over a copy of the keys (<code>list(totals)</code>), or build a new dict with a comprehension (next section). Changing the <em>value</em> of an existing key during a loop is fine.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Reading names off a queue while people join and leave it: you lose your place. Photograph the queue first (<code>list(d)</code>), then work from the photo.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Iterating a dict yields its keys in insertion order; re-assigning an existing key keeps its position; deleting and re-inserting moves it to the end. <code>dict.keys()/values()/items()</code> return dynamic view objects reflecting later changes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Sets do <em>not</em> keep insertion order: their printed order depends on hash values, so with string items it can differ from run to run. Never rely on the order of a set; sort it for output.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Dict Comprehensions.</b> We keep building new dicts with "empty dict, loop, if, assign": prices with tax, only the chai items, the filtered totals. Lists had comprehensions; do dicts?</div>

  <h2 id="pds-comp"><span class="num">07</span>Dict Comprehensions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The owner wants a price list with 5% GST added, a chai-only board, and a "price → item" lookup. Each is a whole new dict made from the old one. Can we say each in one line, as list comprehensions did for lists?</p>
  </div>
  <p>A <strong>dict comprehension</strong> is the same idea as a list comprehension (<a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>, section 04) with curly brackets and a <code>key: value</code> expression in front. Desugared: <code>out = {}</code>, then <code>for … : if … : out[key] = value</code>.</p>
  <div class="fx" data-lang="py">menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
print({item: round(price * 1.05) for item, price in menu.items()})          # +5% GST
print({item: price for item, price in menu.items() if "chai" in item})       # filter
print({price: item for item, price in menu.items()})                          # invert
line_totals = {f"{n}/{i}": q * menu[i] for n, i, q in orders}
print(line_totals)</div>
  <div class="fx" data-lang="text">{'masala chai': 21, 'ginger chai': 26, 'samosa': 16, 'bun maska': 32}
{'masala chai': 20, 'ginger chai': 25}
{20: 'masala chai', 25: 'ginger chai', 15: 'samosa', 30: 'bun maska'}
{'Asha/masala chai': 40, 'Ben/samosa': 45, 'Asha/ginger chai': 25, 'Chen/masala chai': 20, 'Dia/bun maska': 60, 'Ben/masala chai': 40}</div>
  <ul>
    <li><strong>Transform values</strong>: 20 × 1.05 = 21; 25 × 1.05 = 26.25 → 26; 15 × 1.05 = 15.75 → 16; 30 × 1.05 = 31.5 → 32 (round to even).</li>
    <li><strong>Filter</strong>: <code>if</code> at the end keeps the two chai items.</li>
    <li><strong>Invert</strong>: swap key and value. Safe here because all prices differ; with duplicate values, later keys overwrite earlier ones.</li>
    <li><strong>From another collection</strong>: one entry per order, key built from customer and item, value qty × price.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Writing a new menu board from the old one in one go: "for every item on the board, write the item and its price plus 5%".</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>{k_expr: v_expr for target in iterable if cond}</code> builds a new dict; if two iterations produce the same key, the last value wins. The set comprehension <code>{expr for …}</code> looks similar but has no colon.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>{}</code> with nothing inside is an empty <em>dict</em>; <code>{x for x in xs}</code> is a set and <code>{x: 1 for x in xs}</code> a dict. The colon decides.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Counter &amp; defaultdict.</b> The two most common dict jobs are counting ("how many of each item?") and grouping ("which items per customer?"), and both still need the get/setdefault dance. The standard library has containers made for exactly these.</div>

  <h2 id="pds-coll"><span class="num">08</span>Counter &amp; defaultdict</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"What sold most?" and "what did each customer order?" are counting and grouping. With a plain dict we keep writing <code>d.get(k, 0) + 1</code> and <code>d.setdefault(k, []).append(x)</code>. Can the dict itself know what a missing key should start as?</p>
  </div>
  <h3>Counter: a dict for counting</h3>
  <p><code>collections.Counter</code> is a dict whose missing keys read as 0, plus counting tools.</p>
  <div class="fx" data-lang="py">from collections import Counter
sold = Counter()
for name, item, qty in orders:
    sold[item] += qty                    # a missing key counts as 0
print(sold)
print(sold.most_common(2))
print(sold["vada pav"], len(sold))       # missing -&gt; 0, and NOT added
visits = Counter(name for name, item, qty in orders)
print(visits)
yesterday_sold = Counter({"masala chai": 3, "samosa": 4, "vada pav": 2})
print(sold - yesterday_sold)             # only positive differences survive
print(sold + yesterday_sold)</div>
  <div class="fx" data-lang="text">Counter({'masala chai': 5, 'samosa': 3, 'bun maska': 2, 'ginger chai': 1})
[('masala chai', 5), ('samosa', 3)]
0 4
Counter({'Asha': 2, 'Ben': 2, 'Chen': 1, 'Dia': 1})
Counter({'masala chai': 2, 'bun maska': 2, 'ginger chai': 1})
Counter({'masala chai': 8, 'samosa': 7, 'bun maska': 2, 'vada pav': 2, 'ginger chai': 1})</div>
  <p>By hand from the orders: masala chai 2 + 1 + 2 = 5, samosa 3, bun maska 2, ginger chai 1. <code>most_common(2)</code> gives the top two. A missing key reads as 0 without being added (len stays 4). <code>Counter(iterable)</code> counts items directly: Asha and Ben ordered twice. Counters subtract and add: compared with yesterday (masala chai 3, samosa 4, vada pav 2), today sold 2 more masala chai; samosa (3 − 4) and vada pav went negative and were dropped, because <code>−</code> keeps only positive counts.</p>
  <h3>defaultdict: a dict that builds missing values</h3>
  <p><code>collections.defaultdict(factory)</code> calls <code>factory()</code> to create the value the first time a missing key is used: <code>list</code> gives <code>[]</code>, <code>int</code> gives 0, <code>set</code> gives an empty set.</p>
  <div class="fx" data-lang="py">from collections import defaultdict
items_by_customer = defaultdict(list)    # missing key -&gt; a fresh []
bill = defaultdict(int)                  # missing key -&gt; int() = 0
for name, item, qty in orders:
    items_by_customer[name].append(item)
    bill[name] += qty * menu[item]
print(dict(items_by_customer))
print(dict(bill), sum(bill.values()))
print(items_by_customer["Zoya"], "Zoya" in items_by_customer)   # a READ creates the key!</div>
  <div class="fx" data-lang="text">{'Asha': ['masala chai', 'ginger chai'], 'Ben': ['samosa', 'masala chai'], 'Chen': ['masala chai'], 'Dia': ['bun maska']}
{'Asha': 65, 'Ben': 85, 'Chen': 20, 'Dia': 60} 230
[] True</div>
  <p>Same groups and same bills as sections 05 (Asha 65, Ben 85, Chen 20, Dia 60, total 230), with no get or setdefault. But the last line shows the price: just <em>reading</em> <code>items_by_customer["Zoya"]</code> created Zoya with an empty list.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tally sheet where every possible item already has a 0 next to it (Counter), and a filing cabinet that grows a fresh empty folder the moment you ask for a name it has not seen (defaultdict).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>Counter</code>: a dict subclass mapping items to counts; missing keys return 0; <code>most_common(k)</code>, <code>update</code>, <code>+ − &amp; |</code>. <code>defaultdict(default_factory)</code>: a dict subclass that, on <code>d[k]</code> for a missing k, sets <code>d[k] = default_factory()</code> and returns it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>With a defaultdict, use <code>k in d</code> or <code>d.get(k)</code> to <em>check</em>, never <code>d[k]</code>: reading inserts. Convert with <code>dict(d)</code> before handing it to code that expects KeyErrors.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Sets &amp; Set Operations.</b> Sometimes we do not need a value at all, only the keys: "who are today's customers?", "who came both days?". A dict with dummy values would work, but Python has a dedicated container.</div>

  <h2 id="pds-set"><span class="num">09</span>Sets &amp; Set Operations</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The names column has six entries but only four people. "How many different customers?", "who came both Monday and Sunday?", "who stopped coming?" are questions about membership, not about values or positions.</p>
  </div>
  <h3>Plain words</h3>
  <p>A <strong>set</strong> is a hash table with keys only: each item is stored once, there is no order, and <code>in</code> is O(1). Its two jobs: remove duplicates, and answer "is x here?" fast. Like dict keys, set items must be hashable.</p>
  <div class="fx" data-lang="py">names = [name for name, item, qty in orders]
customers = set(names)
print(names)
print(customers, len(customers))
print("Esha" in customers)
customers.add("Esha")            # add: no effect if already there
customers.add("Asha")
customers.discard("Zoya")        # discard: no error if missing
customers.remove("Esha")         # remove: KeyError if missing
print(sorted(customers))
print({item for name, item, qty in orders if "chai" in item})   # set comprehension</div>
  <div class="fx" data-lang="text">['Asha', 'Ben', 'Asha', 'Chen', 'Dia', 'Ben']
{'Chen', 'Asha', 'Ben', 'Dia'} 4
False
['Asha', 'Ben', 'Chen', 'Dia']
{'ginger chai', 'masala chai'}</div>
  <p>Six names become 4 customers. (The printed order of the set depends on string hashes, so it may differ in your run; <code>sorted</code> gives a stable order.) <code>add</code> ignores duplicates, <code>discard</code> ignores missing items, <code>remove</code> raises KeyError for them. A set comprehension collects the distinct chai items.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A guest register where each name is written once, however many times the person comes in, and the doorman can tell instantly whether a name is in it.</p></div>
  <h3>Set operations on today vs yesterday</h3>
  <p>Yesterday's customers were Ben, Dia and Esha. Before running anything, fill in the Venn diagram by hand:</p>
  <figure class="viz"><svg viewBox="0 0 440 200" width="440">
    <circle cx="160" cy="100" r="80" class="fb sb" fill-opacity="0.35"/>
    <circle cx="270" cy="100" r="80" class="fg sg" fill-opacity="0.35"/>
    <text x="110" y="24" class="tb">today</text><text x="290" y="24" class="tg">yesterday</text>
    <text x="100" y="95">Asha</text><text x="100" y="115">Chen</text>
    <text x="198" y="95">Ben</text><text x="200" y="115">Dia</text>
    <text x="295" y="105">Esha</text>
    <text x="70" y="196" class="tm">today − yesterday</text><text x="185" y="196" class="tm">both (&amp;)</text><text x="280" y="196" class="tm">yesterday − today</text>
  </svg><figcaption>Today {Asha, Ben, Chen, Dia} and yesterday {Ben, Dia, Esha}. The overlap is &amp;; everything is |; one side only is −; the two outer parts together are ^.</figcaption></figure>
  <div class="fx" data-lang="py">today = {"Asha", "Ben", "Chen", "Dia"}
yesterday = {"Ben", "Dia", "Esha"}
print("both days  (&amp;):", sorted(today &amp; yesterday))
print("either day (|):", sorted(today | yesterday))
print("new today  (-):", sorted(today - yesterday))
print("lapsed     (-):", sorted(yesterday - today))
print("one day only (^):", sorted(today ^ yesterday))
print({"Ben", "Dia"} &lt;= today, today.isdisjoint({"Zoya"}))</div>
  <div class="fx" data-lang="text">both days  (&amp;): ['Ben', 'Dia']
either day (|): ['Asha', 'Ben', 'Chen', 'Dia', 'Esha']
new today  (-): ['Asha', 'Chen']
lapsed     (-): ['Esha']
one day only (^): ['Asha', 'Chen', 'Esha']
True True</div>
  <table class="tbl">
    <tr><th>operator</th><th>method</th><th>meaning</th><th>Chai Corner answer</th></tr>
    <tr><td><code>a | b</code></td><td><code>union</code></td><td>in either</td><td>all 5 people who came at all</td></tr>
    <tr><td><code>a &amp; b</code></td><td><code>intersection</code></td><td>in both</td><td>regulars: Ben, Dia</td></tr>
    <tr><td><code>a - b</code></td><td><code>difference</code></td><td>in a, not in b</td><td>new today: Asha, Chen; lapsed: Esha</td></tr>
    <tr><td><code>a ^ b</code></td><td><code>symmetric_difference</code></td><td>in exactly one</td><td>Asha, Chen, Esha</td></tr>
    <tr><td><code>a &lt;= b</code></td><td><code>issubset</code></td><td>every item of a is in b</td><td>{Ben, Dia} ⊆ today: True</td></tr>
  </table>
  <h3>More set facts</h3>
  <div class="fx" data-lang="py">print(type({}), type(set()), type({"Asha"}))
print(list(dict.fromkeys(["Asha", "Ben", "Asha", "Chen", "Dia", "Ben"])))   # dedupe, keep order
frozen = frozenset({"Asha", "Ben"})
groups = {frozen: "table 1"}               # a frozenset is hashable
print(groups[frozenset({"Ben", "Asha"})])
try:
    {["Asha"]}
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">&lt;class 'dict'&gt; &lt;class 'set'&gt; &lt;class 'set'&gt;
['Asha', 'Ben', 'Chen', 'Dia']
table 1
TypeError: unhashable type: 'list'</div>
  <ul>
    <li><code>{}</code> is an empty dict; the empty set is <code>set()</code>. <code>{"Asha"}</code> is a set.</li>
    <li>Dedupe <em>keeping order</em>: <code>list(dict.fromkeys(xs))</code> (dict keys are unique and ordered). <code>list(set(xs))</code> dedupes but scrambles the order.</li>
    <li>A set is mutable, so it is not hashable; a <code>frozenset</code> is the immutable, hashable version, usable as a dict key (an unordered group of people at a table: the order of names does not matter).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>set</strong> is a mutable, unordered collection of distinct hashable objects, implemented as a hash table without values: <code>add</code>, <code>discard</code>, <code>in</code> O(1) average; union/intersection/difference cost about the sizes of the sets involved. <strong>frozenset</strong> is its immutable, hashable counterpart.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>set("chai")</code> is {'c', 'h', 'a', 'i'}: a string is a sequence of characters. To make a one-item set use <code>{"chai"}</code> or <code>set(["chai"])</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Membership Speed, Measured.</b> We keep saying "O(1) vs O(n)". On four customers nobody can tell the difference. How big is the gap on real data, and where does it bite in real code?</div>

  <h2 id="pds-speed"><span class="num">10</span>Membership Speed, Measured</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Is "set lookup is faster" a detail or a big deal? Scale the stall up to a chain: 100,000 customer ids. How long does "is this id here?" take with a list, and with a set?</p>
  </div>
  <div class="fx" data-lang="py">import timeit
n = 100_000
ids_list = list(range(n))
ids_set = set(ids_list)
target = n - 1                             # worst case for the list: the last item
t_list = timeit.timeit(lambda: target in ids_list, number=200) / 200
t_set = timeit.timeit(lambda: target in ids_set, number=200) / 200
print(f"list: {t_list * 1e6:9.1f} us per lookup")
print(f"set:  {t_set * 1e6:9.3f} us per lookup")
print(f"set is about {t_list / t_set:,.0f}x faster")</div>
  <div class="fx" data-lang="text">list:     515.7 us per lookup
set:      0.060 us per lookup
set is about 8,623x faster</div>
  <p>The list checks up to 100,000 items one by one (we asked for the last one, its worst case); the set hashes the id and checks one slot. The ratio is in the thousands. Exact times vary by machine; the shape does not.</p>
  <h3>Where it really bites: a list inside a loop</h3>
  <p>The common real bug: checking each of today's 20,000 customers against a <em>list</em> of 10,000 regulars. That is 20,000 × up to 10,000 comparisons: O(n × m). Converting the regulars to a set once (O(m)) makes each check O(1):</p>
  <div class="fx" data-lang="py">import timeit
regulars = [f"cust{i}" for i in range(0, 20_000, 2)]     # 10,000 regulars
today_ids = [f"cust{i}" for i in range(20_000)]          # 20,000 customers today
def with_list():
    return [c for c in today_ids if c in regulars]      # a list scan inside a loop
def with_set():
    reg = set(regulars)                                 # build once: O(n)
    return [c for c in today_ids if c in reg]
print(with_list() == with_set(), len(with_set()))
print(f"list inside loop: {timeit.timeit(with_list, number=1):.2f} s")
print(f"set inside loop:  {timeit.timeit(with_set, number=1):.4f} s")</div>
  <div class="fx" data-lang="text">True 10000
list inside loop: 1.02 s
set inside loop:  0.0013 s</div>
  <p>Same answer (10,000 regulars came), same code shape, one extra line, and the time drops from about a second to about a millisecond. This is the single most common speed-up in interviews and in data scripts.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Checking 20,000 visitors against a printed guest list by reading it top to bottom each time, versus a doorman who knows every guest by face.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>x in list</code> / <code>x in tuple</code>: O(n) linear search. <code>x in set</code> / <code>x in dict</code>: O(1) average hash lookup. Building a set from n items: O(n), worth it as soon as you check membership more than a handful of times.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Converting inside the loop (<code>if c in set(regulars)</code>) rebuilds the set every time and is even slower than the list. Build it once, outside.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Traps, Demonstrated.</b> Hashing gives speed and rules. Most bugs with dicts and sets come from forgetting one of the rules. Which ones, and what do they look like?</div>

  <h2 id="pds-traps"><span class="num">11</span>Traps, Demonstrated</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have seen two traps already (changing size while looping, keys that change). What do the others look like when they happen?</p>
  </div>
  <h3>Equal keys share one slot</h3>
  <div class="fx" data-lang="py">print({1: "int", 1.0: "float", True: "bool"})
print({0, False, 0.0, "0"})</div>
  <div class="fx" data-lang="text">{1: 'bool'}
{0, '0'}</div>
  <p><code>1 == 1.0 == True</code> and they hash the same, so the dict sees one key: the first key object (1) stays, and each later assignment overwrites the value, ending with 'bool'. Same in sets: 0, False and 0.0 collapse into one; the string "0" is different.</p>
  <h3>hash() is not stable across runs</h3>
  <p>Section 02 showed "samosa" hashing differently in two processes. So never use <code>hash()</code> to split users into A/B groups, shard files, or make a train/test split: the same user lands in a different group tomorrow. Use <code>hashlib</code>, which gives the same digest everywhere:</p>
  <div class="fx" data-lang="py">import hashlib
def bucket(user_id, n=2):
    digest = hashlib.md5(user_id.encode()).hexdigest()    # same in every process
    return int(digest, 16) % n
for u in ["Asha", "Ben", "Chen", "Dia", "Esha", "Faiz"]:
    print(u, "-&gt; group", "AB"[bucket(u)], end="   ")</div>
  <div class="fx" data-lang="text">Asha -&gt; group A   Ben -&gt; group A   Chen -&gt; group A   Dia -&gt; group A   Esha -&gt; group B   Faiz -&gt; group B   </div>
  <div class="callout trap"><span class="label">Trap: changing a dict's size while looping</span><p>RuntimeError (section 06). Loop over <code>list(d)</code> or build a new dict.</p></div>
  <div class="callout trap"><span class="label">Trap: mutable or changing keys</span><p>Lists, dicts and sets cannot be keys (TypeError: unhashable). A custom object whose hash changes is silently lost (section 03). Use tuples, strings, numbers, frozensets.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>{}</code> is not an empty set</span><p><code>s = {}</code> then <code>s.add(x)</code> → AttributeError: 'dict' object has no attribute 'add'. Use <code>set()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: relying on set order</span><p><code>list(set(xs))</code> loses the original order, and string sets may print differently each run. Use <code>dict.fromkeys</code> to dedupe in order, <code>sorted</code> for display.</p></div>
  <div class="callout trap"><span class="label">Trap: reading a defaultdict inserts</span><p><code>d["Zoya"]</code> on a defaultdict creates Zoya. Check with <code>in</code> or <code>get</code>.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>hashlib.md5(b).hexdigest()</code> (or sha256) is a deterministic digest of bytes: the same input gives the same output on every machine and run, unlike <code>hash()</code> on str/bytes, which is salted per process (controlled by <code>PYTHONHASHSEED</code>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One trick (hashing) and many tools. One picture and one table should now hold them together.</div>

  <h2 id="pds-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Hashing, O(1), hashability, CRUD, get/setdefault, order, comprehensions, Counter, defaultdict, sets, the speed race and the traps: how is each built from the one before?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="pds-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fr sr"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">linear search</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">list of pairs: up to n steps</text>
<line x1="180" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#pds-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">hashing</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">slot = hash(key) % size</text>
<line x1="420" y1="32" x2="478" y2="32" stroke="currentColor" marker-end="url(#pds-a9)"/>
<rect x="480" y="10" width="170" height="44" rx="7" class="fb sb"/><text x="565" y="29" text-anchor="middle" font-size="11.5" font-weight="700">collisions → probe</text><text x="565" y="45" text-anchor="middle" class="tm" font-size="10">samosa 4 → 5</text>
<line x1="300" y1="54" x2="200" y2="88" stroke="currentColor" marker-end="url(#pds-a9)"/><line x1="360" y1="54" x2="460" y2="88" stroke="currentColor" marker-end="url(#pds-a9)"/>
<rect x="90" y="90" width="210" height="44" rx="7" class="ft st"/><text x="195" y="109" text-anchor="middle" font-size="11.5" font-weight="700">O(1) average lookup</text><text x="195" y="125" text-anchor="middle" class="tm" font-size="10">table ≤ 2/3 full; worst O(n)</text>
<rect x="360" y="90" width="210" height="44" rx="7" class="ft st"/><text x="465" y="109" text-anchor="middle" font-size="11.5" font-weight="700">keys must be hashable</text><text x="465" y="125" text-anchor="middle" class="tm" font-size="10">a changing key gets lost</text>
<line x1="195" y1="134" x2="120" y2="168" stroke="currentColor" marker-end="url(#pds-a9)"/><line x1="330" y1="134" x2="330" y2="168" stroke="currentColor" marker-end="url(#pds-a9)"/><line x1="465" y1="134" x2="540" y2="168" stroke="currentColor" marker-end="url(#pds-a9)"/>
<rect x="10" y="170" width="220" height="44" rx="7" class="fg sg"/><text x="120" y="189" text-anchor="middle" font-size="11.5" font-weight="700">dict: key → value</text><text x="120" y="205" text-anchor="middle" class="tm" font-size="10">CRUD · get · setdefault · order</text>
<rect x="245" y="170" width="170" height="44" rx="7" class="fg sg"/><text x="330" y="189" text-anchor="middle" font-size="11.5" font-weight="700">set: keys only</text><text x="330" y="205" text-anchor="middle" class="tm" font-size="10">unique · | &amp; − ^</text>
<rect x="430" y="170" width="220" height="44" rx="7" class="fr sr"/><text x="540" y="189" text-anchor="middle" font-size="11.5" font-weight="700">traps</text><text x="540" y="205" text-anchor="middle" class="tm" font-size="10">1 == True · salted hash() · mutating</text>
<line x1="70" y1="214" x2="70" y2="246" stroke="currentColor" marker-end="url(#pds-a9)"/><line x1="170" y1="214" x2="200" y2="246" stroke="currentColor" marker-end="url(#pds-a9)"/><line x1="330" y1="214" x2="380" y2="246" stroke="currentColor" marker-end="url(#pds-a9)"/>
<rect x="10" y="248" width="120" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="70" y="267" text-anchor="middle" font-size="11" font-weight="700">comprehensions</text><text x="70" y="283" text-anchor="middle" class="tm" font-size="10">{k: v for …}</text>
<rect x="140" y="248" width="170" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="225" y="267" text-anchor="middle" font-size="11" font-weight="700">Counter · defaultdict</text><text x="225" y="283" text-anchor="middle" class="tm" font-size="10">missing key → 0 / [ ]</text>
<rect x="320" y="248" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="420" y="267" text-anchor="middle" font-size="11" font-weight="700">fast membership</text><text x="420" y="283" text-anchor="middle" class="tm" font-size="10">set vs list: thousands of ×</text>
</svg><figcaption>Everything grows from one fix for one problem: linear search is slow, so let the key compute its own slot. That gives O(1) lookup and, as its price, the hashability rule. A dict stores values in those slots, a set stores only keys; the tools and traps hang off those two.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the Chai Corner morning</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On our data</th><th>Use when</th></tr>
    <tr><td>Linear search</td><td>a list of pairs</td><td>find by name (slowly)</td><td>bun maska: 4 steps</td><td>tiny data only</td></tr>
    <tr><td>Hashing</td><td>hash % slots, probing</td><td>where is the key stored?</td><td>samosa → 4 → 5</td><td>(inside every dict/set)</td></tr>
    <tr><td>O(1) lookup</td><td>hashing + spare room</td><td>is it fast at any size?</td><td>10 vs 10⁶ keys: same ns</td><td>any lookup-heavy code</td></tr>
    <tr><td>Hashable</td><td>stable hash + equality</td><td>what can be a key?</td><td>changed Table key lost</td><td>choosing key types</td></tr>
    <tr><td>Dict CRUD</td><td>hash table with values</td><td>store and change by name</td><td><code>menu["samosa"]</code> = 15</td><td>menus, configs, records</td></tr>
    <tr><td>get / setdefault</td><td>CRUD + default</td><td>missing keys</td><td>bills 65, 85, 20, 60 → 230</td><td>totals, grouping</td></tr>
    <tr><td>Order &amp; views</td><td>compact entries list</td><td>loop order</td><td>Asha, Ben, Chen, Dia</td><td>receipts, reports</td></tr>
    <tr><td>Dict comprehension</td><td>loop + assign</td><td>a new dict in one line</td><td>GST prices 21, 26, 16, 32</td><td>transform/filter/invert</td></tr>
    <tr><td>Counter</td><td>dict, missing → 0</td><td>how many of each?</td><td>masala chai 5, samosa 3</td><td>frequencies, top-k</td></tr>
    <tr><td>defaultdict</td><td>dict + factory</td><td>group without setup</td><td>Asha → [masala, ginger]</td><td>grouping, nested counts</td></tr>
    <tr><td>Set &amp; operations</td><td>hash table, no values</td><td>unique? both? only one?</td><td>4 customers; both days Ben, Dia</td><td>dedupe, compare id lists</td></tr>
    <tr><td>Membership speed</td><td>O(1) vs O(n)</td><td>does it matter?</td><td>list ~1 s vs set ~1 ms in a loop</td><td>any <code>in</code> inside a loop</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a dict or set lets the key compute where it lives, so finding it costs O(1), on the condition that the key never changes.</strong> Speed comes from the first half, every rule (hashable keys, no resizing during loops, equal values share a key) from the second.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="py_strings">Strings</a>: our keys and names are strings, and the orders actually arrive as lines of text that must be split and parsed before any of this can run.</div>

  <h2 id="pds-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: orders (Asha, masala chai, 2), (Ben, samosa, 3), (Asha, ginger chai, 1), (Chen, masala chai, 1), (Dia, bun maska, 2), (Ben, masala chai, 2); menu masala chai 20, ginger chai 25, samosa 15, bun maska 30; yesterday's customers Ben, Dia, Esha.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Linear search</td><td>find a price by name?</td><td>bun maska 4 steps, vada pav 4</td><td>O(n) per lookup</td></tr>
    <tr><td>Hashing</td><td>key → slot?</td><td>toy: 4, 1, 4→5, 2 in 8 slots</td><td>is it always fast? rules?</td></tr>
    <tr><td>O(1) &amp; hashable</td><td>why fast, what can be a key?</td><td>same ns for 10 and 10⁶ keys; changed key lost</td><td>how to use daily?</td></tr>
    <tr><td>CRUD</td><td>create/read/update/delete?</td><td><code>menu["samosa"]</code> 15; KeyError for vada pav</td><td>missing keys crash</td></tr>
    <tr><td>get / setdefault</td><td>read with a fallback?</td><td>Asha 65, Ben 85, Chen 20, Dia 60</td><td>what order on loops?</td></tr>
    <tr><td>Order &amp; views</td><td>what does a loop give?</td><td>keys in insertion order; Ben richest</td><td>wordy to build</td></tr>
    <tr><td>Comprehension</td><td>dict in one line?</td><td>GST: 21, 26, 16, 32</td><td>counting/grouping boilerplate</td></tr>
    <tr><td>Counter / defaultdict</td><td>count and group?</td><td>masala chai 5; Asha → [masala, ginger]</td><td>need keys only?</td></tr>
    <tr><td>Set ops</td><td>unique, both, only?</td><td>&amp; Ben, Dia; − Asha, Chen; lapsed Esha</td><td>how much faster?</td></tr>
    <tr><td>Speed</td><td>list vs set <code>in</code>?</td><td>~thousands ×; loop 1 s → 1 ms</td><td>what can go wrong?</td></tr>
    <tr><td>Traps</td><td>where it bites?</td><td>{1: 'bool'}; salted hash; RuntimeError</td><td>→ Strings</td></tr>
  </table>
  <h3>Rules and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Slot</td><td>slot = hash(key) mod m, then probe on collision</td><td>m = number of slots; CPython keeps used/m below ~2/3</td></tr>
    <tr><td>Cost</td><td>get/set/del/in: O(1) average, O(n) worst</td><td>n keys; worst = everything collides</td></tr>
    <tr><td>Hashable</td><td>hash never changes; a == b ⇒ hash(a) == hash(b)</td><td>immutable built-ins; tuples if all items are</td></tr>
    <tr><td>get</td><td><code>d.get(k, default)</code></td><td>never inserts</td></tr>
    <tr><td>setdefault</td><td><code>d.setdefault(k, default)</code></td><td>inserts default if missing, returns value</td></tr>
    <tr><td>Merge</td><td><code>a | b</code> (new), <code>a |= b</code> / <code>update</code> (in place)</td><td>right side wins on clashes</td></tr>
    <tr><td>Set ops</td><td>| union, &amp; both, − only left, ^ exactly one, &lt;= subset</td><td>items hashable</td></tr>
    <tr><td>Counter</td><td>missing → 0; <code>most_common(k)</code>; − keeps positives</td><td>dict subclass</td></tr>
    <tr><td>defaultdict</td><td>missing key on <code>d[k]</code> → <code>factory()</code> stored</td><td>list, int, set as factories</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a dict</b><p>Look up, count or group by a key: menus, configs, id → record, totals per customer, JSON.</p><small>Not when you need order by position or duplicate keys</small></div>
    <div><b>Use a set</b><p>Unique items, fast "is it there?", comparing id lists (train vs test users, old vs new columns).</p><small>Not when order or counts matter (Counter, list)</small></div>
    <div><b>Use Counter / defaultdict</b><p>Frequencies and top-k (Counter); grouping into lists or summing per key (defaultdict).</p><small>Check with <code>in</code>, not <code>d[k]</code></small></div>
    <div><b>Use hashlib, not hash()</b><p>Any hash that must be the same tomorrow: A/B buckets, sharding, reproducible splits.</p><small>hash(str) is salted per process</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Changing size while iterating; mutable or changing keys; 1, 1.0, True are one key; <code>{}</code> is a dict; set order is not insertion order; <code>list(set(x))</code> loses order; reading a defaultdict inserts; building the set inside the loop; <code>in d</code> checks keys, not values; hash() differs between runs.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Toy hash: "samosa" sums to 644. Slot in an 8-slot table?</td><td>644 % 8 = 4 (taken by masala chai → probe to 5)</td></tr>
    <tr><td>Why can't a list be a dict key?</td><td>It can change, so its hash could change and the entry would be lost; lists are unhashable</td></tr>
    <tr><td>Asha's bill: 2 masala chai + 1 ginger chai?</td><td>2 × 20 + 1 × 25 = ₹65</td></tr>
    <tr><td>{Asha, Ben, Chen, Dia} − {Ben, Dia, Esha}?</td><td>{Asha, Chen}</td></tr>
    <tr><td><code>print({1: "a", True: "b", 1.0: "c"})</code>?</td><td><code>{1: 'c'}</code>: one key, last value wins, first key object kept</td></tr>
  </table>

  <h2 id="pds-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>x in set</code> O(1) but <code>x in list</code> O(n)?</summary><div class="qa-body">A list compares items one by one. A set is a hash table: <code>hash(x)</code> picks a slot directly, then an equality check (plus a few probes after collisions) confirms. O(1) on average; O(n) only if many keys collide. Measured on 100,000 ids: thousands of times faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain how a dict stores and finds "samosa", using a tiny table.</summary><div class="qa-body">Compute a hash (toy: letter codes sum to 644), take it mod the table size (644 % 8 = 4). Slot 4 already holds masala chai, a collision, so probe to slot 5 and store there. Lookup repeats the same path: slot 4 (wrong key), slot 5 (match) → 15. A missing key hits an empty slot and stops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must dict keys be hashable/immutable?</summary><div class="qa-body">The slot is chosen from the key's hash at insert time. If the key changed, its hash would change, and lookups would probe the wrong slots; the entry stays in the dict but is unreachable (our Table key demo: <code>t1 in bill</code> False while len is 1). So Python needs a stable <code>__hash__</code>; lists, dicts and sets have none.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>print({1: "a", True: "b", 1.0: "c"})</code></summary><div class="qa-body"><code>{1: 'c'}</code>. 1 == True == 1.0 and they hash the same, so it is one key. The first key object stays; the value is overwritten each time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does a dict keep order? Does a set?</summary><div class="qa-body">A dict keeps insertion order (guaranteed since 3.7): CPython stores entries in a compact array in arrival order and a separate index table of slots. Updating a key keeps its place. A set does not: its iteration order follows hash slots and, for strings, can change between runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>get</code> vs <code>setdefault</code> vs <code>defaultdict</code>?</summary><div class="qa-body">get reads with a fallback and never inserts (totals: <code>d.get(k, 0) + x</code>). setdefault inserts the default if missing and returns the stored value (grouping: <code>d.setdefault(k, []).append(x)</code>), but builds the default every call. defaultdict builds the default only when a missing key is accessed, with no per-call code; downside: any read of a missing key inserts it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Remove duplicates from a list while keeping order.</summary><div class="qa-body"><code>list(dict.fromkeys(xs))</code>: dict keys are unique and keep insertion order. <code>list(set(xs))</code> loses order. Both O(n); items must be hashable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a one-liner: word frequencies, top 3.</summary><div class="qa-body"><code>Counter(text.lower().split()).most_common(3)</code>. For grouping instead of counting: <code>d = defaultdict(list); d[k].append(v)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You get "RuntimeError: dictionary changed size during iteration". Fix?</summary><div class="qa-body">You added or deleted keys inside <code>for k in d</code>. Loop over a snapshot (<code>for k in list(d)</code>) or build a new dict with a comprehension (<code>{k: v for k, v in d.items() if keep(v)}</code>). Changing values of existing keys is allowed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use <code>hash(user_id)</code> to assign users to A/B buckets?</summary><div class="qa-body">String hashes are salted per Python process, so the same user lands in different buckets on different runs or machines. Use a stable digest: <code>int(hashlib.md5(uid.encode()).hexdigest(), 16) % 100</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the set live in the same note as the dict?</summary><div class="qa-body">A set is a dict without values: the same hash table, the same O(1) membership, the same hashability rule for its items, the same "no order to rely on" caveat (except that dicts additionally keep an ordered entries list). Learn hashing once and both containers follow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the "hashable" idea from Lists &amp; Tuples?</summary><div class="qa-body">You cannot predict which keys work: why <code>("Ben", "samosa")</code> is a fine key but <code>["Ben", "samosa"]</code> and <code>("t1", ["Asha"])</code> are not, why a set of lists fails, and why a custom class with <code>__eq__</code> suddenly becomes unhashable. All of these are the one rule: the hash must never change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does turning a list into a set inside a loop speed up code from O(n·m) to O(n + m)?</summary><div class="qa-body">Each <code>in list</code> is a linear search (O(m)), done n times: O(n·m). Building the set once costs O(m), and each <code>in set</code> is O(1), so n checks cost O(n): total O(n + m). Measured: about 1 s down to about 1 ms for 20,000 × 10,000.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do these ideas appear outside plain Python?</summary><div class="qa-body">pandas <code>groupby</code>, <code>merge</code> and <code>value_counts</code> use hash tables (<a class="xref" data-note="da_pandas">Pandas</a>); SQL hash joins do the same; interview patterns like two-sum and group-anagrams are dict tricks (<a class="xref" data-note="dsa_hashing">DSA: Hashing</a>); caches (LRU, memoisation) are dicts keyed by arguments, which is why those arguments must be hashable.</div></details>
</main>
`
});
