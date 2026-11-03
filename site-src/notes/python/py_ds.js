// notes/python/py_ds.js — Choosing a Collection
Object.assign(TOPIC_CONTENT, {
  "py_ds": `<main>
<h1>Choosing a Collection</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Choosing a Collection</span></div>
  <p class="lead">Python ships a handful of built-in containers (list, tuple, dict, set, str) and a standard-library toolbox around them (<code>collections</code>, <code>heapq</code>, <code>bisect</code>, <code>array</code>). They differ on a few properties: ordered or not, mutable or not, duplicates or not, hashable or not, and which operations are O(1). Picking the wrong one rarely breaks correctness; it breaks performance, typically a membership test on a list inside a loop or a list used as a queue, which turns linear code quadratic. Interviewers probe exactly this ("which data structure would you use and why?"), and in DS/ML and backend code the choice decides whether a script handles a million rows in seconds or hours. Code here was run on Python 3.13.</p>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Choosing a Collection</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Sequences</div>
        <ul>
          <li><b>list</b>: ordered, mutable, duplicates; dynamic array of references</li>
          <li><b>tuple</b>: ordered, immutable; hashable if items are</li>
          <li><b>str</b>: immutable sequence of code points</li>
          <li>Index O(1); <code>in</code> O(n)</li>
          <li>list append/pop at end O(1)*; front O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hash-based</div>
        <ul>
          <li><b>dict</b>: key → value, keys unique + hashable, insertion-ordered</li>
          <li><b>set</b>: unique hashable items, no order</li>
          <li><b>frozenset</b>: immutable, hashable set</li>
          <li>get/set/del/<code>in</code> O(1) average, O(n) worst</li>
          <li>No positions: <code>s[0]</code> → TypeError</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">collections</div>
        <ul>
          <li><b>deque</b>: O(1) both ends; <code>maxlen</code> window; O(n) middle</li>
          <li><b>Counter</b>: counts, <code>most_common</code></li>
          <li><b>defaultdict</b>: missing key → <code>factory()</code></li>
          <li><b>OrderedDict</b>: <code>move_to_end</code>, order-aware ==</li>
          <li><b>namedtuple</b>, <b>ChainMap</b> (layered lookups)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">heapq &amp; bisect</div>
        <ul>
          <li><b>heapq</b>: min-heap on a list; push/pop O(log n); heapify O(n)</li>
          <li>Top-k: <code>nlargest(k, xs)</code> O(n log k)</li>
          <li>Max-heap: push negated keys</li>
          <li><b>bisect</b>: binary search on sorted list O(log n); insort O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Arrays</div>
        <ul>
          <li>list = pointers to boxed objects (~32 B per float)</li>
          <li><b>array.array</b>: typed C values, 8 B per double</li>
          <li><b>numpy</b>: typed + vectorised ops in C</li>
          <li>Numeric bulk work → numpy / pandas</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing</div>
        <ul>
          <li>Lookup by key → dict · seen? / unique → set</li>
          <li>Fixed record / composite key → tuple</li>
          <li>Ordered, growing → list · queue → deque</li>
          <li>Priority / top-k → heapq · sorted search → bisect</li>
          <li>⚠ <code>in</code> on a list inside a loop = O(n·m)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-props"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Built-in Containers Compared</span><span class="rm-sub">Ordered, mutable, duplicates, hashable, indexed</span></div></div>
      <div class="rm-item rm-done" data-target="pc-bigo"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Big-O of Common Operations</span><span class="rm-sub">list, tuple, dict, set, deque side by side</span></div></div>
      <div class="rm-item rm-done" data-target="pc-choose"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How to Choose</span><span class="rm-sub">Decision guide and nested shapes</span></div></div>
      <div class="rm-item rm-done" data-target="pc-deque"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">collections.deque</span><span class="rm-sub">Queues, sliding windows, BFS</span></div></div>
      <div class="rm-item rm-done" data-target="pc-coll"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The collections Module</span><span class="rm-sub">Counter, defaultdict, OrderedDict, namedtuple, ChainMap</span></div></div>
      <div class="rm-item rm-done" data-target="pc-heap"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">heapq &amp; bisect</span><span class="rm-sub">Priority queues, top-k, sorted search</span></div></div>
      <div class="rm-item rm-done" data-target="pc-array"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Arrays vs Lists</span><span class="rm-sub">array module, NumPy, memory</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Wrong container, hidden O(n²)</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Property and Big-O tables, decision rules</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">18 questions on data-structure choice</span></div></div>
    </div>
  </div>

  <h2 id="pc-props"><span class="num">01</span>Built-in Containers Compared</h2>
  <p>Every container choice comes down to a few yes/no properties. Is it <strong>ordered</strong> (does it remember positions)? Is it <strong>mutable</strong>? Does it allow <strong>duplicates</strong>? Is it <strong>hashable</strong> (can it be a dict key or set member)? Can you <strong>index</strong> it by position? Python can answer some of these directly:</p>
  <div class="fx" data-lang="py">samples = {
    "list":      [3, 1, 3],
    "tuple":     (3, 1, 3),
    "set":       {3, 1, 3},
    "frozenset": frozenset({3, 1, 3}),
    "dict":      {"a": 3, "b": 1},
    "str":       "313",
}
for kind, obj in samples.items():
    try:
        hash(obj); hashable = "yes"
    except TypeError:
        hashable = "no"
    mutable = "yes" if any(hasattr(obj, m) for m in ("append", "add", "update")) else "no"
    print(f"{kind:9} len={len(obj)}  mutable={mutable:3}  hashable={hashable}")</div>
  <div class="fx" data-lang="text">list      len=3  mutable=yes  hashable=no
tuple     len=3  mutable=no   hashable=yes
set       len=2  mutable=yes  hashable=no
frozenset len=2  mutable=no   hashable=yes
dict      len=2  mutable=yes  hashable=no
str       len=3  mutable=no   hashable=yes</div>
  <p><code>hash(obj)</code> succeeds only for hashable objects; having <code>append</code>, <code>add</code> or <code>update</code> means the object can change in place. The set and frozenset report <code>len=2</code> because the duplicate 3 was dropped on creation.</p>
  <table class="tbl"><caption>Built-in containers by property</caption>
    <tr><th></th><th>list</th><th>tuple</th><th>str</th><th>set</th><th>frozenset</th><th>dict</th></tr>
    <tr><td>Literal</td><td><code>[a, b]</code></td><td><code>(a, b)</code>, <code>a,</code></td><td><code>"ab"</code></td><td><code>{a, b}</code>, <code>set()</code></td><td><code>frozenset(it)</code></td><td><code>{k: v}</code>, <code>{}</code></td></tr>
    <tr><td>Ordered</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>insertion order (3.7+)</td></tr>
    <tr><td>Mutable</td><td>yes</td><td>no</td><td>no</td><td>yes</td><td>no</td><td>yes</td></tr>
    <tr><td>Duplicates</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>keys no, values yes</td></tr>
    <tr><td>Hashable (can be a key)</td><td>no</td><td>if all items are</td><td>yes</td><td>no</td><td>yes</td><td>no</td></tr>
    <tr><td>Indexed by position</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>no (by key)</td></tr>
    <tr><td>Items must be hashable</td><td>no</td><td>no</td><td>—</td><td>yes</td><td>yes</td><td>keys only</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 660 290" width="660">
<defs><marker id="pc-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="8" width="160" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="26" text-anchor="middle" font-size="11.5" font-weight="700">built-in containers</text><text x="330" y="41" text-anchor="middle" class="tm" font-size="10">two underlying designs</text>
<line x1="300" y1="48" x2="170" y2="80" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="360" y1="48" x2="490" y2="80" stroke="currentColor" marker-end="url(#pc-a9)"/>
<rect x="40" y="82" width="260" height="44" rx="7" class="fb sb"/><text x="170" y="101" text-anchor="middle" font-size="11.5" font-weight="700">sequence: positions 0 … n−1</text><text x="170" y="117" text-anchor="middle" class="tm" font-size="10">index O(1) · in = scan O(n)</text>
<rect x="360" y="82" width="260" height="44" rx="7" class="fb sb"/><text x="490" y="101" text-anchor="middle" font-size="11.5" font-weight="700">hash table: slot from hash(key)</text><text x="490" y="117" text-anchor="middle" class="tm" font-size="10">lookup O(1) · keys must be hashable</text>
<line x1="90" y1="126" x2="70" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="170" y1="126" x2="190" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="250" y1="126" x2="310" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/>
<line x1="450" y1="126" x2="440" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="540" y1="126" x2="570" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/>
<rect x="10" y="162" width="110" height="44" rx="7" class="ft st"/><text x="65" y="181" text-anchor="middle" font-size="11.5" font-weight="700">list</text><text x="65" y="197" text-anchor="middle" class="tm" font-size="10">mutable</text>
<rect x="135" y="162" width="110" height="44" rx="7" class="ft st"/><text x="190" y="181" text-anchor="middle" font-size="11.5" font-weight="700">tuple</text><text x="190" y="197" text-anchor="middle" class="tm" font-size="10">immutable</text>
<rect x="260" y="162" width="110" height="44" rx="7" class="ft st"/><text x="315" y="181" text-anchor="middle" font-size="11.5" font-weight="700">str</text><text x="315" y="197" text-anchor="middle" class="tm" font-size="10">immutable text</text>
<rect x="385" y="162" width="110" height="44" rx="7" class="fg sg"/><text x="440" y="181" text-anchor="middle" font-size="11.5" font-weight="700">set</text><text x="440" y="197" text-anchor="middle" class="tm" font-size="10">keys only</text>
<rect x="510" y="162" width="130" height="44" rx="7" class="fg sg"/><text x="575" y="181" text-anchor="middle" font-size="11.5" font-weight="700">dict</text><text x="575" y="197" text-anchor="middle" class="tm" font-size="10">key → value</text>
<path d="M190,206 C190,250 420,250 430,208" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pc-a9)"/>
<path d="M315,206 C320,262 560,262 570,208" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pc-a9)"/>
<text x="330" y="282" text-anchor="middle" class="tm" font-size="10.5">immutable tuples and strings are hashable → they can be set items and dict keys</text>
</svg><figcaption>Two designs underlie the built-ins. Sequences store items by position (fast by index, slow to search); hash tables store items by hash (fast to find, no positions). Immutability is the bridge: only values that cannot change can be hashed, so tuples and strings supply the keys for sets and dicts.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>container</strong> holds references to other objects. <strong>Sequences</strong> (list, tuple, str, range) are ordered and indexed by integer position. A <strong>set</strong> is an unordered collection of unique hashable items. A <strong>mapping</strong> (dict) associates unique hashable keys with values. <strong>Hashable</strong>: has a hash that never changes during its lifetime, and equal objects have equal hashes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><em>Ordered</em> is not <em>sorted</em>: a list keeps the order you inserted, it does not sort itself. And a dict's insertion order does not give it positions: <code>d[0]</code> looks up the key <code>0</code> and raises KeyError if absent. Containers hold references, not copies, so nesting a mutable object in two places shares it (see <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> on shallow vs deep copy).</p></div>

  <h2 id="pc-bigo"><span class="num">02</span>Big-O of Common Operations</h2>
  <p>The second half of the decision is cost: the right container is the one whose cheap operations are the ones your code performs most. These are average-case costs in CPython (n = number of elements):</p>
  <table class="tbl"><caption>Time complexity by container (average case)</caption>
    <tr><th>Operation</th><th>list</th><th>tuple</th><th>dict</th><th>set</th><th>deque</th></tr>
    <tr><td>Index <code>x[i]</code></td><td>O(1)</td><td>O(1)</td><td>— (by key O(1))</td><td>—</td><td>O(1) at ends, O(n) middle</td></tr>
    <tr><td>Append at end</td><td>O(1)*</td><td>— (new tuple O(n))</td><td><code>d[k] = v</code> O(1)*</td><td><code>add</code> O(1)*</td><td><code>append</code> O(1)</td></tr>
    <tr><td>Insert at front</td><td><code>insert(0, x)</code> O(n)</td><td>—</td><td>—</td><td>—</td><td><code>appendleft</code> O(1)</td></tr>
    <tr><td>Pop end</td><td><code>pop()</code> O(1)</td><td>—</td><td><code>popitem()</code> O(1)</td><td><code>pop()</code> O(1) (arbitrary)</td><td><code>pop()</code> O(1)</td></tr>
    <tr><td>Pop front</td><td><code>pop(0)</code> O(n)</td><td>—</td><td>—</td><td>—</td><td><code>popleft()</code> O(1)</td></tr>
    <tr><td>Membership <code>x in c</code></td><td>O(n)</td><td>O(n)</td><td>O(1) keys</td><td>O(1)</td><td>O(n)</td></tr>
    <tr><td>Delete</td><td><code>remove(x)</code> O(n), <code>del l[i]</code> O(n−i)</td><td>—</td><td><code>del d[k]</code> O(1)</td><td><code>discard(x)</code> O(1)</td><td><code>remove(x)</code> O(n)</td></tr>
    <tr><td>Iterate / copy</td><td>O(n)</td><td>O(n)</td><td>O(n)</td><td>O(n)</td><td>O(n)</td></tr>
    <tr><td>Sort</td><td>O(n log n)</td><td><code>sorted()</code> O(n log n)</td><td><code>sorted(d)</code> O(n log n)</td><td><code>sorted(s)</code> O(n log n)</td><td>—</td></tr>
  </table>
  <p>* amortised: the underlying array or hash table is occasionally resized, but the cost averages out to O(1). Dict and set operations degrade to O(n) only when many keys collide. Two rows matter most in practice, membership and front removal, so measure them:</p>
  <div class="fx" data-lang="py">from collections import deque
import timeit
n = 100_000
data = list(range(n))
as_list, as_set, as_dict = data, set(data), dict.fromkeys(data)
for label, box in [("list", as_list), ("set", as_set), ("dict", as_dict)]:
    t = timeit.timeit(lambda: (n - 1) in box, number=200) / 200
    print(f"'in' on {label:4}: {t * 1e6:8.2f} us")

def drain_list():
    q = list(range(n))
    while q:
        q.pop(0)              # shifts every remaining element
def drain_deque():
    q = deque(range(n))
    while q:
        q.popleft()           # O(1)
print(f"list.pop(0) x {n:,}:     {timeit.timeit(drain_list, number=1):.2f} s")
print(f"deque.popleft() x {n:,}: {timeit.timeit(drain_deque, number=1):.3f} s")</div>
  <div class="fx" data-lang="text">'in' on list:   652.42 us
'in' on set :     0.08 us
'in' on dict:     0.10 us
list.pop(0) x 100,000:     0.80 s
deque.popleft() x 100,000: 0.005 s</div>
  <p>The list scans up to 100,000 items (the target is last, its worst case); set and dict hash the value and check one slot, several thousand times faster. Draining a list from the front is O(n²) in total because each <code>pop(0)</code> shifts every remaining pointer; the deque is O(n) in total. Absolute times vary by machine; the ratios do not.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Big-O</strong> describes how work grows with input size n. O(1): constant. O(log n): grows very slowly (binary search). O(n): proportional. O(n log n): efficient sorting. O(n²): doubling n quadruples the time. <strong>Amortised</strong> O(1): an occasional expensive step averaged over many cheap ones.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A list that is "only" O(n) per membership check becomes O(n·m) when the check runs inside a loop over m items. This is the classic hidden quadratic: convert to a set once, outside the loop (measured in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>: about 1 s down to about 1 ms).</p></div>

  <h2 id="pc-choose"><span class="num">03</span>How to Choose: a Decision Guide</h2>
  <p>Ask what your code does most often with the data, then pick the container that makes that operation cheap and whose rules (order, mutability, uniqueness, hashability) match the meaning of the data.</p>
  <ol>
    <li><strong>Look things up by a key or id?</strong> → <code>dict</code>. Only need "seen it?" or uniqueness → <code>set</code>. Need a set as a key → <code>frozenset</code>.</li>
    <li><strong>A fixed bundle of different fields</strong> (a record, a coordinate, a composite key, several return values)? → <code>tuple</code>; <code>namedtuple</code> or a frozen <code>dataclass</code> when fields deserve names.</li>
    <li><strong>Many items of the same kind, order matters, size changes?</strong> → <code>list</code>. Adding/removing at the front too → <code>deque</code>.</li>
    <li><strong>Always need the smallest/largest next?</strong> → <code>heapq</code>. <strong>Keep data sorted and search it?</strong> → sorted list + <code>bisect</code>.</li>
    <li><strong>Counting or grouping?</strong> → <code>Counter</code> / <code>defaultdict</code>.</li>
    <li><strong>Millions of numbers, vector maths?</strong> → NumPy array or pandas.</li>
    <li><strong>Text?</strong> → <code>str</code> (see <a class="xref" data-note="py_strings">Strings</a>).</li>
  </ol>
  <table class="tbl"><caption>Task → container</caption>
    <tr><th>Task</th><th>Use</th><th>Why</th></tr>
    <tr><td>Rows of a table, in order</td><td><code>list</code> of tuples / dicts</td><td>ordered, growable</td></tr>
    <tr><td>Config, JSON, id → record</td><td><code>dict</code></td><td>O(1) by key</td></tr>
    <tr><td>Dedupe, "visited", compare id lists</td><td><code>set</code></td><td>O(1) membership, set algebra</td></tr>
    <tr><td>Composite key <code>(user, day)</code></td><td><code>tuple</code></td><td>hashable</td></tr>
    <tr><td>Word / label frequencies</td><td><code>Counter</code></td><td>counting + <code>most_common</code></td></tr>
    <tr><td>Group rows by key</td><td><code>defaultdict(list)</code></td><td>no missing-key checks</td></tr>
    <tr><td>FIFO queue, BFS, last k events</td><td><code>deque</code> / <code>deque(maxlen=k)</code></td><td>O(1) both ends</td></tr>
    <tr><td>Stack (LIFO), DFS</td><td><code>list</code> (<code>append</code>/<code>pop</code>)</td><td>O(1) at the end</td></tr>
    <tr><td>Priority queue, top-k, scheduling</td><td><code>heapq</code></td><td>O(log n) push/pop</td></tr>
    <tr><td>Search / insert in sorted data, bucketing</td><td><code>bisect</code></td><td>O(log n) search</td></tr>
    <tr><td>Layered settings (CLI &gt; env &gt; defaults)</td><td><code>ChainMap</code></td><td>lookup through several dicts</td></tr>
    <tr><td>Large numeric arrays</td><td>NumPy / <code>array</code></td><td>compact, vectorised</td></tr>
  </table>
  <h3>Real data nests containers</h3>
  <p>Most real structures are containers of containers. The four shapes you meet most:</p>
  <div class="fx" data-lang="py">from collections import defaultdict, Counter
events = [("u1", "click"), ("u2", "view"), ("u1", "view"), ("u3", "click"), ("u1", "click")]

by_user = defaultdict(list)                          # dict of lists: grouping
for user, action in events:
    by_user[user].append(action)
print(dict(by_user))

pairs = {(u, a) for u, a in events}                  # set of tuples: distinct combinations
print(len(pairs), ("u1", "click") in pairs)

rows = [{"user": u, "action": a} for u, a in events] # list of dicts: JSON / DataFrame shape
print(rows[0])

print(Counter(a for _, a in events).most_common())  # Counter: frequencies</div>
  <div class="fx" data-lang="text">{'u1': ['click', 'view', 'click'], 'u2': ['view'], 'u3': ['click']}
4 True
{'user': 'u1', 'action': 'click'}
[('click', 3), ('view', 2)]</div>
  <ul>
    <li><strong>Dict of lists</strong> (<code>defaultdict(list)</code>): grouping, "actions per user".</li>
    <li><strong>Set of tuples</strong>: distinct combinations; tuples work because they are hashable, lists would raise TypeError.</li>
    <li><strong>List of dicts</strong>: the shape of JSON records and of <code>pd.DataFrame(rows)</code> (<a class="xref" data-note="da_pandas">Pandas</a>).</li>
    <li><strong>Counter</strong>: a dict specialised for counting.</li>
  </ul>
  <p>For depth on each built-in, see <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> (slicing, costs, copies, unpacking), <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> (hashing, CRUD, set algebra) and <a class="xref" data-note="py_strings">Strings</a> (methods, Unicode, regex).</p>
  <div class="callout trap"><span class="label">Trap</span><p>Choosing by habit (everything a list) works on test data and fails at scale. The usual offenders: membership tests on lists, lists used as queues, lists of (key, value) pairs scanned as lookup tables, and relying on set order for output.</p></div>

  <h2 id="pc-deque"><span class="num">04</span>collections.deque</h2>
  <p>A <code>deque</code> (double-ended queue, pronounced "deck") supports O(1) appends and pops at <em>both</em> ends. A list is a contiguous array, so the front is expensive; a deque is a doubly linked list of fixed-size blocks, so neither end requires shifting. Use it for FIFO queues, BFS, and sliding windows.</p>
  <div class="fx" data-lang="py">from collections import deque
q = deque([1, 2, 3])
q.append(4)          # right end
q.appendleft(0)      # left end
print(q)
print(q.pop(), q.popleft(), q)
q.rotate(1)          # move the last element to the front
print(q)

recent = deque(maxlen=3)            # keeps only the last 3 items
for event in ["a", "b", "c", "d", "e"]:
    recent.append(event)            # the oldest is dropped automatically
print(recent, list(recent))

def bfs(graph, start):              # breadth-first search uses a FIFO queue
    seen, order, frontier = {start}, [], deque([start])
    while frontier:
        node = frontier.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt)
                frontier.append(nxt)
    return order
graph = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": [], "E": []}
print(bfs(graph, "A"))</div>
  <div class="fx" data-lang="text">deque([0, 1, 2, 3, 4])
4 0 deque([1, 2, 3])
deque([3, 1, 2])
deque(['c', 'd', 'e'], maxlen=3) ['c', 'd', 'e']
['A', 'B', 'C', 'D', 'E']</div>
  <ul>
    <li><code>append</code>/<code>pop</code> work on the right, <code>appendleft</code>/<code>popleft</code> on the left, all O(1). <code>extend</code>/<code>extendleft</code> add many.</li>
    <li><code>rotate(k)</code> shifts elements k steps to the right (negative k to the left).</li>
    <li><code>deque(maxlen=k)</code> is a bounded buffer: appending to a full deque silently discards from the opposite end. Ideal for "last k events", moving averages and log tails.</li>
    <li>BFS pops from the left and pushes to the right; with a list, every <code>pop(0)</code> would be O(n).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><code>collections.deque(iterable=(), maxlen=None)</code>: a thread-safe, memory-efficient sequence with O(1) <code>append</code>, <code>appendleft</code>, <code>pop</code>, <code>popleft</code>. Indexing is O(1) at either end but O(n) towards the middle; it does not support slicing.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not replace every list with a deque: random access <code>d[i]</code> in the middle is O(n), and there is no <code>sort</code> or slicing. For a stack (push/pop at one end only) a plain list is just as fast. For producer/consumer queues between threads use <code>queue.Queue</code>, which adds blocking and locking.</p></div>

  <h2 id="pc-coll"><span class="num">05</span>The collections Module: Counter, defaultdict, OrderedDict, namedtuple, ChainMap</h2>
  <p>The <code>collections</code> module provides specialised containers built on the basic ones. Each removes boilerplate for one common pattern:</p>
  <div class="fx" data-lang="py">from collections import Counter, defaultdict, OrderedDict, namedtuple, ChainMap

words = "the cat and the hat and the bat".split()
c = Counter(words)
print(c.most_common(2), c["dog"], c.total())

graph = defaultdict(set)
for a, b in [("x", "y"), ("x", "z"), ("y", "z")]:
    graph[a].add(b)
print({k: sorted(v) for k, v in graph.items()})

lru = OrderedDict(a=1, b=2, c=3)
lru.move_to_end("a")                # mark "a" as most recently used
lru.popitem(last=False)             # evict the least recently used ("b")
print(list(lru))

Point = namedtuple("Point", "x y")
p = Point(3, 4)
print(p, p.x, p[1], p._replace(x=0))

defaults = {"lr": 0.01, "epochs": 10, "device": "cpu"}
env      = {"device": "cuda"}
cli      = {"epochs": 50}
cfg = ChainMap(cli, env, defaults)  # lookups search cli, then env, then defaults
print(cfg["lr"], cfg["epochs"], cfg["device"])
print(dict(cfg))</div>
  <div class="fx" data-lang="text">[('the', 3), ('and', 2)] 0 8
{'x': ['y', 'z'], 'y': ['z']}
['c', 'a']
Point(x=3, y=4) 3 4 Point(x=0, y=4)
0.01 50 cuda
{'lr': 0.01, 'epochs': 50, 'device': 'cuda'}</div>
  <table class="tbl"><caption>collections at a glance</caption>
    <tr><th>Type</th><th>What it is</th><th>Use for</th></tr>
    <tr><td><code>Counter</code></td><td>dict subclass: item → count; missing → 0</td><td>frequencies, <code>most_common(k)</code>, multiset maths (<code>+ - &amp; |</code>), <code>total()</code></td></tr>
    <tr><td><code>defaultdict(factory)</code></td><td>dict subclass calling <code>factory()</code> for missing keys</td><td>grouping (<code>list</code>), sums (<code>int</code>), adjacency sets (<code>set</code>)</td></tr>
    <tr><td><code>OrderedDict</code></td><td>dict with order-aware equality and reordering</td><td>LRU caches (<code>move_to_end</code>, <code>popitem(last=False)</code>)</td></tr>
    <tr><td><code>namedtuple</code></td><td>tuple subclass with named fields</td><td>light immutable records; <code>_replace</code>, <code>_asdict</code></td></tr>
    <tr><td><code>ChainMap</code></td><td>view over several dicts, searched in order</td><td>layered config (CLI over env over defaults), nested scopes</td></tr>
    <tr><td><code>deque</code></td><td>double-ended queue</td><td>see above</td></tr>
  </table>
  <p>In the ChainMap example, <code>lr</code> comes from defaults, <code>epochs</code> from the CLI layer and <code>device</code> from the environment layer, without copying or merging any dict. Writes go to the first mapping only. Details of Counter and defaultdict, including the "reading a missing key inserts it" trap, are in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>; namedtuple is covered in <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Since Python 3.7 a plain dict keeps insertion order, so <code>OrderedDict</code> is only needed for its extra methods or order-sensitive equality. And a <code>defaultdict</code> passed to code that expects KeyError can hide bugs: convert with <code>dict(d)</code> at the boundary.</p></div>

  <h2 id="pc-heap"><span class="num">06</span>heapq and bisect</h2>
  <p><code>heapq</code> and <code>bisect</code> are not new container types: they are algorithms that operate on a plain list kept in a special order. <code>heapq</code> keeps a <em>binary min-heap</em> (the smallest item is always at index 0); <code>bisect</code> does binary search on a <em>sorted</em> list.</p>
  <div class="fx" data-lang="py">import heapq, bisect
nums = [7, 2, 9, 4, 1, 8]
heap = []
for x in nums:
    heapq.heappush(heap, x)          # O(log n)
print(heap[0], [heapq.heappop(heap) for _ in range(3)])   # smallest first
print(heapq.nsmallest(2, nums), heapq.nlargest(2, nums))

tasks = [(2, "write"), (1, "fix bug"), (3, "refactor")]
heapq.heapify(tasks)                 # O(n), in place
print(heapq.heappop(tasks))          # tuples compare by priority first

max_heap = [-x for x in nums]        # heapq is a min-heap: negate for max
heapq.heapify(max_heap)
print(-heapq.heappop(max_heap))

scores = [10, 20, 30, 40]
print(bisect.bisect_left(scores, 25), bisect.bisect_right(scores, 30))
bisect.insort(scores, 25)            # keeps the list sorted (O(n) shift)
print(scores)
def grade(score, cutoffs=[60, 70, 80, 90], letters="FDCBA"):
    return letters[bisect.bisect_right(cutoffs, score)]
print([grade(s) for s in [55, 60, 75, 99]])</div>
  <div class="fx" data-lang="text">1 [1, 2, 4]
[1, 2] [9, 8]
(1, 'fix bug')
9
2 3
[10, 20, 25, 30, 40]
['F', 'D', 'C', 'A']</div>
  <ul>
    <li><strong>heapq</strong>: <code>heappush</code>/<code>heappop</code> O(log n), <code>heap[0]</code> peeks the minimum in O(1), <code>heapify</code> builds a heap in place in O(n). Tuples compare element by element, so <code>(priority, item)</code> works as a priority queue. There is no max-heap API: push negated keys.</li>
    <li><strong>Top-k</strong>: <code>nlargest(k, xs)</code> / <code>nsmallest(k, xs)</code> run in O(n log k), better than sorting everything when k is small.</li>
    <li><strong>bisect</strong>: <code>bisect_left</code>/<code>bisect_right</code> return the insertion point in O(log n); <code>insort</code> inserts while keeping order, but the insertion itself shifts elements, so it is O(n). Typical uses: bucketing a score against cutoffs, range counts in sorted data, maintaining a sorted list with few inserts.</li>
  </ul>
  <p>Interview patterns built on these (Kth largest, merge K sorted lists, binary search on the answer) are in <a class="xref" data-note="dsa_heaps">DSA: Heaps</a> and <a class="xref" data-note="dsa_binsearch">DSA: Binary Search</a>; queue and monotonic-deque patterns in <a class="xref" data-note="dsa_stacks">DSA: Stacks &amp; Queues</a>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>If two heap entries have equal priority, Python compares the next tuple element; when that is a dict or a custom object, <code>heappush</code> raises <code>TypeError: '&lt;' not supported</code>. Add a tie-breaking counter: <code>(priority, next(counter), item)</code>. And a heap is only partially ordered: <code>heap</code> printed is not sorted, only <code>heap[0]</code> is guaranteed to be the minimum.</p></div>

  <h2 id="pc-array"><span class="num">07</span>Arrays vs Lists: the array Module and NumPy</h2>
  <p>A Python list stores pointers to separate, fully fledged Python objects. For a million floats that means a million float objects (24 bytes each) plus an 8-byte pointer per slot. Typed arrays store raw machine values side by side instead:</p>
  <div class="fx" data-lang="py">import sys, array, timeit
import numpy as np
n = 1_000_000
as_list = [float(i) for i in range(n)]
as_array = array.array("d", as_list)        # typed: raw C doubles
as_np = np.arange(n, dtype=np.float64)

list_bytes = sys.getsizeof(as_list) + sum(sys.getsizeof(x) for x in as_list)
print(f"list : {list_bytes / 1e6:5.1f} MB  (pointers + one float object each)")
print(f"array: {sys.getsizeof(as_array) / 1e6:5.1f} MB")
print(f"numpy: {as_np.nbytes / 1e6:5.1f} MB")

t_list = timeit.timeit(lambda: [x * 2 for x in as_list], number=5) / 5
t_np = timeit.timeit(lambda: as_np * 2, number=5) / 5
print(f"double every element: list {t_list * 1000:.1f} ms, numpy {t_np * 1000:.2f} ms")
try:
    as_array.append("x")
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">list :  32.4 MB  (pointers + one float object each)
array:   8.0 MB
numpy:   8.0 MB
double every element: list 54.6 ms, numpy 1.05 ms
TypeError: must be real number, not str</div>
  <ul>
    <li><strong>list</strong>: about 32 MB for a million floats, because each element is a boxed object; operations run in the interpreter loop, one object at a time.</li>
    <li><strong>array.array</strong> (stdlib): a typed, compact sequence (8 bytes per double, here 8 MB) that rejects values of the wrong type. Good for compact storage and binary I/O; arithmetic is still element by element in Python.</li>
    <li><strong>NumPy ndarray</strong>: same compact layout plus vectorised operations implemented in C, here about 50× faster for doubling every element. Use it (or pandas, built on it) for any bulk numeric work.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Converting between lists and NumPy arrays inside a loop, or iterating over a NumPy array element by element in Python, throws away the advantage. Keep data in arrays and use vectorised operations. Also note that slicing a NumPy array returns a <em>view</em> sharing memory, while slicing a list returns a copy.</p></div>

  <h2 id="pc-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: list for membership tests</span><p><code>if x in big_list</code> inside a loop is O(n·m). Build a set once, outside the loop.</p></div>
  <div class="callout trap"><span class="label">Trap: list as a queue</span><p><code>pop(0)</code> and <code>insert(0, x)</code> shift every element. Use <code>deque.popleft()</code> / <code>appendleft()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: list of pairs as a lookup table</span><p>Scanning <code>[(key, value), …]</code> for every lookup is O(n) each. Use a dict.</p></div>
  <div class="callout trap"><span class="label">Trap: expecting positions in a set or dict</span><p><code>my_set[0]</code> → TypeError; <code>d[0]</code> looks up the key 0. Use <code>sorted(...)</code> or <code>list(...)</code> when you need positions.</p></div>
  <div class="callout trap"><span class="label">Trap: relying on set order</span><p>Set iteration order depends on hashes and, for strings, changes between runs. Sort before printing, comparing outputs or writing files.</p></div>
  <div class="callout trap"><span class="label">Trap: unhashable keys</span><p>Lists, dicts and sets cannot be dict keys or set items. Use tuples, strings, numbers or frozensets.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>{}</code> for an empty set</span><p><code>{}</code> is an empty dict. Use <code>set()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: sorting repeatedly to get the minimum</span><p>Calling <code>sorted()</code> or <code>min()</code> after every insert is O(n log n) or O(n) per step. A heap gives O(log n) push and pop.</p></div>
  <div class="callout trap"><span class="label">Trap: Python lists for heavy numeric work</span><p>A list of floats is a list of boxed objects. Use NumPy or pandas for vector maths.</p></div>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Properties</h3>
  <table class="tbl">
    <tr><th></th><th>list</th><th>tuple</th><th>str</th><th>set</th><th>frozenset</th><th>dict</th></tr>
    <tr><td>Ordered</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>insertion</td></tr>
    <tr><td>Mutable</td><td>yes</td><td>no</td><td>no</td><td>yes</td><td>no</td><td>yes</td></tr>
    <tr><td>Duplicates</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>keys no</td></tr>
    <tr><td>Hashable</td><td>no</td><td>if items are</td><td>yes</td><td>no</td><td>yes</td><td>no</td></tr>
    <tr><td>Indexed</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>by key</td></tr>
  </table>
  <h3>Big-O</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>list</th><th>dict / set</th><th>deque</th><th>heapq (list)</th></tr>
    <tr><td>Index</td><td>O(1)</td><td>key O(1)</td><td>ends O(1), middle O(n)</td><td>min <code>h[0]</code> O(1)</td></tr>
    <tr><td>Add at end</td><td>O(1)*</td><td>O(1)*</td><td>O(1)</td><td>push O(log n)</td></tr>
    <tr><td>Add/remove at front</td><td>O(n)</td><td>—</td><td>O(1)</td><td>pop min O(log n)</td></tr>
    <tr><td>Pop end</td><td>O(1)</td><td>popitem O(1)</td><td>O(1)</td><td>—</td></tr>
    <tr><td><code>x in c</code></td><td>O(n)</td><td>O(1)</td><td>O(n)</td><td>O(n)</td></tr>
    <tr><td>Delete by value/key</td><td>O(n)</td><td>O(1)</td><td>O(n)</td><td>—</td></tr>
  </table>
  <p>* amortised. Dict/set worst case O(n) with heavy collisions. <code>heapify</code> O(n); <code>nlargest(k)</code> O(n log k); <code>bisect</code> O(log n), <code>insort</code> O(n); sort O(n log n).</p>
  <h3>Decision rules</h3>
  <ul>
    <li>Lookup by key → <code>dict</code>; seen/unique → <code>set</code>; set as a key → <code>frozenset</code>.</li>
    <li>Fixed record, composite key, multiple returns → <code>tuple</code> / <code>namedtuple</code>.</li>
    <li>Ordered, growing, indexed → <code>list</code>; stack → list <code>append</code>/<code>pop</code>.</li>
    <li>Queue, BFS, sliding window → <code>deque</code> (<code>maxlen=k</code>).</li>
    <li>Counting → <code>Counter</code>; grouping → <code>defaultdict(list)</code>; layered config → <code>ChainMap</code>; LRU → <code>OrderedDict</code> or <code>functools.lru_cache</code>.</li>
    <li>Priority / top-k → <code>heapq</code> (min-heap; negate for max; tie-break counter).</li>
    <li>Sorted search / bucketing → <code>bisect</code>.</li>
    <li>Bulk numbers → NumPy (compact, vectorised); compact typed storage → <code>array.array</code>.</li>
  </ul>
  <h3>Nested shapes</h3>
  <ul>
    <li>List of tuples: table rows · dict of lists: groups · set of tuples: distinct combinations · list of dicts: JSON / DataFrame records.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>in</code> on a list inside a loop → O(n·m); list <code>pop(0)</code> in a loop → O(n²).</li>
    <li>Sets and dicts have no positions; set order is not stable across runs.</li>
    <li>Only hashable objects can be keys/set items; <code>{}</code> is a dict.</li>
    <li>heap entries with equal priority compare the next field → TypeError for dicts/objects.</li>
    <li>deque middle indexing is O(n); <code>insort</code> is O(n).</li>
    <li>List slices copy; NumPy slices are views.</li>
  </ul>

  <h2 id="pc-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Compare list, tuple, set and dict.</summary><div class="qa-body">list: ordered, mutable, duplicates, O(1) index, O(n) membership. tuple: ordered, immutable, hashable if its items are, slightly smaller and faster to create. set: unordered, mutable, unique hashable items, O(1) average membership. dict: key → value mapping with unique hashable keys, O(1) average lookup, insertion-ordered since 3.7. Sets and dicts are hash tables; lists and tuples are arrays of references.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a tuple instead of a list?</summary><div class="qa-body">For fixed-size records where each position has a meaning (coordinates, database rows, multiple return values), for dict keys and set members (tuples are hashable when their items are, lists never), and to signal that data must not change. Use a list for a homogeneous collection whose length changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which objects can be dict keys or set elements, and why?</summary><div class="qa-body">Only hashable objects: int, float, str, bytes, bool, None, frozenset, and tuples whose elements are all hashable (plus user classes with a consistent <code>__hash__</code>/<code>__eq__</code>). The hash decides where the entry is stored; if a key could change, its hash would change and the entry would become unreachable. Lists, dicts and sets are mutable and unhashable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your code checks <code>if user_id in seen_ids</code> inside a loop over a million events and it is slow. Why, and how do you fix it?</summary><div class="qa-body"><code>seen_ids</code> is probably a list, so each check is an O(n) scan and the loop is O(n·m). Make it a set (built once, outside the loop): each check becomes O(1) average and the loop O(n + m). On 100,000 ids the measured difference per check is several thousand times.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you implement a stack and a queue in Python?</summary><div class="qa-body">Stack (LIFO): a list with <code>append</code> and <code>pop()</code>, both O(1) at the end. Queue (FIFO): <code>collections.deque</code> with <code>append</code> and <code>popleft()</code>, both O(1); a list would make <code>pop(0)</code> O(n). For queues shared between threads use <code>queue.Queue</code>, which blocks and locks; for asyncio, <code>asyncio.Queue</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deque and what are its trade-offs?</summary><div class="qa-body">A double-ended queue implemented as a doubly linked list of fixed-size blocks: O(1) append and pop at both ends, optional <code>maxlen</code> for a bounded buffer, thread-safe appends/pops. The trade-off is O(n) indexing towards the middle and no slicing or sorting, so it is not a general list replacement.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you keep only the last 1,000 log lines in memory?</summary><div class="qa-body"><code>recent = deque(maxlen=1000)</code> and <code>recent.append(line)</code>. Once full, each append discards the oldest line from the other end in O(1). A list with <code>pop(0)</code> would be O(n) per line, and slicing <code>lines[-1000:]</code> repeatedly copies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you implement a priority queue? What about equal priorities?</summary><div class="qa-body">Use <code>heapq</code> on a list of <code>(priority, item)</code> tuples: <code>heappush</code> and <code>heappop</code> are O(log n) and <code>heap[0]</code> is the minimum. With equal priorities, tuple comparison falls through to the item, which raises <code>TypeError</code> for dicts or objects without ordering. Insert a monotonically increasing counter, <code>(priority, next(counter), item)</code>, which also keeps FIFO order among equal priorities. For a max-heap, negate the priority.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the k largest elements of a list of n numbers. What is the complexity?</summary><div class="qa-body"><code>heapq.nlargest(k, xs)</code>: keeps a heap of size k, O(n log k) time and O(k) space. <code>sorted(xs, reverse=True)[:k]</code> is O(n log n). For k = 1 just use <code>max</code> (O(n)); when k is close to n, sorting is fine. For counts, <code>Counter.most_common(k)</code> uses the same heap approach.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>heapify</code> do, and is a heap a sorted list?</summary><div class="qa-body"><code>heapq.heapify(xs)</code> rearranges a list in place into a binary min-heap in O(n): every parent is ≤ its children (<code>xs[i] &lt;= xs[2i+1]</code> and <code>xs[2i+2]</code>). It is not sorted; only <code>xs[0]</code> is guaranteed to be the smallest. Popping all items one by one yields sorted order (heapsort, O(n log n)).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>bisect</code> used for?</summary><div class="qa-body">Binary search on a sorted list: <code>bisect_left</code>/<code>bisect_right</code> return the insertion index in O(log n), and <code>insort</code> inserts while keeping the list sorted (O(log n) search but O(n) shift). Uses: mapping a score to a grade band (<code>letters[bisect_right(cutoffs, score)]</code>), counting values in a range, finding the nearest timestamp. Since 3.10 they accept a <code>key=</code> argument.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>Counter</code> vs <code>defaultdict(int)</code>?</summary><div class="qa-body">Both give 0 for missing keys. <code>Counter</code> adds counting features: construct from an iterable, <code>most_common(k)</code>, <code>total()</code>, and multiset arithmetic (<code>+</code>, <code>-</code>, <code>&amp;</code>, <code>|</code>); reading a missing key does not insert it. <code>defaultdict(int)</code> is a general dict that inserts 0 on first access; it is the more general tool (you can use any factory), Counter is clearer for frequencies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>ChainMap</code> for?</summary><div class="qa-body">It presents several dicts as one mapping, searching them in order without copying: <code>ChainMap(cli_args, env_vars, defaults)</code> returns the CLI value if present, else the env value, else the default. Writes and deletes affect only the first mapping. It is useful for layered configuration and for modelling nested scopes (e.g. in an interpreter); <code>new_child()</code> pushes a new layer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you implement an LRU cache?</summary><div class="qa-body">In production, <code>functools.lru_cache(maxsize=…)</code> or <code>functools.cache</code>. By hand: an <code>OrderedDict</code>; on get, <code>move_to_end(key)</code>; on put, insert and, if over capacity, <code>popitem(last=False)</code> to evict the least recently used, all O(1). The language-agnostic version is a hash map plus a doubly linked list. The cache key must be hashable, which is why <code>lru_cache</code> rejects list arguments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>list vs <code>array.array</code> vs NumPy array?</summary><div class="qa-body">A list stores pointers to boxed Python objects of any type (a million floats took about 32 MB). <code>array.array</code> stores raw typed values compactly (8 MB for a million doubles) and rejects other types, but arithmetic is still done in Python. A NumPy array is also compact and typed, and adds vectorised operations implemented in C (doubling a million elements: ~1 ms vs ~55 ms for a list comprehension), broadcasting, and the whole scientific stack. Use lists for general heterogeneous collections, NumPy for numeric bulk work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you remove duplicates while preserving order? And count distinct items?</summary><div class="qa-body">Preserve order: <code>list(dict.fromkeys(xs))</code> (dict keys are unique and insertion-ordered). Distinct count: <code>len(set(xs))</code>. <code>list(set(xs))</code> dedupes but loses order. All are O(n) and require hashable items.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which data structure would you use to represent a graph, and for BFS?</summary><div class="qa-body">An adjacency list: <code>dict</code> of node → list (or <code>set</code>, for O(1) edge checks and no duplicates), often a <code>defaultdict(list)</code> while building. BFS uses a <code>deque</code> as the frontier (<code>popleft</code> O(1)) and a <code>set</code> of visited nodes; DFS can use a list as a stack or recursion. Dijkstra adds a <code>heapq</code> priority queue keyed by distance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a set's or dict's lookup O(1) only "on average"?</summary><div class="qa-body">Both are hash tables: lookup hashes the key, jumps to a slot and compares a few candidates. The table is kept less than about 2/3 full and the hash spreads keys, so the expected number of probes is constant. If many keys collide (a bad custom <code>__hash__</code> or adversarial input), probes grow towards n and lookup degrades to O(n). Details in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>.</div></details>
</main>
`
});
