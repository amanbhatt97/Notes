// notes/python/py_decorators.js — Closures & Decorators
Object.assign(TOPIC_CONTENT, {
  "py_decorators": `<main>
<h1>Closures &amp; Decorators</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions</span><span>Closures &amp; Decorators</span></div>
  <p class="lead">A <strong>decorator</strong> is a function that takes another function and returns an improved version of it, usually by wrapping it in extra code that runs before and after the original. The <code>@name</code> line you see above many function definitions is how decorators are applied. They exist because some behaviour, such as timing, logging, retrying, caching and permission checks, is needed by many unrelated functions, and pasting it into every one of them buries the real logic and spreads copies that drift out of sync. You meet decorators constantly in real Python: <code>@app.get</code> in FastAPI, <code>@pytest.fixture</code>, <code>@functools.lru_cache</code>, <code>@torch.no_grad()</code>, <code>@dataclass</code> and <code>@property</code>. To understand how they work we first need <strong>closures</strong>, inner functions that remember variables from the function that created them. Throughout this page we will use one small example: a tea stall called Chai Corner, its till log of orders, and a handful of report functions that read it. We will start by adding timing to those reports the clumsy way, and then build up, step by step, to the decorators that fix it.</p>

  <h2 id="pd-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Closures &amp; Decorators</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Closures</div>
        <ul>
          <li>Inner function + the outer variables it uses, kept alive after the outer function returns</li>
          <li>Name lookup <b>LEGB</b>: Local, Enclosing, Global, Builtins</li>
          <li><code>nonlocal</code> to reassign an outer variable</li>
          <li>Late binding: values read at call time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Decorators</div>
        <ul>
          <li><code>@d</code> above <code>def f</code> means <code>f = d(f)</code></li>
          <li>Decorator runs once at definition; wrapper runs on every call</li>
          <li>Wrapper: <code>*args, **kwargs</code> in, <code>return func(*args, **kwargs)</code></li>
          <li><code>functools.wraps</code> keeps the original's name and signature</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Options and stacking</div>
        <ul>
          <li><code>@retry(times=3)</code>: options → decorator → wrapper</li>
          <li><code>@a @b def f</code> means <code>f = a(b(f))</code></li>
          <li>Applied bottom-up, run outside-in; order changes behaviour</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li>Timing, logging, retry, <code>lru_cache</code></li>
          <li>Registration: record and return unchanged</li>
          <li>Guards: permission checks</li>
          <li>Class with <code>__call__</code>; decorators on classes (<code>@dataclass</code>)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Decorators Exist</span><span class="rm-sub">the same code pasted into many functions</span></div></div>
      <div class="rm-item rm-done" data-target="pd-func"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Functions as Values</span><span class="rm-sub">storing, passing and returning functions</span></div></div>
      <div class="rm-item rm-done" data-target="pd-clos"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Closures</span><span class="rm-sub">scope, remembered variables, nonlocal, late binding</span></div></div>
      <div class="rm-item rm-done" data-target="pd-deco"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Writing a Decorator</span><span class="rm-sub">wrapping by hand, then with @</span></div></div>
      <div class="rm-item rm-done" data-target="pd-wraps"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">functools.wraps</span><span class="rm-sub">keeping the function's identity; a timer</span></div></div>
      <div class="rm-item rm-done" data-target="pd-args"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Decorators with Arguments</span><span class="rm-sub">three layers; a retry decorator</span></div></div>
      <div class="rm-item rm-done" data-target="pd-stack"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Stacking Decorators</span><span class="rm-sub">order of application and of running</span></div></div>
      <div class="rm-item rm-done" data-target="pd-real"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Decorator Patterns</span><span class="rm-sub">caching, registration, guards, classes</span></div></div>
      <div class="rm-item rm-done" data-target="pd-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">lost return values, brackets, timing</span></div></div>
      <div class="rm-item rm-done" data-target="pd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">LEGB, templates, factories, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pd-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">closures, wraps, factories, stacking</span></div></div>
    </div>
  </div>

  <h2 id="pd-why"><span class="num">01</span>Why Decorators Exist</h2>
  <p>Chai Corner's till writes every order to a log file. Each line has a time, an item, a quantity and a price; there is also a comment line and a junk line the till wrote when it restarted. To read it we use the <code>read_orders</code> generator from <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, which hands out one order at a time and skips the two bad lines:</p>
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
  <p>There are four orders: 60 + 45 + 90 + 30 = ₹225 in total, and 2 + 3 + 1 + 1 = 7 items sold. Now the owner wants to know how long each report takes to run, because some of them will eventually run on months of data. The obvious way is to add timing code inside each report function:</p>
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
  <div class="fx" data-lang="text">total_revenue took 0.00014s
items_sold took 0.00004s
225 7</div>
  <p>It works, but look at what happened to the functions. Each one has a single line of real work, the <code>sum</code>, and it is now buried under three lines of timing code that are identical apart from the function's name. With twenty report functions that is sixty pasted lines. Next week someone wants logging as well, and we paste again. When the format of the timing message changes, we must edit twenty places, and we will miss one. There is also a hidden bug: if the <code>sum</code> raises an error, the timing line is skipped entirely.</p>
  <p>Behaviour like this, needed by many functions but not part of any one function's job, is called a <strong>cross-cutting concern</strong>. Timing, logging, retries, caching and permission checks are all examples. What we want is to write the timing code <em>once</em>, and then attach it to any function with a single short line, without touching the function's own code. That is exactly what a decorator does.</p>
  <p>Think of a security guard at the door of an office room. The room itself (your function) is unchanged. But everyone who goes in now passes the guard first, who checks their ID and writes the time in a register, and notes when they leave. You can post the same kind of guard on twenty doors without rebuilding a single room. A decorator posts a guard around a function.</p>
  <p>To build one we need three ideas, and the next sections take them one at a time: functions can be passed around as values; an inner function can remember variables from the function that made it (a closure); and a wrapper function can call the original function in the middle of its own code.</p>

  <h2 id="pd-func"><span class="num">02</span>Functions as Values</h2>
  <p>In Python a function is an ordinary value, like a number or a list. When you write the name <code>with_gst</code> without brackets, you are referring to the function itself, an object sitting in memory. Adding brackets is what runs it: <code>with_gst</code> means "the function", while <code>with_gst(225)</code> means "run it now and give me the result". A recipe card and a cooked dish are a good comparison. You can photocopy a recipe card, hand it to a friend or post it, and none of that cooks anything; cooking happens only when someone follows the card. The function name is the card, and the brackets are the cooking.</p>
  <p>Because a function is a value, you can do three things with it that matter for decorators: store it under another name, pass it into another function, and return it from a function. Here is each one, using a function that adds 5% GST:</p>
  <div class="fx" data-lang="py">def with_gst(amount):
    return round(amount * 1.05, 2)

f = with_gst                              # store it: no brackets, nothing runs
print(f(225), f is with_gst, f.__name__)

def apply_to_orders(func, path):          # pass it in
    return [func(o["qty"] * o["price"]) for o in read_orders(path)]
print(apply_to_orders(with_gst, "orders.log"))

def pick_tax(kind):                       # return it
    def no_tax(amount):
        return amount
    return with_gst if kind == "gst" else no_tax
print(pick_tax("gst")(100), pick_tax("none")(100), pick_tax("none").__name__)</div>
  <div class="fx" data-lang="text">236.25 True with_gst
[63.0, 47.25, 94.5, 31.5]
105.0 100 no_tax</div>
  <p><code>f = with_gst</code> did not call anything. It gave the same function a second name, so <code>f is with_gst</code> is <code>True</code>, <code>f(225)</code> gives 236.25, and the function still reports its own name, <code>with_gst</code>. <code>apply_to_orders</code> receives a function as its parameter <code>func</code> and calls it once per order, turning 60, 45, 90 and 30 into 63.0, 47.25, 94.5 and 31.5. <code>pick_tax</code> <em>returns</em> a function, and <code>pick_tax("gst")(100)</code> calls the returned function straight away, giving 105.0. A function that takes or returns another function is called a <strong>higher-order function</strong>, and a decorator is simply a higher-order function that does both: it takes a function and returns a function. (This idea is covered from another angle in <a class="xref" data-note="py_advanced">Functional Programming Tools</a>.)</p>

  <h2 id="pd-clos"><span class="num">03</span>Closures</h2>
  <p>Look again at <code>pick_tax</code>: it defined a function, <code>no_tax</code>, inside itself. Inner functions like this are the second ingredient of decorators, and they raise a question. Normally, when a function finishes, its local variables disappear. What happens if an inner function uses one of those variables, and the inner function is still around after the outer function has finished? To answer that, we first need to know how Python finds a variable by name.</p>
  <p>When a function reads a name, Python searches four places in a fixed order, remembered as <strong>LEGB</strong>: <strong>L</strong>ocal (the function's own variables), <strong>E</strong>nclosing (the variables of any outer function it is defined inside), <strong>G</strong>lobal (variables at the top level of the module) and <strong>B</strong>uiltins (Python's own names such as <code>len</code> and <code>print</code>). The first place that has the name wins.</p>
  <div class="fx" data-lang="py">rate = 0.18                               # Global
def outer():
    rate = 0.05                           # Enclosing (for inner)
    def inner():
        return rate                       # not Local, so Enclosing: 0.05
    return inner()
print(outer(), rate, len("abc"))          # len comes from Builtins</div>
  <div class="fx" data-lang="text">0.05 0.18 3</div>
  <p><code>inner</code> has no local variable called <code>rate</code>, so Python looked in the enclosing function, <code>outer</code>, and found 0.05 there, before ever reaching the global 0.18. <code>len</code> exists in none of the first three places, so it was found among the builtins. The "E" level is the one that matters for closures.</p>
  <p>Now the interesting case. Suppose we want a <em>function factory</em>: a function that builds tax functions for any rate we ask for.</p>
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
  <p><code>make_tax(0.05)</code> runs, defines <code>add_tax</code>, returns it, and finishes. By the normal rules its local variable <code>rate</code> should now be gone. Yet <code>with_gst(225)</code> still uses a rate of 0.05 and gives 236.25, while <code>with_service</code>, made by a separate call with 0.10, gives 247.5. Python noticed, when it compiled <code>add_tax</code>, that the inner function uses the outer variable <code>rate</code>, and so it kept that variable alive and attached it to the inner function. A function bundled together with the outer variables it uses is called a <strong>closure</strong>. The outer variables it uses are called its <strong>free variables</strong>.</p>
  <p>Think of a tiffin box packed at home in the morning. Your mother (the outer function) packs dal and rice (the variables) and then goes about her day. At one o'clock at the office, long after she has "returned", you open the tiffin and the food is still there. The inner function leaves home carrying exactly the variables it needs.</p>
  <p>The last three lines of output show where Python keeps them. <code>__code__.co_freevars</code> lists the names of the free variables, here <code>('rate',)</code>. <code>__closure__</code> holds one small storage box, called a <strong>cell</strong>, per free variable, and <code>cell_contents</code> shows what is inside: 0.05 for one function and 0.1 for the other. The two functions are different objects (<code>False</code>) but share the same compiled code (<code>True</code>); only their cells differ. Each call to <code>make_tax</code> creates a new cell, which is why the two closures are completely independent.</p>
  <p>Reading an outer variable needs no special syntax. Changing one is different. A token counter, for example, must remember its last number and increase it on every call:</p>
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
        book.append(item)                 # changing the list, not reassigning: no nonlocal
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
try:
    broken_counter()()
except UnboundLocalError as e:
    print("UnboundLocalError:", e)</div>
  <div class="fx" data-lang="text">1 2 3 500 4
1 2
UnboundLocalError: cannot access local variable 'n' where it is not associated with a value</div>
  <p><code>front</code> started at 0 and its calls gave 1, 2 and 3. <code>window</code> is a separate closure with its own <code>n</code>, starting at 499, so its first call gave 500; the next call to <code>front</code> then carried on at 4. The line <code>nonlocal n</code> is what makes this work. Without it, as <code>broken_counter</code> shows, the assignment <code>n += 1</code> makes Python treat <code>n</code> as a brand-new <em>local</em> variable of the inner function, and reading it before it has been given a value fails with <code>UnboundLocalError</code>. The rule is: reading an outer variable needs nothing; <em>reassigning</em> it needs <code>nonlocal</code> (or <code>global</code> for a module-level variable). Changing the contents of an outer object, as <code>book.append(item)</code> does, also needs nothing, because the name <code>book</code> itself is never reassigned.</p>
  <p>One more detail about closures causes a famous bug. A cell holds the <em>variable</em>, not a copy of its value at the moment the inner function was created; the value is looked up each time the function is <em>called</em>. This is called <strong>late binding</strong>. It bites when functions are created in a loop:</p>
  <div class="fx" data-lang="py">import functools
items = ["masala chai", "samosa", "cold coffee"]
buttons = [lambda: f"order {item}" for item in items]
print([b() for b in buttons])             # all see the LAST item

buttons = [lambda item=item: f"order {item}" for item in items]   # default arg: value frozen now
print([b() for b in buttons])

buttons = [functools.partial("order {}".format, item) for item in items]
print([b() for b in buttons])</div>
  <div class="fx" data-lang="text">['order cold coffee', 'order cold coffee', 'order cold coffee']
['order masala chai', 'order samosa', 'order cold coffee']
['order masala chai', 'order samosa', 'order cold coffee']</div>
  <p>All three button functions said "order cold coffee". They all refer to the same loop variable <code>item</code>, and by the time they are called the loop is over and <code>item</code> holds its last value. Two fixes freeze the value at creation time instead. A default argument, <code>lambda item=item: ...</code>, is evaluated when the lambda is created, so each lambda gets its own copy. <code>functools.partial</code> also stores the value immediately. "What does <code>[lambda: i for i in range(3)]</code> return when called?" (answer: 2, 2, 2) is a very common interview question.</p>

  <h2 id="pd-deco"><span class="num">04</span>Writing a Decorator</h2>
  <p>We now have everything we need. A decorator is a function that receives the original function, defines an inner <strong>wrapper</strong> function that does some extra work and calls the original in the middle, and returns that wrapper. Because the wrapper uses the original function, the original is kept in the wrapper's closure. Let us build one by hand first, without any special syntax: <code>logged</code> prints what is being called and what it returned.</p>
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
  <p>The key line is <code>total_revenue = logged(total_revenue)</code>. Read the right-hand side first: <code>logged</code> receives the original function as <code>func</code>, defines <code>wrapper</code>, and returns it. Then the left-hand side makes the name <code>total_revenue</code> point at that wrapper. The original function has not disappeared; it lives in the wrapper's closure cell, as the last line confirms (<code>True</code>). So when we call <code>total_revenue("orders.log")</code>, we are really calling <code>wrapper("orders.log")</code>. The wrapper receives the arguments, prints "calling total_revenue…" (it can use the original's name through <code>func.__name__</code>), calls the original with exactly the same arguments, gets 225 back, prints it, and returns it to us. The second line of output shows that the name now refers to a different function, whose name is <code>wrapper</code>; we will fix that in the next section.</p>
  <p>Writing <code>name = decorator(name)</code> after every function would be clumsy, so Python gives us a shortcut. Putting <code>@logged</code> on the line above <code>def items_sold</code> means exactly the same as writing <code>items_sold = logged(items_sold)</code> straight after the function. Nothing more and nothing less. (<code>logged</code> below is the same function as above.)</p>
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
  <p><code>items_sold</code> was wrapped by the <code>@logged</code> line and returned 7. The second function, <code>bill</code>, shows why the wrapper is written as <code>wrapper(*args, **kwargs)</code>. <code>*args</code> collects any positional arguments into a tuple and <code>**kwargs</code> collects any keyword arguments into a dictionary, and <code>func(*args, **kwargs)</code> passes them all on unchanged. That lets one decorator fit any function: here it fitted a function with one parameter and a function with a default value and a keyword-only argument (<code>args=('cold coffee',)</code>, <code>kwargs={'tip': 10}</code>, giving 90 + 10 = 100).</p>
  <p>It is important to understand that there are two separate moments in a decorator's life. The decorator function itself runs <strong>once</strong>, when Python reaches the <code>def</code>, which usually means when the module is imported. The wrapper runs on <strong>every call</strong>. This example prints at both moments:</p>
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
  <p>"decorating busiest_item" appeared once, before any call, as soon as the function had been defined. Each of the two calls then printed "before" and "after" around the real work. (Masala chai and samosa tie at three items each; <code>max</code> returns the first one it met.) This split explains how web frameworks work: Flask's <code>@app.route("/home")</code> does its main job at import time, recording your function in a table of URLs, and later each web request calls the function.</p>

  <h2 id="pd-wraps"><span class="num">05</span>functools.wraps</h2>
  <p>Our decorator has one unpleasant side effect, which we saw when <code>total_revenue.__name__</code> printed <code>wrapper</code>. After decoration, the name points at the wrapper, and the wrapper has its own name, no docstring and a signature of <code>(*args, **kwargs)</code>. Anything that inspects functions now sees "wrapper": log messages, error tracebacks, <code>help()</code>, and frameworks such as FastAPI, pytest and Click, which read a function's signature to decide what arguments to pass it.</p>
  <p>The standard fix is <strong><code>functools.wraps(func)</code></strong>, which is itself a decorator that you apply to the wrapper. It copies the original's name, qualified name, docstring, module, annotations and attribute dictionary onto the wrapper, and adds a <code>__wrapped__</code> attribute pointing back to the original. It is like a name badge: the guard at the door wears the badge of the room they guard, so visitors still know where they are.</p>
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
  <p>Both decorated functions work, but <code>revenue_a</code>, decorated without <code>wraps</code>, has lost its identity: name "wrapper", docstring <code>None</code>, signature <code>(*args, **kwargs)</code>. <code>revenue_b</code>, whose wrapper uses <code>@functools.wraps(func)</code>, reports its real name, docstring and signature <code>(path: str) -&gt; int</code> (<code>inspect.signature</code> follows <code>__wrapped__</code> to find it). <code>revenue_b.__wrapped__</code> reaches the undecorated function, which tests sometimes use to call the original without the extra behaviour. The rule is simple: always put <code>@functools.wraps(func)</code> on your wrapper.</p>
  <p>Now we can finally solve the problem from the first section properly. Here is the timing code written once, as a decorator. The timing line goes in a <code>finally</code> block, so the time is reported even if the function raises an error:</p>
  <div class="fx" data-lang="py">import functools, time

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:                          # report even if func raises
            print(f"[timed] {func.__name__} took {time.perf_counter() - t0:.2f}s")
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
  <div class="fx" data-lang="text">[timed] total_revenue took 0.00s
[timed] items_sold took 0.00s
225 7
[timed] total_revenue took 0.00s
[timed] slow_report took 0.20s
Rs 225</div>
  <p>Three report functions, one <code>@timed</code> line each, and the timing code exists in exactly one place. (The times are real measurements and will differ on your machine; the first two reports take well under a hundredth of a second.) <code>slow_report</code> calls <code>total_revenue</code> inside itself, so its call printed two timing lines: first the inner report's, then its own, about 0.2 seconds, mostly the pretend PDF formatting. Each wrapper reports only its own call. If the timing format ever changes, we edit one function.</p>

  <h2 id="pd-args"><span class="num">06</span>Decorators with Arguments</h2>
  <p>The till sends its log over unreliable Wi-Fi, so fetching it sometimes fails with a <code>ConnectionError</code> and succeeds if we simply try again. A <code>retry</code> decorator is the natural fix, but it needs options: how many times to try, which errors are worth retrying, and how long to wait between tries. We would like to write <code>@retry(times=3, exceptions=(ConnectionError,))</code>.</p>
  <p>Look closely at that line: there are brackets after <code>retry</code>. Python first <em>calls</em> <code>retry(times=3, ...)</code>, and whatever that call returns is then used as the decorator. So <code>retry</code> itself is not the decorator; it is a function that <em>makes</em> a decorator, often called a <strong>decorator factory</strong>. That gives three nested functions, each with one job: the factory takes the options and returns a decorator; the decorator takes the function and returns a wrapper; the wrapper takes the call's arguments and does the work. Each inner layer is a closure over the variables of the layers outside it. A tailor's shop works the same way: first you give your measurements (the options), the shop cuts a pattern for you (the decorator), and the pattern is used to stitch your cloth (the function) into a shirt (the wrapper).</p>
  <p>The code below prints a line from each layer so we can see when each one runs. <code>fetch_orders</code> fails twice and succeeds on the third try. After each failure the wrapper waits a little longer than before, doubling the delay each time; this is called <strong>exponential backoff</strong>, and it avoids hammering a struggling server.</p>
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

calls = 0

@retry(times=3, exceptions=(ConnectionError,), delay=0.01)
def fetch_orders(path):                   # the till sends its log over flaky Wi-Fi
    global calls
    calls += 1
    print(f"  layer 3: wrapper -&gt; fetch_orders try #{calls}")
    if calls &lt; 3:
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
  <p>Layers 1 and 2 printed before "now calling": both run at definition time, when the <code>@retry(...)</code> line is processed. <code>retry(...)</code> ran first and returned <code>decorator</code>; then <code>decorator(fetch_orders)</code> ran and returned <code>wrapper</code>, which now carries the name <code>fetch_orders</code>. Only layer 3, the wrapper, runs on each call. Inside it, attempt 1 raised a <code>ConnectionError</code>, which is in the list of errors to retry, and it was not the last attempt, so the wrapper printed a message, slept 0.01 seconds and looped. Attempt 2 failed the same way and slept 0.02 seconds. Attempt 3 succeeded, and its result, the four orders, was returned. Notice how many values the wrapper uses without receiving them as arguments: <code>times</code>, <code>exceptions</code> and <code>delay</code> come from the factory's closure, and <code>func</code> from the decorator's.</p>
  <p>Two more cases are worth seeing: an error that keeps happening, and the classic slip of forgetting the brackets. (From here on <code>retry</code> is the same decorator without the layer-printing lines.)</p>
  <div class="fx" data-lang="py">@retry(times=2)                           # retry from above (now without the layer prints)
def parse_price(text):
    return int(text)

try:
    parse_price("thirty")
except ValueError as e:
    print("gave up:", e)

@retry                                    # forgot the brackets
def oops():
    return 1

print(oops.__name__)                      # the name now holds retry's inner decorator!
try:
    oops()
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">  attempt 1 failed: invalid literal for int() with base 10: 'thirty'; retrying
gave up: invalid literal for int() with base 10: 'thirty'
decorator
TypeError: retry.&lt;locals&gt;.decorator() missing 1 required positional argument: 'func'</div>
  <p><code>parse_price("thirty")</code> failed on both of its two tries. On the last try, the bare <code>raise</code> re-raised the <em>original</em> <code>ValueError</code>, so the caller saw the real cause rather than some generic "retry failed" message. Retrying did not help, of course: a <code>ValueError</code> from bad input will fail the same way every time. Retry only <em>temporary</em> errors such as timeouts and dropped connections, and only operations that are safe to repeat; retrying a payment could charge the customer twice.</p>
  <p>The second part shows what happens with <code>@retry</code> and no brackets. Python called <code>retry(oops)</code>, so the function landed in the <code>times</code> parameter, and <code>retry</code> returned its inner <code>decorator</code>. The name <code>oops</code> now refers to that decorator, as <code>oops.__name__</code> reveals, and calling <code>oops()</code> calls the decorator with no function, giving "missing 1 required positional argument: 'func'". With a decorator factory you must always write the brackets, even if you pass no options: <code>@retry()</code>.</p>

  <h2 id="pd-stack"><span class="num">07</span>Stacking Decorators</h2>
  <p>A function can have several decorators, one per line. To know what that means, translate it back into plain calls. <code>@a</code> above <code>@b</code> above <code>def f</code> means <code>f = a(b(f))</code>: the decorator nearest the function is applied first, and the top one ends up outermost. When the function is called, the wrappers run from the outside in, like the layers of an onion. A small example makes the order visible:</p>
  <div class="fx" data-lang="py">import functools

def tag(t):
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
  <p>The <code>i</code> wrapper was applied first and sits inside; the <code>b</code> wrapper was applied around it. Calling <code>special()</code> enters the <code>b</code> wrapper, which calls the <code>i</code> wrapper, which calls the real function. So <code>&lt;b&gt;</code> ends up on the outside of the result.</p>
  <p>With formatting tags the order merely changes the output, but with real decorators it changes behaviour. Here are <code>timed</code> and <code>retry</code> combined in both orders, around a fetch function that fails twice and takes 0.05 seconds per try. (<code>flaky_till</code> uses a closure with <code>nonlocal</code> to count its tries; we build the two orders with explicit calls, which is exactly what two <code>@</code> lines would do.)</p>
  <div class="fx" data-lang="py">import time
def flaky_till(fails):
    tries = 0
    def fetch(path):
        nonlocal tries                    # a closure remembers how many tries so far
        tries += 1
        time.sleep(0.05)                  # each try takes 0.05 s
        if tries &lt;= fails:
            raise ConnectionError(f"Wi-Fi dropped (try {tries})")
        return list(read_orders(path))
    return fetch

print("== timed OUTSIDE retry")
fetch_a = timed(retry(times=3, exceptions=(ConnectionError,))(flaky_till(2)))
print(len(fetch_a("orders.log")), "orders")

print("== retry OUTSIDE timed")
fetch_b = retry(times=3, exceptions=(ConnectionError,))(timed(flaky_till(2)))
print(len(fetch_b("orders.log")), "orders")</div>
  <div class="fx" data-lang="text">== timed OUTSIDE retry
  attempt 1 failed: Wi-Fi dropped (try 1); retrying
  attempt 2 failed: Wi-Fi dropped (try 2); retrying
[timed] fetch took 0.15s
4 orders
== retry OUTSIDE timed
[timed] fetch took 0.05s
  attempt 1 failed: Wi-Fi dropped (try 1); retrying
[timed] fetch took 0.05s
  attempt 2 failed: Wi-Fi dropped (try 2); retrying
[timed] fetch took 0.05s
4 orders</div>
  <p>With <code>timed</code> outside <code>retry</code>, the timer wraps the whole retry loop, so it printed one line for all three tries together: about 0.15 seconds. With <code>retry</code> outside <code>timed</code>, the retry loop calls the timed function three times, so we got three timing lines of about 0.05 seconds each. Neither is wrong; they answer different questions ("how long did the user wait?" versus "how long does one attempt take?"). The general lesson is to decide which behaviour must be outermost. Two real examples: a permission check placed <em>under</em> a cache can let a cached result reach a user who is not allowed to see it, and in Flask <code>@app.route</code> must be the top decorator, otherwise it registers the function without the decorators below it.</p>

  <h2 id="pd-real"><span class="num">08</span>Decorator Patterns</h2>
  <p>Most decorators you will meet or write in practice follow a few shapes: wrap a function and remember its results, record a function somewhere and return it unchanged, check a condition before letting the call through, or keep state in a class instead of a closure. We will look at each with the stall's code.</p>
  <p>The first is caching. Suppose each order needs its item's price from a slow menu server (0.05 seconds per request) whose prices do not change during the day. Remembering each result the first time it is computed, and returning the remembered result for repeated arguments, is called <strong>memoisation</strong>. <code>functools.lru_cache</code> is a decorator that does exactly this: its wrapper keeps a dictionary, in its closure, from arguments to results.</p>
  <div class="fx" data-lang="py">import functools, time
lookups = 0

@functools.lru_cache(maxsize=None)
def menu_price(item):
    global lookups
    lookups += 1
    time.sleep(0.05)                      # pretend: a slow call to the menu server
    return {"masala chai": 30, "samosa": 15, "cold coffee": 90}[item]

day = [o["item"] for o in read_orders("orders.log")] * 25       # 100 orders
t = time.perf_counter()
total = sum(menu_price(i) for i in day)
print(f"{len(day)} lookups, {lookups} real calls, {time.perf_counter() - t:.2f}s, sum {total}")
print(menu_price.cache_info())</div>
  <div class="fx" data-lang="text">100 lookups, 3 real calls, 0.15s, sum 4125
CacheInfo(hits=97, misses=3, maxsize=None, currsize=3)</div>
  <p>A hundred lookups made only three real calls, one per distinct item, so the whole job took about 0.15 seconds instead of about 5. <code>cache_info()</code> confirms it: 3 misses and 97 hits. The sum is (30 + 15 + 90 + 30) × 25 = 4125. Caching is only safe for <strong>pure</strong> functions, whose result depends only on their arguments; the arguments must be hashable (numbers, strings, tuples, not lists), and on instance methods the cache keeps every object alive. Eviction, <code>cache_info()</code> and these rules are covered in detail in <a class="xref" data-note="py_advanced">Functional Programming Tools</a>.</p>
  <p>The second shape is <strong>registration</strong>: a decorator that does not wrap anything at all. It records the function in some table and hands back the very same function. This is how Flask routes, pytest fixtures and plugin systems discover your functions:</p>
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
  <p><code>command("revenue")</code> returned <code>register</code>, which stored the function in <code>COMMANDS</code> and returned it untouched, so <code>revenue</code> still works normally when called directly. The program can now look up and run reports by name, and adding a new report only means writing a decorated function.</p>
  <p>The third shape is a <strong>guard</strong>, which checks a condition before allowing the call. Only a manager may give refunds, and rather than putting an <code>if</code> at the top of every sensitive function, the rule goes into one decorator factory:</p>
  <div class="fx" data-lang="py">import functools

def require_role(role):
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
  <p>The wrapper looks at the first argument, the user, before calling the real function. Asha has the manager role, so the refund goes through; Ravi does not, so the wrapper raises <code>PermissionError</code> and the refund code never runs. Django's <code>@login_required</code> and similar decorators in Flask work the same way.</p>
  <p>Finally, a decorator does not have to be a function, and it does not have to decorate a function. Anything <em>callable</em> that takes one object and returns a replacement can be used with <code>@</code>. A class with a <code>__call__</code> method is callable, and it can keep its state as attributes instead of in closure cells. In the other direction, a decorator can be applied to a class: <code>@dataclass</code> reads the class's annotated fields and adds <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> methods, and <code>@property</code>, used inside a class, turns a method into something you read like an attribute.</p>
  <div class="fx" data-lang="py">import functools
from dataclasses import dataclass

class CountCalls:                         # a decorator written as a class
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.calls = 0                    # state lives on the object, not in a closure
    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.func(*args, **kwargs)

@CountCalls
def items_today(path):
    return sum(o["qty"] for o in read_orders(path))

items_today("orders.log"); items_today("orders.log")
print(items_today("orders.log"), "items;", items_today.calls, "calls;", items_today.__name__)

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
print(day[0].amount, sum(o.amount for o in day))</div>
  <div class="fx" data-lang="text">7 items; 3 calls; items_today
Order(time='09:01', item='masala chai', qty=2, price=30)
60 225</div>
  <p><code>@CountCalls</code> replaced <code>items_today</code> with a <code>CountCalls</code> object. Calling that object runs <code>__call__</code>, which counts the call and then calls the original; after three calls it reports 3, and thanks to <code>functools.update_wrapper</code> (the function behind <code>wraps</code>) it still has the name <code>items_today</code>. <code>@dataclass</code> gave <code>Order</code> a constructor and a readable printout without us writing either, and <code>o.amount</code> is read without brackets because of <code>@property</code>; the day's total is again ₹225. The <code>@staticmethod</code>, <code>@classmethod</code> and <code>@abstractmethod</code> lines you see in classes (see <a class="xref" data-note="py_oop">OOP Concepts</a>) are decorators too.</p>
  <p>A related tool is the context manager, which wraps a <em>block of lines</em> rather than a whole function. Use a decorator when the extra behaviour should surround every call of a function, and a context manager when it should surround part of a function, or must hand a resource to the code inside. Context managers made with <code>@contextmanager</code> can be used both ways; see <a class="xref" data-note="py_context">Context Managers</a>.</p>

  <h2 id="pd-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The most damaging decorator bugs are forgotten <code>return</code> statements, because the code still runs and simply produces <code>None</code>. There are two places to forget one:</p>
  <div class="fx" data-lang="py">def forgetful(func):
    def wrapper(*args, **kwargs):
        func(*args, **kwargs)             # forgot "return"
    return wrapper

@forgetful
def revenue_v1(path):
    return sum(o["qty"] * o["price"] for o in read_orders(path))
print(revenue_v1("orders.log"))

def no_wrapper(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    # forgot "return wrapper"

@no_wrapper
def revenue_v2(path):
    return 225
print(revenue_v2)
try:
    revenue_v2("orders.log")
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">None
None
TypeError: 'NoneType' object is not callable</div>
  <p>In <code>forgetful</code>, the wrapper calls the original but does not return its result, so the revenue of 225 is computed and thrown away, and every call returns <code>None</code>. In <code>no_wrapper</code>, the decorator itself forgets <code>return wrapper</code>. Since <code>@no_wrapper</code> means <code>revenue_v2 = no_wrapper(revenue_v2)</code>, the name <code>revenue_v2</code> becomes <code>None</code>, and calling it fails with "'NoneType' object is not callable". A third version of the same slip is <code>return wrapper()</code> with brackets, which calls the wrapper once at definition time instead of returning it.</p>
  <p>The second is passing a function's result when you meant to pass the function:</p>
  <div class="fx" data-lang="py">import threading
def apply_to_orders(func, path):
    return [func(o["qty"] * o["price"]) for o in read_orders(path)]
def with_gst(amount):
    return round(amount * 1.05, 2)

try:
    apply_to_orders(with_gst(10), "orders.log")   # brackets: passes 10.5, not the function
except TypeError as e:
    print("TypeError:", e)
print(apply_to_orders(with_gst, "orders.log"))     # fixed</div>
  <div class="fx" data-lang="text">TypeError: 'float' object is not callable
[63.0, 47.25, 94.5, 31.5]</div>
  <p><code>with_gst(10)</code> ran immediately and produced 10.5, so <code>apply_to_orders</code> tried to call the number 10.5. The same bug appears as <code>Thread(target=work())</code>, which runs <code>work</code> in the main thread right away. Pass the name without brackets.</p>
  <p>The third is putting per-call work in the decorator body instead of in the wrapper:</p>
  <div class="fx" data-lang="py">import functools
def log_calls(func):
    print(f"logging a call to {func.__name__}")   # meant to run on every call!
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@log_calls
def items_sold(path):
    return sum(o["qty"] for o in read_orders(path))

print(items_sold("orders.log"), items_sold("orders.log"))</div>
  <div class="fx" data-lang="text">logging a call to items_sold
7 7</div>
  <p>The message was meant to appear on every call, but it was written in the decorator body, which runs once when the function is defined. Two calls produced only one message. Work that should happen on every call belongs inside the wrapper.</p>
  <p>A few other mistakes have already appeared on this page. Forgetting <code>@functools.wraps(func)</code> leaves every decorated function named "wrapper", which confuses logs and frameworks; Flask, for example, refuses to register two different views both called "wrapper". Writing <code>@retry</code> instead of <code>@retry()</code> on a decorator factory passes the function in as the first option. Reassigning an outer variable without <code>nonlocal</code> raises <code>UnboundLocalError</code>. Functions created in a loop all see the loop variable's last value. Stacking decorators in the wrong order changes what is timed, retried or checked. And caching a function that is not pure, or whose arguments are lists, gives stale answers or a <code>TypeError</code>.</p>

  <h2 id="pd-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Functions and closures</h3>
  <ul>
    <li><code>f</code> is the function object; <code>f()</code> calls it. Pass <code>f</code>, not <code>f()</code>.</li>
    <li><b>Higher-order function</b>: takes or returns a function. Every decorator is one.</li>
    <li><b>LEGB</b>: Local → Enclosing → Global → Builtins.</li>
    <li><b>Closure</b>: a function plus the outer variables it uses (free variables), stored in cells and kept alive after the outer function returns. Inspect: <code>f.__code__.co_freevars</code>, <code>f.__closure__[i].cell_contents</code>.</li>
    <li>Each call of the outer function creates new cells, so closures are independent.</li>
    <li><code>nonlocal x</code> is needed to <em>reassign</em> an enclosing variable; reading or mutating needs nothing. Missing it → <code>UnboundLocalError</code>.</li>
    <li><b>Late binding</b>: values read at call time; <code>[lambda: i for i in range(3)]</code> all return 2. Fix: <code>lambda i=i: i</code> or <code>partial</code>.</li>
  </ul>
  <h3>Decorator mechanics</h3>
  <table class="tbl">
    <tr><th>Written</th><th>Means</th><th>Notes</th></tr>
    <tr><td><code>@d</code> <code>def f</code></td><td><code>f = d(f)</code></td><td><code>d</code> runs once, at definition/import time</td></tr>
    <tr><td><code>@d(opts)</code> <code>def f</code></td><td><code>f = d(opts)(f)</code></td><td>three layers: options → function → call arguments</td></tr>
    <tr><td><code>@a</code> <code>@b</code> <code>def f</code></td><td><code>f = a(b(f))</code></td><td>applied bottom-up, run outside-in</td></tr>
    <tr><td><code>@d</code> <code>class C</code></td><td><code>C = d(C)</code></td><td><code>@dataclass</code>, <code>@total_ordering</code></td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py">import functools

def deco(func):
    @functools.wraps(func)                 # keep name, docstring, signature
    def wrapper(*args, **kwargs):          # accept any arguments
        # before
        result = func(*args, **kwargs)
        # after
        return result                      # don't lose the result
    return wrapper                         # don't forget this

def factory(times=3):                      # decorator with arguments
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ...                            # uses times and func from closures
        return wrapper
    return decorator</div>
  <ul>
    <li><code>functools.wraps(func)</code> = <code>update_wrapper(wrapper, func)</code>: copies <code>__name__</code>, <code>__qualname__</code>, <code>__doc__</code>, <code>__module__</code>, <code>__annotations__</code>, updates <code>__dict__</code>, sets <code>__wrapped__</code>.</li>
    <li>Put timing or cleanup in <code>try/finally</code> inside the wrapper.</li>
    <li>For <code>async def</code> functions the wrapper must be <code>async def</code> and <code>await func(...)</code>.</li>
  </ul>
  <h3>Patterns</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Shape</th><th>Examples</th></tr>
    <tr><td>Wrap</td><td>wrapper calls func with work before/after</td><td>timing, logging, retry</td></tr>
    <tr><td>Memoise</td><td>wrapper with a dict keyed by arguments</td><td><code>lru_cache</code>, <code>cache</code></td></tr>
    <tr><td>Register</td><td>record func, return it unchanged</td><td><code>@app.route</code>, plugin tables</td></tr>
    <tr><td>Guard</td><td>check, then call or raise</td><td><code>@login_required</code>, role checks</td></tr>
    <tr><td>Class-based</td><td><code>__init__(func)</code> + <code>__call__</code></td><td>decorators with state</td></tr>
    <tr><td>Class decorator</td><td>takes and returns a class</td><td><code>@dataclass</code>, <code>@total_ordering</code></td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Wrapper without <code>return</code> → every call returns <code>None</code>; decorator without <code>return wrapper</code> → name becomes <code>None</code>.</li>
    <li>No <code>wraps</code> → name "wrapper", lost docstring and signature.</li>
    <li><code>@factory</code> without brackets → <code>TypeError</code> on call.</li>
    <li>Per-call work in the decorator body runs only once.</li>
    <li>Stacking order changes behaviour; retry only temporary, repeatable operations.</li>
  </ul>

  <h2 id="pd-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a decorator?</summary><div class="qa-body">A callable that takes a function (or class) and returns a replacement, usually a wrapper that adds behaviour before and after calling the original. Decorators let you write cross-cutting concerns such as logging, timing, caching, retries and permission checks once, and attach them to many functions without editing their bodies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly does <code>@deco</code> above <code>def f</code> do?</summary><div class="qa-body">After the function is defined, Python runs <code>f = deco(f)</code>. The name <code>f</code> then refers to whatever <code>deco</code> returned, usually a wrapper that holds the original in its closure. The decorator runs once, at definition (import) time; the wrapper runs on every call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a closure, and where are its variables stored?</summary><div class="qa-body">A function together with the variables from its enclosing function that it uses, kept alive after the enclosing function has returned. They are stored in cell objects in <code>func.__closure__</code>, and their names are listed in <code>func.__code__.co_freevars</code>. For example, <code>make_tax(0.05)</code> returns a function whose cell holds 0.05.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the LEGB rule.</summary><div class="qa-body">When a name is read, Python looks in the Local scope (the current function), then Enclosing function scopes (innermost first), then Global (the module), then Builtins. Assigning to a name inside a function makes it local unless it is declared <code>global</code> or <code>nonlocal</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need <code>nonlocal</code>, and how does it differ from <code>global</code>?</summary><div class="qa-body">When an inner function reassigns a variable of an enclosing function, as in <code>n += 1</code>. Without it Python treats <code>n</code> as a new local variable and raises <code>UnboundLocalError</code>. Reading, or changing the contents of an object, needs nothing. <code>global</code> refers to a module-level name; <code>nonlocal</code> refers to the nearest enclosing function's name.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is printed? <code>fs = [lambda: i for i in range(3)]; print([f() for f in fs])</code></summary><div class="qa-body"><code>[2, 2, 2]</code>. All three lambdas refer to the same variable <code>i</code>, and its value is read when they are called, after the loop has ended (late binding). Fix it with a default argument, <code>lambda i=i: i</code>, or with <code>functools.partial</code>, which capture the value at creation time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a decorator that logs a function's name and arguments.</summary><div class="qa-body"><div class="fx" data-lang="py">import functools

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__} args={args} kwargs={kwargs}")
        return func(*args, **kwargs)
    return wrapper</div>The key points are <code>*args, **kwargs</code> so it fits any signature, returning the result, and <code>functools.wraps</code> to keep the original's name and signature.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>functools.wraps</code> do, and what breaks without it?</summary><div class="qa-body">It copies the original's <code>__name__</code>, <code>__qualname__</code>, <code>__doc__</code>, <code>__module__</code> and <code>__annotations__</code> onto the wrapper, updates its <code>__dict__</code> and sets <code>__wrapped__</code>. Without it the function reports itself as "wrapper" with signature <code>(*args, **kwargs)</code>, which confuses logs, <code>help()</code> and tracebacks, and breaks frameworks that inspect names or signatures, such as Flask, FastAPI and pytest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a decorator with arguments need three nested functions?</summary><div class="qa-body"><code>@retry(times=3)</code> first calls <code>retry(times=3)</code>, and that call must return the real decorator. The decorator takes the function and returns the wrapper, and the wrapper takes the call's arguments. So the layers are factory (options) → decorator (function) → wrapper (arguments), and each inner layer is a closure over the outer layers' variables.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How can one decorator work both as <code>@retry</code> and as <code>@retry(times=5)</code>?</summary><div class="qa-body">Make the function an optional first positional argument and the options keyword-only. If the function is missing, the decorator was called with options, so return a partial of itself:<div class="fx" data-lang="py">def retry(func=None, *, times=3):
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
  <details class="qa"><summary><span class="qmark">Q</span>In what order are stacked decorators applied and run?</summary><div class="qa-body"><code>@a @b def f</code> means <code>f = a(b(f))</code>: <code>b</code> is applied first, at definition time, and <code>a</code> is applied to the result. At call time <code>a</code>'s wrapper runs first and calls <code>b</code>'s wrapper, which calls <code>f</code>. If each decorator printed "applying" and each wrapper printed "enter", you would see "applying b, applying a" when defining and "enter a, enter b" when calling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the code in a decorator run, compared with the code in its wrapper?</summary><div class="qa-body">The decorator body (outside the wrapper) runs once, when the <code>def</code> statement executes, usually at import time; registration decorators such as <code>@app.route</code> do their work there. The wrapper body runs on every call. Per-call work placed in the decorator body therefore runs only once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you write a decorator that keeps state, such as a call counter?</summary><div class="qa-body">Either a closure with a <code>nonlocal</code> counter (or an attribute on the wrapper, such as <code>wrapper.calls</code>), or a class with <code>__init__(self, func)</code> and <code>__call__</code> that stores <code>self.calls</code>, using <code>functools.update_wrapper(self, func)</code>. A class is clearer when the state grows; note that a plain class-based decorator does not bind <code>self</code> when used on methods unless it implements <code>__get__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you decorate an <code>async def</code> function?</summary><div class="qa-body">The wrapper must itself be <code>async def</code> and must <code>await</code> the original. A normal wrapper would just return the coroutine object without running it, so timing or error handling around it would measure nothing.<div class="fx" data-lang="py">def atimed(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return await func(*args, **kwargs)
        finally:
            print(f"{func.__name__} took {time.perf_counter() - t0:.2f}s")
    return wrapper</div></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a class decorator? Give examples.</summary><div class="qa-body">A decorator applied to a class: <code>@d class C</code> means <code>C = d(C)</code>. It usually adds or changes methods and returns the class. <code>@dataclass</code> generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> from the annotated fields, and <code>functools.total_ordering</code> fills in comparison methods. This is different from a class <em>used as</em> a decorator, which is a class with <code>__call__</code> that wraps a function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are <code>@property</code>, <code>@staticmethod</code> and <code>@classmethod</code> decorators?</summary><div class="qa-body">Yes. They are built-in classes applied with <code>@</code> that return descriptor objects. <code>property</code> turns a method into a computed attribute, <code>staticmethod</code> removes the automatic first argument, and <code>classmethod</code> passes the class instead of the instance. They work through the descriptor protocol (<code>__get__</code>) rather than by wrapping calls.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a registration decorator return, and why?</summary><div class="qa-body">The original function, unchanged, after recording it somewhere, such as <code>COMMANDS[name] = func</code>. It only needs to do something at definition time; there is no per-call behaviour to add, so no wrapper is needed. Flask's <code>@app.route</code>, pytest fixtures and plugin systems work this way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is <code>lru_cache</code> a bad idea?</summary><div class="qa-body">On impure functions whose results depend on time, a database or randomness (the cached answers go stale); with unhashable arguments such as lists or DataFrames (<code>TypeError</code>); with an unbounded cache and many distinct inputs (memory grows forever); and on instance methods (the cache keeps every <code>self</code> alive). See <a class="xref" data-note="py_advanced">Functional Programming Tools</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Decorator or context manager: how do you choose?</summary><div class="qa-body">Use a decorator when the behaviour wraps a whole function call, every time. Use a context manager when it wraps a block of lines inside a function, needs to give the block a value (<code>with open(p) as f</code>), or must release a resource. Managers built with <code>contextlib.contextmanager</code>, or subclasses of <code>ContextDecorator</code>, can be used both ways.</div></details>
</main>
`
});
