// notes/python/py_context.js — Context Managers
Object.assign(TOPIC_CONTENT, {
  "py_context": `<main>
<h1>Context Managers</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions</span><span>Context Managers</span></div>
  <p class="lead">A <strong>context manager</strong> is an object that defines what happens on entering and leaving a <code>with</code> block: <code>__enter__</code> sets something up, and <code>__exit__</code> cleans it up on <em>every</em> exit path, whether the block ends normally, returns early or raises. Without it, an exception between acquiring and releasing a resource skips the release. Files stay open, locks stay held, transactions are left half-done and temporary settings are never restored, and a long-running server eventually runs out of handles or deadlocks. You use context managers for <code>open()</code>, <code>with lock:</code>, database transactions (<code>with conn:</code>, <code>engine.begin()</code>), <code>torch.no_grad()</code>, <code>mlflow.start_run()</code>, <code>pytest.raises</code> and <code>mock.patch</code>. You can write your own as a class or, more often, with <code>@contextlib.contextmanager</code>. Code here was run on Python 3.13.</p>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Context Managers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Resource leaks</div>
        <ul>
          <li>Error between open and close → <code>close()</code> skipped</li>
          <li>Leaked handles accumulate; per-process limit (often 1024)</li>
          <li>Don't rely on garbage collection for cleanup</li>
          <li>Fix 1: <code>try/finally</code>; Fix 2: <code>with</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The protocol</div>
        <ul>
          <li><code>with m as x:</code> → <code>x = m.__enter__()</code>, body, <code>m.__exit__(…)</code></li>
          <li><code>__exit__(exc_type, exc, tb)</code>: all <code>None</code> on success</li>
          <li>Runs on normal end, <code>return</code>, <code>break</code>, exception</li>
          <li>Return <b>True</b> = suppress; False/None = re-raise</li>
          <li><code>__exit__</code> not called if <code>__enter__</code> raises</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">@contextmanager</div>
        <ul>
          <li>Before <code>yield</code> = enter; yielded value → <code>as</code></li>
          <li>Body runs while the generator is paused at <code>yield</code></li>
          <li>Body's exception is thrown in <em>at</em> the <code>yield</code></li>
          <li><code>finally</code> = exit; ⚠ no try/finally → cleanup skipped</li>
          <li>Exactly one <code>yield</code>; also usable as a decorator</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Many resources</div>
        <ul>
          <li><code>with a() as x, b() as y:</code> for a fixed few</li>
          <li><b>ExitStack</b>: <code>enter_context</code> in a loop, <code>callback</code></li>
          <li>Exits run in reverse (LIFO) order</li>
          <li>Failure halfway → already-entered ones are still closed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Common uses</div>
        <ul>
          <li>Files · <code>with lock:</code> · <code>with conn:</code> (commit/rollback)</li>
          <li>Timers · temporary settings · <code>redirect_stdout</code> · <code>chdir</code> · <code>localcontext</code></li>
          <li><code>suppress(Error)</code> · <code>torch.no_grad()</code> · <code>mlflow.start_run()</code></li>
          <li><code>pytest.raises</code>, <code>mock.patch</code>, <code>TemporaryDirectory</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>⚠ <code>yield</code> without try/finally</li>
          <li>⚠ <code>__exit__</code> always <code>True</code> hides bugs</li>
          <li>⚠ sqlite3 <code>with conn:</code> commits but does not close</li>
          <li>⚠ Returning a lazy generator out of <code>with open</code></li>
          <li>⚠ <code>with</code> on an object without <code>__enter__</code> → TypeError</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Context Managers: Resource Leaks</span><span class="rm-sub">exceptions that skip close()</span></div></div>
      <div class="rm-item rm-done" data-target="pc-with"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">try/finally and the with Statement</span><span class="rm-sub">with desugared to try/except</span></div></div>
      <div class="rm-item rm-done" data-target="pc-protocol"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Writing a Context Manager Class</span><span class="rm-sub">__enter__, __exit__ and its arguments</span></div></div>
      <div class="rm-item rm-done" data-target="pc-suppress"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Suppressing Exceptions</span><span class="rm-sub">__exit__ return value, contextlib.suppress</span></div></div>
      <div class="rm-item rm-done" data-target="pc-cm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">@contextmanager</span><span class="rm-sub">generator-based managers, how they work</span></div></div>
      <div class="rm-item rm-done" data-target="pc-exitstack"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">ExitStack</span><span class="rm-sub">run-time number of resources</span></div></div>
      <div class="rm-item rm-done" data-target="pc-real"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Locks, Transactions, Settings and stdlib Managers</span><span class="rm-sub">threading, sqlite3, redirect_stdout</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">skipped cleanup, hidden bugs</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">protocol, contextlib, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">__exit__, contextmanager, ExitStack</span></div></div>
    </div>
  </div>

  <h2 id="pc-why"><span class="num">01</span>Why Context Managers: Resource Leaks</h2>
  <p>Code that opens a resource, works with it and then closes it has a hole: if an exception is raised in the middle, the close line never runs. The examples use a six-line order log with a comment and a junk line, and the <code>read_orders</code> generator from <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, which skips both.</p>
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
  <p>Now a strict parser that expects every non-comment line to have four fields. Line 5, "till restarted", has one.</p>
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
print("total so far:", total, "| file closed?", f.closed)
f.close()</div>
  <div class="fx" data-lang="text">error: not enough values to unpack (expected 4, got 1)
total so far: 195 | file closed? False</div>
  <p>The error handler ran, but the file was left open. One leaked file handle is harmless. A long-running server that hits the bad line on every request is not:</p>
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
  <p>After 1000 failed requests the process held 1000 open files. Every process has a limit (here 20,000; often only 1,024); past it, every <code>open()</code> fails with "Too many open files", and the server falls over. The same leak happens with database connections (the pool runs dry), locks (other threads wait forever) and GPU memory.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Borrowing a book from a library. If you must remember to return it yourself, then on the day an emergency calls you away, the book stays out. A library with an automatic return gate is different: whatever happens while you read, the moment you walk out of the door the book is returned. That gate is what <code>with</code> provides.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>resource</strong> is anything acquired from the operating system or another system that must be released: file handles, sockets, locks, database connections and transactions, temporary changes to global settings. A <strong>resource leak</strong> is acquiring without a guaranteed release.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Python's garbage collector closes it eventually." In CPython a file is closed when its last reference disappears, but any lingering reference (a list, a traceback, a closure) keeps it open, and other Python implementations collect much later. Never rely on it for cleanup.</p></div>

  <h2 id="pc-with"><span class="num">02</span>try/finally and the with Statement</h2>
  <p>Fix 1 is <code>try/finally</code>: code in <code>finally</code> runs no matter how the <code>try</code> block ends. Fix 2 is the <code>with</code> statement, which gives the same guarantee in one line.</p>
  <div class="fx" data-lang="py"># Fix 1: try/finally, correct but easy to forget
f = open("orders.log")
try:
    total = 0
    for line in f:
        if line.startswith("#"):
            continue
        time_, item, qty, price = line.strip().split(",")
        total += int(qty) * int(price)
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
  <p>Both runs hit the same <code>ValueError</code> at line 5, and both closed the file. The difference is who remembers: with <code>try/finally</code> <em>you</em> must write the <code>finally</code> at every use; with <code>with</code>, the file object itself knows how to clean up, and the statement guarantees it is asked to.</p>
  <h3>How with desugars</h3>
  <p>Like <code>for</code>, which calls <code>iter()</code> and <code>next()</code>, <code>with</code> calls two methods on the object after it: <code>__enter__()</code> at the start (its return value is what <code>as</code> receives), and <code>__exit__(exc_type, exc, tb)</code> at the end. The code runs a small object that prints when each method is called, first through <code>with</code>, then through a hand-written expansion of what Python does.</p>
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
  <p>The same three lines came out both times: that hand-written <code>try/except/else</code> <em>is</em> what <code>with</code> does. Read the expansion slowly: <code>__enter__</code> runs before the <code>try</code>, so if setup itself fails there is nothing to clean up; if the body raises anything, <code>__exit__</code> gets the error's type, value and traceback, and the error is re-raised unless <code>__exit__</code> returns something true; if the body finishes, <code>__exit__</code> gets three <code>None</code>s.</p>
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
  </svg><figcaption>Setup runs first. Then the body. Whichever way the body ends, __exit__ runs: with three Nones on success (green), or with the error's details on failure (red). If __exit__ returns True the error is swallowed; otherwise it continues to the caller.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>with statement</strong> <code>with EXPR as VAR: BODY</code> evaluates <code>EXPR</code> to a <strong>context manager</strong> <code>m</code>, calls <code>m.__enter__()</code> and binds the result to <code>VAR</code>, runs <code>BODY</code>, and then calls <code>m.__exit__(exc_type, exc_value, traceback)</code> on every exit path, re-raising the exception unless <code>__exit__</code> returns a true value.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>as</code> receives what <code>__enter__</code> <em>returns</em>, not the manager itself. For files they are the same object; for many others (a lock returns <code>True</code>, our <code>Verbose</code> returned a string) they are not.</p></div>

  <h2 id="pc-protocol"><span class="num">03</span>Writing a Context Manager Class: __enter__ and __exit__</h2>
  <p>Any object with <code>__enter__</code> and <code>__exit__</code> works with <code>with</code>. The three arguments of <code>__exit__</code> tell the cleanup code whether the block succeeded and, if not, which exception was raised.</p>
  <p><code>OpenLog</code> opens the log in <code>__enter__</code> and hands the file to <code>as</code>; <code>__exit__</code> closes it and prints its three arguments. We use it three ways: a normal block, a block that raises, and a <code>return</code> from inside the block.</p>
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
  <table class="tbl out"><caption>Trace of the three uses</caption>
    <tr><th>Use</th><th>How the block ended</th><th><code>__exit__</code> received</th><th>Returned</th><th>Then</th></tr>
    <tr><td>1</td><td>normally (read 6 lines)</td><td><code>None, None, None</code></td><td>False</td><td>carry on after the block</td></tr>
    <tr><td>2</td><td><code>ValueError</code> at "till restarted"</td><td><code>ValueError</code>, the error object, a traceback</td><td>False</td><td>error continues to the caller's <code>except</code>; file closed</td></tr>
    <tr><td>3</td><td><code>return</code> from inside</td><td><code>None, None, None</code></td><td>False</td><td>the function returns the chai line</td></tr>
  </table>
  <p>In every case "exit: closed" printed. In case 3 the function returned from the middle of the block and the file was still closed on the way out: <code>return</code>, <code>break</code> and <code>continue</code> all pass through <code>__exit__</code>.</p>
  <h3>A Timer class</h3>
  <p>A decorator (see <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>) times a whole function. A context manager can time any block of lines. Returning <code>self</code> from <code>__enter__</code> lets the code after the block read the result.</p>
  <div class="fx" data-lang="py">import time

class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()
        return self                            # so the block can read t.elapsed later
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0
        print(f"[Timer] block took {self.elapsed:.4f}s ({exc_type.__name__ if exc_type else 'no error'})")
        return False

with Timer() as t:
    revenue = sum(o["qty"] * o["price"] for o in read_orders("orders.log"))
    time.sleep(0.1)                            # pretend: printing the receipt
print("revenue", revenue, "| elapsed &gt; 0.1:", t.elapsed &gt; 0.1)</div>
  <div class="fx" data-lang="text">[Timer] block took 0.1002s (no error)
revenue 225 | elapsed &gt; 0.1: True</div>
  <p>The block computed ₹225, slept 0.1 s for the "receipt", and <code>__exit__</code> recorded the elapsed time on the object. Because <code>t</code> is the <code>Timer</code>, <code>t.elapsed</code> is available after the block.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>context manager</strong> is any object with <code>__enter__(self)</code> and <code>__exit__(self, exc_type, exc_value, traceback)</code>. <code>exc_type</code> is the exception's class, <code>exc_value</code> the exception object, <code>traceback</code> its traceback object; all three are <code>None</code> when the block exits without an exception.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>If <code>__enter__</code> raises (say, the file does not exist), <code>__exit__</code> is <strong>not</strong> called: the <code>with</code> never started. Do any setup that can fail before acquiring things that need releasing, or release them yourself inside <code>__enter__</code>.</p></div>

  <h2 id="pc-suppress"><span class="num">04</span>Suppressing Exceptions: __exit__ Return Value and suppress</h2>
  <p>Some exceptions are expected and harmless, such as a junk line that should simply be skipped. A context manager can mark the exception as handled so the program carries on.</p>
  <p>If <code>__exit__</code> returns <code>True</code>, Python treats the error as handled and continues <em>after</em> the <code>with</code> block. The rest of the block is still skipped. The standard library has this built in as <code>contextlib.suppress</code>.</p>
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
  <p>The <code>KeyError</code> jumped out of the body at the dict lookup, so "never printed" was never printed; <code>__exit__</code> returned <code>True</code> because the error type was in its list, and the program carried on. In the loop, each line gets its own small <code>with suppress(ValueError)</code>: the comment and the junk line raise inside their own block and are skipped, and the four good lines total <strong>₹225</strong>, the same as the careful generator.</p>
  <table class="tbl out"><caption>Trace of the suppress loop</caption>
    <tr><th>Line</th><th>Inside the block</th><th><code>__exit__</code> got</th><th>Returned</th><th>total</th></tr>
    <tr><td># Chai Corner…</td><td>unpack fails</td><td>ValueError</td><td>True (swallow)</td><td>0</td></tr>
    <tr><td>chai 2 × 30</td><td>ok</td><td>None</td><td>False</td><td>60</td></tr>
    <tr><td>samosa 3 × 15</td><td>ok</td><td>None</td><td>False</td><td>105</td></tr>
    <tr><td>cold coffee 1 × 90</td><td>ok</td><td>None</td><td>False</td><td>195</td></tr>
    <tr><td>till restarted</td><td>unpack fails</td><td>ValueError</td><td>True (swallow)</td><td>195</td></tr>
    <tr><td>chai 1 × 30</td><td>ok</td><td>None</td><td>False</td><td>225</td></tr>
  </table>
  <h3>Swallowing all exceptions hides bugs</h3>
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
  <div class="callout def"><span class="label">Definition</span><p>An exception raised in a <code>with</code> body is <strong>suppressed</strong> if <code>__exit__</code> returns a true value; execution continues with the first statement after the <code>with</code>. <code>contextlib.suppress(*exceptions)</code> is a ready-made manager that suppresses only the listed types.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The typo <code>totl</code> raised <code>NameError</code>, <code>SwallowAll</code> returned <code>True</code>, and the block silently stopped: total 60 instead of 195, no error anywhere. Only swallow the specific error you expect, and keep the suppressed block as small as possible (one line, not the whole loop).</p></div>

  <h2 id="pc-cm"><span class="num">05</span>@contextmanager: Generator-Based Context Managers</h2>
  <p>Writing a class with two methods, plus <code>self.</code> attributes just to carry state from enter to exit, is heavy for "do X before, Y after, even on error". A context manager needs to run setup, pause while the body runs, then resume for cleanup with its local variables kept. A generator does exactly that.</p>
  <p>A generator (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>) runs up to <code>yield</code>, pauses with its locals intact, and resumes later, and its <code>finally</code> runs even if it is closed or thrown an exception. That is exactly the shape of a context manager. <code>contextlib.contextmanager</code> is a decorator (<a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>) that turns such a generator function into a context-manager factory.</p>
  <div class="flow"><span>code before yield = __enter__</span><span>yield value → "as"</span><span>with body runs (generator paused)</span><span>finally = __exit__</span></div>
  <div class="fx" data-lang="py">from contextlib import contextmanager
import time

@contextmanager
def timer(label):
    print(f"[{label}] start")                 # = __enter__
    t0 = time.perf_counter()
    try:
        yield t0                               # the with-body runs while we are paused here
    finally:
        print(f"[{label}] took {time.perf_counter() - t0:.4f}s")   # = __exit__, always

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
[revenue] took 0.0001s
[strict parse] start
[strict parse] took 0.0000s
caller got IndexError: list index out of range</div>
  <table class="tbl out"><caption>Trace: with timer("revenue") as started</caption>
    <tr><th>Moment</th><th>Generator does</th><th>Printed</th></tr>
    <tr><td>enter</td><td>runs from the top: prints start, sets <code>t0</code>, reaches <code>yield t0</code> and pauses</td><td>[revenue] start</td></tr>
    <tr><td>body</td><td>paused; <code>started</code> = the yielded <code>t0</code></td><td>body: revenue 225 …</td></tr>
    <tr><td>exit (ok)</td><td>resumed after <code>yield</code>; <code>finally</code> prints the time; generator ends</td><td>[revenue] took …</td></tr>
    <tr><td>exit (error)</td><td>the body's <code>IndexError</code> is thrown in <em>at</em> the <code>yield</code>; <code>finally</code> still prints; the error continues</td><td>[strict parse] took …; caller got IndexError</td></tr>
  </table>
  <p>The class <code>Timer</code> took two methods and <code>self.t0</code>; the generator version is a plain function where <code>t0</code> is just a local variable kept across the pause. A file opener is four lines:</p>
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
  <h3>How @contextmanager works internally</h3>
  <p><code>@contextmanager</code> returns an object whose <code>__enter__</code> calls <code>next(gen)</code> to run to the <code>yield</code>. Its <code>__exit__</code> either calls <code>next(gen)</code> again (no error: run the rest, after which the generator must finish) or calls <code>gen.throw(exc)</code> (error: raise it at the <code>yield</code>). Here is a simplified, working version built from a generator and a decorator:</p>
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
                return False                   # same error came back out: let it propagate
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
  <p><code>my_contextmanager</code> is a decorator: it replaces <code>shift</code> with <code>helper</code>, a closure over the generator function. Calling <code>shift("Asha")</code> builds a generator and wraps it in <code>GeneratorCM</code>. <code>__enter__</code> ran the generator to its <code>yield</code> (prints "opens", hands out "till-Asha"); <code>__exit__</code> resumed it so <code>finally</code> printed "closes". For Ravi the body raised; <code>throw</code> raised the <code>ValueError</code> at the <code>yield</code>, <code>finally</code> ran, and the same error came back out, so <code>__exit__</code> returned <code>False</code> and the caller saw it. The real <code>contextlib</code> version adds edge cases (<code>StopIteration</code> raised in the body, re-use), but this is the whole idea: <strong>generator + decorator = context manager</strong>.</p>
  <h3>Commit or roll back: try/except/else around yield</h3>
  <p>Because the body's error arrives at the <code>yield</code>, the generator can react to success and failure differently by putting <code>try/except/else/finally</code> around the <code>yield</code>. Here sales are recorded into a ledger, all or nothing:</p>
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
  <p>On the clean run: BEGIN, the body appended 60, 45, 90, 30 to <code>pending</code>, the <code>else</code> branch committed them (ledger total ₹225), <code>finally</code> printed close. On the strict run the body appended three rows and then hit "till restarted"; the error arrived at the <code>yield</code>, the <code>except</code> branch printed ROLLBACK and discarded the 3 pending rows, <code>raise</code> passed the error on, and <code>finally</code> still printed close. The ledger was untouched: that is what database transactions guarantee, and why SQLAlchemy's <code>engine.begin()</code> is a context manager.</p>
  <div class="callout trap"><span class="label">Trap: yield without try/finally</span><p>The body's exception is raised <em>at</em> the <code>yield</code>. Without <code>try/finally</code>, the lines after <code>yield</code> never run:</p></div>
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
  <p>"close" is missing. This is the number-one bug with <code>@contextmanager</code>: always put cleanup in <code>finally</code>.</p>
  <h3>Using a @contextmanager object as a decorator</h3>
  <p>Objects made by <code>@contextmanager</code> are also decorators (they inherit from <code>contextlib.ContextDecorator</code>): <code>@timer("…")</code> wraps every call of a function in <code>with timer("…"):</code>.</p>
  <div class="fx" data-lang="py">@timer("nightly report")                       # a @contextmanager object also works as a decorator
def nightly_report():
    return sum(o["qty"] * o["price"] for o in read_orders("orders.log"))

print(nightly_report())</div>
  <div class="fx" data-lang="text">[nightly report] start
[nightly report] took 0.0001s
225</div>
  <div class="callout def"><span class="label">Definition</span><p><code>@contextlib.contextmanager</code> turns a generator function that yields exactly once into a factory of context managers. Code before the <code>yield</code> runs on enter, the yielded value is bound by <code>as</code>, an exception in the body is re-raised inside the generator at the <code>yield</code>, and code after it (ideally in <code>finally</code>) runs on exit. If the generator catches the exception and does not re-raise, it is suppressed.</p></div>

  <h2 id="pc-exitstack"><span class="num">06</span>ExitStack: A Run-Time Number of Resources</h2>
  <p>One <code>with</code> handles one resource, and <code>with a() as x, b() as y:</code> handles a fixed few. When the number of resources comes from a list known only at run time, you cannot write a variable number of nested <code>with</code> lines, and if the third file fails to open, the first two must still be closed.</p>
  <p><code>ExitStack</code> is a context manager that collects other context managers (and plain cleanup callbacks) at run time. Each <code>enter_context(cm)</code> enters <code>cm</code> and remembers its exit; when the <code>ExitStack</code> block ends, it runs all the exits in reverse order, exactly like nested <code>with</code>s would.</p>
  <div class="fx" data-lang="py">from contextlib import ExitStack

with open("tue.log", "w") as f:
    f.write("09:02,samosa,2,15\\n09:30,vada pav,4,20\\n")
with open("wed.log", "w") as f:
    f.write("08:55,masala chai,5,30\\n")

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
  <p>Three opens, then the work: Monday ₹225 + Tuesday (2 × 15 + 4 × 20 = 110) + Wednesday (5 × 30 = 150) = <strong>₹485</strong>. On exit the stack ran its cleanups last-in, first-out: the callback (registered last) first, then wed, tue, mon. Now a missing file:</p>
  <div class="fx" data-lang="py">try:
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
  <p><code>open_verbose("missing.log")</code> printed "open" and then <code>open()</code> raised <code>FileNotFoundError</code> before its <code>try</code>, so it had nothing to close. The stack then closed the two files it had already entered, in reverse, and the error reached the caller. No leak.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>contextlib.ExitStack</code>: a context manager holding a stack of exit callbacks. <code>enter_context(cm)</code> enters <code>cm</code> and pushes its <code>__exit__</code>; <code>callback(fn, *args)</code> pushes a plain function; <code>pop_all()</code> transfers them to a new stack (to keep resources open on success). On exit, callbacks run in reverse order and each sees any exception from the ones after it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Opening files in a list comprehension <em>without</em> an <code>ExitStack</code> (<code>files = [open(p) for p in paths]</code>) leaks every already-opened file if a later <code>open</code> fails, and needs a manual close loop otherwise.</p></div>

  <h2 id="pc-real"><span class="num">07</span>Locks, Transactions, Settings and stdlib Managers</h2>
  <p>Files are one kind of resource. Any "acquire, use, release" pair fits the same pattern, and much of the standard library already supports <code>with</code>.</p>
  <h3>Locks</h3>
  <p>Four threads record sales into one shared dict. <code>sold[...] += 1</code> is a read, an add and a write; two threads can interleave and lose a sale. A lock lets one thread at a time through, and <code>with lock:</code> guarantees it is released even if the body raises (a lock left held makes every other thread wait forever). See <a class="xref" data-note="py_concurrency">Concurrency &amp; Async</a>.</p>
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
  <p>4 threads × 10,000 = 40,000 sales, none lost, and the lock is free at the end.</p>
  <h3>Database transactions</h3>
  <p>A <code>sqlite3</code> connection is a context manager whose <code>__exit__</code> commits on success and rolls back on an exception: the built-in version of the <code>transaction</code> manager above.</p>
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
  <p>The first block committed the four orders: <code>(4, 225)</code>. The second inserted a vada pav, then raised; <code>__exit__</code> rolled back, so the table is still <code>(4, 225)</code>. Note the last line: the connection is still open. In sqlite3, <code>with conn:</code> manages the <em>transaction</em>, not the connection; close it yourself (or with <code>contextlib.closing(conn)</code>). See <a class="xref" data-note="sql_transactions">Transactions</a>.</p>
  <h3>Temporarily changing a setting</h3>
  <p>Sometimes a global setting must differ for one block only, such as a tax rate for one report. Changing a global and "remembering to change it back" fails the moment the report raises. A context manager saves the old values on enter and restores them in <code>finally</code>.</p>
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
  <p>₹225 at 5% = 236.25; inside the block, at 18% = 265.5 and currency "INR"; after the block the settings are back to the original dict. <code>mock.patch</code> in tests and <code>torch.no_grad()</code> (gradient tracking off, then back on) are the same pattern.</p>
  <h3>A few from the standard library</h3>
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
  <p><code>redirect_stdout</code> captured a print into a buffer; <code>chdir</code> (Python 3.11+) changed the working directory and restored it; <code>decimal.localcontext</code> gave 225 / 7 to 3 significant digits inside the block and full precision outside.</p>
  <table class="tbl"><caption>Common context managers and what they guarantee</caption>
    <tr><th>Context manager</th><th>Enter</th><th>Exit (always)</th></tr>
    <tr><td><code>open(path)</code></td><td>open the file</td><td>close it</td></tr>
    <tr><td><code>threading.Lock()</code></td><td>acquire</td><td>release</td></tr>
    <tr><td><code>sqlite3</code> / SQLAlchemy <code>engine.begin()</code></td><td>begin transaction</td><td>commit, or roll back on error</td></tr>
    <tr><td><code>suppress(E)</code></td><td>nothing</td><td>swallow E</td></tr>
    <tr><td><code>redirect_stdout(buf)</code>, <code>chdir(p)</code>, <code>localcontext()</code></td><td>change a global setting</td><td>restore it</td></tr>
    <tr><td><code>torch.no_grad()</code></td><td>turn gradient tracking off</td><td>turn it back on</td></tr>
    <tr><td><code>mlflow.start_run()</code></td><td>start an experiment run</td><td>end it (marked failed on error)</td></tr>
    <tr><td><code>pytest.raises(E)</code>, <code>mock.patch(...)</code></td><td>prepare check / patch</td><td>verify E was raised / unpatch</td></tr>
    <tr><td><code>tempfile.TemporaryDirectory()</code></td><td>create a directory</td><td>delete it</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>acquire/release pattern</strong> (called RAII in C++): tie a resource's release to leaving a scope, so release cannot be forgotten. In Python the scope is the <code>with</code> block.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Holding a lock (or a transaction) across slow work: everything else waits. Keep the <code>with lock:</code> block as small as possible, and never do network calls inside it.</p></div>

  <h2 id="pc-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: @contextmanager without try/finally</span>
    <p>The body's exception is raised at the <code>yield</code>, so code after it is skipped (<code>['open']</code>, no "close"). Put cleanup in <code>finally</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: __exit__ that always returns True</span>
    <p>Hides every bug in the block: a <code>NameError</code> typo silently gave a wrong total with no message. Return <code>True</code> only for specific expected types; use <code>suppress(SpecificError)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: yielding more than once, or not at all</span>
    <p>A <code>@contextmanager</code> generator must yield exactly once. Yield twice → <code>RuntimeError: generator didn't stop</code>; never yield → <code>RuntimeError: generator didn't yield</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: assuming with closes the connection</span>
    <p>sqlite3's <code>with conn:</code> commits or rolls back but leaves the connection open. Use <code>contextlib.closing(conn)</code> or close it explicitly.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a lazy generator escaping its with</span>
    <p><code>with open(p) as f: return (line for line in f)</code> closes the file before anything is read (<code>ValueError: I/O operation on closed file</code>, shown in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>). Make the function a generator that yields <em>inside</em> the <code>with</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a with-less resource list</span>
    <p><code>[open(p) for p in paths]</code> leaks the opened files when a later open fails. Use <code>ExitStack</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: big blocks under a lock or transaction</span>
    <p>Everything inside <code>with lock:</code> blocks other threads; everything inside a transaction holds database locks. Keep these blocks short.</p>
  </div>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why</h3>
  <ul>
    <li>An exception between acquire and release skips the release. Leaked handles, held locks and open transactions accumulate in long-running processes.</li>
    <li>Garbage collection is not a cleanup strategy: lingering references (lists, tracebacks, closures) keep objects alive, and other Python implementations collect later.</li>
    <li><code>try/finally</code> works but must be written at every use; <code>with</code> packages it inside the resource.</li>
  </ul>
  <h3>The with protocol</h3>
  <div class="fx" data-lang="py">with m as x:
    body
# is roughly:
x = m.__enter__()                          # __enter__/__exit__ looked up on type(m) first
try:
    body
except BaseException as e:
    if not m.__exit__(type(e), e, e.__traceback__):
        raise                              # re-raise unless __exit__ returned true
else:
    m.__exit__(None, None, None)</div>
  <ul>
    <li><code>as</code> binds what <code>__enter__</code> <em>returns</em> (file → itself, lock → <code>True</code>, a Timer → <code>self</code>).</li>
    <li><code>__exit__</code> runs on normal end, <code>return</code>, <code>break</code>, <code>continue</code> and exceptions; not if <code>__enter__</code> raised.</li>
    <li><code>__exit__</code> returns true → exception suppressed, execution continues <em>after</em> the block (rest of block skipped).</li>
    <li><code>with a() as x, b() as y:</code> ≡ nested; <code>b</code> exits before <code>a</code>.</li>
    <li>Async version: <code>async with</code> calls <code>__aenter__</code>/<code>__aexit__</code>; write with <code>@asynccontextmanager</code>.</li>
  </ul>
  <h3>@contextmanager</h3>
  <div class="fx" data-lang="py">from contextlib import contextmanager

@contextmanager
def managed(resource_args):
    r = acquire(resource_args)             # __enter__ part
    try:
        yield r                            # value for "as"; body runs here
    finally:
        release(r)                         # __exit__ part, always</div>
  <ul>
    <li>Exactly one <code>yield</code> (twice → <code>RuntimeError: generator didn't stop</code>; never → <code>generator didn't yield</code>).</li>
    <li>The body's exception is thrown in at the <code>yield</code>: use <code>except</code> to react (rollback), <code>else</code> for success-only work (commit), <code>finally</code> for cleanup. Catching without re-raising suppresses it.</li>
    <li>Internally: enter = <code>next(gen)</code>; exit = <code>next(gen)</code> or <code>gen.throw(exc)</code>. Generator + decorator.</li>
    <li>The resulting objects are single-use and also work as decorators (<code>ContextDecorator</code>).</li>
  </ul>
  <h3>contextlib toolbox</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Use</th></tr>
    <tr><td><code>contextmanager</code> / <code>asynccontextmanager</code></td><td>write a manager as a generator</td></tr>
    <tr><td><code>suppress(*excs)</code></td><td>ignore specific exceptions in a small block</td></tr>
    <tr><td><code>ExitStack</code></td><td><code>enter_context(cm)</code>, <code>callback(fn, *args)</code>, <code>pop_all()</code>; exits LIFO; for run-time lists of resources</td></tr>
    <tr><td><code>closing(obj)</code></td><td>call <code>obj.close()</code> on exit (e.g. a sqlite3 connection)</td></tr>
    <tr><td><code>nullcontext(x)</code></td><td>no-op manager for optional context (<code>with lock or nullcontext():</code>)</td></tr>
    <tr><td><code>redirect_stdout</code>, <code>chdir</code> (3.11+)</td><td>temporarily redirect output / change directory</td></tr>
    <tr><td><code>ContextDecorator</code></td><td>base class that lets a manager also be used as <code>@decorator</code></td></tr>
  </table>
  <h3>Class vs @contextmanager</h3>
  <table class="tbl">
    <tr><th></th><th>Class</th><th><code>@contextmanager</code></th></tr>
    <tr><td>Code size</td><td>two methods, state on <code>self</code></td><td>one generator, state in locals</td></tr>
    <tr><td>Results after the block</td><td>easy (<code>t.elapsed</code>)</td><td>yield a mutable object</td></tr>
    <tr><td>Reusable / reentrant</td><td>can be</td><td>single-use per call</td></tr>
    <tr><td>Exception handling</td><td>inspect <code>exc_type</code>, return True to suppress</td><td><code>try/except/else/finally</code> around <code>yield</code></td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li><code>@contextmanager</code> without <code>try/finally</code> → cleanup skipped when the body raises.</li>
    <li><code>__exit__</code> returning <code>True</code> unconditionally hides every bug (including <code>NameError</code> typos).</li>
    <li>sqlite3 <code>with conn:</code> manages the transaction, not the connection; close it separately.</li>
    <li>Returning a lazy generator from inside <code>with open</code> → reading a closed file.</li>
    <li><code>[open(p) for p in paths]</code> leaks on partial failure; use <code>ExitStack</code>.</li>
    <li>Keep <code>with lock:</code> and transaction blocks short; no network calls inside.</li>
  </ul>

  <h2 id="pc-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a context manager?</summary><div class="qa-body">An object that implements <code>__enter__</code> and <code>__exit__</code>, used with the <code>with</code> statement. <code>__enter__</code> sets up a resource and its return value is bound by <code>as</code>. <code>__exit__</code> releases the resource on every exit path from the block, including exceptions. Files, locks, DB connections and transactions are typical examples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>with open(...)</code> instead of <code>open()</code> + <code>close()</code>?</summary><div class="qa-body">An exception between open and close skips the <code>close()</code>, leaking the file handle. <code>with</code> guarantees <code>__exit__</code> (which closes the file) runs on every exit: normal end, <code>return</code>, <code>break</code> or exception. It is also shorter than the equivalent <code>try/finally</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What arguments does <code>__exit__</code> receive, and what does its return value do?</summary><div class="qa-body">The exception type, the exception instance and the traceback. All three are <code>None</code> if the block finished without an exception. Returning a truthy value suppresses the exception, and execution continues after the <code>with</code> block. Returning <code>False</code>/<code>None</code> lets the exception propagate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the <code>with</code> statement as plain Python.</summary><div class="qa-body"><code>x = m.__enter__()</code>, then <code>try:</code> body; <code>except BaseException as e:</code> <code>if not m.__exit__(type(e), e, e.__traceback__): raise</code>; <code>else: m.__exit__(None, None, None)</code>. Python looks up <code>__enter__</code> and <code>__exit__</code> on the type, before entering, and <code>__enter__</code> runs outside the <code>try</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__exit__</code> called if <code>__enter__</code> raises?</summary><div class="qa-body">No. The block never started, so there is nothing to exit. A manager whose <code>__enter__</code> acquires several things must release the earlier ones itself if a later one fails, or use an <code>ExitStack</code> internally.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a context manager that times a block, first as a class, then with <code>@contextmanager</code>.</summary><div class="qa-body"><div class="fx" data-lang="py">class Timer:
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
        print(f"{label}: {time.perf_counter() - t0:.4f}s")</div>The class form makes <code>t.elapsed</code> available after the block; the generator form is shorter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>@contextmanager</code> work internally?</summary><div class="qa-body">It is a decorator that wraps the generator function. Calling the result creates the generator inside a helper object (<code>_GeneratorContextManager</code>). <code>__enter__</code> calls <code>next(gen)</code> to run up to the <code>yield</code> and returns the yielded value. <code>__exit__</code> either calls <code>next(gen)</code> (no exception; the generator must then finish) or <code>gen.throw(exc)</code>, which raises the exception at the <code>yield</code> so the generator's <code>except</code>/<code>finally</code> runs. If the generator swallows it, the exception is suppressed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes wrong if you write a <code>@contextmanager</code> without <code>try/finally</code> around <code>yield</code>?</summary><div class="qa-body">When the body raises, the exception is thrown into the generator at the <code>yield</code>. Without a <code>try</code> it propagates straight out, and the cleanup code after <code>yield</code> never runs, which is exactly the leak the context manager was meant to prevent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you implement a transaction context manager that commits on success and rolls back on error?</summary><div class="qa-body"><div class="fx" data-lang="py">@contextmanager
def transaction(conn):
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise                              # don't hide the error
    else:
        conn.commit()</div>The body's exception arrives at the <code>yield</code>, so <code>except</code> handles the failure and <code>else</code> runs only on success. <code>sqlite3</code> connections and SQLAlchemy's <code>engine.begin()</code> provide this built in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is it appropriate for a context manager to suppress an exception?</summary><div class="qa-body">Only for a specific, expected and harmless exception, for example <code>contextlib.suppress(FileNotFoundError)</code> around deleting a file that may not exist. Check the type and keep the block tiny. A manager that returns <code>True</code> for everything hides real bugs, even a <code>NameError</code> from a typo.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you open a variable number of files safely?</summary><div class="qa-body">Use <code>contextlib.ExitStack</code>: <code>with ExitStack() as stack: files = [stack.enter_context(open(p)) for p in paths]</code>. All files are closed in reverse order on exit, and if opening one fails, the ones already opened are still closed. A plain list comprehension of <code>open()</code> calls leaks on partial failure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>with lock:</code> give you over <code>lock.acquire()</code>/<code>lock.release()</code>?</summary><div class="qa-body">The lock is released even if the body raises. A lock left held after an exception blocks every other thread waiting for it, effectively a deadlock. It is also clearer about the extent of the critical section, which should be kept as small as possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does <code>with sqlite3.connect(path) as conn:</code> close the connection?</summary><div class="qa-body">No. A sqlite3 connection's context manager commits on success and rolls back on an exception, but leaves the connection open. Close it explicitly or wrap it: <code>with contextlib.closing(sqlite3.connect(path)) as conn:</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>contextlib.nullcontext</code> for?</summary><div class="qa-body">A context manager that does nothing (optionally returning a given value from <code>__enter__</code>). It lets you write one code path when a context is optional: <code>with (lock if lock else nullcontext()):</code> or <code>with open(p) if p else nullcontext(sys.stdout) as f:</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do asynchronous context managers differ?</summary><div class="qa-body">They implement <code>__aenter__</code> and <code>__aexit__</code> as coroutines and are used with <code>async with</code> inside <code>async def</code>, so setup and cleanup can <code>await</code> I/O, as with HTTP sessions, DB connections and async locks. <code>contextlib.asynccontextmanager</code> builds one from an async generator, mirroring <code>@contextmanager</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Decorator or context manager: when do you use which?</summary><div class="qa-body">Use a decorator when the behaviour wraps an entire function call every time. Use a context manager when it wraps a block within a function, needs to give the block a value (<code>as f</code>), or must release a resource. Managers built with <code>@contextmanager</code> (or subclassing <code>ContextDecorator</code>) can be used as both, for example <code>@timer("x")</code> and <code>with timer("x"):</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>torch.no_grad()</code> do as a context manager, and why a context manager?</summary><div class="qa-body">On enter it disables gradient tracking (saving memory and compute during inference). On exit it restores the previous setting, even if the block raises. That is the "temporarily change a global setting and always restore it" pattern, the same as <code>mock.patch</code>, <code>decimal.localcontext</code> or <code>redirect_stdout</code>. It can also be used as a decorator on an inference function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Class-based or <code>@contextmanager</code>: how do you choose?</summary><div class="qa-body">Use <code>@contextmanager</code> for most cases: setup, <code>yield</code>, cleanup in <code>finally</code>, with state in local variables. Use a class when the manager needs to expose results or methods after the block (<code>t.elapsed</code>), must be reusable or reentrant (generator-based managers are single-use), or has complex state.</div></details>
</main>
`
});
