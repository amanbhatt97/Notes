// notes/python/py_functions.js — Functions
Object.assign(TOPIC_CONTENT, {
  "py_functions": `<main>
<h1>Functions</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Functions</span></div>
  <p class="lead">A <strong>function</strong> is a block of code with a name: you write it once and run it from anywhere, as often as you like, with different inputs. This note turns Chai Corner's billing script into a handful of small named functions (<code>subtotal</code>, <code>discount</code>, <code>with_tax</code>, <code>bill</code>) and uses them to teach everything about functions: <code>def</code>, <code>return</code> and <code>None</code>, parameters vs arguments, positional, keyword and default arguments, the mutable-default trap (traced), <code>*args</code>/<code>**kwargs</code> and unpacking, scope and the LEGB rule (traced), <code>global</code>/<code>nonlocal</code> and closures, recursion with a call-stack table, <code>lambda</code>, functions as values (the doorway to decorators), and docstrings and type hints. Code here was run on Python 3.13.</p>

  <h2 id="pfn-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
<defs><marker id="pfn-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="230" y="8" width="200" height="36" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="31" text-anchor="middle" font-size="12">Python Basics: the Map</text>
<line x1="330" y1="44" x2="560" y2="80" stroke="currentColor" marker-end="url(#pfn-a0)"/>
<rect x="15" y="82" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="100" y="103" text-anchor="middle" font-size="12">Values, Types &amp; Variables</text><text x="100" y="121" text-anchor="middle" class="tm" font-size="10">the raw material</text>
<line x1="185" y1="107" x2="243" y2="107" stroke="currentColor" marker-end="url(#pfn-a0)"/>
<rect x="245" y="82" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="103" text-anchor="middle" font-size="12">Decisions &amp; Loops</text><text x="330" y="121" text-anchor="middle" class="tm" font-size="10">choose and repeat</text>
<line x1="415" y1="107" x2="473" y2="107" stroke="currentColor" marker-end="url(#pfn-a0)"/>
<rect x="475" y="82" width="170" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="560" y="103" text-anchor="middle" font-size="12.5" font-weight="700">Functions</text><text x="560" y="121" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<line x1="560" y1="132" x2="560" y2="150" stroke="currentColor" marker-end="url(#pfn-a0)"/>
<text x="560" y="166" text-anchor="middle" class="tm" font-size="10.5">→ OOP (methods) · Decorators (functions as values)</text>
<text x="560" y="182" text-anchor="middle" class="tm" font-size="10.5">→ Iterators &amp; Generators · Context Managers</text>
</svg><figcaption>The last concept note of Python Basics. Every later Python note builds on functions.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_control">Decisions &amp; Loops</a></b><span>One script of loops and ifs billed all three tables (₹184, ₹74, ₹52; day total ₹310). Left open: the code is one long block. To bill a single table from another part of the program, or to change the GST rule once for everyone, we would have to copy and edit it.</span></li>
    <li><b>This note adds: naming and reusing code</b><span><code>def</code> names a block; parameters make it work on any input; <code>return</code> hands back the answer; scope keeps each function's names private; recursion lets a function solve a smaller copy of its own problem; and because functions are values, they can be stored, passed and returned.</span></li>
    <li><b>Leads to: the rest of Python</b><span><a class="xref" data-note="py_oop">OOP</a> puts functions (methods) and data together in classes. <a class="xref" data-note="py_decorators">Decorators</a> are functions that take and return functions (section 09 is the first step). <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> are functions that pause with <code>yield</code>. <a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a> shows how functions signal errors and how to group them into modules.</span></li>
  </ol>

  <h2 id="pfn-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>def and calling</b><span>Q: how do we stop copy-pasting the billing code? → Name it once with <code>def subtotal(lines):</code> and call it for each table: 195, 70, 50. But how does the answer get back to the caller?</span></li>
    <li><b>return and None</b><span>Q: how does a function hand back a value? → <code>return</code>; without it, the call gives <code>None</code> (print is not return). But our functions need inputs that vary…</span></li>
    <li><b>Parameters, arguments, defaults</b><span>Q: how do inputs get in, and can some be optional? → Parameters are the names in <code>def</code>, arguments the values in the call, by position or keyword; <code>rate=0.05</code> is a default. <code>bill(asha)</code> = 184. But defaults hide a nasty trap…</span></li>
    <li><b>The mutable-default trap</b><span>Q: why did Ben's new order contain Asha's chai? → A default is built once, when <code>def</code> runs, and shared by every call; use <code>None</code>. And what if the number of inputs itself varies?</span></li>
    <li><b>*args, **kwargs, unpacking</b><span>Q: how do we accept any number of items or options? → <code>*amounts</code> collects a tuple (60, 45, 90), <code>**notes</code> a dict; <code>*</code>/<code>**</code> in a call spread them out. Now functions have their own names inside: who can see which names?</span></li>
    <li><b>Scope (LEGB), global, nonlocal, closures</b><span>Q: which <code>t</code> or <code>GST_RATE</code> does a function see, and can it change outer names? → Lookup goes Local → Enclosing → Global → Built-in; changing an outer name needs <code>global</code>/<code>nonlocal</code>; an inner function remembers outer names (bill numbers 1, 2, 3). Can a function call itself?</span></li>
    <li><b>Recursion</b><span>Q: how do we total an order whose lines contain boxes of lines? → A function that calls itself on a smaller part, with a base case: 195 traced on the call stack; the party order 215. But tiny one-off functions with <code>def</code> feel heavy…</span></li>
    <li><b>lambda</b><span>Q: how do we pass a tiny function inline, e.g. "sort lines by amount"? → <code>lambda line: line[1] * line[2]</code>. That only works because a function is a value…</span></li>
    <li><b>Functions as values</b><span>Q: what can we do with a function besides calling it? → Store it in a dict of discount rules, pass it to <code>bill</code>, return it from <code>make_discount</code>, wrap it with logging: the first step to decorators. Finally: how do others know how to call our functions?</span></li>
    <li><b>Docstrings and type hints</b><span>Q: how do we document what a function expects and returns? → A docstring and annotations like <code>lines: list[tuple[str, int, int]] -&gt; int</code> (documentation, not enforcement). Then the complete till, and on to <a class="xref" data-note="py_oop">OOP</a>.</span></li>
  </ol>

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
          <li>subtotal(asha) 195 · discount(195) 19.5 · with_tax(175.5) 184.275 · bill(asha) 184</li>
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
          <li><b>Closure</b>: inner function remembers outer variables (bill counter 1, 2, 3)</li>
          <li>💡 keys: your room, the house, the street, lost-and-found</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursion</div>
        <ul>
          <li>Base case + a call on a smaller problem</li>
          <li>total(asha): 60 + (45 + (90 + 0)) = 195 on the call stack</li>
          <li>Natural for nested data: boxes in boxes → 215</li>
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
          <li>Dict of discount rules; <code>bill(asha, festival)</code> = 164</li>
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
          <li>Wrapping a function = decorators (next notes)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pfn-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Functions</span><span class="rm-sub">Repeat once, name it</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-return"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">return and None</span><span class="rm-sub">Handing back answers</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-params"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Parameters &amp; Arguments</span><span class="rm-sub">Positional, keyword, defaults</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-default"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Mutable-Default Trap</span><span class="rm-sub">Traced call by call</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-star"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">*args, **kwargs, Unpacking</span><span class="rm-sub">Any number of inputs</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-scope"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Scope: LEGB</span><span class="rm-sub">global, nonlocal, closures</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-rec"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Recursion</span><span class="rm-sub">The call stack, traced</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-lambda"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">lambda</span><span class="rm-sub">Tiny inline functions</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-values"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Functions as Values</span><span class="rm-sub">Store, pass, return, wrap</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-doc"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Docstrings &amp; Type Hints</span><span class="rm-sub">Saying how to call it</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-build"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Hands-on: the Complete Till</span><span class="rm-sub">Everything together</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Bugs in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pfn-why"><span class="num">01</span>Why Functions: Repeat Once, Name It</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our loop from the previous note bills every table. But the code is one long script. If another part of the program (a refund screen, an end-of-day report) needs "the bill for this order", it must copy the code, and every copy must be kept in step. How do we write the billing steps once and use them from anywhere?</p>
  </div>
  <h3>The running example</h3>
  <p>Chai Corner again: chai ₹30, samosa ₹15, vada pav ₹20, cold coffee ₹90; 10% off at ₹150 or more; 5% GST; round to rupees. Orders are lists of (item, qty, price) lines:</p>
  <table class="tbl out"><caption>The three orders, and the functions we will build for them</caption>
    <tr><th>Order</th><th>Lines</th><th><code>subtotal</code></th><th><code>discount</code></th><th><code>with_tax</code></th><th><code>bill</code></th></tr>
    <tr><td>asha</td><td>("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)</td><td>195</td><td>19.5</td><td>184.275</td><td>184</td></tr>
    <tr><td>ben</td><td>("masala chai", 1, 30), ("vada pav", 2, 20)</td><td>70</td><td>0</td><td>73.5</td><td>74</td></tr>
    <tr><td>chen</td><td>("samosa", 2, 15), ("vada pav", 1, 20)</td><td>50</td><td>0</td><td>52.5</td><td>52</td></tr>
  </table>
  <h3>The problem: copy-paste</h3>
  <p>Here is billing done by copying. The government raises GST to 12%, and someone updates one copy but not the other:</p>
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
  <p>Two copies, two rules: Asha paid 5% tax, Ben 12%. Nothing crashed, so nobody noticed. This is the main reason functions exist: <strong>one rule should live in one place</strong>. The second reason is naming: <code>bill(ben)</code> says what it does; ten lines of arithmetic do not.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A recipe card. The chai-wala does not re-invent masala chai for every customer; the steps are written once on a card titled "masala chai". "Make masala chai, 2 cups" is a call: same steps, different quantity. Change the recipe card once and every future cup changes.</p></div>
  <h3>def: writing the recipe card</h3>
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
  <p>Because a call becomes a value, it can be used anywhere a value can: <code>subtotal(asha) + 5</code> is 200. And <code>def</code> itself only <em>creates</em> the function; it runs nothing. The function is an object like any other (section 09 builds on that):</p>
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
  <div class="bridge"><b>What this still can't tell us → next: return and None.</b> <code>subtotal</code> handed back 195 with <code>return</code>. What happens if a function has no <code>return</code>, or only prints its answer? And can it return early, or return two things?</div>

  <h2 id="pfn-return"><span class="num">02</span>return and None</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Beginners often write functions that <em>print</em> their answer, and then cannot add it to anything. What exactly does <code>return</code> do that <code>print</code> does not, and what does a function give back when it has no <code>return</code>?</p>
  </div>
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
  <p>Three friends split Asha's ₹184 bill. <code>return a, b</code> builds one tuple; the caller can unpack it into two names.</p>
  <div class="fx" data-lang="py">def split_bill(total, people):
    return total // people, total % people   # really ONE tuple

share, left = split_bill(184, 3)
print(share, left, split_bill(184, 3))</div>
  <div class="fx" data-lang="text">61 1 (61, 1)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>return expr</code> ends the call and makes the call expression evaluate to <code>expr</code>. A function with no <code>return</code>, or a bare <code>return</code>, returns <code>None</code>. <code>return a, b</code> returns the tuple <code>(a, b)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>A function that only prints returns <code>None</code>; using its result gives <code>TypeError: ... 'NoneType'</code>. Also: methods that change an object in place, like <code>list.sort()</code> and <code>list.append()</code>, return <code>None</code> on purpose, so <code>order = order.sort()</code> destroys your list.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Parameters and Arguments.</b> <code>discount</code> has the 10% and ₹150 baked in, and the tax rate will change. How do values get into a function, and can some inputs be optional?</div>

  <h2 id="pfn-params"><span class="num">03</span>Parameters and Arguments</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The GST is 5% today but might be 12% tomorrow, and a few items already use a different rate. We want <code>with_tax(amount)</code> to use 5% unless told otherwise. How are inputs matched to a function's names, and how do we make one optional?</p>
  </div>
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
  <h3>Building the bill from small functions</h3>
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
  <p>₹184, ₹74, ₹52, the same as by hand. And the GST problem from section 01 is gone: the rate lives in one place, the default of <code>with_tax</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Parameters</strong> are the names in a function definition; <strong>arguments</strong> are the values supplied in a call. Arguments bind to parameters <strong>positionally</strong> (left to right) and then by <strong>keyword</strong> (by name). A parameter with a <strong>default value</strong> (<code>p=v</code>) is optional; parameters with defaults must come after those without.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Swapped positional arguments give wrong answers without an error: <code>with_tax(0.12, 175.5)</code> is 0.12 + 21.06. For anything beyond the first one or two obvious inputs, pass by keyword. Section 05 shows how to <em>force</em> callers to do that.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Mutable-Default Trap.</b> Defaults look harmless: <code>rate=0.05</code>. But give a parameter a list as its default and orders from different customers start mixing. Why?</div>

  <h2 id="pfn-default"><span class="num">04</span>The Mutable-Default Trap</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want a helper <code>add_line(line, order=[])</code> that starts a new order when none is given. It works for Asha. Then Ben's "new" order already contains Asha's chai. When exactly is a default value created, and who shares it?</p>
  </div>
  <div class="callout pred"><span class="label">Predict the output</span><p>Two different customers, two calls with no order passed. What do the prints show?</p></div>
  <div class="fx" data-lang="py">def add_line(line, order=[]):         # the [] is built ONCE, when def runs
    order.append(line)
    return order

asha_order = add_line(("masala chai", 2, 30))
ben_order = add_line(("vada pav", 2, 20))     # Ben gets a "new" order?
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
    <tr><td>Call 1 (Asha)</td><td>order omitted → order = D; append chai</td><td>[chai]</td><td>D</td><td>D</td></tr>
    <tr><td>Call 2 (Ben)</td><td>order omitted → order = D again; append vada pav</td><td>[chai, vada pav]</td><td>D</td><td>D</td></tr>
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
  <div class="bridge"><b>What this still can't tell us → next: *args, **kwargs and Unpacking.</b> So far every function has a fixed number of parameters. A total of "any number of amounts", or a line with "any extra notes" (less sugar, no onion), needs a function that accepts a varying number of inputs.</div>

  <h2 id="pfn-star"><span class="num">05</span>*args, **kwargs and Unpacking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we write <code>total_of(60, 45, 90)</code> that accepts any number of amounts, or <code>make_line("masala chai", 2, sugar="less", ginger=True)</code> with any extra options? And the reverse: if the amounts are already in a list, how do we pass them as separate arguments?</p>
  </div>
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
  <p><code>print(*line)</code> is <code>print("samosa", 3, 15)</code>. In the receipt call, <code>*ben</code> spreads Ben's two lines into <code>*lines</code>, and <code>**cfg</code> becomes <code>gst=0.12, tip=20</code>. This pattern, collect with <code>*args, **kwargs</code> and pass on with <code>*args, **kwargs</code>, is exactly how a wrapper forwards any call (section 09, and <a class="xref" data-note="py_decorators">Decorators</a>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>In a definition, <code>*name</code> binds extra positional arguments as a tuple and <code>**name</code> binds extra keyword arguments as a dict; parameters after <code>*</code>/<code>*args</code> are <strong>keyword-only</strong>; parameters before <code>/</code> are <strong>positional-only</strong>. Full order: <code>def f(a, /, b, *args, c, **kwargs)</code>. In a call, <code>*iterable</code> and <code>**mapping</code> <strong>unpack</strong> into arguments.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>*args</code> is a tuple, not a list (no <code>append</code>). And <code>**kwargs</code> silently accepts typos: <code>receipt("Asha", gts=0.12)</code> puts <code>gts</code> into <code>extra</code> instead of raising. Accept <code>**kwargs</code> only when you really forward them.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Scope.</b> Our functions now create names (<code>total</code>, <code>t</code>, <code>after</code>) and use outside names (<code>GST_RATE</code>). Which names can a function see, which are private to it, and can it change a name outside itself?</div>

  <h2 id="pfn-scope"><span class="num">06</span>Scope: the LEGB Rule</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>subtotal</code> and <code>bill</code> both might use a name like <code>total</code>. If they shared it, one would overwrite the other. And a counter of bills printed today must survive between calls. Where does each name live, and how does Python decide which one you mean?</p>
  </div>
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
  <h3>Traced: the LEGB lookup</h3>
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
  <p>Every printed bill needs the next bill number. A <strong>closure</strong> is an inner function that remembers the variables of the function it was created in, even after that outer function has returned. <code>nonlocal</code> lets it update them.</p>
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
  <p><code>make_bill_counter</code> finished long ago, but each <code>next_bill_no</code> it created still holds its own <code>n</code>. Decorators (<a class="xref" data-note="py_decorators">Decorators</a>) are built on exactly this.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Scope</strong> is where a name is visible. Name lookup follows <strong>LEGB</strong>: Local, Enclosing function(s), Global (module), Built-in. Any assignment to a name inside a function makes it local throughout that function, unless declared <code>global</code> (rebind the module name) or <code>nonlocal</code> (rebind the nearest enclosing function's name). A <strong>closure</strong> is a function object that keeps references to variables of its enclosing scope.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Reading a global is fine. Rebinding it needs <code>global</code>. Changing it in place (<code>items.append</code>) needs nothing, which is also how hidden shared state sneaks in. Prefer passing values in and returning results over <code>global</code>. And remember: a loop's variables are not local to the loop (only functions create a new scope).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Recursion.</b> Functions can call other functions (<code>bill</code> calls <code>subtotal</code>). Can a function call <em>itself</em>, and why would it? A party order with snack boxes inside snack boxes is the reason.</div>

  <h2 id="pfn-rec"><span class="num">07</span>Recursion</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A party orders a snack box that contains samosas and a smaller box, which contains a vada pav and a samosa. A loop handles one level; boxes can nest any number of levels deep. How do we total something that contains smaller copies of itself?</p>
  </div>
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
  <h3>Traced: Asha's total on the call stack</h3>
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

print(total(asha))</div>
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
  <p>The last part uses <code>@lru_cache</code> (the <code>@</code> line is a decorator; section 09 and <a class="xref" data-note="py_decorators">Decorators</a> explain the syntax). Plain <code>fib(n)</code> asks for <code>fib(n-1)</code> and <code>fib(n-2)</code>, and those ask again, so the same small values get computed an astronomical number of times. <code>@lru_cache</code> saves each answer the first time and reuses it. Saving answers to reuse later is called <strong>memoisation</strong>. With it, <code>fib(80)</code> is instant.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>recursive</strong> function calls itself on a smaller instance of its problem and stops at one or more <strong>base cases</strong>. Each active call occupies a stack frame; CPython's default limit is 1000 frames (<code>sys.getrecursionlimit()</code>), beyond which <code>RecursionError</code> is raised. Python performs no tail-call optimisation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Missing or unreachable base case → RecursionError. For depth in the thousands (long lists, deep trees), use a loop or your own stack (a list) instead; raising the limit can crash Python. And recursion that repeats sub-problems is exponentially slow without memoisation.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: lambda.</b> To sort Asha's lines by amount, <code>sorted</code> needs a tiny function "line → qty × price". Writing a full <code>def</code> with a name for a one-line, one-use function feels heavy.</div>

  <h2 id="pfn-lambda"><span class="num">08</span>lambda: Small Functions Without a Name</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Many built-ins take a function as an argument: <code>sorted(..., key=...)</code>, <code>max(..., key=...)</code>, <code>map(...)</code>. Often that function is one short expression used once. Is there a lighter way to write it than <code>def</code>?</p>
  </div>
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
  <p>We build three discount rules (5%, 10%, 15%) in a loop. All three give 30.0 on ₹200:</p>
  <div class="fx" data-lang="py">rules = [lambda amt: amt * p for p in (0.05, 0.10, 0.15)]
print([rules[i](200) for i in range(3)])           # all use the LAST p
rules = [lambda amt, p=p: amt * p for p in (0.05, 0.10, 0.15)]
print([rules[i](200) for i in range(3)])           # p frozen per lambda</div>
  <div class="fx" data-lang="text">[30.0, 30.0, 30.0]
[10.0, 20.0, 30.0]</div>
  <p>A lambda (like any function) reads outside variables when it is <em>called</em>, not when it is made. This is called <strong>late binding</strong>. All three lambdas read <code>p</code> after the loop ended, so all see 0.15. <code>p=p</code> fixes it: a default value is evaluated when the function is <em>created</em> (section 04), so each lambda stores its own p.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Functions as Values.</b> We just passed a function to <code>sorted</code> as if it were a number or a list. What else can we do with functions as values, and why does that matter so much in Python?</div>

  <h2 id="pfn-values"><span class="num">09</span>Functions as Values</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>During Diwali week the stall wants 20% off everything; students get 15%; some days no discount at all. Writing <code>bill_regular</code>, <code>bill_festival</code>, <code>bill_student</code> copies the bill logic three times, which is the very problem functions were supposed to solve. How can one <code>bill</code> work with any discount rule?</p>
  </div>
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
  <p>Asha regular: ₹184. Asha festival: 195 × 0.8 = 156, × 1.05 = 163.8 → ₹164. Ben with no discount: ₹74. One <code>bill</code>, any rule. Functions that take functions are called <strong>higher-order functions</strong>; <code>sorted(key=...)</code> was one.</p>
  <h3>Return them</h3>
  <p>A function can <em>build</em> and return a new function. <code>make_discount(0.15)</code> returns a rule that remembers its own pct and threshold: a closure (section 06).</p>
  <div class="fx" data-lang="py">def make_discount(pct, at=0):           # a function that BUILDS functions
    def rule(sub):
        return sub * pct if sub &gt;= at else 0
    return rule

student = make_discount(0.15)
bulk = make_discount(0.10, at=150)
print(student(70), bulk(195), bulk(70), bill(ben, student))</div>
  <div class="fx" data-lang="text">10.5 19.5 0 62</div>
  <p>Ben as a student: 70 − 10.5 = 59.5, × 1.05 = 62.475 → ₹62.</p>
  <h3>Wrap them: the doorway to decorators</h3>
  <p>Put the pieces together: a function that <strong>takes</strong> a function and <strong>returns</strong> a new function that calls the old one with some extra behaviour around it. Here the extra behaviour is a log line. <code>*args, **kwargs</code> (section 05) let the wrapper accept and forward any call.</p>
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
  <p><code>logged_tax</code> logs and then returns the same 184.275 as <code>with_tax</code>. Writing <code>with_tax = logged(with_tax)</code> would replace the original name with the logged version; Python's <code>@logged</code> line above a <code>def</code> is shorthand for exactly that. That shorthand, and what it is used for (timing, caching like <code>@lru_cache</code>, access checks), is the whole topic of <a class="xref" data-note="py_decorators">Decorators</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Functions are <strong>first-class objects</strong>: they can be bound to names, stored in data structures, passed as arguments and returned as results. A <strong>higher-order function</strong> takes or returns functions. A <strong>wrapper</strong> is a function returned by a higher-order function that calls the original with added behaviour; a <strong>decorator</strong> is such a higher-order function applied with <code>@</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Pass the function, not its result: <code>bill(asha, festival)</code>, not <code>bill(asha, festival(195))</code> (that passes a number, and <code>bill</code> then fails trying to call it). A wrapper written without <code>functools.wraps</code> also hides the original's name and docstring; the Decorators note fixes that.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Docstrings and Type Hints.</b> Our functions now take functions, lists of tuples and keyword-only options. How does a teammate (or you, in a month) know what to pass and what comes back, without reading the body?</div>

  <h2 id="pfn-doc"><span class="num">10</span>Docstrings and Type Hints</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A function's name and parameters tell you how to call it, but not what the parameters mean or what type of value they expect. Where do we write "lines is a list of (item, qty, price) tuples; returns whole rupees", so that tools and people can read it?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Hands-on: the Complete Till.</b> We have every piece. Does it all work together on the whole day at Chai Corner?</div>

  <h2 id="pfn-build"><span class="num">11</span>Hands-on: the Complete Till</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section added one tool. A real till receives a stream of different events (bill this table, take this payment, close the day) and must route each one. Can the functions of this note, plus <code>match</code> from <a class="xref" data-note="py_control">Decisions &amp; Loops</a>, run the whole day?</p>
  </div>
  <p>The till receives "events", small dicts like <code>{"type": "bill", "customer": "Asha", "lines": asha}</code>. This router uses ideas from every section: helper functions with returns, a <code>None</code> default (04), a keyword-only flag and <code>**meta</code> (05), a dict of handler functions (09), lambdas (08) and <code>match</code> guards. Predict each line, then read the output.</p>
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
  <p>And the whole day, with the <code>bill</code> function from section 09 (a dict comprehension, from <a class="xref" data-note="py_ds">Data Structures</a>, runs it for every table):</p>
  <div class="fx" data-lang="py">day = {"Asha": asha, "Ben": ben, "Chen": chen}
bills = {name: bill(lines) for name, lines in day.items()}
print(bills, "day total:", sum(bills.values()))</div>
  <div class="fx" data-lang="text">{'Asha': 184, 'Ben': 74, 'Chen': 52} day total: 310</div>
  <p>₹184 + ₹74 + ₹52 = ₹310: the same numbers we worked out by hand in <a class="xref" data-note="py_values">Values, Types &amp; Variables</a> and with loops in <a class="xref" data-note="py_control">Decisions &amp; Loops</a>, now produced by small named functions.</p>
  <p><strong>Extend it:</strong> add a <code>"batch"</code> case that matches <code>{"type": "batch", "events": [*evs]}</code> and routes each event by calling <code>till</code> recursively.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Each handler must <em>return</em> its text; one that prints instead would make <code>out</code> None and <code>out += ...</code> would fail. The router's job is to return, the caller's job is to print.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One diagram and one table to see how every function idea grew from the one before.</div>

  <h2 id="pfn-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>def, return, parameters, defaults, stars, scope, recursion, lambda, first-class functions, hints: separate rules to memorise, or one idea seen from different sides?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 320" width="680">
<defs><marker id="pfn-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="240" y="8" width="200" height="44" rx="7" class="fb sb"/><text x="340" y="27" text-anchor="middle" font-size="12" font-weight="700">def: a named block</text><text x="340" y="43" text-anchor="middle" class="tm" font-size="10">a function object</text>
<line x1="280" y1="52" x2="120" y2="86" stroke="currentColor" marker-end="url(#pfn-a9)"/><line x1="340" y1="52" x2="340" y2="86" stroke="currentColor" marker-end="url(#pfn-a9)"/><line x1="400" y1="52" x2="560" y2="86" stroke="currentColor" marker-end="url(#pfn-a9)"/>
<rect x="20" y="88" width="200" height="44" rx="7" class="ft st"/><text x="120" y="107" text-anchor="middle" font-size="12" font-weight="700">inputs: parameters</text><text x="120" y="123" text-anchor="middle" class="tm" font-size="10">positional · keyword · defaults</text>
<rect x="240" y="88" width="200" height="44" rx="7" class="ft st"/><text x="340" y="107" text-anchor="middle" font-size="12" font-weight="700">output: return</text><text x="340" y="123" text-anchor="middle" class="tm" font-size="10">None if missing</text>
<rect x="460" y="88" width="200" height="44" rx="7" class="ft st"/><text x="560" y="107" text-anchor="middle" font-size="12" font-weight="700">private names: scope</text><text x="560" y="123" text-anchor="middle" class="tm" font-size="10">LEGB · global · nonlocal</text>
<line x1="120" y1="132" x2="120" y2="166" stroke="currentColor" marker-end="url(#pfn-a9)"/>
<rect x="10" y="168" width="220" height="44" rx="7" class="fr sr"/><text x="120" y="187" text-anchor="middle" font-size="12" font-weight="700">defaults built once</text><text x="120" y="203" text-anchor="middle" class="tm" font-size="10">mutable default trap → None</text>
<line x1="120" y1="212" x2="120" y2="246" stroke="currentColor" marker-end="url(#pfn-a9)"/>
<rect x="10" y="248" width="220" height="44" rx="7" class="fg sg"/><text x="120" y="267" text-anchor="middle" font-size="12" font-weight="700">*args · **kwargs</text><text x="120" y="283" text-anchor="middle" class="tm" font-size="10">any inputs; unpack in calls</text>
<line x1="340" y1="132" x2="340" y2="166" stroke="currentColor" marker-end="url(#pfn-a9)"/><line x1="560" y1="132" x2="420" y2="166" stroke="currentColor" marker-end="url(#pfn-a9)"/>
<rect x="250" y="168" width="180" height="44" rx="7" class="fg sg"/><text x="340" y="187" text-anchor="middle" font-size="12" font-weight="700">recursion</text><text x="340" y="203" text-anchor="middle" class="tm" font-size="10">a frame per call: 195, 215</text>
<line x1="560" y1="132" x2="560" y2="166" stroke="currentColor" marker-end="url(#pfn-a9)"/>
<rect x="450" y="168" width="220" height="44" rx="7" class="fg sg"/><text x="560" y="187" text-anchor="middle" font-size="12" font-weight="700">closures</text><text x="560" y="203" text-anchor="middle" class="tm" font-size="10">bill counter 1, 2, 3</text>
<line x1="560" y1="212" x2="500" y2="246" stroke="currentColor" marker-end="url(#pfn-a9)"/><line x1="230" y1="270" x2="268" y2="270" stroke="currentColor" marker-end="url(#pfn-a9)"/>
<rect x="270" y="248" width="400" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="470" y="267" text-anchor="middle" font-size="12" font-weight="700">functions as values: lambda · pass · return · wrap</text><text x="470" y="283" text-anchor="middle" class="tm" font-size="10">bill(asha, festival) = 164 → decorators</text>
<text x="340" y="312" text-anchor="middle" class="tm" font-size="10.5">docstrings &amp; hints describe all of it: the calling contract</text>
</svg><figcaption>A function is a named block with three faces: inputs (parameters), an output (return) and private names (scope). Defaults and stars refine the inputs; a frame per call gives recursion; remembered scopes give closures; and because the function itself is an object, it can be passed around and wrapped.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Chai Corner</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>def / call</td><td>a block of code + a name</td><td>how to reuse code?</td><td>subtotal(asha) = 195</td><td>any repeated or nameable step</td></tr>
    <tr><td>return / None</td><td>def</td><td>how to give back a value?</td><td>discount(195) = 19.5; print-only → None</td><td>always return, let callers print</td></tr>
    <tr><td>Parameters, defaults</td><td>def</td><td>how do inputs get in?</td><td>with_tax(175.5) = 184.275; rate=0.12 → 196.56</td><td>keyword for clarity</td></tr>
    <tr><td>Mutable default</td><td>defaults + mutability</td><td>why do calls share data?</td><td>Ben's order holds Asha's chai</td><td>always use None</td></tr>
    <tr><td>*args / **kwargs</td><td>tuples, dicts</td><td>any number of inputs?</td><td>total_of(60, 45, 90) = 195</td><td>forwarding, flexible APIs</td></tr>
    <tr><td>Keyword-/positional-only</td><td>* and / markers</td><td>how must callers pass?</td><td>pay(184, method="upi")</td><td>clear, stable APIs</td></tr>
    <tr><td>Scope (LEGB)</td><td>names (labels) per call</td><td>which name is meant?</td><td>tax: amount L, GST_RATE G, round B</td><td>keep names local</td></tr>
    <tr><td>Closure</td><td>enclosing scope + nonlocal</td><td>how can a function remember?</td><td>next_no() → 1, 2, 3</td><td>counters, factories, decorators</td></tr>
    <tr><td>Recursion</td><td>a call + a base case</td><td>how to handle nested data?</td><td>total(asha) 195; party 215</td><td>trees, nesting; loops for depth 1000+</td></tr>
    <tr><td>lambda</td><td>an expression as a function</td><td>a tiny inline function?</td><td>sort lines by amount: 90, 60, 45</td><td>key=, map</td></tr>
    <tr><td>First-class functions</td><td>functions are objects</td><td>one bill, many rules?</td><td>bill(asha, festival) = 164; student Ben 62</td><td>strategies, callbacks, wrappers</td></tr>
    <tr><td>Docstring / hints</td><td>strings, annotations</td><td>how to call it correctly?</td><td>bill_total(lines: list[tuple[str, int, int]]) -&gt; int</td><td>every public function</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a function is an object that holds a block of code with its own private names; calling it binds arguments to parameters in a fresh scope and evaluates to what it returns.</strong> Every rule here follows: defaults are stored on the object (built once), each call has its own frame (recursion), scopes can outlive calls (closures), and objects can be passed around (lambdas, strategies, decorators).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing how the pieces fit is half the job; the other half is knowing where people usually go wrong with them.</div>

  <h2 id="pfn-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which function bugs appear most often in real code and in "what does this print?" interviews, and what is the fix for each?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page for revision.</div>

  <h2 id="pfn-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Chai Corner (chai 30, samosa 15, vada pav 20, cold coffee 90; 10% off at ₹150+, 5% GST, round). Functions: <code>subtotal(lines)</code>, <code>discount(sub)</code>, <code>with_tax(amount, rate=0.05)</code>, <code>bill(lines, discount_rule=discount, gst=0.05)</code>.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on Chai Corner</th><th>Weakness → next</th></tr>
    <tr><td>def / call</td><td>stop copy-pasting?</td><td>subtotal(asha), (ben), (chen) = 195, 70, 50</td><td>how does the answer come back?</td></tr>
    <tr><td>return</td><td>hand back a value?</td><td>discount(195) = 19.5; print-only → None</td><td>inputs vary</td></tr>
    <tr><td>Parameters</td><td>inputs, optional ones?</td><td>with_tax(175.5) = 184.275; bill(asha) = 184</td><td>defaults hide a trap</td></tr>
    <tr><td>Mutable default</td><td>why shared data?</td><td>Ben's order holds Asha's chai</td><td>varying number of inputs</td></tr>
    <tr><td>*args / **kwargs</td><td>any number of inputs?</td><td>total_of(60, 45, 90) = 195</td><td>who sees which names?</td></tr>
    <tr><td>Scope / closures</td><td>which name? remember state?</td><td>GST_RATE global; counter 1, 2, 3</td><td>self-similar data</td></tr>
    <tr><td>Recursion</td><td>nested data?</td><td>60 + (45 + (90 + 0)) = 195; party 215</td><td>tiny one-off functions</td></tr>
    <tr><td>lambda</td><td>inline function?</td><td>key=lambda l: l[1]*l[2]</td><td>why can we pass functions?</td></tr>
    <tr><td>First-class</td><td>one bill, many rules?</td><td>festival 164, student Ben 62, logged wrapper</td><td>how to document?</td></tr>
    <tr><td>Docs / hints</td><td>calling contract?</td><td>-&gt; int; hints not enforced</td><td>→ <a class="xref" data-note="py_oop">OOP</a>, <a class="xref" data-note="py_decorators">Decorators</a></td></tr>
  </table>
  <h3>Syntax and rules</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Form</th><th>Meaning</th></tr>
    <tr><td>Definition</td><td><code>def name(params): body</code></td><td>creates a function object; body runs per call</td></tr>
    <tr><td>Return</td><td><code>return x</code> / none</td><td>call evaluates to x / None; <code>return a, b</code> → tuple</td></tr>
    <tr><td>Parameter order</td><td><code>def f(a, /, b, *args, c, **kwargs)</code></td><td>pos-only, normal, extra tuple, kw-only, extra dict</td></tr>
    <tr><td>Call order</td><td><code>f(1, 2, *lst, c=3, **d)</code></td><td>positionals before keywords</td></tr>
    <tr><td>Defaults</td><td><code>def f(x=None)</code></td><td>evaluated once at def time; stored in <code>__defaults__</code></td></tr>
    <tr><td>Lookup</td><td>L → E → G → B</td><td>first match; assignment makes local</td></tr>
    <tr><td>Rebinding outer names</td><td><code>global x</code>, <code>nonlocal x</code></td><td>module name / nearest enclosing function's name</td></tr>
    <tr><td>Recursion</td><td>base case + smaller call</td><td>limit 1000 frames; no tail-call optimisation</td></tr>
    <tr><td>lambda</td><td><code>lambda args: expr</code></td><td>one expression, returned; late binding</td></tr>
    <tr><td>Hints</td><td><code>def f(x: int) -&gt; int</code></td><td>stored in <code>__annotations__</code>; not enforced</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Call</th><th>Result</th></tr>
    <tr><td>subtotal(asha), subtotal(ben), subtotal(chen)</td><td>195, 70, 50</td></tr>
    <tr><td>discount(195), discount(70)</td><td>19.5, 0</td></tr>
    <tr><td>with_tax(175.5), with_tax(175.5, 0.12)</td><td>184.275, 196.56</td></tr>
    <tr><td>bill(asha), bill(ben), bill(chen) → day</td><td>184, 74, 52 → 310</td></tr>
    <tr><td>bill(asha, festival 20%), bill(ben, student 15%)</td><td>164, 62</td></tr>
    <tr><td>split_bill(184, 3)</td><td>(61, 1)</td></tr>
    <tr><td>box_total(party)</td><td>215</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>def</b><p>Any step you repeat, test, or want to name.</p><small>Small: one job per function</small></div>
    <div><b>lambda</b><p>Short key functions for sorted/max/min/map.</p><small>Not for anything you would name or reuse</small></div>
    <div><b>Recursion</b><p>Nested or tree-shaped data; divide and conquer.</p><small>Not for flat or very deep data: loop</small></div>
    <div><b>global</b><p>Rarely; configuration constants are read, not rebound.</p><small>Prefer arguments and return values</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Print instead of return; mutable defaults; defaults frozen at def time; UnboundLocalError from assigning a global; late binding in lambdas made in loops; missing base case; passing <code>f()</code> instead of <code>f</code>; <code>**kwargs</code> eating typos; hints are not checks.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>def f(x, l=[]): l.append(x); return l</code> — <code>f(1); print(f(2))</code>?</td><td><code>[1, 2]</code></td></tr>
    <tr><td>Inside <code>def g(): print(n); n = 5</code>, with global n = 1: <code>g()</code>?</td><td>UnboundLocalError (n is local in all of g)</td></tr>
    <tr><td><code>def h(*a, **k): return a, k</code> — <code>h(1, 2, x=3)</code>?</td><td><code>((1, 2), {'x': 3})</code></td></tr>
    <tr><td><code>[f(10) for f in [lambda x: x * i for i in range(3)]]</code>?</td><td><code>[20, 20, 20]</code></td></tr>
    <tr><td>What does a function without return give back?</td><td><code>None</code></td></tr>
  </table>

  <h2 id="pfn-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a parameter and an argument?</summary><div class="qa-body">A parameter is the name in the <code>def</code> line (<code>amount</code>); an argument is the value passed in a call (<code>175.5</code>). Arguments bind to parameters by position, then by keyword.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a function return if it has no return statement? Why does it matter?</summary><div class="qa-body"><code>None</code>. A function that prints its result instead of returning it cannot be reused: <code>x = show_subtotal(asha)</code> gives None and <code>x + 10</code> raises TypeError. In-place methods like <code>list.sort()</code> return None on purpose.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the mutable default argument trap and its fix.</summary><div class="qa-body">Defaults are built once, when <code>def</code> runs, and stored in <code>f.__defaults__</code>. <code>def add_line(line, order=[])</code> shares one list across all calls, so Ben's "new" order contains Asha's chai. Fix: <code>order=None</code>, then <code>if order is None: order = []</code> inside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>*args</code> and <code>**kwargs</code> become inside the function?</summary><div class="qa-body"><code>args</code> is a tuple of extra positional arguments. <code>kwargs</code> is a dict of extra keyword arguments. At a call, <code>f(*lst)</code> and <code>f(**d)</code> unpack. The names are just habit; the stars matter. Order: <code>a, /, b, *args, kw, **kwargs</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why would you make a parameter keyword-only?</summary><div class="qa-body">Clear and safe calls: callers must write <code>pay(184, method="upi")</code>, so arguments cannot be swapped by position. You can also reorder or add parameters later without breaking old calls. Put a bare <code>*</code> before them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain LEGB, <code>global</code> and <code>nonlocal</code>.</summary><div class="qa-body">Lookup order: Local → Enclosing function → Global (module) → Built-in; first match wins. Assigning to a name makes it local to the function. <code>global x</code> lets a function rebind the module-level x. <code>nonlocal x</code> rebinds the nearest outer function's x (used in closures).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>count += 1</code> inside a function raise <code>UnboundLocalError</code> when <code>count</code> is global?</summary><div class="qa-body">The assignment makes <code>count</code> local for the whole function, decided before the code runs. So the read on the right side finds a local with no value yet. Fix with <code>global count</code>, or better, pass it in and return the new value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a closure? Give a use.</summary><div class="qa-body">An inner function that keeps references to variables of the function it was defined in, even after that function returned. <code>make_bill_counter()</code> returns <code>next_bill_no</code>, which remembers and updates its own <code>n</code> (1, 2, 3). Uses: counters, configurable functions (<code>make_discount(0.15)</code>), decorators.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>fs = [lambda: i for i in range(3)]; print([f() for f in fs])</code></summary><div class="qa-body"><code>[2, 2, 2]</code>. Each lambda reads <code>i</code> when called, after the loop finished. Fix: <code>lambda i=i: i</code> or <code>functools.partial</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your recursive tree walk crashes with <code>RecursionError</code> on deep data. Options?</summary><div class="qa-body">Python's default depth limit is about 1000, with no tail-call optimisation. Best fix: rewrite as a loop with your own stack (a list). Raising <code>sys.setrecursionlimit</code> is a stopgap and can crash Python. If sub-problems repeat, add <code>@lru_cache</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are type hints enforced at run time?</summary><div class="qa-body">No. <code>def double(x: int) -&gt; int</code> happily returns "abab" for "ab". Hints are stored in <code>__annotations__</code> and used by editors and checkers like mypy; libraries such as Pydantic and FastAPI choose to validate with them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the mutable-default trap need ideas from both earlier notes?</summary><div class="qa-body">From <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>: names are labels and lists are mutable, so two labels on one list see each other's appends. From this note: defaults are evaluated once and stored on the function. Put together, every call that omits the argument gets a label on the same stored list. With an immutable default (<code>rate=0.05</code>) nothing can go wrong, because it cannot be changed in place.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do decorators need closures and <code>*args, **kwargs</code>?</summary><div class="qa-body">A decorator returns a wrapper function that must (1) remember which original function to call: that is a closure over <code>func</code>; and (2) accept any arguments the original accepts and forward them unchanged: that is <code>*args, **kwargs</code> collecting and then unpacking. <code>logged(with_tax)</code> in section 09 is a decorator without the <code>@</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip functions and keep the billing script from Decisions &amp; Loops?</summary><div class="qa-body">Every place that needs a bill gets a copy of the loop. A rule change (GST 5% → 12%) must be made in every copy; miss one and customers are billed differently (Asha ₹184 at 5%, Ben ₹78 at 12% in section 01). Functions put each rule in exactly one place and give it a name.</div></details>
</main>
`
});
