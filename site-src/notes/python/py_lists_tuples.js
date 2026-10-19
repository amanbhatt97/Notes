// notes/python/py_lists_tuples.js — Lists & Tuples
Object.assign(TOPIC_CONTENT, {
  "py_lists_tuples": `<main>
<h1>Lists &amp; Tuples</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Lists &amp; Tuples</span></div>
  <p class="lead">A list keeps many values in order and lets you change them; a tuple keeps a few values in order and promises never to change. Together they hold almost every "row" and "column" of data you will touch before numpy and pandas. This note teaches both completely on one running example, the six orders of Chai Corner's Monday morning: indexing and slicing traced cut by cut, how a list grows and what each operation costs, comprehensions desugared into the loops they replace, sorting with <code>key=</code>, the three kinds of "copy" traced with <code>id()</code>, the <code>[[0]*3]*3</code> trap, tuples as records, packing and unpacking, <code>namedtuple</code>, and why a tuple can be a dict key while a list cannot. Run on Python 3.13.</p>

  <h2 id="plt-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="plt-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="120" y="6" width="400" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Fundamentals · Values &amp; Types · Control Flow · Functions</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#plt-ga)"/>
<line x1="320" y1="100" x2="110" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#plt-ga)"/>
<line x1="320" y1="100" x2="320" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#plt-ga)"/>
<line x1="320" y1="100" x2="530" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#plt-ga)"/>
<line x1="200" y1="152" x2="228" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#plt-ga)"/>
<line x1="410" y1="152" x2="438" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#plt-ga)"/>
<rect x="210" y="62" width="220" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="400">Python Collections: the map</text>
<text x="320" y="94" text-anchor="middle" class="tm" font-size="10">which container, and why</text>
<rect x="20" y="132" width="180" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="110" y="149" text-anchor="middle" font-size="12" font-weight="700">Lists &amp; Tuples</text>
<text x="110" y="164" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · order · fixed records</text>
<rect x="230" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="149" text-anchor="middle" font-size="12" font-weight="400">Dicts &amp; Sets</text>
<text x="320" y="164" text-anchor="middle" class="tm" font-size="10">lookup by key · unique</text>
<rect x="440" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="149" text-anchor="middle" font-size="12" font-weight="400">Strings</text>
<text x="530" y="164" text-anchor="middle" class="tm" font-size="10">text is a sequence too</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#plt-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Iterators &amp; Generators · OOP · DSA: Arrays, Hashing · Pandas</text>
</svg><figcaption>The Python Collections group. Read the map first, then left to right: each note answers a question the one before could not. The dotted arrows are the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_ds">Python Collections: the map</a></b><span>The map showed why one variable is not enough (a stall has many orders) and gave each container its job. It also introduced the running example: Chai Corner's Monday orders. <a class="xref" data-note="py_fundamentals">Python Fundamentals</a> (and <a class="xref" data-note="py_values">Values &amp; Types</a>) taught that a name is a tag tied to an object, and that some objects can change (mutable) while others cannot (immutable). Both ideas are used on every line below.</span></li>
    <li><b>This note adds: the two ordered containers</b><span>The list (many values, in order, changeable) and the tuple (a fixed record). How to reach any part of them, how to grow them cheaply, how to build and sort them, and how to copy them without surprises.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a></b><span>A list can only find things by position or by scanning every item. "What does a samosa cost?" and "has Esha been here today?" need a container that jumps straight to the answer. The last section of this note (tuples are hashable) is exactly the key that opens that door. Later: <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> explain what a <code>for</code> loop really does with a list, and <a class="xref" data-note="dsa_arrays">Arrays &amp; Two Pointers</a> uses lists for interview patterns.</span></li>
  </ol>

  <h2 id="plt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers come from the running example (section 01).</p>
  <ol class="story">
    <li><b>List</b><span>Q: how do we keep all six orders of the morning, in the order they came? → One list holding six references: <code>len(orders)</code> is 6. But how do we reach "the fourth order" or "the last one"?</span></li>
    <li><b>Indexing</b><span>Q: how do we get one item? → By position, from 0: <code>names[3]</code> is "Chen"; negative positions count from the end: <code>names[-1]</code> is "Ben". But we often want a whole stretch, like "the first two orders"…</span></li>
    <li><b>Slicing</b><span>Q: how do we get a piece? → <code>[start:stop:step]</code>, stop not included: <code>names[1:4]</code> is Ben, Asha, Chen; <code>[::-1]</code> reverses. But the day goes on and orders keep coming…</span></li>
    <li><b>Changing a list</b><span>Q: how do we add and remove orders? → <code>append</code>, <code>extend</code>, <code>insert</code>, <code>pop</code>, <code>remove</code>. But are they all equally cheap? No: <code>pop(0)</code> on 100,000 items took about 0.9 s, a deque about 0.005 s, because a list is an array that must shift…</span></li>
    <li><b>Comprehensions</b><span>Q: we keep writing "empty list, loop, if, append" to build new lists. Is there a shorter way? → <code>[qty for name, item, qty in orders if "chai" in item]</code> gives [2, 1, 1, 2]. But the results come out in arrival order, and the owner wants "biggest order first"…</span></li>
    <li><b>Sorting</b><span>Q: how do we put items in a chosen order? → <code>sorted(orders, key=…)</code> for a new list, <code>.sort()</code> in place; stable, so two passes give "by qty, then by name". But we passed our list into functions and copied it around. Did anybody change it behind our back?</span></li>
    <li><b>Aliasing, shallow and deep copy</b><span>Q: when are two names the same list, and how do we get a real copy? → <code>b = a</code> is the same object (same <code>id</code>); <code>.copy()</code> copies the outer list only; <code>deepcopy</code> copies every level. The same "shared reference" causes the grid trap: <code>[[0]*3]*3</code> is three names for one row. But some data should never change at all…</span></li>
    <li><b>Tuple</b><span>Q: how do we store one order so nobody can edit it by accident? → A tuple: <code>order[2] = 3</code> raises TypeError. But how do we get the parts back out conveniently?</span></li>
    <li><b>Packing &amp; unpacking</b><span>Q: how do we split a record into names? → <code>name, item, qty = order</code>; <code>first, *rest = names</code>; swaps; "returning two values". But <code>o[2]</code> still says nothing about what slot 2 means…</span></li>
    <li><b>namedtuple</b><span>Q: can a tuple have field names? → <code>Order(customer, item, qty)</code>: <code>o.qty</code> and <code>o[2]</code> both work. And because a tuple never changes…</span></li>
    <li><b>Hashable tuples</b><span>Q: can a record be used as a label to look things up? → Yes: a tuple's hash never changes, so <code>("Ben", "masala chai")</code> can be a dict key (total 2 cups); a list cannot (TypeError: unhashable). How that lookup works is the next note.</span></li>
  </ol>

  <h2 id="plt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Lists &amp; Tuples</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">List basics</div>
        <ul>
          <li><b>list</b> — ordered, changeable, duplicates OK; holds references, not copies</li>
          <li><b>Index</b> from 0; <code>-1</code> = last; out of range → IndexError</li>
          <li><b>Slice</b> <code>[start:stop:step]</code>; stop excluded; never raises; <code>[::-1]</code> reverses</li>
          <li>💡 indices are cuts between bread slices</li>
          <li>Slice assignment can grow/shrink: <code>q[1:3] = [30, 10, 99]</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Changing &amp; cost</div>
        <ul>
          <li><b>append</b> one item O(1)*; <b>extend</b> each item; <b>insert(i)</b> O(n)</li>
          <li><b>pop()</b> O(1); <b>pop(0)</b> O(n) → <code>deque.popleft()</code></li>
          <li><b>remove/index/in</b> search by value O(n)</li>
          <li>Dynamic array: spare room 4 → 8 → 16 → 24 references</li>
          <li>⚠ in-place methods return <code>None</code>: <code>q = q.sort()</code> loses q</li>
          <li>⚠ <code>append([..])</code> nests; <code>extend("Ben")</code> adds letters</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Comprehensions</div>
        <ul>
          <li><code>[expr for x in xs if cond]</code> = loop + if + append</li>
          <li><b>if</b> at the end filters; <b>if/else</b> at the front chooses</li>
          <li>Nested: outer loop first <code>[q for hour in h for n, q in hour]</code></li>
          <li><code>sum(q for …)</code> generator: no list built</li>
          <li>A little faster than append loops; &gt;2 levels → write a function</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sorting</div>
        <ul>
          <li><code>sorted(x)</code> → NEW list; <code>x.sort()</code> → in place, None</li>
          <li><code>key=</code> function per item: <code>lambda o: o[2]</code>, <code>itemgetter(1, 0)</code>, <code>str.lower</code></li>
          <li><code>reverse=True</code>; tuple keys <code>(-qty, name)</code> for multi-key</li>
          <li><b>Stable</b>: ties keep their order → sort by secondary, then primary</li>
          <li>O(n log n) (Timsort); mixed types → TypeError</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Copies</div>
        <ul>
          <li><b>Alias</b> <code>b = a</code>: same object, same <code>id</code></li>
          <li><b>Shallow</b> <code>a.copy()</code>, <code>a[:]</code>, <code>list(a)</code>: new outer, shared inner</li>
          <li><b>Deep</b> <code>copy.deepcopy(a)</code>: every level new</li>
          <li>💡 shallow = photocopy of the contents page</li>
          <li>⚠ <code>[[0]*3]*3</code> = one row, three references → comprehension</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tuples</div>
        <ul>
          <li><b>tuple</b> — ordered, fixed; a record where each slot has a meaning</li>
          <li>The comma makes it: <code>(5)</code> is int, <code>(5,)</code> is a tuple</li>
          <li>Unpack <code>name, item, qty = o</code>; <code>first, *rest</code>; swap <code>a, b = b, a</code></li>
          <li><b>namedtuple</b>: <code>o.qty</code>, <code>_replace</code>, <code>_asdict</code></li>
          <li><b>Hashable</b> (if items are) → dict key / set item</li>
          <li>⚠ a list inside a tuple can still change</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="plt-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="plt-list"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A List of Orders</span><span class="rm-sub">The running example</span></div></div>
      <div class="rm-item rm-done" data-target="plt-slice"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Indexing &amp; Slicing</span><span class="rm-sub">Traced cut by cut</span></div></div>
      <div class="rm-item rm-done" data-target="plt-grow"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Changing a List</span><span class="rm-sub">append, extend, insert, pop &amp; costs</span></div></div>
      <div class="rm-item rm-done" data-target="plt-comp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Comprehensions</span><span class="rm-sub">Desugared into loops</span></div></div>
      <div class="rm-item rm-done" data-target="plt-sort"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Sorting</span><span class="rm-sub">sorted vs .sort, key=</span></div></div>
      <div class="rm-item rm-done" data-target="plt-copy"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Aliasing &amp; Copies</span><span class="rm-sub">Alias, shallow, deep, the grid trap</span></div></div>
      <div class="rm-item rm-done" data-target="plt-tuple"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Tuples as Records</span><span class="rm-sub">Fixed on purpose</span></div></div>
      <div class="rm-item rm-done" data-target="plt-unpack"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Packing &amp; Unpacking</span><span class="rm-sub">Records into names</span></div></div>
      <div class="rm-item rm-done" data-target="plt-named"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">namedtuple</span><span class="rm-sub">Fields with names</span></div></div>
      <div class="rm-item rm-done" data-target="plt-hash"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Tuples as Dict Keys</span><span class="rm-sub">Why hashable matters</span></div></div>
      <div class="rm-item rm-done" data-target="plt-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="plt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="plt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="plt-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="plt-list"><span class="num">01</span>A List of Orders</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One variable holds one value: <code>order = "Asha: 2 masala chai"</code>. By 9:30 Chai Corner has six orders, by evening three hundred. Six variables called <code>order1</code> … <code>order6</code> cannot be looped over, counted or sorted. How do we keep many values, in the order they arrived, under one name?</p>
  </div>
  <h3>The running example</h3>
  <p>Chai Corner is a small tea stall. Every order is three facts: who ordered, what, and how many. We store each order as a <strong>tuple</strong> (round brackets, explained in section 07; for now read it as "a fixed little record"), and the whole morning as a <strong>list</strong> of those tuples (square brackets). The same six orders are used in every section of this note and in the other notes of the group.</p>
  <div class="fx" data-lang="py"># Chai Corner, Monday morning: one tuple per order = (customer, item, cups/pieces)
orders = [
    ("Asha", "masala chai", 2),
    ("Ben",  "samosa",      3),
    ("Asha", "ginger chai", 1),
    ("Chen", "masala chai", 1),
    ("Dia",  "bun maska",   2),
    ("Ben",  "masala chai", 2),
]
print(len(orders))          # how many orders today
print(orders[0])            # the first order
print(type(orders), type(orders[0]))</div>
  <div class="fx" data-lang="text">6
('Asha', 'masala chai', 2)
&lt;class 'list'&gt; &lt;class 'tuple'&gt;</div>
  <p>Reading the output: the list has 6 items; item 0 is the whole first order, the tuple <code>('Asha', 'masala chai', 2)</code>; the outer container is a <code>list</code>, each row is a <code>tuple</code>.</p>
  <table class="tbl"><caption>The running example: Chai Corner, Monday morning</caption>
    <tr><th>index</th><th>customer</th><th>item</th><th>qty</th></tr>
    <tr><td>0</td><td>Asha</td><td>masala chai</td><td>2</td></tr>
    <tr><td>1</td><td>Ben</td><td>samosa</td><td>3</td></tr>
    <tr><td>2</td><td>Asha</td><td>ginger chai</td><td>1</td></tr>
    <tr><td>3</td><td>Chen</td><td>masala chai</td><td>1</td></tr>
    <tr><td>4</td><td>Dia</td><td>bun maska</td><td>2</td></tr>
    <tr><td>5</td><td>Ben</td><td>masala chai</td><td>2</td></tr>
  </table>
  <h3>Plain words</h3>
  <p>A <strong>list</strong> is a numbered row of slots. "Ordered" means slot 0 stays slot 0 until you move it. "Changeable" (mutable) means you can add, remove and replace items after creating it. Duplicates are fine: Asha appears twice. A list can hold any mix of types, even other lists.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The order pad hanging at the counter. Each line is one order, lines are numbered top to bottom, you can add a line at the bottom or strike one out, and the same customer can appear on many lines.</p></div>
  <h3>What a list really stores: references</h3>
  <p>From <a class="xref" data-note="py_fundamentals">Python Fundamentals</a>: a name is a tag tied to an object. A list is a row of such tags. Slot 0 does not contain a copy of Asha's order; it points at the tuple object. So <code>a = orders[0]</code> gives a second tag on the same object, which <code>is</code> and <code>id()</code> confirm:</p>
  <div class="fx" data-lang="py">a = orders[0]
print(a is orders[0])            # the list holds a reference, not a copy
print(id(a) == id(orders[0]))
mixed = [1, "chai", 2.5, None, [3, 4]]   # a list can hold anything
print(len(mixed), mixed[-1])</div>
  <div class="fx" data-lang="text">True
True
5 [3, 4]</div>
  <p>This one fact (lists hold references) explains the copy traps of section 06 and the grid trap. Keep it in mind.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>list</strong> is Python's built-in mutable sequence: an ordered collection of references to objects, written <code>[a, b, c]</code>, indexed from 0, allowing duplicates and mixed types. In CPython it is a dynamic array (one block of memory holding the references, with spare room at the end).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not name a variable <code>list</code> (or <code>str</code>, <code>dict</code>). <code>list = [1, 2]</code> hides the built-in, and a later <code>list("abc")</code> fails with "'list' object is not callable".</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Indexing &amp; Slicing.</b> We have the six orders under one name. How do we reach "the fourth order", "the last one", or "the first two"?</div>

  <h2 id="plt-slice"><span class="num">02</span>Indexing &amp; Slicing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The list holds six orders. The owner asks: "Who ordered fourth? Who was last? Show me just the first two." We need a way to point at one slot, and at a stretch of slots.</p>
  </div>
  <p>To keep the traces short we use just the customer column: <code>names = ["Asha", "Ben", "Asha", "Chen", "Dia", "Ben"]</code>.</p>
  <h3>Indexing: one item</h3>
  <p>Each slot has a position number, its <strong>index</strong>. Counting starts at 0, because the index means "how many steps from the start". A negative index counts from the end: <code>-1</code> is the last item, <code>-2</code> the one before. Python turns <code>names[-k]</code> into <code>names[len(names) - k]</code>, so <code>names[-2]</code> is <code>names[4]</code>.</p>
  <table class="tbl">
    <tr><th>item</th><td>Asha</td><td>Ben</td><td>Asha</td><td>Chen</td><td>Dia</td><td>Ben</td></tr>
    <tr><th>index</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><th>negative</th><td>−6</td><td>−5</td><td>−4</td><td>−3</td><td>−2</td><td>−1</td></tr>
  </table>
  <div class="fx" data-lang="py">names = ["Asha", "Ben", "Asha", "Chen", "Dia", "Ben"]   # who ordered, in order
print(names[0], names[3], names[5])
print(names[-1], names[-2], names[-6])
try:
    names[6]
except IndexError as e:
    print("IndexError:", e)</div>
  <div class="fx" data-lang="text">Asha Chen Ben
Ben Dia Asha
IndexError: list index out of range</div>
  <p>By hand: <code>names[3]</code> is the fourth item, Chen. <code>names[-1]</code> is index 6 − 1 = 5, Ben. <code>names[-6]</code> is index 0, Asha. Index 6 does not exist (the last is 5), so Python raises <code>IndexError</code>.</p>
  <h3>Slicing: a stretch of items</h3>
  <p>A <strong>slice</strong> <code>names[start:stop]</code> gives a new list with the items from <code>start</code> up to, but not including, <code>stop</code>. The easy way to remember it: the numbers are <em>cuts between items</em>, not the items themselves. <code>[1:4]</code> means "everything between cut 1 and cut 4": three items.</p>
  <figure class="viz"><svg viewBox="0 0 470 130" width="470">
    <text x="10" y="16" class="tm">names</text>
    <rect x="40" y="40" width="60" height="34" class="fs" stroke="currentColor"/><rect x="100" y="40" width="60" height="34" class="fb sb"/><rect x="160" y="40" width="60" height="34" class="fb sb"/><rect x="220" y="40" width="60" height="34" class="fb sb"/><rect x="280" y="40" width="60" height="34" class="fs" stroke="currentColor"/><rect x="340" y="40" width="60" height="34" class="fs" stroke="currentColor"/>
    <text x="54" y="62">Asha</text><text x="117" y="62">Ben</text><text x="174" y="62">Asha</text><text x="233" y="62">Chen</text><text x="297" y="62">Dia</text><text x="357" y="62">Ben</text>
    <text x="36" y="34" class="tm">0</text><text x="96" y="34" class="tb">1</text><text x="156" y="34" class="tm">2</text><text x="216" y="34" class="tm">3</text><text x="276" y="34" class="tb">4</text><text x="336" y="34" class="tm">5</text><text x="396" y="34" class="tm">6</text>
    <text x="30" y="92" class="tm">−6</text><text x="90" y="92" class="tm">−5</text><text x="150" y="92" class="tm">−4</text><text x="210" y="92" class="tm">−3</text><text x="270" y="92" class="tm">−2</text><text x="330" y="92" class="tm">−1</text>
    <text x="80" y="118" class="tb">names[1:4] → ['Ben', 'Asha', 'Chen']   (between cuts 1 and 4)</text>
  </svg><figcaption>Indices as cuts between items. A slice takes everything between two cuts, so stop is never included and stop − start is the length.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A loaf of bread with knife marks numbered 0 to 6. "Cut at 1 and at 4" hands you the three slices in between.</p></div>
  <p>A third number, the <strong>step</strong>, says how far to jump: <code>[::2]</code> takes every second item; a negative step walks backwards. Missing numbers mean "from the very start" / "to the very end" (in the walking direction). Trace each slice by hand before reading the output:</p>
  <table class="tbl">
    <tr><th>slice</th><th>positions taken</th><th>result</th></tr>
    <tr><td><code>[1:4]</code></td><td>1, 2, 3</td><td>Ben, Asha, Chen</td></tr>
    <tr><td><code>[:2]</code></td><td>0, 1</td><td>Asha, Ben</td></tr>
    <tr><td><code>[-2:]</code></td><td>4, 5 (−2 = 4)</td><td>Dia, Ben</td></tr>
    <tr><td><code>[::2]</code></td><td>0, 2, 4</td><td>Asha, Asha, Dia</td></tr>
    <tr><td><code>[::-1]</code></td><td>5, 4, 3, 2, 1, 0</td><td>the list reversed</td></tr>
    <tr><td><code>[4:1:-1]</code></td><td>4, 3, 2 (stop 1 not included)</td><td>Dia, Chen, Asha</td></tr>
    <tr><td><code>[10:]</code></td><td>none</td><td>[] (no error)</td></tr>
  </table>
  <div class="fx" data-lang="py">print(names[1:4])     # cuts 1 and 4  -&gt; items 1, 2, 3
print(names[:2])      # from the start to cut 2
print(names[-2:])     # the last two
print(names[::2])     # every second item: 0, 2, 4
print(names[::-1])    # backwards: the whole list reversed
print(names[4:1:-1])  # backwards from 4, stop before 1: 4, 3, 2
print(names[10:])     # a slice past the end is just empty, no error</div>
  <div class="fx" data-lang="text">['Ben', 'Asha', 'Chen']
['Asha', 'Ben']
['Dia', 'Ben']
['Asha', 'Asha', 'Dia']
['Ben', 'Dia', 'Chen', 'Asha', 'Ben', 'Asha']
['Dia', 'Chen', 'Asha']
[]</div>
  <p>Every line matches the hand trace. Note the asymmetry: <code>names[6]</code> raised IndexError, but <code>names[10:]</code> quietly returned <code>[]</code>. A slice is clamped to the list's ends; an index is not.</p>
  <h3>Slice assignment</h3>
  <p>A slice on the left of <code>=</code> replaces that stretch with the items on the right, and the counts do not have to match, so the list can grow or shrink. Here on the quantity column:</p>
  <div class="fx" data-lang="py">q = [2, 3, 1, 1, 2, 2]          # quantities of the six orders
q[1:3] = [30, 10, 99]           # replace 2 items with 3: the list grows
print(q, len(q))
q[1:4] = []                     # replace 3 items with none: they vanish
print(q, len(q))</div>
  <div class="fx" data-lang="text">[2, 30, 10, 99, 1, 2, 2] 7
[2, 1, 2, 2] 4</div>
  <p>Trace: <code>q[1:3]</code> is [3, 1] (2 items), replaced by 3 items, so length 6 → 7. Then <code>q[1:4]</code> (30, 10, 99) is replaced by nothing, so 7 → 4.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Indexing</strong> <code>s[i]</code> returns one item, with <code>-k</code> meaning <code>len(s) - k</code>; an index outside <code>-len(s) … len(s)-1</code> raises IndexError. <strong>Slicing</strong> <code>s[start:stop:step]</code> returns a new sequence of the items at start, start+step, … while before stop; bounds are clamped and never raise. Both work on every sequence: list, tuple, str, range.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Off-by-one: <code>names[1:4]</code> has 3 items, not 4, and does not include <code>names[4]</code>. Also, a slice of a list is a new list (a shallow copy, section 06); slicing a numpy array gives a <em>view</em> that shares memory, which behaves differently.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Changing a List.</b> We can read any part of the morning. But the day goes on: new orders arrive, finished ones leave the queue. How do we change the list, and is every change equally cheap?</div>

  <h2 id="plt-grow"><span class="num">03</span>Changing a List: append, extend, insert, pop &amp; Their Costs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Reading is not enough: customers join the queue, are served and leave. Which methods add and remove items, and why does serving "the first in line" from a long list become painfully slow?</p>
  </div>
  <h3>The methods, traced on a queue</h3>
  <p>The waiting queue at the counter starts as <code>["Asha", "Ben"]</code>. Follow each line:</p>
  <div class="fx" data-lang="py">queue = ["Asha", "Ben"]
queue.append("Chen")            # add ONE item at the end
print(queue)
queue.extend(["Dia", "Esha"])   # add EACH item of another list at the end
print(queue)
queue.insert(0, "Faiz")         # put an item at position 0, shift the rest right
print(queue)
last = queue.pop()              # remove and return the last item
first = queue.pop(0)            # remove and return item 0, shift the rest left
print(last, first, queue)
queue.remove("Ben")             # remove the first "Ben" (search by value)
print(queue, queue.index("Dia"), names.count("Asha"))</div>
  <div class="fx" data-lang="text">['Asha', 'Ben', 'Chen']
['Asha', 'Ben', 'Chen', 'Dia', 'Esha']
['Faiz', 'Asha', 'Ben', 'Chen', 'Dia', 'Esha']
Esha Faiz ['Asha', 'Ben', 'Chen', 'Dia']
['Asha', 'Chen', 'Dia'] 2 2</div>
  <table class="tbl">
    <tr><th>call</th><th>what it does</th><th>queue after</th></tr>
    <tr><td><code>append("Chen")</code></td><td>adds one item at the end</td><td>Asha, Ben, Chen</td></tr>
    <tr><td><code>extend(["Dia", "Esha"])</code></td><td>adds each item of the other list at the end</td><td>… Chen, Dia, Esha</td></tr>
    <tr><td><code>insert(0, "Faiz")</code></td><td>puts Faiz at position 0; everyone else moves one slot right</td><td>Faiz, Asha, … Esha</td></tr>
    <tr><td><code>pop()</code></td><td>removes and returns the last item</td><td>returned Esha</td></tr>
    <tr><td><code>pop(0)</code></td><td>removes and returns item 0; everyone moves one slot left</td><td>returned Faiz → Asha, Ben, Chen, Dia</td></tr>
    <tr><td><code>remove("Ben")</code></td><td>searches for the first "Ben" and deletes it</td><td>Asha, Chen, Dia</td></tr>
  </table>
  <p><code>index("Dia")</code> searches for a value and returns its position (2); <code>count</code> counts matches (Asha ordered twice in <code>names</code>). <code>del q[i]</code> and <code>del q[a:b]</code> delete by position without returning anything.</p>
  <h3>append vs extend</h3>
  <div class="fx" data-lang="py">a = ["Asha"]; a.append(["Ben", "Chen"])
b = ["Asha"]; b.extend(["Ben", "Chen"])
c = ["Asha"]; c.extend("Ben")            # a string is a sequence of letters!
print(a, len(a))
print(b, len(b))
print(c)</div>
  <div class="fx" data-lang="text">['Asha', ['Ben', 'Chen']] 2
['Asha', 'Ben', 'Chen'] 3
['Asha', 'B', 'e', 'n']</div>
  <p><code>append</code> adds its argument as <em>one</em> item, even if that item is a list: a list inside a list, length 2. <code>extend</code> loops over its argument and adds each element: length 3. And because a string is itself a sequence, <code>extend("Ben")</code> adds three letters. (<code>q += other</code> behaves like <code>extend</code>.)</p>
  <h3>Why costs differ: a list is a dynamic array</h3>
  <p>Inside, a list is one block of memory holding references side by side, plus some spare room at the end. That layout decides every cost:</p>
  <ul>
    <li><strong>Index</strong> <code>q[i]</code>: jump to "start + i slots". O(1), constant time.</li>
    <li><strong>append / pop()</strong> at the end: use or free the next spare slot. O(1).</li>
    <li><strong>insert(0) / pop(0)</strong>: every other reference must move one slot. With n items, n moves: O(n).</li>
    <li><strong>in / index / remove</strong> by value: compare items one by one until found. O(n).</li>
  </ul>
  <p>When the spare room runs out, Python allocates a bigger block (about 1.125× plus a little) and copies the references over. You can watch it happen with <code>sys.getsizeof</code>, which reports the list's own memory (56 bytes of header plus 8 bytes per reference slot on a 64-bit machine):</p>
  <div class="fx" data-lang="py">import sys
lst = []
prev = sys.getsizeof(lst)
print(f"len  0: {prev} bytes")
for i in range(1, 18):
    lst.append(i)
    size = sys.getsizeof(lst)
    if size != prev:                       # print only when Python grew the hidden array
        print(f"len {i:2}: {size} bytes  (room for {(size - 56) // 8} references)")
        prev = size</div>
  <div class="fx" data-lang="text">len  0: 56 bytes
len  1: 88 bytes  (room for 4 references)
len  5: 120 bytes  (room for 8 references)
len  9: 184 bytes  (room for 16 references)
len 17: 248 bytes  (room for 24 references)</div>
  <p>Trace: the first append made room for 4 references at once, so appends 2, 3 and 4 cost nothing extra. At item 5 the block grew to 8, at 9 to 16, at 17 to 24. Copying happens rarely and the block grows in proportion, so the copying cost spread over all appends is constant: "amortised O(1)" (O(1)* in tables).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bench in front of the stall. Someone joining at the right end just sits down. Someone joining at the left end makes everybody shuffle one seat right. When the bench is full, the owner fetches a longer bench and everyone moves across once.</p></div>
  <h3>Measured: serving from the front</h3>
  <p>A real queue serves from the front (<code>pop(0)</code>). On a list that shifts every remaining item each time. <code>collections.deque</code> (double-ended queue) is built so both ends are O(1). Draining 100,000 customers:</p>
  <div class="fx" data-lang="py">from collections import deque
import timeit
n = 100_000
def drain_list():
    q = list(range(n))
    while q:
        q.pop(0)          # shifts every remaining item left: O(n) each time
def drain_deque():
    q = deque(range(n))
    while q:
        q.popleft()       # O(1): a deque is built for both ends
print(f"list.pop(0):     {timeit.timeit(drain_list, number=1):.2f} s")
print(f"deque.popleft(): {timeit.timeit(drain_deque, number=1):.3f} s")</div>
  <div class="fx" data-lang="text">list.pop(0):     0.95 s
deque.popleft(): 0.005 s</div>
  <p>Same result, roughly a hundred times faster or more: n removals each costing O(n) is O(n²) in total for the list, O(n) for the deque. (Exact timings vary by machine; the ratio is the point.)</p>
  <table class="tbl"><caption>List operation costs (n = len)</caption>
    <tr><th>operation</th><th>cost</th><th>why</th></tr>
    <tr><td><code>q[i]</code>, <code>q[i] = x</code>, <code>len(q)</code></td><td>O(1)</td><td>jump by offset; length is stored</td></tr>
    <tr><td><code>append</code>, <code>pop()</code></td><td>O(1)*</td><td>end of the array; rare resize</td></tr>
    <tr><td><code>insert(i, x)</code>, <code>pop(i)</code>, <code>del q[i]</code></td><td>O(n − i)</td><td>shift the tail</td></tr>
    <tr><td><code>x in q</code>, <code>index</code>, <code>remove</code>, <code>count</code></td><td>O(n)</td><td>scan by value</td></tr>
    <tr><td><code>extend(k items)</code>, <code>q[a:b]</code> (k items)</td><td>O(k)</td><td>copy k references</td></tr>
    <tr><td><code>sort</code></td><td>O(n log n)</td><td>Timsort (section 05)</td></tr>
  </table>
  <h3>In-place methods return None</h3>
  <div class="fx" data-lang="py">q = [2, 3, 1, 1, 2, 2]
result = q.append(5)
print(result, q)
q = q.sort()          # the classic bug: sort() returns None
print(q)</div>
  <div class="fx" data-lang="text">None [2, 3, 1, 1, 2, 2, 5]
None</div>
  <p><code>append</code>, <code>extend</code>, <code>insert</code>, <code>remove</code>, <code>sort</code> and <code>reverse</code> change the list itself and return <code>None</code>, as a signal that no new list was made. So <code>q = q.sort()</code> sorts q and then throws it away by rebinding q to <code>None</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Amortised O(1)</strong>: an operation that is occasionally expensive (a resize) but whose total cost over n calls is O(n), so O(1) per call on average. <code>list.append</code> is the textbook example; <a class="xref" data-note="dsa_arrays">Arrays &amp; Two Pointers</a> uses this cost table constantly.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using a list as a queue (<code>pop(0)</code>, <code>insert(0, x)</code>) or checking <code>x in big_list</code> inside a loop silently turns O(n) code into O(n²). Use <code>deque</code> for queues and a set for membership (<a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Comprehensions.</b> We can grow lists one item at a time. But building a new list from an old one ("only the chai orders", "every name in capitals") takes four lines of "empty list, loop, if, append" every time. Is there a direct way to say it?</div>

  <h2 id="plt-comp"><span class="num">04</span>List Comprehensions, Desugared</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"How many cups of chai did we sell?" means: walk the orders, keep those whose item contains "chai", collect their quantities. Writing that loop by hand for every question is long and buries the meaning. Can one line say "the quantities of the chai orders"?</p>
  </div>
  <h3>The long way and the short way</h3>
  <div class="fx" data-lang="py">cups = []
for name, item, qty in orders:
    if "chai" in item:
        cups.append(qty)
print(cups, sum(cups))
print([qty for name, item, qty in orders if "chai" in item])</div>
  <div class="fx" data-lang="text">[2, 1, 1, 2] 6
[2, 1, 1, 2]</div>
  <p>Both print [2, 1, 1, 2]: orders 0, 2, 3 and 5 are chai, and their quantities sum to 6 cups. The second line is a <strong>list comprehension</strong>. "Desugar" means: rewrite it into the plain loop Python effectively runs. The comprehension is just a compact spelling of the four-line loop above it:</p>
  <div class="flow"><span>[ qty</span><span>for name, item, qty in orders</span><span>if "chai" in item ]</span></div>
  <table class="tbl">
    <tr><th>comprehension part</th><th>loop equivalent</th></tr>
    <tr><td><code>[ … ]</code></td><td><code>cups = []</code> … then return cups</td></tr>
    <tr><td><code>for name, item, qty in orders</code></td><td><code>for name, item, qty in orders:</code> (same line, same unpacking)</td></tr>
    <tr><td><code>if "chai" in item</code></td><td><code>    if "chai" in item:</code></td></tr>
    <tr><td><code>qty</code> (the expression in front)</td><td><code>        cups.append(qty)</code></td></tr>
  </table>
  <p>Read it aloud left to right: "qty, for each order, if the item is chai".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Telling a helper "write down the quantity of every chai order" in one sentence, instead of dictating "take a blank page; for each line on the pad; if it says chai; write its quantity".</p></div>
  <h3>The forms you will meet</h3>
  <div class="fx" data-lang="py">print([name.upper() for name, item, qty in orders])                       # transform every item
print([name for name, item, qty in orders if qty &gt;= 2])                   # filter: if at the END
print(["big" if qty &gt;= 2 else "small" for name, item, qty in orders])     # choose: if/else at the FRONT
by_hour = [[("Asha", 2), ("Ben", 3)], [("Asha", 1)], [("Chen", 1), ("Dia", 2), ("Ben", 2)]]
print([qty for hour in by_hour for name, qty in hour])                    # flatten: outer loop first
print(sum(qty for name, item, qty in orders))                             # generator: no list built</div>
  <div class="fx" data-lang="text">['ASHA', 'BEN', 'ASHA', 'CHEN', 'DIA', 'BEN']
['Asha', 'Ben', 'Dia', 'Ben']
['big', 'big', 'small', 'small', 'big', 'big']
[2, 3, 1, 1, 2, 2]
11</div>
  <ul>
    <li><strong>Transform</strong>: the expression in front can be anything; here <code>name.upper()</code>.</li>
    <li><strong>Filter</strong>: <code>if</code> at the end decides <em>whether</em> an item goes in (qty ≥ 2 keeps orders 0, 1, 4, 5: Asha, Ben, Dia, Ben).</li>
    <li><strong>Choose</strong>: <code>A if cond else B</code> at the front decides <em>what</em> goes in; every item produces something.</li>
    <li><strong>Nested</strong>: <code>by_hour</code> is a list of lists (orders grouped by hour). Two <code>for</code>s read like nested loops, outer first: "for each hour, for each order in that hour". Result: the six quantities flattened.</li>
    <li><strong>Generator expression</strong>: round brackets (here, the brackets of <code>sum( )</code>) produce items one at a time without building a list: total 11 items sold. More in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>.</li>
  </ul>
  <p>The same syntax with curly brackets builds sets and dicts (<a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>).</p>
  <h3>Is it faster?</h3>
  <div class="fx" data-lang="py">import timeit
data = list(range(100_000))
def with_loop():
    out = []
    for x in data:
        out.append(x * 2)
    return out
def with_comp():
    return [x * 2 for x in data]
print(with_loop() == with_comp())
print(f"loop + append: {timeit.timeit(with_loop, number=50) / 50 * 1000:.2f} ms")
print(f"comprehension: {timeit.timeit(with_comp, number=50) / 50 * 1000:.2f} ms")</div>
  <div class="fx" data-lang="text">True
loop + append: 3.93 ms
comprehension: 3.46 ms</div>
  <p>Same list, a bit faster: the comprehension skips looking up and calling <code>out.append</code> on every item. Choose it for clarity first; the speed is a bonus.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>list comprehension</strong> <code>[expr for target in iterable if cond]</code> evaluates to a new list equal to running the nested <code>for</code>/<code>if</code> clauses left to right and appending <code>expr</code> each time. Its loop variable is local to the comprehension (it does not leak out, unlike a <code>for</code> loop's).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not use a comprehension only for side effects (<code>[print(x) for x in xs]</code> builds a useless list of None). And more than two <code>for</code>s or a long condition is unreadable: write a normal loop or a function.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Sorting.</b> Everything still comes out in arrival order. The owner wants the biggest orders first, or the menu alphabetically. How do we put a list in a chosen order?</div>

  <h2 id="plt-sort"><span class="num">05</span>Sorting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Arrival order is rarely the order we want to read. "Biggest order first", "by item, then by customer": how do we sort, and how do we tell Python <em>what</em> to sort by when each item is a whole tuple?</p>
  </div>
  <h3>sorted() vs .sort()</h3>
  <div class="fx" data-lang="py">q = [2, 3, 1, 1, 2, 2]
s = sorted(q)                 # NEW sorted list, q untouched
print(s, q)
q.sort(reverse=True)          # sorts q IN PLACE, returns None
print(q)
menu_items = ["chai", "Samosa", "bun maska", "Vada pav"]
print(sorted(menu_items))                  # capitals sort BEFORE all lowercase letters
print(sorted(menu_items, key=str.lower))   # compare lowercased copies instead</div>
  <div class="fx" data-lang="text">[1, 1, 2, 2, 2, 3] [2, 3, 1, 1, 2, 2]
[3, 2, 2, 2, 1, 1]
['Samosa', 'Vada pav', 'bun maska', 'chai']
['bun maska', 'chai', 'Samosa', 'Vada pav']</div>
  <p><code>sorted(q)</code> returned a new list and left <code>q</code> as it was; <code>q.sort(reverse=True)</code> rearranged <code>q</code> itself (and returned None). Strings compare letter by letter by code point, and every capital letter (A–Z = 65–90) comes before every lowercase letter (a–z = 97–122), so "Samosa" and "Vada pav" jumped ahead of "bun maska". <code>key=str.lower</code> fixes it.</p>
  <h3>key=: sort by a computed value</h3>
  <p>The <code>key</code> argument is a function. Python calls it once on every item and sorts by the results, while returning the original items. For our tuples, <code>lambda o: o[2]</code> means "sort by the quantity".</p>
  <div class="fx" data-lang="py">print(sorted(orders, key=lambda o: o[2], reverse=True))          # biggest order first
from operator import itemgetter
print(sorted(orders, key=itemgetter(1, 0)))                       # by item, then by customer
print(max(orders, key=lambda o: o[2]))                            # key= works for max/min too</div>
  <div class="fx" data-lang="text">[('Ben', 'samosa', 3), ('Asha', 'masala chai', 2), ('Dia', 'bun maska', 2), ('Ben', 'masala chai', 2), ('Asha', 'ginger chai', 1), ('Chen', 'masala chai', 1)]
[('Dia', 'bun maska', 2), ('Asha', 'ginger chai', 1), ('Asha', 'masala chai', 2), ('Ben', 'masala chai', 2), ('Chen', 'masala chai', 1), ('Ben', 'samosa', 3)]
('Ben', 'samosa', 3)</div>
  <p>First line: quantities 3, 2, 2, 2, 1, 1. Second: <code>itemgetter(1, 0)</code> builds the key (item, customer), so tuples compare by item first ("bun maska" &lt; "ginger chai" &lt; "masala chai" &lt; "samosa") and, among the three masala chai orders, by customer (Asha, Ben, Chen). <code>max</code> and <code>min</code> take <code>key=</code> too.</p>
  <h3>Stable sorting and multi-key sorts, traced</h3>
  <p>Python's sort is <strong>stable</strong>: items with equal keys keep the order they had before. So "by qty descending, then by name" can be done in two passes, secondary key first:</p>
  <table class="tbl">
    <tr><th>pass 1: by name</th><th>pass 2: by −qty (ties keep pass-1 order)</th></tr>
    <tr><td>Asha mc 2, Asha gc 1, Ben sm 3, Ben mc 2, Chen mc 1, Dia bm 2</td><td>Ben 3 · then the 2s in pass-1 order: Asha, Ben, Dia · then the 1s: Asha, Chen</td></tr>
  </table>
  <div class="fx" data-lang="py">by_name = sorted(orders, key=lambda o: o[0])              # step 1: secondary key
by_qty_then_name = sorted(by_name, key=lambda o: -o[2])   # step 2: primary key (stable!)
for o in by_qty_then_name:
    print(o)
print(by_qty_then_name == sorted(orders, key=lambda o: (-o[2], o[0])))</div>
  <div class="fx" data-lang="text">('Ben', 'samosa', 3)
('Asha', 'masala chai', 2)
('Ben', 'masala chai', 2)
('Dia', 'bun maska', 2)
('Asha', 'ginger chai', 1)
('Chen', 'masala chai', 1)
True</div>
  <p>The last line checks the one-pass version: a tuple key <code>(-qty, name)</code> compares qty first (negated for descending) and breaks ties by name. Both give the same order.</p>
  <div class="fx" data-lang="py">try:
    sorted([2, "chai", 1])
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: '&lt;' not supported between instances of 'str' and 'int'</div>
  <div class="callout def"><span class="label">Definition</span><p><code>sorted(iterable, *, key=None, reverse=False)</code> returns a new sorted list; <code>list.sort(*, key=None, reverse=False)</code> sorts in place and returns None. Both use Timsort: O(n log n) worst case, O(n) on already-sorted data, and stable. Items (or keys) must be comparable with <code>&lt;</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>key=</code> takes a function, not a call: <code>key=len</code>, not <code>key=len()</code>. And sorting needs comparable items: a list with numbers and strings raises TypeError.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Aliasing &amp; Copies.</b> We have sorted copies, sorted originals, lists inside lists and names passed around. When we change "a copy", is the original safe? We need to know exactly when two names are the same list.</div>

  <h2 id="plt-copy"><span class="num">06</span>Aliasing, Shallow &amp; Deep Copy</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The stall records who sits at which table: <code>tables = [["Asha", "Ben"], ["Chen"]]</code>. You "copy" it to plan tomorrow's seating, add a name, and today's record changes too. Why? Because a list holds references (section 01), "copy" can mean three different things.</p>
  </div>
  <h3>Alias: no copy at all</h3>
  <div class="fx" data-lang="py">tables = [["Asha", "Ben"], ["Chen"]]      # who sits at table 1 and table 2
alias = tables
print(alias is tables, id(alias) == id(tables))
alias.append(["Dia"])
print(tables)</div>
  <div class="fx" data-lang="text">True True
[['Asha', 'Ben'], ['Chen'], ['Dia']]</div>
  <p><code>alias = tables</code> did not copy anything. It tied a second tag to the same list: <code>is</code> is True and the <code>id</code>s (the object's identity number) are equal. Appending through <code>alias</code> changed <code>tables</code>, because there is only one list.</p>
  <h3>Three kinds of copy, traced with id()</h3>
  <ul>
    <li><strong>Alias</strong> <code>b = a</code>: a second name for the same object.</li>
    <li><strong>Shallow copy</strong> <code>a.copy()</code>, <code>a[:]</code>, <code>list(a)</code>: a new outer list whose slots point at the <em>same</em> inner objects.</li>
    <li><strong>Deep copy</strong> <code>copy.deepcopy(a)</code>: a new outer list and new copies of everything inside, all the way down.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="plt-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="70" height="26" rx="5" class="fb sb"/><text x="18" y="38">tables</text>
    <rect x="10" y="62" width="70" height="26" rx="5" class="fb sb"/><text x="18" y="80">alias</text>
    <rect x="130" y="30" width="80" height="44" rx="5" class="fs" stroke="currentColor"/><text x="140" y="48">outer</text><text x="140" y="64" class="tm">[ • , • ]</text>
    <line x1="80" y1="33" x2="128" y2="45" stroke="currentColor" marker-end="url(#plt-ah)"/>
    <line x1="80" y1="75" x2="128" y2="60" stroke="currentColor" marker-end="url(#plt-ah)"/>
    <rect x="10" y="120" width="70" height="26" rx="5" class="fb sb"/><text x="14" y="138">shallow</text>
    <rect x="130" y="112" width="80" height="44" rx="5" class="fs" stroke="currentColor"/><text x="140" y="130">outer′</text><text x="140" y="146" class="tm">[ • , • ]</text>
    <line x1="80" y1="133" x2="128" y2="133" stroke="currentColor" marker-end="url(#plt-ah)"/>
    <rect x="262" y="40" width="112" height="28" rx="5" class="fr sr"/><text x="270" y="59">["Asha","Ben"]</text>
    <rect x="262" y="110" width="112" height="28" rx="5" class="fr sr"/><text x="282" y="129">["Chen"]</text>
    <line x1="210" y1="50" x2="260" y2="54" stroke="currentColor" marker-end="url(#plt-ah)"/>
    <line x1="210" y1="64" x2="260" y2="118" stroke="currentColor" marker-end="url(#plt-ah)"/>
    <line x1="210" y1="126" x2="260" y2="62" class="sr" stroke-dasharray="4 3" marker-end="url(#plt-ah)"/>
    <line x1="210" y1="140" x2="260" y2="126" class="sr" stroke-dasharray="4 3" marker-end="url(#plt-ah)"/>
    <text x="232" y="186" class="tr">inner lists SHARED</text>
    <rect x="400" y="20" width="70" height="26" rx="5" class="fb sb"/><text x="408" y="38">deep</text>
    <rect x="400" y="60" width="80" height="44" rx="5" class="fs" stroke="currentColor"/><text x="410" y="78">outer″</text><text x="410" y="94" class="tm">[ • , • ]</text>
    <rect x="496" y="56" width="100" height="24" rx="5" class="fg sg"/><text x="500" y="73">["Asha","Ben"]</text>
    <rect x="496" y="88" width="100" height="24" rx="5" class="fg sg"/><text x="518" y="105">["Chen"]</text>
    <line x1="435" y1="46" x2="435" y2="58" stroke="currentColor" marker-end="url(#plt-ah)"/>
    <line x1="480" y1="74" x2="494" y2="68" class="sg" marker-end="url(#plt-ah)"/><line x1="480" y1="90" x2="494" y2="98" class="sg" marker-end="url(#plt-ah)"/>
    <text x="420" y="140" class="tg">all new objects</text>
  </svg><figcaption><code>tables</code> and <code>alias</code> point at one outer list. The shallow copy has its own outer list, but its slots (dotted red) point at the SAME inner lists. Only the deep copy owns new inner lists (green).</figcaption></figure>
  <p>Predict before running: we will append "Esha" to the inner list at table 1, and add a new table <code>["Faiz"]</code> to the outer list. Who sees what?</p>
  <div class="fx" data-lang="py">import copy
tables = [["Asha", "Ben"], ["Chen"]]
alias   = tables
shallow = tables.copy()          # same as tables[:] or list(tables)
deep    = copy.deepcopy(tables)
print("outer ids :", id(tables) == id(alias), id(tables) == id(shallow), id(tables) == id(deep))
print("inner[0]  :", tables[0] is alias[0], tables[0] is shallow[0], tables[0] is deep[0])
tables[0].append("Esha")         # edit an INNER list
tables.append(["Faiz"])          # edit the OUTER list
print("tables ", tables)
print("alias  ", alias)
print("shallow", shallow)
print("deep   ", deep)</div>
  <div class="fx" data-lang="text">outer ids : True False False
inner[0]  : True True False
tables  [['Asha', 'Ben', 'Esha'], ['Chen'], ['Faiz']]
alias   [['Asha', 'Ben', 'Esha'], ['Chen'], ['Faiz']]
shallow [['Asha', 'Ben', 'Esha'], ['Chen']]
deep    [['Asha', 'Ben'], ['Chen']]</div>
  <table class="tbl">
    <tr><th></th><th>same outer list as tables?</th><th>same inner list [0]?</th><th>sees "Esha" (inner edit)?</th><th>sees ["Faiz"] (outer edit)?</th></tr>
    <tr><td>alias</td><td>yes</td><td>yes</td><td>yes</td><td>yes</td></tr>
    <tr><td>shallow</td><td>no</td><td>yes</td><td>yes</td><td>no</td></tr>
    <tr><td>deep</td><td>no</td><td>no</td><td>no</td><td>no</td></tr>
  </table>
  <p>The id checks predict the result exactly: the inner edit reaches everyone who shares inner list 0 (alias and shallow); the outer edit reaches only those who share the outer list (alias).</p>
  <div class="fx" data-lang="py">names2 = names.copy()
names2[0] = "ASHA"               # replacing an item in a flat list of strings
print(names[0], names2[0])       # a shallow copy is enough here</div>
  <div class="fx" data-lang="text">Asha ASHA</div>
  <p>For a flat list of immutable things (strings, numbers, tuples of those), a shallow copy is all you need: "changing" an item replaces a reference in your own outer list and cannot touch the original. Deep copy only matters when there are mutable containers inside.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A shallow copy photocopies a book's contents page: a new page, but it points to the same chapters. Scribble in chapter 1 and both "books" show it. A deep copy reprints the whole book.</p></div>
  <h3>The grid trap: [[0]*3]*3</h3>
  <p>The owner wants a 3×3 tally (3 tables × 3 hours) of zeros. <code>[0] * 3</code> makes one row; <code>* 3</code> on the outer list repeats the <em>reference</em> to that row three times. It is aliasing hidden in one expression:</p>
  <div class="fx" data-lang="py">grid = [[0] * 3] * 3                       # 3 references to ONE row
print([id(row) for row in grid].count(id(grid[0])))
grid[0][0] = 1
print(grid)
grid = [[0] * 3 for _ in range(3)]         # a NEW row each time round the loop
print(len({id(row) for row in grid}))
grid[0][0] = 1
print(grid)</div>
  <div class="fx" data-lang="text">3
[[1, 0, 0], [1, 0, 0], [1, 0, 0]]
3
[[1, 0, 0], [0, 0, 0], [0, 0, 0]]</div>
  <p>First version: all three slots hold the id of row 0, so writing table 1 / hour 1 "changes all three rows" (there is only one). The comprehension evaluates <code>[0] * 3</code> afresh on every pass, giving 3 distinct rows, and only row 0 changes. (<code>[0] * 3</code> itself is safe: it repeats the immutable 0.)</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Alias</strong>: two names bound to one object (<code>a is b</code>). <strong>Shallow copy</strong>: a new container whose elements are the same objects as the original's. <strong>Deep copy</strong> (<code>copy.deepcopy</code>): recursively copies contained objects, keeping a memo so shared or cyclic references are copied once.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Copying a nested config with <code>.copy()</code> or <code>{**cfg}</code> and then editing <code>cfg2["params"]["lr"]</code> changes the original too. Nested lists or dicts (JSON, configs, lists of lists) need <code>copy.deepcopy</code>. pandas: <code>df.copy()</code> copies the data by default; plain assignment <code>df2 = df</code> is an alias (<a class="xref" data-note="da_pandas">Pandas</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Tuples as Records.</b> All these surprises come from one thing: lists can change, and many names can point at one list. For a record like "Asha, masala chai, 2" we would rather have a container that <em>cannot</em> change at all.</div>

  <h2 id="plt-tuple"><span class="num">07</span>Tuples as Records</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An order, once taken, is a fact: Asha ordered 2 masala chai. With a list, any function we pass it to could quietly change the 2 into a 3. How do we store a record that nobody can edit by accident?</p>
  </div>
  <h3>Plain words</h3>
  <p>A <strong>tuple</strong> is an ordered sequence that cannot change after it is made. Indexing, slicing, <code>len</code>, <code>in</code>, <code>count</code> and <code>index</code> all work exactly as for lists; anything that would change it does not exist or raises an error.</p>
  <div class="fx" data-lang="py">order = ("Asha", "masala chai", 2)
print(order[0], order[-1], len(order), order[1:])
try:
    order[2] = 3
except TypeError as e:
    print("TypeError:", e)
print(order.count("Asha"), order.index(2))</div>
  <div class="fx" data-lang="text">Asha 2 3 ('masala chai', 2)
TypeError: 'tuple' object does not support item assignment
1 2</div>
  <p>Use a list for "many things of the same kind, how many may vary" (all orders). Use a tuple for "a fixed number of things, each position with its own meaning" (one order: customer, item, qty), like a row in a table.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A printed receipt. You can read every line, photocopy it, tear it into pieces, but you cannot change what is printed. To "change" it you print a new one.</p></div>
  <h3>The comma makes the tuple</h3>
  <div class="fx" data-lang="py">print(type((5)), type((5,)), (5,))
t = "Asha", "samosa", 3          # the commas make the tuple, brackets are optional
print(t, type(t))
print(type(()), len(()))</div>
  <div class="fx" data-lang="text">&lt;class 'int'&gt; &lt;class 'tuple'&gt; (5,)
('Asha', 'samosa', 3) &lt;class 'tuple'&gt;
&lt;class 'tuple'&gt; 0</div>
  <p><code>(5)</code> is just 5 in brackets (brackets also group arithmetic). The comma is what makes a tuple: <code>(5,)</code> is a one-item tuple, and <code>"Asha", "samosa", 3</code> without brackets is a tuple too. <code>()</code> is the empty tuple.</p>
  <h3>"Cannot change" is shallow</h3>
  <div class="fx" data-lang="py">row = ("table 1", ["Asha", "Ben"])
row[1].append("Esha")             # the tuple cannot change, but the list INSIDE can
print(row)</div>
  <div class="fx" data-lang="text">('table 1', ['Asha', 'Ben', 'Esha'])</div>
  <p>The tuple's slots are fixed: slot 1 will always point at that same list. But the list itself is mutable, so its contents can grow. A tuple is only "fully frozen" when everything inside it is immutable too.</p>
  <h3>Smaller and faster to build</h3>
  <div class="fx" data-lang="py">import sys, timeit
print(sys.getsizeof(["Asha", "masala chai", 2]), sys.getsizeof(("Asha", "masala chai", 2)))
print(f"build list : {timeit.timeit('[1, 2, 3]', number=1_000_000) * 1000:.0f} ms per million")
print(f"build tuple: {timeit.timeit('(1, 2, 3)', number=1_000_000) * 1000:.0f} ms per million")</div>
  <div class="fx" data-lang="text">88 64
build list : 44 ms per million
build tuple: 11 ms per million</div>
  <p>A tuple needs no spare room and no resize logic, so the same three items take 64 bytes instead of 88, and a tuple of constants is built much faster (Python can even reuse it). Small wins; the main reasons for tuples are safety and hashability (section 10).</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>tuple</strong> is Python's built-in immutable sequence, written with commas (usually inside brackets): its length and the references in its slots are fixed at creation. It supports all read-only sequence operations; it is hashable exactly when all its items are hashable.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>x = 5,</code> (a stray trailing comma) makes x a tuple <code>(5,)</code>, and later arithmetic fails with a confusing error. Conversely <code>("samosa")</code> is just a string, so <code>for c in ("samosa")</code> loops over letters.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Packing &amp; Unpacking.</b> Records are safe now, but <code>order[0]</code>, <code>order[1]</code>, <code>order[2]</code> everywhere is clumsy. How do we pull a record apart into named variables in one go?</div>

  <h2 id="plt-unpack"><span class="num">08</span>Packing &amp; Unpacking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each order has three parts. Writing <code>o[0]</code> for the customer and <code>o[2]</code> for the quantity hides the meaning and invites mistakes. Is there a way to give each part its own name at once?</p>
  </div>
  <h3>Plain words</h3>
  <p><strong>Packing</strong>: writing several values separated by commas builds a tuple (<code>t = "Asha", "samosa", 3</code>). <strong>Unpacking</strong>: putting several names on the left of <code>=</code> splits a sequence into them, one name per item, in order. The counts must match, unless one name has a star, which collects "everything else" into a list.</p>
  <div class="fx" data-lang="py">name, item, qty = orders[0]          # unpacking: one name per slot
print(name, "|", item, "|", qty)
for name, item, qty in orders[:2]:   # unpacking inside a for loop
    print(f"{name} wants {qty} x {item}")
first, *rest = names                 # star collects "the rest" into a LIST
print(first, rest)
*early, last = names
print(early, last)</div>
  <div class="fx" data-lang="text">Asha | masala chai | 2
Asha wants 2 x masala chai
Ben wants 3 x samosa
Asha ['Ben', 'Asha', 'Chen', 'Dia', 'Ben']
['Asha', 'Ben', 'Asha', 'Chen', 'Dia'] Ben</div>
  <p>Line by line: three names take the three slots of order 0. In the <code>for</code> loop the unpacking happens on every pass, which is why section 04 could write <code>for name, item, qty in orders</code>. <code>first, *rest = names</code> takes Asha and puts the other five into a list; <code>*early, last</code> does the opposite.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Unpacking a tiffin: three compartments, three hands ready, each hand takes one. If the tiffin has four compartments and you have three hands, something falls (ValueError) unless one hand is a big bag (the star) that takes the rest.</p></div>
  <h3>Swaps, "multiple return values" and enumerate</h3>
  <div class="fx" data-lang="py">a, b = "Asha", "Ben"
a, b = b, a                          # swap: the right side is packed first, then unpacked
print(a, b)
def busiest(orders):
    big = max(orders, key=lambda o: o[2])
    return big[0], big[2]            # "returning two values" = returning ONE tuple
result = busiest(orders)
print(result, type(result))
who, how_many = busiest(orders)
print(who, how_many)
try:
    x, y = orders[0]
except ValueError as e:
    print("ValueError:", e)
for i, (name, item, qty) in enumerate(orders[:3], start=1):
    print(i, name, qty)</div>
  <div class="fx" data-lang="text">Ben Asha
('Ben', 3) &lt;class 'tuple'&gt;
Ben 3
ValueError: too many values to unpack (expected 2)
1 Asha 2
2 Ben 3
3 Asha 1</div>
  <ul>
    <li><strong>Swap</strong>: <code>a, b = b, a</code> first packs the right side into a tuple ("Ben", "Asha"), then unpacks it. No temporary variable needed.</li>
    <li><strong>Returning two values</strong> really returns one tuple <code>('Ben', 3)</code>, which the caller may unpack (<code>who, how_many = …</code>). Ben's samosa order is the biggest.</li>
    <li><strong>Mismatch</strong>: two names for a 3-slot tuple raises "too many values to unpack (expected 2)".</li>
    <li><strong>Nested unpacking</strong>: <code>enumerate</code> yields (position, order) pairs, and <code>i, (name, item, qty)</code> unpacks both levels.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Sequence unpacking</strong>: <code>t1, t2, …, tn = iterable</code> assigns the n items of any iterable to n targets, in order; exactly n items are required unless one target is starred (<code>*rest</code>), which receives the remaining items as a list. <strong>Tuple packing</strong>: <code>a, b, c</code> in an expression builds a tuple.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Unpacking a dict gives its <em>keys</em>, not its pairs: <code>a, b = {"x": 1, "y": 2}</code> sets a = "x". Use <code>.items()</code> for pairs (<a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: namedtuple.</b> Unpacking names the parts at one moment, in one place. The tuple itself still knows nothing about "customer" or "qty": pass it on and the next reader sees <code>o[2]</code> again. Can the record carry its own field names?</div>

  <h2 id="plt-named"><span class="num">09</span>namedtuple</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want records that are still tuples (fixed, light, unpackable, hashable) but where <code>o.qty</code> means something to the next person who reads the code.</p>
  </div>
  <p><code>collections.namedtuple</code> creates a new tuple <em>type</em> with named fields. Each object is a normal tuple, so everything from sections 07 and 08 still works, plus access by name.</p>
  <div class="fx" data-lang="py">from collections import namedtuple
Order = namedtuple("Order", ["customer", "item", "qty"])
o = Order("Asha", "masala chai", 2)
print(o)
print(o.customer, o.qty, o[0])            # by name AND by position
print(o == ("Asha", "masala chai", 2))     # still a tuple underneath
o2 = o._replace(qty=3)                     # a NEW tuple with one field changed
print(o2, o.qty)
print(o._asdict())
day = [Order(*t) for t in orders]
print(sum(x.qty for x in day if x.item == "masala chai"))</div>
  <div class="fx" data-lang="text">Order(customer='Asha', item='masala chai', qty=2)
Asha 2 Asha
True
Order(customer='Asha', item='masala chai', qty=3) 2
{'customer': 'Asha', 'item': 'masala chai', 'qty': 2}
5</div>
  <p>Reading it: the printed form shows the field names; <code>o.qty</code> and <code>o[0]</code> both work; it compares equal to a plain tuple with the same values. Because it is immutable, "changing" a field means <code>_replace</code>, which returns a new Order (o itself still has qty 2). <code>_asdict()</code> turns it into a dict. <code>Order(*t)</code> unpacks a plain tuple into the constructor, converting the whole morning; masala chai totals 2 + 1 + 2 = 5 cups.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A printed form with labelled boxes ("Customer: ___  Item: ___  Qty: ___") instead of a blank strip of three boxes.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>namedtuple(typename, field_names)</code> returns a subclass of tuple whose fields are reachable by attribute and by index, with helpers <code>_replace</code>, <code>_asdict</code>, <code>_fields</code>. <code>typing.NamedTuple</code> is the class-syntax version with type hints. When the record must be mutable or carry methods, use a <code>@dataclass</code> (<a class="xref" data-note="py_oop">OOP</a>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>o.qty = 3</code> raises AttributeError: a namedtuple is still immutable. And because it is a tuple, <code>len(o)</code> is 3 and it unpacks positionally, so reordering the fields later breaks every <code>a, b, c = o</code> in the code base.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Tuples as Dict Keys.</b> Immutability gave us safety. It also gives something less obvious: a value that can never change can be used as a <em>label</em> to file things under. Why can a tuple be that label and a list cannot?</div>

  <h2 id="plt-hash"><span class="num">10</span>Why Tuples Can Be Dict Keys</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The owner asks: "How many cups has each customer had of each item?" The natural label for an answer is the pair (customer, item). Can we file totals under a pair, and why does Python refuse when the pair is a list?</p>
  </div>
  <h3>Plain words</h3>
  <p>A dict (next note) files each value under a key, and finds it again by turning the key into a number called its <strong>hash</strong>, which picks the shelf. That only works if the key's hash can never change while it is stored. A tuple of immutable items can never change, so its hash is stable: it is <strong>hashable</strong>. A list can change at any time, so Python does not give it a hash at all.</p>
  <div class="fx" data-lang="py">print(hash(("Asha", "masala chai")) == hash(("Asha", "masala chai")))
counts = {}
for name, item, qty in orders:
    key = (name, item)                      # a tuple as a dict key
    counts[key] = counts.get(key, 0) + qty
print(counts[("Ben", "masala chai")], len(counts))
try:
    {["Asha", "masala chai"]: 2}
except TypeError as e:
    print("TypeError:", e)
try:
    hash(("table 1", ["Asha", "Ben"]))
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">True
2 6
TypeError: unhashable type: 'list'
TypeError: unhashable type: 'list'</div>
  <p>Reading it: equal tuples always hash the same. Six orders produced six distinct (customer, item) keys, and the key <code>("Ben", "masala chai")</code> holds 2 cups. The list key is refused ("unhashable type: 'list'"), and so is a tuple that <em>contains</em> a list: hashability needs every item to be hashable.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cloakroom token must keep its number. If the number on your token could be rubbed out and rewritten, the attendant would look on the wrong shelf. A tuple is a stamped metal token; a list is a token written in pencil.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An object is <strong>hashable</strong> if it has a hash value that never changes during its lifetime and equal objects have equal hashes. Immutable built-ins (int, float, str, bytes, frozenset, tuples of hashables) are hashable; list, dict and set are not. Only hashable objects can be dict keys or set items.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Tuples are hashable" is not always true: <code>("table 1", ["Asha", "Ben"])</code> is a tuple and is not hashable. Use tuples of strings and numbers (or frozensets) as keys.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>.</b> We used a dict without knowing how it finds a key instantly among millions, or why a set can answer "has Esha been here?" without scanning. That is hashing, the subject of the next note. First, let us connect everything in this one.</div>

  <h2 id="plt-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Indexing, slicing, append, comprehensions, sorting, copies, tuples, unpacking, namedtuple, hashing: ten topics, or one idea seen from ten sides?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="plt-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="230" y="8" width="200" height="44" rx="7" class="fb sb"/><text x="330" y="27" text-anchor="middle" font-size="11.5" font-weight="700">a row of references</text><text x="330" y="43" text-anchor="middle" class="tm" font-size="10">ordered slots 0 … n−1</text>
<line x1="280" y1="52" x2="120" y2="86" stroke="currentColor" marker-end="url(#plt-a9)"/><line x1="380" y1="52" x2="540" y2="86" stroke="currentColor" marker-end="url(#plt-a9)"/>
<rect x="20" y="88" width="200" height="44" rx="7" class="ft st"/><text x="120" y="107" text-anchor="middle" font-size="11.5" font-weight="700">list: mutable</text><text x="120" y="123" text-anchor="middle" class="tm" font-size="10">dynamic array with spare room</text>
<rect x="440" y="88" width="200" height="44" rx="7" class="ft st"/><text x="540" y="107" text-anchor="middle" font-size="11.5" font-weight="700">tuple: immutable</text><text x="540" y="123" text-anchor="middle" class="tm" font-size="10">fixed slots, no spare room</text>
<line x1="330" y1="52" x2="330" y2="86" stroke="currentColor" marker-end="url(#plt-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">index &amp; slice</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">shared by every sequence</text>
<line x1="70" y1="132" x2="60" y2="168" stroke="currentColor" marker-end="url(#plt-a9)"/><line x1="120" y1="132" x2="170" y2="168" stroke="currentColor" marker-end="url(#plt-a9)"/><line x1="170" y1="132" x2="290" y2="168" stroke="currentColor" marker-end="url(#plt-a9)"/>
<rect x="5" y="170" width="110" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="60" y="189" text-anchor="middle" font-size="11" font-weight="700">append / pop</text><text x="60" y="205" text-anchor="middle" class="tm" font-size="10">O(1) end, O(n) front</text>
<rect x="122" y="170" width="110" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="177" y="189" text-anchor="middle" font-size="11" font-weight="700">comprehension</text><text x="177" y="205" text-anchor="middle" class="tm" font-size="10">loop + if + append</text>
<rect x="240" y="170" width="100" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="290" y="189" text-anchor="middle" font-size="11" font-weight="700">sort / sorted</text><text x="290" y="205" text-anchor="middle" class="tm" font-size="10">key=, stable</text>
<line x1="120" y1="132" x2="120" y2="240" stroke="currentColor" stroke-opacity="0.4"/><line x1="120" y1="240" x2="148" y2="252" stroke="currentColor" marker-end="url(#plt-a9)"/>
<rect x="150" y="236" width="190" height="44" rx="7" class="fr sr"/><text x="245" y="255" text-anchor="middle" font-size="11" font-weight="700">alias · shallow · deep</text><text x="245" y="271" text-anchor="middle" class="tm" font-size="10">shared refs → [[0]*3]*3 trap</text>
<line x1="500" y1="132" x2="420" y2="168" stroke="currentColor" marker-end="url(#plt-a9)"/><line x1="540" y1="132" x2="540" y2="168" stroke="currentColor" marker-end="url(#plt-a9)"/>
<rect x="355" y="170" width="120" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="415" y="189" text-anchor="middle" font-size="11" font-weight="700">unpacking</text><text x="415" y="205" text-anchor="middle" class="tm" font-size="10">name, item, qty = o</text>
<rect x="485" y="170" width="120" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="545" y="189" text-anchor="middle" font-size="11" font-weight="700">namedtuple</text><text x="545" y="205" text-anchor="middle" class="tm" font-size="10">o.qty</text>
<line x1="600" y1="132" x2="580" y2="234" stroke="currentColor" marker-end="url(#plt-a9)"/>
<rect x="420" y="236" width="230" height="44" rx="7" class="fg sg"/><text x="535" y="255" text-anchor="middle" font-size="11" font-weight="700">hashable → dict key</text><text x="535" y="271" text-anchor="middle" class="tm" font-size="10">next note: Dicts &amp; Sets</text>
</svg><figcaption>One idea, a numbered row of references, split two ways. Mutable (list) gives growth, comprehensions and sorting, and the price is the copy traps. Immutable (tuple) gives safe records, unpacking, names, and the bonus of hashability, which the next note builds on.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Chai Corner's six orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On our orders</th><th>Use when</th></tr>
    <tr><td>List</td><td>row of references</td><td>keep many values in order</td><td><code>len(orders)</code> = 6</td><td>a collection that grows, shrinks, reorders</td></tr>
    <tr><td>Indexing</td><td>offset from start; −k = n − k</td><td>get one item</td><td><code>names[3]</code> Chen, <code>[-1]</code> Ben</td><td>known position</td></tr>
    <tr><td>Slicing</td><td>cuts between items + step</td><td>get a stretch</td><td><code>[1:4]</code> Ben, Asha, Chen</td><td>first/last k, every k-th, reverse</td></tr>
    <tr><td>append / pop / insert</td><td>dynamic array</td><td>change the collection</td><td>pop(0) ≈ 0.9 s vs deque ≈ 0.005 s on 100k</td><td>end ops on lists; deque for the front</td></tr>
    <tr><td>Comprehension</td><td>for + if + append</td><td>build a list from a list</td><td>chai cups [2, 1, 1, 2] → 6</td><td>map/filter in one readable line</td></tr>
    <tr><td>Sorting</td><td>comparisons + key function</td><td>put items in a chosen order</td><td>by (−qty, name): Ben 3 first</td><td>reports, top-k, ranking</td></tr>
    <tr><td>Alias / copies</td><td>references</td><td>is this the same list?</td><td>shallow sees "Esha", deep does not</td><td>deepcopy for nested data</td></tr>
    <tr><td>Tuple</td><td>fixed row of references</td><td>a record nobody can edit</td><td>("Asha", "masala chai", 2)</td><td>rows, returns, keys</td></tr>
    <tr><td>Unpacking</td><td>tuple packing + positions</td><td>name the parts</td><td><code>first, *rest</code>: Asha + 5 others</td><td>loops, swaps, multiple returns</td></tr>
    <tr><td>namedtuple</td><td>tuple subclass</td><td>self-describing record</td><td><code>o.qty</code> = 2; chai total 5</td><td>light read-only records</td></tr>
    <tr><td>Hashable tuple</td><td>immutability</td><td>can it be a key?</td><td><code>("Ben", "masala chai")</code> → 2</td><td>composite dict keys, set items</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a list and a tuple are both numbered rows of references; the list can change, the tuple cannot.</strong> Every list power (append, sort, comprehensions) and every list danger (aliases, shallow copies, the grid trap) comes from "can change + references". Every tuple power (safe records, hashable keys) comes from "cannot change".</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing how the pieces fit is half the job; the other half is knowing where people usually slip.</div>

  <h2 id="plt-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which of these ideas cause real bugs in real code, and what does each bug look like when it happens?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: assigning the result of an in-place method</span><p><code>q = q.sort()</code>, <code>q = q.append(x)</code> → q becomes None. Use <code>q.sort()</code> alone, or <code>q = sorted(q)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: append vs extend</span><p><code>a.append([1, 2])</code> nests a list; <code>a.extend("Ben")</code> adds letters. Pick the one that matches "one item" vs "each item".</p></div>
  <div class="callout trap"><span class="label">Trap: list as a queue</span><p><code>pop(0)</code>/<code>insert(0, x)</code> are O(n); a loop of them is O(n²). Use <code>collections.deque</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: off-by-one slices</span><p><code>s[a:b]</code> excludes b and has b − a items. A slice never raises, so a wrong bound gives a silently short list.</p></div>
  <div class="callout trap"><span class="label">Trap: shallow copy of nested data</span><p><code>.copy()</code>, <code>[:]</code>, <code>list()</code> share inner lists. Edit through the copy and the original changes. Use <code>copy.deepcopy</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: [[0]*3]*3</span><p>Three references to one row. Build grids with <code>[[0]*3 for _ in range(3)]</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: mutable default argument</span><p><code>def add(o, day=[])</code> creates the list once, so every call shares it. Use <code>day=None</code> and create a list inside (<a class="xref" data-note="py_functions">Functions</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: modifying a list while looping over it</span><p><code>for x in q: if bad(x): q.remove(x)</code> skips items, because removing shifts the next one into the current slot. Build a new list with a comprehension instead.</p></div>
  <div class="callout trap"><span class="label">Trap: one-item tuple</span><p><code>(5)</code> is an int, <code>(5,)</code> a tuple; a stray trailing comma makes an accidental tuple.</p></div>
  <div class="callout trap"><span class="label">Trap: "tuples are always hashable"</span><p>Only if every item is hashable: a tuple holding a list cannot be a key.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page.</div>

  <h2 id="plt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Chai Corner's six orders <code>(customer, item, qty)</code>: (Asha, masala chai, 2), (Ben, samosa, 3), (Asha, ginger chai, 1), (Chen, masala chai, 1), (Dia, bun maska, 2), (Ben, masala chai, 2). <code>names</code> = Asha, Ben, Asha, Chen, Dia, Ben.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>List</td><td>keep many values in order?</td><td>6 orders, one name</td><td>how to reach one?</td></tr>
    <tr><td>Indexing</td><td>get one item?</td><td><code>names[3]</code> Chen, <code>[-1]</code> Ben</td><td>want a stretch</td></tr>
    <tr><td>Slicing</td><td>get a piece?</td><td><code>[1:4]</code> Ben, Asha, Chen; <code>[4:1:-1]</code> Dia, Chen, Asha</td><td>orders keep coming</td></tr>
    <tr><td>append/extend/insert/pop</td><td>change it?</td><td>pop(0) O(n) vs deque O(1)</td><td>building lists is verbose</td></tr>
    <tr><td>Comprehension</td><td>build a list in one line?</td><td>chai cups [2, 1, 1, 2]</td><td>still arrival order</td></tr>
    <tr><td>Sorting</td><td>chosen order?</td><td>(−qty, name): Ben 3, Asha 2, Ben 2, Dia 2, Asha 1, Chen 1</td><td>who else changed my list?</td></tr>
    <tr><td>Alias/shallow/deep</td><td>same list or a copy?</td><td>shallow sees inner edit, deep doesn't</td><td>want unchangeable records</td></tr>
    <tr><td>Tuple</td><td>a fixed record?</td><td><code>order[2] = 3</code> → TypeError</td><td>o[2] is unreadable</td></tr>
    <tr><td>Unpacking</td><td>name the parts?</td><td><code>first, *rest</code> → Asha, [5 names]</td><td>names don't travel</td></tr>
    <tr><td>namedtuple</td><td>fields with names?</td><td><code>o.qty</code> 2; masala chai total 5</td><td>can a record be a key?</td></tr>
    <tr><td>Hashable tuple</td><td>use as a key?</td><td>("Ben", "masala chai") → 2; list → TypeError</td><td>how do dicts find keys? → next note</td></tr>
  </table>
  <h3>Definitions and rules</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Negative index</td><td><code>s[-k]</code> = <code>s[len(s) - k]</code></td><td>valid k: 1 … len(s)</td></tr>
    <tr><td>Slice</td><td><code>s[start:stop:step]</code> → items start, start+step, … before stop</td><td>stop excluded; length (stop − start) for step 1; clamped, never raises</td></tr>
    <tr><td>Costs</td><td>index/append/pop() O(1)*; insert/pop(0)/in/remove O(n); sort O(n log n)</td><td>* amortised: rare resize (4 → 8 → 16 → 24 slots)</td></tr>
    <tr><td>Comprehension</td><td><code>[expr for x in it if cond]</code> ≡ loop + if + append</td><td>if/else in front = choose; if at end = filter</td></tr>
    <tr><td>Sort</td><td><code>sorted()</code> new list; <code>.sort()</code> in place → None</td><td><code>key=</code> function; stable; <code>reverse=True</code></td></tr>
    <tr><td>Copies</td><td>alias <code>b = a</code>; shallow <code>a.copy()</code>; deep <code>copy.deepcopy(a)</code></td><td>check with <code>is</code> / <code>id()</code></td></tr>
    <tr><td>Tuple</td><td>commas make it; <code>(5,)</code></td><td>immutable slots; inner mutables can change</td></tr>
    <tr><td>Unpacking</td><td><code>a, b, c = seq</code>; <code>first, *rest = seq</code></td><td>counts must match unless starred</td></tr>
    <tr><td>Hashable</td><td>hash never changes; equal ⇒ equal hash</td><td>tuple hashable iff all items are</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a list</b><p>Many items of one kind, count varies, order matters, you add/remove at the end, sort, or index.</p><small>Not for: frequent front removals (deque), membership tests (set), lookup by name (dict)</small></div>
    <div><b>Use a tuple</b><p>A fixed record (each slot has a meaning), function returns, dict keys, set items, data that must not change.</p><small>namedtuple when the fields deserve names</small></div>
    <div><b>Use deepcopy</b><p>Nested mutable data you will edit while keeping the original: configs, JSON, lists of lists.</p><small>Flat lists: shallow copy is enough</small></div>
    <div><b>Use a comprehension</b><p>Building one list from another by transform and/or filter, in one readable line.</p><small>Not for side effects; not past 2 levels</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p><code>q = q.sort()</code> gives None; append vs extend; <code>pop(0)</code> in a loop is O(n²); slices exclude stop; shallow copies share inner lists; <code>[[0]*3]*3</code> shares one row; mutable default arguments; removing while iterating skips items; <code>(5)</code> is not a tuple; tuples with lists inside are unhashable.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>names[-2]</code> and <code>names[::2]</code>?</td><td>Dia; Asha, Asha, Dia</td></tr>
    <tr><td>Cost of <code>pop(0)</code> on a list of n, and the fix?</td><td>O(n) (shift every item); <code>deque.popleft()</code> is O(1)</td></tr>
    <tr><td><code>b = a.copy(); b[0].append(1)</code> on nested <code>a</code>: does a change?</td><td>Yes: shallow copy shares inner lists; use deepcopy</td></tr>
    <tr><td>Sort orders by qty descending, ties by name, in one call?</td><td><code>sorted(orders, key=lambda o: (-o[2], o[0]))</code></td></tr>
    <tr><td>Why can <code>("Ben", "samosa")</code> be a dict key but <code>["Ben", "samosa"]</code> not?</td><td>The tuple is immutable so its hash never changes; a list is mutable and unhashable</td></tr>
  </table>

  <h2 id="plt-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>List vs tuple: what is the real trade-off?</summary><div class="qa-body">List: mutable, can grow, not hashable, a little bigger (spare room: 88 vs 64 bytes for our 3-item order). Tuple: fixed, smaller and faster to build, hashable when its items are, so it can be a dict key or set item. Use a tuple for fixed records and as a promise that nobody changes the data; a list for a collection whose size or order changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>append</code> O(1) but <code>insert(0, x)</code> O(n)?</summary><div class="qa-body">A list is a dynamic array: references side by side with spare room at the end. append uses the next spare slot (an occasional resize is spread over many appends: amortised O(1)). insert(0) must shift all n references one slot right. Same for pop(0) vs pop().</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>names[4:1:-1]</code> return for Asha, Ben, Asha, Chen, Dia, Ben?</summary><div class="qa-body">Start at index 4, step −1, stop before index 1: positions 4, 3, 2 → ['Dia', 'Chen', 'Asha'].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shallow vs deep copy: when does it bite?</summary><div class="qa-body"><code>a.copy()</code>/<code>a[:]</code>/<code>list(a)</code> make a new outer list but share the inner objects. Editing a nested list through the copy changes the original (our shallow copy saw "Esha"). Use <code>copy.deepcopy</code> for nested data such as configs, JSON and lists of lists. Flat lists of immutables are safe with a shallow copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>g = [[0]*2]*2; g[0][0] = 1; print(g)</code></summary><div class="qa-body"><code>[[1, 0], [1, 0]]</code>. The outer <code>*2</code> repeats the reference to one inner list. Build rows with <code>[[0]*2 for _ in range(2)]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Desugar <code>[n.upper() for n, i, q in orders if q &gt;= 2]</code> into a loop.</summary><div class="qa-body"><code>out = []</code> / <code>for n, i, q in orders:</code> / <code>    if q &gt;= 2:</code> / <code>        out.append(n.upper())</code>. Result: ['ASHA', 'BEN', 'DIA', 'BEN'].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>sorted(x)</code> vs <code>x.sort()</code>?</summary><div class="qa-body">sorted works on any iterable and returns a new list, leaving x unchanged. x.sort() only exists on lists, sorts in place and returns None. Both accept key= and reverse=, both are stable Timsort, O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "stable sort" mean and why is it useful?</summary><div class="qa-body">Items with equal keys keep their previous relative order. So you can sort by a secondary key and then by the primary key, and ties in the primary key stay ordered by the secondary one. On our orders: sort by name, then by −qty → Ben 3, then Asha, Ben, Dia (all 2), then Asha, Chen (1). A tuple key <code>(-qty, name)</code> does it in one pass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you return "two values" from a function, and what really comes back?</summary><div class="qa-body"><code>return who, qty</code> packs a single tuple; the caller can unpack it: <code>who, qty = busiest(orders)</code> → Ben, 3. Mismatched counts raise ValueError.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the shallow-copy trap and the <code>[[0]*3]*3</code> trap have the same root cause?</summary><div class="qa-body">Both come from lists storing references, not values. A shallow copy copies the references to the inner lists; <code>* 3</code> repeats a reference to one row. In both cases two "different" slots point at one mutable object, so a change through one is seen through the other. That is the same idea as aliasing (<code>b = a</code>), one level down.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a dict key need immutability, and what would break if lists were allowed?</summary><div class="qa-body">A dict files a key on a shelf chosen by its hash. If the key could change after being stored, its hash would change, and a later lookup would go to a different shelf and miss the entry, even though it is still in the dict. Tuples of immutables cannot change, so their hash is stable. That is why the tuple section leads straight into Dicts &amp; Sets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do we need deque if we have lists?</summary><div class="qa-body">The list's design (one contiguous array) makes the end cheap and the front expensive. A queue removes from the front, so a list queue costs O(n) per removal; draining 100,000 items took about 0.9 s vs 0.005 s with deque, which links blocks so both ends are O(1). The price: deque indexing in the middle is O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>namedtuple vs dataclass vs dict for a record?</summary><div class="qa-body">namedtuple: immutable, light, hashable, positional and named access, unpackable. dataclass: a normal class with generated <code>__init__</code>/<code>__repr__</code>/<code>__eq__</code>, mutable by default (frozen=True for immutable), can have methods and defaults (<a class="xref" data-note="py_oop">OOP</a>). dict: flexible keys, no fixed shape, no attribute access; good for JSON-like data.</div></details>
</main>
`
});
