// notes/python/py_advanced.js — Advanced Python Functions: the map
Object.assign(TOPIC_CONTENT, {
  "py_advanced": `<main>
<h1>Advanced Python Functions: the map</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions: the map</span></div>
  <p class="lead">Start here. Iterators, generators, closures, decorators and context managers are usually taught as five separate tricks, each with its own diagram and code. They are not separate. Each one exists because ordinary functions and loops hit a specific wall, and each is built out of the one before it. This short note gives you the whole picture before the details: <strong>why</strong> these features exist (three pains in one small program), the <strong>family tree</strong> that connects them, the order to read the three child notes in, and one running example, Chai Corner's order log, that all three notes reuse. The details, traced line by line, live in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a> and <a class="xref" data-note="py_context">Context Managers</a>.</p>

  <h2 id="pa-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <defs><marker id="pa-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="215" y="8" width="210" height="32" rx="6" class="fg sg" stroke-width="2.5"/><text x="320" y="29" text-anchor="middle" font-size="12" font-weight="700">Advanced Python Functions: map</text>
    <line x1="320" y1="40" x2="110" y2="72" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="40" x2="320" y2="72" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="40" x2="530" y2="72" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="20" y="72" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="94" text-anchor="middle" font-size="12">1 · Iterators &amp; Generators</text>
    <rect x="230" y="72" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="94" text-anchor="middle" font-size="12">2 · Closures &amp; Decorators</text>
    <rect x="440" y="72" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="530" y="94" text-anchor="middle" font-size="12">3 · Context Managers</text>
    <line x1="200" y1="89" x2="226" y2="89" stroke="currentColor" marker-end="url(#pa-a0)"/>
    <line x1="410" y1="89" x2="436" y2="89" stroke="currentColor" marker-end="url(#pa-a0)"/>
    <text x="320" y="135" text-anchor="middle" class="tm" font-size="11">read in this order: each note uses the one before it</text>
  </svg><figcaption>The Advanced Python Functions group. You are on the green map note; the three child notes are read left to right.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_fundamentals">Python Fundamentals</a>, <a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a> and <a class="xref" data-note="py_oop">OOP</a></b><span>You can write functions (with <code>*args</code>, <code>**kwargs</code>, defaults), loops, <code>try/except/finally</code>, open files, and classes with dunder methods. Left open: plain functions run start to finish and forget everything, loops seem to "just work" on anything, and cleanup is something you must remember to write.</span></li>
    <li><b>This note adds: the map</b><span>Why the five features exist, how they grow out of each other, one running example shared by the whole group, and the reading order. No feature is taught in depth here.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></b><span>The first child note. Then <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a> and <a class="xref" data-note="py_context">Context Managers</a>. After the group: <a class="xref" data-note="py_concurrency">Concurrency &amp; Async</a> (coroutines grew out of generators; <code>with lock:</code>) and <a class="xref" data-note="py_testing">Testing &amp; Debugging</a> (fixtures, <code>mock.patch</code>).</span></li>
  </ol>

  <h2 id="pa-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole group as one chain. Each idea answers the question above it; its weakness raises the next question. The link at the end of each line is the note that teaches it. Numbers come from the running example (section 01): Chai Corner's six-line log, 4 valid orders, 7 items, ₹225.</p>
  <ol class="story">
    <li><b>for loop → iterator protocol</b><span>Q: how does one <code>for</code> walk a list, a dict and a file? → It calls <code>iter()</code> once and <code>next()</code> until <code>StopIteration</code>. Can our own object hand out orders that way? <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></span></li>
    <li><b>Class iterator</b><span>Q: how do we make our own loopable object? → <code>__iter__</code> + <code>__next__</code> with <code>self.pos</code>. Works, but 17 lines of bookkeeping… <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></span></li>
    <li><b>Generator</b><span>Q: can Python remember our place for us? → <code>yield</code> pauses the function with its variables kept: 9 lines, same ₹225. <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></span></li>
    <li><b>Lazy pipelines</b><span>Q: what does pausing buy? → Data flows one item at a time: 10 million values in 0.0005 MB instead of 409 MB; a billion-line log searched by reading 15 lines. Now a different wall: the same timing code is pasted into every function… <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></span></li>
    <li><b>Functions are objects</b><span>Q: can a function be handed to other code? → Store, pass, return it. A returned inner function needs variables of a finished function… <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a></span></li>
    <li><b>Closure</b><span>Q: where do those variables live? → In cells attached to the inner function (<code>make_tax(0.05)</code> remembers 0.05). Can a closure hold a whole function? <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a></span></li>
    <li><b>Decorator</b><span>Q: how do we add code around many functions without editing them? → A wrapper closure that calls the original; <code>@timed</code> ≡ <code>f = timed(f)</code>. Options (<code>@retry(times=3)</code>) add a layer. But a decorator wraps a whole call; what about a few lines that must clean up even on error? <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a></span></li>
    <li><b>with &amp; context managers</b><span>Q: how do we guarantee cleanup of a block? → <code>__enter__</code>/<code>__exit__</code>, called by <code>with</code> on every exit path: the log is closed even when "till restarted" raises. Writing a class each time is heavy… <a class="xref" data-note="py_context">Context Managers</a></span></li>
    <li><b>@contextmanager</b><span>Q: shorter? → A generator (pause at <code>yield</code>, cleanup in <code>finally</code>) turned into a context manager by a decorator. The three branches meet. <a class="xref" data-note="py_context">Context Managers</a></span></li>
  </ol>

  <h2 id="pa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Advanced Python Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why they exist</div>
        <ul>
          <li>Data too big to load at once → <b>generators</b></li>
          <li>Same extra code around many functions → <b>decorators</b></li>
          <li>Cleanup skipped by an error → <b>context managers</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Iteration branch</div>
        <ul>
          <li><code>for</code> = <code>iter()</code> + <code>next()</code> + <code>StopIteration</code></li>
          <li>Iterable (book) vs iterator (bookmark)</li>
          <li>Generator: <code>yield</code> pauses, locals kept</li>
          <li>Lazy pipelines, <code>itertools</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Function branch</div>
        <ul>
          <li>Functions are objects</li>
          <li>Closure: inner function + cells</li>
          <li>Decorator: <code>@d</code> ≡ <code>f = d(f)</code>; <code>functools.wraps</code></li>
          <li>Factories <code>@retry(times=3)</code>; stacking <code>a(b(f))</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Resource branch</div>
        <ul>
          <li><code>try/finally</code> → <code>with</code></li>
          <li><code>__enter__</code> / <code>__exit__(type, exc, tb)</code>; True = swallow</li>
          <li><code>@contextmanager</code> = generator + decorator</li>
          <li><code>ExitStack</code>, locks, transactions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">One shared idea</div>
        <ul>
          <li>Each is syntax that calls <b>your</b> code at the right moment</li>
          <li><code>for</code> → <code>__iter__</code>/<code>__next__</code>; <code>@</code> → your decorator; <code>with</code> → <code>__enter__</code>/<code>__exit__</code></li>
          <li>Generators and closures are both "functions with memory"</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pa-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The group as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pa-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why These Features Exist</span><span class="rm-sub">Three pains, one small program</span></div></div>
      <div class="rm-item rm-done" data-target="pa-example"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Same Program, Fixed</span><span class="rm-sub">All three features together</span></div></div>
      <div class="rm-item rm-done" data-target="pa-tree"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Family Tree</span><span class="rm-sub">Three roots, one meeting point</span></div></div>
      <div class="rm-item rm-done" data-target="pa-syntax"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Syntax That Calls Your Code</span><span class="rm-sub">for, @ and with, spied on</span></div></div>
      <div class="rm-item rm-done" data-target="pa-order"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Reading Order</span><span class="rm-sub">What each note answers</span></div></div>
      <div class="rm-item rm-done" data-target="pa-connect"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table for the group</span></div></div>
      <div class="rm-item rm-done" data-target="pa-traps"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">One per feature</span></div></div>
      <div class="rm-item rm-done" data-target="pa-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The group on one page</span></div></div>
      <div class="rm-item rm-done" data-target="pa-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pa-why"><span class="num">01</span>Why These Features Exist</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With plain functions, loops and <code>try/except</code> you can already write any program. So why does Python need generators, decorators and context managers at all? What goes wrong without them?</p>
  </div>
  <h3>The running example: Chai Corner's order log</h3>
  <p>Chai Corner is a small tea stall. Its till writes one line per order: time, item, quantity, unit price in rupees. Monday's log has six lines. Line 1 is a comment and line 5 is junk the till wrote when it restarted; the other four are orders. Every note in this group uses this file.</p>
  <div class="fx" data-lang="py">LOG = """# Chai Corner till log, Monday
09:01,masala chai,2,30
09:05,samosa,3,15
09:12,cold coffee,1,90
till restarted
09:20,masala chai,1,30
"""
with open("orders.log", "w") as f:
    f.write(LOG)
print(LOG, end="")</div>
  <div class="fx" data-lang="text"># Chai Corner till log, Monday
09:01,masala chai,2,30
09:05,samosa,3,15
09:12,cold coffee,1,90
till restarted
09:20,masala chai,1,30</div>
  <table class="tbl"><caption>The answer every note reproduces</caption>
    <tr><th>Time</th><th>Item</th><th>Qty × price</th><th>Amount</th></tr>
    <tr><td>09:01</td><td>masala chai</td><td>2 × 30</td><td>60</td></tr>
    <tr><td>09:05</td><td>samosa</td><td>3 × 15</td><td>45</td></tr>
    <tr><td>09:12</td><td>cold coffee</td><td>1 × 90</td><td>90</td></tr>
    <tr><td>09:20</td><td>masala chai</td><td>1 × 30</td><td>30</td></tr>
    <tr><td colspan="2"><strong>4 orders</strong></td><td><strong>7 items</strong></td><td><strong>₹225</strong></td></tr>
  </table>
  <h3>The obvious first attempt</h3>
  <p>The owner wants the day's revenue and wants to know how long the report takes. Here is how a beginner writes it.</p>
  <div class="fx" data-lang="py">import time

def total_revenue(path):
    t0 = time.perf_counter()                 # pain 2: timing pasted into the function
    f = open(path)                           # pain 3: who closes this if an error happens?
    lines = f.readlines()                    # pain 1: the WHOLE file loaded into memory
    total = 0
    for line in lines:
        time_, item, qty, price = line.strip().split(",")
        total += int(qty) * int(price)
    f.close()
    print(f"took {time.perf_counter() - t0:.4f}s")
    return total

try:
    total_revenue("orders.log")
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">ValueError: not enough values to unpack (expected 4, got 2)</div>
  <p>It crashed on line 1 (the comment splits into 2 parts, not 4), and that crash exposes all three problems at once:</p>
  <table class="tbl"><caption>Three pains in one function</caption>
    <tr><th>Pain</th><th>In the code</th><th>What goes wrong</th><th>The feature that fixes it</th></tr>
    <tr><td>1. Everything in memory</td><td><code>f.readlines()</code></td><td>Fine for 6 lines; a year of logs from 500 stalls does not fit in RAM. And we only ever need one line at a time.</td><td><strong>Iterators &amp; generators</strong>: hand out one item at a time</td></tr>
    <tr><td>2. Pasted extra code</td><td><code>t0 = …</code>, <code>print(f"took …")</code></td><td>Every report function needs the same timing lines; the real logic is buried; and here the error skipped the timing print entirely.</td><td><strong>Decorators</strong>: write the timing once, attach with <code>@timed</code></td></tr>
    <tr><td>3. Cleanup skipped</td><td><code>f.close()</code> after the loop</td><td>The <code>ValueError</code> jumped past <code>close()</code>: the file stayed open. On a server this leaks a handle per request.</td><td><strong>Context managers</strong>: <code>with</code> guarantees cleanup</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Think of the stall itself. A good stall brews each cup to order instead of brewing 500 at dawn (generators). It puts one cashier at the door instead of asking every cook to also take money (decorators). And its gas valve shuts automatically when the stall closes, even if the cook leaves in a hurry (context managers).</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The three families: <strong>iteration</strong> (iterators, generators, lazy pipelines) controls <em>how data flows</em> into code; <strong>function wrapping</strong> (first-class functions, closures, decorators) controls <em>what happens around a call</em>; <strong>resource management</strong> (<code>with</code>, context managers) controls <em>what happens around a block, on every exit</em>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Fixing the crash with a bare <code>try/except</code> around the loop hides pain 3 rather than fixing it: the program no longer crashes, but the file is still left open and the timing still missing. Each pain needs its own tool.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Same Program, Fixed.</b> We know which tool fixes which pain. What does the program look like with all three applied, and which line belongs to which feature?</div>

  <h2 id="pa-example"><span class="num">02</span>The Same Program, Fixed</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What does the Chai Corner report look like when it streams the file, times itself without pasted code, and can never leave the file open?</p>
  </div>
  <p>Here is the finished program. Do not worry about understanding every line yet: each child note builds one part of it from scratch. Read the comments to see which feature is where.</p>
  <div class="fx" data-lang="py">import functools, time
from contextlib import contextmanager

# 1. GENERATOR: hand out one clean order at a time (Iterators &amp; Generators)
def read_orders(path):
    with open(path) as f:                    # 3. CONTEXT MANAGER: file closed whatever happens
        for line in f:                       #    the file itself is an iterator
            parts = line.strip().split(",")
            if len(parts) != 4 or parts[0].startswith("#"):
                continue                     # skip the comment and the junk line
            time_, item, qty, price = parts
            yield {"time": time_, "item": item, "qty": int(qty), "price": int(price)}

# 2. DECORATOR: timing written once, attached with one line (Closures &amp; Decorators)
def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            print(f"[timed] {func.__name__} took {time.perf_counter() - t0:.4f}s")
    return wrapper

# 3b. @contextmanager: a GENERATOR turned into a with-block by a DECORATOR (Context Managers)
@contextmanager
def section(title):
    print(f"== {title} ==")
    try:
        yield
    finally:
        print(f"== end of {title} ==")

@timed
def total_revenue(path):
    return sum(o["qty"] * o["price"] for o in read_orders(path))   # generator expression

@timed
def items_sold(path):
    return sum(o["qty"] for o in read_orders(path))

with section("Monday report"):
    print("revenue:", total_revenue("orders.log"))
    print("items:  ", items_sold("orders.log"))</div>
  <div class="fx" data-lang="text">== Monday report ==
[timed] total_revenue took 0.0001s
revenue: 225
[timed] items_sold took 0.0001s
items:   7
== end of Monday report ==</div>
  <p>₹225 and 7 items, the hand answers. The junk lines were skipped, each function timed itself, the whole report sat inside a titled section, and the file was opened and closed twice (once per report function) without a single <code>close()</code> in sight.</p>
  <table class="tbl"><caption>Which line is which feature, and which note teaches it</caption>
    <tr><th>Code</th><th>Feature</th><th>What it does here</th><th>Taught in</th></tr>
    <tr><td><code>for line in f</code></td><td>iterator</td><td>a file hands out one line per <code>next()</code></td><td><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> §01</td></tr>
    <tr><td><code>yield {...}</code> in <code>read_orders</code></td><td>generator</td><td>pauses after each order; nothing is read until someone asks</td><td><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> §03</td></tr>
    <tr><td><code>sum(o["qty"] * … for o in …)</code></td><td>generator expression</td><td>one amount at a time into <code>sum</code></td><td><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> §04</td></tr>
    <tr><td><code>def timed(func): … return wrapper</code></td><td>closure + decorator</td><td>the wrapper remembers <code>func</code> and times each call</td><td><a class="xref" data-note="py_decorators">Closures &amp; Decorators</a> §03–04</td></tr>
    <tr><td><code>@functools.wraps(func)</code></td><td>decorator on the wrapper</td><td>the timing line prints the real name, <code>total_revenue</code></td><td><a class="xref" data-note="py_decorators">Closures &amp; Decorators</a> §05</td></tr>
    <tr><td><code>@timed</code></td><td>decorator syntax</td><td><code>total_revenue = timed(total_revenue)</code></td><td><a class="xref" data-note="py_decorators">Closures &amp; Decorators</a> §04</td></tr>
    <tr><td><code>with open(path) as f</code></td><td>context manager</td><td>file closed on every exit, even mid-generator</td><td><a class="xref" data-note="py_context">Context Managers</a> §02–03</td></tr>
    <tr><td><code>@contextmanager def section</code></td><td>generator + decorator = context manager</td><td>prints the title, pauses at <code>yield</code> for the body, prints the end in <code>finally</code></td><td><a class="xref" data-note="py_context">Context Managers</a> §05</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>The three features compose: a <strong>generator</strong> can contain a <code>with</code> (the file stays open while it is paused); a <strong>decorator</strong> can wrap a function that consumes a generator; and <code>@contextmanager</code> is a decorator applied to a generator to produce a context manager.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The <code>with open</code> sits <em>inside</em> the generator on purpose. Putting it in a normal function that <em>returns</em> a generator expression would close the file before anything is read; <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> §10 shows the resulting error.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Family Tree.</b> We can point at each feature in the code. But how did each one grow out of a simpler idea, and where do the branches meet?</div>

  <h2 id="pa-tree"><span class="num">03</span>The Family Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Five features, three notes. Which ideas are the roots, which are built on top of which, and why is <code>@contextmanager</code> taught last?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 330" width="700">
    <defs><marker id="pa-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="110" y="16" text-anchor="middle" class="tb" font-size="12">iteration</text>
    <text x="350" y="16" text-anchor="middle" class="tb" font-size="12">function wrapping</text>
    <text x="590" y="16" text-anchor="middle" class="tb" font-size="12">resources</text>
    <rect x="20" y="26" width="180" height="36" rx="6" class="fb sb"/><text x="110" y="49" text-anchor="middle" font-size="12">for loops</text>
    <rect x="260" y="26" width="180" height="36" rx="6" class="fb sb"/><text x="350" y="49" text-anchor="middle" font-size="12">functions are objects</text>
    <rect x="500" y="26" width="180" height="36" rx="6" class="fb sb"/><text x="590" y="49" text-anchor="middle" font-size="12">try / finally</text>
    <line x1="110" y1="62" x2="110" y2="84" stroke="currentColor" marker-end="url(#pa-a1)"/>
    <line x1="350" y1="62" x2="350" y2="84" stroke="currentColor" marker-end="url(#pa-a1)"/>
    <line x1="590" y1="62" x2="590" y2="84" stroke="currentColor" marker-end="url(#pa-a1)"/>
    <rect x="20" y="86" width="180" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="109" text-anchor="middle" font-size="12">iterator protocol</text>
    <rect x="260" y="86" width="180" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="350" y="109" text-anchor="middle" font-size="12">closures</text>
    <rect x="500" y="86" width="180" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="590" y="109" text-anchor="middle" font-size="12">with statement</text>
    <line x1="110" y1="122" x2="110" y2="144" stroke="currentColor" marker-end="url(#pa-a1)"/>
    <line x1="350" y1="122" x2="350" y2="144" stroke="currentColor" marker-end="url(#pa-a1)"/>
    <line x1="590" y1="122" x2="590" y2="144" stroke="currentColor" marker-end="url(#pa-a1)"/>
    <rect x="20" y="146" width="180" height="36" rx="6" class="ft st"/><text x="110" y="169" text-anchor="middle" font-size="12">generators (yield)</text>
    <rect x="260" y="146" width="180" height="36" rx="6" class="ft st"/><text x="350" y="169" text-anchor="middle" font-size="12">decorators (@)</text>
    <rect x="500" y="146" width="180" height="36" rx="6" class="ft st"/><text x="590" y="163" text-anchor="middle" font-size="12">context managers</text><text x="590" y="177" text-anchor="middle" class="tm" font-size="10">__enter__ / __exit__</text>
    <line x1="110" y1="182" x2="110" y2="204" stroke="currentColor" marker-end="url(#pa-a1)"/>
    <line x1="350" y1="182" x2="350" y2="204" stroke="currentColor" marker-end="url(#pa-a1)"/>
    <rect x="20" y="206" width="180" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="222" text-anchor="middle" font-size="12">lazy pipelines</text><text x="110" y="236" text-anchor="middle" class="tm" font-size="10">genexp · itertools</text>
    <rect x="260" y="206" width="180" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="350" y="222" text-anchor="middle" font-size="12">factories &amp; stacking</text><text x="350" y="236" text-anchor="middle" class="tm" font-size="10">@retry(times=3) · wraps</text>
    <path d="M200,164 Q330,290 460,290" fill="none" stroke="currentColor" stroke-dasharray="5 3" marker-end="url(#pa-a1)"/>
    <line x1="350" y1="242" x2="440" y2="276" stroke="currentColor" stroke-dasharray="5 3" marker-end="url(#pa-a1)"/>
    <line x1="590" y1="182" x2="570" y2="276" stroke="currentColor" stroke-dasharray="5 3" marker-end="url(#pa-a1)"/>
    <rect x="460" y="278" width="220" height="40" rx="6" class="fg sg" stroke-width="2"/><text x="570" y="296" text-anchor="middle" font-size="12" font-weight="700">@contextmanager</text><text x="570" y="311" text-anchor="middle" class="tm" font-size="10">generator + decorator → context manager</text>
  </svg><figcaption>Three roots (blue): for loops, functions as objects, try/finally. Each grows a middle layer and a main feature (teal). The dashed arrows show where the branches meet: @contextmanager takes a generator (left branch), is itself a decorator (middle branch) and produces a context manager (right branch). That is why it is taught last.</figcaption></figure>
  <h3>Branch 1: for loops → iterators → generators → pipelines</h3>
  <p>A <code>for</code> loop is really "call <code>iter()</code> once, then <code>next()</code> until <code>StopIteration</code>". That pair of calls is the <strong>iterator protocol</strong>. You can implement it with a class, but you have to store the position yourself. A <strong>generator</strong> implements it for you: a function with <code>yield</code> pauses, and its paused local variables <em>are</em> the position. Because a paused generator computes nothing until asked, chaining generators gives <strong>lazy pipelines</strong> that handle any amount of data one item at a time.</p>
  <h3>Branch 2: functions are objects → closures → decorators</h3>
  <p>A function is a value: it can be passed in, returned and stored. A function returned from inside another function keeps the outer variables it uses in <strong>cells</strong>; that is a <strong>closure</strong>. When the remembered variable is itself a function, the inner function can run extra code and call it in the middle: a <strong>decorator</strong>. <code>@d</code> is just <code>f = d(f)</code>. Options need one more closure layer (<code>@retry(times=3)</code>), and several decorators stack.</p>
  <h3>Branch 3: try/finally → with → context managers</h3>
  <p><code>try/finally</code> guarantees cleanup but must be written at every use. The <code>with</code> statement moves that <code>try/finally</code> into the resource object: <code>__enter__</code> sets up, <code>__exit__</code> cleans up on every exit path and can even swallow an error by returning <code>True</code>. Such an object is a <strong>context manager</strong>.</p>
  <h3>Where the branches meet</h3>
  <p>A generator paused at <code>yield</code> inside <code>try/finally</code> already has the shape "set up, pause while someone works, clean up". <code>@contextmanager</code> is a decorator that wraps such a generator into an object with <code>__enter__</code> (run to the <code>yield</code>) and <code>__exit__</code> (resume, or throw the error in at the <code>yield</code>). It needs all three branches, so it comes at the end.</p>
  <div class="callout def"><span class="label">Definition</span><p>Two kinds of "function with memory" underlie the group: a <strong>generator</strong> keeps its whole paused frame (local variables and current line) between <code>next()</code> calls; a <strong>closure</strong> keeps the specific outer variables it uses, in cells, between calls. Context managers then use the first, and decorators the second.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Learning the branches out of order. Decorators without closures look like magic; <code>@contextmanager</code> without generators looks like magic. If a feature seems magical, step one level up its branch in the tree.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Syntax That Calls Your Code.</b> The tree shows what is built from what. Is there one common pattern behind <code>for</code>, <code>@</code> and <code>with</code> themselves?</div>

  <h2 id="pa-syntax"><span class="num">04</span>Syntax That Calls Your Code</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>for</code>, <code>@</code> and <code>with</code> look like three unrelated keywords. What do they actually do when Python runs them?</p>
  </div>
  <p>Each is a short piece of syntax that calls methods of <em>your</em> objects at the right moments. To see it, here is one object that implements all three protocols and prints whenever Python calls one of its methods.</p>
  <div class="fx" data-lang="py">class Spy:
    """Reports every protocol method Python calls on it."""
    def __iter__(self):                      # for: called once
        print("  for  -&gt; __iter__")
        self.n = 0
        return self
    def __next__(self):                      # for: called per item
        self.n += 1
        print(f"  for  -&gt; __next__ #{self.n}")
        if self.n &gt; 2:
            raise StopIteration
        return self.n
    def __enter__(self):                     # with: on the way in
        print("  with -&gt; __enter__")
        return self
    def __exit__(self, *exc):                # with: on the way out, always
        print("  with -&gt; __exit__", exc)
        return False
    def __call__(self, func):                # @: called once with the function
        print(f"  @    -&gt; __call__({func.__name__})")
        return func

spy = Spy()
for x in spy:
    print("  body got", x)
with spy:
    print("  inside with")
@spy
def report():
    pass</div>
  <div class="fx" data-lang="text">  for  -&gt; __iter__
  for  -&gt; __next__ #1
  body got 1
  for  -&gt; __next__ #2
  body got 2
  for  -&gt; __next__ #3
  with -&gt; __enter__
  inside with
  with -&gt; __exit__ (None, None, None)
  @    -&gt; __call__(report)</div>
  <table class="tbl out"><caption>What each piece of syntax called</caption>
    <tr><th>Syntax</th><th>Methods called</th><th>When</th><th>On the Spy</th></tr>
    <tr><td><code>for x in obj</code></td><td><code>__iter__</code> once, <code>__next__</code> repeatedly</td><td>until <code>__next__</code> raises <code>StopIteration</code></td><td>iter, next #1 → 1, next #2 → 2, next #3 → stop</td></tr>
    <tr><td><code>with obj:</code></td><td><code>__enter__</code>, then <code>__exit__</code></td><td>before the block; after it on every exit path</td><td>exit received <code>(None, None, None)</code>: no error</td></tr>
    <tr><td><code>@obj</code> above <code>def f</code></td><td><code>obj(f)</code> (here <code>__call__</code>)</td><td>once, when the <code>def</code> runs</td><td><code>__call__(report)</code>, before any call to <code>report</code></td></tr>
  </table>
  <p>So none of the three is magic. Python defines the moments (start of a loop, each step, entering and leaving a block, defining a function); you supply the code that runs at those moments. Generators and <code>@contextmanager</code> are just convenient ways to write that code without a class.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>protocol</strong> is a set of dunder methods that a piece of syntax calls: the iterator protocol (<code>__iter__</code>, <code>__next__</code>) for <code>for</code>; the context-manager protocol (<code>__enter__</code>, <code>__exit__</code>) for <code>with</code>; and plain callability (<code>__call__</code>, which every function has) for <code>@</code>. See <a class="xref" data-note="py_oop">OOP</a> for dunder methods in general.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using the syntax on an object without the protocol: <code>for x in 5</code> → <code>TypeError: 'int' object is not iterable</code>; <code>with 5:</code> → <code>TypeError</code> (does not support the context manager protocol); <code>@5</code> → <code>'int' object is not callable</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Order.</b> We have the why, the tree and the common pattern. What exactly does each child note cover, and in which order should they be read?</div>

  <h2 id="pa-order"><span class="num">05</span>Reading Order: What Each Note Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which note first, what will each one teach, and what should you be able to do after each?</p>
  </div>
  <h3>1. <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></h3>
  <p><strong>Answers pain 1</strong> (everything in memory). The <code>for</code> loop taken apart and traced; iterable vs iterator; <code>OrderReader</code>, a class iterator over the log; the same thing as a 9-line generator, traced <code>next()</code> by <code>next()</code>; generator expressions; lazy evaluation (409 MB vs 0.0005 MB); pipelines over a billion-line log; <code>yield from</code>, <code>send</code>, <code>close</code>; <code>itertools</code>; one-pass traps. <em>After it you can</em> stream any file or data source through a chain of generators.</p>
  <h3>2. <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a></h3>
  <p><strong>Answers pain 2</strong> (pasted extra code). Functions as objects; LEGB scope; closures and cells (<code>make_tax</code>); <code>nonlocal</code> (token counter); late binding; decorators by hand and with <code>@</code>, when each part runs; <code>functools.wraps</code>; <code>@timed</code>; <code>@retry(times=3)</code> with its three layers traced; stacking order; <code>lru_cache</code>, registration, permission checks, class decorators. <em>After it you can</em> write and read any decorator, including ones with options.</p>
  <h3>3. <a class="xref" data-note="py_context">Context Managers</a></h3>
  <p><strong>Answers pain 3</strong> (cleanup skipped). The leak shown and measured; <code>try/finally</code>; <code>with</code> desugared; <code>__enter__</code>/<code>__exit__</code> and their three arguments; suppressing errors; <code>@contextmanager</code> (with a working mini-implementation built from a generator and a decorator); transactions; <code>ExitStack</code>; locks, sqlite3, temporary settings. <em>After it you can</em> make any resource safe with <code>with</code>.</p>
  <table class="tbl"><caption>The three notes at a glance</caption>
    <tr><th>Note</th><th>Pain it fixes</th><th>Needs first</th><th>Key result on the log</th></tr>
    <tr><td>Iterators &amp; Generators</td><td>data too big for memory</td><td>loops, functions, classes</td><td>₹225 from a 9-line generator; 15 of 10⁹ lines read</td></tr>
    <tr><td>Closures &amp; Decorators</td><td>same code pasted around many functions</td><td>functions, <code>*args</code>/<code>**kwargs</code></td><td><code>@timed</code>, <code>@retry</code> succeeds on try 3</td></tr>
    <tr><td>Context Managers</td><td>cleanup skipped by errors</td><td><code>try/finally</code>; generators; decorators</td><td>file closed despite "till restarted"; ROLLBACK keeps the ledger at ₹225</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>Recommended order: Iterators &amp; Generators → Closures &amp; Decorators → Context Managers. Notes 1 and 2 are independent of each other; note 3 uses both (its <code>@contextmanager</code> section needs generators and decorators).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Skipping straight to "how to write a decorator" templates. Without closures the template (<code>def wrapper</code> inside <code>def deco</code>, <code>return wrapper</code>) is memorised, not understood, and the first variation (options, stacking) breaks it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One table that places every concept of the group on the running example.</div>

  <h2 id="pa-connect"><span class="num">06</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can the whole group be held in one table: what each concept is built from, which question it answers, and what it gave on Chai Corner's log?</p>
  </div>
  <table class="tbl"><caption>Every concept of the group on the same log</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>When to use</th></tr>
    <tr><td>Iterator protocol</td><td><code>__iter__</code>, <code>__next__</code>, <code>StopIteration</code></td><td>how does <code>for</code> walk anything?</td><td>a file hands out the 6 lines one by one</td><td>always (every loop)</td></tr>
    <tr><td>Generator</td><td>function + <code>yield</code></td><td>can Python keep my place?</td><td><code>read_orders</code>: 4 orders, ₹225</td><td>custom streams</td></tr>
    <tr><td>Lazy pipeline</td><td>generators chained</td><td>how to handle data bigger than RAM?</td><td>15 of 10⁹ lines read; 0.0005 MB vs 409 MB</td><td>files, ETL, data loading</td></tr>
    <tr><td>First-class functions</td><td>functions are objects</td><td>can code receive a function?</td><td><code>apply_to_orders(with_gst, …)</code></td><td>callbacks, <code>key=</code></td></tr>
    <tr><td>Closure</td><td>inner function + cells</td><td>how does a made function keep settings?</td><td><code>make_tax(0.05)(225)</code> = 236.25</td><td>factories, counters</td></tr>
    <tr><td>Decorator</td><td>closure holding <code>func</code></td><td>how to add code around many functions?</td><td><code>@timed</code> on both report functions</td><td>timing, logging, retry, cache, auth</td></tr>
    <tr><td>Context manager</td><td><code>try/finally</code> inside an object</td><td>how to guarantee cleanup of a block?</td><td>log closed despite <code>ValueError</code></td><td>files, locks, transactions, settings</td></tr>
    <tr><td><code>@contextmanager</code></td><td>generator + decorator</td><td>shorter context managers?</td><td><code>section("Monday report")</code></td><td>most custom managers</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the group: <strong>Python lets your code run at three kinds of moment, at each step of a loop (iterators, made easy by generators), around each call of a function (decorators, made possible by closures), and on entering and leaving a block (context managers, made easy by generators plus a decorator), so that data can stream, extra behaviour can be written once, and cleanup can never be forgotten.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> One trap per feature, so you recognise them before meeting them in the child notes.</div>

  <h2 id="pa-traps"><span class="num">07</span>Common Mistakes Across the Group</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which single mistake is most typical for each feature, and where is it explained?</p>
  </div>
  <table class="tbl">
    <tr><th>Feature</th><th>Typical mistake</th><th>Symptom</th><th>Details</th></tr>
    <tr><td>Iterators</td><td>looping over an iterator twice</td><td>second loop silently does nothing (sum = 0)</td><td><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> §10</td></tr>
    <tr><td>Generators</td><td>expecting a function with <code>yield</code> to run when called</td><td>nothing happens until you iterate</td><td><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> §03</td></tr>
    <tr><td>Closures</td><td>late binding in a loop</td><td>every callback sees the last value</td><td><a class="xref" data-note="py_decorators">Closures &amp; Decorators</a> §03</td></tr>
    <tr><td>Decorators</td><td>wrapper without <code>return</code> / without <code>wraps</code></td><td>calls return <code>None</code> / name is "wrapper"</td><td><a class="xref" data-note="py_decorators">Closures &amp; Decorators</a> §04–05</td></tr>
    <tr><td>Context managers</td><td><code>@contextmanager</code> without <code>try/finally</code></td><td>cleanup skipped when the body raises</td><td><a class="xref" data-note="py_context">Context Managers</a> §05</td></tr>
    <tr><td>Generators + with</td><td>returning a lazy generator out of <code>with open</code></td><td><code>ValueError: I/O operation on closed file</code></td><td><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> §10</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: the child notes.</b> This map only names the ideas. Start with <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, where the <code>for</code> loop is taken apart on the Chai Corner log.</div>

  <h2 id="pa-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The group on one sheet. Running example: Chai Corner's Monday log (comment, chai 2 × 30, samosa 3 × 15, cold coffee 1 × 90, "till restarted", chai 1 × 30) → 4 orders, 7 items, ₹225.</p>
  <h3>The ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer in one line</th></tr>
    <tr><td><code>for</code> / iterator</td><td>how does a loop walk anything?</td><td><code>iter()</code> once, <code>next()</code> until <code>StopIteration</code></td></tr>
    <tr><td>Generator</td><td>can Python keep my place?</td><td><code>yield</code> pauses with locals kept; calling runs nothing</td></tr>
    <tr><td>Lazy pipeline</td><td>data bigger than memory?</td><td>chained generators; the consumer pulls one item through</td></tr>
    <tr><td>Functions are objects</td><td>can a function be passed?</td><td><code>f</code> is the function, <code>f()</code> calls it</td></tr>
    <tr><td>Closure</td><td>where do outer variables live?</td><td>in cells attached to the inner function</td></tr>
    <tr><td>Decorator</td><td>code around many functions?</td><td><code>@d</code> ≡ <code>f = d(f)</code>; wrapper calls the original; use <code>wraps</code></td></tr>
    <tr><td>Context manager</td><td>guaranteed cleanup?</td><td><code>with</code> calls <code>__enter__</code>, then <code>__exit__</code> on every exit</td></tr>
    <tr><td><code>@contextmanager</code></td><td>shorter?</td><td>before <code>yield</code> = enter, <code>finally</code> = exit</td></tr>
  </table>
  <h3>Syntax and what it means</h3>
  <table class="tbl">
    <tr><th>Written</th><th>Means</th></tr>
    <tr><td><code>for x in obj: body</code></td><td><code>it = iter(obj)</code>; repeat <code>x = next(it)</code>; body; stop at <code>StopIteration</code></td></tr>
    <tr><td><code>def g(): … yield v</code></td><td>calling <code>g()</code> returns a generator; each <code>next</code> runs to the next <code>yield</code></td></tr>
    <tr><td><code>(expr for x in xs)</code></td><td>lazy version of <code>[expr for x in xs]</code></td></tr>
    <tr><td><code>@d</code> <code>def f</code></td><td><code>f = d(f)</code>, once, at definition</td></tr>
    <tr><td><code>@d(opts)</code> <code>def f</code></td><td><code>f = d(opts)(f)</code></td></tr>
    <tr><td><code>with m as x: body</code></td><td><code>x = m.__enter__()</code>; body; <code>m.__exit__(type, exc, tb)</code> always; true return swallows</td></tr>
  </table>
  <h3>Which tool for which pain</h3>
  <div class="cards">
    <div><b>Data too big / streaming</b><p>Generators and generator expressions, chained into pipelines; <code>itertools</code>.</p><small>one pass only</small></div>
    <div><b>Same before/after code on many functions</b><p>A decorator (with <code>functools.wraps</code>); a factory if it needs options.</p><small><code>@timed</code>, <code>@retry(times=3)</code></small></div>
    <div><b>Something must be released</b><p>A context manager: <code>with</code>; write one with <code>@contextmanager</code> and <code>try/finally</code>.</p><small>files, locks, transactions</small></div>
    <div><b>A few lines need timing / setup</b><p>A context manager around the block; a decorator only if it is the whole function.</p><small><code>with timer("x"):</code></small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Iterators are one-pass and fail silently; a <code>yield</code> anywhere makes a function lazy; late binding in loops; wrappers must <code>return</code> the result and use <code>wraps</code>; <code>@contextmanager</code> needs <code>try/finally</code> around <code>yield</code>; never return a lazy generator out of a <code>with open</code>.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Which two methods does a <code>for</code> loop call?</td><td><code>__iter__</code> (once) and <code>__next__</code> (per item)</td></tr>
    <tr><td><code>@timed</code> above <code>def total_revenue</code> as an assignment?</td><td><code>total_revenue = timed(total_revenue)</code></td></tr>
    <tr><td>What does a context manager's <code>__exit__</code> get when the block raised <code>ValueError</code>?</td><td>(<code>ValueError</code>, the exception object, the traceback)</td></tr>
    <tr><td>Which feature is built from a generator plus a decorator?</td><td><code>@contextmanager</code></td></tr>
    <tr><td>Revenue of the Chai Corner log?</td><td>60 + 45 + 90 + 30 = ₹225</td></tr>
  </table>

  <h2 id="pa-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one sentence each: why do generators, decorators and context managers exist?</summary><div class="qa-body">Generators: to produce data one item at a time so it never has to fit in memory. Decorators: to write behaviour needed around many functions (timing, retry, caching) once. Context managers: to guarantee cleanup of a resource on every way out of a block, including errors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must you understand closures before decorators?</summary><div class="qa-body">A decorator returns a wrapper that is called later, after the decorator has finished, yet still has to call the original function. The original lives in the wrapper's closure cell. Without closures the wrapper could not remember which function it wraps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is <code>@contextmanager</code> built on a generator rather than a normal function?</summary><div class="qa-body">A context manager has to run setup, then pause while the <code>with</code> body runs, then resume for cleanup with its state intact. A normal function cannot pause; a generator pauses at <code>yield</code> with its locals kept, and its <code>finally</code> runs when it is resumed or thrown an exception.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what do a generator and a closure have in common, and how do they differ?</summary><div class="qa-body">Both are functions that keep variables between calls. A generator keeps its entire paused frame and resumes mid-body on each <code>next()</code>; a closure keeps only the outer variables it uses (in cells) and runs from the top on each call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in the Chai Corner program if you remove the <code>with</code> from <code>read_orders</code>?</summary><div class="qa-body">The file would be closed only when the generator object is garbage-collected, or never if a reference lingers. If a consumer stops early or a parse error is raised mid-file, the handle leaks; on a server handling many logs, handles run out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Decorator or context manager: how do you choose?</summary><div class="qa-body">Decorator when the extra behaviour wraps a whole function call every time. Context manager when it wraps a block of lines, needs to hand a value into the block (<code>as f</code>), or must clean up a resource. <code>@contextmanager</code> objects can serve as both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>for</code>, <code>@</code> and <code>with</code> have in common?</summary><div class="qa-body">Each is syntax that calls your code at fixed moments: <code>for</code> calls <code>__iter__</code>/<code>__next__</code>, <code>@</code> calls the decorator with the function once at definition, <code>with</code> calls <code>__enter__</code>/<code>__exit__</code> around a block. The Spy object in section 04 printed each call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where will you meet these in data and ML work?</summary><div class="qa-body">Generators: <code>pd.read_csv(chunksize=…)</code>, PyTorch <code>DataLoader</code>/<code>IterableDataset</code>, streaming datasets. Decorators: <code>@app.get</code> (FastAPI), <code>@pytest.fixture</code>, <code>@lru_cache</code>, <code>@torch.no_grad()</code>, <code>@dataclass</code>. Context managers: <code>with open</code>, <code>with torch.no_grad():</code>, <code>with mlflow.start_run():</code>, <code>with engine.begin()</code>, <code>with lock:</code>.</div></details>
</main>
`
});
