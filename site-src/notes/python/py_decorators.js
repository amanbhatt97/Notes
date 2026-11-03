// notes/python/py_decorators.js — Closures & Decorators
Object.assign(TOPIC_CONTENT, {
  "py_decorators": `<main>
<h1>Closures &amp; Decorators</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions</span><span>Closures &amp; Decorators</span></div>
  <p class="lead">A <strong>decorator</strong> is a function that takes a function and returns a replacement, usually a wrapper that runs extra code before and after calling the original. The <code>@deco</code> line above a <code>def</code> is shorthand for <code>f = deco(f)</code>. It works because of <strong>closures</strong>: an inner function keeps the outer variables it uses, including the original function, after the outer function has returned. Without decorators, behaviour needed by many functions, such as timing, logging, retries, caching and permission checks, gets pasted into each function body and drifts out of sync. You use them constantly in real code: <code>@app.get</code> in FastAPI, <code>@pytest.fixture</code>, <code>@functools.lru_cache</code>, <code>@torch.no_grad()</code>, <code>@dataclass</code>, <code>@property</code>. Code here was run on Python 3.13.</p>

  <h2 id="pd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Closures &amp; Decorators</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Functions are objects</div>
        <ul>
          <li><code>f</code> = the function; <code>f()</code> = call it</li>
          <li>Store, pass, return, put in a dict</li>
          <li><b>Higher-order function</b>: takes or returns a function (<code>sorted(key=)</code>, <code>map</code>)</li>
          <li>⚠ <code>f(x)</code> passes the result, <code>f</code> passes the function</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Closures</div>
        <ul>
          <li>Inner function + the outer variables it uses, kept alive after outer returns</li>
          <li>Stored in <b>cells</b>: <code>__closure__</code>, names in <code>__code__.co_freevars</code></li>
          <li>Scope lookup <b>LEGB</b>: Local, Enclosing, Global, Builtins</li>
          <li><b>nonlocal</b> to reassign; mutating needs nothing</li>
          <li>⚠ Late binding: value read at call time; fix with <code>x=x</code> or <code>partial</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Decorators</div>
        <ul>
          <li>Function in → function out (usually a wrapper closure)</li>
          <li><code>@d</code> above <code>def f</code> ≡ <code>f = d(f)</code></li>
          <li>Decorator runs once at def time; wrapper on every call</li>
          <li>Wrapper: <code>*args, **kwargs</code> in, <code>return func(*args, **kwargs)</code></li>
          <li><b>functools.wraps</b>: keeps name, doc, signature, adds <code>__wrapped__</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Options &amp; stacking</div>
        <ul>
          <li><code>@retry(times=3)</code>: factory(options) → decorator(func) → wrapper(args)</li>
          <li>Must write brackets: <code>@retry()</code></li>
          <li><code>@a @b def f</code> ≡ <code>f = a(b(f))</code>: apply bottom-up, run outside-in</li>
          <li>Order changes behaviour (timer outside vs inside retry)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>timed</b> (perf_counter in try/finally), <b>retry</b> with backoff</li>
          <li><b>lru_cache</b>: memoise pure functions</li>
          <li><b>Registration</b>: return func unchanged (<code>@app.route</code>)</li>
          <li><b>Auth</b>: <code>@require_role("manager")</code></li>
          <li>Class with <code>__call__</code> as decorator; <code>@dataclass</code>, <code>@property</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>⚠ Wrapper without <code>return</code> → every call gives <code>None</code></li>
          <li>⚠ Decorator without <code>return wrapper</code> → name becomes <code>None</code></li>
          <li>⚠ No <code>wraps</code> → name "wrapper", signature lost</li>
          <li>⚠ <code>@retry</code> without brackets → TypeError on call</li>
          <li>⚠ Cache: hashable args, pure functions only</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Decorators: Cross-Cutting Concerns</span><span class="rm-sub">same code pasted into many functions</span></div></div>
      <div class="rm-item rm-done" data-target="pd-func"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">First-Class Functions</span><span class="rm-sub">store, pass and return functions</span></div></div>
      <div class="rm-item rm-done" data-target="pd-clos"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Closures and LEGB Scope</span><span class="rm-sub">cells, nonlocal, late binding</span></div></div>
      <div class="rm-item rm-done" data-target="pd-deco"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Writing a Decorator: by Hand and with @</span><span class="rm-sub">f = deco(f), def time vs call time</span></div></div>
      <div class="rm-item rm-done" data-target="pd-wraps"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">functools.wraps and a Timing Decorator</span><span class="rm-sub">keep name, docstring, signature</span></div></div>
      <div class="rm-item rm-done" data-target="pd-args"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Decorators with Arguments</span><span class="rm-sub">three-layer factory, retry with backoff</span></div></div>
      <div class="rm-item rm-done" data-target="pd-stack"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Stacking Decorators</span><span class="rm-sub">apply bottom-up, run outside-in</span></div></div>
      <div class="rm-item rm-done" data-target="pd-real"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Decorator Patterns: Caching, Registration, Auth, Classes</span><span class="rm-sub">lru_cache, registries, class decorators</span></div></div>
      <div class="rm-item rm-done" data-target="pd-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">lost returns, names, brackets</span></div></div>
      <div class="rm-item rm-done" data-target="pd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">LEGB, templates, factories, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pd-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">closures, wraps, factories, stacking</span></div></div>
    </div>
  </div>

  <h2 id="pd-why"><span class="num">01</span>Why Decorators: Cross-Cutting Concerns</h2>
  <p>Some behaviour is needed by many unrelated functions: timing, logging, retries, caching, permission checks. Writing it inside each function buries the real logic and spreads identical code across the codebase. The examples use a small order log and the <code>read_orders</code> generator from <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, which streams the file and skips the comment and junk lines.</p>
  <div class="fx" data-lang="py">with open("orders.log", "w") as f:
    f.write("# Chai Corner till log, Monday\\n09:01,masala chai,2,30\\n09:05,samosa,3,15\\n"
            "09:12,cold coffee,1,90\\ntill restarted\\n09:20,masala chai,1,30\\n")

def read_orders(path):                    # the generator from Iterators &amp; Generators
    with open(path) as f:
        for line in f:
            parts = line.strip().split(",")
            if len(parts) == 4 and not parts[0].startswith("#"):
                time_, item, qty, price = parts
                yield {"time": time_, "item": item, "qty": int(qty), "price": int(price)}

print([(o["item"], o["qty"] * o["price"]) for o in read_orders("orders.log")])</div>
  <div class="fx" data-lang="text">[('masala chai', 60), ('samosa', 45), ('cold coffee', 90), ('masala chai', 30)]</div>
  <p>Four orders: 60 + 45 + 90 + 30 = <strong>₹225</strong>, and 2 + 3 + 1 + 1 = <strong>7 items</strong>. Adding timing to two report functions the obvious way:</p>
  <div class="fx" data-lang="py">import time

def total_revenue(path):
    t0 = time.perf_counter()                                        # pasted
    result = sum(o["qty"] * o["price"] for o in read_orders(path))
    print(f"total_revenue took {time.perf_counter() - t0:.5f}s")   # pasted
    return result

def items_sold(path):
    t0 = time.perf_counter()                                        # pasted again
    result = sum(o["qty"] for o in read_orders(path))
    print(f"items_sold took {time.perf_counter() - t0:.5f}s")      # pasted again
    return result

print(total_revenue("orders.log"), items_sold("orders.log"))</div>
  <div class="fx" data-lang="text">total_revenue took 0.00004s
items_sold took 0.00003s
225 7</div>
  <p>It works, but look at what happened. Each function's one real line (the <code>sum</code>) is now buried under three lines of timing that are identical apart from the name. With twenty report functions that is sixty pasted lines. Add logging next week and you paste again. When the timing format changes, you edit twenty places, and you will miss one.</p>
  <p>What we want is to write the timing code <strong>once</strong>, then apply it to a function with one short line, without touching the function's own code. That is a <strong>decorator</strong>. Building one needs three things: functions that can be passed around, inner functions that remember outer variables (closures), and a wrapper that calls the original in the middle.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A security guard at an office door. The room inside (your function) is unchanged. But everyone who goes in now passes the guard first, who checks the ID and writes in the register, and notes when they leave. You can put the same kind of guard on twenty doors without rebuilding any room.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>cross-cutting concern</strong> is behaviour needed by many unrelated functions (timing, logging, retries, caching, permission checks) that is not part of any one function's job. Decorators exist to write a cross-cutting concern once and attach it anywhere.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Just call a helper at the top of each function" (<code>start_timer()</code> … <code>stop_timer()</code>) still edits every function, and forgets to stop the timer when the function raises an error in the middle. The extra code has to sit <em>around</em> the call, not inside the body.</p></div>

  <h2 id="pd-func"><span class="num">02</span>First-Class Functions</h2>
  <p>In Python a function is an ordinary value, like a number or a list. The name <code>with_gst</code> without brackets is the function itself, an object sitting in memory. The brackets are what make the difference: <code>with_gst</code> means "the function"; <code>with_gst(225)</code> means "run it now and give me its result".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A recipe card versus the dish. <code>with_gst</code> is the recipe card: you can photocopy it, hand it to a friend, or post it to someone. <code>with_gst(225)</code> is cooking the dish from the card. Handing someone the card does not cook anything.</p></div>
  <p>The code shows the four things you can do with a function value (GST at 5%).</p>
  <div class="fx" data-lang="py">def with_gst(amount):
    return round(amount * 1.05, 2)

f = with_gst                              # 1. store it (no brackets!)
print(f(225), f is with_gst, type(f).__name__, f.__name__)

def apply_to_orders(func, path):          # 2. pass it in
    return [func(o["qty"] * o["price"]) for o in read_orders(path)]
print(apply_to_orders(with_gst, "orders.log"))

menu = {"masala chai": 30, "samosa": 15, "cold coffee": 90}
print(sorted(menu, key=menu.get))         # sorted calls menu.get on each item

def pick_tax(kind):                       # 3. return it
    def no_tax(amount):
        return amount
    return with_gst if kind == "gst" else no_tax
print(pick_tax("gst")(100), pick_tax("none")(100), pick_tax("none").__name__)

handlers = {"gst": with_gst, "none": pick_tax("none")}   # 4. keep it in a dict
print(handlers["gst"](60), handlers["none"](60))</div>
  <div class="fx" data-lang="text">236.25 True function with_gst
[63.0, 47.25, 94.5, 31.5]
['samosa', 'masala chai', 'cold coffee']
105.0 100 no_tax
63.0 60</div>
  <p>Line by line. <code>f = with_gst</code> did not call anything; it made a second name for the same function object, so <code>f is with_gst</code> is <code>True</code> and <code>f(225)</code> gave 236.25 (225 × 1.05). <code>apply_to_orders</code> received the function as <code>func</code> and called it once per order: 60 → 63.0, 45 → 47.25, 90 → 94.5, 30 → 31.5. <code>sorted(menu, key=menu.get)</code> handed the dict's <code>get</code> method to <code>sorted</code>, which called it on each item to sort by price (15, 30, 90). <code>pick_tax</code> <em>returned</em> a function, and we called the result straight away: <code>pick_tax("gst")(100)</code> → 105.0. A dict of functions is a "dispatch table": choose behaviour by key.</p>
  <div class="callout def"><span class="label">Definition</span><p>Python has <strong>first-class functions</strong>: functions are objects that can be assigned, passed as arguments, returned and stored in data structures. A function that takes or returns another function is a <strong>higher-order function</strong> (<code>sorted</code> with <code>key=</code>, <code>map</code>, <code>filter</code>, and every decorator).</p></div>
  <div class="callout trap"><span class="label">Trap: calling instead of passing</span><p>Add brackets and you pass the <em>result</em>, not the function:</p></div>
  <div class="fx" data-lang="py">try:
    apply_to_orders(with_gst(10), "orders.log")     # brackets: passes 10.5, not the function
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: 'float' object is not callable</div>
  <p><code>with_gst(10)</code> ran immediately and gave 10.5, so <code>apply_to_orders</code> tried to call the number 10.5. Same bug in real code: <code>Thread(target=work())</code> runs <code>work</code> in the main thread right away. Pass the name without brackets.</p>

  <h2 id="pd-clos"><span class="num">03</span>Closures and LEGB Scope</h2>
  <p>A function factory such as "make me a tax function for rate r" returns an inner function that uses <code>r</code>, a local variable of a function that has already returned. Normally a function's locals are discarded on return. Closures are how Python keeps them.</p>
  <p>Python notices that the inner function uses an outer variable, and keeps that variable alive, attached to the inner function. The inner function carries it around. A function bundled with the outer variables it needs is a <strong>closure</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tiffin box packed at home. Your mother (the outer function) packs dal and rice (the variables) in the morning and goes about her day. At 1 p.m. at the office (long after she "returned"), you open the tiffin and the food is there. The inner function leaves home carrying exactly the variables it needs.</p></div>
  <h3>Where does Python look for a name? LEGB</h3>
  <p>When a function reads a name, Python searches four places in order: <strong>L</strong>ocal (the function's own variables), <strong>E</strong>nclosing (variables of any outer function it sits inside), <strong>G</strong>lobal (the module), <strong>B</strong>uiltins (<code>len</code>, <code>print</code>…).</p>
  <div class="fx" data-lang="py">rate = 0.18                               # Global
def outer():
    rate = 0.05                           # Enclosing
    def inner():
        return rate                       # not Local -&gt; Enclosing: 0.05
    return inner()
print(outer(), rate, len("abc"))          # len comes from Builtins</div>
  <div class="fx" data-lang="text">0.05 0.18 3</div>
  <p><code>inner</code> has no local <code>rate</code>, so Python looked in the enclosing <code>outer</code> and found 0.05, before ever reaching the global 0.18. <code>len</code> was found only in builtins. A closure is simply what keeps the <strong>E</strong> level alive after the outer function returns.</p>
  <h3>Closure factories and __closure__ cells</h3>
  <div class="fx" data-lang="py">def make_tax(rate):
    def add_tax(amount):
        return round(amount * (1 + rate), 2)   # rate belongs to the OUTER function
    return add_tax

with_gst = make_tax(0.05)                 # make_tax has finished running...
with_service = make_tax(0.10)
print(with_gst(225), with_service(225))   # ...but each copy still knows its own rate
print(with_gst.__code__.co_freevars)
print(with_gst.__closure__[0].cell_contents, with_service.__closure__[0].cell_contents)
print(with_gst is with_service, with_gst.__code__ is with_service.__code__)</div>
  <div class="fx" data-lang="text">236.25 247.5
('rate',)
0.05 0.1
False True</div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="pd-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="200" height="56" rx="6" class="fs" stroke="currentColor"/><text x="22" y="62">make_tax(0.05)</text><text x="22" y="82" class="tm">runs, then finishes</text>
    <line x1="212" y1="68" x2="276" y2="68" stroke="currentColor" marker-end="url(#pd-a1)"/><text x="218" y="58" class="tm">returns</text>
    <rect x="280" y="20" width="200" height="100" rx="6" class="fb sb"/><text x="292" y="42">add_tax(amount)</text><text x="292" y="62" class="tm">amount * (1 + rate)</text>
    <rect x="292" y="76" width="176" height="32" rx="5" class="fg sg"/><text x="302" y="97">cell: rate = 0.05</text>
    <text x="496" y="62">= with_gst</text>
    <text x="10" y="142" class="tm">with_gst(225) reads rate from its own cell → 225 × 1.05 = 236.25</text>
  </svg><figcaption>make_tax(0.05) builds add_tax and returns it. make_tax itself is gone, but add_tax keeps the variable rate = 0.05 in a cell attached to it (green). That bundle is the closure we named with_gst.</figcaption></figure>
  <table class="tbl out"><caption>Trace: two calls to the factory</caption>
    <tr><th>Step</th><th>What Python does</th><th>Cells</th><th>Result</th></tr>
    <tr><td><code>make_tax(0.05)</code></td><td>creates local <code>rate</code> = 0.05; defines <code>add_tax</code>, which uses <code>rate</code> → <code>rate</code> goes into a cell; returns <code>add_tax</code></td><td>cell A: 0.05</td><td><code>with_gst</code></td></tr>
    <tr><td><code>make_tax(0.10)</code></td><td>a brand-new call: new <code>rate</code>, new cell, new <code>add_tax</code> object</td><td>cell B: 0.1</td><td><code>with_service</code></td></tr>
    <tr><td><code>with_gst(225)</code></td><td>local <code>amount</code> = 225; <code>rate</code> read from cell A</td><td>A: 0.05</td><td>236.25</td></tr>
    <tr><td><code>with_service(225)</code></td><td><code>rate</code> read from cell B</td><td>B: 0.1</td><td>247.5</td></tr>
  </table>
  <p>The printout confirms it: <code>co_freevars</code> lists the outer names the code uses (<code>('rate',)</code>), and <code>__closure__</code> holds one cell per name, 0.05 and 0.1. The two functions are different objects (<code>False</code>) that share the same compiled code (<code>True</code>): only the cells differ.</p>
  <h3>Reassigning an enclosing variable: nonlocal</h3>
  <p>A counter must remember its last number and <em>change</em> it on every call.</p>
  <div class="fx" data-lang="py">def make_token_counter(start=1):
    n = start - 1
    def next_token():
        nonlocal n                        # "n is the outer n; let me change it"
        n += 1
        return n
    return next_token

front = make_token_counter()              # tokens at the front counter
window = make_token_counter(500)          # tokens at the delivery window
print(front(), front(), front(), window(), front())

def make_order_book():
    book = []
    def add(item):
        book.append(item)                 # mutating the list, not reassigning: no nonlocal
        return len(book)
    return add
add = make_order_book()
print(add("chai"), add("samosa"))

def broken_counter():
    n = 0
    def next_token():
        n += 1                            # no nonlocal
        return n
    return next_token
broken_counter()()</div>
  <div class="fx" data-lang="text">1 2 3 500 4
1 2
UnboundLocalError: cannot access local variable 'n' where it is not associated with a value</div>
  <p>Trace <code>front</code>: n starts at 0; calls give 1, 2, 3. <code>window</code> is a separate closure with its own n (499 → 500), so the fourth call to <code>front</code> continues at 4. The <code>nonlocal n</code> line is required: without it, <code>n += 1</code> makes Python treat <code>n</code> as a brand-new local variable of <code>next_token</code>, and reading it before assigning fails, as <code>broken_counter</code> shows (the error is shown as its last line). Reading an outer variable needs nothing; <em>reassigning</em> it needs <code>nonlocal</code>. Mutating an outer object (<code>book.append</code>) also needs nothing, because the name <code>book</code> is never reassigned.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>closure</strong> is a function object together with the variables from its enclosing function that it uses (its <strong>free variables</strong>), stored in <strong>cells</strong> (<code>func.__closure__</code>) and kept alive after the enclosing function returns. <strong>nonlocal x</strong> tells Python that assigning to <code>x</code> should change the enclosing function's <code>x</code>.</p></div>
  <h3>Late binding in closures</h3>
  <p>A cell holds the <em>variable</em>, not its value at the moment the function was made. The value is read when the function is <em>called</em>. For example, callbacks built in a loop:</p>
  <div class="fx" data-lang="py">items = ["masala chai", "samosa", "cold coffee"]
buttons = [lambda: f"order {item}" for item in items]
print([b() for b in buttons])             # all see the LAST item

buttons = [lambda item=item: f"order {item}" for item in items]   # default arg freezes it now
print([b() for b in buttons])

import functools
buttons = [functools.partial("order {}".format, item) for item in items]
print([b() for b in buttons])</div>
  <div class="fx" data-lang="text">['order cold coffee', 'order cold coffee', 'order cold coffee']
['order masala chai', 'order samosa', 'order cold coffee']
['order masala chai', 'order samosa', 'order cold coffee']</div>
  <p>All three lambdas share the one loop variable <code>item</code>. By the time they are called the loop is over and <code>item</code> is "cold coffee". A default argument (<code>item=item</code>) is evaluated when the lambda is <em>created</em>, so each lambda gets its own copy; <code>functools.partial</code> also freezes the value now.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Late binding is a very common interview "what's the output?" question (<code>[lambda: i for i in range(3)]</code> → all return 2) and a real bug when building callbacks in a loop. Freeze the value with a default argument or <code>partial</code>.</p></div>

  <h2 id="pd-deco"><span class="num">04</span>Writing a Decorator: by Hand and with @</h2>
  <p>Combining the two previous ideas gives a decorator: pass a function in, return an inner function that does extra work and calls the original, and rebind the original name to that inner function.</p>
  <h3>Wrapping by hand: f = deco(f)</h3>
  <p><code>logged</code> takes the original function as <code>func</code>, defines a <code>wrapper</code> that prints, calls <code>func</code>, prints the result and returns it, and returns that wrapper. Because <code>wrapper</code> uses <code>func</code>, <code>func</code> lives in a cell: the wrapper is a closure holding the original. Then we point the name <code>total_revenue</code> at the wrapper.</p>
  <div class="fx" data-lang="py">def logged(func):
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__} args={args} kwargs={kwargs}")
        result = func(*args, **kwargs)    # run the original
        print(f"  {func.__name__} returned {result}")
        return result
    return wrapper

def total_revenue(path):
    return sum(o["qty"] * o["price"] for o in read_orders(path))

original = total_revenue
total_revenue = logged(total_revenue)     # rebind the name to the wrapped version
print(total_revenue("orders.log"))
print(total_revenue is original, total_revenue.__name__)
print(total_revenue.__closure__[0].cell_contents is original)</div>
  <div class="fx" data-lang="text">calling total_revenue args=('orders.log',) kwargs={}
  total_revenue returned 225
225
False wrapper
True</div>
  <p>Walk through <code>total_revenue = logged(total_revenue)</code>. On the right side, <code>logged</code> receives the original as <code>func</code>, defines <code>wrapper</code> and returns it. On the left side, the name <code>total_revenue</code> now points at that wrapper. The original still exists: it is in the wrapper's cell (the last line prints <code>True</code>). So <code>total_revenue("orders.log")</code> really calls <code>wrapper("orders.log")</code>.</p>
  <table class="tbl out"><caption>Trace of total_revenue("orders.log") after wrapping</caption>
    <tr><th>Step</th><th>Running</th><th>What happens</th></tr>
    <tr><td>1</td><td><code>wrapper</code></td><td><code>args = ('orders.log',)</code>, <code>kwargs = {}</code>; prints "calling total_revenue…" (<code>func.__name__</code> is the original's name)</td></tr>
    <tr><td>2</td><td>original <code>total_revenue</code></td><td><code>func(*args, **kwargs)</code> = <code>func('orders.log')</code>; sums 60 + 45 + 90 + 30 = 225</td></tr>
    <tr><td>3</td><td><code>wrapper</code></td><td><code>result = 225</code>; prints "returned 225"; <code>return result</code></td></tr>
    <tr><td>4</td><td>caller</td><td>receives 225 and prints it</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 620 180" width="620">
    <defs><marker id="pd-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="20" class="tm">before:</text>
    <text x="10" y="52">total_revenue</text>
    <line x1="112" y1="48" x2="146" y2="48" stroke="currentColor" marker-end="url(#pd-a2)"/>
    <rect x="150" y="30" width="190" height="36" rx="6" class="fg sg"/><text x="162" y="53">original function</text>
    <text x="10" y="100" class="tm">after total_revenue = logged(total_revenue):</text>
    <text x="10" y="142">total_revenue</text>
    <line x1="112" y1="138" x2="146" y2="138" stroke="currentColor" marker-end="url(#pd-a2)"/>
    <rect x="150" y="120" width="170" height="36" rx="6" class="fb sb"/><text x="162" y="143">wrapper()</text>
    <line x1="322" y1="138" x2="406" y2="138" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pd-a2)"/>
    <rect x="410" y="120" width="190" height="36" rx="6" class="fg sg"/><text x="422" y="143">original function</text>
    <text x="330" y="174" class="tm">kept in the wrapper's cell as func</text>
  </svg><figcaption>A decorator only moves a name. Before, the name points at your function. After, it points at the wrapper, and the wrapper holds on to the original (dashed arrow) so it can call it in the middle.</figcaption></figure>
  <h3>The @ syntax</h3>
  <p>Writing <code>@logged</code> on the line above <code>def items_sold</code> is shorthand for writing <code>items_sold = logged(items_sold)</code> right after the function. Nothing more.</p>
  <div class="fx" data-lang="py">@logged                                   # exactly: items_sold = logged(items_sold)
def items_sold(path):
    return sum(o["qty"] for o in read_orders(path))

print(items_sold("orders.log"))

@logged
def bill(item, qty=1, *, tip=0):          # any signature fits *args, **kwargs
    return menu[item] * qty + tip

print(bill("samosa", 3))
print(bill("cold coffee", tip=10))</div>
  <div class="fx" data-lang="text">calling items_sold args=('orders.log',) kwargs={}
  items_sold returned 7
7
calling bill args=('samosa', 3) kwargs={}
  bill returned 45
45
calling bill args=('cold coffee',) kwargs={'tip': 10}
  bill returned 100
100</div>
  <p><code>items_sold</code> gave 7. <code>bill</code> shows why the wrapper takes <code>*args, **kwargs</code>: it means "accept any positional and keyword arguments" and then pass them all on unchanged. The same <code>logged</code> fitted a one-argument function and a function with a default and a keyword-only argument (<code>args=('cold coffee',)</code>, <code>kwargs={'tip': 10}</code> → 90 + 10 = 100).</p>
  <h3>Definition time vs call time</h3>
  <p>There are two moments. The decorator function runs <strong>once</strong>, when Python reaches the <code>def</code> (usually when the module is imported). The wrapper runs on <strong>every call</strong>.</p>
  <div class="fx" data-lang="py">def announce(func):
    print(f"decorating {func.__name__}")      # runs ONCE, at def time
    def wrapper(*args, **kwargs):
        print(f"before {func.__name__}")      # runs on EVERY call
        result = func(*args, **kwargs)
        print(f"after {func.__name__}")
        return result
    return wrapper

@announce
def busiest_item(path):
    counts = {}
    for o in read_orders(path):
        counts[o["item"]] = counts.get(o["item"], 0) + o["qty"]
    return max(counts, key=counts.get)

print("--- definition done, now calling")
print(busiest_item("orders.log"))
print(busiest_item("orders.log"))</div>
  <div class="fx" data-lang="text">decorating busiest_item
--- definition done, now calling
before busiest_item
after busiest_item
masala chai
before busiest_item
after busiest_item
masala chai</div>
  <p>"decorating busiest_item" appeared once, before any call, as soon as the <code>def</code> finished. Each call then printed before/after around the real body. (Masala chai and samosa tie at 3 items; <code>max</code> keeps the first one it met.) This is how Flask's <code>@app.route("/home")</code> works: the decorator runs at import time and registers your function in a table of URLs; later each web request calls it.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>decorator</strong> is a callable that takes a function and returns a replacement, usually a <strong>wrapper</strong> closure that runs extra code and calls the original. <code>@d</code> above <code>def f</code> means <code>f = d(f)</code>, executed once at definition time.</p></div>
  <div class="callout trap"><span class="label">Trap: the two missing returns</span><p>Forget <code>return</code> in the wrapper and every call returns <code>None</code>. Forget <code>return wrapper</code> in the decorator and the name itself becomes <code>None</code>:</p></div>
  <div class="fx" data-lang="py">def forgetful(func):
    def wrapper(*args, **kwargs):
        func(*args, **kwargs)             # forgot "return"
    return wrapper

@forgetful
def revenue_v1(path):
    return 225
print(revenue_v1("orders.log"))

def no_wrapper(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    # forgot "return wrapper"

@no_wrapper
def revenue_v2(path):
    return 225
print(revenue_v2)
revenue_v2("orders.log")</div>
  <div class="fx" data-lang="text">None
None
TypeError: 'NoneType' object is not callable</div>
  <p><code>revenue_v1("orders.log")</code> ran the original (which returned 225), but the wrapper threw the value away: <code>None</code>. <code>no_wrapper</code> returned nothing, so <code>revenue_v2 = no_wrapper(revenue_v2)</code> set the name to <code>None</code>, and calling it failed. A third slip, <code>return wrapper()</code> with brackets, calls the wrapper once at definition time.</p>

  <h2 id="pd-wraps"><span class="num">05</span>functools.wraps and a Timing Decorator</h2>
  <p>After wrapping, the name <code>total_revenue</code> points at a function called <code>wrapper</code>, with signature <code>(*args, **kwargs)</code> and no docstring. Logs, <code>help()</code> and frameworks all see "wrapper".</p>
  <p><code>functools.wraps(func)</code> is itself a decorator, applied to the wrapper. It copies the original's <code>__name__</code>, <code>__qualname__</code>, <code>__doc__</code>, <code>__module__</code>, <code>__dict__</code> and annotations onto the wrapper, and adds <code>__wrapped__</code>, a link back to the original.</p>
  <div class="fx" data-lang="py">import functools, inspect

def plain(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def kept(func):
    @functools.wraps(func)                # copy name, docstring, signature info
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@plain
def revenue_a(path: str) -&gt; int:
    """Total rupees taken in the log at path."""
    return sum(o["qty"] * o["price"] for o in read_orders(path))

@kept
def revenue_b(path: str) -&gt; int:
    """Total rupees taken in the log at path."""
    return sum(o["qty"] * o["price"] for o in read_orders(path))

for fn in (revenue_a, revenue_b):
    print(fn.__name__, "|", fn.__doc__, "|", inspect.signature(fn))
print(revenue_b.__wrapped__("orders.log"), hasattr(revenue_a, "__wrapped__"))</div>
  <div class="fx" data-lang="text">wrapper | None | (*args, **kwargs)
revenue_b | Total rupees taken in the log at path. | (path: str) -&gt; int
225 False</div>
  <p>Both decorated functions work. But <code>revenue_a</code> lost its identity: name "wrapper", docstring <code>None</code>, signature <code>(*args, **kwargs)</code>. <code>revenue_b</code>, with <code>@functools.wraps(func)</code>, reports its real name, docstring and signature <code>(path: str) -&gt; int</code> (<code>inspect.signature</code> follows <code>__wrapped__</code>). <code>revenue_b.__wrapped__</code> reaches the undecorated function, which tests use to call it without the extras. FastAPI, pytest and Click read signatures to decide what arguments to pass, so a missing <code>wraps</code> can break them.</p>
  <h3>A @timed decorator</h3>
  <p>The timing code from the first example, written once. It goes in <code>try/finally</code> so the time is reported even if the function raises an error.</p>
  <div class="fx" data-lang="py">import functools, time

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:                          # report even if func raises
            print(f"[timed] {func.__name__} took {time.perf_counter() - t0:.4f}s")
    return wrapper

@timed
def total_revenue(path):
    return sum(o["qty"] * o["price"] for o in read_orders(path))

@timed
def items_sold(path):
    return sum(o["qty"] for o in read_orders(path))

@timed
def slow_report(path):
    time.sleep(0.2)                       # pretend: formatting a PDF
    return f"Rs {total_revenue(path)}"

print(total_revenue("orders.log"), items_sold("orders.log"))
print(slow_report("orders.log"))</div>
  <div class="fx" data-lang="text">[timed] total_revenue took 0.0001s
[timed] items_sold took 0.0000s
225 7
[timed] total_revenue took 0.0002s
[timed] slow_report took 0.2003s
Rs 225</div>
  <p>Three functions, one <code>@timed</code> line each, and the timing code exists in one place. (Your timings will differ: they are real measurements.) <code>slow_report</code> calls <code>total_revenue</code> inside it, so its call printed two lines: the inner timing first (0.0002 s), then the outer one (about 0.2 s, mostly the sleep). Each wrapper reports its own call.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>functools.wraps(func)</strong> is a decorator for wrappers that copies <code>__module__</code>, <code>__name__</code>, <code>__qualname__</code>, <code>__doc__</code>, <code>__annotations__</code> (and more) and updates <code>__dict__</code> from <code>func</code>, then sets <code>wrapper.__wrapped__ = func</code>. It is a shortcut for <code>functools.update_wrapper(wrapper, func)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Without <code>wraps</code>, two decorated Flask views are both named "wrapper" and Flask refuses to register the second ("View function mapping is overwriting an existing endpoint function"). Rule: always put <code>@functools.wraps(func)</code> on your wrapper.</p></div>

  <h2 id="pd-args"><span class="num">06</span>Decorators with Arguments</h2>
  <p>A retry decorator needs options: how many tries, which errors, how long to wait. A decorator is called with only the function, so the options need another layer: <code>@retry(times=3, exceptions=(ConnectionError,))</code>.</p>
  <p>Notice the brackets after <code>retry</code>. Python first <em>calls</em> <code>retry(times=3, …)</code>, and whatever that returns is used as the decorator. So <code>retry(…)</code> must <em>return a decorator</em>, which takes the function and returns a wrapper. That is three nested functions, each with one job, and each inner one is a closure over the outer ones' variables.</p>
  <div class="flow"><span>retry(times=3)</span><span>returns decorator</span><span>decorator(func)</span><span>returns wrapper</span><span>wrapper(*args) on each call</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A tailor's shop. First you give your measurements (the options: <code>times=3</code>). The shop makes a pattern for you (the decorator). The pattern is then used to stitch the cloth (your function) into a shirt (the wrapper). Measurements → pattern → shirt.</p></div>
  <p>The code prints a line from each layer so you can see when it runs. <code>fetch_orders</code> fails twice with a <code>ConnectionError</code> and then succeeds. On each failure the wrapper waits a little longer ("exponential backoff": delay, 2 × delay, 4 × delay…).</p>
  <div class="fx" data-lang="py">import functools, time

def retry(times=3, exceptions=(Exception,), delay=0.0):
    print("layer 1: retry(...) ran -&gt; returns decorator")
    def decorator(func):
        print(f"layer 2: decorator({func.__name__}) ran -&gt; returns wrapper")
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == times:
                        raise                     # give up: re-raise the original error
                    print(f"  attempt {attempt} failed: {e}; retrying")
                    time.sleep(delay * 2 ** (attempt - 1))   # exponential backoff
        return wrapper
    return decorator

calls = {"n": 0}

@retry(times=3, exceptions=(ConnectionError,), delay=0.01)
def fetch_orders(path):                   # the till sends its log over flaky Wi-Fi
    calls["n"] += 1
    print(f"  layer 3: wrapper -&gt; fetch_orders try #{calls['n']}")
    if calls["n"] &lt; 3:
        raise ConnectionError("Wi-Fi dropped")
    return list(read_orders(path))

print("--- decorated; now calling")
print(len(fetch_orders("orders.log")), "orders fetched")</div>
  <div class="fx" data-lang="text">layer 1: retry(...) ran -&gt; returns decorator
layer 2: decorator(fetch_orders) ran -&gt; returns wrapper
--- decorated; now calling
  layer 3: wrapper -&gt; fetch_orders try #1
  attempt 1 failed: Wi-Fi dropped; retrying
  layer 3: wrapper -&gt; fetch_orders try #2
  attempt 2 failed: Wi-Fi dropped; retrying
  layer 3: wrapper -&gt; fetch_orders try #3
4 orders fetched</div>
  <table class="tbl out"><caption>Three layers, three moments</caption>
    <tr><th>Moment</th><th>Call</th><th>Returns</th><th>Remembers (closure cells)</th></tr>
    <tr><td>def time</td><td><code>retry(times=3, exceptions=…, delay=0.01)</code></td><td><code>decorator</code></td><td>times, exceptions, delay</td></tr>
    <tr><td>def time</td><td><code>decorator(fetch_orders)</code></td><td><code>wrapper</code>, now named <code>fetch_orders</code></td><td>+ func</td></tr>
    <tr><td>each call</td><td><code>fetch_orders("orders.log")</code> = <code>wrapper(…)</code></td><td>the 4 orders, after up to 3 tries</td><td>uses all of the above</td></tr>
  </table>
  <table class="tbl out"><caption>Trace inside the wrapper</caption>
    <tr><th>attempt</th><th>original raises?</th><th>attempt == times?</th><th>action</th><th>wait</th></tr>
    <tr><td>1</td><td>ConnectionError (in the list)</td><td>no</td><td>print, sleep, loop</td><td>0.01 × 2⁰ = 0.01 s</td></tr>
    <tr><td>2</td><td>ConnectionError</td><td>no</td><td>print, sleep, loop</td><td>0.01 × 2¹ = 0.02 s</td></tr>
    <tr><td>3</td><td>no, returns 4 orders</td><td>—</td><td><code>return</code> the result</td><td>—</td></tr>
  </table>
  <p>Layers 1 and 2 printed before "now calling": both run when the <code>def</code> is decorated. Only layer 3 runs per call. Two more cases: an error that keeps happening, and the classic forgotten brackets.</p>
  <div class="fx" data-lang="py">@retry(times=2)
def parse_price(text):
    return int(text)

try:
    parse_price("thirty")
except ValueError as e:
    print("gave up:", e)

try:
    @retry                                # forgot the brackets
    def oops():
        return 1
    oops()
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">layer 1: retry(...) ran -&gt; returns decorator
layer 2: decorator(parse_price) ran -&gt; returns wrapper
  attempt 1 failed: invalid literal for int() with base 10: 'thirty'; retrying
gave up: invalid literal for int() with base 10: 'thirty'
layer 1: retry(...) ran -&gt; returns decorator
TypeError: retry.&lt;locals&gt;.decorator() missing 1 required positional argument: 'func'</div>
  <p><code>parse_price("thirty")</code> failed on both tries; on the last one, <code>raise</code> with no argument re-raised the <em>original</em> <code>ValueError</code>, so the caller saw the real cause. With <code>@retry</code> and no brackets, Python called <code>retry(oops)</code>: the function landed in <code>times</code>, layer 1 returned <code>decorator</code>, and the name <code>oops</code> became that decorator. Calling <code>oops()</code> then called <code>decorator()</code> with no function: <code>TypeError</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>parameterised decorator</strong> (decorator factory) is a function that takes options and returns a decorator: <code>@factory(opts)</code> above <code>def f</code> means <code>f = factory(opts)(f)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Retry only <em>temporary</em> errors (timeouts, HTTP 503, connection resets). Retrying a <code>ValueError</code> just repeats the same bug, as <code>parse_price</code> did. Retrying something that is not safe to repeat (a payment, an SMS) can do it twice. And with options you must write the brackets, even if empty: <code>@retry()</code>.</p></div>

  <h2 id="pd-stack"><span class="num">07</span>Stacking Decorators</h2>
  <p>With <code>@timed</code> and <code>@retry(…)</code> both on one function, the order of the lines decides whether <code>timed</code> measures the whole retry loop or each try.</p>
  <p>Decorators are applied from the bottom up (the one nearest the <code>def</code> wraps first), so the top one ends up outermost. At call time they run from the outside in, like layers of an onion. A small example makes the order visible:</p>
  <div class="fx" data-lang="py">def tag(t):
    def deco(f):
        @functools.wraps(f)
        def w(*a, **k):
            return f"&lt;{t}&gt;{f(*a, **k)}&lt;/{t}&gt;"
        return w
    return deco

@tag("b")
@tag("i")
def special():
    return "masala chai"                  # = tag("b")(tag("i")(special))

print(special())</div>
  <div class="fx" data-lang="text">&lt;b&gt;&lt;i&gt;masala chai&lt;/i&gt;&lt;/b&gt;</div>
  <p><code>@tag("b") @tag("i") def special</code> means <code>special = tag("b")(tag("i")(special))</code>. The i-wrapper was made first and sits inside; calling <code>special()</code> enters the b-wrapper, which calls the i-wrapper, which calls the real function. So <code>&lt;b&gt;</code> ends up outside.</p>
  <h3>Stacking order changes behaviour: timed and retry</h3>
  <p>Here the two orders are built with explicit calls (the same as two <code>@</code> lines). <code>flaky_till(2)</code> is a closure-made fetch function that fails twice, each try taking 0.05 s.</p>
  <div class="fx" data-lang="py">def flaky_till(fails):
    state = {"n": 0}                      # a closure remembers how many tries so far
    def fetch(path):
        state["n"] += 1
        time.sleep(0.05)                  # each try takes 0.05 s
        if state["n"] &lt;= fails:
            raise ConnectionError(f"Wi-Fi dropped (try {state['n']})")
        return list(read_orders(path))
    return fetch

print("== timed OUTSIDE retry")
fetch_a = timed(retry(times=3, exceptions=(ConnectionError,))(flaky_till(2)))
print(len(fetch_a("orders.log")), "orders")

print("== retry OUTSIDE timed")
fetch_b = retry(times=3, exceptions=(ConnectionError,))(timed(flaky_till(2)))
print(len(fetch_b("orders.log")), "orders")</div>
  <div class="fx" data-lang="text">== timed OUTSIDE retry
layer 1: retry(...) ran -&gt; returns decorator
layer 2: decorator(fetch) ran -&gt; returns wrapper
  attempt 1 failed: Wi-Fi dropped (try 1); retrying
  attempt 2 failed: Wi-Fi dropped (try 2); retrying
[timed] fetch took 0.1511s
4 orders
== retry OUTSIDE timed
layer 1: retry(...) ran -&gt; returns decorator
layer 2: decorator(fetch) ran -&gt; returns wrapper
[timed] fetch took 0.0502s
  attempt 1 failed: Wi-Fi dropped (try 1); retrying
[timed] fetch took 0.0502s
  attempt 2 failed: Wi-Fi dropped (try 2); retrying
[timed] fetch took 0.0512s
4 orders</div>
  <table class="tbl"><caption>Same two decorators, different order</caption>
    <tr><th>Written as</th><th>Equivalent to</th><th>timed measures</th><th>Output</th></tr>
    <tr><td><code>@timed</code> above <code>@retry(…)</code></td><td><code>timed(retry(…)(fetch))</code></td><td>the whole retry loop, all 3 tries</td><td>one line, ≈ 0.15 s</td></tr>
    <tr><td><code>@retry(…)</code> above <code>@timed</code></td><td><code>retry(…)(timed(fetch))</code></td><td>each single try</td><td>three lines, ≈ 0.05 s each</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Stacked decorators</strong>: <code>@a</code> <code>@b</code> <code>def f</code> means <code>f = a(b(f))</code>. Applied bottom-up at definition time; at call time <code>a</code>'s wrapper runs first and calls <code>b</code>'s wrapper, which calls <code>f</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Order matters whenever decorators interact: an auth check placed <em>under</em> a cache may let a cached result reach an unauthorised user; <code>@app.route</code> must be the top decorator in Flask, or it registers the undecorated function.</p></div>

  <h2 id="pd-real"><span class="num">08</span>Decorator Patterns: Caching, Registration, Auth, Classes</h2>
  <p>Most production decorators fall into a few shapes: wrap and cache results, register the function somewhere and return it unchanged, check a condition before calling, or use a class instead of a closure. Decorators can also be applied to classes.</p>
  <h3>Caching: functools.lru_cache</h3>
  <p>Suppose every order needs an item price from a slow service (0.05 s) whose prices do not change during the day. <strong>Memoisation</strong> means remembering results: compute <code>menu_price("samosa")</code> once, then just look it up. <code>functools.lru_cache</code> is a decorator whose wrapper keeps a dict from arguments to results: a closure again.</p>
  <div class="fx" data-lang="py">import functools, time
lookups = {"n": 0}

@functools.lru_cache(maxsize=None)
def menu_price(item):
    lookups["n"] += 1
    time.sleep(0.05)                      # pretend: a slow call to the menu server
    return {"masala chai": 30, "samosa": 15, "cold coffee": 90}[item]

day = [o["item"] for o in read_orders("orders.log")] * 25       # 100 orders
t = time.perf_counter()
total = sum(menu_price(i) for i in day)
print(f"{len(day)} lookups, {lookups['n']} real calls, {time.perf_counter() - t:.2f}s, sum {total}")
print(menu_price.cache_info())</div>
  <div class="fx" data-lang="text">100 lookups, 3 real calls, 0.15s, sum 4125
CacheInfo(hits=97, misses=3, maxsize=None, currsize=3)</div>
  <p>100 lookups, but only 3 real calls (one per distinct item), so about 0.15 s instead of 5 s. <code>cache_info()</code> confirms: 3 misses, 97 hits. The sum is (30 + 15 + 90 + 30) × 25 = 4125. The same idea at scale, on the classic recursive Fibonacci (about 1.6 million calls for <code>fib(30)</code> without a cache):</p>
  <div class="fx" data-lang="py">def fib_slow(n):
    return n if n &lt; 2 else fib_slow(n - 1) + fib_slow(n - 2)

@functools.lru_cache(maxsize=None)        # functools.cache is the same, 3.9+
def fib(n):
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)

t = time.perf_counter(); fib_slow(30); print(f"plain fib(30):  {time.perf_counter() - t:.3f}s")
t = time.perf_counter(); fib(30);      print(f"cached fib(30): {time.perf_counter() - t:.6f}s")
print(fib.cache_info())

@functools.lru_cache
def basket_total(prices):
    return sum(prices)
print(basket_total((30, 15)))
basket_total([30, 15])</div>
  <div class="fx" data-lang="text">plain fib(30):  0.145s
cached fib(30): 0.000031s
CacheInfo(hits=28, misses=31, maxsize=None, currsize=31)
45
TypeError: unhashable type: 'list'</div>
  <p>Thousands of times faster: only 31 real computations (<code>misses</code>, one per n from 0 to 30) and 28 look-ups (<code>hits</code>). The last line shows the limit: the cache stores arguments as dict keys, so they must be <strong>hashable</strong> (numbers, strings, tuples). A list is not, so it fails; pass a tuple instead.</p>
  <ul>
    <li>Use it only for <strong>pure</strong> functions: same input always gives same output, no side effects. Caching a function that reads the clock or a database returns stale answers.</li>
    <li><code>maxsize=128</code> (the default) throws away the least recently used entries; <code>None</code> grows forever.</li>
    <li>On methods it keeps every <code>self</code> alive inside the cache; prefer <code>functools.cached_property</code> for per-object values.</li>
  </ul>
  <p>More on <code>cache_info()</code>, eviction and the hashable-argument rule: <a class="xref" data-note="py_advanced">Functional Programming Tools</a>.</p>
  <h3>Registration: a decorator that does not wrap</h3>
  <p>A decorator may return the function <em>unchanged</em> after recording it somewhere. This is how Flask routes, pytest fixtures and plugin systems find your functions.</p>
  <div class="fx" data-lang="py">COMMANDS = {}

def command(name):
    def register(func):
        COMMANDS[name] = func             # record it ...
        return func                       # ... and hand back the SAME function, unwrapped
    return register

@command("revenue")
def revenue(path):
    return sum(o["qty"] * o["price"] for o in read_orders(path))

@command("items")
def count_items(path):
    return sum(o["qty"] for o in read_orders(path))

print(list(COMMANDS))
for name in ("revenue", "items"):
    print(name, "-&gt;", COMMANDS[name]("orders.log"))</div>
  <div class="fx" data-lang="text">['revenue', 'items']
revenue -&gt; 225
items -&gt; 7</div>
  <p><code>command("revenue")</code> returned <code>register</code>, which stored the function in <code>COMMANDS</code> and gave it back untouched. Commands can now be dispatched by name.</p>
  <h3>Permission checks</h3>
  <p>Suppose only a manager may give refunds. Rather than an <code>if</code> at the top of every sensitive function, the rule goes in one decorator:</p>
  <div class="fx" data-lang="py">def require_role(role):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(user, *args, **kwargs):
            if role not in user["roles"]:
                raise PermissionError(f"{user['name']} is not a {role}")
            return func(user, *args, **kwargs)
        return wrapper
    return decorator

@require_role("manager")
def refund(user, amount):
    return f"{user['name']} refunded Rs {amount}"

asha = {"name": "Asha", "roles": {"manager", "cashier"}}
ravi = {"name": "Ravi", "roles": {"cashier"}}
print(refund(asha, 90))
try:
    refund(ravi, 90)
except PermissionError as e:
    print("PermissionError:", e)</div>
  <div class="fx" data-lang="text">Asha refunded Rs 90
PermissionError: Ravi is not a manager</div>
  <p>The wrapper looks at the first argument (the user) before calling the real function, and raises <code>PermissionError</code> for Ravi. FastAPI's <code>Depends</code>, Django's <code>@login_required</code> and Flask-Login's decorator do this.</p>
  <h3>Classes as decorators, and decorators on classes</h3>
  <p>A decorator only needs to be <em>callable</em>. A class with <code>__call__</code> works, and keeps its state as attributes instead of closure cells. In the other direction, a decorator can be applied to a class: <code>@dataclass</code> reads the class's annotated fields and adds <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code>. <code>@property</code> turns a method into a read-only attribute.</p>
  <div class="fx" data-lang="py">class CountCalls:                         # a decorator written as a class
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.calls = 0                    # state lives on the object instead of a closure
    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.func(*args, **kwargs)

@CountCalls
def items_today(path):
    return sum(o["qty"] for o in read_orders(path))

items_today("orders.log"); items_today("orders.log")
print(items_today("orders.log"), "items;", items_today.calls, "calls;", items_today.__name__)

from dataclasses import dataclass

@dataclass(frozen=True)                   # decorating a CLASS: adds __init__, __repr__, __eq__
class Order:
    time: str
    item: str
    qty: int
    price: int

    @property                             # a method you read like an attribute
    def amount(self):
        return self.qty * self.price

day = [Order(**o) for o in read_orders("orders.log")]
print(day[0])
print(day[0].amount, sum(o.amount for o in day), day[0] == Order("09:01", "masala chai", 2, 30))</div>
  <div class="fx" data-lang="text">7 items; 3 calls; items_today
Order(time='09:01', item='masala chai', qty=2, price=30)
60 225 True</div>
  <p><code>CountCalls</code> counted 3 calls and, thanks to <code>update_wrapper</code>, still reports the name <code>items_today</code>. <code>Order</code> got a constructor and a readable repr for free; <code>o.amount</code> is read without brackets; the day's total is again ₹225. (See <a class="xref" data-note="py_oop">OOP</a> for <code>@staticmethod</code>, <code>@classmethod</code> and <code>@abstractmethod</code>, which are decorators too.)</p>
  <div class="callout def"><span class="label">Definition</span><p>Any callable that takes one object and returns a replacement can be used with <code>@</code>: a function, a class with <code>__call__</code>, or a factory call like <code>retry(…)</code>. <code>@</code> works above <code>def</code> and above <code>class</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>lru_cache</code> on an impure function (time, database, random) returns stale results; with unhashable arguments (lists, dicts, DataFrames) it raises <code>TypeError</code>; on instance methods it keeps objects alive forever.</p></div>

  <h2 id="pd-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: calling instead of passing</span>
    <p><code>apply_to_orders(with_gst(10), …)</code>, <code>Thread(target=work())</code>, <code>sorted(xs, key=len())</code>: the brackets run the function now and pass its result (<code>'float' object is not callable</code>). Pass the name: <code>target=work</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reassigning an outer variable without nonlocal</span>
    <p><code>n += 1</code> inside the inner function → <code>UnboundLocalError</code>. Add <code>nonlocal n</code>. (Mutating, like <code>book.append(x)</code>, does not need it.)</p>
  </div>
  <div class="callout trap"><span class="label">Trap: late binding in loops</span>
    <p>Lambdas created in a loop all see the loop variable's last value. Freeze the value: <code>lambda item=item: …</code> or <code>functools.partial</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the wrapper loses the result or the name</span>
    <p>Missing <code>return func(*args, **kwargs)</code> → every call returns <code>None</code>. Missing <code>return wrapper</code> → the decorated name is <code>None</code>. Missing <code>@functools.wraps(func)</code> → name "wrapper", no docstring, signature <code>(*args, **kwargs)</code>, frameworks confused.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgotten brackets on a factory</span>
    <p><code>@retry</code> instead of <code>@retry()</code> passes the function in as <code>times</code>; the call later fails with "missing 1 required positional argument: 'func'".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting the decorator to run per call</span>
    <p>Code in the decorator body (outside the wrapper) runs once, at import. Put per-call work inside the wrapper.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong stacking order</span>
    <p><code>@timed</code> over <code>@retry</code> times all tries together; swapped, each try separately. Auth under cache can leak cached data. Decide which behaviour must be outermost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: lru_cache on the wrong function</span>
    <p>Unhashable arguments → <code>TypeError</code>. Impure functions → stale results. Instance methods → objects never freed. Unbounded <code>maxsize=None</code> with many distinct inputs → memory grows.</p>
  </div>

  <h2 id="pd-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>First-class functions</h3>
  <ul>
    <li><code>f</code> is the function object; <code>f()</code> calls it. Pass <code>f</code>, not <code>f()</code> (<code>Thread(target=work)</code>).</li>
    <li>Higher-order function: takes or returns a function. Every decorator is one.</li>
  </ul>
  <h3>Closures and scope</h3>
  <ul>
    <li>Name lookup <strong>LEGB</strong>: Local → Enclosing → Global → Builtins.</li>
    <li>Closure = function + cells for its free variables, alive after the outer function returns. Inspect with <code>f.__code__.co_freevars</code> and <code>f.__closure__[i].cell_contents</code>.</li>
    <li>Each call of the outer function creates new cells, so closures from different calls are independent.</li>
    <li><code>nonlocal x</code>: needed to <em>reassign</em> an enclosing variable (<code>x += 1</code>). Without it you get <code>UnboundLocalError</code>. Reading or mutating (<code>lst.append</code>) needs nothing. <code>global x</code> is the module-level equivalent.</li>
    <li>Late binding: cells hold variables, read at call time. <code>[lambda: i for i in range(3)]</code> → all return 2. Fix: <code>lambda i=i: i</code> or <code>functools.partial</code>.</li>
  </ul>
  <h3>Decorator mechanics</h3>
  <table class="tbl">
    <tr><th>Written</th><th>Means</th><th>Notes</th></tr>
    <tr><td><code>@d</code> <code>def f</code></td><td><code>f = d(f)</code></td><td><code>d</code> runs once, at def/import time</td></tr>
    <tr><td><code>@d(opts)</code> <code>def f</code></td><td><code>f = d(opts)(f)</code></td><td>three layers: options → func → call args</td></tr>
    <tr><td><code>@a</code> <code>@b</code> <code>def f</code></td><td><code>f = a(b(f))</code></td><td>applied bottom-up, run outside-in</td></tr>
    <tr><td><code>@d</code> <code>class C</code></td><td><code>C = d(C)</code></td><td><code>@dataclass</code>, <code>@total_ordering</code></td></tr>
  </table>
  <div class="fx" data-lang="py">import functools

def deco(func):
    @functools.wraps(func)                 # keep __name__, __doc__, signature; add __wrapped__
    def wrapper(*args, **kwargs):          # accept any signature
        # before
        result = func(*args, **kwargs)
        # after
        return result                      # don't lose the return value
    return wrapper                         # don't forget this

def factory(times=3):                      # decorator with arguments
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ...                            # uses times and func from closures
        return wrapper
    return decorator</div>
  <ul>
    <li><code>functools.wraps(func)</code> = <code>update_wrapper(wrapper, func)</code>: copies <code>__module__</code>, <code>__name__</code>, <code>__qualname__</code>, <code>__doc__</code>, <code>__annotations__</code>, updates <code>__dict__</code>, sets <code>__wrapped__</code>. <code>inspect.signature</code> follows <code>__wrapped__</code>.</li>
    <li>Put timing/cleanup in <code>try/finally</code> inside the wrapper so it runs when <code>func</code> raises.</li>
    <li>Async functions need an <code>async def wrapper</code> that <code>await</code>s <code>func</code>.</li>
  </ul>
  <h3>Patterns</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Shape</th><th>Examples</th></tr>
    <tr><td>Wrap (before/after)</td><td>wrapper calls func</td><td>timing, logging, retry, <code>torch.no_grad</code></td></tr>
    <tr><td>Memoise</td><td>wrapper with a dict keyed by args</td><td><code>lru_cache</code>, <code>cache</code> (hashable args, pure functions)</td></tr>
    <tr><td>Register</td><td>record func, return it unchanged</td><td><code>@app.route</code>, plugin tables, <code>singledispatch.register</code></td></tr>
    <tr><td>Guard</td><td>check, then call or raise</td><td><code>@login_required</code>, role checks, input validation</td></tr>
    <tr><td>Class-based</td><td>class with <code>__init__(func)</code> + <code>__call__</code></td><td>decorators with state (call counts)</td></tr>
    <tr><td>Class decorator</td><td>takes and returns a class</td><td><code>@dataclass</code>, <code>@total_ordering</code></td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Wrapper missing <code>return</code> → every call returns <code>None</code>.</li>
    <li>Decorator missing <code>return wrapper</code> → the name becomes <code>None</code>; <code>return wrapper()</code> calls it at def time.</li>
    <li>No <code>wraps</code> → name "wrapper", lost docstring/signature; Flask endpoint name clashes.</li>
    <li><code>@factory</code> without brackets → the function lands in the first option; <code>TypeError</code> on call.</li>
    <li>Per-call work placed in the decorator body runs only once, at import.</li>
    <li>Stacking order matters: timer outside retry measures all tries; auth under a cache can leak cached results; <code>@app.route</code> goes on top.</li>
    <li>Retry only transient, idempotent operations.</li>
  </ul>

  <h2 id="pd-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a decorator?</summary><div class="qa-body">A callable that takes a function (or class) and returns a replacement, usually a wrapper that adds behaviour before and/or after calling the original. Decorators let you write cross-cutting concerns such as logging, timing, caching, retries and auth once and attach them to many functions without editing their bodies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@deco</code> above <code>def f</code> do, exactly?</summary><div class="qa-body">After the function is defined, Python runs <code>f = deco(f)</code>. The name <code>f</code> now points at whatever <code>deco</code> returned, usually a wrapper that holds the original in its closure. The decorator runs once at definition (import) time; the wrapper runs on every call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a closure, and where are its variables stored?</summary><div class="qa-body">A function plus the variables of its enclosing function that it uses, kept alive after the enclosing function returns. They are stored in cell objects in <code>func.__closure__</code>, and their names are in <code>func.__code__.co_freevars</code>. For example, <code>make_tax(0.05)</code> returns a function whose cell holds 0.05.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the LEGB rule.</summary><div class="qa-body">When a name is read, Python looks in Local scope (the current function), then Enclosing function scopes (outer functions, innermost first), then Global (the module), then Builtins (<code>len</code>, <code>print</code>). Assignment inside a function creates a local name unless it is declared <code>global</code> or <code>nonlocal</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need <code>nonlocal</code>? How is it different from <code>global</code>?</summary><div class="qa-body">When an inner function <em>reassigns</em> a variable of an enclosing function (<code>n += 1</code>). Without it Python treats <code>n</code> as a new local and raises <code>UnboundLocalError</code>. Reading, or mutating an object (<code>lst.append</code>), needs nothing. <code>global</code> targets a module-level name; <code>nonlocal</code> targets the nearest enclosing function's name.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>fs = [lambda: i for i in range(3)]; print([f() for f in fs])</code></summary><div class="qa-body"><code>[2, 2, 2]</code>. All lambdas close over the same variable <code>i</code>, and its value is read when they are called, after the loop has ended (late binding). Fix it with a default argument <code>lambda i=i: i</code> or <code>functools.partial</code>, which capture the value at creation time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a decorator that logs a function's name and arguments.</summary><div class="qa-body"><div class="fx" data-lang="py">import functools

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__} args={args} kwargs={kwargs}")
        return func(*args, **kwargs)
    return wrapper</div>Key points: <code>*args, **kwargs</code> so it fits any signature, <code>return</code> the result, and <code>functools.wraps</code> to keep the original's metadata.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>functools.wraps</code> do, and what breaks without it?</summary><div class="qa-body">It copies <code>__name__</code>, <code>__qualname__</code>, <code>__doc__</code>, <code>__module__</code> and <code>__annotations__</code> from the original to the wrapper, updates <code>__dict__</code>, and sets <code>__wrapped__</code>. Without it the function reports itself as "wrapper" with signature <code>(*args, **kwargs)</code>. Logs, <code>help()</code> and tracebacks become confusing, frameworks that inspect names or signatures (Flask endpoints, FastAPI, pytest) misbehave, and tests cannot reach the original via <code>__wrapped__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a decorator with arguments need three nested functions?</summary><div class="qa-body"><code>@retry(times=3)</code> first <em>calls</em> <code>retry(times=3)</code>. That call must return the real decorator, which takes <code>func</code> and returns the wrapper. So the layers are factory (options) → decorator (function) → wrapper (call arguments), and each inner layer is a closure over the outer layers' variables.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a decorator that works both as <code>@retry</code> and <code>@retry(times=5)</code>?</summary><div class="qa-body">Make the function the optional first positional argument and the options keyword-only. If <code>func</code> is <code>None</code>, the decorator was called with options, so return a decorator:<div class="fx" data-lang="py">def retry(func=None, *, times=3):
    if func is None:                       # used as @retry(times=5)
        return functools.partial(retry, times=times)
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        for attempt in range(1, times + 1):
            try:
                return func(*args, **kwargs)
            except ConnectionError:
                if attempt == times:
                    raise
    return wrapper</div></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order are stacked decorators applied and run? Predict the output of two stacked printing decorators.</summary><div class="qa-body"><div class="fx" data-lang="py">def deco(name):
    def d(f):
        print("applying", name)
        def w():
            print("enter", name)
            return f()
        return w
    return d

@deco("outer")
@deco("inner")
def hello():
    print("hello")
hello()</div><div class="fx" data-lang="text">applying inner
applying outer
enter outer
enter inner
hello</div>Decorators are applied bottom-up (<code>hello = outer(inner(hello))</code>), so "inner" is applied first. At call time the outermost wrapper runs first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the code in a decorator run versus the code in the wrapper?</summary><div class="qa-body">The decorator body (outside the wrapper) runs once, when the <code>def</code> statement executes, usually at import time. That is where registration decorators like <code>@app.route</code> do their work. The wrapper body runs on every call. Per-call work placed in the decorator body therefore runs only once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you write a decorator that keeps state, such as a call counter?</summary><div class="qa-body">Either a closure with a <code>nonlocal</code> counter (or an attribute on the wrapper, <code>wrapper.calls += 1</code>), or a class with <code>__init__(self, func)</code> and <code>__call__</code> storing <code>self.calls</code>, using <code>functools.update_wrapper(self, func)</code>. A class is clearer when the state or the API grows (reset methods, several counters). Note that a plain class decorator does not bind <code>self</code> when used on methods unless it implements <code>__get__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you decorate an <code>async def</code> function?</summary><div class="qa-body">The wrapper must itself be <code>async def</code> and <code>await</code> the original; otherwise it returns the coroutine object without running or timing the actual work.<div class="fx" data-lang="py">def atimed(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return await func(*args, **kwargs)
        finally:
            print(f"{func.__name__} took {time.perf_counter() - t0:.2f}s")
    return wrapper</div></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a class decorator? Give examples.</summary><div class="qa-body">A decorator applied to a class: <code>@d class C</code> means <code>C = d(C)</code>. It usually inspects or modifies the class and returns it. <code>@dataclass</code> generates <code>__init__</code>/<code>__repr__</code>/<code>__eq__</code> from annotations, and <code>functools.total_ordering</code> fills in comparison methods. Separately, a <em>class used as a decorator</em> is a class with <code>__call__</code> that wraps a function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are <code>@property</code>, <code>@staticmethod</code> and <code>@classmethod</code> decorators?</summary><div class="qa-body">Yes. They are built-in classes applied with <code>@</code> that return descriptor objects. <code>property</code> turns a method into a computed attribute (with optional setter/deleter), <code>staticmethod</code> removes the implicit first argument, and <code>classmethod</code> passes the class instead of the instance. They work through the descriptor protocol (<code>__get__</code>), not by wrapping calls.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a registration decorator return, and why?</summary><div class="qa-body">The original function, unchanged, after recording it in a table (<code>COMMANDS[name] = func</code>). It only needs the side effect at definition time; there is no per-call behaviour to add, so no wrapper. Flask's <code>@app.route</code>, pytest fixtures and plugin systems work this way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is <code>lru_cache</code> a bad idea?</summary><div class="qa-body">On impure functions (depending on time, a DB or randomness, so results go stale), with unhashable arguments (lists, dicts, DataFrames raise <code>TypeError</code>), with unbounded <code>maxsize=None</code> and many distinct inputs (memory grows), and on instance methods (the cache keeps <code>self</code> alive). See <a class="xref" data-note="py_advanced">Functional Programming Tools</a> for <code>cache_info()</code> and alternatives.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Decorator or context manager: how do you choose?</summary><div class="qa-body">Use a decorator when the behaviour wraps a whole function call every time. Use a context manager when it wraps a block of lines inside a function, needs to give a value to the block (<code>with open(p) as f</code>), or must release a resource. Objects built with <code>contextlib.contextmanager</code> (or subclassing <code>ContextDecorator</code>) can be used both ways.</div></details>
</main>
`
});
