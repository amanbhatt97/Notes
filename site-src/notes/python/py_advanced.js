// notes/python/py_advanced.js — Functional Programming Tools
Object.assign(TOPIC_CONTENT, {
  "py_advanced": `<main>
<h1>Functional Programming Tools</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Functional Programming Tools</span></div>
  <p class="lead">Python functions are objects, so you can pass them into other functions, return them, and store them in dicts. A small toolkit is built on that: <code>map</code>/<code>filter</code>/<code>reduce</code>, <code>key=</code> functions for sorting and ranking, the <code>operator</code> module, and <code>functools</code> (<code>partial</code>, <code>lru_cache</code>, <code>singledispatch</code>). Without these tools you end up writing a near-identical loop each time you sort by a different column, recompute an expensive pure function thousands of times, or grow an <code>isinstance</code> chain that has to be edited whenever a new type turns up. In DS/ML and backend code they show up as sort keys on records, <code>itemgetter</code> on rows, cached feature lookups, configurable callbacks built with <code>partial</code>, and pure transformation steps that are easy to test. Code here was run on Python 3.13.</p>

  <h2 id="pa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Functional Tools</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Functions as values</div>
        <ul>
          <li>First-class: store, pass, return</li>
          <li>Higher-order: takes or returns a function</li>
          <li><code>lambda</code>: one expression, no statements</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transform &amp; reduce</div>
        <ul>
          <li><code>map</code>/<code>filter</code> return lazy one-pass iterators</li>
          <li>Comprehensions usually clearer than map + lambda</li>
          <li><code>functools.reduce(f, xs, init)</code>; prefer <code>sum</code>/<code>max</code>/<code>any</code>/<code>all</code></li>
          <li><code>any</code>/<code>all</code> short-circuit; <code>all([])</code> is True</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Key functions</div>
        <ul>
          <li><code>sorted</code>/<code>min</code>/<code>max</code>(<code>key=</code>)</li>
          <li>Tuple keys for multi-column sorts</li>
          <li>Sort is stable</li>
          <li><code>itemgetter</code>, <code>attrgetter</code>, <code>methodcaller</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">functools</div>
        <ul>
          <li><code>partial</code>: freeze some arguments</li>
          <li><code>lru_cache</code>/<code>cache</code>: memoise; args must be hashable</li>
          <li><code>.cache_info()</code>, <code>.cache_clear()</code></li>
          <li><code>singledispatch</code>: overload on first arg's type</li>
          <li><code>total_ordering</code>: <code>__eq__</code> + one comparison</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Style</div>
        <ul>
          <li>Pure function: output depends only on input, no side effects</li>
          <li>Return new data instead of mutating arguments</li>
          <li>Immutable types: tuple, frozenset, frozen dataclass</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pa-hof"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">First-Class and Higher-Order Functions</span><span class="rm-sub">pass, return and store functions</span></div></div>
      <div class="rm-item rm-done" data-target="pa-mapfilter"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">map, filter and Comprehensions</span><span class="rm-sub">lazy iterators vs list comprehensions</span></div></div>
      <div class="rm-item rm-done" data-target="pa-reduce"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">functools.reduce, any and all</span><span class="rm-sub">folding, initial value, short-circuit</span></div></div>
      <div class="rm-item rm-done" data-target="pa-lambda"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">lambda and Its Limits</span><span class="rm-sub">one expression, when to use def</span></div></div>
      <div class="rm-item rm-done" data-target="pa-key"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Key Functions: sorted, min, max</span><span class="rm-sub">key=, tuple keys, stability</span></div></div>
      <div class="rm-item rm-done" data-target="pa-operator"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The operator Module</span><span class="rm-sub">itemgetter, attrgetter, methodcaller</span></div></div>
      <div class="rm-item rm-done" data-target="pa-partial"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">functools.partial</span><span class="rm-sub">freeze arguments, build callbacks</span></div></div>
      <div class="rm-item rm-done" data-target="pa-cache"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Memoisation: lru_cache and cache</span><span class="rm-sub">cache_info, eviction, hashable args</span></div></div>
      <div class="rm-item rm-done" data-target="pa-dispatch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">singledispatch and total_ordering</span><span class="rm-sub">type-based overloads, comparison methods</span></div></div>
      <div class="rm-item rm-done" data-target="pa-pure"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Pure Functions, Side Effects and Immutability</span><span class="rm-sub">no mutation, frozen dataclasses</span></div></div>
      <div class="rm-item rm-done" data-target="pa-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">exhausted map, stale cache, sort()</span></div></div>
      <div class="rm-item rm-done" data-target="pa-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, rules and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pa-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">map vs comprehension, caching, purity</span></div></div>
    </div>
  </div>

  <h2 id="pa-hof"><span class="num">01</span>First-Class and Higher-Order Functions</h2>
  <p>In Python a function is an ordinary object of type <code>function</code>. A name like <code>apply_discount</code> refers to it, and you call it with <code>apply_discount(...)</code>. Being <strong>first-class</strong> means it can go anywhere a value can: into a variable, a list, a dict, an argument or a return value. A <strong>higher-order function</strong> takes a function as an argument, returns one, or does both. Higher-order functions let you write the loop once and pass in the part that changes.</p>
  <div class="fx" data-lang="py">def apply_discount(price):
    return round(price * 0.9, 2)

def apply_all(func, prices):          # higher-order: takes a function
    return [func(p) for p in prices]

def make_scaler(factor):              # higher-order: returns a function
    def scale(x):
        return x * factor
    return scale

prices = [30, 15, 90]
print(apply_all(apply_discount, prices))
double = make_scaler(2)
print(apply_all(double, prices))
ops = {"discount": apply_discount, "double": double}   # dispatch table
print(ops["double"](45), type(double).__name__, double.__name__)</div>
  <div class="fx" data-lang="text">[27.0, 13.5, 81.0]
[60, 30, 180]
90 function scale</div>
  <p><code>make_scaler</code> returns an inner function that still remembers <code>factor</code> after <code>make_scaler</code> has returned. That inner function is a closure. Closures and the decorators built on them are covered in <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>, and the basics of passing and returning functions in <a class="xref" data-note="py_functions">Functions</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>First-class function</strong>: a function that is a value like any other. <strong>Higher-order function</strong>: one that takes and/or returns functions, for example <code>map</code>, <code>filter</code>, <code>sorted(key=)</code>, <code>functools.partial</code> and every decorator.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Pass the function, not a call to it: <code>apply_all(apply_discount, prices)</code>. Writing <code>apply_all(apply_discount(30), prices)</code> passes the number 27.0, and the call then fails with <code>TypeError: 'float' object is not callable</code>.</p></div>

  <h2 id="pa-mapfilter"><span class="num">02</span>map, filter and Comprehensions</h2>
  <p><code>map(f, xs)</code> applies <code>f</code> to every item and <code>filter(pred, xs)</code> keeps the items for which <code>pred</code> is truthy. In Python 3 both return <strong>lazy iterators</strong>, not lists. Nothing is computed until you consume the iterator, and it can be consumed only once.</p>
  <div class="fx" data-lang="py">nums = [3, -1, 4, -1, 5, -9, 2]
m = map(abs, nums)
print(m)
print(list(m))
print(list(m))                                   # already exhausted
print(list(filter(lambda n: n &gt; 0, nums)))
print([n for n in nums if n &gt; 0])                # same, as a comprehension
print(list(map(str.upper, ["a", "b"])))          # existing function: map reads well
print(list(map(lambda n: n * n, filter(lambda n: n &gt; 0, nums))))
print([n * n for n in nums if n &gt; 0])            # same, much clearer
print(list(map(pow, [2, 3, 4], [5, 2, 1])))      # several iterables in parallel
print(list(filter(None, [0, 1, "", "x", None, [], [0]])))   # None = keep truthy</div>
  <div class="fx" data-lang="text">&lt;map object at 0x7fec5969a650&gt;
[3, 1, 4, 1, 5, 9, 2]
[]
[3, 4, 5, 2]
[3, 4, 5, 2]
['A', 'B']
[9, 16, 25, 4]
[9, 16, 25, 4]
[32, 9, 4]
[1, 'x', [0]]</div>
  <table class="tbl"><caption>Which to use</caption>
    <tr><th>Situation</th><th>Clearer choice</th><th>Why</th></tr>
    <tr><td>Apply an existing named function</td><td><code>map(str.strip, lines)</code></td><td>no throwaway variable or lambda</td></tr>
    <tr><td>Needs a lambda</td><td><code>[x * 2 for x in xs]</code></td><td>the lambda adds a function call per item and noise</td></tr>
    <tr><td>Transform and filter together</td><td><code>[f(x) for x in xs if cond(x)]</code></td><td>one expression instead of nested map/filter</td></tr>
    <tr><td>Large or streamed input, consumed once</td><td>generator expression <code>(f(x) for x in xs)</code> or <code>map</code></td><td>lazy, constant memory</td></tr>
    <tr><td>Several input sequences in parallel</td><td><code>map(f, xs, ys)</code></td><td>stops at the shortest, like <code>zip</code></td></tr>
  </table>
  <p>For performance, <code>map</code> with a built-in function implemented in C (<code>map(int, tokens)</code>) is slightly faster than a comprehension. <code>map</code> with a <code>lambda</code> is usually slightly <em>slower</em> than the equivalent comprehension because it calls a Python function for every item. In most code the difference is negligible, so choose whichever reads better. Laziness and one-pass iterators are covered in depth in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A <code>map</code> or <code>filter</code> object is exhausted after one pass. The second <code>list(m)</code> above returned <code>[]</code> with no error. If you need the results twice, store them with <code>list(...)</code> first.</p></div>

  <h2 id="pa-reduce"><span class="num">03</span>functools.reduce, any and all</h2>
  <p><code>functools.reduce(f, xs, initial)</code> folds a sequence into one value. It starts with an accumulator (the initial value, or the first item if none is given), then sets <code>acc = f(acc, x)</code> for each item. It was moved out of the built-ins in Python 3 because a plain loop or a dedicated built-in is usually clearer.</p>
  <div class="fx" data-lang="py">from functools import reduce
import operator

nums = [3, 1, 4, 1, 5]
print(reduce(lambda acc, x: acc + x, nums))      # ((((3+1)+4)+1)+5)
print(reduce(operator.mul, nums, 1))             # product
print(reduce(operator.mul, [], 1))               # empty input: returns initial
try:
    reduce(operator.add, [])
except TypeError as e:
    print("TypeError:", e)
dicts = [{"a": 1}, {"b": 2}, {"a": 3}]
print(reduce(lambda acc, d: acc | d, dicts, {}))  # merge dicts, later wins
print(sum(nums), max(nums), min(nums))           # dedicated reducers
print(any(n &gt; 4 for n in nums), all(n &gt; 0 for n in nums))
print(any([]), all([]))</div>
  <div class="fx" data-lang="text">14
60
1
TypeError: reduce() of empty iterable with no initial value
{'a': 3, 'b': 2}
14 5 1
True True
False True</div>
  <p>Prefer a built-in reducer when one exists: <code>sum</code>, <code>max</code>, <code>min</code>, <code>any</code>, <code>all</code>, <code>math.prod</code>, <code>"".join</code>. <code>reduce</code> is reasonable when the combining step is a named function (<code>operator.or_</code> over sets, merging configs). If you find yourself writing a multi-line lambda for <code>reduce</code>, use a loop instead.</p>
  <h3>any and all short-circuit</h3>
  <p><code>any</code> stops at the first truthy item and <code>all</code> at the first falsy one. That only saves work if you pass a <em>generator expression</em>. A list comprehension builds the whole list first.</p>
  <div class="fx" data-lang="py">def check(n):
    print("checking", n)
    return n &gt; 2

print(any(check(n) for n in [1, 3, 5]))      # generator: stops at 3
print(any([check(n) for n in [1, 3, 5]]))    # list: checks everything first</div>
  <div class="fx" data-lang="text">checking 1
checking 3
True
checking 1
checking 3
checking 5
True</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>all([])</code> is <code>True</code> (vacuous truth) and <code>any([])</code> is <code>False</code>. A validation like <code>all(row_ok(r) for r in rows)</code> passes when <code>rows</code> is empty, so check for emptiness separately if an empty input is an error. Always give <code>reduce</code> an initial value when the input may be empty.</p></div>

  <h2 id="pa-lambda"><span class="num">04</span>lambda and Its Limits</h2>
  <p><code>lambda args: expression</code> creates an anonymous function object inline. It is meant for short throwaway functions passed to <code>key=</code>, <code>map</code>, <code>filter</code> or callbacks. Its body is a single <em>expression</em>, whose value is returned automatically. The syntax and the late-binding trap are covered in <a class="xref" data-note="py_functions">Functions</a>. Here the focus is where lambda stops being the right tool.</p>
  <div class="fx" data-lang="py">square = lambda x: x * x
print(square(4), square.__name__)
def square2(x): return x * x
print(square2.__name__)

rows = [("asha", "b", 3), ("ravi", "a", 1), ("meena", "b", 7)]
print(sorted(rows, key=lambda row: (row[1], -row[2])))   # good use: inline key
sign = lambda n: "neg" if n &lt; 0 else "non-neg"           # conditional expression is allowed
print(sign(-2))</div>
  <div class="fx" data-lang="text">16 &lt;lambda&gt;
square2
[('ravi', 'a', 1), ('meena', 'b', 7), ('asha', 'b', 3)]
neg</div>
  <table class="tbl"><caption>Limits of lambda</caption>
    <tr><th>Limit</th><th>Consequence</th></tr>
    <tr><td>One expression only: no statements (<code>=</code>, <code>return</code>, <code>if</code>/<code>for</code> blocks, <code>try</code>, <code>raise</code>)</td><td>anything non-trivial needs <code>def</code></td></tr>
    <tr><td>Name is always <code>&lt;lambda&gt;</code></td><td>tracebacks and profilers show <code>&lt;lambda&gt;</code>, not a useful name</td></tr>
    <tr><td>No docstring, awkward type hints</td><td>harder to document and test</td></tr>
    <tr><td>Cannot be pickled by the standard <code>pickle</code></td><td>fails when passed to <code>multiprocessing</code> workers; use a module-level <code>def</code></td></tr>
    <tr><td>Captures variables by reference (late binding)</td><td>lambdas made in a loop all see the last value; freeze with <code>i=i</code> or <code>partial</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p><code>square = lambda x: x * x</code> is discouraged by PEP 8. If you give a function a name, use <code>def</code>, which gets a real <code>__name__</code> and can have a docstring. Also do not wrap an existing function in a lambda: <code>key=lambda s: len(s)</code> is just <code>key=len</code>.</p></div>

  <h2 id="pa-key"><span class="num">05</span>Key Functions: sorted, min, max</h2>
  <p><code>sorted</code>, <code>list.sort</code>, <code>min</code>, <code>max</code>, <code>heapq.nsmallest</code> and <code>itertools.groupby</code> accept a <code>key</code> function. It is called <em>once per item</em>, and the items are then compared by the key's results. This replaces the old pattern of writing comparison functions. Python's sort (Timsort) is <strong>stable</strong>: items with equal keys keep their original order.</p>
  <div class="fx" data-lang="py">words = ["banana", "Apple", "cherry", "fig"]
print(sorted(words))                      # uppercase sorts before lowercase
print(sorted(words, key=str.lower))       # case-insensitive
print(sorted(words, key=len))             # stable: banana stays before cherry
print(sorted(words, key=len, reverse=True))
print(max(words, key=len), min(words, key=len))

scores = {"asha": 82, "ravi": 95, "meena": 78}
print(max(scores, key=scores.get))        # key with the highest value
print(sorted(scores.items(), key=lambda kv: kv[1], reverse=True))

people = [("asha", 30), ("ravi", 25), ("meena", 30)]
print(sorted(people, key=lambda p: (-p[1], p[0])))   # age desc, then name asc
print(max([], default=None))              # no ValueError on empty input</div>
  <div class="fx" data-lang="text">['Apple', 'banana', 'cherry', 'fig']
['Apple', 'banana', 'cherry', 'fig']
['fig', 'Apple', 'banana', 'cherry']
['banana', 'cherry', 'Apple', 'fig']
banana fig
ravi
[('ravi', 95), ('asha', 82), ('meena', 78)]
[('asha', 30), ('meena', 30), ('ravi', 25)]
None</div>
  <p>For multi-column sorts, return a tuple from the key. Tuples compare element by element. Negate numeric fields to reverse just that column. For a non-numeric column in the opposite direction, rely on stability and sort twice, secondary key first: <code>xs.sort(key=name); xs.sort(key=dept, reverse=True)</code>.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>list.sort()</code> sorts in place and returns <code>None</code>, so <code>xs = xs.sort()</code> loses your list. Use <code>sorted(xs)</code> for a new list. Also, <code>max(empty)</code> raises <code>ValueError</code> unless you pass <code>default=</code>.</p></div>

  <h2 id="pa-operator"><span class="num">06</span>The operator Module: itemgetter, attrgetter, methodcaller</h2>
  <p>The <code>operator</code> module provides named functions for Python's operators (<code>add</code>, <code>mul</code>, <code>or_</code>, <code>neg</code>, …) and three factories that build small accessor functions. They replace the most common lambdas, read more clearly, can be pickled, and run slightly faster because they are implemented in C.</p>
  <table class="tbl">
    <tr><th>Factory</th><th>Returns a function equivalent to</th><th>Typical use</th></tr>
    <tr><td><code>itemgetter("k")</code></td><td><code>lambda x: x["k"]</code></td><td>dict rows, tuples, <code>sorted(rows, key=itemgetter("salary"))</code></td></tr>
    <tr><td><code>itemgetter(0, 2)</code></td><td><code>lambda x: (x[0], x[2])</code></td><td>multi-column keys, picking fields</td></tr>
    <tr><td><code>attrgetter("a.b")</code></td><td><code>lambda x: x.a.b</code></td><td>objects, dataclasses, ORM rows</td></tr>
    <tr><td><code>methodcaller("split", ",")</code></td><td><code>lambda x: x.split(",")</code></td><td>calling a method on each item</td></tr>
  </table>
  <div class="fx" data-lang="py">from operator import itemgetter, attrgetter, methodcaller
from dataclasses import dataclass

rows = [{"name": "asha", "dept": "ml", "salary": 120},
        {"name": "ravi", "dept": "be", "salary": 95},
        {"name": "meena", "dept": "ml", "salary": 140}]
print([r["name"] for r in sorted(rows, key=itemgetter("salary"))])
print(sorted(rows, key=itemgetter("dept", "salary"))[0]["name"])
get_pair = itemgetter("name", "salary")
print(get_pair(rows[0]))
print(itemgetter(1)(["a", "b", "c"]), itemgetter(slice(0, 2))("abc"))

@dataclass
class Model:
    name: str
    auc: float

models = [Model("lr", 0.81), Model("xgb", 0.88), Model("rf", 0.85)]
print(max(models, key=attrgetter("auc")).name)

print(list(map(methodcaller("strip"), ["  a ", "b  "])))
print(list(map(methodcaller("split", ","), ["1,2", "3,4"])))</div>
  <div class="fx" data-lang="text">['ravi', 'asha', 'meena']
ravi
('asha', 120)
b ab
xgb
['a', 'b']
[['1', '2'], ['3', '4']]</div>
  <p>The plain operator functions are useful wherever a two-argument function is expected:</p>
  <div class="fx" data-lang="py">import operator
from functools import reduce
print(operator.add(2, 3), operator.mul(4, 5), operator.neg(7))
print(reduce(operator.or_, [{1}, {2}, {1, 3}]))          # union of many sets
print(list(map(operator.mul, [1, 2, 3], [10, 20, 30])))  # element-wise product</div>
  <div class="fx" data-lang="text">5 20 -7
{1, 2, 3}
[10, 40, 90]</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>itemgetter</code> with one argument returns a single value, but with two or more it returns a <em>tuple</em>. Code that unpacks the result breaks if the number of fields changes from 2 to 1.</p></div>

  <h2 id="pa-partial"><span class="num">07</span>functools.partial</h2>
  <p><code>partial(f, *args, **kwargs)</code> returns a new callable with some arguments already filled in. Use it when an API expects a function of fewer arguments than yours takes: a <code>key=</code>, a <code>map</code> step, a callback, or a <code>multiprocessing</code> worker. The fixed values are bound when <code>partial</code> runs, so it does not have the late-binding problem that lambdas in a loop have.</p>
  <div class="fx" data-lang="py">from functools import partial

def power(base, exp):
    return base ** exp

square = partial(power, exp=2)
cube = partial(power, exp=3)
print(square(5), cube(2))
print(square.func.__name__, square.args, square.keywords)   # inspectable

parse_bin = partial(int, base=2)
print(parse_bin("1011"))
print(list(map(partial(round, ndigits=1), [3.14159, 2.71828])))

callbacks = [partial(print, "clicked", i) for i in range(3)]   # i frozen per partial
for cb in callbacks:
    cb()</div>
  <div class="fx" data-lang="text">25 8
power () {'exp': 2}
11
[3.1, 2.7]
clicked 0
clicked 1
clicked 2</div>
  <div class="callout def"><span class="label">Definition</span><p><code>partial</code> vs <code>lambda</code>: <code>partial(power, exp=2)</code> and <code>lambda b: power(b, exp=2)</code> behave the same when called. The <code>partial</code> version freezes values immediately, exposes <code>.func</code>/<code>.args</code>/<code>.keywords</code>, and can be pickled when <code>power</code> is a module-level function. For bound methods, <code>functools.partialmethod</code> does the same inside a class body.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Positional arguments given to <code>partial</code> fill from the left. <code>partial(power, 2)</code> fixes <code>base=2</code>, not <code>exp</code>. Use keywords to fix a later parameter, but then callers must not pass that parameter again positionally (<code>square(5, 3)</code> → <code>TypeError: power() got multiple values for argument 'exp'</code>).</p></div>

  <h2 id="pa-cache"><span class="num">08</span>Memoisation: lru_cache and cache</h2>
  <p><code>functools.lru_cache</code> is a decorator that stores results in a dict keyed by the call's arguments. Repeated calls with the same arguments return the stored result without running the function. That turns exponential recursions like naive Fibonacci into linear ones, and makes repeated expensive lookups free. <code>maxsize</code> bounds the cache. When it is full, the <em>least recently used</em> entry is evicted. <code>functools.cache</code> (3.9+) is <code>lru_cache(maxsize=None)</code>: unbounded and a little faster.</p>
  <div class="fx" data-lang="py">from functools import lru_cache, cache

@lru_cache(maxsize=128)
def fib(n):
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
print(fib.cache_info())          # 81 distinct n computed once each
fib(80)
print(fib.cache_info())          # one more hit, no new misses
fib.cache_clear()
print(fib.cache_info())

@cache                           # 3.9+: same as lru_cache(maxsize=None)
def total(items):
    print("computing", items)
    return sum(items)

print(total((1, 2, 3)), total((1, 2, 3)))   # second call is a hit
print(total.cache_info())
try:
    total([1, 2, 3])             # lists are unhashable
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">23416728348467685
CacheInfo(hits=78, misses=81, maxsize=128, currsize=81)
CacheInfo(hits=79, misses=81, maxsize=128, currsize=81)
CacheInfo(hits=0, misses=0, maxsize=128, currsize=0)
computing (1, 2, 3)
6 6
CacheInfo(hits=1, misses=1, maxsize=None, currsize=1)
TypeError: unhashable type: 'list'</div>
  <p><code>cache_info()</code> returns <code>hits</code>, <code>misses</code>, <code>maxsize</code> and <code>currsize</code>. Check it in production to confirm the cache is actually being hit: a low hit ratio means you pay the memory without the speedup. Eviction with a small cache looks like this:</p>
  <div class="fx" data-lang="py">from functools import lru_cache

@lru_cache(maxsize=2)
def f(x):
    return x * 10

for x in [1, 2, 1, 3, 2]:   # miss, miss, hit, miss (evicts 2), miss
    f(x)
print(f.cache_info())</div>
  <div class="fx" data-lang="text">CacheInfo(hits=1, misses=4, maxsize=2, currsize=2)</div>
  <table class="tbl"><caption>Rules for caching safely</caption>
    <tr><th>Rule</th><th>Why</th></tr>
    <tr><td>All arguments must be hashable</td><td>they form a dict key; pass tuples/frozensets, not lists/dicts/DataFrames</td></tr>
    <tr><td>Function should be pure</td><td>results depending on time, random numbers, files or a DB go stale</td></tr>
    <tr><td>Do not mutate a returned object</td><td>the cache hands the <em>same</em> object to every later caller</td></tr>
    <tr><td>Bound <code>maxsize</code> when inputs are unbounded</td><td><code>cache</code>/<code>maxsize=None</code> grows forever</td></tr>
    <tr><td>Avoid on instance methods</td><td><code>self</code> is part of the key, so the cache keeps every instance alive; use <code>functools.cached_property</code> or a per-instance dict</td></tr>
    <tr><td><code>f(1)</code> and <code>f(x=1)</code> are different keys</td><td>keyword vs positional calls are cached separately; <code>typed=True</code> also separates <code>1</code> and <code>1.0</code></td></tr>
  </table>
  <p>How a decorator like this is built (a wrapper closure holding the dict) is shown in <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A cached function that returns a list or dict hands every caller the same object. If one caller appends to it, every later "cached" result includes that change. Return a tuple or frozen structure, or copy it before mutating.</p></div>

  <h2 id="pa-dispatch"><span class="num">09</span>singledispatch and total_ordering</h2>
  <h3>functools.singledispatch</h3>
  <p><code>@singledispatch</code> turns a function into a <strong>generic function</strong> that picks an implementation based on the type of its <em>first</em> argument. It replaces long <code>if isinstance(...) elif isinstance(...)</code> chains. New types can be supported by registering an implementation, even from another module, without editing the original function. The type comes from the parameter annotation or from <code>register(type)</code>. Lookup follows the class hierarchy (MRO), so subclasses use their parent's implementation.</p>
  <div class="fx" data-lang="py">from functools import singledispatch
from decimal import Decimal

@singledispatch
def to_json(value):                      # fallback for unregistered types
    raise TypeError(f"cannot serialise {type(value).__name__}")

@to_json.register
def _(value: int):
    return str(value)

@to_json.register
def _(value: Decimal):
    return f'"{value}"'

@to_json.register(list)
def _(value):
    return "[" + ", ".join(to_json(v) for v in value) + "]"

print(to_json(3))
print(to_json([1, Decimal("2.50"), True]))   # bool is a subclass of int
try:
    to_json(1.5)
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">3
[1, "2.50", True]
TypeError: cannot serialise float</div>
  <p><code>True</code> was dispatched to the <code>int</code> implementation because <code>bool</code> subclasses <code>int</code>. Register <code>bool</code> separately if it needs different output. For methods, use <code>functools.singledispatchmethod</code>, which dispatches on the first argument after <code>self</code>.</p>
  <h3>functools.total_ordering</h3>
  <p>A class decorator: define <code>__eq__</code> and one of <code>__lt__</code>, <code>__le__</code>, <code>__gt__</code>, <code>__ge__</code>, and it fills in the other three. Useful for value objects that need to be sorted (versions, priorities). Comparison dunders are covered in <a class="xref" data-note="py_dunder">Dunder Methods</a>.</p>
  <div class="fx" data-lang="py">from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, major, minor):
        self.major, self.minor = major, minor
    def __eq__(self, other):
        return (self.major, self.minor) == (other.major, other.minor)
    def __lt__(self, other):
        return (self.major, self.minor) &lt; (other.major, other.minor)
    def __repr__(self):
        return f"v{self.major}.{self.minor}"

a, b = Version(1, 2), Version(1, 10)
print(a &lt; b, a &gt;= b, a &lt;= b, b &gt; a)      # &gt;=, &lt;=, &gt; were generated
print(sorted([Version(2, 0), a, b]))</div>
  <div class="fx" data-lang="text">True False True True
[v1.2, v1.10, v2.0]</div>
  <div class="callout trap"><span class="label">Trap</span><p>The generated methods are slower than hand-written ones because each goes through an extra call. For simple records, <code>@dataclass(order=True)</code> generates all comparisons from the fields instead.</p></div>

  <h2 id="pa-pure"><span class="num">10</span>Pure Functions, Side Effects and Immutability</h2>
  <p>A <strong>pure function</strong> returns a value that depends only on its arguments and has no side effects: it does not mutate its inputs, write to globals, print, touch files, or call the network. Pure functions are easy to test (input → expected output, no setup or mocks), safe to cache, safe to run in parallel, and safe to call twice. Real programs need side effects, so the usual design keeps a pure core of transformations and pushes I/O to the edges.</p>
  <div class="fx" data-lang="py">def add_tax_impure(prices):
    for i in range(len(prices)):
        prices[i] = round(prices[i] * 1.05, 2)   # mutates the caller's list
    return prices

def add_tax_pure(prices):
    return [round(p * 1.05, 2) for p in prices]  # new list, input untouched

menu = [30, 15, 90]
print(add_tax_pure(menu), menu)
print(add_tax_impure(menu), menu)
print(add_tax_impure(menu), menu)      # called twice: taxed twice

frozen = (30, 15, 90)
try:
    frozen[0] = 0
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">[31.5, 15.75, 94.5] [30, 15, 90]
[31.5, 15.75, 94.5] [31.5, 15.75, 94.5]
[33.08, 16.54, 99.23] [33.08, 16.54, 99.23]
TypeError: 'tuple' object does not support item assignment</div>
  <p>Immutability enforces the "don't mutate" rule at the type level. Use <code>tuple</code> instead of <code>list</code>, <code>frozenset</code> instead of <code>set</code>, <code>types.MappingProxyType</code> for a read-only view of a dict, and frozen dataclasses for records. To "change" an immutable record, create a modified copy.</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass, replace, FrozenInstanceError

@dataclass(frozen=True)
class Config:
    lr: float
    epochs: int

base = Config(lr=0.01, epochs=10)
fast = replace(base, lr=0.1)               # new object, base unchanged
print(base, fast)
try:
    base.lr = 1.0
except FrozenInstanceError as e:
    print("FrozenInstanceError:", e)
print(hash(base) == hash(Config(0.01, 10)))   # hashable: usable as a cache key</div>
  <div class="fx" data-lang="text">Config(lr=0.01, epochs=10) Config(lr=0.1, epochs=10)
FrozenInstanceError: cannot assign to field 'lr'
True</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pure function is like a calculator key: the same input always gives the same output, and pressing it does not change anything else. An impure function is like a vending machine. The result depends on its internal stock, and each use changes that stock.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Immutability is shallow. A tuple holding a list (<code>([1, 2], 3)</code>) cannot be re-bound, but the inner list can still be appended to, and such a tuple is unhashable. A frozen dataclass with a list field has the same problem.</p></div>

  <h2 id="pa-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="fx" data-lang="py">nums = [1, 2, 3]
m = map(lambda x: x * 2, nums)
print(sum(m), sum(m))             # 1. map/filter are one-pass
r = nums.sort()
print(r)                          # 2. list.sort() returns None

from functools import lru_cache
import random
@lru_cache
def roll():                       # 3. caching an impure function
    return random.randint(1, 10**9)
print(roll() == roll())

funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])       # 4. late binding in lambdas</div>
  <div class="fx" data-lang="text">12 0
None
True
[2, 2, 2]</div>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td>Reusing a <code>map</code>/<code>filter</code> object</td><td>second use is empty, no error</td><td><code>list(...)</code> once, or recreate it</td></tr>
    <tr><td><code>xs = xs.sort()</code></td><td><code>xs</code> becomes <code>None</code></td><td><code>xs.sort()</code> or <code>xs = sorted(xs)</code></td></tr>
    <tr><td><code>lru_cache</code> on impure functions</td><td>stale or constant results</td><td>cache only pure functions; add a TTL cache otherwise</td></tr>
    <tr><td>Lambdas created in a loop</td><td>all return the last value</td><td><code>lambda i=i: i</code> or <code>partial(f, i)</code></td></tr>
    <tr><td><code>reduce</code> on possibly empty input, no initial</td><td><code>TypeError</code></td><td>pass an initial value</td></tr>
    <tr><td><code>any([...])</code> with a list comprehension</td><td>no short-circuit, all items evaluated</td><td>pass a generator expression</td></tr>
    <tr><td><code>max(seq)</code> on empty data</td><td><code>ValueError</code></td><td><code>max(seq, default=None)</code></td></tr>
    <tr><td>Nested <code>map(lambda…, filter(lambda…))</code></td><td>hard to read</td><td>one comprehension</td></tr>
    <tr><td>Passing <code>f()</code> instead of <code>f</code></td><td><code>'X' object is not callable</code></td><td>pass the function object</td></tr>
    <tr><td>Lambda sent to <code>multiprocessing</code></td><td><code>PicklingError</code></td><td>module-level <code>def</code> or <code>partial</code> of one</td></tr>
  </table>

  <h2 id="pa-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>First-class and higher-order functions</h3>
  <ul>
    <li>Functions are objects: store in variables/dicts, pass as arguments, return from functions.</li>
    <li>Higher-order = takes and/or returns a function: <code>map</code>, <code>filter</code>, <code>sorted(key=)</code>, <code>partial</code>, decorators.</li>
    <li>Pass <code>f</code>, not <code>f()</code>.</li>
  </ul>
  <h3>map, filter, reduce vs comprehensions</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Returns</th><th>Prefer when</th></tr>
    <tr><td><code>map(f, xs, ...)</code></td><td>lazy iterator, one pass</td><td><code>f</code> already exists (<code>map(int, tokens)</code>)</td></tr>
    <tr><td><code>filter(pred, xs)</code> / <code>filter(None, xs)</code></td><td>lazy iterator</td><td><code>pred</code> already exists; <code>None</code> keeps truthy items</td></tr>
    <tr><td><code>[f(x) for x in xs if c(x)]</code></td><td>list</td><td>a lambda would be needed; transform + filter</td></tr>
    <tr><td><code>(f(x) for x in xs)</code></td><td>generator</td><td>big data, single pass</td></tr>
    <tr><td><code>reduce(f, xs, init)</code></td><td>one value</td><td>no built-in exists; always give <code>init</code></td></tr>
  </table>
  <ul>
    <li>Built-in reducers first: <code>sum</code>, <code>max</code>, <code>min</code>, <code>any</code>, <code>all</code>, <code>math.prod</code>, <code>str.join</code>.</li>
    <li><code>any</code>/<code>all</code> short-circuit with a generator; <code>any([]) == False</code>, <code>all([]) == True</code>.</li>
  </ul>
  <h3>lambda</h3>
  <ul>
    <li><code>lambda args: expr</code>: single expression, implicit return, name <code>&lt;lambda&gt;</code>.</li>
    <li>No statements, no docstring, not picklable, late-binding in loops.</li>
    <li>Don't assign a lambda to a name (PEP 8); don't wrap a function (<code>key=len</code>, not <code>key=lambda s: len(s)</code>).</li>
  </ul>
  <h3>Key functions</h3>
  <ul>
    <li><code>sorted(xs, key=f, reverse=False)</code>, <code>min/max(xs, key=f, default=...)</code>. Key is called once per item.</li>
    <li>Multi-column: <code>key=lambda r: (r.dept, -r.salary)</code>. Stable sort: sort by secondary key, then primary.</li>
    <li><code>max(d, key=d.get)</code> gives the dict key with the largest value.</li>
    <li><code>list.sort()</code> returns <code>None</code>.</li>
  </ul>
  <h3>operator</h3>
  <ul>
    <li><code>itemgetter("k")</code> → <code>x["k"]</code>; <code>itemgetter(0, 2)</code> → tuple.</li>
    <li><code>attrgetter("a.b")</code> → <code>x.a.b</code>; <code>methodcaller("m", arg)</code> → <code>x.m(arg)</code>.</li>
    <li><code>operator.add/mul/or_/neg</code> for <code>reduce</code> and <code>map</code>. C-implemented and picklable.</li>
  </ul>
  <h3>functools</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>What it does</th><th>Remember</th></tr>
    <tr><td><code>partial(f, *a, **kw)</code></td><td>freezes arguments now</td><td>positional fills from left; <code>.func/.args/.keywords</code></td></tr>
    <tr><td><code>lru_cache(maxsize=128, typed=False)</code></td><td>memoise, evict least recently used</td><td>hashable args, pure function; <code>.cache_info()</code>, <code>.cache_clear()</code></td></tr>
    <tr><td><code>cache</code> (3.9+)</td><td><code>lru_cache(maxsize=None)</code></td><td>unbounded memory</td></tr>
    <tr><td><code>cached_property</code></td><td>compute attribute once per instance</td><td>use instead of <code>lru_cache</code> on methods</td></tr>
    <tr><td><code>singledispatch</code></td><td>overload on first arg's type</td><td><code>@f.register</code> with annotation or type; follows MRO (bool → int)</td></tr>
    <tr><td><code>total_ordering</code></td><td>fills missing comparisons</td><td>define <code>__eq__</code> + one of <code>&lt; &lt;= &gt; &gt;=</code></td></tr>
    <tr><td><code>reduce(f, xs, init)</code></td><td>left fold</td><td>empty without init → <code>TypeError</code></td></tr>
  </table>
  <h3>Pure functions and immutability</h3>
  <ul>
    <li>Pure: same input → same output, no side effects. Easy to test, cache and parallelise.</li>
    <li>Return new data; don't mutate arguments.</li>
    <li>Immutable: <code>tuple</code>, <code>frozenset</code>, <code>MappingProxyType</code>, <code>@dataclass(frozen=True)</code> + <code>replace()</code>. Immutability is shallow.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>map</code>/<code>filter</code> results are empty on the second pass.</li>
    <li><code>lru_cache</code>: unhashable args → <code>TypeError</code>; impure → stale; mutable return values are shared.</li>
    <li>Lambdas in a loop see the last loop value.</li>
    <li><code>reduce</code> needs an initial value for possibly-empty input; <code>max</code> needs <code>default=</code>.</li>
    <li>Lambdas cannot be pickled for <code>multiprocessing</code>.</li>
  </ul>

  <h2 id="pa-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does "functions are first-class objects" mean in Python?</summary><div class="qa-body">A function is a normal object: you can assign it to a variable, store it in a list or dict, pass it as an argument, return it from another function, and give it attributes. This is what makes <code>key=</code> functions, callbacks, dispatch tables and decorators possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a higher-order function? Give examples from the standard library.</summary><div class="qa-body">A function that takes a function as an argument or returns one. Examples: <code>map</code>, <code>filter</code>, <code>sorted</code>/<code>min</code>/<code>max</code> with <code>key=</code>, <code>functools.reduce</code>, <code>functools.partial</code>, and any decorator such as <code>functools.lru_cache</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>map</code>/<code>filter</code> vs list comprehensions: which do you use?</summary><div class="qa-body">A comprehension when a lambda would be needed or when you transform and filter together, because it is more readable and usually as fast or faster. <code>map</code> when applying an existing function, for example <code>map(int, line.split())</code>, which is slightly faster with C built-ins. Note that <code>map</code>/<code>filter</code> return lazy iterators; the lazy equivalent of a comprehension is a generator expression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>m = map(str.upper, ["a", "b"]); print(list(m), list(m))</code></summary><div class="qa-body"><code>['A', 'B'] []</code>. In Python 3, <code>map</code> returns an iterator, and the first <code>list()</code> exhausts it. Store <code>list(m)</code> if you need the values twice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>functools.reduce</code> do, and why isn't it a built-in anymore?</summary><div class="qa-body">It folds an iterable into one value: <code>acc = f(acc, x)</code> for each item, starting from <code>initial</code> or the first item. It was moved to <code>functools</code> in Python 3 because most uses are clearer as a loop or a dedicated built-in (<code>sum</code>, <code>max</code>, <code>any</code>, <code>math.prod</code>). Without an initial value it raises <code>TypeError</code> on empty input.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the limitations of <code>lambda</code>?</summary><div class="qa-body">Only a single expression: no assignments, loops, <code>try</code> or <code>return</code> statements. It has no name (<code>&lt;lambda&gt;</code> in tracebacks), no docstring, cannot be pickled (so it fails with <code>multiprocessing</code>), and captures variables late. Use it for short inline <code>key=</code>/callback functions; otherwise use <code>def</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is printed? <code>fs = [lambda x: x * i for i in range(3)]; print([f(10) for f in fs])</code></summary><div class="qa-body"><code>[20, 20, 20]</code>. Each lambda looks up <code>i</code> when it is called, and by then the loop has finished with <code>i == 2</code>. Fix with a default argument <code>lambda x, i=i: x * i</code> or <code>partial(operator.mul, i)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you sort a list of dicts by one field descending and another ascending?</summary><div class="qa-body">Use a tuple key and negate the numeric field: <code>sorted(rows, key=lambda r: (-r["salary"], r["name"]))</code>. If the descending field is not numeric, use stability: sort by the secondary key first, then <code>sort(key=primary, reverse=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python's sort stable, and why does it matter?</summary><div class="qa-body">Yes. <code>sorted</code> and <code>list.sort</code> (Timsort) keep items with equal keys in their original order. This lets you sort by several keys in multiple passes (least significant first) and keeps a previous ordering, such as by timestamp, within ties. Timsort is O(n log n) worst case and O(n) on already-sorted data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are <code>itemgetter</code>, <code>attrgetter</code> and <code>methodcaller</code>, and why use them over lambdas?</summary><div class="qa-body">Factories in <code>operator</code> that return accessor functions: <code>itemgetter("k")</code> ≈ <code>lambda x: x["k"]</code>, <code>attrgetter("a")</code> ≈ <code>lambda x: x.a</code>, <code>methodcaller("strip")</code> ≈ <code>lambda x: x.strip()</code>. They are clearer, implemented in C (slightly faster), picklable, and support several fields at once (<code>itemgetter(0, 2)</code> returns a tuple).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>functools.partial</code>? How is it different from a lambda?</summary><div class="qa-body"><code>partial(f, *args, **kw)</code> returns a callable with some arguments pre-filled, e.g. <code>partial(int, base=2)</code>. Unlike a lambda it binds the values immediately (no late-binding bug), exposes <code>.func</code>, <code>.args</code> and <code>.keywords</code>, and is picklable when <code>f</code> is, so it works with <code>multiprocessing.Pool.map</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>lru_cache</code> work, and how do you check that it is helping?</summary><div class="qa-body">It wraps the function with a dict keyed by the arguments (a hashable key built from args and kwargs) plus a recency-ordered linked list. A hit returns the stored result; a miss calls the function, stores the result, and evicts the least recently used entry if <code>maxsize</code> is exceeded. <code>f.cache_info()</code> shows <code>hits</code>, <code>misses</code>, <code>maxsize</code> and <code>currsize</code>; <code>f.cache_clear()</code> empties it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>@lru_cache</code> raise <code>TypeError: unhashable type: 'list'</code>, and how do you fix it?</summary><div class="qa-body">The arguments become a dict key, so they must be hashable. Lists, dicts, sets and DataFrames are not. Convert to <code>tuple</code>/<code>frozenset</code> (or a frozen dataclass) before calling, or cache on a hashable identifier (a file path, an ID) instead of the object itself.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use <code>lru_cache</code>?</summary><div class="qa-body">On impure functions (time, randomness, DB or API calls whose data changes), where results go stale. Also avoid it with huge numbers of distinct inputs and <code>maxsize=None</code> (memory grows without bound), when it returns mutable objects that callers modify (shared state), and on instance methods (it keeps every <code>self</code> alive; use <code>cached_property</code> or a per-instance cache).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>lru_cache(maxsize=None)</code> vs <code>functools.cache</code> vs <code>cached_property</code>?</summary><div class="qa-body"><code>cache</code> (3.9+) is exactly <code>lru_cache(maxsize=None)</code>: unbounded, with no LRU bookkeeping, so slightly faster. <code>lru_cache(maxsize=N)</code> bounds memory. <code>cached_property</code> computes a method's value once per instance and stores it in the instance <code>__dict__</code>, so it is freed with the instance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>functools.singledispatch</code> used for?</summary><div class="qa-body">To write a generic function whose implementation is chosen by the type of the first argument, replacing <code>isinstance</code> chains. Decorate a base function, then add <code>@f.register</code> implementations per type (via annotation or <code>register(type)</code>). Dispatch follows the MRO, so <code>bool</code> uses the <code>int</code> implementation unless <code>bool</code> is registered. Use <code>singledispatchmethod</code> for methods.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@total_ordering</code> do?</summary><div class="qa-body">Given <code>__eq__</code> and one ordering method (<code>__lt__</code>, <code>__le__</code>, <code>__gt__</code> or <code>__ge__</code>), it generates the remaining comparison methods so objects can be fully compared and sorted. The generated methods are a bit slower; <code>@dataclass(order=True)</code> is an alternative for field-based ordering.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a pure function, and why does it matter in data pipelines?</summary><div class="qa-body">A function whose output depends only on its inputs and which has no side effects (no mutation of inputs, globals, I/O). Pure steps are trivial to unit test, safe to cache, safe to retry, and safe to run in parallel across processes. Pipelines usually keep transformations pure and isolate reading and writing at the edges.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is printed? <code>def f(xs): xs.append(1); return xs</code> then <code>a = []; f(a); f(a); print(a)</code></summary><div class="qa-body"><code>[1, 1]</code>. The function mutates the caller's list, which is a side effect, so every call changes <code>a</code>. A pure version returns a new list: <code>return xs + [1]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make data immutable in Python? Is a tuple fully immutable?</summary><div class="qa-body">Use <code>tuple</code>, <code>frozenset</code>, <code>MappingProxyType</code> (read-only dict view), <code>@dataclass(frozen=True)</code> or <code>NamedTuple</code>. Immutability is shallow: a tuple cannot be re-bound element-wise, but a list inside it can still be mutated, and such a tuple is unhashable (<code>hash(([1], 2))</code> raises <code>TypeError</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do <code>any</code> and <code>all</code> behave on empty input and with a list comprehension vs a generator?</summary><div class="qa-body"><code>any([])</code> is <code>False</code>, <code>all([])</code> is <code>True</code> (vacuous truth). Both short-circuit, stopping at the first truthy/falsy item, but only a generator expression benefits. A list comprehension evaluates every element before <code>any</code> sees the list.</div></details>
</main>
`
});
