// notes/python/py_dicts_sets.js — Dicts & Sets
Object.assign(TOPIC_CONTENT, {
  "py_dicts_sets": `<main>
<h1>Dicts &amp; Sets</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Dicts &amp; Sets</span></div>
  <p class="lead">A great deal of programming is looking things up: the price of an item, the record for a user id, the setting for a config key, or simply "have I seen this before?". A <strong>dictionary</strong> (dict) stores values under keys so you can look them up by key, and a <strong>set</strong> stores unique items so you can ask whether something is present. Their superpower is that a lookup takes about the same time whether they hold ten items or ten million, while searching a list gets slower with every item added; using a list where a dict or set belongs is the single most common performance bug in data scripts and interview answers. Both are built on the same idea, the hash table, and once you understand it, every rule about dicts and sets (why keys must be unchangeable, why order is kept, why <code>{}</code> is not an empty set) stops being a fact to memorise and becomes obvious. We continue the chai stall from <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>: a menu of four items with prices, and the same six morning orders of (customer, item, quantity).</p>

  <h2 id="pds-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dicts &amp; Sets</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Hash tables</div>
        <ul>
          <li><code>hash(key)</code> picks a slot: lookup without searching</li>
          <li>Collisions are normal; Python probes other slots</li>
          <li>Kept under 2/3 full → O(1) on average</li>
          <li>Keys must be hashable (cannot change)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dicts</div>
        <ul>
          <li>key → value; keys unique; insertion order kept</li>
          <li><code>d[k]</code> raises KeyError; <code>get</code> gives a default</li>
          <li><code>setdefault</code>, <code>Counter</code>, <code>defaultdict</code> for missing keys</li>
          <li><code>keys()</code>, <code>items()</code> are live views</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sets</div>
        <ul>
          <li>Unique items, no order, O(1) <code>in</code></li>
          <li><code>|</code> union, <code>&amp;</code> both, <code>-</code> only left, <code>^</code> one side</li>
          <li><code>{}</code> is a dict; empty set is <code>set()</code></li>
          <li><code>frozenset</code>: hashable, can be a key</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li><code>in</code> on a list inside a loop → O(n²)</li>
          <li>Changing a dict's size while looping → RuntimeError</li>
          <li><code>1</code>, <code>1.0</code>, <code>True</code> are the same key</li>
          <li><code>hash()</code> of strings changes between runs</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pds-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Dicts Exist</span><span class="rm-sub">looking things up in a list is slow</span></div></div>
      <div class="rm-item rm-done" data-target="pds-hash"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hash Tables</span><span class="rm-sub">turning a key straight into a storage slot</span></div></div>
      <div class="rm-item rm-done" data-target="pds-o1"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Constant-Time Lookup and Hashable Keys</span><span class="rm-sub">why size doesn't matter, and why keys can't change</span></div></div>
      <div class="rm-item rm-done" data-target="pds-crud"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Working with a Dict</span><span class="rm-sub">create, read, update, delete, merge</span></div></div>
      <div class="rm-item rm-done" data-target="pds-get"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Missing Keys: get and setdefault</span><span class="rm-sub">totals and groups without KeyError</span></div></div>
      <div class="rm-item rm-done" data-target="pds-iter"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Looping over a Dict</span><span class="rm-sub">order, views, and changing while looping</span></div></div>
      <div class="rm-item rm-done" data-target="pds-comp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Dict Comprehensions</span><span class="rm-sub">building a dict in one line</span></div></div>
      <div class="rm-item rm-done" data-target="pds-coll"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Counter and defaultdict</span><span class="rm-sub">dicts that know how to count and group</span></div></div>
      <div class="rm-item rm-done" data-target="pds-set"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Sets</span><span class="rm-sub">unique items and set algebra</span></div></div>
      <div class="rm-item rm-done" data-target="pds-speed"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Membership: List vs Set</span><span class="rm-sub">the speed difference, measured</span></div></div>
      <div class="rm-item rm-done" data-target="pds-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">equal keys, unstable hashes, empty sets</span></div></div>
      <div class="rm-item rm-done" data-target="pds-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, operations, costs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pds-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on dicts and sets</span></div></div>
    </div>
  </div>

  <h2 id="pds-need"><span class="num">01</span>Why Dicts Exist</h2>
  <p>Many lookups are by name, not by position. When Asha orders a masala chai, the stall needs "the price of masala chai", not "the price at position 0". With only lists to work with, the natural way to store the menu is a list of (item, price) pairs, and finding a price means walking along the list until the name matches. Let us count how many pairs we have to look at:</p>
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
  <p>Masala chai is first on the list, so it is found in 1 step. Bun maska is last, so it takes 4. Vada pav is not on the menu at all, and the only way to be sure of that is to check all 4 pairs. This way of searching, comparing the target with each item in turn, is called <strong>linear search</strong>, and its cost grows in step with the number of items: O(n) in Big-O notation. Four items is nothing, but a real system might have a million customer ids, and it looks one up for every order, all day long. That is n orders times m lookups' worth of comparisons.</p>
  <p>Think of finding a phone number in a notebook where names were written down in the order you met people. You have to read from the top every time. What you actually want is a contacts app: type the name, get the number, no reading through everyone else. A <strong>dictionary</strong> is Python's contacts app. It stores <strong>key–value pairs</strong> (here, item → price) and finds the value for a key directly, without walking through the other keys. The next section shows how that is possible.</p>

  <h2 id="pds-hash"><span class="num">02</span>Hash Tables</h2>
  <p>A dict is built on a structure called a <strong>hash table</strong>, which turns a key into a storage position so that finding a value by name is as fast as reading a list by index. The idea is simple. The table is an array of numbered <strong>slots</strong>, say 8 of them. To store a key, Python computes a number from the key, called its <strong>hash</strong>, and takes the remainder after dividing by the number of slots: <code>hash(key) % 8</code> is always a number from 0 to 7. The key and its value go into that slot. To look the key up later, Python computes the same number, goes straight to that slot, and checks that the key there is the one it wants. Think of a railway cloakroom: you hand in a bag, you get a token, and the token's number says which shelf the bag is on. When you come back, the attendant walks straight to that shelf. Nobody searches every shelf.</p>
  <p>Python's real hash function is a scrambling formula that is impossible to follow by hand, so to see the mechanism we will use a toy hash with the same shape: add up the character codes of the name. Every character has a code number, which <code>ord()</code> returns. For "samosa" that is s 115 + a 97 + m 109 + o 111 + s 115 + a 97 = 644, and 644 % 8 = 4, because 644 = 80 × 8 + 4.</p>
  <div class="fx" data-lang="py">def toy_hash(key):
    return sum(ord(ch) for ch in key)          # add up the character codes

for item in ["masala chai", "ginger chai", "samosa", "bun maska"]:
    h = toy_hash(item)
    print(f"{item:12} codes add up to {h:5}  -&gt; slot {h} % 8 = {h % 8}")</div>
  <div class="fx" data-lang="text">masala chai  codes add up to  1060  -&gt; slot 1060 % 8 = 4
ginger chai  codes add up to  1073  -&gt; slot 1073 % 8 = 1
samosa       codes add up to   644  -&gt; slot 644 % 8 = 4
bun maska    codes add up to   882  -&gt; slot 882 % 8 = 2</div>
  <p>Ginger chai goes to slot 1 and bun maska to slot 2. But "masala chai" and "samosa" both land on slot 4. This is called a <strong>collision</strong>: two different keys mapped to the same slot. Collisions are not a mistake; with only 8 slots and endless possible names they are unavoidable, so every hash table needs a rule for handling them. Our toy rule is: if the slot is already taken by a different key, try the next slot, and the next, until a free one turns up. This is called <strong>linear probing</strong>. CPython jumps around in a cleverer pseudo-random sequence instead of stepping to the next slot, but the idea is the same: keep looking in a predictable order. Let us build a tiny hash table that follows this rule and prints which slots it tries.</p>
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
    print(i, s)
menu_t.get("bun maska")
menu_t.get("samosa")
menu_t.get("vada pav")</div>
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
7 None
get 'bun maska'    slots tried [2] -&gt; 30
get 'samosa'       slots tried [4, 5] -&gt; 15
get 'vada pav'     slots tried [3] -&gt; not there</div>
  <p>You do not need to understand every line of the class (classes are covered in <a class="xref" data-note="py_oop">OOP Concepts</a>); watch the "slots tried" lists. Masala chai went straight into slot 4. Ginger chai and bun maska went straight into slots 1 and 2. Samosa tried slot 4, found masala chai there, moved on to slot 5, and settled there. The printed table shows the result, and notice that half the slots are empty: a hash table always keeps spare room, for reasons we will see shortly.</p>
  <p>The three lookups at the end are the payoff. Bun maska hashes to slot 2, the key there matches, done in one step. Samosa hashes to slot 4, finds the wrong key, follows the same probing rule to slot 5, and finds it in two steps. Vada pav hashes to slot 3, which is empty, and that settles it: if vada pav had ever been stored, it would be in slot 3 or further along its probe path, so it is "not there" after a single step, without looking at any of the other keys. Compare that with the four steps the linear search needed.</p>
  <p>Python's real <code>hash()</code> works the same way in principle, but has a few properties worth seeing:</p>
  <div class="fx" data-lang="py">print(hash(101), hash(-7), hash(2**61 + 5))     # small ints hash to themselves
print(hash(1) == hash(1.0) == hash(True))      # equal values, equal hashes
import subprocess, sys
for run in (1, 2):                              # string hashes are salted per process
    r = subprocess.run([sys.executable, "-c", "print(hash('samosa'))"], capture_output=True, text=True)
    print(f"process {run}: hash('samosa') = {r.stdout.strip()}")</div>
  <div class="fx" data-lang="text">101 -7 6
True
process 1: hash('samosa') = 5813665186237774464
process 2: hash('samosa') = -1945698384750872785</div>
  <p>Small integers hash to themselves, so 101 hashes to 101 (very large integers are reduced to fit, which is why 2<sup>61</sup> + 5 hashes to 6). Numbers that are equal hash equally even across types: 1, 1.0 and <code>True</code> all hash to 1, which matters later. The last two lines start two separate Python processes and ask each for the hash of "samosa", and the numbers differ. String hashes are <strong>salted</strong>: each new Python process picks a random secret and mixes it into every string hash. This stops attackers from deliberately sending thousands of keys that all collide and slow a server down. Within one running program a string's hash never changes, which is all a dict needs.</p>
  <p>Finally, a real dict. It keeps spare room just as our toy did, and grows its table as it fills up:</p>
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
  <p>The dict finds samosa's price, 15, by hashing. When its table becomes about two-thirds full, Python moves everything to a bigger table; here that happens as the 6th and 11th keys arrive. Keeping the table well under full means probe paths stay short, which is why collisions rarely cost more than a step or two. One more design detail explains a guarantee you will rely on: inside CPython, the slot array holds only small index numbers, which point into a separate, compact list of (hash, key, value) entries stored in the order they were added. Because of that second list, <code>list(menu)</code> gives the keys back in the order you inserted them. Dicts have guaranteed insertion order since Python 3.7.</p>
  <p>Do not be tempted to write your own hash function based on the toy one. Adding up character codes is a poor hash: "listen" and "silent" contain the same letters, so they always collide. Real hash functions scramble every bit of the input. Use <code>hash()</code> within a program, and <code>hashlib</code> when you need a number that is the same on every run (see Common Mistakes).</p>

  <h2 id="pds-o1"><span class="num">03</span>Constant-Time Lookup and Hashable Keys</h2>
  <p>Two facts that every interviewer asks about, "dict lookup is O(1)" and "a list cannot be a dict key", are both direct consequences of the design we just built. Take the speed first. A lookup does three things: it computes the key's hash (the work depends on the key's length, not on how many keys the dict holds), it jumps to one slot (a single array index), and it compares a few keys along the probe path. Because the table is kept less than two-thirds full and a good hash spreads keys evenly, the expected number of slots checked is a small constant whether the dict holds 10 keys or 10 million. That is what <strong>O(1) on average</strong> means. Let us check it:</p>
  <div class="fx" data-lang="py">import timeit
small = {i: i for i in range(10)}
big = {i: i for i in range(1_000_000)}
t_small = timeit.timeit(lambda: small[7], number=1_000_000)
t_big = timeit.timeit(lambda: big[777_777], number=1_000_000)
print(f"10 keys:        {t_small * 1000:.0f} ns per lookup")
print(f"1,000,000 keys: {t_big * 1000:.0f} ns per lookup")</div>
  <div class="fx" data-lang="text">10 keys:        26 ns per lookup
1,000,000 keys: 33 ns per lookup</div>
  <p>The big dict has a hundred thousand times more keys, yet each lookup takes roughly the same few tens of nanoseconds (approximate; the small difference comes from memory caching, not from searching). A list would take a hundred thousand times longer. The words "on average" matter, though. If every key happened to land on the same slot, each lookup would have to walk past all of them, just like a list, giving a worst case of O(n). With a good hash function this practically never happens, which is why the salting above exists: it stops anyone from forcing it on purpose.</p>
  <p>Now the second fact. A key's slot is chosen from its hash at the moment it is stored. If the key could change afterwards, its hash would change too, and a later lookup would compute a different slot and look on the wrong shelf. To prevent that, Python only allows <strong>hashable</strong> objects as keys: objects whose hash never changes during their lifetime, and where equal objects have equal hashes. Immutable built-in types such as numbers, strings and tuples of immutable values are hashable. Mutable built-ins such as lists, dicts and sets simply have no hash. To see why this rule exists, we can deliberately break it by building a key type whose hash depends on a list that can change. Read the class as "a table at the stall whose hash is computed from who sits there":</p>
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
t1.people.append("Esha")         # the key changes AFTER it was stored
print(t1 in bill)                # now looked for in a different slot
print(len(bill), list(bill.values()))   # yet the entry is still inside</div>
  <div class="fx" data-lang="text">85
False
1 [85]</div>
  <p>The table with Asha and Ben is stored with a bill of 85 and found without trouble. Then Esha sits down, so the key object changes and its hash changes with it. Now <code>t1 in bill</code> says <code>False</code>, even though <code>len(bill)</code> is still 1 and the 85 is still inside. The entry has become unreachable: it sits in the slot chosen by the <em>old</em> hash, and every lookup now goes to the slot chosen by the new one. It is as if your cloakroom token were written in pencil and someone rubbed out the 4 and wrote 7: the attendant walks to shelf 7, and your bag sits on shelf 4 forever. This is exactly the disaster Python prevents by refusing to hash lists. Note that the rule applies only to keys; dict <em>values</em> can be anything, including lists.</p>
  <p>The rule is "equal objects must have equal hashes", not the reverse. Two different keys may share a hash (that is just a collision), and the dict always confirms a match with <code>==</code>. If you define <code>__eq__</code> on your own class, Python turns off its default hash, and you should define a matching <code>__hash__</code> based only on fields that never change.</p>

  <h2 id="pds-crud"><span class="num">04</span>Working with a Dict</h2>
  <p>Now that we know how a dict works, using one is straightforward. A <strong>dict</strong> stores pairs of <strong>key → value</strong>, written <code>{key: value, ...}</code>. Keys are unique and must be hashable; values can be anything and can repeat. Think of the menu board on the stall's wall: each line says "item — price". You can add a line, change a price or rub a line out; two lines cannot have the same item name, but two items can cost the same. The basic operations are creating a dict, reading from it, updating it and deleting from it, often abbreviated CRUD.</p>
  <div class="fx" data-lang="py">menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15}          # Create: literal
print(dict(zip(["samosa", "bun maska"], [15, 30])))               # Create: from two lists
print(dict.fromkeys(["Asha", "Ben"], 0))                          # Create: same start value
print(menu["samosa"], "samosa" in menu, "vada pav" in menu, len(menu))   # Read
try:
    menu["vada pav"]
except KeyError as e:
    print("KeyError:", e)
menu["bun maska"] = 30           # new key -&gt; added at the end
menu["samosa"] = 18              # existing key -&gt; value replaced, position kept
print(menu)
del menu["ginger chai"]          # Delete by key (KeyError if missing)
price = menu.pop("samosa")       # remove AND return the value
print(price, menu)
print(menu.pop("vada pav", None))   # pop with a default: no error
print(menu.popitem(), menu)         # remove the LAST inserted pair</div>
  <div class="fx" data-lang="text">{'samosa': 15, 'bun maska': 30}
{'Asha': 0, 'Ben': 0}
15 True False 3
KeyError: 'vada pav'
{'masala chai': 20, 'ginger chai': 25, 'samosa': 18, 'bun maska': 30}
18 {'masala chai': 20, 'bun maska': 30}
None
('bun maska', 30) {'masala chai': 20}</div>
  <p>Read the output from the top. Besides writing a literal, you can build a dict from two parallel lists with <code>dict(zip(keys, values))</code>, or give every key the same starting value with <code>dict.fromkeys</code>. Reading uses square brackets: <code>menu["samosa"]</code> is 15. The <code>in</code> operator checks whether a key exists, and asking for a key that does not exist raises <code>KeyError</code>. Assignment does double duty: <code>menu["bun maska"] = 30</code> adds a new key at the end, while <code>menu["samosa"] = 18</code> replaces the value of an existing key and keeps its position. For deleting, <code>del</code> removes a key, <code>pop</code> removes it and hands back its value (18), <code>pop</code> with a default returns the default instead of raising, and <code>popitem</code> removes the most recently added pair. All of these single-key operations are O(1) on average, thanks to hashing.</p>
  <p>One thing to remember about <code>in</code>: on a dict it checks <em>keys</em> only. <code>20 in menu</code> is <code>False</code> even if some item costs 20. To search the values you would write <code>20 in menu.values()</code>, which has to scan every value, O(n), because values are not hashed.</p>
  <p>A common need is to combine two dicts, for example the regular menu and today's specials. The <code>|</code> operator builds a new merged dict, and <code>update</code> merges into an existing one:</p>
  <div class="fx" data-lang="py">menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
specials = {"samosa": 12, "vada pav": 18}
print(menu | specials)           # new dict; right side wins on clashes
print(menu["samosa"])            # menu unchanged
menu.update(specials)            # in place (same as menu |= specials)
print(menu)</div>
  <div class="fx" data-lang="text">{'masala chai': 20, 'ginger chai': 25, 'samosa': 12, 'bun maska': 30, 'vada pav': 18}
15
{'masala chai': 20, 'ginger chai': 25, 'samosa': 12, 'bun maska': 30, 'vada pav': 18}</div>
  <p><code>menu | specials</code> produced a new dict. Where both have the same key (samosa), the value from the right-hand dict wins, so samosa is 12; keys that are new (vada pav) are added at the end. The original <code>menu</code> was untouched until <code>update</code>, which merged the specials into it in place; <code>menu |= specials</code> does the same thing.</p>

  <h2 id="pds-get"><span class="num">05</span>Missing Keys: get and setdefault</h2>
  <p>The most common dict job in real code is accumulating: adding up each customer's bill, or collecting each customer's items. The difficulty is the first time you meet a customer. Their key does not exist yet, so <code>totals[name] += amount</code> raises <code>KeyError</code>. You could write <code>if name in totals: ... else: ...</code> every time, but Python offers two methods that handle the missing case in one call.</p>
  <p>The first is <code>d.get(key, default)</code>, which returns the value if the key exists and the default otherwise, without ever adding the key. Think of asking "what is Asha's tab? If she has none, call it zero": nothing gets written down. Here each order adds quantity × price to the customer's running total, starting from 0:</p>
  <div class="fx" data-lang="py">totals = {}
for name, item, qty in orders:
    totals[name] = totals.get(name, 0) + qty * menu[item]   # 0 the first time we see a name
    print(f"{name:4} +{qty * menu[item]:3} -&gt; {totals}")
print(menu.get("vada pav"), menu.get("vada pav", "not on menu"))</div>
  <div class="fx" data-lang="text">Asha + 40 -&gt; {'Asha': 40}
Ben  + 45 -&gt; {'Asha': 40, 'Ben': 45}
Asha + 25 -&gt; {'Asha': 65, 'Ben': 45}
Chen + 20 -&gt; {'Asha': 65, 'Ben': 45, 'Chen': 20}
Dia  + 60 -&gt; {'Asha': 65, 'Ben': 45, 'Chen': 20, 'Dia': 60}
Ben  + 40 -&gt; {'Asha': 65, 'Ben': 85, 'Chen': 20, 'Dia': 60}
None not on menu</div>
  <p>Follow the first few lines. Asha's first order is 2 × 20 = 40; <code>get</code> finds no "Asha", returns 0, and her total becomes 40. Ben's samosas are 3 × 15 = 45, again starting from 0. Asha's ginger chai is 1 × 25 = 25; this time <code>get</code> finds her existing 40, so her total becomes 65. By the end the totals are Asha 65, Ben 85, Chen 20 and Dia 60. The last line shows <code>get</code> on its own: a missing key gives <code>None</code>, or whatever default you pass.</p>
  <p>The second method is <code>d.setdefault(key, default)</code>. If the key exists it returns its value; if not, it first <em>stores</em> the default under that key and then returns it. This is made for grouping, where the value is a list you want to append to. It is like saying "give me Asha's page in the ledger, and if she has no page yet, open a blank one for her first":</p>
  <div class="fx" data-lang="py">by_customer = {}
for name, item, qty in orders:
    by_customer.setdefault(name, []).append(item)   # create [] once, then append
print(by_customer)</div>
  <div class="fx" data-lang="text">{'Asha': ['masala chai', 'ginger chai'], 'Ben': ['samosa', 'masala chai'], 'Chen': ['masala chai'], 'Dia': ['bun maska']}</div>
  <p>The first time Asha appears, <code>setdefault</code> creates an empty list under "Asha", returns it, and masala chai is appended to it. The second time, it finds that same list and returns it, so ginger chai is appended next to it. One small inefficiency: the <code>[]</code> argument is built on every call, even when the key exists and the new list is thrown away. That is harmless for small data, and the <code>defaultdict</code> in section 08 avoids it.</p>

  <h2 id="pds-iter"><span class="num">06</span>Looping over a Dict</h2>
  <p>Once the totals are built we want to go through them: print each bill, add them up, find the biggest. Looping over a dict directly gives you its keys, in the order they were first inserted. That order comes from the compact entries list described in the Hash Tables section, not from the slots, which is why it is predictable. For values or pairs, use the <code>values()</code> and <code>items()</code> methods.</p>
  <div class="fx" data-lang="py">totals = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
for name in totals:                      # looping over a dict gives its KEYS
    print(name, end=" ")
print()
print(list(totals.values()), sum(totals.values()))
for name, rupees in totals.items():      # (key, value) pairs, unpacked
    print(f"{name}: Rs {rupees}")
print(sorted(totals.items(), key=lambda kv: kv[1], reverse=True))   # by value
print(max(totals, key=totals.get))       # the key with the largest value</div>
  <div class="fx" data-lang="text">Asha Ben Chen Dia 
[65, 85, 20, 60] 230
Asha: Rs 65
Ben: Rs 85
Chen: Rs 20
Dia: Rs 60
[('Ben', 85), ('Asha', 65), ('Dia', 60), ('Chen', 20)]
Ben</div>
  <p>The plain loop printed the four names in insertion order. <code>values()</code> gave the four totals, which add up to 230. <code>items()</code> gave (key, value) pairs, which we unpacked straight into <code>name, rupees</code> in the loop header. A dict itself has no notion of being sorted by value, but <code>sorted(totals.items(), key=...)</code> produces a list of pairs ordered however you like, here by amount, largest first. The last line is a neat idiom: <code>max</code> loops over the keys and compares them using <code>totals.get</code>, i.e. by their values, so it returns the customer with the biggest bill, Ben.</p>
  <p><code>keys()</code>, <code>values()</code> and <code>items()</code> do not return copies. They return <strong>views</strong>: live windows onto the dict that always show its current contents. Key views even support set operations.</p>
  <div class="fx" data-lang="py">totals = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
keys = totals.keys()
print(keys)
totals["Esha"] = 30                      # views are live windows, not copies
print(keys, len(keys))
print(totals.keys() &amp; {"Asha", "Zoya"})  # key views support set operations</div>
  <div class="fx" data-lang="text">dict_keys(['Asha', 'Ben', 'Chen', 'Dia'])
dict_keys(['Asha', 'Ben', 'Chen', 'Dia', 'Esha']) 5
{'Asha'}</div>
  <p>We captured <code>keys</code> before adding Esha, yet printing it afterwards shows five keys: it is a window, not a snapshot. And <code>&amp;</code> between a key view and a set gives the keys they have in common, here just Asha (set operations are explained in section 09).</p>
  <p>Because a loop over a dict walks its entries directly, adding or removing keys during the loop is not allowed. Changing the value of an existing key is fine, but changing the dict's size raises an error:</p>
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
print(totals)</div>
  <div class="fx" data-lang="text">RuntimeError: dictionary changed size during iteration
{'Asha': 65, 'Ben': 85, 'Dia': 60}</div>
  <p>Deleting Chen in the middle of the loop raised <code>RuntimeError: dictionary changed size during iteration</code>, because the loop was walking a structure that was being rearranged under it. It is like reading names off a queue while people join and leave it: you lose your place. The fix is to photograph the queue first: <code>list(totals)</code> makes a separate list of the keys, the loop walks that list, and deleting from the dict is then safe. The other fix, often cleaner, is to build a new dict containing only what you want to keep, which is exactly what the next section's comprehensions do.</p>

  <h2 id="pds-comp"><span class="num">07</span>Dict Comprehensions</h2>
  <p>In <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> we built new lists in one line with list comprehensions. A <strong>dict comprehension</strong> is the same idea for dicts: curly brackets instead of square ones, and a <code>key: value</code> pair at the front instead of a single expression. It replaces the pattern "make an empty dict, loop, maybe test, assign <code>out[key] = value</code>". Think of writing a new menu board from the old one in a single instruction: "for every item on the board, write the item and its price plus 5%".</p>
  <div class="fx" data-lang="py">menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
print({item: round(price * 1.05) for item, price in menu.items()})          # +5% tax
print({item: price for item, price in menu.items() if "chai" in item})       # filter
print({price: item for item, price in menu.items()})                          # invert
totals = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
print({n: r for n, r in totals.items() if r &gt;= 50})                           # keep big bills</div>
  <div class="fx" data-lang="text">{'masala chai': 21, 'ginger chai': 26, 'samosa': 16, 'bun maska': 32}
{'masala chai': 20, 'ginger chai': 25}
{20: 'masala chai', 25: 'ginger chai', 15: 'samosa', 30: 'bun maska'}
{'Asha': 65, 'Ben': 85, 'Dia': 60}</div>
  <p>The first comprehension transforms every value: 20 × 1.05 is 21, 25 × 1.05 = 26.25 rounds to 26, and so on. The second has an <code>if</code> at the end, which filters, keeping only the two chai items. The third swaps keys and values to make a price → item lookup; that is safe here only because all the prices differ, since if two items had the same price, the later one would overwrite the earlier one under that key. The last line is the clean answer to the previous section's problem: instead of deleting small bills while looping, build a new dict that keeps only the bills of 50 or more.</p>
  <p>Take care with curly brackets: <code>{x: 1 for x in xs}</code> (with a colon) is a dict comprehension, <code>{x for x in xs}</code> (no colon) is a set comprehension, and <code>{}</code> with nothing inside is an empty dict, not an empty set.</p>

  <h2 id="pds-coll"><span class="num">08</span>Counter and defaultdict</h2>
  <p>Counting things and grouping things are the two jobs dicts do most often, and we have done both with <code>get</code> and <code>setdefault</code>. The standard library's <code>collections</code> module provides two dict types that remove even that small amount of boilerplate, because they know what a missing key should start as.</p>
  <p><code>collections.Counter</code> is a dict built for counting: a missing key reads as 0, so you can write <code>sold[item] += qty</code> without checking anything first, and it comes with extra counting tools. Think of a tally sheet on which every possible item already has a 0 written next to it.</p>
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
  <p>Check the counts by hand against the orders: masala chai 2 + 1 + 2 = 5, samosa 3, bun maska 2, ginger chai 1. <code>most_common(2)</code> returns the top two items with their counts. Reading a missing key such as vada pav gives 0 without adding it, so the length stays 4. Passing a sequence straight to <code>Counter</code> counts its items, here how many times each customer ordered. Counters can also be added and subtracted: compared with yesterday, today sold 2 more masala chai, while samosa (3 − 4) and vada pav went negative, and subtraction drops anything that is not positive.</p>
  <p><code>collections.defaultdict</code> generalises the idea. You give it a function, called a factory, and whenever a missing key is used, it calls that function to create the starting value: <code>defaultdict(list)</code> creates an empty list, <code>defaultdict(int)</code> creates 0 (because <code>int()</code> returns 0), <code>defaultdict(set)</code> an empty set. Think of a filing cabinet that grows a fresh empty folder the moment you ask for a name it has not seen.</p>
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
  <p>We get the same groups and the same totals as with <code>setdefault</code> and <code>get</code> (Asha 65, Ben 85, Chen 20, Dia 60, total 230), but the loop body is now as plain as it can be. The last line shows the price of that convenience: merely <em>reading</em> <code>items_by_customer["Zoya"]</code> created a "Zoya" entry with an empty list. With a defaultdict, use <code>in</code> or <code>get</code> to check whether a key exists, never square brackets, and convert it with <code>dict(d)</code> before handing it to code that expects missing keys to raise <code>KeyError</code>.</p>

  <h2 id="pds-set"><span class="num">09</span>Sets</h2>
  <p>Sometimes there is no value to store at all; the only question is whether something is present. Which customers came today? Have we already processed this id? For that, Python has the <strong>set</strong>: a collection of unique items with no order, built as a hash table that stores keys without values. Because it is a hash table, checking <code>x in s</code> is O(1) on average, and adding an item that is already there has no effect, so a set removes duplicates automatically. Like dict keys, set items must be hashable. Think of a guest register in which each name is written once however many times the person visits, kept by a doorman who can tell you instantly whether a name is in it.</p>
  <div class="fx" data-lang="py">names = [name for name, item, qty in orders]
customers = set(names)
print(names)
print(sorted(customers), len(customers))
print("Esha" in customers)
customers.add("Esha")            # add: no effect if already there
customers.add("Asha")
customers.discard("Zoya")        # discard: no error if missing
customers.remove("Esha")         # remove: KeyError if missing
print(sorted(customers))
print(sorted({item for name, item, qty in orders if "chai" in item}))   # set comprehension</div>
  <div class="fx" data-lang="text">['Asha', 'Ben', 'Asha', 'Chen', 'Dia', 'Ben']
['Asha', 'Ben', 'Chen', 'Dia'] 4
False
['Asha', 'Ben', 'Chen', 'Dia']
['ginger chai', 'masala chai']</div>
  <p>Six names from the orders become 4 distinct customers. We print sets through <code>sorted()</code> because a set has no order: its printed order depends on the items' hashes, and for strings that changes from run to run, so never rely on it. <code>add</code> ignores an item that is already present, <code>discard</code> quietly ignores one that is missing, and <code>remove</code> raises <code>KeyError</code> for a missing item, which is useful when its absence would be a bug. A set comprehension, curly brackets with no colon, collects the distinct chai items.</p>
  <p>Sets really shine when comparing two groups. Questions like "who came on both days?", "who is new today?" or "who came on only one day?" are answered by <strong>set operations</strong>, which come straight from school mathematics. Take today's customers {Asha, Ben, Chen, Dia} and yesterday's {Ben, Dia, Esha}:</p>
  <figure class="viz"><svg viewBox="0 0 440 200" width="440">
    <circle cx="160" cy="100" r="80" class="fb sb" fill-opacity="0.35"/>
    <circle cx="270" cy="100" r="80" class="fg sg" fill-opacity="0.35"/>
    <text x="110" y="24" class="tb">today</text><text x="290" y="24" class="tg">yesterday</text>
    <text x="100" y="95">Asha</text><text x="100" y="115">Chen</text>
    <text x="198" y="95">Ben</text><text x="200" y="115">Dia</text>
    <text x="295" y="105">Esha</text>
    <text x="70" y="196" class="tm">today − yesterday</text><text x="185" y="196" class="tm">both (&amp;)</text><text x="280" y="196" class="tm">yesterday − today</text>
  </svg><figcaption>Today {Asha, Ben, Chen, Dia} and yesterday {Ben, Dia, Esha}. The overlap is &amp;; everything is |; one side only is −; the two outer parts together are ^.</figcaption></figure>
  <p>The left circle is today and the right circle is yesterday. Ben and Dia sit in the overlap because they came on both days; Asha and Chen are only in today's circle, and Esha only in yesterday's. Every set operation picks out some region of this picture, as the code shows:</p>
  <div class="fx" data-lang="py">today = {"Asha", "Ben", "Chen", "Dia"}
yesterday = {"Ben", "Dia", "Esha"}
print("both days    (&amp;):", sorted(today &amp; yesterday))
print("either day   (|):", sorted(today | yesterday))
print("new today    (-):", sorted(today - yesterday))
print("lapsed       (-):", sorted(yesterday - today))
print("one day only (^):", sorted(today ^ yesterday))
print({"Ben", "Dia"} &lt;= today, today.isdisjoint({"Zoya"}))</div>
  <div class="fx" data-lang="text">both days    (&amp;): ['Ben', 'Dia']
either day   (|): ['Asha', 'Ben', 'Chen', 'Dia', 'Esha']
new today    (-): ['Asha', 'Chen']
lapsed       (-): ['Esha']
one day only (^): ['Asha', 'Chen', 'Esha']
True True</div>
  <p><strong>Intersection</strong>, <code>&amp;</code>, is the overlap: the regulars Ben and Dia. <strong>Union</strong>, <code>|</code>, is everything in either circle: all five people who came at all. <strong>Difference</strong>, <code>-</code>, is what is in the left set but not the right, so <code>today - yesterday</code> gives the newcomers Asha and Chen, while <code>yesterday - today</code> gives Esha, who did not come back. <strong>Symmetric difference</strong>, <code>^</code>, is the two outer regions together: people who came on exactly one day. The last line shows two tests: <code>&lt;=</code> asks whether every item on the left is also on the right (a <strong>subset</strong>), and <code>isdisjoint</code> asks whether two sets have nothing in common. Each operator also has a method name (<code>union</code>, <code>intersection</code>, <code>difference</code>, <code>symmetric_difference</code>, <code>issubset</code>) that accepts any iterable, not just a set.</p>
  <p>A few more set facts complete the picture:</p>
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
  <p>The first line is a classic trap: <code>{}</code> is an empty <em>dict</em>, because dicts were in Python first; the empty set must be written <code>set()</code>, while <code>{"Asha"}</code> with something inside is a set. The second line removes duplicates while keeping the original order, which <code>set()</code> cannot do since sets have no order; it works because dict keys are unique and dicts remember insertion order. Third, a set is mutable, so it is not hashable and cannot be a dict key or sit inside another set. Its immutable twin, <code>frozenset</code>, is hashable, which makes it the right key for "a group of people at a table" where the order of names does not matter: <code>frozenset({"Ben", "Asha"})</code> finds the entry stored under <code>frozenset({"Asha", "Ben"})</code>. Finally, a list cannot be a set item, for the same reason it cannot be a dict key. Also beware that <code>set("chai")</code> gives the four letters c, h, a, i, because a string is a sequence of characters; a one-item set is <code>{"chai"}</code>.</p>

  <h2 id="pds-speed"><span class="num">10</span>Membership: List vs Set</h2>
  <p>"O(1) versus O(n)" sounds abstract, and on small data the difference is invisible. It becomes very concrete at the sizes real programs handle. Let us ask whether an id is present in 100,000 ids, stored once as a list and once as a set:</p>
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
  <div class="fx" data-lang="text">list:     714.8 us per lookup
set:      0.046 us per lookup
set is about 15,556x faster</div>
  <p>The list has to compare the target with up to 100,000 items one by one (we asked for the last one, its worst case), while the set hashes the id and checks one slot. The set is thousands of times faster. The exact numbers depend on the machine and are approximate, but the shape never changes: the list's time grows with its length, and the set's does not.</p>
  <p>Where this really bites is a membership test inside a loop. A very common real bug looks like this: for each of today's 20,000 customers, check whether they are in a <em>list</em> of 10,000 regulars. That is 20,000 checks, each scanning up to 10,000 items, so up to 200 million comparisons, written O(n × m). Converting the regulars to a set once, which costs O(m), makes each check O(1):</p>
  <div class="fx" data-lang="py">import timeit
regulars = [f"cust{i}" for i in range(0, 20_000, 2)]     # 10,000 regulars
today_ids = [f"cust{i}" for i in range(20_000)]          # 20,000 customers today
def with_list():
    return [c for c in today_ids if c in regulars]      # a list scan inside a loop
def with_set():
    reg = set(regulars)                                 # build once: O(m)
    return [c for c in today_ids if c in reg]
print(with_list() == with_set(), len(with_set()))
print(f"list inside loop: {timeit.timeit(with_list, number=1):.2f} s")
print(f"set inside loop:  {timeit.timeit(with_set, number=1):.4f} s")</div>
  <div class="fx" data-lang="text">True 10000
list inside loop: 0.96 s
set inside loop:  0.0010 s</div>
  <p>Both versions find the same 10,000 regulars. The code differs by one line, yet the time drops from around a second to around a millisecond (approximate times). This is the single most common speed-up in interviews and in data scripts: whenever you see <code>if x in something</code> inside a loop, check what <code>something</code> is. One warning: the set must be built once, outside the loop. Writing <code>if c in set(regulars)</code> inside the loop rebuilds the set every time and is even slower than the list.</p>

  <h2 id="pds-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Most dict and set bugs come from forgetting one of the hashing rules. The least obvious one comes from the fact that numbers which are equal also hash equally, even across types. Since <code>1 == 1.0 == True</code>, a dict treats them as one and the same key:</p>
  <div class="fx" data-lang="py">print({1: "int", 1.0: "float", True: "bool"})
print(len({0, False, 0.0, "0"}))</div>
  <div class="fx" data-lang="text">{1: 'bool'}
2</div>
  <p>The dict ends up with a single entry. The first key object, the integer 1, stays as the key, and each later assignment overwrites the value, which ends as "bool". The same happens in a set: <code>{0, False, 0.0, "0"}</code> has only 2 items, because 0, <code>False</code> and 0.0 collapse into one, while the string "0" is a different value and stays separate. This rarely matters in practice, but it is a favourite "what does this print?" question.</p>
  <p>A second, more dangerous mistake is relying on <code>hash()</code> to be the same between runs. Because string hashes are salted per process, as shown in the Hash Tables section, using <code>hash(user_id) % 2</code> to split users into A/B test groups, to shard files or to make a train/test split will put the same user in a different group tomorrow. When you need a hash that is the same everywhere, use the <code>hashlib</code> module, which computes a fixed digest of bytes:</p>
  <div class="fx" data-lang="py">import hashlib
def bucket(user_id, n=2):
    digest = hashlib.md5(user_id.encode()).hexdigest()    # same on every run and machine
    return int(digest, 16) % n
for u in ["Asha", "Ben", "Chen", "Dia", "Esha", "Faiz"]:
    print(u, "-&gt; group", "AB"[bucket(u)], end="   ")</div>
  <div class="fx" data-lang="text">Asha -&gt; group A   Ben -&gt; group A   Chen -&gt; group A   Dia -&gt; group A   Esha -&gt; group B   Faiz -&gt; group B</div>
  <p>These group assignments will be identical every time the program runs, on any machine. A third mistake is the empty set: writing <code>s = {}</code> and then <code>s.add(x)</code> fails with "'dict' object has no attribute 'add'", because <code>{}</code> is a dict; write <code>set()</code>. Beyond these, the traps covered earlier are worth one more look: changing a dict's size while looping over it raises <code>RuntimeError</code> (loop over <code>list(d)</code> or build a new dict); lists, dicts and sets cannot be keys, and a custom key whose hash changes is silently lost; reading a missing key from a defaultdict creates it; set order is not reliable, so sort before printing; and a membership test on a list inside a loop turns linear code quadratic.</p>

  <h2 id="pds-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Hash table</b>: an array of slots; a key's slot is computed from <code>hash(key)</code>, so lookup needs no search.</li>
    <li><b>Collision</b>: two keys in one slot; CPython probes other slots (open addressing). Table kept under ~2/3 full.</li>
    <li><b>Hashable</b>: hash never changes, and <code>a == b</code> implies <code>hash(a) == hash(b)</code>. int, float, str, bytes, tuple of hashables, frozenset: yes. list, dict, set: no.</li>
    <li><b>Dict</b>: mutable mapping of unique hashable keys to any values; keeps insertion order (3.7+).</li>
    <li><b>Set</b>: mutable, unordered collection of unique hashable items. <b>frozenset</b>: immutable, hashable.</li>
    <li><b>View</b>: <code>keys()</code>, <code>values()</code>, <code>items()</code>; live, not copies.</li>
  </ul>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>dict / set</th><th>list</th></tr>
    <tr><td>lookup / <code>in</code></td><td>O(1) average, O(n) worst</td><td>O(n)</td></tr>
    <tr><td>insert / delete by key</td><td>O(1) average</td><td>O(n) (except at the end)</td></tr>
    <tr><td><code>x in d.values()</code></td><td>O(n)</td><td>—</td></tr>
    <tr><td>union / intersection</td><td>about O(len(a) + len(b))</td><td>—</td></tr>
  </table>
  <h3>Missing keys</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Missing key</th><th>Adds the key?</th></tr>
    <tr><td><code>d[k]</code></td><td>KeyError</td><td>no</td></tr>
    <tr><td><code>d.get(k, default)</code></td><td>returns default</td><td>no</td></tr>
    <tr><td><code>d.setdefault(k, default)</code></td><td>stores and returns default</td><td>yes</td></tr>
    <tr><td><code>Counter()[k]</code></td><td>returns 0</td><td>no</td></tr>
    <tr><td><code>defaultdict(f)[k]</code></td><td>stores and returns <code>f()</code></td><td>yes, even on a read</td></tr>
  </table>
  <h3>Set operations</h3>
  <table class="tbl">
    <tr><th>Operator</th><th>Method</th><th>Meaning</th></tr>
    <tr><td><code>a | b</code></td><td><code>union</code></td><td>in either</td></tr>
    <tr><td><code>a &amp; b</code></td><td><code>intersection</code></td><td>in both</td></tr>
    <tr><td><code>a - b</code></td><td><code>difference</code></td><td>in a, not in b</td></tr>
    <tr><td><code>a ^ b</code></td><td><code>symmetric_difference</code></td><td>in exactly one</td></tr>
    <tr><td><code>a &lt;= b</code></td><td><code>issubset</code></td><td>every item of a is in b</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">menu = {"chai": 20}; dict(zip(keys, vals)); dict.fromkeys(keys, 0)
menu["samosa"] = 15; del menu["chai"]; menu.pop("x", None); menu.popitem()
merged = a | b; a.update(b)                      # right side wins
totals[k] = totals.get(k, 0) + x; groups.setdefault(k, []).append(v)
for k, v in d.items(): ...; max(d, key=d.get)
{k: v for k, v in d.items() if v &gt; 0}; {x for x in xs}
Counter(xs).most_common(3); defaultdict(list); defaultdict(int)
s = set(); s.add(x); s.discard(x); s.remove(x); frozenset(xs)
list(dict.fromkeys(xs))                          # dedupe, keep order</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>{}</code> is an empty dict; the empty set is <code>set()</code>.</li>
    <li><code>k in d</code> checks keys only.</li>
    <li>Adding or deleting keys while looping over a dict → RuntimeError.</li>
    <li><code>1</code>, <code>1.0</code> and <code>True</code> are one key.</li>
    <li>Set order is not reliable; sort before printing.</li>
    <li><code>hash()</code> of str is salted per process; use <code>hashlib</code> for stable buckets.</li>
    <li>Reading a defaultdict inserts the key.</li>
    <li><code>set("chai")</code> is four letters.</li>
  </ul>

  <h2 id="pds-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a list, a dict and a set?</summary><div class="qa-body">A list is an ordered sequence accessed by position, allows duplicates, and searching it is O(n). A dict maps unique hashable keys to values, keeps insertion order, and looks up by key in O(1) on average. A set holds unique hashable items with no order and answers "is x present?" in O(1) on average. Use a list for ordered data, a dict for lookup by key, and a set for uniqueness and membership.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a Python dict achieve O(1) lookup?</summary><div class="qa-body">It is a hash table. Python computes <code>hash(key)</code>, uses it to pick a slot in an array, and checks the key stored there, probing a few other slots if there was a collision. The table is resized to stay less than about two-thirds full, so probe paths stay short, and the cost does not depend on how many keys the dict holds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the worst-case complexity of a dict lookup, and when does it happen?</summary><div class="qa-body">O(n), when many keys collide into the same probe sequence, so a lookup must step past all of them. With a good hash function this practically never happens. String hashes are salted per process partly to stop attackers from crafting colliding keys to force this worst case.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is a CPython dict laid out in memory, and why does it keep insertion order?</summary><div class="qa-body">It has two parts: a sparse array of small slot indexes, and a dense array of (hash, key, value) entries appended in insertion order. A lookup hashes into the sparse array, which points at an entry. Iteration simply walks the dense entries array, which is why dicts keep insertion order, guaranteed since Python 3.7. The layout also saves memory compared with storing full entries in every slot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must dict keys be hashable? Why can't a list be a key?</summary><div class="qa-body">The slot for a key is chosen from its hash when it is stored. If the key could change, its hash would change, and later lookups would go to a different slot, so the entry would be lost. Lists can change, so Python gives them no hash. Use a tuple (of hashable items) or a frozenset instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the <code>__hash__</code>/<code>__eq__</code> contract? What happens if you define only <code>__eq__</code>?</summary><div class="qa-body">Objects that compare equal must have equal hashes, and an object's hash must not change while it is in a dict or set. Different objects may share a hash; the dict confirms with <code>==</code>. If a class defines <code>__eq__</code> without <code>__hash__</code>, Python sets <code>__hash__</code> to <code>None</code>, so its objects become unhashable. Define <code>__hash__</code> from the same immutable fields that <code>__eq__</code> uses.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>print({1: "a", True: "b", 1.0: "c"})</code></summary><div class="qa-body"><code>{1: 'c'}</code>. <code>1</code>, <code>True</code> and <code>1.0</code> are equal and hash the same, so they are one key. The first key object inserted (1) is kept, and each later assignment replaces the value, ending with 'c'.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>d[k]</code> vs <code>d.get(k)</code> vs <code>d.setdefault(k, v)</code>?</summary><div class="qa-body"><code>d[k]</code> raises <code>KeyError</code> if the key is missing. <code>d.get(k, default)</code> returns the default (or <code>None</code>) and does not change the dict. <code>d.setdefault(k, v)</code> returns the existing value, or stores <code>v</code> under <code>k</code> and returns it, which makes it handy for grouping: <code>d.setdefault(k, []).append(x)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>defaultdict</code> or <code>Counter</code> instead of a plain dict?</summary><div class="qa-body">Use <code>Counter</code> for counting: missing keys read as 0, and it offers <code>most_common</code> and counter arithmetic. Use <code>defaultdict(list)</code> or <code>defaultdict(set)</code> for grouping and <code>defaultdict(int)</code> for sums, so you never write missing-key checks. Remember that reading a missing key from a defaultdict inserts it, so test with <code>in</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>OrderedDict</code> still useful now that dicts keep order?</summary><div class="qa-body">Occasionally. It has <code>move_to_end</code> and <code>popitem(last=False)</code>, which make it a natural basis for an LRU cache, and two OrderedDicts compare equal only if their order matches too, unlike plain dicts. For simply remembering insertion order, a plain dict is enough.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you merge two dicts? Which value wins on a clash?</summary><div class="qa-body"><code>a | b</code> (Python 3.9+) or <code>{**a, **b}</code> builds a new dict; <code>a.update(b)</code> or <code>a |= b</code> merges in place. In every form the right-hand side wins for keys that appear in both. These merges are shallow: nested dicts are not merged, just replaced.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you invert a dict when values are not unique?</summary><div class="qa-body"><code>{v: k for k, v in d.items()}</code> works only when values are unique, because later keys overwrite earlier ones. For non-unique values, group the keys: create a <code>defaultdict(list)</code> and, for each <code>k, v</code>, append <code>k</code> to <code>inv[v]</code>. The values must also be hashable to become keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You get <code>RuntimeError: dictionary changed size during iteration</code>. Why, and how do you fix it?</summary><div class="qa-body">You added or deleted keys while looping over the same dict, and the loop cannot keep its place in a structure that is changing under it. Loop over a copy of the keys, <code>for k in list(d):</code>, or build a new dict with a comprehension. Changing the values of existing keys during a loop is fine.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Remove duplicates from a list while preserving order.</summary><div class="qa-body"><code>list(dict.fromkeys(xs))</code>: dict keys are unique and keep insertion order, and it runs in O(n). <code>list(set(xs))</code> also removes duplicates but loses the order. For unhashable items, loop and keep a <code>seen</code> set of a hashable form of each item.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Solve two-sum: return the indices of two numbers that add up to a target.</summary><div class="qa-body">Walk the list once with a dict from value to index. For each number <code>x</code> at index <code>i</code>, check whether <code>target - x</code> is already in the dict; if so, return its index and <code>i</code>, otherwise store <code>x: i</code>. That is O(n) time and O(n) memory, instead of O(n²) for checking every pair.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the elements common to two large lists efficiently?</summary><div class="qa-body"><code>set(a) &amp; set(b)</code>, which is roughly O(len(a) + len(b)), or <code>set(a).intersection(b)</code>, which accepts any iterable. A nested loop or <code>[x for x in a if x in b]</code> with <code>b</code> as a list is O(n × m). If duplicates and counts matter, use <code>Counter(a) &amp; Counter(b)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>set vs frozenset? How do you write an empty set?</summary><div class="qa-body">A set is mutable and therefore unhashable; a frozenset is immutable and hashable, so it can be a dict key or an item in another set. The empty set is <code>set()</code>, because <code>{}</code> is an empty dict.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a set always faster than a list for membership?</summary><div class="qa-body">Per lookup, for anything beyond a handful of items, yes: O(1) against O(n). But building the set costs O(n), so for a single check a list scan is just as good, and for tiny collections the difference is negligible. A set pays off when you check membership many times, especially inside a loop. Its items must also be hashable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get the k most frequent items?</summary><div class="qa-body"><code>Counter(xs).most_common(k)</code>. Counting is O(n), and <code>most_common(k)</code> uses a heap internally, so selecting the top k costs about O(n log k). Without the library, count with a dict and use <code>heapq.nlargest(k, counts, key=counts.get)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't you use <code>hash(user_id)</code> to assign users to A/B groups or data splits?</summary><div class="qa-body">String hashes are salted with a random value per Python process (controlled by <code>PYTHONHASHSEED</code>), so the same id gets a different hash on the next run and lands in a different group. Use a stable digest such as <code>hashlib.md5(user_id.encode()).hexdigest()</code>, converted to an integer, modulo the number of groups.</div></details>
</main>
`
});
