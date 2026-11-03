// notes/python/py_context.js — Context Managers
Object.assign(TOPIC_CONTENT, {
  "py_context": `<main>
<h1>Context Managers</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions</span><span>Context Managers</span></div>
  <p class="lead">A <strong>context manager</strong> is an object that knows how to set something up at the start of a <code>with</code> block and how to clean it up at the end, and Python guarantees that the cleanup runs however the block ends: normally, through an early <code>return</code>, or because of an error. That guarantee matters because programs constantly borrow things that must be given back: open files, locks, database connections and transactions, temporary changes to settings. If an error strikes between borrowing and giving back, the give-back line is skipped, and a long-running server slowly runs out of file handles, deadlocks on a lock nobody released, or leaves half-finished transactions behind. You use context managers every time you write <code>with open(...)</code>, and also for <code>with lock:</code>, database transactions, <code>torch.no_grad()</code>, <code>mlflow.start_run()</code>, <code>pytest.raises</code> and <code>mock.patch</code>. Throughout this page we will use one example: the till log of a tea stall called Chai Corner, which contains four orders, a comment line and one junk line that makes careless code crash. We start by watching that junk line leak a file, and then build up the tools that make leaks impossible.</p>

  <h2 id="pc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Context Managers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li>An error between acquire and release skips the release</li>
          <li>Leaks pile up: files, locks, connections, transactions</li>
          <li>Fix: <code>try/finally</code>, packaged as <code>with</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The protocol</div>
        <ul>
          <li><code>with m as x</code> → <code>x = m.__enter__()</code>, body, <code>m.__exit__(type, exc, tb)</code></li>
          <li><code>__exit__</code> runs on normal end, <code>return</code>, <code>break</code>, errors</li>
          <li><code>__exit__</code> returns True → error swallowed</li>
          <li>Not called if <code>__enter__</code> itself fails</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">contextlib</div>
        <ul>
          <li><code>@contextmanager</code>: code before <code>yield</code> = enter, <code>finally</code> = exit</li>
          <li><code>suppress</code>, <code>ExitStack</code>, <code>closing</code>, <code>nullcontext</code></li>
          <li><code>redirect_stdout</code>, <code>chdir</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Everyday uses</div>
        <ul>
          <li>Files, <code>with lock:</code>, <code>with conn:</code> (commit or roll back)</li>
          <li>Timers, temporary settings, <code>torch.no_grad()</code></li>
          <li>Traps: no <code>finally</code>, swallowing everything, sqlite3 keeps the connection open</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Context Managers Exist</span><span class="rm-sub">errors that skip close() and leak resources</span></div></div>
      <div class="rm-item rm-done" data-target="pc-with"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">try/finally and the with Statement</span><span class="rm-sub">what with does, step by step</span></div></div>
      <div class="rm-item rm-done" data-target="pc-protocol"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Writing a Context Manager Class</span><span class="rm-sub">__enter__, __exit__ and its arguments</span></div></div>
      <div class="rm-item rm-done" data-target="pc-suppress"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Suppressing Exceptions</span><span class="rm-sub">when __exit__ says "handled"</span></div></div>
      <div class="rm-item rm-done" data-target="pc-cm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">@contextmanager</span><span class="rm-sub">a context manager from a generator</span></div></div>
      <div class="rm-item rm-done" data-target="pc-exitstack"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">ExitStack</span><span class="rm-sub">a number of resources known only at run time</span></div></div>
      <div class="rm-item rm-done" data-target="pc-real"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Context Managers in Practice</span><span class="rm-sub">locks, transactions, settings, the standard library</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">skipped cleanup, hidden bugs</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">protocol, contextlib, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">__exit__, contextmanager, ExitStack</span></div></div>
    </div>
  </div>

  <h2 id="pc-why"><span class="num">01</span>Why Context Managers Exist</h2>
  <p>Here is Chai Corner's till log. It has six lines: a comment, four orders of the form <code>time,item,quantity,price</code>, and on line 5 a junk line, "till restarted", that the till wrote when it rebooted. The careful <code>read_orders</code> generator from <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> skips both bad lines and gives a total of ₹225:</p>
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

print(sum(o["qty"] * o["price"] for o in read_orders("orders.log")))</div>
  <div class="fx" data-lang="text">225</div>
  <p>Now imagine a stricter parser, written by someone who assumed every non-comment line has exactly four fields. It opens the file, adds up the orders, and closes the file at the end. When it reaches "till restarted", splitting that line gives one piece instead of four, and Python raises a <code>ValueError</code>:</p>
  <div class="fx" data-lang="py">f = open("orders.log")
total = 0
try:
    for line in f:
        if line.startswith("#"):
            continue
        time_, item, qty, price = line.strip().split(",")   # "till restarted" raises here
        total += int(qty) * int(price)
    f.close()                                              # never reached
except ValueError as e:
    print("error:", e)
print("total so far:", total, "| file closed?", f.closed)</div>
  <div class="fx" data-lang="text">error: not enough values to unpack (expected 4, got 1)
total so far: 195 | file closed? False</div>
  <p>The error was caught and reported, and the total so far was ₹195 (the first three orders). But look at the last value: the file is still open. The line <code>f.close()</code> was inside the <code>try</code> block, after the line that failed, so it never ran. Python jumped straight from the failing line to the <code>except</code> block, skipping everything in between.</p>
  <p>Anything a program borrows and must give back is called a <strong>resource</strong>: an open file (the operating system calls it a file handle), a network socket, a lock, a database connection or transaction, a temporary change to a global setting. Borrowing without a guaranteed give-back is called a <strong>resource leak</strong>. One leaked file handle is harmless. A long-running server that hits the bad line on every request is not:</p>
  <div class="fx" data-lang="py">import os, resource

def open_handles():
    return len(os.listdir("/proc/self/fd"))   # Linux: one entry per open file

before = open_handles()
kept = []
for _ in range(1000):                          # 1000 requests to a long-running server
    fh = open("orders.log")
    try:
        int("till restarted")                  # the bad line, every time
        fh.close()
    except ValueError:
        kept.append(fh)                        # (still referenced, as servers often do by accident)
print("leaked handles:", open_handles() - before)
print("this process may open at most:", resource.getrlimit(resource.RLIMIT_NOFILE)[0])
for fh in kept:
    fh.close()
print("after closing:", open_handles() - before)</div>
  <div class="fx" data-lang="text">leaked handles: 1000
this process may open at most: 20000
after closing: 0</div>
  <p>After 1000 failed requests, the process held 1000 open files that nobody would ever close. Every process has a limit on open files (20,000 here, often only 1,024); once it is reached, every <code>open()</code> fails with "Too many open files", and the server stops working. The same kind of leak happens with database connections (the connection pool runs dry), with locks (other threads wait forever) and with GPU memory. Some people assume Python's garbage collector will close the file eventually. In CPython a file is closed when the last reference to it disappears, but any lingering reference (in a list, as here, or in a saved error traceback) keeps it open, and other Python implementations clean up much later. Cleanup that matters should never depend on the garbage collector.</p>
  <p>Think of borrowing a book from a library. If you have to remember to return it yourself, then on the day an emergency calls you away, the book stays out. Now imagine a library with an automatic return gate: whatever happens while you read, the moment you walk out of the door, the book is returned. That gate is what a context manager provides.</p>

  <h2 id="pc-with"><span class="num">02</span>try/finally and the with Statement</h2>
  <p>Python already has a tool that runs code no matter how a block ends: the <code>finally</code> clause. Code in <code>finally</code> runs when the <code>try</code> block finishes normally, when it raises an error, and even when it returns early. So the first fix is to move <code>close()</code> into a <code>finally</code>. The second fix is the <code>with</code> statement, which gives the same guarantee without you having to write it:</p>
  <div class="fx" data-lang="py"># Fix 1: try/finally, correct but easy to forget
f = open("orders.log")
try:
    for line in f:
        if line.startswith("#"):
            continue
        time_, item, qty, price = line.strip().split(",")
except ValueError as e:
    print("error:", e)
finally:
    f.close()                                  # runs however the try block ends
print("try/finally closed?", f.closed)

# Fix 2: with, the same guarantee built in
try:
    with open("orders.log") as f:
        for line in f:
            if line.startswith("#"):
                continue
            time_, item, qty, price = line.strip().split(",")
except ValueError as e:
    print("error:", e)
print("with closed?", f.closed)</div>
  <div class="fx" data-lang="text">error: not enough values to unpack (expected 4, got 1)
try/finally closed? True
error: not enough values to unpack (expected 4, got 1)
with closed? True</div>
  <p>Both versions hit the same <code>ValueError</code> on line 5, and both closed the file. The difference is who has to remember. With <code>try/finally</code>, <em>you</em> must write the <code>finally</code> correctly every single time you open a file, and the one place someone forgets is where the leak happens. With <code>with</code>, the file object itself knows how to clean up, and the statement guarantees that it is asked to, every time.</p>
  <p>How does <code>with</code> know what "clean up" means for a file, as opposed to a lock or a database transaction? It works like the <code>for</code> loop, which calls <code>iter()</code> and <code>next()</code> on whatever object it is given. <code>with</code> calls two methods on the object after it. At the start it calls <code>__enter__()</code>, and whatever that returns is what the <code>as</code> name receives. At the end, however the block ends, it calls <code>__exit__(exc_type, exc, tb)</code>, passing information about any error that happened. An object with these two methods is a <strong>context manager</strong>. To see it happen, here is a small object that prints when each method is called, used first through <code>with</code> and then through a hand-written expansion of what Python does:</p>
  <div class="fx" data-lang="py">class Verbose:
    def __enter__(self):
        print("  __enter__ called")
        return "the value for 'as'"
    def __exit__(self, exc_type, exc, tb):
        print(f"  __exit__ called with {exc_type.__name__ if exc_type else None}")
        return False

print("1) with statement")
with Verbose() as v:
    print("  body sees:", v)

print("2) the same thing by hand")
mgr = Verbose()
exit_ = type(mgr).__exit__                # looked up BEFORE entering
value = type(mgr).__enter__(mgr)
try:
    v = value
    print("  body sees:", v)
except BaseException as e:
    if not exit_(mgr, type(e), e, e.__traceback__):
        raise
else:
    exit_(mgr, None, None, None)</div>
  <div class="fx" data-lang="text">1) with statement
  __enter__ called
  body sees: the value for 'as'
  __exit__ called with None
2) the same thing by hand
  __enter__ called
  body sees: the value for 'as'
  __exit__ called with None</div>
  <p>The same three lines came out both times, because that hand-written <code>try/except/else</code> <em>is</em> what <code>with</code> does. Read it slowly. Python looks up <code>__exit__</code> first, then calls <code>__enter__</code> <em>before</em> the <code>try</code>, so if setup itself fails there is nothing to clean up yet. The value returned by <code>__enter__</code> becomes <code>v</code>. If the body raises anything, <code>__exit__</code> is called with the error's type, the error object and its traceback, and the error is raised again unless <code>__exit__</code> returns something true. If the body finishes without an error, <code>__exit__</code> is called with three <code>None</code>s.</p>
  <figure class="viz"><svg viewBox="0 0 580 170" width="580">
    <defs><marker id="pc-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="60" width="110" height="40" rx="6" class="fb sb"/><text x="22" y="85">__enter__</text>
    <line x1="122" y1="80" x2="156" y2="80" stroke="currentColor" marker-end="url(#pc-a1)"/>
    <rect x="160" y="60" width="100" height="40" rx="6" class="fs" stroke="currentColor"/><text x="172" y="85">with body</text>
    <line x1="262" y1="70" x2="316" y2="34" stroke="currentColor" marker-end="url(#pc-a1)"/><text x="266" y="42" class="tg">ok / return</text>
    <line x1="262" y1="90" x2="316" y2="126" stroke="currentColor" marker-end="url(#pc-a1)"/><text x="262" y="132" class="tr">raises</text>
    <rect x="320" y="14" width="250" height="40" rx="6" class="fg sg"/><text x="330" y="38">__exit__(None, None, None)</text>
    <rect x="320" y="106" width="250" height="40" rx="6" class="fr sr"/><text x="330" y="130">__exit__(type, exc, tb)</text>
    <text x="250" y="164" class="tm">return True: swallow · False/None: re-raise</text>
  </svg><figcaption>Setup runs first, then the body. Whichever way the body ends, __exit__ runs: with three Nones on success (green), or with the error's details on failure (red). If __exit__ returns True the error is swallowed; otherwise it continues to the caller.</figcaption></figure>
  <p>The figure summarises the two paths. Whichever way the body ends, there is no path that avoids <code>__exit__</code>, and that is the whole point. One detail is easy to get wrong: <code>as</code> receives what <code>__enter__</code> <em>returns</em>, not the context manager itself. For files they happen to be the same object, because a file's <code>__enter__</code> returns the file. For many other managers they differ: a lock's <code>__enter__</code> returns <code>True</code>, and our <code>Verbose</code> returned a string.</p>

  <h2 id="pc-protocol"><span class="num">03</span>Writing a Context Manager Class</h2>
  <p>Since any object with <code>__enter__</code> and <code>__exit__</code> works with <code>with</code>, we can write our own. <code>OpenLog</code> opens the log in <code>__enter__</code> and hands the file to <code>as</code>; <code>__exit__</code> closes it and prints the three arguments it received, so we can see what Python tells it. We use it in the three ways a block can end: normally, by raising an error, and by returning from inside.</p>
  <div class="fx" data-lang="py">class OpenLog:
    def __init__(self, path):
        self.path = path
    def __enter__(self):
        print(f"enter: open {self.path}")
        self.f = open(self.path)
        return self.f                          # this becomes "f" in "as f"
    def __exit__(self, exc_type, exc, tb):
        self.f.close()
        print(f"exit: closed | exc_type={exc_type.__name__ if exc_type else None}"
              f" | exc={exc!r} | tb={type(tb).__name__}")
        return False                           # don't swallow errors

with OpenLog("orders.log") as f:               # 1. normal end
    print("body: read", len(f.readlines()), "lines")

try:
    with OpenLog("orders.log") as f:           # 2. the body raises
        for line in f:
            if not line.startswith("#"):
                time_, item, qty, price = line.strip().split(",")
except ValueError:
    print("caller: the ValueError still reached me; file closed?", f.closed)

def first_order(path):                         # 3. return from inside the block
    with OpenLog(path) as f:
        for line in f:
            if not line.startswith("#"):
                return line.strip()
print("returned:", first_order("orders.log"))</div>
  <div class="fx" data-lang="text">enter: open orders.log
body: read 6 lines
exit: closed | exc_type=None | exc=None | tb=NoneType
enter: open orders.log
exit: closed | exc_type=ValueError | exc=ValueError('not enough values to unpack (expected 4, got 1)') | tb=traceback
caller: the ValueError still reached me; file closed? True
enter: open orders.log
exit: closed | exc_type=None | exc=None | tb=NoneType
returned: 09:01,masala chai,2,30</div>
  <p>In the first use the block read all six lines and ended normally, so <code>__exit__</code> received <code>None, None, None</code>. In the second, the strict parse raised <code>ValueError</code> at "till restarted", and <code>__exit__</code> received the error's class, the error object itself and a traceback object (the record of where the error happened). It closed the file and returned <code>False</code>, which means "I have not handled this error", so the error carried on to the caller's <code>except</code>, which confirmed the file was closed. In the third use, <code>first_order</code> returned from the middle of the block; Python still called <code>__exit__</code> on the way out, with three <code>None</code>s because a <code>return</code> is not an error, and the function returned the chai line. In every case "exit: closed" was printed. <code>return</code>, <code>break</code> and <code>continue</code> all pass through <code>__exit__</code>.</p>
  <p>The three parameters of <code>__exit__</code> are therefore how cleanup code learns whether the block succeeded. <code>exc_type</code> is the exception's class, <code>exc</code> (often called <code>exc_value</code>) is the exception object, and <code>tb</code> is its traceback; all three are <code>None</code> when the block finished without an exception. A manager that commits a transaction, for example, would check <code>exc_type</code> to decide between committing and rolling back.</p>
  <p>A context manager does not have to manage a resource that needs releasing. A decorator (see <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>) can time a whole function, but sometimes you want to time just a few lines. A <code>Timer</code> class can record the start in <code>__enter__</code> and the elapsed time in <code>__exit__</code>. Returning <code>self</code> from <code>__enter__</code> lets the code after the block read the result:</p>
  <div class="fx" data-lang="py">import time

class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()
        return self                            # so the code after the block can read t.elapsed
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0
        print(f"[Timer] block took {self.elapsed:.2f}s ({exc_type.__name__ if exc_type else 'no error'})")
        return False

with Timer() as t:
    revenue = sum(o["qty"] * o["price"] for o in read_orders("orders.log"))
    time.sleep(0.1)                            # pretend: printing the receipt
print("revenue", revenue, "| elapsed &gt; 0.1:", t.elapsed &gt; 0.1)</div>
  <div class="fx" data-lang="text">[Timer] block took 0.10s (no error)
revenue 225 | elapsed &gt; 0.1: True</div>
  <p>The block computed ₹225 and then slept for 0.1 seconds to pretend it was printing a receipt; <code>__exit__</code> measured about 0.10 seconds (timings are approximate) and stored it on the object. Because <code>t</code> is the <code>Timer</code> itself, <code>t.elapsed</code> is still available after the block has ended.</p>
  <p>One rule about failures in setup: if <code>__enter__</code> raises an error, for example because the file does not exist, then <code>__exit__</code> is <strong>not</strong> called. The <code>with</code> block never started, so there is nothing to finish. This means a manager whose <code>__enter__</code> acquires several things must release the earlier ones itself if a later one fails (the <code>ExitStack</code> tool later on this page makes that easy).</p>

  <h2 id="pc-suppress"><span class="num">04</span>Suppressing Exceptions</h2>
  <p>We have seen that the return value of <code>__exit__</code> matters. Returning <code>False</code> (or <code>None</code>, which is what a function without a <code>return</code> gives) lets the error continue to the caller. Returning <code>True</code> tells Python "this error has been handled", and Python <strong>suppresses</strong> it: the error disappears, and the program carries on with the first statement <em>after</em> the <code>with</code> block. The rest of the block is still skipped, because the error interrupted it. This is useful when an error is expected and harmless, such as a junk line that should simply be ignored. The standard library has a ready-made manager for it, <code>contextlib.suppress</code>.</p>
  <div class="fx" data-lang="py">from contextlib import suppress

class Ignore:
    def __init__(self, *types):
        self.types = types
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        return exc_type is not None and issubclass(exc_type, self.types)   # True = swallow

with Ignore(KeyError):
    {"chai": 30}["cold coffee"]
    print("never printed")                     # the rest of the block is skipped
print("after block: KeyError swallowed")

total = 0
with open("orders.log") as f:
    for line in f:
        with suppress(ValueError):             # a bad line just skips itself
            time_, item, qty, price = line.strip().split(",")
            total += int(qty) * int(price)
print("total with suppress:", total)</div>
  <div class="fx" data-lang="text">after block: KeyError swallowed
total with suppress: 225</div>
  <p><code>Ignore(KeyError)</code> is our own version. Inside its block, looking up "cold coffee" in a dictionary that has no such key raised <code>KeyError</code>. The rest of the block was skipped, so "never printed" was indeed never printed. <code>__exit__</code> saw that the error's class was one of the types it was told to ignore and returned <code>True</code>, so the program carried on after the block. The second half uses <code>suppress(ValueError)</code> around each line separately. The comment line and the junk line each raise a <code>ValueError</code> inside their own small block and are skipped, while the four good lines are added up. The total is ₹225, the same answer the careful generator gave.</p>
  <p>Notice how small that suppressed block is: one line's worth of work. Suppression is a sharp tool, and the smaller the block and the more specific the exception type, the safer it is. A manager that swallows every exception will also swallow your bugs; the Common Mistakes section shows a typo disappearing this way. Only suppress the specific error you expect, such as <code>suppress(FileNotFoundError)</code> around deleting a file that may already be gone.</p>

  <h2 id="pc-cm"><span class="num">05</span>@contextmanager</h2>
  <p>Writing a class with two methods, plus <code>self.</code> attributes just to carry values from <code>__enter__</code> to <code>__exit__</code>, is a lot of ceremony for "do X before, Y after, even on error". What we really want is a function that can run its setup, <em>pause</em> while the <code>with</code> body runs, and then resume to do its cleanup, with its local variables still intact. We have met exactly that kind of function before: a generator. A generator runs up to <code>yield</code>, pauses with its local variables kept, and can be resumed later; and if it is resumed with an error, its <code>finally</code> block still runs (see <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>).</p>
  <p><strong><code>contextlib.contextmanager</code></strong> is a decorator that turns such a generator function into a context manager. The code before the <code>yield</code> is the setup, playing the role of <code>__enter__</code>. The value you <code>yield</code> is what <code>as</code> receives. The <code>with</code> body runs while the generator is paused at the <code>yield</code>. The code in <code>finally</code> is the cleanup, playing the role of <code>__exit__</code>. Here is the timer again, written this way:</p>
  <div class="fx" data-lang="py">from contextlib import contextmanager
import time

@contextmanager
def timer(label):
    print(f"[{label}] start")                 # = __enter__
    t0 = time.perf_counter()
    try:
        yield t0                               # the with-body runs while we are paused here
    finally:
        print(f"[{label}] took {time.perf_counter() - t0:.2f}s")   # = __exit__, always

with timer("revenue") as started:
    revenue = sum(o["qty"] * o["price"] for o in read_orders("orders.log"))
    print("body: revenue", revenue, "| got start time:", isinstance(started, float))

try:
    with timer("strict parse"):
        with open("orders.log") as f:
            for line in list(f)[1:]:          # skip the comment line
                int(line.split(",")[2])       # "till restarted" has no [2]
except IndexError as e:
    print("caller got IndexError:", e)</div>
  <div class="fx" data-lang="text">[revenue] start
body: revenue 225 | got start time: True
[revenue] took 0.00s
[strict parse] start
[strict parse] took 0.00s
caller got IndexError: list index out of range</div>
  <p>When the first <code>with</code> started, the generator ran from the top: it printed "start", recorded the start time and paused at <code>yield t0</code>, handing <code>t0</code> to <code>started</code>. The body then ran and computed ₹225. When the body finished, the generator was resumed after the <code>yield</code>, its <code>finally</code> printed the time, and the generator ended. The second <code>with</code> shows the error path. The body raised an <code>IndexError</code> at the junk line, and Python delivered that error <em>into</em> the generator, raising it at the paused <code>yield</code>. The <code>finally</code> block still printed the time, and since the generator did not catch the error, it carried on to the caller. Compare this with the <code>Timer</code> class: there we needed two methods and <code>self.t0</code>; here <code>t0</code> is just a local variable that survives the pause. A file opener written this way is only a few lines long:</p>
  <div class="fx" data-lang="py">@contextmanager
def open_log(path):
    f = open(path)
    try:
        yield f
    finally:
        f.close()

with open_log("orders.log") as f:
    print(f.readline().strip())
print("closed?", f.closed)</div>
  <div class="fx" data-lang="text"># Chai Corner till log, Monday
closed? True</div>
  <p>How does a decorator turn a generator into an object with <code>__enter__</code> and <code>__exit__</code>? The idea is simple enough to build ourselves. <code>__enter__</code> calls <code>next(gen)</code>, which runs the generator up to its <code>yield</code> and returns the yielded value. <code>__exit__</code> either calls <code>next(gen)</code> again if the body succeeded, which runs the cleanup (after which the generator must finish), or calls <code>gen.throw(exc)</code> if the body failed, which raises the error at the <code>yield</code>. Here is a simplified but working version:</p>
  <div class="fx" data-lang="py">import functools

class GeneratorCM:                             # a simplified contextlib.contextmanager
    def __init__(self, gen):
        self.gen = gen
    def __enter__(self):
        return next(self.gen)                  # run the generator up to its yield
    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            try:
                next(self.gen)                 # resume: run the code after yield
            except StopIteration:
                return False
            raise RuntimeError("generator didn't stop")
        try:
            self.gen.throw(exc)                # re-raise the body's error AT the yield
        except StopIteration:
            return True                        # generator caught it and finished: swallow
        except BaseException as e:
            if e is exc:
                return False                   # same error came back out: let it continue
            raise
        raise RuntimeError("generator didn't stop after throw()")

def my_contextmanager(genfunc):                # ... and it is a decorator
    @functools.wraps(genfunc)
    def helper(*args, **kwargs):
        return GeneratorCM(genfunc(*args, **kwargs))
    return helper

@my_contextmanager
def shift(name):
    print(f"  {name} opens the till")
    try:
        yield f"till-{name}"
    finally:
        print(f"  {name} closes the till")

with shift("Asha") as till:
    print("  body uses", till)
try:
    with shift("Ravi"):
        raise ValueError("drawer jammed")
except ValueError as e:
    print("  caller got:", e)</div>
  <div class="fx" data-lang="text">  Asha opens the till
  body uses till-Asha
  Asha closes the till
  Ravi opens the till
  Ravi closes the till
  caller got: drawer jammed</div>
  <p><code>my_contextmanager</code> is a decorator: it replaces <code>shift</code> with <code>helper</code>, a closure that, when called, creates the generator and wraps it in a <code>GeneratorCM</code> object. For Asha, <code>__enter__</code> ran the generator to its <code>yield</code> (printing "opens the till" and handing out "till-Asha"), the body used it, and <code>__exit__</code> resumed the generator so that its <code>finally</code> printed "closes the till". For Ravi, the body raised <code>ValueError</code>; <code>__exit__</code> used <code>throw</code> to raise it at the <code>yield</code>, the <code>finally</code> ran, the same error came back out of the generator, so <code>__exit__</code> returned <code>False</code> and the caller received "drawer jammed". The real <code>contextlib</code> version handles more edge cases, but this is the whole idea: a generator plus a decorator makes a context manager.</p>
  <p>Because the body's error arrives at the <code>yield</code>, the generator can respond differently to success and failure by putting <code>try/except/else/finally</code> around it. The <code>except</code> part runs only on failure, the <code>else</code> part only on success, and <code>finally</code> always. That is exactly what a database <strong>transaction</strong> needs: a group of changes that are either all saved (<strong>committed</strong>) or all thrown away (<strong>rolled back</strong>). Here sales are recorded into a ledger on an all-or-nothing basis:</p>
  <div class="fx" data-lang="py">ledger = []                                    # committed sales

@contextmanager
def transaction(ledger):
    pending = []
    print("BEGIN")
    try:
        yield pending                          # the body adds rows to pending
    except Exception as e:
        print(f"ROLLBACK ({e}); {len(pending)} pending rows thrown away")
        raise
    else:
        ledger.extend(pending)
        print(f"COMMIT {len(pending)} rows")
    finally:
        print("close")

with transaction(ledger) as rows:              # clean parse: only valid orders
    for o in read_orders("orders.log"):
        rows.append(o["qty"] * o["price"])
print("ledger:", ledger, "total", sum(ledger))

try:
    with transaction(ledger) as rows:          # strict parse: the junk line raises
        with open("orders.log") as f:
            for line in f:
                if line.startswith("#"):
                    continue
                time_, item, qty, price = line.strip().split(",")
                rows.append(int(qty) * int(price))
except ValueError:
    pass
print("ledger unchanged:", ledger)</div>
  <div class="fx" data-lang="text">BEGIN
COMMIT 4 rows
close
ledger: [60, 45, 90, 30] total 225
BEGIN
ROLLBACK (not enough values to unpack (expected 4, got 1)); 3 pending rows thrown away
close
ledger unchanged: [60, 45, 90, 30]</div>
  <p>On the clean run, the body appended 60, 45, 90 and 30 to the pending list; there was no error, so the <code>else</code> branch committed them to the ledger (total ₹225), and <code>finally</code> printed "close". On the strict run, the body appended three rows and then hit "till restarted". The error arrived at the <code>yield</code>, the <code>except</code> branch printed ROLLBACK and threw away the three pending rows, <code>raise</code> passed the error on to the caller, and <code>finally</code> still printed "close". The ledger was untouched. Half-finished work never reached it, which is the guarantee real databases give, and the reason SQLAlchemy's <code>engine.begin()</code> is a context manager.</p>
  <p>One last bonus: objects made by <code>@contextmanager</code> can also be used as decorators, because they inherit from <code>contextlib.ContextDecorator</code>. Putting <code>@timer("...")</code> above a function wraps every call of it in <code>with timer("..."):</code>.</p>
  <div class="fx" data-lang="py">@timer("nightly report")                       # timer from above, used as a decorator
def nightly_report():
    return sum(o["qty"] * o["price"] for o in read_orders("orders.log"))

print(nightly_report())</div>
  <div class="fx" data-lang="text">[nightly report] start
[nightly report] took 0.00s
225</div>
  <p>The whole function call was timed without changing its body. As a rule of thumb, use <code>@contextmanager</code> for most context managers you write. Use a class when the manager must expose results or methods after the block (like <code>t.elapsed</code>), must be reusable (a <code>@contextmanager</code> object can be entered only once), or has complicated state.</p>

  <h2 id="pc-exitstack"><span class="num">06</span>ExitStack</h2>
  <p>One <code>with</code> handles one resource, and <code>with a() as x, b() as y:</code> handles a fixed few. But suppose the owner wants a weekly report that opens every day's log, and the list of days is only known when the program runs. You cannot write a variable number of nested <code>with</code> lines. And if the third file fails to open, the first two must still be closed.</p>
  <p><strong><code>contextlib.ExitStack</code></strong> solves this. It is a context manager that collects other context managers, and plain cleanup functions, while the program runs. Each <code>stack.enter_context(cm)</code> enters <code>cm</code> and remembers how to exit it; <code>stack.callback(fn, ...)</code> remembers a function to call. When the <code>ExitStack</code> block ends, it runs all the exits in reverse order, last in first out, exactly as nested <code>with</code> statements would. Think of a stack of plates: the last plate put on top is the first one taken off. <code>open_verbose</code> below is a file opener that prints when it opens and closes, so we can watch the order.</p>
  <div class="fx" data-lang="py">from contextlib import ExitStack

@contextmanager
def open_verbose(path):
    print("open ", path)
    f = open(path)
    try:
        yield f
    finally:
        f.close()
        print("close", path)

paths = ["orders.log", "tue.log", "wed.log"]     # known only at run time
with ExitStack() as stack:
    files = [stack.enter_context(open_verbose(p)) for p in paths]
    stack.callback(print, "callback: week processed")
    week_total = 0
    for f in files:
        for line in f:
            parts = line.strip().split(",")
            if len(parts) == 4:
                week_total += int(parts[2]) * int(parts[3])
    print("week total:", week_total)</div>
  <div class="fx" data-lang="text">open  orders.log
open  tue.log
open  wed.log
week total: 485
callback: week processed
close wed.log
close tue.log
close orders.log</div>
  <p>The three files were opened in order, then the work was done: Monday's ₹225, plus Tuesday's 2 × 15 + 4 × 20 = 110, plus Wednesday's 5 × 30 = 150, a week total of ₹485. On exit the stack ran its cleanups in reverse: the callback, registered last, ran first, then the files were closed Wednesday, Tuesday, Monday. Now see what happens when one of the files is missing:</p>
  <div class="fx" data-lang="py">from contextlib import ExitStack
try:
    with ExitStack() as stack:
        for p in ["orders.log", "tue.log", "missing.log"]:
            stack.enter_context(open_verbose(p))
except FileNotFoundError as e:
    print("FileNotFoundError:", e.filename)</div>
  <div class="fx" data-lang="text">open  orders.log
open  tue.log
open  missing.log
close tue.log
close orders.log
FileNotFoundError: missing.log</div>
  <p><code>open_verbose("missing.log")</code> printed "open" and then <code>open()</code> raised <code>FileNotFoundError</code> before the generator reached its <code>try</code>, so it had nothing to close. The stack then closed the two files it had already entered, in reverse order, and the error reached the caller. Nothing leaked. Compare this with the tempting <code>files = [open(p) for p in paths]</code>: if the third <code>open</code> fails, the first two files are left open with no name to close them by. <code>ExitStack</code> also has <code>pop_all()</code>, which moves all the registered cleanups to a new stack, a way to keep resources open after the block when everything succeeded.</p>

  <h2 id="pc-real"><span class="num">07</span>Context Managers in Practice</h2>
  <p>Files are only one kind of resource. Any "acquire, use, release" pair fits the same pattern, and much of the standard library already supports <code>with</code>. The most important one after files is a lock. Suppose four threads (parts of a program that run at the same time) record sales into one shared dictionary. The line <code>sold[...] += 1</code> is really three steps, read, add and write, and two threads can interleave those steps and lose a sale. A <strong>lock</strong> lets only one thread at a time into a section of code. <code>with lock:</code> acquires it at the start and guarantees it is released at the end, even if the body raises; a lock left held by mistake makes every other thread wait forever, which is called a <strong>deadlock</strong>.</p>
  <div class="fx" data-lang="py">import threading

sold = {"masala chai": 0}
lock = threading.Lock()

def sell_many(n):
    for _ in range(n):
        with lock:                             # acquire ... release, even on error
            sold["masala chai"] += 1

threads = [threading.Thread(target=sell_many, args=(10_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(sold, "| lock held now?", lock.locked())</div>
  <div class="fx" data-lang="text">{'masala chai': 40000} | lock held now? False</div>
  <p>Four threads each recorded 10,000 sales, giving exactly 40,000 with none lost, and the lock is free at the end. Keep the code under a lock as short as possible, because every other thread waits while it runs; never make a slow network call while holding one. Threads and locks are covered in <a class="xref" data-note="py_threading">Multithreading</a>.</p>
  <p>Databases use context managers for transactions. A <code>sqlite3</code> connection is a context manager whose <code>__exit__</code> commits if the block succeeded and rolls back if it raised: the built-in version of our ledger example.</p>
  <div class="fx" data-lang="py">import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE sales(item TEXT, amount INTEGER)")

with conn:                                     # commit if the block succeeds
    conn.executemany("INSERT INTO sales VALUES (?, ?)",
                     [(o["item"], o["qty"] * o["price"]) for o in read_orders("orders.log")])
print("after commit:  ", conn.execute("SELECT COUNT(*), SUM(amount) FROM sales").fetchone())

try:
    with conn:                                 # roll back if it raises
        conn.execute("INSERT INTO sales VALUES ('vada pav', 20)")
        raise ValueError("till restarted mid-batch")
except ValueError as e:
    print("error:", e)
print("after rollback:", conn.execute("SELECT COUNT(*), SUM(amount) FROM sales").fetchone())
print("connection still open?", conn.execute("SELECT 1").fetchone() == (1,))
conn.close()</div>
  <div class="fx" data-lang="text">after commit:   (4, 225)
error: till restarted mid-batch
after rollback: (4, 225)
connection still open? True</div>
  <p>The first block inserted the four orders and committed them: 4 rows totalling ₹225. The second block inserted a vada pav and then raised an error; <code>__exit__</code> rolled back, so the table still holds 4 rows and ₹225. Now look at the last line: the connection is still open. In <code>sqlite3</code>, <code>with conn:</code> manages the <em>transaction</em>, not the connection, which surprises many people. Close the connection yourself, or wrap it in <code>contextlib.closing(conn)</code>, which calls <code>close()</code> on exit. (Transactions themselves are explained in <a class="xref" data-note="sql_transactions">Transactions &amp; Concurrency</a>.)</p>
  <p>A third common use is changing a setting for one block only. During festival week the stall charges 18% tax instead of 5%, but only for one special report. Changing a global setting and "remembering to change it back" fails the moment the report raises an error. A context manager saves the old values on entry and restores them in <code>finally</code>:</p>
  <div class="fx" data-lang="py">CAFE = {"gst": 0.05, "currency": "Rs"}

def bill_with_tax(amount):
    return f"{CAFE['currency']} {round(amount * (1 + CAFE['gst']), 2)}"

@contextmanager
def setting(settings, **changes):
    old = {k: settings[k] for k in changes}
    settings.update(changes)
    try:
        yield settings
    finally:
        settings.update(old)                   # always put the old values back

print(bill_with_tax(225))
with setting(CAFE, gst=0.18, currency="INR"):  # festival-week rate, just for this block
    print(bill_with_tax(225))
print(bill_with_tax(225), CAFE)</div>
  <div class="fx" data-lang="text">Rs 236.25
INR 265.5
Rs 236.25 {'gst': 0.05, 'currency': 'Rs'}</div>
  <p>₹225 at 5% is 236.25. Inside the block, at 18% and in "INR", it is 265.5. After the block the settings dictionary is back to exactly what it was. The same pattern is behind <code>mock.patch</code> in tests (replace something, then put it back) and <code>torch.no_grad()</code> in PyTorch (turn gradient tracking off, then back on). The standard library has several more managers of this kind:</p>
  <div class="fx" data-lang="py">import io, os
from contextlib import redirect_stdout, chdir
from decimal import Decimal, localcontext

buf = io.StringIO()
with redirect_stdout(buf):                     # capture prints
    print("receipt: Rs 225")
print("captured:", repr(buf.getvalue()))

os.makedirs("archive", exist_ok=True)
start = os.getcwd()
with chdir("archive"):                         # Python 3.11+
    print("inside:", os.path.basename(os.getcwd()))
print("back where we started:", os.getcwd() == start)

with localcontext() as ctx:                    # temporary decimal precision
    ctx.prec = 3
    print("225 / 7 at 3 digits:", Decimal(225) / Decimal(7))
print("225 / 7 default:     ", Decimal(225) / Decimal(7))</div>
  <div class="fx" data-lang="text">captured: 'receipt: Rs 225\\n'
inside: archive
back where we started: True
225 / 7 at 3 digits: 32.1
225 / 7 default:      32.14285714285714285714285714</div>
  <p><code>redirect_stdout</code> sent a <code>print</code> into a text buffer instead of the screen, which is handy for capturing output in tests. <code>chdir</code> (Python 3.11 and later) changed the working directory for the block and restored it afterwards. <code>decimal.localcontext</code> computed 225 / 7 to three significant digits inside the block and at full precision outside it.</p>
  <table class="tbl">
    <tr><th>Context manager</th><th>On enter</th><th>On exit (always)</th></tr>
    <tr><td><code>open(path)</code></td><td>open the file</td><td>close it</td></tr>
    <tr><td><code>threading.Lock()</code></td><td>acquire</td><td>release</td></tr>
    <tr><td><code>sqlite3</code> connection, SQLAlchemy <code>engine.begin()</code></td><td>begin a transaction</td><td>commit, or roll back on error</td></tr>
    <tr><td><code>suppress(E)</code></td><td>nothing</td><td>swallow E</td></tr>
    <tr><td><code>redirect_stdout</code>, <code>chdir</code>, <code>localcontext</code></td><td>change a setting</td><td>restore it</td></tr>
    <tr><td><code>torch.no_grad()</code></td><td>turn gradient tracking off</td><td>turn it back on</td></tr>
    <tr><td><code>mlflow.start_run()</code></td><td>start an experiment run</td><td>end it (marked failed on error)</td></tr>
    <tr><td><code>pytest.raises(E)</code>, <code>mock.patch(...)</code></td><td>prepare the check / patch</td><td>verify E was raised / undo the patch</td></tr>
    <tr><td><code>tempfile.TemporaryDirectory()</code></td><td>create a directory</td><td>delete it</td></tr>
  </table>
  <p>The general idea behind all of these, tying the release of a resource to leaving a block of code so that the release cannot be forgotten, is known in C++ as RAII ("resource acquisition is initialisation"). In Python the block is the <code>with</code> statement. Asynchronous code has its own version, <code>async with</code>, which calls <code>__aenter__</code> and <code>__aexit__</code> so that setup and cleanup can wait on network I/O; <code>contextlib.asynccontextmanager</code> builds one from an async generator (see <a class="xref" data-note="py_asyncio">asyncio</a>).</p>

  <h2 id="pc-traps"><span class="num">08</span>Common Mistakes</h2>
  <p>The number-one bug with <code>@contextmanager</code> is forgetting <code>try/finally</code> around the <code>yield</code>. Remember that if the body raises, the error is raised <em>at</em> the <code>yield</code>. Without a <code>try</code>, it passes straight out of the generator, and the cleanup lines after the <code>yield</code> never run:</p>
  <div class="fx" data-lang="py">@contextmanager
def no_finally(log):
    log.append("open")
    yield
    log.append("close")                        # skipped if the body raises

log = []
try:
    with no_finally(log):
        raise RuntimeError("boom")
except RuntimeError:
    pass
print("without try/finally:", log)</div>
  <div class="fx" data-lang="text">without try/finally: ['open']</div>
  <p>The log contains "open" but no "close". This is exactly the leak the context manager was supposed to prevent. Always put cleanup in a <code>finally</code>.</p>
  <p>The second is an <code>__exit__</code> that returns <code>True</code> unconditionally, which swallows every error in the block, including your own typos:</p>
  <div class="fx" data-lang="py">class SwallowAll:
    def __enter__(self):
        return self
    def __exit__(self, *exc):
        return True                            # swallows EVERYTHING

total = 0
with SwallowAll():
    total += 2 * 30
    totl += 3 * 15                             # typo: NameError, silently swallowed
    total += 1 * 90
print("total:", total)</div>
  <div class="fx" data-lang="text">total: 60</div>
  <p>The misspelled <code>totl</code> raised a <code>NameError</code>, <code>SwallowAll</code> returned <code>True</code>, and the block silently stopped after its first line. The total came out as 60 instead of 195, and there was no error message anywhere to explain why. Return <code>True</code> only for specific expected exception types, or use <code>suppress(SpecificError)</code> around the smallest possible block.</p>
  <p>The third is a <code>@contextmanager</code> generator that yields the wrong number of times. It must yield exactly once:</p>
  <div class="fx" data-lang="py">@contextmanager
def twice():
    yield 1
    yield 2                                    # a second yield

@contextmanager
def never():
    if False:
        yield                                  # never reached

for cm in (twice, never):
    try:
        with cm():
            pass
    except RuntimeError as e:
        print("RuntimeError:", e)</div>
  <div class="fx" data-lang="text">RuntimeError: generator didn't stop
RuntimeError: generator didn't yield</div>
  <p>A second <code>yield</code> gives "generator didn't stop", because after the body Python expected the generator to finish; no <code>yield</code> at all gives "generator didn't yield", because there was no point at which to run the body.</p>
  <p>The fourth is using <code>with</code> on an object that is not a context manager:</p>
  <div class="fx" data-lang="py">class Plain:                                   # no __enter__ / __exit__
    pass

try:
    with Plain():
        pass
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: 'Plain' object does not support the context manager protocol</div>
  <p>Python checks for <code>__enter__</code> and <code>__exit__</code> and refuses with a <code>TypeError</code> if they are missing. Older libraries sometimes return objects with only a <code>close()</code> method; wrap those in <code>contextlib.closing(obj)</code>.</p>
  <p>A few other mistakes have appeared earlier on the page. Assuming <code>with conn:</code> closes a <code>sqlite3</code> connection (it only commits or rolls back). Returning a lazy generator from inside <code>with open(...)</code>, which closes the file before anything is read (shown in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>). Opening a list of files with a plain list comprehension instead of an <code>ExitStack</code>, which leaks the opened files if a later one fails. And doing slow work inside <code>with lock:</code> or inside a transaction, which makes everything else wait.</p>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Resource</b>: something borrowed that must be given back (file, socket, lock, connection, transaction, setting). <b>Leak</b>: borrowing without a guaranteed give-back.</li>
    <li><b>Context manager</b>: an object with <code>__enter__(self)</code> and <code>__exit__(self, exc_type, exc, tb)</code>, used with <code>with</code>.</li>
    <li><b>Suppressing</b>: <code>__exit__</code> returns a true value, the error disappears and execution continues after the block.</li>
    <li>Garbage collection is not a cleanup strategy; lingering references keep objects alive.</li>
  </ul>
  <h3>The with protocol</h3>
  <div class="fx" data-lang="py">with m as x:
    body
# is roughly:
x = m.__enter__()                          # __enter__/__exit__ looked up on type(m)
try:
    body
except BaseException as e:
    if not m.__exit__(type(e), e, e.__traceback__):
        raise                              # re-raise unless __exit__ returned true
else:
    m.__exit__(None, None, None)</div>
  <ul>
    <li><code>as</code> binds what <code>__enter__</code> returns (file → itself, lock → <code>True</code>, a Timer → <code>self</code>).</li>
    <li><code>__exit__</code> runs on normal end, <code>return</code>, <code>break</code>, <code>continue</code> and errors; not if <code>__enter__</code> raised.</li>
    <li><code>with a() as x, b() as y:</code> is nested; <code>b</code> exits before <code>a</code>.</li>
    <li><code>async with</code> calls <code>__aenter__</code>/<code>__aexit__</code>; build with <code>@asynccontextmanager</code>.</li>
  </ul>
  <h3>@contextmanager</h3>
  <div class="fx" data-lang="py">from contextlib import contextmanager

@contextmanager
def managed(args):
    r = acquire(args)                      # __enter__ part
    try:
        yield r                            # value for "as"; body runs here
    except Exception:
        undo(r); raise                     # optional: failure only
    else:
        commit(r)                          # optional: success only
    finally:
        release(r)                         # __exit__ part, always</div>
  <ul>
    <li>Exactly one <code>yield</code>; the body's error is raised at the <code>yield</code>.</li>
    <li>Internally: enter = <code>next(gen)</code>; exit = <code>next(gen)</code> or <code>gen.throw(exc)</code>.</li>
    <li>Single-use; also works as a decorator (<code>ContextDecorator</code>).</li>
  </ul>
  <h3>contextlib toolbox</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Use</th></tr>
    <tr><td><code>contextmanager</code> / <code>asynccontextmanager</code></td><td>write a manager as a generator</td></tr>
    <tr><td><code>suppress(*excs)</code></td><td>ignore specific exceptions in a small block</td></tr>
    <tr><td><code>ExitStack</code></td><td><code>enter_context</code>, <code>callback</code>, <code>pop_all</code>; exits last in, first out</td></tr>
    <tr><td><code>closing(obj)</code></td><td>call <code>obj.close()</code> on exit</td></tr>
    <tr><td><code>nullcontext(x)</code></td><td>a manager that does nothing, for optional contexts</td></tr>
    <tr><td><code>redirect_stdout</code>, <code>chdir</code></td><td>temporarily redirect output / change directory</td></tr>
  </table>
  <h3>Class vs @contextmanager</h3>
  <table class="tbl">
    <tr><th></th><th>Class</th><th><code>@contextmanager</code></th></tr>
    <tr><td>Code</td><td>two methods, state on <code>self</code></td><td>one generator, state in local variables</td></tr>
    <tr><td>Results after the block</td><td>easy (<code>t.elapsed</code>)</td><td>yield a mutable object</td></tr>
    <tr><td>Reusable</td><td>can be</td><td>single-use per call</td></tr>
    <tr><td>Error handling</td><td>inspect <code>exc_type</code>, return True to suppress</td><td><code>try/except/else/finally</code> around <code>yield</code></td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li><code>@contextmanager</code> without <code>try/finally</code> → cleanup skipped on error.</li>
    <li><code>__exit__</code> always returning <code>True</code> hides every bug.</li>
    <li>sqlite3 <code>with conn:</code> manages the transaction, not the connection.</li>
    <li>A lazy generator returned from inside <code>with open</code> reads a closed file.</li>
    <li><code>[open(p) for p in paths]</code> leaks on partial failure; use <code>ExitStack</code>.</li>
    <li>Keep lock and transaction blocks short.</li>
  </ul>

  <h2 id="pc-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a context manager?</summary><div class="qa-body">An object that implements <code>__enter__</code> and <code>__exit__</code> and is used with the <code>with</code> statement. <code>__enter__</code> sets something up, and its return value is bound by <code>as</code>; <code>__exit__</code> cleans up on every way out of the block, including errors. Files, locks, database connections and transactions are typical examples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>with open(...)</code> instead of <code>open()</code> and <code>close()</code>?</summary><div class="qa-body">An error between <code>open</code> and <code>close</code> skips the <code>close()</code>, leaking the file handle. <code>with</code> guarantees that <code>__exit__</code>, which closes the file, runs on every exit path: normal end, <code>return</code>, <code>break</code> or an exception. It is also shorter and harder to get wrong than the equivalent <code>try/finally</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What arguments does <code>__exit__</code> receive, and what does its return value do?</summary><div class="qa-body">The exception's type, the exception object and the traceback; all three are <code>None</code> if the block finished without an exception. Returning a true value suppresses the exception and execution continues after the <code>with</code> block. Returning <code>False</code> or <code>None</code> lets the exception propagate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the <code>with</code> statement as plain Python.</summary><div class="qa-body"><code>x = m.__enter__()</code>, then <code>try:</code> the body; <code>except BaseException as e:</code> <code>if not m.__exit__(type(e), e, e.__traceback__): raise</code>; <code>else: m.__exit__(None, None, None)</code>. Python looks up both methods on the object's type before entering, and <code>__enter__</code> runs outside the <code>try</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__exit__</code> called if <code>__enter__</code> raises?</summary><div class="qa-body">No. The block never started, so there is nothing to exit. A manager whose <code>__enter__</code> acquires several things must release the earlier ones itself if a later one fails, or use an <code>ExitStack</code> internally.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a context manager that times a block, as a class and with <code>@contextmanager</code>.</summary><div class="qa-body"><div class="fx" data-lang="py">class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0
        return False                       # don't suppress

@contextmanager
def timer(label):
    t0 = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter() - t0:.4f}s")</div>The class makes <code>t.elapsed</code> available after the block; the generator version is shorter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>@contextmanager</code> work internally?</summary><div class="qa-body">It is a decorator that wraps the generator function. Calling the result creates the generator inside a helper object. Its <code>__enter__</code> calls <code>next(gen)</code> to run up to the <code>yield</code> and returns the yielded value. Its <code>__exit__</code> calls <code>next(gen)</code> again if there was no exception (the generator must then finish), or <code>gen.throw(exc)</code> if there was, so the generator's <code>except</code> and <code>finally</code> run at the <code>yield</code>. If the generator swallows the exception, it is suppressed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes wrong if a <code>@contextmanager</code> has no <code>try/finally</code> around <code>yield</code>?</summary><div class="qa-body">When the body raises, the exception is raised inside the generator at the <code>yield</code>. Without a <code>try</code> it passes straight out, and the cleanup code after <code>yield</code> never runs, which is exactly the leak the context manager was meant to prevent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you write a transaction context manager that commits on success and rolls back on error?</summary><div class="qa-body"><div class="fx" data-lang="py">@contextmanager
def transaction(conn):
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise                              # don't hide the error
    else:
        conn.commit()</div>The body's exception arrives at the <code>yield</code>, so <code>except</code> handles failure and <code>else</code> runs only on success. <code>sqlite3</code> connections and SQLAlchemy's <code>engine.begin()</code> provide this built in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is it right for a context manager to suppress an exception?</summary><div class="qa-body">Only for a specific, expected and harmless exception, such as <code>contextlib.suppress(FileNotFoundError)</code> around deleting a file that may not exist. Check the type and keep the block tiny. A manager that returns <code>True</code> for everything hides real bugs, even a <code>NameError</code> from a typo.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you open a variable number of files safely?</summary><div class="qa-body">Use <code>contextlib.ExitStack</code>: <code>with ExitStack() as stack: files = [stack.enter_context(open(p)) for p in paths]</code>. All files are closed in reverse order on exit, and if opening one fails, those already opened are still closed. A plain list comprehension of <code>open()</code> calls leaks on partial failure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>with lock:</code> give you over <code>lock.acquire()</code> and <code>lock.release()</code>?</summary><div class="qa-body">The lock is released even if the body raises. A lock left held after an exception blocks every other thread waiting for it, effectively a deadlock. It also makes the extent of the protected section obvious, and that section should be kept as small as possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does <code>with sqlite3.connect(path) as conn:</code> close the connection?</summary><div class="qa-body">No. A <code>sqlite3</code> connection's context manager commits on success and rolls back on an exception, but leaves the connection open. Close it explicitly or wrap it: <code>with contextlib.closing(sqlite3.connect(path)) as conn:</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>contextlib.nullcontext</code> for?</summary><div class="qa-body">It is a context manager that does nothing, optionally returning a given value from <code>__enter__</code>. It lets you write a single code path when a context is optional, for example <code>with (lock if lock else nullcontext()):</code> or <code>with open(p) if p else nullcontext(sys.stdout) as f:</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do asynchronous context managers differ?</summary><div class="qa-body">They implement <code>__aenter__</code> and <code>__aexit__</code> as coroutines and are used with <code>async with</code> inside <code>async def</code>, so setup and cleanup can <code>await</code> I/O, as with HTTP sessions, database connections and async locks. <code>contextlib.asynccontextmanager</code> builds one from an async generator.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Decorator or context manager: when do you use which?</summary><div class="qa-body">Use a decorator when the behaviour wraps a whole function call every time. Use a context manager when it wraps a block within a function, needs to give the block a value (<code>as f</code>), or must release a resource. Managers built with <code>@contextmanager</code>, or subclasses of <code>ContextDecorator</code>, can be used both ways, as <code>@timer("x")</code> and as <code>with timer("x"):</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>torch.no_grad()</code> do, and why is it a context manager?</summary><div class="qa-body">On entry it turns off gradient tracking, saving memory and computation during inference; on exit it restores the previous setting, even if the block raises. It is the "temporarily change a global setting and always restore it" pattern, like <code>mock.patch</code>, <code>decimal.localcontext</code> or <code>redirect_stdout</code>. It can also be used as a decorator on an inference function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Class-based or <code>@contextmanager</code>: how do you choose?</summary><div class="qa-body">Use <code>@contextmanager</code> for most cases: setup, <code>yield</code>, cleanup in <code>finally</code>, with state in local variables. Use a class when the manager needs to expose results or methods after the block (<code>t.elapsed</code>), must be reusable or re-enterable (generator-based managers are single-use), or has complex state.</div></details>
</main>
`
});
