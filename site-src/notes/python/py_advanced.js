// notes/python/py_advanced.js — Functional Programming Tools
Object.assign(TOPIC_CONTENT, {
  "py_advanced": `<main>
<h1>Functional Programming Tools</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Functional Programming Tools</span></div>
  <p class="lead">Functional programming is a style of writing code where you build programs out of small functions that take values in and hand new values back, and where functions themselves are passed around like any other piece of data. Python is not a purely functional language, but it borrows the most useful parts of the style: <code>map</code>, <code>filter</code> and <code>reduce</code>, <code>key=</code> functions for sorting and ranking, the <code>operator</code> module, and the <code>functools</code> toolbox (<code>partial</code>, <code>lru_cache</code>, <code>singledispatch</code>). In real work these tools stop you writing the same loop again and again with one line changed, save you from recomputing slow results thousands of times, and keep your data transformations easy to test. Throughout this page we will use one small example: a day of orders at a tea stall called Chai Corner, stored as a list of dictionaries. Every new tool is applied to those same five orders, so you can see exactly what each one adds.</p>

  <h2 id="pa-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Functional Tools</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Functions as values</div>
        <ul>
          <li><code>f</code> is the function; <code>f()</code> runs it</li>
          <li><b>Higher-order</b>: takes or returns a function</li>
          <li><code>lambda</code>: a one-expression function with no name</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transform and combine</div>
        <ul>
          <li><code>map</code>/<code>filter</code>: lazy, one pass only</li>
          <li>Comprehensions are usually clearer than map + lambda</li>
          <li><code>reduce</code> folds many values into one; prefer <code>sum</code>, <code>max</code>, <code>any</code>, <code>all</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sorting and picking</div>
        <ul>
          <li><code>key=</code> is called once per item</li>
          <li>Tuple keys for several columns; sort is stable</li>
          <li><code>itemgetter</code>, <code>attrgetter</code>, <code>methodcaller</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">functools</div>
        <ul>
          <li><code>partial</code>: freeze some arguments now</li>
          <li><code>lru_cache</code>/<code>cache</code>: remember results; hashable args, pure functions</li>
          <li><code>singledispatch</code>: choose code by argument type</li>
          <li><code>total_ordering</code>: <code>__eq__</code> + one comparison</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pure style</div>
        <ul>
          <li>Pure: same input → same output, no side effects</li>
          <li>Return new data instead of changing arguments</li>
          <li>tuple, frozenset, frozen dataclass; immutability is shallow</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pa-hof"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Functions as Values</span><span class="rm-sub">passing, returning and storing functions</span></div></div>
      <div class="rm-item rm-done" data-target="pa-lambda"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">lambda</span><span class="rm-sub">tiny functions written inline, and their limits</span></div></div>
      <div class="rm-item rm-done" data-target="pa-mapfilter"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">map, filter and Comprehensions</span><span class="rm-sub">transforming and selecting, lazily</span></div></div>
      <div class="rm-item rm-done" data-target="pa-reduce"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">reduce, any and all</span><span class="rm-sub">folding many values into one</span></div></div>
      <div class="rm-item rm-done" data-target="pa-key"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Key Functions</span><span class="rm-sub">sorting and picking by any rule</span></div></div>
      <div class="rm-item rm-done" data-target="pa-operator"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The operator Module</span><span class="rm-sub">ready-made functions instead of lambdas</span></div></div>
      <div class="rm-item rm-done" data-target="pa-partial"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">functools.partial</span><span class="rm-sub">fixing some arguments in advance</span></div></div>
      <div class="rm-item rm-done" data-target="pa-cache"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Memoisation: lru_cache and cache</span><span class="rm-sub">remembering slow results</span></div></div>
      <div class="rm-item rm-done" data-target="pa-dispatch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">singledispatch and total_ordering</span><span class="rm-sub">code chosen by type, comparisons filled in</span></div></div>
      <div class="rm-item rm-done" data-target="pa-pure"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Pure Functions and Immutability</span><span class="rm-sub">why functions that change nothing are easier</span></div></div>
      <div class="rm-item rm-done" data-target="pa-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">f() vs f, used-up maps, stale caches</span></div></div>
      <div class="rm-item rm-done" data-target="pa-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, tables and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pa-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">map vs comprehension, caching, purity</span></div></div>
    </div>
  </div>

  <h2 id="pa-hof"><span class="num">01</span>Functions as Values</h2>
  <p>Chai Corner's owner wants three reports from today's orders: the plain amount of each order, the amount with 5% GST added, and the amount after a ₹10 happy-hour discount. Each order is a dictionary with an item, a quantity and a price, and the amount of an order is quantity × price. Written the obvious way, the three reports look like this:</p>
  <div class="fx" data-lang="py">orders = [
    {"id": 1, "item": "masala chai", "qty": 2, "price": 30},
    {"id": 2, "item": "samosa",      "qty": 3, "price": 15},
    {"id": 3, "item": "cold coffee", "qty": 1, "price": 90},
    {"id": 4, "item": "masala chai", "qty": 1, "price": 30},
    {"id": 5, "item": "vada pav",    "qty": 4, "price": 20},
]

def amounts(orders):
    result = []
    for o in orders:
        result.append(o["qty"] * o["price"])
    return result

def amounts_with_gst(orders):
    result = []
    for o in orders:
        result.append(round(o["qty"] * o["price"] * 1.05, 2))
    return result

def amounts_discounted(orders):
    result = []
    for o in orders:
        result.append(o["qty"] * o["price"] - 10)
    return result

print(amounts(orders))
print(amounts_with_gst(orders))
print(amounts_discounted(orders))</div>
  <div class="fx" data-lang="text">[60, 45, 90, 30, 80]
[63.0, 47.25, 94.5, 31.5, 84.0]
[50, 35, 80, 20, 70]</div>
  <p>The answers are right: the five orders come to 60, 45, 90, 30 and 80 rupees. But look at the three functions. They are the same loop three times: make an empty list, go through the orders, append something, return the list. Only one line differs in each, the line that says <em>what to compute</em> for a single order. If a fourth report is needed, we will copy the loop a fourth time, and if we ever find a bug in the loop, we will have to fix it in four places.</p>
  <p>What we would like is to write the loop once and hand it "the thing to compute" as an input, the same way we hand it the list of orders. That is possible because in Python a function is a value, just like a number or a list. Saying that functions are <strong>first-class</strong> means exactly this: a function can be stored in a variable, put in a list or dictionary, passed into another function, and returned from one. A function that takes another function as an argument, or returns one, is called a <strong>higher-order function</strong>.</p>
  <p>Think of a photocopy shop. The machine does the same job every time (take each page, produce a copy), but you choose the setting: black and white, colour, double-sided. You do not buy a new machine for each setting; you pass the setting in. A higher-order function is the machine, and the small function you pass in is the setting.</p>
  <div class="fx" data-lang="py">def amount(order):
    return order["qty"] * order["price"]

def amount_with_gst(order):
    return round(amount(order) * 1.05, 2)

def apply_to_all(func, orders):          # higher-order: takes a function
    return [func(o) for o in orders]

print(apply_to_all(amount, orders))
print(apply_to_all(amount_with_gst, orders))

f = amount_with_gst                      # no brackets: the function itself
print(f is amount_with_gst, type(f).__name__, f.__name__)</div>
  <div class="fx" data-lang="text">[60, 45, 90, 30, 80]
[63.0, 47.25, 94.5, 31.5, 84.0]
True function amount_with_gst</div>
  <p><code>apply_to_all</code> contains the loop, written once. Its first parameter, <code>func</code>, is a function, and inside the loop it calls <code>func(o)</code> on each order. When we pass <code>amount</code>, we get the plain amounts; when we pass <code>amount_with_gst</code>, we get the taxed ones (63.0, 47.25, …). Notice that we wrote <code>amount</code> with no brackets. The name on its own is the function object; adding brackets, <code>amount(o)</code>, would <em>run</em> it and give back a number. The last lines prove the point: <code>f = amount_with_gst</code> did not call anything, it simply gave the same function a second name, so <code>f is amount_with_gst</code> is <code>True</code>, its type is <code>function</code>, and it still knows its own name.</p>
  <p>The other half of "higher-order" is returning a function. Suppose the discount is not always ₹10; sometimes it is ₹20. Instead of writing one discount function per amount, we can write a function that <em>builds</em> discount functions:</p>
  <div class="fx" data-lang="py">def make_discount(rupees_off):           # higher-order: returns a function
    def discounted(order):
        return amount(order) - rupees_off
    return discounted

ten_off = make_discount(10)
twenty_off = make_discount(20)
print([ten_off(o) for o in orders])
print([twenty_off(o) for o in orders])

pricing = {"normal": amount, "happy hour": ten_off}   # a dispatch table
mode = "happy hour"
print(sum(pricing[mode](o) for o in orders))</div>
  <div class="fx" data-lang="text">[50, 35, 80, 20, 70]
[40, 25, 70, 10, 60]
255</div>
  <p><code>make_discount(10)</code> creates a brand-new function called <code>discounted</code> and hands it back; we store it as <code>ten_off</code>. Calling <code>make_discount(20)</code> creates a second, separate function. Each one remembers its own <code>rupees_off</code>, which is why the first list is 10 less than the plain amounts and the second is 20 less. An inner function that remembers variables from the function that created it is called a <strong>closure</strong>; how that remembering works is explained fully in <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>.</p>
  <p>The last three lines show functions stored in a dictionary. <code>pricing</code> maps a mode name to the function that implements it, so <code>pricing[mode](o)</code> first looks up a function and then calls it. This is called a <strong>dispatch table</strong>, and it is a tidy replacement for a long <code>if mode == ... elif mode == ...</code> chain: adding a new pricing mode means adding one entry to the dictionary. With happy-hour pricing the day's total is 255 instead of 305.</p>
  <p>Nearly everything else on this page is built on this one idea. <code>map</code>, <code>filter</code>, <code>sorted(key=...)</code>, <code>functools.partial</code>, <code>lru_cache</code> and every decorator are higher-order functions: you give them a small function, and they do the repetitive part for you. (The basics of defining and calling functions are in <a class="xref" data-note="py_functions">Functions</a>.)</p>

  <h2 id="pa-lambda"><span class="num">02</span>lambda</h2>
  <p>Once you start passing functions around, you quickly meet a small annoyance. Many of the functions you pass are tiny, one line long, and used in exactly one place. Writing a full <code>def</code> with a name for each of them clutters the code with names nobody will ever use again. Python's answer is the <strong>lambda</strong>: a way to write a small function inline, without giving it a name. The syntax is <code>lambda parameters: expression</code>, and the value of the expression is returned automatically.</p>
  <p>A lambda is like a sticky note compared with a filed document. For a quick instruction you will use once ("sort by quantity"), a sticky note is perfect. For anything you want to keep, label and find later, you file a proper document, which in Python is a <code>def</code>.</p>
  <div class="fx" data-lang="py">def by_qty(order):
    return order["qty"]

print(max(orders, key=by_qty)["item"])                  # a named function
print(max(orders, key=lambda o: o["qty"])["item"])      # the same, written inline

gst = lambda x: round(x * 1.05, 2)                      # works, but see below
def gst2(x):
    return round(x * 1.05, 2)
print(gst(60), gst.__name__, gst2.__name__)

size = lambda o: "big" if amount(o) &gt;= 60 else "small"  # a conditional expression is allowed
print([size(o) for o in orders])</div>
  <div class="fx" data-lang="text">vada pav
vada pav
63.0 &lt;lambda&gt; gst2
['big', 'small', 'big', 'small', 'big']</div>
  <p>The first two lines do the same job, finding the order with the biggest quantity (the vada pavs). One passes the named function <code>by_qty</code>; the other writes the same function inline as <code>lambda o: o["qty"]</code>. For a throwaway rule like this, the lambda version is easier to read because the rule sits right where it is used.</p>
  <p>The middle lines show a lambda's main weakness. <code>gst</code> works, but its name is <code>&lt;lambda&gt;</code>, because a lambda never has a real name. If it raises an error, the traceback will say "in &lt;lambda&gt;", which is no help when you have twenty of them. <code>gst2</code>, written with <code>def</code>, is called <code>gst2</code>. That is why the Python style guide (PEP 8) says that if you are going to give a function a name anyway, use <code>def</code>. The last example shows that a lambda can contain a conditional expression (<code>"big" if ... else "small"</code>), because that is still a single expression.</p>
  <p>The body of a lambda must be one <em>expression</em>, something that produces a value. It cannot contain <em>statements</em> such as assignments, <code>for</code> loops, <code>try</code>, <code>raise</code> or <code>return</code>. Lambdas also cannot have docstrings, and the standard <code>pickle</code> module cannot save them, which matters because <code>multiprocessing</code> uses pickle to send functions to worker processes. Finally, a lambda created inside a loop reads loop variables when it is <em>called</em>, not when it is created, which surprises many people; we will see that problem and its fix in the <code>partial</code> section.</p>
  <table class="tbl">
    <tr><th>Use a lambda when</th><th>Use <code>def</code> when</th></tr>
    <tr><td>the function is one short expression, used once, passed straight into <code>key=</code>, <code>map</code>, <code>filter</code> or a callback</td><td>it needs a name, several lines, a loop, a <code>try</code>, a docstring, or will be sent to another process</td></tr>
  </table>
  <p>One more small rule: do not wrap an existing function in a lambda. <code>key=lambda s: len(s)</code> is just a slower way of writing <code>key=len</code>.</p>

  <h2 id="pa-mapfilter"><span class="num">03</span>map, filter and Comprehensions</h2>
  <p>Two loop shapes appear constantly: "do something to every item" and "keep only the items that pass a test". Python has a built-in higher-order function for each. <strong><code>map(func, items)</code></strong> calls <code>func</code> on every item and gives back the results. <strong><code>filter(test, items)</code></strong> calls <code>test</code> on every item and keeps only those for which it returned something true. So <code>apply_to_all</code> from the first section is really just <code>map</code>.</p>
  <p>There is one important detail. In Python 3, <code>map</code> and <code>filter</code> do not return lists. They return <strong>lazy iterators</strong>: objects that have not computed anything yet, and that produce one result each time somebody asks for the next one. Think of a cook who prepares each plate only when a waiter comes to collect it, rather than cooking every plate in advance. Once a plate has been collected it is gone; an iterator can only be walked through once.</p>
  <div class="fx" data-lang="py">names = map(str.upper, (o["item"] for o in orders))
print(names)                                     # a lazy map object, nothing computed yet
print(list(names))
print(list(names))                               # second pass: already used up

big = filter(lambda o: amount(o) &gt;= 60, orders)
print([o["id"] for o in big])</div>
  <div class="fx" data-lang="text">&lt;map object at 0x7fe13929ebc0&gt;
['MASALA CHAI', 'SAMOSA', 'COLD COFFEE', 'MASALA CHAI', 'VADA PAV']
[]
[1, 3, 5]</div>
  <p>Printing <code>names</code> shows <code>&lt;map object at 0x…&gt;</code> (the hexadecimal number is a memory address and changes every run), not a list: nothing has been computed yet. <code>list(names)</code> asks for every result, so the upper-cased item names appear. The second <code>list(names)</code> gives <code>[]</code>, with no error, because the map object had already handed out everything it had. This silent emptiness is the most common surprise with <code>map</code> and <code>filter</code>; if you need the results more than once, turn them into a list first. The <code>filter</code> line keeps orders worth 60 or more, which are orders 1, 3 and 5.</p>
  <p>Python also has a second way to write both jobs: the <strong>list comprehension</strong>, <code>[expression for item in items if condition]</code>, which you have probably used already. Here are the same jobs written both ways, side by side:</p>
  <div class="fx" data-lang="py"># the same jobs written both ways
print(list(map(lambda o: o["qty"] * o["price"], orders)))
print([o["qty"] * o["price"] for o in orders])

print(list(map(amount, filter(lambda o: o["item"] == "masala chai", orders))))
print([amount(o) for o in orders if o["item"] == "masala chai"])

print(list(map(int, "30 15 90".split())))        # an existing function: map reads well
print(list(map(lambda q, p: q * p, [2, 3], [30, 15])))   # two inputs side by side
print(list(filter(None, ["chai", "", "samosa", None, 0])))  # None means "keep truthy"</div>
  <div class="fx" data-lang="text">[60, 45, 90, 30, 80]
[60, 45, 90, 30, 80]
[60, 30]
[60, 30]
[30, 15, 90]
[60, 45]
['chai', 'samosa']</div>
  <p>Each pair prints the same result, so the question is only which reads better. When you would need a <code>lambda</code> to use <code>map</code> or <code>filter</code>, the comprehension almost always wins: <code>[o["qty"] * o["price"] for o in orders]</code> says what it does in one go, while the <code>map</code> version makes you read a lambda first. The second pair makes this even clearer: transforming <em>and</em> filtering with <code>map</code> and <code>filter</code> nests one inside the other, while the comprehension has a natural "for … if …" shape. On the other hand, when the function already exists, <code>map</code> is short and clear: <code>map(int, "30 15 90".split())</code> turns text into numbers without any extra syntax. <code>map</code> can also walk several lists at once, passing one item from each to the function, and <code>filter(None, items)</code> keeps only the truthy items, dropping empty strings, <code>None</code> and zero.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Clearer choice</th></tr>
    <tr><td>Apply a function that already exists</td><td><code>map(int, tokens)</code>, <code>map(str.strip, lines)</code></td></tr>
    <tr><td>You would need a lambda</td><td>comprehension: <code>[o["qty"] * 2 for o in orders]</code></td></tr>
    <tr><td>Transform and filter together</td><td>comprehension: <code>[f(x) for x in xs if test(x)]</code></td></tr>
    <tr><td>Huge or streamed data, used once</td><td>generator expression <code>(f(x) for x in xs)</code> or <code>map</code>, both lazy</td></tr>
  </table>
  <p>Speed is rarely a reason to choose. <code>map</code> with a built-in function written in C, like <code>int</code>, is slightly faster than a comprehension; <code>map</code> with a lambda is usually slightly slower, because it calls a Python function for every item. In everyday code the difference is too small to matter, so choose for readability. How lazy iterators work underneath is the subject of <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>.</p>

  <h2 id="pa-reduce"><span class="num">04</span>reduce, any and all</h2>
  <p><code>map</code> turns five orders into five amounts. Often, though, we want to go one step further and squash many values into a single answer: the day's total, the biggest order, "is any order over ₹85?". The general tool for this is <strong><code>functools.reduce</code></strong>, which <em>folds</em> a list into one value. It keeps a running result, called the <strong>accumulator</strong>, and for each item it replaces the accumulator with <code>func(accumulator, item)</code>. Think of a cashier counting a pile of notes: they hold the running total in their head and add one note at a time until one number is left.</p>
  <div class="fx" data-lang="py">from functools import reduce

amounts = [amount(o) for o in orders]
print(amounts)

total = 0
for a in amounts:                # the loop that reduce packages up
    total = total + a
print(total)

print(reduce(lambda acc, a: acc + a, amounts))       # ((((60+45)+90)+30)+80)
print(reduce(lambda acc, a: acc + a, amounts, 0))    # same, with a starting value
print(reduce(lambda acc, a: acc + a, [], 0))         # empty input: the start value
try:
    reduce(lambda acc, a: acc + a, [])
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">[60, 45, 90, 30, 80]
305
305
305
0
TypeError: reduce() of empty iterable with no initial value</div>
  <p>The plain loop shows the pattern <code>reduce</code> packages up: start somewhere, combine with each item, end with one value. <code>reduce(lambda acc, a: acc + a, amounts)</code> does exactly that. Without a starting value it uses the first item as the accumulator, so the steps are 60 + 45 = 105, then 105 + 90 = 195, then 225, then 305. The third argument is the starting value. It matters when the list might be empty: with a start of 0, an empty list simply returns 0, but without one, <code>reduce</code> has nothing to start from and raises <code>TypeError</code>. So when the input could ever be empty, always give a starting value.</p>
  <p><code>reduce</code> was a built-in in Python 2, but in Python 3 it was moved into <code>functools</code>, because most uses of it are clearer with a dedicated built-in. Adding things up is so common that it has its own function, and so do several other folds:</p>
  <div class="fx" data-lang="py">amounts = [amount(o) for o in orders]
print(sum(amounts), max(amounts), min(amounts))
print(any(a &gt; 85 for a in amounts))      # is there at least one order above 85?
print(all(a &gt; 25 for a in amounts))      # is every order above 25?
print(any([]), all([]))                  # empty input</div>
  <div class="fx" data-lang="text">305 90 30
True
True
False True</div>
  <p><code>sum</code>, <code>max</code> and <code>min</code> are reductions with names that say what they do. <code>any</code> asks "is at least one of these true?" and <code>all</code> asks "are all of them true?": there is an order above 85 (the cold coffee), and every order is above 25. The last line is worth memorising. <code>any([])</code> is <code>False</code> because there is no true item, but <code>all([])</code> is <code>True</code>, because there is no item that breaks the rule. This is called <strong>vacuous truth</strong>, and it means a check like <code>all(order_is_valid(o) for o in orders)</code> passes when there are no orders at all. If an empty input is an error in your program, check for it separately. The rule of thumb is: reach for <code>sum</code>, <code>max</code>, <code>min</code>, <code>any</code>, <code>all</code>, <code>math.prod</code> or <code>"".join</code> first, and use <code>reduce</code> only when no built-in fits, for example combining a list of sets with a named function.</p>
  <p><code>any</code> and <code>all</code> have one more useful property: they <strong>short-circuit</strong>, which means they stop as soon as the answer is known. <code>any</code> stops at the first true item; <code>all</code> stops at the first false one. But this only saves work if the items are produced one at a time:</p>
  <div class="fx" data-lang="py">def is_big(o):
    print("  checking order", o["id"])
    return amount(o) &gt;= 60

print(any(is_big(o) for o in orders))    # generator: stops at the first True
print(any([is_big(o) for o in orders]))  # list: checks every order first</div>
  <div class="fx" data-lang="text">  checking order 1
True
  checking order 1
  checking order 2
  checking order 3
  checking order 4
  checking order 5
True</div>
  <p>With a generator expression (round brackets, or no brackets inside a call), <code>any</code> asked for order 1, found it was big, and stopped; orders 2 to 5 were never checked. With a list comprehension (square brackets), Python built the whole list first, checking all five orders, and only then handed it to <code>any</code>. When the check is expensive, such as a database lookup, that difference matters.</p>

  <h2 id="pa-key"><span class="num">05</span>Key Functions</h2>
  <p>Sorting orders by amount is a very common need, but Python cannot know what "bigger" means for a dictionary; comparing two dictionaries with <code>&lt;</code> is an error. Older languages solved this with comparison functions that take two items and say which comes first. Python uses a simpler idea: a <strong>key function</strong>. You pass <code>sorted</code> a function that turns each item into a value Python <em>can</em> compare, such as a number or a string, and Python sorts the items by those values. The key function is called once per item.</p>
  <p>Think of a teacher arranging students by height. The teacher does not compare students two at a time; they measure each student once, write the height on a card, and sort by the cards. The key function is the measuring tape. <code>sorted</code>, <code>list.sort</code>, <code>min</code>, <code>max</code>, <code>heapq.nlargest</code> and <code>itertools.groupby</code> all accept one.</p>
  <div class="fx" data-lang="py">print([o["id"] for o in sorted(orders, key=amount)])                 # cheapest first
print([o["id"] for o in sorted(orders, key=amount, reverse=True)])   # biggest first
print(max(orders, key=amount)["item"], min(orders, key=amount)["item"])

items = ["samosa", "Vada pav", "masala chai", "cold coffee"]
print(sorted(items))                     # capital letters sort before small ones
print(sorted(items, key=str.lower))      # case-insensitive
print(sorted(items, key=len))            # by length</div>
  <div class="fx" data-lang="text">[4, 2, 1, 5, 3]
[3, 5, 1, 2, 4]
cold coffee masala chai
['Vada pav', 'cold coffee', 'masala chai', 'samosa']
['cold coffee', 'masala chai', 'samosa', 'Vada pav']
['samosa', 'Vada pav', 'masala chai', 'cold coffee']</div>
  <p>Passing <code>key=amount</code> sorts the orders by their amount, giving ids 4, 2, 1, 5, 3 (₹30 up to ₹90); <code>reverse=True</code> flips it. <code>max</code> and <code>min</code> take a key too, so the most expensive order is the cold coffee and the cheapest is a masala chai, without sorting anything. The item names show why keys are useful even for strings: by default capital letters sort before lowercase ones, so "Vada pav" jumps to the front. <code>key=str.lower</code> compares lowercased copies instead, and <code>key=len</code> sorts by length. Notice that we passed the existing functions <code>amount</code>, <code>str.lower</code> and <code>len</code> directly; no lambda was needed.</p>
  <p>Two more questions come up in practice: how to sort by more than one column, and what happens to ties.</p>
  <div class="fx" data-lang="py"># item A to Z, and within the same item, bigger amount first
for o in sorted(orders, key=lambda o: (o["item"], -amount(o))):
    print(o["item"], amount(o))

# stability: orders with equal qty keep their original order (ids 3 and 4 both have qty 1)
print([o["id"] for o in sorted(orders, key=lambda o: o["qty"])])

sold = {"masala chai": 3, "samosa": 3, "cold coffee": 1, "vada pav": 4}
print(max(sold, key=sold.get))           # the key with the biggest value
print(max([], default=None))             # empty input without an error</div>
  <div class="fx" data-lang="text">cold coffee 90
masala chai 60
masala chai 30
samosa 45
vada pav 80
[3, 4, 1, 2, 5]
vada pav
None</div>
  <p>For several columns, return a <strong>tuple</strong> from the key. Python compares tuples element by element, so <code>(o["item"], -amount(o))</code> sorts by item name first, and only when two names are equal does it look at the second element. Making the amount negative reverses that column alone, which is why the ₹60 masala chai comes before the ₹30 one. (For a text column you want reversed, negation does not work; instead sort twice, by the secondary key first and then by the primary key with <code>reverse=True</code>.)</p>
  <p>That trick relies on the fact that Python's sort is <strong>stable</strong>: items whose keys are equal keep their original order. Orders 3 and 4 both have a quantity of 1, and after sorting by quantity, 3 is still before 4, exactly as in the original list. Finally, <code>max(sold, key=sold.get)</code> is a well-known idiom for "the dictionary key with the biggest value" (vada pav, with 4 sold), and <code>max([], default=None)</code> shows how to avoid the <code>ValueError</code> that <code>max</code> raises on an empty list.</p>
  <p>One thing to remember about <code>list.sort()</code>: it sorts the list in place and returns <code>None</code>. <code>sorted(xs)</code> returns a new list. Mixing them up is a classic bug, shown in the Common Mistakes section.</p>

  <h2 id="pa-operator"><span class="num">06</span>The operator Module</h2>
  <p>After a while you notice that the same few lambdas appear everywhere: <code>lambda o: o["price"]</code>, <code>lambda o: o.qty</code>, <code>lambda s: s.strip()</code>, <code>lambda a, b: a + b</code>. The <strong><code>operator</code></strong> module provides ready-made versions of these. They are written in C, so they are slightly faster than lambdas, they have clear names, and unlike lambdas they can be pickled and sent to other processes.</p>
  <p>The three most useful are <em>factories</em>: functions that build small functions for you. <code>itemgetter("price")</code> builds a function that does <code>o["price"]</code>; <code>attrgetter("qty")</code> builds one that does <code>o.qty</code>; <code>methodcaller("strip")</code> builds one that does <code>s.strip()</code>.</p>
  <div class="fx" data-lang="py">from operator import itemgetter

get_item = itemgetter("item")            # builds: lambda o: o["item"]
print(get_item(orders[0]))
print([o["id"] for o in sorted(orders, key=itemgetter("price"))])
print(sorted(orders, key=itemgetter("item", "qty"))[0])   # two fields -&gt; a tuple key
print(itemgetter("item", "qty")(orders[1]))
print(itemgetter(0, 2)(["chai", "samosa", "coffee"]))</div>
  <div class="fx" data-lang="text">masala chai
[2, 5, 1, 4, 3]
{'id': 3, 'item': 'cold coffee', 'qty': 1, 'price': 90}
('samosa', 3)
('chai', 'coffee')</div>
  <p><code>get_item = itemgetter("item")</code> made a function, and calling it on the first order returned <code>"masala chai"</code>. Passed as a key, <code>itemgetter("price")</code> sorts the orders by price. With two field names, the function returns a <em>tuple</em>, so <code>itemgetter("item", "qty")</code> gives a two-column sort key and, applied to order 2, returns <code>('samosa', 3)</code>. It works with list positions too: <code>itemgetter(0, 2)</code> picks items 0 and 2. Be aware of that one-versus-many difference: with one argument you get a single value, with two or more you get a tuple.</p>
  <p>When your records are objects rather than dictionaries, <code>attrgetter</code> reads attributes, and <code>methodcaller</code> calls a method on each item, optionally with arguments:</p>
  <div class="fx" data-lang="py">from operator import attrgetter, methodcaller
from dataclasses import dataclass

@dataclass
class Order:
    item: str
    qty: int
    price: int

day = [Order(o["item"], o["qty"], o["price"]) for o in orders]
print(max(day, key=attrgetter("qty")))            # builds: lambda o: o.qty

raw = ["  Masala Chai ", "SAMOSA  ", " cold coffee"]
print(list(map(methodcaller("strip"), raw)))      # builds: lambda s: s.strip()
print(list(map(methodcaller("split", ","), ["2,30", "3,15"])))</div>
  <div class="fx" data-lang="text">Order(item='vada pav', qty=4, price=20)
['Masala Chai', 'SAMOSA', 'cold coffee']
[['2', '30'], ['3', '15']]</div>
  <p>Here each order became a small <code>Order</code> dataclass, and <code>attrgetter("qty")</code> found the one with the largest <code>qty</code>. <code>methodcaller("strip")</code> trimmed spaces from each raw string, and <code>methodcaller("split", ",")</code> called <code>.split(",")</code> on each one.</p>
  <p>The module also contains a plain function for every operator: <code>operator.add(a, b)</code> is <code>a + b</code>, <code>operator.mul</code> is <code>*</code>, <code>operator.or_</code> is <code>|</code>, <code>operator.neg</code> is unary minus. They are handy wherever a two-argument function is expected:</p>
  <div class="fx" data-lang="py">import operator
from functools import reduce

print(operator.add(60, 45), operator.mul(3, 15), operator.neg(10))
print(reduce(operator.add, [amount(o) for o in orders], 0))
print(list(map(operator.mul, [2, 3, 1], [30, 15, 90])))       # qty x price, pairwise
print(sorted(reduce(operator.or_, [{"chai"}, {"samosa"}, {"chai", "vada pav"}])))   # union of sets</div>
  <div class="fx" data-lang="text">105 45 -10
305
[60, 45, 90]
['chai', 'samosa', 'vada pav']</div>
  <p><code>reduce(operator.add, ...)</code> reads more cleanly than the lambda version and gives the same 305. <code>map(operator.mul, quantities, prices)</code> multiplies two lists item by item, and <code>reduce(operator.or_, ...)</code> joins a list of sets into one (wrapped in <code>sorted</code> here only so the printed order is predictable).</p>

  <h2 id="pa-partial"><span class="num">07</span>functools.partial</h2>
  <p>Suppose we have a general function <code>price_with_tax(amount, rate)</code>, but the code that will call it, such as <code>map</code>, only passes one argument. We need a version of the function with the rate already filled in. We could write a new <code>def</code> or a lambda, but Python has a tool built exactly for this: <strong><code>functools.partial(func, ...)</code></strong> returns a new function that calls <code>func</code> with some arguments already supplied. The word "partial" refers to partially applying the arguments now and the rest later.</p>
  <p>It is like a pre-filled form. The bank gives you a deposit slip with the branch and account number already printed, so all you have to write is the amount. <code>partial</code> prints part of the form in advance.</p>
  <div class="fx" data-lang="py">from functools import partial

def price_with_tax(amount, rate):
    return round(amount * (1 + rate), 2)

with_gst = partial(price_with_tax, rate=0.05)    # rate is frozen at 0.05
with_service = partial(price_with_tax, rate=0.10)
print(with_gst(305), with_service(305))
print(list(map(with_gst, [amount(o) for o in orders])))
print(with_gst.func.__name__, with_gst.args, with_gst.keywords)

parse_binary = partial(int, base=2)              # works on built-ins too
print(parse_binary("101"))</div>
  <div class="fx" data-lang="text">320.25 335.5
[63.0, 47.25, 94.5, 31.5, 84.0]
price_with_tax () {'rate': 0.05}
5</div>
  <p><code>partial(price_with_tax, rate=0.05)</code> returned a new callable, <code>with_gst</code>, that needs only the amount. The day's ₹305 becomes 320.25 with GST and 335.5 with a 10% service charge. Because <code>with_gst</code> takes a single argument, it fits straight into <code>map</code>. A partial object is also easy to inspect: <code>.func</code> is the original function, <code>.args</code> the fixed positional arguments and <code>.keywords</code> the fixed keyword arguments. It works with built-ins as well; <code>partial(int, base=2)</code> is a function that reads binary numbers.</p>
  <p>Positional arguments given to <code>partial</code> fill parameters from the left, so <code>partial(price_with_tax, 100)</code> would fix <code>amount</code>, not <code>rate</code>. To fix a later parameter, use its keyword, as we did.</p>
  <p>The difference between <code>partial</code> and a lambda becomes important inside loops. Imagine building a list of small functions, one per token number:</p>
  <div class="fx" data-lang="py">from functools import partial

def announce(token):
    return f"token {token} ready"

later = [lambda: announce(t) for t in range(1, 4)]          # lambdas read t later
frozen = [partial(announce, t) for t in range(1, 4)]       # partial freezes t now
print([f() for f in later])
print([f() for f in frozen])</div>
  <div class="fx" data-lang="text">['token 3 ready', 'token 3 ready', 'token 3 ready']
['token 1 ready', 'token 2 ready', 'token 3 ready']</div>
  <p>The lambdas all said "token 3". Each lambda does not store the value of <code>t</code>; it stores a reference to the <em>variable</em> <code>t</code> and reads it when it is called. By the time we call them, the loop has finished and <code>t</code> is 3. This is called <strong>late binding</strong>. <code>partial(announce, t)</code> evaluates <code>t</code> immediately and stores the value, so each function keeps its own token number. (Closures and late binding are explained in depth in <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>.) For methods inside a class, <code>functools.partialmethod</code> does the same job.</p>

  <h2 id="pa-cache"><span class="num">08</span>Memoisation: lru_cache and cache</h2>
  <p>Imagine that the price of each item has to be fetched from a slow menu server, taking 0.05 seconds per request, and the prices do not change during the day. Over a week of 100 orders, the program asks for the same four prices again and again:</p>
  <div class="fx" data-lang="py">import time

def menu_price(item):
    time.sleep(0.05)                     # pretend: a slow call to the menu server
    return {"masala chai": 30, "samosa": 15, "cold coffee": 90, "vada pav": 20}[item]

week = [o["item"] for o in orders] * 20  # 100 orders across the week
t = time.perf_counter()
total = sum(menu_price(i) for i in week)
print(f"{len(week)} lookups, {time.perf_counter() - t:.1f}s, total {total}")</div>
  <div class="fx" data-lang="text">100 lookups, 5.0s, total 3700</div>
  <p>One hundred lookups took about 5 seconds (timings on this page are approximate and will differ on your machine), even though there are only four different items. We are paying for the same answer twenty-five times. The fix is to remember each answer the first time it is computed and hand back the remembered answer after that. This technique is called <strong>memoisation</strong> (from "memo", a note to yourself). A waiter who has been asked "how much is a samosa?" once does not walk to the kitchen to check every time; they remember.</p>
  <p>Python provides memoisation as a decorator, <strong><code>functools.lru_cache</code></strong>. A decorator is a line starting with <code>@</code> placed above a function to add behaviour to it (see <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>). <code>lru_cache</code> keeps a dictionary that maps each set of arguments to the result. When the function is called, it first checks the dictionary: if the arguments are there (a <strong>hit</strong>), it returns the stored result without running the function; if not (a <strong>miss</strong>), it runs the function and stores the result.</p>
  <div class="fx" data-lang="py">import time
from functools import lru_cache

calls = 0

@lru_cache(maxsize=128)
def menu_price(item):
    global calls
    calls += 1
    time.sleep(0.05)                     # pretend: a slow call to the menu server
    return {"masala chai": 30, "samosa": 15, "cold coffee": 90, "vada pav": 20}[item]

week = [o["item"] for o in orders] * 20
t = time.perf_counter()
total = sum(menu_price(i) for i in week)
print(f"{len(week)} lookups, {calls} real calls, {time.perf_counter() - t:.1f}s, total {total}")
print(menu_price.cache_info())
menu_price.cache_clear()
print(menu_price.cache_info())</div>
  <div class="fx" data-lang="text">100 lookups, 4 real calls, 0.2s, total 3700
CacheInfo(hits=96, misses=4, maxsize=128, currsize=4)
CacheInfo(hits=0, misses=0, maxsize=128, currsize=0)</div>
  <p>The same 100 lookups now make only 4 real calls, one per distinct item, and take about 0.2 seconds. <code>cache_info()</code> confirms it: 4 misses and 96 hits, with 4 entries currently stored. Checking <code>cache_info()</code> on a real system is a good habit: if the hit count is low, the cache is using memory without saving any time. <code>cache_clear()</code> empties it, which is how you would force fresh prices the next morning.</p>
  <p>The "LRU" in the name stands for <strong>least recently used</strong>. <code>maxsize</code> sets how many results to keep (128 by default). When the cache is full and a new result arrives, the entry that has gone unused for the longest time is thrown away to make room:</p>
  <div class="fx" data-lang="py">from functools import lru_cache, cache

@lru_cache(maxsize=2)                    # room for only two results
def price(item):
    return {"chai": 30, "samosa": 15, "coffee": 90}[item]

for item in ["chai", "samosa", "chai", "coffee", "samosa"]:
    price(item)                          # miss, miss, hit, miss (evicts samosa), miss
print(price.cache_info())

@cache                                   # Python 3.9+: lru_cache(maxsize=None)
def basket_total(prices):
    return sum(prices)

print(basket_total((30, 15)), basket_total((30, 15)), basket_total.cache_info())
try:
    basket_total([30, 15])               # a list cannot be a dict key
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">CacheInfo(hits=1, misses=4, maxsize=2, currsize=2)
45 45 CacheInfo(hits=1, misses=1, maxsize=None, currsize=1)
TypeError: unhashable type: 'list'</div>
  <p>With room for only two results, the sequence goes: chai is a miss, samosa a miss, chai a hit, coffee a miss that pushes out samosa (the least recently used), and samosa is then a miss again. That gives 1 hit and 4 misses. <code>functools.cache</code>, added in Python 3.9, is simply <code>lru_cache(maxsize=None)</code>: it never throws anything away and is slightly faster, but it can grow without limit.</p>
  <p>The second half of that example shows the biggest restriction. The arguments become dictionary keys, so they must be <strong>hashable</strong>: values that cannot change, like numbers, strings and tuples. Calling with the tuple <code>(30, 15)</code> works and the second call is a hit, but calling with a list raises <code>TypeError: unhashable type: 'list'</code>. The usual fix is to convert lists to tuples before calling.</p>
  <p>Memoisation can turn a hopelessly slow algorithm into a fast one. The classic example is the recursive Fibonacci function, which recomputes the same smaller values over and over:</p>
  <div class="fx" data-lang="py">import time
from functools import cache

def fib_slow(n):
    return n if n &lt; 2 else fib_slow(n - 1) + fib_slow(n - 2)

@cache
def fib(n):
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)

t = time.perf_counter(); fib_slow(30); print(f"plain fib(30):  {time.perf_counter() - t:.3f}s")
t = time.perf_counter(); fib(30);      print(f"cached fib(30): {time.perf_counter() - t:.5f}s")
print(fib.cache_info())</div>
  <div class="fx" data-lang="text">plain fib(30):  0.084s
cached fib(30): 0.00003s
CacheInfo(hits=28, misses=31, maxsize=None, currsize=31)</div>
  <p>Without the cache, <code>fib_slow(30)</code> makes about 2.7 million calls. With <code>@cache</code>, each value from 0 to 30 is computed once (31 misses), and every repeated request is a hit (28 hits). The run time drops from a noticeable fraction of a second to a few microseconds.</p>
  <p>A cache is only correct under certain conditions, and these are a favourite interview topic:</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Why</th></tr>
    <tr><td>All arguments must be hashable</td><td>they form a dictionary key; use tuples, not lists or dicts</td></tr>
    <tr><td>The function should be pure</td><td>if the result depends on the time, randomness, a file or a database, the cache returns stale answers</td></tr>
    <tr><td>Do not change a returned object</td><td>every later caller receives the <em>same</em> object from the cache</td></tr>
    <tr><td>Set <code>maxsize</code> when inputs are unlimited</td><td><code>cache</code> / <code>maxsize=None</code> grows forever</td></tr>
    <tr><td>Avoid on instance methods</td><td><code>self</code> becomes part of the key, so the cache keeps every object alive; use <code>functools.cached_property</code> instead</td></tr>
    <tr><td><code>f(1)</code> and <code>f(x=1)</code> are cached separately</td><td>the key is built from how arguments were passed; <code>typed=True</code> also separates <code>1</code> and <code>1.0</code></td></tr>
  </table>

  <h2 id="pa-dispatch"><span class="num">09</span>singledispatch and total_ordering</h2>
  <p>Chai Corner prints receipts, and values on a receipt come in different types: whole rupees as <code>int</code>, exact amounts as <code>Decimal</code>, flags as <code>bool</code>, and lists of amounts. A function that formats any of them usually turns into a chain of <code>isinstance</code> checks:</p>
  <div class="fx" data-lang="py">from decimal import Decimal

def receipt_value(value):                # the isinstance chain
    if isinstance(value, bool):
        return "yes" if value else "no"
    elif isinstance(value, int):
        return f"Rs {value}"
    elif isinstance(value, Decimal):
        return f"Rs {value:.2f}"
    elif isinstance(value, list):
        return ", ".join(receipt_value(v) for v in value)
    else:
        raise TypeError(f"cannot print {type(value).__name__}")

print(receipt_value(305), "|", receipt_value(Decimal("320.25")), "|", receipt_value([60, True]))</div>
  <div class="fx" data-lang="text">Rs 305 | Rs 320.25 | Rs 60, yes</div>
  <p>It works, but every new type means editing this function, and the order of the checks is fragile: the <code>bool</code> check has to come before the <code>int</code> check, because in Python <code>bool</code> is a subclass of <code>int</code> and <code>True</code> would otherwise be printed as "Rs True".</p>
  <p><strong><code>functools.singledispatch</code></strong> replaces the chain. It turns a function into a <strong>generic function</strong>: one name with several implementations, where Python picks the implementation from the type of the <em>first</em> argument. Think of a post office counter with separate windows for letters, parcels and money orders. You go to "the post office" either way, and the clerk sends you to the right window based on what you are holding.</p>
  <div class="fx" data-lang="py">from functools import singledispatch
from decimal import Decimal

@singledispatch
def receipt_value(value):                # fallback for types nobody registered
    raise TypeError(f"cannot print {type(value).__name__}")

@receipt_value.register
def _(value: int):                       # chosen when the first argument is an int
    return f"Rs {value}"

@receipt_value.register
def _(value: Decimal):
    return f"Rs {value:.2f}"

@receipt_value.register(list)            # the type can also be given here
def _(value):
    return ", ".join(receipt_value(v) for v in value)

print(receipt_value(305))
print(receipt_value(Decimal("320.25")))
print(receipt_value([60, 45, True]))     # True is a bool, and bool is a kind of int

@receipt_value.register
def _(value: bool):                      # a more specific type wins over int
    return "yes" if value else "no"

print(receipt_value([60, 45, True]))
try:
    receipt_value(3.5)
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">Rs 305
Rs 320.25
Rs 60, Rs 45, Rs True
Rs 60, Rs 45, yes
TypeError: cannot print float</div>
  <p>The undecorated <code>receipt_value</code> is the fallback, used for any type that has no registered implementation; here it raises an error, which is what happened for the float 3.5. Each <code>@receipt_value.register</code> adds one implementation, and the type comes from the parameter's annotation (<code>value: int</code>) or from the argument to <code>register</code>, as with <code>list</code>. The implementations are named <code>_</code> because we never call them directly. The list version calls <code>receipt_value</code> again for each element, and each element is dispatched separately.</p>
  <p>Look at the third and fourth lines of output. Before a <code>bool</code> implementation existed, <code>True</code> was printed as "Rs True": dispatch follows the class hierarchy, and since <code>bool</code> is a kind of <code>int</code>, the <code>int</code> implementation was the closest match. After registering <code>bool</code>, the more specific implementation wins and it prints "yes". New types can be registered from anywhere, even another module, without touching the original function. For methods inside a class, <code>functools.singledispatchmethod</code> dispatches on the first argument after <code>self</code>.</p>
  <p>The other <code>functools</code> tool in this family helps with comparisons. To make objects sortable, a class needs comparison methods such as <code>__lt__</code> for <code>&lt;</code> (these special methods are covered in <a class="xref" data-note="py_dunder">Dunder Methods</a>). Writing all six, <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> and <code>&gt;=</code>, is repetitive and easy to get inconsistent. <strong><code>functools.total_ordering</code></strong> is a class decorator: you write <code>__eq__</code> and one ordering method, and it fills in the rest. Here it orders the stall's queue tokens, with rush tokens first:</p>
  <div class="fx" data-lang="py">from functools import total_ordering

@total_ordering
class Token:
    def __init__(self, number, rush=False):
        self.number, self.rush = number, rush
    def _key(self):
        return (not self.rush, self.number)   # rush tokens first, then by number
    def __eq__(self, other):
        return self._key() == other._key()
    def __lt__(self, other):
        return self._key() &lt; other._key()
    def __repr__(self):
        return f"T{self.number}{'!' if self.rush else ''}"

a, b = Token(7), Token(9, rush=True)
print(b &lt; a, b &lt;= a, a &gt; b, a &gt;= b)           # &lt;=, &gt; and &gt;= were filled in
print(sorted([Token(3), Token(9, rush=True), Token(1), Token(5, rush=True)]))</div>
  <div class="fx" data-lang="text">True True True True
[T5!, T9!, T1, T3]</div>
  <p>The class defines only <code>__eq__</code> and <code>__lt__</code>, yet <code>&lt;=</code>, <code>&gt;</code> and <code>&gt;=</code> all work, because <code>total_ordering</code> derived them from those two. <code>sorted</code> uses <code>&lt;</code>, so the rush tokens 5 and 9 come first, followed by 1 and 3. The generated methods are a little slower than hand-written ones; for simple records, <code>@dataclass(order=True)</code> generates all comparisons from the fields instead.</p>

  <h2 id="pa-pure"><span class="num">10</span>Pure Functions and Immutability</h2>
  <p>All the tools on this page work best with a certain kind of function. Here are two ways to add GST to a list of amounts:</p>
  <div class="fx" data-lang="py">def add_gst_impure(amounts):
    for i in range(len(amounts)):
        amounts[i] = round(amounts[i] * 1.05, 2)   # changes the caller's list
    return amounts

def add_gst_pure(amounts):
    return [round(a * 1.05, 2) for a in amounts]  # a new list; input untouched

day = [60, 45, 90]
print(add_gst_pure(day), day)
print(add_gst_impure(day), day)
print(add_gst_impure(day), day)          # called again: taxed twice</div>
  <div class="fx" data-lang="text">[63.0, 47.25, 94.5] [60, 45, 90]
[63.0, 47.25, 94.5] [63.0, 47.25, 94.5]
[66.15, 49.61, 99.23] [66.15, 49.61, 99.23]</div>
  <p>Both return the same first answer. But <code>add_gst_impure</code> also changed the caller's list <code>day</code>, which nobody asked it to do. Call it a second time and the amounts are taxed again (66.15 instead of 63.0), because the function's result depends on what happened before. <code>add_gst_pure</code> builds and returns a new list and leaves <code>day</code> exactly as it was, so you can call it as often as you like.</p>
  <p>A <strong>pure function</strong> is one whose result depends only on its arguments and which has no <strong>side effects</strong>: it does not change its inputs, global variables, files or databases, and it does not print or make network calls. A calculator key is pure: pressing "√" on 16 always shows 4 and changes nothing else. A vending machine is not: what you get depends on its stock, and each purchase changes that stock.</p>
  <p>Pure functions are easier in almost every way. Testing one needs no setup: give an input, check the output. They are safe to cache, because the same arguments always give the same answer, which is exactly the condition <code>lru_cache</code> needs. They are safe to run in parallel, because they share nothing, and safe to retry after a failure, because running twice does no harm. Real programs must have side effects (reading orders, writing reports), so the usual design is to keep a core of pure transformation functions and push the reading and writing to the edges of the program.</p>
  <p>You can make the "do not change it" rule stronger by using <strong>immutable</strong> data, values that cannot be changed after they are created. Python offers <code>tuple</code> instead of <code>list</code>, <code>frozenset</code> instead of <code>set</code>, <code>types.MappingProxyType</code> for a read-only view of a dictionary, and frozen dataclasses for records:</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass, replace, FrozenInstanceError

@dataclass(frozen=True)
class Order:
    item: str
    qty: int
    price: int

o = Order("samosa", 3, 15)
bigger = replace(o, qty=5)               # a modified copy; o is unchanged
print(o, bigger)
try:
    o.qty = 10
except FrozenInstanceError as e:
    print("FrozenInstanceError:", e)
print(hash(o) == hash(Order("samosa", 3, 15)))   # hashable, so usable as a cache key

menu = ("chai", "samosa")
try:
    menu[0] = "coffee"
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">Order(item='samosa', qty=3, price=15) Order(item='samosa', qty=5, price=15)
FrozenInstanceError: cannot assign to field 'qty'
True
TypeError: 'tuple' object does not support item assignment</div>
  <p>A frozen dataclass refuses assignment with <code>FrozenInstanceError</code>. To "change" it you create a modified copy with <code>dataclasses.replace</code>, and the original stays as it was. Because it cannot change, it is also hashable, so it can be used as a dictionary key or as an argument to a cached function. A tuple likewise refuses item assignment.</p>
  <p>Keep in mind that immutability in Python is <strong>shallow</strong>. A tuple that contains a list, such as <code>(["chai"], 30)</code>, cannot have its slots reassigned, but the list inside can still be appended to, and such a tuple cannot be hashed. A frozen dataclass with a list field has the same weakness.</p>

  <h2 id="pa-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common mistake when passing functions is adding brackets. With brackets, Python calls the function immediately and passes its <em>result</em> instead of the function:</p>
  <div class="fx" data-lang="py">def apply_to_all(func, orders):
    return [func(o) for o in orders]

try:
    apply_to_all(amount(orders[0]), orders)      # brackets: passes 60, not the function
except TypeError as e:
    print("TypeError:", e)
print(apply_to_all(amount, orders))              # fixed: pass the function itself</div>
  <div class="fx" data-lang="text">TypeError: 'int' object is not callable
[60, 45, 90, 30, 80]</div>
  <p><code>amount(orders[0])</code> ran straight away and produced 60, so <code>apply_to_all</code> received the number 60 and tried to call it: "'int' object is not callable". The same bug appears as <code>Thread(target=work())</code> or <code>sorted(xs, key=len())</code>. Pass the name without brackets.</p>
  <p>The second is reusing a <code>map</code> or <code>filter</code> object. Because they are one-pass iterators, the second use finds nothing, and there is no error to warn you:</p>
  <div class="fx" data-lang="py">big = filter(lambda o: amount(o) &gt;= 60, orders)
print(len(list(big)), "big orders;", sum(amount(o) for o in big), "rupees")   # 2nd use: empty

big = [o for o in orders if amount(o) &gt;= 60]     # fixed: a list can be used many times
print(len(big), "big orders;", sum(amount(o) for o in big), "rupees")</div>
  <div class="fx" data-lang="text">3 big orders; 0 rupees
3 big orders; 230 rupees</div>
  <p>Counting the big orders used up the filter object, so the sum came out as 0 rupees. Storing the results in a list fixes it: 3 big orders worth 230 rupees.</p>
  <p>The third is treating <code>list.sort()</code> as if it returned the sorted list:</p>
  <div class="fx" data-lang="py">ids = [5, 3, 1]
ids = ids.sort()                         # sort() works in place and returns None
print(ids)

ids = [5, 3, 1]
print(sorted(ids), ids)                  # sorted() returns a new list</div>
  <div class="fx" data-lang="text">None
[1, 3, 5] [5, 3, 1]</div>
  <p><code>ids = ids.sort()</code> sorted the list and then replaced it with <code>None</code>, the return value of <code>sort()</code>. Use <code>ids.sort()</code> on its own line, or <code>sorted(ids)</code> when you want a new list and the original unchanged.</p>
  <p>The fourth is caching a function that is not pure. The cache does exactly what it promises, remembering the first answer forever, which is wrong when the answer should change:</p>
  <div class="fx" data-lang="py">import random
from functools import lru_cache

@lru_cache
def todays_special():                    # depends on something other than its arguments
    return random.choice(["chai", "samosa", "vada pav", "cold coffee", "poha", "upma"])

print(len({todays_special() for _ in range(20)}), "different answer(s) in 20 calls")</div>
  <div class="fx" data-lang="text">1 different answer(s) in 20 calls</div>
  <p>"Today's special" is chosen at random, but after the first call the cache returns the same item every time: one answer in 20 calls. A related trap is changing an object that a cached function returned:</p>
  <div class="fx" data-lang="py">from functools import lru_cache

@lru_cache
def popular_items():
    return ["masala chai", "samosa"]

top = popular_items()
top.append("free biscuit")               # changes the cached list itself
print(popular_items())</div>
  <div class="fx" data-lang="text">['masala chai', 'samosa', 'free biscuit']</div>
  <p>The caller appended to the list it got back, and because the cache handed out the <em>same</em> list object, every later call now includes the free biscuit. Return a tuple, or copy the result before changing it.</p>
  <p>A few smaller mistakes are worth knowing by name. Lambdas created in a loop all see the loop variable's final value (use <code>partial</code> or a default argument, <code>lambda t=t: ...</code>). <code>reduce</code> on a possibly empty list without a starting value raises <code>TypeError</code>, and <code>max</code> on an empty list raises <code>ValueError</code> unless you pass <code>default=</code>. Passing a list comprehension to <code>any</code> or <code>all</code> loses the short-circuit. And a lambda cannot be sent to a <code>multiprocessing</code> worker, because it cannot be pickled; use a module-level <code>def</code> or a <code>partial</code> of one.</p>

  <h2 id="pa-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>First-class function</b>: a function is a value; it can be stored, passed, returned and kept in a dict.</li>
    <li><b>Higher-order function</b>: takes and/or returns a function (<code>map</code>, <code>filter</code>, <code>sorted(key=)</code>, <code>partial</code>, decorators).</li>
    <li><b>lambda</b>: <code>lambda args: expr</code>, a nameless one-expression function; result returned automatically.</li>
    <li><b>Key function</b>: called once per item; items are compared by its results.</li>
    <li><b>Memoisation</b>: remembering results by argument so repeated calls are free.</li>
    <li><b>Generic function</b> (<code>singledispatch</code>): implementation chosen by the first argument's type.</li>
    <li><b>Pure function</b>: output depends only on inputs; no side effects.</li>
  </ul>
  <h3>map, filter, reduce vs built-ins</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Returns</th><th>Prefer when</th></tr>
    <tr><td><code>map(f, xs, ...)</code></td><td>lazy iterator, one pass</td><td><code>f</code> already exists: <code>map(int, tokens)</code></td></tr>
    <tr><td><code>filter(test, xs)</code> / <code>filter(None, xs)</code></td><td>lazy iterator</td><td><code>test</code> exists; <code>None</code> keeps truthy items</td></tr>
    <tr><td><code>[f(x) for x in xs if c(x)]</code></td><td>list</td><td>a lambda would be needed; transform + filter</td></tr>
    <tr><td><code>(f(x) for x in xs)</code></td><td>generator</td><td>big data, one pass, short-circuiting</td></tr>
    <tr><td><code>reduce(f, xs, start)</code></td><td>one value</td><td>no built-in fits; always pass <code>start</code></td></tr>
  </table>
  <ul>
    <li>Built-in folds first: <code>sum</code>, <code>max</code>, <code>min</code>, <code>any</code>, <code>all</code>, <code>math.prod</code>, <code>"".join</code>.</li>
    <li><code>any([]) is False</code>, <code>all([]) is True</code>; both short-circuit only with a generator.</li>
  </ul>
  <h3>Sorting and operator</h3>
  <ul>
    <li><code>sorted(xs, key=f, reverse=False)</code>; <code>min/max(xs, key=f, default=...)</code>.</li>
    <li>Several columns: <code>key=lambda o: (o["item"], -o["qty"])</code>. Stable sort: equal keys keep their order.</li>
    <li><code>max(d, key=d.get)</code> → dict key with the largest value. <code>list.sort()</code> returns <code>None</code>.</li>
    <li><code>itemgetter("k")</code> → <code>x["k"]</code>; <code>itemgetter("a", "b")</code> → tuple; <code>attrgetter("a")</code> → <code>x.a</code>; <code>methodcaller("m", arg)</code> → <code>x.m(arg)</code>.</li>
  </ul>
  <h3>functools</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Does</th><th>Remember</th></tr>
    <tr><td><code>partial(f, *a, **kw)</code></td><td>freezes arguments now</td><td>positional fill from the left; <code>.func</code>, <code>.args</code>, <code>.keywords</code>; no late binding</td></tr>
    <tr><td><code>lru_cache(maxsize=128)</code></td><td>memoise, evict least recently used</td><td>hashable args, pure function; <code>cache_info()</code>, <code>cache_clear()</code></td></tr>
    <tr><td><code>cache</code> (3.9+)</td><td><code>lru_cache(maxsize=None)</code></td><td>unbounded memory</td></tr>
    <tr><td><code>cached_property</code></td><td>compute an attribute once per object</td><td>use instead of <code>lru_cache</code> on methods</td></tr>
    <tr><td><code>singledispatch</code></td><td>choose implementation by first arg's type</td><td><code>@f.register</code>; follows class hierarchy (bool → int)</td></tr>
    <tr><td><code>total_ordering</code></td><td>fills in missing comparisons</td><td>write <code>__eq__</code> + one of <code>&lt; &lt;= &gt; &gt;=</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from functools import reduce, partial, lru_cache, singledispatch
from operator import itemgetter

amounts = [o["qty"] * o["price"] for o in orders]   # comprehension
big     = list(filter(lambda o: o["qty"] &gt; 2, orders))
total   = reduce(lambda acc, a: acc + a, amounts, 0)  # or sum(amounts)
ranked  = sorted(orders, key=itemgetter("price"), reverse=True)
round2  = partial(round, ndigits=2)

@lru_cache(maxsize=256)
def menu_price(item): ...

@singledispatch
def show(value): ...
@show.register
def _(value: int): ...</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Pass <code>f</code>, not <code>f()</code>.</li>
    <li><code>map</code>/<code>filter</code> are empty on the second pass.</li>
    <li>Lambdas in a loop see the last value; freeze with <code>partial</code> or <code>t=t</code>.</li>
    <li><code>lru_cache</code>: unhashable args → <code>TypeError</code>; impure → stale; returned mutable objects are shared.</li>
    <li><code>reduce</code> needs a start value for possibly empty input; <code>max</code> needs <code>default=</code>.</li>
    <li>Immutability is shallow; lambdas cannot be pickled.</li>
  </ul>

  <h2 id="pa-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does "functions are first-class objects" mean in Python?</summary><div class="qa-body">A function is an ordinary value: you can assign it to a variable, store it in a list or dict, pass it as an argument and return it from another function. This is what makes <code>key=</code> functions, callbacks, dispatch tables and decorators possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a higher-order function? Give examples from the standard library.</summary><div class="qa-body">A function that takes a function as an argument or returns one. Examples are <code>map</code>, <code>filter</code>, <code>sorted</code>/<code>min</code>/<code>max</code> with <code>key=</code>, <code>functools.reduce</code>, <code>functools.partial</code>, and every decorator, such as <code>functools.lru_cache</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the limitations of <code>lambda</code>?</summary><div class="qa-body">Its body must be a single expression, so no assignments, loops, <code>try</code> or <code>return</code> statements. It has no real name (tracebacks show <code>&lt;lambda&gt;</code>), no docstring, it cannot be pickled (so it fails with <code>multiprocessing</code>), and it reads loop variables late. Use it for short inline keys and callbacks; otherwise use <code>def</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>map</code>/<code>filter</code> or a list comprehension: which do you use?</summary><div class="qa-body">A comprehension when you would need a lambda, or when transforming and filtering together, because it reads more clearly and is as fast or faster. <code>map</code> when applying an existing function, such as <code>map(int, line.split())</code>. Both <code>map</code> and <code>filter</code> return lazy iterators; the lazy form of a comprehension is a generator expression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>m = map(str.upper, ["a", "b"]); print(list(m), list(m))</code></summary><div class="qa-body"><code>['A', 'B'] []</code>. In Python 3, <code>map</code> returns an iterator; the first <code>list()</code> uses it up and the second gets nothing, without any error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>functools.reduce</code> do, and why is it no longer a built-in?</summary><div class="qa-body">It folds an iterable into one value by repeatedly doing <code>acc = f(acc, item)</code>, starting from the initial value or the first item. It was moved to <code>functools</code> in Python 3 because most uses are clearer as a loop or a dedicated built-in like <code>sum</code>, <code>max</code> or <code>any</code>. Without an initial value it raises <code>TypeError</code> on empty input.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>any([])</code> and <code>all([])</code> return, and why does a generator matter with them?</summary><div class="qa-body"><code>any([])</code> is <code>False</code> and <code>all([])</code> is <code>True</code> (there is no item that breaks the rule). Both stop at the first item that decides the answer, but only a generator expression lets them stop early; a list comprehension evaluates every item before <code>any</code> sees the list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you sort a list of dicts by one field descending and another ascending?</summary><div class="qa-body">Return a tuple from the key and negate the numeric field: <code>sorted(rows, key=lambda r: (-r["salary"], r["name"]))</code>. If the descending field is text, use stability: sort by the secondary key first, then sort by the primary key with <code>reverse=True</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python's sort stable, and why does that matter?</summary><div class="qa-body">Yes. <code>sorted</code> and <code>list.sort</code> (Timsort) keep items with equal keys in their original order. That lets you sort by several keys in multiple passes, least important first, and preserves an earlier ordering, such as by time, within ties. Timsort is O(n log n) in the worst case and O(n) on already-sorted data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>itemgetter</code> or <code>attrgetter</code> instead of a lambda?</summary><div class="qa-body">They say what they do by name, are implemented in C so they are slightly faster, can be pickled, and can fetch several fields at once (<code>itemgetter("a", "b")</code> returns a tuple, handy as a multi-column sort key).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>functools.partial</code>, and how does it differ from a lambda?</summary><div class="qa-body"><code>partial(f, *args, **kwargs)</code> returns a callable with some arguments already filled in, such as <code>partial(int, base=2)</code>. Unlike a lambda it stores the values immediately, so there is no late-binding bug in loops; it exposes <code>.func</code>, <code>.args</code> and <code>.keywords</code>; and it can be pickled when <code>f</code> can.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is printed? <code>fs = [lambda x: x * i for i in range(3)]; print([f(10) for f in fs])</code></summary><div class="qa-body"><code>[20, 20, 20]</code>. Each lambda reads <code>i</code> when it is called, after the loop has finished with <code>i == 2</code>. Fix it with a default argument, <code>lambda x, i=i: x * i</code>, or with <code>partial(operator.mul, i)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>lru_cache</code> work, and how do you check that it helps?</summary><div class="qa-body">It wraps the function with a dictionary keyed by the call's arguments, plus a record of how recently each entry was used. A hit returns the stored result; a miss runs the function, stores the result, and evicts the least recently used entry if <code>maxsize</code> is exceeded. <code>f.cache_info()</code> reports hits, misses, maxsize and current size, and <code>f.cache_clear()</code> empties it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might <code>@lru_cache</code> raise <code>TypeError: unhashable type: 'list'</code>?</summary><div class="qa-body">The arguments are used as a dictionary key, so they must be hashable. Lists, dicts, sets and DataFrames are not. Convert them to tuples or frozensets before calling, or cache on a hashable identifier such as a file path or an ID.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use <code>lru_cache</code>?</summary><div class="qa-body">On impure functions whose results depend on time, randomness or changing data, because the answers go stale. Also avoid unbounded caches with many distinct inputs (memory grows forever), functions that return mutable objects callers might change (the object is shared), and instance methods (the cache keeps every <code>self</code> alive; use <code>cached_property</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>lru_cache(maxsize=None)</code> vs <code>functools.cache</code> vs <code>cached_property</code>?</summary><div class="qa-body"><code>cache</code> (Python 3.9+) is exactly <code>lru_cache(maxsize=None)</code>: unbounded and slightly faster because it does no recency bookkeeping. <code>lru_cache(maxsize=N)</code> limits memory. <code>cached_property</code> computes a value once per object and stores it on that object, so it is freed with the object.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>functools.singledispatch</code> used for?</summary><div class="qa-body">Writing one function with different implementations for different types of its first argument, instead of an <code>isinstance</code> chain. You decorate a fallback function, then register implementations with <code>@f.register</code>. Dispatch follows the class hierarchy, so <code>bool</code> uses the <code>int</code> implementation unless <code>bool</code> is registered. For methods, use <code>singledispatchmethod</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@total_ordering</code> do?</summary><div class="qa-body">Given <code>__eq__</code> and one ordering method such as <code>__lt__</code>, it generates the other comparison methods so objects can be fully compared and sorted. The generated methods are a little slower; <code>@dataclass(order=True)</code> is an alternative when ordering by fields.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a pure function, and why does it matter in data pipelines?</summary><div class="qa-body">A function whose output depends only on its inputs and which has no side effects. Pure steps are easy to unit test, safe to cache, safe to retry after a failure and safe to run in parallel. Pipelines usually keep transformations pure and do reading and writing only at the edges.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make data immutable in Python? Is a tuple fully immutable?</summary><div class="qa-body">Use <code>tuple</code>, <code>frozenset</code>, <code>MappingProxyType</code>, <code>NamedTuple</code> or <code>@dataclass(frozen=True)</code>, and create modified copies with <code>dataclasses.replace</code>. Immutability is shallow: a tuple's slots cannot be reassigned, but a list stored inside it can still change, and such a tuple is unhashable.</div></details>
</main>
`
});
