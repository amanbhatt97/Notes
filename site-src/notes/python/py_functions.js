// notes/python/py_functions.js — Functions
Object.assign(TOPIC_CONTENT, {
  "py_functions": `<main>
<h1>Functions</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Functions</span></div>
  <p class="lead">A <strong>function</strong> is a named block of code that takes inputs and returns a value. Without functions, the same logic gets copy-pasted, and when a rule changes one copy is always missed: nothing crashes, the results just quietly disagree. Functions put each rule in one place, give it a name and a testable contract, and, because they are objects, can be passed around: <code>sorted(key=...)</code>, sklearn scorers, callbacks, retry wrappers and decorators all depend on that. This note covers <code>def</code> and <code>return</code>, every kind of parameter (positional, keyword, defaults, <code>*args</code>/<code>**kwargs</code>, positional-only and keyword-only), the mutable-default trap, scope (LEGB, <code>global</code>, <code>nonlocal</code>, closures), recursion and the call stack, <code>lambda</code>, higher-order functions, and docstrings and type hints. Code here was run on Python 3.13.</p>

  <h2 id="pfn-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Define, call, return</div>
        <ul>
          <li><code>def name(params):</code> + indented body; defining does not run it</li>
          <li>Call <code>name(args)</code>: jump in, run, come back with the return value</li>
          <li>No <code>return</code> → returns <b>None</b>; ⚠ print is not return</li>
          <li><code>return a, b</code> returns one tuple</li>
          <li><code>def</code> runs once and creates a function object; the body runs per call</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Parameters</div>
        <ul>
          <li><b>Parameter</b> = name in def; <b>argument</b> = value in the call</li>
          <li>Positional, keyword (<code>rate=0.12</code>), defaults</li>
          <li>Order: <code>def f(pos_only, /, normal, *args, kw_only, **kwargs)</code></li>
          <li><code>*args</code> → tuple; <code>**kwargs</code> → dict; <code>f(*lst, **d)</code> unpacks</li>
          <li>⚠ <b>Mutable default</b> built once → shared list; use <code>None</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scope (LEGB)</div>
        <ul>
          <li>Lookup: Local → Enclosing → Global → Built-in; first match wins</li>
          <li>Assignment anywhere in a function makes a name local</li>
          <li>⚠ <code>count += 1</code> on a global → UnboundLocalError</li>
          <li><code>global</code> / <code>nonlocal</code> to rebind outer names</li>
          <li><b>Closure</b>: inner function remembers outer variables (<code>__closure__</code>)</li>
          <li>Loops and if-blocks do not create a scope</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursion</div>
        <ul>
          <li>Base case + a call on a smaller problem</li>
          <li>Each active call has its own frame on the call stack</li>
          <li>Natural for nested data: trees, JSON, folders</li>
          <li>Limit ~1000 → RecursionError; no tail-call optimisation</li>
          <li><code>@lru_cache</code> remembers answers (fib(80))</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">lambda &amp; first-class</div>
        <ul>
          <li><code>lambda line: line[1] * line[2]</code>: one expression, no name</li>
          <li>For <code>key=</code> in sorted/max/min, <code>map</code></li>
          <li>Functions are objects: store, pass, return</li>
          <li>Higher-order: take or return functions (strategy, callbacks)</li>
          <li><code>make_discount(0.15)</code> returns a function (closure)</li>
          <li>⚠ late binding: <code>[lambda: p for p in …]</code> all see the last p</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Documenting</div>
        <ul>
          <li><b>Docstring</b>: first string in the body; <code>help()</code>, <code>__doc__</code></li>
          <li><b>Type hints</b>: <code>def f(x: int) -&gt; int</code>; stored in <code>__annotations__</code></li>
          <li>⚠ not enforced at run time: <code>double("ab")</code> → "abab"</li>
          <li>Checked by tools (mypy, IDEs)</li>
          <li>Wrapping a function = a decorator (<code>@</code>)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pfn-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Defining and Calling Functions</span><span class="rm-sub">def, call, function objects</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-return"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">return and None</span><span class="rm-sub">print vs return, early return, tuples</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-params"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Parameters and Arguments</span><span class="rm-sub">positional, keyword, defaults</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-default"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Mutable Default Arguments</span><span class="rm-sub">built once at def, None sentinel</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-star"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">*args, **kwargs and Unpacking</span><span class="rm-sub">/, *, varargs, call-site unpacking</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-scope"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Scope: LEGB and Closures</span><span class="rm-sub">global, nonlocal, UnboundLocalError</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-rec"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Recursion</span><span class="rm-sub">base case, call stack, lru_cache</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-lambda"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">lambda Expressions</span><span class="rm-sub">key functions, late binding</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-values"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">First-Class and Higher-Order Functions</span><span class="rm-sub">store, pass, return, wrap</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-doc"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Docstrings and Type Hints</span><span class="rm-sub">__doc__, __annotations__, mypy</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-build"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Worked Example: an Event Router</span><span class="rm-sub">match + handlers + kwargs</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">return, defaults, scope, lambdas</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Condensed notes for revision</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Arguments, scope, closures, recursion</span></div></div>
    </div>
  </div>

  <h2 id="pfn-why"><span class="num">01</span>Defining and Calling Functions</h2>
  <h3>Why Functions: One Rule in One Place</h3>
  <p>Billing logic duplicated for two orders. The tax rate changes to 12%, and only one copy gets updated:</p>
  <div class="fx" data-lang="py">asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
ben = [("masala chai", 1, 30), ("vada pav", 2, 20)]
# billing Asha ...
s = 0
for item, qty, price in asha:
    s += qty * price
after = s - (s * 0.10 if s &gt;= 150 else 0)
print("Asha", round(after + after * 0.05))
# ... and the same code pasted for Ben, where someone already changed the tax to 12%
s = 0
for item, qty, price in ben:
    s += qty * price
after = s - (s * 0.10 if s &gt;= 150 else 0)
print("Ben ", round(after + after * 0.12))     # two copies, two different rules</div>
  <div class="fx" data-lang="text">Asha 184
Ben  78</div>
  <p>Two copies, two rules: one order taxed at 5%, the other at 12%. Nothing crashed, so nobody noticed. This is the main reason functions exist: <strong>one rule should live in one place</strong>. The second reason is naming: <code>bill(ben)</code> says what it does; ten lines of arithmetic do not.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A recipe card. The chai-wala does not re-invent masala chai for every customer; the steps are written once on a card titled "masala chai". "Make masala chai, 2 cups" is a call: same steps, different quantity. Change the recipe card once and every future cup changes.</p></div>
  <h3>def and the Call</h3>
  <p><code>def</code> creates a function. The first line gives its name and, in brackets, its <strong>parameters</strong>: names for the inputs it will receive. The indented body is the steps. <code>return</code> hands the result back.</p>
  <div class="fx" data-lang="py">def subtotal(lines):
    """Add up qty * price over the lines of one order."""
    total = 0
    for item, qty, price in lines:
        total += qty * price
    return total                      # hand the answer back to the caller

asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
ben = [("masala chai", 1, 30), ("vada pav", 2, 20)]
chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
print(subtotal(asha), subtotal(ben), subtotal(chen))
print(subtotal(asha) + 5)             # a call is an expression: use it anywhere</div>
  <div class="fx" data-lang="text">195 70 50
200</div>
  <p>The calls are traced below. When Python meets <code>subtotal(asha)</code>, it pauses the current line, binds the parameter <code>lines</code> to the same list as <code>asha</code> (a label, not a copy; see <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>), runs the body, and the call is <em>replaced by</em> the returned value.</p>
  <table class="tbl"><caption>Trace: print(subtotal(asha), …)</caption>
    <tr><th>Step</th><th>Where Python is</th><th>What happens</th><th>Names inside subtotal</th></tr>
    <tr><td>1</td><td>caller, at <code>subtotal(asha)</code></td><td>pause; jump into subtotal</td><td>lines → asha's list</td></tr>
    <tr><td>2</td><td>body: <code>total = 0</code></td><td>new local name</td><td>lines, total = 0</td></tr>
    <tr><td>3</td><td>body: the for loop</td><td>60 → 105 → 195</td><td>total = 195 (item, qty, price = last line)</td></tr>
    <tr><td>4</td><td>body: <code>return total</code></td><td>leave the function with 195; its local names are discarded</td><td>(gone)</td></tr>
    <tr><td>5</td><td>caller</td><td><code>subtotal(asha)</code> is replaced by 195; next call starts fresh</td><td>—</td></tr>
  </table>
  <p>Because a call becomes a value, it can be used anywhere a value can: <code>subtotal(asha) + 5</code> is 200. And <code>def</code> itself only <em>creates</em> the function; it runs nothing. The function is an object like any other:</p>
  <div class="fx" data-lang="py">print(subtotal)                       # def made a function object...
print(type(subtotal).__name__, subtotal.__name__)
print(callable(subtotal), callable(195))</div>
  <div class="fx" data-lang="text">&lt;function subtotal at 0x7f0f704de8e0&gt;
function subtotal
True False</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>function</strong> is a named, reusable block of code. <code>def name(parameters): body</code> creates a function object and binds <code>name</code> to it; the body runs only when the function is <strong>called</strong> with <code>name(arguments)</code>. Each call gets fresh local names; the call expression evaluates to the function's return value.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>subtotal</code> without brackets is the function object itself, not a call: <code>if subtotal:</code> is always True, and <code>print(subtotal)</code> prints <code>&lt;function subtotal at 0x…&gt;</code>. To run it you need the brackets.</p></div>

  <h2 id="pfn-return"><span class="num">02</span>return and None</h2>
  <p>A function that prints its result instead of returning it looks fine on screen but cannot be used by other code. <code>return</code> is how a value gets back to the caller.</p>
  <p><code>print</code> shows text to a human. <code>return</code> gives a value to the <em>code</em> that called the function. A function that reaches the end of its body without a <code>return</code> (or with a bare <code>return</code>) returns <code>None</code>.</p>
  <div class="fx" data-lang="py">def show_subtotal(lines):
    print("subtotal is", subtotal(lines))   # shows it, hands nothing back

x = show_subtotal(asha)
print("x =", x)
try:
    x + 10
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">subtotal is 195
x = None
TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'</div>
  <p>The function did its job on screen, but <code>x</code> is <code>None</code>, and <code>None + 10</code> fails. This is the most common beginner bug with functions: <strong>print shows, return gives</strong>. In data work, a helper that prints instead of returning cannot be reused in a pipeline.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>You ask a colleague for a total. Printing is them shouting the number across the room: you heard it, but you cannot paste it into your spreadsheet. Returning is them handing you a slip with the number on it.</p></div>
  <h3>Returning early</h3>
  <p><code>return</code> ends the function immediately. That gives a clean way to write rules: return as soon as the answer is known.</p>
  <div class="fx" data-lang="py">def discount(sub):
    """10% off at 150 or more, else nothing."""
    if sub &gt;= 150:
        return sub * 0.10             # leaves the function right here
    return 0                          # only reached when the if was False

print(discount(195), discount(70), discount(50))</div>
  <div class="fx" data-lang="text">19.5 0 0</div>
  <table class="tbl"><caption>Trace: discount(sub)</caption>
    <tr><th>Call</th><th><code>sub &gt;= 150</code>?</th><th>Line that returns</th><th>Result</th></tr>
    <tr><td>discount(195)</td><td>True</td><td><code>return sub * 0.10</code></td><td>19.5</td></tr>
    <tr><td>discount(70)</td><td>False</td><td><code>return 0</code></td><td>0</td></tr>
    <tr><td>discount(50)</td><td>False</td><td><code>return 0</code></td><td>0</td></tr>
  </table>
  <h3>Returning several values</h3>
  <p>Splitting ₹184 three ways needs a share and a remainder. <code>return a, b</code> builds one tuple; the caller can unpack it into two names.</p>
  <div class="fx" data-lang="py">def split_bill(total, people):
    return total // people, total % people   # really ONE tuple

share, left = split_bill(184, 3)
print(share, left, split_bill(184, 3))</div>
  <div class="fx" data-lang="text">61 1 (61, 1)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>return expr</code> ends the call and makes the call expression evaluate to <code>expr</code>. A function with no <code>return</code>, or a bare <code>return</code>, returns <code>None</code>. <code>return a, b</code> returns the tuple <code>(a, b)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>A function that only prints returns <code>None</code>; using its result gives <code>TypeError: ... 'NoneType'</code>. Also: methods that change an object in place, like <code>list.sort()</code> and <code>list.append()</code>, return <code>None</code> on purpose, so <code>order = order.sort()</code> destroys your list.</p></div>

  <h2 id="pfn-params"><span class="num">03</span>Parameters and Arguments</h2>
  <p>Hard-coded constants (a 5% tax) make a function single-use. Parameters let callers supply inputs, and defaults keep the common case short while allowing overrides.</p>
  <p>Two words that people mix up:</p>
  <ul>
    <li>A <strong>parameter</strong> is a name in the <code>def</code> line: <code>amount</code>, <code>rate</code>. It is a placeholder.</li>
    <li>An <strong>argument</strong> is the actual value passed in a call: <code>175.5</code>, <code>0.12</code>.</li>
  </ul>
  <p>Arguments reach parameters in two ways. <strong>Positional</strong>: first value to first parameter, second to second. <strong>Keyword</strong>: write the parameter's name, <code>rate=0.12</code>, so the order does not matter. A parameter with a <strong>default</strong>, <code>rate=0.05</code>, may be left out.</p>
  <div class="fx" data-lang="py">def with_tax(amount, rate=0.05):      # rate has a default
    return amount + amount * rate

print(with_tax(175.5))                # positional; rate uses its default
print(with_tax(175.5, 0.12))          # positional; overrides the default
print(with_tax(rate=0.12, amount=175.5))   # by keyword; any order
print(with_tax(175.5, rate=0.12))     # mixed: positional first</div>
  <div class="fx" data-lang="text">184.275
196.56
196.56
196.56</div>
  <table class="tbl"><caption>Trace: how each call binds its parameters</caption>
    <tr><th>Call</th><th>amount</th><th>rate</th><th>Why</th><th>Result</th></tr>
    <tr><td><code>with_tax(175.5)</code></td><td>175.5</td><td>0.05</td><td>1st positional; default used</td><td>184.275</td></tr>
    <tr><td><code>with_tax(175.5, 0.12)</code></td><td>175.5</td><td>0.12</td><td>1st and 2nd positional</td><td>196.56</td></tr>
    <tr><td><code>with_tax(rate=0.12, amount=175.5)</code></td><td>175.5</td><td>0.12</td><td>both by name</td><td>196.56</td></tr>
    <tr><td><code>with_tax(175.5, rate=0.12)</code></td><td>175.5</td><td>0.12</td><td>positional, then keyword</td><td>196.56</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>An order form. The boxes on the form are the parameters ("item", "quantity", "sugar: normal"). What the customer writes in them are the arguments. A box with "normal" pre-printed is a default: leave it blank and "normal" is used.</p></div>
  <p>Python checks the binding strictly. Each of these calls is wrong in a different way:</p>
  <div class="fx" data-lang="py">for call in ["with_tax()", "with_tax(1, 2, 3)", "with_tax(175.5, amount=1)", "with_tax(rate=0.1, 175.5)"]:
    try:
        eval(call)
    except TypeError as e:
        print(f"{call:28} TypeError: {e}")
    except SyntaxError as e:
        print(f"{call:28} SyntaxError: {e.msg}")</div>
  <div class="fx" data-lang="text">with_tax()                   TypeError: with_tax() missing 1 required positional argument: 'amount'
with_tax(1, 2, 3)            TypeError: with_tax() takes from 1 to 2 positional arguments but 3 were given
with_tax(175.5, amount=1)    TypeError: with_tax() got multiple values for argument 'amount'
with_tax(rate=0.1, 175.5)    SyntaxError: positional argument follows keyword argument</div>
  <ul>
    <li>Missing a required argument, or too many positional ones: <code>TypeError</code> naming the function.</li>
    <li>The same parameter by position <em>and</em> by name: "multiple values".</li>
    <li>A positional argument after a keyword one is not even valid Python: positional arguments always come first.</li>
  </ul>
  <h3>Composing Small Functions</h3>
  <p>Now <code>bill</code> can be written from the pieces. Each function does one job and can be tested alone; <code>bill</code> just connects them.</p>
  <div class="fx" data-lang="py">def bill(lines):
    sub = subtotal(lines)
    after = sub - discount(sub)
    return round(with_tax(after))

for name, lines in [("Asha", asha), ("Ben", ben), ("Chen", chen)]:
    print(name, subtotal(lines), bill(lines))</div>
  <div class="fx" data-lang="text">Asha 195 184
Ben 70 74
Chen 50 52</div>
  <p>The tax rate now lives in exactly one place, the default of <code>with_tax</code>, and each piece can be tested on its own.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Parameters</strong> are the names in a function definition; <strong>arguments</strong> are the values supplied in a call. Arguments bind to parameters <strong>positionally</strong> (left to right) and then by <strong>keyword</strong> (by name). A parameter with a <strong>default value</strong> (<code>p=v</code>) is optional; parameters with defaults must come after those without.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Swapped positional arguments give wrong answers without an error: <code>with_tax(0.12, 175.5)</code> is 0.12 + 21.06. For anything beyond the first one or two obvious inputs, pass by keyword; keyword-only parameters (next section) <em>force</em> callers to.</p></div>

  <h2 id="pfn-default"><span class="num">04</span>Mutable Default Arguments</h2>
  <p>A default value is created once, when <code>def</code> runs, not on each call. With an immutable default that is harmless; with a list or dict it means every call shares one object.</p>
  <div class="callout pred"><span class="label">Predict the output</span><p>Two calls with no order passed. What do the prints show?</p></div>
  <div class="fx" data-lang="py">def add_line(line, order=[]):         # the [] is built ONCE, when def runs
    order.append(line)
    return order

asha_order = add_line(("masala chai", 2, 30))
ben_order = add_line(("vada pav", 2, 20))     # a "new" order?
print(asha_order)
print(ben_order)
print(asha_order is ben_order, add_line.__defaults__)</div>
  <div class="fx" data-lang="text">[('masala chai', 2, 30), ('vada pav', 2, 20)]
[('masala chai', 2, 30), ('vada pav', 2, 20)]
True ([('masala chai', 2, 30), ('vada pav', 2, 20)],)</div>
  <p>Both names show both lines, and they are the same list. The reason: <strong>a default value is built once, when the <code>def</code> line runs</strong>, and stored on the function (in <code>add_line.__defaults__</code>). Every call that omits <code>order</code> gets that same stored list. Lists are mutable (<a class="xref" data-note="py_values">Values, Types &amp; Variables</a>), so <code>append</code> changes the shared one.</p>
  <table class="tbl"><caption>Trace: the one default list across calls</caption>
    <tr><th>Moment</th><th>What runs</th><th>Default list D (stored on the function)</th><th>order inside the call →</th><th>Returned</th></tr>
    <tr><td><code>def</code></td><td>builds <code>[]</code> once</td><td>[] (id D)</td><td>—</td><td>—</td></tr>
    <tr><td>Call 1</td><td>order omitted → order = D; append chai</td><td>[chai]</td><td>D</td><td>D</td></tr>
    <tr><td>Call 2</td><td>order omitted → order = D again; append vada pav</td><td>[chai, vada pav]</td><td>D</td><td>D</td></tr>
    <tr><td>After</td><td><code>asha_order</code> and <code>ben_order</code></td><td>both are D</td><td></td><td><code>is</code> → True</td></tr>
  </table>
  <p>The same "evaluated once at <code>def</code> time" rule also explains this quieter surprise: a default copied from a global keeps the value the global had <em>when the function was defined</em>.</p>
  <div class="fx" data-lang="py">GST = 0.05
def with_gst(amount, rate=GST):       # rate's default = the value of GST NOW
    return amount + amount * rate

GST = 0.12                            # changing the name later...
print(with_gst(100))                  # ...does not change the stored default</div>
  <div class="fx" data-lang="text">105.0</div>
  <p>GST was 0.05 when <code>def</code> ran, so the default is 0.05 forever; later changing the name <code>GST</code> moves that label, not the stored default (100 + 5 = 105.0).</p>
  <h3>The fix: a None sentinel</h3>
  <p>Use <code>None</code> as the default, meaning "nothing was passed", and build the fresh list <em>inside</em> the body, which runs on every call. A special value used to mean "nothing given" is called a <strong>sentinel</strong>.</p>
  <div class="fx" data-lang="py">def add_line_ok(line, order=None):    # None = "nothing was passed"
    if order is None:
        order = []                    # a fresh list on every call
    order.append(line)
    return order

asha_order = add_line_ok(("masala chai", 2, 30))
ben_order = add_line_ok(("vada pav", 2, 20))
print(asha_order, ben_order, asha_order is ben_order)</div>
  <div class="fx" data-lang="text">[('masala chai', 2, 30)] [('vada pav', 2, 20)] False</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>Default values are evaluated <strong>once</strong>, when the <code>def</code> statement executes, and stored in <code>function.__defaults__</code>. A mutable default is therefore shared by all calls that omit that argument. Idiom: <code>def f(x=None): if x is None: x = []</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Never use <code>[]</code>, <code>{}</code>, <code>set()</code> or any mutable object as a default. Test the sentinel with <code>is None</code>, not <code>if not order:</code>, or a caller's deliberately empty list would be replaced.</p></div>

  <h2 id="pfn-star"><span class="num">05</span>*args, **kwargs and Unpacking</h2>
  <p>Some functions must accept a varying number of inputs (<code>print</code>, <code>max</code>, a wrapper that forwards any call). Stars in the definition collect extras; stars in a call spread a sequence or dict into arguments.</p>
  <h3>*args: any number of positional arguments</h3>
  <p>A parameter written with one star, <code>*amounts</code>, collects all extra positional arguments into a <strong>tuple</strong>.</p>
  <div class="fx" data-lang="py">def total_of(*amounts):               # any number of positional arguments
    print("amounts =", amounts, type(amounts).__name__)
    return sum(amounts)

print(total_of(60, 45, 90))
print(total_of())</div>
  <div class="fx" data-lang="text">amounts = (60, 45, 90) tuple
195
amounts = () tuple
0</div>
  <h3>**kwargs: any number of keyword arguments</h3>
  <p>A parameter with two stars, <code>**notes</code>, collects all extra <code>name=value</code> arguments into a <strong>dict</strong>. (The names <code>args</code>/<code>kwargs</code> are only habit; the stars do the work.)</p>
  <div class="fx" data-lang="py">def make_line(item, qty, **notes):    # any number of keyword arguments
    print("notes =", notes, type(notes).__name__)
    return (item, qty, notes)

print(make_line("masala chai", 2, sugar="less", ginger=True))</div>
  <div class="fx" data-lang="text">notes = {'sugar': 'less', 'ginger': True} dict
('masala chai', 2, {'sugar': 'less', 'ginger': True})</div>
  <h3>All five kinds of parameters</h3>
  <p>Python lets you control <em>how</em> callers may pass each value. The picture shows all five kinds, in the only order Python allows.</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <text x="10" y="20">def f(a, /, b, *args, key, **kwargs)</text>
    <rect x="10" y="38" width="90" height="34" rx="5" class="fv"/><text x="20" y="60">a</text>
    <rect x="105" y="38" width="110" height="34" rx="5" class="fb sb"/><text x="115" y="60">b</text>
    <rect x="220" y="38" width="110" height="34" rx="5" class="ft st"/><text x="230" y="60">*args</text>
    <rect x="335" y="38" width="120" height="34" rx="5" class="fg sg"/><text x="345" y="60">key</text>
    <rect x="460" y="38" width="130" height="34" rx="5" class="fs" stroke="currentColor"/><text x="470" y="60">**kwargs</text>
    <text x="10" y="92" class="tm">positional</text><text x="10" y="105" class="tm">only</text>
    <text x="105" y="92" class="tm">positional</text><text x="105" y="105" class="tm">or keyword</text>
    <text x="220" y="92" class="tm">extra args</text><text x="220" y="105" class="tm">→ tuple</text>
    <text x="335" y="92" class="tm">keyword-only</text><text x="335" y="105" class="tm">(after *)</text>
    <text x="460" y="92" class="tm">extra kwargs</text><text x="460" y="105" class="tm">→ dict</text>
  </svg><figcaption>Parameters always come in this left-to-right order. / and * are markers, not parameters.</figcaption></figure>
  <ul>
    <li><strong>Positional-only</strong> (before <code>/</code>): must be passed by position.</li>
    <li><strong>Normal</strong>: position or keyword, caller's choice.</li>
    <li><strong>*args</strong>: collects any extra positional values into a tuple.</li>
    <li><strong>Keyword-only</strong> (after <code>*</code> or <code>*args</code>): must be passed by name.</li>
    <li><strong>**kwargs</strong>: collects any extra <code>name=value</code> pairs into a dict.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>An exam form: some boxes are filled in fixed order (roll number, name), some must be labelled ("Category: ___"), and a "remarks" box takes anything extra. <code>*args</code> and <code>**kwargs</code> are the remarks boxes.</p></div>
  <div class="fx" data-lang="py">def receipt(customer, table=1, *lines, gst=0.05, **extra):
    print(customer, table, lines, gst, extra)

receipt("Asha")
receipt("Asha", 1, ("masala chai", 2, 30), ("samosa", 3, 15), gst=0.12, tip=20)</div>
  <div class="fx" data-lang="text">Asha 1 () 0.05 {}
Asha 1 (('masala chai', 2, 30), ('samosa', 3, 15)) 0.12 {'tip': 20}</div>
  <table class="tbl"><caption>Trace: the second receipt call</caption>
    <tr><th>Argument</th><th>Goes to</th><th>Why</th></tr>
    <tr><td>"Asha"</td><td>customer</td><td>1st positional</td></tr>
    <tr><td>1</td><td>table</td><td>2nd positional</td></tr>
    <tr><td>("masala chai", 2, 30), ("samosa", 3, 15)</td><td>lines (tuple)</td><td>extra positionals → *lines</td></tr>
    <tr><td>gst=0.12</td><td>gst</td><td>keyword-only parameter exists</td></tr>
    <tr><td>tip=20</td><td>extra (dict)</td><td>no parameter named tip → **extra</td></tr>
  </table>
  <p>Positional-only and keyword-only parameters make calls hard to get wrong. In <code>pay(amount, /, *, method="cash")</code>, the amount must come first and unnamed, and the method must be named, so <code>pay(184, "upi")</code> (which "upi" is that?) is rejected. sklearn uses keyword-only parameters everywhere for this reason.</p>
  <div class="fx" data-lang="py">def pay(amount, /, *, method="cash"):   # amount positional-only, method keyword-only
    return f"{amount} paid by {method}"

print(pay(184, method="upi"))
try:
    pay(184, "upi")                     # method must be named
except TypeError as e:
    print("TypeError:", e)
try:
    pay(amount=184)                     # amount must NOT be named
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">184 paid by upi
TypeError: pay() takes 1 positional argument but 2 were given
TypeError: pay() got some positional-only arguments passed as keyword arguments: 'amount'</div>
  <h3>Unpacking at the call site</h3>
  <p>The stars also work in the other direction, in a <em>call</em>: <code>*seq</code> spreads a list or tuple into separate positional arguments, and <code>**d</code> spreads a dict into <code>name=value</code> arguments.</p>
  <div class="fx" data-lang="py">line = ("samosa", 3, 15)
print(*line)                            # same as print("samosa", 3, 15)
cfg = {"gst": 0.12, "tip": 20}
receipt("Ben", 2, *ben, **cfg)          # spread a list and a dict into a call</div>
  <div class="fx" data-lang="text">samosa 3 15
Ben 2 (('masala chai', 1, 30), ('vada pav', 2, 20)) 0.12 {'tip': 20}</div>
  <p><code>print(*line)</code> is <code>print("samosa", 3, 15)</code>. In the receipt call, <code>*ben</code> spreads the two order lines into <code>*lines</code>, and <code>**cfg</code> becomes <code>gst=0.12, tip=20</code>. This pattern, collect with <code>*args, **kwargs</code> and pass on with <code>*args, **kwargs</code>, is exactly how a wrapper forwards any call (see <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>In a definition, <code>*name</code> binds extra positional arguments as a tuple and <code>**name</code> binds extra keyword arguments as a dict; parameters after <code>*</code>/<code>*args</code> are <strong>keyword-only</strong>; parameters before <code>/</code> are <strong>positional-only</strong>. Full order: <code>def f(a, /, b, *args, c, **kwargs)</code>. In a call, <code>*iterable</code> and <code>**mapping</code> <strong>unpack</strong> into arguments.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>*args</code> is a tuple, not a list (no <code>append</code>). And <code>**kwargs</code> silently accepts typos: <code>receipt("Asha", gts=0.12)</code> puts <code>gts</code> into <code>extra</code> instead of raising. Accept <code>**kwargs</code> only when you really forward them.</p></div>

  <h2 id="pfn-scope"><span class="num">06</span>Scope: LEGB and Closures</h2>
  <p>If two functions both used a name like <code>total</code> and shared it, one would overwrite the other. Scope keeps each call's names private, and defines how a function finds names it did not create.</p>
  <p><strong>Scope</strong> is the region of code where a name can be seen. A name created inside a function (including its parameters) is <strong>local</strong>: it exists only while that call runs, and other functions cannot see it. A name created at the top level of the file is <strong>global</strong>: every function in the file can read it.</p>
  <div class="fx" data-lang="py">GST_RATE = 0.05                         # global: top level of the file
def tax(amount):
    t = amount * GST_RATE               # t and amount are local
    return round(t, 3)

print(tax(175.5))
try:
    print(t)
except NameError as e:
    print("NameError:", e)</div>
  <div class="fx" data-lang="text">8.775
NameError: name 't' is not defined</div>
  <h3>LEGB Lookup Order</h3>
  <p>When Python meets a name, it searches four places, from inside to outside, and uses the first match. The first letters spell <strong>LEGB</strong>: Local, Enclosing (an outer function, if this function is defined inside another), Global (the file), Built-in (names Python gives you, like <code>len</code>, <code>round</code>, <code>print</code>).</p>
  <figure class="viz"><svg viewBox="0 0 440 190" width="440">
    <rect x="5" y="5" width="430" height="180" rx="10" class="fs" stroke="currentColor"/><text x="15" y="24">B  built-in: len, round, print, sum</text>
    <rect x="25" y="34" width="390" height="140" rx="10" class="fv"/><text x="35" y="53">G  module globals: GST_RATE = 0.05</text>
    <rect x="45" y="63" width="350" height="100" rx="10" class="ft st"/><text x="55" y="82">E  outer(): where = "enclosing"</text>
    <rect x="65" y="92" width="310" height="60" rx="10" class="fb sb"/><text x="75" y="113">L  inner() / tax(): looks here first</text>
    <text x="75" y="136">miss → go one box out</text>
  </svg><figcaption>Lookup walks outward: Local → Enclosing → Global → Built-in. First match wins.</figcaption></figure>
  <table class="tbl"><caption>Trace: every name used inside tax(175.5)</caption>
    <tr><th>Name</th><th>L?</th><th>E?</th><th>G?</th><th>B?</th><th>Found in</th><th>Value</th></tr>
    <tr><td>amount</td><td>yes (parameter)</td><td></td><td></td><td></td><td>Local</td><td>175.5</td></tr>
    <tr><td>t</td><td>yes (assigned)</td><td></td><td></td><td></td><td>Local</td><td>8.775</td></tr>
    <tr><td>GST_RATE</td><td>no</td><td>(no outer function)</td><td>yes</td><td></td><td>Global</td><td>0.05</td></tr>
    <tr><td>round</td><td>no</td><td></td><td>no</td><td>yes</td><td>Built-in</td><td>the round function</td></tr>
    <tr><td>t (outside, after the call)</td><td colspan="4">not in G, not in B; tax's locals are gone</td><td>—</td><td>NameError</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Looking for your keys: your room first, then the house, then the street, then the lost-and-found office. You stop at the first place you find them.</p></div>
  <div class="fx" data-lang="py">where = "global"
def outer():
    where = "enclosing"
    def inner():
        print("inner sees:", where, "| len is", len)   # E, then B
    inner()
outer()</div>
  <div class="fx" data-lang="text">inner sees: enclosing | len is &lt;built-in function len&gt;</div>
  <p><code>inner</code> has no local <code>where</code>, so it finds the enclosing one ("enclosing") and never reaches the global. <code>len</code> is found only in Built-in.</p>
  <h3>Changing an outer name: global and nonlocal</h3>
  <p>Reading an outer name is free. <em>Rebinding</em> it (assigning to it) needs permission: <code>nonlocal x</code> for an enclosing function's name, <code>global x</code> for a module-level name.</p>
  <div class="fx" data-lang="py">label = "global"
def outer():
    label = "enclosing"
    def inner():
        nonlocal label                  # rebind outer's label
        label = "changed by inner"
    inner()
    print(label)
outer()
print(label)</div>
  <div class="fx" data-lang="text">changed by inner
global</div>
  <p>The rule that surprises everyone: Python decides scope <strong>before running</strong> the function. If a function assigns to a name anywhere in its body, that name is local for the <em>whole</em> body. So <code>bills_today += 1</code>, which reads then assigns, reads a local that has no value yet:</p>
  <div class="fx" data-lang="py">bills_today = 0
def record_bill():
    bills_today += 1                    # assignment makes it LOCAL everywhere in the function
try:
    record_bill()
except UnboundLocalError as e:
    print("UnboundLocalError:", e)

def record_bill_global():
    global bills_today
    bills_today += 1
record_bill_global(); record_bill_global()
print(bills_today)

def record_bill_pure(count):            # better: take the value in, give it back
    return count + 1
print(record_bill_pure(bills_today))</div>
  <div class="fx" data-lang="text">UnboundLocalError: cannot access local variable 'bills_today' where it is not associated with a value
2
3</div>
  <p>Three versions: the broken one, the <code>global</code> fix (works, but any function can now change the counter, which makes bugs hard to trace), and the cleaner design: take the value in as an argument and return the new value.</p>
  <h3>Closures: functions that remember</h3>
  <p>A counter that must survive between calls, without a global, is a classic use of a <strong>closure</strong>: an inner function that remembers the variables of the function it was created in, even after that outer function has returned. <code>nonlocal</code> lets it update them.</p>
  <div class="fx" data-lang="py">def make_bill_counter():
    n = 0
    def next_bill_no():
        nonlocal n
        n += 1
        return n
    return next_bill_no

next_no = make_bill_counter()
print(next_no(), next_no(), next_no())
other_stall = make_bill_counter()
print(other_stall(), next_no())</div>
  <div class="fx" data-lang="text">1 2 3
1 4</div>
  <table class="tbl"><caption>Trace: two counters, two separate remembered n's</caption>
    <tr><th>Call</th><th>Which n</th><th>n before</th><th>n after / returned</th></tr>
    <tr><td><code>next_no()</code></td><td>n of the first make_bill_counter call</td><td>0</td><td>1</td></tr>
    <tr><td><code>next_no()</code></td><td>same</td><td>1</td><td>2</td></tr>
    <tr><td><code>next_no()</code></td><td>same</td><td>2</td><td>3</td></tr>
    <tr><td><code>other_stall()</code></td><td>a <b>new</b> n (second make_bill_counter call)</td><td>0</td><td>1</td></tr>
    <tr><td><code>next_no()</code></td><td>the first n</td><td>3</td><td>4</td></tr>
  </table>
  <p><code>make_bill_counter</code> finished long ago, but each <code>next_bill_no</code> it created still holds its own <code>n</code>. Decorators (<a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>) are built on exactly this.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Scope</strong> is where a name is visible. Name lookup follows <strong>LEGB</strong>: Local, Enclosing function(s), Global (module), Built-in. Any assignment to a name inside a function makes it local throughout that function, unless declared <code>global</code> (rebind the module name) or <code>nonlocal</code> (rebind the nearest enclosing function's name). A <strong>closure</strong> is a function object that keeps references to variables of its enclosing scope.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Reading a global is fine. Rebinding it needs <code>global</code>. Changing it in place (<code>items.append</code>) needs nothing, which is also how hidden shared state sneaks in. Prefer passing values in and returning results over <code>global</code>. And remember: a loop's variables are not local to the loop (only functions create a new scope).</p></div>

  <h2 id="pfn-rec"><span class="num">07</span>Recursion</h2>
  <p>A loop handles one level of structure. Data that contains smaller copies of itself (nested boxes, folders, trees, JSON) can be any depth, and recursion handles that naturally.</p>
  <p>Some problems contain smaller copies of themselves. A folder contains folders. A box contains boxes. An order is "the first line plus the rest of the order". A <strong>recursive</strong> function solves such a problem by calling itself on the smaller copy. It must stop at a <strong>base case</strong>, a case small enough to answer directly. Without a base case it would call itself forever.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>In a long queue you ask "what is my position?" to the person ahead. They ask the person ahead of them, and so on. The first person says "1" (base case). Each answer comes back +1.</p></div>
  <p>The smallest example: a countdown. <code>countdown(3)</code> prints 3 and hands the smaller job <code>countdown(2)</code> to itself. At 0 it stops.</p>
  <div class="fx" data-lang="py">def countdown(n):
    if n == 0:            # base case: stop here
        print("Go!")
        return
    print(n)
    countdown(n - 1)      # smaller problem
countdown(3)</div>
  <div class="fx" data-lang="text">3
2
1
Go!</div>
  <h3>The Call Stack, Traced</h3>
  <p>Think of an order recursively: the total of an order is (first line's amount) + (total of the rest). The total of an empty order is 0 (base case). The function prints each step, indented by depth, so you can see the calls go down and the answers come back up.</p>
  <div class="fx" data-lang="py">def total(lines, depth=0):
    pad = "  " * depth
    if not lines:                               # base case: empty order
        print(pad + "total([]) = 0")
        return 0
    item, qty, price = lines[0]
    print(pad + f"total({len(lines)} line(s)) = {qty * price} + total(rest)")
    result = qty * price + total(lines[1:], depth + 1)   # smaller problem
    print(pad + f"returns {result}")
    return result

print(total(asha))                              # asha = 2 chai@30, 3 samosa@15, 1 cold coffee@90</div>
  <div class="fx" data-lang="text">total(3 line(s)) = 60 + total(rest)
  total(2 line(s)) = 45 + total(rest)
    total(1 line(s)) = 90 + total(rest)
      total([]) = 0
    returns 90
  returns 135
returns 195
195</div>
  <p>Every call that is waiting for an answer keeps its own local names in a <strong>frame</strong> on the <strong>call stack</strong> (the pile of calls not yet finished). The table shows the stack at its deepest moment, and then how it unwinds.</p>
  <table class="tbl"><caption>Call stack for total(asha) (top row = most recent call)</caption>
    <tr><th>Frame</th><th>lines</th><th>Waiting to compute</th><th>Gets back</th><th>Returns</th></tr>
    <tr><td>4 (top)</td><td>[]</td><td>— base case</td><td>—</td><td>0</td></tr>
    <tr><td>3</td><td>[cold coffee]</td><td>90 + total([])</td><td>0</td><td>90</td></tr>
    <tr><td>2</td><td>[samosa, cold coffee]</td><td>45 + total([cold coffee])</td><td>90</td><td>135</td></tr>
    <tr><td>1 (bottom)</td><td>[chai, samosa, cold coffee]</td><td>60 + total([samosa, cold coffee])</td><td>135</td><td>195</td></tr>
  </table>
  <p>For a flat order a loop is simpler. Recursion shines on <em>nested</em> data, where a loop would need one nested loop per level and you do not know how many levels there are:</p>
  <div class="fx" data-lang="py">party = [
    ("masala chai", 2, 30),
    ("box", [("samosa", 2, 15),
             ("box", [("vada pav", 1, 20), ("samosa", 1, 15)])]),
    ("cold coffee", 1, 90),
]
def box_total(lines):
    s = 0
    for line in lines:
        if line[0] == "box":
            s += box_total(line[1])     # a box is a smaller order: recurse
        else:
            item, qty, price = line
            s += qty * price
    return s
print(box_total(party))</div>
  <div class="fx" data-lang="text">215</div>
  <p>By hand: chai 60; outer box = samosas 30 + inner box (20 + 15 = 35) = 65; cold coffee 90. Total 60 + 65 + 90 = 215. One function handles any depth of boxes.</p>
  <h3>Limits and memoisation</h3>
  <p>The classic example is factorial: 5! = 5 × 4 × 3 × 2 × 1. Every waiting call takes memory, and Python stops you at about 1000 waiting calls to protect itself.</p>
  <figure class="viz"><svg viewBox="0 0 520 190" width="520">
    <defs><marker id="pfn-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" class="tm">calls go down</text>
    <text x="380" y="16" class="tm">answers come up</text>
    <rect x="120" y="26" width="200" height="30" rx="6" class="fb sb"/><text x="132" y="46">fact(3) = 3 * fact(2)</text>
    <rect x="120" y="74" width="200" height="30" rx="6" class="fb sb"/><text x="132" y="94">fact(2) = 2 * fact(1)</text>
    <rect x="120" y="122" width="200" height="30" rx="6" class="fg sg"/><text x="132" y="142">fact(1) = 1  (base)</text>
    <line x1="160" y1="56" x2="160" y2="72" stroke="currentColor" marker-end="url(#pfn-ah4)"/>
    <line x1="160" y1="104" x2="160" y2="120" stroke="currentColor" marker-end="url(#pfn-ah4)"/>
    <line x1="290" y1="120" x2="290" y2="106" stroke="currentColor" marker-end="url(#pfn-ah4)"/>
    <line x1="290" y1="72" x2="290" y2="58" stroke="currentColor" marker-end="url(#pfn-ah4)"/>
    <text x="340" y="142" class="tg">returns 1</text>
    <text x="340" y="94" class="tg">returns 2*1 = 2</text>
    <text x="340" y="46" class="tg">returns 3*2 = 6</text>
    <text x="60" y="178" class="tm">each waiting call uses memory: too deep → RecursionError</text>
  </svg><figcaption>Each call waits for the one below it. The base case starts the answers coming back.</figcaption></figure>
  <div class="fx" data-lang="py">import sys
from functools import lru_cache
def fact(n):
    return 1 if n &lt;= 1 else n * fact(n - 1)   # base case + smaller step
print(fact(5))
print(sys.getrecursionlimit())
try:
    fact(5000)
except RecursionError as e:
    print("RecursionError:", e)

@lru_cache(maxsize=None)            # memoise: each n computed once
def fib(n):
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)
print(fib(80))</div>
  <div class="fx" data-lang="text">120
1000
RecursionError: maximum recursion depth exceeded
23416728348467685</div>
  <p>The last part uses <code>@lru_cache</code> (the <code>@</code> line is a decorator; see <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>). Plain <code>fib(n)</code> asks for <code>fib(n-1)</code> and <code>fib(n-2)</code>, and those ask again, so the same small values get computed an astronomical number of times. <code>@lru_cache</code> saves each answer the first time and reuses it. Saving answers to reuse later is called <strong>memoisation</strong>. With it, <code>fib(80)</code> is instant.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>recursive</strong> function calls itself on a smaller instance of its problem and stops at one or more <strong>base cases</strong>. Each active call occupies a stack frame; CPython's default limit is 1000 frames (<code>sys.getrecursionlimit()</code>), beyond which <code>RecursionError</code> is raised. Python performs no tail-call optimisation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Missing or unreachable base case → RecursionError. For depth in the thousands (long lists, deep trees), use a loop or your own stack (a list) instead; raising the limit can crash Python. And recursion that repeats sub-problems is exponentially slow without memoisation.</p></div>

  <h2 id="pfn-lambda"><span class="num">08</span>lambda Expressions</h2>
  <p>A <strong>lambda</strong> is a one-expression function with no name. <code>lambda line: line[1] * line[2]</code> means "take line, give back line[1] × line[2]". The expression's value is returned automatically; there is no <code>return</code> keyword and no statements.</p>
  <div class="fx" data-lang="py">amount = lambda line: line[1] * line[2]     # a function with no def
print(amount(("samosa", 3, 15)))
print(sorted(asha, key=lambda line: line[1] * line[2], reverse=True))
print(sorted(asha, key=lambda line: line[2]))     # by unit price, cheapest first
print(list(map(lambda line: line[0].upper(), asha)))
print(max(asha, key=amount))</div>
  <div class="fx" data-lang="text">45
[('cold coffee', 1, 90), ('masala chai', 2, 30), ('samosa', 3, 15)]
[('samosa', 3, 15), ('masala chai', 2, 30), ('cold coffee', 1, 90)]
['MASALA CHAI', 'SAMOSA', 'COLD COFFEE']
('cold coffee', 1, 90)</div>
  <ul>
    <li>Line 1: a lambda can be named like any value (but then a <code>def</code> is clearer).</li>
    <li><code>key=</code> tells <code>sorted</code> what to compare: here the line's amount (90, 60, 45 with <code>reverse=True</code>), then its unit price (15, 30, 90).</li>
    <li><code>map(f, items)</code> applies f to every item.</li>
    <li><code>max(asha, key=amount)</code>: the best-so-far pattern from <a class="xref" data-note="py_control">Decisions &amp; Loops</a> in one call.</li>
  </ul>
  <h3>The late-binding trap</h3>
  <p>Three discount rules (5%, 10%, 15%) built in a loop all give 30.0 on ₹200:</p>
  <div class="fx" data-lang="py">rules = [lambda amt: amt * p for p in (0.05, 0.10, 0.15)]
print([rules[i](200) for i in range(3)])           # all use the LAST p
rules = [lambda amt, p=p: amt * p for p in (0.05, 0.10, 0.15)]
print([rules[i](200) for i in range(3)])           # p frozen per lambda</div>
  <div class="fx" data-lang="text">[30.0, 30.0, 30.0]
[10.0, 20.0, 30.0]</div>
  <p>A lambda (like any function) reads outside variables when it is <em>called</em>, not when it is made. This is called <strong>late binding</strong>. All three lambdas read <code>p</code> after the loop ended, so all see 0.15. <code>p=p</code> fixes it: a default value is evaluated when the function is <em>created</em>, so each lambda stores its own p.</p>
  <table class="tbl"><caption>Trace: what p each rule uses at call time</caption>
    <tr><th>Rule</th><th>Created when p was</th><th>Without p=p, reads p at call time</th><th>Result</th><th>With p=p</th><th>Result</th></tr>
    <tr><td>0</td><td>0.05</td><td>0.15</td><td>30.0</td><td>0.05</td><td>10.0</td></tr>
    <tr><td>1</td><td>0.10</td><td>0.15</td><td>30.0</td><td>0.10</td><td>20.0</td></tr>
    <tr><td>2</td><td>0.15</td><td>0.15</td><td>30.0</td><td>0.15</td><td>30.0</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>lambda params: expression</code> creates an anonymous function whose body is a single expression, returned implicitly. It supports the same parameter kinds as <code>def</code> (defaults, *args, …) but no statements or annotations.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Use lambda only for short throwaway functions passed as arguments. Anything you would name, reuse or test deserves a <code>def</code> (better error messages show the name). And remember late binding when creating functions in a loop.</p></div>

  <h2 id="pfn-values"><span class="num">09</span>First-Class and Higher-Order Functions</h2>
  <p>Writing <code>bill_regular</code>, <code>bill_festival</code> and <code>bill_student</code> would copy the billing logic three times. Because functions are values, one <code>bill</code> can take the discount rule as an argument.</p>
  <p>In Python, functions are <strong>first-class</strong> objects: like a number or a list, a function can be given another name, stored in a list or dict, passed into another function, and returned from one.</p>
  <h3>Store them</h3>
  <div class="fx" data-lang="py">f = subtotal                            # a second name for the same function
print(f(asha), f is subtotal)
rules = {
    "regular": discount,                # our 10%-at-150 rule
    "festival": lambda sub: sub * 0.20, # 20% off everything
    "none": lambda sub: 0,
}
for name, rule in rules.items():
    print(f"{name:8}", rule(195))</div>
  <div class="fx" data-lang="text">195 True
regular  19.5
festival 39.0
none     0</div>
  <h3>Pass them in</h3>
  <p><code>bill</code> takes the rule as a parameter, with our regular rule as the default. It does not care which function it gets, only that it can call it with a subtotal.</p>
  <div class="fx" data-lang="py">def bill(lines, discount_rule=discount, gst=0.05):
    sub = subtotal(lines)
    after = sub - discount_rule(sub)    # call whatever function was passed in
    return round(with_tax(after, gst))

print(bill(asha), bill(asha, rules["festival"]), bill(ben, rules["none"]))</div>
  <div class="fx" data-lang="text">184 164 74</div>
  <p>Regular rule: ₹184. Festival rule: 195 × 0.8 = 156, × 1.05 = 163.8 → ₹164. No discount on a ₹70 order: ₹74. One <code>bill</code>, any rule. Functions that take functions are called <strong>higher-order functions</strong>; <code>sorted(key=...)</code> was one.</p>
  <h3>Return them</h3>
  <p>A function can <em>build</em> and return a new function. <code>make_discount(0.15)</code> returns a rule that remembers its own pct and threshold: a closure.</p>
  <div class="fx" data-lang="py">def make_discount(pct, at=0):           # a function that BUILDS functions
    def rule(sub):
        return sub * pct if sub &gt;= at else 0
    return rule

student = make_discount(0.15)
bulk = make_discount(0.10, at=150)
print(student(70), bulk(195), bulk(70), bill(ben, student))</div>
  <div class="fx" data-lang="text">10.5 19.5 0 62</div>
  <p>Student rule on a ₹70 order: 70 − 10.5 = 59.5, × 1.05 = 62.475 → ₹62.</p>
  <h3>Wrapping Functions</h3>
  <p>Put the pieces together: a function that <strong>takes</strong> a function and <strong>returns</strong> a new function that calls the old one with some extra behaviour around it. Here the extra behaviour is a log line. <code>*args, **kwargs</code> let the wrapper accept and forward any call.</p>
  <div class="fx" data-lang="py">def logged(func):                       # takes a function, returns a new one
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(f"  [log] {func.__name__}{args} -&gt; {result}")
        return result
    return wrapper

logged_tax = logged(with_tax)           # a new function that wraps the old one
print(round(logged_tax(175.5)))
print(round(with_tax(175.5)))           # the original is untouched: no log line</div>
  <div class="fx" data-lang="text">  [log] with_tax(175.5,) -&gt; 184.275
184
184</div>
  <p><code>logged_tax</code> logs and then returns the same 184.275 as <code>with_tax</code>. Writing <code>with_tax = logged(with_tax)</code> would replace the original name with the logged version; Python's <code>@logged</code> line above a <code>def</code> is shorthand for exactly that. That shorthand, and what it is used for (timing, caching like <code>@lru_cache</code>, access checks), is the whole topic of <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Functions are <strong>first-class objects</strong>: they can be bound to names, stored in data structures, passed as arguments and returned as results. A <strong>higher-order function</strong> takes or returns functions. A <strong>wrapper</strong> is a function returned by a higher-order function that calls the original with added behaviour; a <strong>decorator</strong> is such a higher-order function applied with <code>@</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Pass the function, not its result: <code>bill(asha, festival)</code>, not <code>bill(asha, festival(195))</code> (that passes a number, and <code>bill</code> then fails trying to call it). A wrapper written without <code>functools.wraps</code> also hides the original's name and docstring; the Decorators note fixes that.</p></div>

  <h2 id="pfn-doc"><span class="num">10</span>Docstrings and Type Hints</h2>
  <p>A signature shows parameter names but not what they mean or what types they expect. Docstrings and annotations record that contract where people, editors and type checkers can read it.</p>
  <p>A <strong>docstring</strong> is a string written as the first statement of a function's body. Python stores it in <code>__doc__</code>, and <code>help(f)</code> and every editor show it. <strong>Type hints</strong> (annotations) are written after parameter names (<code>gst: float</code>) and after <code>-&gt;</code> for the return type. Python stores them in <code>__annotations__</code>.</p>
  <div class="fx" data-lang="py">def bill_total(lines: list[tuple[str, int, int]], gst: float = 0.05) -&gt; int:
    """Return the rounded bill for one order.

    lines: (item, qty, price) tuples. 10% off at 150+, then GST.
    """
    sub = subtotal(lines)
    return round((sub - discount(sub)) * (1 + gst))

print(bill_total(asha))
print(bill_total.__doc__.splitlines()[0])
print(bill_total.__annotations__)
import inspect
print(inspect.signature(bill_total))</div>
  <div class="fx" data-lang="text">184
Return the rounded bill for one order.
{'lines': list[tuple[str, int, int]], 'gst': &lt;class 'float'&gt;, 'return': &lt;class 'int'&gt;}
(lines: list[tuple[str, int, int]], gst: float = 0.05) -&gt; int</div>
  <p><code>list[tuple[str, int, int]]</code> reads "a list of tuples of (str, int, int)": exactly our order lines. <code>inspect.signature</code> shows the whole calling contract in one line.</p>
  <h3>Hints are not checks</h3>
  <div class="fx" data-lang="py">def double(x: int) -&gt; int:
    return x * 2
print(double(21), double("ab"), double([0]))   # hints are not checked at run time</div>
  <div class="fx" data-lang="text">42 abab [0, 0]</div>
  <p>Python itself ignores type hints when running: <code>double("ab")</code> happily returns "abab". Hints are for humans and for tools: editors use them for autocomplete and warnings, and a checker like <code>mypy</code> reports <code>double("ab")</code> as an error <em>before</em> the code runs. Libraries such as Pydantic and FastAPI read hints to validate data at run time on purpose.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>docstring</strong> is a string literal as the first statement of a function, class or module, stored in <code>__doc__</code>. <strong>Annotations</strong> <code>def f(x: T = default) -&gt; R</code> attach type information, stored in <code>__annotations__</code>; CPython does not enforce them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not rely on hints to reject bad input: validate explicitly (or with a library) where data enters the program. And keep docstrings true: a docstring that says "5% GST" after the rate became a parameter is worse than none.</p></div>

  <h2 id="pfn-build"><span class="num">11</span>Worked Example: an Event Router</h2>
  <p>A router receives event dicts like <code>{"type": "bill", "customer": "Asha", "lines": asha}</code> and dispatches each one. It combines helper functions that return values, a <code>None</code> default, a keyword-only flag, <code>**meta</code>, a dict of handler functions, lambdas and <code>match</code> guards (see <a class="xref" data-note="py_control">Decisions &amp; Loops</a>). Predict each line, then read the output.</p>
  <div class="fx" data-lang="py">def till(event, handlers=None, *, verbose=False, **meta):
    handlers = handlers if handlers is not None else {}
    match event:
        case {"type": "bill", "customer": str(name), "lines": [*lines]}:
            sub = subtotal(lines)
            out = f"{name}: subtotal {sub}, bill {round(with_tax(sub - discount(sub)))}"
        case {"type": "pay", "amount": int(paid), "total": int(due)} if paid &gt;= due:
            out = f"change {paid - due}"
        case {"type": "pay"}:
            out = "payment too small"
        case {"type": t}:
            out = handlers.get(t, lambda: f"no handler for {t!r}")()
        case _:
            out = "malformed event"
    if verbose:
        out += f" {meta}"
    return out

print(till({"type": "bill", "customer": "Asha", "lines": asha}))
print(till({"type": "bill", "customer": "Ben", "lines": ben}, verbose=True, waiter="Ravi"))
print(till({"type": "pay", "amount": 200, "total": 184}))
print(till({"type": "pay", "amount": 50, "total": 52}))
print(till({"type": "close"}, {"close": lambda: "till closed, day total 310"}))
print(till({"type": "refund"}))
print(till(["not", "a", "dict"]))</div>
  <div class="fx" data-lang="text">Asha: subtotal 195, bill 184
Ben: subtotal 70, bill 74 {'waiter': 'Ravi'}
change 16
payment too small
till closed, day total 310
no handler for 'refund'
malformed event</div>
  <ul>
    <li>Line 1–2: the "bill" pattern pulls out the name and lines and calls <code>subtotal</code>, <code>discount</code>, <code>with_tax</code>. With <code>verbose=True</code>, the extra keyword <code>waiter="Ravi"</code> arrives in <code>meta</code>.</li>
    <li>Line 3–4: the "pay" pattern has a guard; ₹50 for a ₹52 bill fails the guard and falls to the next "pay" case.</li>
    <li>Line 5: no built-in case for "close", so it looks in <code>handlers</code>, finds a function, and calls it.</li>
    <li>Line 6: no handler: <code>.get</code> returns the default lambda, which is then called.</li>
    <li>Line 7: a list, not a dict: only <code>_</code> fits.</li>
  </ul>
  <p>The higher-order <code>bill</code> from above, run over several orders with a dict comprehension:</p>
  <div class="fx" data-lang="py">day = {"Asha": asha, "Ben": ben, "Chen": chen}
bills = {name: bill(lines) for name, lines in day.items()}
print(bills, "day total:", sum(bills.values()))</div>
  <div class="fx" data-lang="text">{'Asha': 184, 'Ben': 74, 'Chen': 52} day total: 310</div>
  <p><strong>Extend it:</strong> add a <code>"batch"</code> case that matches <code>{"type": "batch", "events": [*evs]}</code> and routes each event by calling <code>till</code> recursively.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Each handler must <em>return</em> its text; one that prints instead would make <code>out</code> None and <code>out += ...</code> would fail. The router's job is to return, the caller's job is to print.</p></div>

  <h2 id="pfn-traps"><span class="num">12</span>Common Mistakes</h2>
  <table class="tbl">
    <tr><th>Mistake</th><th>What happens</th><th>Fix</th></tr>
    <tr><td>Printing instead of returning</td><td>Caller gets None; <code>None + 10</code> TypeError</td><td><code>return</code> the value; print at the top level</td></tr>
    <tr><td><code>order = order.sort()</code></td><td>order becomes None</td><td><code>order.sort()</code> or <code>order = sorted(order)</code></td></tr>
    <tr><td><code>def f(x=[])</code> / <code>x={}</code></td><td>One shared object across calls</td><td><code>x=None</code>; create inside</td></tr>
    <tr><td>Default from a global (<code>rate=GST</code>)</td><td>Frozen at def time</td><td>Read the global inside, or pass explicitly</td></tr>
    <tr><td>Swapped positional arguments</td><td>Wrong result, no error</td><td>Keyword arguments; keyword-only parameters</td></tr>
    <tr><td><code>count += 1</code> on a global</td><td>UnboundLocalError</td><td>Pass in and return; or <code>global</code></td></tr>
    <tr><td>Lambdas made in a loop</td><td>All see the last loop value</td><td><code>lambda x, p=p: …</code> or <code>functools.partial</code></td></tr>
    <tr><td>Recursion without a reachable base case</td><td>RecursionError</td><td>Base case first; shrink the problem every call</td></tr>
    <tr><td>Deep recursion on long data</td><td>RecursionError at ~1000</td><td>A loop or an explicit stack</td></tr>
    <tr><td>Passing <code>f()</code> instead of <code>f</code></td><td>Passes the result, not the function</td><td>No brackets when passing</td></tr>
    <tr><td><code>**kwargs</code> swallowing typos</td><td><code>gts=0.12</code> silently ignored</td><td>Keyword-only parameters; validate kwargs</td></tr>
    <tr><td>Trusting type hints to validate</td><td><code>double("ab")</code> runs</td><td>Explicit checks; mypy in CI</td></tr>
  </table>

  <h2 id="pfn-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>def, call, return</h3>
  <ul>
    <li><code>def name(params): body</code> runs once, creating a function object bound to <code>name</code>; the body runs on each call.</li>
    <li>A call binds arguments to parameters in a fresh local scope, runs the body, and evaluates to the return value.</li>
    <li>No <code>return</code> (or bare <code>return</code>) → <code>None</code>. <code>return a, b</code> returns one tuple. <code>return</code> exits immediately (early return).</li>
    <li>In-place methods (<code>list.sort</code>, <code>list.append</code>, <code>dict.update</code>) return None: <code>xs = xs.sort()</code> loses the list.</li>
    <li><code>f</code> is the function object; <code>f()</code> calls it. Pass <code>f</code>, not <code>f()</code>, as a callback.</li>
  </ul>
  <h3>Parameters</h3>
  <table class="tbl">
    <tr><th>Kind</th><th>Syntax</th><th>Caller must</th></tr>
    <tr><td>Positional-only</td><td>before <code>/</code></td><td>pass by position</td></tr>
    <tr><td>Positional-or-keyword</td><td><code>b</code>, <code>b=default</code></td><td>either</td></tr>
    <tr><td>Var-positional</td><td><code>*args</code></td><td>extra positionals → tuple</td></tr>
    <tr><td>Keyword-only</td><td>after <code>*</code> or <code>*args</code></td><td>pass by name</td></tr>
    <tr><td>Var-keyword</td><td><code>**kwargs</code></td><td>extra keywords → dict</td></tr>
  </table>
  <ul>
    <li>Full order: <code>def f(a, /, b, *args, c, **kwargs)</code>. In calls, positional arguments come before keyword arguments.</li>
    <li>Call-site unpacking: <code>f(*seq, **mapping)</code>. Forwarding: <code>def wrapper(*args, **kwargs): return func(*args, **kwargs)</code>.</li>
    <li>Binding errors raise TypeError: missing argument, too many positionals, "got multiple values for argument".</li>
  </ul>
  <h3>Defaults</h3>
  <ul>
    <li>Evaluated <b>once</b> at <code>def</code> time, stored in <code>f.__defaults__</code>.</li>
    <li>Mutable default (<code>[]</code>, <code>{}</code>, <code>set()</code>) is shared across calls. Idiom: <code>def f(x=None): if x is None: x = []</code>.</li>
    <li><code>def f(rate=GST)</code> freezes GST's value at definition time.</li>
  </ul>
  <h3>Scope</h3>
  <ul>
    <li>Lookup order <b>LEGB</b>: Local → Enclosing function → Global (module) → Built-in.</li>
    <li>Any assignment to a name in a function makes it local for the whole function (decided at compile time) → <code>count += 1</code> on a global raises <code>UnboundLocalError</code>.</li>
    <li><code>global x</code> rebinds a module name; <code>nonlocal x</code> rebinds the nearest enclosing function's name. Mutating (<code>xs.append</code>) needs neither.</li>
    <li>Only functions (and classes, comprehensions) create scopes; <code>if</code>/<code>for</code>/<code>while</code> blocks do not.</li>
    <li><b>Closure</b>: an inner function keeps references to enclosing variables after the outer function returns (<code>f.__closure__</code>). Basis of factories and decorators.</li>
  </ul>
  <h3>Recursion</h3>
  <ul>
    <li>Base case + recursive call on a smaller input. Each active call is a stack frame.</li>
    <li>Default limit 1000 (<code>sys.getrecursionlimit()</code>) → <code>RecursionError</code>; no tail-call optimisation. Deep inputs: loop + explicit stack.</li>
    <li>Overlapping sub-problems: memoise with <code>@functools.lru_cache(maxsize=None)</code> or <code>@functools.cache</code>.</li>
  </ul>
  <h3>lambda and higher-order functions</h3>
  <ul>
    <li><code>lambda params: expr</code>: one expression, implicit return, no statements or annotations.</li>
    <li>Common uses: <code>sorted(xs, key=lambda r: r[1])</code>, <code>max(..., key=...)</code>, <code>map</code>, <code>filter</code>.</li>
    <li><b>Late binding</b>: closures read outer variables at call time, so lambdas built in a loop all see the last value. Fix: <code>lambda x, p=p: ...</code> or <code>functools.partial</code>.</li>
    <li>Higher-order function: takes or returns a function (<code>sorted</code>, <code>map</code>, factories like <code>make_discount(0.15)</code>, decorators).</li>
    <li><code>functools.partial(f, rate=0.12)</code> pre-fills arguments.</li>
  </ul>
  <h3>Docstrings and type hints</h3>
  <ul>
    <li>Docstring = first string literal in the body; <code>f.__doc__</code>, <code>help(f)</code>.</li>
    <li>Hints: <code>def f(lines: list[tuple[str, int, int]], gst: float = 0.05) -&gt; int</code>; stored in <code>__annotations__</code>; <code>inspect.signature(f)</code>.</li>
    <li>Not enforced at run time; checked by mypy/pyright and IDEs; Pydantic/FastAPI validate with them on purpose.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Print instead of return → caller gets None.</li>
    <li>Mutable default shared between calls.</li>
    <li>Assigning to a global inside a function → UnboundLocalError.</li>
    <li>Lambdas created in a loop all use the final loop value.</li>
    <li><code>**kwargs</code> silently swallows misspelt keyword arguments.</li>
    <li>Swapped positional arguments give wrong answers without an error: use keywords.</li>
    <li>A wrapper without <code>functools.wraps</code> hides the original <code>__name__</code> and docstring.</li>
  </ul>

  <h2 id="pfn-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a parameter and an argument?</summary><div class="qa-body">A parameter is a name in the function definition (<code>def with_tax(amount, rate=0.05)</code>); an argument is the value supplied in a call (<code>with_tax(175.5, rate=0.12)</code>). Arguments bind to parameters positionally first, then by keyword.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a function return if it has no <code>return</code> statement?</summary><div class="qa-body"><code>None</code>. This is why a helper that prints its result cannot be reused (<code>x = show(…)</code> is None, and <code>x + 10</code> raises TypeError), and why <code>xs = xs.sort()</code> sets <code>xs</code> to None: in-place methods return None by convention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>def f(x, l=[]): l.append(x); return l</code>, then <code>f(1); f(2); print(f(3))</code></summary><div class="qa-body"><code>[1, 2, 3]</code>. The default list is created once when <code>def</code> executes and stored in <code>f.__defaults__</code>; every call that omits <code>l</code> appends to that same list. Fix: <code>def f(x, l=None): if l is None: l = []</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are <code>*args</code> and <code>**kwargs</code>?</summary><div class="qa-body">In a definition, <code>*args</code> collects extra positional arguments into a tuple and <code>**kwargs</code> collects extra keyword arguments into a dict. In a call, <code>*seq</code> and <code>**mapping</code> unpack into arguments. Together they let a wrapper accept and forward any call: <code>return func(*args, **kwargs)</code>. The names are convention; the stars do the work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>/</code> and <code>*</code> mean in a parameter list?</summary><div class="qa-body">Parameters before <code>/</code> are positional-only; parameters after <code>*</code> (or <code>*args</code>) are keyword-only. <code>def pay(amount, /, *, method="cash")</code> forces <code>pay(184, method="upi")</code>. Keyword-only parameters prevent swapped arguments and let you add or reorder options later; positional-only lets you rename a parameter without breaking callers (many built-ins use it).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a function change a variable in the caller?</summary><div class="qa-body">It can mutate the object the caller passed (append to a list, set a dict key), and the caller sees it, because the parameter is another name for the same object. It cannot rebind the caller's variable: <code>param = []</code> inside the function only moves the local name. This is "call by object reference" (call by sharing).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the LEGB rule.</summary><div class="qa-body">When a name is read, Python searches Local (the current function), Enclosing (outer functions, innermost first), Global (the module), then Built-in (<code>len</code>, <code>print</code>), and uses the first match; if none, NameError. Which scope a name belongs to is decided at compile time from where it is assigned.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does this raise <code>UnboundLocalError</code>? <code>x = 10</code>; <code>def show(): print(x); x = 5</code></summary><div class="qa-body">Because <code>x</code> is assigned somewhere in <code>show</code>, the compiler treats it as local for the whole function. The <code>print(x)</code> then reads a local that has no value yet: "cannot access local variable 'x' where it is not associated with a value". Fix: rename, pass it in as a parameter, or declare <code>global x</code> if you really mean the module variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>global</code> and <code>nonlocal</code>?</summary><div class="qa-body"><code>global x</code> makes assignments in the function rebind the module-level <code>x</code>. <code>nonlocal x</code> rebinds <code>x</code> in the nearest enclosing function scope (it must already exist there); it is what lets a closure update a counter. Neither is needed just to read, or to mutate an object in place.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a closure? Give a practical use.</summary><div class="qa-body">A function that keeps references to variables from the scope where it was defined, after that scope has returned. <code>make_discount(0.15)</code> returns <code>rule</code>, which still sees <code>pct</code> (stored in <code>rule.__closure__</code>). Uses: function factories, counters without globals, callbacks carrying configuration, and decorators (the wrapper closes over <code>func</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>fs = [lambda: i for i in range(3)]; print([f() for f in fs])</code></summary><div class="qa-body"><code>[2, 2, 2]</code>. Each lambda looks up <code>i</code> when it is called, not when it was created (late binding), and by then the comprehension has finished with <code>i = 2</code>. Fix: bind the current value as a default, <code>lambda i=i: i</code>, or use <code>functools.partial</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the limitations of <code>lambda</code> compared to <code>def</code>?</summary><div class="qa-body">A lambda is a single expression: no statements (no assignment except <code>:=</code>, no <code>try</code>, no loops), no annotations, no docstring, and its <code>__name__</code> is <code>&lt;lambda&gt;</code>, which makes tracebacks less clear. It supports the same parameter kinds. Use it for short key functions and callbacks; use <code>def</code> for anything you would name, reuse or test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "functions are first-class objects" mean? What is a higher-order function?</summary><div class="qa-body">Functions can be bound to names, stored in containers, passed as arguments and returned from other functions, like any other object. A higher-order function takes or returns functions: <code>sorted(xs, key=...)</code>, <code>map</code>, <code>filter</code>, <code>functools.partial</code>, factories like <code>make_discount</code>, and decorators.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a decorator, in one sentence, and how does it relate to closures?</summary><div class="qa-body">A decorator is a callable that takes a function and returns a replacement, applied with <code>@dec</code> above a <code>def</code> (shorthand for <code>f = dec(f)</code>). The replacement is usually a closure over the original <code>func</code> that accepts <code>*args, **kwargs</code>, adds behaviour (logging, timing, caching, retries) and forwards the call. See <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you return multiple values from a function?</summary><div class="qa-body"><code>return a, b</code> returns one tuple, which the caller can unpack: <code>share, left = split_bill(184, 3)</code> gives 61 and 1. For more than two or three values, return a <code>namedtuple</code>, dataclass or dict so fields have names.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your recursive function raises <code>RecursionError</code> on deep input. What are your options?</summary><div class="qa-body">CPython limits recursion depth to about 1000 frames and does no tail-call optimisation. Best fix: rewrite iteratively with an explicit stack (a list) or a loop. <code>sys.setrecursionlimit</code> is a stopgap that can crash the interpreter with a C stack overflow. If the recursion recomputes the same sub-problems, memoise with <code>@lru_cache</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@functools.lru_cache</code> do, and when must you not use it?</summary><div class="qa-body">It memoises: results are stored in a dict keyed by the arguments, so repeated calls return instantly (naive <code>fib(80)</code> becomes instant). Arguments must be hashable, so lists and dicts cannot be passed. Do not use it on functions with side effects or results that depend on changing external state, and bound it (<code>maxsize</code>) if the argument space is large.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are type hints enforced at run time?</summary><div class="qa-body">No. <code>def double(x: int) -&gt; int</code> happily returns "abab" for <code>double("ab")</code>. Hints are stored in <code>__annotations__</code> and used by static checkers (mypy, pyright), IDEs, and libraries that opt in to validation such as Pydantic and FastAPI. Validate untrusted input explicitly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>functools.partial</code> used for?</summary><div class="qa-body">It creates a new callable with some arguments pre-filled: <code>gst12 = partial(with_tax, rate=0.12)</code>, then <code>gst12(100)</code> gives 112.0. Useful for callbacks that must take fewer arguments than your function, for fixing hyperparameters before passing a function to a library, and as a late-binding-safe alternative to lambdas in loops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why prefer pure functions (no side effects, no globals) where possible?</summary><div class="qa-body">A pure function's output depends only on its inputs, so it is easy to test, reason about, cache and run in parallel. Functions that read or rebind globals, or mutate their arguments, create hidden coupling: the bug appears far from its cause. Pass inputs in, return outputs, and keep I/O at the edges.</div></details>

</main>
`
});
