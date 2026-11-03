// notes/python/py_lists_tuples.js — Lists & Tuples
Object.assign(TOPIC_CONTENT, {
  "py_lists_tuples": `<main>
<h1>Lists &amp; Tuples</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Lists &amp; Tuples</span></div>
  <p class="lead">Almost every real program has to keep many values together: the rows read from a file, the jobs waiting to run, the scores from an experiment. Python's two basic tools for this are the <strong>list</strong>, an ordered collection you can change, and the <strong>tuple</strong>, an ordered collection that is fixed once made. They look almost the same on the page, but they are built for different jobs, and knowing what a list really is inside (a row of references with spare room at the end) explains why some list operations are instant while others are slow, why a "copy" can still change the original, and why a tuple can be a dictionary key while a list cannot. Throughout this page we follow one small example: a chai stall recording its morning orders, where each order is a customer, an item and a quantity. Every new idea is added to the same handful of orders, so you can always check the results by hand.</p>

  <h2 id="plt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Lists &amp; Tuples</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Lists</div>
        <ul>
          <li>Ordered, changeable, duplicates allowed</li>
          <li>Hold references to objects, not copies</li>
          <li>Index from 0, <code>-1</code> is the last; slices exclude the stop</li>
          <li>Inside: a dynamic array with spare room</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Costs</div>
        <ul>
          <li>Index, <code>append</code>, <code>pop()</code>: O(1)</li>
          <li><code>insert(0)</code>, <code>pop(0)</code>, <code>in</code>, <code>remove</code>: O(n)</li>
          <li>Queue from the front → <code>deque</code></li>
          <li><code>sort</code>: O(n log n), stable</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Copies</div>
        <ul>
          <li><code>b = a</code> is an alias, not a copy</li>
          <li><code>a.copy()</code> is shallow: inner objects shared</li>
          <li><code>copy.deepcopy(a)</code> copies every level</li>
          <li><code>[[0]*3]*3</code> repeats one row</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tuples</div>
        <ul>
          <li>Fixed record; the comma makes it: <code>(5,)</code></li>
          <li>Unpacking: <code>name, item, qty = order</code></li>
          <li><code>namedtuple</code> adds field names</li>
          <li>Hashable if its items are → dict key</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="plt-list"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Lists</span><span class="rm-sub">keeping many values in order under one name</span></div></div>
      <div class="rm-item rm-done" data-target="plt-slice"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Indexing and Slicing</span><span class="rm-sub">reading one item or a stretch of items</span></div></div>
      <div class="rm-item rm-done" data-target="plt-grow"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Changing a List</span><span class="rm-sub">append, extend, insert, pop, remove</span></div></div>
      <div class="rm-item rm-done" data-target="plt-inside"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">How a List Works Inside</span><span class="rm-sub">why some operations are instant and others slow</span></div></div>
      <div class="rm-item rm-done" data-target="plt-comp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">List Comprehensions</span><span class="rm-sub">building a new list in one line</span></div></div>
      <div class="rm-item rm-done" data-target="plt-sort"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Sorting</span><span class="rm-sub">sorted, sort, key functions, stability</span></div></div>
      <div class="rm-item rm-done" data-target="plt-copy"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Aliasing and Copying</span><span class="rm-sub">when a "copy" still changes the original</span></div></div>
      <div class="rm-item rm-done" data-target="plt-tuple"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Tuples</span><span class="rm-sub">fixed records that cannot change</span></div></div>
      <div class="rm-item rm-done" data-target="plt-unpack"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Packing and Unpacking</span><span class="rm-sub">splitting a sequence into names</span></div></div>
      <div class="rm-item rm-done" data-target="plt-named"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">namedtuple</span><span class="rm-sub">tuples with field names</span></div></div>
      <div class="rm-item rm-done" data-target="plt-hash"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Hashability</span><span class="rm-sub">why a tuple can be a dict key and a list cannot</span></div></div>
      <div class="rm-item rm-done" data-target="plt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">None returns, shared defaults, removing while looping</span></div></div>
      <div class="rm-item rm-done" data-target="plt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, costs, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="plt-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on lists and tuples</span></div></div>
    </div>
  </div>

  <h2 id="plt-list"><span class="num">01</span>Lists</h2>
  <p>Suppose the chai stall wants to record its morning orders. With only plain variables you would write <code>order1 = ...</code>, <code>order2 = ...</code>, <code>order3 = ...</code> and so on. That falls apart immediately. You cannot ask "how many orders were there?", you cannot loop over them, you cannot sort them, and when the seventh customer arrives you have to invent a new variable name in the middle of the program. What we need is a single value that holds any number of other values in a fixed order.</p>
  <p>That value is a <strong>list</strong>: an ordered collection of values that can grow, shrink and change after it is created. You write a list with square brackets and commas. Think of a numbered row of pigeonholes in a post room. Each pigeonhole has a number painted on it, starting from 0, and you can put something in, take something out, or add more pigeonholes at the end. Here are the stall's six orders. Each order is itself a small group of three values, (customer, item, quantity), written in round brackets; that is a tuple, which we study properly later. For now just read it as "one order".</p>
  <div class="fx" data-lang="py"># one tuple per order: (customer, item, qty)
orders = [
    ("Asha", "masala chai", 2),
    ("Ben",  "samosa",      3),
    ("Asha", "ginger chai", 1),
    ("Chen", "masala chai", 1),
    ("Dia",  "bun maska",   2),
    ("Ben",  "masala chai", 2),
]
print(len(orders))                       # how many items
print(orders[0])                         # the first item
print(type(orders), type(orders[0]))
mixed = [1, "chai", 2.5, None, [3, 4]]   # any types, even another list
print(len(mixed), mixed[-1])</div>
  <div class="fx" data-lang="text">6
('Asha', 'masala chai', 2)
&lt;class 'list'&gt; &lt;class 'tuple'&gt;
5 [3, 4]</div>
  <p><code>len(orders)</code> is 6 because the list holds six items. <code>orders[0]</code> is the first item, the whole of Asha's order. The outer container is a <code>list</code> and each item inside is a <code>tuple</code>. The last two lines show that a list does not care what you put in it: numbers, strings, <code>None</code> and even another list can sit side by side. Notice also that Asha and Ben each appear twice in <code>orders</code>; lists allow duplicates, because they simply record whatever you put in, in the order you put it.</p>
  <p>There is one fact about lists that explains most of what follows on this page, so it is worth understanding now. A list does not contain its items the way a box contains objects. It contains <strong>references</strong>, which are pointers to objects stored elsewhere in memory. You may remember from <a class="xref" data-note="py_fundamentals">Python Fundamentals</a> that a variable name is like a label tied to an object. A list is a row of such labels. Slot 0 of <code>orders</code> does not hold a private copy of Asha's order; it points at the one tuple object that represents it. We can prove this with the <code>is</code> operator, which asks "are these the very same object?":</p>
  <div class="fx" data-lang="py">a = orders[0]
print(a is orders[0])            # same object, not a copy
print(id(a) == id(orders[0]))    # same identity number</div>
  <div class="fx" data-lang="text">True
True</div>
  <p>Both lines print <code>True</code>. Giving the first order a second name with <code>a = orders[0]</code> copied nothing; <code>a</code> and slot 0 of the list now point at the same object, and <code>id()</code>, which returns an object's identity number, confirms it. As long as the items are things that cannot change, such as strings and tuples, this makes no visible difference. When the items can change, such as lists inside a list, it is the source of the copying surprises in the Aliasing section.</p>
  <p>One small habit to form early: never name a variable <code>list</code>. The name <code>list</code> belongs to Python's built-in list type, and <code>list = [1, 2]</code> hides it, so a later <code>list("abc")</code> fails with "'list' object is not callable". The same goes for <code>str</code>, <code>dict</code> and <code>tuple</code>.</p>

  <h2 id="plt-slice"><span class="num">02</span>Indexing and Slicing</h2>
  <p>Having the orders in a list is only useful if we can get them back out. Python gives two ways to read from a list: <strong>indexing</strong> reads one item by its position, and <strong>slicing</strong> reads a stretch of items and gives them back as a new list. Both work identically on every kind of sequence in Python, including tuples, strings and ranges, so learning them once pays off everywhere. To keep the traces short we use just the column of customer names, <code>names = ["Asha", "Ben", "Asha", "Chen", "Dia", "Ben"]</code>.</p>
  <p>Each slot has a position number called its <strong>index</strong>. Counting starts at 0, not 1, because the index means "how many steps from the start": the first item is zero steps away. Python also allows <strong>negative indexes</strong>, which count from the end: <code>-1</code> is the last item, <code>-2</code> the one before it. Under the hood Python simply turns <code>names[-k]</code> into <code>names[len(names) - k]</code>, so with six names, <code>names[-2]</code> is <code>names[4]</code>.</p>
  <table class="tbl">
    <tr><th>item</th><td>Asha</td><td>Ben</td><td>Asha</td><td>Chen</td><td>Dia</td><td>Ben</td></tr>
    <tr><th>index</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><th>negative</th><td>−6</td><td>−5</td><td>−4</td><td>−3</td><td>−2</td><td>−1</td></tr>
  </table>
  <div class="fx" data-lang="py">names = ["Asha", "Ben", "Asha", "Chen", "Dia", "Ben"]
print(names[0], names[3], names[5])
print(names[-1], names[-2], names[-6])
try:
    names[6]
except IndexError as e:
    print("IndexError:", e)</div>
  <div class="fx" data-lang="text">Asha Chen Ben
Ben Dia Asha
IndexError: list index out of range</div>
  <p>Check each value against the table: <code>names[3]</code> is the fourth name, Chen; <code>names[-1]</code> is position 6 − 1 = 5, Ben; <code>names[-6]</code> is position 0, Asha. There is no position 6 (the last is 5), so asking for it raises <code>IndexError</code>. An index must point at a real slot.</p>
  <p>Often you want more than one item: the first three orders, the last two, every second one. A <strong>slice</strong>, written <code>names[start:stop]</code>, gives a new list containing the items from <code>start</code> up to but not including <code>stop</code>. The "not including" part trips everyone up at first, and the easiest way to make it feel natural is to stop thinking of the numbers as items and start thinking of them as the cuts between items. Picture a loaf of bread with knife marks numbered 0 to 6 along it. "Cut at 1 and at 4" hands you the three slices in between. The diagram shows the same thing for our names.</p>
  <figure class="viz"><svg viewBox="0 0 470 130" width="470">
    <text x="10" y="16" class="tm">names</text>
    <rect x="40" y="40" width="60" height="34" class="fs" stroke="currentColor"/><rect x="100" y="40" width="60" height="34" class="fb sb"/><rect x="160" y="40" width="60" height="34" class="fb sb"/><rect x="220" y="40" width="60" height="34" class="fb sb"/><rect x="280" y="40" width="60" height="34" class="fs" stroke="currentColor"/><rect x="340" y="40" width="60" height="34" class="fs" stroke="currentColor"/>
    <text x="54" y="62">Asha</text><text x="117" y="62">Ben</text><text x="174" y="62">Asha</text><text x="233" y="62">Chen</text><text x="297" y="62">Dia</text><text x="357" y="62">Ben</text>
    <text x="36" y="34" class="tm">0</text><text x="96" y="34" class="tb">1</text><text x="156" y="34" class="tm">2</text><text x="216" y="34" class="tm">3</text><text x="276" y="34" class="tb">4</text><text x="336" y="34" class="tm">5</text><text x="396" y="34" class="tm">6</text>
    <text x="30" y="92" class="tm">−6</text><text x="90" y="92" class="tm">−5</text><text x="150" y="92" class="tm">−4</text><text x="210" y="92" class="tm">−3</text><text x="270" y="92" class="tm">−2</text><text x="330" y="92" class="tm">−1</text>
    <text x="80" y="118" class="tb">names[1:4] → ['Ben', 'Asha', 'Chen']   (between cuts 1 and 4)</text>
  </svg><figcaption>Indexes as cuts between items. A slice takes everything between two cuts, so the stop item is never included and stop − start is the length.</figcaption></figure>
  <p>The numbers along the top of the diagram sit on the boundaries between boxes. <code>names[1:4]</code> takes everything between boundary 1 and boundary 4, which is the three shaded boxes: Ben, Asha, Chen. Seen this way, two useful facts fall out for free: the length of a slice is simply <code>stop − start</code>, and <code>names[:4]</code> plus <code>names[4:]</code> always rebuild the whole list with nothing lost or repeated.</p>
  <p>A slice can take a third number, the <strong>step</strong>, which says how far to jump each time: <code>[::2]</code> takes every second item, and a negative step walks backwards through the list. When a number is left out, Python fills in the natural default: from the very start, to the very end (in whichever direction you are walking). Try predicting each line before reading the output.</p>
  <div class="fx" data-lang="py">names = ["Asha", "Ben", "Asha", "Chen", "Dia", "Ben"]
print(names[1:4])     # cuts 1 and 4 -&gt; items 1, 2, 3
print(names[:2])      # from the start to cut 2
print(names[-2:])     # the last two
print(names[::2])     # every second item: 0, 2, 4
print(names[::-1])    # backwards: the whole list reversed
print(names[4:1:-1])  # backwards from 4, stopping before 1: 4, 3, 2
print(names[10:])     # past the end: empty, no error</div>
  <div class="fx" data-lang="text">['Ben', 'Asha', 'Chen']
['Asha', 'Ben']
['Dia', 'Ben']
['Asha', 'Asha', 'Dia']
['Ben', 'Dia', 'Chen', 'Asha', 'Ben', 'Asha']
['Dia', 'Chen', 'Asha']
[]</div>
  <p>Each result follows from the cut picture. <code>[-2:]</code> starts at cut −2 (which is 4) and runs to the end, giving Dia and Ben. <code>[::-1]</code> walks backwards over everything, the standard way to reverse a sequence. <code>[4:1:-1]</code> starts at item 4 and steps backwards, stopping before item 1, so it takes items 4, 3 and 2. The last line shows an important difference between indexing and slicing: <code>names[6]</code> raised an error a moment ago, but <code>names[10:]</code> quietly returns an empty list. Python clamps a slice to the ends of the list instead of complaining, which is convenient, but it also means a wrong slice bound gives you a silently short list rather than an error.</p>
  <p>Slices can also appear on the left of <code>=</code>. <strong>Slice assignment</strong> replaces a stretch of the list with the items on the right, and the two do not need to be the same length, so the list can grow or shrink in the middle. Here it is on a list of quantities:</p>
  <div class="fx" data-lang="py">q = [2, 3, 1, 1, 2, 2]       # quantities of the six orders
q[1:3] = [30, 10, 99]        # replace 2 items with 3: the list grows
print(q, len(q))
q[1:4] = []                  # replace 3 items with none: they vanish
print(q, len(q))</div>
  <div class="fx" data-lang="text">[2, 30, 10, 99, 1, 2, 2] 7
[2, 1, 2, 2] 4</div>
  <p><code>q[1:3]</code> was the two items 3 and 1; they were replaced by three new items, so the length went from 6 to 7. Then <code>q[1:4]</code>, the three items 30, 10 and 99, was replaced by nothing, so the length dropped to 4. You will not use this every day, but it shows clearly that a slice is a stretch between two cuts, whatever side of the <code>=</code> it is on.</p>

  <h2 id="plt-grow"><span class="num">03</span>Changing a List</h2>
  <p>A list is useful precisely because it can change: new customers join the queue, served customers leave it. Lists change through their <strong>methods</strong>, functions that belong to the list and are called with a dot, like <code>queue.append("Chen")</code>. Each method changes the list it is called on, which is called changing it <strong>in place</strong>. Let us follow a queue at the counter, starting with two people.</p>
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
  <p>Read the output line by line. <code>append("Chen")</code> added Chen at the end. <code>extend(["Dia", "Esha"])</code> added both names, one after the other. <code>insert(0, "Faiz")</code> put Faiz at the front, and everyone else moved one place to the right to make room. <code>pop()</code> with no argument removed and returned the last person, Esha, while <code>pop(0)</code> removed and returned the first, Faiz, and everyone moved one place left to close the gap. <code>remove("Ben")</code> works by value rather than position: it searches for the first "Ben" and deletes it. Finally, <code>index("Dia")</code> searches for a value and returns its position (2), and <code>count</code> counts how many times a value appears (Asha appears twice in <code>names</code>). To delete by position without getting the item back, there is also the statement <code>del queue[i]</code>, which works on slices too: <code>del queue[1:3]</code>.</p>
  <p>The difference between <code>append</code> and <code>extend</code> deserves a closer look, because mixing them up is a common bug. <code>append</code> always adds exactly one item, whatever that item is. <code>extend</code> takes a collection and adds each of its items separately.</p>
  <div class="fx" data-lang="py">a = ["Asha"]; a.append(["Ben", "Chen"])
b = ["Asha"]; b.extend(["Ben", "Chen"])
c = ["Asha"]; c.extend("Ben")          # a string is a sequence of letters!
print(a, len(a))
print(b, len(b))
print(c)</div>
  <div class="fx" data-lang="text">['Asha', ['Ben', 'Chen']] 2
['Asha', 'Ben', 'Chen'] 3
['Asha', 'B', 'e', 'n']</div>
  <p><code>append</code> added the list <code>["Ben", "Chen"]</code> as a single item, so <code>a</code> now has a list inside it and a length of 2. <code>extend</code> looped over the list and added each name, so <code>b</code> has length 3. The third line is the surprise: a string is itself a sequence of characters, so <code>extend("Ben")</code> adds the letters B, e and n one by one. Think of <code>append</code> as "put this parcel on the shelf" and <code>extend</code> as "unpack this parcel and put each thing on the shelf". The <code>+=</code> operator on a list behaves like <code>extend</code>.</p>
  <p>One more rule about these methods catches nearly every beginner once. Methods that change a list in place, namely <code>append</code>, <code>extend</code>, <code>insert</code>, <code>remove</code>, <code>sort</code> and <code>reverse</code>, return <code>None</code> rather than the list. This is deliberate: it signals that no new list was made, the old one was changed. The consequence is that you must never assign their result back.</p>
  <div class="fx" data-lang="py">q = [2, 3, 1, 1, 2, 2]
result = q.append(5)
print(result, q)
q = q.sort()          # the classic bug: sort() returns None
print(q)</div>
  <div class="fx" data-lang="text">None [2, 3, 1, 1, 2, 2, 5]
None</div>
  <p><code>q.append(5)</code> did add 5 to the list, but its return value, stored in <code>result</code>, is <code>None</code>. On the next line, <code>q.sort()</code> sorts the list correctly and returns <code>None</code>, and then <code>q = ...</code> throws the sorted list away by making <code>q</code> point at <code>None</code>. The fix is to write <code>q.sort()</code> on its own line, or to use <code>q = sorted(q)</code>, which returns a new list (more on that in the Sorting section). <code>pop</code> is the exception among the changing methods: it does return something, the item it removed.</p>

  <h2 id="plt-inside"><span class="num">04</span>How a List Works Inside</h2>
  <p>All the methods in the last section give correct results, but they do not all cost the same. Some take the same tiny amount of time whether the list holds ten items or ten million; others get slower in proportion to the list's length. If you use the slow ones inside a loop, a program that should take a second can take an hour. To see which is which, we need to know how a list is laid out in memory.</p>
  <p>Inside CPython (the standard Python interpreter), a list is a <strong>dynamic array</strong>: one continuous block of memory holding the references side by side, plus some spare empty slots at the end for future growth. Because the slots are side by side and all the same size, Python can find slot <code>i</code> by simple arithmetic, "start of the block plus <code>i</code> slots", without looking at any other slot. That layout decides every cost. Reading or replacing <code>q[i]</code> is a single jump, so it takes constant time, written <strong>O(1)</strong> in Big-O notation (the notation describes how the work grows as the list gets longer; O(1) means it does not grow at all). Adding or removing at the end uses or frees the next spare slot, also O(1). But inserting or removing at the front means every other reference must move one slot to keep the row continuous, so with n items that is n moves, written <strong>O(n)</strong>. Searching by value, as <code>in</code>, <code>index</code> and <code>remove</code> do, has to compare items one by one until it finds a match, which is also O(n).</p>
  <p>Picture a bench in front of the stall. Someone joining at the right-hand end just sits down. Someone joining at the left-hand end makes everybody shuffle one seat to the right. And when the bench is full, the owner fetches a longer bench and everyone moves across once. That last part is what happens when a list runs out of spare slots: Python allocates a bigger block, copies the references over and frees the old block. We can watch it happen with <code>sys.getsizeof</code>, which reports how many bytes the list object itself uses (on a 64-bit machine, 56 bytes of bookkeeping plus 8 bytes per slot):</p>
  <div class="fx" data-lang="py">import sys
lst = []
prev = sys.getsizeof(lst)
print(f"len  0: {prev} bytes")
for i in range(1, 18):
    lst.append(i)
    size = sys.getsizeof(lst)
    if size != prev:                   # print only when the array grew
        print(f"len {i:2}: {size} bytes  (room for {(size - 56) // 8} references)")
        prev = size</div>
  <div class="fx" data-lang="text">len  0: 56 bytes
len  1: 88 bytes  (room for 4 references)
len  5: 120 bytes  (room for 8 references)
len  9: 184 bytes  (room for 16 references)
len 17: 248 bytes  (room for 24 references)</div>
  <p>The empty list is 56 bytes with no slots. The first append made room for 4 references at once, so appends 2, 3 and 4 cost nothing extra. The fifth append found the block full and grew it to 8 slots, the ninth grew it to 16, and the seventeenth to 24. Each time the block grows, Python makes it larger in proportion to its current size, so the expensive copies become rarer and rarer as the list grows. Spread over all the appends, the copying works out to a constant amount per append. This is called <strong>amortised O(1)</strong>: an operation that is occasionally expensive, but whose total cost over n calls is proportional to n, so it averages out to constant time per call.</p>
  <p>Now the slow case. A real queue at a counter serves people from the front, so the obvious list code is <code>queue.pop(0)</code>. On a list, every <code>pop(0)</code> shifts all the remaining references one place left. The standard library's <code>collections.deque</code> (a "double-ended queue", pronounced "deck") is built so that both ends are cheap. Let us drain a queue of 100,000 customers both ways:</p>
  <div class="fx" data-lang="py">from collections import deque
import timeit
n = 100_000
def drain_list():
    q = list(range(n))
    while q:
        q.pop(0)          # shifts every remaining item: O(n) each time
def drain_deque():
    q = deque(range(n))
    while q:
        q.popleft()       # O(1): a deque is built for both ends
print(f"list.pop(0):     {timeit.timeit(drain_list, number=1):.2f} s")
print(f"deque.popleft(): {timeit.timeit(drain_deque, number=1):.3f} s")</div>
  <div class="fx" data-lang="text">list.pop(0):     0.77 s
deque.popleft(): 0.004 s</div>
  <p>Both functions do the same job, yet the list version is on the order of a hundred times slower (the exact times are approximate and depend on the machine; the ratio is the point). The reason is the arithmetic of shifting: n removals, each moving up to n references, is about n × n operations in total, written O(n²), while the deque does a constant amount of work per removal, O(n) in total. The deque is covered properly in <a class="xref" data-note="py_ds">Choosing a Collection</a>. The table summarises the costs; you will use it constantly, for example in <a class="xref" data-note="dsa_arrays">Arrays &amp; Two Pointers</a>.</p>
  <table class="tbl">
    <tr><th>operation</th><th>cost</th><th>why</th></tr>
    <tr><td><code>q[i]</code>, <code>q[i] = x</code>, <code>len(q)</code></td><td>O(1)</td><td>jump by offset; the length is stored</td></tr>
    <tr><td><code>append(x)</code>, <code>pop()</code></td><td>O(1) amortised</td><td>uses the end of the array; rare resize</td></tr>
    <tr><td><code>insert(i, x)</code>, <code>pop(i)</code>, <code>del q[i]</code></td><td>O(n − i)</td><td>everything after i shifts</td></tr>
    <tr><td><code>x in q</code>, <code>index</code>, <code>remove</code>, <code>count</code></td><td>O(n)</td><td>compares items one by one</td></tr>
    <tr><td><code>extend</code> or slice of k items</td><td>O(k)</td><td>copies k references</td></tr>
    <tr><td><code>sort()</code>, <code>sorted()</code></td><td>O(n log n)</td><td>Timsort</td></tr>
  </table>
  <p>Two lessons follow. If you need to add and remove at the front, use a <code>deque</code>. And if you repeatedly ask "is x in this collection?", a list makes each question O(n); a set answers in constant time, as <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> explains.</p>

  <h2 id="plt-comp"><span class="num">05</span>List Comprehensions</h2>
  <p>A very common job is to build a new list from an existing one: the quantities of all the chai orders, every customer's name in capitals, only the large orders. The plain way is a four-line pattern: make an empty list, loop, test, append. It works, but the actual idea ("the quantity of each chai order") is buried in the scaffolding. Here it is beside the shorter form Python offers:</p>
  <div class="fx" data-lang="py">cups = []
for name, item, qty in orders:
    if "chai" in item:
        cups.append(qty)
print(cups, sum(cups))
print([qty for name, item, qty in orders if "chai" in item])</div>
  <div class="fx" data-lang="text">[2, 1, 1, 2] 6
[2, 1, 1, 2]</div>
  <p>Both lines print [2, 1, 1, 2]: orders 0, 2, 3 and 5 are chai, and their quantities add up to 6 cups. The second line is a <strong>list comprehension</strong>, an expression that builds a new list by running a loop (and optionally a test) inside square brackets. It is not a different mechanism; it is a compact spelling of exactly the loop above it. Read it left to right as a sentence: "qty, for each (name, item, qty) in orders, if 'chai' is in the item". The expression at the front is what gets appended each time, the <code>for</code> part is the same loop header, and the <code>if</code> part is the same test. It is like telling a helper "write down the quantity of every chai order" in one sentence, instead of dictating "take a blank page; for each line on the pad; if it says chai; write down its quantity".</p>
  <p>Comprehensions come in a few shapes, and the position of the <code>if</code> matters. An <code>if</code> at the end decides <em>whether</em> an item goes in at all. An <code>if ... else</code> at the front decides <em>what</em> goes in, and then every item produces something. Two <code>for</code> clauses act like nested loops, outer one first.</p>
  <div class="fx" data-lang="py">print([name.upper() for name, item, qty in orders])                     # transform
print([name for name, item, qty in orders if qty &gt;= 2])                 # filter: if at the END
print(["big" if qty &gt;= 2 else "small" for name, item, qty in orders])   # choose: if/else at the FRONT
by_hour = [[("Asha", 2), ("Ben", 3)], [("Asha", 1)], [("Chen", 1), ("Dia", 2), ("Ben", 2)]]
print([qty for hour in by_hour for name, qty in hour])                  # nested: outer loop first
print(sum(qty for name, item, qty in orders))                           # generator: no list built</div>
  <div class="fx" data-lang="text">['ASHA', 'BEN', 'ASHA', 'CHEN', 'DIA', 'BEN']
['Asha', 'Ben', 'Dia', 'Ben']
['big', 'big', 'small', 'small', 'big', 'big']
[2, 3, 1, 1, 2, 2]
11</div>
  <p>The first line transforms every name. The second keeps only orders with a quantity of at least 2, so Asha, Ben, Dia and Ben survive. The third produces a label for every order, "big" or "small". In the fourth, <code>by_hour</code> is a list of lists (orders grouped by hour), and the two <code>for</code> clauses read exactly like nested loops: "for each hour, for each (name, qty) in that hour", which flattens the groups into one list of six quantities. The last line uses round brackets instead of square ones (the brackets of the <code>sum( )</code> call), which makes a <strong>generator expression</strong>: it produces the values one at a time for <code>sum</code> to add up, without ever building a list in memory. The total is 11 items sold. Generators are explained in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, and the same comprehension syntax with curly brackets builds sets and dicts, covered in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>.</p>
  <p>Comprehensions are also slightly faster than the equivalent loop, because they skip looking up and calling <code>out.append</code> on every item:</p>
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
best = lambda f: min(timeit.repeat(f, number=20, repeat=5)) / 20 * 1000   # best of 5 runs, in ms
print(f"loop + append: {best(with_loop):.2f} ms")
print(f"comprehension: {best(with_comp):.2f} ms")</div>
  <div class="fx" data-lang="text">True
loop + append: 3.77 ms
comprehension: 3.39 ms</div>
  <p>Both build the same list, and the comprehension is somewhat quicker (each time is the best of five runs, and the numbers are approximate). The speed is a bonus, not the main reason to use one; the main reason is that it states the intent directly. Two limits keep comprehensions readable. Do not use one just for its side effects: <code>[print(x) for x in xs]</code> builds a useless list of <code>None</code> values, so write a normal loop. And once a comprehension needs more than two <code>for</code> clauses or a long condition, a plain loop or a small function is easier to follow. One last detail: the loop variable inside a comprehension belongs only to the comprehension, so unlike a <code>for</code> loop's variable it does not leak out and overwrite a variable of the same name.</p>

  <h2 id="plt-sort"><span class="num">06</span>Sorting</h2>
  <p>Sooner or later every list needs to be put in order: biggest orders first, names alphabetically, items by price. Python offers two ways to sort, and the difference between them is the same "new object versus in place" idea we met with the list methods. The built-in function <code>sorted()</code> takes any collection and returns a <em>new</em> sorted list, leaving the original alone. The method <code>list.sort()</code> rearranges the list itself and returns <code>None</code>.</p>
  <div class="fx" data-lang="py">q = [2, 3, 1, 1, 2, 2]
s = sorted(q)                 # NEW sorted list, q untouched
print(s, q)
q.sort(reverse=True)          # sorts q IN PLACE, returns None
print(q)
menu_items = ["chai", "Samosa", "bun maska", "Vada pav"]
print(sorted(menu_items))                  # capitals sort BEFORE lowercase
print(sorted(menu_items, key=str.lower))   # compare lowercased versions instead</div>
  <div class="fx" data-lang="text">[1, 1, 2, 2, 2, 3] [2, 3, 1, 1, 2, 2]
[3, 2, 2, 2, 1, 1]
['Samosa', 'Vada pav', 'bun maska', 'chai']
['bun maska', 'chai', 'Samosa', 'Vada pav']</div>
  <p><code>sorted(q)</code> gave a new list while <code>q</code> kept its original order; then <code>q.sort(reverse=True)</code> rearranged <code>q</code> itself, largest first. The menu lines show a surprise. Strings are compared character by character using each character's code number, and every capital letter (A–Z are 65–90) comes before every lowercase letter (a–z are 97–122), so "Samosa" and "Vada pav" jump ahead of "bun maska". The fix is the <code>key</code> argument, the most useful idea in Python sorting.</p>
  <p>The <code>key</code> argument is a function. Python calls it once on every item, sorts by the results, and returns the original items in that order. With <code>key=str.lower</code>, Python compares "samosa" and "bun maska" but hands back "Samosa" and "bun maska". This is how you sort records by one of their fields. For our order tuples, <code>lambda o: o[2]</code> is a tiny function meaning "given an order, return its quantity" (<code>lambda</code> is just a short way to write a one-line function). The <code>operator.itemgetter</code> helper builds such functions for you, and can pick several fields at once.</p>
  <div class="fx" data-lang="py">print(sorted(orders, key=lambda o: o[2], reverse=True))    # biggest order first
from operator import itemgetter
print(sorted(orders, key=itemgetter(1, 0)))                 # by item, then by customer
print(max(orders, key=lambda o: o[2]))                      # key= works for max and min too</div>
  <div class="fx" data-lang="text">[('Ben', 'samosa', 3), ('Asha', 'masala chai', 2), ('Dia', 'bun maska', 2), ('Ben', 'masala chai', 2), ('Asha', 'ginger chai', 1), ('Chen', 'masala chai', 1)]
[('Dia', 'bun maska', 2), ('Asha', 'ginger chai', 1), ('Asha', 'masala chai', 2), ('Ben', 'masala chai', 2), ('Chen', 'masala chai', 1), ('Ben', 'samosa', 3)]
('Ben', 'samosa', 3)</div>
  <p>The first line sorts by quantity, largest first: 3, then the three orders of 2, then the two orders of 1. In the second, <code>itemgetter(1, 0)</code> turns each order into the pair (item, customer). Tuples compare item by item from the left, so the orders are sorted by item first ("bun maska" &lt; "ginger chai" &lt; "masala chai" &lt; "samosa"), and the three masala chai orders, which tie on item, are then ordered by customer: Asha, Ben, Chen. The same <code>key</code> idea works with <code>max</code> and <code>min</code>: Ben's samosa order is the largest.</p>
  <p>Look again at the first line's output. Among the three orders with quantity 2, Asha's comes before Dia's, which comes before Ben's masala chai: exactly the order they had in the original list. That is not luck. Python's sort is <strong>stable</strong>, which means items that compare equal keep the order they had before sorting. Stability gives a neat way to sort by several keys: sort by the less important key first, then by the more important one, and the ties from the second sort keep the order from the first. Below we want "largest quantity first, and among equal quantities, alphabetical by name":</p>
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
  <p>After the first sort the orders are alphabetical by customer. The second sort orders them by quantity, and because it is stable, the three orders of 2 stay in their alphabetical order: Asha, Ben, Dia. The last line shows the one-pass alternative, which is usually what people write: a key that returns a tuple, <code>(-qty, name)</code>. Tuples compare the first element first and only look at the second to break a tie, and negating the quantity makes larger numbers sort first. Both approaches give the same result. Under the hood Python uses an algorithm called Timsort, which takes O(n log n) time in general and is especially fast, close to O(n), on data that is already partly sorted.</p>
  <p>Sorting needs every pair of items to be comparable with <code>&lt;</code>. Numbers compare with numbers and strings with strings, but Python refuses to guess how a number compares with a string:</p>
  <div class="fx" data-lang="py">try:
    sorted([2, "chai", 1])
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: '&lt;' not supported between instances of 'str' and 'int'</div>
  <p>If you meet this error, the list contains mixed types, often because some values were read from a file as text and never converted to numbers. Also remember that <code>key</code> takes a function itself, not a call to it: <code>key=len</code>, never <code>key=len()</code>.</p>

  <h2 id="plt-copy"><span class="num">07</span>Aliasing and Copying</h2>
  <p>Because a list holds references rather than the objects themselves, "make a copy of this list" can mean three different things, and confusing them leads to one of the most common bugs in Python: you edit what you think is a copy, and the original changes too. This bites hardest with nested data such as lists of lists, configuration dictionaries and JSON. Let us record which customers sit at which table, as a list of lists.</p>
  <div class="fx" data-lang="py">tables = [["Asha", "Ben"], ["Chen"]]     # who sits at table 1 and table 2
alias = tables
print(alias is tables, id(alias) == id(tables))
alias.append(["Dia"])
print(tables)</div>
  <div class="fx" data-lang="text">True True
[['Asha', 'Ben'], ['Chen'], ['Dia']]</div>
  <p>The line <code>alias = tables</code> copied nothing at all. It tied a second name to the same list, which is called an <strong>alias</strong>: <code>is</code> is <code>True</code> and the identity numbers match. So when we appended a new table through <code>alias</code>, the change appeared in <code>tables</code>, because there is only one list with two names. Assignment in Python never copies; it only adds a name.</p>
  <p>To get a real copy you have to ask for one, and there are two depths of copy. A <strong>shallow copy</strong>, made with <code>tables.copy()</code>, <code>tables[:]</code> or <code>list(tables)</code>, creates a new outer list, but its slots point at the <em>same</em> inner objects as the original. A <strong>deep copy</strong>, made with <code>copy.deepcopy(tables)</code>, creates a new outer list and new copies of everything inside it, all the way down. Think of a book. A shallow copy photocopies only the contents page: you have your own contents page, but it points at the same chapters, so if someone scribbles in chapter 1, both "books" show it. A deep copy reprints the whole book. The diagram shows the three situations side by side.</p>
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
  </svg><figcaption><code>tables</code> and <code>alias</code> point at one outer list. The shallow copy has its own outer list, but its slots (dotted red) point at the same inner lists. Only the deep copy owns new inner lists (green).</figcaption></figure>
  <p>Follow the arrows. On the left, <code>tables</code> and <code>alias</code> both point at one outer list. Below them, <code>shallow</code> has its own outer list (outer′), but the dotted arrows from its slots lead to the same two red inner lists that the original uses. On the right, <code>deep</code> has its own outer list and its own green inner lists. Now predict, using the diagram, what each name will show if we add "Esha" to the inner list at table 1 and add a whole new table to the outer list.</p>
  <div class="fx" data-lang="py">import copy
tables = [["Asha", "Ben"], ["Chen"]]
alias   = tables
shallow = tables.copy()          # same as tables[:] or list(tables)
deep    = copy.deepcopy(tables)
print("same outer?  ", tables is alias, tables is shallow, tables is deep)
print("same inner 0?", tables[0] is alias[0], tables[0] is shallow[0], tables[0] is deep[0])
tables[0].append("Esha")         # edit an INNER list
tables.append(["Faiz"])          # edit the OUTER list
print("tables ", tables)
print("alias  ", alias)
print("shallow", shallow)
print("deep   ", deep)</div>
  <div class="fx" data-lang="text">same outer?   True False False
same inner 0? True True False
tables  [['Asha', 'Ben', 'Esha'], ['Chen'], ['Faiz']]
alias   [['Asha', 'Ben', 'Esha'], ['Chen'], ['Faiz']]
shallow [['Asha', 'Ben', 'Esha'], ['Chen']]
deep    [['Asha', 'Ben'], ['Chen']]</div>
  <p>The two <code>is</code> lines confirm the diagram: only <code>alias</code> shares the outer list, while both <code>alias</code> and <code>shallow</code> share inner list 0. The results follow exactly from that. The inner edit ("Esha" at table 1) reached everyone who shares that inner list, so <code>alias</code> and <code>shallow</code> both show it. The outer edit (the new ["Faiz"] table) reached only the names that share the outer list, which is just <code>alias</code>. The deep copy is completely independent and still shows the original seating.</p>
  <p>So when is a shallow copy enough? Whenever the items inside are things that cannot change, such as strings, numbers, or tuples of those. With a flat list of names, "changing" an item means replacing a reference in your own outer list, which cannot affect the original:</p>
  <div class="fx" data-lang="py">names2 = names.copy()
names2[0] = "ASHA"               # replace an item in a flat list of strings
print(names[0], names2[0])       # a shallow copy is enough here</div>
  <div class="fx" data-lang="text">Asha ASHA</div>
  <p>The original still says Asha. Deep copies only matter when the list contains other mutable containers, which is common with configuration files and JSON data. (In pandas, by contrast, <code>df.copy()</code> copies the data by default, while <code>df2 = df</code> is still just an alias; see <a class="xref" data-note="da_pandas">Pandas</a>.)</p>
  <p>The same sharing hides inside one innocent-looking expression. Suppose we want a 3×3 grid of zeros, three tables by three hours. <code>[0] * 3</code> makes one row of three zeros, and it is tempting to write <code>[[0] * 3] * 3</code> for three rows. But <code>* 3</code> on the outer list repeats the <em>reference</em> to that one row three times:</p>
  <div class="fx" data-lang="py">grid = [[0] * 3] * 3                       # 3 references to ONE row
print(len({id(row) for row in grid}))      # how many distinct row objects?
grid[0][0] = 1
print(grid)
grid = [[0] * 3 for _ in range(3)]         # a NEW row each time round the loop
print(len({id(row) for row in grid}))
grid[0][0] = 1
print(grid)</div>
  <div class="fx" data-lang="text">1
[[1, 0, 0], [1, 0, 0], [1, 0, 0]]
3
[[1, 0, 0], [0, 0, 0], [0, 0, 0]]</div>
  <p>In the first version there is only one distinct row object, so writing a 1 into "row 0" appears to change all three rows; there is really only one row, shown three times. The comprehension evaluates <code>[0] * 3</code> afresh on each pass of its loop, giving three separate rows, and only row 0 changes. (<code>[0] * 3</code> by itself is safe, because the repeated item, 0, is an immutable number.)</p>

  <h2 id="plt-tuple"><span class="num">08</span>Tuples</h2>
  <p>A list is the right container for "many things of the same kind, where the number may change", like all of today's orders. But each single order is a different kind of thing: it always has exactly three parts, and each position has its own meaning (customer, item, quantity). If we stored one order as a list, nothing would stop some code from appending a fourth value or accidentally overwriting the customer. For records like this Python has the <strong>tuple</strong>: an ordered sequence that cannot be changed after it is created. Think of a printed receipt. You can read every line, photocopy it or tear it up, but you cannot change what is printed on it; to "change" it you print a new one.</p>
  <p>Everything that only reads a sequence works on a tuple exactly as on a list: indexing, slicing, <code>len</code>, <code>in</code>, <code>count</code> and <code>index</code>. Anything that would change it either does not exist or raises an error:</p>
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
  <p>Reading works as expected, and a slice of a tuple is a new tuple. Trying to replace the quantity raises <code>TypeError: 'tuple' object does not support item assignment</code>. A tuple has no <code>append</code>, <code>remove</code> or <code>sort</code> method at all. This protection is the point: once an order is recorded, nothing can quietly alter it.</p>
  <p>A detail of tuple syntax surprises nearly everyone. The round brackets are not what makes a tuple; the <strong>commas</strong> are. Brackets are also used for grouping in arithmetic, so Python cannot treat every pair of brackets as a tuple.</p>
  <div class="fx" data-lang="py">print(type((5)), type((5,)), (5,))
t = "Asha", "samosa", 3          # the commas make the tuple, brackets optional
print(t, type(t))
print(type(()), len(()))</div>
  <div class="fx" data-lang="text">&lt;class 'int'&gt; &lt;class 'tuple'&gt; (5,)
('Asha', 'samosa', 3) &lt;class 'tuple'&gt;
&lt;class 'tuple'&gt; 0</div>
  <p><code>(5)</code> is just the number 5 in grouping brackets. <code>(5,)</code>, with a trailing comma, is a tuple containing one item. Writing values separated by commas with no brackets at all also makes a tuple, which is why <code>t</code> is a tuple. The one exception is the empty tuple, which is written <code>()</code>. The flip side of this rule is a common accident: a stray trailing comma, as in <code>x = 5,</code>, makes <code>x</code> a tuple, and arithmetic on it fails later with a confusing error.</p>
  <p>"Cannot change" has a precise meaning that is worth getting right. A tuple's slots are fixed: each slot will always point at the same object. But if that object is itself mutable, the object can still change.</p>
  <div class="fx" data-lang="py">row = ("table 1", ["Asha", "Ben"])
row[1].append("Esha")             # the tuple's slot is fixed, but the list in it can grow
print(row)</div>
  <div class="fx" data-lang="text">('table 1', ['Asha', 'Ben', 'Esha'])</div>
  <p>Slot 1 of <code>row</code> still points at the same list object it always did; the tuple did not change. The list, however, grew. So a tuple is only completely frozen when everything inside it is immutable too, and this distinction comes back when we ask which tuples can be dictionary keys.</p>
  <p>Because a tuple never grows, Python does not need to reserve spare slots or keep resizing logic, so tuples are a little smaller and quicker to build than lists:</p>
  <div class="fx" data-lang="py">import sys, timeit
print(sys.getsizeof(["Asha", "masala chai", 2]), sys.getsizeof(("Asha", "masala chai", 2)))
print(f"build list : {timeit.timeit('[1, 2, 3]', number=1_000_000) * 1000:.0f} ms per million")
print(f"build tuple: {timeit.timeit('(1, 2, 3)', number=1_000_000) * 1000:.0f} ms per million")</div>
  <div class="fx" data-lang="text">88 64
build list : 25 ms per million
build tuple: 8 ms per million</div>
  <p>The same three items take fewer bytes as a tuple, and a tuple of constants is built several times faster, because Python can create it once when the code is compiled and reuse it (times are approximate). These are small wins. The real reasons to choose a tuple are that it protects a record from accidental change and, as we will see, that it can be used as a dictionary key.</p>

  <h2 id="plt-unpack"><span class="num">09</span>Packing and Unpacking</h2>
  <p>Once orders are tuples, we constantly want to pull them apart into separately named values: <code>order[0]</code>, <code>order[1]</code> and <code>order[2]</code> say nothing about what each value means. Python lets you do this in one step. <strong>Unpacking</strong> means putting several names on the left of <code>=</code>; Python takes the sequence on the right and assigns its items to the names one by one, in order. The reverse, writing several values separated by commas so that they are bundled into a tuple, is called <strong>packing</strong>. Think of unpacking a tiffin box: three compartments and three hands ready, each hand takes one compartment.</p>
  <div class="fx" data-lang="py">name, item, qty = orders[0]          # unpacking: one name per slot
print(name, "|", item, "|", qty)
for name, item, qty in orders[:2]:   # unpacking on every pass of a loop
    print(f"{name} wants {qty} x {item}")
first, *rest = names                 # the star collects "the rest" into a LIST
print(first, rest)
*early, last = names
print(early, last)</div>
  <div class="fx" data-lang="text">Asha | masala chai | 2
Asha wants 2 x masala chai
Ben wants 3 x samosa
Asha ['Ben', 'Asha', 'Chen', 'Dia', 'Ben']
['Asha', 'Ben', 'Asha', 'Chen', 'Dia'] Ben</div>
  <p>The first line split Asha's order into three well-named variables. In the <code>for</code> loop the same unpacking happens on every pass, which is why we could write <code>for name, item, qty in orders</code> in the comprehensions earlier. The number of names must match the number of items, unless one name has a star in front of it: a starred name collects all the leftover items into a list. <code>first, *rest = names</code> takes Asha into <code>first</code> and the other five names into <code>rest</code>; <code>*early, last</code> does the opposite. In tiffin terms, if the box has more compartments than you have hands, one hand can be a big bag that takes everything else.</p>
  <p>Packing and unpacking together explain three Python idioms that otherwise look like magic.</p>
  <div class="fx" data-lang="py">a, b = "Asha", "Ben"
a, b = b, a                          # swap: pack the right side, then unpack it
print(a, b)
def busiest(orders):
    big = max(orders, key=lambda o: o[2])
    return big[0], big[2]            # "two return values" = ONE tuple
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
  <p>First, the swap. <code>a, b = b, a</code> first evaluates the right side, packing the current values into the tuple ("Ben", "Asha"), and only then unpacks that tuple into <code>a</code> and <code>b</code>, so no temporary variable is needed. Second, "returning two values". A Python function always returns exactly one object; <code>return big[0], big[2]</code> packs the two values into one tuple, <code>('Ben', 3)</code>, which the caller may then unpack into <code>who, how_many</code>. Third, the count must match: two names for a three-item tuple raises "too many values to unpack (expected 2)". Finally, unpacking can be nested. <code>enumerate</code> produces (position, item) pairs, and since each item is itself an order tuple, <code>i, (name, item, qty)</code> unpacks both levels at once.</p>
  <p>One related surprise: unpacking a dictionary gives its keys, not its pairs, so <code>a, b = {"x": 1, "y": 2}</code> sets <code>a</code> to "x". To unpack key–value pairs, loop over <code>d.items()</code>, as shown in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>.</p>

  <h2 id="plt-named"><span class="num">10</span>namedtuple</h2>
  <p>Unpacking gives names to a tuple's parts at the point where you use it, but the tuple itself still only knows positions. Six months later, <code>o[2]</code> in some function tells the reader nothing, and if someone ever reorders the fields, every <code>o[2]</code> silently means something else. <code>collections.namedtuple</code> solves this by creating a new tuple <em>type</em> whose fields have names. It is like replacing a blank strip of three boxes with a printed form whose boxes are labelled "Customer", "Item" and "Qty". Each object is still an ordinary tuple, so everything you know about tuples and unpacking keeps working, but you can also reach the fields by name.</p>
  <div class="fx" data-lang="py">from collections import namedtuple
Order = namedtuple("Order", ["customer", "item", "qty"])
o = Order("Asha", "masala chai", 2)
print(o)
print(o.customer, o.qty, o[0])             # by name AND by position
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
  <p>The first line creates the new type <code>Order</code> with three named fields. When printed, an Order shows its field names, which makes debugging much easier. <code>o.qty</code> and <code>o[0]</code> both work, and the Order compares equal to a plain tuple with the same values, because it is one. Since it is still immutable, "changing" a field means calling <code>_replace</code>, which returns a new Order; <code>o</code> itself still has a quantity of 2. <code>_asdict()</code> turns it into a dictionary, handy for writing JSON. The last two lines convert the whole morning: <code>Order(*t)</code> unpacks each plain tuple into the three constructor arguments, and then the masala chai quantities, 2 + 1 + 2, add up to 5 cups, with code that reads like a sentence.</p>
  <p>A namedtuple is the right choice for small, read-only records. Assigning <code>o.qty = 3</code> still raises an error, because it is still a tuple. When a record needs to be changed after creation, or needs methods of its own, use a <code>@dataclass</code> instead, which is a normal class with the boring parts generated for you (see <a class="xref" data-note="py_classes">Classes &amp; Objects</a>). The <code>typing.NamedTuple</code> class is the same thing as <code>namedtuple</code>, written with class syntax and type hints.</p>

  <h2 id="plt-hash"><span class="num">11</span>Hashability</h2>
  <p>Suppose the stall wants the total quantity for each combination of customer and item, such as "Ben, masala chai". The natural tool is a dictionary whose key is the pair (customer, item). <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> explains dictionaries in depth; for now it is enough to know that a dictionary stores values under keys and finds them again quickly. It does that by turning each key into a number called its <strong>hash</strong> and using that number to decide where to store the value, the way a cloakroom token number tells the attendant which shelf your bag is on.</p>
  <p>That scheme only works if a key's hash can never change while it is stored. If it changed, the dictionary would look on the wrong shelf. An object whose hash is fixed for its whole life is called <strong>hashable</strong>, and only hashable objects can be dictionary keys or set items. A tuple of immutable values can never change, so Python can give it a stable hash. A list can change at any moment, so Python does not give lists a hash at all. A tuple is a stamped metal token; a list is a token written in pencil.</p>
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
  <p>Two equal tuples always produce the same hash, which is what lets a dictionary find a key again. The six orders produced six different (customer, item) keys, and the key <code>("Ben", "masala chai")</code> holds 2 cups. Trying the same thing with a list as the key fails with "unhashable type: 'list'". The last example connects back to the Tuples section: a tuple that <em>contains</em> a list is also unhashable, because the list inside could change and with it the tuple's contents. So the precise rule is that a tuple is hashable only if every item in it is hashable. In practice, keys should be tuples of strings and numbers.</p>

  <h2 id="plt-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most frequent list bug was shown in the Changing a List section: assigning the result of an in-place method, as in <code>q = q.sort()</code> or <code>q = q.append(x)</code>, which leaves <code>q</code> as <code>None</code>. The second most frequent is removing items from a list while looping over the same list. When you remove an item, everything after it shifts one place left, but the loop's position counter carries on to the next index, so the item that slid into the current position is skipped:</p>
  <div class="fx" data-lang="py">q = [1, 2, 2, 3]
for v in q:
    if v == 2:
        q.remove(v)          # shifts the next 2 into the current position
print(q)                     # one 2 survived

q = [1, 2, 2, 3]
q = [v for v in q if v != 2] # build a new list instead
print(q)</div>
  <div class="fx" data-lang="text">[1, 2, 3]
[1, 3]</div>
  <p>The loop was meant to remove both 2s, but one survived, because the second 2 slid into the place of the first just as the loop moved past it. Building a new list with a comprehension avoids the problem entirely. Looping over a copy (<code>for v in q[:]</code>) also works.</p>
  <p>A third classic is using a list as a default argument value. Default values are created once, when the <code>def</code> line runs, not each time the function is called, so every call that relies on the default shares the same list:</p>
  <div class="fx" data-lang="py">def add(order, day=[]):          # the [] is created ONCE
    day.append(order)
    return day
print(add("chai"))
print(add("samosa"))             # still the same list

def add_fixed(order, day=None):
    if day is None:
        day = []                 # a fresh list on every call
    day.append(order)
    return day
print(add_fixed("chai"), add_fixed("samosa"))</div>
  <div class="fx" data-lang="text">['chai']
['chai', 'samosa']
['chai'] ['samosa']</div>
  <p>The second call to <code>add</code> returned both items, because the "empty" default list remembered the first call. The standard fix is to use <code>None</code> as the default and create the list inside the function. <a class="xref" data-note="py_functions">Functions</a> explains this in more detail.</p>
  <p>Finally, a puzzle that interviewers love, which combines tuples and in-place changes. Using <code>+=</code> on a list stored inside a tuple both fails and succeeds:</p>
  <div class="fx" data-lang="py">t = (1, [2, 3])
try:
    t[1] += [4]
except TypeError as e:
    print("TypeError:", e)
print(t)</div>
  <div class="fx" data-lang="text">TypeError: 'tuple' object does not support item assignment
(1, [2, 3, 4])</div>
  <p>It raises a <code>TypeError</code>, yet afterwards the list inside <code>t</code> contains 4. The reason is that <code>t[1] += [4]</code> happens in two steps: first the list extends itself in place (which works, lists are mutable), and then Python tries to store the result back into slot 1 of the tuple (which fails, tuples are immutable). By then the list has already changed. Beyond these, remember the smaller traps from earlier: <code>[[0]*3]*3</code> repeats one row, a shallow copy shares nested lists, <code>extend("Ben")</code> adds letters, <code>(5)</code> is not a tuple, and <code>pop(0)</code> in a loop is O(n²).</p>

  <h2 id="plt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>List</b>: ordered, mutable sequence of references; duplicates and mixed types allowed. CPython: a dynamic array with spare room.</li>
    <li><b>Tuple</b>: ordered, immutable sequence; the comma makes it. Use for fixed records.</li>
    <li><b>Index</b>: position from 0; <code>s[-k]</code> means <code>s[len(s) - k]</code>; out of range → IndexError.</li>
    <li><b>Slice</b> <code>s[start:stop:step]</code>: new sequence, stop excluded, never raises.</li>
    <li><b>Amortised O(1)</b>: occasionally expensive, constant on average (<code>append</code>).</li>
    <li><b>Stable sort</b>: equal keys keep their original order.</li>
    <li><b>Alias / shallow / deep</b>: same object / new outer, shared inner / everything new.</li>
    <li><b>Hashable</b>: hash never changes; required for dict keys and set items.</li>
  </ul>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Big-O</th></tr>
    <tr><td><code>q[i]</code>, <code>q[i] = x</code>, <code>len</code>, <code>append</code>, <code>pop()</code></td><td>O(1) (append amortised)</td></tr>
    <tr><td><code>insert(i, x)</code>, <code>pop(i)</code>, <code>del q[i]</code></td><td>O(n − i)</td></tr>
    <tr><td><code>in</code>, <code>index</code>, <code>remove</code>, <code>count</code></td><td>O(n)</td></tr>
    <tr><td><code>sort</code>, <code>sorted</code></td><td>O(n log n), O(n) if nearly sorted</td></tr>
  </table>
  <h3>List vs tuple</h3>
  <table class="tbl">
    <tr><th></th><th>list</th><th>tuple</th></tr>
    <tr><td>Changeable</td><td>yes</td><td>no (but mutable items inside can change)</td></tr>
    <tr><td>Typical use</td><td>many items of one kind, size varies</td><td>one record, each position has a meaning</td></tr>
    <tr><td>Dict key / set item</td><td>never</td><td>if all items are hashable</td></tr>
    <tr><td>Size, build speed</td><td>larger, slower</td><td>smaller, faster</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">q = [2, 3, 1]; q.append(4); q.extend([5, 6]); q.insert(0, 9)
q.pop(); q.pop(0); q.remove(3); del q[0]; q[1:3] = []
names[1:4]; names[::-1]; names[-2:]
[x * 2 for x in xs if x &gt; 0]; ["big" if x &gt; 1 else "small" for x in xs]
sum(x for x in xs)                       # generator, no list
sorted(rows, key=lambda r: (-r[2], r[0])); rows.sort(key=itemgetter(1))
shallow = a.copy(); deep = copy.deepcopy(a)
grid = [[0] * 3 for _ in range(3)]
t = (5,); name, item, qty = order; first, *rest = xs; a, b = b, a
Order = namedtuple("Order", "customer item qty"); o._replace(qty=3)</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>q = q.sort()</code> → None. In-place methods return None.</li>
    <li><code>append([1, 2])</code> nests; <code>extend("Ben")</code> adds letters.</li>
    <li><code>pop(0)</code> / <code>insert(0, x)</code> in a loop → O(n²); use <code>deque</code>.</li>
    <li><code>b = a</code> is not a copy; shallow copies share nested lists; <code>[[0]*3]*3</code> shares one row.</li>
    <li>Removing from a list while looping over it skips items.</li>
    <li>Mutable default argument <code>def f(x, acc=[])</code> is shared across calls.</li>
    <li><code>(5)</code> is an int; <code>x = 5,</code> is a tuple. A tuple holding a list is not hashable.</li>
    <li><code>t[1] += [4]</code> on <code>t = (1, [2, 3])</code> raises TypeError and still changes the list.</li>
  </ul>

  <h2 id="plt-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a list and a tuple?</summary><div class="qa-body">A list is mutable: you can append, remove and replace items. A tuple is immutable once created. Because of that, a tuple is hashable when all its items are, so it can be a dict key or set item, and a list never can. Tuples are also slightly smaller and faster to create. Use a list for a varying number of items of the same kind, and a tuple for a fixed record where each position has a meaning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is a Python list implemented internally?</summary><div class="qa-body">In CPython a list is a dynamic array: a continuous block of references (pointers) to objects, plus the current length and the allocated capacity. When the capacity runs out, Python allocates a larger block, grown in proportion to the current size, and copies the references across. That is why indexing is O(1), and why a list stores references to objects rather than the objects themselves.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the time complexities of <code>append</code>, <code>insert(0, x)</code>, <code>pop()</code>, <code>pop(0)</code>, <code>x in lst</code> and <code>lst[i]</code>?</summary><div class="qa-body"><code>append</code> and <code>pop()</code> are O(1) amortised. <code>insert(0, x)</code> and <code>pop(0)</code> are O(n), because every other reference has to shift. <code>x in lst</code> is O(n), a linear scan. <code>lst[i]</code> is O(1). For frequent operations at the front use <code>collections.deque</code>; for frequent membership tests use a set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "amortised O(1)" mean for <code>list.append</code>?</summary><div class="qa-body">Most appends write into spare capacity and cost O(1). Occasionally the array is full and must be reallocated and copied, which costs O(n). Because the capacity grows in proportion to the size, these copies get rarer as the list grows, so n appends cost O(n) in total, which is O(1) per append on average. <code>sys.getsizeof</code> shows the capacity jumping from 4 to 8 to 16 to 24 slots.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>append</code> and <code>extend</code>?</summary><div class="qa-body"><code>a.append(x)</code> adds <code>x</code> as a single item, even if <code>x</code> is a list, so the list ends up nested. <code>a.extend(it)</code> loops over <code>it</code> and adds each item; <code>a += it</code> does the same. Because strings are iterable, <code>a.extend("Ben")</code> adds the three characters separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>a = [1, 2, 3]; b = a; b.append(4); print(a)</code></summary><div class="qa-body"><code>[1, 2, 3, 4]</code>. Assignment never copies in Python: <code>b</code> is just a second name for the same list object (<code>a is b</code> is True), so a change made through either name is visible through both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a shallow copy and a deep copy?</summary><div class="qa-body">A shallow copy (<code>a.copy()</code>, <code>a[:]</code>, <code>list(a)</code>, <code>copy.copy(a)</code>) creates a new outer list whose slots point at the same inner objects, so changing a nested list through the copy changes the original. <code>copy.deepcopy(a)</code> recursively copies everything inside, keeping a memo so shared or circular references are copied only once. A deep copy matters only for nested mutable data such as lists of lists or JSON.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>g = [[0] * 3] * 3; g[0][0] = 1; print(g)</code></summary><div class="qa-body"><code>[[1, 0, 0], [1, 0, 0], [1, 0, 0]]</code>. The outer <code>* 3</code> repeats a reference to the same inner list three times, so there is really only one row. Build independent rows with <code>[[0] * 3 for _ in range(3)]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>def add(x, bucket=[]): bucket.append(x); return bucket</code>, then <code>add(1)</code> and <code>add(2)</code>.</summary><div class="qa-body"><code>[1]</code> and then <code>[1, 2]</code>. Default values are evaluated once, when the <code>def</code> statement runs, so every call that uses the default shares the same list. The fix is <code>bucket=None</code> and <code>if bucket is None: bucket = []</code> inside the function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>sorted(x)</code> and <code>x.sort()</code>?</summary><div class="qa-body"><code>sorted</code> accepts any iterable and returns a new list, leaving the input unchanged. <code>list.sort</code> exists only on lists, sorts in place and returns <code>None</code>, so <code>x = x.sort()</code> loses the data. Both accept <code>key=</code> and <code>reverse=</code>, and both use Timsort: O(n log n), stable, and close to O(n) on nearly sorted input.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a stable sort, and how do you sort by several keys?</summary><div class="qa-body">A stable sort keeps items with equal keys in their original relative order. That means you can sort by the secondary key first and then by the primary key. In one pass, use a tuple key: <code>sorted(rows, key=lambda r: (-r.qty, r.name))</code> sorts by quantity descending, then name ascending. When a descending key cannot be negated (a string, for example), do two passes and use <code>reverse=True</code> on one of them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a list comprehension and a generator expression?</summary><div class="qa-body"><code>[x for x in it]</code> builds the whole list in memory immediately. <code>(x for x in it)</code> creates a lazy generator that produces one item at a time and can only be consumed once. Use a generator when you only need to aggregate (<code>sum</code>, <code>max</code>, <code>any</code>) or stream the values, because it never holds them all at once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does the loop variable of a list comprehension leak into the surrounding code?</summary><div class="qa-body">Not in Python 3. With <code>x = 10</code> followed by <code>[x for x in range(3)]</code>, <code>x</code> is still 10 afterwards, because the comprehension has its own scope. A plain <code>for</code> loop, by contrast, leaves its variable set to the last value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you remove items from a list while iterating over it?</summary><div class="qa-body">Items get skipped. Removing an item shifts the next one into the current position, and the loop then moves past it, so <code>[1, 2, 2, 3]</code> with every 2 removed in a loop ends as <code>[1, 2, 3]</code>. Build a new list with a comprehension, loop over a copy (<code>q[:]</code>), or loop backwards by index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a tuple always hashable? Can a tuple's contents change?</summary><div class="qa-body">A tuple is hashable only if every item in it is hashable; <code>hash((1, [2]))</code> raises <code>TypeError: unhashable type: 'list'</code>. The tuple's slots can never change, but a mutable object in a slot can still be changed, so <code>t[1].append(3)</code> works on <code>t = (1, [2])</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens here? <code>t = (1, [2, 3]); t[1] += [4]</code></summary><div class="qa-body">It raises <code>TypeError: 'tuple' object does not support item assignment</code>, yet afterwards <code>t</code> is <code>(1, [2, 3, 4])</code>. The <code>+=</code> first extends the list in place, which succeeds, and then tries to store the result back into <code>t[1]</code>, which fails. It shows that augmented assignment is "change, then assign".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you create a one-element tuple? What is <code>type((1))</code>?</summary><div class="qa-body">Write <code>(1,)</code> or <code>1,</code>: the comma makes a tuple, and brackets only group. <code>type((1))</code> is <code>int</code>. For the same reason a stray trailing comma, as in <code>x = 5,</code>, silently creates a tuple.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does extended unpacking work? What does <code>first, *rest = [1, 2, 3]</code> give?</summary><div class="qa-body"><code>first</code> is 1 and <code>rest</code> is <code>[2, 3]</code>. The starred name collects all remaining items into a list (even when unpacking a tuple), and only one starred name is allowed. Without a star, the number of names must match exactly or Python raises <code>ValueError</code>. <code>a, b = b, a</code> swaps two values by packing the right side into a tuple first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>namedtuple, dataclass or dict for a record?</summary><div class="qa-body">A namedtuple is immutable, hashable and lightweight, supports both position and name access, and can be unpacked. A dataclass is a regular class with generated <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code>; it is mutable by default, supports defaults, methods and type hints, and can be frozen. A dict has no fixed schema and suits JSON-shaped data. Choose a namedtuple for small read-only records and a dataclass for richer domain objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need a first-in, first-out queue. Why not use a list?</summary><div class="qa-body"><code>list.pop(0)</code> shifts every remaining item, so draining n items costs O(n²) in total. <code>collections.deque</code> is built from linked blocks, so appending and popping at both ends are O(1); draining 100,000 items is roughly a hundred times faster than with a list. Its trade-off is that indexing into the middle is O(n). Between threads, use <code>queue.Queue</code>, which adds locking.</div></details>
</main>
`
});
