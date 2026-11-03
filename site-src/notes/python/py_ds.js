// notes/python/py_ds.js — Choosing a Collection
Object.assign(TOPIC_CONTENT, {
  "py_ds": `<main>
<h1>Choosing a Collection</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Choosing a Collection</span></div>
  <p class="lead">By now you have met Python's built-in containers one at a time: lists and tuples in <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>, dicts and sets in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>, and strings in <a class="xref" data-note="py_strings">Strings</a>. This page is about choosing between them, and about the standard-library tools that fill the gaps they leave: <code>deque</code> for queues, <code>heapq</code> for "always give me the most urgent item", <code>bisect</code> for searching sorted data, a few more members of <code>collections</code>, and typed arrays for large amounts of numbers. Choosing badly rarely makes a program wrong; it makes it slow, typically through a membership test on a list inside a loop or a list used as a queue, and "which data structure would you use here, and why?" is one of the most common interview questions there is. We keep the chai stall from the earlier pages, with its menu, its six morning orders and its four customer bills, and add a queue at the counter, a pile of order tickets, discount tiers and settings.</p>

  <h2 id="pc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Choosing a Collection</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The deciding questions</div>
        <ul>
          <li>What do I do most: index, search, add at front, find the smallest?</li>
          <li>Ordered? Changeable? Duplicates? Must it be a key?</li>
          <li>Pick the container that makes the common operation cheap</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Built-ins</div>
        <ul>
          <li><b>list</b>: ordered items, stack; <b>tuple</b>: fixed record, key</li>
          <li><b>dict</b>: lookup by key; <b>set</b>: uniqueness, fast <code>in</code></li>
          <li><b>str</b>: text</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Standard library</div>
        <ul>
          <li><b>deque</b>: O(1) at both ends, <code>maxlen</code> for last k</li>
          <li><b>heapq</b>: smallest first, O(log n) push/pop, top-k</li>
          <li><b>bisect</b>: O(log n) search in a sorted list</li>
          <li><b>OrderedDict</b>: LRU; <b>ChainMap</b>: layered settings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scale</div>
        <ul>
          <li>Many numbers → NumPy (compact, vectorised)</li>
          <li><code>in</code> on a list inside a loop → O(n²)</li>
          <li>Heap is not sorted; only <code>heap[0]</code> is the minimum</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-props"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Built-ins Side by Side</span><span class="rm-sub">the yes/no properties that tell them apart</span></div></div>
      <div class="rm-item rm-done" data-target="pc-bigo"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">What Each Operation Costs</span><span class="rm-sub">one Big-O table for every container</span></div></div>
      <div class="rm-item rm-done" data-target="pc-choose"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How to Choose</span><span class="rm-sub">from the job to the container, and nesting them</span></div></div>
      <div class="rm-item rm-done" data-target="pc-deque"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">deque</span><span class="rm-sub">queues, recent items and breadth-first search</span></div></div>
      <div class="rm-item rm-done" data-target="pc-heap"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">heapq</span><span class="rm-sub">priority queues and top-k</span></div></div>
      <div class="rm-item rm-done" data-target="pc-bisect"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">bisect</span><span class="rm-sub">fast searching in sorted data</span></div></div>
      <div class="rm-item rm-done" data-target="pc-coll"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">OrderedDict and ChainMap</span><span class="rm-sub">LRU caches and layered settings</span></div></div>
      <div class="rm-item rm-done" data-target="pc-array"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Arrays vs Lists</span><span class="rm-sub">array and NumPy for lots of numbers</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">positions in dicts, lost duplicates, habits</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">properties, costs, task-to-container table</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">"which data structure would you use?"</span></div></div>
    </div>
  </div>

  <h2 id="pc-props"><span class="num">01</span>The Built-ins Side by Side</h2>
  <p>Every container choice starts with a few yes-or-no questions about the data. Does the order of the items matter (is the container <strong>ordered</strong>)? Will the data change after it is created (should the container be <strong>mutable</strong>)? Can the same value appear twice (are <strong>duplicates</strong> allowed)? Will the container itself need to be a dictionary key or a set item (must it be <strong>hashable</strong>)? And do you need to reach items by position? Each of the earlier pages answered these questions for one type; here they are side by side. Python can even answer some of them for us. Below, each container holds a piece of the stall's data:</p>
  <div class="fx" data-lang="py">samples = {
    "list":      ["Asha", "Ben", "Asha"],               # names in order of arrival
    "tuple":     ("Asha", "masala chai", 2),            # one order record
    "set":       {"Asha", "Ben", "Asha"},               # distinct customers
    "frozenset": frozenset({"Asha", "Ben"}),            # a table's group, usable as a key
    "dict":      {"masala chai": 20, "samosa": 15},     # item -&gt; price
    "str":       "Asha: 2 masala chai",                 # a line of text
}
for kind, obj in samples.items():
    try:
        hash(obj); hashable = "yes"
    except TypeError:
        hashable = "no"
    mutable = "yes" if any(hasattr(obj, m) for m in ("append", "add", "update")) else "no"
    print(f"{kind:9} len={len(obj):2}  mutable={mutable:3}  hashable={hashable}")</div>
  <div class="fx" data-lang="text">list      len= 3  mutable=yes  hashable=no
tuple     len= 3  mutable=no   hashable=yes
set       len= 2  mutable=yes  hashable=no
frozenset len= 2  mutable=no   hashable=yes
dict      len= 2  mutable=yes  hashable=no
str       len=19  mutable=no   hashable=yes</div>
  <p>The loop tests each container in two ways. If <code>hash(obj)</code> succeeds, the object is hashable and could be a dict key; if it raises <code>TypeError</code>, it cannot. And if the object has an <code>append</code>, <code>add</code> or <code>update</code> method, it can be changed in place. The list, set and dict are mutable and therefore unhashable; the tuple, frozenset and string are immutable and hashable. Notice the lengths too: the list keeps both "Asha" entries (length 3), but the set silently dropped the duplicate (length 2). The full comparison is below.</p>
  <table class="tbl">
    <tr><th></th><th>list</th><th>tuple</th><th>str</th><th>set</th><th>frozenset</th><th>dict</th></tr>
    <tr><td>Written as</td><td><code>[a, b]</code></td><td><code>(a, b)</code>, <code>a,</code></td><td><code>"ab"</code></td><td><code>{a, b}</code>, <code>set()</code></td><td><code>frozenset(it)</code></td><td><code>{k: v}</code>, <code>{}</code></td></tr>
    <tr><td>Ordered</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>insertion order</td></tr>
    <tr><td>Mutable</td><td>yes</td><td>no</td><td>no</td><td>yes</td><td>no</td><td>yes</td></tr>
    <tr><td>Duplicates</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>keys no, values yes</td></tr>
    <tr><td>Hashable (can be a key)</td><td>no</td><td>if its items are</td><td>yes</td><td>no</td><td>yes</td><td>no</td></tr>
    <tr><td>Access by position</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>no (by key)</td></tr>
    <tr><td>Items must be hashable</td><td>no</td><td>no</td><td>—</td><td>yes</td><td>yes</td><td>keys only</td></tr>
  </table>
  <p>The table shows that the built-ins come from two basic designs. Lists, tuples and strings are <strong>sequences</strong>: items stored in positions, fast to reach by index and slow to search. Sets and dicts are <strong>hash tables</strong>: items stored by their hash, fast to search and with no positions. Immutability links the two families, because only values that cannot change can be hashed, so tuples and strings are what supply the keys for dicts and sets. Two words in the table are easy to misread. "Ordered" is not the same as "sorted": a list keeps the order you put things in; it never sorts itself. And a dict's insertion order does not give it positions: <code>d[0]</code> looks up the key 0, it does not fetch the first entry.</p>

  <h2 id="pc-bigo"><span class="num">02</span>What Each Operation Costs</h2>
  <p>The properties tell you which containers are <em>allowed</em> for your data; the costs tell you which one is <em>fast</em> for what your code actually does. As a reminder of the notation: O(1) means the time does not grow with the number of items n, O(log n) means it grows very slowly (doubling n adds one step), O(n) means it grows in proportion to n, and O(n log n) is the cost of a good sort. "Amortised" means occasionally expensive but constant on average, as with <code>list.append</code>. The table gathers the average costs of the common operations for every container on this page.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>list</th><th>tuple</th><th>dict</th><th>set</th><th>deque</th></tr>
    <tr><td>Read by index <code>x[i]</code></td><td>O(1)</td><td>O(1)</td><td>by key O(1)</td><td>—</td><td>O(1) at ends, O(n) in middle</td></tr>
    <tr><td>Add at the end</td><td><code>append</code> O(1)*</td><td>— (new tuple, O(n))</td><td><code>d[k] = v</code> O(1)*</td><td><code>add</code> O(1)*</td><td><code>append</code> O(1)</td></tr>
    <tr><td>Add at the front</td><td><code>insert(0, x)</code> O(n)</td><td>—</td><td>—</td><td>—</td><td><code>appendleft</code> O(1)</td></tr>
    <tr><td>Remove from the end</td><td><code>pop()</code> O(1)</td><td>—</td><td><code>popitem()</code> O(1)</td><td><code>pop()</code> O(1), arbitrary item</td><td><code>pop()</code> O(1)</td></tr>
    <tr><td>Remove from the front</td><td><code>pop(0)</code> O(n)</td><td>—</td><td>—</td><td>—</td><td><code>popleft()</code> O(1)</td></tr>
    <tr><td>Membership <code>x in c</code></td><td>O(n)</td><td>O(n)</td><td>O(1) (keys)</td><td>O(1)</td><td>O(n)</td></tr>
    <tr><td>Delete a value</td><td><code>remove(x)</code> O(n)</td><td>—</td><td><code>del d[k]</code> O(1)</td><td><code>discard(x)</code> O(1)</td><td><code>remove(x)</code> O(n)</td></tr>
    <tr><td>Loop over / copy</td><td>O(n)</td><td>O(n)</td><td>O(n)</td><td>O(n)</td><td>O(n)</td></tr>
  </table>
  <p>* amortised: the underlying array or hash table is occasionally resized. Dict and set operations are O(1) on average; they degrade to O(n) only when many keys collide, which a good hash function makes practically impossible.</p>
  <p>Two rows decide most real choices, and both were measured on the earlier pages. Membership: with 100,000 ids, <code>in</code> on a list took hundreds of microseconds while <code>in</code> on a set took well under one, thousands of times faster, and checking 20,000 customers against a list of regulars dropped from about a second to about a millisecond after one conversion to a set (<a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>). Front removal: draining 100,000 items with <code>list.pop(0)</code> took most of a second, while <code>deque.popleft()</code> took a few milliseconds (<a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>). Neither mistake changes the answer; both turn a linear program into a quadratic one, which is why they survive testing on small data and fail in production.</p>

  <h2 id="pc-choose"><span class="num">03</span>How to Choose</h2>
  <p>The method is always the same: ask what your code does most often with the data, choose the container that makes that operation cheap, and check that its rules (order, mutability, uniqueness, hashability) match what the data means. Think of a kitchen. Spoons go in a drawer you can grab from, spices on a labelled rack you can find by name, and orders on a spike where the oldest is at the bottom. Nobody keeps everything in one big box; each storage choice follows from how the thing is used.</p>
  <p>Applied to code, a handful of questions settle most cases. If you look things up by a name or id, use a <code>dict</code>; if you only need to know whether you have seen something, or need each item once, use a <code>set</code>, and a <code>frozenset</code> when that group must itself be a key. If you have a fixed bundle of different fields, such as one order, a coordinate, a composite key or several return values, use a <code>tuple</code>, or a <code>namedtuple</code> or frozen dataclass when the fields deserve names. If you have many items of the same kind whose order matters and whose number changes, use a <code>list</code>; if items also have to be added or removed at the front, use a <code>deque</code>. If you always need the smallest or most urgent item next, use <code>heapq</code>; if you keep data sorted and search it, use a sorted list with <code>bisect</code>. For counting and grouping, use <code>Counter</code> and <code>defaultdict</code>. For millions of numbers with arithmetic on all of them, use a NumPy array. For text, use <code>str</code>. The table turns this into a lookup.</p>
  <table class="tbl">
    <tr><th>Task</th><th>Use</th><th>Why</th></tr>
    <tr><td>Rows of a table, in order</td><td><code>list</code> of tuples or dicts</td><td>ordered, growable</td></tr>
    <tr><td>Config, JSON, id → record</td><td><code>dict</code></td><td>O(1) by key</td></tr>
    <tr><td>Remove duplicates, "visited", compare groups</td><td><code>set</code></td><td>O(1) membership, set algebra</td></tr>
    <tr><td>Composite key such as (customer, item)</td><td><code>tuple</code></td><td>hashable</td></tr>
    <tr><td>Frequencies</td><td><code>Counter</code></td><td>counting, <code>most_common</code></td></tr>
    <tr><td>Group records by a key</td><td><code>defaultdict(list)</code></td><td>no missing-key checks</td></tr>
    <tr><td>First-in first-out queue, BFS, last k items</td><td><code>deque</code>, <code>deque(maxlen=k)</code></td><td>O(1) at both ends</td></tr>
    <tr><td>Stack (last-in first-out), DFS</td><td><code>list</code> with <code>append</code>/<code>pop</code></td><td>O(1) at the end</td></tr>
    <tr><td>Priority queue, top-k, scheduling</td><td><code>heapq</code></td><td>O(log n) push and pop</td></tr>
    <tr><td>Search sorted data, assign to bands</td><td><code>bisect</code></td><td>O(log n) search</td></tr>
    <tr><td>Layered settings</td><td><code>ChainMap</code></td><td>looks through several dicts in turn</td></tr>
    <tr><td>Large numeric arrays</td><td>NumPy, <code>array</code></td><td>compact, vectorised</td></tr>
  </table>
  <p>Real data is rarely one container; it is containers inside containers, and the same questions apply at each level. Here are the four nested shapes you will meet most often, all built from the stall's six orders:</p>
  <div class="fx" data-lang="py">from collections import defaultdict, Counter
items_by_customer = defaultdict(list)                  # dict of lists: grouping
for name, item, qty in orders:
    items_by_customer[name].append(item)
print(dict(items_by_customer))

pairs = {(name, item) for name, item, qty in orders}   # set of tuples: distinct combinations
print(len(pairs), ("Ben", "samosa") in pairs)

rows = [{"customer": n, "item": i, "qty": q} for n, i, q in orders]   # list of dicts
print(rows[0])

print(Counter(item for _, item, _ in orders).most_common(2))          # Counter: frequencies</div>
  <div class="fx" data-lang="text">{'Asha': ['masala chai', 'ginger chai'], 'Ben': ['samosa', 'masala chai'], 'Chen': ['masala chai'], 'Dia': ['bun maska']}
6 True
{'customer': 'Asha', 'item': 'masala chai', 'qty': 2}
[('masala chai', 3), ('samosa', 1)]</div>
  <p>A <strong>dict of lists</strong> groups records under a key: each customer's items, in order. A <strong>set of tuples</strong> holds distinct combinations, and it only works because tuples are hashable; a set of lists would raise <code>TypeError</code>. Here it answers "did Ben ever order samosa?" in O(1). A <strong>list of dicts</strong> is the shape of JSON records and of a table of rows, which is exactly what <code>pd.DataFrame(rows)</code> expects (<a class="xref" data-note="da_pandas">Pandas</a>). And a <strong>Counter</strong> counts how often each order line names an item. In each case the outer container was chosen for how the collection is used, and the inner one for how each element is used.</p>

  <h2 id="pc-deque"><span class="num">04</span>deque</h2>
  <p>Customers queue at the counter and are served in the order they arrived: first in, first out. A list handles the arriving end well (<code>append</code> is O(1)) but the serving end badly, because <code>pop(0)</code> shifts every remaining reference in its array. A <strong>deque</strong> (short for "double-ended queue", pronounced "deck") is a sequence designed so that adding and removing at <em>both</em> ends is O(1). Inside, it is not one continuous array but a chain of fixed-size blocks linked to each other, so the front can grow or shrink without moving anything else. Think of a train: you can couple or uncouple carriages at either end without touching the ones in the middle.</p>
  <div class="fx" data-lang="py">from collections import deque
queue = deque(["Asha", "Ben", "Chen"])
queue.append("Dia")              # joins at the back
queue.appendleft("Esha")         # Esha only needs change: goes to the front
print(queue)
served = queue.popleft()         # serve from the front: O(1)
print(served, queue)
queue.rotate(1)                  # move the last person to the front
print(queue)

recent = deque(maxlen=3)         # only the last 3 orders are kept
for name, item, qty in orders:
    recent.append(item)          # the oldest is dropped automatically
print(recent)</div>
  <div class="fx" data-lang="text">deque(['Esha', 'Asha', 'Ben', 'Chen', 'Dia'])
Esha deque(['Asha', 'Ben', 'Chen', 'Dia'])
deque(['Dia', 'Asha', 'Ben', 'Chen'])
deque(['masala chai', 'bun maska', 'masala chai'], maxlen=3)</div>
  <p>The first part shows the four end operations: <code>append</code> and <code>pop</code> work on the right-hand end, <code>appendleft</code> and <code>popleft</code> on the left, all in constant time. Esha jumped to the front with <code>appendleft</code> and was served first by <code>popleft</code>. <code>rotate(1)</code> moved the last person, Dia, round to the front; a negative number rotates the other way. The second part shows a feature lists do not have at all. A deque created with <code>maxlen=3</code> is a bounded buffer: once it holds three items, each new append silently drops the oldest from the other end. After all six orders, it holds the last three items ordered. This is the standard tool for "the last k events", moving averages and keeping the tail of a log.</p>
  <p>The same first-in first-out behaviour is the heart of <strong>breadth-first search</strong> (BFS), a classic algorithm that explores a network level by level: first everything one step away, then everything two steps away, and so on. Suppose a delivery helper starts at the chai stall and the lanes connect stalls like this:</p>
  <div class="fx" data-lang="py">from collections import deque
lanes = {"chai": ["bakery", "fruit"], "bakery": ["press"], "fruit": ["press", "tailor"],
         "press": [], "tailor": []}
def bfs(graph, start):
    seen, order, frontier = {start}, [], deque([start])
    while frontier:
        place = frontier.popleft()           # oldest discovered first
        order.append(place)
        for nxt in graph[place]:
            if nxt not in seen:              # set: O(1) "visited?" check
                seen.add(nxt)
                frontier.append(nxt)
    return order
print(bfs(lanes, "chai"))</div>
  <div class="fx" data-lang="text">['chai', 'bakery', 'fruit', 'press', 'tailor']</div>
  <p>The deque holds places discovered but not yet visited, and <code>popleft</code> always takes the one discovered earliest, which is what makes the search go level by level: the chai stall, then its two neighbours (bakery and fruit), then the places two lanes away (press and tailor). Notice that the function uses three containers, each chosen for its job: a dict for the map (look up a place's neighbours), a set for "already seen" (fast membership), and a deque for the frontier (first in, first out). With a list and <code>pop(0)</code> in place of the deque, every step would cost O(n). Graph algorithms are covered in <a class="xref" data-note="dsa_graphs">DSA: Graphs</a>.</p>
  <p>A deque is not a better list in every way. Reaching an item in the middle, <code>d[i]</code>, is O(n), because Python has to walk along the blocks; it has no slicing and no <code>sort</code>. For a stack, where you only add and remove at one end, a plain list is just as fast. And for queues shared between threads, use <code>queue.Queue</code>, which adds the locking and waiting that threads need.</p>

  <h2 id="pc-heap"><span class="num">05</span>heapq</h2>
  <p>Now the kitchen. Order tickets arrive in any order, but the cook should always make whichever order is due soonest. One option is to keep a list and sort it after every new ticket, but sorting costs O(n log n) each time. Another is to scan the whole list for the minimum before every order, O(n) each time. What we want is a structure that hands out the smallest item quickly and accepts new items quickly, without keeping everything fully sorted. That structure is a <strong>heap</strong>, also called a <strong>priority queue</strong>.</p>
  <p>Python's <code>heapq</code> module keeps a <strong>binary min-heap</strong> inside an ordinary list. The list is arranged so that every item is less than or equal to the two items "below" it, which sit at positions <code>2i + 1</code> and <code>2i + 2</code>. That one rule guarantees that the smallest item is always at position 0, but it says nothing about the order of the rest. Think of a sports league's knockout bracket drawn upside down: the overall winner is guaranteed to be at the top, and each match winner is better than the two players below it, but the bracket is not a full ranking. Pushing a new item puts it at the end and swaps it upward past any larger parent; popping removes the top, moves the last item there and swaps it downward. Each of these walks one path through a tree of height about log₂ n, so both take O(log n).</p>
  <div class="fx" data-lang="py">import heapq
tickets = []                                          # (minutes until due, customer, item)
heapq.heappush(tickets, (6, "Ben", "samosa"))
heapq.heappush(tickets, (2, "Asha", "masala chai"))
heapq.heappush(tickets, (9, "Dia", "bun maska"))
heapq.heappush(tickets, (4, "Chen", "masala chai"))
heapq.heappush(tickets, (3, "Asha", "ginger chai"))
print(tickets)                                        # NOT sorted
print("next up:", tickets[0])                         # but the smallest is always first
while tickets:
    print(heapq.heappop(tickets))                     # comes out in order</div>
  <div class="fx" data-lang="text">[(2, 'Asha', 'masala chai'), (3, 'Asha', 'ginger chai'), (9, 'Dia', 'bun maska'), (6, 'Ben', 'samosa'), (4, 'Chen', 'masala chai')]
next up: (2, 'Asha', 'masala chai')
(2, 'Asha', 'masala chai')
(3, 'Asha', 'ginger chai')
(4, 'Chen', 'masala chai')
(6, 'Ben', 'samosa')
(9, 'Dia', 'bun maska')</div>
  <p>Look at the list printed after the pushes. It is not sorted, yet the ticket due in 2 minutes is at position 0, and if you check the rule, every item is no larger than the items at <code>2i + 1</code> and <code>2i + 2</code>. <code>tickets[0]</code> peeks at the next order in O(1) without removing it. Popping repeatedly then returns the tickets in order of urgency, 2, 3, 4, 6, 9, each pop costing O(log n). The entries are tuples, and tuples compare their first item first, so the minutes decide the order; this <code>(priority, data)</code> pattern is how a heap becomes a priority queue.</p>
  <p>That tuple comparison has a catch. If two tickets have the same priority, Python moves on to compare their second items, and if those cannot be compared, the push fails. The usual fix is to put a running counter in the middle, so ties are broken by arrival order and the data is never compared:</p>
  <div class="fx" data-lang="py">import heapq, itertools
tickets = []
heapq.heappush(tickets, (5, {"customer": "Ben"}))
try:
    heapq.heappush(tickets, (5, {"customer": "Dia"}))  # same priority: compares the dicts
except TypeError as e:
    print("TypeError:", e)

arrival = itertools.count()                            # 0, 1, 2, ...
tickets = []
for who in ["Ben", "Dia", "Asha"]:
    heapq.heappush(tickets, (5, next(arrival), {"customer": who}))
print([heapq.heappop(tickets)[2]["customer"] for _ in range(3)])</div>
  <div class="fx" data-lang="text">TypeError: '&lt;' not supported between instances of 'dict' and 'dict'
['Ben', 'Dia', 'Asha']</div>
  <p>The first attempt fails because two dicts cannot be compared with <code>&lt;</code>. With the counter, equal priorities are decided by the unique arrival number, so the dicts are never compared, and equal-priority tickets come out first come, first served.</p>
  <p>Three more heap tools come up constantly. <code>heapify</code> turns an existing list into a heap in place in O(n), faster than pushing items one by one. <code>nlargest(k, ...)</code> and <code>nsmallest(k, ...)</code> return the top k items in about O(n log k), which beats sorting everything when k is small; they accept a <code>key</code> like <code>sorted</code>. And because <code>heapq</code> only offers a min-heap, the standard trick for a max-heap is to push negated numbers:</p>
  <div class="fx" data-lang="py">import heapq
print(heapq.nlargest(2, bills.items(), key=lambda kv: kv[1]))   # top 2 customers
print(heapq.nsmallest(2, menu, key=menu.get))                  # 2 cheapest items
amounts = list(bills.values())
max_heap = [-a for a in amounts]                               # negate for a max-heap
heapq.heapify(max_heap)                                        # O(n), in place
print(-heapq.heappop(max_heap), -heapq.heappop(max_heap))</div>
  <div class="fx" data-lang="text">[('Ben', 85), ('Asha', 65)]
['samosa', 'masala chai']
85 65</div>
  <p>The two biggest bills are Ben's 85 and Asha's 65, and the two cheapest items are samosa and masala chai. In the max-heap, the largest amount becomes the most negative number, so it sits at the top and pops first; negating it again gives back 85, then 65. Heap-based interview patterns, such as "kth largest element" and "merge k sorted lists", are covered in <a class="xref" data-note="dsa_heaps">DSA: Heaps</a>.</p>

  <h2 id="pc-bisect"><span class="num">06</span>bisect</h2>
  <p>The stall gives discounts by bill size: nothing below ₹50, 5% from ₹50, 10% from ₹80, and 15% from ₹100. Given a bill, which tier is it in? An <code>if/elif</code> chain works for three cutoffs but becomes unmanageable with fifty, and scanning a list of cutoffs is O(n). Because the cutoffs are sorted, we can do much better with <strong>binary search</strong>: look at the middle cutoff, decide whether the bill is above or below it, and throw away the half that cannot contain the answer. Each step halves the remaining range, so a million cutoffs need only about 20 steps, which is O(log n). It is how you find a word in a paper dictionary: open in the middle, see whether your word comes before or after, and repeat on the correct half.</p>
  <p>Python's <code>bisect</code> module does binary search on a sorted list. <code>bisect_right(cutoffs, x)</code> returns the position where <code>x</code> would be inserted to keep the list sorted, placing it after any equal values, which is exactly "how many cutoffs are less than or equal to x". That count is the tier number:</p>
  <div class="fx" data-lang="py">import bisect
cutoffs = [50, 80, 100]              # sorted tier boundaries in rupees
rates = [0, 5, 10, 15]               # one more rate than cutoffs
def discount(bill):
    return rates[bisect.bisect_right(cutoffs, bill)]
for who, bill in bills.items():
    print(who, bill, f"{discount(bill)}%")
print(bisect.bisect_left(cutoffs, 80), bisect.bisect_right(cutoffs, 80))   # exactly on a cutoff</div>
  <div class="fx" data-lang="text">Asha 65 5%
Ben 85 10%
Chen 20 0%
Dia 60 5%
1 2</div>
  <p>Chen's ₹20 is below every cutoff, so <code>bisect_right</code> returns 0 and the rate is 0%. Dia's ₹60 is above one cutoff, giving 5%; Asha's ₹65 also gets 5%; Ben's ₹85 is above two cutoffs, giving 10%. The last line shows the difference between the two versions for a value that equals a cutoff: <code>bisect_left</code> places 80 <em>before</em> the existing 80 (position 1), <code>bisect_right</code> places it <em>after</em> (position 2). Since the rule is "10% from ₹80", a bill of exactly 80 should count the 80 cutoff as passed, so <code>bisect_right</code> is the right choice here. Choosing left or right is always a question of which side a tie belongs to.</p>
  <p>Binary search also answers range questions on sorted data. If we keep the day's bill amounts in a sorted list, <code>insort</code> adds a new bill in the right place, and two bisects count how many bills fall in a range:</p>
  <div class="fx" data-lang="py">import bisect
amounts = sorted(bills.values())                # [20, 60, 65, 85]
bisect.insort(amounts, 70)                      # insert, keeping the list sorted
print(amounts)
lo, hi = bisect.bisect_left(amounts, 60), bisect.bisect_right(amounts, 80)
print("bills from 60 to 80:", hi - lo, amounts[lo:hi])</div>
  <div class="fx" data-lang="text">[20, 60, 65, 70, 85]
bills from 60 to 80: 3 [60, 65, 70]</div>
  <p>The new bill of 70 went between 65 and 85. Finding the range 60 to 80 took two binary searches, and their difference, 3, is the number of bills inside it. One cost is easy to overlook: <code>insort</code> <em>finds</em> the position in O(log n), but inserting into a list still shifts everything after it, which is O(n). A sorted list with <code>bisect</code> is ideal when you search often and insert rarely; if you insert constantly, a heap (when you only need the minimum) or a dedicated sorted-container library is a better fit. Binary search as an interview technique is covered in <a class="xref" data-note="dsa_binsearch">DSA: Binary Search</a>.</p>

  <h2 id="pc-coll"><span class="num">07</span>OrderedDict and ChainMap</h2>
  <p>The <code>collections</code> module provides specialised containers, each built on the basic ones to remove the boilerplate of one common pattern. You have already met most of them: <code>Counter</code> for counting and <code>defaultdict</code> for grouping in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>, <code>namedtuple</code> in <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>, and <code>deque</code> above. Two remain, and each solves a problem that comes up in interviews and in real systems.</p>
  <p>The first problem is a cache. Suppose looking up a customer's loyalty record is slow (it comes from a server), so the stall keeps the most recent lookups in memory, but only a limited number of them. When the cache is full and a new customer arrives, which entry should be thrown out? The usual answer is the <strong>least recently used</strong> one, giving an <strong>LRU cache</strong>. Since Python 3.7 a plain dict remembers insertion order, but an <code>OrderedDict</code> adds two methods that make LRU easy: <code>move_to_end(key)</code> marks an entry as just used, and <code>popitem(last=False)</code> removes the oldest entry. Think of a short shelf by the till: whenever a record is used it goes back on the right-hand end, and when the shelf is full the record on the far left, untouched the longest, is filed away.</p>
  <div class="fx" data-lang="py">from collections import OrderedDict
cache = OrderedDict()
def lookup(name, capacity=2):
    if name in cache:
        cache.move_to_end(name)              # mark as most recently used
        return f"{name}: hit"
    cache[name] = bills[name]                # pretend this was a slow fetch
    if len(cache) &gt; capacity:
        old, _ = cache.popitem(last=False)   # evict the least recently used
        return f"{name}: miss, evicted {old}"
    return f"{name}: miss"
for name in ["Asha", "Ben", "Asha", "Chen", "Ben"]:
    print(lookup(name), list(cache))</div>
  <div class="fx" data-lang="text">Asha: miss ['Asha']
Ben: miss ['Asha', 'Ben']
Asha: hit ['Ben', 'Asha']
Chen: miss, evicted Ben ['Asha', 'Chen']
Ben: miss, evicted Asha ['Chen', 'Ben']</div>
  <p>Follow the cache contents on the right. Asha and Ben are fetched and stored. When Asha is looked up again it is a hit, and <code>move_to_end</code> moves her to the right-hand, most-recent end, so Ben is now the oldest. Chen's arrival overflows the capacity of 2, so the least recently used entry, Ben, is evicted, even though he was added after Asha. When Ben comes back he is a miss again and Asha, now the oldest, is evicted. Both operations are O(1). For caching the results of a function, the standard library already provides this as a decorator, <code>functools.lru_cache</code>, covered in <a class="xref" data-note="py_decorators">Decorators</a>.</p>
  <p>The second problem is layered settings. The stall chain has default settings, the branch overrides some of them, and today's special rules override a few more. Merging these into one dict copies data and loses track of where each value came from. A <code>ChainMap</code> instead keeps the dicts separate and searches them in order, returning the first match. It is like asking the shift manager first, then the branch manager, then the head office rulebook, and taking the first answer you get:</p>
  <div class="fx" data-lang="py">from collections import ChainMap
defaults = {"tax": 0.05, "opens": "07:00", "currency": "Rs"}
branch   = {"opens": "06:30"}
today    = {"tax": 0.0}                         # tax holiday
settings = ChainMap(today, branch, defaults)    # search today, then branch, then defaults
print(settings["tax"], settings["opens"], settings["currency"])
settings["opens"] = "08:00"                     # writes go to the FIRST dict only
print(today, branch["opens"])
print(dict(settings))</div>
  <div class="fx" data-lang="text">0.0 06:30 Rs
{'tax': 0.0, 'opens': '08:00'} 06:30
{'tax': 0.0, 'opens': '08:00', 'currency': 'Rs'}</div>
  <p>The tax comes from <code>today</code>, the opening time from <code>branch</code>, and the currency from <code>defaults</code>, without copying or merging anything. Writing through the ChainMap changes only the first dict, so the late opening was recorded in <code>today</code> and the branch's own setting is untouched. <code>dict(settings)</code> flattens the view into one ordinary dict when you need it. The same pattern appears in command-line tools (command-line flags over environment variables over defaults) and in how Python itself looks up names through nested scopes.</p>

  <h2 id="pc-array"><span class="num">08</span>Arrays vs Lists</h2>
  <p>Suppose the stall chain records cups sold per day at every branch for years, a million numbers, and wants to apply arithmetic to all of them. A list can hold them, but it is a poor fit. A Python list stores <em>references</em>, and every number it refers to is a full Python object with its own type information and reference count: a float object takes 24 bytes, plus the 8-byte reference to it in the list. A <strong>typed array</strong> stores the raw numbers themselves, side by side, all of the same type, the way a spreadsheet column would. Think of the difference between a filing cabinet with a separate labelled folder for every number and a single printed table of numbers.</p>
  <div class="fx" data-lang="py">import sys, array, timeit
import numpy as np
n = 1_000_000
as_list = [float(i) for i in range(n)]
as_array = array.array("d", as_list)        # "d" = C double: 8 bytes each
as_np = np.arange(n, dtype=np.float64)

list_bytes = sys.getsizeof(as_list) + sum(sys.getsizeof(x) for x in as_list)
print(f"list : {list_bytes / 1e6:5.1f} MB  (references + one float object each)")
print(f"array: {sys.getsizeof(as_array) / 1e6:5.1f} MB")
print(f"numpy: {as_np.nbytes / 1e6:5.1f} MB")

t_list = timeit.timeit(lambda: [x * 2 for x in as_list], number=5) / 5
t_np = timeit.timeit(lambda: as_np * 2, number=5) / 5
print(f"double every element: list {t_list * 1000:.1f} ms, numpy {t_np * 1000:.2f} ms")
try:
    as_array.append("chai")
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">list :  32.4 MB  (references + one float object each)
array:   8.0 MB
numpy:   8.0 MB
double every element: list 54.7 ms, numpy 0.96 ms
TypeError: must be real number, not str</div>
  <p>The list needs about four times as much memory as the arrays, because of the separate object behind every number. The standard library's <code>array.array</code> stores the same million values in 8 MB, 8 bytes each, and refuses values of the wrong type, as the last line shows. But arithmetic on an <code>array.array</code> still happens one element at a time in Python. A NumPy array has the same compact layout and adds <strong>vectorised</strong> operations: <code>as_np * 2</code> runs a single loop written in C over the raw numbers, which here was dozens of times faster than the list comprehension (times are approximate). For any serious numeric work, use NumPy, or pandas, which is built on it.</p>
  <p>Two warnings. The speed only comes from operating on whole arrays at once: looping over a NumPy array element by element in Python, or converting between lists and arrays inside a loop, throws the advantage away. And NumPy slicing behaves differently from list slicing: slicing a list makes a copy, while slicing a NumPy array returns a <em>view</em> that shares memory with the original, so changing the slice changes the array.</p>

  <h2 id="pc-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The two most expensive mistakes have already been measured: a membership test on a list inside a loop (build a set once, outside the loop) and a list used as a queue (use a <code>deque</code>). Close behind is expecting positions from containers that do not have them. A dict is ordered, and a set prints in some order, so it is tempting to ask for "the first one":</p>
  <div class="fx" data-lang="py">customers = {"Asha", "Ben", "Chen", "Dia"}
try:
    customers[0]
except TypeError as e:
    print("TypeError:", e)
try:
    menu[0]
except KeyError as e:
    print("KeyError:", e)
print(next(iter(menu)), sorted(customers)[0])</div>
  <div class="fx" data-lang="text">TypeError: 'set' object is not subscriptable
KeyError: 0
masala chai Asha</div>
  <p>A set has no positions at all, so indexing it is a <code>TypeError</code>. A dict does accept square brackets, but <code>menu[0]</code> means "the value stored under the key 0", which does not exist, so it is a <code>KeyError</code>. If you need the first key in insertion order, <code>next(iter(d))</code> gives it; if you need a position-based view of a set, sort it first, which also fixes the fact that a set's order can change between runs.</p>
  <p>Another mistake is choosing a set because "the data has duplicates I don't want", when the duplicates actually carry information:</p>
  <div class="fx" data-lang="py">from collections import Counter
visits = [name for name, item, qty in orders]
print(len(set(visits)), "distinct customers")
print(Counter(visits), "&lt;- the set threw these counts away")</div>
  <div class="fx" data-lang="text">4 distinct customers
Counter({'Asha': 2, 'Ben': 2, 'Chen': 1, 'Dia': 1}) &lt;- the set threw these counts away</div>
  <p>The set correctly says there are 4 distinct customers, but it discarded the fact that Asha and Ben each came twice. If you will later need "how many times", use a <code>Counter</code>, which gives the distinct items (its keys) and the counts together. The remaining mistakes are habits: using lists for everything because they are familiar; scanning a list of (key, value) pairs instead of using a dict; sorting the whole list again after every insert just to get the minimum, where a heap gives O(log n); writing <code>{}</code> for an empty set (it is a dict; use <code>set()</code>); putting lists into sets or using them as keys (use tuples); and doing heavy numeric work on Python lists instead of NumPy arrays.</p>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Properties</h3>
  <table class="tbl">
    <tr><th></th><th>Ordered</th><th>Mutable</th><th>Duplicates</th><th>Hashable</th><th>By position</th></tr>
    <tr><td>list</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>yes</td></tr>
    <tr><td>tuple</td><td>yes</td><td>no</td><td>yes</td><td>if items are</td><td>yes</td></tr>
    <tr><td>str</td><td>yes</td><td>no</td><td>yes</td><td>yes</td><td>yes</td></tr>
    <tr><td>set / frozenset</td><td>no</td><td>yes / no</td><td>no</td><td>no / yes</td><td>no</td></tr>
    <tr><td>dict</td><td>insertion</td><td>yes</td><td>keys no</td><td>no</td><td>no (by key)</td></tr>
  </table>
  <h3>Costs to remember</h3>
  <ul>
    <li><code>x in list</code> O(n); <code>x in set</code> / <code>dict</code> O(1) average.</li>
    <li><code>list.pop(0)</code>, <code>insert(0, x)</code> O(n); <code>deque.popleft()</code>, <code>appendleft</code> O(1).</li>
    <li><code>heappush</code> / <code>heappop</code> O(log n); <code>heap[0]</code> O(1); <code>heapify</code> O(n); <code>nlargest(k)</code> O(n log k).</li>
    <li><code>bisect</code> O(log n); <code>insort</code> O(n) because of the shift.</li>
    <li><code>deque[i]</code> in the middle O(n).</li>
  </ul>
  <h3>Which tool</h3>
  <table class="tbl">
    <tr><th>Need</th><th>Use</th></tr>
    <tr><td>Lookup by key</td><td><code>dict</code></td></tr>
    <tr><td>Uniqueness, fast <code>in</code></td><td><code>set</code> (<code>frozenset</code> as a key)</td></tr>
    <tr><td>Fixed record, composite key</td><td><code>tuple</code>, <code>namedtuple</code></td></tr>
    <tr><td>Ordered, growing items; stack</td><td><code>list</code></td></tr>
    <tr><td>Queue, BFS, last k</td><td><code>deque</code>, <code>deque(maxlen=k)</code></td></tr>
    <tr><td>Smallest / most urgent next, top-k</td><td><code>heapq</code></td></tr>
    <tr><td>Search sorted data, bands</td><td><code>bisect</code></td></tr>
    <tr><td>Count / group</td><td><code>Counter</code> / <code>defaultdict</code></td></tr>
    <tr><td>LRU cache; layered config</td><td><code>OrderedDict</code>; <code>ChainMap</code></td></tr>
    <tr><td>Bulk numbers</td><td>NumPy</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">q = deque(); q.append(x); q.appendleft(x); q.popleft(); deque(maxlen=3)
heapq.heappush(h, (prio, next(counter), item)); heapq.heappop(h); h[0]
heapq.heapify(xs); heapq.nlargest(k, xs, key=f); heappush(h, -x)   # max-heap
bisect.bisect_right(cutoffs, x); bisect.bisect_left(xs, x); bisect.insort(xs, x)
od.move_to_end(k); od.popitem(last=False)
ChainMap(today, branch, defaults)
np.array(xs) * 2; array.array("d", xs)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>A heap is not sorted; only <code>heap[0]</code> is guaranteed to be the minimum.</li>
    <li>Equal heap priorities compare the next tuple item; add a counter tie-breaker.</li>
    <li><code>heapq</code> is a min-heap only; negate for max.</li>
    <li><code>bisect_left</code> vs <code>bisect_right</code> differ only for equal values.</li>
    <li>Sets and dicts have no positions; <code>d[0]</code> looks up the key 0.</li>
    <li>A set drops counts; use <code>Counter</code> if counts matter.</li>
    <li>NumPy slices are views; list slices are copies.</li>
  </ul>

  <h2 id="pc-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Compare list, tuple, set and dict.</summary><div class="qa-body">A list is ordered, mutable, allows duplicates and is accessed by position; membership is O(n). A tuple is the same but immutable, so it is hashable when its items are. A set is unordered, mutable, holds unique hashable items and has O(1) membership. A dict maps unique hashable keys to values, keeps insertion order and looks up by key in O(1). Choose by what the code does most: index, search, or look up by key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a tuple instead of a list?</summary><div class="qa-body">For a fixed record where each position has a meaning, such as a coordinate or one database row, for returning several values from a function, and whenever the value must be hashable, such as a composite dict key <code>(customer, item)</code> or a set of pairs. Immutability also documents that the data should not change, and tuples are slightly smaller and faster to create.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which objects can be dict keys or set elements, and why?</summary><div class="qa-body">Only hashable objects, whose hash never changes and where equal objects have equal hashes: numbers, strings, bytes, frozensets, and tuples made of hashable items. Lists, dicts and sets are mutable, so they have no hash. The reason is that a hash table files each key in a slot chosen from its hash; if the key changed, later lookups would search the wrong slot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your code checks <code>if user_id in seen_ids</code> inside a loop over a million events and it is slow. Why, and how do you fix it?</summary><div class="qa-body"><code>seen_ids</code> is probably a list, so each check scans it, O(n), and the whole loop becomes O(n × m). Convert it to a set once, before the loop, and each check becomes O(1) on average, making the loop linear. Do not convert inside the loop, which rebuilds the set every time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you implement a stack and a queue in Python?</summary><div class="qa-body">A stack (last in, first out) is a plain list: <code>append</code> to push and <code>pop()</code> to pop, both O(1). A queue (first in, first out) should be a <code>collections.deque</code>: <code>append</code> to enqueue and <code>popleft()</code> to dequeue, both O(1). Using <code>list.pop(0)</code> for a queue is O(n) per removal. Between threads, use <code>queue.Queue</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deque and what are its trade-offs?</summary><div class="qa-body">A double-ended queue implemented as a linked chain of fixed-size blocks, giving O(1) <code>append</code>, <code>appendleft</code>, <code>pop</code> and <code>popleft</code>. The trade-offs are that indexing into the middle is O(n), there is no slicing or <code>sort</code>, and it uses slightly more memory per item than a list. It also offers <code>rotate</code> and a <code>maxlen</code> bound.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you keep only the last 1,000 log lines in memory?</summary><div class="qa-body"><code>deque(maxlen=1000)</code>. Each <code>append</code> is O(1), and once the deque is full, appending automatically drops the oldest line from the other end. A list with <code>pop(0)</code> would be O(n) per line, and slicing the list every time would copy it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you implement a priority queue? What about equal priorities?</summary><div class="qa-body">Use <code>heapq</code> on a list, pushing <code>(priority, item)</code> tuples: <code>heappush</code> and <code>heappop</code> are O(log n), and <code>heap[0]</code> peeks at the smallest. Equal priorities make Python compare the items, which fails for dicts or custom objects, so push <code>(priority, next(counter), item)</code> with <code>itertools.count()</code>; that also makes equal priorities first come, first served. For a max-heap, negate the priority.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the k largest elements of a list of n numbers. What is the complexity?</summary><div class="qa-body"><code>heapq.nlargest(k, xs)</code> keeps a heap of size k while scanning, so it runs in O(n log k) time and O(k) memory. Sorting and slicing, <code>sorted(xs)[-k:]</code>, is O(n log n). When k is close to n, sorting is just as good; when k is 1, use <code>max</code>, which is O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>heapify</code> do, and is a heap a sorted list?</summary><div class="qa-body"><code>heapq.heapify(xs)</code> rearranges a list in place, in O(n), so that every item is less than or equal to its children at positions <code>2i + 1</code> and <code>2i + 2</code>. That guarantees only that <code>xs[0]</code> is the minimum; the rest is partially ordered, not sorted. To get sorted output you pop repeatedly, which is heapsort, O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>bisect</code> used for?</summary><div class="qa-body">Binary search on a sorted list in O(log n): <code>bisect_left</code> and <code>bisect_right</code> return the insertion point before or after equal items, and <code>insort</code> inserts while keeping order (O(n) because of the shift). Typical uses are mapping a value to a band (grades, discount tiers), counting items in a range of sorted data, and keeping a sorted list that is searched often but changed rarely.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>Counter</code> vs <code>defaultdict(int)</code>?</summary><div class="qa-body">Both treat missing keys as 0 for counting. <code>Counter</code> adds counting tools: build directly from an iterable, <code>most_common(k)</code>, arithmetic between counters, and <code>total()</code>; and reading a missing key does not insert it. <code>defaultdict(int)</code> is a plain dict with a default factory, and reading a missing key does insert it. Use <code>Counter</code> for frequencies and <code>defaultdict</code> for general accumulation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>ChainMap</code> for?</summary><div class="qa-body">It groups several dicts into one view that searches them in order and returns the first match, without copying or merging. It suits layered configuration (command-line flags over environment variables over defaults) and nested scopes. Writes and deletions affect only the first dict.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you implement an LRU cache?</summary><div class="qa-body">Use an <code>OrderedDict</code>. On a hit, <code>move_to_end(key)</code> marks the entry as most recently used; on a miss, insert it, and if the size exceeds the capacity, <code>popitem(last=False)</code> evicts the least recently used. Both are O(1). The general structure behind it is a hash map plus a doubly linked list. For caching a function's results, use <code>functools.lru_cache</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>list vs <code>array.array</code> vs NumPy array?</summary><div class="qa-body">A list holds references to separate Python objects of any type: flexible, but about 32 bytes per float. <code>array.array</code> stores raw values of one type compactly (8 bytes per double) but still processes them one at a time in Python. A NumPy array is equally compact and adds vectorised operations in C, typically tens of times faster for arithmetic. Use NumPy or pandas for numeric data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you remove duplicates while keeping order? And count distinct items?</summary><div class="qa-body">Keep order with <code>list(dict.fromkeys(xs))</code>, which is O(n) because dict keys are unique and ordered; <code>list(set(xs))</code> loses the order. Count distinct items with <code>len(set(xs))</code>. If you also need how often each appears, use <code>Counter(xs)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which data structures would you use to represent a graph and run BFS?</summary><div class="qa-body">An adjacency list: a dict from each node to a list (or set) of its neighbours, often a <code>defaultdict(list)</code>. For BFS, use a <code>deque</code> as the frontier, with <code>popleft</code> to take the oldest node, and a set of visited nodes for O(1) checks. The whole search is O(V + E). For DFS, use a list as a stack, or recursion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a set's or dict's lookup O(1) only "on average"?</summary><div class="qa-body">A lookup hashes the key and probes a few slots. If many keys collide, the probe sequence gets long, and in the worst case, when every key collides, a lookup is O(n). Python keeps the table under about two-thirds full and uses well-mixed (and, for strings, randomly salted) hashes, so long probe chains practically never happen.</div></details>
</main>
`
});
