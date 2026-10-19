// notes/python/py_decorators.js — Closures & Decorators
Object.assign(TOPIC_CONTENT, {
  "py_decorators": `<main>
<h1>Closures &amp; Decorators</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions</span><span>Closures &amp; Decorators</span></div>
  <p class="lead">The <code>@something</code> line above a function looks like magic until you see that it is one ordinary assignment: <code>f = something(f)</code>. This note builds that line from the ground up, one need at a time: functions are objects you can pass around, an inner function can remember variables after its outer function has finished (a <strong>closure</strong>), and a closure that wraps another function is a <strong>decorator</strong>. Then the practical layer: <code>functools.wraps</code>, decorators that take options (<code>@retry(times=3)</code>), stacking, caching, registration and permission checks. The running example is the same Chai Corner order log as the rest of the group, and every piece of code was run with its real output shown.</p>

  <h2 id="pd-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
    <defs><marker id="pd-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="230" y="8" width="180" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="28" text-anchor="middle" font-size="12">Advanced Python Functions: map</text>
    <line x1="320" y1="38" x2="110" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="320" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="530" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="20" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="92" text-anchor="middle" font-size="12">Iterators &amp; Generators</text>
    <rect x="230" y="70" width="180" height="34" rx="6" class="fg sg" stroke-width="2.5"/><text x="320" y="92" text-anchor="middle" font-size="12" font-weight="700">Closures &amp; Decorators</text>
    <rect x="440" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="530" y="92" text-anchor="middle" font-size="12">Context Managers</text>
    <path d="M320,104 Q420,150 520,108" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pd-a0)"/>
    <text x="420" y="160" text-anchor="middle" class="tm" font-size="11">@contextmanager is itself a decorator</text>
  </svg><figcaption>The Advanced Python Functions group. You are on the green note. Context Managers later uses a decorator, @contextmanager, to turn a generator into a with-block.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_fundamentals">Python Fundamentals</a> and <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></b><span>You can write functions with <code>*args</code>/<code>**kwargs</code>, defaults and <code>lambda</code>, and you know a generator is a function that keeps its local variables while paused. Left open: how do you add the same extra behaviour (timing, logging, retries) to many functions without pasting it into each? The group map, <a class="xref" data-note="py_advanced">Advanced Python Functions: the map</a>, set up the Chai Corner log and its <code>@timed</code> report.</span></li>
    <li><b>This note adds: functions as values, closures, decorators</b><span>First-class functions, nested functions, scope (LEGB), closures and cells, <code>nonlocal</code>, late binding, decorators by hand and with <code>@</code>, when each part runs, <code>functools.wraps</code>, parameterised decorators, stacking, <code>lru_cache</code>, registration, auth checks, class-based decorators, <code>@dataclass</code> and <code>@property</code>.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_context">Context Managers</a></b><span>A decorator wraps a <em>function call</em> with before/after code. A context manager wraps a <em>block of code</em> with setup/cleanup that runs even on errors, and <code>@contextmanager</code> (a decorator) builds one from a generator. Further on: <a class="xref" data-note="py_testing">Testing &amp; Debugging</a> (<code>@pytest.fixture</code>, <code>mock.patch</code>), <a class="xref" data-note="api_flask">Flask</a> and <a class="xref" data-note="api_fastapi">FastAPI</a> (<code>@app.route</code>, <code>@app.get</code>).</span></li>
  </ol>

  <h2 id="pd-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Running example: the Chai Corner log (4 valid orders, 7 items, ₹225).</p>
  <ol class="story">
    <li><b>The problem</b><span>Q: how do I time <code>total_revenue</code> and <code>items_sold</code> without pasting timing code into each? → I can't yet: the extra code must sit <em>around</em> each function. To put code around a function I must be able to hand the function to other code…</span></li>
    <li><b>Functions are objects</b><span>Q: can a function be handed around? → Yes: store it (<code>f = with_gst</code>), pass it (<code>apply_to_orders(with_gst, …)</code> → 63.0, 47.25, 94.5, 31.5), return it, keep it in a dict. But a returned inner function uses variables of a function that has already finished…</span></li>
    <li><b>Closures</b><span>Q: where do those variables live? → In <strong>cells</strong> attached to the inner function: <code>make_tax(0.05)</code> and <code>make_tax(0.10)</code> remember 0.05 and 0.1 (₹236.25 vs ₹247.5). To <em>change</em> one, <code>nonlocal</code> (token counter 1, 2, 3). Trap: cells hold variables, not values (late binding). Now: can a closure hold a whole <em>function</em>?</span></li>
    <li><b>Decorator</b><span>Q: can one function wrap another? → <code>logged(func)</code> returns a <code>wrapper</code> closure that remembers <code>func</code> and calls it in the middle; <code>@logged</code> means <code>f = logged(f)</code>. But the wrapped function now calls itself "wrapper"…</span></li>
    <li><b>functools.wraps</b><span>Q: how do we keep the original's name, docstring and signature? → <code>@functools.wraps(func)</code> on the wrapper copies them and adds <code>__wrapped__</code>. Now a real <code>@timed</code>. But how do we pass options such as "retry 3 times"?</span></li>
    <li><b>Decorator with arguments</b><span>Q: how does <code>@retry(times=3)</code> work? → One more layer: <code>retry(times=3)</code> runs first and returns the decorator. Three layers: options → function → call. The flaky till succeeds on try 3. But with <code>@timed</code> on top too, which runs first?</span></li>
    <li><b>Stacking</b><span>Q: what order do several decorators apply and run in? → Bottom-up to apply, outside-in to run: timed-outside-retry measures 0.15 s for all three tries; retry-outside-timed prints three 0.05 s timings. What else are decorators used for?</span></li>
    <li><b>Real-world decorators</b><span>Q: what problems do they solve in practice? → Caching (<code>lru_cache</code>: 100 price lookups, 3 real calls), registration (a command table), permission checks (Ravi is not a manager), class-based decorators with state, and decorators on classes (<code>@dataclass</code>) and methods (<code>@property</code>). And the price?</span></li>
    <li><b>Traps</b><span>Q: what goes wrong? → Missing <code>return</code>s (→ <code>None</code>), calling instead of passing, missing <code>nonlocal</code>, late binding, missing <code>wraps</code>, forgotten brackets on <code>@retry()</code>, caching impure functions or unhashable arguments.</span></li>
  </ol>

  <h2 id="pd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Closures &amp; Decorators</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Functions are objects</div>
        <ul>
          <li><code>with_gst</code> = the function; <code>with_gst(225)</code> = run it (236.25)</li>
          <li>Store, pass, return, put in a dict</li>
          <li><b>Higher-order function</b>: takes or returns a function (<code>sorted(key=)</code>, <code>map</code>)</li>
          <li>⚠ <code>f(x)</code> passes the result, <code>f</code> passes the function</li>
          <li>💡 a recipe card vs the dish</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Closures</div>
        <ul>
          <li>Inner function + the outer variables it uses, kept alive after outer returns</li>
          <li>Stored in <b>cells</b>: <code>__closure__</code>, names in <code>__code__.co_freevars</code></li>
          <li>Scope lookup <b>LEGB</b>: Local, Enclosing, Global, Builtins</li>
          <li><b>nonlocal</b> to reassign (token counter); mutating needs nothing</li>
          <li>⚠ Late binding: 3 buttons all "cold coffee"; fix <code>item=item</code></li>
          <li>💡 a tiffin packed at home, eaten at the office</li>
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
          <li>💡 a security guard at a door</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Options &amp; stacking</div>
        <ul>
          <li><code>@retry(times=3)</code>: factory(options) → decorator(func) → wrapper(args)</li>
          <li>Must write brackets: <code>@retry()</code></li>
          <li><code>@a @b def f</code> ≡ <code>f = a(b(f))</code>: apply bottom-up, run outside-in</li>
          <li>timed over retry: 0.15 s total; retry over timed: 3 × 0.05 s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Real uses</div>
        <ul>
          <li><b>timed</b> (perf_counter in try/finally), <b>retry</b> with backoff</li>
          <li><b>lru_cache</b>: 100 lookups → 3 calls; fib(30) 0.1 s → 0.00003 s</li>
          <li><b>Registration</b>: <code>@command("revenue")</code>, Flask <code>@app.route</code></li>
          <li><b>Auth</b>: <code>@require_role("manager")</code></li>
          <li>Class decorator with <code>__call__</code>; <code>@dataclass</code>, <code>@property</code></li>
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
      <div class="rm-item rm-done" data-target="pd-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Problem</span><span class="rm-sub">The same extra code everywhere</span></div></div>
      <div class="rm-item rm-done" data-target="pd-func"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Functions Are Objects</span><span class="rm-sub">Store, pass, return them</span></div></div>
      <div class="rm-item rm-done" data-target="pd-clos"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Closures</span><span class="rm-sub">Cells, nonlocal, late binding</span></div></div>
      <div class="rm-item rm-done" data-target="pd-deco"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Decorators by Hand, Then @</span><span class="rm-sub">f = deco(f)</span></div></div>
      <div class="rm-item rm-done" data-target="pd-wraps"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">functools.wraps &amp; @timed</span><span class="rm-sub">Keep the original's identity</span></div></div>
      <div class="rm-item rm-done" data-target="pd-args"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Decorators With Arguments</span><span class="rm-sub">Three layers, traced</span></div></div>
      <div class="rm-item rm-done" data-target="pd-stack"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Stacking Decorators</span><span class="rm-sub">Apply bottom-up, run outside-in</span></div></div>
      <div class="rm-item rm-done" data-target="pd-real"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Real-World Decorators</span><span class="rm-sub">Cache, register, auth, classes</span></div></div>
      <div class="rm-item rm-done" data-target="pd-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pd-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Lost returns, names, brackets</span></div></div>
      <div class="rm-item rm-done" data-target="pd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="pd-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pd-why"><span class="num">01</span>The Problem: The Same Extra Code Everywhere</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Chai Corner's owner wants to know how long each report function takes. We have several such functions. How do we add timing to all of them without editing the inside of each one?</p>
  </div>
  <p>First the running example. The log is the same six-line file as in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>; <code>read_orders</code> is the generator built there (it streams the file and skips the comment and the junk line).</p>
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
  <p>Four orders: 60 + 45 + 90 + 30 = <strong>₹225</strong>, and 2 + 3 + 1 + 1 = <strong>7 items</strong>. Now the timing request, done the obvious way:</p>
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
  <p>It works, but look at what happened. Each function's one real line (the <code>sum</code>) is now buried under three lines of timing that are identical apart from the name. With twenty report functions that is sixty pasted lines. Next week the owner asks for logging too: paste again. When the timing format changes, you edit twenty places, and you will miss one.</p>
  <p>What we want: write the timing code <strong>once</strong>, then say "apply it to this function" with one short line, without touching the function's own code. That is a <strong>decorator</strong>. To build one we need three things the rest of this note supplies: functions you can pass around (02), inner functions that remember things (03), and a wrapper that calls the original in the middle (04).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A security guard at an office door. The room inside (your function) is unchanged. But everyone who goes in now passes the guard first, who checks the ID and writes in the register, and notes when they leave. You can put the same kind of guard on twenty doors without rebuilding any room.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>cross-cutting concern</strong> is behaviour needed by many unrelated functions (timing, logging, retries, caching, permission checks) that is not part of any one function's job. Decorators exist to write a cross-cutting concern once and attach it anywhere.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Just call a helper at the top of each function" (<code>start_timer()</code> … <code>stop_timer()</code>) still edits every function, and forgets to stop the timer when the function raises an error in the middle. The extra code has to sit <em>around</em> the call, not inside the body.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Functions Are Objects.</b> To put code around a function, some other piece of code must be able to receive the function itself, hold it, and call it later. Can a function be handed around like a number or a list?</div>

  <h2 id="pd-func"><span class="num">02</span>Functions Are Objects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have only ever <em>called</em> functions: <code>with_gst(225)</code>. Can we instead give a function to another function, keep it in a variable, or get one back as a result?</p>
  </div>
  <p>In Python a function is an ordinary value, like a number or a list. The name <code>with_gst</code> without brackets is the function itself, an object sitting in memory. The brackets are what make the difference: <code>with_gst</code> means "the function"; <code>with_gst(225)</code> means "run it now and give me its result".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A recipe card versus the dish. <code>with_gst</code> is the recipe card: you can photocopy it, hand it to a friend, or post it to someone. <code>with_gst(225)</code> is cooking the dish from the card. Handing someone the card does not cook anything.</p></div>
  <p>The code shows the four things you can do with a function value, on our orders (GST at 5%).</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Closures.</b> <code>pick_tax</code> returned an inner function that used nothing from outside. But a useful factory, say "make me a tax function for rate r", must return an inner function that uses <code>r</code>, a variable of the outer function, which has already finished. Where does that variable live?</div>

  <h2 id="pd-clos"><span class="num">03</span>Closures</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Chai Corner needs "add 5% GST" and "add 10% service charge" functions, maybe more later. Writing one <code>def</code> per rate is repetitive; we want a function that <em>makes</em> rate functions. But once the maker returns, its local variables are normally thrown away. How does the made function still know its rate?</p>
  </div>
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
  <h3>A tax-function factory</h3>
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
  <h3>Changing a remembered variable: nonlocal</h3>
  <p>Chai Corner hands out token numbers. Each counter must remember its last number and <em>change</em> it on every call.</p>
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
  <h3>The late-binding trap</h3>
  <p>A cell holds the <em>variable</em>, not its value at the moment the function was made. The value is read when the function is <em>called</em>. A till screen that builds one button per menu item in a loop:</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Decorators.</b> A closure can remember a number (a rate) or a counter. Could it remember a whole <em>function</em>, say <code>total_revenue</code>, and call it in the middle of some extra code? That is exactly the "code around a function" we wanted in section 01.</div>

  <h2 id="pd-deco"><span class="num">04</span>Decorators by Hand, Then With @</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can pass a function in (02) and return an inner function that remembers outer variables (03). Can we combine the two so that the returned function does extra work and calls the original, and then put it in place of the original?</p>
  </div>
  <h3>Step 1: build it by hand, no @ yet</h3>
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
  <h3>Step 2: the @ line is the same thing</h3>
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
  <h3>When does each part run?</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: functools.wraps.</b> Look again at section 04's first output: after wrapping, <code>total_revenue.__name__</code> printed <code>wrapper</code>. The function has lost its name, and with it its docstring and signature. Logs, <code>help()</code> and frameworks will all see "wrapper". How do we keep the original's identity?</div>

  <h2 id="pd-wraps"><span class="num">05</span>functools.wraps &amp; a Real @timed</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The name <code>total_revenue</code> now points at a function called <code>wrapper</code> with signature <code>(*args, **kwargs)</code> and no docstring. How do we make the wrapper look like the original from outside?</p>
  </div>
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
  <h3>The timer decorator Chai Corner asked for</h3>
  <p>Now section 01's request, written once. The timing goes in <code>try/finally</code> so it is reported even if the function raises an error.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Decorators With Arguments.</b> <code>@timed</code> has no options. A retry decorator needs some: how many tries, which errors, how long to wait. Where do options go when a decorator receives only one thing, the function?</div>

  <h2 id="pd-args"><span class="num">06</span>Decorators With Arguments</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The till sends its log over flaky Wi-Fi; the fetch fails now and then. We want <code>@retry(times=3, exceptions=(ConnectionError,))</code>. A decorator is called with just the function. So who receives <code>times=3</code>?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Stacking.</b> We want both: retry the flaky fetch <em>and</em> time it. Two decorator lines on one function. Which wraps which, and does the order change what we measure?</div>

  <h2 id="pd-stack"><span class="num">07</span>Stacking Decorators</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With <code>@timed</code> and <code>@retry(…)</code> both above <code>fetch</code>, does <code>timed</code> measure the whole three-try fetch, or each try? What decides?</p>
  </div>
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
  <h3>Order changes the meaning: timed and retry</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Real-World Decorators.</b> We have the full mechanism. What do decorators actually do in production code, and are there decorators that don't wrap at all?</div>

  <h2 id="pd-real"><span class="num">08</span>Real-World Decorators</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Timing and retrying are two uses. What other repeated jobs fit the "write once, attach with @" pattern, and can a decorator keep state, register a function, or be applied to a class?</p>
  </div>
  <h3>Caching: functools.lru_cache</h3>
  <p>The till asks the menu server for an item's price on every order. The server is slow (0.05 s) and prices do not change during the day. <strong>Memoisation</strong> means remembering results: compute <code>menu_price("samosa")</code> once, then just look it up. <code>functools.lru_cache</code> is a decorator whose wrapper keeps a dict from arguments to results: a closure again.</p>
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
  <p><code>command("revenue")</code> returned <code>register</code>, which stored the function in <code>COMMANDS</code> and gave it back untouched. The till can now dispatch typed commands by name: ₹225 and 7 items.</p>
  <h3>Permission checks</h3>
  <p>Only a manager may give refunds. Rather than an <code>if</code> at the top of every sensitive function, the rule goes in one decorator:</p>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have used functions-as-objects, closures, wrappers, factories and stacking. How exactly is each built from the one before?</div>

  <h2 id="pd-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Are first-class functions, closures and decorators three topics, or three floors of one building?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 290" width="680">
    <defs><marker id="pd-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="10" width="200" height="44" rx="6" class="fb sb"/><text x="120" y="29" text-anchor="middle" font-size="12">functions are objects</text><text x="120" y="45" text-anchor="middle" class="tm" font-size="10">store · pass · return</text>
    <rect x="240" y="10" width="200" height="44" rx="6" class="fb sb"/><text x="340" y="29" text-anchor="middle" font-size="12">nested functions + LEGB</text><text x="340" y="45" text-anchor="middle" class="tm" font-size="10">inner reads outer names</text>
    <line x1="120" y1="54" x2="220" y2="96" stroke="currentColor" marker-end="url(#pd-a9)"/>
    <line x1="340" y1="54" x2="250" y2="96" stroke="currentColor" marker-end="url(#pd-a9)"/>
    <rect x="130" y="98" width="220" height="44" rx="6" class="ft st"/><text x="240" y="117" text-anchor="middle" font-size="12">closure (cells, nonlocal)</text><text x="240" y="133" text-anchor="middle" class="tm" font-size="10">make_tax(0.05) remembers 0.05</text>
    <line x1="240" y1="142" x2="240" y2="182" stroke="currentColor" marker-end="url(#pd-a9)"/>
    <rect x="120" y="184" width="240" height="44" rx="6" class="fg sg"/><text x="240" y="203" text-anchor="middle" font-size="12">decorator: wrapper closure holds func</text><text x="240" y="219" text-anchor="middle" class="tm" font-size="10">@d ≡ f = d(f) · wraps keeps identity</text>
    <line x1="360" y1="206" x2="420" y2="206" stroke="currentColor" marker-end="url(#pd-a9)"/>
    <rect x="424" y="160" width="240" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="544" y="178" text-anchor="middle" font-size="12">factory: @retry(times=3)</text><text x="544" y="193" text-anchor="middle" class="tm" font-size="10">one more closure layer for options</text>
    <rect x="424" y="210" width="240" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="544" y="228" text-anchor="middle" font-size="12">stacking: a(b(f))</text><text x="544" y="243" text-anchor="middle" class="tm" font-size="10">apply bottom-up · run outside-in</text>
    <line x1="240" y1="228" x2="240" y2="256" stroke="currentColor" marker-end="url(#pd-a9)"/>
    <text x="240" y="276" text-anchor="middle" class="tm" font-size="11">timed · retry · lru_cache · register · require_role · @contextmanager</text>
  </svg><figcaption>Two plain facts (functions are values; inner functions can read outer names) combine into closures. A closure that holds a function and calls it in the middle is a decorator. Options add one more closure layer; stacking composes decorators. Every practical decorator is one of these shapes.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same Chai Corner log</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>When to use</th></tr>
    <tr><td>First-class functions</td><td>functions are objects</td><td>can I hand a function to other code?</td><td><code>apply_to_orders(with_gst, …)</code> → 63.0, 47.25, 94.5, 31.5</td><td>callbacks, <code>key=</code>, dispatch tables</td></tr>
    <tr><td>LEGB scope</td><td>nested functions</td><td>where is a name looked up?</td><td>inner sees 0.05 (enclosing), not 0.18 (global)</td><td>reading any nested code</td></tr>
    <tr><td>Closure</td><td>returned inner function + cells</td><td>how does a made function keep its settings?</td><td><code>make_tax</code>: 236.25 vs 247.5</td><td>factories, callbacks with settings</td></tr>
    <tr><td><code>nonlocal</code></td><td>closure + assignment</td><td>how do I change a remembered variable?</td><td>tokens 1, 2, 3, (500), 4</td><td>counters, accumulators</td></tr>
    <tr><td>Decorator</td><td>closure holding <code>func</code></td><td>how do I add behaviour around many functions?</td><td><code>@logged</code>: 225, 7</td><td>any cross-cutting concern</td></tr>
    <tr><td><code>functools.wraps</code></td><td>decorator applied to the wrapper</td><td>how do I keep the original's identity?</td><td>name <code>revenue_b</code>, signature <code>(path: str) -&gt; int</code></td><td>every wrapper you write</td></tr>
    <tr><td>Decorator factory</td><td>closure returning a decorator</td><td>how do I pass options?</td><td><code>@retry(times=3)</code>: succeeds on try 3</td><td>configurable behaviour</td></tr>
    <tr><td>Stacking</td><td>composition <code>a(b(f))</code></td><td>which runs first?</td><td>timed outside: 0.15 s; inside: 3 × 0.05 s</td><td>combining concerns</td></tr>
    <tr><td><code>lru_cache</code>, registry, auth, class decorators</td><td>the patterns above</td><td>what is this used for?</td><td>3 real calls for 100 lookups; refund denied for Ravi</td><td>pure slow functions; plugins; access rules</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>because functions are objects, an inner function can be returned and keep the outer variables it uses (a closure); when one of those variables is another function, the inner function can run extra code around it, and <code>@d</code> is just shorthand for replacing <code>f</code> with that wrapper: <code>f = d(f)</code>.</strong> Compare the generator from <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>: a generator keeps its variables in a paused frame, a closure keeps them in cells; both are "functions with memory".</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The mechanism is small, so the bugs are few and repeat everywhere. Here they are in one place.</div>

  <h2 id="pd-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which slips with closures and decorators turn up again and again, and how does each show itself?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: calling instead of passing</span>
    <p><code>apply_to_orders(with_gst(10), …)</code>, <code>Thread(target=work())</code>, <code>sorted(xs, key=len())</code>: the brackets run the function now and pass its result (<code>'float' object is not callable</code>). Pass the name: <code>target=work</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reassigning an outer variable without nonlocal</span>
    <p><code>n += 1</code> inside the inner function → <code>UnboundLocalError</code>. Add <code>nonlocal n</code>. (Mutating, like <code>book.append(x)</code>, does not need it.)</p>
  </div>
  <div class="callout trap"><span class="label">Trap: late binding in loops</span>
    <p>Three menu buttons all said "order cold coffee". Freeze the value: <code>lambda item=item: …</code> or <code>functools.partial</code>.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Context Managers.</b> <code>@timed</code> wraps a whole <em>function call</em>. But often the thing to wrap is a few lines in the middle of a function ("time just this block", "keep this file open just for these lines and close it even on error"). That needs the <code>with</code> statement, and <code>@contextmanager</code>, a decorator that turns a generator into one. Read <a class="xref" data-note="py_context">Context Managers</a>.</div>

  <h2 id="pd-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Chai Corner's Monday log, four valid orders: chai 2 × 30 = 60, samosa 3 × 15 = 45, cold coffee 1 × 90 = 90, chai 1 × 30 = 30. Total ₹225, 7 items.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our log</th><th>Weakness → next</th></tr>
    <tr><td>The problem</td><td>add timing to many functions?</td><td>3 pasted lines per function</td><td>need to hand functions around</td></tr>
    <tr><td>Functions are objects</td><td>pass/store/return a function?</td><td><code>with_gst</code>: 63.0, 47.25, 94.5, 31.5</td><td>returned inner function needs outer vars</td></tr>
    <tr><td>Closure</td><td>where do outer vars live?</td><td>cells: 0.05 → 236.25, 0.1 → 247.5</td><td>can it hold a function?</td></tr>
    <tr><td>nonlocal</td><td>change a remembered var?</td><td>tokens 1, 2, 3</td><td>—</td></tr>
    <tr><td>Decorator</td><td>code around a function?</td><td><code>@logged</code>: 225</td><td>name becomes "wrapper"</td></tr>
    <tr><td>wraps</td><td>keep identity?</td><td><code>(path: str) -&gt; int</code> kept</td><td>no options yet</td></tr>
    <tr><td>Factory</td><td>pass options?</td><td><code>@retry(times=3)</code>: OK on try 3</td><td>combining two?</td></tr>
    <tr><td>Stacking</td><td>order of several?</td><td>0.15 s vs 3 × 0.05 s</td><td>what are they used for?</td></tr>
    <tr><td>Real uses</td><td>cache, register, auth, classes</td><td>100 lookups → 3 calls</td><td>traps</td></tr>
  </table>
  <h3>Definitions and "formulas"</h3>
  <table class="tbl">
    <tr><th>Written</th><th>Means exactly</th><th>Notes</th></tr>
    <tr><td><code>f</code> vs <code>f()</code></td><td>the function object vs calling it</td><td>pass <code>f</code>, not <code>f()</code></td></tr>
    <tr><td>LEGB</td><td>Local → Enclosing → Global → Builtins</td><td>order of name lookup</td></tr>
    <tr><td>Closure</td><td>function + cells for its free variables</td><td><code>f.__closure__[i].cell_contents</code>, <code>f.__code__.co_freevars</code></td></tr>
    <tr><td><code>nonlocal x</code></td><td>assignments to <code>x</code> change the enclosing <code>x</code></td><td>not needed to read or mutate</td></tr>
    <tr><td><code>@d</code> <code>def f</code></td><td><code>f = d(f)</code></td><td><code>d</code> runs once, at def time</td></tr>
    <tr><td><code>@d(opts)</code> <code>def f</code></td><td><code>f = d(opts)(f)</code></td><td>three layers: options → func → call</td></tr>
    <tr><td><code>@a</code> <code>@b</code> <code>def f</code></td><td><code>f = a(b(f))</code></td><td>applied bottom-up, run outside-in</td></tr>
    <tr><td>Wrapper template</td><td><code>@wraps(func)</code> <code>def wrapper(*args, **kwargs):</code> before; <code>result = func(*args, **kwargs)</code>; after; <code>return result</code></td><td>and the decorator ends with <code>return wrapper</code></td></tr>
    <tr><td><code>functools.wraps(func)</code></td><td>copy name, qualname, doc, module, annotations, dict; set <code>__wrapped__</code></td><td>signature then follows <code>__wrapped__</code></td></tr>
    <tr><td><code>lru_cache(maxsize)</code></td><td>dict from args to result inside the wrapper</td><td>hashable args, pure functions</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a closure</b><p>A small function that needs a setting or a little private state (tax rate, counter).</p><small>bigger state → a class</small></div>
    <div><b>Use a decorator</b><p>The same before/after behaviour on many functions: timing, logging, retry, caching, auth, registration.</p><small>always <code>@functools.wraps</code></small></div>
    <div><b>Use a factory</b><p>The behaviour needs options (<code>times</code>, <code>role</code>, <code>maxsize</code>).</p><small>remember the brackets</small></div>
    <div><b>Don't use a decorator</b><p>For logic used once, or when the extra code needs to sit in the middle of the body rather than around it.</p><small>wrap a block → context manager</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Calling instead of passing; <code>nonlocal</code> missing; late binding in loops; wrapper without <code>return</code>; decorator without <code>return wrapper</code>; no <code>wraps</code>; <code>@retry</code> without brackets; per-call work placed in the decorator body; wrong stacking order; caching impure functions or unhashable args.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>@a</code> <code>@b</code> <code>def f</code> as one assignment?</td><td><code>f = a(b(f))</code></td></tr>
    <tr><td><code>[lambda: i for i in range(3)]</code>, each called?</td><td><code>2, 2, 2</code> (late binding)</td></tr>
    <tr><td>Decorated function prints its <code>__name__</code> as "wrapper". Fix?</td><td><code>@functools.wraps(func)</code> on the wrapper</td></tr>
    <tr><td>How many times does a decorator's own body run for 1000 calls?</td><td>Once, at definition; the wrapper runs 1000 times</td></tr>
    <tr><td><code>make_tax(0.10)(225)</code>?</td><td>247.5</td></tr>
  </table>

  <h2 id="pd-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@deco</code> above <code>def f</code> do, exactly?</summary><div class="qa-body">After the function is defined, Python runs <code>f = deco(f)</code>. The name <code>f</code> now points at whatever <code>deco</code> returned, usually a wrapper that holds the original in its closure. The decorator runs once at definition time; the wrapper runs on every call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a closure, and where are its variables stored?</summary><div class="qa-body">A function plus the variables of its enclosing function that it uses, kept alive after the enclosing function returns. They are stored in cell objects in <code>func.__closure__</code>; their names are in <code>func.__code__.co_freevars</code>. <code>make_tax(0.05)</code> returns a function whose cell holds 0.05.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need <code>nonlocal</code>?</summary><div class="qa-body">When an inner function <em>reassigns</em> a variable of the enclosing function (<code>n += 1</code>, <code>n = 5</code>). Without it Python treats <code>n</code> as a new local and raises <code>UnboundLocalError</code>. Reading, or mutating an object (<code>lst.append</code>), needs nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a decorator that logs a function's name and arguments.</summary><div class="qa-body"><div class="fx" data-lang="py">def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__} args={args} kwargs={kwargs}")
        return func(*args, **kwargs)
    return wrapper</div>On <code>bill("cold coffee", tip=10)</code> this prints <code>calling bill args=('cold coffee',) kwargs={'tip': 10}</code> and returns 100 (section 04 ran the same shape).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks without <code>functools.wraps</code>?</summary><div class="qa-body"><code>__name__</code> becomes "wrapper", <code>__doc__</code> is lost, the signature shows <code>(*args, **kwargs)</code>. Logs and tracebacks are confusing, <code>help()</code> is useless, frameworks that inspect signatures or names (FastAPI, pytest, Flask endpoints) misbehave, and there is no <code>__wrapped__</code> to reach the original in tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a decorator with arguments need three nested functions?</summary><div class="qa-body"><code>@retry(times=3)</code> first <em>calls</em> <code>retry(times=3)</code>; that call must return the real decorator, which takes <code>func</code> and returns the wrapper. Factory (options) → decorator (function) → wrapper (call arguments). Each inner layer is a closure over the outer layers' variables.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order do stacked decorators apply and run?</summary><div class="qa-body"><code>@a @b def f</code> means <code>f = a(b(f))</code>: <code>b</code> wraps first (bottom-up), but at call time <code>a</code>'s wrapper runs first (outside-in). <code>@timed</code> above <code>@retry</code> timed all three tries together (≈ 0.15 s); swapped, it timed each try (≈ 0.05 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why can't you write a decorator without closures?</summary><div class="qa-body">The wrapper is called later, long after the decorator has returned, yet it must still know which original function to call (and, for factories, the options). Those values live in the wrapper's closure cells. Without closures you would need a class with <code>__call__</code> storing <code>func</code> as an attribute, which is the class-based decorator, the same idea in different clothes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if functions were not first-class objects?</summary><div class="qa-body">You could not pass <code>total_revenue</code> into <code>logged</code>, nor return <code>wrapper</code> from it, nor rebind the name <code>total_revenue</code> to the wrapper. The whole <code>f = d(f)</code> step needs a function to be a value that can be passed, returned and assigned.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is a closure like a generator, and how is it different?</summary><div class="qa-body">Both are functions that keep variables between calls. A generator keeps its whole paused frame (locals + current line) and resumes mid-body; a closure keeps only the outer variables it uses, in cells, and each call runs its body from the top. Generators produce sequences; closures produce configured functions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: when would you use a context manager instead of a decorator?</summary><div class="qa-body">When the thing to wrap is a block of lines inside a function rather than a whole function call, or when you need a value inside the block (<code>with open(p) as f</code>). <code>@contextmanager</code> objects can even be used both ways: as <code>with timer():</code> around a block and as <code>@timer()</code> around a function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is <code>lru_cache</code> a bad idea?</summary><div class="qa-body">Impure functions (depend on time, DB, randomness: results go stale), unhashable arguments (lists, dicts, DataFrames → TypeError), unbounded <code>maxsize=None</code> with many distinct inputs (memory grows), and instance methods (the cache keeps <code>self</code> alive).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a "registration" decorator return, and why?</summary><div class="qa-body">The original function, unchanged, after recording it in a table (<code>COMMANDS[name] = func</code>). It only needs the side effect at definition time; there is no per-call behaviour to add, so no wrapper. Flask's <code>@app.route</code> and pytest fixtures work this way.</div></details>
</main>
`
});
