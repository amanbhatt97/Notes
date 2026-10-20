// notes/dsa/dsa_hashing.js — Hashing
Object.assign(TOPIC_CONTENT, {
  "dsa_hashing": `<main>
<h1>Hashing</h1>
  <div class="where"><span>DSA</span><span>Linear structures</span><span>Hashing</span></div>
  <p class="lead">A hash map finds a value by its key in one step on average, no matter how much data it holds. Python's <code>dict</code> and <code>set</code> are hash tables, and "use a dict" is the answer to a huge share of interview questions. This note starts from the plainest question you can ask about Biteful's 8 charges, <em>"have I already seen this one?"</em>, builds the hash table that answers it by hand on those same charges, and then uses it for the patterns that turn O(n²) into O(n): the seen set, Two Sum, counting, prefix sum + hash map, and grouping by a key. Each pattern comes with its trigger words, a template, a traced table, tested code, its cost and practice problems from the tracker. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-hs-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-hs-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Complexity (dict = hash table) · Arrays (prefix sums, two pointers) · Python: Dicts &amp; Sets</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-hs-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Hashing</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · "seen before?" in O(1)</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-hs-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-hs-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-hs-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Linked Lists (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">LRU cache = dict + list</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Heaps · Graphs</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">top-k counts · visited sets</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Dynamic Programming</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">memo = dict of answers</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-hs-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Hashing: about 45 problems tagged seen-set, complement, counting, grouping, prefix + map</text>
</svg><figcaption>Reading order: Complexity → Arrays → <b>Hashing</b> → Linked Lists. The dict you meet here returns in almost every later note.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_arrays">Arrays</a> and <a class="xref" data-note="dsa_complexity">Complexity</a></b><span>Arrays ended with two gaps: two pointers finds the ₹280 combo only on <em>sorted</em> charges (and loses the original positions), and the sliding window cannot count stretches with an exact sum when values are negative. Complexity showed that <code>x in set</code> is about a thousand times faster than <code>x in list</code> and sketched why (hash → slot). <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> gave the Python syntax.</span></li>
    <li><b>This note adds: the hash table, inside and out, and five patterns</b><span>How a key becomes a slot, collisions, resizing, a table built from scratch, what can be a key; then seen-set, complement lookup (Two Sum), frequency counting, prefix sum + hash map and grouping by a canonical key.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_linkedlist">Linked Lists</a></b><span>A dict finds anything in O(1) but knows nothing about order ("which order is oldest?"). Linked lists keep order with O(1) inserts and removals; together, a dict and a linked list make the LRU cache. Practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-hs-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next. Running example: Biteful's charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b> and the profit list <b>[0, −40, 130, −80, 190, −40, −60, 80]</b> (charge − 120) from the Arrays note.</p>
  <ol class="story">
    <li><b>"Is x already seen?"</b><span>Q: as charges stream in, has this amount appeared before? → Remember them in a set: the repeat 80 is caught at position 5 after 6 O(1) checks. 2,000 checks against 1 lakh stored ids: a list scan took about a second, a set under a millisecond. But how can a set answer without looking through its items?</span></li>
    <li><b>Hash function &amp; slots</b><span>Q: how does a value become a position? → slot = hash(key) % size; small ints hash to themselves, so 310 → slot 6 in 8 slots. But 120, 80, 40 and 200 all want slot 0…</span></li>
    <li><b>Collisions</b><span>Q: two keys, one slot? → Probe for another slot (open addressing, what CPython does) or keep a small list per slot (chaining). Linear probing put 200 six looks from home. So how do we stop the table getting that crowded?</span></li>
    <li><b>Load factor &amp; resizing</b><span>Q: when should the table grow? → When about 2/3 full: 6 keys in 8 slots → rebuild with 16 slots, every key re-placed with % 16. Resizes are rare, so insert stays O(1) amortised. Can we build the whole thing ourselves to be sure?</span></li>
    <li><b>Build one from scratch</b><span>Q: what does put / get / delete really do? → A 40-line HashMap stores charge → last position; delete leaves a tombstone. Now: why can't some values be keys?</span></li>
    <li><b>What can be a key</b><span>Q: what if a key changes after it is stored? → It would sit in the wrong slot forever, so keys must be hashable (immutable): tuples yes, lists no; 1, 1.0 and True are one key. With the rules known, which Python tools do we use daily?</span></li>
    <li><b>dict, set, Counter, defaultdict</b><span>Q: the everyday API? → get, setdefault, set algebra (today ∩ yesterday), Counter (80 → 2), defaultdict(list) (price bands). Now the patterns, starting with the ₹280 combo on <em>unsorted</em> charges…</span></li>
    <li><b>Two Sum (complement lookup)</b><span>Q: which two charges make 280, with original positions, without sorting? → For each x ask the dict "have I seen 280 − x?": found at i = 7 (200 needs 80, seen at 5). One pass; 5,000 items: brute half a second, dict under a millisecond. But some questions need <em>how many</em>, not just "seen or not"…</span></li>
    <li><b>Counting / frequency</b><span>Q: how often does each value or letter appear? → A dict of counts: 80 appears twice; "dosa"/"soda" have equal letter counts, so they are anagrams. Counting prefix totals solves the problem Arrays left open…</span></li>
    <li><b>Prefix sum + hash map</b><span>Q: how many stretches of profit total exactly ₹90, with negatives? → Count earlier prefix totals equal to prefix − 90: answer 4, found in one pass. Last, we often need to put items into buckets by some property…</span></li>
    <li><b>Grouping by key</b><span>Q: which dishes are anagrams of each other, which charges share a price band? → Turn each item into a canonical key (sorted letters "elmno"; band "200-299") and group with defaultdict(list). Then a signal-words table, 7 classic problems and the traps.</span></li>
  </ol>

  <h2 id="dsa-hs-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hashing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea &amp; need</div>
        <ul>
          <li><b>Need</b> — "seen before?" / "find by name" in a list is an O(n) scan</li>
          <li><b>Idea</b> — turn the key into a number, use it as an array index</li>
          <li><b>Cost</b> — insert / lookup / delete O(1) average, O(n) worst case</li>
          <li>💡 Library: the book's code tells you the exact shelf; no walking every aisle</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How it works</div>
        <ul>
          <li><b>Hash function</b> — key → integer; same key → same number, always</li>
          <li><b>Slot</b> — <code>hash(key) % size</code> (CPython: <code>&amp; (size-1)</code>, size is a power of 2)</li>
          <li><b>Collision</b> — two keys, one slot. Unavoidable</li>
          <li><b>Chaining</b> — slot holds a small list · <b>Open addressing</b> — try another slot (CPython)</li>
          <li><b>Delete</b> in open addressing leaves a tombstone</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Load factor &amp; resize</div>
        <ul>
          <li><b>Load factor</b> — items ÷ slots</li>
          <li>CPython dict grows when about <b>2/3</b> full</li>
          <li><b>Resize</b> — new bigger table, re-insert every key: O(n), but rare → O(1) amortised</li>
          <li>dict keeps <b>insertion order</b> (3.7+); set does not</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hashability</div>
        <ul>
          <li><b>Key must be hashable</b> — hash never changes while it's in the table</li>
          <li>OK: int, float, str, bytes, tuple (of hashables), frozenset, None</li>
          <li>Not OK: list, dict, set → <code>TypeError: unhashable type</code></li>
          <li><b>Rule</b> — <code>a == b</code> ⇒ <code>hash(a) == hash(b)</code>; ⚠ 1, 1.0, True are one key</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python toolbox</div>
        <ul>
          <li><code>dict</code> — <code>d.get(k, 0)</code>, <code>k in d</code>, <code>d.items()</code>, <code>setdefault</code></li>
          <li><code>set</code> — membership, de-dupe, <code>&amp; | -</code></li>
          <li><code>Counter</code> — counts, <code>most_common(k)</code>, missing → 0</li>
          <li><code>defaultdict(list / int)</code> — no "if key not in" boilerplate</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Seen set</b> — "duplicate?", "first repeat"</li>
          <li><b>Complement lookup</b> — need <code>target − x</code>? check the dict (Two Sum)</li>
          <li><b>Frequency count</b> — anagrams, top k, majority</li>
          <li><b>Prefix sum + count</b> — subarrays summing to k, even with negatives</li>
          <li><b>Group by key</b> — canonical form → list (Group Anagrams)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Contains Duplicate</b> — seen set · <b>Valid Anagram</b> — counts</li>
          <li><b>Two Sum</b> — value → index dict</li>
          <li><b>Group Anagrams</b> — sorted word (or count tuple) as key</li>
          <li><b>Top K Frequent</b> — Counter + buckets (or heap)</li>
          <li><b>Subarray Sum Equals K</b> · <b>Longest Consecutive</b> — set, start only at run beginnings</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-hs-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Is x Already Seen?</span><span class="rm-sub">The seen set; list vs sorted vs set</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-how"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hash Function &amp; Slots</span><span class="rm-sub">Key → number → index</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-collide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Collisions</span><span class="rm-sub">Probing the charges by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-load"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Load Factor &amp; Resizing</span><span class="rm-sub">Why dict grows at 2/3 full</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-impl"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Build One From Scratch</span><span class="rm-sub">Open addressing, tombstones, Big-O</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-hashable"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">What Can Be a Key</span><span class="rm-sub">Hashability, __hash__ and __eq__</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-python"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">dict, set, Counter, defaultdict</span><span class="rm-sub">The Python toolbox</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-twosum"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Two Sum: Complement Lookup</span><span class="rm-sub">Brute vs hash, traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-count"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Counting &amp; Anagrams</span><span class="rm-sub">Frequency maps</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-prefix"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Prefix Sum + Hash Map</span><span class="rm-sub">Stretches summing to k, traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-group"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Grouping by Key</span><span class="rm-sub">Canonical keys</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-patterns"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">Signal words, two-way maps, index as key</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-problems"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">7 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Mutable keys, list lookups, self-pairing</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-hs-need"><span class="num">01</span>Is x Already Seen?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Arrays can reach position i instantly, but the question "has this value appeared before?" has no position to jump to: the only array answer is to scan. With charges arriving all day, a scan per charge is the O(n²) duplicate check that took half a minute in the Complexity note.</p>
  </div>
  <h3>The running example</h3>
  <table class="tbl"><caption>Biteful's charges (same numbers as Complexity, Arrays and Linked Lists)</caption>
    <tr><th>index</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
    <tr><td>charge ₹</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
    <tr><td>profit = charge − 120</td><td>0</td><td>−40</td><td>130</td><td>−80</td><td>190</td><td>−40</td><td>−60</td><td>80</td></tr>
  </table>
  <p>A college library has 50,000 books. If books were piled in arrival order, you would walk every aisle reading spines: that is <code>x in my_list</code>, O(n). Instead, the catalogue gives the book a code and the code says which shelf. A <strong>hash table</strong> does the same for any value: it turns the value itself into a position.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A railway parcel office with 100 pigeonholes. Rule: each parcel goes in the hole numbered by the last two digits of the receiver's phone number. To collect, you say your number and the clerk looks in one hole. The "last two digits" rule is the hash function; the pigeonholes are the array.</p>
  </div>
  <h3>Pattern 1: the seen set</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>duplicate</b>", "appears twice", "already seen", "first repeated", "unique", "distinct", "within k positions", "cycle" (a state seen again).</p>
  </div>
  <p>Walk the charges once. Before adding each one to a set, ask the set whether it is already there.</p>
<div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]

def first_repeat(charges):
    seen = set()
    for i, c in enumerate(charges):
        print(f"i={i} charge={c:3}  seen before? {'YES' if c in seen else 'no ':3}  seen = {sorted(seen)}")
        if c in seen:                  # O(1): is it already in the set?
            return i, c
        seen.add(c)                    # O(1) amortised: remember it
    return None

print(first_repeat(charges))</div>
  <div class="fx" data-lang="text">i=0 charge=120  seen before? no   seen = []
i=1 charge= 80  seen before? no   seen = [120]
i=2 charge=250  seen before? no   seen = [80, 120]
i=3 charge= 40  seen before? no   seen = [80, 120, 250]
i=4 charge=310  seen before? no   seen = [40, 80, 120, 250]
i=5 charge= 80  seen before? YES  seen = [40, 80, 120, 250, 310]
(5, 80)</div>
  <table class="tbl out"><caption>Trace: the set grows by one per charge until the repeat</caption>
    <tr><th>i</th><th>charge</th><th>in seen?</th><th>seen afterwards</th></tr>
    <tr><td>0</td><td>120</td><td>no</td><td>{120}</td></tr>
    <tr><td>1</td><td>80</td><td>no</td><td>{120, 80}</td></tr>
    <tr><td>2</td><td>250</td><td>no</td><td>{120, 80, 250}</td></tr>
    <tr><td>3</td><td>40</td><td>no</td><td>{…, 40}</td></tr>
    <tr><td>4</td><td>310</td><td>no</td><td>{…, 310}</td></tr>
    <tr><td>5</td><td>80</td><td><b>YES → stop</b></td><td>—</td></tr>
  </table>
<div class="fx" data-lang="text">seen = set()
for x in items:
    if x in seen: return x          # (or count it, or record its index)
    seen.add(x)</div>
  <p>Why not a sorted list with binary search (O(log n) per check)? Three ways to store 1 lakh processed charge ids, then answer 2,000 "seen before?" questions:</p>
<div class="fx" data-lang="py">import time, random, bisect
random.seed(4)
n = 100_000
stored = random.sample(range(10**9), n)          # 1 lakh charge ids already processed
queries = random.sample(range(10**9), 2_000)     # 2,000 new charges: "seen before?"

as_list = list(stored)
as_sorted = sorted(stored)
as_set = set(stored)

def timed(check):
    t = time.perf_counter()
    hits = sum(check(q) for q in queries)
    return hits, (time.perf_counter() - t) * 1000

def in_sorted(q):
    i = bisect.bisect_left(as_sorted, q)
    return i &lt; len(as_sorted) and as_sorted[i] == q

for name, check in [("unsorted list (scan)", lambda q: q in as_list),
                    ("sorted list (binary search)", in_sorted),
                    ("set (hash table)", lambda q: q in as_set)]:
    hits, ms = timed(check)
    print(f"{name:28s} {ms:9.2f} ms for 2,000 checks  (hits={hits})")</div>
  <div class="fx" data-lang="text">unsorted list (scan)           1058.22 ms for 2,000 checks  (hits=0)
sorted list (binary search)       1.48 ms for 2,000 checks  (hits=0)
set (hash table)                  0.44 ms for 2,000 checks  (hits=0)</div>
  <table class="tbl">
    <tr><th>Store items in</th><th>Insert</th><th>"Is x here?"</th><th>Measured (2,000 checks, 1 lakh items)</th></tr>
    <tr><td>Unsorted list</td><td>O(1) append</td><td>O(n) scan</td><td>about a second</td></tr>
    <tr><td>Sorted list + binary search</td><td>O(n) shift</td><td>O(log n)</td><td>~1.5 ms (but every insert shifts)</td></tr>
    <tr><td><strong>Hash table (set / dict)</strong></td><td><strong>O(1) avg</strong></td><td><strong>O(1) avg</strong></td><td>~0.4 ms</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hash set</strong> (Python <code>set</code>): stores keys only, answers "is it here?". <strong>Hash map</strong> (<code>dict</code>): stores key → value pairs. Both are built on a <strong>hash table</strong>: an array of slots plus a hash function that picks the slot. Seen-set pattern: <strong>O(n) time, O(n) space</strong> (brute force O(n²) time, O(1) space).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>seen = []</code> instead of <code>seen = set()</code>. The code looks identical and gives the same answer; it is O(n²). This one character is the most common performance bug in interview solutions.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Hashing: <b>217 Contains Duplicate</b> (exactly this), <b>219 Contains Duplicate II</b> (store the last index in a dict instead), <b>349 Intersection of Two Arrays</b> (set of one, check the other).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Hash Function &amp; Slots.</b> We used <code>x in seen</code> as a black box that answers in one step. How does 310 know which slot it lives in?</div>

  <h2 id="dsa-hs-how"><span class="num">02</span>Hash Function &amp; Slots</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An array jumps to slot i in O(1). Our keys are values (310, "chai"), not slot numbers. We need a rule that turns any key into a slot number, the same one every time.</p>
  </div>
  <p>A <strong>hash function</strong> turns any key into an integer. It must be <strong>deterministic</strong> (same key, same number) and should <strong>spread</strong> different keys over many numbers. Then <code>slot = hash(key) % number_of_slots</code> squeezes that number into a valid index. Python's own <code>hash</code> of a small int is the int itself, so for the charges it is easy to do by hand: 310 % 8 = 6.</p>
<div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
print([hash(c) for c in charges])                 # small ints hash to themselves
for size in (8, 16):
    print(f"{size:2} slots:", {c: hash(c) % size for c in charges})
print(hash(-1), hash("chai") == hash("chai"), hash((1, 2)) == hash((1, 2)))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200]
 8 slots: {120: 0, 80: 0, 250: 2, 40: 0, 310: 6, 60: 4, 200: 0}
16 slots: {120: 8, 80: 0, 250: 10, 40: 8, 310: 6, 60: 12, 200: 8}
-2 True True</div>
  <p>With 8 slots, 250 → 2, 310 → 6, 60 → 4, but 120, 80, 40 and 200 all land on 0 (they are all multiples of 8). With 16 slots they spread differently (120, 40, 200 now share 8). Keys that share a slot are a <strong>collision</strong>, the subject of the next section. <code>hash(-1)</code> is −2 (−1 is reserved inside CPython as an error signal).</p>
  <p>For strings, a hash mixes in every character. A toy version, the same shape Java uses for <code>String.hashCode</code>: multiply by 31 and add each character code. On Biteful's breakfast menu:</p>
<div class="fx" data-lang="py">def toy_hash(key):
    h = 0
    for ch in key:
        h = h * 31 + ord(ch)            # mix every character in
    return h

for dish in ["chai", "dosa", "idli", "vada"]:      # Biteful's breakfast menu
    h = toy_hash(dish)
    print(f"{dish}: hash={h}  slot={h % 8}")</div>
  <div class="fx" data-lang="text">chai: hash=3052365  slot=5
dosa: hash=3089433  slot=1
idli: hash=3227608  slot=0
vada: hash=3611752  slot=0</div>
<figure class="viz"><svg viewBox="0 0 600 240" width="600"><defs><marker id="hs-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><rect x="470" y="16" width="110" height="25" class="fr sr"/><text x="462" y="33" text-anchor="end" class="tm">0</text><text x="525" y="33" text-anchor="middle" class="tr">idli + vada?</text><rect x="470" y="41" width="110" height="25" class="fb sb"/><text x="462" y="58" text-anchor="end" class="tm">1</text><text x="525" y="58" text-anchor="middle">dosa</text><rect x="470" y="66" width="110" height="25" class="fs"/><text x="462" y="83" text-anchor="end" class="tm">2</text><rect x="470" y="91" width="110" height="25" class="fs"/><text x="462" y="108" text-anchor="end" class="tm">3</text><rect x="470" y="116" width="110" height="25" class="fs"/><text x="462" y="133" text-anchor="end" class="tm">4</text><rect x="470" y="141" width="110" height="25" class="fb sb"/><text x="462" y="158" text-anchor="end" class="tm">5</text><text x="525" y="158" text-anchor="middle">chai</text><rect x="470" y="166" width="110" height="25" class="fs"/><text x="462" y="183" text-anchor="end" class="tm">6</text><rect x="470" y="191" width="110" height="25" class="fs"/><text x="462" y="208" text-anchor="end" class="tm">7</text><rect x="10" y="15" width="56" height="26" class="ft st"/><text x="38" y="33" text-anchor="middle">chai</text><text x="76" y="33" text-anchor="start">→ hash = 3052365</text><text x="76" y="51" text-anchor="start" class="tm">  3052365 % 8 = 5</text><line x1="260" y1="30" x2="466" y2="153.5" class="sb" stroke-width="1.2" marker-end="url(#hs-a1)"/><rect x="10" y="65" width="56" height="26" class="ft st"/><text x="38" y="83" text-anchor="middle">dosa</text><text x="76" y="83" text-anchor="start">→ hash = 3089433</text><text x="76" y="101" text-anchor="start" class="tm">  3089433 % 8 = 1</text><line x1="260" y1="80" x2="466" y2="53.5" class="sb" stroke-width="1.2" marker-end="url(#hs-a1)"/><rect x="10" y="115" width="56" height="26" class="ft st"/><text x="38" y="133" text-anchor="middle">idli</text><text x="76" y="133" text-anchor="start">→ hash = 3227608</text><text x="76" y="151" text-anchor="start" class="tm">  3227608 % 8 = 0</text><line x1="260" y1="130" x2="466" y2="28.5" class="sb" stroke-width="1.2" marker-end="url(#hs-a1)"/><rect x="10" y="165" width="56" height="26" class="ft st"/><text x="38" y="183" text-anchor="middle">vada</text><text x="76" y="183" text-anchor="start">→ hash = 3611752</text><text x="76" y="201" text-anchor="start" class="tm">  3611752 % 8 = 0</text><line x1="260" y1="180" x2="466" y2="28.5" class="sb" stroke-width="1.2" marker-end="url(#hs-a1)"/><text x="525" y="232" text-anchor="middle" class="tm">table of 8 slots</text></svg><figcaption>Each key is hashed to a big number, then reduced to a slot with % 8. "idli" and "vada" both land in slot 0: a collision.</figcaption></figure>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Computing the hash and the slot takes the same time whether the table holds 10 keys or 10 million. That is where O(1) comes from. (Hashing a string of length k costs O(k), but Python caches a string's hash after the first time.)</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hash function</strong>: key → integer, deterministic, well spread. <strong>Slot</strong> (bucket): <code>hash(key) % size</code>; CPython keeps size a power of 2 and uses the faster <code>hash &amp; (size − 1)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>String hashes in Python are <strong>randomised per process</strong> (protection against attackers forcing collisions). <code>hash("chai")</code> differs between runs. Never save hash values to a file or rely on the order of a set of strings.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Collisions.</b> Four of our seven distinct charges want slot 0. A slot holds one key. Where do the other three go, and how do we find them again?</div>

  <h2 id="dsa-hs-collide"><span class="num">03</span>Collisions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>There are endless possible keys and few slots, so two keys <em>will</em> share a slot (the pigeonhole principle). On our charges it happens immediately: 120, 80, 40, 200 all hash to slot 0. Without a rule for this, the table cannot store them, let alone find them.</p>
  </div>
  <p>Two main rules. <strong>Separate chaining</strong>: each slot holds a small list of all keys that hashed there. <strong>Open addressing</strong>: one key per slot; if busy, follow a fixed probe sequence to the next slot, and a lookup follows the same sequence until it finds the key or an empty slot. CPython's dict and set use open addressing. The simplest probe sequence is "try the next slot" (<strong>linear probing</strong>). By hand on the charges, 8 slots:</p>
<div class="fx" data-lang="py">def insert_linear(keys, size):
    table = [None] * size
    for k in keys:
        if k in table:
            print(f"{k:3}: already stored, skip")
            continue
        i = home = k % size                 # hash(k) == k for small ints
        path = [i]
        while table[i] is not None:         # busy: try the next slot
            i = (i + 1) % size
            path.append(i)
        table[i] = k
        print(f"{k:3}: home {home} -&gt; tried {path} -&gt; stored in slot {i}")
    return table

t = insert_linear([120, 80, 250, 40, 310, 80, 60, 200], 8)
print(t)</div>
  <div class="fx" data-lang="text">120: home 0 -&gt; tried [0] -&gt; stored in slot 0
 80: home 0 -&gt; tried [0, 1] -&gt; stored in slot 1
250: home 2 -&gt; tried [2] -&gt; stored in slot 2
 40: home 0 -&gt; tried [0, 1, 2, 3] -&gt; stored in slot 3
310: home 6 -&gt; tried [6] -&gt; stored in slot 6
 80: already stored, skip
 60: home 4 -&gt; tried [4] -&gt; stored in slot 4
200: home 0 -&gt; tried [0, 1, 2, 3, 4, 5] -&gt; stored in slot 5
[120, 80, 250, 40, 60, 200, 310, None]</div>
<figure class="viz"><svg viewBox="0 0 620 200" width="620">
<defs><marker id="hs-pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="310" y="18" text-anchor="middle" font-size="12">8 slots, linear probing, keys inserted in charge order (hash(k) = k, slot = k % 8)</text>
<rect x="30" y="60" width="64" height="40" class="fb sb"/>
<text x="62" y="85" text-anchor="middle" font-size="13">120</text>
<text x="62" y="118" text-anchor="middle" class="tm" font-size="11">slot 0</text>
<text x="62" y="136" text-anchor="middle" font-size="10" class="tg">home 0</text>
<rect x="100" y="60" width="64" height="40" class="fr sr"/>
<text x="132" y="85" text-anchor="middle" font-size="13">80</text>
<text x="132" y="118" text-anchor="middle" class="tm" font-size="11">slot 1</text>
<text x="132" y="136" text-anchor="middle" font-size="10" class="tr">home 0, 1 extra</text>
<rect x="170" y="60" width="64" height="40" class="fb sb"/>
<text x="202" y="85" text-anchor="middle" font-size="13">250</text>
<text x="202" y="118" text-anchor="middle" class="tm" font-size="11">slot 2</text>
<text x="202" y="136" text-anchor="middle" font-size="10" class="tg">home 2</text>
<rect x="240" y="60" width="64" height="40" class="fr sr"/>
<text x="272" y="85" text-anchor="middle" font-size="13">40</text>
<text x="272" y="118" text-anchor="middle" class="tm" font-size="11">slot 3</text>
<text x="272" y="136" text-anchor="middle" font-size="10" class="tr">home 0, 3 extra</text>
<rect x="310" y="60" width="64" height="40" class="fb sb"/>
<text x="342" y="85" text-anchor="middle" font-size="13">60</text>
<text x="342" y="118" text-anchor="middle" class="tm" font-size="11">slot 4</text>
<text x="342" y="136" text-anchor="middle" font-size="10" class="tg">home 4</text>
<rect x="380" y="60" width="64" height="40" class="fr sr"/>
<text x="412" y="85" text-anchor="middle" font-size="13">200</text>
<text x="412" y="118" text-anchor="middle" class="tm" font-size="11">slot 5</text>
<text x="412" y="136" text-anchor="middle" font-size="10" class="tr">home 0, 5 extra</text>
<rect x="450" y="60" width="64" height="40" class="fb sb"/>
<text x="482" y="85" text-anchor="middle" font-size="13">310</text>
<text x="482" y="118" text-anchor="middle" class="tm" font-size="11">slot 6</text>
<text x="482" y="136" text-anchor="middle" font-size="10" class="tg">home 6</text>
<rect x="520" y="60" width="64" height="40" class="fs" stroke="currentColor"/>
<text x="552" y="85" text-anchor="middle" font-size="13"></text>
<text x="552" y="118" text-anchor="middle" class="tm" font-size="11">slot 7</text>
<path d="M62,58 C150,25 380,25 412,58" fill="none" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#hs-pa)"/>
<text x="240" y="40" text-anchor="middle" class="tr" font-size="11">200: home 0 busy → 1 → 2 → 3 → 4 → slot 5 (6 looks)</text>
<text x="310" y="170" text-anchor="middle" class="tm" font-size="11">blue = in its home slot · red = pushed along by a collision · 120, 80, 40 and 200 all wanted slot 0</text>
<text x="310" y="188" text-anchor="middle" class="tm" font-size="11">7 keys in 8 slots: a crowded run 0–5 forms (clustering); a real dict would have grown long before this</text>
</svg><figcaption>Where the 7 distinct charges land in an 8-slot table with the simplest collision rule. The longer the run of busy slots, the more looks every later key needs.</figcaption></figure>
  <p>80 needed 2 looks, 40 needed 4, 200 needed 6: every collision makes the busy run longer, and a longer run makes the next collision more expensive. This snowball is called <strong>clustering</strong>. Looking up 200 later repeats the same 6 looks; looking up a missing value like 90 (home 90 % 8 = 2) walks 2, 3, 4, 5, 6 and stops only at empty slot 7.</p>
<figure class="viz"><svg viewBox="0 0 600 215" width="600"><defs><marker id="hs-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><text x="140" y="20" text-anchor="middle" class="tb">Chaining: each slot holds a list</text><rect x="20" y="40" width="50" height="28" class="fs"/><text x="12" y="59" text-anchor="end" class="tm">0</text><rect x="20" y="76" width="50" height="28" class="fs"/><text x="12" y="95" text-anchor="end" class="tm">1</text><rect x="20" y="112" width="50" height="28" class="fs"/><text x="12" y="131" text-anchor="end" class="tm">2</text><rect x="20" y="148" width="50" height="28" class="fs"/><text x="12" y="167" text-anchor="end" class="tm">3</text><rect x="100" y="40" width="56" height="28" class="fb sb"/><text x="128" y="59" text-anchor="middle">idli</text><rect x="186" y="40" width="56" height="28" class="fr sr"/><text x="214" y="59" text-anchor="middle">vada</text><rect x="100" y="76" width="56" height="28" class="fb sb"/><text x="128" y="95" text-anchor="middle">dosa</text><line x1="70" y1="54" x2="96" y2="54" class="sb" marker-end="url(#hs-a2)"/><line x1="156" y1="54" x2="182" y2="54" class="sb" marker-end="url(#hs-a2)"/><line x1="70" y1="90" x2="96" y2="90" class="sb" marker-end="url(#hs-a2)"/><text x="140" y="200" text-anchor="middle" class="tm">Java HashMap, textbooks</text><line x1="300" y1="10" x2="300" y2="210" stroke="currentColor" stroke-dasharray="4 4" opacity=".35"/><text x="452" y="20" text-anchor="middle" class="tb">Open addressing: probe the next slot</text><rect x="316" y="90" width="34" height="30" class="fb sb"/><text x="333" y="110" text-anchor="middle">idli</text><text x="333" y="136" text-anchor="middle" class="tm">0</text><rect x="350" y="90" width="34" height="30" class="fb sb"/><text x="367" y="110" text-anchor="middle">dosa</text><text x="367" y="136" text-anchor="middle" class="tm">1</text><rect x="384" y="90" width="34" height="30" class="fg sg"/><text x="401" y="110" text-anchor="middle">vada</text><text x="401" y="136" text-anchor="middle" class="tm">2</text><rect x="418" y="90" width="34" height="30" class="fs"/><text x="435" y="136" text-anchor="middle" class="tm">3</text><rect x="452" y="90" width="34" height="30" class="fs"/><text x="469" y="136" text-anchor="middle" class="tm">4</text><rect x="486" y="90" width="34" height="30" class="fb sb"/><text x="503" y="110" text-anchor="middle">chai</text><text x="503" y="136" text-anchor="middle" class="tm">5</text><rect x="520" y="90" width="34" height="30" class="fs"/><text x="537" y="136" text-anchor="middle" class="tm">6</text><rect x="554" y="90" width="34" height="30" class="fs"/><text x="571" y="136" text-anchor="middle" class="tm">7</text><path d="M333,88 Q350,58 367,86" fill="none" class="sr" stroke-width="1.5" marker-end="url(#hs-a2)"/><path d="M367,88 Q384,58 401,86" fill="none" class="sr" stroke-width="1.5" marker-end="url(#hs-a2)"/><text x="358" y="52" text-anchor="middle" class="tr">taken</text><text x="398" y="52" text-anchor="middle" class="tr">taken</text><text x="452" y="165" text-anchor="middle">vada: home 0 busy → 1 busy → 2 free</text><text x="452" y="200" text-anchor="middle" class="tm">CPython dict and set</text></svg><figcaption>Left: chaining keeps a small list per slot. Right: open addressing keeps one key per slot and probes for the next free one; "vada" ends up two slots away from home.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Chaining is a hotel that puts an extra bed in an already-booked room. Open addressing is a hotel that says "room 101 is taken, try 102", and a guest searching for you also walks 101, 102, … until they find you or an empty room.</p>
  </div>
  <h3>How CPython probes</h3>
  <p>Linear probing clusters, as we just saw. CPython instead jumps around using more bits of the hash: roughly <code>perturb &gt;&gt;= 5; i = (5*i + 1 + perturb) &amp; (size − 1)</code>. Keys that collided once quickly take different paths, so runs stay short.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Collision</strong>: two different keys with the same slot. <strong>Chaining</strong>: a list per slot (Java's HashMap). <strong>Open addressing</strong>: probe other slots (CPython). <strong>Probe sequence</strong>: the fixed order of slots tried, the same for insert and lookup.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deleting in open addressing</span>
    <p>If you delete 80 from slot 1 by marking it empty, a later search for 40 (home 0) sees slot 1 empty and stops: "not found", although 40 sits in slot 3. Fix: mark deleted slots with a <strong>tombstone</strong> ("deleted, keep probing"). Inserts may reuse tombstones; resizes clean them out.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Load Factor &amp; Resizing.</b> Seven keys in eight slots made probes long. The fix is obviously "more slots", but when should the table grow, and doesn't growing cost O(n)?</div>

  <h2 id="dsa-hs-load"><span class="num">04</span>Load Factor &amp; Resizing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our 8-slot table with 7 keys forced 200 to look 6 times. A nearly full table drifts towards O(n) lookups. We need a measure of "too full" and a rule for growing that keeps inserts cheap overall.</p>
  </div>
  <p>The <strong>load factor</strong> is items ÷ slots. At 0.25 most probes hit an empty slot at once; near 1.0 almost every probe walks a long way. So the table grows before it gets crowded: CPython's dict resizes when it is about <strong>2/3</strong> full. In our probing trace, 6 keys in 8 slots (0.75) was already past that line; a real dict would have grown to 16 slots, where the charges spread out (120 → 8, 80 → 0, 250 → 10, 310 → 6, 60 → 12…). The from-scratch table in the next section shows this happening.</p>
<figure class="viz"><svg viewBox="0 0 600 200" width="600"><text x="300" y="18" text-anchor="middle" class="tr">8 slots, 6 keys: load = 6/8 = 0.75 &gt; 2/3 → grow</text><rect x="164" y="28" width="34" height="30" class="fb sb"/><text x="181" y="48" text-anchor="middle">idli</text><text x="181" y="74" text-anchor="middle" class="tm">0</text><rect x="198" y="28" width="34" height="30" class="fb sb"/><text x="215" y="48" text-anchor="middle">dosa</text><text x="215" y="74" text-anchor="middle" class="tm">1</text><rect x="232" y="28" width="34" height="30" class="fb sb"/><text x="249" y="48" text-anchor="middle">vada</text><text x="249" y="74" text-anchor="middle" class="tm">2</text><rect x="266" y="28" width="34" height="30" class="fb sb"/><text x="283" y="48" text-anchor="middle">roti</text><text x="283" y="74" text-anchor="middle" class="tm">3</text><rect x="300" y="28" width="34" height="30" class="fb sb"/><text x="317" y="48" text-anchor="middle">naan</text><text x="317" y="74" text-anchor="middle" class="tm">4</text><rect x="334" y="28" width="34" height="30" class="fb sb"/><text x="351" y="48" text-anchor="middle">chai</text><text x="351" y="74" text-anchor="middle" class="tm">5</text><rect x="368" y="28" width="34" height="30" class="fs"/><text x="385" y="74" text-anchor="middle" class="tm">6</text><rect x="402" y="28" width="34" height="30" class="fs"/><text x="419" y="74" text-anchor="middle" class="tm">7</text><text x="300" y="104" text-anchor="middle">↓ allocate 16 slots, re-insert every key with hash % 16</text><text x="300" y="132" text-anchor="middle" class="tg">16 slots, 6 keys: load = 0.375</text><rect x="28" y="142" width="34" height="30" class="fg sg"/><text x="45" y="162" text-anchor="middle">naan</text><text x="45" y="188" text-anchor="middle" class="tm">0</text><rect x="62" y="142" width="34" height="30" class="fs"/><text x="79" y="188" text-anchor="middle" class="tm">1</text><rect x="96" y="142" width="34" height="30" class="fg sg"/><text x="113" y="162" text-anchor="middle">roti</text><text x="113" y="188" text-anchor="middle" class="tm">2</text><rect x="130" y="142" width="34" height="30" class="fs"/><text x="147" y="188" text-anchor="middle" class="tm">3</text><rect x="164" y="142" width="34" height="30" class="fs"/><text x="181" y="188" text-anchor="middle" class="tm">4</text><rect x="198" y="142" width="34" height="30" class="fs"/><text x="215" y="188" text-anchor="middle" class="tm">5</text><rect x="232" y="142" width="34" height="30" class="fs"/><text x="249" y="188" text-anchor="middle" class="tm">6</text><rect x="266" y="142" width="34" height="30" class="fs"/><text x="283" y="188" text-anchor="middle" class="tm">7</text><rect x="300" y="142" width="34" height="30" class="fg sg"/><text x="317" y="162" text-anchor="middle">idli</text><text x="317" y="188" text-anchor="middle" class="tm">8</text><rect x="334" y="142" width="34" height="30" class="fg sg"/><text x="351" y="162" text-anchor="middle">dosa</text><text x="351" y="188" text-anchor="middle" class="tm">9</text><rect x="368" y="142" width="34" height="30" class="fg sg"/><text x="385" y="162" text-anchor="middle">vada</text><text x="385" y="188" text-anchor="middle" class="tm">10</text><rect x="402" y="142" width="34" height="30" class="fs"/><text x="419" y="188" text-anchor="middle" class="tm">11</text><rect x="436" y="142" width="34" height="30" class="fs"/><text x="453" y="188" text-anchor="middle" class="tm">12</text><rect x="470" y="142" width="34" height="30" class="fg sg"/><text x="487" y="162" text-anchor="middle">chai</text><text x="487" y="188" text-anchor="middle" class="tm">13</text><rect x="504" y="142" width="34" height="30" class="fs"/><text x="521" y="188" text-anchor="middle" class="tm">14</text><rect x="538" y="142" width="34" height="30" class="fs"/><text x="555" y="188" text-anchor="middle" class="tm">15</text></svg><figcaption>With the toy hash and linear probing: at 6 keys in 8 slots the table is over 2/3 full, so it grows to 16 slots. Every key's slot is recomputed with % 16, and the crowd at the start of the table spreads out.</figcaption></figure>
  <p>Resizing re-inserts every key, which is O(n). Like list append (Complexity note), it happens rarely because the size grows by a constant factor, so the cost averages out: insert is <strong>O(1) amortised</strong>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Load factor</strong> α = items / slots. <strong>Rehashing</strong>: moving all keys into a bigger table; positions change because the slot is <code>hash % size</code> and the size changed. This is why you can't rely on a key "staying at slot 6".</p>
  </div>
  <p>Modern CPython stores a dict in two parts: a small <strong>index table</strong> (the hash slots, holding positions) and a dense <strong>entries list</strong> of (hash, key, value) in insertion order. That "compact dict" uses less memory and is why dicts remember insertion order (guaranteed since 3.7). Sets don't have this, so set order is arbitrary.</p>
  <div class="callout trap"><span class="label">Trap: "O(1)" is an average</span>
    <p>If many keys collide (a bad hash, or an attacker choosing keys), lookups degrade to O(n). In interviews say "O(1) average, O(n) worst case". A balanced tree gives a guaranteed O(log n) instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Build One From Scratch.</b> We have all the pieces in words: hash, probe, tombstone, grow at 2/3. Writing them as code is the best check that we really understand put, get and delete.</div>

  <h2 id="dsa-hs-impl"><span class="num">05</span>Build One From Scratch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We traced inserts by hand, but not updates (the second 80), deletes, or a resize happening mid-stream. A working implementation answers "what exactly happens on each call?" and is itself an interview question (Design HashMap).</p>
  </div>
  <p>A small hash map with open addressing and linear probing. Three ideas carry it: probe until an empty slot, leave tombstones on delete, double the table when 2/3 full. We use it to store each charge → the last position it appeared at.</p>
<div class="fx" data-lang="py">EMPTY, DELETED = object(), object()       # two special markers

class HashMap:
    def __init__(self, cap=8):
        self.keys = [EMPTY] * cap
        self.vals = [None] * cap
        self.used = 0                     # live keys + tombstones

    def _slot(self, key):
        """Index where key lives, or where it should go."""
        cap = len(self.keys)
        i = hash(key) % cap               # 1. hash -&gt; home slot
        first_free = None
        while self.keys[i] is not EMPTY:  # 2. probe until an empty slot
            k = self.keys[i]
            if k is DELETED:
                if first_free is None:
                    first_free = i        # remember: can reuse this spot
            elif k == key:
                return i                  # found it
            i = (i + 1) % cap             # linear probing: try the next slot
        return first_free if first_free is not None else i

    def put(self, key, val):
        i = self._slot(key)
        if self.keys[i] is EMPTY:
            self.used += 1
        self.keys[i], self.vals[i] = key, val
        if self.used * 3 &gt;= len(self.keys) * 2:   # 2/3 full: grow
            self._resize(len(self.keys) * 2)

    def get(self, key, default=None):
        i = self._slot(key)
        k = self.keys[i]
        return self.vals[i] if k is not EMPTY and k is not DELETED else default

    def delete(self, key):
        i = self._slot(key)
        k = self.keys[i]
        if k is EMPTY or k is DELETED:
            raise KeyError(key)
        self.keys[i], self.vals[i] = DELETED, None   # tombstone, not EMPTY

    def _resize(self, cap):
        old = [(k, v) for k, v in zip(self.keys, self.vals)
               if k is not EMPTY and k is not DELETED]
        self.keys, self.vals, self.used = [EMPTY] * cap, [None] * cap, 0
        for k, v in old:                  # rehash: new size = new slots
            self.put(k, v)

    def __len__(self):
        return sum(k is not EMPTY and k is not DELETED for k in self.keys)

    def layout(self):
        return {i: k for i, k in enumerate(self.keys) if k is not EMPTY and k is not DELETED}

last_seen = HashMap()                     # charge -&gt; last position it appeared at
for pos, c in enumerate([120, 80, 250, 40, 310, 80, 60, 200]):
    last_seen.put(c, pos)
    print(f"put {c:3}-&gt;{pos}: size={len(last_seen)} capacity={len(last_seen.keys):2}  slots={last_seen.layout()}")
last_seen.delete(250)
print(last_seen.get(80), last_seen.get(250), last_seen.get(200), last_seen.get(999, "none"), len(last_seen))</div>
  <div class="fx" data-lang="text">put 120-&gt;0: size=1 capacity= 8  slots={0: 120}
put  80-&gt;1: size=2 capacity= 8  slots={0: 120, 1: 80}
put 250-&gt;2: size=3 capacity= 8  slots={0: 120, 1: 80, 2: 250}
put  40-&gt;3: size=4 capacity= 8  slots={0: 120, 1: 80, 2: 250, 3: 40}
put 310-&gt;4: size=5 capacity= 8  slots={0: 120, 1: 80, 2: 250, 3: 40, 6: 310}
put  80-&gt;5: size=5 capacity= 8  slots={0: 120, 1: 80, 2: 250, 3: 40, 6: 310}
put  60-&gt;6: size=6 capacity=16  slots={0: 80, 6: 310, 8: 120, 9: 40, 10: 250, 12: 60}
put 200-&gt;7: size=7 capacity=16  slots={0: 80, 6: 310, 8: 120, 9: 40, 10: 250, 11: 200, 12: 60}
5 None 7 none 6</div>
  <table class="tbl out"><caption>What happened, call by call</caption>
    <tr><th>call</th><th>effect</th></tr>
    <tr><td>put 120, 80, 250, 40</td><td>slots 0, 1 (80 probed past 0), 2, 3 (40 probed 0→1→2→3)</td></tr>
    <tr><td>put 310</td><td>slot 6; 5 keys in 8 = 0.625, below 2/3</td></tr>
    <tr><td>put 80 → 5</td><td>found at slot 1: <b>update</b>, size stays 5</td></tr>
    <tr><td>put 60</td><td>6 used of 8 ≥ 2/3 → <b>resize to 16</b>, every key re-placed with % 16 (120 → 8, 40 → 8 busy → 9, 80 → 0…)</td></tr>
    <tr><td>put 200</td><td>home 8 busy, 9 busy, 10 busy → 11</td></tr>
    <tr><td>delete 250</td><td>slot 10 becomes a tombstone; get(250) → None; get(80) → 5</td></tr>
  </table>
  <p>Why does <code>used</code> count tombstones too? Because tombstones also block "probe until empty". If they were ignored, a table full of tombstones would have no empty slot and the probe loop would never end. The class was checked against a real dict on 300 random sequences of put/get/delete.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Average</th><th>Worst</th><th>Plain reason</th></tr>
    <tr><td>get / <code>k in d</code></td><td>O(1)</td><td>O(n)</td><td>Hash, then a few probes; worst case all keys collide</td></tr>
    <tr><td>put (insert / update)</td><td>O(1) amortised</td><td>O(n)</td><td>Occasional resize re-inserts everything</td></tr>
    <tr><td>delete</td><td>O(1)</td><td>O(n)</td><td>Find, then leave a tombstone</td></tr>
    <tr><td>iterate all keys</td><td>O(n)</td><td>O(n)</td><td>Walk the entries</td></tr>
    <tr><td>min / max / sorted keys</td><td>O(n) / O(n log n)</td><td></td><td>No order by value; use a heap or sorting</td></tr>
    <tr><td>space</td><td>O(n)</td><td></td><td>Plus spare empty slots (≥ 1/3 of the table)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting that <code>put</code> on an existing key is an <em>update</em>: it must find the key first, not blindly take the first free slot, or the table ends up with two copies of 80.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Hashing: <b>705 Design HashSet</b>, <b>706 Design HashMap</b> (this class, simplified), <b>380 Insert Delete GetRandom O(1)</b> (dict + list together).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: What Can Be a Key.</b> Our table assumes a key's hash never changes. What if someone stores a list as a key and then appends to it?</div>

  <h2 id="dsa-hs-hashable"><span class="num">06</span>What Can Be a Key</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The table finds a key by its hash. If a key changed after it was stored, its hash would change, the table would look in the wrong slot and never find it again. Which values are safe as keys, and how do our own classes become keys?</p>
  </div>
  <p>Keys must be <strong>hashable</strong>: their hash must never change. In practice that means <strong>immutable</strong> values: numbers, strings, tuples of hashables, frozensets. Biteful might key orders by <code>("lunch", 2)</code> (shift, slot), a coupon code, or a frozenset of a combo's prices:</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Filing a document under "phone number 98xxx". If the person changes their number while the file is in the cabinet, nobody can find the file by either number any more.</p>
  </div>
<div class="fx" data-lang="py">d = {}
d[("lunch", 2)] = 250                  # (shift, slot) tuple: ok
d["BITE50"] = "coupon ok"
d[frozenset({80, 200})] = "combo ok"
try:
    d[[80, 200]] = "list?"
except TypeError as e:
    print("TypeError:", e)
try:
    d[("lunch", [2])] = "tuple holding a list?"
except TypeError as e:
    print("TypeError:", e)
print(len(d), d[("lunch", 2)], 1 == 1.0 == True, {1: "a", 1.0: "b", True: "c"})

class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))   # equal objects -&gt; equal hashes

visited = {Point(1, 2)}
print(Point(1, 2) in visited, Point(2, 1) in visited)</div>
  <div class="fx" data-lang="text">TypeError: unhashable type: 'list'
TypeError: unhashable type: 'list'
3 250 True {1: 'c'}
True False</div>
  <p>A tuple is hashable only if everything inside it is. And <code>1</code>, <code>1.0</code> and <code>True</code> are equal with equal hashes, so they are the <strong>same key</strong>: the dict keeps the first key and the last value.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>The hash contract</strong>: if <code>a == b</code> then <code>hash(a) == hash(b)</code>. The reverse need not hold (different keys may collide). If you define <code>__eq__</code> on a class, Python sets <code>__hash__</code> to None (unhashable) until you define <code>__hash__</code> too, using the same fields. <code>@dataclass(frozen=True)</code> does both.</p>
  </div>
  <table class="tbl">
    <tr><th>Hashable (can be key / set item)</th><th>Not hashable</th><th>Common fix</th></tr>
    <tr><td>int, float, str, bytes, bool, None, tuple of hashables, frozenset, frozen dataclass</td><td>list, dict, set, bytearray, tuple containing a list</td><td><code>tuple(lst)</code>, <code>frozenset(s)</code>, <code>tuple(sorted(d.items()))</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Float keys: <code>0.1 + 0.2</code> is not <code>0.3</code>, so they are different keys. Store money as integer paise or round before using as a key.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: dict, set, Counter, defaultdict.</b> We know how the table works and what may go in it. Day to day we don't write HashMap classes; we need the Python tools built on it.</div>

  <h2 id="dsa-hs-python"><span class="num">07</span>dict, set, Counter, defaultdict</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every pattern ahead needs one of four moves: read with a default, combine sets, count, or collect into lists. Writing <code>if k not in d: d[k] = …</code> every time is slow to type and easy to get wrong. Which tools does Python give for each?</p>
  </div>
<div class="fx" data-lang="py">from collections import Counter, defaultdict
charges = [120, 80, 250, 40, 310, 80, 60, 200]

menu = {"chai": 20, "dosa": 50}
menu["idli"] = 30                      # insert
menu["chai"] += 5                      # update
print(menu.get("vada", 0), "vada" in menu, list(menu))
del menu["dosa"]
print(menu.pop("idli"), menu, menu.setdefault("poha", 15), menu)

today = set(charges)
yesterday = {80, 90, 200, 310, 500}
print(len(charges), len(today), today &amp; yesterday, sorted(today - yesterday), 80 in today)

count = Counter(charges)
print(count[80], count[999], count.most_common(2))

by_band = defaultdict(list)            # price band 0 = under 100, 1 = 100-199, ...
for c in charges:
    by_band[c // 100].append(c)        # no "if key not in" check needed
print(dict(by_band))</div>
  <div class="fx" data-lang="text">0 False ['chai', 'dosa', 'idli']
30 {'chai': 25, 'poha': 15} 15 {'chai': 25, 'poha': 15}
8 7 {80, 310, 200} [40, 60, 120, 250] True
2 0 [(80, 2), (120, 1)]
{1: [120], 0: [80, 40, 80, 60], 2: [250, 200], 3: [310]}</div>
  <p>Line by line: <code>get</code> returned 0 for a missing dish; <code>setdefault</code> inserted poha only because it was missing. The 8 charges are 7 distinct amounts; today ∩ yesterday = {80, 200, 310}; amounts only today = 40, 60, 120, 250. <code>Counter</code> says 80 appears twice and a missing key reads 0. <code>defaultdict(list)</code> grouped the charges into price bands with no setup code.</p>
  <div class="cards">
    <div><b>dict</b><p><code>d[k]</code> raises KeyError if missing; <code>d.get(k, default)</code> does not. <code>setdefault(k, v)</code> inserts only if missing.</p><small>Insertion-ordered since 3.7</small></div>
    <div><b>set</b><p>Membership, de-duplication, set algebra: <code>&amp;</code> both, <code>|</code> either, <code>-</code> only left, <code>^</code> exactly one.</p><small><code>set(lst)</code> is O(n)</small></div>
    <div><b>Counter</b><p>A dict of counts. Missing keys read as 0. <code>most_common(k)</code>; <code>+</code>/<code>-</code> drop counts ≤ 0.</p><small><code>Counter(a) == Counter(b)</code> → anagram check</small></div>
    <div><b>defaultdict</b><p><code>defaultdict(list)</code> makes an empty list on first access; <code>defaultdict(int)</code> starts at 0.</p><small>⚠ Just reading <code>d[k]</code> creates the key</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Changing a dict's size while looping over it raises <code>RuntimeError: dictionary changed size during iteration</code>. Loop over <code>list(d)</code> (a copy of the keys) if you need to delete while looping.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Hashing: <b>771 Jewels and Stones</b> (set membership), <b>2215 Find the Difference of Two Arrays</b> (set minus), <b>383 Ransom Note</b> (Counter subtraction).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Two Sum.</b> The seen set answers "have I seen x?". The ₹280 combo asks something sharper: "have I seen the partner of x, and where?" That turns the set into a dict and gives the most famous interview pattern.</div>

  <h2 id="dsa-hs-twosum"><span class="num">08</span>Two Sum: Complement Lookup</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Arrays found the ₹280 combo either by trying all 28 pairs (O(n²)) or by sorting and walking two pointers, which reported sorted positions (2, 5) instead of the real orders. We want one pass over the <em>unsorted</em> charges that returns original positions.</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>two numbers that add up to</b> target", "pair with sum / difference k", "return their indices", "count pairs with…", array <b>not sorted</b>.</p>
  </div>
  <p>For each charge x, the partner it needs is <code>280 − x</code>. Instead of scanning for that partner (O(n) each), ask a dict of values seen so far (O(1)). Check first, then store x with its index, so x never pairs with itself.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>At a wedding, guests arrive one at a time wearing a half-heart badge. Each new guest asks the host's register: "has my other half arrived?" If yes, match found. If not, they write their own name in the register and wait.</p>
  </div>
<div class="fx" data-lang="py">def two_sum(charges, target):
    index_of = {}                         # value -&gt; index where we saw it
    for i, x in enumerate(charges):
        need = target - x                 # the partner x is waiting for
        hit = need in index_of
        print(f"i={i} x={x:3} need={need:4}  in dict? {'YES at ' + str(index_of[need]) if hit else 'no'}")
        if hit:
            return [index_of[need], i]
        index_of[x] = i                   # store AFTER checking (no self-pairing)
    return []

print(two_sum([120, 80, 250, 40, 310, 80, 60, 200], 280))</div>
  <div class="fx" data-lang="text">i=0 x=120 need= 160  in dict? no
i=1 x= 80 need= 200  in dict? no
i=2 x=250 need=  30  in dict? no
i=3 x= 40 need= 240  in dict? no
i=4 x=310 need= -30  in dict? no
i=5 x= 80 need= 200  in dict? no
i=6 x= 60 need= 220  in dict? no
i=7 x=200 need=  80  in dict? YES at 5
[5, 7]</div>
  <table class="tbl out"><caption>Trace: target 280 on the unsorted charges</caption>
    <tr><th>i</th><th>x</th><th>need = 280 − x</th><th>need in dict?</th><th>dict after</th></tr>
    <tr><td>0</td><td>120</td><td>160</td><td>no</td><td>{120: 0}</td></tr>
    <tr><td>1</td><td>80</td><td>200</td><td>no (200 comes later)</td><td>{…, 80: 1}</td></tr>
    <tr><td>2</td><td>250</td><td>30</td><td>no</td><td>{…, 250: 2}</td></tr>
    <tr><td>3</td><td>40</td><td>240</td><td>no</td><td>{…, 40: 3}</td></tr>
    <tr><td>4</td><td>310</td><td>−30</td><td>no</td><td>{…, 310: 4}</td></tr>
    <tr><td>5</td><td>80</td><td>200</td><td>no</td><td>80: 1 → <b>80: 5</b> (overwritten)</td></tr>
    <tr><td>6</td><td>60</td><td>220</td><td>no</td><td>{…, 60: 6}</td></tr>
    <tr><td>7</td><td>200</td><td>80</td><td><b>yes, at 5</b> → [5, 7]</td><td>—</td></tr>
  </table>
  <p>The pair is found when its <em>second</em> member arrives: 200 at index 7 asks for 80, last seen at 5. (Orders 1 and 7 are an equally valid answer; the dict kept only the latest 80.) Brute force vs dict on bigger days with no answer:</p>
<div class="fx" data-lang="py">import time, random
def two_sum_brute(nums, target):          # every pair: O(n^2)
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

def two_sum(nums, target):                # one pass with a dict: O(n)
    index_of = {}
    for i, x in enumerate(nums):
        if target - x in index_of:
            return [index_of[target - x], i]
        index_of[x] = i
    return []

random.seed(5)
for n in [1_000, 5_000]:
    data = [random.randrange(1, 10**6) * 2 for _ in range(n)]   # even only: no pair sums to 1
    t = time.perf_counter(); a = two_sum_brute(data, 1); t1 = time.perf_counter() - t
    t = time.perf_counter(); b = two_sum(data, 1); t2 = time.perf_counter() - t
    print(f"n={n:,}  brute {t1*1000:8.1f} ms   hash map {t2*1000:6.2f} ms   same: {a == b}")</div>
  <div class="fx" data-lang="text">n=1,000  brute     20.3 ms   hash map   0.18 ms   same: True
n=5,000  brute    512.3 ms   hash map   0.85 ms   same: True</div>
  <p>5× more items: brute force about 25× slower (O(n²)), dict about 5× (O(n)). At 5,000 the dict is about 600× faster.</p>
<div class="fx" data-lang="text">index_of = {}
for i, x in enumerate(a):
    if target - x in index_of: return [index_of[target - x], i]
    index_of[x] = i                 # store AFTER checking</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p><strong>O(n) time, O(n) space</strong>, one pass, unsorted input, original indexes. Compare: brute force O(n²)/O(1); sort + two pointers O(n log n)/O(1) but loses indexes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Storing before checking. If x is added first, then for target 160 the charge 80 would find "itself" and return [1, 1]. Check, then store.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Hashing: <b>1 Two Sum</b> (this trace), <b>1679 Max Number of K-Sum Pairs</b> (count of unmatched values instead of index), <b>454 4Sum II</b> (dict of pair sums). Also 1512 Number of Good Pairs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Counting &amp; Anagrams.</b> Two Sum stores one fact per value (its index). Many questions need <em>how many times</em> each value occurs: duplicates beyond the first, letter counts for anagrams, and later prefix totals.</div>

  <h2 id="dsa-hs-count"><span class="num">09</span>Counting &amp; Anagrams</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A set records "seen or not"; Two Sum's dict records one index. Neither tells us that 80 was charged twice, or whether "dosa" and "soda" use exactly the same letters. We need a value → count map.</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>anagram</b>", "same characters", "<b>most frequent</b>", "appears more than n/2 times", "first unique", "can you build X from Y", "top k".</p>
  </div>
  <p>Walk once; for each value do <code>count[x] = count.get(x, 0) + 1</code>. <code>Counter</code> does exactly this.</p>
<div class="fx" data-lang="py">from collections import Counter
charges = [120, 80, 250, 40, 310, 80, 60, 200]

freq = {}
for c in charges:
    freq[c] = freq.get(c, 0) + 1          # count by hand
print(freq)
print(Counter(charges) == freq, {c: n for c, n in freq.items() if n &gt; 1})</div>
  <div class="fx" data-lang="text">{120: 1, 80: 2, 250: 1, 40: 1, 310: 1, 60: 1, 200: 1}
True {80: 2}</div>
  <p>Two words are <strong>anagrams</strong> when every letter appears the same number of times in both. For lowercase letters a list of 26 counters is enough (index = letter − 'a'); compare the counts:</p>
<div class="fx" data-lang="py">from collections import Counter

def letter_counts(word):
    count = [0] * 26                      # one counter per letter a..z
    for ch in word:
        count[ord(ch) - ord("a")] += 1
    return {chr(i + ord("a")): n for i, n in enumerate(count) if n}

for a, b in [("dosa", "soda"), ("lemon", "melon"), ("naan", "nana"), ("chai", "chat")]:
    print(f"{a:5} {letter_counts(a)}  {b:5} {letter_counts(b)}  anagram: {Counter(a) == Counter(b)}")</div>
  <div class="fx" data-lang="text">dosa  {'a': 1, 'd': 1, 'o': 1, 's': 1}  soda  {'a': 1, 'd': 1, 'o': 1, 's': 1}  anagram: True
lemon {'e': 1, 'l': 1, 'm': 1, 'n': 1, 'o': 1}  melon {'e': 1, 'l': 1, 'm': 1, 'n': 1, 'o': 1}  anagram: True
naan  {'a': 2, 'n': 2}  nana  {'a': 2, 'n': 2}  anagram: True
chai  {'a': 1, 'c': 1, 'h': 1, 'i': 1}  chat  {'a': 1, 'c': 1, 'h': 1, 't': 1}  anagram: False</div>
  <table class="tbl out"><caption>Trace: "dosa" vs "soda" with one count array (+1 for the first word, −1 for the second)</caption>
    <tr><th>pair of letters</th><th>d</th><th>o</th><th>s</th><th>a</th></tr>
    <tr><td>start</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>d / s</td><td>+1</td><td>0</td><td>−1</td><td>0</td></tr>
    <tr><td>o / o</td><td>+1</td><td>0</td><td>−1</td><td>0</td></tr>
    <tr><td>s / d</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>a / a</td><td>0</td><td>0</td><td>0</td><td>0 → all zero: anagram</td></tr>
  </table>
<div class="fx" data-lang="text">count = {}
for x in items: count[x] = count.get(x, 0) + 1      # or Counter(items)
anagram(s, t) = len(s) == len(t) and Counter(s) == Counter(t)</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p>Counting is <strong>O(n) time</strong>; space O(distinct values), or O(1) for a fixed 26-letter array. Sorting both strings also detects anagrams, in O(n log n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing sets instead of counts: <code>set("naan") == set("nana")</code> is True but so is <code>set("aan") == set("nna")</code>, which are not anagrams. Counts, not presence.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Hashing: <b>242 Valid Anagram</b>, <b>383 Ransom Note</b>, <b>387 First Unique Character in a String</b>. Then 1189 Maximum Number of Balloons, 347-style top k in section 13.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Prefix Sum + Hash Map.</b> The Arrays note left one question open: how many stretches of consecutive orders have profit exactly k, when profits can be negative (so no sliding window)? Counting is the missing piece, applied to prefix totals.</div>

  <h2 id="dsa-hs-prefix"><span class="num">10</span>Prefix Sum + Hash Map</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Prefix sums give any stretch's total as P[j+1] − P[i], but trying all 36 stretches is O(n²). The sliding window fails because profits can be negative. How many stretches of the profit list total exactly ₹90, in one pass?</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>number of subarrays</b> with sum k", "longest subarray with sum k", "sum divisible by k", "equal number of 0s and 1s", negatives allowed.</p>
  </div>
  <p>The total of a stretch ending at j is (prefix up to j) − (prefix before its start). We want that to equal k, so at each position ask: <strong>how many earlier prefixes equal prefix − k?</strong> Each one is the start of a stretch that totals k. A dict of prefix → count answers in O(1). Start with <code>{0: 1}</code>: the empty prefix, so stretches that begin at index 0 are counted.</p>
  <div class="flow"><span>prefix += x</span><span>answer += count[prefix − k]</span><span>count[prefix] += 1</span><span>start with count[0] = 1</span></div>
<div class="fx" data-lang="py">def count_stretches(nums, k):
    seen = {0: 1}                         # prefix total -&gt; how many times seen; the empty prefix
    prefix = total = 0
    for i, x in enumerate(nums):
        prefix += x
        add = seen.get(prefix - k, 0)     # earlier prefixes that leave exactly k
        total += add
        seen[prefix] = seen.get(prefix, 0) + 1
        print(f"i={i} x={x:4} prefix={prefix:4} prefix-k={prefix - k:4} found {add}  total={total}  seen={seen}")
    return total

profit = [0, -40, 130, -80, 190, -40, -60, 80]    # charge - 120, from the Arrays note
print(count_stretches(profit, 90))</div>
  <div class="fx" data-lang="text">i=0 x=   0 prefix=   0 prefix-k= -90 found 0  total=0  seen={0: 2}
i=1 x= -40 prefix= -40 prefix-k=-130 found 0  total=0  seen={0: 2, -40: 1}
i=2 x= 130 prefix=  90 prefix-k=   0 found 2  total=2  seen={0: 2, -40: 1, 90: 1}
i=3 x= -80 prefix=  10 prefix-k= -80 found 0  total=2  seen={0: 2, -40: 1, 90: 1, 10: 1}
i=4 x= 190 prefix= 200 prefix-k= 110 found 0  total=2  seen={0: 2, -40: 1, 90: 1, 10: 1, 200: 1}
i=5 x= -40 prefix= 160 prefix-k=  70 found 0  total=2  seen={0: 2, -40: 1, 90: 1, 10: 1, 200: 1, 160: 1}
i=6 x= -60 prefix= 100 prefix-k=  10 found 1  total=3  seen={0: 2, -40: 1, 90: 1, 10: 1, 200: 1, 160: 1, 100: 1}
i=7 x=  80 prefix= 180 prefix-k=  90 found 1  total=4  seen={0: 2, -40: 1, 90: 1, 10: 1, 200: 1, 160: 1, 100: 1, 180: 1}
4</div>
  <table class="tbl out"><caption>Trace: profit [0, −40, 130, −80, 190, −40, −60, 80], k = 90</caption>
    <tr><th>i</th><th>x</th><th>prefix</th><th>prefix − 90</th><th>times seen before</th><th>total</th><th>stretches found</th></tr>
    <tr><td>0</td><td>0</td><td>0</td><td>−90</td><td>0</td><td>0</td><td>(prefix 0 now seen <b>twice</b>)</td></tr>
    <tr><td>1</td><td>−40</td><td>−40</td><td>−130</td><td>0</td><td>0</td><td></td></tr>
    <tr><td>2</td><td>130</td><td>90</td><td>0</td><td><b>2</b></td><td>2</td><td>[0, −40, 130] and [−40, 130]</td></tr>
    <tr><td>3</td><td>−80</td><td>10</td><td>−80</td><td>0</td><td>2</td><td></td></tr>
    <tr><td>4</td><td>190</td><td>200</td><td>110</td><td>0</td><td>2</td><td></td></tr>
    <tr><td>5</td><td>−40</td><td>160</td><td>70</td><td>0</td><td>2</td><td></td></tr>
    <tr><td>6</td><td>−60</td><td>100</td><td>10</td><td>1</td><td>3</td><td>[190, −40, −60]</td></tr>
    <tr><td>7</td><td>80</td><td>180</td><td>90</td><td>1</td><td>4</td><td>[−80, 190, −40, −60, 80]</td></tr>
  </table>
  <p>Four stretches. At i = 2 two were found at once, because prefix 0 had been seen twice (the empty prefix and after the ₹0-profit first order): that is why we store <em>counts</em>, not just "seen". A brute force over every stretch agrees:</p>
<div class="fx" data-lang="py">profit = [0, -40, 130, -80, 190, -40, -60, 80]
hits = [(i, j, profit[i:j + 1]) for i in range(8) for j in range(i, 8) if sum(profit[i:j + 1]) == 90]
for h in hits:
    print(h)</div>
  <div class="fx" data-lang="text">(0, 2, [0, -40, 130])
(1, 2, [-40, 130])
(3, 7, [-80, 190, -40, -60, 80])
(4, 6, [190, -40, -60])</div>
<div class="fx" data-lang="text">count = {0: 1}; prefix = answer = 0
for x in a:
    prefix += x
    answer += count.get(prefix - k, 0)
    count[prefix] = count.get(prefix, 0) + 1
# "longest" version: store the FIRST index of each prefix instead of a count</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p><strong>O(n) time, O(n) space</strong>, works with negatives. Brute force over all stretches: O(n²) with running sums.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>{0: 1}</code> misses every stretch that starts at index 0 (here 1 of the 4). Updating the count <em>before</em> looking up finds empty stretches when k = 0.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Hashing: <b>560 Subarray Sum Equals K</b> (this trace), <b>525 Contiguous Array</b> (0 → −1, then sum 0, longest), <b>974 Subarray Sums Divisible by K</b> (key = prefix % k).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Grouping by Key.</b> So far the key was the value itself (a charge, a prefix total). Some questions group items that are <em>different</em> but belong together: "lemon" and "melon", or ₹250 and ₹200 in the same price band.</div>

  <h2 id="dsa-hs-group"><span class="num">11</span>Grouping by Key</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's menu search wants dishes whose names are anagrams listed together, and finance wants charges bucketed by price band. The values differ, so using them directly as keys puts each in its own bucket. What key makes members of one group collide on purpose?</p>
  </div>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>group</b>", "bucket", "all strings that are anagrams / shifts of each other", "same pattern", "classify by…".</p>
  </div>
  <p>Turn each item into a <strong>canonical form</strong>: something that is identical for every member of a group and different across groups. For anagrams, the sorted letters ("lemon" and "melon" → "elmno"). For bands, the hundreds. Then <code>defaultdict(list)</code> on that key.</p>
<div class="fx" data-lang="py">from collections import defaultdict
dishes = ["lemon", "dosa", "melon", "tea", "soda", "naan", "eat"]

groups = defaultdict(list)
for d in dishes:
    key = "".join(sorted(d))              # canonical form: letters in order
    groups[key].append(d)
    print(f"{d:6} -&gt; key {key!r}")
print(dict(groups))

charges = [120, 80, 250, 40, 310, 80, 60, 200]
by_band = defaultdict(list)
for c in charges:
    by_band[f"{c // 100 * 100}-{c // 100 * 100 + 99}"].append(c)   # key: the price band
print(dict(by_band))</div>
  <div class="fx" data-lang="text">lemon  -&gt; key 'elmno'
dosa   -&gt; key 'ados'
melon  -&gt; key 'elmno'
tea    -&gt; key 'aet'
soda   -&gt; key 'ados'
naan   -&gt; key 'aann'
eat    -&gt; key 'aet'
{'elmno': ['lemon', 'melon'], 'ados': ['dosa', 'soda'], 'aet': ['tea', 'eat'], 'aann': ['naan']}
{'100-199': [120], '0-99': [80, 40, 80, 60], '200-299': [250, 200], '300-399': [310]}</div>
<div class="fx" data-lang="text">groups = defaultdict(list)
for item in items:
    groups[canonical(item)].append(item)     # sorted(word), tuple(counts), value // 100 ...
return list(groups.values())</div>
  <div class="callout def"><span class="label">Complexity</span>
    <p>n items × cost of the key: sorted letters O(k log k) per word → O(n·k log k); a 26-count tuple O(k) → O(n·k). Space O(n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using the count <em>list</em> as the key: lists are unhashable. Convert with <code>tuple(count)</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Hashing: <b>49 Group Anagrams</b>, <b>2342 Max Sum of a Pair With Equal Sum of Digits</b> (key = digit sum), <b>2352 Equal Row and Column Pairs</b> (key = tuple(row)).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing the Pattern.</b> Five patterns, all one dict apart. Facing a new problem, which one fits, and are there hashing ideas that don't look like any of them?</div>

  <h2 id="dsa-hs-patterns"><span class="num">12</span>Choosing the Pattern</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each pattern was introduced with a question built for it. A new problem will not say which one. We need a way from the wording to the pattern, plus the few hashing ideas the tracker uses that we have not met yet.</p>
  </div>
  <p>Almost every hashing trick is the same move: <strong>instead of searching again, remember what you've seen</strong>. You pay O(n) memory to save an O(n) inner loop. What you remember decides the pattern:</p>
  <table class="tbl">
    <tr><th>Signal</th><th>Store</th><th>Pattern (section)</th><th>Example problems</th></tr>
    <tr><td>"seen before?", "duplicate", "within k"</td><td>set of values (or value → last index)</td><td>Seen set (01)</td><td>Contains Duplicate I/II, Happy Number</td></tr>
    <tr><td>"pair with sum / difference"</td><td>dict value → index / count</td><td>Complement lookup (08)</td><td>Two Sum, K-Sum Pairs, 4Sum II</td></tr>
    <tr><td>"same letters / counts", "most frequent"</td><td>Counter or [0]*26</td><td>Frequency count (09)</td><td>Valid Anagram, Ransom Note, Top K</td></tr>
    <tr><td>"subarray sum = k" (negatives)</td><td>dict prefix → count / first index</td><td>Prefix + map (10)</td><td>Subarray Sum Equals K, Contiguous Array</td></tr>
    <tr><td>"group together"</td><td>defaultdict(list) on canonical key</td><td>Group by key (11)</td><td>Group Anagrams, equal digit sums</td></tr>
    <tr><td>"same pattern", "isomorphic"</td><td>two dicts, a → b and b → a</td><td>Two-way mapping</td><td>Isomorphic Strings, Word Pattern</td></tr>
    <tr><td>values 1..n, "O(1) extra space"</td><td>the array itself: index = key, sign = mark</td><td>Index as key</td><td>Find All Numbers Disappeared, First Missing Positive</td></tr>
    <tr><td>"longest run of consecutive values"</td><td>set; start only at run beginnings</td><td>Seen set (13.7)</td><td>Longest Consecutive Sequence</td></tr>
  </table>
  <p>The two new ones in code. <strong>Two-way mapping</strong>: "egg" → "add" works because e↔a and g↔d both ways; "ab" → "aa" fails because a and b would both map to a. <strong>Index as key</strong>: when values are 1..n, the array can be its own hash table: mark value v by making position v − 1 negative; positions still positive are missing values.</p>
<div class="fx" data-lang="py">def same_pattern(a, b):                 # two-way mapping: a letter must always map to the same letter, both ways
    if len(a) != len(b):
        return False
    fwd, back = {}, {}
    for x, y in zip(a, b):
        if fwd.setdefault(x, y) != y or back.setdefault(y, x) != x:
            return False
    return True

def missing_numbers(nums):              # values 1..n: use the INDEX as the key, mark by negating
    for x in nums:
        i = abs(x) - 1
        nums[i] = -abs(nums[i])
    return [i + 1 for i, x in enumerate(nums) if x &gt; 0]

print(same_pattern("egg", "add"), same_pattern("foo", "bar"), same_pattern("ab", "aa"))
print(missing_numbers([4, 3, 2, 7, 8, 2, 3, 1]))</div>
  <div class="fx" data-lang="text">True False False
[5, 6]</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Ask "what would I need to search for again?" and store exactly that, keyed by what you will search with: the value (seen set), the partner's value (Two Sum), the count (anagrams), the prefix total (sum = k), the canonical form (grouping).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for a dict when order matters. Hash maps answer exact-match questions; "next bigger key", "all keys between 10 and 20" or "smallest so far" need sorting, a heap or a tree.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Hashing: <b>205 Isomorphic Strings</b>, <b>290 Word Pattern</b> (two-way mapping), <b>448 Find All Numbers Disappeared in an Array</b> (index as key).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> Patterns are templates; interview problems add edge cases (empty input, duplicates, all equal) and follow-ups (top k, O(n) without sorting). Seven classics, tested.</div>

  <h2 id="dsa-hs-problems"><span class="num">13</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We traced each pattern on Biteful's data. The LeetCode versions add their own examples and corner cases, and two of them (Top K, Longest Consecutive) need an extra idea on top of the dict.</p>
  </div>
  <h3>1. Contains Duplicate</h3>
  <p>Does any value appear twice? <code>[1, 2, 3, 1]</code> → True. Brute force compares all pairs, O(n²). Sorting then checking neighbours is O(n log n). A seen set (section 01) is O(n).</p>
<div class="fx" data-lang="py">def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True               # met it before
        seen.add(x)
    return False

for nums in [[1, 2, 3, 1], [1, 2, 3, 4], [], [7, 7]]:
    print(nums, "-&gt;", contains_duplicate(nums), len(set(nums)) != len(nums))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 1] -&gt; True True
[1, 2, 3, 4] -&gt; False False
[] -&gt; False False
[7, 7] -&gt; True True</div>
  <p>Time O(n), space O(n). The one-liner <code>len(set(nums)) != len(nums)</code> is also O(n) but always reads the whole list; the loop stops at the first repeat.</p>

  <h3>2. Valid Anagram</h3>
  <p>Are two strings made of exactly the same letters? <code>"anagram"</code>, <code>"nagaram"</code> → True. Sorting both is O(n log n). Counting (section 09) is O(n).</p>
<div class="fx" data-lang="py">from collections import Counter

def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26                  # one counter per letter a..z
    for a, b in zip(s, t):
        count[ord(a) - ord("a")] += 1
        count[ord(b) - ord("a")] -= 1
    return all(c == 0 for c in count)

for s, t in [("anagram", "nagaram"), ("rat", "car"), ("", ""), ("ab", "a"), ("aacc", "ccac")]:
    print(repr(s), repr(t), "-&gt;", is_anagram(s, t), Counter(s) == Counter(t))</div>
  <div class="fx" data-lang="text">'anagram' 'nagaram' -&gt; True True
'rat' 'car' -&gt; False False
'' '' -&gt; True True
'ab' 'a' -&gt; False False
'aacc' 'ccac' -&gt; False False</div>
  <p>Time O(n), space O(1) (26 counters, fixed). <code>Counter(s) == Counter(t)</code> is the readable version and also handles Unicode; mention both. The length check catches <code>"ab"</code> vs <code>"a"</code> early.</p>

  <h3>3. Two Sum</h3>
  <p>Unsorted <code>[2, 7, 11, 15]</code>, target 9 → indices <code>[0, 1]</code>. The complement dict of section 08.</p>
<div class="fx" data-lang="py">def two_sum(nums, target):
    index_of = {}                     # value -&gt; index where we saw it
    for i, x in enumerate(nums):
        need = target - x             # the partner x is waiting for
        if need in index_of:
            return [index_of[need], i]
        index_of[x] = i               # store AFTER checking (no self-pairing)
    return []

for nums, t in [([2, 7, 11, 15], 9), ([3, 2, 4], 6), ([3, 3], 6), ([1, 2], 7)]:
    print(nums, t, "-&gt;", two_sum(nums, t))</div>
  <div class="fx" data-lang="text">[2, 7, 11, 15] 9 -&gt; [0, 1]
[3, 2, 4] 6 -&gt; [1, 2]
[3, 3] 6 -&gt; [0, 1]
[1, 2] 7 -&gt; []</div>
  <p>Time O(n), space O(n). <code>[3, 3]</code> works because the first 3 is stored before the second one asks; duplicates overwrite the index, which is fine since we only need one valid pair.</p>

  <h3>4. Group Anagrams</h3>
  <p><code>["eat", "tea", "tan", "ate", "nat", "bat"]</code> → <code>[["eat","tea","ate"], ["tan","nat"], ["bat"]]</code>. Section 11, with both key styles.</p>
<div class="fx" data-lang="py">from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = "".join(sorted(w))      # "eat", "tea", "ate" -&gt; "aet"
        groups[key].append(w)
    return list(groups.values())

def group_anagrams_count(words):      # O(n·k) key, no sorting
    groups = defaultdict(list)
    for w in words:
        count = [0] * 26
        for ch in w:
            count[ord(ch) - ord("a")] += 1
        groups[tuple(count)].append(w)   # list is unhashable, tuple is fine
    return list(groups.values())

for words in [["eat", "tea", "tan", "ate", "nat", "bat"], [""], ["a"]]:
    print(words, "-&gt;", group_anagrams(words))</div>
  <div class="fx" data-lang="text">['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] -&gt; [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
[''] -&gt; [['']]
['a'] -&gt; [['a']]</div>
  <p>For n words of length up to k: sorted key O(n · k log k); count-tuple key O(n · k). <code>tuple(count)</code>: the list cannot be a key, the tuple can. Both versions give the same groups on every test.</p>

  <h3>5. Top K Frequent Elements</h3>
  <p><code>[1, 1, 1, 2, 2, 3]</code>, k = 2 → <code>[1, 2]</code>. Count with a Counter, then pick the k biggest counts. The <a class="xref" data-note="dsa_heaps">Heaps</a> note solves the second step with a heap in O(n log k). Here is the O(n) <strong>bucket</strong> version: a count can't exceed n, so put each value in a list indexed by its count and read from the top.</p>
<div class="fx" data-lang="py">from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)                         # value -&gt; frequency
    buckets = [[] for _ in range(len(nums) + 1)]  # index = frequency
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(nums), 0, -1):             # highest frequency first
        for x in buckets[c]:
            out.append(x)
            if len(out) == k:
                return out
    return out

for nums, k in [([1, 1, 1, 2, 2, 3], 2), ([1], 1), ([4, 4, 5, 5, 5, 6, 6, 6, 6], 2)]:
    print(nums, k, "-&gt;", top_k_frequent(nums, k), [x for x, _ in Counter(nums).most_common(k)])</div>
  <div class="fx" data-lang="text">[1, 1, 1, 2, 2, 3] 2 -&gt; [1, 2] [1, 2]
[1] 1 -&gt; [1] [1]
[4, 4, 5, 5, 5, 6, 6, 6, 6] 2 -&gt; [6, 5] [6, 5]</div>
  <p>Time O(n), space O(n). <code>Counter.most_common(k)</code> is the library one-liner. Interviewers like hearing all three: sort O(n log n), heap O(n log k), buckets O(n).</p>

  <h3>6. Subarray Sum Equals K</h3>
  <p>Count contiguous subarrays that sum to k. <code>[1, 1, 1]</code>, k = 2 → 2. Section 10's pattern.</p>
<div class="fx" data-lang="py">def subarray_sum(nums, k):
    seen = {0: 1}                     # prefix sum -&gt; how many times seen; empty prefix
    prefix = 0
    total = 0
    for x in nums:
        prefix += x
        total += seen.get(prefix - k, 0)   # earlier prefixes that leave exactly k
        seen[prefix] = seen.get(prefix, 0) + 1
    return total

for nums, k in [([1, 1, 1], 2), ([1, 2, 3], 3), ([1, -1, 0], 0), ([3, 4, 7, 2, -3, 1, 4, 2], 7)]:
    print(nums, k, "-&gt;", subarray_sum(nums, k))</div>
  <div class="fx" data-lang="text">[1, 1, 1] 2 -&gt; 2
[1, 2, 3] 3 -&gt; 2
[1, -1, 0] 0 -&gt; 3
[3, 4, 7, 2, -3, 1, 4, 2] 7 -&gt; 4</div>
  <p>Time O(n), space O(n). <code>[1, -1, 0]</code>, k = 0 has three answers: <code>[1, -1]</code>, <code>[0]</code> and <code>[1, -1, 0]</code>, which a sliding window would miss.</p>

  <h3>7. Longest Consecutive Sequence</h3>
  <p><code>[100, 4, 200, 1, 3, 2]</code> → 4 (the run 1, 2, 3, 4), in O(n). Sorting would be O(n log n), so the problem forbids it. Put everything in a set. Only start counting from a number <code>x</code> that has no <code>x − 1</code> in the set: it is the beginning of a run. Then walk <code>x + 1, x + 2, …</code> while they exist.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Students with roll numbers stand in a hall in random order. Only the student whose "roll − 1" is absent shouts "I'm a start!" and counts upward. Nobody in the middle of a block starts counting, so no one is counted twice.</p>
  </div>
<div class="fx" data-lang="py">def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:            # x starts a run (nothing just before it)
            y = x
            while y + 1 in s:         # walk the run forward
                y += 1
            best = max(best, y - x + 1)
    return best

for nums in [[100, 4, 200, 1, 3, 2], [0, 3, 7, 2, 5, 8, 4, 6, 0, 1], [], [1, 2, 0, 1]]:
    print(nums, "-&gt;", longest_consecutive(nums))</div>
  <div class="fx" data-lang="text">[100, 4, 200, 1, 3, 2] -&gt; 4
[0, 3, 7, 2, 5, 8, 4, 6, 0, 1] -&gt; 9
[] -&gt; 0
[1, 2, 0, 1] -&gt; 3</div>
  <p>There is a <code>while</code> inside a <code>for</code>, yet it is O(n): the inner walk runs only from run starts, and each number is walked over at most once in total. Loop over the <em>set</em>, not the list, so duplicates don't restart the same run. All seven solutions were checked against brute force on hundreds of random inputs.</p>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The ideas are simple; the bugs are small and repeat across problems. One checklist.</div>

  <h2 id="dsa-hs-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section flagged a trap. Before an interview, you want them all in one place to scan your own code against.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: membership on a list</span>
    <p><code>if x in my_list</code> inside a loop is O(n) per check, O(n²) total. Convert once: <code>s = set(my_list)</code>, then <code>x in s</code> is O(1).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mutable keys</span>
    <p>Lists, sets and dicts can't be keys. Convert to <code>tuple</code> / <code>frozenset</code>. Never mutate an object that is already a key in a way that changes its hash.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: storing before checking in Two Sum</span>
    <p>If you add x before looking up <code>target − x</code>, then x can match itself. Check first, store after.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting count[0] = 1 in prefix-sum counting</span>
    <p>Without the empty prefix, every subarray starting at index 0 is missed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: defaultdict creating keys by reading</span>
    <p><code>if d[k]:</code> on a defaultdict inserts k with a default value. Use <code>k in d</code> or <code>d.get(k)</code> to look without creating.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: relying on set order or hash values</span>
    <p>Set iteration order is arbitrary and string hashes change between runs. Sort the output if order matters. Dicts keep insertion order, but that is not sorted order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: claiming guaranteed O(1)</span>
    <p>Say "O(1) on average, O(n) worst case when many keys collide". Space is O(n) too; mention it when trading memory for speed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture of how every piece of this note grew from "is x already seen?".</div>

  <h2 id="dsa-hs-connect"><span class="num">15</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Seen set, hash function, collisions, load factor, the from-scratch table, hashability, the toolbox and five patterns: how is each built from the one before, and what did each compute on Biteful's charges?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-hs-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">"seen before?"</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">list scan O(n) per check</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">hash → slot</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">310 % 8 = 6</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">collisions + resizing</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">probe; grow at 2/3 → O(1) avg</text>
<line x1="555" y1="54" x2="555" y2="86" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="ft st"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">hashable keys</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">hash must never change</text>
<line x1="460" y1="110" x2="422" y2="110" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="ft st"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">dict · set · Counter</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">what we store per key</text>
<line x1="280" y1="132" x2="105" y2="168" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<line x1="310" y1="132" x2="260" y2="168" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<line x1="350" y1="132" x2="410" y2="168" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<line x1="380" y1="132" x2="565" y2="168" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<rect x="10" y="170" width="150" height="50" rx="7" class="fg sg"/><text x="85" y="190" text-anchor="middle" font-size="11" font-weight="700">seen set</text><text x="85" y="207" text-anchor="middle" class="tm" font-size="10">80 again at i = 5</text>
<rect x="175" y="170" width="150" height="50" rx="7" class="fg sg"/><text x="250" y="190" text-anchor="middle" font-size="11" font-weight="700">Two Sum</text><text x="250" y="207" text-anchor="middle" class="tm" font-size="10">value → index: [5, 7]</text>
<rect x="340" y="170" width="150" height="50" rx="7" class="fg sg"/><text x="415" y="190" text-anchor="middle" font-size="11" font-weight="700">counting</text><text x="415" y="207" text-anchor="middle" class="tm" font-size="10">value → count: 80 × 2</text>
<rect x="505" y="170" width="145" height="50" rx="7" class="fg sg"/><text x="577" y="190" text-anchor="middle" font-size="11" font-weight="700">grouping</text><text x="577" y="207" text-anchor="middle" class="tm" font-size="10">key → list: "elmno"</text>
<line x1="415" y1="220" x2="415" y2="244" stroke="currentColor" marker-end="url(#dsa-hs-a9)"/>
<rect x="250" y="246" width="330" height="46" rx="7" class="fv"/><text x="415" y="265" text-anchor="middle" font-size="11.5" font-weight="700">prefix sum + count</text><text x="415" y="282" text-anchor="middle" class="tm" font-size="10">count prefix totals: 4 profit stretches = ₹90 (from Arrays' P)</text>
</svg><figcaption>A slow question forces the hash table; the table's mechanics (slots, collisions, resizing) give O(1) on one condition (hashable keys). The four green patterns differ only in what is stored per key; counting applied to prefix totals closes the gap the Arrays note left open.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's charges / profits</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Seen set</td><td>set membership</td><td>is x already seen?</td><td>repeat 80 at i = 5 after 6 checks</td><td>duplicates, visited states</td></tr>
    <tr><td>Hash function &amp; slots</td><td>hash(key) % size</td><td>where does a key live?</td><td>310 → 6; 120, 80, 40, 200 → 0</td><td>(inside every dict/set)</td></tr>
    <tr><td>Collisions</td><td>slots + probe rule</td><td>two keys, one slot?</td><td>200 probed 0 → 5 (6 looks)</td><td>explaining worst case</td></tr>
    <tr><td>Load factor &amp; resize</td><td>items/slots + rehash</td><td>when to grow?</td><td>6 in 8 &gt; 2/3 → 16 slots</td><td>amortised O(1) argument</td></tr>
    <tr><td>From-scratch map</td><td>all of the above + tombstones</td><td>what do put/get/delete do?</td><td>200 → slot 11 after resize; get(80) = 5</td><td>Design HashMap</td></tr>
    <tr><td>Hashable keys</td><td>hash contract</td><td>what can be a key?</td><td>("lunch", 2) ok; [80, 200] TypeError</td><td>choosing keys</td></tr>
    <tr><td>Toolbox</td><td>dict/set API</td><td>daily operations?</td><td>today ∩ yesterday = {80, 200, 310}</td><td>all code</td></tr>
    <tr><td>Two Sum</td><td>dict value → index</td><td>pair summing to T, unsorted?</td><td>280 → [5, 7]</td><td>pairs with original indexes</td></tr>
    <tr><td>Counting</td><td>dict value → count</td><td>how many of each?</td><td>80 → 2; dosa/soda anagrams</td><td>anagrams, top k, frequency</td></tr>
    <tr><td>Prefix + map</td><td>Arrays' prefix sums + counting</td><td>how many stretches sum to k?</td><td>k = 90 → 4 stretches</td><td>subarray sums, negatives</td></tr>
    <tr><td>Grouping</td><td>dict canonical key → list</td><td>which items belong together?</td><td>lemon/melon, dosa/soda, tea/eat</td><td>anagram groups, bucketing</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a hash table lets a key compute where it lives, so "have I seen it?" costs O(1); every pattern is that question with a different key (the value, its partner, a prefix total, a canonical form) and a different thing stored (presence, index, count, list).</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_linkedlist">Linked Lists</a>: a dict finds a cached order instantly but cannot say which one is oldest or move one to the front. Order with O(1) moves needs nodes and pointers; dict + linked list = the LRU cache.</div>

  <h2 id="dsa-hs-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b>; profit (charge − 120) <b>[0, −40, 130, −80, 190, −40, −60, 80]</b>; dishes lemon, dosa, melon, tea, soda, naan, eat.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Seen set</td><td>already seen?</td><td>80 repeated at i = 5</td><td>how does a set find things?</td></tr>
    <tr><td>Hash &amp; slots</td><td>key → position?</td><td>310 % 8 = 6</td><td>120, 80, 40, 200 all → 0</td></tr>
    <tr><td>Collisions</td><td>two keys, one slot?</td><td>linear probing: 200 → slot 5</td><td>crowding</td></tr>
    <tr><td>Load factor</td><td>when to grow?</td><td>&gt; 2/3 → 16 slots</td><td>build it to be sure</td></tr>
    <tr><td>From scratch</td><td>put/get/delete?</td><td>update 80 → 5; tombstone for 250</td><td>which keys allowed?</td></tr>
    <tr><td>Hashable</td><td>what can be a key?</td><td>tuple yes, list no; 1 = 1.0 = True</td><td>daily API?</td></tr>
    <tr><td>Toolbox</td><td>get, sets, Counter, defaultdict</td><td>∩ = {80, 200, 310}</td><td>pairs?</td></tr>
    <tr><td>Two Sum</td><td>pair = 280, unsorted?</td><td>[5, 7]</td><td>need counts</td></tr>
    <tr><td>Counting</td><td>how many of each?</td><td>80 × 2; dosa = soda</td><td>stretches with sum k?</td></tr>
    <tr><td>Prefix + map</td><td>stretches summing to 90?</td><td>4</td><td>group different items</td></tr>
    <tr><td>Grouping</td><td>what belongs together?</td><td>elmno: lemon, melon</td><td>→ order needs Linked Lists</td></tr>
  </table>
  <h3>Rules and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Slot</td><td>slot = hash(key) mod m</td><td>m = number of slots (power of 2 in CPython); hash(int) = int</td></tr>
    <tr><td>Linear probe</td><td>i → (i + 1) mod m until empty or found</td><td>CPython: perturbed jumps instead</td></tr>
    <tr><td>Load factor</td><td>α = n / m; resize when α ≥ 2/3</td><td>n = stored keys (+ tombstones)</td></tr>
    <tr><td>Cost</td><td>get/put/delete O(1) average, O(n) worst</td><td>put O(1) amortised (resizes)</td></tr>
    <tr><td>Hash contract</td><td>a == b ⇒ hash(a) == hash(b)</td><td>hash must not change while stored</td></tr>
    <tr><td>Two Sum</td><td>need = T − x; check, then store x → i</td><td>T = target</td></tr>
    <tr><td>Prefix + map</td><td>ans += count[P − k]; count[P] += 1; count = {0: 1}</td><td>P = running prefix total</td></tr>
    <tr><td>Grouping</td><td>groups[canonical(item)].append(item)</td><td>sorted letters, tuple of counts, value // 100</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a set</b><p>"Seen before?", duplicates, visited states, intersections.</p><small>Not when you need counts or order</small></div>
    <div><b>Use a dict</b><p>Lookup by key, value → index, counts, prefix totals, groups.</p><small>Not for range or "next bigger" queries</small></div>
    <div><b>Use Counter / defaultdict</b><p>Frequencies and top-k; grouping into lists.</p><small>Reading a missing key of a defaultdict inserts it</small></div>
    <div><b>Use sorting / two pointers instead</b><p>When O(1) extra space is required or the data is already sorted.</p><small>Costs O(n log n) and loses indexes</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p><code>x in list</code> in a loop; lists as keys; store-before-check in Two Sum; missing <code>{0: 1}</code>; sets instead of counts for anagrams; relying on set order or <code>hash()</code> across runs; "O(1)" without "average"; deleting by emptying a slot in open addressing; changing a dict while iterating.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Slot of 250 in an 8-slot table?</td><td>250 % 8 = 2</td></tr>
    <tr><td>Two Sum on the charges, target 280: at which i is the pair found?</td><td>i = 7 (200 needs 80, last seen at 5) → [5, 7]</td></tr>
    <tr><td>Why start prefix counting with {0: 1}?</td><td>The empty prefix, so stretches starting at index 0 are counted</td></tr>
    <tr><td>Canonical key for "melon"?</td><td>"elmno" (sorted letters), same as "lemon"</td></tr>
    <tr><td><code>{1: "a", 1.0: "b", True: "c"}</code>?</td><td><code>{1: 'c'}</code>: one key, last value</td></tr>
  </table>

  <h2 id="dsa-hs-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does a hash map find a key in O(1) on average?</summary><div class="qa-body">It computes <code>hash(key)</code>, reduces it to a slot index (<code>% size</code>, or a bitmask when size is a power of 2) and jumps to that array slot directly. With a good hash and a low load factor only one or two slots are checked, regardless of how many keys are stored.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a collision and what are the two main ways to handle it?</summary><div class="qa-body">Two different keys mapping to the same slot (120 and 80 both → 0 in 8 slots). <strong>Chaining</strong>: each slot holds a list of entries. <strong>Open addressing</strong>: one entry per slot; on a clash, probe other slots in a fixed sequence until a free slot or the key is found.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which does CPython's dict use, and how does it probe?</summary><div class="qa-body">Open addressing. The table size is a power of 2. On a clash it uses a recurrence like <code>i = (5*i + 1 + perturb) &amp; mask</code>, with <code>perturb</code> starting as the full hash and shifted right 5 bits each step, so high hash bits influence the path and clustering stays low.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you just mark a deleted slot as empty in open addressing?</summary><div class="qa-body">A search stops at the first empty slot. Keys placed after the deleted one in the same probe chain (40 after 80 in our table) would become unreachable. A tombstone means "nothing here, but keep probing"; inserts can reuse it and a resize removes them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the load factor and why does the table resize?</summary><div class="qa-body">Items ÷ slots. As it rises, probe chains get longer. CPython's dict grows when about 2/3 full: it allocates a bigger table and re-inserts every key (positions change because the size changed). Each resize is O(n), but they are rare, so insert is O(1) amortised.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes an object hashable? Why can't a list be a key?</summary><div class="qa-body">It has a <code>__hash__</code> whose value never changes during its lifetime, and an <code>__eq__</code> consistent with it. A list is mutable: if it changed after insertion, its hash would change and the dict would look in the wrong slot. Use <code>tuple(lst)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>{1: "a", 1.0: "b", True: "c"}</code> evaluate to?</summary><div class="qa-body"><code>{1: 'c'}</code>. The three keys are equal and hash the same, so they are one key. The first-inserted key object (1) is kept and the value is overwritten each time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the Two Sum hashmap solution and its complexity.</summary><div class="qa-body">Walk once; for each x compute <code>need = target − x</code>. If need is in the dict of earlier values → return both indices. Otherwise store x → index. Checking before storing prevents pairing x with itself. O(n) time, O(n) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two ways to build a key for Group Anagrams, and their costs?</summary><div class="qa-body">Sorted letters <code>"".join(sorted(w))</code>: O(k log k) per word. Count tuple <code>tuple(26 counts)</code>: O(k) per word. Total O(n·k log k) vs O(n·k). The count must be a tuple, since a list is unhashable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Longest Consecutive Sequence runs a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body">The inner walk starts only at numbers with no predecessor in the set, i.e. run beginnings. Each number belongs to exactly one run and is stepped over once by that run's walk. Total inner steps ≤ n, plus n outer checks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top K Frequent: compare three approaches.</summary><div class="qa-body">After counting with a Counter (O(n)): sort by count O(n log n); a size-k heap O(n log k); bucket sort by frequency O(n), since a frequency is between 1 and n. <code>Counter.most_common(k)</code> is the one-liner.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a sorted structure over a hash map?</summary><div class="qa-body">When you need order: min/max, range queries ("all keys between 10 and 20"), the next bigger key, or sorted iteration. Also when a guaranteed worst case (O(log n) balanced tree) matters more than average O(1). Hash maps are best for exact-match lookups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Subarray Sum Equals K need both prefix sums (Arrays) and a hash map?</summary><div class="qa-body">Prefix sums turn "stretch i..j sums to k" into "P[j+1] − P[i] = k", i.e. "an earlier prefix equals P − k". That still needs a search over earlier prefixes; the dict of prefix counts makes each search O(1). Without prefix sums there is nothing to look up; without the dict each lookup is O(n). Together: O(n), negatives allowed (4 stretches of ₹90 on our profits).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did we have to learn load factor and resizing before claiming the patterns are O(n)?</summary><div class="qa-body">Every pattern does n inserts and n lookups. They are O(1) only while probe chains stay short, which needs the table to stay under ~2/3 full; growing keeps it there, and amortised analysis shows the occasional O(n) rebuild averages to O(1). Without that, a crowded table (like our 7 keys in 8 slots) would make each operation drift towards O(n) and the patterns towards O(n²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you use a set where a count is needed?</summary><div class="qa-body">A set only says "present". Anagram checks would accept "aan" vs "nna"; prefix-sum counting would find only 1 stretch at i = 2 instead of 2 (prefix 0 had been seen twice). Whenever multiplicity matters, store counts in a dict/Counter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: Two Sum with two pointers (Arrays) vs with a dict: when is each the right choice?</summary><div class="qa-body">Two pointers: input already sorted (or original positions don't matter) and O(1) extra space is wanted: O(n) after an O(n log n) sort. Dict: unsorted input and original indexes needed: O(n) time but O(n) space. On the charges the dict gave real orders [5, 7]; two pointers gave sorted positions (2, 5).</div></details>
</main>
`
});
