// notes/python/py_ds.js — Python Collections: the map
Object.assign(TOPIC_CONTENT, {
  "py_ds": `<main>
<h1>Python Collections: the map</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Python Collections: the map</span></div>
  <p class="lead">Start here. A variable holds one value, but real data comes in groups: a day of orders, a menu of prices, a register of customers, a stack of text messages. Python has five built-in containers for them, list, tuple, set, dict and str, and they are not five unrelated topics. Each one exists because the one before it could not answer a question. This page tells that story as a chain of needs, follows one running example through all of it (one morning at Chai Corner, a tea stall: six orders, a menu, the customers, the order texts), compares the containers on the four properties that decide everything, gives a short procedure for choosing one, and lays out the reading order of the three notes that teach them in depth. It ends with a revision sheet. Run on Python 3.13.</p>

  <h2 id="pc-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pc-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="120" y="6" width="400" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Fundamentals · Values &amp; Types · Control Flow · Functions</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pc-ga)"/>
<line x1="320" y1="100" x2="110" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pc-ga)"/>
<line x1="320" y1="100" x2="320" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pc-ga)"/>
<line x1="320" y1="100" x2="530" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pc-ga)"/>
<line x1="200" y1="152" x2="228" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pc-ga)"/>
<line x1="410" y1="152" x2="438" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pc-ga)"/>
<rect x="210" y="62" width="220" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="700">Python Collections: the map</text>
<text x="320" y="94" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · which container, and why</text>
<rect x="20" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="149" text-anchor="middle" font-size="12" font-weight="400">Lists &amp; Tuples</text>
<text x="110" y="164" text-anchor="middle" class="tm" font-size="10">order · fixed records</text>
<rect x="230" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="149" text-anchor="middle" font-size="12" font-weight="400">Dicts &amp; Sets</text>
<text x="320" y="164" text-anchor="middle" class="tm" font-size="10">lookup by key · unique</text>
<rect x="440" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="149" text-anchor="middle" font-size="12" font-weight="400">Strings</text>
<text x="530" y="164" text-anchor="middle" class="tm" font-size="10">text is a sequence too</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pc-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Iterators &amp; Generators · OOP · DSA: Arrays, Hashing · Pandas</text>
</svg><figcaption>The Python Collections group. Read the map first, then left to right: each note answers a question the one before could not. The dotted arrows are the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_fundamentals">Python Fundamentals</a></b><span>There you learnt that a name is a tag tied to one object, that some objects can change (mutable) and others cannot (immutable), and the basic types: numbers, booleans, strings. (The newer notes <a class="xref" data-note="py_values">Values &amp; Types</a>, <a class="xref" data-note="py_control">Control Flow</a> and <a class="xref" data-note="py_functions">Functions</a> cover the same ground step by step.) Left open: one name, one value. How do we hold many?</span></li>
    <li><b>This note adds: the map of the containers</b><span>Why each container exists (the need chain), what each is good and bad at (four properties), how to pick one in seconds, and the order to study them. No container is taught in full here; each child note does that.</span></li>
    <li><b>Leads to: the three child notes, then beyond</b><span><a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> → <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> → <a class="xref" data-note="py_strings">Strings</a>. After the group: <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> (what a <code>for</code> loop really does with these containers), <a class="xref" data-note="py_oop">OOP</a> (your own container-like classes), <a class="xref" data-note="dsa_arrays">DSA: Arrays</a> and <a class="xref" data-note="dsa_hashing">DSA: Hashing</a> (interview patterns built on lists and dicts), and <a class="xref" data-note="da_pandas">Pandas</a> (DataFrames built from lists of dicts).</span></li>
  </ol>

  <h2 id="pc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole group as one chain of needs. Each container answers the question above it; its weakness raises the next question. Numbers come from the running example (section 01). If you can retell this list in your own words, you know how the group fits together.</p>
  <ol class="story">
    <li><b>One value</b><span>Q: how do we store an order? → A variable: <code>order1 = "Asha: 2 masala chai ₹40"</code>. But by 9:30 there are six orders and by evening three hundred. Six names cannot be counted, looped over or sorted…</span></li>
    <li><b>list</b><span>Q: how do we keep many values, in order, under one name? → <code>orders</code>, a list: <code>len(orders)</code> is 6, <code>orders[-1]</code> is the last order, one loop counts 6 cups of chai. But an order is itself several facts (who, what, how many), and any code could quietly change them… <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a></span></li>
    <li><b>tuple</b><span>Q: how do we store one fixed record that nobody can edit by accident? → <code>("Asha", "masala chai", 2)</code>: reading is easy, <code>order[2] = 3</code> raises TypeError. But to ask "has Esha been here today?" we still scan every order, and the names repeat… <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a></span></li>
    <li><b>set</b><span>Q: how do we keep each customer once, and answer "is it there?" instantly? → <code>set(names)</code>: six names, 4 customers; <code>"Esha" in customers</code> is False in one step, and on 100,000 ids a set is thousands of times faster than a list. But a set only says yes or no; it cannot tell us what a samosa costs… <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a></span></li>
    <li><b>dict</b><span>Q: how do we look up a value by its name? → <code>menu["samosa"]</code> is 15, in the same tiny time for 4 items or 4 million (hashing, like the set). Bills: Asha ₹65, Ben ₹85, Chen ₹20, Dia ₹60, total ₹230. But where did the orders come from? The stall received them as text… <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a></span></li>
    <li><b>str</b><span>Q: how do we work with the text itself? → A string is also a sequence (of characters), so indexing and slicing work as for lists; methods like <code>split</code> and regex cut "Asha: 2 masala chai ₹40" into the tuple, and f-strings print the receipt. <a class="xref" data-note="py_strings">Strings</a></span></li>
    <li><b>Choosing</b><span>Q: with five containers, how do we pick? → Four properties decide: ordered? changeable? hashable? how fast is lookup? A short procedure (section 04) turns them into one choice, and real data usually combines them: a list of tuples, a dict of lists, a set of tuples.</span></li>
  </ol>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Python Collections</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">list</div>
        <ul>
          <li>Ordered, changeable, duplicates OK; holds references</li>
          <li>Index O(1); append/pop at end O(1)*; front O(n); <code>in</code> O(n)</li>
          <li>Slicing, comprehensions, sorting, copies</li>
          <li>💡 the order pad at the counter</li>
          <li>Chai Corner: <code>orders</code>, 6 tuples</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">tuple</div>
        <ul>
          <li>Ordered, fixed; a record where each slot has a meaning</li>
          <li>Unpacking <code>name, item, qty = o</code>; namedtuple</li>
          <li>Hashable (if items are) → dict key, set item</li>
          <li>💡 a printed receipt</li>
          <li>Chai Corner: <code>("Asha", "masala chai", 2)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">set</div>
        <ul>
          <li>Unique, unordered, items hashable</li>
          <li><code>in</code> O(1) average; <code>| &amp; - ^</code></li>
          <li>Dedupe; compare id lists</li>
          <li>💡 a guest register, each name once</li>
          <li>Chai Corner: 4 customers from 6 names</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">dict</div>
        <ul>
          <li>Key → value; keys unique and hashable; insertion order kept</li>
          <li>Lookup by key O(1) average (hashing)</li>
          <li>get, setdefault, Counter, defaultdict</li>
          <li>💡 the menu board: item → price</li>
          <li>Chai Corner: <code>menu["samosa"]</code> = 15; bills total ₹230</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">str</div>
        <ul>
          <li>Immutable sequence of characters (code points)</li>
          <li>Slicing as lists; split/join/strip/replace; f-strings</li>
          <li>join not + in loops; UTF-8 bytes; regex for shapes</li>
          <li>💡 a shop's name board of letter tiles</li>
          <li>Chai Corner: "Asha: 2 masala chai ₹40"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing</div>
        <ul>
          <li><b>Ordered + changes</b> → list · <b>fixed record/key</b> → tuple</li>
          <li><b>"Is it there?" / unique</b> → set · <b>by name</b> → dict</li>
          <li><b>Queue</b> → deque · <b>count</b> → Counter · <b>top-k</b> → heapq</li>
          <li><b>Millions of numbers</b> → numpy / pandas</li>
          <li>⚠ <code>in</code> on a list inside a loop = O(n²)</li>
          <li>⚠ only hashable things can be keys or set items</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The group as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pc-day"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Morning at Chai Corner</span><span class="rm-sub">The running example</span></div></div>
      <div class="rm-item rm-done" data-target="pc-chain"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Need Chain</span><span class="rm-sub">Why each container exists</span></div></div>
      <div class="rm-item rm-done" data-target="pc-props"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Four Properties</span><span class="rm-sub">Ordered, mutable, hashable, lookup</span></div></div>
      <div class="rm-item rm-done" data-target="pc-choose"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">How to Choose</span><span class="rm-sub">A procedure and combinations</span></div></div>
      <div class="rm-item rm-done" data-target="pc-read"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Reading Order</span><span class="rm-sub">The three notes and after</span></div></div>
      <div class="rm-item rm-done" data-target="pc-connect"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Choosing wrong</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The group in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pc-day"><span class="num">01</span>One Morning at Chai Corner</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Everything in <a class="xref" data-note="py_fundamentals">Python Fundamentals</a> worked on one value at a time. A business never has one value. What does a small, real day of data look like, and what questions will we want to ask of it?</p>
  </div>
  <h3>The running example</h3>
  <p>Chai Corner is a tea stall. On Monday morning the helper types each order into the stall's phone as a line of text. Six lines arrived before 9:30. The stall's menu has four items. The same morning is used in every note of this group, so you can watch the same numbers appear again and again, each time computed by a different container.</p>
  <table class="tbl"><caption>The running example</caption>
    <tr><th>#</th><th>order text</th><th>customer</th><th>item</th><th>qty</th><th>₹</th></tr>
    <tr><td>0</td><td>Asha: 2 masala chai ₹40</td><td>Asha</td><td>masala chai</td><td>2</td><td>40</td></tr>
    <tr><td>1</td><td>Ben: 3 samosa ₹45</td><td>Ben</td><td>samosa</td><td>3</td><td>45</td></tr>
    <tr><td>2</td><td>Asha: 1 ginger chai ₹25</td><td>Asha</td><td>ginger chai</td><td>1</td><td>25</td></tr>
    <tr><td>3</td><td>Chen: 1 masala chai ₹20</td><td>Chen</td><td>masala chai</td><td>1</td><td>20</td></tr>
    <tr><td>4</td><td>Dia: 2 bun maska ₹60</td><td>Dia</td><td>bun maska</td><td>2</td><td>60</td></tr>
    <tr><td>5</td><td>Ben: 2 masala chai ₹40</td><td>Ben</td><td>masala chai</td><td>2</td><td>40</td></tr>
  </table>
  <p>Menu (₹ each): masala chai 20, ginger chai 25, samosa 15, bun maska 30. Yesterday's customers (used in Dicts &amp; Sets): Ben, Dia, Esha.</p>
  <h3>The owner's questions</h3>
  <ul>
    <li>How many orders today, and which was the last one? (a <strong>list</strong>)</li>
    <li>What exactly did order 0 say, guaranteed unchanged? (a <strong>tuple</strong>)</li>
    <li>How many different customers came? Did Esha come? (a <strong>set</strong>)</li>
    <li>What does a samosa cost, and what does each customer owe? (a <strong>dict</strong>)</li>
    <li>How do we read the typed lines and print a receipt? (a <strong>str</strong>)</li>
  </ul>
  <h3>All five containers in one short script</h3>
  <p>Do not worry about every detail of the code yet; each line is taught in a child note. Notice that each container does one job:</p>
  <div class="fx" data-lang="py">LINES = [                                   # str: the raw text, one line per order
    "Asha: 2 masala chai ₹40",
    "Ben: 3 samosa ₹45",
    "Asha: 1 ginger chai ₹25",
    "Chen: 1 masala chai ₹20",
    "Dia: 2 bun maska ₹60",
    "Ben: 2 masala chai ₹40",
]
orders = []                                 # list: the orders, in arrival order
for line in LINES:
    name, rest = line.split(": ")           # string methods cut the text
    words = rest.split()
    orders.append((name, " ".join(words[1:-1]), int(words[0])))   # tuple: one fixed record
menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}   # dict: price by name
customers = {name for name, item, qty in orders}                              # set: unique people
print(orders[0], len(orders))
print(menu["samosa"])
print(sorted(customers), len(customers))
print(type(LINES[0]).__name__, type(orders).__name__, type(orders[0]).__name__,
      type(menu).__name__, type(customers).__name__)</div>
  <div class="fx" data-lang="text">('Asha', 'masala chai', 2) 6
15
['Asha', 'Ben', 'Chen', 'Dia'] 4
str list tuple dict set</div>
  <p>Reading the output: 6 orders, the first being the tuple <code>('Asha', 'masala chai', 2)</code>; a samosa costs 15; 4 distinct customers; and the five type names, one for each container. The raw lines are <code>str</code>, the morning is a <code>list</code>, each order is a <code>tuple</code>, the menu is a <code>dict</code>, and the customers are a <code>set</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A stall counter has the order pad (list), printed receipts (tuples), the guest register (set), the menu board (dict), and the phone with the text messages (str). Nobody would write prices on the order pad or orders on the menu board: each tool fits one job.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>container</strong> (collection) is an object that holds references to other objects. Python's built-in containers are the <strong>sequences</strong> list, tuple and str (ordered, indexed by position), the <strong>set</strong> (unordered, unique items), and the <strong>mapping</strong> dict (key → value).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Containers hold references, not copies (the "names are tags" idea from Fundamentals). Putting a list inside another list and then changing it changes it everywhere it appears. This is the root of the copy traps in <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Need Chain.</b> We saw five containers working. Why these five, why in this order, and what goes wrong if we use the wrong one?</div>

  <h2 id="pc-chain"><span class="num">02</span>The Need Chain: Why Each Container Exists</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Learners often meet list, tuple, set and dict as a list of facts to memorise. The better question is: what problem does each one solve that the previous one could not? Walk the chain one step at a time on the stall's data.</p>
  </div>
  <h3>Step 1: one value is not enough → list</h3>
  <div class="fx" data-lang="py">order1 = "Asha: 2 masala chai ₹40"
order2 = "Ben: 3 samosa ₹45"
order3 = "Asha: 1 ginger chai ₹25"
# ... order4, order5, order6, and 300 more by evening?
# How many orders? Which one was last? Loop over them? With separate names we cannot.
print(order1)
print(order3)</div>
  <div class="fx" data-lang="text">Asha: 2 masala chai ₹40
Asha: 1 ginger chai ₹25</div>
  <p>Separate variables work for two or three orders, but they cannot be counted (<code>len</code> of what?), looped over, or sorted, and their number is unknown in advance. We need <em>one</em> name for <em>many</em> values, kept in arrival order.</p>
  <div class="fx" data-lang="py">print(len(orders), orders[-1])             # how many? which was last?
cups = 0
for name, item, qty in orders:             # one loop handles 6 or 6,000
    if "chai" in item:
        cups += qty
print("chai cups:", cups)</div>
  <div class="fx" data-lang="text">6 ('Ben', 'masala chai', 2)
chai cups: 6</div>
  <p>A <strong>list</strong> gives that: 6 orders, the last one is Ben's masala chai, and a single loop adds up 6 cups of chai (2 + 1 + 1 + 2) whether there are six orders or six thousand. <em>New weakness:</em> each order is a bundle of three facts, and a list lets any code change any of them.</p>
  <h3>Step 2: a fixed record → tuple</h3>
  <div class="fx" data-lang="py">order = orders[0]
try:
    order[2] = 3                            # nobody may quietly change a recorded order
except TypeError as e:
    print("TypeError:", e)
name, item, qty = order                     # but reading it is easy
print(name, item, qty)</div>
  <div class="fx" data-lang="text">TypeError: 'tuple' object does not support item assignment
Asha masala chai 2</div>
  <p>A <strong>tuple</strong> is an ordered record that cannot change: reading and unpacking are easy, assignment raises TypeError. So the morning is a list (it grows) of tuples (each fixed). <em>New weakness:</em> to answer "did Esha come?" we would scan every order, and names repeat.</p>
  <h3>Step 3: unique items and "is it there?" → set</h3>
  <div class="fx" data-lang="py">names = [name for name, item, qty in orders]
print(names)
print(set(names), "Esha" in customers)</div>
  <div class="fx" data-lang="text">['Asha', 'Ben', 'Asha', 'Chen', 'Dia', 'Ben']
{'Dia', 'Asha', 'Chen', 'Ben'} False</div>
  <p>Six names, 4 people. A <strong>set</strong> keeps each item once and answers membership in one step using hashing (it computes where the item would be and looks only there; explained in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>). Its printed order is not the insertion order and may vary between runs. <em>New weakness:</em> a set only knows yes/no; it stores no value <em>for</em> each item.</p>
  <h3>Step 4: look up a value by name → dict</h3>
  <div class="fx" data-lang="py">bill = {}
for name, item, qty in orders:
    bill[name] = bill.get(name, 0) + qty * menu[item]   # price looked up by NAME
print(bill, sum(bill.values()))</div>
  <div class="fx" data-lang="text">{'Asha': 65, 'Ben': 85, 'Chen': 20, 'Dia': 60} 230</div>
  <p>A <strong>dict</strong> is a set of keys with a value attached to each: the menu maps item → price, so <code>menu[item]</code> finds a price instantly, and the bills dict maps customer → rupees. Asha: 2 × 20 + 1 × 25 = 65; Ben: 3 × 15 + 2 × 20 = 85; Chen 20; Dia 2 × 30 = 60; total 230. <em>New weakness:</em> we assumed the orders were already tuples. The stall received <em>text</em>.</p>
  <h3>Step 5: the text itself → str</h3>
  <div class="fx" data-lang="py">line = LINES[1]
print(line.split(": "), line[-3:], line.upper())
print(f"{'Ben':&lt;6}owes Rs {bill['Ben']:&gt;4}")</div>
  <div class="fx" data-lang="text">['Ben', '3 samosa ₹45'] ₹45 BEN: 3 SAMOSA ₹45
Ben   owes Rs   85</div>
  <p>A <strong>str</strong> is a sequence too, of characters, so slicing works exactly as on lists (<code>line[-3:]</code> is the amount), and its methods cut text by content (<code>split(": ")</code>). It is immutable like a tuple (<code>upper()</code> returns a new string), and f-strings turn values back into text for the receipt.</p>
  <div class="flow"><span>one value</span><span>list: many, in order</span><span>tuple: fixed record</span><span>set: unique, "is it there?"</span><span>dict: look up by name</span><span>str: text is a sequence too</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A stall that grows: first the owner remembers one order (a variable), then writes a pad of orders (list) on printed slips (tuples), then keeps a register of regulars (set), then paints a price board (dict), and all along reads the orders from text messages (str).</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The chain in one line each. <strong>list</strong>: mutable ordered sequence. <strong>tuple</strong>: immutable ordered sequence. <strong>set</strong>: mutable unordered collection of unique hashable items. <strong>dict</strong>: mutable mapping from unique hashable keys to values, insertion-ordered. <strong>str</strong>: immutable sequence of Unicode characters.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The chain is not "newer is better". Each container gives up something to gain something: a set loses order and duplicates to gain fast membership; a tuple loses changeability to gain safety and hashability. Picking the later container when you need the earlier one's property is as wrong as the reverse.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Four Properties.</b> We know why each exists. To choose quickly we need to see them side by side on the few properties that actually decide the choice.</div>

  <h2 id="pc-props"><span class="num">03</span>Four Properties That Decide Everything</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Five containers, dozens of methods. Is there a small set of yes/no questions that explains which container can do what, and how fast?</p>
  </div>
  <p>Four properties do almost all the work:</p>
  <ul>
    <li><strong>Ordered?</strong> Does it remember a position for each item (index 0, 1, 2 …)?</li>
    <li><strong>Mutable?</strong> Can it change after it is made (add, remove, replace)?</li>
    <li><strong>Hashable?</strong> Can it itself be a dict key or set item? (Only if it can never change.)</li>
    <li><strong>Lookup cost?</strong> How long does "is x in it?" or "find x" take as it grows?</li>
  </ul>
  <p>We can ask Python directly, on tiny samples with a duplicate "Asha":</p>
  <div class="fx" data-lang="py">samples = {"list": ["Asha", "Ben", "Asha"], "tuple": ("Asha", "Ben", "Asha"),
           "set": {"Asha", "Ben", "Asha"}, "dict": {"Asha": 65, "Ben": 85},
           "str": "Asha"}
for kind, obj in samples.items():
    try:
        hash(obj); hashable = "yes"
    except TypeError:
        hashable = "no"
    mutable = "yes" if hasattr(obj, "append") or hasattr(obj, "add") or hasattr(obj, "update") else "no"
    indexable = "yes" if hasattr(obj, "__getitem__") and kind != "dict" else ("by key" if kind == "dict" else "no")
    print(f"{kind:6} len={len(obj)}  mutable={mutable:3}  hashable={hashable:3}  index={indexable}")</div>
  <div class="fx" data-lang="text">list   len=3  mutable=yes  hashable=no   index=yes
tuple  len=3  mutable=no   hashable=yes  index=yes
set    len=2  mutable=yes  hashable=no   index=no
dict   len=2  mutable=yes  hashable=no   index=by key
str    len=4  mutable=no   hashable=yes  index=yes</div>
  <p>How the code decides: <code>hash(obj)</code> succeeds only for hashable objects; having a method like <code>append</code>, <code>add</code> or <code>update</code> means it can change; <code>__getitem__</code> means it supports <code>obj[...]</code>. Note <code>len=2</code> for the set: the duplicate "Asha" was dropped on creation. The full picture:</p>
  <table class="tbl"><caption>The five containers on the four properties</caption>
    <tr><th></th><th>list</th><th>tuple</th><th>set</th><th>dict</th><th>str</th></tr>
    <tr><td>Written</td><td><code>[a, b]</code></td><td><code>(a, b)</code> / <code>a, b</code></td><td><code>{a, b}</code>, <code>set()</code></td><td><code>{k: v}</code>, <code>{}</code></td><td><code>"ab"</code></td></tr>
    <tr><td>Ordered</td><td>yes (positions)</td><td>yes (positions)</td><td>no</td><td>insertion order, no positions</td><td>yes (positions)</td></tr>
    <tr><td>Mutable</td><td>yes</td><td>no</td><td>yes</td><td>yes</td><td>no</td></tr>
    <tr><td>Duplicates</td><td>yes</td><td>yes</td><td>no</td><td>keys no, values yes</td><td>yes</td></tr>
    <tr><td>Hashable itself</td><td>no</td><td>yes, if items are</td><td>no (frozenset: yes)</td><td>no</td><td>yes</td></tr>
    <tr><td>Find / <code>in</code></td><td>O(n) scan</td><td>O(n) scan</td><td>O(1) average</td><td>O(1) by key</td><td>O(n) substring</td></tr>
    <tr><td>Get by position</td><td>O(1)</td><td>O(1)</td><td>—</td><td>— (by key)</td><td>O(1)</td></tr>
    <tr><td>Add</td><td>append O(1)*</td><td>— (new tuple)</td><td>add O(1)</td><td><code>d[k] = v</code> O(1)</td><td>— (new string)</td></tr>
    <tr><td>Chai Corner role</td><td>the morning's orders</td><td>one order</td><td>the customers</td><td>the menu, the bills</td><td>the order texts</td></tr>
  </table>
  <p>* amortised: occasionally the list grows its hidden array, but on average an append is constant time (<a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>, section 03).</p>
  <h3>Lookup cost, measured</h3>
  <p>The biggest practical difference is the last row. Scale the stall up to a chain with 100,000 customer ids and ask "is id 99,999 here?":</p>
  <div class="fx" data-lang="py">import timeit
n = 100_000
ids = list(range(n))
as_list, as_set, as_dict = ids, set(ids), dict.fromkeys(ids, 0)
for label, box in [("list", as_list), ("set", as_set), ("dict", as_dict)]:
    t = timeit.timeit(lambda: (n - 1) in box, number=200) / 200
    print(f"{label:4}: {t * 1e6:8.2f} us per 'in' check")</div>
  <div class="fx" data-lang="text">list:   607.30 us per 'in' check
set :     0.08 us per 'in' check
dict:     0.11 us per 'in' check</div>
  <p>The list checks items one by one (and we asked for the last one, its worst case); set and dict hash the id and look in one slot. The gap is thousands of times, and it grows with the data. Exact times vary by machine; the shape does not.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Finding a student in an unsorted attendance register means reading line by line (list, O(n)). Finding them by roll number in a numbered locker room means walking straight to the locker (set/dict, O(1)).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Big-O</strong> says how work grows with the size n. <strong>O(1)</strong>: the same time at any size. <strong>O(n)</strong>: double the data, double the time. <strong>O(n²)</strong>: double the data, four times the time. <strong>O(log n)</strong>: barely grows (halving a phone book). <strong>Hashable</strong>: has a hash that never changes, and equal objects have equal hashes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The two properties people mix up: <em>ordered</em> is not <em>sorted</em> (a list keeps the order you gave it; it does not sort itself), and a dict's insertion order does not give it positions (<code>menu[0]</code> looks for a key 0 and raises KeyError).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How to Choose.</b> A table of facts is not yet a decision. When a real task lands on your desk, which questions do you ask, in which order?</div>

  <h2 id="pc-choose"><span class="num">04</span>How to Choose</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given a task ("track today's unique visitors", "store a config", "keep the last 10 events"), how do we turn the four properties into one container, quickly and correctly?</p>
  </div>
  <h3>A four-question procedure</h3>
  <ol>
    <li><strong>Do I look things up by a name or id?</strong> Yes → <strong>dict</strong> (name → value). Only need to know if it is present, or need uniqueness? → <strong>set</strong>.</li>
    <li><strong>Is it a fixed bundle of different facts</strong> (a record, a coordinate, a key made of two parts)? → <strong>tuple</strong> (or namedtuple).</li>
    <li><strong>Is it many items of the same kind, in an order that matters, growing or shrinking?</strong> → <strong>list</strong>. Removing from the front a lot? → <code>collections.deque</code>.</li>
    <li><strong>Is it text?</strong> → <strong>str</strong>; cut it with methods or regex, build it with join and f-strings.</li>
  </ol>
  <table class="tbl"><caption>You need … → use</caption>
    <tr><th>You need…</th><th>Use</th><th>Chai Corner example</th></tr>
    <tr><td>Ordered items, index access, duplicates</td><td><code>list</code></td><td>the morning's orders</td></tr>
    <tr><td>Fixed record, dict key, return several values</td><td><code>tuple</code> / <code>namedtuple</code> / dataclass</td><td>(customer, item, qty)</td></tr>
    <tr><td>"Have I seen this?", dedupe, set maths</td><td><code>set</code></td><td>customers; today &amp; yesterday</td></tr>
    <tr><td>Lookup by key, grouping, counting</td><td><code>dict</code>, <code>defaultdict</code>, <code>Counter</code></td><td>menu prices; bills; items sold</td></tr>
    <tr><td>Queue / sliding window (BFS, last-k events)</td><td><code>deque(maxlen=k)</code></td><td>the waiting queue at the counter</td></tr>
    <tr><td>Top-k, priority queue</td><td><code>heapq.nlargest</code> / <code>heappush</code></td><td>three biggest orders of the year</td></tr>
    <tr><td>Search in sorted data</td><td><code>bisect</code> (O(log n))</td><td>price bands</td></tr>
    <tr><td>Text: parse, clean, format</td><td><code>str</code> methods, <code>re</code>, f-strings</td><td>"Asha: 2 masala chai ₹40"</td></tr>
    <tr><td>Millions of numbers, vector maths</td><td>numpy array / pandas</td><td>a year of sales for 500 stalls</td></tr>
  </table>
  <h3>Real data combines them</h3>
  <p>Almost every real structure is a container of containers. The four shapes you will meet most, on our orders:</p>
  <div class="fx" data-lang="py">from collections import Counter, defaultdict
items_by_customer = defaultdict(list)        # dict of lists: grouping
for name, item, qty in orders:
    items_by_customer[name].append(item)
print(dict(items_by_customer))
pairs = {(name, item) for name, item, qty in orders}   # set of tuples: unique combinations
print(len(pairs), ("Ben", "samosa") in pairs)
rows = [{"name": n, "item": i, "qty": q} for n, i, q in orders]   # list of dicts: JSON / DataFrame shape
print(rows[0])
print(Counter(item for name, item, qty in orders).most_common(1))  # Counter: a dict for counting</div>
  <div class="fx" data-lang="text">{'Asha': ['masala chai', 'ginger chai'], 'Ben': ['samosa', 'masala chai'], 'Chen': ['masala chai'], 'Dia': ['bun maska']}
6 True
{'name': 'Asha', 'item': 'masala chai', 'qty': 2}
[('masala chai', 3)]</div>
  <ul>
    <li><strong>List of tuples</strong> (our <code>orders</code>): rows of a table.</li>
    <li><strong>Dict of lists</strong> (<code>defaultdict(list)</code>): grouping, "items per customer".</li>
    <li><strong>Set of tuples</strong>: unique combinations, "which (customer, item) pairs happened": 6 distinct pairs; tuples work because they are hashable, lists would not.</li>
    <li><strong>List of dicts</strong>: the shape of JSON and of <code>pd.DataFrame(rows)</code> (<a class="xref" data-note="da_pandas">Pandas</a>).</li>
    <li><strong>Counter</strong>: a dict that counts. Here it counted <em>orders</em> per item (masala chai appears in 3 orders); <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> weights by qty to get 5 cups.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Choosing a container is like choosing a storage box in a kitchen: a numbered shelf for things used in order, a sealed jar for things that must not change, a labelled drawer for things you fetch by name, a basket where each item appears once.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>right container</strong> is the one whose fast operations are the ones your code does most often, and whose rules (order, mutability, hashability) match the meaning of the data.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The most common interview and production slow-down: a list used for <code>in</code> checks inside a loop makes the loop O(n²). Convert it to a set once, outside the loop, and it becomes O(n) (measured in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>: about 1 s down to about 1 ms).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Order.</b> The map is drawn. Where do we go to learn each container completely, and in which order?</div>

  <h2 id="pc-read"><span class="num">05</span>Reading Order: The Three Notes and After</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each container has far more to it than this map shows: costs, copying rules, hashing, encodings. Which note teaches what, and why in this order?</p>
  </div>
  <h3>1. Lists &amp; Tuples</h3>
  <p><a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> teaches the two ordered containers on the six orders: indexing and slicing traced cut by cut, append/extend/insert/pop and why <code>pop(0)</code> is slow (a list is a dynamic array), comprehensions desugared into loops, sorting with <code>key=</code>, aliasing vs shallow vs deep copy traced with <code>id()</code>, the <code>[[0]*3]*3</code> trap, tuples as records, packing and unpacking, namedtuple, and why a tuple can be a dict key. Read it first: every other container reuses its ideas (sequences, references, mutability).</p>
  <h3>2. Dicts &amp; Sets</h3>
  <p><a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> starts from the lookup problem (scanning a list of prices) and teaches hashing by hand on an 8-slot table, why lookup is O(1) and keys must be hashable, dict create/read/update/delete, get and setdefault (the bills ₹65/85/20/60), iteration order, dict comprehensions, Counter and defaultdict, set operations on today vs yesterday, a measured list-vs-set race, and the traps. It needs "hashable" from note 1.</p>
  <h3>3. Strings</h3>
  <p><a class="xref" data-note="py_strings">Strings</a> treats text as an immutable sequence (slicing as in note 1, hashable like a tuple, used as keys in note 2), then teaches split/strip/join/find/replace, f-strings and format specs, why <code>+</code> in a loop is slow, Unicode and UTF-8 traced byte by byte on "chai ₹", and a light regex introduction. Its hands-on closes the day: raw text lines → list of tuples → dict → set → Counter → receipt, tying the whole group together.</p>
  <h3>After the group</h3>
  <ul>
    <li><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>: what <code>for x in container</code> really does, and how to stream data without building a list.</li>
    <li><a class="xref" data-note="py_oop">OOP</a>: classes, dataclasses, and making your own objects behave like containers (<code>__len__</code>, <code>__getitem__</code>) or keys (<code>__hash__</code>, <code>__eq__</code>).</li>
    <li><a class="xref" data-note="dsa_arrays">DSA: Arrays &amp; Strings</a> and <a class="xref" data-note="dsa_hashing">DSA: Hashing</a>: interview patterns (two pointers, sliding window, two-sum, group anagrams) built directly on lists, strings, dicts and sets.</li>
    <li><a class="xref" data-note="da_pandas">Pandas</a>: a DataFrame is built from a dict of lists or a list of dicts, and uses hash tables in <code>groupby</code> and <code>merge</code>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Learning the containers in this order is like learning a kitchen: first the shelves (positions), then the labelled drawers (lookup by name), then the recipe cards (text), because the drawers are labelled with text and the cards refer to shelves.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Reading order</strong>: py_ds (this map) → py_lists_tuples → py_dicts_sets → py_strings → py_iterators. Each note's first section names what it needs from the one before.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Skipping straight to dicts without lists and tuples leaves "hashable" and "references" as magic words. Skipping strings leaves you unable to get real data into the containers at all.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture and one table to hold the whole group together.</div>

  <h2 id="pc-connect"><span class="num">06</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Five containers, four properties, three notes. Which container is built from which idea, and which answers which of the owner's questions?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 290" width="660">
<defs><marker id="pc-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="8" width="160" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="26" text-anchor="middle" font-size="11.5" font-weight="700">one value</text><text x="330" y="41" text-anchor="middle" class="tm" font-size="10">a name → one object</text>
<line x1="300" y1="48" x2="170" y2="80" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="360" y1="48" x2="490" y2="80" stroke="currentColor" marker-end="url(#pc-a9)"/>
<rect x="40" y="82" width="260" height="44" rx="7" class="fb sb"/><text x="170" y="101" text-anchor="middle" font-size="11.5" font-weight="700">sequence: positions 0 … n−1</text><text x="170" y="117" text-anchor="middle" class="tm" font-size="10">index · slice · in = scan O(n)</text>
<rect x="360" y="82" width="260" height="44" rx="7" class="fb sb"/><text x="490" y="101" text-anchor="middle" font-size="11.5" font-weight="700">hash table: slot from hash(key)</text><text x="490" y="117" text-anchor="middle" class="tm" font-size="10">lookup O(1) · keys must be hashable</text>
<line x1="90" y1="126" x2="70" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="170" y1="126" x2="190" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="250" y1="126" x2="310" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/>
<line x1="450" y1="126" x2="440" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="540" y1="126" x2="570" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/>
<rect x="10" y="162" width="110" height="44" rx="7" class="ft st"/><text x="65" y="181" text-anchor="middle" font-size="11.5" font-weight="700">list</text><text x="65" y="197" text-anchor="middle" class="tm" font-size="10">mutable: orders</text>
<rect x="135" y="162" width="110" height="44" rx="7" class="ft st"/><text x="190" y="181" text-anchor="middle" font-size="11.5" font-weight="700">tuple</text><text x="190" y="197" text-anchor="middle" class="tm" font-size="10">immutable: a record</text>
<rect x="260" y="162" width="110" height="44" rx="7" class="ft st"/><text x="315" y="181" text-anchor="middle" font-size="11.5" font-weight="700">str</text><text x="315" y="197" text-anchor="middle" class="tm" font-size="10">immutable: text</text>
<rect x="385" y="162" width="110" height="44" rx="7" class="fg sg"/><text x="440" y="181" text-anchor="middle" font-size="11.5" font-weight="700">set</text><text x="440" y="197" text-anchor="middle" class="tm" font-size="10">keys only: customers</text>
<rect x="510" y="162" width="130" height="44" rx="7" class="fg sg"/><text x="575" y="181" text-anchor="middle" font-size="11.5" font-weight="700">dict</text><text x="575" y="197" text-anchor="middle" class="tm" font-size="10">key → value: menu</text>
<path d="M190,206 C190,250 420,250 430,208" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pc-a9)"/>
<path d="M315,206 C320,262 560,262 570,208" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pc-a9)"/>
<text x="330" y="282" text-anchor="middle" class="tm" font-size="10.5">immutable tuples and strings are hashable → they become set items and dict keys</text>
</svg><figcaption>Two underlying designs. A sequence stores items by position (list, tuple, str: fast by index, slow to search). A hash table stores items by their hash (set, dict: fast to find, no positions). Immutability is the bridge: only immutable values (tuples, strings) can be hashed, so the left side supplies the keys for the right.</figcaption></figure>
  <table class="tbl"><caption>Every container on one morning at Chai Corner</caption>
    <tr><th>Container</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>list</td><td>sequence + mutable</td><td>many values, in order?</td><td>6 orders; last = Ben, masala chai, 2; 6 chai cups</td><td>collections that grow, order matters</td></tr>
    <tr><td>tuple</td><td>sequence + immutable</td><td>a fixed record?</td><td>("Asha", "masala chai", 2); edit → TypeError</td><td>records, returns, composite keys</td></tr>
    <tr><td>set</td><td>hash table, keys only</td><td>unique? is it there?</td><td>6 names → 4 customers; Esha? False</td><td>dedupe, membership, set maths</td></tr>
    <tr><td>dict</td><td>hash table + values</td><td>value by name?</td><td>samosa 15; bills 65/85/20/60 = 230</td><td>lookup, counting, grouping</td></tr>
    <tr><td>str</td><td>sequence + immutable, of characters</td><td>work with text?</td><td>"Asha: 2 masala chai ₹40" → tuple</td><td>parsing input, printing output</td></tr>
    <tr><td>Combinations</td><td>containers of containers</td><td>real data shapes</td><td>dict of lists; set of 6 tuples; list of dicts</td><td>almost always</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the group: <strong>sequences find by position, hash tables find by value, and immutability decides what may be hashed.</strong> list/tuple/str are the first kind, set/dict the second; tuple and str are the bridge because they cannot change.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The usual ways people pick or use the wrong container.</div>

  <h2 id="pc-traps"><span class="num">07</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which wrong choices cause real bugs or slow code, and how do you recognise each one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: list for membership</span><p><code>if x in big_list</code> inside a loop is O(n²). Build a set once.</p></div>
  <div class="callout trap"><span class="label">Trap: list as a queue</span><p><code>pop(0)</code> shifts every item. Use <code>deque.popleft()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: list of pairs as a lookup table</span><p>Scanning <code>[(item, price), …]</code> for every order is O(n·m). Use a dict.</p></div>
  <div class="callout trap"><span class="label">Trap: expecting a set or dict to have positions</span><p><code>my_set[0]</code> → TypeError; <code>menu[0]</code> → KeyError. Convert with <code>sorted(...)</code> or <code>list(...)</code> if you need positions.</p></div>
  <div class="callout trap"><span class="label">Trap: unhashable keys</span><p>Lists, dicts and sets cannot be dict keys or set items; use tuples, strings, numbers, frozensets.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>{}</code> for an empty set</span><p>It is an empty dict. Use <code>set()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: copying nested containers with .copy()</span><p>Inner lists/dicts are shared. Use <code>copy.deepcopy</code> (Lists &amp; Tuples).</p></div>
  <div class="callout trap"><span class="label">Trap: building text with + in a loop</span><p>O(n²) copying. Collect pieces and <code>"".join</code> them (Strings).</p></div>
  <div class="callout trap"><span class="label">Trap: Python lists for heavy numeric work</span><p>A list of a million floats is a million separate objects. Use numpy or pandas for vector maths.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole group on one page.</div>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole group on one sheet. Running example: Chai Corner, Monday morning. Orders (customer, item, qty): (Asha, masala chai, 2), (Ben, samosa, 3), (Asha, ginger chai, 1), (Chen, masala chai, 1), (Dia, bun maska, 2), (Ben, masala chai, 2). Menu ₹: masala chai 20, ginger chai 25, samosa 15, bun maska 30. Texts like "Asha: 2 masala chai ₹40".</p>
  <h3>The need chain</h3>
  <table class="tbl">
    <tr><th>Container</th><th>Question it answers</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>variable</td><td>store one value?</td><td><code>order1 = "Asha: …"</code></td><td>cannot count/loop many</td></tr>
    <tr><td>list</td><td>many values in order?</td><td>6 orders; 6 chai cups</td><td>records can be edited</td></tr>
    <tr><td>tuple</td><td>a fixed record?</td><td>("Asha", "masala chai", 2)</td><td>"is it there?" needs a scan</td></tr>
    <tr><td>set</td><td>unique, fast membership?</td><td>4 customers; Esha? False</td><td>no value per item</td></tr>
    <tr><td>dict</td><td>value by name?</td><td>samosa 15; bills total ₹230</td><td>data arrives as text</td></tr>
    <tr><td>str</td><td>work with text?</td><td>split → ("Ben", "samosa", 3)</td><td>→ choose and combine</td></tr>
  </table>
  <h3>The four properties</h3>
  <table class="tbl">
    <tr><th></th><th>list</th><th>tuple</th><th>set</th><th>dict</th><th>str</th></tr>
    <tr><td>Ordered</td><td>yes</td><td>yes</td><td>no</td><td>insertion</td><td>yes</td></tr>
    <tr><td>Mutable</td><td>yes</td><td>no</td><td>yes</td><td>yes</td><td>no</td></tr>
    <tr><td>Hashable</td><td>no</td><td>yes*</td><td>no</td><td>no</td><td>yes</td></tr>
    <tr><td><code>in</code> / find</td><td>O(n)</td><td>O(n)</td><td>O(1)</td><td>O(1) key</td><td>O(n)</td></tr>
  </table>
  <p>* if every item is hashable. Big-O: O(1) same time at any size; O(n) grows with size; O(n²) four times the time for twice the data.</p>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>list</b><p>Ordered items that grow or shrink; index, sort, slice.</p><small>Not for membership tests or front removals</small></div>
    <div><b>tuple</b><p>Fixed records, multiple return values, composite dict keys.</p><small>Not for collections that change</small></div>
    <div><b>set</b><p>Uniqueness, "is it there?", comparing groups.</p><small>Not when order, duplicates or counts matter</small></div>
    <div><b>dict</b><p>Lookup by key, counting (Counter), grouping (defaultdict).</p><small>Keys must be hashable</small></div>
    <div><b>str</b><p>All text: parse with methods/regex, build with join and f-strings.</p><small>Name the encoding at file boundaries</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>List membership in a loop (O(n²)); list as a queue; list of pairs as a lookup table; positions on sets/dicts; unhashable keys; <code>{}</code> is a dict; shallow copies of nested data; + on strings in loops; lists for heavy numeric work.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Store "who came today" so that "did Esha come?" is instant?</td><td>A set</td></tr>
    <tr><td>Why can <code>("Ben", "samosa")</code> be a dict key but not <code>["Ben", "samosa"]</code>?</td><td>Tuples are immutable, so hashable; lists can change, so are not</td></tr>
    <tr><td>Ben's bill: 3 samosa + 2 masala chai?</td><td>3 × 15 + 2 × 20 = ₹85</td></tr>
    <tr><td>Which containers support <code>x[0]</code> by position?</td><td>list, tuple, str (not set, not dict)</td></tr>
    <tr><td>Reading order of the group?</td><td>This map → Lists &amp; Tuples → Dicts &amp; Sets → Strings → Iterators</td></tr>
  </table>

  <h2 id="pc-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Name Python's built-in containers and one job each.</summary><div class="qa-body">list: many items in order, changeable (the orders). tuple: a fixed record (one order). set: unique items, fast "is it there?" (customers). dict: value by key (menu prices, bills). str: text (the order messages).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List vs tuple: what is the real trade-off?</summary><div class="qa-body">List: mutable, can grow, not hashable. Tuple: fixed, a little smaller and faster, hashable when its items are, so it can be a dict key or set item. Use a tuple for fixed records and as a promise that nobody changes the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>x in set</code> fast but <code>x in list</code> slow?</summary><div class="qa-body">A list compares items one by one: O(n). A set is a hash table: <code>hash(x)</code> picks the slot directly, then one equality check confirms: O(1) on average. On 100,000 ids the measured gap is thousands of times.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which container for: (a) the last 10 log events, (b) word counts, (c) a config loaded from JSON, (d) users in both A and B, (e) an (x, y) point used as a key?</summary><div class="qa-body">(a) <code>deque(maxlen=10)</code>; (b) <code>Counter</code>; (c) dict (nested dicts and lists); (d) set intersection <code>a &amp; b</code>; (e) tuple.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a dict ordered? Is a set?</summary><div class="qa-body">A dict keeps insertion order (guaranteed since Python 3.7), but has no positions: you cannot ask for "item 0". A set has no reliable order at all; for strings the printed order can change between runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the set come after the tuple in the need chain?</summary><div class="qa-body">The tuple fixed records, but answering "has Esha come?" with a list of tuples still needs a scan of every order. The set answers it in one step, and it can only do so because its items are hashable, the property the tuple (immutable) introduced. Immutability is what makes hashing possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what is a dict, in terms of a set?</summary><div class="qa-body">A set of unique hashable keys, with a value attached to each key. Same hash table, same O(1) lookup, same key rules. That is why Dicts &amp; Sets is one note, and why "is it there?" (set) leads straight to "what is its value?" (dict).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is str taught after the others when it is used everywhere?</summary><div class="qa-body">Because it reuses all of them: slicing comes from lists, immutability and hashability from tuples, and its job (parsing text) is to produce the tuples, dicts and sets of the earlier notes. Seeing the containers first makes clear what the parsed text should become.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the four properties and pick containers by habit?</summary><div class="qa-body">You get code that is correct on 6 orders and unusable on 6 million: list membership in loops (O(n²)), list queues (O(n) per pop), lookup tables as lists of pairs, unhashable keys crashing, and order assumptions on sets failing between runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you leave the built-in containers for numpy/pandas?</summary><div class="qa-body">For large numeric data and column operations (sums, means, joins over millions of rows). A Python list stores a reference to a separate object per number; a numpy array stores raw numbers side by side and works on them in C. pandas DataFrames are built from the same dicts and lists (<a class="xref" data-note="da_pandas">Pandas</a>).</div></details>
</main>
`
});
