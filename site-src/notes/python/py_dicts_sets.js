// notes/python/py_dicts_sets.js — Dicts & Sets
Object.assign(TOPIC_CONTENT, {
  "py_dicts_sets": `<main>
<h1>Dicts &amp; Sets</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Dicts &amp; Sets</span></div>
  <p class="lead">A dict maps keys to values and a set stores unique items; both find an element in constant average time, whether they hold ten items or ten million. Without them, every "look up by name" or "have I seen this?" is a linear scan, and a scan inside a loop turns an O(n) job into O(n²): the single most common performance bug in data scripts and interview solutions. Both are hash tables, so understanding hashing explains their speed, why keys must be hashable, how order is preserved, and every trap. They are everywhere in DS/ML and backend work: configs and JSON, feature lookups, counting and grouping, deduplication, caches, and inside pandas <code>groupby</code> and <code>merge</code>. Code here was run on Python 3.13.</p>

  <h2 id="pds-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dicts &amp; Sets</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Hashing</div>
        <ul>
          <li><b>slot = hash(key) % table size</b>; compare key there</li>
          <li><b>Collision</b>: slot taken by another key → probe another slot</li>
          <li>Lookup: hash, jump to slot, compare with <code>==</code></li>
          <li>CPython: open addressing, perturbed probing</li>
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
          <li><code>Counter(iterable)</code> counts directly; missing key not inserted</li>
          <li><b>defaultdict(list)</b>: group; <b>defaultdict(int)</b>: sum</li>
          <li><code>defaultdict(set)</code>: unique values per key</li>
          <li>⚠ reading a missing key of a defaultdict creates it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sets</div>
        <ul>
          <li>Unique, unordered, hashable items; O(1) <code>in</code></li>
          <li><code>| &amp; - ^</code>: either, both, only-left, one-only</li>
          <li><code>a &lt;= b</code> subset; <code>isdisjoint</code>; set comprehension <code>{x for …}</code></li>
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
      <div class="rm-item rm-done" data-target="pds-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Dicts</span><span class="rm-sub">Linear search vs hash lookup</span></div></div>
      <div class="rm-item rm-done" data-target="pds-hash"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hash Tables</span><span class="rm-sub">Slots, collisions, probing, resizing</span></div></div>
      <div class="rm-item rm-done" data-target="pds-o1"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">O(1) &amp; Hashable Keys</span><span class="rm-sub">Average vs worst case, the hash contract</span></div></div>
      <div class="rm-item rm-done" data-target="pds-crud"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Dict CRUD</span><span class="rm-sub">Create, read, update, delete, merge</span></div></div>
      <div class="rm-item rm-done" data-target="pds-get"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">get() &amp; setdefault()</span><span class="rm-sub">Reading missing keys safely</span></div></div>
      <div class="rm-item rm-done" data-target="pds-iter"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Iterating Dicts</span><span class="rm-sub">Insertion order, views, mutation errors</span></div></div>
      <div class="rm-item rm-done" data-target="pds-comp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Dict Comprehensions</span><span class="rm-sub">Transform, filter, invert</span></div></div>
      <div class="rm-item rm-done" data-target="pds-coll"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Counter &amp; defaultdict</span><span class="rm-sub">Counting and grouping</span></div></div>
      <div class="rm-item rm-done" data-target="pds-set"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Sets &amp; Set Operations</span><span class="rm-sub">Union, intersection, difference, frozenset</span></div></div>
      <div class="rm-item rm-done" data-target="pds-speed"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Membership Testing</span><span class="rm-sub">list vs set, measured</span></div></div>
      <div class="rm-item rm-done" data-target="pds-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Equal keys, salted hashes, set order</span></div></div>
      <div class="rm-item rm-done" data-target="pds-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Rules, Big-O tables, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pds-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">21 questions, basic to internals</span></div></div>
    </div>
  </div>
  </div>

  <h2 id="pds-need"><span class="num">01</span>Why Dicts: Linear Search vs Hash Lookup</h2>
  <p>Many lookups are by <em>name</em>, not by position: the price of an item, the record for a user id, the config value for a key. With only lists, the data becomes a list of (key, value) pairs and every lookup is a linear search.</p>
  <h3>Lookup with a list of pairs</h3>
  <p>Finding a price means walking the list until the names match. We count the steps:</p>
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

  <h2 id="pds-hash"><span class="num">02</span>Hash Tables: Hashing, Slots and Collisions</h2>
  <p>A hash table turns a key into an array position, so a lookup by name becomes as fast as an index. A dict keeps an array of <strong>slots</strong> (say 8). To store a key, Python computes a number from the key, its <strong>hash</strong>, and takes the remainder after dividing by the number of slots: <code>hash(key) % 8</code> is a slot number from 0 to 7. The key and value go into that slot. To look the key up later, compute the same number, go straight to that slot, and check the key there.</p>
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
  <p>Bun maska: hash → slot 2, key matches, done in 1 step. Samosa: slot 4 holds masala chai (wrong key), follow the same rule to slot 5, match: 2 steps. Vada pav: its toy hash sends it to slot 3, which is empty, so it cannot be anywhere else: "not there" after 1 step, without looking at the other keys. Compare with the 4-step linear scan.</p>
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
    <li>Equal numbers hash equally across types: 1, 1.0 and True all hash to 1.</li>
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
  <p>A real dict also keeps spare room: when its table is about 2/3 full it moves to a bigger one (here at the 6th and 11th keys: an 8-slot table holds 5 keys, 16 slots hold 10). Collisions stay rare because the table is never crowded. Inside CPython, the slot table holds only small numbers pointing into a separate, compact list of (hash, key, value) entries kept in insertion order. That second list is why <code>list(menu)</code> comes back in the order you inserted, a guarantee since Python 3.7.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>hash table</strong> stores entries in an array of slots, placing each key at a slot computed from <code>hash(key)</code>. A <strong>hash function</strong> maps a key to an integer; equal keys must map to equal integers. A <strong>collision</strong> is two different keys mapped to the same slot; <strong>open addressing</strong> (what CPython uses) resolves it by probing other slots of the same array. The <strong>load factor</strong> (used slots ÷ total slots) is kept below about 2/3 by resizing.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The toy hash (sum of codes) is a bad real hash: "listen" and "silent" have the same letters, so the same sum, and would always collide. Real hash functions scramble every bit. Never write your own for production; use <code>hash()</code> inside a process and <code>hashlib</code> when the number must be the same across runs (see Common Mistakes).</p></div>

  <h2 id="pds-o1"><span class="num">03</span>Why Lookup Is O(1), and Why Keys Must Be Hashable</h2>
  <p>"Dict lookup is O(1)" and "lists can't be keys" are two consequences of the same design: the slot is computed from the key's hash.</p>
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

  <h2 id="pds-crud"><span class="num">04</span>Dict CRUD: Create, Read, Update, Delete</h2>
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

  <h2 id="pds-get"><span class="num">05</span>Missing Keys: get() and setdefault()</h2>
  <p>Accumulating totals or groups means writing to keys that do not exist yet, and <code>d[k]</code> raises KeyError on them. <code>get</code> and <code>setdefault</code> handle the missing case in one call, without an <code>if k in d</code> check.</p>
  <h3>get: read with a default</h3>
  <p><code>d.get(k, default)</code> returns <code>d[k]</code> if the key exists, otherwise <code>default</code> (None if not given). It never adds the key. Here each order adds qty × price to the customer's total, starting from 0:</p>
  <div class="fx" data-lang="py">orders = [                                   # (customer, item, qty)
    ("Asha", "masala chai", 2),
    ("Ben",  "samosa",      3),
    ("Asha", "ginger chai", 1),
    ("Chen", "masala chai", 1),
    ("Dia",  "bun maska",   2),
    ("Ben",  "masala chai", 2),
]
menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
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
  <p>Final totals: Asha 65, Ben 85, Chen 20, Dia 60 (sum 230).</p>
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
  <div class="callout trap"><span class="label">Trap</span><p><code>setdefault(k, [])</code> builds a new empty list on every call, even when the key exists and it is thrown away. Harmless for small data; for heavy defaults use <code>defaultdict</code> (below), which only builds one when needed.</p></div>

  <h2 id="pds-iter"><span class="num">06</span>Iterating Dicts: Insertion Order and View Objects</h2>
  <p>Looping over a dict yields its keys, in the order they were first inserted (a language guarantee since 3.7), not in hash-slot order. <code>keys()</code>, <code>values()</code> and <code>items()</code> return live views rather than copies.</p>
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
    <li><strong>A loop over a dict gives its keys</strong>, in <strong>insertion order</strong> (Asha, Ben, Chen, Dia), not slot order: the compact entries array keeps arrival order. Guaranteed since Python 3.7.</li>
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

  <h2 id="pds-comp"><span class="num">07</span>Dict Comprehensions</h2>
  <p>A <strong>dict comprehension</strong> is the same idea as a list comprehension (<a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>) with curly brackets and a <code>key: value</code> expression in front. Desugared: <code>out = {}</code>, then <code>for … : if … : out[key] = value</code>.</p>
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

  <h2 id="pds-coll"><span class="num">08</span>Counter &amp; defaultdict</h2>
  <p>Counting and grouping are the two most common dict jobs. <code>collections</code> provides dict subclasses that know what a missing key should start as, removing the <code>get</code>/<code>setdefault</code> boilerplate.</p>
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
  <p>Same groups and same totals as with get/setdefault (Asha 65, Ben 85, Chen 20, Dia 60, total 230), with no get or setdefault. But the last line shows the price: just <em>reading</em> <code>items_by_customer["Zoya"]</code> created Zoya with an empty list.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tally sheet where every possible item already has a 0 next to it (Counter), and a filing cabinet that grows a fresh empty folder the moment you ask for a name it has not seen (defaultdict).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>Counter</code>: a dict subclass mapping items to counts; missing keys return 0; <code>most_common(k)</code>, <code>update</code>, <code>+ − &amp; |</code>. <code>defaultdict(default_factory)</code>: a dict subclass that, on <code>d[k]</code> for a missing k, sets <code>d[k] = default_factory()</code> and returns it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>With a defaultdict, use <code>k in d</code> or <code>d.get(k)</code> to <em>check</em>, never <code>d[k]</code>: reading inserts. Convert with <code>dict(d)</code> before handing it to code that expects KeyErrors.</p></div>

  <h2 id="pds-set"><span class="num">09</span>Sets &amp; Set Operations</h2>
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
  <p>Set algebra answers "in both / in either / in only one" questions directly. Take today's customers {Asha, Ben, Chen, Dia} and yesterday's {Ben, Dia, Esha}:</p>
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
    <tr><th>operator</th><th>method</th><th>meaning</th><th>Example result</th></tr>
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

  <h2 id="pds-speed"><span class="num">10</span>Membership Testing: list vs set, Measured</h2>
  <p>"O(1) vs O(n)" is invisible on small data. Scaled to 100,000 ids, the difference between <code>in</code> on a list and on a set is thousands of times:</p>
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

  <h2 id="pds-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Most dict and set bugs come from forgetting one of the hashing rules. The less obvious ones, demonstrated:</p>
  <h3>Equal keys share one slot</h3>
  <div class="fx" data-lang="py">print({1: "int", 1.0: "float", True: "bool"})
print({0, False, 0.0, "0"})</div>
  <div class="fx" data-lang="text">{1: 'bool'}
{0, '0'}</div>
  <p><code>1 == 1.0 == True</code> and they hash the same, so the dict sees one key: the first key object (1) stays, and each later assignment overwrites the value, ending with 'bool'. Same in sets: 0, False and 0.0 collapse into one; the string "0" is different.</p>
  <h3>hash() is not stable across runs</h3>
  <p>String hashes are salted per process (shown above with two subprocesses). So never use <code>hash()</code> to split users into A/B groups, shard files, or make a train/test split: the same user lands in a different group tomorrow. Use <code>hashlib</code>, which gives the same digest everywhere:</p>
  <div class="fx" data-lang="py">import hashlib
def bucket(user_id, n=2):
    digest = hashlib.md5(user_id.encode()).hexdigest()    # same in every process
    return int(digest, 16) % n
for u in ["Asha", "Ben", "Chen", "Dia", "Esha", "Faiz"]:
    print(u, "-&gt; group", "AB"[bucket(u)], end="   ")</div>
  <div class="fx" data-lang="text">Asha -&gt; group A   Ben -&gt; group A   Chen -&gt; group A   Dia -&gt; group A   Esha -&gt; group B   Faiz -&gt; group B   </div>
  <div class="callout trap"><span class="label">Trap: changing a dict's size while looping</span><p>RuntimeError: dictionary changed size during iteration. Loop over <code>list(d)</code> or build a new dict.</p></div>
  <div class="callout trap"><span class="label">Trap: mutable or changing keys</span><p>Lists, dicts and sets cannot be keys (TypeError: unhashable). A custom object whose hash changes is silently lost. Use tuples, strings, numbers, frozensets.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>{}</code> is not an empty set</span><p><code>s = {}</code> then <code>s.add(x)</code> → AttributeError: 'dict' object has no attribute 'add'. Use <code>set()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: relying on set order</span><p><code>list(set(xs))</code> loses the original order, and string sets may print differently each run. Use <code>dict.fromkeys</code> to dedupe in order, <code>sorted</code> for display.</p></div>
  <div class="callout trap"><span class="label">Trap: reading a defaultdict inserts</span><p><code>d["Zoya"]</code> on a defaultdict creates Zoya. Check with <code>in</code> or <code>get</code>.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>hashlib.md5(b).hexdigest()</code> (or sha256) is a deterministic digest of bytes: the same input gives the same output on every machine and run, unlike <code>hash()</code> on str/bytes, which is salted per process (controlled by <code>PYTHONHASHSEED</code>).</p></div>

  <h2 id="pds-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why hashing</h3>
  <ul>
    <li>Linear search (<code>x in list</code>, <code>list.index</code>, scanning pairs) is O(n). A hash table computes where a key lives: O(1) average.</li>
    <li>Sorted list + <code>bisect</code> gives O(log n) lookup but O(n) insert; a dict gives O(1) for both.</li>
  </ul>
  <h3>Hash tables</h3>
  <ul>
    <li>slot = <code>hash(key) % table_size</code>; compare with <code>==</code> there; on a <strong>collision</strong> probe other slots (CPython: open addressing with a perturbed probe sequence).</li>
    <li>Table resizes when about 2/3 full (load factor), so probes stay short.</li>
    <li>CPython 3.6+: a sparse <em>index</em> table of small ints pointing into a dense <em>entries</em> array of (hash, key, value) in insertion order → memory-compact and ordered.</li>
    <li><code>hash(int)</code> is the int itself (mod 2<sup>61</sup> − 1); <code>hash(1) == hash(1.0) == hash(True)</code>; str/bytes hashes are salted per process (<code>PYTHONHASHSEED</code>).</li>
  </ul>
  <h3>Hashable keys</h3>
  <ul>
    <li>Contract: hash never changes during the object's life; <code>a == b ⇒ hash(a) == hash(b)</code> (not the reverse).</li>
    <li>Hashable: int, float, complex, str, bytes, bool, None, frozenset, tuple of hashables. Unhashable: list, dict, set, bytearray.</li>
    <li>Defining <code>__eq__</code> without <code>__hash__</code> sets <code>__hash__ = None</code> → instances unhashable.</li>
    <li>A key whose hash changes after insertion is still in the dict but unreachable.</li>
  </ul>
  <h3>Dict operations</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Syntax</th><th>Big-O (avg)</th><th>Missing key</th></tr>
    <tr><td>Read</td><td><code>d[k]</code></td><td>O(1)</td><td>KeyError</td></tr>
    <tr><td>Read with default</td><td><code>d.get(k, default)</code></td><td>O(1)</td><td>default (None); never inserts</td></tr>
    <tr><td>Read or insert</td><td><code>d.setdefault(k, default)</code></td><td>O(1)</td><td>inserts default, returns it</td></tr>
    <tr><td>Insert / update</td><td><code>d[k] = v</code></td><td>O(1)*</td><td>adds at end; existing key keeps position</td></tr>
    <tr><td>Delete</td><td><code>del d[k]</code>, <code>d.pop(k[, default])</code></td><td>O(1)</td><td>KeyError unless default given</td></tr>
    <tr><td>Last pair</td><td><code>d.popitem()</code></td><td>O(1)</td><td>LIFO</td></tr>
    <tr><td>Membership</td><td><code>k in d</code></td><td>O(1)</td><td>checks keys only</td></tr>
    <tr><td>Merge</td><td><code>a | b</code>, <code>{**a, **b}</code>, <code>a |= b</code>, <code>a.update(b)</code></td><td>O(len(b))</td><td>right side wins</td></tr>
    <tr><td>Iterate / copy</td><td><code>for k in d</code>, <code>d.copy()</code></td><td>O(n)</td><td>copy is shallow</td></tr>
  </table>
  <p>Worst case O(n) per operation if all keys collide. * amortised (occasional resize).</p>
  <h3>Iteration &amp; comprehensions</h3>
  <ul>
    <li>Iterating a dict yields keys in <strong>insertion order</strong> (language guarantee since 3.7). <code>.items()</code> pairs, <code>.values()</code> values.</li>
    <li><code>keys()</code>/<code>values()</code>/<code>items()</code> are live views; key and item views support <code>&amp; | - ^</code>.</li>
    <li>Adding/deleting keys while iterating → <code>RuntimeError: dictionary changed size during iteration</code>; iterate <code>list(d)</code> or build a new dict. Changing values is fine.</li>
    <li><code>{k: v for k, v in d.items() if cond}</code>; invert <code>{v: k for k, v in d.items()}</code> (duplicate values: last wins).</li>
    <li>Sort by value: <code>sorted(d.items(), key=lambda kv: kv[1], reverse=True)</code>; arg-max: <code>max(d, key=d.get)</code>.</li>
  </ul>
  <h3>Counter &amp; defaultdict</h3>
  <ul>
    <li><code>Counter(iterable)</code>: counts; missing → 0 (not inserted); <code>most_common(k)</code>; <code>+</code>, <code>-</code> (drops ≤ 0), <code>&amp;</code> (min), <code>|</code> (max); <code>c.total()</code>.</li>
    <li><code>defaultdict(list)</code> group, <code>defaultdict(int)</code> sum/count, <code>defaultdict(set)</code> unique group. Factory called only for a missing key.</li>
    <li>Reading a missing key of a defaultdict <em>inserts</em> it; test with <code>in</code> or <code>.get</code>.</li>
  </ul>
  <h3>Sets</h3>
  <table class="tbl">
    <tr><th>Operator</th><th>Method</th><th>Result</th></tr>
    <tr><td><code>a | b</code></td><td><code>union</code></td><td>in either</td></tr>
    <tr><td><code>a &amp; b</code></td><td><code>intersection</code></td><td>in both</td></tr>
    <tr><td><code>a - b</code></td><td><code>difference</code></td><td>in a, not b</td></tr>
    <tr><td><code>a ^ b</code></td><td><code>symmetric_difference</code></td><td>in exactly one</td></tr>
    <tr><td><code>a &lt;= b</code>, <code>a &lt; b</code></td><td><code>issubset</code></td><td>subset / proper subset</td></tr>
    <tr><td>—</td><td><code>isdisjoint</code></td><td>no common items</td></tr>
  </table>
  <ul>
    <li>Set: mutable, unordered, unique hashable items; <code>add</code>, <code>discard</code> (no error), <code>remove</code> (KeyError), <code>pop</code> (arbitrary). <code>in</code> O(1).</li>
    <li><code>frozenset</code>: immutable, hashable → usable as a dict key or inside another set.</li>
    <li>Empty set is <code>set()</code>; <code>{}</code> is a dict. <code>set("chai")</code> is a set of characters.</li>
    <li>Dedupe keeping order: <code>list(dict.fromkeys(xs))</code>; <code>list(set(xs))</code> loses order.</li>
  </ul>
  <h3>Membership speed</h3>
  <ul>
    <li><code>x in list</code> O(n) vs <code>x in set</code> O(1): ~8,600× on 100,000 ints (worst-case element).</li>
    <li>n checks against a list of m: O(n·m). Build the set <em>once</em> outside the loop: O(n + m) (1 s → 1 ms measured).</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>1</code>, <code>1.0</code>, <code>True</code> are one key: <code>{1: "a", True: "b"}</code> → <code>{1: 'b'}</code>.</li>
    <li><code>hash(str)</code> differs between runs → use <code>hashlib</code> for A/B buckets, sharding, reproducible splits.</li>
    <li><code>k in d</code> checks keys, not values (<code>v in d.values()</code> is O(n)).</li>
    <li><code>setdefault(k, [])</code> builds the default every call; defaultdict builds it only when needed.</li>
    <li>Set iteration order depends on hashes; sort before displaying or comparing output.</li>
    <li>Building <code>set(xs)</code> inside a loop is slower than the list scan it replaces.</li>
  </ul>

  <h2 id="pds-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a list, a dict and a set?</summary><div class="qa-body">A list is an ordered sequence indexed by position, allowing duplicates; membership is O(n). A dict maps unique hashable keys to values with O(1) average lookup by key and keeps insertion order. A set stores unique hashable items with O(1) average membership and no order or values. Dicts and sets are both hash tables; a set is essentially a dict without values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a Python dict achieve O(1) lookup?</summary><div class="qa-body">It is a hash table. <code>hash(key)</code> is reduced to a slot index; the dict jumps straight to that slot and compares the stored key with <code>==</code>. Collisions are resolved by open addressing: probing other slots in a deterministic pseudo-random sequence. The table is resized when about 2/3 full, so the expected number of probes stays constant regardless of size (measured: ~35 ns for 10 keys vs ~45 ns for 1,000,000 keys).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the worst-case complexity of a dict lookup, and when does it happen?</summary><div class="qa-body">O(n), when many keys collide into the same probe sequence, for example a custom <code>__hash__</code> that returns a constant, or adversarial inputs designed to collide. That second case is why CPython salts string hashes per process. With a decent hash function the average stays O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is a CPython dict laid out in memory, and why does it preserve insertion order?</summary><div class="qa-body">Since 3.6 it has two parts: a dense <em>entries</em> array holding (hash, key, value) in insertion order, and a sparse <em>index</em> table of small integers that maps hash slots to positions in the entries array. Lookups go through the index; iteration walks the entries array, so order is insertion order. This layout also uses much less memory than the older design. Order preservation became a language guarantee in Python 3.7.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must dict keys be hashable? Why can't a list be a key?</summary><div class="qa-body">The slot for a key is computed from its hash at insertion time. If the key could change afterwards, its hash would change and later lookups would probe the wrong slots, so the entry would be unreachable even though it is still stored. Lists are mutable, so Python gives them no <code>__hash__</code>; <code>{[1, 2]: 0}</code> raises <code>TypeError: unhashable type: 'list'</code>. Use a tuple (of hashables) or a frozenset instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the <code>__hash__</code>/<code>__eq__</code> contract? What happens if you define only <code>__eq__</code>?</summary><div class="qa-body">Objects that compare equal must have equal hashes, and the hash must not change while the object is in a dict or set. Unequal objects may share a hash (that is just a collision). If a class defines <code>__eq__</code> but not <code>__hash__</code>, Python sets <code>__hash__</code> to <code>None</code>, so instances become unhashable: <code>{P(1)}</code> raises <code>TypeError: unhashable type: 'P'</code>. Define <code>__hash__</code> from the same immutable fields used in <code>__eq__</code>, or use <code>@dataclass(frozen=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>print({1: "a", True: "b", 1.0: "c"})</code></summary><div class="qa-body"><code>{1: 'c'}</code>. <code>1 == True == 1.0</code> and they have the same hash, so they are the same key. The first key object inserted (<code>1</code>) is kept, and each later assignment overwrites the value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>d[k]</code> vs <code>d.get(k)</code> vs <code>d.setdefault(k, v)</code>?</summary><div class="qa-body"><code>d[k]</code> raises KeyError if missing. <code>d.get(k, default)</code> returns the default (None) and never modifies the dict, ideal for totals: <code>d[k] = d.get(k, 0) + x</code>. <code>d.setdefault(k, v)</code> inserts <code>v</code> if missing and returns the stored value, ideal for grouping: <code>d.setdefault(k, []).append(x)</code>, though it evaluates the default on every call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>defaultdict</code> or <code>Counter</code> instead of a plain dict?</summary><div class="qa-body"><code>defaultdict(factory)</code> when every missing key should start as the same empty value: <code>defaultdict(list)</code> for grouping, <code>defaultdict(int)</code> for sums. <code>Counter</code> for frequencies: <code>Counter(words).most_common(3)</code>, with counter arithmetic. Caveat for defaultdict: merely reading <code>d[missing]</code> inserts the key, so check with <code>in</code>, and convert with <code>dict(d)</code> before returning it to callers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>OrderedDict</code> still useful now that dicts are ordered?</summary><div class="qa-body">Yes, for a few things. Equality is order-sensitive: <code>OrderedDict(a=1, b=2) == OrderedDict(b=2, a=1)</code> is False, while the same plain dicts compare True. It has <code>move_to_end(key, last=True)</code> and <code>popitem(last=False)</code>, which make an LRU cache easy to build. Otherwise prefer a plain dict.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you merge two dicts? Which value wins on a clash?</summary><div class="qa-body"><code>a | b</code> (3.9+) or <code>{**a, **b}</code> build a new dict; <code>a |= b</code> or <code>a.update(b)</code> merge in place. In every form the right-hand side wins: <code>{"x": 1, "y": 2} | {"y": 20, "z": 30}</code> → <code>{'x': 1, 'y': 20, 'z': 30}</code>. All are shallow: nested dicts are shared, not merged recursively.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you invert a dict when values are not unique?</summary><div class="qa-body">A plain comprehension <code>{v: k for k, v in d.items()}</code> silently keeps only the last key per value (<code>{'A': 'Chen', 'B': 'Ben'}</code>). Group instead: <code>inv = defaultdict(list); for k, v in d.items(): inv[v].append(k)</code> → <code>{'A': ['Asha', 'Chen'], 'B': ['Ben']}</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You get <code>RuntimeError: dictionary changed size during iteration</code>. Why, and how do you fix it?</summary><div class="qa-body">Keys were added or deleted inside <code>for k in d</code>; the iterator walks the internal entries array, which the change invalidates. Iterate over a snapshot (<code>for k in list(d)</code>) or build a new dict with a comprehension (<code>{k: v for k, v in d.items() if keep(v)}</code>). Reassigning values of existing keys is allowed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Remove duplicates from a list while preserving order.</summary><div class="qa-body"><code>list(dict.fromkeys(xs))</code>: dict keys are unique and keep insertion order; O(n). <code>list(set(xs))</code> also dedupes but loses the order. Both require hashable items; for unhashable items (e.g. lists) dedupe on a hashable projection such as <code>tuple(x)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Solve two-sum: return indices of two numbers that add up to a target.</summary><div class="qa-body">One pass with a dict of value → index: for each <code>x</code>, if <code>target - x</code> is already in the dict you have the pair, else store <code>x</code>. O(n) time, O(n) space, versus O(n²) for nested loops.
<code>def two_sum(nums, t):<br>&nbsp;&nbsp;seen = {}<br>&nbsp;&nbsp;for i, x in enumerate(nums):<br>&nbsp;&nbsp;&nbsp;&nbsp;if t - x in seen: return seen[t - x], i<br>&nbsp;&nbsp;&nbsp;&nbsp;seen[x] = i</code><br><code>two_sum([2, 7, 11, 15], 9)</code> → <code>(0, 1)</code>; <code>two_sum([3, 2, 4], 6)</code> → <code>(1, 2)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the elements common to two large lists efficiently?</summary><div class="qa-body"><code>set(a) &amp; set(b)</code>, O(len(a) + len(b)), instead of <code>[x for x in a if x in b]</code>, which is O(len(a) × len(b)). If duplicates or order matter, build one set and filter the other: <code>sb = set(b); [x for x in a if x in sb]</code>. Build the set once, outside the loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>set vs frozenset? How do you write an empty set?</summary><div class="qa-body">A set is mutable and therefore unhashable; a frozenset is immutable and hashable, so it can be a dict key or an element of another set (e.g. an unordered pair <code>frozenset({a, b})</code> as a key). The empty set is <code>set()</code>; <code>{}</code> is an empty dict.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a set always faster than a list for membership?</summary><div class="qa-body">For anything beyond a handful of items, yes: O(1) vs O(n), thousands of times faster at 100,000 items. Exceptions: for a tiny collection checked once, building the set costs more than scanning; a list is needed when items are unhashable; and converting inside the loop (<code>x in set(big)</code>) rebuilds the set every iteration and is slower than the list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get the k most frequent items?</summary><div class="qa-body"><code>Counter(items).most_common(k)</code>, which uses a heap when k is given: O(n log k). Equivalent: <code>heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])</code>. For <code>Counter("mississippi")</code>, both give <code>[('i', 4), ('s', 4)]</code>. Sorting all items is O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't you use <code>hash(user_id)</code> to assign users to A/B groups or data splits?</summary><div class="qa-body">String and bytes hashes are randomised per interpreter process (hash randomisation, controlled by <code>PYTHONHASHSEED</code>) to defend against collision attacks, so the same id lands in a different bucket on another run or machine. Use a stable digest: <code>int(hashlib.md5(uid.encode()).hexdigest(), 16) % n</code> (or sha256).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do hash tables show up outside plain dicts and sets?</summary><div class="qa-body">pandas <code>groupby</code>, <code>merge</code>, <code>value_counts</code> and <code>drop_duplicates</code> use hash tables (<a class="xref" data-note="da_pandas">Pandas</a>); SQL hash joins and hash aggregates; caches such as <code>functools.lru_cache</code>, which is why cached arguments must be hashable; and interview patterns like two-sum and group-anagrams (<a class="xref" data-note="dsa_hashing">DSA: Hashing</a>).</div></details>
</main>
`
});
